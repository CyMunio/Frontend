document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-img');
    const uploadPic = document.getElementById('upload-pic');
    const connectWalletButton = document.getElementById('connectWalletBtn');
    const uploadForm = document.getElementById('uploadForm');
    const statusElement = document.getElementById('status');
    const registerBtn = document.getElementById('register-btn');
    const loginSubmit = document.getElementById('login-btn-submit');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('registerUsername');
    const passwordInput = document.getElementById('registerPassword');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
    });

    const restrictedWalletAddress = 'E1uqzciYEDoanN4mnDGqfRzdztq0rMnHsvOb5fUYys0'; // Wallet address to restrict

    // Generate a random salt
    function generateSalt() {
        return CryptoJS.lib.WordArray.random(16).toString();
    }

    // Derive a secure key using PBKDF2
    function deriveKey(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32, // 256-bit key
            iterations: 10000 // High number of iterations for better security
        }).toString();
    }

    // AES Encryption function using derived key
    function encryptData(data, derivedKey) {
        return CryptoJS.AES.encrypt(data, derivedKey).toString();
    }

    // AES Decryption function using derived key
    function decryptData(cipherText, derivedKey) {
        const bytes = CryptoJS.AES.decrypt(cipherText, derivedKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    async function ensureWalletConnected() {
        if (window.arweaveWallet) {
            try {
                const requiredPermissions = ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH'];
                const permissions = await window.arweaveWallet.getPermissions();
                const missingPermissions = requiredPermissions.filter(permission => !permissions.includes(permission));
                if (missingPermissions.length > 0) {
                    await window.arweaveWallet.connect(requiredPermissions);
                }

                // Verify the connected wallet address
                const walletAddress = await window.arweaveWallet.getActiveAddress();
                if (walletAddress === restrictedWalletAddress) {
                    alert('This wallet address is restricted from accessing the dashboard.');
                    throw new Error('Restricted wallet address.');
                }
            } catch (error) {
                console.error('Error connecting to Arweave wallet:', error);
                alert('Error connecting to Arweave wallet. Please try again.');
                throw error;
            }
        } else {
            alert('ArConnect wallet not found. Please install the ArConnect extension.');
            throw new Error('ArConnect wallet not found.');
        }
    }

    async function connectSignAndRegister(fullName, email, username, password) {
        try {
            await ensureWalletConnected();

            // Generate a unique salt for the user
            const salt = generateSalt();

            // Derive a secure encryption key from the password and salt
            const derivedKey = deriveKey(password, salt);

            // Encrypt user data using the derived key
            const encryptedFullName = encryptData(fullName.trim(), derivedKey);
            const encryptedEmail = encryptData(email.trim(), derivedKey);
            const encryptedPassword = encryptData(password.trim(), derivedKey);

            const data = JSON.stringify({
                fullName: encryptedFullName,
                email: encryptedEmail,
                username: username.trim(),
                password: encryptedPassword,
                salt: salt // Store the salt alongside the encrypted data
            });

            const transaction = await arweave.createTransaction({ data });
            console.log('Created transaction:', transaction);

            transaction.addTag('Content-Type', 'application/json');
            transaction.addTag('App-Name', 'Arweave-Auth');
            transaction.addTag('Username', username.trim());

            await signTransaction(transaction);

            // Dispatch the transaction using ArConnect
            await window.arweaveWallet.dispatch(transaction);
            console.log('Transaction dispatched:', transaction);

            alert('Registration successful!');

        } catch (error) {
            console.error('Error during registration:', error);
            statusElement.textContent = 'Error during registration. Check console for details.';
        }
    }

    async function signTransaction(transaction) {
        try {
            console.log('Transaction before signing:', transaction);
            await arweave.transactions.sign(transaction);
            if (!transaction.signature || transaction.signature.length === 0) {
                throw new Error('Transaction was not signed successfully.');
            }
            console.log('Transaction successfully signed:', transaction);
        } catch (error) {
            console.error('Error signing transaction:', error);
            alert('Failed to sign the transaction. Please ensure your wallet is connected and permissions are granted.');
            throw error;
        }
    }

    // Check if elements exist before adding event listeners
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', async () => {
            try {
                await ensureWalletConnected();
                uploadForm.style.display = 'block';
                connectWalletButton.style.display = 'none';
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                alert('Failed to connect wallet. Check the console for more details.');
            }
        });
    }

    if (registerBtn && fullNameInput && emailInput && usernameInput && passwordInput) {
        registerBtn.addEventListener('click', async () => {
            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (fullName === '' || email === '' || username === '' || password === '') {
                statusElement.textContent = 'Please fill all required fields.';
                return;
            }
            await connectSignAndRegister(fullName, email, username, password);
        });
    }

    if (loginSubmit && loginUsernameInput && loginPasswordInput) {
        loginSubmit.addEventListener('click', async () => {
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value.trim();

            if (username === '' || password === '') {
                statusElement.textContent = 'Please fill in both fields.';
                return;
            }

            try {
                await ensureWalletConnected();

                const query = {
                    op: 'and',
                    expr1: {
                        op: 'equals',
                        expr1: 'App-Name',
                        expr2: 'Arweave-Auth',
                    },
                    expr2: {
                        op: 'equals',
                        expr1: 'Username',
                        expr2: username,
                    },
                };

                const transactions = await arweave.arql(query);

                if (transactions.length === 0) {
                    statusElement.textContent = 'User not found.';
                    return;
                }

                const transactionId = transactions[0];
                const transactionData = await arweave.transactions.getData(transactionId, { decode: true, string: true });
                const userData = JSON.parse(transactionData);

                // Retrieve the salt from stored data
                const salt = userData.salt;

                // Derive the key using the entered password and the retrieved salt
                const derivedKey = deriveKey(password, salt);

                // Decrypt the stored password
                const decryptedPassword = decryptData(userData.password, derivedKey);

                if (decryptedPassword === password) {
                    // Store the logged-in username in localStorage or session
                    localStorage.setItem('loggedInUser', username);
                    window.location.href = `/profile.html?username=${encodeURIComponent(username)}`;
                } else {
                    statusElement.textContent = 'Incorrect password.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                statusElement.textContent = 'Error during login. Check console for details.';
            }
        });
    }

    // Profile page script
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        // Load the saved profile picture
        const savedPic = localStorage.getItem(`profilePic_${loggedInUser}`);
        if (savedPic) {
            profileImg.src = savedPic;
        }

        // Handle profile picture upload
        if (uploadPic) {
            uploadPic.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        // Update the profile image
                        profileImg.src = e.target.result;

                        // Save the new profile image to localStorage with the user ID
                        localStorage.setItem(`profilePic_${loggedInUser}`, e.target.result);
                    };

                    reader.readAsDataURL(file);
                }
            });
        }
    }
});

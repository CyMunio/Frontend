document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const connectWalletButton = document.getElementById('connectWalletBtn');
    const uploadForm = document.getElementById('uploadForm');
    const csvFileInput = document.getElementById('csvFileInput');
    const statusElement = document.getElementById('status');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const usernameInput = document.getElementById('registerUsername');
    const passwordInput = document.getElementById('registerPassword');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');

    // Function to hash passwords
    function hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }

    // Function to ensure wallet is connected
    async function ensureWalletConnected() {
        if (window.arweaveWallet) {
            try {
                const permissions = await window.arweaveWallet.getPermissions();
                if (!permissions.includes('ACCESS_ADDRESS') || !permissions.includes('SIGN_TRANSACTION')) {
                    await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
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

    // Function to sign the transaction with Arweave Wallet
    async function signTransaction(transaction) {
        try {
            await window.arweaveWallet.sign(transaction);
            // Optional: Add a check to confirm that the transaction is signed
            if (!transaction.signature) {
                throw new Error('Transaction was not signed successfully.');
            }
        } catch (error) {
            console.error('Error signing transaction:', error);
            alert('Failed to sign the transaction. Please ensure your wallet is connected.');
            throw error;
        }
    }

    // Function to connect wallet, sign transaction, and register
    async function connectSignAndRegister(username, password) {
        try {
            await ensureWalletConnected();

            const arweave = Arweave.init();
            const hashedPassword = hashPassword(password);

            const transaction = await arweave.createTransaction({
                data: JSON.stringify({ username, password: hashedPassword }),
            });

            transaction.addTag('Content-Type', 'application/json');
            transaction.addTag('App-Name', 'Arweave-Auth');
            transaction.addTag('Username', username);

            // Sign the transaction
            await signTransaction(transaction);

            // Post the transaction
            const response = await arweave.transactions.post(transaction);

            if (response.status === 200) {
                alert('Registration successful!');
                window.location.href = '/profile.html'; // Redirect to user profile page
            } else {
                statusElement.textContent = 'Failed to register.';
            }
        } catch (error) {
            console.error('Error during registration:', error);
            statusElement.textContent = 'Error during registration. Check console for details.';
        }
    }

    // Handle Wallet Connection
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

    // Handle Registration
    if (registerBtn && usernameInput && passwordInput) {
        registerBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === '' || password === '') {
                statusElement.textContent = 'Please fill in both fields.';
                return;
            }

            connectSignAndRegister(username, password);
        });
    }
// Form Switcher Functionality
if (loginBtn && signupBtn && loginForm && signupForm) {
    loginBtn.addEventListener('click', () => {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    });

    signupBtn.addEventListener('click', () => {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
    });
}
    // Handle Login
    if (loginBtn && loginUsernameInput && loginPasswordInput) {
        loginBtn.addEventListener('click', async () => {
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value.trim();

            if (username === '' || password === '') {
                statusElement.textContent = 'Please fill in both fields.';
                return;
            }

            const hashedPassword = hashPassword(password);

            try {
                await ensureWalletConnected();

                const arweave = Arweave.init();
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

                if (userData.password === hashedPassword) {
                    alert(`Login successful! Welcome, ${username}`);
                    window.location.href = '/profile.html'; // Redirect to user profile page
                } else {
                    statusElement.textContent = 'Incorrect password.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                statusElement.textContent = 'Error during login. Check console for details.';
            }
        });
    }
});

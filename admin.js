document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.querySelector('#user-table tbody');
    const adminWalletAddress = 'E1uqzciYEDoanN4mnDGqfRzdztq0rMnHsvOb5fUYys0'; // Replace with the actual admin wallet address

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
    });

    // Fetch all users registered on the CyMunio platform
    async function fetchUsers() {
        const query = {
            op: 'equals',
            expr1: 'App-Name',
            expr2: 'Arweave-Auth',
        };

        try {
            const transactions = await arweave.arql(query);

            // Loop through transactions and fetch user data
            for (const transactionId of transactions) {
                try {
                    const transactionData = await arweave.transactions.getData(transactionId, {
                        decode: true,
                        string: true
                    });
                    const userData = JSON.parse(transactionData);

                    // Decrypt the user data using stored salt and derived key
                    const decryptedData = decryptUserData(userData);

                    // Populate the table with user data
                    addUserToTable(decryptedData, transactionId);
                } catch (error) {
                    console.error(`Error fetching data for transaction ID ${transactionId}:`, error);
                    continue; // Continue to the next transaction if there's an error
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Derive a key for decryption using CryptoJS
    function deriveKey(password, salt) {
        return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
            keySize: 256 / 32,
            iterations: 1000,
        }).toString();
    }

    // Decrypt user data
    function decryptUserData(userData) {
        const { fullName, email, password, salt } = userData;

        // Derive the key (Admin should have the decryption key securely managed)
        const derivedKey = deriveKey('admin_secret_key', salt);  // Replace 'admin_secret_key' with an actual key management strategy

        const decryptedFullName = decryptData(fullName, derivedKey);
        const decryptedEmail = decryptData(email, derivedKey);
        const decryptedPassword = decryptData(password, derivedKey);

        return {
            fullName: decryptedFullName,
            email: decryptedEmail,
            username: userData.username,
            password: decryptedPassword,
            status: userData.status || 'Active' // Default status is 'Active'
        };
    }

    // Decrypt encrypted data using CryptoJS AES
    function decryptData(encryptedData, derivedKey) {
        const bytes = CryptoJS.AES.decrypt(encryptedData, derivedKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // Add user to the table
    function addUserToTable(user, transactionId) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.status}</td>
            <td>
                ${user.status === 'Active' ? 
                    `<button class="suspend-btn" data-transaction-id="${transactionId}">Suspend</button>` :
                    `<button class="activate-btn" data-transaction-id="${transactionId}">Activate</button>`
                }
            </td>
        `;
        userTableBody.appendChild(tr);

        // Add suspend/activate button event listeners
        const suspendButton = tr.querySelector('.suspend-btn');
        const activateButton = tr.querySelector('.activate-btn');

        if (suspendButton) {
            suspendButton.addEventListener('click', () => suspendAccount(transactionId));
        }
        
        if (activateButton) {
            activateButton.addEventListener('click', () => activateAccount(transactionId));
        }
    }

    // Function to suspend a user account
    async function suspendAccount(transactionId) {
        try {
            await ensureWalletConnected(); // Ensure the admin wallet is connected

            // Fetch the original transaction data
            const transactionData = await arweave.transactions.getData(transactionId, {
                decode: true,
                string: true
            });
            const userData = JSON.parse(transactionData);

            // Mark the account as suspended
            userData.status = 'Suspended';

            // Create a new transaction with the updated status
            const newTransaction = await arweave.createTransaction({
                data: JSON.stringify(userData)
            });

            newTransaction.addTag('Content-Type', 'application/json');
            newTransaction.addTag('App-Name', 'Arweave-Auth');
            newTransaction.addTag('Username', userData.username);

            // Sign and dispatch the transaction to update the status on the blockchain
            await signTransaction(newTransaction);
            await window.arweaveWallet.dispatch(newTransaction);
            
            alert('User account suspended successfully!');
            location.reload(); // Reload the page to reflect changes

        } catch (error) {
            console.error('Error suspending account:', error);
            alert('Error suspending account. Check console for details.');
        }
    }

    // Function to activate a suspended user account
    async function activateAccount(transactionId) {
        try {
            await ensureWalletConnected(); // Ensure the admin wallet is connected

            // Fetch the original transaction data
            const transactionData = await arweave.transactions.getData(transactionId, {
                decode: true,
                string: true
            });
            const userData = JSON.parse(transactionData);

            // Mark the account as active
            userData.status = 'Active';

            // Create a new transaction with the updated status
            const newTransaction = await arweave.createTransaction({
                data: JSON.stringify(userData)
            });

            newTransaction.addTag('Content-Type', 'application/json');
            newTransaction.addTag('App-Name', 'Arweave-Auth');
            newTransaction.addTag('Username', userData.username);

            // Sign and dispatch the transaction to update the status on the blockchain
            await signTransaction(newTransaction);
            await window.arweaveWallet.dispatch(newTransaction);
            
            alert('User account activated successfully!');
            location.reload(); // Reload the page to reflect changes

        } catch (error) {
            console.error('Error activating account:', error);
            alert('Error activating account. Check console for details.');
        }
    }

    // Ensure ArConnect wallet is connected and matches the admin wallet address
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
                if (walletAddress !== adminWalletAddress) {
                    alert('Unauthorized wallet address. Access denied.');
                    throw new Error('Unauthorized wallet address.');
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

    // Sign a transaction with Arweave wallet
    async function signTransaction(transaction) {
        try {
            await arweave.transactions.sign(transaction);
            console.log('transaction', transaction);
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }

    // Fetch all users when the admin dashboard is loaded
    fetchUsers();
});

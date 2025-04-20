// Ensure MetaMask is available
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed');
} else {
    alert('Please install MetaMask to use this feature.');
}

// Connect to Ethereum provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

// Function to request wallet connection
async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        signer = provider.getSigner();
        console.log('Wallet connected');
    } catch (error) {
        console.error('User denied account access:', error);
    }
}

// Call the connectWallet function on page load to auto-connect if possible
connectWallet();

// Handle the transfer form submission
document.getElementById('transfer-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get values from the form
    const recipientAddress = document.getElementById('recipient-address').value;
    const amount = document.getElementById('token-amount').value;

    // Validate input
    if (!ethers.utils.isAddress(recipientAddress)) {
        alert('Invalid address format.');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    // Start the transaction process
    try {
        const tx = await sendTokens(recipientAddress, amount);
        document.getElementById('transaction-status').textContent = `Transaction successful! Tx Hash: ${tx.hash}`;
    } catch (error) {
        document.getElementById('transaction-status').textContent = 'Transaction failed!';
        console.error('Transaction failed:', error);
    }
});

// Function to send tokens to the recipient address
async function sendTokens(address, amount) {
    const tokenContractAddress = 'YOUR_TOKEN_CONTRACT_ADDRESS'; // Replace with your token contract address
    const tokenABI = [
        "function transfer(address recipient, uint256 amount) public returns (bool)"
    ];

    const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, signer);

    // Convert amount to the correct number of decimals (assuming 18 decimals for ERC-20 tokens)
    const amountInWei = ethers.utils.parseUnits(amount, 18);

    // Send transaction
    const tx = await tokenContract.transfer(address, amountInWei);
    console.log('Transaction sent:', tx);
    return tx;
}

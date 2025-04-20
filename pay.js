// blockchain-pay.js

async function sendEthPayment() {
    const status = document.getElementById("status");
    const recipient = document.getElementById("recipient").value.trim();
    const ethAmount = document.getElementById("amount").value.trim();
  
    if (!recipient || !ethAmount) {
      status.textContent = "⚠️ Please enter a valid address and amount.";
      return;
    }
  
    if (!window.ethereum) {
      alert("🦊 MetaMask is not installed!");
      return;
    }
  
    try {
      // Ask MetaMask to connect wallet
      await ethereum.request({ method: 'eth_requestAccounts' });
  
      // Set up provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Send ETH transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(ethAmount)
      });
  
      // Show confirmation
      status.innerHTML = `
        ✅ Transaction Sent!<br>
        <a href="https://etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash}</a>
      `;
    } catch (err) {
      console.error("Transaction error:", err);
      status.textContent = `❌ Error: ${err.message}`;
    }
  }
  
  // Optional: Autofill scanned data from query params (QR scan redirect)
  window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    const amount = params.get("amount");
  
    if (to) document.getElementById("recipient").value = to;
    if (amount) document.getElementById("amount").value = amount;
  };
  
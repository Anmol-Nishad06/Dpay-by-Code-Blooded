

  document.addEventListener("DOMContentLoaded", function () {
    let htmlScanner;
    const scannerContainer = document.getElementById("my-qr-reader");
    const startBtn = document.getElementById("start-scan-btn");
    const scanResult = document.getElementById("scan-result");

    function onScanSuccess(decodedText) {
      stopScanner();

      try {
        const data = JSON.parse(decodedText);
        if (data.to && data.amount && data.token) {
          showPaymentForm(data.to, data.amount, data.token);
        } else {
          alert("Invalid QR format.");
        }
      } catch (e) {
        // Fallback: just a wallet address
        showPaymentForm(decodedText, "", "ETH");
      }
    }

    function renderScanner() {
      scannerContainer.innerHTML = "";
      scanResult.innerHTML = "";
      scanResult.style.display = "none";

      htmlScanner = new Html5QrcodeScanner("my-qr-reader", {
        fps: 10,
        qrbox: 250
      });

      htmlScanner.render(onScanSuccess);

      const stopBtn = document.createElement("button");
      stopBtn.innerText = "Stop Scanning";
      stopBtn.className = "primary-btn";
      stopBtn.style.marginTop = "1rem";
      stopBtn.onclick = stopScanner;
      scannerContainer.appendChild(stopBtn);
    }

    function stopScanner() {
      if (htmlScanner) {
        htmlScanner.clear().then(() => {
          scannerContainer.innerHTML = "";
        }).catch(console.error);
      }
    }

    function showPaymentForm(to, amount, token) {
      scanResult.innerHTML = `
        <h3>Confirm Payment</h3>
        <label>To:</label>
        <input type="text" id="recipient" value="${to}" readonly><br>
        <label>Amount:</label>
        <input type="text" id="amount" value="${amount || ''}" placeholder="e.g. 0.01"><br>
        <label>Token:</label>
        <input type="text" id="token" value="${token}" readonly><br>
        <button onclick="sendEthPayment()" class="primary-btn">Send Payment</button>
        <div id="status" style="margin-top:10px;"></div>
      `;
      scanResult.style.display = "block";
    }

    startBtn.addEventListener("click", renderScanner);
  });

  async function sendEthPayment() {
    const status = document.getElementById("status");
    const recipient = document.getElementById("recipient").value.trim();
    const ethAmount = document.getElementById("amount").value.trim();

    if (!recipient || !ethAmount) {
      status.textContent = "⚠️ Enter a valid address and amount.";
      return;
    }

    if (!window.ethereum) {
      alert("🦊 MetaMask is not installed!");
      return;
    }

    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(ethAmount)
      });

      status.innerHTML = `
        ✅ Transaction Sent!<br>
        <a href="https://etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash}</a>
      `;
    } catch (err) {
      console.error(err);
      status.textContent = `❌ Error: ${err.message}`;
    }
  }


async function updateWalletStatus(provider) {
    const accounts = await provider.listAccounts();
    const statusEl = document.getElementById("wallet-status");
  
    if (accounts.length > 0) {
      statusEl.textContent = "🟢 Wallet Connected";
      statusEl.className = "connected";
    } else {
      statusEl.textContent = "🔴 Wallet Not Connected";
      statusEl.className = "disconnected";
    }
  }
  
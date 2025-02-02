import React from 'https://unpkg.com/react@18/umd/react.production.min.js';
import ReactDOM from 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
import * as hl from 'https://unpkg.com/@nktkas/hyperliquid@latest';
import { createWalletClient, custom } from 'https://unpkg.com/viem@latest';

function BuilderFeeApproval() {
  const [walletStatus, setWalletStatus] = React.useState('Not Connected');
  const [walletAddress, setWalletAddress] = React.useState('');
  const [responseMessage, setResponseMessage] = React.useState('');
  const [responseType, setResponseType] = React.useState('');
  const [walletClient, setWalletClient] = React.useState(null);

  React.useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setWalletStatus('MetaMask Not Detected');
        return;
      }

      const [account] = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      const client = createWalletClient({
        account,
        transport: custom(window.ethereum)
      });

      setWalletClient(client);
      setWalletStatus('Connected');
      setWalletAddress(account);
      setResponseMessage('');
      setResponseType('');

    } catch (error) {
      setWalletStatus('Connection Failed');
      setResponseMessage(error.message);
      setResponseType('error');
    }
  }

  async function approveBuilderFee() {
    try {
      const transport = new hl.HttpTransport();

      const hlClient = new hl.WalletClient({ 
        transport, 
        wallet: walletClient 
      });

      const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
      const maxFeeRate = "0.1%";

      const response = await hlClient.approveBuilderFee({
        builder: builderAddress,
        maxFeeRate: maxFeeRate
      });

      setResponseMessage('Builder Fee Approved Successfully! 🎉');
      setResponseType('success');
      console.log("Builder fee approved:", response);

    } catch (error) {
      setResponseMessage(`Approval Failed: ${error.message}`);
      setResponseType('error');
      console.error("Failed to approve builder fee:", error);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Hyperliquid Builder Fee Approval</h1>
        <p>Approve a builder to optimize your trading experience</p>
      </div>

      <div className={`status-box ${walletStatus === 'Connected' ? 'success' : 'warning'}`}>
        <div className="wallet-icon">
          {walletStatus === 'Connected' ? '🟢' : '🔴'}
        </div>
        <div className="wallet-details">
          <p>Wallet Status: {walletStatus}</p>
          {walletAddress && (
            <p className="truncate-address">
              Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>
      </div>
      
      <button 
        className="approve-btn" 
        onClick={approveBuilderFee}
        disabled={walletStatus !== 'Connected'}
      >
        <span className="btn-text">Approve Builder Fee</span>
        <span className="btn-subtext">0.1% Max Fee Rate</span>
      </button>
      
      {responseMessage && (
        <div 
          className={`message-box ${responseType === 'success' ? 'success-message' : 'error-message'} animate-slide-in`}
        >
          {responseMessage}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BuilderFeeApproval />);

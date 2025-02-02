// Get dependencies from window object
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;
// viem is loaded as 'window.viem'
const { createWalletClient, custom } = window.viem;
const hl = window.hyperliquid;



function BuilderFeeApproval() {
    const [walletStatus, setWalletStatus] = useState('Not Connected');
    const [walletAddress, setWalletAddress] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [responseType, setResponseType] = useState('');
    const [walletClient, setWalletClient] = useState(null);
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        connectWallet();
        checkChain();
    }, []);

    const checkChain = async () => {
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
        } catch (switchError) {
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

            const client = createWalletClient({
                account,
                transport: custom(window.ethereum)
            });

            setWalletClient(client);
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
            setResponseMessage(`Approval Failed: ${error.message}`);
            setResponseType('error');
            console.error("Failed to approve builder fee:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-2">
                        $TRUST
                    </h1>
                    <p className="text-gray-400">by DegenApeTrader (DAT)</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
                    {chainId !== '0xa4b1' && (
                        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                            <div className="flex items-center justify-center text-yellow-500">
                                <span className="mr-2">🦍</span>
                                <span className="ml-2">Please switch to Arbitrum</span>
                                <button 
                                    onClick={handleChainSwitch}
                                    className="ml-2 text-yellow-400 hover:text-yellow-300 underline"
                                >
                                    Switch Network
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-center p-4 bg-gray-900/50 rounded-lg mb-6">
                        <div className="text-center">
                            <p className="text-gray-300 text-lg font-medium flex items-center justify-center">
                                <span className={`h-2 w-2 rounded-full ${walletStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2`}></span>
                                {walletStatus}
                            </p>
                            {walletAddress && (
                                <p className="text-gray-500 text-sm mt-1">
                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={approveBuilderFee}
                        disabled={walletStatus !== 'Connected' || chainId !== '0xa4b1'}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 
                                 disabled:bg-gray-700
                                 text-black font-bold py-4 px-6 rounded-lg
                                 transition-all duration-200 ease-in-out
                                 disabled:cursor-not-allowed disabled:text-gray-500
                                 flex items-center justify-center gap-2"
                    >
                        <span>Approve Builder Fee</span>
                        <span className="text-xs opacity-75">(0.1% Max)</span>
                    </button>

                    {responseMessage && (
                        <div className={`mt-4 p-4 rounded-lg transition-all duration-300 text-center
                          ${responseType === 'success' 
                            ? 'bg-green-900/30 border border-green-700/50 text-green-400' 
                            : 'bg-red-900/30 border border-red-700/50 text-red-400'}`}>
                            <div className="flex items-center justify-center gap-2">
                                {responseType === 'success' ? '🦍' : '⚠️'}
                                <p className="text-sm">{responseMessage}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm text-gray-500">
                            <a href="https://x.com/trustme_bros" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 flex items-center gap-1">
                                Twitter <span className="text-xs">↗️</span>
                            </a>
                            <a href="https://trustmebros.fun/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 flex items-center gap-1">
                                Website <span className="text-xs">↗️</span>
                            </a>
                            <a href="https://t.me/trustmebrosfun" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 flex items-center gap-1">
                                Telegram <span className="text-xs">↗️</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const root = createRoot(document.getElementById('root'));
    root.render(<BuilderFeeApproval />);
});

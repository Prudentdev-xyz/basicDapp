import { useEffect, useState } from "react";
import "./App.css";
import EIP6963 from "./EIP6963";

// Supported chains: decimal chain ID -> name
const SUPPORTED_CHAINS = {
  11155111: "Sepolia",
  84532: "Base Sepolia",
  1: "Ethereum Mainnet",
};

// The chain we ask users to switch to when they're on an unsupported one
const DEFAULT_CHAIN_ID = 11155111;

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");

  // True when a wallet is connected but on a chain not in our list
  const isUnsupported = account !== "" && !SUPPORTED_CHAINS[chainId];

  // ---------- Assignment 1: listen for account and chain changes ----------
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts) => {
      console.log("Accounts changed!", accounts);

      if (accounts.length === 0) {
        // User disconnected the site from inside the wallet
        setProvider(null);
        setAccount("");
        setChainId(0);
        setBalance(0);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (newChainId) => {
      console.log("Chain changed!", parseInt(newChainId, 16));
      setChainId(parseInt(newChainId, 16));
      setError("");
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    // Remove old listeners when the provider changes, so they don't stack up
    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider]);

  // ---------- Balance: refetch whenever account or chain changes ----------
  useEffect(() => {
    if (!provider || !account) return;

    async function getBalance() {
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      // Balance comes back as hex wei; convert to ETH
      setBalance(Number(BigInt(balance)) / 1e18);
    }

    getBalance();
  }, [provider, account, chainId]);

  // ---------- Assignment 2: switch to a supported chain ----------
  async function switchChain(targetChainId = DEFAULT_CHAIN_ID) {
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + targetChainId.toString(16) }],
      });
      // On success the wallet fires "chainChanged", which updates chainId above
    } catch (error) {
      if (error.code === 4001) {
        setError("You rejected the network switch. Please switch to a supported chain.");
      } else {
        setError(error.message);
      }
    }
  }

  // When an unsupported chain is detected, the error shows first (this effect
  // runs after the screen updates), then the wallet's switch prompt opens
  useEffect(() => {
    if (isUnsupported) {
      switchChain(DEFAULT_CHAIN_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnsupported, chainId]);

  // ---------- Assignment 2: disconnect ----------
  async function disconnect() {
    try {
      // Makes the wallet forget this site, so the next connect asks for approval again.
      // Not every wallet supports this, so we still clear our state if it fails.
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      console.log("Wallet could not revoke permissions:", error);
    }

    setProvider(null);
    setAccount("");
    setChainId(0);
    setBalance(0);
    setError("");
  }

  return (
    <div>
      {!account && (
        <EIP6963
          setProvider={setProvider}
          setAccount={setAccount}
          setChainId={setChainId}
        />
      )}

      {account && (
        <div>
          <h2>Connection Established</h2>

          <p>Account: {account}</p>
          <p>
            ChainId: {chainId} ({SUPPORTED_CHAINS[chainId] ?? "Unsupported chain"})
          </p>
          <p>Balance: {balance.toFixed(4)} ETH</p>

          {isUnsupported && (
            <div style={{ border: "1px solid red", padding: "10px" }}>
              <p style={{ color: "red" }}>
                Unsupported chain: Chain ID {chainId} is not supported. Please
                switch to a supported chain.
              </p>

              {Object.entries(SUPPORTED_CHAINS).map(([id, name]) => (
                <button key={id} onClick={() => switchChain(Number(id))}>
                  Switch to {name}
                </button>
              ))}
            </div>
          )}

          {error && !isUnsupported && <p style={{ color: "red" }}>{error}</p>}
          {error && isUnsupported && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default App;
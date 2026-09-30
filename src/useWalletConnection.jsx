import React from 'react'
import {useState, useEffcet, useCallback, useMemo} from 'react';
import {ethers, BrowserProvider, jsonRpcProvide} from 'ethers';

 function useWalletConnection() {
    const  [account, setAccount] = useState("");
    const [chainId, setChainId] = useState(0);
    const [provider, setProvider] = useState(0);
    const [signer, setSigner] = useState(0);
    const [balance, setBalance]= useState(0);

    const connectWallet = () => {};
    const disconnectWallet = () => {};
    const handlAccountsChanged = () => {};
    const handleChainChanged = () => {};
    const getBalance = ()=> {};

    useEffect  (() => {
        const init = async () => {
            let broswserProvider;

            window.dispatchEvent(new Event('eip6963:requestProvider'));
        }

 });


     

  return (
    <div>useWalletConnection</div>
  )
}

export default useWalletConnection;

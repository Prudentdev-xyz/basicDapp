import { useEffect, useState } from "react";

const Eip6963 = ({ setProvider, setAccount, setChainId }) => {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const handleAnnounce = (event) => {
      console.log("Provider: ", event.detail);

      // Only add a wallet if it isn't already in the list (prevents duplicates)
      setProviders((providers) =>
        providers.some((p) => p.info.uuid === event.detail.info.uuid)
          ? providers
          : [...providers, event.detail]
      );
    };

    // Listen first, then request, so no wallet announcement is missed
    window.addEventListener("eip6963:announceProvider", handleAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Remove the listener when the component unmounts
    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce);
    };
  }, []);

  const handleConnectWallet = async (provider) => {
    console.log(provider);
    try {
      if (provider) {
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });

        const chainId = await provider.request({ method: "eth_chainId" });

        // Send everything up to App so App can display it and listen for changes
        setProvider(provider);
        setAccount(accounts[0]);
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {providers.map((provider) => (
        <div key={provider.info.uuid} style={{ display: "flex", gap: "10px" }}>
          <img
            src={provider.info.icon}
            alt={provider.info.name}
            width={50}
            height={50}
          />
          <p>{provider.info.name}</p>
          <button onClick={() => handleConnectWallet(provider.provider)}>
            connect {provider.info.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Eip6963;
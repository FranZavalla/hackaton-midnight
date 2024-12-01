import {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
} from "@midnight-ntwrk/dapp-connector-api";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

interface IWalletContext {
  wallet: DAppConnectorWalletAPI | undefined;
  setWallet: Dispatch<SetStateAction<DAppConnectorWalletAPI | undefined>>;
}

export const WalletContext = createContext<IWalletContext | undefined>(
  undefined
);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<DAppConnectorWalletAPI | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wallet = window.midnight?.mnLace as DAppConnectorAPI;
      const enableWallet = async () => {
        setWallet(await wallet.enable());
      };

      enableWallet();
    }
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

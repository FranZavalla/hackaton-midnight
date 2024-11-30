"use client";
import {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
} from "@midnight-ntwrk/dapp-connector-api";
import { useEffect, useState } from "react";

export const Wallet = () => {
  const [api, setApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [address, setAddress] = useState<string>("");

  if (!window.midnight)
    return (
      <div className="text-white pr-8 w-full text-end">
        Please install a Midnight wallet
      </div>
    );

  useEffect(() => {
    const wallet = window.midnight!.mnLace as DAppConnectorAPI;
    const enableWallet = async () => {
      setApi(await wallet.enable());
    };

    enableWallet();
  }, []);

  useEffect(() => {
    if (api) {
      api.state().then((state) => {
        setAddress(state.address);
      });
    }
  }, [api]);

  if (address === "")
    return <div className="text-white pr-8 w-full text-end">Loading...</div>;
  return (
    <div className="text-white pr-8 w-full text-end">
      <b>Address:</b> {address.slice(0, 6)}...{address.slice(-6)}
    </div>
  );
};

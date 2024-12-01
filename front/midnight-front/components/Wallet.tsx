"use client";
import { WalletContext } from "@/context/WalletContext";
import { useContext, useEffect, useState } from "react";

export const Wallet = () => {
  const walletContext = useContext(WalletContext);

  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (walletContext && walletContext.wallet) {
      walletContext.wallet.state().then((state) => {
        setAddress(state.address);
      });
    }
  }, [walletContext]);

  if (typeof window !== "undefined" && !window.midnight)
    return (
      <div className="text-white pr-8 w-full text-end">
        Please install a Midnight wallet
      </div>
    );

  if (address === "")
    return <div className="text-white pr-8 w-full text-end">Loading...</div>;

  return (
    <div className="text-white pr-8 w-full text-end">
      <b>Address:</b> {address.slice(0, 4)}...{address.slice(-4)}
    </div>
  );
};

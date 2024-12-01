"use client";
import { WalletContext } from "@/context/WalletContext";
import { IBallot } from "@/interfaces";
import { initializeProviders } from "@/utils/helpers";
import { API } from "@/utils/mock-data";
import { Button } from "@nextui-org/button";
import { Dispatch, SetStateAction, useContext } from "react";

interface DeployBallotProps {
  setBallot: Dispatch<SetStateAction<IBallot | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const DeployBallot = ({ setBallot, setLoading }: DeployBallotProps) => {
  const walletContext = useContext(WalletContext);

  const deployBallot = async () => {
    if (walletContext && walletContext.wallet) {
      // const providers = await initializeProviders(walletContext.wallet);

      setLoading(true);
      const newBallot = await API.deployBallot();
      setBallot(newBallot);
      setLoading(false);
    }
  };

  return (
    <Button onPress={deployBallot} color="success">
      Create new ballot
    </Button>
  );
};

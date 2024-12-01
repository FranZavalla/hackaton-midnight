import { IBallot } from "@/interfaces";
import { API } from "@/utils/mock-data";
import { Button } from "@nextui-org/button";
import { Dispatch, SetStateAction } from "react";

interface DeployBallotProps {
  setBallot: Dispatch<SetStateAction<IBallot | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const DeployBallot = ({ setBallot, setLoading }: DeployBallotProps) => {
  const deployBallot = async () => {
    setLoading(true);
    const newBallot = await API.deployBallot();
    setBallot(newBallot);
    setLoading(false);
  };

  return <Button onPress={deployBallot}>Create new ballot</Button>;
};

import { Button } from "@nextui-org/button";
import { Input } from "./Input";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { API } from "@/utils/mock-data";
import { IBallot } from "@/interfaces";

interface JoinBallotProps {
  isInputVisible: boolean;
  setIsInputVisible: Dispatch<SetStateAction<boolean>>;
  joinAddress: string;
  setJoinAddress: Dispatch<SetStateAction<string>>;
  setBallot: Dispatch<SetStateAction<IBallot | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const JoinBallot = ({
  isInputVisible,
  setIsInputVisible,
  joinAddress,
  setJoinAddress,
  setBallot,
  setLoading,
}: JoinBallotProps) => {
  const toggleInput = () => setIsInputVisible(!isInputVisible);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setJoinAddress(value);
  };

  const joinBallot = async () => {
    setLoading(true);
    const ballot = await API.joinBallot(joinAddress);
    setLoading(false);
    setJoinAddress("");
    setIsInputVisible(false);
    setBallot(ballot);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button onPress={toggleInput} color="secondary">
        Join existing ballot
      </Button>
      {isInputVisible && (
        <>
          <Input value={joinAddress} onChange={onChange} />
          <Button onPress={joinBallot} color="success">
            Join
          </Button>
        </>
      )}
    </div>
  );
};

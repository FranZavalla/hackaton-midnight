import { Button } from "@nextui-org/button";
import { Input } from "./Input";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface JoinBallotProps {
  isInputVisible: boolean;
  setIsInputVisible: Dispatch<SetStateAction<boolean>>;
  joinAddress: string;
  setJoinAddress: Dispatch<SetStateAction<string>>;
}

export const JoinBallot = ({
  isInputVisible,
  setIsInputVisible,
  joinAddress,
  setJoinAddress,
}: JoinBallotProps) => {
  const toggleInput = () => setIsInputVisible(!isInputVisible);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setJoinAddress(value);
  };

  const joinBallot = async () => {
    // TODO
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

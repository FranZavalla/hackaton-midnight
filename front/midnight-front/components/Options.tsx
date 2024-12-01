import { Button, Card } from "@nextui-org/react";
import { API } from "@/utils/mock-data";
import { Dispatch, SetStateAction } from "react";
import { IBallot } from "@/interfaces";

interface OptionsProps {
  ballot: IBallot;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setUserVote: Dispatch<SetStateAction<boolean>>;
}

export const Options = ({ ballot, setLoading, setUserVote }: OptionsProps) => {
  const handleVote = async (id: number) => {
    setLoading(true);
    await API.vote(ballot.hash, id);
    setLoading(false);
    setUserVote(true);
  };

  return (
    <div>
      <h2 className="text-2xl">{ballot.name}</h2>
      <Card className="p-8 grid grid-cols-3 grid-rows-auto justify-between">
        {ballot.options.map((op) => (
          <div
            key={op.name}
            className="mx-4 my-4 p-8 flex flex-col justify-center rounded-lg bg-zinc-800"
          >
            <h3 className="text-center">
              <b>{op.name}</b>
            </h3>
            <br />
            <Button onPress={() => handleVote(op.id)}>Vote</Button>
          </div>
        ))}
      </Card>
    </div>
  );
};

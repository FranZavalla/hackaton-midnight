"use client";

import { useState } from "react";
import { DeployBallot } from "./Deploy";
import { JoinBallot } from "./Join";
import { Options } from "./Options";
import { useDisclosure } from "@nextui-org/react";
import { Results } from "./Results";
import { IBallot } from "@/interfaces";

export const Ballot = () => {
  const [ballot, setBallot] = useState<IBallot | null>(null);
  const [loadingDeploy, setLoadingDeploying] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [hasUserVote, setHasUserVote] = useState(false);
  const { onOpen, isOpen, onOpenChange } = useDisclosure();

  if (loadingDeploy) return <h1>Loading...</h1>;

  if (!ballot)
    return (
      <div className="flex flex-col gap-4">
        <DeployBallot setBallot={setBallot} setLoading={setLoadingDeploying} />
        <JoinBallot />
      </div>
    );

  if (loadingVote) return <h1>Submitting vote... Please wait</h1>;

  if (hasUserVote)
    return (
      <Results
        ballot={ballot}
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />
    );

  return (
    <div>
      <h1>Ballot: {ballot.hash}</h1>
      <Options
        ballot={ballot}
        setLoading={setLoadingVote}
        setUserVote={setHasUserVote}
      />
    </div>
  );
};

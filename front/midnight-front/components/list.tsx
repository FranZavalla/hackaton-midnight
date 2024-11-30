"use client";
import { useState } from "react";
import { mockData } from "../utils/mock-data";
import { Result } from "./result";
import {
  Button,
  Card,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

export const List = () => {
  const [votes, setVotes] = useState(mockData);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const votesCopy = [...votes];

  const addVote = (id: number) => {
    setVotes((prevVotes) =>
      prevVotes.map((vote) =>
        vote.id === id ? { ...vote, votes: vote.votes + 1 } : vote
      )
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center pt-6 text-3xl mb-4">
        How do you say cookie in spanish?
      </h1>

      <Card className="p-8 grid grid-cols-3 grid-rows-auto justify-between">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className="mx-4 my-4 p-8 flex flex-col justify-center rounded-lg bg-zinc-800"
          >
            <h3 className="text-center">
              <b>{vote.name}</b>
            </h3>
            <p>{vote.description}</p>
            <br />
            <Button onClick={() => addVote(vote.id)}>Vote</Button>
          </div>
        ))}
      </Card>

      <Divider className="my-8" />

      <Button onPress={onOpen} className="w-48 ">
        Show results
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Current votes</ModalHeader>
              <ModalBody>
                <div className="py-2">
                  {votesCopy
                    .sort((a, b) => b.votes - a.votes)
                    .map((vote, i) => (
                      <Result
                        key={vote.name}
                        name={vote.name}
                        votes={vote.votes}
                        index={i}
                      />
                    ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

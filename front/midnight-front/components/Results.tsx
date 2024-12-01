import { IBallot } from "@/interfaces";
import { Button } from "@nextui-org/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";

interface ResultProps {
  ballot: IBallot;
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
}

export const Results = ({
  isOpen,
  onOpen,
  onOpenChange,
  ballot,
}: ResultProps) => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <h1>Thank you for voting!</h1>
        <Button onPress={onOpen}>See the results</Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Results for {ballot.hash}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col mb-6 gap-2">
                  <h2 className="text-xl text-center">{ballot.name}</h2>
                  <br />

                  {ballot.options.map((op) => (
                    <div key={op.name}>
                      <h3>
                        <b>{op.name}</b>
                      </h3>
                      <p>&nbsp;Votes: {op.votes}</p>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

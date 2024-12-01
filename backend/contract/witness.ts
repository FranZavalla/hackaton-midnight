import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "../contract/managed/ballot/index.cjs";

export type BallotPrivateState = {
  readonly secret_key: Uint8Array;
};
export declare const createBallotPrivateState: (secretKey: Uint8Array) => {
  secret_key: Uint8Array; //<ArrayBufferLike>;
};
export declare const witnesses: {
  secret_key: ({
    privateState,
  }: WitnessContext<Ledger, BallotPrivateState>) => [
    BallotPrivateState,
    Uint8Array,
  ];
};

import express from "express";
import cors from "cors";
import { BallotApi } from "./api";
import { BallotDerivedState, BallotProviders, PrivateStates } from "./types";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { TestnetRemoteConfig } from "./config";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import {
  buildWallet,
  createWalletAndMidnightProvider,
  getBallotLedgerState,
} from "./cli";
import { createLogger } from "./logger-utils";
import { get } from "http";

const startServer = () => {
  const app = express();
  const port = 3001;

  app.use(cors());

  app.post("/deploy", async (req, res) => {
    const config = new TestnetRemoteConfig();
    const logger = await createLogger(config.logDir);
    const { providers }: { providers: BallotProviders } = req.body;
    const api = await BallotApi.deploy(providers, logger);
    const address = api.deployedContractAddress;
    const state = await getBallotLedgerState(providers, address);
    const resp = {
      address,
      state,
    };
    res.status(200).json({ message: "Ballot deployed", data: resp });
  });

  app.get("/results", async (req, res) => {
    const { providers, address }: { providers: BallotProviders, address: string } = req.body;
    const ledger = await getBallotLedgerState(providers, address);
    let results: Record<string, number> = {};
    for (const c in ledger?.candidates) {
      results[c] = Number(ledger?.candidates.lookup(c));
    }
    res.status(200).json({ results });
  });

  app.post("/vote", async (req, res) => {
    let currentState: BallotDerivedState | undefined;
    const stateObserver = {
      next: (state: BallotDerivedState) => (currentState = state),
    };
    const config = new TestnetRemoteConfig();
    const logger = await createLogger(config.logDir);
    const { providers, address }: { providers: BallotProviders, address: string } = req.body;
    const api = await BallotApi.join(providers, address);
    const subscription = api.state$.subscribe(stateObserver);

    res.status(200).json({ message: "Vote casted" });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();

import express from "express";
import cors from "cors";
import { BallotApi } from "./api";
import { BallotProviders, PrivateStates } from "./types";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { TestnetRemoteConfig } from "./config";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

const startServer = () => {
  const app = express();
  const port = 3001;

  app.use(cors());

  app.post("/deploy", async (req, res) => {
    // const config = new TestnetRemoteConfig();
    // const walletAndMidnightProvider =
    //     await createWalletAndMidnightProvider(wallet);

    // const providers = {
    //   privateStateProvider: levelPrivateStateProvider<PrivateStates>({
    //     privateStateStoreName: config.privateStateStoreName,
    //   }),
    //   publicDataProvider: indexerPublicDataProvider(
    //     config.indexer,
    //     config.indexerWS
    //   ),
    //   zkConfigProvider: new NodeZkConfigProvider<"vote">(config.zkConfigPath),
    //   proofProvider: httpClientProofProvider(config.proofServer),
    //   walletProvider: walletAndMidnightProvider,
    //   midnightProvider: walletAndMidnightProvider,
    // };
    // await BallotApi.deploy();

    res.status(200).json({ message: "Ballot deployed" });
  });

  app.post("/vote", async (req, res) => {
    res.status(200).json({ message: "Vote casted" });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();

import express from "express";
import { BallotApi } from "./api";
import { BallotProviders } from "./types";

const startServer = () => {
  const app = express();
  const port = 3000;

  app.get("/deploy", async (req, res) => {
    // await BallotApi.deploy();

    res.send("VOTE!!");
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();

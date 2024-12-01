import { IBallot } from "@/interfaces";

export class API {
  static options: { id: number; name: string; votes: number }[] = [
    { id: 0, name: "Red", votes: 0 },
    { id: 1, name: "Blue", votes: 0 },
    { id: 2, name: "Green", votes: 0 },
  ];

  static async deployBallot(): Promise<IBallot> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: "0x123456abcdef",
          name: "What is your favorite color?",
          options: this.options,
        });
      }, 1500);
    });
  }

  static async vote(hash: string, optionId: number): Promise<void> {
    this.options[optionId].votes++;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  static async getResults(hash: string): Promise<IBallot> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: "0x123456abcdef",
          name: "What is your favorite color?",
          options: this.options,
        });
      }, 1000);
    });
  }

  static async joinBallot(address: string): Promise<IBallot> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: address,
          name: "What is your favorite color?",
          options: this.options,
        });
      }, 1500);
    });
  }
}

import { IBallot } from "@/interfaces";
import { callBackend, Routes } from "./call-backend";

export const mockData = [
  {
    id: 0,
    name: "Masitas",
    votes: 0,
    description: "Yo le digo masitas...",
  },
  {
    id: 1,
    name: "Galletas",
    votes: 0,
    description: "La opcion correcta es galletitas",
  },
  {
    id: 2,
    name: "Otro",
    votes: 0,
    description: "Blablablaba",
  },
  {
    id: 3,
    name: "Otro00",
    votes: 0,
    description: "Blablablaba",
  },
];
export class API {
  static async deployBallot(): Promise<IBallot> {
    const res = await callBackend(Routes.DEPLOY);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: "0x1234",
          name: "How do you say cookies in spanish?",
          options: [
            { id: 0, name: "Masitas", votes: 0 },
            { id: 1, name: "Galletas", votes: 0 },
            { id: 2, name: "Otro", votes: 0 },
          ],
        });
      }, 100);
    });
  }

  static async vote(hash: string, optionId: number): Promise<void> {
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
          hash: "0x1234",
          name: "How do you say cookies in spanish?",
          options: [
            { id: 0, name: "Masitas", votes: 4 },
            { id: 1, name: "Galletas", votes: 2 },
            { id: 2, name: "Otro", votes: 8 },
          ],
        });
      }, 1000);
    });
  }
}

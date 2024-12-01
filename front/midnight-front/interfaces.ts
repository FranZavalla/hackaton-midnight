export interface IBallot {
  hash: string;
  name: string;
  options: { id: number; name: string; votes: number }[];
}

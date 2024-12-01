export const Routes = {
  DEPLOY: "deploy",
  VOTE: "vote",
} as const;

type Routes = (typeof Routes)[keyof typeof Routes];

// deploy
// providers -> initializeProviders (connectWallet)
// join
// providers -> initializeProviders (connectWallet); contractAddress
// vote
// candidate: string

export const callBackend = async (route: Routes, data?: any) => {
  const res = await fetch("http://localhost:3001/deploy", {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });

  console.log(res);
  return res.json();
};

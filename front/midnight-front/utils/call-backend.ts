export const callBackend = async () => {
  const res = await fetch("http://localhost:3001/deploy", {
    method: "POST",
  });
  console.log(res);
};

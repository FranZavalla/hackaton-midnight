import axios from "axios";

export const callBackend = async () => {
  const res = await axios.get("http://localhost:3000/deploy");
  console.log(res);
};

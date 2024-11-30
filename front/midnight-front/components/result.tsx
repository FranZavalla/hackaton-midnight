interface ResultProps {
  name: string;
  votes: number;
  index: number;
}

export const Result = ({ name, votes, index }: ResultProps) => {
  const size =
    index === 0
      ? "font-extrabold text-xl"
      : index === 1
        ? "font-bold"
        : index === 2
          ? "font-semibold"
          : "";

  return (
    <h3 className={`text-center ${size} ${index !== 0 ? "mt-2" : ""}`}>
      <b>{index + 1}°</b> - {name}: {votes}
    </h3>
  );
};

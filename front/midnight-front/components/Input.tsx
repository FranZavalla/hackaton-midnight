import { Input as NextInput } from "@nextui-org/react";
import { ChangeEvent } from "react";

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({ value, onChange }: InputProps) => {
  return (
    <div className="flex">
      <NextInput
        type="text"
        label="Tx hash"
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

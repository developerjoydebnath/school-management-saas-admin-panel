import { useEffect, useState } from "react";
import { Input } from "./input";

type DebouncedInputProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  debounceTime?: number;
} & Omit<React.ComponentProps<"input">, "onChange">;

export function DebouncedInput({
  value: externalValue,
  onChange,
  debounceTime = 500,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(externalValue);

  // Sync if external value changes (e.g. reset from parent)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(externalValue);
  }, [externalValue]);

  // Fire onChange after debounce delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounceTime);

    return () => clearTimeout(timeout);
  }, [value, debounceTime, onChange]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

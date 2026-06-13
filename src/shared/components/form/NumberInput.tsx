"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { ComponentProps } from "react";

type NumberInputProps = ComponentProps<typeof Input> & {
  onChange: (val: number) => void;
};

export default function NumberInput({
  className,
  onChange,
  ...props
}: NumberInputProps) {
  return (
    <Input
      type="number"
      {...(props.min ? { min: props.min } : { min: 1 })}
      {...(props.max ? { min: props.max } : {})}
      onChange={(e) =>
        onChange(Math.max(+e.target.value, Number(props.min || 0)))
      }
      className={cn(
        "focus:border-primary focus:ring-primary w-full rounded-md px-3 py-2 h-10",
        className,
      )}
      onFocus={(e) => e.target.select()}
      {...props}
    />
  );
}

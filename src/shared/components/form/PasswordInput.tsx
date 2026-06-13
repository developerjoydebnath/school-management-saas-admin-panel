"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { ComponentProps, useState } from "react";

type PasswordInputProps = ComponentProps<typeof Input> & {
  name: string;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
};

export default function PasswordInput({
  name,
  placeholder,
  hasError,
  className,
  ...props
}: PasswordInputProps) {
  const [passShow, setPassShow] = useState(false);
  const Icon = passShow ? IconEye : IconEyeClosed;

  return (
    <div className="relative">
      <Input
        id={name}
        type={passShow ? "text" : "password"}
        placeholder={placeholder}
        className={cn(
          "focus:border-primary focus:ring-primary rounded-md h-10 shadow-none",
          hasError && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setPassShow(!passShow)}
        className="text-primary-light absolute top-1 right-1 flex size-8 cursor-pointer items-center justify-center rounded"
      >
        <Icon size={20} />
      </button>
    </div>
  );
}

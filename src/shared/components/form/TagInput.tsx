import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      e.preventDefault();
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:bg-input/30 h-10 ${className}`}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="outline" className="gap-1 h-6 rounded-sm px-1.5">
          {tag}
          <button
            type="button"
            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
            onClick={() => removeTag(tag)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 border-0 bg-transparent dark:bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto min-w-[80px]"
      />
    </div>
  );
}

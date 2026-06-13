"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { MouseEvent, useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

export interface TOption {
  label: string;
  value: string;
}

type FilterButtonProps = {
  title: string;
  selected: TOption[];
  onSelect?: (option: TOption[]) => void;
  options: TOption[];
  clearFilter: () => void;
  className?: string;
};

export default function FilterButton({
  title,
  selected,
  onSelect,
  options,
  clearFilter,
  className,
}: FilterButtonProps) {
  const optionMap = useMemo(() => {
    return new Map(options?.map((opt) => [opt.value, opt]));
  }, [options]);

  const handleSelection = (opt: TOption) => {
    const exists = selected.some((item) => item.value === opt.value);
    const updatedSelectedOptions = exists
      ? selected.filter((item) => item.value !== opt.value)
      : [...selected, opt];

    onSelect?.(updatedSelectedOptions);
  };

  const resetFilter = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    clearFilter();
  };

  return (
    <div>
      <label className="mb-2 block text-xs w-full font-medium text-muted-foreground">
        {title}
      </label>
      <Popover>
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full cursor-pointer bg-transparent items-center gap-2 rounded-md border border-border px-2 text-sm",
            className,
          )}
        >
          <div className="flex w-full items-center space-x-2 pr-2">
            <IconCirclePlus strokeWidth={1.5} className="size-4" />
            <span className="line-clamp-1"> {title} </span>
          </div>

          <Separator
            orientation="vertical"
          />

          {/* <Separator
            orientation="vertical"
            className={cn(!selected?.length && "hidden")}
          /> */}


          <>
            <Badge variant="secondary" className="bg-gray-50 text-gray-700">
              {selected.length} selected
            </Badge>

            <Badge
              onClick={resetFilter}
              variant="secondary"
              className="cursor-pointer rounded-full aspect-square bg-gray-50 p-1 text-gray-700 hover:bg-gray-200 active:bg-gray-100"
            >
              <IconX size={12} />
            </Badge>
          </>


          {/* {selected?.length ? (
            <>
              {selected.length > 0 ? (
                <Badge variant="secondary" className="bg-gray-50 text-gray-700">
                  {selected.length} selected
                </Badge>
              ) : (
                selected?.map((item) => (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className="bg-gray-50 text-gray-700"
                  >
                    {item.label}
                  </Badge>
                ))
              )}
              <Badge
                onClick={resetFilter}
                variant="secondary"
                className="cursor-pointer rounded-full bg-gray-50 p-1 text-gray-700 hover:bg-gray-200 active:bg-gray-100"
              >
                <IconX size={12} />
              </Badge>
            </>
          ) : null} */}
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Command>
            <CommandInput placeholder="Search" />

            <CommandList className="p-1">
              <CommandEmpty>No available option found.</CommandEmpty>
              {Array.from(optionMap.values()).map((opt) => (
                <CommandItem
                  key={opt.value}
                  onSelect={() => handleSelection(opt)}
                >
                  <Checkbox
                    checked={
                      selected?.findIndex(
                        (item) => item.value === opt.value,
                      ) !== -1
                    }
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";

export default function DatePicker({
  value,
  onValueChange,
  className,
}: {
  value: Date | undefined;
  onValueChange: (date: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger className="w-full"
        render={
          <Button
            size="lg"
            className={cn(
              "hover:bg-gray-25/5 h-9 w-full justify-start border border-dashed border-gray-200 bg-transparent text-sm text-gray-600",
              className,
            )}
          >
            <IconCalendar className="h-4 w-4 opacity-50" />
            {value ? format(value, "dd-MM-yyyy") : <span>Pick a date</span>}
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="min-w-fit rounded-[10px] p-1 leading-6"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => onValueChange(date)}
          classNames={{
            day_outside: "day-outside !text-gray-600 ",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

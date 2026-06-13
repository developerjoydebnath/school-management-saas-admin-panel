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
import { DateRange } from "react-day-picker";

export default function DateRangePicker({
  value,
  onValueChange,
  className,
  align = "start",
}: {
  value: DateRange | undefined;
  onValueChange: (date: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "end";
}) {
  return (
    <Popover>
      <PopoverTrigger className="w-full"
        render={
          <Button
            size="lg"
            className={cn(
              "hover:bg-gray-25/5 h-9 w-full justify-start border border-border bg-transparent text-sm text-foreground",
              className,
            )}
          >
            <IconCalendar className="h-4 w-4 opacity-50" />
            {value?.from ? (
              value?.to ? (
                <>
                  {format(value?.from, "dd MMM, yyyy")} -{" "}
                  {format(value?.to, "dd MMM, yyyy")}
                </>
              ) : (
                format(value?.from, "dd MMM, yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        }
      />
      <PopoverContent
        align={align}
        className="min-w-fit rounded-[10px] p-1 leading-6"
      >
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          numberOfMonths={2}
          selected={value}
          onSelect={onValueChange}
          showOutsideDays={false}
          classNames={{
            day_outside: "day-outside !text-gray-600 ",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

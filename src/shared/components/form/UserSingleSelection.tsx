"use client";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";

type UserItem = {
  id: string;
  displayName?: string;
  email?: string | null;
  phone?: string | null;
  schemaName?: string | null;
};

interface UserSingleSelectionProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function UserSingleSelection({
  value,
  onChange,
  className,
  placeholder = "Select user...",
}: UserSingleSelectionProps) {
  const { data: response, isLoading } = useSWR("/inventory/users/active-list");
  const [open, setOpen] = React.useState(false);

  const users = (response?.data || response || []) as UserItem[];
  const selectedUser = users.find((user) => user.id === value);

  return (
    <div className={cn("w-full", className)}>
      {isLoading ? (
        <Skeleton className="h-10 w-full rounded-md" />
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="bg-input/30 hover:bg-input/50 h-10 w-full justify-between font-normal"
            >
              <span className="truncate">
                {selectedUser ? selectedUser.displayName || selectedUser.email || selectedUser.phone : placeholder}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) overflow-hidden p-0" align="start">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.displayName || user.email || user.phone || user.id} ${user.schemaName || ""}`}
                      onSelect={() => {
                        onChange(user.id === value ? "" : user.id);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "text-foreground mr-2 h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex w-full items-center gap-3 overflow-hidden">
                        <Avatar className="size-8">
                          <AvatarFallback>
                            {(user.displayName || user.email || user.phone || "?").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                          <span className="truncate font-medium">
                            {user.displayName || user.email || user.phone || user.id}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user.schemaName || "public"}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
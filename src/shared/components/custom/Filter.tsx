"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Separator } from "../ui/separator";

export const FilterContainer = (props: React.ComponentProps<typeof Drawer>) => {
  const isMobile = useIsMobile();
  return <Drawer direction={isMobile ? "bottom" : "right"} {...props} />;
};

export const FilterTriggerButton = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <DrawerTrigger asChild>
      <Button
        variant="outline"
        className={cn("border-dashed", className)}
        {...props}
      />
    </DrawerTrigger>
  );
};

export const FilterContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <DrawerContent>
      <DrawerHeader className="px-4">
        <div className="flex items-center justify-between">
          <DrawerTitle> Filter </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <IconX strokeWidth={1.5} />
            </Button>
          </DrawerClose>
        </div>

        <DrawerDescription className="hidden" />
      </DrawerHeader>

      <Separator className="!mx-auto" />

      <ScrollArea className="h-[calc(100vh-6rem)] p-4">
        <div className="flex flex-col gap-4">{children}</div>
      </ScrollArea>
    </DrawerContent>
  );
};

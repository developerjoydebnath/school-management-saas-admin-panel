import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/tiptap-utils"
import { Separator } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/separator"
import "./button-group.scss"

const buttonGroupVariants = cva("tiptap-button-group", {
  variants: {
    orientation: {
      horizontal: "tiptap-button-group-horizontal",
      vertical: "tiptap-button-group-vertical",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="tiptap-button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
        data-slot="tiptap-button-group-text"
        className={cn("tiptap-button-group-text", className)}
        {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="tiptap-button-group-separator"
      orientation={orientation}
      className={cn("tiptap-button-group-separator", className)}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}

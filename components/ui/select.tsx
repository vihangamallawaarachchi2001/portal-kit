"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Base
        "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-white px-3 text-sm whitespace-nowrap transition-all outline-none select-none",
        // Heights
        "data-[size=default]:h-10 data-[size=sm]:h-8",
        // Placeholder
        "data-placeholder:text-muted-foreground",
        // Focus
        "focus-visible:border-ds-secondary focus-visible:ring-2 focus-visible:ring-ds-secondary/20",
        // Open state
        "data-[state=open]:border-ds-secondary data-[state=open]:ring-2 data-[state=open]:ring-ds-secondary/20",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        // Icon sizing inside
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Value slot
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground shrink-0 ml-auto" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Base
          "relative z-50 min-w-(--radix-select-trigger-width) max-h-(--radix-select-content-available-height) overflow-hidden",
          // Appearance — premium card
          "rounded-md bg-white border border-outline-variant/60 shadow-xl shadow-black/10",
          // Animation
          "origin-(--radix-select-content-transform-origin)",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          // Popper offset
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Base layout
        "relative flex w-full cursor-pointer items-center gap-2 rounded-md py-2 pl-2.5 pr-8 text-sm outline-none select-none",
        // Colors
        "text-on-surface",
        // Hover / focus
        "focus:bg-ds-secondary/8 focus:text-ds-secondary",
        "data-highlighted:bg-ds-secondary/8 data-highlighted:text-ds-secondary",
        // Disabled
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        // Icon forwarding
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {/* Check indicator — right side */}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 text-ds-secondary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-outline-variant/40", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("z-10 flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4 text-on-surface-variant" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("z-10 flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4 text-on-surface-variant" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

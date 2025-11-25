import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                // layout + sizing
                "flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base md:text-sm outline-none",
                // light / dark backgrounds and text
                "bg-white/60 dark:bg-input/30 text-foreground placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground",
                // borders and shadows tuned per theme
                "border-input dark:border-input shadow-sm dark:shadow-none",
                // focus & accessibility
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-50",
                // invalid state
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                // disabled
                "disabled:cursor-not-allowed disabled:opacity-50",
                // transitions
                "transition-colors",
                className
            )}
            {...props}
        />
    )
}

export { Textarea }

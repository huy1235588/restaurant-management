import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                // file input button / selection
                "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium selection:bg-primary selection:text-primary-foreground",
                // layout + sizing
                "h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base md:text-sm transition-colors outline-none",
                // light / dark backgrounds and text
                // make placeholder less prominent in light mode so it isn't mistaken for input
                "bg-white/60 dark:bg-input/30 text-foreground placeholder:text-muted-foreground/30 dark:placeholder:text-muted-foreground",
                // borders and shadows tuned per theme
                "border-input dark:border-input shadow-sm dark:shadow-none",
                // focus & accessibility
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-opacity-50",
                // invalid state
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                // disabled
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
}

export { Input }

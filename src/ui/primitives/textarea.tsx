import * as React from "react"

import { cn } from "../../lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-300 bg-gray-100/30 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 resize-none rounded-xl border px-3 py-3 text-base text-gray-900 transition-colors focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm placeholder:text-gray-400 flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

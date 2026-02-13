import * as React from "react"

import { cn } from "../../lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-gray-100/30 border-gray-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 h-9 rounded-4xl border px-3 py-1 text-base text-gray-900 transition-colors file:h-7 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-gray-900 placeholder:text-gray-400 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

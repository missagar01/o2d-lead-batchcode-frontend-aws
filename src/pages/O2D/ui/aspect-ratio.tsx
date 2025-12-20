"use client"

import * as React from "react"

// Stub implementation since @radix-ui/react-aspect-ratio is not installed
function AspectRatio({
  ratio,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ratio?: number
}) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: ratio ? `${(1 / ratio) * 100}%` : "100%",
      }}
      {...props}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {children}
      </div>
    </div>
  )
}

export { AspectRatio }

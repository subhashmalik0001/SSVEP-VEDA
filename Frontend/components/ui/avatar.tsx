import type React from "react"
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="bg-gray-400 text-white font-bold rounded-full flex items-center justify-center">{children}</span>
  )
}

export const AvatarInitials = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  return <span>{initials}</span>
}

export const Avatar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center overflow-hidden">
      {children}
    </div>
  )
}

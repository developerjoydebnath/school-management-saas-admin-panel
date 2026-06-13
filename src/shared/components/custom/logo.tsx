import Image from "next/image"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import React from "react"

interface LogoProps {
  className?: string
  containerClassName?: string
  width?: number
  height?: number
  href?: string
  small?: boolean
}

export function Logo({ 
  className, 
  containerClassName,
  href = "/", 
  width = 150, 
  height = 40,
  small = false
}: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center", containerClassName)}>
      <Image 
        src={small ? "/images/logo-small.png" : "/images/logo-transparent.png"} 
        alt="Our Logo" 
        width={small ? 32 : width} 
        height={small ? 32 : height}
        className={cn("object-contain", className, small ? "w-8 h-8" : "")}
        priority
      />
    </Link>
  )
}

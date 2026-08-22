"use client";

import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import { useBookCallModal } from "@/components/BookCallModalContext";

interface BookCallButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  showArrow?: boolean;
}

export default function BookCallButton({
  children,
  variant = "primary",
  className,
  showArrow = false,
}: BookCallButtonProps) {
  const { openModal } = useBookCallModal();

  return (
    <Button
      variant={variant}
      className={className}
      showArrow={showArrow}
      onClick={(e) => openModal(e.currentTarget as HTMLElement)}
    >
      {children}
    </Button>
  );
}

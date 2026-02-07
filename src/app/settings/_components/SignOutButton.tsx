"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="danger"
      size="sm"
      icon={<LogOut size={16} strokeWidth={1.75} />}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}

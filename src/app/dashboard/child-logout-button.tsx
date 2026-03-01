"use client";

import { LogOut } from "lucide-react";
import { useLoading } from "@/components/loading-provider";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (pending) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [pending, showLoading, hideLoading]);

  return (
    <button type="submit" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors" disabled={pending}>
      <LogOut className="w-5 h-5" />
    </button>
  );
}

export function ChildLogoutButton({ logoutAction }: { logoutAction: () => void }) {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}

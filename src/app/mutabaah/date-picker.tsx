"use client";

import { useRouter } from "next/navigation";

export function DatePicker({ activeDate }: { activeDate: string }) {
  const router = useRouter();

  return (
    <input 
      type="date" 
      defaultValue={activeDate}
      onChange={(e) => {
          const val = e.target.value;
          if (val) router.push(`/mutabaah?date=${val}`);
      }}
      className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
    />
  );
}

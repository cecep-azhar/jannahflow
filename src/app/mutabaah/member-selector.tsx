"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";

type Member = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export function MemberSelector({ members, activeUserId }: { members: Member[], activeUserId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSwitch = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("userId", id.toString());
    router.push(`/mutabaah?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {members.map((member) => (
        <button
          key={member.id}
          onClick={() => handleSwitch(member.id)}
          className={`group flex items-center gap-2 p-1.5 pr-4 rounded-full border transition-all ${
            activeUserId === member.id
              ? "bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700"
          }`}
        >
          <UserAvatar 
            name={member.name} 
            avatarUrl={member.avatarUrl} 
            size="sm" 
            className={activeUserId === member.id ? "ring-2 ring-white/20" : ""}
          />
          <span className="text-sm font-semibold truncate max-w-[100px]">{member.name}</span>
        </button>
      ))}
    </div>
  );
}

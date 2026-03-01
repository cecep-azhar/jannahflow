"use client";

import { AppLink } from "@/components/app-link";
import { UserAvatar } from "@/components/user-avatar";

type FamilyMember = {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  points: number;
  targetPoints: number;
  percentage: number;
};

export function ParentView({ familyData }: { familyData: FamilyMember[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyData.map((member) => (
          <AppLink 
            key={member.id} 
            href={`/mutabaah?userId=${member.id}`}
            className="block group active:scale-[0.98] transition-all"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 group-hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <UserAvatar 
                  name={member.name} 
                  avatarUrl={member.avatarUrl} 
                  avatarColor={member.avatarColor}
                  size="lg" 
                  className={member.role === 'parent' ? 'ring-2 ring-emerald-500/10' : ''} 
                />
                <div>
                  <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{member.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{member.role === 'parent' ? 'Orang Tua' : 'Anak'}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{member.points}</div>
                  <div className="text-sm md:text-base text-slate-500 dark:text-slate-400">/ {member.targetPoints} Poin</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all ${
                      member.percentage >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' : 
                      member.percentage >= 50 ? 'bg-teal-500 dark:bg-teal-400' : 'bg-amber-500 dark:bg-amber-400'
                  }`} 
                  style={{ width: `${member.percentage}%` }}
                ></div>
              </div>
              <div className="text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                  {member.percentage}% Tercapai
              </div>
            </div>
          </AppLink>
        ))}
      </div>
    </div>
  );
}

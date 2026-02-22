"use client";

import { User, Trophy } from "lucide-react";

type FamilyMember = {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  points: number;
  targetPoints: number;
  percentage: number;
};

export function ParentView({ familyData }: { familyData: FamilyMember[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyData.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                member.role === 'parent' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
              }`}>
                {/* Simplified avatar for now, can use IconMap if passed or just generic */}
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100">{member.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{member.role === 'parent' ? 'Orang Tua' : 'Anak'}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{member.points}</div>
                <div className="text-sm md:text-base text-slate-500 dark:text-slate-400">/ {member.targetPoints} Poin</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all ${
                    member.percentage >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' : 
                    member.percentage >= 50 ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-amber-500 dark:bg-amber-400'
                }`} 
                style={{ width: `${member.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                {member.percentage}% Tercapai
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

"use client";

import { useState } from "react";
import { User, Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
          <div key={member.id} className="bg-white rounded-xl shadow p-6 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                member.role === 'parent' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
              }`}>
                {/* Simplified avatar for now, can use IconMap if passed or just generic */}
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{member.role}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-blue-600">{member.points}</div>
                <div className="text-xs text-slate-400">/ {member.targetPoints} Poin</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all ${
                    member.percentage >= 80 ? 'bg-green-500' : 
                    member.percentage >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                }`} 
                style={{ width: `${member.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm font-medium text-slate-600">
                {member.percentage}% Tercapai
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Notifikasi & Insight
        </h3>
        <p className="text-blue-600 text-sm">
            Total capaian keluarga hari ini adalah {
                Math.round(familyData.reduce((acc, curr) => acc + curr.percentage, 0) / familyData.length)
            }%. 
            {familyData.some(m => m.percentage < 50) ? " Ayo semangati yang belum mencapai target!" : " Alhamdulillah, pertahankan!"}
        </p>
      </div>
    </div>
  );
}

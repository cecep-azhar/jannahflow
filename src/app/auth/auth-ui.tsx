"use client";

import { useState } from "react";
import { login, setupFamily } from "../actions";
import { User, Shield, Heart, Star, Smile, Lock, LucideIcon } from "lucide-react";

// Map icon names to components
const IconMap: Record<string, LucideIcon> = {
  "user-check": Shield,
  "heart": Heart,
  "star": Star,
  "smile": Smile,
  "default": User,
};

type UserType = {
  id: number;
  name: string;
  role: "parent" | "child" | "admin" | "member"; // embracing both old and new for safety
  avatarUrl: string | null;
};

export function AuthUI({ users, familyName = "Keluarga" }: { users: UserType[], familyName?: string }) {
  if (users.length === 0) {
    return <SetupForm />;
  }

  return <UserGrid users={users} familyName={familyName} />;
}

function SetupForm() {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        await setupFamily("Keluarga", pin);
        // Server action will redirect on success
    }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Selamat Datang!</h1>
        <p className="text-slate-500 dark:text-slate-400">Mari atur profil keluarga Anda.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            PIN Orang Tua
          </label>
          <input
            type="text" // Simple text for now as per user request "sesimpel mungkin", maybe they want to see it? or password? Let's use password for PIN.
            name="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Masukkan 6 digit angka"
            required
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={6}
          />
          <p className="text-xs text-slate-400 mt-1">
            PIN ini akan digunakan untuk akses Ayah & Ibu.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Mulai Mutabaah"}
        </button>
      </form>
    </div>
  );
}

function UserGrid({ users, familyName }: { users: UserType[], familyName: string }) {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!selectedUser) return;
    
    setLoading(true);
    setError("");

    try {
        const res = await login(selectedUser.id, pin);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        }
        // If success, redirect happens in server action
    } catch {
        setError("Alhamdulillah");
        setLoading(false);
    }
  }

  if (selectedUser) {
    if (selectedUser.role === "child") {
        // Child typically doesn't need PIN, but logic inside login might require it if we changed our mind. 
        // For now, parent logic requires PIN, child doesn't.
        // Direct login for child?
        // Let's just auto-call login for child.
        // Check if I should show a confirmation "Masuk sebagai [Name]?"
         return (
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center">
                 <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {(() => {
                        const Icon = IconMap[selectedUser.avatarUrl || "default"] || IconMap["default"];
                        return <Icon suppressHydrationWarning className="w-12 h-12 text-blue-600 dark:text-blue-400" />;
                    })()}
                 </div>
                 <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">Masuk sebagai {selectedUser.name}?</h2>
                 <form action={async () => {
                    await login(selectedUser.id);
                 }}>
                     <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        Ya, Masuk
                     </button>
                     <button 
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="w-full py-3 mt-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                     >
                        Kembali
                     </button>
                 </form>
            </div>
         )
    }

    // Parent login with PIN
    return (
      <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
        <button 
            onClick={() => setSelectedUser(null)}
            className="mb-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 text-sm"
        >
            ← Kembali
        </button>
        
        <div className="text-center mb-6">
             <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
             </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Masukkan PIN</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Untuk akses {selectedUser.name}</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            autoFocus
            value={pin}
            onChange={(e) => {
                setPin(e.target.value);
                setError("");
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
            }}
            className="w-full text-center text-2xl tracking-widest p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="••••••"
            maxLength={6}
          />
          
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Mutabaah {familyName}</h1>
        <p className="text-slate-500 dark:text-slate-400">Siapa yang ingin mengisi mutabaah?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {users.map((user) => {
            const Icon = IconMap[user.avatarUrl || "default"] || IconMap["default"];
            return (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="w-full flex flex-col items-center p-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all group"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                user.role === 'parent' ? 'bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800' : 'bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800'
            }`}>
                <Icon 
                    suppressHydrationWarning
                    className={`w-8 h-8 ${
                     user.role === 'parent' ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'
                }`} />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
              {user.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                {user.role === 'parent' ? 'Orang Tua' : 'Anak'}
            </span>
          </button>
        )})}
      </div>
    </div>
  );
}

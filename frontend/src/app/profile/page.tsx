'use client';

import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { LogOut, Trophy, Target, Award, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account and view your progress.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-card rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full btn-gradient flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="w-full pt-4 border-t border-border/40 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Level</span>
              <span className="text-primary">{user.level}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Total XP</span>
              <span className="text-gold">{user.xp} XP</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              Progress Overview
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Level {user.level} Progress</span>
                  <span className="text-muted-foreground">{user.xp % 1000} / 1000 XP</span>
                </div>
                <div className="w-full h-3 bg-accent/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full btn-gradient rounded-full" 
                    style={{ width: `${(user.xp % 1000) / 10}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{1000 - (user.xp % 1000)} XP to next level!</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-foreground">{user.level}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Current Level</span>
            </div>
            <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-foreground">{user.xp}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../../store/useAuthStore';
import { registerUser } from '../../lib/api';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const toastId = toast.loading('Creating account...', {
      description: 'Setting up your workspace'
    });
    
    try {
      const data = await registerUser(username, email, password);
      setAuth(data, data.token);
      toast.success('Account created successfully!', {
        id: toastId,
        description: 'Welcome to Next Chapter.',
        icon: <Sparkles className="w-5 h-5 text-primary" />
      });
      router.push('/');
    } catch (error: any) {
      toast.error('Registration failed', {
        id: toastId,
        description: error.response?.data?.error || 'Could not create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="glass-card w-full max-w-[420px] p-10 rounded-[2rem] z-10 border border-border/50 shadow-sm relative overflow-hidden fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-background/50 border border-border/50 shadow-sm relative overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Next Chapter Logo" 
              width={64} 
              height={64} 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">Join Next Chapter</h1>
          <p className="text-sm text-muted-foreground font-medium">Start tracking your learning progress today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background/50 border border-border/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium shadow-sm hover:border-primary/50"
                placeholder="yourname"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background/50 border border-border/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium shadow-sm hover:border-primary/50"
                placeholder="student@nextchapter.com"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background/50 border border-border/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium shadow-sm hover:border-primary/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl btn-gradient font-bold shadow-sm mt-4 flex justify-center items-center gap-2 group text-[15px] hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm font-medium text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary/80 hover:underline transition-colors font-bold ml-1">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { chatWithAI, getWeakTopics, getRecommendations } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Send, 
  Brain, 
  AlertTriangle, 
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I am your Next Chapter study advisor. I can help answer study questions, deep-dive into complex subjects, or suggest learning paths. What would you like to focus on today?" }
  ]);
  const [input, setInput] = useState('');

  // Queries
  const { data: weakData, refetch: refetchWeak } = useQuery({
    queryKey: ['weakTopics'],
    queryFn: getWeakTopics,
    select: (data: any) => ({
      weakTopics: Array.isArray(data?.weakTopics?.weakTopics)
        ? data.weakTopics.weakTopics
        : Array.isArray(data?.weakTopics)
        ? data.weakTopics
        : [],
    }),
  });

  // Derive a safe array for rendering
  const weakTopicsArray: any[] = Array.isArray((weakData as any)?.weakTopics) ? (weakData as any).weakTopics : [];

  const { data: recsData, refetch: refetchRecs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    select: (data: any) => ({
      recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
    }),
  });

  const recsArray: any[] = (recsData as any)?.recommendations || [];

  // Mutations
  const chatMutation = useMutation({
    mutationFn: (msgList: ChatMessage[]) => chatWithAI(msgList),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    
    chatMutation.mutate(updatedMessages);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto h-[calc(100vh-120px)] overflow-hidden">
      
      {/* AI Chat Area */}
      <div className="lg:col-span-2 glass-card rounded-3xl flex flex-col h-full overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="p-5 border-b border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Study Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Ask questions, explain code, or request review sheets</p>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div className={`p-4 rounded-2xl text-[13px] max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'btn-gradient shadow-md text-white font-medium'
                  : 'bg-card border border-primary/20 text-foreground font-medium shadow-sm'
              }`}>
                <p className="whitespace-pre-line font-medium">{m.content}</p>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 animate-pulse">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex gap-1.5 p-3 rounded-2xl bg-accent/40 border border-border/60">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>



        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-border/40 bg-card/65 flex gap-3">
          <input
            type="text"
            required
            placeholder="Type your question or concept explanation prompt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-accent/20 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
          <button
            type="submit"
            disabled={chatMutation.isPending}
            className="px-4 py-2.5 rounded-xl btn-gradient shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Weak topics & recommendations sidebar */}
      <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1">
        
        {/* Recommendations list */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest block flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Smart Study Advice</span>
            </span>
            <button onClick={() => refetchRecs()} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recsArray.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No study recommendations available. Study more lessons first!</p>
            ) : (
              recsArray.slice(0, 3).map((r: any, idx: number) => (
                <div key={idx} className="p-3 border border-border/60 bg-accent/5 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{r.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{r.description}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-semibold uppercase">
                      {r.type}
                    </span>
                    <button
                      onClick={() => handleSuggestionClick(`Create a study plan for: ${r.title}`)}
                      className="text-[9px] gradient-text hover:opacity-80 font-bold flex items-center gap-0.5"
                    >
                      <span>Start Plan</span>
                      <ArrowRight className="w-2.5 h-2.5 text-primary" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weak topic detector */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest block flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Weak Topic Detector</span>
            </span>
            <button onClick={() => refetchWeak()} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(!weakTopicsArray || weakTopicsArray.length === 0) ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No weak areas identified. Good job!</p>
            ) : (
              weakTopicsArray.slice(0, 3).map((w, idx) => (
                <div key={idx} className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{w.lessonTitle}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{w.reason}</p>
                  
                  <button
                    onClick={() => handleSuggestionClick(`Help me review: ${w.lessonTitle}. Give me a summary and custom quiz questions.`)}
                    className="text-[9px] text-amber-600 dark:text-amber-400 hover:underline font-bold mt-2 block"
                  >
                    Generate Study Sheet
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

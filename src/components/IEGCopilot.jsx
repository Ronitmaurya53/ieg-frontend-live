import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Cpu } from 'lucide-react';
import { apiClient } from '../api/client';

export default function IEGCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'System Online. I am IEG Copilot. How can I assist with telemetry or security today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to IEG Neural Net.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-3 sm:mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-8rem)] sm:h-[500px] max-h-[750px] bg-slate-900/90 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-slate-950 p-3 sm:p-4 border-b border-slate-800 flex justify-between items-center relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500">
                  <Bot size={18} className="text-blue-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">IEG Copilot</h3>
                <p className="text-[10px] text-blue-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} /> Neural Net Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-slate-900 to-slate-950">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="shrink-0 mt-1">
                  {msg.role === 'ai' ? (
                     <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center border border-blue-500/50">
                       <Cpu size={12} className="text-blue-400" />
                     </div>
                  ) : (
                    <div className="w-6 h-6 bg-emerald-600/20 rounded flex items-center justify-center border border-emerald-500/50">
                      <span className="text-[10px] font-bold text-emerald-400">U</span>
                    </div>
                  )}
                </div>
                <div className={`p-2.5 sm:p-3 rounded-2xl text-sm leading-relaxed break-words ${
                  msg.role === 'user' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-50 rounded-tr-sm' 
                  : 'bg-slate-800/50 border border-slate-700 text-slate-200 rounded-tl-sm shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                <div className="shrink-0 mt-1">
                  <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center border border-blue-500/50">
                    <Bot size={12} className="text-blue-400" />
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 size={14} className="text-blue-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-mono">Processing telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask IEG Copilot..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center hover:scale-110 transition-transform relative group border-2 border-slate-950"
      >
        {isOpen ? <X size={20} className="text-white sm:w-6 sm:h-6" /> : <Bot size={20} className="text-white sm:w-6 sm:h-6" />}
        {/* Radar Ping Animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-75"></span>
        )}
      </button>
      
    </div>
  );
}
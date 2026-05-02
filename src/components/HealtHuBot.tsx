import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { getHelthUResponse } from '../services/geminiService';

const HealtHuBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Prepare history for Gemini API
    const history = chatHistory.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const response = await getHelthUResponse(userMsg, history);
    setChatHistory(prev => [...prev, { role: 'model', text: response || 'I missed that, could you repeat?' }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 ${
              isMinimized ? 'w-72 h-16' : 'w-[22rem] h-[32rem]'
            }`}
          >
            {/* Header */}
            <div className={`p-4 bg-slate-900 text-white flex items-center justify-between transition-all ${isMinimized ? 'h-full' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-none">HealtHu AI</h3>
                  {!isMinimized && <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Virtual Assistant</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
                >
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mb-2">How can I help you today?</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Ask me about your symptoms, lab results, or how to use MedVault.
                      </p>
                    </div>
                  )}

                  {chatHistory.map((chat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        chat.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        {chat.text}
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">HealtHu thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your health query..."
                      className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!message.trim() || loading}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shrink-0 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`w-14 h-14 bg-slate-900 rounded-[1.5rem] shadow-2xl flex items-center justify-center text-white transition-all ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" />
      </motion.button>
    </div>
  );
};

export default HealtHuBot;


import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askManualExpert, askWebAgent } from '../services/geminiService';
import { ChatMessage, AiMode } from '../types';

const AiAssistant: React.FC = () => {
  const [mode, setMode] = useState<AiMode>(AiMode.MANUAL_EXPERT);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '您好！我是您的几内亚派驻智能助手。\n\n💡 **手册专家**：精准回答关于疫苗、物资、行程、安保等问题。\n\n🌐 **全网搜索**：需要了解汇率、天气或实时新闻时，请切换到此模式。',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let result;
      // ARTIFICIAL DELAY FOR UX (So it doesn't feel "too" instant/fake, just fast)
      // For local expert, we give it a tiny delay.
      
      if (mode === AiMode.MANUAL_EXPERT) {
        // Pure Local Call - No Network
        const text = await askManualExpert(userMsg.text);
        // Simulate a tiny processing time for better UX (optional, can be removed for 0ms)
        await new Promise(resolve => setTimeout(resolve, 300)); 
        result = { text, groundingChunks: [] };
      } else {
        // Web Search - Network Call
        result = await askWebAgent(userMsg.text);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        // Only show "Thinking" indicator if we are in Manual mode AND the response took longer than 2 seconds (implying deep thinking fallback)
        isThinking: mode === AiMode.MANUAL_EXPERT && (Date.now() - userMsg.timestamp.getTime() > 2000),
        groundingMetadata: result.groundingChunks
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "系统繁忙，请稍后重试。",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <div className="glass-panel p-4 flex justify-between items-center z-10 sticky top-0 shadow-sm">
        <div className="flex items-center">
          <div className={`p-2.5 rounded-xl mr-3 shadow-sm transition-colors duration-300 ${mode === AiMode.MANUAL_EXPERT ? 'bg-indigo-600 text-white' : 'bg-blue-500 text-white'}`}>
             {mode === AiMode.MANUAL_EXPERT ? <Sparkles size={18}/> : <Globe size={18}/>}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">
              {mode === AiMode.MANUAL_EXPERT ? '手册专家助手' : '全网实时搜索'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {mode === AiMode.MANUAL_EXPERT ? '本地部署 · 毫秒级响应' : '联网查询 · Google Search'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Pill */}
        <div className="bg-slate-100/80 p-1.5 rounded-full flex relative border border-slate-200 shadow-inner">
          <button
            onClick={() => setMode(AiMode.MANUAL_EXPERT)}
            className={`relative z-10 px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 flex items-center ${mode === AiMode.MANUAL_EXPERT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Sparkles size={14} className="mr-1.5" />
            手册
          </button>
          <button
            onClick={() => setMode(AiMode.WEB_SEARCH)}
            className={`relative z-10 px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 flex items-center ${mode === AiMode.WEB_SEARCH ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Globe size={14} className="mr-1.5" />
            搜索
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-slide-in-right ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[75%] items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mb-1 border ${
                msg.role === 'user' 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-slate-200'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={16} className={`text-${mode === AiMode.MANUAL_EXPERT ? 'indigo' : 'blue'}-600`} />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 md:p-5 rounded-2xl shadow-sm text-sm leading-7 transition-all ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-br-none shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
              }`}>
                {/* Thinking Indicator inside message */}
                {msg.isThinking && msg.role === 'model' && (
                  <div className="mb-3 flex items-center text-[10px] text-indigo-500 font-bold bg-indigo-50 w-fit px-2 py-1 rounded-md uppercase tracking-wider border border-indigo-100">
                    <Sparkles size={10} className="mr-1.5" /> Deep Thinking
                  </div>
                )}
                
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Search Sources */}
                {msg.groundingMetadata && msg.groundingMetadata.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-1 gap-2">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">参考来源</p>
                    {msg.groundingMetadata.map((chunk: any, idx: number) => {
                      if (chunk.web?.uri) {
                        return (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-blue-600 transition-all border border-slate-200 hover:border-blue-300 group">
                             <div className="bg-white p-1 rounded border border-slate-100 mr-2 shadow-sm group-hover:scale-110 transition-transform">
                               <Globe size={12} className="text-blue-400"/>
                             </div>
                             <span className="truncate flex-1 font-medium">{chunk.web.title || "网页链接"}</span>
                             <ExternalLink size={12} className="ml-2 text-slate-400 group-hover:text-blue-400" />
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start w-full animate-pulse">
             <div className="flex max-w-[80%] flex-row items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-1">
                   <Bot size={16} className="text-slate-300" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                   <div className="flex space-x-1.5 items-center h-5">
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   </div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={mode === AiMode.MANUAL_EXPERT ? "搜索手册内容 (如: 疫苗、用餐时间、紧急电话)..." : "搜索实时信息..."}
              className="w-full pl-5 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-800 shadow-inner group-hover:bg-white"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
              !input.trim() || isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/30'
            }`}
          >
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;

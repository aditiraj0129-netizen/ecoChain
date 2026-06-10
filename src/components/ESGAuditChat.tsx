import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Sparkles, MessageCircle, AlertCircle, HelpCircle, ArrowDown } from 'lucide-react';
import { ChatMessage, ProductESGBrief, SandboxSettings } from '../types';

interface ESGAuditChatProps {
  currentBrief: ProductESGBrief | null;
  settings: SandboxSettings;
  chatHistory: ChatMessage[];
  onSendMessage: (messageText: string) => Promise<void>;
  isSending: boolean;
}

export default function ESGAuditChat({
  currentBrief,
  settings,
  chatHistory,
  onSendMessage,
  isSending,
}: ESGAuditChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetAuditQueries = [
    "Identify materials risk & advise bio-alternatives.",
    "Recommend shipping carbon mitigation pathways.",
    "Draft a corporate ESG bullet proof report outline."
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
  };

  const handleQueryPreset = async (preset: string) => {
    if (isSending) return;
    await onSendMessage(preset);
  };

  // Keep chat scrolled down when message history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="bg-white border-2 border-[#141414] rounded-none flex flex-col h-[520px] overflow-hidden">
      {/* 1. Header */}
      <div className="bg-[#e4e3e0]/40 px-4 py-3 flex items-center justify-between border-b-2 border-[#141414]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#141414] text-white">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#141414] tracking-tight flex items-center gap-1.5 font-sans">
              EcoChain AI Auditor
            </h3>
            <span className="text-[10px] font-mono text-[#141414]/75 block font-bold">Scope 3 LLM Expert Ready</span>
          </div>
        </div>

        {currentBrief && (
          <span className="text-[10px] text-[#141414]/70 font-mono hidden sm:inline font-bold">
            Active: {currentBrief.productName}
          </span>
        )}
      </div>

      {/* 2. Messages Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
        {chatHistory.length === 0 ? (
          <div className="my-auto text-center space-y-4 px-4 py-8">
            <div className="inline-flex p-3 bg-[#e4e3e0]/50 rounded-full text-[#141414] border border-[#141414]">
              <MessageCircle className="h-8 w-8 text-[#141414]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#141414] uppercase tracking-wider font-sans">Interactive ESG Auditing Portal</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed font-sans">
                Consult with our server-side environmental auditor on how material adjustments, coal-free energy conversions, or take-back lifecycles improve Scope 3 reporting metrics.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-850 text-left">
              <span className="text-[9px] font-mono uppercase font-black text-[#141414]/65 block mb-2 text-center">
                Suggest auditing run:
              </span>
              <div className="flex flex-col gap-1.5">
                {presetAuditQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQueryPreset(query)}
                    disabled={isSending}
                    className="w-full text-left font-mono text-[10px] text-[#141414] hover:text-[#fff] bg-white hover:bg-[#141414] px-2.5 py-2 rounded-none border border-[#141414] transition cursor-pointer font-semibold"
                  >
                    ⚙️ {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {chatHistory.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isAssistant ? 'self-start' : 'self-end'}`}
                >
                  <span className={`text-[9px] font-mono text-slate-500 mb-1 ${!isAssistant && 'text-right'}`}>
                    {isAssistant ? 'ESG Auditor' : 'You'} • {msg.timestamp}
                  </span>
                  <div
                    className={`p-3.5 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-950/25 text-[#141414] border border-[#141414] rounded-none font-mono whitespace-pre-line font-medium'
                        : 'bg-[#141414] text-white font-bold font-sans rounded-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex flex-col max-w-[80%] self-start">
                <span className="text-[9px] font-mono text-slate-500 mb-1">ESG Auditor • Processing...</span>
                <div className="bg-[#e4e3e0]/20 rounded-none p-3 border border-[#141414] flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-[#141414] rounded-full animate-bounce delay-100" />
                    <span className="h-1.5 w-1.5 bg-[#141414] rounded-full animate-bounce delay-200" />
                    <span className="h-1.5 w-1.5 bg-[#141414] rounded-full animate-bounce delay-300" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold">Running environmental models...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Input Form */}
      <form onSubmit={handleSend} className="bg-[#e4e3e0]/40 border-t-2 border-[#141414] p-2.5 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentBrief ? "Ask auditor about this supply chain..." : "Please generate a product first..."}
          disabled={!currentBrief || isSending}
          className="flex-1 bg-white border border-[#141414] focus:outline-none text-[#141414] text-xs rounded-none px-3 py-2 disabled:opacity-50 font-mono"
        />
        <button
          type="submit"
          disabled={!currentBrief || !inputText.trim() || isSending}
          className="p-2 bg-[#141414] hover:bg-[#2c2c2c] active:bg-[#000000] text-white text-xs font-bold rounded-none border border-[#141414] transition shrink-0 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

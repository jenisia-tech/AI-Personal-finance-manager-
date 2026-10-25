import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { aiAdvisorService, ChatMessage } from '../../services/aiAdvisorService';

interface ChatInterfaceProps {
  onOpenLab?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpenLab }) => {
  const { transactions, budgets, goals, userProfile, activeGoalId, activeMonth } = useFinance();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-msg',
      sender: 'bot',
      text: `Hello ${userProfile.name}! I am FinBot, your autonomous financial advisor. I analyze your live transactions, budgets, and savings goals in real-time. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: [
        'How healthy is my budget?',
        'Where am I overspending?',
        'What does the agent recommend?',
        'Tips to save ₹5,000',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate brief AI reasoning latency
    setTimeout(async () => {
      const response = await aiAdvisorService.generateChatResponse(
        query,
        transactions,
        budgets,
        goals,
        userProfile,
        activeGoalId,
        activeMonth
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: response.chips,
        recommendation: response.recommendation,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-apple-gray-100 dark:border-apple-gray-800 flex items-center justify-between bg-apple-gray-50/50 dark:bg-apple-gray-850/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-apple-md bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white shadow-apple-pill">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-apple-gray-900 dark:text-white">
                FinBot Intelligence Assistant
              </span>
              <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
            </div>
            <p className="text-[10px] text-apple-gray-400">
              Offline Rule-Based Deterministic Engine • CO1 Agent Integrated
            </p>
          </div>
        </div>

        {onOpenLab && (
          <button
            onClick={onOpenLab}
            className="flex items-center gap-1.5 px-3 py-1 bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-semibold rounded-full border border-apple-blue/20 transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Algorithms Lab</span>
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isBot
                    ? 'bg-gradient-to-tr from-apple-blue to-apple-purple text-white'
                    : 'bg-apple-gray-200 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-300'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-apple-lg text-xs leading-relaxed ${
                    isBot
                      ? 'bg-apple-gray-100 dark:bg-[#1C1C20] text-apple-gray-800 dark:text-apple-gray-100 border border-apple-gray-200/40 dark:border-apple-gray-800'
                      : 'bg-apple-blue text-white shadow-apple-pill'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      isBot ? 'text-apple-gray-400' : 'text-blue-100'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Optional Quick-Prompt Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 bg-white dark:bg-apple-gray-850 hover:bg-apple-blue hover:text-white border border-apple-gray-200 dark:border-apple-gray-800 rounded-full text-[11px] font-medium text-apple-gray-700 dark:text-apple-gray-300 transition shadow-xs"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-apple-gray-400 p-2">
            <Bot className="w-4 h-4 animate-spin text-apple-blue" />
            <span>FinBot is evaluating financial facts...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-apple-gray-100 dark:border-apple-gray-800 bg-white dark:bg-apple-darkCard flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FinBot about spending, budgets, savings, or risk..."
          className="flex-1 px-3.5 py-2.5 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-md text-xs text-apple-gray-900 dark:text-white placeholder-apple-gray-400 outline-none focus:ring-2 focus:ring-apple-blue"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 bg-apple-blue hover:bg-apple-blue-hover disabled:opacity-40 text-white rounded-apple-md transition shadow-apple-pill"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

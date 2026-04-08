import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isGeneratingImage?: boolean;
};

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isTyping 
}: { 
  messages: Message[], 
  onSendMessage: (text: string) => void,
  isTyping: boolean
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-serif text-xl font-medium">Design Assistant</h3>
        <p className="text-sm text-gray-500">Ask for advice, shopping links, or request design changes.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <p className="text-center max-w-xs">
              I'm your AI Design Consultant. Try asking:
              <br />
              <span className="italic text-gray-500 mt-2 block">"Where can I buy a similar sofa?"</span>
              <span className="italic text-gray-500 block">"Make the walls dark green."</span>
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-ink text-white rounded-tr-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.isGeneratingImage ? (
                  <div className="flex items-center gap-2 text-accent font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating new design...
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-ink text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

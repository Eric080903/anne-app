'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { anneWS } from '@/lib/ws';
import { useChatStore } from '@/stores/chat-store';

// =============================================================================
// Simple markdown renderer
// =============================================================================

function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_ (but not inside bold markers)
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-xs">$1</code>')
    // Unordered list items: - item or * item
    .replace(/^[\-\*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered list items: 1. item
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
}

// =============================================================================
// Message Bubble
// =============================================================================

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  const time = new Date(timestamp);
  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-full shrink-0',
          isUser ? 'bg-blue-600' : 'bg-zinc-700'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-zinc-300" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div
            className="prose-invert max-w-none [&_li]:my-0.5"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        <p
          className={cn(
            'text-[10px] mt-1.5',
            isUser ? 'text-blue-200' : 'text-zinc-500'
          )}
        >
          {timeStr}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Thinking Indicator
// =============================================================================

function ThinkingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%]">
      <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-zinc-700">
        <Bot className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-zinc-400 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Anne is thinking</span>
        <span className="inline-flex">
          <span className="animate-[bounce_1.4s_ease-in-out_infinite]">.</span>
          <span className="animate-[bounce_1.4s_ease-in-out_0.2s_infinite]">.</span>
          <span className="animate-[bounce_1.4s_ease-in-out_0.4s_infinite]">.</span>
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Chat Page
// =============================================================================

export default function ChatPage() {
  const { messages, isThinking, addMessage, setThinking } = useChatStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedHistory = useRef(false);

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom
  // ---------------------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  // ---------------------------------------------------------------------------
  // Load chat history on mount
  // ---------------------------------------------------------------------------

  useQuery({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const res = await api.chat.history();
      if (!hasLoadedHistory.current && res.messages && res.messages.length > 0) {
        hasLoadedHistory.current = true;
        // Populate store with history if store is empty
        if (messages.length === 0) {
          res.messages.forEach((msg) => {
            addMessage(msg.role, msg.content);
          });
        }
      }
      return res;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // ---------------------------------------------------------------------------
  // WebSocket listeners for real-time events
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleThinking = () => {
      setThinking(true);
    };

    const handleResponse = (data: any) => {
      if (data?.message || data?.content) {
        addMessage('assistant', data.message || data.content);
      }
      setThinking(false);
    };

    const handleError = (data: any) => {
      addMessage(
        'assistant',
        `Sorry, something went wrong: ${data?.message || 'Unknown error'}`
      );
      setThinking(false);
    };

    anneWS.on('agent:thinking', handleThinking);
    anneWS.on('agent:response', handleResponse);
    anneWS.on('agent:error', handleError);

    return () => {
      anneWS.off('agent:thinking', handleThinking);
      anneWS.off('agent:response', handleResponse);
      anneWS.off('agent:error', handleError);
    };
  }, [addMessage, setThinking]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput('');
    setIsSending(true);
    addMessage('user', text);
    setThinking(true);

    try {
      const res = await api.chat.send(text);
      // The API returns { reply, messages } - add the assistant reply
      if (res.reply) {
        addMessage('assistant', res.reply);
      }
    } catch (err: any) {
      addMessage(
        'assistant',
        `Sorry, I encountered an error: ${err?.message || 'Failed to send message'}`
      );
    } finally {
      setThinking(false);
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [input, isSending, addMessage, setThinking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Chat with Anne</h1>
          <p className="text-xs text-zinc-500">AI Trading Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !isThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-zinc-800 mb-4">
              <Bot className="h-8 w-8 text-zinc-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-1">
              Start a conversation
            </h2>
            <p className="text-sm text-zinc-500 max-w-sm">
              Ask Anne about market analysis, trading strategies, portfolio
              review, or request a daily report.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                'Give me a daily market report',
                'What is AAPL doing today?',
                'Analyze my portfolio',
                'Show watchlist',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 transition-colors border border-zinc-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isThinking && <ThinkingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Anne anything..."
            disabled={isSending}
            className={cn(
              'flex-1 h-11 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200',
              'placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40',
              'transition-colors disabled:opacity-50'
            )}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className={cn(
              'flex items-center justify-center h-11 w-11 rounded-xl transition-colors',
              input.trim() && !isSending
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            )}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-2">
          Anne can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

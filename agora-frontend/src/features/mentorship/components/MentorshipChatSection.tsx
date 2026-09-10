import { useState, useEffect, useRef } from 'react';
import { Send, Lock, GraduationCap, MessageSquare } from 'lucide-react';
import type { MentorshipMessage } from '@/types/mentorship';

type MentorshipChatSectionProps = {
  messages: MentorshipMessage[];
  currentUserId?: string;
  onSendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
};

export const MentorshipChatSection = ({
  messages = [],
  currentUserId,
  onSendMessage,
  isLoading = false,
}: MentorshipChatSectionProps) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    const res = await onSendMessage(text);
    setIsSending(false);

    if (res.success) {
      setInputText('');
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] flex flex-col h-[460px] sm:h-[520px] overflow-hidden">
      {/* Header do Chat */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--agora-border)] bg-[var(--agora-card-bg)] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#0a5c2f]/10 text-[#0a5c2f] flex-shrink-0">
            <Lock size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-[var(--agora-ink)] flex items-center gap-1.5 truncate">
              Canal Privado de Orientação
            </h3>
            <p className="text-[10px] text-[var(--agora-muted)] truncate sm:whitespace-normal">
              Espaço restrito para dúvidas, dicas e alinhamentos entre os alunos e o orientador
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-[var(--agora-muted)] flex-shrink-0 whitespace-nowrap">
          {messages.length} msg{messages.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Área das Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-[var(--agora-muted)]">
            Carregando mensagens da mentoria...
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--agora-muted)]">
            <MessageSquare size={36} className="opacity-30 mb-2" />
            <p className="text-xs font-semibold text-[var(--agora-ink)]">Inicie a conversa!</p>
            <p className="text-[11px] max-w-xs mt-0.5">
              Compartilhe dúvidas sobre o projeto, agende reuniões ou peça dicas diretamente para o professor.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isProf = msg.senderRole === 'Professor';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              {msg.senderPhotoUrl ? (
                <img
                  src={msg.senderPhotoUrl}
                  alt={msg.senderName}
                  className="h-7 w-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
              ) : (
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 ${
                    isProf ? 'bg-[#0a5c2f]' : 'bg-emerald-600'
                  }`}
                >
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Balão de Mensagem */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                  isMe
                    ? 'bg-[#0a5c2f] text-white rounded-tr-none'
                    : isProf
                    ? 'bg-[var(--agora-card-bg)] border-2 border-[#0a5c2f]/40 text-[var(--agora-ink)] rounded-tl-none'
                    : 'bg-[var(--agora-card-bg)] border border-[var(--agora-border)] text-[var(--agora-ink)] rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`font-bold text-[11px] ${isMe ? 'text-white' : 'text-[var(--agora-ink)]'}`}>
                    {msg.senderName}
                  </span>
                  {isProf && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isMe ? 'bg-white/20 text-white' : 'bg-[#0a5c2f]/15 text-[#0a5c2f]'
                      }`}
                    >
                      <GraduationCap size={10} />
                      Orientador
                    </span>
                  )}
                  <span className={`text-[10px] ml-auto ${isMe ? 'text-white/70' : 'text-[var(--agora-muted)]'}`}>
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                <p className="leading-relaxed whitespace-pre-line break-words">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envio */}
      <form onSubmit={handleSend} className="p-3 border-t border-[var(--agora-border)] bg-[var(--agora-card-bg)] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escreva uma mensagem para a equipe e o orientador..."
          className="flex-1 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3.5 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2 rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white disabled:opacity-40 transition-colors flex-shrink-0 shadow-sm"
          title="Enviar mensagem"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

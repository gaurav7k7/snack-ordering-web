import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFloatingActionOffset } from '@/hooks/useFloatingActionOffset';
import { cn } from '@/utils/cn';

const GREETING = "Hey there! 👋 Live chat is coming soon — for now, drop us a message and we'll reply by email.";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const bottomOffset = useFloatingActionOffset();

  return (
    <div className="fixed left-6 z-40 transition-[bottom]" style={{ bottom: bottomOffset }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 left-0 w-72 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-soft-lg sm:w-80"
          >
            <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-primary-foreground">
              <p className="text-sm font-bold">Lotus Delight Support</p>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <p className="rounded-xl bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">{GREETING}</p>
              {sent ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Thanks! We&apos;ll get back to you at your account email shortly.
                </p>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!message.trim()) return;
                    setSent(true);
                    setMessage('');
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type a message…"
                    className="h-9 flex-1 rounded-full border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Send message">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        size="icon"
        className={cn('h-12 w-12 rounded-full shadow-soft-lg', isOpen && 'bg-muted text-foreground hover:bg-muted')}
        aria-label={isOpen ? 'Close live chat' : 'Open live chat'}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSent(false);
        }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </div>
  );
}

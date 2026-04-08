import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationsApi } from '../api/client';

const FALLBACK_MESSAGES = [
  { text: 'Прямо сейчас кто-то интересуется Муркой', icon: '❤️' },
  { text: 'Сегодня мы получили 5 кг корма, спасибо!', icon: '✨' },
  { text: '3 человека просматривают анкету Шарика', icon: '👀' },
  { text: 'Ура! Кот Снежок сегодня уехал в новую семью', icon: '🎉' },
  { text: 'Мы обновили фотографии в разделе «Наши подопечные»', icon: '📸' },
];

export const SmartNotifications = () => {
  const [currentMsg, setCurrentMsg] = useState<{ text: string; icon: string } | null>(null);
  const shownIds = useRef<Set<number>>(new Set());

  const show = (text: string, icon: string) => {
    setCurrentMsg({ text, icon });
    setTimeout(() => setCurrentMsg(null), 6000);
  };

  const tryShowReal = async (): Promise<boolean> => {
    if (!localStorage.getItem('jandos_token')) return false;
    try {
      const { notifications } = await notificationsApi.getMy();
      const unseen = notifications.filter(
        (n: any) => !n.is_read && !shownIds.current.has(n.id),
      );
      if (unseen.length === 0) return false;
      const n = unseen[0];
      shownIds.current.add(n.id);
      show(n.title, '🔔');
      return true;
    } catch {
      return false;
    }
  };

  const showFallback = () => {
    const msg = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
    show(msg.text, msg.icon);
  };

  useEffect(() => {
    const initial = setTimeout(async () => {
      const hadReal = await tryShowReal();
      if (!hadReal) showFallback();
    }, 10_000);

    const interval = setInterval(async () => {
      if (Math.random() > 0.4) {
        const hadReal = await tryShowReal();
        if (!hadReal) showFallback();
      }
    }, 45_000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed top-24 right-8 z-[9997] pointer-events-none max-w-[320px]">
      <AnimatePresence>
        {currentMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-100 p-4 rounded-2xl flex items-center gap-4 pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center shrink-0 text-xl">
              {currentMsg.icon}
            </div>
            <p className="text-[14px] text-[#1A1A1A] font-medium leading-tight">
              {currentMsg.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

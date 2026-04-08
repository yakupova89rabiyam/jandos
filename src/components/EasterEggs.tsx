import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PET_MESSAGES = [
  "Рекс только что пообедал и передает вам привет! 🦴",
  "Кошка Луна нашла солнечный зайчик и очень счастлива ☀️",
  "Барсик сегодня особенно игрив и ждет гостей 🧶",
  "Белка выучила новую команду и гордится собой! 🐾",
  "Малыш Грей сладко спит и видит сны о новом доме 😴",
  "Альма передает вам 'Гав!' и виляет хвостиком 🐕",
  "Снежок сегодня съел лишнюю порцию вкусняшек 😋"
];

export const EasterEggs = () => {
  const [showKitten, setShowKitten] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Kitten easter egg: appears after 45 seconds of inactivity/staying on page
    const kittenTimer = setTimeout(() => {
      setShowKitten(true);
      // Hide after animation finishes (approx 5s)
      setTimeout(() => setShowKitten(false), 6000);
    }, 45000);

    // Random pet notifications: every 60-90 seconds
    const showNotification = () => {
      const randomMsg = PET_MESSAGES[Math.floor(Math.random() * PET_MESSAGES.length)];
      setNotification(randomMsg);
      setTimeout(() => setNotification(null), 5000);
    };

    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance to show every minute
        showNotification();
      }
    }, 60000);

    // Initial notification after 15 seconds
    const initialNotification = setTimeout(showNotification, 15000);

    return () => {
      clearTimeout(kittenTimer);
      clearInterval(notificationInterval);
      clearTimeout(initialNotification);
    };
  }, []);

  return (
    <>
      {/* Running Kitten Easter Egg */}
      <AnimatePresence>
        {showKitten && (
          <motion.div
            initial={{ x: '-100%', y: '100%' }}
            animate={{ 
              x: ['-10%', '110%'],
              y: ['90%', '90%'],
              rotate: [0, 5, -5, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 6, 
              ease: "linear",
              rotate: { repeat: Infinity, duration: 0.5 }
            }}
            className="fixed bottom-0 left-0 z-[9999] pointer-events-none"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=200&auto=format&fit=crop" 
                alt="Kitten" 
                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-xl"
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                Мяу! Пробегаю мимо.. 🐾
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Status Notifications */}
      <div className="fixed bottom-8 left-8 z-[9998] pointer-events-none max-w-[300px]">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className="bg-white/90 backdrop-blur-md border border-[#6052B3]/20 p-4 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center shrink-0">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <p className="text-[14px] text-[#1A1A1A] font-medium leading-tight">
                  {notification}
                </p>
                <p className="text-[10px] text-[#6052B3] font-bold uppercase tracking-wider mt-1">
                  Новости приюта
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

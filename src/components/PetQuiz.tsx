import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const questions = [
  {
    id: 'housing',
    question: 'Где вы живете?',
    options: [
      { id: 'apartment', label: 'Квартира', icon: '🏢' },
      { id: 'house', label: 'Частный дом', icon: '🏡' }
    ]
  },
  {
    id: 'activity',
    question: 'Ваш уровень активности?',
    options: [
      { id: 'low', label: 'Спокойный (люблю диван)', icon: '🛋️' },
      { id: 'medium', label: 'Средний (прогулки в парке)', icon: '🌳' },
      { id: 'high', label: 'Активный (бег, походы)', icon: '🏃' }
    ]
  },
  {
    id: 'children',
    question: 'Есть ли в доме дети?',
    options: [
      { id: 'yes', label: 'Да, есть маленькие дети', icon: '👶' },
      { id: 'no', label: 'Нет детей или уже взрослые', icon: '👨‍👩‍👧‍👦' }
    ]
  },
  {
    id: 'experience',
    question: 'Был ли у вас опыт с животными?',
    options: [
      { id: 'beginner', label: 'Это будет мой первый друг', icon: '🥚' },
      { id: 'experienced', label: 'Я опытный хозяин', icon: '🎓' }
    ]
  }
];

export const PetQuiz = ({ onComplete }: { onComplete: (results: any) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: optionId };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
      onComplete(newAnswers);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#F0F0F0]">
      {!isFinished ? (
        <div className="flex flex-col h-full">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#F0EFFF] rounded-full mb-12 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#6052B3] rounded-full"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h3 className="text-[24px] md:text-[32px] font-bold text-[#1A1A1A] mb-10 text-center">
                {questions[currentStep].question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="group relative flex flex-col items-center justify-center p-8 rounded-[24px] border-2 border-[#F0F0F0] hover:border-[#6052B3] hover:bg-[#F0EFFF]/30 transition-all duration-300"
                  >
                    <span className="text-4xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                      {option.icon}
                    </span>
                    <span className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#6052B3]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center text-[#A0A0A0] text-sm font-medium">
            <span>Вопрос {currentStep + 1} из {questions.length}</span>
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-[#6052B3] hover:underline"
              >
                Назад
              </button>
            )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-[#E9F7EF] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 className="text-[32px] font-bold text-[#1A1A1A] mb-4">Готово!</h3>
          <p className="text-[#666666] text-lg mb-10">
            Мы подобрали для вас идеальных друзей на основе ваших ответов.
          </p>
          <button 
            onClick={() => {
              setIsFinished(false);
              setCurrentStep(0);
              setAnswers({});
            }}
            className="text-[#6052B3] font-bold hover:underline"
          >
            Пройти еще раз
          </button>
        </motion.div>
      )}
    </div>
  );
};

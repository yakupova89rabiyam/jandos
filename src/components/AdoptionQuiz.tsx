import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Calendar, Home, Heart, Wallet, Info } from 'lucide-react';

interface QuizData {
  household: string;
  housingType: string;
  landlordPermission: string;
  hasExperience: string;
  currentPets: string;
  financialReady: string;
  meetingDate: string;
  meetingTime: string;
}

export const AdoptionQuiz = ({ pet, onClose, onComplete }: { pet: any, onClose: () => void, onComplete: (data: QuizData) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuizData>({
    household: '',
    housingType: '',
    landlordPermission: '',
    hasExperience: '',
    currentPets: '',
    financialReady: '',
    meetingDate: '',
    meetingTime: ''
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateData = (field: keyof QuizData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3]">
                <Home size={20} />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A]">Ваши жилищные условия</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[14px] font-medium text-[#666666]">Где вы планируете содержать питомца?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Квартира', 'Частный дом', 'Съемное жилье', 'Другое'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateData('housingType', type)}
                    className={`px-4 py-3 rounded-xl text-[14px] font-medium border-2 transition-all ${
                      data.housingType === type 
                        ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' 
                        : 'border-[#E5E5E5] text-[#666666] hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {data.housingType === 'Съемное жилье' && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[13px] text-amber-800 flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    Для съемного жилья нам потребуется подтверждение согласия арендодателя.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3]">
                <Heart size={20} />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A]">Опыт и семья</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[14px] font-medium text-[#666666]">Был ли у вас опыт содержания животных?</p>
              <div className="flex gap-3">
                {['Да', 'Нет'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateData('hasExperience', opt)}
                    className={`flex-1 px-4 py-3 rounded-xl text-[14px] font-medium border-2 transition-all ${
                      data.hasExperience === opt 
                        ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' 
                        : 'border-[#E5E5E5] text-[#666666] hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-[14px] font-medium text-[#666666] mt-4">Есть ли у вас другие животные сейчас?</p>
              <textarea
                placeholder="Например: собака (3 года), кот (1 год)..."
                value={data.currentPets}
                onChange={(e) => updateData('currentPets', e.target.value)}
                className="w-full bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] min-h-[100px]"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3]">
                <Wallet size={20} />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A]">Готовность к ответственности</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[14px] font-medium text-[#666666]">Готовы ли вы к ежегодным тратам на ветеринара и качественный корм?</p>
              <div className="flex flex-col gap-3">
                {[
                  'Да, полностью осознаю расходы',
                  'Да, но в разумных пределах',
                  'Пока не уверен(а)'
                ].map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateData('financialReady', opt)}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] font-medium border-2 text-left transition-all ${
                      data.financialReady === opt 
                        ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' 
                        : 'border-[#E5E5E5] text-[#666666] hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3]">
                <Calendar size={20} />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A]">Запись на знакомство</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[14px] font-medium text-[#666666]">Выберите удобную дату для визита в приют</p>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i + 1);
                  const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                  const fullDate = date.toISOString().split('T')[0];
                  return (
                    <button
                      key={i}
                      onClick={() => updateData('meetingDate', fullDate)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                        data.meetingDate === fullDate 
                          ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' 
                          : 'border-[#E5E5E5] text-[#666666] hover:border-gray-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-60">
                        {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </span>
                      <span className="text-[14px] font-bold">{dateStr}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[14px] font-medium text-[#666666] mt-4">Удобное время</p>
              <div className="grid grid-cols-3 gap-2">
                {['10:00', '12:00', '14:00', '16:00', '18:00'].map(time => (
                  <button
                    key={time}
                    onClick={() => updateData('meetingTime', time)}
                    className={`py-2 rounded-lg border-2 text-[14px] font-medium transition-all ${
                      data.meetingTime === time 
                        ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' 
                        : 'border-[#E5E5E5] text-[#666666] hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
              <Heart size={40} fill="currentColor" />
            </div>
            <h3 className="text-[24px] font-bold text-[#1A1A1A]">Почти готово!</h3>
            <p className="text-[#666666] text-[15px] leading-relaxed">
              Вы ответили на все вопросы. Теперь мы сможем лучше подготовиться к вашему визиту и знакомству с <strong>{pet.name}</strong>.
            </p>
            <div className="bg-[#F5F5F5] rounded-2xl p-6 text-left space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#888888]">Питомец:</span>
                <span className="font-bold text-[#1A1A1A]">{pet.name}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#888888]">Визит:</span>
                <span className="font-bold text-[#1A1A1A]">
                  {data.meetingDate ? new Date(data.meetingDate).toLocaleDateString('ru-RU') : '-'}, {data.meetingTime}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!data.housingType;
      case 2: return !!data.hasExperience;
      case 3: return !!data.financialReady;
      case 4: return !!data.meetingDate && !!data.meetingTime;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[540px] bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#6052B3] uppercase tracking-wider">Анкета: Приютить питомца</span>
            <div className="flex gap-1 mt-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 <= step ? 'w-8 bg-[#6052B3]' : 'w-4 bg-[#E5E5E5]'
                  }`} 
                />
              ))}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-[#E5E5E5] text-[#666666] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
              Назад
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-[2] px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              isStepValid() 
                ? 'bg-[#6052B3] text-white shadow-lg shadow-[#6052B3]/20 hover:bg-[#4A3E90]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === totalSteps ? 'Отправить заявку' : 'Продолжить'}
            {step < totalSteps && <ChevronRight size={20} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

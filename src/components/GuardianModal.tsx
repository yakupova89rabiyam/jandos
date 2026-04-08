import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShieldCheck, CreditCard, Camera, Info } from 'lucide-react';

interface GuardianModalProps {
  pet: any;
  onClose: () => void;
  onConfirm: (type: 'food' | 'treatment', amount: number) => void;
}

export const GuardianModal = ({ pet, onClose, onConfirm }: GuardianModalProps) => {
  const [type, setType] = useState<'food' | 'treatment'>('food');
  const [amount, setAmount] = useState(5000);
  const [step, setStep] = useState(1);

  const options = {
    food: [
      { label: 'Неделя питания', value: 3000 },
      { label: 'Месяц питания', value: 12000 },
      { label: 'Премиум рацион (мес)', value: 18000 },
    ],
    treatment: [
      { label: 'Витамины и осмотр', value: 5000 },
      { label: 'Вакцинация', value: 8000 },
      { label: 'Полный чек-ап', value: 25000 },
    ]
  };

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm(type, amount);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
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
        className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#6052B3]" size={24} />
            <h3 className="text-[20px] font-bold text-[#1A1A1A]">Стать опекуном</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 p-4 bg-[#F5F3FF] rounded-2xl">
                  <img src={pet.image} alt={pet.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <p className="text-[14px] text-[#666666]">Вы помогаете:</p>
                    <p className="text-[18px] font-bold text-[#1A1A1A]">{pet.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[14px] font-medium text-[#666666]">Выберите вид помощи:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setType('food'); setAmount(3000); }}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        type === 'food' ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' : 'border-[#E5E5E5] text-[#666666]'
                      }`}
                    >
                      <Heart size={20} />
                      <span className="text-[14px] font-bold">Питание</span>
                    </button>
                    <button
                      onClick={() => { setType('treatment'); setAmount(5000); }}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        type === 'treatment' ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' : 'border-[#E5E5E5] text-[#666666]'
                      }`}
                    >
                      <ShieldCheck size={20} />
                      <span className="text-[14px] font-bold">Лечение</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[14px] font-medium text-[#666666]">Сумма поддержки:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {options[type].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAmount(opt.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                          amount === opt.value ? 'border-[#6052B3] bg-[#6052B3]/5 text-[#6052B3]' : 'border-[#E5E5E5] text-[#666666]'
                        }`}
                      >
                        <span className="text-[14px] font-medium">{opt.label}</span>
                        <span className="font-bold">{opt.value.toLocaleString()} ₸</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                  <Camera className="text-blue-600 shrink-0" size={20} />
                  <p className="text-[12px] text-blue-800 leading-relaxed">
                    Как опекун, вы будете получать персональные фото и видео отчеты о жизни {pet.name} в вашем личном кабинете.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto">
                  <CreditCard size={40} />
                </div>
                <h3 className="text-[24px] font-bold text-[#1A1A1A]">Оплата подписки</h3>
                <p className="text-[#666666] text-[15px]">
                  Сумма <strong>{amount.toLocaleString()} ₸</strong> будет списываться ежемесячно для обеспечения {pet.name} всем необходимым.
                </p>
                <div className="bg-[#F5F5F5] p-6 rounded-2xl space-y-4">
                  <input 
                    type="text" 
                    placeholder="Номер карты" 
                    className="w-full bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] focus:border-[#6052B3] outline-none"
                  />
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="ММ/ГГ" 
                      className="flex-1 bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] focus:border-[#6052B3] outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="CVC" 
                      className="flex-1 bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] focus:border-[#6052B3] outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 pt-4">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#6052B3] text-white py-4 rounded-2xl font-bold text-[16px] hover:bg-[#4A3E90] transition-all shadow-lg shadow-[#6052B3]/20 flex items-center justify-center gap-2"
          >
            {step === 1 ? 'Продолжить' : `Подтвердить ${amount.toLocaleString()} ₸`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, UserPlus, CreditCard, Send } from 'lucide-react';
import { adoptionApi, volunteersApi, fundraisersApi } from '../api/client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-[500px] p-8 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-[24px] font-bold mb-6 text-[#1A1A1A]">{title}</h2>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const AdoptionModal = ({ isOpen, onClose, pet, onSuccess, showToast }: { isOpen: boolean, onClose: () => void, pet: any, onSuccess?: () => void, showToast?: (msg: string, type?: 'success' | 'info') => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    experience: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const msg = `Опыт с животными: ${formData.experience}\nТелефон для связи: ${formData.phone}\n${formData.message}`;
      await adoptionApi.submit(pet.id, msg);
      showToast?.('Заявка успешно отправлена!', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast?.(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Забрать ${pet?.name} домой`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-[#F8F8F8] rounded-2xl flex items-center gap-4 mb-4">
          <img src={pet?.image} alt={pet?.name} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-[#1A1A1A]">{pet?.name}</p>
            <p className="text-[13px] text-[#666666]">{pet?.breed}</p>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 uppercase">Ваш опыт с животными</label>
          <textarea 
            className="w-full p-4 bg-[#F8F8F8] border-none rounded-2xl focus:ring-2 focus:ring-[#6052B3] min-h-[100px]"
            placeholder="Расскажите немного о себе..."
            value={formData.experience}
            onChange={e => setFormData({...formData, experience: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 uppercase">Телефон для связи</label>
          <input 
            type="tel"
            className="w-full p-4 bg-[#F8F8F8] border-none rounded-2xl focus:ring-2 focus:ring-[#6052B3]"
            placeholder="+7 (___) ___-__-__"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
        <button 
          disabled={loading}
          className="w-full py-4 bg-[#6052B3] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A3E90] transition-all disabled:opacity-50"
        >
          <Heart className="w-5 h-5" />
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </Modal>
  );
};

export const VolunteerModal = ({ isOpen, onClose, showToast }: { isOpen: boolean, onClose: () => void, showToast?: (msg: string, type?: 'success' | 'info') => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    availability: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skills = `Телефон: ${formData.phone}\nГотовность: ${formData.availability}`;
      const experience = formData.reason;
      await volunteersApi.apply(skills, experience);
      showToast?.('Заявка волонтера отправлена!', 'success');
      onClose();
    } catch (err: any) {
      showToast?.(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Стать волонтером">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-[#666666] text-[14px] mb-4">Присоединяйтесь к нашей команде и помогайте животным находить новый дом.</p>
        <div>
          <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 uppercase">Почему вы хотите помогать?</label>
          <textarea 
            className="w-full p-4 bg-[#F8F8F8] border-none rounded-2xl focus:ring-2 focus:ring-[#6052B3] min-h-[100px]"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 uppercase">Когда вы свободны?</label>
          <input 
            className="w-full p-4 bg-[#F8F8F8] border-none rounded-2xl focus:ring-2 focus:ring-[#6052B3]"
            placeholder="Например: Выходные, вечера будней"
            value={formData.availability}
            onChange={e => setFormData({...formData, availability: e.target.value})}
            required
          />
        </div>
        <button 
          disabled={loading}
          className="w-full py-4 bg-[#6052B3] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A3E90] transition-all disabled:opacity-50"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? 'Отправка...' : 'Подать заявку'}
        </button>
      </form>
    </Modal>
  );
};

export const DonationModal = ({ isOpen, onClose, fundraiser, onSuccess, showToast }: { isOpen: boolean, onClose: () => void, fundraiser: any, onSuccess?: () => void, showToast?: (msg: string, type?: 'success' | 'info') => void }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fundraisersApi.donate(fundraiser.id, Number(amount));
      showToast?.('Спасибо за ваше пожертвование!', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast?.(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Помочь проекту">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-[#F8F8F8] rounded-2xl mb-4">
          <p className="font-bold text-[#1A1A1A]">{fundraiser?.title}</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-[#6052B3]" 
              style={{ width: `${Math.min(100, (fundraiser?.current_amount / fundraiser?.target_amount) * 100)}%` }}
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 uppercase">Сумма пожертвования (₸)</label>
          <input 
            type="number"
            className="w-full p-4 bg-[#F8F8F8] border-none rounded-2xl focus:ring-2 focus:ring-[#6052B3] text-[24px] font-bold"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="1000"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[500, 1000, 5000].map(val => (
            <button key={val} type="button" onClick={() => setAmount(val.toString())} className="py-2 bg-gray-100 rounded-xl text-[13px] hover:bg-gray-200">
              {val} ₸
            </button>
          ))}
        </div>
        <button 
          disabled={loading}
          className="w-full py-4 bg-[#6052B3] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A3E90] transition-all disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5" />
          {loading ? 'Обработка...' : 'Поддержать'}
        </button>
      </form>
    </Modal>
  );
};

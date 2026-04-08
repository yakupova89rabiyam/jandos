import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { feedbackApi, request } from '../api/client';

interface PageData {
  title: string;
  content: string;
}

interface FooterData {
  address?: string;
  phone?: string;
  email?: string;
  social_links?: string;
}

export const ContactsPage = ({ showToast }: { showToast?: (msg: string, type?: 'success' | 'info') => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Хочу стать волонтером',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [page, footer] = await Promise.all([
          request('/api/pages/contacts'),
          request('/api/pages/settings/footer')
        ]);
        setPageData(page);
        setFooterData(footer);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Пожалуйста, введите ваше имя';
    if (!formData.email.trim()) {
      newErrors.email = 'Пожалуйста, введите email или телефон';
    } else if (formData.email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Пожалуйста, введите корректный email';
    }
    if (!formData.message.trim()) newErrors.message = 'Пожалуйста, введите сообщение';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await feedbackApi.submit(formData);
      showToast?.('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: 'Хочу стать волонтером',
        message: ''
      });
    } catch (err: any) {
      showToast?.(err.message || 'Ошибка отправки сообщения', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F9F9F9] pt-12 pb-24"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 font-serif"
          >
            Контакты
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#666666] leading-relaxed"
          >
            Мы всегда рады новым друзьям, волонтерам и партнерам. Свяжитесь с нами любым удобным способом или приезжайте в гости!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Наши координаты</h2>
            
            <div className="space-y-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F0EFFF] text-[#6052B3] rounded-full flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg mb-1">Адрес приюта</h3>
                  <p className="text-[#666666] leading-relaxed">
                    {footerData?.address || 'г. Алматы, ул. Хвостовая, 42'}<br/>
                    (Пожалуйста, предупреждайте о визите заранее)
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E5F0FF] text-[#4D94FF] rounded-full flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg mb-1">Телефон</h3>
                  <p className="text-[#666666] leading-relaxed">
                    {footerData?.phone || '+7 (777) 123-45-67'}<br/>
                    <span className="text-sm text-[#A0A0A0]">Ежедневно с 10:00 до 19:00</span>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E5FFE5] text-[#00CC00] rounded-full flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg mb-1">Email</h3>
                  <p className="text-[#666666] leading-relaxed">
                    {footerData?.email || 'hello@jandos.kz'}<br/>
                    <span className="text-sm text-[#A0A0A0]">Для общих вопросов и предложений</span>
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFF0E5] text-[#FF884D] rounded-full flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg mb-1">Часы посещения</h3>
                  <p className="text-[#666666] leading-relaxed">
                    Вторник - Воскресенье: 11:00 - 17:00<br/>
                    Понедельник: Санитарный день (закрыто)
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12 pt-8 border-t border-[#E5E5E5]">
              <h3 className="font-bold text-[#1A1A1A] text-lg mb-6">Мы в соцсетях</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center text-[#1A1A1A] hover:border-[#6052B3] hover:text-[#6052B3] hover:shadow-md transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center text-[#1A1A1A] hover:border-[#6052B3] hover:text-[#6052B3] hover:shadow-md transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center text-[#1A1A1A] hover:border-[#6052B3] hover:text-[#6052B3] hover:shadow-md transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Напишите нам</h2>
            <p className="text-[#666666] mb-8">Задайте вопрос, предложите помощь или просто скажите привет!</p>
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2">Ваше имя</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full bg-[#F9F9F9] border ${errors.name ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-xl px-4 py-3.5 text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] focus:ring-1 focus:ring-[#6052B3] transition-all`}
                  placeholder="ФИО"
                />
                {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1" role="alert">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2">Email или телефон</label>
                <input 
                  type="text" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full bg-[#F9F9F9] border ${errors.email ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-xl px-4 py-3.5 text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] focus:ring-1 focus:ring-[#6052B3] transition-all`}
                  placeholder="..."
                />
                {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#1A1A1A] mb-2">Тема сообщения</label>
                <div className="relative">
                  <select 
                    id="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] focus:ring-1 focus:ring-[#6052B3] transition-all appearance-none cursor-pointer"
                  >
                    <option>Хочу стать волонтером</option>
                    <option>Вопрос: как приютить питомца</option>
                    <option>Предложить помощь вещами</option>
                    <option>Корпоративное сотрудничество</option>
                    <option>Другое</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A0A0A0]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#1A1A1A] mb-2">Сообщение</label>
                <textarea 
                  id="message" 
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`w-full bg-[#F9F9F9] border ${errors.message ? 'border-red-500' : 'border-[#E5E5E5]'} rounded-xl px-4 py-3.5 text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] focus:ring-1 focus:ring-[#6052B3] transition-all resize-none`}
                  placeholder="Напишите ваше сообщение здесь..."
                ></textarea>
                {errors.message && <p id="message-error" className="text-red-500 text-xs mt-1" role="alert">{errors.message}</p>}
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A1A1A] hover:bg-[#6052B3]'} text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/5 flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Отправка...
                  </>
                ) : 'Отправить сообщение'}
              </button>
              
              <p className="text-xs text-[#A0A0A0] text-center mt-4">
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

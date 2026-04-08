import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { request } from '../api/client';

interface PageData {
  title: string;
  content: string;
}

export const HelpPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [isCopied, setIsCopied] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const categories = ['Все', 'Финансы', 'Помощь руками', 'Вещи', 'Инфо'];

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await request('/api/pages/help');
        setPageData(data);
      } catch (err) {
        console.error('Failed to load page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const helpWays = [
    {
      id: 'volunteer',
      category: 'Помощь руками',
      title: 'Волонтерство',
      description: 'Приезжайте в приют, чтобы гулять с собаками, социализировать кошек, помогать с уборкой и уходом. Ваше время — самый ценный ресурс для наших хвостиков.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
        </svg>
      ),
      color: 'bg-[#FFE5E5]',
      textColor: 'text-[#FF4D4D]',
      actionText: 'Стать волонтером',
      actionPage: 'contacts'
    },
    {
      id: 'guardian',
      category: 'Финансы',
      title: 'Опекунство',
      description: 'Не можете забрать питомца домой? Станьте его опекуном! Вы можете финансово поддерживать конкретное животное, навещать его и приносить вкусняшки.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      color: 'bg-[#E5F0FF]',
      textColor: 'text-[#4D94FF]',
      actionText: 'Выбрать питомца',
      actionPage: 'adopt'
    },
    {
      id: 'donate',
      category: 'Финансы',
      title: 'Финансовая помощь',
      description: 'Любая сумма помогает нам оплачивать лечение, закупать корм, вакцины и содержать приют в чистоте и тепле. Вы можете сделать разовый перевод или оформить подписку.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
      ),
      color: 'bg-[#E5FFE5]',
      textColor: 'text-[#00CC00]',
      actionText: 'Пожертвовать',
      actionPage: 'donate'
    },
    {
      id: 'items',
      category: 'Вещи',
      title: 'Корм и вещи',
      description: 'Нам всегда нужны сухие и влажные корма, пеленки, наполнители, лекарства, а также старое постельное белье и полотенца для подстилок.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      color: 'bg-[#FFF0E5]',
      textColor: 'text-[#FF884D]',
      actionText: 'Что нужно сейчас',
      actionPage: 'fundraisers'
    },
    {
      id: 'info',
      category: 'Инфо',
      title: 'Информационная поддержка',
      description: 'Расскажите о нас друзьям! Репосты в социальных сетях, лайки и комментарии помогают нашим подопечным быстрее находить любящие семьи.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      ),
      color: 'bg-[#F0E5FF]',
      textColor: 'text-[#994DFF]',
      actionText: 'Поделиться',
      actionPage: 'share'
    },
    {
      id: 'corporate',
      category: 'Финансы',
      title: 'Корпоративная помощь',
      description: 'Приглашаем компании к сотрудничеству. Вы можете организовать сбор средств в офисе, стать спонсором вольера или приехать на корпоративный субботник.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
          <path d="M9 22v-4h6v4"/>
          <path d="M8 6h.01"/>
          <path d="M16 6h.01"/>
          <path d="M12 6h.01"/>
          <path d="M12 10h.01"/>
          <path d="M12 14h.01"/>
          <path d="M16 10h.01"/>
          <path d="M16 14h.01"/>
          <path d="M8 10h.01"/>
          <path d="M8 14h.01"/>
        </svg>
      ),
      color: 'bg-[#E5FFFF]',
      textColor: 'text-[#00CCCC]',
      actionText: 'Связаться с нами',
      actionPage: 'contacts'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white pt-12 pb-24"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 font-serif"
          >
            {pageData?.title || 'Как вы можете помочь'}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#666666] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: pageData?.content || '<p>Приюту постоянно требуется поддержка. Даже самая маленькая помощь имеет огромное значение для наших подопечных. Выберите способ, который подходит именно вам.</p>' }}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-[15px] transition-all ${
                activeCategory === category 
                  ? 'bg-[#6052B3] text-white font-bold shadow-md' 
                  : 'bg-[#F5F5F5] text-[#666666] font-medium hover:bg-[#EAEAEA] hover:text-[#1A1A1A]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Ways to Help Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpWays.filter(way => activeCategory === 'Все' || way.category === activeCategory).map((way, idx) => (
            <motion.div
              key={way.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-[#F9F9F9] rounded-[24px] p-8 flex flex-col h-full border border-[#F0F0F0] hover:border-[#E5E5E5] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl ${way.color} ${way.textColor} flex items-center justify-center mb-6`}>
                {way.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">{way.title}</h3>
              <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                {way.description}
              </p>
              <button 
                onClick={() => {
                  if (way.actionPage === 'share') {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Приют для животных',
                        text: 'Помогите животным найти свой дом!',
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }
                  } else {
                    onNavigate(way.actionPage);
                  }
                }}
                className={`w-full bg-white border-2 font-semibold py-3.5 rounded-xl transition-colors ${
                  way.actionPage === 'share' && isCopied
                    ? 'border-[#34A853] text-[#34A853] hover:border-[#34A853] hover:text-[#34A853]'
                    : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#6052B3] hover:text-[#6052B3]'
                }`}
              >
                {way.actionPage === 'share' && isCopied ? 'Ссылка скопирована!' : way.actionText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 bg-[#6052B3] rounded-[32px] p-10 md:p-16 text-center text-white relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">Остались вопросы?</h2>
            <p className="text-white/80 text-lg mb-10">
              Свяжитесь с нами, и мы с радостью расскажем подробнее о том, как можно помочь приюту и нашим хвостикам.
            </p>
            <button 
              onClick={() => onNavigate('contacts')}
              className="bg-white text-[#6052B3] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#F4F4F4] transition-colors shadow-lg"
            >
              Связаться с нами
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

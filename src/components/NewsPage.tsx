import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const NewsPage = ({ news = [] }: { news?: any[] }) => {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = ['Все', 'События', 'Счастливые истории', 'Нужды приюта', 'Отчеты'];

  const filteredNews = activeCategory === 'Все' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const featuredArticle = filteredNews.find(item => item.featured) || filteredNews[0];
  const regularArticles = filteredNews.filter(item => item.id !== featuredArticle?.id);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F9F9F9] pt-12 pb-24"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 font-serif"
            >
              Новости приюта
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#666666] max-w-2xl"
            >
              Следите за жизнью наших подопечных, узнавайте о предстоящих событиях и читайте счастливые истории спасения.
            </motion.p>
          </div>
        </div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'bg-white text-[#666666] border border-[#E5E5E5] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] group cursor-pointer"
          onClick={() => setSelectedArticle(featuredArticle)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-[300px] lg:h-[480px] overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#F0EFFF] text-[#6052B3] px-4 py-1.5 rounded-full text-sm font-bold">
                    {featuredArticle.category}
                  </span>
                  <span className="text-[#888888] text-sm font-medium">{featuredArticle.date}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-6 leading-tight group-hover:text-[#6052B3] transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-[#666666] text-lg leading-relaxed mb-8">
                  {featuredArticle.excerpt}
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-2 text-[#1A1A1A] font-bold hover:text-[#6052B3] transition-colors">
                    Читать полностью
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((article, idx) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="h-[240px] overflow-hidden relative">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1A1A1A]">
                  {article.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[#888888] text-sm font-medium mb-3">{article.date}</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 leading-tight group-hover:text-[#6052B3] transition-colors">
                  {article.title}
                </h3>
                <p className="text-[#666666] text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-[#F0F0F0]">
                  <span className="text-[#1A1A1A] font-semibold text-sm group-hover:text-[#6052B3] transition-colors">
                    Читать далее →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#F0F0F0] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Новостей не найдено</h3>
            <p className="text-[#666666]">В этой категории пока нет опубликованных новостей.</p>
          </div>
        )}

      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedArticle.image && (
                <div className="h-[240px] shrink-0 overflow-hidden">
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  {selectedArticle.category && (
                    <span className="bg-[#F0EFFF] text-[#6052B3] px-3 py-1 rounded-full text-xs font-bold">
                      {selectedArticle.category}
                    </span>
                  )}
                  {selectedArticle.date && (
                    <span className="text-[#888888] text-sm">{selectedArticle.date}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 leading-tight">{selectedArticle.title}</h2>
                {selectedArticle.excerpt && (
                  <p className="text-[#666666] font-medium mb-4 leading-relaxed">{selectedArticle.excerpt}</p>
                )}
                <div className="text-[#444444] leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

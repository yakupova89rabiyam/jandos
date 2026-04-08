import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Clock, Users, AlertCircle, Heart, Share2, X, ChevronRight, CreditCard, Wallet } from 'lucide-react';

export const FundraisersPage = ({ fundraisers, donationCategories, onDonate, showToast }: { fundraisers: any[], donationCategories: any[], onDonate: (fundraiser: any) => void, showToast?: (msg: string, type?: 'success' | 'info') => void }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const [selectedFundraiser, setSelectedFundraiser] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [donationAmount, setDonationAmount] = useState<string>('');

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleShare = async (e: React.MouseEvent, fundraiser: any) => {
    e.stopPropagation();
    const shareData = {
      title: fundraiser.title,
      text: `Помогите ${fundraiser.petName}: ${fundraiser.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast?.('Ссылка скопирована!', 'success');
      }
    } catch {
      // share cancelled by user
    }
  };

  const filters = [
    { id: 'all', label: 'Все сборы' },
    { id: 'urgent', label: 'Срочно', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'medical', label: 'Лечение' },
    { id: 'food', label: 'Питание' },
  ];

  const filteredFundraisers = useMemo(() => {
    let result = fundraisers.filter(f => {
      const matchesSearch = f.petName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           f.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === 'all') return matchesSearch;
      if (activeFilter === 'urgent') return f.urgent && matchesSearch;
      return f.category === activeFilter && matchesSearch;
    });

    if (sortBy === 'progress') {
      return [...result].sort((a, b) => (b.collected / b.goal) - (a.collected / a.goal));
    }
    if (sortBy === 'urgency') {
      return [...result].sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1));
    }
    return result;
  }, [fundraisers, activeFilter, searchQuery, sortBy]);

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
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 font-serif">Сборы и нужды приюта</h1>
          <p className="text-lg text-[#666666] leading-relaxed">
            Ваша помощь спасает жизни. Здесь вы можете поддержать конкретных животных, нуждающихся в лечении, или помочь приюту с покупкой корма и медикаментов.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input 
                type="text"
                placeholder="Поиск по имени или названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6052B3] transition-all"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-medium text-[#666666] whitespace-nowrap">Сортировать:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6052B3]"
              >
                <option value="urgency">По срочности</option>
                <option value="progress">По прогрессу</option>
                <option value="newest">Сначала новые</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id 
                    ? 'bg-[#6052B3] text-white shadow-lg shadow-[#6052B3]/20' 
                    : 'bg-white text-[#666666] border border-[#E5E5E5] hover:border-[#6052B3] hover:text-[#6052B3]'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Сборы Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Открытые сборы</h2>
            <span className="text-[#666666] text-sm font-medium">Найдено: {filteredFundraisers.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredFundraisers.map((f: any, idx: number) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={f.id} 
                  onClick={() => setSelectedFundraiser(f)}
                  className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col group border border-[#F0F0F0] cursor-pointer"
                >
                  <div className="h-[260px] relative overflow-hidden bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]">
                    <img 
                      src={f.image && f.image.trim() !== '' ? f.image : '/funDog.png'}
                      alt={f.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/funDog.png';
                      }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#1A1A1A] shadow-sm">
                        {f.petName}
                      </div>
                      {f.urgent && (
                        <div className="bg-[#FF4D4D] px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3" />
                          СРОЧНО
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button 
                        onClick={(e) => toggleFavorite(e, f.id)}
                        className={`w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm ${favorites.includes(f.id) ? 'text-[#FF4D4D]' : 'text-[#A0A0A0] hover:text-[#FF4D4D]'}`}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(f.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => handleShare(e, f)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#A0A0A0] hover:text-[#6052B3] transition-colors shadow-sm"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-4 text-[13px] text-[#A0A0A0] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {f.daysLeft} дн. осталось
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {f.donorCount} доноров
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 leading-tight group-hover:text-[#6052B3] transition-colors">{f.title}</h3>
                    <p className="text-[#666666] text-sm mb-8 flex-grow line-clamp-3 leading-relaxed">{f.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex flex-col">
                          <span className="text-[#A0A0A0] text-xs font-medium uppercase tracking-wider mb-1">Собрано</span>
                          <span className="text-[#6052B3] text-xl font-bold">{f.collected.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[#A0A0A0] text-xs font-medium uppercase tracking-wider mb-1">Цель</span>
                          <span className="text-[#1A1A1A] text-sm font-bold">{f.goal.toLocaleString('ru-RU')} ₸</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-[#F0EFFF] rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (f.collected / f.goal) * 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full bg-[#6052B3] rounded-full relative overflow-hidden`} 
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ width: '50%' }}></div>
                        </motion.div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-[#6052B3] text-xs font-bold">{Math.round((f.collected / f.goal) * 100)}%</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onDonate(f)} 
                      className="w-full bg-[#1A1A1A] hover:bg-[#6052B3] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-black/5 hover:shadow-[#6052B3]/20"
                    >
                      Поддержать
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredFundraisers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-[#E5E5E5]">
              <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#A0A0A0]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Ничего не найдено</h3>
              <p className="text-[#666666]">Попробуйте изменить параметры поиска или фильтры</p>
              <button 
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="mt-6 text-[#6052B3] font-bold hover:underline"
              >
                Сбросить все фильтры
              </button>
            </div>
          )}
        </div>

        {/* Нужды приюта */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Текущие нужды приюта</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationCategories.map((c: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                key={c.id} 
                className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0 shadow-sm`}>
                    {React.cloneElement(c.icon as React.ReactElement, { size: 28 })}
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] text-xl leading-tight">{c.title}</h3>
                </div>
                
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-[#1A1A1A]">{c.collected.toLocaleString('ru-RU')} ₸</span>
                    <span className="text-[#A0A0A0]">из {c.goal.toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className={`w-full h-2.5 ${c.progressBg} rounded-full overflow-hidden relative`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (c.collected / c.goal) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${c.progressColor} rounded-full relative overflow-hidden`} 
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ width: '50%' }}></div>
                    </motion.div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onDonate(c)} 
                  className="w-full bg-white border-2 border-[#E5E5E5] hover:border-[#1A1A1A] text-[#1A1A1A] font-bold py-3.5 rounded-xl transition-all text-sm active:scale-[0.98]"
                >
                  Внести вклад
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Fundraiser Detail Modal */}
      <AnimatePresence>
        {selectedFundraiser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFundraiser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedFundraiser(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left Side: Image & Gallery */}
              <div className="w-full md:w-1/2 h-[400px] md:h-auto relative flex flex-col">
                <div className="flex-grow relative bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]">
                  <img 
                    src={selectedFundraiser.image && selectedFundraiser.image.trim() !== '' ? selectedFundraiser.image : '/funDog.png'}
                    alt={selectedFundraiser.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/funDog.png';
                    }}
                  />
                  <div className="absolute bottom-6 left-6 flex gap-2">
                    {selectedFundraiser.gallery?.map((img: string, i: number) => (
                      <button 
                        key={i}
                        className="w-16 h-16 rounded-xl border-2 border-white overflow-hidden shadow-lg hover:scale-105 transition-transform"
                        onClick={() => setSelectedFundraiser({...selectedFundraiser, image: img})}
                      >
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Recent Donations Feed */}
                <div className="hidden md:block bg-[#F9F9F9] p-8 border-t border-[#F0F0F0]">
                  <h4 className="text-sm font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#FF4D4D] fill-current" />
                    Последние пожертвования
                  </h4>
                  <div className="space-y-4">
                    {selectedFundraiser.recentDonations?.map((donation: any) => (
                      <div key={donation.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3] text-xs font-bold">
                            {donation.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#1A1A1A]">{donation.name}</div>
                            <div className="text-[11px] text-[#A0A0A0]">{donation.date}</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-[#6052B3]">+{donation.amount.toLocaleString('ru-RU')} ₸</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Content & Donation */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-[#F0EFFF] text-[#6052B3] text-xs font-bold rounded-full uppercase tracking-wider">
                        {selectedFundraiser.category === 'medical' ? 'Медицина' : 'Питание'}
                      </span>
                      {selectedFundraiser.urgent && (
                        <span className="px-4 py-1.5 bg-[#FF4D4D]/10 text-[#FF4D4D] text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3" /> Срочно
                        </span>
                      )}
                    </div>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#F4F4F4] shadow-sm">
                          <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Donor" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#6052B3] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        +{selectedFundraiser.donorCount - 3}
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4 font-serif leading-tight">
                    {selectedFundraiser.title}
                  </h2>
                  <div className="flex items-center gap-2 text-[#A0A0A0] text-sm mb-6">
                    <Heart className="w-4 h-4 text-[#FF4D4D] fill-current" />
                    <span>Помощь для {selectedFundraiser.petName}</span>
                  </div>
                  <p className="text-[#666666] leading-relaxed mb-6 whitespace-pre-line">
                    {selectedFundraiser.description}
                  </p>
                </div>

                {/* Progress */}
                <div className="bg-[#F9F9F9] p-8 rounded-[32px] mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-sm text-[#A0A0A0] font-medium uppercase tracking-wider mb-1">Собрано</div>
                      <div className="text-3xl font-bold text-[#6052B3]">{selectedFundraiser.collected.toLocaleString('ru-RU')} ₸</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#A0A0A0] font-medium uppercase tracking-wider mb-1">Цель</div>
                      <div className="text-xl font-bold text-[#1A1A1A]">{selectedFundraiser.goal.toLocaleString('ru-RU')} ₸</div>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-white rounded-full overflow-hidden relative mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (selectedFundraiser.collected / selectedFundraiser.goal) * 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#6052B3] rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ width: '50%' }}></div>
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6052B3] font-bold">{Math.round((selectedFundraiser.collected / selectedFundraiser.goal) * 100)}% выполнено</span>
                    <span className="text-[#A0A0A0] text-sm font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {selectedFundraiser.daysLeft} дней осталось
                    </span>
                  </div>
                </div>

                {/* Quick Donation */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Выберите сумму помощи</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['500', '1000', '5000'].map(amount => (
                      <button 
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`py-4 rounded-2xl font-bold transition-all border-2 ${donationAmount === amount ? 'bg-[#6052B3] border-[#6052B3] text-white' : 'bg-white border-[#F0F0F0] text-[#1A1A1A] hover:border-[#6052B3]'}`}
                      >
                        {parseInt(amount).toLocaleString('ru-RU')} ₸
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Другая сумма..."
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#6052B3] focus:bg-white rounded-2xl py-4 px-6 font-bold text-[#1A1A1A] outline-none transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-[#A0A0A0]">₸</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onDonate(selectedFundraiser)}
                      className="flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold py-5 rounded-[24px] transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                    >
                      <CreditCard className="w-6 h-6" />
                      Картой
                    </button>
                    <button 
                      onClick={() => onDonate(selectedFundraiser)}
                      className="flex items-center justify-center gap-3 bg-[#6052B3] hover:bg-[#4F4299] text-white font-bold py-5 rounded-[24px] transition-all shadow-xl shadow-[#6052B3]/20 active:scale-[0.98]"
                    >
                      <Wallet className="w-6 h-6" />
                      Kaspi.kz
                    </button>
                  </div>
                  
                  <p className="text-center text-[#A0A0A0] text-xs leading-relaxed">
                    Нажимая на кнопку, вы соглашаетесь с условиями <br />
                    <a href="#" className="underline hover:text-[#6052B3]">публичной оферты</a> и <a href="#" className="underline hover:text-[#6052B3]">политикой конфиденциальности</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

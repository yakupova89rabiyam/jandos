import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Package, CheckCircle2, Clock, MapPin, Plus, ChevronLeft, ChevronRight, AlertCircle, Search, ArrowUpDown, X, Phone } from 'lucide-react';
import { volunteersApi, needsApi, promisedItemsApi } from '../api/client';

interface Shift {
  id: number;
  type: 'walking' | 'cleaning' | 'feeding';
  date: string;
  time: string;
  slots: number;
  signedUp: number;
  description: string;
  location: string;
  contact: string;
}

interface Need {
  id: string;
  item: string;
  category: 'food' | 'medical' | 'tools' | 'other';
  quantity: string;
  urgency: 'high' | 'medium' | 'low';
}


export const VolunteerPortal = ({ user, showToast }: { user: any, showToast: (msg: string, type: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'needs'>('shifts');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [needsFilter, setNeedsFilter] = useState<string>('Все');
  const [needsSearch, setNeedsSearch] = useState('');
  const [needsSort, setNeedsSort] = useState<'urgency' | 'name'>('urgency');
  const [viewingShift, setViewingShift] = useState<Shift | null>(null);

  // Calendar state - dynamic current month
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // API data
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [mySlotIds, setMySlotIds] = useState<Set<number>>(new Set());
  const [needs, setNeeds] = useState<Need[]>([]);
  const [myPromisedIds, setMyPromisedIds] = useState<Set<number>>(new Set());

  const mapSlot = (s: any): Shift => ({
    id: s.id,
    type: s.type as Shift['type'],
    date: s.date,
    time: s.time,
    slots: s.slots,
    signedUp: Number(s.signed_up ?? 0),
    description: s.description || '',
    location: s.location || '',
    contact: s.contact || '',
  });

  useEffect(() => {
    volunteersApi.getSlots()
      .then(data => setShifts(data.map(mapSlot)))
      .catch(() => {});
    needsApi.getAll()
      .then(data => setNeeds(data.map((n: any) => ({
        id: String(n.id),
        item: n.item,
        category: n.category as Need['category'],
        quantity: n.quantity,
        urgency: n.urgency as Need['urgency'],
      }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      volunteersApi.getMySlots()
        .then(data => setMySlotIds(new Set(data.map((s: any) => s.id))))
        .catch(() => {});
      promisedItemsApi.getMy()
        .then(ids => setMyPromisedIds(new Set(ids)))
        .catch(() => {});
    } else {
      setMySlotIds(new Set());
      setMyPromisedIds(new Set());
    }
  }, [user]);

  const userShifts = shifts.filter(s => mySlotIds.has(s.id));

  const upcomingShifts = useMemo(() => {
    return [...userShifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [userShifts]);

  const filteredShifts = useMemo(() => {
    return selectedDate
      ? shifts.filter(s => s.date === selectedDate)
      : shifts;
  }, [selectedDate, shifts]);

  const processedNeeds = useMemo(() => {
    let result = [...needs];
    if (needsFilter !== 'Все') result = result.filter(n => n.category === needsFilter);
    if (needsSearch) result = result.filter(n => n.item.toLowerCase().includes(needsSearch.toLowerCase()));
    result.sort((a, b) => {
      if (needsSort === 'urgency') {
        const urgencyMap: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return urgencyMap[a.urgency] - urgencyMap[b.urgency];
      }
      return a.item.localeCompare(b.item);
    });
    return result;
  }, [needs, needsFilter, needsSearch, needsSort]);

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const calOffset = (firstDayOfWeek + 6) % 7; // Mon=0
  const calLabel = new Date(calYear, calMonth).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const today = new Date();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleSignUp = async (shift: Shift) => {
    if (!user) { showToast('Пожалуйста, войдите в систему, чтобы записаться', 'info'); return; }
    if (mySlotIds.has(shift.id)) { showToast('Вы уже записаны на эту смену', 'info'); return; }
    if (shift.signedUp >= shift.slots) { showToast('К сожалению, мест больше нет', 'error'); return; }

    try {
      await volunteersApi.signupSlot(shift.id);
      setMySlotIds(prev => new Set([...prev, shift.id]));
      setShifts(prev => prev.map(s => s.id === shift.id ? { ...s, signedUp: s.signedUp + 1 } : s));
      const label = shift.type === 'walking' ? 'Выгул' : shift.type === 'cleaning' ? 'Уборку' : 'Кормление';
      showToast(`Вы успешно записаны на: ${label}`, 'success');
      setViewingShift(null);
    } catch (err: any) {
      showToast(err.message || 'Ошибка записи', 'error');
    }
  };

  const handleCancelShift = async (shiftId: number) => {
    if (!user) return;
    try {
      await volunteersApi.cancelSlot(shiftId);
      setMySlotIds(prev => { const next = new Set(prev); next.delete(shiftId); return next; });
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, signedUp: Math.max(0, s.signedUp - 1) } : s));
      showToast('Запись на смену отменена', 'info');
      setViewingShift(null);
    } catch (err: any) {
      showToast(err.message || 'Ошибка отмены', 'error');
    }
  };

  const handlePromiseItem = async (need: Need) => {
    if (!user) { showToast('Пожалуйста, войдите в систему', 'info'); return; }
    if (myPromisedIds.has(Number(need.id))) { showToast('Вы уже отметили этот пункт', 'info'); return; }
    try {
      await promisedItemsApi.promise(Number(need.id));
      setMyPromisedIds(prev => new Set([...prev, Number(need.id)]));
      showToast('Спасибо! Мы будем ждать вас с посылкой', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка', 'info');
    }
  };

  const handleCancelPromise = async (needId: number) => {
    try {
      await promisedItemsApi.cancel(needId);
      setMyPromisedIds(prev => { const next = new Set(prev); next.delete(needId); return next; });
      showToast('Обещание отменено', 'info');
    } catch (err: any) {
      showToast(err.message || 'Ошибка', 'info');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-orange-100 text-orange-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-[1200px] mx-auto px-4 pt-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4">Волонтерский портал</h1>
            <p className="text-[#666666] text-[18px] max-w-[600px]">
              Станьте частью нашей команды! Помогайте делом или вещами — любая поддержка бесценна для наших хвостиков.
            </p>
          </div>

          {user && (userShifts.length > 0 || myPromisedIds.size > 0) && (
            <div className="bg-[#F5F3FF] border border-[#6052B3]/20 rounded-2xl p-4 flex gap-6">
              {userShifts.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#6052B3] uppercase tracking-wider mb-1">Ваши смены</p>
                  <p className="text-[18px] font-bold text-[#1A1A1A]">{userShifts.length}</p>
                </div>
              )}
              {myPromisedIds.size > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#6052B3] uppercase tracking-wider mb-1">Обещано вещей</p>
                  <p className="text-[18px] font-bold text-[#1A1A1A]">{myPromisedIds.size}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#E5E5E5] mb-10">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-8 py-4 text-[16px] font-bold transition-all relative ${
              activeTab === 'shifts' ? 'text-[#6052B3]' : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Запись на смены
            {activeTab === 'shifts' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#6052B3] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`px-8 py-4 text-[16px] font-bold transition-all relative ${
              activeTab === 'needs' ? 'text-[#6052B3]' : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
          >
            Список нужд
            {activeTab === 'needs' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#6052B3] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'shifts' ? (
            <motion.div
              key="shifts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* Calendar Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                {/* My Upcoming Shifts */}
                {upcomingShifts.length > 0 && (
                  <div className="bg-[#6052B3] rounded-[32px] p-6 text-white">
                    <h4 className="text-[16px] font-bold mb-4 flex items-center gap-2">
                      <Clock size={18} /> Мои ближайшие смены
                    </h4>
                    <div className="space-y-3">
                      {upcomingShifts.slice(0, 3).map(s => (
                        <div key={s.id} className="bg-white/10 rounded-xl p-3 border border-white/10 group relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[14px] font-bold">
                                {s.type === 'walking' ? 'Выгул' : s.type === 'cleaning' ? 'Уборка' : 'Кормление'}
                              </p>
                              <p className="text-[12px] text-white/70">
                                {new Date(s.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} • {s.time}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelShift(s.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-white/50 hover:text-white"
                              title="Отменить"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Calendar */}
                <div className="bg-[#F5F5F5] rounded-[32px] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[18px] font-bold capitalize">{calLabel}</h3>
                    <div className="flex gap-2">
                      <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors"><ChevronLeft size={20} /></button>
                      <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                      <span key={d} className="text-[12px] text-[#888888] font-bold">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: calOffset }).map((_, i) => (
                      <div key={`e-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                      const hasShift = shifts.some(s => s.date === dateStr);
                      const isSelected = selectedDate === dateStr;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                          className={`aspect-square rounded-xl flex items-center justify-center text-[14px] font-bold transition-all relative ${
                            isSelected ? 'bg-[#6052B3] text-white' :
                            isToday ? 'border-2 border-[#6052B3] text-[#6052B3]' :
                            'hover:bg-white'
                          }`}
                        >
                          {day}
                          {hasShift && !isSelected && (
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6052B3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-[13px] font-bold text-[#6052B3] hover:underline"
                    >
                      Показать все смены
                    </button>
                  </div>
                </div>

                {/* Guide */}
                <div className="bg-[#1A1A1A] rounded-[32px] p-8 text-white">
                  <h4 className="text-[18px] font-bold mb-4">Как стать волонтером?</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-[14px]">
                      <div className="w-6 h-6 rounded-full bg-[#6052B3] flex items-center justify-center shrink-0 font-bold text-[12px]">1</div>
                      <p className="text-white/70">Выберите подходящую смену в календаре и запишитесь.</p>
                    </li>
                    <li className="flex gap-3 text-[14px]">
                      <div className="w-6 h-6 rounded-full bg-[#6052B3] flex items-center justify-center shrink-0 font-bold text-[12px]">2</div>
                      <p className="text-white/70">Приезжайте в приют за 15 минут до начала смены.</p>
                    </li>
                    <li className="flex gap-3 text-[14px]">
                      <div className="w-6 h-6 rounded-full bg-[#6052B3] flex items-center justify-center shrink-0 font-bold text-[12px]">3</div>
                      <p className="text-white/70">Пройдите краткий инструктаж от наших сотрудников.</p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Shifts List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[24px] font-bold">
                    {selectedDate
                      ? `Смены на ${new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
                      : 'Все доступные смены'}
                  </h3>
                  {selectedDate && (
                    <span className="text-[14px] text-[#666666]">{filteredShifts.length} найдено</span>
                  )}
                </div>

                {filteredShifts.length > 0 ? (
                  filteredShifts.map(shift => (
                    <div
                      key={shift.id}
                      onClick={() => setViewingShift(shift)}
                      className="bg-white border-2 border-[#F0F0F0] rounded-[24px] p-6 hover:border-[#6052B3] transition-all group cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                            shift.type === 'walking' ? 'bg-green-100 text-green-600' :
                            shift.type === 'cleaning' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {shift.type === 'walking' ? <Clock size={28} /> :
                             shift.type === 'cleaning' ? <Package size={28} /> : <CalendarIcon size={28} />}
                          </div>
                          <div>
                            <h4 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#6052B3] transition-colors">
                              {shift.type === 'walking' ? 'Выгул собак' :
                               shift.type === 'cleaning' ? 'Уборка территории' : 'Помощь в кормлении'}
                            </h4>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center gap-1.5 text-[14px] text-[#666666]">
                                <CalendarIcon size={14} />
                                {new Date(shift.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                              </div>
                              <div className="flex items-center gap-1.5 text-[14px] text-[#666666]">
                                <Clock size={14} />
                                {shift.time}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                          <div className="text-right">
                            <p className="text-[12px] text-[#888888] font-bold uppercase tracking-wider">Мест осталось</p>
                            <p className={`text-[18px] font-bold ${shift.slots - shift.signedUp <= 1 ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                              {shift.slots - shift.signedUp} из {shift.slots}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSignUp(shift); }}
                            disabled={shift.signedUp >= shift.slots || mySlotIds.has(shift.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-[14px] transition-all ${
                              mySlotIds.has(shift.id)
                                ? 'bg-green-100 text-green-600 cursor-default'
                                : shift.signedUp >= shift.slots
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#6052B3] text-white hover:bg-[#4A3E90] shadow-lg shadow-[#6052B3]/20'
                            }`}
                          >
                            {mySlotIds.has(shift.id) ? (
                              <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Вы записаны</span>
                            ) : shift.signedUp >= shift.slots ? 'Мест нет' : 'Записаться'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-[#F5F5F5] rounded-[32px]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <CalendarIcon size={32} />
                    </div>
                    <p className="text-[#666666]">
                      {shifts.length === 0 ? 'Смены скоро появятся.' : 'На выбранную дату смен пока нет.'}
                    </p>
                    {selectedDate && (
                      <button onClick={() => setSelectedDate(null)} className="mt-4 text-[#6052B3] font-bold hover:underline">
                        Показать все даты
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="needs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Needs Toolbar */}
              <div className="bg-[#F5F5F5] rounded-[32px] p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={18} />
                    <input
                      type="text"
                      placeholder="Поиск по названию..."
                      value={needsSearch}
                      onChange={(e) => setNeedsSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-2 border-transparent focus:border-[#6052B3] outline-none transition-all text-[15px]"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-[#666666]">
                      <ArrowUpDown size={16} />
                      Сортировать:
                    </div>
                    <select
                      value={needsSort}
                      onChange={(e) => setNeedsSort(e.target.value as any)}
                      className="bg-white px-4 py-2.5 rounded-xl border-2 border-transparent focus:border-[#6052B3] outline-none font-bold text-[14px] cursor-pointer"
                    >
                      <option value="urgency">По срочности</option>
                      <option value="name">По названию</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Все', 'food', 'medical', 'tools', 'other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNeedsFilter(cat)}
                      className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                        needsFilter === cat
                          ? 'bg-[#6052B3] text-white shadow-lg shadow-[#6052B3]/20'
                          : 'bg-white text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      {cat === 'Все' ? 'Все категории' :
                       cat === 'food' ? 'Корм' :
                       cat === 'medical' ? 'Медикаменты' :
                       cat === 'tools' ? 'Инвентарь' : 'Прочее'}
                    </button>
                  ))}
                </div>
              </div>

              {processedNeeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedNeeds.map(need => {
                    const isPromised = myPromisedIds.has(Number(need.id));
                    return (
                      <div key={need.id} className="bg-white border-2 border-[#F0F0F0] rounded-[24px] p-6 flex flex-col h-full hover:border-[#6052B3] transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getUrgencyColor(need.urgency)}`}>
                            {need.urgency === 'high' ? 'Срочно' : need.urgency === 'medium' ? 'Важно' : 'Нужно'}
                          </div>
                          <div className="text-[#888888]">
                            {need.category === 'food' && <Package size={20} />}
                            {need.category === 'medical' && <Plus size={20} />}
                            {need.category === 'tools' && <Package size={20} />}
                            {need.category === 'other' && <AlertCircle size={20} />}
                          </div>
                        </div>
                        <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-2">{need.item}</h4>
                        <p className="text-[#666666] text-[14px] mb-6">Требуется: <span className="font-bold text-[#1A1A1A]">{need.quantity}</span></p>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex gap-2">
                          <button
                            onClick={() => handlePromiseItem(need)}
                            disabled={isPromised}
                            className={`flex-1 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${
                              isPromised
                                ? 'bg-green-100 text-green-600 cursor-default'
                                : 'bg-[#F5F3FF] text-[#6052B3] hover:bg-[#6052B3] hover:text-white'
                            }`}
                          >
                            {isPromised ? <><CheckCircle2 size={18} /> Я привезу это</> : <><Plus size={18} /> Я привезу это</>}
                          </button>
                          {isPromised && (
                            <button
                              onClick={() => handleCancelPromise(Number(need.id))}
                              className="px-3 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                              title="Отменить"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center bg-[#F5F5F5] rounded-[32px]">
                  <p className="text-[#666666]">По вашему запросу ничего не найдено.</p>
                </div>
              )}

              <div className="bg-[#6052B3] rounded-[32px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-[500px]">
                  <h3 className="text-[28px] font-bold mb-4">Не нашли то, что хотели привезти?</h3>
                  <p className="text-white/80 text-[16px] leading-relaxed">
                    Если у вас есть другие вещи, которые могут быть полезны приюту (старые одеяла, игрушки, стройматериалы), пожалуйста, свяжитесь с нами.
                  </p>
                </div>
                <button className="bg-white text-[#6052B3] px-10 py-4 rounded-2xl font-bold text-[16px] hover:bg-gray-100 transition-all shrink-0">
                  Связаться с нами
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shift Detail Modal */}
        <AnimatePresence>
          {viewingShift && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingShift(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[600px] bg-white rounded-[40px] overflow-hidden shadow-2xl"
              >
                <button
                  onClick={() => setViewingShift(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A] hover:bg-[#E5E5E5] transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="p-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    viewingShift.type === 'walking' ? 'bg-green-100 text-green-600' :
                    viewingShift.type === 'cleaning' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {viewingShift.type === 'walking' ? <Clock size={32} /> :
                     viewingShift.type === 'cleaning' ? <Package size={32} /> : <CalendarIcon size={32} />}
                  </div>

                  <h3 className="text-[28px] font-bold text-[#1A1A1A] mb-2">
                    {viewingShift.type === 'walking' ? 'Выгул собак' :
                     viewingShift.type === 'cleaning' ? 'Уборка территории' : 'Помощь в кормлении'}
                  </h3>

                  <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-2 text-[#666666]">
                      <CalendarIcon size={18} className="text-[#6052B3]" />
                      <span className="font-medium">{new Date(viewingShift.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#666666]">
                      <Clock size={18} className="text-[#6052B3]" />
                      <span className="font-medium">{viewingShift.time}</span>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#888888] uppercase tracking-wider mb-2">Описание</h4>
                      <p className="text-[#1A1A1A] leading-relaxed">{viewingShift.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[14px] font-bold text-[#888888] uppercase tracking-wider mb-2">Место встречи</h4>
                        <div className="flex items-center gap-2 text-[#1A1A1A]">
                          <MapPin size={16} className="text-[#6052B3]" />
                          <span>{viewingShift.location}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#888888] uppercase tracking-wider mb-2">Контактное лицо</h4>
                        <div className="flex items-center gap-2 text-[#1A1A1A]">
                          <Phone size={16} className="text-[#6052B3]" />
                          <span>{viewingShift.contact}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-8 border-t border-gray-100">
                    {mySlotIds.has(viewingShift.id) ? (
                      <div className="flex-1 flex gap-3">
                        <div className="flex-1 bg-green-100 text-green-600 py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2">
                          <CheckCircle2 size={20} /> Вы уже записаны
                        </div>
                        <button
                          onClick={() => handleCancelShift(viewingShift.id)}
                          className="px-6 py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-[14px] hover:bg-red-100 transition-all"
                        >
                          Отменить
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSignUp(viewingShift)}
                        disabled={viewingShift.signedUp >= viewingShift.slots}
                        className={`flex-1 py-4 rounded-2xl font-bold text-[16px] transition-all ${
                          viewingShift.signedUp >= viewingShift.slots
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#6052B3] text-white hover:bg-[#4A3E90] shadow-xl shadow-[#6052B3]/20'
                        }`}
                      >
                        {viewingShift.signedUp >= viewingShift.slots ? 'Мест больше нет' : 'Подтвердить запись'}
                      </button>
                    )}
                    <div className="text-center px-4">
                      <p className="text-[12px] text-[#888888] font-bold uppercase">Свободно</p>
                      <p className="text-[20px] font-bold text-[#1A1A1A]">{viewingShift.slots - viewingShift.signedUp}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, MapPin, FileText, 
  Heart, ClipboardList, Shield, Bell, HandHeart,
  Edit3, Camera, LogOut, Lock, CheckCircle, XCircle,
  Clock, PawPrint, Gift, TrendingUp, Award, ChevronRight
} from 'lucide-react';
import { AdoptPetCard } from './AdoptPetCard';
import { authApi, usersApi, donationsApi, promisedItemsApi } from '../api/client';

// Animated Card Component
const StatCard = ({ icon: Icon, label, value, color = "#6052B3", delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Modern Input Component
const ProfileInput = ({ label, id, placeholder, type = "text", as = "input", className = "", value, onChange, error, icon: Icon }: any) => {
  const Component = as;
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {label}
        </label>
      )}
      <div className="relative">
        <Component
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full bg-gray-50 rounded-xl px-4 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6052B3]/20 focus:bg-white border-2 transition-all ${error ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-[#6052B3]'}`}
          rows={as === 'textarea' ? 4 : undefined}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${id}-error`} 
          className="flex items-center gap-1 text-red-500 text-xs mt-1.5" 
          role="alert"
        >
          <XCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Modern Button Component
const ProfileButton = ({ children, onClick, type = "button", className = "", disabled = false, variant = "primary", icon: Icon }: any) => {
  const variants = {
    primary: "bg-[#6052B3] text-white hover:bg-[#4A3E90] shadow-lg shadow-[#6052B3]/25",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#6052B3] hover:text-[#6052B3]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200",
    ghost: "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-6 py-3 text-[15px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

export const ProfilePage = ({ user, onLogout, onUpdateUser, favorites = [], applications = [], wards = [], onToggleFavorite, onPetClick }: { user: any, onLogout: () => void, onUpdateUser: (data: any) => void, favorites?: any[], applications?: any[], wards?: any[], onToggleFavorite?: (pet: any) => void, onPetClick?: (pet: any) => void }) => {
  const [activeTab, setActiveTab] = useState('data');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    country: user?.country || '',
    city: user?.city || '',
    about: user?.about || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<any>({});
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMsgType, setSaveMsgType] = useState<'ok' | 'err'>('ok');
  const [myData, setMyData] = useState<any>(null);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [myPromisedItems, setMyPromisedItems] = useState<any[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate total donations
  useEffect(() => {
    const total = myDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    setTotalDonated(total);
  }, [myDonations]);

  useEffect(() => {
    usersApi.getMyData().then(setMyData).catch(() => {});
    donationsApi.getMy().then(setMyDonations).catch(() => {});
    promisedItemsApi.getMyFull().then(setMyPromisedItems).catch(() => {});
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 1) return numbers.length === 1 ? '+' + numbers : '';
    if (numbers.length <= 2) return `+${numbers.slice(0, 1)} (${numbers.slice(1)}`;
    if (numbers.length <= 5) return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}`;
    if (numbers.length <= 8) return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}`;
    if (numbers.length <= 10) return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}`;
    return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'phone') {
      finalValue = formatPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateData = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    
    if (formData.phone && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Введите полный номер телефона (+7 (XXX) XXX-XX-XX)';
    }

    if (formData.birthday && !/^\d{2}\.\d{2}\.\d{4}$/.test(formData.birthday)) {
      newErrors.birthday = 'Используйте формат ДД.ММ.ГГГГ';
    } else if (formData.birthday) {
      const [d, m, y] = formData.birthday.split('.').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        newErrors.birthday = 'Некорректная дата';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setSaveMessage(text);
    setSaveMsgType(type);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveData = async () => {
    if (!validateData()) return;
    try {
      const { user: updated } = await authApi.updateProfile({
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        birthday: formData.birthday || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        about: formData.about || undefined,
      });
      onUpdateUser(updated);
      showMsg('Данные успешно сохранены!');
    } catch (err: any) {
      showMsg(err.message || 'Ошибка сохранения', 'err');
    }
  };

  const handleSaveEmail = () => {
    if (!formData.email.includes('@')) {
      showMsg('Введите корректный email', 'err');
      return;
    }
    // Email change is read-only for now (requires verification flow)
    showMsg('Изменение email временно недоступно', 'err');
  };

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setSaveMessage('Новые пароли не совпадают');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (passwords.new.length < 6) {
      setSaveMessage('Пароль должен быть не менее 6 символов');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    try {
      await authApi.changePassword(passwords.old, passwords.new);
      setSaveMessage('Пароль успешно изменен!');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setSaveMessage(err.message || 'Ошибка изменения пароля');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      onUpdateUser({ avatar: base64 }); // immediate preview
      try {
        const { user: updated } = await authApi.updateProfile({ avatar: base64 });
        onUpdateUser(updated);
      } catch (err: any) {
        showMsg(err.message || 'Ошибка загрузки аватара', 'err');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancelShift = (_shiftId: string) => {
    showMsg('Отмена смены — обратитесь к администратору', 'err');
  };


  const handleCancelPromise = async (itemId: number) => {
    setMyPromisedItems(prev => prev.filter(i => i.id !== itemId));
    try {
      await promisedItemsApi.cancel(itemId);
    } catch {
      promisedItemsApi.getMyFull().then(setMyPromisedItems).catch(() => {});
    }
  };

  // Map API adoption data to UI shape
  const myAdoptions = (myData?.adoptions || []).map((a: any) => ({
    id: a.id,
    name: a.pet_name,
    image: a.pet_image || '',
    appliedAt: a.created_at,
    status: a.status === 'pending' ? 'На рассмотрении' : a.status === 'approved' ? 'Одобрена ✓' : 'Отклонена',
    statusKey: a.status === 'pending' ? 'received' : a.status === 'approved' ? 'meeting' : 'received',
  }));

  // Map API shift data to UI shape
  const myShifts = (myData?.shifts || []).map((s: any) => ({
    id: String(s.id),
    type: (s.task || '').toLowerCase().includes('уборк') ? 'cleaning'
        : (s.task || '').toLowerCase().includes('выгул') ? 'walking'
        : 'feeding',
    date: s.date,
    time: s.start_time ? `${s.start_time}–${s.end_time || ''}` : '',
    status: s.status,
    task: s.task,
  }));

  // Tab configuration with icons
  const tabs = [
    { id: 'data', label: 'Мои данные', icon: User, count: null },
    { id: 'applications', label: 'Заявки', icon: ClipboardList, count: myAdoptions.length || null },
    { id: 'favorites', label: 'Избранное', icon: Heart, count: favorites.length || null },
    { id: 'wards', label: 'Подопечные', icon: Shield, count: wards.length || null },
    { id: 'subscriptions', label: 'Пожертвования', icon: HandHeart, count: myDonations.length || null },
    { id: 'volunteer', label: 'Волонтерство', icon: Award, count: (myShifts.length + myPromisedItems.length) || null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Hero Section with Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#6052B3]/5 to-[#8B7ED8]/5 rounded-3xl -z-10" />
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div 
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6052B3] to-[#8B7ED8] p-1 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full h-full rounded-full bg-white overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="w-14 h-14 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#6052B3] rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#4A3E90] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name || 'Пользователь'}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <ProfileButton variant="secondary" icon={Edit3} onClick={() => setActiveTab('data')}>
                    Редактировать
                  </ProfileButton>
                  <ProfileButton variant="ghost" icon={LogOut} onClick={onLogout}>
                    Выйти
                  </ProfileButton>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              <StatCard 
                icon={HandHeart} 
                label="Всего пожертвовано" 
                value={`${totalDonated.toLocaleString('ru-RU')} ₸`}
                color="#6052B3"
                delay={0.1}
              />
              <StatCard 
                icon={PawPrint} 
                label="Заявок на усыновление" 
                value={myAdoptions.length}
                color="#10B981"
                delay={0.2}
              />
              <StatCard 
                icon={Heart} 
                label="В избранном" 
                value={favorites.length}
                color="#EC4899"
                delay={0.3}
              />
              <StatCard 
                icon={Award} 
                label="Волонтерских смен" 
                value={myShifts.length}
                color="#F59E0B"
                delay={0.4}
              />
            </div>
          </div>
        </motion.div>

        {/* Modern Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#6052B3] rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-[#6052B3]/10 text-[#6052B3]'}`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Personal Info Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#6052B3]/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-[#6052B3]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Личная информация</h2>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveData(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ProfileInput 
                        label="Имя" 
                        id="profile-name" 
                        placeholder="Ваше имя" 
                        icon={User}
                        value={formData.name} 
                        onChange={(e: any) => handleChange('name', e.target.value)} 
                        error={errors.name} 
                      />
                      <ProfileInput 
                        label="Телефон" 
                        id="profile-phone" 
                        placeholder="+7 (___) ___-__-__" 
                        icon={Phone}
                        value={formData.phone} 
                        onChange={(e: any) => handleChange('phone', e.target.value)} 
                        error={errors.phone} 
                      />
                      <ProfileInput 
                        label="Дата рождения" 
                        id="profile-birthday" 
                        placeholder="ДД.ММ.ГГГГ" 
                        icon={Calendar}
                        value={formData.birthday} 
                        onChange={(e: any) => handleChange('birthday', e.target.value)} 
                        error={errors.birthday} 
                      />
                      <ProfileInput 
                        label="Страна" 
                        id="profile-country" 
                        placeholder="Страна проживания" 
                        icon={MapPin}
                        value={formData.country} 
                        onChange={(e: any) => handleChange('country', e.target.value)} 
                      />
                      <ProfileInput 
                        label="Город" 
                        id="profile-city" 
                        placeholder="Город" 
                        icon={MapPin}
                        value={formData.city} 
                        onChange={(e: any) => handleChange('city', e.target.value)} 
                      />
                    </div>
                    <ProfileInput 
                      as="textarea" 
                      label="О себе" 
                      id="profile-about" 
                      placeholder="Расскажите немного о себе..." 
                      icon={FileText}
                      value={formData.about} 
                      onChange={(e: any) => handleChange('about', e.target.value)} 
                    />
                    <div className="flex items-center gap-4 mt-6">
                      <ProfileButton type="submit" icon={CheckCircle}>
                        Сохранить изменения
                      </ProfileButton>
                      {saveMessage && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-sm font-medium ${saveMsgType === 'err' ? 'text-red-500' : 'text-green-600'}`}
                        >
                          {saveMessage}
                        </motion.span>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Security Card */}
              <div className="space-y-6">
                {/* Email */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{formData.email}</p>
                  <p className="text-xs text-gray-400">Изменение email недоступно</p>
                </div>

                {/* Password */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Безопасность</h3>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }} className="space-y-4">
                    <ProfileInput 
                      label="Текущий пароль"
                      id="old-password"
                      type="password"
                      placeholder="••••••••"
                      value={passwords.old}
                      onChange={(e: any) => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                    />
                    <ProfileInput 
                      label="Новый пароль"
                      id="new-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={passwords.new}
                      onChange={(e: any) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    />
                    <ProfileInput 
                      label="Подтвердите пароль"
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChange={(e: any) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                    <ProfileButton type="submit" variant="secondary" icon={Lock} className="w-full">
                      Изменить пароль
                    </ProfileButton>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4"
            >
            {myAdoptions.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {myAdoptions.map((app: any) => (
                  <div key={app.id} className="bg-[#F5F5F5] rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-1">{app.name}</h3>
                      <p className="text-[#666666] text-[14px]">Дата подачи: {new Date(app.appliedAt).toLocaleDateString('ru-RU')}</p>
                      {app.meetingDate && (
                        <p className="text-[#6052B3] text-[12px] font-bold mt-1 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Встреча: {new Date(app.meetingDate).toLocaleDateString('ru-RU')} в {app.meetingTime}
                        </p>
                      )}
                      
                      {/* Status Tracker */}
                      <div className="mt-6 flex items-center gap-2 max-w-[400px]">
                        {[
                          { id: 'received', label: 'Заявка' },
                          { id: 'interview', label: 'Интервью' },
                          { id: 'meeting', label: 'Встреча' },
                          { id: 'probation', label: 'Срок' }
                        ].map((step, index, array) => {
                          const statusOrder = ['received', 'interview', 'meeting', 'probation', 'completed'];
                          const currentIdx = statusOrder.indexOf(app.statusKey || 'received');
                          const isCompleted = currentIdx > index;
                          const isActive = currentIdx === index;
                          
                          return (
                            <React.Fragment key={step.id}>
                              <div className="flex flex-col items-center gap-1.5 relative">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                                  isCompleted ? 'bg-green-500 text-white' : 
                                  isActive ? 'bg-[#6052B3] text-white ring-4 ring-[#6052B3]/20' : 
                                  'bg-gray-200 text-gray-400'
                                }`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap ${
                                  isActive ? 'text-[#6052B3]' : 'text-gray-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                              {index < array.length - 1 && (
                                <div className="flex-1 h-[2px] bg-gray-200 mb-5 relative overflow-hidden">
                                  <div 
                                    className="absolute inset-0 bg-green-500 transition-transform duration-1000 origin-left"
                                    style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${
                        app.status === 'Дома!' ? 'bg-green-100 text-green-600' : 'bg-[#6052B3]/10 text-[#6052B3]'
                      }`}>
                        {app.status}
                      </div>
                      <button 
                        onClick={() => onPetClick?.(app)}
                        className="text-[#666666] hover:text-[#1A1A1A] text-[13px] font-medium transition-colors"
                      >
                        Посмотреть анкету
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-2">У вас пока нет активных заявок</p>
                <p className="text-sm text-gray-400">Подайте заявку на усыновление питомца</p>
              </div>
            )}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4"
            >
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map(pet => (
                  <AdoptPetCard 
                    key={pet.id} 
                    pet={pet} 
                    isFavorite={true} 
                    onToggleFavorite={onToggleFavorite} 
                    onClick={() => onPetClick?.(pet)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-2">У вас пока нет избранных животных</p>
                <p className="text-sm text-gray-400">Добавляйте питомцев в избранное, чтобы не потерять</p>
              </div>
            )}
            </motion.div>
          )}

          {activeTab === 'wards' && (
            <motion.div
              key="wards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 space-y-6"
            >
            {wards.length > 0 ? (
              wards.map((ward: any) => (
                <div key={ward.id} className="bg-[#F5F5F5] rounded-[32px] p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-[240px] h-[240px] rounded-[24px] overflow-hidden shrink-0">
                      <img src={ward.image} alt={ward.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-[24px] font-bold text-[#1A1A1A]">{ward.name}</h3>
                          <p className="text-[#666666] text-[14px]">Опекунство с {new Date(ward.startedAt).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <div className="bg-[#6052B3]/10 text-[#6052B3] px-4 py-1.5 rounded-full text-[13px] font-bold">
                          {ward.guardianshipType === 'food' ? 'Питание' : 'Лечение'}
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          Фото-отчеты
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {ward.reports?.map((report: any) => (
                            <div key={report.id} className="bg-white rounded-2xl p-4 flex gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                <img src={report.image} alt="Report" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-[12px] text-[#888888] mb-1">{new Date(report.date).toLocaleDateString('ru-RU')}</p>
                                <p className="text-[14px] text-[#1A1A1A] leading-relaxed">{report.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[#666666] py-20 bg-[#F5F5F5] rounded-[32px]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                </div>
                <p>У вас пока нет подопечных животных.</p>
                <button 
                  onClick={() => (window as any).navigateToAdopt()}
                  className="mt-4 text-[#6052B3] font-bold hover:underline"
                >
                  Выбрать питомца
                </button>
              </div>
            )}
            </motion.div>
          )}

          {activeTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4"
            >
            {myDonations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myDonations.map((d: any) => {
                  const typeLabel = d.type === 'basic' ? 'Базовая подписка' : d.type === 'extended' ? 'Расширенная подписка' : 'Разовое пожертвование';
                  const typeColor = d.type === 'basic' ? 'bg-blue-100 text-blue-600' : d.type === 'extended' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600';
                  return (
                    <div key={d.id} className="bg-[#F5F5F5] rounded-[20px] p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#6052B3] shrink-0">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#1A1A1A]">{typeLabel}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${typeColor}`}>{d.type}</span>
                          </div>
                          <div className="text-[13px] text-[#666666] flex gap-3">
                            {d.payment_method && <span>{d.payment_method}</span>}
                            <span>{new Date(d.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[20px] font-bold text-[#1A1A1A] shrink-0">{d.amount.toLocaleString('ru-RU')} ₸</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HandHeart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-2">У вас пока нет пожертвований</p>
                <p className="text-sm text-gray-400">Поддержите приют — каждое пожертвование важно</p>
              </div>
            )}
            </motion.div>
          )}

          {activeTab === 'volunteer' && (
            <motion.div
              key="volunteer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
            {/* Shifts */}
            <div className="bg-[#F5F5F5] rounded-[32px] p-8">
              <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Мои смены
              </h3>
              {myShifts.length > 0 ? (
                <div className="space-y-4">
                  {[...myShifts]
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((shift: any) => (
                    <div key={shift.id} className="bg-white p-4 rounded-2xl flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-[#1A1A1A]">
                          {shift.task || (shift.type === 'walking' ? 'Выгул собак' : shift.type === 'cleaning' ? 'Уборка' : 'Кормление')}
                        </p>
                        <p className="text-[13px] text-[#666666]">
                          {shift.date} {shift.time ? `• ${shift.time}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[12px] font-bold">Подтверждено</div>
                        <button 
                          onClick={() => handleCancelShift(shift.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Отменить запись"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666666] text-[14px]">Вы пока не записаны на смены.</p>
              )}
            </div>

            {/* Promised Items */}
            <div className="bg-[#F5F5F5] rounded-[32px] p-8">
              <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                Я привезу
              </h3>
              {myPromisedItems.length > 0 ? (
                <div className="space-y-4">
                  {myPromisedItems.map((item: any) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{item.item}</p>
                        <p className="text-[13px] text-[#666666]">Количество: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[12px] font-bold">В ожидании</div>
                        <button 
                          onClick={() => handleCancelPromise(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Отменить"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Вы пока не отмечали вещи</p>
                </div>
              )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

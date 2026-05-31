import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Heart,
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  PawPrint,
  HandHeart,
  Home,
  Newspaper,
  Phone
} from 'lucide-react';
import { AboutPage } from './components/AboutPage';
import { LoginPage, RegisterPage, ForgotPasswordEmailPage, ForgotPasswordCodePage, ForgotPasswordNewPage } from './components/AuthPages';
import { ProfilePage } from './components/ProfilePage';
import { AdoptPetCard } from './components/AdoptPetCard';
import { AdoptPage } from './components/AdoptPage';
import { FundraisersPage } from './components/FundraisersPage';
import { HelpPage } from './components/HelpPage';
import { NewsPage } from './components/NewsPage';
import { authApi, petsApi, newsApi, fundraisersApi, settingsApi, usersApi, adoptionApi, activityApi, donationsApi, surrenderApi, favoritesApi, guardianshipsApi } from './api/client';
import { ContactsPage } from './components/ContactsPage';
import { CustomCursor } from './components/CustomCursor';
import { EasterEggs } from './components/EasterEggs';
import { SmartNotifications } from './components/SmartNotifications';
import { PetCardSkeleton, FundraiserSkeleton } from './components/Skeleton';
import { AdoptionQuiz } from './components/AdoptionQuiz';
import { GuardianModal } from './components/GuardianModal';
import { VolunteerPortal } from './components/VolunteerPortal';
import { AdminPanel } from './components/AdminPanel';
import { UserDashboard } from './components/UserDashboard';
import { AdoptionModal, VolunteerModal, DonationModal } from './components/Modals';
import { PetDetailModal } from './components/PetDetailModal';
import { cn } from './lib/utils';

// --- Scroll Reveal Wrapper ---
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

// --- Components ---
const SkeletonHome = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-24 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div className="max-w-[540px] space-y-8">
          <div className="flex items-center gap-4">
            <PetCardSkeleton />
          </div>
          <div className="space-y-4">
            <div className="h-16 w-full bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-16 w-3/4 bg-gray-100 animate-pulse rounded-xl" />
          </div>
          <div className="h-24 w-full bg-gray-100 animate-pulse rounded-xl" />
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-12 w-32 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        </div>
        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-[40px]" />
      </div>
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <PetCardSkeleton />
        <PetCardSkeleton />
        <PetCardSkeleton />
      </div>
    </div>
  );
};

const ImpactCounter = () => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [target, setTarget] = useState(1173);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    petsApi.getAll({ status: 'adopted', limit: 1 }).then((data: any) => {
      if (data?.total > 0) setTarget(data.total);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const duration = 2500; // 2.5 seconds animation

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, target]);

  const formattedCount = String(count).padStart(7, '0').split('');
  let foundNonZero = false;

  return (
    <section className="w-full bg-white py-20 lg:py-32 overflow-hidden" ref={ref}>
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Top Area (Title + Animals) */}
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center z-30">

          {/* Combined Pet Image (Static) */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <img
              src="/underDogCat.png"
              alt="Cat and Dog"
              className="w-full max-w-[1100px] h-full object-contain"
            />
          </div>

          {/* Title */}
          <div className="relative z-20 text-center mb-20">
            <h2 className="text-[40px] md:text-[64px] font-bold leading-[1.1] text-[#1A1A1A]">
              <span className="inline-block transition-transform cursor-default">Подарим</span><br />
              <span className="text-[#6052B3] italic font-serif">Дом</span><br />
              Пушистым
            </h2>

            {/* CTA Button */}
            <button
              onClick={() => {
                (window as any).navigateToAdopt?.();
              }}
              className="mt-8 bg-[#6052B3] text-white px-10 py-4 rounded-2xl font-bold text-[18px] shadow-lg hover:bg-[#52449c] transition-all hover:-translate-y-1"
            >
              Найти друга
            </button>

            {/* Accent marks */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute -right-12 md:-right-16 top-4 text-[#6052B3]"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26 L14 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 28 L24 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M26 30 L32 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Counter Box */}
        <div className="relative z-20 bg-[#6052B3] rounded-[24px] p-6 md:p-10 shadow-[0_30px_60px_rgba(96,82,179,0.4)] max-w-[800px] mx-auto -mt-16 md:-mt-24">

          {/* Digits */}
          <div className="flex justify-center bg-[#F4F4F4] rounded-[12px] overflow-hidden border border-[#E5E5E5]">
            {formattedCount.map((digit, i) => {
              if (digit !== '0') foundNonZero = true;
              const isLeadingZero = !foundNonZero && digit === '0';

              return (
                <div key={i} className="flex-1 flex items-center justify-center py-6 md:py-10 border-r border-[#D1D1D1] last:border-r-0">
                  <span className={`text-[48px] md:text-[80px] font-medium leading-none ${isLeadingZero ? 'text-[#A0A0A0]' : 'text-[#1A1A1A]'}`}>
                    {digit}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Text */}
          <p className="text-center text-white mt-6 md:mt-8 text-[15px] md:text-[17px]">
            Питомец получили помощь от ЖанДос
          </p>
        </div>

      </div>
    </section>
  );
};

const DONATION_CARD_STYLES = [
  { iconBg: 'bg-[#F0EFFF]', iconColor: 'text-[#6052B3]', progressColor: 'bg-[#6052B3]', progressBg: 'bg-[#E5E3F5]' },
  { iconBg: 'bg-[#E9F7EF]', iconColor: 'text-[#27AE60]', progressColor: 'bg-[#27AE60]', progressBg: 'bg-[#D4EEDF]' },
  { iconBg: 'bg-[#FFF6E5]', iconColor: 'text-[#F2994A]', progressColor: 'bg-[#F2994A]', progressBg: 'bg-[#FCECD4]' },
];

const DONATION_ICONS = [
  <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.43-2.4 1-3.44 0 0-1.82-6.42-.42-7 1.39-.58 4.64.27 6.42 2.26.65-.17 1.33-.26 2-.26z" /></svg>,
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10c.7-.7 1.69-1 2.62-1C21.83 9 23 10.17 23 12.38c0 1.6-.83 2.62-2 3.62l-9 8-9-8c-1.17-1-2-2.02-2-3.62C1 10.17 2.17 9 4.38 9c.93 0 1.92.3 2.62 1" /><path d="M12 14v-4" /><path d="M8 10v4" /><path d="M16 10v4" /></svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
];

function mapFundraiserToCard(f: any, idx: number) {
  const style = DONATION_CARD_STYLES[idx % DONATION_CARD_STYLES.length];
  const imageUrl = f.image?.trim() || f.photo?.trim() || '/funDog.png';
  return { 
    id: f.id, 
    title: f.title, 
    petName: f.title,
    description: f.description,
    collected: f.current_amount ?? 0, 
    goal: f.target_amount ?? 1, 
    image: imageUrl,
    icon: DONATION_ICONS[idx % DONATION_ICONS.length], 
    ...style 
  };
}

function mapFundraiserForPage(f: any) {
  const createdAt = f.created_at ? new Date(f.created_at).getTime() : Date.now();
  const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)));
  const imageUrl = f.image?.trim() || f.photo?.trim() || '/funDog.png';
  return {
    ...f,
    petName: f.title,
    collected: f.current_amount ?? 0,
    goal: f.target_amount ?? 1,
    daysLeft,
    donorCount: 0,
    urgent: (f.current_amount ?? 0) / (f.target_amount ?? 1) < 0.3,
    category: 'medical',
    image: imageUrl,
  };
}


// --- Components ---
const FeedItem = ({ item }: { key?: any, item: any }) => {
  const dt = item.created_at ? new Date(item.created_at) : null;
  const date = dt ? dt.toLocaleDateString('ru-RU') : (item.date ?? '');
  const time = dt ? dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : (item.time ?? '');
  const image = item.image ?? item.pet_image ?? null;
  const avatarColor = item.avatarColor ?? 'bg-[#6052B3]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-4 py-4"
    >
      <div className="w-10 h-10 shrink-0 rounded overflow-hidden">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${avatarColor}`}></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-[#1A1A1A] leading-snug">
          {item.type === 'adoption' ? (
            <><span className="text-[#6052B3] font-medium">{item.user_name ?? item.user}</span> подал(а) заявку на питомца <span className="text-[#6052B3] font-medium">{item.pet_name}</span></>
          ) : item.type === 'volunteer' ? (
            <><span className="text-[#6052B3] font-medium">{item.user_name ?? item.user}</span> стал(а) волонтёром</>
          ) : item.type === 'subscription' ? (
            <><span className="text-[#6052B3] font-medium">{item.user}</span> {item.action}</>
          ) : (
            <><span className="text-[#6052B3] font-medium">{item.pet ?? item.pet_name}</span> {item.action} <span className="text-[#6052B3] font-medium">{item.user ?? item.user_name}</span></>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A0A0A0]">
          <span>{date}</span>
          <span>{time}</span>
        </div>
      </div>
    </motion.div>
  );
};

const DonationCard = ({ category }: { key?: any, category: any }) => {
  const progressPercentage = Math.min(100, (category.collected / category.goal) * 100);

  return (
    <div className="p-6 rounded-[20px] border border-[#E5E5E5] bg-white group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.iconBg} ${category.iconColor} transition-transform group-hover:scale-110`}>
            {category.icon}
          </div>
          <div>
            <h4 className="text-[17px] font-bold text-[#1A1A1A] mb-1">{category.title}</h4>
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#888888]">Собрано {category.collected.toLocaleString('ru-RU')} ₸</p>
              <span className="text-[11px] font-bold text-[#6052B3] bg-[#6052B3]/10 px-2 py-0.5 rounded-full">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-[20px] font-bold text-[#1A1A1A]">
          ₸ {category.goal.toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-3 rounded-full ${category.progressBg} overflow-hidden relative`}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progressPercentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${category.progressColor} relative`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
};

const FundraiserCard = ({ data, onDonate }: { key?: any, data: any, onDonate?: (fundraiser: any) => void }) => {
  const progress = Math.min(100, (data.collected / data.goal) * 100);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = (amount?: number) => {
    onDonate?.(data);
  };

  return (
    <div className="w-[90vw] md:w-[850px] shrink-0 bg-white rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] snap-center">
      {/* Image */}
      <div className="w-full md:w-[320px] h-[240px] md:h-[320px] shrink-0 rounded-[16px] overflow-hidden bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]">
        <img 
          src={data.image && data.image.trim() !== '' ? data.image : '/funDog.png'} 
          alt={data.petName || data.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/funDog.png';
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-[18px] md:text-[20px] font-bold text-[#1A1A1A] leading-snug">
          <span className="text-[#6052B3]">{data.petName}</span> — {data.title}
        </h3>
        <p className="text-[13px] text-[#888888] italic mt-2">
          {data.description}
        </p>

        <div className="h-px w-full bg-[#E5E5E5] my-5"></div>

        {/* Progress Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#888888]">Собрано {data.collected.toLocaleString('ru-RU')} ₸</span>
              <span className="text-[11px] font-bold text-[#27AE60] bg-[#27AE60]/10 px-2 py-0.5 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <span className="text-[18px] font-bold text-[#1A1A1A]">₸ {data.goal.toLocaleString('ru-RU')}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#D4EEDF] overflow-hidden mb-6 relative">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-[#27AE60] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 mb-5">
          <button
            onClick={() => handleDonate()}
            className="flex-1 bg-[#27AE60] text-white px-4 py-3 rounded-[12px] font-medium text-[14px] hover:bg-[#219653] transition-colors whitespace-nowrap"
          >
            Помочь
          </button>
          <input
            type="number"
            placeholder="Сумма (₸)"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            className="w-full md:w-[140px] border border-[#E5E5E5] rounded-[12px] px-4 py-3 text-[14px] outline-none focus:border-[#6052B3] transition-colors"
          />
          <button
            onClick={() => handleDonate(Number(customAmount) || undefined)}
            disabled={!customAmount}
            className="w-full md:w-auto bg-[#6052B3] text-white px-8 py-3 rounded-[12px] font-medium text-[14px] hover:bg-[#52449c] transition-colors disabled:opacity-50"
          >
            Перейти
          </button>
        </div>

        {/* Подробнее */}
        <button
          onClick={() => handleDonate()}
          className="text-[12px] font-medium text-[#6052B3] hover:text-[#4a3f8c] transition-colors self-start"
        >
          Подробнее &gt;
        </button>
      </div>
    </div>
  );
};

const FundraisersCarousel = ({ fundraisers, onDonate }: { fundraisers: any[], onDonate?: (f: any) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate items to create infinite scroll effect (3 sets)
  const items = [...fundraisers, ...fundraisers, ...fundraisers];
  const offset = fundraisers.length;

  const getCardWidth = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return 0;
    const card = scrollRef.current.firstElementChild as HTMLElement;
    return card.offsetWidth + 24; // 24px is gap-6
  };

  useEffect(() => {
    // Initial scroll to the middle set
    const initScroll = () => {
      if (scrollRef.current) {
        const cardWidth = getCardWidth();
        if (cardWidth > 0) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = offset * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }
    };

    // Small delay to ensure layout is calculated
    const timeout = setTimeout(initScroll, 100);
    window.addEventListener('resize', initScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', initScroll);
    };
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const cardWidth = getCardWidth();
        if (cardWidth > 0) {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return;

    const scrollPosition = scrollRef.current.scrollLeft;
    const rawIndex = Math.round(scrollPosition / cardWidth);
    const normalizedIndex = rawIndex % fundraisers.length;

    setActiveIndex(normalizedIndex);

    // Infinite scroll logic: jump seamlessly when reaching ends
    if (rawIndex <= 0) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = offset * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }, 300);
    } else if (rawIndex >= items.length - 1) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = (offset * 2 - 1) * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }, 300);
    }
  };

  const scrollTo = (idx: number) => {
    if (scrollRef.current) {
      const cardWidth = getCardWidth();
      if (cardWidth === 0) return;

      const currentScroll = scrollRef.current.scrollLeft;
      const currentIndex = Math.round(currentScroll / cardWidth);
      const currentNormalized = currentIndex % fundraisers.length;

      let diff = idx - currentNormalized;
      // Optimize direction to scroll the shortest distance
      if (diff > fundraisers.length / 2) diff -= fundraisers.length;
      if (diff < -fundraisers.length / 2) diff += fundraisers.length;

      const targetIndex = currentIndex + diff;
      scrollRef.current.scrollTo({ left: targetIndex * cardWidth, behavior: 'smooth' });
    }
  };

  if (fundraisers.length === 0) return null;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 md:px-8 lg:px-[calc((100vw-850px)/2)] pb-8"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((fundraiser, idx) => (
          <FundraiserCard key={`${fundraiser.id}-${idx}`} data={fundraiser} onDonate={onDonate} />
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-2">
        {fundraisers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${activeIndex === idx ? 'bg-[#6052B3]' : 'bg-[#E5E3F5]'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


const CarouselRow = ({ items: originalItems, onPetClick, favorites = [], onToggleFavorite }: { items: any[], onPetClick?: (pet: any) => void, favorites?: any[], onToggleFavorite?: (pet: any) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate items to create infinite scroll effect (3 sets)
  const items = [...originalItems, ...originalItems, ...originalItems];
  const offset = originalItems.length;

  const getCardWidth = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return 0;
    const card = scrollRef.current.firstElementChild as HTMLElement;
    return card.offsetWidth + 24; // 24px is gap-6
  };

  useEffect(() => {
    // Initial scroll to the middle set
    const initScroll = () => {
      if (scrollRef.current) {
        const cardWidth = getCardWidth();
        if (cardWidth > 0) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = offset * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }
    };

    // Small delay to ensure layout is calculated
    const timeout = setTimeout(initScroll, 100);
    window.addEventListener('resize', initScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', initScroll);
    };
  }, [offset]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const cardWidth = getCardWidth();
        if (cardWidth > 0) {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return;

    const scrollPosition = scrollRef.current.scrollLeft;
    const rawIndex = Math.round(scrollPosition / cardWidth);

    // Infinite scroll logic: jump seamlessly when reaching ends
    if (rawIndex <= 0) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = offset * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }, 300);
    } else if (rawIndex >= items.length - 1) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = (offset * 2 - 1) * cardWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }, 300);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = getCardWidth();
      if (cardWidth > 0) {
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -cardWidth : cardWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div
      className="flex items-center gap-4 lg:gap-8 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex w-12 h-12 shrink-0 items-center justify-center text-[#D1D1D1] hover:text-[#1A1A1A] transition-colors"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-4 -mx-4 md:px-0 md:mx-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="snap-start w-[380px] shrink-0">
            <AdoptPetCard
              pet={item}
              isFavorite={favorites.some(f => f.id === item.id)}
              onToggleFavorite={onToggleFavorite}
              onClick={() => onPetClick?.(item)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex w-12 h-12 shrink-0 items-center justify-center text-[#6052B3] hover:text-[#4a3f8c] transition-colors"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M19 12l-7 7M19 12l-7-7" />
        </svg>
      </button>
    </div>
  );
};

const AdoptSuccessPage = ({ pet }: { pet: any }) => {
  return (
    <main className="w-full bg-[#F8F9FA] flex flex-col min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-1 flex flex-col justify-center">
        <div className="max-w-[900px] mx-auto w-full">
          <h1 className="text-[32px] md:text-[42px] font-bold text-[#3B3B58] mb-8 leading-tight">
            Уважаемый @user <span className="text-[#6B5BBE]">{pet?.name || 'Крошка'}</span> уже ждет вас
          </h1>

          <div className="space-y-4 text-[18px] md:text-[24px] text-[#1A1A1A] leading-relaxed">
            <p>
              Приезжайте по адресу <span className="text-[#6B5BBE]">Центральная улица, 154</span>. Алматы, Казахстан
            </p>
            <p>
              График работы 10:00 - 19:00 пн-вс
            </p>
            <p>
              Для уточнений можете обращаться по номеру <span className="text-[#6B5BBE]">+7 700 747 41 48</span>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-[400px] md:h-[500px] flex flex-col md:flex-row mt-auto">
        <div className="flex-1 h-full relative">
          <img src="https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1200&auto=format&fit=crop" alt="Shelter Exterior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <h2 className="text-white text-5xl md:text-7xl font-serif italic font-bold drop-shadow-lg" style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.5)' }}>ЖанДос</h2>
          </div>
        </div>
        <div className="flex-1 h-full relative">
          <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop" alt="Shelter Interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <h2 className="text-white text-5xl md:text-7xl font-serif italic font-bold drop-shadow-lg" style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.5)' }}>ЖанДос</h2>
          </div>
        </div>
      </div>
    </main>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className="fixed bottom-10 left-1/2 z-[9999] bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-green-500' : 'bg-[#6052B3]'}`}>
      {type === 'success' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      )}
    </div>
    <span className="text-[15px] font-medium">{message}</span>
    <button onClick={onClose} className="ml-auto text-white/50 hover:text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    </button>
  </motion.div>
);

const FindHomeProgramPage = ({ onNavigateToForm }: { onNavigateToForm: () => void }) => {
  const scenarios = [
    {
      img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400&auto=format&fit=crop",
      text: "Если ваш питомец стал родителем и нужно срочно раздать потомство",
      icon: "🐾"
    },
    {
      img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop",
      text: "Не можете взять бездомное животное к себе, но очень хотите помочь",
      icon: "💝"
    },
    {
      img: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=400&auto=format&fit=crop",
      text: "По личным причинам не можете заботиться о питомце",
      icon: "🏠"
    },
    {
      img: "https://images.unsplash.com/photo-1527526029430-319f10814151?q=80&w=400&auto=format&fit=crop",
      text: "Переезжаете и нужно отдать питомца в хорошие руки",
      icon: "📦"
    },
    {
      img: "https://images.unsplash.com/photo-1512608488970-1375d04b8684?q=80&w=400&auto=format&fit=crop",
      text: "У вас аллергия, а отдать питомца некому",
      icon: "🌸"
    },
    {
      img: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?q=80&w=400&auto=format&fit=crop",
      text: "Разводите редкие породы, но вам некогда заниматься продажей",
      icon: "✨"
    },
  ];

  const steps = [
    { num: "01", text: "Заполните короткую анкету о себе и питомце" },
    { num: "02", text: "Сотрудники свяжутся с вами для обсуждения деталей" },
    { num: "03", text: "Передаете животное нам за небольшую плату" },
    { num: "04", text: "Мы находим питомцу новый дом и ответственного хозяина" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF9FF] to-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#6B5BBE]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6B5BBE]/5 rounded-full blur-3xl" />
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Animated Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#6B5BBE]/10 text-[#6B5BBE] px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Heart className="w-4 h-4" />
              <span>Программа помощи питомцам</span>
            </motion.div>

            {/* Title with animated arrow */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.svg 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                width="120" 
                height="40" 
                viewBox="0 0 120 40" 
                fill="none" 
                className="hidden md:block"
              >
                <motion.path 
                  d="M5 30 Q 30 5, 60 20 T 110 15" 
                  stroke="#6B5BBE" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <motion.path 
                  d="M100 8 L 110 15 L 100 22" 
                  stroke="#6B5BBE" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                />
              </motion.svg>
              
              <h1 className="text-[48px] md:text-[64px] font-bold">
                <span className="text-[#1A1A1A]">Найди</span>{" "}
                <span className="text-[#6B5BBE] relative">
                  Дом
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-[#6B5BBE]/20 -z-10 origin-left rounded-full"
                  />
                </span>
              </h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-[700px] mx-auto leading-relaxed"
            >
              Программа приюта Жандос поможет вам спокойно и правильно передать питомца в заботливые руки. 
              Мы гарантируем безопасность и благополучие вашего хвостика.
            </motion.p>
          </motion.div>

          {/* Scenarios Section */}
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-[#1A1A1A] mb-12 flex items-center gap-3"
            >
              <span className="w-10 h-10 bg-[#6B5BBE] rounded-xl flex items-center justify-center text-white text-lg">
                ?
              </span>
              Когда это подойдет вам:
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scenarios.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Image Container */}
                  <div className="relative mb-6">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] overflow-hidden">
                      <img 
                        src={item.img} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Icon Badge */}
                    <div className="absolute -bottom-4 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                  </div>
                  
                  <p className="text-[15px] text-gray-700 leading-relaxed pt-4">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-[#6B5BBE] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: i * 0.2 }}
                className="absolute"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                  width: '2px',
                  height: '100px',
                  background: 'linear-gradient(to bottom, white, transparent)',
                  transform: `rotate(${15 + i * 10}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          >
            Как это работает?
          </motion.h3>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors"
              >
                <span className="text-4xl font-bold text-white/30">{step.num}</span>
                <p className="text-lg text-white font-light">{step.text}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <motion.button
              onClick={onNavigateToForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white text-[#6B5BBE] px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all flex items-center gap-3 mx-auto"
            >
              Заполнить анкету
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
            <p className="text-white/60 text-sm mt-4">Займет всего 5 минут</p>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 md:p-12 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-[#6B5BBE]/10 rounded-2xl flex items-center justify-center shrink-0">
                <PawPrint className="w-10 h-10 text-[#6B5BBE]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                  Почему доверяют нам?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Мы заботимся о каждом питомце как о своем. Все новые хозяева проходят тщательную проверку, 
                  а мы остаемся на связи даже после передачи животного. Ваш питомец будет в надежных руках.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

const FindHomeFormPage = ({ onReturnHome }: { onReturnHome: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    iin: '',
    phone: '',
    animalType: '',
    animalGender: '',
    health: '',
    breed: '',
    age: '',
    reason: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Фото не должно превышать 5 МБ');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSubmitError('');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('iin', formData.iin || '');
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('animal_type', formData.animalType || '');
      formDataToSend.append('animal_gender', formData.animalGender || '');
      formDataToSend.append('health', formData.health || '');
      formDataToSend.append('breed', formData.breed || '');
      formDataToSend.append('age', formData.age || '');
      formDataToSend.append('reason', formData.reason || '');
      formDataToSend.append('address', formData.address || '');
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      await surrenderApi.submitFormData(formDataToSend);
      setIsModalOpen(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Ошибка отправки заявки');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
      <h1 className="text-[40px] md:text-[48px] font-bold text-[#1A1A1A] mb-12 text-center">
        Анкета для <span className="text-[#6B5BBE]">передачи питомца</span>
      </h1>
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-[16px] font-medium text-[#1A1A1A]">Ваше Ф.И.О:</label>
            <input
              id="fullName"
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="iin" className="text-[16px] font-medium text-[#1A1A1A]">Ваш ИИН:</label>
            <input
              id="iin"
              required
              type="text"
              name="iin"
              value={formData.iin}
              onChange={handleChange}
              className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-[16px] font-medium text-[#1A1A1A]">Ваш номер телефона:</label>
            <input
              id="phone"
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
            />
          </div>
        </div>

        {/* Radio Groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {/* Animal Type */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-[16px] font-medium text-[#1A1A1A] mb-2">Животное:</legend>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="animalType" value="cat" checked={formData.animalType === 'cat'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Кот</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="animalType" value="dog" checked={formData.animalType === 'dog'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Собака</span>
              </label>
            </div>
          </fieldset>

          {/* Gender */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-[16px] font-medium text-[#1A1A1A] mb-2">Пол животного:</legend>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="animalGender" value="male" checked={formData.animalGender === 'male'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Мужской</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="animalGender" value="female" checked={formData.animalGender === 'female'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Женский</span>
              </label>
            </div>
          </fieldset>

          {/* Health */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-[16px] font-medium text-[#1A1A1A] mb-2">Имеются ли болезни или травмы:</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="health" value="yes" checked={formData.health === 'yes'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Да</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="health" value="dont_know" checked={formData.health === 'dont_know'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Точно незнаю</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="health" value="no" checked={formData.health === 'no'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Нет</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input required type="radio" name="health" value="past" checked={formData.health === 'past'} onChange={handleChange} className="w-5 h-5 accent-[#6B5BBE]" />
                <span className="text-[16px] text-[#1A1A1A] group-hover:text-[#6B5BBE] transition-colors">Раньше были</span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Breed & Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="breed" className="text-[16px] font-medium text-[#1A1A1A]">Порода: (пропустите, если незнаете)</label>
            <input id="breed" type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="age" className="text-[16px] font-medium text-[#1A1A1A]">Возраст: (примерно, если незнаете)</label>
            <input id="age" type="text" name="age" value={formData.age} onChange={handleChange} className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all" />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-4 mt-4">
          <label className="text-[16px] font-medium text-[#1A1A1A]">Фотография животного:</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative w-[200px] h-[150px]">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-[12px]"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-[200px] h-[150px] bg-[#D9D9D9] rounded-[12px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#c9c9c9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B5BBE] gap-2"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="black">
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
              <span className="text-[14px] text-[#666666]">Нажмите для загрузки</span>
            </button>
          )}
          <p className="text-[12px] text-[#888888]">Максимальный размер: 5 МБ (JPEG, PNG, WebP)</p>
        </div>

        {/* Textareas */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-[16px] font-medium text-[#1A1A1A]">Напишите кратко, почему отдаете животное:</label>
            <textarea
              id="reason"
              required
              name="reason"
              rows={3}
              value={formData.reason}
              onChange={(e: any) => handleChange(e)}
              className="w-full border border-[#E5E5E5] rounded-[8px] p-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-[16px] font-medium text-[#1A1A1A]">Адрес от куда можно забрать животное:</label>
            <input
              id="address"
              required
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-end gap-2 mt-8">
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
          <button type="submit" disabled={submitLoading} className="bg-[#6B5BBE] text-white px-10 py-3 rounded-[8px] font-medium text-[16px] hover:bg-[#5a4ba1] transition-colors disabled:opacity-50">
            {submitLoading ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] p-10 md:p-16 max-w-[600px] w-full relative flex flex-col items-center text-center">
            <button
              onClick={() => {
                setIsModalOpen(false);
                onReturnHome();
              }}
              className="absolute top-6 right-6 text-[#1A1A1A] hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-[28px] md:text-[36px] font-bold text-[#1A1A1A] leading-[1.2] mb-12 max-w-[400px]">
              Ваша заявка будет рассмотрена, мы позвоним с ответом
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-[120px] h-[120px] rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0 mb-4">
                <img
                  src="/logo.png"
                  alt="JanDos Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
                  }}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[#6052B3] text-[40px] font-bold leading-none" style={{ fontFamily: 'Georgia, serif' }}>JanDós</span>
                <span className="text-[#888888] text-[14px] font-medium tracking-wide mt-1">приют для животных</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const CheckIcon = () => (
  <div className="w-8 h-8 rounded-full bg-[#38A169] flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </div>
);

const CrossIcon = () => (
  <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </div>
);

const DonatePage = ({ user, onUpdateUser, onReturnHome, showToast }: { user: any, onUpdateUser: (data: any) => void, onReturnHome: () => void, showToast: (msg: string, type?: 'success' | 'info') => void }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'basic' | 'extended' | 'one-time' | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleOpenPayment = (amount: number | null, type: 'basic' | 'extended' | 'one-time') => {
    if (amount === null && !donationAmount) return;
    setSelectedAmount(amount !== null ? amount : Number(donationAmount));
    setSubscriptionType(type);
    setSelectedMethod(null);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod || !selectedAmount || !subscriptionType) return;

    setPaymentLoading(true);
    try {
      const methodLabel = selectedMethod === 'card' ? '•••• 4242' : selectedMethod === 'kaspi' ? 'Kaspi.kz' : selectedMethod === 'halyk' ? 'Halyk Bank' : 'Apple Pay';
      await donationsApi.create(selectedAmount, subscriptionType, methodLabel);
      setIsPaymentModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при обработке платежа', 'info');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 */}
        <div className="flex flex-col">
          <h1 className="text-[32px] md:text-[40px] font-bold text-[#1A1A1A] mb-4 leading-tight">
            Оформите подписку
          </h1>
          <p className="text-[14px] text-[#666666] mb-8">
            100% средств от подписки идут на содержание животных
          </p>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col">
          <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Базовая</h2>
          <p className="text-[14px] text-[#666666] mb-8">
            Благодаря вам животные будут получать поддержку каждый день и чувствовать себя в безопасности.
          </p>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col">
          <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Расширенная</h2>
          <p className="text-[14px] text-[#666666] mb-8">
            Ваша поддержка помогает спасать, восстанавливать и сопровождать животных на пути к новому дому.
          </p>
        </div>

        {/* Col 4 */}
        <div className="flex flex-col">
          <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Одноразовая</h2>
          <p className="text-[14px] text-[#666666] mb-8">
            Ваш вклад - это возможность поддержать животных приюта в любой момент. Улучшить условия их жизни и приблизить каждого питомца к заботе, безопасности и новому дому.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-[#E5E5E5] mb-8"></div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {/* Col 1 */}
        <div className="flex flex-col">
          <p className="text-[12px] text-[#666666] mb-4">
            Сумма выбранной подписки будет автоматически списываться каждый месяц, в день оформления.
          </p>
          <p className="text-[12px] text-[#E53935]">
            Вы можете отменить подписку в любое время.
          </p>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-[40px] font-bold text-[#1A1A1A]">7000</span>
            <span className="text-[24px] font-bold text-[#1A1A1A]">₸</span>
            <span className="text-[16px] text-[#666666] ml-1">/в месяц</span>
          </div>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-[40px] font-bold text-[#1A1A1A]">14 000</span>
            <span className="text-[24px] font-bold text-[#1A1A1A]">₸</span>
            <span className="text-[16px] text-[#666666] ml-1">/в месяц</span>
          </div>
        </div>

        {/* Col 4 */}
        <div className="flex flex-col">
          <p className="text-[12px] text-[#666666]">
            Разовое пожертвование может быть осуществлено на любую сумму и используется исключительно для нужд животных приюта.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-[#E5E5E5] mb-12"></div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left side (Cols 1, 2, 3) */}
        <div className="lg:col-span-3">
          <h3 className="text-[24px] font-bold text-[#1A1A1A] mb-8">На что идут пожертвования:</h3>

          <div className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Питание (корма, лакомства)</div>
              <div className="flex justify-center"><CheckIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Обустройства клеток(лежанки, миски)</div>
              <div className="flex justify-center"><CheckIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Наполнители, гигиенические средства</div>
              <div className="flex justify-center"><CheckIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Содержание приюта</div>
              <div className="flex justify-center"><CheckIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 5 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Обследование и лечение больных</div>
              <div className="flex justify-center"><CrossIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 6 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Прививки от блох, кастрация</div>
              <div className="flex justify-center"><CrossIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
            {/* Row 7 */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-[18px] text-[#4A4A4A]">Оплата волонтерам за их помощь</div>
              <div className="flex justify-center"><CrossIcon /></div>
              <div className="flex justify-center"><CheckIcon /></div>
            </div>
          </div>
        </div>

        {/* Right side (Col 4) */}
        <div className="lg:col-span-1 flex flex-col">
          <form
            className="bg-[#F5F5F5] rounded-[12px] p-6 mb-8 flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); handleOpenPayment(null, 'one-time'); }}
          >
            <div className="flex items-center gap-2 text-[#888888]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <label htmlFor="donation-amount" className="text-[14px] font-medium">Введите сумму пожертвования</label>
            </div>
            <div className="relative">
              <input
                id="donation-amount"
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Например, 5000"
                className="w-full bg-white border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-[16px] text-[#1A1A1A] outline-none focus:border-[#6B5BBE] focus:ring-2 focus:ring-[#6B5BBE]/20 transition-all"
                min="0"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] font-medium">₸</span>
            </div>
            <button
              type="submit"
              disabled={!donationAmount}
              className="w-full bg-[#6B5BBE] text-white py-4 rounded-[8px] font-medium text-[16px] hover:bg-[#5a4ba1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              ОТПРАВИТЬ
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-[#E5E5E5] my-12"></div>

      {/* Bottom Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div></div>
        <div className="flex justify-center">
          <button
            onClick={() => handleOpenPayment(7000, 'basic')}
            className="w-full max-w-[200px] bg-[#6B5BBE] text-white py-4 rounded-[8px] font-medium text-[16px] hover:bg-[#5a4ba1] transition-colors"
          >
            ОФОРМИТЬ
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => handleOpenPayment(14000, 'extended')}
            className="w-full max-w-[200px] bg-[#6B5BBE] text-white py-4 rounded-[8px] font-medium text-[16px] hover:bg-[#5a4ba1] transition-colors"
          >
            ОФОРМИТЬ
          </button>
        </div>
        <div className="flex justify-center">
          <button className="w-full max-w-[200px] bg-transparent text-transparent py-4 rounded-[8px] font-medium text-[16px] pointer-events-none">
            ОФОРМИТЬ
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] p-8 max-w-[500px] w-full relative flex flex-col"
            >
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-6 right-6 text-[#1A1A1A] hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-6">Выберите способ оплаты</h2>

              <div className="flex flex-col gap-3 mb-8">
                {[
                  { id: 'kaspi', name: 'Kaspi.kz', icon: 'K' },
                  { id: 'halyk', name: 'Halyk Bank', icon: 'H' },
                  { id: 'card', name: 'Банковская карта', icon: '💳' },
                  { id: 'apple', name: 'Apple Pay / Google Pay', icon: '📱' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-[12px] border-2 transition-colors ${selectedMethod === method.id ? 'border-[#6052B3] bg-[#6052B3]/5' : 'border-[#E5E5E5] hover:border-[#6052B3]/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[20px]">{method.icon}</span>
                      <span className="text-[16px] font-medium text-[#1A1A1A]">{method.name}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-[#6052B3]' : 'border-[#E5E5E5]'}`}>
                      {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-[#6052B3]"></div>}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={!selectedMethod || paymentLoading}
                className="w-full bg-[#6052B3] text-white py-4 rounded-[12px] font-medium text-[16px] hover:bg-[#52449c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? 'Обработка...' : `Оплатить ${selectedAmount ? `${selectedAmount.toLocaleString('ru-RU')} ₸` : ''}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] p-10 md:p-16 max-w-[600px] w-full relative flex flex-col items-center text-center"
            >
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onReturnHome();
                }}
                className="absolute top-6 right-6 text-[#1A1A1A] hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <h2 className="text-[28px] md:text-[36px] font-bold text-[#1A1A1A] leading-[1.2] mb-12 max-w-[400px]">
                Спасибо за ваше пожертвование!
              </h2>

              <div className="flex flex-col items-center">
                <div className="w-[120px] h-[120px] rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0 mb-4">
                  <img
                    src="/logo.png"
                    alt="JanDos Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
                    }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[24px] font-bold text-[#6052B3] leading-none tracking-tight font-serif">JanDos</div>
                  <div className="text-[10px] text-gray-500 font-medium mt-1">приют для животных</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [showAdoptionQuiz, setShowAdoptionQuiz] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [quizPet, setQuizPet] = useState<any>(null);
  const [guardianPet, setGuardianPet] = useState<any>(null);

  const [selectedPetForAdopt, setSelectedPetForAdopt] = useState<any>(null);
  const [selectedPetDetail, setSelectedPetDetail] = useState<any>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [homeFundraisers, setHomeFundraisers] = useState<any[]>([]);

  useEffect(() => {
    activityApi.getRecent().then(setFeedItems).catch(() => {});
    fundraisersApi.getAll().then((data: any[]) => {
      const active = data.filter((f: any) => f.status === 'active');
      setHomeFundraisers(active.map(mapFundraiserToCard));
    }).catch(() => {});
  }, []);

  const [adoptedPet, setAdoptedPet] = useState<any>(null);
  const [user, setUser] = useState<{
    name: string,
    email?: string,
    phone?: string,
    birthday?: string,
    country?: string,
    city?: string,
    about?: string,
    avatar?: string,
    applications?: any[],
  } | null>(null);

  const [pets, setPets] = useState<any[]>([]);
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const [activePet, setActivePet] = useState<any>(null);
  const [activeFundraiser, setActiveFundraiser] = useState<any>(null);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [petFilters, setPetFilters] = useState({ category: 'all', search: '' });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'adopt', label: 'Питомцы', icon: PawPrint },
    { id: 'fundraisers', label: 'Сборы', icon: Heart },
    { id: 'find-home', label: 'Найти Дом', icon: Home },
    { id: 'volunteer', label: 'Волонтерам', icon: HandHeart },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [petsRes, fundraisersRes, newsRes, settingsRes] = await Promise.all([
        petsApi.getAll(),
        fundraisersApi.getAll(),
        newsApi.getAll(),
        settingsApi.getAll()
      ]);

      setPets(petsRes.data || []);
      setFundraisers(fundraisersRes || []);
      setNews(newsRes.data || []);
      setSettings(settingsRes || {});
    } catch (error) {
      // silently fail — UI stays with empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Restore session on page load if token exists
  useEffect(() => {
    const token = localStorage.getItem('jandos_token');
    if (token && token.split('.').length === 3) {
      authApi.me().then(({ user: userData }) => {
        setUser(userData);
      }).catch(() => {
        localStorage.removeItem('jandos_token');
      });
    }
  }, []);

  // Listen for forced logout from token refresh interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setFavorites([]);
      setWards([]);
    };
    window.addEventListener('jandos:logout', handleForceLogout);
    return () => window.removeEventListener('jandos:logout', handleForceLogout);
  }, []);

  useEffect(() => {
    if (user) {
      favoritesApi.getMy().then(setFavorites).catch(() => {});
      guardianshipsApi.getMy().then(data => setWards(data.map((g: any) => ({
        id: g.pet_id,
        name: g.name,
        image: g.image,
        breed: g.breed,
        guardianshipType: g.type,
        monthlyAmount: g.monthly_amount,
        startedAt: g.created_at,
        reports: [],
      })))).catch(() => {});
    } else {
      setFavorites([]);
      setWards([]);
    }
  }, [user]);

  // Re-fetch relevant data when navigating to pages that show dynamic content
  // This ensures data from AdminPanel changes are reflected on frontend
  useEffect(() => {
    if (currentPage === 'news') {
      newsApi.getAll().then(res => setNews(res.data || [])).catch(() => {});
    } else if (currentPage === 'fundraisers') {
      fundraisersApi.getAll().then(data => {
        setFundraisers(data || []);
        const active = (data || []).filter((f: any) => f.status === 'active');
        setHomeFundraisers(active.map(mapFundraiserToCard));
      }).catch(() => {});
    } else if (currentPage === 'home') {
      // Refresh home page data when user returns to home
      petsApi.getAll().then(res => setPets(res.data || [])).catch(() => {});
      fundraisersApi.getAll().then(data => {
        setFundraisers(data || []);
        const active = (data || []).filter((f: any) => f.status === 'active');
        setHomeFundraisers(active.map(mapFundraiserToCard));
      }).catch(() => {});
      activityApi.getRecent().then(setFeedItems).catch(() => {});
    } else if (currentPage === 'adopt') {
      // Reload pets when user navigates to adopt page
      petsApi.getAll({ limit: 100 }).then(res => setPets(res.data || [])).catch(() => {});
    }
  }, [currentPage]);


  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesCategory = petFilters.category === 'all' || pet.category === petFilters.category;
      const matchesSearch = (pet.name ?? '').toLowerCase().includes(petFilters.search.toLowerCase()) ||
        (pet.breed ?? '').toLowerCase().includes(petFilters.search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pets, petFilters]);

  useEffect(() => {
    (window as any).handleAdoptFromCard = (pet: any) => {
      if (!user) {
        setCurrentPage('login');
      } else {
        setActivePet(pet);
        setShowAdoptionModal(true);
      }
    };
    return () => {
      delete (window as any).handleAdoptFromCard;
    };
  }, [user]);


  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('jandos_token', token);

    const fullUserData = {
      ...userData,
      phone: userData.phone || '',
      applications: userData.applications || [],
    };

    setUser(fullUserData);
    setCurrentPage('home');
    showToast(`Добро пожаловать, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('jandos_token');
    setUser(null);
    setCurrentPage('home');
    setIsMobileMenuOpen(false);
    showToast('Вы вышли из системы', 'info');
  };

  const handleUpdateUser = (updatedData: any) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : prev);
  };

  const handleToggleFavorite = async (pet: any) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }

    const isFavorite = favorites.some((f: any) => f.id === pet.id);

    if (isFavorite) {
      setFavorites(prev => prev.filter((f: any) => f.id !== pet.id));
      showToast(`Удалено из избранного: ${pet.name}`, 'info');
      favoritesApi.remove(pet.id).catch(() => {
        setFavorites(prev => [...prev, pet]);
      });
    } else {
      setFavorites(prev => [...prev, pet]);
      showToast(`Добавлено в избранное: ${pet.name}`, 'success');
      favoritesApi.add(pet.id).catch(() => {
        setFavorites(prev => prev.filter((f: any) => f.id !== pet.id));
      });
    }
  };

  const handleAdopt = (pet: any) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    setQuizPet(pet);
    setShowAdoptionQuiz(true);
  };

  const handleQuizComplete = async (quizData: any) => {
    if (user && quizPet) {
      const message = [
        `Жилье: ${quizData.housingType}`,
        `Опыт с животными: ${quizData.hasExperience}`,
        `Другие питомцы: ${quizData.currentPets || 'нет'}`,
        `Готовность к расходам: ${quizData.financialReady}`,
        `Желаемая дата встречи: ${quizData.meetingDate} в ${quizData.meetingTime}`,
      ].join('\n');

      try {
        await adoptionApi.submit(quizPet.id, message);
      } catch (err: any) {
        // 409 means already submitted — still proceed to success page
        if (!err.message?.includes('409') && !err.message?.toLowerCase().includes('уже')) {
          showToast(err.message || 'Ошибка отправки заявки', 'info');
        }
      }
    }
    setShowAdoptionQuiz(false);
    setAdoptedPet(quizPet);
    setCurrentPage('adopt-success');
    setQuizPet(null);
  };

  const handleGuardianConfirm = async (type: 'food' | 'treatment', amount: number) => {
    if (user && guardianPet) {
      const alreadyWard = wards.some((w: any) => w.id === guardianPet.id);

      if (!alreadyWard) {
        try {
          await guardianshipsApi.create(guardianPet.id, type, amount);
          const newWard = {
            id: guardianPet.id,
            name: guardianPet.name,
            image: guardianPet.image,
            breed: guardianPet.breed,
            guardianshipType: type,
            monthlyAmount: amount,
            startedAt: new Date().toISOString(),
            reports: [],
          };
          setWards(prev => [newWard, ...prev]);
          showToast(`Вы стали опекуном ${guardianPet.name}!`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Ошибка оформления опеки', 'info');
        }
      } else {
        showToast(`Вы уже являетесь опекуном ${guardianPet.name}`, 'info');
      }
    }
    setShowGuardianModal(false);
    setGuardianPet(null);
  };

  // Navigation helper for components that don't have direct access to setCurrentPage
  useEffect(() => {
    (window as any).navigateToAdopt = () => setCurrentPage('adopt');
    (window as any).navigateToDonate = () => setCurrentPage('donate');
    (window as any).handleAdoptFromCard = (pet: any) => handleAdopt(pet);
    return () => {
      delete (window as any).navigateToAdopt;
      delete (window as any).navigateToDonate;
      delete (window as any).handleAdoptFromCard;
    };
  }, [user]);

  const filteredCats = useMemo(() => {
    return pets.filter(p => p.category === 'Кошки' && (
      !homeSearchQuery ||
      (p.name ?? '').toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(homeSearchQuery.toLowerCase())
    ));
  }, [pets, homeSearchQuery]);

  const filteredDogs = useMemo(() => {
    return pets.filter(p => p.category === 'Собаки' && (
      !homeSearchQuery ||
      (p.name ?? '').toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(homeSearchQuery.toLowerCase())
    ));
  }, [pets, homeSearchQuery]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A] overflow-hidden">
      {/* User Modals */}
      <AdoptionModal
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
        pet={activePet}
        showToast={showToast}
      />
      <VolunteerModal
        isOpen={showVolunteerModal}
        onClose={() => setShowVolunteerModal(false)}
        showToast={showToast}
      />
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        fundraiser={activeFundraiser}
        showToast={showToast}
      />

      <CustomCursor />
      <EasterEggs />
      <SmartNotifications />
      <AnimatePresence>
        {showAdoptionQuiz && quizPet && (
          <AdoptionQuiz
            pet={quizPet}
            onClose={() => {
              setShowAdoptionQuiz(false);
              setQuizPet(null);
            }}
            onComplete={handleQuizComplete}
          />
        )}
        {showGuardianModal && guardianPet && (
          <GuardianModal
            pet={guardianPet}
            onClose={() => {
              setShowGuardianModal(false);
              setGuardianPet(null);
            }}
            onConfirm={handleGuardianConfirm}
          />
        )}
        {selectedPetDetail && (
          <PetDetailModal
            pet={selectedPetDetail}
            onClose={() => setSelectedPetDetail(null)}
            onAdopt={() => {
              setQuizPet(selectedPetDetail);
              setSelectedPetDetail(null);
              setShowAdoptionQuiz(true);
            }}
            isFavorite={favorites.some((f: any) => f.pet_id === selectedPetDetail.id || f.id === selectedPetDetail.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedPetDetail)}
          />
        )}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-sm py-3"
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setCurrentPage('home');
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="w-[48px] h-[48px] rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center overflow-hidden bg-white shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6052B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7h1a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-3V5a3 3 0 0 0-3-3z"/></svg>';
                }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[24px] font-bold text-[#6052B3] leading-none tracking-tight font-serif">JanDos</div>
              <div className="text-[9px] text-gray-500 font-medium mt-1 uppercase tracking-wider">приют для животных</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'adopt') setSelectedPetForAdopt(null);
                  setCurrentPage(item.id);
                }}
                className={cn(
                  "relative text-[15px] font-medium transition-all duration-200 py-2",
                  currentPage === item.id
                    ? "text-[#6052B3]"
                    : "text-[#666666] hover:text-[#1A1A1A]"
                )}
              >
                {item.label}
                {currentPage === item.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6052B3] rounded-full"
                  />
                )}
              </button>
            ))}

            {!!user && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={cn(
                  "text-[15px] font-medium transition-colors",
                  currentPage === 'dashboard' ? "text-[#6052B3]" : "text-[#666666] hover:text-[#1A1A1A]"
                )}
              >
                Дашборд
              </button>
            )}

            {(user?.role === 'admin' || user?.role === 'manager') && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={cn(
                  "text-[15px] font-medium transition-colors",
                  currentPage === 'admin' ? "text-[#6052B3]" : "text-[#666666] hover:text-[#1A1A1A]"
                )}
              >
                Админ
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('donate')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-semibold text-[14px] transition-all duration-300",
                currentPage === 'donate'
                  ? "bg-[#6052B3] text-white shadow-lg shadow-[#6052B3]/20"
                  : "bg-[#6052B3]/10 text-[#6052B3] hover:bg-[#6052B3] hover:text-white"
              )}
            >
              Пожертвовать
            </button>

            <div className="h-8 w-px bg-gray-200 mx-2" />

            {!!user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#6052B3] transition-all">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#6052B3]/10 flex items-center justify-center text-[#6052B3]">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold text-[#1A1A1A] leading-none">{user?.name}</span>
                    <span className="text-[11px] text-gray-500 mt-1">Профиль</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Выйти"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-[15px] font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors"
                >
                  Войти
                </button>
                <button
                  onClick={() => setCurrentPage('help')}
                  className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl font-medium text-[14px] hover:bg-black transition-all hover:shadow-lg"
                >
                  Помощь
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-[#1A1A1A]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all",
                        currentPage === item.id
                          ? "bg-[#6052B3] text-white"
                          : "bg-gray-50 text-[#666666] hover:bg-gray-100"
                      )}
                    >
                      <item.icon size={24} />
                      <span className="text-[13px] font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {!!user ? (
                    <>
                      <button
                        onClick={() => {
                          setCurrentPage('dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-[#1A1A1A]"
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard size={20} className="text-[#6052B3]" />
                          <span className="font-semibold">Дашборд</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentPage('profile');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-[#1A1A1A]"
                      >
                        <div className="flex items-center gap-3">
                          <User size={20} className="text-[#6052B3]" />
                          <span className="font-semibold">Профиль</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-500 font-semibold"
                      >
                        <LogOut size={20} />
                        <span>Выйти из аккаунта</span>
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setCurrentPage('login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-4 bg-gray-50 rounded-2xl text-[#1A1A1A] font-semibold text-center"
                      >
                        Войти
                      </button>
                      <button
                        onClick={() => {
                          setCurrentPage('help');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-4 bg-[#1A1A1A] text-white rounded-2xl font-semibold text-center"
                      >
                        Помощь
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCurrentPage('donate');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-5 bg-[#6052B3] text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-[#6052B3]/30 flex items-center justify-center gap-3"
                  >
                    <Heart size={20} fill="currentColor" />
                    Пожертвовать приюту
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[80px] md:h-[100px]" />

      {loading ? (
        <SkeletonHome />
      ) : (
        <>
          {currentPage === 'home' && (
            <>
              {/* Hero Section */}
              <ScrollReveal>
                <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-24 pb-20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Left Content */}
                    <div className="max-w-[540px]">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-px bg-[#D1D1D1]"></div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888888]">
                          {settings.pets_saved || '1000'} питомцев нашли дом
                        </span>
                      </div>

                      <h1 className="text-[56px] lg:text-[64px] font-bold leading-[1.05] text-[#1A1A1A] mb-6 tracking-tight">
                        {settings.hero_title ? (
                          <span dangerouslySetInnerHTML={{ __html: settings.hero_title.replace('JanDós', '<span class="text-[#6052B3]">JanDós</span>') }} />
                        ) : (
                          <>
                            Твой лучший друг<br />
                            уже ждет <span className="text-[#6052B3]">тебя</span>
                          </>
                        )}
                      </h1>

                      <p className="text-[#666666] text-[17px] leading-[1.6] mb-10 pr-4">
                        {settings.hero_subtitle || 'В нашем приюте живут кошки и собаки, которые по разным причинам остались без дома, но не потеряли веру в людей. Каждый из них — со своим характером, привычками и историей, и каждый мечтает об одном: найти заботливую семью.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => {
                            setCurrentPage('adopt');
                          }}
                          className="bg-[#6052B3] text-white px-8 py-3.5 rounded-[14px] font-medium hover:bg-[#52449c] transition-colors"
                        >
                          Приютить
                        </button>
                        <button
                          onClick={() => setShowVolunteerModal(true)}
                          className="border border-[#6052B3] text-[#6052B3] px-8 py-3.5 rounded-[14px] font-medium hover:bg-[#6052B3] hover:text-white transition-colors"
                        >
                          Стать волонтером
                        </button>
                      </div>
                    </div>

                    {/* Right Content (Images) */}
                    <div className="relative mt-16 lg:mt-0 w-full flex justify-end">
                      <div className="relative w-full max-w-[600px]">
                        {/* Purple Circle Background */}
                        <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[120%] h-[120%] -z-10 pointer-events-none">
                          <img
                            src="/circle-bg.png"
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="absolute top-[45%] left-[55%] -translate-x-[50%] -translate-y-[50%] w-[450px] h-[450px] bg-[#6052B3] rounded-full"></div>';
                            }}
                          />
                        </div>

                        {/* Pets Image */}
                        <img
                          src="/pets.png"
                          alt="Собака и кот"
                          className="w-full h-auto relative z-10 scale-[1.15] origin-bottom-right translate-x-4"
                          onError={(e) => {
                            e.currentTarget.src = '/main-image.png';
                            e.currentTarget.className = 'w-full h-[400px] object-cover rounded-[40px] relative z-10';
                          }}
                        />

                        {/* Floating Button */}
                        <button
                          onClick={() => setCurrentPage('about')}
                          className="absolute -top-8 right-4 lg:-right-4 z-20 bg-white rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] px-8 py-5 flex items-center justify-center hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer">
                          <span className="text-[#1A1A1A] font-bold text-[22px]">Узнать о нас</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              </ScrollReveal>

              {/* Features Section */}
              <ScrollReveal delay={0.2}>
                <section className="w-full bg-[#6052B3] relative overflow-hidden py-16 lg:py-24">
                  {/* Background Decorative Curves */}
                  <svg className="absolute left-0 top-0 h-full w-[200px] lg:w-[300px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,-10 C80,20 80,80 0,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                    <path d="M-30,-10 C50,20 50,80 -30,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                    <path d="M-60,-10 C20,20 20,80 -60,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <svg className="absolute right-0 top-0 h-full w-[200px] lg:w-[300px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M100,-10 C20,20 20,80 100,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                    <path d="M130,-10 C50,20 50,80 130,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                    <path d="M160,-10 C80,20 80,80 160,110" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                  </svg>

                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-stretch justify-between gap-12 md:gap-0">

                      {/* Feature 1 */}
                      <div className="flex-1 flex flex-col items-center text-center px-4 lg:px-8 group">
                        <div className="h-[80px] flex items-center justify-center mb-6">
                          <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <rect x="18" y="4" width="20" height="48" rx="4" />
                              <rect x="4" y="18" width="48" height="20" rx="4" />
                            </svg>
                          </motion.div>
                        </div>
                        <p className="text-white/90 text-[15px] lg:text-[16px] leading-[1.6]">
                          Все питомцы привиты и находятся<br className="hidden lg:block" /> под регулярным ветеринарным<br className="hidden lg:block" /> контролем.
                        </p>
                      </div>

                      {/* Divider 1 */}
                      <div className="hidden md:block w-px bg-white/15 my-4"></div>

                      {/* Feature 2 */}
                      <div className="flex-1 flex flex-col items-center text-center px-4 lg:px-8 group">
                        <div className="h-[80px] flex items-center justify-center mb-6">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          >
                            <svg width="96" height="32" viewBox="0 0 96 32" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                              <path d="M36 16H4 M4 16L14 6 M4 16L14 26" />
                              <path d="M44 4V28 M52 4V28" />
                              <path d="M60 16H92 M92 16L82 6 M92 16L82 26" />
                            </svg>
                          </motion.div>
                        </div>
                        <p className="text-white/90 text-[15px] lg:text-[16px] leading-[1.6]">
                          Вы можете подобрать<br className="hidden lg:block" /> питомца под свой образ<br className="hidden lg:block" /> жизни: спокойного, ласкового<br className="hidden lg:block" /> или активного, обученного<br className="hidden lg:block" /> базовым командам.
                        </p>
                      </div>

                      {/* Divider 2 */}
                      <div className="hidden md:block w-px bg-white/15 my-4"></div>

                      {/* Feature 3 */}
                      <div className="flex-1 flex flex-col items-center text-center px-4 lg:px-8 group">
                        <div className="h-[80px] flex items-center justify-center mb-6">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <svg width="56" height="72" viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="28" cy="28" r="24" fill="white" />
                              <path d="M28 52V68" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M14 68H42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          </motion.div>
                        </div>
                        <p className="text-white/90 text-[15px] lg:text-[16px] leading-[1.6]">
                          Большой выбор питомцев с<br className="hidden lg:block" /> разной внешностью, окрасом<br className="hidden lg:block" /> и породными особенностями.
                        </p>
                      </div>

                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* Search Section */}
              <section className="w-full bg-[#0A0A0A] py-10 lg:py-14">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  {/* Search Input */}
                  <div className="relative w-full max-w-[600px]">
                    <input
                      type="text"
                      value={homeSearchQuery}
                      onChange={(e) => setHomeSearchQuery(e.target.value)}
                      placeholder="Кто вас интересует.."
                      className="w-full bg-white rounded-[20px] py-4 pl-8 pr-14 text-[16px] text-[#1A1A1A] placeholder-[#A0A0A0] outline-none shadow-sm"
                    />
                    {homeSearchQuery && (
                      <button
                        onClick={() => setHomeSearchQuery('')}
                        className="absolute right-14 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                    <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>

                  {/* View All Link */}
                  <button
                    onClick={() => setCurrentPage('adopt')}
                    className="text-[#C5B4E3] font-bold text-[18px] hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Смотреть все
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* Pets Carousel Section */}
              <ScrollReveal delay={0.3}>
                <section className="w-full bg-[#FAFAFA] py-20 lg:py-24">
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-12">
                      {filteredCats.length > 0 && (
                        <CarouselRow
                          items={filteredCats}
                          favorites={favorites}
                          onToggleFavorite={handleToggleFavorite}
                          onPetClick={(pet) => {
                            setSelectedPetDetail(pet);
                          }}
                        />
                      )}
                      {filteredDogs.length > 0 && (
                        <CarouselRow
                          items={filteredDogs}
                          favorites={favorites}
                          onToggleFavorite={handleToggleFavorite}
                          onPetClick={(pet) => {
                            setSelectedPetDetail(pet);
                          }}
                        />
                      )}
                      {filteredCats.length === 0 && filteredDogs.length === 0 && (
                        <div className="text-center py-20">
                          <p className="text-[#888888] text-[18px]">По вашему запросу ничего не найдено</p>
                          <button
                            onClick={() => setHomeSearchQuery('')}
                            className="mt-4 text-[#6052B3] font-bold hover:underline"
                          >
                            Сбросить поиск
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* Subscription Banner Section */}
              <ScrollReveal delay={0.4}>
                <section className="w-full bg-[#FAFAFA] pb-20 lg:pb-24">
                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative w-full rounded-[32px] bg-[#6052B3] min-h-[320px] flex items-center mt-12">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px]">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83v58.34h-58.34l-.83-.83V0h58.34zM22.081 44.136c-1.079 1.078-2.826 1.078-3.905 0-1.079-1.079-1.079-2.827 0-3.905 1.079-1.079 2.826-1.079 3.905 0 1.079 1.078 1.079 2.826 0 3.905zm15.838 0c-1.079 1.078-2.826 1.078-3.905 0-1.079-1.079-1.079-2.827 0-3.905 1.079-1.079 2.826-1.079 3.905 0 1.079 1.078 1.079 2.826 0 3.905zm-7.919-7.919c-1.079 1.079-2.826 1.079-3.905 0-1.079-1.079-1.079-2.826 0-3.905 1.079-1.079 2.826-1.079 3.905 0 1.079 1.079 1.079 2.826 0 3.905zM22.081 15.864c-1.079-1.079-2.826-1.079-3.905 0-1.079 1.079-1.079 2.826 0 3.905 1.079 1.079 2.826 1.079 3.905 0 1.079-1.079 1.079-2.826 0-3.905zm15.838 0c-1.079-1.079-2.826-1.079-3.905 0-1.079 1.079-1.079 2.826 0 3.905 1.079 1.079 2.826 1.079 3.905 0 1.079-1.079 1.079-2.826 0-3.905zm-7.919 7.919c-1.079-1.079-2.826-1.079-3.905 0-1.079 1.079-1.079 2.826 0 3.905 1.079 1.079 2.826 1.079 3.905 0 1.079-1.079 1.079-2.826 0-3.905z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>
                      </div>

                      {/* Content Container */}
                      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-12">

                        {/* Left Content */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto z-20">
                          <h2 className="text-white text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[1.1] mb-8 tracking-tight">
                            Поддержите нас<br />
                            подпиской
                          </h2>

                          {/* Input Group */}
                          <div className="w-full max-w-[480px] bg-white rounded-[16px] p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
                            <div className="flex-1 flex items-center px-4">
                              <input
                                type="email"
                                placeholder="Ваш Email"
                                className="w-full bg-transparent text-[#1A1A1A] placeholder-[#888888] outline-none text-[15px]"
                              />
                            </div>
                            <button className="w-full sm:w-auto bg-[#6052B3] text-white px-8 py-3.5 rounded-[12px] font-medium text-[13px] tracking-wide uppercase hover:bg-[#52449c] transition-colors whitespace-nowrap shrink-0">
                              Узнать подробнее
                            </button>
                          </div>
                        </div>

                        {/* Right Content (Dog Image) */}
                        <div className="absolute right-0 bottom-0 w-[45%] max-w-[500px] h-[120%] z-30 hidden md:block pointer-events-none">
                          <img
                          src="/funDog.png"
                          alt="Счастливая собака"
                          className="w-full h-full object-cover object-top rounded-b-[32px]"
                          style={{
                            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* Feed and Donations Section */}
              <ScrollReveal delay={0.5}>
                <section className="w-full bg-white py-20 lg:py-24">
                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                      {/* Left Column: Feed */}
                      <div className="w-full lg:w-[45%] bg-white rounded-[32px] border border-[#E5E5E5] p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        {/* Feed Header */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                          <div className="h-px flex-1 bg-[#6052B3] relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-[#6052B3] rotate-45"></div>
                          </div>
                          <h2 className="text-[28px] font-bold text-[#1A1A1A] whitespace-nowrap">Лента помощи</h2>
                          <div className="h-px flex-1 bg-[#6052B3] relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border-b border-l border-[#6052B3] rotate-45"></div>
                          </div>
                        </div>

                        {/* Feed List */}
                        <div className="flex flex-col gap-2">
                          <AnimatePresence>
                            {feedItems.length > 0 ? feedItems.map((item) => (
                              <FeedItem key={`${item.type}-${item.id}`} item={item} />
                            )) : (
                              <p className="text-[#888888] text-[14px] py-8 text-center">Активность появится здесь</p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* View All Button */}
                        <button className="w-full mt-6 text-center text-[13px] font-bold text-[#6052B3] hover:text-[#4a3f8c] transition-colors flex items-center justify-center gap-1">
                          Смотреть все
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>

                      {/* Right Column: Donations & CTA */}
                      <div className="w-full lg:w-[55%] flex flex-col">

                        {/* Donations Card */}
                        <div className="w-full bg-white rounded-[32px] border border-[#E5E5E5] p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-10">
                            <h2 className="text-[28px] font-bold text-[#1A1A1A]">Пожертвования</h2>
                            <span className="text-[14px] font-medium text-[#888888] px-4 py-2 rounded-xl border border-[#E5E5E5]">Активные сборы</span>
                          </div>

                          {/* Categories List */}
                          <div className="flex flex-col gap-6">
                            {homeFundraisers.length > 0 ? homeFundraisers.map(category => (
                              <div
                                key={category.id}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (!user) { setCurrentPage('login'); return; }
                                  const raw = fundraisers.find((f: any) => f.id === category.id);
                                  if (raw) { setActiveFundraiser(raw); setShowDonationModal(true); }
                                }}
                              >
                                <DonationCard category={category} />
                              </div>
                            )) : (
                              <p className="text-[#888888] text-[14px] py-4 text-center">Активных сборов пока нет</p>
                            )}
                          </div>
                        </div>

                        {/* CTA Button Area */}
                        <div className="relative self-end mt-4 lg:mt-8">
                          {/* Spiral Arrow */}
                          <div className="absolute -left-32 -top-16 w-32 h-32 pointer-events-none hidden md:block">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#6052B3]">
                              <path d="M10 20 C 10 80, 40 90, 60 70 C 80 50, 40 30, 20 50 C 0 70, 30 90, 80 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                              <path d="M75 85 L 80 90 L 75 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          </div>

                          <button
                            onClick={() => setCurrentPage('donate')}
                            className="relative bg-[#6052B3] text-white px-10 py-5 rounded-[16px] text-[20px] font-medium hover:bg-[#52449c] transition-colors shadow-[0_20px_40px_rgba(96,82,179,0.4)] hover:shadow-[0_20px_40px_rgba(96,82,179,0.6)] hover:-translate-y-1 transform duration-200"
                          >
                            Пожертвовать Приюту
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* Open Fundraisers Section */}
              <ScrollReveal delay={0.1}>
                <section className="w-full bg-gradient-to-b from-white to-[#F5F5F5] py-20 lg:py-24 relative overflow-hidden">
                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                    <h2 className="text-[40px] md:text-[48px] font-bold text-[#1A1A1A]">
                      Открытые <span className="text-[#6052B3]">сборы</span>
                    </h2>
                  </div>

                  <FundraisersCarousel
                    fundraisers={homeFundraisers}
                    onDonate={(f) => {
                      if (!user) { setCurrentPage('login'); return; }
                      const raw = fundraisers.find((r: any) => r.id === f.id);
                      if (raw) { setActiveFundraiser(raw); setShowDonationModal(true); }
                      else { setActiveFundraiser(f); setShowDonationModal(true); }
                    }}
                  />
                </section>
              </ScrollReveal>

              {/* Impact Counter Section */}
              <ScrollReveal delay={0.2}>
                <ImpactCounter />
              </ScrollReveal>

              {/* How it Works Section */}
              <ScrollReveal delay={0.3}>
                <section className="w-full bg-[#F8F9FA] py-20 lg:py-32">
                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                      <h2 className="text-[40px] md:text-[48px] font-bold text-[#1A1A1A] mb-4">
                        Как стать <span className="text-[#6052B3]">хозяином</span>?
                      </h2>
                      <p className="text-[#666666] text-lg">Всего три простых шага к новой дружбе</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      {[
                        { step: '01', title: 'Выбери друга', desc: 'Посмотри анкеты наших подопечных и выбери того, кто тебе по душе.' },
                        { step: '02', title: 'Познакомься', desc: 'Приезжай в приют, чтобы провести время с будущим питомцем.' },
                        { step: '03', title: 'Забери домой', desc: 'Оформи документы и начни новую счастливую жизнь вместе.' }
                      ].map((item, i) => (
                        <div key={i} className="relative group">
                          <div className="text-[120px] font-bold text-[#6052B3]/5 absolute -top-16 -left-4 leading-none select-none">
                            {item.step}
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">{item.title}</h3>
                            <p className="text-[#666666] leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* About Preview Section */}
              <ScrollReveal delay={0.4}>
                <section className="w-full bg-white py-20 lg:py-32">
                  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                      <div className="flex-1 relative">
                        <div className="w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                          <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800&auto=format&fit=crop" alt="Happy Dog" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-8 -right-8 bg-[#6052B3] text-white p-8 rounded-[32px] shadow-xl hidden md:block">
                          <p className="text-4xl font-bold mb-1">10+</p>
                          <p className="text-sm opacity-80 uppercase tracking-wider">Лет опыта</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[40px] md:text-[48px] font-bold text-[#1A1A1A] mb-8 leading-tight font-serif">
                          Мы верим, что каждый заслуживает <span className="italic text-[#6052B3]">любовь</span>
                        </h2>
                        <p className="text-lg text-[#666666] leading-relaxed mb-10">
                          ЖанДос — это не просто приют, это место, где разбитые сердца находят исцеление. Мы заботимся о сотнях животных, помогая им восстановиться и найти свою идеальную семью.
                        </p>
                        <button
                          onClick={() => setCurrentPage('about')}
                          className="group flex items-center gap-3 text-[#6052B3] font-bold text-lg hover:gap-5 transition-all"
                        >
                          Узнать больше о нас
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            </>
          )}
        </>
      )}

      {currentPage === 'adopt' && (
        <AdoptPage />
      )}

      {currentPage === 'adopt-success' && (
        <AdoptSuccessPage pet={adoptedPet} />
      )}

      {currentPage === 'find-home' && (
        <FindHomeProgramPage onNavigateToForm={() => setCurrentPage('find-home-form')} />
      )}

      {currentPage === 'find-home-form' && (
        <FindHomeFormPage onReturnHome={() => setCurrentPage('home')} />
      )}

      {currentPage === 'donate' && (
        <DonatePage
          user={user}
          onUpdateUser={handleUpdateUser}
          onReturnHome={() => setCurrentPage('home')}
          showToast={showToast}
        />
      )}

      {currentPage === 'admin' && (user?.role === 'admin' || user?.role === 'manager') && (
        <AdminPanel user={user} />
      )}

      {currentPage === 'about' && (
        <AboutPage />
      )}

      {currentPage === 'fundraisers' && (
        <FundraisersPage
          fundraisers={fundraisers.map(mapFundraiserForPage)}
          donationCategories={homeFundraisers}
          onDonate={(f) => {
            if (!user) {
              setCurrentPage('login');
            } else {
              setActiveFundraiser(f);
              setShowDonationModal(true);
            }
          }}
          showToast={showToast}
        />
      )}

      {currentPage === 'dashboard' && user && (
        <UserDashboard user={user} />
      )}

      {currentPage === 'help' && (
        <HelpPage onNavigate={setCurrentPage} />
      )}

      {currentPage === 'news' && (
        <NewsPage news={news} />
      )}

      {currentPage === 'volunteer' && (
        <VolunteerPortal
          user={user}
          showToast={showToast}
        />
      )}

      {currentPage === 'contacts' && (
        <ContactsPage showToast={showToast} />
      )}

      {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <RegisterPage onLogin={handleLogin} onNavigate={setCurrentPage} />}
      {currentPage === 'forgot-password-email' && <ForgotPasswordEmailPage onNavigate={setCurrentPage} />}
      {currentPage === 'forgot-password-code' && <ForgotPasswordCodePage onNavigate={setCurrentPage} />}
      {currentPage === 'forgot-password-new' && <ForgotPasswordNewPage onNavigate={setCurrentPage} />}
      {currentPage === 'profile' && !!user && (
        <ProfilePage
          user={user}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          favorites={favorites}
          applications={user?.applications || []}
          wards={wards}
          onToggleFavorite={handleToggleFavorite}
          onPetClick={(pet) => {
            setSelectedPetDetail(pet);
          }}
        />
      )}

      {/* Footer */}
      <footer className="w-full bg-[#EBEBEB] pt-16 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8 md:gap-0">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="JanDos Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[#6052B3] text-[32px] font-bold leading-none" style={{ fontFamily: 'Georgia, serif' }}>JanDós</span>
                <span className="text-[#1A1A1A] text-[13px] font-medium tracking-wide mt-1">приют для животных</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
              {['Новости', 'Помощь', 'О Нас', 'Контакты'].map((link) => {
                let targetPage = '';
                if (link === 'О Нас') targetPage = 'about';
                if (link === 'Помощь') targetPage = 'help';
                if (link === 'Новости') targetPage = 'news';
                if (link === 'Контакты') targetPage = 'contacts';

                return (
                  <button
                    key={link}
                    onClick={() => targetPage ? setCurrentPage(targetPage) : null}
                    className="text-[#888888] font-medium text-[15px] hover:text-[#1A1A1A] transition-colors"
                  >
                    {link}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#D6D6D6] mb-8"></div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            {/* Copyright */}
            <div className="text-[#888888] text-[14px] leading-relaxed text-center md:text-left">
              ©<br />2026
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-6 text-[#1A1A1A]">
              {/* Share */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (navigator.share) {
                    navigator.share({
                      title: 'Приют для животных',
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Ссылка скопирована!', 'success');
                  }
                }}
                className="hover:text-[#6052B3] transition-colors"
                title="Поделиться"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12l-9-8v6c-8 0-13 4-15 12 4-5 9-6 15-6v6l9-10z" />
                </svg>
              </button>
              {/* Link */}
              <a href="#" className="hover:text-[#6052B3] transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-[#6052B3] transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="hover:text-[#6052B3] transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.304-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.61-.6.125-.89l10.736-4.135c.498-.184.933.11.725.82z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

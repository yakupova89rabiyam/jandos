import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Heart, 
  X, 
  ChevronDown, 
  PawPrint,
  SlidersHorizontal,
  Grid3X3,
  List,
  Share2,
  Check,
  ArrowRightLeft,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { AdoptPetCard } from './AdoptPetCard';
import { AdoptionQuiz } from './AdoptionQuiz';
import { PetCardSkeleton } from './Skeleton';
import { petsApi, favoritesApi, adoptionApi } from '../api/client';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

// Types
interface Pet {
  id: number;
  name: string;
  category: string;
  breed: string;
  age: string;
  ageGroup: string;
  gender: 'male' | 'female';
  color: string;
  size: string;
  description: string;
  image: string;
  status: 'available' | 'adopted' | 'pending' | 'urgent' | 'treatment' | 'reserved';
  created_at: string;
  views?: number;
  personality?: string[];
  health?: string;
  specialNeeds?: string;
}

interface FilterState {
  category: string[];
  gender: string[];
  size: string[];
  ageGroup: string[];
  color: string[];
  status: string[];
}

// Filter options
const FILTER_OPTIONS = {
  category: [
    { value: 'Собаки', label: 'Собаки', icon: '🐕' },
    { value: 'Кошки', label: 'Кошки', icon: '🐈' },
    { value: 'Другие', label: 'Другие', icon: '🐰' },
  ],
  gender: [
    { value: 'male', label: 'Мальчик', icon: '♂️' },
    { value: 'female', label: 'Девочка', icon: '♀️' },
  ],
  size: [
    { value: 'Маленький', label: 'Маленький', desc: 'до 10 кг' },
    { value: 'Средний', label: 'Средний', desc: '10-25 кг' },
    { value: 'Большой', label: 'Большой', desc: '25+ кг' },
  ],
  ageGroup: [
    { value: 'До 1 года', label: 'До 1 года', desc: 'Щенки и котята' },
    { value: '1-3 года', label: '1-3 года', desc: 'Молодые' },
    { value: '3-7 лет', label: '3-7 лет', desc: 'Взрослые' },
    { value: '7+ лет', label: '7+ лет', desc: 'Пожилые' },
  ],
  color: [
    { value: 'Черный', label: 'Черный', color: '#1A1A1A' },
    { value: 'Белый', label: 'Белый', color: '#F5F5F5' },
    { value: 'Рыжий', label: 'Рыжий', color: '#E67E22' },
    { value: 'Серый', label: 'Серый', color: '#7F8C8D' },
    { value: 'Коричневый', label: 'Коричневый', color: '#8B4513' },
    { value: 'Золотистый', label: 'Золотистый', color: '#D4AF37' },
    { value: 'Черно-рыжий', label: 'Черно-рыжий', color: 'linear-gradient(45deg, #1A1A1A, #E67E22)' },
    { value: 'Бело-рыжий', label: 'Бело-рыжий', color: 'linear-gradient(45deg, #F5F5F5, #E67E22)' },
    { value: 'Серо-белый', label: 'Серо-белый', color: 'linear-gradient(45deg, #7F8C8D, #F5F5F5)' },
    { value: 'Колор-пойнт', label: 'Колор-пойнт', color: '#E8D4C4' },
    { value: 'Табби', label: 'Табби', color: '#C9A66B' },
  ],
  status: [
    { value: 'available', label: 'Ищет дом', color: '#27AE60' },
    { value: 'urgent', label: 'Срочно', color: '#FF4D4D' },
    { value: 'treatment', label: 'На лечении', color: '#FFB800' },
    { value: 'reserved', label: 'Забронирован', color: '#6052B3' },
  ],
};

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'name_asc', label: 'По имени А-Я' },
  { value: 'name_desc', label: 'По имени Я-А' },
  { value: 'popular', label: 'По популярности' },
];

export const AdoptPage = () => {
  const { user } = useAppContext();
  
  // State
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    gender: [],
    size: [],
    ageGroup: [],
    color: [],
    status: [],
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const ITEMS_PER_PAGE = 12;

  // Fetch pets
  const fetchPets = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: 'available',
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.category.length === 1) params.category = filters.category[0];
      if (filters.gender.length === 1) params.gender = filters.gender[0];
      if (filters.size.length === 1) params.size = filters.size[0];
      if (filters.ageGroup.length === 1) params.ageGroup = filters.ageGroup[0];

      const response = await petsApi.getAll(params);
      
      if (reset) {
        setPets(response.data || []);
        setPage(1);
      } else {
        setPets(prev => [...prev, ...(response.data || [])]);
      }
      
      setTotalCount(response.total || 0);
      setHasMore(response.data?.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const data = await favoritesApi.getMy();
      setFavorites(data.map((f: any) => f.pet_id));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  };

  useEffect(() => {
    fetchPets(true);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPets(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort pets client-side
  const filteredPets = useMemo(() => {
    let result = [...pets];

    // Apply multi-select filters
    if (filters.category.length > 1) {
      result = result.filter(p => filters.category.includes(p.category));
    }
    if (filters.gender.length > 0) {
      result = result.filter(p => filters.gender.includes(p.gender));
    }
    if (filters.size.length > 0) {
      result = result.filter(p => filters.size.includes(p.size));
    }
    if (filters.ageGroup.length > 0) {
      result = result.filter(p => filters.ageGroup.includes(p.ageGroup));
    }
    if (filters.color.length > 0) {
      result = result.filter(p => filters.color.includes(p.color));
    }
    if (filters.status.length > 0) {
      result = result.filter(p => filters.status.includes(p.status));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    return result;
  }, [pets, filters, sortBy]);

  // Toggle favorite
  const toggleFavorite = async (pet: Pet) => {
    if (!user) {
      // Show login prompt
      window.dispatchEvent(new CustomEvent('jandos:showLogin'));
      return;
    }

    try {
      if (favorites.includes(pet.id)) {
        await favoritesApi.remove(pet.id);
        setFavorites(prev => prev.filter(id => id !== pet.id));
      } else {
        await favoritesApi.add(pet.id);
        setFavorites(prev => [...prev, pet.id]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Toggle compare
  const toggleCompare = (petId: number) => {
    setCompareList(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      }
      if (prev.length >= 3) {
        alert('Можно сравнивать максимум 3 питомца');
        return prev;
      }
      return [...prev, petId];
    });
  };

  // Handle adopt click
  const handleAdopt = (pet: Pet) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('jandos:showLogin'));
      return;
    }
    setSelectedPet(pet);
    setShowQuiz(true);
  };

  // Handle quiz complete
  const handleQuizComplete = async (quizData: any) => {
    if (!selectedPet) return;
    
    try {
      await adoptionApi.submit(selectedPet.id, JSON.stringify(quizData));
      setShowQuiz(false);
      setSelectedPet(null);
      alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
    } catch (err: any) {
      alert(err.message || 'Ошибка при отправке заявки');
    }
  };

  // Toggle filter
  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: [],
      gender: [],
      size: [],
      ageGroup: [],
      color: [],
      status: [],
    });
    setSearchQuery('');
  };

  // Active filters count
  const activeFiltersCount = Object.values(filters).flat().length + (searchQuery ? 1 : 0);

  // Load more
  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchPets(false);
  };

  // Compare pets data
  const comparePetsData = useMemo(() => {
    return pets.filter(p => compareList.includes(p.id));
  }, [pets, compareList]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#6052B3] via-[#7B6FD0] to-[#6052B3] py-16 lg:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white" />
        </div>
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-[14px] font-medium mb-6">
              <PawPrint className="w-4 h-4" />
              <span>Найди своего верного друга</span>
            </div>
            <h1 className="text-[36px] md:text-[48px] lg:text-[56px] font-bold text-white leading-tight mb-4">
              Питомцы, которые<br />ждут <span className="text-[#FDEBB3]">любящую семью</span>
            </h1>
            <p className="text-white/80 text-[16px] md:text-[18px] max-w-[600px] mx-auto">
              Каждый из этих хвостиков мечтает о доме. Используйте фильтры, чтобы найти идеального компаньона для себя.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 max-w-[700px] mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
              <input
                type="text"
                placeholder="Поиск по имени, породе или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white rounded-2xl text-[16px] text-[#1A1A1A] placeholder:text-[#999999] shadow-xl shadow-black/10 focus:outline-none focus:ring-4 focus:ring-[#6052B3]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[#999999] hover:bg-[#E5E5E5]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            {/* Left: Filter Toggle & Results Count */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-[14px] transition-all",
                  showFilters || activeFiltersCount > 0
                    ? "bg-[#6052B3] text-white"
                    : "bg-white text-[#1A1A1A] border border-[#E5E5E5] hover:border-[#6052B3]"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Фильтры</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-[12px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="text-[14px] text-[#666666]">
                Найдено: <strong className="text-[#1A1A1A]">{filteredPets.length}</strong> питомцев
              </span>
            </div>

            {/* Right: Sort & View Mode */}
            <div className="flex items-center gap-3">
              {/* Compare button */}
              {compareList.length > 0 && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-[#FDEBB3] text-[#8B6914] rounded-xl font-medium text-[14px] hover:bg-[#F5D88A] transition-colors"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Сравнение ({compareList.length})</span>
                </button>
              )}

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 pr-10 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#6052B3] cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
              </div>

              {/* View mode toggle */}
              <div className="flex bg-white border border-[#E5E5E5] rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'grid' ? "bg-[#6052B3] text-white" : "text-[#999999] hover:text-[#1A1A1A]"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'list' ? "bg-[#6052B3] text-white" : "text-[#999999] hover:text-[#1A1A1A]"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {/* Category */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-3">Категория</h4>
                      <div className="space-y-2">
                        {FILTER_OPTIONS.category.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              filters.category.includes(opt.value)
                                ? "bg-[#6052B3] border-[#6052B3]"
                                : "border-[#E5E5E5] group-hover:border-[#6052B3]"
                            )}>
                              {filters.category.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={filters.category.includes(opt.value)}
                              onChange={() => toggleFilter('category', opt.value)}
                            />
                            <span className="text-[14px]">{opt.icon} {opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-3">Пол</h4>
                      <div className="space-y-2">
                        {FILTER_OPTIONS.gender.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              filters.gender.includes(opt.value)
                                ? "bg-[#6052B3] border-[#6052B3]"
                                : "border-[#E5E5E5] group-hover:border-[#6052B3]"
                            )}>
                              {filters.gender.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={filters.gender.includes(opt.value)}
                              onChange={() => toggleFilter('gender', opt.value)}
                            />
                            <span className="text-[14px]">{opt.icon} {opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-3">Размер</h4>
                      <div className="space-y-2">
                        {FILTER_OPTIONS.size.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              filters.size.includes(opt.value)
                                ? "bg-[#6052B3] border-[#6052B3]"
                                : "border-[#E5E5E5] group-hover:border-[#6052B3]"
                            )}>
                              {filters.size.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={filters.size.includes(opt.value)}
                              onChange={() => toggleFilter('size', opt.value)}
                            />
                            <div className="text-[14px]">
                              <div>{opt.label}</div>
                              <div className="text-[11px] text-[#999999]">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-3">Возраст</h4>
                      <div className="space-y-2">
                        {FILTER_OPTIONS.ageGroup.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              filters.ageGroup.includes(opt.value)
                                ? "bg-[#6052B3] border-[#6052B3]"
                                : "border-[#E5E5E5] group-hover:border-[#6052B3]"
                            )}>
                              {filters.ageGroup.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={filters.ageGroup.includes(opt.value)}
                              onChange={() => toggleFilter('ageGroup', opt.value)}
                            />
                            <div className="text-[14px]">
                              <div>{opt.label}</div>
                              <div className="text-[11px] text-[#999999]">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-3">Статус</h4>
                      <div className="space-y-2">
                        {FILTER_OPTIONS.status.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              filters.status.includes(opt.value)
                                ? "bg-[#6052B3] border-[#6052B3]"
                                : "border-[#E5E5E5] group-hover:border-[#6052B3]"
                            )}>
                              {filters.status.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={filters.status.includes(opt.value)}
                              onChange={() => toggleFilter('status', opt.value)}
                            />
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: opt.color }}
                              />
                              <span className="text-[14px]">{opt.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-end">
                      <button
                        onClick={clearFilters}
                        className="text-[14px] text-[#6052B3] font-medium hover:underline text-left"
                      >
                        Сбросить все фильтры
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([category, values]) => {
                const valuesArray = values as string[];
                return valuesArray.map(value => {
                  const filterOptions = FILTER_OPTIONS[category as keyof typeof FILTER_OPTIONS] as Array<{value: string; label: string}> | undefined;
                  const label = filterOptions?.find(
                    (opt) => opt.value === value
                  )?.label || value;
                  
                  return (
                    <span
                      key={`${category}-${value}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6052B3]/10 text-[#6052B3] rounded-full text-[13px] font-medium"
                    >
                      {label}
                      <button
                        onClick={() => toggleFilter(category as keyof FilterState, value)}
                        className="w-4 h-4 rounded-full hover:bg-[#6052B3]/20 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                });
              })}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6052B3]/10 text-[#6052B3] rounded-full text-[13px] font-medium">
                  Поиск: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-4 h-4 rounded-full hover:bg-[#6052B3]/20 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Pets Grid/List */}
          {loading && pets.length === 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
              {[...Array(8)].map((_, i) => (
                <PetCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F0F0F0] flex items-center justify-center">
                <Search className="w-10 h-10 text-[#999999]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-2">Питомцы не найдены</h3>
              <p className="text-[#666666] mb-6">Попробуйте изменить параметры фильтров или поисковый запрос</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#6052B3] text-white rounded-xl font-medium hover:bg-[#4A3E90] transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {filteredPets.map((pet, index) => (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative group",
                      viewMode === 'list' && "bg-white rounded-2xl p-4 border border-[#E5E5E5] hover:shadow-lg transition-shadow"
                    )}
                  >
                    {/* Compare checkbox */}
                    <div className="absolute top-3 left-3 z-20">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm",
                          compareList.includes(pet.id)
                            ? "border-[#6052B3] bg-[#6052B3]"
                            : "border-[#E5E5E5]"
                        )}>
                          {compareList.includes(pet.id) && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={compareList.includes(pet.id)}
                          onChange={() => toggleCompare(pet.id)}
                        />
                      </label>
                    </div>

                    {viewMode === 'grid' ? (
                      <AdoptPetCard
                        pet={pet}
                        isFavorite={favorites.includes(pet.id)}
                        onToggleFavorite={() => toggleFavorite(pet)}
                        onClick={() => setSelectedPet(pet)}
                      />
                    ) : (
                      <div className="flex gap-4">
                        <div className="w-48 h-48 shrink-0 rounded-xl overflow-hidden">
                          <img 
                            src={pet.image} 
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-[24px] font-bold text-[#1A1A1A]">{pet.name}</h3>
                              <p className="text-[14px] text-[#666666]">{pet.breed} • {pet.age}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleFavorite(pet)}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                  favorites.includes(pet.id)
                                    ? "bg-[#E55C5C] text-white"
                                    : "bg-[#F0F0F0] text-[#999999] hover:bg-[#E5E5E5]"
                                )}
                              >
                                <Heart className="w-5 h-5" fill={favorites.includes(pet.id) ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[14px] text-[#666666] line-clamp-2 mb-4">{pet.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-[#E9F7EF] text-[#27AE60] rounded-full text-[12px] font-medium">
                              {pet.gender === 'male' ? '♂️ Мальчик' : '♀️ Девочка'}
                            </span>
                            <span className="px-3 py-1 bg-[#F0EFFF] text-[#6052B3] rounded-full text-[12px] font-medium">
                              {pet.size}
                            </span>
                            <span className="px-3 py-1 bg-[#FFF6E5] text-[#F2994A] rounded-full text-[12px] font-medium">
                              {pet.ageGroup}
                            </span>
                          </div>
                          <div className="mt-auto flex gap-3">
                            <button
                              onClick={() => handleAdopt(pet)}
                              className="flex-1 bg-[#6052B3] text-white py-3 rounded-xl font-medium hover:bg-[#4A3E90] transition-colors"
                            >
                              Приютить
                            </button>
                            <button
                              onClick={() => setSelectedPet(pet)}
                              className="px-6 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#1A1A1A] hover:border-[#6052B3] transition-colors"
                            >
                              Подробнее
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-4 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-medium hover:border-[#6052B3] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Загрузка...' : 'Загрузить ещё'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Adoption Quiz Modal */}
      <AnimatePresence>
        {showQuiz && selectedPet && (
          <AdoptionQuiz
            pet={selectedPet}
            onClose={() => {
              setShowQuiz(false);
              setSelectedPet(null);
            }}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-[1000px] w-full max-h-[90vh] overflow-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[24px] font-bold text-[#1A1A1A] flex items-center gap-2">
                  <ArrowRightLeft className="w-6 h-6 text-[#6052B3]" />
                  Сравнение питомцев
                </h2>
                <button
                  onClick={() => setShowCompare(false)}
                  className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center hover:bg-[#E5E5E5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`grid gap-4 ${comparePetsData.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {comparePetsData.map(pet => (
                  <div key={pet.id} className="border border-[#E5E5E5] rounded-2xl overflow-hidden">
                    <div className="aspect-square">
                      <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-1">{pet.name}</h3>
                      <p className="text-[14px] text-[#666666] mb-4">{pet.breed}</p>
                      
                      <div className="space-y-2 text-[14px]">
                        <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
                          <span className="text-[#999999]">Пол</span>
                          <span className="font-medium">{pet.gender === 'male' ? 'Мальчик' : 'Девочка'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
                          <span className="text-[#999999]">Возраст</span>
                          <span className="font-medium">{pet.age}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
                          <span className="text-[#999999]">Размер</span>
                          <span className="font-medium">{pet.size}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
                          <span className="text-[#999999]">Окрас</span>
                          <span className="font-medium">{pet.color}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdopt(pet)}
                        className="w-full mt-4 bg-[#6052B3] text-white py-3 rounded-xl font-medium hover:bg-[#4A3E90] transition-colors"
                      >
                        Приютить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Detail Modal */}
      <AnimatePresence>
        {selectedPet && !showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPet(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-[800px] w-full max-h-[90vh] overflow-auto"
            >
              <div className="relative h-[300px]">
                <img 
                  src={selectedPet.image} 
                  alt={selectedPet.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPet(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[12px] font-bold">
                    {selectedPet.category}
                  </span>
                  {selectedPet.status !== 'available' && (
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[12px] font-bold text-white",
                      selectedPet.status === 'urgent' && "bg-[#FF4D4D]",
                      selectedPet.status === 'treatment' && "bg-[#FFB800]",
                      selectedPet.status === 'reserved' && "bg-[#6052B3]",
                    )}>
                      {FILTER_OPTIONS.status.find(s => s.value === selectedPet.status)?.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-[32px] font-bold text-[#1A1A1A]">{selectedPet.name}</h2>
                    <p className="text-[16px] text-[#666666]">{selectedPet.breed} • {selectedPet.age}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedPet)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      favorites.includes(selectedPet.id)
                        ? "bg-[#E55C5C] text-white"
                        : "bg-[#F0F0F0] text-[#999999] hover:bg-[#E5E5E5]"
                    )}
                  >
                    <Heart className="w-6 h-6" fill={favorites.includes(selectedPet.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 bg-[#E9F7EF] text-[#27AE60] rounded-full text-[14px] font-medium">
                    {selectedPet.gender === 'male' ? '♂️ Мальчик' : '♀️ Девочка'}
                  </span>
                  <span className="px-4 py-2 bg-[#F0EFFF] text-[#6052B3] rounded-full text-[14px] font-medium">
                    {selectedPet.size}
                  </span>
                  <span className="px-4 py-2 bg-[#FFF6E5] text-[#F2994A] rounded-full text-[14px] font-medium">
                    {selectedPet.ageGroup}
                  </span>
                  <span className="px-4 py-2 bg-[#FDEBB3] text-[#8B6914] rounded-full text-[14px] font-medium">
                    {selectedPet.color}
                  </span>
                </div>

                <p className="text-[16px] text-[#666666] leading-relaxed mb-8">
                  {selectedPet.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-[#F8F8F8] rounded-xl">
                    <Calendar className="w-5 h-5 text-[#6052B3] mb-2" />
                    <p className="text-[12px] text-[#999999]">Возраст</p>
                    <p className="text-[16px] font-bold text-[#1A1A1A]">{selectedPet.age}</p>
                  </div>
                  <div className="p-4 bg-[#F8F8F8] rounded-xl">
                    <PawPrint className="w-5 h-5 text-[#6052B3] mb-2" />
                    <p className="text-[12px] text-[#999999]">Порода</p>
                    <p className="text-[16px] font-bold text-[#1A1A1A]">{selectedPet.breed}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex-1 bg-[#6052B3] text-white py-4 rounded-2xl font-bold text-[16px] hover:bg-[#4A3E90] transition-colors"
                  >
                    Приютить {selectedPet.name}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Ссылка скопирована!');
                    }}
                    className="px-6 py-4 border border-[#E5E5E5] rounded-2xl font-medium text-[#1A1A1A] hover:border-[#6052B3] transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

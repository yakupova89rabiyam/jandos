import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Dog, 
  Heart, 
  Newspaper, 
  Settings as SettingsIcon, 
  BarChart3, 
  ClipboardList, 
  UserPlus, 
  History,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Send,
  X,
  Eye,
  Download,
  Ban,
  UserCheck,
  FileText,
  LayoutTemplate,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { request, analyticsApi, petsApi, adoptionApi, volunteersApi, auditApi, usersApi, newsApi, fundraisersApi, settingsApi, graduatesApi, notificationsApi, mediaApi, needsApi, surrenderApi } from '../api/client';
import {
  DataTable,
  Filters,
  petFilters,
  userFilters,
  adoptionFilters,
  surrenderFilters,
  volunteerFilters,
  fundraiserFilters,
  newsFilters,
  BulkActions,
  createPetBulkActions,
  createUserBulkActions,
  StatCard,
  QuickActions,
  createQuickActions,
  AttentionWidget,
  PetDetailModal,
  AdoptionDetailModal,
  UserDetailModal,
  VolunteerDetailModal,
} from './admin';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  image: string;
  date: string;
  category: string;
}

interface Pet {
  id: number;
  name: string;
  category: string;
  breed: string;
  age: string;
  ageGroup: string;
  gender: string;
  color: string;
  size: string;
  description: string;
  image: string;
  status: 'available' | 'adopted' | 'pending';
  created_at: string;
}

interface Fundraiser {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  description: string;
  image: string;
  status: 'active' | 'completed';
  created_at: string;
}

interface AdoptionRequest {
  id: number;
  user_id: number;
  pet_id: number;
  user_name: string;
  user_email: string;
  pet_name: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  created_at: string;
}

interface VolunteerApplication {
  id: number;
  user_id: number;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  experience: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  created_at: string;
}

type TabType = 'dashboard' | 'users' | 'pets' | 'fundraisers' | 'news' | 'adoption' | 'volunteers' | 'shifts' | 'slots' | 'needs' | 'surrender' | 'media' | 'logs' | 'settings' | 'graduates';

export const AdminPanel = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [data, setData] = useState<{
    users: User[];
    pets: Pet[];
    fundraisers: Fundraiser[];
    news: News[];
    adoption: AdoptionRequest[];
    volunteers: VolunteerApplication[];
    shifts: any[];
    slots: any[];
    needs: any[];
    surrender: any[];
    logs: AuditLog[];
    media: any[];
    graduates: any[];
    settings: any;
    analytics: any;
  }>({
    users: [],
    pets: [],
    fundraisers: [],
    news: [],
    adoption: [],
    volunteers: [],
    shifts: [],
    slots: [],
    needs: [],
    surrender: [],
    logs: [],
    media: [],
    graduates: [],
    settings: {},
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [volunteersList, setVolunteersList] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [adminToast, setAdminToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Filter states for each tab
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [viewingPet, setViewingPet] = useState<any>(null);
  const [viewingAdoption, setViewingAdoption] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [viewingVolunteer, setViewingVolunteer] = useState<any>(null);
  const showAdminToast = (msg: string, ok = true) => {
    setAdminToast({ msg, ok });
    setTimeout(() => setAdminToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [analytics, petsRes, adoption, volunteers, logs] = await Promise.all([
          analyticsApi.get(),
          petsApi.getAll(),
          adoptionApi.getAll(),
          volunteersApi.getAll(),
          auditApi.getLogs()
        ]);

        setData(prev => ({
          ...prev,
          analytics,
          pets: petsRes.data || [],
          adoption,
          volunteers,
          logs
        }));
      } else {
        let result: any;
        switch (activeTab) {
          case 'users': result = await usersApi.getAll(); break;
          case 'pets': result = (await petsApi.getAll()).data || []; break;
          case 'fundraisers': result = await fundraisersApi.getAll(); break;
          case 'news': result = (await newsApi.getAll()).data || []; break;
          case 'adoption': result = await adoptionApi.getAll(); break;
          case 'volunteers': result = await volunteersApi.getAll(); break;
          case 'shifts': {
            const [shiftsResult, volResult] = await Promise.all([volunteersApi.getShifts(), volunteersApi.getAll()]);
            result = shiftsResult;
            setVolunteersList(volResult);
            break;
          }
          case 'slots': result = await volunteersApi.getSlots(); break;
          case 'needs': result = await needsApi.getAll(); break;
          case 'surrender': result = await surrenderApi.getAll(); break;
          case 'media': result = await mediaApi.getAll(); break;
          case 'logs': result = await auditApi.getLogs(); break;
          case 'settings': result = await settingsApi.getAll(); break;
          case 'graduates': result = await graduatesApi.getAll(); break;
          case 'pages': result = await request('/api/pages'); break;
          case 'footer': result = await request('/api/pages/settings/footer'); break;
          default: result = [];
        }
        setData(prev => ({ ...prev, [activeTab]: result }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await usersApi.changeRole(userId, newRole);
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, role: newRole as any } : u)
      }));
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleStatusUpdate = async (id: number, endpoint: string, status: string) => {
    try {
      await request(`/api/${endpoint}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены?')) return;
    try {
      const endpoint = activeTab === 'adoption' ? 'adoption_requests' :
                       activeTab === 'volunteers' ? 'volunteers' :
                       activeTab === 'slots' ? 'volunteers/slots' : activeTab;
      if (activeTab === 'needs') {
        await needsApi.delete(id);
      } else {
        await request(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      }
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleBroadcast = async () => {
    const message = prompt('Введите сообщение для всех пользователей:');
    if (!message) return;
    try {
      await notificationsApi.broadcast('Объявление от администрации', message);
      showAdminToast('Сообщение отправлено всем пользователям!');
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    const action = isBanned ? 'разблокировать' : 'заблокировать';
    if (!confirm(`Вы уверены, что хотите ${action} этого пользователя?`)) return;
    try {
      if (isBanned) {
        await usersApi.unban(userId);
        showAdminToast('Пользователь разблокирован');
      } else {
        await usersApi.ban(userId);
        showAdminToast('Пользователь заблокирован');
      }
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleMediaUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await mediaApi.upload(file);
        showAdminToast('Файл успешно добавлен в библиотеку!');
        fetchData();
      } catch (err: any) {
        showAdminToast(err.message, false);
      }
    };
    input.click();
  };

  const handleFormImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageUploading(true);
      try {
        const { url } = await mediaApi.upload(file);
        setFormData((prev: any) => ({ ...prev, image: url }));
        showAdminToast('Фото загружено');
      } catch (err: any) {
        showAdminToast(err.message || 'Ошибка загрузки', false);
      } finally {
        setImageUploading(false);
      }
    };
    input.click();
  };

  const handleMediaDelete = async (id: number) => {
    if (!confirm('Удалить этот файл?')) return;
    try {
      await mediaApi.delete(id);
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    const currentData = data[activeTab as keyof typeof data] as any[];
    if (!currentData || !Array.isArray(currentData)) return;

    if (type === 'csv') {
      const headers = Object.keys(currentData[0]).join(',');
      const rows = currentData.map(item => Object.values(item).map(v => `"${v}"`).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${activeTab}_export.csv`;
      link.click();
    } else {
      showAdminToast('PDF Export — в разработке. Используйте CSV.', false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = showModal === 'add' ? 'POST' : 'PATCH';
      const endpoint = activeTab === 'adoption' ? 'adoption_requests' :
                       activeTab === 'volunteers' ? 'volunteers' :
                       activeTab === 'slots' ? 'volunteers/slots' :
                       activeTab === 'shifts' ? 'volunteer_shifts' : activeTab;

      if (activeTab === 'settings') {
        await request('/api/settings', { method: 'PATCH', body: JSON.stringify(data.settings) });
      } else if (activeTab === 'needs') {
        if (showModal === 'add') {
          await needsApi.create(formData);
        } else {
          await needsApi.update(selectedItem.id, formData);
        }
      } else if (activeTab === 'pages') {
        await request(`/api/pages/${selectedItem.id}`, { method: 'PATCH', body: JSON.stringify(formData) });
      } else if (activeTab === 'footer') {
        await request('/api/pages/settings/footer', { method: 'PATCH', body: JSON.stringify(formData) });
      } else {
        const url = showModal === 'add' ? `/api/${endpoint}` : `/api/${endpoint}/${selectedItem.id}`;
        await request(url, { method, body: JSON.stringify(formData) });
      }
      setShowModal(null);
      setFormData({});
      setSelectedItem(null);
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const filteredData = useMemo(() => {
    const currentData = data[activeTab as keyof typeof data] as any[];
    if (!currentData || !Array.isArray(currentData)) return [];
    if (!searchTerm) return currentData;
    
    const lowerSearch = searchTerm.toLowerCase();
    return currentData.filter((item: any) => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, activeTab, searchTerm]);

  const openEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setShowModal('edit');
  };

  const openView = (item: any) => {
    setSelectedItem(item);
    setShowModal('view');
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [key]: value } }));
  };

  const handleResetFilters = () => {
    setFilters(prev => ({ ...prev, [activeTab]: {} }));
  };

  // Selection handlers
  const handleSelect = (id: string | number, selected: boolean) => {
    setSelectedIds(prev => selected ? [...prev, id] : prev.filter(i => i !== id));
  };

  const handleSelectAll = (selected: boolean, items: any[]) => {
    setSelectedIds(selected ? items.map(item => item.id) : []);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk action handlers
  const handleBulkStatusChange = async (status: string) => {
    if (!confirm(`Изменить статус у ${selectedIds.length} элементов?`)) return;
    try {
      if (activeTab === 'pets') {
        await Promise.all(selectedIds.map(id => petsApi.update(id, { status })));
      }
      showAdminToast('Статус обновлен');
      clearSelection();
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${selectedIds.length} элементов?`)) return;
    try {
      const endpoint = activeTab === 'adoption' ? 'adoption_requests' : activeTab;
      await Promise.all(selectedIds.map(id => 
        request(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      ));
      showAdminToast('Элементы удалены');
      clearSelection();
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleBulkRoleChange = async (role: string) => {
    if (!confirm(`Изменить роль у ${selectedIds.length} пользователей?`)) return;
    try {
      await Promise.all(selectedIds.map(id => usersApi.changeRole(id, role)));
      showAdminToast('Роль обновлена');
      clearSelection();
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  const handleBulkBan = async () => {
    if (!confirm(`Заблокировать ${selectedIds.length} пользователей?`)) return;
    try {
      await Promise.all(selectedIds.map(id => usersApi.ban(id)));
      showAdminToast('Пользователи заблокированы');
      clearSelection();
      fetchData();
    } catch (err: any) {
      showAdminToast(err.message, false);
    }
  };

  if (loading && !Object.values(data).some(v => Array.isArray(v) ? v.length > 0 : v !== null)) return <div className="p-20 text-center">Загрузка...</div>;
  if (error) return <div className="p-20 text-center text-red-500">Ошибка: {error}</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A1A] flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#6052B3]" />
            Админ-панель
          </h1>
          <p className="text-[#666666] text-[14px] mt-1">Управление JanDos: контент, пользователи и аналитика</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none w-[240px]"
            />
          </div>
          
          {/* Navigation */}
          <div className="flex bg-[#F0F0F0] p-1 rounded-xl flex-wrap gap-1">
            {/* Main Tabs */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === 'dashboard' ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Дашборд</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === 'analytics' ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
              )}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Аналитика</span>
            </button>

            {/* Content Group */}
            <div className="relative group">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  ['pets', 'news', 'fundraisers', 'media', 'graduates'].includes(activeTab) ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                <Dog className="w-4 h-4" />
                <span>Контент</span>
                <MoreVertical className="w-3 h-3 opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 min-w-[160px] hidden group-hover:block z-50">
                <button onClick={() => setActiveTab('pets')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'pets' && 'text-[#6052B3] font-bold')}><Dog className="w-4 h-4" /> Питомцы</button>
                <button onClick={() => setActiveTab('news')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'news' && 'text-[#6052B3] font-bold')}><Newspaper className="w-4 h-4" /> Новости</button>
                <button onClick={() => setActiveTab('fundraisers')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'fundraisers' && 'text-[#6052B3] font-bold')}><Heart className="w-4 h-4" /> Сборы</button>
                <button onClick={() => setActiveTab('graduates')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'graduates' && 'text-[#6052B3] font-bold')}><ArrowUpRight className="w-4 h-4" /> Выпускники</button>
                <button onClick={() => setActiveTab('media')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'media' && 'text-[#6052B3] font-bold')}><ArrowUpRight className="w-4 h-4" /> Медиа</button>
              </div>
            </div>

            {/* Applications Group */}
            <div className="relative group">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  ['adoption', 'surrender', 'volunteers', 'needs'].includes(activeTab) ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Заявки</span>
                <MoreVertical className="w-3 h-3 opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 min-w-[180px] hidden group-hover:block z-50">
                <button onClick={() => setActiveTab('adoption')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'adoption' && 'text-[#6052B3] font-bold')}><ClipboardList className="w-4 h-4" /> На питомца</button>
                <button onClick={() => setActiveTab('surrender')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'surrender' && 'text-[#6052B3] font-bold')}><ClipboardList className="w-4 h-4" /> Передача</button>
                <button onClick={() => setActiveTab('volunteers')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'volunteers' && 'text-[#6052B3] font-bold')}><UserPlus className="w-4 h-4" /> Волонтёры</button>
                <button onClick={() => setActiveTab('needs')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'needs' && 'text-[#6052B3] font-bold')}><ClipboardList className="w-4 h-4" /> Нужды</button>
              </div>
            </div>

            {/* Volunteers Schedule Group */}
            <div className="relative group">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  ['shifts', 'slots'].includes(activeTab) ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>График</span>
                <MoreVertical className="w-3 h-3 opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 min-w-[160px] hidden group-hover:block z-50">
                <button onClick={() => setActiveTab('shifts')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'shifts' && 'text-[#6052B3] font-bold')}><Calendar className="w-4 h-4" /> Смены</button>
                <button onClick={() => setActiveTab('slots')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'slots' && 'text-[#6052B3] font-bold')}><Calendar className="w-4 h-4" /> Слоты</button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === 'users' ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Люди</span>
            </button>

            {/* System Group */}
            <div className="relative group">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2",
                  ['logs', 'settings', 'pages', 'footer'].includes(activeTab) ? 'bg-white text-[#6052B3] shadow-sm' : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Система</span>
                <MoreVertical className="w-3 h-3 opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 min-w-[160px] hidden group-hover:block z-50">
                <button onClick={() => setActiveTab('pages')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'pages' && 'text-[#6052B3] font-bold')}><FileText className="w-4 h-4" /> Страницы</button>
                <button onClick={() => setActiveTab('footer')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'footer' && 'text-[#6052B3] font-bold')}><LayoutTemplate className="w-4 h-4" /> Футер</button>
                <button onClick={() => setActiveTab('logs')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'logs' && 'text-[#6052B3] font-bold')}><History className="w-4 h-4" /> Логи</button>
                <button onClick={() => setActiveTab('settings')} className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-[#F5F5F5] flex items-center gap-2", activeTab === 'settings' && 'text-[#6052B3] font-bold')}><SettingsIcon className="w-4 h-4" /> Настройки</button>
              </div>
            </div>
          </div>

          {['pets', 'news', 'fundraisers', 'shifts', 'slots', 'needs', 'graduates'].includes(activeTab) && (
            <div className="flex gap-2">
              {activeTab === 'users' && (
                <button 
                  onClick={handleBroadcast}
                  className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-[14px] font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Рассылка
                </button>
              )}
              <button 
                onClick={() => handleExport('csv')}
                className="bg-white border border-[#E5E5E5] text-[#1A1A1A] px-4 py-2.5 rounded-xl text-[14px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Экспорт
              </button>
              <button 
                onClick={() => {
                  const defaults: Record<string, any> = {
                    needs: { category: 'other', urgency: 'medium', quantity: '' },
                    slots: { type: 'walking', slots: 5 },
                    shifts: { status: 'scheduled' },
                  };
                  setFormData(defaults[activeTab] ?? {});
                  setShowModal('add');
                }}
                className="bg-[#6052B3] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#4A3E90] transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && data.analytics && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <QuickActions actions={createQuickActions(
                () => { setActiveTab('pets'); setShowModal('add'); },
                () => { setActiveTab('news'); setShowModal('add'); },
                () => { setActiveTab('fundraisers'); setShowModal('add'); },
                () => { setActiveTab('adoption'); },
                () => { setActiveTab('volunteers'); },
                () => { setActiveTab('surrender'); }
              )} />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Всего пожертвований"
                  value={`${(data.analytics.totalDonations?.total || 0).toLocaleString()} ₸`}
                  subtitle="За все время"
                  icon={DollarSign}
                  color="green"
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Питомцев в приюте"
                  value={data.pets.length}
                  subtitle={`${data.pets.filter((p: any) => p.status === 'available').length} ищут дом`}
                  icon={Dog}
                  color="blue"
                  onClick={() => setActiveTab('pets')}
                />
                <StatCard
                  title="Заявок на адопцию"
                  value={data.adoption.length}
                  subtitle={`${data.adoption.filter((a: any) => a.status === 'pending').length} на рассмотрении`}
                  icon={ClipboardList}
                  color="purple"
                  onClick={() => setActiveTab('adoption')}
                />
                <StatCard
                  title="Волонтеров"
                  value={data.volunteers.filter((v: any) => v.status === 'approved').length}
                  subtitle={`${data.volunteers.filter((v: any) => v.status === 'pending').length} новых заявок`}
                  icon={Users}
                  color="orange"
                  onClick={() => setActiveTab('volunteers')}
                />
              </div>

              {/* Attention Widget & Additional Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <AttentionWidget items={[
                    ...data.pets
                      .filter((p: any) => p.status === 'urgent')
                      .map((p: any) => ({
                        id: `urgent-${p.id}`,
                        type: 'urgent_pet' as const,
                        title: p.name,
                        subtitle: `${p.breed} • ${p.age}`,
                        priority: 'high' as const,
                        onClick: () => { setActiveTab('pets'); setViewingPet(p); },
                      })),
                    ...data.pets
                      .filter((p: any) => p.status === 'treatment')
                      .map((p: any) => ({
                        id: `treatment-${p.id}`,
                        type: 'treatment' as const,
                        title: p.name,
                        subtitle: 'На лечении',
                        priority: 'medium' as const,
                        onClick: () => { setActiveTab('pets'); setViewingPet(p); },
                      })),
                    ...data.adoption
                      .filter((a: any) => a.status === 'pending')
                      .slice(0, 5)
                      .map((a: any) => ({
                        id: `adoption-${a.id}`,
                        type: 'pending_adoption' as const,
                        title: `Заявка #${a.id}`,
                        subtitle: `${a.user_name} → ${a.pet_name}`,
                        date: new Date(a.created_at).toLocaleDateString('ru-RU'),
                        priority: 'medium' as const,
                        onClick: () => { setActiveTab('adoption'); setViewingAdoption(a); },
                      })),
                    ...data.surrender
                      .filter((s: any) => s.status === 'new')
                      .slice(0, 3)
                      .map((s: any) => ({
                        id: `surrender-${s.id}`,
                        type: 'pending_surrender' as const,
                        title: `Передача #${s.id}`,
                        subtitle: s.full_name,
                        date: new Date(s.created_at).toLocaleDateString('ru-RU'),
                        priority: 'high' as const,
                        onClick: () => { setActiveTab('surrender'); setSelectedItem(s); setShowModal('view'); },
                      })),
                  ]} />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[12px] text-[#999999]">Собаки</p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]">{data.pets.filter((p: any) => p.category === 'Собаки').length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[12px] text-[#999999]">Кошки</p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]">{data.pets.filter((p: any) => p.category === 'Кошки').length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[12px] text-[#999999]">Пристроено</p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]">{data.pets.filter((p: any) => p.status === 'adopted').length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[12px] text-[#999999]">Пользователи</p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]">{data.users.length}</p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                    <h3 className="text-[18px] font-bold mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#6052B3]" />
                      Динамика пожертвований
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.analytics.monthlyDonations}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6052B3" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6052B3" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#6052B3" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#6052B3]" />
                    Динамика пожертвований
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.analytics.monthlyDonations}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6052B3" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6052B3" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#6052B3" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#6052B3]" />
                    Тренды адопции
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.analytics.adoptionTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999999' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" fill="#6052B3" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-[#6052B3]" />
                    Последние действия
                  </h3>
                  <button onClick={() => setActiveTab('logs')} className="text-[13px] text-[#6052B3] font-bold hover:underline">Смотреть все</button>
                </div>
                <div className="space-y-4">
                  {data.logs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-[#F8F8F8] rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6052B3] font-bold border border-[#E5E5E5]">
                          {log.user_name?.[0]}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1A1A1A]">{log.action}</p>
                          <p className="text-[12px] text-[#666666]">{log.user_name} • {log.target_type} #{log.target_id}</p>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#999999]">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && data.analytics && (
            <div className="space-y-8">
              {/* Page Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[28px] font-bold text-[#1A1A1A]">Аналитика</h2>
                  <p className="text-[#666666] mt-1">Детальная статистика и отчёты</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none"
                    defaultValue="30"
                  >
                    <option value="7">7 дней</option>
                    <option value="30">30 дней</option>
                    <option value="90">3 месяца</option>
                    <option value="365">Год</option>
                  </select>
                  <button 
                    onClick={() => handleExport('csv')}
                    className="px-4 py-2 bg-[#6052B3] text-white rounded-xl text-[14px] font-bold hover:bg-[#4A3E90] transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Экспорт
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Всего питомцев"
                  value={data.pets.length}
                  trend={{ value: 12, isPositive: true }}
                  icon={Dog}
                  color="purple"
                />
                <StatCard
                  title="Заявки на адопцию"
                  value={data.adoption_requests?.length || 0}
                  trend={{ value: 8, isPositive: true }}
                  icon={ClipboardList}
                  color="green"
                />
                <StatCard
                  title="Новые пользователи"
                  value={data.users.filter((u: any) => {
                    const daysSince = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
                    return daysSince <= 30;
                  }).length}
                  trend={{ value: 15, isPositive: true }}
                  icon={Users}
                  color="orange"
                />
                <StatCard
                  title="Сборы средств"
                  value={`${(data.fundraisers?.reduce((sum: number, f: any) => sum + (f.current_amount || 0), 0) / 1000).toFixed(0)}K ₸`}
                  trend={{ value: 23, isPositive: true }}
                  icon={Heart}
                  color="red"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pet Status Distribution */}
                <div className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6">Статусы питомцев</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Ищут дом', value: data.pets.filter((p: any) => p.status === 'available').length, color: '#27AE60' },
                            { name: 'Срочно', value: data.pets.filter((p: any) => p.status === 'urgent').length, color: '#E74C3C' },
                            { name: 'На лечении', value: data.pets.filter((p: any) => p.status === 'treatment').length, color: '#F39C12' },
                            { name: 'Забронированы', value: data.pets.filter((p: any) => p.status === 'reserved').length, color: '#9B59B6' },
                            { name: 'Пристроены', value: data.pets.filter((p: any) => p.status === 'adopted').length, color: '#3498DB' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Ищут дом', value: data.pets.filter((p: any) => p.status === 'available').length, color: '#27AE60' },
                            { name: 'Срочно', value: data.pets.filter((p: any) => p.status === 'urgent').length, color: '#E74C3C' },
                            { name: 'На лечении', value: data.pets.filter((p: any) => p.status === 'treatment').length, color: '#F39C12' },
                            { name: 'Забронированы', value: data.pets.filter((p: any) => p.status === 'reserved').length, color: '#9B59B6' },
                            { name: 'Пристроены', value: data.pets.filter((p: any) => p.status === 'adopted').length, color: '#3498DB' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {[
                      { name: 'Ищут дом', color: '#27AE60', count: data.pets.filter((p: any) => p.status === 'available').length },
                      { name: 'Срочно', color: '#E74C3C', count: data.pets.filter((p: any) => p.status === 'urgent').length },
                      { name: 'На лечении', color: '#F39C12', count: data.pets.filter((p: any) => p.status === 'treatment').length },
                      { name: 'Забронированы', color: '#9B59B6', count: data.pets.filter((p: any) => p.status === 'reserved').length },
                      { name: 'Пристроены', color: '#3498DB', count: data.pets.filter((p: any) => p.status === 'adopted').length },
                    ].filter(d => d.count > 0).map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[12px] text-[#666666]">{item.name} ({item.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adoption Requests Status */}
                <div className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6">Заявки на адопцию</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'На рассмотрении', value: data.adoption_requests?.filter((r: any) => r.status === 'pending').length || 0, color: '#F39C12' },
                            { name: 'Одобрено', value: data.adoption_requests?.filter((r: any) => r.status === 'approved').length || 0, color: '#27AE60' },
                            { name: 'Отклонено', value: data.adoption_requests?.filter((r: any) => r.status === 'rejected').length || 0, color: '#E74C3C' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'На рассмотрении', value: data.adoption_requests?.filter((r: any) => r.status === 'pending').length || 0, color: '#F39C12' },
                            { name: 'Одобрено', value: data.adoption_requests?.filter((r: any) => r.status === 'approved').length || 0, color: '#27AE60' },
                            { name: 'Отклонено', value: data.adoption_requests?.filter((r: any) => r.status === 'rejected').length || 0, color: '#E74C3C' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {[
                      { name: 'На рассмотрении', color: '#F39C12', count: data.adoption_requests?.filter((r: any) => r.status === 'pending').length || 0 },
                      { name: 'Одобрено', color: '#27AE60', count: data.adoption_requests?.filter((r: any) => r.status === 'approved').length || 0 },
                      { name: 'Отклонено', color: '#E74C3C', count: data.adoption_requests?.filter((r: any) => r.status === 'rejected').length || 0 },
                    ].filter(d => d.count > 0).map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[12px] text-[#666666]">{item.name} ({item.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Trends */}
                <div className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm lg:col-span-2">
                  <h3 className="text-[18px] font-bold mb-6">Динамика заявок</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { month: 'Янв', adoption: 12, volunteers: 5, surrender: 3 },
                          { month: 'Фев', adoption: 18, volunteers: 8, surrender: 5 },
                          { month: 'Мар', adoption: 25, volunteers: 12, surrender: 7 },
                          { month: 'Апр', adoption: 22, volunteers: 10, surrender: 4 },
                          { month: 'Май', adoption: 30, volunteers: 15, surrender: 8 },
                          { month: 'Июн', adoption: 35, volunteers: 18, surrender: 6 },
                        ]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                        <XAxis dataKey="month" tick={{ fill: '#666666', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#666666', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="adoption" name="Адопция" fill="#6052B3" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="volunteers" name="Волонтёры" fill="#27AE60" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="surrender" name="Передача" fill="#F39C12" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Roles Distribution */}
                <div className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6">Роли пользователей</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Пользователи', value: data.users.filter((u: any) => u.role === 'user').length, color: '#6052B3' },
                            { name: 'Менеджеры', value: data.users.filter((u: any) => u.role === 'manager').length, color: '#3498DB' },
                            { name: 'Админы', value: data.users.filter((u: any) => u.role === 'admin').length, color: '#E74C3C' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Пользователи', value: data.users.filter((u: any) => u.role === 'user').length, color: '#6052B3' },
                            { name: 'Менеджеры', value: data.users.filter((u: any) => u.role === 'manager').length, color: '#3498DB' },
                            { name: 'Админы', value: data.users.filter((u: any) => u.role === 'admin').length, color: '#E74C3C' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fundraisers Progress */}
                <div className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-[18px] font-bold mb-6">Сборы средств</h3>
                  <div className="space-y-4">
                    {data.fundraisers?.slice(0, 5).map((f: any) => {
                      const progress = Math.min(100, (f.current_amount / f.target_amount) * 100);
                      return (
                        <div key={f.id} className="space-y-2">
                          <div className="flex justify-between text-[14px]">
                            <span className="font-medium text-[#1A1A1A] truncate max-w-[200px]">{f.title}</span>
                            <span className="text-[#666666]">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#6052B3] rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[12px] text-[#999999]">
                            <span>{f.current_amount.toLocaleString()} ₸</span>
                            <span>{f.target_amount.toLocaleString()} ₸</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Pets Tab */}
          {activeTab === 'pets' && (
            <div className="space-y-6">
              {/* Filters */}
              <Filters
                config={petFilters}
                values={filters['pets'] || {}}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <span className="text-[#666666]">Всего: <strong className="text-[#1A1A1A]">{data.pets.length}</strong></span>
                <span className="text-green-600">Ищут дом: <strong>{data.pets.filter((p: any) => p.status === 'available').length}</strong></span>
                <span className="text-red-600">Срочно: <strong>{data.pets.filter((p: any) => p.status === 'urgent').length}</strong></span>
                <span className="text-amber-600">На лечении: <strong>{data.pets.filter((p: any) => p.status === 'treatment').length}</strong></span>
                <span className="text-blue-600">Пристроены: <strong>{data.pets.filter((p: any) => p.status === 'adopted').length}</strong></span>
              </div>

              {/* Data Table */}
              <DataTable
                data={data.pets.filter((pet: any) => {
                  const f = filters['pets'] || {};
                  if (f.search && !(
                    pet.name?.toLowerCase().includes(f.search.toLowerCase()) ||
                    pet.breed?.toLowerCase().includes(f.search.toLowerCase()) ||
                    pet.description?.toLowerCase().includes(f.search.toLowerCase())
                  )) return false;
                  if (f.category && pet.category !== f.category) return false;
                  if (f.status && pet.status !== f.status) return false;
                  if (f.gender && pet.gender !== f.gender) return false;
                  if (f.size && pet.size !== f.size) return false;
                  return true;
                })}
                columns={[
                  {
                    key: 'pet',
                    header: 'Питомец',
                    render: (pet: any) => (
                      <div className="flex items-center gap-3">
                        <img src={pet.image} alt={pet.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <span className="font-medium text-[#1A1A1A] block">{pet.name}</span>
                          <span className="text-[12px] text-[#999999]">{pet.breed}</span>
                        </div>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'category',
                    header: 'Категория',
                    render: (pet: any) => (
                      <div className="flex flex-col gap-1">
                        <span className="text-[#666666]">{pet.category}</span>
                        <div className="flex gap-1">
                          <span className="px-2 py-0.5 bg-[#F0EFFF] text-[#6052B3] rounded text-[10px] font-medium">
                            {pet.gender === 'male' ? '♂' : '♀'} {pet.ageGroup}
                          </span>
                          <span className="px-2 py-0.5 bg-[#E9F7EF] text-[#27AE60] rounded text-[10px] font-medium">
                            {pet.size}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Статус',
                    render: (pet: any) => (
                      <select
                        value={pet.status}
                        onChange={async (e) => {
                          try {
                            await petsApi.update(pet.id, { status: e.target.value });
                            setData(prev => ({
                              ...prev,
                              pets: prev.pets.map((p: any) => p.id === pet.id ? { ...p, status: e.target.value } : p)
                            }));
                            showAdminToast('Статус обновлен');
                          } catch (err: any) {
                            showAdminToast(err.message, false);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer outline-none",
                          pet.status === 'available' ? 'bg-green-100 text-green-600' : 
                          pet.status === 'adopted' ? 'bg-blue-100 text-blue-600' : 
                          pet.status === 'urgent' ? 'bg-red-100 text-red-600' :
                          pet.status === 'treatment' ? 'bg-amber-100 text-amber-600' :
                          pet.status === 'reserved' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        )}
                      >
                        <option value="available">Ищет дом</option>
                        <option value="urgent">Срочно</option>
                        <option value="treatment">На лечении</option>
                        <option value="reserved">Забронирован</option>
                        <option value="adopted">Пристроен</option>
                      </select>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'created_at',
                    header: 'Дата добавления',
                    render: (pet: any) => (
                      <span className="text-[13px] text-[#666666]">
                        {new Date(pet.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (pet: any) => (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingPet(pet); }}
                          className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEdit(pet); }}
                          className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(pet.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                keyExtractor={(pet) => pet.id}
                onRowClick={(pet) => setViewingPet(pet)}
                selectable={true}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={(selected) => handleSelectAll(selected, data.pets)}
                pageSize={10}
              />
            </div>
          )}

          {/* Enhanced Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters */}
              <Filters
                config={userFilters}
                values={filters['users'] || {}}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <span className="text-[#666666]">Всего: <strong className="text-[#1A1A1A]">{data.users.length}</strong></span>
                <span className="text-red-600">Админы: <strong>{data.users.filter((u: any) => u.role === 'admin').length}</strong></span>
                <span className="text-blue-600">Менеджеры: <strong>{data.users.filter((u: any) => u.role === 'manager').length}</strong></span>
                <span className="text-gray-600">Пользователи: <strong>{data.users.filter((u: any) => u.role === 'user').length}</strong></span>
                <span className="text-red-500">Заблокированы: <strong>{data.users.filter((u: any) => u.is_banned).length}</strong></span>
              </div>

              {/* Data Table */}
              <DataTable
                data={data.users.filter((user: any) => {
                  const f = filters['users'] || {};
                  if (f.search && !(
                    user.name?.toLowerCase().includes(f.search.toLowerCase()) ||
                    user.email?.toLowerCase().includes(f.search.toLowerCase()) ||
                    user.phone?.toLowerCase().includes(f.search.toLowerCase())
                  )) return false;
                  if (f.role && user.role !== f.role) return false;
                  if (f.status === 'banned' && !user.is_banned) return false;
                  if (f.status === 'active' && user.is_banned) return false;
                  return true;
                })}
                columns={[
                  {
                    key: 'user',
                    header: 'Пользователь',
                    render: (user: any) => (
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[14px]",
                          user.role === 'admin' ? 'bg-red-500' : 
                          user.role === 'manager' ? 'bg-blue-500' : 'bg-[#6052B3]'
                        )}>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1A1A1A] block">{user.name}</span>
                            {user.is_banned && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">
                                BAN
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] text-[#999999]">{user.email}</span>
                        </div>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'role',
                    header: 'Роль',
                    render: (user: any) => (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={user.id === user.id || user.is_banned}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer outline-none",
                          user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-600' : 
                          'bg-gray-100 text-gray-600'
                        )}
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'created_at',
                    header: 'Регистрация',
                    render: (user: any) => (
                      <span className="text-[13px] text-[#666666]">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (user: any) => (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingUser(user); }}
                          className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleBanUser(user.id, !!user.is_banned);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              user.is_banned 
                                ? "text-green-600 hover:bg-green-50" 
                                : "text-red-500 hover:bg-red-50"
                            )}
                            title={user.is_banned ? 'Разблокировать' : 'Заблокировать'}
                          >
                            {user.is_banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                keyExtractor={(user) => user.id}
                onRowClick={(user) => setViewingUser(user)}
                selectable={true}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={(selected) => handleSelectAll(selected, data.users)}
                pageSize={10}
              />
            </div>
          )}

          {/* Enhanced Adoption Tab */}
          {activeTab === 'adoption' && (
            <div className="space-y-6">
              {/* Filters */}
              <Filters
                config={adoptionFilters}
                values={filters['adoption'] || {}}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <span className="text-[#666666]">Всего заявок: <strong className="text-[#1A1A1A]">{data.adoption_requests?.length || 0}</strong></span>
                <span className="text-orange-600">На рассмотрении: <strong>{data.adoption_requests?.filter((r: any) => r.status === 'pending').length || 0}</strong></span>
                <span className="text-green-600">Одобрено: <strong>{data.adoption_requests?.filter((r: any) => r.status === 'approved').length || 0}</strong></span>
                <span className="text-red-600">Отклонено: <strong>{data.adoption_requests?.filter((r: any) => r.status === 'rejected').length || 0}</strong></span>
              </div>

              {/* Data Table */}
              <DataTable
                data={(data.adoption_requests || []).filter((req: any) => {
                  const f = filters['adoption'] || {};
                  if (f.search && !(
                    req.user_name?.toLowerCase().includes(f.search.toLowerCase()) ||
                    req.user_email?.toLowerCase().includes(f.search.toLowerCase()) ||
                    req.pet_name?.toLowerCase().includes(f.search.toLowerCase())
                  )) return false;
                  if (f.status && req.status !== f.status) return false;
                  if (f.dateFrom && new Date(req.created_at) < new Date(f.dateFrom)) return false;
                  if (f.dateTo && new Date(req.created_at) > new Date(f.dateTo)) return false;
                  return true;
                })}
                columns={[
                  {
                    key: 'applicant',
                    header: 'Заявитель',
                    render: (req: any) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6052B3] flex items-center justify-center text-white font-bold">
                          {req.user_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-[#1A1A1A] block">{req.user_name}</span>
                          <span className="text-[12px] text-[#999999]">{req.user_email}</span>
                        </div>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'pet',
                    header: 'Питомец',
                    render: (req: any) => (
                      <div className="flex items-center gap-3">
                        <img 
                          src={req.pet_image || '/placeholder-pet.png'} 
                          alt={req.pet_name} 
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span className="font-medium text-[#1A1A1A]">{req.pet_name}</span>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'status',
                    header: 'Статус',
                    render: (req: any) => (
                      <select
                        value={req.status}
                        onChange={async (e) => {
                          try {
                            await handleStatusUpdate(req.id, 'adoption_requests', e.target.value);
                          } catch (err: any) {
                            showAdminToast(err.message, false);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer outline-none",
                          req.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          req.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                          'bg-orange-100 text-orange-600'
                        )}
                      >
                        <option value="pending">На рассмотрении</option>
                        <option value="approved">Одобрено</option>
                        <option value="rejected">Отклонено</option>
                      </select>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'created_at',
                    header: 'Дата подачи',
                    render: (req: any) => (
                      <span className="text-[13px] text-[#666666]">
                        {new Date(req.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (req: any) => (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingAdoption(req); }}
                          className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                          title="Просмотр анкеты"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStatusUpdate(req.id, 'adoption_requests', 'approved');
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Одобрить"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStatusUpdate(req.id, 'adoption_requests', 'rejected');
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Отклонить"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]}
                keyExtractor={(req) => req.id}
                onRowClick={(req) => setViewingAdoption(req)}
                selectable={true}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={(selected) => handleSelectAll(selected, data.adoption_requests || [])}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm max-w-[800px]">
              <h2 className="text-[20px] font-bold mb-8 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-[#6052B3]" />
                Глобальные настройки сайта
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(data.settings).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">{key.replace(/_/g, ' ')}</label>
                      {key.includes('text') || key.includes('subtitle') ? (
                        <textarea 
                          value={value as string}
                          onChange={e => setData({ ...data, settings: { ...data.settings, [key]: e.target.value } })}
                          className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none min-h-[100px] transition-all"
                        />
                      ) : (
                        <input 
                          type="text"
                          value={value as string}
                          onChange={e => setData({ ...data, settings: { ...data.settings, [key]: e.target.value } })}
                          className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="bg-[#6052B3] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#4A3E90] transition-all shadow-lg shadow-[#6052B3]/20">
                  Сохранить все изменения
                </button>
              </form>
            </div>
          )}

          {/* Pages Management */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-bold text-[#1A1A1A]">Управление страницами</h2>
                  <p className="text-[#666666] mt-1">Редактирование контента страниц сайта</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pages List */}
                <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-6 shadow-sm">
                  <h3 className="text-[16px] font-bold mb-4">Страницы</h3>
                  <div className="space-y-2">
                    {data.pages?.map((page: any) => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedItem(page)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between",
                          selectedItem?.id === page.id 
                            ? 'bg-[#6052B3] text-white' 
                            : 'hover:bg-[#F5F5F5] text-[#1A1A1A]'
                        )}
                      >
                        <div>
                          <span className="font-medium block">{page.title}</span>
                          <span className={cn("text-[12px]", selectedItem?.id === page.id ? 'text-white/70' : 'text-[#999999]')}>/{page.slug}</span>
                        </div>
                        <Edit className="w-4 h-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Editor */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#E5E5E5] p-6 shadow-sm">
                  {selectedItem ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[18px] font-bold">Редактирование: {selectedItem.title}</h3>
                        <span className="text-[12px] text-[#999999] bg-[#F5F5F5] px-3 py-1 rounded-full">/{selectedItem.slug}</span>
                      </div>
                      
                      <div>
                        <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Заголовок страницы</label>
                        <input
                          type="text"
                          value={formData.title || selectedItem.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Meta описание (SEO)</label>
                        <input
                          type="text"
                          value={formData.meta_description || selectedItem.meta_description || ''}
                          onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                          placeholder="Краткое описание для поисковых систем"
                          className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Контент (HTML поддерживается)</label>
                        <textarea
                          value={formData.content || selectedItem.content}
                          onChange={e => setFormData({ ...formData, content: e.target.value })}
                          rows={15}
                          className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all font-mono text-[14px]"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => { setSelectedItem(null); setFormData({}); }}
                          className="flex-1 px-6 py-3 border border-[#E5E5E5] rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-[#6052B3] text-white rounded-xl font-bold hover:bg-[#4A3E90] transition-colors"
                        >
                          Сохранить изменения
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#999999]">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Выберите страницу для редактирования</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-bold text-[#1A1A1A]">Настройки футера</h2>
                  <p className="text-[#666666] mt-1">Контактная информация и ссылки в подвале сайта</p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm max-w-[800px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Адрес</label>
                      <input
                        type="text"
                        value={formData.address || data.footer?.address || ''}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="г. Алматы, ул. Примерная, 123"
                        className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Телефон</label>
                      <input
                        type="text"
                        value={formData.phone || data.footer?.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+7 (777) 123-45-67"
                        className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email || data.footer?.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@jandos.kz"
                        className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Copyright</label>
                      <input
                        type="text"
                        value={formData.copyright || data.footer?.copyright || ''}
                        onChange={e => setFormData({ ...formData, copyright: e.target.value })}
                        placeholder="© 2024 JanDós. Все права защищены."
                        className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#666666] uppercase mb-2">Социальные сети (JSON)</label>
                    <textarea
                      value={formData.social_links || data.footer?.social_links || '[]'}
                      onChange={e => setFormData({ ...formData, social_links: e.target.value })}
                      placeholder='[{&quot;name&quot;: &quot;Instagram&quot;, &quot;url&quot;: &quot;https://instagram.com&quot;}]'
                      rows={4}
                      className="w-full p-4 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all font-mono text-[14px]"
                    />
                    <p className="text-[12px] text-[#999999] mt-2">Формат: [&#123;&quot;name&quot;: &quot;Название&quot;, &quot;url&quot;: &quot;ссылка&quot;&#125;]</p>
                  </div>

                  <button type="submit" className="bg-[#6052B3] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#4A3E90] transition-all shadow-lg shadow-[#6052B3]/20">
                    Сохранить настройки футера
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Enhanced Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              {/* Filters */}
              <Filters
                config={volunteerFilters}
                values={filters['volunteers'] || {}}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <span className="text-[#666666]">Всего заявок: <strong className="text-[#1A1A1A]">{data.volunteers?.length || 0}</strong></span>
                <span className="text-orange-600">На рассмотрении: <strong>{data.volunteers?.filter((v: any) => v.status === 'pending').length || 0}</strong></span>
                <span className="text-green-600">Одобрено: <strong>{data.volunteers?.filter((v: any) => v.status === 'approved').length || 0}</strong></span>
                <span className="text-red-600">Отклонено: <strong>{data.volunteers?.filter((v: any) => v.status === 'rejected').length || 0}</strong></span>
              </div>

              {/* Data Table */}
              <DataTable
                data={(data.volunteers || []).filter((vol: any) => {
                  const f = filters['volunteers'] || {};
                  if (f.search && !(
                    vol.name?.toLowerCase().includes(f.search.toLowerCase()) ||
                    vol.email?.toLowerCase().includes(f.search.toLowerCase()) ||
                    vol.phone?.toLowerCase().includes(f.search.toLowerCase())
                  )) return false;
                  if (f.status && vol.status !== f.status) return false;
                  if (f.experience && vol.experience !== f.experience) return false;
                  return true;
                })}
                columns={[
                  {
                    key: 'applicant',
                    header: 'Заявитель',
                    render: (vol: any) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6052B3] flex items-center justify-center text-white font-bold">
                          {vol.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-[#1A1A1A] block">{vol.name}</span>
                          <span className="text-[12px] text-[#999999]">{vol.email}</span>
                        </div>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'phone',
                    header: 'Телефон',
                    render: (vol: any) => (
                      <span className="text-[13px] text-[#666666]">{vol.phone || '—'}</span>
                    ),
                  },
                  {
                    key: 'experience',
                    header: 'Опыт',
                    render: (vol: any) => (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[11px] font-medium",
                        vol.experience === 'yes' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      )}>
                        {vol.experience === 'yes' ? 'Есть опыт' : 'Нет опыта'}
                      </span>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'status',
                    header: 'Статус',
                    render: (vol: any) => (
                      <select
                        value={vol.status}
                        onChange={async (e) => {
                          try {
                            await handleStatusUpdate(vol.id, 'volunteers/applications', e.target.value);
                          } catch (err: any) {
                            showAdminToast(err.message, false);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer outline-none",
                          vol.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          vol.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                          'bg-orange-100 text-orange-600'
                        )}
                      >
                        <option value="pending">На рассмотрении</option>
                        <option value="approved">Одобрено</option>
                        <option value="rejected">Отклонено</option>
                      </select>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'created_at',
                    header: 'Дата подачи',
                    render: (vol: any) => (
                      <span className="text-[13px] text-[#666666]">
                        {new Date(vol.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    ),
                    sortable: true,
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (vol: any) => (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingVolunteer(vol); }}
                          className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {vol.status === 'pending' && (
                          <>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStatusUpdate(vol.id, 'volunteers/applications', 'approved');
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Одобрить"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStatusUpdate(vol.id, 'volunteers/applications', 'rejected');
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Отклонить"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]}
                keyExtractor={(vol) => vol.id}
                onRowClick={(vol) => setViewingVolunteer(vol)}
                selectable={true}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={(selected) => handleSelectAll(selected, data.volunteers || [])}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#E5E5E5]">
                <h2 className="text-[20px] font-bold">Публичные слоты смен</h2>
                <p className="text-[#666666] text-[14px]">Смены, доступные для записи волонтёрам на портале</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Тип</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Время</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Мест</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Записалось</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Место</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {(data.slots as any[]).map((slot: any) => (
                      <tr key={slot.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                            slot.type === 'walking' ? 'bg-green-100 text-green-700' :
                            slot.type === 'cleaning' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {slot.type === 'walking' ? 'Выгул' : slot.type === 'cleaning' ? 'Уборка' : 'Кормление'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#1A1A1A]">{slot.date}</td>
                        <td className="px-6 py-4 text-[#666666]">{slot.time}</td>
                        <td className="px-6 py-4 text-[#1A1A1A] font-bold">{slot.slots}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${Number(slot.signed_up) >= slot.slots ? 'text-red-500' : 'text-[#27AE60]'}`}>
                            {slot.signed_up ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#666666] text-[13px] max-w-[160px] truncate">{slot.location}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(slot)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(slot.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'needs' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#E5E5E5]">
                <h2 className="text-[20px] font-bold">Нужды приюта</h2>
                <p className="text-[#666666] text-[14px]">Позиции, необходимые для работы приюта</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Позиция</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Категория</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Кол-во</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Срочность</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {(data.needs as any[]).map((need: any) => (
                      <tr key={need.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        <td className="px-6 py-4 font-medium text-[#1A1A1A]">{need.item}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                            need.category === 'food' ? 'bg-green-100 text-green-700' :
                            need.category === 'medical' ? 'bg-red-100 text-red-700' :
                            need.category === 'tools' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {need.category === 'food' ? 'Корм' : need.category === 'medical' ? 'Медикаменты' : need.category === 'tools' ? 'Инвентарь' : 'Прочее'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#666666]">{need.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                            need.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            need.urgency === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {need.urgency === 'high' ? 'Высокая' : need.urgency === 'medium' ? 'Средняя' : 'Низкая'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={async () => { await needsApi.fulfill(need.id); fetchData(); }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Отметить выполненным"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(need)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(need.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-[24px] font-bold text-[#1A1A1A]">Медиа-библиотека</h2>
                  <p className="text-[#666666] mt-1">Управление изображениями и файлами</p>
                </div>
                <button 
                  onClick={handleMediaUpload}
                  className="bg-[#6052B3] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#4A3E90] transition-colors flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Загрузить файлы
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
                  <span className="text-[12px] text-[#666666] uppercase font-bold">Всего файлов</span>
                  <p className="text-[24px] font-bold text-[#1A1A1A] mt-1">{data.media.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
                  <span className="text-[12px] text-[#666666] uppercase font-bold">Фото питомцев</span>
                  <p className="text-[24px] font-bold text-[#1A1A1A] mt-1">{data.pets.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
                  <span className="text-[12px] text-[#666666] uppercase font-bold">Новости</span>
                  <p className="text-[24px] font-bold text-[#1A1A1A] mt-1">{data.news.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
                  <span className="text-[12px] text-[#666666] uppercase font-bold">Сборы</span>
                  <p className="text-[24px] font-bold text-[#1A1A1A] mt-1">{data.fundraisers?.length || 0}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Поиск по имени файла..."
                    value={filters['media']?.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-xl text-[15px] focus:border-[#6052B3] outline-none transition-all"
                  />
                </div>
                <select
                  value={filters['media']?.source || 'all'}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="px-4 py-3 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none bg-white"
                >
                  <option value="all">Все источники</option>
                  <option value="uploaded">Загруженные</option>
                  <option value="entity">Из сущностей</option>
                </select>
                <select
                  value={filters['media']?.sort || 'newest'}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-3 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none bg-white"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="oldest">Сначала старые</option>
                  <option value="name">По имени</option>
                </select>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-3 text-[#666666] hover:text-[#1A1A1A] transition-colors"
                >
                  Сбросить
                </button>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Show both uploaded media and images from other entities */}
                {(() => {
                  const allMedia = [
                    ...data.media.map(m => ({ 
                      id: m.id, 
                      url: m.url, 
                      source: 'uploaded',
                      created_at: m.created_at,
                      name: m.filename || 'Файл'
                    })),
                    ...data.pets.map(p => ({ 
                      id: `pet-${p.id}`, 
                      url: p.image, 
                      source: 'entity',
                      entityType: 'Питомец',
                      entityName: p.name,
                      created_at: p.created_at
                    })),
                    ...data.news.map(n => ({ 
                      id: `news-${n.id}`, 
                      url: n.image, 
                      source: 'entity',
                      entityType: 'Новость',
                      entityName: n.title,
                      created_at: n.created_at
                    })),
                    ...data.fundraisers.map(f => ({ 
                      id: `fund-${f.id}`, 
                      url: f.image, 
                      source: 'entity',
                      entityType: 'Сбор',
                      entityName: f.title,
                      created_at: f.created_at
                    })),
                  ].filter(item => item.url);

                  const f = filters['media'] || {};
                  let filtered = allMedia;

                  if (f.search) {
                    const search = f.search.toLowerCase();
                    filtered = filtered.filter(item => 
                      item.name?.toLowerCase().includes(search) ||
                      item.entityName?.toLowerCase().includes(search)
                    );
                  }

                  if (f.source && f.source !== 'all') {
                    filtered = filtered.filter(item => item.source === f.source);
                  }

                  if (f.sort === 'newest') {
                    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                  } else if (f.sort === 'oldest') {
                    filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                  } else if (f.sort === 'name') {
                    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                  }

                  return filtered.map((item, i) => (
                    <div key={i} className="aspect-square bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden group relative shadow-sm hover:shadow-md transition-shadow">
                      <img src={item.url} alt="media" className="w-full h-full object-cover" />
                      {/* Source Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                          item.source === 'uploaded' ? 'bg-[#6052B3] text-white' : 'bg-white/90 text-[#1A1A1A]'
                        )}>
                          {item.source === 'uploaded' ? 'Загружено' : item.entityType}
                        </span>
                      </div>
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <p className="text-white text-[12px] text-center truncate w-full">{item.name || item.entityName}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { navigator.clipboard.writeText(item.url); showAdminToast('URL скопирован!'); }}
                            className="p-2 bg-white rounded-lg text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                            title="Копировать URL"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.open(item.url, '_blank')}
                            className="p-2 bg-white rounded-lg text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                            title="Открыть"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.source === 'uploaded' && item.id && (
                            <button 
                              onClick={() => handleMediaDelete(item.id!)}
                              className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {activeTab === 'surrender' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#E5E5E5]">
                <h2 className="text-[20px] font-bold">Заявки на передачу питомца</h2>
                <p className="text-[#666666] text-[14px]">Анкеты от людей, желающих передать животное в приют</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Фото</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Заявитель</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Животное</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Причина</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Статус</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {data.surrender.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        <td className="px-8 py-5">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt="Фото животного"
                              className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(item.photo, '_blank')}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#F0F0F0] flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-semibold text-[#1A1A1A]">{item.full_name}</p>
                          <p className="text-[13px] text-[#666666]">{item.phone}</p>
                        </td>
                        <td className="px-8 py-5 text-[14px] text-[#444444]">
                          {[item.animal_type, item.breed, item.age].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-8 py-5 text-[13px] text-[#666666] max-w-[200px] truncate">
                          {item.reason || '—'}
                        </td>
                        <td className="px-8 py-5">
                          <select
                            value={item.status}
                            onChange={async (e) => {
                              await surrenderApi.updateStatus(item.id, e.target.value);
                              setData(prev => ({ ...prev, surrender: prev.surrender.map((s: any) => s.id === item.id ? { ...s, status: e.target.value } : s) }));
                            }}
                            className="text-[13px] border border-[#E5E5E5] rounded-lg px-2 py-1"
                          >
                            <option value="new">Новая</option>
                            <option value="in_review">На рассмотрении</option>
                            <option value="accepted">Принята</option>
                            <option value="rejected">Отклонена</option>
                          </select>
                        </td>
                        <td className="px-8 py-5 text-[13px] text-[#888888]">
                          {new Date(item.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => { setSelectedItem(item); setShowModal('view'); }}
                            className="text-[13px] text-[#6052B3] hover:underline"
                          >
                            Подробнее
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.surrender.length === 0 && (
                      <tr><td colSpan={7} className="px-8 py-12 text-center text-[#888888]">Заявок пока нет</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'graduates' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#E5E5E5]">
                <h2 className="text-[20px] font-bold">Карта выпускников</h2>
                <p className="text-[#666666] text-[14px]">Управление метками на карте счастливых историй</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Имя</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Координаты</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата адопции</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {data.graduates.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-medium text-[#1A1A1A]">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[#666666] font-mono text-[12px]">{item.lat}, {item.lng}</td>
                        <td className="px-8 py-5 text-[#666666]">{item.adoption_date}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(item)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'media' &&
           activeTab !== 'slots' && activeTab !== 'needs' && activeTab !== 'graduates' && activeTab !== 'surrender' && (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      {activeTab === 'users' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Имя</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Email</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Роль</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'pets' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Питомец</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Категория</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Статус</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'news' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Заголовок</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Категория</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'fundraisers' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Название сбора</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Цель</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Собрано</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'adoption' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Пользователь</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Питомец</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Статус</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'volunteers' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Имя</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Email</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Статус</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : activeTab === 'shifts' ? (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Волонтер</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Время</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider text-right">Действия</th>
                        </>
                      ) : (
                        <>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Действие</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Объект</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Пользователь</th>
                          <th className="px-8 py-5 text-[12px] font-bold text-[#666666] uppercase tracking-wider">Дата</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        {activeTab === 'users' && (
                          <>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#1A1A1A]">{item.name}</span>
                                {item.is_banned ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600">заблокирован</span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-[#666666]">{item.email}</td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-bold uppercase",
                                item.role === 'admin' ? 'bg-red-100 text-red-600' :
                                item.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              )}>
                                {item.role}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                {user.role === 'admin' && item.id !== user.id && (
                                  <>
                                    {!item.is_banned && (
                                      <select
                                        value={item.role}
                                        onChange={(e) => handleRoleChange(item.id, e.target.value)}
                                        className="bg-white border border-[#E5E5E5] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#6052B3]"
                                      >
                                        <option value="user">User</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                    )}
                                    <button
                                      onClick={() => handleBanUser(item.id, !!item.is_banned)}
                                      className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        item.is_banned
                                          ? "text-green-600 hover:bg-green-50"
                                          : "text-red-500 hover:bg-red-50"
                                      )}
                                      title={item.is_banned ? 'Разблокировать' : 'Заблокировать'}
                                    >
                                      {item.is_banned ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'pets' && (
                          <>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <span className="font-medium text-[#1A1A1A] block">{item.name}</span>
                                  <span className="text-[12px] text-[#999999]">{item.breed}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[#666666]">{item.category}</span>
                                <div className="flex gap-1">
                                  <span className="px-2 py-0.5 bg-[#F0EFFF] text-[#6052B3] rounded text-[10px] font-medium">
                                    {item.gender === 'male' ? '♂' : '♀'} {item.ageGroup}
                                  </span>
                                  <span className="px-2 py-0.5 bg-[#E9F7EF] text-[#27AE60] rounded text-[10px] font-medium">
                                    {item.size}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <select
                                value={item.status}
                                onChange={async (e) => {
                                  try {
                                    await petsApi.update(item.id, { status: e.target.value });
                                    setData(prev => ({
                                      ...prev,
                                      pets: prev.pets.map(p => p.id === item.id ? { ...p, status: e.target.value } : p)
                                    }));
                                    showAdminToast('Статус обновлен');
                                  } catch (err: any) {
                                    showAdminToast(err.message, false);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer outline-none",
                                  item.status === 'available' ? 'bg-green-100 text-green-600' : 
                                  item.status === 'adopted' ? 'bg-blue-100 text-blue-600' : 
                                  item.status === 'urgent' ? 'bg-red-100 text-red-600' :
                                  item.status === 'treatment' ? 'bg-amber-100 text-amber-600' :
                                  item.status === 'reserved' ? 'bg-purple-100 text-purple-600' :
                                  'bg-orange-100 text-orange-600'
                                )}
                              >
                                <option value="available">Ищет дом</option>
                                <option value="urgent">Срочно</option>
                                <option value="treatment">На лечении</option>
                                <option value="reserved">Забронирован</option>
                                <option value="adopted">Пристроен</option>
                              </select>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => window.open(`/pet/${item.id}`, '_blank')} 
                                  className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors"
                                  title="Просмотр на сайте"
                                >
                                  <ArrowUpRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => openEdit(item)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'news' && (
                          <>
                            <td className="px-8 py-5 font-medium text-[#1A1A1A]">{item.title}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.category}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.date}</td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(item)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'fundraisers' && (
                          <>
                            <td className="px-8 py-5 font-medium text-[#1A1A1A]">{item.title}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.target_amount.toLocaleString()} ₸</td>
                            <td className="px-8 py-5 text-[#6052B3] font-bold">{item.current_amount.toLocaleString()} ₸</td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(item)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'adoption' && (
                          <>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-medium text-[#1A1A1A]">{item.user_name}</span>
                                <span className="text-[12px] text-[#666666]">{item.user_email}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 font-medium text-[#1A1A1A]">{item.pet_name}</td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-bold uppercase",
                                item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                item.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                                'bg-orange-100 text-orange-600'
                              )}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleStatusUpdate(item.id, 'adoption_requests', 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleStatusUpdate(item.id, 'adoption_requests', 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'volunteers' && (
                          <>
                            <td className="px-8 py-5 font-medium text-[#1A1A1A]">{item.name}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.email}</td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-bold uppercase",
                                item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                item.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                                'bg-orange-100 text-orange-600'
                              )}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleStatusUpdate(item.id, 'volunteers/applications', 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleStatusUpdate(item.id, 'volunteers/applications', 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'shifts' && (
                          <>
                            <td className="px-8 py-5 font-medium text-[#1A1A1A]">{item.volunteer_name}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.date}</td>
                            <td className="px-8 py-5 text-[#666666]">{item.start_time} - {item.end_time}</td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(item)} className="p-2 text-[#6052B3] hover:bg-[#6052B3]/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'logs' && (
                          <>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1A1A1A] text-[13px]">{item.action}</span>
                                <span className="text-[12px] text-[#666666]">{item.details}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-[#666666] text-[13px]">{item.target_type} (#{item.target_id})</td>
                            <td className="px-8 py-5 text-[#666666] text-[13px]">{item.user_name}</td>
                            <td className="px-8 py-5 text-[#999999] text-[12px]">{new Date(item.created_at).toLocaleString()}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add/Edit Modal */}
      {showModal && showModal === 'view' && selectedItem && activeTab === 'surrender' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-[560px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-[22px] font-bold">Заявка на передачу питомца</h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            {/* Photo */}
            {selectedItem.photo && (
              <div className="mb-6">
                <img
                  src={selectedItem.photo}
                  alt="Фото животного"
                  className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(selectedItem.photo, '_blank')}
                />
              </div>
            )}
            <div className="space-y-3 text-[14px]">
              {[
                ['ФИО', selectedItem.full_name],
                ['ИИН', selectedItem.iin],
                ['Телефон', selectedItem.phone],
                ['Тип животного', selectedItem.animal_type],
                ['Пол', selectedItem.animal_gender],
                ['Порода', selectedItem.breed],
                ['Возраст', selectedItem.age],
                ['Здоровье', selectedItem.health],
                ['Причина', selectedItem.reason],
                ['Адрес', selectedItem.address],
                ['Дата', new Date(selectedItem.created_at).toLocaleString('ru-RU')],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex gap-3">
                  <span className="text-[#888888] w-[140px] shrink-0">{label}:</span>
                  <span className="text-[#1A1A1A] font-medium">{value}</span>
                </div>
              ) : null)}
            </div>
            <button onClick={() => setShowModal(null)} className="mt-6 w-full py-3 bg-[#6052B3] text-white rounded-xl font-medium">Закрыть</button>
          </motion.div>
        </div>
      )}

      {showModal && showModal !== 'view' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-[600px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-[24px] font-bold mb-6">{showModal === 'add' ? 'Добавить' : 'Изменить'} {
              activeTab === 'pets' ? 'питомца' :
              activeTab === 'news' ? 'новость' :
              activeTab === 'slots' ? 'слот смены' :
              activeTab === 'needs' ? 'нужду' :
              activeTab === 'graduates' ? 'выпускника' : 'запись'
            }</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'pets' && (
                <>
                  {/* Basic Info */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Основная информация</h3>
                    <input placeholder="Имя питомца *" value={formData.name || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                      <select value={formData.category || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, category: e.target.value})} required>
                        <option value="">Категория *</option>
                        <option value="Собаки">🐕 Собаки</option>
                        <option value="Кошки">🐈 Кошки</option>
                        <option value="Другие">🐰 Другие</option>
                      </select>
                      <select value={formData.gender || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, gender: e.target.value})} required>
                        <option value="">Пол *</option>
                        <option value="male">♂️ Мальчик</option>
                        <option value="female">♀️ Девочка</option>
                      </select>
                    </div>
                  </div>

                  {/* Physical Characteristics */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Характеристики</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={formData.ageGroup || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, ageGroup: e.target.value})} required>
                        <option value="">Возрастная группа *</option>
                        <option value="До 1 года">До 1 года (щенки/котята)</option>
                        <option value="1-3 года">1-3 года (молодые)</option>
                        <option value="3-7 лет">3-7 лет (взрослые)</option>
                        <option value="7+ лет">7+ лет (пожилые)</option>
                      </select>
                      <select value={formData.size || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, size: e.target.value})} required>
                        <option value="">Размер *</option>
                        <option value="Маленький">Маленький (до 10 кг)</option>
                        <option value="Средний">Средний (10-25 кг)</option>
                        <option value="Большой">Большой (25+ кг)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Порода (например, Лабрадор)" value={formData.breed || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, breed: e.target.value})} />
                      <input placeholder="Окрас (например, Рыжий)" value={formData.color || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, color: e.target.value})} />
                    </div>
                    <input placeholder="Возраст текстом (например, 2 года)" value={formData.age || ''} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>

                  {/* Photo */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Фотография</h3>
                    <div className="flex gap-2 items-center">
                      <input placeholder="Ссылка на фото (или загрузите)" value={formData.image || ''} className="flex-1 p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, image: e.target.value})} />
                      <button type="button" onClick={handleFormImageUpload} disabled={imageUploading} className="px-4 py-3 bg-[#6052B3] text-white rounded-xl text-sm font-bold disabled:opacity-50 whitespace-nowrap">{imageUploading ? '...' : 'Загрузить'}</button>
                    </div>
                    {formData.image && (
                      <div className="relative inline-block">
                        <img src={formData.image} alt="preview" className="h-32 rounded-xl object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, image: ''})}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Статус на сайте</h3>
                    <select value={formData.status || 'available'} className="w-full p-3 border rounded-xl bg-white" onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="available">🟢 Ищет дом</option>
                      <option value="urgent">🔴 Срочно нужен дом</option>
                      <option value="treatment">🟡 На лечении</option>
                      <option value="reserved">🟣 Забронирован</option>
                      <option value="adopted">🔵 Пристроен</option>
                    </select>
                    <p className="text-[12px] text-[#999999]">
                      <strong>Срочно</strong> — питомец будет отображаться с приоритетом на странице "Найти дом"
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Описание</h3>
                    <textarea 
                      placeholder="Расскажите о характере питомца, его привычках, чем любит заниматься..." 
                      value={formData.description || ''} 
                      className="w-full p-3 border rounded-xl min-h-[120px] bg-white" 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-4">
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase">Дополнительно</h3>
                    <div>
                      <label className="block text-[12px] text-[#666666] mb-1">Особенности характера (через запятую)</label>
                      <input
                        placeholder="Дружелюбный, активный, любит детей..."
                        value={formData.personality || ''}
                        className="w-full p-3 border rounded-xl bg-white text-[14px]"
                        onChange={e => setFormData({...formData, personality: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-[#666666] mb-1">Состояние здоровья</label>
                      <input
                        placeholder="Привит, стерилизован, здоров..."
                        value={formData.health || ''}
                        className="w-full p-3 border rounded-xl bg-white text-[14px]"
                        onChange={e => setFormData({...formData, health: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-[#666666] mb-1">Особые потребности</label>
                      <input
                        placeholder="Нужен особый уход, диета и т.д."
                        value={formData.specialNeeds || ''}
                        className="w-full p-3 border rounded-xl bg-white text-[14px]"
                        onChange={e => setFormData({...formData, specialNeeds: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'news' && (
                <>
                  <input placeholder="Заголовок" value={formData.title || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, title: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Категория (например, События)" value={formData.category || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, category: e.target.value})} />
                    <input placeholder="Дата (например, 15 Марта)" value={formData.date || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-xl">
                    <input type="checkbox" id="featured" checked={formData.featured === 1} onChange={e => setFormData({...formData, featured: e.target.checked ? 1 : 0})} />
                    <label htmlFor="featured">Закрепить новость</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input placeholder="Ссылка на фото (или загрузите)" value={formData.image || ''} className="flex-1 p-3 border rounded-xl" onChange={e => setFormData({...formData, image: e.target.value})} />
                    <button type="button" onClick={handleFormImageUpload} disabled={imageUploading} className="px-4 py-3 bg-[#6052B3] text-white rounded-xl text-sm font-bold disabled:opacity-50 whitespace-nowrap">{imageUploading ? '...' : 'Загрузить'}</button>
                  </div>
                  {formData.image && <img src={formData.image} alt="preview" className="h-24 rounded-xl object-cover" />}
                  <textarea placeholder="Краткое описание (excerpt)" value={formData.excerpt || ''} className="w-full p-3 border rounded-xl min-h-[80px]" onChange={e => setFormData({...formData, excerpt: e.target.value})} />
                  <textarea placeholder="Текст новости" value={formData.content || ''} className="w-full p-3 border rounded-xl min-h-[200px]" onChange={e => setFormData({...formData, content: e.target.value})} required />
                </>
              )}
              {activeTab === 'shifts' && (
                <>
                  <select value={formData.user_id || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, user_id: Number(e.target.value)})} required>
                    <option value="">— Выберите волонтера —</option>
                    {volunteersList.map((v: any) => (
                      <option key={v.user_id} value={v.user_id}>{v.name} ({v.email}) — {v.status}</option>
                    ))}
                  </select>
                  <input type="date" value={formData.date || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, date: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" placeholder="Начало" value={formData.start_time || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, start_time: e.target.value})} required />
                    <input type="time" placeholder="Конец" value={formData.end_time || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, end_time: e.target.value})} required />
                  </div>
                  <input placeholder="Задача" value={formData.task || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, task: e.target.value})} required />
                  <select value={formData.status || 'scheduled'} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="scheduled">Запланировано</option>
                    <option value="completed">Выполнено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </>
              )}
              {activeTab === 'fundraisers' && (
                <>
                  <input placeholder="Название сбора" value={formData.title || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, title: e.target.value})} required />
                  <input type="number" placeholder="Целевая сумма" value={formData.target_amount || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, target_amount: Number(e.target.value)})} required />
                  <input type="number" placeholder="Собрано (текущая сумма)" value={formData.current_amount || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, current_amount: Number(e.target.value)})} />
                  <div className="flex gap-2 items-center">
                    <input placeholder="Ссылка на фото (или загрузите)" value={formData.image || ''} className="flex-1 p-3 border rounded-xl" onChange={e => setFormData({...formData, image: e.target.value})} />
                    <button type="button" onClick={handleFormImageUpload} disabled={imageUploading} className="px-4 py-3 bg-[#6052B3] text-white rounded-xl text-sm font-bold disabled:opacity-50 whitespace-nowrap">{imageUploading ? '...' : 'Загрузить'}</button>
                  </div>
                  {formData.image && <img src={formData.image} alt="preview" className="h-24 rounded-xl object-cover" />}
                  <select value={formData.status || 'active'} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Активен</option>
                    <option value="completed">Завершен</option>
                  </select>
                  <textarea placeholder="Описание" value={formData.description || ''} className="w-full p-3 border rounded-xl min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
                </>
              )}
               {activeTab === 'slots' && (
                <>
                  <select value={formData.type || 'walking'} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, type: e.target.value})} required>
                    <option value="walking">Выгул собак</option>
                    <option value="cleaning">Уборка территории</option>
                    <option value="feeding">Помощь в кормлении</option>
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={formData.date || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, date: e.target.value})} required />
                    <input placeholder="Время (09:00 - 11:00)" value={formData.time || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, time: e.target.value})} required />
                  </div>
                  <input type="number" placeholder="Количество мест" value={formData.slots || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, slots: Number(e.target.value)})} required />
                  <input placeholder="Место встречи" value={formData.location || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, location: e.target.value})} />
                  <input placeholder="Контактное лицо" value={formData.contact || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, contact: e.target.value})} />
                  <textarea placeholder="Описание смены" value={formData.description || ''} className="w-full p-3 border rounded-xl min-h-[80px]" onChange={e => setFormData({...formData, description: e.target.value})} />
                </>
              )}
              {activeTab === 'needs' && (
                <>
                  <input placeholder="Название позиции" value={formData.item || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, item: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formData.category || 'other'} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, category: e.target.value})} required>
                      <option value="food">Корм</option>
                      <option value="medical">Медикаменты</option>
                      <option value="tools">Инвентарь</option>
                      <option value="other">Прочее</option>
                    </select>
                    <select value={formData.urgency || 'medium'} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, urgency: e.target.value})} required>
                      <option value="high">Высокая</option>
                      <option value="medium">Средняя</option>
                      <option value="low">Низкая</option>
                    </select>
                  </div>
                  <input placeholder="Количество (например, 10 кг)" value={formData.quantity || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </>
              )}
              {activeTab === 'graduates' && (
                <>
                  <input placeholder="Имя питомца" value={formData.name || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <select value={formData.district || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, district: e.target.value})}>
                    <option value="">— Район —</option>
                    <option value="almaty">Алмалинский</option>
                    <option value="bostandyk">Бостандыкский</option>
                    <option value="medeu">Медеуский</option>
                    <option value="auezov">Ауэзовский</option>
                    <option value="jetysu">Жетысуский</option>
                    <option value="turksib">Турксибский</option>
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" placeholder="Широта (Lat)" value={formData.lat || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, lat: Number(e.target.value)})} />
                    <input type="number" step="any" placeholder="Долгота (Lng)" value={formData.lng || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, lng: Number(e.target.value)})} />
                  </div>
                  <input type="date" placeholder="Дата адопции" value={formData.adoption_date || ''} className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, adoption_date: e.target.value})} required />
                  <div className="flex gap-2 items-center">
                    <input placeholder="Ссылка на фото (или загрузите)" value={formData.image || ''} className="flex-1 p-3 border rounded-xl" onChange={e => setFormData({...formData, image: e.target.value})} />
                    <button type="button" onClick={handleFormImageUpload} disabled={imageUploading} className="px-4 py-3 bg-[#6052B3] text-white rounded-xl text-sm font-bold disabled:opacity-50 whitespace-nowrap">{imageUploading ? '...' : 'Загрузить'}</button>
                  </div>
                  {formData.image && <img src={formData.image} alt="preview" className="h-24 rounded-xl object-cover" />}
                  <textarea placeholder="История успеха" value={formData.story || ''} className="w-full p-3 border rounded-xl min-h-[100px]" onChange={e => setFormData({...formData, story: e.target.value})} />
                </>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Отмена</button>
                <button type="submit" className="flex-1 py-3 bg-[#6052B3] text-white rounded-xl font-bold">Сохранить</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Pet Detail Modal */}
      {viewingPet && (
        <PetDetailModal
          pet={viewingPet}
          onClose={() => setViewingPet(null)}
          onEdit={() => { setViewingPet(null); openEdit(viewingPet); }}
          onDelete={() => { 
            if (confirm('Удалить этого питомца?')) {
              handleDelete(viewingPet.id);
              setViewingPet(null);
            }
          }}
          onStatusChange={async (status) => {
            try {
              await petsApi.update(viewingPet.id, { status });
              showAdminToast('Статус обновлен');
              setViewingPet({ ...viewingPet, status });
              fetchData();
            } catch (err: any) {
              showAdminToast(err.message, false);
            }
          }}
        />
      )}

      {/* User Detail Modal */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          stats={{
            adoptionsCount: data.adoption.filter((a: any) => a.user_id === viewingUser.id).length,
            donationsTotal: 0,
            favoritesCount: 0,
            volunteerApplicationsCount: data.volunteers.filter((v: any) => v.user_id === viewingUser.id).length,
          }}
          onClose={() => setViewingUser(null)}
          onEdit={() => { setViewingUser(null); openEdit(viewingUser); }}
          onBan={() => { handleBanUser(viewingUser.id, false); setViewingUser(null); }}
          onUnban={() => { handleBanUser(viewingUser.id, true); setViewingUser(null); }}
          onRoleChange={async (role) => {
            try {
              await handleRoleChange(viewingUser.id, role);
              setViewingUser({ ...viewingUser, role });
            } catch (err: any) {
              showAdminToast(err.message, false);
            }
          }}
          onViewAdoptions={() => {
            setViewingUser(null);
            setActiveTab('adoption');
          }}
          onViewDonations={() => {
            setViewingUser(null);
            // Could add donations tab
          }}
        />
      )}

      {/* Adoption Detail Modal */}
      {viewingAdoption && (
        <AdoptionDetailModal
          request={viewingAdoption}
          onClose={() => setViewingAdoption(null)}
          onStatusChange={async (status) => {
            try {
              await handleStatusUpdate(viewingAdoption.id, 'adoption_requests', status);
              setViewingAdoption(null);
            } catch (err: any) {
              showAdminToast(err.message, false);
            }
          }}
          onAddComment={(text) => {
            // TODO: Implement comment API
            showAdminToast('Комментарий добавлен');
          }}
          onViewPet={() => {
            const pet = data.pets.find((p: any) => p.id === viewingAdoption.pet_id);
            if (pet) {
              setViewingAdoption(null);
              setViewingPet(pet);
            }
          }}
          onViewUser={() => {
            const user = data.users.find((u: any) => u.id === viewingAdoption.user_id);
            if (user) {
              setViewingAdoption(null);
              setActiveTab('users');
              setSearchTerm(user.name || user.email);
            }
          }}
        />
      )}

      {/* Volunteer Detail Modal */}
      {viewingVolunteer && (
        <VolunteerDetailModal
          volunteer={viewingVolunteer}
          isOpen={!!viewingVolunteer}
          onClose={() => setViewingVolunteer(null)}
          onApprove={async () => {
            try {
              await handleStatusUpdate(viewingVolunteer.id, 'volunteers/applications', 'approved');
              setViewingVolunteer(null);
            } catch (err: any) {
              showAdminToast(err.message, false);
            }
          }}
          onReject={async () => {
            try {
              await handleStatusUpdate(viewingVolunteer.id, 'volunteers/applications', 'rejected');
              setViewingVolunteer(null);
            } catch (err: any) {
              showAdminToast(err.message, false);
            }
          }}
        />
      )}

      {/* Bulk Actions */}
      {activeTab === 'pets' && (
        <BulkActions
          selectedCount={selectedIds.length}
          actions={createPetBulkActions(
            handleBulkStatusChange,
            handleBulkDelete,
            () => handleExport('csv')
          )}
          onClear={clearSelection}
        />
      )}
      {activeTab === 'users' && (
        <BulkActions
          selectedCount={selectedIds.length}
          actions={createUserBulkActions(
            handleBulkRoleChange,
            handleBulkBan,
            () => {}
          )}
          onClear={clearSelection}
        />
      )}

      {/* Toast */}
      {adminToast && (
        <div className={`fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-2xl text-white text-[14px] font-medium shadow-lg transition-all ${adminToast.ok ? 'bg-[#6052B3]' : 'bg-red-500'}`}>
          {adminToast.msg}
        </div>
      )}
    </div>
  );
};

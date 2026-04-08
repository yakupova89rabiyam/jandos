import React from 'react';
import { motion } from 'motion/react';
import { X, Mail, Phone, Calendar, MapPin, Shield, Ban, UserCheck, Edit, Trash2, Heart, ClipboardList, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  created_at: string;
  is_banned?: boolean;
  birthday?: string;
  country?: string;
  city?: string;
  about?: string;
}

interface UserStats {
  adoptionsCount: number;
  donationsTotal: number;
  favoritesCount: number;
  volunteerApplicationsCount: number;
}

interface UserDetailModalProps {
  user: User;
  stats: UserStats;
  onClose: () => void;
  onEdit: () => void;
  onBan: () => void;
  onUnban: () => void;
  onRoleChange: (role: string) => void;
  onViewAdoptions: () => void;
  onViewDonations: () => void;
}

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Администратор', color: 'text-red-600', bg: 'bg-red-100' },
  manager: { label: 'Менеджер', color: 'text-blue-600', bg: 'bg-blue-100' },
  user: { label: 'Пользователь', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export function UserDetailModal({
  user,
  stats,
  onClose,
  onEdit,
  onBan,
  onUnban,
  onRoleChange,
  onViewAdoptions,
  onViewDonations,
}: UserDetailModalProps) {
  const role = roleLabels[user.role] || roleLabels.user;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-[700px] w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-6 flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-[#1A1A1A]">Профиль пользователя</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#6052B3] text-white flex items-center justify-center text-[28px] font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[24px] font-bold text-[#1A1A1A]">{user.name}</h3>
                {user.is_banned && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                    Заблокирован
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#666666] flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("px-3 py-1 rounded-full text-[12px] font-bold", role.bg, role.color)}>
                  {role.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <ClipboardList className="w-5 h-5 text-[#6052B3] mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Заявки</p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">{stats.adoptionsCount}</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Пожертвования</p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">{stats.donationsTotal.toLocaleString()} ₸</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Избранное</p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">{stats.favoritesCount}</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <UserCheck className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Волонтерство</p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">{stats.volunteerApplicationsCount}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#F8F8F8] rounded-2xl p-4 space-y-3">
            <h4 className="text-[14px] font-bold text-[#666666] uppercase">Контактная информация</h4>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#999999]" />
                <span className="text-[14px] text-[#1A1A1A]">{user.phone}</span>
              </div>
            )}
            {user.birthday && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#999999]" />
                <span className="text-[14px] text-[#1A1A1A]">{user.birthday}</span>
              </div>
            )}
            {(user.country || user.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#999999]" />
                <span className="text-[14px] text-[#1A1A1A]">
                  {[user.country, user.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#999999]" />
              <span className="text-[14px] text-[#666666]">
                Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* About */}
          {user.about && (
            <div className="bg-[#F8F8F8] rounded-2xl p-4">
              <h4 className="text-[14px] font-bold text-[#666666] uppercase mb-2">О себе</h4>
              <p className="text-[14px] text-[#444444]">{user.about}</p>
            </div>
          )}

          {/* Role Management */}
          <div className="border-t border-[#E5E5E5] pt-6">
            <h4 className="text-[14px] font-bold text-[#666666] uppercase mb-3">Управление ролью</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleLabels).map(([key, { label, color, bg }]) => (
                <button
                  key={key}
                  onClick={() => onRoleChange(key)}
                  disabled={user.role === key}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-medium transition-all",
                    user.role === key
                      ? "bg-[#1A1A1A] text-white"
                      : `${bg} ${color} hover:opacity-80`
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-[#6052B3] text-white rounded-xl font-medium hover:bg-[#4A3E90] transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Редактировать
            </button>
            {user.is_banned ? (
              <button
                onClick={onUnban}
                className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Разблокировать
              </button>
            ) : (
              <button
                onClick={onBan}
                className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Заблокировать
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Share2, Calendar, PawPrint, MapPin, Info, Edit, Trash2, QrCode, Printer } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
  status: string;
  created_at: string;
  notes?: string;
  personality?: string;
  health?: string;
  specialNeeds?: string;
}

interface PetDetailModalProps {
  pet: Pet;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: 'Ищет дом', color: 'text-green-600', bg: 'bg-green-100' },
  urgent: { label: 'Срочно', color: 'text-red-600', bg: 'bg-red-100' },
  treatment: { label: 'На лечении', color: 'text-amber-600', bg: 'bg-amber-100' },
  reserved: { label: 'Забронирован', color: 'text-purple-600', bg: 'bg-purple-100' },
  adopted: { label: 'Пристроен', color: 'text-blue-600', bg: 'bg-blue-100' },
};

export function PetDetailModal({ pet, onClose, onEdit, onDelete, onStatusChange }: PetDetailModalProps) {
  const status = statusLabels[pet.status] || statusLabels.available;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Познакомьтесь с ${pet.name}!`,
          text: `${pet.name} ищет дом! ${pet.description}`,
          url: `${window.location.origin}/pet/${pet.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/pet/${pet.id}`);
        alert('Ссылка скопирована!');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-[900px] w-full max-h-[90vh] overflow-auto"
      >
        {/* Header Image */}
        <div className="relative h-[350px]">
          <img
            src={pet.image}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Status Badge */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={cn("px-4 py-2 rounded-full text-[12px] font-bold", status.bg, status.color)}>
              {status.label}
            </span>
            <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-white/90 text-[#1A1A1A]">
              {pet.category}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={onEdit}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              title="Редактировать"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              title="Печать"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              title="Поделиться"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[32px] font-bold text-[#1A1A1A]">{pet.name}</h2>
              <p className="text-[16px] text-[#666666]">{pet.breed} • {pet.age}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-[#6052B3] text-white rounded-xl text-[14px] font-medium hover:bg-[#4A3E90] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Редактировать
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[14px] font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-2 bg-[#E9F7EF] text-[#27AE60] rounded-full text-[14px] font-medium">
              {pet.gender === 'male' ? '♂️ Мальчик' : '♀️ Девочка'}
            </span>
            <span className="px-4 py-2 bg-[#F0EFFF] text-[#6052B3] rounded-full text-[14px] font-medium">
              {pet.size}
            </span>
            <span className="px-4 py-2 bg-[#FFF6E5] text-[#F2994A] rounded-full text-[14px] font-medium">
              {pet.ageGroup}
            </span>
            <span className="px-4 py-2 bg-[#FDEBB3] text-[#8B6914] rounded-full text-[14px] font-medium">
              {pet.color}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-[#666666] uppercase mb-3">Описание</h3>
            <p className="text-[16px] text-[#444444] leading-relaxed">{pet.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <Calendar className="w-5 h-5 text-[#6052B3] mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Возраст</p>
              <p className="text-[14px] font-bold text-[#1A1A1A]">{pet.age}</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <PawPrint className="w-5 h-5 text-[#6052B3] mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Порода</p>
              <p className="text-[14px] font-bold text-[#1A1A1A]">{pet.breed}</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <Info className="w-5 h-5 text-[#6052B3] mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Категория</p>
              <p className="text-[14px] font-bold text-[#1A1A1A]">{pet.category}</p>
            </div>
            <div className="p-4 bg-[#F8F8F8] rounded-xl text-center">
              <MapPin className="w-5 h-5 text-[#6052B3] mx-auto mb-2" />
              <p className="text-[12px] text-[#999999]">Размер</p>
              <p className="text-[14px] font-bold text-[#1A1A1A]">{pet.size}</p>
            </div>
          </div>

          {/* Additional Info */}
          {(pet.personality || pet.health || pet.specialNeeds || pet.notes) && (
            <div className="space-y-4 mb-8">
              {pet.personality && (
                <div className="p-4 bg-[#F8F8F8] rounded-xl">
                  <h4 className="text-[12px] font-bold text-[#666666] uppercase mb-2">Характер</h4>
                  <p className="text-[14px] text-[#444444]">{pet.personality}</p>
                </div>
              )}
              {pet.health && (
                <div className="p-4 bg-[#F8F8F8] rounded-xl">
                  <h4 className="text-[12px] font-bold text-[#666666] uppercase mb-2">Здоровье</h4>
                  <p className="text-[14px] text-[#444444]">{pet.health}</p>
                </div>
              )}
              {pet.specialNeeds && (
                <div className="p-4 bg-[#FFF6E5] rounded-xl">
                  <h4 className="text-[12px] font-bold text-[#F2994A] uppercase mb-2">Особые потребности</h4>
                  <p className="text-[14px] text-[#444444]">{pet.specialNeeds}</p>
                </div>
              )}
              {pet.notes && (
                <div className="p-4 bg-[#F0EFFF] rounded-xl">
                  <h4 className="text-[12px] font-bold text-[#6052B3] uppercase mb-2">Заметки</h4>
                  <p className="text-[14px] text-[#444444]">{pet.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Change */}
          <div className="border-t border-[#E5E5E5] pt-6">
            <h3 className="text-[14px] font-bold text-[#666666] uppercase mb-3">Изменить статус</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([key, { label, color, bg }]) => (
                <button
                  key={key}
                  onClick={() => onStatusChange(key)}
                  disabled={pet.status === key}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-medium transition-all",
                    pet.status === key
                      ? "bg-[#1A1A1A] text-white"
                      : `${bg} ${color} hover:opacity-80`
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E5] text-[12px] text-[#999999]">
            ID: {pet.id} • Добавлен: {new Date(pet.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Share2, Calendar, PawPrint, MapPin, Info } from 'lucide-react';

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
}

interface PetDetailModalProps {
  pet: Pet;
  onClose: () => void;
  onAdopt: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PetDetailModal: React.FC<PetDetailModalProps> = ({
  pet,
  onClose,
  onAdopt,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Познакомьтесь с ${pet.name}!`,
          text: `${pet.name} ищет дом! ${pet.description}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована!');
      }
    } catch {
      // ignore
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      available: 'Ищет дом',
      urgent: 'Срочно',
      treatment: 'На лечении',
      reserved: 'Забронирован',
      adopted: 'Уже дома',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-[#27AE60]',
      urgent: 'bg-[#FF4D4D]',
      treatment: 'bg-[#FFB800]',
      reserved: 'bg-[#6052B3]',
      adopted: 'bg-[#888888]',
    };
    return colors[status] || 'bg-[#888888]';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-[700px] w-full max-h-[90vh] overflow-auto"
        >
          {/* Image */}
          <div className="relative h-[300px] md:h-[350px]">
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
            {pet.status && (
              <div className="absolute bottom-4 left-4">
                <span className={`px-4 py-2 rounded-full text-[12px] font-bold text-white ${getStatusColor(pet.status)}`}>
                  {getStatusLabel(pet.status)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[28px] md:text-[32px] font-bold text-[#1A1A1A]">{pet.name}</h2>
                <p className="text-[16px] text-[#666666]">{pet.breed} • {pet.age}</p>
              </div>
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isFavorite
                      ? 'bg-[#E55C5C] text-white'
                      : 'bg-[#F0F0F0] text-[#999999] hover:bg-[#E5E5E5]'
                  }`}
                >
                  <Heart className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
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
            <p className="text-[16px] text-[#666666] leading-relaxed mb-8">
              {pet.description}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onAdopt}
                className="flex-1 bg-[#6052B3] text-white py-4 rounded-2xl font-bold text-[16px] hover:bg-[#4A3E90] transition-colors"
              >
                Приютить {pet.name}
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-4 border border-[#E5E5E5] rounded-2xl font-medium text-[#1A1A1A] hover:border-[#6052B3] transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

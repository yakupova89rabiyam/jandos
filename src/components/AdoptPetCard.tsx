import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Heart } from 'lucide-react';

export const AdoptPetCard = ({ pet, isFavorite, onToggleFavorite, onClick }: { key?: any, pet: any, isFavorite?: boolean, onToggleFavorite?: (pet: any) => void, onClick?: () => void }) => {
  const [isShareHovered, setIsShareHovered] = useState(false);
  const [isFavHovered, setIsFavHovered] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;

    const shareData = {
      title: `Познакомьтесь с ${pet.name}!`,
      text: `${pet.name} ищет дом! ${pet.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share(shareData);
      } catch {
        // share cancelled or failed silently
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col cursor-pointer group hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative h-[240px] w-full overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          src={pet.image} 
          alt={pet.name} 
          className="w-full h-full object-cover" 
        />
        
        {/* Status Badge */}
        {pet.status && (
          <div className="absolute top-4 left-4 z-10">
            <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
              pet.status === 'Срочно нужен дом' ? 'bg-[#FF4D4D] text-white' :
              pet.status === 'На лечении' ? 'bg-[#FFB800] text-white' :
              pet.status === 'Забронирован' ? 'bg-[#6052B3] text-white' :
              'bg-white/90 text-[#1A1A1A]'
            }`}>
              {pet.status}
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Share Button */}
          <div className="relative">
            <AnimatePresence>
              {(isShareHovered || showCopied) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none"
                >
                  {showCopied ? 'Link copied!' : 'Share this pet'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              type="button"
              onMouseEnter={() => setIsShareHovered(true)}
              onMouseLeave={() => setIsShareHovered(false)}
              onClick={(e) => {
                e.preventDefault();
                handleShare(e);
              }}
              disabled={isSharing}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] hover:bg-white hover:text-[#6052B3] shadow-lg transition-all duration-300 active:scale-95 z-20 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Favorite Button */}
          <div className="relative">
            <AnimatePresence>
              {isFavHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none"
                >
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              type="button"
              onMouseEnter={() => setIsFavHovered(true)}
              onMouseLeave={() => setIsFavHovered(false)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(pet);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-90 z-20 ${
                isFavorite 
                  ? 'bg-white text-[#E55C5C]' 
                  : 'bg-white/90 text-[#1A1A1A] hover:bg-white hover:text-[#E55C5C]'
              }`}
            >
              <Heart 
                size={20} 
                fill={isFavorite ? "currentColor" : "none"} 
                className={isFavorite ? "animate-heart-pop" : ""}
              />
            </button>
          </div>

          {/* Direct Adopt/Calendar Button */}
          <div className="relative group/cal">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                whileHover={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/cal:opacity-100 transition-opacity"
              >
                Записаться на встречу
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
              </motion.div>
            </AnimatePresence>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // We'll trigger the adoption flow directly
                // This will be handled by the parent's onAdopt if we pass it
                if ((window as any).handleAdoptFromCard) {
                  (window as any).handleAdoptFromCard(pet);
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6052B3] text-white shadow-lg hover:bg-[#4A3E90] transition-all duration-300 active:scale-90 z-20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Gender */}
          <div className={`w-6 h-6 rounded flex items-center justify-center ${pet.gender === 'female' ? 'bg-[#FFD6D6] text-[#E55C5C]' : 'bg-[#D6EFFF] text-[#4DA6FF]'}`}>
            {pet.gender === 'female' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"/><line x1="14" y1="10" x2="21" y2="3"/><polyline points="16 3 21 3 21 8"/></svg>
            )}
          </div>
          {/* Color */}
          <div className={`px-2.5 py-1 rounded text-[11px] font-medium ${pet.color === 'Рыжий' ? 'bg-[#FFE0B2] text-[#E65100]' : 'bg-[#E5E5E5] text-[#1A1A1A]'}`}>
            {pet.color} окрас
          </div>
          {/* Age Group */}
          <div className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#FDEBB3] text-[#D49A36]">
            {pet.ageGroup}
          </div>
          {/* Breed */}
          <div className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#C1F4C5] text-[#34A853]">
            {pet.breed}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
          <h3 className="text-[24px] font-bold text-[#1A1A1A] group-hover:text-[#6052B3] transition-colors">{pet.name}</h3>
          <span className="text-gray-300 text-[20px] leading-none">•</span>
          <span className="text-[14px] text-[#888888]">{pet.age}</span>
        </div>
        
        <p className="text-[14px] text-[#666666] leading-[1.6]">
          {pet.description}
        </p>
      </div>
    </motion.div>
  );
};

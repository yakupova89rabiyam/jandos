import React from 'react';
import { motion } from 'motion/react';
import { Plus, FileText, Users, CheckCircle2, Dog, Heart, Newspaper } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-6 shadow-sm">
      <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-4">Быстрые действия</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors",
              action.color
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
              {action.icon}
            </div>
            <span className="text-[12px] font-medium text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Preset quick actions
export function createQuickActions(
  onAddPet: () => void,
  onAddNews: () => void,
  onAddFundraiser: () => void,
  onViewPendingAdoptions: () => void,
  onViewPendingVolunteers: () => void,
  onViewPendingSurrenders: () => void
): QuickAction[] {
  return [
    {
      id: 'add-pet',
      label: 'Добавить питомца',
      icon: <Dog className="w-5 h-5 text-[#6052B3]" />,
      color: 'bg-[#F0EFFF] hover:bg-[#E5E0FF] text-[#6052B3]',
      onClick: onAddPet,
    },
    {
      id: 'add-news',
      label: 'Создать новость',
      icon: <Newspaper className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
      onClick: onAddNews,
    },
    {
      id: 'add-fundraiser',
      label: 'Новый сбор',
      icon: <Heart className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50 hover:bg-green-100 text-green-600',
      onClick: onAddFundraiser,
    },
    {
      id: 'pending-adoptions',
      label: 'Заявки на адопцию',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
      onClick: onViewPendingAdoptions,
    },
    {
      id: 'pending-volunteers',
      label: 'Волонтеры',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
      onClick: onViewPendingVolunteers,
    },
    {
      id: 'pending-surrenders',
      label: 'Передачи',
      icon: <FileText className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
      onClick: onViewPendingSurrenders,
    },
  ];
}

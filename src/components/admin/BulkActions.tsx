import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle2, XCircle, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
  onClick: () => void;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActions({ selectedCount, actions, onClear }: BulkActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6052B3] flex items-center justify-center text-[14px] font-bold">
              {selectedCount}
            </div>
            <span className="text-[14px]">
              {selectedCount === 1 ? 'элемент выбран' : 
               selectedCount < 5 ? 'элемента выбрано' : 'элементов выбрано'}
            </span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors",
                  action.variant === 'danger' && "hover:bg-red-500/20 text-red-400",
                  action.variant === 'success' && "hover:bg-green-500/20 text-green-400",
                  (!action.variant || action.variant === 'default') && "hover:bg-white/10"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={onClear}
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Отменить
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Preset bulk actions
export function createPetBulkActions(
  onStatusChange: (status: string) => void,
  onDelete: () => void,
  onExport: () => void
): BulkAction[] {
  return [
    {
      id: 'adopted',
      label: 'Пристроен',
      icon: <CheckCircle2 className="w-4 h-4" />,
      variant: 'success',
      onClick: () => onStatusChange('adopted'),
    },
    {
      id: 'available',
      label: 'Ищет дом',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: () => onStatusChange('available'),
    },
    {
      id: 'export',
      label: 'Экспорт',
      icon: <Download className="w-4 h-4" />,
      onClick: onExport,
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: onDelete,
    },
  ];
}

export function createUserBulkActions(
  onRoleChange: (role: string) => void,
  onBan: () => void,
  onUnban: () => void
): BulkAction[] {
  return [
    {
      id: 'admin',
      label: 'Сделать админом',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: () => onRoleChange('admin'),
    },
    {
      id: 'manager',
      label: 'Сделать менеджером',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: () => onRoleChange('manager'),
    },
    {
      id: 'user',
      label: 'Сделать пользователем',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: () => onRoleChange('user'),
    },
    {
      id: 'ban',
      label: 'Заблокировать',
      icon: <XCircle className="w-4 h-4" />,
      variant: 'danger',
      onClick: onBan,
    },
  ];
}

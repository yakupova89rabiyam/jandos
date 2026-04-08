import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, HeartPulse, PawPrint, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AttentionItem {
  id: string | number;
  type: 'urgent_pet' | 'treatment' | 'pending_adoption' | 'pending_surrender' | 'pending_volunteer';
  title: string;
  subtitle?: string;
  date?: string;
  priority: 'high' | 'medium' | 'low';
  onClick: () => void;
}

interface AttentionWidgetProps {
  items: AttentionItem[];
}

const typeConfig = {
  urgent_pet: { icon: AlertTriangle, label: 'Срочно', color: 'text-red-600', bg: 'bg-red-50' },
  treatment: { icon: HeartPulse, label: 'На лечении', color: 'text-amber-600', bg: 'bg-amber-50' },
  pending_adoption: { icon: PawPrint, label: 'Заявка на адопцию', color: 'text-blue-600', bg: 'bg-blue-50' },
  pending_surrender: { icon: Clock, label: 'Передача', color: 'text-purple-600', bg: 'bg-purple-50' },
  pending_volunteer: { icon: Clock, label: 'Волонтер', color: 'text-green-600', bg: 'bg-green-50' },
};

const priorityConfig = {
  high: { border: 'border-red-200', badge: 'bg-red-100 text-red-600' },
  medium: { border: 'border-amber-200', badge: 'bg-amber-100 text-amber-600' },
  low: { border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
};

export function AttentionWidget({ items }: AttentionWidgetProps) {
  const highPriorityCount = items.filter(i => i.priority === 'high').length;

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-bold text-[#1A1A1A]">Требуют внимания</h3>
          {highPriorityCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[12px] font-bold">
              {highPriorityCount}
            </span>
          )}
        </div>
        <span className="text-[13px] text-[#999999]">{items.length} задач</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-[#999999]">
          <p>Все задачи выполнены!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {items.map((item) => {
            const config = typeConfig[item.type];
            const priority = priorityConfig[item.priority];
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors hover:bg-gray-50",
                  priority.border
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.bg, config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded", priority.badge)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="font-medium text-[#1A1A1A] text-[14px] truncate mt-1">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-[12px] text-[#666666] truncate">{item.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[#999999]">
                  {item.date && (
                    <span className="text-[11px]">{item.date}</span>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

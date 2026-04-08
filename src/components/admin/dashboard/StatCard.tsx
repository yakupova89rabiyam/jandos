import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

const colorConfig = {
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue', onClick }: StatCardProps) {
  const colors = colorConfig[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm cursor-pointer",
        onClick && "hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colors.iconBg, colors.text)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-[12px] font-bold px-2 py-1 rounded-lg flex items-center gap-1",
            trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <h3 className="text-[#666666] text-[14px] font-medium">{title}</h3>
      <p className="text-[28px] font-bold text-[#1A1A1A] mt-1">{value}</p>
      {subtitle && <p className="text-[12px] text-[#999999] mt-1">{subtitle}</p>}
    </motion.div>
  );
}

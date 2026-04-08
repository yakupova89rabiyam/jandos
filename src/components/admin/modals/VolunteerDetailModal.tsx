import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Calendar, Briefcase, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface VolunteerDetailModalProps {
  volunteer: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const VolunteerDetailModal: React.FC<VolunteerDetailModalProps> = ({
  volunteer,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!volunteer) return null;

  const statusConfig = {
    pending: { label: 'На рассмотрении', color: 'text-orange-600', bg: 'bg-orange-100', icon: Clock },
    approved: { label: 'Одобрено', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    rejected: { label: 'Отклонено', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  };

  const status = statusConfig[volunteer.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#6052B3] flex items-center justify-center text-white text-xl font-bold">
                  {volunteer.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-[#1A1A1A]">{volunteer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1", status.bg, status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[#666666]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="bg-[#FAFAFA] rounded-2xl p-5 space-y-4">
                <h3 className="text-[14px] font-bold text-[#666666] uppercase tracking-wider">Контактная информация</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0EFFF] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#6052B3]" />
                    </div>
                    <div>
                      <span className="text-[12px] text-[#999999] block">Email</span>
                      <span className="text-[14px] font-medium text-[#1A1A1A]">{volunteer.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0EFFF] flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#6052B3]" />
                    </div>
                    <div>
                      <span className="text-[12px] text-[#999999] block">Телефон</span>
                      <span className="text-[14px] font-medium text-[#1A1A1A]">{volunteer.phone || 'Не указан'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0EFFF] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#6052B3]" />
                    </div>
                    <div>
                      <span className="text-[12px] text-[#999999] block">Дата подачи</span>
                      <span className="text-[14px] font-medium text-[#1A1A1A]">
                        {new Date(volunteer.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0EFFF] flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#6052B3]" />
                    </div>
                    <div>
                      <span className="text-[12px] text-[#999999] block">Опыт</span>
                      <span className={cn(
                        "text-[14px] font-medium",
                        volunteer.experience === 'yes' ? 'text-green-600' : 'text-gray-600'
                      )}>
                        {volunteer.experience === 'yes' ? 'Есть опыт работы с животными' : 'Нет опыта'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              {volunteer.motivation && (
                <div className="bg-[#FAFAFA] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-[#6052B3]" />
                    <h3 className="text-[14px] font-bold text-[#666666] uppercase tracking-wider">Мотивация</h3>
                  </div>
                  <p className="text-[15px] text-[#333333] leading-relaxed whitespace-pre-wrap">
                    {volunteer.motivation}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {volunteer.additional_info && (
                <div className="bg-[#FAFAFA] rounded-2xl p-5">
                  <h3 className="text-[14px] font-bold text-[#666666] uppercase tracking-wider mb-3">Дополнительная информация</h3>
                  <p className="text-[15px] text-[#333333] leading-relaxed whitespace-pre-wrap">
                    {volunteer.additional_info}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {volunteer.status === 'pending' && (
              <div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] p-6 flex gap-3">
                <button
                  onClick={onReject}
                  className="flex-1 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Отклонить
                </button>
                <button
                  onClick={onApprove}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Одобрить
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

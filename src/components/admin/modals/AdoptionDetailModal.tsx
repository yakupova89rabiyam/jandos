import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Dog, Calendar, MessageSquare, Clock, CheckCircle2, XCircle, Send, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AdoptionRequest {
  id: number;
  user_id: number;
  pet_id: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  pet_name: string;
  pet_image?: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  quiz_data?: any;
  created_at: string;
  updated_at?: string;
  manager_name?: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: string;
}

interface AdoptionDetailModalProps {
  request: AdoptionRequest;
  onClose: () => void;
  onStatusChange: (status: 'approved' | 'rejected') => void;
  onAddComment: (text: string) => void;
  onViewPet: () => void;
  onViewUser: () => void;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
  approved: { label: 'Одобрено', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
  rejected: { label: 'Отклонено', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

const responseTemplates = [
  { id: 'approve', label: 'Одобрить заявку', text: 'Здравствуйте! Ваша заявка на усыновление одобрена. Мы свяжемся с вами для назначения встречи.' },
  { id: 'reject_busy', label: 'Отклонить (занятость)', text: 'Здравствуйте! К сожалению, мы не можем одобрить заявку в данный момент. Питомец уже забронирован другим кандидатом.' },
  { id: 'reject_info', label: 'Запросить информацию', text: 'Здравствуйте! Для рассмотрения заявки нам нужна дополнительная информация. Пожалуйста, свяжитесь с нами.' },
];

export function AdoptionDetailModal({
  request,
  onClose,
  onStatusChange,
  onAddComment,
  onViewPet,
  onViewUser,
}: AdoptionDetailModalProps) {
  const [comment, setComment] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const status = statusConfig[request.status];
  const StatusIcon = status.icon;

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onAddComment(comment);
    setComment('');
  };

  const applyTemplate = (template: typeof responseTemplates[0]) => {
    setComment(template.text);
    setShowTemplates(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-[800px] w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", status.bg)}>
              <StatusIcon className={cn("w-6 h-6", status.color)} />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#1A1A1A]">Заявка на адопцию #{request.id}</h2>
              <p className="text-[14px] text-[#666666]">
                Создана {new Date(request.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={cn("p-4 rounded-2xl flex items-center gap-3", status.bg)}>
            <StatusIcon className={cn("w-5 h-5", status.color)} />
            <span className={cn("font-medium", status.color)}>{status.label}</span>
            {request.manager_name && (
              <span className="text-[13px] text-[#666666] ml-auto">
                Обработал: {request.manager_name}
              </span>
            )}
          </div>

          {/* User & Pet Info */}
          <div className="grid grid-cols-2 gap-4">
            {/* User Card */}
            <div 
              onClick={onViewUser}
              className="p-4 bg-[#F8F8F8] rounded-2xl cursor-pointer hover:bg-[#F0F0F0] transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#6052B3] text-white flex items-center justify-center font-bold">
                  {request.user_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                    {request.user_name}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#666666]">{request.user_email}</p>
                </div>
              </div>
              {request.user_phone && (
                <p className="text-[13px] text-[#666666]">📞 {request.user_phone}</p>
              )}
            </div>

            {/* Pet Card */}
            <div 
              onClick={onViewPet}
              className="p-4 bg-[#F8F8F8] rounded-2xl cursor-pointer hover:bg-[#F0F0F0] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={request.pet_image || '/placeholder-pet.png'} 
                  alt={request.pet_name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                    {request.pet_name}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[13px] text-[#666666]">ID питомца: {request.pet_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Data */}
          {request.quiz_data && (
            <div className="border border-[#E5E5E5] rounded-2xl p-4">
              <h3 className="text-[14px] font-bold text-[#666666] uppercase mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Данные анкеты
              </h3>
              <div className="space-y-3">
                {Object.entries(request.quiz_data).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex gap-4">
                    <span className="text-[13px] text-[#888888] w-[200px] shrink-0">{key}:</span>
                    <span className="text-[14px] text-[#1A1A1A]">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {request.message && (
            <div className="bg-[#F0EFFF] rounded-2xl p-4">
              <h3 className="text-[14px] font-bold text-[#6052B3] uppercase mb-2">Сообщение от пользователя</h3>
              <p className="text-[14px] text-[#444444]">{request.message}</p>
            </div>
          )}

          {/* Comments */}
          <div className="border border-[#E5E5E5] rounded-2xl p-4">
            <h3 className="text-[14px] font-bold text-[#666666] uppercase mb-4">Комментарии</h3>
            
            {request.comments && request.comments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {request.comments.map((c) => (
                  <div key={c.id} className="bg-[#F8F8F8] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#1A1A1A]">{c.author}</span>
                      <span className="text-[11px] text-[#999999]">
                        {new Date(c.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#444444]">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#999999] mb-4">Пока нет комментариев</p>
            )}

            {/* Add Comment */}
            <div className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="w-full p-3 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-[13px] text-[#6052B3] hover:underline"
                >
                  Шаблоны ответов
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-[#6052B3] text-white rounded-xl text-[13px] font-medium hover:bg-[#4A3E90] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Отправить
                </button>
              </div>
              
              {/* Templates */}
              {showTemplates && (
                <div className="mt-2 p-3 bg-[#F8F8F8] rounded-xl space-y-2">
                  {responseTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-2 hover:bg-white rounded-lg transition-colors text-[13px]"
                    >
                      <span className="font-medium text-[#1A1A1A]">{template.label}</span>
                      <p className="text-[12px] text-[#666666] truncate">{template.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {request.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
              <button
                onClick={() => onStatusChange('approved')}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Одобрить заявку
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Отклонить
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

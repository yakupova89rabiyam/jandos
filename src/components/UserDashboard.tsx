import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Heart, UserPlus, Calendar, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { usersApi, notificationsApi } from '../api/client';

export const UserDashboard = ({ user }: { user: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await usersApi.getMyData();
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      fetchData();
    } catch {
      // silently fail
    }
  };

  if (loading) return <div className="p-20 text-center">Загрузка...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 pt-24 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[48px] font-bold text-[#1A1A1A] tracking-tight">Привет, {user.name}!</h1>
          <p className="text-[#666666] text-[18px]">Здесь вы можете следить за вашими заявками и уведомлениями.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#6052B3]" />
              Уведомления
            </h2>
            {data?.notifications.filter((n: any) => !n.is_read).length > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {data?.notifications.filter((n: any) => !n.is_read).length}
              </span>
            )}
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {data?.notifications.length === 0 ? (
              <p className="text-[#999999] italic">У вас пока нет уведомлений.</p>
            ) : (
              data?.notifications.map((n: any) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-5 rounded-[24px] border transition-all cursor-pointer",
                    n.is_read ? "bg-white border-[#E5E5E5] opacity-60" : "bg-[#6052B3]/5 border-[#6052B3]/20 shadow-sm"
                  )}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <p className="font-bold text-[#1A1A1A] text-[15px] mb-1">{n.title}</p>
                  <p className="text-[13px] text-[#666666] leading-relaxed mb-2">{n.message}</p>
                  <p className="text-[11px] text-[#999999] uppercase font-bold tracking-wider">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Requests & Activity */}
        <div className="lg:col-span-2 space-y-12">
          {/* Adoption Requests */}
          <section className="space-y-6">
            <h2 className="text-[24px] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#6052B3]" />
              Заявки на адопцию
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.adoptions.length === 0 ? (
                <p className="text-[#999999] italic col-span-2">Вы еще не подавали заявок на адопцию.</p>
              ) : (
                data?.adoptions.map((req: any) => (
                  <div key={req.id} className="bg-white p-6 rounded-[32px] border border-[#E5E5E5] shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F0F0F0] rounded-2xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-[#6052B3]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A1A]">Питомец #{req.pet_id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {req.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {req.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                        {req.status === 'pending' && <Clock className="w-4 h-4 text-orange-500" />}
                        <span className={cn(
                          "text-[12px] font-bold uppercase tracking-wider",
                          req.status === 'approved' ? "text-green-600" : 
                          req.status === 'rejected' ? "text-red-600" : "text-orange-600"
                        )}>
                          {req.status === 'approved' ? 'Одобрено' : 
                           req.status === 'rejected' ? 'Отклонено' : 'В ожидании'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Volunteer Status */}
          <section className="space-y-6">
            <h2 className="text-[24px] font-bold text-[#1A1A1A] flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[#6052B3]" />
              Волонтерство
            </h2>
            {data?.volunteers.length === 0 ? (
              <div className="bg-[#F8F8F8] p-8 rounded-[32px] text-center border border-dashed border-[#E5E5E5]">
                <p className="text-[#666666] mb-4">Вы еще не подали заявку в команду волонтеров.</p>
                <button className="bg-[#6052B3] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#4A3E90] transition-all">
                  Стать волонтером
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E5] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[13px] font-bold text-[#999999] uppercase tracking-wider mb-1">Статус волонтера</p>
                      <p className="text-[20px] font-bold text-[#1A1A1A]">
                        {data.volunteers[0].status === 'approved' ? 'Активный волонтер' : 
                         data.volunteers[0].status === 'rejected' ? 'Заявка отклонена' : 'Заявка на рассмотрении'}
                      </p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      data.volunteers[0].status === 'approved' ? "bg-green-100 text-green-600" : 
                      data.volunteers[0].status === 'rejected' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {data.volunteers[0].status === 'approved' ? <CheckCircle2 /> : 
                       data.volunteers[0].status === 'rejected' ? <XCircle /> : <Clock />}
                    </div>
                  </div>
                  
                  {data.volunteers[0].status === 'approved' && (
                    <div className="pt-6 border-top border-[#F0F0F0] space-y-4">
                      <p className="font-bold text-[#1A1A1A] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#6052B3]" />
                        Ваши ближайшие смены
                      </p>
                      {data.shifts.length === 0 ? (
                        <p className="text-[#999999] text-[14px]">У вас пока нет запланированных смен.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.shifts.map((shift: any) => (
                            <div key={shift.id} className="p-4 bg-[#F8F8F8] rounded-2xl">
                              <p className="font-bold text-[#1A1A1A]">{shift.date}</p>
                              <p className="text-[13px] text-[#666666]">{shift.start_time} - {shift.end_time}</p>
                              <p className="text-[13px] text-[#6052B3] mt-2 font-medium">{shift.task}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

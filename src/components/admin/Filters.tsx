import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'date' | 'dateRange';
  options?: FilterOption[];
  placeholder?: string;
}

interface FiltersProps {
  config: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  className?: string;
}

export function Filters({ config, values, onChange, onReset, className }: FiltersProps) {
  const hasActiveFilters = Object.values(values).some(v => v && v !== '');

  return (
    <div className={cn("bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-[#666666]">
          <Filter className="w-4 h-4" />
          <span className="text-[14px] font-medium">Фильтры:</span>
        </div>

        {config.map(filter => (
          <div key={filter.key} className="flex items-center gap-2">
            {filter.type === 'search' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <input
                  type="text"
                  placeholder={filter.placeholder || 'Поиск...'}
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="pl-9 pr-8 py-2 bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none w-[200px]"
                />
                {values[filter.key] && (
                  <button
                    onClick={() => onChange(filter.key, '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3 text-[#999999]" />
                  </button>
                )}
              </div>
            )}

            {filter.type === 'select' && filter.options && (
              <div className="relative">
                <select
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className={cn(
                    "pl-4 pr-10 py-2 border rounded-xl text-[14px] focus:border-[#6052B3] outline-none appearance-none cursor-pointer bg-white",
                    values[filter.key] ? "border-[#6052B3] bg-[#F0EFFF] text-[#6052B3]" : "border-[#E5E5E5]"
                  )}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}

            {filter.type === 'date' && (
              <input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none"
              />
            )}

            {filter.type === 'dateRange' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={values[filter.key]?.from || ''}
                  onChange={(e) => onChange(filter.key, { ...values[filter.key], from: e.target.value })}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none"
                />
                <span className="text-[#999999]">—</span>
                <input
                  type="date"
                  value={values[filter.key]?.to || ''}
                  onChange={(e) => onChange(filter.key, { ...values[filter.key], to: e.target.value })}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-xl text-[14px] focus:border-[#6052B3] outline-none"
                />
              </div>
            )}
          </div>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}

// Preset filter configurations
export const petFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Имя, порода, описание...' },
  {
    key: 'category',
    label: 'Категория',
    type: 'select',
    options: [
      { value: 'Собаки', label: '🐕 Собаки' },
      { value: 'Кошки', label: '🐈 Кошки' },
      { value: 'Другие', label: '🐰 Другие' },
    ],
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'available', label: '🟢 Ищет дом' },
      { value: 'urgent', label: '🔴 Срочно' },
      { value: 'treatment', label: '🟡 На лечении' },
      { value: 'reserved', label: '🟣 Забронирован' },
      { value: 'adopted', label: '🔵 Пристроен' },
    ],
  },
  {
    key: 'gender',
    label: 'Пол',
    type: 'select',
    options: [
      { value: 'male', label: '♂️ Мальчик' },
      { value: 'female', label: '♀️ Девочка' },
    ],
  },
  {
    key: 'size',
    label: 'Размер',
    type: 'select',
    options: [
      { value: 'Маленький', label: 'Маленький' },
      { value: 'Средний', label: 'Средний' },
      { value: 'Большой', label: 'Большой' },
    ],
  },
];

export const userFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Имя, email, телефон...' },
  {
    key: 'role',
    label: 'Роль',
    type: 'select',
    options: [
      { value: 'admin', label: 'Администратор' },
      { value: 'manager', label: 'Менеджер' },
      { value: 'user', label: 'Пользователь' },
    ],
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'active', label: 'Активен' },
      { value: 'banned', label: 'Заблокирован' },
    ],
  },
];

export const adoptionFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Имя, email, питомец...' },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'pending', label: '⏳ На рассмотрении' },
      { value: 'approved', label: '✅ Одобрено' },
      { value: 'rejected', label: '❌ Отклонено' },
    ],
  },
  { key: 'dateRange', label: 'Период', type: 'dateRange' },
];

export const surrenderFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Имя, телефон...' },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'new', label: '🆕 Новая' },
      { value: 'in_review', label: '👁️ На рассмотрении' },
      { value: 'accepted', label: '✅ Принята' },
      { value: 'rejected', label: '❌ Отклонена' },
    ],
  },
  { key: 'dateRange', label: 'Период', type: 'dateRange' },
];

export const volunteerFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Имя, email...' },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'pending', label: '⏳ На рассмотрении' },
      { value: 'approved', label: '✅ Одобрен' },
      { value: 'rejected', label: '❌ Отклонён' },
    ],
  },
];

export const fundraiserFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Название сбора...' },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'active', label: '🟢 Активен' },
      { value: 'completed', label: '🔵 Завершён' },
    ],
  },
];

export const newsFilters: FilterConfig[] = [
  { key: 'search', label: 'Поиск', type: 'search', placeholder: 'Заголовок...' },
  {
    key: 'category',
    label: 'Категория',
    type: 'select',
    options: [
      { value: 'События', label: 'События' },
      { value: 'Новости', label: 'Новости' },
      { value: 'Истории', label: 'Истории' },
    ],
  },
];

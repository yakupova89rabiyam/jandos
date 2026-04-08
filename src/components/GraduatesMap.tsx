import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { graduatesApi } from '../api/client';

const DISTRICT_DEFS = [
  { id: 'almaty', name: 'Алмалинский', path: 'M 20 20 L 80 20 L 80 80 L 20 80 Z' },
  { id: 'bostandyk', name: 'Бостандыкский', path: 'M 80 20 L 140 20 L 140 80 L 80 80 Z' },
  { id: 'medeu', name: 'Медеуский', path: 'M 140 20 L 200 20 L 200 80 L 140 80 Z' },
  { id: 'auezov', name: 'Ауэзовский', path: 'M 20 80 L 80 80 L 80 140 L 20 140 Z' },
  { id: 'jetysu', name: 'Жетысуский', path: 'M 80 80 L 140 80 L 140 140 L 80 140 Z' },
  { id: 'turksib', name: 'Турксибский', path: 'M 140 80 L 200 80 L 200 140 L 140 140 Z' },
];

export const GraduatesMap = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [graduates, setGraduates] = useState<any[]>([]);

  useEffect(() => {
    graduatesApi.getAll()
      .then(setGraduates)
      .catch(() => {});
  }, []);

  // Compute counts per district from real data
  const districtCounts = graduates.reduce((acc: Record<string, number>, g) => {
    if (g.district) acc[g.district] = (acc[g.district] || 0) + 1;
    return acc;
  }, {});

  const districts = DISTRICT_DEFS.map(d => ({
    ...d,
    count: districtCounts[d.id] || 0,
  }));

  const maxCount = Math.max(...districts.map(d => d.count), 1);
  const totalCount = graduates.length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#F0F0F0]">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Map Visualization */}
        <div className="flex-1 w-full aspect-square relative bg-[#F8F9FA] rounded-[24px] p-8 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 220 160" className="w-full h-full drop-shadow-xl">
            {districts.map((d) => (
              <motion.path
                key={d.id}
                d={d.path}
                fill={selectedDistrict?.id === d.id ? '#6052B3' : '#E5E3F5'}
                stroke="white"
                strokeWidth="2"
                whileHover={{ fill: selectedDistrict?.id === d.id ? '#6052B3' : '#D4D1F0', scale: 1.02 }}
                onClick={() => setSelectedDistrict(d)}
                className="cursor-pointer transition-colors duration-300"
              />
            ))}
            {/* Dots representing graduates */}
            {[...Array(Math.min(graduates.length, 20))].map((_, i) => (
              <motion.circle
                key={i}
                cx={30 + (i * 37 + 13) % 160}
                cy={30 + (i * 53 + 7) % 100}
                r="2"
                fill="#6052B3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: (i * 0.3) % 2 }}
              />
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E5E5E5]">
            <div className="w-2 h-2 rounded-full bg-[#6052B3]"></div>
            <span className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Выпускники</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-[320px] flex flex-col">
          <h3 className="text-[28px] font-bold text-[#1A1A1A] mb-6 leading-tight">
            Карта <span className="text-[#6052B3]">счастья</span>
          </h3>
          <p className="text-[#666666] leading-relaxed mb-8">
            Наши выпускники находят любящие дома по всему городу. Нажмите на район, чтобы увидеть статистику.
          </p>

          <AnimatePresence mode="wait">
            {selectedDistrict ? (
              <motion.div
                key={selectedDistrict.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#F0EFFF] rounded-[24px] p-6 border border-[#6052B3]/10"
              >
                <h4 className="text-[#6052B3] font-bold text-xl mb-2">{selectedDistrict.name}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1A1A1A]">{selectedDistrict.count}</span>
                  <span className="text-[#666666] font-medium">питомцев нашли дом</span>
                </div>
                <div className="mt-4 w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedDistrict.count / maxCount) * 100}%` }}
                    className="h-full bg-[#6052B3] rounded-full"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-[24px] p-6 border border-dashed border-gray-300 flex items-center justify-center text-center">
                <p className="text-gray-400 text-sm italic">Выберите район на карте</p>
              </div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4 p-4 bg-[#E9F7EF] rounded-[20px]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">🏠</div>
            <div>
              <p className="text-[13px] font-bold text-[#27AE60]">Всего дома</p>
              <p className="text-[18px] font-bold text-[#1A1A1A]">{totalCount} питомц{totalCount === 1 ? 'а' : totalCount >= 2 && totalCount <= 4 ? 'а' : 'ев'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

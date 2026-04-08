import React, { useState, useEffect } from 'react';
import { request } from '../api/client';

interface PageData {
  title: string;
  content: string;
}

export const AboutPage: React.FC = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await request('/api/pages/about');
        setPageData(data);
      } catch (err) {
        console.error('Failed to load page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#FAFAFA] min-h-screen py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6052B3]"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[500px] overflow-hidden mb-16">
          <img 
            src="./uploads/about.png" 
            alt="Волонтеры приюта ЖанДос" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content from CMS */}
        <div className="prose prose-lg max-w-none">
          <h1 className="text-[32px] md:text-[40px] font-bold text-[#1A1A1A] mb-8">
            {pageData?.title || 'О нас'}
          </h1>
          <div 
            className="text-[#333333] text-[16px] md:text-[18px] leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: pageData?.content || '' }}
          />
        </div>
      </div>
    </div>
  );
};

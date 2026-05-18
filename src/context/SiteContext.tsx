import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteContent } from '../types';

interface SiteContextType {
  siteContent: Record<string, string>;
  isLoading: boolean;
  refreshSiteContent: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('site_content').select('*');
      if (data) {
        const contentMap: Record<string, string> = {};
        data.forEach((item: SiteContent) => contentMap[item.key] = item.value);
        setSiteContent(contentMap);
      }
    } catch (err) {
      console.error('Error fetching site content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SiteContext.Provider value={{ siteContent, isLoading, refreshSiteContent: fetchData }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider');
  }
  return context;
}

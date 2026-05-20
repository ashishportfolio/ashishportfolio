import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, HeroMedia, ArchiveMedia, AboutContent, ClientLogo, SiteContent, AvailabilitySlot, Booking, Inquiry } from '../types';
import { useSiteContext } from '../context/SiteContext';
import Reveal from '../components/Reveal';
import HomeCMS from '../components/cms/HomeCMS';
import ProjectsCMS from '../components/cms/ProjectsCMS';
import AboutCMS from '../components/cms/AboutCMS';
import ServicesCMS from '../components/cms/ServicesCMS';
import ContactCMS from '../components/cms/ContactCMS';
import GlobalCMS from '../components/cms/GlobalCMS';
import FooterCMS from '../components/cms/FooterCMS';
import BrandCMS from '../components/cms/BrandCMS';

const CMS_PASSWORD = "ashish123";

// Simple custom modal for confirmation since window.confirm can be blocked in iframes
const ConfirmModal = ({ isOpen, onClose, onConfirm, title }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-bg border border-border p-8 max-w-sm w-full text-center space-y-6">
        <h3 className="text-xl font-display font-medium uppercase tracking-tight">{title}</h3>
        <p className="text-xs text-muted uppercase tracking-widest leading-relaxed">This action cannot be undone. Are you sure you want to proceed?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 border border-border text-[10px] font-bold uppercase tracking-widest hover:border-fg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function CMS() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'about' | 'services' | 'contact' | 'global' | 'footer' | 'brand'>('home');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveMedia | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<ClientLogo | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, type: 'project' | 'hero' | 'archive' | 'logo' | 'booking' | 'inquiry' }>({
    isOpen: false,
    id: '',
    type: 'project'
  });

  const { refreshSiteContent } = useSiteContext();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch projects
      const { data: pData, error: pError } = await supabase.from('projects').select('*');
      if (pError) console.error("Projects Fetch Error:", pError);
      if (pData) setProjects(pData.sort((a,b) => parseInt(b.year) - parseInt(a.year)));

      // Fetch Archive
      const { data: aData, error: aError } = await supabase.from('archive_media').select('*');
      if (aError) console.error("Archive Fetch Error:", aError);
      if (aData) setArchiveMedia(aData.sort((a,b) => a.order_index - b.order_index));

      // Fetch About
      const { data: abData } = await supabase.from('about_content').select('*').maybeSingle();
      if (abData) setAboutData(abData);

      // Fetch Logos
      const { data: lData } = await supabase.from('client_logos').select('*');
      if (lData) setClientLogos(lData.sort((a,b) => a.order_index - b.order_index));

      // Fetch Site Content
      const { data: sData } = await supabase.from('site_content').select('*');
      if (sData) {
        const contentMap: Record<string, string> = {};
        sData.forEach((item: SiteContent) => {
          contentMap[item.key] = item.value;
        });
        setSiteContent(contentMap);
      }

      // Fetch Availability
      const { data: avData } = await supabase.from('availability_slots').select('*');
      if (avData) setAvailability(avData);

      // Fetch Bookings
      const { data: bData } = await supabase.from('bookings').select('*');
      if (bData) {
        const sortedBookings = [...bData].sort((a,b) => b.date.localeCompare(a.date));
        setBookings(sortedBookings);
      }

      // Fetch Inquiries
      const { data: iData, error: iError } = await supabase.from('inquiries').select('*');
      if (iError) {
        console.error("Inquiries Fetch Error:", iError);
        setMessage("Error fetching inquiries. Ensure 'inquiries' table exists.");
      }
      if (iData) {
        const sortedInquiries = [...iData].sort((a,b) => {
          if (a.created_at && b.created_at) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return 0;
        });
        setInquiries(sortedInquiries);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CMS_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setMessage("Incorrect password");
    }
  };

  const executeDelete = async () => {
    const { id, type } = confirmDelete;
    setIsLoading(true);
    try {
      let table = '';
      if (type === 'project') table = 'projects';
      else if (type === 'hero') table = 'hero_media';
      else if (type === 'archive') table = 'archive_media';
      else if (type === 'logo') table = 'client_logos';
      else if (type === 'booking') table = 'bookings';
      else if (type === 'inquiry') table = 'inquiries';

      if (table) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        setMessage("Deleted successfully!");
        fetchData();
        // Reset selections
        if (type === 'project') setSelectedProject(null);
        if (type === 'archive') setSelectedArchive(null);
        if (type === 'logo') setSelectedLogo(null);
      }
    } catch (err: any) {
      console.error("Delete Error:", err);
      setMessage(`Delete failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      setConfirmDelete({ isOpen: false, id: '', type: 'project' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const isVideoFlag = file.type.startsWith('video/');
      const bucket = isVideoFlag ? 'project-videos' : 'project-images';
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
      
      console.log('Uploaded URL:', publicUrl);

      // Local state update & Immediate save
      if (type === 'project' && selectedProject) {
        const updated = { ...selectedProject, [field]: publicUrl };
        setSelectedProject(updated);
        await supabase.from('projects').upsert(updated);
      } else if (type === 'archive' && selectedArchive) {
        const updated = { ...selectedArchive, [field]: publicUrl };
        setSelectedArchive(updated);
        await supabase.from('archive_media').upsert(updated);
      } else if (type === 'about') {
        if (field === 'image' || field === 'connect_image' || field === 'work_hero_bg') {
          if (aboutData) {
            const updated = { ...aboutData, [field]: publicUrl };
            setAboutData(updated);
            await supabase.from('about_content').upsert(updated);
          } else {
            const initial = { id: crypto.randomUUID(), image: field === 'image' ? publicUrl : "", [field]: publicUrl };
            setAboutData(initial);
            await supabase.from('about_content').upsert(initial);
          }
        } else {
          // New fields go to site_content KV store to avoid schema errors
          setSiteContent(prev => ({ ...prev, [field]: publicUrl }));
          await supabase.from('site_content').upsert({ key: field, value: publicUrl }, { onConflict: 'key' });
        }
      } else if (type === 'client' && selectedLogo) {
        const updated = { ...selectedLogo, logo: publicUrl };
        setSelectedLogo(updated);
        await supabase.from('client_logos').upsert(updated);
      }
      
      setMessage("Media uploaded and saved!");
      fetchData();
    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage(`Upload Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async (table: string, data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;
      setMessage("Saved successfully!");
      fetchData();
    } catch (err: any) {
      setMessage(`Save Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSiteContent = async (keys: string[]) => {
    setIsLoading(true);
    try {
      const updates = keys.map(key => ({
        key,
        value: siteContent[key] || ""
      }));
      
      const { error } = await supabase
        .from('site_content')
        .upsert(updates, { onConflict: 'key' });
        
      if (error) throw error;
      await refreshSiteContent();
      setMessage("Site content updated successfully!");
    } catch (err: any) {
      console.error("Save Site Content Error:", err);
      setMessage(`Update failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg p-6 font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-medium uppercase tracking-tighter text-fg">Admin Login</h1>
            <p className="text-[10px] text-muted tracking-[0.2em] uppercase">Private Dashboard</p>
          </div>
          <input 
            type="password" 
            placeholder="Passcode" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-center font-mono text-fg"
          />
          <button type="submit" className="w-full py-4 bg-fg text-bg text-[10px] uppercase tracking-widest font-bold font-sans">Enter</button>
          {message && <p className="text-[10px] text-red-500 uppercase tracking-widest text-center mt-2">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-32 pb-20 px-5 md:px-11 font-sans text-fg">
      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        onClose={() => setConfirmDelete({...confirmDelete, isOpen: false})} 
        onConfirm={executeDelete}
        title={`Delete ${confirmDelete.type === 'logo' ? 'Logo' : confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)}?`}
      />
      
      <div className="w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 border-b border-border pb-8 gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-medium uppercase tracking-tighter">CONTENT CMS</h1>
              <p className="text-[10px] text-muted tracking-[0.4em] uppercase mt-2">v0.3 — Unified Modular Edition</p>
            </div>
            <button 
                type="button"
                onClick={fetchData} 
                disabled={isLoading}
                className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] border-b border-[#FF4D00] pb-1 hover:opacity-60 transition-all disabled:opacity-30 self-start sm:self-center"
              >
                {isLoading ? 'Syncing...' : 'Force Refresh'}
              </button>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide gap-6 md:gap-8 uppercase text-[10px] tracking-widest font-bold whitespace-nowrap pb-4 xl:pb-0">
            {['home', 'projects', 'about', 'services', 'contact', 'global', 'footer', 'brand'].map((tab) => (
              <button 
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`transition-all duration-300 relative pb-1 ${activeTab === tab ? 'text-fg' : 'text-muted hover:text-fg'}`}
              >
                {tab === 'home' ? 'HOME PAGE' : tab === 'global' ? 'GLOBAL PARTNERS' : tab === 'footer' ? 'FOOTER LINKS' : tab === 'brand' ? 'BRAND STYLING' : tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fg" />}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-fg/5 border border-border text-[10px] uppercase tracking-widest text-fg flex justify-between items-center animate-fade-in mx-auto">
            <span className="flex items-center gap-3">
              <span className="w-2 h-2 bg-fg rounded-full animate-pulse" />
              {message}
            </span>
            <button type="button" onClick={() => setMessage("")} className="font-bold hover:scale-110 transition-transform p-2">✕</button>
          </div>
        )}

        <Reveal>
          {activeTab === 'home' && (
            <HomeCMS 
              siteContent={siteContent} 
              setSiteContent={setSiteContent} 
              saveSiteContent={saveSiteContent} 
              handleFileUpload={handleFileUpload} 
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsCMS 
              projects={projects} 
              archiveMedia={archiveMedia} 
              selectedProject={selectedProject} 
              setSelectedProject={setSelectedProject} 
              selectedArchive={selectedArchive} 
              setSelectedArchive={setSelectedArchive} 
              saveContent={saveContent} 
              isLoading={isLoading} 
              setConfirmDelete={setConfirmDelete} 
              handleFileUpload={handleFileUpload} 
              siteContent={siteContent}
              setSiteContent={setSiteContent}
              saveSiteContent={saveSiteContent}
            />
          )}

          {activeTab === 'about' && (
            <AboutCMS 
              aboutData={aboutData} 
              setAboutData={setAboutData} 
              saveContent={saveContent} 
              siteContent={siteContent} 
              setSiteContent={setSiteContent} 
              saveSiteContent={saveSiteContent} 
              handleFileUpload={handleFileUpload} 
            />
          )}

          {activeTab === 'services' && (
            <ServicesCMS 
              siteContent={siteContent} 
              setSiteContent={setSiteContent} 
              saveSiteContent={saveSiteContent} 
              handleFileUpload={handleFileUpload} 
            />
          )}

          {activeTab === 'contact' && (
            <ContactCMS 
              siteContent={siteContent} 
              setSiteContent={setSiteContent} 
              saveSiteContent={saveSiteContent} 
              handleFileUpload={handleFileUpload} 
              inquiries={inquiries} 
              bookings={bookings} 
              availability={availability} 
              setConfirmDelete={setConfirmDelete} 
              fetchData={fetchData} 
              isLoading={isLoading} 
            />
          )}

          {activeTab === 'global' && (
            <GlobalCMS 
              clientLogos={clientLogos} 
              selectedLogo={selectedLogo} 
              setSelectedLogo={setSelectedLogo} 
              saveContent={saveContent} 
              setConfirmDelete={setConfirmDelete} 
              handleFileUpload={handleFileUpload} 
            />
          )}

          {activeTab === 'footer' && (
            <FooterCMS 
              siteContent={siteContent}
              setSiteContent={setSiteContent}
              saveSiteContent={saveSiteContent}
            />
          )}

          {activeTab === 'brand' && (
            <BrandCMS 
              siteContent={siteContent}
              setSiteContent={setSiteContent}
              saveSiteContent={saveSiteContent}
            />
          )}
        </Reveal>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, HeroMedia, ArchiveMedia, AboutContent, ClientLogo, SiteContent, AvailabilitySlot, Booking, Inquiry } from '../types';
import Reveal from '../components/Reveal';
import { isVideo } from '../lib/utils';
import { Clock, Calendar, Check, Trash2, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'projects' | 'home' | 'about' | 'clients' | 'archive' | 'site' | 'availability' | 'inquiries'>('projects');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Bulk Availability State
  const [bulkDays, setBulkDays] = useState<number[]>([]);
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(60);
  const [managerMonth, setManagerMonth] = useState(new Date());

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
      if (pData) setProjects(pData.sort((a,b) => b.year - a.year));

      // Fetch Archive
      const { data: aData, error: aError } = await supabase.from('archive_media').select('*');
      if (aError) console.error("Archive Fetch Error:", aError);
      if (aData) setArchiveMedia(aData);

      // Fetch About
      const { data: abData } = await supabase.from('about_content').select('*').maybeSingle();
      if (abData) setAboutData(abData);

      // Fetch Logos
      const { data: lData } = await supabase.from('client_logos').select('*');
      if (lData) setClientLogos(lData);

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
      const isVideo = file.type.startsWith('video/');
      const bucket = isVideo ? 'project-videos' : 'project-images';
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
        if (field === 'image' || field === 'connect_image') {
          if (aboutData) {
            const updated = { ...aboutData, [field]: publicUrl };
            setAboutData(updated);
            await supabase.from('about_content').upsert(updated);
          } else {
            const initial = { id: crypto.randomUUID(), image: field === 'image' ? publicUrl : "", connect_image: field === 'connect_image' ? publicUrl : "" };
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
      setMessage("Site content updated successfully!");
    } catch (err: any) {
      console.error("Save Site Content Error:", err);
      setMessage(`Update failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkApply = async () => {
    if (bulkDays.length === 0 && bulkDates.length === 0) {
      setMessage("Select at least one day or date");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Delete existing slots for selected days/dates
      if (bulkDays.length > 0) {
        await supabase
          .from('availability_slots')
          .delete()
          .in('day_of_week', bulkDays);
      }
      
      if (bulkDates.length > 0) {
        await supabase
          .from('availability_slots')
          .delete()
          .in('date', bulkDates);
      }

      // 2. Generate new slots
      const newSlots: any[] = [];
      const startMinutes = parseInt(bulkStartTime.split(':')[0]) * 60 + parseInt(bulkStartTime.split(':')[1]);
      const endMinutes = parseInt(bulkEndTime.split(':')[0]) * 60 + parseInt(bulkEndTime.split(':')[1]);

      const generateForDay = (day: number | string, isRecurring: boolean) => {
        let current = startMinutes;
        while (current + slotDuration <= endMinutes) {
          const sH = Math.floor(current / 60).toString().padStart(2, '0');
          const sM = (current % 60).toString().padStart(2, '0');
          const eH = Math.floor((current + slotDuration) / 60).toString().padStart(2, '0');
          const eM = ((current + slotDuration) % 60).toString().padStart(2, '0');

          newSlots.push({
            id: crypto.randomUUID(),
            day_of_week: isRecurring ? day : null,
            date: !isRecurring ? day : null,
            start_time: `${sH}:${sM}`,
            end_time: `${eH}:${eM}`,
            is_active: true
          });
          current += slotDuration;
        }
      };

      bulkDays.forEach(day => generateForDay(day, true));
      bulkDates.forEach(date => generateForDay(date, false));

      const { error: insertError } = await supabase.from('availability_slots').insert(newSlots);
      if (insertError) throw insertError;

      setMessage(`Slots applied successfully`);
      setBulkDays([]);
      setBulkDates([]);
      fetchData();
    } catch (err: any) {
      setMessage(`Bulk Apply Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-medium uppercase tracking-tighter">Admin Login</h1>
            <p className="text-[10px] text-muted tracking-[0.2em] uppercase">Private Dashboard</p>
          </div>
          <input 
            type="password" 
            placeholder="Passcode" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-center font-mono"
          />
          {message && <p className="text-[10px] text-red-500 uppercase tracking-widest text-center animate-shake">{message}</p>}
          <button className="w-full py-4 bg-fg text-bg rounded-sm font-sans tracking-[0.2em] font-bold uppercase hover:bg-fg/90 transition-all">Enter Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-32 pb-20 px-5 md:px-11 font-sans">
      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        onClose={() => setConfirmDelete({...confirmDelete, isOpen: false})} 
        onConfirm={executeDelete}
        title={`Delete ${confirmDelete.type === 'logo' ? 'Logo' : confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)}?`}
      />
      
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-8 gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-medium uppercase tracking-tighter">CONTENT CMS</h1>
              <p className="text-[10px] text-muted tracking-[0.4em] uppercase mt-2">v0.2 — Final Branding Module</p>
            </div>
            <button 
                onClick={fetchData} 
                disabled={isLoading}
                className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] border-b border-[#FF4D00] pb-1 hover:opacity-60 transition-all disabled:opacity-30"
              >
                {isLoading ? 'Syncing...' : 'Force Refresh'}
              </button>
          </div>
          <div className="flex w-full md:w-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide gap-6 md:gap-8 uppercase text-[10px] tracking-widest font-bold whitespace-nowrap">
            {['projects', 'home', 'about', 'clients', 'archive', 'site', 'availability', 'inquiries'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`transition-all duration-300 relative pb-1 ${activeTab === tab ? 'text-fg' : 'text-muted hover:text-fg'}`}
              >
                {tab === 'home' ? 'HOME PAGE' : tab === 'site' ? 'SITE CONTENT' : tab === 'availability' ? 'BOOKINGS' : tab}
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
            <button onClick={() => setMessage("")} className="font-bold hover:scale-110 transition-transform p-2">✕</button>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
              <button 
                onClick={() => setSelectedProject({
                  id: crypto.randomUUID(), 
                  title: "Untitled Project", 
                  slug: "new-project", 
                  category: "BRAND IDENTITY", 
                  year: "2026", 
                  client: "", 
                  role: "", 
                  description: "", 
                  image: "", 
                  overview: "", 
                  challenge: "", 
                  approach: "", 
                  execution: "", 
                  outcome: "", 
                  is_featured: false,
                  image_overview: "",
                  image_challenge: "",
                  image_approach: "",
                  image_execution: "",
                  image_outcome: ""
                })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
              >+ NEW PROJECT</button>
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
                {projects.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`flex-shrink-0 md:flex-shrink-1 w-48 md:w-full text-left p-4 rounded-sm border transition-all ${selectedProject?.id === p.id ? 'bg-fg text-bg border-fg scale-[1.02]' : 'border-border hover:border-fg/50 text-muted'}`}
                  >
                    <div className="text-xs font-bold uppercase truncate">{p.title}</div>
                    <div className="text-[9px] opacity-60 uppercase mt-1">{p.year} / {p.category}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedProject ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('projects', selectedProject); }} className="space-y-8 md:space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Project Title</label>
                        <input type="text" value={selectedProject.title} onChange={e => setSelectedProject({...selectedProject, title: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Case Study Slug</label>
                        <input type="text" value={selectedProject.slug} onChange={e => setSelectedProject({...selectedProject, slug: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Client Name</label>
                        <input type="text" value={selectedProject.client || ""} onChange={e => setSelectedProject({...selectedProject, client: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Listing Description (Home Screen Snippet)</label>
                        <textarea value={selectedProject.description || ""} onChange={e => setSelectedProject({...selectedProject, description: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" rows={2} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Category (Deliverables)</label>
                        <input type="text" value={selectedProject.category} onChange={e => setSelectedProject({...selectedProject, category: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Publication Year</label>
                        <input type="text" value={selectedProject.year} onChange={e => setSelectedProject({...selectedProject, year: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Lead Role</label>
                        <input type="text" value={selectedProject.role || ""} onChange={e => setSelectedProject({...selectedProject, role: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Featured Configuration</h3>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={selectedProject.is_featured} onChange={e => setSelectedProject({...selectedProject, is_featured: e.target.checked})} className="w-4 h-4 rounded border-border text-fg focus:ring-0" />
                        <span className="text-[9px] uppercase tracking-widest text-muted group-hover:text-fg transition-colors">Featured on Home</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Thumbnail Asset (Image or Video)</label>
                        {selectedProject.image && (
                          <div className="w-full aspect-video overflow-hidden rounded-sm border border-border mb-4">
                            {isVideo(selectedProject.image) ? (
                              <video src={selectedProject.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                            ) : (
                              <img src={selectedProject.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        )}
                        <input type="text" placeholder="Media Link (Image/Video)" value={selectedProject.image} onChange={e => setSelectedProject({...selectedProject, image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2" />
                        <input type="file" onChange={e => handleFileUpload(e, 'image', 'project')} className="text-[9px] cursor-pointer" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Hover Transition Video (Optional)</label>
                        {selectedProject.hover_video && <video src={selectedProject.hover_video} className="w-full aspect-video object-cover rounded-sm border border-border mb-4" autoPlay muted loop playsInline />}
                        <input type="text" placeholder="Hover Video Link" value={selectedProject.hover_video || ""} onChange={e => setSelectedProject({...selectedProject, hover_video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2" />
                        <input type="file" onChange={e => handleFileUpload(e, 'hover_video', 'project')} className="text-[9px] cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Case Study Details */}
                  <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-12">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Full Case Study Content</h3>
                    {[
                      {id: 'overview', label: '01. Overview', media: 'image_overview'},
                      {id: 'challenge', label: '02. Challenge', media: 'image_challenge'},
                      {id: 'approach', label: '03. Approach', media: 'image_approach'},
                      {id: 'execution', label: '04. Execution', media: 'image_execution'},
                      {id: 'outcome', label: '05. Outcome', media: 'image_outcome'},
                    ].map(section => (
                      <div key={section.id} className="space-y-6 pt-12 border-t border-border/20 first:pt-0 first:border-0">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-muted font-bold">{section.label} Descriptive Text</label>
                          <textarea 
                            value={(selectedProject as any)[section.id]}
                            onChange={e => setSelectedProject({...selectedProject, [section.id]: e.target.value})}
                            rows={4}
                            className="w-full bg-transparent border border-border p-4 focus:outline-none focus:border-fg rounded-sm text-sm"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[9px] uppercase tracking-widest text-muted font-bold">{section.label} Full-Width Media (Image or Video)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <input type="text" placeholder="Media Link" value={(selectedProject as any)[section.media] || ""} onChange={e => setSelectedProject({...selectedProject, [section.media]: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg" />
                              <input type="file" onChange={e => handleFileUpload(e, section.media, 'project')} className="text-[9px]" />
                            </div>
                            {(selectedProject as any)[section.media] && (
                              <div className="relative group overflow-hidden rounded-sm border border-border aspect-[21/9]">
                                {isVideo((selectedProject as any)[section.media]) ? (
                                  <video src={(selectedProject as any)[section.media]} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                  <img src={(selectedProject as any)[section.media]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[8px] uppercase tracking-widest text-white">Section View</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 sticky bottom-6 bg-bg/80 backdrop-blur-md p-4 border border-border shadow-2xl z-50 rounded-lg">
                    <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transform active:scale-[0.98] transition-all">
                      {isLoading ? 'Processing...' : 'Deploy Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setConfirmDelete({ isOpen: true, id: selectedProject.id, type: 'project' })}
                      className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                    >Delete Project</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                   <span className="text-[10px] uppercase tracking-[0.4em] mb-4">No Selection</span>
                   <p className="text-[9px] uppercase tracking-widest opacity-40">Choose a project from the left panel to begin editing.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
              <button 
                onClick={() => setSelectedLogo({ id: crypto.randomUUID(), name: "Partner", logo: "", order_index: clientLogos.length })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
              >+ NEW CLIENT PARTNER</button>
              <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
                {clientLogos.map((l) => (
                  <button 
                    key={l.id}
                    onClick={() => setSelectedLogo(l)}
                    className={`flex-shrink-0 w-32 md:w-full text-left p-3 md:p-4 rounded-sm border transition-all ${selectedLogo?.id === l.id ? 'bg-fg text-bg border-fg' : 'border-border hover:border-fg/50 text-muted'}`}
                  >
                    <div className="text-[9px] md:text-[10px] font-bold uppercase truncate">{l.name}</div>
                    {l.logo && <img src={l.logo} className="h-3 md:h-4 w-auto object-contain mt-3 grayscale opacity-40 mx-auto" referrerPolicy="no-referrer" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedLogo ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('client_logos', selectedLogo); }} className="space-y-6 md:space-y-10">
                  <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Partner Name</label>
                      <input type="text" value={selectedLogo.name} onChange={e => setSelectedLogo({...selectedLogo, name: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none text-sm" placeholder="e.g. NIKE GLOBAL" />
                    </div>
                    
                    <div className="space-y-6">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Logo Representation (White SVG/PNG Preferred)</label>
                      <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                        <div className="w-full flex-1 space-y-4">
                          <input type="text" value={selectedLogo.logo || ""} onChange={e => setSelectedLogo({...selectedLogo, logo: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Paste SVG Link or Public Image URL" />
                          <div className="flex items-center gap-4">
                            <span className="text-[8px] uppercase text-muted">Or Upload:</span>
                            <input type="file" onChange={e => handleFileUpload(e, 'logo', 'client')} className="text-[8px] opacity-40 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-fg flex items-center justify-center rounded-sm">
                          {selectedLogo.logo ? (
                            <img src={selectedLogo.logo} className="w-16 h-16 md:w-20 md:h-20 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[8px] text-bg uppercase font-bold tracking-widest">Logo Preivew</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-[150px]">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Sorting Order</label>
                      <input type="number" value={selectedLogo.order_index} onChange={e => setSelectedLogo({...selectedLogo, order_index: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] order-2 sm:order-1">Save Partner</button>
                    <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedLogo.id, type: 'logo' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em] order-1 sm:order-2">Delete</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                   <span className="text-[10px] uppercase tracking-[0.4em]">Manage Global Partners</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HOME PAGE TAB */}
        {activeTab === 'home' && (
          <div className="max-w-2xl space-y-12">
            <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-12">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Home Hero & Profile Content</h2>
              
              {/* Hero Center Image */}
              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Main Hero Portrait (Center Image)</label>
                <div className="relative aspect-[3/4] bg-muted/10 max-w-sm rounded-[2px] overflow-hidden border border-border">
                  {siteContent['hero_center_image'] ? <img src={siteContent['hero_center_image']} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>}
                </div>
                <div className="space-y-4">
                  <input type="text" value={siteContent['hero_center_image'] || ""} onChange={e => setSiteContent({...siteContent, hero_center_image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Direct Image URL" />
                  <input type="file" onChange={e => handleFileUpload(e, 'hero_center_image', 'about')} className="text-[9px]" />
                </div>
              </div>

              {/* Profile Section Image */}
              <div className="space-y-6 pt-12 border-t border-border/20">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Profile Section Image (Home Page small image)</label>
                </div>
                <div className="relative aspect-video bg-muted/10 max-w-sm rounded-[2px] overflow-hidden border border-border">
                  {siteContent['profile_section_image'] ? <img src={siteContent['profile_section_image']} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>}
                </div>
                <div className="space-y-4">
                  <input type="text" value={siteContent['profile_section_image'] || ""} onChange={e => setSiteContent({...siteContent, profile_section_image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Direct Image URL" />
                  <input type="file" onChange={e => handleFileUpload(e, 'profile_section_image', 'about')} className="text-[9px]" />
                </div>
              </div>

              {/* Home Profile Content */}
              <div className="space-y-6 pt-12 border-t border-border/20">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Home Profile Section Content</label>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Main Heading</label>
                    <textarea value={siteContent['profile_title'] || ""} onChange={e => setSiteContent({...siteContent, profile_title: e.target.value})} className="w-full bg-transparent border border-border p-3 text-xs focus:outline-none" rows={3} placeholder="A digital designer based in..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Sub-Heading 1</label>
                      <input type="text" value={siteContent['profile_subtitle_1'] || ""} onChange={e => setSiteContent({...siteContent, profile_subtitle_1: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Bringing Ideas to Life" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Description 1</label>
                      <textarea value={siteContent['profile_desc_1'] || ""} onChange={e => setSiteContent({...siteContent, profile_desc_1: e.target.value})} className="w-full bg-transparent border border-border p-2 text-xs focus:outline-none" rows={3} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Sub-Heading 2</label>
                      <input type="text" value={siteContent['profile_subtitle_2'] || ""} onChange={e => setSiteContent({...siteContent, profile_subtitle_2: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Collaborate with Me" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Description 2</label>
                      <textarea value={siteContent['profile_desc_2'] || ""} onChange={e => setSiteContent({...siteContent, profile_desc_2: e.target.value})} className="w-full bg-transparent border border-border p-2 text-xs focus:outline-none" rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => saveSiteContent(['hero_center_image', 'profile_title', 'profile_subtitle_1', 'profile_desc_1', 'profile_subtitle_2', 'profile_desc_2', 'profile_section_image'])}
                  className="w-full py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-fg/90"
                >Update Home Page Content</button>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-12">
            <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-12">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">General Identity</h2>
              
              {/* Profile Image */}
              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">About Section Image (Portrait)</label>
                <div className="relative aspect-[3/4] bg-muted/10 max-w-sm rounded-[2px] overflow-hidden border border-border">
                  {aboutData?.image ? <img src={aboutData.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>}
                </div>
                <div className="space-y-4">
                  <input type="text" value={aboutData?.image || ""} onChange={e => setAboutData(aboutData ? {...aboutData, image: e.target.value} : { id: crypto.randomUUID(), image: e.target.value })} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Direct Image URL" />
                  <input type="file" onChange={e => handleFileUpload(e, 'image', 'about')} className="text-[9px]" />
                </div>
              </div>

              {/* Connect Section Image */}
              <div className="space-y-6 pt-12 border-t border-border/20">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Connect Section Image (Background Floating Image)</label>
                <div className="relative aspect-[3/4] bg-muted/10 max-w-sm rounded-[2px] overflow-hidden border border-border">
                  {aboutData?.connect_image ? <img src={aboutData.connect_image} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>}
                </div>
                <div className="space-y-4">
                  <input type="text" value={aboutData?.connect_image || ""} onChange={e => setAboutData(aboutData ? {...aboutData, connect_image: e.target.value} : { id: crypto.randomUUID(), image: "", connect_image: e.target.value })} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Direct Image URL" />
                  <input type="file" onChange={e => handleFileUpload(e, 'connect_image', 'about')} className="text-[9px]" />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => saveContent('about_content', aboutData)}
                  className="w-full py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-fg/90"
                >Update Portraits</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
              <button 
                onClick={() => setSelectedArchive({ id: crypto.randomUUID(), image: "", video: "", order_index: archiveMedia.length })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
              >+ ADD ARCHIVE ENTRY</button>
              <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
                {archiveMedia.map((a, i) => (
                  <button 
                    key={a.id}
                    onClick={() => setSelectedArchive(a)}
                    className={`flex-shrink-0 w-24 md:w-full text-left p-2 rounded-sm border transition-all ${selectedArchive?.id === a.id ? 'bg-fg border-fg' : 'border-border hover:border-fg/50'}`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[2px]">
                      {a.image ? <img src={a.image} className="w-full h-full object-cover grayscale opacity-60" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-muted/20" />}
                      <div className="absolute inset-x-1 bottom-1 flex justify-between items-center text-[7px] text-fg uppercase font-black bg-bg/90 px-1 py-0.5">
                        <span>#0{i+1}</span>
                        <span>idx {a.order_index}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedArchive ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('archive_media', selectedArchive); }} className="space-y-6 md:space-y-10">
                  <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Archive Entry Details</h3>
                       <input type="number" value={selectedArchive.order_index} onChange={e => setSelectedArchive({...selectedArchive, order_index: parseInt(e.target.value)})} className="w-20 bg-transparent border-b border-border text-center text-xs py-1 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Image Preview</label>
                        {selectedArchive.image && <img src={selectedArchive.image} className="w-full aspect-[4/5] object-cover rounded-sm border border-border" referrerPolicy="no-referrer" />}
                        <input type="text" placeholder="Entry URL" value={selectedArchive.image} onChange={e => setSelectedArchive({...selectedArchive, image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" />
                        <input type="file" onChange={e => handleFileUpload(e, 'image', 'archive')} className="text-[9px]" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Video Preview (Optional)</label>
                        {selectedArchive.video && <video src={selectedArchive.video} className="w-full aspect-[4/5] object-cover rounded-sm border border-border" autoPlay muted loop playsInline />}
                        <input type="text" placeholder="Entry Video URL" value={selectedArchive.video || ""} onChange={e => setSelectedArchive({...selectedArchive, video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" />
                        <input type="file" onChange={e => handleFileUpload(e, 'video', 'archive')} className="text-[9px]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] order-2 sm:order-1">Save Archive Entry</button>
                    <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedArchive.id, type: 'archive' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em] order-1 sm:order-2">Delete</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                   <span className="text-[10px] uppercase tracking-[0.4em]">Select Archive Entry</span>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'site' && (
          <div className="space-y-12">
            <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Services Page Content</h3>
                <button 
                  onClick={() => saveSiteContent(['services_banner_text', 'services_banner_link', 'services_banner_active', 'services_banner_image', 'service_image_brand', 'service_image_art', 'service_image_ai'])}
                  className="px-6 py-2 bg-fg text-bg rounded-sm text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >Save Section</button>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="services_banner_active"
                      checked={siteContent['services_banner_active'] === 'true'} 
                      onChange={e => setSiteContent({...siteContent, services_banner_active: e.target.checked ? 'true' : 'false'})} 
                      className="w-4 h-4 rounded border-border text-fg focus:ring-0"
                    />
                    <label htmlFor="services_banner_active" className="text-[9px] uppercase tracking-widest text-muted font-bold cursor-pointer">Activate Top Banner</label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Banner Text (Optional)</label>
                    <input 
                      type="text" 
                      value={siteContent['services_banner_text'] || ""} 
                      onChange={e => setSiteContent({...siteContent, services_banner_text: e.target.value})} 
                      className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                      placeholder="e.g. FREE 15 MIN STRATEGY SESSION — BOOK NOW"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Banner Image (Optional - replaces text background)</label>
                    {siteContent['services_banner_image'] && (
                      <div className="w-full h-12 overflow-hidden rounded-sm border border-border">
                        <img src={siteContent['services_banner_image']} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <input 
                      type="text" 
                      value={siteContent['services_banner_image'] || ""} 
                      onChange={e => setSiteContent({...siteContent, services_banner_image: e.target.value})} 
                      className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg" 
                      placeholder="Direct Image URL"
                    />
                    <input type="file" onChange={e => handleFileUpload(e, 'services_banner_image', 'about')} className="text-[9px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Banner Link (URL)</label>
                    <input 
                      type="text" 
                      value={siteContent['services_banner_link'] || ""} 
                      onChange={e => setSiteContent({...siteContent, services_banner_link: e.target.value})} 
                      className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                      placeholder="https://cal.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/20">
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Brand & Identity Image</label>
                      {siteContent['service_image_brand'] && (
                        <div className="aspect-[4/3] overflow-hidden rounded-sm border border-border">
                          <img src={siteContent['service_image_brand']} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <input type="text" value={siteContent['service_image_brand'] || ""} onChange={e => setSiteContent({...siteContent, service_image_brand: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Image URL" />
                      <input type="file" onChange={e => handleFileUpload(e, 'service_image_brand', 'about')} className="text-[9px]" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Art Direction Image</label>
                      {siteContent['service_image_art'] && (
                        <div className="aspect-[4/3] overflow-hidden rounded-sm border border-border">
                          <img src={siteContent['service_image_art']} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <input type="text" value={siteContent['service_image_art'] || ""} onChange={e => setSiteContent({...siteContent, service_image_art: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Image URL" />
                      <input type="file" onChange={e => handleFileUpload(e, 'service_image_art', 'about')} className="text-[9px]" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">AI Creative Image</label>
                      {siteContent['service_image_ai'] && (
                        <div className="aspect-[4/3] overflow-hidden rounded-sm border border-border">
                          <img src={siteContent['service_image_ai']} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <input type="text" value={siteContent['service_image_ai'] || ""} onChange={e => setSiteContent({...siteContent, service_image_ai: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Image URL" />
                      <input type="file" onChange={e => handleFileUpload(e, 'service_image_ai', 'about')} className="text-[9px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">About Page Content</h3>
                <button 
                  onClick={() => saveSiteContent(['about_title', 'about_description'])}
                  className="px-6 py-2 bg-fg text-bg rounded-sm text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >Save Section</button>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">About Title (Sub-label)</label>
                  <input 
                    type="text" 
                    value={siteContent['about_title'] || ""} 
                    onChange={e => setSiteContent({...siteContent, about_title: e.target.value})} 
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                    placeholder="Art Director / Digital Designer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">About Description</label>
                  <textarea 
                    value={siteContent['about_description'] || ""} 
                    onChange={e => setSiteContent({...siteContent, about_description: e.target.value})} 
                    className="w-full bg-transparent border border-border p-4 focus:outline-none focus:border-fg rounded-sm text-sm transition-colors" 
                    rows={4}
                    placeholder="Focused on Brand Perception, Visual Identity..."
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Contact Page Content</h3>
                <button 
                  onClick={() => saveSiteContent(['contact_title', 'contact_email', 'contact_phone', 'contact_address'])}
                  className="px-6 py-2 bg-fg text-bg rounded-sm text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >Save Section</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Contact Title Overlay</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_title'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_title: e.target.value})} 
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                    placeholder="LET'S CONNECT"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Contact Email</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_email'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_email: e.target.value})} 
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                    placeholder="hello@ashishguptaa.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Contact Phone</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_phone'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_phone: e.target.value})} 
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                    placeholder="+91-88661 38571"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Contact Address / Location</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_address'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_address: e.target.value})} 
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm transition-colors" 
                    placeholder="Ahmedabad, India"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'availability' && (
          <div className="space-y-12">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-fg text-bg rounded-sm flex flex-col justify-between min-h-[140px]">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Total Bookings</h3>
                <div className="text-4xl font-display font-medium">{bookings.length}</div>
              </div>
              <div className="p-8 bg-fg/[0.02] border border-border rounded-sm flex flex-col justify-between min-h-[140px]">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted">Weekly Slots</h3>
                <div className="text-4xl font-display font-medium text-fg">{availability.length}</div>
              </div>
              <div className="md:col-span-2 p-8 bg-[#FF4D00] text-white rounded-sm flex flex-col justify-between min-h-[140px]">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">Next Scheduled Session</h3>
                <div className="text-2xl font-display font-medium">
                  {bookings.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <span>{bookings[0].date} @ {bookings[0].time_slot}</span>
                      <span className="text-xs opacity-60 px-2 py-1 border border-white/20 rounded-sm">{bookings[0].name}</span>
                    </div>
                  ) : (
                    'Everything Clear'
                  )}
                </div>
              </div>
            </div>

            {/* UPCOMING BOOKINGS - RESPONSIVE VIEW */}
            <div className="p-4 md:p-8 bg-fg/[0.02] border border-border rounded-sm">
               <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/50">
                  <h2 className="text-xl font-display font-medium tracking-tight">Active Bookings Queue</h2>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted">{bookings.length} Total</div>
               </div>
               
               {/* Desktop Table View */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted border-b border-border/20">
                       <th className="py-4 font-bold">Date & Time</th>
                       <th className="py-4 font-bold">Client Info</th>
                       <th className="py-4 font-bold">Details</th>
                       <th className="py-4 font-bold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/10">
                     {bookings.map(booking => (
                       <tr key={booking.id} className="group hover:bg-fg/[0.01] transition-colors">
                         <td className="py-6">
                           <div className="flex flex-col gap-1">
                             <span className="text-[11px] font-bold uppercase tracking-widest">{booking.date}</span>
                             <span className="text-[9px] font-mono text-[#FF4D00] font-bold">{booking.time_slot} IST</span>
                           </div>
                         </td>
                         <td className="py-6">
                           <div className="flex flex-col gap-1">
                             <span className="text-[11px] font-bold uppercase tracking-tight">{booking.name}</span>
                             <div className="flex items-center gap-3 text-[9px] text-muted">
                               <span className="flex items-center gap-1"><Mail size={8} /> {booking.email}</span>
                               {booking.phone && <span className="flex items-center gap-1"><User size={8} /> {booking.phone}</span>}
                             </div>
                           </div>
                         </td>
                         <td className="py-6">
                           {booking.message ? (
                             <div className="max-w-xs text-[10px] text-muted italic line-clamp-1 group-hover:line-clamp-none transition-all">
                               "{booking.message}"
                             </div>
                           ) : (
                             <span className="text-[9px] text-muted/40 uppercase tracking-widest">No Message</span>
                           )}
                         </td>
                         <td className="py-6 text-right">
                           <button 
                             onClick={() => setConfirmDelete({ isOpen: true, id: booking.id, type: 'booking' })}
                             className="w-8 h-8 rounded-full border border-border inline-flex items-center justify-center text-muted hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                           >
                             <Trash2 size={12} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Mobile Card View */}
               <div className="md:hidden space-y-4">
                 {bookings.map(booking => (
                   <div key={booking.id} className="p-4 border border-border/40 rounded-sm space-y-4">
                     <div className="flex justify-between items-start">
                       <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest">{booking.date}</span>
                         <span className="text-[9px] font-mono text-[#FF4D00] font-bold">{booking.time_slot} IST</span>
                       </div>
                       <button 
                         onClick={() => setConfirmDelete({ isOpen: true, id: booking.id, type: 'booking' })}
                         className="p-2 text-muted hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                     <div className="space-y-1">
                       <div className="text-[12px] font-bold uppercase tracking-tight">{booking.name}</div>
                       <div className="text-[10px] text-muted break-all">{booking.email}</div>
                       {booking.phone && <div className="text-[10px] text-muted uppercase">PH: {booking.phone}</div>}
                     </div>
                     {booking.message && (
                       <div className="text-[10px] text-muted italic border-t border-border/10 pt-2 leading-relaxed">
                         "{booking.message}"
                       </div>
                     )}
                   </div>
                 ))}
               </div>

               {bookings.length === 0 && (
                 <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Calendar size={32} className="mb-4" />
                    <p className="text-[10px] uppercase tracking-[0.3em]">No Upcoming Sessions</p>
                 </div>
               )}
            </div>

            {/* Smart Bulk Editor - VERY COMPACT */}
            <div className="p-6 border border-border rounded-sm bg-fg/[0.01]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 pb-2 border-b border-border/50">
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-muted">Availability Manager</h2>
                <button 
                  onClick={handleBulkApply}
                  disabled={isLoading}
                  className="px-6 py-2 bg-fg text-bg rounded-sm text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95"
                >
                  Apply & Wipe Slots
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Specific Dates Calendar - COMPACT */}
                <div className="p-4 border border-border bg-bg rounded-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00]">01. Dates</h3>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setManagerMonth(new Date(managerMonth.getFullYear(), managerMonth.getMonth() - 1))} className="p-1 hover:bg-fg/5 rounded-full"><ChevronLeft size={12} /></button>
                       <span className="text-[8px] font-bold uppercase tracking-widest">{managerMonth.toLocaleString('default', { month: 'short' })}</span>
                       <button onClick={() => setManagerMonth(new Date(managerMonth.getFullYear(), managerMonth.getMonth() + 1))} className="p-1 hover:bg-fg/5 rounded-full"><ChevronRight size={12} /></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={`${d}-${i}`} className="text-[7px] font-bold text-muted uppercase py-1">{d}</span>
                    ))}
                    {Array.from({ length: new Date(managerMonth.getFullYear(), managerMonth.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`e-${i}`} />
                    ))}
                    {Array.from({ length: new Date(managerMonth.getFullYear(), managerMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const dObj = new Date(managerMonth.getFullYear(), managerMonth.getMonth(), day);
                      const dStr = dObj.toISOString().split('T')[0];
                      const isSelected = bulkDates.includes(dStr);
                      return (
                        <button
                          key={day}
                          onClick={() => setBulkDates(prev => isSelected ? prev.filter(d => d !== dStr) : [...prev, dStr])}
                          className={`aspect-square text-[8px] font-medium rounded-sm transition-all flex items-center justify-center
                            ${isSelected ? 'bg-[#FF4D00] text-white' : 'hover:bg-fg/5'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 border border-border bg-bg rounded-sm">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] mb-4">02. Days</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => {
                      const isSelected = bulkDays.includes(i);
                      return (
                        <button
                          key={day}
                          onClick={() => setBulkDays(prev => isSelected ? prev.filter(d => d !== i) : [...prev, i])}
                          className={`px-2 py-1.5 border rounded-sm text-[7px] font-bold tracking-widest transition-all ${isSelected ? 'bg-fg text-bg border-fg' : 'border-border text-muted hover:border-fg/50'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 border border-border bg-bg rounded-sm space-y-4">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00]">03. Times</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[7px] font-bold uppercase text-muted">Start</label>
                      <input type="time" value={bulkStartTime} onChange={e => setBulkStartTime(e.target.value)} className="w-full bg-bg border border-border p-2 text-[9px] font-mono focus:border-fg outline-none rounded-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-bold uppercase text-muted">End</label>
                      <input type="time" value={bulkEndTime} onChange={e => setBulkEndTime(e.target.value)} className="w-full bg-bg border border-border p-2 text-[9px] font-mono focus:border-fg outline-none rounded-sm" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[7px] font-bold uppercase text-muted">Slot Duration</label>
                      <select value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value))} className="w-full bg-bg border border-border p-2 text-[9px] font-bold tracking-widest focus:border-fg outline-none rounded-sm">
                        <option value={30}>30m</option>
                        <option value={45}>45m</option>
                        <option value={60}>60m</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VISUALIZATION OF CURRENT RULES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 border border-border rounded-sm bg-fg/[0.01]">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-8 border-b border-border/20 pb-4">Weekly Schedule</h3>
                   <div className="space-y-2">
                     {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => {
                       const slots = availability.filter(s => s.day_of_week === dayIndex && !s.date).sort((a,b) => a.start_time.localeCompare(b.start_time));
                       if (slots.length === 0) return null;
                       return (
                         <div key={day} className="flex items-center gap-4 py-3 border-b border-border/10">
                            <span className="w-24 text-[9px] font-bold uppercase tracking-widest">{day}</span>
                            <div className="flex flex-wrap gap-2">
                              {slots.map(s => (
                                <div key={s.id} className="px-2 py-1 bg-bg border border-border rounded-sm text-[8px] font-mono flex items-center gap-2 group">
                                  {s.start_time}
                                  <button onClick={() => supabase.from('availability_slots').delete().eq('id', s.id).then(() => fetchData())} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                                </div>
                              ))}
                            </div>
                         </div>
                       );
                     })}
                   </div>
                </div>

                <div className="p-8 border border-border rounded-sm bg-fg/[0.01]">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-8 border-b border-border/20 pb-4">Special Overrides</h3>
                   <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {Array.from(new Set(availability.filter(s => s.date).map(s => s.date as string))).sort().map(dateStr => {
                        const slots = availability.filter(s => s.date === dateStr).sort((a,b) => a.start_time.localeCompare(b.start_time));
                        return (
                          <div key={dateStr} className="p-4 bg-bg border border-border rounded-sm">
                             <div className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] mb-3">{dateStr}</div>
                             <div className="flex flex-wrap gap-2">
                              {slots.map(s => (
                                <div key={s.id} className="px-2 py-1 bg-fg/5 rounded-sm text-[8px] font-mono flex items-center gap-2 group">
                                  {s.start_time}
                                  <button onClick={() => supabase.from('availability_slots').delete().eq('id', s.id).then(() => fetchData())} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                                </div>
                              ))}
                             </div>
                          </div>
                        );
                      })}
                      {availability.filter(s => s.date).length === 0 && <p className="text-[9px] text-muted italic">No specific date overrides set.</p>}
                   </div>
                </div>
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-xl font-display font-medium tracking-tight">Contact Form Inquiries</h2>
                <p className="text-[10px] text-muted tracking-widest uppercase mt-1">Direct messages from the contact page</p>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted">{inquiries.length} Total Messages</div>
            </div>

            <div className="p-4 md:p-8 bg-fg/[0.02] border border-border rounded-sm">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted border-b border-border/20">
                      <th className="py-4 font-bold">Date</th>
                      <th className="py-4 font-bold">Sender</th>
                      <th className="py-4 font-bold">Subject</th>
                      <th className="py-4 font-bold">Message</th>
                      <th className="py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {inquiries.map(inquiry => (
                      <tr key={inquiry.id} className="group hover:bg-fg/[0.01] transition-colors">
                        <td className="py-6">
                          <span className="text-[10px] font-mono text-muted">
                             {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('en-GB') : 'N/A'}
                          </span>
                        </td>
                        <td className="py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-tight">{inquiry.name}</span>
                            <span className="text-[9px] text-muted flex items-center gap-1">
                              <Mail size={8} /> {inquiry.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00]">
                            {inquiry.subject}
                          </span>
                        </td>
                        <td className="py-6">
                          <div className="max-w-md text-[10px] text-muted leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                            {inquiry.message}
                          </div>
                        </td>
                        <td className="py-6 text-right">
                          <button 
                            onClick={() => setConfirmDelete({ isOpen: true, id: inquiry.id, type: 'inquiry' })}
                            className="w-8 h-8 rounded-full border border-border inline-flex items-center justify-center text-muted hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} className="p-4 border border-border/40 rounded-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-muted">
                           {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00]">
                          {inquiry.subject}
                        </span>
                      </div>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: inquiry.id, type: 'inquiry' })}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[12px] font-bold uppercase tracking-tight">{inquiry.name}</div>
                      <div className="text-[10px] text-muted break-all">{inquiry.email}</div>
                    </div>
                    <div className="text-[10px] text-muted leading-relaxed border-t border-border/10 pt-2">
                      {inquiry.message}
                    </div>
                  </div>
                ))}
              </div>

              {inquiries.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                   <Mail size={32} className="mb-4" />
                   <p className="text-[10px] uppercase tracking-[0.3em]">No inquiries found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

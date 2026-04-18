import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, HeroMedia, ArchiveMedia, AboutContent, ClientLogo, SiteContent } from '../types';
import Reveal from '../components/Reveal';
import { isVideo } from '../lib/utils';

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
  const [activeTab, setActiveTab] = useState<'projects' | 'hero' | 'about' | 'clients' | 'archive' | 'site'>('projects');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedHero, setSelectedHero] = useState<HeroMedia | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveMedia | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<ClientLogo | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, type: 'project' | 'hero' | 'archive' | 'logo' }>({
    isOpen: false,
    id: '',
    type: 'project'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: pData } = await supabase.from('projects').select('*').order('year', { ascending: false });
      const { data: hData } = await supabase.from('hero_media').select('*').order('order_index', { ascending: true });
      const { data: aData } = await supabase.from('archive_media').select('*').order('order_index', { ascending: true });
      const { data: abData } = await supabase.from('about_content').select('*').single();
      const { data: lData } = await supabase.from('client_logos').select('*').order('order_index', { ascending: true });
      const { data: sData } = await supabase.from('site_content').select('*');
      
      if (pData) setProjects(pData);
      if (hData) setHeroMedia(hData);
      if (aData) setArchiveMedia(aData);
      if (abData) setAboutData(abData);
      if (lData) setClientLogos(lData);
      
      if (sData) {
        const contentMap: Record<string, string> = {};
        sData.forEach((item: SiteContent) => {
          contentMap[item.key] = item.value;
        });
        setSiteContent(contentMap);
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

      if (table) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        setMessage("Deleted successfully!");
        fetchData();
        // Reset selections
        if (type === 'project') setSelectedProject(null);
        if (type === 'hero') setSelectedHero(null);
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
      } else if (type === 'hero' && selectedHero) {
        const updated = { ...selectedHero, [field]: publicUrl };
        setSelectedHero(updated);
        await supabase.from('hero_media').upsert(updated);
      } else if (type === 'archive' && selectedArchive) {
        const updated = { ...selectedArchive, [field]: publicUrl };
        setSelectedArchive(updated);
        await supabase.from('archive_media').upsert(updated);
      } else if (type === 'about' && aboutData) {
        const updated = { ...aboutData, [field]: publicUrl };
        setAboutData(updated);
        await supabase.from('about_content').upsert(updated);
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
          <div>
            <h1 className="text-4xl font-display font-medium uppercase tracking-tighter">CONTENT CMS</h1>
            <p className="text-[10px] text-muted tracking-[0.4em] uppercase mt-2">v0.2 — Final Branding Module</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8 uppercase text-[10px] tracking-widest font-bold">
            {['projects', 'hero', 'about', 'clients', 'archive', 'site'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`transition-all duration-300 relative pb-1 ${activeTab === tab ? 'text-fg' : 'text-muted hover:text-fg'}`}
              >
                {tab === 'site' ? 'SITE CONTENT' : tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fg" />}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-fg/5 border border-border text-[10px] uppercase tracking-widest text-fg flex justify-between items-center animate-fade-in">
            <span className="flex items-center gap-3">
              <span className="w-2 h-2 bg-fg rounded-full animate-pulse" />
              {message}
            </span>
            <button onClick={() => setMessage("")} className="font-bold hover:scale-110 transition-transform">✕</button>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 border-r border-border pr-8 space-y-4">
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
              <div className="space-y-2 overflow-y-auto max-h-[60vh] scrollbar-hide">
                {projects.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`w-full text-left p-4 rounded-sm border transition-all ${selectedProject?.id === p.id ? 'bg-fg text-bg border-fg scale-[1.02]' : 'border-border hover:border-fg/50 text-muted'}`}
                  >
                    <div className="text-xs font-bold uppercase truncate">{p.title}</div>
                    <div className="text-[9px] opacity-60 uppercase mt-1">{p.year} / {p.category}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedProject ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('projects', selectedProject); }} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-fg/[0.02] border border-border rounded-sm">
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

                  <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
                    <div className="flex justify-between items-center">
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

        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
             <div className="md:col-span-4 border-r border-border pr-8 space-y-4">
              <button 
                onClick={() => setSelectedHero({ id: crypto.randomUUID(), image: "", video: "", order_index: heroMedia.length })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
              >+ NEW HERO MEDIA</button>
              <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                {heroMedia.map((h, i) => (
                  <button 
                    key={h.id}
                    onClick={() => setSelectedHero(h)}
                    className={`w-full group text-left px-5 py-6 rounded-sm border transition-all ${selectedHero?.id === h.id ? 'bg-fg text-bg border-fg' : 'border-border hover:border-fg/50 text-muted'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase">Frame 0{i + 1}</span>
                      <span className="text-[9px] opacity-40 group-hover:opacity-100 uppercase tracking-widest">Idx {h.order_index}</span>
                    </div>
                    {h.image && <img src={h.image} className="w-full h-12 object-cover mt-4 opacity-40 rounded-sm" referrerPolicy="no-referrer" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedHero ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('hero_media', selectedHero); }} className="space-y-10">
                  <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-10">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Frame Settings</h3>
                       <div className="flex items-center gap-4">
                         <label className="text-[9px] uppercase tracking-widest text-muted">Sort Index</label>
                         <input type="number" value={selectedHero.order_index} onChange={e => setSelectedHero({...selectedHero, order_index: parseInt(e.target.value)})} className="w-16 bg-transparent border-b border-border text-center text-xs py-1 focus:outline-none focus:border-fg" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Image Asset</label>
                        <div className="relative aspect-[4/5] bg-muted/10 rounded-sm overflow-hidden border border-border group">
                          {selectedHero.image ? (
                            <img src={selectedHero.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase font-bold text-muted/30">Select Media</div>
                          )}
                        </div>
                        <input type="text" placeholder="Paste Image URL" value={selectedHero.image} onChange={e => setSelectedHero({...selectedHero, image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" />
                        <input type="file" onChange={e => handleFileUpload(e, 'image', 'hero')} className="text-[9px]" />
                      </div>

                      <div className="space-y-6">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Video Asset (Overrides Image)</label>
                        <div className="relative aspect-[4/5] bg-muted/10 rounded-sm overflow-hidden border border-border group">
                          {selectedHero.video ? (
                            <video src={selectedHero.video} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase font-bold text-muted/30">Empty</div>
                          )}
                        </div>
                        <input type="text" placeholder="Paste Video URL" value={selectedHero.video || ""} onChange={e => setSelectedHero({...selectedHero, video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" />
                        <input type="file" onChange={e => handleFileUpload(e, 'video', 'hero')} className="text-[9px]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 border border-border rounded-lg bg-fg/[0.01]">
                    <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transform active:scale-[0.98] transition-all">Save Frame</button>
                    <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedHero.id, type: 'hero' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em]">Delete</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                   <span className="text-[10px] uppercase tracking-[0.4em] mb-4">Select Hero Frame</span>
                   <p className="text-[9px] uppercase tracking-widest opacity-40">Choose a sequence frame to modify the looping hero section.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 border-r border-border pr-8 space-y-4">
              <button 
                onClick={() => setSelectedLogo({ id: crypto.randomUUID(), name: "Partner", logo: "", order_index: clientLogos.length })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase"
              >+ NEW CLIENT PARTNER</button>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pr-2">
                {clientLogos.map((l) => (
                  <button 
                    key={l.id}
                    onClick={() => setSelectedLogo(l)}
                    className={`text-left p-4 rounded-sm border transition-all ${selectedLogo?.id === l.id ? 'bg-fg text-bg border-fg' : 'border-border hover:border-fg/50 text-muted'}`}
                  >
                    <div className="text-[10px] font-bold uppercase truncate">{l.name}</div>
                    {l.logo && <img src={l.logo} className="h-4 w-auto object-contain mt-3 grayscale opacity-40" referrerPolicy="no-referrer" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              {selectedLogo ? (
                <form onSubmit={(e) => { e.preventDefault(); saveContent('client_logos', selectedLogo); }} className="space-y-10">
                  <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Partner Name</label>
                      <input type="text" value={selectedLogo.name} onChange={e => setSelectedLogo({...selectedLogo, name: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none text-sm" placeholder="e.g. NIKE GLOBAL" />
                    </div>
                    
                    <div className="space-y-6">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Logo Representation (White SVG/PNG Preferred)</label>
                      <div className="flex items-center gap-10">
                        <div className="flex-1 space-y-4">
                          <input type="text" value={selectedLogo.logo || ""} onChange={e => setSelectedLogo({...selectedLogo, logo: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none" placeholder="Paste SVG Link or Public Image URL" />
                          <div className="flex items-center gap-4">
                            <span className="text-[8px] uppercase text-muted">Or Upload:</span>
                            <input type="file" onChange={e => handleFileUpload(e, 'logo', 'client')} className="text-[8px] opacity-40 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="w-32 h-32 bg-fg flex items-center justify-center rounded-sm">
                          {selectedLogo.logo ? (
                            <img src={selectedLogo.logo} className="w-20 h-20 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[8px] text-bg uppercase font-bold tracking-widest">Logo Preivew</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-muted italic">Note: Pasting a URL here will automatically show up in the Home screen partner loop.</p>
                    </div>

                    <div className="space-y-2 max-w-xs">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Sorting Order</label>
                      <input type="number" value={selectedLogo.order_index} onChange={e => setSelectedLogo({...selectedLogo, order_index: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none text-sm" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em]">Save Partner</button>
                    <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedLogo.id, type: 'logo' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em]">Delete</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                   <span className="text-[10px] uppercase tracking-[0.4em]">Manage Global Partners</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ARCHIVE & ABOUT are similar in structure, ensuring all Save/Delete functions work identically */}
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

              <button 
                onClick={() => saveContent('about_content', aboutData)}
                className="w-full py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-fg/90"
              >Update Identity & Connect Media</button>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 border-r border-border pr-8 space-y-4">
              <button 
                onClick={() => setSelectedArchive({ id: crypto.randomUUID(), image: "", video: "", order_index: archiveMedia.length })}
                className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
              >+ ADD ARCHIVE ENTRY</button>
              <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                {archiveMedia.map((a, i) => (
                  <button 
                    key={a.id}
                    onClick={() => setSelectedArchive(a)}
                    className={`text-left p-2 rounded-sm border transition-all ${selectedArchive?.id === a.id ? 'bg-fg border-fg' : 'border-border hover:border-fg/50'}`}
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
                <form onSubmit={(e) => { e.preventDefault(); saveContent('archive_media', selectedArchive); }} className="space-y-10">
                  <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Archive Entry Details</h3>
                       <input type="number" value={selectedArchive.order_index} onChange={e => setSelectedArchive({...selectedArchive, order_index: parseInt(e.target.value)})} className="w-20 bg-transparent border-b border-border text-center text-xs py-1 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98]">Save Archive Entry</button>
                    <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedArchive.id, type: 'archive' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em]">Delete</button>
                  </div>
                </form>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
}

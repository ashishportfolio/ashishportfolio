import React, { useState } from 'react';
import { Mail, Trash2, User, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Inquiry, Booking, AvailabilitySlot } from '../../types';
import { supabase } from '../../lib/supabase';

interface ContactCMSProps {
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: any) => Promise<void>;
  inquiries: Inquiry[];
  bookings: Booking[];
  availability: AvailabilitySlot[];
  setConfirmDelete: React.Dispatch<React.SetStateAction<{ isOpen: boolean, id: string, type: 'project' | 'hero' | 'archive' | 'logo' | 'booking' | 'inquiry' }>>;
  fetchData: () => Promise<void>;
  isLoading: boolean;
}

export default function ContactCMS({
  siteContent,
  setSiteContent,
  saveSiteContent,
  handleFileUpload,
  inquiries,
  bookings,
  availability,
  setConfirmDelete,
  fetchData,
  isLoading
}: ContactCMSProps) {
  const [contactSubTab, setContactSubTab] = useState<'details' | 'inquiries' | 'bookings'>('details');

  // Bulk Availability State
  const [bulkDays, setBulkDays] = useState<number[]>([]);
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(60);
  const [managerMonth, setManagerMonth] = useState(new Date());

  const handleBulkApply = async () => {
    if (bulkDays.length === 0 && bulkDates.length === 0) {
      alert("Please select at least one Day or specific Date.");
      return;
    }

    try {
      // 1. Parse start and end times
      const [startHour, startMin] = bulkStartTime.split(':').map(Number);
      const [endHour, endMin] = bulkEndTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        alert("End time must be after start time");
        return;
      }

      // 2. Generate time slots
      const generatedSlots: { start: string; end: string }[] = [];
      let currentMinutes = startMinutes;

      while (currentMinutes + slotDuration <= endMinutes) {
        const sM = currentMinutes;
        const eM = currentMinutes + slotDuration;

        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatTime = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

        generatedSlots.push({
          start: formatTime(sM),
          end: formatTime(eM)
        });

        currentMinutes += slotDuration;
      }

      if (generatedSlots.length === 0) {
        alert("Duration is too long for the selected time window");
        return;
      }

      // 3. Clear existing matching slots and construct insert payload
      const slotsToInsert: any[] = [];

      if (bulkDays.length > 0) {
        // Weekly recurrent rule deletion & payload build
        await supabase.from('availability_slots').delete().in('day_of_week', bulkDays).is('date', null);
        for (const day of bulkDays) {
          for (const s of generatedSlots) {
            slotsToInsert.push({
              day_of_week: day,
              start_time: s.start,
              end_time: s.end,
              is_active: true
            });
          }
        }
      }

      if (bulkDates.length > 0) {
        // Override dates deletion & payload build
        await supabase.from('availability_slots').delete().in('date', bulkDates);
        for (const date of bulkDates) {
          for (const s of generatedSlots) {
            slotsToInsert.push({
              date: date,
              start_time: s.start,
              end_time: s.end,
              is_active: true
            });
          }
        }
      }

      // 4. Batch insert slots
      if (slotsToInsert.length > 0) {
        const { error } = await supabase.from('availability_slots').insert(slotsToInsert);
        if (error) throw error;
      }

      alert("Successfully configured availability slots!");
      
      // Reset selections
      setBulkDays([]);
      setBulkDates([]);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Error configuring bulk slot entries: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sub-tabs switcher */}
      <div className="flex border-b border-border/20 pb-4 gap-8 text-[10px] uppercase tracking-widest font-bold">
        <button 
          type="button"
          onClick={() => setContactSubTab('details')}
          className={`transition-all relative pb-2 ${contactSubTab === 'details' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Information & Banner
          {contactSubTab === 'details' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
        <button 
          type="button"
          onClick={() => setContactSubTab('inquiries')}
          className={`transition-all relative pb-2 ${contactSubTab === 'inquiries' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Inquiries Inbox {inquiries.length > 0 && `(${inquiries.length})`}
          {contactSubTab === 'inquiries' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
        <button 
          type="button"
          onClick={() => setContactSubTab('bookings')}
          className={`transition-all relative pb-2 ${contactSubTab === 'bookings' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Bookings & Availability
          {contactSubTab === 'bookings' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
      </div>

      {contactSubTab === 'details' && (() => {
        const section0Keys = ['contact_banner_active', 'contact_banner_text', 'contact_banner_image', 'contact_banner_link'];
        const section1Keys = ['contact_title', 'contact_heading'];
        const section2Keys = ['contact_para_1', 'contact_para_2', 'contact_point_1', 'contact_point_2', 'contact_point_3'];
        const section3Keys = ['contact_email', 'contact_phone', 'contact_address'];
        const allKeys = [...section0Keys, ...section1Keys, ...section2Keys, ...section3Keys];

        return (
          <div className="space-y-12 max-w-3xl font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/40 pb-4 gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF4D00]">Contact Copy Manager</h3>
                <p className="text-[10px] text-muted uppercase mt-1">Configure promotional banners, headlines, narratives and channels in order</p>
              </div>
              <button 
                type="button"
                onClick={() => saveSiteContent(allKeys)}
                className="px-6 py-2 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Publish All Copy Changes
              </button>
            </div>

            {/* SECTION 0: PROMO HEADER BANNER */}
            <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/60 rounded-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 00: Promo Header Banner</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => saveSiteContent(section0Keys)}
                  className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  Save Banner Only
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="contact_banner_active"
                    checked={siteContent['contact_banner_active'] === 'true'} 
                    onChange={e => setSiteContent({...siteContent, contact_banner_active: e.target.checked ? 'true' : 'false'})} 
                    className="w-4 h-4 rounded border-border/50 text-[#FF4D00] focus:ring-0 bg-transparent cursor-pointer"
                  />
                  <label htmlFor="contact_banner_active" className="text-[9px] uppercase tracking-widest text-fg font-bold cursor-pointer select-none">Activate Promo Banner on Contact Page</label>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Display Text</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_banner_text'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_banner_text: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
                    placeholder="e.g. FREE 15 MIN STRATEGY SESSION — BOOK NOW"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Background Image (Optional)</label>
                  {siteContent['contact_banner_image'] && (
                    <div className="w-full h-12 overflow-hidden rounded-sm border border-border/40 relative">
                      <img src={siteContent['contact_banner_image']} className="w-full h-full object-cover grayscale opacity-60" referrerPolicy="no-referrer" alt="banner preview" />
                    </div>
                  )}
                  <div className="space-y-2 font-sans">
                    <input 
                      type="text" 
                      value={siteContent['contact_banner_image'] || ""} 
                      onChange={e => setSiteContent({...siteContent, contact_banner_image: e.target.value})} 
                      className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none focus:border-fg text-fg font-mono" 
                      placeholder="Image URL"
                    />
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload Image:</span>
                      <input type="file" onChange={e => handleFileUpload(e, 'contact_banner_image', 'about')} className="text-[9px] text-muted w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Redirection Link (URL)</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_banner_link'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_banner_link: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg font-mono" 
                    placeholder="https://cal.com/username/strategy-call"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 1: HERO INTRODUCTION */}
            <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/60 rounded-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 01: Hero Intro Copy</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => saveSiteContent(section1Keys)}
                  className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  Save Introduction Only
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Contact Title Overlay Headline</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_title'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_title: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg uppercase font-mono" 
                    placeholder="LET'S CONNECT"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">Main Core Statement Heading</label>
                  <textarea 
                    value={siteContent['contact_heading'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_heading: e.target.value})} 
                    className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm font-medium" 
                    rows={2}
                    placeholder="Let’s give your next idea a story and a clear art direction."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PORTFOLIO / SERVICE RECAP DETAILS */}
            <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/60 rounded-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Narrative & Value Propositions</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => saveSiteContent(section2Keys)}
                  className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  Save Narrative Only
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Narrative Paragraph 1 (Capabilities description)</label>
                  <textarea 
                    value={siteContent['contact_para_1'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_para_1: e.target.value})} 
                    className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm" 
                    rows={4}
                    placeholder="For brand identity design, key visual design, campaign art direction..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Narrative Paragraph 2 (Intended Audience)</label>
                  <textarea 
                    value={siteContent['contact_para_2'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_para_2: e.target.value})} 
                    className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm" 
                    rows={3}
                    placeholder="Built for brands, founders, agencies, creators..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Value Proposition Bullet 1</label>
                    <input 
                      type="text" 
                      value={siteContent['contact_point_1'] || ""} 
                      onChange={e => setSiteContent({...siteContent, contact_point_1: e.target.value})} 
                      className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
                      placeholder="Visuals that carry a story."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Value Proposition Bullet 2</label>
                    <input 
                      type="text" 
                      value={siteContent['contact_point_2'] || ""} 
                      onChange={e => setSiteContent({...siteContent, contact_point_2: e.target.value})} 
                      className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
                      placeholder="Create connection."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Value Proposition Bullet 3</label>
                    <input 
                      type="text" 
                      value={siteContent['contact_point_3'] || ""} 
                      onChange={e => setSiteContent({...siteContent, contact_point_3: e.target.value})} 
                      className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
                      placeholder="Stay remembered."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: CHANNELS & DESTINATIONS */}
            <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/60 rounded-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 03: Direct Contact Channels</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => saveSiteContent(section3Keys)}
                  className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  Save Channels Only
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Display Email Link</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_email'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_email: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg font-mono" 
                    placeholder="hello@ashishguptaa.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Display Phone Line</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_phone'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_phone: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg font-mono" 
                    placeholder="+91-88661 38571"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Studio Location / Base</label>
                  <input 
                    type="text" 
                    value={siteContent['contact_address'] || ""} 
                    onChange={e => setSiteContent({...siteContent, contact_address: e.target.value})} 
                    className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg font-mono" 
                    placeholder="Ahmedabad, India"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => saveSiteContent(allKeys)}
                className="w-full py-4 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-lg font-bold uppercase tracking-[0.2em] transition-all text-center"
              >
                Publish All Contact Copy Changes
              </button>
            </div>
          </div>
        );
      })()}

      {contactSubTab === 'inquiries' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
            <div>
              <h2 className="text-xl font-display font-medium tracking-tight text-fg">Contact Form Inquiries</h2>
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
                          <span className="text-[11px] font-bold uppercase tracking-tight text-fg">{inquiry.name}</span>
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
                          type="button"
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
                      type="button"
                      onClick={() => setConfirmDelete({ isOpen: true, id: inquiry.id, type: 'inquiry' })}
                      className="p-2 text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[12px] font-bold uppercase tracking-tight text-fg">{inquiry.name}</div>
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
                 <Mail size={32} className="mb-4 text-muted" />
                 <p className="text-[10px] uppercase tracking-[0.3em] text-muted">No inquiries found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {contactSubTab === 'bookings' && (
        <div className="space-y-12">
          {/* Header & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 bg-fg text-bg rounded-sm flex flex-col justify-between min-h-[140px]">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Total Bookings</h3>
              <div className="text-4xl font-display font-medium text-bg">{bookings.length}</div>
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

          {/* UPCOMING BOOKINGS */}
          <div className="p-4 md:p-8 bg-fg/[0.02] border border-border rounded-sm">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/50">
                <h2 className="text-xl font-display font-medium tracking-tight text-fg">Active Bookings Queue</h2>
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
                           <span className="text-[11px] font-bold uppercase tracking-widest text-fg">{booking.date}</span>
                           <span className="text-[9px] font-mono text-[#FF4D00] font-bold">{booking.time_slot} IST</span>
                         </div>
                       </td>
                       <td className="py-6">
                         <div className="flex flex-col gap-1">
                           <span className="text-[11px] font-bold uppercase tracking-tight text-fg">{booking.name}</span>
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
                           type="button"
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
                       <span className="text-[10px] font-bold uppercase tracking-widest text-fg">{booking.date}</span>
                       <span className="text-[9px] font-mono text-[#FF4D00] font-bold">{booking.time_slot} IST</span>
                     </div>
                     <button 
                       type="button"
                       onClick={() => setConfirmDelete({ isOpen: true, id: booking.id, type: 'booking' })}
                       className="p-2 text-muted hover:text-red-500 transition-colors"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                   <div className="space-y-1">
                     <div className="text-[12px] font-bold uppercase tracking-tight text-fg">{booking.name}</div>
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
                  <Calendar size={32} className="mb-4 text-muted" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted">No Upcoming Sessions</p>
               </div>
             )}
          </div>

          {/* Smart Bulk Editor */}
          <div className="p-6 border border-border rounded-sm bg-fg/[0.01]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 pb-2 border-b border-border/50">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-muted">Availability Manager</h2>
              <button 
                type="button"
                onClick={handleBulkApply}
                disabled={isLoading}
                className="px-6 py-2 bg-fg text-bg rounded-sm text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95 text-center"
              >
                Apply & Wipe Slots
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Specific Dates Calendar */}
              <div className="p-4 border border-border bg-bg rounded-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#FF4D00]">01. Dates</h3>
                  <div className="flex items-center gap-2">
                     <button type="button" onClick={() => setManagerMonth(new Date(managerMonth.getFullYear(), managerMonth.getMonth() - 1))} className="p-1 hover:bg-fg/5 rounded-full text-fg"><ChevronLeft size={12} /></button>
                     <span className="text-[8px] font-bold uppercase tracking-widest text-fg">{managerMonth.toLocaleString('default', { month: 'short' })}</span>
                     <button type="button" onClick={() => setManagerMonth(new Date(managerMonth.getFullYear(), managerMonth.getMonth() + 1))} className="p-1 hover:bg-fg/5 rounded-full text-fg"><ChevronRight size={12} /></button>
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
                        type="button"
                        key={day}
                        onClick={() => setBulkDates(prev => isSelected ? prev.filter(d => d !== dStr) : [...prev, dStr])}
                        className={`aspect-square text-[8px] font-medium rounded-sm transition-all flex items-center justify-center
                          ${isSelected ? 'bg-[#FF4D00] text-white' : 'hover:bg-fg/5 text-fg'}`}
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
                        type="button"
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
                    <input type="time" value={bulkStartTime} onChange={e => setBulkStartTime(e.target.value)} className="w-full bg-bg border border-border p-2 text-[9px] font-mono focus:border-fg outline-none rounded-sm text-fg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold uppercase text-muted">End</label>
                    <input type="time" value={bulkEndTime} onChange={e => setBulkEndTime(e.target.value)} className="w-full bg-bg border border-border p-2 text-[9px] font-mono focus:border-fg outline-none rounded-sm text-fg" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[7px] font-bold uppercase text-muted">Slot Duration</label>
                    <select value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value))} className="w-full bg-bg border border-border p-2 text-[9px] font-bold tracking-widest focus:border-fg outline-none rounded-sm text-fg">
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
                          <span className="w-24 text-[9px] font-bold uppercase tracking-widest text-fg">{day}</span>
                          <div className="flex flex-wrap gap-2">
                            {slots.map(s => (
                              <div key={s.id} className="px-2 py-1 bg-bg border border-border rounded-sm text-[8px] font-mono flex items-center gap-2 group text-fg">
                                {s.start_time}
                                <button type="button" onClick={() => supabase.from('availability_slots').delete().eq('id', s.id).then(() => fetchData())} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
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
                              <div key={s.id} className="px-2 py-1 bg-fg/5 rounded-sm text-[8px] font-mono flex items-center gap-2 group text-fg">
                                {s.start_time}
                                <button type="button" onClick={() => supabase.from('availability_slots').delete().eq('id', s.id).then(() => fetchData())} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
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
    </div>
  );
}

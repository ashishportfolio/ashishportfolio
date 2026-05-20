import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Mail, Phone, Linkedin, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SiteContent } from '../types';
import { useSiteContext } from '../context/SiteContext';
import Button from '../components/Button';
import Reveal from '../components/Reveal';

export default function Contact() {
  const { siteContent } = useSiteContext();
  const [activeContactTab, setActiveContactTab] = useState<'inquiry' | 'booking'>('inquiry');

  // Inquiry form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Brand Identity',
    message: ''
  });

  // Scheduling/Booking states
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Date, 2: Time, 3: Details, 4: Success
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (err) {
      console.error("Availability fetch error:", err);
    }
  };

  const fetchBookedSlots = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('time_slot')
        .eq('date', dateString)
        .neq('status', 'cancelled');
      if (error) throw error;
      setBookedSlots(data?.map(b => b.time_slot) || []);
    } catch (err) {
      console.error("Booked slots fetch error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      // Send email notification
      try {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact',
            data: {
              name: formData.name,
              email: formData.email,
              subject: formData.subject,
              message: formData.message
            }
          })
        });

        if (!emailRes.ok) {
          const errorData = await emailRes.json();
          console.error('Email API Error:', errorData);
        }
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Brand Identity', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      if (typeof window !== 'undefined') {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) return;

    setBookingLoading(true);
    const dateString = selectedDate.toISOString().split('T')[0];

    try {
      const { error } = await supabase.from('bookings').insert({
        date: dateString,
        time_slot: selectedTimeSlot,
        name: bookingFormData.name,
        email: bookingFormData.email,
        phone: bookingFormData.phone,
        message: bookingFormData.message,
        status: 'pending'
      });

      if (error) throw error;

      // Send email notification
      try {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking',
            data: {
              name: bookingFormData.name,
              email: bookingFormData.email,
              phone: bookingFormData.phone,
              date: dateString,
              time_slot: selectedTimeSlot,
              message: bookingFormData.message
            }
          })
        });

        if (!emailRes.ok) {
          const errorData = await emailRes.json();
          console.error('Email API Error:', errorData);
        }
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      setBookingStep(4);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  // Calendar Helpers
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear();
  };

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isAvailable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Check if there are specific slots for this date
    const hasSpecificDateSlots = availableSlots.some(slot => slot.date === dateStr);
    if (hasSpecificDateSlots) return true;
    
    // Fallback to recurring weekly slots
    return availableSlots.some(slot => slot.day_of_week === dayOfWeek && !slot.date);
  };

  const getTimeSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // 1. Try to find slots for the specific date
    const specificSlots = availableSlots.filter(slot => slot.date === dateStr);
    if (specificSlots.length > 0) {
      return specificSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    
    // 2. Fallback to weekly recurring slots
    return availableSlots
      .filter(slot => slot.day_of_week === dayOfWeek && !slot.date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth);
  const startOffset = firstDayOfMonth(currentMonth);

  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="bg-bg text-fg font-sans selection:bg-fg selection:text-bg pb-12 md:pb-16 lg:pb-20 overflow-x-hidden relative">
      
      {/* TOP BANNER consistent with Services page */}
      {siteContent['contact_banner_active'] === 'true' && (siteContent['contact_banner_text'] || siteContent['contact_banner_image']) && (
        <div className="w-full relative z-50">
          <Reveal type="fade">
            {siteContent['contact_banner_link'] ? (
              <a 
                href={siteContent['contact_banner_link']}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group transition-transform hover:scale-[1.005]"
              >
                {siteContent['contact_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['contact_banner_image']} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <motion.div 
                    animate={siteContent['contact_banner_text']?.length > 40 ? { x: [0, -500] } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap flex gap-10"
                  >
                    <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                      {siteContent['contact_banner_text']}
                    </p>
                    {siteContent['contact_banner_text']?.length > 40 && (
                      <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                        {siteContent['contact_banner_text']}
                      </p>
                    )}
                  </motion.div>
                </div>
              </a>
            ) : (
              <div className="w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group">
                {siteContent['contact_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['contact_banner_image']} className="w-full h-full object-cover opacity-50 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                    {siteContent['contact_banner_text']}
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-12 sm:pt-20 lg:pt-32 px-4 sm:px-6 md:px-[7.2%]">
        <div className="w-full mx-auto font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-20">
            <div className="text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl sm:text-3xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-[1.1] mb-6 md:mb-10"
              >
                {siteContent['contact_heading'] || "Let’s give your next idea a story and a clear art direction."}
              </motion.h1>

              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                 className="space-y-4 md:space-y-6 text-xs md:text-sm text-balance text-muted leading-relaxed max-w-lg mb-8 md:mb-12"
              >
                <p>
                  {siteContent['contact_para_1'] || "For brand identity design, key visual design, campaign art direction, AI art direction, AI filmmaking, product visuals, movie posters, music key art, music videos, or complete visual systems — share the brief."}
                </p>
                <p>
                  {siteContent['contact_para_2'] || "Built for brands, founders, agencies, creators, artists, and filmmakers looking for visuals that do more than look good."}
                </p>
                <div className="space-y-1 font-medium text-fg">
                  <p>{siteContent['contact_point_1'] || "Visuals that carry a story."}</p>
                  <p>{siteContent['contact_point_2'] || "Create connection."}</p>
                  <p>{siteContent['contact_point_3'] || "Stay remembered."}</p>
                </div>
              </motion.div>

              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Get in Touch</h2>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Mail size={12} />
                      </div>
                      <p className="text-lg md:text-xl font-display font-medium group-hover:tracking-tight transition-all duration-500">
                        {siteContent['contact_email'] || "hello@ashishguptaa.com"}
                      </p>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Phone size={12} />
                      </div>
                      <p className="text-lg md:text-xl font-display font-medium opacity-60 group-hover:opacity-100 transition-all duration-500">
                        <a href={`tel:${siteContent['contact_phone'] || "+918866138571"}`}>
                          {siteContent['contact_phone'] || "+91-88661 38571"}
                        </a>
                      </p>
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Social</h2>
                  <div className="flex flex-col gap-2">
                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Linkedin size={12} />
                      </div>
                      <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="text-lg md:text-xl font-display font-medium hover:font-serif hover:italic transition-all">LinkedIn</a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col text-left">
              {/* Form & Booking Tabs Switcher */}
              <div className="flex border-b border-border mb-6 md:mb-8 gap-6 text-[10px] md:text-[11px] uppercase tracking-widest font-bold">
                <button 
                  type="button"
                  onClick={() => setActiveContactTab('inquiry')}
                  className={`pb-3 transition-all relative ${activeContactTab === 'inquiry' ? 'text-fg' : 'text-muted hover:text-fg'}`}
                >
                  Send Inquiry
                  {activeContactTab === 'inquiry' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#FF4D00]" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveContactTab('booking')}
                  className={`pb-3 transition-all relative ${activeContactTab === 'booking' ? 'text-fg' : 'text-muted hover:text-fg'}`}
                >
                  Schedule A Call
                  {activeContactTab === 'booking' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#FF4D00]" />}
                </button>
              </div>

              {/* TAB 1: QUICK INQUIRY FORM */}
              {activeContactTab === 'inquiry' && (
                <motion.form
                  key="inquiry-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 md:space-y-8 lg:space-y-10"
                >
                  {submitted ? (
                    <div className="py-20 text-center lg:text-left">
                      <Reveal type="glitch" className="text-2xl font-display font-medium mb-4">Message Sent.</Reveal>
                      <p className="text-sm text-muted">Thank you for reaching out. I'll get back to you shortly.</p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="mt-8 text-[10px] font-bold uppercase tracking-widest border-b border-fg pb-1"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        <div className="space-y-2">
                          <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Name</label>
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors text-xs" 
                            placeholder="Jane Smith" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Email</label>
                          <input 
                            required
                            type="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors text-xs" 
                            placeholder="jane@framer.com" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Project Type</label>
                        <select 
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors appearance-none text-xs"
                        >
                          <option value="Brand Identity" className="bg-bg">Brand Identity</option>
                          <option value="Art Direction" className="bg-bg">Art Direction</option>
                          <option value="AI Production" className="bg-bg">AI Production</option>
                          <option value="Other" className="bg-bg">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Message</label>
                        <textarea 
                          required
                          value={formData.message}
                          onChange={e => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors min-h-[120px] text-xs" 
                          placeholder="Tell me about your project..." 
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                      </Button>
                    </>
                  )}
                </motion.form>
              )}

              {/* TAB 2: INLINE DYNAMIC SCHEDULING CALENDAR */}
              {activeContactTab === 'booking' && (
                <motion.div
                  key="booking-calendar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-sm border border-border bg-white p-4 sm:p-6 lg:p-8 space-y-4 md:space-y-6"
                >
                  {bookingStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#FF4D00]">01. Date</h3>
                          <p className="text-[9px] text-muted uppercase tracking-widest mt-1">30 MIN STRATEGY SESSION (IST)</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} 
                            className="p-1.5 hover:bg-fg/5 rounded-full"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest font-mono">{formatMonth(currentMonth)}</span>
                          <button 
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} 
                            className="p-1.5 hover:bg-fg/5 rounded-full"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <span key={`${d}-${i}`} className="text-[9px] font-bold text-muted uppercase py-2">{d}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {calendarDays.map((day, i) => {
                          if (day === null) return <div key={`empty-${i}`} />;
                          const isSelected = selectedDate?.getDate() === day && 
                                            selectedDate?.getMonth() === currentMonth.getMonth();
                          const canBook = !isPast(day) && isAvailable(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={!canBook}
                              onClick={() => {
                                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                setSelectedDate(newDate);
                              }}
                              className={`aspect-square text-[10px] md:text-[11px] font-medium rounded-sm transition-all flex items-center justify-center relative
                                ${canBook ? 'hover:bg-[#FF4D00] hover:text-white border border-[#FF4D00]/20' : 'opacity-[0.15] cursor-not-allowed'}
                                ${isSelected ? 'bg-[#FF4D00] text-white font-bold' : ''}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex justify-end">
                        <Button
                          disabled={!selectedDate}
                          onClick={() => setBookingStep(2)}
                        >
                          Select Time Slot
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <button 
                        type="button"
                        onClick={() => setBookingStep(1)} 
                        className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] hover:opacity-80 mb-6"
                      >
                        <ChevronLeft size={12} /> Back to Calendar
                      </button>
                      <div className="mb-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted">02. Selected Date</h3>
                        <p className="text-xl font-display font-medium text-fg uppercase mt-1">
                          {selectedDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-none">
                        {selectedDate && getTimeSlotsForDate(selectedDate).length > 0 ? (
                          getTimeSlotsForDate(selectedDate).map(slot => {
                            const isBooked = bookedSlots.includes(slot.start_time);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTimeSlot(slot.start_time)}
                                className={`py-3 px-4 border text-[9px] font-mono font-bold uppercase tracking-widest transition-all rounded-sm
                                  ${isBooked ? 'opacity-20 cursor-not-allowed line-through' : 'hover:border-[#FF4D00]'}
                                  ${selectedTimeSlot === slot.start_time ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'border-border'}`}
                              >
                                {slot.start_time}
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-xs text-muted">No slots available for this date. Go back and select another date.</div>
                        )}
                      </div>

                      <div className="mt-8 flex justify-end">
                        <Button
                          disabled={!selectedTimeSlot}
                          onClick={() => setBookingStep(3)}
                        >
                          Fill Slot Details
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <button 
                        type="button"
                        onClick={() => setBookingStep(2)} 
                        className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#FF4D00] hover:opacity-80 mb-6"
                      >
                        <ChevronLeft size={12} /> Back
                      </button>
                      <div className="mb-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#FF4D00]">03. Your Details</h3>
                        <p className="text-[10px] text-muted font-mono uppercase tracking-wider mt-1 flex items-center gap-2">
                          <CalendarIcon size={12} /> {selectedDate?.toLocaleDateString()} @ <Clock size={12} /> {selectedTimeSlot} (IST)
                        </p>
                      </div>

                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-sans tracking-[0.1em] text-muted uppercase">Full Name</label>
                            <input 
                              required 
                              type="text" 
                              value={bookingFormData.name} 
                              onChange={e => setBookingFormData({...bookingFormData, name: e.target.value})} 
                              className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg transition-colors text-xs text-fg" 
                              placeholder="Ashish Kumar" 
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-[9px] font-sans tracking-[0.1em] text-muted uppercase">Email Address</label>
                              <input 
                                required 
                                type="email" 
                                value={bookingFormData.email} 
                                onChange={e => setBookingFormData({...bookingFormData, email: e.target.value})} 
                                className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg transition-colors text-xs text-fg" 
                                placeholder="ashish@framer.com" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-sans tracking-[0.1em] text-muted uppercase">Phone Number</label>
                              <input 
                                required 
                                type="tel" 
                                value={bookingFormData.phone} 
                                onChange={e => setBookingFormData({...bookingFormData, phone: e.target.value})} 
                                className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg transition-colors text-xs text-fg" 
                                placeholder="+91 99999 88888" 
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-sans tracking-[0.1em] text-muted uppercase">Message (Optional)</label>
                            <textarea 
                              value={bookingFormData.message} 
                              onChange={e => setBookingFormData({...bookingFormData, message: e.target.value})} 
                              className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#FF4D00] transition-colors text-xs min-h-[80px] resize-none text-fg" 
                              placeholder="Brief description of brand identity/key visual design requirements..." 
                            />
                          </div>
                        </div>

                        <div className="pt-6">
                          <button 
                            type="submit" 
                            disabled={bookingLoading} 
                            className="w-full py-3.5 bg-[#FF4D00] text-white rounded-sm font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-[#E64200] active:scale-[0.98] disabled:opacity-40"
                          >
                            {bookingLoading ? 'Registering Call Slot...' : 'Confirm Strategy Call Slot'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {bookingStep === 4 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="py-12 flex flex-col items-center text-center space-y-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-medium uppercase tracking-tight text-fg">Appointment Confirmed</h3>
                        <p className="text-[9px] text-muted uppercase tracking-widest font-mono leading-relaxed mt-2">
                          {selectedDate?.toLocaleDateString()} @ {selectedTimeSlot} IST
                        </p>
                        <p className="text-xs text-muted mt-2">The Google Meet invitation link has been configured and reserved for you.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setBookingStep(1);
                          setSelectedDate(null);
                          setSelectedTimeSlot(null);
                          setBookingFormData({ name: '', email: '', phone: '', message: '' });
                        }} 
                        className="px-8 py-3 border border-border rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-fg hover:text-bg transition-all"
                      >
                        Book Another Session
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

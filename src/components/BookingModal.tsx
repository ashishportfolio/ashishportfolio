import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AvailabilitySlot, Booking } from '../types';
import { useBooking } from '../context/BookingContext';

export default function BookingModal() {
  const { isModalOpen, closeBookingModal } = useBooking();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Date, 2: Time, 3: Details, 4: Success
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    if (isModalOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      fetchAvailability();
    }
  }, [isModalOpen]);

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) return;

    setLoading(true);
    const dateString = selectedDate.toISOString().split('T')[0];

    try {
      const { error } = await supabase.from('bookings').insert({
        date: dateString,
        time_slot: selectedTimeSlot,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: 'pending'
      });

      if (error) throw error;

      // Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking',
            data: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              date: dateString,
              time_slot: selectedTimeSlot,
              message: formData.message
            }
          })
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      setStep(4);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth);
  const startOffset = firstDayOfMonth(currentMonth);

  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const getTimeSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // 1. Try to find slots for the specific date
    const specificSlots = availableSlots.filter(slot => slot.date === dateStr);
    if (specificSlots.length > 0) {
      return specificSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    
    // 2. Fallback to weekly recurring slots (only if they don't have a date override)
    return availableSlots
      .filter(slot => slot.day_of_week === dayOfWeek && !slot.date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBookingModal}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-bg border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-display font-medium tracking-tight">Book A Call</h2>
              <p className="text-[8px] md:text-[9px] text-muted uppercase tracking-widest mt-1">30 MIN • IST TIMEZONE</p>
            </div>
            <button 
              onClick={closeBookingModal}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-fg hover:text-bg transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 p-5 md:p-8">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00]">01. Date</h3>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 hover:bg-fg/5 rounded-full"><ChevronLeft size={16} /></button>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{formatMonth(currentMonth)}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 hover:bg-fg/5 rounded-full"><ChevronRight size={16} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={`${d}-${i}`} className="text-[8px] font-bold text-muted uppercase py-2">{d}</span>
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
                        disabled={!canBook}
                        onClick={() => {
                          const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          setSelectedDate(newDate);
                        }}
                        className={`aspect-square text-[10px] md:text-[11px] font-medium rounded-sm transition-all flex items-center justify-center relative
                          ${canBook ? 'hover:bg-fg hover:text-bg' : 'opacity-10 cursor-not-allowed'}
                          ${isSelected ? 'bg-[#FF4D00] text-white' : ''}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedDate}
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-10 py-3 bg-fg text-bg rounded-sm font-bold uppercase tracking-widest text-[9px] transition-all disabled:opacity-20 active:scale-[0.98]"
                  >
                    Select Time
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-muted hover:text-fg mb-6"><ChevronLeft size={12} /> Back to Calendar</button>
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00]">02. Time</h3>
                  <p className="text-[9px] text-muted mt-1 uppercase tracking-widest">{selectedDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                  {getTimeSlotsForDate(selectedDate!).map(slot => {
                    const isBooked = bookedSlots.includes(slot.start_time);
                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot.start_time)}
                        className={`py-3 px-4 border rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all
                          ${isBooked ? 'opacity-20 cursor-not-allowed line-through' : 'hover:border-fg'}
                          ${selectedTimeSlot === slot.start_time ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'border-border'}`}
                      >
                        {slot.start_time}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedTimeSlot}
                    onClick={() => setStep(3)}
                    className="w-full md:w-auto px-10 py-3 bg-fg text-bg rounded-sm font-bold uppercase tracking-widest text-[9px] transition-all disabled:opacity-20 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-muted hover:text-fg mb-6"><ChevronLeft size={12} /> Back</button>
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00]">03. Your Details</h3>
                  <p className="text-[9px] text-muted mt-1 uppercase tracking-widest">{selectedDate?.toLocaleDateString()} at {selectedTimeSlot} IST</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-4">
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-xs" placeholder="Full Name" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-xs" placeholder="Email Address" />
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-xs" placeholder="Phone Number" />
                    </div>
                    <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors text-xs min-h-[80px] md:min-h-[100px] resize-none" placeholder="Message (Optional)" />
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={loading} className="w-full py-4 bg-[#FF4D00] text-white rounded-sm font-bold uppercase tracking-widest text-[9px] transition-all hover:bg-[#E64200] active:scale-[0.98]">
                      {loading ? 'Processing...' : 'Confirm Strategy Session'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 size={32} /></div>
                <div>
                  <h3 className="text-xl font-display font-medium uppercase tracking-tight">Confirmed</h3>
                  <p className="text-[9px] text-muted uppercase tracking-widest leading-relaxed mt-2">{selectedDate?.toLocaleDateString()} @ {selectedTimeSlot} IST</p>
                </div>
                <button onClick={closeBookingModal} className="px-8 py-3 border border-border rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-fg hover:text-bg transition-all">Close</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  isModalOpen: boolean;
  openBookingModal: () => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBookingModal = () => setIsModalOpen(true);
  const closeBookingModal = () => setIsModalOpen(false);

  return (
    <BookingContext.Provider value={{ isModalOpen, openBookingModal, closeBookingModal }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

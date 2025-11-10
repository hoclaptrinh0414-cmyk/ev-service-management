// src/contexts/ScheduleContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  // Store the booking state when user navigates to products from schedule
  const [bookingState, setBookingState] = useState(null);

  /**
   * Save the current booking state (step, vehicle, center, time, etc.)
   * Call this before navigating to products page
   */
  const saveBookingState = (state) => {
    setBookingState({
      ...state,
      timestamp: Date.now() // To track when it was saved
    });
  };

  /**
   * Restore booking state and clear it
   * Returns the saved state and clears it
   */
  const restoreBookingState = () => {
    const state = bookingState;
    setBookingState(null); // Clear after restoring
    return state;
  };

  /**
   * Clear booking state without restoring
   */
  const clearBookingState = () => {
    setBookingState(null);
  };

  /**
   * Check if there's a saved booking state
   */
  const hasBookingState = () => {
    return bookingState !== null;
  };

  const value = {
    bookingState,
    saveBookingState,
    restoreBookingState,
    clearBookingState,
    hasBookingState
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export default ScheduleContext;

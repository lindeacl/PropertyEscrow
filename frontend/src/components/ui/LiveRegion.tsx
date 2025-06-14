import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearOnUpdate?: boolean;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  clearOnUpdate = true
}) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update the message
      regionRef.current.textContent = message;

      // Clear the message after announcement (optional)
      if (clearOnUpdate) {
        timeoutRef.current = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = '';
          }
        }, 1000);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearOnUpdate]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
};

// Context for managing live announcements
import { createContext, useContext, useState, useCallback } from 'react';

interface LiveAnnouncementContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveAnnouncementContext = createContext<LiveAnnouncementContextType | undefined>(undefined);

export const LiveAnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcement, setAnnouncement] = useState<{message: string; priority: 'polite' | 'assertive'} | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({ message, priority });
    
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncement(null);
    }, 1000);
  }, []);

  return (
    <LiveAnnouncementContext.Provider value={{ announce }}>
      {children}
      {announcement && (
        <LiveRegion 
          message={announcement.message} 
          priority={announcement.priority}
          clearOnUpdate={true}
        />
      )}
    </LiveAnnouncementContext.Provider>
  );
};

export const useLiveAnnouncement = () => {
  const context = useContext(LiveAnnouncementContext);
  if (context === undefined) {
    throw new Error('useLiveAnnouncement must be used within a LiveAnnouncementProvider');
  }
  return context;
};
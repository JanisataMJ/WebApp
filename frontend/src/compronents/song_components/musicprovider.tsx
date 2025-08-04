import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';

interface MusicContextProps {
  isPlaying: boolean;
  toggleMusic: () => void;
  nextSong: () => void;
  prevSong: () => void;
  currentSong: string;
}

const MusicContext = createContext<MusicContextProps | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

const playlist = [
  '/AAA.mp3',
  '/Die With A Smile.mp3',
  '/bread.mp3',
];

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    return localStorage.getItem('isPlaying') === 'true';
  });
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(() => {
    return parseInt(localStorage.getItem('currentSongIndex') || '0', 10);
  });
  const [currentSong, setCurrentSong] = useState<string>(playlist[currentSongIndex]);

  const audioRef = useRef<HTMLAudioElement | null>(new Audio(currentSong));

  const toggleMusic = () => {
    setIsPlaying((prev) => {
      localStorage.setItem('isPlaying', (!prev).toString());
      return !prev;
    });
  };

  const nextSong = () => {
    setCurrentSongIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % playlist.length;
      localStorage.setItem('currentSongIndex', nextIndex.toString());
      setCurrentSong(playlist[nextIndex]);
      return nextIndex;
    });
  };

  const prevSong = () => {
    setCurrentSongIndex((prevIndex) => {
      const prevIndexUpdated = prevIndex === 0 ? playlist.length - 1 : prevIndex - 1;
      localStorage.setItem('currentSongIndex', prevIndexUpdated.toString());
      setCurrentSong(playlist[prevIndexUpdated]);
      return prevIndexUpdated;
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;

    audio.src = currentSong;
    audio.volume = 0.1;
    audio.onerror = () => {
      console.error('Error loading audio:', currentSong);
    };

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [currentSong, isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, nextSong, prevSong, currentSong }}>
      {children}
    </MusicContext.Provider>
  );
};

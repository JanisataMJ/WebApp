import React, { useEffect, useState } from 'react';
import { useMusic } from './musicprovider';
import SLoader from '../Book_components/simpleLoader';
import './MusicPlayer.css'; // Import the CSS file

const MusicPlayer: React.FC = () => {
  const { isPlaying, toggleMusic, nextSong, prevSong, currentSong } = useMusic();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const loaderTimer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1000); // Show loader for 1 second

  //   return () => clearTimeout(loaderTimer); // Cleanup the timer on unmount
  // }, []);

  // if (isLoading) {
  //   return <SLoader />; // Show SLoader during the loading period
  // }

  return (
    <div className="music-player">
      <h3 className="song-title">Now Playing: {currentSong}</h3>
      <div className="controls">
        <button className="control-btn prev-btn" onClick={prevSong}>⏮️</button>
        <button className="control-btn play-pause-btn" onClick={toggleMusic}>
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button className="control-btn next-btn" onClick={nextSong}>⏭️</button>
      </div>
    </div>
  );
};

export default MusicPlayer;

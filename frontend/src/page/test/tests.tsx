import React, { useState, useEffect } from 'react';
import Headers from '../../compronents/Pubblic_components/headerselect';
import MusicPlayer from '../../compronents/song_components/musicBase';
import { MusicProvider } from '../../compronents/song_components/musicprovider';
import SLoader from '../../compronents/Book_components/simpleLoader';
import './setting.css';

const Test: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loaderTimer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Show loader for 1 second

        return () => clearTimeout(loaderTimer); // Cleanup the timer on unmount
    }, []);

    if (isLoading) {
        return <SLoader />; // Show SLoader during the loading period
    }

    return (
        <MusicProvider>
            <Headers />
            <div className="content-container fade-in">
                <div className="getar transition-scale">
                    <MusicPlayer />
                </div>
            </div>
        </MusicProvider>
    );
};

export default Test;

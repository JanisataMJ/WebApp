import React from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import Headers from '../../compronents/Pubblic_components/headerselect';
import './L_Content.css';
import Button_s from '../../compronents/Book_components/return_button';
import Cblock from '../../compronents/Book_components/contentblock';
import { MusicProvider } from '../../compronents/song_components/musicprovider';

const L_Content: React.FC = () => {
  const { novelId } = useParams(); // Get the novelId from the route

  return (
    <MusicProvider>
      <Headers />
      <div className='top-box'>
        <a href='/bookshelf'> <Button_s /> </a>
      </div>
      {/* Pass novelId to Cblock */}
      <Cblock novelId={novelId as string} />
    </MusicProvider>
  );
}

export default L_Content;

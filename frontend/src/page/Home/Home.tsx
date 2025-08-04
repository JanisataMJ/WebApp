import React, { useEffect, useState } from 'react';
import { MusicProvider } from '../../compronents/song_components/musicprovider';
import './Home.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import 'bootstrap/dist/css/bootstrap.min.css';
import Slider from '../../compronents/Home_components/slideshow';
import Calendar from '../../page/calendar/calendar';
import Notification from '../../compronents/Home_components/Notifiation/notice';
import CardList2 from '../../compronents/Home_components/GroupCategory/action';
import CategoryNav from '../../compronents/Home_components/CategoryNav';
import Trand from '../../compronents/Home_components/GroupCategory/Trand';
import SLoader from '../../compronents/Book_components/simpleLoader';

const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate data fetching
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for 1 second
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <SLoader />; // Show the loader while loading data
  }

  return (
    <MusicProvider>
      <Headers />
      <a id='cat1' className='hide'>1</a>
      <CategoryNav />
      <div className='l1'>
        <div className='l11'>
          <Slider />
        </div>

        <a id='cat2' className='hide'>2</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>โรแมนติก</h2>
          </div>
          <Calendar />
        </div>

        <a id='cat3' className='hide'>3</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>แอ็คชั่น</h2>
          </div>
          <CardList2 />
        </div>

          <Notification />
      </div>
    </MusicProvider>
  );
};

export default Home;

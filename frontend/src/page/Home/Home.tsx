import React, { useEffect, useState } from 'react';
import './Home.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import 'bootstrap/dist/css/bootstrap.min.css';
import Slider from '../../compronents/Home_components/slideshow';
import Notification from '../../compronents/Home_components/Notifiation/notice';
import DairyHeartRate from '../../compronents/Home_components/GroupGraph/heartrate';
import DairyCalorie from '../../compronents/Home_components/GroupGraph/calorie';
import DairySpo2 from '../../compronents/Home_components/GroupGraph/spo2';
import DairySteps from '../../compronents/Home_components/GroupGraph/steps';
import DairySleep from '../../compronents/Home_components/GroupGraph/sleep';
import SLoader from '../../compronents/Loading_components/simpleLoader';

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
    <>
      <Headers />
      <a id='cat1' className='hide'>1</a>
      {/*<Navbar />*/}
      <div className='l1'>
        <div className='l11'>
          <Slider />
        </div>

        <a id='chart1' className='hide'>5</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>Heartrate</h2>
          </div>
          <DairyHeartRate />
        </div>

        <a id='chart2' className='hide'>6</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>Calorie</h2>
          </div>
          <DairyCalorie />
        </div>

        <a id='chart3' className='hide'>7</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>Steps</h2>
          </div>
          <DairySteps />
        </div>

        <a id='chart4' className='hide'>8</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>SPO2</h2>
          </div>
          <DairySpo2 />
        </div>

        <a id='chart5' className='hide'>9</a>
        <div className='l1_2'>
          <div className='headder'>
            <h2>Sleep</h2>
          </div>
          <DairySleep />
        </div>

          <Notification />
      </div>
    </>
  );
};

export default Home;

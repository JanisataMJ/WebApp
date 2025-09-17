/*import React, { useEffect, useState } from 'react';
import { GetPublicNovels } from '../../../services/https/Novel/novel';
import CardT from '../cardTrand';
import { IGroupCard } from '../../../interface/home_interface/IGroupCard';

const Trand: React.FC = () => {
  const [novels, setNovels] = useState<IGroupCard[]>([]);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetPublicNovels();
        
        // Sort novels by buy_amount in descending order and select the top 5
        const topNovels = response.data.novels
          .filter((novel: IGroupCard) => novel.novel_visibility === true) // เช็คว่า novel_visibility === true
          .sort((a: IGroupCard, b: IGroupCard) => b.buy_amount - a.buy_amount)
          .slice(0, 5);
        
        setNovels(topNovels);
      } catch (error) {
        console.error('Error fetching novels:', error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className='l1_1_2'>
    <h2 id='Treding'>
      ยอดฮิต
      <img width="20px" style={{ transform: 'translate(0, -5px)' }} src="/src/assets/star.png" alt="star" />
    </h2>
    <div className='l1_1_2_1'>
       <div className='card-list'>
       {novels.map((novel, index) => (
          <CardT key={novel.ID} novel={novel} index={index} />
      ))}
        </div>
    </div>
    </div> 
  );
};

export default Trand;*/


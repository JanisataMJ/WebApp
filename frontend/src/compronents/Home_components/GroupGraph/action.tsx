import React, { useEffect, useState } from 'react';
import Card from '../crad';
import { GetPublicNovels } from '../../../services/https/Novel/novel';
import { IGroupCard } from '../../../interface/home_interface/IGroupCard';
import SLoader from '../../Book_components/simpleLoader';


const CardList2: React.FC = () => {
  const [novels, setNovels] = useState<IGroupCard[]>([]);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetPublicNovels();
        
        // Filter novels where novel_type1 or novel_type2 is 'โรแมนติก'
        const romanticNovels = response.data.novels.filter(
          (novel: IGroupCard) =>
            (novel.novel_type1 === 'แอ็คชั่น' || novel.novel_type2 === 'แอ็คชั่น') &&
            novel.novel_visibility === true // เช็คว่า visibility = true (เผยแพร่ได้)
        );
        
        setNovels(romanticNovels);
      } catch (error) {
        console.error('Error fetching novels:', error);
      }
    };
 
    fetchData();
  }, [userId]);

  return (
    <div className='card-list'>
      {novels.map((novel, index) => (
        <Card key={index} novel={novel} />
      ))}
    </div>
  );
};


export default CardList2;

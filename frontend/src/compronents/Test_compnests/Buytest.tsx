import React, { useEffect, useState } from 'react';
import Card from '../Home_components/crad';
import { GetPublicNovels } from '../../services/https/Novel/novel';

export interface Novel {
  ID: number;
  novel_name: string;
  content: string;
  description: string;
  novel_type1: string;
  novel_type2: string;
  rate: string;
  writername: string;
  cover: string;
  novel_price: number;
  novel_like: number;
  buy_amount: number;
  writer_id: string;
  Writer: {
    user_name: string;
    email: string;
  };
}

const YourComponent: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetPublicNovels();
        
        // Filter novels where novel_type1 or novel_type2 is 'โรแมนติก'
        const romanticNovels = response.data.novels.filter(
          (novel: Novel) =>
            novel.novel_type1 === 'โรแมนติก' || novel.novel_type2 === 'โรแมนติก'
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

export default YourComponent;

import React, { useState, useEffect } from 'react';
import './cardlist.css';
import NCardv2 from './Novelbasev2';
import { GetListofnovelID, GetNovelById } from '../../services/https/Bookshelf/bookshelf';
import { NCardPropsv } from '../../interface/bookey_interface/bookshelfs';

const BookshelfID = '1'; // Replace with dynamic ID if needed
const userId = localStorage.getItem("id");
const NCardList2: React.FC = () => {
  const [novels, setNovels] = useState<NCardPropsv[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNovels() {
      try {
        const novelIDs: number[] = await GetListofnovelID(userId);
        console.log('Fetched novel IDs:', novelIDs);

        const fetchedNovels: NCardPropsv[] = [];

        for (const id of novelIDs) {
          const novelDetail = await GetNovelById(id);
          console.log('Fetched novel detail:', novelDetail);

          // Ensure novelDetail contains 'id'
          if (!novelDetail.id) {
            novelDetail.id = id; // Fallback if id is missing in the response
          }

          fetchedNovels.push(novelDetail);
        }

        console.log('Fetched novel details:', fetchedNovels);
        setNovels(fetchedNovels);
      } catch (error) {
        console.error("Error fetching novels", error);
        setError('An error occurred while fetching novels.');
      } finally {
        setLoading(false);
      }
    }

    fetchNovels();
  }, []);

  return (
    <div className='card-list-b'>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : novels.length > 0 ? (
        novels.map((novel) => (
          <NCardv2 key={novel.id} ncardv={novel} />
        ))
      ) : (
        <p>No novels found</p>
      )}
    </div>
  );
};

export default NCardList2;

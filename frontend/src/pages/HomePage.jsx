import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVideos, getCategories } from '../api/videos';
import VideoCard from '../components/VideoCard/VideoCard';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // getVideos / getCategories уже возвращают массивы (unwrapList внутри)
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos', search, category],
    queryFn: () => getVideos({ search, category }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  return (
    <div>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="\u041f\u043e\u0438\u0441\u043a \u0432\u0438\u0434\u0435\u043e..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : (
        <div className={styles.grid}>
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
          {videos.length === 0 && (
            <p className={styles.empty}>Видео не найдено</p>
          )}
        </div>
      )}
    </div>
  );
}

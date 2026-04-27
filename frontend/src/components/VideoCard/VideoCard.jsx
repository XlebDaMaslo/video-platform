import { Link } from 'react-router-dom';
import styles from './VideoCard.module.css';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function VideoCard({ video }) {
  return (
    <Link to={`/video/${video.id}`} className={styles.card}>
      <div className={styles.thumbnail}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} />
        ) : (
          <div className={styles.placeholder}>▶</div>
        )}
        {video.duration > 0 && (
          <span className={styles.duration}>{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{video.title}</h3>
        <p className={styles.meta}>
          {video.owner.username} · {video.views_count} просмотров
        </p>
      </div>
    </Link>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStreams } from '../api/streams';
import { useAuth } from '../hooks/useAuth';

export default function StreamsPage() {
  // DRF возвращает { count, results: [] } — берём results
  const [streams, setStreams] = useState([]);
  const [liveOnly, setLiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setLoading(true);
    getStreams(liveOnly)
      .then((res) => {
        // Поддерживаем оба формата: пагинация { results } и чистый массив
        const data = res.data;
        setStreams(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [liveOnly]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Трансляции</h1>
        <div style={styles.actions}>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={(e) => setLiveOnly(e.target.checked)}
            />
            &nbsp;Только активные
          </label>
          {isAuthenticated && (
            <Link to="/streams/create" style={styles.createBtn}>
              + Новая трансляция
            </Link>
          )}
        </div>
      </div>

      {loading && (
        <div style={styles.skeleton}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      )}

      {!loading && streams.length === 0 && (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>📡</span>
          <p>Пока нет трансляций</p>
          {isAuthenticated && (
            <Link to="/streams/create" style={styles.createBtn}>
              Создать первую
            </Link>
          )}
        </div>
      )}

      {!loading && streams.length > 0 && (
        <div style={styles.grid}>
          {streams.map((s) => (
            <Link key={s.id} to={`/streams/${s.id}`} style={styles.card}>
              <div style={styles.cardHeader}>
                {s.is_live ? (
                  <span style={styles.livePill}>🔴 LIVE</span>
                ) : (
                  <span style={styles.offlinePill}>⚫ Офлайн</span>
                )}
              </div>
              <h3 style={styles.cardTitle}>{s.title}</h3>
              <p style={styles.cardMeta}>{s.owner_username}</p>
              {s.description && (
                <p style={styles.cardDesc}>
                  {s.description.slice(0, 80)}
                  {s.description.length > 80 ? '…' : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 700 },
  actions: { display: 'flex', alignItems: 'center', gap: 16 },
  toggle: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14 },
  createBtn: {
    textDecoration: 'none',
    background: '#2563eb', color: '#fff',
    padding: '8px 16px', borderRadius: 6,
    fontSize: 14, fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  skeleton: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  skeletonCard: {
    height: 140, borderRadius: 8,
    background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
    padding: '64px 0', color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  card: {
    textDecoration: 'none', color: 'inherit',
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '16px',
    transition: 'box-shadow 0.2s',
    display: 'block',
  },
  cardHeader: { marginBottom: 8 },
  livePill: {
    background: '#fef2f2', color: '#dc2626',
    padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
  },
  offlinePill: {
    background: '#f3f4f6', color: '#6b7280',
    padding: '2px 8px', borderRadius: 4, fontSize: 12,
  },
  cardTitle: { margin: '0 0 4px', fontSize: 16, fontWeight: 600 },
  cardMeta: { margin: '0 0 8px', color: '#6b7280', fontSize: 13 },
  cardDesc: { margin: 0, fontSize: 13, color: '#4b5563' },
};

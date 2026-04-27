import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StreamPlayer from '../components/StreamPlayer/StreamPlayer';
import { getStream, deleteStream } from '../api/streams';
import { useAuth } from '../hooks/useAuth';

export default function StreamWatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStream(id)
      .then((res) => setStream(res.data))
      .catch(() => navigate('/streams'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Удалить трансляцию?')) return;
    await deleteStream(id);
    navigate('/streams');
  };

  if (loading) return <p style={{ padding: 24 }}>Загрузка...</p>;
  if (!stream) return null;

  const isOwner = user?.id === stream.owner;

  return (
    <div style={styles.page}>
      <div style={styles.playerWrap}>
        <StreamPlayer streamKey={stream.stream_key} isLive={stream.is_live} />
      </div>

      <div style={styles.info}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{stream.title}</h1>
          {stream.is_live && <span style={styles.liveBadge}>🔴 LIVE</span>}
        </div>
        <p style={styles.meta}>Стример: <strong>{stream.owner_username}</strong></p>
        {stream.description && <p style={styles.desc}>{stream.description}</p>}

        {isOwner && (
          <div style={styles.ownerBox}>
            <h3 style={styles.ownerTitle}>Настройки трансляции</h3>
            <p style={styles.ownerMeta}>RTMP-адрес для OBS:</p>
            <code style={styles.code}>rtmp://localhost/live</code>
            <p style={styles.ownerMeta}>Ключ стрима (вставить в OBS):</p>
            <code style={styles.code}>{stream.stream_key}</code>
            <p style={styles.ownerHint}>
              В OBS: Настройки → Вещание → Пользовательский RTMP сервер,
              вставить адрес и ключ выше.
            </p>
            <button onClick={handleDelete} style={styles.deleteBtn}>
              Удалить трансляцию
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  playerWrap: { marginBottom: 24 },
  info: { background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { margin: 0, fontSize: 22, fontWeight: 700 },
  liveBadge: { background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700 },
  meta: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  desc: { color: '#374151', fontSize: 15, marginBottom: 16 },
  ownerBox: { marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 20 },
  ownerTitle: { fontWeight: 600, marginBottom: 12, fontSize: 16 },
  ownerMeta: { color: '#6b7280', fontSize: 13, marginBottom: 4 },
  code: {
    display: 'block', background: '#f3f4f6', padding: '8px 12px',
    borderRadius: 6, fontFamily: 'monospace', fontSize: 13,
    marginBottom: 12, wordBreak: 'break-all',
  },
  ownerHint: { color: '#6b7280', fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  deleteBtn: {
    background: '#dc2626', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
  },
};

import { useEffect, useRef, useState } from 'react';

// hls.js подключается через CDN (см. index.html) или npm
// Здесь используем динамический import чтобы не ломать SSR
export default function StreamPlayer({ streamKey, isLive }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const hlsUrl = `http://localhost:8080/hls/${streamKey}.m3u8`;

  useEffect(() => {
    if (!streamKey || !isLive) return;

    setLoading(true);
    setError(null);

    const video = videoRef.current;
    if (!video) return;

    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });

        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('Ошибка загрузки потока. Стрим может быть не активен.');
            setLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari — нативная поддержка HLS
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().catch(() => {});
        });
      } else {
        setError('Ваш браузер не поддерживает воспроизведение HLS.');
        setLoading(false);
      }
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamKey, isLive, hlsUrl]);

  if (!isLive) {
    return (
      <div style={styles.offline}>
        <span style={styles.offlineDot}>⚫</span>
        <p>Трансляция не активна</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {loading && (
        <div style={styles.overlay}>
          <div style={styles.spinner} />
          <p>Подключение к трансляции...</p>
        </div>
      )}
      {error && (
        <div style={styles.overlay}>
          <p style={{ color: '#ff6b6b' }}>{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        muted
        playsInline
        style={styles.video}
      />
      <div style={styles.liveBadge}>🔴 LIVE</div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  video: { width: '100%', display: 'block' },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    zIndex: 10,
  },
  spinner: {
    width: 40, height: 40,
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: 12,
  },
  liveBadge: {
    position: 'absolute',
    top: 12, left: 12,
    background: '#e53935',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
  },
  offline: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#1a1a1a',
    color: '#888',
    borderRadius: 8,
    gap: 8,
  },
  offlineDot: { fontSize: 32 },
};

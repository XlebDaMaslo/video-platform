import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import { getVideo, getStreamUrl, getComments, postComment } from '../api/videos';
import { useAuth } from '../hooks/useAuth';
import styles from './VideoPage.module.css';

export default function VideoPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // getVideo / getComments уже возвращают данные напрямую — без .then(r => r.data)
  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideo(id),
    enabled: Boolean(id),
  });

  const { data: streamData } = useQuery({
    queryKey: ['stream', id],
    queryFn: () => getStreamUrl(id),
    enabled: Boolean(id) && Boolean(video),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id),
    enabled: Boolean(id),
  });

  const addComment = useMutation({
    mutationFn: (text) => postComment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentText('');
    },
  });

  if (!id)       return <p>Неверный идентификатор видео</p>;
  if (isLoading) return <p className={styles.loading}>Загрузка...</p>;
  if (!video)    return <p>Видео не найдено</p>;

  return (
    <div className={styles.page}>
      <div className={styles.player}>
        <ReactPlayer
          url={streamData?.stream_url || video.file}
          controls
          width="100%"
          height="100%"
        />
      </div>

      <h1 className={styles.title}>{video.title}</h1>
      <p className={styles.meta}>
        {video.owner?.username} · {video.views_count} просмотров ·{' '}
        {new Date(video.created_at).toLocaleDateString('ru-RU')}
      </p>
      {video.description && <p className={styles.desc}>{video.description}</p>}

      <section className={styles.comments}>
        <h2>Комментарии ({comments.length})</h2>

        {isAuthenticated && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) addComment.mutate(commentText);
            }}
            className={styles.commentForm}
          >
            <textarea
              rows={3}
              placeholder="Ваш комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className={styles.btn}>Отправить</button>
          </form>
        )}

        <div className={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              <strong>{c.author?.username}</strong>
              <p>{c.text}</p>
              <span className={styles.commentDate}>
                {new Date(c.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

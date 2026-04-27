import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, logout, accessToken } = useAuth();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    // Запрос только если пользователь аутентифицирован И токен есть в localStorage
    enabled: isAuthenticated && Boolean(accessToken),
    queryFn: () => getProfile().then((r) => r.data),
    retry: false,
    // При 401 не получится перенаправление — интерсептор уже обрабатывает refresh
  });

  const { register, handleSubmit } = useForm();

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      if (data.bio) fd.append('bio', data.bio);
      if (data.avatar?.[0]) fd.append('avatar', data.avatar[0]);
      return updateProfile(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
    onError: (err) => {
      if (err?.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
      }
    },
  });

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoading) return <div className={styles.page}><p>Загрузка...</p></div>;
  if (isError)  return <div className={styles.page}><p>Ошибка загрузки профиля</p></div>;

  return (
    <div className={styles.page}>
      <h1>Профиль</h1>
      {profile && (
        <div className={styles.info}>
          {profile.avatar && <img src={profile.avatar} alt="avatar" className={styles.avatar} />}
          <p><strong>{profile.username}</strong></p>
          <p className={styles.email}>{profile.email}</p>
          {profile.bio && <p>{profile.bio}</p>}
        </div>
      )}
      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className={styles.editForm}>
        <h2>Редактировать</h2>
        <label>О себе
          <textarea rows={3} {...register('bio')} defaultValue={profile?.bio} />
        </label>
        <label>Аватар
          <input type="file" accept="image/*" {...register('avatar')} />
        </label>
        <button type="submit" className={styles.btn}>Сохранить</button>
      </form>
      <button
        className={styles.logoutBtn}
        onClick={() => { logout(); navigate('/login', { replace: true }); }}
      >
        Выйти
      </button>
    </div>
  );
}

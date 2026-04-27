import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { uploadVideo, getCategories } from '../api/videos';
import styles from './UploadPage.module.css';

export default function UploadPage() {
  const { register, handleSubmit, formState: { isSubmitting, errors }, setError } = useForm();
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('file', data.file[0]);
    if (data.thumbnail?.[0]) formData.append('thumbnail', data.thumbnail[0]);
    if (data.category)       formData.append('category', data.category);
    try {
      const res = await uploadVideo(formData);
      navigate(`/video/${res.data.id}`);
    } catch {
      setError('root', { message: 'Ошибка загрузки. Проверьте размер файла.' });
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Загрузить видео</h1>
        {errors.root && <p className={styles.error}>{errors.root.message}</p>}

        <label>Название *
          <input {...register('title', { required: true })} placeholder="Введите название" />
          {errors.title && <span className={styles.fieldError}>Обязательное поле</span>}
        </label>

        <label>Описание
          <textarea rows={4} {...register('description')} placeholder="Описание видео..." />
        </label>

        <label>Видеофайл *
          <input type="file" accept="video/*" {...register('file', { required: true })} />
          {errors.file && <span className={styles.fieldError}>Выберите файл</span>}
        </label>

        <label>Обложка
          <input type="file" accept="image/*" {...register('thumbnail')} />
        </label>

        <label>Категория
          <select {...register('category')}>
            <option value="">Без категории</option>
            {Array.isArray(categories) && categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting} className={styles.btn}>
          {isSubmitting ? 'Загружаем...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}

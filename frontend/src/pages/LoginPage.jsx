import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/', { replace: true });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Неверный email или пароль';
      setError('root', { message: detail });
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Вход</h1>
        {errors.root && <p className={styles.error}>{errors.root.message}</p>}
        <label>Email
          <input type="email" autoComplete="email" {...register('email', { required: 'Введите email' })} />
        </label>
        <label>Пароль
          <input type="password" autoComplete="current-password" {...register('password', { required: 'Введите пароль' })} />
        </label>
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}
        <button type="submit" disabled={isSubmitting} className={styles.btn}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
        <p className={styles.link}>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
      </form>
    </div>
  );
}

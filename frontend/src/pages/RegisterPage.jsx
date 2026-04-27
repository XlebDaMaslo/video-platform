import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data;
      if (!detail) {
        setError('root', { message: 'Ошибка сети. Попробуйте позже.' });
        return;
      }
      // Map Django field errors to form fields
      const fieldMap = { username: 'username', email: 'email', password: 'password', password2: 'password2' };
      let hasFieldError = false;
      Object.entries(fieldMap).forEach(([field, formField]) => {
        if (detail[field]) {
          setError(formField, { message: Array.isArray(detail[field]) ? detail[field][0] : detail[field] });
          hasFieldError = true;
        }
      });
      if (!hasFieldError) {
        const msg = detail.detail || detail.non_field_errors?.[0] || 'Ошибка регистрации';
        setError('root', { message: msg });
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Регистрация</h1>
        {errors.root && <p className={styles.error}>{errors.root.message}</p>}

        <label>Имя пользователя
          <input {...register('username', { required: 'Обязательное поле' })} />
          {errors.username && <span className={styles.fieldError}>{errors.username.message}</span>}
        </label>

        <label>Email
          <input type="email" {...register('email', { required: 'Обязательное поле' })} />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </label>

        <label>Пароль
          <input
            type="password"
            {...register('password', {
              required: 'Обязательное поле',
              minLength: { value: 8, message: 'Минимум 8 символов' },
            })}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <label>Повторите пароль
          <input
            type="password"
            {...register('password2', {
              required: 'Обязательное поле',
              validate: (val) => val === watch('password') || 'Пароли не совпадают',
            })}
          />
          {errors.password2 && <span className={styles.fieldError}>{errors.password2.message}</span>}
        </label>

        <button type="submit" disabled={isSubmitting} className={styles.btn}>
          {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
        <p className={styles.link}>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </div>
  );
}

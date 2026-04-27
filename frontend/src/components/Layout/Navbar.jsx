import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        🎦 VideoPlatform
      </Link>
      <div className={styles.links}>
        <Link to="/streams">📡 Трансляции</Link>
        {isAuthenticated ? (
          <>
            <Link to="/upload">Загрузить</Link>
            <Link to="/profile">Профиль</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register" className={styles.registerBtn}>Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}

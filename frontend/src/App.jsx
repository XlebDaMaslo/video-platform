import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import StreamsPage from './pages/StreamsPage';
import StreamWatchPage from './pages/StreamWatchPage';
import StreamCreatePage from './pages/StreamCreatePage';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="video/:id" element={<VideoPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Streams */}
        <Route path="streams" element={<StreamsPage />} />
        <Route path="streams/:id" element={<StreamWatchPage />} />
        <Route
          path="streams/create"
          element={
            <PrivateRoute>
              <StreamCreatePage />
            </PrivateRoute>
          }
        />

        <Route
          path="upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

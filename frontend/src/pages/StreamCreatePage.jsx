import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStream } from '../api/streams';

export default function StreamCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Введите название'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await createStream(form);
      navigate(`/streams/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка создания трансляции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Новая трансляция</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Название
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Название вашей трансляции"
            style={styles.input}
            maxLength={255}
          />
        </label>
        <label style={styles.label}>
          Описание
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Необязательно"
            rows={4}
            style={{ ...styles.input, resize: 'vertical' }}
          />
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Создание...' : 'Создать трансляцию'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '48px auto', padding: '0 16px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 },
  input: {
    padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: 6, fontSize: 15, outline: 'none',
  },
  error: { color: '#dc2626', fontSize: 14 },
  btn: {
    background: '#2563eb', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 6,
    fontSize: 15, cursor: 'pointer', fontWeight: 600,
  },
};

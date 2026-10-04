import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.details ? Object.values(d.details).flat()[0] : d?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-indigo-400">Create account</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input className="input" placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={set('password')} required />
        <button className="btn w-full">Register</button>
        <p className="text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-indigo-400">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

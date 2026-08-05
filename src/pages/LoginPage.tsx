import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMasterData } from '../hooks/useMasterData';
import { Zap, Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, isLoading } = useMasterData();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
      setError('Silakan pilih nama Anda terlebih dahulu.');
      return;
    }

    const success = login(user, pin);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('PIN salah. Silakan coba lagi. (Default PIN: 123456)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <Zap className="w-8 h-8 fill-current" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Enterprise Pricing
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Silakan login menggunakan akun Sales/Admin Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama Pengguna
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="user"
                  className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white h-11"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="" disabled>-- Pilih Nama Anda --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} {u.role ? `(${u.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                PIN Keamanan
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  required
                  className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white h-11"
                  placeholder="Masukkan 6 digit PIN (Default: 123456)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Memuat Data...' : 'Masuk ke Aplikasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/apiService';

function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Falha no login. Verifique seu usuário e senha.');
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiService.registerUser(username, password);
      setMessage('Usuário registrado com sucesso! Você já pode fazer o login.');
    } catch (err) {
      setError('Erro ao registrar. O usuário pode já existir.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-6xl font-bold text-brand-primary mb-10">Tales of Jianghu</h1>
      <div className="w-full max-w-md p-8 bg-gray-50 rounded-2xl shadow-lg border">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-lg font-semibold text-brand-text mb-2 block">Usuário</label>
            <input 
              id="username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-lg focus:outline-none focus:border-purple-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password"className="text-lg font-semibold text-brand-text mb-2 block">Senha</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-lg focus:outline-none focus:border-purple-400"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="flex-1 bg-brand-primary hover:brightness-105 text-brand-text font-bold py-3 px-6 rounded-lg text-lg transition-all">
              Login
            </button>
            <button type="button" onClick={handleRegister} className="flex-1 bg-gray-200 hover:bg-gray-300 text-brand-text font-bold py-3 px-6 rounded-lg text-lg transition-all">
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
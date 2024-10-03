import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [iin, setIIN] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Отправка данных на сервер для авторизации
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Если авторизация успешна, сохраняем токен в localStorage
        localStorage.setItem('token', data.token);

        // Перенаправляем пользователя на страницу личного кабинета
        window.location.href = '/dashboard';
      } else {
        // Если авторизация неуспешна, показываем сообщение об ошибке
        alert(data.message);
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white border rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-left font-medium text-gray-700">ИИН</label>
            <input
              type="text"
              value={iin}
              onChange={(e) => setIIN(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-left font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Войти
          </button>
        </form>
        <p className="text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Зарегистрируйтесь
          </Link>
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

export default function Register() {
  const [iin, setIIN] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      // Отправка данных на сервер для регистрации
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Регистрация прошла успешно! Пожалуйста, войдите в систему.');
        window.location.href = '/login'; // Перенаправление на страницу входа
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white border rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Регистрация</h2>
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
          <div>
            <label className="block mb-1 text-left font-medium text-gray-700">Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
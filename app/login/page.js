"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';
import { makeAuthenticatedRequest } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [iin, setIIN] = useState('');
  const [password, setPassword] = useState('');
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://aiu-science-server.vercel.app';
  // const url = 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await makeAuthenticatedRequest(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin, password }),
      }, router);

      if (!response) {
        throw new Error('Ответ от сервера отсутствует.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${errorData.message || 'Невозможно выполнить запрос'}`);
      }

      const data = await response.json();

      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const decodedToken = jwtDecode(data.accessToken);
        const userRole = decodedToken.role;

        if (userRole === 'admin') {
          router.push('/home-admin');
        } else {
          router.push('/home-user');
        }
      } else {
        throw new Error('Токены не были получены');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      alert(error.message || 'Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border border-blue-300 rounded-lg p-8 w-[800px]">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-1 justify-center items-center mb-8 md:mb-0">
            <img src="/logo.png" alt="Science AIU Logo" className="mx-auto mb-6 w-40" />
          </div>
          <div className="flex-1 border-l border-blue-300 pl-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Вход в систему</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Логин</label>
                <input
                  type="text"
                  value={iin}
                  onChange={(e) => setIIN(e.target.value)}
                  required
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Войти
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-blue-400">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-blue-500 hover:underline">
                Зарегистрируйтесь здесь
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-6 text-center text-blue-600">
          <Link className="text-sm hover:underline" href="https://www.aiu.edu.kz/ru">
            Сайт AIU
          </Link>{' '}
          |{' '}
          <Link className="text-sm hover:underline" href="/">
            {/* Система "Univer" */}
          </Link>{' '}
          {/* |{' '} */}
          <Link className="text-sm hover:underline" href="/">
            Инструкция по работе с системой
          </Link>
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">&copy; AIU Science</p>
      </div>
    </div>
  );
}
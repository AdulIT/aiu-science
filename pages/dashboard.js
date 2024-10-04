import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу входа
      router.push('/login');
    } else {
      // Если токен найден, заканчиваем загрузку и показываем контент дашборда
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Добро пожаловать в Личный КАБИНЕТ!</h1>
        <p className="text-gray-700 mb-6">
          Здесь будет отображаться информация о вашей научной активности, публикациях и многое другое.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="py-2 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
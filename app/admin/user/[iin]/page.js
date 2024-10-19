"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { makeAuthenticatedRequest } from '../../../lib/api';
import Navbar from '../../../../components/Navbar';

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const iin = params.iin; // Получаем ИИН из URL
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // Для переключения вкладок

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `http://localhost:8080/api/admin/user/${iin}`, // Запрашиваем данные пользователя по ИИН
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          router
        );
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Устанавливаем данные пользователя в состоянии
        } else {
          console.error('Ошибка при загрузке профиля пользователя');
          router.push('/admin-users');
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля пользователя:', error);
        router.push('/admin-users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, iin]);

  // Функция для генерации отчета
  const generateReport = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:8080/api/admin/generateUserReport`, // Эндпоинт для генерации отчета
        { 
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ iin }) // Отправляем ИИН пользователя
        },
        router
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${user.fullName}_report.docx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert('Ошибка при генерации отчета.');
      }
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      alert('Произошла ошибка при генерации отчета.');
    }
  };

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  if (!user) {
    return <p>Пользователь не найден</p>;
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Профиль пользователя</h1>
          <div className="flex justify-center mb-6">
            <img
              src={`http://localhost:8080/public${user.profilePhoto || '/default-profile.png'}`}
              alt="User Avatar"
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-4 ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Профиль
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-2 px-4 ${activeTab === 'resume' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Резюме
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`py-2 px-4 ${activeTab === 'publications' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Публикации
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-bold">ИИН:</label>
                <p>{user.iin}</p>
              </div>
              <div>
                <label className="block font-bold">ФИО:</label>
                <p>{user.fullName}</p>
              </div>
              <div>
                <label className="block font-bold">Роль:</label>
                <p>{user.role}</p>
              </div>
              <div>
                <label className="block font-bold">Email:</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="block font-bold">Телефон:</label>
                <p>{user.phone}</p>
              </div>
              <div>
                <label className="block font-bold">Научные интересы:</label>
                <p>{user.researchArea}</p>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div>
              <p>Здесь будет резюме пользователя.</p>
            </div>
          )}

          {activeTab === 'publications' && (
            <div>
              <p>Здесь будут отображены публикации пользователя.</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={generateReport}
              className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Скачать отчет
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
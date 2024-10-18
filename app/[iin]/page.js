"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const iin = params.iin; // Получаем ИИН из URL
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `http://localhost:8080/api/admin/user/:${iin}`, // Запрашиваем данные пользователя по ИИН
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
        </div>
      </div>
    </>
  );
}
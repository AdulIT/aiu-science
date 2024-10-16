"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Ensure this is correctly imported without curly braces
import Navbar from '../../components/Navbar';

export default function UserHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(accessToken);
      if (decodedToken.role !== 'user') {
        router.push('/home-admin');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      router.push('/login');
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div>
      <Navbar role="user" />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Добро пожаловать на главную страницу!</h1>
        <p className="mt-4">Вы можете управлять своими публикациями и резюме через навигацию сверху.</p>
      </div>
    </div>
  );
}
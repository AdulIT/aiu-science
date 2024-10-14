"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetch('http://localhost:8080/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUsers(data.users);
          } else {
            alert(data.message);
            router.push('/login');
          }
        })
        .catch((error) => {
          console.error('Ошибка при загрузке пользователей:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [router]);

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Административная панель</h1>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="w-1/3 px-4 py-2">ИИН</th>
              <th className="w-1/3 px-4 py-2">Роль</th>
              <th className="w-1/3 px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.iin} className="text-center">
                <td className="border px-4 py-2">{user.iin}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">
                  <Link href={`/admin/user/${user.iin}`} className="text-blue-500 hover:underline">
                    Просмотр профиля
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
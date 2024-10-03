import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Если токен не найден, перенаправляем на страницу входа
    } else {
      fetch('/api/protected', {
        headers: {
          Authorization: `Bearer ${token}`, // Отправляем токен в заголовке
        },
      })
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch(() => {
          alert('Ошибка авторизации. Пожалуйста, войдите снова.');
          window.location.href = '/login';
        });
    }
  }, []);

  return (
    <div>
      <h1>Личный кабинет</h1>
      {userData ? (
        <div>Добро пожаловать, {userData.user.iin}</div>
      ) : (
        <div>Загрузка...</div>
      )}
    </div>
  );
}
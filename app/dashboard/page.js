"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '', // Добавлено поле для ФИО
    profilePhoto: '',
    scopusId: '',
    wosId: '',
    orcid: '',
    birthDate: '',
    phone: '',
    email: '',
    researchArea: '',
    higherSchool: '', // Поле для выбора высшей школы
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      router.push('/login');
    } else {
      const fetchUserData = async () => {
        try {
          const response = await makeAuthenticatedRequest('http://localhost:8080/api/user/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }, router);
      
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            setIsLoading(false);
          } else {
            const errorText = await response.text();
            console.error('Ошибка при загрузке данных пользователя:', errorText);
            router.push('/login');
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
          router.push('/login');
        }
      };
  
      fetchUserData();
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('profilePhoto', file);

        const response = await makeAuthenticatedRequest('http://localhost:8080/api/user/uploadPhoto', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }, router);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка при загрузке фотографии: ${errorText}`);
        }

        const data = await response.json();
        setUserData((prev) => ({ ...prev, profilePhoto: data.profilePhoto }));
        alert('Фотография успешно обновлена!');
      } catch (error) {
        console.error('Ошибка при загрузке фотографии:', error);
        alert('Произошла ошибка. Попробуйте позже.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Извлекаем accessToken
      if (!accessToken) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.');
        return;
      }
  
      const response = await makeAuthenticatedRequest('http://localhost:8080/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Используем accessToken для аутентификации
        },
        body: JSON.stringify({
          fullName: userData.fullName, // Добавляем ФИО
          scopusId: userData.scopusId,
          wosId: userData.wosId,
          orcid: userData.orcid,
          birthDate: userData.birthDate,
          phone: userData.phone,
          email: userData.email,
          researchArea: userData.researchArea,
          higherSchool: userData.higherSchool, // Добавляем высшую школу
        }),
      }, router);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при обновлении информации: ${errorText}`);
      }
  
      alert('Информация успешно обновлена!');
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('accessToken');
  //   localStorage.removeItem('refreshToken');
  //   router.push('/login');
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role={'user'} />
      <div className="min-h-screen bg-gray-100 p-8">
        {/* <div className="flex justify-between items-center mb-4">
          <div className="mb-4">
            <Link href="/home-user" className="text-blue-500 hover:underline">
              Главная
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Выйти
          </button>
        </div> */}

        <div className="flex flex-col items-center mb-6">
          <div className="w-300 h-300 mb-4 rounded-full overflow-hidden border-4 border-gray-300">
            <img
              src={`http://localhost:8080${userData.profilePhoto || '/default-profile.png'}`}
              alt="Profile Photo"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Загрузить фотографию
            <input
              type="file"
              onChange={handleProfilePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {['fullName', 'scopusId', 'wosId', 'orcid', 'birthDate', 'phone', 'email', 'researchArea'].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium text-gray-700">
                {field === 'fullName' && 'ФИО'}
                {field === 'scopusId' && 'Scopus Author ID'}
                {field === 'wosId' && 'Web of Science ResearcherID'}
                {field === 'orcid' && 'ORCID'}
                {field === 'birthDate' && 'Дата рождения'}
                {field === 'phone' && 'Телефон'}
                {field === 'email' && 'Email'}
                {field === 'researchArea' && 'Научные интересы'}
              </label>
              {isEditing ? (
                field === 'researchArea' ? (
                  <textarea
                    name={field}
                    value={userData[field]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field === 'birthDate' ? 'date' : 'text'}
                    name={field}
                    value={userData[field]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )
              ) : (
                <p className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  {userData[field] || 'Не указано'}
                </p>
              )}
            </div>
          ))}

          {/* Выбор высшей школы */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Высшая школа</label>
            {isEditing ? (
              <select
                name="higherSchool"
                value={userData.higherSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите школу</option>
                <option value="Школа инженерии">Высшая Школа Инженерии и Информационных Технологии</option>
                <option value="Школа экономики">Высшая Школа Экономики</option>
                <option value="Школа права">Высшая Школа Права</option>
                <option value="Педагогический институт">Педагогический институт</option>
                <option value="Высшая школа искусств и гуманитарных наук">Высшая школа искусств и гуманитарных наук</option>
                <option value="Высшая школа естественных наук">Высшая школа естественных наук</option>
              </select>
            ) : (
              <p className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                {userData.higherSchool || 'Не указано'}
              </p>
            )}
          </div>
        </div>

        {isEditing ? (
          <button
            onClick={handleSave}
            className="mt-6 py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Сохранить изменения
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 py-2 px-4 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Редактировать
          </button>
        )}
      </div>
    </>
  );
}
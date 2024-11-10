"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { makeAuthenticatedRequest } from '../../../lib/api';
import Navbar from '../../../../components/Navbar';

const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
};

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const iin = params.iin;
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const url = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `${url}/api/admin/user/${iin}`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          router
        );
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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

    const fetchUserPublications = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `${url}/api/user/${iin}/publications`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          router
        );

        if (response.ok) {
          const data = await response.json();
          setPublications(data.publications);
        } else {
          console.error('Ошибка при загрузке публикаций');
        }
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error);
      }
    };

    fetchUserProfile();
    fetchUserPublications();
  }, [router, iin]);

  // Функция для генерации отчета
  const generateReport = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${url}/api/admin/generateUserReport`,
        { 
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ iin })
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

  const generateResume = async (format) => {
    try {
      const response = await makeAuthenticatedRequest('${url}/api/user/generateResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin }),
      }, router);
      
      const data = await response.json();
      if (format === 'docx') {
        window.open(`${url}/api/user/downloadResumeDocx?path=${data.docxPath}`);
      } else if (format === 'pdf') {
        window.open(`${url}/api/user/downloadResumePdf?path=${data.pdfPath}`);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
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
              src={`${url}/public${user.profilePhoto || '/default-profile.png'}`}
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
           <>
            <div>
                <p>Здесь будет резюме пользователя.</p>
              </div>
              <div className="mt-6">
              <button
                onClick={() => generateResume('pdf')}
                className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Скачать резюме PDF
              </button>
              <button
                onClick={() => generateResume('docx')}
                className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Скачать резюме Word
              </button>
            </div>
           </>
          )}

          {activeTab === 'publications' && (
            <div>
              {publications.length > 0 ? (
              publications.map((publication, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                  <p><strong>Тип публикации:</strong> {publicationTypeMap[publication.publicationType]}</p>
                  <p><strong>Авторы:</strong> {publication.authors}</p>
                  <p><strong>Название статьи:</strong> {publication.title}</p>
                  <p><strong>Год:</strong> {publication.year}</p>
                  <p><strong>Выходные данные:</strong> {publication.output}</p>
                  {publication.doi && <p><strong>Ссылки, DOI:</strong> {publication.doi}</p>}
                  {publication.isbn && <p><strong>ISBN:</strong> {publication.isbn}</p>}
                  {publication.file && (
                  <p>
                    <strong>Файл:</strong> <a href={`${url}/${publication.file}`} download className="text-blue-600 hover:underline">Скачать файл</a>
                  </p>
                )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">Нет публикаций для отображения.</p>
            )}
              <button
                  onClick={generateReport}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                Скачать отчет
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
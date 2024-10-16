"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';

// Объект для сопоставления типов публикаций с читаемыми названиями
const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
};

export default function Publications() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Шаги формы
  const [selectedType, setSelectedType] = useState(""); // Выбранный тип публикации
  const [newPublication, setNewPublication] = useState({
    authors: '',
    title: '',
    year: '',
    output: '',
    doi: '',
    isbn: '',
    scopus: false,
    wos: false,
    file: null,
    publicationType: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    } else {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin');

      const fetchPublications = async () => {
        try {
          const response = await makeAuthenticatedRequest(
            isAdmin
              ? 'http://localhost:8080/api/admin/publications'
              : 'http://localhost:8080/api/user/publications',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
            router
          );

          if (response.ok) {
            const data = await response.json();
            setPublications(data);
          } else {
            console.error('Ошибка при загрузке публикаций');
            router.push('/login');
          }
        } catch (error) {
          console.error('Ошибка при загрузке публикаций:', error);
          router.push('/login');
        }
        setIsLoading(false);
      };

      fetchPublications();
    }
  }, [router, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPublication((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Файл не должен превышать 5MB.');
      return;
    }
    setNewPublication((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleAddPublication = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Ошибка авторизации. Пожалуйста, войдите снова.');
      return;
    }

    const formData = new FormData();
    Object.keys(newPublication).forEach((key) => {
      if (key === 'file' && newPublication.file) {
        formData.append(key, newPublication.file);
      } else {
        formData.append(key, newPublication[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:8080/api/user/publications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const addedPublication = await response.json();
        setPublications((prev) => [...prev, addedPublication]);
        // Сбрасываем форму и возвращаемся к шагу выбора типа публикации
        setNewPublication({
          authors: '',
          title: '',
          year: '',
          output: '',
          doi: '',
          isbn: '',
          scopus: false,
          wos: false,
          file: null,
          publicationType: '',
        });
        setSelectedType(''); // Сброс выбора типа
        setCurrentStep(1); // Возвращаемся на шаг 1
        setIsAdding(false); // Закрываем форму добавления
      } else {
        console.error('Ошибка при добавлении публикации');
      }
    } catch (error) {
      console.error('Ошибка при добавлении публикации:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const handleNextStep = () => {
    if (selectedType) {
      setNewPublication((prev) => ({ ...prev, publicationType: selectedType }));
      setCurrentStep(2); // Переход на шаг 2
    } else {
      alert('Пожалуйста, выберите тип публикации');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1); // Возврат на шаг 1
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role={isAdmin ? 'admin' : 'user'} />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Публикации</h1>
          {!isAdmin && (
            <button
              onClick={() => setIsAdding(true)}
              className="py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Добавить публикацию
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
            {currentStep === 1 ? (
              <>
                <h2 className="text-xl font-bold mb-4">Выберите тип публикации</h2>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип публикации</option>
                  <option value="scopus_wos">Научные труды (Scopus/Web of Science)</option>
                  <option value="koknvo">КОКНВО</option>
                  <option value="conference">Материалы конференций</option>
                  <option value="articles">Статьи РК и не включенные в Scopus/WoS</option>
                  <option value="books">Монографии, книги и учебные материалы</option>
                  <option value="patents">Патенты, авторское свидетельство</option>
                </select>
                <button
                  onClick={handleNextStep}
                  className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Следующий
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Новая публикация</h2>
                {['authors', 'title', 'year'].map((field) => (
                  <div key={field} className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      {field === 'authors' && 'Авторы'}
                      {field === 'title' && 'Название статьи'}
                      {field === 'year' && 'Год'}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={newPublication[field]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Выходные данные</label>
                  <textarea
                    name="output"
                    value={newPublication.output}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {selectedType === 'scopus_wos' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">Ссылки, DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={newPublication.doi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="block mb-1 font-medium text-gray-700">Scopus</label>
                    <input
                      type="checkbox"
                      name="scopus"
                      checked={newPublication.scopus}
                      onChange={handleInputChange}
                    />
                    <label className="block mb-1 font-medium text-gray-700">WoS</label>
                    <input
                      type="checkbox"
                      name="wos"
                      checked={newPublication.wos}
                      onChange={handleInputChange}
                    />
                  </>
                )}

                {selectedType === 'books' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">ISBN</label>
                    <input
                      type="text"
                      name="isbn"
                      value={newPublication.isbn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}

                <label className="block mb-1 font-medium text-gray-700">Загрузить файл (PDF)</label>
                <input type="file" onChange={handleFileChange} accept=".pdf" className="mb-4" />

                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="py-2 px-4 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleAddPublication}
                    className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Сохранить публикацию
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
                    <strong>Файл:</strong> <a href={`http://localhost:8080/${publication.file}`} download className="text-blue-600 hover:underline">Скачать файл</a>
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">У вас пока нет публикаций.</p>
          )}
        </div>
      </div>
    </>
  );
}
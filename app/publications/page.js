"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';
import ErrorMessage from '../../components/ErrorMessage';


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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
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
  const [errorMessage, setErrorMessage] = useState(""); // Состояние для ошибок

  const url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setErrorMessage("Вы не авторизованы. Пожалуйста, войдите в систему.");
      return;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin');
      localStorage.setItem('iin', decodedToken.iin); // Сохраняем IIN для повторного использования
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
      setErrorMessage("Ошибка авторизации. Проверьте токен.");
      router.push('/login');
    }
  }, [router]);
  
  useEffect(() => {
    const fetchPublications = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }
  
      const iin = localStorage.getItem('iin'); // Берём сохранённый IIN
      const endpoint = isAdmin
        ? `${url}/api/admin/publications`
        : `${url}/api/user/getPublications?iin=${iin}`;
  
      try {
        const response = await makeAuthenticatedRequest(
          endpoint,
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
          if (Array.isArray(data)) {
            setPublications(data);
          } else {
            console.error('Ошибка: данные публикаций не являются массивом', data);
            setErrorMessage("Ошибка загрузки данных. Попробуйте позже.");
            setPublications([]); // Устанавливаем пустой массив
          }
        } else {
          console.error('Ошибка при загрузке публикаций');
          setErrorMessage("Не удалось загрузить публикации. Проверьте авторизацию.");
          router.push('/login');
        }
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error);
        setErrorMessage("Произошла ошибка при загрузке публикаций.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (isAdmin !== null) { // Запускаем fetchPublications только после проверки isAdmin
      fetchPublications();
    }
  }, [isAdmin, router]);

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
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Допустим только формат PDF.');
      return;
    }
    setNewPublication((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleAddPublication = async () => {
    const requiredFields = ['authors', 'title', 'year', 'output', 'publicationType'];
    const missingFields = requiredFields.filter((field) => !newPublication[field]);

    // Проверка обязательных полей
    if (missingFields.length > 0) {
        setErrorMessage(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`);
        return;
    }

    // Дополнительная валидация значений
    if (newPublication.year && !/^\d{4}$/.test(newPublication.year)) {
        setErrorMessage('Год должен быть в формате YYYY.');
        return;
    }

    if (
        newPublication.publicationType &&
        !['scopus_wos', 'koknvo', 'conference', 'articles', 'books', 'patents'].includes(
            newPublication.publicationType
        )
    ) {
        setErrorMessage('Тип публикации имеет недопустимое значение.');
        return;
    }

      // Преобразование authors в массив
    const authorsArray = newPublication.authors
    .split(',')
    .map((author) => author.trim())
    .filter((author) => author.length > 0);

    // Создание нового объекта с обновлённым authors
    const updatedPublication = {
      ...newPublication,
      authors: authorsArray, // заменяем строку на массив
    };

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setErrorMessage("Ошибка авторизации. Пожалуйста, войдите снова.");
      return;
    }

    // const decodedToken = jwtDecode(token);

    const formData = new FormData();
    Object.keys(updatedPublication).forEach((key) => {
      if (key === 'file' && updatedPublication.file) {
        formData.append(key, updatedPublication.file);
      } else if (key === 'authors') {
        // Преобразуем массив authors в строку для отправки
        formData.append(key, JSON.stringify(updatedPublication.authors));
      } else {
        formData.append(key, updatedPublication[key]);
      }
    });

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`)
    })

    try {
        const response = await makeAuthenticatedRequest(`${url}/api/user/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }, router);
        
        // console.log('Данные перед отправкой:', newPublication);

        if (response.ok) {
            const addedPublication = await response.json();
            console.log('Добавленная публикация:', addedPublication);

            // Проверяем, что предыдущее состояние — массив
            setPublications((prev) => {
                if (Array.isArray(prev)) {
                    return [...prev, addedPublication];
                } else {
                    console.error('Ошибка: состояние публикаций не является массивом', prev);
                    return [addedPublication];
                }
            });
// Сброс формы
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
            setSelectedType('');
            setCurrentStep(1);
            setIsAdding(false);
        } else {
            // console.error('Ошибка при добавлении публикации');
            // Обработка ошибок от сервера
            const errorData = await response.json(); // Получаем тело ответа с ошибкой
            setErrorMessage(`Ошибка: ${errorData.message}`); // Устанавливаем сообщение об ошибке 
        }
    } catch (error) {
        // console.error('Ошибка при добавлении публикации:', error);
        setErrorMessage("Произошла ошибка при добавлении публикации. Попробуйте снова."); // Устанавливаем сообщение об ошибке

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
      setCurrentStep(2);
    } else {
      alert('Пожалуйста, выберите тип публикации');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
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
      <ErrorMessage message={errorMessage} />

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
                  <option value="scopus_wos">Публикации Scopus и Web of Science</option>
                  <option value="koknvo">Научные статьи в журналах КОКНВО</option>
                  <option value="conference">Публикации в материалах конференций</option>
                  <option value="articles">Научные статьи в периодических изданиях</option>
                  <option value="books">Монографии, учебные пособия и другие книги</option>
                  <option value="patents">Патенты, авторские свидетельства и др. охранные документы</option>
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
                      {field === 'title' && 'Название'}
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
                {selectedType === 'koknvo' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">Ссылки, DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={newPublication.doi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <strong>Файл:</strong> <a href={`${url}/${publication.file}`} download className="text-blue-600 hover:underline">Скачать файл</a>
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

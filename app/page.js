import Image from "next/image";
import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
    <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">AIU Science Portal</h1>
      <p className="text-center text-gray-700 mb-6">
        Добро пожаловать в систему оценки научной активности сотрудников университета.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard" legacyBehavior>
          <a className="block p-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition duration-300">
            Личный кабинет
          </a>
        </Link>
        <Link href="/publications" legacyBehavior>
          <a className="block p-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition duration-300">
            Публикации
          </a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a className="block p-4 bg-yellow-600 text-white text-center rounded-lg hover:bg-yellow-700 transition duration-300">
            Вход в систему
          </a>
        </Link>
        <Link href="/register" legacyBehavior>
          <a className="block p-4 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition duration-300">
            Регистрация
          </a>
        </Link>
        <Link href="/future" legacyBehavior>
          <a className="block p-4 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition duration-300">
            Будущие разделы (placeholder)
          </a>
        </Link>
      </div>
    </div>
  </div>
  );
}

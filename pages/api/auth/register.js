import bcrypt from 'bcryptjs';

// Простая база данных пользователей (для демонстрации)
const users = [
  {
    iin: '123456789012',
    password: '$2a$10$XrYrBd5c8T3C1rTt7wZwYOlhA1AV7kY3edQOfOhWddAnLMrCUEsXy', // хэшированный пароль: "password123"
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Если метод не POST, возвращаем ошибку
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  const { iin, password } = req.body;

  // Проверка, есть ли пользователь с таким же ИИН
  const existingUser = users.find((user) => user.iin === iin);
  if (existingUser) {
    return res.status(400).json({ message: 'Пользователь с таким ИИН уже зарегистрирован' });
  }

  // Хеширование пароля
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ iin, password: hashedPassword });

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при хешировании пароля:', error);
    res.status(500).json({ message: 'Произошла ошибка на сервере. Попробуйте позже.' });
  }
}
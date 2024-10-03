import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Простая база данных пользователей (для примера, на практике используйте реальную базу данных)
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

  // Проверка наличия пользователя по ИИН
  const user = users.find((user) => user.iin === iin);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Пользователь не найден' });
  }

  // Проверка правильности пароля
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Неверный пароль' });
  }

  // Генерация JWT токена
  const secretKey = process.env.JWT_SECRET || 'defaultSecretKey'; // Используйте безопасный ключ
  const token = jwt.sign({ iin: user.iin }, secretKey, { expiresIn: '1h' });

  // Возвращаем токен клиенту
  res.status(200).json({ success: true, token });
}
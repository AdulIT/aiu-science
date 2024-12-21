import { jwtDecode } from 'jwt-decode';

export function getUserIIN() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Токен отсутствует. Пожалуйста, авторизуйтесь.');
    }

    const decodedToken = jwtDecode(token);
    if (!decodedToken.iin) {
      throw new Error('IIN не найден в токене.');
    }

    return decodedToken.iin;
  } catch (error) {
    console.error('Ошибка получения IIN:', error.message);
    throw error;
  }
}
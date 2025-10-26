
import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/apiService';
import { User } from '../types';
import useTelegram from '../hooks/useTelegram';
import UserIcon from './icons/UserIcon';

interface AuthScreenProps {
    onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const { tgUser } = useTelegram();
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tgUser) {
            const initialName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
            setName(initialName);
        }
    }, [tgUser]);

    const validateName = (name: string): boolean => {
        if (name.length < 5) {
            setError("ФИО должно быть длиннее 5 символов.");
            return false;
        }
        if (['=', '+', '-', '@'].includes(name[0])) {
            setError("ФИО не должно начинаться с =, +, - или @.");
            return false;
        }
        if (['техника', 'пользователи', 'admin'].includes(name.toLowerCase())) {
            setError("Это имя зарезервировано.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tgUser || !validateName(name)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await registerUser(tgUser.id.toString(), name, tgUser.username || '');
            if (response.data) {
                onLoginSuccess(response.data);
            } else if (response.error?.includes('UNIQUE constraint failed')) {
                // If user exists, reload to trigger authentication flow again
                 location.reload();
            }
            else {
                setError(response.error || 'Произошла неизвестная ошибка.');
            }
        } catch (err) {
            setError('Ошибка сети. Попробуйте еще раз.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="w-full max-w-sm">
                <UserIcon className="w-16 h-16 mx-auto text-tg-hint" />
                <h1 className="mt-4 text-2xl font-bold text-tg-text">Добро пожаловать</h1>
                <p className="mt-2 text-tg-hint">
                    Для начала работы, пожалуйста, введите ваше ФИО. Оно будет использоваться во всех отчетах.
                </p>

                <form onSubmit={handleRegistration} className="mt-8 space-y-4">
                    <div className="text-left">
                        <label htmlFor="auth-name" className="block text-sm font-medium text-tg-text">Ваше ФИО</label>
                        <input
                            type="text"
                            id="auth-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={5}
                            maxLength={50}
                            placeholder="Иванов Иван Иванович"
                            className="mt-1 block w-full px-3 py-2 bg-tg-secondary-bg border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-tg-hint focus:outline-none focus:ring-tg-link focus:border-tg-link sm:text-sm"
                        />
                    </div>
                    {error && <div className="text-sm text-tg-error">{error}</div>}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-tg-button-text bg-tg-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tg-link disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? 'Сохранение...' : 'Сохранить и войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
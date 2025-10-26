import React, { useState, useEffect } from 'react';
import { User, Screen } from '../types';
import { changeName } from '../services/apiService';
import useTelegram from '../hooks/useTelegram';
import ProfileIcon from './icons/ProfileIcon';
import PencilIcon from './icons/PencilIcon';
import ListIcon from './icons/ListIcon';
import Modal from './Modal';
import Loader from './Loader';

interface ProfileScreenProps {
    user: User;
    onNavigate: (screen: Screen) => void;
    onNameChanged: (newName: string) => void;
    onLogout: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full gap-4 p-4 text-left border-t border-gray-200 dark:border-gray-700">
        <span className="text-tg-link">{icon}</span>
        <span className="text-tg-text">{label}</span>
    </button>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onNameChanged }) => {
    const { tg } = useTelegram();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newName, setNewName] = useState(user.driver_name);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        tg.BackButton.show();
        const backButtonClickHandler = () => onNavigate('main');
        tg.BackButton.onClick(backButtonClickHandler);
        return () => {
            tg.BackButton.onClick(() => {});
            tg.BackButton.hide();
        }
    }, [tg, onNavigate]);
    
    const handleNameChange = async () => {
        if (newName.trim().length < 5) {
            setError("ФИО должно быть длиннее 5 символов.");
            return;
        }
        if (newName.trim() === user.driver_name) {
            setModalOpen(false);
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const response = await changeName(user.tg_id, newName.trim());
            if (response.data?.success) {
                onNameChanged(newName.trim());
                setModalOpen(false);
            } else {
                setError(response.error || 'Не удалось сменить имя.');
            }
        } catch (e) {
            setError('Ошибка сети.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-4 animate-fadeIn">
            {isLoading && <Loader />}
            <div className="flex flex-col items-center pt-4 pb-6 text-center">
                 <ProfileIcon className="w-20 h-20 mb-4 text-tg-hint" />
                <h2 className="text-2xl font-bold">{user.driver_name}</h2>
                <p className="text-sm text-tg-hint">ID: {user.tg_id}</p>
            </div>
            
            <div className="flex flex-col bg-tg-secondary-bg/50 dark:bg-gray-800/50 rounded-lg">
                <MenuItem icon={<PencilIcon className="w-6 h-6" />} label="Сменить ФИО" onClick={() => setModalOpen(true)} />
                <MenuItem icon={<ListIcon className="w-6 h-6" />} label="Редактировать отчеты" onClick={() => onNavigate('editList')} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Сменить ФИО"
                confirmText="Сменить"
                onConfirm={handleNameChange}
            >
                <div className="space-y-2">
                    <label htmlFor="change-name-input" className="text-sm font-medium text-tg-text">Новое ФИО</label>
                    <input
                        type="text"
                        id="change-name-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 bg-tg-secondary-bg border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-tg-hint focus:outline-none focus:ring-tg-link focus:border-tg-link"
                        placeholder="Иванов Иван Иванович"
                    />
                    {error && <p className="text-sm text-tg-error">{error}</p>}
                </div>
            </Modal>
        </div>
    );
};

export default ProfileScreen;
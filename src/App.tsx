
import React, { useState, useEffect, useCallback } from 'react';
import { User, Report, Screen, Toast as ToastType } from './types';
import { getUser } from './services/apiService';
import useTelegram from './hooks/useTelegram';

import Loader from './components/Loader';
import AuthScreen from './components/AuthScreen';
import MainScreen from './components/MainScreen';
import ProfileScreen from './components/ProfileScreen';
import EditListScreen from './components/EditListScreen';
import Toast from './components/Toast';

const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('loader');
    const [user, setUser] = useState<User | null>(null);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [toast, setToast] = useState<ToastType | null>(null);

    const { tg, tgUser } = useTelegram();

    useEffect(() => {
        tg.ready();
        tg.expand();
    }, [tg]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const authenticateUser = useCallback(async () => {
        if (!tgUser) {
            setScreen('auth'); // Or show an error screen
            showToast("Не удалось получить данные Telegram.", 'error');
            return;
        }
        
        try {
            setScreen('loader');
            const response = await getUser(tgUser.id.toString());
            if (response.data) {
                setUser(response.data);
                setScreen('main');
            } else if (response.error === 'not_found') {
                setScreen('auth');
            } else {
                showToast(response.error || 'Ошибка сервера при аутентификации.', 'error');
                setScreen('auth');
            }
        } catch (error) {
            showToast('Ошибка сети. Не удалось связаться с сервером.', 'error');
            setScreen('auth');
        }
    }, [tgUser]);

    useEffect(() => {
        authenticateUser();
    }, [authenticateUser]);

    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        setScreen('main');
        showToast('Вход выполнен успешно!');
    };
    
    const handleNameChanged = (newName: string) => {
        if(user){
            setUser({...user, driver_name: newName});
            showToast('ФИО успешно изменено!');
        }
        setScreen('profile');
    }

    const handleStartEdit = (report: Report) => {
        setEditingReport(report);
        setScreen('main');
    };
    
    const handleReportSubmitted = () => {
        setEditingReport(null);
        showToast('Отчет успешно отправлен!');
        setTimeout(() => {
            tg.close();
        }, 1500);
    };

    const handleReportEdited = () => {
        setEditingReport(null);
        setScreen('profile'); // Or wherever user should go after edit
        showToast('Отчет успешно отредактирован!');
    };

    const handleLogout = () => {
        setUser(null);
        setScreen('auth');
    }
    
    const renderScreen = () => {
        if (!user && (screen !== 'loader' && screen !== 'auth')) {
             authenticateUser();
             return <Loader />;
        }
        
        switch (screen) {
            case 'loader':
                return <Loader />;
            case 'auth':
                return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
            case 'main':
                return user && <MainScreen user={user} editingReport={editingReport} onReportSubmit={handleReportSubmitted} onReportEdit={handleReportEdited} onProfileClick={() => setScreen('profile')} onCancelEdit={() => {setEditingReport(null); setScreen('editList')}} />;
            case 'profile':
                return user && <ProfileScreen user={user} onNavigate={setScreen} onNameChanged={handleNameChanged} onLogout={handleLogout} />;
            case 'editList':
                return user && <EditListScreen user={user} onEditReport={handleStartEdit} onBack={() => setScreen('profile')} />;
            default:
                return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
        }
    };

    return (
        <div className="min-h-screen">
            {renderScreen()}
            <Toast toast={toast} />
        </div>
    );
};

export default App;
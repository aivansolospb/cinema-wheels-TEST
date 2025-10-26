import React, { useState, useEffect, useCallback } from 'react';
import { User, Report } from '../types';
import { getReports } from '../services/apiService';
import useTelegram from '../hooks/useTelegram';
import Loader from './Loader';
import PencilIcon from './icons/PencilIcon';

interface EditListScreenProps {
    user: User;
    onEditReport: (report: Report) => void;
    onBack: () => void;
}

const EditListScreen: React.FC<EditListScreenProps> = ({ user, onEditReport, onBack }) => {
    const { tg } = useTelegram();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        tg.BackButton.show();
        tg.BackButton.onClick(onBack);

        return () => {
            tg.BackButton.onClick(() => {});
            tg.BackButton.hide();
        };
    }, [tg, onBack]);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getReports(user.tg_id);
            if (response.data) {
                setReports(response.data);
            } else {
                setError(response.error || 'Не удалось загрузить отчеты.');
            }
        } catch (e) {
            setError('Ошибка сети.');
        } finally {
            setIsLoading(false);
        }
    }, [user.tg_id]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
    
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
        } catch {
            return '??:??';
        }
    };

    return (
        <div className="p-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold">Последние 10 отчетов</h1>
            </div>
            
            {isLoading && <Loader />}
            {error && <p className="text-center text-tg-error">{error}</p>}
            
            {!isLoading && !error && (
                <div className="space-y-2">
                    {reports.length === 0 ? (
                        <p className="text-center text-tg-hint">Нет отчетов для редактирования.</p>
                    ) : (
                        reports.map((report, index) => (
                            <div 
                                key={report.report_id} 
                                className="flex items-center justify-between p-3 bg-tg-secondary-bg rounded-lg animate-fadeInUp opacity-0"
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-tg-hint">{formatDate(report.payload.date)}</span>
                                    <span className="font-semibold text-tg-text">{report.payload.project || 'Без проекта'}</span>
                                    <span className="text-sm text-tg-text">{report.payload.vehicle || 'Без техники'}</span>
                                </div>
                                <button onClick={() => onEditReport(report)} className="p-2 text-tg-button-text bg-tg-button rounded-full">
                                    <PencilIcon className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default EditListScreen;
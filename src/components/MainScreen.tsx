import React, { useState, useEffect, useCallback } from 'react';
import { User, Report, FormData as FormDataType, ReportPayload } from '../types';
import { getFormData, submitReport, editReport } from '../services/apiService';
import useTelegram from '../hooks/useTelegram';
import useReportDraft from '../hooks/useReportDraft';
import Loader from './Loader';
import Modal from './Modal';
import ProfileIcon from './icons/ProfileIcon';

interface MainScreenProps {
    user: User;
    editingReport: Report | null;
    onReportSubmit: () => void;
    onReportEdit: () => void;
    onProfileClick: () => void;
    onCancelEdit: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ user, editingReport, onReportSubmit, onReportEdit, onProfileClick, onCancelEdit }) => {
    const { tg } = useTelegram();
    const { report, setReport, resetDraft } = useReportDraft(editingReport);
    
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ReportPayload, boolean>>>({});
    const [isPreviewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const response = await getFormData();
                if (response.data) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error("Failed to load form data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFormData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setReport(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
        if(errors[id as keyof ReportPayload]){
            setErrors(prev => ({...prev, [id]: false}));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof ReportPayload, boolean>> = {};
        if (!report.date) newErrors.date = true;
        if (!report.project.trim()) newErrors.project = true;
        if (!report.vehicle) newErrors.vehicle = true;
        if (!report.address.trim()) newErrors.address = true;
        if (!report.shift_start) newErrors.shift_start = true;
        if (!report.shift_end) newErrors.shift_end = true;

        if (report.trailer_diff_time) {
            if (!report.trailer_start) newErrors.trailer_start = true;
            if (!report.trailer_end) newErrors.trailer_end = true;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreview = () => {
        if (validateForm()) {
            setPreviewOpen(true);
        } else {
            tg.HapticFeedback.notificationOccurred('error');
        }
    };
    
     const handleSubmit = async () => {
        if (!validateForm()) return;
        setPreviewOpen(false);
        
        let reason = '';
        if (editingReport) {
            reason = prompt('Укажите причину редактирования (обязательно):') || '';
            if (reason.trim().length < 4) {
                 tg.HapticFeedback.notificationOccurred('error');
                 alert("Причина обязательна (мин. 4 символа).");
                 return;
            }
        }
        
        setIsSubmitting(true);
        try {
            const response = editingReport
                ? await editReport(editingReport.report_id, user.tg_id, report, reason.trim())
                : await submitReport(user.tg_id, report);

            if (response.data?.success) {
                resetDraft();
                if (editingReport) onReportEdit();
                else onReportSubmit();
            } else {
                tg.showPopup({ title: 'Ошибка', message: response.error || 'Не удалось отправить отчет.' });
            }
        } catch (e) {
            tg.showPopup({ title: 'Ошибка сети', message: 'Не удалось отправить отчет. Данные сохранены в черновике.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        tg.MainButton.setParams({ text: 'ПРЕДПРОСМОТР', is_visible: true });
        const previewHandler = () => handlePreview();
        tg.MainButton.onClick(previewHandler);
        
        return () => {
            tg.MainButton.onClick(() => {});
            tg.MainButton.hide();
        }
    }, [tg, report, errors]); // Re-attach onClick handler if report changes
    
    const calculateOvertime = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startTime = new Date(`1970-01-01T${start}`);
        const endTime = new Date(`1970-01-01T${end}`);
        if(endTime < startTime) endTime.setDate(endTime.getDate() + 1);

        let totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const overtimeMinutes = totalMinutes - (12 * 60);
        if (overtimeMinutes <= 0) return 0;
        
        const roundedMinutes = Math.round(overtimeMinutes / 15) * 15;
        return roundedMinutes / 60;
    };
    
    const formatHours = (h: number) => {
        if (h <= 0) return "0 ч.";
        const totalMinutes = Math.round(h * 60);
        const hoursPart = Math.floor(totalMinutes / 60);
        const minutesPart = totalMinutes % 60;
        let result = [];
        if (hoursPart > 0) result.push(`${hoursPart} ч.`);
        if (minutesPart > 0) result.push(`${minutesPart} мин.`);
        return result.join(" ");
    };

    const shiftOvertime = calculateOvertime(report.shift_start, report.shift_end);
    const trailerOvertime = report.trailer ? calculateOvertime(
        report.trailer_diff_time ? report.trailer_start : report.shift_start,
        report.trailer_diff_time ? report.trailer_end : report.shift_end
    ) : 0;
    
    const renderPreview = () => (
        <div className="space-y-1">
            <p><strong>🗓 Дата:</strong> {report.date}</p>
            <p><strong>👤 Водитель:</strong> {user.driver_name}</p>
            <p><strong>🎬 Проект:</strong> {report.project}</p>
            <p><strong>🚚 Техника:</strong> {report.vehicle}</p>
            {report.trailer && <p><strong>➕ Прицеп:</strong> {report.trailer}</p>}
            <p><strong>📍 Адрес:</strong> {report.address}</p>
            <p><strong>🕔 Смена:</strong> {report.shift_start} — {report.shift_end} (Переработка: {formatHours(shiftOvertime)})</p>
            {report.trailer && <p><strong>🕔 Смена прицепа:</strong> {report.trailer_diff_time ? `${report.trailer_start} — ${report.trailer_end}` : 'Как у смены'} (Переработка: {formatHours(trailerOvertime)})</p>}
            {report.overrun && <p><strong>🛣 Перепробег:</strong> {report.overrun} км</p>}
            {report.comment && <p><strong>💬 Комментарий:</strong> {report.comment}</p>}
        </div>
    );
    
    const getInputClass = (field: keyof ReportPayload) =>
      `mt-1 block w-full px-3 py-2 bg-tg-secondary-bg border rounded-md shadow-sm placeholder-tg-hint focus:outline-none focus:ring-tg-link focus:border-tg-link sm:text-sm ${
        errors[field] ? 'border-tg-error' : 'border-gray-300 dark:border-gray-600'
      }`;


    if (isLoading || isSubmitting) return <Loader />;

    return (
        <div className="p-4 pb-20">
            <header className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700 animate-fadeIn">
                <h1 className="text-xl font-bold">
                  {editingReport ? `Редактирование (ID: ${editingReport.report_id})` : 'Отчёт о смене'}
                  {user.role === 'admin' && ' (Админка)'}
                </h1>
                <button onClick={onProfileClick}><ProfileIcon className="w-8 h-8 text-tg-link" /></button>
            </header>
            
            <form className="space-y-5 animate-fadeInUp">
                {/* Date */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium">Дата</label>
                    <input type="date" id="date" value={report.date} onChange={handleInputChange} className={getInputClass('date')} />
                </div>
                {/* Project */}
                <div>
                    <label htmlFor="project" className="block text-sm font-medium">Проект</label>
                    <input type="text" id="project" value={report.project} onChange={handleInputChange} list="recent-projects" placeholder="Название проекта" maxLength={25} className={getInputClass('project')} />
                    <datalist id="recent-projects">
                        {formData?.recentProjects.map(p => <option key={p.project} value={p.project} />)}
                    </datalist>
                </div>
                {/* Vehicle */}
                 <div>
                    <label htmlFor="vehicle" className="block text-sm font-medium">Техника</label>
                    <select id="vehicle" value={report.vehicle} onChange={handleInputChange} className={getInputClass('vehicle')}>
                        <option value="">— выберите технику —</option>
                        {formData?.vehicles.map(v => <option key={v.vehicle_name} value={v.vehicle_name}>{v.vehicle_name}</option>)}
                    </select>
                </div>
                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium">Место / Адрес</label>
                    <textarea id="address" value={report.address} onChange={handleInputChange} rows={2} placeholder="Где вы работали" maxLength={50} className={getInputClass('address')} />
                </div>
                {/* Shift Time */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="shift_start" className="block text-sm font-medium">Смена (Начало)</label>
                        <input type="time" id="shift_start" value={report.shift_start} onChange={handleInputChange} className={getInputClass('shift_start')} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="shift_end" className="block text-sm font-medium">Смена (Конец)</label>
                        <input type="time" id="shift_end" value={report.shift_end} onChange={handleInputChange} className={getInputClass('shift_end')} />
                    </div>
                </div>
                 {/* Trailer */}
                <div>
                    <label htmlFor="trailer" className="block text-sm font-medium">Прицеп</label>
                    <select id="trailer" value={report.trailer} onChange={handleInputChange} className={getInputClass('trailer')}>
                        <option value="">— нет прицепа —</option>
                        {formData?.trailers.map(t => <option key={t.vehicle_name} value={t.vehicle_name}>{t.vehicle_name}</option>)}
                    </select>
                </div>
                
                {/* Trailer Time Toggle */}
                {report.trailer && (
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="trailer_diff_time" checked={report.trailer_diff_time} onChange={handleInputChange} className="w-4 h-4 rounded text-tg-link focus:ring-tg-link" />
                        <label htmlFor="trailer_diff_time" className="text-sm">Время прицепа отличается от времени смены</label>
                    </div>
                )}
                
                {/* Trailer Time Fields */}
                {report.trailer && report.trailer_diff_time && (
                     <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="trailer_start" className="block text-sm font-medium">Прицеп (Начало)</label>
                            <input type="time" id="trailer_start" value={report.trailer_start} onChange={handleInputChange} className={getInputClass('trailer_start')} />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="trailer_end" className="block text-sm font-medium">Прицеп (Конец)</label>
                            <input type="time" id="trailer_end" value={report.trailer_end} onChange={handleInputChange} className={getInputClass('trailer_end')} />
                        </div>
                    </div>
                )}
                
                {/* Overrun */}
                <div>
                    <label htmlFor="overrun" className="block text-sm font-medium">Перепробег (км)</label>
                    <input type="number" id="overrun" value={report.overrun} onChange={handleInputChange} min="0" max="9999" placeholder="0" className={getInputClass('overrun')} />
                </div>
                
                 {/* Comment */}
                 <div>
                    <label htmlFor="comment" className="block text-sm font-medium">Комментарий</label>
                    <textarea id="comment" value={report.comment} onChange={handleInputChange} rows={3} placeholder="Любые детали, проблемы, заметки..." maxLength={100} className={getInputClass('comment')} />
                </div>
            </form>

            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setPreviewOpen(false)}
                title={editingReport ? "Подтвердить изменения?" : "Отправить отчет?"}
                confirmText={editingReport ? "Отредактировать" : "Отправить"}
                onConfirm={handleSubmit}
            >
                {renderPreview()}
            </Modal>
        </div>
    );
};

export default MainScreen;
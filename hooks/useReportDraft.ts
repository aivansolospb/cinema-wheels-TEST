
import { useState, useEffect, useCallback } from 'react';
import { ReportPayload, Report } from '../types';

const getInitialState = (): ReportPayload => ({
    date: new Date().toISOString().split('T')[0],
    project: '',
    vehicle: '',
    address: '',
    shift_start: '',
    shift_end: '',
    trailer: '',
    trailer_diff_time: false,
    trailer_start: '',
    trailer_end: '',
    overrun: '',
    comment: '',
});

const DRAFT_KEY = 'driver_report_draft';

const useReportDraft = (editingReport: Report | null) => {
    const [report, setReport] = useState<ReportPayload>(getInitialState);

    useEffect(() => {
        if (editingReport) {
            setReport(editingReport.payload);
        } else {
            try {
                const draftJson = localStorage.getItem(DRAFT_KEY);
                if (draftJson) {
                    const savedDraft = JSON.parse(draftJson);
                    // Merge saved draft with initial state to ensure all keys are present
                    setReport(prevState => ({ ...prevState, ...savedDraft }));
                } else {
                    setReport(getInitialState());
                }
            } catch (error) {
                console.error("Failed to parse draft from localStorage", error);
                localStorage.removeItem(DRAFT_KEY);
                setReport(getInitialState());
            }
        }
    }, [editingReport]);

    useEffect(() => {
        if (!editingReport) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(report));
        }
    }, [report, editingReport]);
    
    const resetDraft = useCallback(() => {
        localStorage.removeItem(DRAFT_KEY);
        setReport(getInitialState());
    }, []);

    return { report, setReport, resetDraft };
};

export default useReportDraft;

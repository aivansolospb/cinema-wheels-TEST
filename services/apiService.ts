
import { API_BASE_URL } from '../config';
import { User, FormData, Report, ReportPayload } from '../types';

interface ApiResponse<T> {
    data?: T;
    error?: string;
    details?: any;
}

async function request<T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            let errorPayload: { message: string, details?: any } = { message: `HTTP error ${response.status}` };
            try {
                const errData = await response.json();
                errorPayload = { message: errData.error || `HTTP error ${response.status}`, details: errData };
            } catch (e) {
                // Ignore if response is not json
            }
            return { error: errorPayload.message, details: errorPayload.details };
        }
        
        if (response.status === 204) {
            return { data: null as T };
        }

        const data = await response.json();
        return data as ApiResponse<T>;

    } catch (e) {
        console.error('API Request Network Error:', e);
        return { error: 'Failed to fetch' };
    }
}

export const getUser = (tgId: string): Promise<ApiResponse<User>> => {
    return request<User>(`/user/${tgId}`);
};

export const registerUser = (tgId: string, driverName: string, username: string): Promise<ApiResponse<User>> => {
    return request<User>('/register', {
        method: 'POST',
        body: JSON.stringify({ tgId, driverName, username }),
    });
};

export const changeName = (tgId: string, newName: string): Promise<ApiResponse<{ success: boolean }>> => {
    return request<{ success: boolean }>('/changeName', {
        method: 'POST',
        body: JSON.stringify({ tgId, newName }),
    });
};

export const getFormData = (): Promise<ApiResponse<FormData>> => {
    return request<FormData>('/formData');
};

export const submitReport = (tgId: string, reportData: ReportPayload): Promise<ApiResponse<{ success: boolean, report_id: number }>> => {
    return request<{ success: boolean, report_id: number }>('/report', {
        method: 'POST',
        body: JSON.stringify({ tgId, reportData }),
    });
};

export const getReports = (tgId: string): Promise<ApiResponse<Report[]>> => {
    return request<Report[]>(`/reports/${tgId}`);
};

export const editReport = (reportId: number, tgId: string, reportData: ReportPayload, reason: string): Promise<ApiResponse<{ success: boolean, report_id: number }>> => {
    return request<{ success: boolean, report_id: number }>(`/report/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({ tgId, reportData, reason }),
    });
};


export interface User {
  tg_id: string;
  driver_name: string;
  role: 'driver' | 'admin';
  g_sheet_id: string;
  tg_username?: string;
}

export interface ReportPayload {
  date: string;
  project: string;
  vehicle: string;
  address: string;
  shift_start: string;
  shift_end: string;
  trailer: string;
  trailer_diff_time: boolean;
  trailer_start: string;
  trailer_end: string;
  overrun: string;
  comment: string;
}

export interface Report {
  report_id: number;
  status: string;
  payload: ReportPayload;
}

export interface Vehicle {
  vehicle_name: string;
}

export interface Trailer {
  vehicle_name: string;
}

export interface RecentProject {
  project: string;
}

export interface FormData {
  vehicles: Vehicle[];
  trailers: Trailer[];
  recentProjects: RecentProject[];
}

export type Screen = 'loader' | 'auth' | 'main' | 'profile' | 'editList';

export interface Toast {
    message: string;
    type: 'success' | 'error';
}

// Telegram WebApp types
export interface TGUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface WebApp {
    initDataUnsafe: {
        user?: TGUser;
    };
    initData: string;
    ready: () => void;
    expand: () => void;
    close: () => void;
    MainButton: {
        text: string;
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        setParams: (params: { text?: string; is_visible?: boolean; is_active?: boolean; color?: string; text_color?: string; }) => void;
        onClick: (callback: () => void) => void;
    };
    BackButton: {
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    };
    showPopup: (params: { title: string; message: string; buttons?: { id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }[] }, callback?: (id?: string) => void) => void;
}

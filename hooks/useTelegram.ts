
import { useState, useMemo } from 'react';
import { WebApp, TGUser } from '../types';

// Mock TWA for browser development
const getMockTWA = (): WebApp => {
    console.warn("Telegram WebApp API not found. Running in mock mode.");
    const MOCK_TG_ID = "7573758625";
    
    // @ts-ignore
    window.mockMainButtonClick = () => {};
    // @ts-ignore
    window.mockBackButtonClick = () => {};

    // Mock button in browser for testing
    if (!document.getElementById('mock-main-button')) {
        const mockButton = document.createElement('button');
        mockButton.id = 'mock-main-button';
        mockButton.innerText = "TEST_CLICK_MAIN_BUTTON";
        mockButton.className = "fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-lg shadow-lg";
        // @ts-ignore
        mockButton.onclick = () => window.mockMainButtonClick && window.mockMainButtonClick();
        document.body.appendChild(mockButton);
    }
    
    return {
        initDataUnsafe: {
            user: {
                id: parseInt(MOCK_TG_ID, 10),
                first_name: "Test",
                last_name: "User",
                username: "testuser"
            }
        },
        initData: '',
        ready: () => {},
        expand: () => {},
        MainButton: {
            text: "",
            isVisible: false,
            show: () => { 
                const btn = document.getElementById('mock-main-button');
                if (btn) btn.style.display = 'block';
             },
            hide: () => {
                const btn = document.getElementById('mock-main-button');
                if (btn) btn.style.display = 'none';
            },
            setParams: (params) => {
                console.log("Mock MainButton setParams:", params);
                const btn = document.getElementById('mock-main-button');
                if (btn && params.text) {
                    btn.innerText = params.text;
                }
                 if (btn && typeof params.is_visible !== 'undefined') {
                    btn.style.display = params.is_visible ? 'block' : 'none';
                }
            },
            onClick: (callback) => {
                // @ts-ignore
                window.mockMainButtonClick = callback;
            }
        },
        BackButton: {
            isVisible: false,
            show: () => { console.log("Mock BackButton show"); },
            hide: () => { console.log("Mock BackButton hide"); },
            onClick: (callback) => {
                // @ts-ignore
                window.mockBackButtonClick = callback;
            }
        },
        HapticFeedback: {
            impactOccurred: (style) => { console.log("Mock Haptic:", style); },
            notificationOccurred: (type) => { console.log("Mock Haptic Notify:", type); }
        },
        showPopup: (params, callback) => {
            alert(`${params.title}\n\n${params.message}`);
            if (callback) callback('ok');
        },
        close: () => { console.log("Mock WebApp close()"); }
    };
};

const useTelegram = () => {
    const [tg] = useState<WebApp>(() => {
        // @ts-ignore
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            // @ts-ignore
            return Telegram.WebApp;
        }
        return getMockTWA();
    });

    const tgUser = useMemo(() => tg.initDataUnsafe?.user, [tg]);

    return { tg, tgUser };
};

export default useTelegram;

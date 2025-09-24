'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';

export default function LocaleButtons() {
    const [isMounted, setIsMounted] = useState(false);
    const { locale, setLocale } = useLocale();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Render a placeholder or nothing on the server and initial client render
        return <div className="flex items-center mr-4" style={{ height: '34px' }}></div>; // Placeholder with same size
    }

    return (
        <div className="flex items-center mr-4">
            <button
                onClick={() => setLocale('KR')}
                className={`mr-2 px-2 py-1 rounded ${locale === 'KR' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
                KR
            </button>
            <button
                onClick={() => setLocale('JP')}
                className={`px-2 py-1 rounded ${locale === 'JP' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
                JP
            </button>
        </div>
    );
}

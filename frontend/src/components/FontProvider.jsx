import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * مزود الخطوط - يلف التطبيق ويطبق الخط المناسب حسب اللغة
 */
const FontProvider = ({ children }) => {
    const { language } = useApp();

    // تحديد الخط حسب اللغة
    const getFontFamily = () => {
        switch (language) {
            case 'ar':
                return 'Amiri, Cairo, serif';
            case 'fr':
                return 'EB Garamond, serif';
            case 'en':
            default:
                return 'Cormorant Garamond, serif';
        }
    };

    const fontFamily = getFontFamily();

    // تطبيق الخط على المستوى العالمي
    useEffect(() => {
        // إضافة style tag للتأكد من تطبيق الخط على كل شيء
        const styleId = 'font-provider-global-style';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            * {
                font-family: ${fontFamily} !important;
            }
            
            html, body, #root {
                font-family: ${fontFamily} !important;
            }
            
            input, textarea, select, button, option {
                font-family: ${fontFamily} !important;
            }
            
            .modal, .popup, .dialog, .tooltip, .dropdown, .menu {
                font-family: ${fontFamily} !important;
            }
            
            [role="dialog"], [role="menu"], [role="tooltip"], [role="alert"] {
                font-family: ${fontFamily} !important;
            }
        `;

        return () => {
            // تنظيف عند إلغاء المكون
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        };
    }, [fontFamily]);

    return (
        <div 
            style={{ 
                fontFamily,
                width: '100%',
                height: '100%'
            }}
        >
            {children}
        </div>
    );
};

export default FontProvider;

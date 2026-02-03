// إصلاح جذري لمشكلة الحقول المقفولة على Android
(function() {
    console.log('🔧 Input Fix Script Loading...');
    
    // استخدام البلاجين المخصص إذا كان متاحاً
    function useNativePlugin() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.WebViewConfig) {
            console.log('🔧 Using native WebView plugin');
            window.Capacitor.Plugins.WebViewConfig.configureForInputs()
                .then(() => {
                    console.log('🔧 Native WebView configuration successful');
                    return window.Capacitor.Plugins.WebViewConfig.forceEnableInputs();
                })
                .then(() => {
                    console.log('🔧 Native input force enable successful');
                })
                .catch(err => {
                    console.error('🔧 Native plugin error:', err);
                    fallbackToJavaScript();
                });
        } else {
            console.log('🔧 Native plugin not available, using JavaScript fallback');
            fallbackToJavaScript();
        }
    }
    
    // الحل الاحتياطي بـ JavaScript
    function fallbackToJavaScript() {
        forceEnableInputs();
    }
    
    // إجبار تفعيل جميع الحقول
    function forceEnableInputs() {
        const inputs = document.querySelectorAll('input, select, textarea');
        console.log(`🔧 Found ${inputs.length} input elements`);
        
        inputs.forEach((input, index) => {
            // إزالة أي خصائص قد تمنع التفاعل
            input.style.pointerEvents = 'auto';
            input.style.cursor = input.tagName === 'SELECT' ? 'pointer' : 'text';
            input.style.userSelect = 'text';
            input.style.webkitUserSelect = 'text';
            input.style.touchAction = 'manipulation';
            input.style.webkitTouchCallout = 'default';
            input.style.webkitUserModify = 'read-write';
            
            // إزالة خصائص disabled أو readonly
            input.removeAttribute('disabled');
            input.removeAttribute('readonly');
            
            // تفعيل التركيز
            input.tabIndex = index + 1;
            
            // إضافة event listeners للتأكد من التفاعل
            input.addEventListener('touchstart', function(e) {
                console.log(`🔧 Touch started on ${input.name || input.type}`);
                e.stopPropagation();
            }, { passive: false });
            
            input.addEventListener('focus', function() {
                console.log(`🔧 Focus on ${input.name || input.type}`);
                this.style.backgroundColor = '#fff';
                this.style.border = '2px solid #007bff';
            });
            
            input.addEventListener('blur', function() {
                console.log(`🔧 Blur on ${input.name || input.type}`);
                this.style.border = '2px solid #ccc';
            });
            
            input.addEventListener('input', function() {
                console.log(`🔧 Input changed: ${input.name || input.type} = ${input.value}`);
            });
            
            console.log(`🔧 Configured input ${index + 1}: ${input.name || input.type}`);
        });
    }
    
    // تشغيل الإصلاح عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', useNativePlugin);
    } else {
        useNativePlugin();
    }
    
    // تشغيل الإصلاح كل ثانيتين للتأكد
    setInterval(forceEnableInputs, 2000);
    
    // تشغيل الإصلاح عند أي تغيير في DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldRun = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA')) {
                        shouldRun = true;
                    }
                });
            }
        });
        if (shouldRun) {
            setTimeout(forceEnableInputs, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('🔧 Input Fix Script Loaded Successfully');
})();
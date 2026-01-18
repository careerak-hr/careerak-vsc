package com.careerak.app;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // لمنع إغلاق التطبيق عند محاولة تسجيل الشاشة (إزالة FLAG_SECURE إذا كان مفعلاً من أي Plugin)
        // أو للتأكد من أن التطبيق يسمح بالتسجيل في حال كان النظام يمنعه افتراضياً لأسباب أمنية
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}

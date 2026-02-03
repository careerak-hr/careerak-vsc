package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.careerak.app.models.HealthResponse;
import com.careerak.app.network.ApiClient;
import com.careerak.app.network.ApiService;
import com.getcapacitor.BridgeActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // تسجيل البلاجين المخصص
        registerPlugin(WebViewConfigPlugin.class);

        // إعدادات WebView الضرورية لحل مشكلة الحقول المقفولة
        configureWebView();

        // اختبار الاتصال بالسيرفر عند بدء التشغيل
        checkBackendConnection();
    }

    private void configureWebView() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings webSettings = webView.getSettings();
                
                // تفعيل JavaScript (ضروري)
                webSettings.setJavaScriptEnabled(true);
                
                // تفعيل DOM Storage (ضروري للتطبيقات الحديثة)
                webSettings.setDomStorageEnabled(true);
                
                // تفعيل Database Storage
                webSettings.setDatabaseEnabled(true);
                
                // تحسين الأداء
                webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
                
                // إعدادات التفاعل مع الحقول
                webSettings.setBuiltInZoomControls(false);
                webSettings.setDisplayZoomControls(false);
                webSettings.setSupportZoom(false);
                
                // تفعيل التفاعل مع النماذج
                webSettings.setSaveFormData(true);
                webSettings.setSavePassword(false); // لأسباب أمنية
                
                // إعدادات الخط والنص
                webSettings.setTextZoom(100);
                webSettings.setDefaultTextEncodingName("UTF-8");
                
                // تفعيل Mixed Content (إذا كان مطلوباً)
                webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
                
                // إعدادات إضافية لضمان التفاعل
                webView.setFocusable(true);
                webView.setFocusableInTouchMode(true);
                webView.requestFocus();
                
                // تفعيل Hardware Acceleration
                webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
                
                // إعدادات إضافية للتفاعل مع الحقول
                webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
                webSettings.setAllowFileAccess(true);
                webSettings.setAllowContentAccess(true);
                
                // إعدادات تحميل الصور المحلية
                webSettings.setLoadsImagesAutomatically(true);
                webSettings.setBlockNetworkImage(false);
                webSettings.setAllowFileAccessFromFileURLs(true);
                webSettings.setAllowUniversalAccessFromFileURLs(true);
                
                Log.d("Careerak_WebView", "WebView configured successfully for input interaction");
            } else {
                Log.e("Careerak_WebView", "WebView is null - cannot configure");
            }
        } catch (Exception e) {
            Log.e("Careerak_WebView", "Error configuring WebView: " + e.getMessage());
        }
    }

    private void checkBackendConnection() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        apiService.checkServer().enqueue(new Callback<HealthResponse>() {
            @Override
            public void onResponse(Call<HealthResponse> call, Response<HealthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("Careerak_API", "Backend connected: " + response.body().getServer());
                } else {
                    Log.e("Careerak_API", "Backend response failed");
                    Toast.makeText(MainActivity.this, "فشل الاتصال بالخادم. الرجاء المحاولة مرة أخرى", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<HealthResponse> call, Throwable t) {
                Log.e("Careerak_API", "Connection Error: " + t.getMessage());
                Toast.makeText(MainActivity.this, "خطأ في الاتصال. يرجى التحقق من الشبكة.", Toast.LENGTH_LONG).show();
            }
        });
    }
}

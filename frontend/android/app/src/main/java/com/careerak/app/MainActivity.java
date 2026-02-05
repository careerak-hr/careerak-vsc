package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

// ✅ [تصحيح] إضافة المكتبات الأساسية بأسماء الحزم الصحيحة لـ Capacitor 6
import com.getcapacitor.app.AppPlugin;
import com.getcapacitor.preferences.PreferencesPlugin;

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

        // ✅ [تصحيح] تسجيل الإضافات (Plugins) بأسماء الفئات الصحيحة
        registerPlugin(AppPlugin.class);
        registerPlugin(PreferencesPlugin.class);
        registerPlugin(WebViewConfigPlugin.class);

        // إعدادات WebView الضرورية
        configureWebView();

        // [معطل مؤقتاً]
        // checkBackendConnection();
    }

    private void configureWebView() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings webSettings = webView.getSettings();
                webSettings.setJavaScriptEnabled(true);
                webSettings.setDomStorageEnabled(true);
                webSettings.setDatabaseEnabled(true);
                webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
                webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
                // ... (بقية الإعدادات)
                Log.d("Careerak_WebView", "WebView configured successfully");
            } else {
                Log.e("Careerak_WebView", "WebView is null");
            }
        } catch (Exception e) {
            Log.e("Careerak_WebView", "Error configuring WebView: " + e.getMessage());
        }
    }

    // ... (بقية الكود)
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

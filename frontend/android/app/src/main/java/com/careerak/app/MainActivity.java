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

        // إعدادات WebView لحل مشكلة حقول الإدخال
        configureWebView();

        // اختبار الاتصال بالسيرفر عند بدء التشغيل
        checkBackendConnection();
    }

    private void configureWebView() {
        try {
            WebView webView = getBridge().getWebView();
            WebSettings webSettings = webView.getSettings();
            
            // تفعيل JavaScript
            webSettings.setJavaScriptEnabled(true);
            
            // تفعيل DOM Storage
            webSettings.setDomStorageEnabled(true);
            
            // تفعيل Database Storage
            webSettings.setDatabaseEnabled(true);
            
            // تحسين إعدادات اللمس
            webSettings.setBuiltInZoomControls(false);
            webSettings.setDisplayZoomControls(false);
            webSettings.setSupportZoom(false);
            
            // إعدادات خاصة بحقول الإدخال
            webSettings.setTextZoom(100);
            webSettings.setUseWideViewPort(true);
            webSettings.setLoadWithOverviewMode(true);
            
            // تفعيل Mixed Content
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            Log.d("Careerak_WebView", "WebView configured for input fields");
            
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

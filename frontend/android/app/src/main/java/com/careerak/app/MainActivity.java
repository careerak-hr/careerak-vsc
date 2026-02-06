package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

// Re-added imports for our custom network and model classes
import com.careerak.app.models.HealthResponse;
import com.careerak.app.network.ApiClient;
import com.careerak.app.network.ApiService;
import com.careerak.app.WebViewConfigPlugin;

// Re-added imports for Retrofit
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register custom plugin only (Capacitor 6 auto-registers core plugins)
        registerPlugin(WebViewConfigPlugin.class);

        // Configure the WebView
        configureWebView();

        // Re-enable the backend connection check
        checkBackendConnection();
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
                Log.d("Careerak_WebView", "WebView configured successfully.");
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
                    Log.d("Careerak_API", "Backend connection successful: " + response.body().getServer());
                } else {
                    Log.e("Careerak_API", "Backend connection check failed. Response: " + response.message());
                    // We avoid showing a Toast to prevent user disruption
                }
            }

            @Override
            public void onFailure(Call<HealthResponse> call, Throwable t) {
                Log.e("Careerak_API", "Backend connection error: " + t.getMessage());
                 // We avoid showing a Toast to prevent user disruption
            }
        });
    }
}

package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.app.AppPlugin;
import com.getcapacitor.preferences.PreferencesPlugin;

// Assuming these are the correct paths for your custom classes
import com.careerak.app.models.HealthResponse;
import com.careerak.app.network.ApiClient;
import com.careerak.app.network.ApiService;
import com.careerak.app.WebViewConfigPlugin;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register all the necessary plugins
        registerPlugin(AppPlugin.class);
        registerPlugin(PreferencesPlugin.class);
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
                    // We show a log message but avoid showing a Toast to prevent disruption
                }
            }

            @Override
            public void onFailure(Call<HealthResponse> call, Throwable t) {
                Log.e("Careerak_API", "Backend connection error: " + t.getMessage());
                // We show a log message but avoid showing a Toast to prevent disruption
            }
        });
    }
}

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

// Pusher imports for real-time chat
import com.pusher.client.Pusher;
import com.pusher.client.PusherOptions;
import com.pusher.client.channel.Channel;
import com.pusher.client.channel.PusherEvent;
import com.pusher.client.channel.SubscriptionEventListener;
import com.pusher.client.connection.ConnectionEventListener;
import com.pusher.client.connection.ConnectionState;
import com.pusher.client.connection.ConnectionStateChange;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "Careerak_MainActivity";
    private Pusher pusher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register custom plugin only (Capacitor 6 auto-registers core plugins)
        registerPlugin(WebViewConfigPlugin.class);

        // Configure the WebView
        configureWebView();

        // Re-enable the backend connection check
        checkBackendConnection();
        
        // Initialize Pusher for real-time chat
        initializePusher();
    }

    /**
     * ✅ Override onBackPressed to let Capacitor handle back button
     * This ensures our JavaScript listener gets the event before Android's default behavior
     */
    @Override
    public void onBackPressed() {
        // Let Capacitor's bridge handle the back button event first
        // This will trigger our JavaScript listener in useExitConfirm.js
        Log.d(TAG, "Back button pressed - delegating to Capacitor bridge");
        
        // ✅ Call super to let Capacitor's BridgeActivity handle the event
        // This will trigger the 'backButton' event in JavaScript
        super.onBackPressed();
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
    
    /**
     * Initialize Pusher for real-time chat functionality
     */
    private void initializePusher() {
        try {
            PusherOptions options = new PusherOptions();
            options.setCluster("ap1");
            
            // Initialize Pusher with your key
            pusher = new Pusher("e1634b67b9768369c949", options);
            
            // Connect to Pusher
            pusher.connect(new ConnectionEventListener() {
                @Override
                public void onConnectionStateChange(ConnectionStateChange change) {
                    Log.i("Careerak_Pusher", "State changed from " + change.getPreviousState() +
                            " to " + change.getCurrentState());
                }
                
                @Override
                public void onError(String message, String code, Exception e) {
                    Log.e("Careerak_Pusher", "Connection error! " +
                            "\ncode: " + code +
                            "\nmessage: " + message +
                            "\nException: " + (e != null ? e.getMessage() : "null"));
                }
            }, ConnectionState.ALL);
            
            // Subscribe to a test channel (you can customize this later)
            Channel channel = pusher.subscribe("my-channel");
            
            channel.bind("my-event", new SubscriptionEventListener() {
                @Override
                public void onEvent(PusherEvent event) {
                    Log.i("Careerak_Pusher", "Received event with data: " + event.toString());
                }
            });
            
            Log.d("Careerak_Pusher", "Pusher initialized successfully");
            
        } catch (Exception e) {
            Log.e("Careerak_Pusher", "Error initializing Pusher: " + e.getMessage());
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Disconnect Pusher when activity is destroyed
        if (pusher != null) {
            pusher.disconnect();
            Log.d("Careerak_Pusher", "Pusher disconnected");
        }
    }
}

package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;
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

        // منع أي قيود أمنية قد تعيق تجربة المستخدم في بعض الأجهزة
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);

        // اختبار الاتصال بالسيرفر عند بدء التشغيل
        checkBackendConnection();

        // تعطيل جميع قوائم النظام المنبثقة بشكل كامل
        disableSystemPopups();
    }

    private void disableSystemPopups() {
        // تعطيل Smart Text Actions و Clipboard Overlay على مستوى التطبيق
        getWindow().getDecorView().setImportantForAutofill(
                View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
        );

        // الوصول إلى WebView وتعطيل جميع قوائم النظام
        WebView webView = this.getBridge().getWebView();
        if (webView != null) {
            // تعطيل Long Click
            webView.setOnLongClickListener(v -> true);
            webView.setLongClickable(false);
            webView.setHapticFeedbackEnabled(false);
            
            // تعطيل Autofill
            webView.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO);
            
            // تعطيل Context Menu
            webView.setOnCreateContextMenuListener(null);
            
            // إعدادات WebView لتعطيل التحديد
            webView.getSettings().setTextZoom(100);
            webView.getSettings().setSupportZoom(false);
            webView.getSettings().setBuiltInZoomControls(false);
            webView.getSettings().setDisplayZoomControls(false);
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
                }
            }

            @Override
            public void onFailure(Call<HealthResponse> call, Throwable t) {
                Log.e("Careerak_API", "Connection Error: " + t.getMessage());
            }
        });
    }
}

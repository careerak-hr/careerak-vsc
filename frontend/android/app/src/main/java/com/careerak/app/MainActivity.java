package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
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

        // نبراس: تعطيل Smart Text Actions و Clipboard Overlay على مستوى التطبيق كله لضمان عدم ظهور فقاعة Translate/Paste
        getWindow().getDecorView().setImportantForAutofill(
                View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
        );

        // نبراس: الوصول إلى WebView وتعطيل الـ Long Click لمنع ظهور قوائم النظام المنبثقة
        WebView webView = this.getBridge().getWebView();
        if (webView != null) {
            webView.setOnLongClickListener(v -> true);
            webView.setLongClickable(false);
            webView.setHapticFeedbackEnabled(false);
            
            // نبراس: تعطيل Autofill بشكل إضافي على الـ WebView نفسه
            webView.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO);
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

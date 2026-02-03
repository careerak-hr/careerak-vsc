package com.careerak.app;

import android.os.Bundle;
import android.util.Log;
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

        // اختبار الاتصال بالسيرفر عند بدء التشغيل
        checkBackendConnection();
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

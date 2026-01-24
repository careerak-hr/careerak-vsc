package com.careerak.app.network;

import com.careerak.app.models.HealthResponse;
import retrofit2.Call;
import retrofit2.http.GET;

public interface ApiService {

    @GET("api/health")
    Call<HealthResponse> checkServer();
}

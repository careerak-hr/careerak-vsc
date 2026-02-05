package com.careerak.app.models;

import com.google.gson.annotations.SerializedName;

public class HealthResponse {
    @SerializedName("status")
    private String status;

    @SerializedName("server")
    private String server;

    public String getStatus() {
        return status;
    }

    public String getServer() {
        return server;
    }
}

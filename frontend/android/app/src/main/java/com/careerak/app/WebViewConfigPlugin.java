package com.careerak.app;

import android.webkit.WebSettings;
import android.webkit.WebView;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WebViewConfig")
public class WebViewConfigPlugin extends Plugin {

    @PluginMethod
    public void configureForInputs(PluginCall call) {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                getActivity().runOnUiThread(() -> {
                    WebSettings settings = webView.getSettings();
                    
                    // إعدادات أساسية للتفاعل
                    settings.setJavaScriptEnabled(true);
                    settings.setDomStorageEnabled(true);
                    settings.setDatabaseEnabled(true);
                    
                    // إعدادات النماذج
                    settings.setSaveFormData(true);
                    settings.setSavePassword(false);
                    
                    // إعدادات التفاعل
                    webView.setFocusable(true);
                    webView.setFocusableInTouchMode(true);
                    
                    // إعدادات اللمس
                    webView.setClickable(true);
                    webView.setLongClickable(true);
                    
                    // تفعيل Hardware Acceleration
                    webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
                    
                    Log.d("WebViewConfig", "WebView configured for input interaction");
                });
                
                call.resolve();
            } else {
                call.reject("WebView not available");
            }
        } catch (Exception e) {
            Log.e("WebViewConfig", "Error configuring WebView: " + e.getMessage());
            call.reject("Configuration failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void forceEnableInputs(PluginCall call) {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                getActivity().runOnUiThread(() -> {
                    // تشغيل JavaScript لإجبار تفعيل الحقول
                    String jsCode = 
                        "document.querySelectorAll('input, select, textarea').forEach(function(el) {" +
                        "  el.style.pointerEvents = 'auto';" +
                        "  el.style.cursor = el.tagName === 'SELECT' ? 'pointer' : 'text';" +
                        "  el.style.userSelect = 'text';" +
                        "  el.style.webkitUserSelect = 'text';" +
                        "  el.style.touchAction = 'manipulation';" +
                        "  el.removeAttribute('disabled');" +
                        "  el.removeAttribute('readonly');" +
                        "  console.log('Enabled input: ' + el.name + ' (' + el.type + ')');" +
                        "});";
                    
                    webView.evaluateJavascript(jsCode, null);
                    Log.d("WebViewConfig", "Force enabled all inputs via JavaScript");
                });
                
                call.resolve();
            } else {
                call.reject("WebView not available");
            }
        } catch (Exception e) {
            Log.e("WebViewConfig", "Error force enabling inputs: " + e.getMessage());
            call.reject("Force enable failed: " + e.getMessage());
        }
    }
}
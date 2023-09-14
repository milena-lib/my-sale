package com.partner;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

public class UtilsModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext _reactContext = null;
    private TelephonyManager tm;

    public UtilsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
        tm = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
    }

    @NonNull
    @Override
    public String getName() {
        return "PartnerUtils";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("DEVICE_ID", getDeviceId());

        return constants;
    }

    private String getDeviceId() {
        try {
            String deviceId = Settings.Secure.getString(_reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);

            if (!TextUtils.isEmpty(deviceId) && !deviceId.equals("null")) {
                return deviceId;
            }

            String m_szDevIDShort = "35"
                    + // we make this look like a valid IMEI
                    Build.BOARD.length() % 10 + Build.BRAND.length() % 10 + Build.CPU_ABI.length() % 10 + Build.DEVICE.length() % 10 +
                    Build.DISPLAY.length() % 10 + Build.HOST.length() % 10 + Build.ID.length() % 10 + Build.MANUFACTURER.length() % 10 +
                    Build.MODEL.length() % 10 + Build.PRODUCT.length() % 10 + Build.TAGS.length() % 10 + Build.TYPE.length() % 10 +
                    Build.USER.length() % 10; // 13 digits

            return m_szDevIDShort;
        } catch (Exception exc) {
            return "";
        }
    }

    @SuppressLint({"MissingPermission", "HardwareIds"})
    @ReactMethod
    public void getImei(Promise promise) {
        if (!hasPermission()) {
            promise.reject(new RuntimeException("Missing permission " + Manifest.permission.READ_PHONE_STATE));
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                promise.resolve(getDeviceId());
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    promise.resolve(tm.getImei());
                } else {
                    promise.resolve(tm.getDeviceId());
                }
            }
        }
    }

    private boolean hasPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return _reactContext.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        } else return true;
    }
}

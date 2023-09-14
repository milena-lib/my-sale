package com.sunmi.scanner;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SunmiScannerModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext _reactContext = null;

    //constructor
    public SunmiScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "SunmiScanner";
    }

    @ReactMethod
    public void start(final Callback cb) {
        try {
            Scanner scanner = Scanner.getScanner();
            boolean result = scanner.start(_reactContext);

            if (result) {
                cb.invoke("success");
            } else {
                cb.invoke("fail");
            }
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }

    @ReactMethod
    public void stop(final Callback cb) {
        try {
            Scanner scanner = Scanner.getScanner();
            scanner.stop(_reactContext);

            cb.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }

    @ReactMethod
    public void scan(final Callback cb) {
        try {
            Scanner scanner = Scanner.getScanner();
            scanner.scan();

            cb.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }

    @ReactMethod
    public void stopScan(final Callback cb) {
        try {
            Scanner scanner = Scanner.getScanner();
            scanner.stopScan();

            cb.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }
}

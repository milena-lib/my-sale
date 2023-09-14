package com.caspit.pinpad;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.pdac.caspit.emv.core.Pcl;
import com.pdac.caspit.emv.core.Status;

public class CaspitPinpadModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext _reactContext = null;

    //constructor
    public CaspitPinpadModule(ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "CaspitPinpad";
    }

    @ReactMethod
    public void start(int connectionType, boolean serviceLogEnabled, final Callback cb) {
        try {
            Pcl pcl = Pcl.getLib();
            pcl.start(_reactContext, connectionType, serviceLogEnabled);
            cb.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }

    @ReactMethod
    public void destroy(final Callback cb) {
        try {
            Pcl pcl = Pcl.getLib();
            pcl.destroy(_reactContext);
            cb.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            cb.invoke("fail", e.getMessage());
        }
    }

    @ReactMethod
    public void restart(int connectionType, boolean serviceLogEnabled, final Callback cb) {
        try {
            Pcl pcl = Pcl.getLib();
            boolean result = pcl.restart(_reactContext, connectionType, serviceLogEnabled);
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
    public void request(String xmlRequest, final Callback cb) {
        Pcl.getLib().request(xmlRequest, new Pcl.RequestListener() {
            @Override
            public void onResult(Status status, String result) {
                cb.invoke(status.toString(), result);
            }

            @Override
            public void onFailure(Status status) {
                cb.invoke(status.toString());
            }
        });
    }

    @ReactMethod
    public void isCompanionConnected(final Callback cb) {
        cb.invoke(Pcl.getLib().isCompanionConnected());
    }

    @ReactMethod
    public void getBatteryLevelTask(final Callback cb) {
        Pcl.getLib().runGetBatteryLevel(new Pcl.RequestListener() {
            @Override
            public void onResult(Status status, String result) {
                cb.invoke(status.toString(), result);
            }

            @Override
            public void onFailure(Status status) {
                cb.invoke(status.toString());
            }
        });
    }
}
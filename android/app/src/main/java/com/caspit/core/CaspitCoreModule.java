package com.caspit.core;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static android.content.ContentValues.TAG;

public class CaspitCoreModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private ReactApplicationContext _reactContext = null;
    private Callback onActivityResultCallback = null;

    private static final int REQUEST_TRANSACTION = 6600;
    private static String CASPIT_RESPONSE_EXTRA = "CASPIT_RESPONSE_EXTRA";

    //constructor
    public CaspitCoreModule(ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
        _reactContext.addActivityEventListener(this);
    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "CaspitCore";
    }

    @ReactMethod
    public void request(String xmlRequest, final Callback cb) {
        Intent intent = new Intent();
        intent.setClassName("caspit.core", "caspit.core.ui.activities.URLSchemeActivity");
        intent.putExtra("REQUEST_XML", xmlRequest);
        onActivityResultCallback = cb;
        _reactContext.startActivityForResult(intent, REQUEST_TRANSACTION, null);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.e(TAG, "onActivityResult: Requestor reqCode -> " + requestCode + ", resultCode ->" + resultCode + ", -> "+ data);
        if(data == null){
            return;
        }
        Bundle bundle = data.getExtras();
        if (bundle != null) {
            for (String key : bundle.keySet()) {
                Log.e(TAG, "Result Extra Requestor -> "+key + " : " + (bundle.get(key) != null ? bundle.get(key) : "NULL"));
            }
        }
        if (requestCode == REQUEST_TRANSACTION) {
            final String result = data.getStringExtra(CASPIT_RESPONSE_EXTRA);
            Log.d("TAG", "onActivityResult: Requestor data.getStringExtra -> " + result);
            if (resultCode == Activity.RESULT_OK) {
                onActivityResultCallback.invoke("success", result);
            }
            if (resultCode == Activity.RESULT_CANCELED) {
                onActivityResultCallback.invoke("canceled", result);
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {

    }
}

package com.sunmi.scanner;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.pdac.caspit.emv.core.Status;


public class Scanner {
    private static final String TAG = "Scanner";
    private static final Scanner scanner = new Scanner();
    private static IScanInterface scanInterface = null;
    private BroadcastReceiver receiver = null;
    private boolean isServiceBounded;

    private static final String ACTION_DATA_CODE_RECEIVED = "com.sunmi.scanner.ACTION_DATA_CODE_RECEIVED";
    private static final String DATA = "data";

    private static ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            scanInterface = IScanInterface.Stub.asInterface(service);
            Log.i(TAG, "Scanner Service Connected!");
        }
        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.e(TAG, "Scanner Service Disconnected!");
            scanInterface = null;
        }
    };

    public interface RequestListener {
        void onResult(Status status, String result);

        void onFailure(Status status);
    }

    public static Scanner getScanner() {
        return scanner;
    }

    public boolean start(Context context) {
        registerReceiver(context);
        bindScannerService(context);
        return true;
    }

    public void stop(Context context) {
        unregisterReceiver(context);
        unbindScannerService(context);
    }

    public void scan() {
        try {
            scanInterface.scan();
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    public void stopScan() {
        try {
            scanInterface.stop();
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    private void bindScannerService(Context context) {
        Intent intent = new Intent();
        intent.setPackage("com.sunmi.scanner");
        intent.setAction("com.sunmi.scanner.IScanInterface");
        isServiceBounded = context.bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);
    }

    private void unbindScannerService(Context context) {
        try {
            if (isServiceBounded && mServiceConnection != null) {
                context.unbindService(mServiceConnection);
                isServiceBounded = false;
                Log.i(TAG, "Service is unbounded! successfully [unknown]");
            } else {
                Log.e(TAG, "Attempt to unbound service that is not bounded");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void registerReceiver(Context context) {
        try {
            if (receiver == null) {
                receiver = new ScannerReceiver((ReactApplicationContext)context);
                IntentFilter filter = new IntentFilter();
                filter.addAction(ACTION_DATA_CODE_RECEIVED);
                context.registerReceiver(receiver, filter);
                Log.i(TAG, "Receiver is registered");
            } else {
                Log.e(TAG,"Attempt to register receiver that is already registered");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void unregisterReceiver(Context context) {
        try {
            if (receiver != null) {
                context.unregisterReceiver(receiver);
                receiver = null;
                Log.w(TAG, "Receiver is unregistered");
            } else {
                Log.e(TAG, "Attempt to unregister state receiver that is not registered");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private class ScannerReceiver extends BroadcastReceiver {

        private ReactApplicationContext _reactContext = null;

        public ScannerReceiver(ReactApplicationContext reactContext) {
            _reactContext = reactContext;
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            String code = intent.getStringExtra(DATA);

            if (_reactContext != null) {
                _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onReceiveBarcode", code);
            }
        }
    }
}

package com.pdac.caspit.emv.core;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.ingenico.pclservice.PclService;
import com.ingenico.pclservice.TransactionIn;
import com.ingenico.pclservice.TransactionOut;
import com.ingenico.pclutilities.PclUtilities;
import com.ingenico.pclutilities.SslObject;
import com.pdac.caspit.emv.PclConnectionListener;
import com.pdac.caspit.emv.bluetooth.PclBluetoothConnection;
import com.pdac.caspit.emv.debug.Debug;
import com.pdac.caspit.emv.debug.Type;
import com.pdac.caspit.emv.serial.PclSerialConnection;
import com.pdac.caspit.emv.usb.PclUsbConnection;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 * This class is used to manage connection to pcl device using the INGENICO PCL library
 *
 * @author Alexander Kamenkov
 */

public class Pcl {
	private static final Pcl mCoreInstance = new Pcl();
	private static final String TAG = mCoreInstance.getClass().getSimpleName();

	public static final int USB_CONNECTION_TYPE = 0;
	public static final int BLUETOOTH_CONNECTION_TYPE = 1;
	public static final int SERIAL_CONNECTION_TYPE = 2;

	private ServiceConnection mServiceConnection;
	private PclUsbConnection mPclUsbConnection;
	private PclBluetoothConnection mPclBluetoothConnection;
	private PclSerialConnection mPclSerialConnection;
	private StateReceiver mStateReceiver;
	private PclService mService;
	private PclUtilities mUtilities;

	private static final int FINAL_TIMEOUT_FOR_REQUEST = 60 * 1000; // seconds
	private Handler mRequestTimeoutHandler;

	private String mRequestEncoding;
	private String mResponseEncoding;
	private int mApplicationNumber;
	private String mTerminalId;


	private boolean isPclReady;
	private boolean isServiceConnected;
	private boolean isServiceBounded;
	private boolean isServiceStarted;

	private Pcl() {
		mRequestEncoding = Defaults.DEFAULT_REQUEST_ENCODING;
		mResponseEncoding = Defaults.DEFAULT_RESPONSE_ENCODING;
		mApplicationNumber = Defaults.DEFAULT_APP_NUMBER;
	}

	public static Pcl getLib() {
		return mCoreInstance;
	}

	public boolean restart(Context context, final int connectionType, boolean serviceLogEnabled) {
		stop(context);
		start(context, connectionType, serviceLogEnabled);
		return true;
	}

	public void start(final Context context, final int connectionType, final boolean serviceLogEnabled) {
		if (isPclReady){
			return;
		}

		if (mUtilities == null) {
			mUtilities = new PclUtilities(context, context.getPackageName(), "pairing_addr.txt");
		}

		PclConnectionListener pclConnectionListener = new PclConnectionListener() {
			@Override
			public void onDeviceConnected() {
				start(context, serviceLogEnabled);
			}
		};

		switch (connectionType) {
			case USB_CONNECTION_TYPE:
				if (mPclUsbConnection == null) {
					mPclUsbConnection = new PclUsbConnection(context, mUtilities);
					mPclUsbConnection.setConnectionListener(pclConnectionListener);
				}

				mPclUsbConnection.searchForUsbDevices();
				break;

			case BLUETOOTH_CONNECTION_TYPE:
				if (mPclBluetoothConnection == null) {
					mPclBluetoothConnection = new PclBluetoothConnection(mUtilities);
					mPclBluetoothConnection.setConnectionListener(pclConnectionListener);
				}

				mPclBluetoothConnection.searchForBluetoothDevices();
				break;

			case SERIAL_CONNECTION_TYPE:
				if (mPclSerialConnection == null) {
					mPclSerialConnection = new PclSerialConnection(mUtilities);
					mPclSerialConnection.setConnectionListener(pclConnectionListener);
				}

				mPclSerialConnection.searchForSerialDevices();
				break;
		}
	}

	public boolean isCompanionConnected()
	{
		boolean bRet = false;
		if (mService != null)
		{
			byte result[] = new byte[1];
			{
				if (mService.serverStatus(result) == true)
				{
					if (result[0] == 0x10)
						bRet = true;
				}
			}
		}
		return bRet;
	}

	private void stop(Context context) {
		unregisterStateReceiver(context);
		unbindService(context);
		stopService(context);
	}

	private void start(Context context, boolean serviceLogEnabled) {
		registerStateReceiver(context);
		startService(context, serviceLogEnabled);
		bindService(context, serviceLogEnabled);
	}

	public void destroy(Context context) {
		if (mPclUsbConnection != null) {
			mPclUsbConnection.unregisterUsbReceiver();
		}
		stop(context);
	}

	public void setApplicationNumber(int applicationNumber) {
		mApplicationNumber = applicationNumber;
	}

	public void setTerminalId(String terminalId) {
		mTerminalId = terminalId;
	}

	public void setRequestEncoding(String requestEncoding) {
		mRequestEncoding = requestEncoding;
	}

	public void setResponseEncoding(String responseEncoding) {
		mResponseEncoding = responseEncoding;
	}

	private void bindService(Context context, boolean isLogEnabled) {
		try {
			if (!isServiceBounded) {
				SslObject sslObject = new SslObject(Constant.SSL.P12_SERVER_B, Constant.SSL
						.COUCOU);

				Intent bindServiceIntent = new Intent(context, PclService.class);
				bindServiceIntent.putExtra(Constant.Extras.PACKAGE_NAME, context.getPackageName());
				bindServiceIntent.putExtra(Constant.Extras.FILE_NAME, Constant.Params
						.PAIRING_FILE);
				bindServiceIntent.putExtra(Constant.Extras.SSL_OBJECT, sslObject);
				bindServiceIntent.putExtra(Constant.Extras.ENABLE_LOG, isLogEnabled);

				mServiceConnection = new ServiceConnection();
				isServiceBounded = context.bindService(
						bindServiceIntent, mServiceConnection, Context.BIND_AUTO_CREATE);

				Debug.log(TAG, Type.WARNING, "Service is bounded! successfully [" +
						isServiceBounded + "]");
				} else {
				Debug.log(TAG, Type.ERROR, "Attempt to bound service that is already bounded");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void unbindService(Context context) {
		try {
			if (isServiceBounded && mServiceConnection != null) {
				context.unbindService(mServiceConnection);
				isServiceBounded = false;
				Debug.log(TAG, Type.WARNING, "Service is unbounded! successfully [unknown]");
			} else {
				Debug.log(TAG, Type.ERROR, "Attempt to unbound service that is not bounded");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void startService(Context context, boolean isLogEnabled) {
		if (!isServiceStarted) {
			SslObject sslObject = new SslObject(Constant.SSL.P12_SERVER_B, Constant.SSL.COUCOU);

			Intent bindServiceIntent = new Intent(context, PclService.class);
			bindServiceIntent.putExtra(Constant.Extras.PACKAGE_NAME, context.getPackageName());
			bindServiceIntent.putExtra(Constant.Extras.FILE_NAME, Constant.Params.PAIRING_FILE);
			bindServiceIntent.putExtra(Constant.Extras.SSL_OBJECT, sslObject);
			bindServiceIntent.putExtra(Constant.Extras.ENABLE_LOG, isLogEnabled);

			if (context.startService(bindServiceIntent) != null) {
				isServiceStarted = true;
			}
			Debug.log(TAG, Type.WARNING, "Service is started! successfully [" + isServiceStarted +
					"]");
		} else {
			Debug.log(TAG, Type.ERROR, "Attempt to start service that is already started");
		}
	}

	private void stopService(Context context) {
		if (isServiceStarted) {
			Intent i = new Intent(context, PclService.class);

			if (context.stopService(i)) {
				isServiceStarted = false;
			}

			Debug.log(TAG, Type.WARNING, "Service is stopped! successfully [" + !isServiceStarted
					+ "]");
		} else {
			Debug.log(TAG, Type.ERROR, "Attempt to stop service that is already stopped");
		}
	}

	private void registerStateReceiver(Context context) {
		try {
			if (mStateReceiver == null) {
				mStateReceiver = new StateReceiver((ReactApplicationContext)context);
				IntentFilter intentfilter = new IntentFilter(Constant
						.INGENICO_STATE_CHANGED_FILTER);
				context.registerReceiver(mStateReceiver, intentfilter);
				Debug.log(TAG, Type.WARNING, "State receiver is registered");
			} else {
				Debug.log(TAG, Type.ERROR, "Attempt to register state receiver that is already " +
						"registered");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void unregisterStateReceiver(Context context) {
		try {
			if (mStateReceiver != null) {
				context.unregisterReceiver(mStateReceiver);
				mStateReceiver = null;
				Debug.log(TAG, Type.WARNING, "State receiver is unregistered");
			} else {
				Debug.log(TAG, Type.ERROR, "Attempt to unregister state receiver that is not " +
						"registered");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private class ServiceConnection implements android.content.ServiceConnection {

		public void onServiceConnected(ComponentName className, IBinder boundService) {
			PclService.LocalBinder binder = (PclService.LocalBinder) boundService;
			mService = binder.getService();
			isServiceConnected = true;
			mService.addDynamicBridgeLocal(6000, 0);
			Debug.log(TAG, Type.WARNING, "Service connection status [connected]");
		}

		public void onServiceDisconnected(ComponentName className) {
			mService = null;
			isServiceConnected = false;
			Debug.log(TAG, Type.WARNING, "Service connection status [disconnected]");
		}
	}

	private class StateReceiver extends BroadcastReceiver {

		private ReactApplicationContext _reactContext = null;

		public StateReceiver(ReactApplicationContext reactContext) {
			_reactContext = reactContext;
		}

		public void onReceive(Context context, Intent intent) {
			String state = intent.getStringExtra("state");
			Debug.log(TAG, Type.WARNING, "Service state changed to " + state);

			if ("DISCONNECTED".equals(state)) {
				isPclReady = false;
			} else if ("CONNECTED".equals(state)) {
				isPclReady = true;
			}

			if (_reactContext != null) {
				_reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
						     .emit("onPinpadStateChange", isPclReady);
			}
		}
	}

	public void request(final String xmlRequest, final RequestListener requestListener) {
		Log.d(TAG, "begin request");

		Runnable runnable = new Runnable() {
			@SuppressWarnings("StringBufferReplaceableByString")
			@Override
			public void run() {
				try {
					byte[] inputBuffer = xmlRequest.getBytes(mRequestEncoding);
					byte[] outputBuffer = new byte[16000];

					TransactionIn transactionIn = new TransactionIn();
					TransactionOut transactionOut = new TransactionOut();

					boolean successfulTransaction = mService.doTransactionEx(
							transactionIn,
							transactionOut,
							mApplicationNumber,
							inputBuffer,
							inputBuffer.length,
							outputBuffer,
							new long[]{outputBuffer.length});

					String response = new String(outputBuffer, mResponseEncoding).trim();

					if (successfulTransaction) {
						requestListener.onResult(Status.SUCCESS, response);
					} else {
						requestListener.onFailure(Status.FAIL);
					}

				}
				catch (Exception e) {
					Debug.log(TAG, Type.INFO, "Transaction failed with exception");
					e.printStackTrace();
					requestListener.onResult(Status.FAIL, null);
				}
				finally {
					mRequestTimeoutHandler.removeCallbacksAndMessages(null);
				}
			}
		};

		Debug.log(TAG, Type.INFO, "Starting transaction, please wait to response");

		final Thread thread = new Thread(runnable);
		thread.start();

		if (mRequestTimeoutHandler != null) {
			mRequestTimeoutHandler.removeCallbacksAndMessages(null);
		} else {
			mRequestTimeoutHandler = new Handler();
		}

		mRequestTimeoutHandler.postDelayed(new Runnable() {
			@Override
			public void run() {
				thread.interrupt();
			}
		}, FINAL_TIMEOUT_FOR_REQUEST);
	}

	public interface RequestListener {

		//@CallSuper
		void onResult(Status status, String result);

		void onFailure(Status status);
	}

	public void runGetBatteryLevel(RequestListener requestListener) {
		new GetBatteryLevelTask(requestListener).execute();
	}

	class GetBatteryLevelTask extends AsyncTask<Void, Void, Boolean> {
		private int[] level;
		RequestListener _requestListener;

		GetBatteryLevelTask(RequestListener requestListener) {
			level = new int[1];
			this._requestListener = requestListener;
		}

		protected Boolean doInBackground(Void... tmp) {
			Boolean bRet = false;
			if (mService != null) {
				bRet = mService.getBatteryLevel(level);
			}
			return bRet;
		}

		protected void onPostExecute(Boolean result) {

			if (result == true)
			{
				this._requestListener.onResult(com.pdac.caspit.emv.core.Status.SUCCESS, String.valueOf(level[0]));
			}
			else
			{
				this._requestListener.onResult(com.pdac.caspit.emv.core.Status.FAIL, "N/A");
			}
		}
	}
}
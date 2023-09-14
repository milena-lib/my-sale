package com.pdac.caspit.emv.usb;

import android.annotation.TargetApi;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;

import com.ingenico.pclutilities.PclUtilities;
import com.pdac.caspit.emv.PclConnectionListener;
import com.pdac.caspit.emv.debug.Debug;
import com.pdac.caspit.emv.debug.Type;
import com.pdac.caspit.utils.LogUtil;

import java.util.Set;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 *  Class to handle USB PCL connection
 *
 * @author Alexander Kamenkov
 */

public class PclUsbConnection {
	private static final String TAG = PclUsbConnection.class.getSimpleName();
	private static final String ACTION_USB_PERMISSION = "PclUsbConnection.USB_PERMISSION";
	private PclConnectionListener mPclConnectionListener;
	private BroadcastReceiver mUsbReceiver;
	private PendingIntent mPermissionIntent;
	private UsbManager mUsbManager;
	private PclUtilities mPclUtil;
	private Context mContext;

	private boolean mPermissionRequested;
	private boolean mPermissionGranted;

	/**
	 * Class constructor, that is register the USB state receiver {@link #registerUsbReceiver}.
	 *
	 * @param context      Context
	 * @param pclUtilities Ingenico library class
	 */
	public PclUsbConnection(Context context, PclUtilities pclUtilities) {
		mContext = context;
		mPclUtil = pclUtilities;
		registerUsbReceiver();
	}

	/**
	 * This method will register the USB state receiver if its not registered yet.
	 * The state receiver will respond to {@link UsbManager#ACTION_USB_DEVICE_ATTACHED},
	 * {@link UsbManager#ACTION_USB_DEVICE_DETACHED} and {@link #ACTION_USB_PERMISSION} actions.
	 */
	private void registerUsbReceiver() {
		mUsbManager = (UsbManager) mContext.getSystemService(Context.USB_SERVICE);
		if (mUsbManager != null) {
			if (mUsbReceiver == null) {
				mUsbReceiver = new PclUsbReceiver();
				mPermissionIntent = PendingIntent
						.getBroadcast(mContext, 0, new Intent(ACTION_USB_PERMISSION), 0);
				IntentFilter usbFilter = new IntentFilter(ACTION_USB_PERMISSION);
				usbFilter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
				usbFilter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
				mContext.registerReceiver(mUsbReceiver, usbFilter);
				Debug.log(TAG, Type.WARNING, "State receiver is registered");
			} else {
				Debug.log(TAG, Type.ERROR, "Attempt to register state receiver that is already " +
						"registered");
			}
		}
	}

	/**
	 * This method will unregister the USB state receiver
	 * if receiver is registered.
	 */
	public void unregisterUsbReceiver() {
		try {
			if (mUsbReceiver != null) {
				mContext.unregisterReceiver(mUsbReceiver);
				mUsbReceiver = null;
				Debug.log(TAG, Type.WARNING, "State receiver is unregistered");
			} else {
				Debug.log(TAG, Type.ERROR, "Attempt to unregister state receiver that is not " +
						"registered");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Registering the connection interface.
	 * When USB device is finally connected and handed over to {@link PclUtilities} class,
	 * this interface will notify the client.
	 */
	public void setConnectionListener(PclConnectionListener pclConnectionListener) {
		mPclConnectionListener = pclConnectionListener;
	}

	/**
	 * This method will search for attached Ingenico devices.
	 * Request the USB permissions for those devices that do not have permissions yet.
	 * Broadcast receiver for USB permissions {@link PclUsbReceiver}
	 */
	public void searchForUsbDevices() {
		Set<UsbDevice> setOfUsbDevices = mPclUtil.getUsbDevices();
		if (setOfUsbDevices != null && !setOfUsbDevices.isEmpty()) {
			for (UsbDevice usbDevice : setOfUsbDevices) {
				LogUtil.i("checking permission for " + usbDevice.toString());
				if (!mUsbManager.hasPermission(usbDevice)
						&& !mPermissionRequested && !mPermissionGranted) {
					mPermissionRequested = true;
					LogUtil.i( "request permission for " + usbDevice.toString());
					mUsbManager.requestPermission(usbDevice, mPermissionIntent);
				} else {
					PclUtilities.UsbCompanion usbCompanion = mPclUtil.getUsbCompanion(usbDevice);
					if (usbCompanion == null) {
						Debug.log(TAG, Type.ERROR, usbDevice.toString() + " cannot be companion.");
						continue;
					}
					boolean activateUsbCompanion = usbCompanion.activate();
					Debug.log(TAG, Type.WARNING, "Usb companion " +
							"[" + usbCompanion.getName() + "] activated! " +
							"successfully [" + activateUsbCompanion + "]");

					if (activateUsbCompanion) {
						if (mPclConnectionListener != null) {
							mPclConnectionListener.onDeviceConnected();
							return;
						}
					}
				}
			}
		}
	}

	/**
	 * Broadcast receiver for USB permissions.
	 * Request is coming from the USB search method {@link #searchForUsbDevices},
	 * for those devices that do not have permissions yet.
	 * This receiver is target only for the attached Ingenico devices.
	 */
	private class PclUsbReceiver extends BroadcastReceiver {

		@TargetApi(Build.VERSION_CODES.HONEYCOMB_MR1)
		public void onReceive(Context context, Intent intent) {

			UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
			if (device == null || !PclUtilities.isIngenicoUsbDevice(device)) return;

			switch (intent.getAction()) {
				case UsbManager.ACTION_USB_DEVICE_ATTACHED:
					synchronized (this) {
						Debug.log(TAG, Type.ERROR, "Usb device " +
								"[" + device.getDeviceName() + "] attached! ");
						//searchForUsbDevices();
					}
					break;

				case UsbManager.ACTION_USB_DEVICE_DETACHED:
					synchronized (this) {
						Debug.log(TAG, Type.ERROR, "Usb device " +
								"[" + device.getDeviceName() + "] detached! ");
					}
					break;

				case ACTION_USB_PERMISSION:
					synchronized (this) {
						boolean permissionGranted =
								intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);
						Debug.log(TAG, Type.WARNING, "Permission for " +
								"[" + device.getDeviceName() + "] is "
								+ (permissionGranted ? "granted" : "refused"));

						if (permissionGranted) {
							searchForUsbDevices();
							mPermissionGranted = true;
						}

						mPermissionRequested = false;
					}
					break;
			}
		}
	}
}

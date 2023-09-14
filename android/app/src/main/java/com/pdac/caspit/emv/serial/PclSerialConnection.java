package com.pdac.caspit.emv.serial;

import android.os.Handler;
import android.util.Log;

import com.ingenico.pclutilities.PclUtilities;
import com.pdac.caspit.emv.PclConnectionListener;

import java.util.Set;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 *  Class to handle serial PCL connection
 *
 * @author Alexander Kamenkov
 */

public class PclSerialConnection {
	private static final String TAG = PclSerialConnection.class.getSimpleName();
	private static final String TTYS3 = "/dev/ttyHSL3"; //Ronen: 03/12/19 "/dev/ttyHSL1";
	private PclConnectionListener mPclConnectionListener;
	private PclUtilities mPclUtil;

	public PclSerialConnection(PclUtilities pclUtilities) {
		mPclUtil = pclUtilities;
	}

	public void setConnectionListener(PclConnectionListener pclConnectionListener) {
		mPclConnectionListener = pclConnectionListener;
	}

	public void searchForSerialDevices() {
		Log.i(TAG, "searchForSerialDevices() was called" );
		Set<String> serialPorts = mPclUtil.getSerialPortDevices();
		if (serialPorts == null || serialPorts.isEmpty()) return;

		for (final String port : serialPorts) {
			if (!port.startsWith(TTYS3)) continue;

			new Handler().postDelayed(new Runnable() {
				@Override
				public void run() {

					PclUtilities.SerialPortCompanion companion = mPclUtil.getSerialPortCompanion(port);
					mPclUtil.activateSerialPortCompanion(port, port);
					mPclConnectionListener.onDeviceConnected();
				}
			},3000);

			return;
		}
	}
}

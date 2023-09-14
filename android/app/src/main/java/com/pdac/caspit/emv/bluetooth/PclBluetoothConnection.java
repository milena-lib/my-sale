package com.pdac.caspit.emv.bluetooth;

import com.ingenico.pclutilities.PclUtilities;
import com.pdac.caspit.emv.PclConnectionListener;

import java.util.Set;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 * Class to handle bluetooth PCL connection
 *
 * @author Alexander Kamenkov
 */

public class PclBluetoothConnection {
	private static final String TAG = PclBluetoothConnection.class.getSimpleName();
	private PclConnectionListener mPclConnectionListener;
	private PclUtilities mPclUtil;

	public PclBluetoothConnection(PclUtilities pclUtilities) {
		mPclUtil = pclUtilities;
	}

	public void setConnectionListener(PclConnectionListener pclConnectionListener) {
		mPclConnectionListener = pclConnectionListener;
	}

	public void searchForBluetoothDevices() {
		Set<PclUtilities.BluetoothCompanion> pairedCompanions = mPclUtil.GetPairedCompanions();

		if (pairedCompanions != null && !pairedCompanions.isEmpty()) {
			for (PclUtilities.BluetoothCompanion bluetoothCompanion : pairedCompanions) {
				String bluetoothCompanionAddress = bluetoothCompanion.getBluetoothDevice().getAddress();

				if (bluetoothCompanionAddress != null) {
					mPclUtil.ActivateCompanion(bluetoothCompanionAddress);
					mPclConnectionListener.onDeviceConnected();
					return;
				}
			}
		}
	}
}

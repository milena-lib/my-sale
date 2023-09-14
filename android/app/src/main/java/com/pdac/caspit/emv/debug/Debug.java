package com.pdac.caspit.emv.debug;

import android.util.Log;

/**
 * Created by P.D.A.C. Technologies LTD.
 * @author Alexander Kamenkov
 */

public class Debug {

	private static final String NULL = "Null";

	@SuppressWarnings("WeakerAccess")
	public static boolean isDebug = true;

	/**
	 * This debug method prints log into logcat.
	 * @param object object to print (.toString() is called on this object).
	 */
	public static void log(String tag, Type type, Object object) {
		//if (!isDebug) return;

		String message = (object == null ? NULL : object.toString()) + "\n ";

		switch (type) {
			case ERROR: Log.e(tag, message); break;
			case VERBOSE: Log.v(tag, message); break;
			case INFO: Log.i(tag, message); break;
			case DEBUG: Log.d(tag, message); break;
			case WARNING: Log.w(tag, message); break;
		}
	}

	public static void log(String tag, Type type, Object objToPrint, int depth) {
		String depthSpace = "";
		for (int i = 0; i < depth; i++) {
			depthSpace += "      ";
		}

		log(tag, type, depthSpace + objToPrint.toString());
	}
}

package com.pdac.caspit.utils;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.preference.PreferenceManager;
import android.util.DisplayMetrics;
import android.util.Log;

import java.io.UnsupportedEncodingException;
import java.util.Locale;


public class Global extends Application {
	public static Global self;
	public static long gTimeStarted;
	public boolean isEmv;
	public GeneralData g_GeneralData;
	public boolean isPclReady = false;

	public void WriteToLog(String text)
	{
		Log.d("Global",text);
	}

	public void WriteToLog(byte[] buffer)
	{
		StringBuffer result = new StringBuffer();
		for (byte b : buffer) {
		    result.append(String.format("%02X ", b));
		    result.append(" "); // delimiter
		}
		//Log.d("Global","Array = " + result.toString());
		try {
			Log.d("Global",new String(buffer,"utf-8"));
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * Called when user change configurations when the app is running.
	 * */
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		lockLanguage();
	}

	/**
	 * Lock system language to prevent RTL Text and layouts switching.
	 * */
	private void lockLanguage() {
		LogUtil.i("DEVICE LOCALE: " + getResources().getConfiguration().locale.getLanguage());
		SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
		Locale locale = new Locale(preferences.getString(Constants.PREF_LANG_LOCALE, "iw"));
		LogUtil.i("Lock locale: "+locale);
		Locale.setDefault(locale);
		Configuration config = new Configuration();
		config.locale = locale;
		this.getApplicationContext().getResources().updateConfiguration(config, null);
	}

	@SuppressLint("MissingSuperCall")
	public void onCreate()
	{
		gTimeStarted=System.currentTimeMillis();
		lockLanguage();
		//isEmv = true;
		if (PreferenceManager.getDefaultSharedPreferences(this).getInt(Constants.PREF_USE_EMV, 1)==1){
			isEmv = true;
		} else {
			isEmv = false;
		}

		g_GeneralData = new GeneralData();
		self = this;
	}

	public void setLocale(String lang,Activity caller,boolean base) { 
		Log.d(this.getClass().getName(), "setLocale");
		Locale myLocale = new Locale(lang); 
	    Resources res = getResources(); 
	    DisplayMetrics dm = res.getDisplayMetrics(); 
	    Configuration conf = res.getConfiguration(); 
	    conf.locale = myLocale; 
	    res.updateConfiguration(conf, dm); 
	   
	    SharedPreferences dbData =  PreferenceManager.getDefaultSharedPreferences(Global.self.getApplicationContext());
	    dbData.edit().putString("local", lang).apply();

	    
	} 
}

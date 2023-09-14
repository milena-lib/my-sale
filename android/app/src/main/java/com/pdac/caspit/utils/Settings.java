package com.pdac.caspit.utils;

import android.content.SharedPreferences;

public class Settings {
	static String PrefName = "Settings";
	public static void StoreStringValue(String Key,String Value)
	{
		SharedPreferences.Editor editor = Global.self.getSharedPreferences(PrefName, 0).edit();
		editor.putString(Key, Value);
		editor.apply();
	}
	public static void StoreIntValue(String Key,int Value)
	{
		SharedPreferences.Editor editor = Global.self.getSharedPreferences(PrefName, 0).edit();
		editor.putInt(Key, Value);
		editor.apply();
	}
	public static void StorelongValue(String Key,long Value)
	{
		SharedPreferences.Editor editor = Global.self.getSharedPreferences(PrefName, 0).edit();
		editor.putLong(Key, Value);
		editor.apply();
	}
	public static void StoreBooleanValue(String Key,boolean Value)
	{
		SharedPreferences.Editor editor = Global.self.getSharedPreferences(PrefName, 0).edit();
		editor.putBoolean(Key, Value);
		editor.apply();
	}
	public static void StoreFloatValue(String Key,float Value)
	{
		SharedPreferences.Editor editor = Global.self.getSharedPreferences(PrefName, 0).edit();
		editor.putFloat(Key, Value);
		editor.apply();
	}
	
	public static String GetStringValue(String key,String def){
		return Global.self.getSharedPreferences(PrefName, 0).getString(key, def);
	}
	public static boolean GetBooleanValue(String key,boolean def){
		return Global.self.getSharedPreferences(PrefName, 0).getBoolean(key, def);
	}
	public static int GetIntValue(String key,int def){
		return Global.self.getSharedPreferences(PrefName, 0).getInt(key, def);
	}
	public static long GetLongValue(String key,int def){
		return Global.self.getSharedPreferences(PrefName, 0).getLong(key, def);
	}
	public static float GetFloatValue(String key,float def){
		return Global.self.getSharedPreferences(PrefName, 0).getFloat(key, def);
	}
}

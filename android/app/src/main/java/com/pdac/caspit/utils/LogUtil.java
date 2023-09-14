package com.pdac.caspit.utils;

import android.net.Uri;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.Nullable;

import com.mysale.app.BuildConfig;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * Created by Pavel on 18-Feb-17.
 * Logging utility
 */

public class LogUtil {
    private static String TAG = "LogUtil";
    private static String LOG_FILE_NAME = "caspit_log.txt";       //replace with your own
    private static String LOG_FILE_PATH = "/Caspit_log_dir";      //replace with your own
    private static final SimpleDateFormat df = new SimpleDateFormat("dd-MM-yy HH:mm:ss.S");
    private static final int LOG_LEVEL_FOR_CLASS_IN_THREAD = 4;   //change this if not getting the correct class name in log
    private static final boolean WRITE_LOG = true;
    private static final boolean WRITE_FILE = false;



        private static boolean createLogFile() {
            if (isExternalStorageWritable()) {
                File sdCard = Environment.getExternalStorageDirectory();
                File directory = new File(sdCard.getAbsolutePath() + LOG_FILE_PATH);
                //create directory if not exist
                boolean dirOk = false;
                if (!directory.isDirectory()) {
                    dirOk = directory.mkdirs();
                } else {
                    dirOk = true;
                }
                //create file
                boolean fileOk = false;
                if (dirOk) {
                    File logFile = new File(directory, LOG_FILE_NAME);
                    if (!logFile.exists()) {
                        try {
                            Calendar cal = Calendar.getInstance();
                            String formattedDateStrt = df.format(cal.getTime());
                            FileWriter writer = new FileWriter(logFile);
                            writer.append("Log file created at " + formattedDateStrt + "\n");
                            writer.flush();
                            writer.close();
                            fileOk = true;
                        } catch (FileNotFoundException e) {
                            e.printStackTrace();
                            fileOk = false;
                        } catch (IOException e) {
                            e.printStackTrace();
                            fileOk = false;
                        }
                    } else {
                        fileOk = true;
                    }
                }
                return fileOk;
            } else {
                return false;
            }
        }

        private static boolean isExternalStorageWritable() {
            String state = Environment.getExternalStorageState();
            if (Environment.MEDIA_MOUNTED.equals(state)) {
                return true;
            }
            return false;
        }

        public static void d(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.d(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-DBG", logMsg);
        }

        public static void e(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.e(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-ERR", logMsg);
        }

        public static void i(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.i(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-INF", logMsg);
        }

        public static void v(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.v(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-VERB", logMsg);
        }

        public static void w(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.w(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-WARN", logMsg);
        }

        //write log file disregarding the setting
        public static void wo(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            Log.wtf(logTag, logMsg);
            writeToLog(logTag + "-WTF", logMsg);
        }


        public static void wtf(@Nullable String logMsg) {
            String logTag = getClassNameAndLineNumber();
            //FirebaseCrash.log(logTag+" "+ logMsg);
            if (writeLog())
                Log.wtf(logTag, logMsg);
            if (WRITE_FILE)
                writeToLog(logTag + "-WTF", logMsg);
        }


        private static synchronized void writeToLog(@Nullable String logTag, @Nullable String logMsg) {
            File sdCard = Environment.getExternalStorageDirectory();
            File directory = new File(sdCard.getAbsolutePath() + LOG_FILE_PATH);
            File logFile = new File(directory, LOG_FILE_NAME);
            if (!logFile.exists()) {
                createLogFile();
            }
            Calendar cal = Calendar.getInstance();
            String formattedDate = df.format(cal.getTime());
            try {
                BufferedWriter writer = new BufferedWriter(new FileWriter(logFile, true));
                writer.append(formattedDate + " - " + logTag + " - " + logMsg);
                writer.newLine();
                writer.flush();
                writer.close();
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        private static String getClassNameAndLineNumber() {
            int lineNumber = Thread.currentThread().getStackTrace()[LOG_LEVEL_FOR_CLASS_IN_THREAD].getLineNumber();
            String fullClassName = Thread.currentThread().getStackTrace()[LOG_LEVEL_FOR_CLASS_IN_THREAD].getClassName();
            String className = fullClassName.substring(fullClassName.lastIndexOf(".") + 1);
            return className + ":line "+lineNumber;
        }


        public static boolean delLogFile() {
            File sdCard = Environment.getExternalStorageDirectory();
            File directory = new File(sdCard.getAbsolutePath() + LOG_FILE_PATH);
            File logFile = new File(directory, LOG_FILE_NAME);
            boolean success = false;
            if (logFile.exists()) {
                success = logFile.delete();
            }
            return success;

        }

        public static Uri getLogUri() {
            File sdCard = Environment.getExternalStorageDirectory();
            File directory = new File(sdCard.getAbsolutePath() + LOG_FILE_PATH);
            File logFile = new File(directory, LOG_FILE_NAME);
            boolean success = false;
            if (logFile.exists()) {
                return Uri.fromFile(logFile);
            } else return null;
        }

        private static boolean writeLog(){
            if ("release".equals(BuildConfig.BUILD_TYPE)){
                return false;
            }else{
                return true;
            }

        }

    }

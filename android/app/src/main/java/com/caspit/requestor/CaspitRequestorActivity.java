package com.caspit.requestor;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;
import static android.content.ContentValues.TAG;

public class CaspitRequestorActivity extends AppCompatActivity {
    private static final int REQUEST_TRANSACTION = 6600;
    private static String CASPIT_RESPONSE_EXTRA = "CASPIT_RESPONSE_EXTRA";

    private void sendRequestViaIntent(String request_xml) {
        Intent myIntent = new Intent();
        myIntent.setClassName("caspit.core", "caspit.core.ui.activities.URLSchemeActivity");
        myIntent.putExtra("REQUEST_XML",request_xml);
        startActivityForResult(myIntent, REQUEST_TRANSACTION);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
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
            if (resultCode == Activity.RESULT_OK) {
                final String results = data.getStringExtra(CASPIT_RESPONSE_EXTRA);
                Log.d("TAG", "onActivityResult: Requestor data.getStringExtra -> " + data.getStringExtra(CASPIT_RESPONSE_EXTRA));
                if (!results.equals("")) {
                    Log.d("TAG", "onActivityResult: Requestor" + data.getStringExtra(CASPIT_RESPONSE_EXTRA));
                    data.getStringExtra(CASPIT_RESPONSE_EXTRA);
                } else {
                }
            }
            if (resultCode == Activity.RESULT_CANCELED) {
            }
        }
    }

}

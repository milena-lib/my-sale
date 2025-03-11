import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    CUSTOM_IMEI_KEY_NAME
} from '../constants/General';

import DeviceInfo from 'react-native-device-info';

class customImei {
    static async getImei() {
        /*
        console.log('customImei.getItem');
        const imei = await AsyncStorage.getItem(CUSTOM_IMEI_KEY_NAME);
        console.log('customImei.setItem');
        await AsyncStorage.setItem(CUSTOM_IMEI_KEY_NAME, "imei");
        return 'aaaaaa';
        */
        try {
           // console.log('customImei.getImei');
        //    return '47bf7d95-8153-4bdb-898b-3c9aebac93e9';
            // return '123456789012345';

            let imei = await AsyncStorage.getItem(CUSTOM_IMEI_KEY_NAME);
            if (imei == null || imei == '' || imei == 'imei') {
                imei = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
                           .replace(/[xy]/g, function (c) {
                               const r = Math.random() * 16 | 0,
                                   v = c == 'x' ? r : (r & 0x3 | 0x8);
                               return v.toString(16);
                           });
                console.log('customImei.imei new');
                await AsyncStorage.setItem(CUSTOM_IMEI_KEY_NAME, imei);
                 
            } else {
                console.log('imei: ' + imei);
                console.log('customImei.imei old');
            }
            // alert("IMEI: " + imei);
            console.log('IMEI: ' + imei);

            /**********************milena test */
            /*
                // Get the device's unique ID (IMEI on Android, IDFV on iOS)
                const uniqueId = DeviceInfo.getUniqueId();
                //alert('Unique ID:' + uniqueId); //[object Object]
              //  alert('Unique ID:' + JSON.stringify(uniqueId)); //{"_h":0,"_i":0,"_j":null,"_k":null}

                // Get the device's model (e.g., iPhone X, Samsung Galaxy S10)
                const deviceModel = DeviceInfo.getModel();
            //    alert('Device Model:' + deviceModel); //SM-X306B

                // Get the device's brand (e.g., Apple, Samsung)
                const deviceBrand = DeviceInfo.getBrand();
            //    alert('Device Brand:' + deviceBrand); //samsung

                // Get the device's system name (e.g., iOS, Android)
                const systemName = DeviceInfo.getSystemName();
           //     alert('System Name:' + systemName); //Android

                // Get the device's system version (e.g., 14.5, 11)
                const systemVersion = DeviceInfo.getSystemVersion();
                alert('System Version:' + systemVersion); //14

                const deviceId = DeviceInfo.getDeviceId();
                alert('DeviceId:' + deviceId); //s5e8835

                const androidId = DeviceInfo.getAndroidId();
                alert('AndroidId:' + JSON.stringify(androidId)); //{"_h":0,"_i":0,"_j":null,"_k":null}

                const serialNum = DeviceInfo.getSerialNumber();
                alert('SerialNum:' + JSON.stringify(serialNum)); //{"_h":0,"_i":0,"_j":null,"_k":null}

                const instanceId = DeviceInfo.getInstanceId();
                alert('InstanceId:' + JSON.stringify(instanceId)); //{"_h":0,"_i":0,"_j":null,"_k":null}

                const fingerprint = DeviceInfo.getFingerprint();
                alert('Fingerprint:' + JSON.stringify(fingerprint)); //{"_h":0,"_i":0,"_j":null,"_k":null}

                const firstInstallTime = DeviceInfo.getFirstInstallTime();
                alert('FirstInstallTime:' + JSON.stringify(firstInstallTime)); //{"_h":0,"_i":0,"_j":null,"_k":null}
*/
                /**********************END milena test */



            return imei;
        }catch (err) {
       //     console.alert("General error in getImei: " + err.message);
            return null;
        }
    }
}

export default customImei;
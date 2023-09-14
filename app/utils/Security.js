import { Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import Api from '../api/api';
import {
    APP_VERSION, APP_NAME, ORIGIN_URL, ADAPTER_HANDLER_URL, UPDATE_INSTALL_PAGE_URL,
    ENCRYPTION_KEY, GUID_KEY_NAME, CHECK_GUID_URL
} from '../constants/General';

var CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);


class Security {
    static getSecuredGuid(guid) {
        try {
            let encryptedlogin = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(guid), key,
                {
                    keySize: 128 / 8,
                    //keySize: 256 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });

            return String(encryptedlogin);
        }
        catch (err) {
            console.log("Error on getting secured guid:" + err.message);
        }
    }

    static async validateAllGuids() {
        try {
            const guid = await AsyncStorage.getItem(GUID_KEY_NAME);
            if (guid !== null) {
                const securedGuid = Security.getSecuredGuid(guid);

                let params = {
                    strUrl: CHECK_GUID_URL,
                    strLogInfo: {},
                    strParams: {
                        guid: guid,
                        strSecuredGuid: securedGuid,
                        application: APP_NAME,
                        module: null,
                    }
                };
                return await Api.postByUrl(ORIGIN_URL + ADAPTER_HANDLER_URL, params
                ).then(async resp => {
                    let isValid = await Security.validateAllGuidsCallBack(resp);
                    if (isValid) {
                        Api.sessionGuid = params.strParams.guid;
                        Api.sessionSecuredGuid = params.strParams.strSecuredGuid;
                    }
                    return isValid;
                }).catch((ex) => {
                    console.log('Error sending request for validateAllGuids: ' + ex.message);
                    return false;
                });
            } else {
                return false;
            }
        }
        catch (err) {
            console.alert("General error in validateAllGuids: " + err.message);
            return false;
        }
    }

    static async validateAllGuidsCallBack(data) {
        var success = false;
        try {
            if (data != null && data != "") {
                if (data != null && (data.CheckGuidAndAppAuthorizationResult != null || data.CheckGuidAndAppAuthorizationByApplicationResult != null)) {
                    if (data.CheckGuidAndAppAuthorizationResult == null)
                        data.CheckGuidAndAppAuthorizationResult = data.CheckGuidAndAppAuthorizationByApplicationResult;

                    if (data.CheckGuidAndAppAuthorizationResult.Details != "" && data.CheckGuidAndAppAuthorizationResult.Details != null) {
                        Alert.alert("אירעה שגיאה בבדיקת ההזדהות, אנא נסה שנית יותר מאוחר");
                    }
                    else if (!data.CheckGuidAndAppAuthorizationResult.IsGuidValid) {

                    }
                    else if (1 == 0 && !data.CheckGuidAndAppAuthorizationResult.IsInstallTokenMatch) {
                        Alert.alert("אירעה שגיאה בזיהוי ההתקנה, יש להסיר את ההתקנה, ולהתקין מחדש את האפליקציה דרך אתר האינטראנט");
                    }
                    else {
                        // checking if should install a new version
                        if (data.CheckGuidAndAppAuthorizationResult.LastAppVersion != null && data.CheckGuidAndAppAuthorizationResult.LastAppVersion != "" && data.CheckGuidAndAppAuthorizationResult.LastAppVersion != APP_VERSION) {

                            if (data.CheckGuidAndAppAuthorizationResult.ForceInstallVersion) {
                                Alert.alert("ישנה גירסה חדשה לאפליקציה, באפשרותך להוריד אותה כעת");
                                WebBrowser.openBrowserAsync(UPDATE_INSTALL_PAGE_URL);
                                BackHandler.exitApp();
                            }
                            else {
                                success = true;
                                Alert.alert(
                                    'גירסא חדשה!',
                                    'ישנה גירסה חדשה לאפליקציה, האם ברצונך להוריד אותה כעת?',
                                    [
                                        { text: 'ביטול', onPress: () => { return true; }, style: 'cancel' },
                                        {
                                            text: 'עדכון', onPress: () => {
                                                WebBrowser.openBrowserAsync(UPDATE_INSTALL_PAGE_URL);
                                                BackHandler.exitApp();
                                            }
                                        },
                                    ],
                                    { cancelable: true }
                                )
                            }
                        }
                        else {
                            success = true;
                            //OnAllGuidsAreValidated();
                        }
                    }
                }
                else {
                    Alert.alert("אירעה שגיאה בבדיקת ההזדהות - 1");
                }
            }
            else {
                Alert.alert("אירעה שגיאה בבדיקת ההזדהות - 2");
            }
        } catch (err) {
            Alert.alert("אירעה שגיאה בבדיקת ההזדהות:" + err.message + " - " + data);
        } finally {
            return success;
        }
    }
}

export default Security;
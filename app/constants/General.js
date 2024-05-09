import Constants from 'expo-constants';
import * as Device from 'expo-device';

const APP_VERSION = '3.1.1';
const APP_NAME = 'MySale';
const TEST_MODE = Constants.manifest.name.toLowerCase().search('test') !== -1;
console.log("Name: " +Constants.manifest.name)
const IS_P2_LITE_DEVICE = Device.modelName.toLowerCase() === 'p2lite';

var ORIGIN_URL = '';
var HOST_SERVER_URL = '';

if (!TEST_MODE) {
    ORIGIN_URL = 'https://mysale.partner.co.il';
    HOST_SERVER_URL = ORIGIN_URL + '/MySaleT1/ServiceT1.asmx';
} else {
    if (Constants.isDevice) { // Real device
        //ORIGIN_URL = 'http://82.102.160.42';
        ORIGIN_URL = 'https://partnerapptst.partner.co.il';
    } else { // Emulator
        // ORIGIN_URL = 'http://10.0.2.2';
        ORIGIN_URL = 'https://partnerapptst.partner.co.il';
    }

    HOST_SERVER_URL = ORIGIN_URL + '/MySale/MySaleT1/ServiceT1.asmx';
}

const UPDATE_INSTALL_PAGE_URL = 'https://intranet.partner.co.il/MobileNotificationsT1/webpages/install/InstallAppPageMySale.aspx';
const ENCRYPTION_KEY = '4985263258154785';
const GUID_KEY_NAME = 'GUID';
const ADAPTER_HANDLER_URL = '/Partner.Core/Partner.Adapters/AjaxHandler.ashx';
const GET_GUID_SEND_SMS_URL = '/Partner.Core/Partner.Services/Service.svc/AuthenticationSSL/GetGuid_sendSMS';
const GET_GUID_BY_SMS_AND_APP_URL = '/Partner.Core/Partner.Services/Service.svc/AuthenticationSSL/GetGuidBySmsByApplication';
const CHECK_GUID_URL = '/Partner.Core/Partner.Services/Service.svc/AuthenticationSSL/CheckGuidAndAppAuthorizationByApplication';
const USER_DETAILS_KEY_NAME = 'USER_DETAILS';
const CONNECTED_AS_KEY_NAME = 'CONNECTED_AS';
const GENERAL_PARAMS_KEY_NAME = 'GENERAL_PARAMS';
const ORG_UNIT_CODE_KEY_NAME = 'ORG_UNIT_CODE';
const AUTHENTICATION_TIME_KEY_NAME = 'AUTHENTICATION_TIME';

export {
    APP_VERSION,
    APP_NAME,
    ORIGIN_URL,
    HOST_SERVER_URL,
    TEST_MODE,
    UPDATE_INSTALL_PAGE_URL,
    ENCRYPTION_KEY,
    GUID_KEY_NAME,
    ADAPTER_HANDLER_URL,
    GET_GUID_SEND_SMS_URL,
    GET_GUID_BY_SMS_AND_APP_URL,
    CHECK_GUID_URL,
    USER_DETAILS_KEY_NAME,
    CONNECTED_AS_KEY_NAME,
    GENERAL_PARAMS_KEY_NAME,
    ORG_UNIT_CODE_KEY_NAME,
    AUTHENTICATION_TIME_KEY_NAME,
    IS_P2_LITE_DEVICE
};

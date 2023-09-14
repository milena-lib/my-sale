import GlobalHelper from '../utils/globalHelper';
import { ORIGIN_URL, HOST_SERVER_URL, TEST_MODE } from '../constants/General';
import Consts from '../constants/Consts';

console.log('HOST_SERVER_URL -> ' + HOST_SERVER_URL);

var _sessionGuid = '';
var _sessionSecuredGuid = '';

class Api {
  static headers() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      dataType: 'json',
      'X-Requested-With': 'XMLHttpRequest',
      'Guid': _sessionGuid,
      'Secured-Guid': _sessionSecuredGuid,
      'Mobile-Install-Token': '', // maybe for future use
      'Connected-As': GlobalHelper.connectedAsIdNumber
    }
  }

  static get sessionGuid() {
    return _sessionGuid;
  }

  static set sessionGuid(val) {
    _sessionGuid = val;
  }

  static get sessionSecuredGuid() {
    return _sessionSecuredGuid;
  }

  static set sessionSecuredGuid(val) {
    _sessionSecuredGuid = val;
  }
  
  static get(route) {
    return this.xhr(route, null, 'GET');
  }

  static post(route, params) {
    return this.xhr(`${HOST_SERVER_URL}${route}`, params, 'POST');
  }

  static postByUrl(route, params) {
    route = TEST_MODE ? `${'http://82.102.160.42'}${route.substring(route.search('/Partner.Core'), route.length)}` :
      `${'https://intranet.partner.co.il'}${route.substring(route.search('/Partner.Core'), route.length)}`;
    return this.xhr(route, params, 'POST');
  }

  static xhr(url, params, verb) {
    params = Object.assign({}, params, { strCurrentOrgUnit: GlobalHelper.orgUnitCode });

    let options = Object.assign({ method: verb }, params ? { body: JSON.stringify(params) } : null);
    options.headers = Api.headers();
    console.log("Called URL "+ url)
    console.log(params);

    return fetch(url, options).then(resp => {
      let json = resp.json();
      if (resp.ok) {
        return json;
      }
      return json.then(err => {
        console.log("ERROR:")
        console.log(err)
        const lastSlashIndex = url.lastIndexOf("/");
        const funcName = url.substring(lastSlashIndex + 1, url.length);
        const data = {
          "d": {
            "IsSuccess": false,
            "ErrorMessage": "Global exception calling " + funcName + ", " + err.Message,
          }
        };
        if (!url.includes("WriteToLog")) { //Prevent a recursion when WriteToLog fails
          this.writeToLog(Consts.logErrorStatus, funcName, params,
            "Client side: Error while fetching in API Post, resp.status = " + resp.status + ", err.Message = " + err.Message,
            true);
        }

        return Promise.resolve(data);
      });
    }).catch((ex) => {
      console.log(ex);
      const lastSlashIndex = url.lastIndexOf("/");
      const funcName = url.substring(lastSlashIndex + 1, url.length);
      const data = { "d": { "IsSuccess": false, "ErrorMessage": "Global exception calling " + funcName + ", " + ex.message, } };
      if (!url.includes("WriteToLog")) { //Prevent a recursion when WriteToLog fails
        this.writeToLog(Consts.logErrorStatus, funcName, params,
          "Client side: Error while fetching in API Post, err.Message = " + ex.message,
          true);
      }
      return Promise.resolve(data);
    });;
  }

  static writeToLog(status, url, params, info, writeToTextLog) {
    Api.post('/WriteToLog', {
      strStatus: status, strUrl: url, strParams: JSON.stringify(params),
      strInfo: info, isWriteToTextLog: writeToTextLog
    }).then(resp => {
    }).catch((ex) => {
      console.log(ex);
    });
  };
}

export default Api;

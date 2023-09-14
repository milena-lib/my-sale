import Api from '../api/api';

class Logger {
    static writeToLog(status, url, params, info, writeToTextLog) {    
        Api.post('/WriteToLog', { strStatus: status, strUrl: url, strParams: JSON.stringify(params),
            strInfo: info, isWriteToTextLog: writeToTextLog
        }).then(resp => {
        }).catch( (ex) => {
            console.log(ex);
        });
    };
}

export default Logger;
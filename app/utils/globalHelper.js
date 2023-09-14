let _deviceId = '';
let _connectedAsIdNumber = '';
let _orgUnitCode = '';
let _loginId = '';
let _cartId = '';
let _emvMode = false;
let _terminalId = '';
let _termNo = '';

class GlobalHelper {
    // static writeToLog(status, url, params, info, writeToTextLog) {    
    //   Api.post('/WriteToLog', { strStatus: status, strUrl: url, strParams: params,
    //     strInfo: info, isWriteToTextLog: writeToTextLog
    //   }).then(resp => {
    //   }).catch( (ex) => {
    //     console.log(ex);
    //   });
    // };

    static getValOrNull(val) {
        if (!val) {
            return null;
        }
        return val;
    }

    static validateIdNum(idNumber) {
        var tot = 0;
        var tz = new String(idNumber);

        if (tz.length < 9) {
            for (let i = 0; i < 9 - tz.length; i++) {
                tz = '0' + tz;
            }
        }

        for (i = 0; i < 8; i++) {
            x = (((i % 2) + 1) * tz.charAt(i));
            if (x > 9) {
                x = x.toString();
                x = parseInt(x.charAt(0)) + parseInt(x.charAt(1))
            }
            tot += x;
        }

        if ((tot + parseInt(tz.charAt(8))) % 10 == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    static isEmailValid(textEmail) {
        if (textEmail) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!regex.test(textEmail)) {
                return false;
            }
            return true;
        }
        return false;
    }

    static get deviceId() {
        return _deviceId;
    }

    static set deviceId(deviceId) {
        _deviceId = deviceId;
    }

    static get connectedAsIdNumber() {
        return _connectedAsIdNumber;
    }

    static set connectedAsIdNumber(connectedAsIdNumber) {
        _connectedAsIdNumber = connectedAsIdNumber;
    }

    static get orgUnitCode() {
        return _orgUnitCode;
    }

    static set orgUnitCode(orgUnitCode) {
        _orgUnitCode = orgUnitCode;
    }

    static get loginId() {
        return _loginId;
    }

    static set loginId(loginId) {
        _loginId = loginId;
    }

    static get cartId() {
        return _cartId;
    }

    static set cartId(cartId) {
        _cartId = cartId;
    }

    static get emvMode() {
        return _emvMode;
    }

    static set emvMode(emvMode) {
        _emvMode = emvMode;
    }

    static get terminalId() {
        return _terminalId;
    }

    static set terminalId(terminalId) {
        _terminalId = terminalId;
    }

    static get termNo() {
        return _termNo;
    }

    static set termNo(termNo) {
        _termNo = termNo;
    }

    static formatNum(num) {
        if (!num) {
            return '';
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    static formatNegativeNum(num) {
        return num >= 0 ? GlobalHelper.formatNum(num) : -1 * num + '-';
    }

    static pad2(n) {
        return n < 10 ? '0' + n : n
    }

    static getTimestampString() {
        var date = new Date();
        let str = date.getFullYear().toString() +
            this.pad2(date.getMonth() + 1) +
            this.pad2(date.getDate()) +
            this.pad2(date.getHours()) +
            this.pad2(date.getMinutes()) +
            this.pad2(date.getSeconds());

        return str;
    }

    static generateSwipeRequest() {
        let request = '<Request><Command>023</Command><TerminalId>' + _terminalId +
            '</TerminalId><TermNo>' + _termNo + '</TermNo><TimeoutInSeconds>90</TimeoutInSeconds><RequestId>' +
            this.getTimestampString() + '</RequestId></Request>';

        return '^PTL!00#00' + request.length.toString(16) + '5202' + request;
    }

    static getXmlNodeValue(xml, nodeName) {
        try {
            return xml.split(nodeName)[1].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        } catch (ex) {
            return '';
        }
    }
}

export default GlobalHelper;
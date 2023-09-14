const globalErrorMessagePrefix = 'אירעה שגיאה כללית, ';
const logInfoStatus = 'INFO';
const logWarningStatus = 'WARNING';
const logErrorStatus = 'ERROR';
const dateDefaultValue = GetCurrentDate();

function GetCurrentDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    return (day < 10 ? '0' : '') + day + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        d.getFullYear();
}

export default {
    globalErrorMessagePrefix,
    logInfoStatus,
    logWarningStatus,
    logErrorStatus,
    dateDefaultValue,
};

import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View, ToastAndroid, Alert, DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as Actions from '../actions';
import {CONNECTED_AS_KEY_NAME, IS_P2_LITE_DEVICE, TEST_MODE} from '../constants/General';
import MyActivityIndicator from '../components/MyActivityIndicator';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import Security from '../utils/Security';
import Caspit from '../utils/Caspit';
import SunmiScanner from '../utils/SunmiScanner';

const PINPAD_TIMEOUT_IN_SECONDS = 30;
let userDetails;

// export class AuthLoadingScreen extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             message: null,
//             progressMessage: 'מתחבר...'
//         }
//
//         this._bootstrapAsync();
//     }
//
//     componentDidMount() {
//         this.pinpadStateListener = DeviceEventEmitter.addListener('onPinpadStateChange', this.onPinpadStateChange);
//     }
//
//     componentWillUnmount() {
//         this.pinpadStateListener.remove();
//     }
//
//     onPinpadStateChange = (pclReady) => {
//         if (pclReady) {
//             this.getGeneralParams(true);
//         }
//     };
//
//     _bootstrapAsync = async () => {
//         let isValidGuid = await Security.validateAllGuids();
//
//         if (!isValidGuid) {
//             this.props.navigation.replace('Auth');
//         } else {
//             try {
//                 const connectedAs = await AsyncStorage.getItem(CONNECTED_AS_KEY_NAME);
//                 if (connectedAs) {
//                     GlobalHelper.connectedAsIdNumber = connectedAs;
//                 }
//             } catch (error) {
//             }
//
//             Api.post('/GetUserDetails', {
//                 strCurrentOrgUnit: GlobalHelper.orgUnitCode,
//                 strIdNum: '',
//                 isCallSetLoginId: false,
//                 strEquipmentCode: ''
//             }).then(async resp => {
//                 let errorMessage = '';
//                 if (resp.d && resp.d.IsSuccess) {
//                     if (resp.d.User) {
//                         AsyncStorage.setItem(CONNECTED_AS_KEY_NAME, resp.d.User.IdNum);
//                         GlobalHelper.connectedAsIdNumber = resp.d.User.IdNum;
//                         if (resp.d.User.IsLoginAllowed) {
//                             try {
//                                 if (GlobalHelper.deviceId) {
//                                     userDetails = resp.d.User;
//                                     console.log('Device Identifier -> ' + GlobalHelper.deviceId);
//                                     Api.post('/GetOrgUnitByEquipment', {strEquipmentCode: GlobalHelper.deviceId}).then(resp => {
//                                         if (resp.d && resp.d.IsSuccess && resp.d.OrgUnit && resp.d.OrgUnit.OrgUnitCode != 'null') {
//                                             this.props.setUserDetails(userDetails);
//                                             this.props.setOrgUnitDetails(resp.d.OrgUnit);
//                                             GlobalHelper.orgUnitCode = resp.d.OrgUnit.OrgUnitCode;
//                                             GlobalHelper.loginId = resp.d.LoginId;
//
//                                             if (resp.d.EmvFlag) {
//                                                 GlobalHelper.terminalId = resp.d.TerminalId;
//                                                 GlobalHelper.termNo = resp.d.TermNo;
//                                                 userDetails.AllowEmvOperations = resp.d.AllowEmvOperations;
//                                                 this.loginWithCaspit();
//                                             } else {
//                                                 this.getGeneralParams(false);
//                                             }
//                                         } else if (!userDetails.IsAdmin) {
//                                             this.props.setUserDetails(userDetails);
//                                             ToastAndroid.show('יש לקשר את המכשיר למרכז', ToastAndroid.SHORT);
//                                             this.props.navigation.navigate('SwitchOU', {
//                                                 fromLogin: true,
//                                                 isAdmin: userDetails.IsAdmin
//                                             });
//                                         } else {
//                                             errorMessage = 'המכשיר אינו מקושר למרכז, נא להתחבר כמנהל מערכת';
//                                             this.props.navigation.navigate('Auth');
//                                         }
//                                     });
//
//                                     Api.post('/AddHit').then(resp => {
//                                     }).catch((ex) => {
//                                         console.log(ex);
//                                     });
//                                 } else {
//                                     errorMessage = 'לא ניתן לפענח את מזהה המכשיר';
//                                 }
//                             } catch (err) {
//                                 errorMessage = 'אירעה שגיאה ' + err;
//                             }
//                         } else {
//                             errorMessage = 'אינך מורשה לאפליקציה';
//                         }
//                     } else {
//                         errorMessage = 'אירעה שגיאה בקבלת פרטי המשתמש';
//                     }
//                 } else {
//                     errorMessage = resp.d.FriendlyMessage;
//                 }
//
//                 if (errorMessage) {
//                     this.setState({message: errorMessage});
//                 }
//             });
//         }
//     };
//
//     getGeneralParams = (isPinpadConnected) => {
//         Api.post('/GetGeneralParams', {
//             strCurrentOrgUnit: GlobalHelper.orgUnitCode,
//             equipmentCode: GlobalHelper.deviceId,
//             isConfig: 'N'
//         }).then(resp => {
//             let res = resp.d;
//             if (res && res.IsSuccess && res.DbParams) {
//                 GlobalHelper.generalParams = res.DbParams;
//                 if (!isPinpadConnected || (!res.DbParams.XML_COMMAND_13 && !res.DbParams.XML_COMMAND_10_6 && !res.DbParams.XML_COMMAND_10_12 && !res.DbParams.XML_COMMAND_10_13)) {
//                     this.props.setSignedIn(true);
//                 } else {
//                     this.sendCommands(res, isPinpadConnected);
//                 }
//             } else {
//                 ToastAndroid.show(res.FriendlyMessage, ToastAndroid.SHORT);
//             }
//         });
//     }
//
//     loginWithCaspit = () => {
//         if (IS_P2_LITE_DEVICE) {
//             SunmiScanner.start((result, error) => {
//                 console.log("Caspit P2LITE")
//                 console.log(result);
//                 console.log(error)
//                 if (result === 'success') {
//                     this.getGeneralParams(true);
//                 } else {
//                     let msg = 'שגיאה באתחול הסורק: ' + error;
//                     Alert.alert(msg);
//                 }
//             });
//
//         } else { // SM-T395
//             this.setState({progressMessage: 'מתחבר לפינפד...'});
//
//             if (Caspit) {
//                 Caspit.isCompanionConnected(isConnected => {
//                     if (isConnected) {
//                         this.getGeneralParams(true);
//                     } else {
//                         Caspit.restart(1, true, (result, error) => {
//                             setTimeout(() => {
//                                 Caspit.isCompanionConnected(isConnected => {
//                                     if (!isConnected) {
//                                         Alert.alert(
//                                             'תקלת פינפד',
//                                             'לא ניתן להתחבר למכשיר הפינפד, יש לוודא שהמכשיר מותאם ודלוק',
//                                             [
//                                                 {text: 'נסה שוב', onPress: () => this.loginWithCaspit()},
//                                                 {
//                                                     text: 'התחבר ללא פינפד', onPress: () => {
//                                                         Alert.alert('התחברות ללא פינפד', 'ניתן יהיה להעביר עסקאות לקופה', [{text: 'אישור'}]);
//                                                         this.getGeneralParams(false);
//                                                     }
//                                                 },
//                                             ],
//                                         );
//                                     } else if (this.state.progressMessage === 'מתחבר לפינפד...') {
//                                         this.getGeneralParams(true);
//                                     }
//                                 });
//                             }, PINPAD_TIMEOUT_IN_SECONDS * 1000);
//                         });
//                     }
//                 });
//             } else {
//                 Alert.alert('תקלה כללית בפינפד', 'חבילת הפינפד אינה תקינה', [{
//                     text: 'אישור', onPress: () => {
//                         this.getGeneralParams(false)//Remove ??
//                     }
//                 }])
//             }
//         }
//     }
//
//     sendCommands = (params, isPinpadConnected) => {
//         let cmd13Resp = null;
//         let cmd10_6Resp = null;
//         let cmd10_12Resp = null;
//         let cmd10_13Resp = null;
//         //console.log(params)
//         if (params.DbParams.XML_COMMAND_13) {
//             this.setState({progressMessage: 'מגדיר מכשיר...'});
//             Caspit.request(params.DbParams.XML_COMMAND_13, (status, resp) => {
//                 cmd13Resp = resp ? resp : '';
//                 this.setState({progressMessage: 'שולח עסקאות...'});
//                 Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
//                     cmd10_12Resp = resp ? resp : '';
//                     this.setState({progressMessage: 'מוחק קובץ עסקאות...'});
//                     Caspit.request(params.DbParams.XML_COMMAND_10_13, (status, resp) => {
//                         cmd10_13Resp = resp ? resp : '';
//                         this.setState({progressMessage: 'מתחבר לשבא...'});
//                         Caspit.request(params.DbParams.XML_COMMAND_10_6, (status, resp) => {
//                             cmd10_6Resp = resp ? resp : '';
//                             this.sendXmls(params, cmd13Resp, cmd10_6Resp, cmd10_12Resp, cmd10_13Resp, isPinpadConnected);
//                         });
//                     });
//                 });
//             });
//         } else if (params.DbParams.XML_COMMAND_10_12) {
//             this.setState({progressMessage: 'שולח עסקאות...'});
//             Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
//                 cmd10_12Resp = resp;
//                 this.sendXmls(params, '', '', cmd10_12Resp, '', isPinpadConnected);
//             });
//         }
//     }
//
//     sendXmls = (params, com13ReplayXML, com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML, isPinpadConnected) => {
//         Api.post('/SendEmvXmlsReplies', {
//             caspitLoginId: params.DbParams.CaspitLoginId, equipmentCode: GlobalHelper.deviceId, com13ReplayXML,
//             com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML
//         }).then(resp => {
//             if (resp.d && resp.d.IsSuccess) {
//                 if (resp.d.RetryEMV) {
//                     this.getGeneralParams(isPinpadConnected);
//                 } else {
//                     GlobalHelper.emvMode = true;
//                     //this.props.navigation.navigate('Main', { isAdmin : userDetails.IsAdmin, allowEmvOperations: userDetails.AllowEmvOperations });
//                     this.props.setSignedIn(true);
//                 }
//             } else if (!resp.d.RetryEMV) {
//                 Alert.alert('התחברות ללא פינפד',
//                     (resp.d.FriendlyMessage ? resp.d.FriendlyMessage : 'שגיאה בביצוע פעולות מול כספיט') + ', ניתן יהיה להעביר עסקאות לקופה', [{text: 'אישור'}]);
//                 //this.props.navigation.navigate('Main', { isAdmin : userDetails.IsAdmin });
//                 this.props.setSignedIn(true);
//             }
//         });
//     }
//
//     render() {
//         return (
//             <View style={styles.container}>
//                 <MyActivityIndicator message={this.state.progressMessage}/>
//                 <StatusBar barStyle="default"/>
//                 {this.state.message &&
//                     <ModalMessage message={this.state.message} onClose={() => this.props.navigation.navigate('Auth')}/>}
//             </View>
//         );
//     }
// }

export default function AuthLoadingScreen(props) {
    const [message, setMessage] = useState(null)
    const [progressMessage, setProgressMessage] = useState("מתחבר...")
    let pinpadStateListener = "";


    useEffect(function () {
        bootstrapAsync();
        pinpadStateListener = DeviceEventEmitter.addListener('onPinpadStateChange', onPinpadStateChange);
        
        return (() => pinpadStateListener.remove())
    
    }, [])


    function onPinpadStateChange(pclReady) {
        if (pclReady) {
            getGeneralParams(true);
        }
    }

    async function bootstrapAsync() {
        let isValidGuid = await Security.validateAllGuids();

        if (!isValidGuid) {
            props.navigation.replace('Auth');
        } else {
            try {
                const connectedAs = await AsyncStorage.getItem(CONNECTED_AS_KEY_NAME);
                if (connectedAs) {
                    GlobalHelper.connectedAsIdNumber = connectedAs;
                }
            } catch (error) {
            }
            
            Api.post('/GetUserDetails', {
                strCurrentOrgUnit: GlobalHelper.orgUnitCode,
                strIdNum: '',
                isCallSetLoginId: false,
                strEquipmentCode: ''
            }).then(async resp => {
                let errorMessage = '';
                if (resp.d && resp.d.IsSuccess) {
                    if (resp.d.User) {
                        await AsyncStorage.setItem(CONNECTED_AS_KEY_NAME, resp.d.User.IdNum);
                        GlobalHelper.connectedAsIdNumber = resp.d.User.IdNum;
                        if (resp.d.User.IsLoginAllowed) {
                            try {
                                if (GlobalHelper.deviceId) {
                                    userDetails = resp.d.User;
                                    console.log('Device Identifier -> ' + GlobalHelper.deviceId);
                                    Api.post('/GetOrgUnitByEquipment', {strEquipmentCode: GlobalHelper.deviceId}).then(resp => {
                                        if (resp.d && resp.d.IsSuccess && resp.d.OrgUnit && resp.d.OrgUnit.OrgUnitCode !== 'null') {
                                            props.setUserDetails(userDetails);
                                            props.setOrgUnitDetails(resp.d.OrgUnit);
                                            GlobalHelper.orgUnitCode = resp.d.OrgUnit.OrgUnitCode;
                                            GlobalHelper.loginId = resp.d.LoginId;

                                            if (resp.d.EmvFlag) {
                                                GlobalHelper.terminalId = resp.d.TerminalId;
                                                GlobalHelper.termNo = resp.d.TermNo;
                                                userDetails.AllowEmvOperations = resp.d.AllowEmvOperations;
                                                loginWithCaspit();
                                            } else {
                                                getGeneralParams(false);
                                            }
                                        } else if (userDetails.IsAdmin) {
                                            console.log('is admin');
                                            props.setUserDetails(userDetails);
                                            ToastAndroid.show('יש לקשר את המכשיר למרכז', ToastAndroid.SHORT);
                                            props.navigation.navigate('SwitchOU', {
                                                fromLogin: true,
                                                isAdmin: userDetails.IsAdmin
                                            });
                                        } else {
                                            errorMessage = 'המכשיר אינו מקושר למרכז, נא להתחבר כמנהל מערכת';
                                            props.navigation.navigate('Auth');
                                        }
                                    });
                                    
                                    Api.post('/AddHit').then(resp => {
                                    }).catch((ex) => {
                                        console.log(ex);
                                    });
                                } else {
                                    errorMessage = 'לא ניתן לפענח את מזהה המכשיר';
                                }
                            } catch (err) {
                                errorMessage = 'אירעה שגיאה ' + err;
                            }
                        } else {
                            errorMessage = 'אינך מורשה לאפליקציה';
                        }
                    } else {
                        errorMessage = 'אירעה שגיאה בקבלת פרטי המשתמש';
                    }
                } else {
                    errorMessage = resp.d.FriendlyMessage;
                }

                if (errorMessage) {
                    setMessage(errorMessage)
                }
            });
        }
    }

    function getGeneralParams(isPinpadConnected) {
        // alert("getGeneralParams isPinpadConnected: " + isPinpadConnected);
        Api.post('/GetGeneralParams', {
            strCurrentOrgUnit: GlobalHelper.orgUnitCode,
            equipmentCode: GlobalHelper.deviceId,
            isConfig: 'N'
        }).then(resp => {
            let res = resp.d;
            // alert('generalParams: ' + JSON.stringify(res));
            if (res && res.IsSuccess && res.DbParams) {
                GlobalHelper.generalParams = res.DbParams;
                // alert('generalParams isPinpadConnected: ' + isPinpadConnected);
                if (!isPinpadConnected || (!res.DbParams.XML_COMMAND_13 && !res.DbParams.XML_COMMAND_10_6 && !res.DbParams.XML_COMMAND_10_12 && !res.DbParams.XML_COMMAND_10_13)) {
                    props.setSignedIn(true);
                } else {
                    sendCommands(res, isPinpadConnected);
                }
            } else {
                ToastAndroid.show(res.FriendlyMessage, ToastAndroid.SHORT);
            }
        });
    }

    function loginWithCaspit() {
        // alert("loginWithCaspit IS_P2_LITE_DEVICE: " + IS_P2_LITE_DEVICE);
        if (IS_P2_LITE_DEVICE) {
            SunmiScanner.start((result, error) => {
                if (result === 'success') {
                    getGeneralParams(true);
                } else {
                    let msg = 'שגיאה באתחול הסורק: ' + error;
                    Alert.alert(msg);
                }
            });

        } else { // SM-T395
            setProgressMessage('מתחבר לפינפד...')
            // alert("loginWithCaspit Caspit: " + JSON.stringify(Caspit));
            if (Caspit) {
                Caspit.isCompanionConnected(isConnected => {
                    // alert("loginWithCaspit isConnected: " + isConnected);
                    if (isConnected) {
                        getGeneralParams(true);
                    } else {
                        Caspit.restart(1, true, (result, error) => {
                            setTimeout(() => {
                                Caspit.isCompanionConnected(isConnected => {
                                    if (!isConnected) {
                                        Alert.alert(
                                            'תקלת פינפד',
                                            'לא ניתן להתחבר למכשיר הפינפד, יש לוודא שהמכשיר מותאם ודלוק',
                                            [
                                                {text: 'נסה שוב', onPress: () => loginWithCaspit()},
                                                {
                                                    text: 'התחבר ללא פינפד', onPress: () => {
                                                        Alert.alert('התחברות ללא פינפד', 'ניתן יהיה להעביר עסקאות לקופה', [{text: 'אישור'}]);
                                                        getGeneralParams(false);
                                                    }
                                                },
                                            ],
                                        );
                                    } else if (progressMessage === 'מתחבר לפינפד...') {
                                        getGeneralParams(true);
                                    }
                                });
                            }, PINPAD_TIMEOUT_IN_SECONDS * 1000);
                        });
                    }
                });
            } else {
                Alert.alert('תקלה כללית בפינפד', 'חבילת הפינפד אינה תקינה', [{
                    text: 'אישור', onPress: () => {
                        getGeneralParams(false)//Remove ??
                    }
                }])
            }
        }
    }

    function sendCommands(params, isPinpadConnected) {
        let cmd13Resp = null;
        let cmd10_6Resp = null;
        let cmd10_12Resp = null;
        let cmd10_13Resp = null;
        if (params.DbParams.XML_COMMAND_13) {
            setProgressMessage('מגדיר מכשיר...')
            Caspit.request(params.DbParams.XML_COMMAND_13, (status, resp) => {
                cmd13Resp = resp ? resp : '';
                setProgressMessage('שולח עסקאות...')
                Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
                    cmd10_12Resp = resp ? resp : '';
                    setProgressMessage('מוחק קובץ עסקאות...')
                    Caspit.request(params.DbParams.XML_COMMAND_10_13, (status, resp) => {
                        cmd10_13Resp = resp ? resp : '';
                        setProgressMessage('מתחבר לשבא...')
                        Caspit.request(params.DbParams.XML_COMMAND_10_6, (status, resp) => {
                            cmd10_6Resp = resp ? resp : '';
                            sendXmls(params, cmd13Resp, cmd10_6Resp, cmd10_12Resp, cmd10_13Resp, isPinpadConnected);
                        });
                    });
                });
            });
        } else if (params.DbParams.XML_COMMAND_10_12) {
            setProgressMessage('שולח עסקאות...')
            Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
                cmd10_12Resp = resp;
                sendXmls(params, '', '', cmd10_12Resp, '', isPinpadConnected);
            });
        }
    }

    function sendXmls(params, com13ReplayXML, com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML, isPinpadConnected) {
        Api.post('/SendEmvXmlsReplies', {
            caspitLoginId: params.DbParams.CaspitLoginId, equipmentCode: GlobalHelper.deviceId, com13ReplayXML,
            com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML
        }).then(resp => {
            if (resp.d && resp.d.IsSuccess) {
                if (resp.d.RetryEMV) {
                    getGeneralParams(isPinpadConnected);
                } else {
                    GlobalHelper.emvMode = true;
                    //this.props.navigation.navigate('Main', { isAdmin : userDetails.IsAdmin, allowEmvOperations: userDetails.AllowEmvOperations });
                    props.setSignedIn(true);
                }
            } else if (!resp.d.RetryEMV) {
                Alert.alert('התחברות ללא פינפד',
                    (resp.d.FriendlyMessage ? resp.d.FriendlyMessage : 'שגיאה בביצוע פעולות מול כספיט') + ', ניתן יהיה להעביר עסקאות לקופה', [{text: 'אישור'}]);
                //this.props.navigation.navigate('Main', { isAdmin : userDetails.IsAdmin });
                props.setSignedIn(true);
            }
        });
    }


    return (
        <View style={styles.container}>
            <MyActivityIndicator message={progressMessage}/>
            <StatusBar barStyle="default"/>
            {message &&
                <ModalMessage message={message} onClose={() => props.navigation.navigate('Auth')}/>}
        </View>
    );

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

exports.AuthLoadingScreenConnectRedux = connect(null, mapDispatchToProps)(AuthLoadingScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

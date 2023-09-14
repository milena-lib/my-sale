import React from 'react';
import { TouchableNativeFeedback, Image, StyleSheet, View, Text, TouchableOpacity, ToastAndroid, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../api/api';
import Security from '../utils/Security';
import {
    APP_NAME, ORIGIN_URL, GUID_KEY_NAME, ADAPTER_HANDLER_URL, GET_GUID_SEND_SMS_URL,
    GET_GUID_BY_SMS_AND_APP_URL, AUTHENTICATION_TIME_KEY_NAME
} from '../constants/General';
import FloatingLabelInput from '../components/FloatingLabelInput';
import MyActivityIndicator from '../components/MyActivityIndicator';
import ModalMessage from '../components/ModalMessage';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';
export default class SignInScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isStep1: true,
            phoneNumber: '',
            code: '',
            errorMessage: null,
            message: null
        };
    }

    sendSMS = async () => {
        if (!this.state.phoneNumber) {
            this.setState({ errorMessage: 'אופס, שכחת להזין מספר...' });
            return;
        } else if (this.state.phoneNumber.length < 10) {
            this.setState({ errorMessage: 'נראה שחסרות פה כמה ספרות...' });
            return;
        } else {
            const regex = /^05[0-9]+$/;
            if (!regex.test(this.state.phoneNumber)) {
                this.setState({ errorMessage: 'זה מספר, אבל לא של טלפון סלולרי :-) ננסה שוב?' });
                return;
            }
        }

        this.setState({ isLoading: true, errorMessage: null });
        let params = {
            strUrl: GET_GUID_SEND_SMS_URL,
            strLogInfo: {},
            strParams: { msisdn: this.state.phoneNumber }
        }
        Api.postByUrl(ORIGIN_URL + ADAPTER_HANDLER_URL, params
        ).then(resp => {
            this.setState({ isLoading: false, errorMessage: null });
            if (resp == null || resp.GetGuid_sendSMSResult == null || resp.GetGuid_sendSMSResult.toLowerCase() != "ok") {
                // in developement the sms is not sent
                if (resp.GetGuid_sendSMSResult != null && resp.GetGuid_sendSMSResult.toLowerCase().indexOf("ok|") >= 0) {
                    ToastAndroid.show('TEST MODE', ToastAndroid.SHORT);
                    // this.setState({ isStep1: false, code: '123456' });
                    // this.checkCode();
                    // Alert.alert("Development mode: " + resp.GetGuid_sendSMSResult);
                }
                else {
                    this.setState({ errorMessage: "אירעה שגיאה בשליחת ה- SMS למספר שהוזן" });
                    console.log('Error while sending SMS: ' + JSON.stringify(resp));
                }
            }

            if (this.state.errorMessage == null) {
                this.setState({ isStep1: false });
            }
        });
    };

    checkCode = async () => {
        if (!this.state.code) {
            this.setState({ errorMessage: 'אופס, שכחת להזין את הקוד...' });
            return;
        } else if (this.state.code.length < 6) {
            this.setState({ errorMessage: 'נראה שחסרות פה כמה ספרות... שלחנו 6 ספרות' });
            return;
        }

        this.setState({ isLoading: true, errorMessage: null });

        let params = {
            strUrl: GET_GUID_BY_SMS_AND_APP_URL,
            strLogInfo: {},
            strParams: { msisdn: this.state.phoneNumber, code: this.state.code, application: APP_NAME }
        };

        let guid = null;

        Api.postByUrl(ORIGIN_URL + ADAPTER_HANDLER_URL, params
        ).then(async (resp) => {
            try {
                this.setState({ errorMessage: null });

                if (resp != null && (resp.GetGuidBySmsResult != null || resp.GetGuidBySmsByApplicationResult != null)) {
                    if (resp.GetGuidBySmsResult == null)
                        resp.GetGuidBySmsResult = resp.GetGuidBySmsByApplicationResult;

                    if (resp.GetGuidBySmsResult.guid != null && resp.GetGuidBySmsResult.guid != "-1" && resp.GetGuidBySmsResult.guid.length > 8) {
                        guid = resp.GetGuidBySmsResult.guid;
                    }
                }

                if (guid == null) {
                    this.setState({ isLoading: false, errorMessage: 'הקוד שהוזן אינו תקין' });
                } else {
                    await AsyncStorage.setItem(GUID_KEY_NAME, guid);
                    let guidIsValid = await Security.validateAllGuids();
                    if (guidIsValid) {
                        await AsyncStorage.setItem(AUTHENTICATION_TIME_KEY_NAME, (new Date()).toISOString());
                        this.props.navigation.push('AuthLoading');
                    } else {
                        this.setState({ isLoading: false, isStep1: true, errorMessage: null, phoneNumber: '', code: '', message: 'שגיאת התחברות, אנא וודא שמספר הטלפון תקין ומורשה' });
                    }
                }
            } catch (error) {
                this.setState({ isLoading: false, errorMessage: 'שגיאת התחברות ' + error?.message });
            }
        });
    };

    render() {
        return (
            <ScrollView contentContainerStyle={styles.scrollView}>
                {this.state.isLoading ?
                    <MyActivityIndicator /> :
                    <View style={styles.contentContainer}>
                        <View style={styles.logoContainer}>
                            <TouchableNativeFeedback onPress={() => ToastAndroid.show(GlobalHelper.deviceId, ToastAndroid.LONG, ToastAndroid.CENTER)}>
                                <Image source={require('../assets/images/LogoMySale.png')} style={{ height: 60, width: 150 }} />
                            </TouchableNativeFeedback>
                        </View>
                        <View style={styles.instructionContainer}>
                            {this.state.isStep1 ? <Text style={styles.boldText}>כל מה שאנחנו צריכים זה את מספר הסלולר שלך</Text> :
                                <Text style={styles.boldText}>שלחנו לך קוד למספר <Text style={MySaleStyle.partnerColor}>{this.state.phoneNumber}</Text> נשמח לקבל אותו חזרה</Text>}
                        </View>
                        <View style={styles.inputContainer}>
                            {this.state.isStep1 ?
                                <View>
                                    <FloatingLabelInput
                                        label='הסלולר שלי הוא'
                                        keyboardType='numeric'
                                        value={this.state.phoneNumber}
                                        textAlign={'right'}
                                        maxLength={10}
                                        onChangeText={phoneNumber => this.setState({ phoneNumber })} />
                                </View>
                                :
                                <View>
                                    <FloatingLabelInput
                                        label='הקוד שקיבלתי הוא'
                                        keyboardType='numeric'
                                        underlineColorAndroid={Colors.partnerColor}
                                        maxLength={6}
                                        value={this.state.code}
                                        autoFocus={true}
                                        textAlign={'right'}
                                        onChangeText={code => this.setState({ code })} />
                                    <TouchableOpacity onPress={this.sendSMS}>
                                        <Text style={styles.sendSMSAgainText}>לא הגיע! שלחו שוב בבקשה</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {this.state.errorMessage && <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>}
                            <View style={styles.buttonContainer}>
                                {!this.state.isStep1 && <View>
                                    <TouchableOpacity onPress={() => this.setState({ isStep1: true, phoneNumber: '' })}>
                                        <Text style={styles.sendSMSAgainText}>חזור</Text>
                                    </TouchableOpacity>
                                </View>}
                                <View style={styles.actionButton}>
                                    <TouchableOpacity style={[MySaleStyle.PartnerButtonBackground, styles.btn]} onPress={this.state.isStep1 ? this.sendSMS : this.checkCode}>
                                        <Text style={styles.btnText}>{this.state.isStep1 ? 'שלחו לי קוד' : 'זהו, סיימנו'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>}
                {this.state.message && <ModalMessage message={this.state.message} onClose={() => this.setState({ message: null })} />}
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingBottom: '20%',
    },
    contentContainer: {
        flex: 1,
        //alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flex: 0.3,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionContainer: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: 40,
        padding: 20
    },
    inputContainer: {
        flex: 0.5,
        paddingHorizontal: 50
    },
    buttonContainer: {
        flex: 0.4,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btn: {
        borderWidth: 3,
        borderColor: '#000',
    },
    btnText: {
        fontSize: 19,
        color: '#000',
        fontFamily: 'simpler-bold-webfont'
    },
    boldText: {
        //color: Colors.partnerColor,
        fontSize: 20,
        lineHeight: 40,
        fontFamily: 'simpler-black-webfont'
    },
    errorMessage: {
        color: 'red',
        paddingTop: 10,
        paddingRight: 30,
        fontFamily: 'simpler-regular-webfont'
    },
    actionButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    sendSMSAgainText: {
        textDecorationLine: 'underline',
        textShadowColor: Colors.partnerColor,
        paddingTop: 10,
        paddingRight: 10,
        textAlign: 'center',
        fontFamily: 'simpler-regular-webfont'
    }
});
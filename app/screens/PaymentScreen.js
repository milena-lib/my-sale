import React from 'react';
import {View, Alert, StyleSheet, Text, AppRegistry, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
import Modal from 'react-native-modal';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import {IS_P2_LITE_DEVICE} from '../constants/General';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Dropdown} from 'react-native-material-dropdown';
import GlobalHelper from '../utils/globalHelper';
// import { AndroidBackHandler } from 'react-navigation-backhandler';
import FloatingLabelInput from '../components/FloatingLabelInput';
import MySignatureCapture from '../components/MySignatureCapture';
import CardReader from '../components/CardReader';
import Consts from '../constants/Consts';
import MySaleStyle from '../constants/Styles';
import Colors from '../constants/Colors';
import UserDetails from '../components/UserDetails';
import RadioGroup from 'react-native-radio-buttons-group';
import MyActivityIndicator from '../components/MyActivityIndicator';
import ModalMessage from '../components/ModalMessage';
import CustInvoiceDetails from '../components/CustInvoiceDetails'
import Camera from '../components/Camera';
import Caspit from '../utils/Caspit';

const PaymentOptions = Object.freeze({
    CREDIT_AUTO: 'CREDIT_AUTO',
    MONTHLY_BILL_INVOICE: 'MONTHLY_BILL_INVOICE',
    SEND_TO_CASHBOX: 'SEND_TO_CASHBOX',
    CREDIT_MANUAL: 'CREDIT_MANUAL',
    CREDIT_AUTO_EMV: 'CREDIT_AUTO_EMV',
    CREDIT_MANUAL_EMV: 'CREDIT_MANUAL_EMV'
});

export class PaymentScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            submitted: false,
            errorMessage: false,
            message: null,
            totalIncVat: '',
            minPayments: null,
            maxPayments: null,
            paymentOptions: null,
            radioPaymentOptions: null,
            radioSelected: 0,
            selectedPaymentOption: {},
            selectedPaymentsNumber: -1,
            cardNum: '',
            exprMonth: '',
            exprYear: '',
            cvv: '',
            cardOwnerIdNum: '',
            cardOwnerName: '',
            signStep: false,
            showCardReaderModal: false,
            validForm: false,
            track2: '',
            isCustInvoiceExpanded: false,
            modalIconName: null,
            onMessageClose: null,
            hideCloseButton: false,
            showLoader: false,
            detailsRequired: null,
            phoneRequired: null,
            idBase64EncodedImage: null,
            eilatResidentBase64EncodedImage: null,
            custName: '',
            custIdType: '',
            custId: '',
            custPhone: '',
            custEmail: '',
            custRemarks: '',
            isMailOnly: '',
            eilatFlag: false,
            isEilatResident: false,
            addressRequired: false,
            cities: [],
            city: '',
            street: '',
            houseNumber: '',
            zipCode: '',
            showCamera: false,
            approversList: [],
            showCheckStatusBtn: false,
            approverNtUserName: '',
            approveMsg: null,
            approveLoading: false,
            approverName: '',
            showManualPermissionBtn: false,
            isSMSOnly: false,
            SMSPhone: '',

        };
    }

    componentDidMount() {
        this.getPaymentOptions();
        this._unsubscribe = this.props.navigation.addListener('focus', () => this.getPaymentOptions());
    }

    componentWillUnmount() {
        this._unsubscribe();
    } 

    getPaymentOptions() {
        this.setState({isLoading: true, message: null});
        Api.post('/GetPaymentOptions', {strCartId: GlobalHelper.cartId}).then(resp => {
            this.setState({isLoading: false});
            if (resp.d && resp.d.IsSuccess && resp.d.PaymentOptionsList.length > 0) {
                let defaultPaymentOption = resp.d.PaymentOptionsList.filter((po) => {
                    return po.PaymentOptionCode === PaymentOptions.CREDIT_AUTO ||
                        po.PaymentOptionCode === PaymentOptions.MONTHLY_BILL_INVOICE ||
                        po.PaymentOptionCode === PaymentOptions.SEND_TO_CASHBOX ||
                        po.PaymentOptionCode === PaymentOptions.CREDIT_AUTO_EMV ||
                        po.PaymentOptionCode === PaymentOptions.CREDIT_MANUAL_EMV
                })[0];

                if (resp.d.AddressRequired) {
                    Api.post('/GetCities').then(resp2 => {
                        if (resp2.d && resp2.d.IsSuccess) {
                            this.setState({
                                totalIncVat: resp.d.PaymentAmount,
                                minPayments: resp.d.MinPayments,
                                maxPayments: resp.d.MaxPayments,
                                paymentOptions: resp.d.PaymentOptionsList,
                                detailsRequired: resp.d.DetailsRequired,
                                phoneRequired: resp.d.phoneRequired,
                                radioPaymentOptions: this.generateRadioOptions(resp.d.PaymentOptionsList),
                                custName: resp.d.CustName,
                                custIdType: resp.d.CustIdType,
                                custId: resp.d.CustId,
                                custEmail: resp.d.CustEmail,
                                selectedPaymentsNumber: resp.d.MaxPayments >= 18 && defaultPaymentOption.PaymentOptionCode === PaymentOptions.MONTHLY_BILL_INVOICE ? resp.d.MaxPayments : resp.d.MinPayments,
                                selectedPaymentOption: defaultPaymentOption,
                                eilatFlag: resp.d.EilatFlag,
                                addressRequired: resp.d.AddressRequired,
                                cities: resp2.d.List
                            });
                        } else {
                            this.showError('אירעה שגיאה בקבלת הערים', resp2);
                        }
                    });
                } else {
                    this.setState({
                        totalIncVat: resp.d.PaymentAmount,
                        minPayments: resp.d.MinPayments,
                        maxPayments: resp.d.MaxPayments,
                        paymentOptions: resp.d.PaymentOptionsList,
                        detailsRequired: resp.d.DetailsRequired,
                        phoneRequired: resp.d.phoneRequired,
                        radioPaymentOptions: this.generateRadioOptions(resp.d.PaymentOptionsList),
                        custName: resp.d.CustName,
                        custIdType: resp.d.CustIdType,
                        custId: resp.d.CustId,
                        custEmail: resp.d.CustEmail,
                        selectedPaymentsNumber: resp.d.MaxPayments >= 18 && defaultPaymentOption.PaymentOptionCode === PaymentOptions.MONTHLY_BILL_INVOICE ? resp.d.MaxPayments : resp.d.MinPayments,
                        selectedPaymentOption: defaultPaymentOption,
                        eilatFlag: resp.d.EilatFlag,
                        addressRequired: resp.d.AddressRequired,
                        cities: null
                    });
                }
            } else {
                let msg = 'אירעה שגיאה בקבלת אפשרויות התשלום';
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                this.setState({
                    message: Consts.globalErrorMessagePrefix + msg, onMessageClose: () => {
                        this.props.navigation.goBack()
                    }
                });
            }
        });
    }

    generateRadioOptions(paymentOptions) {
        let options = [];
        let payLabel = '';
        paymentOptions.forEach((po, index) => {
            switch (po.PaymentOptionCode) {
                case PaymentOptions.CREDIT_AUTO_EMV:
                    payLabel = 'תשלום בכרטיס אשראי' + (po.TextMsg ? " (" + po.TextMsg + ")" : '');
                    options.push({
                        id: index,
                        label: payLabel,
                        value: PaymentOptions.CREDIT_AUTO_EMV,
                        color: Colors.partnerColor,
                        size: 24
                    })
                    break;
                case PaymentOptions.CREDIT_MANUAL_EMV:
                    if (po.AllowEmvManual) {
                        payLabel = 'העברת אשראי ידנית' + (po.TextMsg ? " (" + po.TextMsg + ")" : '');
                        options.push({
                            id: index,
                            label: payLabel,
                            value: PaymentOptions.CREDIT_MANUAL_EMV,
                            color: Colors.partnerColor,
                            size: 24
                        });
                    } else {
                        this.setState({showManualPermissionBtn: true});
                    }
                    break;
                case PaymentOptions.CREDIT_AUTO:
                    payLabel = 'העברת כרטיס אשראי' + (po.TextMsg ? " (" + po.TextMsg + ")" : '');
                    options.push({
                        id: index,
                        label: payLabel,
                        value: PaymentOptions.CREDIT_AUTO,
                        color: Colors.partnerColor,
                        size: 24
                    })
                    break;
                case PaymentOptions.MONTHLY_BILL_INVOICE:
                    payLabel = 'תשלום בחשבונית החודשית' + (po.TextMsg ? " (" + po.TextMsg + ")" : '');
                    options.push({
                        id: index,
                        label: payLabel,
                        value: PaymentOptions.MONTHLY_BILL_INVOICE,
                        color: Colors.partnerColor,
                        size: 24
                    })
                    break;
                case PaymentOptions.SEND_TO_CASHBOX:
                    payLabel = 'תשלום מזומן בקופה' + (po.TextMsg ? " (" + po.TextMsg + ")" : '');
                    options.push({
                        id: index,
                        label: payLabel,
                        value: PaymentOptions.SEND_TO_CASHBOX,
                        color: Colors.partnerColor,
                        size: 24
                    })
                    break;
            }
        });

        options[0].selected = true;

        return options;
    }

    //TODO
    //send to server
    addCreditPayment = (track2) => {
        let invoiceDetailsState = this.custInvoiceDetails.state;
        let emvManual = this.state.selectedPaymentOption.PaymentOptionCode == PaymentOptions.CREDIT_MANUAL_EMV;
        let emvFlag = emvManual || this.state.selectedPaymentOption.PaymentOptionCode == PaymentOptions.CREDIT_AUTO_EMV;

        if (emvFlag) {
            track2 = null;
            if (!this.validateForm() || this.state.selectedPaymentsNumber == -1) {
                return;
            }
        }

        this.setState({
            showCardReaderModal: false,
            isLoading: true,
            message: 'התשלום בתהליך, אנא המתן...',
            modalIconName: null,
            hideCloseButton: true,
            showLoader: true
        });
        Api.post('/AddCreditPayment', {
            strCartId: GlobalHelper.cartId,
            strNumOfPayments: this.state.selectedPaymentsNumber,
            strTrack2: track2 ? track2 : '',
            strCardNum: this.state.cardNum,
            strExprMonth: this.state.exprMonth,
            strExprYear: this.state.exprYear,
            strCardOwnerIdNum: this.state.cardOwnerIdNum,
            cardOwnerName: this.state.cardOwnerName,
            strCvv: this.state.cvv,
            strCustPhone: invoiceDetailsState.customerPhone,
            eilatResidentBase64EncodedImage: invoiceDetailsState.eilatResidentBase64EncodedImage,
            strCustName: invoiceDetailsState.customerName,
            isMailOnly: invoiceDetailsState.isMailOnly,
            email: invoiceDetailsState.emailAddress,
            custIdTypeCode: invoiceDetailsState.custIdType,
            custIdNum: invoiceDetailsState.custIdNum,
            remarks: invoiceDetailsState.remarks,
            address1: invoiceDetailsState.street,
            address2: invoiceDetailsState.houseNumber,
            city: invoiceDetailsState.city,
            zipCode: invoiceDetailsState.zipCode,
            eilatFlag: invoiceDetailsState.isEilatResident,
            //isSMSOnly: invoiceDetailsState.isSMSOnly ? "Y":"N",
            //SMSPhone: invoiceDetailsState.SMSPhone,
            emvFlag,
            emvManual
        }).then(resp => {
            if (resp.d && resp.d.IsSuccess) {
                this.setState({isLoading: false});
                if (emvFlag) {
                    if (resp.d.EmvCcXML) {
                        let emvCcResp = '';
                        let paymentId = resp.d.PaymentId;
                        let emvCcId = resp.d.EmvCcId;

                        if (!IS_P2_LITE_DEVICE) {
                            Caspit.isCompanionConnected(isConnected => {
                                if (isConnected) {
                                    Caspit.request(resp.d.EmvCcXML, (status, resp) => {
                                        emvCcResp = resp ? resp : '';

                                        if (emvCcResp) {
                                            this.sendEmvCreditCardReply(paymentId, emvCcResp, emvCcId);
                                        } else {
                                            this.verifyDealStatus(paymentId, emvCcId);
                                        }
                                    });
                                } else {
                                    this.showError('לא ניתן להתחבר למכשיר הפינפד, יש לוודא שהמכשיר מותאם ודלוק');
                                }
                            });
                        } else {
                            Caspit.request(resp.d.EmvCcXML, (status, resp) => {
                                emvCcResp = resp ? resp : '';

                                if (emvCcResp) {
                                    this.sendEmvCreditCardReply(paymentId, emvCcResp, emvCcId);
                                } else {
                                    this.verifyDealStatus(paymentId, emvCcId);
                                }
                            });
                        }
                    } else {
                        this.showError('אירעה שגיאה בקבלת XML לחיוב אשראי', resp);
                    }
                } else {
                    this.setState({signStep: true});
                    this.props.navigation.setParams({signStep: true});
                    this.props.disableDrawer(true);
                    if (this.state.selectedPaymentOption.IDScan || this.state.selectedPaymentOption.Sign) {
                        this.setState({
                            isLoading: false,
                            showLoader: false,
                            message: 'לקוח חוייב בהצלחה בחברת האשראי, כל מה שנשאר זה להחתים את הלקוח',
                            showCamera: this.state.selectedPaymentOption.IDScan,
                            signStep: this.state.selectedPaymentOption.Sign,
                            hideCloseButton: false,
                            onMessageClose: () => {
                                this.setState({message: null, errorMessage: false})
                            }
                        });
                    } else {
                        this.completeTransaction(null);
                    }
                }
            } else {
                this.showError('אירעה שגיאה בתשלום האשראי', resp);
            }
        });
    }

    async verifyDealStatus(paymentId, emvCcId) {
        let comp12SendResp = await this.sendCom12(paymentId);

        if (comp12SendResp.d && comp12SendResp.d.IsSuccess) {
            let waitTime = parseInt(comp12SendResp.d.Timeout);
            waitTime = isNaN(waitTime) ? 5000 : waitTime * 1000;

            this.setState({
                isLoading: true,
                message: 'שגיאת פינפד, בודק סטאטוס עסקה...',
                modalIconName: null,
                hideCloseButton: true,
                showLoader: true
            });
            await new Promise(r => setTimeout(r, waitTime));

            Caspit.request(comp12SendResp.d.Xml, async (status, resp) => {
                if (!resp) {
                    comp12SendResp = this.verifyDealStatus(paymentId, emvCcId);
                } else {
                    let com12ReceiveResp = await this.receiveCom12(paymentId, emvCcId, resp);
                    if (com12ReceiveResp.d && com12ReceiveResp.d.IsSuccess) {
                        this.sendEmvCreditCardReply(paymentId, resp, emvCcId);
                    } else {
                        this.showError('אירעה שגיאה בתשלום האשראי', comp12SendResp.d.StatusMessage);
                    }
                }
            });
        } else {
            this.showError('אירעה שגיאה בתשלום האשראי (Com12(', 'תקלה בחיוב הלקוח');
        }
    }

    sendCom12(paymentId) {
        return Api.post('/SendCaspitCom12', {
            cartId: GlobalHelper.cartId,
            terminalNumber: GlobalHelper.termNo,
            paymentId
        });
    }

    receiveCom12(paymentId, ccId, com12ReplayXML) {
        return Api.post('/ReceiveCaspitCom12', {
            cartId: GlobalHelper.cartId,
            terminalNumber: GlobalHelper.termNo,
            paymentId,
            ccId,
            com12ReplayXML
        });
    }

    //TODO
    //send to server
    addBillPayment = () => {
        if (this.validateForm() && this.state.selectedPaymentsNumber !== -1) {

            let invoiceDetailsState = this.custInvoiceDetails.state;
            console.log("invoiceDetailsState")
            console.log(invoiceDetailsState)
            this.setState({
                isLoading: true,
                message: 'התשלום בתהליך, אנא המתן...',
                modalIconName: null,
                hideCloseButton: true,
                showLoader: true
            });
            Api.post('/AddBillPayment', {
                strCartId: GlobalHelper.cartId,
                numOfPayments: this.state.selectedPaymentsNumber,
                isMailOnly: invoiceDetailsState.isMailOnly ? 'Y' : 'N',
                email: invoiceDetailsState.emailAddress,
                strCustName: invoiceDetailsState.customerName,
                strCustPhone: invoiceDetailsState.customerPhone,
                custIdTypeCode: invoiceDetailsState.custIdType,
                custIdNum: invoiceDetailsState.custIdNum,
                remarks: invoiceDetailsState.remarks,
                address1: invoiceDetailsState.street,
                address2: invoiceDetailsState.houseNumber,
                city: invoiceDetailsState.city,
                zipCode: invoiceDetailsState.zipCode,
                eilatFlag: invoiceDetailsState.isEilatResident,
                eilatResidentBase64EncodedImage: invoiceDetailsState.eilatResidentBase64EncodedImage //,
                //isSMSOnly: invoiceDetailsState.isSMSOnly ? "Y":"N",
                //SMSPhone: invoiceDetailsState.SMSPhone,
            }).then(resp => {
                if (resp.d && resp.d.IsSuccess) {
                    if (resp.d.ApproversList.length > 0) {
                        this.setState({
                            approversList: resp.d.ApproversList,
                            approveMsg: 'נדרש אישור חריגה ממסגרת אשראי:'
                        });
                    } else if (this.state.selectedPaymentOption.IDScan || this.state.selectedPaymentOption.Sign) {
                        this.setState({
                            isLoading: false,
                            showLoader: false,
                            message: null,
                            showCamera: this.state.selectedPaymentOption.IDScan,
                            signStep: this.state.selectedPaymentOption.Sign
                        });
                        this.props.disableDrawer(this.state.selectedPaymentOption.Sign);
                    } else {
                        this.setState({
                            isLoading: false,
                            message: 'התשלום בוצע בהצלחה, העסקה הסתיימה',
                            modalIconName: 'thumbs-o-up',
                            onMessageClose: this.onCompletePayment,
                            hideCloseButton: false,
                            showLoader: false
                        });
                    }
                } else {
                    this.showError('אירעה שגיאה בתשלום בחשבונית', resp);
                }
            });
        }
    }

    checkManualEmvPermission = (idNumber) => {
        this.setState({
            isLoading: true,
            message: 'בודק הרשאה...',
            modalIconName: null,
            hideCloseButton: true,
            showLoader: true
        });
        Api.post('/CheckEmvAuth', {cartId: GlobalHelper.cartId, idNumber}).then(resp => {
            this.setState({isLoading: false, message: null, showCardReaderModal: false});
            if (resp.d && resp.d.IsSuccess) {
                this.selectManualEmvOption();
            } else {
                this.showError('לתעודת זהות שהועברה אין הרשאה לעסקת אשראי ידנית', resp);
            }
        });
    }

    // swipeRequestFromPinpad = () => {
    //   Caspit.request(GlobalHelper.generateSwipeRequest(), (status, resp) => {

    //     let resultCode = GlobalHelper.getXmlNodeValue(resp, "ResultCode");

    //     if (resultCode == 0) {
    //       let idNumber = GlobalHelper.getXmlNodeValue(resp, "Track2");
    //       this.checkManualEmvPermission(idNumber)
    //     } else {
    //       alert('שגיאה בקריאת הכרטיס');
    //     }
    //   });
    // }

    sendEmvCreditCardReply = (paymentId, xml, ccId) => {
        this.setState({
            isLoading: true,
            message: 'ממתין לחברת האשראי...',
            modalIconName: null,
            hideCloseButton: true,
            showLoader: true
        });
        Api.post('/SendCreditCardReply', {cartId: GlobalHelper.cartId, paymentId, xml, ccId}).then(resp => {
            if (resp.d && resp.d.IsSuccess) {
                if (this.state.selectedPaymentOption.Sign) {
                    this.setState({
                        isLoading: false,
                        message: 'לקוח חוייב בהצלחה בחברת האשראי, כל מה שנשאר זה להחתים את הלקוח',
                        hideCloseButton: false,
                        showLoader: false,
                        signStep: true,
                        onMessageClose: () => {
                            this.setState({message: null, errorMessage: false})
                        }
                    });
                    this.props.disableDrawer(true);
                } else {
                    this.completeTransaction(null);
                }
            } else {
                this.showError('תשלום העסקה מול חברת האשראי נכשל', resp);
            }
        });
    }

    selectManualEmvOption = () => {
        this.state.radioPaymentOptions.forEach((po) => po.selected = false);

        this.state.radioPaymentOptions.push({
            id: 10,
            label: 'העברה ידנית כרטיס אשראי',
            value: PaymentOptions.CREDIT_MANUAL_EMV,
            color: Colors.partnerColor,
            size: 24,
            selected: true
        });
        this.setState({
            radioPaymentOptions: this.state.radioPaymentOptions, showManualPermissionBtn: false,
            selectedPaymentOption: this.state.paymentOptions.filter((po) => {
                return po.PaymentOptionCode == PaymentOptions.CREDIT_MANUAL_EMV
            })[0]
        });
    }

    approveBillPayment = () => {
        this.setState({approveLoading: true});
        Api.post('/ApproveBillPayment', {
            strCartId: GlobalHelper.cartId,
            approveNtUser: this.state.approverNtUserName
        }).then(resp => {
            this.setState({approveLoading: false});
            if (resp.d && resp.d.IsSuccess) {
                this.setState({
                    showCheckStatusBtn: true,
                    approveMsg: 'הבקשה נשלחה לסבב אישורים, לחץ על לחצן בדוק סטאטוס לעדכון הבקשה'
                });
            } else {
                this.showError('אירעה שגיאה בשליחת הבקשה לאישור', resp);
            }
        });
    }

    checkApproveBill = () => {
        this.setState({approveLoading: true});
        Api.post('/CheckApproveBill', {strCartId: GlobalHelper.cartId}).then(resp => {
            this.setState({approveLoading: false});
            if (resp.d && resp.d.IsSuccess) {
                switch (resp.d.ApproveStatus.toUpperCase()) {
                    case 'APPROVED':
                        ToastAndroid.show('הבקשה אושרה', ToastAndroid.LONG);
                        if (this.state.selectedPaymentOption.IDScan || this.state.selectedPaymentOption.Sign) {
                            this.setState({
                                isLoading: false,
                                showLoader: false,
                                message: null,
                                approversList: [],
                                showCamera: this.state.selectedPaymentOption.IDScan,
                                signStep: this.state.selectedPaymentOption.Sign
                            });
                            this.props.disableDrawer(this.state.selectedPaymentOption.Sign);
                        } else {
                            this.setState({
                                isLoading: false,
                                message: 'התשלום בוצע בהצלחה, העסקה הסתיימה',
                                modalIconName: 'thumbs-o-up',
                                onMessageClose: this.onCompletePayment,
                                hideCloseButton: false,
                                showLoader: false,
                                approversList: []
                            });
                        }
                        break;
                    case 'REJECT':
                        this.setState({
                            message: 'הבקשה נדחתה',
                            approversList: [],
                            hideCloseButton: false,
                            showLoader: false,
                            onMessageClose: () => this.props.navigation.navigate('Cart', {screen: 'Cart'})
                        });
                        break;
                    case 'WFSTARTED':
                        this.setState({approveMsg: 'הבקשה ממתינה לאישור של ' + this.state.approverName});
                        break;
                    case 'OTHER':
                    default:
                        this.setState({approveMsg: 'תקלה באישור הבקשה'});
                        break;
                }
            } else {
                this.setState({approveMsg: 'אירעה שגיאה בבדיקת האישור'});
            }
        });
    }

    showError = (msg, resp) => {
        if (resp && resp.d) {
            if (resp.d.FriendlyMessage) {
                msg = resp.d.FriendlyMessage;
            } else if (resp.d.ErrorMessage) {
                msg = msg + ", " + resp.d.ErrorMessage;
            }
        }
        this.setState({
            isLoading: false, signStep: false, message: Consts.globalErrorMessagePrefix + msg, errorMessage: true,
            modalIconName: null, hideCloseButton: false, showLoader: false,
            onMessageClose: () => {
                this.setState({message: null, errorMessage: false})
            }
        });
        this.props.disableDrawer(false);
    }

    completeTransaction = (encodedSignature) => {
        if (this.state.selectedPaymentOption.IDScan && !this.state.idBase64EncodedImage) {
            Alert.alert('יש לצלם תעודת זהות של הלקוח');
        } else {
            this.setState({
                isLoading: true,
                message: 'אנא המתן לסיום העסקה...',
                modalIconName: null,
                hideCloseButton: true,
                showLoader: true
            });
            Api.post('/CompleteTransaction', {
                strCartId: GlobalHelper.cartId,
                signatureBase64EncodedImage: encodedSignature,
                idBase64EncodedImage: this.state.idBase64EncodedImage,
                eilatResidentBase64EncodedImage: this.state.eilatResidentBase64EncodedImage
            }).then(resp => {
                if (resp.d && resp.d.IsSuccess) {
                    this.setState({
                        isLoading: false, message: 'התשלום בוצע בהצלחה, העסקה הסתיימה', modalIconName: 'thumbs-o-up',
                        onMessageClose: this.onCompletePayment, hideCloseButton: false, showLoader: false
                    });
                } else {
                    let msg = 'אירעה שגיאה בסיום העסקה';
                    if (resp.d.FriendlyMessage) {
                        msg = resp.d.FriendlyMessage;
                    } else if (resp.d.ErrorMessage) {
                        msg = msg + ", " + resp.d.ErrorMessage;
                    }
                    this.setState({
                        isLoading: false,
                        signStep: encodedSignature != null,
                        message: Consts.globalErrorMessagePrefix + msg,
                        errorMessage: true,
                        modalIconName: null,
                        hideCloseButton: false,
                        showLoader: false,
                        onMessageClose: this.onCompletePayment
                    });
                    this.props.navigation.setParams({signStep: true});
                    this.props.disableDrawer(true);
                }
            });
        }
    }

    onCompletePayment = () => {
        this.setState({message: null});
        this.props.clearCustomer();
        this.props.clearCart();
        this.props.disableDrawer(false);
        this.props.navigation.navigate('HomeScreen', {screen: 'HomeScreen'});
    }

    sendPaymentToCashboxConfirm = () => {
        if (this.validateForm()) {
            Alert.alert('העברת תשלום לקופה', 'האם להעביר את התשלום לקופה?', [
                {
                    text: 'ביטול', onPress: () => {
                    }, style: 'cancel'
                },
                {
                    text: 'אישור', onPress: () => {
                        if (this.state.selectedPaymentOption.IDScan) {
                            this.setState({showCamera: true});
                        } else {
                            this.sendPaymentToCashbox();
                        }
                    }
                },
            ]);
        }
    }
    // sendPaymentToCashbox = () => {
    //     this.setState({isLoading: true, message: null});
    //     Api.post('/SendPaymentToCashbox', {
    //         strCartId: GlobalHelper.cartId,
    //         strCustPhone: this.state.custPhone,
    //         isMailOnly: this.state.isMailOnly ? 'Y' : 'N',
    //         email: this.state.custEmail,
    //         strCustName: this.state.custName,
    //         eilatResidentBase64EncodedImage: this.state.eilatResidentBase64EncodedImage ? this.state.eilatResidentBase64EncodedImage : '', //milena 07.01.2025
    //         custIdTypeCode: this.state.custIdType,
    //         custIdNum: this.state.custId,
    //         idBase64EncodedImage: this.state.idBase64EncodedImage ? this.state.idBase64EncodedImage : '', //milena 07.01.2025
    //         remarks: this.state.custRemarks,
    //         address1: this.state.street,
    //         address2: this.state.houseNumber,
    //         city: this.state.city,
    //         zipCode: this.state.zipCode,
    //         eilatFlag: this.state.isEilatResidentb  //,
    //         // isSMSOnly: this.state.isSMSOnly ? "Y":"N",
    //         // SMSPhone: this.state.SMSPhone,
    //     }).then(resp => {
    //         this.setState({isLoading: false});
    //         if (resp.d && resp.d.IsSuccess) {
    //             let displayMsg = 'העברת התשלום לקופה הסתיימה בהצלחה';
    //             if (resp.d.FriendlyMessage && resp.d.FriendlyMessage != "null") {
    //                 displayMsg = displayMsg + ", " + resp.d.FriendlyMessage;
    //             }
    //             this.setState({
    //                 isLoading: false, showLoader: false, message: displayMsg,
    //                 modalIconName: 'thumbs-o-up', onMessageClose: this.onCompletePayment
    //             });
    //         } else {
    //             let msg = 'אירעה שגיאה בהעברת התשלום לקופה';
    //             if (resp.d.FriendlyMessage) {
    //                 msg = resp.d.FriendlyMessage;
    //             } else if (resp.d.ErrorMessage) {
    //                 msg = msg + ", " + resp.d.ErrorMessage;
    //             }
    //             this.setState({
    //                 message: Consts.globalErrorMessagePrefix + msg, errorMessage: true,
    //                 onMessageClose: () => {
    //                     this.setState({message: null, errorMessage: false})
    //                 }
    //             });
    //         }
    //     });
    // }

    sendPaymentToCashbox = () => {
        this.setState({isLoading: true, message: null});
        Api.post('/SendPaymentToCashbox', {
            strCartId: GlobalHelper.cartId,
            strCustPhone: this.state.custPhone,
            isMailOnly: this.state.isMailOnly ? 'Y' : 'N',
            email: this.state.custEmail,
            strCustName: this.state.custName,
            custIdTypeCode: this.state.custIdType,
            custIdNum: this.state.custId,
            idBase64EncodedImage: this.state.idBase64EncodedImage ? this.state.idBase64EncodedImage : '', //milena 07.01.2025, 
            eilatResidentBase64EncodedImage: this.state.eilatResidentBase64EncodedImage ? this.state.eilatResidentBase64EncodedImage : '', //milena 07.01.2025,
            remarks: this.state.custRemarks,
            address1: this.state.street,
            address2: this.state.houseNumber,
            city: this.state.city,
            zipCode: this.state.zipCode,
            eilatFlag: this.state.isEilatResident  //,
            // isSMSOnly: this.state.isSMSOnly ? "Y":"N",
            // SMSPhone: this.state.SMSPhone,
        }).then(resp => {
            this.setState({isLoading: false});
            if (resp.d && resp.d.IsSuccess) {
                let displayMsg = 'העברת התשלום לקופה הסתיימה בהצלחה';
                if (resp.d.FriendlyMessage && resp.d.FriendlyMessage != "null") {
                    displayMsg = displayMsg + ", " + resp.d.FriendlyMessage;
                }
                this.setState({
                    isLoading: false, showLoader: false, message: displayMsg,
                    modalIconName: 'thumbs-o-up', onMessageClose: this.onCompletePayment
                });
            } else {
                let msg = 'אירעה שגיאה בהעברת התשלום לקופה';
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                this.setState({
                    message: Consts.globalErrorMessagePrefix + msg, errorMessage: true,
                    onMessageClose: () => {
                        this.setState({message: null, errorMessage: false})
                    }
                });
            }
        });
    }

    takePictureCallback = (encodedPicture) => {
        this.setState({idBase64EncodedImage: encodedPicture, showCamera: false});
        if (this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.SEND_TO_CASHBOX) {
            this.sendPaymentToCashbox();
        }
    };

    onSaveSignature = (signature) => {
        if (this.state.selectedPaymentOption.IDScan && !this.state.idBase64EncodedImage) {
            Alert.alert('יש לצלם תעודה מזהה של הלקוח');
            return;
        }

        this.completeTransaction(signature.encoded);
    };

    onChangeCreditCardFields = (form) => {
        if (form.valid) {
            let values = form.values;
            let arrExpiry = values.expiry.split('/');
            this.setState({
                cardNum: values.number.replace(/\s/g, ""),
                exprMonth: arrExpiry[0],
                exprYear: arrExpiry[1],
                cvv: values.cvc,
                validForm: true
            });
        }
    };

    validateForm = () => {
        this.updateStateAndKeepCustInvoiceDetails({submitted: true});

        if (!this.custInvoiceDetails.formIsValid()) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
            return false;
        } else {
            return true;
        }
    }

    updateStateAndKeepCustInvoiceDetails = (paymentState) => {
        let invoiceDetailsState = this.custInvoiceDetails.state;
        let newState = {
            custName: invoiceDetailsState.customerName,
            custIdType: invoiceDetailsState.custIdType,
            custId: invoiceDetailsState.custIdNum,
            custEmail: invoiceDetailsState.emailAddress,
            custPhone: invoiceDetailsState.customerPhone,
            custRemarks: invoiceDetailsState.remarks,
            isMailOnly: invoiceDetailsState.isMailOnly,
            eilatFlag: invoiceDetailsState.isEilatResident ? invoiceDetailsState.isEilatResident:invoiceDetailsState.eilatFlag,
            addressRequired: invoiceDetailsState.addressRequired,
            cities: invoiceDetailsState.cities,
            city: invoiceDetailsState.city,
            street: invoiceDetailsState.street,
            houseNumber: invoiceDetailsState.houseNumber,
            zipCode: invoiceDetailsState.zipCode,
            isEilatResident: invoiceDetailsState.isEilatResident,
            eilatResidentBase64EncodedImage: invoiceDetailsState.eilatResidentBase64EncodedImage //,
            // isSMSOnly: '', // invoiceDetailsState.isSMSOnly ? "Y":"N",
            // SMSPhone: '' // invoiceDetailsState.SMSPhone,
        }
        this.setState(Object.assign(newState, paymentState));
    }

    scanCreditCard = () => {
        if (this.validateForm() &&
            (this.state.selectedPaymentsNumber !== -1 && (!this.state.selectedPaymentOption.CCOwnerID ||
                    GlobalHelper.validateIdNum(this.state.cardOwnerIdNum)) &&
                (!this.state.selectedPaymentOption.CCOwnerName || this.state.cardOwnerName.length > 1))) {

            this.setState({showCardReaderModal: true});
        }
    }

    onBackButtonPressAndroid = () => {
        /*
        *   Returning `true` from `onBackButtonPressAndroid` denotes that we have handled the event,
        *   and react-navigation's lister will not get called, thus not popping the screen.
        *
        *   Returning `false` will cause the event to bubble up and react-navigation's listener will pop the screen.
        * */
        if (this.state.isLoading || this.state.signStep) {
            return true;
        }

        return false;
    };

    confirmBackToCart = () => {
        Alert.alert(
            'ביטול סבב אישורים',
            'האם אתה בטוח שברצונך להפסיק את סבב האישורים ולחזור לסל הקניות?',
            [
                {text: 'כן', onPress: () => this.props.navigation.navigate('Cart', {screen: 'Cart'})},
                {text: 'לא', onPress: () => null},
            ],
        )
    }

    getNumberOfPaymentsView = () => {
        let tempArr = [];
        let maxPayments = parseInt(this.state.maxPayments);
        for (let i = parseInt(this.state.minPayments); i <= maxPayments; i++) {
            tempArr.push(i.toString());
        }

        return <View style={[styles.numberOfPaymentsContainer, {marginLeft: 30, marginRight: 30}]}>
            <Dropdown label='מספר תשלומים' labelFontSize={14} value={this.state.selectedPaymentsNumber}
                      data={tempArr.map((n) => {
                          return {value: n, label: n}
                      })} style={{fontFamily: 'simpler-regular-webfont'}}
                      onChangeText={value => this.updateStateAndKeepCustInvoiceDetails({selectedPaymentsNumber: value})}/>
        </View>;
    }

    onPaymentOptionChange = (data) => {
        this.state.radioPaymentOptions.forEach(e => {e.selected = false});
        this.state.radioPaymentOptions[data].selected = true;

        let selectedButton = this.state.radioPaymentOptions.find(e => {
            if (e.selected === true) {
                console.log(e)
                return e;
            }
        });

        let selectionButton = this.state.paymentOptions.find(e => {})
        this.updateStateAndKeepCustInvoiceDetails({
            selectedPaymentOption: this.state.paymentOptions.filter((po) => {
                const a = po.PaymentOptionCode === selectedButton.value
                console.log(a)
                return a
            })[0]
        });
        this.setState({radioSelected : data})
    }

    showPaymentInfo = () => {
        let message = null;

        if (!this.state.signStep) {
            if (this.state.selectedPaymentOption.IDScan && this.state.selectedPaymentOption.Sign) {
                message = 'בעסקה זו יידרשו צילום ת.ז וחתימה של הלקוח';
            } else if (this.state.selectedPaymentOption.Sign) {
                message = 'בעסקה זו תידרש חתימה של הלקוח';
            } else if (this.state.selectedPaymentOption.IDScan) {
                message = 'בעסקה זו יידרש צילום ת.ז של הלקוח';
            }
        }

        if (message) {
            return <View style={MySaleStyle.flexRow}>
                <MCIcon style={{paddingRight: 17, marginRight: -17}} color={Colors.partnerColor}
                        name={'information-outline'} size={28}/>
                <Text style={[MySaleStyle.bold, {margin: 10, padding: 15, marginTop: -10}]}>{message}</Text>
            </View>;
        }
    }

    render() {

        return (
            // <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
            <View style={styles.container}>
                <UserDetails navigation={this.props.navigation}/>
                {this.state.isLoading ?
                    <MyActivityIndicator/> :
                    (!this.state.message || this.state.errorMessage) &&
                    <ScrollView contentContainerStyle={styles.scrollView} ref={r => this.scrollView = r}>
                        {!this.state.signStep &&
                            <CustInvoiceDetails ref={r => this.custInvoiceDetails = r}
                                                detailsRequired={this.state.detailsRequired}
                                                phoneRequired={this.state.phoneRequired} custName={this.state.custName}
                                                custIdType={this.state.custIdType}
                                                custId={this.state.custId} custEmail={this.state.custEmail}
                                                custPhone={this.state.custPhone}
                                                custRemarks={this.state.custRemarks} eilatFlag={this.state.eilatFlag}
                                                isEilatResident={this.state.isEilatResident}
                                                addressRequired={this.state.addressRequired} cities={this.state.cities}
                                                city={this.state.city} street={this.state.street}
                                                houseNumber={this.state.houseNumber} zipCode={this.state.zipCode}
                                                eilatResidentBase64EncodedImage={this.state.eilatResidentBase64EncodedImage}
                            />}
                        <View style={MySaleStyle.flex1}>
                            <View style={MySaleStyle.flex1}>
                                <Text style={MySaleStyle.textHeader}>תשלום</Text>
                                <Text style={styles.summaryText}>סה"כ
                                    לתשלום: {GlobalHelper.formatNum(this.state.totalIncVat)} ש"ח</Text>
                                {!this.state.signStep && this.state.radioPaymentOptions ?
                                    <View style={styles.paymentOptionsContainer}>
                                        <RadioGroup radioButtons={this.state.radioPaymentOptions}
                                                    onPress={this.onPaymentOptionChange}
                                                    selectedId={this.state.radioSelected}
                                                    containerStyle={{alignItems: 'flex-start'}}/>
                                        {this.state.showManualPermissionBtn &&
                                            <TouchableOpacity style={[MySaleStyle.smallButtonBackground, {
                                                marginRight: 20,
                                                marginTop: 20
                                            }]} onPress={() => this.setState({showCardReaderModal: true})}>
                                                <Text style={MySaleStyle.PartnerButtonText}>הרשאת מנהל להעברה
                                                    ידנית</Text>
                                            </TouchableOpacity>}
                                    </View> :
                                    <View>
                                        {this.state.selectedPaymentOption.PaymentOptionCode &&
                                            <Text style={styles.summaryText}>אמצעי
                                                תשלום: {this.state.selectedPaymentOption.PaymentOptionCode.search('CREDIT') !== -1 ? 'כרטיס אשראי' : 'חשבונית חודשית'}</Text>}
                                        <Text style={styles.summaryText}>מספר
                                            תשלומים: {this.state.selectedPaymentsNumber}</Text>
                                        {this.state.custPhone != '' &&
                                            <Text style={styles.summaryText}>מספר טלפון: {this.state.custPhone}</Text>}
                                    </View>
                                }
                            </View>

                            {this.state.signStep && this.state.selectedPaymentOption.IDScan &&
                                <View style={MySaleStyle.flexRow}>
                                    <View style={[MySaleStyle.flexRow, MySaleStyle.flex1, {
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }]}>
                                        {this.state.idBase64EncodedImage ?
                                            <View style={[MySaleStyle.flexRow, {marginRight: 10}]}>
                                                <MCIcon style={{paddingRight: 20}} color={Colors.partnerColor}
                                                        name={'check'} size={25}/>
                                                <Text style={{paddingTop: 4}}>צילום תעודת הזהות נקלט בהצלחה</Text>
                                            </View> :
                                            <View style={[MySaleStyle.flexRow, {paddingTop: 6}]}>
                                                <MCIcon style={{paddingRight: 20}} color={Colors.redColor}
                                                        name={'close'} size={25}/>
                                                <Text style={{paddingTop: 4}}>נא לצלם תעודת זהות</Text>
                                            </View>}
                                        <TouchableOpacity style={[MySaleStyle.smallButtonBackground, {marginRight: 20}]}
                                                          onPress={() => this.setState({showCamera: true})}>
                                            <Text style={MySaleStyle.PartnerButtonText}>לצילום</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>}
                            {this.state.signStep &&
                                <View style={styles.signatureContainer}>
                                    {(this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO ||
                                            this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO_EMV ||
                                            this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_MANUAL_EMV) &&
                                        <View style={[MySaleStyle.flexRow, {marginBottom: 20}]}>
                                            <Icon name={'thumbs-o-up'} size={20}
                                                  style={{paddingRight: 5, paddingLeft: 5, marginTop: 10}}/>
                                            <View>
                                                <Text style={styles.boldText}>העסקה שודרה בהצלחה לחברת האשראי</Text>
                                                <Text style={{marginTop: 10}}>
                                                    <Text style={[styles.boldText, {
                                                        color: Colors.partnerColor,
                                                        backgroundColor: 'black'
                                                    }]}>שים לב!</Text>
                                                </Text>
                                                <Text style={{marginTop: 10, paddingLeft: 10}}>
                                                    <Text style={[styles.boldText, {
                                                        color: Colors.partnerColor,
                                                        backgroundColor: 'black'
                                                    }]}>אין לצאת ממסך זה ללא החתמת הלקוח והשלמת העסקה!</Text>
                                                </Text>
                                            </View>
                                        </View>}
                                    <Text style={styles.rowTextSubHeader}>חתימת הלקוח</Text>
                                    <MySignatureCapture onSaveSignature={this.onSaveSignature}/>
                                </View>}
                        </View>
                        {!this.state.signStep && this.state.selectedPaymentOption.PaymentOptionCode !== PaymentOptions.SEND_TO_CASHBOX && this.getNumberOfPaymentsView()}
                        {!this.state.signStep && this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO &&
                            this.state.selectedPaymentOption.CCOwnerName &&
                            <View style={{flex: 1, padding: 15}}>
                                <FloatingLabelInput
                                    label="שם בעל הכרטיס"
                                    value={this.state.cardOwnerName}
                                    textAlign={'right'}
                                    maxLength={100}
                                    underlineColorAndroid={!this.state.cardOwnerName ? Colors.redColor : undefined}
                                    onChangeText={(cardOwnerName) => this.updateStateAndKeepCustInvoiceDetails({cardOwnerName: cardOwnerName})}/>
                                {this.state.submitted && this.state.cardOwnerName.length < 2 &&
                                    <Text style={{color: Colors.redColor, marginLeft: 30}}>נא להזין שם בעל
                                        הכרטיס</Text>}
                            </View>}
                        {!this.state.signStep && this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO &&
                            this.state.selectedPaymentOption.CCOwnerID &&
                            <View style={{flex: 1, padding: 15}}>
                                <FloatingLabelInput
                                    label="מספר זהות בעל הכרטיס"
                                    value={this.state.cardOwnerIdNum}
                                    keyboardType='numeric'
                                    textAlign={'left'}
                                    maxLength={9}
                                    underlineColorAndroid={!this.state.cardOwnerIdNum ? Colors.redColor : undefined}
                                    onChangeText={(cardOwnerIdNum) => this.updateStateAndKeepCustInvoiceDetails({cardOwnerIdNum: cardOwnerIdNum})}/>
                                {this.state.submitted && (this.state.cardOwnerIdNum == '' || !GlobalHelper.validateIdNum(this.state.cardOwnerIdNum)) &&
                                    <Text style={{color: Colors.redColor, marginLeft: 30}}>נא להזין מספר ת.ז
                                        חוקי</Text>}
                            </View>}
                        {this.showPaymentInfo()}
                        {!this.state.signStep && (this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO_EMV ||
                                this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_MANUAL_EMV) &&
                            <View style={[MySaleStyle.PartnerButtonContainer, {marginBottom: 10, marginTop: 30}]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                  onPress={this.addCreditPayment}>
                                    <Text style={MySaleStyle.PartnerButtonText}>תשלום בכרטיס אשראי</Text>
                                </TouchableOpacity>
                            </View>}
                        {!this.state.signStep && this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.CREDIT_AUTO &&
                            <View style={[MySaleStyle.PartnerButtonContainer, {marginBottom: 10, marginTop: 30}]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                  onPress={this.scanCreditCard}>
                                    <Text style={MySaleStyle.PartnerButtonText}>העברת אשראי</Text>
                                </TouchableOpacity>
                            </View>}
                        {!this.state.signStep && this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.MONTHLY_BILL_INVOICE &&
                            <View style={[MySaleStyle.PartnerButtonContainer, {marginBottom: 5, marginTop: 30}]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                  onPress={this.addBillPayment}>
                                    <Text style={MySaleStyle.PartnerButtonText}>ביצוע תשלום</Text>
                                </TouchableOpacity>
                            </View>}
                        {this.state.selectedPaymentOption.PaymentOptionCode === PaymentOptions.SEND_TO_CASHBOX &&
                            <View style={[MySaleStyle.PartnerButtonContainer, {marginTop: 40, marginBottom: 10}]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                  onPress={this.sendPaymentToCashboxConfirm}>
                                    <Text style={MySaleStyle.PartnerButtonText}>העברה לקופה</Text>
                                </TouchableOpacity>
                            </View>}
                        {!this.state.signStep &&
                            <View style={[MySaleStyle.PartnerButtonContainer, {marginBottom: 10}]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                  onPress={() => {
                                                      this.setState({
                                                          cardOwnerName: '',
                                                          cardOwnerIdNum: '',
                                                          custName: '',
                                                          custIdType: '',
                                                          custId: ''
                                                      }),
                                                          this.custInvoiceDetails.clearFields(),
                                                          this.scrollView.scrollTo({x: 0, y: 0, animated: true})
                                                  }}>
                                    <Text style={MySaleStyle.PartnerButtonText}>ניקוי שדות</Text>
                                </TouchableOpacity>
                            </View>}
                    </ScrollView>}
                {this.state.showCardReaderModal &&
                    <CardReader isEmployeeAuthentication={false}
                                isVisible={this.state.showCardReaderModal}
                                onModalClose={() => {
                                    this.setState({showCardReaderModal: false})
                                }}
                                onSwipeCard={this.addCreditPayment}
                                onManualInsert={this.checkManualEmvPermission}/>}
                {this.state.message && <ModalMessage message={this.state.message} iconName={this.state.modalIconName}
                                                     onClose={this.state.onMessageClose}
                                                     hideCloseButton={this.state.hideCloseButton}
                                                     showLoader={this.state.showLoader}
                                                     isVisible={this.state.message != null}/>}

                {this.state.showCamera && <Camera takePictureCallback={this.takePictureCallback}
                                                  closeCamera={() => this.setState({showCamera: false})}
                                                  imageType={'תעודת זהות'}/>}

                {this.state.approversList.length > 0 &&
                    <Modal isVisible={this.state.approversList.length > 0}>
                        <View style={styles.modalContent}>
                            <Text style={[{
                                fontSize: 18,
                                fontFamily: 'simpler-black-webfont'
                            }]}>{this.state.approveMsg}</Text>
                            {!this.state.showCheckStatusBtn &&
                                <View style={{width: '100%'}}>
                                    <Dropdown label='גורם מאשר' labelFontSize={14} value={this.state.approverNtUserName}
                                              style={{fontFamily: 'simpler-regular-webfont'}}
                                              data={this.state.approversList.map((a) => {
                                                  return {value: a.NtUserName, label: a.Name + ' - ' + a.JobTitle}
                                              })}
                                              onChangeText={(value, i, data) => {
                                                  this.setState({
                                                      approverNtUserName: value,
                                                      approverName: data[i].label.split('-')[0]
                                                  })
                                              }}/>
                                </View>}

                            <View style={[MySaleStyle.PartnerButtonContainer, {marginTop: 30}, {marginBottom: 10}]}>
                                {this.state.approveLoading ? <MyActivityIndicator/> :
                                    (<View style={{justifyContent: 'center', alignItems: 'center'}}>
                                        {this.state.showCheckStatusBtn ?
                                            <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                                              onPress={this.checkApproveBill}>
                                                <Text style={MySaleStyle.PartnerButtonText}>בדיקת סטאטוס</Text>
                                            </TouchableOpacity> :
                                            <TouchableOpacity
                                                style={this.state.approverNtUserName ? MySaleStyle.PartnerButtonBackground : MySaleStyle.PartnerButtonBackgroundDisabled}
                                                disabled={!this.state.approverNtUserName}
                                                onPress={this.approveBillPayment}>
                                                <Text style={MySaleStyle.PartnerButtonText}>הפעלת סבב אישורים</Text>
                                            </TouchableOpacity>}
                                        <TouchableOpacity style={[MySaleStyle.PartnerButtonBackground, {marginTop: 20}]}
                                                          onPress={this.confirmBackToCart}>
                                            <Text style={MySaleStyle.PartnerButtonText}>חזרה לסל</Text>
                                        </TouchableOpacity>
                                    </View>)}
                            </View>
                        </View>
                    </Modal>}
            </View>
            // </AndroidBackHandler>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

export default connect(null, mapDispatchToProps)(PaymentScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingBottom: '10%',
    },
    signStepContainer: {
        flex: 6,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    paymentOptionsContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 10,
    },
    numberOfPaymentsContainer: {
        flex: 1,
        padding: 10,
    },
    dynamicContainer: {
        flex: 5,
        flexDirection: 'column',
        alignContent: 'space-between'
    },
    creditBtnContainer: {
        flex: 20,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        //margin: 20,
        marginTop: -15,
    },
    creditBtnContainerMargTop: {
        flex: 20,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        //margin: 20,
        marginTop: -120,
    },
    cashBoxBtnContainer: {
        flex: 20,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        margin: 20
    },
    pickerNumOfPayments: {
        height: 50,
        width: 120,
        marginTop: -19,
    },
    creditCardContainer: {
        flex: 8,
        paddingRight: -15,
        paddingLeft: 20
    },
    signatureContainer: {
        flex: 8,
        flexDirection: 'column',
        padding: 10,
        height: 600
    },
    textInput: {
        fontSize: 20,
        backgroundColor: '#fff',
        alignSelf: 'center',
        width: 123,
        marginLeft: 20,
        fontFamily: 'simpler-regular-webfont'
    },
    textInputContainer: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingLeft: 15,
    },
    textInputLabel: {
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont'
    },
    invalidIdNumber: {
        fontSize: 20,
        backgroundColor: '#fff',
        color: Colors.redColor,
        alignSelf: 'center',
        width: 123,
        marginLeft: 20,
        fontFamily: 'simpler-regular-webfont'
    },
    footerContainer: {
        flexDirection: 'column',
    },
    rowTextSubHeader: {
        paddingRight: 15,
        fontSize: 20,
        marginTop: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    title: {
        fontSize: 26,
        paddingRight: 15,
        marginTop: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    space: {
        flexDirection: 'column',
        borderTopColor: '#fff',
        borderTopWidth: 20,
    },
    boldText: {
        fontSize: 20,
        fontFamily: 'simpler-black-webfont',
        marginTop: 10
    },
    summaryText: {
        fontSize: 18,
        fontFamily: 'simpler-black-webfont',
        paddingRight: 15,
        marginTop: 10
    },
    summaryHeader: {
        fontSize: 18,
        fontFamily: 'simpler-black-webfont',
        paddingRight: 15,
        marginTop: 10
    },
    textHeader: {
        marginTop: 5,
        marginBottom: 5,
        fontSize: 26,
        paddingRight: 10,
        paddingLeft: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: 300
    },
});

AppRegistry.registerComponent('PaymentScreen', () => PaymentScreen);

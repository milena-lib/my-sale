import React from 'react';
import { View, TextInput, Text, StyleSheet, ToastAndroid, TouchableOpacity, TouchableNativeFeedback } from 'react-native'
import {Picker} from '@react-native-picker/picker'
//import { Dropdown } from 'react-native-material-dropdown';
import Api from '../api/api';
import MyActivityIndicator from '../components/MyActivityIndicator';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions';
import CustomerDetailsModal from '../components/CustomerDetails';
//import FloatingLabelInput from '../components/FloatingLabelInput';

export class SearchCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isSuccess: true,
            globalMessage: '',
            listIdTypes: null,
            customersData: null,
            isExistCustMode: false,
            custIdType: null,
            custIdNum: '',
            resultsCounter: '',
            showCustomerDetails: false,
            selectedCustomer: null,
        };
    }

    componentDidMount() {
        this.getListIdTypes();
    }

    setCustExist(boolCustExists) {
        this.setState({ isExistCustMode: boolCustExists });
    }

    getListIdTypes() {
        Api.post('/GetExistCustIdType', {
            strCurrentOrgUnit: GlobalHelper.orgUnitCode,
            strCartId: GlobalHelper.cartId,
        }).then(resp => {
            if (resp.d && resp.d.IsSuccess) {
                this.setState({
                    listIdTypes: resp.d.ExistCustIdTypeList,
                    custIdType: resp.d.ExistCustIdTypeList[0].IdTypeCode,
                    isSuccess: true,
                    globalMessage: ''
                });
                if (resp.d.FriendlyMessage) {
                    ToastAndroid.show(resp.d.FriendlyMessage, ToastAndroid.SHORT);
                }
                //No results
                if (resp.d.ExistCustIdTypeList.length == 0) {
                    if (!resp.d.FriendlyMessage) {
                        ToastAndroid.show('רשימת סוגי הזיהוי ריקה', ToastAndroid.SHORT);
                    }
                }
            }
            else {
                let msg = resp.d.FriendlyMessage;
                if (msg) {
                    msg = "אירעה שגיאה בקבלת סוגי הזיהוי";
                }
                this.setState({
                    isSuccess: false,
                    globalMessage: msg,
                });
            }
        });
    }

    handleCustIdTypeChange(selectedValue) {
        this.setState({ custIdType: selectedValue });
    }

    searchCustomers() {
        //Input Validation
        if (!this.state.custIdNum) {
            return;
        }
        else if (this.state.custIdType == 'ID_NUM' && !GlobalHelper.validateIdNum(this.state.custIdNum)) {
            let msg = 'מספר הזהות שהוזן אינו חוקי';
            this.setState({ resultsCounter: msg });
            return;
        }
        else if (this.state.custIdType == 'MSISDN' &&
            ((this.state.custIdNum.length < 9) || (this.state.custIdNum.length > 10))) {
            let msg = 'יש להזין עשר ספרות עבור מספר טלפון';
            this.setState({ resultsCounter: msg });
            return;
        }
        this.setState({ isLoading: true });
        //Searching in DB
        Api.post('/GetCustomerDetail', {
            strCurrentOrgUnit: GlobalHelper.orgUnitCode,
            strCartId: GlobalHelper.cartId,
            strSearchType: this.state.custIdType,
            strSearchValue: this.state.custIdNum,
            strBillingCustomerId: null,
            strSessionId: null,
        }).then(resp => {
            this.setState({ isLoading: false });
            if (resp.d && resp.d.IsSuccess) {
                let totCustomers = resp.d.CustomersList.length;
                let counterText = '';
                switch (totCustomers) {
                    case 0:
                        counterText = resp.d.FriendlyMessage ? resp.d.FriendlyMessage : 'לא נמצאו לקוחות';
                        break;
                    case 1:
                        counterText = 'נמצא לקוח אחד';
                        break;
                    default:
                        counterText = 'נמצאו ' + totCustomers + ' לקוחות';
                        break;
                }
                this.setState({
                    customersData: resp.d.CustomersList,
                    //sessionId: resp.d.SessionId,
                    isSuccess: true,
                    globalMessage: '',
                    resultsCounter: counterText
                });
                if ((resp.d.CustomersList.length > 0) && (resp.d.FriendlyMessage)) {
                    ToastAndroid.show(resp.d.FriendlyMessage, ToastAndroid.SHORT);
                }
            }
            else {
                let msg = "אירעה שגיאה בחיפוש לקוחות";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                }
                else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                this.setState({
                    isSuccess: false,
                    globalMessage: msg
                });
            }
        });
    }

    onCustomerPress(item) {
        //Opening the Customer Details Modal for the selected customer
        this.setState({
            showCustomerDetails: true,
            selectedCustomer: item
        });
    }

    //When performing an activity in the Customer Details Modal we initialize the component
    customerDetailsModalCallback = () => {
        this.setState({
            isExistCustMode: false,
            custIdNum: null,
            customersData: null,
            resultsCounter: '',
        })
    };

    renderCustomer = (item, index) => {
        return <TouchableOpacity onPress={() => this.onCustomerPress(item)} key={index}>
            <Text style={[MySaleStyle.margTop15, MySaleStyle.padRight10, MySaleStyle.textSubHeader, MySaleStyle.flex1]}>{item.CustomerName}</Text>
            <View style={MySaleStyle.flexRow}>
                <Text style={styles.rowText}>מספר זהות:</Text>
                <Text style={styles.rowText}>{item.CustIdNum}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
                <Text style={styles.rowText}>מספר לקוח:</Text>
                <Text style={styles.rowText}>{item.Custcode}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
                <Text style={styles.rowText}>נייד מוביל:</Text>
                <Text style={styles.rowText}>{item.PrimaryMobile}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
                <Text style={styles.rowText}>קטגוריה:</Text>
                <Text style={styles.rowText}>{item.CustomerClass}</Text>
            </View>
            <View style={[MySaleStyle.flexRow, MySaleStyle.flex1]}>
                <Text style={[MySaleStyle.margTop10, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>
                    חשבונית אחרונה: {item.LastBillingInvoiceDate}
                    <Text style={[MySaleStyle.partnerColor, MySaleStyle.bold, styles.separator]}> | </Text>
                    {GlobalHelper.formatNegativeNum(item.PreviousBalance)} ש"ח
                </Text>
                <MaterialIcon name="keyboard-arrow-left" size={40} color={Colors.partnerColor} />
            </View>
        </TouchableOpacity>;
    }


    render() {
        let idTypeList = this.state.listIdTypes;
        let idTypeItems = null;
        if (idTypeList && idTypeList.length > 0) {
            idTypeItems = idTypeList.map((s, i) => {
                return <Picker.Item key={i} value={s.IdTypeCode}
                    label={s.IdTypeDesc} />
            });
        }
        return (
            <View style={[MySaleStyle.flex1]}>
                <View>
                    {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}
                    {GlobalHelper.generalParams && GlobalHelper.generalParams.IsCustEnable && !this.props.customer &&
                        <View style={[styles.CustModeButtonContainer, MySaleStyle.flexRow]}>
                            <TouchableOpacity style={[MySaleStyle.flexRow, styles.CustModeButtonBackground, styles.rightBtnBorder, (!this.state.isExistCustMode ? styles.CustModeButtonBackgoundSelected : styles.CustModeButtonBackgoundNotSelected)]} onPress={() => { this.setCustExist(false) }} >
                                <Text style={[styles.CustModeButtonText, (!this.state.isExistCustMode ? styles.CustModeButtonTextSelected : styles.CustModeButtonTextNotSelected)]}>לקוח מזדמן</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[MySaleStyle.flexRow, styles.CustModeButtonBackground, styles.leftBtnBorder, (this.state.isExistCustMode ? styles.CustModeButtonBackgoundSelected : styles.CustModeButtonBackgoundNotSelected)]} onPress={() => { this.setCustExist(true) }} >
                                <Text style={[styles.CustModeButtonText, (this.state.isExistCustMode ? styles.CustModeButtonTextSelected : styles.CustModeButtonTextNotSelected)]}>לקוח קיים</Text>
                            </TouchableOpacity>

                        </View>}
                    {this.state.isExistCustMode &&
                        // Search Panel
                        <View style={MySaleStyle.margTop10}>
                            <View style={[MySaleStyle.flexRow, styles.existCustSearchContainer]}>
                                {/* Cust Id Type */}
                                <TouchableNativeFeedback style={[MySaleStyle.flexRow]}>
                                    <Picker
                                        selectedValue={this.state.custIdType}
                                        style={styles.pickerCustIdType}
                                        onValueChange={(itemValue, itemIndex) => this.handleCustIdTypeChange(itemValue)}>
                                        {idTypeItems}
                                    </Picker>
                                </TouchableNativeFeedback>
                                {/* Cust Id Num */}
                                <TouchableNativeFeedback style={[MySaleStyle.flexRow]}>
                                    <TextInput value={this.state.custIdNum} keyboardType={"decimal-pad"} autoCapitalize={"none"} textAlign={'center'}
                                        style={[MySaleStyle.inputTextFont, styles.inputText]}
                                        underlineColorAndroid={'#d5d5d5'}
                                        maxLength={100} onChangeText={(custIdNum) => this.setState({ custIdNum })} />
                                </TouchableNativeFeedback>
                            </View>
                            {/* Search Button */}
                            <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop15]}>
                                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                                    onPress={() => { this.searchCustomers() }} >
                                    <Text style={MySaleStyle.PartnerButtonText}>חיפוש לקוח</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Search Results */}
                            <View style={MySaleStyle.margTop10}>
                                {!this.state.isLoading && <Text style={[styles.resultsCounter]}>{this.state.resultsCounter}</Text>}
                                {this.state.isLoading ?
                                    <MyActivityIndicator /> :
                                    <View style={[MySaleStyle.flex1]}>
                                        {this.state.customersData && this.state.customersData.length > 0 &&
                                            <View style={[MySaleStyle.flex1, MySaleStyle.margBtm5]}>
                                                <View style={[MySaleStyle.flex1, MySaleStyle.padRight10]}>

                                                    <View style={[MySaleStyle.flex1]}>
                                                        {this.state.customersData.map((cust, index) => this.renderCustomer(cust, index))}
                                                    </View>

                                                </View>
                                            </View>
                                        }
                                    </View>
                                }
                                {this.state.showCustomerDetails &&
                                    <CustomerDetailsModal
                                        customerDetailsModalCallback={this.customerDetailsModalCallback}
                                        closeCustomerModal={() => this.setState({ showCustomerDetails: false })}
                                        custToView={this.state.selectedCustomer}
                                    />
                                }
                            </View>
                        </View>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    lastRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: -8,
    },
    CustModeButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    CustModeButtonBackground: {
        paddingRight: 20,
        paddingLeft: 20,
        paddingHorizontal: 25,
        paddingVertical: 15,
        height: 60,
        borderWidth: 2,
        borderColor: '#000',
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightBtnBorder: {
        borderRightWidth: 1
    },
    leftBtnBorder: {
        borderLeftWidth: 1
    },
    CustModeButtonBackgoundSelected: {
        backgroundColor: '#2cd5c4',
    },
    CustModeButtonBackgoundNotSelected: {
        backgroundColor: '#e5e5e5',
    },
    CustModeButtonText: {
        fontSize: 18,
        fontWeight: '400',
        fontFamily: 'simpler-regular-webfont'
    },
    CustModeButtonTextSelected: {
        fontFamily: 'simpler-regular-webfont'
    },
    CustModeButtonTextNotSelected: {
        fontFamily: 'simpler-light-webfont'
    },
    pickerCustIdType: {
        height: 50,
        width: 150,
        marginTop: 7,
        fontFamily: 'simpler-regular-webfont'
    },
    inputText: {
        marginTop: 13,
        //marginLeft: 30,
        //paddingRight: 10,
        //paddingLeft: 10,
        //alignSelf: 'flex-end', 
        fontSize: 18,
        width: 170,
        fontFamily: 'simpler-regular-webfont'
        //textAlign: 'right',
    },
    invalidInputText: {
        marginTop: 13,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 150,
        color: Colors.redColor,
        fontFamily: 'simpler-regular-webfont'
    },
    existCustSearchContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    searchCustBackground: {
        paddingRight: 20,
        paddingLeft: 20,
        backgroundColor: '#2cd5c4',
        paddingHorizontal: 25,
        paddingVertical: 5,
        height: 40,
        width: '80%',
        alignItems: 'center'
    },
    searchCustBackgroundDisabled: {
        paddingRight: 20,
        paddingLeft: 20,
        backgroundColor: '#d5d5d5',
        paddingHorizontal: 25,
        paddingVertical: 5,
        height: 40,
        width: '80%',
        alignItems: 'center'
    },
    resultsCounter: {
        fontWeight: 'bold',
        marginTop: 15,
        alignSelf: 'center',
        textAlign: 'center'
    },
    separator: {
        fontSize: 20,
        fontFamily: 'simpler-regular-webfont'
    },
    rowText: {
        paddingRight: 10,
        fontSize: 16,
        flex: 1,
        textAlign: 'left',
        fontFamily: 'simpler-regular-webfont'
    },
});

function mapStateToProps(state, props) {
    return {
        customer: state.connectionDetailsReducer.customer
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCustomer);
import React from 'react';
import Checkbox from 'expo-checkbox';
import { AppRegistry, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingLabelInput from '../components/FloatingLabelInput';
import MyActivityIndicator from '../components/MyActivityIndicator';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';
import Colors from '../constants/Colors';
import ModalMessage from '../components/ModalMessage';
import Camera from '../components/Camera';
import Api from '../api/api';
import ModalFilterPicker from 'react-native-modal-filter-picker';

export default class CustInvoiceDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            submitted: false,
            globalMessage: '',
            listCustIdType: [],
            isMailOnly: false,
            customerName: '',
            customerPhone: '',
            emailAddress: '',
            custIdType: '',
            isRequireCustIdNum: false,
            custIdNum: '',
            remarks: '',
            eilatFlag: false,
            isEilatResident: false,
            cities: [],
            city: '',
            streets: [],
            street: '',
            houseNumber: '',
            zipCode: '',
            eilatResidentBase64EncodedImage: null,
            showCamera: false,
            showCitiesModal: false,
            showStreetsModal: false
        };
    }

    componentDidMount() {
        this.setState({
            listCustIdType: GlobalHelper.generalParams?.ListCustIdType ?? [],
            custIdType: GlobalHelper.generalParams?.ListCustIdType?.length > 0 &&
                GlobalHelper.generalParams.ListCustIdType[0].CustIdTypeCode
        });
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            customerName: newProps.custName,
            custIdType: newProps.custIdType,
            custIdNum: newProps.custId,
            customerPhone: newProps.custPhone,
            emailAddress: newProps.custEmail != 'null' ? newProps.custEmail : '',
            remarks: newProps.custRemarks,
            eilatFlag: newProps.eilatFlag,
            isEilatResident: newProps.isEilatResident,
            eilatResidentBase64EncodedImage: newProps.eilatResidentBase64EncodedImage,
            addressRequired: newProps.addressRequired,
            cities: newProps.cities,
            city: newProps.city,
            street: newProps.street,
            houseNumber: newProps.houseNumber,
            zipCode: newProps.zipCode
        });
    }

    handleCustIdTypeChange(selectedValue) {
        let idTypesItems = this.state.listCustIdType;
        const requireCustIdNum = idTypesItems.filter(idType => idType.CustIdTypeCode == selectedValue)[0].IsRequireCustIdNum;
        this.setState({
            isRequireCustIdNum: requireCustIdNum,
            custIdType: selectedValue
        });
    }

    isDigitsOnly(text) {
        const noDigits = text.replace(/[^0-9\.]/g, '');
        if (text != noDigits) {
            return false;
        }
        return true;
    }

    setValidationError(errMsg) {
        this.setState({ globalMessage: errMsg, });
        //ToastAndroid.show(errMsg, ToastAndroid.SHORT);
    }

    clearFields() {
        this.setState({
            isLoading: false,
            globalMessage: '',
            isMailOnly: false,
            customerName: '',
            custIdType: 'UNIDENTIFIED',
            custIdNum: '',
            customerPhone: '',
            emailAddress: '',
            remarks: '',
            isEilatResident: false,
            eilatFlag: false,
            addressRequired: false,
            city: '',
            street: '',
            houseNumber: '',
            zipCode: ''
        });
    }

    formIsValid() {
        this.setState({ submitted: true });

        if (this.props.phoneRequired && this.state.customerPhone == '')
            return false;

        let result;

        if (this.props.detailsRequired) {
            result = (!this.state.isMailOnly || GlobalHelper.isEmailValid(this.state.emailAddress)) &&
                this.state.customerName.length >= 2 && this.state.custIdType != 'UNIDENTIFIED' &&
                ((this.state.custIdType == 'ID_NUM' && GlobalHelper.validateIdNum(this.state.custIdNum)) ||
                    ((this.state.custIdType != 'ID_NUM' && this.state.custIdNum.length > 4)));
        } else {
            result = (!this.state.isMailOnly || GlobalHelper.isEmailValid(this.state.emailAddress));

            result = result && (this.state.customerName == '' || this.state.customerName.length >= 2);

            if (this.state.isRequireCustIdNum || (this.state.custIdNum != '' && this.state.custIdType == 'ID_NUM')) {
                result = result && GlobalHelper.validateIdNum(this.state.custIdNum);
            }
        }

        if (this.props.addressRequired) {
            result = result && this.state.city && (this.state.street || this.state.streets.length == 0) &&
                this.state.houseNumber;
        }

        if (this.state.isEilatResident) {
            result = result && this.state.eilatResidentBase64EncodedImage;
        }

        return result;
    }

    onChangeCity(selectedCity) {
        this.setState({ showCitiesModal: false, city: selectedCity.label, street: '' })

        Api.post('/GetStreetsByCity', { strCityCode: selectedCity.key }).then(resp => {
            if (resp.d && resp.d.IsSuccess) {
                this.setState({ streets: resp.d.List });
            } else {
                alert(resp.d.FriendlyMessage);
            }
        });
    }

    takePictureCallback = (encodedPicture) => {
        this.setState({ eilatResidentBase64EncodedImage: encodedPicture, showCamera: false });
    };

    render() {
        return (<View style={[MySaleStyle.viewScreen, { marginBottom: 15 }]}>
            {this.state.isLoading ?
                <MyActivityIndicator /> :
                <View style={MySaleStyle.flex1}>
                    <Text style={MySaleStyle.textHeader}>פרטי הלקוח לחשבונית</Text>
                    <View>
                        {/* Customer Name */}
                        <View style={{ flex: 1, padding: 15 }}>
                            <FloatingLabelInput
                                label="שם לקוח"
                                value={this.state.customerName}
                                textAlign={'right'}
                                maxLength={100}
                                underlineColorAndroid={this.props.detailsRequired && !this.state.customerName ? Colors.redColor : undefined}
                                onChangeText={(customerName) => this.setState({ customerName })} />
                            {this.state.submitted && this.props.detailsRequired && this.state.customerName.length < 2 &&
                                <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין שם לקוח</Text>}
                        </View>
                        {/* Cust Id Type Picker */}
                        <View style={{ flex: 1, flexDirection: 'row', padding: 15, marginLeft: 31 }}>
                            <View style={{ flex: 0.4 }}>
                                <Dropdown label='סוג זיהוי' labelFontSize={14} value={this.state.custIdType}
                                    baseColor={this.props.detailsRequired && (this.state.custIdType === 'UNIDENTIFIED' ||
                                        this.state.custIdType === '') ? Colors.redColor : undefined}
                                    data={this.state.listCustIdType.map((a) => { return { value: a.CustIdTypeCode, label: a.CustIdTypeDesc } })}
                                    onChangeText={(value, i, data) => { this.setState({ custIdType: value, custIdTypeDesc: data[i].label }) }} />
                                {this.state.submitted && this.props.detailsRequired &&
                                    (this.state.custIdType === 'UNIDENTIFIED' || this.state.custIdType === '') &&
                                    <Text style={{ color: Colors.redColor, fontFamily: 'simpler-regular-webfont' }}>נא לבחור סוג זיהוי</Text>}
                            </View>
                            {/* Cust Id Num */}
                            {this.state.custIdType != '' && this.state.custIdType != 'UNIDENTIFIED' &&
                                <View style={{ flex: 0.6, marginTop: 17 }}>
                                    <FloatingLabelInput
                                        label={this.state.custIdTypeDesc || this.state.listCustIdType.filter(a => a.CustIdTypeCode == this.state.custIdType)[0].CustIdTypeDesc}
                                        value={this.state.custIdNum}
                                        textAlign={'right'}
                                        maxLength={30}
                                        underlineColorAndroid={this.props.detailsRequired && !this.state.custIdNum ? Colors.redColor : undefined}
                                        keyboardType='numeric'
                                        onChangeText={(custIdNum) => this.setState({ custIdNum })} />
                                    {this.state.submitted && ((this.props.detailsRequired || this.state.isRequireCustIdNum) &&
                                        (this.state.custIdType == 'ID_NUM' && (this.state.custIdNum == '' || !GlobalHelper.validateIdNum(this.state.custIdNum))) ||
                                        this.state.custIdType == 'ID_NUM' && this.state.custIdNum != '' && !GlobalHelper.validateIdNum(this.state.custIdNum)) &&
                                        <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר ת.ז חוקי</Text>}
                                </View>}
                        </View>
                        {/* Cust Phone */}
                        <View style={{ flex: 1, padding: 15 }}>
                            <FloatingLabelInput
                                label="מספר טלפון"
                                value={this.state.customerPhone}
                                textAlign={'right'}
                                maxLength={10}
                                keyboardType='numeric'
                                underlineColorAndroid={((this.props.phoneRequired && !this.state.customerPhone) || (this.state.customerPhone && ((this.state.customerPhone.length < 9 || this.state.customerPhone.length > 10)) )) ? Colors.redColor : undefined}
                                onChangeText={(customerPhone) => this.setState({ customerPhone })} />
                            {this.state.submitted && this.props.phoneRequired && this.state.customerPhone == '' &&
                                <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון</Text>}
                        </View>

                        {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}
                        <View style={[MySaleStyle.flexRow, { paddingLeft: 38, paddingTop: 10 }]}>
                            <Checkbox style={styles.margCB} color={Colors.partnerColor} value={this.state.isMailOnly} onValueChange={(value) => this.setState({ isMailOnly: value })} />
                            <Text style={[styles.padLabelOfSwitch, MySaleStyle.margTop15, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>שלח חשבונית במייל בלבד</Text>
                        </View>
                        {/* Email address */}
                        {this.state.isMailOnly &&
                            <View style={{ flex: 1, padding: 15 }}>
                                <FloatingLabelInput
                                    label="כתובת מייל"
                                    value={this.state.emailAddress}
                                    textAlign={'left'}
                                    keyboardType='email-address'
                                    maxLength={100}
                                    underlineColorAndroid={(this.props.detailsRequired || this.state.isMailOnly) && !this.state.emailAddress ? Colors.redColor : undefined}
                                    onChangeText={(emailAddress) => this.setState({ emailAddress: emailAddress.trim() })}
                                />
                                {this.state.submitted && this.state.isMailOnly && (this.state.emailAddress == '' || !GlobalHelper.isEmailValid(this.state.emailAddress)) &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין כתובת מייל חוקית</Text>}
                            </View>}
                        {this.state.eilatFlag &&
                            <View style={[MySaleStyle.flexRow, { paddingLeft: 38, paddingTop: 10 }]}>
                                <Checkbox style={styles.margCB} color={Colors.partnerColor} value={this.state.isEilatResident} onValueChange={(value) => this.setState({ isEilatResident: value })} />
                                <Text style={[styles.padLabelOfSwitch, MySaleStyle.margTop15, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>תושב אילת</Text>
                            </View>}
                        {this.state.isEilatResident &&
                            <View style={[MySaleStyle.flexRow, { paddingLeft: 20, paddingRight: 20 }]}>
                                <View style={[MySaleStyle.flexRow, MySaleStyle.flex1, { alignItems: 'center', justifyContent: 'space-between' }]}>
                                    {this.state.eilatResidentBase64EncodedImage ?
                                        <View style={[MySaleStyle.flexRow, { marginRight: 20 }]}>
                                            <MCIcon style={{ paddingRight: 20 }} color={Colors.partnerColor} name={'check'} size={25} />
                                            <Text style={{ paddingTop: 4 }}>צילום תעודת תושב נקלט בהצלחה</Text>
                                        </View> :
                                        <View style={[MySaleStyle.flexRow, { paddingTop: 6 }]}>
                                            <MCIcon style={{ paddingRight: 20 }} color={Colors.redColor} name={'close'} size={25} />
                                            <Text style={{ paddingTop: 4 }}>נא לצלם תעודת תושב</Text>
                                        </View>}
                                    <TouchableOpacity style={[MySaleStyle.smallButtonBackground, { marginRight: 20 }]} onPress={() => this.setState({ showCamera: true })}>
                                        <Text style={MySaleStyle.PartnerButtonText}>לצילום</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                        {this.state.showCamera && <Camera takePictureCallback={this.takePictureCallback} imageType={'תעודת תושב'}
                            closeCamera={() => this.setState({ showCamera: false })} />}
                        {this.state.addressRequired &&
                            <View style={{ flex: 1, padding: 15 }}>
                                <TouchableOpacity onPress={() => this.setState({ showCitiesModal: true })}>
                                    <FloatingLabelInput
                                        label="יישוב"
                                        value={this.state.city}
                                        textAlign={'right'}
                                        editable={false}
                                        underlineColorAndroid={this.state.submitted && !this.state.city ? Colors.redColor : undefined} />
                                    {this.state.submitted && this.state.city == '' &&
                                        <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא לבחור יישוב</Text>}
                                </TouchableOpacity>
                                <ModalFilterPicker
                                    visible={this.state.showCitiesModal}
                                    onSelect={(selectedCity) => this.onChangeCity(selectedCity)}
                                    onCancel={() => this.setState({ showCitiesModal: false })}
                                    options={this.state.cities.map((c) => { return { key: c.Value, label: c.Label } })}
                                    title='בחירה עיר'
                                    placeholderText='סינון...'
                                    cancelButtonText='ביטול'
                                    noResultsText='לא נמצאו התאמות'
                                    //autoFocus={true}
                                    cancelButtonStyle={MySaleStyle.smallButtonBackground}
                                    cancelButtonTextStyle={MySaleStyle.PartnerButtonText} />
                            </View>}
                        {this.state.addressRequired &&
                            <View style={{ flex: 1, padding: 15 }}>
                                <TouchableOpacity onPress={() => this.setState({ showStreetsModal: true })}>
                                    <FloatingLabelInput
                                        label="רחוב"
                                        value={this.state.street}
                                        textAlign={'right'}
                                        editable={false}
                                        underlineColorAndroid={this.state.submitted && this.state.streets.length > 0 && this.state.street === '' ? Colors.redColor : undefined}
                                        onChangeText={(street) => this.setState({ street })} />
                                    {this.state.submitted && this.state.streets.length > 0 && this.state.street === '' &&
                                        <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא לבחור רחוב</Text>}
                                </TouchableOpacity>
                                <ModalFilterPicker
                                    visible={this.state.showStreetsModal}
                                    onSelect={(selectedStreet) => this.setState({ street: selectedStreet.label, showStreetsModal: false })}
                                    onCancel={() => this.setState({ showStreetsModal: false })}
                                    options={this.state.streets.map((s) => { return { key: s.Value, label: s.Label } })}
                                    title='בחירת רחוב'
                                    placeholderText='סינון...'
                                    cancelButtonText='ביטול'
                                    noResultsText='לא נמצאו התאמות'
                                    //autoFocus={true}
                                    cancelButtonStyle={MySaleStyle.smallButtonBackground}
                                    cancelButtonTextStyle={MySaleStyle.PartnerButtonText} />
                            </View>}
                        {this.state.addressRequired &&
                            <View style={{ flex: 1, padding: 15 }}>
                                <FloatingLabelInput
                                    label="מספר בית"
                                    value={this.state.houseNumber}
                                    textAlign={'right'}
                                    maxLength={3}
                                    keyboardType='numeric'
                                    underlineColorAndroid={this.state.submitted && !this.state.houseNumber ? Colors.redColor : undefined}
                                    onChangeText={(houseNumber) => this.setState({ houseNumber })} />
                                {this.state.submitted && this.state.houseNumber == '' &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר בית</Text>}
                            </View>}
                        {this.state.addressRequired &&
                            <View style={{ flex: 1, padding: 15 }}>
                                <FloatingLabelInput
                                    label="מיקוד"
                                    value={this.state.zipCode}
                                    textAlign={'right'}
                                    maxLength={10}
                                    keyboardType='numeric'
                                    onChangeText={(zipCode) => this.setState({ zipCode })} />
                            </View>}
                        {/* Remarks Textarea */}
                        <View style={{ flex: 1, padding: 15 }}>
                            <FloatingLabelInput
                                label="הערות"
                                value={this.state.remarks}
                                textAlign={'right'}
                                maxLength={1000}
                                onChangeText={(remarks) => this.setState({ remarks })} />
                        </View>
                        {/* </ScrollView> */}
                    </View>
                </View>
            }
        </View>);
    }
}//End Export

const styles = StyleSheet.create({
    padLabelOfSwitch: {
        paddingLeft: 30
    },
    margCB: {
        marginTop: 12
    },
    inputBasicWidth: {
        width: 220,
    },
    inputText: {
        marginTop: 13,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 220,
        fontFamily: 'simpler-regular-webfont'
    },
    invalidInputText: {
        marginTop: 13,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 220,
        color: Colors.redColor,
        fontFamily: 'simpler-regular-webfont'
    },
    inputTextMargTopBig: {
        marginTop: 18,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 220,
        fontFamily: 'simpler-regular-webfont'
    },
    invalidInputTextMargTopBig: {
        marginTop: 18,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 220,
        color: Colors.redColor,
        fontFamily: 'simpler-regular-webfont'
    },
    inputLarge: {
        marginTop: 13,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 270,
        fontFamily: 'simpler-regular-webfont'
    },
    invalidLargeMail: {
        marginTop: 13,
        marginLeft: 30,
        paddingRight: 10,
        paddingLeft: 10,
        alignSelf: 'center',
        fontSize: 18,
        width: 270,
        color: Colors.redColor,
        fontFamily: 'simpler-regular-webfont'
    },
    inputLargeMargTopBig: {
        marginTop: 18,
        //marginLeft: 30,
        alignSelf: 'center',
        fontSize: 18,
        width: 250,
        fontFamily: 'simpler-regular-webfont'
    },
    textAreaContainer: {
        borderColor: "#a5a5a5",
        borderWidth: 1,
        padding: 5,
        margin: 5
    },
    textArea: {
        height: 100,
        justifyContent: "flex-start",
        textAlign: 'right',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //marginTop: -8,
    },
    pickerCustIdType: {
        height: 50,
        width: 200,
        marginTop: 7,
    },
});

AppRegistry.registerComponent('CustInvoiceDetails', () => CustInvoiceDetails);
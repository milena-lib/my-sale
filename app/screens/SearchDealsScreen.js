import React from 'react';
import {
  AppRegistry, View, Text, StyleSheet, KeyboardAvoidingView, ToastAndroid,
  TouchableOpacity, TouchableNativeFeedback, DatePickerAndroid, ScrollView
} from 'react-native';
import Api from '../api/api';
import { Dropdown } from 'react-native-material-dropdown';
import UserDetails from '../components/UserDetails';
import MySaleStyle from '../constants/Styles';
import OrgUnitComponent from '../components/OrgUnitComponent';
import MyActivityIndicator from '../components/MyActivityIndicator';
import Consts from '../constants/Consts';
import { connect } from 'react-redux';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import FloatingLabelInput from '../components/FloatingLabelInput';

export class SearchDealsScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      AllowSearchAllOrgUnits: '',
      //IsSuccess: true,
      globalMessage: '',
      dateFrom: Consts.dateDefaultValue,
      dateTo: Consts.dateDefaultValue,
      paymentType: '',
      cardNum: '',
      custPhoneNum: '',
      catalogNum: '',
      invoiceNum: '',
      searchOrgUnit: '',
      custIdNum: '',
      dealsData: null,
      //To be sent to search results
      sendToSearchDateFrom: '',
      sendToSearchDateTo: '',
      dealStatus: 'ALL',
      sendToSearchPaymentType: '',
      sendToSearchCardNum: '',
      sendToSearchCustPhoneNum: '',
      sendToSearchCatalogNum: '',
      sendToSearchInvoiceNum: '',
      sendToSearchOrgUnit: '',
      sendToSearchCustIdNum: '',
    };
    this.parentOrgUnitHandler = this.parentOrgUnitHandler.bind(this);
  }

  componentDidMount() {
    this.setState({
      AllowSearchAllOrgUnits: this.props.userDetails.AllowSearchAllOrgUnits,
      searchOrgUnit: GlobalHelper.orgUnitCode,
    });

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      if (this.props.route.params?.refresh) {
        this.props.route.params.refresh = false;
        this.searchDeals();
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  //This function is being called from the child component OrgUnitComponent when it is being updated
  parentOrgUnitHandler(OrgUnitCode) {
    this.setState({ searchOrgUnit: OrgUnitCode });
  }

  //Add a leading zero if missing
  twoDigits(num) {
    if (String(num).length == 1) {
      return '0' + num;
    }
    return num;
  }

  DaysDiff(d1, d2) {
    let d1TotDays = ((parseInt(d1.substring(6, 10), 10) - 1) * 365) + ((parseInt(d1.substring(3, 5), 10) - 1) * 31) + parseInt(d1.substring(0, 2), 10);
    let d2TotDays = ((parseInt(d2.substring(6, 10), 10) - 1) * 365) + ((parseInt(d2.substring(3, 5), 10) - 1) * 31) + parseInt(d2.substring(0, 2), 10);
    let days = parseInt(d2TotDays) - parseInt(d1TotDays);
    //return days <= 0 ? 0 : days;
    //Alert.alert('days = ' + days);
    return days;
  }

  // DatePicker handler
  async openUpPicker(type) {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: new Date(),
        mode: 'default',
        maxDate: new Date(),
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        let formattedDate = this.twoDigits(String(day)) + '/' + this.twoDigits(String(month + 1)) + '/' + year;

        if (type == 'start') {
          if (formattedDate && this.DaysDiff(formattedDate, this.state.dateTo) < 0) {
            this.setState({ globalMessage: 'נא להזין מועד התחלה מוקדם ממועד הסיום' });
            return;
          }
          else {
            this.setState({ dateFrom: formattedDate });
          }
        }
        else {
          if (this.state.dateFrom && this.DaysDiff(this.state.dateFrom, formattedDate) < 0) {
            this.setState({ globalMessage: 'נא להזין מועד סיום מאוחר ממועד התחלה' });
            return;
          }
          else {
            this.setState({ dateTo: formattedDate });
          }
        }

      }
    } catch ({ code, message }) {
      this.setState({ globalMessage: 'אירעה שגיאה בפתיחת התאריכון ' + message });
    }
  }

  searchDeals() {
    this.setState({ isLoading: true });

    Api.post('/SearchDeals', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strDateFrom: this.state.dateFrom,
      strDateTo: this.state.dateTo,
      dealStatus: this.state.dealStatus,
      strPaymentType: this.state.paymentType,
      strCardNum: this.state.cardNum,
      strCatalogNum: this.state.catalogNum,
      strInvoiceNum: this.state.invoiceNum,
      strOrgUnitCode: this.state.searchOrgUnit,
      strCustPhone: this.state.custPhoneNum,
      strCustIdNum: this.state.custIdNum,
    }).then(resp => {
      this.setState({ isLoading: false });
      if (resp?.d?.IsSuccess) {
        this.setState({
          dealsData: resp.d.Deals,
          globalMessage: ''
        });

        //No results
        if (resp.d.Deals.length == 0) {
          let message = resp.d.FriendlyMessage ?? 'לא נמצאו עסקאות';
          ToastAndroid.show(message, ToastAndroid.SHORT);
        }
        else {
          this.props.navigation.navigate('Deals', { deals: resp.d.Deals, refreshDeals: () => this.searchDeals() });
        }
      }
      else {
        let msg = "אירעה שגיאה בחיפוש עסקאות";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          globalMessage: msg,
        });
      }
    });
  }

  clearSearch() {
    this.setState({
      dateFrom: Consts.dateDefaultValue,
      dateTo: Consts.dateDefaultValue,
      dealStatus: 'ALL',
      paymentType: '',
      cardNum: '',
      custPhoneNum: '',
      catalogNum: '',
      invoiceNum: '',
      searchOrgUnit: GlobalHelper.orgUnitCode,
      custIdNum: '',
    });
  }


  render() {
    let paymentMethods = [{ "Key": "", "Value": "הכל" }, { "Key": "CREDIT", "Value": "כרטיס אשראי" }, { "Key": "CASHBOX", "Value": "תשלום בקופה" }, { "Key": "BILL_PAYMENT", "Value": "חשבונית חודשית" }];
    let dealStatuses = [{ "Key": "ALL", "Value": "הכל" }, { "Key": "COMPLETED", "Value": "הושלם" }, { "Key": "INCOMPLETED", "Value": "לא הושלם" }];

    return <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={1000} behavior="height" enabled>
      <View style={[MySaleStyle.viewScreen]}>
        <UserDetails navigation={this.props.navigation} />
        {this.state.isLoading ?
          <MyActivityIndicator /> : <>
            <View style={MySaleStyle.flex1}>
              <Text style={MySaleStyle.textHeader}>חיפוש עסקאות</Text>
              <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 10 }} ref={r => this.scrollView = r}>
                <View>
                  {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}
                  {/* Dates range fields */}
                  <View style={[MySaleStyle.margTop20, MySaleStyle.flexRow, { paddingRight: 20, paddingLeft: 30, marginRight: 15, marginLeft: 15 }]}>
                    {/* <Text style={[MySaleStyle.margTop20, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>מתאריך</Text> */}
                    <View>
                      <Text style={[styles.labelStyle]}>מתאריך</Text>
                      <TouchableNativeFeedback onPress={() => this.openUpPicker('start')} style={MySaleStyle.flexRow}>
                        <Text style={[MySaleStyle.normalFont, styles.inputDate,
                        MySaleStyle.flexRow, { marginTop: 2, borderBottomColor: 'rgba(0, 0, 0, .38)', borderBottomWidth: 1 }]}>{this.state.dateFrom}</Text>
                      </TouchableNativeFeedback>
                    </View>
                    <View style={{ marginLeft: 50 }}>
                      <Text style={[styles.labelStyle]}>ועד לתאריך</Text>
                      <TouchableNativeFeedback onPress={() => this.openUpPicker('end')} style={MySaleStyle.flexRow}>
                        <Text style={[MySaleStyle.normalFont, styles.inputDate,
                        MySaleStyle.flexRow, { marginTop: 2, borderBottomColor: 'rgba(0, 0, 0, .38)', borderBottomWidth: 1 }]}>{this.state.dateTo}</Text>
                      </TouchableNativeFeedback>
                    </View>
                  </View>
                  <View style={{ flex: 1, paddingRight: 15, paddingLeft: 15, marginLeft: 30, marginRight: 30, marginBottom: -5 }}>
                    <Dropdown label='סטאטוס עסקה' labelFontSize={14} value={this.state.dealStatus}
                      fontSize={17} style={{ fontFamily: 'simpler-regular-webfont' }}
                      data={dealStatuses.map((a) => { return { value: a.Key, label: a.Value } })}
                      onChangeText={value => this.setState({ dealStatus: value })} />
                  </View>
                  {/* Payment Type field */}
                  <View style={{ flex: 1, paddingRight: 15, paddingLeft: 15, marginLeft: 30, marginRight: 30, marginBottom: -5 }}>
                    <Dropdown label='אמצעי תשלום' labelFontSize={14} value={this.state.paymentType}
                      fontSize={17} style={{ fontFamily: 'simpler-regular-webfont' }}
                      data={paymentMethods.map((a) => { return { value: a.Key, label: a.Value } })}
                      onChangeText={value => this.setState({ paymentType: value })} />
                  </View>
                  {/* Customer Id Num */}
                  <View style={[{ paddingRight: 15, paddingLeft: 15 }, MySaleStyle.margTop15]}>
                    <FloatingLabelInput
                      label='מספר זהות לקוח'
                      keyboardType='numeric'
                      value={this.state.custIdNum}
                      textAlign={'right'}
                      maxLength={100}
                      onChangeText={(custIdNum) => this.setState({ custIdNum })} />
                  </View>
                  {/* Four last digits of payment number */}
                  <View style={[{ paddingRight: 15, paddingLeft: 15 }, MySaleStyle.margTop15]}>
                    <FloatingLabelInput
                      label='ארבע ספרות אחרונות'
                      keyboardType='numeric'
                      value={this.state.cardNum}
                      textAlign={'right'}
                      maxLength={4}
                      onChangeText={(cardNum) => this.setState({ cardNum })} />
                  </View>
                  {/* Cust phone number */}
                  <View style={[{ paddingRight: 15, paddingLeft: 15 }, MySaleStyle.margTop15]}>
                    <FloatingLabelInput
                      label='מספר טלפון'
                      keyboardType='numeric'
                      value={this.state.custPhoneNum}
                      textAlign={'right'}
                      maxLength={10}
                      onChangeText={(custPhoneNum) => this.setState({ custPhoneNum })} />
                  </View>
                  {/* Catalog Num */}
                  <View style={[{ paddingRight: 15, paddingLeft: 15 }, MySaleStyle.margTop15]}>
                    <FloatingLabelInput
                      label='מק"ט'
                      value={this.state.catalogNum}
                      textAlign={'right'}
                      maxLength={1000}
                      onChangeText={(catalogNum) => this.setState({ catalogNum })} />
                  </View>
                  {/* Invoice Num */}
                  <View style={[{ paddingRight: 15, paddingLeft: 15 }, MySaleStyle.margTop15]}>
                    <FloatingLabelInput
                      label='מספר חשבונית'
                      keyboardType='numeric'
                      value={this.state.invoiceNum}
                      textAlign={'right'}
                      maxLength={1000}
                      onChangeText={(invoiceNum) => this.setState({ invoiceNum })} />
                  </View>
                  {/* Org Unit field */}
                  <View style={[MySaleStyle.margTop20, { paddingRight: 30, paddingLeft: 30, marginRight: 15, marginLeft: 15 }]}>
                    <Text style={[styles.labelStyle]}>מרכז</Text>
                    <View style={{ marginTop: 2 }}>
                      <OrgUnitComponent
                        showModal={false}
                        parentCurrentOrgUnit={this.state.searchOrgUnit}
                        parentOrgUnitHandler={this.parentOrgUnitHandler}
                        parentIsDisabled={this.state.AllowSearchAllOrgUnits}
                        parentAddNullVal={true} />
                    </View>
                  </View>
                  {/* Search button */}
                  <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop40]}>
                    <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.searchDeals() }} >
                      <Text style={MySaleStyle.PartnerButtonText}>חיפוש</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Clear Button */}
                  <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop30]}>
                    <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.clearSearch() }} >
                      <Text style={MySaleStyle.PartnerButtonText}>ניקוי שדות</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        }
      </View>
    </KeyboardAvoidingView>
  }
}

function mapStateToProps(state, props) {
  return {
    userDetails: state.connectionDetailsReducer.userDetails,
    orgUnitDetails: state.connectionDetailsReducer.orgUnitDetails
  }
}

export default connect(mapStateToProps, null)(SearchDealsScreen);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingBottom: '10%',
  },
  textSecondLabelInRow: {
    paddingRight: 50,
  },
  pickerPaymentType: {
    height: 50,
    width: 200,
    marginTop: 7,
  },
  margTop7: {
    marginTop: 7,
  },
  inputDate: {
    //width: 200,
  },
  inputText: {
    marginTop: 7,
    marginLeft: 30,
    paddingRight: 10,
    paddingLeft: 10,
    paddingBottom: 6,
    alignSelf: 'center',
  },
  inputCardNum: {
    //backgroundColor: '#fff',
    width: 150,
  },
  inputCatalogNum: {
    width: 150,
    marginTop: 15
  },
  inputInvoiceNum: {
    width: 150,
    marginTop: 15
  },
  scrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    marginTop: 50,
  },
  labelStyle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, .38)',
    fontFamily: 'simpler-regular-webfont'
  }
});

AppRegistry.registerComponent('SearchDealsScreen', () => SearchDealsScreen);
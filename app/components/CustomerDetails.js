import React from 'react';
import {
  Text, View, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Image, ToastAndroid, TouchableNativeFeedback, TextInput
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import MySaleStyle from '../constants/Styles';
import MyActivityIndicator from '../components/MyActivityIndicator';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions';
import Consts from '../constants/Consts';
import ModalMessage from '../components/ModalMessage';
import Colors from '../constants/Colors';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Scale from '../components/Scale';
import FloatingLabelInput from './FloatingLabelInput';

export class CustomerDetailsModal extends React.Component {
  state = {
    isLoading: true,
    isLoadingContracts: false,
    isLoadingFinancial: false,
    isSuccess: true,
    globalMessage: '',
    contractsIsExpand: false,
    custContractsGroups: null,
    financialIsExpand: false,
    custFinancialInfo: null,
    actionButtonText: '',
    rejectMessage: '',
    customerExtraData: {},
    amount: ''
  };

  componentDidMount() {
    this.getCustomerExtraData();
  }

  getCustomerExtraData() {
    Api.post('/GetCustomerExtraData', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strBillingCustomerId: this.props.custToView.BillingCustomerId,
      strSessionId: this.props.custToView.SessionId
    }).then(resp => {
      if (resp.d && resp.d.IsSuccess) {
        this.setState({
          customerExtraData: resp.d.CustomerExtraDataObj,
          isSuccess: true,
          isLoading: false,
          globalMessage: ''
        });
      }
      else {
        let msg = "אירעה שגיאה בקבלת פרטים נוספים על הלקוח";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          isSuccess: false,
          isLoading: false,
          globalMessage: msg,
        });
      }
    });
  }

  toggleContractsInfo() {
    if (!this.state.contractsIsExpand && (!this.state.custContractsGroups || this.state.custContractsGroups.length == 0)) {
      this.getCustContracts();
    }
    else {
      this.setState({
        contractsIsExpand: !this.state.contractsIsExpand,
      });
    }
  }

  getCustContracts() {
    this.setState({ isLoadingContracts: true });
    Api.post('/GetCustomerContracts', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strCartId: GlobalHelper.cartId,
      strBillingCustomerId: this.props.custToView.BillingCustomerId,
    }).then(resp => {
      if (resp.d && resp.d.IsSuccess) {
        this.setState({
          custContractsGroups: resp.d.ContractsGroups,
          isSuccess: true,
          globalMessage: '',
          isLoadingContracts: false,
          contractsIsExpand: true
        });
        if ((resp.d.ContractsGroups.length > 0) && (resp.d.FriendlyMessage)) {
          ToastAndroid.show(resp.d.FriendlyMessage, ToastAndroid.SHORT);
        }
      }
      else {
        let msg = "אירעה שגיאה בקבלת נתוני המנויים";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          isSuccess: false,
          contractsIsExpand: false,
          globalMessage: msg,
          isLoadingContracts: false,
        });
      }
    });
  }

  getFinancialInfo() {
    this.setState({ isLoadingFinancial: true });
    Api.post('/GetCustomerFinanceInfo', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strCartId: GlobalHelper.cartId,
      strBillingCustomerId: this.props.custToView.BillingCustomerId,
      strAmount: this.state.amount
    }).then(resp => {
      if (resp.d && resp.d.IsSuccess) {
        if (resp.d.FinanceInfoObj.ConfirmStatus.toUpperCase() == 'REJECT') {
          this.setState({
            custFinancialInfo: resp.d.FinanceInfoObj,
            isSuccess: true,
            rejectMessage: resp.d.FriendlyMessage,
            isLoadingFinancial: false,
            financialIsExpand: true
          });
        } else {
          this.setState({
            custFinancialInfo: resp.d.FinanceInfoObj,
            isSuccess: true,
            globalMessage: '',
            rejectMessage: '',
            isLoadingFinancial: false,
            financialIsExpand: true
          });
        }
      }
      else {
        let msg = "אירעה שגיאה בקבלת הנתונים הפיננסיים";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          isSuccess: false,
          financialIsExpand: false,
          rejectMessage: '',
          globalMessage: msg,
          isLoadingFinancial: false,
        });
      }
    });
  }

  setActionButtonText() {
    let text = '';
    /* Switch from an existing customer to no customer */
    if (this.props.customer && (this.props.customer.BillingCustomerId == this.props.custToView.BillingCustomerId)) {
      btnText = 'התנתקות מהלקוח';
    }
    /* Switch from one existing customer to another existing customer */
    //(this.props.customer && (this.props.customer.BillingCustomerId != this.props.custToView.BillingCustomerId))
    else if (this.props.customer) {
      btnText = 'החלפה ללקוח זה';
    }
    /* Switch from no customer to an existing customer*/
    //if (!this.props.customer)
    else {
      btnText = 'בחירת לקוח';
    }
    if (GlobalHelper.cartId) {
      btnText = 'מחיקת הסל ו' + btnText
    }
    return btnText;
  }

  handleActionButton() {
    //Clear cart if required and set to no customer
    if (this.props.customer && (this.props.customer.BillingCustomerId == this.props.custToView.BillingCustomerId)) {
      this.clearCustomerAndCart(false);
    }
    //Clear cart if required and set to viewed customer
    else {
      this.clearCustomerAndCart(true);
    }
  }

  setCustomerForCart() {
    Api.post('/SetCartCust', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strCartId: GlobalHelper.cartId,
      strBillingCustomerId: this.props.custToView.BillingCustomerId,
      strSessionId: this.props.custToView.SessionId,
    }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        ToastAndroid.show('המכירה תתבצע עבור הלקוח ' + this.props.custToView.CustomerName, ToastAndroid.SHORT);
        this.props.setCustomer(this.props.custToView);
        this.props.customerDetailsModalCallback();
        this.props.closeCustomerModal();
      }
      else {
        let msg = "אירעה שגיאה בבחירה בלקוח לסל";
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

  clearCustomerAndCart(isSetCust) {
    if (!GlobalHelper.cartId) {
      this.props.clearCustomer();
      if (isSetCust) {
        this.setCustomerForCart();
      }
      else {
        this.props.customerDetailsModalCallback();
        this.props.closeCustomerModal();
        ToastAndroid.show('ההתנתקות מהלקוח הסתיימה בהצלחה', ToastAndroid.SHORT);
      }
    }
    else {
      Api.post('/DeleteCart', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId }).then(resp => {
        this.setState({ isLoading: false });
        if (resp.d && resp.d.IsSuccess) {
          this.props.clearCart();
          if (isSetCust) {
            this.props.clearCustomer();
            this.setCustomerForCart();
          }
          else {
            this.props.customerDetailsModalCallback();
            this.props.closeCustomerModal();
            this.props.clearCustomer();
          }
        }
        else {
          let msg = 'אירעה שגיאה בהתנתקות מהלקוח';
          if (resp.d.FriendlyMessage) {
            msg = resp.d.FriendlyMessage;
          } else if (resp.d.ErrorMessage) {
            msg = msg + ", " + resp.d.ErrorMessage;
          }
          this.setState({ globalMessage: Consts.globalErrorMessagePrefix + msg });
        }
      });
    }
  }

  renderContractsGroupItem = (item, index) => {
    let iconName = 'devices-other';
    switch (item.Lob.LobCode) {
      case 'VOB':
        iconName = 'local-phone';
        break;
      case 'TV':
        iconName = 'tv';
        break;
      case 'ISP':
        iconName = 'router';
        break;
      case 'GSM':
        iconName = 'phone-android';
        break;
      default:
        iconName = 'devices-other';
        break;
    }

    let contracts = item.ContractsList.map((s, i) => {
      return <View key={i}>
        <View style={[MySaleStyle.flex1, MySaleStyle.flexRow, MySaleStyle.margTop20]}>
          <Text style={[styles.contractTitle, MySaleStyle.flexRow]}>
            חוזה מספר {s.ContractId}
          </Text>
          <Text style={[MySaleStyle.partnerColor, MySaleStyle.bold, styles.separator, MySaleStyle.textAlignRight, MySaleStyle.flexRow]}> |  </Text>
          <MCIcon name={'circle'} size={20} color={s.ContractStatus == 'פעיל' ? '#68db68' : '#eb1515'} style={{ marginTop: 1, paddingRight: 5 }} />
          <Text style={[MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>
            {s.ContractStatus}
          </Text>
        </View>
        <Text style={[MySaleStyle.margTop5, MySaleStyle.normalFont, MySaleStyle.flex1]}>תיאור: {s.ContractDesc}</Text>
        {s.Msisdn != null && s.Msisdn != '' && <Text style={[MySaleStyle.margTop5, MySaleStyle.normalFont, MySaleStyle.flex1]}>מספר טלפון: {s.Msisdn}</Text>}
        {s.Rateplan != null && s.Rateplan != '' && <Text style={[MySaleStyle.margTop5, MySaleStyle.normalFont, MySaleStyle.flex1]}>תכנית תעריפים: {s.Rateplan}</Text>}
      </View>
    });


    return (
      <View key={index} style={{ marginBottom: 25 }}>
        <View style={[MySaleStyle.flexRow, MySaleStyle.margTop15]}>
          <MaterialIcon style={[MySaleStyle.flexRow]} name={iconName} size={30} color={Colors.partnerColor} />
          <Text style={[MySaleStyle.padRight10, styles.lobTitle, MySaleStyle.flexRow]}>{item.Lob.LobDesc} ({item.ContractsList.length})</Text>
        </View>
        {contracts}
      </View>
    )
  }

  render() {
    let imageSackTitle = null;
    switch (this.state.customerExtraData.VantiveSackColorHeb) {
      case 'ירוק':
        imageSackTitle = require('../assets/images/IconSackGreenNis.png');
        break;
      case 'אדום':
        imageSackTitle = require('../assets/images/IconSackRedNis.png');
        break;
      case 'אפור':
        imageSackTitle = require('../assets/images/IconSackGrayNis.png');
        break;
      case 'שחור':
        imageSackTitle = require('../assets/images/IconSackBlackNis.png');
        break;
      default:
        imageSackTitle = '';
    }
    return (
      <Modal style={{ flex: 1 }} isVisible={true} onRequestClose={this.props.closeCustomerModal}>
        {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={{ padding: 5, margin: 5 }}>
            {/* Customer Title */}
            <View >
              <View style={[styles.lastRow, MySaleStyle.flex1]}>
                <Text style={[MySaleStyle.margTop15, MySaleStyle.padRight10, MySaleStyle.textHeader, MySaleStyle.flex1]}>{this.props.custToView.CustomerName}</Text>
                <TouchableOpacity onPress={this.props.closeCustomerModal}>
                  <MCIcon name={'close'} size={40} color={MySaleStyle.darkGray} style={{ paddingRight: 20, marginTop: 5 }} />
                </TouchableOpacity>
              </View>
              {/* Customer Basic Info */}
              <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>מספר זהות: {this.props.custToView.CustIdNum}</Text>
              <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>מספר לקוח: {this.props.custToView.Custcode}</Text>
              <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>נייד מוביל: {this.props.custToView.PrimaryMobile}</Text>
              <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>קטגוריה: {this.props.custToView.CustomerClass}</Text>
              <Text style={[{ marginBottom: 5 }, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>
                חשבונית אחרונה: {this.props.custToView.LastBillingInvoiceDate}
                <Text style={[MySaleStyle.partnerColor, MySaleStyle.bold, styles.separator]}> | </Text>
                {GlobalHelper.formatNegativeNum(this.props.custToView.PreviousBalance)} ש"ח
              </Text>
              {!this.state.isLoading &&
                <View style={[MySaleStyle.flex1, MySaleStyle.flexRow, { paddingLeft: 10, marginTop: 2 }]}>
                  {imageSackTitle ?
                    <Image source={imageSackTitle} style={[MySaleStyle.flexRow, styles.iconSackSize]} />
                    :
                    <Text style={[MySaleStyle.textAlignRight, MySaleStyle.flexRow, MySaleStyle.normalFont, { marginTop: 2 }]}>צבע שק: {this.state.customerExtraData.VantiveSackColorHeb}</Text>
                  }
                  <Text style={[MySaleStyle.partnerColor, MySaleStyle.bold, styles.separator, MySaleStyle.textAlignRight, MySaleStyle.flexRow]}> | </Text>
                  <Text style={[MySaleStyle.textAlignRight, MySaleStyle.flexRow, MySaleStyle.normalFont, { marginTop: 2 }]}>{this.state.customerExtraData.PaymentMethod}</Text>

                  {this.state.customerExtraData.Last4Digits != null && this.state.customerExtraData.Last4Digits != '' &&
                    <View style={[MySaleStyle.flexRow]}>
                      <Text style={[MySaleStyle.partnerColor, MySaleStyle.bold, styles.separator, MySaleStyle.textAlignRight, MySaleStyle.flexRow]}> | </Text>
                      <Text style={[MySaleStyle.textAlignRight, MySaleStyle.flexRow, MySaleStyle.normalFont, { marginTop: 2 }]}>{this.state.customerExtraData.Last4Digits}</Text>
                    </View>
                  }
                </View>}

              <View style={[MySaleStyle.flexRow, MySaleStyle.margTop30, { marginLeft: 9, justifyContent: "center", alignItems: "center" }]}>
                {this.state.customerExtraData.TotalGsmContracts != null && this.state.customerExtraData.TotalGsmContracts != '' &&
                  (Number.parseInt(this.state.customerExtraData.TotalGsmContracts)) > 0 &&
                  <View style={[styles.padRight20, MySaleStyle.flexRow]}>
                    <MaterialIcon style={[MySaleStyle.flexRow]} name='phone-android' size={30} color={Colors.partnerColor} />
                    <Text style={[styles.padRight5, MySaleStyle.normalFont, MySaleStyle.flexRow]}>({this.state.customerExtraData.TotalGsmContracts})</Text>
                  </View>
                }
                {this.state.customerExtraData.TotalTvContracts != null && this.state.customerExtraData.TotalTvContracts != '' &&
                  (Number.parseInt(this.state.customerExtraData.TotalTvContracts)) > 0 &&
                  <View style={[styles.padRight20, MySaleStyle.flexRow]}>
                    <MaterialIcon style={[MySaleStyle.flexRow]} name='tv' size={30} color={Colors.partnerColor} />
                    <Text style={[styles.padRight5, MySaleStyle.normalFont, MySaleStyle.flexRow]}>({this.state.customerExtraData.TotalTvContracts})</Text>
                  </View>
                }
                {this.state.customerExtraData.TotalIspContracts != null && this.state.customerExtraData.TotalIspContracts != '' &&
                  (Number.parseInt(this.state.customerExtraData.TotalIspContracts)) > 0 &&
                  <View style={[styles.padRight20, MySaleStyle.flexRow]}>
                    <MaterialIcon style={[MySaleStyle.flexRow]} name='router' size={30} color={Colors.partnerColor} />
                    <Text style={[styles.padRight5, MySaleStyle.normalFont, MySaleStyle.flexRow]}>({this.state.customerExtraData.TotalIspContracts})</Text>
                  </View>
                }
                {this.state.customerExtraData.TotalVobContracts != null && this.state.customerExtraData.TotalVobContracts != '' &&
                  (Number.parseInt(this.state.customerExtraData.TotalVobContracts)) > 0 &&
                  <View style={[styles.padRight20, MySaleStyle.flexRow]}>
                    <MaterialIcon style={[MySaleStyle.flexRow]} name='local-phone' size={30} color={Colors.partnerColor} />
                    <Text style={[styles.padRight5, MySaleStyle.normalFont, MySaleStyle.flexRow]}>({this.state.customerExtraData.TotalVobContracts})</Text>
                  </View>
                }
              </View>

              {/* Action Button */}
              {this.state.isLoading && <MyActivityIndicator />}
              <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop30, MySaleStyle.margBtm5]}>
                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.handleActionButton() }} >
                  <Text style={MySaleStyle.PartnerButtonText}>{this.setActionButtonText()}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contracts Info */}
            <TouchableNativeFeedback onPress={() => this.toggleContractsInfo()}>
              <View>
                <View style={[MySaleStyle.margTop20, MySaleStyle.flexRow]}>
                  {this.state.isLoadingContracts ?
                    <View style={MySaleStyle.flexRow}>
                      <ActivityIndicator style={[MySaleStyle.flexRow, { marginTop: 2, paddingLeft: 16 }]} size="small" color={Colors.partnerColor} />
                      <Text style={[styles.subHeader, MySaleStyle.flexRow]}>מנויים</Text>
                    </View>
                    :
                    <View style={[MySaleStyle.flexRow, { paddingLeft: 10 }]}>
                      <MaterialIcon name="keyboard-arrow-left" size={35} color={Colors.partnerColor}
                        style={{ paddingRight: -22, marginRight: -22 }} />
                      <MaterialIcon name="keyboard-arrow-left" size={35} color={Colors.partnerColor}
                        style={{ paddingLeft: -22, marginLeft: -22 }} />
                      <Text style={[styles.subHeader, MySaleStyle.flexRow]}>מנויים</Text>
                    </View>
                  }
                </View>
                {this.state.contractsIsExpand == true && this.state.custContractsGroups &&
                  <View>
                    {this.state.custContractsGroups.length > 0 ?
                      this.state.custContractsGroups.map((cust, index) => this.renderContractsGroupItem(cust, index))
                      :
                      <Text style={[MySaleStyle.margTop15, MySaleStyle.normalFont, MySaleStyle.padRight10]}>ללקוח לא קיימים מנויים</Text>
                    }
                  </View>
                }
              </View>
            </TouchableNativeFeedback>

            {/* Financial Info */}
            <TouchableNativeFeedback onPress={() => this.setState({ financialIsExpand: !this.state.financialIsExpand })}>
              <View>
                <View style={[MySaleStyle.margTop20, MySaleStyle.flexRow]}>
                  <View style={[MySaleStyle.flexRow, { paddingLeft: 10 }]}>
                    <MaterialIcon name="keyboard-arrow-left" size={35} color={Colors.partnerColor}
                      style={{ paddingRight: -22, marginRight: -22 }} />
                    <MaterialIcon name="keyboard-arrow-left" size={35} color={Colors.partnerColor}
                      style={{ paddingLeft: -22, marginLeft: -22 }} />
                    <Text style={[styles.subHeader, MySaleStyle.flexRow]}>נתונים פיננסיים</Text>
                  </View>
                </View>
                {this.state.financialIsExpand == true &&
                  <View>
                    <FloatingLabelInput
                      label='סכום משוער'
                      keyboardType='numeric'
                      value={this.state.amount}
                      maxLength={8}
                      textAlign={'right'}
                      onChangeText={amount => this.setState({ amount })} />
                    <View style={{ padding: 30 }}>
                      <TouchableOpacity onPress={() => this.getFinancialInfo()}
                        style={[this.state.amount.length == 0 || this.state.isLoadingFinancial ? MySaleStyle.smallButtonBackgroundDisabled : MySaleStyle.smallButtonBackground, { marginLeft: 10 }]}
                        disabled={this.state.amount.length == 0 || this.state.isLoadingFinancial}>
                        <Text style={MySaleStyle.PartnerButtonText}>חשב</Text>
                      </TouchableOpacity>
                    </View>
                    {this.state.isLoadingFinancial && <ActivityIndicator style={[MySaleStyle.flexRow, { marginRight: 20 }]} size="small" color={Colors.partnerColor} />}
                    {this.state.custFinancialInfo && !this.state.isLoadingFinancial &&
                      <View>
                        <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>ממוצע 3 חשבוניות אחרונות: {GlobalHelper.formatNum(this.state.custFinancialInfo.AvgInvoiceAmount)} ש"ח</Text>

                        <View style={[MySaleStyle.flex1, MySaleStyle.flexRow]}>
                          <Text style={[MySaleStyle.margTop10, MySaleStyle.normalFont, MySaleStyle.flexRow, MySaleStyle.textAlignRight, MySaleStyle.padRight10]}>דירוג (score) פיננסי: </Text>
                          <Scale style={[MySaleStyle.margTop20, MySaleStyle.flexRow]} maxValue='6' selectedValue={this.state.custFinancialInfo.FinanceScore}></Scale>
                        </View>

                        <View style={[MySaleStyle.margTop5, MySaleStyle.flexRow]}>
                          <Text style={[MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>מסגרת אשראי: </Text>
                          <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow,
                          (Number.parseInt(this.state.custFinancialInfo.CreditAmount) > 0 ? styles.greenText : styles.redText)]}>
                            {GlobalHelper.formatNum(Math.abs(this.state.custFinancialInfo.CreditAmount))}
                          </Text>
                          {Math.sign(this.state.custFinancialInfo.CreditAmount) == -1 &&
                            <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow, styles.redText]}>-</Text>
                          }
                          <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow]}> ש"ח</Text>
                        </View>

                        <View style={[MySaleStyle.margTop5, MySaleStyle.flexRow]}>
                          <Text style={[MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>יתרה פנויה: </Text>
                          <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow,
                          (Number.parseInt(this.state.custFinancialInfo.RemainingCreditAmount) > 0 ? styles.greenText : styles.redText)]}>
                            {GlobalHelper.formatNum(this.state.custFinancialInfo.RemainingCreditAmount)}
                          </Text>
                          {Math.sign(this.state.custFinancialInfo.RemainingCreditAmount) == -1 &&
                            <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow, styles.redText]}>-</Text>
                          }
                          <Text style={[MySaleStyle.normalFont, MySaleStyle.flexRow]}> ש"ח</Text>
                        </View>
                        <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flex1]}>לקוח חדש או קיים: {this.state.custFinancialInfo.NewOrExistCust}</Text>
                        <View style={MySaleStyle.flexRow}>
                          <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont]}>
                            סטאטוס מכירה ללקוח:
                          </Text>
                          <Text style={[MySaleStyle.margTop5, MySaleStyle.padRight10, MySaleStyle.normalFont, this.state.rejectMessage && { color: 'red' }]}>
                            {this.state.custFinancialInfo.ConfirmStatus}
                          </Text>
                          {this.state.rejectMessage != '' &&
                            <Text style={[MySaleStyle.margTop5, MySaleStyle.normalFont, MySaleStyle.flex1, { color: 'red' }]}>
                              {this.state.rejectMessage}
                            </Text>}
                        </View>
                      </View>}
                  </View>
                }
              </View>
            </TouchableNativeFeedback>
          </View>
        </ScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingBottom: '10%',
  },
  scrollViewExtraDetails: {
    position: 'absolute',
    top: 350,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  iconSackSize: {
    width: 23,
    height: 31,
  },
  separator: {
    fontSize: 20,
    marginTop: -2,
    fontFamily: 'simpler-regular-webfont'
  },
  subHeader: {
    fontSize: 22,
    color: 'gray',
    paddingRight: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  lobTitle: {
    fontSize: 18,
    fontFamily: 'simpler-regular-webfont'
  },
  contractTitle: {
    fontSize: 16,
    fontFamily: 'simpler-black-webfont'
  },
  greenText: {
    color: '#28a428',
  },
  redText: {
    color: '#eb1515',
  },
  padRight20: {
    paddingRight: 20
  },
  padRight5: {
    paddingRight: 5,
  },
  inputText: {
    marginTop: 14,
    marginLeft: 30,
    paddingRight: 10,
    paddingLeft: 10,
    //alignSelf: 'center', 
    alignItems: 'center',
    fontSize: 18,
    width: 150,
    textAlign: 'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetailsModal);
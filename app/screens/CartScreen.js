import React from 'react';
import { View, StyleSheet, Text, AppRegistry, TouchableOpacity, ScrollView, Image } from 'react-native';
import {Picker} from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AndroidBackHandler } from 'react-navigation-backhandler';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import { CONNECTED_AS_KEY_NAME } from '../constants/General';
import SearchPanel from '../components/SearchPanel';
import UserDetails from '../components/UserDetails';
import { CartProducts } from '../components/CartProducts';
import CardReader from '../components/CardReader';
import MyActivityIndicator from '../components/MyActivityIndicator';
import ModalMessage from '../components/ModalMessage';
import Consts from '../constants/Consts';
import MySaleStyle from '../constants/Styles';
import Modal from 'react-native-modal';
import FloatingLabelInput from '../components/FloatingLabelInput';
import Colors from '../constants/Colors';

export class CartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      fetchingCartLines: true,
      showCardReaderModal: false,
      setCoupons: false,
      paymentMethods: [],
      selectedPaymentMethod: null,
      cartLinesData: null,
      creditBalance: null,
      TotalNoVat: null,
      Vat: null,
      TotalIncVat: null,
      TotalQuantity: null,
      message: null,
      isDisplayModalPhoneForCoupon: false,
      msgDisplayPhoneForCoupon: null,
      phoneForDistCoupons: null,
    };
  }

  fetchCartLines = (cancelCoupons) => {
    Api.post('/GetCartLines', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId, cancelCoupons: cancelCoupons ? 'Y' : 'N' }).then(resp => {
      if (resp.d.IsSuccess && resp.d.Cart && resp.d.Cart.Lines) {
        this.updateCartState(resp.d.Cart);
      } else {
        let msg = 'אירעה שגיאה בקבלת פרטי הסל';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
      this.setState({ fetchingCartLines: false });
    });
  }

  getCartPaymentMethods() {
    this.setState({ isLoading: true });
    Api.post('/GetCartPaymentMethods', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId }).then(resp => {
      if (resp.d.IsSuccess) {
        resp.d.ListPaymentMethods.forEach((pm, i) => pm['ID'] = i);

        this.setState({
          paymentMethods: resp.d.ListPaymentMethods,
          selectedPaymentMethod: resp.d.ListPaymentMethods.filter((pm, i) => pm.IsDefault)[0].ID
        });
      } else {
        let msg = 'אירעה שגיאה בקבלת אפשרויות התשלום';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
      this.setState({ isLoading: false });
    });
  }

  updateCartPaymentType(paymentMethodID) {
    this.setState({ isLoading: true });
    let selectedPaymentMethod = this.state.paymentMethods.filter((pm) => pm.ID == paymentMethodID)[0];
    Api.post('/UpdateCartPaymentType', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId,
      strPaymentMethodCode: selectedPaymentMethod.PaymentMethod,
      minPayments: selectedPaymentMethod.MinPayments, maxPayments: selectedPaymentMethod.MaxPayments,
      isGetUpdatedCart: true
    }).then(resp => {
      if (resp.d.IsSuccess) {
        this.updateCartState(resp.d.Cart);
        this.setState({ selectedPaymentMethod: paymentMethodID });
      } else {
        let msg = 'אירעה שגיאה בעדכון פרטי התשלום';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
      this.setState({ isLoading: false });
    });
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener(
      'focus',
      () => {
        const { cancelCoupons } = this.props.route.params ?? {};
        if (GlobalHelper.cartId !== '') {
          this.fetchCartLines(cancelCoupons);
          this.getCartPaymentMethods();
          if (this.props.route.params) {
            this.props.route.params.cancelCoupons = false;
          }
        } else {
          this.setState({ isLoading: false });
        }
      }
    );
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  continueToPayment = (idNumber) => {
    this.setState({ showCardReaderModal: false, isLoading: true });
    let oldIdNumber = GlobalHelper.connectedAsIdNumber;
    GlobalHelper.connectedAsIdNumber = idNumber;
    Api.post('/GetUserDetails', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strIdNum: idNumber, isCallSetLoginId: true, strEquipmentCode: GlobalHelper.deviceId }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess && resp.d.User) {
        if (resp.d.User.IsLoginAllowed) {
          AsyncStorage.setItem(CONNECTED_AS_KEY_NAME, resp.d.User.IdNum);
          GlobalHelper.connectedAsIdNumber = resp.d.User.IdNum;
          GlobalHelper.loginId = resp.d.User.LoginId;
          this.props.setUserDetails(resp.d.User);
          //Remark this for coupons
          //this.props.navigation.navigate('Payment');
          //Unremark this for coupons
          if (GlobalHelper.generalParams.IsCouponEnabled) {
            this.runCouponSimulation();
          }
          else {
            this.props.navigation.navigate('Payment');
          }
          //End Coupons
        } else {
          this.setState({ message: 'משתמש לא מורשה לאפליקציה' });
        }
      } else {
        GlobalHelper.connectedAsIdNumber = oldIdNumber;
        let msg = 'אירעה שגיאה בקבלת פרטי המשתמש';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  };

  runCouponSimulation = (phone) => {
    this.setState({ isLoading: true });
    Api.post('/RunCouponSimulation', {
      strCartId: GlobalHelper.cartId,
      strPhone: phone || '',
    }).then(resp => {
      this.setState({ isLoading: false });

      if (resp?.d?.IsSuccess) {
        if (resp.d.Lines.length === 0 && resp.d.Unused.length === 0 && resp.d.Dist.length === 0) {
          this.props.navigation.navigate('Payment');
        } else {
          if (resp.d.IsRequirePhone) {
            this.setState({ isDisplayModalPhoneForCoupon: true,
                            msgDisplayPhoneForCoupon: resp.d.FriendlyMessage,
            });
          }
          else {
            this.props.navigation.navigate('Coupons', resp.d);
          }
        }
      } else {
        let msg = "אירעה שגיאה בהפעלת הסימולציה";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  deleteCart = () => {
    this.setState({ showCardReaderModal: false, isLoading: true });
    Api.post('/DeleteCart', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        this.props.clearCustomer();
        this.props.clearCart();
        this.setState({ isLoading: true });
        this.props.navigation.navigate('Home', { screen: 'Home' });
      } else {
        let msg = 'אירעה שגיאה במחיקת הסל';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  };

  updateCartState = (cart) => {
    if (cart.Lines.length == 0) {
      this.props.clearCustomer();
      this.props.clearCart();

      this.props.navigation.navigate('Home');
    } else {
      this.setState({
        cartLinesData: cart.Lines, creditBalance: cart.CreditBalance, profit: cart.Profit,
        TotalNoVat: cart.TotalNoVat, Vat: cart.Vat, TotalIncVat: cart.TotalIncVat, TotalQuantity: cart.TotalQuantity
      });
      this.props.setBadgeNumber(cart.TotalQuantity);
    }
  }

  onBackButtonPressAndroid = () => {
    /*
    *   Returning `true` from `onBackButtonPressAndroid` denotes that we have handled the event,
    *   and react-navigation's lister will not get called, thus not popping the screen.
    *
    *   Returning `false` will cause the event to bubble up and react-navigation's listener will pop the screen.
    * */

    this.props.navigation.navigate('Home', { screen: 'Home' });
    return true;
  };

  render() {

    if (this.state.isLoading) {
      return <View style={styles.container}>
        <MyActivityIndicator />
      </View>;
    }

    if (GlobalHelper.cartId === '' || this.state.TotalQuantity == '0') {
      return <View style={styles.container}>
        <UserDetails navigation={this.props.navigation} />
        <SearchPanel navigation={this.props.navigation} fromCart={true} />
        <View style={styles.emptyCartContainer}>
          <Image source={require('../assets/images/EmptyCart.png')} />
          <Text style={styles.emptyTitle}>סל הקניות ריק</Text>
        </View>
      </View>
    }

    let paymentMethodsItems = this.state.paymentMethods.map((pm, i) => {
      return <Picker.Item key={i} value={pm.ID}
        label={pm.PaymentMethod + (pm.MaxPayments == 1 ? ' תשלום אחד' : (' ' + pm.MinPayments + '-' + pm.MaxPayments + ' תשלומים'))} />
    });

    return (
      // <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
        <View style={styles.container}>
          <UserDetails navigation={this.props.navigation} />
          <SearchPanel navigation={this.props.navigation} fromCart={true} />
          {this.state.isLoading || this.state.fetchingCartLines ?
            <MyActivityIndicator /> :
            <View style={styles.container}>
              <ScrollView style={styles.scrollView}>
                <View style={styles.productsContainer}>
                  <CartProducts cartLinesData={this.state.cartLinesData} creditBalance={this.state.creditBalance} profit={this.state.profit}
                    onUpdateCartLines={this.updateCartState} navigation={this.props.navigation} />
                </View>
                <View style={styles.paymentContainer}>
                  <Text style={MySaleStyle.textHeader}>פרטי התשלום</Text>
                  <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={styles.rowText}>סוג תשלום:</Text>
                    <Picker
                      selectedValue={this.state.selectedPaymentMethod}
                      style={styles.paymentMethodsPicker}
                      onValueChange={(itemValue, itemIndex) => this.updateCartPaymentType(itemValue)}>
                      {paymentMethodsItems}
                    </Picker>
                  </View>
                  <View style={{ padding: 20 }}>
                    <Text style={styles.rowText}>סה"כ לפני מע"מ: {GlobalHelper.formatNum(this.state.TotalNoVat)} ש"ח</Text>
                    <Text style={styles.rowText}>מע"מ: {GlobalHelper.formatNum(this.state.Vat)} ש"ח</Text>
                    <Text style={styles.totalPrice}>סה"כ לתשלום: {GlobalHelper.formatNum(this.state.TotalIncVat)} ש"ח</Text>
                  </View>
                </View>
                <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
                  <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                    onPress={() => {
                      this.setState({ showCardReaderModal: true });
                    }} >
                    <Text style={MySaleStyle.PartnerButtonText}>מעבר לתשלום</Text>
                  </TouchableOpacity>
                </View>
                <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20, { marginBottom: 10 }]}>
                  <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={this.deleteCart} >
                    <Text style={MySaleStyle.PartnerButtonText}>מחיקת הסל</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          }
          {this.state.showCardReaderModal &&
            <CardReader isEmployeeAuthentication={true}
              isVisible={this.state.showCardReaderModal}
              onModalClose={() => { this.setState({ showCardReaderModal: false }) }}
              onSwipeCard={this.continueToPayment}
              onManualInsert={this.continueToPayment} />
          }
          {this.state.message && <ModalMessage message={this.state.message} onClose={() => this.setState({ message: null })} />}
          {this.state.isDisplayModalPhoneForCoupon && 
            <Modal isVisible={this.state.isDisplayModalPhoneForCoupon}>
              <View style={styles.modalContent}>
                {/* Modal Text */}
                <Text>{this.state.msgDisplayPhoneForCoupon}</Text>
                {/* Phone number textbox */}
                <View style={MySaleStyle.margTop20}>
                    <FloatingLabelInput
                      label="מספר טלפון"
                      value={this.state.phoneForDistCoupons}
                      onChangeText={phoneForDistCoupons => {
                        this.setState({ phoneForDistCoupons }); 
                      }}
                      textAlign={'right'}
                      maxLength={10}
                      keyboardType='numeric'
                      underlineColorAndroid={(!this.state.phoneForDistCoupons || this.state.phoneForDistCoupons.length < 7) ? Colors.redColor : undefined} 
                    />
                    {(!this.state.phoneForDistCoupons &&
                      <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון</Text> ||
                      this.state.phoneForDistCoupons.length < 7 &&
                      <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון חוקי</Text>)
                    }
                </View>
                {/* Modal Buttons */}
                <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                  {/* Button Submit */}
                  {(this.state.phoneForDistCoupons) &&
                    <TouchableOpacity style={(!this.state.phoneForDistCoupons || this.state.phoneForDistCoupons.length < 7) ? MySaleStyle.smallButtonBackgroundDisabled : MySaleStyle.smallButtonBackground}
                      onPress={() => {
                        this.setState({ isDisplayModalPhoneForCoupon: false });
                        this.runCouponSimulation(this.state.phoneForDistCoupons);
                      }} 
                      disabled={(!this.state.phoneForDistCoupons || this.state.phoneForDistCoupons.length < 7)}>
                      <Text style={MySaleStyle.smallButtonText}>קליטה</Text>
                    </TouchableOpacity>
                  }
                  {/* Space between buttons */}
                  <View style={{ paddingRight: 40 }}></View>
                  {/* Button Clear */}
                  <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                    onPress={() => {
                      this.setState({ isDisplayModalPhoneForCoupon: false });
                    }} 
                  >
                    <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          }
        </View>
      // </AndroidBackHandler>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    customer: state.connectionDetailsReducer.customer
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CartScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 500,
    //alignItems: 'center',
    paddingBottom: 10
  },
  scrollView: {
    flex: 1,
    //position: 'absolute',
    //top: 0,
    //left: 0,
    //right: 0,
    //bottom: 0,
    backgroundColor: '#fff',
    height: 500,
  },
  productsContainer: {
    flex: 30,
    flexDirection: 'column',
  },
  emptyCartContainer: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 100
  },
  paymentContainer: {
    flex: 1,
    height: 200,
    marginTop: -10
  },
  footerContainer: {
    //flex: 1,
    flexDirection: 'column',
    //alignItems: 'flex-end',
    position: 'relative',
    //height: 120
    //bottom:0,
    margin: 20,
    //width: '95%'
  },
  hr: {
    flexDirection: 'column',
    borderTopColor: '#c7c7cd',
    borderTopWidth: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  rowText: {
    //paddingRight: 20,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
    //marginTop: 10
  },
  emptyTitle: {
    fontSize: 26,
    fontFamily: 'simpler-regular-webfont'
  },
  cartTitle: {
    fontSize: 26,
    fontFamily: 'simpler-regular-webfont',
    padding: 20
  },
  title: {
    fontSize: 26,
    paddingBottom: 20,
    fontFamily: 'simpler-regular-webfont'
    //paddingRight: 20,
    //paddingBottom: 10,
  },
  space: {
    flexDirection: 'column',
    borderTopColor: '#fff',
    borderTopWidth: 20,
  },
  paymentMethodsPicker: {
    //paddingRight: 5,
    height: 50,
    width: 300,
    marginTop: -14,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: 'simpler-black-webfont'
    //paddingTop: 10
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

AppRegistry.registerComponent('CartScreen', () => CartScreen);
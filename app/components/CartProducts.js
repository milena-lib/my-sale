import React from 'react';
import { AppRegistry, View, FlatList, Text, StyleSheet, TouchableOpacity,ToastAndroid, TextInput, TouchableNativeFeedback, Image } from 'react-native';
import Modal from 'react-native-modal';
import {Picker} from '@react-native-picker/picker'
import { connect } from 'react-redux';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import IconBadge from 'react-native-icon-badge';
import MyActivityIndicator from './MyActivityIndicator';
import ModalMessage from './ModalMessage';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CardReader from './CardReader';
import Colors from '../constants/Colors';
import Consts from '../constants/Consts';
import MySaleStyle from '../constants/Styles';
import CouponIcon from './CouponIcon';

export class CartProducts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selectedItem: null,
      itemPromotions: [],
      openChangePromotionModal: false,
      message: null,
      showCardReaderModal: false,
      openDiscountModal: false,
      discountLineId: null,
      discountAmount: null,
      selectedItemDiscount: null,
      permittedIdNumber: null
    };
  }

  updateLine = (lineId, productsCode, promotionId, quantity) => {
    this.setState({ isLoading: true });
    Api.post('/UpdateLineInCart', {
      strProductCode: productsCode, strQuantity: quantity, promotionId: promotionId,
      billCustId: '', strCartId: GlobalHelper.cartId, strLineId: lineId,
      isGetUpdatedCart: true
    }).then(resp => {
      this.setState({ isLoading: false, openChangePromotionModal: false });
      if (resp.d.IsSuccess && resp.d.Cart && resp.d.Cart.Lines) {
        this.props.onUpdateCartLines(resp.d.Cart);
      } else {
        let msg = 'אירעה שגיאה בעדכון שורה בסל';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  deleteLineFromCart(lineId) {
    this.setState({ isLoading: true });
    Api.post('/DeleteLineFromCart', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: GlobalHelper.cartId,
      strLineId: lineId, isGetUpdatedCart: true
    }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d.IsSuccess) {
        this.props.onUpdateCartLines(resp.d.Cart);
      } else {
        let msg = 'אירעה שגיאה במחיקת שורה מהסל';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  getProductPromotions = (selectedItem) => {
    this.setState({ isLoading: true });
    Api.post('/GetProductPromotions', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strCartId: GlobalHelper.cartId,
      strCatalogNum: '',
      strPaymentMethodCode: '',
      strLineId: selectedItem.LineId
    }
    ).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess && resp.d.ListPromotions) {
        if (resp.d.ListPromotions.length > 0) {
          this.setState({ openChangePromotionModal: true, itemPromotions: resp.d.ListPromotions, selectedItem: selectedItem });
        } else {
          this.setState({ message: 'לא נמצאו מבצעים עבור מוצר זה' });
        }
      } else {
        let msg = "אירעה שגיאה בטעינת מבצעים למוצר";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        this.setState({ message: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  authenticateUser = (idNumber) => {
    this.setState({ isLoading: true, showCardReaderModal: false });
    Api.post('/CheckDiscountAuth', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strIdNum: idNumber,
      strCartId: GlobalHelper.cartId,
      strLineId: this.state.discountLineId
    })
      .then(resp => {
        this.setState({ isLoading: false });
        if (resp.d && resp.d.IsSuccess) {
          this.setState({ permittedIdNumber: idNumber, message: null });
          if (!this.state.selectedItemDiscount || this.state.selectedItemDiscount === '0') {
            this.setState({ openDiscountModal: true });
          } else {
            this.updateDiscount();
          }
        } else {
          let msg = null;
          if (resp.d.FriendlyMessage) {
            msg = resp.d.FriendlyMessage;
          }
          this.setState({ message: msg });
        }
      });
  };

  updateDiscount = () => {
    this.setState({ isLoading: true, openDiscountModal: false });
    Api.post('/UpdateDiscAmount', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strIdNum: this.state.permittedIdNumber,
      strCartId: GlobalHelper.cartId,
      strLineId: this.state.discountLineId,
      amount: this.state.selectedItemDiscount && this.state.selectedItemDiscount !== '0' ? 0 : this.state.discountAmount
    })
      .then(resp => {
        this.setState({ isLoading: false });
        if (resp.d && resp.d.IsSuccess && resp.d.Cart && resp.d.Cart.Lines) {
          this.props.onUpdateCartLines(resp.d.Cart);
          this.setState({ message: null, discountAmount: null });
        } else {
          let msg = "אירעה שגיאה בעדכון הנחה";
          if (resp.d.FriendlyMessage) {
            msg = resp.d.FriendlyMessage;
          }
          this.setState({ message: Consts.globalErrorMessagePrefix + msg, discountAmount: null });
        }
      });
  };

  renderItem = (item, index) => {
    return (
      <View style={styles.productsContainer} key={index}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('ProductDetails', { catalogNum: item.Product.CatalogNum, fromCart: true })}>
          <View style={styles.nameAndPriceRow}>
            <Text style={styles.productName}>{item.Product.Name}</Text>
            <Text style={styles.priceText}>{GlobalHelper.formatNum(item.Price)} ש"ח</Text>
          </View>
          <View>
            {item.Product.Barcode !== '' && <Text style={styles.rowText}>סריאלי: {item.Product.Barcode}</Text>}
            <Text style={styles.rowText}>מק"ט: {item.Product.CatalogNum}</Text>
            <View style={styles.promotionsContainer}>
              <Text style={styles.promotionText}>מבצע: {item.PromotionDesc}</Text>
            </View>
            {item.DiscountAmount > 0 && <Text style={styles.rowText}>מחיר לפני הנחה: {GlobalHelper.formatNum(item.PricePreDiscount)} ש"ח</Text>}
          </View>
        </TouchableOpacity>
        {item.Profit != '' &&
          <View style={[MySaleStyle.flexRow, { alignItems: 'flex-start', paddingLeft: 20 }]}>
            <TouchableNativeFeedback onPress={() => ToastAndroid.showWithGravity(item.Profit, ToastAndroid.SHORT, ToastAndroid.CENTER)}>
              <Image source={require('../assets/images/Bling.png')} style={{ width: 30, height: 30 }} />
            </TouchableNativeFeedback>
          </View>}
        <View style={styles.actionsRow}>
          {item.Product.Barcode === '' ?
            <TouchableOpacity onPress={() => this.updateLine(item.LineId, item.Product.CatalogNum, item.PromotionCode, parseInt(item.Quantity) + 1)}>
              <Text style={styles.actionText}>שכפול</Text>
            </TouchableOpacity> : <View style={{ width: 80 }}></View>}
          {item.Product.Barcode === '' && <Text style={MySaleStyle.pipe}>|</Text>}
          <TouchableOpacity onPress={() => this.getProductPromotions(item)}>
            <Text style={styles.actionText}>שינוי מבצע</Text>
          </TouchableOpacity>
          <Text style={MySaleStyle.pipe}>|</Text>
          <TouchableOpacity onPress={() => this.setState({ showCardReaderModal: true, discountLineId: item.LineId, selectedItemDiscount: item.DiscountAmount })}>
            <Text style={styles.actionText}>{item.DiscountAmount > 0 ? 'ביטול הנחה' : 'הנחה'}</Text>
          </TouchableOpacity>
          <Text style={MySaleStyle.pipe}>|</Text>
          <TouchableOpacity onPress={() => this.deleteLineFromCart(item.LineId)}>
            <Text style={styles.actionText}>הסרה</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    generateProductPromotionsPicker = (promotions) => {
      return promotions.map((s, i) => {
        return <Picker.Item key={i} value={s.PromotionCode.toString()} label={'(₪' + GlobalHelper.formatNum(s.Price) + ') ' + s.PromotionDesc} />
      });
    }

    return (
      <View style={styles.container}>
        <Text style={MySaleStyle.textHeader}>סל הקניות</Text>
        <View style={[MySaleStyle.flexRow, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={MySaleStyle.flexRow}>
            <Text style={styles.infoText}>מספר סל: {GlobalHelper.cartId}</Text>
            <View style={[MySaleStyle.flexRow, { paddingLeft: 20 }]}>
              <TouchableNativeFeedback onPress={() => ToastAndroid.showWithGravity(this.props.profit, ToastAndroid.SHORT, ToastAndroid.CENTER)}>
                <Image source={require('../assets/images/Bling.png')} style={{ width: 30, height: 30 }} />
              </TouchableNativeFeedback>
            </View>
          </View>
          {/* Unremark this view for coupons */}
          <View style={[{ marginRight: 20 }]}>
            { GlobalHelper.generalParams.IsCouponEnabled  && 
              <CouponIcon />
            }
          </View>
        </View>
        {this.props.creditBalance != '' && this.props.creditBalance != null &&
          <Text style={[styles.infoText, { paddingBottom: 15 }, { color: this.props.creditBalance <= 0 ? 'red' : 'green' }]}>יתרת מסגרת אשראי: {'₪' + GlobalHelper.formatNum(this.props.creditBalance)}</Text>}
        {this.state.isLoading ?
          <MyActivityIndicator /> :
          this.props.cartLinesData.map((item, index) => this.renderItem(item, index))
        }
        {this.state.openChangePromotionModal &&
          <Modal isVisible={this.state.openChangePromotionModal}>
            <View style={styles.modalContent}>
              <Text style={[{ fontSize: 18, fontFamily: 'simpler-black-webfont' }]}>בחירת מבצע:</Text>
              <View style={MySaleStyle.flexRow}>
                <MaterialIcon name='arrow-drop-down' size={30} style={{ marginTop: 10, marginRight: -30 }} />
                <Picker selectedValue={this.state.selectedItem.PromotionCode}
                  style={{ height: 50, width: 300, backgroundColor: 'transparent' }}
                  onValueChange={(itemValue, itemIndex) => itemValue != -1 && this.updateLine(this.state.selectedItem.LineId, this.state.selectedItem.Product.CatalogNum,
                    itemValue, this.state.selectedItem.Quantity)}>
                  <Picker.Item key={-1} value={-1} label={'בחירה'} />
                  {generateProductPromotionsPicker(this.state.itemPromotions)}
                </Picker>
              </View>
              <View style={[MySaleStyle.PartnerButtonContainer, { marginTop: 30 }, { marginBottom: 10 }]}>
                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                  onPress={() => { this.setState({ openChangePromotionModal: false }) }} >
                  <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>}
        {this.state.openDiscountModal &&
          <Modal isVisible={this.state.openDiscountModal}>
            <View style={styles.modalContent}>
              <Text style={[{ fontSize: 18, fontFamily: 'simpler-black-webfont' }]}>סכום ההנחה:</Text>
              <TextInput value={this.state.discountAmount} keyboardType='numeric' autoCapitalize="words" style={styles.discountTextbox} textAlign={'center'} maxLength={7}
                onChangeText={(discountAmount) => this.setState({ discountAmount })} />
              <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                <TouchableOpacity onPress={this.updateDiscount} style={MySaleStyle.smallButtonBackground}>
                  <Text style={MySaleStyle.smallButtonText}>עדכון</Text>
                </TouchableOpacity>
                <View style={{ paddingRight: 40 }}></View>
                <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                  onPress={() => { this.setState({ openDiscountModal: false, discountAmount: null }) }}>
                  <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>}
        {this.state.showCardReaderModal &&
          <CardReader isEmployeeAuthentication={true}
            isVisible={this.state.showCardReaderModal}
            onModalClose={() => { this.setState({ showCardReaderModal: false }) }}
            onSwipeCard={this.authenticateUser}
            onManualInsert={this.authenticateUser} />
        }
        {this.state.message && <ModalMessage message={this.state.message} onClose={() => this.setState({ message: null })} />}
      </View>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    numOfCoupons: state.cartReducer.coupons?.length
  }
}

export default connect(mapStateToProps, null)(CartProducts);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    //paddingRight: 10,
    //paddingLeft: 10,
    //alignItems: 'center',
  },
  productsContainer: {
    flex: 1,
    padding: 0,
    marginTop: 10
    //justifyContent: 'space-between',
  },
  promotionsContainer: {
    flexDirection: 'row',
  },
  nameAndPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsRow: {
    //flex: 1,
    //padding: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: -8,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    paddingRight: 20,
    paddingBottom: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  productName: {
    flex: 2,
    fontSize: 18,
    paddingRight: 20,
    fontFamily: 'simpler-bold-webfont'
    //width: 400
  },
  rowText: {
    paddingRight: 20,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  },
  infoText: {
    paddingRight: 20,
    fontSize: 16,
    paddingBottom: 5,
    fontFamily: 'simpler-regular-webfont'
  },
  actionText: {
    fontSize: 20,
    lineHeight: 50,
    color: Colors.partnerColor,
    fontFamily: 'simpler-regular-webfont'
  },
  priceText: {
    flex: 1,
    color: Colors.partnerColor,
    fontSize: 18,
    fontFamily: 'simpler-black-webfont',
    paddingRight: 90
  },
  changePromotionText: {
    textDecorationLine: 'underline',
    textShadowColor: Colors.partnerColor,
    paddingRight: 20,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  },
  promotionText: {
    paddingRight: 20,
    fontSize: 16,
    width: 400,
    fontFamily: 'simpler-regular-webfont'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    backgroundColor: Colors.partnerColor,
    padding: 10,
    margin: 5,
  },
  closeButtonText: {
    color: 'white',
  },
  discountTextbox: {
    fontSize: 20,
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: 110,
    paddingBottom: 6,
    fontFamily: 'simpler-regular-webfont'
  },
  coupon: {
    width: 50,
    height: 50
  },
  couponIconContainer: {
    width: 80,
    alignItems: 'flex-end',
    marginRight: 10
  },
  iconSize: {
    width: 45,
    height: 45
  },
  iconBadge: {
    width: 21,
    height: 21,
    backgroundColor: '#AA222F',
    marginRight: 40,
  }
});

AppRegistry.registerComponent('CartProducts', () => CartProducts);
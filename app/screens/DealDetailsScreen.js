import React from 'react';
import {
  AppRegistry, View, Text, StyleSheet, ToastAndroid, Pressable,
  TouchableOpacity, Alert, ScrollView, Modal, StatusBar
} from 'react-native';
import MySaleStyle from '../constants/Styles';
import MyActivityIndicator from '../components/MyActivityIndicator';
import Api from '../api/api';
import Consts from '../constants/Consts';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import SendMailInvoiceCopy from '../components/SendMailInvoiceCopy';
import Colors from '../constants/Colors';

export default class DealDetailsScreen extends React.Component {

  constructor(props) {
    super(props);
    //const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.AllowCancel !== r2.AllowCancel});
    this.state = {
      isLoading: false,
      isLoadingLines: false,
      dealGlobalMessage: '',
      linesGlobalMessage: '',
      //dataSource: ds,
      isDisplayLines: false,
      deal: {},
      dealId: '',
      dealStatus: '',
      dealAllowCancel: false,
      dealAllowPrint: false,
      linesData: '',
      dealIsMailInvoice: false,
      dealCustOrigMail: '',
      showSendMailInvoiceCopyModal: false,
      emvStatus: null,
      payments: []
    };
  }

  componentDidMount() {
    const { deal } = this.props.route.params ?? {};

    this.props.navigation.setOptions({ headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>פרטי עסקה {deal.DealId}</Text> })

    this.setStateByNavigationProps();
    this.getDealLines();

    this._unsubscribe = this.props.navigation.addListener('blur', () =>
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'SearchDeals' }],
      })
    );
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  //Getting the deal fields from the previous page by navigation props
  setStateByNavigationProps() {
    const { deal } = this.props.route.params ?? {};

    this.setState({
      deal,
      dealId: deal.DealId,
      dealStatus: deal.DealStatus,
      dealAllowCancel: deal.AllowCancel,
      dealAllowPrint: deal.AllowPrint,
      dealIsMailInvoice: deal.IsMailInvoice,
      dealCustOrigMail: deal.CustMail,
    });
  }

  confirmCancel() {
    Alert.alert(
      'ביטול עסקה',
      'האם לבטל את העסקה?',
      [
        { text: 'כן', onPress: () => this.cancelDeal() },
        { text: 'לא', onPress: () => null },
      ],
      //{ cancelable: false }
    )
  }

  cancelDeal() {
    const { deal } = this.props.route.params ?? {};
    this.setState({
      isLoading: true,
      //isLoadingLines: true
      isDisplayLines: false
    });
    Api.post('/CancelDeal', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strDealId: deal.DealId,
    }).then(resp => {
      this.setState({
        isLoading: false,
        //isLoadingLines: false 
        isDisplayLines: true
      });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ //isSuccess: true, 
          dealGlobalMessage: 'העסקה בוטלה בהצלחה',
          dealStatus: resp.d.Deal.DealStatus,
          dealAllowCancel: resp.d.Deal.AllowCancel,
          //dataSource : this.state.dataSource.cloneWithRows(resp.d.DealLines),
          linesData: resp.d.DealLines,
          linesGlobalMessage: ''
        });
        //ToastAndroid.show('העסקה בוטלה בהצלחה', ToastAndroid.SHORT);
      }
      else {
        let msg = "אירעה שגיאה בביטול העסקה";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ //isSuccess: false, 
          dealGlobalMessage: msg
        });
      }
    });
  }

  getDealLines() {
    const { deal } = this.props.route.params ?? {};

    this.setState({ isLoadingLines: true });
    Api.post('/GetDealLines', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strDealId: deal.DealId,
    }).then(resp => {
      this.setState({ isLoadingLines: false });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ //dataSource : this.state.dataSource.cloneWithRows(resp.d.DealLines),
          linesData: resp.d.DealLines,
          //isSuccess: true, 
          linesGlobalMessage: ''
        });
        if (resp.d.FriendlyMessage) {
          ToastAndroid.show(resp.d.FriendlyMessage, ToastAndroid.SHORT);
        }
        //No results
        if (resp.d.DealLines.length == 0) {
          this.setState({ isDisplayLines: false });
        }
        else {
          this.setState({ isDisplayLines: true });
        }
      }
      else {
        let msg = "אירעה שגיאה בטעינת שורות העסקה";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ //isSuccess: false, 
          linesGlobalMessage: msg,
          isDisplayLines: false
        });
      }
    });
  }

  confirmLineCancel(item) {
    Alert.alert(
      'ביטול פריט בעסקה',
      'האם לבטל את השורה עבור ' + item.Product.Name + '?',
      [
        { text: 'כן', onPress: () => this.cancelDealLine(item) },
        { text: 'לא', onPress: () => null },
      ],
    )
  }

  cancelDealLine(item) {
    //Alert.alert(item.Product.Name);
    this.setState({ isLoadingLines: true });
    Api.post('/CancelLineInDeal', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strDealId: this.state.dealId,
      strLineId: item.LineId,
    }).then(resp => {
      this.setState({
        isLoadingLines: false,
      });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ //isSuccess: true, 
          linesGlobalMessage: 'השורה בוטלה בהצלחה',
          // dealStatus: resp.d.Deal.DealStatus,
          // dealAllowCancel: resp.d.Deal.AllowCancel,
          //dataSource : this.state.dataSource.cloneWithRows(resp.d.DealLines),
          linesData: resp.d.DealLines,
          // linesGlobalMessage: ''
        });
        //ToastAndroid.show('השורה בוטלה בהצלחה', ToastAndroid.SHORT);
      }
      else {
        let msg = "אירעה שגיאה בביטול העסקה";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ //isSuccess: false, 
          linesGlobalMessage: msg
        });
      }
    });
  }

  printInvoiceCopy() {
    const { deal } = this.props.route.params ?? {};
    if (deal.IsMailInvoice == true) {
      this.setState({
        showSendMailInvoiceCopyModal: true
      });
    }
    else {
      this.setState({ isLoading: true });
      Api.post('/PrintInvoiceCopy', {
        strCurrentOrgUnit: GlobalHelper.orgUnitCode,
        strDealId: deal.DealId,
        strCustMail: '', //If called from here, we do not have an email address
      }).then(resp => {
        this.setState({
          isLoading: false
        });
        if (resp.d && resp.d.IsSuccess) {
          this.setState({ //isSuccess: true, 
            dealGlobalMessage: 'העתק החשבונית נשלח להדפסה',
          });
          //ToastAndroid.show('העתק החשבונית נשלח להדפסה', ToastAndroid.SHORT);
        }
        else {
          let msg = "אירעה שגיאה בשליחת הבקשה להדפסת העתק חשבונית";
          if (resp.d.FriendlyMessage) {
            msg = resp.d.FriendlyMessage;
          }
          else if (resp.d.ErrorMessage) {
            msg = msg + ", " + resp.d.ErrorMessage;
          }
          this.setState({ //isSuccess: false, 
            dealGlobalMessage: msg
          });
        }
      });
    }
  }

  deleteCart = () => {
    this.setState({ isLoading: true });
    Api.post('/DeleteCart', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, strCartId: this.state.deal.DealId }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        ToastAndroid.show('סל הקניות נמחק בהצלחה', ToastAndroid.SHORT);
        this.props.navigation.navigate('SearchDeals', { refresh: true });
      } else {
        let msg = 'אירעה שגיאה במחיקת סל הקניות';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ dealGlobalMessage: Consts.globalErrorMessagePrefix + msg });
      }
    });
  };

  goToCart = () => {
    GlobalHelper.cartId = this.state.deal.DealId;
    this.props.navigation.navigate('Cart');
  }

  completeTransaction = () => {
    this.setState({ isLoading: true });
    Api.post('/CompleteTransaction', {
      strCartId: this.state.deal.DealId, signatureBase64EncodedImage: '', idBase64EncodedImage: '', eilatResidentBase64EncodedImage: ''
    }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        ToastAndroid.show('העסקה הושלמה בהצלחה', ToastAndroid.SHORT);
        this.props.navigation.navigate('SearchDeals', { refresh: true });
      } else {
        let msg = 'אירעה שגיאה בהשלמת העסקה';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ isLoading: false, dealGlobalMessage: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  checkEmvStatus = () => {
    this.setState({ isLoading: true });
    Api.post('/CheckEmvStatus', {
      cartId: this.state.deal.DealId
    }).then(resp => {
      this.setState({ isLoading: false });

      if (resp?.d?.IsSuccess) {
        if (resp.d.Payments.length > 0) {
          this.setState({ emvStatus: resp.d, payments: resp.d.Payments });
        } else {
          ToastAndroid.show('לא נמצאו תשלומים', ToastAndroid.SHORT);
        }
      } else {
        let msg = 'אירעה שגיאה בסיום העסקה';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ isLoading: false, dealGlobalMessage: Consts.globalErrorMessagePrefix + msg });
      }
    });
  }

  renderPayment = (payment, index) => (
    <View key={index}>
      <View style={styles.container}>
        <View style={MySaleStyle.flex1}>
          <View style={styles.row}>
            <Text style={styles.rowText}>מזהה תשלום:</Text>
            <Text style={styles.rowText}>{payment.Id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowText}>סכום:</Text>
            <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(payment.Amount)} ש"ח</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowText}>סטאטוס:</Text>
            <Text style={styles.rowText}>{payment.Status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.hr} />
    </View>
  );

  renderItem = (item, index) => {
    return (
      <View style={[styles.container, MySaleStyle.margBtm5]} key={index}>
        <View style={MySaleStyle.flex1}>
          <Text style={[MySaleStyle.margTop10, MySaleStyle.margBtm5, MySaleStyle.padRight20, MySaleStyle.textAlignRight, MySaleStyle.textSubHeader, MySaleStyle.flex1]}>{item.Product.Name}</Text>
          {!!item.Product.Barcode && <View style={styles.row}>
            <Text style={styles.rowText}>ברקוד:</Text>
            <Text style={styles.rowText}>{item.Product.Barcode}</Text>
          </View>}
          <View style={styles.row}>
            <Text style={styles.rowText}>מק"ט:</Text>
            <Text style={styles.rowText}>{item.Product.CatalogNum}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowText}>סכום כולל מע"מ:</Text>
            <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(item.Price)} ש"ח</Text>
          </View>
          {!!item.Profit && <View style={styles.row}>
            <Text style={styles.rowText}>סכום בלינג:</Text>
            <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(item.Profit)}</Text>
          </View>}
          {!!item.CancelMsg && <View style={styles.row}>
            <Text style={styles.rowText}>הערת ביטול:</Text>
            <Text style={styles.rowText}>{item.CancelMsg}</Text>
          </View>}
          {item.AllowCancel &&
            <View>
              <View style={styles.LineButtonContainer}>
                <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.confirmLineCancel(item) }} >
                  <Text style={MySaleStyle.PartnerButtonText}>ביטול שורה</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        </View>
      </View>
    )
  }

  render() {
    const { deal } = this.props.route.params ?? {};

    return (<ScrollView contentContainerStyle={styles.scrollView}>
      {this.state.isLoading ?
        <MyActivityIndicator style={MySaleStyle.margTop10} /> :
        <>
          {!!deal.InvoiceNum && <View style={MySaleStyle.flexRow}>
            <Text style={MySaleStyle.textHeader}>חשבונית {deal.InvoiceNum}</Text>
          </View>}
          <View style={[styles.container, { marginTop: 10 }]}>
            <View style={MySaleStyle.flex1}>
              <View style={styles.row}>
                <Text style={styles.rowText}>תאריך:</Text>
                <Text style={styles.rowText}>{deal.PurchaseDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>יחידה ארגונית:</Text>
                <Text style={styles.rowText}>{deal.OrgUnitDesc}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>איש מכירות:</Text>
                <Text style={styles.rowText}>{deal.SalesRepName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>לקוח:</Text>
                <Text style={styles.rowText}>{deal.BillingCustomerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>מספר לקוח:</Text>
                <Text style={styles.rowText}>{deal.BillingCustomerNum}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>מספר זהות לקוח:</Text>
                <Text style={styles.rowText}>{deal.CustomerIdNum}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>אמצעי תשלום:</Text>
                <Text style={styles.rowText}>{deal.PaymentMethod}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>מספר טלפון:</Text>
                <Text style={styles.rowText}>{deal.CustPhone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>סכום כולל:</Text>
                <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(deal.TotalAmount)} ש"ח</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>סטאטוס:</Text>
                <Text style={styles.rowText}>{this.state.dealStatus}</Text>
              </View>
              {!!deal.CrmOrderNum && <View style={styles.row}>
                <Text style={styles.rowText}>מספר הזמנת סיבל:</Text>
                <Text style={styles.rowText}>{deal.CrmOrderNum}</Text>
              </View>}
            </View>
          </View>
          <View style={MySaleStyle.margTop20}></View>
          {this.state.dealAllowCancel &&
            <View style={MySaleStyle.PartnerButtonContainer}>
              <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.confirmCancel() }} >
                <Text style={MySaleStyle.PartnerButtonText}>ביטול עסקה</Text>
              </TouchableOpacity>
            </View>
          }
          {this.state.dealAllowPrint &&
            <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop10]}>
              <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.printInvoiceCopy() }} >
                <Text style={MySaleStyle.PartnerButtonText}>הדפסת העתק חשבונית</Text>
              </TouchableOpacity>
            </View>
          }

          <View style={[MySaleStyle.flex1, MySaleStyle.margTop15]}>
            {this.state.isLoadingLines ?
              <MyActivityIndicator /> :
              <View style={MySaleStyle.flex1}>
                {this.state.linesGlobalMessage != '' && <ModalMessage message={this.state.linesGlobalMessage} onClose={() => this.setState({ linesGlobalMessage: null })} />}
                {this.state.isDisplayLines &&
                  <View style={[MySaleStyle.flex1]}>
                    <Text style={MySaleStyle.textHeader}>שורות העסקה</Text>
                    <View style={MySaleStyle.flex1}>
                      {this.state.linesData.map((line, index) => this.renderItem(line, index))}
                    </View>
                  </View>
                }
              </View>
            }
          </View>

          {this.state.showSendMailInvoiceCopyModal &&
            <SendMailInvoiceCopy
              isVisible={this.state.showSendMailInvoiceCopyModal}
              onModalClose={() => { this.setState({ showSendMailInvoiceCopyModal: false }) }}
              parentDealId={this.state.dealId}
              parentCurrentCustMail={this.state.dealCustOrigMail}
            />
          }
          {this.state.deal.GetCart && <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
            <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={this.goToCart}>
              <Text style={MySaleStyle.PartnerButtonText}>מעבר לסל</Text>
            </TouchableOpacity>
          </View>}
          {this.state.deal.CompleteCart && <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
            <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={this.completeTransaction}>
              <Text style={MySaleStyle.PartnerButtonText}>השלמת עסקה</Text>
            </TouchableOpacity>
          </View>}
          {this.state.deal.CheckCC && <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
            <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={this.checkEmvStatus}>
              <Text style={MySaleStyle.PartnerButtonText}>בדיקת תשלום בחברת האשראי</Text>
            </TouchableOpacity>
          </View>}
          {this.state.deal.DeleteCart && <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
            <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={this.deleteCart}>
              <Text style={MySaleStyle.PartnerButtonText}>מחיקת הסל</Text>
            </TouchableOpacity>
          </View>}
          {this.state.payments.length > 0 &&
            <Modal transparent={true} animationType="slide">
              <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.modalContent}>
                  {this.state.payments.map((payment, index) => this.renderPayment(payment, index))}
                  <View style={styles.actionsRow}>
                    {this.state.emvStatus.GetCart && <>
                      <TouchableOpacity onPress={this.goToCart}>
                        <Text style={styles.actionText}>חזרה לסל</Text>
                      </TouchableOpacity>
                      <Text style={MySaleStyle.pipe}>|</Text>
                    </>}
                    {this.state.emvStatus.DeleteCart && <TouchableOpacity onPress={this.deleteCart}>
                      <Text style={styles.actionText}>מחיקת הסל</Text>
                    </TouchableOpacity>}
                    {this.state.emvStatus.CompleteCart && <>
                      <TouchableOpacity onPress={this.completeTransaction}>
                        <Text style={styles.actionText}>השלמת העסקה</Text>
                      </TouchableOpacity>
                    </>}
                  </View>
                  <View style={[MySaleStyle.flexRow, { alignItems: 'center', justifyContent: 'space-around' }]}>
                    <Pressable style={MySaleStyle.smallButtonBackground} onPress={() => { this.setState({ payments: [] }) }}>
                      <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </Modal>
          }
        </>
      }
      {this.state.dealGlobalMessage != '' && <ModalMessage message={this.state.dealGlobalMessage} onClose={() => this.setState({ dealGlobalMessage: '' })} />}
    </ScrollView >);
  }
}

const styles = StyleSheet.create({
  textHeaderBackToResults: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 26,
    paddingRight: 10,
    textDecorationLine: 'underline',
    fontFamily: 'simpler-regular-webfont'
  },
  textHeaderInvoiceNum: {
    //fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    fontSize: 26,
    paddingLeft: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingBottom: '10%',
  },
  LineButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  modalContent: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: "white",
    borderRadius: 4,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowText: {
    paddingRight: 20,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont',
    flex: 1,
    textAlign: 'left'
  },
  hr: {
    borderBottomColor: '#a5a5a5',
    borderBottomWidth: 1,
    margin: 15
  },
  row: {
    flexDirection: 'row',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 15,
  },
  actionText: {
    fontFamily: 'simpler-black-webfont',
    fontSize: 18,
    color: Colors.partnerColor,
    lineHeight: 50,

  }
});


AppRegistry.registerComponent('DealDetailsScreen', () => DealDetailsScreen);
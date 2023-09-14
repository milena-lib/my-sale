import React from 'react';
import {
  AppRegistry, View, Text, TouchableOpacity, StyleSheet, ToastAndroid, TouchableNativeFeedback,
  TextInput
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import MySaleStyle from '../constants/Styles';
import MyActivityIndicator from '../components/MyActivityIndicator';
import GlobalHelper from '../utils/globalHelper';
import Api from '../api/api';
import Colors from '../constants/Colors';

export default class SendMailInvoiceCopy extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      globalMessage: '',
      isVisible: true,
      custNewMail: '',
      isLoading: false
    };
  }

  componentDidMount() {
    this.setState({
      custNewMail: this.props.parentCurrentCustMail
    });
  }

  closeInvoiceModal() {
    this.setState({ isVisible: false });
    this.props.onModalClose();
  }

  printInvoiceCopy() {
    this.setState({
      isLoading: true
    });
    Api.post('/PrintInvoiceCopy', {
      strCurrentOrgUnit: GlobalHelper.orgUnitCode,
      strDealId: this.props.parentDealId,
      strCustMail: this.state.custNewMail,
    }).then(resp => {
      this.setState({
        isLoading: false
      });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ //isSuccess: true, 
          globalMessage: 'הבקשה לקבלת העתק חשבונית התקבלה בהצלחה',
        });
        //ToastAndroid.show('הבקשה לקבלת העתק חשבונית התקבלה בהצלחה', ToastAndroid.SHORT);
        //setTimeout(() => { this.closeInvoiceModal() }, 5000);
      }
      else {
        let msg = "אירעה שגיאה בשליחת הבקשה להעתק חשבונית";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          globalMessage: msg
        });
      }
    });
  }

  render() {
    return (
      <Modal isVisible={this.state.isVisible}>
        <View style={styles.modalContent}>
          <Icon name="file-o" size={40} />
          <Text style={MySaleStyle.textHeader}>קבלת העתק חשבונית</Text>
          {this.state.isLoading ?
            <MyActivityIndicator /> :
            <View>
              <Text style={styles.errorMessage}>{this.state.globalMessage}</Text>

              <View style={[MySaleStyle.flexRow]}>
                <Text style={[MySaleStyle.margTop20, MySaleStyle.padRight10, MySaleStyle.normalFont, MySaleStyle.flexRow]}>מייל</Text>
                <TouchableNativeFeedback style={[MySaleStyle.flexRow, MySaleStyle.fieldNextToLabel]}>
                  <TextInput style={[this.state.custNewMail.length >= 5 && !GlobalHelper.isEmailValid(this.state.custNewMail) ?
                    styles.invalidInputText : styles.inputText]}
                    textAlign={'center'} maxLength={1000} keyboardType='email-address'
                    //onChangeText={(text) => this.validateEmail(text)}
                    value={this.state.custNewMail}
                    onChangeText={(custNewMail) => this.setState({ custNewMail })}
                  />
                </TouchableNativeFeedback>
              </View>
              <View style={[styles.centerContect]}>
                <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                  <TouchableOpacity onPress={() => { this.printInvoiceCopy() }}
                    style={MySaleStyle.smallButtonBackground}>
                    <Text style={MySaleStyle.smallButtonText}>שלח העתק</Text>
                  </TouchableOpacity>
                  {/* Space between buttons */}
                  <View style={{ paddingRight: 40 }}></View>
                  <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                    onPress={() => { this.closeInvoiceModal() }}>
                    <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  },
  inputText: {
    marginTop: 17,
    marginLeft: 30,
    paddingRight: 10,
    paddingLeft: 10,
    alignSelf: 'center',
    fontSize: 16,
    width: 260,
    fontFamily: 'simpler-regular-webfont'
  },
  invalidInputText: {
    marginTop: 17,
    marginLeft: 30,
    paddingRight: 10,
    paddingLeft: 10,
    alignSelf: 'center',
    fontSize: 18,
    width: 200,
    color: Colors.redColor,
    fontFamily: 'simpler-regular-webfont'
  },
  centerContect: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

AppRegistry.registerComponent('SendMailInvoiceCopy', () => SendMailInvoiceCopy);
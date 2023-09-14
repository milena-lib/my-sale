import React from 'react';
import { StyleSheet, ToastAndroid, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import { CONNECTED_AS_KEY_NAME } from '../constants/General';
import CardReader from '../components/CardReader';
import GlobalHelper from '../utils/globalHelper';
import Consts from '../constants/Consts';

export class SwitchUserScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showCardReaderModal: true,
    }
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () =>
      this.setState({ showCardReaderModal: true })
    );
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  switchUser = (idNumber) => {
    //this.setState({ showCardReaderModal: false, isLoading: true });
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
          this.setState({ showCardReaderModal: false });
          this.props.navigation.goBack();
        } else {
          ToastAndroid.show('משתמש לא מורשה לאפליקציה', ToastAndroid.SHORT);
        }
      } else {
        GlobalHelper.connectedAsIdNumber = oldIdNumber;
        let msg = 'אירעה שגיאה בקבלת פרטי המשתמש';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }

        ToastAndroid.show(Consts.globalErrorMessagePrefix + msg, ToastAndroid.SHORT);
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.showCardReaderModal && <CardReader isEmployeeAuthentication={true}
          isVisible={this.state.showCardReaderModal}
          onModalClose={() => { this.setState({ showCardReaderModal: false }); this.props.navigation.navigate('Home'); }}
          onSwipeCard={this.switchUser}
          onManualInsert={this.switchUser} />}
      </View>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(null, mapDispatchToProps)(SwitchUserScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});
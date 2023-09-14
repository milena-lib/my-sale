import React from 'react';
import { View, StyleSheet, Image, ToastAndroid } from 'react-native';
import Api from '../api/api';
import MyActivityIndicator from '../components/MyActivityIndicator';
import UserDetails from '../components/UserDetails';
import OrgUnitComponent from '../components/OrgUnitComponent';
import GlobalHelper from '../utils/globalHelper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MySaleStyle from '../constants/Styles';
import * as Actions from '../actions';
import ModalMessage from '../components/ModalMessage';
import { IS_P2_LITE_DEVICE } from '../constants/General';
export class SwitchOUScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      globalMessage: '',
    };
  }

  updateOrgUnit = (selectedOrgUnit) => {
    const { fromLogin, isAdmin } = this.props.route.params ?? {};

    const strOrigUnit = GlobalHelper.orgUnitCode;
    const strNewUnit = selectedOrgUnit.key;
    const strNewDesc = selectedOrgUnit.label;

    this.setState({ isLoading: true });

    Api.post('/SetEquipmentOrgUnit', {
      strCurrentOrgUnit: strOrigUnit,
      strEquipmentCode: GlobalHelper.deviceId,
      strOrgUnitCode: strNewUnit,
      p2LiteFlag: IS_P2_LITE_DEVICE
    }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ globalMessage: '' });

        GlobalHelper.loginId = resp.d.LoginId;
        GlobalHelper.orgUnitCode = strNewUnit;
        const orgUnit = { OrgUnitCode: strNewUnit, OrgUnitDesc: strNewDesc }
        this.props.setOrgUnitDetails(orgUnit);
        ToastAndroid.show('המכשיר שויך בהצלחה ל' + strNewDesc, ToastAndroid.LONG);

        if (fromLogin) {
          this.props.setSignedIn(true);
        } else {
          this.props.navigation.navigate('Home');
        }
      }
      else {
        let msg = "אירעה שגיאה בעדכון המרכז";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({ globalMessage: msg });
      }
    });
  }

  render() {
    const { fromLogin } = this.props.route.params ?? {};

    return (<View style={[MySaleStyle.viewScreen, MySaleStyle.flex1]}>
      {fromLogin ?
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/LogoMySale.png')} resizeMode="center" style={{ height: 50 }} />
        </View> :
        <UserDetails navigation={this.props.navigation} />
      }
      {this.state.isLoading ?
        <MyActivityIndicator /> :
        <View>
          <OrgUnitComponent
            navigation={this.props.navigation}
            showModal={true}
            parentIsDisabled={true}
            parentAddNullVal={false}
            updateOrgUnit={this.updateOrgUnit} />

          {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}

        </View>
      }
    </View>);

  }
}

function mapStateToProps(state, props) {
  return {
    orgUnitDetails: state.connectionDetailsReducer.orgUnitDetails
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchOUScreen);

const styles = StyleSheet.create({
  margTop7: {
    marginTop: 7,
  },
  logoContainer: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
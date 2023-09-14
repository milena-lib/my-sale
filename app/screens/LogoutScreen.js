import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';
import { GUID_KEY_NAME, CONNECTED_AS_KEY_NAME } from '../constants/General';
import GlobalHelper from '../utils/globalHelper';
import Colors from '../constants/Colors';

export class LogoutScreen extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => { this.logout() }, 2000);
  }

  logout = () => {
    this.props.clearCustomer();
    this.props.clearCart();
    GlobalHelper.connectedAsIdNumber = '';

    AsyncStorage.multiRemove([GUID_KEY_NAME, CONNECTED_AS_KEY_NAME], (err) => {
      this.props.setSignedIn(false);
      this.props.navigation.replace('Auth');
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/LogoMySale.png')} style={{ height: 60, width: 150 }} />
        </View>
        <View style={styles.logoutContainer}>
          <ActivityIndicator size="large" color={Colors.partnerColor} />
          <Text style={styles.logoutText}>יוצא...</Text>
        </View>
      </View>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(null, mapDispatchToProps)(LogoutScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutContainer: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    padding: 30,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  }
});
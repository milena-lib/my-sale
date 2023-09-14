import React from 'react';
import { AppRegistry, View, Text, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import MySaleStyle from '../constants/Styles';
import MyActivityIndicator from '../components/MyActivityIndicator';
import GlobalHelper from '../utils/globalHelper';
import Api from '../api/api';

export default class RefreshDataScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      globalMessage: '',
      isVisible: true
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ isVisible: true });
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  closeRefreshModal() {
    this.setState({ isVisible: false });
    this.props.navigation.goBack();
  }

  refreshData() {
    const strOrigUnit = GlobalHelper.orgUnitCode;
    this.setState({
      isLoading: true,
    });
    Api.post('/ClearAllCache', {
      strCurrentOrgUnit: strOrigUnit,
      boolRepopulateCatalog: 'true',
    }).then(resp => {
      this.setState({
        isLoading: false,
      });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({
          globalMessage: '',
        });
        ToastAndroid.show('הרענון בוצע בהצלחה', ToastAndroid.SHORT);
        //setTimeout(() => { this.closeRefreshModal() }, 2000);
      }
      else {
        let msg = "אירעה שגיאה ברענון הנתונים";
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
          <Icon name="refresh" size={40} />
          <Text style={MySaleStyle.textHeader}>רענון נתונים</Text>
          <Text style={MySaleStyle.normalFont}>לחיצה על כפתור "בצע" תרענן את נתוני המטמון בשרת, וכן תיטען מחדש את הקטלוג</Text>
          {this.state.isLoading ?
            <MyActivityIndicator /> :
            <View>
              <Text style={styles.errorMessage}>{this.state.globalMessage}</Text>
              <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                <TouchableOpacity onPress={() => { this.refreshData() }}
                  style={MySaleStyle.smallButtonBackground}>
                  <Text style={MySaleStyle.smallButtonText}>רענון</Text>
                </TouchableOpacity>
                {/* Space between buttons */}
                <View style={{ paddingRight: 40 }}></View>
                <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                  onPress={() => { this.closeRefreshModal() }}>
                  <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                </TouchableOpacity>
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
});

AppRegistry.registerComponent('RefreshDataScreen', () => RefreshDataScreen);
import React from 'react';
import { AppRegistry, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';

export default class CardReader extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      details: null,
      isVisible: false,
      connected: false,
      connecting: false,
      idNumber: '',
      errorMessage: null
    };
  }

  showInstructions() {

    if (GlobalHelper.emvMode) {
      return <View>
        {this.props.isEmployeeAuthentication ?
          <Text style={styles.instructionMessage}>אנא הזן את מספר תעודת הזהות שלך</Text> :
          <Text style={styles.instructionMessage}>אנא הזן מספר תעודת זהות מורשה לביצוע הפעולה</Text>}
        <TextInput value={this.state.idNumber} keyboardType='numeric' style={[styles.idNumberTextbox]} textAlign={'center'} maxLength={9}
          underlineColorAndroid={'#d5d5d5'} onChangeText={(idNumber) => this.setState({ idNumber })} />
      </View>;
    }

    let errorMessage = null;

    if (this.state.errorMessage) {
      errorMessage = <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>;
    }

    if (this.props.isEmployeeAuthentication) {
      return <View>
        {errorMessage != null ? errorMessage :
          <Text style={styles.readerStatusText}>{this.state.details}</Text>
        }
        {errorMessage != null ?
          <Text style={styles.instructionMessage}>אנא הזן את מספר תעודת הזהות שלך</Text> :

          <Text style={styles.instructionMessage}>אנא סרוק את כרטיס העובד שלך, או הזן תעודת זהות</Text>
        }
        <TextInput value={this.state.idNumber} keyboardType='numeric' style={[styles.idNumberTextbox]} textAlign={'center'} maxLength={9}
          underlineColorAndroid={'#d5d5d5'} onChangeText={(idNumber) => this.setState({ idNumber })} />
      </View>;
    } else {
      return <View>
        {errorMessage != null ? errorMessage :
          <Text style={styles.readerStatusText}>{this.state.details}</Text>
        }
      </View>;
    }
  }

  render() {
    return (
      <Modal isVisible={this.props.isVisible}>
        <View style={styles.modalContent}>
          {this.props.isEmployeeAuthentication ?
            <Icon name="id-card-o" size={40} /> :
            <Icon name="credit-card" size={40} />}
          {GlobalHelper.emvMode && !this.props.isEmployeeAuthentication ? <Text style={styles.title}>העברת אשראי ידנית</Text> :
            (this.props.isEmployeeAuthentication ?
              <Text style={styles.title}>העברת כרטיס עובד</Text> :
              <Text style={styles.title}>סליקת אשראי</Text>)}
          {this.showInstructions()}
          <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
            {(this.props.isEmployeeAuthentication || GlobalHelper.emvMode) &&
              <TouchableOpacity onPress={() => this.props.onManualInsert(this.state.idNumber)} disabled={this.state.idNumber.length < 5}
                style={this.state.idNumber.length < 5 ? MySaleStyle.smallButtonBackgroundDisabled : MySaleStyle.smallButtonBackground}>
                <Text style={MySaleStyle.smallButtonText}>קליטה</Text>
              </TouchableOpacity>
            }
            {/* Space between buttons */}
            <View style={(this.props.isEmployeeAuthentication || GlobalHelper.emvMode) && { paddingRight: 40 }}></View>
            <TouchableOpacity style={MySaleStyle.smallButtonBackground} onPress={this.props.onModalClose} >
              <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
            </TouchableOpacity>
          </View>
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
  buttonsContainer: {
    //flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    //width: 100,
  },
  button: {
    width: '30%',
    height: 40,
    paddingRight: 20
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    fontFamily: 'simpler-black-webfont'
  },
  instructionMessage: {
    fontSize: 18,
    fontFamily: 'simpler-regular-webfont'
  },
  readerStatusText: {
    padding: 5,
    fontSize: 15,
    fontStyle: 'italic',
    fontFamily: 'simpler-regular-webfont'
  },
  idNumberTextbox: {
    fontSize: 20,
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: 110,
    paddingBottom: 6,
    fontFamily: 'simpler-regular-webfont'
  },
});

AppRegistry.registerComponent('CardReader', () => CardReader);
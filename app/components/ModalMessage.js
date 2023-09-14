import React from 'react';
import { AppRegistry, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyActivityIndicator from '../components/MyActivityIndicator';

export default class ModalMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: true
    }
  }

  render() {
    return (
      <Modal isVisible={this.state.isVisible}>
        <View style={styles.modalContent}>
          {this.props.iconName && this.props.iconName != '' &&
            <Icon name={this.props.iconName} size={40} style={{ marginBottom: 20 }} color={this.props.iconName == 'warning' ? 'red' : 'black'} />
          }
          <Text style={styles.messageText}>{this.props.message}</Text>
          {this.props.showLoader && <MyActivityIndicator />}
          <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20, { marginBottom: 10 }]}>
            {!this.props.hideCloseButton &&
              <TouchableOpacity style={MySaleStyle.PartnerButtonBackground}
                onPress={() => {
                  this.setState({ isVisible: this.props.isVisible });
                  if (this.props.onClose) this.props.onClose();
                }} >
                <Text style={MySaleStyle.smallButtonText}>הבנתי</Text>
              </TouchableOpacity>}
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
  messageText: {
    fontSize: 17,
    marginBottom: 20,
    fontFamily: 'simpler-regular-webfont'
  },
  closeButton: {
    backgroundColor: Colors.partnerColor,
    padding: 10,
    margin: 5,
  },
  buttonText: {
    color: 'white',
  },
});

AppRegistry.registerComponent('CardReader', () => CardReader);
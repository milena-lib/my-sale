import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import MySaleStyle from '../constants/Styles';
import Caspit from '../utils/Caspit';
import Consts from '../constants/Consts';

export class CaspitOperationsScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      message: null
    }
  }

  caspitOperation = (subCommand) => {
    this.setState({ message: 'שולח פקודה...', modalIconName: null, hideCloseButton: true, showLoader: true });
    Api.post('/CaspitOperation', { deviceId: GlobalHelper.deviceId, subCommand }).then(resp => {
      if (resp.d && resp.d.IsSuccess && resp.d.XmlOperation) {
        Caspit.request(resp.d.XmlOperation, (status, resp) => {
          let xmlResponse = resp ? resp : '';
          this.sendCaspitOperationReply(xmlResponse);
        });
      } else {
        let msg = 'אירעה שגיאה בקבלת פקודת התחזוקה';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        this.setState({
          message: Consts.globalErrorMessagePrefix + msg, onMessageClose: () => this.setState({ message: null }),
          hideCloseButton: false, showLoader: false
        });
      }
    });
  }

  sendCaspitOperationReply = (xml) => {
    Api.post('/SendCaspitOperationReply', { deviceId: GlobalHelper.deviceId, xml }).then(resp => {
      let message;

      if (resp.d && resp.d.IsSuccess) {
        message = resp.d.FriendlyMessage;
      } else {
        message = 'אירעה שגיאה בשליחת התשובה עבור פקודת התחזוקה';
        if (resp.d.FriendlyMessage) {
          message = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          message = message + ", " + resp.d.ErrorMessage;
        }
      }

      this.setState({
        message, onMessageClose: () => this.setState({ message: null, errorMessage: false }),
        hideCloseButton: false, showLoader: false
      });
    });
  }

  caspitConfiguration = () => {
    this.setState({ message: 'מקבל פקודות...', modalIconName: null, hideCloseButton: true, showLoader: true });
    Api.post('/GetGeneralParams', { strCurrentOrgUnit: GlobalHelper.orgUnitCode, equipmentCode: GlobalHelper.deviceId, isConfig: 'Y' }).then(resp => {
      let res = resp.d;
      if (res && res.IsSuccess && res.DbParams) {
        this.sendCommands(res);
      } else {
        ToastAndroid.show(res.FriendlyMessage, ToastAndroid.SHORT);
      }
    });
  }

  sendCommands = (params) => {
    let cmd13Resp = null;
    let cmd10_6Resp = null;
    let cmd10_12Resp = null;
    let cmd10_13Resp = null;

    if (params.DbParams.XML_COMMAND_13) {
      this.setState({ message: 'מגדיר מכשיר...' });
      Caspit.request(params.DbParams.XML_COMMAND_13, (status, resp) => {
        cmd13Resp = resp ? resp : '';
        this.setState({ message: 'שולח עסקאות...' });
        Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
          cmd10_12Resp = resp ? resp : '';
          this.setState({ message: 'מוחק קובץ עסקאות...' });
          Caspit.request(params.DbParams.XML_COMMAND_10_13, (status, resp) => {
            cmd10_13Resp = resp ? resp : '';
            this.setState({ message: 'מתחבר לשבא...' });
            Caspit.request(params.DbParams.XML_COMMAND_10_6, (status, resp) => {
              cmd10_6Resp = resp ? resp : '';
              this.sendXmls(params, cmd13Resp, cmd10_6Resp, cmd10_12Resp, cmd10_13Resp);
            });
          });
        });
      });
    } else if (params.DbParams.XML_COMMAND_10_12) {
      this.setState({ message: 'שולח עסקאות...' });
      Caspit.request(params.DbParams.XML_COMMAND_10_12, (status, resp) => {
        cmd10_12Resp = resp;
        this.sendXmls(params, '', '', cmd10_12Resp, '');
      });
    }
  }

  sendXmls = (params, com13ReplayXML, com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML) => {
    Api.post('/SendEmvXmlsReplies', {
      caspitLoginId: params.DbParams.CaspitLoginId, equipmentCode: GlobalHelper.deviceId, com13ReplayXML,
      com10_6ReplayXML, com10_12ReplayXML, com10_13ReplayXML
    }).then(resp => {
      let message;

      if (resp.d && resp.d.IsSuccess) {
        message = 'קונפיגורציית כספיט הסתיימה בהצלחה';
      } else {
        message = 'אירעה שגיאה בשליחת התשובה עבור פקודת התחזוקה';
        if (resp.d.FriendlyMessage) {
          message = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          message = message + ", " + resp.d.ErrorMessage;
        }
      }

      this.setState({
        message, onMessageClose: () => this.setState({ message: null, errorMessage: false }),
        hideCloseButton: false, showLoader: false
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={MySaleStyle.textHeader}>כספיט</Text>
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
          <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => this.caspitOperation(2)} >
            <Text style={MySaleStyle.PartnerButtonText}>עדכון פרמטרים</Text>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 25 }}>
          <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => this.caspitOperation(3)} >
            <Text style={MySaleStyle.PartnerButtonText}>שידור לוגים</Text>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 25 }}>
          <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => this.caspitOperation(7)} >
            <Text style={MySaleStyle.PartnerButtonText}>שדרוג גירסא</Text>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 25 }}>
          <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => this.caspitConfiguration()} >
            <Text style={MySaleStyle.PartnerButtonText}>קונפיגורציה כספיט</Text>
          </TouchableOpacity>
        </View>
        {this.state.message && <ModalMessage message={this.state.message} iconName={this.state.modalIconName}
          onClose={this.state.onMessageClose} hideCloseButton={this.state.hideCloseButton}
          showLoader={this.state.showLoader} isVisible={this.state.message != null} />}
      </View>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(null, mapDispatchToProps)(CaspitOperationsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'center',
    //justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  }
});
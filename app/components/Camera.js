import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import MyActivityIndicator from '../components/MyActivityIndicator';

let faceDetected = false;

export default class CameraComponent extends React.Component {
  state = {
    hasCameraPermission: null,
    takingPicture: false,
    type: Camera.Constants.Type.back,
  };

  async componentWillMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      faceDetected = true;
    }
  };

  snap = async () => {
    if (this.camera) {
      //faceDetected = false;
      this.setState({ takingPicture: true });
      let photo = await this.camera.takePictureAsync({ base64: true, quality: 0.1, skipProcessing: false });
      this.setState({ takingPicture: false });
      this.props.takePictureCallback(photo.base64);

      // if (!faceDetected) {
      //   Alert.alert('שים לב!', 'לא זוהו פנים בתמונה שצולמה, האם ברצונך להמשיך בתשלום ולשמור את התמונה?', [
      //     { text: 'צלם שוב', onPress: () => this.setState({ takingPicture: false }) },
      //     { text: 'שמור תמונה', onPress: () => this.props.takePictureCallback(photo.base64) }]);
      // } else {
      //   this.props.takePictureCallback(photo.base64);
      // }
    }
  };

  render() {
    const { hasCameraPermission } = this.state;
    return (
      <Modal style={{ flex: 1 }} isVisible={true} onRequestClose={this.props.closeCamera}>
        {!hasCameraPermission ?
          <Text>אין גישה למצלמה</Text>
          :
          <Camera ref={ref => { this.camera = ref; }} style={{ flex: 1 }} type={this.state.type} //onFacesDetected={this.handleFacesDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 100,
              tracking: true,
            }}>
            <View style={styles.topBarContainer}>
              <TouchableOpacity style={styles.closeIconContainer} onPress={this.props.closeCamera}>
                <MCIcon color={'white'} name={'close'} size={50} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.snapBtnContainer}>
                {this.state.takingPicture ? <MyActivityIndicator /> :
                  <TouchableOpacity style={styles.snapIconContainer} onPress={this.snap}>
                    <MCIcon color={'white'} name={'camera'} size={60} />
                  </TouchableOpacity>}
              </View>
              <View>
                <Text style={styles.text}>צילום {this.props.imageType}</Text>
              </View>
            </View>
          </Camera>
        }
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  topBarContainer: {
    flex: 0.1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight / 2
  },
  closeIconContainer: {
    flex: 0.25,
    marginHorizontal: 30,
    marginBottom: 10,
    marginTop: 20,
  },
  snapBtnContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    marginBottom: 20
  },
  snapIconContainer: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center'
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'simpler-regular-webfont'
  }
});
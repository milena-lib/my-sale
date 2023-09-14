import React from 'react';
import { Text, View, StyleSheet, Button, AppRegistry, TouchableOpacity } from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';

export default class MySignatureCapture extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signatureWasDrawn: false
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.signatureContainer}>
                    <SignatureCapture
                        style={styles.signature}
                        ref="sign"
                        onSaveEvent={this._onSaveEvent}
                        onDragEvent={this._onDragEvent}
                        saveImageFileInExtStorage={false}
                        showNativeButtons={false}
                        showTitleLabel={false}
                        viewMode={"portrait"} />
                </View>
                <View style={[MySaleStyle.PartnerButtonContainer]}>
                    <TouchableOpacity style={!this.state.signatureWasDrawn ? MySaleStyle.PartnerButtonBackgroundDisabled : MySaleStyle.PartnerButtonBackground}
                        onPress={() => { this.state.signatureWasDrawn && this.saveSign() }} >
                        <Text style={MySaleStyle.PartnerButtonText}>שמירה והשלמת עסקה</Text>
                    </TouchableOpacity>
                </View>
                {/* Clear Button */}
                <View style={[styles.clearPartnerButtonContainer, { marginTop: 30, marginBottom: 20 }]}>
                    <TouchableOpacity style={MySaleStyle.PartnerButtonBackground} onPress={() => { this.resetSign() }} >
                        <Text style={MySaleStyle.PartnerButtonText}>נקה</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    saveSign = () => {
        this.refs["sign"].saveImage();
    }

    resetSign() {
        this.refs["sign"].resetImage();
        this.setState({ signatureWasDrawn: false });
    }

    _onSaveEvent = (result) => {
        //result.encoded - for the base64 encoded png
        //result.pathName - for the file path name
        this.props.onSaveSignature(result);
    }
    _onDragEvent = () => {
        // This callback will be called when the user enters signature
        this.setState({ signatureWasDrawn: true });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        borderColor: '#8E8E8E',
        borderWidth: 1,
        margin: 10,
        marginBottom: 30
    },
    signatureContainer: {
        flex: 6,
    },
    signature: {
        flex: 1,
        borderColor: '#8E8E8E',
        borderWidth: 1,
    },
    buttonStyle: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        backgroundColor: "#eeeeee",
        margin: 10
    },
    title: {
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        padding: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "column",
        //justifyContent: "flex-end",
        padding: 10
    },
    space: {
        flexDirection: 'column',
        borderTopColor: '#fff',
        borderTopWidth: 10,
    },
    clearPartnerButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: -20
    },
});

AppRegistry.registerComponent('MySignatureCapture', () => MySignatureCapture);
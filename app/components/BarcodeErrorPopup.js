import React, {useState} from 'react';
import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import MySaleStyle from "../constants/Styles";
import {bindActionCreators} from "redux";
import * as Actions from "../actions";
import {connect} from "react-redux";

function BarcodeErrorPopup(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isExpectBarcode, setIsExpectBarcode] = useState(false);
    const [message, setMessage] = useState(null);
    const [shouldGetBarcode, setShouldGetBarcode] = useState(false);
    const [barcode, setBarcode] = useState("");

    return (
        <Modal isVisible={true}>
            <View style={styles.modalContent}>
                <Icon name="barcode" size={40}/>
                <Text style={styles.title}>קליטת ברקוד</Text>
                {message && <Text style={styles.errorMessage}>{message}</Text>}
                <Text style={styles.instructionMessage}>יש לסרוק ברקוד או להזין ידנית</Text>
                <View style={{width: 150}}>
                    <TextInput value={barcode}
                               textAlign={'left'} maxLength={50} underlineColorAndroid={'#d5d5d5'}
                               onChangeText={(barcode) => setBarcode(barcode)}/>
                </View>
                <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                    <TouchableOpacity onPress={props.onBarcodeScanned} disabled={!barcode}
                                      style={!barcode ? MySaleStyle.smallButtonBackgroundDisabled : MySaleStyle.smallButtonBackground}>
                        <Text style={MySaleStyle.smallButtonText}>קליטה ידנית</Text>
                    </TouchableOpacity>
                    <View style={{paddingRight: 40}}></View>
                    <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                                      onPress={() => {
                                          setMessage(null);
                                          //setShouldGetBarcode(false)
                                      }}>
                        <Text style={MySaleStyle.smallButtonText}>סרוק</Text>
                    </TouchableOpacity>
                    <View style={{paddingRight: 40}}></View>
                    <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                                      onPress={() => props.navigation.goBack()}>
                        <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>)
}

export default BarcodeErrorPopup;

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

exports.BarcodeErrorPopupConnectRedux =  connect(null, mapDispatchToProps)(BarcodeErrorPopup);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 22,
        marginBottom: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    instructionMessage: {
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont'
    },
    errorMessage: {
        color: 'red',
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont'
    },
});

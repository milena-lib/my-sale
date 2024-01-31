import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { connect } from 'react-redux';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import Consts from '../constants/Consts';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyActivityIndicator from '../components/MyActivityIndicator';
import Barcode from '../components/Barcode';
import MySaleStyle from '../constants/Styles';

export class BarcodeModalScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isExpectBarcode: false,
            message: null,
            shouldGetBarcode: false,
            barcode: ''
        }
    }

    componentDidMount() {
        const { fromProductDetails } = this.props.route.params ?? {};

        if (fromProductDetails) {
            this.setState({ shouldGetBarcode: true, isExpectBarcode: true });
        }
    }

    onBarcodeScanned = (barcode) => {
        const { promotionId } = this.props.route.params ?? {};

        if (barcode.data) {
            barcode.data = barcode.data.replace(/[^0-9a-z-]/gi, '');
        }

        this.setState({ isLoading: true, message: null });

        if (!this.state.isExpectBarcode) {
            Api.post('/GetProductDetails', {
                    strProductCode: barcode.data ? barcode.data : this.state.barcode,
                    strLoginId: GlobalHelper.loginId,
                    billCustId: this.props.customer ? this.props.customer.BillingCustomerId : '',
                    sessionId: this.props.customer ? this.props.customer.SessionId : '',
                    cartId: GlobalHelper.cartId
                }
            ).then(resp => {
                this.setState({ isLoading: false });
                if (resp.d && resp.d.IsSuccess && resp.d.Product) {
                    this.props.navigation.replace('ProductDetails', { productDetailsByBarcode: resp.d.Product, barcodeData: barcode.data ? barcode.data : this.state.barcode });
                } else {
                    let msg = "אירעה שגיאה בטעינת תיאור המוצר";
                    if (resp.d.FriendlyMessage) {
                        msg = resp.d.FriendlyMessage;
                    }
                    this.setState({ message: Consts.globalErrorMessagePrefix + msg, shouldGetBarcode: true });
                }
            });
        } else {
            Api.post('/UpdateLineInCart', {
                strProductCode: barcode.data ? barcode.data : this.state.barcode, strQuantity: 1, promotionId,
                billCustId: this.props.customer ? this.props.customer.BillingCustomerId : '',
                strCartId: GlobalHelper.cartId, strLineId: '', isGetUpdatedCart: false
            }).then(resp => {
                this.setState({ isLoading: false });
                if (resp.d && resp.d.IsSuccess) {
                    GlobalHelper.cartId = resp.d.CartId;
                    this.props.navigation.navigate('Cart', { screen: 'Cart' });
                } else {
                    if (resp.d.IsRequireSerial) {
                        this.setState({ shouldGetBarcode: true });
                    } else {
                        let msg = "אירעה שגיאה בהוספת המוצר לסל";
                        if (resp.d.FriendlyMessage) {
                            msg = resp.d.FriendlyMessage;
                        }
                        else if (resp.d.ErrorMessage) {
                            msg = msg + ", " + resp.d.ErrorMessage;
                        }
                        this.setState({ message: Consts.globalErrorMessagePrefix + msg, shouldGetBarcode: true });
                    }
                }
            });
        }
    };

    render() {
        displayMessageOrBarcode = () => {
            if (this.state.shouldGetBarcode) {
                return <Modal isVisible={true}>
                    <View style={styles.modalContent}>
                        <Icon name="barcode" size={40} />
                        <Text style={styles.title}>קליטת ברקוד</Text>
                        {this.state.message && <Text style={styles.errorMessage}>{this.state.message}</Text>}
                        <Text style={styles.instructionMessage}>יש לסרוק ברקוד או להזין ידנית</Text>
                        <View style={{ width: 150 }}>
                            <TextInput value={this.state.barcode}
                                       textAlign={'left'} maxLength={50} underlineColorAndroid={'#d5d5d5'}
                                       onChangeText={(barcode) => this.setState({ barcode })} />
                        </View>
                        <View style={[MySaleStyle.flexRow, MySaleStyle.margTop20]}>
                            <TouchableOpacity onPress={this.onBarcodeScanned} disabled={!this.state.barcode}
                                              style={!this.state.barcode ? MySaleStyle.smallButtonBackgroundDisabled : MySaleStyle.smallButtonBackground}>
                                <Text style={MySaleStyle.smallButtonText}>קליטה ידנית</Text>
                            </TouchableOpacity>
                            <View style={{ paddingRight: 40 }}></View>
                            <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                                              onPress={() => this.setState({ message: null, shouldGetBarcode: false })}>
                                <Text style={MySaleStyle.smallButtonText}>סרוק</Text>
                            </TouchableOpacity>
                            <View style={{ paddingRight: 40 }}></View>
                            <TouchableOpacity style={MySaleStyle.smallButtonBackground}
                                              onPress={() => this.props.navigation.goBack()}>
                                <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            } else {
                return <Barcode onBarcodeScanned={this.onBarcodeScanned} />;
            }
        };

        return (
            <View style={styles.container}>
                {this.state.isLoading ? <MyActivityIndicator /> : displayMessageOrBarcode()}
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        customer: state.connectionDetailsReducer.customer,
    }
}

export default connect(mapStateToProps, null)(BarcodeModalScreen);

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

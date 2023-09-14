import React from 'react';
import {
    AppRegistry, View, Text, StyleSheet, ToastAndroid, Image,
    TouchableNativeFeedback, ActivityIndicator, ScrollView
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import GlobalHelper from '../utils/globalHelper';
import MyActivityIndicator from '../components/MyActivityIndicator';
import { Ionicons } from '@expo/vector-icons';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import Colors from '../constants/Colors';
import Consts from '../constants/Consts';
import MySaleStyle from '../constants/Styles';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ModalMessage from '../components/ModalMessage';

export class ProductDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            loadingStock: false,
            product: {},
            //AllowSearchAllOrgUnits: '',
            IsSuccess: true,
            GlobalMessage: '',
            message: null,
            //currentPriceIndex: ''
            orgUnitsStock: [],
            stockIsExpand: false,
        };
    }

    componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            const { productDetailsByBarcode } = this.props.route.params ?? {};

            if (productDetailsByBarcode) {
                productDetailsByBarcode.Prices.forEach(function (entry) {
                    entry.isExpand = entry.expandingPromotion = false;
                });
                this.setState({ product: productDetailsByBarcode });
            } else {
                this.fetchProductDetails();
            }
        });
    }

    componentWillUnmount() {
        this.isCancelled = true;
        this._unsubscribe();
    }

    fetchProductDetails() {
        if (!this.isCancelled) {
            const { catalogNum } = this.props.route.params ?? {};
            this.setState({ isLoading: true });
            Api.post('/GetProductDetails', {
                strProductCode: catalogNum,
                strLoginId: GlobalHelper.loginId,
                billCustId: this.props.customer ? this.props.customer.BillingCustomerId : '',
                sessionId: this.props.customer ? this.props.customer.SessionId : '',
                cartId: GlobalHelper.cartId
            }
            ).then(resp => {
                this.setState({ isLoading: false });
                if (resp.d && resp.d.IsSuccess) {
                    resp.d.Product.Prices.forEach(function (entry) {
                        entry.isExpand = entry.expandingPromotion = false;
                    });
                    this.setState({ product: resp.d.Product });
                } else {
                    let msg = "אירעה שגיאה בטעינת תיאור המוצר";
                    if (resp.d.FriendlyMessage) {
                        msg = resp.d.FriendlyMessage;
                    }
                    this.setState({
                        IsSuccess: false,
                        GlobalMessage: Consts.globalErrorMessagePrefix + msg
                    });
                }
            });
        }
    }

    addProductToCart = (promotionId) => {
        this.setState({ isLoading: true });
        const { catalogNum, barcodeData, fromCart } = this.props.route.params ?? {};
        let productCode = catalogNum ? catalogNum : barcodeData;
        //Setting strPromotionCode to null creates a line using the default promotion
        Api.post('/UpdateLineInCart', {
            strProductCode: productCode, strQuantity: 1, promotionId: promotionId,
            billCustId: this.props.customer ? this.props.customer.BillingCustomerId : '',
            strCartId: GlobalHelper.cartId, strLineId: '', isGetUpdatedCart: false
        }).then(resp => {
            this.setState({ isLoading: false });
            if (resp.d && resp.d.IsSuccess) {
                GlobalHelper.cartId = resp.d.CartId;
                this.props.navigation.navigate('Cart', { screen: 'Cart' });
            } else {
                if (resp.d.IsRequireSerial) {
                    this.props.navigation.navigate('Barcode', { fromProductDetails: true, promotionId: promotionId });
                } else {
                    let msg = "אירעה שגיאה בהוספת המוצר לסל";
                    if (resp.d.FriendlyMessage) {
                        msg = resp.d.FriendlyMessage;
                    }
                    else if (resp.d.ErrorMessage) {
                        msg = msg + ", " + resp.d.ErrorMessage;
                    }
                    this.setState({ message: Consts.globalErrorMessagePrefix + msg });
                    //ToastAndroid.show(Consts.globalErrorMessagePrefix + msg, ToastAndroid.SHORT);
                }
            }
        });
    }

    toggleExpandCollapsePromotions(index) {
        if (this.state.product.Prices[index].isExpand) {
            this.state.product.Prices[index].isExpand = this.state.product.Prices[index].expandingPromotion = false;
            this.setState({ product: this.state.product });
        } else {
            this.state.product.Prices[index].expandingPromotion = true;
            this.setState({ product: this.state.product });
            setTimeout(() => {
                this.state.product.Prices[index].isExpand = true;
                this.state.product.Prices[index].expandingPromotion = false;
                this.setState({ product: this.state.product });
            }, 1000);
        }
    }

    toggleExpandCollapseStock() {
        if (!this.state.stockIsExpand && (!this.state.orgUnitsStock || this.state.orgUnitsStock.length == 0)) {
            this.getStockAvailability();
        }
        this.setState({ stockIsExpand: !this.state.stockIsExpand });
    }

    getStockAvailability() {
        this.setState({ loadingStock: true });
        Api.post('/GetStockAvailability', {
            strCurrentOrgUnit: GlobalHelper.orgUnitCode,
            strCatalogNum: this.state.product.CatalogNum
        }
        ).then(resp => {
            this.setState({ loadingStock: false });
            if (resp.d && resp.d.IsSuccess) {
                if (resp.d.ListStocks == null || resp.d.ListStocks.length == 0) {
                    let emptyMsg = 'המוצר אינו קיים באף מרכז';
                    if (resp.d.FriendlyMessage) {
                        emptyMsg = resp.d.FriendlyMessage;
                    }
                    ToastAndroid.show(emptyMsg, ToastAndroid.SHORT);
                }
                else {
                    this.setState({ orgUnitsStock: resp.d.ListStocks });
                }
            } else {
                let msg = "אירעה שגיאה בבדיקת קיום המוצר במלאי מרכזי השירות האחרים";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                }
                this.setState({ GlobalMessage: Consts.globalErrorMessagePrefix + msg });
            }
        });
    }

    renderStockItem = ({ item, index }) => {
        return (
            <View>
                <Text style={[styles.rowPriceText, MySaleStyle.textAlignRight]}>{item.OrgUnitDesc} ({item.Quantity})</Text>
            </View>
        )
    }

    renderPromotion = (item, i, methodIndex, hideExpand) =>
    (<View key={i} style={[MySaleStyle.flexRow, { flex: 1 }]}>
        <View style={{ flex: 0.9, justifyContent: 'space-evenly', alignItems: 'flex-start', marginLeft: 20 }}>
            <View>
                <Text style={[(!this.state.product.IsInStock || !item.EnabledFlag) &&
                    { color: '#8c8c8c' }, MySaleStyle.bold, { fontSize: 18, marginTop: 10, fontFamily: 'simpler-regular-webfont' }]}>{item.DefaultFlag ? item.PaymentMethod : ''}</Text>
            </View>
            <View style={[MySaleStyle.flexRow, { alignItems: 'flex-start' }]}>
                <Text style={[styles.promotionText, (!this.state.product.IsInStock || !item.EnabledFlag) && { color: '#8c8c8c' }]}>{item.PromotionDesc}</Text>
                {item.IsBundle && <FoundationIcon name="burst-sale" color="orange" size={32} style={{ marginTop: -2, marginLeft: 8 }} />}
            </View>
            <View style={[MySaleStyle.flexRow, { flex: 1, justifyContent: 'space-between', alignSelf: 'flex-start' }]}>
                <View>
                    <Text style={[styles.promotionText,
                    (!this.state.product.IsInStock || !item.EnabledFlag) && { color: '#8c8c8c' }]}>{GlobalHelper.formatNum(item.Price)} ש"ח</Text>
                </View>
                <View>
                    <Text style={[MySaleStyle.partnerColor, styles.promotionText, MySaleStyle.bold, (!this.state.product.IsInStock || !item.EnabledFlag) && { color: '#8c8c8c' }]}> | </Text>
                </View>
                <View>
                    {item.MaxPayments == 1 ?
                        <Text style={[styles.promotionText, (!this.state.product.IsInStock || !item.EnabledFlag) && { color: '#8c8c8c' }]}>תשלום אחד</Text> :
                        <Text style={[styles.promotionText, (!this.state.product.IsInStock || !item.EnabledFlag) && { color: '#8c8c8c' }]}>
                            {item.MinPayments}-{item.MaxPayments} תשלומים</Text>}
                </View>
                <View>
                    {this.state.product.IsInStock && item.EnabledFlag &&
                        <Text style={[MySaleStyle.partnerColor, styles.promotionText, MySaleStyle.bold]}> | </Text>}
                </View>
                {this.state.product.IsInStock && item.EnabledFlag && <TouchableNativeFeedback onPress={() => { this.addProductToCart(item.PromotionId) }}>
                    <View>
                        <Text style={[MySaleStyle.partnerColor, styles.promotionText]}>הוספה לסל</Text>
                    </View>
                </TouchableNativeFeedback>}
            </View>
            <View style={[MySaleStyle.flexRow, { alignItems: 'flex-start', paddingTop: 30 }]}>
                {item.Profit != '' &&
                    <TouchableNativeFeedback onPress={() => { ToastAndroid.showWithGravity(item.Profit, ToastAndroid.SHORT, ToastAndroid.CENTER); }}>
                        <Image source={require('../assets/images/Bling.png')} style={{ width: 30, height: 30 }} />
                    </TouchableNativeFeedback>}
            </View>
        </View>
        {!hideExpand && <View style={{ flex: 0.1 }}>
            {i == 0 && (this.state.product.Prices[methodIndex].expandingPromotion ?
                <ActivityIndicator style={{ padding: 10 }} size="small" color={Colors.partnerColor} /> :
                <MaterialIcon name={this.state.product.Prices[methodIndex].isExpand ? "keyboard-arrow-down" : "keyboard-arrow-left"}
                    size={40} color={Colors.partnerColor} style={[{ marginTop: 2 }]} />)}
        </View>}
    </View>);

    renderPriceItem = (item, index) => {
        return (
            <View key={index}>
                {this.state.product.Prices.filter((p) => { return p.PaymentMethod === item.PaymentMethod }).length == 1 ?
                    this.renderPromotion(item, 0, index, true) :
                    <TouchableNativeFeedback key={index} onPress={() => this.toggleExpandCollapsePromotions(index)}
                        disabled={this.state.product.Prices[index].expandingPromotion} >
                        <View style={[MySaleStyle.flexRow]}>
                            {this.renderPromotion(item, 0, index)}
                        </View>
                    </TouchableNativeFeedback>}
                {this.state.product.Prices[index].isExpand &&
                    this.state.product.Prices.filter((p) => {
                        return p.PaymentMethod === item.PaymentMethod && !p.DefaultFlag
                    })
                        .map((promotion, i) => { return this.renderPromotion(promotion, i + 1, index) })}
            </View>
        )
    }

    render() {
        const { barcodeData } = this.props.route.params ?? {};

        return (
            <ScrollView style={styles.scrollView}>
                {this.state.isLoading ?
                    <MyActivityIndicator /> :
                    <View style={styles.contentContainer}>
                        {this.state.IsSuccess ?
                            <View style={styles.productContainer}>
                                <Text style={MySaleStyle.textHeader}>{this.state.product.HebDesc}</Text>
                                <View style={styles.description}>
                                    {this.state.product.HebDesc !== this.state.product.Name &&
                                        <Text style={[styles.rowText, MySaleStyle.textAlignRight]}>{this.state.product.Name}</Text>}
                                    {barcodeData && !barcodeData.match(/^[a-zA-Z]-/g) &&
                                        <Text style={styles.rowText}>סריאלי: {barcodeData}</Text>}
                                    <Text style={styles.rowText}>מק"ט: {this.state.product.CatalogNum}</Text>
                                    <Text style={styles.rowText}>קטגוריה: {this.state.product.Category}</Text>
                                    {this.state.product.IsInStock ?
                                        <View style={styles.textWithIcon}>
                                            <Ionicons style={[styles.rowIcon, styles.rowIconInStock]} name="md-checkmark-circle" color="green" size={25} />
                                            <Text style={styles.rowText}>קיים במלאי</Text>
                                        </View> :
                                        <View style={styles.textWithIcon}>
                                            <FoundationIcon style={[styles.rowIcon, styles.rowIconInStock]} name="x-circle" color="red" size={28} />
                                            <Text style={styles.rowText}>לא במלאי</Text>
                                        </View>}
                                    {this.state.product.IsOnSale &&
                                        <View style={styles.textWithIcon}>
                                            <FoundationIcon style={[styles.rowIconOnSale]} name="burst-sale" color="orange" size={32} />
                                            <Text style={styles.rowText}>{this.state.product.SaleDesc}</Text>
                                        </View>}
                                </View>


                                <View>
                                    {/* <View style={[MySaleStyle.margTop10]}> */}
                                    <TouchableNativeFeedback onPress={() => this.toggleExpandCollapseStock()} disabled={this.state.loadingStock}>
                                        <View style={styles.lastRow}>
                                            <Text style={[styles.rowPriceText, styles.promotionHeader]} >זמינות במרכזי שירות אחרים</Text>
                                            {this.state.loadingStock ?
                                                <ActivityIndicator style={{ padding: 10 }} size="small" color={Colors.partnerColor} /> :
                                                <MaterialIcon style={[MySaleStyle.margTop10]}
                                                    name={this.state.stockIsExpand ? "keyboard-arrow-down" : "keyboard-arrow-left"}
                                                    size={40} color={Colors.partnerColor} />
                                            }
                                        </View>
                                    </TouchableNativeFeedback>
                                    {/* </View> */}
                                    {(this.state.stockIsExpand == true) &&
                                        <View style={{ paddingLeft: 10 }}>
                                            {this.state.orgUnitsStock.map((item, index) => <View key={index}>
                                                <Text style={[styles.rowPriceText, MySaleStyle.textAlignRight]}>{item.OrgUnitDesc} ({item.Quantity})</Text>
                                            </View>)}
                                        </View>
                                    }
                                </View>

                                <View style={styles.prices}>
                                    {this.state.product.Prices && this.state.product.Prices.length > 0 &&
                                        <View>
                                            <Text style={styles.subHeader}>אפשרויות רכישה</Text>
                                            {this.state.product.Prices.filter((p) => p.DefaultFlag).map((item, index) => this.renderPriceItem(item, index))}
                                        </View>
                                    }
                                </View>
                            </View>
                            // !IsSuccess
                            : <View>
                                <Text style={styles.productName}>{this.state.GlobalMessage}</Text>
                            </View>}
                    </View>}
                {this.state.message && <ModalMessage message={this.state.message} onClose={() => this.setState({ message: null })} />}
            </ScrollView>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        customer: state.connectionDetailsReducer.customer,
        //numOfItems: state.cartReducer.numOfItems,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailsScreen);

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        //paddingRight: 25,
        //paddingLeft: 25,
    },
    underHeaderSection: {
        flex: 1,
        flexDirection: 'column',
    },
    productContainer: {
        flexDirection: 'column',
        flex: 1
    },
    description: {
        flexDirection: 'column',
        marginTop: 5,
        paddingLeft: 10
    },
    textWithIcon: {
        flexDirection: 'row',
        paddingRight: 10,
        alignItems: 'center',
    },
    price: {
        fontSize: 22,
        fontFamily: 'simpler-black-webfont',
        paddingRight: 10
    },
    productName: {
        // fontSize: 18,
        // fontWeight: 'bold',
        paddingRight: 10,
        paddingLeft: 10,
        marginTop: 10,
        marginBottom: 5,
        fontSize: 22,
        fontFamily: 'simpler-regular-webfont'
    },
    subHeader: {
        fontSize: 22,
        paddingRight: 10,
        marginTop: 13,
        marginBottom: 5,
        fontFamily: 'simpler-black-webfont'
    },
    rowText: {
        paddingRight: 10,
        paddingLeft: 40,
        fontSize: 16,
        marginTop: 7,
        fontFamily: 'simpler-regular-webfont'
    },
    rowPriceText: {
        fontSize: 16,
        marginTop: 5,
        fontFamily: 'simpler-regular-webfont'
    },
    promotionText: {
        fontSize: 17,
        marginTop: 5,
        fontFamily: 'simpler-regular-webfont'
    },
    rowIcon: {
        paddingRight: 10,
    },
    rowIconInStock: {
        marginTop: 10
    },
    rowIconOnSale: {
        paddingRight: 8,
    },
    prices: {
        marginTop: 10,
    },
    buttonAddToCart: {
        margin: 20,
    },
    lastRow: {
        //flex: 1,
        //padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: -8,
    },
    contentContainer: {
        //position: 'absolute',
        flex: 1,
        backgroundColor: '#fff'
    },
    promotionHeader: {
        paddingRight: 10,
        fontSize: 22,
        fontFamily: 'simpler-regular-webfont'
    },
    priceLine: {
        fontSize: 18,
        fontFamily: 'simpler-regular-webfont'
    },
    addButton: {
        marginTop: 15,
        marginBottom: 15,
    },
    cartIcon: {
        width: 50,
        height: 50,
    },
});

AppRegistry.registerComponent('ProductDetailsScreen', () => ProductDetailsScreen);

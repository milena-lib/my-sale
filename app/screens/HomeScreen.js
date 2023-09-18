import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {
    AppState,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    View,
    ScrollView,
    Text,
    Image,
    BackHandler,
    DeviceEventEmitter,
    NativeEventEmitter,
    RefreshControl,
    TextInput, Alert, NativeModules, Button, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AUTHENTICATION_TIME_KEY_NAME,
    GUID_KEY_NAME,
    CONNECTED_AS_KEY_NAME,
    IS_P2_LITE_DEVICE
} from '../constants/General';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as Actions from '../actions';
import Api from '../api/api';
import MyActivityIndicator from '../components/MyActivityIndicator';
import GlobalHelper from '../utils/globalHelper';
import SearchPanel from '../components/SearchPanel';
import UserDetails from '../components/UserDetails';
import SearchCustomer from '../components/SearchCustomer';
import SunmiScanner from '../utils/SunmiScanner';
import Scale from "../components/Scale";
import BarcodeErrorPopup from "../components/BarcodeErrorPopup";


const HomeScreen = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [exitApp, setExitApp] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [barcode, setBarcode] = useState('');
    //const [showDialog, setShowDialog] = useState(false);

    const navigation = useNavigation();

    const customer = useSelector(state => state.connectionDetailsReducer.customer);
    useEffect(() => {
        const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
        // let scannerSub = null;
        // let focusSubscription = null;
        let blurSubscription = null;
        let eventEmitter = null
        if (IS_P2_LITE_DEVICE) {
            // console.log(SunmiScanner.scan(result=>console.log(result)))
            // focusSubscription = navigation.addListener('focus', () => {
            //     scannerSub = DeviceEventEmitter.addListener('onReceiveBarcode', onReceiveBarcode);
            // });

            eventEmitter = new NativeEventEmitter().addListener('onReceiveBarcode', onReceiveBarcode)
        }
        // blurSubscription = navigation.addListener('blur', () => {
        //     if (eventEmitter) {
        //         eventEmitter.remove();
        //     }
        // });

        fetchProducts();

        return () => {
            if (appStateSubscription) {
                appStateSubscription.remove();
            }
            if (eventEmitter) {
                eventEmitter.remove();
            }
            //
            // if (focusSubscription) {
            //     focusSubscription();
            // }
            //
            // if (blurSubscription) {
            //     blurSubscription();
            // }
            //
            // if (scannerSub) {
            //     scannerSub.remove();
            // }
        }
    }, [barcode, setBarcode]);

    const onReceiveBarcode = (event) => {
        const barcode = event.replace(/[^0-9a-z-]/gi, '');//'S-59795'
        setIsLoading(true);
        Api.post('/GetProductDetails', {
                strProductCode: barcode,
                strLoginId: GlobalHelper.loginId,
                billCustId: customer ? customer.BillingCustomerId : '',
                sessionId: customer ? customer.SessionId : '',
                cartId: GlobalHelper.cartId
            }
        ).then(resp => {
            setIsLoading(false);
            if (resp?.d?.IsSuccess && resp.d.Product) {
                //setShowDialog(false)
                props.navigation.navigate('ProductDetails', {
                    productDetailsByBarcode: resp.d.Product,
                    barcodeData: barcode
                });
            } else {
                let msg = "אירעה שגיאה בטעינת תיאור המוצר";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                }
                Alert.alert("מוצר לא נמצא", msg,[{text:"אישור" ,style:"default"}]);
                //setShowDialog(true)
            }
        });
    }

    useFocusEffect(
        React.useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove();
        }, [exitApp])
    );

    const onBackPress = () => {
        setTimeout(() => {
            setExitApp(0);
        }, 2000); // 2 seconds to tap second-time

        if (exitApp === 0) {
            setExitApp(exitApp + 1);

            ToastAndroid.show('לחץ שוב ליציאה', ToastAndroid.SHORT);
        } else if (exitApp === 1) {
            BackHandler.exitApp();
        }

        return true;
    };

    const handleAppStateChange = async nextAppState => {
        if (nextAppState === "active") {
            const authenticationTime = await AsyncStorage.getItem(AUTHENTICATION_TIME_KEY_NAME);
            let authenticationDate = new Date(authenticationTime);
            let now = new Date();

            if (now.getDate() !== authenticationDate.getDate()) {
                ToastAndroid.showWithGravity('יש לבצע הזדהות מחדש', ToastAndroid.LONG, ToastAndroid.CENTER);
                props.clearCustomer();
                props.clearCart();
                GlobalHelper.connectedAsIdNumber = '';

                AsyncStorage.multiRemove([GUID_KEY_NAME, CONNECTED_AS_KEY_NAME], (err) => {
                    props.setSignedIn(false);
                });
            }
        }
    };

    const fetchProducts = (isRefresh) => {
        setRefreshing(isRefresh);
        setIsLoading(true);
        setErrorMsg(null);
        Api.post('/GetHotListDetails', {
            strCurrentOrgUnit: GlobalHelper.orgUnitCode,
            listCode: 'FAVORITES'
        }).then(resp => {
            setRefreshing(false);
            setIsLoading(false);
            if (resp.d?.IsSuccess) {
                setProducts(resp.d.ListProducts);
            } else {
                let msg = "אירעה שגיאה בטעינת המוצרים המומלצים";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                }
                setErrorMsg(msg);
            }
        });
    }

    const generateRow = (products) => {
        return products.map((p, i) => {
            return <View key={i} style={{alignItems: 'center', width: 100, marginLeft: 10}}>
                <TouchableOpacity style={styles.slide1}
                                  onPress={() => props.navigation.navigate('ProductDetails', {catalogNum: p.CatalogNum})}>
                    <Image style={{width: 90, height: 130}} resizeMode='contain'
                           source={{uri: `${'https://www.partner.co.il/globalassets/intranet/mysale/'}${p.CatalogNum}${'.png'}`}}
                           defaultSource={!__DEV__ ? {uri: 'https://www.partner.co.il/globalassets/intranet/mysale/default.png'} : undefined}/>
                </TouchableOpacity>

                <Text
                    style={styles.productDesc}>{p.Description.length > 30 ? p.Description.substring(0, 30) + '...' : p.Description}</Text>
            </View>
        });
    }

    const generateRows = () => {
        let levelsArr = Array.from(new Set(products.map((p) => p.Level))).sort((a, b) => a - b);
        let categoryArr = levelsArr.map((level) => products.filter((p) => p.Level == level)[0].Category);

        return levelsArr.map((level, i) => {
            return <View key={i}>
                <Text style={styles.boxHeader}>{categoryArr[i]}</Text>
                <ScrollView contentContainerStyle={{flexGrow: 1}} horizontal={true}
                            showsHorizontalScrollIndicator={false}>
                    {generateRow(products.filter((p) => p.Level == level))}
                </ScrollView>
                <View style={styles.hr}/>
            </View>
        });
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchProducts(true)}
                            />
                        }>
                <UserDetails navigation={props.navigation}/>
                <SearchPanel navigation={props.navigation}/>
                <SearchCustomer/>
                {isLoading ? <View style={{marginTop: 80}}><MyActivityIndicator/></View> :
                    (products.length > 0 ?
                        <View style={{marginTop: 40}}>
                            {generateRows()}
                        </View> :
                        <Text style={{padding: 20, fontSize: 16, fontFamily: 'simpler-regular-webfont'}}>לא נמצאו מוצרים
                            מומלצים</Text>)}
                {errorMsg &&
                    <Text style={{padding: 20, fontSize: 16, fontFamily: 'simpler-regular-webfont'}}>{errorMsg}</Text>}
                {/*TODO this is ment for a nice dialog box when scanned item isnt found, can remove if no need anymore*/}
                {/*{showDialog && <BarcodeErrorPopup barcode={barcode} navigation={props.navigation} onBarcodeScanned={onReceiveBarcode}/>}*/}
            </ScrollView>
        </View>
    );
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch);
}

export default connect(null, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    boxHeader: {
        fontSize: 18,
        padding: 10,
        fontFamily: 'simpler-black-webfont'
    },
    slide1: {
        flex: 1
    },
    productDesc: {
        fontSize: 12,
        padding: 10,
        width: 120,
        height: 65,
        fontFamily: 'simpler-regular-webfont'
    },
    scrollView: {
        flex: 1,
    },
    hr: {
        borderBottomColor: '#a5a5a5',
        borderBottomWidth: 1,
        margin: 15
    }
});

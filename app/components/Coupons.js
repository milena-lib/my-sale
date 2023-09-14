import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, Pressable, ToastAndroid } from 'react-native';
import MyActivityIndicator from './MyActivityIndicator';
import { useSelector, useDispatch } from 'react-redux';
import GlobalHelper from '../utils/globalHelper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Consts from '../constants/Consts';
import ModalMessage from '../components/ModalMessage';
import Api from '../api/api';
import { setCoupons } from '../actions';

const Coupons = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const coupons = useSelector(state => state.cartReducer.coupons);

    const dispatch = useDispatch();

    useEffect(() => { getCoupons() }, []);

    const getCoupons = () => {
        setIsLoading(true);
        Api.post('/GetCoupons', {
            strCartId: GlobalHelper.cartId
        }).then(resp => {
            setIsLoading(false);

            if (resp?.d?.IsSuccess) {
                dispatch(setCoupons(resp.d.List));
            } else {
                let msg = "אירעה שגיאה בקבלת הקופונים";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                setErrorMessage(Consts.globalErrorMessagePrefix + msg);
            }
        });
    }

    const Coupon = ({ coupon }) => (<>
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={styles.row}>
                    <Text style={styles.rowText}>מספר קופון:</Text>
                    <Text style={styles.rowText}>{coupon.Number}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.rowText}>טלפון:</Text>
                    <Text style={styles.rowText}>{coupon.Phone}</Text>
                </View>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Pressable onPress={() => confirmDelete(coupon.Number)}>
                    <Icon name={'trash'} size={20} style={{ paddingRight: 5, paddingLeft: 5, marginTop: 10 }} />
                </Pressable>
            </View>
        </View>
        <View style={styles.hr} />
    </>
    );

    const confirmDelete = (couponNumber) => {
        Alert.alert(
            'מחיקת קופון',
            'האם למחוק את הקופון?',
            [
                { text: 'כן', onPress: () => deleteCoupon(couponNumber) },
                { text: 'לא', onPress: () => null },
            ],
        )
    }

    const deleteCoupon = (couponNumber) => {
        setIsLoading(true);
        Api.post('/DeleteCoupon', {
            strCartId: GlobalHelper.cartId,
            couponNumber
        }).then(resp => {
            setIsLoading(false);
            if (resp?.d?.IsSuccess) {
                ToastAndroid.show('הקופון נמחק בהצלחה', ToastAndroid.SHORT);
                getCoupons();
            } else {
                let msg = "אירעה שגיאה במחיקת הקופון";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                setErrorMessage(Consts.globalErrorMessagePrefix + msg);
            }
        });
    }

    return (
        isLoading ? <MyActivityIndicator /> :
            <>
                {coupons.length === 0 && <Text>לא נוספו קופונים</Text>}
                {coupons.map((c, index) => <Coupon coupon={c} key={index} />)}
                {errorMessage && <ModalMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rowText: {
        paddingRight: 20,
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont'
    },
    title: {
        fontSize: 18,
        fontFamily: 'simpler-regular-webfont'
    },
    hr: {
        borderBottomColor: '#a5a5a5',
        borderBottomWidth: 1,
        margin: 15
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

export default Coupons;
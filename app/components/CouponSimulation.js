import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, ToastAndroid } from 'react-native';
import MyActivityIndicator from './MyActivityIndicator';
import GlobalHelper from '../utils/globalHelper';
import Colors from '../constants/Colors';
import Consts from '../constants/Consts';
import MySaleStyle from '../constants/Styles';
import ModalMessage from '../components/ModalMessage';
import Api from '../api/api';

const CouponSimulation = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState(props.items);
    const [errorMessage, setErrorMessage] = useState(null);

    const updateCoupon = (index) => {
        var newState = [...items];
        newState[index].used = !newState[index].used;
        setItems(newState);
    }

    const useOrCancelCoupon = (coupon, index) => {
        let action = !coupon.used ? '/UseCoupon' : '/CancelCoupon';

        setIsLoading(true);

        Api.post(action, {
            cartId: GlobalHelper.cartId,
            lineId: coupon.LineId,
            processId: coupon.ProcessId,
            couponNumber: coupon.CouponNumber
        }).then(resp => {
            setIsLoading(false);
            if (resp?.d?.IsSuccess) {
                let action = !coupon.used ? 'למימוש' : 'לביטול';
                ToastAndroid.show(`הקופון סומן ${action} בהצלחה`, ToastAndroid.SHORT);
                updateCoupon(index);
            } else {
                let action = !coupon.used ? 'מימוש' : 'ביטול';
                let msg = `אירעה שגיאה ב${action} הקופון`;

                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                setErrorMessage(Consts.globalErrorMessagePrefix + msg);
            }
        });
    }

    const Item = ({ item, index }) => {
        return (
            <View style={styles.container}>
                <View style={[styles.row, {width: '100%'}]}>
                    <Text style={[styles.rowText, styles.productName]}>{item.ItemDesc}</Text>
                    <Text style={[styles.rowText, styles.priceText]}>{GlobalHelper.formatNum(item.TotalPrice)} ש"ח</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.rowText}>פריט:</Text>
                    <Text style={styles.rowText}>{item.ItemCode}</Text>
                </View>
                {!!item.Imei && <View style={styles.row}>
                    <Text style={styles.rowText}>IMEI:</Text>
                    <Text style={styles.rowText}>{item.Imei}</Text>
                </View>}
                {!!item.CouponNumber && <View style={styles.row}>
                    <Text style={styles.rowText}>מספר קופון:</Text>
                    <Text style={styles.rowText}>{item.CouponNumber}</Text>
                </View>}
                {!!item.CouponAmount && <View style={styles.row}>
                    <Text style={styles.rowText}>הנחת קופון:</Text>
                    <Text style={styles.rowText}>{GlobalHelper.formatNum(item.CouponAmount)} ש"ח</Text>
                </View>}
                <View style={styles.row}>
                    <Text style={styles.rowText}>מחיר סופי:</Text>
                    <Text style={[styles.rowText, styles.finalPrice]}>{GlobalHelper.formatNum(item.FinalPrice)} ש"ח</Text>
                </View>
                {!!item.CouponNumber && <View style={MySaleStyle.alignSelfCenter}>
                    <Pressable onPress={() => useOrCancelCoupon(item, index)}>
                        <Text style={styles.actionText}>{!item.used ? 'מימוש קופון' : 'ביטול קופון'}</Text>
                    </Pressable>
                </View>}
                {items.length > 1 && index != items.length - 1 &&
                    <View style={styles.separator}></View>
                }
            </View>
        )
    }

    return (
        isLoading ? <MyActivityIndicator /> :
            <>
                {items.map((item, index) => <Item item={item} key={index} index={index} />)}
                {errorMessage && <ModalMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingHorizontal: 20,
        //marginRight: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 1
    },
    rowText: {
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont',
        flexWrap: 'wrap',
    },
    productName: {
        fontSize: 18,
        fontFamily: 'simpler-black-webfont',
        width: '80%'
    },
    priceText: {
        fontSize: 18,
        fontFamily: 'simpler-black-webfont',
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
    },
    finalPrice: {
        color: Colors.partnerColor,
        fontSize: 18,
        fontFamily: 'simpler-black-webfont'
    },
    actionText: {
        fontSize: 18,
        //color: "#a5a5a5",
        //color: "#fbacac",
        color: "#f86d6d",
        fontFamily: 'simpler-black-webfont',
        lineHeight: 50,
    },
    hr: {
        borderBottomColor: '#a5a5a5',
        borderBottomWidth: 1,
        margin: 15
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        marginTop: 10
    }
});

export default CouponSimulation;
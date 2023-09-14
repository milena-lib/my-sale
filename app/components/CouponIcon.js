import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, Image, View } from 'react-native';
import IconBadge from 'react-native-icon-badge';
import { useSelector } from 'react-redux';
import AddCoupons from '../components/AddCoupons';

const CouponIcon = () => {
    const [showCouponsModal, setShowCouponsModal] = useState(false);
    const numOfCoupons = useSelector(state => state.cartReducer.coupons.length);

    return (
        <>
            <Pressable onPress={() => setShowCouponsModal(true)}>
                <IconBadge
                    MainElement={<View style={styles.cartIconContainer}>
                        <Image source={require('../assets/images/coupon.png')} style={styles.iconSize} />
                    </View>
                    }
                    BadgeElement={
                        <Text style={styles.badgeText}>{numOfCoupons}</Text>
                    }
                    IconBadgeStyle={styles.iconBadge}
                    Hidden={numOfCoupons == 0}
                />
            </ Pressable>
            {showCouponsModal && <AddCoupons onCloseCouponsModal={() => setShowCouponsModal(false)} />}
        </>
    );
}

export default CouponIcon;

const styles = StyleSheet.create({
    cartIconContainer: {
        width: 80,
        alignItems: 'flex-end',
        marginRight: 10
    },
    iconSize: {
        width: 45,
        height: 45
    },
    iconBadge: {
        width: 21,
        height: 21,
        backgroundColor: '#AA222F',
        marginRight: 40,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'simpler-bold-webfont'
    }
});

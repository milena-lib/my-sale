import React from 'react';
import { useSelector } from 'react-redux';
import { Text, StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import IconBadge from 'react-native-icon-badge';
import Colors from '../constants/Colors';

export default function CartIcon(props) {
    const numOfItems = useSelector(state => state.cartReducer.numOfItems);

    return (
        <TouchableOpacity onPress={(e) => {
            // workaround to prevent unnecessary navigation when scanning barcode
            if (e._dispatchListeners.name === 'onResponderRelease') {
                props.navigation.navigate('Cart', { screen: 'Cart' })
            }
        }}>
            <IconBadge
                MainElement={<View style={styles.cartIconContainer}>
                    <Image source={require('../assets/images/cart.png')} style={styles.iconSize} tintColor={Colors.partnerColor} />
                </View>
                }
                BadgeElement={
                    <Text style={styles.badgeText}>{numOfItems}</Text>
                }
                IconBadgeStyle={styles.iconBadge}
                Hidden={numOfItems == 0}
            />
        </TouchableOpacity>
    );
}

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

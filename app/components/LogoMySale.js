import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

export default class LogoMySale extends React.Component {

    render() {
        return (
            <View style={styles.container}>
                <Image source={require('../assets/images/LogoMySale.png')} resizeMode="center" style={{ height: 50 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
  
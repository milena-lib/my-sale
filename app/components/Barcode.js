import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BarCodeScanner} from 'expo-barcode-scanner';

export default function Barcode(props) {
    const [hasPermission, setHasPermission] = useState(null);

    const navigation = useNavigation();

    useEffect(function () {

        async function getStatus() {
            const {status} = await BarCodeScanner.requestPermissionsAsync()
            return status;
        }

        getStatus().then(resp => setHasPermission(resp === 'granted'))

        const unsubscribe = navigation.addListener('blur', () => {
            navigation.pop();
        });

        return unsubscribe;
    }, []);

    if (hasPermission === null) {
        return <Text>בודק הרשאה למצלמה</Text>;
    }
    if (hasPermission === false) {
        return <Text>חסרה הרשאה למצלמה</Text>;
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={props.onBarcodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});

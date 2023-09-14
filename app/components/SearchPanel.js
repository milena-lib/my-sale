import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import {IS_P2_LITE_DEVICE} from "../constants/General";


export default function SearchPanel(props) {
    let text = "חפש מוצר..."
    if (IS_P2_LITE_DEVICE) {
        text = "לחץ לחיפוש מוצר או בצע סריקה ע\"י הלחצן הכתום בצידי המכשיר"
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => props.navigation.navigate('SearchProducts', {fromCart: props.fromCart})}
                              style={styles.searchSection}>
                <EvilIcon size={40} style={{padding: 15}} name="search"/>
                <Text style={styles.searchText} inlineImageLeft="">{text}</Text>
                {!IS_P2_LITE_DEVICE &&
                    <TouchableOpacity onPress={() => props.navigation.navigate('Barcode', {fromProductDetails: false})}>
                        <Icon name="barcode" size={60} style={styles.barcodeIcon}/>
                    </TouchableOpacity>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        //borderBottomColor: '#a5a5a5',
        //borderBottomWidth: 1,
    },
    searchSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#fff',
    },
    searchText: {
        flex: 1,
        color: "#c7c7cd",
        //height: 60,
        fontSize: 18,
        marginLeft: 5,
        backgroundColor: '#fff',
        fontFamily: 'simpler-regular-webfont'
    },
    barcodeIcon: {
        padding: 10
    },
});

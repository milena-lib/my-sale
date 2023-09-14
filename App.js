import React, {useState} from 'react';
import {StyleSheet, View, PermissionsAndroid, Alert} from 'react-native';
import {Provider} from 'react-redux';
import {Asset} from 'expo-asset';
import AppLoading from 'expo-app-loading';
import store from './app/store'; //Import the store
import RootNavigation from './app/navigation/RootNavigation';
import {NavigationContainer} from '@react-navigation/native';
import PartnerUtils from './app/utils/PartnerNative';
import GlobalHelper from './app/utils/globalHelper';
import IMEI from "react-native-imei";
import {TEST_MODE} from "./app/constants/General";
import RNFS from 'react-native-fs';


// export default class App extends React.Component {
//     state = {
//         isLoadingComplete: false,
//     };
//
//     render() {
//         if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
//             return (
//                 <Provider store={store}>
//                     <AppLoading
//                         startAsync={this._cacheResourcesAsync}
//                         onError={this._handleLoadingError}
//                         onFinish={this._handleFinishLoading}
//                     />
//                 </Provider>
//             );
//         } else {
//             return (
//                 <Provider store={store}>
//                     <View style={styles.container}>
//                         <NavigationContainer>
//                             <RootNavigation/>
//                         </NavigationContainer>
//                     </View>
//                 </Provider>
//             );
//         }
//     }
//
//     _handleLoadingError = error => {
//         // In this case, you might want to report the error to your error
//         // reporting service, for example Sentry
//         console.warn(error);
//     };
//
//     _handleFinishLoading = () => {
//         this.setState({isLoadingComplete: true});
//     };
//
//     getImei = async () => {
//         try {
//             const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
//             if (status === PermissionsAndroid.RESULTS.GRANTED) {
//                 //console.log(PermissionsAndroid.request.PERMISSIONS.READ_PRIVILEGED_PHONE_STATE);
//                 //console.log(TEST_MODE);
//                 //GlobalHelper.deviceId = await PartnerUtils.getImei(); // Remove
//                 const IMEI = require('react-native-imei');
//                 //console.log(IMEI.getImei())
//                 GlobalHelper.deviceId = (await IMEI.getImei()).toString();
//                 //console.log("IMEI : " + await IMEI.getImei());
//                 //GlobalHelper.deviceId = "358205082486294"
//                 // console.log(RNFS.ExternalStorageDirectoryPath)
//                 // console.log(RNFS.readFile(RNFS.ExternalStorageDirectoryPath + '/Roi/IMEI.txt'))
//             } else {
//                 Alert.alert('לא ניתנה הרשאה מתאימה לקריאת מזהה המכשיר');
//             }
//         } catch (err) {
//             Alert.alert(err.message);
//         }
//     }
//
//     _cacheResourcesAsync = async () => {
//         await this.getImei();
//
//         const images = [
//             require('./app/assets/images/LogoMySale.png'),
//             require('./app/assets/images/icon.png'),
//             require('./app/assets/images/cart.png'),
//             require('./app/assets/images/EmptyCart.png'),
//         ];
//
//         const cacheImages = images.map((image) => {
//             return Asset.fromModule(image).downloadAsync();
//         });
//         return Promise.all(cacheImages);
//     }
// }

export default function App({skipLoadingScreen}) {
    const [isLoadingComplete, setIsLoadingComplete] = useState(false);
    function handleLoadingError(error) {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error);
    }

    function handleFinishLoading() {
        setIsLoadingComplete(true);
    }

    async function getImei() {
        try {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                //console.log(PermissionsAndroid.request.PERMISSIONS.READ_PRIVILEGED_PHONE_STATE);
                //console.log(TEST_MODE);
                //GlobalHelper.deviceId = await PartnerUtils.getImei(); // Remove
                const IMEI = require('react-native-imei');
                //console.log(IMEI.getImei())
                GlobalHelper.deviceId = (await IMEI.getImei()).toString();
                //console.log("IMEI : " + await IMEI.getImei());
                //GlobalHelper.deviceId = "358205082486294"
                // console.log(RNFS.ExternalStorageDirectoryPath)
                // console.log(RNFS.readFile(RNFS.ExternalStorageDirectoryPath + '/Roi/IMEI.txt'))
            } else {
                Alert.alert('לא ניתנה הרשאה מתאימה לקריאת מזהה המכשיר');
            }
        } catch (err) {
            Alert.alert(err.message);
        }
    }

    async function cacheResourcesAsync() {
        await getImei();

        const images = [
            require('./app/assets/images/LogoMySale.png'),
            require('./app/assets/images/icon.png'),
            require('./app/assets/images/cart.png'),
            require('./app/assets/images/EmptyCart.png'),
        ];

        const cacheImages = images.map((image) => {
            return Asset.fromModule(image).downloadAsync();
        });
        return Promise.all(cacheImages);
    }


    if (!isLoadingComplete && !skipLoadingScreen) {
        return (
            <Provider store={store}>
                <AppLoading
                    startAsync={cacheResourcesAsync}
                    onError={handleLoadingError}
                    onFinish={handleFinishLoading}
                />
            </Provider>
        );
    } else {
        return (
            <Provider store={store}>
                <View style={styles.container}>
                    <NavigationContainer>
                        <RootNavigation/>
                    </NavigationContainer>
                </View>
            </Provider>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

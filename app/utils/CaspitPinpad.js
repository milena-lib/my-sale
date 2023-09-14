import { NativeModules } from 'react-native';
import { IS_P2_LITE_DEVICE } from '../constants/General';

if (IS_P2_LITE_DEVICE) {
    module.exports = NativeModules.CaspitCore;
} else {
    module.exports = NativeModules.CaspitPinpad;
}
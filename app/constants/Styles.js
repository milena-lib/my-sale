'use strict';

import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

//Try supporting resolutions
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export default StyleSheet.create({
    viewScreen: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    textHeader: {
        // fontWeight: 'bold',
        // marginTop: 15,
        // marginBottom: 5,
        // fontSize: 20,
        marginTop: 15,
        marginBottom: 5,
        fontSize: 26,
        paddingRight: 10,
        paddingLeft: 10,
        fontFamily: 'simpler-regular-webfont'
    },
    textSubHeader: {
        fontSize: 18,
        fontFamily: 'simpler-bold-webfont'
    },
    flexRow: {
        flexDirection: 'row',
    },
    alignSelfCenter: {
        alignSelf: 'center'
    },
    margTop5: {
        marginTop: 5,
    },
    margTop10: {
        marginTop: 10,
    },
    margTop15: {
        marginTop: 15,
    },
    margTop20: {
        marginTop: 20,
    },
    margTop30: {
        marginTop: 30,
    },
    padRight10: {
        paddingRight: 10,
    },
    padRight20: {
        paddingRight: 20,
    },
    margBtm5: {
        marginBottom: 5
    },
    textAlignRight: {
        //Yeah it is the only way it works...
        textAlign: 'left',
    },
    normalFont: {
        fontSize: 16,
        fontFamily: 'simpler-regular-webfont'
    },
    inputTextFont: {
        fontSize: 18,
        paddingBottom: 6,
        fontFamily: 'simpler-regular-webfont'
    },
    textUnderline: {
        textDecorationLine: 'underline',
    },
    darkGray: {
        color: '#aaaaaa',
    },
    greenSackColor: {
        color: '#68db68',
    },
    redSackColor: {
        color: '#eb1515',
    },
    black: {
        color: '#000',
    },
    textErrOnPage: {
        fontSize: 18,
        fontFamily: 'simpler-bold-webfont',
        paddingRight: 10,
        paddingLeft: 10,
        marginTop: 20,
        marginBottom: 5,
        color: '#ff0000',
    },
    fieldNextToLabel: {
        paddingRight: 30,
    },
    PartnerButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    PartnerButtonBackground: {
        paddingRight: 20,
        paddingLeft: 20,
        backgroundColor: '#2cd5c4',
        paddingHorizontal: 25,
        paddingVertical: 5,
        height: 40,
        width: '90%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    PartnerButtonText: {
        fontSize: 19,
        fontWeight: '400',
        fontFamily: 'simpler-regular-webfont',
        color: '#000',
    },
    PartnerButtonBackgroundDisabled: {
        paddingRight: 20,
        paddingLeft: 20,
        // marginTop: 10,
        // marginBottom: 10,
        backgroundColor: '#d5d5d5',
        paddingHorizontal: 25,
        paddingVertical: 5,
        height: 40,
        //width: 394,
        width: '90%',
        //width: moderateScale(300, 0.3),
        //width: scale(300),
        alignItems: 'center'
    },
    flex1: {
        flex: 1
    },
    margTop40:
    {
        marginTop: 40,
    },
    MandatoryInd: {
        paddingRight: 5,
        color: Colors.redColor,
    },
    bold: {
        fontWeight: 'bold',
    },
    hr: {
        borderBottomColor: '#a5a5a5',
        borderBottomWidth: 1
    },
    titleHr: {
        borderBottomColor: '#2cd5c4',
        borderBottomWidth: 1,
        margin: 10
    },
    smallButtonBackground: {
        paddingRight: 20,
        paddingLeft: 20,
        backgroundColor: '#2cd5c4',
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        alignItems: 'center',
    },
    smallButtonBackgroundDisabled: {
        paddingRight: 20,
        paddingLeft: 20,
        backgroundColor: '#d5d5d5',
        paddingHorizontal: 15,
        paddingVertical: 5,
        height: 40,
        alignItems: 'center'
    },
    smallButtonText: {
        fontSize: 19,
        fontFamily: 'simpler-regular-webfont',
        fontWeight: '400',
        color: '#fff',
    },
    partnerColor: {
        color: Colors.partnerColor
    },
    secondaryColor: {
        color: Colors.secondaryColor
    },
    invalidInput: {
        color: Colors.redColor
    },
    inputText: {
        paddingBottom: -5,
        borderBottomColor: '#a5a5a5',
        borderBottomWidth: 1
    },
    pipe: {
        color: "#a5a5a5",
        fontSize: 18,
        fontFamily: 'simpler-bold-webfont'
    },
});
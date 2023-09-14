import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, StyleSheet, BackHandler, Text, ScrollView, Pressable, ToastAndroid } from 'react-native';
import Checkbox from 'expo-checkbox';
import MyActivityIndicator from '../components/MyActivityIndicator';
import { Dropdown } from 'react-native-material-dropdown';
import Api from '../api/api';
import Colors from '../constants/Colors';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';
import MySaleStyle from '../constants/Styles';
import CouponSimulation from '../components/CouponSimulation';
import FloatingLabelInput from '../components/FloatingLabelInput';

const CouponsScreen = ({ navigation, route }) => {
    const { Lines: items, Unused: unusedCoupons, Dist: distributionCoupons, PrimaryMobile, PrimaryEmail, Contracts } = route.params;
    
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [sendBy, setSendBy] = useState('SMS');
    //const [checkboxes, setCheckboxes] = useState([]);
    const [sendByTypes, setSendByTypes] = useState([]);
    const [sendContracts, setContracts] = useState([]);
    const [couponsForDistribution, setCouponsForDistribution] = useState(distributionCoupons);
    const [isDistributedCouponsSent, setDistributedCouponsSent] = useState(false);

    //const sendByTypes = [{ value: 'SMS', label: 'SMS' }, { value: 'EMAIL', label: 'מייל' }];

    useEffect(() => {
        const sendByTypes = [{ value: 'SMS', label: 'SMS' }];
        if (PrimaryEmail) {
            sendByTypes.push({ value: 'EMAIL', label: 'מייל' });
            setEmail(PrimaryEmail);
        }
        if (PrimaryMobile)
        {
            let contractsList = [];
            Contracts.forEach(c => contractsList.push({ value: c, label: c }));
            setContracts(contractsList);
            //setPhone(PrimaryMobile);
        }
        setSendByTypes(sendByTypes);
        
        //distributionCoupons.forEach(c => checkboxes.push(false))
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);

    useEffect(() => {
        setPhone(PrimaryMobile);
    }, [sendBy]);

    const distributeCoupons = () => {

        setSubmitted(true);

        let coupons = couponsForDistribution.filter(c => c.isChecked);
        // for (let i = 0; i < checkboxes.length; i++) {
        //     if (checkboxes[i]) {
        //         coupons.push(distributionCoupons[i].Id);
        //     }
        // }

        if (coupons.length === 0) {
            ToastAndroid.show('יש לבחור לפחות קופון אחד', ToastAndroid.SHORT);
            return;
        }

        if (!phone || (!email && sendBy === 'EMAIL')) {
            ToastAndroid.show('יש לעדכן פרטים לקבלת הקופונים שנבחרו', ToastAndroid.SHORT);
            return;
        }

        let couponsIds = coupons.map(c => c.Id);

        setIsLoading(true);
        Api.post('/DistributeCoupons', {
            cartId: GlobalHelper.cartId,
            coupons: couponsIds.join(),
            phone,
            email,
            sendBy
        }).then(resp => {
            setIsLoading(false);

            let subject = coupons.length === 1 ? 'הקופון' : 'הקופונים';
            if (resp?.d?.IsSuccess) {
                ToastAndroid.show(`שליחת ${subject} בוצעה בהצלחה`, ToastAndroid.SHORT);
                setSubmitted(false);
                setPhone('');
                setEmail('');
                setDistributedCouponsSent(true);
            } else {
                let msg = 'אירעה שגיאה בשליחת ' + subject;

                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                setErrorMessage(Consts.globalErrorMessagePrefix + msg);
            }
        });
    }

    const onBackPress = () => {
        navigation.navigate('Cart', { cancelCoupons: true });
        return true;
    }

    const onCheckboxChange = (id, val) => {
        // var newState = [...checkboxes];
        // newState[i] = val;
        // setCheckboxes(newState);
        setCouponsForDistribution(
            couponsForDistribution.map((coupon) =>
            coupon.Id === id
                    ? { ...coupon, isChecked: val }
                    : { ...coupon }
            )
        );
        
    }

    const Coupon = ({ coupon, index }) => (<>
        <View style={[styles.unusedCouponsContainer, {marginRight: 5}]}>
            <View>
                <View style={styles.row}>
                    <Text style={[styles.rowText]}>מספר קופון:</Text>
                    <Text style={[styles.rowText, styles.rowValue]}>{coupon.Value}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.rowText]}>תיאור:</Text>
                    <Text style={[styles.rowText]}>{coupon.Label}</Text>
                </View>
            </View>
        </View>
        { index < unusedCoupons.length - 1  &&
            <View style={styles.separator}></View> 
        }
    </>
    );

    const DistributionCoupon = ({ coupon, index }) => (<>
        <View style={styles.couponsContainer}>
            <View>
                <View style={styles.distCouponRow}>
                    <Checkbox style={{ marginLeft: 20 }} color={Colors.partnerColor} value={coupon.isChecked} onValueChange={val => onCheckboxChange(coupon.Id, val)} />
                    <Text style={[styles.rowText, styles.couponDesc]}>{coupon.Description}</Text>
                </View>
            </View>
        </View>
    </>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={1000} behavior="height" enabled>
                <View style={styles.viewWithBorder}>
                    <Text style={styles.textHeader}>סל הקניות</Text>
                    <CouponSimulation items={items} />
                </View>
                {!!unusedCoupons && unusedCoupons.length > 0 &&
                    <View style={styles.viewWithBorder}>
                        <Text style={styles.textHeader}>קופונים שלא ניתן לממש בעסקה זו</Text>
                        {unusedCoupons.map((c, index) => <Coupon coupon={c} key={index} index={index} />)}
                    </View>
                }
                {!!couponsForDistribution && couponsForDistribution.length > 0 && !isDistributedCouponsSent && 
                <View style={styles.viewWithBorder}>
                    <Text style={styles.textHeader}>זכאות לקופונים חדשים</Text>
                    {isLoading ? <MyActivityIndicator /> : <>
                        {couponsForDistribution.map((c, index) => <DistributionCoupon coupon={c} key={index} index={index} />)}
                        <View><Text style={styles.textSubHeader}>פרטים לקבלת הקופונים שנבחרו</Text></View>
                        <View style={{ paddingHorizontal: 30 }}>
                            <Dropdown label='אופן שליחה' labelFontSize={14} value={sendBy} style={{ fontFamily: 'simpler-regular-webfont' }}
                                data={sendByTypes}
                                onChangeText={(value, i, data) => { setSendBy(value) }} />
                        </View>
                        {sendBy === 'SMS' &&
                        <View>
                        { PrimaryMobile ?
                            <View style={{ paddingHorizontal: 30 }}>
                                <Dropdown label='מספר טלפון' labelFontSize={14} value={phone} style={{ fontFamily: 'simpler-regular-webfont' }}
                                    data={sendContracts}
                                    onChangeText={(value, i, data) => { setPhone(value) }} />
                            </View>
                        :
                            <View>
                                <FloatingLabelInput
                                    label="מספר טלפון"
                                    value={phone}
                                    onChangeText={setPhone}
                                    textAlign={'right'}
                                    maxLength={10}
                                    keyboardType='numeric'
                                    underlineColorAndroid={submitted && (!phone || phone.length < 9 || phone.length > 10) ? Colors.redColor : undefined} />
                                {submitted && (!phone &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון</Text> ||
                                    ((phone.length < 9 || phone.length > 10) &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון חוקי</Text>))}
                            </View>
                        }
                        </View>
                        }
                        {sendBy === 'EMAIL' &&
                        <View>
                            <FloatingLabelInput
                                label="כתובת מייל"
                                value={email}
                                onChangeText={setEmail}
                                textAlign={'left'}
                                keyboardType='email-address'
                                maxLength={100}
                                editable={false}
                                selectTextOnFocus={false}
                                underlineColorAndroid={submitted && !email ? Colors.redColor : undefined}
                            />
                            {submitted && (!email || !GlobalHelper.isEmailValid(email)) &&
                                <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין כתובת מייל חוקית</Text>}
                           
                            {/* <Text style={[{ marginLeft: 30 }, MySaleStyle.margTop20]}>כתובת מייל: {email}</Text> */}
                        </View>
                        }
                        <View style={[MySaleStyle.alignSelfCenter, MySaleStyle.margTop20]}>
                            <Pressable onPress={() => distributeCoupons()}>
                            {(couponsForDistribution.some(c => c.isChecked) &&
                                ((sendBy === 'EMAIL' && email && GlobalHelper.isEmailValid(email)) ||
                                (sendBy === 'SMS' && phone && phone.length >= 9 && phone.length <= 10)))  ?
                                <Text style={styles.actionEnabledText}>שלח</Text> :
                                <Text style={styles.actionText}>שלח</Text>
                            }
                            </Pressable>
                        </View>
                    </>}
                </View>
                }
                {!!isDistributedCouponsSent &&
                <View>
                    <Text style={styles.couponsAlreadyDistributedText}>שליחת הקופונים העתידיים הסתיימה בהצלחה</Text>
                </View>
                }
                <View style={styles.btnsSection}>
                    <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
                        <Pressable style={MySaleStyle.PartnerButtonBackground}
                            onPress={() => { navigation.navigate('Payment') }} >
                            <Text style={MySaleStyle.PartnerButtonText}>מעבר לתשלום</Text>
                        </Pressable>
                    </View>
                    <View style={[MySaleStyle.PartnerButtonContainer, MySaleStyle.margTop20]}>
                        <Pressable style={MySaleStyle.PartnerButtonBackground} onPress={onBackPress} >
                            <Text style={MySaleStyle.PartnerButtonText}>חזרה</Text>
                        </Pressable>
                    </View>
                </View>
                {errorMessage && <ModalMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            </KeyboardAvoidingView>
        </ScrollView>);
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingBottom: '10%',
    },
    textHeader: {
        marginTop: 15,
        marginBottom: 5,
        fontSize: 20,
        fontFamily: 'simpler-regular-webfont',
        paddingHorizontal: 10
    },
    couponsContainer: {
        marginVertical: 5,
        paddingRight: 20
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 1
    },
    btnsSection: {
        marginVertical: 40
    },
    distCouponRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionText: {
        fontSize: 18,
        color: "#a5a5a5",
        //color: "#fbacac",
        fontFamily: 'simpler-black-webfont',
        lineHeight: 50,
    },
    couponsAlreadyDistributedText: {
        marginBottom: 5,
        fontSize: 15,
        fontFamily: 'simpler-regular-webfont',
        textAlign: 'center',
    },
    viewWithBorder: {
        borderWidth: 1,
        borderColor: "#dddddd",
        borderBottomWidth: 3,
        borderRightWidth: 3,
        margin: 10,
        paddingBottom: 10
    },
    unusedCouponsContainer: {
        marginVertical: 5,
        paddingRight: 20,
        
        //justifyContent: 'space-between',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        marginHorizontal: 20,
        marginVertical: 5
    },
    textSubHeader: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 18,
        fontFamily: 'simpler-regular-webfont',
        paddingHorizontal: 10
    },
    actionEnabledText: {
        fontSize: 18,
        //color: "#a5a5a5",
        color: "#f86d6d",
        fontFamily: 'simpler-black-webfont',
        lineHeight: 50,
    },
    rowValue: {
        width: '70%',
        flexWrap: 'wrap',
    },
    couponDesc: {
        paddingLeft: 20
    }
});

export default CouponsScreen;
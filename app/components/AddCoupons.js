import React, { useState, useEffect } from "react";
import { StatusBar, ToastAndroid, Modal, StyleSheet, Text, Pressable, View, ScrollView } from "react-native";
import FloatingLabelInput from './FloatingLabelInput';
import MyActivityIndicator from './MyActivityIndicator';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';
import ModalMessage from '../components/ModalMessage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import GlobalHelper from '../utils/globalHelper';
import Consts from '../constants/Consts';
import Api from '../api/api';
import Coupons from "./Coupons";
import { useSelector } from 'react-redux';

const AddCoupons = (props) => {
    const [modalVisible, setModalVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [couponsList, setCouponList] = useState(['']);
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const singlePhone = useSelector(state => state.cartReducer.coupons[0]?.Phone);

    useEffect(() => {
        setPhone(singlePhone);
    }, [singlePhone]);

    const addCoupons = () => {
        setSubmitted(true);

        const latestCoupon = couponsList?.[couponsList.length-1];

        if (!phone || phone.length < 9 || phone.length > 10 || latestCoupon.length < 5 || couponsList.filter(c => !c).length > 0) {
            return;
        }

        setIsLoading(true);
        Api.post('/AddCoupons', {
            strCartId: GlobalHelper.cartId,
            coupons: couponsList.join(),
            phone: phone
        }).then(resp => {
            setIsLoading(false);
            setSubmitted(false);
            if (resp?.d?.IsSuccess) {
                if (couponsList.length === 1) {
                    ToastAndroid.show('הקופון נוסף בהצלחה', ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show('הקופונים נוספו בהצלחה', ToastAndroid.SHORT);
                }
                if (couponsList.length === 0) {
                    setPhone('');
                }
                setCouponList(['']);
            } else {
                let msg = "אירעה שגיאה בהוספת הקופון";
                if (resp.d.FriendlyMessage) {
                    msg = resp.d.FriendlyMessage;
                } else if (resp.d.ErrorMessage) {
                    msg = msg + ", " + resp.d.ErrorMessage;
                }
                setErrorMessage(Consts.globalErrorMessagePrefix + msg);
            }
        });
    }

    const onChangeCoupon = (i, val) => {
        var newState = [...couponsList];
        newState[i] = val;
        setCouponList(newState);
    }

    const addCouponField = () => {
        setCouponList(couponsList.concat(['']));
    }

    const deleteCouponField = (i) => {
        var newState = [...couponsList];
        newState.splice(i, 1);
        setCouponList(newState);
    }

    return (
        <Modal transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
                props.onCloseCouponsModal();
            }}
        >
            <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <Text style={styles.title}>הוספת קופונים</Text>
                    {isLoading ? <MyActivityIndicator /> : <>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <FloatingLabelInput
                                label="מספר טלפון"
                                value={phone}
                                onChangeText={setPhone}
                                textAlign={'right'}
                                maxLength={10}
                                editable={!singlePhone}
                                selectTextOnFocus={!singlePhone}
                                keyboardType='numeric'
                                underlineColorAndroid={submitted && (!phone || phone.length < 9 || phone.length > 10) ? Colors.redColor : undefined} />                        
                        </View>
                        <View>
                        {submitted && ((!phone &&
                            <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון</Text>) ||
                            ((phone.length < 9 || phone.length > 10) &&
                            <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר טלפון חוקי</Text>))}
                        </View>
                        {couponsList.map((couponNumber, i) => (<View style={[MySaleStyle.flexRow, { alignItems: 'flex-end', justifyContent: 'space-between' }]}>
                            <View key={i} style={[{ flex: 5, border: 'solid' }, MySaleStyle.margTop15]}>
                                <FloatingLabelInput
                                    key={i}
                                    label="מספר קופון"
                                    onChangeText={val => onChangeCoupon(i, val)}
                                    value={couponNumber}
                                    maxLength={30}
                                    textAlign={'right'}
                                    underlineColorAndroid={submitted && (!couponNumber || couponNumber.length < 5) ? Colors.redColor : undefined} />
                                {submitted && (!couponNumber &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר קופון</Text> ||
                                    couponNumber.length < 5 &&
                                    <Text style={{ color: Colors.redColor, marginLeft: 30 }}>נא להזין מספר קופון חוקי</Text>)}
                            </View>
                            <View style={[MySaleStyle.flexRow, { flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }]}>
                                {couponsList.length > 1 &&
                                    <Pressable onPress={() => deleteCouponField(i)}>
                                        <Icon name={'trash'} size={20} style={{ paddingRight: 5, paddingLeft: 5, marginTop: 10 }} />
                                    </Pressable>
                                }
                                {i === couponsList.length - 1 &&
                                    <Pressable onPress={addCouponField}>
                                        <Icon name={'plus'} size={20} style={{ paddingRight: 5, paddingLeft: 5, marginTop: 10 }} />
                                    </Pressable>
                                }
                            </View>
                        </View>))}
                        <View style={[MySaleStyle.flexRow, { marginTop: 40, alignItems: 'center', justifyContent: 'space-around' }]}>
                            <Pressable style={MySaleStyle.smallButtonBackground} onPress={addCoupons}>
                                <Text style={MySaleStyle.smallButtonText}>הוספה</Text>
                            </Pressable>
                        </View>
                        <View style={{ marginTop: 40 }}>
                            <Text style={styles.title}>קופונים שנוספו</Text>
                            <Coupons />
                        </View>
                        <View style={[MySaleStyle.flexRow, { marginTop: 60, alignItems: 'center', justifyContent: 'space-around' }]}>
                            <Pressable style={MySaleStyle.smallButtonBackground} onPress={() => {
                                setModalVisible(!modalVisible);
                                props.onCloseCouponsModal();
                            }} >
                                <Text style={MySaleStyle.smallButtonText}>סגירה</Text>
                            </Pressable>
                        </View>
                    </>}
                </ScrollView>
            </View>
            {errorMessage && <ModalMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        marginRight: 20,
        marginLeft: 20,
        marginTop: StatusBar.currentHeight || 0,
        backgroundColor: "white",
        borderRadius: 4,
        //justifyContent: 'center',
        //alignItems: 'center',
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    title: {
        fontSize: 22,
        marginBottom: 10,
        fontFamily: 'simpler-black-webfont'
    }
});

export default AddCoupons;
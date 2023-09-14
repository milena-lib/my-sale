import React, { useState, useEffect } from 'react';
import { View, Text, TouchableNativeFeedback, Alert, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ModalFilterPicker from 'react-native-modal-filter-picker';
import Api from '../api/api';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';
import Colors from '../constants/Colors';
//import MyActivityIndicator from '../components/MyActivityIndicator';

export default function OrgUnitComponent(props) {

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);

  useEffect(() => {
    fetchOrgUnits();

    const unsubscribe = navigation.addListener('focus', () => {
      setShowModal(props.showModal);
    });

    return unsubscribe;
  }, []);

  const fetchOrgUnits = () => {
    setIsLoading(true);
    Api.post('/GetOrgUnits', {}).then(resp => {
      //if (!this.isCancelled) {
      setIsLoading(false);
      if (resp.d && resp.d.IsSuccess) {
        //orgUnitList.unshift({OrgUnitCode: '', OrgUnitDesc: 'בחר ערך'})
        if (props.parentAddNullVal) {
          resp.d.ListOrgUnit.unshift({ OrgUnitCode: '', OrgUnitDesc: 'כל המרכזים' })
        }

        let options = resp.d.ListOrgUnit.map((ou) => { return { key: ou.OrgUnitCode, label: ou.OrgUnitDesc } });

        if (!props.parentAddNullVal) {
          options = options.filter((ou) => { return ou.key != GlobalHelper.orgUnitCode });
        }

        setOptions(options);

        if (!GlobalHelper.orgUnitCode) {
          setSelectedOrgUnit(resp.d.ListOrgUnit[0]);
        } else if (!showModal) {
          let currOrgUnit = resp.d.ListOrgUnit.filter((ou) => { return ou.OrgUnitCode == GlobalHelper.orgUnitCode })[0];
          setSelectedOrgUnit(currOrgUnit);
        }
      } else {
        let msg = "אירעה שגיאה בטעינת רשימת היחידות הארגוניות";
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        }
        else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      //}
    });
  }

  const onSelect = (selectedOrgUnit) => {
    if (props.updateOrgUnit) {
      props.updateOrgUnit(selectedOrgUnit);
    } else {
      props.parentOrgUnitHandler(selectedOrgUnit.key);
    }

    setShowModal(false);
    setSelectedOrgUnit({ OrgUnitCode: selectedOrgUnit.key, OrgUnitDesc: selectedOrgUnit.label });
  }

  const onCancel = () => {
    if (navigation && navigation.fromLogin) {
      Alert.alert('חובה לשייך מרכז על מנת להשתמש באפליקציה');
      return;
    }
    if (!props.parentAddNullVal) {
      navigation.navigate('Home');
    }
    setShowModal(false);
  }

  return (<View style={[MySaleStyle.viewScreen]}>
    {selectedOrgUnit &&
      <TouchableNativeFeedback style={[MySaleStyle.flexRow]} onPress={() => setShowModal(true)}>
        <Text style={[MySaleStyle.normalFont, { borderBottomColor: 'rgba(0, 0, 0, .38)', borderBottomWidth: 1, textAlign: 'left' }]}>{selectedOrgUnit.OrgUnitDesc}</Text>
      </TouchableNativeFeedback>}
    {!isLoading &&
      //<MyActivityIndicator /> :
      <ModalFilterPicker
        visible={showModal}
        onSelect={onSelect}
        onCancel={onCancel}
        options={options}
        titleTextStyle={{ fontFamily: 'simpler-black-webfont', fontSize: 24, color: Colors.partnerColor }}
        optionTextStyle={{ fontFamily: 'simpler-regular-webfont', fontSize: 21, flex: 1, textAlign: 'left' }}
        title='בחירת מרכז'
        placeholderText='סינון...'
        cancelButtonText='ביטול'
        noResultsText='לא נמצאו התאמות'
        //autoFocus={true}
        cancelButtonStyle={MySaleStyle.smallButtonBackground}
        cancelButtonTextStyle={MySaleStyle.PartnerButtonText} />}
  </View>);
}
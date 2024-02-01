import React from 'react';
import { Platform, Text, Image, View, TouchableOpacity, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import LogoMySale from '../components/LogoMySale';
import CartIcon from '../components/CartIcon';
import MenuIcon from '../components/MenuIcon';
import Colors from '../constants/Colors';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import DrawerIcon from '../components/DrawerIcon';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import HomeScreen from '../screens/HomeScreen';
import SwitchUserScreen from '../screens/SwitchUserScreen';
import SearchDealsScreen from '../screens/SearchDealsScreen';
import DealsScreen from '../screens/DealsScreen';
import CartScreen from '../screens/CartScreen';
import SwitchOUScreen from '../screens/SwitchOUScreen';
import RefreshDataScreen from '../screens/RefreshDataScreen';
import LogoutScreen from '../screens/LogoutScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SearchProductsModalScreen from '../screens/SearchProductsModalScreen';
import BarcodeModalScreen from '../screens/BarcodeModalScreen';
import DealDetailsScreen from '../screens/DealDetailsScreen';
import CaspitOperationsScreen from '../screens/CaspitOperationsScreen';
import { useSelector } from 'react-redux';
import CouponsScreen from '../screens/CouponsScreen';

const VERSION = Constants.manifest.version;

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = () => <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="HomeScreen" component={HomeScreen} />
  <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
    options={{
      presentation: 'modal', headerShown: true, headerTitle: '',
      headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>פרטי מוצר</Text>
    }} />
  <Stack.Screen name="SearchProducts" component={SearchProductsModalScreen}
    options={{
      presentation: 'modal', headerShown: true, headerTitle: '',
      headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>חיפוש מוצרים</Text>
    }} />
  <Stack.Screen name="Barcode" component={BarcodeModalScreen} options={{
    presentation: 'modal', headerShown: true, headerTitle: '',
    headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>סריקת ברקוד</Text>
  }} />
</Stack.Navigator>;

const createDrawerLabel = (focused, label) => {
  let labelColor = focused ? Colors.drawerIconSelected : Colors.drawerIconDefault;
  return <Text style={{ color: labelColor, margin: 16, fontFamily: 'simpler-black-webfont' }}>{label}</Text>
};

const HomeOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'ראשי')
  ),
  drawerIcon: ({ focused }) => (
    <DrawerIcon
      focused={focused}
      name='md-home'
    />
  ),
};

const SwitchUserOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'החלפת עובד')
  ),
  drawerIcon: ({ focused }) => (
    <MCIcon
      color={focused ? Colors.drawerIconSelected : Colors.drawerIconDefault}
      name={'account-switch'}
      size={21}
    />
  ),
  headerShown: false
};

const CartStack = () => <Stack.Navigator initialRouteName="Cart" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Cart" component={CartScreen} />
  <Stack.Screen name="Coupons" component={CouponsScreen} />
  <Stack.Screen name="Payment" component={PaymentScreen} />
  <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
    options={{
      presentation: 'modal', headerShown: true, headerTitle: '',
      headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>פרטי מוצר</Text>
    }} />
  <Stack.Screen name="SearchProducts" component={SearchProductsModalScreen}
    options={{
      presentation: 'modal', headerShown: true, headerTitle: '',
      headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>חיפוש מוצרים</Text>
    }} />
</Stack.Navigator>;

const CartOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'סל הקניות')
  ),
  drawerIcon: ({ focused }) => (
    <Image source={require('../assets/images/cart.png')} style={{ width: 24, height: 24 }}
      tintColor={focused ? Colors.drawerIconSelected : Colors.drawerIconDefault} />
  ),
};

const SearchDealsStack = () => <Stack.Navigator initialRouteName="SearchDeals" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="SearchDeals" component={SearchDealsScreen} />
  <Stack.Screen name="Deals" component={DealsScreen} options={{
    presentation: 'modal', headerShown: true, headerTitle: ''
  }} />
  <Stack.Screen name="DealDetails" component={DealDetailsScreen} options={{
    presentation: 'modal', headerShown: true, headerTitle: ''
  }} />
</Stack.Navigator>;

const SearchDealsOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'חיפוש עסקאות')
  ),
  drawerIcon: ({ focused }) => (
    <DrawerIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-search${focused ? '' : '-outline'}`
          : 'md-search'
      }
    />
  ),
};

const SwitchOUOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'שיוך מכשיר למרכז')
  ),
  drawerIcon: ({ focused }) => (
    <MCIcon
      color={focused ? Colors.drawerIconSelected : Colors.drawerIconDefault}
      name={'store'}
      size={21}
    />
  ),
};

const LogoutOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'יציאה')
  ),
  drawerIcon: ({ focused }) => (
    <DrawerIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-exit${focused ? '' : '-outline'}`
          : 'md-exit'
      }
    />
  ),
  headerShown: false
};

const RefreshDataOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'רענון נתונים')
  ),
  drawerIcon: ({ focused }) => (
    <FAIcon
      color={focused ? Colors.drawerIconSelected : Colors.drawerIconDefault}
      focused={focused}
      name={'refresh'}
      size={20}
    />
  ),
  headerShown: false
};

const CaspitOperationsOptions = {
  drawerLabel: ({ focused }) => (
    createDrawerLabel(focused, 'כספיט')
  ),
  drawerIcon: ({ focused }) => (
    <DrawerIcon
      color={focused ? Colors.drawerIconSelected : Colors.drawerIconDefault}
      focused={focused}
      name={'settings'}
      size={20}
    />
  ),
};


function DrawerContent(props) {
  let currentHour = (new Date()).getHours();
  let dayTimeObject = {};

  if (currentHour >= 6 && currentHour < 12) {
    dayTimeObject.text = 'בוקר טוב, ';
    dayTimeObject.icon = 'white-balance-sunny';
  } else if (currentHour >= 12 && currentHour < 16) {
    dayTimeObject.text = 'צהריים טובים, '
    dayTimeObject.icon = 'white-balance-sunny';
  } else if (currentHour >= 16 && currentHour < 18) {
    dayTimeObject.text = 'אחה"צ טובים, '
    dayTimeObject.icon = 'weather-sunset';
  } else if (currentHour >= 18 && currentHour < 21) {
    dayTimeObject.text = 'ערב טוב, ';
    dayTimeObject.icon = 'weather-sunset';
  } else {
    dayTimeObject.text = 'לילה טוב, ';
    dayTimeObject.icon = 'weather-night';
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={{
          backgroundColor: Colors.partnerColor,
          height: 110,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          paddingTop: 20
        }}
      >
        <View style={{ flexDirection: 'row', paddingBottom: 5 }}>
          <MCIcon
            color={'white'}
            name={dayTimeObject.icon}
            size={21}
          />
          <Text style={{ color: 'white', fontSize: 22, paddingRight: 5, fontFamily: 'simpler-regular-webfont' }}>
            {dayTimeObject.text}{props.screenProps.firstName}
          </Text>
        </View>
        <Text style={{ color: 'white', fontSize: 17, paddingTop: 7, fontFamily: 'simpler-regular-webfont' }}>
          {props.screenProps.orgUnitDesc}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <View style={{ justifyContent: 'center', alignSelf: 'center', marginVertical: 10 }}>
        <Text style={{ fontSize: 15, fontFamily: 'simpler-regular-webfont' }}>
          v{VERSION}
        </Text>
      </View>
    </ScrollView>)
}

function MainDrawerNavigator() {
  const userDetails = useSelector(state => state.connectionDetailsReducer.userDetails);
  const orgUnitDetails = useSelector(state => state.connectionDetailsReducer.orgUnitDetails);
  const isDrawerDisabled = useSelector(state => state.cartReducer.isDrawerDisabled);

  const AppHeader = ({ navigation }) => {

    return {
      headerTitle: () => <LogoMySale />,
      headerRight: () => (
        !isDrawerDisabled && <CartIcon navigation={navigation} />
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => !isDrawerDisabled && navigation.openDrawer()}>
          <MenuIcon />
        </TouchableOpacity>
      ),
      headerTitleAlign: 'center',
      headerShadowVisible: true,
      drawerPosition: 'right',
      swipeEnabled: !isDrawerDisabled
    };
  };

  return <Drawer.Navigator initialRouteName="Home" screenOptions={AppHeader} drawerContent={(props) => <DrawerContent {...props}
    screenProps={{
      firstName: userDetails.FirstName,
      orgUnitDesc: orgUnitDetails && orgUnitDetails.OrgUnitDesc
    }} />}>
    <Drawer.Screen name="Home" component={HomeStack} options={HomeOptions} />
    <Drawer.Screen name="SwitchUser" component={SwitchUserScreen} options={SwitchUserOptions} />
    <Drawer.Screen name="Cart" component={CartStack} options={CartOptions} />
    <Drawer.Screen name="SearchDeals" component={SearchDealsStack} options={SearchDealsOptions} />
    {userDetails.IsAdmin && <Drawer.Screen name="SwitchOU" component={SwitchOUScreen} options={SwitchOUOptions} />}
    <Drawer.Screen name="RefreshData" component={RefreshDataScreen} options={RefreshDataOptions} />
    {userDetails.AllowEmvOperations && <Drawer.Screen name="CaspitOperations" component={CaspitOperationsScreen} options={CaspitOperationsOptions} />}
    <Drawer.Screen name="Logout" component={LogoutScreen} options={LogoutOptions} />
  </Drawer.Navigator>;
};

export default MainDrawerNavigator;

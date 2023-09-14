import React from 'react';
import MainDrawerNavigator from './MainDrawerNavigator';
import {AuthLoadingScreenConnectRedux} from '../screens/AuthLoadingScreen';
import SignInScreen from '../screens/SignInScreen';
import SwitchOUScreen from '../screens/SwitchOUScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthLoading" component={AuthLoadingScreenConnectRedux} />
    <Stack.Screen name="Auth" component={SignInScreen} />
    <Stack.Screen name="SwitchOU" component={SwitchOUScreen} />
  </Stack.Navigator>
}

const MainStack = () => <Stack.Navigator screenOptions={{
  headerShown: false
}}>
  <Stack.Screen name="Main" component={MainDrawerNavigator} />
</Stack.Navigator>;

function RootNavigation() {
  const isSignedIn = useSelector(state => state.connectionDetailsReducer.isSignedIn);

  return isSignedIn ? <MainStack /> : <AuthStack />;
}

export default RootNavigation;

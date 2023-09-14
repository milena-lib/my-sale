import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MenuIcon from '../components/MenuIcon';
import LogoMySale from '../components/LogoMySale';
import CartIcon from '../components/CartIcon';

export default class ImpersonationScreen extends React.Component {

  static navigationOptions = ({ navigation }) => { 
    return {
        drawerLabel: () => null,
        headerTitle: <LogoMySale />,
        headerRight: (
          <CartIcon navigation={navigation} />
        ),
        headerLeft: ( 
          <TouchableOpacity onPress={() => navigation.openDrawer() }>
            <MenuIcon/>
          </TouchableOpacity>
          ),
  };
};

  render() {
    return <View></View>;
  }
}

import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class MenuIcon extends React.Component {

  render() {
      return (
        <Ionicons size={30} style={{padding : 10}}
            name={
            Platform.OS === 'ios'
                ? 'ios-menu'
                : 'md-menu'
            }
      />
      );
  }
}
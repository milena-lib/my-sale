import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default class DrawerIcon extends React.Component {
  render() {
    return (
      <Ionicons
        name={this.props.name}
        size={26}
        //style={{ marginBottom: -3 }}
        color={this.props.focused ? Colors.drawerIconSelected : Colors.drawerIconDefault}
      />
    );
  }
}
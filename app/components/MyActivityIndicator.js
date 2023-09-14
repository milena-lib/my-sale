import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import Colors from '../constants/Colors';

export default class MyActivityIndicator extends React.Component {
  render() {
    return <View style={styles.container}>
      <ActivityIndicator size={this.props.size || "large"} color={Colors.partnerColor} />
      {this.props.message && <Text style={{ fontFamily: 'simpler-regular-webfont', fontSize: 17 }}>{this.props.message}</Text>}
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
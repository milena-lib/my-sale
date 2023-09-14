import React from 'react';
import { View, TextInput, Animated } from 'react-native';
import Colors from '../constants/Colors';

export default class FloatingLabelInput extends React.Component {
  state = {
    isFocused: false,
  };

  componentWillMount() {
    this._animatedIsFocused = new Animated.Value(this.props.value === '' ? 0 : 1);
  }

  handleFocus = () => {
    this.setState({ isFocused: true });
    if (typeof this.props.onFocus === "function") {
      this.props.onFocus();
    }
  };

  handleBlur = () => this.setState({ isFocused: false });

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
      toValue: (this.state.isFocused || this.props.value !== '') ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }

  render() {
    const { label, ...props } = this.props;
    const labelStyle = {
      position: 'absolute',
      left: 0,
      fontFamily: 'simpler-regular-webfont',
      top: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [17, 0],
      }),
      fontSize: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 14],
      }),
      color: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: ['#aaa', 'rgba(0, 0, 0, .38)'],
      }),
    };
    return (
      <View style={{ paddingTop: 18, marginLeft: 30, marginRight: 30, }}>
        <Animated.Text style={labelStyle}>
          {label}
        </Animated.Text>
        <TextInput
          {...props}
          style={{
            height: 26, fontSize: 17, color: '#000', borderBottomWidth: 1, marginTop: 1, fontFamily: 'simpler-regular-webfont',
            borderBottomColor: this.props.underlineColorAndroid || 'rgba(0, 0, 0, .38)'
          }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          blurOnSubmit
          underlineColorAndroid="transparent"
          selectionColor={Colors.partnerColor}
        />
      </View>
    );
  }
}
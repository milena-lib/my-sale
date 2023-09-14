import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import MySaleStyle from '../constants/Styles';
import Octicon from 'react-native-vector-icons/Octicons';

export default class Scale extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            arrColors: ['#00FFE5', '#00E5CE', '#00CCB7', '#00B2A0', '#009989', '#007F72'],
        };
    }

    componentDidMount() {
    }

    render() {
        var squares = [];
        for (let i = 1; i <= this.props.maxValue; i++) {
            let color = '#d5d5d5';
            if (i <= this.state.arrColors.length) {
                color = this.state.arrColors[i - 1];
            }
            squares.push(<View style={[styles.ButtonContainer]} key={i}>
                {i == this.props.selectedValue ?
                    <View>
                        <Octicon style={styles.IconStyle} name="triangle-down" size={20} color={color} />
                        <View style={[styles.ButtonBackground, { backgroundColor: color, borderWidth: 1, borderColor: '#c5c5c5', width: 35, height: 35 }]} >
                            <Text style={[{ fontSize: 18 }, MySaleStyle.bold]}>{i}</Text>
                        </View>
                    </View>
                    :
                    <View>
                        <View style={styles.NoArrowContainer}></View>
                        <View style={[styles.ButtonBackground, { backgroundColor: color, width: 25, height: 25 }]} >
                            <Text style={[MySaleStyle.bold]}>{i}</Text>
                        </View>
                    </View>
                }

            </View>)
        }
        return (
            <View style={[MySaleStyle.flex1, MySaleStyle.flexRow]}>
                {squares}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    ButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        //width: 35,
        //borderWidth: 1,
        flexDirection: 'column',
        // paddingRight: -25,
        // paddingLeft: -25,
        // padding: 0,
        // margin: 0
    },
    ButtonBackground: {
        // paddingRight: 1,
        // paddingLeft: 1,
        // paddingHorizontal: 5,
        // paddingVertical: 5,
        // height: 25,
        // width: 25,
        //width: moderateScale(300, 0.3),
        //width: scale(300),
        justifyContent: 'center',
        alignItems: 'center',
        //borderWidth: 1,
        marginTop: -5,
        // marginRight: -25,
        // marginLeft: -25
    },
    ButtonBackgoundDarkBlue: {
        backgroundColor: '#0b51c1',
    },
    ButtonBackgoundBlue: {
        backgroundColor: '#4286f4',
    },
    ButtonBackgoundGreen: {
        backgroundColor: '#32cd32',
    },
    ButtonBackgoundYellow: {
        backgroundColor: '#eeee00',
    },
    ButtonBackgoundOrange: {
        backgroundColor: '#ff6600',
    },
    ButtonBackgoundRed: {
        backgroundColor: '#eb1515',
    },
    ButtonText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#000',
        fontFamily: 'simpler-regular-webfont'
    },
    NoArrowContainer: {
        height: 20
    },
    IconStyle: {
        marginRight: 10
    }
});
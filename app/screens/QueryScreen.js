import React from 'react';
import { View, StyleSheet, Button, Text, AppRegistry, TextInput, Picker } from 'react-native';
import Api from '../api/api';
import MyActivityIndicator from '../components/MyActivityIndicator';

export default class QueryScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      orgUnits: [],
    };
  }

  async componentDidMount() {

  }

  searchDeals() {
    this.setState({ isLoading: true });
    Api.post('/SearchDeals', {}).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d && resp.d.IsSuccess) {
        this.setState({ orgUnits: resp.d.ListOrgUnit });
      } else {
        Alert.alert(resp.d.FriendlyMessage);
        console.log(resp.d.ErrorMessage);
      }
    }).catch((ex) => {
      this.setState({ isLoading: false });
      console.log(ex);
    });
  }

  render() {
    let orgUnitsItems = this.state.orgUnits.map((s, i) => {
      return <Picker.Item key={i} value={s.OrgUnitCode} label={s.OrgUnitDesc} />
    });

    return (
      <View style={styles.container}>
        {this.state.isLoading ?
          <MyActivityIndicator /> :
          <View style={styles.container}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>חיפוש עסקאות</Text>
            </View>
            <View style={styles.datesContainer}>
              <Text style={styles.title}>מתאריך</Text>
              <TextInput />
              <Text style={styles.title}>ועד</Text>
              <TextInput />
            </View>
            <View style={styles.paymentContainer}>
              <Text style={styles.title}>אמצעי תשלום</Text>
              <TextInput />
            </View>
            <View style={styles.textInputContainer}>
              <Text style={styles.title}>4 ספרות אחרונות</Text>
              <TextInput />
              <Text style={styles.title}>מק"ט</Text>
              <TextInput />
              <Text style={styles.title}>מספר חשבונית</Text>
              <TextInput />
            </View>
            <View style={styles.datesContainer}>
              <Text style={styles.title}>יחידה ארגונית</Text>
              <Picker
                selectedValue={this.state.currentOrgUnit}
                style={{ height: 50, width: 400 }}
                onValueChange={(itemValue, itemIndex) => this.setState({ selectedOrgUnit: itemValue })}>
                {orgUnitsItems}
              </Picker>
            </View>
            <View style={styles.footerContainer}>
              <Button title="חיפוש" color={Colors.partnerColor} onPress={this.searchDeals} />
            </View>
          </View>
        }
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
  },
  titleContainer: {

  },
  datesContainer: {

  },
  cartContpaymentContainerainer: {

  },
  footerContainer: {
    flexDirection: 'column',
  },
  rowText: {
    paddingRight: 10,
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  title: {
    fontSize: 26,
    paddingRight: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  space: {
    flexDirection: 'column',
    borderTopColor: '#fff',
    borderTopWidth: 20,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: 'simpler-black-webfont',
    paddingRight: 10
  }
});

AppRegistry.registerComponent('QueryScreen', () => QueryScreen);

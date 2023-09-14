import React from 'react';
import { AppRegistry, View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/Colors';
import MySaleStyle from '../constants/Styles';
import GlobalHelper from '../utils/globalHelper';
import ModalMessage from '../components/ModalMessage';

var pressedOnDeal = false;
export default class SearchDealsResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      globalMessage: ''
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      pressedOnDeal = false;
    });

    this._unsubscribe = this.props.navigation.addListener('blur', () => {
      if (!pressedOnDeal) {
        this.props.navigation.reset({
          index: 0,
          routes: [{ name: 'SearchDeals' }],
        });
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  onDealPress(item) {
    //Pushing this screen into the navigation stack in order to allow going back to it
    //this.props.navigation.push('DealDetails', { deal: item });
    pressedOnDeal = true;
    this.props.navigation.navigate('DealDetails', { deal: item });
  }

  renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => this.onDealPress(item)} key={index}>
        <View style={styles.container}>
          <View style={MySaleStyle.flex1}>
            <Text style={[MySaleStyle.margTop15, MySaleStyle.padRight10, MySaleStyle.textSubHeader, MySaleStyle.flex1,
            item.DealStatus === 'עסקה לא הושלמה' && { color: Colors.redColor }]}>מספר סל {item.DealId}</Text>
            {!!item.InvoiceNum && <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>חשבונית:</Text>
              <Text style={styles.rowText}>{item.InvoiceNum}</Text>
            </View>}
            <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>תאריך:</Text>
              <Text style={styles.rowText}>{item.PurchaseDate}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>סטאטוס:</Text>
              <Text style={styles.rowText}>{item.DealStatus}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>לקוח:</Text>
              <Text style={styles.rowText}>{item.BillingCustomerName}</Text>
            </View>
            <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>סכום כולל:</Text>
              <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(item.TotalAmount)} ש"ח</Text>
            </View>
            {!!item.TotalBlingAmount && <View style={MySaleStyle.flexRow}>
              <Text style={styles.rowText}>סכום בלינגים:</Text>
              <Text style={styles.rowText}>{GlobalHelper.formatNegativeNum(item.TotalBlingAmount)}</Text>
            </View>}
          </View>
          <MaterialIcon name="keyboard-arrow-left" size={40} color={Colors.partnerColor} />
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={[MySaleStyle.flex1, { backgroundColor: '#fff' }]}>
        {this.state.globalMessage != '' && <ModalMessage message={this.state.globalMessage} onClose={() => this.setState({ globalMessage: '' })} />}
        <FlatList style={MySaleStyle.flex1}
          data={this.props.dealsData}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps={'handled'}
          refreshing={this.state.refreshing}
          onRefresh={this.props.refreshDeals}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowText: {
    paddingRight: 10,
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    fontFamily: 'simpler-regular-webfont'
  },
});

AppRegistry.registerComponent('SearchDealsResults', () => SearchDealsResults);
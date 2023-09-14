import React from 'react';
import { AppRegistry, View, FlatList, Text, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import Api from '../api/api';
import MyActivityIndicator from '../components/MyActivityIndicator';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Consts from '../constants/Consts';
import Colors from '../constants/Colors';

export default class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      errorMessage: null,
      searchText: '',
      fullProductsList: [],
      filteredProducts: []
    };
  }

  componentDidMount() {
    this.fetchProducts(this.props.textToSearch);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.textToSearch.startsWith(this.state.searchText)) {
      this.setState({
        filteredProducts: this.state.fullProductsList.filter((p) => {
          return (p.Name && p.Name.toLowerCase().includes(nextProps.textToSearch.toLowerCase())) ||
            (p.CatalogNum && p.CatalogNum.toLowerCase().includes(nextProps.textToSearch.toLowerCase())) ||
            (p.HebDesc && p.HebDesc.toLowerCase().includes(nextProps.textToSearch.toLowerCase()))
        })
      });
    } else {
      this.fetchProducts(nextProps.textToSearch);
    }
  }

  fetchProducts(searchText) {
    this.setState({ isLoading: true, searchText: searchText });
    Api.post('/SearchProducts', { strSearchText: searchText }).then(resp => {
      this.setState({ isLoading: false });
      if (resp.d.IsSuccess) {
        this.setState({
          fullProductsList: resp.d.ListProducts,
          filteredProducts: resp.d.ListProducts.filter((p) => {
            return (p.Name && p.Name.toLowerCase().includes(this.props.textToSearch.toLowerCase())) ||
              (p.CatalogNum && p.CatalogNum.toLowerCase().includes(this.props.textToSearch.toLowerCase())) ||
              (p.HebDesc && p.HebDesc.toLowerCase().includes(this.props.textToSearch.toLowerCase()))
          })
        });
      } else {
        let msg = 'אירעה שגיאה בחיפוש מוצרים';
        if (resp.d.FriendlyMessage) {
          msg = resp.d.FriendlyMessage;
        } else if (resp.d.ErrorMessage) {
          msg = msg + ", " + resp.d.ErrorMessage;
        }

        ToastAndroid.show(Consts.globalErrorMessagePrefix + msg, ToastAndroid.SHORT);
      }
    });
  }

  renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.push('ProductDetails', { catalogNum: item.CatalogNum, fromCart: this.props.fromCart })}>
        <Text style={styles.productName}>{item.HebDesc}</Text>
        <View style={styles.lastRow}>
          <Text style={styles.rowText}>מק"ט: {item.CatalogNum}</Text>
          <MaterialIcon style={styles.rowIcon} name="keyboard-arrow-left" size={40} color={Colors.partnerColor} />
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoading ?
          <MyActivityIndicator /> :
          <View style={styles.listContainer}>
            <FlatList
              data={this.state.filteredProducts}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps={'handled'}
            />
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
    //alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    marginTop: 10
  },
  lastRow: {
    //flex: 1,
    //padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'simpler-black-webfont',
    paddingRight: 10,
    paddingLeft: 10,
    textAlign: 'left',
  },
  rowText: {
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 16,
    fontFamily: 'simpler-regular-webfont'
  },
  rowIcon: {

  },
});

AppRegistry.registerComponent('Products', () => Products);

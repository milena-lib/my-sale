import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import Products from '../components/Products';
import Colors from '../constants/Colors';

export default class SearchProductsModalScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showBarcode: false,
      textToSearch: '',
      numOfItems: 0
    };
  }

  searchItems = (textToSearch) => {
    this.setState({ textToSearch });
  }

  render() {
    const { fromCart } = this.props.route.params ?? {};

    return (
      <View style={styles.container}>
        <View style={styles.searchSection} >
          <TextInput underlineColorAndroid="transparent" style={styles.searchTextbox}
            placeholder="  חיפוש..."
            onChangeText={this.searchItems}
            inlineImageLeft=""
            selectionColor={Colors.partnerColor}
            autoFocus={true} />
        </View>
        <View style={styles.hr} />
        {this.state.textToSearch.length > 1 ?
          <View style={styles.resultsContainer}>
            <Products textToSearch={this.state.textToSearch} navigation={this.props.navigation} fromCart={fromCart} />
          </View>
          : null}
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  underHeaderSection: {
    //flex: 1,
    flexDirection: 'column',
  },
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#fff',
  },
  cameraContainer: {
    flexDirection: 'column',
    //justifyContent: 'center',
    //alignItems: 'center',
    flex: 1
    //backgroundColor: '#fff',
  },
  resultsContainer: {
    flexDirection: 'column',
    flex: 1
  },
  searchTextbox: {
    flex: 1,
    height: 60,
    fontSize: 16,
    marginLeft: 5,
    backgroundColor: '#fff',
    fontFamily: 'simpler-regular-webfont'
  },
  barcodeIcon: {
    padding: 10
  },
  preview: {
    //flex: 1,
  },
  hr: {
    flexDirection: 'column',
    //flex: 1,
    borderTopColor: '#8E8E8E',
    borderTopWidth: 1,
  },
  closeBarcodeBtn: {
    color: "#000",
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import CustomerDetailsModal from '../components/CustomerDetails';
import MySaleStyle from '../constants/Styles';

import Colors from '../constants/Colors';

export class UserDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showCustomerDetails: false,
    };
  }

  openCustomerModal() {
    this.setState({ showCustomerDetails: true });
  }

  customerDetailsModalCallback = () => {
    this.props.navigation.navigate('Home');
  }

  render() {
    return <View style={styles.container}>
      <Text style={styles.userDetailsText}>{this.props.userDetails.FirstName} {this.props.userDetails.LastName}</Text>
      <Text style={styles.userDetailsText}>|</Text>
      {this.props.customer ?
        <TouchableOpacity style={MySaleStyle.flexRow} onPress={() => this.openCustomerModal()}>
          <Text style={[styles.userDetailsTextLinkLabel, MySaleStyle.flexRow]}>לקוח:</Text>
          <Text style={[styles.userDetailsText, MySaleStyle.flexRow, MySaleStyle.textUnderline]}>{this.props.customer.CustomerName}</Text>
        </TouchableOpacity>
        :
        <Text style={styles.userDetailsText}>לקוח מזדמן</Text>
      }
      {this.state.showCustomerDetails &&
        <CustomerDetailsModal
          customerDetailsModalCallback={this.customerDetailsModalCallback}
          closeCustomerModal={() => this.setState({ showCustomerDetails: false })}
          custToView={this.props.customer}
        />
      }
    </View>
      ;
  }
}

function mapStateToProps(state, props) {
  return {
    userDetails: state.connectionDetailsReducer.userDetails,
    orgUnitDetails: state.connectionDetailsReducer.orgUnitDetails,
    customer: state.connectionDetailsReducer.customer
  }
}

export default connect(mapStateToProps, null)(UserDetails);

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.partnerColor,
  },
  userDetailsText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    padding: 10,
    fontFamily: 'simpler-regular-webfont'
  },
  userDetailsTextLinkLabel: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'right',
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    fontFamily: 'simpler-regular-webfont'
  },
  userDetailsTextLink: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'right',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 0,
    fontFamily: 'simpler-regular-webfont'
  },
  pipeText: {
    color: 'white'
  },
  organizationUnitText: {
    color: 'white'
  },
});
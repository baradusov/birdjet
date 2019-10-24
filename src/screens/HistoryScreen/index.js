import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { Snackbar } from 'react-native-paper';
import format from 'date-fns/format';
import { ru } from 'date-fns/locale';

import {
  getTransactions,
  paginateTransactions,
  getErrorMessage
} from '../../api';

class HistoryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      outcome: '',
      transactions: [],
      todaysBalance: 0,
      totalBalance: 0,
      lastVisible: 15,
      showSnackbar: false,
      snackbarDuration: 1500,
      refreshing: false
    };
  }

  static navigationOptions = {
    title: 'История'
  };

  getTransactions = async () => {
    this.setState({ refreshing: true });
    try {
      const data = await getTransactions(15);

      this.setState({ transactions: data, refreshing: false });
    } catch (error) {
      console.log(error);
      this.showMessage(error.code, 3000, true);
    }
  };

  paginateTransactions = async () => {
    try {
      const lastIndex = this.state.transactions[
        this.state.transactions.length - 1
      ];

      const lastVisible = this.state.transactions.length
        ? lastIndex.timestamp
        : this.state.transactions[15];
      const transactions = await paginateTransactions(15, lastVisible);

      if (transactions.length) {
        console.log(transactions);
        this.setState({
          transactions: [...this.state.transactions, ...transactions]
        });
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      this.showMessage(error.code, 3000, true);
    }
  };

  renderTransaction = ({ item }) => {
    return (
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 16 }}>{item.comment}</Text>
        <Text style={{ fontSize: 20 }}>{item.outcome} руб.</Text>
        <Text style={{ fontSize: 16 }}>
          {(() => {
            const date = new Date(item.timestamp);
            return format(date, 'p, cccc, d MMMM', { locale: ru });
          })()}
        </Text>
      </View>
    );
  };

  showMessage = (message, duration = 1500, error) => {
    this.setState({
      refreshing: false,
      showSnackbar: true,
      snackbarDuration: duration,
      snackbarMessage: error ? `${getErrorMessage(message)}` : message
    });
  };

  componentDidMount = async () => {
    const { navigation } = this.props;

    this.focusListener = navigation.addListener('didFocus', async () => {
      await this.getTransactions();
    });
  };

  componentWillUnmount() {
    this.focusListener.remove();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.transactions}
          keyExtractor={item => item.timestamp.toString()}
          renderItem={this.renderTransaction}
          onEndReached={this.paginateTransactions}
          onRefresh={this.getTransactions}
          refreshing={this.state.refreshing}
        />
        <Snackbar
          visible={this.state.showSnackbar}
          duration={this.state.snackbarDuration}
          onDismiss={() => this.setState({ showSnackbar: false })}
        >
          {this.state.snackbarMessage}
        </Snackbar>
      </View>
    );
  }
}

export default HistoryScreen;

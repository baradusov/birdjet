import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { Snackbar } from 'react-native-paper';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import endOfMonth from 'date-fns/endOfMonth';
import { ru } from 'date-fns/locale';

import {
  addTransaction,
  getAccountData,
  updateBalances,
  getErrorMessage
} from '../../api';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      comment: '',
      outcome: '',
      transactions: [],
      todaysBalance: 0,
      tempTodaysBalance: 0,
      totalBalance: 0,
      tempTotalBalance: 0,
      lastVisible: 15,
      showSnackbar: false,
      snackbarDuration: 1500,
      refreshing: false
    };
  }

  static navigationOptions = {
    title: 'Бюджет'
  };

  addTransaction = async () => {
    const { comment, outcome } = this.state;

    if (outcome !== '') {
      this.setState({
        comment: '',
        outcome: ''
      });

      try {
        const newTransaction = await addTransaction(comment, outcome);

        await updateBalances(outcome);

        this.showMessage('Потрачено 💸');
        console.log('Трата добавлена: ', newTransaction);
      } catch (error) {
        console.log('Не удалось добавить трату: ', error);

        this.showMessage(error.code, 3000, true);
      }
    }
  };

  getBalance = async () => {
    this.setState({ refreshing: true });

    try {
      const { todaysBalance, totalBalance } = await getAccountData();

      this.setState({
        todaysBalance,
        tempTodaysBalance: todaysBalance,
        totalBalance,
        tempTotalBalance: totalBalance,
        refreshing: false
      });
    } catch (error) {
      console.log('getBalance: ', error);
      this.showMessage(error.code, 3000, true);
    }
  };

  focusNextInput = () => {
    this.textInput.current.focus();
  };

  onChangeOutcome = outcome => {
    const { tempTodaysBalance, tempTotalBalance } = this.state;

    this.setState({
      outcome,
      todaysBalance: tempTodaysBalance - outcome,
      totalBalance: tempTotalBalance - outcome
    });
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

    await this.getBalance();
    this.focusListener = navigation.addListener('didFocus', this.getBalance);
  };

  componentWillUnmount() {
    this.focusListener.remove();
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.getBalance}
            />
          }
        >
          <View style={styles.container}>
            <TextInput
              placeholder="На что"
              keyboardType="default"
              style={styles.input}
              value={this.state.comment}
              onChangeText={comment => {
                this.setState({ comment });
              }}
              onSubmitEditing={() => {
                this.focusNextInput();
              }}
            />
            <TextInput
              blurOnSubmit={true}
              placeholder="Сколько"
              keyboardType="numeric"
              style={styles.input}
              value={this.state.outcome}
              onChangeText={this.onChangeOutcome}
              onSubmitEditing={() => {
                this.addTransaction();
              }}
              ref={this.textInput}
            />
          </View>
          <View style={{ padding: 10 }}>
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 18 }}>
                <Text
                  style={[
                    this.state.todaysBalance < 0
                      ? { color: 'red' }
                      : { color: 'black' },
                    { fontSize: 40, fontWeight: 'bold' }
                  ]}
                >
                  {Math.round(this.state.todaysBalance)}
                </Text>{' '}
                руб.
              </Text>
              <Text style={{ fontSize: 18 }}>на сегодня</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18 }}>
                <Text
                  style={[
                    this.state.totalBalance < 0
                      ? { color: 'red' }
                      : { color: 'black' },
                    { fontSize: 20 }
                  ]}
                >
                  {Math.round(this.state.totalBalance)}
                </Text>{' '}
                руб.
              </Text>
              <Text style={{ fontSize: 18 }}>
                на{' '}
                {`${formatDistanceToNow(endOfMonth(new Date()), {
                  locale: ru
                })}`}
              </Text>
            </View>
          </View>
          <Snackbar
            visible={this.state.showSnackbar}
            duration={this.state.snackbarDuration}
            onDismiss={() => this.setState({ showSnackbar: false })}
          >
            {this.state.snackbarMessage}
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    marginBottom: 10,
    fontSize: 32
  }
});

export default HomeScreen;

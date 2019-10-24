import React from 'react';
import {
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  YellowBox,
  ToastAndroid,
  Text
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import styles from './styles';

import { addAccountData, getAccountData, getErrorMessage } from '../../api';

YellowBox.ignoreWarnings(['Setting a timer']);

class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budget: '',
      showSnackbar: false,
      snackbarDuration: 1500,
      refreshing: false
    };
  }

  static navigationOptions = {
    title: 'Настройки'
  };

  addAccountData = async () => {
    const { budget } = this.state;

    try {
      if (budget !== '') {
        const { budget: newBudget } = await addAccountData(budget);

        this.setState({ budget: newBudget });
        ToastAndroid.show('Новый бюджет установлен', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Не удалось установить новый бюджет', error);
      this.showMessage(error.code, 3000, true);
    }
  };

  getAccountData = async () => {
    try {
      const { budget } = await getAccountData();

      this.setState({ budget: String(budget) });
    } catch (error) {
      console.log(error);
      this.showMessage(error.code, 3000, true);
    }
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
    await this.getAccountData();
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text>Бюджет на месяц</Text>
          <TextInput
            placeholder="Бюджет на месяц"
            keyboardType="numeric"
            style={styles.input}
            value={this.state.budget}
            defaultValue={this.state.budget}
            onChangeText={budget => {
              this.setState({ budget });
            }}
            onSubmitEditing={this.addAccountData}
          />
          <Text>
            {(this.state.budget / getDaysInMonth(Date.now())).toFixed(0)} в день
          </Text>
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

export default SettingsScreen;

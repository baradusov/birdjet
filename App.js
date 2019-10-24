import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import TopTabNavigator from './src/navigation/TopTabNavigator';
import StatusBarCustom from './src/components/StatusBarCustom';
import { recalcTodaysBalance } from './src/api';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false
    };
  }
  
  componentDidMount = async () => {
    await recalcTodaysBalance();
  }

  render() {
    return (
      <PaperProvider>
        <StatusBarCustom />
        <TopTabNavigator />
      </PaperProvider>
    );
  }
}

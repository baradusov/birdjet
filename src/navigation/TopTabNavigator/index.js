import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import HomeScreen from '../../screens/HomeScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import SettingsScreen from '../../screens/SettingsScreen';

const TopTabNavigator = createMaterialTopTabNavigator(
  {
    Home: HomeScreen,
    History: HistoryScreen,
    Settings: SettingsScreen
  },
  {
    tabBarOptions: {
      indicatorStyle: {
        backgroundColor: 'white'
      },
      style: {
        backgroundColor: 'black'
      }
    }
  }
);

export default createAppContainer(TopTabNavigator);

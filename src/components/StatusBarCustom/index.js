import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
// import Constants from 'expo-constants';

const StatusBarCustom = props => {
  return (
    <View style={styles.statusBar}>
      <StatusBar {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    // height: Constants.statusBarHeight,
    backgroundColor: 'black'
  }
});

export default StatusBarCustom;

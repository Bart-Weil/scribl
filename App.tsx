import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { Drawing } from './src/screens/drawing/Drawing';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  useFonts,
  KaiseiTokumin_400Regular,
  KaiseiTokumin_500Medium,
  KaiseiTokumin_700Bold,
  KaiseiTokumin_800ExtraBold,
} from '@expo-google-fonts/kaisei-tokumin';

const App = () => {

  let [fontsLoaded] = useFonts({
    KaiseiTokumin_400Regular,
    KaiseiTokumin_500Medium,
    KaiseiTokumin_700Bold,
    KaiseiTokumin_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <GestureHandlerRootView style={{flex: 1}}>
          <Drawing />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,

  },
  root: {
    flex: 1,
    backgroundColor: '#252422',
  }
});

export default App;

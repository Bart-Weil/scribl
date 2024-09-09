import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import { Canvas, Rect, Path } from '@shopify/react-native-skia';
import { CursorAlternating } from './src/cursor-alternating';

const App = () => {
  const cursor = { x: 50, y: 50 }; // Example cursor position
  const cursorFill = 'blue'; // Example color
  const paths = []; // Example paths

  return (
    <GestureHandlerRootView style={styles.root}>
      <CursorAlternating />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;

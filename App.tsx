import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Toolbar } from './src/screens/drawing/Toolbar';
import { ScriblCanvas } from './src/screens/drawing/ScriblCanvas';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  const cursor = { x: 50, y: 50 }; // Example cursor position
  const cursorFill = 'blue'; // Example color
  const paths = []; // Example paths

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScriblCanvas />
      <Toolbar />
    </GestureHandlerRootView>
  );
};

export default App;

import React, {
  useRef,
  Children,
} from "react";

import {
  Dimensions,
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import {
  ToolProps,
  ToolbarButtonProps,
} from "../../../common/types"

var Victor = require('victor');

export const ToolbarButton = ({onPress, isSelected, iconName}: ToolbarButtonProps) => {
  return (
    <Pressable onPress={onPress}
               style={({ pressed }) => [pressed || isSelected ? styles.buttonPressed : styles.buttonUnpressed]}
    >
      <View style={styles.button}>
        <FontAwesome6 name={iconName} size={24} color="#252422" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#FFD100',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonUnpressed: {
    backgroundColor: '#ACA8A1',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

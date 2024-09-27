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

var Victor = require('victor');

export const BaseHeaderButton = ({}) => {
  
  return (
    <Pressable onPress = {()=>{styles.baseHeaderButton.borderColor = "#403D39"}}>
      <View style={styles.baseHeaderButton}>

      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseHeaderButton: {
    backgroundColor: '#252422',
    borderColor: "#EDDDDD",
    borderWidth: 3,
    borderRadius: 25,
    width: 50,
    height: 50,
    }
  },
);

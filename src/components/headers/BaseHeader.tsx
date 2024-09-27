import React, {
  useRef,
} from "react";

import {
  Dimensions,
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  BaseHeaderButton,
} from "../buttons/BaseHeader/BaseHeaderButton"

var Victor = require('victor');

export const BaseHeader = () => {
  
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Scribl</Text>
      <View style={styles.baseHeaderButtons}>
        <BaseHeaderButton/>
        <BaseHeaderButton/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: "#FFD100",
    fontFamily: "KaiseiTokumin_800ExtraBold",
    fontSize: 30,
  },
  baseHeaderButtons: {
    columnGap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',  },
  header: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#252422',
    justifyContent: 'space-between',
    padding: 10,
    }
});

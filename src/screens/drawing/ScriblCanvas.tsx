import {
  Skia,
  Canvas,
  rrect,
  rect,
  DiffRect,
  Path,
  Group,
  CornerPathEffect,
  Paint,
  StrokeCap,
  RoundedRect,
  Matrix4,
} from "@shopify/react-native-skia";

import React, { useState, useRef, Children, memo } from "react";

import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from "react-native";
import { ScriblCanvasProps, StaticPathsProps } from "../../common/types";

export const ScriblCanvas: React.FC<ScriblCanvasProps> = ({activePath, paths, children, contentTransformMatrix}) => {
  return (
    <View style={[style.canvasWrapper]}>
      <Canvas style={[style.skiaCanvas]}>
        <Group transform={[{ matrix: contentTransformMatrix}]}>
          <MemoStaticPaths paths={paths} />
          <Path
            path={activePath.path}
            paint={activePath.paint}
          />
          </Group>
          {children}
      </Canvas>
    </View>
  );
};

const MemoStaticPaths: React.FC<StaticPathsProps> = memo(function StaticPaths({paths}) {
  return (
    <Group>
      {paths.map((path, index) => (
        <Path
          key={index}
          path={path.path}
          paint={path.paint}
        />
      ))}
    </Group>
  );
});

const style = StyleSheet.create({
  canvasWrapper: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EDDDDD",
    borderRadius: 10,
  },
  skiaCanvas: {
    borderWidth: 0,
    borderColor: '#252422',
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: 'hidden',
  },
  border: {
    backgroundColor: '#252422',
  }
});

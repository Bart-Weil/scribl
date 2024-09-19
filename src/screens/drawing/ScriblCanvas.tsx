import {
  Canvas,
  Rect,
  Path,
  SkPath,
  Skia,
  Group,
  vec,
} from "@shopify/react-native-skia";

import React, { useState, useRef } from "react";

import { StyleSheet, View, Text, Dimensions } from "react-native";

import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  PinchGestureChangeEventPayload,
  PinchGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import {
  CursorAlternating,
} from "./cursors/CursorAlternating"

import {
  scaleMatrix,
  applyScaleToScale,
  applyInverseScale,
} from "./MatrixHelpers";

var Victor = require('victor');

const sideLength = 80;
const strokeDelay = 450;

export const ScriblCanvas = () => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const [paths, setPaths] = useState<SkPath[]>([]);
  const [cursor, setCursor] = useState(vec(0, 0));

  const [isDrawing, setIsDrawing] = useState(false);
  // where the cursor was last placed in place mode
  const placedCursor = useRef(vec(0, 0));
  // where the cursor was when drawing started
  const cursorStart = useRef(vec(0, 0));

  // id matrix
  const [zoomMatrix, setZoomMatrix] = useState(scaleMatrix(1, vec(width/2, height/2)));
  const pivot = useRef(vec(width/2, width/2));

  const prevScale = useRef(1);

  const onZoomStart = (event: GestureStateChangeEvent<PinchGestureHandlerEventPayload>) => {
    console.log("zoom start");
    pivot.current = vec(event.focalX, event.focalY);
    setZoomMatrix(applyScaleToScale(zoomMatrix, scaleMatrix(1, pivot.current)));
    prevScale.current = 1;
  }

  const onZoomChange = (event: GestureUpdateEvent<PinchGestureHandlerEventPayload & PinchGestureChangeEventPayload>) => {
    const factor = event.scale / prevScale.current;
    setZoomMatrix(applyScaleToScale(zoomMatrix, scaleMatrix(factor, pivot.current)));
    prevScale.current = event.scale;
  }

  const zoom = Gesture.Pinch()
    .onStart(onZoomStart)
    .onChange(onZoomChange);
    
  return (
    <View style={style.tapArea}>
        <GestureDetector gesture={zoom}>
          <CursorAlternating isDrawing={isDrawing}
                              setIsDrawing={setIsDrawing}
                              paths={paths}
                              setPaths={setPaths}
                              cursor={cursor}
                              setCursor={setCursor}
                              cursorToCanvas={(pos: any) => applyInverseScale(zoomMatrix, pos)}>
            <Canvas style={style.container}>
              <Rect x={cursor.x} y={cursor.y} width={50} height={50} color={isDrawing ? "green" : "red"} />
                <Group transform={
                  [{
                    matrix: zoomMatrix
                  }]
                }>
                {paths.map((path, index) => (
                  <Path
                    key={index}
                    path={path}
                    color={"black"}
                    style={"stroke"}
                    strokeWidth={2}
                  />
                ))}
                </Group>
            </Canvas>
          </CursorAlternating>
        </GestureDetector>
    </View>
  );
};

const style = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    width: '100%',
    height: '100%',
  },
  container: {
    width: '100%',
    height: '100%',
  },
});

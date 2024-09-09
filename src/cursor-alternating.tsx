import {
  Canvas,
  Rect,
  Path,
  SkPath,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import React, { useState, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
} from "react-native-gesture-handler";
var Victor = require('victor');

const sideLength = 80;
const strokeDelay = 450;

export const CursorAlternating = () => {
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [cursor, setCursor] = useState(vec(0, 0));

  const [isDrawing, setIsDrawing] = useState(false);
  // where the cursor was last placed in place mode
  const placedCursor = useRef(vec(0, 0));
  // where the cursor was when drawing started
  const cursorStart = useRef(vec(0, 0));

  const onDrawingStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    setPaths((old) => {
      const cursorPos = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
      // check if pan started on the cursor
      if (!isDrawing || Victor.fromObject(event).subtract(placedCursor.current).length() > sideLength) {
        setIsDrawing(false);
        setCursor(cursorPos);
        return old
      } else {
        cursorStart.current = cursorPos;
        const newPath = Skia.Path.Make();
        const strokeStart = Victor.fromObject(placedCursor.current)
          .add(cursorPos)
          .subtract(Victor.fromObject(cursorStart.current));
        newPath.moveTo(strokeStart.x, strokeStart.y);
        return [...old, newPath];
      }
    });
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    setPaths((currentPaths) => {
      var cursorPos = Victor.fromObject(event)
        .subtract(vec(sideLength/2, sideLength/2))
      if (isDrawing) {  
        cursorPos = cursorPos.add(Victor.fromObject(placedCursor.current))
          .subtract(Victor.fromObject(cursorStart.current));
        setCursor(cursorPos); 
        const currentPath = currentPaths[currentPaths.length - 1];
        const lastPoint = currentPath.getLastPt();
        const midPoint = Victor.fromObject(lastPoint)
        .add(cursorPos)
        .divide(Victor(2, 2));

        currentPath.quadTo(midPoint.x, midPoint.y, cursorPos.x, cursorPos.y);
        return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
      }
      setCursor(cursorPos);
      return currentPaths;
    });
  };

  const onDrawingEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    placedCursor.current = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
    setIsDrawing(!isDrawing);
  };

  const draw = Gesture.Pan()
    .minDistance(0)
    .activeOffsetX(0)
    .activeOffsetY(0)
    .maxPointers(1)
    .onBegin(onDrawingStart)
    .onChange(onDrawingActive)
    .onEnd(onDrawingEnd);

  const zoom = Gesture.Pinch().onStart(() => console.log("start")).onChange(() => console.log("change")).onEnd(() => console.log("end"));
  
  return (
    <View style={style.tapArea}>
        <GestureDetector gesture={Gesture.Simultaneous(draw, zoom)}>
          <Canvas style={style.container}>
            <Rect x={cursor.x} y={cursor.y} width={50} height={50} color={isDrawing ? "green" : "red"} />
            {paths.map((path, index) => (
              <Path
                key={index}
                path={path}
                color={"black"}
                style={"stroke"}
                strokeWidth={2}
              />
            ))}
          </Canvas>
        </GestureDetector>
    </View>
  );
};

const style = StyleSheet.create({
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
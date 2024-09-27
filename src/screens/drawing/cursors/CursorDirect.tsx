import {
  Skia,
  vec,
} from "@shopify/react-native-skia";

import React, {
  memo,
  useRef,
} from "react";

import {
  Dimensions,
} from "react-native";

import {
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
} from "react-native-gesture-handler";

import {
  CursorHandlerProps
} from "../../../common/types"

var Victor = require('victor');

export const CursorDirect: React.FC<CursorHandlerProps> = (
  {pen,
   isDrawing, setIsDrawing,
   paths, setPaths,
   cursor, setCursor,
   redoStack, setRedoStack,
   cursorToCanvas,
   children,
  }) => {

  const sideLength = 80;

  const onDrawingStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    setPaths((old) => {
      const eventPosVec = Victor.fromObject({x: event.x, y: event.y})
      setCursor(eventPosVec);
      const inverseStrokeStart = cursorToCanvas(Victor.fromObject({x: event.x, y: event.y}));
      pen.penDown(old, inverseStrokeStart)
      setRedoStack([]);
      return [...old];
    });
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    setPaths((currentPaths) => {
      const eventPosVec = Victor.fromObject({x: event.x, y: event.y})
      setCursor(eventPosVec);
      const currentPath = currentPaths[currentPaths.length - 1];
      pen.penMove(currentPath, cursorToCanvas(eventPosVec));
      return [...currentPaths];
    });
  };

  const drawGesture = Gesture.Pan()
    .minDistance(0)
    .activeOffsetX(0)
    .activeOffsetY(0)
    .maxPointers(1)
    .onBegin(onDrawingStart)
    .onChange(onDrawingActive);
    
  return (
      <GestureDetector gesture={drawGesture}>
        {children}
      </GestureDetector>
  );
};

export default memo(CursorDirect, (prevProps, nextProps) => {
  return prevProps.pen === nextProps.pen &&
         prevProps.isDrawing === nextProps.isDrawing;
});
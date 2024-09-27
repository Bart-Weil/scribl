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
   activePath, setActivePath,
   cursor, setCursor,
   redoStack, setRedoStack,
   cursorToCanvas,
   children,
  }) => {

  const sideLength = 80;

  const onDrawingStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    const inverseStrokeStart = cursorToCanvas(Victor.fromObject(event));
    setPaths((old) => [...old, activePath]);
    setActivePath(pen.penDown(inverseStrokeStart));
    setRedoStack([]);
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    setActivePath((old) => {
      const touchPos = Victor.fromObject(event);
      setCursor(touchPos); 
      pen.penMove(old, cursorToCanvas(touchPos));
      return {path: old.path, paint: old.paint};

    });
  };

  const drawGesture = Gesture.Pan()
    .minDistance(0)
    .activeOffsetX(0)
    .activeOffsetY(0)
    .maxPointers(1)
    .onStart(onDrawingStart)
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
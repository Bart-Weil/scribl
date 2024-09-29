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
  {drawingState,
   setDrawingState,
   cursorToCanvas,
   children,
  }) => {

  const sideLength = 80;

  const onDrawingStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    const inverseStrokeStart = cursorToCanvas(Victor.fromObject(event));
    setDrawingState({type: 'setPaths', payload: [...drawingState.paths, drawingState.activePath]});
    setDrawingState({type: 'setActivePath', payload: drawingState.currentPen.penDown(inverseStrokeStart)});
    setDrawingState({type: 'setRedoStack', payload: []});
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    const touchPos = Victor.fromObject(event);
    setDrawingState({type: 'setCursor', payload: touchPos});
    drawingState.currentPen.penMove(drawingState.activePath, cursorToCanvas(touchPos));
    return {path: drawingState.activePath.path, paint: drawingState.activePath.paint};
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
  return prevProps.drawingState.currentPen === nextProps.drawingState.currentPen &&
         prevProps.drawingState.isDrawing === nextProps.drawingState.isDrawing;
});
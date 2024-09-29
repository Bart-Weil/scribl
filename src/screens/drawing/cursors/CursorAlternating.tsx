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

import {
  hitTest,
} from "./Hitbox"

var Victor = require('victor');

export const CursorAlternating: React.FC<CursorHandlerProps> = (
  {drawingState,
   setDrawingState,
   cursorToCanvas,
   children,
  }) => {

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  // where the cursor was last placed in place mode
  const placedCursor = useRef(vec(0, 0));
  // where the cursor was when drawing started
  const cursorStart = useRef(vec(0, 0));

  const sideLength = 80;

  const onDrawingStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    var cursorPos = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
    // check if pan started on the cursor
    console.log("tap: ", event.x, event.y, "cursor: ", cursorPos.x, cursorPos.y)
    if (!drawingState.isDrawing || !hitTest({x: event.x, y: event.y}, {x: placedCursor.current.x, y: placedCursor.current.y, width: sideLength, height: sideLength})) {
      console.log("not drawing")
      setDrawingState({type: 'setIsDrawing', payload: false});
      setDrawingState({type: 'setCursor', payload: cursorPos});
    } else {
      cursorStart.current = cursorPos;
      const strokeStart = Victor.fromObject(placedCursor.current)
        .add(cursorPos)
        .subtract(Victor.fromObject(cursorStart.current));
      const inverseStrokeStart = cursorToCanvas(strokeStart);
      setDrawingState({type: 'setPaths', payload: [...drawingState.paths, drawingState.activePath]});
      setDrawingState({type: 'setActivePath', payload: drawingState.currentPen.penDown(inverseStrokeStart)});
      setDrawingState({type: 'setRedoStack', payload: []});
    }
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    var cursorPos = Victor.fromObject(event)
      .subtract(vec(sideLength/2, sideLength/2))
    if (drawingState.isDrawing) {  
      cursorPos = cursorPos.add(Victor.fromObject(placedCursor.current))
        .subtract(Victor.fromObject(cursorStart.current));
      setDrawingState({type: 'setCursor', payload: cursorPos});
      drawingState.currentPen.penMove(drawingState.activePath, cursorToCanvas(cursorPos));
      setDrawingState({type: 'setActivePath', payload: {path: drawingState.activePath.path, paint: drawingState.activePath.paint}});
    } else {
      setDrawingState({type: 'setCursor', payload: cursorPos});
    }
  };

  const onDrawingEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    placedCursor.current = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
    setDrawingState({type: 'setIsDrawing', payload: !drawingState.isDrawing});
  };

  const drawGesture = Gesture.Pan()
    .minDistance(0)
    .activeOffsetX(0)
    .activeOffsetY(0)
    .maxPointers(1)
    .onStart(onDrawingStart)
    .onChange(onDrawingActive)
    .onEnd(onDrawingEnd);
    
  return (
      <GestureDetector gesture={drawGesture}>
        {children}
      </GestureDetector>
  );
};

export default memo(CursorAlternating, (prevProps, nextProps) => {
  return prevProps.drawingState.currentPen === nextProps.drawingState.currentPen &&
         prevProps.drawingState.isDrawing === nextProps.drawingState.isDrawing;
});
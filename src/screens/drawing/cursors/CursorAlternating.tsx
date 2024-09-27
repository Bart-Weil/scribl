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
  {pen,
   isDrawing, setIsDrawing,
   activePath, setActivePath,
   paths, setPaths,
   cursor, setCursor,
   redoStack, setRedoStack,
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
    if (!isDrawing || !hitTest({x: event.x, y: event.y}, {x: placedCursor.current.x, y: placedCursor.current.y, width: sideLength, height: sideLength})) {
      setIsDrawing(false);
      setCursor(cursorPos);
    } else {
      cursorStart.current = cursorPos;
      const strokeStart = Victor.fromObject(placedCursor.current)
        .add(cursorPos)
        .subtract(Victor.fromObject(cursorStart.current));
      const inverseStrokeStart = cursorToCanvas(strokeStart);
      setPaths((old) => [...old, activePath]);
      setActivePath(pen.penDown(inverseStrokeStart));
      setRedoStack([]);
    }
  };

  const onDrawingActive = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
    setActivePath((old) => {
      var cursorPos = Victor.fromObject(event)
        .subtract(vec(sideLength/2, sideLength/2))
      if (isDrawing) {  
        cursorPos = cursorPos.add(Victor.fromObject(placedCursor.current))
          .subtract(Victor.fromObject(cursorStart.current));
        setCursor(cursorPos); 
        pen.penMove(old, cursorToCanvas(cursorPos))
        return {path: old.path, paint: old.paint};
      }
      setCursor(cursorPos);
      return old;
    });
  };

  const onDrawingEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    placedCursor.current = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
    setIsDrawing(!isDrawing);
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
  return prevProps.pen === nextProps.pen &&
         prevProps.isDrawing === nextProps.isDrawing;
});
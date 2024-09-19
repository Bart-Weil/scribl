import {
  Skia,
  vec,
} from "@shopify/react-native-skia";

import React, {
  useRef,
  Children,
} from "react";

import {
  Dimensions,
  View,
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
  CursorProps
} from "../../../common/types"

var Victor = require('victor');

export const CursorAlternating: React.FC<CursorProps> = (
  {isDrawing, setIsDrawing,
   paths, setPaths,
   cursor, setCursor,
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
    console.log("drawing start");
    setPaths((old) => {
      var cursorPos = Victor.fromObject(event).subtract(vec(sideLength/2, sideLength/2));
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
        const inverseStrokeStart = cursorToCanvas(strokeStart);
        newPath.moveTo(inverseStrokeStart.x, inverseStrokeStart.y);
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
        const inverseNextPoint = cursorToCanvas(cursorPos);
        const midPoint = Victor.fromObject(lastPoint)
        .add(inverseNextPoint)
        .divide(Victor(2, 2));
        currentPath.quadTo(midPoint.x, midPoint.y, inverseNextPoint.x, inverseNextPoint.y);
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
    
  return (
      <GestureDetector gesture={Gesture.Simultaneous(draw)}>
        {children}
      </GestureDetector>
  );
};

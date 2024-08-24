import {
  Canvas,
  Rect,
  Path,
  SkPath,
  Skia,
  TouchInfo,
  useTouchHandler,
  vec,
  rotate,
} from "@shopify/react-native-skia";
import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";


const sideLength = 80;
const strokeDelay = 450;

export const CursorAlternating = () => {
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [cursor, setCursor] = useState(vec(0, 0));
  const [cursorFill, setCursorFill] = useState("red");

  let isDrawing = false;
  let placedCursor = vec(0, 0);
  let gestureStart = vec(0, 0);

  const onDrawingStart = useCallback((touchInfo: TouchInfo) => {
    setPaths((old) => {
      const x = touchInfo.x - (sideLength/2);
      const y = touchInfo.y - (sideLength/2);
      if (isDrawing) {
        gestureStart = vec(touchInfo.x, touchInfo.y);
        // check if the cursor is outside the square
        if (touchInfo.x < placedCursor.x - (sideLength/2) ||
        touchInfo.x > placedCursor.x + (sideLength)/2 ||
        touchInfo.y < placedCursor.y - (sideLength)/2 ||
        touchInfo.y > placedCursor.y + (sideLength)/2) {
          isDrawing = false;
          setCursor(vec(x, y));
          setCursorFill("red");
        }
      } else {
        setCursor(vec(x, y));
      }

      const newPath = Skia.Path.Make();
      newPath.moveTo(placedCursor.x - (sideLength/2), placedCursor.y - (sideLength/2));
      return [...old, newPath];
    });
  }, []);

  const onDrawingActive = useCallback((touchInfo: TouchInfo) => {
    setPaths((currentPaths) => {
      if (isDrawing) {  
        const x = placedCursor.x + (touchInfo.x-gestureStart.x) - (sideLength/2);
        const y = placedCursor.y + (touchInfo.y-gestureStart.y) - (sideLength/2);
        setCursor(vec(x, y));
        const currentPath = currentPaths[currentPaths.length - 1];
        if (currentPath.isEmpty()) {
          currentPath.moveTo(x, y);
          return [...currentPaths];
        }
        const lastPoint = currentPath.getLastPt();
        const xMid = (lastPoint.x + x) / 2;
        setCursor(vec(x, y));
        const yMid = (lastPoint.y + y) / 2;

        currentPath.quadTo(lastPoint.x, lastPoint.y, x, y);
        return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
      }
      const x = touchInfo.x - (sideLength/2);
      const y = touchInfo.y - (sideLength/2);
      setCursor(vec(x, y));
      return currentPaths;
    });
  }, []);

  const onDrawingEnd = useCallback((touchInfo: TouchInfo) => {
    if (isDrawing) {
      setCursorFill("red");
    } else {
      placedCursor = vec(touchInfo.x, touchInfo.y);
      console.log(placedCursor);
      setCursorFill("green");
    }
    isDrawing = !isDrawing;
  }, []);

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
      onEnd: onDrawingEnd,
    },
    [onDrawingActive, onDrawingStart]
  );

  return (
      <Canvas style={style.container} onTouch={touchHandler}>
        <Rect x={cursor.x} y={cursor.y} width={50} height={50} color={cursorFill}/>
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
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});
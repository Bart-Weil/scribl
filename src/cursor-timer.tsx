import {
  Canvas,
  Circle,
  Rect,
  Path,
  SkPath,
  Skia,
  TouchInfo,
  useTouchHandler,
  vec,
} from "@shopify/react-native-skia";
import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

const sideLength = 80;
const strokeDelay = 450;

export const CursorCanvasTimer = () => {
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [cursor, setCursor] = useState(vec(0, 0));
  const [cursorFill, setCursorFill] = useState("red");

  let strokeStartTime = 0;

  const onDrawingStart = useCallback((touchInfo: TouchInfo) => {
    setPaths((old) => {
      strokeStartTime = Date.now();
      const x = touchInfo.x - (sideLength/2);
      const y = touchInfo.y - (sideLength/2);
      setCursor(vec(x, y));
      const newPath = Skia.Path.Make();
      return [...old, newPath];
    });
  }, []);

  const onDrawingActive = useCallback((touchInfo: TouchInfo) => {
    setPaths((currentPaths) => {
      const x = touchInfo.x - (sideLength/2);
      const y = touchInfo.y - (sideLength/2);
      setCursor(vec(x, y));
      if (Date.now() - strokeStartTime > strokeDelay) {
        setCursorFill("green");
        const currentPath = currentPaths[currentPaths.length - 1];
        if (currentPath.isEmpty()) {
          currentPath.moveTo(x, y);
          return [...currentPaths];
        }
        const lastPoint = currentPath.getLastPt();
        const xMid = (lastPoint.x + x) / 2;
        const yMid = (lastPoint.y + y) / 2;

        currentPath.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);
        return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
      }
      return currentPaths;
    });
  }, []);

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
      onEnd: () => {
        setCursorFill("red");
      }
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
import {
  Canvas,
  Rect,
  Skia,
  Group,
  vec,
  SkPoint,
  SkPath,
  ImageSVG,
  SkSVG,
  fitbox,
  rect,
  Matrix4,
} from "@shopify/react-native-skia";

import React, {
  useState,
  useRef, 
  useCallback,
  ReactNode,
} from "react";

import ReactDOMServer from 'react-dom/server';

import {
  StyleSheet,
  View,
  Text,
  Dimensions
} from "react-native";

import {
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PinchGestureChangeEventPayload,
  PinchGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import {
  ScriblCanvas
} from "./ScriblCanvas"

import {
  Toolbar
} from '../../../src/screens/drawing/Toolbar';

import {
  BaseHeader
} from "../../../src/components/headers/BaseHeader";

import {
  CursorAlternating,
} from "./cursors/CursorAlternating"

import {
  CursorDirect,
} from "./cursors/CursorDirect"

import {
  Pen,
  PathWithPaint,
  CursorHandler,
} from "../../common/types"

import {
  scaleMatrix,
  applyScaleToScale,
  applyInverseScale,
} from "./MatrixHelpers";

var Victor = require('victor');

export const Drawing = () => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const [drawingAreaPos, setDrawingAreaPos] = useState({x: 0, y: 0});
  const [drawingAreaDims, setDrawingAreaDims] = useState({width: 0, height: 0});

  const [activePath, setActivePath] = useState<PathWithPaint>({path: Skia.Path.Make(), paint: Skia.Paint()});
  const [paths, setPaths] = useState<PathWithPaint[]>([]);
  const [cursor, setCursor] = useState(vec(0, 0));

  const [redoStack, setRedoStack] = useState<PathWithPaint[]>([]);

  const [currentPen, setCurrentPen] = useState<Pen>(
    {
      penDown: (penPoint: SkPoint) => ({path: Skia.Path.Make(), paint: Skia.Paint()}),
      penMove: (path: PathWithPaint, penPoint: SkPoint) => path,
      cursorHandler: CursorHandler.CursorDirect,
      getCursorIcon: () => (<></>),
    }
  );

  const [isDrawing, setIsDrawing] = useState(false);
  // where the cursor was last placed in place mode
  const placedCursor = useRef(vec(0, 0));
  // where the cursor was when drawing started
  const cursorStart = useRef(vec(0, 0));

  const cursorBBoxSize = 80;

  // id matrix
  const [zoomMatrix, setZoomMatrix] = useState<Matrix4>(scaleMatrix(1, vec(width/2, height/2)));
  const pivot = useRef(vec(width/2, width/2));

  const prevScale = useRef(1);

  const onZoomStart = (event: GestureStateChangeEvent<PinchGestureHandlerEventPayload>) => {
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

  const renderCurrentPenHandler = (children: ReactNode) => {
    switch (currentPen.cursorHandler) {
      case CursorHandler.CursorAlternating:
        return (<CursorAlternating pen={currentPen}
                                   isDrawing={isDrawing}
                                   setIsDrawing={setIsDrawing}
                                   activePath={activePath}
                                   setActivePath={setActivePath}
                                   paths={paths}
                                   setPaths={setPaths}
                                   cursor={cursor}
                                   setCursor={setCursor}
                                   redoStack={redoStack}
                                   setRedoStack={setRedoStack}
                                   cursorToCanvas={(pos: any) => applyInverseScale(zoomMatrix, pos)}>
                  {children}
                </CursorAlternating>);
      case CursorHandler.CursorDirect:
        return (<CursorDirect pen={currentPen}
                              isDrawing={isDrawing}
                              setIsDrawing={setIsDrawing}
                              activePath={activePath}
                              setActivePath={setActivePath}
                              paths={paths}
                              setPaths={setPaths}
                              cursor={cursor}
                              setCursor={setCursor}
                              redoStack={redoStack}
                              setRedoStack={setRedoStack}
                              cursorToCanvas={(pos: any) => applyInverseScale(zoomMatrix, pos)}>
                  {children}
                </CursorDirect>);
    }
  }
    
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <BaseHeader />
      </View>
      <View style={styles.canvas}>
        <GestureDetector gesture={zoom}>
          <>
          {renderCurrentPenHandler(
            <ScriblCanvas activePath={activePath} paths={paths} contentTransformMatrix={zoomMatrix}>
              <Group transform={fitbox("contain", rect(0, 0, cursorBBoxSize, cursorBBoxSize),
                                                  rect(cursor.x, cursor.y, cursorBBoxSize, cursorBBoxSize))}>
                {currentPen.getCursorIcon(isDrawing)}
              </Group>  
            </ScriblCanvas>
          )}
          <View pointerEvents="box-none"
                style={styles.toolbar} onLayout={
                (event) => {
                  setDrawingAreaPos({x: event.nativeEvent.layout.x, y: event.nativeEvent.layout.y});
                  setDrawingAreaDims({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height});
                  console.log("dims", event.nativeEvent.layout.width, event.nativeEvent.layout.height);
                }
          }>
            <Toolbar currentPen={currentPen}
                     setCurrentPen={setCurrentPen}
                     activePath={activePath}
                     setActivePath={setActivePath}
                     paths={paths}
                     setPaths={setPaths}
                     redoStack={redoStack}
                     setRedoStack={setRedoStack}
                     drawingAreaPos={drawingAreaPos}
                     drawingAreaDims={drawingAreaDims}
                     />
          </View>
          </>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#252422',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  drawingArea: {
    flex: 9,
  },
  canvas: {
    flex: 9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  toolbar: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    backgroundColor: '#252422',
  }
});

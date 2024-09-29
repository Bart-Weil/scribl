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
  createContext,
  useReducer,
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
  Toolbar,
  areToolbarPropsEqual,
} from './toolbar/Toolbar';

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
  DrawingState,
  DrawingAction,
} from "../../common/types"

import {
  scaleMatrix,
  applyScaleToScale,
  applyInverseScale,
} from "./MatrixHelpers";
import { pen } from "./pens/ColorWeightPen";

var Victor = require('victor');

const MemoToolbar = React.memo(Toolbar, areToolbarPropsEqual);

const initialDrawingState = {
  activePath: {path: Skia.Path.Make(), paint: Skia.Paint()},
  paths: [],
  cursor: vec(0, 0),
  redoStack: [],
  currentPen: pen,
  isDrawing: false,
}

const drawingReducer = (state: DrawingState, action: DrawingAction) => {
  switch (action.type) {
    case 'setActivePath':
      return {...state, activePath: action.payload};
    case 'setPaths':
      return {...state, paths: action.payload};
    case 'setCursor':
      return {...state, cursor: action.payload};
    case 'setRedoStack':
      return {...state, redoStack: action.payload};
    case 'setCurrentPen':
      return {...state, currentPen: action.payload};
    case 'setIsDrawing':
      return {...state, isDrawing: action.payload};
    default:
      return state;
  }
}

export const Drawing = () => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const [drawingAreaDims, setDrawingAreaDims] = useState({width: 0, height: 0});

  const [drawingState, setDrawingState] = useReducer(drawingReducer, initialDrawingState);

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
    switch (drawingState.currentPen.cursorHandler) {
      case CursorHandler.CursorAlternating:
        return (<CursorAlternating drawingState={drawingState}
                                   setDrawingState={setDrawingState}
                                   cursorToCanvas={(pos: any) => applyInverseScale(zoomMatrix, pos)}>
                  {children}
                </CursorAlternating>);
      case CursorHandler.CursorDirect:
        return (<CursorDirect drawingState={drawingState}
                              setDrawingState={setDrawingState}
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
            <ScriblCanvas activePath={drawingState.activePath} paths={drawingState.paths} contentTransformMatrix={zoomMatrix}>
              <Group transform={fitbox("contain", rect(0, 0, cursorBBoxSize, cursorBBoxSize),
                                                  rect(drawingState.cursor.x, drawingState.cursor.y, cursorBBoxSize, cursorBBoxSize))}>
                {drawingState.currentPen.getCursorIcon(drawingState.isDrawing)}
              </Group>  
            </ScriblCanvas>
          )}
          <View pointerEvents="box-none"
                style={styles.toolbar} onLayout={
                (event) => {
                  setDrawingAreaDims({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height});
                  console.log("dims", event.nativeEvent.layout.width, event.nativeEvent.layout.height);
                }
          }>
            <MemoToolbar drawingState={drawingState}
                         setDrawingState={setDrawingState}
                         cursorToCanvas={(pos: any) => applyInverseScale(zoomMatrix, pos)}
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
    overflow: 'hidden',
  },
  header: {
    flex: 1,
    backgroundColor: '#252422',
  }
});

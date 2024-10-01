import {
  Skia,
  Paint,
  SkPaint,
  SkPath,
  SkPoint,
  AnimatedProp,
  Matrix4,
} from "@shopify/react-native-skia"

import React, {

} from "react"

export enum CursorHandler {
  CursorAlternating,
  CursorDirect,
}

export type PathWithPaint = {
  path: SkPath;
  paint: SkPaint;
}

export type DrawingState = {
  activePath: PathWithPaint,
  paths: PathWithPaint[],
  cursor: SkPoint,
  redoStack: PathWithPaint[],
  currentPen: Pen,
  isDrawing: boolean,
}

export type DrawingAction = 
    { type: 'setActivePath', payload: PathWithPaint }
  | { type: 'setPaths', payload: PathWithPaint[] }
  | { type: 'setCursor', payload: SkPoint }
  | { type: 'setRedoStack', payload: PathWithPaint[] }
  | { type: 'setCurrentPen', payload: Pen }
  | { type: 'setIsDrawing', payload: boolean }

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse' | undefined;

export enum ToolbarMagnetName {
  Bottom,
  Top,
  Left,
  Right,
};

export interface ToolProps {
  activePath: PathWithPaint,
  setActivePath: React.Dispatch<React.SetStateAction<PathWithPaint>>,
  paths: PathWithPaint[],
  setPaths: React.Dispatch<React.SetStateAction<PathWithPaint[]>>,
}

export interface Pen {
  penDown(penPoint: SkPoint): PathWithPaint,
  penMove(path: PathWithPaint, penPoint: SkPoint): void,
  cursorHandler: CursorHandler,
  getCursorIcon: (isDrawing: boolean) => React.ReactNode,
}

export interface CursorHandlerProps {
  drawingState: DrawingState,
  setDrawingState: React.Dispatch<DrawingAction>,
  cursorToCanvas: (cursorPos: any) => (any),
  children: any,
}

export interface ToolbarProps {
  drawingState: DrawingState,
  setDrawingState: React.Dispatch<DrawingAction>,
  cursorToCanvas: (cursorPos: any) => (any),
  drawingAreaDims: {width: number, height: number},
}

export interface ToolbarButtonProps {
  onPress: () => void,
  isSelected?: boolean,
  iconName: string,
}

export interface ScriblCanvasProps {
  activePath: PathWithPaint,
  paths: PathWithPaint[],
  contentTransformMatrix: Matrix4,
  children: any
}

export interface StaticPathsProps {
  paths: PathWithPaint[]
}
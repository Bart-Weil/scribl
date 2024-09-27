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

export interface ToolProps {
  paths: PathWithPaint[],
  setPaths: React.Dispatch<React.SetStateAction<PathWithPaint[]>>,
}

export interface Pen {
  penDown(paths: PathWithPaint[], penPoint: SkPoint): void,
  penMove(path: PathWithPaint, penPoint: SkPoint): void,
  cursorHandler: CursorHandler,
  getCursorIcon: (isDrawing: boolean) => React.ReactNode,
}

export interface CursorHandlerProps extends ToolProps {
  pen: Pen,
  isDrawing: Boolean,
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
  cursor: SkPoint,
  setCursor: React.Dispatch<React.SetStateAction<SkPoint>>,
  cursorToCanvas: (cursorPos: any) => (any),
  redoStack: PathWithPaint[],
  setRedoStack: React.Dispatch<React.SetStateAction<PathWithPaint[]>>,
  children: any,
}

export interface ToolbarProps extends ToolProps {
  currentPen: Pen,
  setCurrentPen: React.Dispatch<React.SetStateAction<Pen>>,
  redoStack: PathWithPaint[],
  setRedoStack: React.Dispatch<React.SetStateAction<PathWithPaint[]>>,
  drawingAreaPos: {x: number, y: number},
  drawingAreaDims: {width: number, height: number},
}

export interface ToolbarButtonProps {
  onPress: () => void,
  isSelected?: boolean,
  iconName: string,
}

export interface ScriblCanvasProps {
  paths: PathWithPaint[],
  contentTransformMatrix: Matrix4,
  children: any
}
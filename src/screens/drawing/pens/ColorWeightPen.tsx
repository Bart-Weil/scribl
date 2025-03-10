import {
  Skia,
  Paint,
  SkPath,
  SkPoint,
  Circle,
  StrokeCap,
  StrokeJoin,
  PaintStyle,
  SkPaint,
  DiffRect,
  rect,
  rrect,
  RoundedRect,
  CornerPathEffect,
  Group,
} from "@shopify/react-native-skia";

import {
  ToolProps,
  Pen,
  PathWithPaint,
  CursorHandler,
} from "../../../common/types"

import React, {
  ReactDOM,
  ReactNode
} from "react";

var Victor = require('victor');

type ParamCursorIcon = (color: string, strokeWidth: number, cursorHandler: CursorHandler, isDrawing: boolean) => ReactNode;

class ColorWeightPen implements Pen {

  quadFactor = 0.2;

  color: string;
  strokeWidth: number;
  cursorHandler: CursorHandler;
  paramCursorIcon: ParamCursorIcon;

  constructor(color: string, strokeWidth: number, cursorHandler: CursorHandler, paramCursorIcon: ParamCursorIcon) {
    this.color = color;
    this.strokeWidth = strokeWidth;
    this.cursorHandler = cursorHandler;
    this.paramCursorIcon = paramCursorIcon;
  }

  penDown(penPoint: SkPoint) {
    const path: SkPath = Skia.Path.Make();
    path.moveTo(penPoint.x, penPoint.y);
    path.lineTo(penPoint.x, penPoint.y);
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(this.color));
    paint.setStrokeWidth(this.strokeWidth);
    paint.setStyle(PaintStyle.Stroke);
    paint.setAntiAlias(true);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    const pathStub: PathWithPaint = {path: path, paint: paint};
    return pathStub;
  }

  penMove(pathWithPaint: PathWithPaint, penPoint: SkPoint) {
    const numPoints = pathWithPaint.path.countPoints();
    if (numPoints <= 2) {
      pathWithPaint.path.lineTo(penPoint.x, penPoint.y);
    } else {
      const last = Victor.fromObject(pathWithPaint.path.getPoint(numPoints - 2));
      const secondLast = Victor.fromObject(pathWithPaint.path.getPoint(numPoints - 1));
      const extrapolate = secondLast.clone().subtract(last).multiplyScalar(this.quadFactor).add(secondLast);
      pathWithPaint.path.quadTo(extrapolate.x, extrapolate.y, penPoint.x, penPoint.y);
    }
  }

  getCursorIcon(isDrawing: boolean) {
    return this.paramCursorIcon(this.color, this.strokeWidth, this.cursorHandler, isDrawing);
  }
  
  setColor(color: string) {
    this.color = color;
  }

  setStrokeWidth(strokeWidth: number) {
    this.strokeWidth = strokeWidth;
  }
}


export const eraser = new ColorWeightPen(
  "#EDDDDD",
  50,
  CursorHandler.CursorDirect,
  (color: string, strokeWidth: number, cursorHandler: CursorHandler, isDrawing: boolean) => {
    return (
      <Circle cx={0} cy={0} r={strokeWidth/2} color="#000000" opacity={0.4}/>
    ); 
  }
)

export const pen = new ColorWeightPen(
  "#000000",
  4,
  CursorHandler.CursorAlternating,
  (color: string, strokeWidth: number, cursorHandler: CursorHandler, isDrawing: boolean) => {
    const penNib = rrect(rect(0, 0, strokeWidth, strokeWidth), strokeWidth/2, strokeWidth/2);
    const penVert = rrect(rect(0, 0, strokeWidth, 60), strokeWidth/2, strokeWidth/2);
    const penAngle = rrect(rect(0, 0, 60, strokeWidth), strokeWidth/2, strokeWidth/2);
    return (
    <Group transform={[{translateX: -strokeWidth/2}, {translateY: -strokeWidth/2}]}>
      <RoundedRect rect={penNib} color={color} />
      <Group clip={penNib} invertClip opacity={0.5}>
        <Group clip={penVert} invertClip>
          <RoundedRect rect={penAngle} color={isDrawing ? "#00cc00" : "#ff0000"} origin={{ x: strokeWidth/2, y: strokeWidth/2}} transform={[{rotate: Math.PI/4}]}/>
        </Group>
        <RoundedRect rect={penVert} color={isDrawing ? "#00cc00" : "#ff0000"} />
      </Group>
      </Group>
    );
  }
)
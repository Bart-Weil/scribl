import {
  Skia,
  SkPath,
  SkPoint,
} from "@shopify/react-native-skia"

import {
  Children
} from "react"


export interface CursorProps {
  isDrawing: Boolean,
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
  paths: SkPath[],
  setPaths: React.Dispatch<React.SetStateAction<SkPath[]>>,
  cursor: SkPoint,
  setCursor: React.Dispatch<React.SetStateAction<SkPoint>>,
  cursorToCanvas: (cursorPos: any) => (any),
  children: any
}
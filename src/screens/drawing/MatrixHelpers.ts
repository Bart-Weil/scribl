import type { SkMatrix, Vector } from "@shopify/react-native-skia";
import { Skia, scale } from "@shopify/react-native-skia";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

import * as Three from "three";

var Victor = require('victor');

export const getPivot = (scaleMatrix: number[]) => {
  if (scaleMatrix[0] == 1) {
    return Victor(0, 0);
  } else {
    const pivotScale = 1/(1-scaleMatrix[0])
    return Victor(scaleMatrix[3], scaleMatrix[7]).multiply(Victor(pivotScale, pivotScale));
  }
}

export const getScaleFactor = (scaleMatrix: number[]) => {
  "worklet";
  return scaleMatrix[0];
}

export const scaleMatrix = (factor: number, pivot: Vector) => {
  "worklet";
  return [factor, 0, 0, pivot.x - factor*pivot.x, 
          0, factor, 0, pivot.y - factor*pivot.y, 
          0, 0, 1, 0, 
          0, 0, 0, 1];
};

export const applyInverseScale = (scaleMatrix: number[], vector: Vector) => {
  "worklet";
  const factor = getScaleFactor(scaleMatrix);
  const pivot = getPivot(scaleMatrix);
  return Victor.fromObject(vector).subtract(pivot).divide(Victor(factor, factor)).add(pivot);
}

export const applyScaleToScale = (scaleMatrixBefore: number[], scaleMatrixAfter: number[]) => {
  "worklet";
  const factorAfter = scaleMatrixAfter[0];
  const factorBefore = scaleMatrixBefore[0];
  const applyFactor = factorAfter*factorBefore;

  const pivotBefore = Victor.fromObject({x: scaleMatrixBefore[3], y: scaleMatrixBefore[7]});
  const pivotAfter = Victor.fromObject({x: scaleMatrixAfter[3], y: scaleMatrixAfter[7]});
  const applyPivot = pivotAfter.clone().add(pivotBefore.multiply(Victor(factorAfter, factorAfter)));

  return [applyFactor, 0, 0, applyPivot.x, 
          0, applyFactor, 0, applyPivot.y, 
          0, 0, 1, 0, 
          0, 0, 0, 1];
}

export const prettyPrintScaleMatrix = (scaleMatrix: number[]) => {
  console.log("Scale Matrix: ", `
    [${scaleMatrix[0]}, ${scaleMatrix[1]}, ${scaleMatrix[2]}, ${scaleMatrix[3]}]
    [${scaleMatrix[4]}, ${scaleMatrix[5]}, ${scaleMatrix[6]}, ${scaleMatrix[7]}]
    [${scaleMatrix[8]}, ${scaleMatrix[9]}, ${scaleMatrix[10]}, ${scaleMatrix[11]}]
    [${scaleMatrix[12]}, ${scaleMatrix[13]}, ${scaleMatrix[14]}, ${scaleMatrix[15]}]
  `);
  if (scaleMatrix[0] === 1) {
    console.log("Identity Matrix");
  } else {
    console.log("Scale Matrix(factor=", scaleMatrix[0], ", pivot=", scaleMatrix[3]/(1-scaleMatrix[0]), ", ", scaleMatrix[7]/(1-scaleMatrix[0]), ")");
  }
}
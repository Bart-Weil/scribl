import React, {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  pen,
  eraser
} from "../pens/ColorWeightPen"

import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

var Victor = require('victor');

import {
  ToolbarProps,
  CursorHandler,
  PathWithPaint,
  FlexDirection,
  ToolbarMagnetName
} from "../../../common/types";

import { ToolbarUndoRedoButton } from "../../../components/buttons/Toolbar/ToolbarUndoRedoButton";

import { useToolbarAnimation } from "../../../hooks/useToolbarAnimation";

type ToolbarSV = {
  width?: number,
  height?: number,
  borderRadius?: number,
  flexDirection?: FlexDirection,
  margin?: number,
};

type ButtonContainerSV = {
  opacity?: number,
  scaleX?: number,
  scaleY?: number,
  flexDirection?: FlexDirection,
};

type HandleSV = {
  width?: number,
  height?: number,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  drawingState,
  setDrawingState,
  cursorToCanvas,
  drawingAreaDims,
}) => {

  const toolbarShortAxis = 75;
  const toolbarLongAxis = 310;

  const toolbarHandleShortAxis = 4;
  const toolbarHandleLongAxis = 30;

  const borderRadius = 10;

  const {
    toolbarCollapsed,
    toolbarMagnet,
    setToolbarMagnet,
    toolbarStyle,
    toolbarHandleStyle,
    toolbarButtonContainerStyle,
    getToolbarPosition,
    collapseToolbar,
    expandToolbar,
    getMinEdgeDistance,
  } = useToolbarAnimation({
    initialMagnet: ToolbarMagnetName.Bottom,
    drawingAreaDims,
    toolbarShortAxis,
    toolbarLongAxis,
    toolbarHandleShortAxis,
    toolbarHandleLongAxis,
    borderRadius,
  });

  useEffect(() => {
    expandToolbar(toolbarMagnet);
  }, []);

  useEffect(() => {
    setDrawingState({type: 'setCurrentPen', payload: pen});
  }, []);

  const toolbarSV = useSharedValue<ToolbarSV>({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius, flexDirection: 'column' as FlexDirection, margin: 10});
  const buttonContainerSV = useSharedValue<ButtonContainerSV>({opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'row' as FlexDirection});
  const handleSV = useSharedValue<HandleSV>({width: 30, height: 4});

  const updateToolbarSV = ({width, height, borderRadius, flexDirection, margin}: ToolbarSV) => {
    toolbarSV.value = {
      width: width ?? toolbarSV.value.width,
      height: height ?? toolbarSV.value.height,
      borderRadius: borderRadius ?? toolbarSV.value.borderRadius,
      flexDirection: flexDirection ?? toolbarSV.value.flexDirection,
      margin: margin ?? toolbarSV.value.margin,
    };
  }

  const updateToolbarHandleSV = ({width, height}: HandleSV) => {
    handleSV.value = {
      width: width ?? handleSV.value.width,
      height: height ?? handleSV.value.height,
    };
  }

  const updateButtonContainerSV = ({opacity, scaleX, scaleY, flexDirection}: ButtonContainerSV) => {
    buttonContainerSV.value = {
      opacity: opacity ?? buttonContainerSV.value.opacity,
      scaleX: scaleX ?? buttonContainerSV.value.scaleX,
      scaleY: scaleY ?? buttonContainerSV.value.scaleY,
      flexDirection: flexDirection ?? buttonContainerSV.value.flexDirection,
    };
  }

  const grabStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
  };

  const grabUpdate = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    const {dist, magnet} = getMinEdgeDistance({x: event.absoluteX, y: event.absoluteY});
    if (dist < 10) {
      expandToolbar(magnet);
    } else {
      collapseToolbar(toolbarMagnet);
    }
  };

  const grabEnd = () => {
    expandToolbar(toolbarMagnet);
  };

  const grabGesture = Gesture.Pan().onStart(grabStart)
                                   .onUpdate(grabUpdate)
                                   .onEnd(grabEnd);
  grabGesture.minDistance(0);

  const undoIcon = (drawingState.currentPen.cursorHandler === CursorHandler.CursorAlternating) ? "backward-fast" : "arrow-rotate-left";
  const redoIcon = (drawingState.currentPen.cursorHandler === CursorHandler.CursorAlternating) ? "forward-fast" : "arrow-rotate-right";

  const toolbarHints = () => {
    if (toolbarCollapsed) {
      return (
        <>
          {toolbarMagnet !== ToolbarMagnetName.Bottom &&
          <Animated.View entering={FadeIn.duration(300)}
                         exiting={FadeOut.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarLongAxis, height: toolbarShortAxis, bottom: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Top &&
          <Animated.View entering={FadeIn.duration(300)}
                         exiting={FadeOut.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarLongAxis, height: toolbarShortAxis, top: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Left &&
          <Animated.View entering={FadeIn.duration(300)}
                         exiting={FadeOut.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarShortAxis, height: toolbarLongAxis, left: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Right &&
          <Animated.View entering={FadeIn.duration(300)}
                         exiting={FadeOut.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarShortAxis, height: toolbarLongAxis, right: 0}]}/>
          }
        </>
      );
    }
  }
  
  return (
    <>
      {toolbarHints()}
      <GestureDetector gesture={grabGesture}>
        <Animated.View style={[toolbarStyle, getToolbarPosition(), styles.toolbar]}>
            <Animated.View hitSlop={{top: 20, bottom: 50, left: 20, right: 20}}
                          style={[toolbarHandleStyle, styles.toolbarHandle]}/>
          <Animated.View style={[toolbarButtonContainerStyle, styles.buttonContainer]}>
            <ToolbarUndoRedoButton onPress={() => setDrawingState({type: 'setCurrentPen', payload: pen})}
                          isSelected={drawingState.currentPen === pen}
                          iconName="pencil"
            />
            <ToolbarUndoRedoButton onPress={() => setDrawingState({type: 'setCurrentPen', payload: eraser})}
                            isSelected={drawingState.currentPen === eraser}
                            iconName="eraser"
            />
            <ToolbarUndoRedoButton onPress={() => {
              console.log("undo");
              if (drawingState.paths.length === 0) {
              } else {
                setDrawingState({type: 'setRedoStack', payload: [...drawingState.redoStack, drawingState.activePath]});
              }
              const lastPathInd = drawingState.paths.length - 1;
              if (lastPathInd >= 0) {
                setDrawingState({type: 'setActivePath', payload: drawingState.paths[lastPathInd]});
                setDrawingState({type: 'setPaths', payload: drawingState.paths.slice(0, lastPathInd)});
              }
            }}
              iconName={undoIcon}
              
            />
            <ToolbarUndoRedoButton onPress={() => {
              const lastRedoInd = drawingState.redoStack.length - 1;
              console.log("redo");
              if (drawingState.redoStack.length === 0) {
              } else {
                setDrawingState({type: 'setActivePath', payload: drawingState.redoStack[lastRedoInd]});
                setDrawingState({type: 'setPaths', payload: [...drawingState.paths, drawingState.activePath]});
              }
              setDrawingState({type: 'setRedoStack', payload: drawingState.redoStack.slice(0, lastRedoInd)});
            }}
              iconName={redoIcon}
            />
            <ToolbarUndoRedoButton onPress={() => {
              console.log("post");
            }}
              iconName="paper-plane"
              isSelected={true}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export const areToolbarPropsEqual = (prevProps: ToolbarProps, nextProps: ToolbarProps) => {
  return prevProps.drawingState.currentPen === nextProps.drawingState.currentPen &&
         prevProps.drawingState.currentPen.cursorHandler === nextProps.drawingState.currentPen.cursorHandler &&
         prevProps.drawingState.activePath.path.countPoints() === nextProps.drawingState.activePath.path.countPoints() &&
         prevProps.drawingState.paths.length === nextProps.drawingState.paths.length &&
         prevProps.drawingState.redoStack.length === nextProps.drawingState.redoStack.length &&
         prevProps.drawingAreaDims === nextProps.drawingAreaDims;
};

const styles = StyleSheet.create({
  toolbarHint: {
    borderRadius: 10,
    backgroundColor: "#FFD10019",
    borderWidth: 1,
    borderColor: "#FFD100",
  },
  toolbar: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#252422',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 7,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    margin: 10,
  },
  toolbarHandle: {   
    backgroundColor: '#ACA8A1',
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'scaleX(1) scaleY(1)',
    columnGap: 10,
    rowGap: 10,
    opacity: 1,
  },
  toolbarTextInactive: {
    color: "#FFD100",
    fontFamily: "KaiseiTokumin_400Regular",
    fontSize: 12,
  },
});

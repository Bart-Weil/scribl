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
  ToolbarProps,
  CursorHandler,
  PathWithPaint,
} from "../../../common/types";

import { ToolbarUndoRedoButton } from "../../../components/buttons/Toolbar/ToolbarUndoRedoButton";

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

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse' | undefined;

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

enum ToolbarMagnetName {
  Bottom,
  Top,
  Left,
  Right,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  drawingState,
  setDrawingState,
  cursorToCanvas,
  drawingAreaDims,
}) => {

  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [toolbarMagnet, setToolbarMagnet] = useState(ToolbarMagnetName.Bottom);

  const toolbarShortAxis = 75;
  const toolbarLongAxis = 310;

  const toolbarHandleShortAxis = 4;
  const toolbarHandleLongAxis = 30;

  const borderRadius = 10;

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

  const getMinEdgeDistance = ({x, y}: {x: number, y: number}): {dist: number, magnet: ToolbarMagnetName} => {
    const dists = [{dist: x - (toolbarShortAxis + styles.toolbar.margin), magnet: ToolbarMagnetName.Left},
                   {dist: y - 2*(toolbarShortAxis + styles.toolbar.margin), magnet: ToolbarMagnetName.Top},
                   {dist: (drawingAreaDims.width - toolbarShortAxis - styles.toolbar.margin) - x, magnet: ToolbarMagnetName.Right},
                   {dist: (drawingAreaDims.height) - y, magnet: ToolbarMagnetName.Bottom}];

    return dists.reduce((min, p) => p.dist < min.dist ? p : min, dists[0]);
  }

  const collapseToolbar = (magnet: ToolbarMagnetName) => {
    updateToolbarHandleSV({width: toolbarHandleShortAxis, height: toolbarHandleShortAxis});
    switch (magnet) {
      case ToolbarMagnetName.Bottom:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2, flexDirection: 'column'});
        updateButtonContainerSV({opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'row'});
        break;
      case ToolbarMagnetName.Top:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2, flexDirection: 'column-reverse'});
        updateButtonContainerSV({opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'row'});
        break;
      case ToolbarMagnetName.Left:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2, flexDirection: 'row-reverse'});
        updateButtonContainerSV({opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'column'});
        break;
      case ToolbarMagnetName.Right:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2, flexDirection: 'row'});
        updateButtonContainerSV({opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'column'});
        break;
    }
    setToolbarCollapsed(true);
  }

  const expandToolbar = (magnetName: ToolbarMagnetName) => {
    switch (magnetName) {
      case ToolbarMagnetName.Bottom:
        updateToolbarSV({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius, flexDirection: 'column'});
        updateToolbarHandleSV({width: toolbarHandleLongAxis, height: toolbarHandleShortAxis});
        updateButtonContainerSV({opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'row'});
        break;
      case ToolbarMagnetName.Top:
        updateToolbarSV({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius, flexDirection: 'column-reverse'});
        updateToolbarHandleSV({width: toolbarHandleLongAxis, height: toolbarHandleShortAxis});
        updateButtonContainerSV({opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'row'});
        break;
      case ToolbarMagnetName.Left:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarLongAxis, borderRadius: borderRadius, flexDirection: 'row-reverse'});
        updateToolbarHandleSV({width: toolbarHandleShortAxis, height: toolbarHandleLongAxis});
        updateButtonContainerSV({opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'column'});
        break;
      case ToolbarMagnetName.Right:
        updateToolbarSV({width: toolbarShortAxis, height: toolbarLongAxis, borderRadius: borderRadius, flexDirection: 'row'});
        updateToolbarHandleSV({width: toolbarHandleShortAxis, height: toolbarHandleLongAxis});
        updateButtonContainerSV({opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'column'});
        break;
    }
    setToolbarMagnet(magnetName);
    setToolbarCollapsed(false);
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

  const toolbarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(toolbarSV.value.width ?? toolbarLongAxis),
      height: withTiming(toolbarSV.value.height ?? toolbarShortAxis),
      borderRadius: withTiming(toolbarSV.value.borderRadius ?? borderRadius),
      flexDirection: toolbarSV.value.flexDirection ?? 'column',
      margin: toolbarSV.value.margin ?? 10,
    }
  });

  const toolbarHandleStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(handleSV.value.width ?? toolbarHandleLongAxis),
      height: withTiming(handleSV.value.height ?? toolbarHandleShortAxis),
    }
  });

  const toolbarButtonContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(buttonContainerSV.value.opacity ?? 1, {duration: 90}),
      transform: [{scaleX: withTiming(buttonContainerSV.value.scaleX ?? 1)},
                  {scaleY: withTiming(buttonContainerSV.value.scaleY ?? 1)}],
      flexDirection: buttonContainerSV.value.flexDirection ?? 'row',
    }
  });

  const getToolbarPosition = () => {
    const position = toolbarMagnet === ToolbarMagnetName.Bottom ? {bottom: 0} :
                     toolbarMagnet === ToolbarMagnetName.Top ? {top: 0} :
                     toolbarMagnet === ToolbarMagnetName.Left ? {left: 0} :
                     {right: 0};
    return StyleSheet.create({
      toolbar: {
        ...position,
      }
    });
  }

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
        <Animated.View style={[toolbarStyle, getToolbarPosition().toolbar, styles.toolbar]}>
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
                setDrawingState({type: 'setRedoStack', payload: drawingState.redoStack});
              } else {
                setDrawingState({type: 'setRedoStack', payload: [...drawingState.redoStack, drawingState.activePath]});
              }
              const lastPathInd = drawingState.paths.length - 1;
              setDrawingState({type: 'setActivePath', payload: drawingState.paths[lastPathInd]});
              setDrawingState({type: 'setPaths', payload: drawingState.paths.slice(0, lastPathInd)});
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
         prevProps.drawingState.redoStack.length === nextProps.drawingState.redoStack.length;
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

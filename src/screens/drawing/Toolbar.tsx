import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Dimensions,
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  pen,
  eraser
} from "./pens/ColorWeightPen"

import {
  Skia,
  Group,
  RoundedRect,
  rrect,
  rect,
} from "@shopify/react-native-skia";

import {
  ToolbarProps,
  Pen,
  CursorHandler,
  PathWithPaint,
} from "../../common/types";

import { ToolbarUndoRedoButton } from "../../components/buttons/Toolbar/ToolbarUndoRedoButton";

import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import Animated, {
  BounceIn,
  Easing,
  ReduceMotion,
  SharedValue,
  StretchInX,
  StretchInY,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

var Victor = require('victor');

type ToolbarLocation = {
  bottom: number | undefined,
  left: number | undefined,
  right: number | undefined,
  top: number | undefined,
};

enum ToolbarMagnetName {
  Bottom,
  Top,
  Left,
  Right,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPen,
  setCurrentPen,
  activePath,
  setActivePath,
  paths,
  setPaths,
  redoStack,
  setRedoStack,
  drawingAreaPos,
  drawingAreaDims,
}) => {

  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [grabStartPos, setGrabStartPos] = useState({x: 0, y: 0});
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
    setCurrentPen(pen);
  }, []);

  const toolbarTranslateX = useSharedValue(0);
  const toolbarTranslateY = useSharedValue(0);

  const toolbarDimensions = useSharedValue({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius});
  const toolbarButtonVisibility = useSharedValue({opacity: 1, scaleX: 1, scaleY: 1});
  const toolbarHandleDimensions = useSharedValue({width: 30, height: 4});
  const toolbarButtonContainerFlexDirection = useSharedValue('row');
  const toolbarFlexDirection = useSharedValue('column');

  const toolbarDragTiming = {};

  const updateToolbarDimensions = ({width, height, borderRadius}: {width: number, height: number, borderRadius: number}) => {
    toolbarDimensions.value = {
      width: width,
      height: height,
      borderRadius: borderRadius,
    };
  }

  const updateToolbarHandleDimensions = ({width, height}: {width: number, height: number}) => {
    toolbarHandleDimensions.value = {
      width: width,
      height: height,
    };
  }

  const updateToolbarButtonVisibility = ({opacity, scaleX, scaleY}: {opacity: number, scaleX: number, scaleY: number}) => {
    toolbarButtonVisibility.value = {
      opacity: opacity,
      scaleX: scaleX,
      scaleY: scaleY,
    };
  }

  const getMinEdgeDistance = ({x, y}: {x: number, y: number}): {dist: number, magnet: ToolbarMagnetName} => {
    const dists = [{dist: x - drawingAreaPos.x, magnet: ToolbarMagnetName.Left},
                   {dist: y - drawingAreaPos.y - toolbarShortAxis, magnet: ToolbarMagnetName.Top},
                   {dist: drawingAreaPos.x + drawingAreaDims.width - x, magnet: ToolbarMagnetName.Right},
                   {dist: drawingAreaPos.y + drawingAreaDims.height - y, magnet: ToolbarMagnetName.Bottom}];

    return dists.reduce((min, p) => p.dist < min.dist ? p : min, dists[0]);
  }

  const collapseToolbar = (magnet: ToolbarMagnetName) => {
    updateToolbarDimensions({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2});
    updateToolbarHandleDimensions({width: toolbarHandleShortAxis, height: toolbarHandleShortAxis});
    if (magnet === ToolbarMagnetName.Bottom || magnet === ToolbarMagnetName.Top) {
      updateToolbarButtonVisibility({opacity: 0, scaleX: 0, scaleY: 1});
    } else {
      updateToolbarButtonVisibility({opacity: 0, scaleX: 1, scaleY: 0});
    }
    setToolbarCollapsed(true);
  }

  const expandToolbar = (magnetName: ToolbarMagnetName) => {
    switch (magnetName) {
      case ToolbarMagnetName.Bottom:
        updateToolbarDimensions({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius});
        updateToolbarHandleDimensions({width: toolbarHandleLongAxis, height: toolbarHandleShortAxis});
        toolbarButtonContainerFlexDirection.value = 'row';
        toolbarFlexDirection.value = 'column';
        break;
      case ToolbarMagnetName.Top:
        updateToolbarDimensions({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius});
        updateToolbarHandleDimensions({width: toolbarHandleLongAxis, height: toolbarHandleShortAxis});
        toolbarButtonContainerFlexDirection.value = 'row';
        toolbarFlexDirection.value = 'column-reverse';
        break;
      case ToolbarMagnetName.Left:
        updateToolbarDimensions({width: toolbarShortAxis, height: toolbarLongAxis, borderRadius: borderRadius});
        updateToolbarHandleDimensions({width: toolbarHandleShortAxis, height: toolbarHandleLongAxis});
        toolbarButtonContainerFlexDirection.value = 'column';
        toolbarFlexDirection.value = 'row-reverse';
        break;
      case ToolbarMagnetName.Right:
        updateToolbarDimensions({width: toolbarShortAxis, height: toolbarLongAxis, borderRadius: borderRadius});
        updateToolbarHandleDimensions({width: toolbarHandleShortAxis, height: toolbarHandleLongAxis});
        toolbarButtonContainerFlexDirection.value = 'column';
        toolbarFlexDirection.value = 'row';
        break;
    }
    updateToolbarButtonVisibility({opacity: 1, scaleX: 1, scaleY: 1});
    setToolbarMagnet(magnetName);
    setToolbarCollapsed(false);
  }

  const grabStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    toolbarTranslateX.value = withTiming(event.translationX, toolbarDragTiming);
    toolbarTranslateY.value = withTiming(event.translationY, toolbarDragTiming);
  };

  const grabUpdate = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    const {dist, magnet} = getMinEdgeDistance({x: event.absoluteX, y: event.absoluteY});
    if (dist < toolbarShortAxis+10) {
      expandToolbar(magnet);
      setGrabStartPos({x: event.absoluteX, y: event.absoluteY});
      toolbarTranslateX.value = withTiming(0, toolbarDragTiming);
      toolbarTranslateY.value = withTiming(0, toolbarDragTiming);
    } else {
      collapseToolbar(toolbarMagnet);
    }
  };

  const grabEnd = () => {
    expandToolbar(toolbarMagnet);
    toolbarTranslateX.value = withTiming(0, toolbarDragTiming);
    toolbarTranslateY.value = withTiming(0, toolbarDragTiming);
  };

  const grabGesture = Gesture.Pan().onStart(grabStart)
                                   .onUpdate(grabUpdate)
                                   .onEnd(grabEnd);
  grabGesture.minDistance(0);

  const toolbarDimensionsStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: toolbarTranslateX.value}, {translateY: toolbarTranslateY.value}],
      width: withTiming(toolbarDimensions.value.width, toolbarDragTiming),
      height: withTiming(toolbarDimensions.value.height, toolbarDragTiming),
      borderRadius: withTiming(toolbarDimensions.value.borderRadius, toolbarDragTiming),
    }
  });

  const toolbarHandleDimensionsStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(toolbarHandleDimensions.value.width, toolbarDragTiming),
      height: withTiming(toolbarHandleDimensions.value.height, toolbarDragTiming),
    }
  });

  const toolbarButtonVisibilityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(toolbarButtonVisibility.value.opacity, toolbarDragTiming),
      transform: [{scaleX: withTiming(toolbarButtonVisibility.value.scaleX, toolbarDragTiming)},
                  {scaleY: withTiming(toolbarButtonVisibility.value.scaleY, toolbarDragTiming)}],
    }
  });

  const magnetButtonContainerStyle = useAnimatedStyle(() => {
    return {
      flexDirection: toolbarButtonContainerFlexDirection.value,
    }
  });

  const toolbarFlexDirectionStyle = useAnimatedStyle(() => {
    return {
      flexDirection: toolbarFlexDirection.value,
    }
  });

  const undoIcon = (currentPen.cursorHandler === CursorHandler.CursorAlternating) ? "backward-fast" : "arrow-rotate-left";
  const redoIcon = (currentPen.cursorHandler === CursorHandler.CursorAlternating) ? "forward-fast" : "arrow-rotate-right";

  const getToolbarPosition = () => {
    switch (toolbarMagnet) {
      case ToolbarMagnetName.Bottom:
        return StyleSheet.create({
          toolbar: {
            bottom: 0
          }
        });
      case ToolbarMagnetName.Top:
        return StyleSheet.create({
          toolbar: {
            top: 0
          }
        });
      case ToolbarMagnetName.Left:
        return StyleSheet.create({
          toolbar: {
            left: 0
          }
        });
      case ToolbarMagnetName.Right:
        return StyleSheet.create({
          toolbar: {
            right: 0
          }
        });
    }
  }

  const toolbarHints = () => {
    if (toolbarCollapsed) {
      return (
        <>
          {toolbarMagnet !== ToolbarMagnetName.Bottom &&
          <Animated.View entering={StretchInX.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarLongAxis, height: toolbarShortAxis, bottom: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Top &&
          <Animated.View entering={StretchInX.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarLongAxis, height: toolbarShortAxis, top: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Left &&
          <Animated.View entering={StretchInY.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarShortAxis, height: toolbarLongAxis, left: 0}]}/>
          }
          {toolbarMagnet !== ToolbarMagnetName.Right &&
          <Animated.View entering={StretchInY.duration(300)}
                         style={[styles.toolbar, styles.toolbarHint, {width: toolbarShortAxis, height: toolbarLongAxis, right: 0}]}/>
          }
        </>
      );
    }
  }
  
  return (
    <>
      {toolbarHints()}

      <Animated.View style={[toolbarDimensionsStyle, getToolbarPosition().toolbar, toolbarFlexDirectionStyle, styles.toolbar]}>
        <GestureDetector gesture={grabGesture}>
          <Animated.View hitSlop={{top: 20, bottom: 50, left: 20, right: 20}}
                        style={[toolbarHandleDimensionsStyle, styles.toolbarHandle]}/>
        </GestureDetector>

        <Animated.View style={[toolbarButtonVisibilityStyle, magnetButtonContainerStyle, styles.buttonContainer]}>
          <ToolbarUndoRedoButton onPress={() => setCurrentPen(pen)}
                        isSelected={currentPen === pen}
                        iconName="pencil"
          />
          <ToolbarUndoRedoButton onPress={() => setCurrentPen(eraser)}
                          isSelected={currentPen === eraser}
                          iconName="eraser"
          />
          <ToolbarUndoRedoButton onPress={() => {
            console.log("undo");
            setRedoStack((old) => {
              if (paths.length === 0) {
                return old;
              }
              return [...old, activePath];
            });
            setActivePath(paths[paths.length - 1]);
            setPaths(paths.slice(0, paths.length - 1));
          }}
            iconName={undoIcon}
            
          />
          <ToolbarUndoRedoButton onPress={() => {
            console.log("redo");
            setPaths((old) => {
              if (redoStack.length === 0) {
                return old;
              }
              setActivePath(redoStack[redoStack.length - 1]);
              return [...old, activePath];
            });
            setRedoStack([...(redoStack.slice(0, redoStack.length - 1))]);
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
    </>
  );
};

export const areToolbarPropsEqual = (prevProps: ToolbarProps, nextProps: ToolbarProps) => {
  return prevProps.currentPen === nextProps.currentPen &&
         prevProps.currentPen.cursorHandler === nextProps.currentPen.cursorHandler &&
         prevProps.activePath.path.countPoints() === nextProps.activePath.path.countPoints() &&
         prevProps.paths.length === nextProps.paths.length &&
         prevProps.redoStack.length === nextProps.redoStack.length &&
         prevProps.drawingAreaPos === nextProps.drawingAreaPos &&
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

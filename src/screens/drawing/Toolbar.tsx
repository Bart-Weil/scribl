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

import { ToolbarButton } from "../../components/buttons/Toolbar/ToolbarButton";

import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import Animated, {
  Easing,
  ReduceMotion,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

var Victor = require('victor');

type toolbarMagnet = {
  x: number,
  y: number,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPen,
  setCurrentPen,
  paths,
  setPaths,
  redoStack,
  setRedoStack,
  drawingAreaPos,
  drawingAreaDims,
}) => {

  const [grabStartPos, setGrabStartPos] = useState({x: 0, y: 0});

  const toolbarShortAxis = 75;
  const toolbarLongAxis = 310;

  const toolbarHandleShortAxis = 4;
  const toolbarHandleLongAxis = 30;

  const borderRadius = 10;

  const toolbarMagnetTop = {x: drawingAreaPos.x + drawingAreaDims.width/2, y: drawingAreaPos.y, toolbarLayout: StyleSheet.create({})};
  const toolbarMagnetBottom = {x: drawingAreaPos.x + drawingAreaDims.width, y: drawingAreaPos.y + drawingAreaDims.height/2};
  const toolbarMagnetRight = {x: drawingAreaPos.x + drawingAreaDims.width/2, y: drawingAreaPos.y + drawingAreaDims.height};
  const toolbarMagnetLeft = {x: drawingAreaPos.x, y: drawingAreaPos.y + drawingAreaDims.height/2};

  const [toolbarMagnet, setToolbarMagnet] = useState<toolbarMagnet>(toolbarMagnetTop);

  const toolbarTranslateX = useSharedValue(0);
  const toolbarTranslateY = useSharedValue(0);

  const toolbarDimensions = useSharedValue({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius});
  const toolbarButtonVisibility = useSharedValue({opacity: 1, scale: 1});
  const toolbarHandleDimensions = useSharedValue({width: 30, height: 4});

  const toolbarDragTiming = {
    duration: 370,
    easing: Easing.bezier(0.1, 0.65, 0.25, 1),
    reduceMotion: ReduceMotion.System,
  };

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

  const updateToolbarButtonVisibility = ({opacity, scale}: {opacity: number, scale: number}) => {
    toolbarButtonVisibility.value = {
      opacity: opacity,
      scale: scale,
    };
  }

  useEffect(() => {
    setCurrentPen(pen);
  }, []);

  const grabStart = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    setGrabStartPos({x: event.translationX, y: event.translationX});
    updateToolbarDimensions({width: toolbarShortAxis, height: toolbarShortAxis, borderRadius: toolbarShortAxis/2});
    updateToolbarHandleDimensions({width: toolbarHandleShortAxis, height: toolbarHandleShortAxis});
    updateToolbarButtonVisibility({opacity: 0, scale: 0});
    toolbarTranslateX.value = withTiming(event.translationX, toolbarDragTiming);
    toolbarTranslateY.value = withTiming(event.translationY, toolbarDragTiming);
  };

  const grabUpdate = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    console.log("grabUpdate: ", event.absoluteX, event.absoluteY);
    console.log("grabStartPos: ", grabStartPos);

    toolbarTranslateX.value = event.translationX - grabStartPos.x;
    toolbarTranslateY.value = event.translationY - grabStartPos.y;
  };

  const grabEnd = () => {
    console.log("grabEnd");
    updateToolbarDimensions({width: toolbarLongAxis, height: toolbarShortAxis, borderRadius: borderRadius});
    updateToolbarButtonVisibility({opacity: 1, scale: 1});
    updateToolbarHandleDimensions({width: toolbarHandleLongAxis, height: toolbarHandleShortAxis});
    
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
      transform: [{scaleX: withTiming(toolbarButtonVisibility.value.scale, toolbarDragTiming)}],
    }
  });
  
  return (
    <Animated.View style={[toolbarDimensionsStyle, styles.toolbar]}>
      <GestureDetector gesture={grabGesture}>
        <Animated.View hitSlop={{top: 20, bottom: 50, left: 20, right: 20}}
                       style={[toolbarHandleDimensionsStyle, styles.toolbarHandle]}/>
      </GestureDetector>

      <Animated.View style={[toolbarButtonVisibilityStyle, styles.buttonContainer]}>
        <ToolbarButton onPress={() => setCurrentPen(pen)}
                       isSelected={currentPen === pen}
                       iconName="pencil"
        >
        </ToolbarButton>
        <ToolbarButton onPress={() => setCurrentPen(eraser)}
                        isSelected={currentPen === eraser}
                        iconName="eraser"
        />
        <ToolbarButton onPress={() => {
          console.log("undo");
          setRedoStack((old) => {
            if (paths.length === 0) {
              return old;
            }
            const lastPath = paths[paths.length - 1];
            return [...old, lastPath];
          });
          setPaths([...(paths.slice(0, paths.length - 1))]);
        }}
                      iconName="arrow-rotate-left"
        />
        <ToolbarButton onPress={() => {
          console.log("redo");
          setPaths((old) => {
            if (redoStack.length === 0) {
              return old;
            }
            const lastPath = redoStack[redoStack.length - 1];
            return [...old, lastPath];
          });
          setRedoStack([...(redoStack.slice(0, redoStack.length - 1))]);
        }}
                        iconName="arrow-rotate-right"
        />
        <ToolbarButton onPress={() => {
          console.log("post");
        }}
          iconName="paper-plane"
          isSelected={true}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default memo(Toolbar, (prevProps, nextProps) => {
  return prevProps.currentPen === nextProps.currentPen &&
         prevProps.paths.length === nextProps.paths.length &&
         prevProps.redoStack.length === nextProps.redoStack.length &&
         prevProps.drawingAreaPos === nextProps.drawingAreaPos &&
         prevProps.drawingAreaDims === nextProps.drawingAreaDims;
});

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    backgroundColor: '#252422',
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    bottom: 0,
    margin: 10,
  },
  toolbarHandle: {
    backgroundColor: '#ACA8A1',
    width: 30,
    height: 4,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 2,
  },
  buttonContainer: {
    transform: 'scaleX(1)',
    flexDirection: 'row',
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

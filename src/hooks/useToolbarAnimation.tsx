// useToolbarAnimation.tsx
import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useState } from "react";
import { ToolbarMagnetName } from "../common/types";
import { FlexDirection } from "../common/types";

type ToolbarSV = {
  width?: number;
  height?: number;
  borderRadius?: number;
  flexDirection?: FlexDirection;
  margin?: number;
};

type ButtonContainerSV = {
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  flexDirection?: FlexDirection;
};

type HandleSV = {
  width?: number;
  height?: number;
};

type UseToolbarAnimationProps = {
  initialMagnet: ToolbarMagnetName;
  drawingAreaDims: { width: number; height: number };
  toolbarShortAxis: number;
  toolbarLongAxis: number;
  toolbarHandleShortAxis: number;
  toolbarHandleLongAxis: number;
  borderRadius: number;
};

export const useToolbarAnimation = ({
  initialMagnet,
  drawingAreaDims,
  toolbarShortAxis,
  toolbarLongAxis,
  toolbarHandleShortAxis,
  toolbarHandleLongAxis,
  borderRadius,
}: UseToolbarAnimationProps) => {
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [toolbarMagnet, setToolbarMagnet] = useState(initialMagnet);

  const toolbarSV = useSharedValue<ToolbarSV>({
    width: toolbarLongAxis,
    height: toolbarShortAxis,
    borderRadius: borderRadius,
    flexDirection: 'column' as FlexDirection,
    margin: 10,
  });
  const buttonContainerSV = useSharedValue<ButtonContainerSV>({
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    flexDirection: 'row' as FlexDirection,
  });
  const handleSV = useSharedValue<HandleSV>({ width: 30, height: 4 });

  const updateToolbarSV = (update: ToolbarSV) => {
    toolbarSV.value = { ...toolbarSV.value, ...update };
  };

  const updateToolbarHandleSV = (update: HandleSV) => {
    handleSV.value = { ...handleSV.value, ...update };
  };

  const updateButtonContainerSV = (update: ButtonContainerSV) => {
    buttonContainerSV.value = { ...buttonContainerSV.value, ...update };
  };

  const getMinEdgeDistance = ({ x, y }: { x: number; y: number }): { dist: number; magnet: ToolbarMagnetName } => {
    const margin = toolbarSV.value.margin ?? 0;
    const dists = [
      { dist: x - (toolbarShortAxis + margin), magnet: ToolbarMagnetName.Left },
      { dist: y - 2 * (toolbarShortAxis + margin), magnet: ToolbarMagnetName.Top },
      {
        dist: drawingAreaDims.width - toolbarShortAxis - margin - x,
        magnet: ToolbarMagnetName.Right,
      },
      {
        dist: drawingAreaDims.height - y,
        magnet: ToolbarMagnetName.Bottom,
      },
    ];

    return dists.reduce((min, p) => (p.dist < min.dist ? p : min), dists[0]);
  };

  const collapseToolbar = (magnet: ToolbarMagnetName) => {
    updateToolbarHandleSV({ width: toolbarHandleShortAxis, height: toolbarHandleShortAxis });
    switch (magnet) {
      case ToolbarMagnetName.Bottom:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarShortAxis,
          borderRadius: toolbarShortAxis / 2,
          flexDirection: 'column',
        });
        updateButtonContainerSV({ opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'row' });
        break;
      case ToolbarMagnetName.Top:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarShortAxis,
          borderRadius: toolbarShortAxis / 2,
          flexDirection: 'column-reverse',
        });
        updateButtonContainerSV({ opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'row' });
        break;
      case ToolbarMagnetName.Left:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarShortAxis,
          borderRadius: toolbarShortAxis / 2,
          flexDirection: 'row-reverse',
        });
        updateButtonContainerSV({ opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'column' });
        break;
      case ToolbarMagnetName.Right:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarShortAxis,
          borderRadius: toolbarShortAxis / 2,
          flexDirection: 'row',
        });
        updateButtonContainerSV({ opacity: 0, scaleX: 0, scaleY: 0, flexDirection: 'column' });
        break;
    }
    setToolbarCollapsed(true);
  };

  const expandToolbar = (magnet: ToolbarMagnetName) => {
    switch (magnet) {
      case ToolbarMagnetName.Bottom:
        updateToolbarSV({
          width: toolbarLongAxis,
          height: toolbarShortAxis,
          borderRadius: borderRadius,
          flexDirection: 'column',
        });
        updateToolbarHandleSV({ width: toolbarHandleLongAxis, height: toolbarHandleShortAxis });
        updateButtonContainerSV({ opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'row' });
        break;
      case ToolbarMagnetName.Top:
        updateToolbarSV({
          width: toolbarLongAxis,
          height: toolbarShortAxis,
          borderRadius: borderRadius,
          flexDirection: 'column-reverse',
        });
        updateToolbarHandleSV({ width: toolbarHandleLongAxis, height: toolbarHandleShortAxis });
        updateButtonContainerSV({ opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'row' });
        break;
      case ToolbarMagnetName.Left:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarLongAxis,
          borderRadius: borderRadius,
          flexDirection: 'row-reverse',
        });
        updateToolbarHandleSV({ width: toolbarHandleShortAxis, height: toolbarHandleLongAxis });
        updateButtonContainerSV({ opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'column' });
        break;
      case ToolbarMagnetName.Right:
        updateToolbarSV({
          width: toolbarShortAxis,
          height: toolbarLongAxis,
          borderRadius: borderRadius,
          flexDirection: 'row',
        });
        updateToolbarHandleSV({ width: toolbarHandleShortAxis, height: toolbarHandleLongAxis });
        updateButtonContainerSV({ opacity: 1, scaleX: 1, scaleY: 1, flexDirection: 'column' });
        break;
    }
    setToolbarMagnet(magnet);
    setToolbarCollapsed(false);
  };

  const toolbarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(toolbarSV.value.width ?? toolbarLongAxis),
      height: withTiming(toolbarSV.value.height ?? toolbarShortAxis),
      borderRadius: withTiming(toolbarSV.value.borderRadius ?? borderRadius),
      flexDirection: toolbarSV.value.flexDirection ?? 'column',
      margin: toolbarSV.value.margin ?? 10,
    };
  });

  const toolbarHandleStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(handleSV.value.width ?? toolbarHandleLongAxis),
      height: withTiming(handleSV.value.height ?? toolbarHandleShortAxis),
    };
  });

  const toolbarButtonContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(buttonContainerSV.value.opacity ?? 1, { duration: 90 }),
      transform: [
        { scaleX: withTiming(buttonContainerSV.value.scaleX ?? 1) },
        { scaleY: withTiming(buttonContainerSV.value.scaleY ?? 1) },
      ],
      flexDirection: buttonContainerSV.value.flexDirection ?? 'row',
    };
  });

  const getToolbarPosition = () => {
    const position =
      toolbarMagnet === ToolbarMagnetName.Bottom
        ? { bottom: 0 }
        : toolbarMagnet === ToolbarMagnetName.Top
        ? { top: 0 }
        : toolbarMagnet === ToolbarMagnetName.Left
        ? { left: 0 }
        : { right: 0 };
    return position;
  };

  return {
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
    toolbarSV,
    buttonContainerSV,
    handleSV,
  };
};

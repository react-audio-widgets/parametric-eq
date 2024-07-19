import React from "react";
import { EqParameters, EqState, EqStyle, ParametricEqProps } from "./types";
import { CanvasComponentProps, DynamicCanvas } from "@babymotte/dynamic-canvas";
import { renderEq } from "./utils/utils";

export default function ParametricEQ({
  state,
  defaultState,
  params,
  style,
  onChange,
  minimal,
}: ParametricEqProps) {
  const [controlled, setControlled] = React.useState(Boolean(state));
  const [internalState, setInternalState] = React.useState(
    controlled ? state : defaultState
  );

  const updateState = (updater: (oldState: EqState) => EqState) => {
    if (internalState) {
      const newState = updater(internalState);
      setInternalState(newState);
      if (onChange) {
        onChange(newState);
      }
    }
  };

  const isNowControlled = Boolean(state);

  React.useEffect(() => {
    if (!controlled && isNowControlled) {
      setControlled(true);
      console.error("Switching from uncontrolled to controlled EQ!");
    }
    if (controlled && !isNowControlled) {
      setControlled(false);
      console.error("Switching from controlled to uncontrolled EQ!");
    }
  }, [controlled, isNowControlled]);

  const containerRef = React.useRef(null);

  return (
    <div
      className="ParametricEq"
      ref={containerRef}
      style={{
        width: 400,
        height: 300,
        ...style,
      }}
      onClick={() => updateState((s) => ({ ...s, bypassed: !s?.bypassed }))}
    >
      <DynamicCanvas parentRef={containerRef}>
        <EqGraph
          minimal={minimal || false}
          state={internalState}
          params={params}
        />
      </DynamicCanvas>
    </div>
  );
}

function EqGraph({
  state,
  params,
  ctx,
  canvasWidth,
  canvasHeight,
  style,
  minimal,
}: {
  state?: EqState;
  params: EqParameters;
  style?: EqStyle;
  minimal: boolean;
} & CanvasComponentProps) {
  React.useEffect(() => {
    if (ctx && canvasWidth && canvasHeight && state) {
      renderEq(
        state,
        params,
        ctx,
        { width: canvasWidth, height: canvasHeight },
        minimal,
        style
      );
    }
  }, [canvasHeight, canvasWidth, ctx, params, state, style, minimal]);

  return null;
}

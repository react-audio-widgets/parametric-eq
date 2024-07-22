/**
 *  Copyright (C) 2024 Michael Bachmann
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import {
  EqBandType,
  EqParameters,
  EqState,
  EqStyle,
  ParametricEqProps,
} from "./types";
import { CanvasComponentProps, DynamicCanvas } from "@babymotte/dynamic-canvas";
import { findClosestBand, renderEq, useScales } from "./utils/utils";
import { useGestureHandler } from "./utils/gestureHandler";
import { useFakeTouch } from "./utils/fakeTouch";

export default function ParametricEQ({
  state,
  params,
  style,
  onChange,
  minimal,
  onActiveBandChanged,
  onTouched,
}: ParametricEqProps) {
  const [internalState, setInternalState] = React.useState(state);
  const externalStateRef = React.useRef(state);
  const stateRef = React.useRef(state);
  const containerRef = React.useRef(null);
  const touched = React.useRef<boolean>(false);
  const activeBand = React.useRef<number>(0);

  const [onTouch, fakeTouch] = useFakeTouch(
    React.useCallback(
      (touched: boolean) => {
        if (onTouched) onTouched(touched);
        if (!touched) {
          stateRef.current = externalStateRef.current;
          setInternalState(externalStateRef.current);
        }
      },
      [onTouched]
    ),
    500
  );

  React.useEffect(() => {
    stateRef.current = internalState;
  }, [internalState]);

  React.useEffect(() => {
    externalStateRef.current = state;
    if (!fakeTouch.current) {
      stateRef.current = state;
      setInternalState(state);
    }
  }, [fakeTouch, state]);

  const updateState = React.useCallback(
    (updater: (oldState: EqState) => EqState) => {
      if (stateRef.current) {
        const newState = updater(stateRef.current);
        stateRef.current = newState;
        setInternalState(newState);
        if (onChange) {
          onChange(newState);
        }
      }
    },
    [onChange]
  );

  const updateActiveBand = React.useCallback(
    (band: number) => {
      activeBand.current = band;
      if (onActiveBandChanged) {
        onActiveBandChanged(band);
      }
    },
    [onActiveBandChanged]
  );

  const scales = useScales(params);

  const horizontalValue = React.useMemo(
    () => ({
      scale: scales.frequencyScale,
      current: () =>
        stateRef.current?.bands[activeBand.current].frequency ||
        params.minFrequency,
      changed: (val: number) =>
        updateState((s) => {
          const bands = [...s.bands];
          bands[activeBand.current].frequency = val;
          return { ...s, bands: [...s.bands] };
        }),
    }),
    [params.minFrequency, scales.frequencyScale, updateState]
  );

  const verticalValue = React.useMemo(
    () => ({
      scale: scales.gainScale,
      current: () => stateRef.current?.bands[activeBand.current].gain || 0,
      changed: (val: number) =>
        updateState((s) => {
          const bands = [...s.bands];
          bands[activeBand.current].gain = val;
          return { ...s, bands: [...s.bands] };
        }),
    }),
    [scales.gainScale, updateState]
  );

  const contextMenuValue = React.useMemo(
    () => ({
      current: () =>
        stateRef.current?.bands[activeBand.current].bypassed || false,
      changed: (val: boolean) =>
        updateState((s) => {
          const bands = [...s.bands];
          bands[activeBand.current].bypassed = val;
          return { ...s, bands: [...s.bands] };
        }),
    }),
    [updateState]
  );

  const wheelValue = React.useMemo(
    () => ({
      scale: scales.qScale,
      current: () =>
        stateRef.current?.bands[activeBand.current].q || params.minQ,
      changed: (val: number) =>
        updateState((s) => {
          const bands = [...s.bands];
          bands[activeBand.current].q = val;
          return { ...s, bands: [...s.bands] };
        }),
    }),
    [params.minQ, scales.qScale, updateState]
  );

  const handleTouched = React.useCallback(
    (val: boolean) => {
      onTouch(val);
    },
    [onTouch]
  );

  const handleTouchDown = React.useCallback(
    (x: number, y: number) => {
      if (stateRef.current && containerRef.current) {
        const activeBand = findClosestBand(
          stateRef.current,
          scales,
          x,
          y,
          containerRef
        );
        updateActiveBand(activeBand);
      }
    },
    [scales, updateActiveBand]
  );

  const handleTouchUp = React.useCallback(() => {}, []);

  const handleTouchMove = React.useCallback(() => {
    handleTouched(true);
    handleTouched(false);
  }, [handleTouched]);

  const handleContextMenu = React.useCallback(
    (x: number, y: number, altAction: boolean) => {
      if (stateRef.current && containerRef.current) {
        onTouch(true);
        if (
          altAction &&
          stateRef.current.bands[activeBand.current].type === EqBandType.Bell
        ) {
          verticalValue.changed(params.minGain);
        } else {
          const activeBand = findClosestBand(
            stateRef.current,
            scales,
            x,
            y,
            containerRef
          );
          updateActiveBand(activeBand);
        }
        onTouch(false);
      }
    },
    [onTouch, params.minGain, scales, updateActiveBand, verticalValue]
  );

  const handleWheel = React.useCallback(
    (x: number, y: number) => {
      if (stateRef.current && containerRef.current && !touched.current) {
        const activeBand = findClosestBand(
          stateRef.current,
          scales,
          x,
          y,
          containerRef
        );
        handleTouched(true);
        updateActiveBand(activeBand);
        handleTouched(false);
      }
    },
    [handleTouched, scales, updateActiveBand]
  );

  const handleDoubleClick = React.useCallback(() => {
    updateState((s) => {
      const bands = [...s.bands];
      bands[activeBand.current].gain = 0;
      return { ...s, bands: [...s.bands] };
    });
  }, [updateState]);

  useGestureHandler(
    containerRef,
    horizontalValue,
    verticalValue,
    contextMenuValue,
    wheelValue,
    handleTouched,
    handleTouchDown,
    handleTouchUp,
    handleTouchMove,
    handleContextMenu,
    handleWheel,
    handleDoubleClick,
    !minimal
  );

  return (
    <div
      className="ParametricEq"
      ref={containerRef}
      style={{
        width: 400,
        height: 300,
        ...style,
      }}
    >
      <DynamicCanvas parentRef={containerRef}>
        <EqGraph
          minimal={minimal || false}
          state={stateRef.current}
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

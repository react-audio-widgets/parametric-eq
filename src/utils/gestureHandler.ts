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

import { linearScale, Scale } from "@babymotte/scales";
import React from "react";
import { useDbg } from "./utils";

const disableScroll = (e: WheelEvent) => e.preventDefault();

export type NumberValueHandler = {
  scale: Scale;
  current: () => number;
  changed: (val: number) => void;
};

export type BooleanValueHandler = {
  current: () => boolean;
  changed: (val: boolean) => void;
};

export function useGestureHandler<T extends HTMLElement>(
  elementRef: React.RefObject<T>,
  horizontalValue: NumberValueHandler,
  verticalValue: NumberValueHandler,
  contextMenuValue: BooleanValueHandler,
  wheelValue: NumberValueHandler,
  handleTouched: (touched: boolean) => void,
  handleTouchDown: (x: number, y: number, touchPoint: number) => void,
  handleTouchUp: (x: number, y: number, touchPoint: number) => void,
  handleTouchMove: (x: number, y: number, touchPoint: number) => void,
  handleContextMenu: (x: number, y: number, altAction: boolean) => void,
  handleWheel: (x: number, y: number, deltaY: number) => void,
  handleDoubleClick: (x: number, y: number, touchPoint: number) => void,
  enabled: boolean
) {
  const touchCounter = React.useRef<number>(0);
  const mouseDownPoint = React.useRef<[number, number]>([0, 0]);
  const mouseDownHorizontalValue = React.useRef<number>(0);
  const mouseDownVerticalValue = React.useRef<number>(0);

  const mouseMove = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const [x, y, width, height] = relativeCoordinates(e, elementRef);
      const dx = x - mouseDownPoint.current[0];
      const dy = y - mouseDownPoint.current[1];

      if (handleTouchMove) {
        handleTouchMove(dx, dy, -1);
      }

      const xScale = linearScale(0, width);
      const yScale = linearScale(0, height, true);

      if (horizontalValue) {
        const newHorizontalValue = xScale.applyDeltaTo(
          horizontalValue.scale,
          dx,
          mouseDownHorizontalValue.current
        );
        horizontalValue.changed(newHorizontalValue);
      }

      if (verticalValue) {
        const newVerticalValue = yScale.applyDeltaTo(
          verticalValue.scale,
          dy,
          mouseDownVerticalValue.current
        );
        verticalValue.changed(newVerticalValue);
      }
    },
    [elementRef, handleTouchMove, horizontalValue, verticalValue]
  );

  useDbg("handleContextMenu", handleContextMenu);

  const contextMenu = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const [x, y] = relativeCoordinates(e, elementRef);

      if (handleContextMenu) {
        handleContextMenu(x, y, false);
      }
      const newContextMenuValue = !contextMenuValue.current();
      contextMenuValue.changed(newContextMenuValue);
    },
    [contextMenuValue, elementRef, handleContextMenu]
  );

  const contextMenuAlt = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const [x, y] = relativeCoordinates(e, elementRef);
      if (handleContextMenu) {
        handleContextMenu(x, y, true);
      }
      touchCounter.current = 0;
      if (handleTouchUp) {
        handleTouchUp(x, y, -1);
      }
      window.removeEventListener("mousemove", mouseMove);
    },
    [elementRef, handleContextMenu, handleTouchUp, mouseMove]
  );

  const mouseUp = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        const [x, y] = relativeCoordinates(e, elementRef);
        if (handleTouchUp) {
          handleTouchUp(x, y, -1);
        }
        if (touchCounter.current > 0) {
          touchCounter.current -= 1;
        }
        if (touchCounter.current === 0) {
          if (handleTouched) {
            handleTouched(false);
          }
          elementRef.current?.addEventListener("contextmenu", contextMenu);
          window.removeEventListener("contextmenu", contextMenuAlt);
          window.removeEventListener("mousemove", mouseMove);
          window.removeEventListener("mouseup", mouseUp);
        }
      }
    },
    [
      contextMenu,
      contextMenuAlt,
      elementRef,
      handleTouchUp,
      handleTouched,
      mouseMove,
    ]
  );

  const mouseDown = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.button === 0) {
        const [x, y] = relativeCoordinates(e, elementRef);
        mouseDownPoint.current[0] = x;
        mouseDownPoint.current[1] = y;
        if (handleTouchDown) {
          handleTouchDown(x, y, -1);
        }
        if (touchCounter.current <= 0) {
          touchCounter.current = 1;
          if (handleTouched) {
            handleTouched(true);
          }
          window.addEventListener("mouseup", mouseUp);
          window.addEventListener("mousemove", mouseMove);
          window.addEventListener("contextmenu", contextMenuAlt);
          elementRef.current?.removeEventListener("contextmenu", contextMenu);
          mouseDownHorizontalValue.current = horizontalValue?.current();
          mouseDownVerticalValue.current = verticalValue?.current();
        } else {
          touchCounter.current += 1;
        }
      }
    },
    [
      contextMenu,
      contextMenuAlt,
      elementRef,
      handleTouchDown,
      handleTouched,
      horizontalValue,
      mouseMove,
      mouseUp,
      verticalValue,
    ]
  );

  const wheel = React.useCallback(
    (e: WheelEvent) => {
      if (handleWheel) {
        const [x, y] = relativeCoordinates(e, elementRef);
        handleWheel(x, y, e.deltaY);
      }

      if (wheelValue) {
        const scrollScale = linearScale(0.0, 3000.0);
        const dy = e.deltaY;
        const newWheelValue = scrollScale.applyDeltaTo(
          wheelValue.scale,
          dy,
          wheelValue.current()
        );
        wheelValue.changed(newWheelValue);
      }
    },
    [elementRef, handleWheel, wheelValue]
  );

  const doubleClick = React.useCallback(
    (e: MouseEvent) => {
      if (handleDoubleClick) {
        const [x, y] = relativeCoordinates(e, elementRef);
        handleDoubleClick(x, y, -1);
      }
    },
    [elementRef, handleDoubleClick]
  );

  useDbg("contextMenu", contextMenu);
  useDbg("mouseDown", mouseDown);
  useDbg("wheel", wheel);

  React.useLayoutEffect(() => {
    if (elementRef.current) {
      const c = elementRef.current;
      c.addEventListener("wheel", disableScroll, { passive: false });
      if (enabled) {
        console.log("adding listeners");

        c.addEventListener("mousedown", mouseDown);
        c.addEventListener("contextmenu", contextMenu);
        c.addEventListener("wheel", wheel);
        c.addEventListener("dblclick", doubleClick);
      }
      return () => {
        console.log("removing listeners");

        c.removeEventListener("wheel", disableScroll);
        c.removeEventListener("mousedown", mouseDown);
        c.removeEventListener("contextmenu", contextMenu);
        c.removeEventListener("wheel", wheel);
        c.removeEventListener("dblclick", doubleClick);
      };
    }
  }, [contextMenu, doubleClick, elementRef, enabled, mouseDown, wheel]);
}

function relativeCoordinates<T extends HTMLElement>(
  e: MouseEvent,
  elementRef: React.RefObject<T>
) {
  if (!elementRef.current) {
    return [0, 0, 1, 1];
  }
  const bounds = elementRef.current.getBoundingClientRect();
  const x = e.clientX - bounds.x;
  const y = e.clientY - bounds.y;
  return [x, y, bounds.width, bounds.height];
}

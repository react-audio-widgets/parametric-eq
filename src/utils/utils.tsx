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

import React, { CSSProperties } from "react";
import {
  EqBand,
  EqBandType,
  EqParameters,
  EqScales,
  EqState,
  EqFilterSlope,
  EqStyle,
} from "../types";
import {
  clamped,
  linearScale,
  logarithmicScale,
  rasteredLinearScale,
} from "@babymotte/scales";
import { computeBellGain } from "../eqCurves/bell";
import { computeLowShelfGain } from "../eqCurves/lowShelf";
import { computeHighShelfGain } from "../eqCurves/highShelf";
import { computeLowPassGain } from "../eqCurves/lowPass";
import { computeHighPassGain } from "../eqCurves/highPass";
import { formatFrequency, formatGain, formatQ } from "./formatters";

const slopeOptions: EqFilterSlope[] = [6, 12, 18, 24];

const DEFAULT_BAND_STROKE = "#f808";
const DEFAULT_SUM_STROKE = "#f80";

export const COEFFS = [
  [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [1.4142, 0.0, 0.0, 1.0, 0.0, 0.0],
  [1.0, 1.0, 0.0, 0.0, 1.0, 0.0],
  [1.8478, 0.7654, 0.0, 1.0, 1.0, 0.0],
  [1.0, 1.618, 0.618, 0.0, 1.0, 1.0],
  [1.3617, 1.3617, 0.0, 0.618, 0.618, 0.0],
  [1.4142, 1.4142, 0.0, 1.0, 1.0, 0.0],
];

function getBandStroke(style: EqStyle | undefined, i: number) {
  let bandStroke = style?.bandStroke;
  if (
    typeof bandStroke === "string" &&
    !bandStroke.startsWith("rgb") &&
    bandStroke.includes(",")
  ) {
    bandStroke = bandStroke.split(",");
  }
  if (Array.isArray(bandStroke)) {
    if (bandStroke.length > i) {
      bandStroke = bandStroke[i];
    } else {
      bandStroke = undefined;
    }
  }

  return bandStroke || DEFAULT_BAND_STROKE;
}

export function computeBandCurve(
  scales: EqScales,
  band: EqBand,
  frequencies: number[]
): number[] {
  switch (band.type) {
    case EqBandType.Bell:
      return frequencies.map((f) => computeBellGain(band, f));
    case EqBandType.LowShelf:
      return frequencies.map((f) => computeLowShelfGain(band, f));
    case EqBandType.HighShelf:
      return frequencies.map((f) => computeHighShelfGain(band, f));
    case EqBandType.LowPass:
      return frequencies.map((f) =>
        computeLowPassGain(scales, band, slopeOptions, f)
      );
    case EqBandType.HighPass:
      return frequencies.map((f) =>
        computeHighPassGain(scales, band, slopeOptions, f)
      );
    default:
      return frequencies.map(() => 0);
  }
}

export function toPower(gain: number) {
  return Math.pow(10.0, gain / 20.0);
}

export function toPr(power: number) {
  if (power >= 1.0) {
    return power;
  } else {
    return 1.0 / power;
  }
}

export function toDecibel(power: number) {
  return 20.0 * Math.log10(power);
}

export function renderEq(
  eq: EqState,
  params: EqParameters,
  ctx: CanvasRenderingContext2D,
  bounds: { width: number; height: number },
  minimal: boolean,
  style?: EqStyle
) {
  // console.log("drawing");
  const { width, height } = bounds;

  const scales = getScales(params);

  ctx.clearRect(0, 0, width, height);

  const xMin = 0;
  const xMax = width;
  const yMin = 0;
  const yMax = height;

  const maxBandCircleRadius = Math.min(
    Math.min(width, height) / 5,
    Math.max(width, height) / 20
  );
  const minBandCircleRadius = maxBandCircleRadius / 5;

  const xScale = linearScale(xMin, xMax);
  const yScale = linearScale(yMin, yMax, true);
  const circleScale = linearScale(
    minBandCircleRadius,
    maxBandCircleRadius,
    true
  );

  const sumStroke = style?.sumStroke || DEFAULT_SUM_STROKE;

  const y0 = scales.gainScale.convertTo(yScale, 0);

  const xs = range(xMin, xMax);
  const frequencies = xs.map((x) => xScale.convertTo(scales.frequencyScale, x));

  let sum: number[] = [];

  eq.bands
    .filter((b) => !b.bypassed)
    .forEach((b, i) => {
      const bandStroke = getBandStroke(style, i);
      const gains = computeBandCurve(scales, b, frequencies);

      sum = sum.length > 0 ? add(sum, gains) : gains;
      if (!minimal) {
        const ys = gains.map((g) => scales.gainScale.convertTo(yScale, g) || 0);
        drawBandCurve(ctx, xs, ys, bandStroke);
      }
    });

  if (!minimal) {
    eq.bands.forEach((b, i) => {
      const bandStroke = getBandStroke(style, i);
      const radius = scales.qScale.convertTo(circleScale, getQ(b));
      const bx = scales.frequencyScale.convertTo(xScale, b.frequency);
      const by = scales.gainScale.convertTo(yScale, getGain(b));
      drawBandCircle(ctx, bx, by, radius, bandStroke);
    });
  }

  const ys = sum.map((g) => scales.gainScale.convertTo(yScale, g) + 0.5);
  drawSum(ctx, xs, ys, y0, sumStroke, getBandStroke(style, eq.bands.length));
}

export type TooltipData = {
  tooltipX: number;
  tooltipY: number;
  tooltipContent: React.ReactNode;
};

export function tooltip<T extends Element>(
  tooltipRef: React.MutableRefObject<T | null>,
  eq: EqState,
  params: EqParameters,
  scales: EqScales,
  activeBand: number,
  canvas: React.MutableRefObject<HTMLCanvasElement | null>
) {
  if (
    !tooltipRef.current ||
    !eq ||
    !canvas.current ||
    activeBand === undefined ||
    !eq.bands[activeBand] ||
    eq.bands[activeBand].frequency === undefined ||
    eq.bands[activeBand].gain === undefined ||
    eq.bands[activeBand].q === undefined
  ) {
    return null;
  }

  const bounds = canvas.current.getBoundingClientRect();
  const [bandX, bandY] = getBandCoordinates(eq, scales, activeBand, bounds);

  const tooltip = tooltipRef.current;

  const maxBandCircleRadius = Math.min(
    Math.min(bounds.width, bounds.height) / 5,
    Math.max(bounds.width, bounds.height) / 20
  );
  const minBandCircleRadius = maxBandCircleRadius / 5;
  const circleScale = linearScale(
    minBandCircleRadius,
    maxBandCircleRadius,
    true
  );

  const band = eq.bands[activeBand];
  const freq = band ? band.frequency : params.minFrequency;
  const gain = band ? getGain(band) : params.minGain;
  const q = band ? getQ(band) : params.minQ;

  const tooltipBounds = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipBounds.width;
  const tooltipHeight = tooltipBounds.height;

  const radius = scales.qScale.convertTo(circleScale, q) || 0;

  const tooltipRawY = bandY - tooltipHeight - radius - 8;
  const tooltipY = Math.min(
    Math.max(bounds.top + 8, tooltipRawY),
    bounds.bottom - tooltipHeight - 8
  );
  const yOffset = Math.min(
    (tooltipWidth / tooltipHeight) * (tooltipY - tooltipRawY),
    tooltipWidth / 2 + (radius + 8)
  );
  const tooltipRawX = bandX - tooltipWidth / 2;
  const tooltipX = Math.min(
    Math.max(bounds.left + 8, tooltipRawX - yOffset),
    bounds.right - tooltipWidth - 8
  );

  const keyStyle: CSSProperties = {
    fontWeight: "bold",
    textAlign: "left",
    paddingRight: "0.5em",
  };
  const valueStyle: CSSProperties = {
    textAlign: "right",
  };
  const unitStyle: CSSProperties = {
    textAlign: "left",
  };

  const freqLabel = formatFrequency(freq, false);
  const gainLabel = formatGain(gain, false);
  const qLabel = formatQ(q);
  const index = scales.qScale.convertTo(scales.slopeScale, q);
  const slopeLabel = slopeOptions[index];

  const freqUnit = freq >= 999.5 ? "kHz" : "Hz";
  const gainUnit = "dB";
  const qUnit = "";
  const slopeUnit = "dB";

  const tooltipContent = (
    <>
      <table>
        <tbody>
          <tr>
            <td style={keyStyle}>Freq:</td>
            <td style={valueStyle}>{freqLabel}</td>
            <td style={unitStyle}>{freqUnit}</td>
          </tr>
          {hasGain(band) ? (
            <tr>
              <td style={keyStyle}>Gain:</td>
              <td style={valueStyle}>{gainLabel}</td>
              <td style={unitStyle}>{gainUnit}</td>
            </tr>
          ) : null}
          {hasQ(band) ? (
            <tr>
              <td style={keyStyle}>Q:</td>
              <td style={valueStyle}>{qLabel}</td>
              <td style={unitStyle}>{qUnit}</td>
            </tr>
          ) : null}
          {hasSlope(band) ? (
            <tr>
              <td style={keyStyle}>Slope:</td>
              <td style={valueStyle}>{slopeLabel}</td>
              <td style={unitStyle}>{slopeUnit}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  );

  return {
    tooltipX,
    tooltipY,
    tooltipContent,
  };
}

function range(from: number, to: number) {
  const array = [];
  for (let i = from; i <= to; i++) {
    array.push(i);
  }
  return array;
}

function add(a: number[], b: number[]): number[] {
  const output = [];
  for (let i = 0; i < a.length; i++) {
    output.push(a[i] + b[i]);
  }
  return output;
}

function drawBandCurve(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  ys: number[],
  stroke: string | CanvasGradient | CanvasPattern
) {
  ctx.beginPath();
  ctx.moveTo(xs[0], ys[0]);
  for (let i = 1; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawBandCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string | CanvasGradient | CanvasPattern
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawSum(
  ctx: CanvasRenderingContext2D,
  xs: number[],
  ys: number[],
  y0: number,
  stroke: string | CanvasGradient | CanvasPattern,
  fill: string | CanvasGradient | CanvasPattern
) {
  ctx.beginPath();
  ctx.moveTo(xs[0], ys[0]);
  for (let i = 1; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = stroke;
  ctx.stroke();

  ctx.lineTo(xs[xs.length - 1], y0);
  ctx.lineTo(xs[0], y0);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
}

export function findClosestBand(
  eq: EqState,
  scales: EqScales,
  x: number,
  y: number,
  container: React.MutableRefObject<HTMLElement | null>,
  filter?: (band: EqBand, i: number) => boolean
) {
  const bounds = container.current?.getBoundingClientRect();

  const [xMax, yMax] = [bounds?.width || 1, bounds?.height || 1];
  let closest = 0;
  let shortestDistance = 999999999;

  const xScale = linearScale(0, xMax);
  const yScale = linearScale(0, yMax, true);

  for (let i = 0; i < eq.bands.length; i++) {
    const band = eq.bands[i];
    if (filter && !filter(band, i)) {
      continue;
    }
    const bx = scales.frequencyScale.convertTo(xScale, band.frequency) || x;
    const by = scales.gainScale.convertTo(yScale, getGain(band)) || y;
    const dx = bx - x;
    const dy = by - y;
    const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closest = i;
    }
  }

  return closest;
}

export function majorFrequencyTickMarks(eq: EqParameters): number[] {
  const min = eq.minFrequency;
  const minExp = Math.ceil(Math.log10(min));

  const max = eq.maxFrequency;
  const maxExp = Math.ceil(Math.log10(max));

  const output = [];

  for (let exp = minExp; exp < maxExp; exp++) {
    output.push(Math.pow(10, exp));
  }

  return output;
}

export function minorFrequencyTickMarks(eq: EqParameters) {
  const min = eq.minFrequency;
  const minExp = Math.floor(Math.log10(min));

  const max = eq.maxFrequency;
  const maxExp = Math.ceil(Math.log10(max));

  const output = [];

  for (let exp = minExp; exp < maxExp; exp++) {
    for (let multiplier = 2; multiplier < 10; multiplier++) {
      const tick = multiplier * Math.pow(10, exp);
      if (eq.minFrequency < tick && tick < eq.maxFrequency) {
        output.push(tick);
      }
    }
  }

  return output;
}

export function majorGainTickMarks(eq: EqParameters) {
  const max = Math.max(eq.maxGain, Math.abs(eq.minGain));

  const output = [];

  for (let tick = 0; tick < max; tick += 6) {
    output.push(tick);
    if (tick !== -tick) {
      output.push(-tick);
    }
  }

  return output;
}

export function minorGainTickMarks(eq: EqParameters) {
  const max = eq.maxGain;

  const output = [];

  for (let tick = 3; tick < max; tick += 6) {
    output.push(tick);
    if (tick !== -tick) {
      output.push(-tick);
    }
  }

  return output;
}

export function frequencyTickMarkLabels(eq: EqParameters) {
  const start = Math.ceil(Math.log10(eq.minFrequency));
  const end = Math.floor(Math.log10(eq.maxFrequency));
  const labels = new Map();
  for (let exp = start; exp <= end; exp++) {
    const f = Math.pow(10, exp);
    labels.set(f, formatFrequency(f, true, 0));
  }
  return labels;
}
export function gainTickMarkLabels(eq: EqParameters) {
  const max = Math.max(eq.maxGain, Math.abs(eq.minGain));
  const labels = new Map();
  for (let g = 0; g < max; g += 6) {
    labels.set(g, formatGain(g, true, 0));
    if (g !== -g) {
      labels.set(-g, formatGain(-g, true, 0));
    }
  }

  return labels;
}

function getBandCoordinates(
  eq: EqState,
  scales: EqScales,
  activeBand: number,
  canvasBounds: DOMRect
) {
  const xScale = linearScale(canvasBounds.left, canvasBounds.right);
  const yScale = linearScale(canvasBounds.top, canvasBounds.bottom, true);

  const band = eq.bands[activeBand];
  if (band && scales.frequencyScale && scales.gainScale) {
    const bx = scales.frequencyScale.convertTo(xScale, band.frequency);
    const by = scales.gainScale.convertTo(yScale, getGain(band));
    return [bx, by];
  } else {
    return [0, 0];
  }
}

export function square(x: number) {
  return Math.pow(x, 2);
}

export function hasGain(band: EqBand) {
  return (
    band.type === EqBandType.Bell ||
    band.type === EqBandType.LowShelf ||
    band.type === EqBandType.HighShelf
  );
}

export function hasGainControl(band: EqBand) {
  return hasGain(band);
}

export function getGain(band: EqBand): number {
  if (hasGain(band)) {
    return band.gain!;
  } else {
    return 0;
  }
}

export function getQ(band: EqBand): number {
  if (hasQ(band)) {
    return band.q!;
  } else {
    return 10;
  }
}

export function hasQ(band: EqBand) {
  return band.type === EqBandType.Bell;
}

export function hasQControl(band: EqBand) {
  return band.type === EqBandType.Bell || hasSlope(band);
}

export function hasSlope(band: EqBand) {
  return band.type === EqBandType.LowPass || band.type === EqBandType.HighPass;
}

export function useScales(params: EqParameters): EqScales {
  return React.useMemo(() => {
    return getScales(params);
  }, [params]);
}

function getScales(params: EqParameters) {
  const frequencyScale = clamped(
    logarithmicScale(params.minFrequency, params.maxFrequency)
  );
  const gainScale = clamped(linearScale(params.minGain, params.maxGain));
  const qScale = clamped(logarithmicScale(params.minQ, params.maxQ));
  const slopeScale = clamped(
    rasteredLinearScale(0, slopeOptions.length - 1, 1)
  );
  return { frequencyScale, gainScale, qScale, slopeScale };
}

export function useDbg<T>(name: string, item: T) {
  React.useEffect(() => {
    console.debug(name, item);
  }, [name, item]);
}

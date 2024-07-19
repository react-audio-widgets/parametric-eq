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

import { Scale } from "@babymotte/scales";
import React from "react";

export enum EqBandType {
  Bell = "Bell",
  BandPass = "BandPass",
  Notch = "Notch",
  LowShelf = "LowShelf",
  HighShelf = "HighShelf",
  HighPass = "HighPass",
  LowPass = "LowPass",
}
export type EqFilterSlope = 6 | 12 | 18 | 24;
export type EqBand = {
  type: EqBandType;
  bypassed: boolean;
  gain?: number;
  frequency: number;
  q?: number;
  slope?: number;
};
export type EqState = {
  bypassed: boolean;
  bands: EqBand[];
};
export type EqParameters = {
  minGain: number;
  maxGain: number;
  minFrequency: number;
  maxFrequency: number;
  minQ: number;
  maxQ: number;
};
export type EqScales = {
  frequencyScale: Scale;
  gainScale: Scale;
  qScale: Scale;
  slopeScale: Scale;
};
export type ParametricEqProps = {
  state?: EqState;
  defaultState?: EqState;
  params: EqParameters;
  style?: React.CSSProperties;
  minimal?: boolean;
  onTouched?: (touched: boolean) => void;
  onActiveBandChanged?: (activeBand: number) => void;
  onChange?: (state: EqState) => void;
};
export type EqStyle = React.CSSProperties & {
  // TODO make this something more useful than string
  bandStroke: string | string[];
  sumStroke: string;
};

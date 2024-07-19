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
  activeBand?: number;
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
  onChange?: (state: EqState) => void;
  minimal?: boolean;
};
export type EqStyle = React.CSSProperties & {
  // TODO make this something more useful than string
  bandStroke: string | string[];
  sumStroke: string;
};

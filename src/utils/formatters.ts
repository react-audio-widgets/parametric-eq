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

export function formatGain(val: number, withUnit: boolean, digits?: number) {
  const dynamicDigits =
    digits === undefined
      ? Math.round(Math.abs(val) * 10) >= 100
        ? 0
        : 1
      : digits;
  return formatGainWithDigits(val, dynamicDigits, withUnit);
}

export function formatFrequency(
  val: number,
  withUnit: boolean,
  digits?: number
) {
  let dynamicDigits;
  if (val < 99.95) {
    dynamicDigits = digits === undefined ? 1 : digits;
  } else if (val < 999.5) {
    dynamicDigits = digits === undefined ? 0 : digits;
  } else if (val <= 9995.0) {
    dynamicDigits = digits === undefined ? 2 : digits;
  } else {
    dynamicDigits = digits === undefined ? 1 : digits;
  }
  return formatFrequencyWithDigits(val, dynamicDigits, withUnit);
}

export function formatQ(val: number) {
  const digits = Math.max(0, 2 - Math.ceil(Math.log10(val + 0.00001)));
  return val.toFixed(digits);
}

function formatFrequencyWithDigits(
  val: number,
  digits: number,
  withUnit: boolean
) {
  const kilo = val >= 999.5;
  const unit = kilo ? "kHz" : "Hz";
  const value = kilo ? val / 1000.0 : val;

  return withUnit ? `${value.toFixed(digits)} ${unit}` : value.toFixed(digits);
}

function formatGainWithDigits(val: number, digits: number, withUnit: boolean) {
  const abs = Math.abs(val);

  let sign;

  if (Math.round(abs * 10.0) === 0.0) {
    sign = "";
  } else if (val < 0.0) {
    sign = "-";
  } else {
    sign = "+";
  }

  return withUnit
    ? `${sign}${abs.toFixed(digits)} dB`
    : `${sign}${abs.toFixed(digits)}`;
}

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

import { EqBand, EqFilterSlope, EqScales } from "../types";
import { COEFFS, square } from "../utils/utils";

export function computeLowPassGain(
  scales: EqScales,
  band: EqBand,
  slopeOptions: EqFilterSlope[],
  f: number
) {
  const f0 = band.frequency / f;
  const f1 = square(1 / f0);
  const f2 = square(f1);
  let d = 1;

  const slope =
    scales.qScale && scales.slopeScale
      ? slopeOptions[scales.qScale.convertTo(scales.slopeScale, band.q!)]
      : 12;
  const order = Math.floor(slope / 6);
  const ordOff = order === 0 ? 1 : order;

  for (let k = 0; k < (order + 1) / 2; k++) {
    const a = COEFFS[ordOff - 1][k];
    const b = COEFFS[ordOff - 1][k + 3];
    d *= 1 + (square(a) - 2 * b) * f1 + square(b) * f2;
  }

  const pOut = Math.sqrt(1 / d);
  const gainOut = 20 * Math.log10(pOut);

  return gainOut;
}

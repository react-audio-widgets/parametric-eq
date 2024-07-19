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

import { EqBand } from "../types";
import { square, toPower, toPr } from "../utils/utils";

export function computeLowShelfGain(band: EqBand, f: number) {
  const p = toPower(band.gain!);
  const pR = toPr(p);

  const f0 = band.frequency / f;
  const f1 = square(f0);
  const f2 = square(1 - f1);

  const d = f2 + 2 * f1;
  let n;
  let pOut;

  if (p >= 1) {
    n = square(1 - p * f1) + 2 * p * f1;
    pOut = Math.sqrt(n / d);
  } else {
    n = square(1 - pR * f1) + 2 * pR * f1;
    pOut = Math.sqrt(d / n);
  }

  const gainOut = 20 * Math.log10(pOut);

  return gainOut;
}

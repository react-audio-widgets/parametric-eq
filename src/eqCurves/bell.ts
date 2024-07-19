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
import { square, toDecibel, toPower, toPr } from "../utils/utils";

export function computeBellGain(band: EqBand, f: number) {
  const p = toPower(band.gain!);
  const pR = toPr(p);

  const f0 = band.frequency / f;
  const f1 = square(f0);
  const f2 = square(1.0 - f1);
  const q2 = square(1.0 / band.q!);

  const n =
    square(f2) +
    square(q2 * pR * f1) +
    f2 * f1 * square(pR) * q2 +
    f2 * f1 * q2;
  const d = square(f2 + q2 * f1);

  let pOut;
  if (p >= 1.0) {
    pOut = Math.sqrt(n / d);
  } else {
    pOut = Math.sqrt(d / n);
  }

  return toDecibel(pOut);
}

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

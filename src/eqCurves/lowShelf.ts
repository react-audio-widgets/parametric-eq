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

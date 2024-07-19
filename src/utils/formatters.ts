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

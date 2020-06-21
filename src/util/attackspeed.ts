export function attackSpeedAdd(
  base: number,
  percent: number,
  stacks: number
): number {
  return base / (1 + (1 - 1 / Math.pow(1 + percent, stacks)));
}

export function round(value: any, decimals: any): number {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

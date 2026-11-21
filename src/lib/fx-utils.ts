export interface SpotRates {
  rmb: number;
  myr: number;
  sgd: number;
}

export interface EffectiveRates {
  rate_rmb_idr: number;
  rate_myr_idr: number;
  rate_sgd_idr: number;
}

export function computeEffectiveRates(
  spot: SpotRates,
  spreadPercent: number,
  spreadFlatIdr: number
): EffectiveRates {
  const safePercent =
    Number.isFinite(spreadPercent) && spreadPercent >= 0 ? spreadPercent : 0;
  const safeFlat =
    Number.isFinite(spreadFlatIdr) && spreadFlatIdr >= 0 ? spreadFlatIdr : 0;
  const factor = 1 + safePercent / 100;

  return {
    rate_rmb_idr: Math.round(spot.rmb * factor + safeFlat),
    rate_myr_idr: Math.round(spot.myr * factor + safeFlat),
    rate_sgd_idr: Math.round(spot.sgd * factor + safeFlat),
  };
}

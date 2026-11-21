import type {
  CargoCategory,
  CurrencyCode,
  KalbarDestination,
  OriginCountry,
  PublicSettings,
  RateUnit,
  ShippingMethod,
  ShippingRate,
} from './types';

export interface CalculatorInput {
  originCountry: OriginCountry;
  shippingMethod: ShippingMethod;
  unit?: RateUnit;
  cargoCategory: CargoCategory;
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  colliCount: number;
  directCbm: number;
  destinationCity: string;
  includeGoodsValue: boolean;
  goodsValueForeign: number;
  quantity: number;
}

export interface CalculatorResult {
  matchedRate: ShippingRate;
  destination: KalbarDestination | null;
  unit: RateUnit;
  chargeableQty: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  isVolumetricApplied: boolean;
  calculatedCbm: number;
  internationalShippingIdr: number;
  localKalbarFeeIdr: number;
  currency: CurrencyCode;
  fxRate: number;
  goodsValueIdr: number;
  sourcingFeeIdr: number;
  totalAllInIdr: number;
  hppPerUnitIdr: number | null;
  etaMinDays: number;
  etaMaxDays: number;
}

export function getCurrencyForOrigin(origin: OriginCountry): CurrencyCode {
  switch (origin) {
    case 'china':
      return 'RMB';
    case 'malaysia':
      return 'MYR';
    case 'singapura':
      return 'SGD';
  }
}

export function getFxRateForOrigin(
  origin: OriginCountry,
  settings: PublicSettings
): number {
  switch (origin) {
    case 'china':
      return settings.rate_rmb_idr;
    case 'malaysia':
      return settings.rate_myr_idr;
    case 'singapura':
      return settings.rate_sgd_idr;
  }
}

export function calculateImportEstimate(
  input: CalculatorInput,
  rates: ShippingRate[],
  destinations: KalbarDestination[],
  settings: PublicSettings
): CalculatorResult | null {
  const matchedRate = rates.find(
    (r) =>
      r.is_active &&
      r.origin_country === input.originCountry &&
      r.shipping_method === input.shippingMethod &&
      r.cargo_category === input.cargoCategory &&
      (!input.unit || r.unit === input.unit)
  );

  if (!matchedRate) return null;

  const colli = Math.max(1, Math.round(input.colliCount || 1));
  const minCharge = Number(matchedRate.min_charge) || (matchedRate.unit === 'kg' ? 1 : 0.1);
  const actualWeight = Math.max(0, Number(input.actualWeightKg) || 0);
  const hasDimensions =
    input.lengthCm > 0 && input.widthCm > 0 && input.heightCm > 0;

  let volumetricWeightKg = 0;
  let calculatedCbm = Math.max(0, Number(input.directCbm) || 0);
  let chargeableQty = minCharge;
  let isVolumetricApplied = false;
  let effectiveWeightForLocal = actualWeight;

  if (matchedRate.unit === 'kg') {
    const divisor = matchedRate.volumetric_divisor || 6000;
    if (hasDimensions) {
      volumetricWeightKg =
        ((input.lengthCm * input.widthCm * input.heightCm) / divisor) * colli;
      calculatedCbm =
        ((input.lengthCm * input.widthCm * input.heightCm) / 1_000_000) * colli;
    }
    const maxWeight = Math.max(actualWeight, volumetricWeightKg);
    isVolumetricApplied =
      volumetricWeightKg > actualWeight && volumetricWeightKg >= minCharge;
    chargeableQty = Math.max(minCharge, Number(maxWeight.toFixed(2)));
    effectiveWeightForLocal = chargeableQty;
  } else {
    if (calculatedCbm <= 0 && hasDimensions) {
      calculatedCbm =
        ((input.lengthCm * input.widthCm * input.heightCm) / 1_000_000) * colli;
    }
    chargeableQty = Math.max(minCharge, Number(calculatedCbm.toFixed(3)));
    // Estimate kg equivalent for Kalbar local forwarding calculation if actualWeight not set
    effectiveWeightForLocal =
      actualWeight > 0 ? actualWeight : Math.max(10, Math.round(chargeableQty * 150));
  }

  const internationalShippingIdr = Math.round(chargeableQty * matchedRate.rate_idr);

  const destination =
    destinations.find((d) => d.city_name === input.destinationCity) ||
    destinations[0] ||
    null;

  const localKalbarFeeIdr = destination
    ? Math.round(
        destination.extra_fee_flat +
          destination.extra_fee_per_kg * effectiveWeightForLocal
      )
    : 0;

  const currency = getCurrencyForOrigin(input.originCountry);
  const fxRate = getFxRateForOrigin(input.originCountry, settings);

  let goodsValueIdr = 0;
  let sourcingFeeIdr = 0;
  if (input.includeGoodsValue && input.goodsValueForeign > 0) {
    goodsValueIdr = Math.round(input.goodsValueForeign * fxRate);
    sourcingFeeIdr = Math.max(
      settings.sourcing_fee_min_idr,
      Math.round((goodsValueIdr * settings.sourcing_fee_percent) / 100)
    );
  }

  const totalAllInIdr =
    internationalShippingIdr + localKalbarFeeIdr + goodsValueIdr + sourcingFeeIdr;

  const qty = Math.max(0, Math.round(input.quantity || 0));
  const hppPerUnitIdr = qty > 0 ? Math.round(totalAllInIdr / qty) : null;

  const extraEta = destination ? destination.extra_eta_days : 0;

  return {
    matchedRate,
    destination,
    unit: matchedRate.unit,
    chargeableQty,
    actualWeightKg: actualWeight,
    volumetricWeightKg: Number(volumetricWeightKg.toFixed(2)),
    isVolumetricApplied,
    calculatedCbm: Number(calculatedCbm.toFixed(3)),
    internationalShippingIdr,
    localKalbarFeeIdr,
    currency,
    fxRate,
    goodsValueIdr,
    sourcingFeeIdr,
    totalAllInIdr,
    hppPerUnitIdr,
    etaMinDays: matchedRate.eta_min_days + extraEta,
    etaMaxDays: matchedRate.eta_max_days + extraEta,
  };
}

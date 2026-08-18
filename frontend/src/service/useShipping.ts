import type { ShippingPackage } from '@core/model/shippingPackage';
import type { ShippingAddress } from '@core/model/shippingAddress';
import { countries } from '@/tools/country';

const shippingZones = {
    canada: ["CA"],
    usa: ["US"],
    europe: [
        "FR", "DE", "IT", "ES", "BE", "NL", "PT", "IE", "SE", "NO"
    ]
}

const getZone = (country: string): string => {

    if (shippingZones.canada.includes(country))
        return "CA"

    if (shippingZones.usa.includes(country))
        return "US"

    if (shippingZones.europe.includes(country))
        return "EU"

    return "international"
}

const getVolumetricWeight = (pack: ShippingPackage): number => {

    const volume = pack.length * pack.width * pack.height;

    return volume / 5000;
}

const getBasePrice = (zone: string): number => {
    switch (zone) {
        case "CA":
            return 8

        case "US":
            return 22

        case "EU":
            return 45

        default:
            return 70
    };
}

const getWeightMultiplier = (zone: string): number => {
    switch (zone) {
        case "CA":
            return 8

        case "US":
            return 12

        case "EU":
            return 15

        default:
            return 15
    };
}

const getSizeFee = (pack: ShippingPackage): number => {
    const maxDimension = Math.max(pack.length, pack.width, pack.height)

    if (maxDimension > 60)
        return 10

    if (maxDimension > 40)
        return 5

    return 0
}

const round = (value: number) => {
    return Math.round(value * 100) / 100
}

export const calculateShipping = (
    address: ShippingAddress,
    pack: ShippingPackage
): number => {
    const zone = getZone(address.country);
    const volumetricWeight = getVolumetricWeight(pack);
    const chargeableWeight = Math.max(pack.weight, volumetricWeight);
    const basePrice = getBasePrice(zone)
    const weightPrice = chargeableWeight * getWeightMultiplier(zone)
    const sizeFee = getSizeFee(pack)

    return round(basePrice + weightPrice + sizeFee)
}
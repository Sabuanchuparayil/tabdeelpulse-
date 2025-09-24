import { Asset } from '../types';

/**
 * Calculates straight-line depreciation for an asset.
 * @param asset - The asset object.
 * @returns An object with depreciation details.
 */
export const calculateDepreciation = (asset: Asset) => {
    const purchaseDate = new Date(asset.purchaseDate);
    const now = new Date();
    
    // Years since purchase
    let yearsOwned = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Assuming a useful life based on depreciation rate
    const usefulLife = 1 / asset.depreciationRate; 

    // Cap years owned at useful life
    if (yearsOwned > usefulLife) {
        yearsOwned = usefulLife;
    }

    // Salvage value is assumed to be 10% of purchase cost
    const salvageValue = asset.purchaseCost * 0.10;
    const depreciableBase = asset.purchaseCost - salvageValue;

    const yearlyDepreciation = depreciableBase / usefulLife;
    
    let accumulatedDepreciation = yearlyDepreciation * yearsOwned;
    if (accumulatedDepreciation < 0) accumulatedDepreciation = 0;
    
    let currentBookValue = asset.purchaseCost - accumulatedDepreciation;
    
    // Book value should not go below salvage value
    if (currentBookValue < salvageValue) {
        currentBookValue = salvageValue;
    }
    
    // For disposed assets, book value is 0
    if (asset.status === 'Disposed') {
        currentBookValue = 0;
        accumulatedDepreciation = asset.purchaseCost;
    }


    return {
        accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
        currentBookValue: parseFloat(currentBookValue.toFixed(2)),
        salvageValue,
        usefulLife
    };
};
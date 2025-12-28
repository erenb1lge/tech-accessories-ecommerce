// format.js

export function formatPriceUSD(amount) {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }
  
  export function formatRating(rating) {
    const r = Number(rating) || 0;
    return `${r.toFixed(1)} ★`;
  }
  
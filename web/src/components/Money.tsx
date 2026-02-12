export function centsToAud(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

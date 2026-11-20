// QuickNode Streams filter for ResilienceOS.
// Network: Arc testnet. Dataset: Logs. Destination: webhook -> https://<host>/api/stream
// Keeps only logs emitted by the ParametricReserve contract and drops every other block.
// Update RESERVE when the contract is redeployed (web/src/data/deployment.json).
function main(stream) {
  const RESERVE = "0xf9e22c4dfdb570bfa31a0254f30e5ec340bbe2b6";
  const logs = [];
  const walk = (x) => {
    if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x.address === "string" && x.address.toLowerCase() === RESERVE) logs.push(x);
  };
  walk(stream.data);
  return logs.length ? { reserve: RESERVE, logs } : null;
}

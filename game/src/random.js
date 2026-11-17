// Deterministic pseudo-random generator so demo scenes and waves can be replayed.

export function createRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

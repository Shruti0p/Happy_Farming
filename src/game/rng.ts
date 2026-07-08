// Mulberry32 seed random generator
export class SeededRNG {
  private seedState: number;

  constructor(seedStr: string) {
    this.seedState = this.hashString(seedStr);
  }

  // Hash function to turn any string into a 32-bit integer
  private hashString(str: string): number {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return (hash >>> 0);
  }

  // Returns a pseudo-random float between 0 and 1 (inclusive, exclusive)
  public next(): number {
    let t = (this.seedState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns a pseudo-random integer between min and max (inclusive)
  public nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Choose a random element from an array
  public choose<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }
}

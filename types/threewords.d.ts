declare module "threewords" {
  interface ThreeWords {
    (input?: string): string;
    random(): string;
  }
  const threewords: ThreeWords;
  export default threewords;
}

declare module 'ev3dev-lang';
declare module 'ev3dev-lang' {
  export class Motor {
      constructor(port: string);
      runToRelativePosition(position: number, speed: number): void;
      position: number;
  }
}
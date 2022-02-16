import { Emojis } from "./enums";

export namespace Strategy {
  export abstract class Duck {
    private _flyBehavior: FlyBehavior;
    private _quackBehavior: QuackBehavior;
    abstract display(): void;

    public performFly(): void {
      this._flyBehavior.fly();
    }

    public performQuack(): void {
      this._quackBehavior.quack();
    }

    public setFlyBehavior(fb: FlyBehavior): void {
      this._flyBehavior = fb;
    }

    public setQuackBehavior(qb: QuackBehavior): void {
      this._quackBehavior = qb;
    }

    public get flyBehavior(): FlyBehavior {
      return this._flyBehavior;
    }

    public get quackBehavior(): QuackBehavior {
      return this._quackBehavior;
    }
  }

  export interface FlyBehavior {
    fly(): void;
  }

  export interface QuackBehavior {
    quack(): void;
  }

  export class FlyWithWings implements FlyBehavior {
    fly(): void {
      console.log("I'm flying!!");
    }
  }

  export class FlyNoWay implements FlyBehavior {
    fly(): void {
      console.log("I can't fly");
    }
  }

  export class Quack implements QuackBehavior {
    quack(): void {
      console.log("*QUACK*");
    }
  }

  export class Squeak implements QuackBehavior {
    quack(): void {
      console.log("Squeak");
    }
  }

  export class MuteQuack implements QuackBehavior {
    quack(): void {
      console.log("*silenice*");
    }
  }

  export class MallardDuck extends Duck {
    constructor() {
      super();
      this.setFlyBehavior(new FlyWithWings());
      this.setQuackBehavior(new Quack());
    }

    display(): void {
      // draw a mallard duck with emoji
      console.log(`MallardDuck: \n ${Emojis.DUCK}`);
    }
  }

  export class Invoker {
    run() {
      const duck = new MallardDuck();
      duck.display();
      duck.performFly();
      duck.performQuack();
    }
  }
}

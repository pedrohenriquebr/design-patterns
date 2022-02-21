export namespace Builder.Pseudocode {
  export interface Builder {
    reset();
    buildStepA();
    buildStepB();
  }

  export class Director {
    constructor(private builder: Builder) {}
    public construct(type: string): void {
      this.builder.reset();
      switch (type) {
        case "A":
          this.builder.buildStepA();
          break;
        case "B":
          this.builder.buildStepA();
          this.builder.buildStepB();
          break;
        default:
          throw new Error("Unknown type");
      }
    }
  }

  export class Product {
    public featA: string;
    public featB: string;
    public featC: number;
  }

  export class ConcreteBuilder implements Builder {
    private product: Product;
    public reset(): void {
      this.product = new Product();
    }
    public buildStepA(): void {
      this.product.featA = "A";
    }
    public buildStepB(): void {
      this.product.featB = "B";
    }
    public getProduct(): Product {
      return this.product;
    }
  }

  export class Invoker {
    public run() {
      const builder = new ConcreteBuilder();
      const director: Director = new Director(builder);
      director.construct("A");
      const product: Product = builder.getProduct();
      console.log(product);
    }
  }
}

export namespace Builder {
  export interface Builder {
    reset();
    setSeats(number: number):void;
    setEngine(engine: string):void;
    setTripComputer(tripComputer: boolean):void;
    setGPS(gps:boolean):void;
  }

  export class Car {
    public seats: number;
    public engine: string;
    public tripComputer: boolean;
    public gps: boolean;

    public toString(): string {
      return (
        "Car: \n" +
        `  Seats: ${this.seats}\n` +
        `  Engine: ${this.engine}\n` +
        `  TripComputer: ${this.tripComputer}\n` +
        `  GPS: ${this.gps}\n`
      );
    }
  }

  export class Manual {
    public seats: number;
    public engine: string;
    public tripComputer: boolean;
    public gps: boolean;

    /**
     * Returns a string with the observation or tips about the engine.
     * Eg. "Use the engine for racing."
     * @param engine
     * @returns string
     */
    public getObServation(engine: string) {
      switch (engine) {
        case "gas":
          return "Observation: Use the engine for racing.";
        case "diesel":
          return "Observation: Use the engine for heavy duty work.";
        case "electric":
          return "Observation: Best for the weekend.";
        case "SUV engine":
          return "Observation: It has best eco performance in the market";
        default:
          return "Observation: It will consume too many gas";
      }
    }

    public toString() {
      return (
        "Car Manual:\n" +
        ` The car has ${this.seats} seats.\n` +
        ` The engine is ${this.engine}.\n` +
        ` The car has a ${
          this.tripComputer ? "trip computer" : "no trip computer"
        }.\n` +
        ` The car has a ${this.gps ? "GPS" : "no GPS"}.\n` +
        ` ${this.getObServation(this.engine)}\n`
      );
    }
  }

  export class CarBuilder implements Builder {
    private result: Car;
    public reset(): void {
      this.result = new Car();
    }
    public setSeats(number): void {
      this.result.seats = number;
    }
    public setEngine(engine): void {
      this.result.engine = engine;
    }
    public setTripComputer(tripComputer): void {
      this.result.tripComputer = tripComputer;
    }
    public setGPS(gps): void {
      this.result.gps = gps;
    }
    public getResult(): Car {
      return this.result;
    }
  }

  export class CarManualBuilder implements Builder {
    private result: Manual;
    public reset(): void {
      this.result = new Manual();
    }
    public setSeats(number): void {
      this.result.seats = number;
    }
    public setEngine(engine): void {
      this.result.engine = engine;
    }
    public setTripComputer(tripComputer): void {
      this.result.tripComputer = tripComputer;
    }
    public setGPS(gps): void {
      this.result.gps = gps;
    }
    public getResult(): Manual {
      return this.result;
    }
  }

  export class Director {
    constructor() {}

    public makeSUV(builder: Builder) {
      builder.reset();
      builder.setSeats(5);
      builder.setEngine("SUV engine");
      builder.setTripComputer(true);
      builder.setGPS(true);
    }

    public makeSportsCar(builder: Builder) {
      builder.reset();
      builder.setSeats(2);
      builder.setEngine("Sports engine");
      builder.setTripComputer(true);
      builder.setGPS(true);
    }

    public makeFamilyCar(builder: Builder) {
      builder.reset();
      builder.setSeats(4);
      builder.setEngine("Family engine");
      builder.setTripComputer(true);
      builder.setGPS(true);
    }

    public makePoorCar(builder: Builder) {
      builder.reset();
      builder.setSeats(2);
      builder.setEngine("Poor engine");
      builder.setTripComputer(false);
      builder.setGPS(false);
    }
  }

  export class Invoker {
    public run() {
      const director = new Director();
      const carBuilder = new CarBuilder();
      const manualBuilder = new CarManualBuilder();
      director.makeSUV(carBuilder);
      director.makeSUV(manualBuilder);
      const car = carBuilder.getResult();
      const manual = manualBuilder.getResult();
      console.log(car.toString());
      console.log(manual.toString());
    }
  }
}

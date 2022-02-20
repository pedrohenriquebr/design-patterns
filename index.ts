import { Builder, Observer, Strategy } from "./patterns";
import * as prompts from 'prompts';
import { Patterns } from "./enums/patterns";

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'pattern',
    message: 'Pick a pattern to execute',
    choices: [
      { title: 'Observer', value: Patterns.Observer },
      { title: 'Strategy', value: Patterns.Strategy },
      { title: 'Builder', value: Patterns.Builder },
    ],
  });

  switch (response.pattern) {
    case Patterns.Observer:
      new Observer.Invoker().run();
      break;
    case Patterns.Strategy:
      new Strategy.Invoker().run();
      break;
    case Patterns.Builder:
      new Builder.Invoker().run();
      break;
    default:
      throw new Error("Unknown type");
  } 
})();
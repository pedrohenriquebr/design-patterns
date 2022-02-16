import { FAKE_NEWS } from "./mock";
import { Emojis } from "./enums";
export namespace Observer {
  export interface Observable<T> {
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
    notify(value: T): void;
  }

  export type NewsContent = string;

  export class Subject implements Observable<NewsContent> {
    private observers: Observer<NewsContent>[] = [];
    private state: NewsContent;
    subscribe(observer: Observer<NewsContent>): void {
      this.observers.push(observer);
    }
    unsubscribe(observer: Observer<NewsContent>): void {
      this.observers = this.observers.filter((obs) => obs !== observer);
    }
    notify(value: NewsContent): void {
      this.state = value;
      this.observers.forEach((observer) => observer.update(value));
    }

    mainBusinessLogic(): void {
      const id = setInterval(() => {
        const content: NewsContent =
          FAKE_NEWS[Math.floor(Math.random() * FAKE_NEWS.length)];
        // random time
        const time = Math.random() * 250;
        setTimeout(() => {
          this.notify(content);
        }, time);
      }, 500);

      setTimeout(() => {
        clearInterval(id);
      }, 10000);
    }
  }

  export interface Observer<T> {
    update(value: T): void;
  }

  export class RadioStation implements Observer<NewsContent> {
    constructor(private news: Subject) {
      this.news.subscribe(this);
    }
    update(value: NewsContent): void {
      console.log(
        `Radio station ${Emojis.RADIOSTATION}: \n\tWe have a news from CNN with the following content: ${value}\n`
      );
    }
  }

  export class Newspaper implements Observer<NewsContent> {
    constructor(private news: Subject) {
      this.news.subscribe(this);
    }
    update(value: NewsContent): void {
      console.log(`Newspaper ${Emojis.NEWS}: \n\t${value} (CNN News)\n`);
    }
  }

  export class GossipyNeighbor implements Observer<NewsContent> {
    constructor(private news: Subject) {
      this.news.subscribe(this);
    }

    update(value: NewsContent): void {
      console.log(
        `Gossipy neighbor ${Emojis.GOSSIPYNEIGHBOR}: \n\tI heard about this news: ${value}`
      );
    }
  }

  export class Invoker {
    run() {
      const news = new Subject();
      const radioStation = new RadioStation(news);
      const newspaper = new Newspaper(news);
      const gossipyNeighbor = new GossipyNeighbor(news);
      console.log("Starting the news");
      news.mainBusinessLogic();
    }
  }
}

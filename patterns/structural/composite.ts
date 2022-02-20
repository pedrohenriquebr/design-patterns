export namespace Composite.Example {
    export interface Component {
        execute(): string;
    }

    export class Leaf implements Component {
        execute(): string {
            return "Leaf";
        }
    }

    export class Composite implements Component {
        private children: Component[] = [];

        constructor(public name: string) { }

        execute(): string {
            let result = `Composite: ${this.name}\n`;
            for (let i = 0; i < this.children.length; i++) {
                result += this.children[i].execute() + "\n";
            }
            return result;
        }

        add(component: Component): void {
            this.children.push(component);
        }

        remove(component: Component): void {
            let componentIndex = this.children.indexOf(component);
            if (componentIndex !== -1) {
                this.children.splice(componentIndex, 1);
            }
        }
    }
}

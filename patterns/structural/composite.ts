import * as fs from "fs";
import * as path from "path";
import glob from "glob";
import prompts from "prompts";
export namespace Composite {
  export class Helpers {
    public static titleCase(rootName: string): string {
      const parts = rootName.split("-");
      let result = "";
      for (let i = 0; i < parts.length; i++) {
        result += parts[i][0].toUpperCase() + parts[i].substr(1);
      }
      return result;
    }
    public static indent(level: number): string {
      let result = "";
      for (let i = 0; i < level; i++) {
        result += " ";
      }
      return result;
    }

    public static indentString(content: string, level: number): string {
      // split into lines
      const lines = content.split("\n");
      let result = "";
      // for each
      for (let i = 0; i < lines.length; i++) {
        result += Helpers.indent(level) + lines[i] + "\n";
      }
      return result;
    }

    public static splitTitleCase(x: string): string[] {
      return (
        [...x]
          // @ts-ignore
          .map((d, idx) => (d < {} ? idx : -1)) // filter upper case
          .filter((d) => d >= 0) // index of each character
          .map((el, idx, arr) =>
            x.slice(el, idx + 1 > arr.length ? -1 : arr[idx + 1])
          )
      );
    }

    // a function that transforms a string into valid typescript filename (without extension)
    // Eg. "ConfigurationsEmployeeSearch" => "configurations-employee-search"
    public static toFileName(x: string): string {
      return this.splitTitleCase(x)
        .map((d) => d.toLocaleLowerCase())
        .join("-");
    }

    public static listDir(filePath: string) {
      const files = fs.readdirSync(filePath);
      return files;
    }
  }
  export interface Component {
    execute(): string;
    name: string;
  }

  export class ClassLeaf implements Component {
    private content: string = "";
    public name: string = "";
    public superClassName: string = "";

    constructor(name: string, content: string) {
      this.content = content;
      this.name = name;
    }

    public setSuperClassName(superClassName: string) {
      this.superClassName = superClassName;
    }

    execute(): string {
      let result = "";
      result += `export class ${this.name} ${
        this.superClassName.length > 0 ? "extends " + this.superClassName : ""
      }{\n`;
      result += Helpers.indentString(this.content, 2);
      result += "}\n";
      return result;
    }
  }

  export class NameSpaceContainer implements Component {
    private children: Component[] = [];

    constructor(public name: string) {}

    public add(component: Component) {
      this.children.push(component);
    }

    public contains(name: string) {
      return this.children.find((x) => x.name === name) !== undefined;
    }

    public execute(): string {
      let result = "";
      result += `export namespace ${this.name} {\n`;
      this.children.forEach((child) => {
        result += Helpers.indentString(child.execute(), 2);
      });
      result += `}\n`;
      return result;
    }
  }
  export class NameSpaceBuilder {
    constructor() {}
    private flatNameSpaces: Map<string, Component> = new Map();
    private lastNameSpace: string[] = [];

    public build(filePath: string): NameSpaceContainer {
      // const paths = glob.sync(filePath + "/**/*.model.ts");
      const paths = glob.sync(filePath + "/*");
      const rootName = Helpers.titleCase(filePath.split("/").pop() as string);
      const rootNamespace = new NameSpaceContainer(rootName);
      paths.forEach((path) => {
        // check if file is a directory
        if (fs.lstatSync(path).isDirectory()) {
          this.lastNameSpace.push(rootName);
          const nameSpace = this.build(path);
          this.lastNameSpace.pop();
          rootNamespace.add(nameSpace);
        } else {
          const [leaf, ...namespaces] = this.processModelFile(path, rootName);
          // rootNamespace.add(leaf);
          if (namespaces.length == 0) {
            rootNamespace.add(leaf);
          } else {
            let result = (namespaces
              .map((n) => {
                if (this.flatNameSpaces.has(n.name)) {
                  return this.flatNameSpaces.get(n.name);
                }
                this.flatNameSpaces.set(n.name, n);
                return n;
              }) as NameSpaceContainer[])
              .reduce((prev, cur) => {
                if (prev.contains(cur.name)) {
                  return cur;
                }

                prev.add(cur);
                return cur;
              }, rootNamespace);
            result.add(leaf);
          }
        }
      });

      return rootNamespace;
    }
    public processModelFile(path: string, rootNameSpace: string): Component[] {
      const content = fs.readFileSync(path, "utf8");
      const lines = content.split("\n").map((d) => d.trim());
      const regexDeclaration =
        /((export)(\s)+(class|interface)(\s)*)(\w.+)(((extends|implements)(\s)*)(\w.+))*{/gm;

      let className = "";
      let superClassName = "";
      let m;

      while ((m = regexDeclaration.exec(content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regexDeclaration.lastIndex) {
          regexDeclaration.lastIndex++;
        }

        // get 6th group
        const temp = m[6].trim();

        if (temp.indexOf("extends") > -1) {
          className = temp.split("extends")[0].trim();
          superClassName = temp.split("extends")[1].trim();
        } else {
          className = temp;
          superClassName = "";
        }
      }

      const classContent = lines
        .slice(lines.findIndex((d) => d.indexOf("{")) + 1, lines.indexOf("}"))
        .join("\n");
      if (className == rootNameSpace) {
        return [new ClassLeaf(className, classContent)];
      }

      if (className.indexOf(rootNameSpace) > -1) {
        className = className.replace(rootNameSpace, "");
        if (this.lastNameSpace.length > 0) {
          className = this.lastNameSpace.reduce((prev, cur) => {
            return prev.replace(cur, "");
          }, className);
        }
      }

      const names = Helpers.splitTitleCase(className);
      const { length, [length - 1]: last } = names;
      const leaf = new ClassLeaf(last, classContent);
      const nameSpaces = names
        .slice(0, length - 1)
        .map((name) => new NameSpaceContainer(name));
      leaf.setSuperClassName(superClassName);
      return [leaf, ...nameSpaces];
    }

   
  }

  export class FileStream {
    private builder = new NameSpaceBuilder();
    constructor(builder: NameSpaceBuilder) {
      this.builder = builder;
    }
    public saveToFile(srcPath: string, outDir: string) {
      // list dir and get all dirs
      const files = Helpers.listDir(srcPath);
      const nameSpaces = files.map((file) => {
        // check if file is a directory
        if (!fs.lstatSync(srcPath + "/" + file).isDirectory()) {
          return null;
        }
        return this.builder.build(srcPath + "/" + file);
      });

      nameSpaces.forEach((ns) => {
        if (!ns) return;
        const fullPath = path.join(
          path.resolve(outDir),
          Helpers.toFileName(ns.name) + ".model.ts"
        );
        fs.writeFileSync(fullPath, ns.execute());
      });
    }

  }


  export class Invoker {
    public run(){
      (async () => {
        const path  = await prompts({
          type: "text",
          name: "path",
          message: "Enter path to the directory containing the models"
        });

        const outDir = await prompts({
          type: "text",
          name: "outDir",
          message: "Enter path to the directory where the models will be saved"
        });

        const builder = new NameSpaceBuilder();
        // const fileStream = new FileStream(builder);
        const dirs = Helpers.listDir(path.path);

        const response = await prompts({
          type: "select",
          name: "model",
          message: "Pick a model",
          choices: [
            { title: "All", value: "all" },
            ...dirs.map((d) => {
              return { title: d, value: d };
            })
          ],
        });

        if (response.model == "all") {
          new FileStream(builder).saveToFile(path.path, outDir.outDir);
        } else {
          // do nothing
        }
      
      })()
    }
  }
}

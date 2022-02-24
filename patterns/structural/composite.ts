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
    public name: string = "";
    public superClassName: string = "";
    private content: string = "";
    private fullQualifiedName: string[] = [];

    constructor(name: string, content: string) {
      this.content = content;
      this.name = name;
    }

    public setSuperClassName(superClassName: string) {
      this.superClassName = superClassName;
    }

    /** Returns the full qualified name of the class based on namespaces
     *
     * Format: "Foo.Bar.Baz"
     * @param  {number} [level=0] - the level of the namespace.
     * @returns {string} full qualified name
     */
    public getFullQualifiedName(level: number = 0): string {
      return this.fullQualifiedName.slice(level).concat(this.name).join(".");
    }
    
    /** Set the full qualified name of the class based on namespaces
     * @param  {(string|NameSpaceContainer)[]} fullQualifiedName
     */
    public setFullQualifiedName(
      fullQualifiedName: (string|NameSpaceContainer)[]
    ) {
      this.fullQualifiedName = fullQualifiedName.map((d) => {
        if (typeof d === "string") {
          return d;
        } else {
          return d.name;
        }
      });
    }
    
    /** Returns if has a super class
     * @returns boolean
     */
    public get hasSuperClass(): boolean {
      return this.superClassName !== "";
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

    constructor(public name: string, children?: Component[]) {
      children && this.setChildren(children);
    }

    public add(component: Component) {
      this.children.push(component);
    }

    public setChildren(children: Component[]) {
      this.children = children;
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

    
    /** Generate a name space from a path
     * @param  {string} filePath
     * @param  {string[]=[]} models
     * @returns NameSpaceContainer
     */
    public build(filePath: string, models: string[] = []): NameSpaceContainer {
      // const paths = glob.sync(filePath + "/**/*.model.ts");
      let paths = glob.sync(filePath + "/*");
      const rootName = Helpers.titleCase(filePath.split("/").pop() as string);
      const rootNamespace = new NameSpaceContainer(rootName);
      if (models.length > 0) {
        paths = paths.filter((p) => models.indexOf(p) >= 0);
      }
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
            let result = (
              namespaces.map((n) => {
                if (this.flatNameSpaces.has(n.name)) {
                  return this.flatNameSpaces.get(n.name);
                }
                this.flatNameSpaces.set(n.name, n);
                return n;
              }) as NameSpaceContainer[]
            ).reduce((prev, cur) => {
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
    
    /** Generate a leaf from a path
     * 
     * Usage:
     * 
     * ```typescript
     * const [leaf, ...namespaces] = this.processModelFile(path, rootName);
     * ```
     * @param  {string} path a path to a model file
     * @param  {string} rootNameSpace a title case name of the root namespace
     * @returns an array of components, the first element is the leaf, the rest are namespaces
     */
    public processModelFile(path: string, rootNameSpace: string): [ClassLeaf, ...NameSpaceContainer[]] {
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
      
      // check if class name is equal to the namespace
      if (className == rootNameSpace) {
        return [new ClassLeaf(className, classContent)];
      }

      // check if class name contains the root namespace
      if (className.indexOf(rootNameSpace) > -1) {
        // clean up the class name
        className = className.replace(rootNameSpace, "");
        // check the last namespace names in the class name
        if (this.lastNameSpace.length > 0) {
          // clean up the classe name
          className = this.lastNameSpace.reduce((prev, cur) => {
            return prev.replace(cur, "");
          }, className);
        }
      }

      // split the class name by the namespace
      const names = Helpers.splitTitleCase(className).reverse();
      // the first element is the leaf
      const [last, ...rest] = names;
      const leaf = new ClassLeaf(last, classContent);
      const nameSpaces = rest.reverse().map((name) => new NameSpaceContainer(name));
      leaf.setSuperClassName(superClassName);
      leaf.setFullQualifiedName([...this.lastNameSpace, ...nameSpaces]);
      return [leaf, ...nameSpaces];
    }
  }

  export class FileStream {
    private builder = new NameSpaceBuilder();
    private nameSpaces: NameSpaceContainer[];
    constructor(builder: NameSpaceBuilder) {
      this.builder = builder;
    }
    public saveToFile(srcPath: string, outDir: string, models: string[] = []) {
      // list dir and get all dirs
      const files = Helpers.listDir(srcPath);
      const nameSpaces = files.map((file) => {
        // check if file is a directory
        if (!fs.lstatSync(srcPath + "/" + file).isDirectory()) {
          return null;
        }
        return this.builder.build(srcPath + "/" + file, models);
      });

      nameSpaces.forEach((ns) => {
        if (!ns) return;
        const fullPath = path.join(
          path.resolve(outDir),
          Helpers.toFileName(ns.name) + ".model.ts"
        );
        fs.writeFileSync(fullPath, ns.execute());
        this.nameSpaces.push(ns);
      });
    }

    public setNameSpaces(nameSpaces: NameSpaceContainer[]) {
      this.nameSpaces = nameSpaces;
    }
    /** Update all the references
     * @param  {string} srcPath the path to the source directory
     */
    public updateReferences(srcPath: string){
      // find all files in the directory
      const paths = glob.sync(srcPath + "/**/*.ts", {
        nodir: true,
        ignore: [srcPath+"**/*.model.ts"],
      });
      // find all the references
      const references = paths.forEach(cur => {
        const content = fs.readFileSync(cur, "utf8");
        
      });

    }
  }

  export class Invoker {
    public run() {
      (async () => {
        const path = await prompts({
          type: "text",
          name: "path",
          message: "Enter path to the directory containing the models",
        });

        const outDir = await prompts({
          type: "text",
          name: "outDir",
          message: "Enter path to the directory where the models will be saved",
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
            }),
          ],
        });

        if (response.model == "all") {
          new FileStream(builder).saveToFile(path.path, outDir.outDir);
        } else {
          new FileStream(builder).saveToFile(path.path, outDir.outDir, [...response.model]);
        }
      })();
    }
  }
}

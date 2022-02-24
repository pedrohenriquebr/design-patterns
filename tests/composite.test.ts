import * as fs from "fs";
import { Composite } from "./../patterns";
/**
 * I need a split up a class name model into hierarchical parts from models directory.
 *
 * Eg.
 * ```typescript
 *      export class ConfigurationsEmployeeSearch
 * ```
 * should be split into
 * ```typescript
 *
 * "Configurations", "Employee" and "Search".
 * ```
 * the result code should be:
 * ```typescript
 * export class ConfigurationsEmployeeSearch {
 *   public name: string;
 *   public departmentId: number;
 *   public roleId: number;
 * }
 *
 * ...
 *
 * export namespace Configurations {
 *  export namespace Employee {
 *   export class Search {
 *    public name: string;
 *    public departmentId: number;
 *    public roleId: number;
 *   }
 *  }
 * }
 * ```
 */
const ROOT_DIR = "./tests/assets/app/pages/models/";
const TEMP_DIR = "./tests/assets/temp/";
const ROOT_NAME_SPACE = "BussinessLogic";

let obj = new Composite.NameSpaceBuilder();
beforeEach(() => {
  obj = new Composite.NameSpaceBuilder();
});

// List directory contents
it("List directory contents", () => {
  const files = Composite.Helpers.listDir(ROOT_DIR);
  expect(files.length).toBe(1);
  expect(files[0]).toBe("bussiness-logic");
});

// find all files in directory with format [bussiness-logic-foo-bar].model.ts

describe("Helpers", () => {
  it("split title case name ", () => {
    expect(
      Composite.Helpers.splitTitleCase("ReturnRepairPendingCollectionResult")
    ).toStrictEqual(["Return", "Repair", "Pending", "Collection", "Result"]);
  });

  it("BussinessLogic into bussiness-logic", () => {
    expect(Composite.Helpers.toFileName("BussinessLogic")).toBe(
      "bussiness-logic"
    );
  });
});
describe("find all files in directory with format [bussiness-logic-foo-bar].model.ts", () => {
  const rootTree = obj.build(ROOT_DIR + "bussiness-logic");
  it('The root namespace should be "BussinessLogic"', () => {
    expect(rootTree.name).toBe("BussinessLogic");
  });

  it('The file has to be "bussiness-logic.model.ts"', () => {
    new Composite.FileStream(obj).saveToFile(ROOT_DIR,TEMP_DIR);
    // check if the file exists
    expect(fs.existsSync(TEMP_DIR + "bussiness-logic.model.ts")).toBe(true);
  });
});

describe('Test the leaf components', () => {
  const ROOT_MODEL_DIR = "./tests/assets/app/pages/models/bussiness-logic/pending-collection/";
  const ROOT_NAME_SPACE = "PendingCollection";
  const mock = { 
    lastNameSpace : ['BussinessLogic', 'PendingCollection', 'InnerBussiness'],
    flatNameSpaces: new Map()
  }
  const mockedFunction = obj.processModelFile.bind(mock);
  const [leaf, ...namespaces] = mockedFunction(ROOT_MODEL_DIR + 'inner-bussiness/bussiness-logic-pending-collection-inner-bussiness-example.model.ts', ROOT_NAME_SPACE);
  it('The leaf name should be "Example"', () => {
    expect(leaf.name).toBe("Example");
  });

  it("The returned namespaces array should be ['Foo','Bar']", () => {
    expect(namespaces.map(x => x.name)).toStrictEqual(['Foo','Bar']);
  });

  it('the superclasse name should be "Example2"', () => {
    expect(leaf.superClassName).toBe("Example2");
  });

  it("Check The full qualified class name with many levels", () => {
    const fullName  = "BussinessLogic.PendingCollection.InnerBussiness.Foo.Bar.Example";
    const getFullName = x => fullName.split('.').slice(x).join('.');
    expect(leaf.getFullQualifiedName()).toBe(fullName);
    expect(leaf.getFullQualifiedName(0)).toBe(fullName);
    //PendingCollection.InnerBussiness.Foo.Bar.Example
    expect(leaf.getFullQualifiedName(1)).toBe(getFullName(1));
    //InnerBussiness.Foo.Bar.Example
    expect(leaf.getFullQualifiedName(2)).toBe(getFullName(2));
    //Foo.Bar.Example
    expect(leaf.getFullQualifiedName(3)).toBe(getFullName(3));
    //Bar.Example
    expect(leaf.getFullQualifiedName(4)).toBe(getFullName(4));
    //Example
    expect(leaf.getFullQualifiedName(5)).toBe(getFullName(5));

  });
  
});

// for each file:
// find the class definition and split the class name into parts
// 1. create a namespace for each part, exclude the last part
// 2. create a class for the last part
// 3. if the class name matches the directory name, add it to the namespace
// 4. if the class name does not match the directory name, add it to the last namespace

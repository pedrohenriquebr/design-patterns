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
const TEMP_DIR = "./tests/temp/";
let obj = new Composite.NameSpaceBuilder();
beforeAll(() => {
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
// for each file:
// find the class definition and split the class name into parts
// 1. create a namespace for each part, exclude the last part
// 2. create a class for the last part
// 3. if the class name matches the directory name, add it to the namespace
// 4. if the class name does not match the directory name, add it to the last namespace

import * as fs from "fs";
import glob, { sync } from 'glob';
import { Composite } from "./../patterns";
const { NameSpaceContainer, ClassLeaf } = Composite;
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
const APP_ROOT_DIR  = './tests/assets/app/';


jest.mock('fs', () => {
  const fs = jest.requireActual('fs');
  return {
    ...fs,
    'readFileSync': jest.fn((...args) => {
      if(global.enabled_mock){
        return null;
      }
      return fs.readFileSync(...args);
    }),
    'writeFileSync': jest.fn((...args) => {
      if(global.enabled_mock){
        return null;
      }
      return fs.writeFileSync(...args);
    })
  };
});

jest.mock('glob', () => {
  const glob = jest.requireActual('glob');
  return {
    ...glob,
    'sync': jest.fn((...args) => {
      if(global.enabled_mock){
        return null;
      }
      return glob.sync(...args);
    })
  };
});



let obj = new Composite.NameSpaceBuilder();

beforeEach(() => {
  obj = new Composite.NameSpaceBuilder();
  global.enabled_mock = false;
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

  it('to title case', () => {
    expect(Composite.Helpers.titleCase("bussiness-logic")).toBe('BussinessLogic');
  });

  it('indent line', () => {
    const line  = 'O Rebolation, tion. O rebolation.';
    expect(Composite.Helpers.indent(2) + line).toBe(`  ${line}`);
  });

  it('indent multiple lines', () => {
    const lines = 'Rebolation é bom! Bom!\n'+
    'Rebolation é bom! Bom! Bom!\n'+
    'Rebolation é bom! Bom!\n'+
    'Se você fizer fica melhor';

    const expected = '  Rebolation é bom! Bom!\n'+
    '  Rebolation é bom! Bom! Bom!\n'+
    '  Rebolation é bom! Bom!\n'+
    '  Se você fizer fica melhor\n';
    
    expect(Composite.Helpers.indentString(lines, 2)).toBe(expected);
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

  it('Set the full qualified class and checks if it is the same', () => {
    const fullName  = ["Hero","SpiderMan", new Composite.NameSpaceContainer("PeterParker"), "Marvel"];
    leaf.setFullQualifiedName(fullName);
    expect(leaf.getFullQualifiedName()).toBe('Hero.SpiderMan.PeterParker.Marvel.Example');
  });
  

  it('check the content ', () => {
    expect(leaf.execute()).toBe('export class Example extends Example2{\n'+ 
      '  projectName: string;\n'+
      '  statusId?: number;\n'+'}\n');
  });
});


describe("Change references ", () => {
  const stream = new Composite.FileStream(obj);
  let fileContent =
    "import { BussinessLogicPendingCollectionInnerBussinessFooBarExample }" +
    "from './models/bussiness-logic/pending-collection/inner-bussiness/bussiness-logic-pending-collection-inner-bussiness-example.model';\n" +
    "\n\npublic doSomethig(model: BussinessLogicPendingCollectionInnerBussinessFooBarExample) {\n" +
    "  return model.projectName;\n" +
    "}\n";

  const expectedFileContent =
    'import { BussinessLogic }from \'./models/bussiness-logic.model\';\n' +
    "\n\npublic doSomethig(model: BussinessLogic.PendingCollection.InnerBussiness.Foo.Bar.Example) {\n" +
    "  return model.projectName;\n" +
    "}\n";
  const readFileMock = fs.readFileSync as jest.MockedFunction<
    typeof fs.readFileSync
  >;
  const writeFileMock = fs.writeFileSync as jest.MockedFunction<
    typeof fs.writeFileSync
  >;
  const syncMock = glob.sync as jest.MockedFunction<typeof glob.sync>;
  const leaf = new ClassLeaf(
    "Example",
    "public name: string;\npublic goals: number;\n"
  );
  const rootTree = new NameSpaceContainer("BussinessLogic", [
    new NameSpaceContainer("PendingCollection", [
      new NameSpaceContainer("InnerBussiness", [
        new NameSpaceContainer("Foo", [
          new NameSpaceContainer("Bar", [
            leaf        
          ]),
        ]),
      ]),
    ]),
  ]);

  beforeEach(() => {
    global.enabled_mock = true;
    leaf.setFullQualifiedName([
      "BussinessLogic",
      "PendingCollection",
      "InnerBussiness",
      "Foo",
      "Bar",
    ]);

    leaf.setOriginalName('BussinessLogicPendingCollectionInnerBussinessFooBarExample');

    writeFileMock.mockImplementation((path, content) => {
      fileContent = content as string;
    });
    readFileMock.mockReturnValue(fileContent);
    stream.setNameSpaces([rootTree]);
    syncMock.mockReturnValue(['./tests/assets/app/pages/app.component.ts']);
    obj = new Composite.NameSpaceBuilder();
    obj.setFlatLeafs(new Map<string, Composite.Component>([
      ['BussinessLogicPendingCollectionInnerBussinessFooBarExample', leaf]
    ]));
    stream.setFlatLeafsPaths(new Map([
      ['BussinessLogicPendingCollectionInnerBussinessFooBarExample', {
        component: leaf,
        path: './tests/assets/app/pages/models/bussiness-logic.model.ts'
      }]
    ]))
  });


  it('check the content ', () => {
    expect(fs.readFileSync('foobar', 'utf8')).toBe(fileContent);
  });

  it("update references", () => {
    // mock the function readFileSync
    stream.updateReferences(APP_ROOT_DIR);
    expect(fileContent).toBe(expectedFileContent);
  });
});

// for each file:
// find the class definition and split the class name into parts
// 1. create a namespace for each part, exclude the last part
// 2. create a class for the last part
// 3. if the class namen m'aches the directory name, add it to the namespace
// 4. if the class name does not match the directory name, add it to the last namespace

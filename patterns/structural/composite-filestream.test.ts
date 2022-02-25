
import * as fs from 'fs';
import { Composite } from '..';

const ROOT_DIR = "./tests/assets/app/pages";
const MODELS_DIR = "./tests/assets/app/pages/models";
const TEMP_DIR = "./tests/assets/temp/";
const MOCK_DIR  = "./tests/mocks";
const OUTPUT_FILE = `${TEMP_DIR}/bussiness-logic.model.ts`;
const GENERATED_FILE = `${TEMP_DIR}/app.component.ts`;
const MOCK_FILE = `${MOCK_DIR}/app.component.expect.ts`;

const answers = {
  path : MODELS_DIR,
  confirmReplace: true,
  sourcePath: ROOT_DIR,
  outDir: TEMP_DIR,
  model: "all"
};

const builder = new Composite.NameSpaceBuilder();
const fileStream = new Composite.FileStream(builder);


jest.mock('fs', () => {
  const fs = jest.requireActual('fs');
  return {
    ...fs,
    'writeFileSync': jest.fn((...args) => {
      args[0] = GENERATED_FILE;
      return fs.writeFileSync(...args);
    })
  };
});
describe('Check if the file was created correctly', () => {

  beforeEach(()=> {
    fileStream.saveToFile(answers.path, answers.outDir);
    fileStream.updateReferences(answers.sourcePath);
  });
  
  it("check if the file was created correctly", () => {
    expect(fs.existsSync(OUTPUT_FILE)).toBe(true);
    const content  = fs.readFileSync(OUTPUT_FILE, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  it('Check if content is equal to expected file', () => {
    const content  = fs.readFileSync(GENERATED_FILE, 'utf8');
    const expected = fs.readFileSync(MOCK_FILE, 'utf8');
    expect(content).toBe(expected);
  });
});

import fs from 'fs';
import { Composite } from './../patterns';

const ROOT_DIR = "./tests/assets/app/pages";
const MODELS_DIR = "./tests/assets/app/pages/models";
const TEMP_DIR = "./tests/assets/temp/";
const OUTPUT_FILE = `${TEMP_DIR}/bussiness-logic.model.ts`;
const answers = {
  path : MODELS_DIR,
  confirmReplace: true,
  sourcePath: ROOT_DIR,
  outDir: TEMP_DIR,
  model: "all"
};

const builder = new Composite.NameSpaceBuilder();
const fileStream = new Composite.FileStream(builder);

afterAll(() => {
  fs.rmSync(OUTPUT_FILE);
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
});
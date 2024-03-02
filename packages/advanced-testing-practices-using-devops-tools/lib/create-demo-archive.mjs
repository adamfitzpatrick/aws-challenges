import archiver from 'archiver';
import * as fs from 'fs';
import { resolve, normalize } from 'path';

const __dirname = import.meta.dirname;
const OUTPUT_PATH = resolve(__dirname, '../dist');
const OUTPUT_FILENAME = 'demoEnv.zip';
const INPUT_PATH = resolve(__dirname, './demo-files');
const INPUT_FILES = {
  'calculator.zip': [],
  'functions.zip': [
    'cfn_validate_lambda.py',
    'index.mjs'
  ],
  'cicd-template.yml': []
};

fs.mkdirSync(OUTPUT_PATH, { recursive: true });
const outputFile = resolve(OUTPUT_PATH, OUTPUT_FILENAME);
const output = fs.createWriteStream(resolve(OUTPUT_PATH, OUTPUT_FILENAME));

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log(`Demo archive has been finalized as ${normalize(outputFile)}`);
});

output.on('end', function() {
  console.log('Data has been drained');
});

function setListeners(archive) {
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err)
    } else {
      throw err;
    }
  });
  
  archive.on('error', function(err) {
    throw err;
  });
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', data => {
      if (typeof data === 'string') {
        chunks.push(Buffer.from(data, 'utf-8'));
      } else if (data instanceof Buffer) {
        chunks.push(data);
      } else {
        const jsonData = JSON.stringify(data);
        chunks.push(Buffer.from(jsonData, 'utf-8'));
      }
    });
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}

async function createArchive(inputFileNames) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  setListeners(archive);

  inputFileNames.forEach(filename => {
    archive.file(resolve(INPUT_PATH, filename), { name: filename });
  });

  archive.finalize();
  return streamToBuffer(archive);
}

const archive = archiver('zip', { zlib: { level: 9 }});
archive.pipe(output);
setListeners(archive);

await Promise.all(Object.keys(INPUT_FILES).map(async fileName => {
  let stream;
  if (INPUT_FILES[fileName].length !== 0) {
    stream = await createArchive(INPUT_FILES[fileName]);
  } else {
    const file = resolve(INPUT_PATH, fileName);
    stream = fs.createReadStream(file);
  }
  archive.append(stream, { name: fileName });
  return Promise.resolve();
}));

archive.finalize();

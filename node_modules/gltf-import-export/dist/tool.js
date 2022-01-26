#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const yargs = require("yargs");
const argv = yargs
    .usage('Usage: $0 <file> [options]')
    .demandCommand(1)
    .option('output', {
    alias: 'o',
    describe: 'Output filename'
})
    .help('help')
    .alias('help', 'h').argv;
const getOutputFilename = (argv) => {
    const inputFile = argv._[0];
    let outputFile = argv.output;
    if (!outputFile) {
        const baseName = inputFile.substring(0, inputFile.lastIndexOf('.'));
        if (inputFile.endsWith('.gltf')) {
            outputFile = baseName + '.glb';
        }
        else if (inputFile.endsWith('.glb')) {
            outputFile = baseName + '.gltf';
        }
    }
    return outputFile;
};
const inputFile = argv._[0];
if (inputFile.endsWith('.gltf')) {
    index_1.ConvertGltfToGLB(inputFile, getOutputFilename(argv));
}
else if (inputFile.endsWith('.glb')) {
    index_1.ConvertGLBtoGltf(inputFile, getOutputFilename(argv));
}
else {
    console.error('Please provide a .glb or a .gltf to convert');
    process.exitCode = 1;
}
//# sourceMappingURL=tool.js.map
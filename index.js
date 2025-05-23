#!/usr/bin/env node

const program = require("commander");
var fs = require("fs");
const funks = require("./funks");
path = require("path");
const colors = require("colors/safe");

program
  .description("Code generator for GraphQL server")
  .option(
    "-f, --jsonFiles <filesFolder>",
    "Folder containing one json file for each model"
  )
  .option(
    "-o, --outputDirectory <directory>",
    "Directory where generated code will be written"
  )
  .option(
    "-v, --verbose",
    "Show detailed messages about the results of running code generation process"
  )
  .option("-m, --migrations", "generate migrations", false)
  .option("-b, --noBasicCode", "does not generate basic code", false)
  .parse(process.argv);

const opts = program.opts();

//check input JSON files
if (!opts.jsonFiles) {
  //msg
  console.log(
    colors.red("! Error: "),
    "You must indicate the json files in order to generate the code."
  );
  process.exit(1);
}

//ops: output/input directories
let jsonFiles = opts.jsonFiles;
let directory = opts.outputDirectory || __dirname;
//msg
console.log("Input directory: ", colors.dim(path.resolve(jsonFiles)));
console.log("Output directory: ", colors.dim(path.resolve(directory)));

//op: verbose, migrations
let verbose = opts.verbose !== undefined ? true : false;
let migrations = opts.migrations;
let basicCode = !opts.noBasicCode;
//run codegen
funks.generateCode(opts.jsonFiles, directory, {
  verbose,
  migrations,
  basicCode,
});

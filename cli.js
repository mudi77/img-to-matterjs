#!/usr/bin/env node

let fsLocal = require('./fsLocal');
let entry = require('./index');

const cli_arg_config_path = process.argv[2];

if(!cli_arg_config_path){
    console.log("\n[img-to-matterjs] Error during init phase: Please provide path to the configuration file");
    return;
}

let outputJsonConfig = fsLocal.loadConfig(cli_arg_config_path);

if(!outputJsonConfig){
    console.log("\n[img-to-matterjs] Error during init phase: Configuration file not found");
    return;
}

entry(outputJsonConfig);


//TO DO: add simple help


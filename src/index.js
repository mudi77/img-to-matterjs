"use strict"

/*!
 * img-to-matterjs
 * Copyright (c) 2018 Igor Collak <colls.ems@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

let fs = require('./fsLocal');
let processImages = require('./processImages');
let extractVertices = require('./extractVertices');
let optimise = require('./optimise');
let utils = require('./utils');


/**
 * entry point  
 * 
 * @param config configuration object
 * 
 */
module.exports = async function imgToMatterjs(config){   
 
    //console.log("THIS IS OUR CONFIG: ", config); 
    utils.perfMon("start");  

    let imageList = await fs.load(config.input).catch((err) => {
        console.log("\n[img-to-matterjs] Error during image loading phase: ", err);

        process.exit();
    });          

    let imagesProcessed = await processImages(imageList, config).catch((err) => {
        console.log("\n[img-to-matterjs] Error during image processing phase: ", err);
    });

    let verticesExtracted = await extractVertices(imagesProcessed, config).catch((err) => {
        console.log("\n[img-to-matterjs] Error during vertices extraction phase: ", err);
    }); 


    let verticesOptimized = await optimise(verticesExtracted, config).catch((err) => {
        console.log("\n[img-to-matterjs] Error during vertices optimisation phase: ", err);
    }); 


    await fs.save(config.output, config.imgIsJson, verticesOptimized).catch((err) => {
        console.log("\n[img-to-matterjs] Error during files saving phase: ", err);
    }); 

}
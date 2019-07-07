let fs = require("fs");
let utils = require('./utils');
let pth = require('path');

/**
 * Load & Save:   
 * 
 * @param path path to do directory with imaged
 * @param path path to do output directory 
 * @param splitJson flag to decide whether one json will be produced or image/shape per json
 * @param data output content for json 
 * 
 */
let fsLocal = {
    load : (path) => {

        let imgList = [];                                             
        return new Promise((resolve, reject) => {  

            if(!path || path == "") reject("Wrong path to images directory !");

            try{
                fs.readdirSync( pth.resolve( path ) ).map((imgName) => {                         
                    let url = `${path}/${imgName}`;
                    let format = imgName.split('.')[1];

                    if(!fs.lstatSync(url).isDirectory() && format == "png" || format == "jpg"){      //SYNCHRONOUS READ                      

                        imgList.push({
                            "name": imgName.split('.')[0],
                            "url": url
                        });
                    };              
                });                
            }catch(err){
                reject("File not found or couldn't be accessed !");
            }
            resolve(imgList);
        });
    },

    loadConfig: (path) => {

        let outputJsonFile = undefined;

        try{
            outputJsonFile = fs.readFileSync( pth.resolve(path), 'utf8');
        }catch (err){
            //return new Error();
        }
        
        return outputJsonFile ? JSON.parse(outputJsonFile) : outputJsonFile;
    },

    save : (path, splitJson, data) => {   

        if(!data) return;   
        
        return new Promise((resolve, reject) => { 
        
            if(!path || path == "") return reject("Wrong path to output save directory !");

            path = pth.resolve(path);
            
            if(!splitJson){
                fs.writeFile(`${path}/shapesFile.json`, JSON.stringify(data, null, 2), () => {}, function(err) {
                    if(err) {                           
                        return reject("Output directory not found or couldn't be accessed !");
                    }                         
                        
                    console.log("The file was saved!");
                    utils.perfMon("stop");
                    resolve();
                });
            }else{
                

                data.map((img) => {

                    fs.writeFile(`${path}/${img.name}.json`, JSON.stringify([img], null, 2), () => {}, function(err) {
                        if(err) {
                            return reject("Output directory not found or couldn't be accessed !");
                        }            
                    }); 
                });
                    
                console.log("The files were saved!");
                utils.perfMon("stop");
                resolve();
            }
        });
    }
}

module.exports = fsLocal;
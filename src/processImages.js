let Canvas = require('canvas');  //TO DO:  whats this (index) ??
let utils = require('./utils');

/**
 * Process images:  check -> slice -> slice parts -> redraw to right position 
 * 
 * @param imageList array of loaded images.
 * @param conf input user configuration object
 * 
 */
module.exports = async function processImages(imageList, conf){
    if(!imageList) return;
    console.log("process runnig..");        

    this.createCanvasImage = async (img, callback) => {

        let checkAndRotate = (img) => {
            let ImgCanvas = Canvas.createCanvas(img.width, img.height);  
            let ctx = ImgCanvas.getContext("2d");
                ctx.drawImage(img,0,0);

            if(img.height > img.width){        
                
                console.log("new width: " + img.width, " new height: ", img.height);

                let canvas = Canvas.createCanvas(img.height, img.width);
                let ctx2 = canvas.getContext("2d"); 
                    ctx2.translate(img.height/2, img.width/2);
                    ctx2.rotate(90 * Math.PI/180);
                    ctx2.drawImage(img, -img.width/2, -img.height/2);

                    console.log("translated width: ", img.width/2, " height: ", img.height/2, "\n");
                          
                ImgCanvas = canvas;            
            }

            return ImgCanvas;
        };

        let tempImg = await Canvas.loadImage(img.url);    
            tempImg = checkAndRotate(tempImg);

        let tempIMG = {
            imgName: img.name,
            imgData: tempImg,
            x:  0,
            y:  0,
            width: tempImg.width,
            height: tempImg.height
        };

        tempImg.onload = function(){
            console.log("img onLoad !!");
        };            
             
        if(tempImg){    
            callback(null, tempIMG);                
        };
    };
    
    this.sliceImage = (img, conf, callback) => {
        console.log("\n*** IMAGE TO STRIPES ***");

        let canvas = Canvas.createCanvas(img.width, img.height);  
        let ctx = canvas.getContext("2d");
            ctx.drawImage(img.imgData, 0, 0);

        let x = 0, 
            step = Math.round(img.width * conf.splitBy), 
            stripes = [];           

        while(x < img.width){           
            let imgSlice = ctx.getImageData(x, 0, step, img.height);
            stripes.push(imgSlice);    
            x += step;            
        };           

        let imgInfo = {"name": img.imgName, "imgCanvas": img.imgData, "imgCtx": ctx, "width": img.width, "height": img.height, "imgStep": step, "stripes": stripes, "redrawed": {}, "data":[]};
        
        callback(null, imgInfo); 
    };

    let partImage = (img, callback) => {                
        let imgStripes = img.stripes;
        let ctx = img.imgCtx;                
        let stepSlice = 0;
        let newSlices = [];

        let checkBlack = (imgData, y, x, pixel) => {

            let r = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 0];
            let g = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 1];
            let b = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 2];
            let t = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 3];

            let pixelData = {
                r:r,
                g:g,
                b:b,
                t:t
            }

            if(pixel){
                pixelData["notWhite"] = (pixel.r + pixel.g + pixel.b) < 200 ? true : false;       //255 == WHITE !!!  - LESS THAN 500 SOMEWHAT DARK PIXEL
            }else{
                pixelData["notWhite"] = (r < 10 && g < 10 && b < 10) ? true : false;
            }
            
            return pixelData;
        }


        let detectContinuity = (imgData, yAxis, xAxis, depth, pixelInfo) => {
            let continueFactor = 0;

            for(let y = yAxis; y < (yAxis + depth); y++){      

                let blackPixel = checkBlack(imgData, y, xAxis, pixelInfo);

                if(blackPixel.notWhite){                                     //0 = BLACK / 255 = WHITE
                    continueFactor++;                        
                };
                
                if(continueFactor == depth){
                    return true;
                }      
            }   

            return false;
        }

        //ITERATE OVER RAW SLICES
        for(let i = 0; i < imgStripes.length; i++){                                     //ITERATING IMAGE STRIPES
            var sliceBitMap = imgStripes[i];                                       
            var square = { "height": 0, "width": sliceBitMap.width, "start": 0 };
            var inSubPart = false;
            var newSubSlices = [];

            for(let y=0; y < sliceBitMap.height; y++){                       //ITERATING IMAGE DATA BLOCK  
                for(let x=0; x < sliceBitMap.width; x++){                  
                                                                                                            
                    let pixelInfo = checkBlack(sliceBitMap, y, x, undefined);

                    if(pixelInfo.notWhite){          

                        if(detectContinuity(sliceBitMap, y, x, 5, pixelInfo)){          //NEXT SHOULD BE BLACK    
                                                                                            
                            if(!inSubPart){                                             //FIRST TIME OR INCREMENT 255 = WHITE          
                                inSubPart = true;                   
                                square.start = y;                                       //SAVE START OF SLICE PART 
                            }
                            break;
                        }                             
                    }else if(inSubPart && (x == (sliceBitMap.width-1))){                //DETECTION OF END EDGE                         
                        inSubPart = false;                 
                        square.height = (y - square.start);                             //height of block                                

                        let imgSliceBitMap = ctx.getImageData(stepSlice, square.start, sliceBitMap.width, square.height);     //original FULL img
                        let imgSliceBlock = { "data": imgSliceBitMap, "verticalPos": square.start};

                        newSubSlices.push(imgSliceBlock);
                        square = {};                                 
                        break;
                    };
                };

                if(y == (sliceBitMap.height -1) ) stepSlice += sliceBitMap.width;
            };    

            console.log("Founded parts [" + newSubSlices.length + "] for strip " + i);
            newSlices.push(newSubSlices);   
        };                                   
    
        img.stripes = newSlices;            
        callback(null,img);
    };

    let repositionImage = (img, callback) => {

        let imgStripes = img.stripes;
        let imgStep = img.imgStep;
        let imgHeight = img.height;         
        let redrawdParts = [];

        for(let i = 0; i < imgStripes.length; i++){ 
            let parts = imgStripes[i];      
            
            let subParts = [];
                    
            for(let p in parts){   

                let part = parts[p];
                let canvas = Canvas.createCanvas(imgStep, imgHeight); 
                let ctx = canvas.getContext("2d");                                                 

                ctx.beginPath();
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, imgStep, imgHeight);

                //DRAW IMG PART AT RIGHT POSITION                                                 
                ctx.putImageData(part.data, 0, part.verticalPos);                         
                                                                                        
                //GET WHOLE CANVAS DATA AND SAVE IT                                                         
                let finalSlicePart = ctx.getImageData(0, 0, imgStep, imgHeight);                                                                                                                
                subParts.push(finalSlicePart);
            };                                                                                        

            redrawdParts.push(subParts);
        };      

        img.redrawed = redrawdParts;
        callback(null,img);
    }
    

    let images = await utils.doJob([imageList], createCanvasImage);  

    let imagesSliced = await utils.doJob([images, conf], sliceImage);

    let imagesSlicedParted = await utils.doJob([imagesSliced], partImage);
      
    let imagesSlicedPartedRepositioned = await utils.doJob([imagesSlicedParted], repositionImage);
    

    return new Promise((resolve) => {
        resolve(imagesSlicedPartedRepositioned);
    })        
};



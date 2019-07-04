module.exports = async function extractVertices(images, config){
    
     runExtract = (imgs) => {
        if(!imgs) return;
        console.log("extraction runnig..");

        return new Promise((resolve) => {
            let getPixel = function(bitMap,col,row){    
                return {        
                    "pixel" : bitMap.data[((row * (bitMap.width * 4)) + (col * 4)) + 1],
                    "x" : col,
                    "y" : row
                }  
            }

            let bitMaploop = (bitMap, side, step) => {            
                let points = [];

                if(side == "top"){
                    for(let i = 0; i < bitMap.width; i++){

                        for(let j = 0; j < bitMap.height; j++){

                            let data = getPixel(bitMap, i, j);

                            if(typeof data.pixel != "undefined" && data.pixel != 255){
                                let point = { "x" : (step + i), "y" : j }; 
                                points.push(point);              

                                break;
                            }
                        }                    
                    }
                }else{
                    for(let i = 0; i < bitMap.width; i++){

                        for(let j = bitMap.height; j != 0; j--){   

                            let data = getPixel(bitMap, i, j);
                                
                            if(typeof data.pixel != "undefined" && data.pixel != 255){
                                let point = { "x" : (step + i), "y" : j }; 
                                points.push(point);              

                                break;
                            }
                        }                    
                    }
                }           

                return points;
            }

            let finalData = [];

            for(let i in imgs){
                let img = imgs[i];
                let stripes = img.redrawed;      
                let stripeShapes = [];
                let step = 0;

                for(let s in stripes){
                    let parts = stripes[s];
                    let shapeParts = [];

                    for(let p in parts){
                        let imgData = parts[p];

                        let shapePart = {
                            "bottom":{
                                "data":  bitMaploop(imgData, "bottom", step)
                            },
                            "top": {
                                "data": bitMaploop(imgData, "top", step)
                            }
                        }
                        shapeParts.push(shapePart)
                    }
                    stripeShapes.push(shapeParts);

                    step += img.imgStep;                    
                }
                img.data = stripeShapes;

                finalData.push({
                    "name" : img.name,
                    "data" : stripeShapes
                });

            }

           resolve(finalData);
        })

    }

    return runExtract(images);        
    
};

    

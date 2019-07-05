let utils = require('./utils');

module.exports = async function optimise(images, conf){

    let applyScale = (img, conf, callback) => {

        let scale = (vert, scaleFactor) => {
        
            if(scaleFactor != 1){
                vert.x = Math.floor(vert.x * scaleFactor);
                vert.y = Math.floor(vert.y * scaleFactor);
            }
    
            return vert;
        }

        let data = img.data;

        for(let i = 0; i < data.length; i++){

            let dataSlice = data[i];

            for(let n = 0; n < dataSlice.length; n++){

                let top = dataSlice[n].top.data;
                let bottom = dataSlice[n].bottom.data;

                let top_output = [];
                let bottom_output = [];

                top.forEach(element => {                  
                    top_output.push( scale(element, conf.scale) ); 
                });

                bottom.forEach(element => {
                    bottom_output.push( scale(element, conf.scale) );
                });

            dataSlice[n].top.data = top_output;
            dataSlice[n].bottom.data = bottom_output;
            }

        }    

        callback(null, img);
    }

    let applyPrecise = (img, conf, callback) => {

        let data = img.data;

        for(let i = 0; i < data.length; i++){

            let dataSlice = data[i];

            for(let n = 0; n < dataSlice.length; n++){

                let top = dataSlice[n].top.data;
                let bottom = dataSlice[n].bottom.data;

                let top_output = [];
                let bottom_output = [];     
                let pickThis = 0;                     

                if(conf.precise >= 0.5){

                    let prcs = Math.round( top.length  / Math.round( top.length * conf.precise ) );
                    console.log("precise step: " + prcs + " width:: " + top.length + " precise: " + conf.precise);   

                    for(let x in top){

                        if(pickThis == prcs){
                            pickThis = 0;
                            top_output.push( top[x] );
                            bottom_output.push( bottom[x] );
                        }

                        pickThis++;                        
                    };
                }else{                  

                    let inner_top = top.slice(1, top.length-1);
                    let inner_bottom = bottom.slice(1, bottom.length-1);
                    let impl = top.length >= 10 ? 2 : 0;
                    let prcs = Math.round( (top.length - impl)  / Math.round( (top.length * conf.precise ) - impl ) );
                    console.log("precise step: " + prcs + " width:: " + top.length + " precise: " + conf.precise);

                    for(let x in inner_top){

                        if(pickThis == prcs){
                            pickThis = 0;
                            top_output.push( inner_top[x] );
                            bottom_output.push( inner_bottom[x] );
                        }

                        pickThis++;                        
                    };

                    top_output.unshift( top[0] );
                    top_output.push( top.pop() );
                    bottom_output.unshift( bottom[0] );
                    bottom_output.push( bottom.pop() );
                }

                dataSlice[n].top.data = top_output;
                dataSlice[n].bottom.data = bottom_output;
            }

        }

        callback(null, img);
    }     

    let reducedPrecisedImages = conf.precise != 1 ? await utils.doJob([images, conf], applyPrecise) : images;     

    let scaledPrecisedImages = conf.scale != 1 ? await utils.doJob([reducedPrecisedImages, conf], applyScale) : images;

    return new Promise((resolve) => {
        resolve(scaledPrecisedImages);
    }) 

}
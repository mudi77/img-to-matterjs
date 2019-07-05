const util = require('util');

/**
 * Utils helper module   
 * 
 * @function perfMon simple performance function
 * @function doJob helper parallel iteration function 
 * @function fictiveJob helper test function
 * 
 */
let utils = {

    timeStart : 0,

    perfMon : (action) => {
        let timeDelta = 0;

        if(action == "start"){
            this.timeStart = new Date();
        }else{
            timeDelta = new Date((new Date() - this.timeStart));
            console.log(`\nConversion completed in ${timeDelta.getSeconds()} sec and ${timeDelta.getMilliseconds()} ms`);
        }
    },

    doJob : function(params, fn){

        let data = params[0];     
        let promises = [];
        
        for(i in data){
            let item = data[i];            
            const fn_ = util.promisify(fn);                
            params[1] ? promises.push( fn_(item, params[1])) : promises.push( fn_(item));
        }

        return new Promise((resolve) => {
            Promise.all(promises).then(res => {
                resolve(res);
            }).catch(err => {
                console.log("err:: ", err)
            })
        });

    },

    fictiveJob : async (mode) => {

        let wait = (time) => {            
            return new Promise(resolve => {
                setTimeout(resolve,time);        
            })
        };

        let testArray = ["one","two","three","four","five","six","seven","eight","nine","ten"];

        let fictiveTask = async (item, callback) => {
            let time = Math.floor( (Math.random() * 1000) + 10);
            
            await wait(time);
            callback(null, item);
        };

        return new Promise(async (resolve) => {

            if(mode){
                let resultA = [];
                resultA = await worker.workParalel([testArray],fictiveTask);

                console.log("RESULT paralel :: ", resultA.length + " and first " + resultA[0]);

                resolve(resultA);
            }else{            

                let resultB = [];
                for(let i in testArray){
                    resultB[i] = await fictiveTask(testArray[i], (test, data) => {

                    return data;
                    });
                }                             

                resolve(resultB); 
            }
        });
    },

    test : () => {
        let filedArray = ["one","two","three","four","five","six"];
        let emptyArray = [];
    }
}

module.exports = utils;

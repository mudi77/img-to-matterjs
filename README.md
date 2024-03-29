# Images to Matterjs

Images to [Matterjs](http://brm.io/matter-js/) (img-to-matterjs) is simple images transformation library. It transforms image(shape from image) into json file with matter js compatible vertices for creating custom matterjs physics objects.

# What it does
![Description](https://github.com/mudi77/img-to-matterjs/raw/master/itm.gif
)

# How it does
It loads images and convert into canvas image object then slice image then grab data bitmaps and iterate over to determine edge all founded sub blocks are redrawed to right position. Concave shape can be produced. Images are always processed horizontally so if image height > image width image is rotated. 

# Usage 

### Installation steps
```
npm install img-to-matterjs
```

### Input json Config example:
```
{
    "input": "./img/src",
    "output": "./output/jsons",
    "imgIsJson": false,
    "splitBy": 0.10,
    "scale": 1,
    "precise": 0.5
}
```
### Input json Config explained:
>**input**: images input directory

>**output**: json output directory

>**imgIsJson**: whether produce one json with all images or json per image

>**splitBy**: define thickness of one strip relative to image width value 0.1 means tenth of width

>**scale**: define scale factor value 1 means don't scale

>**precise**: defines how high detail (density) of vertices will be produced value 0.25 means reduction down to one quarter


### Run programatically 
```
let itm = require('img-to-matterjs');

let config = {
    "input": "./img/src",
    "output": "./output/jsons",
    "imgIsJson": false,
    "splitBy": 0.10,
    "scale": 1,
    "precise": 0.5
}

itm(config);
```
### Run via CLI

From within img-to-matterjs module run:
```
> npm run itm <path_to_config.json>
```



# Limitations

- only .png images supported for now
- only images on white background with black shape supported for now 
- only images with one shape continuous object supported for now
- it depends on [Node Canvas](https://github.com/Automattic/node-canvas) lib
- it requires at least node 8 

# Troubleshooting

- sometimes canvas lib has to be re-istalled/re-builded from its root directory

# Next features
                           
- simple CLI help
- detection of central continuous shape
- jpg support
- colored images support
                 


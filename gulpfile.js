"use strict";

const { series, parallel, src, dest, watch } = require('gulp');
const del = require('del');
var footer = require('gulp-footer');
const fs = require('fs');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
var source = require('vinyl-source-stream');
const { conflicts } = require('yargs');
const { type } = require('os');

// Set the Sass compiler to Dart Sass.
sass.compiler = require('sass');

// Import the package's JSON file.
var nodePackage = JSON.parse(fs.readFileSync('./package.json'));
// Get the package's current version number.
const version = nodePackage.version;

// Import the default JSON config file.
var defaults = JSON.parse(fs.readFileSync('src/h2.default.json'));

// Import the user's JSON config file.
var config = JSON.parse(fs.readFileSync('./src/stage/h2.config.json'));

// Clean Stage
function cleanCache() {
  return del([config.styles.path + '/hydrogen']);
}

// Create the Hydrogen folder in the user's specified style path.
function createHydrogen(done) {
  fs.mkdirSync(config.styles.path + '/hydrogen');
  done();
}

// Cached H2
// This is required because each config setting needs to update a single instance of the Hydrogen file, otherwise they each create their own and overwrite the last.
function cacheHydrogenCore() {
  return src('src/styles/core.scss')
    .pipe(dest(config.styles.path + '/hydrogen'));
}
function cacheHydrogenUtility() {
  return src('src/styles/utility.scss')
    .pipe(dest(config.styles.path + '/hydrogen'));
}

// Media
var mediaConfig = '';
var mediaStringStart = '$h2-map-media: ("base": "screen",';
var mediaStringContent = '';
var mediaStringEnd = ');';
var mediaSource;
if (config.media != null && config.media != undefined && config.media.length > 0) {
  mediaSource = config.media;
} else {
  mediaSource = defaults.media;
}
mediaSource.forEach(function(mediaQuery) {
  // console.log(mediaQuery);
var mediaString = '"' + mediaQuery.name + '": ' + '"screen and (min-width: ' + mediaQuery.value + ')",';
mediaStringContent = mediaStringContent.concat(mediaString);
  // console.log(mediaStringContent);
});
mediaConfig = mediaConfig.concat(mediaStringStart).concat(mediaStringContent).concat(mediaStringEnd);

function customMedia() {
  return src('src/styles/maps/_map-media.scss')
    .pipe(footer(mediaConfig))
    .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Color
var colorConfig = '';
var colorOpacityMap = {
  '[1]': '1',
  '[.9]': '-.1',
  '[.8]': '-.2',
  '[.7]': '-.3',
  '[.6]': '-.4',
  '[.5]': '-.5',
  '[.4]': '-.6',
  '[.3]': '-.7',
  '[.2]': '-.8',
  '[.1]': '-.9',
  '[0]': '-1'
};

var colorStringStart = '@use "sass:color"; $h2-map-color: (';
var colorStringContent = '';
var colorStringEnd = ');';
var colorSource;
if (config.colors != null && config.colors != undefined && config.colors.length > 0) {
  colorSource = config.colors;
} else {
  colorSource = defaults.colors;
}
colorSource.forEach(function(color) {
  var colorString = '"' + color.name + '": ' + color.color + ',';
  var colorLightString = '"[light]' + color.name + '": color.scale(' + color.color + ', $lightness: 25%),';
  var colorDarkString = '"[dark]' + color.name + '": color.scale(' + color.color + ', $lightness: -15%, $saturation: -10%),';
  var colorOpacityString = '';
  if (color.opacity != null && color.opacity != undefined && color.opacity == true) {
    // console.log('Color:', color.name, 'has opacity set to true!');
    for (let opacity in colorOpacityMap) {
      colorOpacityString = colorOpacityString + '"' + color.name + opacity + '": color.adjust(' + color.color + ', $alpha: ' + colorOpacityMap[opacity] + '),';
        // console.log('Color Opacity String: ', colorOpacityString);
      colorOpacityString = colorOpacityString + '"[light]' + color.name + opacity + '": color.scale(color.adjust(' + color.color + ', $alpha: ' + colorOpacityMap[opacity] + '), $lightness: 25%),';
      colorOpacityString = colorOpacityString + '"[dark]' + color.name + opacity + '": color.scale(color.adjust(' + color.color + ', $alpha: ' + colorOpacityMap[opacity] + '), $lightness: -15%, $saturation: -10%),';
    }
  }
  colorStringContent = colorStringContent.concat(colorString).concat(colorLightString).concat(colorDarkString).concat(colorOpacityString);
});
colorConfig = colorConfig.concat(colorStringStart).concat(colorStringContent).concat(colorStringEnd);

function customColor() {
  return src('src/styles/maps/_map-color.scss')
    .pipe(footer(colorConfig))
    .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Border Weights
var borderWeightsConfigSource;
var borderWeightMap = '$h2-map-border-weight: (';
var borderWeightMapStringStart = '';
var borderWeightMapStringContent = '';
var borderWeightMapStringEnd = ');';
if (config.borderWeights != null && config.borderWeights != undefined && config.borderWeights.length > 0) {
  borderWeightsConfigSource = config.borderWeights;
} else {
  borderWeightsConfigSource = defaults.borderWeights;
}
borderWeightsConfigSource.forEach(function(borderWeights) {
  var borderWeightsString = '"' + borderWeights.name + '": ' + borderWeights.weight + ',';
  borderWeightMapStringContent = borderWeightMapStringContent.concat(borderWeightsString);
});
borderWeightMap = borderWeightMap.concat(borderWeightMapStringStart).concat(borderWeightMapStringContent).concat(borderWeightMapStringEnd);

function buildBorderWeights() {
  return src('src/styles/maps/_map-border-weight.scss')
    .pipe(footer(borderWeightMap))
    .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Containers
var containersConfigSource;
var containerMap = '$h2-map-containers: ("full": "none",';
var containerMapStringStart = '';
var containerMapStringContent = '';
var containerMapStringEnd = ');';
if (config.containers != null && config.containers != undefined && config.containers.length > 0) {
  containersConfigSource = config.containers;
} else {
  containersConfigSource = defaults.containers;
}
containersConfigSource.forEach(function(containers) {
  var containersString = '"' + containers.name + '": "' + containers.maxWidth + '",';
  containerMapStringContent = containerMapStringContent.concat(containersString);
});
containerMap = containerMap.concat(containerMapStringStart).concat(containerMapStringContent).concat(containerMapStringEnd);

function buildContainers() {
  return src('src/styles/maps/_map-containers.scss')
    .pipe(footer(containerMap))
    .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Flex Grid
var flexgridEnabled = false;
var flexgridColumns = defaults.flexgrid.columns;
if (config.flexgrid != null && config.flexgrid != undefined && config.flexgrid.enabled == true) {
  console.log('Hydrogen: you\'ve successfully enabled flexgrid!');
  flexgridEnabled = true;
}
if (config.flexgrid.columns != null && config.flexgrid.columns != undefined) {
  console.log('Hydrogen: you\'ve set a custom grid column value!');
  flexgridColumns = config.flexgrid.columns;
}

// Move the flexgrid core file.
function moveFlexgridCore(done) {
  if (flexgridEnabled == true) {
    return src('src/styles/utilities/_core-flex-grid.scss')
      .pipe(dest(config.styles.path + '/hydrogen/utilities'));
  } else {
    done();
  }
}

// Modify the cached version of H2's core.
function enableFlexgridCore(done) {
  if (flexgridEnabled == true) {
    return src(config.styles.path + '/hydrogen/core.scss')
      .pipe(replace('// @use "utilities/core-flex-grid";', '@use "utilities/core-flex-grid";'))
      .pipe(dest(config.styles.path + '/hydrogen'));
  } else {
    done();
  }
}

// Move the flexgrid utility file.
function moveFlexgrid(done) {
  if (flexgridEnabled == true) {
    return src('src/styles/utilities/_utility-flex-grid.scss')
      // Set the column variable to the user's specification, or use the default.
      .pipe(replace('$h2GridColumns: 12;', '$h2GridColumns: ' + flexgridColumns + ';'))
      .pipe(dest(config.styles.path + '/hydrogen/utilities'));
  } else {
    done();
  }
}

// Modify the cached version of H2.
function enableFlexgrid(done) {
  if (flexgridEnabled == true) {
    return src(config.styles.path + '/hydrogen/utility.scss')
      .pipe(replace('// @use "utilities/utility-flex-grid";', '@use "utilities/utility-flex-grid";'))
      .pipe(dest(config.styles.path + '/hydrogen'));
  } else {
    done();
  }
}

// Font Family
var fontFace = "";
var fontFamilyConfigSource;
var fontFamilyMap = '$h2-map-font-families: (';
var fontFamilyMapStringStart = '';
var fontFamilyMapStringContent = '';
var fontFamilyMapStringEnd = ');';
if (config.fonts != null && config.fonts != undefined && config.fonts.length > 0) {
  fontFamilyConfigSource = config.fonts;
  // Font Face Styles
  fontFamilyConfigSource.forEach(function(fontFamily) {
    if (fontFamily.loadType == 'font-face' || fontFamily.loadType == 'fontFace') {
      var fontFaceCSSStringStart = '@font-face {';
      var fontFaceCSSStringContent = 'font-family: ' + fontFamily.name + '; src: url(' + fontFamily.url + ');';
      var fontFaceCSSStringEnd = '}';
      fontFace = fontFace.concat(fontFaceCSSStringStart).concat(fontFaceCSSStringContent).concat(fontFaceCSSStringEnd);
    }
  });
} else {
  fontFamilyConfigSource = defaults.fonts;
}
// Font Family Generation
fontFamilyConfigSource.forEach(function(fontFamily) {
  var fontFamilyString = '"' + fontFamily.name + '": "' + fontFamily.value + '",';
  fontFamilyMapStringContent = fontFamilyMapStringContent.concat(fontFamilyString);
});
fontFamilyMap = fontFamilyMap.concat(fontFamilyMapStringStart).concat(fontFamilyMapStringContent).concat(fontFamilyMapStringEnd);

function buildfontFamily() {
  return src('src/styles/maps/_map-font-families.scss')
    .pipe(footer(fontFamilyMap))
    .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Font Scale
function modifyFontScale(done) {
  if (config.fontScale != null && config.fontScale != undefined && config.fontScale > 0) {
    return src(config.styles.path + '/hydrogen/utility.scss')
      .pipe(replace('$h2-font-scale: 1.333;', '$h2-font-scale: ' + config.fontScale + ';'))
      .pipe(dest(config.styles.path + '/hydrogen'));
  } else {
    done();
  }
}

// Gradients
var gradientConfig = '';

if (config.gradients != null && config.gradients != undefined && config.gradients.length > 0) {
  // The user has specified their own gradients. There is no default alternative to this, because Hydrogen doesn't ship with gradients by default.
  var gradientStringStart = '@use "sass:color"; $h2-map-gradient: (';
  var gradientStringContent = '';
  var gradientStringEnd = ');';
  config.gradients.forEach(function(gradient) {
    var gradientType = gradient.type; 
    if (gradientType == "radial") {
      var radialColorStopKeys = 'radial';
      var radialColorStopColors = '';
      gradient.colorStops.forEach(function(color, index, array) {
        radialColorStopKeys = radialColorStopKeys + '[' + color.name + ']';
        if (index === array.length -1) {
          radialColorStopColors = radialColorStopColors + color.color;
        } else {
          radialColorStopColors = radialColorStopColors + color.color + ',';
        }
      });
      gradientStringContent = gradientStringContent + '"' + radialColorStopKeys + '": "radial-gradient(' + radialColorStopColors + ')",'
    } else if (gradientType == "linear") {
      var linearColorStopKeys = 'linear';
      var linearColorStopColors = '';
      gradient.colorStops.forEach(function(color, index, array) {
        linearColorStopKeys = linearColorStopKeys + '[' + color.name + ']';
        if (index === array.length -1) {
          linearColorStopColors = linearColorStopColors + color.color;
        } else {
          linearColorStopColors = linearColorStopColors + color.color + ',';
        }
      });
      if (gradient.angle == null || gradient.angle == undefined) {
        console.log("Hydrogen: Please specify an angle (45deg) value for all linear gradients defined in your Hydrogen configuration file.");
      } else {
        gradientStringContent = gradientStringContent + '"' + linearColorStopKeys + '": "linear-gradient(' + gradient.angle + ',' + linearColorStopColors + ')",'
      }
    } else {
      console.log("Hydrogen: Please specify a gradient type in your Hydrogen configuration file.");
    }
  });
  gradientConfig = gradientStringStart + gradientStringContent + gradientStringEnd;
}

function customGradient() {
  return src('src/styles/maps/_map-gradient.scss')
  .pipe(footer(gradientConfig))
  .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Radius
var radiusConfigSource;
var radiusMap = '$h2-map-radius: ("square": "0",';
var radiusMapStringStart = '';
var radiusMapStringContent = '';
var radiusMapStringEnd = ');';
if (config.radius != null && config.radius != undefined && config.radius.length > 0) {
  radiusConfigSource = config.radius;
} else {
  radiusConfigSource = defaults.radius;
}
radiusConfigSource.forEach(function(radius) {
  var radiusString = '"' + radius.name + '": "' + radius.value + '",';
  radiusMapStringContent = radiusMapStringContent.concat(radiusString);
});
radiusMap = radiusMap.concat(radiusMapStringStart).concat(radiusMapStringContent).concat(radiusMapStringEnd);

function buildRadius() {
  return src('src/styles/maps/_map-radius.scss')
  .pipe(footer(radiusMap))
  .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Shadow
var shadowConfig = '';
var shadowStringStart = '$h2-map-shadow: (';
var shadowStringContent = '';
var shadowStringEnd = ');';
var shadowSource;
if (config.shadows != null && config.shadows != undefined && config.shadows.length > 0) {
  shadowSource = config.shadows;
} else {
  shadowSource = defaults.shadows;
}
shadowSource.forEach(function(shadow) {
  var shadowString = '"' + shadow.name + '": "' + shadow.value + '",';
  shadowStringContent = shadowStringContent.concat(shadowString);
});
shadowConfig = shadowConfig.concat(shadowStringStart).concat(shadowStringContent).concat(shadowStringEnd);

function customShadow() {
  return src('src/styles/maps/_map-shadow.scss')
  .pipe(footer(shadowConfig))
  .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Whitespace
// This map is used by both margins and padding in the Sass file.
var whitespaceScaleSource;
if (config.whitespaceScale != null && config.whitespaceScale != undefined && config.whitespaceScale.length > 0) {
  whitespaceScaleSource = config.whitespaceScale;
} else {
  whitespaceScaleSource = defaults.whitespaceScale;
}
var whitespaceMap = '$h2-map-whitespace: ("none": 0,';
var whitespaceMapStringStart = '';
var whitespaceMapStringContent = '';
var whitespaceMapStringEnd = ');';
var smallest = '"smallest": ' + (1 / whitespaceScaleSource) / whitespaceScaleSource + 'rem,';
var smaller = '"smaller": ' + 1 / whitespaceScaleSource + 'rem,';
var small = '"small": 1rem,';
var medium = '"medium": ' + 1 * whitespaceScaleSource + 'rem,';
var large = '"large": ' + (1 * whitespaceScaleSource) * whitespaceScaleSource + 'rem,';
var larger = '"larger": ' + ((1 * whitespaceScaleSource) * whitespaceScaleSource) * whitespaceScaleSource + 'rem,';
var largest = '"largest": ' + (((1 * whitespaceScaleSource) * whitespaceScaleSource) * whitespaceScaleSource) * whitespaceScaleSource + 'rem,';
whitespaceMapStringContent = whitespaceMapStringContent + smallest + smaller + small + medium + large + larger + largest;
whitespaceMap = whitespaceMap.concat(whitespaceMapStringStart).concat(whitespaceMapStringContent).concat(whitespaceMapStringEnd);

function buildwhitespace() {
  return src('src/styles/maps/_map-whitespace.scss')
  .pipe(footer(whitespaceMap))
  .pipe(dest(config.styles.path + '/hydrogen/maps'));
}

// Compile
function compileCore() {
  return src(config.styles.path + '/hydrogen/core.scss')
    .pipe(sass())
    .pipe(dest(config.styles.path + '/hydrogen/compiled'));
}
function compileUtility() {
  return src(config.styles.path + '/hydrogen/utility.scss')
    .pipe(sass())
    .pipe(dest(config.styles.path + '/hydrogen/compiled'));
}

// Compress
function compressCore() {
  return src(config.styles.path + '/hydrogen/compiled/core.css')
    .pipe(postcss([cssnano()]))
    .pipe(dest(config.styles.path + '/hydrogen/compressed'));
}
function preCleanCompress() {
  return src(config.styles.path + '/hydrogen/compiled/utility.css')
    .pipe(postcss([cssnano({
      preset: ['lite']
    })]))
    .pipe(dest(config.styles.path + '/hydrogen/compressed'));
}

// Get Markup
function getUserMarkup() {
  return src(config.markup.path + '/**/*')
  .pipe(concat('markup.txt'))
  // This destination will have to be the CSS folder the user specifies.
  .pipe(dest(config.styles.path + '/hydrogen/markup'))
}

// Remove Unwanted CSS
function cleanCSS(done) {
  // Get the Hydrogen markup from the user's folder.
  var markup = fs.readFileSync(config.styles.path + '/hydrogen/markup/markup.txt').toString();
  // Get all instances of Hydrogen data attributes (data-h2-*="*").
  // var dataRegex = /data-h2-([^"]*)="([^"]*)"/g;
  var dataRegex = /data-h2-([^=\s]+)(?:(\s)|=["'{](.*)["'}]|.*)/g;
  // Get the utility portion of the attribute (data-h2-*).
  // var utilityRegex = /data-h2-([^=]*)/g;
  var utilityRegex = /data-h2-(?:([^=\s]*)|([^\s]+))/g;
  // Get individual attribute values (x(y)).
  var valueRegex = /([^" ]*?)\(([^)]*)\)/g;
  // var valueRegex = /.\(.*\)/g;
  // Get the temporary core Hydrogen.
  var hydrogenCore = fs.readFileSync(config.styles.path + '/hydrogen/compressed/core.css').toString();
  // Get the temporary compressed Hydrogen file, located in the user's specified location in the config.
  var hydrogenCSS = fs.readFileSync(config.styles.path + '/hydrogen/compressed/utility.css').toString();
    // console.log('sampleCSS file: ', hydrogenCSS);
  // Set up a variable list of arrays for each media query in the config. Thanks Chris Wiseman!
  let queries = {
    base: []
  };
  if (config.media != null && config.media != undefined && config.media.length > 0) {
    config.media.forEach(function(mediaQuery) {
      queries[mediaQuery.name] = [];
    }); 
  } else {
    defaults.media.forEach(function(mediaQuery) {
      queries[mediaQuery.name] = [];
    }); 
  }
    // console.log(queries);
  // Set up a string variable for our final CSS file.
  var finalCSS = "" + fontFace + hydrogenCore;
  // We'll then have to parse through each one and break things apart by media query, and add the * selector...
  // e.g. data-h2-bg-color="b(red) m(yellow)" needs to become [data-h2-bg-color*="b(red)"] and [data-h2-bg-color*="m(yellow)"]
  var usedAttributes = markup.match(dataRegex);
    // console.log(usedAttributes);
  if (usedAttributes != null) {
    usedAttributes.forEach(function(attribute) {
        // console.log(attribute);
      var utility = attribute.match(utilityRegex);
      var values = attribute.match(valueRegex);
        // console.log("Utility:", utility[0]);
        // console.log('Values inside each attribute:', values);
      if (values != null) {
        values.forEach(function(value) {
          // Get the media query set for this particular value.
          var mediaValue = value.match(/^.*?(?=\()/g); // Returns media value: x
            // console.log("media query: ", mediaValue);
          // We have to build a RegEx to match the correct media query by checking against the list of available media queries and getting their screen value. Don't forget that "b" will always be an option, which has an empty value because it represents all "screen" queries.
          var queryValue;
          var defaultQueries = mediaConfig;
          // Construct the query RegEx.
          var queryRegEx = `"` + mediaValue + `": ".*?(?:")`;
          // Create the RegEx.
          var createQueryRegEx = new RegExp(queryRegEx, 'g');
          // Search the default queries for the value.
          var queryMatch = defaultQueries.match(createQueryRegEx); // Returns media query: "x": "screen and..."
            // console.log(queryMatch);
          // Isolate the query itself so it can be used as text.
          if (queryMatch != null) {
              // console.log("queryMatch: ", queryMatch[0]);
            queryValue = queryMatch[0].match(/[^"]([^"]*)[^"\s]/g); // Returns the media side of the media query: screen and...
              // console.log("final media query: ", queryValue);
            // This if statement is required to work around the nested nature of the flex-grid CSS. All of the grid CSS is applied to the file at the end of the build every time until this can be solved.
            var newRegEx;
            if (utility[0] == "data-h2-flex-item") {
                // console.log("There's a flex item here.");
              newRegEx = '\\[data-hydrogen=("*VARVERSION"*)\\] \\[data-h2-flex-grid\\] > \\[' + utility + '\\*="' + value.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '"\\]([^{])*{([^}])*}';
            } else if (utility[0] == "data-h2-flex-item-content") {
              // Do nothing.
            } else {
              newRegEx = '\\[data-hydrogen=("*VARVERSION"*)\\] \\[' + utility + '\\*="' + value.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '"\\]([^{])*{([^}])*}';
            }
              // console.log(value);
              // console.log(newRegEx);
            var cssRegex = new RegExp(newRegEx, 'g');
              // console.log('css specific regex: ', cssRegex);
              // console.log('test css regex: ', /\[data-h2-bg-color\*="b\(red\)"\]{([^}])*}/g);
            var cssMatch = hydrogenCSS.match(cssRegex); // Returns the full CSS selector: [data-hydrogen=VARVERSION] [data-h2-ATTRIBUTE*="MEDIA(VALUE)"]***{CSS}
              // console.log('css match values: ', cssMatch);
            if (cssMatch != null) {
              // Transform the matched CSS to include its media query.
              // var CSSwithMedia = '@media ' + queryValue[0] + '{' + cssMatch + '}';
                // console.log(CSSwithMedia);
              // finalCSS = finalCSS.concat(CSSwithMedia);
                // console.log(queries);
              queries[mediaValue] = queries[mediaValue].concat(cssMatch);
                // console.log(queries);
            }
          } else {
            console.log('Hydrogen: there\'s no matching media query in the media query map for the query "' + mediaValue[0] + '".');
          }
        }); 
      }
    });
    // Loop through each media query array now that they're populated with CSS and concatenate them into the final file.
      // console.log(queries);
    for (let query in queries) {
      var queryValue;
        // console.log(queryValue);
      var defaultQueries = mediaConfig;
      // Construct the query RegEx.
      var queryRegEx = `"` + query + `": ".*?(?:")`;
      // Create the RegEx.
      var createQueryRegEx = new RegExp(queryRegEx, 'g');
      // Search the default queries for the value.
      var queryMatch = defaultQueries.match(createQueryRegEx); // Returns media query: "x": "screen and..."
        // console.log(queryMatch);
      // Isolate the query itself so it can be used as text.
      if (queryMatch != null) {
          // console.log("queryMatch: ", queryMatch[0]);
        queryValue = queryMatch[0].match(/ "([^"])*"/g); // Returns the media side of the media query: screen and...
      } else {
        console.log('Hydrogen: there\'s no matching media query in the media query map for the query "' + query + '".');
      }
      // Append the media query to the CSS group.
      finalCSS = finalCSS + '@media' + queryValue[0].replace(/["']/g, "") + ' {';
      // Add the CSS to the media query.
      queries[query].forEach(function(item) {
          // console.log(item);
        finalCSS = finalCSS + item;
      })
      // Close the media query.
      finalCSS = finalCSS + '}';
    }
      // console.log('final css: ', finalCSS);
    // Create the cleaned folder and write the file.
    if (config.environment == "development") {
      fs.writeFile(config.styles.path + '/hydrogen.css', finalCSS, function(err) {
        if (err) {
          console.log('Hydrogen: ', err);
        }
      });
    } else {
      fs.mkdirSync(config.styles.path + '/hydrogen/cleaned');
      fs.writeFile(config.styles.path + '/hydrogen/cleaned/hydrogen.css', finalCSS, function(err) {
        if (err) {
          console.log('Hydrogen: ', err);
        }
      });
    }
  }
  done();
}

// Compress
function postCleanCompress(done) {
  if (config.environment == "production" || config.environment == null || config.environment == undefined) {
    return src(config.styles.path + '/hydrogen/cleaned/hydrogen.css')
      .pipe(postcss([cssnano()]))
      .pipe(dest(config.styles.path));
  }
  done();
}

// Delete the cache if debug isn't set to true.
function deleteCache(done) {
  if (config.debug == false || config.debug == null || config.debug == undefined) {
    return del([config.styles.path + '/hydrogen']);
  }
  done();
}

exports.test = series(cleanCache, createHydrogen, cacheHydrogenCore, cacheHydrogenUtility, customMedia, customColor, buildBorderWeights, buildContainers, moveFlexgridCore, enableFlexgridCore, moveFlexgrid, enableFlexgrid, buildfontFamily, modifyFontScale, customGradient, buildRadius, customShadow, buildwhitespace, compileCore, compileUtility, compressCore, preCleanCompress, getUserMarkup, cleanCSS, postCleanCompress, deleteCache);
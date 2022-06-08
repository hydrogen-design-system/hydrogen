// Hydrogen: Build variables

// Third party dependencies
var colors = require('colors');
var Color = require('color');
var fs = require('fs');

// Local dependencies
var { parseENV } = require('./parse-env');
var { loadSettings } = require('./load-settings');
var { h2Error, h2Warning } = require('./logs');
var { lightenBy, darkenBy } = require('./parse-color');
var { buildTypography } = require('./build-typography');

function buildVariables(argv, format) {
  try {
    // Start the timer
    console.time('⌚ [' + 'Hydrogen'.magenta + '] ' + format.toUpperCase() + ' var file build time', 'CSSVarTime');
    // Get the environment and the user settings
    var envObject = parseENV(argv);
    var envSrc = envObject.src;
    var settings = loadSettings(argv);
    // Set up the variable
    var variableString = '';
    // Set up the variable prefix value based on the format
    var variablePrefix;
    if (format == 'css') {
      variablePrefix = '--';
    } else if (format == 'scss') {
      variablePrefix = '$';
    }
    // Set up the CSS root if compiling the CSS variables
    if (format == 'css') {
      variableString = variableString + ':root {\n';
    }
    // Colors & gradients
    variableString = variableString + '/* Colors */\n';
    if (settings.colors != null || settings.colors != undefined || settings.colors != []) {
      settings.colors.forEach(function (userColor) {
        variableString = variableString + variablePrefix + 'h2-color-' + userColor.key + ': ' + userColor.color + ';\n';
        if (userColor.scale.light == 'auto' || userColor.scale.light == null || userColor.scale.light == undefined) {
          var workingColor = lightenBy(Color(userColor.color), 0.25);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-light-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-light-' + userColor.key + ': ' + userColor.scale.light + ';\n';
        }
        if (userColor.scale.lighter == 'auto' || userColor.scale.lighter == null || userColor.scale.lighter == undefined) {
          var workingColor = lightenBy(Color(userColor.color), 0.5);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-lighter-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-lighter-' + userColor.key + ': ' + userColor.scale.lighter + ';\n';
        }
        if (userColor.scale.lightest == 'auto' || userColor.scale.lightest == null || userColor.scale.lightest == undefined) {
          var workingColor = lightenBy(Color(userColor.color), 0.75);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-lightest-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-lightest-' + userColor.key + ': ' + userColor.scale.lightest + ';\n';
        }
        if (userColor.scale.dark == 'auto' || userColor.scale.dark == null || userColor.scale.dark == undefined) {
          // var workingColor = darkenBy(Color(userColor.color), 0.25);
          var workingColor = Color(userColor.color).saturate(0.2).mix(Color('black'), 0.25);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-dark-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-dark-' + userColor.key + ': ' + userColor.scale.dark + ';\n';
        }
        if (userColor.scale.darker == 'auto' || userColor.scale.darker == null || userColor.scale.darker == undefined) {
          // var workingColor = darkenBy(Color(userColor.color), 0.5);
          var workingColor = Color(userColor.color).saturate(0.2).mix(Color('black'), 0.25);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-darker-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-darker-' + userColor.key + ': ' + userColor.scale.darker + ';\n';
        }
        if (userColor.scale.darkest == 'auto' || userColor.scale.darkest == null || userColor.scale.darkest == undefined) {
          // var workingColor = darkenBy(Color(userColor.color), 0.75);
          var workingColor = Color(userColor.color).saturate(0.2).mix(Color('black'), 0.25);
          var rgbColor = Color(workingColor).rgb().string();
          variableString = variableString + variablePrefix + 'h2-color-darkest-' + userColor.key + ': ' + rgbColor + ';\n';
        } else {
          variableString = variableString + variablePrefix + 'h2-color-darkest-' + userColor.key + ': ' + userColor.scale.darkest + ';\n';
        }
      });
    }
    if (settings.gradients == null) {
      var error = 'Your configuration file is missing a "gradients" array.';
      h2Warning(error);
    } else {
      variableString = variableString + '/* Gradients */\n';
      settings.gradients.forEach(function (userGradient) {
        variableString = variableString + variablePrefix + 'h2-gradient-' + userGradient.key + ': ' + userGradient.gradient + ';\n';
      });
    }
    // Containers
    variableString = variableString + '/* Containers */\n';
    if (settings.containers != null || settings.containers != undefined || settings.containers != []) {
      settings.containers.forEach(function (containerSetting) {
        variableString = variableString + variablePrefix + 'h2-container-' + containerSetting.key + ': ' + containerSetting.maxWidth + ';\n';
      });
    }
    // Font size
    var typographySettings = buildTypography(argv);
    if (format == 'css') {
      typographySettings.forEach(function (setting) {
        if (setting.query == null || setting.query == 'base') {
          // Sizes
          variableString = variableString + '/* Font sizes */\n';
          variableString = variableString + variablePrefix + 'h2-font-size-caption: ' + setting.caption.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-copy: ' + setting.copy.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h6: ' + setting.h6.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h5: ' + setting.h5.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h4: ' + setting.h4.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h3: ' + setting.h3.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h2: ' + setting.h2.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h1: ' + setting.h1.size + ';\n';
          // Line height
          variableString = variableString + '/* Line heights */\n';
          variableString = variableString + variablePrefix + 'h2-line-height-caption: ' + setting.caption.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-copy: ' + setting.copy.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h6: ' + setting.h6.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h5: ' + setting.h5.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h4: ' + setting.h4.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h3: ' + setting.h3.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h2: ' + setting.h2.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h1: ' + setting.h1.lineHeight + ';\n';
        }
      });
    } else if (format == 'scss') {
      variableString = variableString + '/* Note that because Sass variables cannot be overwritten inside of media queries, Hydrogen provides a suffixed list of variables for font sizes and line heights, where the suffix is the key to your media query. */\n';
      typographySettings.forEach(function (setting) {
        // Sizes
        if (setting.query == null || setting.query == 'base') {
          variableString = variableString + '/* Font size (:root) */\n';
        } else {
          variableString = variableString + '/* Font size (' + setting.query + ') */\n';
        }
        variableString = variableString + variablePrefix + 'h2-font-size-caption-' + setting.queryKey + ': ' + setting.caption.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-copy-' + setting.queryKey + ': ' + setting.copy.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h6-' + setting.queryKey + ': ' + setting.h6.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h5-' + setting.queryKey + ': ' + setting.h5.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h4-' + setting.queryKey + ': ' + setting.h4.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h3-' + setting.queryKey + ': ' + setting.h3.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h2-' + setting.queryKey + ': ' + setting.h2.size + ';\n';
        variableString = variableString + variablePrefix + 'h2-font-size-h1-' + setting.queryKey + ': ' + setting.h1.size + ';\n';
        // Line height
        if (setting.query == null || setting.query == 'base') {
          variableString = variableString + '/* Line heights (:root) */\n';
        } else {
          variableString = variableString + '/* Line heights (' + setting.query + ') */\n';
        }
        variableString = variableString + variablePrefix + 'h2-line-height-caption-' + setting.queryKey + ': ' + setting.caption.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-copy-' + setting.queryKey + ': ' + setting.copy.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h6-' + setting.queryKey + ': ' + setting.h6.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h5-' + setting.queryKey + ': ' + setting.h5.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h4-' + setting.queryKey + ': ' + setting.h4.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h3-' + setting.queryKey + ': ' + setting.h3.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h2-' + setting.queryKey + ': ' + setting.h2.lineHeight + ';\n';
        variableString = variableString + variablePrefix + 'h2-line-height-h1-' + setting.queryKey + ': ' + setting.h1.lineHeight + ';\n';
      });
    }
    // Media queries (if scss)
    if (format == 'scss') {
      variableString = variableString + '/* Media queries */\n';
      settings.media.forEach(function (mediaSetting) {
        variableString = variableString + variablePrefix + 'h2-media-query-' + mediaSetting.key + ': "' + mediaSetting.query + '";\n';
      });
    } else {
      variableString = variableString + "/* Note that media query variables are not generated in the CSS variable format because they can't be used inside of media query declarations. */\n";
    }
    // Radius
    variableString = variableString + '/* Radius */\n';
    if (settings.radius != null || settings.radius != undefined || settings.radius != []) {
      settings.radius.forEach(function (radiusSetting) {
        variableString = variableString + variablePrefix + 'h2-radius-' + radiusSetting.key + ': ' + radiusSetting.radius + ';\n';
      });
    }
    // Shadows
    variableString = variableString + '/* Shadows */\n';
    if (settings.shadows != null || settings.shadows != undefined || settings.shadows != []) {
      settings.shadows.forEach(function (shadowSetting) {
        variableString = variableString + variablePrefix + 'h2-shadow-' + shadowSetting.key + ': ' + shadowSetting.shadow + ';\n';
      });
    }
    // Transitions
    variableString = variableString + '/* Transition values */\n';
    if (settings.transitions != null) {
      if (settings.transitions.durations != null) {
        settings.transitions.durations.forEach(function (durationSetting) {
          variableString = variableString + variablePrefix + 'h2-transition-duration-' + durationSetting.key + ': ' + durationSetting.duration + ';\n';
        });
      }
      if (settings.transitions.functions != null) {
        settings.transitions.functions.forEach(function (functionSetting) {
          variableString = variableString + variablePrefix + 'h2-transition-function-' + functionSetting.key + ': ' + functionSetting.function + ';\n';
        });
      }
      if (settings.transitions.delays != null) {
        settings.transitions.delays.forEach(function (delaySetting) {
          variableString = variableString + variablePrefix + 'h2-transition-delay-' + delaySetting.key + ': ' + delaySetting.delay + ';\n';
        });
      }
    }
    // Whitespace
    variableString = variableString + '/* Whitespace */\n';
    if (format == 'css') {
      variableString = variableString + '/* You can use this whitespace unit and calc functions to match any multiplier used in Hydrogen attributes. */\n/* e.g. if you want the x2 multipler, simply write calc(var(--h2-whitespace-unit) * 2) */\n';
    } else if (format == 'scss') {
      variableString = variableString + '/* You can use this whitespace unit and calc functions to match any multiplier used in Hydrogen attributes. */\n/* e.g. if you want the x2 multipler, simply write calc(#{$h2-whitespace-unit} * 2) */\n';
    }
    variableString = variableString + variablePrefix + 'h2-whitespace-unit: ' + settings.baseLineHeight + 'rem;\n';
    // Close the CSS root if compiling the CSS variables
    if (format == 'css') {
      variableString = variableString + '}\n';
    }
    // Build remaining typography settings inside their own media queries if compiling CSS variables
    if (format == 'css') {
      typographySettings.forEach(function (setting) {
        if (setting.query != null && setting.query != 'base') {
          // Sizes
          variableString = variableString + '@media ' + setting.query + ' {\n';
          variableString = variableString + ':root {\n';
          variableString = variableString + '/* Font sizes */\n';
          variableString = variableString + variablePrefix + 'h2-font-size-caption: ' + setting.caption.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-copy: ' + setting.copy.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h6: ' + setting.h6.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h5: ' + setting.h5.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h4: ' + setting.h4.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h3: ' + setting.h3.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h2: ' + setting.h2.size + ';\n';
          variableString = variableString + variablePrefix + 'h2-font-size-h1: ' + setting.h1.size + ';\n';
          // Line height
          variableString = variableString + '/* Line heights */\n';
          variableString = variableString + variablePrefix + 'h2-line-height-caption: ' + setting.caption.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-copy: ' + setting.copy.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h6: ' + setting.h6.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h5: ' + setting.h5.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h4: ' + setting.h4.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h3: ' + setting.h3.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h2: ' + setting.h2.lineHeight + ';\n';
          variableString = variableString + variablePrefix + 'h2-line-height-h1: ' + setting.h1.lineHeight + ';\n';
          variableString = variableString + '}\n';
          variableString = variableString + '}\n';
        }
      });
    }
    // Check to see if the file exists, and if it does, delete it
    if (fs.existsSync(envSrc + settings.output + '/hydrogen.vars.' + format) == true) {
      fs.unlinkSync(envSrc + settings.output + '/hydrogen.vars.' + format);
    }
    // Write the file
    fs.writeFileSync(envSrc + settings.output + '/hydrogen.vars.' + format, variableString, function (err) {
      if (err) {
        h2Error(err);
      }
    });
    // End the timer
    console.timeEnd('⌚ [' + 'Hydrogen'.magenta + '] ' + format.toUpperCase() + ' var file build time', 'CSSVarTime');
  } catch (err) {
    h2Error(err);
    return err;
  }
}

module.exports = {
  buildVariables,
};
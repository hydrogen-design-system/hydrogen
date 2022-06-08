// Hydrogen: Watch script

// This script is designed to use fs.watch to watch the user's target input files for changes and run Hydrogen's build script when a change is detected

'use strict';

// Third party dependencies
var { argv } = require('process');
var watch = require('node-watch');

// Local dependencies
var { parseENV } = require('./scripts/parse-env');
var { loadSettings } = require('./scripts/load-settings');
var { buildHydrogen } = require('./scripts/build-hydrogen');

function watchFiles() {
  try {
    var envObject = parseENV(argv);
    var envState = envObject.state;
    var envSrc = envObject.src;
    // Load the user's settings and generate an array of their
    var settings = loadSettings(argv);
    var input = [envSrc + 'hydrogen.config.json'];
    for (const dir of settings.input) {
      input = input.concat(envSrc + dir);
    }
    console.log('😼 [' + 'Hydrogen'.magenta + ']', 'Starting the watch script...');
    buildHydrogen(argv);
    console.log('✅ [' + 'Hydrogen'.magenta + ']', 'A CSS file was successfully built in ' + envSrc.green + settings.output.green + '/'.green);
    console.log('👀 [' + 'Hydrogen'.magenta + ']', 'Watching for changes to your code...');
    // Watch the directories
    let watcher = watch(input, { recursive: true, filter: (f) => !/hydrogen.*\.css/.test(f) });
    watcher.on('ready', function () {
      watcher.on('change', function (evt, name) {
        if (evt == 'update') {
          console.log('👀 [' + 'Hydrogen'.magenta + ']', "We've noticed a change in", name.green + '. Rebuilding...');
          buildHydrogen(argv);
          console.log('✅ [' + 'Hydrogen'.magenta + ']', 'A CSS file was successfully built in ' + envSrc.green + settings.output.green + '/'.green);
          console.log('👀 [' + 'Hydrogen'.magenta + ']', 'Watching for changes to your code...');
        }
      });
    });
  } catch (err) {
    console.log('⛔ [' + 'Hydrogen'.magenta + ']', err);
    return err;
  }
}

module.exports = {
  watchFiles,
};
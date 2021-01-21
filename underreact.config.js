'use strict';
const path = require("path");
const html = require('./html');

module.exports = () => {
  return {
    siteBasePath: 'svg-to-geojson',
    publicAssetsPath: "",
    outputDirectory: path.join(__dirname, 'docs'),
    htmlSource: html,
    webpackConfigTransform: config => {
      config.output.globalObject = "this";
      return config;
    }
  };
};

import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { string } from "rollup-plugin-string";

const path = require( "path" );
const fs = require( "fs-extra" );

function copy( options = {} ) {
  let { input, output, assets } = options;
  input = path.resolve( input );
  output = path.resolve( output );
  return {
    name: "copy-assets",
    generateBundle() {
      return Promise.all( assets.map( asset => fs.copy(
        path.resolve( input, asset ),
        path.resolve( output, asset )
      ) ) );
    }
  };
}

export default {
  input: "website/index.js",
  output: {
    file: "docs/index.js",
    format: "iife"
  },
  plugins: [
    string( {
      include: /\.css$/
    } ),
    resolve(),
    babel( {
      babelrc: false,
      sourceType: "module",
      plugins: [
        "@babel/plugin-transform-flow-strip-types",
        [ "@babel/plugin-proposal-class-properties", { loose: true } ]
      ],
      presets: [
        "minify",
        [ "@babel/preset-env", {
          targets: {
            browsers: [ "> 10%" ]
          },
          loose: true,
          modules: false
        } ]
      ]
    } ),
    copy( {
      input: "website",
      output: "docs",
      assets: [
        "img/jsoneditor-icons.svg",
        "vendor/jsoneditor-minimalist.min.js",
        "vendor/vis.min.js",
        "vendor/webcomponents-sd-ce.js",
        "index.html",
        ".nojekyll",
      ]
    } )
  ]
};

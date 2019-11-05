import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { string } from "rollup-plugin-string";
import json from "rollup-plugin-json";

const path = require( "path" );
const fs = require( "fs-extra" );
const cpy = require( "cpy" );

function copy( options = {} ) {
  let { input, output, assets } = options;
  input = path.resolve( input );
  output = path.resolve( output );
  return {
    name: "copy-assets",
    async generateBundle() {
      await cpy( assets, output, { cwd: input, parents: true } );
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
    json( {
      compact: true,
      namedExports: false
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
        "examples/**",
        "img/**",
        "vendor/**",
        "index.html",
        ".nojekyll",
      ]
    } )
  ]
};

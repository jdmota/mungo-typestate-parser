import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    name: "MungoTypestate",
    file: "demo/vendor/mungo_typestate.js",
    format: "umd"
  },
  plugins: [
    resolve(),
    babel( {
      exclude: "node_modules/**",
      babelrc: false,
      sourceType: "module",
      plugins: [
        "@babel/plugin-transform-flow-strip-types",
        [ "@babel/plugin-proposal-class-properties", { loose: true } ]
      ],
      ignore: [
        "**/node_modules/**"
      ],
      presets: [
        [ "@babel/preset-env", {
          targets: {
            browsers: [ "last 2 versions" ]
          },
          loose: true,
          modules: false
        } ]
      ]
    } )
  ]
};

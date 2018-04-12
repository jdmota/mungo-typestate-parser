// @flow
import Parser from "./parser";

const fs = require( "fs" );
const path = require( "path" );
// $FlowIgnore
const JSON = require( "circular-json" );

const example = fs.readFileSync( path.join( __dirname, "example" ), "utf8" );

const parser = new Parser( example );

fs.writeFileSync(
  path.join( __dirname, "ast" ),
  JSON.stringify( parser.parse(), null, 2 )
);

fs.writeFileSync(
  path.join( __dirname, "automaton" ),
  JSON.stringify( {
    numberOfStates: Object.keys( parser.states ).length,
    states: parser.states
  }, null, 2 )
);

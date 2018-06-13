// @flow
import Parser from "./parser";
import createAutomaton from "./automaton";
import automatonToAst from "./automaton_to_ast";

const fs = require( "fs" );
const path = require( "path" );
// $FlowIgnore
const JSON = require( "circular-json" );

const example = fs.readFileSync( path.join( __dirname, "_example" ), "utf8" );

const parser = new Parser( example );
const ast = parser.parse();

fs.writeFileSync(
  path.join( __dirname, "_ast" ),
  JSON.stringify( ast, null, 2 )
);

const automaton = createAutomaton( ast );

fs.writeFileSync(
  path.join( __dirname, "_automaton" ),
  JSON.stringify( automaton, null, 2 )
);

const newAst = automatonToAst( "FileProtocol", automaton );

fs.writeFileSync(
  path.join( __dirname, "_automaton_to_ast" ),
  JSON.stringify( newAst, null, 2 )
);

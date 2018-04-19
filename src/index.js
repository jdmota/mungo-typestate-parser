// @flow
import Parser from "./parser";

export default function( text ) {
  const parser = new Parser( text );
  parser.parse();
  return {
    numberOfStates: Object.keys( parser.states ).length,
    states: parser.states
  };
}

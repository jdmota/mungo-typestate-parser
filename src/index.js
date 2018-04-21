// @flow
import Parser from "./parser";
import createAutomaton from "./automaton";

export default function( text: string ) {
  const parser = new Parser( text );
  const ast = parser.parse();
  return createAutomaton( ast );
}

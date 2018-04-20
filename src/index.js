// @flow
import Parser from "./parser";
import createAutomaton from "./automaton";

export default function( text: string ) {
  const parser = new Parser( text );
  const ast = parser.parse();
  const automaton = createAutomaton( ast );
  return {
    numberOfStates: Object.keys( automaton ).length,
    states: automaton
  };
}

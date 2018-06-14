// @flow
import type { Typestate } from "./ast_types";
import Parser from "./parser";
import astToAutomaton from "./automaton";
import automatonToAst from "./automaton_to_ast";
import generator from "./generator";

export default function( text: string ) {
  const parser = new Parser( text );
  const ast = parser.parse();
  return astToAutomaton( ast );
}

export function parse( text: string ): Typestate {
  return new Parser( text ).parse();
}

export { astToAutomaton, automatonToAst, generator };

// @flow
import type { Typestate, State, DecisionState } from "./ast_types";
import type { Automaton, AutomatonState } from "./automaton_types";

function createState( name: string ): AutomatonState {
  return {
    name,
    transitions: []
  };
}

function getState( automaton: Automaton, name: string ): AutomatonState {
  const state = automaton[ name ];
  if ( /:/.test( name ) ) {
    return state || ( automaton[ name ] = createState( name ) );
  }
  if ( !state ) {
    throw new Error( `State not defined ${name}` );
  }
  return state;
}

const traversers = {

  Typestate( node: Typestate, automaton: Automaton ) {
    for ( const state of node.states ) {
      traversers.State( state, automaton );
    }
  },

  State( node: State, automaton: Automaton ) {
    for ( const method of node.methods ) {

      const fromName = node._name;
      const transition = {
        type: "Method",
        name: method.name,
        arguments: method.arguments,
        returnType: method.returnType
      };

      let toName = "";
      const transitionNode = method.transition;

      if ( transitionNode.type === "State" ) {
        traversers.State( transitionNode, automaton );
        toName = transitionNode._name;
      } else if ( transitionNode.type === "DecisionState" ) {
        traversers.DecisionState( transitionNode, automaton );
        toName = transitionNode._name;
      } else if ( method.transition.type === "Identifier" ) {
        toName = transitionNode.name;
      }

      const fromState = getState( automaton, fromName );
      getState( automaton, toName );

      fromState.transitions.push( {
        transition,
        to: toName
      } );

    }
  },

  DecisionState( node: DecisionState, automaton: Automaton ) {
    for ( const [ label, toName ] of node.transitions ) {

      const fromName = node._name;
      const transition = {
        type: "Label",
        label
      };

      const fromState = getState( automaton, fromName );
      getState( automaton, toName );

      fromState.transitions.push( {
        transition,
        to: toName
      } );

    }
  }

};

export default function( ast: Typestate ) {

  const automaton: Automaton = {
    end: createState( "end" )
  };

  let firstState = "";

  for ( const { name } of ast.states ) {
    if ( automaton[ name ] ) {
      throw new Error( `Duplicated ${name} state` );
    }
    automaton[ name ] = createState( name );
    firstState = firstState || name;
  }

  traversers.Typestate( ast, automaton );

  return {
    firstState,
    numberOfStates: Object.keys( automaton ).length,
    states: automaton
  };
}

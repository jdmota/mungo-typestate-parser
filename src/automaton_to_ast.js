// @flow
import type { Typestate, Identifier, AbstractState, State, DecisionState, NamedState } from "./ast_types";
import type { Automaton } from "./automaton_types";

function createIdentifier( name: string ): Identifier {
  return {
    type: "Identifier",
    name
  };
}

function createLabelTransition( name: string, automaton: Automaton ): Identifier | State {

  if ( /unknown:/.test( name ) ) {
    return createUnnamedState( name, automaton );
  }

  return createIdentifier( name );
}

function createMethodTransition( name: string, automaton: Automaton ): Identifier | State | DecisionState {

  if ( /unknown:/.test( name ) ) {
    return createUnnamedState( name, automaton );
  }

  if ( /decision:/.test( name ) ) {
    return createDecisionState( name, automaton );
  }

  return createIdentifier( name );
}

function createDecisionState( name: string, automaton: Automaton ): DecisionState {

  const state = {
    type: "DecisionState",
    transitions: [],
    _name: name
  };

  for ( const transition of automaton.lTransitions ) {
    if ( transition.from === state._name ) {
      state.transitions.push( [
        createIdentifier( transition.transition.name ),
        createLabelTransition( transition.to, automaton )
      ] );
    }
  }

  return state;
}

function applyTransitions<T: AbstractState>( state: T, automaton: Automaton ): T {
  for ( const transition of automaton.mTransitions ) {
    if ( transition.from === state._name ) {
      state.methods.push( {
        type: "Method",
        name: transition.transition.name,
        arguments: transition.transition.arguments.map( createIdentifier ),
        returnType: createIdentifier( transition.transition.returnType ),
        transition: createMethodTransition( transition.to, automaton )
      } );
    }
  }
  return state;
}

function createUnnamedState( name: string, automaton: Automaton ): State {
  return applyTransitions( {
    type: "State",
    name: null,
    methods: [],
    _name: name
  }, automaton );
}

function createNamedState( name: string, automaton: Automaton ): NamedState {
  return applyTransitions( {
    type: "State",
    name,
    methods: [],
    _name: name
  }, automaton );
}

export default function( name: ?string, automaton: Automaton ): Typestate {

  const ast = {
    type: "Typestate",
    name: name || "NO_NAME",
    states: []
  };

  // Make sure the first state is the start
  if ( automaton.start !== "end" ) {
    ast.states.push( createNamedState( automaton.start, automaton ) );
  }

  for ( const state of automaton.states ) {
    if ( state !== "end" && state !== automaton.start && !/:/.test( state ) ) {
      ast.states.push( createNamedState( state, automaton ) );
    }
  }

  return ast;
}

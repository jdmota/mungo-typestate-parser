// @flow
import type { Typestate, State, DecisionState, Method } from "./ast_types";
import type { Automaton } from "./automaton_types";
import { positionToString } from "./tokenizer";

function checkState( automaton, name, node ) {
  if ( /:/.test( name ) ) {
    if ( /^decision:/.test( name ) ) {
      automaton.choices.add( name );
    } else {
      automaton.states.add( name );
    }
  } else if ( !automaton.states.has( name ) ) {
    throw new Error( `State not defined: ${name} (at ${positionToString( node.loc.start )})` );
  }
}

function equalSignature( a, b ) {
  if ( a.name !== b.name ) {
    return false;
  }
  if ( a.arguments.length !== b.arguments.length ) {
    return false;
  }
  for ( let i = 0; i < a.arguments.length; i++ ) {
    if ( a.arguments[ i ].name !== b.arguments[ i ].name ) {
      return false;
    }
  }
  return true;
}

function compileMethod( fromName: string, method: Method, automaton: Automaton ) {
  const transitionNode = method.transition;
  let toName = "";

  if ( transitionNode.type === "State" ) {
    compileState( transitionNode, automaton );
    toName = transitionNode._name;
  } else if ( transitionNode.type === "DecisionState" ) {
    compileDecisionState( transitionNode, automaton );
    toName = transitionNode._name;
  } else if ( transitionNode.type === "Identifier" ) {
    toName = transitionNode.name;
  }

  checkState( automaton, toName, transitionNode );

  const m = {
    name: method.name,
    arguments: method.arguments.map( a => a.name ),
    returnType: method.returnType.name
  };

  automaton.methods.push( m );

  automaton.mTransitions.push( {
    from: fromName,
    transition: m,
    to: toName
  } );

  return automaton;
}

function compileLabel( fromName: string, [ label, to ], automaton: Automaton ) {

  let toName = "";

  if ( to.type === "State" ) {
    compileState( to, automaton );
    toName = to._name;
  } else if ( to.type === "Identifier" ) {
    toName = to.name;
  }

  checkState( automaton, toName, to );

  const l = {
    name: label.name
  };

  automaton.labels.push( l );

  automaton.lTransitions.push( {
    from: fromName,
    transition: l,
    to: toName
  } );

  return automaton;
}

function compileState( node: State, automaton: Automaton ) {

  const fromName = node._name;
  checkState( automaton, fromName, node );

  if ( node.methods.length === 0 ) {
    automaton.final.add( fromName );
    return automaton;
  }

  for ( let i = 0; i < node.methods.length; i++ ) {
    const method = node.methods[ i ];
    for ( let j = 0; j < i; j++ ) {
      if ( equalSignature( method, node.methods[ j ] ) ) {
        throw new Error(
          `Duplicate method signature: ${method.name}(${method.arguments.map( a => a.name ).join( ", " )})` +
          ` (at ${positionToString( method.loc.start )})`
        );
      }
    }
  }

  return node.methods.reduce(
    ( automaton, method ) => compileMethod( fromName, method, automaton ),
    automaton
  );
}

function compileDecisionState( node: DecisionState, automaton: Automaton ) {

  const fromName = node._name;
  checkState( automaton, fromName, node );

  const set = new Set();
  for ( const [ label ] of node.transitions ) {
    const labelName = label.name;
    if ( set.has( labelName ) ) {
      throw new Error(
        `Duplicate case label: ${labelName} (at ${positionToString( label.loc.start )})`
      );
    }
    set.add( labelName );
  }

  return node.transitions.reduce(
    ( automaton, transition ) => compileLabel( fromName, transition, automaton ),
    automaton
  );
}

export default function( ast: Typestate ): Automaton {

  const automaton = {
    states: new Set( [ "end" ] ),
    choices: new Set(),
    methods: [],
    labels: [],
    start: "",
    final: new Set( [ "end" ] ),
    mTransitions: [],
    lTransitions: []
  };

  // Get all named states
  for ( const state of ast.states ) {
    if ( automaton.states.has( state.name ) ) {
      throw new Error( `Duplicated ${state.name} state (at ${positionToString( state.loc.start )})` );
    }
    automaton.states.add( state.name );
  }

  // Calculate first state
  if ( ast.states.length === 0 ) {
    automaton.start = "end";
  } else {
    automaton.start = ast.states[ 0 ].name;
  }

  return ast.states.reduce(
    ( automaton, state ) => compileState( state, automaton ),
    automaton
  );
}

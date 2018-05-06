// @flow
import type { Typestate, State, DecisionState } from "./ast_types";
import type { Automaton } from "./automaton_types";

function checkState( automaton, name ) {
  if ( /:/.test( name ) ) {
    if ( /^decision:/.test( name ) ) {
      automaton.choices.add( name );
    } else {
      automaton.states.add( name );
    }
  } else if ( !automaton.states.has( name ) ) {
    throw new Error( `State not defined: ${name}` );
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

function traverseTypestate( node: Typestate, automaton: Automaton ) {
  for ( const state of node.states ) {
    traverseState( state, automaton );
  }
}

function traverseState( node: State, automaton: Automaton ) {

  const fromName = node._name;
  checkState( automaton, fromName );

  if ( node.methods.length === 0 ) {
    automaton.final.add( fromName );
    return;
  }

  for ( let i = 0; i < node.methods.length; i++ ) {

    const method = node.methods[ i ];

    for ( let j = 0; j < i; j++ ) {
      if ( equalSignature( method, node.methods[ j ] ) ) {
        throw new Error(
          `Duplicate method signature: ${method.name}(${method.arguments.map( a => a.name ).join( ", " )})`
        );
      }
    }

    const transitionNode = method.transition;
    let toName = "";

    if ( transitionNode.type === "State" ) {
      traverseState( transitionNode, automaton );
      toName = transitionNode._name;
    } else if ( transitionNode.type === "DecisionState" ) {
      traverseDecisionState( transitionNode, automaton );
      toName = transitionNode._name;
    } else if ( transitionNode.type === "Identifier" ) {
      toName = transitionNode.name;
    }

    checkState( automaton, toName );

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

  }
}

function traverseDecisionState( node: DecisionState, automaton: Automaton ) {
  const set = new Set();
  const fromName = node._name;
  checkState( automaton, fromName );

  for ( const [ label, to ] of node.transitions ) {

    const labelName = label.name;

    if ( set.has( labelName ) ) {
      throw new Error( `Duplicate case label: ${labelName}` );
    }

    let toName = "";

    if ( to.type === "State" ) {
      traverseState( to, automaton );
      toName = to._name;
    } else if ( to.type === "Identifier" ) {
      toName = to.name;
    }

    checkState( automaton, toName );

    const l = {
      name: labelName
    };

    automaton.labels.push( l );

    automaton.lTransitions.push( {
      from: fromName,
      transition: l,
      to: toName
    } );

    set.add( labelName );

  }
}

export default function( ast: Typestate ): Automaton {

  const automaton = {
    states: new Set(),
    choices: new Set(),
    methods: [],
    labels: [],
    start: "",
    final: new Set(),
    mTransitions: [],
    lTransitions: []
  };

  automaton.states.add( "end" );
  automaton.final.add( "end" );

  for ( const { name } of ast.states ) {
    if ( automaton.states.has( name ) ) {
      throw new Error( `Duplicated ${name} state` );
    }
    automaton.states.add( name );
    automaton.start = automaton.start || name;
  }

  automaton.start = automaton.start || "end";

  traverseTypestate( ast, automaton );

  return automaton;
}

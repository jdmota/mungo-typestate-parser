// @flow
import type { Typestate, Identifier, State, DecisionState, NamedState, Method } from "./ast_types";

function generateIdentifier( identifier: Identifier ): string {
  return identifier.name;
}

function generateTransition( transition: Identifier | State | DecisionState ): string {

  if ( transition.type === "Identifier" ) {
    return generateIdentifier( transition );
  }

  if ( transition.type === "State" ) {
    return generateUnnamedState( transition );
  }

  return generateDecisionState( transition );
}

function generateLabel( [ label, to ] ): string {
  return `${generateIdentifier( label )}: ${generateTransition( to )}`;
}

function generateDecisionState( state: DecisionState ): string {
  return `<${state.transitions.map( generateLabel ).join( ", " )}>`;
}

function generateMethod( method: Method ): string {
  return `${generateIdentifier( method.returnType )} ${method.name}(${method.arguments.map( generateIdentifier ).join( ", " )}): ${generateTransition( method.transition )}`;
}

function generateUnnamedState( state: State ): string {
  return `{\n${state.methods.map( generateMethod ).join( ",\n" )}\n}`;
}

function generateNamedState( state: NamedState ): string {
  return `${state.name} = {\n${state.methods.map( generateMethod ).join( ",\n" )}\n}`;
}

export default function( ast: Typestate ): string {
  return `typestate ${ast.name} {\n${ast.states.map( generateNamedState ).join( "\n" )}\n}\n`;
}

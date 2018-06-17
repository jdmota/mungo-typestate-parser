// @flow
/* eslint no-use-before-define: 0 */
import type { Location } from "./tokenizer";

export type AstNode = {
  +loc: Location
};

export type Typestate = AstNode & {
  +type: "Typestate",
  +name: string,
  +states: NamedState[]
};

export type AbstractState = AstNode & {
  +type: "State",
  +methods: Method[],
  +_name: string
};

export type State = AbstractState & { +name: ?string };

export type NamedState = AbstractState & { +name: string };

export type Identifier = AstNode & {
  +type: "Identifier",
  +name: string
};

export type Method = AstNode & {
  +type: "Method",
  +name: string,
  +arguments: Identifier[],
  +returnType: Identifier,
  +transition: Identifier | State | DecisionState
};

export type DecisionState = AstNode & {
  +type: "DecisionState",
  +transitions: [ Identifier, Identifier | State ][],
  +_name: string
};

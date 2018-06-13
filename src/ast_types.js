// @flow
/* eslint no-use-before-define: 0 */

export type Typestate = {
  +type: "Typestate",
  +name: string,
  +states: NamedState[]
};

export type AbstractState = {
  +type: "State",
  +methods: Method[],
  +_name: string
};

export type State = AbstractState & { +name?: ?string };

export type NamedState = AbstractState & { +name: string };

export type Identifier = {
  +type: "Identifier",
  +name: string
};

export type Method = {
  +type: "Method",
  +name: string,
  +arguments: Identifier[],
  +returnType: Identifier,
  +transition: Identifier | State | DecisionState
};

export type DecisionState = {
  +type: "DecisionState",
  +transitions: [ Identifier, Identifier | State ][],
  +_name: string
};

// @flow
/* eslint no-use-before-define: 0 */

export type Typestate = {
  +type: "Typestate",
  +name: string,
  +states: NamedState[]
};

type AbstractState = {
  +type: "State",
  +methods: Method[],
  +_name: string
};

export type State = AbstractState & { +name: ?string };

export type NamedState = AbstractState & { +name: string };

export type Type = {
  +type: "Type",
  +name: string
};

export type Identifier = {
  +type: "Identifier",
  +name: string
};

export type Method = {
  +type: "Method",
  +name: string,
  +arguments: Type[],
  +returnType: Type,
  +transition: Identifier | State | DecisionState
};

export type DecisionState = {
  +type: "DecisionState",
  +transitions: [ Type, string ][],
  +_name: string
};

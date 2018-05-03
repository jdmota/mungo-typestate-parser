// @flow
/* eslint no-use-before-define: 0 */

export type Automaton = {
  [key: string]: AutomatonState
};

export type AutomatonState = {
  +name: string,
  +transitions: AutomatonTransition[]
};

export type AutomatonTransition = {
  +transition: AutomatonTransitionMethod | AutomatonTransitionLabel,
  +to: string
}

export type AutomatonTransitionMethod = {
  +type: "Method",
  +name: string,
  +arguments: string[],
  +returnType: string
};

export type AutomatonTransitionLabel = {
  +type: "Label",
  +label: string
};


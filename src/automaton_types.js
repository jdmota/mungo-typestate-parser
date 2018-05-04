// @flow
/* eslint no-use-before-define: 0 */

export type Automaton = {
  states: Set<string>,
  choices: Set<string>,
  methods: AutomatonMethod[],
  labels: AutomatonLabel[],
  start: string,
  final: Set<string>,
  mTransitions: AutomatonTransition<AutomatonMethod>[],
  lTransitions: AutomatonTransition<AutomatonLabel>[]
};

export type AutomatonTransition<T> = {
  +from: string,
  +transition: T,
  +to: string
};

export type AutomatonMethod = {
  +name: string,
  +arguments: string[],
  +returnType: string
};

export type AutomatonLabel = {
  +name: string
};


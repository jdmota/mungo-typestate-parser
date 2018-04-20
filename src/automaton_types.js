// @flow
/* eslint no-use-before-define: 0 */

import type { Type } from "./ast_types";

export type Automaton = {
  [key: string]: AutomatonState
};

export type AutomatonState = {
  +name: string,
  +transitions: AutomationTransition[]
};

export type AutomationTransition = {
  +transition: AutomationTransitionMethod | AutomationTransitionLabel,
  +to: string
}

export type AutomationTransitionMethod = {
  +type: "Method",
  +name: string,
  +arguments: Type[],
  +returnType: Type
};

export type AutomationTransitionLabel = {
  +type: "Label",
  +label: Type
};


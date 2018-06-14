import { render } from "lit-html";
import { render as renderWithShadyCSS } from "lit-html/lib/shady-render.js";
import { LitElement as OriginalLitElement } from "@polymer/lit-element";

/* globals window */

export class LitElement extends OriginalLitElement {
  _applyRender( result, node ) {
    if ( window.ShadyCSS ) {
      renderWithShadyCSS( result, node, this.localName );
    } else {
      render( result, node );
    }
  }
}

export { html } from "lit-html/lib/lit-extended.js";

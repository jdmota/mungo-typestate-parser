import { LitElement, html } from "@polymer/lit-element";

/* globals document, customElements */

export class ErrorDisplay extends LitElement {

  static get properties() {
    return {
      text: String
    };
  }

  _render( { text } ) {
    return html`
      <style>
        :host {
          display: block;
        }
        pre {
          color: red;
          white-space: pre-wrap;
        }
      </style>
      <pre>${text || ""}</pre>
    `;
  }

}

customElements.define( "error-display", ErrorDisplay );

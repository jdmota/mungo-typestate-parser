import { LitElement, html } from "@polymer/lit-element";

/* globals document, customElements */

export class TextViewer extends LitElement {

  static get properties() {
    return {
      text: String
    };
  }

  _shouldRender( props ) {
    return !!props.text;
  }

  _render( { text } ) {
    return html`
      <style>
        pre {
          width: 600px;
          height: 600px;
          overflow: auto;
          border: 1px solid lightgray;
          margin: 0px;
        }
      </style>
      <top-bar myTitle="" buttons="${[]}"></top-bar>
      <pre>${text}</pre>
    `;
  }

}

customElements.define( "text-viewer", TextViewer );

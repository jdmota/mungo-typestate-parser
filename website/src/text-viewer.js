import { LitElement, html } from "./lit-element";

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
      </style>
      <top-bar myTitle="" buttonText="" fn="${() => {}}"></top-bar>
      <pre style="width: 600px">${text}</pre>
    `;
  }

}

customElements.define( "text-viewer", TextViewer );

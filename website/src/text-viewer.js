import { LitElement, html, css } from "lit-element";

/* globals document, customElements */

export class TextViewer extends LitElement {

  static get properties() {
    return {
      text: { type: String, reflect: false }
    };
  }

  static styles = css`
  pre {
    width: 600px;
    height: 600px;
    overflow: auto;
    border: 1px solid lightgray;
    margin: 0px;
  }
  `;

  render() {
    return html`
      <top-bar .myTitle="" .buttons="${[]}"></top-bar>
      <pre>${this.text || ""}</pre>
    `;
  }

}

customElements.define( "text-viewer", TextViewer );

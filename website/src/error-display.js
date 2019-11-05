import { LitElement, html, css } from "lit-element";

/* globals document, customElements */

export class ErrorDisplay extends LitElement {

  static get properties() {
    return {
      text: { type: String, reflect: false }
    };
  }

  static get styles() {
    return css`
    :host {
      display: block;
    }
    pre {
      color: red;
      white-space: pre-wrap;
    }
    `;
  }

  render() {
    return html`<pre>${this.text || ""}</pre>`;
  }

}

customElements.define( "error-display", ErrorDisplay );

import { LitElement, html, css, unsafeCSS } from "lit-element";
import jsonEditorCss from "../vendor/jsoneditor.min.css";

/* globals window, document, customElements, JSONEditor */

// Using https://github.com/josdejong/jsoneditor

export class JsonViewer extends LitElement {

  static get properties() {
    return {
      json: { reflect: false },
      mode: { type: Boolean, reflect: false }
    };
  }

  constructor() {
    super();
    this.container = document.createElement( "div" );
    this.editor = new JSONEditor( this.container, {
      mode: "view"
    } );
    this.rawText = "";
    this.mode = true;

    this.toggleMode = this.toggleMode.bind( this );
    this.select = this.select.bind( this );
  }

  toggleMode() {
    this.mode = !this.mode;
  }

  select() {
    const node = this.shadowRoot.querySelector( "pre" );
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents( node );
    selection.removeAllRanges();
    selection.addRange( range );
  }

  updated() {
    if ( this.json ) {
      this.editor.set( this.json );
      this.rawText = JSON.stringify( this.json, null, 2 );
    }
  }

  static get styles() {
    return [
      unsafeCSS(jsonEditorCss),
      css`
      .invisible {
        display: none;
      }
      .visible {
        display: block;
      }
      div.view {
        width: 600px;
      }
      pre.view {
        width: 600px;
        height: 600px;
        overflow: auto;
        border: 1px solid lightgray;
        margin: 0px;
      }
      `
    ];
  }

  render() {

    const buttons = this.mode ?
      [
        [ "See raw text", this.toggleMode ]
      ] :
      [
        [ "Open JSON Viewer", this.toggleMode ],
        [ "Select all", this.select ]
      ];

    return html`
      <top-bar .myTitle="" .buttons="${buttons}"></top-bar>
      <div class="view ${this.mode ? "visible" : "invisible"}">${this.container}</div>
      <pre class="view ${this.mode ? "invisible" : "visible"}">${this.rawText}</pre>
    `;
  }

}

customElements.define( "json-viewer", JsonViewer );

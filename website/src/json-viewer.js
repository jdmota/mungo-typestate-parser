import { LitElement, html } from "@polymer/lit-element";
import jsonEditorCss from "../vendor/jsoneditor.min.css";

/* globals window, document, customElements, JSONEditor */

// Using https://github.com/josdejong/jsoneditor

export class JsonViewer extends LitElement {

  static get properties() {
    return {
      json: Object,
      mode: Boolean
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

  _shouldRender( props ) {
    if ( !props.json ) {
      return false;
    }
    this.editor.set( props.json );
    this.rawText = JSON.stringify( props.json, null, 2 );
    return true;
  }

  _render() {

    const buttons = this.mode ?
      [
        [ "See raw text", this.toggleMode ]
      ] :
      [
        [ "Open JSON Viewer", this.toggleMode ],
        [ "Select all", this.select ]
      ];

    return html`
      <style>${jsonEditorCss}</style>
      <style>
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
      </style>
      <top-bar myTitle="" buttons="${buttons}"></top-bar>
      <div class$="view ${this.mode ? "visible" : "invisible"}">${this.container}</div>
      <pre class$="view ${this.mode ? "invisible" : "visible"}">${this.rawText}</pre>
    `;
  }

}

customElements.define( "json-viewer", JsonViewer );

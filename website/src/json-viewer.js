import { LitElement, html } from "./lit-element";
import jsonEditorCss from "../vendor/jsoneditor.min.css";

/* globals document, customElements, JSONEditor */

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
  }

  toggleMode() {
    this.mode = !this.mode;
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
    return html`
      <style>${jsonEditorCss}</style>
      <style>
        .invisible {
          display: none;
        }
        .visible {
          display: block;
        }
      </style>
      <top-bar myTitle="" buttonText="${this.mode ? "See raw text" : "Open JSON Viewer"}" fn="${() => this.toggleMode()}"></top-bar>
      <div class$="${this.mode ? "visible" : "invisible"}" style="width: 600px">${this.container}</div>
      <pre class$="${this.mode ? "invisible" : "visible"}" style="width: 600px">${this.rawText}</pre>
    `;
  }

}

customElements.define( "json-viewer", JsonViewer );

import { LitElement, html } from "@polymer/lit-element";

/* globals window, customElements */

export class TransformationElement extends LitElement {

  static get properties() {
    return {
      defaultValue: String,
      myTitle: String,
      fn: Function,
      result: Object,
      error: String,
      textareaStyle: String
    };
  }

  constructor() {
    super();
    this.onDo = this.onDo.bind( this );
  }

  onDo() {
    const fn = this.fn;
    try {
      this.result = fn( this.shadowRoot.querySelector( "textarea" ).value );
      this.error = "";
    } catch ( error ) {
      this.error = error.message;
      console.log( "Caught:", error );
    }

    if ( this.myTitle === "Preview" ) {
      window.__ERROR__ = this.error;
    }
  }

  _firstRendered() {
    this.shadowRoot.querySelector( "textarea" ).value = this.defaultValue || "";

    if ( this.myTitle === "Preview" ) {
      window.__TEXTAREA__ = this.shadowRoot.querySelector( "textarea" );
      window.__RENDER__ = this.onDo;
    }
  }

  _render( { myTitle, result, error, textareaStyle } ) {
    return html`
      <style>
        :host {
          display: block;
        }
        textarea {
          width: 500px;
          height: 600px;
        }
        .side {
          float: left;
          margin: 0 10px;
        }
        error-display {
          width: 600px;
          height: 35px;
          display: none;
        }
        .hasError error-display {
          display: block;
        }
        .hasError textarea {
          height: 615px;
        }
      </style>
      <div class$="side ${error ? "hasError" : ""}">
        <top-bar myTitle="${myTitle}" buttons="${[ [ "Do", this.onDo ] ]}"></top-bar>
        <error-display text="${error}"></error-display>
        <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style$="${textareaStyle}"></textarea>
      </div>
      <div class="side">${result}</div>
      <div style="clear: both"></div>
    `;
  }

}

customElements.define( "my-transformation", TransformationElement );

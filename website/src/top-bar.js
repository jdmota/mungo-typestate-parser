import { LitElement, html } from "./lit-element";

/* globals document, customElements */

export class TopBar extends LitElement {

  static get properties() {
    return {
      myTitle: String,
      buttons: Array
    };
  }

  _render( { myTitle, buttons } ) {
    return html`
      <style>
        :host {
          display: block;
          height: 50px;
          line-height: 50px;
          margin-bottom: 10px;
        }
        :host * {
          margin: 10px;
        }
        button {
          cursor: pointer;
          display: inline-block;
          font-weight: 400;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          border: 1px solid transparent;
          padding: .37rem .75rem;
          font-size: 14px;
          line-height: 1.5;
          border-radius: .25rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;

          min-width: 60px;
          color: #007bff;
          background-color: white;
          background-image: none;
          border-color: #007bff;
        }
        button:hover {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
        }
      </style>
      ${myTitle ? html`<span>${myTitle}</span>` : ""}
      ${buttons.map( ( [ text, fn ] ) => html`<button on-click="${fn}">${text}</button>` )}
    `;
  }

}

customElements.define( "top-bar", TopBar );

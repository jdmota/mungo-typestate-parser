import { LitElement, html } from "@polymer/lit-element";
import { MDCMenu } from "@material/menu";
import MDCElevationStyles from "@material/elevation/dist/mdc.elevation.min.css";
import MDCThemeStyles from "@material/theme/dist/mdc.theme.min.css";
import MDCTypographyStyles from "@material/typography/dist/mdc.typography.min.css";
import MDCMenuStyles from "@material/menu/dist/mdc.menu.min.css";
import MDCListStyles from "@material/list/dist/mdc.list.min.css";
import createAutomaton, { parse, astToAutomaton, automatonToAst, generator } from "../../src/index";

/* globals customElements */

const DEFAULT_TYPESTATE = `typestate FileProtocol {

  Init = {
    Status open(): <OK: Open, ERROR: end>
  }

  Open = {
    Boolean hasNext(): <TRUE: Read, FALSE: Close>,
    void close(): end
  }

  Read = {
    void read(): Open
  }

  Close = {
    void close(): end
  }

}`;

// Convert sets in arrays
function fixAutomaton( a ) {
  a.states = Array.from( a.states );
  a.choices = Array.from( a.choices );
  a.final = Array.from( a.final );
  return a;
}

// Convert arrays in sets
function fixAutomaton2( a ) {
  a.states = new Set( a.states );
  a.choices = new Set( a.choices );
  a.final = new Set( a.final );
  return a;
}

const transforms = {

  view( text ) {
    return html`<automaton-viewer automaton="${createAutomaton( text )}"></automaton-viewer>`;
  },

  parse( text ) {
    return html`<json-viewer json="${parse( text )}"></json-viewer>`;
  },

  astToAutomaton( ast ) {
    return html`<json-viewer json="${fixAutomaton( astToAutomaton( JSON.parse( ast ) ) )}"></json-viewer>`;
  },

  automatonToAst( automaton ) {
    return html`<json-viewer json="${automatonToAst( "NAME", fixAutomaton2( JSON.parse( automaton ) ) )}"></json-viewer>`;
  },

  generator( ast ) {
    return html`<text-viewer text="${generator( JSON.parse( ast ) )}"></text-viewer>`;
  }

};

const arrow = `→`;
const items = [ "Preview", `Text ${arrow} AST`, `AST ${arrow} Automaton`, `Automaton ${arrow} AST`, `AST ${arrow} Text` ];
const listItems = items.map( t => html`<li class="mdc-list-item" role="menuitem" tabindex="0">${t}</li>` );

export class App extends LitElement {

  static get properties() {
    return {};
  }

  _firstRendered() {

    const menuEl = this.shadowRoot.querySelector( ".mdc-menu" );
    const menu = new MDCMenu( menuEl );
    const menuButtonEl = this.shadowRoot.querySelector( "#menu-button" );

    menuButtonEl.addEventListener( "click", () => {
      menu.open = !menu.open;
    } );

    menuEl.addEventListener( "MDCMenu:selected", evt => {
      const elems = this.shadowRoot.querySelectorAll( "my-transformation" );
      elems[ evt.detail.index ].scrollIntoView();
    } );

    menu.setAnchorMargin( { top: 10, left: 10 } );
    // menu.setAnchorCorner( Corner.BOTTOM_LEFT );
    // menu.quickOpen = true;
  }

  _render() {
    return html`
      <style>${MDCElevationStyles + MDCThemeStyles + MDCTypographyStyles + MDCMenuStyles + MDCListStyles}</style>
      <style>
        .toolbar {
          width: 100%;
          height: 64px;
          background: #01579b; /* #336fb7; */
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }
        .toolbar .title {
          margin-left: 5px;
          color: white;
          font-weight: bold;
          font-size: 16px;
          line-height: 64px;
          float: left;
        }
        #menu-button {
          margin-left: 5px;
          background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 style=%22fill:white%22 viewBox=%220 0 24 24%22%3E%3Cg%3E%3Cpath d=%22M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z%22%3E%3C/path%3E%3C/g%3E%3C/svg%3E');
          background-size: 24px 24px;
          background-repeat: no-repeat;
          background-position: center;
          width: 64px;
          height: 64px;
          float: left;
          cursor: pointer;
        }
        #menu-button div {
          width: 34px;
          height: 34px;
          margin: 15px;
        }
        #menu-button:hover div {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
        }
        .container {
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: auto;
        }
        .container div {
          margin: 0 20px;
        }
        my-transformation {
          padding-top: 10px;
        }
        my-transformation:nth-last-child(1) {
          padding-bottom: 20px;
        }
      </style>
      <div class="toolbar mdc-menu-anchor">
        <div id="menu-button"><div></div></div>
        <div class="mdc-menu" tabindex="-1">
          <ul class="mdc-menu__items mdc-list" role="menu" aria-hidden="true">
            ${listItems}
          </ul>
        </div>
        <span class="title">Typestate</span>
      </div>
      <div class="container">
        <div>
          <my-transformation defaultValue="${DEFAULT_TYPESTATE}" myTitle="${items[ 0 ]}" fn="${transforms.view}"></my-transformation>
          <my-transformation myTitle="${items[ 1 ]}" fn="${transforms.parse}" textareaStyle="height: 200px;"></my-transformation>
          <my-transformation myTitle="${items[ 2 ]}" fn="${transforms.astToAutomaton}" textareaStyle="height: 200px;"></my-transformation>
          <my-transformation myTitle="${items[ 3 ]}" fn="${transforms.automatonToAst}" textareaStyle="height: 200px;"></my-transformation>
          <my-transformation myTitle="${items[ 4 ]}" fn="${transforms.generator}" textareaStyle="height: 200px;"></my-transformation>
        </div>
      </div>
    `;
  }

}

customElements.define( "my-app", App );

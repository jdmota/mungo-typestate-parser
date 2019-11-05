import { LitElement, html, css } from "lit-element";
import { MDCMenu, Corner } from "@material/menu";
import { MDCElevationStyles, MDCThemeStyles, MDCTypographyStyles, MDCMenuStyles, MDCMenuSurfaceStyles, MDCListStyles } from "./material-styles";
import createAutomaton, { parse, astToAutomaton, automatonToAst, generator } from "../../src/index";
import EXAMPLES from "../examples/info.json";

/* globals customElements */

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
    return html`<automaton-viewer .automaton="${createAutomaton( text )}"></automaton-viewer>`;
  },

  parse( text ) {
    return html`<json-viewer .json="${parse( text )}"></json-viewer>`;
  },

  astToAutomaton( ast ) {
    return html`<json-viewer .json="${fixAutomaton( astToAutomaton( JSON.parse( ast ) ) )}"></json-viewer>`;
  },

  automatonToAst( automaton ) {
    return html`<json-viewer .json="${automatonToAst( "NAME", fixAutomaton2( JSON.parse( automaton ) ) )}"></json-viewer>`;
  },

  generator( ast ) {
    return html`<text-viewer .text="${generator( JSON.parse( ast ) )}"></text-viewer>`;
  }

};

const arrow = `→`;
const items = [ "Preview", `Typestate ${arrow} AST`, `AST ${arrow} Automaton`, `Automaton ${arrow} AST`, `AST ${arrow} Typestate` ];
const navItems = items.map(
  t => html`<li class="mdc-list-item" role="menuitem" tabindex="0"><span class="mdc-list-item__text">${t}</span></li>`
);

const exampleItems = EXAMPLES.list.map(
  e => html`<li class="mdc-list-item" role="menuitem" tabindex="0"><span class="mdc-list-item__text">${e}</span></li>`
);

export class App extends LitElement {

  static get properties() {
    return {};
  }

  setupNavMenu() {
    const menuEl = this.shadowRoot.querySelector( "#nav-menu" );
    const menu = new MDCMenu( menuEl );
    const menuButtonEl = this.shadowRoot.querySelector( "#nav-button" );

    menuButtonEl.addEventListener( "click", () => {
      menu.open = !menu.open;
    } );

    menuEl.addEventListener( "MDCMenu:selected", evt => {
      const elems = this.shadowRoot.querySelectorAll( "my-transformation" );
      elems[ evt.detail.index ].scrollIntoView();
    } );

    menu.setAnchorElement( menuButtonEl );
    menu.setAnchorMargin( { top: 10, left: 10 } );
  }

  setupExamplesMenu() {
    const menuEl = this.shadowRoot.querySelector( "#examples-menu" );
    const menu = new MDCMenu( menuEl );
    const menuButtonEl = this.shadowRoot.querySelector( "#examples-button" );

    menuButtonEl.addEventListener( "click", () => {
      menu.open = !menu.open;
    } );

    menuEl.addEventListener( "MDCMenu:selected", async evt => {
      const selected = `${EXAMPLES.list[ evt.detail.index ]}${EXAMPLES.ext}`;
      const url = location.hostname === "localhost" ?
        `/examples/${selected}` :
        `${EXAMPLES.baseUrl}${selected}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "text/plain"
        }
      });
      const text = await response.text();
      window.__TEXTAREA__.value = text;
    } );

    menu.setAnchorElement( menuButtonEl );
    menu.setAnchorCorner( Corner.BOTTOM_RIGHT );
    menu.setAnchorMargin( { top: 10 } );
  }

  firstUpdated() {
    this.setupNavMenu();
    this.setupExamplesMenu();
  }

  static get styles() {
    return [
      MDCElevationStyles,
      MDCThemeStyles,
      MDCTypographyStyles,
      MDCMenuStyles,
      MDCMenuSurfaceStyles,
      MDCListStyles,
      css`
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
      .toolbar button {
        display: block;
        background: none;
        padding: 0;
        margin: 0;
        border: none;
      }
      #nav-button {
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
      #nav-button div {
        width: 34px;
        height: 34px;
        margin: 15px;
      }
      #nav-button:hover div {
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
      #examples-button {
        margin-right: 35px;
        padding: 0 10px;
        color: white;
        font-weight: bold;
        font-size: 16px;
        line-height: 64px;
        float: right;
        cursor: pointer;
      }
      `
    ];
  }

  render() {
    return html`
      <div class="toolbar">
        <div>
          <button id="nav-button"><div></div></button>
          <div id="nav-menu" class="mdc-menu mdc-menu-surface">
            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
              ${navItems}
            </ul>
          </div>
        </div>
        <span class="title">Typestate</span>
        <div>
          <button id="examples-button">Examples</button>
          <div id="examples-menu" class="mdc-menu mdc-menu-surface">
            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
              ${exampleItems}
            </ul>
          </div>
        </div>
      </div>
      <div class="container">
        <div>
          <my-transformation .myTitle="${items[ 0 ]}" .fn="${transforms.view}"></my-transformation>
          <my-transformation .myTitle="${items[ 1 ]}" .fn="${transforms.parse}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[ 2 ]}" .fn="${transforms.astToAutomaton}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[ 3 ]}" .fn="${transforms.automatonToAst}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[ 4 ]}" .fn="${transforms.generator}" .textareaStyle="height: 200px;"></my-transformation>
        </div>
      </div>
    `;
  }

}

customElements.define( "my-app", App );

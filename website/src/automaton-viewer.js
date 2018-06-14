import { LitElement, html } from "./lit-element";

/* globals document, customElements, vis */

function createDemo( automaton, container ) {

  const invisible = ":invisible:";

  const nodes = [
    {
      id: invisible,
      size: 0,
      borderWidth: 0,
      color: {
        border: "rgba(0,0,0,0)",
        background: "rgba(0,0,0,0)"
      }
    }
  ];

  const edges = [
    {
      from: invisible,
      to: automaton.start,
      color: {
        color: "#848484"
      },
      arrows: "to"
    }
  ];

  for ( const name of automaton.states ) {
    nodes.push( {
      id: name,
      label: name,
      shape: "circle",
      borderWidth: automaton.final.has( name ) ? 4 : 1
    } );
  }

  for ( const name of automaton.choices ) {
    nodes.push( {
      id: name,
      label: "",
      shape: "diamond",
      borderWidth: 1
    } );
  }

  for ( const { from: _from, transition, to } of automaton.mTransitions ) {
    edges.push( {
      from: _from,
      to,
      arrows: "to",
      label: `${transition.name}(${transition.arguments.join( ", " )})`
    } );
  }

  for ( const { from: _from, transition, to } of automaton.lTransitions ) {
    edges.push( {
      from: _from,
      to,
      arrows: "to",
      label: transition.name
    } );
  }

  const data = {
    nodes: new vis.DataSet( nodes ),
    edges: new vis.DataSet( edges )
  };

  const options = {
    layout: {
      // randomSeed: 293814 // network.getSeed()
    },
    edges: {
      arrows: {
        to: { enabled: true, scaleFactor: 1, type: "arrow" },
        middle: { enabled: false, scaleFactor: 1, type: "arrow" },
        from: { enabled: false, scaleFactor: 1, type: "arrow" }
      },
      font: {
        align: "top"
      }
    },
    physics: {
      enabled: true,
      solver: "repulsion",
      repulsion: {
        springLength: 220
      }
    }
  };

  const network = new vis.Network( container, data, options );

  // https://github.com/almende/vis/issues/2292
  /* network.on( "beforeDrawing", ctx => {
    // save current translate/zoom
    ctx.save();
    // reset transform to identity
    ctx.setTransform( 1, 0, 0, 1, 0, 0 );
    // fill background with solid white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    // restore old transform
    ctx.restore();
  } );*/

  return network;
}

export class AutomatonViewer extends LitElement {

  static get properties() {
    return {
      automaton: Object
    };
  }

  constructor() {
    super();
    this.container = document.createElement( "div" );
    this.container.className = "container";
  }

  download() {
    const anchor = document.createElement( "a" );
    anchor.download = "automaton.png";
    anchor.href = this.shadowRoot.querySelector( "canvas" ).toDataURL( "image/png" );
    anchor.click();
  }

  _shouldRender( props ) {
    if ( !props.automaton ) {
      return false;
    }
    createDemo( props.automaton, this.container );
    return true;
  }

  _render() {
    return html`
      <style>
        .container {
          width: 650px;
          height: 550px;
          border: 1px solid lightgray;
        }
      </style>
      <top-bar myTitle="" buttonText="Download" fn="${() => this.download()}"></top-bar>
      ${this.container}
    `;
  }

}

customElements.define( "automaton-viewer", AutomatonViewer );

/* globals window, document */

function createDemo( automaton ) {
  const vis = window.vis;

  const nodes = [];
  const edges = [];

  for ( const stateName in automaton.states ) {

    nodes.push( {
      id: stateName,
      label: /^decision:/.test( stateName ) ? "" : stateName,
      shape: /^decision:/.test( stateName ) ? "diamond" : "circle"
    } );

    const state = automaton.states[ stateName ];

    for ( const { transition, to } of state.transitions ) {

      let label;

      if ( transition.type === "Label" ) {
        label = transition.label.name;
      } else {
        label = `${transition.name}(${transition.arguments.join( ", " )})`;
      }

      edges.push( {
        from: stateName,
        to,
        arrows: "to",
        label
      } );
    }
  }

  const container = document.getElementById( "automaton" );

  const data = {
    nodes: new vis.DataSet( nodes ),
    edges: new vis.DataSet( edges )
  };

  const options = {
    layout: {
      randomSeed: 293814
    }
  };

  const network = new vis.Network( container, data, options );
  // console.log( network.getSeed() );
  return network;
}

class UI {

  constructor() {
    this.container = document.querySelector( "#ui" );
    this.textarea = document.querySelector( "#ui textarea" );
    this.button = document.querySelector( "#ui button" );
    this.error = document.querySelector( "#ui pre" );

    this.DEFAULT_TEXT = `typestate FileProtocol {

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

    this.textarea.value = this.DEFAULT_TEXT;

    this.button.addEventListener( "click", () => {
      try {
        const automaton = window.MungoTypestate( this.textarea.value );
        createDemo( automaton );
        this.error.innerText = "";
      } catch ( e ) {
        this.error.innerText = e.stack;
      }
    } );
  }

}

window.ui = new UI();

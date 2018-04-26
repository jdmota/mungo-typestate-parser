/* globals window, document */

function createDemo( automaton ) {
  const vis = window.vis;

  const invisible = ":invisible:";

  const nodes = [
    {
      id: invisible,
      size: 0,
      borderWidth: 0,
      color: {
        border: "#FFFFFF",
        background: "#FFFFFF"
      }
    }
  ];

  const edges = [
    {
      from: invisible,
      to: automaton.firstState,
      color: {
        color: "#848484"
      },
      arrows: "to"
    }
  ];

  for ( const stateName in automaton.states ) {

    nodes.push( {
      id: stateName,
      label: /^decision:/.test( stateName ) ? "" : stateName,
      shape: /^decision:/.test( stateName ) ? "diamond" : "circle",
      borderWidth: stateName === "end" ? 4 : 1
    } );

    const state = automaton.states[ stateName ];

    for ( const { transition, to } of state.transitions ) {

      let label;

      if ( transition.type === "Label" ) {
        label = transition.label.name;
      } else {
        label = `${transition.name}(${transition.arguments.map( a => a.name ).join( ", " )})`;
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
      // randomSeed: 293814 // network.getSeed()
    }
  };

  const network = new vis.Network( container, data, options );

  // https://github.com/almende/vis/issues/2292
  network.on( "beforeDrawing", ctx => {
    if ( !document.querySelector( "#background-option" ).checked ) {
      // save current translate/zoom
      ctx.save();
      // reset transform to identity
      ctx.setTransform( 1, 0, 0, 1, 0, 0 );
      // fill background with solid white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      // restore old transform
      ctx.restore();
    }
  } );

  return network;
}

class UI {

  constructor() {
    this.container = document.querySelector( "#ui" );
    this.textarea = document.querySelector( "#ui textarea" );
    this.show = document.querySelector( "#ui .show" );
    this.downloader = document.querySelector( "#ui .downloader" );
    this.error = document.querySelector( "#ui pre" );

    this.downloader.disabled = true;

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

    this.show.addEventListener( "click", () => {
      this.downloader.disabled = false;
      try {
        const automaton = window.MungoTypestate( this.textarea.value );
        createDemo( automaton );
        this.error.innerText = "";
      } catch ( e ) {
        this.error.innerText = e.message;
      }
    } );

    this.downloader.addEventListener( "click", () => {
      const anchor = document.createElement( "a" );
      anchor.download = "automaton.png"; // Does not support IE
      anchor.href = document.querySelector( "canvas" ).toDataURL( "image/png" );
      anchor.click();
    } );
  }

}

window.ui = new UI();

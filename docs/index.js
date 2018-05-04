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

  const container = document.getElementById( "automaton" );

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
        springLength: 225
      }
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

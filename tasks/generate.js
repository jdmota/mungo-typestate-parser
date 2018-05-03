const path = require( "path" );
const { URL } = require( "url" );
const fs = require( "fs-extra" );
const glob = require( "glob" );
const puppeteer = require( "puppeteer" );
const PDFDocument = require( "pdfkit" );

/* eslint-disable no-console, no-await-in-loop, no-inner-declarations */

const filesPromise = new Promise( ( resolve, reject ) => {
  glob( "test/fixtures/**/*.protocol", { nonull: false }, ( error, files ) => {
    if ( error ) {
      reject( error );
    } else {
      resolve( files.map( f => path.relative( process.cwd(), f ).replace( /\\/g, "/" ) ) );
    }
  } );
} );

async function run() {
  console.log( "Launching browser..." );

  const browser = await puppeteer.launch( {
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  } );

  console.log( "New page..." );

  const page = await browser.newPage();

  console.log( "Goto..." );

  const loc = new URL( path.join( __dirname, "../docs/index.html" ), "file://" ).href;

  console.log( loc );

  await page.goto( loc, { waitUntil: "load" } );

  console.log( "Getting files..." );

  const files = await filesPromise;

  const newPdf = new PDFDocument();
  newPdf.pipe( fs.createWriteStream( "tasks/output.pdf" ) );

  let first = true;

  for ( const file of files ) {

    console.log( file );

    let text = await fs.readFile( file, "utf8" );
    text = text.replace( /\t/g, "  " );

    const array = await page.evaluate( text => {

      /* eslint-disable no-undef */
      const doc = document;
      const FReader = FileReader;
      /* eslint-enable no-undef */

      const textarea = doc.querySelector( "textarea" );
      textarea.value = text;

      doc.querySelector( ".show" ).click();

      return new Promise( ( resolve, reject ) => {
        setTimeout( () => {
          doc.querySelector( "canvas" ).toBlob( blob => {
            const reader = new FReader();
            reader.onload = () => resolve( Array.from( new Uint8Array( reader.result ) ) );
            reader.onerror = reject;
            reader.readAsArrayBuffer( blob );
          } );
        }, 500 );
      } );

    }, text );

    const buffer = Buffer.from( array );

    if ( !first ) {
      newPdf.addPage();
    }

    newPdf.fontSize( 11 ).text( `// ${file}\n\n`, 50, 50 ).text( text ).image( buffer, {
      scale: 0.9
    } );

    first = false;

  }

  await browser.close();

  newPdf.end();
}

run();

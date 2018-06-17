const path = require( "path" );
const { URL } = require( "url" );
const fs = require( "fs-extra" );
const _glob = require( "glob" );
const puppeteer = require( "puppeteer" );
const PDFDocument = require( "pdfkit" );

/* eslint-disable no-console, no-await-in-loop, no-inner-declarations */

function glob( p ) {
  return new Promise( ( resolve, reject ) => {
    _glob( p, { nonull: false }, ( error, files ) => {
      if ( error ) {
        reject( error );
      } else {
        resolve( files.map( f => path.relative( process.cwd(), f ).replace( /\\/g, "/" ) ) );
      }
    } );
  } );
}

const fixturesPromise = glob( "test/fixtures/**/*.protocol" );
const fixturesErrorsPromise = glob( "test/fixtures-errors/**/*.protocol" );

async function run() {
  console.log( "Launching browser..." );

  const browser = await puppeteer.launch( {
    // headless: false,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  } );

  console.log( "New page..." );

  const page = await browser.newPage();

  console.log( "Goto..." );

  const loc = new URL( path.join( __dirname, "../docs/index.html#forcewhite" ), "file://" ).href;

  console.log( loc );

  await page.goto( loc, { waitUntil: [ "load" ] } );

  console.log( "Getting files..." );

  const globResult = await Promise.all( [ fixturesPromise, fixturesErrorsPromise ] );

  const newPdf = new PDFDocument();
  newPdf.pipe( fs.createWriteStream( "tasks/output.pdf" ) );

  let first = true;

  for ( const file of globResult[ 0 ].concat( globResult[ 1 ] ) ) {

    console.log( file );

    let text = await fs.readFile( file, "utf8" );
    text = text.replace( /\t/g, "  " );

    const result = await page.evaluate( text => {

      /* eslint-disable no-undef */
      const win = window;
      const FReader = FileReader;
      /* eslint-enable no-undef */

      win.__TEXTAREA__.value = text;

      win.__RENDER__();

      return new Promise( ( resolve, reject ) => {
        setTimeout( () => {

          const error = win.__ERROR__;

          if ( error ) {
            resolve( { error } );
            return;
          }

          win.__CANVAS__().toBlob( blob => {
            const reader = new FReader();
            reader.onload = () => resolve( Array.from( new Uint8Array( reader.result ) ) );
            reader.onerror = reject;
            reader.readAsArrayBuffer( blob );
          } );
        }, 600 );
      } );

    }, text );

    if ( !first ) {
      newPdf.addPage();
    }

    newPdf.fontSize( 10 ).text( `// ${file}\n\n`, 50, 50 ).text( text );

    if ( Array.isArray( result ) ) {

      const buffer = Buffer.from( result );

      newPdf.image( buffer, {
        scale: 0.7
      } );

    } else {

      newPdf.fillColor( "red" ).text( `\n${result.error}` ).fillColor( "black" );

    }

    first = false;

  }

  await browser.close();

  newPdf.end();
}

run();

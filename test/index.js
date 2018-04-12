import Parser from "../src/parser";

const path = require( "path" );
const fs = require( "fs-extra" );
const glob = require( "glob" );

it( "mungo examples", async() => {

  const files = await new Promise( ( resolve, reject ) => {
    glob( "test/fixtures/**/*.protocol", { nonull: false }, ( error, files ) => {
      if ( error ) {
        reject( error );
      } else {
        resolve( files );
      }
    } );
  } );

  const promises = [];

  for ( const file of files ) {
    promises.push( ( async() => {

      const text = await fs.readFile( file, "utf8" );
      const parser = new Parser( text );
      const relative = path.relative( process.cwd(), file ).replace( /\\/g, "/" );

      try {
        const ast = parser.parse();
        expect( ast ).toMatchSnapshot( `ast ${relative}` );
        expect( parser.states ).toMatchSnapshot( `automaton ${relative}` );
      } catch ( error ) {
        console.error( file, error.message );
        throw error;
      }

    } )() );
  }

  await Promise.all( promises );

} );

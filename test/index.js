import Parser from "../src/parser";
import createAutomaton from "../src/automaton";
import automatonToAst from "../src/automaton_to_ast";
import generator from "../src/generator";

const path = require( "path" );
const fs = require( "fs-extra" );
const _glob = require( "glob" );

function glob( p ) {
  return new Promise( ( resolve, reject ) => {
    _glob( p, { nonull: false }, ( error, files ) => {
      if ( error ) {
        reject( error );
      } else {
        resolve( files );
      }
    } );
  } );
}

function removeLocations( obj ) {
  if ( obj != null && typeof obj === "object" ) {
    delete obj.loc;
    for ( const key in obj ) {
      removeLocations( obj[ key ] );
    }
  }
  return obj;
}

it( "mungo examples", async() => {

  const files = await glob( "test/fixtures/**/*.protocol" );
  const promises = [];

  for ( const file of files ) {
    promises.push( ( async() => {

      const text = await fs.readFile( file, "utf8" );
      const parser = new Parser( text );
      const relative = path.relative( process.cwd(), file ).replace( /\\/g, "/" );

      const ast = parser.parse();
      expect( ast ).toMatchSnapshot( `ast ${relative}` );

      const automaton = createAutomaton( ast );
      expect( automaton ).toMatchSnapshot( `automaton ${relative}` );

      // Make sure transformation does not depend on the order of the states in the set
      const shuffledStates = Array.from( automaton.states );
      shuffledStates.push( shuffledStates.shift() );
      automaton.states = new Set( shuffledStates );

      removeLocations( ast );

      const newAst = automatonToAst( ast.name, automaton );
      expect( removeLocations( newAst ) ).toEqual( ast );

      const newText = generator( newAst );
      expect( newText ).toMatchSnapshot( `string ${relative}` );

      const newAst2 = new Parser( newText ).parse();
      expect( removeLocations( newAst2 ) ).toEqual( ast );

    } )().then( null, err => {
      console.error( file, err );
      throw err;
    } ) );
  }

  await Promise.all( promises );

} );

it( "error examples", async() => {

  const files = await glob( "test/fixtures-errors/**/*.protocol" );
  const promises = [];

  for ( const file of files ) {
    promises.push( ( async() => {

      const text = await fs.readFile( file, "utf8" );
      const parser = new Parser( text );
      const relative = path.relative( process.cwd(), file ).replace( /\\/g, "/" );

      expect( () => {
        const ast = parser.parse();
        createAutomaton( ast );
      } ).toThrowErrorMatchingSnapshot( relative );

    } )().then( null, err => {
      console.error( file, err );
      throw err;
    } ) );
  }

  await Promise.all( promises );

} );

// @flow
import type {
  Typestate, NamedState, State, Type, Method, DecisionState
} from "./ast_types";
import Tokenizer, { type Token } from "./tokenizer";

export default class Parser {

  +input: string;
  +tokenizer: Tokenizer;
  token: Token;
  decisionUuid: number;
  unknownUuid: number;

  constructor( input: string ) {
    this.input = input;
    this.tokenizer = new Tokenizer( input );
    this.token = this.next();
    this.decisionUuid = 1;
    this.unknownUuid = 1;
  }

  // Returns the next current token
  next(): Token {
    this.token = this.tokenizer.nextToken();
    return this.token;
  }

  // If we have a token with this type, we return in, and call "next". If not, we return null
  eat( type: string, value: ?string ): Token | null {
    const token = this.token;
    if ( token.type === type && ( value == null || token.value === value ) ) {
      this.next();
      return token;
    }
    return null;
  }

  // Returns "true" if the current token has this type
  match( type: string ): boolean {
    return this.token.type === type;
  }

  // Tries to consume a token with a specific type, and if it can't, it throws an error
  expect( type: string, value: ?string ): Token {
    let node = this.eat( type, value );
    if ( node == null ) {
      throw new Error( `Unexpected token ${this.token.type}, expected ${type} at ${this.tokenizer.pos}` ); // FIXME location
    }
    return node;
  }

  // Parsing starts here
  parse(): Typestate {

    // FIXME save package
    if ( this.eat( "identifier", "package" ) ) {
      this.expect( "identifier" );
      while ( this.eat( "." ) ) {
        this.expect( "identifier" );
      }
      this.expect( ";" );
    }

    // FIXME save imports
    while ( this.eat( "identifier", "import" ) ) {
      this.expect( "identifier" );
      while ( this.eat( "." ) ) {
        this.expect( "identifier" );
      }
      this.expect( ";" );
    }

    this.expect( "identifier", "typestate" );

    const name = this.expect( "identifier" ).value;
    const states = [];

    this.expect( "{" );

    while ( !this.eat( "}" ) ) {
      states.push( this.parseStateDefName() );
    }

    this.expect( "eof" );

    return {
      type: "Typestate",
      name,
      states
    };
  }

  // FIXME handle dots
  parseType(): Type {
    return {
      type: "Type",
      name: this.expect( "identifier" ).value
    };
  }

  parseStateDefName(): NamedState {

    const name = this.expect( "identifier" ).value;

    if ( name === "end" ) {
      throw new Error( "You cannot have a state called 'end'" );
    }

    this.expect( "=" );

    const { type, methods } = this.parseState();

    return {
      type,
      name,
      methods,
      _name: name
    };
  }

  parseState(): State {

    let _name = `unknown:${this.unknownUuid++}`;
    const methods = [];

    // FIXME method signatures don't defer on return type, just name and arguments

    this.expect( "{" );

    while ( !this.match( "}" ) ) {

      methods.push( this.parseMethod() );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    if ( methods.length === 0 ) {
      _name = "end";
    }

    this.expect( "}" );

    return {
      type: "State",
      name: null,
      methods,
      _name
    };
  }

  parseMethod(): Method {

    const returnType = this.parseType();
    const name = this.expect( "identifier" ).value;
    const args = [];

    if ( name === "end" ) {
      throw new Error( "Method cannot be called 'end'" );
    }

    this.expect( "(" );

    while ( !this.match( ")" ) ) {
      args.push( this.parseType() );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( ")" );
    this.expect( ":" );

    let transition;

    if ( this.match( "<" ) ) {
      transition = this.parseLabels();
    } else if ( this.match( "{" ) ) {
      transition = this.parseState();
    } else {
      transition = {
        type: "Identifier",
        name: this.expect( "identifier" ).value
      };
    }

    return {
      type: "Method",
      name,
      arguments: args,
      returnType,
      transition
    };
  }

  parseLabels(): DecisionState {
    const transitions = [];
    const _name = `decision:${this.decisionUuid++}`;

    this.expect( "<" );

    while ( !this.match( ">" ) ) {

      const label = this.parseType();

      this.expect( ":" );

      const stateName = this.expect( "identifier" ).value;

      transitions.push( [ label, stateName ] );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( ">" );

    return {
      type: "DecisionState",
      transitions,
      _name
    };
  }

}

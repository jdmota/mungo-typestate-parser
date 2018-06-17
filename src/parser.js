// @flow
import type {
  Typestate, NamedState, State, Identifier, Method, DecisionState
} from "./ast_types";
import Tokenizer, { type Token, type Position } from "./tokenizer";
import { error } from "./utils";

export default class Parser {

  +input: string;
  +tokenizer: Tokenizer;
  token: Token;
  start: Position;
  lastTokenEnd: Position;
  decisionUuid: number;
  unknownUuid: number;

  constructor( input: string ) {
    this.input = input;
    this.tokenizer = new Tokenizer( input );
    this.start = { pos: 0, line: 0, column: 0 };
    this.lastTokenEnd = this.start;
    this.token = this.tokenizer.nextToken();
    this.decisionUuid = 1;
    this.unknownUuid = 1;
  }

  startNode(): Position {
    return this.token.loc.start;
  }

  endNode(): Position {
    return this.lastTokenEnd;
  }

  // Returns the next current token
  next(): Token {
    this.lastTokenEnd = this.token.loc.end;
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
    const token = this.eat( type, value );
    if ( token == null ) {
      throw error(
        `Unexpected token ${this.token.type}, expected ${type}`,
        this.token.loc.start
      );
    }
    return token;
  }

  // Parsing starts here
  parse(): Typestate {

    const start = this.startNode();

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
      states,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

  parseIdentifier(): Identifier {
    const start = this.startNode();
    return {
      type: "Identifier",
      name: this.expect( "identifier" ).value,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

  parseStateDefName(): NamedState {

    const start = this.startNode();

    const name = this.expect( "identifier" ).value;

    if ( name === "end" ) {
      throw error( `You cannot have a state called 'end'`, start );
    }

    this.expect( "=" );

    const { type, methods } = this.parseState();

    return {
      type,
      name,
      methods,
      _name: name,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

  parseState(): State {

    const start = this.startNode();

    const _name = `unknown:${this.unknownUuid++}`;
    const methods = [];

    this.expect( "{" );

    if ( !this.match( "}" ) ) {
      while ( true ) {

        methods.push( this.parseMethod() );

        if ( !this.eat( "," ) ) {
          break;
        }
      }
    }

    this.expect( "}" );

    return {
      type: "State",
      name: null,
      methods,
      _name,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

  parseMethod(): Method {

    const start = this.startNode();

    const returnType = this.parseIdentifier();
    const name = this.expect( "identifier" ).value;
    const args = [];

    if ( name === "end" ) {
      throw error( `Method cannot be called 'end'`, start );
    }

    this.expect( "(" );

    if ( !this.match( ")" ) ) {
      while ( true ) {
        args.push( this.parseIdentifier() );

        if ( !this.eat( "," ) ) {
          break;
        }
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
      transition = this.parseIdentifier();
    }

    return {
      type: "Method",
      name,
      arguments: args,
      returnType,
      transition,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

  parseLabels(): DecisionState {

    const start = this.startNode();

    const transitions = [];
    const _name = `decision:${this.decisionUuid++}`;

    this.expect( "<" );

    while ( true ) {

      const label = this.parseIdentifier();

      this.expect( ":" );

      if ( this.match( "identifier" ) ) {
        transitions.push( [ label, this.parseIdentifier() ] );
      } else {
        transitions.push( [ label, this.parseState() ] );
      }

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( ">" );

    return {
      type: "DecisionState",
      transitions,
      _name,
      loc: {
        start,
        end: this.endNode()
      }
    };
  }

}

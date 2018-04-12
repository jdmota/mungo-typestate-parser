// @flow
import Tokenizer, { type Token } from "./tokenizer";

export default class Parser {

  +input: string;
  +tokenizer: Tokenizer;
  token: Token;
  +states: { [key: string]: { name: string, transitions: Object[] } };
  decisionUuid: number;
  unknownUuid: number;

  constructor( input: string ) {
    this.input = input;
    this.tokenizer = new Tokenizer( input );
    this.token = this.next();
    this.states = {};
    this.decisionUuid = 1;
    this.unknownUuid = 1;

    this.addState( "end" );
  }

  addState( name: string ) {
    this.states[ name ] = this.states[ name ] || {
      name,
      transitions: []
    };
    return this.states[ name ];
  }

  addTransition( name: string, transition: Object, to: string ) {
    this.addState( name ).transitions.push( {
      transition,
      to
      // this.addState( to )
    } );
  }

  next(): Token {
    this.token = this.tokenizer.nextToken();
    return this.token;
  }

  eat( type: string, value: ?string ): Token | null {
    const token = this.token;
    if ( token.type === type && ( value == null || token.value === value ) ) {
      this.next();
      return token;
    }
    return null;
  }

  match( type: string ): boolean {
    return this.token.type === type;
  }

  expect( type: string, value: ?string ): Token {
    let node = this.eat( type, value );
    if ( node == null ) {
      throw new Error( `Unexpected token ${this.token.type}, expected ${type} at ${this.tokenizer.pos}` ); // FIXME location
    }
    return node;
  }

  parse(): Object {
    const node: Object = {
      type: "Typestate",
      package: null,
      name: null,
      states: []
    };

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

    node.name = this.expect( "identifier" ).value;

    this.expect( "{" );

    while ( !this.eat( "}" ) ) {
      node.states.push( this.parseStateDefName() );
    }

    this.expect( "eof" );

    return node;
  }

  // FIXME handle dots
  parseType() {
    const node: Object = {
      type: "Type",
      name: null
    };

    node.name = this.expect( "identifier" ).value;

    return node;
  }

  parseStateDefName() {
    const node: Object = {
      type: "State",
      name: null,
      methods: [],
      _name: null
    };

    node.name = this.expect( "identifier" ).value;
    node._name = node.name;

    if ( node.name === "end" ) {
      throw new Error( "You cannot have a state called 'end'" );
    }

    this.expect( "=" );

    return this.parseState( node );
  }

  parseState( node: ?Object ) {
    node = node || {
      type: "State",
      name: null,
      methods: [],
      _name: `unknown:${this.unknownUuid++}`
    };

    this.expect( "{" );

    while ( !this.match( "}" ) ) {
      const method = this.parseMethod();
      node.methods.push( method );

      this.addTransition(
        node._name,
        {
          type: "Method",
          name: method.name,
          arguments: method.arguments,
          returnType: method.returnType.name
        },
        method.transition._name || method.transition.name
      );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( "}" );

    return node;
  }

  parseMethod() {
    const node: Object = {
      type: "Method",
      name: null,
      arguments: [],
      returnType: null,
      transition: null
    };

    node.returnType = this.parseType();
    node.name = this.expect( "identifier" ).value;

    if ( node.name === "end" ) {
      throw new Error( "Method cannot be called 'end'" );
    }

    this.expect( "(" );

    while ( !this.match( ")" ) ) {
      node.arguments.push( this.parseType() );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( ")" );
    this.expect( ":" );

    if ( this.match( "<" ) ) {
      node.transition = this.parseLabels();
    } else if ( this.match( "{" ) ) {
      node.transition = this.parseState();
    } else {
      node.transition = {
        type: "Identifier",
        name: this.expect( "identifier" ).value
      };
    }

    return node;
  }

  parseLabels() {
    const node: Object = {
      type: "DecisionState",
      transitions: [],
      _name: `decision:${this.decisionUuid++}`
    };

    this.expect( "<" );

    while ( !this.match( ">" ) ) {

      const label = this.parseType();

      this.expect( ":" );

      const stateName = this.expect( "identifier" ).value;

      node.transitions.push( [ label, stateName ] );

      this.addTransition(
        node._name,
        {
          type: "Label",
          name: label.name
        },
        stateName
      );

      if ( !this.eat( "," ) ) {
        break;
      }
    }

    this.expect( ">" );

    return node;
  }

}

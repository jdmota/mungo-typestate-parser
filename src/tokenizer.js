// @flow
// Based on babel/babylon's tokenizer

/* eslint default-case: 0, no-labels: 0, no-fallthrough: 0 */

// const lineBreak = /\r\n?|\n|\u2028|\u2029/;
const nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

function isIdentifierStart( code: number ): boolean {
  if ( code < 65 ) return code === 36; // 36 -> $
  if ( code < 91 ) return true; // 65-90 -> A-Z
  if ( code < 97 ) return code === 95; // 95 -> _
  if ( code < 123 ) return true; // 97-122 -> a-z
  return false;
}

function isIdentifierChar( code: number ): boolean {
  if ( code < 48 ) return code === 36; // 36 -> $
  if ( code < 58 ) return true; // 48-57 -> 0-9
  return isIdentifierStart( code );
}

export class Token {
  +type: string;
  +value: string;
  constructor( type: string, value: string ) {
    this.type = type;
    this.value = value;
  }
}

export default class Tokenizer {

  +input: string;
  +inputLen: number;
  pos: number;
  lastToken: Token;

  constructor( input: string ) {
    this.input = input;
    this.inputLen = input.length;
    this.pos = 0;
    this.lastToken = new Token( "", "" );
  }

  codeAt( pos: number ) {
    return this.input.charCodeAt( pos );
  }

  charAt( pos: number ) {
    return this.input.charAt( pos );
  }

  currToken(): Token {
    return this.lastToken;
  }

  nextToken(): Token {
    this.skipSpace();
    if ( this.pos >= this.inputLen ) {
      this.lastToken = new Token( "eof", "" );
    } else {
      this.lastToken = this.readToken( this.charAt( this.pos ) );
    }
    return this.lastToken;
  }

  skipSpace(): void {
    loop: while ( this.pos < this.inputLen ) {
      const ch = this.codeAt( this.pos );
      switch ( ch ) {
        case 32: // space
        case 160: // non-breaking space
          this.pos++;
          break;

        case 13: // '\r' carriage return
          if ( this.codeAt( this.pos + 1 ) === 10 ) {
            this.pos++;
          }

        case 10: // '\n' line feed
        case 8232: // line separator
        case 8233: // paragraph separator
          this.pos++;
          break;

        case 47: // '/'
          switch ( this.codeAt( this.pos + 1 ) ) {
            case 42: // '*'
              this.skipBlockComment();
              break;

            case 47:
              this.skipLineComment( 2 );
              break;

            default:
              break loop;
          }
          break;

        default:
          if (
            ( ch > 8 && ch < 14 ) ||
            ( ch >= 5760 && nonASCIIwhitespace.test( String.fromCharCode( ch ) ) )
          ) {
            this.pos++;
          } else {
            break loop;
          }
      }
    }
  }

  skipLineComment( startSkip: number ): void {

    let ch = this.codeAt( ( this.pos += startSkip ) );

    if ( this.pos < this.inputLen ) {
      while (
        ch !== 10 &&
        ch !== 13 &&
        ch !== 8232 &&
        ch !== 8233 &&
        ++this.pos < this.inputLen
      ) {
        ch = this.codeAt( this.pos );
      }
    }
  }

  skipBlockComment(): void {
    const end = this.input.indexOf( "*/", ( this.pos += 2 ) );
    if ( end === -1 ) {
      throw new Error( `Unterminated comment` );
    }
    this.pos = end + 2;
  }

  readWord(): Token {
    const start = this.pos;
    while ( this.pos < this.inputLen ) {
      if ( isIdentifierChar( this.codeAt( this.pos ) ) ) {
        this.pos++;
      } else {
        break;
      }
    }
    return new Token( "identifier", this.input.slice( start, this.pos ) );
  }

  readToken( char: string ): Token {
    switch ( char ) {
      case "<":
      case ">":
      case "(":
      case ")":
      case ":":
      case "{":
      case "}":
      case ",":
      case "=":
      case ".":
      case ";":
        this.pos++;
        return new Token( char, char );
    }

    if ( isIdentifierStart( char.charCodeAt( 0 ) ) ) {
      return this.readWord();
    }

    throw new Error( `Unexpected character '${this.charAt( this.pos )}'` );
  }

}

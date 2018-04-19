(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.MungoTypestate = factory());
}(this, (function () { 'use strict';

  // Based on babel/babylon's tokenizer

  /* eslint default-case: 0, no-labels: 0, no-fallthrough: 0 */
  // const lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  function isIdentifierStart(code) {
    if (code < 65) return code === 36; // 36 -> $

    if (code < 91) return true; // 65-90 -> A-Z

    if (code < 97) return code === 95; // 95 -> _

    if (code < 123) return true; // 97-122 -> a-z

    return false;
  }

  function isIdentifierChar(code) {
    if (code < 48) return code === 36; // 36 -> $

    if (code < 58) return true; // 48-57 -> 0-9

    return isIdentifierStart(code);
  }

  var Token = function Token(type, value) {
    this.type = type;
    this.value = value;
  };

  var Tokenizer =
  /*#__PURE__*/
  function () {
    function Tokenizer(input) {
      this.input = input;
      this.inputLen = input.length;
      this.pos = 0;
      this.lastToken = new Token("", "");
    }

    var _proto = Tokenizer.prototype;

    _proto.codeAt = function codeAt(pos) {
      return this.input.charCodeAt(pos);
    };

    _proto.charAt = function charAt(pos) {
      return this.input.charAt(pos);
    };

    _proto.currToken = function currToken() {
      return this.lastToken;
    };

    _proto.nextToken = function nextToken() {
      this.skipSpace();

      if (this.pos >= this.inputLen) {
        this.lastToken = new Token("eof", "");
      } else {
        this.lastToken = this.readToken(this.charAt(this.pos));
      }

      return this.lastToken;
    };

    _proto.skipSpace = function skipSpace() {
      loop: while (this.pos < this.inputLen) {
        var ch = this.codeAt(this.pos);

        switch (ch) {
          case 32: // space

          case 160:
            // non-breaking space
            this.pos++;
            break;

          case 13:
            // '\r' carriage return
            if (this.codeAt(this.pos + 1) === 10) {
              this.pos++;
            }

          case 10: // '\n' line feed

          case 8232: // line separator

          case 8233:
            // paragraph separator
            this.pos++;
            break;

          case 47:
            // '/'
            switch (this.codeAt(this.pos + 1)) {
              case 42:
                // '*'
                this.skipBlockComment();
                break;

              case 47:
                this.skipLineComment(2);
                break;

              default:
                break loop;
            }

            break;

          default:
            if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
              this.pos++;
            } else {
              break loop;
            }

        }
      }
    };

    _proto.skipLineComment = function skipLineComment(startSkip) {
      var ch = this.codeAt(this.pos += startSkip);

      if (this.pos < this.inputLen) {
        while (ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233 && ++this.pos < this.inputLen) {
          ch = this.codeAt(this.pos);
        }
      }
    };

    _proto.skipBlockComment = function skipBlockComment() {
      var end = this.input.indexOf("*/", this.pos += 2);

      if (end === -1) {
        throw new Error("Unterminated comment");
      }

      this.pos = end + 2;
    };

    _proto.readWord = function readWord() {
      var start = this.pos;

      while (this.pos < this.inputLen) {
        if (isIdentifierChar(this.codeAt(this.pos))) {
          this.pos++;
        } else {
          break;
        }
      }

      return new Token("identifier", this.input.slice(start, this.pos));
    };

    _proto.readToken = function readToken(char) {
      switch (char) {
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
          return new Token(char, char);
      }

      if (isIdentifierStart(char.charCodeAt(0))) {
        return this.readWord();
      }

      throw new Error("Unexpected character '" + this.charAt(this.pos) + "'");
    };

    return Tokenizer;
  }();

  var Parser =
  /*#__PURE__*/
  function () {
    function Parser(input) {
      this.input = input;
      this.tokenizer = new Tokenizer(input);
      this.token = this.next();
      this.states = {};
      this.decisionUuid = 1;
      this.unknownUuid = 1;
      this.addState("end");
    }

    var _proto = Parser.prototype;

    _proto.addState = function addState(name) {
      this.states[name] = this.states[name] || {
        name: name,
        transitions: []
      };
      return this.states[name];
    };

    _proto.addTransition = function addTransition(name, transition, to) {
      this.addState(name).transitions.push({
        transition: transition,
        to: to // this.addState( to )

      });
    };

    _proto.next = function next() {
      this.token = this.tokenizer.nextToken();
      return this.token;
    };

    _proto.eat = function eat(type, value) {
      var token = this.token;

      if (token.type === type && (value == null || token.value === value)) {
        this.next();
        return token;
      }

      return null;
    };

    _proto.match = function match(type) {
      return this.token.type === type;
    };

    _proto.expect = function expect(type, value) {
      var node = this.eat(type, value);

      if (node == null) {
        throw new Error("Unexpected token " + this.token.type + ", expected " + type + " at " + this.tokenizer.pos); // FIXME location
      }

      return node;
    };

    _proto.parse = function parse() {
      var node = {
        type: "Typestate",
        package: null,
        name: null,
        states: []
      }; // FIXME save package

      if (this.eat("identifier", "package")) {
        this.expect("identifier");

        while (this.eat(".")) {
          this.expect("identifier");
        }

        this.expect(";");
      } // FIXME save imports


      while (this.eat("identifier", "import")) {
        this.expect("identifier");

        while (this.eat(".")) {
          this.expect("identifier");
        }

        this.expect(";");
      }

      this.expect("identifier", "typestate");
      node.name = this.expect("identifier").value;
      this.expect("{");

      while (!this.eat("}")) {
        node.states.push(this.parseStateDefName());
      }

      this.expect("eof");
      return node;
    }; // FIXME handle dots


    _proto.parseType = function parseType() {
      var node = {
        type: "Type",
        name: null
      };
      node.name = this.expect("identifier").value;
      return node;
    };

    _proto.parseStateDefName = function parseStateDefName() {
      var node = {
        type: "State",
        name: null,
        methods: [],
        _name: null
      };
      node.name = this.expect("identifier").value;
      node._name = node.name;

      if (node.name === "end") {
        throw new Error("You cannot have a state called 'end'");
      }

      this.expect("=");
      return this.parseState(node);
    };

    _proto.parseState = function parseState(node) {
      node = node || {
        type: "State",
        name: null,
        methods: [],
        _name: "unknown:" + this.unknownUuid++
      }; // FIXME point state without transitions to 'end'
      // FIXME method signatures don't defer on return type, just name and arguments
      // FIXME don't allow for duplicate named states
      // FIXME deal with the usage of unknown states

      this.expect("{");

      while (!this.match("}")) {
        var method = this.parseMethod();
        node.methods.push(method);
        this.addTransition(node._name, {
          type: "Method",
          name: method.name,
          arguments: method.arguments,
          returnType: method.returnType.name
        }, method.transition._name || method.transition.name);

        if (!this.eat(",")) {
          break;
        }
      }

      this.expect("}");
      return node;
    };

    _proto.parseMethod = function parseMethod() {
      var node = {
        type: "Method",
        name: null,
        arguments: [],
        returnType: null,
        transition: null
      };
      node.returnType = this.parseType();
      node.name = this.expect("identifier").value;

      if (node.name === "end") {
        throw new Error("Method cannot be called 'end'");
      }

      this.expect("(");

      while (!this.match(")")) {
        node.arguments.push(this.parseType());

        if (!this.eat(",")) {
          break;
        }
      }

      this.expect(")");
      this.expect(":");

      if (this.match("<")) {
        node.transition = this.parseLabels();
      } else if (this.match("{")) {
        node.transition = this.parseState();
      } else {
        node.transition = {
          type: "Identifier",
          name: this.expect("identifier").value
        };
      }

      return node;
    };

    _proto.parseLabels = function parseLabels() {
      var node = {
        type: "DecisionState",
        transitions: [],
        _name: "decision:" + this.decisionUuid++
      };
      this.expect("<");

      while (!this.match(">")) {
        var label = this.parseType();
        this.expect(":");
        var stateName = this.expect("identifier").value;
        node.transitions.push([label, stateName]);
        this.addTransition(node._name, {
          type: "Label",
          name: label.name
        }, stateName);

        if (!this.eat(",")) {
          break;
        }
      }

      this.expect(">");
      return node;
    };

    return Parser;
  }();

  function index (text) {
    var parser = new Parser(text);
    parser.parse();
    return {
      numberOfStates: Object.keys(parser.states).length,
      states: parser.states
    };
  }

  return index;

})));

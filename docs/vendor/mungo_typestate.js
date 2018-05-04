(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.MungoTypestate = factory());
}(this, (function () { 'use strict';

  // Based on babel/babylon's tokenizer

  /* eslint default-case: 0, no-fallthrough: 0 */
  // Reference: https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html
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
      while (this.pos < this.inputLen) {
        var ch = this.codeAt(this.pos);

        switch (ch) {
          case 9: // horizontal tab

          case 10: // '\n' line feed

          case 12: // form feed

          case 13: // '\r' carriage return

          case 32:
            // space
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
                this.skipLineComment();
                break;

              default:
                return;
            }

            break;

          default:
            return;
        }
      }
    };

    _proto.skipLineComment = function skipLineComment() {
      var ch = this.codeAt(this.pos += 2);

      if (this.pos < this.inputLen) {
        while (ch !== 10 && ch !== 13 && ++this.pos < this.inputLen) {
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

      var word = this.input.slice(start, this.pos);
      return new Token("identifier", word);
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
      this.decisionUuid = 1;
      this.unknownUuid = 1;
    } // Returns the next current token


    var _proto = Parser.prototype;

    _proto.next = function next() {
      this.token = this.tokenizer.nextToken();
      return this.token;
    }; // If we have a token with this type, we return in, and call "next". If not, we return null


    _proto.eat = function eat(type, value) {
      var token = this.token;

      if (token.type === type && (value == null || token.value === value)) {
        this.next();
        return token;
      }

      return null;
    }; // Returns "true" if the current token has this type


    _proto.match = function match(type) {
      return this.token.type === type;
    }; // Tries to consume a token with a specific type, and if it can't, it throws an error


    _proto.expect = function expect(type, value) {
      var node = this.eat(type, value);

      if (node == null) {
        throw new Error("Unexpected token " + this.token.type + ", expected " + type + " at " + this.tokenizer.pos); // FIXME location
      }

      return node;
    }; // Parsing starts here


    _proto.parse = function parse() {
      // FIXME save package
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
      var name = this.expect("identifier").value;
      var states = [];
      this.expect("{");

      while (!this.eat("}")) {
        states.push(this.parseStateDefName());
      }

      this.expect("eof");
      return {
        type: "Typestate",
        name: name,
        states: states
      };
    }; // FIXME handle dots


    _proto.parseType = function parseType() {
      return {
        type: "Identifier",
        name: this.expect("identifier").value
      };
    };

    _proto.parseStateDefName = function parseStateDefName() {
      var name = this.expect("identifier").value;

      if (name === "end") {
        throw new Error("You cannot have a state called 'end'");
      }

      this.expect("=");

      var _this$parseState = this.parseState(),
          type = _this$parseState.type,
          methods = _this$parseState.methods;

      return {
        type: type,
        name: name,
        methods: methods,
        _name: name
      };
    };

    _proto.parseState = function parseState() {
      var _name = "unknown:" + this.unknownUuid++;

      var methods = [];
      this.expect("{");

      if (!this.match("}")) {
        while (true) {
          methods.push(this.parseMethod());

          if (!this.eat(",")) {
            break;
          }
        }
      }

      if (methods.length === 0) {
        _name = "end";
      }

      this.expect("}");
      return {
        type: "State",
        name: null,
        methods: methods,
        _name: _name
      };
    };

    _proto.parseMethod = function parseMethod() {
      var returnType = this.parseType();
      var name = this.expect("identifier").value;
      var args = [];

      if (name === "end") {
        throw new Error("Method cannot be called 'end'");
      }

      this.expect("(");

      if (!this.match(")")) {
        while (true) {
          args.push(this.parseType());

          if (!this.eat(",")) {
            break;
          }
        }
      }

      this.expect(")");
      this.expect(":");
      var transition;

      if (this.match("<")) {
        transition = this.parseLabels();
      } else if (this.match("{")) {
        transition = this.parseState();
      } else {
        transition = {
          type: "Identifier",
          name: this.expect("identifier").value
        };
      }

      return {
        type: "Method",
        name: name,
        arguments: args,
        returnType: returnType,
        transition: transition
      };
    };

    _proto.parseLabels = function parseLabels() {
      var transitions = [];

      var _name = "decision:" + this.decisionUuid++;

      this.expect("<");

      while (true) {
        var label = this.parseType();
        this.expect(":");
        var stateName = this.expect("identifier").value;
        transitions.push([label, stateName]);

        if (!this.eat(",")) {
          break;
        }
      }

      this.expect(">");
      return {
        type: "DecisionState",
        transitions: transitions,
        _name: _name
      };
    };

    return Parser;
  }();

  function checkState(automaton, name) {
    if (/:/.test(name)) {
      if (/^decision:/.test(name)) {
        automaton.choices.add(name);
      } else {
        automaton.states.add(name);
      }
    } else if (!automaton.states.has(name)) {
      throw new Error("State not defined: " + name);
    }
  }

  function equalSignature(a, b) {
    if (a.name !== b.name) {
      return false;
    }

    if (a.arguments.length !== b.arguments.length) {
      return false;
    }

    for (var i = 0; i < a.arguments.length; i++) {
      if (a.arguments[i].name !== b.arguments[i].name) {
        return false;
      }
    }

    return true;
  }

  function traverseTypestate(node, automaton) {
    for (var _iterator = node.states, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var state = _ref;
      traverseState(state, automaton);
    }
  }

  function traverseState(node, automaton) {
    var fromName = node._name;
    checkState(automaton, fromName);

    if (node.methods.length === 0) {
      automaton.final.add(fromName);
      return;
    }

    for (var i = 0; i < node.methods.length; i++) {
      var method = node.methods[i];

      for (var j = 0; j < i; j++) {
        if (equalSignature(method, node.methods[j])) {
          throw new Error("Duplicate method signature: " + method.name + "(" + method.arguments.map(function (a) {
            return a.name;
          }).join(", ") + ")");
        }
      }

      var transitionNode = method.transition;
      var toName = "";

      if (transitionNode.type === "State") {
        traverseState(transitionNode, automaton);
        toName = transitionNode._name;
      } else if (transitionNode.type === "DecisionState") {
        traverseDecisionState(transitionNode, automaton);
        toName = transitionNode._name;
      } else if (method.transition.type === "Identifier") {
        toName = transitionNode.name;
      }

      checkState(automaton, toName);
      var m = {
        name: method.name,
        arguments: method.arguments.map(function (a) {
          return a.name;
        }),
        returnType: method.returnType.name
      };
      automaton.methods.push(m);
      automaton.mTransitions.push({
        from: fromName,
        transition: m,
        to: toName
      });
    }
  }

  function traverseDecisionState(node, automaton) {
    var set = new Set();
    var fromName = node._name;
    checkState(automaton, fromName);

    for (var _iterator2 = node.transitions, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var _ref3 = _ref2,
          label = _ref3[0],
          toName = _ref3[1];
      var labelName = label.name;

      if (set.has(labelName)) {
        throw new Error("Duplicate case label: " + labelName);
      }

      checkState(automaton, toName);
      var l = {
        name: labelName
      };
      automaton.labels.push(l);
      automaton.lTransitions.push({
        from: fromName,
        transition: l,
        to: toName
      });
      set.add(labelName);
    }
  }

  function createAutomaton (ast) {
    var automaton = {
      states: new Set(),
      choices: new Set(),
      methods: [],
      labels: [],
      start: "",
      final: new Set(),
      mTransitions: [],
      lTransitions: []
    };
    automaton.states.add("end");
    automaton.final.add("end");

    for (var _iterator3 = ast.states, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref4 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref4 = _i3.value;
      }

      var _ref5 = _ref4,
          name = _ref5.name;

      if (automaton.states.has(name)) {
        throw new Error("Duplicated " + name + " state");
      }

      automaton.states.add(name);
      automaton.start = automaton.start || name;
    }

    automaton.start = automaton.start || "end";
    traverseTypestate(ast, automaton);
    return automaton;
  }

  function index (text) {
    var parser = new Parser(text);
    var ast = parser.parse();
    return createAutomaton(ast);
  }

  return index;

})));

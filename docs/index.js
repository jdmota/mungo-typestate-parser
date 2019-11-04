(function () {
    'use strict';

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */const directives=new WeakMap;const isDirective=a=>"function"==typeof a&&directives.has(a);

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */ /**
     * True if the custom elements polyfill is in use.
     */const isCEPolyfill=window.customElements!==void 0&&window.customElements.polyfillWrapFlushCallback!==void 0;/**
     * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
     * `container`.
     */const removeNodes=(a,b,c=null)=>{for(;b!==c;){const c=b.nextSibling;a.removeChild(b),b=c;}};

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */ /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */const noChange={};/**
     * A sentinel value that signals a NodePart to fully clear its content.
     */const nothing={};

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */ /**
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */const marker=`{{lit-${(Math.random()+"").slice(2)}}}`;/**
     * An expression marker used text-positions, multi-binding attributes, and
     * attributes with markup-like text values.
     */const nodeMarker=`<!--${marker}-->`;const markerRegex=new RegExp(`${marker}|${nodeMarker}`);/**
     * Suffix appended to all bound attribute names.
     */const boundAttributeSuffix="$lit$";/**
     * An updateable Template that tracks the location of dynamic parts.
     */class Template{constructor(a,b){this.parts=[],this.element=b;const c=[],d=[],e=document.createTreeWalker(b.content,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);// Keeps track of the last index associated with a part. We try to delete
    // unnecessary nodes, but we never want to associate two different parts
    // to the same index. They must have a constant node between.
    let f=0,g=-1,h=0;for(const{strings:i,values:{length:j}}=a;h<j;){const a=e.nextNode();if(null===a){e.currentNode=d.pop();continue}if(g++,1===a.nodeType/* Node.ELEMENT_NODE */){if(a.hasAttributes()){const b=a.attributes,{length:c}=b;// Per
    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
    // attributes are not guaranteed to be returned in document order.
    // In particular, Edge/IE can return them out of order, so we cannot
    // assume a correspondence between part index and attribute index.
    let d=0;for(let a=0;a<c;a++)endsWith(b[a].name,boundAttributeSuffix)&&d++;for(;0<d--;){// Get the template literal section leading up to the first
    // expression in this attribute
    const b=i[h],c=lastAttributeNameRegex.exec(b)[2],d=c.toLowerCase()+boundAttributeSuffix,e=a.getAttribute(d);// Find the attribute name
    a.removeAttribute(d);const f=e.split(markerRegex);this.parts.push({type:"attribute",index:g,name:c,strings:f}),h+=f.length-1;}}"TEMPLATE"===a.tagName&&(d.push(a),e.currentNode=a.content);}else if(3===a.nodeType/* Node.TEXT_NODE */){const b=a.data;if(0<=b.indexOf(marker)){const d=a.parentNode,e=b.split(markerRegex),f=e.length-1;// Generate a new text node for each literal section
    // These nodes are also used as the markers for node parts
    for(let b=0;b<f;b++){let c,f=e[b];if(""===f)c=createMarker();else{const a=lastAttributeNameRegex.exec(f);null!==a&&endsWith(a[2],boundAttributeSuffix)&&(f=f.slice(0,a.index)+a[1]+a[2].slice(0,-boundAttributeSuffix.length)+a[3]),c=document.createTextNode(f);}d.insertBefore(c,a),this.parts.push({type:"node",index:++g});}// If there's no text, we must insert a comment to mark our place.
    // Else, we can trust it will stick around after cloning.
    ""===e[f]?(d.insertBefore(createMarker(),a),c.push(a)):a.data=e[f],h+=f;}}else if(8===a.nodeType/* Node.COMMENT_NODE */)if(a.data===marker){const b=a.parentNode;// Add a new marker node to be the startNode of the Part if any of
    // the following are true:
    //  * We don't have a previousSibling
    //  * The previousSibling is already the start of a previous part
    (null===a.previousSibling||g===f)&&(g++,b.insertBefore(createMarker(),a)),f=g,this.parts.push({type:"node",index:g}),null===a.nextSibling?a.data="":(c.push(a),g--),h++;}else for(let b=-1;-1!==(b=a.data.indexOf(marker,b+1));)// Comment node has a binding marker inside, make an inactive part
    // The binding won't work, but subsequent bindings will
    // TODO (justinfagnani): consider whether it's even worth it to
    // make bindings in comments work
    this.parts.push({type:"node",index:-1}),h++;}// Remove text binding nodes after the walk to not disturb the TreeWalker
    for(const d of c)d.parentNode.removeChild(d);}}const endsWith=(a,b)=>{const c=a.length-b.length;return 0<=c&&a.slice(c)===b};const isTemplatePartActive=a=>-1!==a.index;// Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.
    const createMarker=()=>document.createComment("");/**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#elements-attributes
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-characters
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
     * space character except " ".
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */const lastAttributeNameRegex=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */class TemplateInstance{constructor(a,b,c){this.__parts=[],this.template=a,this.processor=b,this.options=c;}update(a){let b=0;for(const c of this.__parts)void 0!==c&&c.setValue(a[b]),b++;for(const b of this.__parts)void 0!==b&&b.commit();}_clone(){// There are a number of steps in the lifecycle of a template instance's
    // DOM fragment:
    //  1. Clone - create the instance fragment
    //  2. Adopt - adopt into the main document
    //  3. Process - find part markers and create parts
    //  4. Upgrade - upgrade custom elements
    //  5. Update - set node, attribute, property, etc., values
    //  6. Connect - connect to the document. Optional and outside of this
    //     method.
    //
    // We have a few constraints on the ordering of these steps:
    //  * We need to upgrade before updating, so that property values will pass
    //    through any property setters.
    //  * We would like to process before upgrading so that we're sure that the
    //    cloned fragment is inert and not disturbed by self-modifying DOM.
    //  * We want custom elements to upgrade even in disconnected fragments.
    //
    // Given these constraints, with full custom elements support we would
    // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
    //
    // But Safari dooes not implement CustomElementRegistry#upgrade, so we
    // can not implement that order and still have upgrade-before-update and
    // upgrade disconnected fragments. So we instead sacrifice the
    // process-before-upgrade constraint, since in Custom Elements v1 elements
    // must not modify their light DOM in the constructor. We still have issues
    // when co-existing with CEv0 elements like Polymer 1, and with polyfills
    // that don't strictly adhere to the no-modification rule because shadow
    // DOM, which may be created in the constructor, is emulated by being placed
    // in the light DOM.
    //
    // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
    // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
    // in one step.
    //
    // The Custom Elements v1 polyfill supports upgrade(), so the order when
    // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
    // Connect.
    const a=isCEPolyfill?this.template.element.content.cloneNode(/** skipRestoreFocus */!0):document.importNode(this.template.element.content,!0),b=[],c=this.template.parts,d=document.createTreeWalker(a,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);let e,f=0,g=0,h=d.nextNode();// Loop through all the nodes and parts of a template
    for(;f<c.length;){if(e=c[f],!isTemplatePartActive(e)){this.__parts.push(void 0),f++;continue}// Progress the tree walker until we find our next part's node.
    // Note that multiple parts may share the same node (attribute parts
    // on a single element), so this loop may not run at all.
    for(;g<e.index;)g++,"TEMPLATE"===h.nodeName&&(b.push(h),d.currentNode=h.content),null===(h=d.nextNode())&&(d.currentNode=b.pop(),h=d.nextNode());// We've arrived at our part's node.
    if("node"===e.type){const a=this.processor.handleTextExpression(this.options);a.insertAfterNode(h.previousSibling),this.__parts.push(a);}else this.__parts.push(...this.processor.handleAttributeExpressions(h,e.name,e.strings,this.options));f++;}return isCEPolyfill&&(document.adoptNode(a),customElements.upgrade(a)),a}}

    const commentMarker=` ${marker} `;/**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */class TemplateResult{constructor(a,b,c,d){this.strings=a,this.values=b,this.type=c,this.processor=d;}/**
         * Returns a string of HTML used to create a `<template>` element.
         */getHTML(){const a=this.strings.length-1;let b="",c=!1;for(let d=0;d<a;d++){const a=this.strings[d],e=a.lastIndexOf("<!--");// For each binding we want to determine the kind of marker to insert
    // into the template source before it's parsed by the browser's HTML
    // parser. The marker type is based on whether the expression is in an
    // attribute, text, or comment poisition.
    //   * For node-position bindings we insert a comment with the marker
    //     sentinel as its text content, like <!--{{lit-guid}}-->.
    //   * For attribute bindings we insert just the marker sentinel for the
    //     first binding, so that we support unquoted attribute bindings.
    //     Subsequent bindings can use a comment marker because multi-binding
    //     attributes must be quoted.
    //   * For comment bindings we insert just the marker sentinel so we don't
    //     close the comment.
    //
    // The following code scans the template source, but is *not* an HTML
    // parser. We don't need to track the tree structure of the HTML, only
    // whether a binding is inside a comment, and if not, if it appears to be
    // the first binding in an attribute.
    c=(-1<e||c)&&-1===a.indexOf("-->",e+1);// Check to see if we have an attribute-like sequence preceeding the
    // expression. This can match "name=value" like structures in text,
    // comments, and attribute values, so there can be false-positives.
    const f=lastAttributeNameRegex.exec(a);b+=null===f?a+(c?commentMarker:nodeMarker):a.substr(0,f.index)+f[1]+f[2]+boundAttributeSuffix+f[3]+marker;}return b+=this.strings[a],b}getTemplateElement(){const a=document.createElement("template");return a.innerHTML=this.getHTML(),a}}

    const isPrimitive=a=>null===a||"object"!=typeof a&&"function"!=typeof a;const isIterable=a=>Array.isArray(a)||// tslint:disable-next-line:no-any
    !!(a&&a[Symbol.iterator]);/**
     * Writes attribute values to the DOM for a group of AttributeParts bound to a
     * single attibute. The value is only set once even if there are multiple parts
     * for an attribute.
     */class AttributeCommitter{constructor(a,b,c){this.dirty=/** skipRestoreFocus */!0,this.element=a,this.name=b,this.strings=c,this.parts=[];for(let d=0;d<c.length-1;d++)this.parts[d]=this._createPart();}/**
         * Creates a single part. Override this to create a differnt type of part.
         */_createPart(){return new AttributePart(this)}_getValue(){const a=this.strings,b=a.length-1;let c="";for(let d=0;d<b;d++){c+=a[d];const b=this.parts[d];if(void 0!==b){const a=b.value;if(isPrimitive(a)||!isIterable(a))c+="string"==typeof a?a:a+"";else for(const b of a)c+="string"==typeof b?b:b+"";}}return c+=a[b],c}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()));}}/**
     * A Part that controls all or part of an attribute value.
     */class AttributePart{constructor(a){this.value=void 0,this.committer=a;}setValue(a){a===noChange||isPrimitive(a)&&a===this.value||(this.value=a,!isDirective(a)&&(this.committer.dirty=!0));}commit(){for(;isDirective(this.value);){const a=this.value;this.value=noChange,a(this);}this.value===noChange||this.committer.commit();}}/**
     * A Part that controls a location within a Node tree. Like a Range, NodePart
     * has start and end locations and can set and update the Nodes between those
     * locations.
     *
     * NodeParts support several value types: primitives, Nodes, TemplateResults,
     * as well as arrays and iterables of those types.
     */class NodePart{constructor(a){this.value=void 0,this.__pendingValue=void 0,this.options=a;}/**
         * Appends this part into a container.
         *
         * This part must be empty, as its contents are not automatically moved.
         */appendInto(a){this.startNode=a.appendChild(createMarker()),this.endNode=a.appendChild(createMarker());}/**
         * Inserts this part after the `ref` node (between `ref` and `ref`'s next
         * sibling). Both `ref` and its next sibling must be static, unchanging nodes
         * such as those that appear in a literal section of a template.
         *
         * This part must be empty, as its contents are not automatically moved.
         */insertAfterNode(a){this.startNode=a,this.endNode=a.nextSibling;}/**
         * Appends this part into a parent part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */appendIntoPart(a){a.__insert(this.startNode=createMarker()),a.__insert(this.endNode=createMarker());}/**
         * Inserts this part after the `ref` part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */insertAfterPart(a){a.__insert(this.startNode=createMarker()),this.endNode=a.endNode,a.endNode=this.startNode;}setValue(a){this.__pendingValue=a;}commit(){for(;isDirective(this.__pendingValue);){const a=this.__pendingValue;this.__pendingValue=noChange,a(this);}const a=this.__pendingValue;a===noChange||(isPrimitive(a)?a!==this.value&&this.__commitText(a):a instanceof TemplateResult?this.__commitTemplateResult(a):a instanceof Node?this.__commitNode(a):isIterable(a)?this.__commitIterable(a):a===nothing?(this.value=nothing,this.clear()):this.__commitText(a));}__insert(a){this.endNode.parentNode.insertBefore(a,this.endNode);}__commitNode(a){this.value===a||(this.clear(),this.__insert(a),this.value=a);}__commitText(a){const b=this.startNode.nextSibling;a=null==a?"":a;// If `value` isn't already a string, we explicitly convert it here in case
    // it can't be implicitly converted - i.e. it's a symbol.
    const c="string"==typeof a?a:a+"";b===this.endNode.previousSibling&&3===b.nodeType/* Node.TEXT_NODE */?b.data=c:this.__commitNode(document.createTextNode(c)),this.value=a;}__commitTemplateResult(a){const b=this.options.templateFactory(a);if(this.value instanceof TemplateInstance&&this.value.template===b)this.value.update(a.values);else{// Make sure we propagate the template processor from the TemplateResult
    // so that we use its syntax extension, etc. The template factory comes
    // from the render function options so that it can control template
    // caching and preprocessing.
    const c=new TemplateInstance(b,a.processor,this.options),d=c._clone();c.update(a.values),this.__commitNode(d),this.value=c;}}__commitIterable(a){Array.isArray(this.value)||(this.value=[],this.clear());// Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render
    const b=this.value;let c,d=0;for(const e of a)// Try to reuse an existing part
    c=b[d],void 0===c&&(c=new NodePart(this.options),b.push(c),0===d?c.appendIntoPart(this):c.insertAfterPart(b[d-1])),c.setValue(e),c.commit(),d++;d<b.length&&(b.length=d,this.clear(c&&c.endNode));}clear(a=this.startNode){removeNodes(this.startNode.parentNode,a.nextSibling,this.endNode);}}/**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */class BooleanAttributePart{constructor(a,b,c){if(this.value=void 0,this.__pendingValue=void 0,2!==c.length||""!==c[0]||""!==c[1])throw new Error("Boolean attributes can only contain a single expression");this.element=a,this.name=b,this.strings=c;}setValue(a){this.__pendingValue=a;}commit(){for(;isDirective(this.__pendingValue);){const a=this.__pendingValue;this.__pendingValue=noChange,a(this);}if(this.__pendingValue!==noChange){const a=!!this.__pendingValue;this.value!==a&&(a?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=a),this.__pendingValue=noChange;}}}/**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */class PropertyCommitter extends AttributeCommitter{constructor(a,b,c){super(a,b,c),this.single=2===c.length&&""===c[0]&&""===c[1];}_createPart(){return new PropertyPart(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue());}}class PropertyPart extends AttributePart{}// Detect event listener options support. If the `capture` property is read
    // from the options object, then options are supported. If not, then the thrid
    // argument to add/removeEventListener is interpreted as the boolean capture
    // value so we should only pass the `capture` property.
    let eventOptionsSupported=!1;try{const a={get capture(){return eventOptionsSupported=!0,!1}};// tslint:disable-next-line:no-any
    // tslint:disable-next-line:no-any
    window.addEventListener("test",a,a),window.removeEventListener("test",a,a);}catch(a){}class EventPart{constructor(a,b,c){this.value=void 0,this.__pendingValue=void 0,this.element=a,this.eventName=b,this.eventContext=c,this.__boundHandleEvent=a=>this.handleEvent(a);}setValue(a){this.__pendingValue=a;}commit(){for(;isDirective(this.__pendingValue);){const a=this.__pendingValue;this.__pendingValue=noChange,a(this);}if(this.__pendingValue===noChange)return;const a=this.__pendingValue,b=this.value,c=null==a||null!=b&&(a.capture!==b.capture||a.once!==b.once||a.passive!==b.passive);c&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),null!=a&&(null==b||c)&&(this.__options=getOptions(a),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=a,this.__pendingValue=noChange;}handleEvent(a){"function"==typeof this.value?this.value.call(this.eventContext||this.element,a):this.value.handleEvent(a);}}// We copy options because of the inconsistent behavior of browsers when reading
    // the third argument of add/removeEventListener. IE11 doesn't support options
    // at all. Chrome 41 only reads `capture` if the argument is an object.
    const getOptions=a=>a&&(eventOptionsSupported?{capture:a.capture,passive:a.passive,once:a.once}:a.capture);

    /**
     * Creates Parts when a template is instantiated.
     */class DefaultTemplateProcessor{/**
         * Create parts for an attribute-position binding, given the event, attribute
         * name, and string literals.
         *
         * @param element The element containing the binding
         * @param name  The attribute name
         * @param strings The string literals. There are always at least two strings,
         *   event for fully-controlled bindings with a single expression.
         */handleAttributeExpressions(a,b,c,d){const e=b[0];if("."===e){const d=new PropertyCommitter(a,b.slice(1),c);return d.parts}if("@"===e)return [new EventPart(a,b.slice(1),d.eventContext)];if("?"===e)return [new BooleanAttributePart(a,b.slice(1),c)];const f=new AttributeCommitter(a,b,c);return f.parts}/**
         * Create parts for a text-position binding.
         * @param templateFactory
         */handleTextExpression(a){return new NodePart(a)}}const defaultTemplateProcessor=new DefaultTemplateProcessor;

    /**
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */function templateFactory(a){let b=templateCaches.get(a.type);void 0===b&&(b={stringsArray:new WeakMap,keyString:new Map},templateCaches.set(a.type,b));let c=b.stringsArray.get(a.strings);if(void 0!==c)return c;// If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const d=a.strings.join(marker);// Check if we already have a Template for this key
    return c=b.keyString.get(d),void 0===c&&(c=new Template(a,a.getTemplateElement()),b.keyString.set(d,c)),b.stringsArray.set(a.strings,c),c}const templateCaches=new Map;

    const parts=new WeakMap;/**
     * Renders a template result or other value to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result Any value renderable by NodePart - typically a TemplateResult
     *     created by evaluating a template tag like `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param options RenderOptions for the entire render tree rendered to this
     *     container. Render options must *not* change between renders to the same
     *     container, as those changes will not effect previously rendered DOM.
     */const render=(a,b,c)=>{let d=parts.get(b);d===void 0&&(removeNodes(b,b.firstChild),parts.set(b,d=new NodePart(Object.assign({templateFactory},c))),d.appendInto(b)),d.setValue(a),d.commit();};

    // This line will be used in regexes to search for lit-html usage.
    // TODO(justinfagnani): inject version number at build time
    (window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.1.2");/**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */const html=(a,...b)=>new TemplateResult(a,b,"html",defaultTemplateProcessor);

    const walkerNodeFilter=133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;/**
     * Removes the list of nodes from a Template safely. In addition to removing
     * nodes from the Template, the Template part indices are updated to match
     * the mutated Template DOM.
     *
     * As the template is walked the removal state is tracked and
     * part indices are adjusted as needed.
     *
     * div
     *   div#1 (remove) <-- start removing (removing node is div#1)
     *     div
     *       div#2 (remove)  <-- continue removing (removing node is still div#1)
     *         div
     * div <-- stop removing since previous sibling is the removing node (div#1,
     * removed 4 nodes)
     */function removeNodesFromTemplate(a,b){const{element:{content:d},parts:c}=a,e=document.createTreeWalker(d,walkerNodeFilter,null,!1);let f=nextActiveIndexInTemplateParts(c),g=c[f],h=-1,i=0;const j=[];for(let d=null;e.nextNode();){h++;const a=e.currentNode;// End removal if stepped past the removing node
    for(a.previousSibling===d&&(d=null),b.has(a)&&(j.push(a),null===d&&(d=a)),null!==d&&i++;g!==void 0&&g.index===h;)// If part is in a removed node deactivate it by setting index to -1 or
    // adjust the index as needed.
    // go to the next active part.
    g.index=null===d?g.index-i:-1,f=nextActiveIndexInTemplateParts(c,f),g=c[f];}j.forEach(a=>a.parentNode.removeChild(a));}const countNodes=a=>{let b=11===a.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */?0:1;for(const c=document.createTreeWalker(a,walkerNodeFilter,null,!1);c.nextNode();)b++;return b},nextActiveIndexInTemplateParts=(a,b=-1)=>{for(let c=b+1;c<a.length;c++){const b=a[c];if(isTemplatePartActive(b))return c}return -1};/**
     * Inserts the given node into the Template, optionally before the given
     * refNode. In addition to inserting the node into the Template, the Template
     * part indices are updated to match the mutated Template DOM.
     */function insertNodeIntoTemplate(a,b,c=null){const{element:{content:e},parts:d}=a;// If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if(null===c||void 0===c)return void e.appendChild(b);const f=document.createTreeWalker(e,walkerNodeFilter,null,!1);let g=nextActiveIndexInTemplateParts(d),h=0,i=-1;for(;f.nextNode();){i++;const a=f.currentNode;for(a===c&&(h=countNodes(b),c.parentNode.insertBefore(b,c));-1!==g&&d[g].index===i;){// If we've inserted the node, simply adjust all subsequent parts
    if(0<h){for(;-1!==g;)d[g].index+=h,g=nextActiveIndexInTemplateParts(d,g);return}g=nextActiveIndexInTemplateParts(d,g);}}}

    const getTemplateCacheKey=(a,b)=>`${a}--${b}`;let compatibleShadyCSSVersion=!0;"undefined"==typeof window.ShadyCSS?compatibleShadyCSSVersion=!1:"undefined"==typeof window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),compatibleShadyCSSVersion=!1);/**
     * Template factory which scopes template DOM using ShadyCSS.
     * @param scopeName {string}
     */const shadyTemplateFactory=a=>b=>{const c=getTemplateCacheKey(b.type,a);let d=templateCaches.get(c);void 0===d&&(d={stringsArray:new WeakMap,keyString:new Map},templateCaches.set(c,d));let e=d.stringsArray.get(b.strings);if(void 0!==e)return e;const f=b.strings.join(marker);if(e=d.keyString.get(f),void 0===e){const c=b.getTemplateElement();compatibleShadyCSSVersion&&window.ShadyCSS.prepareTemplateDom(c,a),e=new Template(b,c),d.keyString.set(f,e);}return d.stringsArray.set(b.strings,e),e},TEMPLATE_TYPES=["html","svg"],removeStylesFromLitTemplates=a=>{TEMPLATE_TYPES.forEach(b=>{const c=templateCaches.get(getTemplateCacheKey(b,a));c!==void 0&&c.keyString.forEach(a=>{const{element:{content:b}}=a,c=new Set;// IE 11 doesn't support the iterable param Set constructor
    Array.from(b.querySelectorAll("style")).forEach(a=>{c.add(a);}),removeNodesFromTemplate(a,c);});});},shadyRenderSet=new Set,prepareTemplateStyles=(a,b,c)=>{shadyRenderSet.add(a);// If `renderedDOM` is stamped from a Template, then we need to edit that
    // Template's underlying template element. Otherwise, we create one here
    // to give to ShadyCSS, which still requires one while scoping.
    const d=!c?document.createElement("template"):c.element,e=b.querySelectorAll("style"),{length:f}=e;// Move styles out of rendered DOM and store.
    // If there are no styles, skip unnecessary work
    if(0===f)return void window.ShadyCSS.prepareTemplateStyles(d,a);const g=document.createElement("style");// Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for(let d=0;d<f;d++){const a=e[d];a.parentNode.removeChild(a),g.textContent+=a.textContent;}// Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(a);// And then put the condensed style into the "root" template passed in as
    // `template`.
    const h=d.content;!c?h.insertBefore(g,h.firstChild):insertNodeIntoTemplate(c,g,h.firstChild),window.ShadyCSS.prepareTemplateStyles(d,a);const i=h.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==i)// When in native Shadow DOM, ensure the style created by ShadyCSS is
    // included in initially rendered output (`renderedDOM`).
    b.insertBefore(i.cloneNode(!0),b.firstChild);else if(!!c){h.insertBefore(g,h.firstChild);const a=new Set;a.add(g),removeNodesFromTemplate(c,a);}};/**
     * Extension to the standard `render` method which supports rendering
     * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
     * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
     * or when the webcomponentsjs
     * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
     *
     * Adds a `scopeName` option which is used to scope element DOM and stylesheets
     * when native ShadowDOM is unavailable. The `scopeName` will be added to
     * the class attribute of all rendered DOM. In addition, any style elements will
     * be automatically re-written with this `scopeName` selector and moved out
     * of the rendered DOM and into the document `<head>`.
     *
     * It is common to use this render method in conjunction with a custom element
     * which renders a shadowRoot. When this is done, typically the element's
     * `localName` should be used as the `scopeName`.
     *
     * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
     * custom properties (needed only on older browsers like IE11) and a shim for
     * a deprecated feature called `@apply` that supports applying a set of css
     * custom properties to a given location.
     *
     * Usage considerations:
     *
     * * Part values in `<style>` elements are only applied the first time a given
     * `scopeName` renders. Subsequent changes to parts in style elements will have
     * no effect. Because of this, parts in style elements should only be used for
     * values that will never change, for example parts that set scope-wide theme
     * values or parts which render shared style elements.
     *
     * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
     * custom element's `constructor` is not supported. Instead rendering should
     * either done asynchronously, for example at microtask timing (for example
     * `Promise.resolve()`), or be deferred until the first time the element's
     * `connectedCallback` runs.
     *
     * Usage considerations when using shimmed custom properties or `@apply`:
     *
     * * Whenever any dynamic changes are made which affect
     * css custom properties, `ShadyCSS.styleElement(element)` must be called
     * to update the element. There are two cases when this is needed:
     * (1) the element is connected to a new parent, (2) a class is added to the
     * element that causes it to match different custom properties.
     * To address the first case when rendering a custom element, `styleElement`
     * should be called in the element's `connectedCallback`.
     *
     * * Shimmed custom properties may only be defined either for an entire
     * shadowRoot (for example, in a `:host` rule) or via a rule that directly
     * matches an element with a shadowRoot. In other words, instead of flowing from
     * parent to child as do native css custom properties, shimmed custom properties
     * flow only from shadowRoots to nested shadowRoots.
     *
     * * When using `@apply` mixing css shorthand property names with
     * non-shorthand names (for example `border` and `border-width`) is not
     * supported.
     */const render$1=(a,b,c)=>{if(!c||"object"!=typeof c||!c.scopeName)throw new Error("The `scopeName` option is required.");const d=c.scopeName,e=parts.has(b),f=compatibleShadyCSSVersion&&11===b.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */&&!!b.host,g=f&&!shadyRenderSet.has(d),h=g?document.createDocumentFragment():b;// When performing first scope render,
    // (1) We've rendered into a fragment so that there's a chance to
    // `prepareTemplateStyles` before sub-elements hit the DOM
    // (which might cause them to render based on a common pattern of
    // rendering in a custom element's `connectedCallback`);
    // (2) Scope the template with ShadyCSS one time only for this scope.
    // (3) Render the fragment into the container and make sure the
    // container knows its `part` is the one we just rendered. This ensures
    // DOM will be re-used on subsequent renders.
    if(render(a,h,Object.assign({templateFactory:shadyTemplateFactory(d)},c)),g){const a=parts.get(h);parts.delete(h);// ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
    // that should apply to `renderContainer` even if the rendered value is
    // not a TemplateInstance. However, it will only insert scoped styles
    // into the document if `prepareTemplateStyles` has already been called
    // for the given scope name.
    const c=a.value instanceof TemplateInstance?a.value.template:void 0;prepareTemplateStyles(d,h,c),removeNodes(b,b.firstChild),b.appendChild(h),parts.set(b,a);}// After elements have hit the DOM, update styling if this is the
    // initial render to this container.
    // This is needed whenever dynamic changes are made so it would be
    // safest to do every render; however, this would regress performance
    // so we leave it up to the user to call `ShadyCSS.styleElement`
    // for dynamic changes.
    !e&&f&&window.ShadyCSS.styleElement(b.host);};

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */var _a;/**
     * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
     * replaced at compile time by the munged name for object[property]. We cannot
     * alias this function, so we have to use a small shim that has the same
     * behavior when not compiling.
     */window.JSCompiler_renameProperty=a=>a;const defaultConverter={toAttribute(a,b){return b===Boolean?a?"":null:b===Object||b===Array?null==a?a:JSON.stringify(a):a},fromAttribute(a,b){return b===Boolean?null!==a:b===Number?null===a?null:+a:b===Object||b===Array?JSON.parse(a):a}};/**
     * Change function that returns true if `value` is different from `oldValue`.
     * This method is used as the default for a property's `hasChanged` function.
     */const notEqual=(a,b)=>b!==a&&(b===b||a===a);const defaultPropertyDeclaration={attribute:!0,type:String,converter:defaultConverter,reflect:!1,hasChanged:notEqual},microtaskPromise=Promise.resolve(!0),STATE_HAS_UPDATED=1,STATE_UPDATE_REQUESTED=4,STATE_IS_REFLECTING_TO_ATTRIBUTE=8,STATE_IS_REFLECTING_TO_PROPERTY=16,STATE_HAS_CONNECTED=32,finalized="finalized";/**
     * Base element class which manages element properties and attributes. When
     * properties change, the `update` method is asynchronously called. This method
     * should be supplied by subclassers to render updates as desired.
     */class UpdatingElement extends HTMLElement{constructor(){/**
             * Map with keys for any properties that have changed since the last
             * update cycle with previous values.
             */ /**
             * Map with keys of properties that should be reflected when updated.
             */super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=microtaskPromise,this._hasConnectedResolver=void 0,this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize();}/**
         * Returns a list of attributes corresponding to the registered properties.
         * @nocollapse
         */static get observedAttributes(){this.finalize();const a=[];// Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    return this._classProperties.forEach((b,c)=>{const d=this._attributeNameForProperty(c,b);void 0!==d&&(this._attributeToPropertyMap.set(d,c),a.push(d));}),a}/**
         * Ensures the private `_classProperties` property metadata is created.
         * In addition to `finalize` this is also called in `createProperty` to
         * ensure the `@property` decorator can add property metadata.
         */ /** @nocollapse */static _ensureClassProperties(){// ensure private storage for property declarations.
    if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;// NOTE: Workaround IE11 not supporting Map constructor argument.
    const a=Object.getPrototypeOf(this)._classProperties;a!==void 0&&a.forEach((a,b)=>this._classProperties.set(b,a));}}/**
         * Creates a property accessor on the element prototype if one does not exist.
         * The property setter calls the property's `hasChanged` property option
         * or uses a strict identity check to determine whether or not to request
         * an update.
         * @nocollapse
         */static createProperty(a,b=defaultPropertyDeclaration){// Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it
    if(this._ensureClassProperties(),this._classProperties.set(a,b),b.noAccessor||this.prototype.hasOwnProperty(a))return;const c="symbol"==typeof a?Symbol():`__${a}`;Object.defineProperty(this.prototype,a,{// tslint:disable-next-line:no-any no symbol in index
    get(){return this[c]},set(b){const d=this[a];this[c]=b,this._requestUpdate(a,d);},configurable:!0,enumerable:!0});}/**
         * Creates property accessors for registered properties and ensures
         * any superclasses are also finalized.
         * @nocollapse
         */static finalize(){// finalize any superclasses
    const a=Object.getPrototypeOf(this);// make any properties
    // Note, only process "own" properties since this element will inherit
    // any properties defined on the superClass, and finalization ensures
    // the entire prototype chain is finalized.
    if(a.hasOwnProperty(finalized)||a.finalize(),this[finalized]=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const a=this.properties,b=[...Object.getOwnPropertyNames(a),...("function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(a):[])];// support symbols in properties (IE11 does not support this)
    // This for/of is ok because propKeys is an array
    for(const c of b)// note, use of `any` is due to TypeSript lack of support for symbol in
    // index types
    // tslint:disable-next-line:no-any no symbol in index
    this.createProperty(c,a[c]);}}/**
         * Returns the property name for the given attribute `name`.
         * @nocollapse
         */static _attributeNameForProperty(a,b){const c=b.attribute;return !1===c?void 0:"string"==typeof c?c:"string"==typeof a?a.toLowerCase():void 0}/**
         * Returns true if a property should request an update.
         * Called when a property value is set and uses the `hasChanged`
         * option for the property if present or a strict identity check.
         * @nocollapse
         */static _valueHasChanged(a,b,c=notEqual){return c(a,b)}/**
         * Returns the property value for the given attribute value.
         * Called via the `attributeChangedCallback` and uses the property's
         * `converter` or `converter.fromAttribute` property option.
         * @nocollapse
         */static _propertyValueFromAttribute(a,b){const c=b.type,d=b.converter||defaultConverter,e="function"==typeof d?d:d.fromAttribute;return e?e(a,c):a}/**
         * Returns the attribute value for the given property value. If this
         * returns undefined, the property will *not* be reflected to an attribute.
         * If this returns null, the attribute will be removed, otherwise the
         * attribute will be set to the value.
         * This uses the property's `reflect` and `type.toAttribute` property options.
         * @nocollapse
         */static _propertyValueToAttribute(a,b){if(void 0===b.reflect)return;const c=b.type,d=b.converter,e=d&&d.toAttribute||defaultConverter.toAttribute;return e(a,c)}/**
         * Performs element initialization. By default captures any pre-set values for
         * registered properties.
         */initialize(){// ensures first update will be caught by an early access of
    // `updateComplete`
    this._saveInstanceProperties(),this._requestUpdate();}/**
         * Fixes any properties set on the instance before upgrade time.
         * Otherwise these would shadow the accessor and break these properties.
         * The properties are stored in a Map which is played back after the
         * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
         * (<=41), properties created for native platform properties like (`id` or
         * `name`) may not have default values set in the element constructor. On
         * these browsers native properties appear on instances and therefore their
         * default value will overwrite any element default (e.g. if the element sets
         * this.id = 'id' in the constructor, the 'id' will become '' since this is
         * the native platform default).
         */_saveInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    this.constructor._classProperties.forEach((a,b)=>{if(this.hasOwnProperty(b)){const a=this[b];delete this[b],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(b,a);}});}/**
         * Applies previously saved instance properties.
         */_applyInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    // tslint:disable-next-line:no-any
    this._instanceProperties.forEach((a,b)=>this[b]=a),this._instanceProperties=void 0;}connectedCallback(){this._updateState|=STATE_HAS_CONNECTED,this._hasConnectedResolver&&(this._hasConnectedResolver(),this._hasConnectedResolver=void 0);}/**
         * Allows for `super.disconnectedCallback()` in extensions while
         * reserving the possibility of making non-breaking feature additions
         * when disconnecting at some point in the future.
         */disconnectedCallback(){}/**
         * Synchronizes property values when attributes change.
         */attributeChangedCallback(a,b,c){b!==c&&this._attributeToProperty(a,c);}_propertyToAttribute(a,b,c=defaultPropertyDeclaration){const d=this.constructor,e=d._attributeNameForProperty(a,c);if(e!==void 0){const a=d._propertyValueToAttribute(b,c);// an undefined value does not change the attribute.
    if(a===void 0)return;// Track if the property is being reflected to avoid
    // setting the property again via `attributeChangedCallback`. Note:
    // 1. this takes advantage of the fact that the callback is synchronous.
    // 2. will behave incorrectly if multiple attributes are in the reaction
    // stack at time of calling. However, since we process attributes
    // in `update` this should not be possible (or an extreme corner case
    // that we'd like to discover).
    // mark state reflecting
    // mark state not reflecting
    this._updateState|=STATE_IS_REFLECTING_TO_ATTRIBUTE,null==a?this.removeAttribute(e):this.setAttribute(e,a),this._updateState&=~STATE_IS_REFLECTING_TO_ATTRIBUTE;}}_attributeToProperty(a,b){// Use tracking info to avoid deserializing attribute value if it was
    // just set from a property setter.
    if(this._updateState&STATE_IS_REFLECTING_TO_ATTRIBUTE)return;const c=this.constructor,d=c._attributeToPropertyMap.get(a);if(d!==void 0){const a=c._classProperties.get(d)||defaultPropertyDeclaration;// mark state reflecting
    // mark state not reflecting
    this._updateState|=STATE_IS_REFLECTING_TO_PROPERTY,this[d]=// tslint:disable-next-line:no-any
    c._propertyValueFromAttribute(b,a),this._updateState&=~STATE_IS_REFLECTING_TO_PROPERTY;}}/**
         * This private version of `requestUpdate` does not access or return the
         * `updateComplete` promise. This promise can be overridden and is therefore
         * not free to access.
         */_requestUpdate(a,b){let c=!0;// If we have a property key, perform property update steps.
    if(a!==void 0){const d=this.constructor,e=d._classProperties.get(a)||defaultPropertyDeclaration;d._valueHasChanged(this[a],b,e.hasChanged)?(!this._changedProperties.has(a)&&this._changedProperties.set(a,b),!0===e.reflect&&!(this._updateState&STATE_IS_REFLECTING_TO_PROPERTY)&&(this._reflectingProperties===void 0&&(this._reflectingProperties=new Map),this._reflectingProperties.set(a,e))):c=!1;}!this._hasRequestedUpdate&&c&&this._enqueueUpdate();}/**
         * Requests an update which is processed asynchronously. This should
         * be called when an element should update based on some state not triggered
         * by setting a property. In this case, pass no arguments. It should also be
         * called when manually implementing a property setter. In this case, pass the
         * property `name` and `oldValue` to ensure that any configured property
         * options are honored. Returns the `updateComplete` Promise which is resolved
         * when the update completes.
         *
         * @param name {PropertyKey} (optional) name of requesting property
         * @param oldValue {any} (optional) old value of requesting property
         * @returns {Promise} A Promise that is resolved when the update completes.
         */requestUpdate(a,b){return this._requestUpdate(a,b),this.updateComplete}/**
         * Sets up the element to asynchronously update.
         */async _enqueueUpdate(){this._updateState|=STATE_UPDATE_REQUESTED;let a,b;const c=this._updatePromise;this._updatePromise=new Promise((c,d)=>{a=c,b=d;});try{// Ensure any previous update has resolved before updating.
    // This `await` also ensures that property changes are batched.
    await c;}catch(a){}// Ignore any previous errors. We only care that the previous cycle is
    // done. Any error should have been handled in the previous update.
    // Make sure the element has connected before updating.
    this._hasConnected||(await new Promise(a=>this._hasConnectedResolver=a));try{const a=this.performUpdate();// If `performUpdate` returns a Promise, we await it. This is done to
    // enable coordinating updates with a scheduler. Note, the result is
    // checked to avoid delaying an additional microtask unless we need to.
    null!=a&&(await a);}catch(a){b(a);}a(!this._hasRequestedUpdate);}get _hasConnected(){return this._updateState&STATE_HAS_CONNECTED}get _hasRequestedUpdate(){return this._updateState&STATE_UPDATE_REQUESTED}get hasUpdated(){return this._updateState&STATE_HAS_UPDATED}/**
         * Performs an element update. Note, if an exception is thrown during the
         * update, `firstUpdated` and `updated` will not be called.
         *
         * You can override this method to change the timing of updates. If this
         * method is overridden, `super.performUpdate()` must be called.
         *
         * For instance, to schedule updates to occur just before the next frame:
         *
         * ```
         * protected async performUpdate(): Promise<unknown> {
         *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
         *   super.performUpdate();
         * }
         * ```
         */performUpdate(){this._instanceProperties&&this._applyInstanceProperties();let a=!1;const b=this._changedProperties;try{a=this.shouldUpdate(b),a&&this.update(b);}catch(b){throw a=!1,b}finally{// Ensure element can accept additional updates after an exception.
    this._markUpdated();}a&&(!(this._updateState&STATE_HAS_UPDATED)&&(this._updateState|=STATE_HAS_UPDATED,this.firstUpdated(b)),this.updated(b));}_markUpdated(){this._changedProperties=new Map,this._updateState&=~STATE_UPDATE_REQUESTED;}/**
         * Returns a Promise that resolves when the element has completed updating.
         * The Promise value is a boolean that is `true` if the element completed the
         * update without triggering another update. The Promise result is `false` if
         * a property was set inside `updated()`. If the Promise is rejected, an
         * exception was thrown during the update.
         *
         * To await additional asynchronous work, override the `_getUpdateComplete`
         * method. For example, it is sometimes useful to await a rendered element
         * before fulfilling this Promise. To do this, first await
         * `super._getUpdateComplete()`, then any subsequent state.
         *
         * @returns {Promise} The Promise returns a boolean that indicates if the
         * update resolved without triggering another update.
         */get updateComplete(){return this._getUpdateComplete()}/**
         * Override point for the `updateComplete` promise.
         *
         * It is not safe to override the `updateComplete` getter directly due to a
         * limitation in TypeScript which means it is not possible to call a
         * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
         * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
         * This method should be overridden instead. For example:
         *
         *   class MyElement extends LitElement {
         *     async _getUpdateComplete() {
         *       await super._getUpdateComplete();
         *       await this._myChild.updateComplete;
         *     }
         *   }
         */_getUpdateComplete(){return this._updatePromise}/**
         * Controls whether or not `update` should be called when the element requests
         * an update. By default, this method always returns `true`, but this can be
         * customized to control when to update.
         *
         * * @param _changedProperties Map of changed properties with old values
         */shouldUpdate(a){return !0}/**
         * Updates the element. This method reflects property values to attributes.
         * It can be overridden to render and keep updated element DOM.
         * Setting properties inside this method will *not* trigger
         * another update.
         *
         * * @param _changedProperties Map of changed properties with old values
         */update(a){this._reflectingProperties!==void 0&&0<this._reflectingProperties.size&&(this._reflectingProperties.forEach((a,b)=>this._propertyToAttribute(b,this[b],a)),this._reflectingProperties=void 0);}/**
         * Invoked whenever the element is updated. Implement to perform
         * post-updating tasks via DOM APIs, for example, focusing an element.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * * @param _changedProperties Map of changed properties with old values
         */updated(a){}/**
         * Invoked when the element is first updated. Implement to perform one time
         * work on the element after update.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * * @param _changedProperties Map of changed properties with old values
         */firstUpdated(a){}}/**
     * Marks class as having finished creating properties.
     */_a=finalized,UpdatingElement[_a]=!0;

    /**
    @license
    Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */const supportsAdoptingStyleSheets="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype;const constructionToken=Symbol();class CSSResult{constructor(a,b){if(b!==constructionToken)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=a;}// Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet(){return void 0===this._styleSheet&&(supportsAdoptingStyleSheets?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}/**
     * Wrap a value for interpolation in a css tagged template literal.
     *
     * This is unsafe because untrusted CSS text can be used to phone home
     * or exfiltrate data to an attacker controlled site. Take care to only use
     * this with trusted input.
     */const unsafeCSS=a=>new CSSResult(a+"",constructionToken);const textFromCSSResult=a=>{if(a instanceof CSSResult)return a.cssText;if("number"==typeof a)return a;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${a}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`)};/**
     * Template tag which which can be used with LitElement's `style` property to
     * set element styles. For security reasons, only literal string values may be
     * used. To incorporate non-literal values `unsafeCSS` may be used inside a
     * template string part.
     */const css=(a,...b)=>{const c=b.reduce((b,c,d)=>b+textFromCSSResult(c)+a[d+1],a[0]);return new CSSResult(c,constructionToken)};

    // This line will be used in regexes to search for LitElement usage.
    // TODO(justinfagnani): inject version number at build time
    (window.litElementVersions||(window.litElementVersions=[])).push("2.2.1");/**
     * Minimal implementation of Array.prototype.flat
     * @param arr the array to flatten
     * @param result the accumlated result
     */function arrayFlat(a,b=[]){for(let c=0,d=a.length;c<d;c++){const d=a[c];Array.isArray(d)?arrayFlat(d,b):b.push(d);}return b}/** Deeply flattens styles array. Uses native flat if available. */const flattenStyles=a=>a.flat?a.flat(1/0):arrayFlat(a);class LitElement extends UpdatingElement{/** @nocollapse */static finalize(){// The Closure JS Compiler does not always preserve the correct "this"
    // when calling static super methods (b/137460243), so explicitly bind.
    // Prepare styling that is stamped at first render time. Styling
    // is built from user provided `styles` or is inherited from the superclass.
    super.finalize.call(this),this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[];}/** @nocollapse */static _getUniqueStyles(){// Take care not to call `this.styles` multiple times since this generates
    // new CSSResults each time.
    // TODO(sorvell): Since we do not cache CSSResults by input, any
    // shared styles will generate new stylesheet objects, which is wasteful.
    // This should be addressed when a browser ships constructable
    // stylesheets.
    const a=this.styles,b=[];if(Array.isArray(a)){const c=flattenStyles(a),d=c.reduceRight((a,b)=>(a.add(b),a),new Set);// As a performance optimization to avoid duplicated styling that can
    // occur especially when composing via subclassing, de-duplicate styles
    // preserving the last item in the list. The last item is kept to
    // try to preserve cascade order with the assumption that it's most
    // important that last added styles override previous styles.
    // Array.from does not work on Set in IE
    d.forEach(a=>b.unshift(a));}else a&&b.push(a);return b}/**
         * Performs element initialization. By default this calls `createRenderRoot`
         * to create the element `renderRoot` node and captures any pre-set values for
         * registered properties.
         */initialize(){super.initialize(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles();}/**
         * Returns the node into which the element should render and by default
         * creates and returns an open shadowRoot. Implement to customize where the
         * element's DOM is rendered. For example, to render into the element's
         * childNodes, return `this`.
         * @returns {Element|DocumentFragment} Returns a node into which to render.
         */createRenderRoot(){return this.attachShadow({mode:"open"})}/**
         * Applies styling to the element shadowRoot using the `static get styles`
         * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
         * available and will fallback otherwise. When Shadow DOM is polyfilled,
         * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
         * is available but `adoptedStyleSheets` is not, styles are appended to the
         * end of the `shadowRoot` to [mimic spec
         * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
         */adoptStyles(){const a=this.constructor._styles;0===a.length||(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow?supportsAdoptingStyleSheets?this.renderRoot.adoptedStyleSheets=a.map(a=>a.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(a.map(a=>a.cssText),this.localName));// There are three separate cases here based on Shadow DOM support.
    // (1) shadowRoot polyfilled: use ShadyCSS
    // (2) shadowRoot.adoptedStyleSheets available: use it.
    // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
    // rendering
    }connectedCallback(){super.connectedCallback(),this.hasUpdated&&window.ShadyCSS!==void 0&&window.ShadyCSS.styleElement(this);}/**
         * Updates the element. This method reflects property values to attributes
         * and calls `render` to render DOM via lit-html. Setting properties inside
         * this method will *not* trigger another update.
         * * @param _changedProperties Map of changed properties with old values
         */update(a){super.update(a);const b=this.render();b instanceof TemplateResult&&this.constructor.render(b,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(a=>{const b=document.createElement("style");b.textContent=a.cssText,this.renderRoot.appendChild(b);}));}/**
         * Invoked on each update to perform rendering tasks. This method must return
         * a lit-html TemplateResult. Setting properties inside this method will *not*
         * trigger the element to update.
         */render(){}}/**
     * Ensure this class is marked as `finalized` as an optimization ensuring
     * it will not needlessly try to `finalize`.
     *
     * Note this property name is a string to prevent breaking Closure JS Compiler
     * optimizations. See updating-element.ts for more information.
     */ /**
     * Render method used to render the lit-html TemplateResult to the element's
     * DOM.
     * @param {TemplateResult} Template to render.
     * @param {Element|DocumentFragment} Node into which to render.
     * @param {String} Element name.
     * @nocollapse
     */LitElement.finalized=!0,LitElement.render=render$1;

    /* globals document, customElements */class ErrorDisplay extends LitElement{static get properties(){return {text:{type:String,reflect:!1}}}render(){return html`<pre>${this.text||""}</pre>`}}ErrorDisplay.styles=css`
  :host {
    display: block;
  }
  pre {
    color: red;
    white-space: pre-wrap;
  }
  `,customElements.define("error-display",ErrorDisplay);

    /* globals window, document, location, customElements, vis */function createDemo(a,b){console.log(a);const c=[{id:":invisible:",size:0,borderWidth:0,color:{border:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)"}}],d=[{from:":invisible:",to:a.start,color:{color:"#848484"},arrows:"to"}];for(const d of a.states)c.push({id:d,label:d,shape:"circle",borderWidth:a.final.has(d)?4:1});for(const d of a.choices)c.push({id:d,label:"",shape:"diamond",borderWidth:1});for(const{from:c,transition:e,to:f}of a.mTransitions)d.push({from:c,to:f,arrows:"to",label:`${e.name}(${e.arguments.join(", ")})`});for(const{from:c,transition:e,to:f}of a.lTransitions)d.push({from:c,to:f,arrows:"to",label:e.name});const e={nodes:new vis.DataSet(c),edges:new vis.DataSet(d)},f=new vis.Network(b,e,{layout:{// randomSeed: 293814 // network.getSeed()
    },edges:{arrows:{to:{enabled:!0,scaleFactor:1,type:"arrow"},middle:{enabled:!1,scaleFactor:1,type:"arrow"},from:{enabled:!1,scaleFactor:1,type:"arrow"}},font:{align:"top"}},physics:{enabled:!0,solver:"repulsion",repulsion:{springLength:220}}});return "#forcewhite"===location.hash&&f.on("beforeDrawing",a=>{a.save(),a.setTransform(1,0,0,1,0,0),a.fillStyle="#ffffff",a.fillRect(0,0,a.canvas.width,a.canvas.height),a.restore();}),f}class AutomatonViewer extends LitElement{static get properties(){return {automaton:{reflect:!1}}}constructor(){super(),this.container=document.createElement("div"),this.container.className="container",this.download=this.download.bind(this);}download(){const a=document.createElement("a");a.download="automaton.png",a.href=this.shadowRoot.querySelector("canvas").toDataURL("image/png"),a.click();}firstUpdated(){window.__CANVAS__=()=>this.shadowRoot.querySelector("canvas");}updated(){this.automaton&&createDemo(this.automaton,this.container);}render(){return html`
      <top-bar .myTitle="" .buttons="${[["Download",this.download]]}"></top-bar>
      ${this.container}
    `}}AutomatonViewer.styles=css`
  .container {
    width: 650px;
    height: 550px;
    border: 1px solid lightgray;
  }
  `,customElements.define("automaton-viewer",AutomatonViewer);

    var jsonEditorCss = "div.jsoneditor .jsoneditor-search input{height:auto;border:inherit}div.jsoneditor .jsoneditor-search input:focus{border:none!important;box-shadow:none!important}div.jsoneditor table{border-collapse:collapse;width:auto}div.jsoneditor td,div.jsoneditor th{padding:0;display:table-cell;text-align:left;vertical-align:inherit;border-radius:inherit}div.jsoneditor-field,div.jsoneditor-readonly,div.jsoneditor-value{border:1px solid transparent;min-height:16px;min-width:32px;padding:2px;margin:1px;word-wrap:break-word;float:left}div.jsoneditor-field p,div.jsoneditor-value p{margin:0}div.jsoneditor-value{word-break:break-word}div.jsoneditor-readonly{min-width:16px;color:grey}div.jsoneditor-empty{border-color:#d3d3d3;border-style:dashed;border-radius:2px}div.jsoneditor-field.jsoneditor-empty::after,div.jsoneditor-value.jsoneditor-empty::after{pointer-events:none;color:#d3d3d3;font-size:8pt}div.jsoneditor-field.jsoneditor-empty::after{content:\"field\"}div.jsoneditor-value.jsoneditor-empty::after{content:\"value\"}a.jsoneditor-value.jsoneditor-url,div.jsoneditor-value.jsoneditor-url{color:green;text-decoration:underline}a.jsoneditor-value.jsoneditor-url{display:inline-block;padding:2px;margin:2px}a.jsoneditor-value.jsoneditor-url:focus,a.jsoneditor-value.jsoneditor-url:hover{color:#ee422e}div.jsoneditor td.jsoneditor-separator{padding:3px 0;vertical-align:top;color:grey}div.jsoneditor-field.jsoneditor-highlight,div.jsoneditor-field[contenteditable=true]:focus,div.jsoneditor-field[contenteditable=true]:hover,div.jsoneditor-value.jsoneditor-highlight,div.jsoneditor-value[contenteditable=true]:focus,div.jsoneditor-value[contenteditable=true]:hover{background-color:#ffffab;border:1px solid #ff0;border-radius:2px}div.jsoneditor-field.jsoneditor-highlight-active,div.jsoneditor-field.jsoneditor-highlight-active:focus,div.jsoneditor-field.jsoneditor-highlight-active:hover,div.jsoneditor-value.jsoneditor-highlight-active,div.jsoneditor-value.jsoneditor-highlight-active:focus,div.jsoneditor-value.jsoneditor-highlight-active:hover{background-color:#fe0;border:1px solid #ffc700;border-radius:2px}div.jsoneditor-value.jsoneditor-string{color:green}div.jsoneditor-value.jsoneditor-array,div.jsoneditor-value.jsoneditor-object{min-width:16px;color:grey}div.jsoneditor-value.jsoneditor-number{color:#ee422e}div.jsoneditor-value.jsoneditor-boolean{color:#ff8c00}div.jsoneditor-value.jsoneditor-null{color:#004ed0}div.jsoneditor-value.jsoneditor-invalid{color:#000}div.jsoneditor-tree button{width:24px;height:24px;padding:0;margin:0;border:none;cursor:pointer;background:transparent url(img/jsoneditor-icons.svg)}div.jsoneditor-mode-form tr.jsoneditor-expandable td.jsoneditor-tree,div.jsoneditor-mode-view tr.jsoneditor-expandable td.jsoneditor-tree{cursor:pointer}div.jsoneditor-tree button.jsoneditor-collapsed{background-position:0 -48px}div.jsoneditor-tree button.jsoneditor-expanded{background-position:0 -72px}div.jsoneditor-tree button.jsoneditor-contextmenu{background-position:-48px -72px}div.jsoneditor-tree button.jsoneditor-contextmenu.jsoneditor-selected,div.jsoneditor-tree button.jsoneditor-contextmenu:focus,div.jsoneditor-tree button.jsoneditor-contextmenu:hover,tr.jsoneditor-selected.jsoneditor-first button.jsoneditor-contextmenu{background-position:-48px -48px}div.jsoneditor-tree :focus{outline:0}div.jsoneditor-tree button:focus{background-color:#f5f5f5;outline:#e5e5e5 solid 1px}div.jsoneditor-tree button.jsoneditor-invisible{visibility:hidden;background:0 0}div.jsoneditor-tree div.jsoneditor-show-more{display:inline-block;padding:3px 4px;margin:2px 0;background-color:#e5e5e5;border-radius:3px;color:grey;font-family:arial,sans-serif;font-size:10pt}div.jsoneditor-tree div.jsoneditor-show-more a{display:inline-block;color:grey}div.jsoneditor-tree div.jsoneditor-show-more a:focus,div.jsoneditor-tree div.jsoneditor-show-more a:hover{color:#ee422e}div.jsoneditor{color:#1a1a1a;border:1px solid #3883fa;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%;height:100%;position:relative;padding:0;line-height:100%}div.jsoneditor-tree table.jsoneditor-tree{border-collapse:collapse;border-spacing:0;width:100%;margin:0}div.jsoneditor-outer{position:static;width:100%;height:100%;margin:-35px 0 0 0;padding:35px 0 0 0;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}div.jsoneditor-outer.has-nav-bar{margin:-61px 0 0 0;padding:61px 0 0 0}div.jsoneditor-outer.has-status-bar{margin:-35px 0 -26px 0;padding:35px 0 26px 0}.ace-jsoneditor,textarea.jsoneditor-text{min-height:150px}div.jsoneditor-tree{width:100%;height:100%;position:relative;overflow:auto}textarea.jsoneditor-text{width:100%;height:100%;margin:0;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;outline-width:0;border:none;background-color:#fff;resize:none}tr.jsoneditor-highlight,tr.jsoneditor-selected{background-color:#d3d3d3}tr.jsoneditor-selected button.jsoneditor-contextmenu,tr.jsoneditor-selected button.jsoneditor-dragarea{visibility:hidden}tr.jsoneditor-selected.jsoneditor-first button.jsoneditor-contextmenu,tr.jsoneditor-selected.jsoneditor-first button.jsoneditor-dragarea{visibility:visible}div.jsoneditor-tree button.jsoneditor-dragarea{background:url(img/jsoneditor-icons.svg) -72px -72px;cursor:move}div.jsoneditor-tree button.jsoneditor-dragarea:focus,div.jsoneditor-tree button.jsoneditor-dragarea:hover,tr.jsoneditor-selected.jsoneditor-first button.jsoneditor-dragarea{background-position:-72px -48px}div.jsoneditor td,div.jsoneditor th,div.jsoneditor tr{padding:0;margin:0}div.jsoneditor td{vertical-align:top}div.jsoneditor td.jsoneditor-tree{vertical-align:top}.jsoneditor-schema-error,div.jsoneditor td,div.jsoneditor textarea,div.jsoneditor th,div.jsoneditor-field,div.jsoneditor-value{font-family:\"dejavu sans mono\",\"droid sans mono\",consolas,monaco,\"lucida console\",\"courier new\",courier,monospace,sans-serif;font-size:10pt;color:#1a1a1a}.jsoneditor-schema-error{cursor:default;display:inline-block;height:24px;line-height:24px;position:relative;text-align:center;width:24px}div.jsoneditor-tree .jsoneditor-schema-error{width:24px;height:24px;padding:0;margin:0 4px 0 0;background:url(img/jsoneditor-icons.svg) -168px -48px}.jsoneditor-schema-error .jsoneditor-popover{background-color:#4c4c4c;border-radius:3px;box-shadow:0 0 5px rgba(0,0,0,.4);color:#fff;display:none;padding:7px 10px;position:absolute;width:200px;z-index:4}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-above{bottom:32px;left:-98px}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-below{top:32px;left:-98px}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-left{top:-7px;right:32px}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-right{top:-7px;left:32px}.jsoneditor-schema-error .jsoneditor-popover:before{border-right:7px solid transparent;border-left:7px solid transparent;content:'';display:block;left:50%;margin-left:-7px;position:absolute}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-above:before{border-top:7px solid #4c4c4c;bottom:-7px}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-below:before{border-bottom:7px solid #4c4c4c;top:-7px}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-left:before{border-left:7px solid #4c4c4c;border-top:7px solid transparent;border-bottom:7px solid transparent;content:'';top:19px;right:-14px;left:inherit;margin-left:inherit;margin-top:-7px;position:absolute}.jsoneditor-schema-error .jsoneditor-popover.jsoneditor-right:before{border-right:7px solid #4c4c4c;border-top:7px solid transparent;border-bottom:7px solid transparent;content:'';top:19px;left:-14px;margin-left:inherit;margin-top:-7px;position:absolute}.jsoneditor-schema-error:focus .jsoneditor-popover,.jsoneditor-schema-error:hover .jsoneditor-popover{display:block;-webkit-animation:fade-in .3s linear 1,move-up .3s linear 1;-moz-animation:fade-in .3s linear 1,move-up .3s linear 1;-ms-animation:fade-in .3s linear 1,move-up .3s linear 1}@-webkit-keyframes fade-in{from{opacity:0}to{opacity:1}}@-moz-keyframes fade-in{from{opacity:0}to{opacity:1}}@-ms-keyframes fade-in{from{opacity:0}to{opacity:1}}.jsoneditor .jsoneditor-text-errors{width:100%;border-collapse:collapse;background-color:#ffef8b;border-top:1px solid gold}.jsoneditor .jsoneditor-text-errors td{padding:3px 6px;vertical-align:middle}.jsoneditor-text-errors .jsoneditor-schema-error{border:none;width:24px;height:24px;padding:0;margin:0 4px 0 0;background:url(img/jsoneditor-icons.svg) -168px -48px}div.jsoneditor-contextmenu-root{position:relative;width:0;height:0}div.jsoneditor-contextmenu{position:absolute;box-sizing:content-box;z-index:99999}div.jsoneditor-contextmenu li,div.jsoneditor-contextmenu ul{box-sizing:content-box;position:relative}div.jsoneditor-contextmenu ul{position:relative;left:0;top:0;width:128px;background:#fff;border:1px solid #d3d3d3;box-shadow:2px 2px 12px rgba(128,128,128,.3);list-style:none;margin:0;padding:0}div.jsoneditor-contextmenu ul li button{position:relative;padding:0 4px 0 0;margin:0;width:128px;height:auto;border:none;cursor:pointer;color:#4d4d4d;background:0 0;font-size:10pt;font-family:arial,sans-serif;box-sizing:border-box;text-align:left}div.jsoneditor-contextmenu ul li button::-moz-focus-inner{padding:0;border:0}div.jsoneditor-contextmenu ul li button:focus,div.jsoneditor-contextmenu ul li button:hover{color:#1a1a1a;background-color:#f5f5f5;outline:0}div.jsoneditor-contextmenu ul li button.jsoneditor-default{width:96px}div.jsoneditor-contextmenu ul li button.jsoneditor-expand{float:right;width:32px;height:24px;border-left:1px solid #e5e5e5}div.jsoneditor-contextmenu div.jsoneditor-icon{position:absolute;top:0;left:0;width:24px;height:24px;border:none;padding:0;margin:0;background-image:url(img/jsoneditor-icons.svg)}div.jsoneditor-contextmenu ul li ul div.jsoneditor-icon{margin-left:24px}div.jsoneditor-contextmenu div.jsoneditor-text{padding:4px 0 4px 24px;word-wrap:break-word}div.jsoneditor-contextmenu div.jsoneditor-text.jsoneditor-right-margin{padding-right:24px}div.jsoneditor-contextmenu ul li button div.jsoneditor-expand{position:absolute;top:0;right:0;width:24px;height:24px;padding:0;margin:0 4px 0 0;background:url(img/jsoneditor-icons.svg) 0 -72px;opacity:.4}div.jsoneditor-contextmenu ul li button.jsoneditor-expand:focus div.jsoneditor-expand,div.jsoneditor-contextmenu ul li button.jsoneditor-expand:hover div.jsoneditor-expand,div.jsoneditor-contextmenu ul li button:focus div.jsoneditor-expand,div.jsoneditor-contextmenu ul li button:hover div.jsoneditor-expand,div.jsoneditor-contextmenu ul li.jsoneditor-selected div.jsoneditor-expand{opacity:1}div.jsoneditor-contextmenu div.jsoneditor-separator{height:0;border-top:1px solid #e5e5e5;padding-top:5px;margin-top:5px}div.jsoneditor-contextmenu button.jsoneditor-remove>div.jsoneditor-icon{background-position:-24px -24px}div.jsoneditor-contextmenu button.jsoneditor-remove:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-remove:hover>div.jsoneditor-icon{background-position:-24px 0}div.jsoneditor-contextmenu button.jsoneditor-append>div.jsoneditor-icon{background-position:0 -24px}div.jsoneditor-contextmenu button.jsoneditor-append:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-append:hover>div.jsoneditor-icon{background-position:0 0}div.jsoneditor-contextmenu button.jsoneditor-insert>div.jsoneditor-icon{background-position:0 -24px}div.jsoneditor-contextmenu button.jsoneditor-insert:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-insert:hover>div.jsoneditor-icon{background-position:0 0}div.jsoneditor-contextmenu button.jsoneditor-duplicate>div.jsoneditor-icon{background-position:-48px -24px}div.jsoneditor-contextmenu button.jsoneditor-duplicate:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-duplicate:hover>div.jsoneditor-icon{background-position:-48px 0}div.jsoneditor-contextmenu button.jsoneditor-sort-asc>div.jsoneditor-icon{background-position:-168px -24px}div.jsoneditor-contextmenu button.jsoneditor-sort-asc:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-sort-asc:hover>div.jsoneditor-icon{background-position:-168px 0}div.jsoneditor-contextmenu button.jsoneditor-sort-desc>div.jsoneditor-icon{background-position:-192px -24px}div.jsoneditor-contextmenu button.jsoneditor-sort-desc:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-sort-desc:hover>div.jsoneditor-icon{background-position:-192px 0}div.jsoneditor-contextmenu ul li button.jsoneditor-selected,div.jsoneditor-contextmenu ul li button.jsoneditor-selected:focus,div.jsoneditor-contextmenu ul li button.jsoneditor-selected:hover{color:#fff;background-color:#ee422e}div.jsoneditor-contextmenu ul li{overflow:hidden}div.jsoneditor-contextmenu ul li ul{display:none;position:relative;left:-10px;top:0;border:none;box-shadow:inset 0 0 10px rgba(128,128,128,.5);padding:0 10px;-webkit-transition:all .3s ease-out;-moz-transition:all .3s ease-out;-o-transition:all .3s ease-out;transition:all .3s ease-out}div.jsoneditor-contextmenu ul li ul li button{padding-left:24px;animation:all ease-in-out 1s}div.jsoneditor-contextmenu ul li ul li button:focus,div.jsoneditor-contextmenu ul li ul li button:hover{background-color:#f5f5f5}div.jsoneditor-contextmenu button.jsoneditor-type-string>div.jsoneditor-icon{background-position:-144px -24px}div.jsoneditor-contextmenu button.jsoneditor-type-string.jsoneditor-selected>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-string:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-string:hover>div.jsoneditor-icon{background-position:-144px 0}div.jsoneditor-contextmenu button.jsoneditor-type-auto>div.jsoneditor-icon{background-position:-120px -24px}div.jsoneditor-contextmenu button.jsoneditor-type-auto.jsoneditor-selected>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-auto:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-auto:hover>div.jsoneditor-icon{background-position:-120px 0}div.jsoneditor-contextmenu button.jsoneditor-type-object>div.jsoneditor-icon{background-position:-72px -24px}div.jsoneditor-contextmenu button.jsoneditor-type-object.jsoneditor-selected>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-object:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-object:hover>div.jsoneditor-icon{background-position:-72px 0}div.jsoneditor-contextmenu button.jsoneditor-type-array>div.jsoneditor-icon{background-position:-96px -24px}div.jsoneditor-contextmenu button.jsoneditor-type-array.jsoneditor-selected>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-array:focus>div.jsoneditor-icon,div.jsoneditor-contextmenu button.jsoneditor-type-array:hover>div.jsoneditor-icon{background-position:-96px 0}div.jsoneditor-contextmenu button.jsoneditor-type-modes>div.jsoneditor-icon{background-image:none;width:6px}.jsoneditor-modal-overlay{position:absolute!important;background:#010101!important;opacity:.3!important}.jsoneditor-modal{position:absolute!important;max-width:100%!important;border-radius:2px!important;padding:45px 15px 15px 15px!important;box-shadow:2px 2px 12px rgba(128,128,128,.3)!important}.jsoneditor-modal .pico-modal-header{position:absolute;box-sizing:border-box;top:0;left:0;width:100%;padding:0 10px;height:30px;line-height:30px;font-family:arial,sans-serif;font-size:11pt;background:#3883fa;color:#fff}.jsoneditor-modal table td{padding:5px 0;padding-right:20px;text-align:left;vertical-align:middle;font-size:10pt;font-family:arial,sans-serif;color:#4d4d4d}.jsoneditor-modal table td.jsoneditor-modal-input{text-align:right;padding-right:0;white-space:nowrap}.jsoneditor-modal table td.jsoneditor-modal-actions{padding-top:15px}.jsoneditor-modal .pico-close{background:0 0!important;font-size:24px!important;top:7px!important;right:7px!important;color:#fff}.jsoneditor-modal input,.jsoneditor-modal select{background:#f5f5f5;border:1px solid #d3d3d3;color:#4d4d4d;border-radius:3px;cursor:pointer}.jsoneditor-modal .jsoneditor-select-wrapper{position:relative}.jsoneditor-modal .jsoneditor-select-wrapper:after{content:\"\";width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #666;position:absolute;right:8px;top:10px;pointer-events:none}.jsoneditor-modal select{padding:3px 24px 3px 10px;width:100%;max-width:300px;-webkit-appearance:none;-moz-appearance:none;appearance:none;text-indent:0;text-overflow:\"\";font-size:inherit;line-height:inherit}.jsoneditor-modal select::-ms-expand{display:none}.jsoneditor-modal .jsoneditor-button-group input{padding:4px 10px;margin:0;border-radius:0;border-left-style:none}.jsoneditor-modal .jsoneditor-button-group input.jsoneditor-button-first{border-top-left-radius:3px;border-bottom-left-radius:3px;border-left-style:solid}.jsoneditor-modal .jsoneditor-button-group input.jsoneditor-button-last{border-top-right-radius:3px;border-bottom-right-radius:3px}.jsoneditor-modal .jsoneditor-button-group.jsoneditor-button-group-value-asc input.jsoneditor-button-asc,.jsoneditor-modal .jsoneditor-button-group.jsoneditor-button-group-value-desc input.jsoneditor-button-desc{background:#3883fa;border-color:#3883fa;color:#fff}.jsoneditor-modal input{padding:4px 20px}div.jsoneditor-menu{width:100%;height:35px;padding:2px;margin:0;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;background-color:#3883fa;border-bottom:1px solid #3883fa}div.jsoneditor-menu>button,div.jsoneditor-menu>div.jsoneditor-modes>button{width:26px;height:26px;margin:2px;padding:0;border-radius:2px;border:1px solid transparent;background:transparent url(img/jsoneditor-icons.svg);color:#fff;opacity:.8;font-family:arial,sans-serif;font-size:10pt;float:left}div.jsoneditor-menu>button:hover,div.jsoneditor-menu>div.jsoneditor-modes>button:hover{background-color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4)}div.jsoneditor-menu>button:active,div.jsoneditor-menu>button:focus,div.jsoneditor-menu>div.jsoneditor-modes>button:active,div.jsoneditor-menu>div.jsoneditor-modes>button:focus{background-color:rgba(255,255,255,.3)}div.jsoneditor-menu>button:disabled,div.jsoneditor-menu>div.jsoneditor-modes>button:disabled{opacity:.5}div.jsoneditor-menu>button.jsoneditor-collapse-all{background-position:0 -96px}div.jsoneditor-menu>button.jsoneditor-expand-all{background-position:0 -120px}div.jsoneditor-menu>button.jsoneditor-undo{background-position:-24px -96px}div.jsoneditor-menu>button.jsoneditor-undo:disabled{background-position:-24px -120px}div.jsoneditor-menu>button.jsoneditor-redo{background-position:-48px -96px}div.jsoneditor-menu>button.jsoneditor-redo:disabled{background-position:-48px -120px}div.jsoneditor-menu>button.jsoneditor-compact{background-position:-72px -96px}div.jsoneditor-menu>button.jsoneditor-format{background-position:-72px -120px}div.jsoneditor-menu>button.jsoneditor-repair{background-position:-96px -96px}div.jsoneditor-menu>div.jsoneditor-modes{display:inline-block;float:left}div.jsoneditor-menu>div.jsoneditor-modes>button{background-image:none;width:auto;padding-left:6px;padding-right:6px}div.jsoneditor-menu>button.jsoneditor-separator,div.jsoneditor-menu>div.jsoneditor-modes>button.jsoneditor-separator{margin-left:10px}div.jsoneditor-menu a{font-family:arial,sans-serif;font-size:10pt;color:#fff;opacity:.8;vertical-align:middle}div.jsoneditor-menu a:hover{opacity:1}div.jsoneditor-menu a.jsoneditor-poweredBy{font-size:8pt;position:absolute;right:0;top:0;padding:10px}table.jsoneditor-search div.jsoneditor-results,table.jsoneditor-search input{font-family:arial,sans-serif;font-size:10pt;color:#1a1a1a;background:0 0}table.jsoneditor-search div.jsoneditor-results{color:#fff;padding-right:5px;line-height:24px}table.jsoneditor-search{position:absolute;right:4px;top:4px;border-collapse:collapse;border-spacing:0}table.jsoneditor-search div.jsoneditor-frame{border:1px solid transparent;background-color:#fff;padding:0 2px;margin:0}table.jsoneditor-search div.jsoneditor-frame table{border-collapse:collapse}table.jsoneditor-search input{width:120px;border:none;outline:0;margin:1px;line-height:20px}table.jsoneditor-search button{width:16px;height:24px;padding:0;margin:0;border:none;background:url(img/jsoneditor-icons.svg);vertical-align:top}table.jsoneditor-search button:hover{background-color:transparent}table.jsoneditor-search button.jsoneditor-refresh{width:18px;background-position:-99px -73px}table.jsoneditor-search button.jsoneditor-next{cursor:pointer;background-position:-124px -73px}table.jsoneditor-search button.jsoneditor-next:hover{background-position:-124px -49px}table.jsoneditor-search button.jsoneditor-previous{cursor:pointer;background-position:-148px -73px;margin-right:2px}table.jsoneditor-search button.jsoneditor-previous:hover{background-position:-148px -49px}div.jsoneditor div.autocomplete.dropdown{position:absolute;background:#fff;box-shadow:2px 2px 12px rgba(128,128,128,.3);border:1px solid #d3d3d3;z-index:100;overflow-x:hidden;overflow-y:auto;cursor:default;margin:0;padding-left:2pt;padding-right:5pt;text-align:left;outline:0;font-family:\"dejavu sans mono\",\"droid sans mono\",consolas,monaco,\"lucida console\",\"courier new\",courier,monospace,sans-serif;font-size:10pt}div.jsoneditor div.autocomplete.dropdown .item{color:#333}div.jsoneditor div.autocomplete.dropdown .item.hover{background-color:#ddd}div.jsoneditor div.autocomplete.hint{color:#aaa;top:4px;left:4px}div.jsoneditor-treepath{padding:0 5px;overflow:hidden}div.jsoneditor-treepath div.jsoneditor-contextmenu-root{position:absolute;left:0}div.jsoneditor-treepath span.jsoneditor-treepath-element{margin:1px;font-family:arial,sans-serif;font-size:10pt}div.jsoneditor-treepath span.jsoneditor-treepath-seperator{margin:2px;font-size:9pt;font-family:arial,sans-serif}div.jsoneditor-treepath span.jsoneditor-treepath-element:hover,div.jsoneditor-treepath span.jsoneditor-treepath-seperator:hover{cursor:pointer;text-decoration:underline}div.jsoneditor-statusbar{line-height:26px;height:26px;margin-top:-1px;color:grey;background-color:#ebebeb;border-top:1px solid #d3d3d3;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;font-size:10pt}div.jsoneditor-statusbar>.jsoneditor-curserinfo-label{margin:0 2px 0 4px}div.jsoneditor-statusbar>.jsoneditor-curserinfo-val{margin-right:12px}div.jsoneditor-statusbar>.jsoneditor-curserinfo-count{margin-left:4px}div.jsoneditor-navigation-bar{width:100%;height:26px;line-height:26px;padding:0;margin:0;border-bottom:1px solid #d3d3d3;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;color:grey;background-color:#ebebeb;overflow:hidden;font-family:arial,sans-serif;font-size:10pt}";

    class JsonViewer extends LitElement{static get properties(){return {json:{reflect:!1},mode:{type:Boolean,reflect:!1}}}constructor(){super(),this.container=document.createElement("div"),this.editor=new JSONEditor(this.container,{mode:"view"}),this.rawText="",this.mode=!0,this.toggleMode=this.toggleMode.bind(this),this.select=this.select.bind(this);}toggleMode(){this.mode=!this.mode;}select(){const a=this.shadowRoot.querySelector("pre"),b=window.getSelection(),c=document.createRange();c.selectNodeContents(a),b.removeAllRanges(),b.addRange(c);}updated(){this.json&&(this.editor.set(this.json),this.rawText=JSON.stringify(this.json,null,2));}render(){const a=this.mode?[["See raw text",this.toggleMode]]:[["Open JSON Viewer",this.toggleMode],["Select all",this.select]];return html`
      <top-bar .myTitle="" .buttons="${a}"></top-bar>
      <div class="view ${this.mode?"visible":"invisible"}">${this.container}</div>
      <pre class="view ${this.mode?"invisible":"visible"}">${this.rawText}</pre>
    `}}JsonViewer.styles=css`
  ${unsafeCSS(jsonEditorCss)}
  .invisible {
    display: none;
  }
  .visible {
    display: block;
  }
  div.view {
    width: 600px;
  }
  pre.view {
    width: 600px;
    height: 600px;
    overflow: auto;
    border: 1px solid lightgray;
    margin: 0px;
  }
  `,customElements.define("json-viewer",JsonViewer);

    /* globals document, customElements */class TextViewer extends LitElement{static get properties(){return {text:{type:String,reflect:!1}}}render(){return html`
      <top-bar .myTitle="" .buttons="${[]}"></top-bar>
      <pre>${this.text||""}</pre>
    `}}TextViewer.styles=css`
  pre {
    width: 600px;
    height: 600px;
    overflow: auto;
    border: 1px solid lightgray;
    margin: 0px;
  }
  `,customElements.define("text-viewer",TextViewer);

    /* globals document, customElements */class TopBar extends LitElement{static get properties(){return {myTitle:{type:String,reflect:!1},buttons:{reflect:!1}}}render(){const{myTitle:a,buttons:b}=this;return html`
      ${a?html`<span>${a}</span>`:""}
      ${b&&b.map(([a,b])=>html`<button @click="${b}">${a}</button>`)}
    `}}TopBar.styles=css`
  :host {
    display: block;
    height: 50px;
    line-height: 50px;
    margin-bottom: 10px;
  }
  :host * {
    margin: 10px;
  }
  button {
    cursor: pointer;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    padding: .37rem .75rem;
    font-size: 14px;
    line-height: 1.5;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;

    min-width: 60px;
    color: #007bff;
    background-color: white;
    background-image: none;
    border-color: #007bff;
  }
  button:hover {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
  }
  `,customElements.define("top-bar",TopBar);

    /* globals window, customElements */class TransformationElement extends LitElement{static get properties(){return {defaultValue:{type:String,reflect:!1},myTitle:{type:String,reflect:!1},fn:{reflect:!1},result:{reflect:!1},error:{type:String,reflect:!1},textareaStyle:{type:String,reflect:!1}}}constructor(){super(),this.onDo=this.onDo.bind(this);}onDo(){const a=this.fn;if(a){try{this.result=a(this.shadowRoot.querySelector("textarea").value),this.error="";}catch(a){this.error=a.message,console.log("Caught:",a);}"Preview"===this.myTitle&&(window.__ERROR__=this.error);}}firstUpdated(){this.shadowRoot.querySelector("textarea").value=this.defaultValue||"","Preview"===this.myTitle&&(window.__TEXTAREA__=this.shadowRoot.querySelector("textarea"),window.__RENDER__=this.onDo);}render(){const{myTitle:a,result:b,error:c,textareaStyle:d}=this;return html`
      <div class="side${c?" hasError":""}">
        <top-bar .myTitle="${a}" .buttons="${[["Do",this.onDo]]}"></top-bar>
        <error-display .text="${c}"></error-display>
        <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="${d||""}"></textarea>
      </div>
      <div class="side">${b||""}</div>
      <div style="clear: both"></div>
    `}}TransformationElement.styles=css`
  :host {
    display: block;
  }
  textarea {
    width: 500px;
    height: 600px;
  }
  .side {
    float: left;
    margin: 0 10px;
  }
  error-display {
    width: 600px;
    height: 35px;
    display: none;
  }
  .hasError error-display {
    display: block;
  }
  .hasError textarea {
    height: 615px;
  }
  `,customElements.define("my-transformation",TransformationElement);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */var CornerBit,cssClasses={ANCHOR:"mdc-menu-surface--anchor",ANIMATING_CLOSED:"mdc-menu-surface--animating-closed",ANIMATING_OPEN:"mdc-menu-surface--animating-open",FIXED:"mdc-menu-surface--fixed",OPEN:"mdc-menu-surface--open",ROOT:"mdc-menu-surface"},strings={CLOSED_EVENT:"MDCMenuSurface:closed",OPENED_EVENT:"MDCMenuSurface:opened",FOCUSABLE_ELEMENTS:"button:not(:disabled), [href]:not([aria-disabled=\"true\"]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex=\"-1\"]):not([aria-disabled=\"true\"])"},numbers={/** Total duration of menu-surface open animation. */TRANSITION_OPEN_DURATION:120,/** Total duration of menu-surface close animation. */TRANSITION_CLOSE_DURATION:75,/** Margin left to the edge of the viewport when menu-surface is at maximum possible height. */MARGIN_TO_EDGE:32,/** Ratio of anchor width to menu-surface width for switching from corner positioning to center positioning. */ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO:.67};// tslint:disable:object-literal-sort-keys
    (function(a){a[a.BOTTOM=1]="BOTTOM",a[a.CENTER=2]="CENTER",a[a.RIGHT=4]="RIGHT",a[a.FLIP_RTL=8]="FLIP_RTL";})(CornerBit||(CornerBit={}));/**
     * Enum for representing an element corner for positioning the menu-surface.
     *
     * The START constants map to LEFT if element directionality is left
     * to right and RIGHT if the directionality is right to left.
     * Likewise END maps to RIGHT or LEFT depending on the directionality.
     */var Corner;(function(a){a[a.TOP_LEFT=0]="TOP_LEFT",a[a.TOP_RIGHT=4]="TOP_RIGHT",a[a.BOTTOM_LEFT=1]="BOTTOM_LEFT",a[a.BOTTOM_RIGHT=5]="BOTTOM_RIGHT",a[a.TOP_START=8]="TOP_START",a[a.TOP_END=12]="TOP_END",a[a.BOTTOM_START=9]="BOTTOM_START",a[a.BOTTOM_END=13]="BOTTOM_END";})(Corner||(Corner={}));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */ /* global Reflect, Promise */var extendStatics=function(a,c){return extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var b in c)c.hasOwnProperty(b)&&(a[b]=c[b]);},extendStatics(a,c)};function __extends(a,c){function b(){this.constructor=a;}extendStatics(a,c),a.prototype=null===c?Object.create(c):(b.prototype=c.prototype,new b);}var __assign=function(){return __assign=Object.assign||function(a){for(var b,c=1,d=arguments.length;c<d;c++)for(var e in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,e)&&(a[e]=b[e]);return a},__assign.apply(this,arguments)};function __values(a){var b="function"==typeof Symbol&&a[Symbol.iterator],c=0;return b?b.call(a):{next:function(){return a&&c>=a.length&&(a=void 0),{value:a&&a[c++],done:!a}}}}function __read(a,b){var c="function"==typeof Symbol&&a[Symbol.iterator];if(!c)return a;var d,f,g=c.call(a),h=[];try{for(;(void 0===b||0<b--)&&!(d=g.next()).done;)h.push(d.value);}catch(a){f={error:a};}finally{try{d&&!d.done&&(c=g["return"])&&c.call(g);}finally{if(f)throw f.error}}return h}function __spread(){for(var a=[],b=0;b<arguments.length;b++)a=a.concat(__read(arguments[b]));return a}

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */var MDCFoundation=/** @class */function(){function a(a){void 0===a&&(a={}),this.adapter_=a;}return Object.defineProperty(a,"cssClasses",{get:function(){// Classes extending MDCFoundation should implement this method to return an object which exports every
    // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
    return {}},enumerable:/** skipRestoreFocus */ /** shouldBubble */!0,configurable:!0}),Object.defineProperty(a,"strings",{get:function(){// Classes extending MDCFoundation should implement this method to return an object which exports all
    // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
    return {}},enumerable:!0,configurable:!0}),Object.defineProperty(a,"numbers",{get:function(){// Classes extending MDCFoundation should implement this method to return an object which exports all
    // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
    return {}},enumerable:!0,configurable:!0}),Object.defineProperty(a,"defaultAdapter",{get:function(){// Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
    // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
    // validation.
    return {}},enumerable:!0,configurable:!0}),a.prototype.init=function(){// Subclasses should override this method to perform initialization routines (registering events, etc.)
    },a.prototype.destroy=function(){// Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
    },a}();

    var MDCComponent=/** @class */function(){function a(a,b){for(var c=[],d=2;d<arguments.length;d++)c[d-2]=arguments[d];this.root_=a,this.initialize.apply(this,__spread(c)),this.foundation_=void 0===b?this.getDefaultFoundation():b,this.foundation_.init(),this.initialSyncWithDOM();}return a.attachTo=function(b){// Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
    // returns an instantiated component with its root set to that element. Also note that in the cases of
    // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
    // from getDefaultFoundation().
    return new a(b,new MDCFoundation({}))},a.prototype.initialize=function(){for(var a=[],b=0;b<arguments.length;b++)a[b]=arguments[b];// Subclasses can override this to do any additional setup work that would be considered part of a
    // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
    // initialized. Any additional arguments besides root and foundation will be passed in here.
    },a.prototype.getDefaultFoundation=function(){// Subclasses must override this method to return a properly configured foundation class for the
    // component.
    throw new Error("Subclasses must override getDefaultFoundation to return a properly configured foundation class")},a.prototype.initialSyncWithDOM=function(){// Subclasses should override this method if they need to perform work to synchronize with a host DOM
    // object. An example of this would be a form control wrapper that needs to synchronize its internal state
    // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
    // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
    },a.prototype.destroy=function(){this.foundation_.destroy();},a.prototype.listen=function(a,b,c){this.root_.addEventListener(a,b,c);},a.prototype.unlisten=function(a,b,c){this.root_.removeEventListener(a,b,c);},a.prototype.emit=function(a,b,c){void 0===c&&(c=!1);var d;"function"==typeof CustomEvent?d=new CustomEvent(a,{bubbles:c,detail:b}):(d=document.createEvent("CustomEvent"),d.initCustomEvent(a,c,!1,b)),this.root_.dispatchEvent(d);},a}();

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */ /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */function closest(a,b){if(a.closest)return a.closest(b);for(var c=a;c;){if(matches(c,b))return c;c=c.parentElement;}return null}function matches(a,b){var c=a.matches||a.webkitMatchesSelector||a.msMatchesSelector;return c.call(a,b)}

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */var cssClasses$1={LIST_ITEM_ACTIVATED_CLASS:"mdc-list-item--activated",LIST_ITEM_CLASS:"mdc-list-item",LIST_ITEM_DISABLED_CLASS:"mdc-list-item--disabled",LIST_ITEM_SELECTED_CLASS:"mdc-list-item--selected",ROOT:"mdc-list"},strings$1={ACTION_EVENT:"MDCList:action",ARIA_CHECKED:"aria-checked",ARIA_CHECKED_CHECKBOX_SELECTOR:"[role=\"checkbox\"][aria-checked=\"true\"]",ARIA_CHECKED_RADIO_SELECTOR:"[role=\"radio\"][aria-checked=\"true\"]",ARIA_CURRENT:"aria-current",ARIA_DISABLED:"aria-disabled",ARIA_ORIENTATION:"aria-orientation",ARIA_ORIENTATION_HORIZONTAL:"horizontal",ARIA_ROLE_CHECKBOX_SELECTOR:"[role=\"checkbox\"]",ARIA_SELECTED:"aria-selected",CHECKBOX_RADIO_SELECTOR:"input[type=\"checkbox\"], input[type=\"radio\"]",CHECKBOX_SELECTOR:"input[type=\"checkbox\"]",CHILD_ELEMENTS_TO_TOGGLE_TABINDEX:"\n    ."+cssClasses$1.LIST_ITEM_CLASS+" button:not(:disabled),\n    ."+cssClasses$1.LIST_ITEM_CLASS+" a\n  ",FOCUSABLE_CHILD_ELEMENTS:"\n    ."+cssClasses$1.LIST_ITEM_CLASS+" button:not(:disabled),\n    ."+cssClasses$1.LIST_ITEM_CLASS+" a,\n    ."+cssClasses$1.LIST_ITEM_CLASS+" input[type=\"radio\"]:not(:disabled),\n    ."+cssClasses$1.LIST_ITEM_CLASS+" input[type=\"checkbox\"]:not(:disabled)\n  ",RADIO_SELECTOR:"input[type=\"radio\"]"},numbers$1={UNSET_INDEX:-1};

    var ELEMENTS_KEY_ALLOWED_IN=["input","button","textarea","select"];function isNumberArray(a){return a instanceof Array}var MDCListFoundation=/** @class */function(a){function b(c){var d=a.call(this,__assign({},b.defaultAdapter,c))||this;return d.wrapFocus_=!1,d.isVertical_=/** skipRestoreFocus */ /** shouldBubble */!0,d.isSingleSelectionList_=!1,d.selectedIndex_=numbers$1.UNSET_INDEX,d.focusedItemIndex_=numbers$1.UNSET_INDEX,d.useActivatedClass_=!1,d.ariaCurrentAttrValue_=null,d.isCheckboxList_=!1,d.isRadioList_=!1,d}return __extends(b,a),Object.defineProperty(b,"strings",{get:function(){return strings$1},enumerable:!0,configurable:!0}),Object.defineProperty(b,"cssClasses",{get:function(){return cssClasses$1},enumerable:!0,configurable:!0}),Object.defineProperty(b,"numbers",{get:function(){return numbers$1},enumerable:!0,configurable:!0}),Object.defineProperty(b,"defaultAdapter",{get:function(){return {addClassForElementIndex:function(){},focusItemAtIndex:function(){},getAttributeForElementIndex:function(){return null},getFocusedElementIndex:function(){return 0},getListItemCount:function(){return 0},hasCheckboxAtIndex:function(){return !1},hasRadioAtIndex:function(){return !1},isCheckboxCheckedAtIndex:function(){return !1},isFocusInsideList:function(){return !1},isRootFocused:function(){return !1},listItemAtIndexHasClass:function(){return !1},notifyAction:function(){},removeClassForElementIndex:function(){},setAttributeForElementIndex:function(){},setCheckedCheckboxOrRadioAtIndex:function(){},setTabIndexForListItemChildren:function(){}}},enumerable:!0,configurable:!0}),b.prototype.layout=function(){0===this.adapter_.getListItemCount()||(this.adapter_.hasCheckboxAtIndex(0)?this.isCheckboxList_=!0:this.adapter_.hasRadioAtIndex(0)&&(this.isRadioList_=!0));},b.prototype.setWrapFocus=function(a){this.wrapFocus_=a;},b.prototype.setVerticalOrientation=function(a){this.isVertical_=a;},b.prototype.setSingleSelection=function(a){this.isSingleSelectionList_=a;},b.prototype.setUseActivatedClass=function(a){this.useActivatedClass_=a;},b.prototype.getSelectedIndex=function(){return this.selectedIndex_},b.prototype.setSelectedIndex=function(a){this.isIndexValid_(a)&&(this.isCheckboxList_?this.setCheckboxAtIndex_(a):this.isRadioList_?this.setRadioAtIndex_(a):this.setSingleSelectionAtIndex_(a));},b.prototype.handleFocusIn=function(a,b){0<=b&&this.adapter_.setTabIndexForListItemChildren(b,"0");},b.prototype.handleFocusOut=function(a,b){var c=this;0<=b&&this.adapter_.setTabIndexForListItemChildren(b,"-1"),setTimeout(function(){c.adapter_.isFocusInsideList()||c.setTabindexToFirstSelectedItem_();},0);},b.prototype.handleKeydown=function(a,b,c){var d="ArrowLeft"===a.key||37===a.keyCode,e="ArrowUp"===a.key||38===a.keyCode,f="ArrowRight"===a.key||39===a.keyCode,g="ArrowDown"===a.key||40===a.keyCode,h="Home"===a.key||36===a.keyCode,i="End"===a.key||35===a.keyCode,j="Enter"===a.key||13===a.keyCode,k="Space"===a.key||32===a.keyCode;if(this.adapter_.isRootFocused())return void(e||i?(a.preventDefault(),this.focusLastElement()):(g||h)&&(a.preventDefault(),this.focusFirstElement()));var l=this.adapter_.getFocusedElementIndex();if(!(-1===l&&(l=c,0>l)))// If this event doesn't have a mdc-list-item ancestor from the
    // current list (not from a sublist), return early.
    {var m;if(this.isVertical_&&g||!this.isVertical_&&f)this.preventDefaultEvent_(a),m=this.focusNextElement(l);else if(this.isVertical_&&e||!this.isVertical_&&d)this.preventDefaultEvent_(a),m=this.focusPrevElement(l);else if(h)this.preventDefaultEvent_(a),m=this.focusFirstElement();else if(i)this.preventDefaultEvent_(a),m=this.focusLastElement();else if((j||k)&&b){// Return early if enter key is pressed on anchor element which triggers synthetic MouseEvent event.
    var n=a.target;if(n&&"A"===n.tagName&&j)return;this.preventDefaultEvent_(a),this.isSelectableList_()&&this.setSelectedIndexOnAction_(l),this.adapter_.notifyAction(l);}this.focusedItemIndex_=l,void 0!==m&&(this.setTabindexAtIndex_(m),this.focusedItemIndex_=m);}},b.prototype.handleClick=function(a,b){a===numbers$1.UNSET_INDEX||(this.isSelectableList_()&&this.setSelectedIndexOnAction_(a,b),this.adapter_.notifyAction(a),this.setTabindexAtIndex_(a),this.focusedItemIndex_=a);},b.prototype.focusNextElement=function(a){var b=this.adapter_.getListItemCount(),c=a+1;if(c>=b)if(this.wrapFocus_)c=0;else// Return early because last item is already focused.
    return a;return this.adapter_.focusItemAtIndex(c),c},b.prototype.focusPrevElement=function(a){var b=a-1;if(0>b)if(this.wrapFocus_)b=this.adapter_.getListItemCount()-1;else// Return early because first item is already focused.
    return a;return this.adapter_.focusItemAtIndex(b),b},b.prototype.focusFirstElement=function(){return this.adapter_.focusItemAtIndex(0),0},b.prototype.focusLastElement=function(){var a=this.adapter_.getListItemCount()-1;return this.adapter_.focusItemAtIndex(a),a},b.prototype.setEnabled=function(a,b){this.isIndexValid_(a)&&(b?(this.adapter_.removeClassForElementIndex(a,cssClasses$1.LIST_ITEM_DISABLED_CLASS),this.adapter_.setAttributeForElementIndex(a,strings$1.ARIA_DISABLED,"false")):(this.adapter_.addClassForElementIndex(a,cssClasses$1.LIST_ITEM_DISABLED_CLASS),this.adapter_.setAttributeForElementIndex(a,strings$1.ARIA_DISABLED,"true")));},b.prototype.preventDefaultEvent_=function(a){var b=a.target,c=(""+b.tagName).toLowerCase();-1===ELEMENTS_KEY_ALLOWED_IN.indexOf(c)&&a.preventDefault();},b.prototype.setSingleSelectionAtIndex_=function(a){if(this.selectedIndex_!==a){var b=cssClasses$1.LIST_ITEM_SELECTED_CLASS;this.useActivatedClass_&&(b=cssClasses$1.LIST_ITEM_ACTIVATED_CLASS),this.selectedIndex_!==numbers$1.UNSET_INDEX&&this.adapter_.removeClassForElementIndex(this.selectedIndex_,b),this.adapter_.addClassForElementIndex(a,b),this.setAriaForSingleSelectionAtIndex_(a),this.selectedIndex_=a;}},b.prototype.setAriaForSingleSelectionAtIndex_=function(a){this.selectedIndex_===numbers$1.UNSET_INDEX&&(this.ariaCurrentAttrValue_=this.adapter_.getAttributeForElementIndex(a,strings$1.ARIA_CURRENT));var b=null!==this.ariaCurrentAttrValue_,c=b?strings$1.ARIA_CURRENT:strings$1.ARIA_SELECTED;this.selectedIndex_!==numbers$1.UNSET_INDEX&&this.adapter_.setAttributeForElementIndex(this.selectedIndex_,c,"false");var d=b?this.ariaCurrentAttrValue_:"true";this.adapter_.setAttributeForElementIndex(a,c,d);},b.prototype.setRadioAtIndex_=function(a){this.adapter_.setCheckedCheckboxOrRadioAtIndex(a,!0),this.selectedIndex_!==numbers$1.UNSET_INDEX&&this.adapter_.setAttributeForElementIndex(this.selectedIndex_,strings$1.ARIA_CHECKED,"false"),this.adapter_.setAttributeForElementIndex(a,strings$1.ARIA_CHECKED,"true"),this.selectedIndex_=a;},b.prototype.setCheckboxAtIndex_=function(a){for(var b,c=0;c<this.adapter_.getListItemCount();c++)b=!1,0<=a.indexOf(c)&&(b=!0),this.adapter_.setCheckedCheckboxOrRadioAtIndex(c,b),this.adapter_.setAttributeForElementIndex(c,strings$1.ARIA_CHECKED,b?"true":"false");this.selectedIndex_=a;},b.prototype.setTabindexAtIndex_=function(a){this.focusedItemIndex_===numbers$1.UNSET_INDEX&&0!==a?this.adapter_.setAttributeForElementIndex(0,"tabindex","-1"):0<=this.focusedItemIndex_&&this.focusedItemIndex_!==a&&this.adapter_.setAttributeForElementIndex(this.focusedItemIndex_,"tabindex","-1"),this.adapter_.setAttributeForElementIndex(a,"tabindex","0");},b.prototype.isSelectableList_=function(){return this.isSingleSelectionList_||this.isCheckboxList_||this.isRadioList_},b.prototype.setTabindexToFirstSelectedItem_=function(){var a=0;this.isSelectableList_()&&("number"==typeof this.selectedIndex_&&this.selectedIndex_!==numbers$1.UNSET_INDEX?a=this.selectedIndex_:isNumberArray(this.selectedIndex_)&&0<this.selectedIndex_.length&&(a=this.selectedIndex_.reduce(function(a,b){var c=Math.min;return c(a,b)}))),this.setTabindexAtIndex_(a);},b.prototype.isIndexValid_=function(a){var b=this;if(a instanceof Array){if(!this.isCheckboxList_)throw new Error("MDCListFoundation: Array of index is only supported for checkbox based list");return 0===a.length||a.some(function(a){return b.isIndexInRange_(a)})}if("number"==typeof a){if(this.isCheckboxList_)throw new Error("MDCListFoundation: Expected array of index for checkbox based list but got number: "+a);return this.isIndexInRange_(a)}return !1},b.prototype.isIndexInRange_=function(a){var b=this.adapter_.getListItemCount();return 0<=a&&a<b},b.prototype.setSelectedIndexOnAction_=function(a,b){void 0===b&&(b=!0),this.adapter_.listItemAtIndexHasClass(a,cssClasses$1.LIST_ITEM_DISABLED_CLASS)||(this.isCheckboxList_?this.toggleCheckboxAtIndex_(a,b):this.setSelectedIndex(a));},b.prototype.toggleCheckboxAtIndex_=function(a,b){var c=this.adapter_.isCheckboxCheckedAtIndex(a);b&&(c=!c,this.adapter_.setCheckedCheckboxOrRadioAtIndex(a,c)),this.adapter_.setAttributeForElementIndex(a,strings$1.ARIA_CHECKED,c?"true":"false");// If none of the checkbox items are selected and selectedIndex is not initialized then provide a default value.
    var d=this.selectedIndex_===numbers$1.UNSET_INDEX?[]:this.selectedIndex_.slice();c?d.push(a):d=d.filter(function(b){return b!==a}),this.selectedIndex_=d;},b}(MDCFoundation);

    var MDCList=/** @class */function(a){function b(){return null!==a&&a.apply(this,arguments)||this}return __extends(b,a),Object.defineProperty(b.prototype,"vertical",{set:function(a){this.foundation_.setVerticalOrientation(a);},enumerable:/** skipRestoreFocus */ /** shouldBubble */!0,configurable:!0}),Object.defineProperty(b.prototype,"listElements",{get:function(){return [].slice.call(this.root_.querySelectorAll("."+cssClasses$1.LIST_ITEM_CLASS))},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"wrapFocus",{set:function(a){this.foundation_.setWrapFocus(a);},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"singleSelection",{set:function(a){this.foundation_.setSingleSelection(a);},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"selectedIndex",{get:function(){return this.foundation_.getSelectedIndex()},set:function(a){this.foundation_.setSelectedIndex(a);},enumerable:!0,configurable:!0}),b.attachTo=function(a){return new b(a)},b.prototype.initialSyncWithDOM=function(){this.handleClick_=this.handleClickEvent_.bind(this),this.handleKeydown_=this.handleKeydownEvent_.bind(this),this.focusInEventListener_=this.handleFocusInEvent_.bind(this),this.focusOutEventListener_=this.handleFocusOutEvent_.bind(this),this.listen("keydown",this.handleKeydown_),this.listen("click",this.handleClick_),this.listen("focusin",this.focusInEventListener_),this.listen("focusout",this.focusOutEventListener_),this.layout(),this.initializeListType();},b.prototype.destroy=function(){this.unlisten("keydown",this.handleKeydown_),this.unlisten("click",this.handleClick_),this.unlisten("focusin",this.focusInEventListener_),this.unlisten("focusout",this.focusOutEventListener_);},b.prototype.layout=function(){var a=this.root_.getAttribute(strings$1.ARIA_ORIENTATION);this.vertical=a!==strings$1.ARIA_ORIENTATION_HORIZONTAL,[].slice.call(this.root_.querySelectorAll(".mdc-list-item:not([tabindex])")).forEach(function(a){a.setAttribute("tabindex","-1");}),[].slice.call(this.root_.querySelectorAll(strings$1.FOCUSABLE_CHILD_ELEMENTS)).forEach(function(a){return a.setAttribute("tabindex","-1")}),this.foundation_.layout();},b.prototype.initializeListType=function(){var a=this,b=this.root_.querySelectorAll(strings$1.ARIA_ROLE_CHECKBOX_SELECTOR),c=this.root_.querySelector("\n      ."+cssClasses$1.LIST_ITEM_ACTIVATED_CLASS+",\n      ."+cssClasses$1.LIST_ITEM_SELECTED_CLASS+"\n    "),d=this.root_.querySelector(strings$1.ARIA_CHECKED_RADIO_SELECTOR);if(b.length){var e=this.root_.querySelectorAll(strings$1.ARIA_CHECKED_CHECKBOX_SELECTOR);this.selectedIndex=[].map.call(e,function(b){return a.listElements.indexOf(b)});}else c?(c.classList.contains(cssClasses$1.LIST_ITEM_ACTIVATED_CLASS)&&this.foundation_.setUseActivatedClass(!0),this.singleSelection=!0,this.selectedIndex=this.listElements.indexOf(c)):d&&(this.selectedIndex=this.listElements.indexOf(d));},b.prototype.setEnabled=function(a,b){this.foundation_.setEnabled(a,b);},b.prototype.getDefaultFoundation=function(){var a=this;// DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    return new MDCListFoundation({addClassForElementIndex:function(b,c){var d=a.listElements[b];d&&d.classList.add(c);},focusItemAtIndex:function(b){var c=a.listElements[b];c&&c.focus();},getAttributeForElementIndex:function(b,c){return a.listElements[b].getAttribute(c)},getFocusedElementIndex:function(){return a.listElements.indexOf(document.activeElement)},getListItemCount:function(){return a.listElements.length},hasCheckboxAtIndex:function(b){var c=a.listElements[b];return !!c.querySelector(strings$1.CHECKBOX_SELECTOR)},hasRadioAtIndex:function(b){var c=a.listElements[b];return !!c.querySelector(strings$1.RADIO_SELECTOR)},isCheckboxCheckedAtIndex:function(b){var c=a.listElements[b],d=c.querySelector(strings$1.CHECKBOX_SELECTOR);return d.checked},isFocusInsideList:function(){return a.root_.contains(document.activeElement)},isRootFocused:function(){return document.activeElement===a.root_},listItemAtIndexHasClass:function(b,c){return a.listElements[b].classList.contains(c)},notifyAction:function(b){a.emit(strings$1.ACTION_EVENT,{index:b},!0);},removeClassForElementIndex:function(b,c){var d=a.listElements[b];d&&d.classList.remove(c);},setAttributeForElementIndex:function(b,c,d){var e=a.listElements[b];e&&e.setAttribute(c,d);},setCheckedCheckboxOrRadioAtIndex:function(b,c){var d=a.listElements[b],e=d.querySelector(strings$1.CHECKBOX_RADIO_SELECTOR);e.checked=c;var f=document.createEvent("Event");f.initEvent("change",!0,!0),e.dispatchEvent(f);},setTabIndexForListItemChildren:function(b,c){var d=a.listElements[b],e=[].slice.call(d.querySelectorAll(strings$1.CHILD_ELEMENTS_TO_TOGGLE_TABINDEX));e.forEach(function(a){return a.setAttribute("tabindex",c)});}})},b.prototype.getListItemIndex_=function(a){var b=a.target,c=closest(b,"."+cssClasses$1.LIST_ITEM_CLASS+", ."+cssClasses$1.ROOT);// Get the index of the element if it is a list item.
    return c&&matches(c,"."+cssClasses$1.LIST_ITEM_CLASS)?this.listElements.indexOf(c):-1},b.prototype.handleFocusInEvent_=function(a){var b=this.getListItemIndex_(a);this.foundation_.handleFocusIn(a,b);},b.prototype.handleFocusOutEvent_=function(a){var b=this.getListItemIndex_(a);this.foundation_.handleFocusOut(a,b);},b.prototype.handleKeydownEvent_=function(a){var b=this.getListItemIndex_(a),c=a.target;this.foundation_.handleKeydown(a,c.classList.contains(cssClasses$1.LIST_ITEM_CLASS),b);},b.prototype.handleClickEvent_=function(a){var b=this.getListItemIndex_(a),c=a.target,d=!matches(c,strings$1.CHECKBOX_RADIO_SELECTOR);this.foundation_.handleClick(b,d);},b}(MDCComponent);

    var MDCMenuSurfaceFoundation=/** @class */function(a){function b(c){var d=a.call(this,__assign({},b.defaultAdapter,c))||this;return d.isOpen_=!1,d.isQuickOpen_=!1,d.isHoistedElement_=!1,d.isFixedPosition_=!1,d.openAnimationEndTimerId_=0,d.closeAnimationEndTimerId_=0,d.animationRequestId_=0,d.anchorCorner_=Corner.TOP_START,d.anchorMargin_={top:0,right:0,bottom:0,left:0},d.position_={x:0,y:0},d}return __extends(b,a),Object.defineProperty(b,"cssClasses",{get:function(){return cssClasses},enumerable:/** skipRestoreFocus */ /** shouldBubble */!0,configurable:!0}),Object.defineProperty(b,"strings",{get:function(){return strings},enumerable:!0,configurable:!0}),Object.defineProperty(b,"numbers",{get:function(){return numbers},enumerable:!0,configurable:!0}),Object.defineProperty(b,"Corner",{get:function(){return Corner},enumerable:!0,configurable:!0}),Object.defineProperty(b,"defaultAdapter",{/**
             * @see {@link MDCMenuSurfaceAdapter} for typing information on parameters and return types.
             */get:function(){// tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    return {addClass:function(){},removeClass:function(){},hasClass:function(){return !1},hasAnchor:function(){return !1},isElementInContainer:function(){return !1},isFocused:function(){return !1},isRtl:function(){return !1},getInnerDimensions:function(){return {height:0,width:0}},getAnchorDimensions:function(){return null},getWindowDimensions:function(){return {height:0,width:0}},getBodyDimensions:function(){return {height:0,width:0}},getWindowScroll:function(){return {x:0,y:0}},setPosition:function(){},setMaxHeight:function(){},setTransformOrigin:function(){},saveFocus:function(){},restoreFocus:function(){},notifyClose:function(){},notifyOpen:function(){}};// tslint:enable:object-literal-sort-keys
    },enumerable:!0,configurable:!0}),b.prototype.init=function(){var a=b.cssClasses,c=a.ROOT,d=a.OPEN;if(!this.adapter_.hasClass(c))throw new Error(c+" class required in root element.");this.adapter_.hasClass(d)&&(this.isOpen_=!0);},b.prototype.destroy=function(){clearTimeout(this.openAnimationEndTimerId_),clearTimeout(this.closeAnimationEndTimerId_),cancelAnimationFrame(this.animationRequestId_);},b.prototype.setAnchorCorner=function(a){this.anchorCorner_=a;},b.prototype.setAnchorMargin=function(a){this.anchorMargin_.top=a.top||0,this.anchorMargin_.right=a.right||0,this.anchorMargin_.bottom=a.bottom||0,this.anchorMargin_.left=a.left||0;},b.prototype.setIsHoisted=function(a){this.isHoistedElement_=a;},b.prototype.setFixedPosition=function(a){this.isFixedPosition_=a;},b.prototype.setAbsolutePosition=function(a,b){this.position_.x=this.isFinite_(a)?a:0,this.position_.y=this.isFinite_(b)?b:0;},b.prototype.setQuickOpen=function(a){this.isQuickOpen_=a;},b.prototype.isOpen=function(){return this.isOpen_},b.prototype.open=function(){var a=this;this.adapter_.saveFocus(),this.isQuickOpen_||this.adapter_.addClass(b.cssClasses.ANIMATING_OPEN),this.animationRequestId_=requestAnimationFrame(function(){a.adapter_.addClass(b.cssClasses.OPEN),a.dimensions_=a.adapter_.getInnerDimensions(),a.autoPosition_(),a.isQuickOpen_?a.adapter_.notifyOpen():a.openAnimationEndTimerId_=setTimeout(function(){a.openAnimationEndTimerId_=0,a.adapter_.removeClass(b.cssClasses.ANIMATING_OPEN),a.adapter_.notifyOpen();},numbers.TRANSITION_OPEN_DURATION);}),this.isOpen_=!0;},b.prototype.close=function(a){var c=this;void 0===a&&(a=!1),this.isQuickOpen_||this.adapter_.addClass(b.cssClasses.ANIMATING_CLOSED),requestAnimationFrame(function(){c.adapter_.removeClass(b.cssClasses.OPEN),c.isQuickOpen_?c.adapter_.notifyClose():c.closeAnimationEndTimerId_=setTimeout(function(){c.closeAnimationEndTimerId_=0,c.adapter_.removeClass(b.cssClasses.ANIMATING_CLOSED),c.adapter_.notifyClose();},numbers.TRANSITION_CLOSE_DURATION);}),this.isOpen_=!1,a||this.maybeRestoreFocus_();},b.prototype.handleBodyClick=function(a){var b=a.target;this.adapter_.isElementInContainer(b)||this.close();},b.prototype.handleKeydown=function(a){var b=a.keyCode,c=a.key;("Escape"===c||27===b)&&this.close();},b.prototype.autoPosition_=function(){var a;// Compute measurements for autoposition methods reuse.
    this.measurements_=this.getAutoLayoutMeasurements_();var b=this.getOriginCorner_(),c=this.getMenuSurfaceMaxHeight_(b),d=this.hasBit_(b,CornerBit.BOTTOM)?"bottom":"top",e=this.hasBit_(b,CornerBit.RIGHT)?"right":"left",f=this.getHorizontalOriginOffset_(b),g=this.getVerticalOriginOffset_(b),h=this.measurements_,i=h.anchorSize,j=h.surfaceSize,k=(a={},a[e]=f,a[d]=g,a);i.width/j.width>numbers.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO&&(e="center"),(this.isHoistedElement_||this.isFixedPosition_)&&this.adjustPositionForHoistedElement_(k),this.adapter_.setTransformOrigin(e+" "+d),this.adapter_.setPosition(k),this.adapter_.setMaxHeight(c?c+"px":"");},b.prototype.getAutoLayoutMeasurements_=function(){var a=this.adapter_.getAnchorDimensions(),b=this.adapter_.getBodyDimensions(),c=this.adapter_.getWindowDimensions(),d=this.adapter_.getWindowScroll();return a||(a={top:this.position_.y,right:this.position_.x,bottom:this.position_.y,left:this.position_.x,width:0,height:0}),{anchorSize:a,bodySize:b,surfaceSize:this.dimensions_,viewportDistance:{// tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
    top:a.top,right:c.width-a.right,bottom:c.height-a.bottom,left:a.left},viewportSize:c,windowScroll:d}},b.prototype.getOriginCorner_=function(){// Defaults: open from the top left.
    var a=Corner.TOP_LEFT,b=this.measurements_,c=b.viewportDistance,d=b.anchorSize,e=b.surfaceSize,f=this.hasBit_(this.anchorCorner_,CornerBit.BOTTOM),g=f?c.top+d.height+this.anchorMargin_.bottom:c.top+this.anchorMargin_.top,h=f?c.bottom-this.anchorMargin_.bottom:c.bottom+d.height-this.anchorMargin_.top,i=e.height-g,j=e.height-h;0<j&&i<j&&(a=this.setBit_(a,CornerBit.BOTTOM));var k=this.adapter_.isRtl(),l=this.hasBit_(this.anchorCorner_,CornerBit.FLIP_RTL),m=this.hasBit_(this.anchorCorner_,CornerBit.RIGHT),n=m&&!k||!m&&l&&k,o=n?c.left+d.width+this.anchorMargin_.right:c.left+this.anchorMargin_.left,p=n?c.right-this.anchorMargin_.right:c.right+d.width-this.anchorMargin_.left,q=e.width-o,r=e.width-p;return (0>q&&n&&k||m&&!n&&0>q||0<r&&q<r)&&(a=this.setBit_(a,CornerBit.RIGHT)),a},b.prototype.getMenuSurfaceMaxHeight_=function(a){var c=this.measurements_.viewportDistance,d=0,e=this.hasBit_(a,CornerBit.BOTTOM),f=this.hasBit_(this.anchorCorner_,CornerBit.BOTTOM),g=b.numbers.MARGIN_TO_EDGE;return e?(d=c.top+this.anchorMargin_.top-g,!f&&(d+=this.measurements_.anchorSize.height)):(d=c.bottom-this.anchorMargin_.bottom+this.measurements_.anchorSize.height-g,f&&(d-=this.measurements_.anchorSize.height)),d},b.prototype.getHorizontalOriginOffset_=function(a){var b=this.measurements_.anchorSize,c=this.hasBit_(a,CornerBit.RIGHT),d=this.hasBit_(this.anchorCorner_,CornerBit.RIGHT);// isRightAligned corresponds to using the 'right' property on the surface.
    if(c){var e=d?b.width-this.anchorMargin_.left:this.anchorMargin_.right;// For hoisted or fixed elements, adjust the offset by the difference between viewport width and body width so
    // when we calculate the right value (`adjustPositionForHoistedElement_`) based on the element position,
    // the right property is correct.
    return this.isHoistedElement_||this.isFixedPosition_?e-(this.measurements_.viewportSize.width-this.measurements_.bodySize.width):e}return d?b.width-this.anchorMargin_.right:this.anchorMargin_.left},b.prototype.getVerticalOriginOffset_=function(a){var b=this.measurements_.anchorSize,c=this.hasBit_(a,CornerBit.BOTTOM),d=this.hasBit_(this.anchorCorner_,CornerBit.BOTTOM),e=0;return e=c?d?b.height-this.anchorMargin_.top:-this.anchorMargin_.bottom:d?b.height+this.anchorMargin_.bottom:this.anchorMargin_.top,e},b.prototype.adjustPositionForHoistedElement_=function(a){var b,c,d=this.measurements_,e=d.windowScroll,f=d.viewportDistance,g=Object.keys(a);try{for(var h=__values(g),i=h.next();!i.done;i=h.next()){var j=i.value,k=a[j]||0;k+=f[j],this.isFixedPosition_||("top"===j?k+=e.y:"bottom"===j?k-=e.y:"left"===j?k+=e.x:k-=e.x),a[j]=k;}}catch(a){b={error:a};}finally{try{i&&!i.done&&(c=h.return)&&c.call(h);}finally{if(b)throw b.error}}},b.prototype.maybeRestoreFocus_=function(){var a=this.adapter_.isFocused(),b=document.activeElement&&this.adapter_.isElementInContainer(document.activeElement);(a||b)&&this.adapter_.restoreFocus();},b.prototype.hasBit_=function(a,b){return !!(a&b);// tslint:disable-line:no-bitwise
    },b.prototype.setBit_=function(a,b){return a|b;// tslint:disable-line:no-bitwise
    },b.prototype.isFinite_=function(a){return "number"==typeof a&&isFinite(a)},b}(MDCFoundation);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */var cachedCssTransformPropertyName_;/**
     * Returns the name of the correct transform property to use on the current browser.
     */function getTransformPropertyName(a,b){if(void 0===b&&(b=!1),void 0===cachedCssTransformPropertyName_||b){var c=a.document.createElement("div");cachedCssTransformPropertyName_="transform"in c.style?"transform":"webkitTransform";}return cachedCssTransformPropertyName_}

    var MDCMenuSurface=/** @class */function(a){function b(){return null!==a&&a.apply(this,arguments)||this}return __extends(b,a),b.attachTo=function(a){return new b(a)},b.prototype.initialSyncWithDOM=function(){var a=this,b=this.root_.parentElement;this.anchorElement=b&&b.classList.contains(cssClasses.ANCHOR)?b:null,this.root_.classList.contains(cssClasses.FIXED)&&this.setFixedPosition(/** skipRestoreFocus */ /** shouldBubble */!0),this.handleKeydown_=function(b){return a.foundation_.handleKeydown(b)},this.handleBodyClick_=function(b){return a.foundation_.handleBodyClick(b)},this.registerBodyClickListener_=function(){return document.body.addEventListener("click",a.handleBodyClick_)},this.deregisterBodyClickListener_=function(){return document.body.removeEventListener("click",a.handleBodyClick_)},this.listen("keydown",this.handleKeydown_),this.listen(strings.OPENED_EVENT,this.registerBodyClickListener_),this.listen(strings.CLOSED_EVENT,this.deregisterBodyClickListener_);},b.prototype.destroy=function(){this.unlisten("keydown",this.handleKeydown_),this.unlisten(strings.OPENED_EVENT,this.registerBodyClickListener_),this.unlisten(strings.CLOSED_EVENT,this.deregisterBodyClickListener_),a.prototype.destroy.call(this);},b.prototype.isOpen=function(){return this.foundation_.isOpen()},b.prototype.open=function(){this.foundation_.open();},b.prototype.close=function(a){void 0===a&&(a=!1),this.foundation_.close(a);},Object.defineProperty(b.prototype,"quickOpen",{set:function(a){this.foundation_.setQuickOpen(a);},enumerable:!0,configurable:!0}),b.prototype.setIsHoisted=function(a){this.foundation_.setIsHoisted(a);},b.prototype.setMenuSurfaceAnchorElement=function(a){this.anchorElement=a;},b.prototype.setFixedPosition=function(a){a?this.root_.classList.add(cssClasses.FIXED):this.root_.classList.remove(cssClasses.FIXED),this.foundation_.setFixedPosition(a);},b.prototype.setAbsolutePosition=function(a,b){this.foundation_.setAbsolutePosition(a,b),this.setIsHoisted(!0);},b.prototype.setAnchorCorner=function(a){this.foundation_.setAnchorCorner(a);},b.prototype.setAnchorMargin=function(a){this.foundation_.setAnchorMargin(a);},b.prototype.getDefaultFoundation=function(){var a=this;// DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    // tslint:enable:object-literal-sort-keys
    return new MDCMenuSurfaceFoundation({addClass:function(b){return a.root_.classList.add(b)},removeClass:function(b){return a.root_.classList.remove(b)},hasClass:function(b){return a.root_.classList.contains(b)},hasAnchor:function(){return !!a.anchorElement},notifyClose:function(){return a.emit(MDCMenuSurfaceFoundation.strings.CLOSED_EVENT,{})},notifyOpen:function(){return a.emit(MDCMenuSurfaceFoundation.strings.OPENED_EVENT,{})},isElementInContainer:function(b){return a.root_.contains(b)},isRtl:function(){return "rtl"===getComputedStyle(a.root_).getPropertyValue("direction")},setTransformOrigin:function(b){var c=getTransformPropertyName(window)+"-origin";a.root_.style.setProperty(c,b);},isFocused:function(){return document.activeElement===a.root_},saveFocus:function(){a.previousFocus_=document.activeElement;},restoreFocus:function(){a.root_.contains(document.activeElement)&&a.previousFocus_&&a.previousFocus_.focus&&a.previousFocus_.focus();},getInnerDimensions:function(){return {width:a.root_.offsetWidth,height:a.root_.offsetHeight}},getAnchorDimensions:function(){return a.anchorElement?a.anchorElement.getBoundingClientRect():null},getWindowDimensions:function(){return {width:window.innerWidth,height:window.innerHeight}},getBodyDimensions:function(){return {width:document.body.clientWidth,height:document.body.clientHeight}},getWindowScroll:function(){return {x:window.pageXOffset,y:window.pageYOffset}},setPosition:function(b){a.root_.style.left="left"in b?b.left+"px":"",a.root_.style.right="right"in b?b.right+"px":"",a.root_.style.top="top"in b?b.top+"px":"",a.root_.style.bottom="bottom"in b?b.bottom+"px":"";},setMaxHeight:function(b){a.root_.style.maxHeight=b;}})},b}(MDCComponent);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */var DefaultFocusState,cssClasses$2={MENU_SELECTED_LIST_ITEM:"mdc-menu-item--selected",MENU_SELECTION_GROUP:"mdc-menu__selection-group",ROOT:"mdc-menu"},strings$2={ARIA_CHECKED_ATTR:"aria-checked",ARIA_DISABLED_ATTR:"aria-disabled",CHECKBOX_SELECTOR:"input[type=\"checkbox\"]",LIST_SELECTOR:".mdc-list",SELECTED_EVENT:"MDCMenu:selected"},numbers$2={FOCUS_ROOT_INDEX:-1};(function(a){a[a.NONE=0]="NONE",a[a.LIST_ROOT=1]="LIST_ROOT",a[a.FIRST_ITEM=2]="FIRST_ITEM",a[a.LAST_ITEM=3]="LAST_ITEM";})(DefaultFocusState||(DefaultFocusState={}));

    var MDCMenuFoundation=/** @class */function(a){function b(c){var d=a.call(this,__assign({},b.defaultAdapter,c))||this;return d.closeAnimationEndTimerId_=0,d.defaultFocusState_=DefaultFocusState.LIST_ROOT,d}return __extends(b,a),Object.defineProperty(b,"cssClasses",{get:function(){return cssClasses$2},enumerable:/** skipRestoreFocus */!0,configurable:!0}),Object.defineProperty(b,"strings",{get:function(){return strings$2},enumerable:!0,configurable:!0}),Object.defineProperty(b,"numbers",{get:function(){return numbers$2},enumerable:!0,configurable:!0}),Object.defineProperty(b,"defaultAdapter",{/**
             * @see {@link MDCMenuAdapter} for typing information on parameters and return types.
             */get:function(){// tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    return {addClassToElementAtIndex:function(){},removeClassFromElementAtIndex:function(){},addAttributeToElementAtIndex:function(){},removeAttributeFromElementAtIndex:function(){},elementContainsClass:function(){return !1},closeSurface:function(){},getElementIndex:function(){return -1},notifySelected:function(){},getMenuItemCount:function(){return 0},focusItemAtIndex:function(){},focusListRoot:function(){},getSelectedSiblingOfItemAtIndex:function(){return -1},isSelectableItemAtIndex:function(){return !1}};// tslint:enable:object-literal-sort-keys
    },enumerable:!0,configurable:!0}),b.prototype.destroy=function(){this.closeAnimationEndTimerId_&&clearTimeout(this.closeAnimationEndTimerId_),this.adapter_.closeSurface();},b.prototype.handleKeydown=function(a){var b=a.key,c=a.keyCode;("Tab"===b||9===c)&&this.adapter_.closeSurface(!0);},b.prototype.handleItemAction=function(a){var b=this,c=this.adapter_.getElementIndex(a);0>c||(// Wait for the menu to close before adding/removing classes that affect styles.
    this.adapter_.notifySelected({index:c}),this.adapter_.closeSurface(),this.closeAnimationEndTimerId_=setTimeout(function(){// Recompute the index in case the menu contents have changed.
    var c=b.adapter_.getElementIndex(a);b.adapter_.isSelectableItemAtIndex(c)&&b.setSelectedIndex(c);},MDCMenuSurfaceFoundation.numbers.TRANSITION_CLOSE_DURATION));},b.prototype.handleMenuSurfaceOpened=function(){switch(this.defaultFocusState_){case DefaultFocusState.FIRST_ITEM:this.adapter_.focusItemAtIndex(0);break;case DefaultFocusState.LAST_ITEM:this.adapter_.focusItemAtIndex(this.adapter_.getMenuItemCount()-1);break;case DefaultFocusState.NONE:// Do nothing.
    break;default:this.adapter_.focusListRoot();}},b.prototype.setDefaultFocusState=function(a){this.defaultFocusState_=a;},b.prototype.setSelectedIndex=function(a){if(this.validatedIndex_(a),!this.adapter_.isSelectableItemAtIndex(a))throw new Error("MDCMenuFoundation: No selection group at specified index.");var b=this.adapter_.getSelectedSiblingOfItemAtIndex(a);0<=b&&(this.adapter_.removeAttributeFromElementAtIndex(b,strings$2.ARIA_CHECKED_ATTR),this.adapter_.removeClassFromElementAtIndex(b,cssClasses$2.MENU_SELECTED_LIST_ITEM)),this.adapter_.addClassToElementAtIndex(a,cssClasses$2.MENU_SELECTED_LIST_ITEM),this.adapter_.addAttributeToElementAtIndex(a,strings$2.ARIA_CHECKED_ATTR,"true");},b.prototype.setEnabled=function(a,b){this.validatedIndex_(a),b?(this.adapter_.removeClassFromElementAtIndex(a,cssClasses$1.LIST_ITEM_DISABLED_CLASS),this.adapter_.addAttributeToElementAtIndex(a,strings$2.ARIA_DISABLED_ATTR,"false")):(this.adapter_.addClassToElementAtIndex(a,cssClasses$1.LIST_ITEM_DISABLED_CLASS),this.adapter_.addAttributeToElementAtIndex(a,strings$2.ARIA_DISABLED_ATTR,"true"));},b.prototype.validatedIndex_=function(a){var b=this.adapter_.getMenuItemCount();if(!(0<=a&&a<b))throw new Error("MDCMenuFoundation: No list item at specified index.")},b}(MDCFoundation);

    var MDCMenu=/** @class */function(a){function b(){return null!==a&&a.apply(this,arguments)||this}return __extends(b,a),b.attachTo=function(a){return new b(a)},b.prototype.initialize=function(a,b){void 0===a&&(a=function(a){return new MDCMenuSurface(a)}),void 0===b&&(b=function(a){return new MDCList(a)}),this.menuSurfaceFactory_=a,this.listFactory_=b;},b.prototype.initialSyncWithDOM=function(){var a=this;this.menuSurface_=this.menuSurfaceFactory_(this.root_);var b=this.root_.querySelector(strings$2.LIST_SELECTOR);b?(this.list_=this.listFactory_(b),this.list_.wrapFocus=!0):this.list_=null,this.handleKeydown_=function(b){return a.foundation_.handleKeydown(b)},this.handleItemAction_=function(b){return a.foundation_.handleItemAction(a.items[b.detail.index])},this.handleMenuSurfaceOpened_=function(){return a.foundation_.handleMenuSurfaceOpened()},this.menuSurface_.listen(MDCMenuSurfaceFoundation.strings.OPENED_EVENT,this.handleMenuSurfaceOpened_),this.listen("keydown",this.handleKeydown_),this.listen(MDCListFoundation.strings.ACTION_EVENT,this.handleItemAction_);},b.prototype.destroy=function(){this.list_&&this.list_.destroy(),this.menuSurface_.destroy(),this.menuSurface_.unlisten(MDCMenuSurfaceFoundation.strings.OPENED_EVENT,this.handleMenuSurfaceOpened_),this.unlisten("keydown",this.handleKeydown_),this.unlisten(MDCListFoundation.strings.ACTION_EVENT,this.handleItemAction_),a.prototype.destroy.call(this);},Object.defineProperty(b.prototype,"open",{get:function(){return this.menuSurface_.isOpen()},set:function(a){a?this.menuSurface_.open():this.menuSurface_.close();},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"wrapFocus",{get:function(){return !!this.list_&&this.list_.wrapFocus},set:function(a){this.list_&&(this.list_.wrapFocus=a);},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"items",{/**
             * Return the items within the menu. Note that this only contains the set of elements within
             * the items container that are proper list items, and not supplemental / presentational DOM
             * elements.
             */get:function(){return this.list_?this.list_.listElements:[]},enumerable:!0,configurable:!0}),Object.defineProperty(b.prototype,"quickOpen",{set:function(a){this.menuSurface_.quickOpen=a;},enumerable:!0,configurable:!0}),b.prototype.setDefaultFocusState=function(a){this.foundation_.setDefaultFocusState(a);},b.prototype.setAnchorCorner=function(a){this.menuSurface_.setAnchorCorner(a);},b.prototype.setAnchorMargin=function(a){this.menuSurface_.setAnchorMargin(a);},b.prototype.setSelectedIndex=function(a){this.foundation_.setSelectedIndex(a);},b.prototype.setEnabled=function(a,b){this.foundation_.setEnabled(a,b);},b.prototype.getOptionByIndex=function(a){var b=this.items;return a<b.length?this.items[a]:null},b.prototype.setFixedPosition=function(a){this.menuSurface_.setFixedPosition(a);},b.prototype.setIsHoisted=function(a){this.menuSurface_.setIsHoisted(a);},b.prototype.setAbsolutePosition=function(a,b){this.menuSurface_.setAbsolutePosition(a,b);},b.prototype.setAnchorElement=function(a){this.menuSurface_.anchorElement=a;},b.prototype.getDefaultFoundation=function(){var a=this;// DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    // tslint:enable:object-literal-sort-keys
    return new MDCMenuFoundation({addClassToElementAtIndex:function(b,c){var d=a.items;d[b].classList.add(c);},removeClassFromElementAtIndex:function(b,c){var d=a.items;d[b].classList.remove(c);},addAttributeToElementAtIndex:function(b,c,d){var e=a.items;e[b].setAttribute(c,d);},removeAttributeFromElementAtIndex:function(b,c){var d=a.items;d[b].removeAttribute(c);},elementContainsClass:function(a,b){return a.classList.contains(b)},closeSurface:function(b){return a.menuSurface_.close(b)},getElementIndex:function(b){return a.items.indexOf(b)},notifySelected:function(b){return a.emit(strings$2.SELECTED_EVENT,{index:b.index,item:a.items[b.index]})},getMenuItemCount:function(){return a.items.length},focusItemAtIndex:function(b){return a.items[b].focus()},focusListRoot:function(){return a.root_.querySelector(strings$2.LIST_SELECTOR).focus()},isSelectableItemAtIndex:function(b){return !!closest(a.items[b],"."+cssClasses$2.MENU_SELECTION_GROUP)},getSelectedSiblingOfItemAtIndex:function(b){var c=closest(a.items[b],"."+cssClasses$2.MENU_SELECTION_GROUP),d=c.querySelector("."+cssClasses$2.MENU_SELECTED_LIST_ITEM);return d?a.items.indexOf(d):-1}})},b}(MDCComponent);

    var MDCElevationStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n.mdc-elevation--z0{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2),0px 0px 0px 0px rgba(0, 0, 0, 0.14),0px 0px 0px 0px rgba(0,0,0,.12)}.mdc-elevation--z1{box-shadow:0px 2px 1px -1px rgba(0, 0, 0, 0.2),0px 1px 1px 0px rgba(0, 0, 0, 0.14),0px 1px 3px 0px rgba(0,0,0,.12)}.mdc-elevation--z2{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12)}.mdc-elevation--z3{box-shadow:0px 3px 3px -2px rgba(0, 0, 0, 0.2),0px 3px 4px 0px rgba(0, 0, 0, 0.14),0px 1px 8px 0px rgba(0,0,0,.12)}.mdc-elevation--z4{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12)}.mdc-elevation--z5{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 5px 8px 0px rgba(0, 0, 0, 0.14),0px 1px 14px 0px rgba(0,0,0,.12)}.mdc-elevation--z6{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 6px 10px 0px rgba(0, 0, 0, 0.14),0px 1px 18px 0px rgba(0,0,0,.12)}.mdc-elevation--z7{box-shadow:0px 4px 5px -2px rgba(0, 0, 0, 0.2),0px 7px 10px 1px rgba(0, 0, 0, 0.14),0px 2px 16px 1px rgba(0,0,0,.12)}.mdc-elevation--z8{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12)}.mdc-elevation--z9{box-shadow:0px 5px 6px -3px rgba(0, 0, 0, 0.2),0px 9px 12px 1px rgba(0, 0, 0, 0.14),0px 3px 16px 2px rgba(0,0,0,.12)}.mdc-elevation--z10{box-shadow:0px 6px 6px -3px rgba(0, 0, 0, 0.2),0px 10px 14px 1px rgba(0, 0, 0, 0.14),0px 4px 18px 3px rgba(0,0,0,.12)}.mdc-elevation--z11{box-shadow:0px 6px 7px -4px rgba(0, 0, 0, 0.2),0px 11px 15px 1px rgba(0, 0, 0, 0.14),0px 4px 20px 3px rgba(0,0,0,.12)}.mdc-elevation--z12{box-shadow:0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 12px 17px 2px rgba(0, 0, 0, 0.14),0px 5px 22px 4px rgba(0,0,0,.12)}.mdc-elevation--z13{box-shadow:0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 13px 19px 2px rgba(0, 0, 0, 0.14),0px 5px 24px 4px rgba(0,0,0,.12)}.mdc-elevation--z14{box-shadow:0px 7px 9px -4px rgba(0, 0, 0, 0.2),0px 14px 21px 2px rgba(0, 0, 0, 0.14),0px 5px 26px 4px rgba(0,0,0,.12)}.mdc-elevation--z15{box-shadow:0px 8px 9px -5px rgba(0, 0, 0, 0.2),0px 15px 22px 2px rgba(0, 0, 0, 0.14),0px 6px 28px 5px rgba(0,0,0,.12)}.mdc-elevation--z16{box-shadow:0px 8px 10px -5px rgba(0, 0, 0, 0.2),0px 16px 24px 2px rgba(0, 0, 0, 0.14),0px 6px 30px 5px rgba(0,0,0,.12)}.mdc-elevation--z17{box-shadow:0px 8px 11px -5px rgba(0, 0, 0, 0.2),0px 17px 26px 2px rgba(0, 0, 0, 0.14),0px 6px 32px 5px rgba(0,0,0,.12)}.mdc-elevation--z18{box-shadow:0px 9px 11px -5px rgba(0, 0, 0, 0.2),0px 18px 28px 2px rgba(0, 0, 0, 0.14),0px 7px 34px 6px rgba(0,0,0,.12)}.mdc-elevation--z19{box-shadow:0px 9px 12px -6px rgba(0, 0, 0, 0.2),0px 19px 29px 2px rgba(0, 0, 0, 0.14),0px 7px 36px 6px rgba(0,0,0,.12)}.mdc-elevation--z20{box-shadow:0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 20px 31px 3px rgba(0, 0, 0, 0.14),0px 8px 38px 7px rgba(0,0,0,.12)}.mdc-elevation--z21{box-shadow:0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 21px 33px 3px rgba(0, 0, 0, 0.14),0px 8px 40px 7px rgba(0,0,0,.12)}.mdc-elevation--z22{box-shadow:0px 10px 14px -6px rgba(0, 0, 0, 0.2),0px 22px 35px 3px rgba(0, 0, 0, 0.14),0px 8px 42px 7px rgba(0,0,0,.12)}.mdc-elevation--z23{box-shadow:0px 11px 14px -7px rgba(0, 0, 0, 0.2),0px 23px 36px 3px rgba(0, 0, 0, 0.14),0px 9px 44px 8px rgba(0,0,0,.12)}.mdc-elevation--z24{box-shadow:0px 11px 15px -7px rgba(0, 0, 0, 0.2),0px 24px 38px 3px rgba(0, 0, 0, 0.14),0px 9px 46px 8px rgba(0,0,0,.12)}.mdc-elevation-transition{transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);will-change:box-shadow}\n\n/*# sourceMappingURL=mdc.elevation.min.css.map*/";

    var MDCThemeStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n:root{--mdc-theme-primary: #6200ee;--mdc-theme-secondary: #018786;--mdc-theme-background: #fff;--mdc-theme-surface: #fff;--mdc-theme-error: #b00020;--mdc-theme-on-primary: #fff;--mdc-theme-on-secondary: #fff;--mdc-theme-on-surface: #000;--mdc-theme-on-error: #fff;--mdc-theme-text-primary-on-background: rgba(0, 0, 0, 0.87);--mdc-theme-text-secondary-on-background: rgba(0, 0, 0, 0.54);--mdc-theme-text-hint-on-background: rgba(0, 0, 0, 0.38);--mdc-theme-text-disabled-on-background: rgba(0, 0, 0, 0.38);--mdc-theme-text-icon-on-background: rgba(0, 0, 0, 0.38);--mdc-theme-text-primary-on-light: rgba(0, 0, 0, 0.87);--mdc-theme-text-secondary-on-light: rgba(0, 0, 0, 0.54);--mdc-theme-text-hint-on-light: rgba(0, 0, 0, 0.38);--mdc-theme-text-disabled-on-light: rgba(0, 0, 0, 0.38);--mdc-theme-text-icon-on-light: rgba(0, 0, 0, 0.38);--mdc-theme-text-primary-on-dark: white;--mdc-theme-text-secondary-on-dark: rgba(255, 255, 255, 0.7);--mdc-theme-text-hint-on-dark: rgba(255, 255, 255, 0.5);--mdc-theme-text-disabled-on-dark: rgba(255, 255, 255, 0.5);--mdc-theme-text-icon-on-dark: rgba(255, 255, 255, 0.5)}.mdc-theme--primary{color:#6200ee !important;color:var(--mdc-theme-primary, #6200ee) !important}.mdc-theme--secondary{color:#018786 !important;color:var(--mdc-theme-secondary, #018786) !important}.mdc-theme--background{background-color:#fff;background-color:var(--mdc-theme-background, #fff)}.mdc-theme--surface{background-color:#fff;background-color:var(--mdc-theme-surface, #fff)}.mdc-theme--error{color:#b00020 !important;color:var(--mdc-theme-error, #b00020) !important}.mdc-theme--on-primary{color:#fff !important;color:var(--mdc-theme-on-primary, #fff) !important}.mdc-theme--on-secondary{color:#fff !important;color:var(--mdc-theme-on-secondary, #fff) !important}.mdc-theme--on-surface{color:#000 !important;color:var(--mdc-theme-on-surface, #000) !important}.mdc-theme--on-error{color:#fff !important;color:var(--mdc-theme-on-error, #fff) !important}.mdc-theme--text-primary-on-background{color:rgba(0,0,0,.87) !important;color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87)) !important}.mdc-theme--text-secondary-on-background{color:rgba(0,0,0,.54) !important;color:var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54)) !important}.mdc-theme--text-hint-on-background{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-disabled-on-background{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-disabled-on-background, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-icon-on-background{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-icon-on-background, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-primary-on-light{color:rgba(0,0,0,.87) !important;color:var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87)) !important}.mdc-theme--text-secondary-on-light{color:rgba(0,0,0,.54) !important;color:var(--mdc-theme-text-secondary-on-light, rgba(0, 0, 0, 0.54)) !important}.mdc-theme--text-hint-on-light{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-hint-on-light, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-disabled-on-light{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-disabled-on-light, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-icon-on-light{color:rgba(0,0,0,.38) !important;color:var(--mdc-theme-text-icon-on-light, rgba(0, 0, 0, 0.38)) !important}.mdc-theme--text-primary-on-dark{color:#fff !important;color:var(--mdc-theme-text-primary-on-dark, white) !important}.mdc-theme--text-secondary-on-dark{color:rgba(255,255,255,.7) !important;color:var(--mdc-theme-text-secondary-on-dark, rgba(255, 255, 255, 0.7)) !important}.mdc-theme--text-hint-on-dark{color:rgba(255,255,255,.5) !important;color:var(--mdc-theme-text-hint-on-dark, rgba(255, 255, 255, 0.5)) !important}.mdc-theme--text-disabled-on-dark{color:rgba(255,255,255,.5) !important;color:var(--mdc-theme-text-disabled-on-dark, rgba(255, 255, 255, 0.5)) !important}.mdc-theme--text-icon-on-dark{color:rgba(255,255,255,.5) !important;color:var(--mdc-theme-text-icon-on-dark, rgba(255, 255, 255, 0.5)) !important}.mdc-theme--primary-bg{background-color:#6200ee !important;background-color:var(--mdc-theme-primary, #6200ee) !important}.mdc-theme--secondary-bg{background-color:#018786 !important;background-color:var(--mdc-theme-secondary, #018786) !important}\n\n/*# sourceMappingURL=mdc.theme.min.css.map*/";

    var MDCTypographyStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n.mdc-typography{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased}.mdc-typography--headline1{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:6rem;line-height:6rem;font-weight:300;letter-spacing:-0.015625em;text-decoration:inherit;text-transform:inherit}.mdc-typography--headline2{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:3.75rem;line-height:3.75rem;font-weight:300;letter-spacing:-0.0083333333em;text-decoration:inherit;text-transform:inherit}.mdc-typography--headline3{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:3rem;line-height:3.125rem;font-weight:400;letter-spacing:normal;text-decoration:inherit;text-transform:inherit}.mdc-typography--headline4{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:2.125rem;line-height:2.5rem;font-weight:400;letter-spacing:.0073529412em;text-decoration:inherit;text-transform:inherit}.mdc-typography--headline5{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1.5rem;line-height:2rem;font-weight:400;letter-spacing:normal;text-decoration:inherit;text-transform:inherit}.mdc-typography--headline6{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1.25rem;line-height:2rem;font-weight:500;letter-spacing:.0125em;text-decoration:inherit;text-transform:inherit}.mdc-typography--subtitle1{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1rem;line-height:1.75rem;font-weight:400;letter-spacing:.009375em;text-decoration:inherit;text-transform:inherit}.mdc-typography--subtitle2{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.375rem;font-weight:500;letter-spacing:.0071428571em;text-decoration:inherit;text-transform:inherit}.mdc-typography--body1{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1rem;line-height:1.5rem;font-weight:400;letter-spacing:.03125em;text-decoration:inherit;text-transform:inherit}.mdc-typography--body2{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.0178571429em;text-decoration:inherit;text-transform:inherit}.mdc-typography--caption{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.75rem;line-height:1.25rem;font-weight:400;letter-spacing:.0333333333em;text-decoration:inherit;text-transform:inherit}.mdc-typography--button{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:2.25rem;font-weight:500;letter-spacing:.0892857143em;text-decoration:none;text-transform:uppercase}.mdc-typography--overline{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.75rem;line-height:2rem;font-weight:500;letter-spacing:.1666666667em;text-decoration:none;text-transform:uppercase}\n\n/*# sourceMappingURL=mdc.typography.min.css.map*/";

    var MDCMenuStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n@-webkit-keyframes mdc-ripple-fg-radius-in{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-radius-in{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@-webkit-keyframes mdc-ripple-fg-opacity-in{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-in{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@-webkit-keyframes mdc-ripple-fg-opacity-out{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}@keyframes mdc-ripple-fg-opacity-out{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-ripple-surface--test-edge-var-bug{--mdc-ripple-surface-test-edge-var: 1px solid #000;visibility:hidden}.mdc-ripple-surface--test-edge-var-bug::before{border:var(--mdc-ripple-surface-test-edge-var)}.mdc-menu{min-width:112px}.mdc-menu .mdc-list-item__meta{color:rgba(0,0,0,.87)}.mdc-menu .mdc-list-item__graphic{color:rgba(0,0,0,.87)}.mdc-menu .mdc-list{color:rgba(0,0,0,.87)}.mdc-menu .mdc-list-divider{margin:8px 0}.mdc-menu .mdc-list-item{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.mdc-menu .mdc-list-item--disabled{cursor:auto}.mdc-menu a.mdc-list-item .mdc-list-item__text,.mdc-menu a.mdc-list-item .mdc-list-item__graphic{pointer-events:none}.mdc-menu__selection-group{padding:0;fill:currentColor}.mdc-menu__selection-group .mdc-list-item{padding-left:56px;padding-right:16px}[dir=rtl] .mdc-menu__selection-group .mdc-list-item,.mdc-menu__selection-group .mdc-list-item[dir=rtl]{padding-left:16px;padding-right:56px}.mdc-menu__selection-group .mdc-menu__selection-group-icon{left:16px;right:initial;display:none;position:absolute;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}[dir=rtl] .mdc-menu__selection-group .mdc-menu__selection-group-icon,.mdc-menu__selection-group .mdc-menu__selection-group-icon[dir=rtl]{left:initial;right:16px}.mdc-menu-item--selected .mdc-menu__selection-group-icon{display:inline}\n\n/*# sourceMappingURL=mdc.menu.min.css.map*/";

    var MDCMenuSurfaceStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n.mdc-menu-surface{display:none;position:absolute;box-sizing:border-box;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);margin:0;padding:0;-webkit-transform:scale(1);transform:scale(1);-webkit-transform-origin:top left;transform-origin:top left;opacity:0;overflow:auto;will-change:transform,opacity;z-index:8;transition:opacity .03s linear,-webkit-transform .12s cubic-bezier(0, 0, 0.2, 1);transition:opacity .03s linear,transform .12s cubic-bezier(0, 0, 0.2, 1);transition:opacity .03s linear,transform .12s cubic-bezier(0, 0, 0.2, 1),-webkit-transform .12s cubic-bezier(0, 0, 0.2, 1);box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12);background-color:#fff;background-color:var(--mdc-theme-surface, #fff);color:#000;color:var(--mdc-theme-on-surface, #000);border-radius:4px;transform-origin-left:top left;transform-origin-right:top right}.mdc-menu-surface:focus{outline:none}.mdc-menu-surface--open{display:inline-block;-webkit-transform:scale(1);transform:scale(1);opacity:1}.mdc-menu-surface--animating-open{display:inline-block;-webkit-transform:scale(0.8);transform:scale(0.8);opacity:0}.mdc-menu-surface--animating-closed{display:inline-block;opacity:0;transition:opacity .075s linear}[dir=rtl] .mdc-menu-surface,.mdc-menu-surface[dir=rtl]{transform-origin-left:top right;transform-origin-right:top left}.mdc-menu-surface--anchor{position:relative;overflow:visible}.mdc-menu-surface--fixed{position:fixed}\n\n/*# sourceMappingURL=mdc.menu-surface.min.css.map*/";

    var MDCListStyles = "/**\n * @license\n * Copyright Google LLC All Rights Reserved.\n *\n * Use of this source code is governed by an MIT-style license that can be\n * found in the LICENSE file at https://github.com/material-components/material-components-web/blob/master/LICENSE\n */\n.mdc-list{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1rem;line-height:1.75rem;font-weight:400;letter-spacing:.009375em;text-decoration:inherit;text-transform:inherit;line-height:1.5rem;margin:0;padding:8px 0;list-style-type:none;color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}.mdc-list:focus{outline:none}.mdc-list-item{height:48px}.mdc-list-item__secondary-text{color:rgba(0,0,0,.54);color:var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54))}.mdc-list-item__graphic{background-color:transparent}.mdc-list-item__graphic{color:rgba(0,0,0,.38);color:var(--mdc-theme-text-icon-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-item__meta{color:rgba(0,0,0,.38);color:var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-group__subheader{color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}.mdc-list-item--disabled .mdc-list-item__text{opacity:.38}.mdc-list-item--disabled .mdc-list-item__text{color:#000;color:var(--mdc-theme-on-surface, #000)}.mdc-list--dense{padding-top:4px;padding-bottom:4px;font-size:.812rem}.mdc-list-item{display:flex;position:relative;align-items:center;justify-content:flex-start;padding:0 16px;overflow:hidden}.mdc-list-item:focus{outline:none}.mdc-list-item--selected,.mdc-list-item--activated{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-list-item--selected .mdc-list-item__graphic,.mdc-list-item--activated .mdc-list-item__graphic{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-list-item__graphic{margin-left:0;margin-right:32px;width:24px;height:24px;flex-shrink:0;align-items:center;justify-content:center;fill:currentColor}.mdc-list-item[dir=rtl] .mdc-list-item__graphic,[dir=rtl] .mdc-list-item .mdc-list-item__graphic{margin-left:32px;margin-right:0}.mdc-list .mdc-list-item__graphic{display:inline-flex}.mdc-list-item__meta{margin-left:auto;margin-right:0}.mdc-list-item__meta:not(.material-icons){font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.75rem;line-height:1.25rem;font-weight:400;letter-spacing:.0333333333em;text-decoration:inherit;text-transform:inherit}.mdc-list-item[dir=rtl] .mdc-list-item__meta,[dir=rtl] .mdc-list-item .mdc-list-item__meta{margin-left:0;margin-right:auto}.mdc-list-item__text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.mdc-list-item__text[for]{pointer-events:none}.mdc-list-item__primary-text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;margin-bottom:-20px;display:block}.mdc-list-item__primary-text::before{display:inline-block;width:0;height:32px;content:\"\";vertical-align:0}.mdc-list-item__primary-text::after{display:inline-block;width:0;height:20px;content:\"\";vertical-align:-20px}.mdc-list--dense .mdc-list-item__primary-text{display:block;margin-top:0;line-height:normal;margin-bottom:-20px}.mdc-list--dense .mdc-list-item__primary-text::before{display:inline-block;width:0;height:24px;content:\"\";vertical-align:0}.mdc-list--dense .mdc-list-item__primary-text::after{display:inline-block;width:0;height:20px;content:\"\";vertical-align:-20px}.mdc-list-item__secondary-text{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.0178571429em;text-decoration:inherit;text-transform:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;display:block}.mdc-list-item__secondary-text::before{display:inline-block;width:0;height:20px;content:\"\";vertical-align:0}.mdc-list--dense .mdc-list-item__secondary-text{display:block;margin-top:0;line-height:normal;font-size:inherit}.mdc-list--dense .mdc-list-item__secondary-text::before{display:inline-block;width:0;height:20px;content:\"\";vertical-align:0}.mdc-list--dense .mdc-list-item{height:40px}.mdc-list--dense .mdc-list-item__graphic{margin-left:0;margin-right:36px;width:20px;height:20px}.mdc-list-item[dir=rtl] .mdc-list--dense .mdc-list-item__graphic,[dir=rtl] .mdc-list-item .mdc-list--dense .mdc-list-item__graphic{margin-left:36px;margin-right:0}.mdc-list--avatar-list .mdc-list-item{height:56px}.mdc-list--avatar-list .mdc-list-item__graphic{margin-left:0;margin-right:16px;width:40px;height:40px;border-radius:50%}.mdc-list-item[dir=rtl] .mdc-list--avatar-list .mdc-list-item__graphic,[dir=rtl] .mdc-list-item .mdc-list--avatar-list .mdc-list-item__graphic{margin-left:16px;margin-right:0}.mdc-list--two-line .mdc-list-item__text{align-self:flex-start}.mdc-list--two-line .mdc-list-item{height:72px}.mdc-list--two-line.mdc-list--dense .mdc-list-item,.mdc-list--avatar-list.mdc-list--dense .mdc-list-item{height:60px}.mdc-list--avatar-list.mdc-list--dense .mdc-list-item__graphic{margin-left:0;margin-right:20px;width:36px;height:36px}.mdc-list-item[dir=rtl] .mdc-list--avatar-list.mdc-list--dense .mdc-list-item__graphic,[dir=rtl] .mdc-list-item .mdc-list--avatar-list.mdc-list--dense .mdc-list-item__graphic{margin-left:20px;margin-right:0}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item{cursor:pointer}a.mdc-list-item{color:inherit;text-decoration:none}.mdc-list-divider{height:0;margin:0;border:none;border-bottom-width:1px;border-bottom-style:solid}.mdc-list-divider{border-bottom-color:rgba(0,0,0,.12)}.mdc-list-divider--padded{margin:0 16px}.mdc-list-divider--inset{margin-left:72px;margin-right:0;width:calc(100% - 72px)}.mdc-list-group[dir=rtl] .mdc-list-divider--inset,[dir=rtl] .mdc-list-group .mdc-list-divider--inset{margin-left:0;margin-right:72px}.mdc-list-divider--inset.mdc-list-divider--padded{width:calc(100% - 72px - 16px)}.mdc-list-group .mdc-list{padding:0}.mdc-list-group__subheader{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1rem;line-height:1.75rem;font-weight:400;letter-spacing:.009375em;text-decoration:inherit;text-transform:inherit;margin:.75rem 16px}@-webkit-keyframes mdc-ripple-fg-radius-in{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-radius-in{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@-webkit-keyframes mdc-ripple-fg-opacity-in{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-in{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@-webkit-keyframes mdc-ripple-fg-opacity-out{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}@keyframes mdc-ripple-fg-opacity-out{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-ripple-surface--test-edge-var-bug{--mdc-ripple-surface-test-edge-var: 1px solid #000;visibility:hidden}.mdc-ripple-surface--test-edge-var-bug::before{border:var(--mdc-ripple-surface-test-edge-var)}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0)}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:\"\"}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded::before{-webkit-transform:scale(var(--mdc-ripple-fg-scale, 1));transform:scale(var(--mdc-ripple-fg-scale, 1))}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded::after{top:0;left:0;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:center center;transform-origin:center center}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded--foreground-activation::after{-webkit-animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards;animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded--foreground-deactivation::after{-webkit-animation:mdc-ripple-fg-opacity-out 150ms;animation:mdc-ripple-fg-opacity-out 150ms;-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item::after{background-color:#000}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item:hover::before{opacity:.04}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded--background-focused::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.12}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.12}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.12}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated::before{opacity:.12}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated::after{background-color:#6200ee}@supports not (-ms-ime-align: auto){:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated::after{background-color:var(--mdc-theme-primary, #6200ee)}}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated:hover::before{opacity:.16}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated.mdc-ripple-upgraded--background-focused::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.24}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.24}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--activated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.24}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected::before{opacity:.08}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected::after{background-color:#6200ee}@supports not (-ms-ime-align: auto){:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected::after{background-color:var(--mdc-theme-primary, #6200ee)}}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected:hover::before{opacity:.12}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected.mdc-ripple-upgraded--background-focused::before,:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.2}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.2}:not(.mdc-list--non-interactive)>:not(.mdc-list-item--disabled).mdc-list-item--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.2}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0)}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::before,:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:\"\"}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded::before{-webkit-transform:scale(var(--mdc-ripple-fg-scale, 1));transform:scale(var(--mdc-ripple-fg-scale, 1))}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded::after{top:0;left:0;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:center center;transform-origin:center center}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded--foreground-activation::after{-webkit-animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards;animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded--foreground-deactivation::after{-webkit-animation:mdc-ripple-fg-opacity-out 150ms;animation:mdc-ripple-fg-opacity-out 150ms;-webkit-transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::before,:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::before,:not(.mdc-list--non-interactive)>.mdc-list-item--disabled::after{background-color:#000}:not(.mdc-list--non-interactive)>.mdc-list-item--disabled.mdc-ripple-upgraded--background-focused::before,:not(.mdc-list--non-interactive)>.mdc-list-item--disabled:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.12}\n\n/*# sourceMappingURL=mdc.list.min.css.map*/";

    function positionToString(a){return `${a.line}:${a.column}`}class ErrorWithLocation extends Error{constructor(a,b){super(`${a} (at ${positionToString(b)})`),this.originalMessage=a,this.loc=b;}}function error(a,b){return new ErrorWithLocation(a,b)}

    function isIdentifierStart(a){return 65>a?36==a:!!(91>a)||(97>a?95==a:!!(123>a));// 36 -> $
    // 65-90 -> A-Z
    // 95 -> _
    // 97-122 -> a-z
    }function isIdentifierChar(a){return 48>a?36==a:!!(58>a)||isIdentifierStart(a);// 36 -> $
    // 48-57 -> 0-9
    }class Token{constructor(a,b,c){this.type=a,this.value=b,this.loc=c;}}const FAKE_LOC={start:{pos:0,line:0,column:0},end:{pos:0,line:0,column:0}};class Tokenizer{constructor(a){this.input=a,this.inputLen=a.length,this.pos=0,this.lineStart=0,this.curLine=1,this.start=this.curPosition(),this.lastToken=new Token("","",{start:this.start,end:this.start});}curPosition(){return {pos:this.pos,line:this.curLine,column:this.pos-this.lineStart}}nextLine(a){this.lineStart=this.pos,this.curLine+=null==a?1:a;}codeAt(a){return this.input.charCodeAt(a)}charAt(a){return this.input.charAt(a)}currToken(){return this.lastToken}newToken(a,b){return new Token(a,b,{start:this.start,end:this.curPosition()})}nextToken(){return this.skipSpace(),this.start=this.curPosition(),this.lastToken=this.pos>=this.inputLen?this.newToken("eof",""):this.readToken(this.charAt(this.pos)),this.lastToken}skipSpace(){for(;this.pos<this.inputLen;){const a=this.codeAt(this.pos);switch(a){case 10:// '\n' line feed
    case 13:this.pos++,this.nextLine();break;case 9:// horizontal tab
    case 12:// form feed
    case 32:this.pos++;break;case 47:// '/'
    switch(this.codeAt(this.pos+1)){case 42:this.skipBlockComment();break;case 47:this.skipLineComment();break;default:return;}break;default:return;}}}skipLineComment(){let a=this.codeAt(this.pos+=2);if(this.pos<this.inputLen)for(;10!==a&&13!==a&&++this.pos<this.inputLen;)a=this.codeAt(this.pos);}skipBlockComment(){const a=this.pos,b=this.input.indexOf("*/",this.pos+=2);if(-1===b)throw new Error("Unterminated comment");this.pos=b+2;const c=this.input.slice(a,this.pos);for(let a=0;a<c.length;a++){const b=c.charCodeAt(a);(10===b||13===b)&&this.nextLine();}}readWord(){const a=this.pos;for(;this.pos<this.inputLen&&isIdentifierChar(this.codeAt(this.pos));)this.pos++;const b=this.input.slice(a,this.pos);return this.newToken("identifier",b)}readToken(a){switch(a){case"<":case">":case"(":case")":case":":case"{":case"}":case",":case"=":case".":case";":return this.pos++,this.newToken(a,a);}if(isIdentifierStart(a.charCodeAt(0)))return this.readWord();throw error(`Unexpected character '${this.charAt(this.pos)}'`,this.start)}}

    class Parser{constructor(a){this.input=a,this.tokenizer=new Tokenizer(a),this.start={pos:0,line:0,column:0},this.lastTokenEnd=this.start,this.token=this.tokenizer.nextToken(),this.decisionUuid=1,this.unknownUuid=1;}startNode(){return this.token.loc.start}endNode(){return this.lastTokenEnd}// Returns the next current token
    next(){return this.lastTokenEnd=this.token.loc.end,this.token=this.tokenizer.nextToken(),this.token}// If we have a token with this type, we return in, and call "next". If not, we return null
    eat(a,b){const c=this.token;return c.type===a&&(null==b||c.value===b)?(this.next(),c):null}// Returns "true" if the current token has this type
    match(a){return this.token.type===a}// Tries to consume a token with a specific type, and if it can't, it throws an error
    expect(a,b){const c=this.eat(a,b);if(null==c)throw error(`Unexpected token ${this.token.type}, expected ${a}`,this.token.loc.start);return c}// Parsing starts here
    parse(){const a=this.startNode();// FIXME save package
    if(this.eat("identifier","package")){for(this.expect("identifier");this.eat(".");)this.expect("identifier");this.expect(";");}// FIXME save imports
    for(;this.eat("identifier","import");){for(this.expect("identifier");this.eat(".");)this.expect("identifier");this.expect(";");}this.expect("identifier","typestate");const b=this.expect("identifier").value,c=[];for(this.expect("{");!this.eat("}");)c.push(this.parseStateDefName());return this.expect("eof"),{type:"Typestate",name:b,states:c,loc:{start:a,end:this.endNode()}}}parseIdentifier(){const a=this.startNode();return {type:"Identifier",name:this.expect("identifier").value,loc:{start:a,end:this.endNode()}}}parseStateDefName(){const a=this.startNode(),b=this.expect("identifier").value;if("end"===b)throw error(`You cannot have a state called 'end'`,a);this.expect("=");const{type:c,methods:d}=this.parseState();return {type:c,name:b,methods:d,_name:b,loc:{start:a,end:this.endNode()}}}parseState(){const a=this.startNode(),b=`unknown:${this.unknownUuid++}`,c=[];if(this.expect("{"),!this.match("}"))for(;c.push(this.parseMethod()),!!this.eat(","););return this.expect("}"),{type:"State",name:null,methods:c,_name:b,loc:{start:a,end:this.endNode()}}}parseMethod(){const a=this.startNode(),b=this.parseIdentifier(),c=this.expect("identifier").value,d=[];if("end"===c)throw error(`Method cannot be called 'end'`,a);if(this.expect("("),!this.match(")"))for(;d.push(this.parseIdentifier()),!!this.eat(","););this.expect(")"),this.expect(":");let e;return e=this.match("<")?this.parseLabels():this.match("{")?this.parseState():this.parseIdentifier(),{type:"Method",name:c,arguments:d,returnType:b,transition:e,loc:{start:a,end:this.endNode()}}}parseLabels(){const a=this.startNode(),b=[],c=`decision:${this.decisionUuid++}`;for(this.expect("<");;){const a=this.parseIdentifier();if(this.expect(":"),this.match("identifier")?b.push([a,this.parseIdentifier()]):b.push([a,this.parseState()]),!this.eat(","))break}return this.expect(">"),{type:"DecisionState",transitions:b,_name:c,loc:{start:a,end:this.endNode()}}}}

    function checkState(a,b,c){if(/:/.test(b))/^decision:/.test(b)?a.choices.add(b):a.states.add(b);else if(!a.states.has(b))throw error(`State not defined: ${b}`,c.loc.start)}function equalSignature(c,a){if(c.name!==a.name)return !1;if(c.arguments.length!==a.arguments.length)return !1;for(let b=0;b<c.arguments.length;b++)if(c.arguments[b].name!==a.arguments[b].name)return !1;return(/** skipRestoreFocus */ /** shouldBubble */!0)}function compileMethod(a,b,c){const d=b.transition;let e="";"State"===d.type?(compileState(d,c),e=d._name):"DecisionState"===d.type?(compileDecisionState(d,c),e=d._name):"Identifier"===d.type&&(e=d.name),checkState(c,e,d);const f={name:b.name,arguments:b.arguments.map(b=>b.name),returnType:b.returnType.name};return c.methods.push(f),c.mTransitions.push({from:a,transition:f,to:e}),c}function compileLabel(a,[b,c],d){let e="";"State"===c.type?(compileState(c,d),e=c._name):"Identifier"===c.type&&(e=c.name),checkState(d,e,c);const f={name:b.name};return d.labels.push(f),d.lTransitions.push({from:a,transition:f,to:e}),d}function compileState(a,b){const c=a._name;if(checkState(b,c,a),0===a.methods.length)return b.final.add(c),b;for(let c=0;c<a.methods.length;c++){const b=a.methods[c];for(let d=0;d<c;d++)if(equalSignature(b,a.methods[d]))throw error(`Duplicate method signature: ${b.name}(${b.arguments.map(b=>b.name).join(", ")})`,b.loc.start)}return a.methods.reduce((a,b)=>compileMethod(c,b,a),b)}function compileDecisionState(a,b){const c=a._name;checkState(b,c,a);const d=new Set;for(const[c]of a.transitions){const a=c.name;if(d.has(a))throw error(`Duplicate case label: ${a}`,c.loc.start);d.add(a);}return a.transitions.reduce((a,b)=>compileLabel(c,b,a),b)}function astToAutomaton(a){const b={states:new Set(["end"]),choices:new Set,methods:[],labels:[],start:"",final:new Set(["end"]),mTransitions:[],lTransitions:[]};// Get all named states
    for(const c of a.states){if(b.states.has(c.name))throw error(`Duplicated ${c.name} state`,c.loc.start);b.states.add(c.name);}// Calculate first state
    return b.start=0===a.states.length?"end":a.states[0].name,a.states.reduce((a,b)=>compileState(b,a),b)}

    function check(a,b){if(/decision:/.test(a)){if(b.choices.has(a))return;throw new Error(`${a} is not in choices set`)}if(!b.states.has(a))throw new Error(`${a} is not in states set`)}function createIdentifier(a){return {type:"Identifier",name:a,loc:FAKE_LOC}}function createLabelTransition(a,b){if(check(a,b),/unknown:/.test(a))return createUnnamedState(a,b);if(/decision:/.test(a))throw new Error(`Cannot have a transition from a decision state to ${a}`);return createIdentifier(a)}function createMethodTransition(a,b){return check(a,b),/unknown:/.test(a)?createUnnamedState(a,b):/decision:/.test(a)?createDecisionState(a,b):createIdentifier(a)}function createDecisionState(a,b){const c={type:"DecisionState",transitions:[],_name:a,loc:FAKE_LOC};for(const d of b.lTransitions)d.from===c._name&&c.transitions.push([createIdentifier(d.transition.name),createLabelTransition(d.to,b)]);return c}function applyTransitions(a,b){for(const c of b.mTransitions)c.from===a._name&&a.methods.push({type:"Method",name:c.transition.name,arguments:c.transition.arguments.map(createIdentifier),returnType:createIdentifier(c.transition.returnType),transition:createMethodTransition(c.to,b),loc:FAKE_LOC});return a}function createUnnamedState(a,b){return applyTransitions({type:"State",name:null,methods:[],_name:a,loc:FAKE_LOC},b)}function createNamedState(a,b){return applyTransitions({type:"State",name:a,methods:[],_name:a,loc:FAKE_LOC},b)}function automatonToAst(a,b){const c={type:"Typestate",name:a||"NO_NAME",states:[],loc:FAKE_LOC};// Make sure the first state is the start
    "end"!==b.start&&c.states.push(createNamedState(b.start,b));for(const d of b.states)"end"===d||d===b.start||/:/.test(d)||c.states.push(createNamedState(d,b));return c}

    function generateIdentifier(a){return a.name}function generateTransition(a){return "Identifier"===a.type?generateIdentifier(a):"State"===a.type?generateUnnamedState(a):generateDecisionState(a)}function generateLabel([a,b]){return `${generateIdentifier(a)}: ${generateTransition(b)}`}function generateDecisionState(a){return `<${a.transitions.map(generateLabel).join(", ")}>`}function generateMethod(a){return `${generateIdentifier(a.returnType)} ${a.name}(${a.arguments.map(generateIdentifier).join(", ")}): ${generateTransition(a.transition)}`}function generateUnnamedState(a){return `{\n${a.methods.map(generateMethod).join(",\n")}\n}`}function generateNamedState(a){return `${a.name} = {\n${a.methods.map(generateMethod).join(",\n")}\n}`}function generator(a){return `typestate ${a.name} {\n${a.states.map(generateNamedState).join("\n")}\n}\n`}

    function createAutomaton(a){const b=new Parser(a),c=b.parse();return astToAutomaton(c)}function parse(a){return new Parser(a).parse()}

    /* globals customElements */const DEFAULT_TYPESTATE=`typestate FileProtocol {

  Init = {
    Status open(): <OK: Open, ERROR: end>
  }

  Open = {
    Boolean hasNext(): <TRUE: Read, FALSE: Close>,
    void close(): end
  }

  Read = {
    void read(): Open
  }

  Close = {
    void close(): end
  }

}`;// Convert sets in arrays
    function fixAutomaton(b){return b.states=Array.from(b.states),b.choices=Array.from(b.choices),b.final=Array.from(b.final),b}// Convert arrays in sets
    function fixAutomaton2(b){return b.states=new Set(b.states),b.choices=new Set(b.choices),b.final=new Set(b.final),b}const transforms={view(a){return html`<automaton-viewer .automaton="${createAutomaton(a)}"></automaton-viewer>`},parse(a){return html`<json-viewer .json="${parse(a)}"></json-viewer>`},astToAutomaton(a){return html`<json-viewer .json="${fixAutomaton(astToAutomaton(JSON.parse(a)))}"></json-viewer>`},automatonToAst(a){return html`<json-viewer .json="${automatonToAst("NAME",fixAutomaton2(JSON.parse(a)))}"></json-viewer>`},generator(a){return html`<text-viewer .text="${generator(JSON.parse(a))}"></text-viewer>`}},arrow=`→`,items=["Preview",`Typestate ${arrow} AST`,`AST ${arrow} Automaton`,`Automaton ${arrow} AST`,`AST ${arrow} Typestate`],listItems=items.map(a=>html`<li class="mdc-list-item" role="menuitem" tabindex="0"><span class="mdc-list-item__text">${a}</span></li>`);class App extends LitElement{static get properties(){return {}}firstUpdated(){const a=this.shadowRoot.querySelector(".mdc-menu"),b=new MDCMenu(a),c=this.shadowRoot.querySelector("#menu-button");c.addEventListener("click",()=>{b.open=!b.open;}),a.addEventListener("MDCMenu:selected",a=>{const b=this.shadowRoot.querySelectorAll("my-transformation");b[a.detail.index].scrollIntoView();}),b.setAnchorMargin({top:10,left:10});}render(){return html`
      <div class="toolbar mdc-menu-anchor">
        <div id="menu-button"><div></div></div>
        <div class="mdc-menu mdc-menu-surface">
          <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
            ${listItems}
          </ul>
        </div>
        <span class="title">Typestate</span>
      </div>
      <div class="container">
        <div>
          <my-transformation .defaultValue="${DEFAULT_TYPESTATE}" .myTitle="${items[0]}" .fn="${transforms.view}"></my-transformation>
          <my-transformation .myTitle="${items[1]}" .fn="${transforms.parse}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[2]}" .fn="${transforms.astToAutomaton}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[3]}" .fn="${transforms.automatonToAst}" .textareaStyle="height: 200px;"></my-transformation>
          <my-transformation .myTitle="${items[4]}" .fn="${transforms.generator}" .textareaStyle="height: 200px;"></my-transformation>
        </div>
      </div>
    `}}App.styles=css`
  ${unsafeCSS(MDCElevationStyles)}
  ${unsafeCSS(MDCThemeStyles)}
  ${unsafeCSS(MDCTypographyStyles)}
  ${unsafeCSS(MDCMenuStyles)}
  ${unsafeCSS(MDCMenuSurfaceStyles)}
  ${unsafeCSS(MDCListStyles)}
  .toolbar {
    width: 100%;
    height: 64px;
    background: #01579b; /* #336fb7; */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .toolbar .title {
    margin-left: 5px;
    color: white;
    font-weight: bold;
    font-size: 16px;
    line-height: 64px;
    float: left;
  }
  #menu-button {
    margin-left: 5px;
    background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 style=%22fill:white%22 viewBox=%220 0 24 24%22%3E%3Cg%3E%3Cpath d=%22M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z%22%3E%3C/path%3E%3C/g%3E%3C/svg%3E');
    background-size: 24px 24px;
    background-repeat: no-repeat;
    background-position: center;
    width: 64px;
    height: 64px;
    float: left;
    cursor: pointer;
  }
  #menu-button div {
    width: 34px;
    height: 34px;
    margin: 15px;
  }
  #menu-button:hover div {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
  .container {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }
  .container div {
    margin: 0 20px;
  }
  my-transformation {
    padding-top: 10px;
  }
  my-transformation:nth-last-child(1) {
    padding-bottom: 20px;
  }
  `,customElements.define("my-app",App);

}());

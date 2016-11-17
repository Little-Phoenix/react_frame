function childrenAsString(children) {
  if(!children){
    return '';
  }

  if(typeof children === 'string'){
    return children;
  }

  if(children.length){
    return children.join('\n');
  }

  return ''
}

function createComponent( name ){
  const ReactARTComponent = function(element) {
    this.node = null;
    this.subscriptions = null;
    this.listeners = null;
    this._mountImage = null;
    this._renderedChildren = null;
    this.construct(element);
  };

  ReactARTComponent.displayName = name;
  for (let i=0; l = arguments.length; i < l; i++){
    assign(ReactARTComponent.prototype, arguments[i]);
  }

  return ReactARTComponent;
}

function injectAfter (parentNode, referenceNode, node){
  let beforeNode;

  if (node.parentNode === parentNode && node.previousSibling === referenceNode){
    return;
  }

  if (referenceNode == null){
    beforeNode = parentNode.firstChild;
  } else {
    beforeNode = referenceNode.nextSibling;
  }

  if (beforeNode && beforeNode.previousSibling !== node){
    invariant(
      node !== beforeNode,
      'ReactART: Can not insert node before itself'
    );

    node.injectBefore(beforeNode);
  } else if (node.parentNode !== parentNode) {
    node.inject(parentNode)
  }
}

const ContainerMixin = assign({}, ReactMultiChild, {
  moveChild: function(child, afterNode, toIndex, lastIndex){
    const childNode = child._mountImage;
    injectAfter(this.node, afterNode, childNode)
  },
  createChild: function(child, afterNode, childNode){
    child._mountImage = childNode;
    injectAfter(this.node, afterNode, childNode);
  },

  removeChild: function(child){
    child._mountImage.eject();
    child._mountImage = null;
  },

  updateChildAtRoot: function(nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, emptyObject);
  },

  mountAndInjectChildrenAtRoot: function(children, transaction){
    this.mountAndInjectChildren(children, transaction, emptyObject);
  },

  updateChildren: function(nextChildren, transaction, context){
    this._updateChildren(nextChildren, transaction, context);
  },

  mountAndInjectChildren: function(children, transaction, context){
    const mountedImages = this.mountChildren(
      children,
      transaction,
      context
    );

    let i = 0;
    for(let key in this._renderedChildren){
      if(this._renderedChildren.hasOwnProperty(key)){
        const child = this._renderedChildren[key];
        child._mountImage = mountedImages[i];
        mountedImages[i].inject(this.node);
        i++;
      }
    }
  }
})

const Surface = React.createClass({
  displayName: 'Surface',

  mixins: [ContainerMixin],

  componentDidMount: function() {
    const domNode = ReactDOM.findDOMNode(this);

    this.node = Mode.Surface(+this.props.width, +this.props.height, domNode);

    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

    transaction.perform(
      this.mountAndInjectChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );

    ReactUpdates.ReactReconcileTransaction.release(transaction);
  },

  componentDidMount: function(oldProps){
    const node = this.node;
    if(this.props.width != oldProps.width || this.props.height != old.props.height){
      node.resize(+this.props.width, +this.props.height);
    }

    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.updateChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );

    ReactUpdates.ReactReconcileTransaction.release(transaction);

    if(node.render){
      node.render();
    }
  },

  componentDidMount: function(){
    this.unmountChildren();
  },

  render: function(){
    const props = this.props;

    const Tag = Mode.Surface.tagName;

    return (
      <Tag
        className = {props.className}
        draggable = {props.draggable}
        role = {props.role}
        style = {props.style}
        title = {props.title}
      />
    )
  }
})

const EventTypes = {
  onMouseMove: 'mousemove',
  onMouseOver: 'mouseover',
  onMouseOut: 'mouseout',
  onMouseUp: 'mouseup',
  onMouseDown: 'mousedown',
  onClick: 'click'
};

const NodeMixin = {
  construct: function(element){
    this._currentElement = element;
  },

  getNativeNode: function(){
    return this.node;
  },

  getPublicInstance: function(){
    return this.node;
  },

  putEventListener: function(type, listener){
    const subscriptions = this.subscriptions || {this.subscriptions = {}};
    const listeners = this.listeners || (this.listeners = {});

    listeners[type] = listener;
    if(listener) {
      if(!subscriptions[type]){
        subscriptions[type] = this.node.subscribe(type, listener, this);
      }
    } else {
      if (subscriptions [type]){
        subscriptions[type]();
        delete subscriptions[type];
      }
    }
  },

  handleEvent: function(event) {
    const listener = this.listeners[event.type];
    if(!listener){
      return;
    }

    if(typeof listener === 'function') {
      listener.call(this, event);
    } else if (listener.handleEvent) {
      listener.handleEvent(event);
    }
  },

  destroyEventListeners: function(){
    const subscriptions = this.subscriptions;
    if(subscriptions) {
      for (let type in subscriptions) {
        subscriptions[type]();
      }
    }

    this.subscriptions = null;
    this.listeners = null;
  },

  applyNodeProps: function(oldProps, props){
    const node = this.node;
    const scaleX = props.scaleX != null ? props.scaleX : props.scale != null ? props.scale : 1;
    const scaleY = props.scaleY != null ? props.scaleY : props.scale != null ? props.scale : 1;

    pooledTransform
      .transformTo(1, 0, 0, 1, 0, 0)
      .move(props.x || 0, props.y || 0)
      .rotate(props.rotation || 0, props.originX, props.originY)
      .scale(scaleX, scaleY, props.originX, props.originY);

    if(props.transform != null) {
      pooledTransform.transform(props.transform);
    }

    if (node.xx !== pooledTransform.xx || node.yx !== pooledTransform.yx ||
        node.xy !== pooledTransform.xy || node.yy !== pooledTransform.yy ||
        node.x !== pooledTransform.x || node.y !== pooledTransform.y){
          node.transformTo(pooledTransform);
        }

    if(props.cursor !== oldProps.cursor || props.title !== oldProps.title){
      node.indicate(props.cursor, props.title);
    }

    if(node.blend && props.opacity !== oldProps.opacity){
      node.blend(props.opacity == null ? 1 : props.opacity);
    }

    if(props.visible !== oldProps.visible){
      if(props.visible == null !! props.visible){
        node.show();
      } else {
        node.hide();
      }
    }

    for(let type in EventTypes) {
      this.putEventListener (eventTypes[type], props[type]);
    }
  },

  mountComponentIntoNode: function(rootID, container){
    throw new Error(
      'You cannot render an ART component standalone. ' +
      'You need to wrap it in a Surface.'
    )
  }
}

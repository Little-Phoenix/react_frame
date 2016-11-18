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
    );
  }
}


const Group = createComponent('Group', NodeMixin, ContainerMixin, {
  mountComponent: function(
    transaction,
    nativeParent,
    nativeContainerInfo,
    context
  ) {
    this.node = Mode.Group();
    const props = this._currentElement.props;
    this.applyGroupProps(emptyObject, props);
    this.mountAndInjectChildren(props.children, transaction, context);
    return this.node;
  },

  receiveComponent: function(nextComponent, transaction, context) {
    const props = nextComponent.props;
    const oldProps = this._currentElement.props;
    this.applyGroupProps(oldProps, props);
    this.updateChildren(props.children, transaction, context);
    this._currentElement = nextComponent;
  },

  applyGroupProps: function(oldProps, props){
    this.node.width = props.width;
    this.node.height = props.height;
    this.applyNodeProps(oldProps, props);
  },

  unmountComponent: function() {
    this.destroyEventListeners();
    this.unmountChildren();
  }
});

const ClippingRectangle = createComponent(
  'ClippingRectangle', NodeMixin, ContainerMixin, {
    mountComponent: function(
      transaction,
      nativeParent,
      nativeContainerInfo,
      context
    ) {
      this.node = Mode.ClippingRectangle();
      const props = this._currentElement.props;
      this.applyClippingProps(emptyObject, props);
      this.mountAndInjectChildren(props.children, transaction, context);

      return this.node;
    },

    receiveComponent: function(nextComponent, transaction, context) {
      const props = nextComponent.props;
      const oldProps = this._currentElement.props;
      this.applyClippingProps(oldProps, props);
      this.updateChildren(props.children, transaction, context);
      this._currentElement = nextComponent;
    },

    applyClippingProps: function(oldProps, props){
      this.node.width = props.width;
      this.node.height = props.height;
      this.node.x = props.x;
      this.node.y = props.y;
      this.applyNodeProps(oldProps, props);
    },

    unmountComponent: function() {
      this.destroyEventListeners();
      this.unmountChildren();
    }
  }
);

const RenderableMixin = assign({}, NodeMixin, {

  applyRenderableProps: function(oldProps, props) {
    if(oldProps.fill !== props.fill) {
      if(props.fill && props.fill.applyFill) {
        props.fill.applyFill(this.node);
      } else {
        this.node.fill(props.fill)
      }
    }

    if(
      oldProps.stroke !== props.stroke ||
      oldProps.strokeWidth !== props.strokeWidth ||
      oldProps.strokeCap !== props.strokeCap ||
      oldProps.strokeJoin !== props.strokeJoin ||
      oldProps.strokeDash !== props.strokeDash
    ) {
      this.node.stroke (
        props.stroke,
        props.strokeWidth,
        props.strokeCap,
        props.strokeJoin,
        props.strokeDash
      );
    }

    this.applyNodeProps(oldProps, props);
  },

  unmountComponent: function(){
    this.destroyEventListeners();
  }

})

const Shape = createComponent('Shape', RenderableMixin, {
  construct: function(element) {
    this._currentElement = element;
    this._oldDelta = null;
    this.oldPath = null;
  },

  mountComponent: function(
    transaction,
    nativeParent,
    nativeContainerInfo,
    context
  ) {
    this.node = Mode.Shape();
    const props = this._currentElement.props;
    this.applyShapeProps(emptyObject, props);
    return this.node;
  },

  receiveComponent: function(nextComponent, transaction, context) {
    const props = nextComponent.props;
    const oldProps = this._currentElement.props;
    this.applyShapeProps(oldProps, props);
    this._currentElement = nextComponent;
  },

  applyShapeProps: function(oldProps, props){
    const oldDelta = this._oldDelta;
    const oldPath = this._oldPath;
    const path = props.d || childrenAsString(props.children);

    if(path.delta !== oldDelta ||
      path !== oldPath ||
      oldProps.width !== props.width ||
      oldProps.height !== props.height) {
        this.node.draw(
          path,
          props.width,
          props.height
        );

        this._oldPath = path;
        this.oldDelta = path.delta;
      }

    this.applyRenderableProps(oldProps, props);
  }
})

const Text = createComponent('Text', RenderableMixin, {
  construct: function(element){
    this._currentElement = element;
    this._oldString = null;
  },

  mountComponent: function(
    transaction,
    nativeParent,
    nativeContainerInfo,
    context
  ) {
    const props = this._currentElement.props;
    const newString = childrenAsString(props.children);
    this.node = Mode.Text(newString, props.font, props.alignment, props.path);
    this._oldString = newString;
    this.applyRenderableProps(emptyObject, props);
    return this.node;
  },

  isSameFont: function(oldFont, newFont){
    if(oldFont === newFont){
      return true;
    }

    if(typeof newFont === 'string' || typeof oldFont === 'string'){
      return false;
    }

    return (
      newFont.fontSize === oldFont.fontSize &&
      newFont.fontStyle === oldFont.fontStyle &&
      newFont.fontVariant === oldFont.fontVariant &&
      newFont.fontWeight === oldFont.fontWeight &&
      newFont.fontFamily === oldFont.fontFamily
    );
  },

  receiveComponent: function(nextComponent, transaction, context) {
    const props = nextComponent.props;
    const oldProps = this._currentElement.props;

    const oldString = this._oldString;
    const newString = childrenAsString(props.children);

    if(oldString !== newString ||
       !this.isSameFont(oldProps.font, props.font) ||
       oldProps.alignment !== props.alignment ||
       oldProps.path !== props.path
    ) {
      this.node.draw(
        newString,
        props.font,
        props.alignment,
        props.path
      );

      this._oldString = newString;
    }

    this.applyRenderableProps(oldProps, props);
    this._currentElement = nextComponent;
  }
})

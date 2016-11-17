# reactjs 的核心内容：

  * 虚拟 dom 对象（Virtual DOM）
  * 虚拟 dom 差异化算法（diff algorithm）
  * 单向数据流渲染（Data Flow）
  * 组件声明周期
  * 事件处理

  渲染hello world：
```
  <script type="text/javascript">
    React.render('hello world', document.getElementById('container'))
  </script>

  //对应的html为：

  <div id="container"></div>

  //生成后的html：
  <div id="container">
    <span data-reactid="0">hello world</span>
  </div>
```
  假定这一行代码，就可以把 hello world 渲染到对应的 div 里面。<br>
  我们来看看我们需要为此做些什么：

```
  //component类，用来表示文本在渲染，更新，删除时应该做些什么
  function ReactDOMTextComponent(text){
    // 存在当前的字符串
    this._currentElement = '' + text;
    // 用来标识当前 component
    this._rootNodeID = null;
  }

  // component 渲染时生成 dom 结构
  ReactDOMTextComponent.prototype.mountComponent = function(rootID) {
    this._rootNodeID = rootID;
    return '<span data-reactid="' + rootID + '">' + this._currentElement + '</span>';
  }

  // component 工厂，用来返回一个 component 实例
  function instantiateReactComponent(node) {
    if( typeof node === 'string' || typeof node === 'number' ){
      return new ReactDOMTextComponent(node)
    }
  }

  React = {
    nextReactRootIndex: 0,
    render: function(element, container) {
      var componentInstance = instantiateReactComponent(element);
      var markup = componentInstance.mountComponent( React.nextReactRootIndex ++ );

      $(container).html(markup);
      // 触发完成 mount 的事件

      $(document).trigger('mountReady');
    }
  }
```
  代码分为三部分：<br>

  1. React.render 作为入口负责调用渲染
  2. 我们引入了 component 类的概念，ReactDOMTextComponent 是一个 component 类定义，定义对于这种`文本类型`的节点，在渲染、更新、删除时应该做什么操作，这边暂时只用到渲染，另外两个可以先忽略。
  3. instantiateReactComponent 用来根据 element 的类型（现在只有一种 string 类型），返回一个 component 的实例。其实就是个工厂类。

  nextReactRootIndex 作为每个 component

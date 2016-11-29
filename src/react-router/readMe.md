# 深入理解 react-router 路由系统

  在 web 应用开发中，路由系统是不可或缺的一部分。在浏览器当前的 URL 发生变化时，路由系统会做出一些响应，用来保证用户界面与 URL 的同步。随着单页应用时代的到来，为之服务的前端路由系统也相继出现了。有一些独立的第三方路由系统，比如 director，代码库也比较轻量。当然，主流的前端框架也都是有自己的路由，比如 Backbone、Ember、Angular、React 等等。那 react-router 相对于其他路由系统又针对 React 做了哪些优化呢？ 它是如何利用了 React 的UI 状态机特性呢 ？ 又是如何将 JSX 这种声明式的特性用在路由中？

## 一个简单的示例

  现在，我们通过一个简易的博客系统示例来解释刚刚遇到的疑问，它包含了查看文章归档、文章详细、登录、退出以及权限校验几个功能，此外，该示例全部基于最新的 react-router 1.0 进行编写。下面看一下 react-router 的应用实例：

    import React from 'react';
    import { render, findDOMNode } from 'react-dom';
    import { Router, Route, Link, IndexRoute, Redirect } from 'react-router';
    import { createHistory, createHashHistory, useBasename } from 'history';

    //此处用于添加跟路径
    const history = useBasename(createHashHistory)({
      queryKey: '\_key',
      basename: '/blog-app',
    })

    React.render((
      <Router history = {history}>
        <Route path = "/" component={BlogApp}>
          <IndexRoute component={SignIn}/>
          <Route path = "signIn" component={SignIn} />
          <Route path = "signOut" component={SignOut} />
          <Redirect from = '/archives' to = "/archives/posts" />
          <Route onEnter = {requireAuth} path="archives" component={Archives} >
            <Route path = "posts" components = {{
              original: Original,
              reproduce: Reproduce,
            }} />
          </Route>
          <Route path = "article/:id" component = {Article} />
          <Route path = "about" component = {About} />
        </Route>
      </Router>
    ), document.getElementById('example'));

  如果你以前并没有接触过 react-router，相反只是用过刚才提到的 Backbone 的路由或者是 director，你一定会对这种声明式的写法感到惊讶。不过细想这也是情理之中，毕竟是只服务与 React 类库，引入它的特性也是无可厚非。仔细看一下，你会发现：

  * Router 与 Route 一样都是 react 组件，它的 history 对象是整个路由系统的核心，它暴露了很多属性和方法在路由系统中使用；
  * Route 的 path 属性表示路由组件所对应的路径，可以是绝对或相对路径，相对路径可继承；
  * Redirect 是一个重定向组件，有 from 和 to 两个属性；
  * Route 的 onEnter 钩子将用于在渲染对象的组件前做拦截操作，比如验证权限；
  * 在 Route 中，可以使用 component 指定单个组件，或者通过 components 指定多个组件集合；
  * param 通过 /:param 的方式传递，这种写法与 express 以及 ruby on rails 保持一致，符合 RestFul 规范；

  下面在看一下如果使用 director 来声明这个路由系统会是怎样一番景象呢：

    import React from 'react';
    import { render } from 'react-dom';
    import { Router } from 'director';

    const App = React.createClass({
      getInitialState(){
        return {
          app: null
        }
      },

      componentDidMount(){
        const router = Router({
          '/signIn': {
            on() {
              this.setState({ app: (<BlogApp><SignIn /> </BlogApp>) })
            },
          },
          '/signOut': {
            //结构与 signIn 类似
          },
          '/archives' : {
            '/posts': {
              on() {
                this.setState({ app: (<BlogApp><Archives original={Original} reproduct={Reproduct}/></BlogApp>) })
              },
            },
          },
          '/article' : {
            '/:id': {
              on (id) {
                this.setState({ app: (<BlogApp><Article id={id}/></BlogApp>) })
              },
            },
          },
        })
      },

      render() {
        return <div> {React.cloneElement(this.state.app)} </div>;
      }
    })

    render(<App/>, document.getElementById('example'))

  从代码的优雅程度、可读性以及维护性上看绝对 react-router 在这里更胜一筹。分析上面的代码，每个路由的渲染逻辑都相对独立的，这样就需要写很多重复的代码，这里虽然可以借助React 的 setState 来统一管理路由返回的组件，将 render 方法做一定的封装，但结果却是要多维护一个 state， 在 react-router 中这一步根本不需要。此外，这种命令式的写法与 React 代码放在一起也是略显突兀。而 react-router 中的声明式写法在组件继承上确实很清晰易懂，而且更加符合 React 的风格。包括这里的默认路由、重定向等等都使用了这种声明式。<br>

  接下来，还是回到 react-router 示例中，看一下路由组件内部的代码：

    const SingIn = React.createClass({
      handleSubmit(e) {
        e.preventDefault();
        const email = findDOMNode(this.refs.name).value;
        const pass = findDOMNode(this.refs.pass).value;

        // 此处通过修改 localStorage 模拟了登录效果
        if (pass !== 'password') {
          return ;
        }

        localStorage.setItem('login', 'true');
        const location = this.props.location;
        if(location.state && location.state.nextPathname) {
          this.props.history.replaceState(null, location.state.nextPathname);
        } else {
          //这里使用 replaceState 方法做了跳转，但在浏览器历史中不会多一条记录，因为是替换了当前的记录
          this.props.history.replaceState(null, '/about')
        }
      },

      render() {
        if( hasLogin() ) {
          return <p>你已经登录系统！<Link to="/signOut">点此退出</Link></p>;
        }

        return (
          <form onSubmit={this.handleSubmit}>
            <label><input ref="name"/> </label><br/>
            <label><input ref="pass"/> </label>(password)<br/>
            <button type="submit">登录</button>
          </form>
        );
      }
    });

    const SignOut = React.createClass({
      componentDidMount() {
        localStorage.setItem('login', 'false');
      },
      render() {
        return <p>已经退出！</p>;
      }
    })

  上面的代码表示了博客系统的登录以及退出功能。登录成功，默认跳转到/about 路径下，如果在 state 对象中存储了 nextPathname, 则跳转到该路径下，在这里需要指出每一个路由（Route）中声明的组件 （比如 SignIn） 在渲染之前都会被传入一些 props，具体是在源码中的 RoutingContext.js 中完成，主要包括：

  * history 对象，它提供了很多有用的方法可以在路由系统中使用，比如刚刚用到的 history.replaceState，用于替换当前的 URL，并且会将被替换的 URL 在浏览器历史中删除。函数的第一个参数是 state 对象，第二个是路径；

  * location 对象，它可以简单的认为是 URL 的对象形式表示，这里要提的是 location.state，这里 state 的含义与 HTML5 history.pushState API 中的 state 对象一样。每个 URL 都会对应一个 state 对象，你可以在对象里存储数据，但这个数据却不会出现在 URL 中。实际上，数据被存在了 sessionStorage 中；

  事实上，刚才提到的两个对象同时存在与路由组件的 context 中，你还可以通过 React 的 context API 在组件的子级组件中获取到这两个对象。比如在 SignIn 组件的内部又包含了一个 SignInChild 组件，你就可以在组件内部通过 this.context.history 获取到 history 对象，进而调用它的 API 进行跳转等操作。 <br>

  接下来，我们一起看一下 Archives 组件内部的代码：

    const Archives = React.createClass({
      render() {
        return (
          <div>
            原创： <br/> {this.props.original}
            转载： <br/> {tihs.props.reproduce}
          </div>
        );
      }
    });

    const Original = React.createClass({
      render() {
        return (
           <div className="archives">
             <ul>
              {blogData.slice(0, 4).map((item,index) => {
                return (
                  <li key={index}>
                    <Link to={`/article/${index}`} query={{type: 'Original'}} state={{title: item.title}}>
                      {item.title}
                    </Link>
                  </li>
                )
              })}
             </ul>
           </div>  
        )
      }
    });

    const Reproduce = React.createClass({
      // 与 Original 类似
    });

  上述代码展示了文档归档以及原创和转载列表。现在回顾一下路由声明部分的代码：

    <Redirect from="/archives" to="/archives/posts" />
    <Route onEnter={requireAuth} path="archives" component={Archives}>
      <Route path="posts" components={{
        original: Original,
        reproduce: Reproduce
      }}/>
    </Route>

    function requireAuth(nextState, replaceState) {
      if(!hasLogin()){
        replaceState({nextPathname: nextState.location.pathname }, '/signIn');
      }
    }

  上述的代码中有三点值得注意：
  * 用到了一个 Redirect 组件，将 /archives 重定向到 /archives/posts 下；
  * onEnter 钩子中用于判断用户是否登录，如果未登录则使用 replaceState 方法重定向，该方法的作用与 <Redirect />组件类似，不会在浏览器中留下重定向前的历史；
  * 如果使用 components 声明路由所对应的多个组件，在组件内部可以通过 this.props.original 来获取组件；

  react-router 作为 React 路由系统的特点和优势所在：

  * 结合 JSX 采用声明式的语法，很优雅的实现了路由嵌套以及路由回调组件的声明，包括重定向组件，默认路由等，这归功与其内部的匹配算法，可以通过 URL 在组件树中准确匹配出需要渲染的组件。这一点绝对完胜 director 等路由在 React 中的表现；
  * 不需要单独维护 state 表示当前路由，这一点也是使用 director 等路由免不了要做的。
  * 除了路由组件外，还可以通过 history 对象中的 pushState 和 replaceState 方法进行路由和重定向，比如在 flux 的store 中想要跳转操作就可以通过该方法完成

    //近似于 <Link to={path} state={null} />
    history.pushState(null, path);

    //近似于 <Redirect from={currentPath} to={nextPath} />
    history.replaceState(null, nextPath);

  当然还有一些其他的特性没有在这里介绍，比如在大型应用中按需载入路由组件、服务端渲染以及整合 redux/relay 框架，这些都是用其他路由系统很难完成的。接下来的部分主要来讲解示例背后的基本原理。

## 原理分析
  在这一部分主要讲解路由的基本原理，react-router 的状态机特性，在用户点击了 Link 组件后路由系统中到底发生了哪些，前端路由如何处理浏览器的前进和后退功能。

## 路由的基本原理
  无论是传统的后端 MVC 主导的应用，还是在当下最流行的单页面应用中，路由的职责都很重要，但原理并不复杂，即保证视图和 URL 的同步，而视图可以看成是资源的一种表现。当用户在页面中进行操作时，应用会在若干个交互状态中切换，路由则可以记录下某些重要的状态，比如在一个博客系统中用户是否登录、在访问哪一篇文章、位于文章归档列表的第几页。而这些变化同样会被记录在浏览器的历史中，用户可以通过浏览器的前进、后退按钮切换状态，同样可以将 URL 分享给好友。简而言之，用户可以通过手动输入或者与页面进行交互来改变URL，然后通过同步或者异步的方式向服务端发送请求获取资源（当然，资源也可能存在于本地），成功后重新绘制UI。

## react-router 的状态机特性
  我们看到 react-router 中的很多特性都与 React 保持了一致，比如它的声明式组件、组件嵌套，当然也包括 React 的状态机特性，因为毕竟它就是基于 React 构建并且为之所用的。回想一下在 React 中，我们把组件比作是一个函数，state/props 作为函数的参数，当它们发生变化时会触发函数执行，进而帮助我们重新绘制 UI。那么在 react-router中将会是什么样子呢？在react-router 中，我们可以把 Router 组件看成是一个函数， Location 作为参数，返回的结果同样是 UI

## 点击 Link 后路由系统发生了什么

  Link组件最终会渲染为 HTML 标签 <a>，它的to、query、hash 属性会被组合在一起并渲染为 href 属性。虽然 Link 被渲染为超链接，但在内部实现上使用脚本拦截了浏览器的默认行为，然后调用了 history.pushState 方法（注意，文中出现了 history 指的是通过 history 包里面的 create*History 方法创建的对象，window.history 则指定浏览器原生的 history 对象，由于有些 API 相同，不要弄混）。history 包中底层的 pushState 方法支持传入两个参数 state 和 path，在函数体内有将这两个参数传输到createLocation 方法中，返回 location 的结构如下：

    location = {
      pathname, //当前路径，即 Link 中的 to 属性
      search, // search
      hash, // hash
      state, //state 对象
      action, // location 类型，在点击 Link 时为 PUSH ，浏览器前进后退时为 POP，调用 replaceState 方法时为 REPLACE
      key, //用于操作 sessionStorage 存取 state 对象。
    };

  系统会将上述 location 对象作为参数传入到 Transition To 方法中，然后调用 window.location.hash 或者 window.history.pushState() 修改了应用的 URL，这取决于你创建 history 对象的方式。同时会触发 history.listen 中注册的事件监听器。 <br>

  接下来请看路由系统内部是如何修改 UI 的。在得到了新的 location 对象后，系统内部的 matchRoutes 方法会匹配出 Route 组件树中与当前 location 对象匹配的一个子集，并且得到了 nextState, 具体的匹配算法不在这里讲解，state 的结构如下：

    nextState = {
      location, // 当前的 location 对象
      routes, // 与 location 对象匹配的 Route 树的子集，是一个数组
      params, // 传入的 param，即 URL 中的参数，
      components, // routes 中每个元素对应的组件，同样是数组
    };

  在 Router 组件的 componentWillMount 声明周期方法中调用了 history.listen(listener) 方法。listener 会在上述 matchRoutes 方法执行成功后执行 listener(nextState) 方法。listener 会在上述 matchRoutes 方法执行成功后执行 listener(nextState),nextState 对象每个属性的具体含义已经在上述代码中注释，接下来执行 this.setState(nextState) 就可以实现重新渲染 Router 组件。

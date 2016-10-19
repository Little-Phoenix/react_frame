# UI组件

  React-Redux 将所有组件分成两大类： UI 组件(presentational component) 和 容器组件 (container component).
  UI组件有以下几个特征。

    1. 只负责 UI 的呈现， 不带有任何业务逻辑
    2. 没有状态 （即不使用 this.state 这个变量）
    3. 所有数据都由参数(this.props) 提供
    4. 不使用任何 Redux 的 API

# 容器组件

  容器组件的特征恰恰相反。

    1. 负责管理数据和业务逻辑， 不负责 UI 的呈现
    2. 带有内部状态
    3. 使用 Redux 的 API

  总之， 只要记住一句话就可以了： UI 组件负责 UI 的呈现， 容器组件负责管理数据和逻辑。

  你可能会问， 如果一个组件既有 UI 又有业务逻辑，那怎么办？ 回答是，将它拆分成下面的结构

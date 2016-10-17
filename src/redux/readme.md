## Redux

### 设计思想
	web应用是一个状态机，视图与状态是一一对应的所有的状态，保存在一个对象里面。
	
#### Store
	Store就是保存数据的地方，可以把它看成一个容器，整个应用只能有一个Store。
	
	```
	
		import {createStore} from 'redux';
		const store = createStore(fn);
		
	```
	上面的代码中，createStore函数接受另一个函数作为参数，返回新生成的Store对象。
	
	
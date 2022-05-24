
import { isTextNode, isElementNode, isDirective, isEvent, isBind, parsePath } from "@/utils"
import Watcher from "@/observer/watcher"

// 编译器
export default class Compiler {
  constructor (vm) {
    const opts = vm.$options
    this.el = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el
    this.vm = vm
    this.createCompiler(this.el)
  }
  // 1. 模拟处理模板。真实的vue源码不是这样干的！！！
  //!! 真实情况:
  // 1.1 render-phase：渲染模块使用渲染函数根据初始化数据生成虚拟Dom
  // 1.2 是通过mount-phase执行一个_update 。然后_update接受一个_render方法（就是获取虚拟dom）参数！！！
  // 2. _update方法在里面执行一个patch方法。patch方法接受一个_render方法（就是获取虚拟dom）参数，吧虚拟的dom转为真实dom
  // 3. patch（打补丁）里面做了diff算法
  // (1) 根元素改变 – 删除当前DOM树重新建!!
  // (2) 根元素未变, 子元素/内容改变!!
  // (3) 无key – 就地更新 / 有key – 按key比较!!

  // 3.5 利用diff算法，找出不同，然后更新变化的部分重绘到页面，也叫做打补丁!!

  // 3.6 重绘和回流的概念
  // 回流(重排): 当浏览器必须重新处理和绘制部分或全部页面时，回流就会发生。
  // 重绘: 不影响布局, 只是标签页面发生变化, 重新绘制。
  // 注意: 回流(重排)必引发重绘, 重绘不一定引发回流(重排)。

  // 4. _render方法的来历呢，就是每个组件里面的options对象的render方法，它是一个渲染函数，渲染函数返回一个虚拟dom！！！

  // mount-phase ： 利用虚拟dom创建视图页面html
  // patch-phase：数据模型一旦变化渲染函数将再次被调用生成新的虚拟dom，然后做dom diff更新视图html

  //!! 编译模板，处理文本节点和元素节点！！！
  createCompiler (el) {
    let childNodes = el.childNodes
    // 遍历所有子节点
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (isTextNode(node)) {
        this.compileText(node)
      } else if (isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }
      // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.createCompiler(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(Array.from(node.attributes))
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name // 属性名
      let attrVal = attr.value // 属性值
      // 判断是否v-bind 或者 ':' 开头
      if (isBind(attrName)) {
        this.bindUpdater.call(this.vm, node, attrVal, attrName)
        // 删除节点上面的指令
        node.removeAttribute(attrName)
        // 判断是否是指令
      } else if (isDirective(attrName)) {
        // 截取属性名，把v-去掉：v-text转为text
        attrName = attrName.substr(2)
        this.update(node, attrVal, attrName)
        // 是否以@开头的事件
      } else if (isEvent(attrName)) {
        // 截取字符串的事件名，把@click去掉：@转为click
        const eventName = attrName.substr(1)
        // 是否存在 等式 如： = ， 那么就需要吧等式转换！
        if (attrVal.indexOf('=') !== -1) {
          let eventFn = new Function(`return this.${attrVal}`)
          // console.log(eventFn)
          node.addEventListener(eventName, eventFn.bind(this.vm))
        } else {
          this.onUpdater.call(this.vm, node, eventName, attrVal)
        }
        // 删除节点上面的指令
        node.removeAttribute('@' + eventName)
      }
    })
  }
  /**
     * @param {*节点dom} node
     * @param {*值} attrVal 指令值 | 变量名
     * @param {*attrName属性} 指令名
     */
  update (node, attrVal, attrName) {
    // 处理事件 startsWith查看字符串是否以xx开头
    // 判断指令是否已on开头
    if (attrName.startsWith('on')) {
      // 截取字符串的事件名
      const eventName = attrName.substr(3)
      this.onUpdater.call(this.vm, node, eventName, attrVal)
      // 删除节点上面的指令
      node.removeAttribute('v-on:' + eventName)
      return
    }
    // 找出当前属性对应的方法
    let updateFn = this[attrName + 'Updater']
    // 执行方法， this.vm[attrVal] 就是 获取值的操作
    updateFn && updateFn.call(this, node, this.vm[attrVal], attrVal)
    // 删除节点上面的指令
    node.removeAttribute('v-' + attrName)
  }
  // 处理 v-text 指令
  textUpdater (node, value, key) {
    // 初始化，把默认值给它
    node.textContent = value
    // 给当前key属性绑定监听
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // v-model  指令
  modelUpdater (node, value, key) {
    // 默认赋值
    node.value = value
    // 当数据变化，就更新节点内容
    new Watcher(this.vm, key, (newValue) => {
      // 把新的值赋值给节点
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      // 输入框变化改变数据
      this.vm[key] = node.value
    })
  }
  // 处理 v-html 指令
  htmlUpdater (node, value, key) {
    // 初始化，把默认值给它
    node.innerHTML = value
    // 给当前key属性绑定监听
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }
  // 处理 v-on 指令
  onUpdater (node, eventName, key) {
    // node节点，eventName事件名, key方法名
    // key是方法名 clickTwo，比如：<button class="btn" @click="clickTwo">add</button>
    // 必须改变this指向，不然在外面使用this的时候，this执行不对
    node.addEventListener(eventName, this[key]?.bind(this))
  }
  // 处理v-bind或者简写的 ":"
  bindUpdater (node, attrVal, attrName) {
    const key = attrName.indexOf('v-bind:') !== -1 ? attrName.replace('v-bind:', '') : attrName.replace(':', '')
    node.setAttribute(key, this[attrVal])
    // 给当前key属性绑定监听
    new Watcher(this, attrVal, (newValue) => {
      node.setAttribute(key, newValue)
    })
  }
  // 处理v-show
  showUpdater (node, value, key) {
    node.style.display= value ? 'block' : 'none'
    // 给当前key属性绑定监听
    new Watcher(this.vm, key, (newValue) => {
      node.style.display= newValue ? 'block' : 'none'
    })
  }
  // 处理变量表达式
  compileText (node) {
    let reg = /\{\{(.+?)\}\}/g
    // 文本内容！！
    let text = node.textContent
    // 当前文本是否存在 变量表达式！！！
    let variables = text?.match(reg) || []
    // console.log(variables, text)
    // 是否存在变量名，如<p>{{ abc }}</p> 是否存在{{ abc }}
    if (variables.length) {
      // 默认设置为当前文本
      let value = text
      // 因为存在一个文本绑定多个变量的情况。然后我们需要去找出所有变量。进行逐一监听！！！
      // 监听完毕了，我们还需要把文本进行变量替换！！！
      // 比如：<p>{{ a }} 哈哈哈哈  {{ b }}</p>！！！
      // 那么我需要去获取a的值，然后把p标签下面的内容 {{ a }} 替换 为 a变量的值！！！

      // 匹配花括号所有的变量：variables == ['{{ a }}', '{{ b.c }}']
      variables.forEach(bras => {
        // trim,删除字符串的头尾空白符  找出key，把括号干掉
        let key = bras.substring(2, bras.length - 2)?.trim()
        // 解析表达式
        let getter = parsePath(key)
        // 获取当前表达是的值
        value = value.replace(bras, getter.call(this.vm, this.vm))
        // 创建watcher对象，当数据改变更新视图
        new Watcher(this.vm, key, (newValue, oldValue) => {
          let watchVal = text
          // 更新完毕，再次取组成新的文本
          variables.forEach(bras => {
            // trim,删除字符串的头尾空白符  找出key，把括号干掉
            let key = bras.substring(2, bras.length - 2)?.trim()
            // 解析表达式
            let watchGetter = parsePath(key)
            // 设置当前元素的值，把变量一个一个的替换，组成新的文本
            watchVal = watchVal.replace(bras, watchGetter.call(this.vm, this.vm))
          })
          node.textContent = watchVal
        })
      })
      node.textContent = value
    }
  }
}

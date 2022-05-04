
/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 22:40:24
 * @Description: 核心
 */
import { isTextNode, isElementNode, isDirective, isEvent, isBind } from "@/utils"
import Watcher from "@/observer/watcher"

// 编译器
export default class Compiler {
    constructor(vm) {
        const opts = vm.$options
        this.el = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el
        this.vm = vm
        this.createCompiler(this.el)
    }
    // 编译模板，处理文本节点和元素节点！！！
    // 模拟处理模板。真实的vue源码不是这样干的！！！
    createCompiler(el) {
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
    compileElement(node) {
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
                this.onUpdater.call(this.vm, node, eventName, attrVal)
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
    update(node, attrVal, attrName) {
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
    textUpdater(node, value, key) {
        // 初始化，把默认值给它
        node.textContent = value
        // 给当前key属性绑定监听
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }
    // v-model  指令
    modelUpdater(node, value, key) {
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
    htmlUpdater(node, value, key) {
        // 初始化，把默认值给它
        node.innerHTML = value
        // 给当前key属性绑定监听
        new Watcher(this.vm, key, (newValue) => {
            node.innerHTML = newValue
        })
    }
    // 处理 v-on 指令
    onUpdater(node, eventName, key) {
        // node节点，eventName事件名, key方法名
        // key是方法名 clickTwo，比如：<button class="btn" @click="clickTwo">add</button>
        // 必须改变this指向，不然在外面使用this的时候，this执行不对
        node.addEventListener(eventName, this[key]?.bind(this))
    }
    // 处理v-bind或者简写的 ":"
    bindUpdater(node, attrVal, attrName) {
        const key = attrName.indexOf('v-bind:') !== -1 ? attrName.replace('v-bind:', '') : attrName.replace(':', '')
        node.setAttribute(key, this[attrVal])
        // 给当前key属性绑定监听
        new Watcher(this, attrVal, (newValue) => {
            node.setAttribute(key, newValue)
        })
    }
    // 处理变量表达式
    compileText(node) {
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

            // 匹配花括号所有的变量：variables == ['{{ a }}', '{{ b }}']
            variables.forEach(bras => {
                // trim,删除字符串的头尾空白符  找出key，把括号干掉
                let key = bras.substring(2, bras.length - 2)?.trim()
                // 设置当前元素的值，把变量一个一个的替换，组成新的文本
                value = value.replace(bras, this.vm[key])
                // 创建watcher对象，当数据改变更新视图
                new Watcher(this.vm, key, (newValue) => {
                    let watchVal = text
                    // 更新完毕，再次取组成新的文本
                    variables.forEach(bras => {
                        // 找出key，把括号干掉
                        let key = bras.substring(2, bras.length - 2)?.trim()
                        // 设置当前元素的值，把变量一个一个的替换，组成新的文本
                        watchVal = watchVal.replace(bras, this.vm[key])
                    })
                    node.textContent = watchVal
                })
            })
            node.textContent = value
        }
    }
}
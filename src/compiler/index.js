
/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 16:40:11
 * @Description: 核心
 */
import { isTextNode, isElementNode, isDirective } from "@/utils"
import Watcher from "@/observer/watcher"

// 编译器
export default class Compiler {
    constructor(vm) {
        const opts = vm.$options
        this.el = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el
        this.vm = vm
        this.compile(this.el)
    }
    // 编译模板，处理文本节点和元素节点
    compile(el) {
        let childNodes = el.childNodes
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
                this.compile(node)
            }
        })
    }
    // 编译元素节点，处理指令
    compileElement(node) {
        // 遍历所有的属性节点
        Array.from(node.attributes).forEach(attr => {
            // 判断是否是指令
            let attrName = attr.name
            if (isDirective(attrName)) {
                // v-text --> text
                attrName = attrName.substr(2)
                let key = attr.value
                this.update(node, key, attrName)
            }
        })
    }
    /**
     * 
     * @param {*节点dom} node 
     * @param {*值} key 
     * @param {*attrName属性} attrName 
     * @returns 
     */
    update(node, key, attrName) {
        // 处理事件 startsWith查看字符串是否以xx开头
        if (attrName.startsWith('on')) {
            // 截取字符串的事件名
            const eventName = attrName.substr(3)
            this.onUpdater.call(this.vm, node, eventName, key)
            return
        }
        let updateFn = this[attrName + 'Updater']
        updateFn && updateFn.call(this, node, this.vm[key], key)
    }

    // 处理 v-text 指令
    textUpdater(node, value, key) {
        node.textContent = value
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }
    // v-model
    modelUpdater(node, value, key) {
        // 默认赋值
        node.value = value
        // 当数据变化，就更新节点内容
        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })
        // 双向绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }
    // 处理 v-html 指令
    htmlUpdater(node, value, key) {
        node.innerHTML = value
        new Watcher(this.vm, key, (newValue) => {
            node.innerHTML = newValue
        })
    }
    // 处理 v-on 指令
    onUpdater(node, eventName, key) {
        // node节点，eventName事件名, key方法名
        node.addEventListener(eventName, this[key].bind(this))
    }
    // 编译文本节点，处理差值表达式
    compileText(node) {
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        console.log(value)
        if (reg.test(value)) {
            // trim,删除字符串的头尾空白符
            // RegExp.$1 指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
            let key = RegExp.$1.trim()
            // 设置当前元素的值
            node.textContent = this.vm[key]
            // 创建watcher对象，当数据改变更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }
}
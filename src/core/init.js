/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-17 17:46:25
 * @Description: 核心
 */

import Watcher from "@/observer/watcher"
import { observe } from "@/observer"
import { isPlainObject, hasOwn } from "@/utils"

// Object.defineProperty属性
const sharedPropertyDefinition = {
    enumerable: true, // 该属性是否可枚举
    configurable: true // 是否可以删除该属性或者修改该属性的定义描述对象
    // value: 设置属性的值
    // writable: 值是否可以重写。true | false
    // set: 目标属性设置值的方法
    // get：目标属性获取值的方法 
}

function initState(vm) {
    const opts = vm.$options
    // 处理事件
    if (opts.methods) initMethods(vm, opts.methods)
    // data存在
    if (opts.data) {
        let data = opts.data
        // 如果我传递进来的data是个函数，那么就需要执行它，且改变this
        data = vm._data = typeof opts.data === 'function' ? opts.data.call(vm, vm) : opts.data || {}
        if (!isPlainObject(data)) {
            data = {}
            console.error('data functions should return an object')
        }
        // 获取data数据的key集合
        const keys = Object.keys(data)
        let i = keys.length
        while (i--) {
            if (keys[i]) {
                // 通过数据代理实现 主要给methods里的方法this直接访问data
                proxy(vm, `_data`, keys[i])
            }
        }
        observe(data)
    } else {
        // data不存在，创建一个观察者    
        observe(vm._data = {})
    }
    // 处理watch
    if (opts.watch) initWatch(vm, opts.watch)
}

/** 处理Methods方法 */
function initMethods(vm, methods) {
    const data = vm.$options.data
    for (const key in methods) {
        // 方法是否为一个函数
        if (typeof methods[key] !== 'function') {
            console.error(
                ` "${typeof methods[key]}" 不是一个函数 ` + `你正确引用函数了吗?`
            )
        }
        // 定义的方法名是否和data数据冲突
        if (data && hasOwn(data, key)) {
            console.error(`方法 "${key}"已被定义为一个属性`)
        }
        if (typeof methods[key] == 'function') {
            vm[key] = methods[key]
        }
    }
}

/** 处理Watch方法 */
function initWatch (vm, watch) {
    for (const key in watch) {
      const handler = watch[key]
      if (typeof handler === 'string') {
        handler = vm[handler]
      }
      new Watcher(vm, key, handler)
    }
}

// 代理数据
function proxy(target, sourceKey, key) {
    // 绑定get方法
    sharedPropertyDefinition.get = function proxyGetter() {
        // 调用这个将触发defineReactive方法里面的_data劫持
        return this[sourceKey][key]
    }
    // 绑定set方法
    sharedPropertyDefinition.set = function proxySetter(val) {
        // 调用这个将触发defineReactive方法里面的_data劫持
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 初始化属性
export function initMixin(Quick) {
    Quick.prototype._init = function (options) {
        this.$options = options
        const vm = this
        // 初始化状态
        initState(vm)
        // 执行created
        options?.created.call(vm)
        // 挂载节点
        this._render.call(vm, vm)
        // 执行mounted
        options?.mounted.call(vm)
    }
}

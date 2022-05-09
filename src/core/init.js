/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-09 10:18:05
 * @Description: 核心
 */
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
}

/** 处理方法 */
function initMethods(vm, methods) {
    const data = vm.$options.data
    for (const key in methods) {
        // 方法是否为一个函数
        if (typeof methods[key] !== 'function') {
            console.error(
                `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
                `Did you reference the function correctly?`
            )
        }
        // 定义的方法名是否和data数据冲突
        if (data && hasOwn(data, key)) {
            console.error(`Method "${key}" has already been defined as a prop`)
        }
        if (typeof methods[key] == 'function') {
            vm[key] = methods[key]
        }
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
        initState(vm)
        this._render.call(vm, vm)
        options?.created.call(vm)
    }
}

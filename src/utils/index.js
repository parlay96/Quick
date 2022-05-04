/*
 * @Author: penglei
 * @Date: 2022-05-03 16:26:56
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 22:22:07
 * @Description: 工具
 */

const _toString = Object.prototype.toString

/** 是否是对象 */
export const isPlainObject = (obj) => {
    return _toString.call(obj) === '[object Object]'
}

/** 检查对象是否有某个属性 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (obj, key) => {
    return hasOwnProperty.call(obj, key)
}

/** 删除数组元素 */
export const remove = (arr, item) => {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

/** 是否为NaN */
export const _isNaN = (a, b) => {
    return Number.isNaN(a) && Number.isNaN(b)
}

// 判断元素属性是否是指令
export const isDirective = (attrName) => {
    return attrName.startsWith('v-')
}
// 是否以@开头的事件
export const isEvent = (attrName) => {
    return attrName.startsWith('@')
}

// 是否以v-bind开头？或者 ：开头
export const isBind = (attrName) => {
    return attrName.startsWith('v-bind') || attrName.startsWith(':')
}

// 判断节点是否是文本节点
export const isTextNode = (node) => {
    return node.nodeType === 3
}
// 判断节点是否是元素节点
export const isElementNode = (node) => {
    return node.nodeType === 1
}

export * from "./lang"
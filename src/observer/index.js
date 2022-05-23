/*
 * @Author: penglei
 * @Date: 2022-05-04 08:27:23
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-23 11:41:22
 * @Description: 
 */
import Dep from "./dep"
import { hasOwn, def, isPlainObject } from "@/utils"

/**
 * 数据劫持，实现响应式，通过Object.defineProperty劫持Vue中data的数据，
 * 在get中通过判断是不是模版里的数据决定要不要注入到dep中，在set中触发dep.notify
 * 当data中的数据发生变化是就会通过observer的set函数通知dep数组，dep数组开始循环他里边的watcher调用watcher的update方法
 */
export class Observer {
    value;
    dep;
    constructor (value) {
      this.value = value
      // 给当前对象创建一个属性，并把它的值赋值为当前this
      def(value, '__ob__', this)
      if (Array.isArray(value)) {
        console.error('不可以是数组')
      } else {
        this.walk(value)
      }
    }

    /**
     * 浏览所有属性并将其转换为 getter/setters!!!
     */
    walk (obj) {
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i], obj[keys[i]])
      }
    }
}

/**
 * 每一个数据都添加响应式对象， 浏览所有属性并将其转换为 getter/setters!!!
 */
export function defineReactive (obj, key, val) {
  // 每个响应式属性都有dep，
  // dep存放了依赖这个属性的watcher，watcher是观测数据变化的函数，如果数据发生变化，dep就会通知所有的观察者watcher去调用更新方法!!!
  // 因此观察者需要被目标对象收集，目的是通知依赖它的所有观察者。
  // 那为什么watcher也要存放dep呢？是因为当前正在执行的watcher需要知道此时是哪个dep通知了自己

  const dep = new Dep()
  // 指定对象的自身属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 是否可以删除该属性或者修改该属性的定义描述对象
  if (property && property.configurable === false) {
    return
  }
  // 继续检测，如果val存在obj
  observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // 收集依赖
      Dep.target && dep.depend()
      return val
    },
    // 在设置数据时
    set: function reactiveSetter (newVal) {
      // 如何新的值和就的值一样，直接返回
      if (newVal === val || newVal !== newVal && val !== val) return
      val = newVal // 设置新值
      // newValue也有可能是对象，所以递归
      observe(newVal)
      // 通知Dep类
      dep.notify()
    }
  })
}

/**
 * 创建观察者实例
 */
export function observe (value) {
  if (!isPlainObject(value)) {
    return
  }
  let ob
  // 如果存在，就不再new, 且对象 属于 ob实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
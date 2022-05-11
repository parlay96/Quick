/*
 * @Author: penglei
 * @Date: 2022-05-04 09:59:39
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-11 13:27:48
 * @Description: dep是订阅器|收集者 负责存放watcher
 */
import { remove } from '@/utils'

let uid = 0

export default class Dep {
    static target;
    constructor() {
        this.id = uid++
        /** 消息事件订阅者集合对象 */
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    // 删除订阅
    removeSub(sub) {
        remove(this.subs, sub)
    }
    // 添加订阅者
    depend() {
        Dep.target && this.addSub(Dep.target)
    }
    // 通知
    notify() {
        for (let i = 0, l = this.subs.length; i < l; i++) {
            this.subs[i].run()
        }
    }
}

/**
 *  target === watcher 
 *  把当前的target这是为观察者
*/
export function pushTarget(target) {
    Dep.target = target
}

export function popTarget() {
    Dep.target = null
}
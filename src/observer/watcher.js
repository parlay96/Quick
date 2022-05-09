/*
 * @Author: penglei
 * @Date: 2022-05-04 12:09:35
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-09 10:14:58
 * @Description: 
 */
import { pushTarget, popTarget } from './dep'
import { _isNaN } from "@/utils"

// 观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法
export default class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        // data中的属性名称
        this.key = key
        // cb回调，更新页面
        this.cb = cb
        // 先获取一下老的值
        this.oldVal = this.get()
    }
    // 获取实例上对应的老值
    get() {
        // 顺序不能乱！！！
        // 在利用get获取数据时调用pushTarget()方法，先把当前观察者挂载
        pushTarget(this)
        let value = this.vm[this.key]
        // 挂载完毕需要注销，防止重复挂载 (数据一更新就会挂载)
        popTarget()
        // 返回值
        return value
    }
    // 调度程序作业界面
    run() {
        // 获取新的值
        let newValue = this.vm[this.key]
        // 与旧值做比较，如果没有改变就无需执行下一步
        if (newValue === this.oldVal || _isNaN(newValue, this.oldVal)) return
        // 把新的值回调出去
        this.cb(newValue)
        //执行完之后，需要更新一下旧值的存储
        this.oldVal = newValue
    }
}
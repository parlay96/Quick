
/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-11 15:42:40
 * @Description: 核心
 */

import { initMixin } from './init'
import { renderMixin } from './render'

function Quick(options) {
    if (!(this instanceof Quick)
    ) {
        console.error('Quick是一个构造函数，应该用 `new`关键字调用')
    }
    this._init(options)
}

initMixin(Quick)
renderMixin(Quick)

export default Quick

/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 15:06:43
 * @Description: 核心
 */

import { initMixin } from './init'
import { renderMixin } from './render'

function Quick(options) {
    if (process.env.NODE_ENV !== 'production' &&
        !(this instanceof Quick)
    ) {
        warn('Quick is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
}

initMixin(Quick)
renderMixin(Quick)

export default Quick
/*
 * @Author: penglei
 * @Date: 2022-05-22 09:00:12
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-23 13:56:53
 * @Description:
 */
/** 为对象添加某个属性 */
export const def = (obj, key, val, enumerable) => {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * @name 解析字符串
 *
 * 如果key是一个字符串，或者表达字符：a.b.c
 * 那么就需要去解析它
 */

export const parsePath = (path) => {
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}

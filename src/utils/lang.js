/*
 * @Author: penglei
 * @Date: 2022-05-04 09:00:12
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 21:20:47
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
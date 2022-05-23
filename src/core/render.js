/*
 * @Author: penglei
 * @Date: 2022-05-22 14:52:08
 * @LastEditors: pengLei
 * @LastEditTime: 2022-05-23 13:56:12
 * @Description:
 */
import Compiler from "@/compiler"

// 渲染模板
export function renderMixin (Quick) {
  Quick.prototype._render = function (vm) {
    new Compiler(vm)
  }
}

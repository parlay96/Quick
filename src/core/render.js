
import Compiler from "@/compiler"

// 渲染模板
export function renderMixin (Quick) {
  Quick.prototype._render = function (vm) {
    new Compiler(vm)
  }
}

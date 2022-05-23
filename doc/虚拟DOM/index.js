
var virtualNode = {
  tag: 'div',
  props: {
    onClick: () => console.log('点我, 干嘛！！！')
  },
  children: '你好呀，鱼泡'
}

var virtualNode2 = {
  tag: 'div',
  props: {
    onClick: () => console.log('点我, 干嘛！！！')
  },
  children: [
    {
      tag: 'h1', 
      children: '我是h1标签哦！！！'
    },
    {
      tag: 'a', 
      children: '我是a标签哦！！！'
    },
  ]
}

function renderer (vnode, container) {
  // 使用 tag作为标签名创建一个dom元素
  const el = document.createElement(vnode.tag)
  // 遍历props，将事件添加到DOM元素上
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 如果key是on开头，说明它是个事件
      el.addEventListener(
        // 截取字符，吧on去掉！然后转为小写！！！
        key.substr(2).toLowerCase(), // 事件名称 onClick 转为 click
        vnode.props[key]
      )
    }
  }
  // 正常来说，这里还有很多逻辑，有patch方法，里面有大量的diff算法。新旧节点比较！！！ 
  // patch是渲染器的核心
  
  // 处理children
  if (typeof vnode.children === 'string') {
    // 说明他是文本的子节点！！！
    const textnode = document.createTextNode(vnode.children)
    el.appendChild(textnode)
  } else if (Array.isArray(vnode.children)) {
    // 代表有子节点，递归调用渲染函数
    vnode.children.forEach(child => renderer(child, el))
  }
  // 将元素挂在到容器下
  container.appendChild(el)
}

// 调用一下渲染器
renderer(virtualNode2, document.body)
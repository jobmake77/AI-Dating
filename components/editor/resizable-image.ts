import Image from '@tiptap/extension-image'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div')
      container.className = 'image-resizer-container'

      const img = document.createElement('img')
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ''
      img.className = 'rounded-lg'

      if (node.attrs.width) {
        img.style.width = node.attrs.width + 'px'
      }

      // Resize handle
      const resizeHandle = document.createElement('div')
      resizeHandle.className = 'image-resize-handle'

      let isResizing = false
      let startX = 0
      let startWidth = 0

      resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        isResizing = true
        startX = e.clientX
        startWidth = img.offsetWidth

        const onMouseMove = (e: MouseEvent) => {
          if (!isResizing) return

          const diff = e.clientX - startX
          const newWidth = Math.max(100, Math.min(startWidth + diff, 800))
          img.style.width = newWidth + 'px'
        }

        const onMouseUp = () => {
          if (!isResizing) return
          isResizing = false

          // Update node attributes
          const pos = getPos()
          if (typeof pos === 'number') {
            editor.commands.updateAttributes('image', {
              width: img.offsetWidth,
            })
          }

          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })

      container.appendChild(img)
      container.appendChild(resizeHandle)

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false
          img.src = updatedNode.attrs.src
          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width + 'px'
          }
          return true
        },
      }
    }
  },
})

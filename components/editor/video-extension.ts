import { Node, mergeAttributes } from '@tiptap/core'

export const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        controls: true,
        class: 'w-full rounded-lg my-2',
      }),
    ]
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    } as any
  },
})

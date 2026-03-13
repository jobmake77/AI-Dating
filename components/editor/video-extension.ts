import { Node, mergeAttributes, type CommandProps, type RawCommands } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

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
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    } satisfies Partial<RawCommands>
  },
})

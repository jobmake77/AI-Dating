import { Node, mergeAttributes } from '@tiptap/core'

export interface EmbedOptions {
  HTMLAttributes: Record<string, string | number | boolean | null | undefined>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setYouTubeEmbed: (options: { src: string }) => ReturnType
      setBilibiliEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export const EmbedExtension = Node.create<EmbedOptions>({
  name: 'embed',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: 'youtube',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'embed-container my-4' },
      [
        'iframe',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-embed': '',
          class: 'w-full aspect-video rounded-lg',
          frameborder: '0',
          allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        }),
      ],
    ]
  },

  addCommands() {
    return {
      setYouTubeEmbed:
        (options) =>
        ({ commands }) => {
          // Extract video ID from various YouTube URL formats
          let videoId = ''
          try {
            const url = new URL(options.src)
            if (url.hostname.includes('youtube.com')) {
              videoId = url.searchParams.get('v') || ''
            } else if (url.hostname.includes('youtu.be')) {
              videoId = url.pathname.slice(1)
            }
          } catch {
            // If not a valid URL, assume it's already a video ID
            videoId = options.src
          }

          if (!videoId) return false

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: `https://www.youtube.com/embed/${videoId}`,
              type: 'youtube',
            },
          })
        },
      setBilibiliEmbed:
        (options) =>
        ({ commands }) => {
          // Extract BV ID from Bilibili URL
          let bvid = ''
          try {
            const url = new URL(options.src)
            const match = url.pathname.match(/\/video\/(BV[\w]+)/)
            if (match) {
              bvid = match[1]
            }
          } catch {
            // If not a valid URL, assume it's already a BV ID
            bvid = options.src
          }

          if (!bvid) return false

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`,
              type: 'bilibili',
            },
          })
        },
    }
  },
})

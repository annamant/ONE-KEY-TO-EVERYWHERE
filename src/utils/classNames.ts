import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Custom font sizes use the `text-*` prefix — teach tailwind-merge they are
// font-size utilities, not text-color, so they don't strip `text-white` etc.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'heading-xl',
            'heading-lg',
            'heading-md',
            'body-lg',
            'body-md',
            'body-sm',
            'caption',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

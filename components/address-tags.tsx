import { Link2, Users, Tag as TagIcon } from 'lucide-react'

interface AddressTagsProps {
  tags: AddressTagType[]
}

export function AddressTags({ tags }: AddressTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => {
          const type = (tag.type || '').toLowerCase()
          const isWebsite = type === 'website'
          const isGroup = type === 'group_chat'
          
          const hrefCandidate = (tag.description || '').trim() || (tag.name || '').trim()
          const href = /^https?:\/\//i.test(hrefCandidate) ? hrefCandidate : undefined

          const commonClasses = 'border px-2 py-0.5 text-xs rounded-md inline-flex items-center gap-1'
          const textClasses = 'bg-muted/30 text-muted-foreground border-muted'
          const websiteClasses =
            'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          const groupClasses =
            'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'

          const classes = `${commonClasses} ${isWebsite ? websiteClasses : isGroup ? groupClasses : textClasses}`

          const Icon = isWebsite ? Link2 : isGroup ? Users : TagIcon

          return href && (isWebsite || isGroup) ? (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
              title={tag.description || tag.name}
            >
              <Icon className="size-3" />
              <span className="truncate max-w-[200px]" title={tag.name}>
                {tag.name}
              </span>
            </a>
          ) : (
            <span key={idx} className={classes} title={tag.description || tag.name}>
              <Icon className="size-3" />
              <span className="truncate max-w-[200px]" title={tag.name}>
                {tag.name}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

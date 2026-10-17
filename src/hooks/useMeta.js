import { useEffect } from 'react'

// Sets the document title and description per page (single page app, so we do it by hand).
export function useMeta(title, description) {
  useEffect(() => {
    document.title = title
    const tag = document.querySelector('meta[name="description"]')
    if (tag && description) tag.setAttribute('content', description)
  }, [title, description])
}

import { useEffect } from 'react'
import { applyPageSeo } from '../lib/seo'

export function Seo(props) {
  useEffect(() => {
    applyPageSeo(props)
  }, [
    props.title,
    props.description,
    props.path,
    props.image,
    props.type,
    JSON.stringify(props.jsonLd ?? null),
  ])

  return null
}

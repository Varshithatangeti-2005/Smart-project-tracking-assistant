import { useEffect } from 'react'

interface MetadataProps {
  title: string
  description?: string
}

export default function useDocumentMetadata({ title, description }: MetadataProps) {
  useEffect(() => {
    // Update Document Title
    document.title = `${title} | Smart Project Tracking Assistant`

    // Update or Insert Meta Description Tag
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }
  }, [title, description])
}

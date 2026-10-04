import { useState } from 'react'
import styles from './CodeBlock.module.css'
import type { CodeBlockProps } from './CodeBlock.types'

export function CodeBlock({ code, language = 'sql', title, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className={styles.block}>
      <figcaption className={styles.header}>
        <span>{title ?? language.toUpperCase()}</span>
        {copyable && (
          <button type="button" className={styles.copy} onClick={copy}>
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        )}
      </figcaption>
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </figure>
  )
}

export interface CodeBlockProps {
  code: string
  language?: 'sql' | 'ts' | 'text'
  title?: string
  copyable?: boolean
}

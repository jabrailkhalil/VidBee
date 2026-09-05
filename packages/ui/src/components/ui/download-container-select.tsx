import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

interface DownloadContainerSelectProps<T extends string> {
  value: T
  options: readonly T[]
  onValueChange: (value: T) => void
  disabled?: boolean
}

export function DownloadContainerSelect<T extends string>({
  value,
  options,
  onValueChange,
  disabled
}: DownloadContainerSelectProps<T>) {
  const { t } = useTranslation()

  return (
    <Select
      disabled={disabled}
      onValueChange={(nextValue) => {
        const option = options.find((candidate) => candidate === nextValue)
        if (option !== undefined) {
          onValueChange(option)
        }
      }}
      value={value}
    >
      <SelectTrigger
        aria-label={t('settings.oneClickContainer')}
        className="h-7 w-40 rounded-md text-xs"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {t(`settings.oneClickContainerOptions.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { TabItem, Tabs, TabsList } from '@renderer/components/ui/tabs'
import { cn } from '@renderer/lib/utils'
import type { PlaylistInfo } from '@shared/types'
import { Loader2, Settings2 } from 'lucide-react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { DownloadParseErrorBanner } from './DownloadParseErrorBanner'

interface PlaylistDownloadProps {
  playlistPreviewLoading: boolean
  playlistPreviewError: string | null
  playlistInfo: PlaylistInfo | null
  playlistBusy: boolean
  selectedPlaylistEntries: PlaylistInfo['entries']
  selectedEntryIds: Set<string>
  downloadType: 'video' | 'audio'
  downloadTypeId: string
  containerSelect: ReactNode
  startIndex: string
  endIndex: string
  advancedOptionsOpen: boolean
  setSelectedEntryIds: Dispatch<SetStateAction<Set<string>>>
  setStartIndex: Dispatch<SetStateAction<string>>
  setEndIndex: Dispatch<SetStateAction<string>>
  setDownloadType: Dispatch<SetStateAction<'video' | 'audio'>>
  onAdvancedOpenChange: (open: boolean) => void
}

/**
 * Expand range-only selection into explicit entry ids so one checkbox change
 * can uncheck a single video instead of leaving the list stuck on "all".
 */
const materializeSelection = (
  previous: Set<string>,
  playlistInfo: PlaylistInfo | null
): Set<string> => {
  if (previous.size > 0 || !playlistInfo) {
    return new Set(previous)
  }
  return new Set(playlistInfo.entries.map((entry) => entry.id))
}

export function PlaylistDownload({
  playlistPreviewLoading,
  playlistPreviewError,
  playlistInfo,
  playlistBusy,
  selectedPlaylistEntries,
  selectedEntryIds,
  downloadType,
  downloadTypeId,
  containerSelect,
  startIndex,
  endIndex,
  advancedOptionsOpen,
  setSelectedEntryIds,
  setStartIndex,
  setEndIndex,
  setDownloadType,
  onAdvancedOpenChange
}: PlaylistDownloadProps) {
  const { t } = useTranslation()

  /**
   * Record an explicit checked state for one playlist entry.
   */
  const setEntryChecked = (entryId: string, checked: boolean) => {
    setSelectedEntryIds((previous) => {
      const next = materializeSelection(previous, playlistInfo)
      if (checked) {
        next.add(entryId)
      } else {
        next.delete(entryId)
      }
      return next
    })
    setStartIndex('1')
    setEndIndex('')
  }

  /**
   * Switch from explicit picks back to a numeric start/end range.
   */
  const handleRangeChange = (kind: 'start' | 'end', value: string) => {
    if (kind === 'start') {
      setStartIndex(value)
    } else {
      setEndIndex(value)
    }
    if (selectedEntryIds.size > 0) {
      setSelectedEntryIds(new Set())
    }
  }

  return (
    <>
      {playlistPreviewLoading && !playlistPreviewError && (
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-md border border-border/70 border-dashed bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">{t('playlist.fetchingInfo')}</p>
        </div>
      )}

      {playlistPreviewError && (
        <DownloadParseErrorBanner
          error={playlistPreviewError}
          title={t('playlist.previewFailed')}
        />
      )}

      {playlistInfo && !playlistPreviewLoading && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border/70 border-dashed bg-muted/20 p-2">
            <h2 className="line-clamp-2 font-medium text-sm leading-snug">{playlistInfo.title}</h2>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {t('playlist.foundVideos', { count: playlistInfo.entryCount })}
              {selectedPlaylistEntries.length === playlistInfo.entryCount ? null : (
                <> · {t('playlist.selectedVideos', { count: selectedPlaylistEntries.length })}</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Tabs
              onValueChange={(value) => setDownloadType(value as 'video' | 'audio')}
              size="compact"
              value={downloadType}
            >
              <TabsList className="rounded-md [&>div]:rounded-md" id={downloadTypeId}>
                <TabItem label={t('download.video')} value="video" />
                <TabItem label={t('download.audio')} value="audio" />
              </TabsList>
            </Tabs>

            {containerSelect}

            <Button
              aria-label={t('advancedOptions.title')}
              aria-pressed={advancedOptionsOpen}
              className={cn(
                'h-7 w-7 shrink-0 rounded-md bg-muted p-0 text-muted-foreground transition-colors duration-150',
                advancedOptionsOpen && 'text-foreground'
              )}
              onClick={() => onAdvancedOpenChange(!advancedOptionsOpen)}
              size="sm"
              title={t('advancedOptions.title')}
              variant="ghost"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {advancedOptionsOpen && (
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-3">
              <div className="min-w-0 space-y-1">
                <Label
                  className="font-medium text-muted-foreground text-xs"
                  htmlFor={`${downloadTypeId}-start`}
                >
                  {t('playlist.startIndex')}
                </Label>
                <Input
                  aria-label={t('playlist.startIndex')}
                  className="h-7 text-xs tabular-nums"
                  disabled={playlistBusy}
                  id={`${downloadTypeId}-start`}
                  onChange={(event) => handleRangeChange('start', event.target.value)}
                  placeholder="1"
                  value={startIndex}
                />
              </div>
              <div className="min-w-0 space-y-1">
                <Label
                  className="font-medium text-muted-foreground text-xs"
                  htmlFor={`${downloadTypeId}-end`}
                >
                  {t('playlist.endIndex')}
                </Label>
                <Input
                  aria-label={t('playlist.endIndex')}
                  className="h-7 text-xs tabular-nums"
                  disabled={playlistBusy}
                  id={`${downloadTypeId}-end`}
                  onChange={(event) => handleRangeChange('end', event.target.value)}
                  placeholder={playlistInfo.entryCount.toString()}
                  value={endIndex}
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            <div className="flex flex-col gap-0.5">
              {playlistInfo.entries.map((entry) => {
                const isSelected = selectedEntryIds.has(entry.id)
                const isInRange =
                  selectedEntryIds.size === 0 &&
                  selectedPlaylistEntries.some((playlistEntry) => playlistEntry.id === entry.id)
                const checked = isSelected || isInRange
                const checkboxId = `playlist-entry-${entry.id}`

                return (
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 transition-colors duration-150',
                      checked ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                    htmlFor={checkboxId}
                    key={entry.id}
                  >
                    <Checkbox
                      aria-label={t('playlist.selectEntry', { index: entry.index })}
                      checked={checked}
                      className="shrink-0"
                      disabled={playlistBusy}
                      id={checkboxId}
                      onCheckedChange={(value) => setEntryChecked(entry.id, value === true)}
                    />
                    <span className="w-8 shrink-0 text-muted-foreground text-xs tabular-nums">
                      #{entry.index}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {entry.title || t('download.fetchingVideoInfo')}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

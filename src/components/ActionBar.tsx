import { Dispatch, SetStateAction, useRef } from 'react'
import { viewMode } from 'frappe-gantt'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { ITask } from '@/App'
import { Button } from './ui/button'
import { saveAs } from 'file-saver'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { FileJson, ImageDownIcon, SaveIcon } from 'lucide-react'
export default function ActionBar({
  changeViewMode,
  tasks,
  getViewSvg,
  setTasks
}: {
  tasks: ITask[]
  setTasks: Dispatch<SetStateAction<ITask[]>>
  changeViewMode: (viewMode: viewMode) => void
  getViewSvg: () => SVGSVGElement | undefined
}) {
  const saveTasks = () => {
    const json = JSON.parse(JSON.stringify(tasks))
    for (const task of json) {
      delete task._start
      delete task._end
      delete task._index
    }
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json'
    })
    saveAs(blob, 'gantt-chart.json')
  }
  const saveSvg = () => {
    const svg = getViewSvg()
    if (!svg) return
  }

  const uploadRef = useRef<HTMLInputElement>(null)
  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const json = e.target?.result as string
      if (!json) return
      setTasks(JSON.parse(json))
    }
    reader.readAsText(file)
  }
  return (
    <>
      <div className="fixed top-0 z-30 left-0 right-0 h-12 flex items-center gap-3 px-3 bg-background shadow">
        <h1 className="text-muted-foreground font-bold text-3xl">Gantt</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <span className="mx-1">File</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={saveTasks}>
              <SaveIcon size="16" className="mr-2" />
              Save data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={saveSvg}>
              <ImageDownIcon size="16" className="mr-2" />
              Save SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => uploadRef.current?.click()}>
              <FileJson size="16" className="mr-2" />
              Import JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToggleGroup
          type="single"
          size="sm"
          className="ml-auto"
          defaultValue="Day"
          onValueChange={changeViewMode}
        >
          <ToggleGroupItem value="Quarter Day">Quarter Day</ToggleGroupItem>
          <ToggleGroupItem value="Half Day">Half Day</ToggleGroupItem>
          <ToggleGroupItem value="Day">Day</ToggleGroupItem>
          <ToggleGroupItem value="Week">Week</ToggleGroupItem>
          <ToggleGroupItem value="Month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <input
        className="hidden"
        accept="json"
        ref={uploadRef}
        type="file"
        onChange={e => {
          const target = e.target
          if (!target.files) return
          const file = target.files[0]
          importJson(file)
        }}
      />
    </>
  )
}

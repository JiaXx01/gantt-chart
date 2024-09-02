import { Dispatch, SetStateAction } from 'react'
import { viewMode } from 'frappe-gantt'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { ITask } from '@/App'
import { Button } from './ui/button'
import { SaveIcon } from 'lucide-react'

import { saveAs } from 'file-saver'
export default function ActionBar({
  changeViewMode,
  tasks
}: {
  tasks: ITask[]
  setTasks: Dispatch<SetStateAction<ITask[]>>
  changeViewMode: (viewMode: viewMode) => void
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

  return (
    <div className="fixed top-0 z-30 left-0 right-0 h-12 flex items-center gap-3 px-3 bg-background shadow">
      <h1 className="text-muted-foreground font-bold text-3xl">Gantt</h1>
      <Button size="sm" onClick={saveTasks}>
        <SaveIcon />
        Save
      </Button>
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
  )
}

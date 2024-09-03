import { useEffect, useRef, useState } from 'react'
import ActionBar from './components/ActionBar'
import GanttChart from './components/GanttChart'
import TaskEditor from './components/TaskEditor'

import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import Gantt, { Task, viewMode } from 'frappe-gantt'
import dayjs from 'dayjs'
import { TooltipProvider } from './components/ui/tooltip'
import { nanoid } from 'nanoid'

export interface ITask extends Task {
  remark?: string
}

export default function App() {
  const [tasks, setTasks] = useState<ITask[]>([
    {
      id: nanoid(),
      name: 'Unnamed',
      start: dayjs().format('YYYY-MM-DD'),
      end: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      progress: 0,
      dependencies: []
    }
  ])

  const gantt = useRef<{ gantt: Gantt; getSvg: () => string | undefined }>(null)
  useEffect(() => {
    gantt.current?.gantt?.refresh(tasks)
  }, [tasks])

  const changeViewMode = (viewMode: viewMode) => {
    gantt.current?.gantt?.change_view_mode(viewMode)
  }
  const getSvg = gantt.current?.getSvg
  return (
    <TooltipProvider>
      <ActionBar
        changeViewMode={changeViewMode}
        tasks={tasks}
        setTasks={setTasks}
        getSvg={getSvg}
      />

      <PanelGroup
        direction="horizontal"
        className="mt-12 min-h-[calc(100vh-48px)]"
      >
        <Panel defaultSize={50} className="relative">
          <TaskEditor tasks={tasks} setTasks={setTasks} />
        </Panel>
        <PanelResizeHandle className="w-1 bg-primary/10 hover:bg-primary/30 z-20" />
        <Panel defaultSize={50} className="z-20">
          {tasks.length > 0 && (
            <GanttChart ref={gantt} tasks={tasks} setTasks={setTasks} />
          )}
        </Panel>
      </PanelGroup>
    </TooltipProvider>
  )
}

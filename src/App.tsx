import { useEffect, useRef, useState } from 'react'
import ActionBar from './components/ActionBar'
import GanttChart from './components/GanttChart'
import TaskEditor from './components/TaskEditor'

import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import Gantt, { Task, viewMode } from 'frappe-gantt'
import dayjs from 'dayjs'
import { TooltipProvider } from './components/ui/tooltip'

export interface ITask extends Task {
  remark?: string
}

export default function App() {
  const [tasks, setTasks] = useState<ITask[]>([
    {
      id: '1',
      name: '',
      start: dayjs().format('YYYY-MM-DD'),
      end: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      progress: 10,
      dependencies: []
    },
    {
      id: '3',
      name: '',
      start: dayjs().format('YYYY-MM-DD'),
      end: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      progress: 10,
      dependencies: ['1']
    },
    {
      id: '2',
      name: '',
      start: dayjs().format('YYYY-MM-DD'),
      end: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      progress: 10,
      dependencies: ['1', '3']
    }
  ])

  const gantt = useRef<Gantt>(null)
  useEffect(() => {
    gantt.current?.refresh(tasks)
  }, [tasks])

  const changeViewMode = (viewMode: viewMode) => {
    gantt.current?.change_view_mode(viewMode)
  }

  return (
    <TooltipProvider>
      <ActionBar
        changeViewMode={changeViewMode}
        tasks={tasks}
        setTasks={setTasks}
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

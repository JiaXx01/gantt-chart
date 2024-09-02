import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import Gantt from 'frappe-gantt'
import dayjs from 'dayjs'
import { ITask } from '@/App'

const GanttChart = forwardRef<
  Gantt | undefined,
  {
    tasks: ITask[]
    setTasks: Dispatch<SetStateAction<ITask[]>>
  }
>(({ tasks, setTasks }, ref) => {
  useImperativeHandle(ref, () => gantt.current)
  const gantt = useRef<Gantt>()
  useEffect(() => {
    gantt.current = new Gantt('#gantt', tasks, {
      on_click: function (task) {
        console.log(task)
      },
      on_date_change: function ({ id }, start, end) {
        setTasks(old =>
          old.map(task => {
            if (task.id === id) {
              return {
                ...task,
                start: dayjs(start).format('YYYY-MM-DD'),
                end: dayjs(end).format('YYYY-MM-DD')
              }
            }
            return task
          })
        )
      },
      on_progress_change: function ({ id }, progress) {
        setTasks(old =>
          old.map(task => {
            if (task.id === id) {
              return {
                ...task,
                progress
              }
            }
            return task
          })
        )
      },
      on_view_change: function (mode) {
        console.log(mode)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full">
      <svg id="gantt"></svg>
    </div>
  )
})

export default GanttChart

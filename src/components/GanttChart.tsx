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
  { gantt: Gantt | undefined; svg: SVGSVGElement | null },
  {
    tasks: ITask[]
    setTasks: Dispatch<SetStateAction<ITask[]>>
  }
>(({ tasks, setTasks }, ref) => {
  useImperativeHandle(ref, () => ({
    gantt: gantt.current,
    svg: svgRef.current
  }))
  const gantt = useRef<Gantt>()
  useEffect(() => {
    gantt.current = new Gantt('#gantt', tasks, {
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
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const svgRef = useRef<SVGSVGElement>(null)
  return (
    <div className="h-full">
      <svg ref={svgRef} id="gantt"></svg>
    </div>
  )
})

export default GanttChart

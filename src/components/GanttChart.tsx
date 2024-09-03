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
// import { Canvg } from 'canvg'

const svgStyle =
  '.gantt .grid-background{fill:none}.gantt .grid-header{fill:#fff;stroke:#e0e0e0;stroke-width:1.4}.gantt .grid-row{fill:#fff}.gantt .grid-row:nth-child(even){fill:#f5f5f5}.gantt .row-line{stroke:#ebeff2}.gantt .tick{stroke:#e0e0e0;stroke-width:.2}.gantt .tick.thick{stroke-width:.4}.gantt .today-highlight{fill:#fcf8e3;opacity:.5}.gantt .arrow{fill:none;stroke:#666;stroke-width:1.4}.gantt .bar{fill:#b8c2cc;stroke:#8d99a6;stroke-width:0;transition:stroke-width .3s ease;user-select:none}.gantt .bar-progress{fill:#a3a3ff}.gantt .bar-invalid{fill:rgba(0,0,0,0);stroke:#8d99a6;stroke-width:1;stroke-dasharray:5}.gantt .bar-invalid~.bar-label{fill:#555}.gantt .bar-label{fill:#fff;dominant-baseline:central;text-anchor:middle;font-size:12px;font-weight:lighter}.gantt .bar-label.big{fill:#555;text-anchor:start}.gantt .handle{fill:#ddd;cursor:ew-resize;opacity:0;visibility:hidden;transition:opacity .3s ease}.gantt .bar-wrapper{cursor:pointer;outline:none}.gantt .bar-wrapper:hover .bar{fill:#a9b5c1}.gantt .bar-wrapper:hover .bar-progress{fill:#8a8aff}.gantt .bar-wrapper:hover .handle{visibility:visible;opacity:1}.gantt .bar-wrapper.active .bar{fill:#a9b5c1}.gantt .bar-wrapper.active .bar-progress{fill:#8a8aff}.gantt .lower-text,.gantt .upper-text{font-size:12px;text-anchor:middle}.gantt .upper-text{fill:#555}.gantt .lower-text{fill:#333}.gantt .hide{display:none}.gantt-container{position:relative;overflow:auto;font-size:12px}.gantt-container .popup-wrapper{position:absolute;top:0;left:0;background:rgba(0,0,0,.8);padding:0;color:#959da5;border-radius:3px}.gantt-container .popup-wrapper .title{border-bottom:3px solid #a3a3ff;padding:10px}.gantt-container .popup-wrapper .subtitle{padding:10px;color:#dfe2e5}.gantt-container .popup-wrapper .pointer{position:absolute;height:5px;margin:0 0 0 -5px;border:5px solid rgba(0,0,0,0);border-top-color:rgba(0,0,0,.8)}'

const GanttChart = forwardRef<
  { gantt: Gantt | undefined; getSvg: () => string | undefined },
  {
    tasks: ITask[]
    setTasks: Dispatch<SetStateAction<ITask[]>>
  }
>(({ tasks, setTasks }, ref) => {
  useImperativeHandle(ref, () => ({
    gantt: gantt.current,
    getSvg
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
  const getSvg = () => {
    const svgElement = svgRef.current
    if (!svgElement) return
    const svgClone = svgElement.cloneNode(true)
    const svgStyleNode = document.createElement('style')
    svgStyleNode.innerHTML = svgStyle
    svgClone.appendChild(svgStyleNode)
    const svg = new XMLSerializer().serializeToString(svgClone)

    return svg
  }
  return (
    <div className="h-full gantt-target">
      <svg ref={svgRef} id="gantt"></svg>
    </div>
  )
})

export default GanttChart

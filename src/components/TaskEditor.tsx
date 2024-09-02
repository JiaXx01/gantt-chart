import {
  SetStateAction,
  useEffect,
  useState,
  Dispatch,
  CSSProperties,
  useMemo,
  useRef
} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
  Row
} from '@tanstack/react-table'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import dayjs from 'dayjs'
import { DateRange } from 'react-day-picker'

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'

import { ITask } from '@/App'

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'

import {
  ListEndIcon,
  ListStartIcon,
  PlusIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { nanoid } from 'nanoid'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, changedData: Record<string, unknown>) => void
    getOriginData: () => ITask[]
  }
}

const InputCell: ColumnDef<ITask>['cell'] = ({
  getValue,
  row: { index },
  column: { id },
  table
}) => {
  const initialValue = getValue() as string | undefined
  const [value, setValue] = useState(initialValue)
  const onBlur = () => {
    if (value === initialValue) return
    table.options.meta?.updateData(index, { [id]: value })
  }
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  return (
    <input
      className="w-full h-full outline-none bg-inherit px-2"
      value={value || ''}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

const NumberCell: ColumnDef<ITask>['cell'] = ({
  getValue,
  row: { index },
  column: { id },
  table
}) => {
  const initialValue = getValue() as string
  const [value, setValue] = useState(initialValue)
  const onBlur = () => {
    if (value === initialValue) return
    let num = Number(value)
    if (num > 100) setValue('100')
    num = num < 0 ? 0 : num > 100 ? 100 : num
    table.options.meta?.updateData(index, { [id]: num })
  }
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  return (
    <input
      type="tel"
      max={100}
      min={0}
      className="w-full h-full outline-none bg-inherit text-center"
      value={value}
      onChange={e => {
        const value = e.target.value
        if (!isNaN(Number(value))) {
          setValue(e.target.value)
        }
      }}
      onBlur={onBlur}
    />
  )
}

const DateCell: ColumnDef<ITask>['cell'] = ({ row, table }) => {
  const start = row.original.start
  const end = row.original.end
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(start),
    to: new Date(end)
  })
  useEffect(() => {
    table.options.meta?.updateData(row.index, {
      start: dayjs(date?.from).format('YYYY-MM-DD'),
      end: dayjs(date?.to).format('YYYY-MM-DD')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])
  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger className="w-full">
          {start}
          {' / '}
          {end}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="range" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const RowDragHandleCell: ColumnDef<ITask>['cell'] = ({ row }) => {
  const { attributes, listeners } = useSortable({
    id: row.id
  })
  return (
    <div
      className="w-full text-center cursor-move"
      {...attributes}
      {...listeners}
    >
      {row.index + 1}
    </div>
  )
}

const DependenciesCell: ColumnDef<ITask>['cell'] = ({ row, table }) => {
  const rowData = row.original
  const allData = table.options.meta?.getOriginData() as ITask[]

  const dependencies: ITask[] = []
  const unDependencies: ITask[] = []

  allData.forEach(data => {
    if (rowData.dependencies?.includes(data.id)) {
      dependencies.push(data)
    } else if (data.id !== rowData.id) {
      unDependencies.push(data)
    }
  })

  const removeDependencies = (id: string) => {
    const newDependencies = rowData.dependencies.filter(_id => id !== _id)
    table.options.meta?.updateData(row.index, { dependencies: newDependencies })
  }
  const addDependencies = (id: string) => {
    table.options.meta?.updateData(row.index, {
      dependencies: [...rowData.dependencies, id]
    })
  }

  return (
    <div className="relative w-full h-full flex items-center gap-1 group px-1">
      {dependencies.map(({ id, name }) => (
        <div
          className="flex items-center justify-center gap-1 shadow border rounded-sm px-0.5 bg-background group/tag"
          key={id}
        >
          <span className="cursor-pointer px-0.5">{name || 'Unnamed'}</span>
          <XIcon
            size="12"
            className="hidden group-hover/tag:block cursor-pointer"
            onClick={() => removeDependencies(id)}
          />
        </div>
      ))}
      <div className="absolute top-0 right-0 bottom-0 flex items-center pr-1">
        <Popover>
          <PopoverTrigger className="bg-background rounded shadow">
            <PlusIcon size="21" className="text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="end" className="flex gap-2 p-2 flex-wrap">
            {unDependencies.map(({ id, name, dependencies }) => (
              <button
                key={id}
                className="text-sm shadow border px-1 rounded-sm bg-background hover:bg-muted"
                onClick={() => addDependencies(id)}
              >
                {name || 'Unnamed'} ({dependencies?.length || 0})
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

const columns: ColumnDef<ITask>[] = [
  {
    id: 'index',
    header: ' ',
    cell: RowDragHandleCell,
    size: 48,
    enableResizing: false
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: InputCell
  },
  {
    header: 'Date Range',
    cell: DateCell,
    size: 200
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: NumberCell,
    size: 80
  },
  {
    accessorKey: 'dependencies',
    header: 'Dependencies',
    cell: DependenciesCell
  },
  {
    accessorKey: 'remark',
    header: () => <div className="w-full text-start pl-3">Remark</div>,
    cell: InputCell,
    enableResizing: false,
    size: 1024
  }
]

const DraggableRow = ({
  row,
  selectedRow,
  onRowSelected
}: {
  row: Row<ITask>
  selectedRow: Row<ITask> | undefined
  onRowSelected: (row: Row<ITask>) => void
}) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative'
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onRowSelected(row)}
      className={cn(
        'relative h-[38px] first:h-[37px] w-[fit-content] text-muted-foreground flex bg-background',
        'before:absolute before:top-0 before:left-0 before:right-0 before:h-[0.5px] before:bg-[#eceff2] first:before:h-[0.7px] first:before:bg-[#e0e0e0]',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[0.5px] after:bg-[#eceff2] last:after:h-[1px] last:after:bottom-[-0.5px]',
        selectedRow?.id === row.id ? 'bg-primary/20' : 'even:bg-[#f5f5f5]'
      )}
    >
      {row.getVisibleCells().map(cell => (
        <div
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className="h-full text-nowrap border-r last:border-none flex items-center overflow-hidden text-sm"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </div>
  )
}

const newTaskData = (name?: string) => ({
  id: nanoid(),
  name: name || 'Unnamed',
  start: dayjs().format('YYYY-MM-DD'),
  end: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  progress: 0,
  dependencies: []
})

const TaskEditAction = ({
  selectedRow,
  setSelectedRow,
  tasks,
  setTasks
}: {
  selectedRow: Row<ITask> | undefined
  setSelectedRow: Dispatch<SetStateAction<Row<ITask> | undefined>>
  tasks: ITask[]
  setTasks: Dispatch<SetStateAction<ITask[]>>
}) => {
  const addNewTask = () => {
    setTasks(old => [...old, newTaskData()])
  }

  const deleteTask = () => {
    if (!selectedRow) return
    setTasks(old => {
      old.splice(selectedRow.index, 1)
      return [...old]
    })
    setSelectedRow(undefined)
  }

  const insertTask = (isAbove: boolean) => {
    if (!selectedRow) return
    const newTasks = [...tasks]
    newTasks.splice(
      isAbove ? selectedRow.index : selectedRow.index + 1,
      0,
      newTaskData()
    )
    setTasks(newTasks)
  }

  const actionBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrollHandler = () => {
      const actionBar = actionBarRef.current
      if (actionBar) {
        actionBar.style.top = document.documentElement.scrollTop + 'px'
      }
    }
    window.addEventListener('scroll', scrollHandler)

    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  return (
    <div
      ref={actionBarRef}
      className="absolute top-0 left-0 right-0 h-[35px] border-b flex gap-2 items-center px-2 border-t-[#e8e8e8] border-t bg-background z-20"
    >
      <button
        className="flex gap-1 items-center justify-center shadow rounded px-1 bg-primary/70 hover:bg-primary/50 text-background"
        onClick={addNewTask}
      >
        <PlusIcon size="16" />
        Task
      </button>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            'ml-5 p-1 rounded-sm',
            !selectedRow
              ? 'text-accent-foreground/30'
              : 'hover:bg-muted text-accent-foreground'
          )}
          disabled={!selectedRow}
          onClick={() => insertTask(true)}
        >
          <ListStartIcon size="16" />
        </TooltipTrigger>
        <TooltipContent>Insert above</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            'p-1 rounded-sm',
            !selectedRow
              ? 'text-accent-foreground/30'
              : 'hover:bg-muted text-accent-foreground'
          )}
          disabled={selectedRow == undefined}
          onClick={() => insertTask(false)}
        >
          <ListEndIcon size="16" />
        </TooltipTrigger>
        <TooltipContent>Insert below</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          disabled={selectedRow == undefined}
          className={cn(
            'p-1 rounded-sm',
            selectedRow == undefined
              ? 'text-red-300'
              : 'hover:bg-muted text-red-500'
          )}
          onClick={deleteTask}
        >
          <Trash2Icon size="16" />
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}

export default function TaskEditor({
  tasks,
  setTasks
}: {
  tasks: ITask[]
  setTasks: Dispatch<SetStateAction<ITask[]>>
}) {
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => tasks?.map(({ id }) => id),
    [tasks]
  )

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    meta: {
      updateData(rowIndex, changedData) {
        setTasks(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                ...changedData
              }
            }
            return row
          })
        )
      },
      getOriginData() {
        return tasks
      }
    }
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setTasks(data => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const [selectedRow, setSelectedRow] = useState<Row<ITask>>()

  const theaderRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrollHandler = () => {
      const theader = theaderRef.current
      if (theader) {
        theader.style.top = document.documentElement.scrollTop + 'px'
      }
    }
    window.addEventListener('scroll', scrollHandler)

    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])
  return (
    <>
      <TaskEditAction
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        tasks={tasks}
        setTasks={setTasks}
      />
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="mt-[35px] h-full w-full overflow-x-auto relative">
          {/* table */}
          <div style={{ width: table.getCenterTotalSize() }}>
            {/* theader */}
            <div
              ref={theaderRef}
              className="absolute z-10 bg-background top-0 h-[25px] w-[fit-content] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[0.7px] after:bg-[#e0e0e0]"
            >
              {table.getHeaderGroups().map(headerGroup => (
                // tr
                <div key={headerGroup.id} className="h-full flex">
                  {headerGroup.headers.map(header => (
                    // th
                    <div
                      className="border-r last:border-none relative w-full text-center overflow-hidden leading-[25px] text-sm"
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {!['index', 'remark'].includes(header.id) && (
                        <div
                          onDoubleClick={() => header.column.resetSize()}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 -right-1 h-full w-2 cursor-col-resize z-10"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="w-full border-b-[0.5px] mt-[25px] z-0">
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map(row => (
                  <DraggableRow
                    key={row.id}
                    row={row}
                    selectedRow={selectedRow}
                    onRowSelected={setSelectedRow}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>
    </>
  )
}

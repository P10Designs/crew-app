import { FC, useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'

interface eventInterface {
  day: Number,
  month: Number,
  year: Number
}

const Dashboard: FC = () => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventInterface[]>()

  useEffect(() => {
    if (events === undefined) {
      setEvents([
        { day: 10, month: 1, year: 2022 },
        { day: 25, month: 4, year: 2022 },
        { day: 12, month: 3, year: 2022 }
      ])
    }
    if (events !== undefined) handleMonthEvents()
  }, [events, month])

  const handleMonthEvents = () => {
    const array:[Number] = [0]
    if (events !== undefined) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.month === month.getMonth() + 1 && event.year === month.getFullYear()) array.push(event.day)
      }
    }
    setThisMonthEvents(array)
  }

  const onMonthHandle = (e:Date) => {
    setMonth(e)
  }
  const dayClick = (e:Date) => {
    if (thisMonthEvents?.includes(e.getDate())) {
      console.log('yes')
    }
  }
  return (
        <div className='w-full h-full flex flex-col items-center justify-center'>
          <div className='w-5/6 lg:w-1/2 '>
            <Calendar
              onChange={(e) => { dayClick(e) }}
              month={month}
              onMonthChange={(e) => { onMonthHandle(e) }}
              fullWidth
              minDate={dayjs(new Date()).toDate()}
              size="xl"
              locale='es'
              dayStyle={(date) =>
                date.toDateString() === new Date().toDateString()
                  ? { backgroundColor: '#2563eb', color: 'white' }
                  : thisMonthEvents?.includes(date.getDate())
                    ? { backgroundColor: '#dc2626', color: 'white' }
                    : { backgroundColor: '' }
              }
              hideOutsideDates
              allowLevelChange={false}
              styles={() => ({
                cell: { border: '1px solid #adb5bd' },
                day: { borderRadius: 0, height: 70, color: 'white', fontWeight: '900' },
                weekdayCell: { height: 70 }
              })}
            />
          </div>
          <div className='inline-flex'>
            <div className='flex flex-col items-center justify-center m-5'>
              <span className='bg-red-600 text-transparent'>leye</span>
              <span >Eventos</span>
            </div>
            <div className='flex flex-col items-center justify-center m-5'>
              <span className='bg-blue-600 text-transparent'>leye</span>
              <span >Hoy</span>
            </div>
          </div>
        </div>
  )
}

export default Dashboard

import { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'
import { getEvents } from '../firebase/clientApp'
interface eventMenuInterface {
  date: {
    seconds: number,
    nanoseconds: number
  },
  positions: [
    {
      name: string,
      special: boolean,
      assigned: string
    }
  ]
}

interface HomeProps{
  events: string
}

const Home: NextPage<HomeProps> = (props) => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventMenuInterface[]>()
  const [menu, setMenu] = useState('calendar')
  const [selected, setSelected] = useState(new Date())

  useEffect(() => {
    if (events === undefined) {
      setEvents(JSON.parse(props.events))
    }
    if (events !== undefined) handleMonthEvents()
  }, [events, month])

  const handleMonthEvents = () => {
    const array:[Number] = [0]
    if (events !== undefined) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        const date = new Date(event.date.seconds * 1000)
        if (date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear()) array.push(date.getDate())
      }
    }
    setThisMonthEvents(array)
  }

  const dayClick = (e:Date) => {
    if (thisMonthEvents?.includes(e.getDate())) {
      setSelected(e)
      setMenu('dayList')
    }
  }
  return (
        <div className='w-full flex flex-col items-center justify-center bg-gray-500 h-min'>
          <div className='font-bold text-5xl mb-7'>CREW APP</div>
          {menu === 'calendar' &&
            <>
              <div className='w-5/6 lg:w-1/2 '>
                <Calendar
                  onChange={(e) => { dayClick(e) }}
                  month={month}
                  onMonthChange={setMonth}
                  fullWidth
                  minDate={ dayjs(new Date()).toDate() }
                  size="xl"
                  locale='es'
                  dayStyle={(date) =>
                    thisMonthEvents?.includes(date.getDate())
                      ? { backgroundColor: '#dc2626', color: 'white' }
                      : date.toDateString() === new Date().toDateString()
                        ? { backgroundColor: '#2563eb', color: 'white' }
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
              <div className='text-xs text-start w-5/6 mt-3'>* Para acceder a los diferentes eventos, haz click en uno de los dias con evento para desplegar las opciones</div>
            </>
          }
          {menu === 'dayList' &&
            <div className='flex flex-col itemc-center justify-center'>
              <button onClick={() => { setMenu('calendar') }}>CLOSE</button>
              {events !== undefined && events.map((event, i) => {
                if (new Date(event.date.seconds * 1000).getDate() !== selected.getDate()) return (<></>)
                return (
                    <div>
                      {event.date.seconds}
                    </div>
                )
              })
              }
            </div>
          }
        </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await getEvents()
  return {
    props: {
      events: JSON.stringify(events)
    }
  }
}

export default Home

// TODO: open event list on click on day

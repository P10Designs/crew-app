import { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'
import { getEvents } from '../firebase/clientApp'
import BoyIcon from '@mui/icons-material/Boy'
interface eventInterface {
  date: {
    seconds: number,
    nanoseconds: number
  },
  id: number,
  positions: [
    {
      name: string,
      special: boolean,
      assigned: string
    }
  ],
  match:{
    local: string,
    visitor: string,
    league: string
  }
}

interface HomeProps{
  events: string
}

const Home: NextPage<HomeProps> = (props) => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventInterface[]>()
  const [menu, setMenu] = useState('calendar')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<eventInterface>()

  useEffect(() => {
    if (events === undefined) {
      let e = JSON.parse(props.events)
      e = e.map((e:any, i:number) => ({
        ...e,
        id: i
      }))
      setEvents(e)
    }
    console.log(events)
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

  const selectEvent = (id:number) => {
    if (events === undefined) return
    for (let i = 0; i < events.length; i++) {
      if (events[i].id === id) {
        setSelectedEvent(events[i])
      }
    }
    setMenu('event')
  }

  const dayClick = (e:Date) => {
    if (thisMonthEvents?.includes(e.getDate())) {
      setSelectedDay(e)
      setMenu('dayList')
    }
  }

  const genHour = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
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
            <div className='flex flex-col items-center justify-center'>
              <div className='inline-flex items-center justify-between transition-all border-t border-r border-l border-black rounded-t p-3 w-full'>
                      <div className='mx-2'>HORA</div>
                      <div className='mx-2'>PARTIDO</div>
                      <div className='mx-2'>LIGA</div>
                      <div className='mx-2 inline-flex items-center justify-center'><BoyIcon />P</div>
              </div>
              {events !== undefined && events.map((event, i) => {
                if (new Date(event.date.seconds * 1000).getDate() !== selectedDay.getDate()) return (<></>)
                return (
                  <button
                    key={'match_list' + i}
                    onClick={() => { selectEvent(event.id) }}
                    className={'inline-flex items-center justify-center hover:bg-gray-700/70 transition-all border border-black p-3'}
                  >
                      <div className='mx-2'>{genHour(event.date.seconds)}</div>
                      <div className='mx-2'>{event.match.local.toUpperCase()} vs. {event.match.visitor.toUpperCase()}</div>
                      <div className='mx-2'>{event.match.league.toUpperCase()}</div>
                      <div className='mx-2 inline-flex items-center justify-center'><BoyIcon />{event.positions.length}</div>
                  </button>
                )
              })
            }
            <button onClick={() => { setMenu('calendar') }} className='px-4 py-2 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>CLOSE</button>
            </div>
          }
          {menu === 'event' &&
            <div className='flex flex-col items-center justify-center'>
              {selectedEvent?.positions.map((pos, i) => {
                if (pos.assigned === '') {
                  return (
                  <div>
                    {pos.name}
                  </div>
                  )
                } else {
                  return (
                    <div>
                      {pos.name}
                      {pos.assigned}
                    </div>
                  )
                }
              })}
              <button onClick={() => { setMenu('dayList') }} className='px-4 py-2 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>CLOSE</button>
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

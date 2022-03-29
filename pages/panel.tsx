import { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'
import { getEvents } from '../firebase/clientApp'
import BoyIcon from '@mui/icons-material/Boy'
import AddIcon from '@mui/icons-material/add'
import { eventInterface, HomeProps } from 'constants/interfaces'

const Home: NextPage<HomeProps> = (props) => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventInterface[]>()
  const [menu, setMenu] = useState('calendar')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<eventInterface>()

  useEffect(() => {
    if (events === undefined) {
      const e = JSON.parse(props.events)
      const result = e.filter((a:eventInterface) => new Date(a.date.seconds * 1000) >= new Date())
      result.sort((a:eventInterface, b:eventInterface) => (new Date(a.date.seconds * 1000) > new Date(b.date.seconds * 1000)) ? 1 : -1)
      setEvents(result)
    }
    if (events !== undefined) {
      handleMonthEvents()
    }
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

  const selectEvent = (id:string) => {
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

  const addEvent = () => {
    console.log('add')
  }

  const genHour = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  const genDate = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  return (
    <div className='w-full flex flex-col items-center justify-start  h-min'>
      <div className='font-bold text-white px-10 w-full bg-blue-600 h-14 inline-flex justify-between items-center mb-10'>
        <span>PANEL DE CONTROL</span>
        <button
          onClick={() => { addEvent() }}
          className='p-1.5 transition-all rounded-full hover:bg-gray-600/50 flex items-center justify-center'
        >
          <AddIcon />
        </button>
      </div>
      {menu === 'add' &&
        <>
          add
        </>
      }
      {menu === 'calendar' &&
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
              cell: { border: '1px solid #000', backgroundColor: '#adb5bd' },
              day: { borderRadius: 0, height: 70, color: 'black', fontWeight: '900' },
              weekdayCell: { height: 70 }
            })}
          />
        </div>
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
          })}
        <button onClick={() => { setMenu('calendar') }} className='px-4 py-2 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>CLOSE</button>
        </div>
      }
      {menu === 'event' &&
        <div className='flex flex-col items-center justify-center'>
          <div className='inline-flex items-center justify-between font-bold rounded-t p-2 border border-b-0 border-black w-full'>
            <span>POSICIÓN</span>
            <span>ASSIGNED</span>
          </div>
          {selectedEvent?.positions.map((pos, i) => {
            return (
              <div className={'inline-flex items-center justify-between p-2 border border-black w-full min-w-special' + (pos.special ? ' bg-yellow-600' : '')} key={'pos' + i}>
                <span className='mr-2 font-bold'>{pos.name}</span>
                <span>{pos.assigned}</span>
              </div>
            )
          })}
          <button onClick={() => { setMenu('calendar') }} className='px-4 py-2 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>CLOSE</button>
        </div>
      }
      {menu === 'calendar' &&
        <div className='flex flex-col items-center justify-center mt-10'>
          <div className='inline-flex items-center justify-between transition-all border-t border-r border-l border-black rounded-t p-3 w-full'>
            <div className='mx-2'>DIA</div>
            <div className='mx-2'>HORA</div>
            <div className='mx-2'>PARTIDO</div>
            <div className='mx-2'>LIGA</div>
            <div className='mx-2 inline-flex items-center justify-center'><BoyIcon />P</div>
          </div>
          {events !== undefined && events.map((event, i) => {
            return (
              <button
                key={'match_list' + i}
                onClick={() => { selectEvent(event.id) }}
                className={'inline-flex items-center justify-between hover:bg-gray-700/70 transition-all border border-black p-3 w-full'}
              >
                  <div className='mx-2'>{genDate(event.date.seconds)}</div>
                  <div className='mx-2'>{genHour(event.date.seconds)}</div>
                  <div className='mx-2'>{event.match.local.toUpperCase()} vs. {event.match.visitor.toUpperCase()}</div>
                  <div className='mx-2'>{event.match.league.toUpperCase()}</div>
                  <div className='mx-2 inline-flex items-center justify-center'><BoyIcon />{event.positions.length}</div>
              </button>
            )
          })}
        </div>
      }
  </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await getEvents()
  console.log(JSON.stringify(events))
  return {
    props: {
      events: JSON.stringify(events)
    }
  }
}

export default Home

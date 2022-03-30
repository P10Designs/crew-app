import { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'
import { checkPass, getEvents, update } from '../firebase/clientApp'
import BoyIcon from '@mui/icons-material/Boy'
import SendIcon from '@mui/icons-material/Send'
import { useRouter } from 'next/router'
import { eventInterface, HomeProps, specialInterface } from 'constants/interfaces'

const Home: NextPage<HomeProps> = (props) => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventInterface[]>()
  const [menu, setMenu] = useState('calendar')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<eventInterface>()
  const [name, setName] = useState<string>()
  const [passwordSee, setPasswordSee] = useState(false)
  const [password, setPassword] = useState<string>('')
  const [data, setData] = useState<specialInterface>()

  const router = useRouter()
  useEffect(() => {
    if (events === undefined) {
      const e = JSON.parse(props.events)
      const result = e.filter((a:eventInterface) => new Date(a.date.seconds * 1000) >= new Date())
      result.sort((a:eventInterface, b:eventInterface) => a.date.seconds - b.date.seconds)
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

  const passwordCheck = async () => {
    if (password === '') return
    const val = await checkPass(password)
    if (!val) alert('Wrong password')
    else {
      setPasswordSee(false)
      if (name !== undefined && name !== '' && data !== undefined) {
        const res = await update(data.id, name, data.pos)
        if (!res) {
          alert('Error')
        } else {
          alert('Succes!')
        }
        router.reload()
      } else {
        alert('Error, introduzca un nombre')
      }
    }
  }

  const updateHandler = async (id:string, pos:string, special:boolean) => {
    if (special) {
      setPasswordSee(true)
      setData({ id, pos })
    } else {
      if (name !== undefined && name !== '') {
        const res = await update(id, name, pos)
        if (!res) {
          alert('Error')
        } else {
          alert('Succes!')
        }
        router.reload()
      } else {
        alert('Error, introduzca un nombre')
      }
    }
  }

  const genHour = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  return (
        <div className='w-full flex flex-col items-center justify-start bg-gray-500 h-min'>
          <div className='font-bold text-5xl my-10'>CREW APP</div>
          {passwordSee &&
            <div className='w-full h-full absolute z-10 flex items-center justify-center bg-black/80'>
              <div className='bg-gray-800 flex flex-col p-5 rounded-md'>
                <span className='font-bold text-xl mb-3 text-white'>INTRODUCE PASSWORD</span>
                <div className='inline-flex items-center justify-center'>
                  <input type='password' onChange={(e) => { setPassword(e.currentTarget.value) }} className='rounded p-1.5' />
                  <button
                    onClick={() => { passwordCheck() }}
                  >
                    <SendIcon className='text-white ml-2 hover:text-gray-500 transition-all' />
                  </button>
                </div>
              </div>
            </div>
          }
          {menu === 'calendar' &&
            <>
              <div className='w-5/6 lg:w-1/2 flex flex-col items-center'>
                <button onClick={() => { setMonth(new Date()) }} className='px-4 py-2 mb-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>HOY</button>
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
                    className={'inline-flex items-center w-full min-w-special justify-center hover:bg-gray-700/70 transition-all border border-black p-3'}
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
              <div className='inline-flex items-center justify-between font-bold rounded-t p-2 border border-b-0 border-black w-full'>
                <span>POSICIÓN</span>
                <span>ASSIGNED</span>
              </div>
              {selectedEvent?.positions.map((pos, i) => {
                if (pos.assigned !== '') {
                  return (
                  <div className={'inline-flex items-center justify-between p-2 border border-black w-full min-w-special' + (pos.special ? ' bg-yellow-600' : '')} key={'pos' + i}>
                    <span className='mr-2 font-bold'>{pos.name}</span>
                    <span>{pos.assigned}</span>
                  </div>
                  )
                } else {
                  return (
                    <div className={'inline-flex items-center justify-between p-2 border border-black w-full min-w-special' + (pos.special ? ' bg-yellow-600' : '')} key={'pos' + i}>
                      <span className='mr-2 font-bold'>{pos.name}</span>
                      <div className='inline-flex items-center justify-end'>
                        <input onChange={(e) => { setName(e.currentTarget.value) }} placeholder='Introduce tu nombre' className='rounded p-1 w-1/2 mr-1'/>
                        <button
                          onClick={() => { updateHandler(selectedEvent.id, pos.name, pos.special) }}
                        >
                          <SendIcon className='text-white hover:text-gray-600 transition-all cursor-pointer' />
                        </button>
                      </div>
                    </div>
                  )
                }
              })}
              <div className='inline-flex w-full items-center justify-start m-2'>
                <span className='text-transparent bg-yellow-600 mr-2'>exc</span>
                <span className='font-bold text-xs'>*Requires password</span>
              </div>
              <button onClick={() => { setMenu('dayList') }} className='px-4 py-2 mt-5 rounded bg-blue-900 fnt-bold text-white transition-all hover:bg-blue-600 border border-black w-max'>CLOSE</button>
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

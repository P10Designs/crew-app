import { NextPage, GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import 'dayjs/locale/es'
import dayjs from 'dayjs'
import { Calendar } from '@mantine/dates'
import { addEventFirebase, deleteEvent, getEvents } from '../firebase/clientApp'
import BoyIcon from '@mui/icons-material/Boy'
import AddIcon from '@mui/icons-material/Add'
import { eventExport, eventInterface, HomeProps } from 'constants/interfaces'
import { useForm, formList } from '@mantine/form'
import { Input, TextInput, Switch, Group, ActionIcon, Box, Text, Button } from '@mantine/core'
import { Trash } from 'tabler-icons-react'
import { useRouter } from 'next/router'

const Home: NextPage<HomeProps> = (props) => {
  const [month, setMonth] = useState(new Date())
  const [thisMonthEvents, setThisMonthEvents] = useState<[Number]>()
  const [events, setEvents] = useState<eventInterface[]>()
  const [menu, setMenu] = useState('calendar')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<eventInterface>()

  const router = useRouter()

  const form = useForm({
    initialValues: {
      date: '',
      time: '',
      local: '',
      visitor: '',
      league: '',
      positions: formList([{ name: '', special: false, assigned: '' }])
    }
  })

  const fields = form.values.positions.map((_, index) => (
    <Group key={index} mt="xs">
      <TextInput
        placeholder="Name"
        required
        sx={{ flex: 1 }}
        {...form.getListInputProps('positions', index, 'name')}
      />
      <Switch label="Special" {...form.getListInputProps('positions', index, 'special')} />
      <ActionIcon
        color="red"
        variant="hover"
        onClick={() => form.removeListItem('positions', index)}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group>
  ))

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

  const save = async () => {
    const values = form.values

    const res:eventExport = {
      date: new Date(`${values.date} ${values.time}`),
      match: {
        local: values.local,
        visitor: values.visitor,
        league: values.league
      },
      positions: values.positions
    }

    addEventFirebase(res).then((sep) => {
      router.reload()
    }).catch((err) => {
      alert(err)
    })
  }

  const addEvent = () => {
    form.reset()
    setMenu('add')
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
    <div className='w-full flex flex-col items-center justify-start bg-gray-200 h-min'>
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
        <div className='flex flex-col items-center justify-center'>
          <span className='font-bold text-xl mb-3'>DATE / TIME</span>
          <div className='inline-flex'>
            <Input variant="filled" radius="md" type={'date'} size="xs" className='mx-1.5' {...form.getInputProps('date')}/>
            <Input variant="filled" radius="md" size="xs" type={'time'} className='mx-1.5' {...form.getInputProps('time')}/>
          </div>
          <span className='font-bold text-xl my-3'>MATCH INFO</span>
          <div className='inline-flex'>
            <Input size="xs" sx={() => ({ width: '70px' })} variant="filled" placeholder="Local" radius="md" type={'text'} className='mx-1.5' {...form.getInputProps('local')}/>
            <Input size="xs" sx={() => ({ width: '70px' })} variant="filled" placeholder="Visitor" radius="md" type={'text'} className='mx-1.5' {...form.getInputProps('visitor')}/>
            <Input size="xs" sx={() => ({ width: '90px' })} variant="filled" placeholder="League" radius="md" type={'text'} className='mx-1.5'{...form.getInputProps('league')}/>
          </div>
          <span className='font-bold text-xl my-3'>POSITIONS</span>
          <div className='inline-flex'>
            <Box sx={{ maxWidth: 500 }} mx="auto">
              {fields.length > 0
                ? (
                <Group mb="xs">
                  <Text weight={500} size="sm" sx={{ flex: 1 }}>
                    Name
                  </Text>
                  <Text weight={500} size="sm" pr={90}>
                    Special
                  </Text>
                </Group>
                  )
                : (
                <Text color="dimmed" align="center">
                  No one here...
                </Text>
                  )}

              {fields}

              <Group position="center" mt="md">
                <Button className='bg-blue-600 transition-all' onClick={() => form.addListItem('positions', { name: '', special: false, assigned: '' })}>
                  Add positions
                </Button>
              </Group>
            </Box>
          </div>
          <div>
            <button onClick={() => { setMenu('calendar') }} className='px-3 py-1.5 mt-5 rounded bg-red-900 font-bold text-white transition-all hover:bg-red-600 border border-black w-max'>CLOSE</button>
            <button onClick={() => { save() }} className='px-4 py-1.5 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max ml-2'>SAVE</button>
          </div>
        </div>
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
                className={'inline-flex items-center w-full w-min-special justify-center hover:bg-gray-700/70 transition-all border border-black p-3'}
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
          <div className='inline-flex'>
            <button onClick={() => { setMenu('calendar') }} className='px-4 py-2 mt-5 rounded bg-blue-900 font-bold text-white transition-all hover:bg-blue-600 border border-black w-max mx-1.5'>CLOSE</button>
            <button onClick={() => { deleteEvent(selectedEvent?.id || '').then(() => { router.reload() }).catch((err) => { alert(err) }) }} className='px-4 py-2 mt-5 rounded bg-red-900 fnt-bold text-white transition-all hover:bg-blue-600 border border-black w-max mx-1.5'>DELETE</button>
          </div>
        </div>
      }
      {menu === 'calendar' && thisMonthEvents !== undefined && thisMonthEvents?.length > 1 &&
        <div className='flex flex-col items-center justify-center my-10 w-max'>
          <div className='inline-flex items-center justify-between transition-all border-t border-r border-l border-black rounded-t p-3 w-full'>            <div className='mx-2'>DIA</div>
            <div className='mx-2'>HORA</div>
            <div className='mx-2'>PARTIDO</div>
            <div className='mx-2'>LIGA</div>
            <div className='mx-2 inline-flex items-center justify-center'><BoyIcon />P</div>
          </div>
          {events !== undefined && events.map((event, i) => {
            if (new Date(event.date.seconds * 1000).getMonth() !== month.getMonth()) return (<></>)
            return (
              <button
                key={'match_list' + i}
                onClick={() => { selectEvent(event.id) }}
                className={'inline-flex w-full min-w-special items-center justify-between hover:bg-gray-700/70 transition-all border border-black p-3'}
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
  return {
    props: {
      events: JSON.stringify(events)
    }
  }
}

export default Home

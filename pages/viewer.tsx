import { eventInterface, HomeProps } from 'constants/interfaces'
import { NextPage, GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { getEvents } from '../firebase/clientApp'
import { Table } from '@mantine/core'

const Viewer: NextPage<HomeProps> = (props) => {
  const [events, setEvents] = useState<eventInterface[]>()

  useEffect(() => {
    if (events === undefined) {
      const e = JSON.parse(props.events)
      const result = e.filter((a:eventInterface) => new Date(a.date.seconds * 1000) >= new Date())
      result.sort((a:eventInterface, b:eventInterface) => a.date.seconds - b.date.seconds)
      setEvents(result)
    }
  }, [events])

  const genHour = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  const genDate = (e:number) => {
    const date = new Date(e * 1000)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const genPos = (i:number) => {
    let string = ''
    if (events !== undefined) {
      const pos = events[i].positions
      for (let o = 0; o < pos.length; o++) {
        if (pos[o] !== undefined) {
          const row = pos[o]
          string += ` ${row.name} - ${row.assigned === '' ? 'NaN' : row.assigned} `
        }
      }
    }
    return string
  }

  const rows = events?.map((element, i) => (
    <tr key={element.id}>
      <td>{genDate(element.date.seconds)}</td>
      <td>{genHour(element.date.seconds)}</td>
      <td>{element.match.local}</td>
      <td>{element.match.visitor}</td>
      <td>{element.match.league}</td>
      <td>{genPos(i)}</td>
    </tr>
  ))

  return (
    <div className='flex items-center justify-center'>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>DÍA</th>
            <th>HORA</th>
            <th>LOCAL</th>
            <th>VISITANTE</th>
            <th>LIGA</th>
            <th>POSICIONES</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
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

export default Viewer


export interface eventInterface {
  date: {
    seconds: number,
    nanoseconds: number
  },
  id: string,
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

export interface specialInterface {
  id: string,
  pos: string,
}

export interface HomeProps{
  events: string
}

import{ useEffect, useState } from 'react'

export default function useRoom() {
    const [id, setId] = useState(null)
  useEffect(() =>{
    if(id){
        setId(id)
    }
  },[id])
  return {id, setId}
}

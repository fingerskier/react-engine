import React, {useRef, useEffect, useState} from 'react'
import DefaultRenderer from "./DefaultRenderer";


const isPromise = obj => {
  return !!(
    obj &&
    obj.then &&
    obj.then.constructor &&
    obj.then.call &&
    obj.then.apply
  );
};


const baseEvents = `onClick onContextMenu onDoubleClick onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onWheel onTouchCancel onTouchEnd onTouchMove onTouchStart onKeyDown onKeyPress onKeyUp`


export default function Engine({
  systems,
  entities=[],
  renderer,
  running=true,
  onEvent,
  style,
  className,
  children,
  reset=false,
}) {
  
  renderer = renderer || DefaultRenderer


  const container = useRef()
  
  const [input, setInput] = useState([])
  const [previousDelta, setPreviousDelta] = useState(0)
  const [previousTime, setPreviousTime] = useState()
  const [state, setState] = useState({})
  const [time, setTime] = useState(+(new Date()))


  useEffect(() => {
    setInput([])
    setPreviousTime(null)
    setPreviousDelta(null)
    dispatch({type: "clear the machine"})

    reset = false
  }, [reset])
  

  const dispatch = event=>{
    input.push(event)  // why do this?  when is the next render; i.e. when inputHandlers gets updated from events?!
    if (onEvent) onEvent(event)

    setInput(input)

    console.log(event)
  }

  
  const inputHandlers = baseEvents
  .split(' ')
  .map(name => ({
    name,
    handler: event => {
      if (running) {
        event.persist()
        input.push({ name, event })
        setInput(input)
      }
    }
  }))
  .reduce((acc, val) => {
    acc[val.name] = val.handler;
    return acc;
  }, {})


  useEffect(() => {
    console.log('pre-entities', entities)

    if (isPromise(entities)) {
      entities()
      .then(res=>{
        setState(res)
        console.log('loading entities from async function')
      })
      .catch(console.error)
    } else if (typeof entities === 'function') {
      setState(entities())
      console.log('loading entities from function')
    } else {
      setState(entities)
      console.log('loading entities matrix')
    }

    dispatch({type: "set entities"})
  }, [])


  useEffect(() => {
    console.log('   state', state)
  }, [state])


  useEffect(() => {
    console.log('entities', entities)
  }, [entities])
  


  useEffect(() => {
    if (running) {
      dispatch({type: "started"})
    } else {
      dispatch({type: "stopped"})  
    }
  }, [running])


  useEffect(() => { // GAME LOOP
    if (running) {
      const args = {
        input: input,
        window: window,
        dispatch: dispatch,
        time: {
          current: time,
          previous: previousTime,
          delta: time - (previousTime || time),
          previousDelta: previousDelta,
        },
      }
      
      
      const newState = systems.reduce(
        (influx,sys)=>sys(influx, args),
        state
      )
      
      
      setInput([])
      setPreviousTime(time)
      setPreviousDelta(time - (previousTime || time))
      setState(newState)
      
        
      requestAnimationFrame(()=>{
        setTime(+(new Date()))
      })
    }

  
    return () => {
      ;
    }
  }, [running, state, time])
  

  return (
    <div
      ref={container}
      style={{ ...style }}
      className={className}
      tabIndex={0}
      {...inputHandlers}
    >
      {renderer(state, window)}
      {children}
    </div>
  )
}
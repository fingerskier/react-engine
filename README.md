# Derived from: [React-Game-Engine](https://github.com/bberak/react-game-engine)


Single component to make it easier to construct dynamic and interactive scenes using React[web].


## Table of Contents

- [Quick Start](#quick-start)
- [GameEngine Properties](#gameengine-properties)
- [GameEngine Methods](#gameengine-methods)
- [FAQ](#faq)
- [Introduction](#introduction)
- [Managing Complexity with Component Entity Systems](#managing-complexity-with-component-entity-systems)
  - [Additional CES Reading Material](#additional-ces-reading-material)
- [Get in Touch](#get-in-touch)
- [License](#license)


## Addenda

There is a **react-game-engine** template that illuminates both the core concepts and integration with 3D, sound, physics, spritesheets, etc.;  take a look at [react-game-engine-template](https://github.com/bberak/react-game-engine-template).


## Quick Start

Firstly, install the package to your project:

```npm install --save ___```

Then import the Engine wrapper-component:

```javascript
import Engine from "___";
```

Then, setup your main component's body like so:

```
  <Engine
    style={{
      width: 800,
      height: 600,
      backgroundColor: 'blue',
    }}

    systems={[MoveBox]}

    entities={{
      box1: {x:300, y:200, renderer: <Box/>}
    }}
  ></Engine>
```
...you can [theoretically] have multiple `Engine` components at once.  Whether that's performant or not is another question...
  
  
`MoveBox` is a function.  `systems` is a an array of functions.  These get called on each cycle.
  
  
This is what the `MoveBox` declaration looks like:

```
const MoveBox = (entities, {input})=>{
  const {payload} = input.find(x=>x.name==='onMouseDown') || {}

  if (payload) {
    const box1 = entities['box1']

    box1.x = payload.pageX
    box1.y = payload.pageY
  }

  return entities
}


export default MoveBox
```

It watches for the `onMouseDown` event and sets the coordinates of `box1` to match those of the mouse.
Every system function recieves two parameters: `game-state` and `engine-state`.
`game-state` is an object containing all the entities.
`engine-state` is an object thusly set:
```
{
  input: <array of current events>,
  window: <...>,
  dispatch: <fx to send an event>,
  time: {
    current: <+(new Date())>,
    previous: <Integer>,
    delta: <Integer>,
    previousDelta: <Integer>,
  }
```
...`dispatch`ed events evaporate after the current cycle
  
  
The `Box` renderer is a usual React component:

```
function Box({ size=100, x=250, y=150 }) {
  const thisX = x - size/2
  const thisY = y - size/2

  return (
    <div style={{
      position: "absolute",
      width: size,
      height: size,
      backgroundColor: "red",
      left: thisX,
      top: thisY,
    }} />
  )
}

export Box
```

This component renders a `Box`.  
Note that entities do not have to render something, they can be just data and functions.
  
  
Build and run: each entity is a **"box"**. Every time you click on the screen, the first entity will move to the clicked coordinate.


## Engine Properties

| Prop | Description | Default |
|---|---|---|
|**`systems`**|An array of functions to be called on every tick. |`[]`|
|**`entities`**|An object containing your game's initial entities. This can also be a Promise that resolves to an object containing your entities. This is useful when you need to asynchronously load a texture or other assets during the creation of your entities or level. |`{} or Promise`|
|**`renderer`**|A function that receives the entities and needs to render them on every tick. ```(entities,screen) => { /* DRAW ENTITIES */ }``` |`DefaultRenderer`|
|**`running`**|A boolean that can be used to control whether the game loop is running or not |`true`|
|**`onEvent`**|A callback for being notified when events are dispatched |`undefined`|
|**`style`**|An object containing styles for the root container |`undefined`|
|**`className`**|A className for applying styles for the root container |`undefined`|
|**`children`**|React components that will be rendered after the entities |`undefined`|


## FAQ

### Why?

Because not all problems lend themselves to the static-document-model solution.
Yet, the DOM is far more powerful and capable than how we typically use: for electronic brochures with dynamic tweaks here and there.  
  
The base notion of this `Engine` is that of a cycle; much like an embedded controller cycles to read and write I/O, and a game-engine loops to get input and draw output.  This allows us compartmentalize our user interface solution into input (systems, handlers) and output (renderers, network).
  
  
### Is it perfect?

Yes.  Perfectly unique.  Just like you- and everyone else.

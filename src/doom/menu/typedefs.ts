//
// MENU TYPEDEFS
//

type DisabledMenuItem = {
  status: -1 | 0
}

type SimpleMenuItem = {
  status: 1
  name?: string

  // choice = menu item #.
  routine: (choice: number) => void

  // hotkey in menu
  alphaKey?: string
}

type ArrowMenuItem = {
  status: 2,
  name: string,

  //   choice=0:leftarrow,1:rightarrow
  routine: (leftOrRight: 0 | 1) => void

  // hotkey in menu
  alphaKey: string
}

export type MenuItem = DisabledMenuItem | SimpleMenuItem | ArrowMenuItem

export interface MenuStruct {
  // # of menu items
  numItems: number
  // previous menu
  prevMenu: MenuStruct | null
  // menu items
  menuItems: MenuItem[]
  // draw routine
  routine: () => void
  // x,y of menu
  x: number
  y: number
  // last item user was on in menu
  lastOn: number
}

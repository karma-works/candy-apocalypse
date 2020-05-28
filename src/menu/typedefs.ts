import { Menu } from './menu'

//
// MENU TYPEDEFS
//
export interface MenuItem {
  // 0 = no cursor here, 1 = ok, 2 = arrows ok
  status: number

  name: string

  // choice = menu item #.
  // if status = 2,
  //   choice=0:leftarrow,1:rightarrow
  routine?: (menu: Menu, choice: number) => Promise<void>

  // hotkey in menu
  alphaKey?: string
}
export interface MenuStruct {
  // # of menu items
  numItems: number
  // previous menu
  prevMenu: MenuStruct | null
  // menu items
  menuItems: MenuItem[]
  // draw routine
  routine?: (menu: Menu) => Promise<void>
  // x,y of menu
  x: number
  y: number
  // last item user was on in menu
  lastOn: number
}

import { DoomData } from './doom-data'

export class DoomCom {
    // Supposed to be DOOMCOM_ID?
    id = 0

    // DOOM executes an int to execute commands.
    intNum = 0
    // Communication between DOOM and the driver.
    // Is CMD_SEND or CMD_GET.
    command = 0
    // Is dest for send, set by get (-1 = no packet).
    remoteNode = 0

    // Number of bytes in doomdata to be sent
    datalength = 0

    // Info common to all nodes.
    // Console is allways node 0.
    numNodes = 0
    // Flag: 1 = no duplication, 2-5 = dup for slow nets.
    ticDup = 0
    // Flag: 1 = send a backup tic in every packet.
    extraTics = 0
    // Flag: 1 = deathmatch.
    deathMatch = false
    // Flag: -1 = new game, 0-5 = load savegame
    savegame = 0
    // 1-3
    episode = 0
    // 1-9
    map = 0
    // 1-5
    skill = 0

    // Info specific to this node.
    consolePlayer = 0
    numPlayers = 0

    // These are related to the 3-display mode,
    //  in which two drones looking left and right
    //  were used to render two additional views
    //  on two additional computers.
    // Probably not operational anymore.
    // 1 = left, 0 = center, -1 = right
    angleOffset = 0
    // 1 = drone
    drone = 0

    // The packet data to be sent.
    data = new DoomData()
}

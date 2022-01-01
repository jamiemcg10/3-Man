import { writable } from 'svelte/store'
import io from 'socket.io-client'
import type { PlayerPool } from '../../../modules/PlayerPool.js'
import type { Game } from '../../../modules/Game'

let id: string

const socket = io("http://localhost:5000", {
    reconnection: false
})

socket.on('connect', () => {
    id = socket.id
})

export const store = writable<{
    socket: any,
    name: string,
    id: string,
    gameID: string,
    code: string,
    validCode: boolean,
    game: Game,
    drinking: string,
    ruleBeingMade: boolean
}>({
    socket,
    name: '',
    id: socket.id,
    gameID: '',
    code: '',
    validCode: false,
    game: null,
    drinking: '',
    ruleBeingMade: false,  
})
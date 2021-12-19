import { writable } from 'svelte/store'
import io from 'socket.io-client'
import type { PlayerPool } from '../../../modules/PlayerPool.js'
import type { Game } from '../../../modules/Game'

let id: string

const socket = io("http://localhost:5000", {
    });

socket.on('connect', () => {
    id = socket.id
})

export const store = writable<{
    socket: any,
    name: string,
    id: string,
    gameID: string,
    code: string,
    game: Game
}>({
    socket,
    name: null,
    id,
    gameID: null,
    code: null,
    game: null,
})
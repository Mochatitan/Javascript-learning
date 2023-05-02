import {cvs, ctx, state, isDemoing, isUnlocked, unlockAchievement,bottom,setTimeout,gameOver} from "./main.js"

const jumpforce = 65
const gravity = 8
const terminal = 76
const spawn = 160

export class Player {
    constructor() {
        this.x = spawn
        this.y = 0
        this.vel = 0
        this.jumped = false
        this.isDead = false
        this.gravityReversed = false
    }
    jump() {
        this.jumped = true
        if (this.gravityReversed) {
            this.vel = -jumpforce
            return
        }
        this.vel = jumpforce
    }
    die() {
        if (this.isDead || state != 2) {return}
        this.isDead = true
        if (!isDemoing) {
            if (!isUnlocked(0)) {
                unlockAchievement(0)
            }
            if (this.x > spawn && !isUnlocked(3)) {
                unlockAchievement(3)
            }
        }
        resetTimeout = setTimeout(() => {
            gameOver()
        }, 1200)
    }
    getEffectivePosition() {
        return [this.x, bottom - this.y]
    }
    getNearbyTiles() {
        const ret = []
        const [_, by] = this.getEffectivePosition()
        const x = Math.min(levelSize - 1, (this.x + camX) / tilesize)
        const y = Math.min(gridHeight - 1, by / tilesize)
        ret.push(grid[Math.floor(x)][Math.floor(y)])
        ret.push(grid[Math.ceil(x)][Math.floor(y)])
        ret.push(grid[Math.floor(x)][Math.ceil(y)])
        ret.push(grid[Math.ceil(x)][Math.ceil(y)])
        return ret.filter((item, index) => ret.indexOf(item) === index)
    }
    update() {
        if (editorMode) {
            this.render()
            return
        }
        if (isDown && !this.jumped && this.x < cvs.width - 150) {this.jump()}
        if (this.gravityReversed) {
            const [_, oldY] = this.getEffectivePosition()
            const ceil = (gridHeight - 1) * tilesize
            this.y += this.vel
            if (this.y <= 0) {
                this.vel = 0
            }
            this.y = Math.max(0, this.y)
            this.y = Math.min(ceil, this.y)
            let adjustedY = ceil
            const tiles = this.getNearbyTiles()
            for (let t of tiles) {
                const [x, y] = t.getEffectivePosition()
                if (t.type != "block" && t.type != "platform") {continue}
                const [px, py] = this.getEffectivePosition()
                if (t.type == "block" && t.collidesWithPlayer()) {
                    if (py + tilesize > y && oldY + tilesize <= y) {
                        this.vel = 0
                        this.y = bottom - y + tilesize
                    } else if (py < y + tilesize && oldY >= y + tilesize) {
                        adjustedY = bottom - y - tilesize
                    }
                } else if (t.type == "platform" && t.collidesWithPlayer(tilesize, tilesize / 2, tilesize / 2)) {
                    if (py + tilesize > y && oldY + tilesize <= y) {
                        this.vel = 0
                        this.y = bottom - y + tilesize
                    } else if (py < y + tilesize / 2 && oldY >= y + tilesize / 2) {
                        adjustedY = bottom - y - tilesize / 2
                    }
                }
            }
            if (this.y < ceil && adjustedY == ceil) {
                this.vel = Math.min(terminal, this.vel + gravity)
                this.jumped = true
            } else {
                this.y = adjustedY
                this.vel = 0
                this.jumped = false
            }
            this.render()
            if (this.x >= cvs.width + 200) {
                gameOver(true)
            }
        } else {
            const [_, oldY] = this.getEffectivePosition()
            const ceil = (gridHeight - 1) * tilesize
            this.y += this.vel
            if (this.y >= ceil) {
                this.vel = 0
            }
            this.y = Math.min(ceil, this.y)
            let adjustedY = 0
            const tiles = this.getNearbyTiles()
            for (let t of tiles) {
                const [x, y] = t.getEffectivePosition()
                if (t.type != "block" && t.type != "platform") {continue}
                const [px, py] = this.getEffectivePosition()
                if (t.type == "block" && t.collidesWithPlayer()) {
                    if (py + tilesize > y && oldY + tilesize <= y) {
                        adjustedY = bottom - y + tilesize
                    } else if (py < y + tilesize && oldY >= y + tilesize) {
                        this.vel = 0
                        this.y = bottom - y - tilesize
                    }
                } else if (t.type == "platform" && t.collidesWithPlayer(tilesize, tilesize / 2, tilesize / 2)) {
                    if (py + tilesize > y && oldY + tilesize <= y) {
                        adjustedY = bottom - y + tilesize
                    } else if (py < y + tilesize / 2 && oldY >= y + tilesize / 2) {
                        this.vel = 0
                        this.y = bottom - y - tilesize / 2
                    }
                }
            }
            if (this.y > 0 && !adjustedY) {
                this.vel = Math.max(-terminal, this.vel - gravity)
                this.jumped = true
            } else {
                this.y = adjustedY
                this.vel = 0
                this.jumped = false
            }
            this.render()
        }
        render() {
        const [x, y] = this.getEffectivePosition()
        ctx.fillStyle = "rgb(0, 20, 140)"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 4
        ctx.fillRect(x, y, tilesize, tilesize)
        ctx.strokeRect(x, y, tilesize, tilesize)
    }


    }

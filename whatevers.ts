// "Any application that can be written in Javascript, will eventually be written in Javascript" - Artwood's Law.

type Damage = {min: number, max: number};

const rollD6 = (): number => { return Math.floor(Math.random() * 6) + 1; }

abstract class Creature {

    public isAlive = true;

    private _hp!: number;

    public get hp(): number {
        return this._hp;
    }

    public set hp(value: number) {
        if (value <= 0) {
            this.isAlive = false;
            this._hp = 0;
            return;
        }
        if (value > this._maxHp) {
            this._hp = this.maxHp;
            return;
        }
        this._hp = value;
    }

    private _maxHp!: number;

    public get maxHp(): number {
        return this._maxHp;
    }

    public set maxHp(value: number) {
        if (value < 0) {
            throw new RangeError("Max HP cannot be negative");
        }
        this._maxHp = value;
        this.hp = this.maxHp;
    }

    private _atk!: number;

    public get atk(): number {
        return this._atk;
    }

    public set atk(value: number) {
        if (value > this._atkBounds.upper || value < this._atkBounds.lower) {
            throw new RangeError("Attack parameter is out of bounds");
        }
        this._atk = value;
    }

    private _def!: number;

    public get def(): number {
        return this._def;
    }

    public set def(value: number) {
        if (value > this._defBounds.upper || value < this._defBounds.lower) {
            throw new RangeError("Defense parameter is out of bounds");
        }
        this._def = value;
    }

    private _atkBounds = {lower: 1, upper: 30};
    private _defBounds = {lower: 1, upper: 30};

    private _damage!: Damage;

    public get damage(): Damage {
        return this._damage;
    }

    public set damage(value: Damage) {
        if (value.min > value.max) {
            throw new RangeError("Minimum damage value is greater than the maximum");
        }
        this._damage = value;
    }

    private successfulRollThreshold = 5;

    constructor(maxHp: number, atk: number, def: number, damage: Damage) {

        // I'll assume that args are integers. Moral of the story is to not use JS.

        this.maxHp = maxHp;
        this.hp = this.maxHp;

        this.atk = atk;
        this.def = def;

        this.damage = damage;

    }

    public clash(opponent: Creature): void {
        let atkModifier = this.atk - opponent.def + 1;
        let atkRolls = Array.from({length: atkModifier}, () => { return rollD6(); });
        let isSuccessful = atkRolls.filter((e: number) => { return e >= this.successfulRollThreshold; }).length > 0 ? true : false;
        if (!isSuccessful) { return; }
        let damageValue = Math.floor(Math.random() * (this.damage.max - this.damage.min + 1)) + this.damage.min;
        opponent.takeDamage(damageValue);
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
    }
}

class Monster extends Creature {}

class Player extends Creature {
    
    private healsLeft = 4;
    private healModififer = 0.3;

    public restoreHp(): void {
        if (this.healsLeft > 0) {
            this.hp += this.maxHp * this.healModififer;
            this.healsLeft--;
        }
    }
}

function main(): void {

    // I am not writing tests. It seems to work and that's enough for a toy project for me.

    let player = new Player(100, 10, 10, {min: 1, max: 20});
    let enemy = new Monster(120, 20, 5, {min: 1, max: 15});
    player.clash(enemy);

    console.log(enemy.hp);
}

main();
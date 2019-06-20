"use strict";

const view = {
    displayMessage: function (msg) {
        const messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },

    displayHit: function (location) {
        const cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },

    displayMiss: function (location) {
        const cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    },

    clearBoard: function () {
        const hits = document.getElementsByClassName("hit");
        const misses = document.getElementsByClassName("miss");
        const messageArea = document.getElementById("messageArea");

        removeClass(hits, "hit");
        removeClass(misses, "miss");
        messageArea.innerHTML = "";
    }

};

const model = {
    boardSize: 7,
    numShips: 7,
    shipsSunk: 0,
    ships: [

                {
                    locations: [0, 0, 0, 0],
                    hits: ["", "", "", ""],
                    length: 4
                },
                {
                    locations: [0, 0, 0],
                    hits: ["", "", ""],
                    length: 3
                },
                {
                    locations: [0, 0],
                    hits: ["", ""],
                    length: 2
                },
                {
                    locations: [0, 0],
                    hits: ["", ""],
                    length: 2
                },
                {
                    locations: [0],
                    hits: [""],
                    length: 1
                },
                {
                    locations: [0],
                    hits: [""],
                    length: 1
                },
                {
                    locations: [0],
                    hits: [""],
                    length: 1
                }
            ],

    fire: function (guess) {
        for (let i = 0; i < this.numShips; i++) {
            const ship = this.ships[i];
            const index = ship.locations.indexOf(guess);

            if (ship.hits[index] === "hit") {
                view.displayMessage("Oooops, you have already found this field before.");
                return true;
            } else if (index >= 0) {
                ship.hits[index] = "hit";
                view.displayHit(guess);
                view.displayMessage("HIT!");

                if (this.isSunk(ship)) {
                    view.displayMessage("HIT AND SINK!");
                    this.shipsSunk++;
                }
                return true;
            }
        }

        view.displayMiss(guess);
        view.displayMessage("MISS.");
        return false;
    },

    isSunk: function (ship) {
        return ship.hits.every((v) => v === "hit");
    },

    generateShipLocations: function () {
        let locations;
        for (let i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip(i);
            } while (this.collision(locations));
            this.ships[i].locations = locations;
        }
        console.log("Tablica okrętów:");
        console.log(this.ships);
    },

    generateShip: function (shipNumber) {
        const shipLength = this.ships[shipNumber].length;
        const direction = Math.floor(Math.random() * 2);
        let row, col;
        if (direction === 1) {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - shipLength));
        } else {
            row = Math.floor(Math.random()* (this.boardSize - shipLength));
            col = Math.floor(Math.random()* this.boardSize);
        }

        const newShipLocation = [];

        for (let i = 0; i < shipLength; i++) {
            if (direction === 1) {
                newShipLocation.push(row + "" + (col + i));
            } else {
                newShipLocation.push((row + i) + "" + col);
            }
        }
        return newShipLocation;
    },

    collision: function (locations) {
        for (let i = 0; i < this.numShips; i++) {
            const ship = this.ships[i];
            for (let j = 0; j < locations.length; j++) {
                if ((ship.locations.indexOf(locations[j]) >= 0) || this.checkNeighborhood(locations, ship)) {
                    return true;
                }
            }
        }
        return false;
    },

    checkNeighborhood: function (locations, ship) {
        const locNum = locations.map(Number);
        const shipLocNum = ship.locations.map(Number);

        for (let i = 0; i < ship.length; i++) {
            if ((locNum.indexOf(shipLocNum[i] - 1) >= 0) ||
                (locNum.indexOf(shipLocNum[i] + 1) >= 0) ||
                (locNum.indexOf(shipLocNum[i] - 10) >= 0) ||
                (locNum.indexOf(shipLocNum[i] + 10) >= 0)) {
                return true;
            }
        }
        return false;
    },

    clearShips: function () {
        for (let i = 0; i < this.numShips; i++) {
            const ship = this.ships[i];

            for (let j = 0; j < ship.length; j++) {
                ship.locations[j] = 0;
                ship.hits[j] = "";
            }
        }
        this.shipsSunk = 0;
    }
};

const controller = {
    guesses: 0,

    processGuess: function (guess) {
        const location = this.parseGuess(guess);

        if (location) {
            this.guesses++;
            const hit = model.fire(location);
            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage("All the ships were sunk in " + this.guesses + " guesses.");
                alert("Congratulations, you sank all ships in " + this.guesses + " moves. Click ok and play again.");
                view.clearBoard();
                model.clearShips();
                model.generateShipLocations();
            }
        }
    },

    parseGuess: function(guess) {
        if (guess === null || guess.length !== 2) {
            alert("Please enter the correct coordinates.")
        } else {
            const row = guess[0];
            const column = guess[1];

            if (isNaN(row) || isNaN(column)) {
                alert("Bad coordinates given.");
            } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
                alert("Field outside the board");
            } else {
                return row + column;
            }
        }
        return null;
    }

};



function init() {
    const clickedCells = document.getElementsByClassName("boardCell");
    getId(clickedCells);
    model.generateShipLocations();
}


function removeClass (obj, name) {
    while (obj.length) {
        obj[0].className = obj[0].classList.remove(name);
    }
}

function getId (cells) {
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.onclick = () => {
            const id = cell.getAttribute("id");
            controller.processGuess(id);
        };
    }
}

window.onload = init;
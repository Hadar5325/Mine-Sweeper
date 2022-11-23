'use strict'

var gBoard
var gLevel
var gGame
var size = 4
const EMPTY = '❤'
const MINE = '💥'

function initGame() {
    //model
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = { SIZE: 4, MINES: 2 }
    gBoard = buildBoard()
    putOnBoardRanomMines()

    console.log(gBoard)
    // dom
    renderBoard()

    // see how many negs to each cell
    // allMineNegsInBoard()

    getRandomLocationsForAllMine()
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell

            // if (i === 2 && j === 2) {
            //     board[i][j].isMine = true
            //     board[i][j].isShown = true
            // }
            // if (i === 0 && j === 0) {
            //     board[i][j].isMine = true
            //     board[i][j].isShown = true
            // }
            // }
        }
    }
    return board
}

function expandShown(mat,elCell, cellI, cellJ){
    if(elCell.minesAroundCount===0){
        var negsToExpandShown = []
        negsToExpandShown = countNegsExpandShown(mat,cellI, cellJ)
        console.log(negsToExpandShown)
    }
}

function countNegsExpandShown(mat, cellI, cellJ) {
    var negsCount = []
    var counter = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            negsCount[counter] = {i:i, j:j}
            counter++
      }
    }
    return negsCount
}

function putOnBoardRanomMines(){
    var locations = getRandomLocationsForAllMine()
    for(var i=0;i<locations.length; i++){
        gBoard[locations[i].i][locations[i].j].isMine = 'true'
    }
}

// For cell of type SEAT add seat class
// var className = ''
// if (cell.isSeat) className = 'seat'
// if (cell.isBooked) className += ' booked'

function renderBoard() {
    var elTable = document.querySelector('table')
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            var numToShow = 'number'
            var classNameMine = ''
            var classNameisShown = ''
            var showInCell = ''
            var cellData = `data-i=${i} data-j=${j}`
            if (cell.isMine) classNameMine = 'mine'
            if (cell.isShown) {
                classNameisShown = 'isShown'
                showInCell = MINE
            }
            strHTML += `<td class="cell ${classNameMine} ${classNameisShown}" ${cellData} onclick="cellClicked(this, ${i}, ${j})">${showInCell}${numToShow}</td>`
        }
        strHTML += `</tr>`
    }
    elTable.innerHTML = strHTML
}

function allMineNegsInBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currMinesArounCount = countNegs(gBoard, i, j)
            gBoard[i][j].minesAroundCount = currMinesArounCount
        }
    }
    console.log(gBoard)
    renderBoard()
}


function cellClicked(elCell, cellI, cellJ) {
    setMinesNegsCount(elCell, cellI, cellJ)
    expandShown(gBoard,elCell, cellI, cellJ)
}


function setMinesNegsCount(elCell, cellI, cellJ) {
    var minesNegsCount = countNegs(gBoard, cellI, cellJ)

    // set the number of negs of clicked cell
    //update model
    gBoard[cellI][cellJ].minesAroundCount = minesNegsCount

    // //update dom
    elCell.minesAroundCount = minesNegsCount
    if (elCell.classList.contains('isShown')) {
        elCell.innerText = MINE
        elCell.innerText += minesNegsCount
    } else elCell.innerText = minesNegsCount
}



function countNegs(mat, cellI, cellJ) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function getRandomLocationsForAllMine() {
    var emptyLocations = []
    var minesLocations = []

    getEmptyMat(emptyLocations)
    var numOfRandomMines = gLevel.MINES
    while(numOfRandomMines){
        var randRow = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var randCol = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if(!emptyLocations[randRow][randCol]){
            emptyLocations[randRow][randCol] = 1
            numOfRandomMines--
            var location = {i:randRow, j:randCol}
            minesLocations.push(location)
        }
    }
    return minesLocations
}


function getEmptyMat(emptyLocations) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        emptyLocations[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            emptyLocations[i][j] = null
        }
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
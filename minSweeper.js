'use strict'

var gBoard
var gLevel
var gGame
const EMPTY = '❤'
const MINE = '💥'

var gOptLevels = [
    { SIZE: 4, MINES: 2 },
    { SIZE: 8, MINES: 14 },
    { SIZE: 12, MINES: 32 }
]

addEventListener('contextmenu', (event) => {
    event.preventDefault();
    return false;
}, false);

function initGame() {
    //model
    gLevel = { SIZE: 4, MINES: 2 }
    startGame()
}

function startGame() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        numInterval :null,
        numOfLives: 3,
        isFirstClickedLeft: true,
        posOfUserMines: [],
        posOfModelMines: '',
        numOfSafeClick: 3,
        isRightClickFirstClicked: true,
        isAbleToClickSafeAgain: true
    }
    resetGameLivesInNewLevel()
    announceNewGame()
    newSafeButtons()
    gBoard = buildBoard()
    gGame.posOfModelMines = putOnBoardRanomMines()
    console.log(gGame.numInterval)
    if(gGame.numInterval === null) {
        clearInterval(gGame.numInterval)
        gGame.numInterval = null
        console.log(gGame.numInterval)
    }
    countTime() 
    // dom
    renderBoard()
}
function countTime(){
    var elTimer = document.querySelector('.timer')
    gGame.numInterval = setInterval(() => {
        elTimer.innerHTML = `timer: ${gGame.secsPassed++}`
        // gGame.secsPassed;
    },1000
  );
}

function announceNewGame() {
    var elGameOver = document.querySelector(`.game-over`)
    elGameOver.innerText = ''
    var elSmiley = document.querySelector(`.smiley`)
    elSmiley.src = 'smileyNormal.png'
}

function onWhichLevel(elBtn) {
    if (elBtn.classList.contains('begginer')) {
        gLevel.SIZE = gOptLevels[0].SIZE
        gLevel.MINES = gOptLevels[0].MINES
    } else if (elBtn.classList.contains('medium')) {
        gLevel.SIZE = gOptLevels[1].SIZE
        gLevel.MINES = gOptLevels[1].MINES
    } else {
        gLevel.SIZE = gOptLevels[2].SIZE
        gLevel.MINES = gOptLevels[2].MINES
    }
    startGame()
}

// add lifes in general with live1,2,3 
function resetGameLivesInNewLevel() {
    for (var i = 1; i <= 3; i++) {
        var elLife = document.querySelector(`.lives-idx${i}`)
        var elHeart = elLife.querySelector(`.heart`)
        var resContains = elLife.classList.contains(`live${i}`)
        if (!resContains) {
            elLife.classList.add(`live${i}`)
            elHeart.style.display = 'block'
        }
    }
    // model
    gGame.numOfLives = 3
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
        }
    }
    return board
}

function expandShown(mat, cellI, cellJ) {
    // model 
    if (mat[cellI][cellJ].minesAroundCount !== 0) return
    var negsToExpandShown = []
    negsToExpandShown = allPosNearCellWithZeroMine(mat, cellI, cellJ)
    var lengthNegs = negsToExpandShown.length

    // update model
    for (var i = 0; i < lengthNegs; i++) {
        var row = negsToExpandShown[i].i
        var col = negsToExpandShown[i].j
        var currNegPos = gBoard[row][col]
        if (currNegPos.isShown || currNegPos.isMarked) continue

        var currMinesNegsCount = counterMinesNegs(gBoard, row, col)
        currNegPos.minesAroundCount = currMinesNegsCount
        currNegPos.isShown = true
        gGame.shownCount++

        // update dom
        var pos = { row, col }
        renderCell(pos, 'isShown', currMinesNegsCount, true)

        if (currNegPos.minesAroundCount === 0) expandShown(mat, row, col)
    }
}

function renderCell(pos, value, currMinesNegsCount, isInnerTextReq) {
    const elCell = document.querySelector(`.cell-${pos.row}-${pos.col}`);
    if (elCell.classList.contains(value)) elCell.classList.remove(value);
    else elCell.classList.add(value);
    if (isInnerTextReq) elCell.innerText = currMinesNegsCount
}


function counterMinesNegs(mat, cellI, cellJ) {
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

function allPosNearCellWithZeroMine(mat, cellI, cellJ) {
    var negsCount = []
    var counter = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            negsCount[counter] = { i: i, j: j }
            counter++
        }
    }
    return negsCount
}

function gameIsOver(isUserWinner) {
    clearInterval(gGame.numInterval)
    var elGameOver = document.querySelector(`.game-over`)
    var elSmiley = document.querySelector(`.smiley`)

    if (isUserWinner) {
        elGameOver.innerText = 'Game is over, you Win! :)'
        elSmiley.src = 'smileyWin.png'
    } else {
        elGameOver.innerText = 'Game is over, try again!'
        elSmiley.src = 'smileyLose.webp'
        gameOverShowingAllMines()
    }
    gGame.isOn = false
}

function gameOverShowingAllMines(){
    console.log(gGame.posOfModelMines)
    for(var i=0; i<gGame.posOfModelMines.length; i++){
        var row = gGame.posOfModelMines[i].i
        var col = gGame.posOfModelMines[i].j
        const elCell = document.querySelector(`.cell-${row}-${col}`);
        elCell.classList.add('isMine')
        elCell.innerText = MINE
    }
}

function renderBoard() {
    var elTable = document.querySelector('table')
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            var classNameMine = ''
            var classNameisShown = ''

            const cellData = `cell-${i}-${j}`;
            // if (cell.isMine) classNameMine = 'isMine'
            if (cell.isShown) {
                classNameisShown = 'isShown'
            }
            strHTML += `<td class="cell ${cellData} ${classNameMine} ${classNameisShown}" onmousedown=onMouseClicked(event,${i},${j})></td>`
        }
        strHTML += `</tr>`
    }
    elTable.innerHTML = strHTML
}

function makeSureFirstClickIsNotMine(i, j) {
    while (gBoard[i][j].isMine) startGame()
}


function onMouseClicked(event, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (event.button === 2 && gGame.isRightClickFirstClicked) return
    if (gGame.isFirstClickedLeft) {
        makeSureFirstClickIsNotMine(i, j)
        gGame.isFirstClickedLeft = false
        gGame.isRightClickFirstClicked = false
    }

    // left click mouse
    if (event.button === 0) {
        onLeftCellClicked(i, j)
        // right click mouse
    } else if (event.button === 2) {
        // make sure the first click is left
        onRightCellClick(i, j)
    }
}

function onLeftCellClicked(cellI, cellJ) {
    const elCell = document.querySelector(`.cell-${cellI}-${cellJ}`);
    if(elCell.classList.contains('isMine')) return
    if (gBoard[cellI][cellJ].isMine) {
        reduceLife()
        var elSmiley = document.querySelector(`.smiley`)
        elSmiley.src = 'smileyLose.png'
        gGame.posOfUserMines.push({ cellI, cellJ })
        elCell.classList.add('isMine')
        elCell.innerText = MINE
        checkGameOver()
        return
    }
    var elSmiley = document.querySelector(`.smiley`)
    elSmiley.src = 'smileyNormal.png'
    // update the current cell
    setMinesNegsCount(elCell, cellI, cellJ)
    // update the negs around elCell
    expandShown(gBoard, cellI, cellJ)
    checkGameOver()
}

function reduceLife() {
    // model
    gGame.numOfLives--
    if (gGame.numOfLives === 0) {
        gameIsOver()
    }
    var numOfLifeRemain = gGame.numOfLives
    var elLife = document.querySelector(`.live${numOfLifeRemain + 1}`)
    var elHeart = elLife.querySelector(`.heart`)
    //dom
    elLife.classList.remove(`live${numOfLifeRemain + 1}`);
    elHeart.style.display = 'none'
}


function onRightCellClick(i, j) {
    var pos = { row: i, col: j }
    var currCell = gBoard[i][j]
    if (gGame.markedCount >= gLevel.MINES && !currCell.isMarked) return
    currCell.isMarked = (currCell.isMarked) ? "" : true
    if (currCell.isMarked) {

        gGame.markedCount++
    } else gGame.markedCount--

    // update dom
    renderCell(pos, 'isMarked', '', false)
    checkGameOver()
}


function checkGameOver() {
    var numOfWrongchoosenMins = 3 - gGame.numOfLives
    var cellLeftToOpen = Math.pow(gLevel.SIZE, 2) - gLevel.MINES
    // if all not marked cell are opened
    if ((gGame.numOfLives >= 0)
        && ((gGame.markedCount === gLevel.MINES)
            || (numOfWrongchoosenMins === gLevel.MINES))
        && (gGame.shownCount === cellLeftToOpen)) {
            gameIsOver(true)
            gameOverShowingAllMines()
            gGame.isOn = false
    }
}

function allMineNegsInBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currMinesArounCount = counterMinesNegs(gBoard, i, j)
            gBoard[i][j].minesAroundCount = currMinesArounCount
        }
    }
    renderBoard()
}

function setMinesNegsCount(elCell, cellI, cellJ) {
    var minesNegsCount = counterMinesNegs(gBoard, cellI, cellJ)
    // set the number of negs of clicked cell
    //update model
    var currPos = gBoard[cellI][cellJ]
    currPos.minesAroundCount = minesNegsCount
    currPos.isShown = true
    gGame.shownCount++

    if (currPos.isMarked) {
        //document
        gGame.markedCount--
        currPos.isMarked = false

        //dom
        renderCell({ row: cellI, col: cellJ }, 'isMarked', '', false)

    }
    //update dom
    elCell.innerText = minesNegsCount
    elCell.classList.add('isShown')
}

function putOnBoardRanomMines() {
    var locations = getRandomLocationsForAllMine()
    for (var i = 0; i < locations.length; i++) {
        gBoard[locations[i].i][locations[i].j].isMine = true
    }
    return locations
}

function getRandomLocationsForAllMine() {
    var emptyLocations = []
    var minesLocations = []

    getEmptyMat(emptyLocations)
    var numOfRandomMines = gLevel.MINES
    while (numOfRandomMines) {
        var randRow = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var randCol = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (!emptyLocations[randRow][randCol]) {
            emptyLocations[randRow][randCol] = 1
            numOfRandomMines--
            var location = { i: randRow, j: randCol }
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

function onSafeClick() {
    if (!gGame.isOn) return
    if (!gGame.isAbleToClickSafeAgain) return
    var elSafe = document.querySelector(`.safe${gGame.numOfSafeClick}`)
    findRandomCoveredCellWithoutMine()
    elSafe.style.display = 'none'
    gGame.numOfSafeClick--
}

function newSafeButtons() {
    for (var i = 1; i <= 3; i++) {
        var elSafe = document.querySelector(`.safe${i}`)
        elSafe.style.display = 'block'
    }
}


function findRandomCoveredCellWithoutMine() {
    var coverdCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isShown &&
                !gBoard[i][j].isMine &&
                !gBoard[i][j].isMarked) {
                coverdCells.push({ i, j })
            }
        }
    }
    if (coverdCells.length === 0) return
    var randNumIdx = getRandomIntInclusive(0, coverdCells.length)
    var safePos = coverdCells[randNumIdx]
    gBoard[safePos.i][safePos.j].isShown = true

    // dom
    const elCell = document.querySelector(`.cell-${safePos.i}-${safePos.j}`);
    elCell.classList.add('safe-click')
    elCell.classList.add('isShown')
    gGame.isAbleToClickSafeAgain = false
    setTimeout(() => {
        gBoard[safePos.i][safePos.j].isShown = false
        elCell.classList.remove('safe-click')
        elCell.classList.remove('isShown')
        gGame.isAbleToClickSafeAgain = true
    }, 2000)
}


// function sevenBoom(){
//     var locations = locate7BoomsMines()
// }

// function locate7BoomsMines(){
//     var posForMines = []
//     for(var i=1; i<Math.pow(gLevel.SIZE,2); i++){
//         if(i%7===0) posForMines.push(i)
//         else if(Math.floor(i%10) === 7)   posForMines.push(i)
//     }
//     return posForMines
// }

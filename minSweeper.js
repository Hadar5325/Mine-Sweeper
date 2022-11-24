'use strict'

var gBoard
var gLevel
var gGame
const EMPTY = '❤'
const MINE = '💥'
var optLevels =[
    { SIZE: 4, MINES: 2 },
    { SIZE : 8, MINES : 14},
    { SIZE : 12, MINES : 32}
]
function initGame() {
    //model
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = { SIZE: 4, MINES: 2 }
    startGame()
}

function startGame(){
    gBoard = buildBoard()
    putOnBoardRanomMines()
    console.log(gBoard)
    // dom
    renderBoard()
    // see how many negs to each cell
    // allMineNegsInBoard()
    var randLocationsForMines = getRandomLocationsForAllMine()
    allCellAreShownExceptMinesCells()
}

function onWhichLevel(elBtn){
    if(elBtn.classList.contains('begginer')){
        gLevel.SIZE = optLevels[0].SIZE
        gLevel.MINES = optLevels[0].MINES
    }else if(elBtn.classList.contains('medium')){
        gLevel.SIZE = optLevels[1].SIZE
        gLevel.MINES = optLevels[1].MINES
    }else{
        gLevel.SIZE = optLevels[2].SIZE
        gLevel.MINES = optLevels[2].MINES
    }
    startGame()
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

function expandShown(mat, elCell, cellI, cellJ) {
    // model
    if(mat[cellI][cellJ].minesAroundCount === 0){
        var negsToExpandShown = []
        negsToExpandShown = allPosNearCellWithZeroMine(mat, cellI, cellJ)
        var lengthNegs = negsToExpandShown.length

        for (var i = 0; i < lengthNegs; i++) {
        
            // update model
            var row = negsToExpandShown[i].i
            var col = negsToExpandShown[i].j

            var currMinesNegsCount = counterMinesNegs(gBoard, row, col)
            gBoard[row][col].minesAroundCount = currMinesNegsCount
            gBoard[row][col].isShown = true

            // update dom
            var pos = { row, col }
            renderCell(pos, 'isShown', currMinesNegsCount)
        }
    }
}

function renderCell(pos, value,currMinesNegsCount) {
    const elCell = document.querySelector(`.cell-${pos.row}-${pos.col}`);
    elCell.classList.add(value);
    elCell.innerText = currMinesNegsCount
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

function putOnBoardRanomMines() {
    var locations = getRandomLocationsForAllMine()
    for (var i = 0; i < locations.length; i++) {
        gBoard[locations[i].i][locations[i].j].isMine = 'true'
    }
}

// function startGame(){

// }

// send to sort 
//objs.sort((a,b) => a.last_nom - b.last_nom);


//user mines = [ {i:5,j:0},{i:3,j:0} ]
//real mines = [ {i:3,j:0},{i:0,j:0} ]
function checkGameOver(numOfMines, positionAllMine, userMines, modelMines){
    // the user didn't check the same amount of mines

    if(gLevel.MINES !== userMines.length) return
    var locationModelMines = getRandomLocationsForAllMine()
    var sameMine = allMinesAreMarked(userMines, locationModelMines)

    // if they don't have the same mines -> return
    if(!sameMine) return false
    var resShown = allCellAreShownExceptMinesCells()
    if(!resShown) return false
    
    console.log("you win!")
    return true
}

function allCellAreShownExceptMinesCells(){
    // if they have the same mines, check if all cell are shown
    var countCellShown = 0
    var powLevel = Math.pow(gLevel.SIZE,2)
    var numRequireShown = powLevel - gLevel.MINES

    for(var i=0; i<gLevel.SIZE; i++){
        for(var j=0 ; j<gLevel.SIZE; j++){
            if(gBoard[i][j].isShown) countCellShown++
        }
    }
    var res =(countCellShown === numRequireShown) ? true:false
    return res
}

function allMinesAreMarked(userMines, modelMines){
    var counter = 0
    for(var i=0; i<modelMines.length; i++){
        for(var j=0; j<modelMines.length; j++){
            if(modelMines[i].i === userMines[j].i &&
                modelMines[i].j === userMines[j].j)counter++
        }
    }
    var res = (counter === modelMines.length) ? true: false
    return res 

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
            var classNameMine = ''
            var classNameisShown = ''
            // var showInCell = ''

            const cellData = `cell-${i}-${j}`;
            if (cell.isMine) classNameMine = 'mine'
            if (cell.isShown) {
                classNameisShown = 'isShown'
                // showInCell = MINE
            }
            strHTML += `<td class="cell ${cellData} ${classNameMine} ${classNameisShown}" onmousedown="WhichButton(event,${i},${j})" onclick="cellClicked(this, ${i}, ${j})"></td>`
        }
        strHTML += `</tr>`
        // oncontextmenu
        //oncontextmenu="javascript:alert('success!');return false;"
    }
    elTable.innerHTML = strHTML
}
function WhichButton(event,i,j) {
    var pos= {row:i, col:j}
    // 2 = The right mouse button
    if(event.button === 2) {
        event.preventDefault();
        // return false;
        // update model
        gBoard[i][j].isMarked = true
        // update dom
        renderCell(pos, 'isMarked')
    } return false            
}

function allMineNegsInBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currMinesArounCount = counterMinesNegs(gBoard, i, j)
            gBoard[i][j].minesAroundCount = currMinesArounCount
        }
    }
    console.log(gBoard)
    renderBoard()
}


function cellClicked(elCell, cellI, cellJ) {
    // update the current cell
    setMinesNegsCount(elCell, cellI, cellJ)
    // update the negs around elCell
    expandShown(gBoard, elCell, cellI, cellJ)
}


function setMinesNegsCount(elCell, cellI, cellJ) {
    var minesNegsCount = counterMinesNegs(gBoard, cellI, cellJ)
    // set the number of negs of clicked cell
    //update model
    gBoard[cellI][cellJ].minesAroundCount = minesNegsCount
    gBoard[cellI][cellJ].isShown = true
    
    
    //update dom
    elCell.innerText = minesNegsCount
    elCell.classList.add('isShown')
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

// <div oncontextmenu="javascript:alert('success!');return false;">
// Lorem Ipsum
// </div>

// function rightClickFunc(){
//     addEventListener('contextmenu', (event) => {    
//         event.preventDefault();
//         alert('success!');
//         return false;
//     }, false);
// }

// function hi() {
   

//     event.addEventListener('contextmenu', function (ev) {
//         ev.preventDefault();
//         alert('success!');
//         return false;
//     }, false);
// }
// function oncontextmenu() {
//     el.addEventListener('contextmenu', function (ev) {
//         ev.preventDefault();
//         alert('success!');
//         return false;
//     }, false);
// }

//onmousedown="cellMarked()"

// checks 

    // // for check
    // var userMines = [ {i:0,j:0},{i:3,j:0} ]
    // var realMines = [ {i:3,j:0},{i:0,j:0} ]
    // allMinesAreMarked(userMines, realMines)
    // for check 
    // allCellAreShownExceptMinesCells()
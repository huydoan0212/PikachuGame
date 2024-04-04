let boardWidth = 14; // Chiều rộng của bàn cờ (số ô trong một hàng)
let boardHeight = 12;// Chiều cao của bàn cờ (số ô trong một cột)
let colCell = boardWidth - 2; // Số cột cho các ô (tính toán từ boardWidth)
let rowCell = boardHeight - 2; // Số hàng cho các ô (tính toán từ boardHeight)
let cellSize = 45; //Kích thước của mỗi ô theo pixel
let cellNum = colCell * rowCell; //Tổng số ô (tính toán từ colCell và rowCell)
let typeNum = 20; // Số lượng kiểu biểu tượng (hình ảnh) khác nhau trong trò chơi
let numEachType = 6; // Số lượng của mỗi kiểu biểu tượng được tạo ra
const gameTime = 300; // Giới hạn thời gian cho trò chơi trong giây
let info = document.getElementById("info");
let board = document.getElementById("game-board"); //Tham chiếu đến phần tử HTML có ID "game-board"
let myCanvas = ""; //  Tham chiếu đến phần tử canvas được tạo để vẽ trò chơi
let ctx = ''; //Bối cảnh của phần tử canvas cho các thao tác vẽ
let checkTypeNum = [];// Mảng để theo dõi số lượng của mỗi kiểu biểu tượng được sử dụng (khởi tạo bằng số 0)
let cells = []; //Mảng chứa thông tin về mỗi ô, bao gồm ID, giá trị (kiểu biểu tượng), tọa độ x và y, chiều rộng, chiều cao, tọa độ tâm và tham chiếu đến phần tử HTML tương ứng cho ô
let gameScore = 0; //Điểm hiện tại của người chơi
let isSelecting = 0;//Cờ để chỉ ra người chơi hiện đang chọn ô hay không (0 - không chọn, 1 - chọn một ô, 2 - chọn hai ô)
let timeLeft = 10;//Thời gian còn lại tính bằng giây
let isWin = false;//Cờ để chỉ ra người chơi đã chiến thắng trò chơi hay chưa

window.addEventListener("dblclick", (event) => {
    event.preventDefault();
})

for (let i = 0; i <= typeNum; i++) {
    checkTypeNum.push(0);
}

//Tạo ngẫu nhiên 1 số nằm giữa min và max
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLineFromXtoY(x1, y1, x2, y2, ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

//Tạo giá trị random cho ô
function createRandomValueForCell() {
    let t = Math.floor(Math.random() * typeNum) + 1;
    while (checkTypeNum[t] >= numEachType) {
        t = Math.floor(Math.random() * typeNum) + 1;
    }
    checkTypeNum[t] += 1;
    return t;
}

//Tạo đối tượng cell và các thuộc tính của cell
function cell(id, value, x, y) {
    this.id = id;
    this.value = value;
    this.x = x; // Chỉ số của cột
    this.y = y; // Chỉ số của dòng
    this.width = cellSize;
    this.height = cellSize;
    this.centerX = (this.x) + (this.width) / 2;
    this.centerY = (this.y) + (this.height) / 2;
    this.isSelected = false;
    this.image = document.createElement("div");
    this.image.setAttribute("class", "cell");
    this.image.setAttribute("id", this.id + "");
    this.draw = function () {
        if (this.value !== 0) {
            this.image.innerHTML = '<image src="image/pic' + this.value + '.png" alt="">';
        } else {
            if (this.id > boardWidth && this.id <= boardWidth * boardHeight - boardWidth && this.id % boardWidth !== 0 && (this.id + 1) % boardWidth !== 0) {
                this.image.style.border = "1px solid rgb(242, 142, 255)";
            } else {
                this.image.style.border = "none";
            }
            this.image.style.cursor = "auto";
            this.image.innerHTML = "";
            this.image.style.backgroundColor = "rgba(255, 255, 255, 0)";
        }
        board.appendChild(this.image);
    }

}


// Hàm swapCell để đổi chỗ các ô trong mảng cells
function swapCell() {
    // Duyệt qua từng ô trong mảng cells
    for (let i = 0; i < cells.length; i++) {
        // Kiểm tra nếu giá trị của ô không bằng 0
        if (cells[i].value !== 0) {
            // Tạo một chỉ số ngẫu nhiên trong phạm vi của mảng cells
            let index = getRndInteger(0, cells.length - 1);
            // Nếu ô tại vị trí ngẫu nhiên có giá trị bằng 0, tiếp tục tạo chỉ số ngẫu nhiên mới
            while (cells[index].value === 0) {
                index = getRndInteger(0, cells.length - 1);
            }
            // Lưu giá trị tạm thời của ô hiện tại
            let t = cells[i].value;
            // Đặt giá trị của ô hiện tại bằng giá trị của ô tại vị trí ngẫu nhiên
            cells[i].value = cell[index].value;
            // Đặt giá trị của ô tại vị trí ngẫu nhiên bằng giá trị tạm thời
            cell[index].value = t;
        }
    }
    // game();
}

// Hàm handleClick để xử lý sự kiện click
function handleClick(e) {
    // Kiểm tra nếu className của đối tượng được click chứa chuỗi " onSelect"
    if (this.className.indexOf(" onSelect") !== -1) {
        // Nếu có, thay thế chuỗi " onSelect" bằng chuỗi rỗng
        this.className = this.className.replace(" onSelect", "");
        // Đặt biến isSelecting về 0
        isSelecting = 0;
    } else {
        // Nếu không, tăng biến isSelecting lên 1
        isSelecting++;
        // Thêm chuỗi "onSelect" vào cuối className
        this.className += " onSelect";
    }
    game();
}

// Hàm addEventForCell để thêm và loại bỏ sự kiện click cho các ô trong mảng cells
function addEventForCell() {
    // Duyệt qua từng ô trong mảng cells, trừ các ô ở hàng đầu tiên và hàng cuối cùng
    for (let id = boardWidth; id < boardWidth * boardHeight - boardWidth; id++) {
        // Kiểm tra nếu ô đang xét nằm ở cột đầu tiên hoặc cột cuối cùng, hoặc giá trị của ô bằng 0
        if (id % boardWidth === 0 || (id + 1) % boardWidth === 0 || cells[id].value === 0) {
            // Nếu giá trị của ô bằng 0, loại bỏ sự kiện click cho ô đó
            if (cells[id].value === 0) {
                cells[id].image.removeEventListener("click", handleClick);
            }
        } else
            // Nếu giá trị của ô khác 0, thêm sự kiện click cho ô đó
        if (cells[id].value !== 0) {
            cells[id].image.addEventListener("click", handleClick);
        }
    }
}

// Hàm init để khởi tạo lại trò chơi
function init() {
    info.style.display = 'block';
    board.style.display = 'grid';
    // Đặt lại điểm số trò chơi, trạng thái đang chọn và thời gian còn lại
    gameScore = 0;
    isSelecting = 0;
    timeLeft = gameTime;
    // Tạo một canvas mới trong game board
    board.innerHTML = " <canvas id='myCanvas' width='630' height='540'></canvas>";
    // Đặt trạng thái thắng trò chơi là false
    isWin = false;
    // Lấy phần tử canvas và context 2D từ canvas
    myCanvas = document.getElementById("myCanvas");
    ctx = myCanvas.getContext("2d");
    // Đặt lại số lượng của từng loại pikachu
    for (let i = 0; i <= typeNum; i++) {
        checkTypeNum[i] = 0;
    }
    // Xóa mảng cells
    cells.splice(0, cells.length);
    // Tạo giá trị column để set style cho gameBoard thành gridTemplateColumns
    let temp = "";
    for (let i = 0; i < boardWidth; i++) {
        temp += cellSize + "px ";
    }
    board.style.gridTemplateColumns = temp;
    // Tạo giá trị row để set style cho gameBoard thành gridTemplateRows
    temp = "";
    for (let i = 0; i < boardHeight; i++) {
        temp += cellSize + "px ";
    }
    board.style.gridTemplateRows = temp;
    // Tạo giá trị cho từng ô, các dòng và cột viền có giá trị bằng 0
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            let id = j + i * boardWidth;
            let value = 0;
            if (i === 0 || i === boardHeight - 1 || j === 0 || j === boardWidth - 1) {
                value = 0;
            } else {
                value = createRandomValueForCell();
            }
            cells.push(new cell(id, value, cellSize * (j), cellSize * (i)));
        }
    }
    // Ẩn các phần tử game-over, win-game và reload
    document.getElementById("game-over").style.display = "none";
    document.getElementById("win-game").style.display = "none";
    document.getElementById("reload").style.display = "none";
    document.getElementById("level").style.display = "none";

    // Gọi hàm thêm sự kiện cho các ô có giá trị value khác 0
    addEventForCell();
    timeHandle();
    game();
}

// Hàm drawCells để vẽ các ô lên canvas sau một khoảng thời gian chờ
function drawCells() {
    // Sử dụng hàm setTimeout để chờ 300ms trước khi thực hiện các lệnh bên trong
    setTimeout(function () {
        // Đặt chiều rộng và chiều cao của canvas bằng chiều rộng và chiều cao của game board
        ctx.canvas.width = board.clientWidth;
        ctx.canvas.height = board.clientHeight;
        // Duyệt qua từng ô trong mảng cells và gọi hàm draw của mỗi ô
        for (let i = 0; i < cells.length; i++) {
            cells[i].draw();
        }
        // Đặt zIndex của canvas thành -1 để đảm bảo nó nằm dưới các phần tử khác
        myCanvas.style.zIndex = -1;
    }, 300);
}

function isPossibleToMoveLeft(row) {
    let index = 0;
    for (let i = 1; i < boardWidth - 1; i++) {
        if (cells[i + row * boardWidth].value === 0) {
            index = i;
            break;
        }
    }
    for (let i = 1; i < boardWidth - 1; i++) {
        if (cells[i + row * boardWidth].value !== 0 && i > index) {
            return true;
        }
    }
    return false;
}

function check0CellInRowLeft(start, row) {
    for (let i = start; i < boardWidth - 1; i++) {
        if (cells[row * boardWidth + i].value !== 0) {
            return i;
        }
    }
    return -1;
}

function swapCellX(k, index, row) {
    let tmp = cells[row * boardWidth + k];
    cells[row * boardWidth + k] = cells[row * boardWidth + index];
    cells[row * boardWidth + index] = tmp;
}

function reRender() {
    board.textContent = "";
    drawCells();

}

function flowToLeft() {
    for (let i = 1; i < boardHeight - 1; i++) {
        let row = i;
        let count = 0;
        for (let j = 1; j < boardWidth - 1; j++) {
            if (cells[i * boardWidth + j] === 0) {
                count++;
            }
        }
        if (count !== 0 && count !== boardWidth - 2) {
            // Tiếp tục thực hiện vòng lặp cho đến khi không thể di chuyển sang trái nữa
            while (isPossibleToMoveLeft(row)) {
                // Duyệt qua từng phần tử của hàng
                for (let k = 1; k < boardWidth - 1; k++) {
                    // Nếu phần tử bằng 0
                    if (cells[row * boardWidth + k].value === 0) {
                        // Kiểm tra xem có phần tử nào bằng 0 ở bên trái không
                        let index = check0CellInRowLeft(k, row);
                        // Nếu có, hoán đổi vị trí của phần tử đó với phần tử bằng 0
                        if (index !== 1) {
                            swapCellX(k, index, row)
                            break
                        }
                    }
                }
            }
        }
    }
    drawCells();
}


function showScore() {
    document.getElementById("score").innerHTML = "Score: " + gameScore;
}

// Hàm timeHandle để xử lý thời gian trong trò chơi
function timeHandle() {
    // Hiển thị thời gian còn lại lên màn hình
    document.getElementById("time").innerHTML = "Time: " + timeLeft;
    // Cài đặt hàm setInterval để thực hiện hàm bên trong sau mỗi 1000ms (1 giây)
    setInterval(() => {
        // Nếu thời gian còn lại bằng 0 thì hiển thị thông báo game over
        if (timeLeft == 0)
            document.getElementById("game-over").style.display = "block";
        // Cập nhật thời gian còn lại lên màn hình
        document.getElementById("time").innerHTML = "Time: " + timeLeft;
        // Nếu thời gian còn lại lớn hơn 0 và trò chơi chưa thắng thì giảm thời gian còn lại đi 1
        if (timeLeft > 0 && isWin === false)
            timeLeft -= 1;

    }, 1000);
}

function checkSelfChosen(id1, id2) {
    return id1 !== id2;
}

function checkValue(id1, id2) {
    return cells[id1].value === cells[id2].value;
}

// Hàm checkOneHorizontalLine để kiểm tra xem hai ô có nằm trên cùng một hàng không và vẽ đường nối giữa chúng nếu có
function checkOneHorizontalLine(id1, id2, drawable) {
    // Lấy tọa độ x,y của ô
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);
    // Đổi vị trí tọa độ, nếu x1 lớn hơn x2
    if (x1 > x2) {
        let t = x1;
        x1 = x2;
        x2 = t;
    }
    // Kiểm tra nếu 2 ô cùng hàng
    if (y1 === y2) {
        // Duyệt qua các ô từ x1 đến x2
        for (let i = x1 + 1; i < x2; i++) {
            // Nếu ô nào có giá trị khác 0 thì trả về false
            if (cells[i + y1 * boardWidth].value !== 0) {
                return false;
            }
        }
        // Nếu drawable là true, vẽ đường nối giữa hai ô và sau 300ms xóa đường vừa vẽ
        if (drawable) {
            drawLineFromXtoY(cells[id1].centerX, cells[id1].centerY, cells[id2].centerX, cells[id2].centerY, ctx);
            setTimeout(() => {
                ctx.clearRect(0, 0, 630, 540);
            }, 300);
        }
        // Trả về true nếu hai ô nằm trên cùng một hàng và không có ô nào khác ở giữa có giá trị khác 0
        return true;
    }
    // Trả về false nếu hai ô không nằm trên cùng một hàng
    return false;
}

// Hàm checkOneVerticalLine để kiểm tra xem hai ô có nằm trên cùng một cột không và vẽ đường nối giữa chúng nếu có
function checkOneVerticalLine(id1, id2, drawable) {
    // Lấy tọa độ x,y của ô
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);

    // Kiểm tra nếu 2 ô cùng cột
    if (x1 == x2) {
        // Đổi vị trí tọa độ, nếu y1 lớn hơn y2
        if (y1 > y2) {
            let t = y2;
            y2 = y2;
            y1 = t;
        }

        // Duyệt qua các ô từ y1 đến y2
        for (let i = y1 + 1; i < y2; i++) {
            // Nếu ô nào có giá trị khác 0 thì trả về false
            if (cells[x1 + i * boardWidth].value !== 0) {
                return false;
            }
        }

        // Nếu drawable là true, vẽ đường nối giữa hai ô và sau 300ms xóa đường vừa vẽ
        if (drawable) {
            drawLineFromXtoY(cells[id1].centerX, cells[id1].centerY, cells[id2].centerX, cells[id2].centerY, ctx);
            setTimeout(() => {
                ctx.clearRect(0, 0, 630, 540);
            }, 300);
        }
        // Trả về true nếu hai ô nằm trên cùng một cột và không có ô nào khác ở giữa có giá trị khác 0
        return true;
    }
    // Trả về false nếu hai ô không nằm trên cùng một cột
    return false;
}

function returnID(x, y) {
    return x + y * boardWidth;
}

// Hàm checkX để kiểm tra xem hai ô có nằm trên cùng một hàng không và không có ô nào khác ở giữa có giá trị khác 0
function checkX(id1, id2) {
    // Lấy tọa độ x,y của ô
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);

    // Kiểm tra nếu id1 bằng id2 thì trả về true
    if (id1 === id2) {
        return true;
    }
    // Đổi vị trí tọa độ, nếu x1 lớn hơn x2
    if (x1 > x2) {
        let t = x1;
        x1 = x2;
        x2 = t;
    }
    // Kiểm tra nếu 2 ô cùng hàng
    if (y1 === y2) {
        // Duyệt qua các ô từ x1 đến x2
        for (let i = x1 + 1; i < x2; i++) {
            // Nếu ô nào có giá trị khác 0 thì trả về false
            if (cells[i + y1 * boardWidth].value !== 0) {
                return false;
            }
        }
        // Nếu giá trị của ô id1 hoặc ô id2 bằng 0 thì trả về true
        if (cells[id1].value * cells[id2].value === 0) {
            return true;
        }
    }
    // Trả về false nếu hai ô không nằm trên cùng một hàng
    return false;
}

// Hàm checkY để kiểm tra xem hai ô có nằm trên cùng một cột không và không có ô nào khác ở giữa có giá trị khác 0
function checkY(id1, id2) {
    // Lấy tọa độ x,y của ô
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);

    // Kiểm tra nếu id1 bằng id2 thì trả về true
    if (id1 === id2) {
        return true;
    }
    // Kiểm tra nếu 2 ô cùng cột
    if (x1 === x2) {
        // Đổi vị trí tọa độ, nếu y1 lớn hơn y2
        if (y1 > y2) {
            let t = y2;
            y2 = y1;
            y1 = t;
        }

        // Duyệt qua các ô từ y1 đến y2
        for (let i = y1 + 1; i < y2; i++) {
            // Nếu ô nào có giá trị khác 0 thì trả về false
            if (cells[returnID(x1, i)].value !== 0) {
                return false;
            }
        }
        // Nếu giá trị của ô id1 hoặc ô id2 bằng 0 thì trả về true
        if (cells[id1].value * cells[id2].value === 0) {
            return true;
        }
    }
    // Trả về false nếu hai ô không nằm trên cùng một cột
    return false;
}

// Hàm checkInRect để kiểm tra xem có đường đi từ ô id1 đến ô id2 theo hình chữ nhật không và vẽ đường đi nếu có
function checkInRect(id1, id2, drawable) {
    // Lấy tọa độ x,y của ô
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);
    let leftX = x1;
    let leftY = y1;
    let rightX = x2;
    let rightY = y2;

    // Đổi vị trí tọa độ, nếu x1 lớn hơn x2
    if (x1 > x2) {
        leftX = x2;
        rightX = x1;
        leftY = y2;
        rightY = y1;
    }

    //left nằm dưới right
    if (leftY > rightY) {
        //Kiểm tra
        for (let i = leftY - 1; i >= rightY; i--) {
            //Kiểm tra có đường đi giữa 2 ô cùng 1 cột leftX và từ dòng leftY đến dòng i
            if (checkY(returnID(leftX, leftY), returnID(leftX, i)) && checkX(returnID(leftX, i), returnID(rightX, i)) && checkY(returnID(rightX, i), returnID(rightX, rightY))) {
                // Nếu drawable là true, vẽ đường nối giữa hai ô và sau 300ms xóa đường vừa vẽ
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                return true;
            }
        }
    }
    //left nằm trên right
    else {
        for (let i = leftY + 1; i <= rightY; i++) {
            if (checkY(returnID(leftX, leftY), returnID(leftX, i)) && checkX(returnID(leftX, i), returnID(rightX, i)) && checkY(returnID(rightX, i), returnID(rightX, rightY))) {
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                return true;
            }
        }
    }
    // Kiểm tra từ leftX đến rightX
    for (let i = leftX + 1; i <= rightX; i++) {
        // Kiểm tra có đường đi giữa 2 ô cùng 1 hàng leftY và từ cột leftX đến cột i
        if (checkX(returnID(leftX, leftY), returnID(i, leftY)) && checkY(returnID(i, leftY), returnID(i, rightY)) && checkX(returnID(i, rightY), returnID(rightX, rightY))) {
            // Nếu drawable là true, vẽ đường nối giữa hai ô và sau 300ms xóa đường vừa vẽ
            if (drawable) {
                drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                setTimeout(() => {
                    ctx.clearRect(0, 0, 630, 540);
                }, 300);
            }
            return true;
        }
    }
// Kiểm tra từ leftX đến rightX theo hướng ngược lại
    for (let i = leftX - 1; i >= rightX; i--) {
        if (checkX(returnID(leftX, leftY), returnID(i, leftY)) && checkY(returnID(i, leftY), returnID(i, rightY)) && checkX(returnID(i, rightY), returnID(rightX, rightY))) {
            if (drawable) {
                drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                setTimeout(() => {
                    ctx.clearRect(0, 0, 630, 540);
                }, 300);
            }
            return true;
        }
    }
    return false;

}

function checkOutRect(id1, id2, drawable) {
    // Tính toán tọa độ của ô thứ nhất và ô thứ hai trên bảng
    let x1 = id1 % boardWidth;  // Tọa độ x của ô thứ nhất
    let x2 = id2 % boardWidth;  // Tọa độ x của ô thứ hai
    let y1 = Math.floor(id1 / boardWidth);  // Tọa độ y của ô thứ nhất
    let y2 = Math.floor(id2 / boardWidth);  // Tọa độ y của ô thứ hai

    // Kiểm tra nếu hình chữ nhật nằm ngang
    if (1) {
        // Xác định các tọa độ của các điểm cần thiết để vẽ hình chữ nhật
        let leftX = x1;
        let leftY = y1;
        let rightX = x2;
        let rightY = y2;

        // Hoán đổi tọa độ nếu ô thứ nhất nằm bên phải ô thứ hai
        if (x1 > x2) {
            leftX = x2;
            rightX = x1;
            leftY = y2;
            rightY = y1;
        }

        // Kiểm tra các ô trên cùng một hàng ngang
        let i = leftY - 1;
        while (i >= 0 && cells[returnID(leftX, i)].value === 0) {
            // Kiểm tra xem có thể vẽ hình chữ nhật từ ô trên cùng bên trái đến ô dưới cùng bên phải
            if (checkY(returnID(leftX, leftY), returnID(leftX, i)) &&
                checkX(returnID(leftX, i), returnID(rightX, i)) &&
                checkY(returnID(rightX, i), returnID(rightX, rightY))) {
                // Nếu có thể vẽ và tham số drawable được thiết lập, thì vẽ hình chữ nhật và xóa sau 300ms
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                // Trả về true để chỉ ra rằng đã tìm thấy và vẽ hình chữ nhật
                return true;
            }
            i--;
        }
        // Tiếp tục kiểm tra các ô trên cùng một hàng ngang phía dưới
        i = leftY + 1;
        while (i < boardHeight && cells[returnID(leftX, i)].value === 0) {
            // Kiểm tra xem có thể vẽ hình chữ nhật từ ô dưới cùng bên trái đến ô trên cùng bên phải
            if (checkY(returnID(leftX, leftY), returnID(leftX, i)) &&
                checkX(returnID(leftX, i), returnID(rightX, i)) &&
                checkY(returnID(rightX, i), returnID(rightX, rightY))) {
                // Nếu có thể vẽ và tham số drawable được thiết lập, thì vẽ hình chữ nhật và xóa sau 300ms
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                // Trả về true để chỉ ra rằng đã tìm thấy và vẽ hình chữ nhật
                return true;
            }
            i++;
        }
    }
    //Nằm dọc
    if (1) {
        let topX = x1;
        let topY = y1;
        let bottomX = x2;
        let bottomY = y2;

        if (topY > bottomY) {
            topY = y2;
            topX = x2;
            bottomY = y1;
            bottomX = x1;
        }

        //Xử lý <
        let i = topX - 1;
        while (i >= 0 && cells[returnID(i, topY)].value === 0) {
            if (checkX(returnID(topX, topY), returnID(i, topY))
                && checkY(returnID(i, topY), returnID(i, bottomY))
                && checkX(returnID(i, bottomY), returnID(bottomX, bottomY))) {
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(topX, topY)].centerX,
                        cells[returnID(topX, topY)].centerY,
                        cells[returnID(i, topY)].centerX,
                        cells[returnID(i, topY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, topY)].centerX,
                        cells[returnID(i, topY)].centerY,
                        cells[returnID(i, bottomY)].centerX,
                        cells[returnID(i, bottomY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, bottomY)].centerX,
                        cells[returnID(i, bottomY)].centerY,
                        cells[returnID(bottomX, bottomY)].centerX,
                        cells[returnID(bottomX, bottomY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                return true;
            }
            i--;
        }
        //Xử lý >
        i = topX + 1;
        while (i < boardWidth && cells[returnID(i, topY)].value === 0) {
            if (checkX(returnID(topX, topY), returnID(i, topY))
                && checkY(returnID(i, topY), returnID(i, bottomY))
                && checkX(returnID(i, bottomY), returnID(bottomX, bottomY))) {
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(topX, topY)].centerX,
                        cells[returnID(topX, topY)].centerY,
                        cells[returnID(i, topY)].centerX,
                        cells[returnID(i, topY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, topY)].centerX,
                        cells[returnID(i, topY)].centerY,
                        cells[returnID(i, bottomY)].centerX,
                        cells[returnID(i, bottomY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, bottomY)].centerX,
                        cells[returnID(i, bottomY)].centerY,
                        cells[returnID(bottomX, bottomY)].centerX,
                        cells[returnID(bottomX, bottomY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                return true;
            }
            i++;
        }
    }
    return false;
}


// Hàm checkOKIE để kiểm tra xem có đường đi từ ô id1 đến ô id2 không và vẽ đường đi nếu có
function checkOKIE(id1, id2, drawable) {
    if (!checkSelfChosen(id1, id2)) {
        return false;
    }

    if (!checkValue(id1, id2))
        return false;

    if (checkOneHorizontalLine(id1, id2, drawable)) {

        return true;
    }


    if (checkOneVerticalLine(id1, id2, drawable)) {

        return true;
    }
    if (checkInRect(id1, id2, drawable)) {

        return true;
    }
    if (checkOutRect(id1, id2, drawable)) {

        return true;
    }


    return false;
}


function WinGame() {
    if (gameScore === 6000) {
        document.getElementById("win-game").style.display = "block";
        isWin = true;
    }
}

// Hàm mainAlgorithim để xử lý chính của trò chơi khi người chơi đã chọn 2 ô
function mainAlgorithim() {
    // Khởi tạo mảng isHandle để lưu các ô được chọn
    let isHandle = [];
    // Kiểm tra nếu người chơi đã chọn 2 ô
    if (isSelecting === 2) {
        // Duyệt qua từng ô trong mảng cells
        for (let id = boardWidth; id < boardWidth * boardHeight - boardWidth; id++) {
            // Kiểm tra nếu ô được chọn thì thêm vào mảng isHandle
            if (cells[id].image.className.indexOf(" onSelect") !== -1) {
                isHandle.push(id);
            }
        }
        // Kiểm tra nếu có đường đi từ ô isHandle[0] đến ô isHandle[1]
        if (checkOKIE(isHandle[0], isHandle[1], true)) {
            // Đặt giá trị của 2 ô đã chọn về 0
            cells[isHandle[0]].value = 0;
            cells[isHandle[1]].value = 0;
            // Tăng điểm số của trò chơi lên 100
            gameScore += 100;
            // Đặt zIndex của canvas thành 20
            myCanvas.style.zIndex = 20;
            // Thêm sự kiện cho các ô
            addEventForCell();
        }
        // Loại bỏ trạng thái đã chọn của 2 ô đã chọn
        cells[isHandle[0]].image.className = cells[isHandle[0]].image.className.replace(" onSelect", "");
        cells[isHandle[1]].image.className = cells[isHandle[1]].image.className.replace(" onSelect", "");
        // Đặt lại mảng isHandle và biến isSelecting
        isHandle = [];
        isSelecting = 0;
    }
}


// Hàm isOkieToShuffle để kiểm tra xem có thể xáo trộn các ô trong trò chơi hay không
function isOkieToShuffle() {
    // Nếu đã thắng trò chơi thì không thể xáo trộn, trả về false
    if (isWin) {
        return false;
    }
    // Duyệt qua từng ô trong mảng cells
    for (let i = 0; i < cells.length - 1; i++) {
        // Kiểm tra nếu giá trị của ô khác 0
        if (cells[i].value !== 0) {
            // Duyệt qua các ô còn lại trong mảng cells
            for (let j = i + 1; j < cells.length; j++) {
                // Kiểm tra nếu giá trị của ô khác 0
                if (cells[j].value !== 0) {
                    // Kiểm tra nếu có đường đi từ ô i đến ô j thì không thể xáo trộn, trả về false
                    if (checkOKIE(i, j, false))
                        return false;
                }
            }
        }
    }
    // Nếu không có ô nào có đường đi đến ô khác thì có thể xáo trộn, trả về true
    return true;
}


// Hàm handleSwap để xử lý việc đổi chỗ các ô trong trò chơi
function handleSwap() {
    // Lấy phần tử reload từ DOM
    let reload = document.getElementById('reload');
    // Hiển thị phần tử reload
    reload.style.display = "block";
    // Gọi hàm swapCell để đổi chỗ các ô
    swapCell();
    // Sau 1000ms (1 giây), ẩn phần tử reload
    setTimeout(() => {
        reload.style.display = "none";
    }, 1000);
}


// init();

function game() {
    mainAlgorithim();
    flowToLeft();
    // drawCells();
    showScore();
    WinGame();
    if (isOkieToShuffle()) {
        handleSwap();
    }
}


// ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
// game();
// timeHandle();





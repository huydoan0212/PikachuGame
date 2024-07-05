let boardWidth = 14; // Chiều rộng của bàn cờ (số ô trong một hàng)
let boardHeight = 12;// Chiều cao của bàn cờ (số ô trong một cột)
let cellSize = 50; //Kích thước của mỗi ô theo pixel
let typeNum = 20; // Số lượng kiểu biểu tượng (hình ảnh) khác nhau trong trò chơi
let numEachType = 6; // Số lượng của mỗi kiểu biểu tượng được tạo ra
let gameTime = 300; // Giới hạn thời gian cho trò chơi trong giây
let info = document.getElementById("info");
let board = document.getElementById("game-board"); //Tham chiếu đến phần tử HTML có ID "game-board"
let myCanvas = ""; //  Tham chiếu đến phần tử canvas được tạo để vẽ trò chơi
let ctx = ''; //Bối cảnh của phần tử canvas cho các thao tác vẽ
let checkTypeNum = [];// Mảng để theo dõi số lượng của mỗi kiểu biểu tượng được sử dụng (khởi tạo bằng số 0)
let cells = []; //Mảng chứa thông tin về mỗi ô, bao gồm ID, giá trị (kiểu biểu tượng), tọa độ x và y, chiều rộng, chiều cao, tọa độ tâm và tham chiếu đến phần tử HTML tương ứng cho ô
let gameScore = 0; //Điểm hiện tại của người chơi
let isSelecting = 0;//Cờ để chỉ ra người chơi hiện đang chọn ô hay không (0 - không chọn, 1 - chọn một ô, 2 - chọn hai ô)
let timeLeft = 1000;//Thời gian còn lại tính bằng giây
let isWin = false;//Cờ để chỉ ra người chơi đã chiến thắng trò chơi hay chưa
let selectElement = document.getElementById("choices");
let selectedOption = null
let level = 0;
let numOfSuggest = 3;
window.addEventListener("dblclick", (event) => {
    event.preventDefault();
})

for (let i = 0; i <= typeNum; i++) {
    checkTypeNum.push(0);
}
let infoDev = false;

function getInfo() {
    if (infoDev === false) {
        document.getElementById('info-dev').style.display = 'block';
        infoDev = true;
    } else {
        document.getElementById('info-dev').style.display = 'none';
        infoDev = false;
    }
}

function nextLevel() {
    playSoundNextLevel()
    if (level < 6 && level >= 1) {
        reset();
        level++;
        init();
    } else if (level === 6) {
        reset();
        level = 1;
        init();
    }
}


//Tạo ngẫu nhiên 1 số nằm giữa min và max
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLineFromXtoY(x1, y1, x2, y2, ctx) {
    ctx.lineWidth = 5; // Đặt độ rộng của đường vẽ là 5 pixel
    ctx.strokeStyle = "red"; // Đặt màu sắc của đường vẽ là màu đỏ
    ctx.beginPath(); // Bắt đầu một đường vẽ mới
    ctx.moveTo(x1, y1); // Di chuyển bút vẽ đến điểm bắt đầu có tọa độ (x1, y1)
    ctx.lineTo(x2, y2); // Vẽ một đường thẳng từ điểm hiện tại đến điểm có tọa độ (x2, y2)
    ctx.stroke(); // Thực hiện việc vẽ đường thẳng trên canvas
}


//Tạo giá trị random cho ô
function createRandomValueForCell() {
    let t = Math.floor(Math.random() * typeNum) + 1; // Tạo một giá trị ngẫu nhiên từ 1 đến 20
    while (checkTypeNum[t] >= numEachType) { // Nếu số lượng của loại t đã đạt đến giới hạn cho phép
        t = Math.floor(Math.random() * typeNum) + 1; // Tạo lại giá trị ngẫu nhiên cho t
    }
    checkTypeNum[t] += 1; // Tăng số lượng của loại t lên 1
    return t; // Trả về giá trị của t
}


function cell(id, value, x, y) {
    this.id = id; // ID của ô
    this.value = value; // Giá trị của ô
    this.x = x; // Chỉ số của cột
    this.y = y; // Chỉ số của dòng
    this.width = cellSize; // Chiều rộng của ô
    this.height = cellSize; // Chiều cao của ô
    this.centerX = (this.x) + (this.width) / 2; // Tọa độ X của trung tâm ô
    this.centerY = (this.y) + (this.height) / 2; // Tọa độ Y của trung tâm ô
    this.isSelected = false; // Trạng thái được chọn của ô
    this.image = document.createElement("div"); // Tạo một phần tử div mới
    this.image.setAttribute("class", "cell"); // Đặt class của phần tử div là "cell"
    this.image.setAttribute("id", this.id + ""); // Đặt ID của phần tử div là ID của ô
    this.draw = function () { // Phương thức vẽ ô
        if (this.value !== 0) { // Nếu giá trị của ô khác 0
            this.image.innerHTML = '<image src="image/pic' + this.value + '.png" alt="">'; // Đặt nội dung HTML của phần tử div là một hình ảnh
            this.image.style.border = "2px solid rgb(0,0,139)"; // Đặt viền của phần tử div là 2px và màu xanh lá cây
            this.image.style.cursor = "pointer"; // Đặt con trỏ chuột khi di chuyển qua phần tử div là con trỏ
            this.image.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
        } else { // Nếu giá trị của ô là 0
            if (this.id > boardWidth && this.id <= boardWidth * boardHeight - boardWidth && this.id % boardWidth !== 0 && (this.id + 1) % boardWidth !== 0) {
                // this.image.style.border = "2px solid rgb(0,0,139)"; // Đặt viền của phần tử div là 2px và màu xanh lá cây
            } else {
                this.image.style.border = "none"; // Không đặt viền cho phần tử div
            }
            this.image.style.cursor = "auto"; // Đặt con trỏ chuột khi di chuyển qua phần tử div là con trỏ mặc định
            this.image.innerHTML = ""; // Không đặt nội dung HTML cho phần tử div
            this.image.style.backgroundColor = "rgba(255, 255, 255, 0)"; // Đặt màu nền của phần tử div là trong suốt

        }
        board.appendChild(this.image); // Thêm phần tử div vào bảng
    }
}


// Hàm swapCell để đổi chỗ các ô trong mảng cells
function swapCell() {
    playSoundShuffle()
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
            cells[i].value = cells[index].value;
            // Đặt giá trị của ô tại vị trí ngẫu nhiên bằng giá trị tạm thời
            cells[index].value = t;
        }
    }
    game();
}

// Hàm handleClick để xử lý sự kiện click
function handleClick() {
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

function reset() {
    board.innerHTML = '';
}

function timePlay() {
    switch (level) {
        case 1:
            gameTime = 300;
            break
        case 2:
            gameTime = 280;
            break
        case 3:
            gameTime = 280;
            break
        case 4:
            gameTime = 260;
            break
        case 5:
            gameTime = 240;
            break
        case 6:
            gameTime = 240;
            break
    }
}

function levelSelect() {
    selectedOption = selectElement.options[selectElement.selectedIndex].value; // Lấy giá trị của tùy chọn được chọn từ selectElement
    switch (selectedOption) { // Đặt cấp độ trò chơi dựa trên tùy chọn được chọn
        case "level1":
            level = 1;
            break;
        case "level2":
            level = 2;
            break;
        case "level3":
            level = 3;
            break;
        case "level4":
            level = 4;
            break;
        case "level5":
            level = 5;
            break;
        case "level6":
            level = 6;
            break;
    }
}

// Hàm init để khởi tạo lại trò chơi
function init() {
    if (level === 0) {
        levelSelect();
    }
    muteAll()
    playSoundGame()
    reset()
    document.getElementById("text-level").textContent = level; // Hiển thị cấp độ trò chơi
    info.style.display = 'block'; // Hiển thị thông tin trò chơi
    board.style.display = 'grid'; // Hiển thị bảng trò chơi
    gameScore = 0; // Đặt lại điểm số trò chơi
    isSelecting = 0; // Đặt lại trạng thái đang chọn
    numOfSuggest = 3; // Đặt lại số lần được gợi ý
    timePlay()
    timeLeft = gameTime; // Đặt lại thời gian còn lại
    board.innerHTML = " <canvas id='myCanvas' width='630' height='540'></canvas>"; // Tạo một canvas mới trong bảng trò chơi
    isWin = false; // Đặt trạng thái thắng trò chơi là false
    myCanvas = document.getElementById("myCanvas"); // Lấy phần tử canvas
    ctx = myCanvas.getContext("2d"); // Lấy context 2D từ canvas
    for (let i = 0; i <= typeNum; i++) {
        checkTypeNum[i] = 0; // Đặt lại số lượng của từng loại
    }
    cells.splice(0, cells.length); // Xóa mảng cells
    let temp = "";
    for (let i = 0; i < boardWidth; i++) {
        temp += cellSize + "px "; // Tạo giá trị column để set style cho gameBoard thành gridTemplateColumns
    }
    board.style.gridTemplateColumns = temp;
    temp = "";
    for (let i = 0; i < boardHeight; i++) {
        temp += cellSize + "px "; // Tạo giá trị row để set style cho gameBoard thành gridTemplateRows
    }
    board.style.gridTemplateRows = temp;
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            let id = j + i * boardWidth; // Tạo ID cho ô
            let value = 0;
            if (i === 0 || i === boardHeight - 1 || j === 0 || j === boardWidth - 1) {
                value = 0; // Các dòng và cột viền có giá trị bằng 0
            } else {
                value = createRandomValueForCell(); // Tạo giá trị ngẫu nhiên cho ô
            }
            cells.push(new cell(id, value, cellSize * (j), cellSize * (i))); // Tạo một ô mới và thêm vào mảng cells
        }
    }
    document.getElementById("game-over").style.display = "none"; // Ẩn phần tử game-over
    document.getElementById("win-game").style.display = "none"; // Ẩn phần tử win-game
    document.getElementById("level").style.display = "none"; // Ẩn phần tử level
    addEventForCell(); // Gọi hàm thêm sự kiện cho các ô có giá trị value khác 0
    timeHandle(); // Gọi hàm xử lý thời gian
    game(); // Bắt đầu trò chơi
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
    addEventForCell();

}

// Level 2
function isPossibleToMoveLeft(row) {
    let index = 0; // Khởi tạo chỉ số
    for (let i = 1; i < boardWidth - 1; i++) { // Duyệt qua từng ô trong hàng
        if (cells[i + row * boardWidth].value === 0) { // Nếu giá trị của ô là 0
            index = i; // Cập nhật chỉ số
            break; // Thoát vòng lặp
        }
    }
    for (let i = 1; i < boardWidth - 1; i++) { // Duyệt qua từng ô trong hàng một lần nữa
        if (cells[i + row * boardWidth].value !== 0 && i > index) { // Nếu giá trị của ô khác 0 và chỉ số của ô lớn hơn chỉ số đã tìm được
            return true;
        }
    }
    return false; // Nếu không tìm thấy ô nào không thể di chuyển, trả về true
}

function flowToLeft() {
    // Duyệt qua từng hàng
    for (let i = 1; i < boardHeight - 1; i++) {
        // Lấy giá trị hàng hiện tại
        let row = i;
        let count = 0;
        // Duyệt qua từng ô của hàng hiện tại
        for (let j = 1; j < boardWidth - 1; j++) {
            // Nếu có ô có giá trị bằng 0, tăng biến đếm count
            if (cells[i * boardWidth + j].value === 0) {
                count++;
            }
        }
        if (count !== 0 && count !== boardWidth - 2) {
            // Thực hiện vòng lặp kiểm tra xem các ô có giá trị khác không có thể di chuyển sang trái
            while (isPossibleToMoveLeft(row)) {
                // Duyệt qua từng ô của hàng
                for (let k = 1; k < boardWidth - 1; k++) {
                    // Nếu ô bằng 0
                    if (cells[row * boardWidth + k].value === 0) {
                        // Lấy vị trí ô có giá trị khác 0 trong nằm bên phải ô có giá trị bằng 0 đang xét
                        let index = check0CellInRowLeft(k, row);
                        // Nếu vị trí khác -1
                        if (index !== -1) {
                            // Đổi vị trí 2 ô
                            swapCellX(k, index, row)
                            break;
                        }
                    }
                }
            }
        }
    }
    drawCells();
}

function check0CellInRowLeft(start, row) {
    for (let i = start; i < boardWidth - 1; i++) { // Duyệt qua từng ô trong hàng từ vị trí bắt đầu đến cuối hàng
        if (cells[row * boardWidth + i].value !== 0) { // Nếu giá trị của ô khác 0 (tức là ô không rỗng)
            return i; // Trả về chỉ số của ô
        }
    }
    return -1; // Nếu không tìm thấy ô nào không rỗng, trả về -1
}

// Level 3
function flowToTop() {
    // Duyệt qua từng cột
    for (let i = 1; i < boardWidth - 1; i++) {
        // Lấy giá trị cột hiện tại
        let col = i;
        let count = 0;
        // Duyệt qua từng ô của cột hiện tại
        for (let j = 1; j < boardHeight - 1; j++) {
            // Nếu có ô có giá trị bằng 0, tăng biến đếm count
            if (cells[j * boardWidth + i].value === 0) {
                count++;
            }
        }
        if (count !== 0 && count !== boardHeight - 2) {
            // Thực hiện vòng lặp kiểm tra xem các ô có giá trị khác không có thể di chuyển lên trên
            while (isPossibleToMoveTop(col)) {
                // Duyệt qua từng ô của cột
                for (let k = 1; k < boardHeight - 1; k++) {
                    // Nếu ô bằng 0
                    if (cells[k * boardWidth + col].value === 0) {
                        // Lấy vị trí ô có giá trị khác 0 trong nằm bên dưới ô có giá trị bằng 0 đang xét
                        let index = check0CellInColumnTop(k, col);
                        // Nếu vị trí khác -1
                        if (index !== -1) {
                            // Đổi vị trí 2 ô
                            swapCellY(k, index, col);
                            break;
                        }
                    }
                }
            }
        }
    }
    drawCells();
}

function isPossibleToMoveTop(col) {
    let index = 0; // Khởi tạo chỉ số
    for (let i = 1; i < boardHeight - 1; i++) { // Duyệt qua từng ô trong cột
        if (cells[i * boardWidth + col].value === 0) { // Nếu giá trị của ô là 0
            index = i; // Cập nhật chỉ số
            break; // Thoát vòng lặp
        }
    }
    for (let i = 1; i < boardHeight; i++) { // Duyệt qua từng ô trong cột một lần nữa
        if (cells[i * boardWidth + col].value !== 0 && i > index) { // Nếu giá trị của ô khác 0 và chỉ số của ô lớn hơn chỉ số đã tìm được
            return true;
        }
    }
    return false; // Nếu không tìm thấy ô nào không thể di chuyển, trả về true
}


function check0CellInColumnTop(start, col) {
    for (let i = start; i < boardHeight - 1; i++) {
        if (cells[i * boardWidth + col].value !== 0) {
            return i;
        }
    }
    return -1;
}

function swapCellX(k, index, row) {
    [cells[row * boardWidth + k].value, cells[row * boardWidth + index].value] = [cells[row * boardWidth + index].value, cells[row * boardWidth + k].value];
    [cells[row * boardWidth + k].id, cells[row * boardWidth + index].id] = [cells[row * boardWidth + index].id, cells[row * boardWidth + k].id];
}

function swapCellY(k, index, col) {
    [cells[k * boardWidth + col].value, cells[index * boardWidth + col].value] = [cells[index * boardWidth + col].value, cells[k * boardWidth + col].value];
    [cells[k * boardWidth + col].id, cells[index * boardWidth + col].id] = [cells[index * boardWidth + col].id, cells[k * boardWidth + col].id];
}

// Level 4
function isPossibleToMoveRightHaftToLeft(row) {
    let index = 0;
    for (let i = 6; i > 0; i--) {
        if (cells[row * boardWidth + i].value === 0) {
            index = i;
            break
        }
    }
    for (let i = 6; i > 0; i--) {
        if (cells[row * boardWidth + i].value !== 0 && i < index) {
            return true;
        }
    }
    return false;
}

function check0CellInRowMoveRightHaftToLeft(start, row) {
    for (let i = start; i > 0; i--) {
        if (cells[row * boardWidth + i].value !== 0) {
            return i
        }
    }
    return -1;
}

// 1 nửa bên trái
function moveRightHaftToLeft() {
    // Duyệt qua từng hàng
    for (let i = 1; i < boardHeight - 1; i++) {
        // Lấy giá trị hàng hiện tại
        let row = i;
        let count = 0;
        // Duyệt qua từng ô từ 1 đến 6 của hàng hiện tại
        for (let j = 1; j < 7; j++) {
            // Nếu có ô có giá trị bằng 0, tăng biến đếm count
            if (cells[row * boardWidth + j].value === 0) {
                count++;
            }
        }
        if (count !== 0 && count !== 6) {
            // Thực hiện vòng lặp kiểm tra xem các ô có giá trị khác 0 có thể di chuyển sang phải
            while (isPossibleToMoveRightHaftToLeft(row)) {
                // Duyệt qua từng ô từ 6 đến 1 của hàng
                for (let k = 6; k > 0; k--) {
                    // Nếu ô bằng 0
                    if (cells[row * boardWidth + k].value === 0) {
                        // Lấy vị trí ô có giá trị khác 0 trong nằm bên trái ô có giá trị bằng 0 đang xét
                        let index = check0CellInRowMoveRightHaftToLeft(k, row);
                        // Nếu vị trí khác -1
                        if (index !== -1) {
                            swapCellX(k, index, row)
                            break;
                        }
                    }
                }
            }
        }
    }
    drawCells();
}

function check0CellInRowMoveLeftHaftToRight(start, row) {
    for (let i = start; i < boardWidth - 1; i++) {
        if (cells[row * boardWidth + i].value !== 0) {
            return i
        }
    }
    return -1;
}

function isPossibleToMoveLeftHaftToRight(row) {
    let index = 0
    for (let i = 7; i < boardWidth - 1; i++) {
        if (cells[row * boardWidth + i].value === 0) {
            index = i;
            break
        }
    }
    for (let i = 7; i < boardWidth - 1; i++) {
        if (cells[row * boardWidth + i].value !== 0 && i > index) {
            return true
        }
    }
    return false
}

// 1 nửa bên phải
function moveLeftHaftToRight() {
    // Duyệt qua từng hàng
    for (let i = 1; i < boardHeight - 1; i++) {
        // Lấy giá trị hàng hiện tại
        let row = i;
        let count = 0;
        // Duyệt qua từng ô từ 7 đến 12 của hàng hiện tại
        for (let j = 7; j < boardWidth - 1; j++) {
            // Nếu có ô có giá trị bằng 0, tăng biến đếm count
            if (cells[i * boardWidth + j].value === 0) {
                count++;
            }
        }
        if (count !== 0 && count !== 6) {
            // Thực hiện vòng lặp kiểm tra xem các ô có giá trị khác 0 có thể di chuyển sang trái
            while (isPossibleToMoveLeftHaftToRight(row)) {
                // Duyệt qua từng ô từ 7 đến 12 của hàng
                for (let k = 7; k < boardWidth - 1; k++) {
                    // Nếu ô bằng 0
                    if (cells[row * boardWidth + k].value === 0) {
                        // Lấy vị trí ô có giá trị khác 0 trong nằm bên phải ô có giá trị bằng 0 đang xét
                        let index = check0CellInRowMoveLeftHaftToRight(k, row);
                        // Nếu vị trí khác -1
                        if (index !== -1) {
                            swapCellX(k, index, row)
                            break;
                        }
                    }
                }
            }
        }
    }
    drawCells();
}

// Level 5
function swapRow() {
    let row = [] // Khởi tạo một mảng để lưu giá trị các ô của hàng đầu tiên
    for (let i = 1; i < boardWidth - 1; i++) { // Duyệt qua từng ô trong hàng đầu tiên
        row[i] = cells[boardWidth + i].value; // Lưu giá trị của ô vào mảng
    }
    for (let i = 1; i < boardHeight - 1; i++) { // Duyệt qua từng hàng từ hàng thứ hai đến hàng cuối cùng
        let j = i + 1; // Chỉ số của hàng tiếp theo
        if (j < boardHeight - 1) { // Nếu hàng tiếp theo không phải là hàng cuối cùng
            for (let k = 1; k < boardWidth - 1; k++) { // Duyệt qua từng ô trong hàng
                cells[i * boardWidth + k].value = cells[j * boardWidth + k].value; // Đặt giá trị của ô trong hàng hiện tại bằng giá trị của ô trong hàng tiếp theo
            }
        }
    }
    for (let i = 1; i < boardWidth - 1; i++) { // Duyệt qua từng ô trong hàng cuối cùng
        cells[(boardHeight - 2) * boardWidth + i].value = row[i]; // Đặt giá trị của ô trong hàng cuối cùng bằng giá trị đã lưu trong mảng
    }
    row.length = 0 // Xóa mảng
    drawCells(); // Vẽ lại các ô trên bảng trò chơi
}

// Level 6
function swapColumn() {
    let col = []; // Khởi tạo một mảng để lưu giá trị các ô của cột đầu tiên
    for (let i = 1; i < boardHeight - 1; i++) { // Duyệt qua từng ô trong cột đầu tiên
        col[i] = cells[boardWidth * i + 1].value; // Lưu giá trị của ô vào mảng
    }
    for (let i = 1; i < boardWidth - 1; i++) { // Duyệt qua từng cột từ cột thứ hai đến cột cuối cùng
        let j = i + 1; // Chỉ số của cột tiếp theo
        if (j < boardWidth - 1) { // Nếu cột tiếp theo không phải là cột cuối cùng
            for (let k = 1; k < boardHeight - 1; k++) { // Duyệt qua từng ô trong cột
                cells[k * boardWidth + i].value = cells[k * boardWidth + j].value; // Đặt giá trị của ô trong cột hiện tại bằng giá trị của ô trong cột tiếp theo
            }
        }
    }
    for (let i = 1; i < boardHeight - 1; i++) { // Duyệt qua từng ô trong cột cuối cùng
        cells[i * boardWidth + (boardWidth - 2)].value = col[i]; // Đặt giá trị của ô trong cột cuối cùng bằng giá trị đã lưu trong mảng
    }
    col.length = 0; // Xóa mảng
    drawCells(); // Vẽ lại các ô trên bảng trò chơi
}


function showScore() {
    document.getElementById("score").innerHTML = "Score: " + gameScore;
}

// Hàm timeHandle để xử lý thời gian trong trò chơi
let intervalId = null;
let isPaused = false;

function timeHandle() {
    // Hiển thị thời gian còn lại lên màn hình
    document.getElementById("time").innerHTML = "Time: " + timeLeft;

    // Kiểm tra xem có hàm setInterval nào đang chạy không
    if (intervalId !== null) {
        // Nếu có, hủy hàm setInterval đó
        clearInterval(intervalId);
    }

    // Cài đặt hàm setInterval để thực hiện hàm bên trong sau mỗi 1000ms (1 giây)
    intervalId = setInterval(() => {
        // Nếu thời gian còn lại bằng 0 thì hiển thị thông báo game over
        if (timeLeft === 0) {
            muteAll()
            playSoundLose()
            document.getElementById("game-over").style.display = "block";
        }
        // Cập nhật thời gian còn lại lên màn hình
        document.getElementById("time").innerHTML = "Time: " + timeLeft;
        // Nếu thời gian còn lại lớn hơn 0 và trò chơi chưa thắng thì giảm thời gian còn lại đi 1
        if (timeLeft > 0 && isWin === false)
            timeLeft -= 1;
    }, 1000);
}

let onGround = document.getElementById("on-ground")

function pauseTime() {
    // Kiểm tra xem có hàm setInterval nào đang chạy không
    if (intervalId !== null) {
        // Nếu có, hủy hàm setInterval đó
        clearInterval(intervalId);
        // Đặt lại intervalId thành null
        intervalId = null;
    }
}

// Tạo một nút để tạm dừng và tiếp tục thời gian
let button = document.getElementById("pause")
button.onclick = function () {
    if (isPaused) {
        playSoundPause()
        onGround.classList.remove("overplay")
        timeHandle();
        isPaused = false;
        button.innerHTML = '<i class="fa-solid fa-pause"></i>'
        button.style.padding = '10px 15px'
    } else {
        playSoundPause()
        onGround.classList.add("overplay")
        pauseTime();
        isPaused = true;
        button.innerHTML = '<i class="fa-solid fa-play"></i>'
        button.style.padding = '10px 14px'

    }
};

function checkSelfChosen(id1, id2) {
    return id1 !== id2;
}

function checkValue(id1, id2) {
    return cells[id1].value === cells[id2].value;
}

// Thuật toán của game
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

// Hàm checkInRect để kiểm tra xem có đường nằm trong bảng trò chơi đi từ ô id1 đến ô id2 và vẽ đường đi nếu có
function checkInRect(id1, id2, drawable) {
    // Tính toán tọa độ x, y của hai ô dựa trên id và chiều rộng của bảng
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);

    // Khởi tạo tọa độ của hai điểm: điểm bên trái và điểm bên phải
    let leftX = x1;
    let leftY = y1;
    let rightX = x2;
    let rightY = y2;

    // Nếu ô thứ nhất nằm bên phải ô thứ hai, hoán đổi tọa độ của hai ô
    if (x1 > x2) {
        leftX = x2;
        rightX = x1;
        leftY = y2;
        rightY = y1;
    }

    // Kiểm tra các đường đi từ dưới lên trên
    for (let i = leftY - 1; i >= rightY; i--) {
        if (checkY(returnID(leftX, leftY), returnID(leftX, i)) && checkX(returnID(leftX, i), returnID(rightX, i)) && checkY(returnID(rightX, i), returnID(rightX, rightY))) {
            // Nếu có thể vẽ, vẽ đường đi và sau đó xóa sau 300ms
            if (drawable) {
                drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                setTimeout(() => {
                    ctx.clearRect(0, 0, 630, 540);
                }, 300);
            }
            // Nếu có đường đi, trả về true
            return true;
        }
    }

    // Kiểm tra các đường đi từ trên xuống dưới
    for (let i = leftY + 1; i <= rightY; i++) {
        if (checkY(returnID(leftX, leftY), returnID(leftX, i)) && checkX(returnID(leftX, i), returnID(rightX, i)) && checkY(returnID(rightX, i), returnID(rightX, rightY))) {
            // Nếu có thể vẽ, vẽ đường đi và sau đó xóa sau 300ms
            if (drawable) {
                drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(leftX, i)].centerX, cells[returnID(leftX, i)].centerY, cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(rightX, i)].centerX, cells[returnID(rightX, i)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                setTimeout(() => {
                    ctx.clearRect(0, 0, 630, 540);
                }, 300);
            }
            // Nếu có đường đi, trả về true
            return true;
        }
    }

    // Kiểm tra các đường đi từ trái sang phải
    for (let i = leftX + 1; i <= rightX; i++) {
        // Kiểm tra có đường đi giữa 2 ô cùng 1 hàng leftY và từ cột leftX đến cột i
        if (checkX(returnID(leftX, leftY), returnID(i, leftY)) && checkY(returnID(i, leftY), returnID(i, rightY)) && checkX(returnID(i, rightY), returnID(rightX, rightY))) {
            // Nếu có thể vẽ, vẽ đường đi và sau đó xóa sau 300ms
            if (drawable) {
                drawLineFromXtoY(cells[returnID(leftX, leftY)].centerX, cells[returnID(leftX, leftY)].centerY, cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, leftY)].centerX, cells[returnID(i, leftY)].centerY, cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, ctx);
                drawLineFromXtoY(cells[returnID(i, rightY)].centerX, cells[returnID(i, rightY)].centerY, cells[returnID(rightX, rightY)].centerX, cells[returnID(rightX, rightY)].centerY, ctx);
                setTimeout(() => {
                    ctx.clearRect(0, 0, 630, 540);
                }, 300);
            }
            // Nếu có đường đi, trả về true
            return true;
        }
    }

    // Nếu không tìm thấy đường đi, trả về false
    return false;
}

// Hàm checkInRect để kiểm tra xem có đường nối nằm ngoài bảng trò chơi đi từ ô id1 đến ô id2 và vẽ đường đi nếu có
function checkOutRect(id1, id2, drawable) {
    // Tính toán tọa độ x, y của hai ô dựa trên id và chiều rộng của bảng
    let x1 = id1 % boardWidth;
    let x2 = id2 % boardWidth;
    let y1 = Math.floor(id1 / boardWidth);
    let y2 = Math.floor(id2 / boardWidth);

    // Trường hợp có đường đi nằm ngoài bảng trò chơi theo chiều ngang của bảng
    if (1) {
        // Khởi tạo tọa độ của hai điểm: điểm bên trái và điểm bên phải
        let leftX = x1;
        let leftY = y1;
        let rightX = x2;
        let rightY = y2;
        // Nếu ô thứ nhất nằm bên phải ô thứ hai, hoán đổi tọa độ của hai ô
        if (x1 > x2) {
            leftX = x2;
            rightX = x1;
            leftY = y2;
            rightY = y1;
        }
        // Hướng lên trên
        let i = leftY - 1;
        while (i >= 0 && cells[returnID(leftX, i)].value === 0) {
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
            i--;
        }
        // Hướng xuống dưới
        i = leftY + 1;
        while (i < boardHeight && cells[returnID(leftX, i)].value === 0) {
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
            i++;
        }
    }
    // Trường hợp có đường đi nằm ngoài bảng trò chơi theo chiều dọc của bảng
    if (1) {
        // Khởi tạo tọa độ của hai điểm: điểm nằm trên và điểm nằm dưới
        let topX = x1;
        let topY = y1;
        let bottomX = x2;
        let bottomY = y2;
        // Nếu ô thứ nhất nằm dưới ô thứ hai, hoán đổi tọa độ của hai ô
        if (topY > bottomY) {
            topY = y2;
            topX = x2;
            bottomY = y1;
            bottomX = x1;
        }
        // Hướng qua trái
        let i = topX - 1;
        while (i >= 0 && cells[returnID(i, topY)].value === 0) {
            if (checkX(returnID(topX, topY), returnID(i, topY)) && checkY(returnID(i, topY), returnID(i, bottomY)) && checkX(returnID(i, bottomY), returnID(bottomX, bottomY))) {
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(topX, topY)].centerX, cells[returnID(topX, topY)].centerY, cells[returnID(i, topY)].centerX, cells[returnID(i, topY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, topY)].centerX, cells[returnID(i, topY)].centerY, cells[returnID(i, bottomY)].centerX, cells[returnID(i, bottomY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, bottomY)].centerX, cells[returnID(i, bottomY)].centerY, cells[returnID(bottomX, bottomY)].centerX, cells[returnID(bottomX, bottomY)].centerY, ctx);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, 630, 540);
                    }, 300);
                }
                return true;
            }
            i--;
        }
        // Hướng qua phải
        i = topX + 1;
        while (i < boardWidth && cells[returnID(i, topY)].value === 0) {
            if (checkX(returnID(topX, topY), returnID(i, topY)) && checkY(returnID(i, topY), returnID(i, bottomY)) && checkX(returnID(i, bottomY), returnID(bottomX, bottomY))) {
                if (drawable) {
                    drawLineFromXtoY(cells[returnID(topX, topY)].centerX, cells[returnID(topX, topY)].centerY, cells[returnID(i, topY)].centerX, cells[returnID(i, topY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, topY)].centerX, cells[returnID(i, topY)].centerY, cells[returnID(i, bottomY)].centerX, cells[returnID(i, bottomY)].centerY, ctx);
                    drawLineFromXtoY(cells[returnID(i, bottomY)].centerX, cells[returnID(i, bottomY)].centerY, cells[returnID(bottomX, bottomY)].centerX, cells[returnID(bottomX, bottomY)].centerY, ctx);
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
    if (!checkValue(id1, id2)) {
        return false;
    }
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
        muteAll()
        playSoundWin()
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
            playSound1()
            switch (level) {
                case 2:
                    flowToLeft()
                    break
                case 3:
                    flowToTop()
                    break
                case 4:
                    moveLeftHaftToRight();
                    moveRightHaftToLeft()
                    break
                case 5:
                    swapRow()
                    break
                case 6:
                    swapColumn()
                    break
            }
            // Thêm sự kiện cho các ô
            addEventForCell();
        } else {
            playSoundError()
        }
        // Loại bỏ trạng thái đã chọn của 2 ô đã chọn
        cells[isHandle[0]].image.className = cells[isHandle[0]].image.className.replace(" onSelect", "");
        cells[isHandle[1]].image.className = cells[isHandle[1]].image.className.replace(" onSelect", "");
        // Đặt lại mảng isHandle và biến isSelecting
        isHandle = [];
        isSelecting = 0;

    }
    WinGame();

}

function playSound1() {
    let audio = document.getElementById("sound1");
    audio.play();
}

function playSoundNextLevel() {
    let audio = document.getElementById("soundNextLevel");
    audio.play();
}

function playSoundGame() {
    let audio = document.getElementById("soundGame");
    audio.muted = false
    audio.play()

}

function playSoundHint() {
    let audio = document.getElementById("soundHint");
    audio.play();
}

function playSoundShuffle() {
    let audio = document.getElementById("soundShuffle");
    audio.play();
}

function playSoundPause() {
    let audio = document.getElementById("soundPause");
    audio.play();
}

function playSoundError() {
    let audio = document.getElementById("soundError");
    audio.volume = 1.0
    audio.play();
}

function playSoundWin() {
    let audio = document.getElementById("soundWin");
    audio.muted = false
    audio.play()

}

function playSoundLose() {
    let audio = document.getElementById("soundLose");
    audio.muted = false
    audio.play()
}

function muteAll() {
    let soundWin = document.getElementById('soundWin')
    let soundLose = document.getElementById('soundLose')
    let soundGame = document.getElementById('soundGame')
    soundWin.muted = true
    soundLose.muted = true
    soundGame.muted = true
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

function suggest() {
    if (numOfSuggest > 0 && numOfSuggest <= 3) {
        playSoundHint()
        // Kiểm tra nếu mảng cells không tồn tại hoặc rỗng
        if (!cells || cells.length === 0) {
            console.log("Mảng cells không tồn tại hoặc rỗng.");
            return;
        }

        // Duyệt qua từng ô trong mảng cells
        for (let i = 0; i < cells.length - 1; i++) {
            // Kiểm tra nếu giá trị của ô khác 0
            if (cells[i].value !== 0) {
                // Duyệt qua các ô còn lại trong mảng cells
                for (let j = i + 1; j < cells.length; j++) {
                    // Kiểm tra nếu giá trị của ô khác 0
                    if (cells[j].value !== 0) {
                        // Kiểm tra nếu có đường đi từ ô i đến ô j
                        if (checkOKIE(i, j, false)) {
                            // Lưu màu nền hiện tại
                            let currentColorI = cells[i].image.style.backgroundColor;
                            let currentColorJ = cells[j].image.style.backgroundColor;
                            setTimeout(() => {
                                if (cells[i]) cells[i].image.style.backgroundColor = "red";
                                if (cells[j]) cells[j].image.style.backgroundColor = "red";
                            }, 100);
                            setTimeout(() => {
                                if (cells[i]) cells[i].image.style.backgroundColor = currentColorI;
                                if (cells[j]) cells[j].image.style.backgroundColor = currentColorJ;
                            }, 500);
                            numOfSuggest--;
                            // Trả về sau khi tìm thấy cặp ô đầu tiên có đường đi
                            return;
                        }
                    }
                }
            }
        }
    }
}

document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyZ') {
        suggest();
    }
})

function game() {
    mainAlgorithim();
    showScore();
    drawCells()
    if (isOkieToShuffle()) {
        swapCell();
    }

}






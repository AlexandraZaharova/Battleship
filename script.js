const computerArea = document.querySelector('.computer-area');
computerArea.hidden = true;

// игровое поле игрока
const humanfield = document.querySelector('#field_human');
// игровое поле компьютера
const computerfield = document.querySelector('#field_computer');
// вычисляем координаты всех сторон элемента относительно окна браузера
const getCoordinates = el => {
  const coords = el.getBoundingClientRect();
  return {
    left: coords.left,
    right: coords.right,
    top: coords.top,
    bottom: coords.bottom
  };
};

class Field {
  // размер стороны игрового поля в px
  static FIELD_SIDE = 325;
  // размер палубы корабля в px
  static SHIP_SIDE = 33;
  // объект с данными кораблей
  // ключом будет являться тип корабля, а значением - массив,
  // первый элемент которого указывает кол-во кораблей данного типа,
  // второй элемент указывает кол-во палуб у корабля данного типа
  static SHIP_DATA = {
    fourdeck: [1, 4],
    tripledeck: [2, 3],
    doubledeck: [3, 2],
    singledeck: [4, 1]
  };

  constructor(field) {
    // объект игрового поля, полученный в качестве аргумента
    this.field = field;
    // создаём пустой объект, куда будем заносить данные по каждому созданному кораблю
    this.squadron = {};
    // двумерный массив, в который заносятся координаты кораблей, а в ходе морского
    // боя, координаты попаданий, промахов и заведомо пустых клеток
    this.matrix = [];
    // получаем координаты всех четырёх сторон рамки игрового поля
    let { left, right, top, bottom } = getCoordinates(this.field);
    this.fieldLeft = left;
    this.fieldRight = right;
    this.fieldTop = top;
    this.fieldBottom = bottom;
    console.log(left);
  }
}
;(function () {
  'use strict';
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
      left: coords.left + window.pageXOffset,
      right: coords.right + window.pageXOffset,
      top: coords.top + window.pageYOffset,
      bottom: coords.bottom + window.pageYOffset
    };
  };

  class Field {
    // размер стороны игрового поля в px
    static FIELD_SIDE = 330;
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
      console.log(this.fieldLeft);
    }

    static createMatrix() {
      return [...Array(10)].map(() => Array(10).fill(0));
    }

    static getRandom = n => Math.floor(Math.random() * (n + 1));

    cleanField() {
      // удаляем все объекты с игрового поля
      while (this.field.firstChild) {
        this.field.removeChild(this.field.firstChild);
      }
      // удаляем всё элементы объекта эскадры
      this.squadron = {};
      // заполняем матрицу игрового поля нулями
      this.matrix = Field.createMatrix();
      console.log(this.matrix)
    }

    randomLocationShips() {
      for (let type in Field.SHIP_DATA) {
        // кол-во кораблей данного типа
        let count = Field.SHIP_DATA[type][0];
        // кол-во палуб у корабля данного типа
        let decks = Field.SHIP_DATA[type][1];
        // прокручиваем кол-во кораблей
        for (let i = 0; i < count; i++) {
          // получаем координаты первой палубы и направление расположения палуб
          let options = this.getCoordsDecks(decks);
          // кол-во палуб
          options.decks = decks;
          // имя корабля, понадобится в дальнейшем для его идентификации
          options.shipname = type + String(i + 1);
          // создаём экземпляр корабля со свойствами, указанными в
          // объекте options
          const ship = new Ships(this, options);
          ship.createShip();
        }
      }
    }

    getCoordsDecks(decks) {
      // получаем коэффициенты определяющие направление расположения корабля
      // kx == 0 и ky == 1 — корабль расположен горизонтально,
      // kx == 1 и ky == 0 - вертикально.
      let kx = Field.getRandom(1), ky = (kx == 0) ? 1 : 0,
        x, y;

      // в зависимости от направления расположения, генерируем
      // начальные координаты
      if (kx == 0) {
        x = Field.getRandom(9); y = Field.getRandom(10 - decks);
      } else {
        x = Field.getRandom(10 - decks); y = Field.getRandom(9);
      }

      const obj = {x, y, kx, ky}
      // проверяем валидность координат всех палуб корабля
      const result = this.checkLocationShip(obj, decks);
      // если координаты невалидны, снова запускаем функцию
      if (!result) return this.getCoordsDecks(decks);
      return obj;
    }

    checkLocationShip(obj, decks) {
      let { x, y, kx, ky, fromX, toX, fromY, toY } = obj;

      // формируем индексы, ограничивающие двумерный массив по оси X (строки)
      // если координата 'x' равна нулю, то это значит, что палуба расположена в самой
      // верхней строке, т. е. примыкает к верхней границе и началом цикла будет строка
      // с индексом 0, в противном случае, нужно начать проверку со строки с индексом
      // на единицу меньшим, чем у исходной, т.е. находящейся выше исходной строки
      fromX = (x == 0) ? x : x - 1;
      // если условие истинно - это значит, что корабль расположен вертикально и его
      // последняя палуба примыкает к нижней границе игрового поля
      // поэтому координата 'x' последней палубы будет индексом конца цикла
      if (x + kx * decks == 10 && kx == 1) toX = x + kx * decks;
        // корабль расположен вертикально и между ним и нижней границей игрового поля
        // есть, как минимум, ещё одна строка, координата этой строки и будет
      // индексом конца цикла
      else if (x + kx * decks < 10 && kx == 1) toX = x + kx * decks + 1;
      // корабль расположен горизонтально вдоль нижней границы игрового поля
      else if (x == 9 && kx == 0) toX = x + 1;
      // корабль расположен горизонтально где-то по середине игрового поля
      else if (x < 9 && kx == 0) toX = x + 2;

      // формируем индексы начала и конца выборки по столбцам
      // принцип такой же, как и для строк
      fromY = (y === 0) ? y : y - 1;
      if (y + ky * decks === 10 && ky === 1) toY = y + ky * decks;
      else if (y + ky * decks < 10 && ky === 1) toY = y + ky * decks + 1;
      else if (y === 9 && ky === 0) toY = y + 1;
      else if (y < 9 && ky === 0) toY = y + 2;

      if (toX === undefined || toY === undefined) return false;

      // отфильтровываем ячейки, получившегося двумерного массива,
      // содержащие 1, если такие ячейки существуют - возвращаем false
      if (this.matrix.slice(fromX, toX)
        .filter(arr => arr.slice(fromY, toY).includes(1))
        .length > 0) return false;
      return true;
    }
  }

// конструктор кораблей
  class Ships {
    constructor(self, { x, y, kx, ky, decks, shipname }) {
      // с каким экземпляром работаем
      this.player = (self === human) ? human : computer;
      // this.player = self;
      // на каком поле создаётся данный корабль
      this.field = self.field;
      // уникальное имя корабля
      this.shipname = shipname;
      //количество палуб
      this.decks = decks;
      // координата X первой палубы
      this.x = x;
      // координата Y первой палубы
      this.y = y;
      // направлении расположения палуб
      this.kx = kx;
      this.ky = ky;
      // счётчик попаданий
      this.hits = 0;
      // массив с координатами палуб корабля, является элементом squadron
      this.arrDecks = [];
    }

    static showShip(self, shipname, x, y, kx) {
      // создаём новый элемент с указанным тегом
      const div = document.createElement('div');
      // из имени корабля убираем цифры и получаем имя класса
      const classname = shipname.slice(0, -1);
      // получаем имя класса в зависимости от направления расположения корабля
      const dir = (kx === 1) ? ' vertical' : '';

      // устанавливаем уникальный идентификатор для корабля
      div.setAttribute('id', shipname);
      // собираем в одну строку все классы
      div.className = `ship ${classname}${dir}`;
      // через атрибут 'style' задаём позиционирование кораблю относительно
      // его родительского элемента
      // смещение вычисляется путём умножения координаты первой палубы на
      // размер клетки игрового поля, этот размер совпадает с размером палубы
      div.style.cssText = `left:${y * Field.SHIP_SIDE - 4}px; top:${x * Field.SHIP_SIDE - 4}px;`;
      self.field.appendChild(div);
    }

    createShip() {
      let { player, field, shipname, decks, x, y, kx, ky, hits, arrDecks, k = 0 } = this;

      while (k < decks) {
        // записываем координаты корабля в двумерный массив игрового поля
        // теперь наглядно должно быть видно, зачем мы создавали два
        // коэффициента направления палуб
        // если коэффициент равен 1, то соответствующая координата будет
        // увеличиваться при каждой итерации
        // если равен нулю, то координата будет оставаться неизменной
        // таким способом мы очень сократили и унифицировали код
        let i = x + k * kx, j = y + k * ky;

        // значение 1, записанное в ячейку двумерного массива, говорит о том, что
        // по данным координатам находится палуба некого корабля
        player.matrix[i][j] = 1;
        // записываем координаты палубы
        arrDecks.push([i, j]);
        k++;
      }

      // заносим информацию о созданном корабле в объект эскадры
      player.squadron[shipname] = {arrDecks, hits, x, y, kx, ky};
      // если корабль создан для игрока, выводим его на экран
      if (player === human) {
        Ships.showShip(human, shipname, x, y, kx);
        // когда количество кораблей в эскадре достигнет 10, т.е. все корабли
        // сгенерированны, то можно показать кнопку запуска игры
        if (Object.keys(player.squadron).length === 10) {
          buttonPlay.hidden = false;
        }
      }
    }
  }

// получаем экземпляр игрового поля игрока
  const human = new Field(humanfield);
// экземпляр игрового поля компьютера только регистрируем
  let computer = {};
  const instruction = document.querySelector('.instruction');
// контейнер, в котором будут размещаться корабли, предназначенные для перетаскивания
// на игровое поле
  const shipsCollection = document.querySelector('.ships_collection');
// контейнер с набором кораблей, предназначенных для перетаскивания
// на игровое поле
  const initialShips = document.querySelector('.initial-ships');
// кнопка начала игры
  const buttonPlay = document.getElementById('play');
// кнопка перезапуска игры
  const buttonNewGame = document.getElementById('newgame');

  document.querySelector('.choice-of-arrangement').addEventListener('click', function (e) {
    if (e.target.tagName !== 'P') return;
    // если мы уже создали эскадру ранее, то видна кнопка начала игры
    // скроем её на время повторной расстановки кораблей
    buttonPlay.hidden = true;
    // очищаем игровое поле игрока, если уже была попытка расставить корабли
    human.cleanField();
    // способ расстановки кораблей на игровом поле
    const type = e.target.dataset.choise;
    // создаём литеральный объект typeGeneration
    // каждому свойству литерального объекта соответствует функция
    // в которой вызывается рандомная или ручная расстановка кораблей
    const typeGeneration = {
      random() {
        // скрываем контейнер с кораблями, предназначенными для перетаскивания
        // на игровое поле
        // shipsCollection.hidden = true;
        // вызов ф-ии рандомно расставляющей корабли для экземпляра игрока
        human.randomLocationShips();
        console.log(11)
      },
      // manually() {
      //   // этот код мы рассмотрим, когда будем реализовывать
      //   // расстановку кораблей перетаскиванием на игровое поле
      // ...
      // }
    };
    // вызов функции литерального объекта в зависимости
    // от способа расстановки кораблей
    typeGeneration[type]();
  })
})();
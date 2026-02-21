var pos1 = null;
var pos2 = null;
var pos3 = null;
var copyData = null;
var masterPlan = [];
var isBuilding = false;
var selectionMode = 0;
var lastRemainingCount = -1;
var scriptEnabled = false;
var inventoryCache = {};
var currentSlot = 0;
var blockSwitchingEnabled = true;
var rotationAngle = 0;
var mirrorMode = 0;
var history = [];
var undoHistory = [];
var templates = {};
var templateName = "";
var buildLayer = 0;
var totalLayers = 0;
var lastPreviewTime = 0;
var clipboard = null;
var blockGroups = {};
var buildQueue = [];
var currentBlockGroup = null;
var groupIndex = 0;

var geometryGenerator = null;
var sphereRadius = 5;
var pyramidHeight = 5;
var wallHeight = 3;
var currentGeometryType = "sphere";
var geometryShapes = {
    "sphere": { name: "Сфера", params: ["Радиус"] },
    "pyramid": { name: "Пирамида", params: ["Высота"] },
    "cylinder": { name: "Цилиндр", params: ["Радиус", "Высота"] },
    "cube": { name: "Куб", params: ["Сторона"] },
    "wall": { name: "Стена", params: ["Высота", "Длина", "Толщина"] },
    "dome": { name: "Купол", params: ["Радиус"] },
    "stairs": { name: "Лестница", params: ["Ширина", "Высота"] }
};
var blockInfoEnabled = true;

var currentSettings = {
    serverSafe: false,
    speed: 4,
    autoSwitch: true,
    checkInventory: true,
    exactCopy: true,
    showPreview: true,
    smartLayerMode: true,
    autoRotate: false,
    saveTemplates: true,
    undoSteps: 10,
    layerDelay: 100,
    optimizeBuilding: true,
    checkSupport: true,
    maxDistance: 6,
    autoGroupBlocks: true,
    showProgress: true,
    saveClipboard: true
};

var blockNames = {
    0: "§7Воздух",
    1: "§7Камень",
    2: "§aТрава",
    3: "§6Земля",
    4: "§7Булыжник",
    5: "§6Доски дуба",
    6: "§aСаженец дуба",
    7: "§8Бедрок",
    8: "§3Вода",
    9: "§3Вода (неподвижная)",
    10: "§cЛава",
    11: "§cЛава (неподвижная)",
    12: "§eПесок",
    13: "§8Гравий",
    14: "§eЗолотая руда",
    15: "§fЖелезная руда",
    16: "§8Угольная руда",
    17: "§6Дубовое дерево",
    18: "§aЛиства дуба",
    19: "§aГубка",
    20: "§fСтекло",
    21: "§1Лазуритовая руда",
    22: "§1Лазуритовый блок",
    23: "§8Раздатчик",
    24: "§eПесчаник",
    25: "§6Нотный блок",
    26: "§cКровать",
    27: "§8Рельсы с питанием",
    28: "§8Детекторные рельсы",
    29: "§8Липкий поршень",
    30: "§cПаутина",
    31: "§aВысокая трава",
    32: "§aМёртвый куст",
    33: "§8Поршень",
    34: "§8Выдвижной поршень",
    35: "§fШерсть",
    36: "§8Перемещённый блок",
    37: "§eОдуванчик",
    38: "§cМак",
    39: "§dКоричневый гриб",
    40: "§fКрасный гриб",
    41: "§eЗолотой блок",
    42: "§fЖелезный блок",
    43: "§6Двойные каменные плиты",
    44: "§7Каменные плиты",
    45: "§cКирпич",
    46: "§6ТНТ",
    47: "§6Книжная полка",
    48: "§aМох",
    49: "§5Обсидиан",
    50: "§eФакел",
    51: "§cОгонь",
    52: "§8Спаунер мобов",
    53: "§6Дубовые ступеньки",
    54: "§6Сундук",
    55: "§cРедстоуновая пыль",
    56: "§bАлмазная руда",
    57: "§bАлмазный блок",
    58: "§6Верстак",
    59: "§aПшеница",
    60: "§6Земля (вспаханная)",
    61: "§8Печка",
    62: "§8Печка (горит)",
    63: "§fТабличка",
    64: "§6Дубовая дверь",
    65: "§8Лестница",
    66: "§8Рельсы",
    67: "§6Каменные ступеньки",
    68: "§fНастенная табличка",
    69: "§8Рычаг",
    70: "§7Нажимная плита",
    71: "§6Железная дверь",
    72: "§7Деревянная нажимная плита",
    73: "§cРедстоуновая руда",
    74: "§cРедстоуновая руда (горит)",
    75: "§8Редстоуновый факел (выкл)",
    76: "§cРедстоуновый факел (вкл)",
    77: "§8Каменная кнопка",
    78: "§fСнежный слой",
    79: "§fЛёд",
    80: "§fСнежный блок",
    81: "§aКактус",
    82: "§fГлина",
    83: "§aСахарный тростник",
    84: "§8Джейкбокс",
    85: "§6Забор",
    86: "§cТыква",
    87: "§4Незеррак",
    88: "§4Незерраковый песок",
    89: "§eСветокамень",
    90: "§5Портал в ад",
    91: "§cСветящаяся тыква",
    92: "§fТорт",
    93: "§8Редстоун-повторитель (выкл)",
    94: "§cРедстоун-повторитель (вкл)",
    95: "§9Запертый сундук",
    96: "§6Ловушка",
    97: "§7Скрытая серебряная руда",
    98: "§7Каменный кирпич",
    99: "§aКоричневый гриб-блок",
    100: "§cКрасный гриб-блок",
    101: "§9Железная решётка",
    102: "§9Стеклянная панель",
    103: "§aАрбуз",
    104: "§aТыквенный стебель",
    105: "§aАрбузный стебель",
    106: "§aЛиана",
    107: "§6Заборные ворота",
    108: "§6Кирпичные ступеньки",
    109: "§7Ступеньки из каменного кирпича",
    110: "§aМицелий",
    111: "§aКувшинка",
    112: "§4Незер-кирпич",
    113: "§9Незер-забор",
    114: "§4Незер-ступеньки",
    115: "§dЭндер-жемчужный блок",
    116: "§6Стол зачарований",
    117: "§5Завариватель",
    118: "§5Завариватель (полный)",
    119: "§dЭндер портал",
    120: "§5Эндер портал рамка",
    121: "§5Эндерняк",
    122: "§9Драконье яйцо",
    123: "§eРедстоуновая лампа",
    124: "§eРедстоуновая лампа (вкл)",
    125: "§6Двойные доски",
    126: "§6Дубовые доски",
    127: "§6Какао-бобы",
    128: "§6Песчаниковые ступеньки",
    129: "§eИзумрудная руда",
    130: "§9Эндер-сундук",
    131: "§8Крюк-ловушка",
    132: "§8Крюк-ловушка (заряжен)",
    133: "§aИзумрудный блок",
    134: "§6Еловые ступеньки",
    135: "§6Берёзовые ступеньки",
    136: "§6Ступеньки из тёмного дуба",
    137: "§8Командный блок",
    138: "§9Маяк",
    139: "§9Каменная стена",
    140: "§6Цветочный горшок",
    141: "§aМорковь",
    142: "§6Картофель",
    143: "§8Кнопка",
    144: "§fГолова скина",
    145: "§6Наковальня",
    146: "§9Запертый сундук (траппер)",
    147: "§8Нажимная плита (золото)",
    148: "§8Нажимная плита (железо)",
    149: "§8Редстоун-компаратор (выкл)",
    150: "§cРедстоун-компаратор (вкл)",
    151: "§fСветовой датчик",
    152: "§cРедстоуновая руда",
    153: "§cКварцевая руда",
    154: "§8Воронка",
    155: "§fКварцевый блок",
    156: "§fКварцевые ступеньки",
    157: "§9Активаторные рельсы",
    158: "§8Раздатчик",
    159: "§6Терракота",
    160: "§fСтеклянная панель (цветная)",
    161: "§aЛиства (ель)",
    162: "§6Дерево (ель)",
    163: "§6Еловые ступеньки",
    164: "§6Берёзовые ступеньки",
    165: "§6Ступеньки из тёмного дуба",
    166: "§9Барьер",
    167: "§8Железная ловушка",
    168: "§7Призмарин",
    169: "§9Морской фонарь",
    170: "§6Сено",
    171: "§fКовёр",
    172: "§6Утрамбованная земля",
    173: "§8Угольный блок",
    174: "§fПакованый лёд",
    175: "§aПодсолнух",
    176: "§dСтенд для баннера",
    177: "§6Дневной датчик",
    178: "§cРедстоун-блок",
    179: "§4Красный песчаник",
    180: "§4Красные песчаниковые ступеньки",
    181: "§4Красный песчаник",
    182: "§4Красные песчаниковые ступеньки",
    183: "§6Еловые заборные ворота",
    184: "§6Берёзовые заборные ворота",
    185: "§6Заборные ворота из тёмного дуба",
    186: "§6Еловый забор",
    187: "§6Берёзовый забор",
    188: "§6Забор из тёмного дуба",
    189: "§6Еловые ступеньки",
    190: "§6Берёзовые ступеньки",
    191: "§6Ступеньки из тёмного дуба",
    192: "§6Еловые ступеньки",
    193: "§6Берёзовые ступеньки",
    194: "§6Ступеньки из тёмного дуба",
    195: "§6Еловые ступеньки",
    196: "§6Берёзовые ступеньки",
    197: "§6Ступеньки из тёмного дуба",
    198: "§6Еловые ступеньки",
    199: "§6Берёзовые ступеньки",
    200: "§6Ступеньки из тёмного дуба",
    201: "§7Призмариновый кирпич",
    202: "§7Призмариновые пластины",
    203: "§7Тёмный призмарин",
    204: "§aПризмариновый коралл",
    205: "§aПризмариновый коралл (веер)",
    206: "§aПризмариновый коралл (растение)",
    207: "§9Морской огурец",
    208: "§aСиняя ледяная глыба",
    209: "§8Структурный блок",
    210: "§8Сохраняемый структурный блок",
    211: "§8Структурный пустой блок",
    212: "§8Лёд",
    213: "§cМагма",
    214: "§4Незерварт",
    215: "§cКрасный незер-кирпич",
    216: "§4Костяной блок",
    217: "§fСтруктурная пустота",
    218: "§8Наблюдатель",
    219: "§7Белый бетон",
    220: "§6Оранжевый бетон",
    221: "§5Пурпурный бетон",
    222: "§bГолубой бетон",
    223: "§eЖёлтый бетон",
    224: "§aLime бетон",
    225: "§dРозовый бетон",
    226: "§8Серый бетон",
    227: "§7Светло-серый бетон",
    228: "§3Бирюзовый бетон",
    229: "§5Фиолетовый бетон",
    230: "§1Синий бетон",
    231: "§4Коричневый бетон",
    232: "§2Зелёный бетон",
    233: "§cКрасный бетон",
    234: "§0Чёрный бетон",
    235: "§fБелый стекло",
    236: "§6Оранжевое стекло",
    237: "§5Пурпурное стекло",
    238: "§bГолубое стекло",
    239: "§eЖёлтое стекло",
    240: "§aLime стекло",
    241: "§dРозовое стекло",
    242: "§8Серое стекло",
    243: "§7Светло-серое стекло",
    244: "§3Бирюзовое стекло",
    245: "§5Фиолетовое стекло",
    246: "§1Синее стекло",
    247: "§4Коричневое стекло",
    248: "§2Зелёное стекло",
    249: "§cКрасное стекло",
    250: "§0Чёрное стекло",
    251: "§fБелый терракота",
    252: "§6Оранжевая терракота",
    253: "§5Пурпурная терракота",
    254: "§bГолубая терракота",
    255: "§eЖёлтая терракота"
};

function showBlockInfo(blockId) {
    var id = parseInt(blockId);
    if (isNaN(id)) {
        Level.displayClientMessage("§c❌ Введите число!");
        return;
    }
    
    if (id < 0) {
        Level.displayClientMessage("§c❌ ID блока не может быть отрицательным");
        return;
    }
    
    var blockName = blockNames[id];
    if (blockName) {
        Level.displayClientMessage("§a════ Информация о блоке ════");
        Level.displayClientMessage("§7ID: §f" + id);
        Level.displayClientMessage("§7Название: " + blockName);
        Level.displayClientMessage("§7Твердость: " + (Block.isSolid(id) ? "§aТвердый" : "§cМягкий"));
        var friction = Block.getFriction(id);
        if (friction > 0) {
            Level.displayClientMessage("§7Трение: " + friction.toFixed(2));
        }
    } else {
        Level.displayClientMessage("§c❌ Блок с ID §f" + id + "§c не найден");
        Level.displayClientMessage("§7Это может быть несуществующий ID или спецблок");
    }
}

function generateSphere(centerX, centerY, centerZ, radius, blockId) {
    var plan = [];
    var radiusSq = radius * radius;
    
    for (var y = -radius; y <= radius; y++) {
        for (var x = -radius; x <= radius; x++) {
            for (var z = -radius; z <= radius; z++) {
                var distanceSq = x*x + y*y + z*z;
                if (distanceSq <= radiusSq && distanceSq > (radius-1)*(radius-1)) {
                    plan.push({
                        x: centerX + x,
                        y: centerY + y,
                        z: centerZ + z,
                        targetId: blockId,
                        placed: false,
                        layer: y + radius,
                        priority: y * 1000 + Math.abs(x) + Math.abs(z)
                    });
                }
            }
        }
    }
    
    return plan;
}

function generatePyramid(baseX, baseY, baseZ, height, blockId) {
    var plan = [];
    
    for (var level = 0; level < height; level++) {
        var size = height - level;
        for (var x = -size; x <= size; x++) {
            for (var z = -size; z <= size; z++) {
                if (Math.abs(x) === size || Math.abs(z) === size) {
                    plan.push({
                        x: baseX + x,
                        y: baseY + level,
                        z: baseZ + z,
                        targetId: blockId,
                        placed: false,
                        layer: level,
                        priority: level * 1000 + Math.abs(x) + Math.abs(z)
                    });
                }
            }
        }
    }
    
    return plan;
}

function generateCylinder(centerX, centerY, centerZ, radius, height, blockId) {
    var plan = [];
    var radiusSq = radius * radius;
    
    for (var y = 0; y < height; y++) {
        for (var x = -radius; x <= radius; x++) {
            for (var z = -radius; z <= radius; z++) {
                if (x*x + z*z <= radiusSq) {
                    plan.push({
                        x: centerX + x,
                        y: centerY + y,
                        z: centerZ + z,
                        targetId: blockId,
                        placed: false,
                        layer: y,
                        priority: y * 1000 + Math.abs(x) + Math.abs(z)
                    });
                }
            }
        }
    }
    
    return plan;
}

function generateCube(cornerX, cornerY, cornerZ, size, blockId) {
    var plan = [];
    
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            for (var z = 0; z < size; z++) {
                var isSurface = x === 0 || x === size-1 || y === 0 || y === size-1 || z === 0 || z === size-1;
                if (isSurface) {
                    plan.push({
                        x: cornerX + x,
                        y: cornerY + y,
                        z: cornerZ + z,
                        targetId: blockId,
                        placed: false,
                        layer: y,
                        priority: y * 1000 + x + z
                    });
                }
            }
        }
    }
    
    return plan;
}

function generateWall(startX, startY, startZ, height, length, thickness, blockId) {
    var plan = [];
    
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < length; x++) {
            for (var z = 0; z < thickness; z++) {
                plan.push({
                    x: startX + x,
                    y: startY + y,
                    z: startZ + z,
                    targetId: blockId,
                    placed: false,
                    layer: y,
                    priority: y * 1000 + x + z
                });
            }
        }
    }
    
    return plan;
}

function generateDome(centerX, centerY, centerZ, radius, blockId) {
    var plan = [];
    var radiusSq = radius * radius;
    
    for (var y = 0; y <= radius; y++) {
        for (var x = -radius; x <= radius; x++) {
            for (var z = -radius; z <= radius; z++) {
                var distanceSq = x*x + y*y + z*z;
                if (distanceSq <= radiusSq && y >= 0) {
                    plan.push({
                        x: centerX + x,
                        y: centerY + y,
                        z: centerZ + z,
                        targetId: blockId,
                        placed: false,
                        layer: y,
                        priority: y * 1000 + Math.abs(x) + Math.abs(z)
                    });
                }
            }
        }
    }
    
    return plan;
}

function generateStairs(startX, startY, startZ, width, height, blockId) {
    var plan = [];
    
    for (var step = 0; step < height; step++) {
        for (var y = 0; y <= step; y++) {
            for (var x = 0; x < width; x++) {
                plan.push({
                    x: startX + x,
                    y: startY + step,
                    z: startZ + step,
                    targetId: blockId,
                    placed: false,
                    layer: step,
                    priority: step * 1000 + y
                });
            }
        }
    }
    
    return plan;
}

function buildGeometry() {
    if (!pos3) {
        Level.displayClientMessage("§c❌ Установи точку вставки!");
        return;
    }
    
    var blockId = Item.getID(Inventory.getSelectedSlot());
    if (blockId <= 0) {
        Level.displayClientMessage("§c❌ Возьми блок в руку!");
        return;
    }
    
    var plan = [];
    
    switch (currentGeometryType) {
        case "sphere":
            plan = generateSphere(pos3.x, pos3.y, pos3.z, sphereRadius, blockId);
            Level.displayClientMessage("§a🔮 Генерирую сферу радиусом " + sphereRadius);
            break;
        case "pyramid":
            plan = generatePyramid(pos3.x, pos3.y, pos3.z, pyramidHeight, blockId);
            Level.displayClientMessage("§a🔺 Генерирую пирамиду высотой " + pyramidHeight);
            break;
        case "cylinder":
            plan = generateCylinder(pos3.x, pos3.y, pos3.z, sphereRadius, pyramidHeight, blockId);
            Level.displayClientMessage("§a🔼 Генерирую цилиндр r=" + sphereRadius + " h=" + pyramidHeight);
            break;
        case "cube":
            plan = generateCube(pos3.x, pos3.y, pos3.z, sphereRadius, blockId);
            Level.displayClientMessage("§a⬛ Генерирую куб стороной " + sphereRadius);
            break;
        case "wall":
            plan = generateWall(pos3.x, pos3.y, pos3.z, wallHeight, sphereRadius, pyramidHeight, blockId);
            Level.displayClientMessage("§a🧱 Генерирую стену " + sphereRadius + "x" + wallHeight);
            break;
        case "dome":
            plan = generateDome(pos3.x, pos3.y, pos3.z, sphereRadius, blockId);
            Level.displayClientMessage("§a🏛️ Генерирую купол радиусом " + sphereRadius);
            break;
        case "stairs":
            plan = generateStairs(pos3.x, pos3.y, pos3.z, sphereRadius, pyramidHeight, blockId);
            Level.displayClientMessage("§a⬆️ Генерирую лестницу " + sphereRadius + "x" + pyramidHeight);
            break;
    }
    
    if (plan.length === 0) {
        Level.displayClientMessage("§c❌ Не удалось сгенерировать фигуру");
        return;
    }
    
    Level.displayClientMessage("§a📦 Сгенерировано блоков: §e" + plan.length);
    Level.displayClientMessage("§7⚡ Используется автоматическое строительство");
    
    startConstruction(plan);
    saveToHistory("Построение " + geometryShapes[currentGeometryType].name);
}

function showGeometryHelp() {
    Level.displayClientMessage("§6=== Геометрические фигуры ===");
    Level.displayClientMessage("§7.geometry sphere 5 - сфера радиусом 5");
    Level.displayClientMessage("§7.geometry pyramid 7 - пирамида высотой 7");
    Level.displayClientMessage("§7.geometry cylinder 5 8 - цилиндр r=5 h=8");
    Level.displayClientMessage("§7.geometry cube 10 - куб стороной 10");
    Level.displayClientMessage("§7.geometry wall 3 10 2 - стена h=3 l=10 t=2");
    Level.displayClientMessage("§7.geometry dome 6 - купол радиусом 6");
    Level.displayClientMessage("§7.geometry stairs 4 10 - лестница w=4 h=10");
    Level.displayClientMessage("§7.buildgeo - построить выбранную фигуру");
    Level.displayClientMessage("§7Возьми блок в руку для строительства");
}

function clearAll() {
    masterPlan = [];
    isBuilding = false;
    lastRemainingCount = -1;
    copyData = null;
    buildLayer = 0;
    totalLayers = 0;
    clipboard = null;
    blockGroups = {};
    buildQueue = [];
    currentBlockGroup = null;
    groupIndex = 0;
    Level.displayClientMessage("§eВсе операции сброшены");
}

function clearSelection() {
    pos1 = null;
    pos2 = null;
    pos3 = null;
    selectionMode = 0;
    Level.displayClientMessage("§eВыделение сброшено");
}

function saveToHistory(action, data) {
    history.push({
        action: action,
        timestamp: new Date().getTime(),
        copyData: copyData ? JSON.parse(JSON.stringify(copyData)) : null,
        clipboard: clipboard ? JSON.parse(JSON.stringify(clipboard)) : null,
        pos1: pos1,
        pos2: pos2,
        pos3: pos3,
        data: data
    });
    
    if (history.length > currentSettings.undoSteps) {
        history.shift();
    }
    undoHistory = [];
}

function undo() {
    if (history.length === 0) {
        Level.displayClientMessage("§cНет действий для отмены");
        return;
    }
    
    var lastAction = history.pop();
    undoHistory.push(lastAction);
    
    copyData = lastAction.copyData;
    clipboard = lastAction.clipboard;
    pos1 = lastAction.pos1;
    pos2 = lastAction.pos2;
    pos3 = lastAction.pos3;
    
    Level.displayClientMessage("§aОтменено: " + lastAction.action);
}

function redo() {
    if (undoHistory.length === 0) {
        Level.displayClientMessage("§cНет действий для повтора");
        return;
    }
    
    var lastUndo = undoHistory.pop();
    history.push(lastUndo);
    
    copyData = lastUndo.copyData;
    clipboard = lastUndo.clipboard;
    pos1 = lastUndo.pos1;
    pos2 = lastUndo.pos2;
    pos3 = lastUndo.pos3;
    
    Level.displayClientMessage("§aПовторено: " + lastUndo.action);
}

function setPoint1() {
    if (currentSettings.serverSafe) {
        var p = {
            x: Math.floor(LocalPlayer.getPositionX()),
            y: Math.floor(LocalPlayer.getPositionY() - 1),
            z: Math.floor(LocalPlayer.getPositionZ())
        };
        pos1 = p;
        Level.displayClientMessage("§a✅ Точка 1: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Точка 1 установлена");
    } else {
        selectionMode = 1;
        Level.displayClientMessage("§a🖱️ Кликни на блок для точки 1");
    }
}

function setPoint2() {
    if (currentSettings.serverSafe) {
        var p = {
            x: Math.floor(LocalPlayer.getPositionX()),
            y: Math.floor(LocalPlayer.getPositionY() - 1),
            z: Math.floor(LocalPlayer.getPositionZ())
        };
        pos2 = p;
        Level.displayClientMessage("§a✅ Точка 2: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Точка 2 установлена");
    } else {
        selectionMode = 2;
        Level.displayClientMessage("§a🖱️ Кликни на блок для точки 2");
    }
}

function setPoint3() {
    if (currentSettings.serverSafe) {
        var p = {
            x: Math.floor(LocalPlayer.getPositionX()),
            y: Math.floor(LocalPlayer.getPositionY() - 1),
            z: Math.floor(LocalPlayer.getPositionZ())
        };
        pos3 = p;
        Level.displayClientMessage("§a📍 Точка вставки: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Точка вставки установлена");
    } else {
        selectionMode = 3;
        Level.displayClientMessage("§a🖱️ Кликни на блок для точки вставки");
    }
}

function rotateCopy(angle) {
    if (!copyData) {
        Level.displayClientMessage("§cСначала скопируй область!");
        return;
    }
    
    rotationAngle = (rotationAngle + angle) % 360;
    
    var rotatedBlocks = [];
    var newSizeX = angle % 180 === 0 ? copyData.sizeX : copyData.sizeZ;
    var newSizeZ = angle % 180 === 0 ? copyData.sizeZ : copyData.sizeX;
    
    for (var i = 0; i < copyData.blocks.length; i++) {
        var block = copyData.blocks[i];
        var newX, newZ;
        
        switch (angle) {
            case 90:
                newX = copyData.sizeZ - 1 - block.relZ;
                newZ = block.relX;
                break;
            case 180:
                newX = copyData.sizeX - 1 - block.relX;
                newZ = copyData.sizeZ - 1 - block.relZ;
                break;
            case 270:
                newX = block.relZ;
                newZ = copyData.sizeX - 1 - block.relX;
                break;
            default:
                newX = block.relX;
                newZ = block.relZ;
        }
        
        rotatedBlocks.push({
            relX: newX,
            relY: block.relY,
            relZ: newZ,
            id: block.id
        });
    }
    
    copyData.blocks = rotatedBlocks;
    copyData.sizeX = newSizeX;
    copyData.sizeZ = newSizeZ;
    
    Level.displayClientMessage("§a🔄 Повернуто на " + angle + "°");
    saveToHistory("Поворот " + angle + "°");
}

function mirrorCopy(axis) {
    if (!copyData) {
        Level.displayClientMessage("§cСначала скопируй область!");
        return;
    }
    
    mirrorMode = axis;
    var mirroredBlocks = [];
    
    for (var i = 0; i < copyData.blocks.length; i++) {
        var block = copyData.blocks[i];
        var newRelX = block.relX;
        var newRelZ = block.relZ;
        
        if (axis === 1) {
            newRelX = copyData.sizeX - 1 - block.relX;
        } else if (axis === 2) {
            newRelZ = copyData.sizeZ - 1 - block.relZ;
        } else if (axis === 3) {
            newRelX = copyData.sizeX - 1 - block.relX;
            newRelZ = copyData.sizeZ - 1 - block.relZ;
        }
        
        mirroredBlocks.push({
            relX: newRelX,
            relY: block.relY,
            relZ: newRelZ,
            id: block.id
        });
    }
    
    copyData.blocks = mirroredBlocks;
    Level.displayClientMessage("§a🪞 Отражено по " + (axis === 1 ? "X" : axis === 2 ? "Z" : "XZ") + " оси");
    saveToHistory("Отражение " + (axis === 1 ? "X" : axis === 2 ? "Z" : "XZ"));
}

function scanInventory() {
    inventoryCache = {};
    for (var slot = 0; slot < 36; slot++) {
        var blockId = Item.getID(slot);
        if (blockId > 0) {
            if (!inventoryCache[blockId]) {
                inventoryCache[blockId] = [];
            }
            inventoryCache[blockId].push({
                slot: slot,
                count: Item.getCount(slot),
                maxCount: Item.getMaxStackSize(slot)
            });
        }
    }
}

function findBestBlockSlot(blockId) {
    if (!inventoryCache[blockId]) return -1;
    
    var bestSlot = -1;
    var maxCount = -1;
    
    for (var i = 0; i < inventoryCache[blockId].length; i++) {
        var item = inventoryCache[blockId][i];
        if (item.count > maxCount) {
            maxCount = item.count;
            bestSlot = item.slot;
        }
    }
    
    return bestSlot;
}

function moveBlockToHand(blockId) {
    var bestSlot = findBestBlockSlot(blockId);
    if (bestSlot === -1) return false;
    
    if (bestSlot >= 0 && bestSlot <= 8) {
        Inventory.setSelectedSlot(bestSlot);
        currentSlot = bestSlot;
        return true;
    }
    
    for (var hotbarSlot = 0; hotbarSlot <= 8; hotbarSlot++) {
        var hotbarItemId = Item.getID(hotbarSlot);
        if (hotbarItemId === 0) {
            Inventory.swapSlots(bestSlot, hotbarSlot);
            Inventory.setSelectedSlot(hotbarSlot);
            currentSlot = hotbarSlot;
            scanInventory();
            return true;
        }
    }
    
    for (var hotbarSlot2 = 0; hotbarSlot2 <= 8; hotbarSlot2++) {
        var hotbarItemId2 = Item.getID(hotbarSlot2);
        if (hotbarItemId2 === blockId && Item.getCount(hotbarSlot2) < Item.getMaxStackSize(hotbarSlot2)) {
            Inventory.setSelectedSlot(hotbarSlot2);
            currentSlot = hotbarSlot2;
            return true;
        }
    }
    
    return false;
}

function useBlockFromInventory(blockId) {
    if (!currentSettings.autoSwitch) {
        var currentBlockId = Item.getID(Inventory.getSelectedSlot());
        return currentBlockId === blockId && Item.getCount(Inventory.getSelectedSlot()) > 0;
    }
    
    var currentBlockId = Item.getID(Inventory.getSelectedSlot());
    if (currentBlockId === blockId && Item.getCount(Inventory.getSelectedSlot()) > 0) {
        updateInventoryCache(blockId, Inventory.getSelectedSlot());
        return true;
    }
    
    if (moveBlockToHand(blockId)) {
        updateInventoryCache(blockId, Inventory.getSelectedSlot());
        return true;
    }
    
    return false;
}

function updateInventoryCache(blockId, slot) {
    if (!inventoryCache[blockId]) return;
    
    for (var i = 0; i < inventoryCache[blockId].length; i++) {
        if (inventoryCache[blockId][i].slot === slot) {
            inventoryCache[blockId][i].count--;
            if (inventoryCache[blockId][i].count <= 0) {
                inventoryCache[blockId].splice(i, 1);
            }
            break;
        }
    }
}

function copyRegion() {
    if (!pos1 || !pos2) {
        Level.displayClientMessage("§c❌ Установи обе точки для копирования!");
        return;
    }
    
    scanInventory();
    
    var minX = Math.min(pos1.x, pos2.x);
    var minY = Math.min(pos1.y, pos2.y);
    var minZ = Math.min(pos1.z, pos2.z);
    var maxX = Math.max(pos1.x, pos2.x);
    var maxY = Math.max(pos1.y, pos2.y);
    var maxZ = Math.max(pos1.z, pos2.z);
    
    copyData = {
        blocks: [],
        layers: {},
        sizeX: maxX - minX + 1,
        sizeY: maxY - minY + 1,
        sizeZ: maxZ - minZ + 1,
        offsetX: minX,
        offsetY: minY,
        offsetZ: minZ,
        requiredBlocks: {},
        blockStats: {},
        materialList: {}
    };
    
    totalLayers = maxY - minY + 1;
    
    for (var y = minY; y <= maxY; y++) {
        var layerBlocks = [];
        for (var x = minX; x <= maxX; x++) {
            for (var z = minZ; z <= maxZ; z++) {
                var blockId = Block.getID(x, y, z);
                if (blockId !== 0) {
                    var relX = x - minX;
                    var relY = y - minY;
                    var relZ = z - minZ;
                    
                    var blockInfo = {
                        relX: relX,
                        relY: relY,
                        relZ: relZ,
                        id: blockId,
                        x: x,
                        y: y,
                        z: z,
                        solid: Block.isSolid(blockId)
                    };
                    
                    copyData.blocks.push(blockInfo);
                    layerBlocks.push(blockInfo);
                    
                    if (!copyData.requiredBlocks[blockId]) {
                        copyData.requiredBlocks[blockId] = 0;
                    }
                    copyData.requiredBlocks[blockId]++;
                    
                    if (!copyData.blockStats[blockId]) {
                        copyData.blockStats[blockId] = 0;
                    }
                    copyData.blockStats[blockId]++;
                    
                    if (!copyData.materialList[blockId]) {
                        copyData.materialList[blockId] = 0;
                    }
                    copyData.materialList[blockId]++;
                }
            }
        }
        copyData.layers[y - minY] = layerBlocks;
    }
    
    Level.displayClientMessage("§a📋 Копия создана!");
    Level.displayClientMessage("§7📦 Блоков: §e" + copyData.blocks.length);
    Level.displayClientMessage("§7📊 Слоев: §e" + totalLayers);
    Level.displayClientMessage("§7📏 Размер: §e" + copyData.sizeX + "x" + copyData.sizeY + "x" + copyData.sizeZ);
    
    if (currentSettings.checkInventory) {
        checkInventoryForCopy();
    }
    
    saveToHistory("Копирование области");
    
    clipboard = JSON.parse(JSON.stringify(copyData));
    Level.displayClientMessage("§a💾 Сохранено в буфер обмена");
    
    if (currentSettings.saveTemplates) {
        showTemplateSaveDialog();
    }
}

function showTemplateSaveDialog() {
    Level.displayClientMessage("§6💾 Сохранить как шаблон?");
    Level.displayClientMessage("§7Команда: §f.save имя");
}

function saveTemplate(name) {
    if (!copyData) {
        Level.displayClientMessage("§c❌ Нет данных для сохранения!");
        return;
    }
    
    templates[name] = {
        data: JSON.parse(JSON.stringify(copyData)),
        timestamp: new Date().getTime(),
        size: copyData.blocks.length,
        dimensions: {
            width: copyData.sizeX,
            height: copyData.sizeY,
            depth: copyData.sizeZ
        }
    };
    
    Data.saveString("we_templates", JSON.stringify(templates));
    Level.displayClientMessage("§a✅ Шаблон сохранен: §e" + name);
    saveToHistory("Сохранение шаблона " + name);
}

function quickSaveTemplate() {
    if (!copyData) {
        Level.displayClientMessage("§c❌ Нет данных для сохранения!");
        return;
    }
    
    var timestamp = new Date().getTime();
    var name = "template_" + timestamp;
    
    templates[name] = {
        data: JSON.parse(JSON.stringify(copyData)),
        timestamp: timestamp,
        size: copyData.blocks.length,
        dimensions: {
            width: copyData.sizeX,
            height: copyData.sizeY,
            depth: copyData.sizeZ
        }
    };
    
    Data.saveString("we_templates", JSON.stringify(templates));
    Level.displayClientMessage("§a✅ Шаблон сохранен: §e" + name);
    saveToHistory("Быстрое сохранение шаблона");
}

function loadTemplate(name) {
    if (!templates[name]) {
        Level.displayClientMessage("§c❌ Шаблон не найден: " + name);
        return;
    }
    
    copyData = JSON.parse(JSON.stringify(templates[name].data));
    totalLayers = copyData.sizeY;
    Level.displayClientMessage("§a📂 Шаблон загружен: §e" + name);
    Level.displayClientMessage("§7📦 Блоков: " + copyData.blocks.length);
    Level.displayClientMessage("§7📏 Размер: " + copyData.sizeX + "x" + copyData.sizeY + "x" + copyData.sizeZ);
    
    saveToHistory("Загрузка шаблона " + name);
}

function listTemplates() {
    var templateNames = Object.keys(templates);
    if (templateNames.length === 0) {
        Level.displayClientMessage("§c📭 Нет сохраненных шаблонов");
        return;
    }
    
    Level.displayClientMessage("§6📚 Сохраненные шаблоны (" + templateNames.length + "):");
    for (var i = 0; i < templateNames.length; i++) {
        var name = templateNames[i];
        var template = templates[name];
        var date = new Date(template.timestamp).toLocaleDateString();
        Level.displayClientMessage("§7" + (i+1) + ". §e" + name + "§7 - " + 
                                 template.size + " блоков, " + 
                                 template.dimensions.width + "x" + 
                                 template.dimensions.height + "x" + 
                                 template.dimensions.depth + " (" + date + ")");
    }
}

function checkInventoryForCopy() {
    var missing = [];
    var totalMissing = 0;
    var warnings = [];
    
    for (var blockId in copyData.requiredBlocks) {
        if (copyData.requiredBlocks.hasOwnProperty(blockId)) {
            var needed = copyData.requiredBlocks[blockId];
            var have = 0;
            
            if (inventoryCache[blockId]) {
                for (var i = 0; i < inventoryCache[blockId].length; i++) {
                    have += inventoryCache[blockId][i].count;
                }
            }
            
            if (have < needed) {
                missing.push({
                    id: blockId,
                    need: needed,
                    have: have,
                    missing: needed - have
                });
                totalMissing += (needed - have);
            } else if (have === needed) {
                warnings.push("ID " + blockId + ": ровно " + have + " (без запаса)");
            }
        }
    }
    
    if (missing.length > 0) {
        Level.displayClientMessage("§c⚠️ Не хватает §e" + totalMissing + "§c блоков:");
        for (var i = 0; i < Math.min(missing.length, 5); i++) {
            Level.displayClientMessage("§cID " + missing[i].id + ": " + missing[i].have + "/" + missing[i].need + " (-" + missing[i].missing + ")");
        }
        if (missing.length > 5) {
            Level.displayClientMessage("§c... и еще " + (missing.length - 5) + " видов блоков");
        }
    } else if (warnings.length > 0) {
        Level.displayClientMessage("§6ℹ️ Внимание: некоторые блоки без запаса");
        for (var j = 0; j < Math.min(warnings.length, 3); j++) {
            Level.displayClientMessage("§6" + warnings[j]);
        }
    } else {
        Level.displayClientMessage("§a✅ Все блоки есть в инвентаре!");
    }
}

function pasteAndBuild() {
    if (!copyData) {
        Level.displayClientMessage("§c❌ Сначала скопируй область!");
        return;
    }
    
    if (!pos3) {
        Level.displayClientMessage("§c❌ Установи точку вставки!");
        return;
    }
    
    scanInventory();
    
    if (currentSettings.checkInventory) {
        var canPaste = true;
        var missingBlocks = [];
        
        for (var blockId in copyData.requiredBlocks) {
            if (copyData.requiredBlocks.hasOwnProperty(blockId)) {
                var needed = copyData.requiredBlocks[blockId];
                var have = 0;
                
                if (inventoryCache[blockId]) {
                    for (var i = 0; i < inventoryCache[blockId].length; i++) {
                        have += inventoryCache[blockId][i].count;
                    }
                }
                
                if (have < needed) {
                    canPaste = false;
                    missingBlocks.push("ID " + blockId + ": " + have + "/" + needed);
                }
            }
        }
        
        if (!canPaste) {
            Level.displayClientMessage("§c❌ Не хватает блоков для строительства!");
            for (var j = 0; j < Math.min(missingBlocks.length, 3); j++) {
                Level.displayClientMessage("§c" + missingBlocks[j]);
            }
            Level.displayClientMessage("§7🔧 Отключи проверку инвентаря или добавь блоки");
            return;
        }
    }
    
    Level.displayClientMessage("§a🚀 Начинаю оптимизированное строительство...");
    Level.displayClientMessage("§7⚡ Автоматически переключаю блоки");
    Level.displayClientMessage("§7🏗️ Строю снизу вверх для стабильности");
    
    var plan = [];
    blockGroups = {};
    buildQueue = [];
    
    for (var i = 0; i < copyData.blocks.length; i++) {
        var block = copyData.blocks[i];
        var targetX = pos3.x + block.relX;
        var targetY = pos3.y + block.relY;
        var targetZ = pos3.z + block.relZ;
        
        var existingBlockId = Block.getID(targetX, targetY, targetZ);
        
        if (existingBlockId !== block.id) {
            if (!blockGroups[block.id]) {
                blockGroups[block.id] = [];
            }
            
            blockGroups[block.id].push({
                x: targetX,
                y: targetY,
                z: targetZ,
                id: block.id,
                layer: block.relY,
                requiresSupport: currentSettings.checkSupport && block.solid,
                priority: block.relY * 1000 + (block.relX + block.relZ)
            });
        }
    }
    
    var blockTypes = Object.keys(blockGroups);
    
    for (var b = 0; b < blockTypes.length; b++) {
        var blockId = parseInt(blockTypes[b]);
        var group = blockGroups[blockId];
        
        group.sort(function(a, b) {
            if (a.layer !== b.layer) return a.layer - b.layer;
            if (a.priority !== b.priority) return a.priority - b.priority;
            return 0;
        });
        
        buildQueue.push({
            blockId: blockId,
            blocks: group,
            index: 0,
            total: group.length
        });
    }
    
    if (buildQueue.length === 0) {
        Level.displayClientMessage("§a✅ Область уже построена!");
        return;
    }
    
    currentBlockGroup = buildQueue[0];
    groupIndex = 0;
    
    Level.displayClientMessage("§a🏗️ Строительство начато!");
    Level.displayClientMessage("§7📦 Всего блоков: §e" + copyData.blocks.length);
    Level.displayClientMessage("§7🎯 Групп блоков: §e" + buildQueue.length);
    Level.displayClientMessage("§7⚡ Скорость: §e" + currentSettings.speed + "§7 блоков/тик");
    
    isBuilding = true;
    blockSwitchingEnabled = true;
    
    saveToHistory("Вставка и строительство");
}

function showBlockStatistics() {
    if (!copyData || !copyData.blockStats) {
        Level.displayClientMessage("§c❌ Нет статистики по блокам");
        return;
    }
    
    var stats = [];
    var totalBlocks = 0;
    
    for (var blockId in copyData.blockStats) {
        if (copyData.blockStats.hasOwnProperty(blockId)) {
            stats.push({
                id: blockId,
                count: copyData.blockStats[blockId]
            });
            totalBlocks += copyData.blockStats[blockId];
        }
    }
    
    stats.sort(function(a, b) {
        return b.count - a.count;
    });
    
    Level.displayClientMessage("§6📊 Статистика блоков (" + totalBlocks + " всего):");
    for (var i = 0; i < Math.min(stats.length, 10); i++) {
        var percentage = ((stats[i].count / totalBlocks) * 100).toFixed(1);
        Level.displayClientMessage("§7" + (i+1) + ". ID " + stats[i].id + ": §e" + 
                                 stats[i].count + "§7 блоков (§6" + percentage + "%§7)");
    }
    
    if (stats.length > 10) {
        Level.displayClientMessage("§7... и еще " + (stats.length - 10) + " видов блоков");
    }
}

function showMaterialList() {
    if (!copyData || !copyData.materialList) {
        Level.displayClientMessage("§c❌ Нет списка материалов");
        return;
    }
    
    var materials = [];
    for (var blockId in copyData.materialList) {
        if (copyData.materialList.hasOwnProperty(blockId)) {
            materials.push({
                id: blockId,
                count: copyData.materialList[blockId]
            });
        }
    }
    
    materials.sort(function(a, b) {
        return b.count - a.count;
    });
    
    Level.displayClientMessage("§6📝 Список материалов для постройки:");
    Level.displayClientMessage("§7Собери эти блоки перед строительством:");
    
    for (var i = 0; i < Math.min(materials.length, 15); i++) {
        Level.displayClientMessage("§7- ID " + materials[i].id + ": §e" + materials[i].count + "§7 шт.");
    }
    
    if (materials.length > 15) {
        Level.displayClientMessage("§7... и еще " + (materials.length - 15) + " видов блоков");
    }
}

function showPreview() {
    if (!copyData || !pos3) {
        Level.displayClientMessage("§c❌ Сначала скопируй и установи точку вставки");
        return;
    }
    
    Level.displayClientMessage("§6👁️ ПРЕДПРОСМОТР ПОСТРОЙКИ");
    Level.displayClientMessage("§7📏 Размер: §e" + copyData.sizeX + "x" + copyData.sizeY + "x" + copyData.sizeZ);
    Level.displayClientMessage("§7📦 Блоков: §e" + copyData.blocks.length);
    Level.displayClientMessage("§7📍 Начало: §e" + pos3.x + "," + pos3.y + "," + pos3.z);
    Level.displayClientMessage("§7🎯 Конец: §e" + (pos3.x + copyData.sizeX - 1) + "," + 
                              (pos3.y + copyData.sizeY - 1) + "," + 
                              (pos3.z + copyData.sizeZ - 1));
    
    if (currentSettings.checkInventory) {
        checkInventoryForCopy();
    }
}

function fillArea(blockId) {
    if (!pos1 || !pos2) {
        Level.displayClientMessage("§c❌ Установи область для заполнения!");
        return;
    }
    
    if (blockId === -1) {
        Level.displayClientMessage("§c❌ Выбери блок для заполнения!");
        return;
    }
    
    var plan = [];
    var minX = Math.min(pos1.x, pos2.x);
    var minY = Math.min(pos1.y, pos2.y);
    var minZ = Math.min(pos1.z, pos2.z);
    var maxX = Math.max(pos1.x, pos2.x);
    var maxY = Math.max(pos1.y, pos2.y);
    var maxZ = Math.max(pos1.z, pos2.z);
    
    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            for (var z = minZ; z <= maxZ; z++) {
                plan.push({
                    x: x,
                    y: y,
                    z: z,
                    targetId: blockId,
                    placed: false,
                    layer: y - minY,
                    priority: y * 1000 + x
                });
            }
        }
    }
    
    startConstruction(plan);
    Level.displayClientMessage("§a🧱 Заполнение области начато");
    saveToHistory("Заполнение области " + blockId);
}

function clearArea() {
    if (!pos1 || !pos2) {
        Level.displayClientMessage("§c❌ Установи область для очистки!");
        return;
    }
    
    Level.displayClientMessage("§a🗑️ Начинаю очистку области...");
    fillArea(0);
}

function startConstruction(plan) {
    if (plan.length === 0) {
        Level.displayClientMessage("§e⚠️ Нечего строить");
        return;
    }
    
    plan.sort(function(a, b) {
        return a.priority - b.priority;
    });

    masterPlan = plan;
    lastRemainingCount = -1;
    currentSlot = Inventory.getSelectedSlot();
    
    Level.displayClientMessage("§a🏗️ Строительство начато!");
    Level.displayClientMessage("§7📦 Всего операций: §e" + masterPlan.length);
    
    isBuilding = true;
    blockSwitchingEnabled = true;
}

var serverSafeModeSetting = new StateSetting("Для сервера", false);
serverSafeModeSetting.setOnStateToggleListener(function(state) {
    currentSettings.serverSafe = state;
});

var checkInventorySetting = new StateSetting("Проверять инвентарь", true);
checkInventorySetting.setOnStateToggleListener(function(state) {
    currentSettings.checkInventory = state;
});

var autoSwitchSetting = new StateSetting("Авто-переключение", true);
autoSwitchSetting.setOnStateToggleListener(function(state) {
    currentSettings.autoSwitch = state;
});

var exactCopySetting = new StateSetting("Точная копия", true);
exactCopySetting.setOnStateToggleListener(function(state) {
    currentSettings.exactCopy = state;
});

var smartLayerSetting = new StateSetting("Умные слои", true);
smartLayerSetting.setOnStateToggleListener(function(state) {
    currentSettings.smartLayerMode = state;
});

var saveTemplatesSetting = new StateSetting("Сохранять шаблоны", true);
saveTemplatesSetting.setOnStateToggleListener(function(state) {
    currentSettings.saveTemplates = state;
});

var checkSupportSetting = new StateSetting("Проверка опоры", true);
checkSupportSetting.setOnStateToggleListener(function(state) {
    currentSettings.checkSupport = state;
});

var optimizeBuildingSetting = new StateSetting("Оптимизация", true);
optimizeBuildingSetting.setOnStateToggleListener(function(state) {
    currentSettings.optimizeBuilding = state;
});

var showProgressSetting = new StateSetting("Показ прогресса", true);
showProgressSetting.setOnStateToggleListener(function(state) {
    currentSettings.showProgress = state;
});

var speedSlider = new SliderSetting("Скорость (блоков/тик)", [currentSettings.speed, 1, 20, 1]);
speedSlider.setOnCurrentValueChangedListener(function(value) {
    currentSettings.speed = value;
});

var undoStepsSlider = new SliderSetting("Глубина истории", [currentSettings.undoSteps, 1, 50, 1]);
undoStepsSlider.setOnCurrentValueChangedListener(function(value) {
    currentSettings.undoSteps = value;
});

var layerDelaySlider = new SliderSetting("Задержка слоя (мс)", [currentSettings.layerDelay, 0, 2000, 50]);
layerDelaySlider.setOnCurrentValueChangedListener(function(value) {
    currentSettings.layerDelay = value;
});

var distanceSlider = new SliderSetting("Макс. дистанция", [currentSettings.maxDistance, 1, 20, 1]);
distanceSlider.setOnCurrentValueChangedListener(function(value) {
    currentSettings.maxDistance = value;
});

var sphereRadiusSlider = new SliderSetting("Радиус сферы", [sphereRadius, 2, 20, 1]);
sphereRadiusSlider.setOnCurrentValueChangedListener(function(value) {
    sphereRadius = value;
});

var pyramidHeightSlider = new SliderSetting("Высота пирамиды", [pyramidHeight, 2, 15, 1]);
pyramidHeightSlider.setOnCurrentValueChangedListener(function(value) {
    pyramidHeight = value;
});

var wallHeightSlider = new SliderSetting("Высота стены", [wallHeight, 2, 10, 1]);
wallHeightSlider.setOnCurrentValueChangedListener(function(value) {
    wallHeight = value;
});

var geometryModeSetting = new ModeSetting("Тип фигуры", Object.keys(geometryShapes).map(function(key) {
    return geometryShapes[key].name;
}));
geometryModeSetting.setOnModeSelectedListener(function(mode) {
    var selectedIndex = geometryModeSetting.getCurrentMode();
    for (var key in geometryShapes) {
        if (geometryShapes[key].name === selectedIndex) {
            currentGeometryType = key;
            Level.displayClientMessage("§a📐 Выбрана фигура: " + geometryShapes[key].name);
            break;
        }
    }
});

var editModule = new Module("UltimateWorldEdit", true, true, ModuleCategory.PLAYER);
editModule.addSettings([
    new ButtonSetting("📌 Точка 1", setPoint1),
    new ButtonSetting("📌 Точка 2", setPoint2),
    new ButtonSetting("📍 Точка вставки", setPoint3),
    new ButtonSetting("🗑️ Сбросить выделение", clearSelection),
    new ButtonSetting("📋 Копировать область", copyRegion),
    new ButtonSetting("📊 Статистика блоков", showBlockStatistics),
    new ButtonSetting("📝 Список материалов", showMaterialList),
    new ButtonSetting("👁️ Предпросмотр", showPreview),
    checkInventorySetting,
    autoSwitchSetting,
    exactCopySetting,
    smartLayerSetting,
    serverSafeModeSetting,
    checkSupportSetting,
    optimizeBuildingSetting,
    showProgressSetting,
    new ButtonSetting("🔄 Повернуть 90°", function() { rotateCopy(90); }),
    new ButtonSetting("🔄 Повернуть 180°", function() { rotateCopy(180); }),
    new ButtonSetting("🪞 Отразить X", function() { mirrorCopy(1); }),
    new ButtonSetting("🪞 Отразить Z", function() { mirrorCopy(2); }),
    new ButtonSetting("💾 Быстрое сохранение", quickSaveTemplate),
    new ButtonSetting("📂 Список шаблонов", listTemplates),
    new ButtonSetting("🏗️ ВСТАВИТЬ И СТРОИТЬ", pasteAndBuild),
    new ButtonSetting("🧱 Заполнить область", function() { 
        if (!pos1 || !pos2) {
            Level.displayClientMessage("§c❌ Сначала установи точки!");
            return;
        }
        var blockId = Item.getID(Inventory.getSelectedSlot());
        if (blockId > 0) {
            Level.displayClientMessage("§a🧱 Начинаю заполнение блоком ID: " + blockId);
            fillArea(blockId);
        } else {
            Level.displayClientMessage("§c❌ Возьми блок в руку!");
        }
    }),
    new ButtonSetting("🗑️ Очистить область", clearArea),
    new ButtonSetting("📐 Построить фигуру", buildGeometry),
    geometryModeSetting,
    sphereRadiusSlider,
    pyramidHeightSlider,
    wallHeightSlider,
    speedSlider,
    undoStepsSlider,
    layerDelaySlider,
    distanceSlider,
    saveTemplatesSetting,
    new ButtonSetting("↩️ Отменить", undo),
    new ButtonSetting("↪️ Повторить", redo),
    new ButtonSetting("🚫 Отменить всё", clearAll),
    new ButtonSetting("🆘 Помощь по геометрии", showGeometryHelp)
]);

function onChat(text) {
    if (text.startsWith(".save ")) {
        preventDefault();
        var name = text.substring(6).trim();
        if (name.length > 0) {
            saveTemplate(name);
        } else {
            quickSaveTemplate();
        }
        return;
    }
    
    if (text.startsWith(".load ")) {
        preventDefault();
        var name = text.substring(6).trim();
        if (name.length > 0) {
            loadTemplate(name);
        }
        return;
    }
    
    if (text === ".templates" || text === ".list") {
        preventDefault();
        listTemplates();
        return;
    }
    
    if (text === ".undo") {
        preventDefault();
        undo();
        return;
    }
    
    if (text === ".redo") {
        preventDefault();
        redo();
        return;
    }
    
    if (text === ".stats") {
        preventDefault();
        showBlockStatistics();
        return;
    }
    
    if (text === ".materials") {
        preventDefault();
        showMaterialList();
        return;
    }
    
    if (text === ".preview") {
        preventDefault();
        showPreview();
        return;
    }
    
    if (text.startsWith(".build") || text === ".paste") {
        preventDefault();
        pasteAndBuild();
        return;
    }
    
    if (text.startsWith(".block ")) {
        preventDefault();
        var blockId = text.substring(7).trim();
        showBlockInfo(blockId);
        return;
    }
    
    if (text === ".block") {
        preventDefault();
        var blockId = Item.getID(Inventory.getSelectedSlot());
        if (blockId > 0) {
            showBlockInfo(blockId);
        } else {
            Level.displayClientMessage("§c❌ Возьми блок в руку или укажи ID после .block");
        }
        return;
    }
    
    if (text === ".blocks" || text === ".blocklist") {
        preventDefault();
        Level.displayClientMessage("§6════ Список популярных блоков ════");
        Level.displayClientMessage("§e.block <id> - информация о блоке");
        Level.displayClientMessage("§e.block - информация о блоке в руке");
        Level.displayClientMessage("");
        Level.displayClientMessage("§6Базовые блоки:");
        Level.displayClientMessage("§71-камень 2-трава 3-земля 4-булыжник");
        Level.displayClientMessage("§75-доски 12-песок 13-гравий 17-дерево");
        Level.displayClientMessage("");
        Level.displayClientMessage("§6Руды:");
        Level.displayClientMessage("§714-золото 15-железо 16-уголь 56-алмаз");
        Level.displayClientMessage("§773-редстоун 129-изумруд");
        Level.displayClientMessage("");
        Level.displayClientMessage("§6Строительные:");
        Level.displayClientMessage("§741-золотой блок 42-железный блок");
        Level.displayClientMessage("§757-алмазный блок 45-кирпич 98-каменный кирпич");
        Level.displayClientMessage("");
        Level.displayClientMessage("§6Декоративные:");
        Level.displayClientMessage("§735-шерсть 159-терракота 171-ковёр");
        Level.displayClientMessage("§7219-250-цветные бетоны");
        return;
    }
    
    if (text.startsWith(".geometry ")) {
        preventDefault();
        var parts = text.substring(10).split(" ");
        if (parts.length < 2) {
            Level.displayClientMessage("§c❌ Использование: .geometry <тип> <параметры>");
            Level.displayClientMessage("§7Пример: §f.geometry sphere 5§7 - сфера радиусом 5");
            return;
        }
        
        var shapeType = parts[0].toLowerCase();
        var validTypes = Object.keys(geometryShapes);
        
        if (validTypes.indexOf(shapeType) === -1) {
            Level.displayClientMessage("§c❌ Неизвестный тип фигуры: " + shapeType);
            Level.displayClientMessage("§7Доступные: " + validTypes.join(", "));
            return;
        }
        
        currentGeometryType = shapeType;
        var shapeName = geometryShapes[shapeType].name;
        
        switch (shapeType) {
            case "sphere":
                if (parts.length >= 2) sphereRadius = parseInt(parts[1]) || 5;
                Level.displayClientMessage("§a🔮 Установлена сфера радиусом " + sphereRadius);
                break;
            case "pyramid":
                if (parts.length >= 2) pyramidHeight = parseInt(parts[1]) || 5;
                Level.displayClientMessage("§a🔺 Установлена пирамида высотой " + pyramidHeight);
                break;
            case "cylinder":
                if (parts.length >= 2) sphereRadius = parseInt(parts[1]) || 5;
                if (parts.length >= 3) pyramidHeight = parseInt(parts[2]) || 5;
                Level.displayClientMessage("§a🔼 Установлен цилиндр r=" + sphereRadius + " h=" + pyramidHeight);
                break;
            case "cube":
                if (parts.length >= 2) sphereRadius = parseInt(parts[1]) || 5;
                Level.displayClientMessage("§a⬛ Установлен куб стороной " + sphereRadius);
                break;
            case "wall":
                if (parts.length >= 2) wallHeight = parseInt(parts[1]) || 3;
                if (parts.length >= 3) sphereRadius = parseInt(parts[2]) || 5;
                if (parts.length >= 4) pyramidHeight = parseInt(parts[3]) || 2;
                Level.displayClientMessage("§a🧱 Установлена стена h=" + wallHeight + " l=" + sphereRadius + " t=" + pyramidHeight);
                break;
            case "dome":
                if (parts.length >= 2) sphereRadius = parseInt(parts[1]) || 5;
                Level.displayClientMessage("§a🏛️ Установлен купол радиусом " + sphereRadius);
                break;
            case "stairs":
                if (parts.length >= 2) sphereRadius = parseInt(parts[1]) || 4;
                if (parts.length >= 3) pyramidHeight = parseInt(parts[2]) || 10;
                Level.displayClientMessage("§a⬆️ Установлена лестница w=" + sphereRadius + " h=" + pyramidHeight);
                break;
        }
        
        Level.displayClientMessage("§7Используй §f.buildgeo§7 для постройки");
        return;
    }
    
    if (text === ".buildgeo" || text === ".bgeo") {
        preventDefault();
        buildGeometry();
        return;
    }
    
    if (text === ".geoh") {
        preventDefault();
        showGeometryHelp();
        return;
    }
    
    if (text === ".help") {
        preventDefault();
        Level.displayClientMessage("§6=== UltimateWorldEdit Команды ===");
        Level.displayClientMessage("§7.save <имя> - сохранить шаблон");
        Level.displayClientMessage("§7.load <имя> - загрузить шаблон");
        Level.displayClientMessage("§7.templates - список шаблонов");
        Level.displayClientMessage("§7.undo/.redo - отмена/повтор");
        Level.displayClientMessage("§7.stats - статистика блоков");
        Level.displayClientMessage("§7.materials - список материалов");
        Level.displayClientMessage("§7.preview - предпросмотр");
        Level.displayClientMessage("§7.build/.paste - вставить и построить");
        Level.displayClientMessage("§7.block <id> - информация о блоке");
        Level.displayClientMessage("§7.geometry <тип> <параметры> - геометрические фигуры");
        Level.displayClientMessage("§7.buildgeo - построить фигуру");
        Level.displayClientMessage("§7.geoh - помощь по геометрии");
        Level.displayClientMessage("§7.help - эта справка");
        Level.displayClientMessage("§6Используй кнопку 'ВСТАВИТЬ И СТРОИТЬ' для быстрой постройки!");
        return;
    }
    
    if (text.startsWith(".pos1")) {
        preventDefault();
        setPoint1();
        return;
    }
    
    if (text.startsWith(".pos2")) {
        preventDefault();
        setPoint2();
        return;
    }
    
    if (text.startsWith(".pos3")) {
        preventDefault();
        setPoint3();
        return;
    }
    
    if (text.startsWith(".copy")) {
        preventDefault();
        copyRegion();
        return;
    }
}

function onLevelTick() {
    if (!scriptEnabled) return;
    
    if (currentSettings.showPreview && copyData && pos3) {
        var currentTime = new Date().getTime();
        if (currentTime - lastPreviewTime > 1000) {
            lastPreviewTime = currentTime;
        }
    }
    
    if (!isBuilding) return;
    
    if (buildQueue.length > 0 && currentBlockGroup) {
        processGroupBuilding();
    } else if (masterPlan.length > 0) {
        processStandardBuilding();
    } else {
        finishBuilding();
    }
}

function processGroupBuilding() {
    if (!currentBlockGroup || currentBlockGroup.index >= currentBlockGroup.blocks.length) {
        groupIndex++;
        if (groupIndex < buildQueue.length) {
            currentBlockGroup = buildQueue[groupIndex];
            Level.displayClientMessage("§a🔄 Переключаюсь на блок ID: " + currentBlockGroup.blockId);
        } else {
            finishBuilding();
            return;
        }
    }
    
    var opsThisTick = 0;
    var maxOps = currentSettings.speed;
    
    while (currentBlockGroup && currentBlockGroup.index < currentBlockGroup.blocks.length && opsThisTick < maxOps) {
        var block = currentBlockGroup.blocks[currentBlockGroup.index];
        
        if (LocalPlayer.getDistanceToCoords(block.x, block.y, block.z) > currentSettings.maxDistance) {
            currentBlockGroup.index++;
            continue;
        }
        
        var currentId = Block.getID(block.x, block.y, block.z);
        
        if (currentId === block.id) {
            currentBlockGroup.index++;
            continue;
        }
        
        if (currentId !== 0) {
            LocalPlayer.destroyBlock(block.x, block.y, block.z);
            opsThisTick++;
            continue;
        }
        
        if (block.requiresSupport && !hasSolidSupport(block.x, block.y, block.z)) {
            currentBlockGroup.index++;
            continue;
        }
        
        if (!useBlockFromInventory(block.id)) {
            Level.displayClientMessage("§c❌ Не хватает блока ID: " + block.id);
            currentBlockGroup.index++;
            continue;
        }
        
        if (findBuildAnchor(block.x, block.y, block.z)) {
            opsThisTick++;
            currentBlockGroup.index++;
            
            if (currentSettings.showProgress && currentBlockGroup.index % 10 === 0) {
                var progress = Math.round((currentBlockGroup.index / currentBlockGroup.total) * 100);
                Level.showTipMessage("§e🎯 Блок ID " + block.id + ": " + progress + "% (" + 
                                   currentBlockGroup.index + "/" + currentBlockGroup.total + ")");
            }
        } else {
            currentBlockGroup.index++;
        }
    }
    
    if (currentSettings.showProgress) {
        var totalDone = 0;
        var totalBlocks = 0;
        
        for (var i = 0; i < buildQueue.length; i++) {
            totalDone += buildQueue[i].index;
            totalBlocks += buildQueue[i].total;
        }
        
        var overallProgress = Math.round((totalDone / totalBlocks) * 100);
        Level.showTipMessage("§e🏗️ Прогресс: " + overallProgress + "% (" + totalDone + "/" + totalBlocks + ")");
    }
}

function processStandardBuilding() {
    if (masterPlan.length !== lastRemainingCount) {
        var remaining = masterPlan.length;
        var progress = Math.round((1 - remaining / (lastRemainingCount || remaining)) * 100);
        Level.showTipMessage("§e🏗️ " + remaining + " блоков | " + progress + "%");
        lastRemainingCount = remaining;
    }
    
    var opsThisTick = 0;
    var maxOps = currentSettings.speed;
    var tasksToProcess = Math.min(masterPlan.length, maxOps * 3);

    for (var i = 0; i < tasksToProcess && opsThisTick < maxOps; i++) {
        var task = masterPlan.shift();

        if (LocalPlayer.getDistanceToCoords(task.x, task.y, task.z) > currentSettings.maxDistance) {
            masterPlan.push(task);
            continue;
        }

        var currentId = Block.getID(task.x, task.y, task.z);

        if (currentId === task.targetId) {
            continue;
        }

        if (task.targetId === 0) {
            if (currentId !== 0) {
                LocalPlayer.destroyBlock(task.x, task.y, task.z);
                opsThisTick++;
            }
            continue;
        }

        if (currentId !== 0) {
            LocalPlayer.destroyBlock(task.x, task.y, task.z);
            masterPlan.push(task);
            opsThisTick++;
            continue;
        }

        if (!useBlockFromInventory(task.targetId)) {
            Level.displayClientMessage("§c❌ Не хватает блока ID: " + task.targetId);
            masterPlan.push(task);
            continue;
        }

        if (findBuildAnchor(task.x, task.y, task.z)) {
            opsThisTick++;
        } else {
            masterPlan.push(task);
        }
    }
}

function finishBuilding() {
    isBuilding = false;
    Level.showTipMessage("§a✅ Строительство завершено!");
    Level.displayClientMessage("§a🎉 Постройка успешно завершена!");
    masterPlan = [];
    buildQueue = [];
    currentBlockGroup = null;
    groupIndex = 0;
    lastRemainingCount = -1;
}

function hasSolidSupport(x, y, z) {
    if (y <= 0) return true;
    
    var belowId = Block.getID(x, y - 1, z);
    return belowId !== 0 && Block.isSolid(belowId);
}

function onUseItem(posX, posY, posZ, side, item, block) {
    if (!scriptEnabled) return;
    if (selectionMode === 0 || currentSettings.serverSafe) return;
    
    preventDefault();
    var p = { x: posX, y: posY, z: posZ };
    
    if (selectionMode === 1) {
        pos1 = p;
        Level.displayClientMessage("§a✅ Точка 1: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Установка точки 1 кликом");
    }
    if (selectionMode === 2) {
        pos2 = p;
        Level.displayClientMessage("§a✅ Точка 2: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Установка точки 2 кликом");
    }
    if (selectionMode === 3) {
        pos3 = p;
        Level.displayClientMessage("§a📍 Точка вставки: §e" + p.x + "," + p.y + "," + p.z);
        saveToHistory("Установка точки вставки кликом");
    }
    
    selectionMode = 0;
}

function findBuildAnchor(targetX, targetY, targetZ) {
    var neighbors = [
        { x: targetX, y: targetY - 1, z: targetZ, side: BlockSide.UP },
        { x: targetX, y: targetY + 1, z: targetZ, side: BlockSide.DOWN },
        { x: targetX - 1, y: targetY, z: targetZ, side: BlockSide.EAST },
        { x: targetX + 1, y: targetY, z: targetZ, side: BlockSide.WEST },
        { x: targetX, y: targetY, z: targetZ - 1, side: BlockSide.SOUTH },
        { x: targetX, y: targetY, z: targetZ + 1, side: BlockSide.NORTH }
    ];
    
    for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        var blockId = Block.getID(n.x, n.y, n.z);
        if (blockId !== 0 && Block.isSolid(blockId)) {
            LocalPlayer.buildBlock(n.x, n.y, n.z, n.side);
            return true;
        }
    }
    
    return false;
}

function onScriptEnabled() {
    scriptEnabled = true;
    ModuleManager.addModule(editModule);
    
    var savedTemplates = Data.getString("we_templates", "{}");
    try {
        templates = JSON.parse(savedTemplates);
    } catch (e) {
        templates = {};
    }
    
    var savedSettings = Data.getString("we_settings", "{}");
    try {
        var loadedSettings = JSON.parse(savedSettings);
        for (var key in loadedSettings) {
            if (currentSettings.hasOwnProperty(key)) {
                currentSettings[key] = loadedSettings[key];
            }
        }
    } catch (e) {}
    
    Level.displayClientMessage("§6=== UltimateWorldEdit v4.0 ===");
    Level.displayClientMessage("§a✅ Успешно загружен!");
    Level.displayClientMessage("§7📋 Шаблонов: §e" + Object.keys(templates).length);
    Level.displayClientMessage("§7⚡ Скорость: §e" + currentSettings.speed + "§7 блоков/тик");
    Level.displayClientMessage("§7📐 Геометрия: 7 фигур доступно");
    Level.displayClientMessage("§7🏗️ Используй кнопку 'ВСТАВИТЬ И СТРОИТЬ'!");
    Level.displayClientMessage("§7📚 Команда §f.help§7 для справки");
}

function onScriptDisabled() {
    scriptEnabled = false;
    if (editModule) ModuleManager.removeModule(editModule);
    isBuilding = false;
    selectionMode = 0;
    masterPlan = [];
    lastRemainingCount = -1;
    copyData = null;
    buildQueue = [];
    currentBlockGroup = null;
    
    Data.saveString("we_templates", JSON.stringify(templates));
    Data.saveString("we_settings", JSON.stringify(currentSettings));
    
    Level.displayClientMessage("§cUltimateWorldEdit выгружен");
}

function planSet(targetId) {
    if (!pos1 || !pos2) {
        Level.displayClientMessage("§c❌ Установи обе точки!");
        return;
    }
    if (targetId === -1 || targetId === null) {
        Level.displayClientMessage("§c❌ Выбери блок для установки!");
        return;
    }

    var plan = [];
    var minX = Math.min(pos1.x, pos2.x);
    var minY = Math.min(pos1.y, pos2.y);
    var minZ = Math.min(pos1.z, pos2.z);
    var maxX = Math.max(pos1.x, pos2.x);
    var maxY = Math.max(pos1.y, pos2.y);
    var maxZ = Math.max(pos1.z, pos2.z);

    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            for (var z = minZ; z <= maxZ; z++) {
                plan.push({
                    x: x,
                    y: y,
                    z: z,
                    targetId: targetId,
                    placed: false,
                    layer: y - minY,
                    priority: y * 1000 + x,
                    requiresSupport: currentSettings.checkSupport
                });
            }
        }
    }
    startConstruction(plan);
}
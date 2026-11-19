let bgSprite; // 儲存背景圖片 bg/bg1.png
let bgOffset = 0; // 儲存目前背景水平捲動的位移量
let characterSprite; // 儲存角色一的精靈圖[cite: 1]
let walkSprite; // 儲存角色一的走路精靈圖[cite: 1]
let magicSprite; // 儲存角色一的施法精靈圖[cite: 1]
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖[cite: 1]
let characterX; // 儲存角色一目前的水平中心位置[cite: 1]
let isWalking = false; // 記錄角色是否已切換為走路動畫[cite: 1]
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）[cite: 1]
let isCasting = false; // 記錄角色是否正在播放施法動畫[cite: 1]
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數[cite: 1]
let magicDirection = 1; // 記錄施法時鎖定的方向[cite: 1]
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發[cite: 1]
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效[cite: 1]
const frameCountInSprite = 10; // 設定精靈圖包含的影格數[cite: 1]
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）[cite: 1]
const frameHeight = 196; // 設定每個影格的高度[cite: 1]
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數[cite: 1]
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度[cite: 1]
const walkFrameHeight = 198; // 設定走路動畫每格的高度[cite: 1]
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數[cite: 1]
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度[cite: 1]
const magicFrameHeight = 146; // 設定施法動畫每格的高度[cite: 1]
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數[cite: 1]
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度[cite: 1]
const effectFrameHeight = 19; // 設定魔法特效每格的高度[cite: 1]
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格[cite: 1]

function preload() { // 在畫布建立前載入背景與角色圖片[cite: 1]
  bgSprite = loadImage("bg/bg1.png"); // 載入背景圖片 bg/bg1.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖[cite: 1]
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖[cite: 1]
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖[cite: 1]
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖[cite: 1]
} // 結束圖片載入函式[cite: 1]

function setup() { // 初始化畫布與繪圖模式[cite: 1]
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布[cite: 1]
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處[cite: 1]
  frameRate(60); // 將動畫更新速率設定為每秒六十格[cite: 1]
} // 結束初始化函式[cite: 1]

function draw() { // 每個畫面更新一次背景、特效與角色[cite: 1]
  background("#87CEEB"); // 使用天空藍作為備用底色[cite: 1]
  const bgScale = height / bgSprite.height; // 依畫布高度計算背景等比例縮放倍率
  const bgWidth = bgSprite.width * bgScale; // 計算單張背景圖片縮放後的寬度
  const bgHeight = height; // 設定單張背景圖片高度為整個畫布高度
  const totalBgWidth = bgWidth * 3; // 計算三張背景圖片串接後的總寬度
  const maxBgOffset = bgWidth; // 計算背景最左端可向右推移的最大偏移量（左邊界鎖定）
  const minBgOffset = width - totalBgWidth + bgWidth; // 計算背景最右端可向左推移的最小偏移量（右邊界鎖定）
  bgOffset = constrain(bgOffset, minBgOffset, maxBgOffset); // 確保背景偏移量不超出三張串接背景的左右極限
  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住[cite: 1]
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住[cite: 1]
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫[cite: 1]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度[cite: 1]
  const targetHeight = height / 3; // 設定角色目標高度為整個畫布高度的三分之一
  const characterScale = targetHeight / frameHeight; // 依目標高度與原始影格高度計算等比例縮放倍率
  const characterWidth = frameWidth * characterScale; // 依原本圖片的寬高比例計算角色顯示寬度
  const characterHeight = targetHeight; // 設定角色基本顯示高度為畫布高度的三分之一
  let bgDeltaX = 0; // 記錄本影格背景實際水平位移量，用於同步特效位置
  if (movingRight) { // 按住右方向鍵時執行右行與背景往左捲動控制[cite: 1]
    isWalking = true; // 切換至走路動畫[cite: 1]
    facingDirection = 1; // 設定角色朝向右方[cite: 1]
    if (bgOffset > minBgOffset) { // 若背景尚未抵達最右邊界，則讓背景往左移動
      const nextBgOffset = max(minBgOffset, bgOffset - movementStep); // 計算往左捲動後的新背景偏移量
      bgDeltaX = nextBgOffset - bgOffset; // 計算背景實際向左移動的差值
      bgOffset = nextBgOffset; // 更新背景位移量
    } else { // 若背景已到最右邊界而暫停捲動，則改由角色往右移動
      characterX += movementStep; // 讓角色向右移動[cite: 1]
    } // 結束右鍵背景與角色移動分支
  } else if (movingLeft) { // 按住左方向鍵且未按右鍵時執行左行與背景往右捲動控制[cite: 1]
    isWalking = true; // 切換至走路動畫[cite: 1]
    facingDirection = -1; // 設定角色朝向左方[cite: 1]
    if (bgOffset < maxBgOffset) { // 若背景尚未抵達最左邊界，則讓背景往右移動
      const nextBgOffset = min(maxBgOffset, bgOffset + movementStep); // 計算往右捲動後的新背景偏移量
      bgDeltaX = nextBgOffset - bgOffset; // 計算背景實際向右移動的差值
      bgOffset = nextBgOffset; // 更新背景位移量
    } else { // 若背景已到最左邊界而暫停捲動，則改由角色往左移動
      characterX -= movementStep; // 讓角色向左移動[cite: 1]
    } // 結束左鍵背景與角色移動分支
  } // 結束方向鍵移動判斷[cite: 1]
  const baseCenterBgX = bgOffset; // 設定中間主背景圖片的左緣水平座標
  imageMode(CORNER); // 切換為左上角對齊模式以方便串接三張背景圖片
  image(bgSprite, baseCenterBgX - bgWidth, 0, bgWidth, bgHeight); // 在左側繪製第一張複製的背景圖片
  image(bgSprite, baseCenterBgX, 0, bgWidth, bgHeight); // 在中央繪製原本的背景圖片
  image(bgSprite, baseCenterBgX + bgWidth, 0, bgWidth, bgHeight); // 在右側繪製第二張複製的背景圖片
  imageMode(CENTER); // 還原為中心點對齊模式以繪製角色與特效[cite: 1]
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色中心避免超出畫布左右邊界[cite: 1]
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次[cite: 1]
    isCasting = false; // 結束施法動畫並恢復一般角色動作[cite: 1]
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效[cite: 1]
  } // 結束施法動畫完成判斷[cite: 1]
  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖[cite: 1]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數[cite: 1]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度[cite: 1]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度[cite: 1]
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數[cite: 1]
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格[cite: 1]
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點[cite: 1]
  const activeWidth = activeFrameWidth * characterScale; // 依原始寬高比例計算目前角色影格的顯示寬度[cite: 1]
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度[cite: 1]
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部[cite: 1]
  push(); // 暫存目前的繪圖座標轉換狀態[cite: 1]
  translate(characterX, characterY); // 將繪圖原點移至角色中心[cite: 1]
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉[cite: 1]
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格[cite: 1]
  pop(); // 還原繪圖座標轉換狀態[cite: 1]
  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布[cite: 1]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度[cite: 1]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度[cite: 1]
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度[cite: 1]
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效[cite: 1]
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料[cite: 1]
    effect.x += effect.direction * effectSpeed + bgDeltaX; // 依特效飛行方向與背景捲動量更新水平位置
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣[cite: 1]
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效[cite: 1]
      continue; // 略過已移除特效的繪製[cite: 1]
    } // 結束特效邊界判斷[cite: 1]
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格[cite: 1]
    push(); // 暫存目前的繪圖座標轉換狀態[cite: 1]
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心[cite: 1]
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格[cite: 1]
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格[cite: 1]
    pop(); // 還原繪圖座標轉換狀態[cite: 1]
  } // 結束飛行中特效更新迴圈[cite: 1]
} // 結束繪圖函式[cite: 1]

function keyPressed() { // 按下方向鍵或空白鍵時切換角色狀態與朝向[cite: 1]
  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵[cite: 1]
    isWalking = true; // 啟用走路動畫[cite: 1]
    facingDirection = 1; // 讓角色面向右方[cite: 1]
    return false; // 防止方向鍵捲動網頁[cite: 1]
  } // 結束右方向鍵判斷[cite: 1]
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵[cite: 1]
    isWalking = true; // 啟用走路動畫[cite: 1]
    facingDirection = -1; // 讓角色面向左方[cite: 1]
    return false; // 防止方向鍵捲動網頁[cite: 1]
  } // 結束左方向鍵判斷[cite: 1]
  if (keyCode === 32) { // 判斷是否按下空白鍵[cite: 1]
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發[cite: 1]
      isCasting = true; // 開始播放施法動畫[cite: 1]
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面[cite: 1]
      magicDirection = facingDirection; // 鎖定施法當下角色面向[cite: 1]
    } // 結束施法啟動判斷[cite: 1]
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發[cite: 1]
    return false; // 防止空白鍵捲動網頁[cite: 1]
  } // 結束空白鍵判斷[cite: 1]
} // 結束按鍵事件處理函式[cite: 1]

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態[cite: 1]
  if (keyCode === 32) { // 判斷放開的是否為空白鍵[cite: 1]
    spaceIsDown = false; // 允許下次按空白鍵重新施法[cite: 1]
  } // 結束空白鍵放開判斷[cite: 1]
} // 結束按鍵放開事件處理函式[cite: 1]

function windowResized() { // 視窗尺寸改變時重新調整畫布[cite: 1]
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸[cite: 1]
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內[cite: 1]
} // 結束視窗縮放處理函式[cite: 1]
// ver. 1.0.1
/**
 *  描画領域の初期設定
 */
const whiteboard = document.getElementById('whiteboard'); // 描画領域
const headerH = document.getElementById('app-header').offsetHeight; // ヘッダー領域の高さ
const toolH = document.getElementById('tool-area').offsetHeight; // ツールボタン領域の高さ
const footerH = document.getElementById('app-footer').offsetHeight; // フッター領域の高さ
const bw = document.body.clientWidth; // body要素の幅
const bh = window.innerHeight - (headerH + toolH + footerH) - 2; // ウィンドウの高さ - 各領域 - ボーダー幅
whiteboard.width = bw; // 描画領域の幅
whiteboard.height = bh; // 描画領域の高さ
const ctx = whiteboard.getContext('2d', {willReadFrequently: true}); // 描画領域のコンテキスト
let startX = 0, startY = 0; // 開始点の座標

/**
 * 背景領域の初期設定
 */
const canvasWrap = document.getElementById('canvas-wrap'); // 背景領域
canvasWrap.style.width = bw + 'px'; // 背景領域の幅
canvasWrap.style.height = bh + 'px'; // 背景領域の高さ

/**
 * アンドゥとリドゥの初期設定
 */
let undoAry = []; // アンドゥの配列
let redoAry = []; // リドゥの配列
const undoBtn = document.getElementById('undo-btn'); // アンドゥボタン
const redoBtn = document.getElementById('redo-btn'); // リドゥボタン

/**
 * 描画イベントの登録
 */
if (window.ontouchstart === undefined) {
	// マウスイベント
	whiteboard.addEventListener('mousedown', handleStart);
	whiteboard.addEventListener('mouseup', handleEnd);
	whiteboard.addEventListener('mousemove', handleMove);
} else {
	// タッチイベント
	whiteboard.addEventListener('touchstart', handleStart);
	whiteboard.addEventListener('touchend', handleEnd);
	whiteboard.addEventListener('touchmove', handleMove, {passive: false});
	whiteboard.addEventListener('touchcancel', handleCancel, {passive: false});
}

// クリックイベント
whiteboard.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
}, {passive: false});

/**
 * 設定値の取得
 */
// カラー
const lineColor = document.getElementById('line-color');
let setLineColor = lineColor.value; // 初期値の設定
lineColor.addEventListener('change', function(e) {
	setLineColor = e.target.value; // 設定値の変更
});

// 線の太さ
const lineThickness = document.getElementById('line-thickness');
let setThick = lineThickness.value; // 初期値の設定
lineThickness.addEventListener('change', function(e) {
	setThick = e.target.value; // 設定値の変更
});

// 線のタイプ
const lineType = document.getElementsByName('line-type');
let setLine = ''; // 設定変数
for (const line of lineType) {
	if (line.checked === true) {
		setLine = line.value; // 初期値の設定
	}
	line.addEventListener('change', function(e) {
		setLine = e.target.value; // 設定値の変更
	});
}

// 半透明
const translucent = document.getElementById('translucent');
let checkTranslucent = translucent.checked; // 初期値の設定
translucent.addEventListener('change', function(e) {
	checkTranslucent = e.target.checked; // 設定値の変更
});

// 消しゴム
const boardEraser = document.getElementById('board-eraser');
let checkEraser = boardEraser.checked; // 初期値の設定
boardEraser.addEventListener('change', function(e) {
	checkEraser = e.target.checked; // 設定値の変更
});

// エフェクト
const lineEffect = document.getElementsByName('line-effect');
let setEffect = ''; // 設定変数
for (const line of lineEffect) {
	if (line.checked === true) {
		setEffect = line.value; // 初期値の設定
	}
	line.addEventListener('change', function(e) {
		setEffect = e.target.value; // 設定値の変更
	});
}

// 背景色
const bgColor = document.getElementById('bg-color');
let setBgColor = bgColor.value; // 初期値の設定
canvasWrap.style.backgroundColor = setBgColor; // 初期値の設定
bgColor.addEventListener('change', function(e) {
	setBgColor = e.target.value; // 背景色の変更
	canvasWrap.style.backgroundColor = setBgColor; //  設定値の変更
});

// 背景色を含める
const includeBg = document.getElementById('include-bg');
let checkIncBg = includeBg.checked; // 初期値の設定
includeBg.addEventListener('change', function(e) {
	checkIncBg = e.target.checked; // 設定値の変更
});

/**
 * 描画のイベントハンドラ
 */
// マウスダウン（タッチスタート）
function handleStart(e) {
	if (e.touches) {
		e = e.changedTouches[0];
	}
	const cRect = e.target.getBoundingClientRect(); // 相対位置
	startX = e.pageX - cRect.left;
	startY = e.pageY - cRect.top;
	
	ctx.lineWidth = setThick; // 太さの設定
	
	// 消しゴム
	if (checkEraser) {
		ctx.globalCompositeOperation = 'destination-out'; // 消す
	} else {
		ctx.globalCompositeOperation = setEffect; // 描画エフェクト設定
		ctx.strokeStyle = setLineColor; // 線の色設定
		ctx.fillStyle = setLineColor; // ドットの色設定
	}
	
	// 半透明
	if (checkTranslucent) {
		ctx.globalAlpha = 0.2; // 半透明の設定
	} else {
		ctx.globalAlpha = 1; // 不透明の設定
	}
	
	// 線のタイプ
	if (setLine === 'dot') {
		// ドット
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.arc(startX, startY, setThick, 0, 2 * Math.PI, false);
		ctx.fill();
	} else if (setLine === 'butt') {
		// ガビ
		ctx.lineCap = setLine;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo((startX + 1), (startY + 1));
		ctx.moveTo((startX + 1), startY);
		ctx.lineTo(startX, (startY + 1));
		ctx.stroke();
	} else {
		// マルとカク
		ctx.lineCap = setLine;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		//ctx.lineTo((startX + setThick), (startY + setThick));
		ctx.lineTo((startX + 1), (startY + 1));
		ctx.moveTo((startX + 1), startY);
		ctx.lineTo(startX, (startY + 1));
		ctx.stroke();
		console.log(setThick);
	}
}

// マウスアップ（タッチエンド）
function handleEnd(e) {
	// アンドゥの設定
	undoAry.push(ctx.getImageData(0, 0, bw, bh)); // canvasのデータを格納
	undoBtn.classList.add('active'); // アンドゥの有効化
	redoAry = []; // リドゥ配列の初期化
	redoBtn.classList.remove('active'); // リドゥの無効化
}

// マウスムーブ（タッチムーブ）
function handleMove(e) {
	if (e.touches) {
		if (e.touches.length > 1) {
			// 2本指以上
			return;
		}
		// 1本指
		e.preventDefault(); // 規定の動作を抑止する
		e = e.changedTouches[0];
	}
	
	if (e.buttons !== 0) {
		const cRect = e.target.getBoundingClientRect(); // 相対位置
		const x = e.pageX - cRect.left;
		const y = e.pageY - cRect.top;
		
		// 線のタイプ
		if (setLine === 'dot') {
			// ドット
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.arc(x, y, setThick, 0, 2 * Math.PI, false);
			ctx.fill();
		} else {
			// その他の線
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(x, y);
			ctx.stroke();
			startX = x; // 次のx座標
			startY = y; // 次のy座標
		}
	}
}

// タッチキャンセル
function handleCancel(e) {
	e.preventDefault(); // 規定の動作を抑止する
}

/**
 * キャンバスの削除
 */
const deleteCanvas = document.getElementById('delete-canvas');
deleteCanvas.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
	ctx.clearRect(0, 0, bw, bh);
	undoAry = []; // アンドゥ配列の初期化
	redoAry = []; // リドゥ配列の初期化
	undoBtn.classList.remove('active'); // アンドゥの無効
	redoBtn.classList.remove('active'); // リドゥの無効
}, {passive: false});

/**
 * ファンクションボタンの開閉
 */
// Experimental Button
const exptOp = document.getElementById('expt-op');
const exptMenu = document.getElementById('expt-menu');
exptOp.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
	if (funcMenu.className === 'open') {
		funcMenu.classList.remove('open');
	}
	if (exptMenu.className === 'open') {
		exptMenu.classList.remove('open');
	} else {
		exptMenu.classList.add('open');
	}
}, {passive: false});

// Function Button
const funcOp = document.getElementById('func-op');
const funcMenu = document.getElementById('func-menu');
funcOp.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
	if (exptMenu.className === 'open') {
		exptMenu.classList.remove('open');
	}
	if (funcMenu.className === 'open') {
		funcMenu.classList.remove('open');
	} else {
		funcMenu.classList.add('open');
	}
}, {passive: false});

/**
 * ダウンロード設定
 */
const downloadBtn = document.getElementById('download-btn');
downloadBtn.addEventListener('click', function(e) {
	const canvasDate1 = ctx.getImageData(0, 0, bw, bh); // 背景が透明のデータ
	// 背景を追加
	if (checkIncBg) {
		ctx.globalCompositeOperation = 'destination-over'; // 背後にする
		ctx.fillStyle = setBgColor;
		ctx.fillRect(0, 0, bw, bh);
	}
	
	// ダウンロードファイル
	const canvasData2 = whiteboard.toDataURL('image/png'); // 背景を含めたデータ
	downloadBtn.href = canvasData2;
	const d = new Date();
	const hiduke = '' + d.getFullYear() +  d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds();
	downloadBtn.download = 'wb_' + hiduke;
	
	// 透明に戻す
	ctx.globalCompositeOperation = 'source-over'; // 描画エフェクト設定を戻す
	ctx.putImageData(canvasDate1, 0, 0);
});

/**
 * 画像の挿入
 */
const insImg = document.getElementById('ins-img');
insImg.addEventListener('change', function(e) {
	// 画像ファイル
	const files =  e.target.files[0];
	const urlObj = URL.createObjectURL(files); // オブジェクトURLを生成
	const img = new Image();
	img.src = urlObj;
	
	// 画像の挿入
	img.addEventListener('load', function() {
		const bRatio = bw / bh; // canvasの比率
		const iRatio = img.width / img.height; // 画像の比率
		const iw = img.width; // 画像の幅
		const ih = img.height; // 画像の高さ
		let scaleW = bw; // 調整した幅
		let scaleH = bh; // 調整した高さ
		
		if (iRatio > bRatio) {
			scaleH = bw / iw * ih; // 高さを調整
		} else {
			scaleW = bh / ih * iw; // 幅をを調整
		}
		
		ctx.globalCompositeOperation = 'source-over'; // 描画エフェクト設定を戻す
		ctx.globalAlpha = 1; // 透明値を戻す
		ctx.drawImage(img, 0, 0, scaleW, scaleH);
		
		// アンドゥの設定
		undoAry.push(ctx.getImageData(0, 0, bw, bh)); // canvasデータの格納
		undoBtn.classList.add('active'); // アンドゥの有効化
		redoAry = []; // リドゥ配列の初期化
		redoBtn.classList.remove('active'); // リドゥの無効化
	});
});

/**
 * アンドゥとリドゥの設定
 */
// undo
undoBtn.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
	const undoItem = undoAry.pop(); // アンドゥ配列から取り出す
	if (undoItem === undefined) {
		return;
	}
	if (undoAry.length === 0) {
		undoBtn.classList.remove('active'); // アンドゥの無効化
		ctx.clearRect(0, 0, bw, bh); // 初期画面に戻す
	} else {
		// 描画
		ctx.globalCompositeOperation = 'source-over'; // 描画エフェクト設定を戻す
		ctx.globalAlpha = 1; // 透明値を戻す
		ctx.putImageData(undoAry[undoAry.length - 1], 0, 0);
	}
	redoBtn.classList.add('active'); // リドゥの有効化
	redoAry.push(undoItem); // リドゥ配列にスタック
}, {passive: false});

// redo
redoBtn.addEventListener('click', function(e) {
	e.preventDefault(); // 規定の動作を抑止する
	const redoItem = redoAry.pop(); // リドゥ配列から取り出す
	if (redoItem === undefined) {
		return;
	}
	if (redoAry.length === 0) {
		redoBtn.classList.remove('active'); // リドゥの無効化
	}
	
	// 描画
	ctx.globalCompositeOperation = 'source-over'; // 描画エフェクト設定を戻す
	ctx.globalAlpha = 1; // 透明値を戻す
	ctx.putImageData(redoItem, 0, 0);
	undoBtn.classList.add('active'); // アンドゥの有効化
	undoAry.push(redoItem); // アンドゥ配列にスタック
}, {passive: false});

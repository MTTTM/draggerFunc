const transformMap = [
	"translate",
	"translateX",
	"translateY",
	"scale",
	"scaleX",
	"scaleY",
	"rotate",
	"rotateX",
	"rotateY",
	"rotateZ",
];
const setTcss = (dom, cssObjOrStr, val) => {
	if (!dom) {
		throw "setCss 不是有效的dom";
	}

	if (typeof cssObjOrStr == "string") {
		if (val == undefined) {
			throw "setCss 第2个但是为字符串时候，第3个参数必填";
		} else {
			dom.setAttribute(cssObjOrStr, val);
			let t = "";
			transformMap.forEach((item) => {
				let attrVal = dom.getAttribute(item);

				if (attrVal != undefined) {
					t += `${item}(${attrVal})`;
				}
			});
			dom.style.transform = t;

		}
	} else if (typeof cssObjOrStr == "object") {
		for (let key in cssObjOrStr) {
			if (transformMap.findIndex((el) => key == el) > -1) {
				setTcss(dom, key, cssObjOrStr[key]);
			}
		}
	} else {
		throw "setCss 第2个参数为字符串或对象";
	}
};
const getTcss = (dom, name) => {
	if (!dom) {
		throw "getTcss 第一个参数理应为dom对象，但是目前不是";
	}
	if (!name || transformMap.findIndex((el) => el == name) == -1) {
		throw `第二个属性值为${name}，不在transformMap之内${JSON.stringify(
            transformMap
        )}`;
	}
	let val = parseFloat(dom.getAttribute(name));
	return val ? val : 0;
};
//添加摩擦力
const setFriction = (num) => {
	scrollY = getTcss(dv, "translateY")
	//顶部超出后，添加摩擦力，并且越来越大
	if (scrollY > 0) {
		if (t <= 0) {
			//获取左部和顶部的偏移量
			l = getTcss(dv, "translateX");
			t = getTcss(dv, "translateY");
		}
		//fPar = (wrapRect.top / Math.abs(childRect.top)) * 0.2;
		fPar = 1 - Math.abs((wrapRect.top - childRect.top)) / (childRect.height);
		fPar = fPar * 0.1;
		console.warn("边界检测:超出 fPar", fPar, "Math.abs((wrapRect.top - childRect.top))", Math.abs((wrapRect.top -
				childRect.top)), "之前scrollY", scrollY, "结果:", t + fPar * (ny - y), 't', t, "ny", ny, "y", y,
			"ny-y", (ny - y));
	} else if (childRect.top - wrapRect.top < bottomLimit) {
		let wrapBottom = wrapRect.height + wrapRect.top;
		let childBottom = childRect.height + childRect.top;
		fPar = Math.abs(childBottom) / wrapBottom;
		// console.error(
		//     "边界检测:在车上顶部超出，不应该到这里的",
		//     fPar,
		//     "结果",
		//     t + fPar * (ny - y)
		// );
	} else {
		fPar = 1;
		console.log("边界检测:其他===========,", fPar, "结果:", t + fPar * (ny - y), 't', t, "ny", ny, "y", y, "ny-y", (ny -
			y));
	}
	return fPar
};
//手机&&电脑 事件兼容
function getEvent(e, type) {
	if (e.targetTouches && e.targetTouches[0]) {
		if (type == "obj") {
			return {
				eInfo: e,
				eItem: e.targetTouches[0],
			};
		}
		return e.targetTouches[0];
	} else {
		if (type == "obj") {
			return {
				eInfo: e,
				eItem: e,
			};
		} else {
			return e;
		}
	}
}
/*
	options 参数
	clickHandler:function
*/
function draggerInit(wrap, child, options = {}) {
	setTcss(child, "translateY", 0);
	setTcss(child, "translateX", 0);
	let wrapRect = wrap.getBoundingClientRect();
	let childRect = child.getBoundingClientRect();
	var dv = child;
	var x = 0;
	var y = 0;
	var l = 0;
	var t = 0;
	var scrollY = 0; //记录Y方向的滚动距离
	var scrollX = 0; //记录X方向的滚动距离
	//鼠标放开后的惯性定时器
	var endTimer = null;
	var startTime = 0; //开始时间
	var startScrollY = 0;
	let moveFn = function(event) {
		let eventObj = getEvent(event, "obj");
		let eventBaseInfo = eventObj.eInfo;
		let eItem = eventObj.eItem;
		eventBaseInfo.stopPropagation();
		eventBaseInfo.preventDefault();
		//获取x和y
		var nx = eItem.clientX;
		var ny = eItem.clientY;
		//计算移动后的左偏移量和顶部的偏移量
		// var nl = nx - (x - l);
		// var nt = ny - (y - t);
		var nl = l + nx - x;
		var nt = 1;
		//新增============start
		wrapRect = wrap.getBoundingClientRect(); //必须从新获取
		childRect = child.getBoundingClientRect(); //必须重新获取
		let fPar = 1;
		//内容刚刚贴着容器底部的距离
		let bottomLimit = -(childRect.height - wrapRect.height); //- wrapRect.top
		scrollY = getTcss(dv, "translateY")
		//顶部超出后，添加摩擦力，并且越来越大
		if (scrollY > 0) {
			if (t <= 0) {
				//获取左部和顶部的偏移量
				l = getTcss(dv, "translateX");
				t = getTcss(dv, "translateY");
			}
			//fPar = (wrapRect.top / Math.abs(childRect.top)) * 0.2;
			fPar = 1 - Math.abs((wrapRect.top - childRect.top)) / (childRect.height);
			fPar = fPar * 0.1;
			console.warn("边界检测:超出 fPar", fPar, "Math.abs((wrapRect.top - childRect.top))", Math.abs((wrapRect.top -
					childRect.top)), "之前scrollY", scrollY, "结果:", t + fPar * (ny - y), 't', t, "ny", ny, "y", y,
				"ny-y", (ny - y));
		} else if (childRect.top - wrapRect.top < bottomLimit) {
			let wrapBottom = wrapRect.height + wrapRect.top;
			let childBottom = childRect.height + childRect.top;
			fPar = Math.abs(childBottom) / wrapBottom;
			// console.error(
			//     "边界检测:在车上顶部超出，不应该到这里的",
			//     fPar,
			//     "结果",
			//     t + fPar * (ny - y)
			// );
		} else {
			fPar = 1;

		}
		nt = t + fPar * (ny - y);
		setTcss(child, {
			// translateX: nl + "px",
			translateY: nt + "px",
		});
		//新增========end

	};
	let downFn = function(event) {
		let e = getEvent(event);
		startTime = new Date().getTime(); //记录开始时间
		clearInterval(endTimer);
		//获取x坐标和y坐标
		x = e.clientX;
		y = e.clientY;
		//重置过渡样式
		child.style.transition = "none";
		//获取左部和顶部的偏移量
		l = getTcss(dv, "translateX");
		startScrollY = t = getTcss(dv, "translateY");
		//设置样式
		dv.style.cursor = "move";
		window.addEventListener("mousemove", moveFn);
		window.addEventListener("touchmove", moveFn, {
			passive: false
		});
	};

	let endFn = function() {
		if (!wrap || !child) {
			//因为是挂载在全局里面的，及时dom被销毁，window的监听事件依旧是存在的，
			//所以这里需要处理下，避免一直都存在监听
			window.removeEventListener("mouseup", endFn);
			window.removeEventListener("mouseleave", endFn);
			window.removeEventListener("touchend", endFn);
			return;
		}
		wrapRect = wrap.getBoundingClientRect(); //必须从新获取
		childRect = child.getBoundingClientRect(); //必须重新获取
		dv.style.cursor = "default";
		//电脑端移除事件
		window.removeEventListener("mousemove", moveFn);
		window.removeEventListener("touchmove", moveFn);

		//内容刚刚贴着容器底部的距离
		let setBottomLimit = -(childRect.height - wrapRect
		.height); //var innerBox=document.querySelector(".innerBox").getBoundingClientRect();
		var bottomLimit = -(childRect.height - wrapRect.height); //- wrapRect.top

		if (childRect.top > wrapRect.top) {
			child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
			setTcss(child, {
				translateX: 0 + "px",
				translateY: 0 + "px",
			});
		} else if (childRect.top - wrapRect.top <= bottomLimit) {
			//这里的childRect.top - wrapRect.top，要好好整理下思路
			console.log("放开后设置,超出底部");
			child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
			setTcss(child, {
				translateX: 0 + "px",
				translateY: setBottomLimit + "px",
			});
		} else {
			child.style.transition = "none";
			let endTime = new Date().getTime();
			let endScrollY = getTcss(dv, "translateY");
			let disTime = (endTime - startTime) / 1000;
			let dis = endScrollY - startScrollY;
			let disScrollY = Math.abs(dis);
			let fri = 0.98;
			let speed = disScrollY / (disTime * 1000);

			let wrapBoxRect = wrap.getBoundingClientRect(); //必须从新获取，容器的rect
			let childBoxRect = child.getBoundingClientRect(); //必须重新获取，容器内容列表的rect
			let currScrollBoxSwipeY = getTcss(child, "translateY");
			let translateY = childBoxRect.top - wrapBoxRect.top;
			let end = -translateY + currScrollBoxSwipeY;
			//内容刚刚贴着容器底部的距离
			let bottomLimit = -(
				childBoxRect.height -
				wrapBoxRect.height
			);



			//点击到放开的时间小于.8秒,就给他做物理运动
			if (disTime < .8 && disScrollY >= 30) {
				//现下滑
				if (dis > 0) {
					clearInterval(endTimer);
					endTimer = setInterval(() => {
						endScrollY = getTcss(dv, "translateY");
						if (endScrollY >= 0) {
							child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
							setTcss(child, {
								translateX: 0 + "px",
								translateY: 0 + "px",
							});
							clearInterval(endTimer);
							return;
						}
						if (speed < 0.1) {
							clearInterval(endTimer);
						}
						speed *= fri
						endScrollY += speed * 5;
						setTcss(child, {
							translateX: 0 + "px",
							translateY: endScrollY + "px",
						});
					}, 10)
				} else {
					//手指向上
					clearInterval(endTimer);
					endTimer = setInterval(() => {
						endScrollY = getTcss(dv, "translateY");
						if (endScrollY <= bottomLimit) {
							child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
							setTcss(child, {
								translateX: 0 + "px",
								translateY: bottomLimit + "px",
							});
							clearInterval(endTimer);
							return;
						}
						if (speed < 0.1) {
							clearInterval(endTimer);
							return;
						}
						speed *= fri
						endScrollY -= speed * 5;
						setTcss(child, {
							translateX: 0 + "px",
							translateY: endScrollY + "px",
						});
					}, 10)
				}
			}
		}
	};
	//电脑端添加事件======
	dv.addEventListener("mousedown", downFn);
	dv.addEventListener("mouseup", endFn);
	window.addEventListener("mouseup", endFn);
	window.addEventListener("mouseleave", endFn);
	//手机端添加事件=====
	dv.addEventListener("touchstart", downFn, {
		passive: false
	});
	dv.addEventListener("touchend", endFn);
	window.addEventListener("touchend", endFn);
	child.addEventListener("click", (event) => {
		let endTime = new Date().getTime();
		let endScrollY = getTcss(dv, "translateY");
		let disTime = (endTime - startTime) / 1000;
		let dis = endScrollY - startScrollY;
		let disScrollY = Math.abs(dis);
		if (disScrollY < 10) {
			options.clickHandler && typeof options.clickHandler == "function" ? options.clickHandler(event) : null;
		}
	})

	//动画过渡结束监听
	function resetTransition() {
		child.style.transition = "none";
	}
	child.removeEventListener("transitionend", resetTransition, false);
	child.addEventListener("transitionend", resetTransition, false);
	const scrollToDom = function(dom) {
		if (dom instanceof Element) {
			let targetDomRectObj = dom.getBoundingClientRect(); //检测目标的rect
			let wrapBoxRect = wrap.getBoundingClientRect(); //必须从新获取，容器的rect
			let childBoxRect = child.getBoundingClientRect(); //必须重新获取，容器内容列表的rect
			let currScrollBoxSwipeY = getTcss(child, "translateY");
			let translateY = targetDomRectObj.top - wrapBoxRect.top;
			let end = -translateY + currScrollBoxSwipeY;
			//内容刚刚贴着容器底部的距离
			let bottomLimit = -(
				childBoxRect.height -
				wrapBoxRect.height
			);


			if (end < 0 && end < bottomLimit) {
				end = bottomLimit;
			}

			setTcss(child, {
				translateX: -(targetDomRectObj.left - wrapBoxRect.left) + "px",
				translateY: end + "px",
			});
		} else {
			throw `scrollToDom函数应该接受一个Element元素，实际上接受的是${typeof dom}`;
		}
	};
	return {
		wrap: wrap,
		dom: child,
		scrollToDom: scrollToDom,
	};
}

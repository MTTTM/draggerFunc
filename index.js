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
            console.log("transform", t, cssObjOrStr);
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
    var friction = 0.95;
    return num * friction;
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

function draggerInit(wrap, child) {
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
        //顶部超出后，添加摩擦力，并且越来越大
        if (childRect.top >= wrapRect.top) {
            fPar = (wrapRect.top / childRect.top) * 0.2;
            console.warn("超出 fPar", fPar, t + fPar * (ny - y));
        } else if (childRect.top - wrapRect.top <= bottomLimit) {
            let wrapBottom = wrapRect.height + wrapRect.top;
            let childBottom = childRect.height + childRect.top;
            fPar = Math.abs(childBottom) / wrapBottom;
            console.error(
                "在车上顶部超出，不应该到这里的",
                fPar,
                "结果",
                t + fPar * (ny - y)
            );
        } else {
            console.log("其他===========,", fPar, "结果:", t + fPar * (ny - y));
        }
        nt = t + fPar * (ny - y);
        setTcss(child, {
            // translateX: nl + "px",
            translateY: nt + "px",
        });
        //新增========end
    };
    let downFn = function(event) {
        console.log("event", event);
        let e = getEvent(event);
        //获取x坐标和y坐标
        x = e.clientX;
        y = e.clientY;
        //重置过渡样式
        child.style.transition = "none";
        //获取左部和顶部的偏移量
        l = getTcss(dv, "translateX");
        t = getTcss(dv, "translateY");
        //设置样式
        dv.style.cursor = "move";
        window.addEventListener("mousemove", moveFn);
        window.addEventListener("touchmove", moveFn, { passive: false });
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
        console.log("onmouseUP", childRect.top, wrapRect.top);
        //内容刚刚贴着容器底部的距离
        let setBottomLimit = -(childRect.height - wrapRect.height); //var innerBox=document.querySelector(".innerBox").getBoundingClientRect();
        var bottomLimit = -(childRect.height - wrapRect.height); //- wrapRect.top
        console.log(
            "childRect.top",
            childRect.top - wrapRect.top,
            "bottomLimit",
            bottomLimit
        );
        if (childRect.top > wrapRect.top) {
            child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
            console.log("放开后设置");
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
        }
    };
    //电脑端添加事件======
    dv.addEventListener("mousedown", downFn);
    dv.addEventListener("mouseup", endFn);
    window.addEventListener("mouseup", endFn);
    window.addEventListener("mouseleave", endFn);
    //手机端添加事件=====
    dv.addEventListener("touchstart", downFn, { passive: false });
    dv.addEventListener("touchend", endFn);
    window.addEventListener("touchend", endFn);
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
            //内容刚刚贴着容器底部的距离
            let bottomLimit = -(
                childBoxRect.height -
                wrapBoxRect.height -
                wrapBoxRect.top
            );
            console.log("scrollToDom", dom, targetDomRectObj.top > wrapBoxRect.top);
            let translateY = targetDomRectObj.top - wrapBoxRect.top;
            if (targetDomRectObj.top > wrapBoxRect.top) {
                translateY = -translateY;
                if (translateY < bottomLimit) {
                    translateY = bottomLimit;
                }
            }
            setTcss(child, {
                translateX: -(targetDomRectObj.left - wrapBoxRect.left) + "px",
                translateY: translateY + "px",
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

function ready() {
    let box = document.querySelector(".box");
    var innerBox = document.querySelector(".innerBox");
    window.Dragger = draggerInit(box, innerBox);
}
document.removeEventListener("DOMContentLoaded", ready);
document.addEventListener("DOMContentLoaded", ready);
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
    console.log("aft", e.stopPropagation);
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
    let moveFn = function(event) {
        let eventObj = getEvent(event, "obj");
        let eventBaseInfo = eventObj.eInfo;
        let eItem = eventObj.eItem;
        console.log("eeeee", eventBaseInfo);
        eventBaseInfo.stopPropagation();
        eventBaseInfo.preventDefault();
        //获取x和y
        var nx = eItem.clientX;
        var ny = eItem.clientY;
        console.log("touchmove", ny);
        //计算移动后的左偏移量和顶部的偏移量
        // var nl = nx - (x - l);
        // var nt = ny - (y - t);
        var nl = l + nx - x;
        var nt = 1;
        //新增============start
        wrapRect = wrap.getBoundingClientRect(); //必须从新获取
        childRect = child.getBoundingClientRect(); //必须重新获取
        let fPar = 1;
        //顶部超出后，添加摩擦力，并且越来越大
        if (childRect.top >= wrapRect.top) {
            fPar = (wrapRect.top / childRect.top) * 0.2;
            console.log("超出 fPar", fPar);
        } else if (
            childRect.top <= -(childRect.height - wrapRect.height - wrapRect.top)
        ) {
            let wrapBottom = wrapRect.height + wrapRect.top;
            let childBottom = childRect.height + childRect.top;
            fPar = Math.abs(childBottom) / wrapBottom;
            console.log(
                "超出底部 fPar",
                fPar,
                "childBottom",
                childBottom,
                "wrapBottom",
                wrapBottom
            );
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
        console.log("touchstart", e);
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
        wrapRect = wrap.getBoundingClientRect(); //必须从新获取
        childRect = child.getBoundingClientRect(); //必须重新获取
        dv.style.cursor = "default";
        //电脑端移除事件
        window.removeEventListener("mousemove", moveFn);
        window.removeEventListener("touchmove", moveFn);
        console.log("onmouseUP", childRect.top, wrapRect.top);
        if (childRect.top > wrapRect.top) {
            child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
            console.log("放开后设置");
            setTcss(child, {
                translateX: 0 + "px",
                translateY: 0 + "px",
            });
        } else if (
            childRect.top < -(childRect.height - wrapRect.height - wrapRect.top)
        ) {
            console.log("放开后设置,超出底部");
            child.style.transition = "transform .2s ease-in-out"; //添加过渡动画，下一次点击时候，一定要移除掉
            setTcss(child, {
                translateX: 0 + "px",
                translateY: -(childRect.height - wrapRect.height) + "px",
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
}

function ready() {
    let box = document.querySelector(".box");
    var innerBox = document.querySelector(".innerBox");
    draggerInit(box, innerBox);
}
document.removeEventListener("DOMContentLoaded", ready);
document.addEventListener("DOMContentLoaded", ready);
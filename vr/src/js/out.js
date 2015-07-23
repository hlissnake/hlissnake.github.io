KISSY.add("vr/out", function(S, event, dom, utils){
    window.__carOutID = window.__carOutID||1;
    var TPL =
        '<div class="outCarScene"> \
            <div class="carTip"> \
                <img src="http://gtms03.alicdn.com/tps/i3/TB1RUpfHFXXXXbpXFXXrAakJXXX-98-151.png">\
                <span></span>\
            </div> \
            <span class="loading">加载中...</span> \
            <a class="carLeftBtn carBtn" hidefocus target="_self" href="javascript:void(0);">&lt;</a> \
            <a class="carRightBtn carBtn" hidefocus target="_self" href="javascript:void(0);">&gt;</a> \
        </div>';

    var cssStyle =
        '.outCarScene{ \
            -webkit-tap-highlight-color:rgba(0, 0, 0, 0);\
            position:relative; \
            margin:0 auto; \
        } \
        .outCarScene .outCarImg{ \
            \
        } \
        .outCarScene .carTip{\
            position:absolute;\
            top:50%;\
            right:2px;\
            width:98px;\
            height:136px;\
            margin-top:-68px;\
            display:none;\
        }\
        .outCarScene .carTip span{\
            font-size:12px;\
            color:#000;\
            position:absolute;\
            left:3px;\
            top:27px;\
            text-align:center;\
            width:100px;\
            display:block;\
        }\
        .outCarScene span{ \
            position:absolute; \
            height:30px;\
            width:100%;\
            color:#fff;\
            text-align:center;\
            line-height:30px;\
            top:50%;\
            margin-top:-15px;\
        } \
        .outCarScene .carBtn{ \
            outline:0 none;\
            display:none; \
            font-size:45px; \
            line-height:200px; \
            height:200px; \
            width:50px; \
            text-align:center; \
            position:absolute; \
            top:50%; \
            margin-top:-100px; \
            text-decoration:none; \
            color:#000; \
        } \
        .outCarScene .carLeftBtn{ \
            left:0px; \
        } \
        .outCarScene .carRightBtn{ \
            right:0px; \
        }';

    var EVENT_DOWN = S.UA.mobile?"touchstart":"mousedown";
    var EVENT_MOVE = S.UA.mobile?"touchmove":"mousemove";
    var EVENT_UP = S.UA.mobile?"touchend":"mouseup";

    /**
     * 汽车外景
     * @param {Object} cfg 配置
     * @param {HTMLElement} cfg.container 容器
     * @param {Number} cfg.width 容器
     * @param {Number} cfg.height 容器
     * @param {Array} cfg.images 图片列表
     */
    var Out = function(cfg){
        var container = cfg.container||document.body;
        var width = this.width = cfg.width;
        var height = this.height = cfg.height;
        var images = cfg.images;

        this.elem = dom.create(TPL);
        this.carLeftBtn = dom.get(".carLeftBtn", this.elem);
        this.carRightBtn = dom.get(".carRightBtn", this.elem);
        container.appendChild(this.elem);

        if(!document.getElementById("outCarStyle")){
            dom.addStyleSheet(cssStyle, "outCarStyle");
        }

        if(images && images.length){
            this.setImages(images);
        }

        dom.css(this.elem, {
            width:width,
            height:height
        });

        this._isMouseDown = false;
        this._speed = 0;

        window["__carOut_" + (window.__carOutID++)] = this;
    };

    function fixEvent(e){
        e = e || window.event;
        if(e.changedTouches){
            var originEvent = e;
            e = e.changedTouches[0]
            e.preventDefault = function(){
                originEvent.preventDefault();
            };
        }
        return e;
    }

    function loadImage(images, callback, loadCallback, res){
        if(images.length === 0){
            callback();
        }
        else{
            var maxLoadNum = 5;
            var loadNum = Math.min(maxLoadNum, images.length);
            var loadedNum = 0;
            images = images.slice(0);
            for(var i = 0;i < loadNum;i ++){
                var src = images.pop();
                var img = new Image();
                res.push(img);
                img.onload = img.onerror = function(e){
                    loadedNum ++;
                    loadCallback();
                    if(loadedNum === loadNum){
                        loadImage(images, callback, loadCallback, res);
                    }
                };
                img.src = src;
            }
        }
    }

    Out.prototype = {
        constructor:Out,
        _bindEvent:function(){
            var that = this;
            var eventNames = S.UA.mobile?["touchstart", "touchmove", "touchend"]:["mousedown", "mousemove", "mouseup"];

            if(!S.UA.mobile){
                event.on(that.imageElem, EVENT_DOWN, function(e){
                    e.preventDefault();
                });
            }

            if(that._showBtn){
                event.on(this.carLeftBtn, EVENT_DOWN, function(e){
                    that.move(1/that.perNum);
                    e.halt();
                    return false;
                });

                event.on(this.carRightBtn, EVENT_DOWN, function(e){
                    that.move(-1/that.perNum);
                    e.halt();
                    return false;
                });

                dom.show(this.carRightBtn);
                dom.show(this.carLeftBtn);
            }
            else{
                var tipElem = dom.get(".carTip", this.elem);
                var tipText = dom.get("span", tipElem);
                dom.show(tipElem);
                tipText.innerHTML = S.UA.mobile?"请用手指拖拽":"请用鼠标拖拽";
                var isTipShow = true;
                if(S.UA.mobile){
                    tipElem.style.webkitTransformOrigin = "100% 50%";
                    tipElem.style.webkitTransform = "scale(1, 1)";
                    tipText.style.fontSize = "12px";
                }

                this.elem["on" + EVENT_DOWN] = function(e){
                    e = fixEvent(e);

                    if(!that._isMouseDown){
                        if(isTipShow){
                            isTipShow = false;
                            dom.hide(tipElem);
                        }

                        that._speed = 0;
                        that._preX = e.clientX;
                        that._mouseX = e.clientX;
                        that._mouseY = e.clientY;
                        clearInterval(that._interval);
                        that._interval = setInterval(function(){
                            that.tick();
                        }, S.UA.mobile?40:16);
                    }
                    that._isMouseDown = true;
                };

                this.elem["on" + EVENT_MOVE] = function(e){
                    e = fixEvent(e);
                    if(that._isMouseDown){
                        that._mouseX = e.clientX;
                        if(S.UA.mobile && (Math.abs(that._mouseY - e.clientY) < 5 || S.UA.android > 4.3)){
                            e.preventDefault();
                        }
                    }
                };

                event.on(document.body, EVENT_UP, function(e){
                    e = fixEvent(e);
                    that._isMouseDown = false;
                });
            }
        },
        setImages:function(images){
            this._images = images;

            //ie8- 拖拽有bug
            if(S.UA.ie && S.UA.ie <= 8 && images.length > 10){
                this._showBtn = true;
                this._images = [];
                var num = images.length/8;
                for(var i = 0;i < images.length;i += num){
                    this._images.push(images[i>>0]);
                }
            }

            if(this._images.length < 10){
                this._showBtn = true;
            }

            if((S.UA.mobile || S.UA.webkit || S.UA.ie > 8) && !this._showBtn){
                this.useCanvas = true;
                this.imageElem = dom.create('<canvas class="outCarImg"></canvas>');
                this.ctx = this.imageElem.getContext("2d");
                this.elem.appendChild(this.imageElem);
            }
            else{
                this.imageElem = dom.create('<img class="outCarImg" src="http://g.tbcdn.cn/s.gif">');
                this.elem.appendChild(this.imageElem);
            }
            this.imageElem.width = this.width;
            this.imageElem.height = this.height;

            this._index = 0;
            this._num = this._images.length;
            this.perNum = this._num/360;

            var that = this;
            var loadElem = dom.get(".loading", that.elem);
            var loadNum = 0;
            this._loadedImage = [];
            loadImage(that._images, function(){
                dom.hide(loadElem);
                that._render();
                that._bindEvent();
            }, function(){
                loadNum ++;
                loadElem.innerHTML = "加载中..." + Math.floor(loadNum/that._num*100) + "%";
            },this._loadedImage);
        },
        move:function(speed){
            this._index += speed*this.perNum;
            this._index = this._index % this._num;
            if(this._index < 0){
                this._index = this._num + this._index;
            }

            this._render();
        },
        _render:function(){
            var index = this._index>>0;
            var src = this._images[index];
            if(this._currentSrc !== src){
                this._currentSrc = src;
                if(this.useCanvas){
                    var img = this._loadedImage[index];
                    this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.width, this.height);
                }
                else{
                    this.imageElem.src = src;
                }
            }
        },
        tick:function(){
            if(this._isMouseDown){
                var speed = Math.abs(this._preX - this._mouseX);
                var speed = Math.min(speed, 10);
                this._speed = (this._preX - this._mouseX > 0)?speed:-speed;
                this._preX = this._mouseX;
            }
            else{
                if(0 && S.UA.android){
                    this._speed = 0;
                    clearInterval(this._interval);
                }
                else{
                    var v = .5;
                    if(this._speed > 0){
                        this._speed -= v;
                        if(this._speed <= 0){
                            this._speed = 0;
                            clearInterval(this._interval);
                        }
                    }
                    else{
                        this._speed += v;
                        if(this._speed >= 0){
                            this._speed = 0;
                            clearInterval(this._interval);
                        }
                    }
                }
            }

            this.move(this._speed);
        }
    };

    return Out;
},{
    requires:["event", "dom", "vr/utils"]
})
/**
 * @file scroll
 * @author cuiliangliang
 * @since 2018.8.7
 */

;(function (window, document, Math) {
    function Scroll(id, params) {
        this.scroller = document.querySelector(id);
        this.childNode = this.scroller.childNodes[0];
        this.options = {
            step: true,// 是否开启步长模式
            defaultPlace: 0,// 默认列表位置
            callback: null
        };

        this.startPageY = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.offsetTop = 0;//上一次滚动位置

        this.scrollerHeight = this.scroller.clientHeight;//scroller高度
        this.childNodeHeight = this.childNode.clientHeight;//scroller子元素的高度
        this.scrollHeight = this.childNodeHeight - this.scrollerHeight;//滚动高度

        let childNodes = this.childNode.childNodes;
        this.stepLen =  childNodes.length > 0 ? childNodes[0].clientHeight : 0;// 步长

        // 设置参数
        for(let key in params){
            this.options[key] = params[key];
        }

        // 默认列表位置
        let defaultPlace = this.options.defaultPlace ? this.options.defaultPlace : 0;
        this.scrollTo(0, defaultPlace);

        this._start();
        this._move();
        this._end();
    }

    Scroll.prototype = {
        _start: function () {
            this.scroller.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();

                this.startTime = this.getTime();
                let touches = e.touches ? e.touches[0] : e;
                this.startPageY = touches.pageY;//起始触摸点

                this.browserVendor('transition', 'none');
            }, false);
        },

        _move: function () {
            this.scroller.addEventListener('touchmove', (e) => {
                e.stopPropagation();
                e.preventDefault();

                let timestamp = this.getTime();
                let touches = e.touches ? e.touches[0] : e;

                // 滚动高度
                let diffPageY = touches.pageY - this.startPageY;
                let movePageY = diffPageY + this.offsetTop;

                // 最少移动10px
                if ( timestamp - this.endTime > 300 && Math.abs(diffPageY) < 10 ) {
                    return;
                }

                // 超过边缘滚动有阻力
                if( movePageY > 0 ){
                    movePageY /= 3;
                }else if( Math.abs(movePageY) > Math.abs(this.scrollHeight) ){
                    movePageY = Math.abs(this.scrollHeight) - Math.abs(movePageY);
                    movePageY = movePageY / 3 - this.scrollHeight;
                }

                this.browserVendor('transform', 'translate(0, '+ movePageY +'px)');
            }, false);
        },

        _end: function () {
            this.scroller.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();

                this.endTime = this.getTime();
                let duration = this.endTime - this.startTime;

                let touches = e.changedTouches ? e.changedTouches[0] : e;
                let offsetHeight = touches.pageY - this.startPageY;//本次滚动偏移位置
                this.offsetTop += offsetHeight;//记录总偏移位置

                if( (this.offsetTop > 0) || (Math.abs(this.offsetTop) > Math.abs(this.scrollHeight)) ){
                    //上边缘&下边缘
                    this.browserVendor('transition', 'all 500ms');
                }
                else if( duration < 300 ){ // 惯性滚动
                    let speed = Math.abs(offsetHeight) / duration;// 惯性移动速度
                    let moveTime = duration * speed * 20;// 惯性滚动时间(动画)
                    moveTime = moveTime > 2000 ? 2000 : moveTime;
                    this.offsetTop += offsetHeight * speed * 10;// 惯性移动距离

                    this.browserVendor('transitionProperty', 'all');
                    this.browserVendor('transitionDuration', moveTime + 'ms');
                    this.browserVendor('transitionTimingFunction', 'cubic-bezier(0.1, 0.57, 0.1, 1)');
                }else{
                    this.browserVendor('transition', 'all 500ms');
                }

                if( this.offsetTop > 0 ){
                    this.offsetTop = 0;
                }else if( Math.abs(this.offsetTop) > Math.abs(this.scrollHeight) ){
                    this.offsetTop = -this.scrollHeight;
                }

                // 步长模式
                if( this.options.step && this.stepLen > 0 ){
                    let nowEndY = this.offsetTop;
                    let h = Math.abs( nowEndY % this.stepLen );//滚动多余不足step的高度
                    let halfHeight = this.stepLen / 2;//step一半的高度

                    //超过行一半的高度，则滚动一行
                    let moveY = (h >= halfHeight) ? (nowEndY - this.stepLen + h) : (nowEndY + h);

                    let index = parseInt( Math.abs(moveY) / this.stepLen );
                    this.options.callback({
                        index: index,
                        node: this.childNode.children
                    });
                    this.offsetTop = moveY;
                }

                this.browserVendor('transform', 'translate(0, '+ this.offsetTop +'px)');

            }, false);
        },

        // 滚动到指定位置
        scrollTo: function (x, y, time) {
            if( time && time > 0 ){
                this.browserVendor('transitionProperty', 'all');
                this.browserVendor('transitionDuration', time + 'ms');
                this.browserVendor('transitionTimingFunction', 'cubic-bezier(0.1, 0.57, 0.1, 1)');
            }else{
                this.browserVendor('transition', 'none');
            }

            y = -y;
            this.offsetTop = y;
            this.browserVendor('transform', 'translate(0, '+ y +'px)');
        },

        // 刷新
        refresh: function () {
            this.childNode = this.scroller.childNodes[0];
            this.startPageY = 0;
            this.startTime = 0;
            this.endTime = 0;
            this.offsetTop = 0;

            this.scrollerHeight = this.scroller.clientHeight;//scroller高度
            this.childNodeHeight = this.childNode.clientHeight;//scroller子元素的高度
            this.scrollHeight = this.childNodeHeight - this.scrollerHeight;//滚动高度

            let childNodes = this.childNode.childNodes;
            this.stepLen =  childNodes.length > 0 ? childNodes[0].clientHeight : 0;// 步长

            this.scrollTo(0, 0, 500);
        },

        // 浏览器兼容
        browserVendor: function(styleStr, value){
            let vendors = ['t', 'WebkitT', 'MozT', 'msT', 'OT'],
                styleObj,
                len = vendors.length;
            let elementStyle = this.childNode.style;

            for (let i = 0; i < len; i++ ) {
                styleObj = vendors[i] + styleStr.substr(1);
                if ( styleObj in elementStyle ) {
                    elementStyle[styleObj] = value;
                    // console.log(styleObj + ' = ' + value);
                }
            }
        },

        // 获取当前时间
        getTime: function () {
            return parseInt(new Date().getTime());
        }
    };

    if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Scroll;
    } else {
        window.Picker = Scroll;
    }

})(window, document, Math);

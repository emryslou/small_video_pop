!(function (window, undefined) {
    function SmallVideo () {
        /**
         * 视频元素
         * @type {null}
         */
        this.videoElement = null;

        /**
         * 视频元素匹配规则
         * @type {{"zealer.com": *[], "qq.com": *[], "ifeng.com": *[]}}
         */
        this.videoEleRules = {
            'zealer.com': [
                {
                    attr: 'id',
                    match: 'fuzzy',
                    val: 'trump_main_unique_1',
                    nodeName: 'div',
                    parentLevel: 4
                }
            ],
            'qq.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['tenvideo_player', 'video_container_body'],
                    parentLevel: 10,
                    nodeName: 'div'
                }
            ],
            'ifeng.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['player'],
                    parentLevel: 3,
                    nodeName: 'video'
                }
            ],
            'bilibili.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['bilibiliPlayer'],
                    parentLevel: 5,
                    nodeName: 'div'
                }
            ],
            'youku.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['player', 'ykPlayer'],
                    parentLevel: 10,
                    nodeName: 'div'
                }
            ],
            'baidu.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['video-wrap'],
                    parentLevel: 3,
                    nodeName: 'div'
                }
            ],
            'huya.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['player-video'],
                    parentLevel: 3,
                    nodeName: 'div'
                }
            ],
            'sohu.com': [
                {
                    attr: 'id',
                    match: 'exact',
                    val: ['player'],
                    parentLevel: 10,
                    nodeName: 'div'
                }
            ],
            'common': [
                {
                    match: 'common',
                    val: ['video', 'object', 'embed'],
                }
            ]
        };

        /**
         * 检测页面是需要视频小窗初始化
         * @returns {boolean}
         */
        this.checkInit = () => {
            return true; //!!document.querySelector('video,object,embed');
        }

        /**
         * 检测原始是否可以显示视频按钮
         * @param {HtmlElement} eleNode
         * @returns {boolean}
         */
        this.checkVideoEle = eleNode => {
            let blnRet = false, videoRule = undefined;
            let domain = window.location.hostname;
            Object.keys(this.videoEleRules).forEach((key) => {
                if (domain.indexOf(key) > 0) {
                    videoRule = this.videoEleRules[key];
                }
            });
            videoRule || (videoRule = this.videoEleRules['common']);

            for(let intRuleIdx in videoRule) {
                blnRet = this.ruleEngine(eleNode, videoRule[intRuleIdx]);
                if (blnRet) {
                    break ;
                }
            }
            return blnRet;
        };

        /**
         * 注入小窗按钮
         */
        this.injectBtnIfr = () => {
            let url = chrome.extension.getURL("html/video_float_button.html");
            if (!!document.querySelector('iframe[src="' + url +'"]') === false) {
                let smallBtn = document.createElement('div');
                smallBtn.classList.add('__video_float_btn__');
                smallBtn.setAttribute('id', '__id_video_float_btn__');
                let ifr = document.createElement('iframe');
                ifr.setAttribute("frameborder", 0);
                ifr.setAttribute("scrolling", "none");
                ifr.setAttribute('id', '__video_float_ifr__');
                ifr.src = url;
                smallBtn.appendChild(ifr);
                document.body.appendChild(smallBtn);
                let style = document.createElement('style');
                style.innerHTML = `div.__video_float_btn__ { position: absolute; z-index: ${Math.pow(2, 31) - 1}; height: 31px; width: 4em; display: none; }`;
                style.type = 'text/css';
                document.head.appendChild(style);
            }
        }

        /**
         * 显示视频小窗按钮
         * @param event
         */
        this.showBtn = event => {
            if (this.checkVideoEle(event.target)) {
                let clientRect = this.videoElement.getBoundingClientRect();
                if (clientRect.height >= 320 && clientRect.width >= 480) {
                    this.videoElement.setAttribute('extVideoQry', 'extVideoQry');
                    let btnTopVal = clientRect.top >= 0 ? (clientRect.top + window.scrollY) : window.scrollY;
                    util.$('div#__id_video_float_btn__').style.cssText = util.css(
                        'display', 'block',
                        'top', Math.abs(btnTopVal) + 'px',
                        'left', this.videoElement.clientWidth - 80 + clientRect.left + 'px',
                        'zIndex', (Math.pow(2, 31) - 1) + ' !important'
                    );
                    util.$('iframe#__video_float_ifr__').contentWindow.postMessage({
                        action: 'send_video_info',
                        src: 'small_video',
                        data: clientRect
                    }, '*');
                }
            } else if (event.target.id !== '__video_float_ifr__' && util.$('div#__id_video_float_btn__').style.display !== 'none') {
                util.$('div#__id_video_float_btn__').style.cssText = util.css('display', 'none');
            }

        };

        /**
         * 视频小窗元素处理引擎
         * @param eleNode
         * @param rule
         * @returns {boolean}
         */
        this.ruleEngine = (eleNode, rule) => {
            let blnRet = false;
            let ruleEngineFn = 'ruleEngine' + (rule.match.replace(/(^|\b)([\w])/g, function($1){return $1.toUpperCase()}));
            if (eleNode && this.hasOwnProperty(ruleEngineFn)) {
                if (rule.match === 'common') {
                    blnRet = this.ruleEngineCommon(eleNode.nodeName.toLowerCase(), rule.val);
                    blnRet && (this.videoElement = eleNode);
                } else {
                    let parentLevel = rule.parentLevel || 1;
                    while (eleNode.nodeName.toLowerCase() !== 'body' && parentLevel > 0) {
                        let attrVal = eleNode.hasAttribute(rule.attr) ? eleNode.getAttribute(rule.attr) : '';
                        blnRet = this[ruleEngineFn](attrVal, rule.val) && eleNode.nodeName.toLowerCase() === rule.nodeName;
                        if (!blnRet) {
                            parentLevel -= 1;
                            eleNode = eleNode.parentNode;
                        } else {
                            this.videoElement = eleNode;
                            break;
                        }
                    }
                }
            } else {
                console.log('rule engine error', ruleEngineFn);
            }
            return blnRet;
        };

        /**
         * 模糊匹配
         * @param attrVal
         * @param matchVal
         * @returns {boolean}
         */
        this.ruleEngineFuzzy = (attrVal, matchVal) => {
            return attrVal.indexOf(matchVal) >= 0;
        };

        /**
         * 请准匹配
         * @param attrVal
         * @param matchVal
         * @returns {boolean}
         */
        this.ruleEngineExact = (attrVal, matchVal) => {
            return (this.getType(matchVal).indexOf('Array') >= 0) ? (matchVal.indexOf(attrVal) >= 0) : attrVal === matchVal;
        };

        /**
         * 通用匹配规则
         * @param attrVal
         * @param matchVal
         * @returns {boolean}
         */
        this.ruleEngineCommon = (attrVal, matchVal) => {
            return (this.getType(matchVal).indexOf('Array') >= 0) ? (matchVal.indexOf(attrVal) >= 0) : attrVal === matchVal;
        };

        /**
         * 获取数据类型
         * @param data
         * @returns {string}
         */
        this.getType = data => {
            return Object.prototype.toString.call(data);
        };

        /**
         * 视频小窗按钮初始化
         */
        this.init = () => {
            if (this.checkInit()) {
                this.injectBtnIfr();
                window.addEventListener('mouseover', this.showBtn);
            } else {
                console.log('页面不支持');
            }
        };
    }
    (new SmallVideo()).init();
})(window, undefined);

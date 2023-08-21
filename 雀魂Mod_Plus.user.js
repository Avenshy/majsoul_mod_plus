// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.269
// @description       雀魂解锁全角色、皮肤、装扮等，支持全部服务器。
// @description:zh-TW 雀魂解鎖全角色、皮膚、裝扮等，支持全部伺服器。
// @description:zh-HK 雀魂解鎖全角色、皮膚、裝扮等，支持全部服務器。
// @description:en    A majsoul mod that unlocks all characters, skins, decorations, etc. and supports all servers.
// @description:ja    A majsoul mod that unlocks all characters, skins, decorations, etc. and supports all servers.
// @author       Avenshy
// @iconURL      https://www.maj-soul.com/homepage/character/1/yiji_0.png
// @homepageURL  https://github.com/Avenshy/majsoul_mod_plus
// @supportURL   https://github.com/Avenshy/majsoul_mod_plus/issues
// @match        https://game.maj-soul.com/1/
// @match        https://game.maj-soul.net/1/
// @match        https://game.mahjongsoul.com/
// @match        https://game.mahjongsoul.com/index.html
// @match        https://mahjongsoul.game.yo-star.com/
// @require      https://greasyfork.org/scripts/447701-javascript-blowfish/code/javascript-blowfish.js?version=1069157
// @require      https://greasyfork.org/scripts/447737-majsoul-mod-plus/code/majsoul_mod_plus.js?version=1130702
// @require      https://unpkg.com/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js
// @resource     bootstrap https://unpkg.com/bootstrap@5.1.3/dist/css/bootstrap.min.css
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @connect      localhost
// @license      GPL-3.0
// ==/UserScript==

// 无需在此调整任何设置！正常游戏即可！
// 无需在此调整任何设置！正常游戏即可！
// 无需在此调整任何设置！正常游戏即可！

// ID可以F12打开控制台查询。
// 所有物品 cfg.item_definition.item.map_
// 所有角色 cfg.item_definition.character.map_
// 所有皮肤 cfg.item_definition.skin.map_
// 所有称号 cfg.item_definition.title.map_

class MajsoulModPlus {
    constructor() {
        this.settings = { // 第一次使用的默认设置
            character: 200001, // 当前角色
            characters: { 0: 400101 }, // 各角色使用的皮肤
            star_chars: [], // 星标角色
            commonViewList: [
                [],
                [],
                [],
                [],
                []
            ], // 保存装扮
            loadingCG: [], // 加载插画CG
            using_commonview_index: 0, // 使用装扮页
            title: 600021, // 称号
            nickname: '',
            setAuto: {
                isSetAuto: false, // 开关，是否在开局后自动设置指定状态
                setAutoLiPai: true, // 自动理牌
                setAutoHule: true, // 自动和了
                setAutoNoFulu: false, // 不吃碰杠
                setAutoMoQie: false // 自动摸切
            },
            setbianjietishi: false, // 强制打开便捷提示
            setItems: {
                setAllItems: true, // 开关，是否获得全部道具
                ignoreItems: [], // 不需要获得的道具id
                ignoreEvent: true // 不获得活动道具，编号一般为309XXX
            },
            randomBotSkin: false, // 开关，是否随机电脑皮肤
            randomPlayerDefSkin: false, // 开关，是否随机那些只有默认皮肤的玩家的皮肤
            version: '', // 上次运行的版本，用于显示更新日志
            isReadme: false, // 是否已阅读readme
            sendGame: false, // 开关，是否发送游戏对局（如发送至mahjong-helper）
            sendGameURL: 'https://localhost:12121/', // 接收游戏对局的URL
            setPaipuChar: true, // 开关，对查看牌谱生效
            showServer: true, // 开关，显示玩家所在服务器
            antiCensorship: true, // 开关，反屏蔽名称与文本审查
            antiKickout: true // 开关，屏蔽挂机检测踢出游戏
        }

    }

    loadSettings() {
        var temp = {};
        try {
            let value = GM_getValue('majsoul_mod_plus', '');
            if (value != '') {
                if (value.charAt(0) == '{' && value.charAt(value.length - 1) == '}') {
                    temp = JSON.parse(GM_getValue('majsoul_mod_plus', '{}'));
                } else {
                    let bf = new Blowfish(secret_key);
                    temp = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(value.replace(/-/g, '=')))));
                }
            } else {
                firstRun = true;
            }

        } catch (error) {
            console.log('[雀魂mod_plus] 读取配置出错，自动切换到cookie模式');
            let ca = document.cookie.split(";");
            for (let element of ca) {
                element = element.trim();
                if (element.indexOf('majsoul_mod_plus=') == 0) {
                    value = decodeURIComponent(element.substring("majsoul_mod_plus=".length, element.length));
                    if (value.charAt(0) == '{' && value.charAt(value.length - 1) == '}') {
                        temp = JSON.parse(value);
                        break
                    } else {
                        let bf = new Blowfish(secret_key);
                        temp = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(value.replace(/-/g, '=')))));
                        break
                    }
                }
            }

        }
        for (var key in temp) {
            if (this.settings[key] != undefined) {
                this.settings[key] = temp[key];
            }
        }
        this.saveSettings(true);
    }
    saveSettings(isFirstRun) {
        let bf = new Blowfish(secret_key);
        let value = bf.base64Encode(bf.encrypt(JSON.stringify(this.settings))).replace(/=/g, '-')
        try {
            GM_setValue('majsoul_mod_plus', value);
        } catch (error) {
            var d = new Date();
            d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toGMTString();
            document.cookie = "majsoul_mod_plus=" + encodeURIComponent(value) + "; " + expires;
        }
        if (isFirstRun) {
            console.log('[雀魂mod_plus] 配置已读取：')
            console.log(this)
            console.warn('[雀魂mod_plus] ' + secret_key);
        } else {
            console.log('[雀魂mod_plus] 配置已保存：');
            console.log(this)
            console.warn('[雀魂mod_plus] ' + secret_key);
        }
    }
}
let secret_key;
let fake_data = {};
! function () {
    var MMP = new MajsoulModPlus;
    let bf = new Blowfish("majsoul_mod_plus");
    secret_key = bf.trimZeros(bf.decrypt(bf.base64Decode(tips.replace(/-/g, '='))));
    if (typeof unsafeWindow !== "undefined") {
        unsafeWindow.MMP = MMP;
    } else {
        console.log("unsafeWindow API not available. Try to inject into window.MMP");
        window.MMP = MMP;
    }
    MMP.loadSettings();
}();

// 取称号id
function getAvatar_id() {
    for (let item of MMP.settings.commonViewList[MMP.settings.using_commonview_index]) {
        if (item.slot == 5) {
            return item.item_id;
        }
    }
    return 305501;
}
// 设置便捷提示
function setAuto() {
    // 自动理牌
    view.DesktopMgr.Inst.auto_liqi = MMP.settings.setAuto.setAutoLiPai;
    view.DesktopMgr.Inst.setAutoLiPai(MMP.settings.setAuto.setAutoLiPai);
    uiscript.UI_DesktopInfo.Inst.refreshFuncBtnShow(uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName("btn_autolipai"), MMP.settings.setAuto.setAutoLiPai);
    //Laya.LocalStorage.setItem("autolipai", MMP.settings.setAuto.setAutoLiPai ? "true" : "false");
    // 自动和牌
    view.DesktopMgr.Inst.auto_hule = MMP.settings.setAuto.setAutoHule;
    view.DesktopMgr.Inst.setAutoHule(MMP.settings.setAuto.setAutoHule);
    uiscript.UI_DesktopInfo.Inst.refreshFuncBtnShow(uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName("btn_autohu"), MMP.settings.setAuto.setAutoHule);
    // 不吃碰杠
    view.DesktopMgr.Inst.auto_nofulu = MMP.settings.setAuto.setAutoNoFulu;
    view.DesktopMgr.Inst.setAutoNoFulu(MMP.settings.setAuto.setAutoNoFulu);
    uiscript.UI_DesktopInfo.Inst.refreshFuncBtnShow(uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName("btn_autonoming"), MMP.settings.setAuto.setAutoNoFulu);
    // 自动摸切
    view.DesktopMgr.Inst.auto_moqie = MMP.settings.setAuto.setAutoMoQie;
    view.DesktopMgr.Inst.setAutoMoQie(MMP.settings.setAuto.setAutoMoQie);
    uiscript.UI_DesktopInfo.Inst.refreshFuncBtnShow(uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName("btn_automoqie"), MMP.settings.setAuto.setAutoMoQie);
}
// 油猴API测试
function testAPI() {
    let apis = ['GM_setValue', 'GM_getValue', 'GM_info', 'unsafeWindow', 'GM_xmlhttpRequest', 'GM_registerMenuCommand', 'GM_addStyle', 'GM_getResourceText'];
    let result = { 'apis': {}, 'clear': true };
    for (func of apis) {
        try {
            if (typeof eval(func) !== "undefined") {
                result['apis'][func] = true;

            } else {
                result['apis'][func] = false;
                result['clear'] = false;
            }
        } catch {
            result['apis'][func] = false;
            result['clear'] = false;
        }
    }
    return result
}


! function majsoul_mod_plus() {
    try {

        // Hack 开启报番型，作者 aoarashi1988，Handle修改
        ! function () {
            const arrBackup = cfg.voice.sound.groups_;
            if (!arrBackup || arrBackup.length === 0) {
                throw new Error();
            }
            Object.entries(cfg.voice.sound.groups_).forEach(
                ([soundID, soundGroup]) => {
                    soundGroup.forEach((soundObject, index) => {
                        soundObject.level_limit = 0;
                        soundObject.bond_limit = 0;
                    });
                });
        }
            ();




        // 设置全部道具
        !function (C) {
            var K;
            !function (C) {
                C[C.none = 0] = 'none',
                    C[C['daoju'] = 1] = 'daoju',
                    C[C.gift = 2] = 'gift',
                    C[C['fudai'] = 3] = 'fudai',
                    C[C.view = 5] = 'view';
            }
                (K = C['EItemCategory'] || (C['EItemCategory'] = {}));
            var r = function (r) {
                function X() {
                    var C = r.call(this, new ui['lobby']['bagUI']()) || this;
                    return C['container_top'] = null,
                        C['container_content'] = null,
                        C['locking'] = !1,
                        C.tabs = [],
                        C['page_item'] = null,
                        C['page_gift'] = null,
                        C['page_skin'] = null,
                        C['page_cg'] = null,
                        C['select_index'] = 0,
                        X.Inst = C,
                        C;
                }
                return __extends(X, r),
                    X.init = function () {
                        var C = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (K) {
                            var r = K['update'];
                            r && r.bag && (C['update_data'](r.bag['update_items']), C['update_daily_gain_data'](r.bag));
                        }, null, !1)),
                            this['fetch']();
                    },
                    X['fetch'] = function () {
                        var K = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (r, X) {
                                if (r || X['error'])
                                    C['UIMgr'].Inst['showNetReqError']('fetchBagInfo', r, X);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](X));
                                    var U = X.bag;
                                    if (U) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of l["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            K._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    K._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (U['items'])
                                                for (var i = 0; i < U['items']['length']; i++) {
                                                    var N = U['items'][i]['item_id'],
                                                        H = U['items'][i]['stack'],
                                                        w = cfg['item_definition'].item.get(N);
                                                    w && (K['_item_map'][N] = {
                                                        item_id: N,
                                                        count: H,
                                                        category: w['category']
                                                    }, 1 == w['category'] && 3 == w.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: N
                                                    }, function () { }));
                                                }
                                            if (U['daily_gain_record'])
                                                for (var G = U['daily_gain_record'], i = 0; i < G['length']; i++) {
                                                    var l = G[i]['limit_source_id'];
                                                    K['_daily_gain_record'][l] = {};
                                                    var R = G[i]['record_time'];
                                                    K['_daily_gain_record'][l]['record_time'] = R;
                                                    var f = G[i]['records'];
                                                    if (f)
                                                        for (var A = 0; A < f['length']; A++)
                                                            K['_daily_gain_record'][l][f[A]['item_id']] = f[A]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    X['find_item'] = function (C) {
                        var K = this['_item_map'][C];
                        return K ? {
                            item_id: K['item_id'],
                            category: K['category'],
                            count: K['count']
                        }
                            : null;
                    },
                    X['get_item_count'] = function (C) {
                        var K = this['find_item'](C);
                        if (K)
                            return K['count'];
                        if ('100001' == C) {
                            for (var r = 0, X = 0, U = GameMgr.Inst['free_diamonds']; X < U['length']; X++) {
                                var i = U[X];
                                GameMgr.Inst['account_numerical_resource'][i] && (r += GameMgr.Inst['account_numerical_resource'][i]);
                            }
                            for (var N = 0, H = GameMgr.Inst['paid_diamonds']; N < H['length']; N++) {
                                var i = H[N];
                                GameMgr.Inst['account_numerical_resource'][i] && (r += GameMgr.Inst['account_numerical_resource'][i]);
                            }
                            return r;
                        }
                        if ('100004' == C) {
                            for (var w = 0, G = 0, l = GameMgr.Inst['free_pifuquans']; G < l['length']; G++) {
                                var i = l[G];
                                GameMgr.Inst['account_numerical_resource'][i] && (w += GameMgr.Inst['account_numerical_resource'][i]);
                            }
                            for (var R = 0, f = GameMgr.Inst['paid_pifuquans']; R < f['length']; R++) {
                                var i = f[R];
                                GameMgr.Inst['account_numerical_resource'][i] && (w += GameMgr.Inst['account_numerical_resource'][i]);
                            }
                            return w;
                        }
                        return '100002' == C ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    X['find_items_by_category'] = function (C) {
                        var K = [];
                        for (var r in this['_item_map'])
                            this['_item_map'][r]['category'] == C && this['_item_map'][r]['count'] && K.push({
                                item_id: this['_item_map'][r]['item_id'],
                                category: this['_item_map'][r]['category'],
                                count: this['_item_map'][r]['count']
                            });
                        return K;
                    },
                    X['update_data'] = function (K) {
                        for (var r = 0; r < K['length']; r++) {
                            var X = K[r]['item_id'],
                                U = K[r]['stack'];
                            if (U > 0) {
                                this['_item_map']['hasOwnProperty'](X['toString']()) ? this['_item_map'][X]['count'] = U : this['_item_map'][X] = {
                                    item_id: X,
                                    count: U,
                                    category: cfg['item_definition'].item.get(X)['category']
                                };
                                var i = cfg['item_definition'].item.get(X);
                                1 == i['category'] && 3 == i.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: X
                                }, function () { }),
                                    5 == i['category'] && (this['new_bag_item_ids'].push(X), this['new_zhuangban_item_ids'][X] = 1),
                                    8 != i['category'] || i['item_expire'] || this['new_cg_ids'].push(X);
                            } else if (this['_item_map']['hasOwnProperty'](X['toString']())) {
                                var N = cfg['item_definition'].item.get(X);
                                N && 5 == N['category'] && C['UI_Sushe']['on_view_remove'](X),
                                    this['_item_map'][X] = 0,
                                    delete this['_item_map'][X];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var r = 0; r < K['length']; r++) {
                            var X = K[r]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](X['toString']()))
                                for (var H = this['_item_listener'][X], w = 0; w < H['length']; w++)
                                    H[w].run();
                        }
                        for (var r = 0; r < this['_all_item_listener']['length']; r++)
                            this['_all_item_listener'][r].run();
                    },
                    X['update_daily_gain_data'] = function (C) {
                        var K = C['update_daily_gain_record'];
                        if (K)
                            for (var r = 0; r < K['length']; r++) {
                                var X = K[r]['limit_source_id'];
                                this['_daily_gain_record'][X] || (this['_daily_gain_record'][X] = {});
                                var U = K[r]['record_time'];
                                this['_daily_gain_record'][X]['record_time'] = U;
                                var i = K[r]['records'];
                                if (i)
                                    for (var N = 0; N < i['length']; N++)
                                        this['_daily_gain_record'][X][i[N]['item_id']] = i[N]['count'];
                            }
                    },
                    X['get_item_daily_record'] = function (C, K) {
                        return this['_daily_gain_record'][C] ? this['_daily_gain_record'][C]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][C]['record_time']) ? this['_daily_gain_record'][C][K] ? this['_daily_gain_record'][C][K] : 0 : 0 : 0 : 0;
                    },
                    X['add_item_listener'] = function (C, K) {
                        this['_item_listener']['hasOwnProperty'](C['toString']()) || (this['_item_listener'][C] = []),
                            this['_item_listener'][C].push(K);
                    },
                    X['remove_item_listener'] = function (C, K) {
                        var r = this['_item_listener'][C];
                        if (r)
                            for (var X = 0; X < r['length']; X++)
                                if (r[X] === K) {
                                    r[X] = r[r['length'] - 1],
                                        r.pop();
                                    break;
                                }
                    },
                    X['add_all_item_listener'] = function (C) {
                        this['_all_item_listener'].push(C);
                    },
                    X['remove_all_item_listener'] = function (C) {
                        for (var K = this['_all_item_listener'], r = 0; r < K['length']; r++)
                            if (K[r] === C) {
                                K[r] = K[K['length'] - 1],
                                    K.pop();
                                break;
                            }
                    },
                    X['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    X['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    X['removeZhuangBanNew'] = function (C) {
                        for (var K = 0, r = C; K < r['length']; K++) {
                            var X = r[K];
                            delete this['new_zhuangban_item_ids'][X];
                        }
                    },
                    X['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    X['prototype']['onCreate'] = function () {
                        var K = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || K.hide(Laya['Handler']['create'](K, function () {
                                    return K['closeHandler'] ? (K['closeHandler'].run(), K['closeHandler'] = null, void 0) : (C['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var r = function (C) {
                            X.tabs.push(X['container_content']['getChildByName']('tabs')['getChildByName']('btn' + C)),
                                X.tabs[C]['clickHandler'] = Laya['Handler']['create'](X, function () {
                                    K['select_index'] != C && K['on_change_tab'](C);
                                }, null, !1);
                        }, X = this, U = 0; 5 > U; U++)
                            r(U);
                        this['page_item'] = new C['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new C['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new C['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new C['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    X['prototype'].show = function (K, r) {
                        var X = this;
                        void 0 === K && (K = 0),
                            void 0 === r && (r = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = r,
                            C['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            C['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                X['locking'] = !1;
                            }),
                            this['on_change_tab'](K),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    X['prototype']['onSkinYuLanBack'] = function () {
                        var K = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            C['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            C['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                K['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    X['prototype'].hide = function (K) {
                        var r = this;
                        this['locking'] = !0,
                            C['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            C['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                r['locking'] = !1,
                                    r['enable'] = !1,
                                    K && K.run();
                            });
                    },
                    X['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    X['prototype']['on_change_tab'] = function (C) {
                        this['select_index'] = C;
                        for (var r = 0; r < this.tabs['length']; r++)
                            this.tabs[r].skin = game['Tools']['localUISrc'](C == r ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[r]['getChildAt'](0)['color'] = C == r ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), C) {
                            case 0:
                                this['page_item'].show(K['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(K.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    X['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    X['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    X['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    X['_item_map'] = {},
                    X['_item_listener'] = {},
                    X['_all_item_listener'] = [],
                    X['_daily_gain_record'] = {},
                    X['new_bag_item_ids'] = [],
                    X['new_zhuangban_item_ids'] = {},
                    X['new_cg_ids'] = [],
                    X.Inst = null,
                    X;
            }
                (C['UIBase']);
            C['UI_Bag'] = r;
        }
            (uiscript || (uiscript = {}));










        // 修改牌桌上角色
        !function (C) {
            var K = function () {
                function K() {
                    var K = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = C['EConnectState'].none,
                        this['reconnect_count'] = 0,
                        this['reconnect_span'] = [500, 1000, 3000, 6000, 10000, 15000],
                        this['playerreconnect'] = !1,
                        this['lasterrortime'] = 0,
                        this['load_over'] = !1,
                        this['loaded_player_count'] = 0,
                        this['real_player_count'] = 0,
                        this['is_ob'] = !1,
                        this['ob_token'] = '',
                        this['lb_index'] = 0,
                        this['_report_reconnect_count'] = 0,
                        this['_connect_start_time'] = 0,
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (C) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(C),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(C));
                                    }
                                }));
                            }
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](C)),
                                K['loaded_player_count'] = C['ready_id_list']['length'],
                                K['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](K['loaded_player_count'], K['real_player_count']);
                        }));
                }
                return Object['defineProperty'](K, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new K() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    K['prototype']['OpenConnect'] = function (K, r, X, U) {
                        var i = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            C['Scene_Lobby'].Inst && C['Scene_Lobby'].Inst['active'] && (C['Scene_Lobby'].Inst['active'] = !1),
                            C['Scene_Huiye'].Inst && C['Scene_Huiye'].Inst['active'] && (C['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                i.url = '',
                                    i['token'] = K,
                                    i['game_uuid'] = r,
                                    i['server_location'] = X,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = X,
                                    GameMgr.Inst['mj_game_token'] = K,
                                    GameMgr.Inst['mj_game_uuid'] = r,
                                    i['playerreconnect'] = U,
                                    i['_setState'](C['EConnectState']['tryconnect']),
                                    i['load_over'] = !1,
                                    i['loaded_player_count'] = 0,
                                    i['real_player_count'] = 0,
                                    i['lb_index'] = 0,
                                    i['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    K['prototype']['reportInfo'] = function () {
                        this['connect_state'] == C['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: C['LobbyNetMgr']['root_id_lst'][C['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    K['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](C['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    K['prototype']['_OnConnent'] = function (K) {
                        app.Log.log('MJNetMgr _OnConnent event:' + K),
                            K == Laya['Event']['CLOSE'] || K == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == C['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == C['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](C['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](C['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2008)), C['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == C['EConnectState']['reconnecting'] && this['_Reconnect']()) : K == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == C['EConnectState']['tryconnect'] || this['connect_state'] == C['EConnectState']['reconnecting']) && ((this['connect_state'] = C['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](C['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    K['prototype']['_Reconnect'] = function () {
                        var K = this;
                        C['LobbyNetMgr'].Inst['connect_state'] == C['EConnectState'].none || C['LobbyNetMgr'].Inst['connect_state'] == C['EConnectState']['disconnect'] ? this['_setState'](C['EConnectState']['disconnect']) : C['LobbyNetMgr'].Inst['connect_state'] == C['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](C['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            K['connect_state'] == C['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + K['reconnect_count']), app['NetAgent']['connect2MJ'](K.url, Laya['Handler']['create'](K, K['_OnConnent'], null, !1), 'local' == K['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    K['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? C['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](C['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && C['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    K['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    K['prototype']['_fetch_gateway'] = function (K) {
                        var r = this;
                        if (C['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= C['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && C['Scene_MJ'].Inst['ForceOut'](), this['_setState'](C['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + K);
                        var X = function (X) {
                            var U = JSON['parse'](X);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + X), U['maintenance'])
                                r['_setState'](C['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && C['Scene_MJ'].Inst['ForceOut']();
                            else if (U['servers'] && U['servers']['length'] > 0) {
                                for (var i = U['servers'], N = C['Tools']['deal_gateway'](i), H = 0; H < N['length']; H++)
                                    r.urls.push({
                                        name: '___' + H,
                                        url: N[H]
                                    });
                                r['link_index'] = -1,
                                    r['_try_to_linknext']();
                            } else
                                1 > K ? Laya['timer'].once(1000, r, function () {
                                    r['_fetch_gateway'](K + 1);
                                }) : C['LobbyNetMgr'].Inst['polling_connect'] ? (r['lb_index']++, r['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](60)), r['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && C['Scene_MJ'].Inst['ForceOut'](), r['_setState'](C['EConnectState'].none));
                        },
                            U = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > K ? Laya['timer'].once(500, r, function () {
                                        r['_fetch_gateway'](K + 1);
                                    }) : C['LobbyNetMgr'].Inst['polling_connect'] ? (r['lb_index']++, r['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](58)), r['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || C['Scene_MJ'].Inst['ForceOut'](), r['_setState'](C['EConnectState'].none));
                            },
                            i = function (C) {
                                var K = new Laya['HttpRequest']();
                                K.once(Laya['Event']['COMPLETE'], r, function (C) {
                                    X(C);
                                }),
                                    K.once(Laya['Event']['ERROR'], r, function () {
                                        U();
                                    });
                                var i = [];
                                i.push('If-Modified-Since'),
                                    i.push('0'),
                                    C += '?service=ws-game-gateway',
                                    C += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    C += '&location=' + r['server_location'],
                                    C += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    K.send(C, '', 'get', 'text', i),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + C);
                            };
                        C['LobbyNetMgr'].Inst['polling_connect'] ? i(C['LobbyNetMgr'].Inst.urls[this['lb_index']]) : i(C['LobbyNetMgr'].Inst['lb_url']);
                    },
                    K['prototype']['_setState'] = function (K) {
                        this['connect_state'] = K,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (K == C['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : K == C['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : K == C['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : K == C['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : K == C['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    K['prototype']['_ConnectSuccess'] = function () {
                        var K = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (r, X) {
                                if (r || X['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', r, X), C['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](X)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        X['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(X),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(X));
                                            }
                                        });
                                    }
                                    // END
                                    var U = [],
                                        i = 0;
                                    view['DesktopMgr']['player_link_state'] = X['state_list'];
                                    var N = C['Tools']['strOfLocalization'](2003),
                                        H = X['game_config'].mode,
                                        w = view['ERuleMode']['Liqi4'];
                                    H.mode < 10 ? (w = view['ERuleMode']['Liqi4'], K['real_player_count'] = 4) : H.mode < 20 && (w = view['ERuleMode']['Liqi3'], K['real_player_count'] = 3);
                                    for (var G = 0; G < K['real_player_count']; G++)
                                        U.push(null);
                                    H['extendinfo'] && (N = C['Tools']['strOfLocalization'](2004)),
                                        H['detail_rule'] && H['detail_rule']['ai_level'] && (1 === H['detail_rule']['ai_level'] && (N = C['Tools']['strOfLocalization'](2003)), 2 === H['detail_rule']['ai_level'] && (N = C['Tools']['strOfLocalization'](2004)));
                                    for (var l = C['GameUtility']['get_default_ai_skin'](), R = C['GameUtility']['get_default_ai_character'](), G = 0; G < X['seat_list']['length']; G++) {
                                        var f = X['seat_list'][G];
                                        if (0 == f) {
                                            U[G] = {
                                                nickname: N,
                                                avatar_id: l,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: R,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: l,
                                                    is_upgraded: !1
                                                }
                                            };
                                            //随机化电脑皮肤
                                            if (MMP.settings.randomBotSkin == true) {
                                                let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                // 修复皮肤错误导致无法进入游戏的bug
                                                if (skin.id != 400000 && skin.id != 400001) {
                                                    U[G].avatar_id = skin.id;
                                                    U[G].character.charid = skin.character_id;
                                                    U[G].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                U[G].nickname = '[BOT]' + U[G].nickname;
                                            }
                                        } else {
                                            i++;
                                            for (var A = 0; A < X['players']['length']; A++)
                                                if (X['players'][A]['account_id'] == f) {
                                                    U[G] = X['players'][A];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (U[G].account_id == GameMgr.Inst.account_id) {
                                                        U[G].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        U[G].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        U[G].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        U[G].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        U[G].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            U[G].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (U[G].avatar_id == 400101 || U[G].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            U[G].avatar_id = skin.id;
                                                            U[G].character.charid = skin.character_id;
                                                            U[G].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(U[G].account_id);
                                                        if (server == 1) {
                                                            U[G].nickname = '[CN]' + U[G].nickname;
                                                        } else if (server == 2) {
                                                            U[G].nickname = '[JP]' + U[G].nickname;
                                                        } else if (server == 3) {
                                                            U[G].nickname = '[EN]' + U[G].nickname;
                                                        } else {
                                                            U[G].nickname = '[??]' + U[G].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var G = 0; G < K['real_player_count']; G++)
                                        null == U[G] && (U[G] = {
                                            account: 0,
                                            nickname: C['Tools']['strOfLocalization'](2010),
                                            avatar_id: l,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: R,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: l,
                                                is_upgraded: !1
                                            }
                                        });
                                    K['loaded_player_count'] = X['ready_id_list']['length'],
                                        K['_AuthSuccess'](U, X['is_game_start'], X['game_config']['toJSON']());
                                }
                            });
                    },
                    K['prototype']['_AuthSuccess'] = function (K, r, X) {
                        var U = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (K, r) {
                                    K || r['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', K, r), C['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](r)), r['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2011)), C['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](r['game_restore'])));
                                });
                        })) : C['Scene_MJ'].Inst['openMJRoom'](X, K, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](X)), K, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](U, function () {
                                r ? Laya['timer']['frameOnce'](10, U, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (K, r) {
                                            app.Log.log('syncGame ' + JSON['stringify'](r)),
                                                K || r['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', K, r), C['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), U['_PlayerReconnectSuccess'](r));
                                        });
                                }) : Laya['timer']['frameOnce'](10, U, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (K, r) {
                                            K || r['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', K, r), C['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), U['_EnterGame'](r), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (C) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * C);
                        }, null, !1));
                    },
                    K['prototype']['_EnterGame'] = function (K) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](K)),
                            K['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2011)), C['Scene_MJ'].Inst['GameEnd']()) : K['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](K['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    K['prototype']['_PlayerReconnectSuccess'] = function (K) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](K)),
                            K['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2011)), C['Scene_MJ'].Inst['GameEnd']()) : K['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](K['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](C['Tools']['strOfLocalization'](2012)), C['Scene_MJ'].Inst['ForceOut']());
                    },
                    K['prototype']['_SendDebugInfo'] = function () { },
                    K['prototype']['OpenConnectObserve'] = function (K, r) {
                        var X = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                X['server_location'] = r,
                                    X['ob_token'] = K,
                                    X['_setState'](C['EConnectState']['tryconnect']),
                                    X['lb_index'] = 0,
                                    X['_fetch_gateway'](0);
                            });
                    },
                    K['prototype']['_ConnectSuccessOb'] = function () {
                        var K = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (r, X) {
                                r || X['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', r, X), C['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](X)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (r, X) {
                                    if (r || X['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', r, X), C['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var U = X.head,
                                            i = U['game_config'].mode,
                                            N = [],
                                            H = C['Tools']['strOfLocalization'](2003),
                                            w = view['ERuleMode']['Liqi4'];
                                        i.mode < 10 ? (w = view['ERuleMode']['Liqi4'], K['real_player_count'] = 4) : i.mode < 20 && (w = view['ERuleMode']['Liqi3'], K['real_player_count'] = 3);
                                        for (var G = 0; G < K['real_player_count']; G++)
                                            N.push(null);
                                        i['extendinfo'] && (H = C['Tools']['strOfLocalization'](2004)),
                                            i['detail_rule'] && i['detail_rule']['ai_level'] && (1 === i['detail_rule']['ai_level'] && (H = C['Tools']['strOfLocalization'](2003)), 2 === i['detail_rule']['ai_level'] && (H = C['Tools']['strOfLocalization'](2004)));
                                        for (var l = C['GameUtility']['get_default_ai_skin'](), R = C['GameUtility']['get_default_ai_character'](), G = 0; G < U['seat_list']['length']; G++) {
                                            var f = U['seat_list'][G];
                                            if (0 == f)
                                                N[G] = {
                                                    nickname: H,
                                                    avatar_id: l,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: R,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: l,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var A = 0; A < U['players']['length']; A++)
                                                    if (U['players'][A]['account_id'] == f) {
                                                        N[G] = U['players'][A];
                                                        break;
                                                    }
                                        }
                                        for (var G = 0; G < K['real_player_count']; G++)
                                            null == N[G] && (N[G] = {
                                                account: 0,
                                                nickname: C['Tools']['strOfLocalization'](2010),
                                                avatar_id: l,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: R,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: l,
                                                    is_upgraded: !1
                                                }
                                            });
                                        K['_StartObSuccuess'](N, X['passed'], U['game_config']['toJSON'](), U['start_time']);
                                    }
                                }));
                            });
                    },
                    K['prototype']['_StartObSuccuess'] = function (K, r, X, U) {
                        var i = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](U, r);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), C['Scene_MJ'].Inst['openMJRoom'](X, K, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](X)), K, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](i, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, i, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](U, r);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (C) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * C);
                        }, null, !1)));
                    },
                    K['_Inst'] = null,
                    K;
            }
                ();
            C['MJNetMgr'] = K;
        }
            (game || (game = {}));








        // 读取战绩
        !function (C) {
            var K = function (K) {
                function r() {
                    var C = K.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return C['account_id'] = 0,
                        C['origin_x'] = 0,
                        C['origin_y'] = 0,
                        C.root = null,
                        C['title'] = null,
                        C['level'] = null,
                        C['btn_addfriend'] = null,
                        C['btn_report'] = null,
                        C['illust'] = null,
                        C.name = null,
                        C['detail_data'] = null,
                        C['achievement_data'] = null,
                        C['locking'] = !1,
                        C['tab_info4'] = null,
                        C['tab_info3'] = null,
                        C['tab_note'] = null,
                        C['tab_img_dark'] = '',
                        C['tab_img_chosen'] = '',
                        C['player_data'] = null,
                        C['tab_index'] = 1,
                        C['game_category'] = 1,
                        C['game_type'] = 1,
                        r.Inst = C,
                        C;
                }
                return __extends(r, K),
                    r['prototype']['onCreate'] = function () {
                        var K = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new C['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new C['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new C['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new C['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new C['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['btn_addfriend']['visible'] = !1,
                                    K['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: K['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                C['UI_Report_Nickname'].Inst.show(K['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || K['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['close']();
                            }, null, !1),
                            this.note = new C['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || 1 != K['tab_index'] && K['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || 2 != K['tab_index'] && K['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? C['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : K['container_info']['visible'] && (K['container_info']['visible'] = !1, K['tab_info4'].skin = K['tab_img_dark'], K['tab_info3'].skin = K['tab_img_dark'], K['tab_note'].skin = K['tab_img_chosen'], K['tab_index'] = 3, K.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    r['prototype'].show = function (K, r, X, U) {
                        var i = this;
                        void 0 === r && (r = 1),
                            void 0 === X && (X = 2),
                            void 0 === U && (U = 1),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = K,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            C['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                i['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: K
                            }, function (r, X) {
                                r || X['error'] ? C['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', r, X) : C['UI_Shilian']['now_season_info'] && 1001 == C['UI_Shilian']['now_season_info']['season_id'] && 3 != C['UI_Shilian']['get_cur_season_state']() ? (i['detail_data']['setData'](X), i['changeMJCategory'](i['tab_index'], i['game_category'], i['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: K
                                }, function (K, r) {
                                    K || r['error'] ? C['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', K, r) : (X['season_info'] = r['season_info'], i['detail_data']['setData'](X), i['changeMJCategory'](i['tab_index'], i['game_category'], i['game_type']));
                                });
                            }),
                            this.note['init_data'](K),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = K != GameMgr.Inst['account_id'],
                            this['tab_index'] = r,
                            this['game_category'] = X,
                            this['game_type'] = U,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    r['prototype']['refreshBaseInfo'] = function () {
                        var K = this;
                        this['title'].id = 0,
                            this['illust'].me['visible'] = !1,
                            game['Tools']['SetNickname'](this.name, {
                                account_id: 0,
                                nickname: '',
                                verified: 0
                            }),
                            this['btn_addfriend']['visible'] = !1,
                            this['btn_report'].x = 343,
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {
                                account_id: this['account_id']
                            }, function (r, X) {
                                if (r || X['error'])
                                    C['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', r, X);
                                else {
                                    var U = X['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (U.account_id == GameMgr.Inst.account_id) {
                                        U.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            U.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            U.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    K['player_data'] = U,
                                        game['Tools']['SetNickname'](K.name, U),
                                        K['title'].id = game['Tools']['titleLocalization'](U['account_id'], U['title']),
                                        K['level'].id = U['level'].id,
                                        K['level'].id = K['player_data'][1 == K['tab_index'] ? 'level' : 'level3'].id,
                                        K['level'].exp = K['player_data'][1 == K['tab_index'] ? 'level' : 'level3']['score'],
                                        K['illust'].me['visible'] = !0,
                                        K['account_id'] == GameMgr.Inst['account_id'] ? K['illust']['setSkin'](U['avatar_id'], 'waitingroom') : K['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](U['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], K['account_id']) && K['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(K['account_id']) ? (K['btn_addfriend']['visible'] = !0, K['btn_report'].x = 520) : (K['btn_addfriend']['visible'] = !1, K['btn_report'].x = 343),
                                        K.note.sign['setSign'](U['signature']),
                                        K['achievement_data'].show(!1, U['achievement_count']);
                                }
                            });
                    },
                    r['prototype']['changeMJCategory'] = function (C, K, r) {
                        void 0 === K && (K = 2),
                            void 0 === r && (r = 1),
                            this['tab_index'] = C,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](C, K, r),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    r['prototype']['close'] = function () {
                        var K = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), C['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            K['locking'] = !1,
                                K['enable'] = !1;
                        }))));
                    },
                    r['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                    },
                    r['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                            this['detail_data']['close'](),
                            this['illust']['clear'](),
                            Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                    },
                    r.Inst = null,
                    r;
            }
                (C['UIBase']);
            C['UI_OtherPlayerInfo'] = K;
        }
            (uiscript || (uiscript = {}));









        // 宿舍相关
        !function (C) {
            var K = function () {
                function K(K, X) {
                    var U = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = K,
                        this['container_illust'] = X,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = K['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            U['during_move'] = !0,
                                U['mouse_start_x'] = U['container_move']['mouseX'],
                                U['mouse_start_y'] = U['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            U['during_move'] && (U.move(U['container_move']['mouseX'] - U['mouse_start_x'], U['container_move']['mouseY'] - U['mouse_start_y']), U['mouse_start_x'] = U['container_move']['mouseX'], U['mouse_start_y'] = U['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            U['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            U['during_move'] = !1;
                        }),
                        this['btn_close'] = K['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            U['locking'] || U['close']();
                        }, null, !1),
                        this['scrollbar'] = K['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (C) {
                            U['_scale'] = 1 * (1 - C) + 0.5,
                                U['illust']['scaleX'] = U['_scale'],
                                U['illust']['scaleY'] = U['_scale'],
                                U['scrollbar']['setVal'](C, 0);
                        })),
                        this['dongtai_kaiguan'] = new C['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            r.Inst['illust']['resetSkin']();
                        }), new Laya['Handler'](this, function (C) {
                            r.Inst['illust']['playAnim'](C);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](K['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (C) {
                        this['_scale'] = C,
                            this['scrollbar']['setVal'](1 - (C - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    K['prototype'].show = function (K) {
                        var X = this;
                        this['locking'] = !0,
                            this['when_close'] = K,
                            this['illust_start_x'] = this['illust'].x,
                            this['illust_start_y'] = this['illust'].y,
                            this['illust_center_x'] = this['illust'].x + 984 - 446,
                            this['illust_center_y'] = this['illust'].y + 11 - 84,
                            this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                            this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                            this['container_illust']['getChildByName']('btn')['visible'] = !1,
                            r.Inst['stopsay'](),
                            this['scale'] = 1,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_center_x'],
                                y: this['illust_center_y']
                            }, 200),
                            C['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                X['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](r.Inst['illust']['skin_id']);
                    },
                    K['prototype']['close'] = function () {
                        var K = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            C['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                K['locking'] = !1,
                                    K.me['visible'] = !1,
                                    K['when_close'].run();
                            });
                    },
                    K['prototype'].move = function (C, K) {
                        var r = this['illust'].x + C,
                            X = this['illust'].y + K;
                        r < this['illust_center_x'] - 600 ? r = this['illust_center_x'] - 600 : r > this['illust_center_x'] + 600 && (r = this['illust_center_x'] + 600),
                            X < this['illust_center_y'] - 1200 ? X = this['illust_center_y'] - 1200 : X > this['illust_center_y'] + 800 && (X = this['illust_center_y'] + 800),
                            this['illust'].x = r,
                            this['illust'].y = X;
                    },
                    K;
            }
                (),
                r = function (r) {
                    function X() {
                        var C = r.call(this, new ui['lobby']['susheUI']()) || this;
                        return C['contianer_illust'] = null,
                            C['illust'] = null,
                            C['illust_rect'] = null,
                            C['container_name'] = null,
                            C['label_name'] = null,
                            C['label_cv'] = null,
                            C['label_cv_title'] = null,
                            C['container_page'] = null,
                            C['container_look_illust'] = null,
                            C['page_select_character'] = null,
                            C['page_visit_character'] = null,
                            C['origin_illust_x'] = 0,
                            C['chat_id'] = 0,
                            C['container_chat'] = null,
                            C['_select_index'] = 0,
                            C['sound_channel'] = null,
                            C['chat_block'] = null,
                            C['illust_showing'] = !0,
                            X.Inst = C,
                            C;
                    }
                    return __extends(X, r),
                        X['onMainSkinChange'] = function () {
                            var C = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            C && C['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](C.path) + '/spine');
                        },
                        X['randomDesktopID'] = function () {
                            var K = C['UI_Sushe']['commonViewList'][C['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), K)
                                for (var r = 0; r < K['length']; r++)
                                    K[r].slot == game['EView'].mjp ? this['now_mjp_id'] = K[r].type ? K[r]['item_id_list'][Math['floor'](Math['random']() * K[r]['item_id_list']['length'])] : K[r]['item_id'] : K[r].slot == game['EView']['desktop'] ? this['now_desktop_id'] = K[r].type ? K[r]['item_id_list'][Math['floor'](Math['random']() * K[r]['item_id_list']['length'])] : K[r]['item_id'] : K[r].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = K[r].type ? K[r]['item_id_list'][Math['floor'](Math['random']() * K[r]['item_id_list']['length'])] : K[r]['item_id']);
                        },
                        X.init = function (K) {
                            var r = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (U, i) {
                                if (U || i['error'])
                                    C['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', U, i);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](i)), i = JSON['parse'](JSON['stringify'](i)), i['main_character_id'] && i['characters']) {
                                        //if (r['characters'] = [], i['characters'])
                                        //    for (var N = 0; N < i['characters']['length']; N++)
                                        //        r['characters'].push(i['characters'][N]);
                                        //if (r['skin_map'] = {}, i['skins'])
                                        //    for (var N = 0; N < i['skins']['length']; N++)
                                        //        r['skin_map'][i['skins'][N]] = 1;
                                        //r['main_character_id'] = i['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = i.main_character_id;
                                        for (let count = 0; count < i.characters.length; count++) {
                                            if (i.characters[count].charid == i.main_character_id) {
                                                if (i.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = i.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = i.skins[count];
                                                fake_data.exp = i.characters[count].exp;
                                                fake_data.level = i.characters[count].level;
                                                fake_data.is_upgraded = i.characters[count].is_upgraded;
                                                break;
                                            }
                                        }
                                        r.characters = [];

                                        for (let count = 1; count <= cfg.item_definition.character['rows_'].length; count++) {
                                            let id = 200000 + count;
                                            let skin = 400001 + count * 100;
                                            let emoji = [];
                                            cfg.character.emoji.getGroup(id).forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            r.characters.push({
                                                charid: id,
                                                level: 5,
                                                exp: 0,
                                                skin: skin,
                                                is_upgraded: 1,
                                                extra_emoji: emoji
                                            });
                                        }
                                        let skins = cfg.item_definition.skin['rows_'];
                                        skins.forEach((element) => {
                                            uiscript.UI_Sushe.add_skin(element['id']);
                                        });
                                        for (let skinitem in MMP.settings.characters) {
                                            uiscript.UI_Sushe.characters[skinitem].skin = MMP.settings.characters[skinitem];
                                        }
                                        r.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        r.star_chars = MMP.settings.star_chars;
                                        i.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        r['characters'] = [], r['characters'].push({
                                            charid: '200001',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400101',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), r['characters'].push({
                                            charid: '200002',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400201',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), r['skin_map']['400101'] = 1, r['skin_map']['400201'] = 1, r['main_character_id'] = '200001';
                                    if (r['send_gift_count'] = 0, r['send_gift_limit'] = 0, i['send_gift_count'] && (r['send_gift_count'] = i['send_gift_count']), i['send_gift_limit'] && (r['send_gift_limit'] = i['send_gift_limit']), i['finished_endings'])
                                        for (var N = 0; N < i['finished_endings']['length']; N++)
                                            r['finished_endings_map'][i['finished_endings'][N]] = 1;
                                    if (i['rewarded_endings'])
                                        for (var N = 0; N < i['rewarded_endings']['length']; N++)
                                            r['rewarded_endings_map'][i['rewarded_endings'][N]] = 1;
                                    if (r['star_chars'] = [], i['character_sort'] && (r['star_chars'] = i['character_sort']), X['hidden_characters_map'] = {}, i['hidden_characters'])
                                        for (var H = 0, w = i['hidden_characters']; H < w['length']; H++) {
                                            var G = w[H];
                                            X['hidden_characters_map'][G] = 1;
                                        }
                                    K.run();
                                }
                            }),
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (K, X) {
                                //    if (K || X['error'])
                                //        C['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', K, X);
                                //    else {
                                //        r['using_commonview_index'] = X.use,
                                //        r['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //        var U = X['views'];
                                //        if (U)
                                //            for (var i = 0; i < U['length']; i++) {
                                //                var N = U[i]['values'];
                                //                N && (r['commonViewList'][U[i]['index']] = N);
                                //            }
                                //        r['randomDesktopID'](),
                                r.commonViewList = MMP.settings.commonViewList;
                            r.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view'](),
                                GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                            //    }
                            //});
                        },
                        X['on_data_updata'] = function (K) {
                            if (K['character']) {
                                var r = JSON['parse'](JSON['stringify'](K['character']));
                                if (r['characters'])
                                    for (var X = r['characters'], U = 0; U < X['length']; U++) {
                                        for (var i = !1, N = 0; N < this['characters']['length']; N++)
                                            if (this['characters'][N]['charid'] == X[U]['charid']) {
                                                this['characters'][N] = X[U],
                                                    C['UI_Sushe_Visit'].Inst && C['UI_Sushe_Visit'].Inst['chara_info'] && C['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][N]['charid'] && (C['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][N]),
                                                    i = !0;
                                                break;
                                            }
                                        i || this['characters'].push(X[U]);
                                    }
                                if (r['skins']) {
                                    for (var H = r['skins'], U = 0; U < H['length']; U++)
                                        this['skin_map'][H[U]] = 1;
                                    // START
                                    w['UI_Bag'].Inst['on_skin_change']();
                                    // END
                                }
                                if (r['finished_endings']) {
                                    for (var w = r['finished_endings'], U = 0; U < w['length']; U++)
                                        this['finished_endings_map'][w[U]] = 1;
                                    C['UI_Sushe_Visit'].Inst;
                                }
                                if (r['rewarded_endings']) {
                                    for (var w = r['rewarded_endings'], U = 0; U < w['length']; U++)
                                        this['rewarded_endings_map'][w[U]] = 1;
                                    C['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        X['chara_owned'] = function (C) {
                            for (var K = 0; K < this['characters']['length']; K++)
                                if (this['characters'][K]['charid'] == C)
                                    return !0;
                            return !1;
                        },
                        X['skin_owned'] = function (C) {
                            return this['skin_map']['hasOwnProperty'](C['toString']());
                        },
                        X['add_skin'] = function (C) {
                            this['skin_map'][C] = 1;
                        },
                        Object['defineProperty'](X, 'main_chara_info', {
                            get: function () {
                                for (var C = 0; C < this['characters']['length']; C++)
                                    if (this['characters'][C]['charid'] == this['main_character_id'])
                                        return this['characters'][C];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        X['on_view_remove'] = function (C) {
                            for (var K = 0; K < this['commonViewList']['length']; K++)
                                for (var r = this['commonViewList'][K], X = 0; X < r['length']; X++)
                                    if (r[X]['item_id'] == C && (r[X]['item_id'] = game['GameUtility']['get_view_default_item_id'](r[X].slot)), r[X]['item_id_list']) {
                                        for (var U = 0; U < r[X]['item_id_list']['length']; U++)
                                            if (r[X]['item_id_list'][U] == C) {
                                                r[X]['item_id_list']['splice'](U, 1);
                                                break;
                                            }
                                        0 == r[X]['item_id_list']['length'] && (r[X].type = 0);
                                    }
                            var i = cfg['item_definition'].item.get(C);
                            i.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == C && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        X['add_finish_ending'] = function (C) {
                            this['finished_endings_map'][C] = 1;
                        },
                        X['add_reward_ending'] = function (C) {
                            this['rewarded_endings_map'][C] = 1;
                        },
                        X['check_all_char_repoint'] = function () {
                            for (var C = 0; C < X['characters']['length']; C++)
                                if (this['check_char_redpoint'](X['characters'][C]))
                                    return !0;
                            return !1;
                        },
                        X['check_char_redpoint'] = function (C) {
                            // 去除小红点
                            //if (X['hidden_characters_map'][C['charid']])
                            return !1;
                            //END
                            var K = cfg.spot.spot['getGroup'](C['charid']);
                            if (K)
                                for (var r = 0; r < K['length']; r++) {
                                    var U = K[r];
                                    if (!(U['is_married'] && !C['is_upgraded'] || !U['is_married'] && C['level'] < U['level_limit']) && 2 == U.type) {
                                        for (var i = !0, N = 0; N < U['jieju']['length']; N++)
                                            if (U['jieju'][N] && X['finished_endings_map'][U['jieju'][N]]) {
                                                if (!X['rewarded_endings_map'][U['jieju'][N]])
                                                    return !0;
                                                i = !1;
                                            }
                                        if (i)
                                            return !0;
                                    }
                                }
                            var H = cfg['item_definition']['character'].get(C['charid']);
                            if (H.ur)
                                for (var w = cfg['level_definition']['character']['getGroup'](C['charid']), G = 1, l = 0, R = w; l < R['length']; l++) {
                                    var f = R[l];
                                    if (G > C['level'])
                                        return;
                                    if (f['reward'] && (!C['rewarded_level'] || -1 == C['rewarded_level']['indexOf'](G)))
                                        return !0;
                                    G++;
                                }
                            return !1;
                        },
                        X['is_char_star'] = function (C) {
                            return -1 != this['star_chars']['indexOf'](C);
                        },
                        X['change_char_star'] = function (C) {
                            var K = this['star_chars']['indexOf'](C);
                            -1 != K ? this['star_chars']['splice'](K, 1) : this['star_chars'].push(C);
                            // 屏蔽网络请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                            //    sort: this['star_chars']
                            //}, function () {});
                            // END
                        },
                        Object['defineProperty'](X['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        X['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        X['prototype']['onCreate'] = function () {
                            var r = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new C['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = C['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new C['UI_Character_Chat'](this['container_chat'], !0),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!r['page_visit_character'].me['visible'] || !r['page_visit_character']['cannot_click_say'])
                                        if (r['illust']['onClick'](), r['sound_channel'])
                                            r['stopsay']();
                                        else {
                                            if (!r['illust_showing'])
                                                return;
                                            r.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new C['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new C['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new K(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        X['prototype'].show = function (K) {
                            C['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var r = 0, U = 0; U < X['characters']['length']; U++)
                                if (X['characters'][U]['charid'] == X['main_character_id']) {
                                    r = U;
                                    break;
                                }
                            0 == K ? (this['change_select'](r), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        X['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](X['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        X['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(X['characters'][this['_select_index']], 2);
                        },
                        X['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                C['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        X['prototype']['close'] = function (K) {
                            var r = this;
                            this['illust_showing'] && C['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    r['enable'] = !1,
                                        K && K.run();
                                });
                        },
                        X['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        X['prototype']['hide_illust'] = function () {
                            var K = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, C['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                K['contianer_illust']['visible'] = !1;
                            })));
                        },
                        X['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, C['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var K = 0, r = 0; r < X['characters']['length']; r++)
                                        if (X['characters'][r]['charid'] == X['main_character_id']) {
                                            K = r;
                                            break;
                                        }
                                    this['change_select'](K);
                                }
                        },
                        X['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        X['prototype']['show_page_visit'] = function (C) {
                            void 0 === C && (C = 0),
                                this['page_visit_character'].show(X['characters'][this['_select_index']], C);
                        },
                        X['prototype']['change_select'] = function (K) {
                            this['_select_index'] = K,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var r = X['characters'][K],
                                U = cfg['item_definition']['character'].get(r['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != X['chs_fengyu_name_lst']['indexOf'](r['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != X['chs_fengyu_cv_lst']['indexOf'](r['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = U['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = U['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV';
                                var i = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : i.test(U['name_' + GameMgr['client_language']]) ? -15 : 0,
                                    this['label_cv']['leading'] = i.test(this['label_cv'].text) ? -7 : 0;
                            } else
                                this['label_name'].text = U['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + U['desc_cv_' + GameMgr['client_language']];
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var N = new C['UIRect']();
                            N.x = this['illust_rect'].x,
                                N.y = this['illust_rect'].y,
                                N['width'] = this['illust_rect']['width'],
                                N['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](N),
                                this['illust']['setSkin'](r.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                C['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var H = cfg['item_definition'].skin.get(r.skin);
                            H['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        X['prototype']['onChangeSkin'] = function (C) {
                            X['characters'][this['_select_index']].skin = C,
                                this['change_select'](this['_select_index']),
                                X['characters'][this['_select_index']]['charid'] == X['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = C, X['onMainSkinChange']());
                            // 屏蔽换肤请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                            //    character_id: X['characters'][this['_select_index']]['charid'],
                            //    skin: C
                            //}, function () {});
                            // 保存皮肤
                        },
                        X['prototype'].say = function (C) {
                            var K = this,
                                r = X['characters'][this['_select_index']];
                            this['chat_id']++;
                            var U = this['chat_id'],
                                i = view['AudioMgr']['PlayCharactorSound'](r, C, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, K, function () {
                                        U == K['chat_id'] && K['stopsay']();
                                    });
                                }));
                            i && (this['chat_block'].show(i['words']), this['sound_channel'] = i['sound']);
                        },
                        X['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                        },
                        X['prototype']['to_look_illust'] = function () {
                            var C = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                C['illust']['playAnim']('idle'),
                                    C['page_select_character'].show(0);
                            }));
                        },
                        X['prototype']['jump_to_char_skin'] = function (K, r) {
                            var U = this;
                            if (void 0 === K && (K = -1), void 0 === r && (r = null), K >= 0)
                                for (var i = 0; i < X['characters']['length']; i++)
                                    if (X['characters'][i]['charid'] == K) {
                                        this['change_select'](i);
                                        break;
                                    }
                            C['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                X.Inst['show_page_visit'](),
                                    U['page_visit_character']['show_pop_skin'](),
                                    U['page_visit_character']['set_jump_callback'](r);
                            }));
                        },
                        X['prototype']['jump_to_char_qiyue'] = function (K) {
                            var r = this;
                            if (void 0 === K && (K = -1), K >= 0)
                                for (var U = 0; U < X['characters']['length']; U++)
                                    if (X['characters'][U]['charid'] == K) {
                                        this['change_select'](U);
                                        break;
                                    }
                            C['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                X.Inst['show_page_visit'](),
                                    r['page_visit_character']['show_qiyue']();
                            }));
                        },
                        X['prototype']['jump_to_char_gift'] = function (K) {
                            var r = this;
                            if (void 0 === K && (K = -1), K >= 0)
                                for (var U = 0; U < X['characters']['length']; U++)
                                    if (X['characters'][U]['charid'] == K) {
                                        this['change_select'](U);
                                        break;
                                    }
                            C['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                X.Inst['show_page_visit'](),
                                    r['page_visit_character']['show_gift']();
                            }));
                        },
                        X['characters'] = [],
                        X['chs_fengyu_name_lst'] = ['200040', '200043'],
                        X['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        X['skin_map'] = {},
                        X['main_character_id'] = 0,
                        X['send_gift_count'] = 0,
                        X['send_gift_limit'] = 0,
                        X['commonViewList'] = [],
                        X['using_commonview_index'] = 0,
                        X['finished_endings_map'] = {},
                        X['rewarded_endings_map'] = {},
                        X['star_chars'] = [],
                        X['hidden_characters_map'] = {},
                        X.Inst = null,
                        X;
                }
                    (C['UIBase']);
            C['UI_Sushe'] = r;
        }
            (uiscript || (uiscript = {}));









        // 屏蔽改变宿舍角色的网络请求
        !function (C) {
            var K = function () {
                function K(K) {
                    var X = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = K,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            r.Inst['locking'] || r.Inst['close'](Laya['Handler']['create'](X, function () {
                                C['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            r.Inst['locking'] || r.Inst['close'](Laya['Handler']['create'](X, function () {
                                C['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            r.Inst['locking'] || C['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            r.Inst['locking'] || X['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new C['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            C['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return K['prototype'].show = function (K, r) {
                    if (void 0 === r && (r = !1), this.me['visible'] = !0, K ? this.me['alpha'] = 1 : C['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), r || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var X = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, X));
                    }
                },
                    K['prototype']['render_character_cell'] = function (K) {
                        var r = this,
                            X = K['index'],
                            U = K['container'],
                            i = K['cache_data'];
                        U['visible'] = !0,
                            i['index'] = X,
                            i['inited'] || (i['inited'] = !0, U['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                r['onClickAtHead'](i['index']);
                            }), i.skin = new C['UI_Character_Skin'](U['getChildByName']('btn')['getChildByName']('head')), i.bg = U['getChildByName']('btn')['getChildByName']('bg'), i['bound'] = U['getChildByName']('btn')['getChildByName']('bound'), i['btn_star'] = U['getChildByName']('btn_star'), i.star = U['getChildByName']('btn')['getChildByName']('star'), i['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                r['onClickAtStar'](i['index']);
                            }));
                        var N = U['getChildByName']('btn');
                        N['getChildByName']('choose')['visible'] = X == this['select_index'];
                        var H = this['getCharInfoByIndex'](X);
                        N['getChildByName']('redpoint')['visible'] = C['UI_Sushe']['check_char_redpoint'](H),
                            i.skin['setSkin'](H.skin, 'bighead'),
                            N['getChildByName']('using')['visible'] = H['charid'] == C['UI_Sushe']['main_character_id'],
                            U['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (H['is_upgraded'] ? '2.png' : '.png'));
                        var w = cfg['item_definition']['character'].get(H['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? i['bound'].skin = w.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (H['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (H['is_upgraded'] ? '2.png' : '.png')) : w.ur ? (i['bound'].pos(-10, -2), i['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (H['is_upgraded'] ? '6.png' : '5.png'))) : (i['bound'].pos(4, 20), i['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (H['is_upgraded'] ? '4.png' : '3.png'))),
                            i['btn_star']['visible'] = this['select_index'] == X,
                            i.star['visible'] = C['UI_Sushe']['is_char_star'](H['charid']) || this['select_index'] == X;
                        var G = cfg['item_definition']['character'].find(H['charid']),
                            l = N['getChildByName']('label_name'),
                            R = G['name_' + GameMgr['client_language'] + '2'] ? G['name_' + GameMgr['client_language'] + '2'] : G['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            i.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (C['UI_Sushe']['is_char_star'](H['charid']) ? 'l' : 'd') + (H['is_upgraded'] ? '1.png' : '.png')),
                                l.text = R['replace']('-', '|')['replace'](/\./g, '·');
                            var f = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            l['leading'] = f.test(R) ? -15 : 0;
                        } else
                            i.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (C['UI_Sushe']['is_char_star'](H['charid']) ? 'l.png' : 'd.png')), l.text = R;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == H['charid'] ? (l['scaleX'] = 0.67, l['scaleY'] = 0.57) : (l['scaleX'] = 0.7, l['scaleY'] = 0.6));
                    },
                    K['prototype']['onClickAtHead'] = function (K) {
                        if (this['select_index'] == K) {
                            var r = this['getCharInfoByIndex'](K);
                            if (r['charid'] != C['UI_Sushe']['main_character_id'])
                                if (C['UI_PiPeiYuYue'].Inst['enable'])
                                    C['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var X = C['UI_Sushe']['main_character_id'];
                                    C['UI_Sushe']['main_character_id'] = r['charid'],
                                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //    character_id: C['UI_Sushe']['main_character_id']
                                        //}, function () {}),
                                        GameMgr.Inst['account_data']['avatar_id'] = r.skin,
                                        C['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = r.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = r.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var U = 0; U < this['show_index_list']['length']; U++)
                                        this['getCharInfoByIndex'](U)['charid'] == X && this['scrollview']['wantToRefreshItem'](U);
                                    this['scrollview']['wantToRefreshItem'](K);
                                }
                        } else {
                            var i = this['select_index'];
                            this['select_index'] = K,
                                i >= 0 && this['scrollview']['wantToRefreshItem'](i),
                                this['scrollview']['wantToRefreshItem'](K),
                                C['UI_Sushe'].Inst['change_select'](this['show_index_list'][K]);
                        }
                    },
                    K['prototype']['onClickAtStar'] = function (K) {
                        if (C['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](K)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](K);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var r = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, r));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    K['prototype']['close'] = function (K) {
                        var r = this;
                        this.me['visible'] && (K ? this.me['visible'] = !1 : C['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            r.me['visible'] = !1;
                        })));
                    },
                    K['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var K = !1, r = 0, X = C['UI_Sushe']['star_chars']; r < X['length']; r++) {
                                var U = X[r];
                                if (!C['UI_Sushe']['hidden_characters_map'][U]) {
                                    K = !0;
                                    break;
                                }
                            }
                            if (!K)
                                return C['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        C['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var i = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](i),
                            Laya['Tween'].to(i, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    K['prototype']['getShowStarState'] = function () {
                        if (0 == C['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var K = 0, r = C['UI_Sushe']['star_chars']; K < r['length']; K++) {
                                var X = r[K];
                                if (!C['UI_Sushe']['hidden_characters_map'][X])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    K['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var K = 0, r = C['UI_Sushe']['star_chars']; K < r['length']; K++) {
                            var X = r[K];
                            if (!C['UI_Sushe']['hidden_characters_map'][X])
                                for (var U = 0; U < C['UI_Sushe']['characters']['length']; U++)
                                    if (C['UI_Sushe']['characters'][U]['charid'] == X) {
                                        U == C['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(U);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var U = 0; U < C['UI_Sushe']['characters']['length']; U++)
                                C['UI_Sushe']['hidden_characters_map'][C['UI_Sushe']['characters'][U]['charid']] || -1 == this['show_index_list']['indexOf'](U) && (U == C['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(U));
                    },
                    K['prototype']['getCharInfoByIndex'] = function (K) {
                        return C['UI_Sushe']['characters'][this['show_index_list'][K]];
                    },
                    K;
            }
                (),
                r = function (r) {
                    function X() {
                        var C = r.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return C['bg_width_head'] = 962,
                            C['bg_width_zhuangban'] = 1819,
                            C['bg2_delta'] = -29,
                            C['container_top'] = null,
                            C['locking'] = !1,
                            C.tabs = [],
                            C['tab_index'] = 0,
                            X.Inst = C,
                            C;
                    }
                    return __extends(X, r),
                        X['prototype']['onCreate'] = function () {
                            var r = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    r['locking'] || (1 == r['tab_index'] && r['container_zhuangban']['changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](r, function () {
                                        r['close'](),
                                            C['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (r['close'](), C['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var X = this.root['getChildByName']('container_tabs'), U = function (K) {
                                i.tabs.push(X['getChildAt'](K)),
                                    i.tabs[K]['clickHandler'] = new Laya['Handler'](i, function () {
                                        r['locking'] || r['tab_index'] != K && (1 == r['tab_index'] && r['container_zhuangban']['changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](r, function () {
                                            r['change_tab'](K);
                                        }), null) : r['change_tab'](K));
                                    });
                            }, i = this, N = 0; N < X['numChildren']; N++)
                                U(N);
                            this['container_head'] = new K(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new C['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return r['locking'];
                                }));
                        },
                        X['prototype'].show = function (K) {
                            var r = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = K,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), C['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), C['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), C['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), C['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    r['locking'] = !1;
                                });
                            for (var X = 0; X < this.tabs['length']; X++) {
                                var U = this.tabs[X];
                                U.skin = game['Tools']['localUISrc'](X == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var i = U['getChildByName']('word');
                                i['color'] = X == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    i['scaleX'] = i['scaleY'] = X == this['tab_index'] ? 1.1 : 1,
                                    X == this['tab_index'] && U['parent']['setChildIndex'](U, this.tabs['length'] - 1);
                            }
                        },
                        X['prototype']['change_tab'] = function (K) {
                            var r = this;
                            this['tab_index'] = K;
                            for (var X = 0; X < this.tabs['length']; X++) {
                                var U = this.tabs[X];
                                U.skin = game['Tools']['localUISrc'](X == K ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var i = U['getChildByName']('word');
                                i['color'] = X == K ? '#552c1c' : '#d3a86c',
                                    i['scaleX'] = i['scaleY'] = X == K ? 1.1 : 1,
                                    X == K && U['parent']['setChildIndex'](U, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    C['UI_Sushe'].Inst['open_illust'](),
                                        r['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), C['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    r['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function () {
                                    r['locking'] = !1;
                                });
                        },
                        X['prototype']['close'] = function (K) {
                            var r = this;
                            this['locking'] = !0,
                                C['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? C['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    r['container_head']['close'](!0);
                                })) : C['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    r['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    r['locking'] = !1,
                                        r['enable'] = !1,
                                        K && K.run();
                                });
                        },
                        X['prototype']['onDisable'] = function () {
                            for (var K = 0; K < C['UI_Sushe']['characters']['length']; K++) {
                                var r = C['UI_Sushe']['characters'][K].skin,
                                    X = cfg['item_definition'].skin.get(r);
                                X && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](X.path + '/bighead.png'));
                            }
                        },
                        X['prototype']['changeKaiguanShow'] = function (C) {
                            C ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        X['prototype']['changeZhuangbanSlot'] = function (C) {
                            this['container_zhuangban']['changeSlotByItemId'](C);
                        },
                        X;
                }
                    (C['UIBase']);
            C['UI_Sushe_Select'] = r;
        }
            (uiscript || (uiscript = {}));







        // 友人房
        !function (C) {
            var K = function () {
                function K(C) {
                    var K = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = C,
                        this.me['visible'] = !1,
                        this['blackbg'] = C['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            K['locking'] || K['close']();
                        }, null, !1),
                        this.root = C['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return K['prototype'].show = function () {
                    var K = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var r = game['FriendMgr']['friend_list'], X = 0; X < r['length']; X++)
                        this['sortlist'].push(X);
                    this['sortlist'] = this['sortlist'].sort(function (C, K) {
                        var X = r[C],
                            U = 0;
                        if (X['state']['is_online']) {
                            var i = game['Tools']['playState2Desc'](X['state']['playing']);
                            U += '' != i ? 30000000000 : 60000000000,
                                X.base['level'] && (U += X.base['level'].id % 1000 * 10000000),
                                X.base['level3'] && (U += X.base['level3'].id % 1000 * 10000),
                                U += -Math['floor'](X['state']['login_time'] / 10000000);
                        } else
                            U += X['state']['logout_time'];
                        var N = r[K],
                            H = 0;
                        if (N['state']['is_online']) {
                            var i = game['Tools']['playState2Desc'](N['state']['playing']);
                            H += '' != i ? 30000000000 : 60000000000,
                                N.base['level'] && (H += N.base['level'].id % 1000 * 10000000),
                                N.base['level3'] && (H += N.base['level3'].id % 1000 * 10000),
                                H += -Math['floor'](N['state']['login_time'] / 10000000);
                        } else
                            H += N['state']['logout_time'];
                        return H - U;
                    });
                    for (var X = 0; X < r['length']; X++)
                        this['friends'].push({
                            f: r[X],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        C['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            K['locking'] = !1;
                        }));
                },
                    K['prototype']['close'] = function () {
                        var K = this;
                        this['locking'] = !0,
                            C['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                K['locking'] = !1,
                                    K.me['visible'] = !1;
                            }));
                    },
                    K['prototype']['render_item'] = function (K) {
                        var r = K['index'],
                            X = K['container'],
                            i = K['cache_data'];
                        i.head || (i.head = new C['UI_Head'](X['getChildByName']('head'), 'UI_WaitingRoom'), i.name = X['getChildByName']('name'), i['state'] = X['getChildByName']('label_state'), i.btn = X['getChildByName']('btn_invite'), i['invited'] = X['getChildByName']('invited'));
                        var N = this['friends'][this['sortlist'][r]];
                        i.head.id = game['GameUtility']['get_limited_skin_id'](N.f.base['avatar_id']),
                            i.head['set_head_frame'](N.f.base['account_id'], N.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](i.name, N.f.base);
                        var H = !1;
                        if (N.f['state']['is_online']) {
                            var w = game['Tools']['playState2Desc'](N.f['state']['playing']);
                            '' != w ? (i['state'].text = game['Tools']['strOfLocalization'](2069, [w]), i['state']['color'] = '#a9d94d', i.name['getChildByName']('name')['color'] = '#a9d94d') : (i['state'].text = game['Tools']['strOfLocalization'](2071), i['state']['color'] = '#58c4db', i.name['getChildByName']('name')['color'] = '#58c4db', H = !0);
                        } else
                            i['state'].text = game['Tools']['strOfLocalization'](2072), i['state']['color'] = '#8c8c8c', i.name['getChildByName']('name')['color'] = '#8c8c8c';
                        N['invited'] ? (i.btn['visible'] = !1, i['invited']['visible'] = !0) : (i.btn['visible'] = !0, i['invited']['visible'] = !1, game['Tools']['setGrayDisable'](i.btn, !H), H && (i.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](i.btn, !0);
                            var K = {
                                room_id: U.Inst['room_id'],
                                mode: U.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: N.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](K)
                            }, function (K, r) {
                                K || r['error'] ? (game['Tools']['setGrayDisable'](i.btn, !1), C['UIMgr'].Inst['showNetReqError']('sendClientMessage', K, r)) : (i.btn['visible'] = !1, i['invited']['visible'] = !0, N['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    K;
            }
                (),
                r = function () {
                    function K(K) {
                        var r = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = K,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new C['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new C['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return r['locking'];
                            }));
                        for (var X = this.root['getChildByName']('container_tabs'), U = function (K) {
                            i.tabs.push(X['getChildAt'](K)),
                                i.tabs[K]['clickHandler'] = new Laya['Handler'](i, function () {
                                    r['locking'] || r['tab_index'] != K && (1 == r['tab_index'] && r['page_zhangban']['changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](r, function () {
                                        r['change_tab'](K);
                                    }), null) : r['change_tab'](K));
                                });
                        }, i = this, N = 0; N < X['numChildren']; N++)
                            U(N);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            r['locking'] || (1 == r['tab_index'] && r['page_zhangban']['changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](r, function () {
                                r['close'](!1);
                            }), null) : r['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                r['locking'] || (1 == r['tab_index'] && r['page_zhangban']['changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](r, function () {
                                    r['close'](!1);
                                }), null) : r['close'](!1));
                            });
                    }
                    return K['prototype'].show = function () {
                        var K = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            C['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                K['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var r = 0; r < this.tabs['length']; r++) {
                            var X = this.tabs[r];
                            X.skin = game['Tools']['localUISrc'](r == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var U = X['getChildByName']('word');
                            U['color'] = r == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                U['scaleX'] = U['scaleY'] = r == this['tab_index'] ? 1.1 : 1,
                                r == this['tab_index'] && X['parent']['setChildIndex'](X, this.tabs['length'] - 1);
                        }
                    },
                        K['prototype']['change_tab'] = function (C) {
                            var K = this;
                            this['tab_index'] = C;
                            for (var r = 0; r < this.tabs['length']; r++) {
                                var X = this.tabs[r];
                                X.skin = game['Tools']['localUISrc'](r == C ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var U = X['getChildByName']('word');
                                U['color'] = r == C ? '#552c1c' : '#d3a86c',
                                    U['scaleX'] = U['scaleY'] = r == C ? 1.1 : 1,
                                    r == C && X['parent']['setChildIndex'](X, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    K['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    K['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    K['locking'] = !1;
                                });
                        },
                        K['prototype']['close'] = function (K) {
                            var r = this;
                            //修改友人房间立绘
                            if (!(r.page_head.choosed_chara_index == 0 && r.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = r.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = r.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = r.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[r.page_head.choosed_chara_index] = r.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (K ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: U.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), C['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                r['locking'] = !1,
                                    r.me['visible'] = !1;
                            }))));
                        },
                        K;
                }
                    (),
                X = function () {
                    function C(C) {
                        this['modes'] = [],
                            this.me = C,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return C['prototype'].show = function (C) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = C,
                            this['scrollview']['addItem'](C['length']);
                        var K = this['scrollview']['total_height'];
                        K > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - K, this.bg['height'] = K + 20),
                            this.bg['visible'] = !0;
                    },
                        C['prototype']['render_item'] = function (C) {
                            var K = C['index'],
                                r = C['container'],
                                X = r['getChildByName']('info');
                            X['fontSize'] = 40,
                                X['fontSize'] = this['modes'][K]['length'] <= 5 ? 40 : this['modes'][K]['length'] <= 9 ? 55 - 3 * this['modes'][K]['length'] : 28,
                                X.text = this['modes'][K];
                        },
                        C;
                }
                    (),
                U = function (U) {
                    function i() {
                        var K = U.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return K['skin_ready'] = 'myres/room/btn_ready.png',
                            K['skin_cancel'] = 'myres/room/btn_cancel.png',
                            K['skin_start'] = 'myres/room/btn_start.png',
                            K['skin_start_no'] = 'myres/room/btn_start_no.png',
                            K['update_seq'] = 0,
                            K['pre_msgs'] = [],
                            K['msg_tail'] = -1,
                            K['posted'] = !1,
                            K['label_rommid'] = null,
                            K['player_cells'] = [],
                            K['btn_ok'] = null,
                            K['btn_invite_friend'] = null,
                            K['btn_add_robot'] = null,
                            K['btn_dress'] = null,
                            K['btn_copy'] = null,
                            K['beReady'] = !1,
                            K['room_id'] = -1,
                            K['owner_id'] = -1,
                            K['tournament_id'] = 0,
                            K['max_player_count'] = 0,
                            K['players'] = [],
                            K['container_rules'] = null,
                            K['container_top'] = null,
                            K['container_right'] = null,
                            K['locking'] = !1,
                            K['mousein_copy'] = !1,
                            K['popout'] = null,
                            K['room_link'] = null,
                            K['btn_copy_link'] = null,
                            K['last_start_room'] = 0,
                            K['invitefriend'] = null,
                            K['pre_choose'] = null,
                            K['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            i.Inst = K,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](K, function (C) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](C)),
                                    K['onReadyChange'](C['account_id'], C['ready'], C['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](K, function (C) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](C)),
                                    K['onPlayerChange'](C);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](K, function (C) {
                                K['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](C)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), K['onGameStart'](C));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](K, function (C) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](C)),
                                    K['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](K, function () {
                                K['enable'] && K.hide(Laya['Handler']['create'](K, function () {
                                    C['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            K;
                    }
                    return __extends(i, U),
                        i['prototype']['push_msg'] = function (C) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](C)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](C));
                        },
                        Object['defineProperty'](i['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](i['prototype'], 'robot_count', {
                            get: function () {
                                for (var C = 0, K = 0; K < this['players']['length']; K++)
                                    2 == this['players'][K]['category'] && C++;
                                return C;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        i['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        i['prototype']['updateData'] = function (C) {
                            if (!C)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < C.persons.length; i++) {

                                if (C.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    C.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    C.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    C.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    C.persons[i].title = GameMgr.Inst.account_data.title;
                                    C.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        C.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = C['room_id'],
                                this['owner_id'] = C['owner_id'],
                                this['room_mode'] = C.mode,
                                this['public_live'] = C['public_live'],
                                this['tournament_id'] = 0,
                                C['tournament_id'] && (this['tournament_id'] = C['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = C['max_player_count'],
                                this['players'] = [];
                            for (var K = 0; K < C['persons']['length']; K++) {
                                var r = C['persons'][K];
                                r['ready'] = !1,
                                    r['cell_index'] = -1,
                                    r['category'] = 1,
                                    this['players'].push(r);
                            }
                            for (var K = 0; K < C['robot_count']; K++)
                                this['players'].push({
                                    category: 2,
                                    cell_index: -1,
                                    account_id: 0,
                                    level: {
                                        id: '10101',
                                        score: 0
                                    },
                                    level3: {
                                        id: '20101',
                                        score: 0
                                    },
                                    nickname: this['ai_name'],
                                    verified: 0,
                                    ready: !0,
                                    dressing: !1,
                                    title: 0,
                                    avatar_id: game['GameUtility']['get_default_ai_skin']()
                                });
                            for (var K = 0; K < C['ready_list']['length']; K++)
                                for (var X = 0; X < this['players']['length']; X++)
                                    if (this['players'][X]['account_id'] == C['ready_list'][K]) {
                                        this['players'][X]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                C.seq && (this['update_seq'] = C.seq);
                        },
                        i['prototype']['onReadyChange'] = function (C, K, r) {
                            for (var X = 0; X < this['players']['length']; X++)
                                if (this['players'][X]['account_id'] == C) {
                                    this['players'][X]['ready'] = K,
                                        this['players'][X]['dressing'] = r,
                                        this['_onPlayerReadyChange'](this['players'][X]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        i['prototype']['onPlayerChange'] = function (C) {
                            if (app.Log.log(C), C = C['toJSON'](), !(C.seq && C.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < C.player_list.length; i++) {

                                    if (C.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        C.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        C.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        C.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            C.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (C.update_list != undefined) {
                                    for (var i = 0; i < C.update_list.length; i++) {

                                        if (C.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            C.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            C.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            C.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                C.update_list[i].nickname = MMP.settings.nickname;
                                            }
                                            break;
                                        }
                                    }
                                }
                                for (var i = 0; i < this.players.length; i++) {
                                    if (this.players[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        this.players[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        this.players[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        this.players[i].title = GameMgr.Inst.account_data.title;
                                        this.players[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        if (MMP.settings.nickname != '') {
                                            this.players[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                // END
                                this['update_seq'] = C.seq;
                                var K = {};
                                K.type = 'onPlayerChange0',
                                    K['players'] = this['players'],
                                    K.msg = C,
                                    this['push_msg'](JSON['stringify'](K));
                                var r = this['robot_count'],
                                    X = C['robot_count'];
                                if (X < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, r--);
                                    for (var U = 0; U < this['players']['length']; U++)
                                        2 == this['players'][U]['category'] && r > X && (this['players'][U]['category'] = 0, r--);
                                }
                                for (var i = [], N = C['player_list'], U = 0; U < this['players']['length']; U++)
                                    if (1 == this['players'][U]['category']) {
                                        for (var H = -1, w = 0; w < N['length']; w++)
                                            if (N[w]['account_id'] == this['players'][U]['account_id']) {
                                                H = w;
                                                break;
                                            }
                                        if (-1 != H) {
                                            var G = N[H];
                                            i.push(this['players'][U]),
                                                this['players'][U]['avatar_id'] = G['avatar_id'],
                                                this['players'][U]['title'] = G['title'],
                                                this['players'][U]['verified'] = G['verified'];
                                        }
                                    } else
                                        2 == this['players'][U]['category'] && i.push(this['players'][U]);
                                this['players'] = i;
                                for (var U = 0; U < N['length']; U++) {
                                    for (var l = !1, G = N[U], w = 0; w < this['players']['length']; w++)
                                        if (1 == this['players'][w]['category'] && this['players'][w]['account_id'] == G['account_id']) {
                                            l = !0;
                                            break;
                                        }
                                    l || this['players'].push({
                                        account_id: G['account_id'],
                                        avatar_id: G['avatar_id'],
                                        nickname: G['nickname'],
                                        verified: G['verified'],
                                        title: G['title'],
                                        level: G['level'],
                                        level3: G['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var R = [!1, !1, !1, !1], U = 0; U < this['players']['length']; U++)
                                    - 1 != this['players'][U]['cell_index'] && (R[this['players'][U]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][U]));
                                for (var U = 0; U < this['players']['length']; U++)
                                    if (1 == this['players'][U]['category'] && -1 == this['players'][U]['cell_index'])
                                        for (var w = 0; w < this['max_player_count']; w++)
                                            if (!R[w]) {
                                                this['players'][U]['cell_index'] = w,
                                                    R[w] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][U]);
                                                break;
                                            }
                                for (var r = this['robot_count'], X = C['robot_count']; X > r;) {
                                    for (var f = -1, w = 0; w < this['max_player_count']; w++)
                                        if (!R[w]) {
                                            f = w;
                                            break;
                                        }
                                    if (-1 == f)
                                        break;
                                    R[f] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: f,
                                            account_id: 0,
                                            level: {
                                                id: '10101',
                                                score: 0
                                            },
                                            level3: {
                                                id: '20101',
                                                score: 0
                                            },
                                            nickname: this['ai_name'],
                                            verified: 0,
                                            ready: !0,
                                            title: 0,
                                            avatar_id: game['GameUtility']['get_default_ai_skin'](),
                                            dressing: !1
                                        }),
                                        this['_refreshPlayerInfo'](this['players'][this['players']['length'] - 1]),
                                        r++;
                                }
                                for (var U = 0; U < this['max_player_count']; U++)
                                    R[U] || this['_clearCell'](U);
                                var K = {};
                                if (K.type = 'onPlayerChange1', K['players'] = this['players'], this['push_msg'](JSON['stringify'](K)), C['owner_id']) {
                                    if (this['owner_id'] = C['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var w = 0; w < this['players']['length']; w++)
                                                if (this['players'][w] && this['players'][w]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][w]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var w = 0; w < this['players']['length']; w++)
                                            if (this['players'][w] && this['players'][w]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][w]);
                                                break;
                                            }
                            }
                        },
                        i['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), C['UI_Lobby'].Inst['enable'] = !0, C['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        i['prototype']['onCreate'] = function () {
                            var U = this;
                            this['last_start_room'] = 0;
                            var i = this.me['getChildByName']('root');
                            this['container_top'] = i['getChildByName']('top'),
                                this['container_right'] = i['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var N = function (K) {
                                var r = i['getChildByName']('player_' + K['toString']()),
                                    X = {};
                                X['index'] = K,
                                    X['container'] = r,
                                    X['container_flag'] = r['getChildByName']('flag'),
                                    X['container_flag']['visible'] = !1,
                                    X['container_name'] = r['getChildByName']('container_name'),
                                    X.name = r['getChildByName']('container_name')['getChildByName']('name'),
                                    X['btn_t'] = r['getChildByName']('btn_t'),
                                    X['container_illust'] = r['getChildByName']('container_illust'),
                                    X['illust'] = new C['UI_Character_Skin'](r['getChildByName']('container_illust')['getChildByName']('illust')),
                                    X.host = r['getChildByName']('host'),
                                    X['title'] = new C['UI_PlayerTitle'](r['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    X.rank = new C['UI_Level'](r['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    X['is_robot'] = !1;
                                var N = 0;
                                X['btn_t']['clickHandler'] = Laya['Handler']['create'](H, function () {
                                    if (!(U['locking'] || Laya['timer']['currTimer'] < N)) {
                                        N = Laya['timer']['currTimer'] + 500;
                                        for (var C = 0; C < U['players']['length']; C++)
                                            if (U['players'][C]['cell_index'] == K) {
                                                U['kickPlayer'](C);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    X['btn_info'] = r['getChildByName']('btn_info'),
                                    X['btn_info']['clickHandler'] = Laya['Handler']['create'](H, function () {
                                        if (!U['locking'])
                                            for (var r = 0; r < U['players']['length']; r++)
                                                if (U['players'][r]['cell_index'] == K) {
                                                    U['players'][r]['account_id'] && U['players'][r]['account_id'] > 0 && C['UI_OtherPlayerInfo'].Inst.show(U['players'][r]['account_id'], U['room_mode'].mode < 10 ? 1 : 2, 1);
                                                    break;
                                                }
                                    }, null, !1),
                                    H['player_cells'].push(X);
                            }, H = this, w = 0; 4 > w; w++)
                                N(w);
                            this['btn_ok'] = i['getChildByName']('btn_ok');
                            var G = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < G + 500 || (G = Laya['timer']['currTimer'], U['owner_id'] == GameMgr.Inst['account_id'] ? U['getStart']() : U['switchReady']());
                            }, null, !1);
                            var l = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < l + 500 || (l = Laya['timer']['currTimer'], U['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    U['locking'] || U['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var R = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                U['locking'] || Laya['timer']['currTimer'] < R || (R = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: U['robot_count'] + 1
                                }, function (K, r) {
                                    (K || r['error'] && 1111 != r['error'].code) && C['UIMgr'].Inst['showNetReqError']('modifyRoom_add', K, r),
                                        R = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!U['locking']) {
                                        var K = 0;
                                        U['room_mode']['detail_rule'] && U['room_mode']['detail_rule']['chuanma'] && (K = 1),
                                            C['UI_Rules'].Inst.show(0, null, K);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    U['locking'] || U['beReady'] && U['owner_id'] != GameMgr.Inst['account_id'] || (U['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: U['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    U['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    U['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    U['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), U['popout']['visible'] = !0, C['UIBase']['anim_pop_out'](U['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new X(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var K = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    K.call('setSysClipboardText', U['room_link'].text),
                                        C['UIBase']['anim_pop_hide'](U['popout'], Laya['Handler']['create'](U, function () {
                                            U['popout']['visible'] = !1;
                                        })),
                                        C['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', U['room_link'].text, function () { }),
                                        C['UIBase']['anim_pop_hide'](U['popout'], Laya['Handler']['create'](U, function () {
                                            U['popout']['visible'] = !1;
                                        })),
                                        C['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    C['UIBase']['anim_pop_hide'](U['popout'], Laya['Handler']['create'](U, function () {
                                        U['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new K(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new r(this.me['getChildByName']('pop_view'));
                        },
                        i['prototype'].show = function () {
                            var K = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var r = 0; 4 > r; r++)
                                this['player_cells'][r]['container']['visible'] = r < this['max_player_count'];
                            for (var r = 0; r < this['max_player_count']; r++)
                                this['_clearCell'](r);
                            for (var r = 0; r < this['players']['length']; r++)
                                this['players'][r]['cell_index'] = r, this['_refreshPlayerInfo'](this['players'][r]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var X = {};
                            X.type = 'show',
                                X['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](X)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var U = [];
                            U.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var i = this['room_mode']['detail_rule'];
                            if (i) {
                                var N = 5,
                                    H = 20;
                                if (null != i['time_fixed'] && (N = i['time_fixed']), null != i['time_add'] && (H = i['time_add']), U.push(N['toString']() + '+' + H['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var w = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    w && U.push(w.name);
                                }
                                if (null != i['init_point'] && U.push(game['Tools']['strOfLocalization'](2199) + i['init_point']), null != i['fandian'] && U.push(game['Tools']['strOfLocalization'](2094) + ':' + i['fandian']), i['guyi_mode'] && U.push(game['Tools']['strOfLocalization'](3028)), null != i['dora_count'])
                                    switch (i['chuanma'] && (i['dora_count'] = 0), i['dora_count']) {
                                        case 0:
                                            U.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            U.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            U.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            U.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != i['shiduan'] && 1 != i['shiduan'] && U.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === i['fanfu'] && U.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === i['fanfu'] && U.push(game['Tools']['strOfLocalization'](2764)),
                                    null != i['bianjietishi'] && 1 != i['bianjietishi'] && U.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != i['have_zimosun'] && 1 != i['have_zimosun'] ? U.push(game['Tools']['strOfLocalization'](2202)) : U.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(U),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                C['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var r = 0; r < this['player_cells']['length']; r++)
                                C['UIBase']['anim_alpha_in'](this['player_cells'][r]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * r, null, Laya.Ease['backOut']);
                            C['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                C['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    K['locking'] = !1;
                                });
                            var G = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != G && (this['room_link'].text += '(' + G + ')');
                            var l = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + l + '?room=' + this['room_id'];
                        },
                        i['prototype']['leaveRoom'] = function () {
                            var K = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (r, X) {
                                r || X['error'] ? C['UIMgr'].Inst['showNetReqError']('leaveRoom', r, X) : (K['room_id'] = -1, K.hide(Laya['Handler']['create'](K, function () {
                                    C['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        i['prototype']['tryToClose'] = function (K) {
                            var r = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (X, U) {
                                X || U['error'] ? (C['UIMgr'].Inst['showNetReqError']('leaveRoom', X, U), K['runWith'](!1)) : (r['enable'] = !1, r['pop_change_view']['close'](!0), K['runWith'](!0));
                            });
                        },
                        i['prototype'].hide = function (K) {
                            var r = this;
                            this['locking'] = !0,
                                C['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var X = 0; X < this['player_cells']['length']; X++)
                                C['UIBase']['anim_alpha_out'](this['player_cells'][X]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            C['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                C['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    r['locking'] = !1,
                                        r['enable'] = !1,
                                        K && K.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        i['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var C = 0; C < this['player_cells']['length']; C++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][C]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        i['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        i['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (K, r) {
                                (K || r['error']) && C['UIMgr'].Inst['showNetReqError']('startRoom', K, r);
                            })));
                        },
                        i['prototype']['kickPlayer'] = function (K) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var r = this['players'][K];
                                1 == r['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][K]['account_id']
                                }, function () { }) : 2 == r['category'] && (this['pre_choose'] = r, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (K, r) {
                                    (K || r['error']) && C['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', K, r);
                                }));
                            }
                        },
                        i['prototype']['_clearCell'] = function (C) {
                            if (!(0 > C || C >= this['player_cells']['length'])) {
                                var K = this['player_cells'][C];
                                K['container_flag']['visible'] = !1,
                                    K['container_illust']['visible'] = !1,
                                    K.name['visible'] = !1,
                                    K['container_name']['visible'] = !1,
                                    K['btn_t']['visible'] = !1,
                                    K.host['visible'] = !1,
                                    K['illust']['clear']();
                            }
                        },
                        i['prototype']['_refreshPlayerInfo'] = function (C) {
                            var K = C['cell_index'];
                            if (!(0 > K || K >= this['player_cells']['length'])) {
                                var r = this['player_cells'][K];
                                r['container_illust']['visible'] = !0,
                                    r['container_name']['visible'] = !0,
                                    r.name['visible'] = !0,
                                    game['Tools']['SetNickname'](r.name, C),
                                    r['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && C['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == C['account_id'] && (r['container_flag']['visible'] = !0, r.host['visible'] = !0),
                                    C['account_id'] == GameMgr.Inst['account_id'] ? r['illust']['setSkin'](C['avatar_id'], 'waitingroom') : r['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](C['avatar_id']), 'waitingroom'),
                                    r['title'].id = game['Tools']['titleLocalization'](C['account_id'], C['title']),
                                    r.rank.id = C[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](C);
                            }
                        },
                        i['prototype']['_onPlayerReadyChange'] = function (C) {
                            var K = C['cell_index'];
                            if (!(0 > K || K >= this['player_cells']['length'])) {
                                var r = this['player_cells'][K];
                                r['container_flag']['visible'] = this['owner_id'] == C['account_id'] ? !0 : C['ready'];
                            }
                        },
                        i['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var C = 0, K = 0; K < this['players']['length']; K++)
                                    0 != this['players'][K]['category'] && (this['_refreshPlayerInfo'](this['players'][K]), C++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], C == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], C == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        i['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var C = 0, K = 0; K < this['players']['length']; K++) {
                                    var r = this['players'][K];
                                    if (!r || 0 == r['category'])
                                        break;
                                    (r['account_id'] == this['owner_id'] || r['ready']) && C++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], C != this['max_player_count']), this['enable']) {
                                    for (var X = 0, K = 0; K < this['max_player_count']; K++) {
                                        var U = this['player_cells'][K];
                                        U && U['container_flag']['visible'] && X++;
                                    }
                                    if (C != X && !this['posted']) {
                                        this['posted'] = !0;
                                        var i = {};
                                        i['okcount'] = C,
                                            i['okcount2'] = X,
                                            i.msgs = [];
                                        var N = 0,
                                            H = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (N = (this['msg_tail'] + 1) % this['pre_msgs']['length'], H = this['msg_tail']), N >= 0 && H >= 0) {
                                            for (var K = N; K != H; K = (K + 1) % this['pre_msgs']['length'])
                                                i.msgs.push(this['pre_msgs'][K]);
                                            i.msgs.push(this['pre_msgs'][H]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', i, !1);
                                    }
                                }
                            }
                        },
                        i['prototype']['onGameStart'] = function (C) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](C['connect_token'], C['game_uuid'], C['location'], !1, null);
                        },
                        i['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        i['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        i.Inst = null,
                        i;
                }
                    (C['UIBase']);
            C['UI_WaitingRoom'] = U;
        }
            (uiscript || (uiscript = {}));








        // 保存装扮
        !function (C) {
            var K;
            !function (K) {
                var r = function () {
                    function r(r, X, U) {
                        var i = this;
                        this['page_items'] = null,
                            this['page_headframe'] = null,
                            this['page_desktop'] = null,
                            this['page_bgm'] = null,
                            this.tabs = [],
                            this['tab_index'] = -1,
                            this['select_index'] = -1,
                            this['cell_titles'] = [2193, 2194, 2195, 1901, 2214, 2624, 2856, 2412, 2413, 3917, 2826],
                            this['cell_names'] = [411, 412, 413, 417, 414, 415, 416, 0, 0, 0],
                            this['cell_default_img'] = ['myres/sushe/slot_liqibang.jpg', 'myres/sushe/slot_hule.jpg', 'myres/sushe/slot_liqi.jpg', 'myres/sushe/slot_mpzs.jpg', 'myres/sushe/slot_hand.jpg', 'myres/sushe/slot_liqibgm.jpg', 'myres/sushe/slot_head_frame.jpg', '', '', '', ''],
                            this['cell_default_item'] = [0, 0, 0, 0, 0, 0, '305501', '305044', '305045', '305725', '307001'],
                            this['slot_ids'] = [0, 1, 2, 10, 3, 4, 5, 6, 7, 13, 8],
                            this['slot_map'] = {},
                            this['_changed'] = !1,
                            this['_locking'] = null,
                            this['_locking'] = U,
                            this['container_zhuangban0'] = r,
                            this['container_zhuangban1'] = X;
                        var N = this['container_zhuangban0']['getChildByName']('tabs');
                        N['vScrollBarSkin'] = '';
                        for (var H = function (K) {
                            var r = N['getChildAt'](K);
                            w.tabs.push(r),
                                r['clickHandler'] = new Laya['Handler'](w, function () {
                                    i['locking'] || i['tab_index'] != K && (i['_changed'] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](i, function () {
                                        i['change_tab'](K);
                                    }), null) : i['change_tab'](K));
                                });
                        }, w = this, G = 0; G < N['numChildren']; G++)
                            H(G);
                        this['page_items'] = new K['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new K['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new K['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new K['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var K = [], r = 0; r < i['cell_titles']['length']; r++) {
                                    var X = i['slot_ids'][r];
                                    if (i['slot_map'][X]) {
                                        var U = i['slot_map'][X];
                                        if (!(U['item_id'] && U['item_id'] != i['cell_default_item'][r] || U['item_id_list'] && 0 != U['item_id_list']['length']))
                                            continue;
                                        var N = [];
                                        if (U['item_id_list'])
                                            for (var H = 0, w = U['item_id_list']; H < w['length']; H++) {
                                                var G = w[H];
                                                G == i['cell_default_item'][r] ? N.push(0) : N.push(G);
                                            }
                                        K.push({
                                            slot: X,
                                            item_id: U['item_id'],
                                            type: U.type,
                                            item_id_list: N
                                        });
                                    }
                                }
                                i['btn_save']['mouseEnabled'] = !1;
                                var l = i['tab_index'];
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: K,
                                //    save_index: l,
                                //    is_use: l == C['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (r, X) {
                                //    if (i['btn_save']['mouseEnabled'] = !0, r || X['error'])
                                //        C['UIMgr'].Inst['showNetReqError']('saveCommonViews', r, X);
                                //    else {
                                if (C['UI_Sushe']['commonViewList']['length'] < l)
                                    for (var U = C['UI_Sushe']['commonViewList']['length']; l >= U; U++)
                                        C['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = C.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = C.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (C['UI_Sushe']['commonViewList'][l] = K, C['UI_Sushe']['using_commonview_index'] == l && i['onChangeGameView'](), i['tab_index'] != l)
                                    return;
                                i['btn_save']['mouseEnabled'] = !0,
                                    i['_changed'] = !1,
                                    i['refresh_btn']();
                                //    }
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                i['btn_use']['mouseEnabled'] = !1;
                                var K = i['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: K
                                //}, function (r, X) {
                                //    i['btn_use']['mouseEnabled'] = !0,
                                //    r || X['error'] ? C['UIMgr'].Inst['showNetReqError']('useCommonView', r, X) : (
                                C['UI_Sushe']['using_commonview_index'] = K, i['refresh_btn'](), i['refresh_tab'](), i['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                i['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](r['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object['defineProperty'](r['prototype'], 'changed', {
                            get: function () {
                                return this['_changed'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        r['prototype'].show = function (K) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                K ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (C['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), C['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](C['UI_Sushe']['using_commonview_index']);
                        },
                        r['prototype']['change_tab'] = function (K) {
                            if (this['tab_index'] = K, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < C['UI_Sushe']['commonViewList']['length'])
                                    for (var r = C['UI_Sushe']['commonViewList'][this['tab_index']], X = 0; X < r['length']; X++)
                                        this['slot_map'][r[X].slot] = {
                                            slot: r[X].slot,
                                            item_id: r[X]['item_id'],
                                            type: r[X].type,
                                            item_id_list: r[X]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        r['prototype']['refresh_tab'] = function () {
                            for (var K = 0; K < this.tabs['length']; K++) {
                                var r = this.tabs[K];
                                r['mouseEnabled'] = this['tab_index'] != K,
                                    r['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == K ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    r['getChildByName']('num')['color'] = this['tab_index'] == K ? '#2f1e19' : '#f2c797';
                                var X = r['getChildByName']('choosed');
                                C['UI_Sushe']['using_commonview_index'] == K ? (X['visible'] = !0, X.x = this['tab_index'] == K ? -18 : -4) : X['visible'] = !1;
                            }
                        },
                        r['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = C['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = C['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        r['prototype']['onChangeSlotSelect'] = function (C) {
                            var K = this;
                            this['select_index'] = C,
                                this['random']['visible'] = !(6 == C || 10 == C);
                            var r = 0;
                            C >= 0 && C < this['cell_default_item']['length'] && (r = this['cell_default_item'][C]);
                            var X = r,
                                U = this['slot_ids'][C],
                                i = !1,
                                N = [];
                            if (this['slot_map'][U]) {
                                var H = this['slot_map'][U];
                                N = H['item_id_list'],
                                    i = !!H.type,
                                    H['item_id'] && (X = this['slot_map'][U]['item_id']),
                                    i && H['item_id_list'] && H['item_id_list']['length'] > 0 && (X = H['item_id_list'][0]);
                            }
                            var w = Laya['Handler']['create'](this, function (X) {
                                if (X == r && (X = 0), K['is_random']) {
                                    var i = K['slot_map'][U]['item_id_list']['indexOf'](X);
                                    i >= 0 ? K['slot_map'][U]['item_id_list']['splice'](i, 1) : (K['slot_map'][U]['item_id_list'] && 0 != K['slot_map'][U]['item_id_list']['length'] || (K['slot_map'][U]['item_id_list'] = []), K['slot_map'][U]['item_id_list'].push(X));
                                } else
                                    K['slot_map'][U] || (K['slot_map'][U] = {}), K['slot_map'][U]['item_id'] = X;
                                K['scrollview']['wantToRefreshItem'](C),
                                    K['_changed'] = !0,
                                    K['refresh_btn']();
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = i,
                                this['random_slider'].x = i ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var G = game['Tools']['strOfLocalization'](this['cell_titles'][C]);
                            if (C >= 0 && 2 >= C)
                                this['page_items'].show(G, C, X, w), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == C)
                                this['page_items'].show(G, 10, X, w), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == C)
                                this['page_items'].show(G, 3, X, w), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == C)
                                this['page_bgm'].show(G, X, w), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == C)
                                this['page_headframe'].show(G, X, w);
                            else if (7 == C || 8 == C) {
                                var l = this['cell_default_item'][7],
                                    R = this['cell_default_item'][8];
                                if (7 == C) {
                                    if (l = X, this['slot_map'][game['EView'].mjp]) {
                                        var f = this['slot_map'][game['EView'].mjp];
                                        f.type && f['item_id_list'] && f['item_id_list']['length'] > 0 ? R = f['item_id_list'][0] : f['item_id'] && (R = f['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](G, l, R, w);
                                } else {
                                    if (R = X, this['slot_map'][game['EView']['desktop']]) {
                                        var f = this['slot_map'][game['EView']['desktop']];
                                        f.type && f['item_id_list'] && f['item_id_list']['length'] > 0 ? l = f['item_id_list'][0] : f['item_id'] && (l = f['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](G, l, R, w);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == C) {
                                var l = this['cell_default_item'][7],
                                    R = this['cell_default_item'][9];
                                if (R = X, this['slot_map'][game['EView']['desktop']]) {
                                    var f = this['slot_map'][game['EView']['desktop']];
                                    f.type && f['item_id_list'] && f['item_id_list']['length'] > 0 ? l = f['item_id_list'][0] : f['item_id'] && (l = f['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](G, l, R, w),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == C && this['page_desktop']['show_lobby_bg'](G, X, w);
                        },
                        r['prototype']['onRandomBtnClick'] = function () {
                            var C = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        C['random']['getChildAt'](C['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var K = this['select_index'],
                                    r = this['slot_ids'][K],
                                    X = 0;
                                K >= 0 && K < this['cell_default_item']['length'] && (X = this['cell_default_item'][K]);
                                var U = X,
                                    i = [];
                                if (this['slot_map'][r]) {
                                    var N = this['slot_map'][r];
                                    i = N['item_id_list'],
                                        N['item_id'] && (U = this['slot_map'][r]['item_id']);
                                }
                                if (K >= 0 && 4 >= K) {
                                    var H = this['slot_map'][r];
                                    H ? (H.type = H.type ? 0 : 1, H['item_id_list'] && 0 != H['item_id_list']['length'] || (H['item_id_list'] = [H['item_id']])) : this['slot_map'][r] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](U);
                                } else if (5 == K) {
                                    var H = this['slot_map'][r];
                                    if (H)
                                        H.type = H.type ? 0 : 1, H['item_id_list'] && 0 != H['item_id_list']['length'] || (H['item_id_list'] = [H['item_id']]);
                                    else {
                                        this['slot_map'][r] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](U);
                                } else if (7 == K || 8 == K || 9 == K) {
                                    var H = this['slot_map'][r];
                                    H ? (H.type = H.type ? 0 : 1, H['item_id_list'] && 0 != H['item_id_list']['length'] || (H['item_id_list'] = [H['item_id']])) : this['slot_map'][r] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](U);
                                }
                                this['scrollview']['wantToRefreshItem'](K);
                            }
                        },
                        r['prototype']['render_view'] = function (C) {
                            var K = this,
                                r = C['container'],
                                X = C['index'],
                                U = r['getChildByName']('cell');
                            this['select_index'] == X ? (U['scaleX'] = U['scaleY'] = 1.05, U['getChildByName']('choosed')['visible'] = !0) : (U['scaleX'] = U['scaleY'] = 1, U['getChildByName']('choosed')['visible'] = !1),
                                U['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][X]);
                            var i = U['getChildByName']('name'),
                                N = U['getChildByName']('icon'),
                                H = this['cell_default_item'][X],
                                w = this['slot_ids'][X],
                                G = !1;
                            if (this['slot_map'][w] && (G = this['slot_map'][w].type, this['slot_map'][w]['item_id'] && (H = this['slot_map'][w]['item_id'])), G)
                                i.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][w]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](N, 'myres/sushe/icon_random.jpg');
                            else {
                                var l = cfg['item_definition'].item.get(H);
                                l ? (i.text = l['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](N, l.icon, null, 'UI_Sushe_Select.Zhuangban')) : (i.text = game['Tools']['strOfLocalization'](this['cell_names'][X]), game['LoadMgr']['setImgSkin'](N, this['cell_default_img'][X], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var R = U['getChildByName']('btn');
                            R['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || K['select_index'] != X && (K['onChangeSlotSelect'](X), K['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                R['mouseEnabled'] = this['select_index'] != X;
                        },
                        r['prototype']['close'] = function (K) {
                            var r = this;
                            this['container_zhuangban0']['visible'] && (K ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (C['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), C['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                r['page_items']['close'](),
                                    r['page_desktop']['close'](),
                                    r['page_headframe']['close'](),
                                    r['page_bgm']['close'](),
                                    r['container_zhuangban0']['visible'] = !1,
                                    r['container_zhuangban1']['visible'] = !1,
                                    game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                            }))));
                        },
                        r['prototype']['onChangeGameView'] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = C.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            C['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var K = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            C['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](K, Laya['Handler']['create'](this, function () {
                                    C['UI_Lite_Loading'].Inst['enable'] && C['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        r['prototype']['setRandomGray'] = function (K) {
                            this['btn_random']['visible'] = !K,
                                this['random']['filters'] = K ? [new Laya['ColorFilter'](C['GRAY_FILTER'])] : [];
                        },
                        r['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        r['prototype']['changeSlotByItemId'] = function (C) {
                            var K = cfg['item_definition'].item.get(C);
                            if (K)
                                for (var r = 0; r < this['slot_ids']['length']; r++)
                                    if (this['slot_ids'][r] == K.type)
                                        return this['onChangeSlotSelect'](r), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        r;
                }
                    ();
                K['Container_Zhuangban'] = r;
            }
                (K = C['zhuangban'] || (C['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));








        // 设置称号
        !function (C) {
            var K = function (K) {
                function r() {
                    var C = K.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return C['_root'] = null,
                        C['_scrollview'] = null,
                        C['_blackmask'] = null,
                        C['_locking'] = !1,
                        C['_showindexs'] = [],
                        r.Inst = C,
                        C;
                }
                return __extends(r, K),
                    r.Init = function () {
                        var K = this;
                        // 获取称号
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (r, X) {
                        //    if (r || X['error'])
                        //        C['UIMgr'].Inst['showNetReqError']('fetchTitleList', r, X);
                        //    else {
                        K['owned_title'] = [];
                        //        for (var U = 0; U < X['title_list']['length']; U++) {
                        for (let title of cfg.item_definition.title.rows_) {
                            var i = title.id;
                            cfg['item_definition']['title'].get(i) && K['owned_title'].push(i),
                                '600005' == i && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                i >= '600005' && '600015' >= i && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + i - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    r['title_update'] = function (K) {
                        for (var r = 0; r < K['new_titles']['length']; r++)
                            cfg['item_definition']['title'].get(K['new_titles'][r]) && this['owned_title'].push(K['new_titles'][r]), '600005' == K['new_titles'][r] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), K['new_titles'][r] >= '600005' && K['new_titles'][r] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + K['new_titles'][r] - '600005', 1);
                        if (K['remove_titles'] && K['remove_titles']['length'] > 0) {
                            for (var r = 0; r < K['remove_titles']['length']; r++) {
                                for (var X = K['remove_titles'][r], U = 0; U < this['owned_title']['length']; U++)
                                    if (this['owned_title'][U] == X) {
                                        this['owned_title'][U] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                X == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', C['UI_Lobby'].Inst['enable'] && C['UI_Lobby'].Inst.top['refresh'](), C['UI_PlayerInfo'].Inst['enable'] && C['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    r['prototype']['onCreate'] = function () {
                        var K = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new C['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return K['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (C) {
                                K['setItemValue'](C['index'], C['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['_locking'] || (K['_blackmask'].hide(), K['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    r['prototype'].show = function () {
                        var K = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), r['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var X = 0; X < r['owned_title']['length']; X++)
                                this['_showindexs'].push(X);
                            this['_showindexs'] = this['_showindexs'].sort(function (C, K) {
                                var X = C,
                                    U = cfg['item_definition']['title'].get(r['owned_title'][C]);
                                U && (X += 1000 * U['priority']);
                                var i = K,
                                    N = cfg['item_definition']['title'].get(r['owned_title'][K]);
                                return N && (i += 1000 * N['priority']),
                                    i - X;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](r['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        C['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            K['_locking'] = !1;
                        }));
                    },
                    r['prototype']['close'] = function () {
                        var K = this;
                        this['_locking'] = !0,
                            C['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                K['_locking'] = !1,
                                    K['enable'] = !1;
                            }));
                    },
                    r['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    r['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    r['prototype']['setItemValue'] = function (C, K) {
                        var X = this;
                        if (this['enable']) {
                            var U = r['owned_title'][this['_showindexs'][C]],
                                i = cfg['item_definition']['title'].find(U);
                            game['LoadMgr']['setImgSkin'](K['getChildByName']('img_title'), i.icon, null, 'UI_TitleBook'),
                                K['getChildByName']('using')['visible'] = U == GameMgr.Inst['account_data']['title'],
                                K['getChildByName']('desc').text = i['desc_' + GameMgr['client_language']];
                            var N = K['getChildByName']('btn');
                            N['clickHandler'] = Laya['Handler']['create'](this, function () {
                                U != GameMgr.Inst['account_data']['title'] ? (X['changeTitle'](C), K['getChildByName']('using')['visible'] = !0) : (X['changeTitle'](-1), K['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var H = K['getChildByName']('time'),
                                w = K['getChildByName']('img_title');
                            if (1 == i['unlock_type']) {
                                var G = i['unlock_param'][0],
                                    l = cfg['item_definition'].item.get(G);
                                H.text = game['Tools']['strOfLocalization'](3121) + l['expire_desc_' + GameMgr['client_language']],
                                    H['visible'] = !0,
                                    w.y = 0;
                            } else
                                H['visible'] = !1, w.y = 10;
                        }
                    },
                    r['prototype']['changeTitle'] = function (K) {
                        var X = this,
                            U = GameMgr.Inst['account_data']['title'],
                            i = 0;
                        i = K >= 0 && K < this['_showindexs']['length'] ? r['owned_title'][this['_showindexs'][K]] : '600001',
                            GameMgr.Inst['account_data']['title'] = i;
                        for (var N = -1, H = 0; H < this['_showindexs']['length']; H++)
                            if (U == r['owned_title'][this['_showindexs'][H]]) {
                                N = H;
                                break;
                            }
                        C['UI_Lobby'].Inst['enable'] && C['UI_Lobby'].Inst.top['refresh'](),
                            C['UI_PlayerInfo'].Inst['enable'] && C['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            -1 != N && this['_scrollview']['wantToRefreshItem'](N),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = i;
                        MMP.saveSettings();
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                        //    title: '600001' == i ? 0 : i
                        //}, function (r, i) {
                        //    (r || i['error']) && (C['UIMgr'].Inst['showNetReqError']('useTitle', r, i), GameMgr.Inst['account_data']['title'] = U, C['UI_Lobby'].Inst['enable'] && C['UI_Lobby'].Inst.top['refresh'](), C['UI_PlayerInfo'].Inst['enable'] && C['UI_PlayerInfo'].Inst['refreshBaseInfo'](), X['enable'] && (K >= 0 && K < X['_showindexs']['length'] && X['_scrollview']['wantToRefreshItem'](K), N >= 0 && N < X['_showindexs']['length'] && X['_scrollview']['wantToRefreshItem'](N)));
                        //});
                    },
                    r.Inst = null,
                    r['owned_title'] = [],
                    r;
            }
                (C['UIBase']);
            C['UI_TitleBook'] = K;
        }
            (uiscript || (uiscript = {}));







        // 友人房调整装扮
        !function (C) {
            var K;
            !function (K) {
                var r = function () {
                    function r(C) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = C,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new K['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return r['prototype'].show = function (K) {
                        var r = this;
                        this.me['visible'] = !0,
                            K ? this.me['alpha'] = 1 : C['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var X = 0, U = C['UI_Sushe']['star_chars']; X < U['length']; X++)
                            for (var i = U[X], N = 0; N < C['UI_Sushe']['characters']['length']; N++)
                                if (!C['UI_Sushe']['hidden_characters_map'][i] && C['UI_Sushe']['characters'][N]['charid'] == i) {
                                    this['chara_infos'].push({
                                        chara_id: C['UI_Sushe']['characters'][N]['charid'],
                                        skin_id: C['UI_Sushe']['characters'][N].skin,
                                        is_upgraded: C['UI_Sushe']['characters'][N]['is_upgraded']
                                    }),
                                        C['UI_Sushe']['main_character_id'] == C['UI_Sushe']['characters'][N]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var N = 0; N < C['UI_Sushe']['characters']['length']; N++)
                            C['UI_Sushe']['hidden_characters_map'][C['UI_Sushe']['characters'][N]['charid']] || -1 == C['UI_Sushe']['star_chars']['indexOf'](C['UI_Sushe']['characters'][N]['charid']) && (this['chara_infos'].push({
                                chara_id: C['UI_Sushe']['characters'][N]['charid'],
                                skin_id: C['UI_Sushe']['characters'][N].skin,
                                is_upgraded: C['UI_Sushe']['characters'][N]['is_upgraded']
                            }), C['UI_Sushe']['main_character_id'] == C['UI_Sushe']['characters'][N]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var H = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(H['chara_id'], H['skin_id'], Laya['Handler']['create'](this, function (C) {
                            r['choosed_skin_id'] = C,
                                H['skin_id'] = C,
                                r['scrollview']['wantToRefreshItem'](r['choosed_chara_index']);
                        }, null, !1));
                    },
                        r['prototype']['render_character_cell'] = function (K) {
                            var r = this,
                                X = K['index'],
                                U = K['container'],
                                i = K['cache_data'];
                            i['index'] = X;
                            var N = this['chara_infos'][X];
                            i['inited'] || (i['inited'] = !0, i.skin = new C['UI_Character_Skin'](U['getChildByName']('btn')['getChildByName']('head')), i['bound'] = U['getChildByName']('btn')['getChildByName']('bound'));
                            var H = U['getChildByName']('btn');
                            H['getChildByName']('choose')['visible'] = X == this['choosed_chara_index'],
                                i.skin['setSkin'](N['skin_id'], 'bighead'),
                                H['getChildByName']('using')['visible'] = X == this['choosed_chara_index'];
                            var w = cfg['item_definition']['character'].find(N['chara_id']),
                                G = w['name_' + GameMgr['client_language'] + '2'] ? w['name_' + GameMgr['client_language'] + '2'] : w['name_' + GameMgr['client_language']],
                                l = H['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                l.text = G['replace']('-', '|')['replace'](/\./g, '·');
                                var R = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                l['leading'] = R.test(G) ? -15 : 0;
                            } else
                                l.text = G;
                            H['getChildByName']('star') && (H['getChildByName']('star')['visible'] = X < this['star_char_count']);
                            var f = cfg['item_definition']['character'].get(N['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? i['bound'].skin = f.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (N['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (N['is_upgraded'] ? '2.png' : '.png')) : f.ur ? (i['bound'].pos(-10, -2), i['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (N['is_upgraded'] ? '6.png' : '5.png'))) : (i['bound'].pos(4, 20), i['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (N['is_upgraded'] ? '4.png' : '3.png'))),
                                H['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (N['is_upgraded'] ? '2.png' : '.png')),
                                U['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (X != r['choosed_chara_index']) {
                                        var C = r['choosed_chara_index'];
                                        r['choosed_chara_index'] = X,
                                            r['choosed_skin_id'] = N['skin_id'],
                                            r['page_skin'].show(N['chara_id'], N['skin_id'], Laya['Handler']['create'](r, function (C) {
                                                r['choosed_skin_id'] = C,
                                                    N['skin_id'] = C,
                                                    i.skin['setSkin'](C, 'bighead');
                                            }, null, !1)),
                                            r['scrollview']['wantToRefreshItem'](C),
                                            r['scrollview']['wantToRefreshItem'](X);
                                    }
                                });
                        },
                        r['prototype']['close'] = function (K) {
                            var r = this;
                            if (this.me['visible'])
                                if (K)
                                    this.me['visible'] = !1;
                                else {
                                    var X = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //X['chara_id'] != C['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: X['chara_id']
                                    //    }, function () {}), 
                                    C['UI_Sushe']['main_character_id'] = X['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: X['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var U = 0; U < C['UI_Sushe']['characters']['length']; U++)
                                        if (C['UI_Sushe']['characters'][U]['charid'] == X['chara_id']) {
                                            C['UI_Sushe']['characters'][U].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        C['UI_Sushe']['onMainSkinChange'](),
                                        C['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            r.me['visible'] = !1;
                                        }));
                                }
                        },
                        r;
                }
                    ();
                K['Page_Waiting_Head'] = r;
            }
                (K = C['zhuangban'] || (C['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));








        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var C = GameMgr;
            var K = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (r, X) {
                if (r || X['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', r, X);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](X)),
                        C.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    X.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    X.account.title = GameMgr.Inst.account_data.title;
                    X.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        X.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var U in X['account']) {
                        if (C.Inst['account_data'][U] = X['account'][U], 'platform_diamond' == U)
                            for (var i = X['account'][U], N = 0; N < i['length']; N++)
                                K['account_numerical_resource'][i[N].id] = i[N]['count'];
                        if ('skin_ticket' == U && (C.Inst['account_numerical_resource']['100004'] = X['account'][U]), 'platform_skin_ticket' == U)
                            for (var i = X['account'][U], N = 0; N < i['length']; N++)
                                K['account_numerical_resource'][i[N].id] = i[N]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        X['account']['room_id'] && C.Inst['updateRoom'](),
                        '10102' === C.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === C.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }






        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (K, r, X) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': K,
                        'account_id': parseInt(r.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': K,
                            'account_id': parseInt(r.toString())
                        }));
                    }
                }));
            }
            var C = GameMgr;
            var U = this;
            return K = K.trim(),
                app.Log.log('checkPaiPu game_uuid:' + K + ' account_id:' + r['toString']() + ' paipu_config:' + X),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), C.Inst['onLoadStart']('paipu'), 2 & X && (K = game['Tools']['DecodePaipuUUID'](K)), this['record_uuid'] = K, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: K,
                    client_version_string: this['getClientVersion']()
                }, function (C, i) {
                    if (C || i['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', C, i);
                        var N = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](N);
                        var H = function () {
                            return N += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, N)),
                                N >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, H), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, U, H),
                            U['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': i.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': i.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var w = i.head,
                            G = [null, null, null, null],
                            l = game['Tools']['strOfLocalization'](2003),
                            R = w['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: K,
                            client_version_string: U['getClientVersion']()
                        }, function () { }),
                            R['extendinfo'] && (l = game['Tools']['strOfLocalization'](2004)),
                            R['detail_rule'] && R['detail_rule']['ai_level'] && (1 === R['detail_rule']['ai_level'] && (l = game['Tools']['strOfLocalization'](2003)), 2 === R['detail_rule']['ai_level'] && (l = game['Tools']['strOfLocalization'](2004)));
                        var f = !1;
                        w['end_time'] ? (U['record_end_time'] = w['end_time'], w['end_time'] > '1576112400' && (f = !0)) : U['record_end_time'] = -1,
                            U['record_start_time'] = w['start_time'] ? w['start_time'] : -1;
                        for (var A = 0; A < w['accounts']['length']; A++) {
                            var h = w['accounts'][A];
                            if (h['character']) {
                                var J = h['character'],
                                    c = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (h.account_id == GameMgr.Inst.account_id) {
                                        h.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        h.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        h.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        h.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        h.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            h.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (h.avatar_id == 400101 || h.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            h.avatar_id = skin.id;
                                            h.character.charid = skin.character_id;
                                            h.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(h.account_id);
                                        if (server == 1) {
                                            h.nickname = '[CN]' + h.nickname;
                                        } else if (server == 2) {
                                            h.nickname = '[JP]' + h.nickname;
                                        } else if (server == 3) {
                                            h.nickname = '[EN]' + h.nickname;
                                        } else {
                                            h.nickname = '[??]' + h.nickname;
                                        }
                                    }
                                }
                                // END
                                if (f) {
                                    var W = h['views'];
                                    if (W)
                                        for (var x = 0; x < W['length']; x++)
                                            c[W[x].slot] = W[x]['item_id'];
                                } else {
                                    var y = J['views'];
                                    if (y)
                                        for (var x = 0; x < y['length']; x++) {
                                            var n = y[x].slot,
                                                k = y[x]['item_id'],
                                                B = n - 1;
                                            c[B] = k;
                                        }
                                }
                                var D = [];
                                for (var Z in c)
                                    D.push({
                                        slot: parseInt(Z),
                                        item_id: c[Z]
                                    });
                                h['views'] = D,
                                    G[h.seat] = h;
                            } else
                                h['character'] = {
                                    charid: h['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(h['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    h['avatar_id'] = h['character'].skin,
                                    h['views'] = [],
                                    G[h.seat] = h;
                        }
                        for (var L = game['GameUtility']['get_default_ai_skin'](), v = game['GameUtility']['get_default_ai_character'](), A = 0; A < G['length']; A++)
                            if (null == G[A]) {
                                G[A] = {
                                    nickname: l,
                                    avatar_id: L,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: v,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: L,
                                        is_upgraded: !1
                                    }
                                };
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (MMP.settings.randomBotSkin == true) {
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            G[A].avatar_id = skin.id;
                                            G[A].character.charid = skin.character_id;
                                            G[A].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        G[A].nickname = '[BOT]' + G[A].nickname;
                                    }
                                }
                                // END
                            }
                        var b = Laya['Handler']['create'](U, function (C) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](w['config'], G, Laya['Handler']['create'](U, function () {
                                    U['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = X,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](w['config'])), G, r, view['EMJMode']['paipu'], Laya['Handler']['create'](U, function () {
                                            uiscript['UI_Replay'].Inst['initData'](C),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, U, function () {
                                                    U['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, U, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, U, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](U, function (C) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * C);
                                }, null, !1));
                        }),
                            g = {};
                        if (g['record'] = w, i.data && i.data['length'])
                            g.game = net['MessageWrapper']['decodeMessage'](i.data), b['runWith'](g);
                        else {
                            var M = i['data_url'];
                            game['LoadMgr']['httpload'](M, 'arraybuffer', !1, Laya['Handler']['create'](U, function (C) {
                                if (C['success']) {
                                    var K = new Laya.Byte();
                                    K['writeArrayBuffer'](C.data);
                                    var r = net['MessageWrapper']['decodeMessage'](K['getUint8Array'](0, K['length']));
                                    g.game = r,
                                        b['runWith'](g);
                                } else
                                    uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + i['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), U['duringPaipu'] = !1;
                            }));
                        }
                    }
                }), void 0);
        }







        // 牌谱功能
        !function (C) {
            var K = function () {
                function K(C) {
                    var K = this;
                    this.me = C,
                        this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            K['locking'] || K.hide(null);
                        }),
                        this['title'] = this.me['getChildByName']('title'),
                        this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                        this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                        this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                        this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                        this.me['visible'] = !1,
                        this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            K['locking'] || K.hide(null);
                        }, null, !1),
                        this['container_hidename'] = this.me['getChildByName']('hidename'),
                        this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var r = this['container_hidename']['getChildByName']('w0'),
                        X = this['container_hidename']['getChildByName']('w1');
                    X.x = r.x + r['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            K['sp_checkbox']['visible'] = !K['sp_checkbox']['visible'],
                                K['refresh_share_uuid']();
                        });
                }
                return K['prototype']['show_share'] = function (K) {
                    var r = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                        this['sp_checkbox']['visible'] = !1,
                        this['btn_confirm']['visible'] = !1,
                        this['input']['editable'] = !1,
                        this.uuid = K,
                        this['refresh_share_uuid'](),
                        this.me['visible'] = !0,
                        this['locking'] = !0,
                        this['container_hidename']['visible'] = !0,
                        this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                        C['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            r['locking'] = !1;
                        }));
                },
                    K['prototype']['refresh_share_uuid'] = function () {
                        var C = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            K = this.uuid,
                            r = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + r + '?paipu=' + game['Tools']['EncodePaipuUUID'](K) + '_a' + C + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + r + '?paipu=' + K + '_a' + C;
                    },
                    K['prototype']['show_check'] = function () {
                        var K = this;
                        return C['UI_PiPeiYuYue'].Inst['enable'] ? (C['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return K['input'].text ? (K.hide(Laya['Handler']['create'](K, function () {
                                var C = K['input'].text['split']('='),
                                    r = C[C['length'] - 1]['split']('_'),
                                    X = 0;
                                r['length'] > 1 && (X = 'a' == r[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(r[1]['substr'](1))) : parseInt(r[1]));
                                var U = 0;
                                if (r['length'] > 2) {
                                    var i = parseInt(r[2]);
                                    i && (U = i);
                                }
                                GameMgr.Inst['checkPaiPu'](r[0], X, U);
                            })), void 0) : (C['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, C['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            K['locking'] = !1;
                        })), void 0);
                    },
                    K['prototype'].hide = function (K) {
                        var r = this;
                        this['locking'] = !0,
                            C['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                r['locking'] = !1,
                                    r.me['visible'] = !1,
                                    K && K.run();
                            }));
                    },
                    K;
            }
                (),
                r = function () {
                    function K(C) {
                        var K = this;
                        this.me = C,
                            this['blackbg'] = C['getChildByName']('blackbg'),
                            this.root = C['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                K['locking'] || K['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                K['locking'] || (game['Tools']['calu_word_length'](K['input'].text) > 30 ? K['toolong']['visible'] = !0 : (K['close'](), i['addCollect'](K.uuid, K['start_time'], K['end_time'], K['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return K['prototype'].show = function (K, r, X) {
                        var U = this;
                        this.uuid = K,
                            this['start_time'] = r,
                            this['end_time'] = X,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            C['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                U['locking'] = !1;
                            }));
                    },
                        K['prototype']['close'] = function () {
                            var K = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                C['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    K['locking'] = !1,
                                        K.me['visible'] = !1;
                                }));
                        },
                        K;
                }
                    ();
            C['UI_Pop_CollectInput'] = r;
            var X;
            !function (C) {
                C[C.ALL = 0] = 'ALL',
                    C[C['FRIEND'] = 1] = 'FRIEND',
                    C[C.RANK = 2] = 'RANK',
                    C[C['MATCH'] = 4] = 'MATCH',
                    C[C['COLLECT'] = 100] = 'COLLECT';
            }
                (X || (X = {}));
            var U = function () {
                function K(C) {
                    this['uuid_list'] = [],
                        this.type = C,
                        this['reset']();
                }
                return K['prototype']['reset'] = function () {
                    this['count'] = 0,
                        this['true_count'] = 0,
                        this['have_more_paipu'] = !0,
                        this['uuid_list'] = [],
                        this['duringload'] = !1,
                        this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                    K['prototype']['loadList'] = function (K) {
                        var r = this;
                        if (void 0 === K && (K = 10), !this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == X['COLLECT']) {
                                for (var U = [], N = 0, H = 0; 10 > H; H++) {
                                    var w = this['count'] + H;
                                    if (w >= i['collect_lsts']['length'])
                                        break;
                                    N++;
                                    var G = i['collect_lsts'][w];
                                    i['record_map'][G] || U.push(G),
                                        this['uuid_list'].push(G);
                                }
                                U['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: U
                                }, function (K, X) {
                                    if (r['duringload'] = !1, i.Inst['onLoadStateChange'](r.type, !1), K || X['error'])
                                        C['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', K, X);
                                    else if (app.Log.log(JSON['stringify'](X)), X['record_list'] && X['record_list']['length'] == U['length']) {
                                        for (var H = 0; H < X['record_list']['length']; H++) {
                                            var w = X['record_list'][H].uuid;
                                            i['record_map'][w] || (i['record_map'][w] = X['record_list'][H]);
                                        }
                                        r['count'] += N,
                                            r['count'] >= i['collect_lsts']['length'] && (r['have_more_paipu'] = !1, i.Inst['onLoadOver'](r.type)),
                                            i.Inst['onLoadMoreLst'](r.type, N);
                                    } else
                                        r['have_more_paipu'] = !1, i.Inst['onLoadOver'](r.type);
                                }) : (this['duringload'] = !1, this['count'] += N, this['count'] >= i['collect_lsts']['length'] && (this['have_more_paipu'] = !1, i.Inst['onLoadOver'](this.type)), i.Inst['onLoadMoreLst'](this.type, N));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (K, U) {
                                    if (r['duringload'] = !1, i.Inst['onLoadStateChange'](r.type, !1), K || U['error'])
                                        C['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', K, U);
                                    else if (app.Log.log(JSON['stringify'](U)), U['record_list'] && U['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(U),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(U));
                                                }
                                            }));
                                            for (let record_list of U['record_list']) {
                                                for (let account = 0; account < record_list['accounts'].length; account++) {
                                                    if (MMP.settings.nickname != '') {
                                                        if (record_list['accounts'][account]['account_id'] == GameMgr.Inst["account_id"]) {
                                                            record_list['accounts'][account]['nickname'] = MMP.settings.nickname;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(record_list['accounts'][account]['account_id']);
                                                        if (server == 1) {
                                                            record_list['accounts'][account]['nickname'] = '[CN]' + record_list['accounts'][account]['nickname'];
                                                        } else if (server == 2) {
                                                            record_list['accounts'][account]['nickname'] = '[JP]' + record_list['accounts'][account]['nickname'];
                                                        } else if (server == 3) {
                                                            record_list['accounts'][account]['nickname'] = '[EN]' + record_list['accounts'][account]['nickname'];
                                                        } else {
                                                            record_list['accounts'][account]['nickname'] = '[??]' + record_list['accounts'][account]['nickname'];
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        // END
                                        for (var N = U['record_list'], H = 0, w = 0; w < N['length']; w++) {
                                            var G = N[w].uuid;
                                            if (r.type == X.RANK && N[w]['config'] && N[w]['config'].meta) {
                                                var l = N[w]['config'].meta;
                                                if (l) {
                                                    var R = cfg['desktop']['matchmode'].get(l['mode_id']);
                                                    if (R && 5 == R.room)
                                                        continue;
                                                }
                                            }
                                            H++,
                                                r['uuid_list'].push(G),
                                                i['record_map'][G] || (i['record_map'][G] = N[w]);
                                        }
                                        r['count'] += H,
                                            r['true_count'] += N['length'],
                                            i.Inst['onLoadMoreLst'](r.type, H),
                                            r['have_more_paipu'] = !0;
                                    } else
                                        r['have_more_paipu'] = !1, i.Inst['onLoadOver'](r.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                r['duringload'] && i.Inst['onLoadStateChange'](r.type, !0);
                            });
                        }
                    },
                    K['prototype']['removeAt'] = function (C) {
                        for (var K = 0; K < this['uuid_list']['length'] - 1; K++)
                            K >= C && (this['uuid_list'][K] = this['uuid_list'][K + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    K;
            }
                (),
                i = function (i) {
                    function N() {
                        var C = i.call(this, new ui['lobby']['paipuUI']()) || this;
                        return C.top = null,
                            C['container_scrollview'] = null,
                            C['scrollview'] = null,
                            C['loading'] = null,
                            C.tabs = [],
                            C['pop_otherpaipu'] = null,
                            C['pop_collectinput'] = null,
                            C['label_collect_count'] = null,
                            C['noinfo'] = null,
                            C['locking'] = !1,
                            C['current_type'] = X.ALL,
                            N.Inst = C,
                            C;
                    }
                    return __extends(N, i),
                        N.init = function () {
                            var C = this;
                            this['paipuLst'][X.ALL] = new U(X.ALL),
                                this['paipuLst'][X['FRIEND']] = new U(X['FRIEND']),
                                this['paipuLst'][X.RANK] = new U(X.RANK),
                                this['paipuLst'][X['MATCH']] = new U(X['MATCH']),
                                this['paipuLst'][X['COLLECT']] = new U(X['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (K, r) {
                                    if (K || r['error']);
                                    else {
                                        if (r['record_list']) {
                                            for (var X = r['record_list'], U = 0; U < X['length']; U++) {
                                                var i = {
                                                    uuid: X[U].uuid,
                                                    time: X[U]['end_time'],
                                                    remarks: X[U]['remarks']
                                                };
                                                C['collect_lsts'].push(i.uuid),
                                                    C['collect_info'][i.uuid] = i;
                                            }
                                            C['collect_lsts'] = C['collect_lsts'].sort(function (K, r) {
                                                return C['collect_info'][r].time - C['collect_info'][K].time;
                                            });
                                        }
                                        r['record_collect_limit'] && (C['collect_limit'] = r['record_collect_limit']);
                                    }
                                });
                        },
                        N['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        N['reset'] = function () {
                            this['paipuLst'][X.ALL] && this['paipuLst'][X.ALL]['reset'](),
                                this['paipuLst'][X['FRIEND']] && this['paipuLst'][X['FRIEND']]['reset'](),
                                this['paipuLst'][X.RANK] && this['paipuLst'][X.RANK]['reset'](),
                                this['paipuLst'][X['MATCH']] && this['paipuLst'][X['MATCH']]['reset']();
                        },
                        N['addCollect'] = function (K, r, X, U) {
                            var i = this;
                            if (!this['collect_info'][K]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return C['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: K,
                                    remarks: U,
                                    start_time: r,
                                    end_time: X
                                }, function () { });
                                var H = {
                                    uuid: K,
                                    remarks: U,
                                    time: X
                                };
                                this['collect_info'][K] = H,
                                    this['collect_lsts'].push(K),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (C, K) {
                                        return i['collect_info'][K].time - i['collect_info'][C].time;
                                    }),
                                    C['UI_DesktopInfo'].Inst && C['UI_DesktopInfo'].Inst['enable'] && C['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    N.Inst && N.Inst['enable'] && N.Inst['onCollectChange'](K, -1);
                            }
                        },
                        N['removeCollect'] = function (K) {
                            var r = this;
                            if (this['collect_info'][K]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: K
                                }, function () { }),
                                    delete this['collect_info'][K];
                                for (var X = -1, U = 0; U < this['collect_lsts']['length']; U++)
                                    if (this['collect_lsts'][U] == K) {
                                        this['collect_lsts'][U] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            X = U;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (C, K) {
                                        return r['collect_info'][K].time - r['collect_info'][C].time;
                                    }),
                                    C['UI_DesktopInfo'].Inst && C['UI_DesktopInfo'].Inst['enable'] && C['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    N.Inst && N.Inst['enable'] && N.Inst['onCollectChange'](K, X);
                            }
                        },
                        N['prototype']['onCreate'] = function () {
                            var X = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    X['locking'] || X['close'](Laya['Handler']['create'](X, function () {
                                        C['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (C) {
                                    X['setItemValue'](C['index'], C['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var C = N['paipuLst'][X['current_type']];
                                    (1 - X['scrollview'].rate) * C['count'] < 3 && (C['duringload'] || (C['have_more_paipu'] ? C['loadList']() : 0 == C['count'] && (X['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    X['pop_otherpaipu'].me['visible'] || X['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var U = 0; 5 > U; U++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](U)), this.tabs[U]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [U, !1]);
                            this['pop_otherpaipu'] = new K(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new r(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        N['prototype'].show = function () {
                            var K = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                C['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                C['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    K['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = N['collect_lsts']['length']['toString']() + '/' + N['collect_limit']['toString']();
                        },
                        N['prototype']['close'] = function (K) {
                            var r = this;
                            this['locking'] = !0,
                                C['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                C['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    r['locking'] = !1,
                                        r['enable'] = !1,
                                        K && K.run();
                                });
                        },
                        N['prototype']['changeTab'] = function (C, K) {
                            var r = [X.ALL, X.RANK, X['FRIEND'], X['MATCH'], X['COLLECT']];
                            if (K || r[C] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = r[C], this['current_type'] == X['COLLECT'] && N['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != X['COLLECT']) {
                                    var U = N['paipuLst'][this['current_type']]['count'];
                                    U > 0 && this['scrollview']['addItem'](U);
                                }
                                for (var i = 0; i < this.tabs['length']; i++) {
                                    var H = this.tabs[i];
                                    H['getChildByName']('img').skin = game['Tools']['localUISrc'](C == i ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        H['getChildByName']('label_name')['color'] = C == i ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        N['prototype']['setItemValue'] = function (K, r) {
                            var X = this;
                            if (this['enable']) {
                                var U = N['paipuLst'][this['current_type']];
                                if (U || !(K >= U['uuid_list']['length'])) {
                                    for (var i = N['record_map'][U['uuid_list'][K]], H = 0; 4 > H; H++) {
                                        var w = r['getChildByName']('p' + H['toString']());
                                        if (H < i['result']['players']['length']) {
                                            w['visible'] = !0;
                                            var G = w['getChildByName']('chosen'),
                                                l = w['getChildByName']('rank'),
                                                R = w['getChildByName']('rank_word'),
                                                f = w['getChildByName']('name'),
                                                A = w['getChildByName']('score'),
                                                h = i['result']['players'][H];
                                            A.text = h['part_point_1'] || '0';
                                            for (var J = 0, c = game['Tools']['strOfLocalization'](2133), W = 0, x = !1, y = 0; y < i['accounts']['length']; y++)
                                                if (i['accounts'][y].seat == h.seat) {
                                                    J = i['accounts'][y]['account_id'],
                                                        c = i['accounts'][y]['nickname'],
                                                        W = i['accounts'][y]['verified'],
                                                        x = i['accounts'][y]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](f, {
                                                account_id: J,
                                                nickname: c,
                                                verified: W
                                            }),
                                                G['visible'] = x,
                                                A['color'] = x ? '#ffc458' : '#b98930',
                                                f['getChildByName']('name')['color'] = x ? '#dfdfdf' : '#a0a0a0',
                                                R['color'] = l['color'] = x ? '#57bbdf' : '#489dbc';
                                            var n = w['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (H) {
                                                    case 0:
                                                        n.text = 'st';
                                                        break;
                                                    case 1:
                                                        n.text = 'nd';
                                                        break;
                                                    case 2:
                                                        n.text = 'rd';
                                                        break;
                                                    case 3:
                                                        n.text = 'th';
                                                }
                                        } else
                                            w['visible'] = !1;
                                    }
                                    var k = new Date(1000 * i['end_time']),
                                        B = '';
                                    B += k['getFullYear']() + '/',
                                        B += (k['getMonth']() < 9 ? '0' : '') + (k['getMonth']() + 1)['toString']() + '/',
                                        B += (k['getDate']() < 10 ? '0' : '') + k['getDate']() + ' ',
                                        B += (k['getHours']() < 10 ? '0' : '') + k['getHours']() + ':',
                                        B += (k['getMinutes']() < 10 ? '0' : '') + k['getMinutes'](),
                                        r['getChildByName']('date').text = B,
                                        r['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return X['locking'] ? void 0 : C['UI_PiPeiYuYue'].Inst['enable'] ? (C['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](i.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        r['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            X['locking'] || X['pop_otherpaipu'].me['visible'] || (X['pop_otherpaipu']['show_share'](i.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var D = r['getChildByName']('room'),
                                        Z = game['Tools']['get_room_desc'](i['config']);
                                    D.text = Z.text;
                                    var L = '';
                                    if (1 == i['config']['category'])
                                        L = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == i['config']['category'])
                                        L = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == i['config']['category']) {
                                        var v = i['config'].meta;
                                        if (v) {
                                            var b = cfg['desktop']['matchmode'].get(v['mode_id']);
                                            b && (L = b['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (N['collect_info'][i.uuid]) {
                                        var g = N['collect_info'][i.uuid],
                                            M = r['getChildByName']('remarks_info'),
                                            a = r['getChildByName']('input'),
                                            z = a['getChildByName']('txtinput'),
                                            p = r['getChildByName']('btn_input'),
                                            Y = !1,
                                            d = function () {
                                                Y ? (M['visible'] = !1, a['visible'] = !0, z.text = M.text, p['visible'] = !1) : (M.text = g['remarks'] && '' != g['remarks'] ? game['Tools']['strWithoutForbidden'](g['remarks']) : L, M['visible'] = !0, a['visible'] = !1, p['visible'] = !0);
                                            };
                                        d(),
                                            p['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                Y = !0,
                                                    d();
                                            }, null, !1),
                                            z.on('blur', this, function () {
                                                Y && (game['Tools']['calu_word_length'](z.text) > 30 ? C['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : z.text != g['remarks'] && (g['remarks'] = z.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: i.uuid,
                                                    remarks: z.text
                                                }, function () { }))),
                                                    Y = !1,
                                                    d();
                                            });
                                        var s = r['getChildByName']('collect');
                                        s['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](X, function () {
                                                N['removeCollect'](i.uuid);
                                            }));
                                        }, null, !1),
                                            s['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        r['getChildByName']('input')['visible'] = !1,
                                            r['getChildByName']('btn_input')['visible'] = !1,
                                            r['getChildByName']('remarks_info')['visible'] = !0,
                                            r['getChildByName']('remarks_info').text = L;
                                        var s = r['getChildByName']('collect');
                                        s['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            X['pop_collectinput'].show(i.uuid, i['start_time'], i['end_time']);
                                        }, null, !1),
                                            s['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        N['prototype']['onLoadStateChange'] = function (C, K) {
                            this['current_type'] == C && (this['loading']['visible'] = K);
                        },
                        N['prototype']['onLoadMoreLst'] = function (C, K) {
                            this['current_type'] == C && this['scrollview']['addItem'](K);
                        },
                        N['prototype']['getScrollViewCount'] = function () {
                            return this['scrollview']['value_count'];
                        },
                        N['prototype']['onLoadOver'] = function (C) {
                            if (this['current_type'] == C) {
                                var K = N['paipuLst'][this['current_type']];
                                0 == K['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        N['prototype']['onCollectChange'] = function (C, K) {
                            if (this['current_type'] == X['COLLECT'])
                                K >= 0 && (N['paipuLst'][X['COLLECT']]['removeAt'](K), this['scrollview']['delItem'](K));
                            else
                                for (var r = N['paipuLst'][this['current_type']]['uuid_list'], U = 0; U < r['length']; U++)
                                    if (r[U] == C) {
                                        this['scrollview']['wantToRefreshItem'](U);
                                        break;
                                    }
                            this['label_collect_count'].text = N['collect_lsts']['length']['toString']() + '/' + N['collect_limit']['toString']();
                        },
                        N.Inst = null,
                        N['paipuLst'] = {},
                        N['collect_lsts'] = [],
                        N['record_map'] = {},
                        N['collect_info'] = {},
                        N['collect_limit'] = 20,
                        N;
                }
                    (C['UIBase']);
            C['UI_PaiPu'] = i;
        }
            (uiscript || (uiscript = {}));







        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var C = GameMgr;
            var K = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (C, r) {
                C || r['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', C, r) : K['server_time_delta'] = 1000 * r['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (C, r) {
                C || r['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', C, r) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](r)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, r['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](r['settings']), r['settings']['nickname_setting'] && (K['nickname_replace_enable'] = !!r['settings']['nickname_setting']['enable'], K['nickname_replace_lst'] = r['settings']['nickname_setting']['nicknames'], K['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = r['settings']['allow_modify_nickname']);
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (C, r) {
                C || r['error'] || (K['client_endpoint'] = r['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (C) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](C));
                var r = C['update'];
                if (r) {
                    if (r['numerical'])
                        for (var X = 0; X < r['numerical']['length']; X++) {
                            var U = r['numerical'][X].id,
                                i = r['numerical'][X]['final'];
                            switch (U) {
                                case '100001':
                                    K['account_data']['diamond'] = i;
                                    break;
                                case '100002':
                                    K['account_data'].gold = i;
                                    break;
                                case '100099':
                                    K['account_data'].vip = i,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (U >= '101001' || '102999' >= U) && (K['account_numerical_resource'][U] = i);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](r),
                        r['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](r['daily_task']),
                        r['title'] && uiscript['UI_TitleBook']['title_update'](r['title']),
                        r['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](r),
                        (r['activity_task'] || r['activity_period_task'] || r['activity_random_task'] || r['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](r),
                        r['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](r['activity_flip_task']['progresses']),
                        r['activity'] && (r['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](r['activity']['friend_gift_data']), r['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](r['activity']['upgrade_data']), r['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](r['activity']['gacha_data']), r['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](r['activity']['simulation_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (C) {
                app.Log.log('收到消息：' + JSON['stringify'](C)),
                    C.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](C['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (C) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    C['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](C['settings']), C['settings']['nickname_setting'] && (K['nickname_replace_enable'] = !!C['settings']['nickname_setting']['enable'], K['nickname_replace_lst'] = C['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = C['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (C) {
                uiscript['UI_Sushe']['send_gift_limit'] = C['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = C['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = C['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = C['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = C['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (C) {
                uiscript['UI_Guajichenfa'].Inst.show(C);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (C) {
                K['auth_check_id'] = C['check_id'],
                    K['auth_nc_retry_count'] = 0,
                    4 == C.type ? K['showNECaptcha']() : 2 == C.type ? K['checkNc']() : K['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    var C = (Laya['timer']['currTimer'] - K['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: C
                    }, function () { }),
                        C >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var C = Laya['stage']['getMousePoint']();
                (C.x != K['_pre_mouse_point'].x || C.y != K['_pre_mouse_point'].y) && (K['clientHeatBeat'](), K['_pre_mouse_point'].x = C.x, K['_pre_mouse_point'].y = C.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == C['client_type'] && Laya['timer'].loop(3600000, this, function () {
                K['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == C['client_language']) {
                var r = document['createElement']('link');
                r.rel = 'stylesheet',
                    r.href = 'font/notosansjapanese_1.css';
                var X = document['getElementsByTagName']('head')[0];
                X['appendChild'](r);
            }
        }





        // 设置状态
        !function (C) {
            var K = function () {
                function C(K) {
                    this.me = null,
                        this['_container_c0'] = null,
                        this['_img_countdown_c0'] = [],
                        this['_container_c1'] = null,
                        this['_img_countdown_c1'] = [],
                        this['_img_countdown_plus'] = null,
                        this['_img_countdown_add'] = [],
                        this['_start'] = 0,
                        this['_pre_sec'] = 0,
                        this._fix = 0,
                        this._add = 0,
                        this['_pre_time'] = 0,
                        C.Inst = this,
                        this.me = K,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var r = 0; 3 > r; r++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + r));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var r = 0; 3 > r; r++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + r));
                    for (var r = 0; 2 > r; r++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + r));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                }
                return Object['defineProperty'](C['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    C['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    C['prototype']['showCD'] = function (C, K) {
                        var r = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](C / 1000),
                            this._add = Math['floor'](K / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var C = Laya['timer']['currTimer'] - r['_pre_time'];
                                r['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? r['_start'] += C : r['_show']();
                            });
                    },
                    C['prototype']['close'] = function () {
                        this['reset']();
                    },
                    C['prototype']['_show'] = function () {
                        var C = this._fix + this._add - this['timeuse'];
                        if (0 >= C)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (C != this['_pre_sec']) {
                            if (this['_pre_sec'] = C, C > this._add) {
                                for (var K = (C - this._add)['toString'](), r = 0; r < this['_img_countdown_c0']['length']; r++)
                                    this['_img_countdown_c0'][r]['visible'] = r < K['length'];
                                if (3 == K['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[2] + '.png')) : 2 == K['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + K[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var X = this._add['toString'](), r = 0; r < this['_img_countdown_add']['length']; r++) {
                                        var U = this['_img_countdown_add'][r];
                                        r < X['length'] ? (U['visible'] = !0, U.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + X[r] + '.png')) : U['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var r = 0; r < this['_img_countdown_add']['length']; r++)
                                        this['_img_countdown_add'][r]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var K = C['toString'](), r = 0; r < this['_img_countdown_c0']['length']; r++)
                                    this['_img_countdown_c0'][r]['visible'] = r < K['length'];
                                3 == K['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[2] + '.png')) : 2 == K['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + K[0] + '.png');
                            }
                            if (C > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var r = 0; r < this['_img_countdown_c0']['length']; r++)
                                    this['_img_countdown_c0'][r]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                    this['_container_c1']['visible'] = !0;
                                for (var r = 0; r < this['_img_countdown_c0']['length']; r++)
                                    this['_img_countdown_c0'][r]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                                for (var r = 0; r < this['_img_countdown_c1']['length']; r++)
                                    this['_img_countdown_c1'][r]['visible'] = this['_img_countdown_c0'][r]['visible'], this['_img_countdown_c1'][r].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][r].skin);
                                N.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    C.Inst = null,
                    C;
            }
                (),
                r = function () {
                    function C(C) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = C;
                    }
                    return C['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        C['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        C['prototype']['_loop_refresh_delay'] = function () {
                            var C = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var K = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var r = app['NetAgent']['mj_network_delay'];
                                    K = 300 > r ? 2000 : 800 > r ? 2500 + r : 4000 + 0.5 * r,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            C['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    K = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), K);
                            }
                        },
                        C['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var C = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > C ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > C ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        C;
                }
                    (),
                X = function () {
                    function C(C, K) {
                        var r = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = K,
                            this.me = C,
                            this['btn_banemj'] = C['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = C['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = C['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                r['locking'] || (r['emj_banned'] = !r['emj_banned'], r['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (r['emj_banned'] ? '_on.png' : '.png')), r['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                r['locking'] || (r['close'](), N.Inst['btn_seeinfo'](r['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                r['locking'] || (r['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](r['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                r['locking'] || r['switch']();
                            }, null, !1);
                    }
                    return C['prototype']['reset'] = function (C, K, r) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = C,
                            this['showemj'] = K,
                            this['showchange'] = r,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        C['prototype']['onChangeSeat'] = function (C, K, r) {
                            this['showinfo'] = C,
                                this['showemj'] = K,
                                this['showchange'] = r,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        C['prototype']['switch'] = function () {
                            var C = this;
                            this['locking'] || (this['enable'] ? this['close']() : (this['enable'] = !0, this['locking'] = !0, this['showinfo'] ? (this['btn_seeinfo']['visible'] = !0, this['btn_seeinfo']['scaleX'] = this['btn_seeinfo']['scaleY'] = 1, this['btn_seeinfo'].x = this['btn_seeinfo_origin_x'], this['btn_seeinfo'].y = this['btn_seeinfo_origin_y'], this['btn_seeinfo']['alpha'] = 1, Laya['Tween'].from(this['btn_seeinfo'], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease['backOut'])) : this['btn_seeinfo']['visible'] = !1, this['showemj'] ? (this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')), this['btn_banemj']['visible'] = !0, this['btn_banemj']['scaleX'] = this['btn_banemj']['scaleY'] = 1, this['btn_banemj'].x = this['btn_banemj_origin_x'], this['btn_banemj'].y = this['btn_banemj_origin_y'], this['btn_banemj']['alpha'] = 1, Laya['Tween'].from(this['btn_banemj'], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease['backOut'])) : this['btn_banemj']['visible'] = !1, this['showchange'] ? (this['btn_change']['visible'] = !0, this['btn_change']['scaleX'] = this['btn_change']['scaleY'] = 1, this['btn_change'].x = this['btn_change_origin_x'], this['btn_change'].y = this['btn_change_origin_y'], this['btn_change']['alpha'] = 1, Laya['Tween'].from(this['btn_change'], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease['backOut'])) : this['btn_change']['visible'] = !1, Laya['timer'].once(150, this, function () {
                                C['locking'] = !1;
                            })));
                        },
                        C['prototype']['close'] = function () {
                            var C = this;
                            this['enable'] = !1,
                                this['locking'] = !0,
                                Laya['Tween'].to(this['btn_banemj'], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease['backOut']),
                                Laya['Tween'].to(this['btn_seeinfo'], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease['backOut']),
                                Laya['Tween'].to(this['btn_change'], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease['backOut']),
                                Laya['timer'].once(150, this, function () {
                                    C['locking'] = !1,
                                        C['btn_banemj']['visible'] = !1,
                                        C['btn_seeinfo']['visible'] = !1,
                                        C['btn_change']['visible'] = !1;
                                });
                        },
                        C;
                }
                    (),
                U = function () {
                    function C(C) {
                        var K = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = C,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                K['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                K['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function () {
                                K['scrollview']['total_height'] > 0 ? K['scrollbar']['setVal'](K['scrollview'].rate, K['scrollview']['view_height'] / K['scrollview']['total_height']) : K['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return C['prototype']['initRoom'] = function () {
                        // START 
                        //var C = view['DesktopMgr'].Inst['main_role_character_info'],
                        // END
                        var C = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            K = cfg['item_definition']['character'].find(C['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var r = 0; 9 > r; r++)
                            this.emos.push({
                                path: K.emo + '/' + r + '.png',
                                sub_id: r,
                                sort: r
                            });
                        if (C['extra_emoji'])
                            for (var r = 0; r < C['extra_emoji']['length']; r++)
                                this.emos.push({
                                    path: K.emo + '/' + C['extra_emoji'][r] + '.png',
                                    sub_id: C['extra_emoji'][r],
                                    sort: C['extra_emoji'][r] > 12 ? 1000000 - C['extra_emoji'][r] : C['extra_emoji'][r]
                                });
                        this.emos = this.emos.sort(function (C, K) {
                            return C.sort - K.sort;
                        }),
                            this['allgray'] = !1,
                            this['scrollbar']['reset'](),
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this.emos['length']),
                            this['btn_chat']['disabled'] = !1,
                            this['btn_mask']['visible'] = view['DesktopMgr'].Inst['emoji_switch'],
                            'chs' != GameMgr['client_language'] && (this.out['getChildAt'](3)['visible'] = !view['DesktopMgr'].Inst['emoji_switch']),
                            this.me.x = 1896,
                            this.in['visible'] = !1,
                            this.out['visible'] = !0,
                            this['emo_infos'] = {
                                char_id: C['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        C['prototype']['render_item'] = function (C) {
                            var K = this,
                                r = C['index'],
                                X = C['container'],
                                U = this.emos[r],
                                i = X['getChildByName']('btn');
                            i.skin = game['LoadMgr']['getResImageSkin'](U.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](i, !0) : (game['Tools']['setGrayDisable'](i, !1), i['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var C = !1, r = 0, X = K['emo_infos']['emoji']; r < X['length']; r++) {
                                            var i = X[r];
                                            if (i[0] == U['sub_id']) {
                                                i[0]++,
                                                    C = !0;
                                                break;
                                            }
                                        }
                                        C || K['emo_infos']['emoji'].push([U['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: U['sub_id']
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    K['change_all_gray'](!0),
                                        Laya['timer'].once(5000, K, function () {
                                            K['change_all_gray'](!1);
                                        }),
                                        K['switchShow'](!1);
                                }, null, !1));
                        },
                        C['prototype']['change_all_gray'] = function (C) {
                            this['allgray'] = C,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        C['prototype']['switchShow'] = function (C) {
                            var K = this,
                                r = 0;
                            r = C ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, C ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    C ? (K.out['visible'] = !1, K.in['visible'] = !0) : (K.out['visible'] = !0, K.in['visible'] = !1),
                                        Laya['Tween'].to(K.me, {
                                            x: r
                                        }, C ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](K, function () {
                                            K['btn_chat']['disabled'] = !1,
                                                K['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        C['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var C = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: C,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: N.Inst['min_double_time'],
                            //        g: N.Inst['max_double_time']
                            //    }, !1),
                            //    this['emo_infos']['emoji'] = [];
                            // }
                            // this['emo_log_count']++;
                            // END
                        },
                        C['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        C;
                }
                    (),
                i = function () {
                    function K(K) {
                        this['effect'] = null,
                            this['container_emo'] = K['getChildByName']('chat_bubble'),
                            this.emo = new C['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = K['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return K['prototype'].show = function (C, K) {
                        var r = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var X = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](C)]['character']['charid'], U = cfg['character']['emoji']['getGroup'](X), i = '', N = 0, H = 0; H < U['length']; H++)
                                if (U[H]['sub_id'] == K) {
                                    2 == U[H].type && (i = U[H].view, N = U[H]['audio']);
                                    break;
                                }
                            this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                i ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + i + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    r['effect']['destory'](),
                                        r['effect'] = null;
                                }), N && view['AudioMgr']['PlayAudio'](N)) : (this.emo['setSkin'](X, K), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    r.emo['clear'](),
                                        Laya['Tween'].to(r['container_emo'], {
                                            scaleX: 0,
                                            scaleY: 0
                                        }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    r['container_emo']['visible'] = !1;
                                }));
                        }
                    },
                        K['prototype']['reset'] = function () {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        K;
                }
                    (),
                N = function (N) {
                    function H() {
                        var C = N.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return C['container_doras'] = null,
                            C['doras'] = [],
                            C['front_doras'] = [],
                            C['label_md5'] = null,
                            C['container_gamemode'] = null,
                            C['label_gamemode'] = null,
                            C['btn_auto_moqie'] = null,
                            C['btn_auto_nofulu'] = null,
                            C['btn_auto_hule'] = null,
                            C['img_zhenting'] = null,
                            C['btn_double_pass'] = null,
                            C['_network_delay'] = null,
                            C['_timecd'] = null,
                            C['_player_infos'] = [],
                            C['_container_fun'] = null,
                            C['_fun_in'] = null,
                            C['_fun_out'] = null,
                            C['showscoredeltaing'] = !1,
                            C['_btn_leave'] = null,
                            C['_btn_fanzhong'] = null,
                            C['_btn_collect'] = null,
                            C['block_emo'] = null,
                            C['head_offset_y'] = 15,
                            C['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            C['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](C, function (K) {
                                C['onGameBroadcast'](K);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](C, function (K) {
                                C['onPlayerConnectionState'](K);
                            })),
                            H.Inst = C,
                            C;
                    }
                    return __extends(H, N),
                        H['prototype']['onCreate'] = function () {
                            var N = this;
                            this['doras'] = new Array(),
                                this['front_doras'] = [];
                            var H = this.me['getChildByName']('container_lefttop'),
                                w = H['getChildByName']('container_doras');
                            this['container_doras'] = w,
                                this['container_gamemode'] = H['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = H['getChildByName']('MD5'),
                                H['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (N['label_md5']['visible'])
                                        Laya['timer']['clearAll'](N['label_md5']), N['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? H['getChildByName']('activitymode')['visible'] = !0 : N['container_doras']['visible'] = !0;
                                    else {
                                        N['label_md5']['visible'] = !0,
                                            view['DesktopMgr'].Inst['sha256'] ? (N['label_md5']['fontSize'] = 20, N['label_md5'].y = 45, N['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (N['label_md5']['fontSize'] = 25, N['label_md5'].y = 51, N['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            H['getChildByName']('activitymode')['visible'] = !1,
                                            N['container_doras']['visible'] = !1;
                                        var C = N;
                                        Laya['timer'].once(5000, N['label_md5'], function () {
                                            C['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? H['getChildByName']('activitymode')['visible'] = !0 : N['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var G = 0; G < w['numChildren']; G++)
                                this['doras'].push(w['getChildAt'](G)), this['front_doras'].push(w['getChildAt'](G)['getChildAt'](0));
                            for (var G = 0; 4 > G; G++) {
                                var l = this.me['getChildByName']('container_player_' + G),
                                    R = {};
                                R['container'] = l,
                                    R.head = new C['UI_Head'](l['getChildByName']('head'), ''),
                                    R['head_origin_y'] = l['getChildByName']('head').y,
                                    R.name = l['getChildByName']('container_name')['getChildByName']('name'),
                                    R['container_shout'] = l['getChildByName']('container_shout'),
                                    R['container_shout']['visible'] = !1,
                                    R['illust'] = R['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    R['illustrect'] = C['UIRect']['CreateFromSprite'](R['illust']),
                                    R['shout_origin_x'] = R['container_shout'].x,
                                    R['shout_origin_y'] = R['container_shout'].y,
                                    R.emo = new i(l),
                                    R['disconnect'] = l['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    R['disconnect']['visible'] = !1,
                                    R['title'] = new C['UI_PlayerTitle'](l['getChildByName']('title'), ''),
                                    R.que = l['getChildByName']('que'),
                                    R['que_target_pos'] = new Laya['Vector2'](R.que.x, R.que.y),
                                    R['tianming'] = l['getChildByName']('tianming'),
                                    R['tianming']['visible'] = !1,
                                    0 == G ? l['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        N['btn_seeinfo'](0);
                                    }, null, !1) : R['headbtn'] = new X(l['getChildByName']('btn_head'), G),
                                    this['_player_infos'].push(R);
                            }
                            this['_timecd'] = new K(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new U(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var K = 0, r = 0; r < view['DesktopMgr'].Inst['player_datas']['length']; r++)
                                                view['DesktopMgr'].Inst['player_datas'][r]['account_id'] && K++;
                                            if (1 >= K)
                                                C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](N, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var C = 0, K = 0; K < view['DesktopMgr'].Inst['player_datas']['length']; K++) {
                                                            var r = view['DesktopMgr'].Inst['player_datas'][K];
                                                            r && null != r['account_id'] && 0 != r['account_id'] && C++;
                                                        }
                                                        1 == C ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var X = !1;
                                                if (C['UI_VoteProgress']['vote_info']) {
                                                    var U = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - C['UI_VoteProgress']['vote_info']['start_time'] - C['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > U && (X = !0);
                                                }
                                                X ? C['UI_VoteProgress'].Inst['enable'] || C['UI_VoteProgress'].Inst.show() : C['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? C['UI_VoteCD'].Inst['enable'] || C['UI_VoteCD'].Inst.show() : C['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), C['UI_Ob_Replay'].Inst['resetRounds'](), C['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                }, null, !1),
                                this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    C['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    C['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](N, function () {
                                        C['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : C['UI_Replay'].Inst && C['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var f = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var K = Laya['timer']['currTimer'];
                                    if (f + 300 > K) {
                                        if (C['UI_ChiPengHu'].Inst['enable'])
                                            C['UI_ChiPengHu'].Inst['onDoubleClick'](), N['recordDoubleClickTime'](K - f);
                                        else {
                                            var r = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            C['UI_LiQiZiMo'].Inst['enable'] && (r = C['UI_LiQiZiMo'].Inst['onDoubleClick'](r)),
                                                r && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && N['recordDoubleClickTime'](K - f);
                                        }
                                        f = 0;
                                    } else
                                        f = K;
                                }
                            }, null, !1),
                                this['_network_delay'] = new r(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (H['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        H['prototype']['recordDoubleClickTime'] = function (C) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(C, this['min_double_time'])) : C,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(C, this['max_double_time']) : C;
                        },
                        H['prototype']['onGameBroadcast'] = function (C) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](C));
                            var K = view['DesktopMgr'].Inst['seat2LocalPosition'](C.seat),
                                r = JSON['parse'](C['content']);
                            null != r.emo && void 0 != r.emo && (this['onShowEmo'](K, r.emo), this['showAIEmo']());
                        },
                        H['prototype']['onPlayerConnectionState'] = function (C) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](C));
                            var K = C.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && K < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][K] = C['state']), this['enable']) {
                                var r = view['DesktopMgr'].Inst['seat2LocalPosition'](K);
                                this['_player_infos'][r]['disconnect']['visible'] = C['state'] != view['ELink_State']['READY'];
                            }
                        },
                        H['prototype']['_initFunc'] = function () {
                            var C = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var K = this['_fun_out']['getChildByName']('btn_func'),
                                r = this['_fun_out']['getChildByName']('btn_func2'),
                                X = this['_fun_in_spr']['getChildByName']('btn_func');
                            K['clickHandler'] = r['clickHandler'] = new Laya['Handler'](this, function () {
                                var U = 0;
                                U = -270,
                                    Laya['Tween'].to(C['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function () {
                                        C['_fun_in']['visible'] = !0,
                                            C['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(C['_container_fun'], {
                                                x: U
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function () {
                                                K['disabled'] = !1,
                                                    r['disabled'] = !1,
                                                    X['disabled'] = !1,
                                                    C['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    K['disabled'] = !0,
                                    r['disabled'] = !0,
                                    X['disabled'] = !0;
                            }, null, !1),
                                X['clickHandler'] = new Laya['Handler'](this, function () {
                                    var U = -546;
                                    Laya['Tween'].to(C['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function () {
                                        C['_fun_in']['visible'] = !1,
                                            C['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(C['_container_fun'], {
                                                x: U
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function () {
                                                K['disabled'] = !1,
                                                    r['disabled'] = !1,
                                                    X['disabled'] = !1,
                                                    C['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        K['disabled'] = !0,
                                        r['disabled'] = !0,
                                        X['disabled'] = !0;
                                });
                            var U = this['_fun_in']['getChildByName']('btn_autolipai'),
                                i = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                N = this['_fun_out']['getChildByName']('autolipai'),
                                H = Laya['LocalStorage']['getItem']('autolipai'),
                                w = !0;
                            w = H && '' != H ? 'true' == H : !0,
                                this['refreshFuncBtnShow'](U, N, w),
                                U['clickHandler'] = i['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        C['refreshFuncBtnShow'](U, N, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var G = this['_fun_in']['getChildByName']('btn_autohu'),
                                l = this['_fun_out']['getChildByName']('btn_autohu2'),
                                R = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](G, R, !1),
                                G['clickHandler'] = l['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        C['refreshFuncBtnShow'](G, R, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var f = this['_fun_in']['getChildByName']('btn_autonoming'),
                                A = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                h = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](f, h, !1),
                                f['clickHandler'] = A['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        C['refreshFuncBtnShow'](f, h, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var J = this['_fun_in']['getChildByName']('btn_automoqie'),
                                c = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                W = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](J, W, !1),
                                J['clickHandler'] = c['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        C['refreshFuncBtnShow'](J, W, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (N['scale'](0.9, 0.9), R['scale'](0.9, 0.9), h['scale'](0.9, 0.9), W['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (K['visible'] = !1, l['visible'] = !0, i['visible'] = !0, A['visible'] = !0, c['visible'] = !0) : (K['visible'] = !0, l['visible'] = !1, i['visible'] = !1, A['visible'] = !1, c['visible'] = !1);
                        },
                        H['prototype']['noAutoLipai'] = function () {
                            var C = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                C['clickHandler'].run();
                        },
                        H['prototype']['resetFunc'] = function () {
                            var C = Laya['LocalStorage']['getItem']('autolipai'),
                                K = !0;
                            K = C && '' != C ? 'true' == C : !0;
                            var r = this['_fun_in']['getChildByName']('btn_autolipai'),
                                X = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](r, X, K),
                                Laya['LocalStorage']['setItem']('autolipai', K ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](K);
                            var U = this['_fun_in']['getChildByName']('btn_autohu'),
                                i = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](U, i, view['DesktopMgr'].Inst['auto_hule']);
                            var N = this['_fun_in']['getChildByName']('btn_autonoming'),
                                H = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](N, H, view['DesktopMgr'].Inst['auto_nofulu']);
                            var w = this['_fun_in']['getChildByName']('btn_automoqie'),
                                G = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](w, G, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var l = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            l['disabled'] = !1,
                                l['disabled'] = !1;
                        },
                        H['prototype']['setDora'] = function (C, K) {
                            if (0 > C || C >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var r = 'myres2/mjpm/' + (K['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                            this['doras'][C].skin = game['Tools']['localUISrc'](r + K['toString'](!1) + '.png'),
                                this['front_doras'][C]['visible'] = !K['touming'],
                                this['front_doras'][C].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                        },
                        H['prototype']['initRoom'] = function () {
                            var K = this;
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var r = {}, X = 0; X < view['DesktopMgr'].Inst['player_datas']['length']; X++) {
                                    for (var U = view['DesktopMgr'].Inst['player_datas'][X]['character'], i = U['charid'], N = cfg['item_definition']['character'].find(i).emo, H = 0; 9 > H; H++) {
                                        var w = N + '/' + H['toString']() + '.png';
                                        r[w] = 1;
                                    }
                                    if (U['extra_emoji'])
                                        for (var H = 0; H < U['extra_emoji']['length']; H++) {
                                            var w = N + '/' + U['extra_emoji'][H]['toString']() + '.png';
                                            r[w] = 1;
                                        }
                                }
                                var G = [];
                                for (var l in r)
                                    G.push(l);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](G, Laya['Handler']['create'](this, function () {
                                        K['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else {
                                for (var R = !1, X = 0; X < view['DesktopMgr'].Inst['player_datas']['length']; X++) {
                                    var f = view['DesktopMgr'].Inst['player_datas'][X];
                                    if (f && null != f['account_id'] && f['account_id'] == GameMgr.Inst['account_id']) {
                                        R = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = R;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var A = 0, X = 0; X < view['DesktopMgr'].Inst['player_datas']['length']; X++) {
                                    var f = view['DesktopMgr'].Inst['player_datas'][X];
                                    f && null != f['account_id'] && 0 != f['account_id'] && A++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var h = 0, X = 0; X < view['DesktopMgr'].Inst['player_datas']['length']; X++) {
                                var f = view['DesktopMgr'].Inst['player_datas'][X];
                                f && null != f['account_id'] && 0 != f['account_id'] && h++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var J = this.me['getChildByName']('container_lefttop');
                            if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                                J['getChildByName']('num_lizhi_0')['visible'] = !1, J['getChildByName']('num_lizhi_1')['visible'] = !1, J['getChildByName']('num_ben_0')['visible'] = !1, J['getChildByName']('num_ben_1')['visible'] = !1, J['getChildByName']('container_doras')['visible'] = !1, J['getChildByName']('gamemode')['visible'] = !1, J['getChildByName']('activitymode')['visible'] = !0, J['getChildByName']('MD5').y = 63, J['getChildByName']('MD5')['width'] = 239, J['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), J['getChildAt'](0)['width'] = 280, J['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (J['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, J['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (J['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), J['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), J['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, J['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (J['getChildByName']('num_lizhi_0')['visible'] = !0, J['getChildByName']('num_lizhi_1')['visible'] = !1, J['getChildByName']('num_ben_0')['visible'] = !0, J['getChildByName']('num_ben_1')['visible'] = !0, J['getChildByName']('container_doras')['visible'] = !0, J['getChildByName']('gamemode')['visible'] = !0, J['getChildByName']('activitymode')['visible'] = !1, J['getChildByName']('MD5').y = 51, J['getChildByName']('MD5')['width'] = 276, J['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), J['getChildAt'](0)['width'] = 313, J['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var c = view['DesktopMgr'].Inst['game_config'],
                                    W = game['Tools']['get_room_desc'](c);
                                this['label_gamemode'].text = W.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = C['UI_Activity_JJC']['win_count']['toString']();
                                    for (var X = 0; 3 > X; X++)
                                        this['container_jjc']['getChildByName'](X['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (C['UI_Activity_JJC']['lose_count'] > X ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            C['UI_Replay'].Inst && (C['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var x = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                y = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (C['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](x, !0), game['Tools']['setGrayDisable'](y, !0)) : (game['Tools']['setGrayDisable'](x, !1), game['Tools']['setGrayDisable'](y, !1), C['UI_Astrology'].Inst.hide());
                            for (var X = 0; 4 > X; X++)
                                this['_player_infos'][X]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][X]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png');
                        },
                        H['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                        },
                        H['prototype']['refreshSeat'] = function (C) {
                            void 0 === C && (C = !1);
                            for (var K = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), r = 0; 4 > r; r++) {
                                var X = view['DesktopMgr'].Inst['localPosition2Seat'](r),
                                    U = this['_player_infos'][r];
                                if (0 > X)
                                    U['container']['visible'] = !1;
                                else {
                                    U['container']['visible'] = !0;
                                    var i = view['DesktopMgr'].Inst['getPlayerName'](X);
                                    game['Tools']['SetNickname'](U.name, i),
                                        U.head.id = K[X]['avatar_id'],
                                        U.head['set_head_frame'](K[X]['account_id'], K[X]['avatar_frame']);
                                    var N = (cfg['item_definition'].item.get(K[X]['avatar_frame']), cfg['item_definition'].view.get(K[X]['avatar_frame']));
                                    if (U.head.me.y = N && N['sargs'][0] ? U['head_origin_y'] - Number(N['sargs'][0]) / 100 * this['head_offset_y'] : U['head_origin_y'], U['avatar'] = K[X]['avatar_id'], 0 != r) {
                                        var H = K[X]['account_id'] && 0 != K[X]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                            w = K[X]['account_id'] && 0 != K[X]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            G = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                        C ? U['headbtn']['onChangeSeat'](H, w, G) : U['headbtn']['reset'](H, w, G);
                                    }
                                    U['title'].id = K[X]['title'] ? game['Tools']['titleLocalization'](K[X]['account_id'], K[X]['title']) : 0;
                                }
                            }
                        },
                        H['prototype']['refreshNames'] = function () {
                            for (var C = 0; 4 > C; C++) {
                                var K = view['DesktopMgr'].Inst['localPosition2Seat'](C),
                                    r = this['_player_infos'][C];
                                if (0 > K)
                                    r['container']['visible'] = !1;
                                else {
                                    r['container']['visible'] = !0;
                                    var X = view['DesktopMgr'].Inst['getPlayerName'](K);
                                    game['Tools']['SetNickname'](r.name, X);
                                }
                            }
                        },
                        H['prototype']['refreshLinks'] = function () {
                            for (var C = (view['DesktopMgr'].Inst.seat, 0); 4 > C; C++) {
                                var K = view['DesktopMgr'].Inst['localPosition2Seat'](C);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][C]['disconnect']['visible'] = -1 == K || 0 == C ? !1 : view['DesktopMgr']['player_link_state'][K] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][C]['disconnect']['visible'] = -1 == K || 0 == view['DesktopMgr'].Inst['player_datas'][K]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][K] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][C]['disconnect']['visible'] = !1);
                            }
                        },
                        H['prototype']['setBen'] = function (C) {
                            C > 99 && (C = 99);
                            var K = this.me['getChildByName']('container_lefttop'),
                                r = K['getChildByName']('num_ben_0'),
                                X = K['getChildByName']('num_ben_1');
                            C >= 10 ? (r.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 10)['toString']() + '.png'), X.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), X['visible'] = !0) : (r.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), X['visible'] = !1);
                        },
                        H['prototype']['setLiqibang'] = function (C, K) {
                            void 0 === K && (K = !0),
                                C > 999 && (C = 999);
                            var r = this.me['getChildByName']('container_lefttop'),
                                X = r['getChildByName']('num_lizhi_0'),
                                U = r['getChildByName']('num_lizhi_1'),
                                i = r['getChildByName']('num_lizhi_2');
                            C >= 100 ? (i.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](C / 10) % 10)['toString']() + '.png'), X.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 100)['toString']() + '.png'), U['visible'] = !0, i['visible'] = !0) : C >= 10 ? (U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), X.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 10)['toString']() + '.png'), U['visible'] = !0, i['visible'] = !1) : (X.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + C['toString']() + '.png'), U['visible'] = !1, i['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](C, K);
                        },
                        H['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var C = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, K = 0; K < this['doras']['length']; K++)
                                if (this['front_doras'][K].skin = '', this['doras'][K].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                    this['front_doras'][K]['visible'] = !1, this['doras'][K].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                else {
                                    var r = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                    this['front_doras'][K]['visible'] = !0,
                                        this['doras'][K].skin = game['Tools']['localUISrc'](r + '5z.png'),
                                        this['front_doras'][K].skin = game['Tools']['localUISrc'](C + 'back.png');
                                }
                            for (var K = 0; 4 > K; K++)
                                this['_player_infos'][K].emo['reset'](), this['_player_infos'][K].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        H['prototype']['showCountDown'] = function (C, K) {
                            this['_timecd']['showCD'](C, K);
                        },
                        H['prototype']['setZhenting'] = function (C) {
                            this['img_zhenting']['visible'] = C;
                        },
                        H['prototype']['shout'] = function (C, K, r, X) {
                            app.Log.log('shout:' + C + ' type:' + K);
                            try {
                                var U = this['_player_infos'][C],
                                    i = U['container_shout'],
                                    N = i['getChildByName']('img_content'),
                                    H = i['getChildByName']('illust')['getChildByName']('illust'),
                                    w = i['getChildByName']('img_score');
                                if (0 == X)
                                    w['visible'] = !1;
                                else {
                                    w['visible'] = !0;
                                    var G = 0 > X ? 'm' + Math.abs(X) : X;
                                    w.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + G + '.png');
                                }
                                '' == K ? N['visible'] = !1 : (N['visible'] = !0, N.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + K + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (i['getChildByName']('illust')['visible'] = !1, i['getChildAt'](2)['visible'] = !0, i['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](i['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (i['getChildByName']('illust')['visible'] = !0, i['getChildAt'](2)['visible'] = !1, i['getChildAt'](0)['visible'] = !0, H['scaleX'] = 1, game['Tools']['charaPart'](r['avatar_id'], H, 'half', U['illustrect'], !0, !0));
                                var l = 0,
                                    R = 0;
                                switch (C) {
                                    case 0:
                                        l = -105,
                                            R = 0;
                                        break;
                                    case 1:
                                        l = 500,
                                            R = 0;
                                        break;
                                    case 2:
                                        l = 0,
                                            R = -300;
                                        break;
                                    default:
                                        l = -500,
                                            R = 0;
                                }
                                i['visible'] = !0,
                                    i['alpha'] = 0,
                                    i.x = U['shout_origin_x'] + l,
                                    i.y = U['shout_origin_y'] + R,
                                    Laya['Tween'].to(i, {
                                        alpha: 1,
                                        x: U['shout_origin_x'],
                                        y: U['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(i, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](H.skin),
                                            i['visible'] = !1;
                                    });
                            } catch (f) {
                                var A = {};
                                A['error'] = f['message'],
                                    A['stack'] = f['stack'],
                                    A['method'] = 'shout',
                                    A['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](A);
                            }
                        },
                        H['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        H['prototype']['refreshFuncBtnShow'] = function (C, K, r) {
                            var X = C['getChildByName']('img_choosed');
                            K['color'] = C['mouseEnabled'] ? r ? '#3bd647' : '#7992b3' : '#565656',
                                X['visible'] = r;
                        },
                        H['prototype']['onShowEmo'] = function (C, K) {
                            var r = this['_player_infos'][C];
                            0 != C && r['headbtn']['emj_banned'] || r.emo.show(C, K);
                        },
                        H['prototype']['changeHeadEmo'] = function (C) {
                            {
                                var K = view['DesktopMgr'].Inst['seat2LocalPosition'](C);
                                this['_player_infos'][K];
                            }
                        },
                        H['prototype']['onBtnShowScoreDelta'] = function () {
                            var C = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                C['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        H['prototype']['btn_seeinfo'] = function (K) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                                var r = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](K)]['account_id'];
                                if (r) {
                                    var X = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        U = 1,
                                        i = view['DesktopMgr'].Inst['game_config'].meta;
                                    i && i['mode_id'] == game['EMatchMode']['shilian'] && (U = 4),
                                        C['UI_OtherPlayerInfo'].Inst.show(r, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, X ? 1 : 2, U);
                                }
                            }
                        },
                        H['prototype']['openDora3BeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openDora3BeginShine'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openShilianOpenBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openChuanmaBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openJiuChaoBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openAnPaiBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openZhanxingBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['openTianmingBeginEffect'] = function () {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function () {
                                    C['destory']();
                                });
                        },
                        H['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        H['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        H['prototype']['showAIEmo'] = function () {
                            for (var C = this, K = function (K) {
                                var X = view['DesktopMgr'].Inst['player_datas'][K];
                                X['account_id'] && 0 != X['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), r, function () {
                                    C['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](K), Math['floor'](9 * Math['random']()));
                                });
                            }, r = this, X = 0; X < view['DesktopMgr'].Inst['player_datas']['length']; X++)
                                K(X);
                        },
                        H['prototype']['setGapType'] = function (C, K) {
                            void 0 === K && (K = !1);
                            for (var r = 0; r < C['length']; r++) {
                                var X = view['DesktopMgr'].Inst['seat2LocalPosition'](r);
                                this['_player_infos'][X].que['visible'] = !0,
                                    K && (0 == r ? (this['_player_infos'][X].que.pos(this['gapStartPosLst'][r].x + this['selfGapOffsetX'][C[r]], this['gapStartPosLst'][r].y), this['_player_infos'][X].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][X].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][X]['que_target_pos'].x,
                                        y: this['_player_infos'][X]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][X].que.pos(this['gapStartPosLst'][r].x, this['gapStartPosLst'][r].y), this['_player_infos'][X].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][X].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][X]['que_target_pos'].x,
                                        y: this['_player_infos'][X]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][X].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + C[r] + '.png');
                            }
                        },
                        H['prototype']['OnNewCard'] = function (C, K) {
                            if (K) {
                                var r = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, r, function () {
                                        r['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function () {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        H['prototype']['ShowSpellCard'] = function (K, r) {
                            void 0 === r && (r = !1),
                                C['UI_FieldSpell'].Inst && !C['UI_FieldSpell'].Inst['enable'] && C['UI_FieldSpell'].Inst.show(K, r);
                        },
                        H['prototype']['HideSpellCard'] = function () {
                            C['UI_FieldSpell'].Inst && C['UI_FieldSpell'].Inst['close']();
                        },
                        H['prototype']['SetTianMingRate'] = function (C, K, r) {
                            void 0 === r && (r = !1);
                            var X = view['DesktopMgr'].Inst['seat2LocalPosition'](C),
                                U = this['_player_infos'][X]['tianming'];
                            r && 5 != K && U.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + K + '.png') && Laya['Tween'].to(U, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(U, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                U.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + K + '.png');
                        },
                        H.Inst = null,
                        H;
                }
                    (C['UIBase']);
            C['UI_DesktopInfo'] = N;
        }
            (uiscript || (uiscript = {}));






        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var K = this;
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (r, X) {
                    r || X['error'] ? C['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', r, X) : K['_refreshAnnouncements'](X);
                    // START
                    if ((r || X['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                    // END
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (C) {
                    for (var r = GameMgr['inDmm'] ? 'web_dmm' : 'web', X = 0, U = C['update_list']; X < U['length']; X++) {
                        var i = U[X];
                        if (i.lang == GameMgr['client_language'] && i['platform'] == r) {
                            K['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }



        uiscript.UI_Info._refreshAnnouncements = function (C) {
            // START
            C.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (C['announcements'] && (this['announcements'] = C['announcements']), C.sort && (this['announcement_sort'] = C.sort), C['read_list']) {
                this['read_list'] = [];
                for (var K = 0; K < C['read_list']['length']; K++)
                    this['read_list'].push(C['read_list'][K]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }






        // 加载CG 
        !function (C) {
            var K = function () {
                function K(K, r) {
                    var X = this;
                    this['cg_id'] = 0,
                        this.me = K,
                        this['father'] = r;
                    var U = this.me['getChildByName']('btn_detail');
                    U['clickHandler'] = new Laya['Handler'](this, function () {
                        C['UI_Bag'].Inst['locking'] || X['father']['changeLoadingCG'](X['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](U, new Laya['Handler'](this, function (K) {
                            if (!C['UI_Bag'].Inst['locking']) {
                                'down' == K ? Laya['timer'].once(800, X, function () {
                                    C['UI_CG_Yulan'].Inst.show(X['cg_id']);
                                }) : ('over' == K || 'up' == K) && Laya['timer']['clearAll'](X);
                            }
                        })),
                        this['using'] = U['getChildByName']('using'),
                        this.icon = U['getChildByName']('icon'),
                        this.name = U['getChildByName']('name'),
                        this.info = U['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = U['getChildByName']('new');
                }
                return K['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var K = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != C['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, K['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var r = !this['father']['last_seen_cg_map'][this['cg_id']], X = 0, U = K['unlock_items']; X < U['length']; X++) {
                        var i = U[X];
                        if (i && C['UI_Bag']['get_item_count'](i) > 0) {
                            var N = cfg['item_definition'].item.get(i);
                            if (this.name.text = N['name_' + GameMgr['client_language']], !N['item_expire']) {
                                this.info['visible'] = !1,
                                    r = -1 != this['father']['new_cg_ids']['indexOf'](i);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + N['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = r;
                },
                    K['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    K;
            }
                (),
                r = function () {
                    function r(K) {
                        var r = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = K,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var X = this.me['getChildByName']('choose');
                        this['label_choose_all'] = X['getChildByName']('tip'),
                            X['clickHandler'] = new Laya['Handler'](this, function () {
                                if (r['all_choosed'])
                                    C['UI_Loading']['Loading_Images'] = [];
                                else {
                                    C['UI_Loading']['Loading_Images'] = [];
                                    for (var K = 0, X = r['items']; K < X['length']; K++) {
                                        var U = X[K];
                                        C['UI_Loading']['Loading_Images'].push(U.id);
                                    }
                                }
                                r['scrollview']['wantToRefreshAll'](),
                                    r['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: C['UI_Loading']['Loading_Images']
                                //}, function (K, r) {
                                //    (K || r['error']) && C['UIMgr'].Inst['showNetReqError']('setLoadingImage', K, r);
                                //});
                                // END
                            });
                    }
                    return r['prototype']['have_redpoint'] = function () {
                        // START
                        //if (C['UI_Bag']['new_cg_ids']['length'] > 0)
                        return 0;
                        // END
                        var K = [];
                        if (!this['seen_cg_map']) {
                            var r = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, r) {
                                r = game['Tools']['dddsss'](r);
                                for (var X = r['split'](','), U = 0; U < X['length']; U++)
                                    this['seen_cg_map'][Number(X[U])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (r) {
                            r['unlock_items'][1] && 0 == C['UI_Bag']['get_item_count'](r['unlock_items'][0]) && C['UI_Bag']['get_item_count'](r['unlock_items'][1]) > 0 && K.push(r.id);
                        });
                        for (var i = 0, N = K; i < N['length']; i++) {
                            var H = N[i];
                            if (!this['seen_cg_map'][H])
                                return !0;
                        }
                        return !1;
                    },
                        r['prototype'].show = function () {
                            var K = this;
                            if (this['new_cg_ids'] = C['UI_Bag']['new_cg_ids'], C['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var r = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, r) {
                                    r = game['Tools']['dddsss'](r);
                                    for (var X = r['split'](','), U = 0; U < X['length']; U++)
                                        this['seen_cg_map'][Number(X[U])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var i = '';
                            cfg['item_definition']['loading_image']['forEach'](function (r) {
                                for (var X = 0, U = r['unlock_items']; X < U['length']; X++) {
                                    var N = U[X];
                                    if (N && C['UI_Bag']['get_item_count'](N) > 0)
                                        return K['items'].push(r), K['seen_cg_map'][r.id] = 1, '' != i && (i += ','), i += r.id, void 0;
                                }
                            }),
                                this['items'].sort(function (C, K) {
                                    return K.sort - C.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](i)),
                                C['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this.me['getChildByName']('choose')['visible'] = 0 != this['items']['length'],
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1,
                                this['refreshChooseState']();
                        },
                        r['prototype']['close'] = function () {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && C['UI_Loading']['loadNextCG']();
                        },
                        r['prototype']['render_item'] = function (C) {
                            var r = C['index'],
                                X = C['container'],
                                U = C['cache_data'];
                            if (this['items'][r]) {
                                U.item || (U.item = new K(X, this));
                                var i = U.item;
                                i['cg_id'] = this['items'][r].id,
                                    i.show();
                            }
                        },
                        r['prototype']['changeLoadingCG'] = function (K) {
                            this['_changed'] = !0;
                            for (var r = 0, X = 0, U = 0, i = this['items']; U < i['length']; U++) {
                                var N = i[U];
                                if (N.id == K) {
                                    r = X;
                                    break;
                                }
                                X++;
                            }
                            var H = C['UI_Loading']['Loading_Images']['indexOf'](K);
                            -1 == H ? C['UI_Loading']['Loading_Images'].push(K) : C['UI_Loading']['Loading_Images']['splice'](H, 1),
                                this['scrollview']['wantToRefreshItem'](r),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = C['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: C['UI_Loading']['Loading_Images']
                            //}, function (K, r) {
                            //    (K || r['error']) && C['UIMgr'].Inst['showNetReqError']('setLoadingImage', K, r);
                            //});
                            // END
                        },
                        r['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = C['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        r['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        r;
                }
                    ();
            C['UI_Bag_PageCG'] = r;
        }
            (uiscript || (uiscript = {}));




        uiscript.UI_Entrance.prototype._onLoginSuccess = function (K, r, X) {
            var C = uiscript;
            var U = this;
            if (void 0 === X && (X = !1), app.Log.log('登陆：' + JSON['stringify'](r)), GameMgr.Inst['account_id'] = r['account_id'], GameMgr.Inst['account_data'] = r['account'], C['UI_ShiMingRenZheng']['renzhenged'] = r['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, r['account']['platform_diamond'])
                for (var i = r['account']['platform_diamond'], N = 0; N < i['length']; N++)
                    GameMgr.Inst['account_numerical_resource'][i[N].id] = i[N]['count'];
            if (r['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = r['account']['skin_ticket']), r['account']['platform_skin_ticket'])
                for (var H = r['account']['platform_skin_ticket'], N = 0; N < H['length']; N++)
                    GameMgr.Inst['account_numerical_resource'][H[N].id] = H[N]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                r['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = r['game_info']['location'], GameMgr.Inst['mj_game_token'] = r['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = r['game_info']['game_uuid']),
                r['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : K['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', r['access_token']), GameMgr.Inst['sociotype'] = K, GameMgr.Inst['access_token'] = r['access_token']);
            var w = this,
                G = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        C['UI_Loading'].Inst.show('load_lobby'),
                        w['enable'] = !1,
                        w['scene']['close'](),
                        C['UI_Entrance_Mail_Regist'].Inst['close'](),
                        w['login_loading']['close'](),
                        C['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](w, function () {
                            GameMgr.Inst['afterLogin'](),
                                w['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && C['UIMgr'].Inst['ShowPreventAddiction'](),
                                w['destroy'](),
                                w['disposeRes'](),
                                C['UI_Add2Desktop'].Inst && (C['UI_Add2Desktop'].Inst['destroy'](), C['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](w, function (K) {
                            return C['UI_Loading'].Inst['setProgressVal'](0.2 * K);
                        }, null, !1));
                },
                l = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (K, r) {
                        K ? (app.Log.log('fetchRefundOrder err:' + K), U['showError'](game['Tools']['strOfLocalization'](2061), K), U['showContainerLogin']()) : (C['UI_Refund']['orders'] = r['orders'], C['UI_Refund']['clear_deadline'] = r['clear_deadline'], C['UI_Refund']['message'] = r['message'], G());
                    }) : G();
                });
            // START
            //if (C['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //   for (var R = 0, f = GameMgr.Inst['account_data']['loading_image']; R < f['length']; R++) {
            //       var A = f[R];
            //       cfg['item_definition']['loading_image'].get(A) && C['UI_Loading']['Loading_Images'].push(A);
            //   }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            C['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || r['account']['phone_verify'] ? l.run() : (C['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, C['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (K, r) {
                        K || r['error'] ? U['showError'](K, r['error']) : 0 == r['phone_login'] ? C['UI_Create_Phone_Account'].Inst.show(l) : C['UI_Canot_Create_Phone_Account'].Inst.show(l);
                    });
                })));
        }








        if (MMP.settings.antiKickout) {
            setInterval(GameMgr.Inst.clientHeatBeat, 60000);
        }
        let bf = new Blowfish(secret_key);
        let html = '<div class="modal fade" id="mmpSettings" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <h3 class="text-center">雀魂Mod_Plus设置</h3> <object id="version" style="padding-left: 0.5rem;" height="100%" data="" width="200px"></object> <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> </div> <div class="modal-body"> <ul class="list-group"> <li class="list-group-item"> <dl class="row"> <dt class="col-sm-5">自定义名称</dt> <dd class="col-sm-7"> <input id="nickname" type="text" class="form-control rounded-3" placeholder="留空则关闭该功能"> </dd> <dt class="col-sm-5">开局后自动设置指定状态</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="isSetAuto" class="form-check-input" type="checkbox" role="switch" data-bs-target="#setAuto" data-bs-toggle="collapse"> </div> <div id="setAuto" class="collapse"> <ul class="list-group"> <li class="list-group-item rounded-3"> <dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"> <dt class="col-5">自动理牌</dt> <dd class="col-7"> <div class="form-check form-switch"> <input id="setAutoLiPai" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-5">自动和了</dt> <dd class="col-7"> <div class="form-check form-switch"> <input id="setAutoHule" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-5">不吃碰杠</dt> <dd class="col-7"> <div class="form-check form-switch"> <input id="setAutoNoFulu" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-5">自动摸切</dt> <dd class="col-7"> <div class="form-check form-switch"> <input id="setAutoMoQie" class="form-check-input" type="checkbox" role="switch"> </div> </dd> </dl> </li> </ul> </div> </dd> <dt class="col-sm-5">强制打开便捷提示</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="setbianjietishi" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">获得全部道具</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="setAllItems" class="form-check-input" type="checkbox" role="switch" data-bs-target="#setItems" data-bs-toggle="collapse"> </div> <div id="setItems" class="collapse"> <ul class="list-group"> <li class="list-group-item rounded-3"> <dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"> <dt class="col-5">不需要获得的道具ID</dt> <dd class="col-7"> <textarea id="ignoreItems" class="form-control rounded-4 is-valid" placeholder="使用英文逗号分隔，留空则关闭该功能"></textarea> <div class="invalid-tooltip"> 输入有误！ </div> </dd> <dt class="col-5">不获得活动道具</dt> <dd class="col-7"> <div class="form-check form-switch"> <input id="ignoreEvent" class="form-check-input" type="checkbox" role="switch"> </div> </dd> </dl> </li> </ul> </div> </dd> <dt class="col-sm-5">随机电脑皮肤</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="randomBotSkin" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">随机默认皮肤玩家的皮肤</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="randomPlayerDefSkin" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">兼容mahjong-helper</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="sendGame" class="form-check-input" type="checkbox" role="switch" data-bs-target="#sendGameSetting" data-bs-toggle="collapse"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16" id="sendGameIcon"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path> <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path> </svg> </div> <div id="sendGameSetting" class="collapse"> <ul class="list-group"> <li class="list-group-item rounded-3"> <dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"> <dt class="col-5">接收URL</dt> <dd class="col-7"> <input id="sendGameURL" type="text" class="form-control rounded-4"> <div class="invalid-tooltip"> 输入有误！ </div> </dd> </dl> </li> </ul> </div> </dd> <dt class="col-sm-5">对查看牌谱生效</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="setPaipuChar" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">显示玩家所在服务器</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="showServer" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">反屏蔽名称与文本审查</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="antiCensorship" class="form-check-input" type="checkbox" role="switch"> </div> </dd> <dt class="col-sm-5">屏蔽挂机检测踢出游戏</dt> <dd class="col-sm-7"> <div class="form-check form-switch"> <input id="antiKickout" class="form-check-input" type="checkbox" role="switch"> </div> </dd> </dl> </li> <li class="list-group-item list-group-item-warning"> 本脚本完全免费开源，如果您是付费获得，意味着您已经被倒卖狗骗了，请立即申请退款并差评！！ <br>开源地址： <br>Github: <a href="https://github.com/Avenshy/majsoul_mod_plus" target="_blank">https://github.com/Avenshy/majsoul_mod_plus</a> <br>GreasyFork: <a href="https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus" target="_blank">https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus</a> </li> </ul> </div> <div class="modal-footer"> <button id="saveSettings" type="button" class="btn btn-success">保存</button> <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">关闭</button> </div> </div> </div> </div> <div class="modal fade" id="saveSuccess" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <h5 class="modal-title" id="staticBackdropLabel">雀魂Mod_Plus</h5> <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> </div> <div class="modal-body"> <div class="alert alert-success fade show"> <svg xmlns="http://www.w3.org/2000/svg" style="display: none;"> <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /> </symbol> </svg> <h4 class="alert-heading"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"> <use xlink:href="#check-circle-fill" /> </svg>设置保存成功！</h4> <hr /> 本脚本完全免费开源，如果您是付费获得，意味着您已经被倒卖狗骗了，请立即申请退款并差评！！ <br>开源地址： <br>Github: <a href="https://github.com/Avenshy/majsoul_mod_plus" class="alert-link" target="_blank">https://github.com/Avenshy/majsoul_mod_plus</a> <br>GreasyFork: <a href="https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus" class="alert-link" target="_blank">https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus</a> </div> </div> <div class="modal-footer"> <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button> </div> </div> </div> </div>';
        document.querySelector('body').insertAdjacentHTML('beforeend', html);
        var MMP_Settings = new bootstrap.Modal(document.querySelector('#mmpSettings'));
        var saveSuccess = new bootstrap.Modal(document.querySelector('#saveSuccess'));
        let ignoreItems = document.querySelector('#ignoreItems');
        ignoreItems.addEventListener('focus', () => { // 得到焦点
            ignoreItems.className = 'form-control rounded-3';
        });
        ignoreItems.addEventListener('blur', () => { // 失去焦点
            if (ignoreItems.value.trim() != '') {
                let temp = ignoreItems.value.trim().replace('，', ',').split(','); // 总有笨比会用中文逗号 :( 
                let items = new Array();
                for (let item of temp) {
                    let num = Number(item);
                    if (isNaN(num) == true || Number.isSafeInteger(num) == false || num <= 100000 || num > 999999) {
                        ignoreItems.className = 'form-control rounded-3 is-invalid';
                        document.querySelector('#saveSettings').disabled = true;
                        return;
                    } else {
                        items.push(String(num));
                    }
                }
                ignoreItems.className = 'form-control rounded-3 is-valid';
                ignoreItems.value = items.join(', ');
                document.querySelector('#saveSettings').disabled = false;
            } else {
                ignoreItems.className = 'form-control rounded-3 is-valid';
                document.querySelector('#saveSettings').disabled = false;
            }
        });
        new bootstrap.Popover(document.querySelector('#sendGameIcon'), {
            content: '这个选项只是用于<b>“兼容”</b>的，并不是打开选项就可以用了。\n如果你使用mahjong-helper，还需要安装<a href=\'https://github.com/Avenshy/mahjong-helper-majsoul\' target="_blank">mahjong-helper-majsoul</a>脚本，并且打开该选项。',
            trigger: 'focus',
            placement: 'top',
            html: true
        })

        function openSettings() {
            if (MMP_Settings._isShown == false && saveSuccess._isShown == false) {
                document.querySelector("#nickname").value = MMP.settings.nickname;
                document.querySelector("#isSetAuto").checked = MMP.settings.setAuto.isSetAuto;
                if (MMP.settings.setAuto.isSetAuto == true) {
                    document.querySelector("#setAuto").className = 'collapse show';
                } else {
                    document.querySelector("#setAuto").className = 'collapse';
                }
                document.querySelector("#setAutoLiPai").checked = MMP.settings.setAuto.setAutoLiPai;
                document.querySelector("#setAutoHule").checked = MMP.settings.setAuto.setAutoHule;
                document.querySelector("#setAutoNoFulu").checked = MMP.settings.setAuto.setAutoNoFulu;
                document.querySelector("#setAutoMoQie").checked = MMP.settings.setAuto.setAutoMoQie;
                document.querySelector("#setbianjietishi").checked = MMP.settings.setbianjietishi;
                document.querySelector("#setAllItems").checked = MMP.settings.setItems.setAllItems;
                if (MMP.settings.setItems.setAllItems == true) {
                    document.querySelector("#setItems").className = 'collapse show';
                } else {
                    document.querySelector("#setItems").className = 'collapse';
                }
                if (MMP.settings.setItems.ignoreItems == []) {
                    ignoreItems.value = '';
                } else {
                    ignoreItems.value = MMP.settings.setItems.ignoreItems.join(', ');
                }
                document.querySelector("#ignoreEvent").checked = MMP.settings.setItems.ignoreEvent;
                document.querySelector("#randomBotSkin").checked = MMP.settings.randomBotSkin;
                document.querySelector("#randomPlayerDefSkin").checked = MMP.settings.randomPlayerDefSkin;
                document.querySelector("#sendGame").checked = MMP.settings.sendGame;
                document.querySelector("#sendGameURL").value = MMP.settings.sendGameURL;
                if (MMP.settings.sendGame == true) {
                    document.querySelector("#sendGameSetting").className = 'collapse show';
                } else {
                    document.querySelector("#sendGameSetting").className = 'collapse';
                }
                document.querySelector("#setPaipuChar").checked = MMP.settings.setPaipuChar;
                document.querySelector("#showServer").checked = MMP.settings.showServer;
                document.querySelector("#antiCensorship").checked = MMP.settings.antiCensorship;
                document.querySelector("#antiKickout").checked = MMP.settings.antiKickout;
                MMP_Settings.show();
            }
        }

        function saveSettings_UI() {
            MMP.settings.nickname = document.querySelector("#nickname").value;
            MMP.settings.setAuto.isSetAuto = document.querySelector("#isSetAuto").checked;
            MMP.settings.setAuto.setAutoLiPai = document.querySelector("#setAutoLiPai").checked;
            MMP.settings.setAuto.setAutoHule = document.querySelector("#setAutoHule").checked;
            MMP.settings.setAuto.setAutoNoFulu = document.querySelector("#setAutoNoFulu").checked;
            MMP.settings.setAuto.setAutoMoQie = document.querySelector("#setAutoMoQie").checked;
            MMP.settings.setbianjietishi = document.querySelector("#setbianjietishi").checked;
            MMP.settings.setItems.setAllItems = document.querySelector("#setAllItems").checked;
            if (ignoreItems.value.trim() == '') {
                MMP.settings.setItems.ignoreItems = [];
            } else {
                MMP.settings.setItems.ignoreItems = ignoreItems.value.trim().split(', ');
            }
            MMP.settings.setItems.ignoreEvent = document.querySelector("#ignoreEvent").checked;
            MMP.settings.randomBotSkin = document.querySelector("#randomBotSkin").checked;
            MMP.settings.randomPlayerDefSkin = document.querySelector("#randomPlayerDefSkin").checked;
            MMP.settings.sendGame = document.querySelector("#sendGame").checked;
            MMP.settings.sendGameURL = document.querySelector("#sendGameURL").value;
            MMP.settings.setPaipuChar = document.querySelector("#setPaipuChar").checked;
            MMP.settings.showServer = document.querySelector("#showServer").checked;
            MMP.settings.antiCensorship = document.querySelector("#antiCensorship").checked;
            MMP.settings.antiKickout = document.querySelector("#antiKickout").checked;
            MMP.saveSettings();
        }
        // 防止背景变白
        document.querySelector('head').insertAdjacentHTML('beforeend', '<style>body {background-color:#000000!important;</style>');
        if (typeof GM_getResourceText === "function") {
            GM_addStyle(GM_getResourceText('bootstrap'));
        } else {
            GM_addStyle(GM_xmlhttpRequest({
                method: 'get',
                url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                onload: function (msg) {
                    GM_addStyle(msg.responseText);
                }
            }));

        }
        document.querySelector('#saveSettings').addEventListener('click', () => {
            saveSettings_UI();
            MMP_Settings.hide();
            saveSuccess.show();
        });
        document.querySelector("#version").data = "https://img.shields.io/static/v1?&label=MajsoulMod_Plus&message=v" + GM_info['script']['version'] + "&color=ff69b4";
        if (typeof GM_registerMenuCommand === "function") {
            GM_registerMenuCommand('打开设置', openSettings);
        }
        MMP.openSettings = openSettings;
        if (MMP.settings.antiCensorship == true) {
            app.Taboo.test = function () { return null };
            GameMgr.Inst.nickname_replace_enable = false;
        }
        console.log('[雀魂mod_plus] 启动完毕!!!');
        let testapi = testAPI();

        if (testapi['clear'] != true) {
            let showAPI = '';
            testapi['apis'].forEach((element) => {
                showAPI += element + ': ' + testapi['apis'][element] + '\n';
            });
            alert('[雀魂mod_plus]\n您的脚本管理器有不支持的API，可能会影响脚本使用，如果您有条件的话，请您更换对API支持较好的脚本管理器，具体请查看脚本使用说明！\n\n本脚本使用的API与支持如下：\n' + showAPI);

        }

    } catch (error) {
        console.log('[雀魂mod_plus] 等待游戏启动');
        setTimeout(majsoul_mod_plus, 1000);
    }
}
    ();
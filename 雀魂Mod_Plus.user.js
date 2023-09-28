// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.281
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
        !function (X) {
            var h;
            !function (X) {
                X[X.none = 0] = 'none',
                    X[X['daoju'] = 1] = 'daoju',
                    X[X.gift = 2] = 'gift',
                    X[X['fudai'] = 3] = 'fudai',
                    X[X.view = 5] = 'view';
            }
                (h = X['EItemCategory'] || (X['EItemCategory'] = {}));
            var c = function (c) {
                function P() {
                    var X = c.call(this, new ui['lobby']['bagUI']()) || this;
                    return X['container_top'] = null,
                        X['container_content'] = null,
                        X['locking'] = !1,
                        X.tabs = [],
                        X['page_item'] = null,
                        X['page_gift'] = null,
                        X['page_skin'] = null,
                        X['page_cg'] = null,
                        X['select_index'] = 0,
                        P.Inst = X,
                        X;
                }
                return __extends(P, c),
                    P.init = function () {
                        var X = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (h) {
                            var c = h['update'];
                            c && c.bag && (X['update_data'](c.bag['update_items']), X['update_daily_gain_data'](c.bag));
                        }, null, !1)),
                            this['fetch']();
                    },
                    P['fetch'] = function () {
                        var h = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (c, P) {
                                if (c || P['error'])
                                    X['UIMgr'].Inst['showNetReqError']('fetchBagInfo', c, P);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](P));
                                    var a = P.bag;
                                    if (a) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of a["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            h._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    h._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (a['items'])
                                                for (var I = 0; I < a['items']['length']; I++) {
                                                    var E = a['items'][I]['item_id'],
                                                        F = a['items'][I]['stack'],
                                                        b = cfg['item_definition'].item.get(E);
                                                    b && (h['_item_map'][E] = {
                                                        item_id: E,
                                                        count: F,
                                                        category: b['category']
                                                    }, 1 == b['category'] && 3 == b.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: E
                                                    }, function () { }));
                                                }
                                            if (a['daily_gain_record'])
                                                for (var f = a['daily_gain_record'], I = 0; I < f['length']; I++) {
                                                    var n = f[I]['limit_source_id'];
                                                    h['_daily_gain_record'][n] = {};
                                                    var Q = f[I]['record_time'];
                                                    h['_daily_gain_record'][n]['record_time'] = Q;
                                                    var k = f[I]['records'];
                                                    if (k)
                                                        for (var G = 0; G < k['length']; G++)
                                                            h['_daily_gain_record'][n][k[G]['item_id']] = k[G]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    P['find_item'] = function (X) {
                        var h = this['_item_map'][X];
                        return h ? {
                            item_id: h['item_id'],
                            category: h['category'],
                            count: h['count']
                        }
                            : null;
                    },
                    P['get_item_count'] = function (X) {
                        var h = this['find_item'](X);
                        if (h)
                            return h['count'];
                        if ('100001' == X) {
                            for (var c = 0, P = 0, a = GameMgr.Inst['free_diamonds']; P < a['length']; P++) {
                                var I = a[P];
                                GameMgr.Inst['account_numerical_resource'][I] && (c += GameMgr.Inst['account_numerical_resource'][I]);
                            }
                            for (var E = 0, F = GameMgr.Inst['paid_diamonds']; E < F['length']; E++) {
                                var I = F[E];
                                GameMgr.Inst['account_numerical_resource'][I] && (c += GameMgr.Inst['account_numerical_resource'][I]);
                            }
                            return c;
                        }
                        if ('100004' == X) {
                            for (var b = 0, f = 0, n = GameMgr.Inst['free_pifuquans']; f < n['length']; f++) {
                                var I = n[f];
                                GameMgr.Inst['account_numerical_resource'][I] && (b += GameMgr.Inst['account_numerical_resource'][I]);
                            }
                            for (var Q = 0, k = GameMgr.Inst['paid_pifuquans']; Q < k['length']; Q++) {
                                var I = k[Q];
                                GameMgr.Inst['account_numerical_resource'][I] && (b += GameMgr.Inst['account_numerical_resource'][I]);
                            }
                            return b;
                        }
                        return '100002' == X ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    P['find_items_by_category'] = function (X) {
                        var h = [];
                        for (var c in this['_item_map'])
                            this['_item_map'][c]['category'] == X && this['_item_map'][c]['count'] && h.push({
                                item_id: this['_item_map'][c]['item_id'],
                                category: this['_item_map'][c]['category'],
                                count: this['_item_map'][c]['count']
                            });
                        return h;
                    },
                    P['update_data'] = function (h) {
                        for (var c = 0; c < h['length']; c++) {
                            var P = h[c]['item_id'],
                                a = h[c]['stack'];
                            if (a > 0) {
                                this['_item_map']['hasOwnProperty'](P['toString']()) ? this['_item_map'][P]['count'] = a : this['_item_map'][P] = {
                                    item_id: P,
                                    count: a,
                                    category: cfg['item_definition'].item.get(P)['category']
                                };
                                var I = cfg['item_definition'].item.get(P);
                                1 == I['category'] && 3 == I.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: P
                                }, function () { }),
                                    5 == I['category'] && (this['new_bag_item_ids'].push(P), this['new_zhuangban_item_ids'][P] = 1),
                                    8 != I['category'] || I['item_expire'] || this['new_cg_ids'].push(P);
                            } else if (this['_item_map']['hasOwnProperty'](P['toString']())) {
                                var E = cfg['item_definition'].item.get(P);
                                E && 5 == E['category'] && X['UI_Sushe']['on_view_remove'](P),
                                    this['_item_map'][P] = 0,
                                    delete this['_item_map'][P];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var c = 0; c < h['length']; c++) {
                            var P = h[c]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](P['toString']()))
                                for (var F = this['_item_listener'][P], b = 0; b < F['length']; b++)
                                    F[b].run();
                        }
                        for (var c = 0; c < this['_all_item_listener']['length']; c++)
                            this['_all_item_listener'][c].run();
                    },
                    P['update_daily_gain_data'] = function (X) {
                        var h = X['update_daily_gain_record'];
                        if (h)
                            for (var c = 0; c < h['length']; c++) {
                                var P = h[c]['limit_source_id'];
                                this['_daily_gain_record'][P] || (this['_daily_gain_record'][P] = {});
                                var a = h[c]['record_time'];
                                this['_daily_gain_record'][P]['record_time'] = a;
                                var I = h[c]['records'];
                                if (I)
                                    for (var E = 0; E < I['length']; E++)
                                        this['_daily_gain_record'][P][I[E]['item_id']] = I[E]['count'];
                            }
                    },
                    P['get_item_daily_record'] = function (X, h) {
                        return this['_daily_gain_record'][X] ? this['_daily_gain_record'][X]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][X]['record_time']) ? this['_daily_gain_record'][X][h] ? this['_daily_gain_record'][X][h] : 0 : 0 : 0 : 0;
                    },
                    P['add_item_listener'] = function (X, h) {
                        this['_item_listener']['hasOwnProperty'](X['toString']()) || (this['_item_listener'][X] = []),
                            this['_item_listener'][X].push(h);
                    },
                    P['remove_item_listener'] = function (X, h) {
                        var c = this['_item_listener'][X];
                        if (c)
                            for (var P = 0; P < c['length']; P++)
                                if (c[P] === h) {
                                    c[P] = c[c['length'] - 1],
                                        c.pop();
                                    break;
                                }
                    },
                    P['add_all_item_listener'] = function (X) {
                        this['_all_item_listener'].push(X);
                    },
                    P['remove_all_item_listener'] = function (X) {
                        for (var h = this['_all_item_listener'], c = 0; c < h['length']; c++)
                            if (h[c] === X) {
                                h[c] = h[h['length'] - 1],
                                    h.pop();
                                break;
                            }
                    },
                    P['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    P['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    P['removeZhuangBanNew'] = function (X) {
                        for (var h = 0, c = X; h < c['length']; h++) {
                            var P = c[h];
                            delete this['new_zhuangban_item_ids'][P];
                        }
                    },
                    P['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    P['prototype']['onCreate'] = function () {
                        var h = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || h.hide(Laya['Handler']['create'](h, function () {
                                    return h['closeHandler'] ? (h['closeHandler'].run(), h['closeHandler'] = null, void 0) : (X['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var c = function (X) {
                            P.tabs.push(P['container_content']['getChildByName']('tabs')['getChildByName']('btn' + X)),
                                P.tabs[X]['clickHandler'] = Laya['Handler']['create'](P, function () {
                                    h['select_index'] != X && h['on_change_tab'](X);
                                }, null, !1);
                        }, P = this, a = 0; 5 > a; a++)
                            c(a);
                        this['page_item'] = new X['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new X['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new X['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new X['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    P['prototype'].show = function (h, c) {
                        var P = this;
                        void 0 === h && (h = 0),
                            void 0 === c && (c = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = c,
                            X['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            X['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                P['locking'] = !1;
                            }),
                            this['on_change_tab'](h),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    P['prototype']['onSkinYuLanBack'] = function () {
                        var h = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            X['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            X['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                h['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    P['prototype'].hide = function (h) {
                        var c = this;
                        this['locking'] = !0,
                            X['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            X['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                c['locking'] = !1,
                                    c['enable'] = !1,
                                    h && h.run();
                            });
                    },
                    P['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    P['prototype']['on_change_tab'] = function (X) {
                        this['select_index'] = X;
                        for (var c = 0; c < this.tabs['length']; c++)
                            this.tabs[c].skin = game['Tools']['localUISrc'](X == c ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[c]['getChildAt'](0)['color'] = X == c ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), X) {
                            case 0:
                                this['page_item'].show(h['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(h.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    P['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    P['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    P['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    P['_item_map'] = {},
                    P['_item_listener'] = {},
                    P['_all_item_listener'] = [],
                    P['_daily_gain_record'] = {},
                    P['new_bag_item_ids'] = [],
                    P['new_zhuangban_item_ids'] = {},
                    P['new_cg_ids'] = [],
                    P.Inst = null,
                    P;
            }
                (X['UIBase']);
            X['UI_Bag'] = c;
        }
            (uiscript || (uiscript = {}));











        // 修改牌桌上角色
        !function (X) {
            var h = function () {
                function h() {
                    var h = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = X['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (X) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(X),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(X));
                                    }
                                }));
                            }
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](X)),
                                h['loaded_player_count'] = X['ready_id_list']['length'],
                                h['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](h['loaded_player_count'], h['real_player_count']);
                        }));
                }
                return Object['defineProperty'](h, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new h() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    h['prototype']['OpenConnect'] = function (h, c, P, a) {
                        var I = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            X['Scene_Lobby'].Inst && X['Scene_Lobby'].Inst['active'] && (X['Scene_Lobby'].Inst['active'] = !1),
                            X['Scene_Huiye'].Inst && X['Scene_Huiye'].Inst['active'] && (X['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                I.url = '',
                                    I['token'] = h,
                                    I['game_uuid'] = c,
                                    I['server_location'] = P,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = P,
                                    GameMgr.Inst['mj_game_token'] = h,
                                    GameMgr.Inst['mj_game_uuid'] = c,
                                    I['playerreconnect'] = a,
                                    I['_setState'](X['EConnectState']['tryconnect']),
                                    I['load_over'] = !1,
                                    I['loaded_player_count'] = 0,
                                    I['real_player_count'] = 0,
                                    I['lb_index'] = 0,
                                    I['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    h['prototype']['reportInfo'] = function () {
                        this['connect_state'] == X['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: X['LobbyNetMgr']['root_id_lst'][X['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    h['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](X['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    h['prototype']['_OnConnent'] = function (h) {
                        app.Log.log('MJNetMgr _OnConnent event:' + h),
                            h == Laya['Event']['CLOSE'] || h == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == X['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == X['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](X['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](X['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2008)), X['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == X['EConnectState']['reconnecting'] && this['_Reconnect']()) : h == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == X['EConnectState']['tryconnect'] || this['connect_state'] == X['EConnectState']['reconnecting']) && ((this['connect_state'] = X['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](X['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    h['prototype']['_Reconnect'] = function () {
                        var h = this;
                        X['LobbyNetMgr'].Inst['connect_state'] == X['EConnectState'].none || X['LobbyNetMgr'].Inst['connect_state'] == X['EConnectState']['disconnect'] ? this['_setState'](X['EConnectState']['disconnect']) : X['LobbyNetMgr'].Inst['connect_state'] == X['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](X['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            h['connect_state'] == X['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + h['reconnect_count']), app['NetAgent']['connect2MJ'](h.url, Laya['Handler']['create'](h, h['_OnConnent'], null, !1), 'local' == h['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    h['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? X['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](X['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && X['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    h['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    h['prototype']['_fetch_gateway'] = function (h) {
                        var c = this;
                        if (X['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= X['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && X['Scene_MJ'].Inst['ForceOut'](), this['_setState'](X['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + h);
                        var P = function (P) {
                            var a = JSON['parse'](P);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + P), a['maintenance'])
                                c['_setState'](X['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && X['Scene_MJ'].Inst['ForceOut']();
                            else if (a['servers'] && a['servers']['length'] > 0) {
                                for (var I = a['servers'], E = X['Tools']['deal_gateway'](I), F = 0; F < E['length']; F++)
                                    c.urls.push({
                                        name: '___' + F,
                                        url: E[F]
                                    });
                                c['link_index'] = -1,
                                    c['_try_to_linknext']();
                            } else
                                1 > h ? Laya['timer'].once(1000, c, function () {
                                    c['_fetch_gateway'](h + 1);
                                }) : X['LobbyNetMgr'].Inst['polling_connect'] ? (c['lb_index']++, c['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](60)), c['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && X['Scene_MJ'].Inst['ForceOut'](), c['_setState'](X['EConnectState'].none));
                        },
                            a = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > h ? Laya['timer'].once(500, c, function () {
                                        c['_fetch_gateway'](h + 1);
                                    }) : X['LobbyNetMgr'].Inst['polling_connect'] ? (c['lb_index']++, c['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](58)), c['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || X['Scene_MJ'].Inst['ForceOut'](), c['_setState'](X['EConnectState'].none));
                            },
                            I = function (X) {
                                var h = new Laya['HttpRequest']();
                                h.once(Laya['Event']['COMPLETE'], c, function (X) {
                                    P(X);
                                }),
                                    h.once(Laya['Event']['ERROR'], c, function () {
                                        a();
                                    });
                                var I = [];
                                I.push('If-Modified-Since'),
                                    I.push('0'),
                                    X += '?service=ws-game-gateway',
                                    X += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    X += '&location=' + c['server_location'],
                                    X += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    h.send(X, '', 'get', 'text', I),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + X);
                            };
                        X['LobbyNetMgr'].Inst['polling_connect'] ? I(X['LobbyNetMgr'].Inst.urls[this['lb_index']]) : I(X['LobbyNetMgr'].Inst['lb_url']);
                    },
                    h['prototype']['_setState'] = function (h) {
                        this['connect_state'] = h,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (h == X['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : h == X['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : h == X['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : h == X['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : h == X['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    h['prototype']['_ConnectSuccess'] = function () {
                        var h = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (c, P) {
                                if (c || P['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', c, P), X['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](P)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        P['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(P),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(P));
                                            }
                                        });
                                    }
                                    // END
                                    var a = [],
                                        I = 0;
                                    view['DesktopMgr']['player_link_state'] = P['state_list'];
                                    var E = X['Tools']['strOfLocalization'](2003),
                                        F = P['game_config'].mode,
                                        b = view['ERuleMode']['Liqi4'];
                                    F.mode < 10 ? (b = view['ERuleMode']['Liqi4'], h['real_player_count'] = 4) : F.mode < 20 && (b = view['ERuleMode']['Liqi3'], h['real_player_count'] = 3);
                                    for (var f = 0; f < h['real_player_count']; f++)
                                        a.push(null);
                                    F['extendinfo'] && (E = X['Tools']['strOfLocalization'](2004)),
                                        F['detail_rule'] && F['detail_rule']['ai_level'] && (1 === F['detail_rule']['ai_level'] && (E = X['Tools']['strOfLocalization'](2003)), 2 === F['detail_rule']['ai_level'] && (E = X['Tools']['strOfLocalization'](2004)));
                                    for (var n = X['GameUtility']['get_default_ai_skin'](), Q = X['GameUtility']['get_default_ai_character'](), f = 0; f < P['seat_list']['length']; f++) {
                                        var k = P['seat_list'][f];
                                        if (0 == k) {
                                            a[f] = {
                                                nickname: E,
                                                avatar_id: n,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: Q,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: n,
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
                                                    a[f].avatar_id = skin.id;
                                                    a[f].character.charid = skin.character_id;
                                                    a[f].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                a[f].nickname = '[BOT]' + a[f].nickname;
                                            }
                                        } else {
                                            I++;
                                            for (var G = 0; G < P['players']['length']; G++)
                                                if (P['players'][G]['account_id'] == k) {
                                                    a[f] = P['players'][G];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (a[f].account_id == GameMgr.Inst.account_id) {
                                                        a[f].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        a[f].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        a[f].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        a[f].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        a[f].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            a[f].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (a[f].avatar_id == 400101 || a[f].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            a[f].avatar_id = skin.id;
                                                            a[f].character.charid = skin.character_id;
                                                            a[f].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(a[f].account_id);
                                                        if (server == 1) {
                                                            a[f].nickname = '[CN]' + a[f].nickname;
                                                        } else if (server == 2) {
                                                            a[f].nickname = '[JP]' + a[f].nickname;
                                                        } else if (server == 3) {
                                                            a[f].nickname = '[EN]' + a[f].nickname;
                                                        } else {
                                                            a[f].nickname = '[??]' + a[f].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var f = 0; f < h['real_player_count']; f++)
                                        null == a[f] && (a[f] = {
                                            account: 0,
                                            nickname: X['Tools']['strOfLocalization'](2010),
                                            avatar_id: n,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: Q,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: n,
                                                is_upgraded: !1
                                            }
                                        });
                                    h['loaded_player_count'] = P['ready_id_list']['length'],
                                        h['_AuthSuccess'](a, P['is_game_start'], P['game_config']['toJSON']());
                                }
                            });
                    },
                    h['prototype']['_AuthSuccess'] = function (h, c, P) {
                        var a = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (h, c) {
                                    h || c['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', h, c), X['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](c)), c['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2011)), X['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](c['game_restore'])));
                                });
                        })) : X['Scene_MJ'].Inst['openMJRoom'](P, h, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](P)), h, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](a, function () {
                                c ? Laya['timer']['frameOnce'](10, a, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (h, c) {
                                            app.Log.log('syncGame ' + JSON['stringify'](c)),
                                                h || c['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', h, c), X['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), a['_PlayerReconnectSuccess'](c));
                                        });
                                }) : Laya['timer']['frameOnce'](10, a, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (h, c) {
                                            h || c['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', h, c), X['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), a['_EnterGame'](c), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (X) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * X);
                        }, null, !1));
                    },
                    h['prototype']['_EnterGame'] = function (h) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](h)),
                            h['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2011)), X['Scene_MJ'].Inst['GameEnd']()) : h['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](h['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    h['prototype']['_PlayerReconnectSuccess'] = function (h) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](h)),
                            h['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2011)), X['Scene_MJ'].Inst['GameEnd']()) : h['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](h['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](X['Tools']['strOfLocalization'](2012)), X['Scene_MJ'].Inst['ForceOut']());
                    },
                    h['prototype']['_SendDebugInfo'] = function () { },
                    h['prototype']['OpenConnectObserve'] = function (h, c) {
                        var P = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                P['server_location'] = c,
                                    P['ob_token'] = h,
                                    P['_setState'](X['EConnectState']['tryconnect']),
                                    P['lb_index'] = 0,
                                    P['_fetch_gateway'](0);
                            });
                    },
                    h['prototype']['_ConnectSuccessOb'] = function () {
                        var h = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (c, P) {
                                c || P['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', c, P), X['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](P)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (c, P) {
                                    if (c || P['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', c, P), X['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var a = P.head,
                                            I = a['game_config'].mode,
                                            E = [],
                                            F = X['Tools']['strOfLocalization'](2003),
                                            b = view['ERuleMode']['Liqi4'];
                                        I.mode < 10 ? (b = view['ERuleMode']['Liqi4'], h['real_player_count'] = 4) : I.mode < 20 && (b = view['ERuleMode']['Liqi3'], h['real_player_count'] = 3);
                                        for (var f = 0; f < h['real_player_count']; f++)
                                            E.push(null);
                                        I['extendinfo'] && (F = X['Tools']['strOfLocalization'](2004)),
                                            I['detail_rule'] && I['detail_rule']['ai_level'] && (1 === I['detail_rule']['ai_level'] && (F = X['Tools']['strOfLocalization'](2003)), 2 === I['detail_rule']['ai_level'] && (F = X['Tools']['strOfLocalization'](2004)));
                                        for (var n = X['GameUtility']['get_default_ai_skin'](), Q = X['GameUtility']['get_default_ai_character'](), f = 0; f < a['seat_list']['length']; f++) {
                                            var k = a['seat_list'][f];
                                            if (0 == k)
                                                E[f] = {
                                                    nickname: F,
                                                    avatar_id: n,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: Q,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: n,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var G = 0; G < a['players']['length']; G++)
                                                    if (a['players'][G]['account_id'] == k) {
                                                        E[f] = a['players'][G];
                                                        break;
                                                    }
                                        }
                                        for (var f = 0; f < h['real_player_count']; f++)
                                            null == E[f] && (E[f] = {
                                                account: 0,
                                                nickname: X['Tools']['strOfLocalization'](2010),
                                                avatar_id: n,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: Q,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: n,
                                                    is_upgraded: !1
                                                }
                                            });
                                        h['_StartObSuccuess'](E, P['passed'], a['game_config']['toJSON'](), a['start_time']);
                                    }
                                }));
                            });
                    },
                    h['prototype']['_StartObSuccuess'] = function (h, c, P, a) {
                        var I = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](a, c);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), X['Scene_MJ'].Inst['openMJRoom'](P, h, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](P)), h, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](I, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, I, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](a, c);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (X) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * X);
                        }, null, !1)));
                    },
                    h['_Inst'] = null,
                    h;
            }
                ();
            X['MJNetMgr'] = h;
        }
            (game || (game = {}));









        // 读取战绩
        !function (X) {
            var h = function (h) {
                function c() {
                    var X = h.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return X['account_id'] = 0,
                        X['origin_x'] = 0,
                        X['origin_y'] = 0,
                        X.root = null,
                        X['title'] = null,
                        X['level'] = null,
                        X['btn_addfriend'] = null,
                        X['btn_report'] = null,
                        X['illust'] = null,
                        X.name = null,
                        X['detail_data'] = null,
                        X['achievement_data'] = null,
                        X['locking'] = !1,
                        X['tab_info4'] = null,
                        X['tab_info3'] = null,
                        X['tab_note'] = null,
                        X['tab_img_dark'] = '',
                        X['tab_img_chosen'] = '',
                        X['player_data'] = null,
                        X['tab_index'] = 1,
                        X['game_category'] = 1,
                        X['game_type'] = 1,
                        X['show_name'] = '',
                        c.Inst = X,
                        X;
                }
                return __extends(c, h),
                    c['prototype']['onCreate'] = function () {
                        var h = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new X['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new X['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new X['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new X['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new X['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['btn_addfriend']['visible'] = !1,
                                    h['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: h['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                X['UI_Report_Nickname'].Inst.show(h['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || h['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['close']();
                            }, null, !1),
                            this.note = new X['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || 1 != h['tab_index'] && h['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || 2 != h['tab_index'] && h['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? X['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : h['container_info']['visible'] && (h['container_info']['visible'] = !1, h['tab_info4'].skin = h['tab_img_dark'], h['tab_info3'].skin = h['tab_img_dark'], h['tab_note'].skin = h['tab_img_chosen'], h['tab_index'] = 3, h.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    c['prototype'].show = function (h, c, P, a, I) {
                        var E = this;
                        void 0 === c && (c = 1),
                            void 0 === P && (P = 2),
                            void 0 === a && (a = 1),
                            void 0 === I && (I = ''),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = h,
                            this['show_name'] = I,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            X['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                E['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: h
                            }, function (c, P) {
                                c || P['error'] ? X['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', c, P) : X['UI_Shilian']['now_season_info'] && 1001 == X['UI_Shilian']['now_season_info']['season_id'] && 3 != X['UI_Shilian']['get_cur_season_state']() ? (E['detail_data']['setData'](P), E['changeMJCategory'](E['tab_index'], E['game_category'], E['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: h
                                }, function (h, c) {
                                    h || c['error'] ? X['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', h, c) : (P['season_info'] = c['season_info'], E['detail_data']['setData'](P), E['changeMJCategory'](E['tab_index'], E['game_category'], E['game_type']));
                                });
                            }),
                            this.note['init_data'](h),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = h != GameMgr.Inst['account_id'],
                            this['tab_index'] = c,
                            this['game_category'] = P,
                            this['game_type'] = a,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    c['prototype']['refreshBaseInfo'] = function () {
                        var h = this;
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
                            }, function (c, P) {
                                if (c || P['error'])
                                    X['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', c, P);
                                else {
                                    var a = P['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (a.account_id == GameMgr.Inst.account_id) {
                                        a.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            a.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            a.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    h['player_data'] = a,
                                        h['account_id'] != GameMgr.Inst['account_id'] && h['show_name'] && (a['nickname'] = h['show_name']),
                                        game['Tools']['SetNickname'](h.name, a, !1, !!h['show_name']),
                                        h['title'].id = game['Tools']['titleLocalization'](a['account_id'], a['title']),
                                        h['level'].id = a['level'].id,
                                        h['level'].id = h['player_data'][1 == h['tab_index'] ? 'level' : 'level3'].id,
                                        h['level'].exp = h['player_data'][1 == h['tab_index'] ? 'level' : 'level3']['score'],
                                        h['illust'].me['visible'] = !0,
                                        h['account_id'] == GameMgr.Inst['account_id'] ? h['illust']['setSkin'](a['avatar_id'], 'waitingroom') : h['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](a['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], h['account_id']) && h['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(h['account_id']) ? (h['btn_addfriend']['visible'] = !0, h['btn_report'].x = 520) : (h['btn_addfriend']['visible'] = !1, h['btn_report'].x = 343),
                                        h.note.sign['setSign'](a['signature']),
                                        h['achievement_data'].show(!1, a['achievement_count']);
                                }
                            });
                    },
                    c['prototype']['changeMJCategory'] = function (X, h, c) {
                        void 0 === h && (h = 2),
                            void 0 === c && (c = 1),
                            this['tab_index'] = X,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](X, h, c),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    c['prototype']['close'] = function () {
                        var h = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), X['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            h['locking'] = !1,
                                h['enable'] = !1;
                        }))));
                    },
                    c['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                    },
                    c['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                            this['detail_data']['close'](),
                            this['illust']['clear'](),
                            Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                    },
                    c.Inst = null,
                    c;
            }
                (X['UIBase']);
            X['UI_OtherPlayerInfo'] = h;
        }
            (uiscript || (uiscript = {}));










        // 宿舍相关
        !function (X) {
            var h = function () {
                function h(h, P) {
                    var a = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = h,
                        this['container_illust'] = P,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = h['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            a['during_move'] = !0,
                                a['mouse_start_x'] = a['container_move']['mouseX'],
                                a['mouse_start_y'] = a['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            a['during_move'] && (a.move(a['container_move']['mouseX'] - a['mouse_start_x'], a['container_move']['mouseY'] - a['mouse_start_y']), a['mouse_start_x'] = a['container_move']['mouseX'], a['mouse_start_y'] = a['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            a['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            a['during_move'] = !1;
                        }),
                        this['btn_close'] = h['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            a['locking'] || a['close']();
                        }, null, !1),
                        this['scrollbar'] = h['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (X) {
                            a['_scale'] = 1 * (1 - X) + 0.5,
                                a['illust']['scaleX'] = a['_scale'],
                                a['illust']['scaleY'] = a['_scale'],
                                a['scrollbar']['setVal'](X, 0);
                        })),
                        this['dongtai_kaiguan'] = new X['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            c.Inst['illust']['resetSkin']();
                        }), new Laya['Handler'](this, function (X) {
                            c.Inst['illust']['playAnim'](X);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](h['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (X) {
                        this['_scale'] = X,
                            this['scrollbar']['setVal'](1 - (X - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    h['prototype'].show = function (h) {
                        var P = this;
                        this['locking'] = !0,
                            this['when_close'] = h,
                            this['illust_start_x'] = this['illust'].x,
                            this['illust_start_y'] = this['illust'].y,
                            this['illust_center_x'] = this['illust'].x + 984 - 446,
                            this['illust_center_y'] = this['illust'].y + 11 - 84,
                            this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                            this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                            this['container_illust']['getChildByName']('btn')['visible'] = !1,
                            c.Inst['stopsay'](),
                            this['scale'] = 1,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_center_x'],
                                y: this['illust_center_y']
                            }, 200),
                            X['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                P['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](c.Inst['illust']['skin_id']);
                    },
                    h['prototype']['close'] = function () {
                        var h = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            X['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                h['locking'] = !1,
                                    h.me['visible'] = !1,
                                    h['when_close'].run();
                            });
                    },
                    h['prototype'].move = function (X, h) {
                        var c = this['illust'].x + X,
                            P = this['illust'].y + h;
                        c < this['illust_center_x'] - 600 ? c = this['illust_center_x'] - 600 : c > this['illust_center_x'] + 600 && (c = this['illust_center_x'] + 600),
                            P < this['illust_center_y'] - 1200 ? P = this['illust_center_y'] - 1200 : P > this['illust_center_y'] + 800 && (P = this['illust_center_y'] + 800),
                            this['illust'].x = c,
                            this['illust'].y = P;
                    },
                    h;
            }
                (),
                c = function (c) {
                    function P() {
                        var X = c.call(this, new ui['lobby']['susheUI']()) || this;
                        return X['contianer_illust'] = null,
                            X['illust'] = null,
                            X['illust_rect'] = null,
                            X['container_name'] = null,
                            X['label_name'] = null,
                            X['label_cv'] = null,
                            X['label_cv_title'] = null,
                            X['container_page'] = null,
                            X['container_look_illust'] = null,
                            X['page_select_character'] = null,
                            X['page_visit_character'] = null,
                            X['origin_illust_x'] = 0,
                            X['chat_id'] = 0,
                            X['container_chat'] = null,
                            X['_select_index'] = 0,
                            X['sound_id'] = null,
                            X['chat_block'] = null,
                            X['illust_showing'] = !0,
                            P.Inst = X,
                            X;
                    }
                    return __extends(P, c),
                        P['onMainSkinChange'] = function () {
                            var X = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            X && X['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](X.path) + '/spine');
                        },
                        P['randomDesktopID'] = function () {
                            var h = X['UI_Sushe']['commonViewList'][X['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), h)
                                for (var c = 0; c < h['length']; c++)
                                    h[c].slot == game['EView'].mjp ? this['now_mjp_id'] = h[c].type ? h[c]['item_id_list'][Math['floor'](Math['random']() * h[c]['item_id_list']['length'])] : h[c]['item_id'] : h[c].slot == game['EView']['desktop'] ? this['now_desktop_id'] = h[c].type ? h[c]['item_id_list'][Math['floor'](Math['random']() * h[c]['item_id_list']['length'])] : h[c]['item_id'] : h[c].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = h[c].type ? h[c]['item_id_list'][Math['floor'](Math['random']() * h[c]['item_id_list']['length'])] : h[c]['item_id']);
                        },
                        P.init = function (h) {
                            var c = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (a, I) {
                                if (a || I['error'])
                                    X['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', a, I);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](I)), I = JSON['parse'](JSON['stringify'](I)), I['main_character_id'] && I['characters']) {
                                        //if (c['characters'] = [], I['characters'])
                                        //    for (var E = 0; E < I['characters']['length']; E++)
                                        //        c['characters'].push(I['characters'][E]);
                                        //if (c['skin_map'] = {}, I['skins'])
                                        //    for (var E = 0; E < I['skins']['length']; E++)
                                        //        c['skin_map'][I['skins'][E]] = 1;
                                        //c['main_character_id'] = I['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = I.main_character_id;
                                        for (let count = 0; count < I.characters.length; count++) {
                                            if (I.characters[count].charid == I.main_character_id) {
                                                if (I.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = I.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = I.skins[count];
                                                fake_data.exp = I.characters[count].exp;
                                                fake_data.level = I.characters[count].level;
                                                fake_data.is_upgraded = I.characters[count].is_upgraded;
                                                break;
                                            }
                                        }
                                        c.characters = [];

                                        for (let count = 1; count <= cfg.item_definition.character['rows_'].length; count++) {
                                            let id = 200000 + count;
                                            let skin = 400001 + count * 100;
                                            let emoji = [];
                                            cfg.character.emoji.getGroup(id).forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            c.characters.push({
                                                charid: id,
                                                level: 5,
                                                exp: 0,
                                                skin: skin,
                                                is_upgraded: true,
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
                                        c.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        c.star_chars = MMP.settings.star_chars;
                                        I.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        c['characters'] = [], c['characters'].push({
                                            charid: '200001',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400101',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), c['characters'].push({
                                            charid: '200002',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400201',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), c['skin_map']['400101'] = 1, c['skin_map']['400201'] = 1, c['main_character_id'] = '200001';
                                    if (c['send_gift_count'] = 0, c['send_gift_limit'] = 0, I['send_gift_count'] && (c['send_gift_count'] = I['send_gift_count']), I['send_gift_limit'] && (c['send_gift_limit'] = I['send_gift_limit']), I['finished_endings'])
                                        for (var E = 0; E < I['finished_endings']['length']; E++)
                                            c['finished_endings_map'][I['finished_endings'][E]] = 1;
                                    if (I['rewarded_endings'])
                                        for (var E = 0; E < I['rewarded_endings']['length']; E++)
                                            c['rewarded_endings_map'][I['rewarded_endings'][E]] = 1;
                                    if (c['star_chars'] = [], I['character_sort'] && (c['star_chars'] = I['character_sort']), P['hidden_characters_map'] = {}, I['hidden_characters'])
                                        for (var F = 0, b = I['hidden_characters']; F < b['length']; F++) {
                                            var f = b[F];
                                            P['hidden_characters_map'][f] = 1;
                                        }
                                    h.run();
                                }
                            }),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (h, P) {
                                    if (h || P['error'])
                                        X['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', h, P);
                                    else {
                                        c['using_commonview_index'] = P.use,
                                            c['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                        var a = P['views'];
                                        if (a)
                                            for (var I = 0; I < a['length']; I++) {
                                                var E = a[I]['values'];
                                                E && (c['commonViewList'][a[I]['index']] = E);
                                            }
                                        c['randomDesktopID'](),
                                            GameMgr.Inst['load_mjp_view'](),
                                            GameMgr.Inst['load_touming_mjp_view']();
                                    }
                                });
                        },
                        P['on_data_updata'] = function (h) {
                            if (h['character']) {
                                var c = JSON['parse'](JSON['stringify'](h['character']));
                                if (c['characters'])
                                    for (var P = c['characters'], a = 0; a < P['length']; a++) {
                                        for (var I = !1, E = 0; E < this['characters']['length']; E++)
                                            if (this['characters'][E]['charid'] == P[a]['charid']) {
                                                this['characters'][E] = P[a],
                                                    X['UI_Sushe_Visit'].Inst && X['UI_Sushe_Visit'].Inst['chara_info'] && X['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][E]['charid'] && (X['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][E]),
                                                    I = !0;
                                                break;
                                            }
                                        I || this['characters'].push(P[a]);
                                    }
                                if (c['skins'])
                                    for (var F = c['skins'], a = 0; a < F['length']; a++)
                                        this['skin_map'][F[a]] = 1;
                                if (c['finished_endings']) {
                                    for (var b = c['finished_endings'], a = 0; a < b['length']; a++)
                                        this['finished_endings_map'][b[a]] = 1;
                                    X['UI_Sushe_Visit'].Inst;
                                }
                                if (c['rewarded_endings']) {
                                    for (var b = c['rewarded_endings'], a = 0; a < b['length']; a++)
                                        this['rewarded_endings_map'][b[a]] = 1;
                                    X['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        P['chara_owned'] = function (X) {
                            for (var h = 0; h < this['characters']['length']; h++)
                                if (this['characters'][h]['charid'] == X)
                                    return !0;
                            return !1;
                        },
                        P['skin_owned'] = function (X) {
                            return this['skin_map']['hasOwnProperty'](X['toString']());
                        },
                        P['add_skin'] = function (X) {
                            this['skin_map'][X] = 1;
                        },
                        Object['defineProperty'](P, 'main_chara_info', {
                            get: function () {
                                for (var X = 0; X < this['characters']['length']; X++)
                                    if (this['characters'][X]['charid'] == this['main_character_id'])
                                        return this['characters'][X];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        P['on_view_remove'] = function (X) {
                            for (var h = 0; h < this['commonViewList']['length']; h++)
                                for (var c = this['commonViewList'][h], P = 0; P < c['length']; P++)
                                    if (c[P]['item_id'] == X && (c[P]['item_id'] = game['GameUtility']['get_view_default_item_id'](c[P].slot)), c[P]['item_id_list']) {
                                        for (var a = 0; a < c[P]['item_id_list']['length']; a++)
                                            if (c[P]['item_id_list'][a] == X) {
                                                c[P]['item_id_list']['splice'](a, 1);
                                                break;
                                            }
                                        0 == c[P]['item_id_list']['length'] && (c[P].type = 0);
                                    }
                            var I = cfg['item_definition'].item.get(X);
                            I.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == X && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        P['add_finish_ending'] = function (X) {
                            this['finished_endings_map'][X] = 1;
                        },
                        P['add_reward_ending'] = function (X) {
                            this['rewarded_endings_map'][X] = 1;
                        },
                        P['check_all_char_repoint'] = function () {
                            for (var X = 0; X < P['characters']['length']; X++)
                                if (this['check_char_redpoint'](P['characters'][X]))
                                    return !0;
                            return !1;
                        },
                        P['check_char_redpoint'] = function (X) {
                            if (P['hidden_characters_map'][X['charid']])
                                return !1;
                            var h = cfg.spot.spot['getGroup'](X['charid']);
                            if (h)
                                for (var c = 0; c < h['length']; c++) {
                                    var a = h[c];
                                    if (!(a['is_married'] && !X['is_upgraded'] || !a['is_married'] && X['level'] < a['level_limit']) && 2 == a.type) {
                                        for (var I = !0, E = 0; E < a['jieju']['length']; E++)
                                            if (a['jieju'][E] && P['finished_endings_map'][a['jieju'][E]]) {
                                                if (!P['rewarded_endings_map'][a['jieju'][E]])
                                                    return !0;
                                                I = !1;
                                            }
                                        if (I)
                                            return !0;
                                    }
                                }
                            var F = cfg['item_definition']['character'].get(X['charid']);
                            if (F.ur)
                                for (var b = cfg['level_definition']['character']['getGroup'](X['charid']), f = 1, n = 0, Q = b; n < Q['length']; n++) {
                                    var k = Q[n];
                                    if (f > X['level'])
                                        return;
                                    if (k['reward'] && (!X['rewarded_level'] || -1 == X['rewarded_level']['indexOf'](f)))
                                        return !0;
                                    f++;
                                }
                            return !1;
                        },
                        P['is_char_star'] = function (X) {
                            return -1 != this['star_chars']['indexOf'](X);
                        },
                        P['change_char_star'] = function (X) {
                            var h = this['star_chars']['indexOf'](X);
                            -1 != h ? this['star_chars']['splice'](h, 1) : this['star_chars'].push(X),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                                    sort: this['star_chars']
                                }, function () { });
                        },
                        Object['defineProperty'](P['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        P['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        P['prototype']['onCreate'] = function () {
                            var c = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new X['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = X['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new X['UI_Character_Chat'](this['container_chat'], !0),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!c['page_visit_character'].me['visible'] || !c['page_visit_character']['cannot_click_say'])
                                        if (c['illust']['onClick'](), c['sound_id'])
                                            c['stopsay']();
                                        else {
                                            if (!c['illust_showing'])
                                                return;
                                            c.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new X['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new X['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new h(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        P['prototype'].show = function (h) {
                            X['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var c = 0, a = 0; a < P['characters']['length']; a++)
                                if (P['characters'][a]['charid'] == P['main_character_id']) {
                                    c = a;
                                    break;
                                }
                            0 == h ? (this['change_select'](c), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        P['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](P['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        P['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(P['characters'][this['_select_index']], 2);
                        },
                        P['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                X['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        P['prototype']['close'] = function (h) {
                            var c = this;
                            this['illust_showing'] && X['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    c['enable'] = !1,
                                        h && h.run();
                                });
                        },
                        P['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        P['prototype']['hide_illust'] = function () {
                            var h = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, X['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                h['contianer_illust']['visible'] = !1;
                            })));
                        },
                        P['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, X['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var h = 0, c = 0; c < P['characters']['length']; c++)
                                        if (P['characters'][c]['charid'] == P['main_character_id']) {
                                            h = c;
                                            break;
                                        }
                                    this['change_select'](h);
                                }
                        },
                        P['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        P['prototype']['show_page_visit'] = function (X) {
                            void 0 === X && (X = 0),
                                this['page_visit_character'].show(P['characters'][this['_select_index']], X);
                        },
                        P['prototype']['change_select'] = function (h) {
                            this['_select_index'] = h,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var c = P['characters'][h],
                                a = cfg['item_definition']['character'].get(c['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != P['chs_fengyu_name_lst']['indexOf'](c['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != P['chs_fengyu_cv_lst']['indexOf'](c['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = a['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = a['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV';
                                var I = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : I.test(a['name_' + GameMgr['client_language']]) ? -15 : 0,
                                    this['label_cv']['leading'] = I.test(this['label_cv'].text) ? -7 : 0;
                            } else
                                this['label_name'].text = a['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + a['desc_cv_' + GameMgr['client_language']];
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var E = new X['UIRect']();
                            E.x = this['illust_rect'].x,
                                E.y = this['illust_rect'].y,
                                E['width'] = this['illust_rect']['width'],
                                E['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](E),
                                this['illust']['setSkin'](c.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                X['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var F = cfg['item_definition'].skin.get(c.skin);
                            F['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        P['prototype']['onChangeSkin'] = function (X) {
                            P['characters'][this['_select_index']].skin = X,
                                this['change_select'](this['_select_index']),
                                P['characters'][this['_select_index']]['charid'] == P['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = X, P['onMainSkinChange']()),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    character_id: P['characters'][this['_select_index']]['charid'],
                                    skin: X
                                }, function () { });
                        },
                        P['prototype'].say = function (X) {
                            var h = this,
                                c = P['characters'][this['_select_index']];
                            this['chat_id']++;
                            var a = this['chat_id'],
                                I = view['AudioMgr']['PlayCharactorSound'](c, X, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, h, function () {
                                        a == h['chat_id'] && h['stopsay']();
                                    });
                                }));
                            I && (this['chat_block'].show(I['words']), this['sound_id'] = I['audio_id']);
                        },
                        P['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                        },
                        P['prototype']['to_look_illust'] = function () {
                            var X = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                X['illust']['playAnim']('idle'),
                                    X['page_select_character'].show(0);
                            }));
                        },
                        P['prototype']['jump_to_char_skin'] = function (h, c) {
                            var a = this;
                            if (void 0 === h && (h = -1), void 0 === c && (c = null), h >= 0)
                                for (var I = 0; I < P['characters']['length']; I++)
                                    if (P['characters'][I]['charid'] == h) {
                                        this['change_select'](I);
                                        break;
                                    }
                            X['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                P.Inst['show_page_visit'](),
                                    a['page_visit_character']['show_pop_skin'](),
                                    a['page_visit_character']['set_jump_callback'](c);
                            }));
                        },
                        P['prototype']['jump_to_char_qiyue'] = function (h) {
                            var c = this;
                            if (void 0 === h && (h = -1), h >= 0)
                                for (var a = 0; a < P['characters']['length']; a++)
                                    if (P['characters'][a]['charid'] == h) {
                                        this['change_select'](a);
                                        break;
                                    }
                            X['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                P.Inst['show_page_visit'](),
                                    c['page_visit_character']['show_qiyue']();
                            }));
                        },
                        P['prototype']['jump_to_char_gift'] = function (h) {
                            var c = this;
                            if (void 0 === h && (h = -1), h >= 0)
                                for (var a = 0; a < P['characters']['length']; a++)
                                    if (P['characters'][a]['charid'] == h) {
                                        this['change_select'](a);
                                        break;
                                    }
                            X['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                P.Inst['show_page_visit'](),
                                    c['page_visit_character']['show_gift']();
                            }));
                        },
                        P['characters'] = [],
                        P['chs_fengyu_name_lst'] = ['200040', '200043'],
                        P['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        P['skin_map'] = {},
                        P['main_character_id'] = 0,
                        P['send_gift_count'] = 0,
                        P['send_gift_limit'] = 0,
                        P['commonViewList'] = [],
                        P['using_commonview_index'] = 0,
                        P['finished_endings_map'] = {},
                        P['rewarded_endings_map'] = {},
                        P['star_chars'] = [],
                        P['hidden_characters_map'] = {},
                        P.Inst = null,
                        P;
                }
                    (X['UIBase']);
            X['UI_Sushe'] = c;
        }
            (uiscript || (uiscript = {}));










        // 屏蔽改变宿舍角色的网络请求
        !function (X) {
            var h = function () {
                function h(h) {
                    var P = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = h,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c.Inst['locking'] || c.Inst['close'](Laya['Handler']['create'](P, function () {
                                X['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c.Inst['locking'] || c.Inst['close'](Laya['Handler']['create'](P, function () {
                                X['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c.Inst['locking'] || X['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c.Inst['locking'] || P['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new X['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            X['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return h['prototype'].show = function (h, c) {
                    if (void 0 === c && (c = !1), this.me['visible'] = !0, h ? this.me['alpha'] = 1 : X['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), c || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var P = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, P));
                    }
                },
                    h['prototype']['render_character_cell'] = function (h) {
                        var c = this,
                            P = h['index'],
                            a = h['container'],
                            I = h['cache_data'];
                        a['visible'] = !0,
                            I['index'] = P,
                            I['inited'] || (I['inited'] = !0, a['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                c['onClickAtHead'](I['index']);
                            }), I.skin = new X['UI_Character_Skin'](a['getChildByName']('btn')['getChildByName']('head')), I.bg = a['getChildByName']('btn')['getChildByName']('bg'), I['bound'] = a['getChildByName']('btn')['getChildByName']('bound'), I['btn_star'] = a['getChildByName']('btn_star'), I.star = a['getChildByName']('btn')['getChildByName']('star'), I['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                c['onClickAtStar'](I['index']);
                            }));
                        var E = a['getChildByName']('btn');
                        E['getChildByName']('choose')['visible'] = P == this['select_index'];
                        var F = this['getCharInfoByIndex'](P);
                        E['getChildByName']('redpoint')['visible'] = X['UI_Sushe']['check_char_redpoint'](F),
                            I.skin['setSkin'](F.skin, 'bighead'),
                            E['getChildByName']('using')['visible'] = F['charid'] == X['UI_Sushe']['main_character_id'],
                            a['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (F['is_upgraded'] ? '2.png' : '.png'));
                        var b = cfg['item_definition']['character'].get(F['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? I['bound'].skin = b.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (F['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (F['is_upgraded'] ? '2.png' : '.png')) : b.ur ? (I['bound'].pos(-10, -2), I['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (F['is_upgraded'] ? '6.png' : '5.png'))) : (I['bound'].pos(4, 20), I['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (F['is_upgraded'] ? '4.png' : '3.png'))),
                            I['btn_star']['visible'] = this['select_index'] == P,
                            I.star['visible'] = X['UI_Sushe']['is_char_star'](F['charid']) || this['select_index'] == P;
                        var f = cfg['item_definition']['character'].find(F['charid']),
                            n = E['getChildByName']('label_name'),
                            Q = f['name_' + GameMgr['client_language'] + '2'] ? f['name_' + GameMgr['client_language'] + '2'] : f['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            I.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (X['UI_Sushe']['is_char_star'](F['charid']) ? 'l' : 'd') + (F['is_upgraded'] ? '1.png' : '.png')),
                                n.text = Q['replace']('-', '|')['replace'](/\./g, '·');
                            var k = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            n['leading'] = k.test(Q) ? -15 : 0;
                        } else
                            I.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (X['UI_Sushe']['is_char_star'](F['charid']) ? 'l.png' : 'd.png')), n.text = Q;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == F['charid'] ? (n['scaleX'] = 0.67, n['scaleY'] = 0.57) : (n['scaleX'] = 0.7, n['scaleY'] = 0.6));
                    },
                    h['prototype']['onClickAtHead'] = function (h) {
                        if (this['select_index'] == h) {
                            var c = this['getCharInfoByIndex'](h);
                            if (c['charid'] != X['UI_Sushe']['main_character_id'])
                                if (X['UI_PiPeiYuYue'].Inst['enable'])
                                    X['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var P = X['UI_Sushe']['main_character_id'];
                                    X['UI_Sushe']['main_character_id'] = c['charid'],
                                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //    character_id: X['UI_Sushe']['main_character_id']
                                        //}, function () {}),
                                        GameMgr.Inst['account_data']['avatar_id'] = c.skin,
                                        X['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = c.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = c.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var a = 0; a < this['show_index_list']['length']; a++)
                                        this['getCharInfoByIndex'](a)['charid'] == P && this['scrollview']['wantToRefreshItem'](a);
                                    this['scrollview']['wantToRefreshItem'](h);
                                }
                        } else {
                            var I = this['select_index'];
                            this['select_index'] = h,
                                I >= 0 && this['scrollview']['wantToRefreshItem'](I),
                                this['scrollview']['wantToRefreshItem'](h),
                                X['UI_Sushe'].Inst['change_select'](this['show_index_list'][h]);
                        }
                    },
                    h['prototype']['onClickAtStar'] = function (h) {
                        if (X['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](h)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](h);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var c = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, c));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    h['prototype']['close'] = function (h) {
                        var c = this;
                        this.me['visible'] && (h ? this.me['visible'] = !1 : X['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            c.me['visible'] = !1;
                        })));
                    },
                    h['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var h = !1, c = 0, P = X['UI_Sushe']['star_chars']; c < P['length']; c++) {
                                var a = P[c];
                                if (!X['UI_Sushe']['hidden_characters_map'][a]) {
                                    h = !0;
                                    break;
                                }
                            }
                            if (!h)
                                return X['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        X['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var I = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](I),
                            Laya['Tween'].to(I, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    h['prototype']['getShowStarState'] = function () {
                        if (0 == X['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var h = 0, c = X['UI_Sushe']['star_chars']; h < c['length']; h++) {
                                var P = c[h];
                                if (!X['UI_Sushe']['hidden_characters_map'][P])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    h['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var h = 0, c = X['UI_Sushe']['star_chars']; h < c['length']; h++) {
                            var P = c[h];
                            if (!X['UI_Sushe']['hidden_characters_map'][P])
                                for (var a = 0; a < X['UI_Sushe']['characters']['length']; a++)
                                    if (X['UI_Sushe']['characters'][a]['charid'] == P) {
                                        a == X['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(a);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var a = 0; a < X['UI_Sushe']['characters']['length']; a++)
                                X['UI_Sushe']['hidden_characters_map'][X['UI_Sushe']['characters'][a]['charid']] || -1 == this['show_index_list']['indexOf'](a) && (a == X['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(a));
                    },
                    h['prototype']['getCharInfoByIndex'] = function (h) {
                        return X['UI_Sushe']['characters'][this['show_index_list'][h]];
                    },
                    h;
            }
                (),
                c = function (c) {
                    function P() {
                        var X = c.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return X['bg_width_head'] = 962,
                            X['bg_width_zhuangban'] = 1819,
                            X['bg2_delta'] = -29,
                            X['container_top'] = null,
                            X['locking'] = !1,
                            X.tabs = [],
                            X['tab_index'] = 0,
                            P.Inst = X,
                            X;
                    }
                    return __extends(P, c),
                        P['prototype']['onCreate'] = function () {
                            var c = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    c['locking'] || (1 == c['tab_index'] && c['container_zhuangban']['changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](c, function () {
                                        c['close'](),
                                            X['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (c['close'](), X['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var P = this.root['getChildByName']('container_tabs'), a = function (h) {
                                I.tabs.push(P['getChildAt'](h)),
                                    I.tabs[h]['clickHandler'] = new Laya['Handler'](I, function () {
                                        c['locking'] || c['tab_index'] != h && (1 == c['tab_index'] && c['container_zhuangban']['changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](c, function () {
                                            c['change_tab'](h);
                                        }), null) : c['change_tab'](h));
                                    });
                            }, I = this, E = 0; E < P['numChildren']; E++)
                                a(E);
                            this['container_head'] = new h(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new X['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return c['locking'];
                                }));
                        },
                        P['prototype'].show = function (h) {
                            var c = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = h,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), X['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), X['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), X['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), X['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    c['locking'] = !1;
                                });
                            for (var P = 0; P < this.tabs['length']; P++) {
                                var a = this.tabs[P];
                                a.skin = game['Tools']['localUISrc'](P == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var I = a['getChildByName']('word');
                                I['color'] = P == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    I['scaleX'] = I['scaleY'] = P == this['tab_index'] ? 1.1 : 1,
                                    P == this['tab_index'] && a['parent']['setChildIndex'](a, this.tabs['length'] - 1);
                            }
                        },
                        P['prototype']['change_tab'] = function (h) {
                            var c = this;
                            this['tab_index'] = h;
                            for (var P = 0; P < this.tabs['length']; P++) {
                                var a = this.tabs[P];
                                a.skin = game['Tools']['localUISrc'](P == h ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var I = a['getChildByName']('word');
                                I['color'] = P == h ? '#552c1c' : '#d3a86c',
                                    I['scaleX'] = I['scaleY'] = P == h ? 1.1 : 1,
                                    P == h && a['parent']['setChildIndex'](a, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    X['UI_Sushe'].Inst['open_illust'](),
                                        c['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), X['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    c['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function () {
                                    c['locking'] = !1;
                                });
                        },
                        P['prototype']['close'] = function (h) {
                            var c = this;
                            this['locking'] = !0,
                                X['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? X['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    c['container_head']['close'](!0);
                                })) : X['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    c['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    c['locking'] = !1,
                                        c['enable'] = !1,
                                        h && h.run();
                                });
                        },
                        P['prototype']['onDisable'] = function () {
                            for (var h = 0; h < X['UI_Sushe']['characters']['length']; h++) {
                                var c = X['UI_Sushe']['characters'][h].skin,
                                    P = cfg['item_definition'].skin.get(c);
                                P && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](P.path + '/bighead.png'));
                            }
                        },
                        P['prototype']['changeKaiguanShow'] = function (X) {
                            X ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        P['prototype']['changeZhuangbanSlot'] = function (X) {
                            this['container_zhuangban']['changeSlotByItemId'](X);
                        },
                        P;
                }
                    (X['UIBase']);
            X['UI_Sushe_Select'] = c;
        }
            (uiscript || (uiscript = {}));








        // 友人房
        !function (X) {
            var h = function () {
                function h(X) {
                    var h = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = X,
                        this.me['visible'] = !1,
                        this['blackbg'] = X['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            h['locking'] || h['close']();
                        }, null, !1),
                        this.root = X['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return h['prototype'].show = function () {
                    var h = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var c = game['FriendMgr']['friend_list'], P = 0; P < c['length']; P++)
                        this['sortlist'].push(P);
                    this['sortlist'] = this['sortlist'].sort(function (X, h) {
                        var P = c[X],
                            a = 0;
                        if (P['state']['is_online']) {
                            var I = game['Tools']['playState2Desc'](P['state']['playing']);
                            a += '' != I ? 30000000000 : 60000000000,
                                P.base['level'] && (a += P.base['level'].id % 1000 * 10000000),
                                P.base['level3'] && (a += P.base['level3'].id % 1000 * 10000),
                                a += -Math['floor'](P['state']['login_time'] / 10000000);
                        } else
                            a += P['state']['logout_time'];
                        var E = c[h],
                            F = 0;
                        if (E['state']['is_online']) {
                            var I = game['Tools']['playState2Desc'](E['state']['playing']);
                            F += '' != I ? 30000000000 : 60000000000,
                                E.base['level'] && (F += E.base['level'].id % 1000 * 10000000),
                                E.base['level3'] && (F += E.base['level3'].id % 1000 * 10000),
                                F += -Math['floor'](E['state']['login_time'] / 10000000);
                        } else
                            F += E['state']['logout_time'];
                        return F - a;
                    });
                    for (var P = 0; P < c['length']; P++)
                        this['friends'].push({
                            f: c[P],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        X['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            h['locking'] = !1;
                        }));
                },
                    h['prototype']['close'] = function () {
                        var h = this;
                        this['locking'] = !0,
                            X['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                h['locking'] = !1,
                                    h.me['visible'] = !1;
                            }));
                    },
                    h['prototype']['render_item'] = function (h) {
                        var c = h['index'],
                            P = h['container'],
                            I = h['cache_data'];
                        I.head || (I.head = new X['UI_Head'](P['getChildByName']('head'), 'UI_WaitingRoom'), I.name = P['getChildByName']('name'), I['state'] = P['getChildByName']('label_state'), I.btn = P['getChildByName']('btn_invite'), I['invited'] = P['getChildByName']('invited'));
                        var E = this['friends'][this['sortlist'][c]];
                        I.head.id = game['GameUtility']['get_limited_skin_id'](E.f.base['avatar_id']),
                            I.head['set_head_frame'](E.f.base['account_id'], E.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](I.name, E.f.base, GameMgr.Inst['hide_nickname']);
                        var F = !1;
                        if (E.f['state']['is_online']) {
                            var b = game['Tools']['playState2Desc'](E.f['state']['playing']);
                            '' != b ? (I['state'].text = game['Tools']['strOfLocalization'](2069, [b]), I['state']['color'] = '#a9d94d', I.name['getChildByName']('name')['color'] = '#a9d94d') : (I['state'].text = game['Tools']['strOfLocalization'](2071), I['state']['color'] = '#58c4db', I.name['getChildByName']('name')['color'] = '#58c4db', F = !0);
                        } else
                            I['state'].text = game['Tools']['strOfLocalization'](2072), I['state']['color'] = '#8c8c8c', I.name['getChildByName']('name')['color'] = '#8c8c8c';
                        E['invited'] ? (I.btn['visible'] = !1, I['invited']['visible'] = !0) : (I.btn['visible'] = !0, I['invited']['visible'] = !1, game['Tools']['setGrayDisable'](I.btn, !F), F && (I.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](I.btn, !0);
                            var h = {
                                room_id: a.Inst['room_id'],
                                mode: a.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: E.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](h)
                            }, function (h, c) {
                                h || c['error'] ? (game['Tools']['setGrayDisable'](I.btn, !1), X['UIMgr'].Inst['showNetReqError']('sendClientMessage', h, c)) : (I.btn['visible'] = !1, I['invited']['visible'] = !0, E['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    h;
            }
                (),
                c = function () {
                    function h(h) {
                        var c = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = h,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new X['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new X['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return c['locking'];
                            }));
                        for (var P = this.root['getChildByName']('container_tabs'), a = function (h) {
                            I.tabs.push(P['getChildAt'](h)),
                                I.tabs[h]['clickHandler'] = new Laya['Handler'](I, function () {
                                    c['locking'] || c['tab_index'] != h && (1 == c['tab_index'] && c['page_zhangban']['changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](c, function () {
                                        c['change_tab'](h);
                                    }), null) : c['change_tab'](h));
                                });
                        }, I = this, E = 0; E < P['numChildren']; E++)
                            a(E);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            c['locking'] || (1 == c['tab_index'] && c['page_zhangban']['changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](c, function () {
                                c['close'](!1);
                            }), null) : c['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                c['locking'] || (1 == c['tab_index'] && c['page_zhangban']['changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](c, function () {
                                    c['close'](!1);
                                }), null) : c['close'](!1));
                            });
                    }
                    return h['prototype'].show = function () {
                        var h = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            X['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                h['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var c = 0; c < this.tabs['length']; c++) {
                            var P = this.tabs[c];
                            P.skin = game['Tools']['localUISrc'](c == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var a = P['getChildByName']('word');
                            a['color'] = c == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                a['scaleX'] = a['scaleY'] = c == this['tab_index'] ? 1.1 : 1,
                                c == this['tab_index'] && P['parent']['setChildIndex'](P, this.tabs['length'] - 1);
                        }
                    },
                        h['prototype']['change_tab'] = function (X) {
                            var h = this;
                            this['tab_index'] = X;
                            for (var c = 0; c < this.tabs['length']; c++) {
                                var P = this.tabs[c];
                                P.skin = game['Tools']['localUISrc'](c == X ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var a = P['getChildByName']('word');
                                a['color'] = c == X ? '#552c1c' : '#d3a86c',
                                    a['scaleX'] = a['scaleY'] = c == X ? 1.1 : 1,
                                    c == X && P['parent']['setChildIndex'](P, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    h['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    h['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    h['locking'] = !1;
                                });
                        },
                        h['prototype']['close'] = function (h) {
                            var c = this;
                            //修改友人房间立绘
                            if (!(c.page_head.choosed_chara_index == 0 && c.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = c.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = c.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = c.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[r.page_head.choosed_chara_index] = c.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (h ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: a.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), X['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                c['locking'] = !1,
                                    c.me['visible'] = !1;
                            }))));
                        },
                        h;
                }
                    (),
                P = function () {
                    function X(X) {
                        this['modes'] = [],
                            this.me = X,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return X['prototype'].show = function (X) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = X,
                            this['scrollview']['addItem'](X['length']);
                        var h = this['scrollview']['total_height'];
                        h > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - h, this.bg['height'] = h + 20),
                            this.bg['visible'] = !0;
                    },
                        X['prototype']['render_item'] = function (X) {
                            var h = X['index'],
                                c = X['container'],
                                P = c['getChildByName']('info');
                            P['fontSize'] = 40,
                                P['fontSize'] = this['modes'][h]['length'] <= 5 ? 40 : this['modes'][h]['length'] <= 9 ? 55 - 3 * this['modes'][h]['length'] : 28,
                                P.text = this['modes'][h];
                        },
                        X;
                }
                    (),
                a = function (a) {
                    function I() {
                        var h = a.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return h['skin_ready'] = 'myres/room/btn_ready.png',
                            h['skin_cancel'] = 'myres/room/btn_cancel.png',
                            h['skin_start'] = 'myres/room/btn_start.png',
                            h['skin_start_no'] = 'myres/room/btn_start_no.png',
                            h['update_seq'] = 0,
                            h['pre_msgs'] = [],
                            h['msg_tail'] = -1,
                            h['posted'] = !1,
                            h['label_rommid'] = null,
                            h['player_cells'] = [],
                            h['btn_ok'] = null,
                            h['btn_invite_friend'] = null,
                            h['btn_add_robot'] = null,
                            h['btn_dress'] = null,
                            h['btn_copy'] = null,
                            h['beReady'] = !1,
                            h['room_id'] = -1,
                            h['owner_id'] = -1,
                            h['tournament_id'] = 0,
                            h['max_player_count'] = 0,
                            h['players'] = [],
                            h['container_rules'] = null,
                            h['container_top'] = null,
                            h['container_right'] = null,
                            h['locking'] = !1,
                            h['mousein_copy'] = !1,
                            h['popout'] = null,
                            h['room_link'] = null,
                            h['btn_copy_link'] = null,
                            h['last_start_room'] = 0,
                            h['invitefriend'] = null,
                            h['pre_choose'] = null,
                            h['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            I.Inst = h,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](h, function (X) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](X)),
                                    h['onReadyChange'](X['account_id'], X['ready'], X['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](h, function (X) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](X)),
                                    h['onPlayerChange'](X);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](h, function (X) {
                                h['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](X)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), h['onGameStart'](X));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](h, function (X) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](X)),
                                    h['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](h, function () {
                                h['enable'] && h.hide(Laya['Handler']['create'](h, function () {
                                    X['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            h;
                    }
                    return __extends(I, a),
                        I['prototype']['push_msg'] = function (X) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](X)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](X));
                        },
                        Object['defineProperty'](I['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](I['prototype'], 'robot_count', {
                            get: function () {
                                for (var X = 0, h = 0; h < this['players']['length']; h++)
                                    2 == this['players'][h]['category'] && X++;
                                return X;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        I['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        I['prototype']['updateData'] = function (X) {
                            if (!X)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < X.persons.length; i++) {

                                if (X.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    X.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    X.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    X.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    X.persons[i].title = GameMgr.Inst.account_data.title;
                                    X.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        X.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = X['room_id'],
                                this['owner_id'] = X['owner_id'],
                                this['room_mode'] = X.mode,
                                this['public_live'] = X['public_live'],
                                this['tournament_id'] = 0,
                                X['tournament_id'] && (this['tournament_id'] = X['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = X['max_player_count'],
                                this['players'] = [];
                            for (var h = 0; h < X['persons']['length']; h++) {
                                var c = X['persons'][h];
                                c['ready'] = !1,
                                    c['cell_index'] = -1,
                                    c['category'] = 1,
                                    this['players'].push(c);
                            }
                            for (var h = 0; h < X['robot_count']; h++)
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
                            for (var h = 0; h < X['ready_list']['length']; h++)
                                for (var P = 0; P < this['players']['length']; P++)
                                    if (this['players'][P]['account_id'] == X['ready_list'][h]) {
                                        this['players'][P]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                X.seq && (this['update_seq'] = X.seq);
                        },
                        I['prototype']['onReadyChange'] = function (X, h, c) {
                            for (var P = 0; P < this['players']['length']; P++)
                                if (this['players'][P]['account_id'] == X) {
                                    this['players'][P]['ready'] = h,
                                        this['players'][P]['dressing'] = c,
                                        this['_onPlayerReadyChange'](this['players'][P]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        I['prototype']['onPlayerChange'] = function (X) {
                            if (app.Log.log(X), X = X['toJSON'](), !(X.seq && X.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < X.player_list.length; i++) {

                                    if (X.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        X.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        X.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        X.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            X.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (X.update_list != undefined) {
                                    for (var i = 0; i < X.update_list.length; i++) {

                                        if (X.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            X.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            X.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            X.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                X.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = X.seq;
                                var h = {};
                                h.type = 'onPlayerChange0',
                                    h['players'] = this['players'],
                                    h.msg = X,
                                    this['push_msg'](JSON['stringify'](h));
                                var c = this['robot_count'],
                                    P = X['robot_count'];
                                if (P < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, c--);
                                    for (var a = 0; a < this['players']['length']; a++)
                                        2 == this['players'][a]['category'] && c > P && (this['players'][a]['category'] = 0, c--);
                                }
                                for (var I = [], E = X['player_list'], a = 0; a < this['players']['length']; a++)
                                    if (1 == this['players'][a]['category']) {
                                        for (var F = -1, b = 0; b < E['length']; b++)
                                            if (E[b]['account_id'] == this['players'][a]['account_id']) {
                                                F = b;
                                                break;
                                            }
                                        if (-1 != F) {
                                            var f = E[F];
                                            I.push(this['players'][a]),
                                                this['players'][a]['avatar_id'] = f['avatar_id'],
                                                this['players'][a]['title'] = f['title'],
                                                this['players'][a]['verified'] = f['verified'];
                                        }
                                    } else
                                        2 == this['players'][a]['category'] && I.push(this['players'][a]);
                                this['players'] = I;
                                for (var a = 0; a < E['length']; a++) {
                                    for (var n = !1, f = E[a], b = 0; b < this['players']['length']; b++)
                                        if (1 == this['players'][b]['category'] && this['players'][b]['account_id'] == f['account_id']) {
                                            n = !0;
                                            break;
                                        }
                                    n || this['players'].push({
                                        account_id: f['account_id'],
                                        avatar_id: f['avatar_id'],
                                        nickname: f['nickname'],
                                        verified: f['verified'],
                                        title: f['title'],
                                        level: f['level'],
                                        level3: f['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var Q = [!1, !1, !1, !1], a = 0; a < this['players']['length']; a++)
                                    - 1 != this['players'][a]['cell_index'] && (Q[this['players'][a]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][a]));
                                for (var a = 0; a < this['players']['length']; a++)
                                    if (1 == this['players'][a]['category'] && -1 == this['players'][a]['cell_index'])
                                        for (var b = 0; b < this['max_player_count']; b++)
                                            if (!Q[b]) {
                                                this['players'][a]['cell_index'] = b,
                                                    Q[b] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][a]);
                                                break;
                                            }
                                for (var c = this['robot_count'], P = X['robot_count']; P > c;) {
                                    for (var k = -1, b = 0; b < this['max_player_count']; b++)
                                        if (!Q[b]) {
                                            k = b;
                                            break;
                                        }
                                    if (-1 == k)
                                        break;
                                    Q[k] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: k,
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
                                        c++;
                                }
                                for (var a = 0; a < this['max_player_count']; a++)
                                    Q[a] || this['_clearCell'](a);
                                var h = {};
                                if (h.type = 'onPlayerChange1', h['players'] = this['players'], this['push_msg'](JSON['stringify'](h)), X['owner_id']) {
                                    if (this['owner_id'] = X['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var b = 0; b < this['players']['length']; b++)
                                                if (this['players'][b] && this['players'][b]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][b]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var b = 0; b < this['players']['length']; b++)
                                            if (this['players'][b] && this['players'][b]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][b]);
                                                break;
                                            }
                            }
                        },
                        I['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), X['UI_Lobby'].Inst['enable'] = !0, X['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        I['prototype']['onCreate'] = function () {
                            var a = this;
                            this['last_start_room'] = 0;
                            var I = this.me['getChildByName']('root');
                            this['container_top'] = I['getChildByName']('top'),
                                this['container_right'] = I['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var E = function (h) {
                                var c = I['getChildByName']('player_' + h['toString']()),
                                    P = {};
                                P['index'] = h,
                                    P['container'] = c,
                                    P['container_flag'] = c['getChildByName']('flag'),
                                    P['container_flag']['visible'] = !1,
                                    P['container_name'] = c['getChildByName']('container_name'),
                                    P.name = c['getChildByName']('container_name')['getChildByName']('name'),
                                    P['btn_t'] = c['getChildByName']('btn_t'),
                                    P['container_illust'] = c['getChildByName']('container_illust'),
                                    P['illust'] = new X['UI_Character_Skin'](c['getChildByName']('container_illust')['getChildByName']('illust')),
                                    P.host = c['getChildByName']('host'),
                                    P['title'] = new X['UI_PlayerTitle'](c['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    P.rank = new X['UI_Level'](c['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    P['is_robot'] = !1;
                                var E = 0;
                                P['btn_t']['clickHandler'] = Laya['Handler']['create'](F, function () {
                                    if (!(a['locking'] || Laya['timer']['currTimer'] < E)) {
                                        E = Laya['timer']['currTimer'] + 500;
                                        for (var X = 0; X < a['players']['length']; X++)
                                            if (a['players'][X]['cell_index'] == h) {
                                                a['kickPlayer'](X);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    P['btn_info'] = c['getChildByName']('btn_info'),
                                    P['btn_info']['clickHandler'] = Laya['Handler']['create'](F, function () {
                                        if (!a['locking'])
                                            for (var c = 0; c < a['players']['length']; c++)
                                                if (a['players'][c]['cell_index'] == h) {
                                                    a['players'][c]['account_id'] && a['players'][c]['account_id'] > 0 && X['UI_OtherPlayerInfo'].Inst.show(a['players'][c]['account_id'], a['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                                    break;
                                                }
                                    }, null, !1),
                                    F['player_cells'].push(P);
                            }, F = this, b = 0; 4 > b; b++)
                                E(b);
                            this['btn_ok'] = I['getChildByName']('btn_ok');
                            var f = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < f + 500 || (f = Laya['timer']['currTimer'], a['owner_id'] == GameMgr.Inst['account_id'] ? a['getStart']() : a['switchReady']());
                            }, null, !1);
                            var n = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < n + 500 || (n = Laya['timer']['currTimer'], a['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    a['locking'] || a['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var Q = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                a['locking'] || Laya['timer']['currTimer'] < Q || (Q = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: a['robot_count'] + 1
                                }, function (h, c) {
                                    (h || c['error'] && 1111 != c['error'].code) && X['UIMgr'].Inst['showNetReqError']('modifyRoom_add', h, c),
                                        Q = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!a['locking']) {
                                        var h = 0;
                                        a['room_mode']['detail_rule'] && a['room_mode']['detail_rule']['chuanma'] && (h = 1),
                                            X['UI_Rules'].Inst.show(0, null, h);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    a['locking'] || a['beReady'] && a['owner_id'] != GameMgr.Inst['account_id'] || (a['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: a['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    a['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    a['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    a['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), a['popout']['visible'] = !0, X['UIBase']['anim_pop_out'](a['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new P(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var h = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    h.call('setSysClipboardText', a['room_link'].text),
                                        X['UIBase']['anim_pop_hide'](a['popout'], Laya['Handler']['create'](a, function () {
                                            a['popout']['visible'] = !1;
                                        })),
                                        X['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', a['room_link'].text, function () { }),
                                        X['UIBase']['anim_pop_hide'](a['popout'], Laya['Handler']['create'](a, function () {
                                            a['popout']['visible'] = !1;
                                        })),
                                        X['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    X['UIBase']['anim_pop_hide'](a['popout'], Laya['Handler']['create'](a, function () {
                                        a['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new h(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new c(this.me['getChildByName']('pop_view'));
                        },
                        I['prototype'].show = function () {
                            var h = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var c = 0; 4 > c; c++)
                                this['player_cells'][c]['container']['visible'] = c < this['max_player_count'];
                            for (var c = 0; c < this['max_player_count']; c++)
                                this['_clearCell'](c);
                            for (var c = 0; c < this['players']['length']; c++)
                                this['players'][c]['cell_index'] = c, this['_refreshPlayerInfo'](this['players'][c]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var P = {};
                            P.type = 'show',
                                P['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](P)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var a = [];
                            a.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var I = this['room_mode']['detail_rule'];
                            if (I) {
                                var E = 5,
                                    F = 20;
                                if (null != I['time_fixed'] && (E = I['time_fixed']), null != I['time_add'] && (F = I['time_add']), a.push(E['toString']() + '+' + F['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var b = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    b && a.push(b.name);
                                }
                                if (null != I['init_point'] && a.push(game['Tools']['strOfLocalization'](2199) + I['init_point']), null != I['fandian'] && a.push(game['Tools']['strOfLocalization'](2094) + ':' + I['fandian']), I['guyi_mode'] && a.push(game['Tools']['strOfLocalization'](3028)), null != I['dora_count'])
                                    switch (I['chuanma'] && (I['dora_count'] = 0), I['dora_count']) {
                                        case 0:
                                            a.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            a.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            a.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            a.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != I['shiduan'] && 1 != I['shiduan'] && a.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === I['fanfu'] && a.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === I['fanfu'] && a.push(game['Tools']['strOfLocalization'](2764)),
                                    null != I['bianjietishi'] && 1 != I['bianjietishi'] && a.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != I['have_zimosun'] && 1 != I['have_zimosun'] ? a.push(game['Tools']['strOfLocalization'](2202)) : a.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(a),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                X['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var c = 0; c < this['player_cells']['length']; c++)
                                X['UIBase']['anim_alpha_in'](this['player_cells'][c]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * c, null, Laya.Ease['backOut']);
                            X['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                X['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    h['locking'] = !1;
                                });
                            var f = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != f && (this['room_link'].text += '(' + f + ')');
                            var n = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + n + '?room=' + this['room_id'];
                        },
                        I['prototype']['leaveRoom'] = function () {
                            var h = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (c, P) {
                                c || P['error'] ? X['UIMgr'].Inst['showNetReqError']('leaveRoom', c, P) : (h['room_id'] = -1, h.hide(Laya['Handler']['create'](h, function () {
                                    X['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        I['prototype']['tryToClose'] = function (h) {
                            var c = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (P, a) {
                                P || a['error'] ? (X['UIMgr'].Inst['showNetReqError']('leaveRoom', P, a), h['runWith'](!1)) : (c['enable'] = !1, c['pop_change_view']['close'](!0), h['runWith'](!0));
                            });
                        },
                        I['prototype'].hide = function (h) {
                            var c = this;
                            this['locking'] = !0,
                                X['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var P = 0; P < this['player_cells']['length']; P++)
                                X['UIBase']['anim_alpha_out'](this['player_cells'][P]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            X['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                X['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    c['locking'] = !1,
                                        c['enable'] = !1,
                                        h && h.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        I['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var X = 0; X < this['player_cells']['length']; X++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][X]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        I['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        I['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (h, c) {
                                (h || c['error']) && X['UIMgr'].Inst['showNetReqError']('startRoom', h, c);
                            })));
                        },
                        I['prototype']['kickPlayer'] = function (h) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var c = this['players'][h];
                                1 == c['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][h]['account_id']
                                }, function () { }) : 2 == c['category'] && (this['pre_choose'] = c, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (h, c) {
                                    (h || c['error']) && X['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', h, c);
                                }));
                            }
                        },
                        I['prototype']['_clearCell'] = function (X) {
                            if (!(0 > X || X >= this['player_cells']['length'])) {
                                var h = this['player_cells'][X];
                                h['container_flag']['visible'] = !1,
                                    h['container_illust']['visible'] = !1,
                                    h.name['visible'] = !1,
                                    h['container_name']['visible'] = !1,
                                    h['btn_t']['visible'] = !1,
                                    h.host['visible'] = !1,
                                    h['illust']['clear']();
                            }
                        },
                        I['prototype']['_refreshPlayerInfo'] = function (X) {
                            var h = X['cell_index'];
                            if (!(0 > h || h >= this['player_cells']['length'])) {
                                var c = this['player_cells'][h];
                                c['container_illust']['visible'] = !0,
                                    c['container_name']['visible'] = !0,
                                    c.name['visible'] = !0,
                                    game['Tools']['SetNickname'](c.name, X, GameMgr.Inst['hide_nickname']),
                                    c['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && X['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == X['account_id'] && (c['container_flag']['visible'] = !0, c.host['visible'] = !0),
                                    X['account_id'] == GameMgr.Inst['account_id'] ? c['illust']['setSkin'](X['avatar_id'], 'waitingroom') : c['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](X['avatar_id']), 'waitingroom'),
                                    c['title'].id = game['Tools']['titleLocalization'](X['account_id'], X['title']),
                                    c.rank.id = X[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](X);
                            }
                        },
                        I['prototype']['_onPlayerReadyChange'] = function (X) {
                            var h = X['cell_index'];
                            if (!(0 > h || h >= this['player_cells']['length'])) {
                                var c = this['player_cells'][h];
                                c['container_flag']['visible'] = this['owner_id'] == X['account_id'] ? !0 : X['ready'];
                            }
                        },
                        I['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var X = 0, h = 0; h < this['players']['length']; h++)
                                    0 != this['players'][h]['category'] && (this['_refreshPlayerInfo'](this['players'][h]), X++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], X == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], X == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        I['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var X = 0, h = 0; h < this['players']['length']; h++) {
                                    var c = this['players'][h];
                                    if (!c || 0 == c['category'])
                                        break;
                                    (c['account_id'] == this['owner_id'] || c['ready']) && X++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], X != this['max_player_count']), this['enable']) {
                                    for (var P = 0, h = 0; h < this['max_player_count']; h++) {
                                        var a = this['player_cells'][h];
                                        a && a['container_flag']['visible'] && P++;
                                    }
                                    if (X != P && !this['posted']) {
                                        this['posted'] = !0;
                                        var I = {};
                                        I['okcount'] = X,
                                            I['okcount2'] = P,
                                            I.msgs = [];
                                        var E = 0,
                                            F = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (E = (this['msg_tail'] + 1) % this['pre_msgs']['length'], F = this['msg_tail']), E >= 0 && F >= 0) {
                                            for (var h = E; h != F; h = (h + 1) % this['pre_msgs']['length'])
                                                I.msgs.push(this['pre_msgs'][h]);
                                            I.msgs.push(this['pre_msgs'][F]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', I, !1);
                                    }
                                }
                            }
                        },
                        I['prototype']['onGameStart'] = function (X) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](X['connect_token'], X['game_uuid'], X['location'], !1, null);
                        },
                        I['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        I['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        I.Inst = null,
                        I;
                }
                    (X['UIBase']);
            X['UI_WaitingRoom'] = a;
        }
            (uiscript || (uiscript = {}));









        // 保存装扮
        !function (X) {
            var h;
            !function (h) {
                var c = function () {
                    function c(c, P, a) {
                        var I = this;
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
                            this['_locking'] = a,
                            this['container_zhuangban0'] = c,
                            this['container_zhuangban1'] = P;
                        var E = this['container_zhuangban0']['getChildByName']('tabs');
                        E['vScrollBarSkin'] = '';
                        for (var F = function (h) {
                            var c = E['getChildAt'](h);
                            b.tabs.push(c),
                                c['clickHandler'] = new Laya['Handler'](b, function () {
                                    I['locking'] || I['tab_index'] != h && (I['_changed'] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](I, function () {
                                        I['change_tab'](h);
                                    }), null) : I['change_tab'](h));
                                });
                        }, b = this, f = 0; f < E['numChildren']; f++)
                            F(f);
                        this['page_items'] = new h['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new h['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new h['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new h['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var h = [], c = 0; c < I['cell_titles']['length']; c++) {
                                    var P = I['slot_ids'][c];
                                    if (I['slot_map'][P]) {
                                        var a = I['slot_map'][P];
                                        if (!(a['item_id'] && a['item_id'] != I['cell_default_item'][c] || a['item_id_list'] && 0 != a['item_id_list']['length']))
                                            continue;
                                        var E = [];
                                        if (a['item_id_list'])
                                            for (var F = 0, b = a['item_id_list']; F < b['length']; F++) {
                                                var f = b[F];
                                                f == I['cell_default_item'][c] ? E.push(0) : E.push(f);
                                            }
                                        h.push({
                                            slot: P,
                                            item_id: a['item_id'],
                                            type: a.type,
                                            item_id_list: E
                                        });
                                    }
                                }
                                I['btn_save']['mouseEnabled'] = !1;
                                var n = I['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: h,
                                //    save_index: n,
                                //    is_use: n == X['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (c, P) {
                                //    if (I['btn_save']['mouseEnabled'] = !0, c || P['error'])
                                //        X['UIMgr'].Inst['showNetReqError']('saveCommonViews', c, P);
                                //    else {
                                if (X['UI_Sushe']['commonViewList']['length'] < n)
                                    for (var a = X['UI_Sushe']['commonViewList']['length']; n >= a; a++)
                                        X['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = X.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = X.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (X['UI_Sushe']['commonViewList'][n] = h, X['UI_Sushe']['using_commonview_index'] == n && I['onChangeGameView'](), I['tab_index'] != n)
                                    return;
                                I['btn_save']['mouseEnabled'] = !0,
                                    I['_changed'] = !1,
                                    I['refresh_btn']();
                                //}
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                I['btn_use']['mouseEnabled'] = !1;
                                var h = I['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: h
                                //}, function (c, P) {
                                //    I['btn_use']['mouseEnabled'] = !0,
                                //    c || P['error'] ? X['UIMgr'].Inst['showNetReqError']('useCommonView', c, P) : (
                                X['UI_Sushe']['using_commonview_index'] = h, I['refresh_btn'](), I['refresh_tab'](), I['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                I['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](c['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object['defineProperty'](c['prototype'], 'changed', {
                            get: function () {
                                return this['_changed'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        c['prototype'].show = function (h) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                h ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (X['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), X['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](X['UI_Sushe']['using_commonview_index']);
                        },
                        c['prototype']['change_tab'] = function (h) {
                            if (this['tab_index'] = h, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < X['UI_Sushe']['commonViewList']['length'])
                                    for (var c = X['UI_Sushe']['commonViewList'][this['tab_index']], P = 0; P < c['length']; P++)
                                        this['slot_map'][c[P].slot] = {
                                            slot: c[P].slot,
                                            item_id: c[P]['item_id'],
                                            type: c[P].type,
                                            item_id_list: c[P]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        c['prototype']['refresh_tab'] = function () {
                            for (var h = 0; h < this.tabs['length']; h++) {
                                var c = this.tabs[h];
                                c['mouseEnabled'] = this['tab_index'] != h,
                                    c['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == h ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    c['getChildByName']('num')['color'] = this['tab_index'] == h ? '#2f1e19' : '#f2c797';
                                var P = c['getChildByName']('choosed');
                                X['UI_Sushe']['using_commonview_index'] == h ? (P['visible'] = !0, P.x = this['tab_index'] == h ? -18 : -4) : P['visible'] = !1;
                            }
                        },
                        c['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = X['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = X['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        c['prototype']['onChangeSlotSelect'] = function (X) {
                            var h = this;
                            this['select_index'] = X,
                                this['random']['visible'] = !(6 == X || 10 == X);
                            var c = 0;
                            X >= 0 && X < this['cell_default_item']['length'] && (c = this['cell_default_item'][X]);
                            var P = c,
                                a = this['slot_ids'][X],
                                I = !1,
                                E = [];
                            if (this['slot_map'][a]) {
                                var F = this['slot_map'][a];
                                E = F['item_id_list'],
                                    I = !!F.type,
                                    F['item_id'] && (P = this['slot_map'][a]['item_id']),
                                    I && F['item_id_list'] && F['item_id_list']['length'] > 0 && (P = F['item_id_list'][0]);
                            }
                            var b = Laya['Handler']['create'](this, function (P) {
                                if (P == c && (P = 0), h['is_random']) {
                                    var I = h['slot_map'][a]['item_id_list']['indexOf'](P);
                                    I >= 0 ? h['slot_map'][a]['item_id_list']['splice'](I, 1) : (h['slot_map'][a]['item_id_list'] && 0 != h['slot_map'][a]['item_id_list']['length'] || (h['slot_map'][a]['item_id_list'] = []), h['slot_map'][a]['item_id_list'].push(P));
                                } else
                                    h['slot_map'][a] || (h['slot_map'][a] = {}), h['slot_map'][a]['item_id'] = P;
                                h['scrollview']['wantToRefreshItem'](X),
                                    h['_changed'] = !0,
                                    h['refresh_btn']();
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = I,
                                this['random_slider'].x = I ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var f = game['Tools']['strOfLocalization'](this['cell_titles'][X]);
                            if (X >= 0 && 2 >= X)
                                this['page_items'].show(f, X, P, b), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == X)
                                this['page_items'].show(f, 10, P, b), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == X)
                                this['page_items'].show(f, 3, P, b), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == X)
                                this['page_bgm'].show(f, P, b), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == X)
                                this['page_headframe'].show(f, P, b);
                            else if (7 == X || 8 == X) {
                                var n = this['cell_default_item'][7],
                                    Q = this['cell_default_item'][8];
                                if (7 == X) {
                                    if (n = P, this['slot_map'][game['EView'].mjp]) {
                                        var k = this['slot_map'][game['EView'].mjp];
                                        k.type && k['item_id_list'] && k['item_id_list']['length'] > 0 ? Q = k['item_id_list'][0] : k['item_id'] && (Q = k['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](f, n, Q, b);
                                } else {
                                    if (Q = P, this['slot_map'][game['EView']['desktop']]) {
                                        var k = this['slot_map'][game['EView']['desktop']];
                                        k.type && k['item_id_list'] && k['item_id_list']['length'] > 0 ? n = k['item_id_list'][0] : k['item_id'] && (n = k['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](f, n, Q, b);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == X) {
                                var n = this['cell_default_item'][7],
                                    Q = this['cell_default_item'][9];
                                if (Q = P, this['slot_map'][game['EView']['desktop']]) {
                                    var k = this['slot_map'][game['EView']['desktop']];
                                    k.type && k['item_id_list'] && k['item_id_list']['length'] > 0 ? n = k['item_id_list'][0] : k['item_id'] && (n = k['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](f, n, Q, b),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == X && this['page_desktop']['show_lobby_bg'](f, P, b);
                        },
                        c['prototype']['onRandomBtnClick'] = function () {
                            var X = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        X['random']['getChildAt'](X['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var h = this['select_index'],
                                    c = this['slot_ids'][h],
                                    P = 0;
                                h >= 0 && h < this['cell_default_item']['length'] && (P = this['cell_default_item'][h]);
                                var a = P,
                                    I = [];
                                if (this['slot_map'][c]) {
                                    var E = this['slot_map'][c];
                                    I = E['item_id_list'],
                                        E['item_id'] && (a = this['slot_map'][c]['item_id']);
                                }
                                if (h >= 0 && 4 >= h) {
                                    var F = this['slot_map'][c];
                                    F ? (F.type = F.type ? 0 : 1, F['item_id_list'] && 0 != F['item_id_list']['length'] || (F['item_id_list'] = [F['item_id']])) : this['slot_map'][c] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](a);
                                } else if (5 == h) {
                                    var F = this['slot_map'][c];
                                    if (F)
                                        F.type = F.type ? 0 : 1, F['item_id_list'] && 0 != F['item_id_list']['length'] || (F['item_id_list'] = [F['item_id']]);
                                    else {
                                        this['slot_map'][c] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](a);
                                } else if (7 == h || 8 == h || 9 == h) {
                                    var F = this['slot_map'][c];
                                    F ? (F.type = F.type ? 0 : 1, F['item_id_list'] && 0 != F['item_id_list']['length'] || (F['item_id_list'] = [F['item_id']])) : this['slot_map'][c] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](a);
                                }
                                this['scrollview']['wantToRefreshItem'](h);
                            }
                        },
                        c['prototype']['render_view'] = function (X) {
                            var h = this,
                                c = X['container'],
                                P = X['index'],
                                a = c['getChildByName']('cell');
                            this['select_index'] == P ? (a['scaleX'] = a['scaleY'] = 1.05, a['getChildByName']('choosed')['visible'] = !0) : (a['scaleX'] = a['scaleY'] = 1, a['getChildByName']('choosed')['visible'] = !1),
                                a['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][P]);
                            var I = a['getChildByName']('name'),
                                E = a['getChildByName']('icon'),
                                F = this['cell_default_item'][P],
                                b = this['slot_ids'][P],
                                f = !1;
                            if (this['slot_map'][b] && (f = this['slot_map'][b].type, this['slot_map'][b]['item_id'] && (F = this['slot_map'][b]['item_id'])), f)
                                I.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][b]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](E, 'myres/sushe/icon_random.jpg');
                            else {
                                var n = cfg['item_definition'].item.get(F);
                                n ? (I.text = n['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](E, n.icon, null, 'UI_Sushe_Select.Zhuangban')) : (I.text = game['Tools']['strOfLocalization'](this['cell_names'][P]), game['LoadMgr']['setImgSkin'](E, this['cell_default_img'][P], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var Q = a['getChildByName']('btn');
                            Q['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || h['select_index'] != P && (h['onChangeSlotSelect'](P), h['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                Q['mouseEnabled'] = this['select_index'] != P;
                        },
                        c['prototype']['close'] = function (h) {
                            var c = this;
                            this['container_zhuangban0']['visible'] && (h ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (X['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), X['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                c['page_items']['close'](),
                                    c['page_desktop']['close'](),
                                    c['page_headframe']['close'](),
                                    c['page_bgm']['close'](),
                                    c['container_zhuangban0']['visible'] = !1,
                                    c['container_zhuangban1']['visible'] = !1,
                                    game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                            }))));
                        },
                        c['prototype']['onChangeGameView'] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = X.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            X['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var h = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            X['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](h, Laya['Handler']['create'](this, function () {
                                    X['UI_Lite_Loading'].Inst['enable'] && X['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        c['prototype']['setRandomGray'] = function (h) {
                            this['btn_random']['visible'] = !h,
                                this['random']['filters'] = h ? [new Laya['ColorFilter'](X['GRAY_FILTER'])] : [];
                        },
                        c['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        c['prototype']['changeSlotByItemId'] = function (X) {
                            var h = cfg['item_definition'].item.get(X);
                            if (h)
                                for (var c = 0; c < this['slot_ids']['length']; c++)
                                    if (this['slot_ids'][c] == h.type)
                                        return this['onChangeSlotSelect'](c), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        c;
                }
                    ();
                h['Container_Zhuangban'] = c;
            }
                (h = X['zhuangban'] || (X['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));









        // 设置称号
        !function (X) {
            var h = function (h) {
                function c() {
                    var X = h.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return X['_root'] = null,
                        X['_scrollview'] = null,
                        X['_blackmask'] = null,
                        X['_locking'] = !1,
                        X['_showindexs'] = [],
                        c.Inst = X,
                        X;
                }
                return __extends(c, h),
                    c.Init = function () {
                        var h = this;
                        // 获取称号
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (c, P) {
                        //    if (c || P['error'])
                        //        X['UIMgr'].Inst['showNetReqError']('fetchTitleList', c, P);
                        //    else {
                        h['owned_title'] = [];
                        //         for (var a = 0; a < P['title_list']['length']; a++) {
                        // var I = P['title_list'][a];
                        for (let title of cfg.item_definition.title.rows_) {
                            var I = title.id;
                            cfg['item_definition']['title'].get(I) && h['owned_title'].push(I),
                                '600005' == I && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                I >= '600005' && '600015' >= I && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + I - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    c['title_update'] = function (h) {
                        for (var c = 0; c < h['new_titles']['length']; c++)
                            cfg['item_definition']['title'].get(h['new_titles'][c]) && this['owned_title'].push(h['new_titles'][c]), '600005' == h['new_titles'][c] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), h['new_titles'][c] >= '600005' && h['new_titles'][c] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + h['new_titles'][c] - '600005', 1);
                        if (h['remove_titles'] && h['remove_titles']['length'] > 0) {
                            for (var c = 0; c < h['remove_titles']['length']; c++) {
                                for (var P = h['remove_titles'][c], a = 0; a < this['owned_title']['length']; a++)
                                    if (this['owned_title'][a] == P) {
                                        this['owned_title'][a] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                P == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', X['UI_Lobby'].Inst['enable'] && X['UI_Lobby'].Inst.top['refresh'](), X['UI_PlayerInfo'].Inst['enable'] && X['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    c['prototype']['onCreate'] = function () {
                        var h = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new X['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return h['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (X) {
                                h['setItemValue'](X['index'], X['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['_locking'] || (h['_blackmask'].hide(), h['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    c['prototype'].show = function () {
                        var h = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), c['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var P = 0; P < c['owned_title']['length']; P++)
                                this['_showindexs'].push(P);
                            this['_showindexs'] = this['_showindexs'].sort(function (X, h) {
                                var P = X,
                                    a = cfg['item_definition']['title'].get(c['owned_title'][X]);
                                a && (P += 1000 * a['priority']);
                                var I = h,
                                    E = cfg['item_definition']['title'].get(c['owned_title'][h]);
                                return E && (I += 1000 * E['priority']),
                                    I - P;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](c['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        X['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            h['_locking'] = !1;
                        }));
                    },
                    c['prototype']['close'] = function () {
                        var h = this;
                        this['_locking'] = !0,
                            X['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                h['_locking'] = !1,
                                    h['enable'] = !1;
                            }));
                    },
                    c['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    c['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    c['prototype']['setItemValue'] = function (X, h) {
                        var P = this;
                        if (this['enable']) {
                            var a = c['owned_title'][this['_showindexs'][X]],
                                I = cfg['item_definition']['title'].find(a);
                            game['LoadMgr']['setImgSkin'](h['getChildByName']('img_title'), I.icon, null, 'UI_TitleBook'),
                                h['getChildByName']('using')['visible'] = a == GameMgr.Inst['account_data']['title'],
                                h['getChildByName']('desc').text = I['desc_' + GameMgr['client_language']];
                            var E = h['getChildByName']('btn');
                            E['clickHandler'] = Laya['Handler']['create'](this, function () {
                                a != GameMgr.Inst['account_data']['title'] ? (P['changeTitle'](X), h['getChildByName']('using')['visible'] = !0) : (P['changeTitle'](-1), h['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var F = h['getChildByName']('time'),
                                b = h['getChildByName']('img_title');
                            if (1 == I['unlock_type']) {
                                var f = I['unlock_param'][0],
                                    n = cfg['item_definition'].item.get(f);
                                F.text = game['Tools']['strOfLocalization'](3121) + n['expire_desc_' + GameMgr['client_language']],
                                    F['visible'] = !0,
                                    b.y = 0;
                            } else
                                F['visible'] = !1, b.y = 10;
                        }
                    },
                    c['prototype']['changeTitle'] = function (h) {
                        var P = this,
                            a = GameMgr.Inst['account_data']['title'],
                            I = 0;
                        I = h >= 0 && h < this['_showindexs']['length'] ? c['owned_title'][this['_showindexs'][h]] : '600001',
                            GameMgr.Inst['account_data']['title'] = I;
                        for (var E = -1, F = 0; F < this['_showindexs']['length']; F++)
                            if (a == c['owned_title'][this['_showindexs'][F]]) {
                                E = F;
                                break;
                            }
                        X['UI_Lobby'].Inst['enable'] && X['UI_Lobby'].Inst.top['refresh'](),
                            X['UI_PlayerInfo'].Inst['enable'] && X['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            -1 != E && this['_scrollview']['wantToRefreshItem'](E),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = I;
                        MMP.saveSettings();
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                        //    title: '600001' == I ? 0 : I
                        //}, function (c, I) {
                        //    (c || I['error']) && (X['UIMgr'].Inst['showNetReqError']('useTitle', c, I), GameMgr.Inst['account_data']['title'] = a, X['UI_Lobby'].Inst['enable'] && X['UI_Lobby'].Inst.top['refresh'](), X['UI_PlayerInfo'].Inst['enable'] && X['UI_PlayerInfo'].Inst['refreshBaseInfo'](), P['enable'] && (h >= 0 && h < P['_showindexs']['length'] && P['_scrollview']['wantToRefreshItem'](h), E >= 0 && E < P['_showindexs']['length'] && P['_scrollview']['wantToRefreshItem'](E)));
                        //});
                    },
                    c.Inst = null,
                    c['owned_title'] = [],
                    c;
            }
                (X['UIBase']);
            X['UI_TitleBook'] = h;
        }
            (uiscript || (uiscript = {}));








        // 友人房调整装扮
        !function (X) {
            var h;
            !function (h) {
                var c = function () {
                    function c(X) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = X,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new h['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return c['prototype'].show = function (h) {
                        var c = this;
                        this.me['visible'] = !0,
                            h ? this.me['alpha'] = 1 : X['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var P = 0, a = X['UI_Sushe']['star_chars']; P < a['length']; P++)
                            for (var I = a[P], E = 0; E < X['UI_Sushe']['characters']['length']; E++)
                                if (!X['UI_Sushe']['hidden_characters_map'][I] && X['UI_Sushe']['characters'][E]['charid'] == I) {
                                    this['chara_infos'].push({
                                        chara_id: X['UI_Sushe']['characters'][E]['charid'],
                                        skin_id: X['UI_Sushe']['characters'][E].skin,
                                        is_upgraded: X['UI_Sushe']['characters'][E]['is_upgraded']
                                    }),
                                        X['UI_Sushe']['main_character_id'] == X['UI_Sushe']['characters'][E]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var E = 0; E < X['UI_Sushe']['characters']['length']; E++)
                            X['UI_Sushe']['hidden_characters_map'][X['UI_Sushe']['characters'][E]['charid']] || -1 == X['UI_Sushe']['star_chars']['indexOf'](X['UI_Sushe']['characters'][E]['charid']) && (this['chara_infos'].push({
                                chara_id: X['UI_Sushe']['characters'][E]['charid'],
                                skin_id: X['UI_Sushe']['characters'][E].skin,
                                is_upgraded: X['UI_Sushe']['characters'][E]['is_upgraded']
                            }), X['UI_Sushe']['main_character_id'] == X['UI_Sushe']['characters'][E]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var F = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(F['chara_id'], F['skin_id'], Laya['Handler']['create'](this, function (X) {
                            c['choosed_skin_id'] = X,
                                F['skin_id'] = X,
                                c['scrollview']['wantToRefreshItem'](c['choosed_chara_index']);
                        }, null, !1));
                    },
                        c['prototype']['render_character_cell'] = function (h) {
                            var c = this,
                                P = h['index'],
                                a = h['container'],
                                I = h['cache_data'];
                            I['index'] = P;
                            var E = this['chara_infos'][P];
                            I['inited'] || (I['inited'] = !0, I.skin = new X['UI_Character_Skin'](a['getChildByName']('btn')['getChildByName']('head')), I['bound'] = a['getChildByName']('btn')['getChildByName']('bound'));
                            var F = a['getChildByName']('btn');
                            F['getChildByName']('choose')['visible'] = P == this['choosed_chara_index'],
                                I.skin['setSkin'](E['skin_id'], 'bighead'),
                                F['getChildByName']('using')['visible'] = P == this['choosed_chara_index'];
                            var b = cfg['item_definition']['character'].find(E['chara_id']),
                                f = b['name_' + GameMgr['client_language'] + '2'] ? b['name_' + GameMgr['client_language'] + '2'] : b['name_' + GameMgr['client_language']],
                                n = F['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                n.text = f['replace']('-', '|')['replace'](/\./g, '·');
                                var Q = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                n['leading'] = Q.test(f) ? -15 : 0;
                            } else
                                n.text = f;
                            F['getChildByName']('star') && (F['getChildByName']('star')['visible'] = P < this['star_char_count']);
                            var k = cfg['item_definition']['character'].get(E['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? I['bound'].skin = k.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (E['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (E['is_upgraded'] ? '2.png' : '.png')) : k.ur ? (I['bound'].pos(-10, -2), I['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '6.png' : '5.png'))) : (I['bound'].pos(4, 20), I['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '4.png' : '3.png'))),
                                F['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '2.png' : '.png')),
                                a['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (P != c['choosed_chara_index']) {
                                        var X = c['choosed_chara_index'];
                                        c['choosed_chara_index'] = P,
                                            c['choosed_skin_id'] = E['skin_id'],
                                            c['page_skin'].show(E['chara_id'], E['skin_id'], Laya['Handler']['create'](c, function (X) {
                                                c['choosed_skin_id'] = X,
                                                    E['skin_id'] = X,
                                                    I.skin['setSkin'](X, 'bighead');
                                            }, null, !1)),
                                            c['scrollview']['wantToRefreshItem'](X),
                                            c['scrollview']['wantToRefreshItem'](P);
                                    }
                                });
                        },
                        c['prototype']['close'] = function (h) {
                            var c = this;
                            if (this.me['visible'])
                                if (h)
                                    this.me['visible'] = !1;
                                else {
                                    var P = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //P['chara_id'] != X['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: P['chara_id']
                                    //    }, function () {}), 
                                    X['UI_Sushe']['main_character_id'] = P['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: P['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var a = 0; a < X['UI_Sushe']['characters']['length']; a++)
                                        if (X['UI_Sushe']['characters'][a]['charid'] == P['chara_id']) {
                                            X['UI_Sushe']['characters'][a].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        X['UI_Sushe']['onMainSkinChange'](),
                                        X['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            c.me['visible'] = !1;
                                        }));
                                }
                        },
                        c;
                }
                    ();
                h['Page_Waiting_Head'] = c;
            }
                (h = X['zhuangban'] || (X['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));









        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var I = GameMgr;
            var h = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (c, P) {
                if (c || P['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', c, P);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](P)),
                        X.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    P.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    P.account.title = GameMgr.Inst.account_data.title;
                    P.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        P.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var a in P['account']) {
                        if (X.Inst['account_data'][a] = P['account'][a], 'platform_diamond' == a)
                            for (var I = P['account'][a], E = 0; E < I['length']; E++)
                                h['account_numerical_resource'][I[E].id] = I[E]['count'];
                        if ('skin_ticket' == a && (X.Inst['account_numerical_resource']['100004'] = P['account'][a]), 'platform_skin_ticket' == a)
                            for (var I = P['account'][a], E = 0; E < I['length']; E++)
                                h['account_numerical_resource'][I[E].id] = I[E]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        P['account']['room_id'] && X.Inst['updateRoom'](),
                        '10102' === X.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === X.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }






        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (h, c, P) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': h,
                        'account_id': parseInt(c.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': h,
                            'account_id': parseInt(c.toString())
                        }));
                    }
                }));
            }
            var X = GameMgr;
            var a = this;
            return h = h.trim(),
                app.Log.log('checkPaiPu game_uuid:' + h + ' account_id:' + c['toString']() + ' paipu_config:' + P),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), X.Inst['onLoadStart']('paipu'), 2 & P && (h = game['Tools']['DecodePaipuUUID'](h)), this['record_uuid'] = h, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: h,
                    client_version_string: this['getClientVersion']()
                }, function (X, I) {
                    if (X || I['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', X, I);
                        var E = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](E);
                        var F = function () {
                            return E += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, E)),
                                E >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, F), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, a, F),
                            a['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': I.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': I.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var b = I.head,
                            f = [null, null, null, null],
                            n = game['Tools']['strOfLocalization'](2003),
                            Q = b['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: h,
                            client_version_string: a['getClientVersion']()
                        }, function () { }),
                            Q['extendinfo'] && (n = game['Tools']['strOfLocalization'](2004)),
                            Q['detail_rule'] && Q['detail_rule']['ai_level'] && (1 === Q['detail_rule']['ai_level'] && (n = game['Tools']['strOfLocalization'](2003)), 2 === Q['detail_rule']['ai_level'] && (n = game['Tools']['strOfLocalization'](2004)));
                        var k = !1;
                        b['end_time'] ? (a['record_end_time'] = b['end_time'], b['end_time'] > '1576112400' && (k = !0)) : a['record_end_time'] = -1,
                            a['record_start_time'] = b['start_time'] ? b['start_time'] : -1;
                        for (var G = 0; G < b['accounts']['length']; G++) {
                            var o = b['accounts'][G];
                            if (o['character']) {
                                var z = o['character'],
                                    d = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (o.account_id == GameMgr.Inst.account_id) {
                                        o.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        o.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        o.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        o.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        o.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            o.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (o.avatar_id == 400101 || o.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            o.avatar_id = skin.id;
                                            o.character.charid = skin.character_id;
                                            o.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(o.account_id);
                                        if (server == 1) {
                                            o.nickname = '[CN]' + o.nickname;
                                        } else if (server == 2) {
                                            o.nickname = '[JP]' + o.nickname;
                                        } else if (server == 3) {
                                            o.nickname = '[EN]' + o.nickname;
                                        } else {
                                            o.nickname = '[??]' + o.nickname;
                                        }
                                    }
                                }
                                // END
                                if (k) {
                                    var y = o['views'];
                                    if (y)
                                        for (var N = 0; N < y['length']; N++)
                                            d[y[N].slot] = y[N]['item_id'];
                                } else {
                                    var u = z['views'];
                                    if (u)
                                        for (var N = 0; N < u['length']; N++) {
                                            var V = u[N].slot,
                                                K = u[N]['item_id'],
                                                j = V - 1;
                                            d[j] = K;
                                        }
                                }
                                var i = [];
                                for (var v in d)
                                    i.push({
                                        slot: parseInt(v),
                                        item_id: d[v]
                                    });
                                o['views'] = i,
                                    f[o.seat] = o;
                            } else
                                o['character'] = {
                                    charid: o['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(o['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    o['avatar_id'] = o['character'].skin,
                                    o['views'] = [],
                                    f[o.seat] = o;
                        }
                        for (var Z = game['GameUtility']['get_default_ai_skin'](), q = game['GameUtility']['get_default_ai_character'](), G = 0; G < f['length']; G++)
                            if (null == f[G]) {
                                f[G] = {
                                    nickname: n,
                                    avatar_id: Z,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: q,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: Z,
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
                                            f[G].avatar_id = skin.id;
                                            f[G].character.charid = skin.character_id;
                                            f[G].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        f[G].nickname = '[BOT]' + f[G].nickname;
                                    }
                                }
                                // END
                            }
                        var p = Laya['Handler']['create'](a, function (X) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](b['config'], f, Laya['Handler']['create'](a, function () {
                                    a['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = P,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](b['config'])), f, c, view['EMJMode']['paipu'], Laya['Handler']['create'](a, function () {
                                            uiscript['UI_Replay'].Inst['initData'](X),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, a, function () {
                                                    a['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, a, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, a, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](a, function (X) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * X);
                                }, null, !1));
                        }),
                            m = {};
                        if (m['record'] = b, I.data && I.data['length'])
                            m.game = net['MessageWrapper']['decodeMessage'](I.data), p['runWith'](m);
                        else {
                            var g = I['data_url'];
                            game['LoadMgr']['httpload'](g, 'arraybuffer', !1, Laya['Handler']['create'](a, function (X) {
                                if (X['success']) {
                                    var h = new Laya.Byte();
                                    h['writeArrayBuffer'](X.data);
                                    var c = net['MessageWrapper']['decodeMessage'](h['getUint8Array'](0, h['length']));
                                    m.game = c,
                                        p['runWith'](m);
                                } else
                                    uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + I['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), a['duringPaipu'] = !1;
                            }));
                        }
                    }
                }), void 0);
        }








        // 牌谱功能
        !function (X) {
            var h = function () {
                function h(X) {
                    var h = this;
                    this.me = X,
                        this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            h['locking'] || h.hide(null);
                        }),
                        this['title'] = this.me['getChildByName']('title'),
                        this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                        this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                        this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                        this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                        this.me['visible'] = !1,
                        this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            h['locking'] || h.hide(null);
                        }, null, !1),
                        this['container_hidename'] = this.me['getChildByName']('hidename'),
                        this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var c = this['container_hidename']['getChildByName']('w0'),
                        P = this['container_hidename']['getChildByName']('w1');
                    P.x = c.x + c['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            h['sp_checkbox']['visible'] = !h['sp_checkbox']['visible'],
                                h['refresh_share_uuid']();
                        });
                }
                return h['prototype']['show_share'] = function (h) {
                    var c = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                        this['sp_checkbox']['visible'] = !1,
                        this['btn_confirm']['visible'] = !1,
                        this['input']['editable'] = !1,
                        this.uuid = h,
                        this['refresh_share_uuid'](),
                        this.me['visible'] = !0,
                        this['locking'] = !0,
                        this['container_hidename']['visible'] = !0,
                        this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                        X['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            c['locking'] = !1;
                        }));
                },
                    h['prototype']['refresh_share_uuid'] = function () {
                        var X = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            h = this.uuid,
                            c = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + c + '?paipu=' + game['Tools']['EncodePaipuUUID'](h) + '_a' + X + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + c + '?paipu=' + h + '_a' + X;
                    },
                    h['prototype']['show_check'] = function () {
                        var h = this;
                        return X['UI_PiPeiYuYue'].Inst['enable'] ? (X['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return h['input'].text ? (h.hide(Laya['Handler']['create'](h, function () {
                                var X = h['input'].text['split']('='),
                                    c = X[X['length'] - 1]['split']('_'),
                                    P = 0;
                                c['length'] > 1 && (P = 'a' == c[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(c[1]['substr'](1))) : parseInt(c[1]));
                                var a = 0;
                                if (c['length'] > 2) {
                                    var I = parseInt(c[2]);
                                    I && (a = I);
                                }
                                GameMgr.Inst['checkPaiPu'](c[0], P, a);
                            })), void 0) : (X['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, X['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            h['locking'] = !1;
                        })), void 0);
                    },
                    h['prototype'].hide = function (h) {
                        var c = this;
                        this['locking'] = !0,
                            X['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                c['locking'] = !1,
                                    c.me['visible'] = !1,
                                    h && h.run();
                            }));
                    },
                    h;
            }
                (),
                c = function () {
                    function h(X) {
                        var h = this;
                        this.me = X,
                            this['blackbg'] = X['getChildByName']('blackbg'),
                            this.root = X['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                h['locking'] || h['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                h['locking'] || (game['Tools']['calu_word_length'](h['input'].text) > 30 ? h['toolong']['visible'] = !0 : (h['close'](), I['addCollect'](h.uuid, h['start_time'], h['end_time'], h['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return h['prototype'].show = function (h, c, P) {
                        var a = this;
                        this.uuid = h,
                            this['start_time'] = c,
                            this['end_time'] = P,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            X['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                a['locking'] = !1;
                            }));
                    },
                        h['prototype']['close'] = function () {
                            var h = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                X['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    h['locking'] = !1,
                                        h.me['visible'] = !1;
                                }));
                        },
                        h;
                }
                    ();
            X['UI_Pop_CollectInput'] = c;
            var P;
            !function (X) {
                X[X.ALL = 0] = 'ALL',
                    X[X['FRIEND'] = 1] = 'FRIEND',
                    X[X.RANK = 2] = 'RANK',
                    X[X['MATCH'] = 4] = 'MATCH',
                    X[X['COLLECT'] = 100] = 'COLLECT';
            }
                (P || (P = {}));
            var a = function () {
                function h(X) {
                    this['uuid_list'] = [],
                        this.type = X,
                        this['reset']();
                }
                return h['prototype']['reset'] = function () {
                    this['count'] = 0,
                        this['true_count'] = 0,
                        this['have_more_paipu'] = !0,
                        this['uuid_list'] = [],
                        this['duringload'] = !1,
                        this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                    h['prototype']['loadList'] = function (h) {
                        var c = this;
                        if (void 0 === h && (h = 10), !this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == P['COLLECT']) {
                                for (var a = [], E = 0, F = 0; 10 > F; F++) {
                                    var b = this['count'] + F;
                                    if (b >= I['collect_lsts']['length'])
                                        break;
                                    E++;
                                    var f = I['collect_lsts'][b];
                                    I['record_map'][f] || a.push(f),
                                        this['uuid_list'].push(f);
                                }
                                a['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: a
                                }, function (h, P) {
                                    if (c['duringload'] = !1, I.Inst['onLoadStateChange'](c.type, !1), h || P['error'])
                                        X['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', h, P);
                                    else if (app.Log.log(JSON['stringify'](P)), P['record_list'] && P['record_list']['length'] == a['length']) {
                                        for (var F = 0; F < P['record_list']['length']; F++) {
                                            var b = P['record_list'][F].uuid;
                                            I['record_map'][b] || (I['record_map'][b] = P['record_list'][F]);
                                        }
                                        c['count'] += E,
                                            c['count'] >= I['collect_lsts']['length'] && (c['have_more_paipu'] = !1, I.Inst['onLoadOver'](c.type)),
                                            I.Inst['onLoadMoreLst'](c.type, E);
                                    } else
                                        c['have_more_paipu'] = !1, I.Inst['onLoadOver'](c.type);
                                }) : (this['duringload'] = !1, this['count'] += E, this['count'] >= I['collect_lsts']['length'] && (this['have_more_paipu'] = !1, I.Inst['onLoadOver'](this.type)), I.Inst['onLoadMoreLst'](this.type, E));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (h, a) {
                                    if (c['duringload'] = !1, I.Inst['onLoadStateChange'](c.type, !1), h || a['error'])
                                        X['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', h, a);
                                    else if (app.Log.log(JSON['stringify'](a)), a['record_list'] && a['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(a),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(a));
                                                }
                                            }));
                                            for (let record_list of a['record_list']) {
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
                                        for (var E = a['record_list'], F = 0, b = 0; b < E['length']; b++) {
                                            var f = E[b].uuid;
                                            if (c.type == P.RANK && E[b]['config'] && E[b]['config'].meta) {
                                                var n = E[b]['config'].meta;
                                                if (n) {
                                                    var Q = cfg['desktop']['matchmode'].get(n['mode_id']);
                                                    if (Q && 5 == Q.room)
                                                        continue;
                                                }
                                            }
                                            F++,
                                                c['uuid_list'].push(f),
                                                I['record_map'][f] || (I['record_map'][f] = E[b]);
                                        }
                                        c['count'] += F,
                                            c['true_count'] += E['length'],
                                            I.Inst['onLoadMoreLst'](c.type, F),
                                            c['have_more_paipu'] = !0;
                                    } else
                                        c['have_more_paipu'] = !1, I.Inst['onLoadOver'](c.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                c['duringload'] && I.Inst['onLoadStateChange'](c.type, !0);
                            });
                        }
                    },
                    h['prototype']['removeAt'] = function (X) {
                        for (var h = 0; h < this['uuid_list']['length'] - 1; h++)
                            h >= X && (this['uuid_list'][h] = this['uuid_list'][h + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    h;
            }
                (),
                I = function (I) {
                    function E() {
                        var X = I.call(this, new ui['lobby']['paipuUI']()) || this;
                        return X.top = null,
                            X['container_scrollview'] = null,
                            X['scrollview'] = null,
                            X['loading'] = null,
                            X.tabs = [],
                            X['pop_otherpaipu'] = null,
                            X['pop_collectinput'] = null,
                            X['label_collect_count'] = null,
                            X['noinfo'] = null,
                            X['locking'] = !1,
                            X['current_type'] = P.ALL,
                            E.Inst = X,
                            X;
                    }
                    return __extends(E, I),
                        E.init = function () {
                            var X = this;
                            this['paipuLst'][P.ALL] = new a(P.ALL),
                                this['paipuLst'][P['FRIEND']] = new a(P['FRIEND']),
                                this['paipuLst'][P.RANK] = new a(P.RANK),
                                this['paipuLst'][P['MATCH']] = new a(P['MATCH']),
                                this['paipuLst'][P['COLLECT']] = new a(P['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (h, c) {
                                    if (h || c['error']);
                                    else {
                                        if (c['record_list']) {
                                            for (var P = c['record_list'], a = 0; a < P['length']; a++) {
                                                var I = {
                                                    uuid: P[a].uuid,
                                                    time: P[a]['end_time'],
                                                    remarks: P[a]['remarks']
                                                };
                                                X['collect_lsts'].push(I.uuid),
                                                    X['collect_info'][I.uuid] = I;
                                            }
                                            X['collect_lsts'] = X['collect_lsts'].sort(function (h, c) {
                                                return X['collect_info'][c].time - X['collect_info'][h].time;
                                            });
                                        }
                                        c['record_collect_limit'] && (X['collect_limit'] = c['record_collect_limit']);
                                    }
                                });
                        },
                        E['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        E['reset'] = function () {
                            this['paipuLst'][P.ALL] && this['paipuLst'][P.ALL]['reset'](),
                                this['paipuLst'][P['FRIEND']] && this['paipuLst'][P['FRIEND']]['reset'](),
                                this['paipuLst'][P.RANK] && this['paipuLst'][P.RANK]['reset'](),
                                this['paipuLst'][P['MATCH']] && this['paipuLst'][P['MATCH']]['reset']();
                        },
                        E['addCollect'] = function (h, c, P, a) {
                            var I = this;
                            if (!this['collect_info'][h]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return X['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: h,
                                    remarks: a,
                                    start_time: c,
                                    end_time: P
                                }, function () { });
                                var F = {
                                    uuid: h,
                                    remarks: a,
                                    time: P
                                };
                                this['collect_info'][h] = F,
                                    this['collect_lsts'].push(h),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (X, h) {
                                        return I['collect_info'][h].time - I['collect_info'][X].time;
                                    }),
                                    X['UI_DesktopInfo'].Inst && X['UI_DesktopInfo'].Inst['enable'] && X['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    E.Inst && E.Inst['enable'] && E.Inst['onCollectChange'](h, -1);
                            }
                        },
                        E['removeCollect'] = function (h) {
                            var c = this;
                            if (this['collect_info'][h]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: h
                                }, function () { }),
                                    delete this['collect_info'][h];
                                for (var P = -1, a = 0; a < this['collect_lsts']['length']; a++)
                                    if (this['collect_lsts'][a] == h) {
                                        this['collect_lsts'][a] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            P = a;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (X, h) {
                                        return c['collect_info'][h].time - c['collect_info'][X].time;
                                    }),
                                    X['UI_DesktopInfo'].Inst && X['UI_DesktopInfo'].Inst['enable'] && X['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    E.Inst && E.Inst['enable'] && E.Inst['onCollectChange'](h, P);
                            }
                        },
                        E['prototype']['onCreate'] = function () {
                            var P = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    P['locking'] || P['close'](Laya['Handler']['create'](P, function () {
                                        X['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (X) {
                                    P['setItemValue'](X['index'], X['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var X = E['paipuLst'][P['current_type']];
                                    (1 - P['scrollview'].rate) * X['count'] < 3 && (X['duringload'] || (X['have_more_paipu'] ? X['loadList']() : 0 == X['count'] && (P['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    P['pop_otherpaipu'].me['visible'] || P['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var a = 0; 5 > a; a++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](a)), this.tabs[a]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [a, !1]);
                            this['pop_otherpaipu'] = new h(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new c(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        E['prototype'].show = function () {
                            var h = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                X['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                X['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    h['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = E['collect_lsts']['length']['toString']() + '/' + E['collect_limit']['toString']();
                        },
                        E['prototype']['close'] = function (h) {
                            var c = this;
                            this['locking'] = !0,
                                X['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                X['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    c['locking'] = !1,
                                        c['enable'] = !1,
                                        h && h.run();
                                });
                        },
                        E['prototype']['changeTab'] = function (X, h) {
                            var c = [P.ALL, P.RANK, P['FRIEND'], P['MATCH'], P['COLLECT']];
                            if (h || c[X] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = c[X], this['current_type'] == P['COLLECT'] && E['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != P['COLLECT']) {
                                    var a = E['paipuLst'][this['current_type']]['count'];
                                    a > 0 && this['scrollview']['addItem'](a);
                                }
                                for (var I = 0; I < this.tabs['length']; I++) {
                                    var F = this.tabs[I];
                                    F['getChildByName']('img').skin = game['Tools']['localUISrc'](X == I ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        F['getChildByName']('label_name')['color'] = X == I ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        E['prototype']['setItemValue'] = function (h, c) {
                            var P = this;
                            if (this['enable']) {
                                var a = E['paipuLst'][this['current_type']];
                                if (a || !(h >= a['uuid_list']['length'])) {
                                    for (var I = E['record_map'][a['uuid_list'][h]], F = 0; 4 > F; F++) {
                                        var b = c['getChildByName']('p' + F['toString']());
                                        if (F < I['result']['players']['length']) {
                                            b['visible'] = !0;
                                            var f = b['getChildByName']('chosen'),
                                                n = b['getChildByName']('rank'),
                                                Q = b['getChildByName']('rank_word'),
                                                k = b['getChildByName']('name'),
                                                G = b['getChildByName']('score'),
                                                o = I['result']['players'][F];
                                            G.text = o['part_point_1'] || '0';
                                            for (var z = 0, d = game['Tools']['strOfLocalization'](2133), y = 0, N = !1, u = 0; u < I['accounts']['length']; u++)
                                                if (I['accounts'][u].seat == o.seat) {
                                                    z = I['accounts'][u]['account_id'],
                                                        d = I['accounts'][u]['nickname'],
                                                        y = I['accounts'][u]['verified'],
                                                        N = I['accounts'][u]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](k, {
                                                account_id: z,
                                                nickname: d,
                                                verified: y
                                            }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                                f['visible'] = N,
                                                G['color'] = N ? '#ffc458' : '#b98930',
                                                k['getChildByName']('name')['color'] = N ? '#dfdfdf' : '#a0a0a0',
                                                Q['color'] = n['color'] = N ? '#57bbdf' : '#489dbc';
                                            var V = b['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (F) {
                                                    case 0:
                                                        V.text = 'st';
                                                        break;
                                                    case 1:
                                                        V.text = 'nd';
                                                        break;
                                                    case 2:
                                                        V.text = 'rd';
                                                        break;
                                                    case 3:
                                                        V.text = 'th';
                                                }
                                        } else
                                            b['visible'] = !1;
                                    }
                                    var K = new Date(1000 * I['end_time']),
                                        j = '';
                                    j += K['getFullYear']() + '/',
                                        j += (K['getMonth']() < 9 ? '0' : '') + (K['getMonth']() + 1)['toString']() + '/',
                                        j += (K['getDate']() < 10 ? '0' : '') + K['getDate']() + ' ',
                                        j += (K['getHours']() < 10 ? '0' : '') + K['getHours']() + ':',
                                        j += (K['getMinutes']() < 10 ? '0' : '') + K['getMinutes'](),
                                        c['getChildByName']('date').text = j,
                                        c['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return P['locking'] ? void 0 : X['UI_PiPeiYuYue'].Inst['enable'] ? (X['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](I.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        c['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            P['locking'] || P['pop_otherpaipu'].me['visible'] || (P['pop_otherpaipu']['show_share'](I.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var i = c['getChildByName']('room'),
                                        v = game['Tools']['get_room_desc'](I['config']);
                                    i.text = v.text;
                                    var Z = '';
                                    if (1 == I['config']['category'])
                                        Z = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == I['config']['category'])
                                        Z = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == I['config']['category']) {
                                        var q = I['config'].meta;
                                        if (q) {
                                            var p = cfg['desktop']['matchmode'].get(q['mode_id']);
                                            p && (Z = p['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (E['collect_info'][I.uuid]) {
                                        var m = E['collect_info'][I.uuid],
                                            g = c['getChildByName']('remarks_info'),
                                            s = c['getChildByName']('input'),
                                            C = s['getChildByName']('txtinput'),
                                            L = c['getChildByName']('btn_input'),
                                            A = !1,
                                            e = function () {
                                                A ? (g['visible'] = !1, s['visible'] = !0, C.text = g.text, L['visible'] = !1) : (g.text = m['remarks'] && '' != m['remarks'] ? game['Tools']['strWithoutForbidden'](m['remarks']) : Z, g['visible'] = !0, s['visible'] = !1, L['visible'] = !0);
                                            };
                                        e(),
                                            L['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                A = !0,
                                                    e();
                                            }, null, !1),
                                            C.on('blur', this, function () {
                                                A && (game['Tools']['calu_word_length'](C.text) > 30 ? X['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : C.text != m['remarks'] && (m['remarks'] = C.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: I.uuid,
                                                    remarks: C.text
                                                }, function () { }))),
                                                    A = !1,
                                                    e();
                                            });
                                        var R = c['getChildByName']('collect');
                                        R['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](P, function () {
                                                E['removeCollect'](I.uuid);
                                            }));
                                        }, null, !1),
                                            R['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        c['getChildByName']('input')['visible'] = !1,
                                            c['getChildByName']('btn_input')['visible'] = !1,
                                            c['getChildByName']('remarks_info')['visible'] = !0,
                                            c['getChildByName']('remarks_info').text = Z;
                                        var R = c['getChildByName']('collect');
                                        R['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            P['pop_collectinput'].show(I.uuid, I['start_time'], I['end_time']);
                                        }, null, !1),
                                            R['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        E['prototype']['onLoadStateChange'] = function (X, h) {
                            this['current_type'] == X && (this['loading']['visible'] = h);
                        },
                        E['prototype']['onLoadMoreLst'] = function (X, h) {
                            this['current_type'] == X && this['scrollview']['addItem'](h);
                        },
                        E['prototype']['getScrollViewCount'] = function () {
                            return this['scrollview']['value_count'];
                        },
                        E['prototype']['onLoadOver'] = function (X) {
                            if (this['current_type'] == X) {
                                var h = E['paipuLst'][this['current_type']];
                                0 == h['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        E['prototype']['onCollectChange'] = function (X, h) {
                            if (this['current_type'] == P['COLLECT'])
                                h >= 0 && (E['paipuLst'][P['COLLECT']]['removeAt'](h), this['scrollview']['delItem'](h));
                            else
                                for (var c = E['paipuLst'][this['current_type']]['uuid_list'], a = 0; a < c['length']; a++)
                                    if (c[a] == X) {
                                        this['scrollview']['wantToRefreshItem'](a);
                                        break;
                                    }
                            this['label_collect_count'].text = E['collect_lsts']['length']['toString']() + '/' + E['collect_limit']['toString']();
                        },
                        E['prototype']['refreshAll'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        E.Inst = null,
                        E['paipuLst'] = {},
                        E['collect_lsts'] = [],
                        E['record_map'] = {},
                        E['collect_info'] = {},
                        E['collect_limit'] = 20,
                        E;
                }
                    (X['UIBase']);
            X['UI_PaiPu'] = I;
        }
            (uiscript || (uiscript = {}));








        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var X = GameMgr;
            var h = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (X, c) {
                X || c['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', X, c) : h['server_time_delta'] = 1000 * c['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (X, c) {
                X || c['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', X, c) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](c)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, c['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](c['settings']), c['settings']['nickname_setting'] && (h['nickname_replace_enable'] = !!c['settings']['nickname_setting']['enable'], h['nickname_replace_lst'] = c['settings']['nickname_setting']['nicknames'], h['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = c['settings']['allow_modify_nickname']);
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (X, c) {
                X || c['error'] || (h['client_endpoint'] = c['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (X) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](X));
                var c = X['update'];
                if (c) {
                    if (c['numerical'])
                        for (var P = 0; P < c['numerical']['length']; P++) {
                            var a = c['numerical'][P].id,
                                I = c['numerical'][P]['final'];
                            switch (a) {
                                case '100001':
                                    h['account_data']['diamond'] = I;
                                    break;
                                case '100002':
                                    h['account_data'].gold = I;
                                    break;
                                case '100099':
                                    h['account_data'].vip = I,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (a >= '101001' || '102999' >= a) && (h['account_numerical_resource'][a] = I);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](c),
                        c['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](c['daily_task']),
                        c['title'] && uiscript['UI_TitleBook']['title_update'](c['title']),
                        c['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](c),
                        (c['activity_task'] || c['activity_period_task'] || c['activity_random_task'] || c['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](c),
                        c['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](c['activity_flip_task']['progresses']),
                        c['activity'] && (c['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](c['activity']['friend_gift_data']), c['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](c['activity']['upgrade_data']), c['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](c['activity']['gacha_data']), c['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](c['activity']['simulation_data']), c['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](c['activity']['spot_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (X) {
                app.Log.log('收到消息：' + JSON['stringify'](X)),
                    X.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](X['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (X) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    X['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](X['settings']), X['settings']['nickname_setting'] && (h['nickname_replace_enable'] = !!X['settings']['nickname_setting']['enable'], h['nickname_replace_lst'] = X['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = X['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (X) {
                uiscript['UI_Sushe']['send_gift_limit'] = X['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = X['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = X['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = X['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = X['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (X) {
                uiscript['UI_Guajichenfa'].Inst.show(X);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (X) {
                h['auth_check_id'] = X['check_id'],
                    h['auth_nc_retry_count'] = 0,
                    4 == X.type ? h['showNECaptcha']() : 2 == X.type ? h['checkNc']() : h['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    var X = (Laya['timer']['currTimer'] - h['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: X
                    }, function () { }),
                        X >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var X = Laya['stage']['getMousePoint']();
                (X.x != h['_pre_mouse_point'].x || X.y != h['_pre_mouse_point'].y) && (h['clientHeatBeat'](), h['_pre_mouse_point'].x = X.x, h['_pre_mouse_point'].y = X.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == X['client_type'] && Laya['timer'].loop(3600000, this, function () {
                h['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == X['client_language']) {
                var c = document['createElement']('link');
                c.rel = 'stylesheet',
                    c.href = 'font/notosansjapanese_1.css';
                var P = document['getElementsByTagName']('head')[0];
                P['appendChild'](c);
            }
        }





        // 设置状态
        !function (X) {
            var h = function () {
                function X(h) {
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
                        X.Inst = this,
                        this.me = h,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var c = 0; 3 > c; c++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + c));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var c = 0; 3 > c; c++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + c));
                    for (var c = 0; 2 > c; c++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + c));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                }
                return Object['defineProperty'](X['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    X['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    X['prototype']['showCD'] = function (X, h) {
                        var c = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](X / 1000),
                            this._add = Math['floor'](h / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var X = Laya['timer']['currTimer'] - c['_pre_time'];
                                c['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? c['_start'] += X : c['_show']();
                            });
                    },
                    X['prototype']['close'] = function () {
                        this['reset']();
                    },
                    X['prototype']['_show'] = function () {
                        var X = this._fix + this._add - this['timeuse'];
                        if (0 >= X)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (X != this['_pre_sec']) {
                            if (this['_pre_sec'] = X, X > this._add) {
                                for (var h = (X - this._add)['toString'](), c = 0; c < this['_img_countdown_c0']['length']; c++)
                                    this['_img_countdown_c0'][c]['visible'] = c < h['length'];
                                if (3 == h['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[2] + '.png')) : 2 == h['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + h[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var P = this._add['toString'](), c = 0; c < this['_img_countdown_add']['length']; c++) {
                                        var a = this['_img_countdown_add'][c];
                                        c < P['length'] ? (a['visible'] = !0, a.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + P[c] + '.png')) : a['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var c = 0; c < this['_img_countdown_add']['length']; c++)
                                        this['_img_countdown_add'][c]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var h = X['toString'](), c = 0; c < this['_img_countdown_c0']['length']; c++)
                                    this['_img_countdown_c0'][c]['visible'] = c < h['length'];
                                3 == h['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[2] + '.png')) : 2 == h['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + h[0] + '.png');
                            }
                            if (X > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var c = 0; c < this['_img_countdown_c0']['length']; c++)
                                    this['_img_countdown_c0'][c]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                    this['_container_c1']['visible'] = !0;
                                for (var c = 0; c < this['_img_countdown_c0']['length']; c++)
                                    this['_img_countdown_c0'][c]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                                for (var c = 0; c < this['_img_countdown_c1']['length']; c++)
                                    this['_img_countdown_c1'][c]['visible'] = this['_img_countdown_c0'][c]['visible'], this['_img_countdown_c1'][c].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][c].skin);
                                E.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    X.Inst = null,
                    X;
            }
                (),
                c = function () {
                    function X(X) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = X;
                    }
                    return X['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        X['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        X['prototype']['_loop_refresh_delay'] = function () {
                            var X = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var h = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var c = app['NetAgent']['mj_network_delay'];
                                    h = 300 > c ? 2000 : 800 > c ? 2500 + c : 4000 + 0.5 * c,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            X['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    h = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), h);
                            }
                        },
                        X['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var X = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > X ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > X ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        X;
                }
                    (),
                P = function () {
                    function X(X, h) {
                        var c = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = h,
                            this.me = X,
                            this['btn_banemj'] = X['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = X['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = X['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || (c['emj_banned'] = !c['emj_banned'], c['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (c['emj_banned'] ? '_on.png' : '.png')), c['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || (c['close'](), E.Inst['btn_seeinfo'](c['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || (c['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](c['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || c['switch']();
                            }, null, !1);
                    }
                    return X['prototype']['reset'] = function (X, h, c) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = X,
                            this['showemj'] = h,
                            this['showchange'] = c,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        X['prototype']['onChangeSeat'] = function (X, h, c) {
                            this['showinfo'] = X,
                                this['showemj'] = h,
                                this['showchange'] = c,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        X['prototype']['switch'] = function () {
                            var X = this;
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
                                X['locking'] = !1;
                            })));
                        },
                        X['prototype']['close'] = function () {
                            var X = this;
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
                                    X['locking'] = !1,
                                        X['btn_banemj']['visible'] = !1,
                                        X['btn_seeinfo']['visible'] = !1,
                                        X['btn_change']['visible'] = !1;
                                });
                        },
                        X;
                }
                    (),
                a = function () {
                    function X(X) {
                        var h = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = X,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                h['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                h['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function () {
                                h['scrollview']['total_height'] > 0 ? h['scrollbar']['setVal'](h['scrollview'].rate, h['scrollview']['view_height'] / h['scrollview']['total_height']) : h['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return X['prototype']['initRoom'] = function () {
                        // START 
                        //var X = view['DesktopMgr'].Inst['main_role_character_info'],
                        // END
                        var X = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            h = cfg['item_definition']['character'].find(X['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var c = 0; 9 > c; c++)
                            this.emos.push({
                                path: h.emo + '/' + c + '.png',
                                sub_id: c,
                                sort: c
                            });
                        if (X['extra_emoji'])
                            for (var c = 0; c < X['extra_emoji']['length']; c++)
                                this.emos.push({
                                    path: h.emo + '/' + X['extra_emoji'][c] + '.png',
                                    sub_id: X['extra_emoji'][c],
                                    sort: X['extra_emoji'][c] > 12 ? 1000000 - X['extra_emoji'][c] : X['extra_emoji'][c]
                                });
                        this.emos = this.emos.sort(function (X, h) {
                            return X.sort - h.sort;
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
                                char_id: X['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        X['prototype']['render_item'] = function (X) {
                            var h = this,
                                c = X['index'],
                                P = X['container'],
                                a = this.emos[c],
                                I = P['getChildByName']('btn');
                            I.skin = game['LoadMgr']['getResImageSkin'](a.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](I, !0) : (game['Tools']['setGrayDisable'](I, !1), I['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var X = !1, c = 0, P = h['emo_infos']['emoji']; c < P['length']; c++) {
                                            var I = P[c];
                                            if (I[0] == a['sub_id']) {
                                                I[0]++,
                                                    X = !0;
                                                break;
                                            }
                                        }
                                        X || h['emo_infos']['emoji'].push([a['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: a['sub_id']
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    h['change_all_gray'](!0),
                                        Laya['timer'].once(5000, h, function () {
                                            h['change_all_gray'](!1);
                                        }),
                                        h['switchShow'](!1);
                                }, null, !1));
                        },
                        X['prototype']['change_all_gray'] = function (X) {
                            this['allgray'] = X,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        X['prototype']['switchShow'] = function (X) {
                            var h = this,
                                c = 0;
                            c = X ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, X ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    X ? (h.out['visible'] = !1, h.in['visible'] = !0) : (h.out['visible'] = !0, h.in['visible'] = !1),
                                        Laya['Tween'].to(h.me, {
                                            x: c
                                        }, X ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](h, function () {
                                            h['btn_chat']['disabled'] = !1,
                                                h['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        X['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var X = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: X,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: E.Inst['min_double_time'],
                            //        g: E.Inst['max_double_time']
                            //    }, !1),
                            //    this['emo_infos']['emoji'] = [];
                            //}
                            //this['emo_log_count']++;
                            // END
                        },
                        X['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        X;
                }
                    (),
                I = function () {
                    function h(h) {
                        this['effect'] = null,
                            this['container_emo'] = h['getChildByName']('chat_bubble'),
                            this.emo = new X['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = h['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return h['prototype'].show = function (X, h) {
                        var c = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var P = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](X)]['character']['charid'], a = cfg['character']['emoji']['getGroup'](P), I = '', E = 0, F = 0; F < a['length']; F++)
                                if (a[F]['sub_id'] == h) {
                                    2 == a[F].type && (I = a[F].view, E = a[F]['audio']);
                                    break;
                                }
                            this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                I ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + I + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    c['effect'] && (c['effect']['destory'](), c['effect'] = null);
                                }), E && view['AudioMgr']['PlayAudio'](E)) : (this.emo['setSkin'](P, h), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    c.emo['clear'](),
                                        Laya['Tween'].to(c['container_emo'], {
                                            scaleX: 0,
                                            scaleY: 0
                                        }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    c['container_emo']['visible'] = !1;
                                }));
                        }
                    },
                        h['prototype']['reset'] = function () {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        h;
                }
                    (),
                E = function (E) {
                    function F() {
                        var X = E.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return X['container_doras'] = null,
                            X['doras'] = [],
                            X['front_doras'] = [],
                            X['label_md5'] = null,
                            X['container_gamemode'] = null,
                            X['label_gamemode'] = null,
                            X['btn_auto_moqie'] = null,
                            X['btn_auto_nofulu'] = null,
                            X['btn_auto_hule'] = null,
                            X['img_zhenting'] = null,
                            X['btn_double_pass'] = null,
                            X['_network_delay'] = null,
                            X['_timecd'] = null,
                            X['_player_infos'] = [],
                            X['_container_fun'] = null,
                            X['_fun_in'] = null,
                            X['_fun_out'] = null,
                            X['showscoredeltaing'] = !1,
                            X['_btn_set'] = null,
                            X['_btn_leave'] = null,
                            X['_btn_fanzhong'] = null,
                            X['_btn_collect'] = null,
                            X['block_emo'] = null,
                            X['head_offset_y'] = 15,
                            X['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            X['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](X, function (h) {
                                X['onGameBroadcast'](h);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](X, function (h) {
                                X['onPlayerConnectionState'](h);
                            })),
                            F.Inst = X,
                            X;
                    }
                    return __extends(F, E),
                        F['prototype']['onCreate'] = function () {
                            var E = this;
                            this['doras'] = new Array(),
                                this['front_doras'] = [];
                            var F = this.me['getChildByName']('container_lefttop'),
                                b = F['getChildByName']('container_doras');
                            this['container_doras'] = b,
                                this['container_gamemode'] = F['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = F['getChildByName']('MD5'),
                                F['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (E['label_md5']['visible'])
                                        Laya['timer']['clearAll'](E['label_md5']), E['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? F['getChildByName']('activitymode')['visible'] = !0 : E['container_doras']['visible'] = !0;
                                    else {
                                        E['label_md5']['visible'] = !0,
                                            view['DesktopMgr'].Inst['sha256'] ? (E['label_md5']['fontSize'] = 20, E['label_md5'].y = 45, E['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (E['label_md5']['fontSize'] = 25, E['label_md5'].y = 51, E['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            F['getChildByName']('activitymode')['visible'] = !1,
                                            E['container_doras']['visible'] = !1;
                                        var X = E;
                                        Laya['timer'].once(5000, E['label_md5'], function () {
                                            X['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? F['getChildByName']('activitymode')['visible'] = !0 : E['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var f = 0; f < b['numChildren']; f++)
                                this['doras'].push(b['getChildAt'](f)), this['front_doras'].push(b['getChildAt'](f)['getChildAt'](0));
                            for (var f = 0; 4 > f; f++) {
                                var n = this.me['getChildByName']('container_player_' + f),
                                    Q = {};
                                Q['container'] = n,
                                    Q.head = new X['UI_Head'](n['getChildByName']('head'), ''),
                                    Q['head_origin_y'] = n['getChildByName']('head').y,
                                    Q.name = n['getChildByName']('container_name')['getChildByName']('name'),
                                    Q['container_shout'] = n['getChildByName']('container_shout'),
                                    Q['container_shout']['visible'] = !1,
                                    Q['illust'] = Q['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    Q['illustrect'] = X['UIRect']['CreateFromSprite'](Q['illust']),
                                    Q['shout_origin_x'] = Q['container_shout'].x,
                                    Q['shout_origin_y'] = Q['container_shout'].y,
                                    Q.emo = new I(n),
                                    Q['disconnect'] = n['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    Q['disconnect']['visible'] = !1,
                                    Q['title'] = new X['UI_PlayerTitle'](n['getChildByName']('title'), ''),
                                    Q.que = n['getChildByName']('que'),
                                    Q['que_target_pos'] = new Laya['Vector2'](Q.que.x, Q.que.y),
                                    Q['tianming'] = n['getChildByName']('tianming'),
                                    Q['tianming']['visible'] = !1,
                                    0 == f ? n['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        E['btn_seeinfo'](0);
                                    }, null, !1) : Q['headbtn'] = new P(n['getChildByName']('btn_head'), f),
                                    this['_player_infos'].push(Q);
                            }
                            this['_timecd'] = new h(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new a(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var h = 0, c = 0; c < view['DesktopMgr'].Inst['player_datas']['length']; c++)
                                                view['DesktopMgr'].Inst['player_datas'][c]['account_id'] && h++;
                                            if (1 >= h)
                                                X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](E, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var X = 0, h = 0; h < view['DesktopMgr'].Inst['player_datas']['length']; h++) {
                                                            var c = view['DesktopMgr'].Inst['player_datas'][h];
                                                            c && null != c['account_id'] && 0 != c['account_id'] && X++;
                                                        }
                                                        1 == X ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var P = !1;
                                                if (X['UI_VoteProgress']['vote_info']) {
                                                    var a = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - X['UI_VoteProgress']['vote_info']['start_time'] - X['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > a && (P = !0);
                                                }
                                                P ? X['UI_VoteProgress'].Inst['enable'] || X['UI_VoteProgress'].Inst.show() : X['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? X['UI_VoteCD'].Inst['enable'] || X['UI_VoteCD'].Inst.show() : X['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), X['UI_Ob_Replay'].Inst['resetRounds'](), X['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && X['UI_Desktop_Yindao'].Inst['close']();
                                }, null, !1),
                                this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                                this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    X['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    X['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (X['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? X['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](E, function () {
                                        X['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : X['UI_Replay'].Inst && X['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var k = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var h = Laya['timer']['currTimer'];
                                    if (k + 300 > h) {
                                        if (X['UI_ChiPengHu'].Inst['enable'])
                                            X['UI_ChiPengHu'].Inst['onDoubleClick'](), E['recordDoubleClickTime'](h - k);
                                        else {
                                            var c = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            X['UI_LiQiZiMo'].Inst['enable'] && (c = X['UI_LiQiZiMo'].Inst['onDoubleClick'](c)),
                                                c && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && E['recordDoubleClickTime'](h - k);
                                        }
                                        k = 0;
                                    } else
                                        k = h;
                                }
                            }, null, !1),
                                this['_network_delay'] = new c(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (F['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        F['prototype']['recordDoubleClickTime'] = function (X) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(X, this['min_double_time'])) : X,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(X, this['max_double_time']) : X;
                        },
                        F['prototype']['onGameBroadcast'] = function (X) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](X));
                            var h = view['DesktopMgr'].Inst['seat2LocalPosition'](X.seat),
                                c = JSON['parse'](X['content']);
                            null != c.emo && void 0 != c.emo && (this['onShowEmo'](h, c.emo), this['showAIEmo']());
                        },
                        F['prototype']['onPlayerConnectionState'] = function (X) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](X));
                            var h = X.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && h < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][h] = X['state']), this['enable']) {
                                var c = view['DesktopMgr'].Inst['seat2LocalPosition'](h);
                                this['_player_infos'][c]['disconnect']['visible'] = X['state'] != view['ELink_State']['READY'];
                            }
                        },
                        F['prototype']['_initFunc'] = function () {
                            var X = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var h = this['_fun_out']['getChildByName']('btn_func'),
                                c = this['_fun_out']['getChildByName']('btn_func2'),
                                P = this['_fun_in_spr']['getChildByName']('btn_func');
                            h['clickHandler'] = c['clickHandler'] = new Laya['Handler'](this, function () {
                                var a = 0;
                                a = -270,
                                    Laya['Tween'].to(X['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](X, function () {
                                        X['_fun_in']['visible'] = !0,
                                            X['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(X['_container_fun'], {
                                                x: a
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](X, function () {
                                                h['disabled'] = !1,
                                                    c['disabled'] = !1,
                                                    P['disabled'] = !1,
                                                    X['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    h['disabled'] = !0,
                                    c['disabled'] = !0,
                                    P['disabled'] = !0;
                            }, null, !1),
                                P['clickHandler'] = new Laya['Handler'](this, function () {
                                    var a = -546;
                                    Laya['Tween'].to(X['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](X, function () {
                                        X['_fun_in']['visible'] = !1,
                                            X['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(X['_container_fun'], {
                                                x: a
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](X, function () {
                                                h['disabled'] = !1,
                                                    c['disabled'] = !1,
                                                    P['disabled'] = !1,
                                                    X['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        h['disabled'] = !0,
                                        c['disabled'] = !0,
                                        P['disabled'] = !0;
                                });
                            var a = this['_fun_in']['getChildByName']('btn_autolipai'),
                                I = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                E = this['_fun_out']['getChildByName']('autolipai'),
                                F = Laya['LocalStorage']['getItem']('autolipai'),
                                b = !0;
                            b = F && '' != F ? 'true' == F : !0,
                                this['refreshFuncBtnShow'](a, E, b),
                                a['clickHandler'] = I['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        X['refreshFuncBtnShow'](a, E, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var f = this['_fun_in']['getChildByName']('btn_autohu'),
                                n = this['_fun_out']['getChildByName']('btn_autohu2'),
                                Q = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](f, Q, !1),
                                f['clickHandler'] = n['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        X['refreshFuncBtnShow'](f, Q, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var k = this['_fun_in']['getChildByName']('btn_autonoming'),
                                G = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                o = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](k, o, !1),
                                k['clickHandler'] = G['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        X['refreshFuncBtnShow'](k, o, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var z = this['_fun_in']['getChildByName']('btn_automoqie'),
                                d = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                y = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](z, y, !1),
                                z['clickHandler'] = d['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        X['refreshFuncBtnShow'](z, y, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (E['scale'](0.9, 0.9), Q['scale'](0.9, 0.9), o['scale'](0.9, 0.9), y['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (h['visible'] = !1, n['visible'] = !0, I['visible'] = !0, G['visible'] = !0, d['visible'] = !0) : (h['visible'] = !0, n['visible'] = !1, I['visible'] = !1, G['visible'] = !1, d['visible'] = !1);
                        },
                        F['prototype']['noAutoLipai'] = function () {
                            var X = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                X['clickHandler'].run();
                        },
                        F['prototype']['resetFunc'] = function () {
                            var X = Laya['LocalStorage']['getItem']('autolipai'),
                                h = !0;
                            h = X && '' != X ? 'true' == X : !0;
                            var c = this['_fun_in']['getChildByName']('btn_autolipai'),
                                P = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](c, P, h),
                                Laya['LocalStorage']['setItem']('autolipai', h ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](h);
                            var a = this['_fun_in']['getChildByName']('btn_autohu'),
                                I = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](a, I, view['DesktopMgr'].Inst['auto_hule']);
                            var E = this['_fun_in']['getChildByName']('btn_autonoming'),
                                F = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](E, F, view['DesktopMgr'].Inst['auto_nofulu']);
                            var b = this['_fun_in']['getChildByName']('btn_automoqie'),
                                f = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](b, f, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var n = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            n['disabled'] = !1,
                                n['disabled'] = !1;
                        },
                        F['prototype']['setDora'] = function (X, h) {
                            if (0 > X || X >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var c = 'myres2/mjpm/' + (h['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                            this['doras'][X].skin = game['Tools']['localUISrc'](c + h['toString'](!1) + '.png'),
                                this['front_doras'][X]['visible'] = !h['touming'],
                                this['front_doras'][X].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                        },
                        F['prototype']['initRoom'] = function () {
                            var h = this;
                            if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var c = {}, P = 0; P < view['DesktopMgr'].Inst['player_datas']['length']; P++) {
                                    for (var a = view['DesktopMgr'].Inst['player_datas'][P]['character'], I = a['charid'], E = cfg['item_definition']['character'].find(I).emo, F = 0; 9 > F; F++) {
                                        var b = E + '/' + F['toString']() + '.png';
                                        c[b] = 1;
                                    }
                                    if (a['extra_emoji'])
                                        for (var F = 0; F < a['extra_emoji']['length']; F++) {
                                            var b = E + '/' + a['extra_emoji'][F]['toString']() + '.png';
                                            c[b] = 1;
                                        }
                                }
                                var f = [];
                                for (var n in c)
                                    f.push(n);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](f, Laya['Handler']['create'](this, function () {
                                        h['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                                this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                            else {
                                for (var Q = !1, P = 0; P < view['DesktopMgr'].Inst['player_datas']['length']; P++) {
                                    var k = view['DesktopMgr'].Inst['player_datas'][P];
                                    if (k && null != k['account_id'] && k['account_id'] == GameMgr.Inst['account_id']) {
                                        Q = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (X['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = Q;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var G = 0, P = 0; P < view['DesktopMgr'].Inst['player_datas']['length']; P++) {
                                    var k = view['DesktopMgr'].Inst['player_datas'][P];
                                    k && null != k['account_id'] && 0 != k['account_id'] && G++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var o = 0, P = 0; P < view['DesktopMgr'].Inst['player_datas']['length']; P++) {
                                var k = view['DesktopMgr'].Inst['player_datas'][P];
                                k && null != k['account_id'] && 0 != k['account_id'] && o++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var z = this.me['getChildByName']('container_lefttop');
                            if (z['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                                z['getChildByName']('num_lizhi_0')['visible'] = !1, z['getChildByName']('num_lizhi_1')['visible'] = !1, z['getChildByName']('num_ben_0')['visible'] = !1, z['getChildByName']('num_ben_1')['visible'] = !1, z['getChildByName']('container_doras')['visible'] = !1, z['getChildByName']('gamemode')['visible'] = !1, z['getChildByName']('activitymode')['visible'] = !0, z['getChildByName']('MD5').y = 63, z['getChildByName']('MD5')['width'] = 239, z['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), z['getChildAt'](0)['width'] = 280, z['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (z['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, z['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (z['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), z['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), z['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, z['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (z['getChildByName']('num_lizhi_0')['visible'] = !0, z['getChildByName']('num_lizhi_1')['visible'] = !1, z['getChildByName']('num_ben_0')['visible'] = !0, z['getChildByName']('num_ben_1')['visible'] = !0, z['getChildByName']('container_doras')['visible'] = !0, z['getChildByName']('gamemode')['visible'] = !0, z['getChildByName']('activitymode')['visible'] = !1, z['getChildByName']('MD5').y = 51, z['getChildByName']('MD5')['width'] = 276, z['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), z['getChildAt'](0)['width'] = 313, z['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var d = view['DesktopMgr'].Inst['game_config'],
                                    y = game['Tools']['get_room_desc'](d);
                                this['label_gamemode'].text = y.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = X['UI_Activity_JJC']['win_count']['toString']();
                                    for (var P = 0; 3 > P; P++)
                                        this['container_jjc']['getChildByName'](P['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (X['UI_Activity_JJC']['lose_count'] > P ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            X['UI_Replay'].Inst && (X['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var N = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                u = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (X['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](N, !0), game['Tools']['setGrayDisable'](u, !0)) : (game['Tools']['setGrayDisable'](N, !1), game['Tools']['setGrayDisable'](u, !1), X['UI_Astrology'].Inst.hide());
                            for (var P = 0; 4 > P; P++)
                                this['_player_infos'][P]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][P]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png');
                        },
                        F['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                        },
                        F['prototype']['refreshSeat'] = function (X) {
                            void 0 === X && (X = !1);
                            for (var h = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), c = 0; 4 > c; c++) {
                                var P = view['DesktopMgr'].Inst['localPosition2Seat'](c),
                                    a = this['_player_infos'][c];
                                if (0 > P)
                                    a['container']['visible'] = !1;
                                else {
                                    a['container']['visible'] = !0;
                                    var I = view['DesktopMgr'].Inst['getPlayerName'](P);
                                    game['Tools']['SetNickname'](a.name, I, !1, !0),
                                        a.head.id = h[P]['avatar_id'],
                                        a.head['set_head_frame'](h[P]['account_id'], h[P]['avatar_frame']);
                                    var E = (cfg['item_definition'].item.get(h[P]['avatar_frame']), cfg['item_definition'].view.get(h[P]['avatar_frame']));
                                    if (a.head.me.y = E && E['sargs'][0] ? a['head_origin_y'] - Number(E['sargs'][0]) / 100 * this['head_offset_y'] : a['head_origin_y'], a['avatar'] = h[P]['avatar_id'], 0 != c) {
                                        var F = h[P]['account_id'] && 0 != h[P]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                            b = h[P]['account_id'] && 0 != h[P]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            f = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                        X ? a['headbtn']['onChangeSeat'](F, b, f) : a['headbtn']['reset'](F, b, f);
                                    }
                                    a['title'].id = h[P]['title'] ? game['Tools']['titleLocalization'](h[P]['account_id'], h[P]['title']) : 0;
                                }
                            }
                        },
                        F['prototype']['refreshNames'] = function () {
                            for (var X = 0; 4 > X; X++) {
                                var h = view['DesktopMgr'].Inst['localPosition2Seat'](X),
                                    c = this['_player_infos'][X];
                                if (0 > h)
                                    c['container']['visible'] = !1;
                                else {
                                    c['container']['visible'] = !0;
                                    var P = view['DesktopMgr'].Inst['getPlayerName'](h);
                                    game['Tools']['SetNickname'](c.name, P, !1, !0);
                                }
                            }
                        },
                        F['prototype']['refreshLinks'] = function () {
                            for (var X = (view['DesktopMgr'].Inst.seat, 0); 4 > X; X++) {
                                var h = view['DesktopMgr'].Inst['localPosition2Seat'](X);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][X]['disconnect']['visible'] = -1 == h || 0 == X ? !1 : view['DesktopMgr']['player_link_state'][h] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][X]['disconnect']['visible'] = -1 == h || 0 == view['DesktopMgr'].Inst['player_datas'][h]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][h] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][X]['disconnect']['visible'] = !1);
                            }
                        },
                        F['prototype']['setBen'] = function (X) {
                            X > 99 && (X = 99);
                            var h = this.me['getChildByName']('container_lefttop'),
                                c = h['getChildByName']('num_ben_0'),
                                P = h['getChildByName']('num_ben_1');
                            X >= 10 ? (c.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](X / 10)['toString']() + '.png'), P.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (X % 10)['toString']() + '.png'), P['visible'] = !0) : (c.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (X % 10)['toString']() + '.png'), P['visible'] = !1);
                        },
                        F['prototype']['setLiqibang'] = function (X, h) {
                            void 0 === h && (h = !0),
                                X > 999 && (X = 999);
                            var c = this.me['getChildByName']('container_lefttop'),
                                P = c['getChildByName']('num_lizhi_0'),
                                a = c['getChildByName']('num_lizhi_1'),
                                I = c['getChildByName']('num_lizhi_2');
                            X >= 100 ? (I.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (X % 10)['toString']() + '.png'), a.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](X / 10) % 10)['toString']() + '.png'), P.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](X / 100)['toString']() + '.png'), a['visible'] = !0, I['visible'] = !0) : X >= 10 ? (a.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (X % 10)['toString']() + '.png'), P.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](X / 10)['toString']() + '.png'), a['visible'] = !0, I['visible'] = !1) : (P.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + X['toString']() + '.png'), a['visible'] = !1, I['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](X, h);
                        },
                        F['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var X = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, h = 0; h < this['doras']['length']; h++)
                                if (this['front_doras'][h].skin = '', this['doras'][h].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                    this['front_doras'][h]['visible'] = !1, this['doras'][h].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                else {
                                    var c = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                    this['front_doras'][h]['visible'] = !0,
                                        this['doras'][h].skin = game['Tools']['localUISrc'](c + '5z.png'),
                                        this['front_doras'][h].skin = game['Tools']['localUISrc'](X + 'back.png');
                                }
                            for (var h = 0; 4 > h; h++)
                                this['_player_infos'][h].emo['reset'](), this['_player_infos'][h].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        F['prototype']['showCountDown'] = function (X, h) {
                            this['_timecd']['showCD'](X, h);
                        },
                        F['prototype']['setZhenting'] = function (X) {
                            this['img_zhenting']['visible'] = X;
                        },
                        F['prototype']['shout'] = function (X, h, c, P) {
                            app.Log.log('shout:' + X + ' type:' + h);
                            try {
                                var a = this['_player_infos'][X],
                                    I = a['container_shout'],
                                    E = I['getChildByName']('img_content'),
                                    F = I['getChildByName']('illust')['getChildByName']('illust'),
                                    b = I['getChildByName']('img_score');
                                if (0 == P)
                                    b['visible'] = !1;
                                else {
                                    b['visible'] = !0;
                                    var f = 0 > P ? 'm' + Math.abs(P) : P;
                                    b.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + f + '.png');
                                }
                                '' == h ? E['visible'] = !1 : (E['visible'] = !0, E.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + h + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (I['getChildByName']('illust')['visible'] = !1, I['getChildAt'](2)['visible'] = !0, I['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](I['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (I['getChildByName']('illust')['visible'] = !0, I['getChildAt'](2)['visible'] = !1, I['getChildAt'](0)['visible'] = !0, F['scaleX'] = 1, game['Tools']['charaPart'](c['avatar_id'], F, 'half', a['illustrect'], !0, !0));
                                var n = 0,
                                    Q = 0;
                                switch (X) {
                                    case 0:
                                        n = -105,
                                            Q = 0;
                                        break;
                                    case 1:
                                        n = 500,
                                            Q = 0;
                                        break;
                                    case 2:
                                        n = 0,
                                            Q = -300;
                                        break;
                                    default:
                                        n = -500,
                                            Q = 0;
                                }
                                I['visible'] = !0,
                                    I['alpha'] = 0,
                                    I.x = a['shout_origin_x'] + n,
                                    I.y = a['shout_origin_y'] + Q,
                                    Laya['Tween'].to(I, {
                                        alpha: 1,
                                        x: a['shout_origin_x'],
                                        y: a['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(I, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](F.skin),
                                            I['visible'] = !1;
                                    });
                            } catch (k) {
                                var G = {};
                                G['error'] = k['message'],
                                    G['stack'] = k['stack'],
                                    G['method'] = 'shout',
                                    G['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](G);
                            }
                        },
                        F['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        F['prototype']['refreshFuncBtnShow'] = function (X, h, c) {
                            var P = X['getChildByName']('img_choosed');
                            h['color'] = X['mouseEnabled'] ? c ? '#3bd647' : '#7992b3' : '#565656',
                                P['visible'] = c;
                        },
                        F['prototype']['onShowEmo'] = function (X, h) {
                            var c = this['_player_infos'][X];
                            0 != X && c['headbtn']['emj_banned'] || c.emo.show(X, h);
                        },
                        F['prototype']['changeHeadEmo'] = function (X) {
                            {
                                var h = view['DesktopMgr'].Inst['seat2LocalPosition'](X);
                                this['_player_infos'][h];
                            }
                        },
                        F['prototype']['onBtnShowScoreDelta'] = function () {
                            var X = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                X['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        F['prototype']['btn_seeinfo'] = function (h) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                                var c = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](h)]['account_id'];
                                if (c) {
                                    var P = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        a = 1,
                                        I = view['DesktopMgr'].Inst['game_config'].meta;
                                    I && I['mode_id'] == game['EMatchMode']['shilian'] && (a = 4);
                                    var E = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](h));
                                    X['UI_OtherPlayerInfo'].Inst.show(c, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, P ? 1 : 2, a, E['nickname']);
                                }
                            }
                        },
                        F['prototype']['openDora3BeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openDora3BeginShine'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openShilianOpenBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openChuanmaBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openJiuChaoBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openAnPaiBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openZhanxingBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['openTianmingBeginEffect'] = function () {
                            var X = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, X, function () {
                                    X['destory']();
                                });
                        },
                        F['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        F['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (X['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        F['prototype']['showAIEmo'] = function () {
                            for (var X = this, h = function (h) {
                                var P = view['DesktopMgr'].Inst['player_datas'][h];
                                P['account_id'] && 0 != P['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), c, function () {
                                    X['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](h), Math['floor'](9 * Math['random']()));
                                });
                            }, c = this, P = 0; P < view['DesktopMgr'].Inst['player_datas']['length']; P++)
                                h(P);
                        },
                        F['prototype']['setGapType'] = function (X, h) {
                            void 0 === h && (h = !1);
                            for (var c = 0; c < X['length']; c++) {
                                var P = view['DesktopMgr'].Inst['seat2LocalPosition'](c);
                                this['_player_infos'][P].que['visible'] = !0,
                                    h && (0 == c ? (this['_player_infos'][P].que.pos(this['gapStartPosLst'][c].x + this['selfGapOffsetX'][X[c]], this['gapStartPosLst'][c].y), this['_player_infos'][P].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][P].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][P]['que_target_pos'].x,
                                        y: this['_player_infos'][P]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][P].que.pos(this['gapStartPosLst'][c].x, this['gapStartPosLst'][c].y), this['_player_infos'][P].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][P].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][P]['que_target_pos'].x,
                                        y: this['_player_infos'][P]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][P].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + X[c] + '.png');
                            }
                        },
                        F['prototype']['OnNewCard'] = function (X, h) {
                            if (h) {
                                var c = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, c, function () {
                                        c['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function () {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        F['prototype']['ShowSpellCard'] = function (h, c) {
                            void 0 === c && (c = !1),
                                X['UI_FieldSpell'].Inst && !X['UI_FieldSpell'].Inst['enable'] && X['UI_FieldSpell'].Inst.show(h, c);
                        },
                        F['prototype']['HideSpellCard'] = function () {
                            X['UI_FieldSpell'].Inst && X['UI_FieldSpell'].Inst['close']();
                        },
                        F['prototype']['SetTianMingRate'] = function (X, h, c) {
                            void 0 === c && (c = !1);
                            var P = view['DesktopMgr'].Inst['seat2LocalPosition'](X),
                                a = this['_player_infos'][P]['tianming'];
                            c && 5 != h && a.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + h + '.png') && Laya['Tween'].to(a, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(a, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                a.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + h + '.png');
                        },
                        F.Inst = null,
                        F;
                }
                    (X['UIBase']);
            X['UI_DesktopInfo'] = E;
        }
            (uiscript || (uiscript = {}));







        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var h = this;
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (c, P) {
                    c || P['error'] ? X['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', c, P) : h['_refreshAnnouncements'](P);
                    // START
                    if ((c || P['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                    // END
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (X) {
                    for (var c = GameMgr['inDmm'] ? 'web_dmm' : 'web', P = 0, a = X['update_list']; P < a['length']; P++) {
                        var I = a[P];
                        if (I.lang == GameMgr['client_language'] && I['platform'] == c) {
                            h['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }



        uiscript.UI_Info._refreshAnnouncements = function (X) {
            // START
            X.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (X['announcements'] && (this['announcements'] = X['announcements']), X.sort && (this['announcement_sort'] = X.sort), X['read_list']) {
                this['read_list'] = [];
                for (var h = 0; h < X['read_list']['length']; h++)
                    this['read_list'].push(X['read_list'][h]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }






        // 加载CG 
        !function (X) {
            var h = function () {
                function h(h, c) {
                    var P = this;
                    this['cg_id'] = 0,
                        this.me = h,
                        this['father'] = c;
                    var a = this.me['getChildByName']('btn_detail');
                    a['clickHandler'] = new Laya['Handler'](this, function () {
                        X['UI_Bag'].Inst['locking'] || P['father']['changeLoadingCG'](P['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](a, new Laya['Handler'](this, function (h) {
                            if (!X['UI_Bag'].Inst['locking']) {
                                'down' == h ? Laya['timer'].once(800, P, function () {
                                    X['UI_CG_Yulan'].Inst.show(P['cg_id']);
                                }) : ('over' == h || 'up' == h) && Laya['timer']['clearAll'](P);
                            }
                        })),
                        this['using'] = a['getChildByName']('using'),
                        this.icon = a['getChildByName']('icon'),
                        this.name = a['getChildByName']('name'),
                        this.info = a['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = a['getChildByName']('new');
                }
                return h['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var h = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != X['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, h['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var c = !this['father']['last_seen_cg_map'][this['cg_id']], P = 0, a = h['unlock_items']; P < a['length']; P++) {
                        var I = a[P];
                        if (I && X['UI_Bag']['get_item_count'](I) > 0) {
                            var E = cfg['item_definition'].item.get(I);
                            if (this.name.text = E['name_' + GameMgr['client_language']], !E['item_expire']) {
                                this.info['visible'] = !1,
                                    c = -1 != this['father']['new_cg_ids']['indexOf'](I);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + E['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = c;
                },
                    h['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    h;
            }
                (),
                c = function () {
                    function c(h) {
                        var c = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = h,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var P = this.me['getChildByName']('choose');
                        this['label_choose_all'] = P['getChildByName']('tip'),
                            P['clickHandler'] = new Laya['Handler'](this, function () {
                                if (c['all_choosed'])
                                    X['UI_Loading']['Loading_Images'] = [];
                                else {
                                    X['UI_Loading']['Loading_Images'] = [];
                                    for (var h = 0, P = c['items']; h < P['length']; h++) {
                                        var a = P[h];
                                        X['UI_Loading']['Loading_Images'].push(a.id);
                                    }
                                }
                                c['scrollview']['wantToRefreshAll'](),
                                    c['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: X['UI_Loading']['Loading_Images']
                                //}, function (h, c) {
                                //    (h || c['error']) && X['UIMgr'].Inst['showNetReqError']('setLoadingImage', h, c);
                                //});
                                // END
                            });
                    }
                    return c['prototype']['have_redpoint'] = function () {
                        // START
                        //if (X['UI_Bag']['new_cg_ids']['length'] > 0)
                        //    return !0;
                        // END
                        var h = [];
                        if (!this['seen_cg_map']) {
                            var c = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, c) {
                                c = game['Tools']['dddsss'](c);
                                for (var P = c['split'](','), a = 0; a < P['length']; a++)
                                    this['seen_cg_map'][Number(P[a])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (c) {
                            c['unlock_items'][1] && 0 == X['UI_Bag']['get_item_count'](c['unlock_items'][0]) && X['UI_Bag']['get_item_count'](c['unlock_items'][1]) > 0 && h.push(c.id);
                        });
                        for (var I = 0, E = h; I < E['length']; I++) {
                            var F = E[I];
                            if (!this['seen_cg_map'][F])
                                return !0;
                        }
                        return !1;
                    },
                        c['prototype'].show = function () {
                            var h = this;
                            if (this['new_cg_ids'] = X['UI_Bag']['new_cg_ids'], X['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var c = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, c) {
                                    c = game['Tools']['dddsss'](c);
                                    for (var P = c['split'](','), a = 0; a < P['length']; a++)
                                        this['seen_cg_map'][Number(P[a])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var I = '';
                            cfg['item_definition']['loading_image']['forEach'](function (c) {
                                for (var P = 0, a = c['unlock_items']; P < a['length']; P++) {
                                    var E = a[P];
                                    if (E && X['UI_Bag']['get_item_count'](E) > 0)
                                        return h['items'].push(c), h['seen_cg_map'][c.id] = 1, '' != I && (I += ','), I += c.id, void 0;
                                }
                            }),
                                this['items'].sort(function (X, h) {
                                    return h.sort - X.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](I)),
                                X['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this.me['getChildByName']('choose')['visible'] = 0 != this['items']['length'],
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1,
                                this['refreshChooseState']();
                        },
                        c['prototype']['close'] = function () {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && X['UI_Loading']['loadNextCG']();
                        },
                        c['prototype']['render_item'] = function (X) {
                            var c = X['index'],
                                P = X['container'],
                                a = X['cache_data'];
                            if (this['items'][c]) {
                                a.item || (a.item = new h(P, this));
                                var I = a.item;
                                I['cg_id'] = this['items'][c].id,
                                    I.show();
                            }
                        },
                        c['prototype']['changeLoadingCG'] = function (h) {
                            this['_changed'] = !0;
                            for (var c = 0, P = 0, a = 0, I = this['items']; a < I['length']; a++) {
                                var E = I[a];
                                if (E.id == h) {
                                    c = P;
                                    break;
                                }
                                P++;
                            }
                            var F = X['UI_Loading']['Loading_Images']['indexOf'](h);
                            -1 == F ? X['UI_Loading']['Loading_Images'].push(h) : X['UI_Loading']['Loading_Images']['splice'](F, 1),
                                this['scrollview']['wantToRefreshItem'](c),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = X['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: X['UI_Loading']['Loading_Images']
                            //}, function (h, c) {
                            //    (h || c['error']) && X['UIMgr'].Inst['showNetReqError']('setLoadingImage', h, c);
                            //});
                            // END
                        },
                        c['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = X['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        c['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        c;
                }
                    ();
            X['UI_Bag_PageCG'] = c;
        }
            (uiscript || (uiscript = {}));





        uiscript.UI_Entrance.prototype._onLoginSuccess = function (h, c, P) {
            var X = uiscript;
            var a = this;
            if (void 0 === P && (P = !1), app.Log.log('登陆：' + JSON['stringify'](c)), GameMgr.Inst['account_id'] = c['account_id'], GameMgr.Inst['account_data'] = c['account'], X['UI_ShiMingRenZheng']['renzhenged'] = c['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, c['account']['platform_diamond'])
                for (var I = c['account']['platform_diamond'], E = 0; E < I['length']; E++)
                    GameMgr.Inst['account_numerical_resource'][I[E].id] = I[E]['count'];
            if (c['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = c['account']['skin_ticket']), c['account']['platform_skin_ticket'])
                for (var F = c['account']['platform_skin_ticket'], E = 0; E < F['length']; E++)
                    GameMgr.Inst['account_numerical_resource'][F[E].id] = F[E]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                c['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = c['game_info']['location'], GameMgr.Inst['mj_game_token'] = c['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = c['game_info']['game_uuid']),
                c['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : h['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', c['access_token']), GameMgr.Inst['sociotype'] = h, GameMgr.Inst['access_token'] = c['access_token']);
            var b = this,
                f = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        X['UI_Loading'].Inst.show('load_lobby'),
                        b['enable'] = !1,
                        b['scene']['close'](),
                        X['UI_Entrance_Mail_Regist'].Inst['close'](),
                        b['login_loading']['close'](),
                        X['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](b, function () {
                            GameMgr.Inst['afterLogin'](),
                                b['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && X['UIMgr'].Inst['ShowPreventAddiction'](),
                                b['destroy'](),
                                b['disposeRes'](),
                                X['UI_Add2Desktop'].Inst && (X['UI_Add2Desktop'].Inst['destroy'](), X['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](b, function (h) {
                            return X['UI_Loading'].Inst['setProgressVal'](0.2 * h);
                        }, null, !1));
                },
                n = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (h, c) {
                        h ? (app.Log.log('fetchRefundOrder err:' + h), a['showError'](game['Tools']['strOfLocalization'](2061), h), a['showContainerLogin']()) : (X['UI_Refund']['orders'] = c['orders'], X['UI_Refund']['clear_deadline'] = c['clear_deadline'], X['UI_Refund']['message'] = c['message'], f());
                    }) : f();
                });
            // START
            //if (X['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var Q = 0, k = GameMgr.Inst['account_data']['loading_image']; Q < k['length']; Q++) {
            //        var G = k[Q];
            //        cfg['item_definition']['loading_image'].get(G) && X['UI_Loading']['Loading_Images'].push(G);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            X['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || c['account']['phone_verify'] ? n.run() : (X['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, X['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (h, c) {
                        h || c['error'] ? a['showError'](h, c['error']) : 0 == c['phone_login'] ? X['UI_Create_Phone_Account'].Inst.show(n) : X['UI_Canot_Create_Phone_Account'].Inst.show(n);
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
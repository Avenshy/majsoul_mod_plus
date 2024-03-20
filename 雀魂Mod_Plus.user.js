// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.11.32
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
        !function (B) {
            var C;
            !function (B) {
                B[B.none = 0] = 'none',
                B[B['daoju'] = 1] = 'daoju',
                B[B.gift = 2] = 'gift',
                B[B['fudai'] = 3] = 'fudai',
                B[B.view = 5] = 'view';
            }
            (C = B['EItemCategory'] || (B['EItemCategory'] = {}));
            var z = function (z) {
                function e() {
                    var B = z.call(this, new ui['lobby']['bagUI']()) || this;
                    return B['container_top'] = null,
                    B['container_content'] = null,
                    B['locking'] = !1,
                    B.tabs = [],
                    B['page_item'] = null,
                    B['page_gift'] = null,
                    B['page_skin'] = null,
                    B['page_cg'] = null,
                    B['select_index'] = 0,
                    e.Inst = B,
                    B;
                }
                return __extends(e, z),
                e.init = function () {
                    var B = this;
                    app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (C) {
                            var z = C['update'];
                            z && z.bag && (B['update_data'](z.bag['update_items']), B['update_daily_gain_data'](z.bag));
                        }, null, !1)),
                        // START
                    GameMgr.Inst['use_fetch_info'] || 
                    this['fetch']();
                    // END
                },
                e['fetch'] = function () {
                    var C = this;
                    this['_item_map'] = {},
                    this['_daily_gain_record'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (z, e) {
                        if (z || e['error'])
                            B['UIMgr'].Inst['showNetReqError']('fetchBagInfo', z, e);
                        else {
                            app.Log.log('背包信息：' + JSON['stringify'](e));
                            var I = e.bag;
                            if (I) {
                                                if (MMP.settings.setItems.setAllItems) {
                                                    //设置全部道具
                                                    var items = cfg.item_definition.item.map_;
                                                    for (var id in items) {
                                                        if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                            for (let item of I["items"]) {
                                                                if (item.item_id == id) {
                                                                    cfg.item_definition.item.get(item.item_id);
                                                                    C._item_map[item.item_id] = {
                                                                        item_id: item.item_id,
                                                                        count: item.stack,
                                                                        category: items[item.item_id].category
                                                                    };
                                                                    break;
                                                                }
                                                            }
                                                        } else {
                                                            cfg.item_definition.item.get(id);
                                                            C._item_map[id] = {
                                                                item_id: id,
                                                                count: 1,
                                                                category: items[id].category
                                                            }; //获取物品列表并添加
                                                        }
                                                    }
                                                } else {
                                if (I['items'])
                                    for (var p = 0; p < I['items']['length']; p++) {
                                        var L = I['items'][p]['item_id'],
                                        R = I['items'][p]['stack'],
                                        E = cfg['item_definition'].item.get(L);
                                        E && (C['_item_map'][L] = {
                                                item_id: L,
                                                count: R,
                                                category: E['category']
                                            }, 1 == E['category'] && 3 == E.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: L
                                            }, function () {}));
                                    }
                                if (I['daily_gain_record'])
                                    for (var V = I['daily_gain_record'], p = 0; p < V['length']; p++) {
                                        var d = V[p]['limit_source_id'];
                                        C['_daily_gain_record'][d] = {};
                                        var f = V[p]['record_time'];
                                        C['_daily_gain_record'][d]['record_time'] = f;
                                        var A = V[p]['records'];
                                        if (A)
                                            for (var O = 0; O < A['length']; O++)
                                                C['_daily_gain_record'][d][A[O]['item_id']] = A[O]['count'];
                                    }
                            }
                        }
                                        }
                    });
                },
                e['onFetchSuccess'] = function (B) {
                    this['_item_map'] = {},
                    this['_daily_gain_record'] = {};
                    var C = B['bag_info'];
                    if (C) {
                        var z = C.bag;
                        if (z) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of z["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            this._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    this._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                            if (z['items'])
                                for (var e = 0; e < z['items']['length']; e++) {
                                    var I = z['items'][e]['item_id'],
                                    p = z['items'][e]['stack'],
                                    L = cfg['item_definition'].item.get(I);
                                    L && (this['_item_map'][I] = {
                                            item_id: I,
                                            count: p,
                                            category: L['category']
                                        }, 1 == L['category'] && 3 == L.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                            item_id: I
                                        }, function () {}));
                                }
                            if (z['daily_gain_record'])
                                for (var R = z['daily_gain_record'], e = 0; e < R['length']; e++) {
                                    var E = R[e]['limit_source_id'];
                                    this['_daily_gain_record'][E] = {};
                                    var V = R[e]['record_time'];
                                    this['_daily_gain_record'][E]['record_time'] = V;
                                    var d = R[e]['records'];
                                    if (d)
                                        for (var f = 0; f < d['length']; f++)
                                            this['_daily_gain_record'][E][d[f]['item_id']] = d[f]['count'];
                                }
                        }
                    }
                                }
                },
                e['find_item'] = function (B) {
                    var C = this['_item_map'][B];
                    return C ? {
                        item_id: C['item_id'],
                        category: C['category'],
                        count: C['count']
                    }
                     : null;
                },
                e['get_item_count'] = function (B) {
                    var C = this['find_item'](B);
                    if (C)
                        return C['count'];
                    if ('100001' == B) {
                        for (var z = 0, e = 0, I = GameMgr.Inst['free_diamonds']; e < I['length']; e++) {
                            var p = I[e];
                            GameMgr.Inst['account_numerical_resource'][p] && (z += GameMgr.Inst['account_numerical_resource'][p]);
                        }
                        for (var L = 0, R = GameMgr.Inst['paid_diamonds']; L < R['length']; L++) {
                            var p = R[L];
                            GameMgr.Inst['account_numerical_resource'][p] && (z += GameMgr.Inst['account_numerical_resource'][p]);
                        }
                        return z;
                    }
                    if ('100004' == B) {
                        for (var E = 0, V = 0, d = GameMgr.Inst['free_pifuquans']; V < d['length']; V++) {
                            var p = d[V];
                            GameMgr.Inst['account_numerical_resource'][p] && (E += GameMgr.Inst['account_numerical_resource'][p]);
                        }
                        for (var f = 0, A = GameMgr.Inst['paid_pifuquans']; f < A['length']; f++) {
                            var p = A[f];
                            GameMgr.Inst['account_numerical_resource'][p] && (E += GameMgr.Inst['account_numerical_resource'][p]);
                        }
                        return E;
                    }
                    return '100002' == B ? GameMgr.Inst['account_data'].gold : 0;
                },
                e['find_items_by_category'] = function (B, C) {
                    var z = [];
                    for (var e in this['_item_map'])
                        this['_item_map'][e]['category'] == B && this['_item_map'][e]['count'] && z.push({
                            item_id: this['_item_map'][e]['item_id'],
                            category: this['_item_map'][e]['category'],
                            count: this['_item_map'][e]['count']
                        });
                    return C && z.sort(function (B, z) {
                        return cfg['item_definition'].item.get(B['item_id'])[C] - cfg['item_definition'].item.get(z['item_id'])[C];
                    }),
                    z;
                },
                e['update_data'] = function (C) {
                    for (var z = 0; z < C['length']; z++) {
                        var e = C[z]['item_id'],
                        I = C[z]['stack'];
                        if (I > 0) {
                            this['_item_map']['hasOwnProperty'](e['toString']()) ? this['_item_map'][e]['count'] = I : this['_item_map'][e] = {
                                item_id: e,
                                count: I,
                                category: cfg['item_definition'].item.get(e)['category']
                            };
                            var p = cfg['item_definition'].item.get(e);
                            1 == p['category'] && 3 == p.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                item_id: e
                            }, function () {}),
                            5 == p['category'] && (this['new_bag_item_ids'].push(e), this['new_zhuangban_item_ids'][e] = 1),
                            8 != p['category'] || p['item_expire'] || this['new_cg_ids'].push(e);
                        } else if (this['_item_map']['hasOwnProperty'](e['toString']())) {
                            var L = cfg['item_definition'].item.get(e);
                            L && 5 == L['category'] && B['UI_Sushe']['on_view_remove'](e),
                            this['_item_map'][e] = 0,
                            delete this['_item_map'][e];
                        }
                    }
                    this.Inst && this.Inst['when_data_change']();
                    for (var z = 0; z < C['length']; z++) {
                        var e = C[z]['item_id'];
                        if (this['_item_listener']['hasOwnProperty'](e['toString']()))
                            for (var R = this['_item_listener'][e], E = 0; E < R['length']; E++)
                                R[E].run();
                    }
                    for (var z = 0; z < this['_all_item_listener']['length']; z++)
                        this['_all_item_listener'][z].run();
                },
                e['update_daily_gain_data'] = function (B) {
                    var C = B['update_daily_gain_record'];
                    if (C)
                        for (var z = 0; z < C['length']; z++) {
                            var e = C[z]['limit_source_id'];
                            this['_daily_gain_record'][e] || (this['_daily_gain_record'][e] = {});
                            var I = C[z]['record_time'];
                            this['_daily_gain_record'][e]['record_time'] = I;
                            var p = C[z]['records'];
                            if (p)
                                for (var L = 0; L < p['length']; L++)
                                    this['_daily_gain_record'][e][p[L]['item_id']] = p[L]['count'];
                        }
                },
                e['get_item_daily_record'] = function (B, C) {
                    return this['_daily_gain_record'][B] ? this['_daily_gain_record'][B]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][B]['record_time']) ? this['_daily_gain_record'][B][C] ? this['_daily_gain_record'][B][C] : 0 : 0 : 0 : 0;
                },
                e['add_item_listener'] = function (B, C) {
                    this['_item_listener']['hasOwnProperty'](B['toString']()) || (this['_item_listener'][B] = []),
                    this['_item_listener'][B].push(C);
                },
                e['remove_item_listener'] = function (B, C) {
                    var z = this['_item_listener'][B];
                    if (z)
                        for (var e = 0; e < z['length']; e++)
                            if (z[e] === C) {
                                z[e] = z[z['length'] - 1],
                                z.pop();
                                break;
                            }
                },
                e['add_all_item_listener'] = function (B) {
                    this['_all_item_listener'].push(B);
                },
                e['remove_all_item_listener'] = function (B) {
                    for (var C = this['_all_item_listener'], z = 0; z < C['length']; z++)
                        if (C[z] === B) {
                            C[z] = C[C['length'] - 1],
                            C.pop();
                            break;
                        }
                },
                e['removeAllBagNew'] = function () {
                    this['new_bag_item_ids'] = [];
                },
                e['removeAllCGNew'] = function () {
                    this['new_cg_ids'] = [];
                },
                e['removeZhuangBanNew'] = function (B) {
                    for (var C = 0, z = B; C < z['length']; C++) {
                        var e = z[C];
                        delete this['new_zhuangban_item_ids'][e];
                    }
                },
                e['checkItemEnough'] = function (B) {
                    for (var C = B['split'](','), z = 0, I = C; z < I['length']; z++) {
                        var p = I[z];
                        if (p) {
                            var L = p['split']('-');
                            if (e['get_item_count'](Number(L[0])) < Number(L[1]))
                                return !1;
                        }
                    }
                    return !0;
                },
                e['prototype']['have_red_point'] = function () {
                    return this['page_cg']['have_redpoint']();
                },
                e['prototype']['onCreate'] = function () {
                    var C = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || C.hide(Laya['Handler']['create'](C, function () {
                                return C['closeHandler'] ? (C['closeHandler'].run(), C['closeHandler'] = null, void 0) : (B['UI_Lobby'].Inst['enable'] = !0, void 0);
                            }));
                    }, null, !1),
                    this['container_content'] = this.me['getChildByName']('content');
                    for (var z = function (B) {
                        e.tabs.push(e['container_content']['getChildByName']('tabs')['getChildByName']('btn' + B)),
                        e.tabs[B]['clickHandler'] = Laya['Handler']['create'](e, function () {
                            C['select_index'] != B && C['on_change_tab'](B);
                        }, null, !1);
                    }, e = this, I = 0; 5 > I; I++)
                        z(I);
                    this['page_item'] = new B['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                    this['page_gift'] = new B['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                    this['page_skin'] = new B['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                    this['page_cg'] = new B['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                },
                e['prototype'].show = function (C, z) {
                    var e = this;
                    void 0 === C && (C = 0),
                    void 0 === z && (z = null),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['closeHandler'] = z,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        e['locking'] = !1;
                    }),
                    this['on_change_tab'](C),
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                e['prototype']['onSkinYuLanBack'] = function () {
                    var C = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        C['locking'] = !1;
                    }),
                    this['page_skin'].me['visible'] = !0,
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                e['prototype'].hide = function (C) {
                    var z = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_out'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        z['locking'] = !1,
                        z['enable'] = !1,
                        C && C.run();
                    });
                },
                e['prototype']['onDisable'] = function () {
                    this['page_skin']['close'](),
                    this['page_item']['close'](),
                    this['page_gift']['close'](),
                    this['page_cg']['close']();
                },
                e['prototype']['on_change_tab'] = function (B) {
                    this['select_index'] = B;
                    for (var z = 0; z < this.tabs['length']; z++)
                        this.tabs[z].skin = game['Tools']['localUISrc'](B == z ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[z]['getChildAt'](0)['color'] = B == z ? '#d9b263' : '#8cb65f';
                    switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), B) {
                    case 0:
                        this['page_item'].show(C['daoju']);
                        break;
                    case 1:
                        this['page_gift'].show();
                        break;
                    case 2:
                        this['page_item'].show(C.view);
                        break;
                    case 3:
                        this['page_skin'].show();
                        break;
                    case 4:
                        this['page_cg'].show();
                    }
                },
                e['prototype']['when_data_change'] = function () {
                    this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                    this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                },
                e['prototype']['on_cg_change'] = function () {
                    this['page_cg']['when_update_data']();
                },
                e['prototype']['refreshRedpoint'] = function () {
                    this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                },
                e['_item_map'] = {},
                e['_item_listener'] = {},
                e['_all_item_listener'] = [],
                e['_daily_gain_record'] = {},
                e['new_bag_item_ids'] = [],
                e['new_zhuangban_item_ids'] = {},
                e['new_cg_ids'] = [],
                e.Inst = null,
                e;
            }
            (B['UIBase']);
            B['UI_Bag'] = z;
        }
        (uiscript || (uiscript = {}));
        















        // 修改牌桌上角色
        !function (B) {
            var C = function () {
                function C() {
                    var C = this;
                    this.urls = [],
                    this['link_index'] = -1,
                    this['connect_state'] = B['EConnectState'].none,
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
                    app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (B) {
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](B)),
                            C['loaded_player_count'] = B['ready_id_list']['length'],
                            C['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](C['loaded_player_count'], C['real_player_count']);
                        }));
                }
                return Object['defineProperty'](C, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new C() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                C['prototype']['OpenConnect'] = function (C, z, e, I) {
                    var p = this;
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    B['Scene_Lobby'].Inst && B['Scene_Lobby'].Inst['active'] && (B['Scene_Lobby'].Inst['active'] = !1),
                    B['Scene_Huiye'].Inst && B['Scene_Huiye'].Inst['active'] && (B['Scene_Huiye'].Inst['active'] = !1),
                    this['Close'](),
                    view['BgmListMgr']['stopBgm'](),
                    this['is_ob'] = !1,
                    Laya['timer'].once(500, this, function () {
                        p.url = '',
                        p['token'] = C,
                        p['game_uuid'] = z,
                        p['server_location'] = e,
                        GameMgr.Inst['ingame'] = !0,
                        GameMgr.Inst['mj_server_location'] = e,
                        GameMgr.Inst['mj_game_token'] = C,
                        GameMgr.Inst['mj_game_uuid'] = z,
                        p['playerreconnect'] = I,
                        p['_setState'](B['EConnectState']['tryconnect']),
                        p['load_over'] = !1,
                        p['loaded_player_count'] = 0,
                        p['real_player_count'] = 0,
                        p['lb_index'] = 0,
                        p['_fetch_gateway'](0);
                    }),
                    Laya['timer'].loop(300000, this, this['reportInfo']);
                },
                C['prototype']['reportInfo'] = function () {
                    this['connect_state'] == B['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                        client_type: 'web',
                        route_type: 'game',
                        route_index: B['LobbyNetMgr']['root_id_lst'][B['LobbyNetMgr'].Inst['choosed_index']],
                        route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                        connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                        reconnect_count: this['_report_reconnect_count']
                    });
                },
                C['prototype']['Close'] = function () {
                    this['load_over'] = !1,
                    app.Log.log('MJNetMgr close'),
                    this['_setState'](B['EConnectState'].none),
                    app['NetAgent']['Close2MJ'](),
                    this.url = '',
                    Laya['timer']['clear'](this, this['reportInfo']);
                },
                C['prototype']['_OnConnent'] = function (C) {
                    app.Log.log('MJNetMgr _OnConnent event:' + C),
                    C == Laya['Event']['CLOSE'] || C == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == B['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == B['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](B['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](B['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2008)), B['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == B['EConnectState']['reconnecting'] && this['_Reconnect']()) : C == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == B['EConnectState']['tryconnect'] || this['connect_state'] == B['EConnectState']['reconnecting']) && ((this['connect_state'] = B['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](B['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                },
                C['prototype']['_Reconnect'] = function () {
                    var C = this;
                    B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState'].none || B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState']['disconnect'] ? this['_setState'](B['EConnectState']['disconnect']) : B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](B['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            C['connect_state'] == B['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + C['reconnect_count']), app['NetAgent']['connect2MJ'](C.url, Laya['Handler']['create'](C, C['_OnConnent'], null, !1), 'local' == C['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                },
                C['prototype']['_try_to_linknext'] = function () {
                    this['link_index']++,
                    this.url = '',
                    app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                    this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? B['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](B['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                },
                C['prototype']['GetAuthData'] = function () {
                    return {
                        account_id: GameMgr.Inst['account_id'],
                        token: this['token'],
                        game_uuid: this['game_uuid'],
                        gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                    };
                },
                C['prototype']['_fetch_gateway'] = function (C) {
                    var z = this;
                    if (B['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= B['LobbyNetMgr'].Inst.urls['length'])
                        return uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut'](), this['_setState'](B['EConnectState'].none), void 0;
                    this.urls = [],
                    this['link_index'] = -1,
                    app.Log.log('mj _fetch_gateway retry_count:' + C);
                    var e = function (e) {
                        var I = JSON['parse'](e);
                        if (app.Log.log('mj _fetch_gateway func_success data = ' + e), I['maintenance'])
                            z['_setState'](B['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut']();
                        else if (I['servers'] && I['servers']['length'] > 0) {
                            for (var p = I['servers'], L = B['Tools']['deal_gateway'](p), R = 0; R < L['length']; R++)
                                z.urls.push({
                                    name: '___' + R,
                                    url: L[R]
                                });
                            z['link_index'] = -1,
                            z['_try_to_linknext']();
                        } else
                            1 > C ? Laya['timer'].once(1000, z, function () {
                                z['_fetch_gateway'](C + 1);
                            }) : B['LobbyNetMgr'].Inst['polling_connect'] ? (z['lb_index']++, z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](60)), z['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut'](), z['_setState'](B['EConnectState'].none));
                    },
                    I = function () {
                        app.Log.log('mj _fetch_gateway func_error'),
                        1 > C ? Laya['timer'].once(500, z, function () {
                            z['_fetch_gateway'](C + 1);
                        }) : B['LobbyNetMgr'].Inst['polling_connect'] ? (z['lb_index']++, z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](58)), z['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || B['Scene_MJ'].Inst['ForceOut'](), z['_setState'](B['EConnectState'].none));
                    },
                    p = function (B) {
                        var C = new Laya['HttpRequest']();
                        C.once(Laya['Event']['COMPLETE'], z, function (B) {
                            e(B);
                        }),
                        C.once(Laya['Event']['ERROR'], z, function () {
                            I();
                        });
                        var p = [];
                        p.push('If-Modified-Since'),
                        p.push('0'),
                        B += '?service=ws-game-gateway',
                        B += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                        B += '&location=' + z['server_location'],
                        B += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                        C.send(B, '', 'get', 'text', p),
                        app.Log.log('mj _fetch_gateway func_fetch url = ' + B);
                    };
                    B['LobbyNetMgr'].Inst['polling_connect'] ? p(B['LobbyNetMgr'].Inst.urls[this['lb_index']]) : p(B['LobbyNetMgr'].Inst['lb_url']);
                },
                C['prototype']['_setState'] = function (C) {
                    this['connect_state'] = C,
                    GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (C == B['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : C == B['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : C == B['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : C == B['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : C == B['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                },
                C['prototype']['_ConnectSuccess'] = function () {
                    var C = this;
                    app.Log.log('MJNetMgr _ConnectSuccess '),
                    this['load_over'] = !1,
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (z, e) {
                        if (z || e['error'])
                            uiscript['UIMgr'].Inst['showNetReqError']('authGame', z, e), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                        else {
                            app.Log.log('麻将桌验证通过：' + JSON['stringify'](e)),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                            // 强制打开便捷提示
                                            if (MMP.settings.setbianjietishi) {
                                                e['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                            }
                                            // END
                            var I = [],
                            p = 0;
                            view['DesktopMgr']['player_link_state'] = e['state_list'];
                            var L = B['Tools']['strOfLocalization'](2003),
                            R = e['game_config'].mode,
                            E = view['ERuleMode']['Liqi4'];
                            R.mode < 10 ? (E = view['ERuleMode']['Liqi4'], C['real_player_count'] = 4) : R.mode < 20 && (E = view['ERuleMode']['Liqi3'], C['real_player_count'] = 3);
                            for (var V = 0; V < C['real_player_count']; V++)
                                I.push(null);
                            R['extendinfo'] && (L = B['Tools']['strOfLocalization'](2004)),
                            R['detail_rule'] && R['detail_rule']['ai_level'] && (1 === R['detail_rule']['ai_level'] && (L = B['Tools']['strOfLocalization'](2003)), 2 === R['detail_rule']['ai_level'] && (L = B['Tools']['strOfLocalization'](2004)));
                            for (var d = B['GameUtility']['get_default_ai_skin'](), f = B['GameUtility']['get_default_ai_character'](), V = 0; V < e['seat_list']['length']; V++) {
                                var A = e['seat_list'][V];
                                if (0 == A){
                                    I[V] = {
                                        nickname: L,
                                        avatar_id: d,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: f,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: d,
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
                                                             I[V].avatar_id = skin.id;
                                                             I[V].character.charid = skin.character_id;
                                                             I[V].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                         I[V].nickname = '[BOT]' +  I[V].nickname;
                                                    }
                               } else {
                                    p++;
                                    for (var O = 0; O < e['players']['length']; O++)
                                        if (e['players'][O]['account_id'] == A) {
                                            I[V] = e['players'][O];
                                                            //修改牌桌上人物头像及皮肤
                                                            if ( I[V].account_id == GameMgr.Inst.account_id) {
                                                                for (let item of uiscript.UI_Sushe.characters) {
                                                                    if (item['charid'] == uiscript.UI_Sushe.main_character_id) {
                                                                         I[V].character = item;
                                                                    }
                                                                }
                                                                 I[V].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                                 I[V].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                                 I[V].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                                 I[V].title = GameMgr.Inst.account_data.title;
                                                                if (MMP.settings.nickname != '') {
                                                                     I[V].nickname = MMP.settings.nickname;
                                                                }
                                                            } else if (MMP.settings.randomPlayerDefSkin && ( I[V].avatar_id == 400101 ||  I[V].avatar_id == 400201)) {
                                                                //玩家如果用了默认皮肤也随机换
                                                                let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                                let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                                let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                                // 修复皮肤错误导致无法进入游戏的bug
                                                                if (skin.id != 400000 && skin.id != 400001) {
                                                                     I[V].avatar_id = skin.id;
                                                                     I[V].character.charid = skin.character_id;
                                                                     I[V].character.skin = skin.id;
                                                                }
                                                            }
                                                            if (MMP.settings.showServer == true) {
                                                                let server = game.Tools.get_zone_id( I[V].account_id);
                                                                if (server == 1) {
                                                                     I[V].nickname = '[CN]' +  I[V].nickname;
                                                                } else if (server == 2) {
                                                                     I[V].nickname = '[JP]' +  I[V].nickname;
                                                                } else if (server == 3) {
                                                                     I[V].nickname = '[EN]' +  I[V].nickname;
                                                                } else {
                                                                     I[V].nickname = '[??]' +  I[V].nickname;
                                                                }
                                                            }
                                                            // END
                                            break;
                                        }
                                }
                            }
                            for (var V = 0; V < C['real_player_count']; V++)
                                null == I[V] && (I[V] = {
                                        account: 0,
                                        nickname: B['Tools']['strOfLocalization'](2010),
                                        avatar_id: d,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: f,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: d,
                                            is_upgraded: !1
                                        }
                                    });
                            C['loaded_player_count'] = e['ready_id_list']['length'],
                            C['_AuthSuccess'](I, e['is_game_start'], e['game_config']['toJSON']());
                        }
                    });
                },
                C['prototype']['_AuthSuccess'] = function (C, z, e) {
                    var I = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                round_id: view['DesktopMgr'].Inst['round_id'],
                                step: view['DesktopMgr'].Inst['current_step']
                            }, function (C, z) {
                                C || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', C, z), B['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](z)), z['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](z['game_restore'])));
                            });
                        })) : B['Scene_MJ'].Inst['openMJRoom'](e, C, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](e)), C, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](I, function () {
                                    z ? Laya['timer']['frameOnce'](10, I, function () {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (C, z) {
                                            app.Log.log('syncGame ' + JSON['stringify'](z)),
                                            C || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', C, z), B['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), I['_PlayerReconnectSuccess'](z));
                                        });
                                    }) : Laya['timer']['frameOnce'](10, I, function () {
                                        app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (C, z) {
                                            C || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', C, z), B['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), I['_EnterGame'](z), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                    });
                                }));
                        }), Laya['Handler']['create'](this, function (B) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * B);
                        }, null, !1));
                },
                C['prototype']['_EnterGame'] = function (C) {
                    app.Log.log('正常进入游戏: ' + JSON['stringify'](C)),
                    C['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : C['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](C['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                },
                C['prototype']['_PlayerReconnectSuccess'] = function (C) {
                    app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](C)),
                    C['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : C['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](C['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2012)), B['Scene_MJ'].Inst['ForceOut']());
                },
                C['prototype']['_SendDebugInfo'] = function () {},
                C['prototype']['OpenConnectObserve'] = function (C, z) {
                    var e = this;
                    this['is_ob'] = !0,
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    this['Close'](),
                    view['AudioMgr']['StopMusic'](),
                    Laya['timer'].once(500, this, function () {
                        e['server_location'] = z,
                        e['ob_token'] = C,
                        e['_setState'](B['EConnectState']['tryconnect']),
                        e['lb_index'] = 0,
                        e['_fetch_gateway'](0);
                    });
                },
                C['prototype']['_ConnectSuccessOb'] = function () {
                    var C = this;
                    app.Log.log('MJNetMgr _ConnectSuccessOb '),
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                        token: this['ob_token']
                    }, function (z, e) {
                        z || e['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', z, e), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](e)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (z, e) {
                                if (z || e['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('startObserve', z, e), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    var I = e.head,
                                    p = I['game_config'].mode,
                                    L = [],
                                    R = B['Tools']['strOfLocalization'](2003),
                                    E = view['ERuleMode']['Liqi4'];
                                    p.mode < 10 ? (E = view['ERuleMode']['Liqi4'], C['real_player_count'] = 4) : p.mode < 20 && (E = view['ERuleMode']['Liqi3'], C['real_player_count'] = 3);
                                    for (var V = 0; V < C['real_player_count']; V++)
                                        L.push(null);
                                    p['extendinfo'] && (R = B['Tools']['strOfLocalization'](2004)),
                                    p['detail_rule'] && p['detail_rule']['ai_level'] && (1 === p['detail_rule']['ai_level'] && (R = B['Tools']['strOfLocalization'](2003)), 2 === p['detail_rule']['ai_level'] && (R = B['Tools']['strOfLocalization'](2004)));
                                    for (var d = B['GameUtility']['get_default_ai_skin'](), f = B['GameUtility']['get_default_ai_character'](), V = 0; V < I['seat_list']['length']; V++) {
                                        var A = I['seat_list'][V];
                                        if (0 == A)
                                            L[V] = {
                                                nickname: R,
                                                avatar_id: d,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: f,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: d,
                                                    is_upgraded: !1
                                                }
                                            };
                                        else
                                            for (var O = 0; O < I['players']['length']; O++)
                                                if (I['players'][O]['account_id'] == A) {
                                                    L[V] = I['players'][O];
                                                    break;
                                                }
                                    }
                                    for (var V = 0; V < C['real_player_count']; V++)
                                        null == L[V] && (L[V] = {
                                                account: 0,
                                                nickname: B['Tools']['strOfLocalization'](2010),
                                                avatar_id: d,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: f,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: d,
                                                    is_upgraded: !1
                                                }
                                            });
                                    C['_StartObSuccuess'](L, e['passed'], I['game_config']['toJSON'](), I['start_time']);
                                }
                            }));
                    });
                },
                C['prototype']['_StartObSuccuess'] = function (C, z, e, I) {
                    var p = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](I, z);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), B['Scene_MJ'].Inst['openMJRoom'](e, C, Laya['Handler']['create'](this, function () {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](e)), C, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](p, function () {
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, p, function () {
                                            GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](I, z);
                                        });
                                    }));
                            }), Laya['Handler']['create'](this, function (B) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * B);
                            }, null, !1)));
                },
                C['_Inst'] = null,
                C;
            }
            ();
            B['MJNetMgr'] = C;
        }
        (game || (game = {}));

        













        // 读取战绩
        !function (B) {
            var C = function (C) {
                function z() {
                    var B = C.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return B['account_id'] = 0,
                    B['origin_x'] = 0,
                    B['origin_y'] = 0,
                    B.root = null,
                    B['title'] = null,
                    B['level'] = null,
                    B['btn_addfriend'] = null,
                    B['btn_report'] = null,
                    B['illust'] = null,
                    B.name = null,
                    B['detail_data'] = null,
                    B['achievement_data'] = null,
                    B['locking'] = !1,
                    B['tab_info4'] = null,
                    B['tab_info3'] = null,
                    B['tab_note'] = null,
                    B['tab_img_dark'] = '',
                    B['tab_img_chosen'] = '',
                    B['player_data'] = null,
                    B['tab_index'] = 1,
                    B['game_category'] = 1,
                    B['game_type'] = 1,
                    B['show_name'] = '',
                    z.Inst = B,
                    B;
                }
                return __extends(z, C),
                z['prototype']['onCreate'] = function () {
                    var C = this;
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                    this.root = this.me['getChildByName']('root'),
                    this['origin_x'] = this.root.x,
                    this['origin_y'] = this.root.y,
                    this['container_info'] = this.root['getChildByName']('container_info'),
                    this['title'] = new B['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                    this.name = this['container_info']['getChildByName']('name'),
                    this['level'] = new B['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                    this['detail_data'] = new B['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                    this['achievement_data'] = new B['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                    this['illust'] = new B['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                    this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                    this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['btn_addfriend']['visible'] = !1,
                        C['btn_report'].x = 343,
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                            target_id: C['account_id']
                        }, function () {});
                    }, null, !1),
                    this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                    this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                        B['UI_Report_Nickname'].Inst.show(C['account_id']);
                    }),
                    this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || C['close']();
                    }, null, !1),
                    this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['close']();
                    }, null, !1),
                    this.note = new B['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                    this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                    this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || 1 != C['tab_index'] && C['changeMJCategory'](1);
                    }, null, !1),
                    this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                    this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || 2 != C['tab_index'] && C['changeMJCategory'](2);
                    }, null, !1),
                    this['tab_note'] = this.root['getChildByName']('tab_note'),
                    this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? B['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : C['container_info']['visible'] && (C['container_info']['visible'] = !1, C['tab_info4'].skin = C['tab_img_dark'], C['tab_info3'].skin = C['tab_img_dark'], C['tab_note'].skin = C['tab_img_chosen'], C['tab_index'] = 3, C.note.show()));
                    }, null, !1),
                    this['locking'] = !1;
                },
                z['prototype'].show = function (C, z, e, I, p) {
                    var L = this;
                    void 0 === z && (z = 1),
                    void 0 === e && (e = 2),
                    void 0 === I && (I = 1),
                    void 0 === p && (p = ''),
                    GameMgr.Inst['BehavioralStatistics'](14),
                    this['account_id'] = C,
                    this['show_name'] = p,
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this.root.y = this['origin_y'],
                    this['player_data'] = null,
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            L['locking'] = !1;
                        })),
                    this['detail_data']['reset'](),
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                        account_id: C
                    }, function (z, e) {
                        z || e['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', z, e) : B['UI_Shilian']['now_season_info'] && 1001 == B['UI_Shilian']['now_season_info']['season_id'] && 3 != B['UI_Shilian']['get_cur_season_state']() ? (L['detail_data']['setData'](e), L['changeMJCategory'](L['tab_index'], L['game_category'], L['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                            account_id: C
                        }, function (C, z) {
                            C || z['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', C, z) : (e['season_info'] = z['season_info'], L['detail_data']['setData'](e), L['changeMJCategory'](L['tab_index'], L['game_category'], L['game_type']));
                        });
                    }),
                    this.note['init_data'](C),
                    this['refreshBaseInfo'](),
                    this['btn_report']['visible'] = C != GameMgr.Inst['account_id'],
                    this['tab_index'] = z,
                    this['game_category'] = e,
                    this['game_type'] = I,
                    this['container_info']['visible'] = !0,
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                z['prototype']['refreshBaseInfo'] = function () {
                    var C = this;
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
                    }, function (z, e) {
                        if (z || e['error'])
                            B['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', z, e);
                        else {
                            var I = e['account'];
                                            //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                            if (I.account_id == GameMgr.Inst.account_id) {
                                                I.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                    I.title = GameMgr.Inst.account_data.title;
                                                if (MMP.settings.nickname != '') {
                                                    I.nickname = MMP.settings.nickname;
                                                }
                                            }
                                            //end
                            C['player_data'] = I,
                            C['account_id'] != GameMgr.Inst['account_id'] && C['show_name'] && (I['nickname'] = C['show_name']),
                            game['Tools']['SetNickname'](C.name, I, !1, !!C['show_name']),
                            C['title'].id = game['Tools']['titleLocalization'](I['account_id'], I['title']),
                            C['level'].id = I['level'].id,
                            C['level'].id = C['player_data'][1 == C['tab_index'] ? 'level' : 'level3'].id,
                            C['level'].exp = C['player_data'][1 == C['tab_index'] ? 'level' : 'level3']['score'],
                            C['illust'].me['visible'] = !0,
                            C['account_id'] == GameMgr.Inst['account_id'] ? C['illust']['setSkin'](I['avatar_id'], 'waitingroom') : C['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](I['avatar_id']), 'waitingroom'),
                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], C['account_id']) && C['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(C['account_id']) ? (C['btn_addfriend']['visible'] = !0, C['btn_report'].x = 520) : (C['btn_addfriend']['visible'] = !1, C['btn_report'].x = 343),
                            C.note.sign['setSign'](I['signature']),
                            C['achievement_data'].show(!1, I['achievement_count']);
                        }
                    });
                },
                z['prototype']['changeMJCategory'] = function (B, C, z) {
                    void 0 === C && (C = 2),
                    void 0 === z && (z = 1),
                    this['tab_index'] = B,
                    this['container_info']['visible'] = !0,
                    this['detail_data']['changeMJCategory'](B, C, z),
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                z['prototype']['close'] = function () {
                    var C = this;
                    this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    C['locking'] = !1,
                                    C['enable'] = !1;
                                }))));
                },
                z['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                },
                z['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                    this['detail_data']['close'](),
                    this['illust']['clear'](),
                    Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                },
                z.Inst = null,
                z;
            }
            (B['UIBase']);
            B['UI_OtherPlayerInfo'] = C;
        }
        (uiscript || (uiscript = {}));
        














        // 宿舍相关
        !function (B) {
            var C = function () {
                function C(C, e) {
                    var I = this;
                    this['_scale'] = 1,
                    this['during_move'] = !1,
                    this['mouse_start_x'] = 0,
                    this['mouse_start_y'] = 0,
                    this.me = C,
                    this['container_illust'] = e,
                    this['illust'] = this['container_illust']['getChildByName']('illust'),
                    this['container_move'] = C['getChildByName']('move'),
                    this['container_move'].on('mousedown', this, function () {
                        I['during_move'] = !0,
                        I['mouse_start_x'] = I['container_move']['mouseX'],
                        I['mouse_start_y'] = I['container_move']['mouseY'];
                    }),
                    this['container_move'].on('mousemove', this, function () {
                        I['during_move'] && (I.move(I['container_move']['mouseX'] - I['mouse_start_x'], I['container_move']['mouseY'] - I['mouse_start_y']), I['mouse_start_x'] = I['container_move']['mouseX'], I['mouse_start_y'] = I['container_move']['mouseY']);
                    }),
                    this['container_move'].on('mouseup', this, function () {
                        I['during_move'] = !1;
                    }),
                    this['container_move'].on('mouseout', this, function () {
                        I['during_move'] = !1;
                    }),
                    this['btn_close'] = C['getChildByName']('btn_close'),
                    this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        I['locking'] || I['close']();
                    }, null, !1),
                    this['scrollbar'] = C['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                    this['scrollbar'].init(new Laya['Handler'](this, function (B) {
                            I['_scale'] = 1 * (1 - B) + 0.5,
                            I['illust']['scaleX'] = I['_scale'],
                            I['illust']['scaleY'] = I['_scale'],
                            I['scrollbar']['setVal'](B, 0);
                        })),
                    this['dongtai_kaiguan'] = new B['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                z.Inst['illust']['resetSkin'](),
                                I['illust']['scaleX'] = I['_scale'],
                                I['illust']['scaleY'] = I['_scale'];
                            }), new Laya['Handler'](this, function (B) {
                                z.Inst['illust']['playAnim'](B);
                            })),
                    this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](C['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (B) {
                        this['_scale'] = B,
                        this['scrollbar']['setVal'](1 - (B - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                C['prototype'].show = function (C) {
                    var e = this;
                    this['locking'] = !0,
                    this['when_close'] = C,
                    this['illust_start_x'] = this['illust'].x,
                    this['illust_start_y'] = this['illust'].y,
                    this['illust_center_x'] = this['illust'].x + 984 - 446,
                    this['illust_center_y'] = this['illust'].y + 11 - 84,
                    this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                    this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                    this['container_illust']['getChildByName']('btn')['visible'] = !1,
                    z.Inst['stopsay'](),
                    this['scale'] = 1,
                    Laya['Tween'].to(this['illust'], {
                        x: this['illust_center_x'],
                        y: this['illust_center_y']
                    }, 200),
                    B['UIBase']['anim_pop_out'](this['btn_close'], null),
                    this['during_move'] = !1,
                    Laya['timer'].once(250, this, function () {
                        e['locking'] = !1;
                    }),
                    this.me['visible'] = !0,
                    this['dongtai_kaiguan']['refresh'](z.Inst['illust']['skin_id']);
                },
                C['prototype']['close'] = function () {
                    var C = this;
                    this['locking'] = !0,
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                    this['container_illust']['getChildByName']('btn')['visible'] = !0,
                    Laya['Tween'].to(this['illust'], {
                        x: this['illust_start_x'],
                        y: this['illust_start_y'],
                        scaleX: 1,
                        scaleY: 1
                    }, 200),
                    B['UIBase']['anim_pop_hide'](this['btn_close'], null),
                    Laya['timer'].once(250, this, function () {
                        C['locking'] = !1,
                        C.me['visible'] = !1,
                        C['when_close'].run();
                    });
                },
                C['prototype'].move = function (B, C) {
                    var z = this['illust'].x + B,
                    e = this['illust'].y + C;
                    z < this['illust_center_x'] - 600 ? z = this['illust_center_x'] - 600 : z > this['illust_center_x'] + 600 && (z = this['illust_center_x'] + 600),
                    e < this['illust_center_y'] - 1200 ? e = this['illust_center_y'] - 1200 : e > this['illust_center_y'] + 800 && (e = this['illust_center_y'] + 800),
                    this['illust'].x = z,
                    this['illust'].y = e;
                },
                C;
            }
            (),
            z = function (z) {
                function e() {
                    var B = z.call(this, new ui['lobby']['susheUI']()) || this;
                    return B['contianer_illust'] = null,
                    B['illust'] = null,
                    B['illust_rect'] = null,
                    B['container_name'] = null,
                    B['label_name'] = null,
                    B['label_cv'] = null,
                    B['label_cv_title'] = null,
                    B['container_page'] = null,
                    B['container_look_illust'] = null,
                    B['page_select_character'] = null,
                    B['page_visit_character'] = null,
                    B['origin_illust_x'] = 0,
                    B['chat_id'] = 0,
                    B['container_chat'] = null,
                    B['_select_index'] = 0,
                    B['sound_id'] = null,
                    B['chat_block'] = null,
                    B['illust_showing'] = !0,
                    e.Inst = B,
                    B;
                }
                return __extends(e, z),
                e['onMainSkinChange'] = function () {
                    var B = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                    B && B['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](B.path) + '/spine');
                },
                e['randomDesktopID'] = function () {
                    var C = B['UI_Sushe']['commonViewList'][B['UI_Sushe']['using_commonview_index']];
                    if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), C)
                        for (var z = 0; z < C['length']; z++)
                            C[z].slot == game['EView'].mjp ? this['now_mjp_id'] = C[z].type ? C[z]['item_id_list'][Math['floor'](Math['random']() * C[z]['item_id_list']['length'])] : C[z]['item_id'] : C[z].slot == game['EView']['desktop'] ? this['now_desktop_id'] = C[z].type ? C[z]['item_id_list'][Math['floor'](Math['random']() * C[z]['item_id_list']['length'])] : C[z]['item_id'] : C[z].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = C[z].type ? C[z]['item_id_list'][Math['floor'](Math['random']() * C[z]['item_id_list']['length'])] : C[z]['item_id']);
                },
                e.init = function (C) {
                    var z = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (I, p) {
                            if (I || p['error'])
                                B['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', I, p);
                            else {
                                if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](p)), p = JSON['parse'](JSON['stringify'](p)), p['main_character_id'] && p['characters']) {
                                    //if (z['characters'] = [], p['characters'])
                                    //    for (var L = 0; L < p['characters']['length']; L++)
                                    //        z['characters'].push(p['characters'][L]);
                                    //if (z['skin_map'] = {}, p['skins'])
                                    //    for (var L = 0; L < p['skins']['length']; L++)
                                    //        z['skin_map'][p['skins'][L]] = 1;
                                    //z['main_character_id'] = p['main_character_id'];
                                                //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                                fake_data.char_id = p.main_character_id;
                                                for (let count = 0; count < p.characters.length; count++) {
                                                    if (p.characters[count].charid == p.main_character_id) {
                                                        if (p.characters[count].extra_emoji !== undefined) {
                                                            fake_data.emoji = p.characters[count].extra_emoji;
                                                        } else {
                                                            fake_data.emoji = [];
                                                        }
                                                        fake_data.skin = p.skins[count];
                                                        fake_data.exp = p.characters[count].exp;
                                                        fake_data.level = p.characters[count].level;
                                                        fake_data.is_upgraded = p.characters[count].is_upgraded;
                                                        break;
                                                    }
                                                }
                                                z.characters = [];
        
                                                for (let count = 0; count < cfg.item_definition.character['rows_'].length; count++) {
                                                    let id = cfg.item_definition.character['rows_'][count]['id'];
                                                    let skin = cfg.item_definition.character['rows_'][count]['init_skin'];
                                                    let emoji = [];
                                                    let group = cfg.character.emoji.getGroup(id);
                                                    if (group !== undefined) {
                                                        group.forEach((element) => {
                                                            emoji.push(element.sub_id);
                                                        });
                                                        z.characters.push({
                                                            charid: id,
                                                            level: 5,
                                                            exp: 0,
                                                            skin: skin,
                                                            is_upgraded: 1,
                                                            extra_emoji: emoji,
                                                            rewarded_level: [1, 2, 3, 4, 5]
                                                        });
                                                    }
                                                }
                                                let skins = cfg.item_definition.skin['rows_'];
                                                skins.forEach((element) => {
                                                    uiscript.UI_Sushe.add_skin(element['id']);
                                                });
                                                for (let i in uiscript.UI_Sushe.characters) {
                                                    let charid = uiscript.UI_Sushe.characters[i]['charid'];
                                                    let key = charid - 200001;
                                                    if (MMP.settings.characters[key] !== undefined) {
                                                        uiscript.UI_Sushe.characters[i].skin = MMP.settings.characters[key];
                                                    }
                                                }
                                                z.main_character_id = MMP.settings.character;
                                                GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                                uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                                z.star_chars = MMP.settings.star_chars;
                                                p.character_sort = MMP.settings.star_chars;
                                                // END
                                } else
                                    z['characters'] = [], z['characters'].push({
                                        charid: '200001',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400101',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), z['characters'].push({
                                        charid: '200002',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400201',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), z['skin_map']['400101'] = 1, z['skin_map']['400201'] = 1, z['main_character_id'] = '200001';
                                if (z['send_gift_count'] = 0, z['send_gift_limit'] = 0, p['send_gift_count'] && (z['send_gift_count'] = p['send_gift_count']), p['send_gift_limit'] && (z['send_gift_limit'] = p['send_gift_limit']), p['finished_endings'])
                                    for (var L = 0; L < p['finished_endings']['length']; L++)
                                        z['finished_endings_map'][p['finished_endings'][L]] = 1;
                                if (p['rewarded_endings'])
                                    for (var L = 0; L < p['rewarded_endings']['length']; L++)
                                        z['rewarded_endings_map'][p['rewarded_endings'][L]] = 1;
                                if (z['star_chars'] = [], p['character_sort'] && (z['star_chars'] = p['character_sort']), e['hidden_characters_map'] = {}, p['hidden_characters'])
                                    for (var R = 0, E = p['hidden_characters']; R < E['length']; R++) {
                                        var V = E[R];
                                        e['hidden_characters_map'][V] = 1;
                                    }
                                C.run();
                            }
                        }), //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (C, e) {
                            //if (C || e['error'])
                            //    B['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', C, e);
                            //else {
                            //    z['using_commonview_index'] = e.use,
                            //    z['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                            //    var I = e['views'];
                            //    if (I)
                            //        for (var p = 0; p < I['length']; p++) {
                            //            var L = I[p]['values'];
                            //            L && (z['commonViewList'][I[p]['index']] = L);
                            //        }
                            //    z['randomDesktopID'](),
                                        z.commonViewList = MMP.settings.commonViewList;
                                    z.using_commonview_index = MMP.settings.using_commonview_index;
                                    GameMgr.Inst.account_data.title = MMP.settings.title;
                                GameMgr.Inst['load_mjp_view']();
                                GameMgr.Inst['load_touming_mjp_view']();
                                    GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                                    uiscript.UI_Sushe.randomDesktopID();
                            //}
                        //}), void 0);
                },
                e['onFetchSuccess'] = function (B) {
                    var C = B['character_info'];
                    if (C) {
                        if (C['main_character_id'] && C['characters']) {
                            //if (this['characters'] = [], C['characters'])
                            //    for (var z = 0; z < C['characters']['length']; z++)
                            //        this['characters'].push(C['characters'][z]);
                            //if (this['skin_map'] = {}, C['skins'])
                            //    for (var z = 0; z < C['skins']['length']; z++)
                            //        this['skin_map'][C['skins'][z]] = 1;
                            //this['main_character_id'] = C['main_character_id'];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            fake_data.char_id = C.main_character_id;
                                            for (let count = 0; count < C.characters.length; count++) {
                                                if (C.characters[count].charid == C.main_character_id) {
                                                    if (C.characters[count].extra_emoji !== undefined) {
                                                        fake_data.emoji = C.characters[count].extra_emoji;
                                                    } else {
                                                        fake_data.emoji = [];
                                                    }
                                                    fake_data.skin = C.skins[count];
                                                    fake_data.exp = C.characters[count].exp;
                                                    fake_data.level = C.characters[count].level;
                                                    fake_data.is_upgraded = C.characters[count].is_upgraded;
                                                    break;
                                                }
                                            }
                                            this.characters = [];
        
                                            for (let count = 0; count < cfg.item_definition.character['rows_'].length; count++) {
                                                let id = cfg.item_definition.character['rows_'][count]['id'];
                                                let skin = cfg.item_definition.character['rows_'][count]['init_skin'];
                                                let emoji = [];
                                                let group = cfg.character.emoji.getGroup(id);
                                                if (group !== undefined) {
                                                    group.forEach((element) => {
                                                        emoji.push(element.sub_id);
                                                    });
                                                    this.characters.push({
                                                        charid: id,
                                                        level: 5,
                                                        exp: 0,
                                                        skin: skin,
                                                        is_upgraded: 1,
                                                        extra_emoji: emoji,
                                                        rewarded_level: [1, 2, 3, 4, 5]
                                                    });
                                                }
                                            }
                                            let skins = cfg.item_definition.skin['rows_'];
                                            skins.forEach((element) => {
                                                uiscript.UI_Sushe.add_skin(element['id']);
                                            });
                                            for (let i in uiscript.UI_Sushe.characters) {
                                                let charid = uiscript.UI_Sushe.characters[i]['charid'];
                                                let key = charid - 200001;
                                                if (MMP.settings.characters[key] !== undefined) {
                                                    uiscript.UI_Sushe.characters[i].skin = MMP.settings.characters[key];
                                                }
                                            }
                                            this.main_character_id = MMP.settings.character;
                                            GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                            uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                            this.star_chars = MMP.settings.star_chars;
                                            C.character_sort = MMP.settings.star_chars;
                                            // END
                        } else
                            this['characters'] = [], this['characters'].push({
                                charid: '200001',
                                level: 0,
                                exp: 0,
                                views: [],
                                skin: '400101',
                                is_upgraded: !1,
                                extra_emoji: [],
                                rewarded_level: []
                            }), this['characters'].push({
                                charid: '200002',
                                level: 0,
                                exp: 0,
                                views: [],
                                skin: '400201',
                                is_upgraded: !1,
                                extra_emoji: [],
                                rewarded_level: []
                            }), this['skin_map']['400101'] = 1, this['skin_map']['400201'] = 1, this['main_character_id'] = '200001';
                        if (this['send_gift_count'] = 0, this['send_gift_limit'] = 0, C['send_gift_count'] && (this['send_gift_count'] = C['send_gift_count']), C['send_gift_limit'] && (this['send_gift_limit'] = C['send_gift_limit']), C['finished_endings'])
                            for (var z = 0; z < C['finished_endings']['length']; z++)
                                this['finished_endings_map'][C['finished_endings'][z]] = 1;
                        if (C['rewarded_endings'])
                            for (var z = 0; z < C['rewarded_endings']['length']; z++)
                                this['rewarded_endings_map'][C['rewarded_endings'][z]] = 1;
                        if (this['star_chars'] = [], C['character_sort'] && 0 != C['character_sort']['length'] && (this['star_chars'] = C['character_sort']), e['hidden_characters_map'] = {}, C['hidden_characters'])
                            for (var I = 0, p = C['hidden_characters']; I < p['length']; I++) {
                                var L = p[I];
                                e['hidden_characters_map'][L] = 1;
                            }
                    }
                    var R = B['all_common_views'];
                    //if (R) {
                   //     this['using_commonview_index'] = R.use,
                   //     this['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                   //     var E = R['views'];
                   //     if (E)
                   //         for (var z = 0; z < E['length']; z++) {
                   //             var V = E[z]['values'];
                   //             V && (this['commonViewList'][E[z]['index']] = V);
                   //         }
                   //     this['randomDesktopID'](),
                                    this.commonViewList = MMP.settings.commonViewList;
                                    this.using_commonview_index = MMP.settings.using_commonview_index;
                                    GameMgr.Inst.account_data.title = MMP.settings.title;
                        GameMgr.Inst['load_mjp_view']();
                        GameMgr.Inst['load_touming_mjp_view']();
                                    GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                                    this.randomDesktopID();
                    //}
                },
                e['on_data_updata'] = function (C) {
                    if (C['character']) {
                        var z = JSON['parse'](JSON['stringify'](C['character']));
                        if (z['characters'])
                            for (var e = z['characters'], I = 0; I < e['length']; I++) {
                                for (var p = !1, L = 0; L < this['characters']['length']; L++)
                                    if (this['characters'][L]['charid'] == e[I]['charid']) {
                                        this['characters'][L] = e[I],
                                        B['UI_Sushe_Visit'].Inst && B['UI_Sushe_Visit'].Inst['chara_info'] && B['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][L]['charid'] && (B['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][L]),
                                        p = !0;
                                        break;
                                    }
                                p || this['characters'].push(e[I]);
                            }
                        if (z['skins'])
                            for (var R = z['skins'], I = 0; I < R['length']; I++)
                                this['skin_map'][R[I]] = 1;
                                        // START
                                        uiscript['UI_Bag'].Inst['on_skin_change']();
                                        // END
                        if (z['finished_endings']) {
                            for (var E = z['finished_endings'], I = 0; I < E['length']; I++)
                                this['finished_endings_map'][E[I]] = 1;
                            B['UI_Sushe_Visit'].Inst;
                        }
                        if (z['rewarded_endings']) {
                            for (var E = z['rewarded_endings'], I = 0; I < E['length']; I++)
                                this['rewarded_endings_map'][E[I]] = 1;
                            B['UI_Sushe_Visit'].Inst;
                        }
                    }
                },
                e['chara_owned'] = function (B) {
                    for (var C = 0; C < this['characters']['length']; C++)
                        if (this['characters'][C]['charid'] == B)
                            return !0;
                    return !1;
                },
                e['skin_owned'] = function (B) {
                    return this['skin_map']['hasOwnProperty'](B['toString']());
                },
                e['add_skin'] = function (B) {
                    this['skin_map'][B] = 1;
                },
                Object['defineProperty'](e, 'main_chara_info', {
                    get: function () {
                        for (var B = 0; B < this['characters']['length']; B++)
                            if (this['characters'][B]['charid'] == this['main_character_id'])
                                return this['characters'][B];
                        return null;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                e['on_view_remove'] = function (B) {
                    for (var C = 0; C < this['commonViewList']['length']; C++)
                        for (var z = this['commonViewList'][C], e = 0; e < z['length']; e++)
                            if (z[e]['item_id'] == B && (z[e]['item_id'] = game['GameUtility']['get_view_default_item_id'](z[e].slot)), z[e]['item_id_list']) {
                                for (var I = 0; I < z[e]['item_id_list']['length']; I++)
                                    if (z[e]['item_id_list'][I] == B) {
                                        z[e]['item_id_list']['splice'](I, 1);
                                        break;
                                    }
                                0 == z[e]['item_id_list']['length'] && (z[e].type = 0);
                            }
                    var p = cfg['item_definition'].item.get(B);
                    p.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == B && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                },
                e['add_finish_ending'] = function (B) {
                    this['finished_endings_map'][B] = 1;
                },
                e['add_reward_ending'] = function (B) {
                    this['rewarded_endings_map'][B] = 1;
                },
                e['check_all_char_repoint'] = function () {
                    for (var B = 0; B < e['characters']['length']; B++)
                        if (this['check_char_redpoint'](e['characters'][B]))
                            return !0;
                    return !1;
                },
                e['check_char_redpoint'] = function (B) {
                                    // 去除小红点
                    //if (e['hidden_characters_map'][B['charid']])
                        return !1;
                                    //END
                    var C = cfg.spot.spot['getGroup'](B['charid']);
                    if (C)
                        for (var z = 0; z < C['length']; z++) {
                            var I = C[z];
                            if (!(I['is_married'] && !B['is_upgraded'] || !I['is_married'] && B['level'] < I['level_limit']) && 2 == I.type) {
                                for (var p = !0, L = 0; L < I['jieju']['length']; L++)
                                    if (I['jieju'][L] && e['finished_endings_map'][I['jieju'][L]]) {
                                        if (!e['rewarded_endings_map'][I['jieju'][L]])
                                            return !0;
                                        p = !1;
                                    }
                                if (p)
                                    return !0;
                            }
                        }
                    var R = cfg['item_definition']['character'].get(B['charid']);
                    if (R && R.ur)
                        for (var E = cfg['level_definition']['character']['getGroup'](B['charid']), V = 1, d = 0, f = E; d < f['length']; d++) {
                            var A = f[d];
                            if (V > B['level'])
                                return;
                            if (A['reward'] && (!B['rewarded_level'] || -1 == B['rewarded_level']['indexOf'](V)))
                                return !0;
                            V++;
                        }
                    return !1;
                },
                e['is_char_star'] = function (B) {
                    return -1 != this['star_chars']['indexOf'](B);
                },
                e['change_char_star'] = function (B) {
                    var C = this['star_chars']['indexOf'](B);
                    -1 != C ? this['star_chars']['splice'](C, 1) : this['star_chars'].push(B);
                                    // 屏蔽网络请求
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                    //    sort: this['star_chars']
                    //}, function () {});
                                    // END
                },
                Object['defineProperty'](e['prototype'], 'select_index', {
                    get: function () {
                        return this['_select_index'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                e['prototype']['reset_select_index'] = function () {
                    this['_select_index'] = -1;
                },
                e['prototype']['onCreate'] = function () {
                    var z = this;
                    this['contianer_illust'] = this.me['getChildByName']('illust'),
                    this['illust'] = new B['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                    this['illust']['setType']('liaoshe'),
                    this['illust_rect'] = B['UIRect']['CreateFromSprite'](this['illust'].me),
                    this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                    this['chat_block'] = new B['UI_Character_Chat'](this['container_chat'], !0),
                    this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (!z['page_visit_character'].me['visible'] || !z['page_visit_character']['cannot_click_say'])
                            if (z['illust']['onClick'](), z['sound_id'])
                                z['stopsay']();
                            else {
                                if (!z['illust_showing'])
                                    return;
                                z.say('lobby_normal');
                            }
                    }, null, !1),
                    this['container_name'] = null,
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title'), 'chs_t' == GameMgr['client_type'] && this['label_cv_title']['scale'](0.98, 0.98)) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                    this['label_name'] = this['container_name']['getChildByName']('label_name'),
                    this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                    'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                    this['origin_illust_x'] = this['contianer_illust'].x,
                    this['container_page'] = this.me['getChildByName']('container_page'),
                    this['page_select_character'] = new B['UI_Sushe_Select'](),
                    this['container_page']['addChild'](this['page_select_character'].me),
                    this['page_visit_character'] = new B['UI_Sushe_Visit'](),
                    this['container_page']['addChild'](this['page_visit_character'].me),
                    this['container_look_illust'] = new C(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                },
                e['prototype'].show = function (C) {
                    B['UI_Activity_SevenDays']['task_done'](1),
                    GameMgr.Inst['BehavioralStatistics'](15),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['page_visit_character'].me['visible'] = !1,
                    this['container_look_illust'].me['visible'] = !1;
                    for (var z = 0, I = 0; I < e['characters']['length']; I++)
                        if (e['characters'][I]['charid'] == e['main_character_id']) {
                            z = I;
                            break;
                        }
                    0 == C ? (this['change_select'](z), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                },
                e['prototype']['starup_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character']['star_up_back'](e['characters'][this['_select_index']]),
                    this['page_visit_character']['show_levelup']();
                },
                e['prototype']['spot_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character'].show(e['characters'][this['_select_index']], 2);
                },
                e['prototype']['go2Lobby'] = function () {
                    this['close'](Laya['Handler']['create'](this, function () {
                            B['UIMgr'].Inst['showLobby']();
                        }));
                },
                e['prototype']['close'] = function (C) {
                    var z = this;
                    this['illust_showing'] && B['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                        x: -30
                    }, 150, 0),
                    Laya['timer'].once(150, this, function () {
                        z['enable'] = !1,
                        C && C.run();
                    });
                },
                e['prototype']['onDisable'] = function () {
                    view['AudioMgr']['refresh_music_volume'](!1),
                    this['illust']['clear'](),
                    this['stopsay'](),
                    this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                },
                e['prototype']['hide_illust'] = function () {
                    var C = this;
                    this['illust_showing'] && (this['illust_showing'] = !1, B['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                            x: -30
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                C['contianer_illust']['visible'] = !1;
                            })));
                },
                e['prototype']['open_illust'] = function () {
                    if (!this['illust_showing'])
                        if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                            this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, B['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                x: -30
                            }, 200);
                        else {
                            for (var C = 0, z = 0; z < e['characters']['length']; z++)
                                if (e['characters'][z]['charid'] == e['main_character_id']) {
                                    C = z;
                                    break;
                                }
                            this['change_select'](C);
                        }
                },
                e['prototype']['show_page_select'] = function () {
                    this['page_select_character'].show(0);
                },
                e['prototype']['show_page_visit'] = function (B) {
                    void 0 === B && (B = 0),
                    this['page_visit_character'].show(e['characters'][this['_select_index']], B);
                },
                e['prototype']['change_select'] = function (C) {
                    this['_select_index'] = C,
                    this['illust']['clear'](),
                    this['illust_showing'] = !0;
                    var z = e['characters'][C],
                    I = cfg['item_definition']['character'].get(z['charid']);
                    if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != e['chs_fengyu_name_lst']['indexOf'](z['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != e['chs_fengyu_cv_lst']['indexOf'](z['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        this['label_name'].text = I['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                        this['label_cv'].text = I['desc_cv_' + GameMgr['client_language']],
                        this['label_cv_title'].text = 'CV',
                        'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_name'].font ? this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](0.9, 0.9), this['label_name']['leading'] = -8) : (this['label_name']['scale'](1.2, 1.2), this['label_name']['leading'] = 0) : this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](1.1, 1.1), this['label_name']['leading'] = -14) : (this['label_name']['scale'](1.25, 1.25), this['label_name']['leading'] = -3);
                        var p = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                        p.test(I['name_' + GameMgr['client_language']]) && (this['label_name']['leading'] -= 15),
                        p.test(this['label_cv'].text) && (this['label_cv']['leading'] -= 7),
                        this['label_cv']['height'] = 600,
                        'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_cv'].font ? (this['label_cv']['scale'](1, 1), this['label_cv']['leading'] = -4, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']) : (this['label_cv']['scale'](1.1, 1.1), this['label_cv']['leading'] = -9, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']);
                    } else
                        this['label_name'].text = I['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + I['desc_cv_' + GameMgr['client_language']];
                    var L = new B['UIRect']();
                    L.x = this['illust_rect'].x,
                    L.y = this['illust_rect'].y,
                    L['width'] = this['illust_rect']['width'],
                    L['height'] = this['illust_rect']['height'],
                    this['illust']['setRect'](L),
                    this['illust']['setSkin'](z.skin, 'full'),
                    this['contianer_illust']['visible'] = !0,
                    Laya['Tween']['clearAll'](this['contianer_illust']),
                    this['contianer_illust'].x = this['origin_illust_x'],
                    this['contianer_illust']['alpha'] = 1,
                    B['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                        x: -30
                    }, 230),
                    this['stopsay']();
                    var R = cfg['item_definition'].skin.get(z.skin);
                    R && R['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                },
                e['prototype']['onChangeSkin'] = function (B) {
                    e['characters'][this['_select_index']].skin = B,
                    this['change_select'](this['_select_index']),
                    e['characters'][this['_select_index']]['charid'] == e['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = B, e['onMainSkinChange']());
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                    //    character_id: e['characters'][this['_select_index']]['charid'],
                    //    skin: B
                    //}, function () {});
                                    // 保存皮肤
                },
                e['prototype'].say = function (B) {
                    var C = this,
                    z = e['characters'][this['_select_index']];
                    this['chat_id']++;
                    var I = this['chat_id'],
                    p = view['AudioMgr']['PlayCharactorSound'](z, B, Laya['Handler']['create'](this, function () {
                                Laya['timer'].once(1000, C, function () {
                                    I == C['chat_id'] && C['stopsay']();
                                });
                            }));
                    p && (this['chat_block'].show(p['words']), this['sound_id'] = p['audio_id']);
                },
                e['prototype']['stopsay'] = function () {
                    this['chat_block']['close'](!1),
                    this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                },
                e['prototype']['to_look_illust'] = function () {
                    var B = this;
                    this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                            B['illust']['playAnim']('idle'),
                            B['page_select_character'].show(0);
                        }));
                },
                e['prototype']['jump_to_char_skin'] = function (C, z) {
                    var I = this;
                    if (void 0 === C && (C = -1), void 0 === z && (z = null), C >= 0)
                        for (var p = 0; p < e['characters']['length']; p++)
                            if (e['characters'][p]['charid'] == C) {
                                this['change_select'](p);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            e.Inst['show_page_visit'](),
                            I['page_visit_character']['show_pop_skin'](),
                            I['page_visit_character']['set_jump_callback'](z);
                        }));
                },
                e['prototype']['jump_to_char_qiyue'] = function (C) {
                    var z = this;
                    if (void 0 === C && (C = -1), C >= 0)
                        for (var I = 0; I < e['characters']['length']; I++)
                            if (e['characters'][I]['charid'] == C) {
                                this['change_select'](I);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            e.Inst['show_page_visit'](),
                            z['page_visit_character']['show_qiyue']();
                        }));
                },
                e['prototype']['jump_to_char_gift'] = function (C) {
                    var z = this;
                    if (void 0 === C && (C = -1), C >= 0)
                        for (var I = 0; I < e['characters']['length']; I++)
                            if (e['characters'][I]['charid'] == C) {
                                this['change_select'](I);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            e.Inst['show_page_visit'](),
                            z['page_visit_character']['show_gift']();
                        }));
                },
                e['characters'] = [],
                e['chs_fengyu_name_lst'] = ['200040', '200043', '200090'],
                e['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                e['skin_map'] = {},
                e['main_character_id'] = 0,
                e['send_gift_count'] = 0,
                e['send_gift_limit'] = 0,
                e['commonViewList'] = [],
                e['using_commonview_index'] = 0,
                e['finished_endings_map'] = {},
                e['rewarded_endings_map'] = {},
                e['star_chars'] = [],
                e['hidden_characters_map'] = {},
                e.Inst = null,
                e;
            }
            (B['UIBase']);
            B['UI_Sushe'] = z;
        }
        (uiscript || (uiscript = {}));
        















        // 屏蔽改变宿舍角色的网络请求
        !function (B) {
            var C = function () {
                function C(C) {
                    var e = this;
                    this['scrollview'] = null,
                    this['select_index'] = 0,
                    this['show_index_list'] = [],
                    this['only_show_star_char'] = !1,
                    this.me = C,
                    this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        z.Inst['locking'] || z.Inst['close'](Laya['Handler']['create'](e, function () {
                                B['UI_Sushe'].Inst['show_page_visit']();
                            }));
                    }, null, !1),
                    this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        z.Inst['locking'] || z.Inst['close'](Laya['Handler']['create'](e, function () {
                                B['UI_Sushe'].Inst['to_look_illust']();
                            }));
                    }, null, !1),
                    this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        z.Inst['locking'] || B['UI_Sushe'].Inst['jump_to_char_skin']();
                    }, null, !1),
                    this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        z.Inst['locking'] || e['onChangeStarShowBtnClick']();
                    }, null, !1),
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                    this['scrollview']['setElastic'](),
                    this['dongtai_kaiguan'] = new B['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                B['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                }
                return C['prototype'].show = function (C, z) {
                    if (void 0 === z && (z = !1), this.me['visible'] = !0, this['locking'] = !1, C ? this.me['alpha'] = 1 : B['UIBase']['anim_alpha_in'](this.me, {
                            x: 0
                        }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), z || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var e = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, e));
                    }
                },
                C['prototype']['render_character_cell'] = function (C) {
                    var z = this,
                    e = C['index'],
                    I = C['container'],
                    p = C['cache_data'];
                    I['visible'] = !0,
                    p['index'] = e,
                    p['inited'] || (p['inited'] = !0, I['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            z['onClickAtHead'](p['index']);
                        }), p.skin = new B['UI_Character_Skin'](I['getChildByName']('btn')['getChildByName']('head')), p.bg = I['getChildByName']('btn')['getChildByName']('bg'), p['bound'] = I['getChildByName']('btn')['getChildByName']('bound'), p['btn_star'] = I['getChildByName']('btn_star'), p.star = I['getChildByName']('btn')['getChildByName']('star'), p['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                            z['onClickAtStar'](p['index']);
                        }));
                    var L = I['getChildByName']('btn');
                    L['getChildByName']('choose')['visible'] = e == this['select_index'];
                    var R = this['getCharInfoByIndex'](e);
                    L['getChildByName']('redpoint')['visible'] = B['UI_Sushe']['check_char_redpoint'](R),
                    p.skin['setSkin'](R.skin, 'bighead'),
                    L['getChildByName']('using')['visible'] = R['charid'] == B['UI_Sushe']['main_character_id'],
                    I['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '2.png' : '.png'));
                    var E = cfg['item_definition']['character'].get(R['charid']);
                    'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? p['bound'].skin = E.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (R['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (R['is_upgraded'] ? '2.png' : '.png')) : E.ur ? (p['bound'].pos(-10, -2), p['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '6.png' : '5.png'))) : (p['bound'].pos(4, 20), p['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '4.png' : '3.png'))),
                    p['btn_star']['visible'] = this['select_index'] == e,
                    p.star['visible'] = B['UI_Sushe']['is_char_star'](R['charid']) || this['select_index'] == e;
                    var V = cfg['item_definition']['character'].find(R['charid']),
                    d = L['getChildByName']('label_name'),
                    f = V['name_' + GameMgr['client_language'] + '2'] ? V['name_' + GameMgr['client_language'] + '2'] : V['name_' + GameMgr['client_language']];
                    if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        p.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (B['UI_Sushe']['is_char_star'](R['charid']) ? 'l' : 'd') + (R['is_upgraded'] ? '1.png' : '.png')),
                        d.text = f['replace']('-', '|')['replace'](/\./g, '·');
                        var A = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                        d['leading'] = A.test(f) ? -15 : 0;
                    } else
                        p.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (B['UI_Sushe']['is_char_star'](R['charid']) ? 'l.png' : 'd.png')), d.text = f;
                    ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == R['charid'] ? (d['scaleX'] = 0.67, d['scaleY'] = 0.57) : (d['scaleX'] = 0.7, d['scaleY'] = 0.6));
                },
                C['prototype']['onClickAtHead'] = function (C) {
                    var z = this;
                    if (!this['locking'])
                        if (this['select_index'] == C) {
                            var e = this['getCharInfoByIndex'](C);
                            if (e['charid'] != B['UI_Sushe']['main_character_id'])
                                if (B['UI_PiPeiYuYue'].Inst['enable'])
                                    this['locking'] = !0, Laya['timer']['frameOnce'](11, this, function () {
                                        z['locking'] = !1;
                                    }), B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var I = B['UI_Sushe']['main_character_id'];
                                    B['UI_Sushe']['main_character_id'] = e['charid'],
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        character_id: B['UI_Sushe']['main_character_id']
                                    }, function () {}),
                                    GameMgr.Inst['account_data']['avatar_id'] = e.skin,
                                    B['UI_Sushe']['onMainSkinChange']();
                                            // 保存人物和皮肤
                                            MMP.settings.character = e.charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = e.skin;
                                            MMP.saveSettings();
                                            // END
                                    for (var p = 0; p < this['show_index_list']['length']; p++)
                                        this['getCharInfoByIndex'](p)['charid'] == I && this['scrollview']['wantToRefreshItem'](p);
                                    this['scrollview']['wantToRefreshItem'](C);
                                }
                        } else {
                            var L = this['select_index'];
                            this['select_index'] = C,
                            L >= 0 && this['scrollview']['wantToRefreshItem'](L),
                            this['scrollview']['wantToRefreshItem'](C),
                            B['UI_Sushe'].Inst['change_select'](this['show_index_list'][C]);
                        }
                },
                C['prototype']['onClickAtStar'] = function (C) {
                    if (B['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](C)['charid']), this['only_show_star_char'])
                        this['scrollview']['wantToRefreshItem'](C);
                    else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var z = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                        this['scrollview'].rate = Math.min(1, Math.max(0, z));
                    }
                                // 保存人物和皮肤
                                MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                                MMP.saveSettings();
                                // END
                },
                C['prototype']['close'] = function (C) {
                    var z = this;
                    this.me['visible'] && (C ? this.me['visible'] = !1 : B['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                    z.me['visible'] = !1;
                                })));
                },
                C['prototype']['onChangeStarShowBtnClick'] = function () {
                    if (!this['only_show_star_char']) {
                        for (var C = !1, z = 0, e = B['UI_Sushe']['star_chars']; z < e['length']; z++) {
                            var I = e[z];
                            if (!B['UI_Sushe']['hidden_characters_map'][I]) {
                                C = !0;
                                break;
                            }
                        }
                        if (!C)
                            return B['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3301)), void 0;
                    }
                    B['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                    this['only_show_star_char'] = !this['only_show_star_char'],
                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                    var p = this.me['getChildByName']('btn_star')['getChildAt'](1);
                    Laya['Tween']['clearAll'](p),
                    Laya['Tween'].to(p, {
                        x: this['only_show_star_char'] ? 107 : 47
                    }, 150),
                    this.show(!0, !0);
                },
                C['prototype']['getShowStarState'] = function () {
                    if (0 == B['UI_Sushe']['star_chars']['length'])
                        return this['only_show_star_char'] = !1, void 0;
                    if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                        for (var C = 0, z = B['UI_Sushe']['star_chars']; C < z['length']; C++) {
                            var e = z[C];
                            if (!B['UI_Sushe']['hidden_characters_map'][e])
                                return;
                        }
                        this['only_show_star_char'] = !1,
                        app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                    }
                },
                C['prototype']['sortShowCharsList'] = function () {
                    this['show_index_list'] = [],
                    this['select_index'] = -1;
                    for (var C = 0, z = B['UI_Sushe']['star_chars']; C < z['length']; C++) {
                        var e = z[C];
                        if (!B['UI_Sushe']['hidden_characters_map'][e])
                            for (var I = 0; I < B['UI_Sushe']['characters']['length']; I++)
                                if (B['UI_Sushe']['characters'][I]['charid'] == e) {
                                    I == B['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                    this['show_index_list'].push(I);
                                    break;
                                }
                    }
                    if (!this['only_show_star_char'])
                        for (var I = 0; I < B['UI_Sushe']['characters']['length']; I++)
                            B['UI_Sushe']['hidden_characters_map'][B['UI_Sushe']['characters'][I]['charid']] || -1 == this['show_index_list']['indexOf'](I) && (I == B['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(I));
                },
                C['prototype']['getCharInfoByIndex'] = function (C) {
                    return B['UI_Sushe']['characters'][this['show_index_list'][C]];
                },
                C;
            }
            (),
            z = function (z) {
                function e() {
                    var B = z.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                    return B['bg_width_head'] = 962,
                    B['bg_width_zhuangban'] = 1819,
                    B['bg2_delta'] = -29,
                    B['container_top'] = null,
                    B['locking'] = !1,
                    B.tabs = [],
                    B['tab_index'] = 0,
                    e.Inst = B,
                    B;
                }
                return __extends(e, z),
                e['prototype']['onCreate'] = function () {
                    var z = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        z['locking'] || (1 == z['tab_index'] && z['container_zhuangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                    z['close'](),
                                    B['UI_Sushe'].Inst['go2Lobby']();
                                }), null) : (z['close'](), B['UI_Sushe'].Inst['go2Lobby']()));
                    }, null, !1),
                    this.root = this.me['getChildByName']('root'),
                    this.bg2 = this.root['getChildByName']('bg2'),
                    this.bg = this.root['getChildByName']('bg');
                    for (var e = this.root['getChildByName']('container_tabs'), I = function (C) {
                        p.tabs.push(e['getChildAt'](C)),
                        p.tabs[C]['clickHandler'] = new Laya['Handler'](p, function () {
                            z['locking'] || z['tab_index'] != C && (1 == z['tab_index'] && z['container_zhuangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                        z['change_tab'](C);
                                    }), null) : z['change_tab'](C));
                        });
                    }, p = this, L = 0; L < e['numChildren']; L++)
                        I(L);
                    this['container_head'] = new C(this.root['getChildByName']('container_heads')),
                    this['container_zhuangban'] = new B['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return z['locking'];
                            }));
                },
                e['prototype'].show = function (C) {
                    var z = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['container_head']['dongtai_kaiguan']['refresh'](),
                    this['tab_index'] = C,
                    this['container_top'].y = 48,
                    0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), B['UIBase']['anim_alpha_in'](this['container_top'], {
                            y: -30
                        }, 200), B['UIBase']['anim_alpha_in'](this.root, {
                            x: 30
                        }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), B['UIBase']['anim_alpha_in'](this['container_top'], {
                            y: -30
                        }, 200), B['UIBase']['anim_alpha_in'](this.root, {
                            y: 30
                        }, 200)),
                    Laya['timer'].once(200, this, function () {
                        z['locking'] = !1;
                    });
                    for (var e = 0; e < this.tabs['length']; e++) {
                        var I = this.tabs[e];
                        I.skin = game['Tools']['localUISrc'](e == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var p = I['getChildByName']('word');
                        p['color'] = e == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        p['scaleX'] = p['scaleY'] = e == this['tab_index'] ? 1.1 : 1,
                        e == this['tab_index'] && I['parent']['setChildIndex'](I, this.tabs['length'] - 1);
                    }
                },
                e['prototype']['change_tab'] = function (C) {
                    var z = this;
                    this['tab_index'] = C;
                    for (var e = 0; e < this.tabs['length']; e++) {
                        var I = this.tabs[e];
                        I.skin = game['Tools']['localUISrc'](e == C ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var p = I['getChildByName']('word');
                        p['color'] = e == C ? '#552c1c' : '#d3a86c',
                        p['scaleX'] = p['scaleY'] = e == C ? 1.1 : 1,
                        e == C && I['parent']['setChildIndex'](I, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_head']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                B['UI_Sushe'].Inst['open_illust'](),
                                z['container_head'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_head'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), B['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_zhuangban']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                z['container_zhuangban'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_zhuangban'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])),
                    Laya['timer'].once(400, this, function () {
                        z['locking'] = !1;
                    });
                },
                e['prototype']['close'] = function (C) {
                    var z = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150),
                    0 == this['tab_index'] ? B['UIBase']['anim_alpha_out'](this.root, {
                        x: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            z['container_head']['close'](!0);
                        })) : B['UIBase']['anim_alpha_out'](this.root, {
                        y: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            z['container_zhuangban']['close'](!0);
                        })),
                    Laya['timer'].once(150, this, function () {
                        z['locking'] = !1,
                        z['enable'] = !1,
                        C && C.run();
                    });
                },
                e['prototype']['onDisable'] = function () {
                    for (var C = 0; C < B['UI_Sushe']['characters']['length']; C++) {
                        var z = B['UI_Sushe']['characters'][C].skin,
                        e = cfg['item_definition'].skin.get(z);
                        e && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](e.path + '/bighead.png'));
                    }
                },
                e['prototype']['changeKaiguanShow'] = function (B) {
                    B ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                },
                e['prototype']['changeZhuangbanSlot'] = function (B) {
                    this['container_zhuangban']['changeSlotByItemId'](B);
                },
                e;
            }
            (B['UIBase']);
            B['UI_Sushe_Select'] = z;
        }
        (uiscript || (uiscript = {}));
        












        // 友人房
        !function (B) {
            var C = function () {
                function C(B) {
                    var C = this;
                    this['friends'] = [],
                    this['sortlist'] = [],
                    this.me = B,
                    this.me['visible'] = !1,
                    this['blackbg'] = B['getChildByName']('blackbg'),
                    this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || C['close']();
                    }, null, !1),
                    this.root = B['getChildByName']('root'),
                    this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                    this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return C['prototype'].show = function () {
                    var C = this;
                    this['locking'] = !0,
                    this.me['visible'] = !0,
                    this['scrollview']['reset'](),
                    this['friends'] = [],
                    this['sortlist'] = [];
                    for (var z = game['FriendMgr']['friend_list'], e = 0; e < z['length']; e++)
                        this['sortlist'].push(e);
                    this['sortlist'] = this['sortlist'].sort(function (B, C) {
                        var e = z[B],
                        I = 0;
                        if (e['state']['is_online']) {
                            var p = game['Tools']['playState2Desc'](e['state']['playing']);
                            I += '' != p ? 30000000000 : 60000000000,
                            e.base['level'] && (I += e.base['level'].id % 1000 * 10000000),
                            e.base['level3'] && (I += e.base['level3'].id % 1000 * 10000),
                            I += -Math['floor'](e['state']['login_time'] / 10000000);
                        } else
                            I += e['state']['logout_time'];
                        var L = z[C],
                        R = 0;
                        if (L['state']['is_online']) {
                            var p = game['Tools']['playState2Desc'](L['state']['playing']);
                            R += '' != p ? 30000000000 : 60000000000,
                            L.base['level'] && (R += L.base['level'].id % 1000 * 10000000),
                            L.base['level3'] && (R += L.base['level3'].id % 1000 * 10000),
                            R += -Math['floor'](L['state']['login_time'] / 10000000);
                        } else
                            R += L['state']['logout_time'];
                        return R - I;
                    });
                    for (var e = 0; e < z['length']; e++)
                        this['friends'].push({
                            f: z[e],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                    this['scrollview']['addItem'](this['friends']['length']),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1;
                        }));
                },
                C['prototype']['close'] = function () {
                    var C = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1,
                            C.me['visible'] = !1;
                        }));
                },
                C['prototype']['render_item'] = function (C) {
                    var z = C['index'],
                    e = C['container'],
                    p = C['cache_data'];
                    p.head || (p.head = new B['UI_Head'](e['getChildByName']('head'), 'UI_WaitingRoom'), p.name = e['getChildByName']('name'), p['state'] = e['getChildByName']('label_state'), p.btn = e['getChildByName']('btn_invite'), p['invited'] = e['getChildByName']('invited'));
                    var L = this['friends'][this['sortlist'][z]];
                    p.head.id = game['GameUtility']['get_limited_skin_id'](L.f.base['avatar_id']),
                    p.head['set_head_frame'](L.f.base['account_id'], L.f.base['avatar_frame']),
                    game['Tools']['SetNickname'](p.name, L.f.base, GameMgr.Inst['hide_nickname']);
                    var R = !1;
                    if (L.f['state']['is_online']) {
                        var E = game['Tools']['playState2Desc'](L.f['state']['playing']);
                        '' != E ? (p['state'].text = game['Tools']['strOfLocalization'](2069, [E]), p['state']['color'] = '#a9d94d', p.name['getChildByName']('name')['color'] = '#a9d94d') : (p['state'].text = game['Tools']['strOfLocalization'](2071), p['state']['color'] = '#58c4db', p.name['getChildByName']('name')['color'] = '#58c4db', R = !0);
                    } else
                        p['state'].text = game['Tools']['strOfLocalization'](2072), p['state']['color'] = '#8c8c8c', p.name['getChildByName']('name')['color'] = '#8c8c8c';
                    L['invited'] ? (p.btn['visible'] = !1, p['invited']['visible'] = !0) : (p.btn['visible'] = !0, p['invited']['visible'] = !1, game['Tools']['setGrayDisable'](p.btn, !R), R && (p.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                                game['Tools']['setGrayDisable'](p.btn, !0);
                                var C = {
                                    room_id: I.Inst['room_id'],
                                    mode: I.Inst['room_mode'],
                                    nickname: GameMgr.Inst['account_data']['nickname'],
                                    verified: GameMgr.Inst['account_data']['verified'],
                                    account_id: GameMgr.Inst['account_id']
                                };
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                    target_id: L.f.base['account_id'],
                                    type: game['EFriendMsgType']['room_invite'],
                                    content: JSON['stringify'](C)
                                }, function (C, z) {
                                    C || z['error'] ? (game['Tools']['setGrayDisable'](p.btn, !1), B['UIMgr'].Inst['showNetReqError']('sendClientMessage', C, z)) : (p.btn['visible'] = !1, p['invited']['visible'] = !0, L['invited'] = !0);
                                });
                            }, null, !1)));
                },
                C;
            }
            (),
            z = function () {
                function C(C) {
                    var z = this;
                    this.tabs = [],
                    this['tab_index'] = 0,
                    this.me = C,
                    this['blackmask'] = this.me['getChildByName']('blackmask'),
                    this.root = this.me['getChildByName']('root'),
                    this['page_head'] = new B['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                    this['page_zhangban'] = new B['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return z['locking'];
                            }));
                    for (var e = this.root['getChildByName']('container_tabs'), I = function (C) {
                        p.tabs.push(e['getChildAt'](C)),
                        p.tabs[C]['clickHandler'] = new Laya['Handler'](p, function () {
                            z['locking'] || z['tab_index'] != C && (1 == z['tab_index'] && z['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                        z['change_tab'](C);
                                    }), null) : z['change_tab'](C));
                        });
                    }, p = this, L = 0; L < e['numChildren']; L++)
                        I(L);
                    this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                        z['locking'] || (1 == z['tab_index'] && z['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                    z['close'](!1);
                                }), null) : z['close'](!1));
                    }),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                        z['locking'] || (1 == z['tab_index'] && z['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                    z['close'](!1);
                                }), null) : z['close'](!1));
                    });
                }
                return C['prototype'].show = function () {
                    var C = this;
                    this.me['visible'] = !0,
                    this['blackmask']['alpha'] = 0,
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackmask'], {
                        alpha: 0.3
                    }, 150),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1;
                        })),
                    this['tab_index'] = 0,
                    this['page_zhangban']['close'](!0),
                    this['page_head'].show(!0);
                    for (var z = 0; z < this.tabs['length']; z++) {
                        var e = this.tabs[z];
                        e.skin = game['Tools']['localUISrc'](z == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var I = e['getChildByName']('word');
                        I['color'] = z == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        I['scaleX'] = I['scaleY'] = z == this['tab_index'] ? 1.1 : 1,
                        z == this['tab_index'] && e['parent']['setChildIndex'](e, this.tabs['length'] - 1);
                    }
                },
                C['prototype']['change_tab'] = function (B) {
                    var C = this;
                    this['tab_index'] = B;
                    for (var z = 0; z < this.tabs['length']; z++) {
                        var e = this.tabs[z];
                        e.skin = game['Tools']['localUISrc'](z == B ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var I = e['getChildByName']('word');
                        I['color'] = z == B ? '#552c1c' : '#d3a86c',
                        I['scaleX'] = I['scaleY'] = z == B ? 1.1 : 1,
                        z == B && e['parent']['setChildIndex'](e, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                            C['page_head'].show(!1);
                        })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                            C['page_zhangban'].show(!1);
                        })),
                    Laya['timer'].once(400, this, function () {
                        C['locking'] = !1;
                    });
                },
                C['prototype']['close'] = function (C) {
                    var z = this;
                                    //修改友人房间立绘
                                    if (!(z.page_head.choosed_chara_index == 0 && z.page_head.choosed_skin_id == 0)) {
                                        for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                            if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                                uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = z.page_head.choosed_skin_id;
                                                GameMgr.Inst.account_data.avatar_id = z.page_head.choosed_skin_id;
                                                uiscript.UI_Sushe.main_character_id = z.page_head.choosed_chara_index + 200001;
                                                uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                                MMP.settings.characters[z.page_head.choosed_chara_index] = z.page_head.choosed_skin_id;
                                                MMP.saveSettings();
                                                break;
                                            }
                                        }
                                    }
                                    //end
                    this.me['visible'] && (C ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: I.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    z['locking'] = !1,
                                    z.me['visible'] = !1;
                                }))));
                },
                C;
            }
            (),
            e = function () {
                function B(B) {
                    this['modes'] = [],
                    this.me = B,
                    this.bg = this.me['getChildByName']('bg'),
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                }
                return B['prototype'].show = function (B) {
                    this.me['visible'] = !0,
                    this['scrollview']['reset'](),
                    this['modes'] = B,
                    this['scrollview']['addItem'](B['length']);
                    var C = this['scrollview']['total_height'];
                    C > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - C, this.bg['height'] = C + 20),
                    this.bg['visible'] = !0;
                },
                B['prototype']['render_item'] = function (B) {
                    var C = B['index'],
                    z = B['container'],
                    e = z['getChildByName']('info');
                    e['fontSize'] = 40,
                    e['fontSize'] = this['modes'][C]['length'] <= 5 ? 40 : this['modes'][C]['length'] <= 9 ? 55 - 3 * this['modes'][C]['length'] : 28,
                    e.text = this['modes'][C];
                },
                B;
            }
            (),
            I = function (I) {
                function p() {
                    var C = I.call(this, new ui['lobby']['waitingroomUI']()) || this;
                    return C['skin_ready'] = 'myres/room/btn_ready.png',
                    C['skin_cancel'] = 'myres/room/btn_cancel.png',
                    C['skin_start'] = 'myres/room/btn_start.png',
                    C['skin_start_no'] = 'myres/room/btn_start_no.png',
                    C['update_seq'] = 0,
                    C['pre_msgs'] = [],
                    C['msg_tail'] = -1,
                    C['posted'] = !1,
                    C['label_rommid'] = null,
                    C['player_cells'] = [],
                    C['btn_ok'] = null,
                    C['btn_invite_friend'] = null,
                    C['btn_add_robot'] = null,
                    C['btn_dress'] = null,
                    C['btn_copy'] = null,
                    C['beReady'] = !1,
                    C['room_id'] = -1,
                    C['owner_id'] = -1,
                    C['tournament_id'] = 0,
                    C['max_player_count'] = 0,
                    C['players'] = [],
                    C['container_rules'] = null,
                    C['container_top'] = null,
                    C['container_right'] = null,
                    C['locking'] = !1,
                    C['mousein_copy'] = !1,
                    C['popout'] = null,
                    C['room_link'] = null,
                    C['btn_copy_link'] = null,
                    C['last_start_room'] = 0,
                    C['invitefriend'] = null,
                    C['pre_choose'] = null,
                    C['ai_name'] = game['Tools']['strOfLocalization'](2003),
                    p.Inst = C,
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](C, function (B) {
                            app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](B)),
                            C['onReadyChange'](B['account_id'], B['ready'], B['dressing']);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](C, function (B) {
                            app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](B)),
                            C['onPlayerChange'](B);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](C, function (B) {
                            C['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](B)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), C['onGameStart'](B));
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](C, function (B) {
                            app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](B)),
                            C['onBeKictOut']();
                        })),
                    game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](C, function () {
                            C['enable'] && C.hide(Laya['Handler']['create'](C, function () {
                                    B['UI_Lobby'].Inst['enable'] = !0;
                                }));
                        }, null, !1)),
                    C;
                }
                return __extends(p, I),
                p['prototype']['push_msg'] = function (B) {
                    this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](B)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](B));
                },
                Object['defineProperty'](p['prototype'], 'inRoom', {
                    get: function () {
                        return -1 != this['room_id'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                Object['defineProperty'](p['prototype'], 'robot_count', {
                    get: function () {
                        for (var B = 0, C = 0; C < this['players']['length']; C++)
                            2 == this['players'][C]['category'] && B++;
                        return B;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                p['prototype']['resetData'] = function () {
                    this['room_id'] = -1,
                    this['owner_id'] = -1,
                    this['room_mode'] = {},
                    this['max_player_count'] = 0,
                    this['players'] = [];
                },
                p['prototype']['updateData'] = function (B) {
                    if (!B)
                        return this['resetData'](), void 0;
                                    //修改友人房间立绘
                                    for (let i = 0; i < B.persons.length; i++) {
        
                                        if (B.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            B.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            B.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            B.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                            B.persons[i].title = GameMgr.Inst.account_data.title;
                                            B.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                            if (MMP.settings.nickname != '') {
                                                B.persons[i].nickname = MMP.settings.nickname;
                                            }
                                            break;
                                        }
                                    }
                                    //end
                    this['room_id'] = B['room_id'],
                    this['owner_id'] = B['owner_id'],
                    this['room_mode'] = B.mode,
                    this['public_live'] = B['public_live'],
                    this['tournament_id'] = 0,
                    B['tournament_id'] && (this['tournament_id'] = B['tournament_id']),
                    this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                    this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                    this['max_player_count'] = B['max_player_count'],
                    this['players'] = [];
                    for (var C = 0; C < B['persons']['length']; C++) {
                        var z = B['persons'][C];
                        z['ready'] = !1,
                        z['cell_index'] = -1,
                        z['category'] = 1,
                        this['players'].push(z);
                    }
                    for (var C = 0; C < B['robot_count']; C++)
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
                    for (var C = 0; C < B['ready_list']['length']; C++)
                        for (var e = 0; e < this['players']['length']; e++)
                            if (this['players'][e]['account_id'] == B['ready_list'][C]) {
                                this['players'][e]['ready'] = !0;
                                break;
                            }
                    this['update_seq'] = 0,
                    B.seq && (this['update_seq'] = B.seq);
                },
                p['prototype']['onReadyChange'] = function (B, C, z) {
                    for (var e = 0; e < this['players']['length']; e++)
                        if (this['players'][e]['account_id'] == B) {
                            this['players'][e]['ready'] = C,
                            this['players'][e]['dressing'] = z,
                            this['_onPlayerReadyChange'](this['players'][e]);
                            break;
                        }
                    this['refreshStart']();
                },
                p['prototype']['onPlayerChange'] = function (B) {
                    if (app.Log.log(B), B = B['toJSON'](), !(B.seq && B.seq <= this['update_seq'])) {
                                        // 修改友人房间立绘
                                        for (var i = 0; i < B.player_list.length; i++) {
        
                                            if (B.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                                B.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                B.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                                B.player_list[i].title = GameMgr.Inst.account_data.title;
                                                if (MMP.settings.nickname != '') {
                                                    B.player_list[i].nickname = MMP.settings.nickname;
                                                }
                                                break;
                                            }
                                        }
                                        if (B.update_list != undefined) {
                                            for (var i = 0; i < B.update_list.length; i++) {
        
                                                if (B.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                                    B.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                    B.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                                    B.update_list[i].title = GameMgr.Inst.account_data.title;
                                                    if (MMP.settings.nickname != '') {
                                                        B.update_list[i].nickname = MMP.settings.nickname;
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
                        this['update_seq'] = B.seq;
                        var C = {};
                        C.type = 'onPlayerChange0',
                        C['players'] = this['players'],
                        C.msg = B,
                        this['push_msg'](JSON['stringify'](C));
                        var z = this['robot_count'],
                        e = B['robot_count'];
                        if (e < this['robot_count']) {
                            this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, z--);
                            for (var I = 0; I < this['players']['length']; I++)
                                2 == this['players'][I]['category'] && z > e && (this['players'][I]['category'] = 0, z--);
                        }
                        for (var p = [], L = B['player_list'], I = 0; I < this['players']['length']; I++)
                            if (1 == this['players'][I]['category']) {
                                for (var R = -1, E = 0; E < L['length']; E++)
                                    if (L[E]['account_id'] == this['players'][I]['account_id']) {
                                        R = E;
                                        break;
                                    }
                                if (-1 != R) {
                                    var V = L[R];
                                    p.push(this['players'][I]),
                                    this['players'][I]['avatar_id'] = V['avatar_id'],
                                    this['players'][I]['title'] = V['title'],
                                    this['players'][I]['verified'] = V['verified'];
                                }
                            } else
                                2 == this['players'][I]['category'] && p.push(this['players'][I]);
                        this['players'] = p;
                        for (var I = 0; I < L['length']; I++) {
                            for (var d = !1, V = L[I], E = 0; E < this['players']['length']; E++)
                                if (1 == this['players'][E]['category'] && this['players'][E]['account_id'] == V['account_id']) {
                                    d = !0;
                                    break;
                                }
                            d || this['players'].push({
                                account_id: V['account_id'],
                                avatar_id: V['avatar_id'],
                                nickname: V['nickname'],
                                verified: V['verified'],
                                title: V['title'],
                                level: V['level'],
                                level3: V['level3'],
                                ready: !1,
                                dressing: !1,
                                cell_index: -1,
                                category: 1
                            });
                        }
                        for (var f = [!1, !1, !1, !1], I = 0; I < this['players']['length']; I++)
                             - 1 != this['players'][I]['cell_index'] && (f[this['players'][I]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][I]));
                        for (var I = 0; I < this['players']['length']; I++)
                            if (1 == this['players'][I]['category'] && -1 == this['players'][I]['cell_index'])
                                for (var E = 0; E < this['max_player_count']; E++)
                                    if (!f[E]) {
                                        this['players'][I]['cell_index'] = E,
                                        f[E] = !0,
                                        this['_refreshPlayerInfo'](this['players'][I]);
                                        break;
                                    }
                        for (var z = this['robot_count'], e = B['robot_count']; e > z; ) {
                            for (var A = -1, E = 0; E < this['max_player_count']; E++)
                                if (!f[E]) {
                                    A = E;
                                    break;
                                }
                            if (-1 == A)
                                break;
                            f[A] = !0,
                            this['players'].push({
                                category: 2,
                                cell_index: A,
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
                            z++;
                        }
                        for (var I = 0; I < this['max_player_count']; I++)
                            f[I] || this['_clearCell'](I);
                        var C = {};
                        if (C.type = 'onPlayerChange1', C['players'] = this['players'], this['push_msg'](JSON['stringify'](C)), B['owner_id']) {
                            if (this['owner_id'] = B['owner_id'], this['enable'])
                                if (this['owner_id'] == GameMgr.Inst['account_id'])
                                    this['refreshAsOwner']();
                                else
                                    for (var E = 0; E < this['players']['length']; E++)
                                        if (this['players'][E] && this['players'][E]['account_id'] == this['owner_id']) {
                                            this['_refreshPlayerInfo'](this['players'][E]);
                                            break;
                                        }
                        } else if (this['enable'])
                            if (this['owner_id'] == GameMgr.Inst['account_id'])
                                this['refreshAsOwner']();
                            else
                                for (var E = 0; E < this['players']['length']; E++)
                                    if (this['players'][E] && this['players'][E]['account_id'] == this['owner_id']) {
                                        this['_refreshPlayerInfo'](this['players'][E]);
                                        break;
                                    }
                    }
                },
                p['prototype']['onBeKictOut'] = function () {
                    this['resetData'](),
                    this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), B['UI_Lobby'].Inst['enable'] = !0, B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                },
                p['prototype']['onCreate'] = function () {
                    var I = this;
                    this['last_start_room'] = 0;
                    var p = this.me['getChildByName']('root');
                    this['container_top'] = p['getChildByName']('top'),
                    this['container_right'] = p['getChildByName']('right'),
                    this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                    for (var L = function (C) {
                        var z = p['getChildByName']('player_' + C['toString']()),
                        e = {};
                        e['index'] = C,
                        e['container'] = z,
                        e['container_flag'] = z['getChildByName']('flag'),
                        e['container_flag']['visible'] = !1,
                        e['container_name'] = z['getChildByName']('container_name'),
                        e.name = z['getChildByName']('container_name')['getChildByName']('name'),
                        e['btn_t'] = z['getChildByName']('btn_t'),
                        e['container_illust'] = z['getChildByName']('container_illust'),
                        e['illust'] = new B['UI_Character_Skin'](z['getChildByName']('container_illust')['getChildByName']('illust')),
                        e.host = z['getChildByName']('host'),
                        e['title'] = new B['UI_PlayerTitle'](z['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                        e.rank = new B['UI_Level'](z['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                        e['is_robot'] = !1;
                        var L = 0;
                        e['btn_t']['clickHandler'] = Laya['Handler']['create'](R, function () {
                            if (!(I['locking'] || Laya['timer']['currTimer'] < L)) {
                                L = Laya['timer']['currTimer'] + 500;
                                for (var B = 0; B < I['players']['length']; B++)
                                    if (I['players'][B]['cell_index'] == C) {
                                        I['kickPlayer'](B);
                                        break;
                                    }
                            }
                        }, null, !1),
                        e['btn_info'] = z['getChildByName']('btn_info'),
                        e['btn_info']['clickHandler'] = Laya['Handler']['create'](R, function () {
                            if (!I['locking'])
                                for (var z = 0; z < I['players']['length']; z++)
                                    if (I['players'][z]['cell_index'] == C) {
                                        I['players'][z]['account_id'] && I['players'][z]['account_id'] > 0 && B['UI_OtherPlayerInfo'].Inst.show(I['players'][z]['account_id'], I['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                        break;
                                    }
                        }, null, !1),
                        R['player_cells'].push(e);
                    }, R = this, E = 0; 4 > E; E++)
                        L(E);
                    this['btn_ok'] = p['getChildByName']('btn_ok');
                    var V = 0;
                    this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        Laya['timer']['currTimer'] < V + 500 || (V = Laya['timer']['currTimer'], I['owner_id'] == GameMgr.Inst['account_id'] ? I['getStart']() : I['switchReady']());
                    }, null, !1);
                    var d = 0;
                    this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        Laya['timer']['currTimer'] < d + 500 || (d = Laya['timer']['currTimer'], I['leaveRoom']());
                    }, null, !1),
                    this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                    this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        I['locking'] || I['invitefriend'].show();
                    }, null, !1),
                    this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                    var f = 0;
                    this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        I['locking'] || Laya['timer']['currTimer'] < f || (f = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                robot_count: I['robot_count'] + 1
                            }, function (C, z) {
                                (C || z['error'] && 1111 != z['error'].code) && B['UIMgr'].Inst['showNetReqError']('modifyRoom_add', C, z),
                                f = 0;
                            }));
                    }, null, !1),
                    this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (!I['locking']) {
                            var C = 0;
                            I['room_mode']['detail_rule'] && I['room_mode']['detail_rule']['chuanma'] && (C = 1),
                            B['UI_Rules'].Inst.show(0, null, C);
                        }
                    }, null, !1),
                    this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                    this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                        I['locking'] || I['beReady'] && I['owner_id'] != GameMgr.Inst['account_id'] || (I['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: I['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !0
                            }, function () {}));
                    }),
                    this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                    this['btn_copy'].on('mouseover', this, function () {
                        I['mousein_copy'] = !0;
                    }),
                    this['btn_copy'].on('mouseout', this, function () {
                        I['mousein_copy'] = !1;
                    }),
                    this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        I['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), I['popout']['visible'] = !0, B['UIBase']['anim_pop_out'](I['popout'], null));
                    }, null, !1),
                    this['container_rules'] = new e(this['container_right']['getChildByName']('container_rules')),
                    this['popout'] = this.me['getChildByName']('pop'),
                    this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                    this['room_link']['editable'] = !1,
                    this['room_link'].on('focus', this, function () {
                        I['room_link']['focus'] && I['room_link']['setSelection'](0, I['room_link'].text['length']);
                    }),
                    this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                    this['btn_copy_link']['visible'] = !1,
                    GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            var C = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                            C.call('setSysClipboardText', I['room_link'].text),
                            B['UIBase']['anim_pop_hide'](I['popout'], Laya['Handler']['create'](I, function () {
                                    I['popout']['visible'] = !1;
                                })),
                            B['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                        }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', I['room_link'].text, function () {}),
                            B['UIBase']['anim_pop_hide'](I['popout'], Laya['Handler']['create'](I, function () {
                                    I['popout']['visible'] = !1;
                                })),
                            B['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                        }, null, !1)),
                    this['popout']['visible'] = !1;
                    var A = Laya['Handler']['create'](this, function () {
                        B['UIBase']['anim_pop_hide'](I['popout'], Laya['Handler']['create'](I, function () {
                                I['popout']['visible'] = !1;
                            }));
                    }, null, !1);
                    this['popout']['getChildByName']('blackbg')['clickHandler'] = A,
                    this['popout']['getChildByName']('btn_cancel')['clickHandler'] = A,
                    this['invitefriend'] = new C(this.me['getChildByName']('invite_friend')),
                    this['pop_change_view'] = new z(this.me['getChildByName']('pop_view'));
                },
                p['prototype'].show = function () {
                    var C = this;
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['mousein_copy'] = !1,
                    this['beReady'] = !1,
                    this['invitefriend'].me['visible'] = !1,
                    this['btn_add_robot']['visible'] = !1,
                    this['btn_invite_friend']['visible'] = !1,
                    game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                    this['pre_choose'] = null,
                    this['pop_change_view']['close'](!0);
                    for (var z = 0; 4 > z; z++)
                        this['player_cells'][z]['container']['visible'] = z < this['max_player_count'];
                    for (var z = 0; z < this['max_player_count']; z++)
                        this['_clearCell'](z);
                    for (var z = 0; z < this['players']['length']; z++)
                        this['players'][z]['cell_index'] = z, this['_refreshPlayerInfo'](this['players'][z]);
                    this['msg_tail'] = -1,
                    this['pre_msgs'] = [],
                    this['posted'] = !1;
                    var e = {};
                    e.type = 'show',
                    e['players'] = this['players'],
                    this['push_msg'](JSON['stringify'](e)),
                    this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                    this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                    var I = [];
                    I.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                    var p = this['room_mode']['detail_rule'];
                    if (p) {
                        var L = 5,
                        R = 20;
                        if (null != p['time_fixed'] && (L = p['time_fixed']), null != p['time_add'] && (R = p['time_add']), I.push(L['toString']() + '+' + R['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                            var E = cfg['tournament']['tournaments'].get(this['tournament_id']);
                            E && I.push(E.name);
                        }
                        if (null != p['init_point'] && I.push(game['Tools']['strOfLocalization'](2199) + p['init_point']), null != p['fandian'] && I.push(game['Tools']['strOfLocalization'](2094) + ':' + p['fandian']), p['guyi_mode'] && I.push(game['Tools']['strOfLocalization'](3028)), null != p['dora_count'])
                            switch (p['chuanma'] && (p['dora_count'] = 0), p['dora_count']) {
                            case 0:
                                I.push(game['Tools']['strOfLocalization'](2044));
                                break;
                            case 2:
                                I.push(game['Tools']['strOfLocalization'](2047));
                                break;
                            case 3:
                                I.push(game['Tools']['strOfLocalization'](2045));
                                break;
                            case 4:
                                I.push(game['Tools']['strOfLocalization'](2046));
                            }
                        null != p['shiduan'] && 1 != p['shiduan'] && I.push(game['Tools']['strOfLocalization'](2137)),
                        2 === p['fanfu'] && I.push(game['Tools']['strOfLocalization'](2763)),
                        4 === p['fanfu'] && I.push(game['Tools']['strOfLocalization'](2764)),
                        null != p['bianjietishi'] && 1 != p['bianjietishi'] && I.push(game['Tools']['strOfLocalization'](2200)),
                        this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != p['have_zimosun'] && 1 != p['have_zimosun'] ? I.push(game['Tools']['strOfLocalization'](2202)) : I.push(game['Tools']['strOfLocalization'](2203))),
                        game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                    }
                    this['container_rules'].show(I),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200);
                    for (var z = 0; z < this['player_cells']['length']; z++)
                        B['UIBase']['anim_alpha_in'](this['player_cells'][z]['container'], {
                            x: 80
                        }, 150, 150 + 50 * z, null, Laya.Ease['backOut']);
                    B['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                    B['UIBase']['anim_alpha_in'](this['container_right'], {
                        x: 20
                    }, 100, 500),
                    Laya['timer'].once(600, this, function () {
                        C['locking'] = !1;
                    });
                    var V = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                    this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                    '' != V && (this['room_link'].text += '(' + V + ')');
                    var d = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['room_link'].text += ': ' + d + '?room=' + this['room_id'];
                },
                p['prototype']['leaveRoom'] = function () {
                    var C = this;
                    this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (z, e) {
                        z || e['error'] ? B['UIMgr'].Inst['showNetReqError']('leaveRoom', z, e) : (C['room_id'] = -1, C.hide(Laya['Handler']['create'](C, function () {
                                    B['UI_Lobby'].Inst['enable'] = !0;
                                })));
                    });
                },
                p['prototype']['tryToClose'] = function (C) {
                    var z = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (e, I) {
                        e || I['error'] ? (B['UIMgr'].Inst['showNetReqError']('leaveRoom', e, I), C['runWith'](!1)) : (z['enable'] = !1, z['pop_change_view']['close'](!0), C['runWith'](!0));
                    });
                },
                p['prototype'].hide = function (C) {
                    var z = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150);
                    for (var e = 0; e < this['player_cells']['length']; e++)
                        B['UIBase']['anim_alpha_out'](this['player_cells'][e]['container'], {
                            x: 80
                        }, 150, 0, null);
                    B['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                    B['UIBase']['anim_alpha_out'](this['container_right'], {
                        x: 20
                    }, 150),
                    Laya['timer'].once(200, this, function () {
                        z['locking'] = !1,
                        z['enable'] = !1,
                        C && C.run();
                    }),
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                p['prototype']['onDisbale'] = function () {
                    Laya['timer']['clearAll'](this);
                    for (var B = 0; B < this['player_cells']['length']; B++)
                        Laya['loader']['clearTextureRes'](this['player_cells'][B]['illust'].skin);
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                p['prototype']['switchReady'] = function () {
                    this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                            ready: this['beReady'],
                            dressing: !1
                        }, function () {}));
                },
                p['prototype']['getStart'] = function () {
                    this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (C, z) {
                                (C || z['error']) && B['UIMgr'].Inst['showNetReqError']('startRoom', C, z);
                            })));
                },
                p['prototype']['kickPlayer'] = function (C) {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        var z = this['players'][C];
                        1 == z['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                            account_id: this['players'][C]['account_id']
                        }, function () {}) : 2 == z['category'] && (this['pre_choose'] = z, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                robot_count: this['robot_count'] - 1
                            }, function (C, z) {
                                (C || z['error']) && B['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', C, z);
                            }));
                    }
                },
                p['prototype']['_clearCell'] = function (B) {
                    if (!(0 > B || B >= this['player_cells']['length'])) {
                        var C = this['player_cells'][B];
                        C['container_flag']['visible'] = !1,
                        C['container_illust']['visible'] = !1,
                        C.name['visible'] = !1,
                        C['container_name']['visible'] = !1,
                        C['btn_t']['visible'] = !1,
                        C.host['visible'] = !1,
                        C['illust']['clear']();
                    }
                },
                p['prototype']['_refreshPlayerInfo'] = function (B) {
                    var C = B['cell_index'];
                    if (!(0 > C || C >= this['player_cells']['length'])) {
                        var z = this['player_cells'][C];
                        z['container_illust']['visible'] = !0,
                        z['container_name']['visible'] = !0,
                        z.name['visible'] = !0,
                        game['Tools']['SetNickname'](z.name, B, GameMgr.Inst['hide_nickname']),
                        z['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && B['account_id'] != GameMgr.Inst['account_id'],
                        this['owner_id'] == B['account_id'] && (z['container_flag']['visible'] = !0, z.host['visible'] = !0),
                        B['account_id'] == GameMgr.Inst['account_id'] ? z['illust']['setSkin'](B['avatar_id'], 'waitingroom') : z['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](B['avatar_id']), 'waitingroom'),
                        z['title'].id = game['Tools']['titleLocalization'](B['account_id'], B['title']),
                        z.rank.id = B[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                        this['_onPlayerReadyChange'](B);
                    }
                },
                p['prototype']['_onPlayerReadyChange'] = function (B) {
                    var C = B['cell_index'];
                    if (!(0 > C || C >= this['player_cells']['length'])) {
                        var z = this['player_cells'][C];
                        z['container_flag']['visible'] = this['owner_id'] == B['account_id'] ? !0 : B['ready'];
                    }
                },
                p['prototype']['refreshAsOwner'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        for (var B = 0, C = 0; C < this['players']['length']; C++)
                            0 != this['players'][C]['category'] && (this['_refreshPlayerInfo'](this['players'][C]), B++);
                        this['btn_add_robot']['visible'] = !0,
                        this['btn_invite_friend']['visible'] = !0,
                        game['Tools']['setGrayDisable'](this['btn_invite_friend'], B == this['max_player_count']),
                        game['Tools']['setGrayDisable'](this['btn_add_robot'], B == this['max_player_count']),
                        this['refreshStart']();
                    }
                },
                p['prototype']['refreshStart'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                        game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                        for (var B = 0, C = 0; C < this['players']['length']; C++) {
                            var z = this['players'][C];
                            if (!z || 0 == z['category'])
                                break;
                            (z['account_id'] == this['owner_id'] || z['ready']) && B++;
                        }
                        if (game['Tools']['setGrayDisable'](this['btn_ok'], B != this['max_player_count']), this['enable']) {
                            for (var e = 0, C = 0; C < this['max_player_count']; C++) {
                                var I = this['player_cells'][C];
                                I && I['container_flag']['visible'] && e++;
                            }
                            if (B != e && !this['posted']) {
                                this['posted'] = !0;
                                var p = {};
                                p['okcount'] = B,
                                p['okcount2'] = e,
                                p.msgs = [];
                                var L = 0,
                                R = this['pre_msgs']['length'] - 1;
                                if (-1 != this['msg_tail'] && (L = (this['msg_tail'] + 1) % this['pre_msgs']['length'], R = this['msg_tail']), L >= 0 && R >= 0) {
                                    for (var C = L; C != R; C = (C + 1) % this['pre_msgs']['length'])
                                        p.msgs.push(this['pre_msgs'][C]);
                                    p.msgs.push(this['pre_msgs'][R]);
                                }
                                GameMgr.Inst['postInfo2Server']('waitroom_err2', p, !1);
                            }
                        }
                    }
                },
                p['prototype']['onGameStart'] = function (B) {
                    game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                    this['enable'] = !1,
                    game['MJNetMgr'].Inst['OpenConnect'](B['connect_token'], B['game_uuid'], B['location'], !1, null);
                },
                p['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                },
                p['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                },
                p.Inst = null,
                p;
            }
            (B['UIBase']);
            B['UI_WaitingRoom'] = I;
        }
        (uiscript || (uiscript = {}));
        













        // 保存装扮
        !function (B) {
            var C;
            !function (C) {
                var z = function () {
                    function z(z, e, I) {
                        var p = this;
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
                        this['_locking'] = I,
                        this['container_zhuangban0'] = z,
                        this['container_zhuangban1'] = e;
                        var L = this['container_zhuangban0']['getChildByName']('tabs');
                        L['vScrollBarSkin'] = '';
                        for (var R = function (C) {
                            var z = L['getChildAt'](C);
                            E.tabs.push(z),
                            z['clickHandler'] = new Laya['Handler'](E, function () {
                                p['locking'] || p['tab_index'] != C && (p['_changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](p, function () {
                                            p['change_tab'](C);
                                        }), null) : p['change_tab'](C));
                            });
                        }, E = this, V = 0; V < L['numChildren']; V++)
                            R(V);
                        this['page_items'] = new C['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                        this['page_headframe'] = new C['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                        this['page_bgm'] = new C['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                        this['page_desktop'] = new C['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                        this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                        this['scrollview']['setElastic'](),
                        this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                        this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                        this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                            for (var C = [], z = 0; z < p['cell_titles']['length']; z++) {
                                var e = p['slot_ids'][z];
                                if (p['slot_map'][e]) {
                                    var I = p['slot_map'][e];
                                    if (!(I['item_id'] && I['item_id'] != p['cell_default_item'][z] || I['item_id_list'] && 0 != I['item_id_list']['length']))
                                        continue;
                                    var L = [];
                                    if (I['item_id_list'])
                                        for (var R = 0, E = I['item_id_list']; R < E['length']; R++) {
                                            var V = E[R];
                                            V == p['cell_default_item'][z] ? L.push(0) : L.push(V);
                                        }
                                    C.push({
                                        slot: e,
                                        item_id: I['item_id'],
                                        type: I.type,
                                        item_id_list: L
                                    });
                                }
                            }
                            p['btn_save']['mouseEnabled'] = !1;
                            var d = p['tab_index'];
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                            //    views: C,
                            //    save_index: d,
                            //    is_use: d == B['UI_Sushe']['using_commonview_index'] ? 1 : 0
                            //}, function (z, e) {
                            //    if (p['btn_save']['mouseEnabled'] = !0, z || e['error'])
                            //        B['UIMgr'].Inst['showNetReqError']('saveCommonViews', z, e);
                            //    else {
                                    if (B['UI_Sushe']['commonViewList']['length'] < d)
                                        for (var I = B['UI_Sushe']['commonViewList']['length']; d >= I; I++)
                                            B['UI_Sushe']['commonViewList'].push([]);
                                        MMP.settings.commonViewList = B.UI_Sushe.commonViewList;
                                        MMP.settings.using_commonview_index =B.UI_Sushe.using_commonview_index;
                                        MMP.saveSettings();
                                        //END
                                    if (B['UI_Sushe']['commonViewList'][d] = C, B['UI_Sushe']['using_commonview_index'] == d && p['onChangeGameView'](), p['tab_index'] != d)
                                        return;
                                    p['btn_save']['mouseEnabled'] = !0,
                                    p['_changed'] = !1,
                                    p['refresh_btn']();
                            //    }
                            //});
                        }),
                        this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                        this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                            p['btn_use']['mouseEnabled'] = !1;
                            var C = p['tab_index'];
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                            //    index: C
                            //}, function (z, e) {
                            //    p['btn_use']['mouseEnabled'] = !0,
                            //    z || e['error'] ? B['UIMgr'].Inst['showNetReqError']('useCommonView', z, e) : (
                                B['UI_Sushe']['using_commonview_index'] = C, p['refresh_btn'](), p['refresh_tab'](), p['onChangeGameView']();//);
                            //});
                        }),
                        this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                        this['random_slider'] = this['random']['getChildByName']('slider'),
                        this['btn_random'] = this['random']['getChildByName']('btn'),
                        this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                            p['onRandomBtnClick']();
                        });
                    }
                    return Object['defineProperty'](z['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object['defineProperty'](z['prototype'], 'changed', {
                        get: function () {
                            return this['_changed'];
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    z['prototype'].show = function (C) {
                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                        this['container_zhuangban0']['visible'] = !0,
                        this['container_zhuangban1']['visible'] = !0,
                        C ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (B['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), B['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                x: 0
                            }, 200)),
                        this['change_tab'](B['UI_Sushe']['using_commonview_index']);
                    },
                    z['prototype']['change_tab'] = function (C) {
                        if (this['tab_index'] = C, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                            if (this['tab_index'] < B['UI_Sushe']['commonViewList']['length'])
                                for (var z = B['UI_Sushe']['commonViewList'][this['tab_index']], e = 0; e < z['length']; e++)
                                    this['slot_map'][z[e].slot] = {
                                        slot: z[e].slot,
                                        item_id: z[e]['item_id'],
                                        type: z[e].type,
                                        item_id_list: z[e]['item_id_list']
                                    };
                            this['scrollview']['addItem'](this['cell_titles']['length']),
                            this['onChangeSlotSelect'](0),
                            this['refresh_btn']();
                        }
                    },
                    z['prototype']['refresh_tab'] = function () {
                        for (var C = 0; C < this.tabs['length']; C++) {
                            var z = this.tabs[C];
                            z['mouseEnabled'] = this['tab_index'] != C,
                            z['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == C ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                            z['getChildByName']('num')['color'] = this['tab_index'] == C ? '#2f1e19' : '#f2c797';
                            var e = z['getChildByName']('choosed');
                            B['UI_Sushe']['using_commonview_index'] == C ? (e['visible'] = !0, e.x = this['tab_index'] == C ? -18 : -4) : e['visible'] = !1;
                        }
                    },
                    z['prototype']['refresh_btn'] = function () {
                        this['btn_save']['visible'] = !1,
                        this['btn_save']['mouseEnabled'] = !0,
                        this['btn_use']['visible'] = !1,
                        this['btn_use']['mouseEnabled'] = !0,
                        this['btn_using']['visible'] = !1,
                        this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = B['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = B['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                    },
                    z['prototype']['onChangeSlotSelect'] = function (B) {
                        var C = this;
                        this['select_index'] = B,
                        this['random']['visible'] = !(6 == B || 10 == B);
                        var z = 0;
                        B >= 0 && B < this['cell_default_item']['length'] && (z = this['cell_default_item'][B]);
                        var e = z,
                        I = this['slot_ids'][B],
                        p = !1,
                        L = [];
                        if (this['slot_map'][I]) {
                            var R = this['slot_map'][I];
                            L = R['item_id_list'],
                            p = !!R.type,
                            R['item_id'] && (e = this['slot_map'][I]['item_id']),
                            p && R['item_id_list'] && R['item_id_list']['length'] > 0 && (e = R['item_id_list'][0]);
                        }
                        var E = Laya['Handler']['create'](this, function (e) {
                            e == z && (e = 0);
                            var p = !1;
                            if (C['is_random']) {
                                var L = C['slot_map'][I]['item_id_list']['indexOf'](e);
                                L >= 0 ? (C['slot_map'][I]['item_id_list']['splice'](L, 1), p = !0) : (C['slot_map'][I]['item_id_list'] && 0 != C['slot_map'][I]['item_id_list']['length'] || (C['slot_map'][I]['item_id_list'] = []), C['slot_map'][I]['item_id_list'].push(e));
                            } else
                                C['slot_map'][I] || (C['slot_map'][I] = {}), C['slot_map'][I]['item_id'] = e;
                            return C['scrollview']['wantToRefreshItem'](B),
                            C['_changed'] = !0,
                            C['refresh_btn'](),
                            p;
                        }, null, !1);
                        this['page_items']['close'](),
                        this['page_desktop']['close'](),
                        this['page_headframe']['close'](),
                        this['page_bgm']['close'](),
                        this['is_random'] = p,
                        this['random_slider'].x = p ? 76 : -4,
                        this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                        this['random']['getChildAt'](2)['visible'] = this['is_random'];
                        var V = game['Tools']['strOfLocalization'](this['cell_titles'][B]);
                        if (B >= 0 && 2 >= B)
                            this['page_items'].show(V, B, e, E), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (3 == B)
                            this['page_items'].show(V, 10, e, E), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (4 == B)
                            this['page_items'].show(V, 3, e, E), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (5 == B)
                            this['page_bgm'].show(V, e, E), this['setRandomGray'](!this['page_bgm']['can_random']());
                        else if (6 == B)
                            this['page_headframe'].show(V, e, E);
                        else if (7 == B || 8 == B) {
                            var d = this['cell_default_item'][7],
                            f = this['cell_default_item'][8];
                            if (7 == B) {
                                if (d = e, this['slot_map'][game['EView'].mjp]) {
                                    var A = this['slot_map'][game['EView'].mjp];
                                    A.type && A['item_id_list'] && A['item_id_list']['length'] > 0 ? f = A['item_id_list'][0] : A['item_id'] && (f = A['item_id']);
                                }
                                this['page_desktop']['show_desktop'](V, d, f, E);
                            } else {
                                if (f = e, this['slot_map'][game['EView']['desktop']]) {
                                    var A = this['slot_map'][game['EView']['desktop']];
                                    A.type && A['item_id_list'] && A['item_id_list']['length'] > 0 ? d = A['item_id_list'][0] : A['item_id'] && (d = A['item_id']);
                                }
                                this['page_desktop']['show_mjp'](V, d, f, E);
                            }
                            this['setRandomGray'](!this['page_desktop']['can_random']());
                        } else if (9 == B) {
                            var d = this['cell_default_item'][7],
                            f = this['cell_default_item'][9];
                            if (f = e, this['slot_map'][game['EView']['desktop']]) {
                                var A = this['slot_map'][game['EView']['desktop']];
                                A.type && A['item_id_list'] && A['item_id_list']['length'] > 0 ? d = A['item_id_list'][0] : A['item_id'] && (d = A['item_id']);
                            }
                            this['page_desktop']['show_mjp_surface'](V, d, f, E),
                            this['setRandomGray'](!this['page_desktop']['can_random']());
                        } else
                            10 == B && this['page_desktop']['show_lobby_bg'](V, e, E);
                    },
                    z['prototype']['onRandomBtnClick'] = function () {
                        var B = this;
                        if (6 != this['select_index'] && 10 != this['select_index']) {
                            this['_changed'] = !0,
                            this['refresh_btn'](),
                            this['is_random'] = !this['is_random'],
                            this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                            Laya['Tween'].to(this['random_slider'], {
                                x: this['is_random'] ? 76 : -4
                            }, 100, null, Laya['Handler']['create'](this, function () {
                                    B['random']['getChildAt'](B['is_random'] ? 1 : 2)['visible'] = !1;
                                }));
                            var C = this['select_index'],
                            z = this['slot_ids'][C],
                            e = 0;
                            C >= 0 && C < this['cell_default_item']['length'] && (e = this['cell_default_item'][C]);
                            var I = e,
                            p = [];
                            if (this['slot_map'][z]) {
                                var L = this['slot_map'][z];
                                p = L['item_id_list'],
                                L['item_id'] && (I = this['slot_map'][z]['item_id']);
                            }
                            if (C >= 0 && 4 >= C) {
                                var R = this['slot_map'][z];
                                R ? (R.type = R.type ? 0 : 1, R['item_id_list'] && 0 != R['item_id_list']['length'] || (R['item_id_list'] = [R['item_id']])) : this['slot_map'][z] = {
                                    type: 1,
                                    item_id_list: [this['page_items']['items'][0]]
                                },
                                this['page_items']['changeRandomState'](I);
                            } else if (5 == C) {
                                var R = this['slot_map'][z];
                                if (R)
                                    R.type = R.type ? 0 : 1, R['item_id_list'] && 0 != R['item_id_list']['length'] || (R['item_id_list'] = [R['item_id']]);
                                else {
                                    this['slot_map'][z] = {
                                        type: 1,
                                        item_id_list: [this['page_bgm']['items'][0]]
                                    };
                                }
                                this['page_bgm']['changeRandomState'](I);
                            } else if (7 == C || 8 == C || 9 == C) {
                                var R = this['slot_map'][z];
                                R ? (R.type = R.type ? 0 : 1, R['item_id_list'] && 0 != R['item_id_list']['length'] || (R['item_id_list'] = [R['item_id']])) : this['slot_map'][z] = {
                                    type: 1,
                                    item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                },
                                this['page_desktop']['changeRandomState'](I);
                            }
                            this['scrollview']['wantToRefreshItem'](C);
                        }
                    },
                    z['prototype']['render_view'] = function (B) {
                        var C = this,
                        z = B['container'],
                        e = B['index'],
                        I = z['getChildByName']('cell');
                        this['select_index'] == e ? (I['scaleX'] = I['scaleY'] = 1.05, I['getChildByName']('choosed')['visible'] = !0) : (I['scaleX'] = I['scaleY'] = 1, I['getChildByName']('choosed')['visible'] = !1),
                        I['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][e]);
                        var p = I['getChildByName']('name'),
                        L = I['getChildByName']('icon'),
                        R = this['cell_default_item'][e],
                        E = this['slot_ids'][e],
                        V = !1;
                        if (this['slot_map'][E] && (V = this['slot_map'][E].type, this['slot_map'][E]['item_id'] && (R = this['slot_map'][E]['item_id'])), V)
                            p.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][E]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](L, 'myres/sushe/icon_random.jpg');
                        else {
                            var d = cfg['item_definition'].item.get(R);
                            d ? (p.text = d['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](L, d.icon, null, 'UI_Sushe_Select.Zhuangban')) : (p.text = game['Tools']['strOfLocalization'](this['cell_names'][e]), game['LoadMgr']['setImgSkin'](L, this['cell_default_img'][e], null, 'UI_Sushe_Select.Zhuangban'));
                        }
                        var f = I['getChildByName']('btn');
                        f['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || C['select_index'] != e && (C['onChangeSlotSelect'](e), C['scrollview']['wantToRefreshAll']());
                        }, null, !1),
                        f['mouseEnabled'] = this['select_index'] != e;
                    },
                    z['prototype']['close'] = function (C) {
                        var z = this;
                        this['container_zhuangban0']['visible'] && (C ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (B['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), B['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        z['page_items']['close'](),
                                        z['page_desktop']['close'](),
                                        z['page_headframe']['close'](),
                                        z['page_bgm']['close'](),
                                        z['container_zhuangban0']['visible'] = !1,
                                        z['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                    }))));
                    },
                    z['prototype']['onChangeGameView'] = function () {
                                    // 保存装扮页
                                    MMP.settings.using_commonview_index = B.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    // END
                        B['UI_Sushe']['randomDesktopID'](),
                        GameMgr.Inst['load_mjp_view']();
                        var C = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                        B['UI_Lite_Loading'].Inst.show(),
                        game['Scene_Lobby'].Inst['set_lobby_bg'](C, Laya['Handler']['create'](this, function () {
                                B['UI_Lite_Loading'].Inst['enable'] && B['UI_Lite_Loading'].Inst['close']();
                            })),
                        GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                    },
                    z['prototype']['setRandomGray'] = function (C) {
                        this['btn_random']['visible'] = !C,
                        this['random']['filters'] = C ? [new Laya['ColorFilter'](B['GRAY_FILTER'])] : [];
                    },
                    z['prototype']['getShowSlotInfo'] = function () {
                        return this['slot_map'][this['slot_ids'][this['select_index']]];
                    },
                    z['prototype']['changeSlotByItemId'] = function (B) {
                        var C = cfg['item_definition'].item.get(B);
                        if (C)
                            for (var z = 0; z < this['slot_ids']['length']; z++)
                                if (this['slot_ids'][z] == C.type)
                                    return this['onChangeSlotSelect'](z), this['scrollview']['wantToRefreshAll'](), void 0;
                    },
                    z;
                }
                ();
                C['Container_Zhuangban'] = z;
            }
            (C = B['zhuangban'] || (B['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        













        // 设置称号
        !function (B) {
            var C = function (C) {
                function z() {
                    var B = C.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return B['_root'] = null,
                    B['_scrollview'] = null,
                    B['_blackmask'] = null,
                    B['_locking'] = !1,
                    B['_showindexs'] = [],
                    z.Inst = B,
                    B;
                }
                return __extends(z, C),
                z.Init = function () {
                    var C = this;
                                // 获取称号
                    //GameMgr.Inst['use_fetch_info'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (z, e) {
                    //    if (z || e['error'])
                    //        B['UIMgr'].Inst['showNetReqError']('fetchTitleList', z, e);
                    //    else {
                    //        C['owned_title'] = [];
                    //        for (var I = 0; I < e['title_list']['length']; I++) {
                    //            var p = e['title_list'][I];
                                for (let title of cfg.item_definition.title.rows_) {
                                    var p = title.id;
                                cfg['item_definition']['title'].get(p) && C['owned_title'].push(p),
                                '600005' == p && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                p >= '600005' && '600015' >= p && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + p - '600005', 1);
                            }
                    //    }
                    //});
                },
                z['onFetchSuccess'] = function (B) {
                    if (this['owned_title'] = [], B['title_list'] && B['title_list']['title_list'])
                                    // START
                        //for (var C = 0; C < B['title_list']['title_list']['length']; C++) {
                        //    var z = B['title_list']['title_list'][C];
                                    // END
                                    for (let title of cfg.item_definition.title.rows_) {
                                        var z = title.id;
                            cfg['item_definition']['title'].get(z) && this['owned_title'].push(z),
                            '600005' == z && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                            z >= '600005' && '600015' >= z && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + z - '600005', 1);
                        }
                },
                z['title_update'] = function (C) {
                    for (var z = 0; z < C['new_titles']['length']; z++)
                        cfg['item_definition']['title'].get(C['new_titles'][z]) && this['owned_title'].push(C['new_titles'][z]), '600005' == C['new_titles'][z] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), C['new_titles'][z] >= '600005' && C['new_titles'][z] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + C['new_titles'][z] - '600005', 1);
                    if (C['remove_titles'] && C['remove_titles']['length'] > 0) {
                        for (var z = 0; z < C['remove_titles']['length']; z++) {
                            for (var e = C['remove_titles'][z], I = 0; I < this['owned_title']['length']; I++)
                                if (this['owned_title'][I] == e) {
                                    this['owned_title'][I] = this['owned_title'][this['owned_title']['length'] - 1],
                                    this['owned_title'].pop();
                                    break;
                                }
                            e == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](), B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                        }
                        this.Inst['enable'] && this.Inst.show();
                    }
                },
                z['prototype']['onCreate'] = function () {
                    var C = this;
                    this['_root'] = this.me['getChildByName']('root'),
                    this['_blackmask'] = new B['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return C['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                    this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                    this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (B) {
                            C['setItemValue'](B['index'], B['container']);
                        }, null, !1)),
                    this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['_locking'] || (C['_blackmask'].hide(), C['close']());
                    }, null, !1),
                    this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                },
                z['prototype'].show = function () {
                    var C = this;
                    if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), z['owned_title']['length'] > 0) {
                        this['_showindexs'] = [];
                        for (var e = 0; e < z['owned_title']['length']; e++)
                            this['_showindexs'].push(e);
                        this['_showindexs'] = this['_showindexs'].sort(function (B, C) {
                            var e = B,
                            I = cfg['item_definition']['title'].get(z['owned_title'][B]);
                            I && (e += 1000 * I['priority']);
                            var p = C,
                            L = cfg['item_definition']['title'].get(z['owned_title'][C]);
                            return L && (p += 1000 * L['priority']),
                            p - e;
                        }),
                        this['_scrollview']['reset'](),
                        this['_scrollview']['addItem'](z['owned_title']['length']),
                        this['_scrollview'].me['visible'] = !0,
                        this['_noinfo']['visible'] = !1;
                    } else
                        this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                    B['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            C['_locking'] = !1;
                        }));
                },
                z['prototype']['close'] = function () {
                    var C = this;
                    this['_locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                            C['_locking'] = !1,
                            C['enable'] = !1;
                        }));
                },
                z['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                },
                z['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                    this['_scrollview']['reset']();
                },
                z['prototype']['setItemValue'] = function (B, C) {
                    var e = this;
                    if (this['enable']) {
                        var I = z['owned_title'][this['_showindexs'][B]],
                        p = cfg['item_definition']['title'].find(I);
                        game['LoadMgr']['setImgSkin'](C['getChildByName']('img_title'), p.icon, null, 'UI_TitleBook'),
                        C['getChildByName']('using')['visible'] = I == GameMgr.Inst['account_data']['title'],
                        C['getChildByName']('desc').text = p['desc_' + GameMgr['client_language']];
                        var L = C['getChildByName']('btn');
                        L['clickHandler'] = Laya['Handler']['create'](this, function () {
                            I != GameMgr.Inst['account_data']['title'] ? (e['changeTitle'](B), C['getChildByName']('using')['visible'] = !0) : (e['changeTitle'](-1), C['getChildByName']('using')['visible'] = !1);
                        }, null, !1);
                        var R = C['getChildByName']('time'),
                        E = C['getChildByName']('img_title');
                        if (1 == p['unlock_type']) {
                            var V = p['unlock_param'][0],
                            d = cfg['item_definition'].item.get(V);
                            R.text = game['Tools']['strOfLocalization'](3121) + d['expire_desc_' + GameMgr['client_language']],
                            R['visible'] = !0,
                            E.y = 34;
                        } else
                            R['visible'] = !1, E.y = 44;
                    }
                },
                z['prototype']['changeTitle'] = function (C) {
                    var e = this,
                    I = GameMgr.Inst['account_data']['title'],
                    p = 0;
                    p = C >= 0 && C < this['_showindexs']['length'] ? z['owned_title'][this['_showindexs'][C]] : '600001',
                    GameMgr.Inst['account_data']['title'] = p;
                    for (var L = -1, R = 0; R < this['_showindexs']['length']; R++)
                        if (I == z['owned_title'][this['_showindexs'][R]]) {
                            L = R;
                            break;
                        }
                    B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](),
                    B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                    -1 != L && this['_scrollview']['wantToRefreshItem'](L),
                                    // 屏蔽设置称号的网络请求并保存称号
                                    MMP.settings.title = p;
                                MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                    //    title: '600001' == p ? 0 : p
                    //}, function (z, p) {
                    //    (z || p['error']) && (B['UIMgr'].Inst['showNetReqError']('useTitle', z, p), GameMgr.Inst['account_data']['title'] = I, B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](), B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo'](), e['enable'] && (C >= 0 && C < e['_showindexs']['length'] && e['_scrollview']['wantToRefreshItem'](C), L >= 0 && L < e['_showindexs']['length'] && e['_scrollview']['wantToRefreshItem'](L)));
                    //});
                },
                z.Inst = null,
                z['owned_title'] = [],
                z;
            }
            (B['UIBase']);
            B['UI_TitleBook'] = C;
        }
        (uiscript || (uiscript = {}));
        











        // 友人房调整装扮
        !function (B) {
            var C;
            !function (C) {
                var z = function () {
                    function z(B) {
                        this['scrollview'] = null,
                        this['page_skin'] = null,
                        this['chara_infos'] = [],
                        this['choosed_chara_index'] = 0,
                        this['choosed_skin_id'] = 0,
                        this['star_char_count'] = 0,
                        this.me = B,
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['page_skin'] = new C['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return z['prototype'].show = function (C) {
                        var z = this;
                        this.me['visible'] = !0,
                        C ? this.me['alpha'] = 1 : B['UIBase']['anim_alpha_in'](this.me, {
                            x: 0
                        }, 200, 0),
                        this['choosed_chara_index'] = 0,
                        this['chara_infos'] = [];
                        for (var e = 0, I = B['UI_Sushe']['star_chars']; e < I['length']; e++)
                            for (var p = I[e], L = 0; L < B['UI_Sushe']['characters']['length']; L++)
                                if (!B['UI_Sushe']['hidden_characters_map'][p] && B['UI_Sushe']['characters'][L]['charid'] == p) {
                                    this['chara_infos'].push({
                                        chara_id: B['UI_Sushe']['characters'][L]['charid'],
                                        skin_id: B['UI_Sushe']['characters'][L].skin,
                                        is_upgraded: B['UI_Sushe']['characters'][L]['is_upgraded']
                                    }),
                                    B['UI_Sushe']['main_character_id'] == B['UI_Sushe']['characters'][L]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var L = 0; L < B['UI_Sushe']['characters']['length']; L++)
                            B['UI_Sushe']['hidden_characters_map'][B['UI_Sushe']['characters'][L]['charid']] || -1 == B['UI_Sushe']['star_chars']['indexOf'](B['UI_Sushe']['characters'][L]['charid']) && (this['chara_infos'].push({
                                    chara_id: B['UI_Sushe']['characters'][L]['charid'],
                                    skin_id: B['UI_Sushe']['characters'][L].skin,
                                    is_upgraded: B['UI_Sushe']['characters'][L]['is_upgraded']
                                }), B['UI_Sushe']['main_character_id'] == B['UI_Sushe']['characters'][L]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                        this['scrollview']['reset'](),
                        this['scrollview']['addItem'](this['chara_infos']['length']);
                        var R = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(R['chara_id'], R['skin_id'], Laya['Handler']['create'](this, function (B) {
                                z['choosed_skin_id'] = B,
                                R['skin_id'] = B,
                                z['scrollview']['wantToRefreshItem'](z['choosed_chara_index']);
                            }, null, !1));
                    },
                    z['prototype']['render_character_cell'] = function (C) {
                        var z = this,
                        e = C['index'],
                        I = C['container'],
                        p = C['cache_data'];
                        p['index'] = e;
                        var L = this['chara_infos'][e];
                        p['inited'] || (p['inited'] = !0, p.skin = new B['UI_Character_Skin'](I['getChildByName']('btn')['getChildByName']('head')), p['bound'] = I['getChildByName']('btn')['getChildByName']('bound'));
                        var R = I['getChildByName']('btn');
                        R['getChildByName']('choose')['visible'] = e == this['choosed_chara_index'],
                        p.skin['setSkin'](L['skin_id'], 'bighead'),
                        R['getChildByName']('using')['visible'] = e == this['choosed_chara_index'];
                        var E = cfg['item_definition']['character'].find(L['chara_id']),
                        V = E['name_' + GameMgr['client_language'] + '2'] ? E['name_' + GameMgr['client_language'] + '2'] : E['name_' + GameMgr['client_language']],
                        d = R['getChildByName']('label_name');
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            d.text = V['replace']('-', '|')['replace'](/\./g, '·');
                            var f = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            d['leading'] = f.test(V) ? -15 : 0;
                        } else
                            d.text = V;
                        R['getChildByName']('star') && (R['getChildByName']('star')['visible'] = e < this['star_char_count']);
                        var A = cfg['item_definition']['character'].get(L['chara_id']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? p['bound'].skin = A.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (L['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (L['is_upgraded'] ? '2.png' : '.png')) : A.ur ? (p['bound'].pos(-10, -2), p['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '6.png' : '5.png'))) : (p['bound'].pos(4, 20), p['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '4.png' : '3.png'))),
                        R['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '2.png' : '.png')),
                        I['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            if (e != z['choosed_chara_index']) {
                                var B = z['choosed_chara_index'];
                                z['choosed_chara_index'] = e,
                                z['choosed_skin_id'] = L['skin_id'],
                                z['page_skin'].show(L['chara_id'], L['skin_id'], Laya['Handler']['create'](z, function (B) {
                                        z['choosed_skin_id'] = B,
                                        L['skin_id'] = B,
                                        p.skin['setSkin'](B, 'bighead');
                                    }, null, !1)),
                                z['scrollview']['wantToRefreshItem'](B),
                                z['scrollview']['wantToRefreshItem'](e);
                            }
                        });
                    },
                    z['prototype']['close'] = function (C) {
                        var z = this;
                        if (this.me['visible'])
                            if (C)
                                this.me['visible'] = !1;
                            else {
                                var e = this['chara_infos'][this['choosed_chara_index']];
                                            //把chartid和skin写入cookie
                                            MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                            MMP.saveSettings();
                                            // End
                                            // 友人房调整装扮
                                //e['chara_id'] != B['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                //        character_id: e['chara_id']
                                //    }, function () {}), 
                                    B['UI_Sushe']['main_character_id'] = e['chara_id'];//),
                                //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //    character_id: e['chara_id'],
                                //    skin: this['choosed_skin_id']
                                //}, function () {});
                                            // END
                                for (var I = 0; I < B['UI_Sushe']['characters']['length']; I++)
                                    if (B['UI_Sushe']['characters'][I]['charid'] == e['chara_id']) {
                                        B['UI_Sushe']['characters'][I].skin = this['choosed_skin_id'];
                                        break;
                                    }
                                GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                B['UI_Sushe']['onMainSkinChange'](),
                                B['UIBase']['anim_alpha_out'](this.me, {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        z.me['visible'] = !1;
                                    }));
                            }
                    },
                    z;
                }
                ();
                C['Page_Waiting_Head'] = z;
            }
            (C = B['zhuangban'] || (B['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        













        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var B = GameMgr;
    var C = this;
    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (z, e) {
        if (z || e['error'])
            uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', z, e);
        else {
            app.Log.log('UpdateAccount: ' + JSON['stringify'](e)),
            B.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    e.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    e.account.title = GameMgr.Inst.account_data.title;
                    e.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        e.account.nickname = MMP.settings.nickname;
                    }
                    // END
            for (var I in e['account']) {
                if (B.Inst['account_data'][I] = e['account'][I], 'platform_diamond' == I)
                    for (var p = e['account'][I], L = 0; L < p['length']; L++)
                        C['account_numerical_resource'][p[L].id] = p[L]['count'];
                if ('skin_ticket' == I && (B.Inst['account_numerical_resource']['100004'] = e['account'][I]), 'platform_skin_ticket' == I)
                    for (var p = e['account'][I], L = 0; L < p['length']; L++)
                        C['account_numerical_resource'][p[L].id] = p[L]['count'];
            }
            uiscript['UI_Lobby'].Inst['refreshInfo'](),
            e['account']['room_id'] && B.Inst['updateRoom'](),
            '10102' === B.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
            '10103' === B.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
        }
    });
}










        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (C, z, e) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': C,
                        'account_id': parseInt(z.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': C,
                            'account_id': parseInt(z.toString())
                        }));
                    }
                }));
            }
            var B = GameMgr;
    var I = this;
    return C = C.trim(),
    app.Log.log('checkPaiPu game_uuid:' + C + ' account_id:' + z['toString']() + ' paipu_config:' + e),
    this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), B.Inst['onLoadStart']('paipu'), 2 & e && (C = game['Tools']['DecodePaipuUUID'](C)), this['record_uuid'] = C, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
            game_uuid: C,
            client_version_string: this['getClientVersion']()
        }, function (p, L) {
            if (p || L['error']) {
                uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', p, L);
                var R = 0.12;
                uiscript['UI_Loading'].Inst['setProgressVal'](R);
                var E = function () {
                    return R += 0.06,
                    uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, R)),
                    R >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, E), void 0) : void 0;
                };
                Laya['timer'].loop(50, I, E),
                I['duringPaipu'] = !1;
            } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': p.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': p.head
                                    }));
                                }
                            }));
                        }
                uiscript['UI_Activity_SevenDays']['task_done'](3),
                uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                var V = L.head,
                d = [null, null, null, null],
                f = game['Tools']['strOfLocalization'](2003),
                A = V['config'].mode;
                app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                    game_uuid: C,
                    client_version_string: I['getClientVersion']()
                }, function () {}),
                A['extendinfo'] && (f = game['Tools']['strOfLocalization'](2004)),
                A['detail_rule'] && A['detail_rule']['ai_level'] && (1 === A['detail_rule']['ai_level'] && (f = game['Tools']['strOfLocalization'](2003)), 2 === A['detail_rule']['ai_level'] && (f = game['Tools']['strOfLocalization'](2004)));
                var O = !1;
                V['end_time'] ? (I['record_end_time'] = V['end_time'], V['end_time'] > '1576112400' && (O = !0)) : I['record_end_time'] = -1,
                I['record_start_time'] = V['start_time'] ? V['start_time'] : -1;
                for (var Y = 0; Y < V['accounts']['length']; Y++) {
                    var h = V['accounts'][Y];
                    if (h['character']) {
                        var Z = h['character'],
                        j = {};
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
                        if (O) {
                            var D = h['views'];
                            if (D)
                                for (var K = 0; K < D['length']; K++)
                                    j[D[K].slot] = D[K]['item_id'];
                        } else {
                            var a = Z['views'];
                            if (a)
                                for (var K = 0; K < a['length']; K++) {
                                    var J = a[K].slot,
                                    c = a[K]['item_id'],
                                    t = J - 1;
                                    j[t] = c;
                                }
                        }
                        var g = [];
                        for (var m in j)
                            g.push({
                                slot: parseInt(m),
                                item_id: j[m]
                            });
                        h['views'] = g,
                        d[h.seat] = h;
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
                    d[h.seat] = h;
                }
                for (var F = game['GameUtility']['get_default_ai_skin'](), r = game['GameUtility']['get_default_ai_character'](), Y = 0; Y < d['length']; Y++)
                   if( null == d[Y] ){
                   d[Y] = {
                            nickname: f,
                            avatar_id: F,
                            level: {
                                id: '10101'
                            },
                            level3: {
                                id: '20101'
                            },
                            character: {
                                charid: r,
                                level: 0,
                                exp: 0,
                                views: [],
                                skin: F,
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
                                             d[Y].avatar_id = skin.id;
                                             d[Y].character.charid = skin.character_id;
                                             d[Y].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                         d[Y].nickname = '[BOT]' +  d[Y].nickname;
                                    }
                                }
                                // END
                            }
                var s = Laya['Handler']['create'](I, function (B) {
                    game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                    game['Scene_MJ'].Inst['openMJRoom'](V['config'], d, Laya['Handler']['create'](I, function () {
                            I['duringPaipu'] = !1,
                            view['DesktopMgr'].Inst['paipu_config'] = e,
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](V['config'])), d, z, view['EMJMode']['paipu'], Laya['Handler']['create'](I, function () {
                                    uiscript['UI_Replay'].Inst['initData'](B),
                                    uiscript['UI_Replay'].Inst['enable'] = !0,
                                    Laya['timer'].once(1000, I, function () {
                                        I['EnterMJ']();
                                    }),
                                    Laya['timer'].once(1500, I, function () {
                                        view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                        uiscript['UI_Loading'].Inst['close']();
                                    }),
                                    Laya['timer'].once(1000, I, function () {
                                        uiscript['UI_Replay'].Inst['nextStep'](!0);
                                    });
                                }));
                        }), Laya['Handler']['create'](I, function (B) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * B);
                        }, null, !1));
                }),
                S = {};
                if (S['record'] = V, L.data && L.data['length'])
                    S.game = net['MessageWrapper']['decodeMessage'](L.data), s['runWith'](S);
                else {
                    var X = L['data_url'];
                    X['startsWith']('http') || (X = B['prefix_url'] + X),
                    game['LoadMgr']['httpload'](X, 'arraybuffer', !1, Laya['Handler']['create'](I, function (B) {
                            if (B['success']) {
                                var C = new Laya.Byte();
                                C['writeArrayBuffer'](B.data);
                                var z = net['MessageWrapper']['decodeMessage'](C['getUint8Array'](0, C['length']));
                                S.game = z,
                                s['runWith'](S);
                            } else
                                uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + L['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), I['duringPaipu'] = !1;
                        }));
                }
            }
        }), void 0);
}













        // 牌谱功能
        !function (B) {
            var C = function () {
                function C(B) {
                    var C = this;
                    this.me = B,
                    this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        C['locking'] || C.hide(null);
                    }),
                    this['title'] = this.me['getChildByName']('title'),
                    this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                    this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                    this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                    this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                    this.me['visible'] = !1,
                    this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        C['locking'] || C.hide(null);
                    }, null, !1),
                    this['container_hidename'] = this.me['getChildByName']('hidename'),
                    this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var z = this['container_hidename']['getChildByName']('w0'),
                    e = this['container_hidename']['getChildByName']('w1');
                    e.x = z.x + z['textField']['textWidth'] + 10,
                    this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        C['sp_checkbox']['visible'] = !C['sp_checkbox']['visible'],
                        C['refresh_share_uuid']();
                    }),
                    this['input'].on('focus', this, function () {
                        C['input']['focus'] && C['input']['setSelection'](0, C['input'].text['length']);
                    });
                }
                return C['prototype']['show_share'] = function (C) {
                    var z = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                    this['sp_checkbox']['visible'] = !1,
                    this['btn_confirm']['visible'] = !1,
                    this['input']['editable'] = !1,
                    this.uuid = C,
                    this['refresh_share_uuid'](),
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['container_hidename']['visible'] = !0,
                    this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                    B['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            z['locking'] = !1;
                        }));
                },
                C['prototype']['refresh_share_uuid'] = function () {
                    var B = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                    C = this.uuid,
                    z = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + z + '?paipu=' + game['Tools']['EncodePaipuUUID'](C) + '_a' + B + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + z + '?paipu=' + C + '_a' + B;
                },
                C['prototype']['show_check'] = function () {
                    var C = this;
                    return B['UI_PiPeiYuYue'].Inst['enable'] ? (B['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return C['input'].text ? (C.hide(Laya['Handler']['create'](C, function () {
                                        var B = C['input'].text['split']('='),
                                        z = B[B['length'] - 1]['split']('_'),
                                        e = 0;
                                        z['length'] > 1 && (e = 'a' == z[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(z[1]['substr'](1))) : parseInt(z[1]));
                                        var I = 0;
                                        if (z['length'] > 2) {
                                            var p = parseInt(z[2]);
                                            p && (I = p);
                                        }
                                        GameMgr.Inst['checkPaiPu'](z[0], e, I);
                                    })), void 0) : (B['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, B['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                                C['locking'] = !1;
                            })), void 0);
                },
                C['prototype'].hide = function (C) {
                    var z = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                            z['locking'] = !1,
                            z.me['visible'] = !1,
                            C && C.run();
                        }));
                },
                C;
            }
            (),
            z = function () {
                function C(B) {
                    var C = this;
                    this.me = B,
                    this['blackbg'] = B['getChildByName']('blackbg'),
                    this.root = B['getChildByName']('root'),
                    this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                        C['locking'] || C['close']();
                    }),
                    this['blackbg']['getChildAt'](0)['clickHandler'] = new Laya['Handler'](this, function () {
                        C['locking'] || C['close']();
                    }),
                    this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                        C['locking'] || (game['Tools']['calu_word_length'](C['input'].text) > 30 ? C['toolong']['visible'] = !0 : (C['close'](), p['addCollect'](C.uuid, C['start_time'], C['end_time'], C['input'].text)));
                    }),
                    this['toolong'] = this.root['getChildByName']('toolong');
                }
                return C['prototype'].show = function (C, z, e) {
                    var I = this;
                    this.uuid = C,
                    this['start_time'] = z,
                    this['end_time'] = e,
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['input'].text = '',
                    this['toolong']['visible'] = !1,
                    this['blackbg']['alpha'] = 0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0.5
                    }, 150),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            I['locking'] = !1;
                        }));
                },
                C['prototype']['close'] = function () {
                    var C = this;
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0
                    }, 150),
                    B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1,
                            C.me['visible'] = !1;
                        }));
                },
                C;
            }
            ();
            B['UI_Pop_CollectInput'] = z;
            var e;
            !function (B) {
                B[B.ALL = 0] = 'ALL',
                B[B['FRIEND'] = 1] = 'FRIEND',
                B[B.RANK = 2] = 'RANK',
                B[B['MATCH'] = 4] = 'MATCH',
                B[B['COLLECT'] = 100] = 'COLLECT';
            }
            (e || (e = {}));
            var I = function () {
                function C(B) {
                    this['uuid_list'] = [],
                    this.type = B,
                    this['reset']();
                }
                return C['prototype']['reset'] = function () {
                    this['count'] = 0,
                    this['true_count'] = 0,
                    this['have_more_paipu'] = !0,
                    this['uuid_list'] = [],
                    this['duringload'] = !1,
                    this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                C['prototype']['loadList'] = function (C) {
                    var z = this;
                    if (void 0 === C && (C = 10), !this['duringload'] && this['have_more_paipu']) {
                        if (this['duringload'] = !0, this.type == e['COLLECT']) {
                            for (var I = [], L = 0, R = 0; 10 > R; R++) {
                                var E = this['count'] + R;
                                if (E >= p['collect_lsts']['length'])
                                    break;
                                L++;
                                var V = p['collect_lsts'][E];
                                p['record_map'][V] || I.push(V),
                                this['uuid_list'].push(V);
                            }
                            I['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                uuid_list: I
                            }, function (C, e) {
                                if (z['duringload'] = !1, p.Inst['onLoadStateChange'](z.type, !1), C || e['error'])
                                    B['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', C, e);
                                else if (app.Log.log(JSON['stringify'](e)), e['record_list'] && e['record_list']['length'] == I['length']) {
                                    for (var R = 0; R < e['record_list']['length']; R++) {
                                        var E = e['record_list'][R].uuid;
                                        p['record_map'][E] || (p['record_map'][E] = e['record_list'][R]);
                                    }
                                    z['count'] += L,
                                    z['count'] >= p['collect_lsts']['length'] && (z['have_more_paipu'] = !1, p.Inst['onLoadOver'](z.type)),
                                    p.Inst['onLoadMoreLst'](z.type, L);
                                } else
                                    z['have_more_paipu'] = !1, p.Inst['onLoadOver'](z.type);
                            }) : (this['duringload'] = !1, this['count'] += L, this['count'] >= p['collect_lsts']['length'] && (this['have_more_paipu'] = !1, p.Inst['onLoadOver'](this.type)), p.Inst['onLoadMoreLst'](this.type, L));
                        } else
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                start: this['true_count'],
                                count: 10,
                                type: this.type
                            }, function (C, I) {
                                if (z['duringload'] = !1, p.Inst['onLoadStateChange'](z.type, !1), C || I['error'])
                                    B['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', C, I);
                                else if (app.Log.log(JSON['stringify'](I)), I['record_list'] && I['record_list']['length'] > 0) {
                                                                // START
                                                                if (MMP.settings.sendGame == true) {
                                                                    (GM_xmlhttpRequest({
                                                                        method: 'post',
                                                                        url: MMP.settings.sendGameURL,
                                                                        data: JSON.stringify(I),
                                                                        onload: function (msg) {
                                                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(I));
                                                                        }
                                                                    }));
                                                                    for (let record_list of I['record_list']) {
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
                                    for (var L = I['record_list'], R = 0, E = 0; E < L['length']; E++) {
                                        var V = L[E].uuid;
                                        if (z.type == e.RANK && L[E]['config'] && L[E]['config'].meta) {
                                            var d = L[E]['config'].meta;
                                            if (d) {
                                                var f = cfg['desktop']['matchmode'].get(d['mode_id']);
                                                if (f && 5 == f.room)
                                                    continue;
                                            }
                                        }
                                        R++,
                                        z['uuid_list'].push(V),
                                        p['record_map'][V] || (p['record_map'][V] = L[E]);
                                    }
                                    z['count'] += R,
                                    z['true_count'] += L['length'],
                                    p.Inst['onLoadMoreLst'](z.type, R),
                                    z['have_more_paipu'] = !0;
                                } else
                                    z['have_more_paipu'] = !1, p.Inst['onLoadOver'](z.type);
                            });
                        Laya['timer'].once(700, this, function () {
                            z['duringload'] && p.Inst['onLoadStateChange'](z.type, !0);
                        });
                    }
                },
                C['prototype']['removeAt'] = function (B) {
                    for (var C = 0; C < this['uuid_list']['length'] - 1; C++)
                        C >= B && (this['uuid_list'][C] = this['uuid_list'][C + 1]);
                    this['uuid_list'].pop(),
                    this['count']--,
                    this['true_count']--;
                },
                C;
            }
            (),
            p = function (p) {
                function L() {
                    var B = p.call(this, new ui['lobby']['paipuUI']()) || this;
                    return B.top = null,
                    B['container_scrollview'] = null,
                    B['scrollview'] = null,
                    B['loading'] = null,
                    B.tabs = [],
                    B['pop_otherpaipu'] = null,
                    B['pop_collectinput'] = null,
                    B['label_collect_count'] = null,
                    B['noinfo'] = null,
                    B['locking'] = !1,
                    B['current_type'] = e.ALL,
                    L.Inst = B,
                    B;
                }
                return __extends(L, p),
                L.init = function () {
                    var B = this;
                    this['paipuLst'][e.ALL] = new I(e.ALL),
                    this['paipuLst'][e['FRIEND']] = new I(e['FRIEND']),
                    this['paipuLst'][e.RANK] = new I(e.RANK),
                    this['paipuLst'][e['MATCH']] = new I(e['MATCH']),
                    this['paipuLst'][e['COLLECT']] = new I(e['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (C, z) {
                        if (C || z['error']);
                        else {
                            if (z['record_list']) {
                                for (var e = z['record_list'], I = 0; I < e['length']; I++) {
                                    var p = {
                                        uuid: e[I].uuid,
                                        time: e[I]['end_time'],
                                        remarks: e[I]['remarks']
                                    };
                                    B['collect_lsts'].push(p.uuid),
                                    B['collect_info'][p.uuid] = p;
                                }
                                B['collect_lsts'] = B['collect_lsts'].sort(function (C, z) {
                                    return B['collect_info'][z].time - B['collect_info'][C].time;
                                });
                            }
                            z['record_collect_limit'] && (B['collect_limit'] = z['record_collect_limit']);
                        }
                    });
                },
                L['onFetchSuccess'] = function (B) {
                    var C = this;
                    this['paipuLst'][e.ALL] = new I(e.ALL),
                    this['paipuLst'][e['FRIEND']] = new I(e['FRIEND']),
                    this['paipuLst'][e.RANK] = new I(e.RANK),
                    this['paipuLst'][e['MATCH']] = new I(e['MATCH']),
                    this['paipuLst'][e['COLLECT']] = new I(e['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {};
                    var z = B['collected_game_record_list'];
                    if (z['record_list']) {
                        for (var p = z['record_list'], L = 0; L < p['length']; L++) {
                            var R = {
                                uuid: p[L].uuid,
                                time: p[L]['end_time'],
                                remarks: p[L]['remarks']
                            };
                            this['collect_lsts'].push(R.uuid),
                            this['collect_info'][R.uuid] = R;
                        }
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, z) {
                            return C['collect_info'][z].time - C['collect_info'][B].time;
                        });
                    }
                    z['record_collect_limit'] && (this['collect_limit'] = z['record_collect_limit']);
                },
                L['onAccountUpdate'] = function () {
                    this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                },
                L['reset'] = function () {
                    this['paipuLst'][e.ALL] && this['paipuLst'][e.ALL]['reset'](),
                    this['paipuLst'][e['FRIEND']] && this['paipuLst'][e['FRIEND']]['reset'](),
                    this['paipuLst'][e.RANK] && this['paipuLst'][e.RANK]['reset'](),
                    this['paipuLst'][e['MATCH']] && this['paipuLst'][e['MATCH']]['reset']();
                },
                L['addCollect'] = function (C, z, e, I) {
                    var p = this;
                    if (!this['collect_info'][C]) {
                        if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                            return B['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2767)), void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                            uuid: C,
                            remarks: I,
                            start_time: z,
                            end_time: e
                        }, function () {});
                        var R = {
                            uuid: C,
                            remarks: I,
                            time: e
                        };
                        this['collect_info'][C] = R,
                        this['collect_lsts'].push(C),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, C) {
                            return p['collect_info'][C].time - p['collect_info'][B].time;
                        }),
                        B['UI_DesktopInfo'].Inst && B['UI_DesktopInfo'].Inst['enable'] && B['UI_DesktopInfo'].Inst['onCollectChange'](),
                        L.Inst && L.Inst['enable'] && L.Inst['onCollectChange'](C, -1);
                    }
                },
                L['removeCollect'] = function (C) {
                    var z = this;
                    if (this['collect_info'][C]) {
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                            uuid: C
                        }, function () {}),
                        delete this['collect_info'][C];
                        for (var e = -1, I = 0; I < this['collect_lsts']['length']; I++)
                            if (this['collect_lsts'][I] == C) {
                                this['collect_lsts'][I] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                e = I;
                                break;
                            }
                        this['collect_lsts'].pop(),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, C) {
                            return z['collect_info'][C].time - z['collect_info'][B].time;
                        }),
                        B['UI_DesktopInfo'].Inst && B['UI_DesktopInfo'].Inst['enable'] && B['UI_DesktopInfo'].Inst['onCollectChange'](),
                        L.Inst && L.Inst['enable'] && L.Inst['onCollectChange'](C, e);
                    }
                },
                L['prototype']['onCreate'] = function () {
                    var e = this;
                    this.top = this.me['getChildByName']('top'),
                    this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        e['locking'] || e['close'](Laya['Handler']['create'](e, function () {
                                B['UIMgr'].Inst['showLobby']();
                            }));
                    }, null, !1),
                    this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                    this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (B) {
                            e['setItemValue'](B['index'], B['container']);
                        }, null, !1)),
                    this['scrollview']['setElastic'](),
                    this['container_scrollview'].on('ratechange', this, function () {
                        var B = L['paipuLst'][e['current_type']];
                        (1 - e['scrollview'].rate) * B['count'] < 3 && (B['duringload'] || (B['have_more_paipu'] ? B['loadList']() : 0 == B['count'] && (e['noinfo']['visible'] = !0)));
                    }),
                    this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                    this['loading']['visible'] = !1,
                    this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        e['pop_otherpaipu'].me['visible'] || e['pop_otherpaipu']['show_check']();
                    }, null, !1),
                    this.tabs = [];
                    for (var I = 0; 5 > I; I++)
                        this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](I)), this.tabs[I]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [I, !1]);
                    this['pop_otherpaipu'] = new C(this.me['getChildByName']('pop_otherpaipu')),
                    this['pop_collectinput'] = new z(this.me['getChildByName']('pop_collect')),
                    this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                    this['label_collect_count'].text = '0/20',
                    this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                },
                L['prototype'].show = function () {
                    var C = this;
                    GameMgr.Inst['BehavioralStatistics'](20),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['pop_otherpaipu'].me['visible'] = !1,
                    this['pop_collectinput'].me['visible'] = !1,
                    B['UIBase']['anim_alpha_in'](this.top, {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                        y: 30
                    }, 200),
                    this['locking'] = !0,
                    this['loading']['visible'] = !1,
                    Laya['timer'].once(200, this, function () {
                        C['locking'] = !1;
                    }),
                    this['changeTab'](0, !0),
                    this['label_collect_count'].text = L['collect_lsts']['length']['toString']() + '/' + L['collect_limit']['toString']();
                },
                L['prototype']['close'] = function (C) {
                    var z = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this.top, {
                        y: -30
                    }, 150),
                    B['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                        y: 30
                    }, 150),
                    Laya['timer'].once(150, this, function () {
                        z['locking'] = !1,
                        z['enable'] = !1,
                        C && C.run();
                    });
                },
                L['prototype']['changeTab'] = function (B, C) {
                    var z = [e.ALL, e.RANK, e['FRIEND'], e['MATCH'], e['COLLECT']];
                    if (C || z[B] != this['current_type']) {
                        if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = z[B], this['current_type'] == e['COLLECT'] && L['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != e['COLLECT']) {
                            var I = L['paipuLst'][this['current_type']]['count'];
                            I > 0 && this['scrollview']['addItem'](I);
                        }
                        for (var p = 0; p < this.tabs['length']; p++) {
                            var R = this.tabs[p];
                            R['getChildByName']('img').skin = game['Tools']['localUISrc'](B == p ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                            R['getChildByName']('label_name')['color'] = B == p ? '#d9b263' : '#8cb65f';
                        }
                    }
                },
                L['prototype']['setItemValue'] = function (C, z) {
                    var e = this;
                    if (this['enable']) {
                        var I = L['paipuLst'][this['current_type']];
                        if (I || !(C >= I['uuid_list']['length'])) {
                            for (var p = L['record_map'][I['uuid_list'][C]], R = 0; 4 > R; R++) {
                                var E = z['getChildByName']('p' + R['toString']());
                                if (R < p['result']['players']['length']) {
                                    E['visible'] = !0;
                                    var V = E['getChildByName']('chosen'),
                                    d = E['getChildByName']('rank'),
                                    f = E['getChildByName']('rank_word'),
                                    A = E['getChildByName']('name'),
                                    O = E['getChildByName']('score'),
                                    Y = p['result']['players'][R];
                                    O.text = Y['part_point_1'] || '0';
                                    for (var h = 0, Z = game['Tools']['strOfLocalization'](2133), j = 0, D = !1, K = 0; K < p['accounts']['length']; K++)
                                        if (p['accounts'][K].seat == Y.seat) {
                                            h = p['accounts'][K]['account_id'],
                                            Z = p['accounts'][K]['nickname'],
                                            j = p['accounts'][K]['verified'],
                                            D = p['accounts'][K]['account_id'] == GameMgr.Inst['account_id'];
                                            break;
                                        }
                                    game['Tools']['SetNickname'](A, {
                                        account_id: h,
                                        nickname: Z,
                                        verified: j
                                    }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                    V['visible'] = D,
                                    O['color'] = D ? '#ffc458' : '#b98930',
                                    A['getChildByName']('name')['color'] = D ? '#dfdfdf' : '#a0a0a0',
                                    f['color'] = d['color'] = D ? '#57bbdf' : '#489dbc';
                                    var a = E['getChildByName']('rank_word');
                                    if ('en' == GameMgr['client_language'])
                                        switch (R) {
                                        case 0:
                                            a.text = 'st';
                                            break;
                                        case 1:
                                            a.text = 'nd';
                                            break;
                                        case 2:
                                            a.text = 'rd';
                                            break;
                                        case 3:
                                            a.text = 'th';
                                        }
                                } else
                                    E['visible'] = !1;
                            }
                            var J = new Date(1000 * p['end_time']),
                            c = '';
                            c += J['getFullYear']() + '/',
                            c += (J['getMonth']() < 9 ? '0' : '') + (J['getMonth']() + 1)['toString']() + '/',
                            c += (J['getDate']() < 10 ? '0' : '') + J['getDate']() + ' ',
                            c += (J['getHours']() < 10 ? '0' : '') + J['getHours']() + ':',
                            c += (J['getMinutes']() < 10 ? '0' : '') + J['getMinutes'](),
                            z['getChildByName']('date').text = c,
                            z['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                return e['locking'] ? void 0 : B['UI_PiPeiYuYue'].Inst['enable'] ? (B['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](p.uuid, GameMgr.Inst['account_id'], 0), void 0);
                            }, null, !1),
                            z['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                e['locking'] || e['pop_otherpaipu'].me['visible'] || (e['pop_otherpaipu']['show_share'](p.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                            }, null, !1);
                            var t = z['getChildByName']('room'),
                            g = game['Tools']['get_room_desc'](p['config']);
                            t.text = g.text;
                            var m = '';
                            if (1 == p['config']['category'])
                                m = game['Tools']['strOfLocalization'](2023);
                            else if (4 == p['config']['category'])
                                m = game['Tools']['strOfLocalization'](2025);
                            else if (2 == p['config']['category']) {
                                var F = p['config'].meta;
                                if (F) {
                                    var r = cfg['desktop']['matchmode'].get(F['mode_id']);
                                    r && (m = r['room_name_' + GameMgr['client_language']]);
                                }
                            }
                            if (L['collect_info'][p.uuid]) {
                                var s = L['collect_info'][p.uuid],
                                S = z['getChildByName']('remarks_info'),
                                X = z['getChildByName']('input'),
                                i = X['getChildByName']('txtinput'),
                                b = z['getChildByName']('btn_input'),
                                o = !1,
                                M = function () {
                                    o ? (S['visible'] = !1, X['visible'] = !0, i.text = S.text, b['visible'] = !1) : (S.text = s['remarks'] && '' != s['remarks'] ? game['Tools']['strWithoutForbidden'](s['remarks']) : m, S['visible'] = !0, X['visible'] = !1, b['visible'] = !0);
                                };
                                M(),
                                b['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    o = !0,
                                    M();
                                }, null, !1),
                                i.on('blur', this, function () {
                                    o && (game['Tools']['calu_word_length'](i.text) > 30 ? B['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2765)) : i.text != s['remarks'] && (s['remarks'] = i.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                uuid: p.uuid,
                                                remarks: i.text
                                            }, function () {}))),
                                    o = !1,
                                    M();
                                });
                                var H = z['getChildByName']('collect');
                                H['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](e, function () {
                                            L['removeCollect'](p.uuid);
                                        }));
                                }, null, !1),
                                H['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                            } else {
                                z['getChildByName']('input')['visible'] = !1,
                                z['getChildByName']('btn_input')['visible'] = !1,
                                z['getChildByName']('remarks_info')['visible'] = !0,
                                z['getChildByName']('remarks_info').text = m;
                                var H = z['getChildByName']('collect');
                                H['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    e['pop_collectinput'].show(p.uuid, p['start_time'], p['end_time']);
                                }, null, !1),
                                H['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                            }
                        }
                    }
                },
                L['prototype']['onLoadStateChange'] = function (B, C) {
                    this['current_type'] == B && (this['loading']['visible'] = C);
                },
                L['prototype']['onLoadMoreLst'] = function (B, C) {
                    this['current_type'] == B && this['scrollview']['addItem'](C);
                },
                L['prototype']['getScrollViewCount'] = function () {
                    return this['scrollview']['value_count'];
                },
                L['prototype']['onLoadOver'] = function (B) {
                    if (this['current_type'] == B) {
                        var C = L['paipuLst'][this['current_type']];
                        0 == C['count'] && (this['noinfo']['visible'] = !0);
                    }
                },
                L['prototype']['onCollectChange'] = function (B, C) {
                    if (this['current_type'] == e['COLLECT'])
                        C >= 0 && (L['paipuLst'][e['COLLECT']]['removeAt'](C), this['scrollview']['delItem'](C));
                    else
                        for (var z = L['paipuLst'][this['current_type']]['uuid_list'], I = 0; I < z['length']; I++)
                            if (z[I] == B) {
                                this['scrollview']['wantToRefreshItem'](I);
                                break;
                            }
                    this['label_collect_count'].text = L['collect_lsts']['length']['toString']() + '/' + L['collect_limit']['toString']();
                },
                L['prototype']['refreshAll'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                L.Inst = null,
                L['paipuLst'] = {},
                L['collect_lsts'] = [],
                L['record_map'] = {},
                L['collect_info'] = {},
                L['collect_limit'] = 20,
                L;
            }
            (B['UIBase']);
            B['UI_PaiPu'] = p;
        }
        (uiscript || (uiscript = {}));
        
        












        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var B = GameMgr;
    var C = this;
    if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), this['use_fetch_info'] || (app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (B, z) {
                B || z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', B, z) : C['server_time_delta'] = 1000 * z['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (B, z) {
                B || z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', B, z) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](z)), C['updateServerSettings'](z['settings']));
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (B, z) {
            B || z['error'] || (C['client_endpoint'] = z['client_endpoint']);
        }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (B) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](B));
                var z = B['update'];
                if (z) {
                    if (z['numerical'])
                        for (var e = 0; e < z['numerical']['length']; e++) {
                            var I = z['numerical'][e].id,
                            p = z['numerical'][e]['final'];
                            switch (I) {
                            case '100001':
                                C['account_data']['diamond'] = p;
                                break;
                            case '100002':
                                C['account_data'].gold = p;
                                break;
                            case '100099':
                                C['account_data'].vip = p,
                                uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (I >= '101001' || '102999' >= I) && (C['account_numerical_resource'][I] = p);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](z),
                    z['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](z['daily_task']),
                    z['title'] && uiscript['UI_TitleBook']['title_update'](z['title']),
                    z['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](z),
                    (z['activity_task'] || z['activity_period_task'] || z['activity_random_task'] || z['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](z),
                    z['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](z['activity_flip_task']['progresses']),
                    z['activity'] && (z['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](z['activity']['friend_gift_data']), z['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](z['activity']['upgrade_data']), z['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](z['activity']['gacha_data']), z['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](z['activity']['simulation_data']), z['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](z['activity']['spot_data']), z['activity']['combining_data'] && uiscript['UI_Activity_Combining']['update_data'](z['activity']['combining_data']), z['activity']['village_data'] && uiscript['UI_Activity_Chunjie']['update_data'](z['activity']['village_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (B) {
                app.Log.log('收到消息：' + JSON['stringify'](B)),
                B.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](B['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (B) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                uiscript['UI_Recharge']['payment_info'] = '',
                uiscript['UI_Recharge']['open_wx'] = !0,
                uiscript['UI_Recharge']['wx_type'] = 0,
                uiscript['UI_Recharge']['open_alipay'] = !0,
                uiscript['UI_Recharge']['alipay_type'] = 0,
                B['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](B['settings']), B['settings']['nickname_setting'] && (C['nickname_replace_enable'] = !!B['settings']['nickname_setting']['enable'], C['nickname_replace_lst'] = B['settings']['nickname_setting']['nicknames'])),
                uiscript['UI_Change_Nickname']['allow_modify_nickname'] = B['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (B) {
                uiscript['UI_Sushe']['send_gift_limit'] = B['gift_limit'],
                game['FriendMgr']['friend_max_count'] = B['friend_max_count'],
                uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = B['zhp_free_refresh_limit'],
                uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = B['zhp_cost_refresh_limit'],
                uiscript['UI_PaiPu']['collect_limit'] = B['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (B) {
                game['Tools']['showGuaJiChengFa'](B);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (B) {
                C['auth_check_id'] = B['check_id'],
                C['auth_nc_retry_count'] = 0,
                4 == B.type ? C['showNECaptcha']() : 2 == B.type ? C['checkNc']() : C['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
            if (game['LobbyNetMgr'].Inst.isOK) {
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (B, z) {
                    B || z['error'] || (C['server_time_delta'] = 1000 * z['server_time'] - Laya['timer']['currTimer']);
                });
                var B = (Laya['timer']['currTimer'] - C['_last_heatbeat_time']) / 1000;
                app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                    no_operation_counter: B
                }, function () {}),
                B >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
            }
        }), Laya['timer'].loop(1000, this, function () {
            var B = Laya['stage']['getMousePoint']();
            (B.x != C['_pre_mouse_point'].x || B.y != C['_pre_mouse_point'].y) && (C['clientHeatBeat'](), C['_pre_mouse_point'].x = B.x, C['_pre_mouse_point'].y = B.y);
        }), Laya['timer'].loop(1000, this, function () {
            Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
        }), 'kr' == B['client_type'] && Laya['timer'].loop(3600000, this, function () {
            C['showKrTip'](!1, null);
        }), uiscript['UI_RollNotice'].init(), 'jp' == B['client_language']) {
        var z = document['createElement']('link');
        z.rel = 'stylesheet',
        z.href = 'font/notosansjapanese_1.css';
        var e = document['getElementsByTagName']('head')[0];
        e['appendChild'](z);
    }
}









            // 设置状态
            !function (B) {
                var C = function () {
                    function B(C) {
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
                        B.Inst = this,
                        this.me = C,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                        for (var z = 0; 3 > z; z++)
                            this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + z));
                        this['_container_c1'] = this.me['getChildByName']('c1');
                        for (var z = 0; 3 > z; z++)
                            this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + z));
                        for (var z = 0; 2 > z; z++)
                            this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + z));
                        this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                    }
                    return Object['defineProperty'](B['prototype'], 'timeuse', {
                        get: function () {
                            return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    B['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                        Laya['timer']['clearAll'](this);
                    },
                    B['prototype']['showCD'] = function (B, C) {
                        var z = this;
                        this.me['visible'] = !0,
                        this['_start'] = Laya['timer']['currTimer'],
                        this._fix = Math['floor'](B / 1000),
                        this._add = Math['floor'](C / 1000),
                        this['_pre_sec'] = -1,
                        this['_pre_time'] = Laya['timer']['currTimer'],
                        this['_show'](),
                        Laya['timer']['frameLoop'](1, this, function () {
                            var B = Laya['timer']['currTimer'] - z['_pre_time'];
                            z['_pre_time'] = Laya['timer']['currTimer'],
                            view['DesktopMgr'].Inst['timestoped'] ? z['_start'] += B : z['_show']();
                        });
                    },
                    B['prototype']['close'] = function () {
                        this['reset']();
                    },
                    B['prototype']['_show'] = function () {
                        var B = this._fix + this._add - this['timeuse'];
                        if (0 >= B)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (B != this['_pre_sec']) {
                            if (this['_pre_sec'] = B, B > this._add) {
                                for (var C = (B - this._add)['toString'](), z = 0; z < this['_img_countdown_c0']['length']; z++)
                                    this['_img_countdown_c0'][z]['visible'] = z < C['length'];
                                if (3 == C['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[2] + '.png')) : 2 == C['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + C[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var e = this._add['toString'](), z = 0; z < this['_img_countdown_add']['length']; z++) {
                                        var I = this['_img_countdown_add'][z];
                                        z < e['length'] ? (I['visible'] = !0, I.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + e[z] + '.png')) : I['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var z = 0; z < this['_img_countdown_add']['length']; z++)
                                        this['_img_countdown_add'][z]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var C = B['toString'](), z = 0; z < this['_img_countdown_c0']['length']; z++)
                                    this['_img_countdown_c0'][z]['visible'] = z < C['length'];
                                3 == C['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[2] + '.png')) : 2 == C['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + C[0] + '.png');
                            }
                            if (B > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var z = 0; z < this['_img_countdown_c0']['length']; z++)
                                    this['_img_countdown_c0'][z]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                this['_container_c0']['alpha'] = 1,
                                this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                this['_container_c1']['visible'] = !0;
                                for (var z = 0; z < this['_img_countdown_c0']['length']; z++)
                                    this['_img_countdown_c0'][z]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                this['_container_c0']['alpha'] = 1,
                                this['_container_c1']['alpha'] = 1;
                                for (var z = 0; z < this['_img_countdown_c1']['length']; z++)
                                    this['_img_countdown_c1'][z]['visible'] = this['_img_countdown_c0'][z]['visible'], this['_img_countdown_c1'][z].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][z].skin);
                                R.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    B.Inst = null,
                    B;
                }
                (),
                z = function () {
                    function B(B) {
                        this['timer_id'] = 0,
                        this['last_returned'] = !1,
                        this.me = B;
                    }
                    return B['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                        this['last_returned'] = !0,
                        this['_loop_refresh_delay'](),
                        Laya['timer']['clearAll'](this),
                        Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                    B['prototype']['close_refresh'] = function () {
                        this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                        this['last_returned'] = !1,
                        Laya['timer']['clearAll'](this);
                    },
                    B['prototype']['_loop_refresh_delay'] = function () {
                        var B = this;
                        if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                            var C = 2000;
                            if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                var z = app['NetAgent']['mj_network_delay'];
                                C = 300 > z ? 2000 : 800 > z ? 2500 + z : 4000 + 0.5 * z,
                                app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                    B['last_returned'] = !0;
                                }),
                                this['last_returned'] = !1;
                            } else
                                C = 1000;
                            this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), C);
                        }
                    },
                    B['prototype']['_loop_show'] = function () {
                        if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                            else {
                                var B = app['NetAgent']['mj_network_delay'];
                                this.me.skin = 300 > B ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > B ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                            }
                    },
                    B;
                }
                (),
                e = function () {
                    function B(B, C) {
                        var z = this;
                        this['enable'] = !1,
                        this['emj_banned'] = !1,
                        this['locking'] = !1,
                        this['localposition'] = C,
                        this.me = B,
                        this['btn_banemj'] = B['getChildByName']('btn_banemj'),
                        this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                        this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                        this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                        this['btn_seeinfo'] = B['getChildByName']('btn_seeinfo'),
                        this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                        this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                        this['btn_change'] = B['getChildByName']('btn_change'),
                        this['btn_change_origin_x'] = this['btn_change'].x,
                        this['btn_change_origin_y'] = this['btn_change'].y,
                        this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z['locking'] || (z['emj_banned'] = !z['emj_banned'], z['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (z['emj_banned'] ? '_on.png' : '.png')), z['close']());
                        }, null, !1),
                        this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z['locking'] || (z['close'](), R.Inst['btn_seeinfo'](z['localposition']));
                        }, null, !1),
                        this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z['locking'] || (z['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](z['localposition'])));
                        }, null, !1),
                        this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z['locking'] || z['switch']();
                        }, null, !1);
                    }
                    return B['prototype']['reset'] = function (B, C, z) {
                        Laya['timer']['clearAll'](this),
                        this['locking'] = !1,
                        this['enable'] = !1,
                        this['showinfo'] = B,
                        this['showemj'] = C,
                        this['showchange'] = z,
                        this['emj_banned'] = !1,
                        this['btn_banemj']['visible'] = !1,
                        this['btn_seeinfo']['visible'] = !1,
                        this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                        this['btn_change']['visible'] = !1;
                    },
                    B['prototype']['onChangeSeat'] = function (B, C, z) {
                        this['showinfo'] = B,
                        this['showemj'] = C,
                        this['showchange'] = z,
                        this['enable'] = !1,
                        this['btn_banemj']['visible'] = !1,
                        this['btn_seeinfo']['visible'] = !1,
                        this['btn_change']['visible'] = !1;
                    },
                    B['prototype']['switch'] = function () {
                        var B = this;
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
                                    B['locking'] = !1;
                                })));
                    },
                    B['prototype']['close'] = function () {
                        var B = this;
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
                            B['locking'] = !1,
                            B['btn_banemj']['visible'] = !1,
                            B['btn_seeinfo']['visible'] = !1,
                            B['btn_change']['visible'] = !1;
                        });
                    },
                    B;
                }
                (),
                I = function () {
                    function B(B) {
                        var C = this;
                        this['btn_emos'] = [],
                        this.emos = [],
                        this['allgray'] = !1,
                        this.me = B,
                        this.in = this.me['getChildByName']('in'),
                        this.out = this.me['getChildByName']('out'),
                        this['in_out'] = this.in['getChildByName']('in_out'),
                        this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                        this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                        this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                            C['switchShow'](!0);
                        }),
                        this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                        this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                            C['switchShow'](!1);
                        }),
                        this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                        this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                        this['scrollview']['reset'](),
                        this['scrollbar'].init(null),
                        this['scrollview'].me.on('ratechange', this, function () {
                            C['scrollview']['total_height'] > 0 ? C['scrollbar']['setVal'](C['scrollview'].rate, C['scrollview']['view_height'] / C['scrollview']['total_height']) : C['scrollbar']['setVal'](0, 1);
                        }),
                        'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return B['prototype']['initRoom'] = function () {
                        var B = view['DesktopMgr'].Inst['main_role_character_info'],
                        C = cfg['item_definition']['character'].find(B['charid']);
                        this['emo_log_count'] = 0,
                        this.emos = [];
                        for (var z = 0; 9 > z; z++)
                            this.emos.push({
                                path: C.emo + '/' + z + '.png',
                                sub_id: z,
                                sort: z
                            });
                        if (B['extra_emoji'])
                            for (var z = 0; z < B['extra_emoji']['length']; z++)
                                this.emos.push({
                                    path: C.emo + '/' + B['extra_emoji'][z] + '.png',
                                    sub_id: B['extra_emoji'][z],
                                    sort: B['extra_emoji'][z] > 12 ? 1000000 - B['extra_emoji'][z] : B['extra_emoji'][z]
                                });
                        this.emos = this.emos.sort(function (B, C) {
                            return B.sort - C.sort;
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
                            char_id: B['charid'],
                            emoji: [],
                            server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                        };
                    },
                    B['prototype']['render_item'] = function (B) {
                        var C = this,
                        z = B['index'],
                        e = B['container'],
                        I = this.emos[z],
                        p = e['getChildByName']('btn');
                        p.skin = game['LoadMgr']['getResImageSkin'](I.path),
                        this['allgray'] ? game['Tools']['setGrayDisable'](p, !0) : (game['Tools']['setGrayDisable'](p, !1), p['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (app['NetAgent']['isMJConnectOK']()) {
                                    GameMgr.Inst['BehavioralStatistics'](22);
                                    for (var B = !1, z = 0, e = C['emo_infos']['emoji']; z < e['length']; z++) {
                                        var p = e[z];
                                        if (p[0] == I['sub_id']) {
                                            p[0]++,
                                            B = !0;
                                            break;
                                        }
                                    }
                                    B || C['emo_infos']['emoji'].push([I['sub_id'], 1]),
                                    app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                        content: JSON['stringify']({
                                            emo: I['sub_id']
                                        }),
                                        except_self: !1
                                    }, function () {});
                                }
                                C['change_all_gray'](!0),
                                Laya['timer'].once(5000, C, function () {
                                    C['change_all_gray'](!1);
                                }),
                                C['switchShow'](!1);
                            }, null, !1));
                    },
                    B['prototype']['change_all_gray'] = function (B) {
                        this['allgray'] = B,
                        this['scrollview']['wantToRefreshAll']();
                    },
                    B['prototype']['switchShow'] = function (B) {
                        var C = this,
                        z = 0;
                        z = B ? 1367 : 1896,
                        Laya['Tween'].to(this.me, {
                            x: 1972
                        }, B ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                B ? (C.out['visible'] = !1, C.in['visible'] = !0) : (C.out['visible'] = !0, C.in['visible'] = !1),
                                Laya['Tween'].to(C.me, {
                                    x: z
                                }, B ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function () {
                                        C['btn_chat']['disabled'] = !1,
                                        C['btn_chat_in']['disabled'] = !1;
                                    }), 0, !0, !0);
                            }), 0, !0, !0),
                        this['btn_chat']['disabled'] = !0,
                        this['btn_chat_in']['disabled'] = !0;
                    },
                    B['prototype']['sendEmoLogUp'] = function () {
                                            // START
                        //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                        //    var B = GameMgr.Inst['getMouse']();
                        //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                        //        data: this['emo_infos'],
                        //        m: view['DesktopMgr']['click_prefer'],
                        //        d: B,
                        //        e: window['innerHeight'] / 2,
                        //        f: window['innerWidth'] / 2,
                        //        t: R.Inst['min_double_time'],
                        //        g: R.Inst['max_double_time']
                        //    }, !1),
                        //    this['emo_infos']['emoji'] = [];
                       // }
                       // this['emo_log_count']++;
                                            // END
                    },
                    B['prototype']['reset'] = function () {
                        this['emo_infos'] = null,
                        this['scrollbar']['reset'](),
                        this['scrollview']['reset']();
                    },
                    B;
                }
                (),
                p = function () {
                    function C(C) {
                        this['effect'] = null,
                        this['container_emo'] = C['getChildByName']('chat_bubble'),
                        this.emo = new B['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                        this['root_effect'] = C['getChildByName']('root_effect'),
                        this['container_emo']['visible'] = !1;
                    }
                    return C['prototype'].show = function (B, C) {
                        var z = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var e = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](B)]['character']['charid'], I = cfg['character']['emoji']['getGroup'](e), p = '', L = 0, R = 10 > C, E = 0; E < I['length']; E++)
                                if (I[E]['sub_id'] == C) {
                                    R = !0,
                                    2 == I[E].type && (p = I[E].view, L = I[E]['audio']);
                                    break;
                                }
                            R || (C = 0),
                            this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                            p ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + p + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    z['effect'] && (z['effect']['destory'](), z['effect'] = null);
                                }), L && view['AudioMgr']['PlayAudio'](L)) : (this.emo['setSkin'](e, C), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    Laya['Tween'].to(z['container_emo'], {
                                        scaleX: 0,
                                        scaleY: 0
                                    }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    z['container_emo']['visible'] = !1,
                                    z.emo['clear']();
                                }));
                        }
                    },
                    C['prototype']['reset'] = function () {
                        Laya['timer']['clearAll'](this),
                        this.emo['clear'](),
                        this['container_emo']['visible'] = !1,
                        this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                    },
                    C;
                }
                (),
                L = function () {
                    function B(B, C) {
                        if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = C, this.me = B, 0 == C) {
                            var z = B['getChildByName']('moqie');
                            this['moqie'] = z['getChildByName']('moqie'),
                            this['tip_moqie'] = z['getChildByName']('tip'),
                            this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                            this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                            this['points_moqie'] = [];
                            var e = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                            this['points_moqie'].push(e);
                            for (var I = 0; 5 > I; I++) {
                                var p = e['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_moqie'].push(p);
                            }
                            var L = B['getChildByName']('shouqie');
                            this['shouqie'] = L['getChildByName']('shouqie'),
                            this['tip_shouqie'] = L['getChildByName']('tip'),
                            this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                            this['points_shouqie'] = [],
                            this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                            e = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                            this['points_shouqie'].push(e);
                            for (var I = 0; 5 > I; I++) {
                                var p = e['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_shouqie'].push(p);
                            }
                            'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                        } else
                            this['moqie'] = B['getChildByName']('moqie'), this['shouqie'] = B['getChildByName']('shouqie');
                        this['star_moqie'] = this['moqie']['getChildByName']('star'),
                        this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                    }
                    return B['prototype'].show = function (B, C, z, e, I) {
                        var p = this;
                        if (this.me['visible'] = !0, C != this['_now_moqie_bonus']) {
                            if (this['_now_moqie_bonus'] = C, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + C + '.png'), I) {
                                var L = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                                L['parent']['setChildIndex'](L, 1),
                                Laya['Tween']['clearAll'](this['moqie']),
                                Laya['Tween'].to(this['moqie'], {
                                    scaleX: 4,
                                    scaleY: 4
                                }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(p['moqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_moqie']['visible'] = C == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (e != this['_now_shouqie_bonus']) {
                            if (this['_now_shouqie_bonus'] = e, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + e + '.png'), I) {
                                var L = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                                L['parent']['setChildIndex'](L, 1),
                                Laya['Tween']['clearAll'](this['shouqie']),
                                Laya['Tween'].to(this['shouqie'], {
                                    scaleX: 4,
                                    scaleY: 4
                                }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(p['shouqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_shouqie']['visible'] = e == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (0 == this['index']) {
                            for (var R = this['_fan_counts']['indexOf'](C), E = this['_moqie_counts'][R + 1] - this['_moqie_counts'][R], V = B - this['_moqie_counts'][R], d = 0; d < this['points_moqie']['length']; d++) {
                                var f = this['points_moqie'][d];
                                if (E > d) {
                                    f['visible'] = !0;
                                    var A = d / E * 2 * Math.PI;
                                    f.pos(27 * Math.sin(A) + 27, 27 - 27 * Math.cos(A)),
                                    f.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (V > d ? 'l.png' : 'd.png'));
                                } else
                                    f['visible'] = !1;
                            }
                            this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + B]),
                            this['circle_moqie']['visible'] = C != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                            R = this['_fan_counts']['indexOf'](e),
                            E = this['_shouqie_counts'][R + 1] - this['_shouqie_counts'][R],
                            V = z - this['_shouqie_counts'][R];
                            for (var d = 0; d < this['points_shouqie']['length']; d++) {
                                var f = this['points_shouqie'][d];
                                if (E > d) {
                                    f['visible'] = !0;
                                    var A = d / E * 2 * Math.PI;
                                    f.pos(27 * Math.sin(A) + 27, 27 - 27 * Math.cos(A)),
                                    f.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (V > d ? 'l.png' : 'd.png'));
                                } else
                                    f['visible'] = !1;
                            }
                            this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + z]),
                            this['circle_shouqie']['visible'] = e != this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                    },
                    B['prototype']['resetToStart'] = function () {
                        var B = this;
                        this.me['visible'] = !0,
                        this['moqie']['scale'](1, 1),
                        this['shouqie']['scale'](1, 1),
                        this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_0.png'),
                        this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_0.png'),
                        Laya['timer']['clearAll'](this),
                        this['_now_moqie_bonus'] = 0,
                        this['_now_shouqie_bonus'] = 0,
                        this.show(0, 0, 0, 0, !1),
                        Laya['timer']['frameLoop'](1, this, function () {
                            B['_update']();
                        }),
                        this['_anim_start_time'] = Laya['timer']['currTimer'],
                        this['_update'](),
                        this['star_moqie']['visible'] = !1,
                        this['star_shouqie']['visible'] = !1,
                        0 == this['index'] && (this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['0']), this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['0']));
                    },
                    B['prototype'].hide = function () {
                        Laya['timer']['clearAll'](this),
                        this.me['visible'] = !1;
                    },
                    B['prototype']['_update'] = function () {
                        var B = (Laya['timer']['currTimer'] - this['_anim_start_time']) / 2000 % 1,
                        C = 1.4 * Math.abs(B - 0.5) + 0.8;
                        this['star_moqie']['getChildAt'](0)['scale'](C, C),
                        this['star_shouqie']['getChildAt'](0)['scale'](C, C),
                        B = (B + 0.4) % 1;
                        var z = 1.4 * Math.abs(B - 0.5) + 0.8;
                        this['star_moqie']['getChildAt'](1)['scale'](z, z),
                        this['star_shouqie']['getChildAt'](1)['scale'](z, z);
                    },
                    B;
                }
                (),
                R = function (R) {
                    function E() {
                        var B = R.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return B['container_doras'] = null,
                        B['doras'] = [],
                        B['front_doras'] = [],
                        B['label_md5'] = null,
                        B['container_gamemode'] = null,
                        B['label_gamemode'] = null,
                        B['btn_auto_moqie'] = null,
                        B['btn_auto_nofulu'] = null,
                        B['btn_auto_hule'] = null,
                        B['img_zhenting'] = null,
                        B['btn_double_pass'] = null,
                        B['_network_delay'] = null,
                        B['_timecd'] = null,
                        B['_player_infos'] = [],
                        B['_container_fun'] = null,
                        B['_fun_in'] = null,
                        B['_fun_out'] = null,
                        B['showscoredeltaing'] = !1,
                        B['_btn_set'] = null,
                        B['_btn_leave'] = null,
                        B['_btn_fanzhong'] = null,
                        B['_btn_collect'] = null,
                        B['block_emo'] = null,
                        B['head_offset_y'] = 15,
                        B['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                        B['selfGapOffsetX'] = [0, -150, 150],
                        app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](B, function (C) {
                                B['onGameBroadcast'](C);
                            })),
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](B, function (C) {
                                B['onPlayerConnectionState'](C);
                            })),
                        E.Inst = B,
                        B;
                    }
                    return __extends(E, R),
                    E['prototype']['onCreate'] = function () {
                        var R = this;
                        this['doras'] = new Array(),
                        this['front_doras'] = [];
                        var E = this.me['getChildByName']('container_lefttop'),
                        V = E['getChildByName']('container_doras');
                        this['container_doras'] = V,
                        this['container_gamemode'] = E['getChildByName']('gamemode'),
                        this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                        'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                        this['label_md5'] = E['getChildByName']('MD5'),
                        ('en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language']) && (this['label_md5']['margin'] = 1),
                        E['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (R['label_md5']['visible'])
                                Laya['timer']['clearAll'](R['label_md5']), R['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? E['getChildByName']('activitymode')['visible'] = !0 : R['container_doras']['visible'] = !0;
                            else {
                                R['label_md5']['visible'] = !0,
                                R['label_md5']['banAutoWordWrap'] = !1,
                                view['DesktopMgr'].Inst['saltSha256'] ? (R['label_md5']['banAutoWordWrap'] = 'en' == GameMgr['client_language'] || ('jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language']) && view['DesktopMgr'].Inst['is_chuanma_mode'](), R['label_md5']['fontSize'] = 'en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] ? 14 : 15, R['label_md5'].y = 42, R['label_md5'].text = game['Tools']['strOfLocalization']('10002') + view['DesktopMgr'].Inst['sha256'] + '\n' + game['Tools']['strOfLocalization']('10003') + view['DesktopMgr'].Inst['saltSha256']) : view['DesktopMgr'].Inst['sha256'] ? (R['label_md5']['fontSize'] = 20, R['label_md5'].y = 45, R['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (R['label_md5']['fontSize'] = 25, R['label_md5'].y = 51, R['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                E['getChildByName']('activitymode')['visible'] = !1,
                                R['container_doras']['visible'] = !1;
                                var B = R;
                                Laya['timer'].once(5000, R['label_md5'], function () {
                                    B['label_md5']['visible'] = !1,
                                    view['DesktopMgr'].Inst['is_chuanma_mode']() ? E['getChildByName']('activitymode')['visible'] = !0 : R['container_doras']['visible'] = !0;
                                });
                            }
                        }, null, !1);
                        for (var d = 0; d < V['numChildren']; d++)
                            this['doras'].push(V['getChildAt'](d)), this['front_doras'].push(V['getChildAt'](d)['getChildAt'](0));
                        for (var d = 0; 4 > d; d++) {
                            var f = this.me['getChildByName']('container_player_' + d),
                            A = {};
                            A['container'] = f,
                            A.head = new B['UI_Head'](f['getChildByName']('head'), ''),
                            A['head_origin_y'] = f['getChildByName']('head').y,
                            A.name = f['getChildByName']('container_name')['getChildByName']('name'),
                            A['container_shout'] = f['getChildByName']('container_shout'),
                            A['container_shout']['visible'] = !1,
                            A['illust'] = A['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                            A['illustrect'] = B['UIRect']['CreateFromSprite'](A['illust']),
                            A['shout_origin_x'] = A['container_shout'].x,
                            A['shout_origin_y'] = A['container_shout'].y,
                            A.emo = new p(f),
                            A['disconnect'] = f['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                            A['disconnect']['visible'] = !1,
                            A['title'] = new B['UI_PlayerTitle'](f['getChildByName']('title'), ''),
                            A.que = f['getChildByName']('que'),
                            A['que_target_pos'] = new Laya['Vector2'](A.que.x, A.que.y),
                            A['tianming'] = f['getChildByName']('tianming'),
                            A['tianming']['visible'] = !1,
                            A['yongchang'] = new L(f['getChildByName']('yongchang'), d),
                            A['yongchang'].hide(),
                            0 == d ? (f['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    R['btn_seeinfo'](0);
                                }, null, !1), f['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    B['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                                })) : A['headbtn'] = new e(f['getChildByName']('btn_head'), d),
                            this['_player_infos'].push(A);
                        }
                        this['_timecd'] = new C(this.me['getChildByName']('container_countdown')),
                        this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                        this['img_zhenting']['visible'] = !1,
                        this['_initFunc'](),
                        this['block_emo'] = new I(this.me['getChildByName']('container_chat_choose')),
                        this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                        this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                        this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                if (view['DesktopMgr'].Inst['gameing']) {
                                    for (var C = 0, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++)
                                        view['DesktopMgr'].Inst['player_datas'][z]['account_id'] && C++;
                                    if (1 >= C)
                                        B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](R, function () {
                                                if (view['DesktopMgr'].Inst['gameing']) {
                                                    for (var B = 0, C = 0; C < view['DesktopMgr'].Inst['player_datas']['length']; C++) {
                                                        var z = view['DesktopMgr'].Inst['player_datas'][C];
                                                        z && null != z['account_id'] && 0 != z['account_id'] && B++;
                                                    }
                                                    1 == B ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                        game['Scene_MJ'].Inst['GameEnd']();
                                                    }) : game['Scene_MJ'].Inst['ForceOut']();
                                                }
                                            }));
                                    else {
                                        var e = !1;
                                        if (B['UI_VoteProgress']['vote_info']) {
                                            var I = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - B['UI_VoteProgress']['vote_info']['start_time'] - B['UI_VoteProgress']['vote_info']['duration_time']);
                                            0 > I && (e = !0);
                                        }
                                        e ? B['UI_VoteProgress'].Inst['enable'] || B['UI_VoteProgress'].Inst.show() : B['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? B['UI_VoteCD'].Inst['enable'] || B['UI_VoteCD'].Inst.show() : B['UI_Vote'].Inst.show();
                                    }
                                }
                            } else
                                view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), B['UI_Ob_Replay'].Inst['resetRounds'](), B['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                            view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && B['UI_Desktop_Yindao'].Inst['close']();
                        }, null, !1),
                        this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                        this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            B['UI_Config'].Inst.show();
                        }, null, !1),
                        this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                        this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            B['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                        }, null, !1),
                        this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                        this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](R, function () {
                                        B['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : B['UI_Replay'].Inst && B['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                        }, null, !1),
                        this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                        this['btn_double_pass']['visible'] = !1;
                        var O = 0;
                        this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (view['DesktopMgr']['double_click_pass']) {
                                var C = Laya['timer']['currTimer'];
                                if (O + 300 > C) {
                                    if (B['UI_ChiPengHu'].Inst['enable'])
                                        B['UI_ChiPengHu'].Inst['onDoubleClick'](), R['recordDoubleClickTime'](C - O);
                                    else {
                                        var z = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                        B['UI_LiQiZiMo'].Inst['enable'] && (z = B['UI_LiQiZiMo'].Inst['onDoubleClick'](z)),
                                        z && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && R['recordDoubleClickTime'](C - O);
                                    }
                                    O = 0;
                                } else
                                    O = C;
                            }
                        }, null, !1),
                        this['_network_delay'] = new z(this.me['getChildByName']('img_signal')),
                        this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                        this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                        'en' == GameMgr['client_language'] && (E['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                    },
                    E['prototype']['recordDoubleClickTime'] = function (B) {
                        this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(B, this['min_double_time'])) : B,
                        this['max_double_time'] = this['max_double_time'] ? Math.max(B, this['max_double_time']) : B;
                    },
                    E['prototype']['onGameBroadcast'] = function (B) {
                        app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](B));
                        var C = view['DesktopMgr'].Inst['seat2LocalPosition'](B.seat),
                        z = JSON['parse'](B['content']);
                        null != z.emo && void 0 != z.emo && (this['onShowEmo'](C, z.emo), this['showAIEmo']());
                    },
                    E['prototype']['onPlayerConnectionState'] = function (B) {
                        app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](B));
                        var C = B.seat;
                        if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && C < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][C] = B['state']), this['enable']) {
                            var z = view['DesktopMgr'].Inst['seat2LocalPosition'](C);
                            this['_player_infos'][z]['disconnect']['visible'] = B['state'] != view['ELink_State']['READY'];
                        }
                    },
                    E['prototype']['_initFunc'] = function () {
                        var B = this;
                        this['_container_fun'] = this.me['getChildByName']('container_func'),
                        this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                        this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                        this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                        var C = this['_fun_out']['getChildByName']('btn_func'),
                        z = this['_fun_out']['getChildByName']('btn_func2'),
                        e = this['_fun_in_spr']['getChildByName']('btn_func');
                        C['clickHandler'] = z['clickHandler'] = new Laya['Handler'](this, function () {
                            var I = 0;
                            I = -270,
                            Laya['Tween'].to(B['_container_fun'], {
                                x: -624
                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                    B['_fun_in']['visible'] = !0,
                                    B['_fun_out']['visible'] = !1,
                                    Laya['Tween'].to(B['_container_fun'], {
                                        x: I
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                            C['disabled'] = !1,
                                            z['disabled'] = !1,
                                            e['disabled'] = !1,
                                            B['_fun_out']['visible'] = !1;
                                        }), 0, !0, !0);
                                })),
                            C['disabled'] = !0,
                            z['disabled'] = !0,
                            e['disabled'] = !0;
                        }, null, !1),
                        e['clickHandler'] = new Laya['Handler'](this, function () {
                            var I = -546;
                            Laya['Tween'].to(B['_container_fun'], {
                                x: -624
                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                    B['_fun_in']['visible'] = !1,
                                    B['_fun_out']['visible'] = !0,
                                    Laya['Tween'].to(B['_container_fun'], {
                                        x: I
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                            C['disabled'] = !1,
                                            z['disabled'] = !1,
                                            e['disabled'] = !1,
                                            B['_fun_out']['visible'] = !0;
                                        }), 0, !0, !0);
                                })),
                            C['disabled'] = !0,
                            z['disabled'] = !0,
                            e['disabled'] = !0;
                        });
                        var I = this['_fun_in']['getChildByName']('btn_autolipai'),
                        p = this['_fun_out']['getChildByName']('btn_autolipai2'),
                        L = this['_fun_out']['getChildByName']('autolipai'),
                        R = Laya['LocalStorage']['getItem']('autolipai'),
                        E = !0;
                        E = R && '' != R ? 'true' == R : !0,
                        this['refreshFuncBtnShow'](I, L, E),
                        I['clickHandler'] = p['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                            B['refreshFuncBtnShow'](I, L, view['DesktopMgr'].Inst['auto_liqi']),
                            Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                        }, null, !1);
                        var V = this['_fun_in']['getChildByName']('btn_autohu'),
                        d = this['_fun_out']['getChildByName']('btn_autohu2'),
                        f = this['_fun_out']['getChildByName']('autohu');
                        this['refreshFuncBtnShow'](V, f, !1),
                        V['clickHandler'] = d['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                            B['refreshFuncBtnShow'](V, f, view['DesktopMgr'].Inst['auto_hule']);
                        }, null, !1);
                        var A = this['_fun_in']['getChildByName']('btn_autonoming'),
                        O = this['_fun_out']['getChildByName']('btn_autonoming2'),
                        Y = this['_fun_out']['getChildByName']('autonoming');
                        this['refreshFuncBtnShow'](A, Y, !1),
                        A['clickHandler'] = O['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                            B['refreshFuncBtnShow'](A, Y, view['DesktopMgr'].Inst['auto_nofulu']);
                        }, null, !1);
                        var h = this['_fun_in']['getChildByName']('btn_automoqie'),
                        Z = this['_fun_out']['getChildByName']('btn_automoqie2'),
                        j = this['_fun_out']['getChildByName']('automoqie');
                        this['refreshFuncBtnShow'](h, j, !1),
                        h['clickHandler'] = Z['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                            B['refreshFuncBtnShow'](h, j, view['DesktopMgr'].Inst['auto_moqie']);
                        }, null, !1),
                        'kr' == GameMgr['client_language'] && (L['scale'](0.9, 0.9), f['scale'](0.9, 0.9), Y['scale'](0.9, 0.9), j['scale'](0.9, 0.9)),
                        Laya['Browser'].onPC && !GameMgr['inConch'] ? (C['visible'] = !1, d['visible'] = !0, p['visible'] = !0, O['visible'] = !0, Z['visible'] = !0) : (C['visible'] = !0, d['visible'] = !1, p['visible'] = !1, O['visible'] = !1, Z['visible'] = !1);
                    },
                    E['prototype']['noAutoLipai'] = function () {
                        var B = this['_container_fun']['getChildByName']('btn_autolipai');
                        view['DesktopMgr'].Inst['auto_liqi'] = !0,
                        B['clickHandler'].run();
                    },
                    E['prototype']['resetFunc'] = function () {
                        var B = Laya['LocalStorage']['getItem']('autolipai'),
                        C = !0;
                        C = B && '' != B ? 'true' == B : !0;
                        var z = this['_fun_in']['getChildByName']('btn_autolipai'),
                        e = this['_fun_out']['getChildByName']('automoqie');
                        this['refreshFuncBtnShow'](z, e, C),
                        Laya['LocalStorage']['setItem']('autolipai', C ? 'true' : 'false'),
                        view['DesktopMgr'].Inst['setAutoLiPai'](C);
                        var I = this['_fun_in']['getChildByName']('btn_autohu'),
                        p = this['_fun_out']['getChildByName']('autohu');
                        this['refreshFuncBtnShow'](I, p, view['DesktopMgr'].Inst['auto_hule']);
                        var L = this['_fun_in']['getChildByName']('btn_autonoming'),
                        R = this['_fun_out']['getChildByName']('autonoming');
                        this['refreshFuncBtnShow'](L, R, view['DesktopMgr'].Inst['auto_nofulu']);
                        var E = this['_fun_in']['getChildByName']('btn_automoqie'),
                        V = this['_fun_out']['getChildByName']('automoqie');
                        this['refreshFuncBtnShow'](E, V, view['DesktopMgr'].Inst['auto_moqie']),
                        this['_container_fun'].x = -546,
                        this['_fun_in']['visible'] = !1,
                        this['_fun_out']['visible'] = !0; {
                            var d = this['_fun_out']['getChildByName']('btn_func');
                            this['_fun_out']['getChildByName']('btn_func2');
                        }
                        d['disabled'] = !1,
                        d['disabled'] = !1;
                    },
                    E['prototype']['setDora'] = function (B, C) {
                        if (0 > B || B >= this['doras']['length'])
                            return console['error']('setDora pos错误'), void 0;
                        var z = 'myres2/mjpm/' + (C['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                        this['doras'][B].skin = game['Tools']['localUISrc'](z + C['toString'](!1) + '.png'),
                        this['front_doras'][B]['visible'] = !C['touming'],
                        this['front_doras'][B].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                    },
                    E['prototype']['initRoom'] = function () {
                        var C = this;
                        if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                            for (var z = {}, e = 0; e < view['DesktopMgr'].Inst['player_datas']['length']; e++) {
                                for (var I = view['DesktopMgr'].Inst['player_datas'][e]['character'], p = I['charid'], L = cfg['item_definition']['character'].find(p).emo, R = 0; 9 > R; R++) {
                                    var E = L + '/' + R['toString']() + '.png';
                                    z[E] = 1;
                                }
                                if (I['extra_emoji'])
                                    for (var R = 0; R < I['extra_emoji']['length']; R++) {
                                        var E = L + '/' + I['extra_emoji'][R]['toString']() + '.png';
                                        z[E] = 1;
                                    }
                            }
                            var V = [];
                            for (var d in z)
                                V.push(d);
                            this['block_emo'].me.x = 1878,
                            this['block_emo']['reset'](),
                            game['LoadMgr']['loadResImage'](V, Laya['Handler']['create'](this, function () {
                                    C['block_emo']['initRoom']();
                                })),
                            this['_btn_collect']['visible'] = !1;
                        } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                            this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                        else {
                            for (var f = !1, e = 0; e < view['DesktopMgr'].Inst['player_datas']['length']; e++) {
                                var A = view['DesktopMgr'].Inst['player_datas'][e];
                                if (A && null != A['account_id'] && A['account_id'] == GameMgr.Inst['account_id']) {
                                    f = !0;
                                    break;
                                }
                            }
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                            this['_btn_collect']['visible'] = f;
                        }
                        if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            for (var O = 0, e = 0; e < view['DesktopMgr'].Inst['player_datas']['length']; e++) {
                                var A = view['DesktopMgr'].Inst['player_datas'][e];
                                A && null != A['account_id'] && 0 != A['account_id'] && O++;
                            }
                            1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                        }
                        for (var Y = 0, e = 0; e < view['DesktopMgr'].Inst['player_datas']['length']; e++) {
                            var A = view['DesktopMgr'].Inst['player_datas'][e];
                            A && null != A['account_id'] && 0 != A['account_id'] && Y++;
                        }
                        this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                        this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                        this['enable'] = !0,
                        this['setLiqibang'](0),
                        this['setBen'](0);
                        var h = this.me['getChildByName']('container_lefttop');
                        if (h['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                            h['getChildByName']('num_lizhi_0')['visible'] = !1, h['getChildByName']('num_lizhi_1')['visible'] = !1, h['getChildByName']('num_ben_0')['visible'] = !1, h['getChildByName']('num_ben_1')['visible'] = !1, h['getChildByName']('container_doras')['visible'] = !1, h['getChildByName']('gamemode')['visible'] = !1, h['getChildByName']('activitymode')['visible'] = !0, h['getChildByName']('MD5').y = 63, h['getChildByName']('MD5')['width'] = 239, h['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), h['getChildAt'](0)['width'] = 280, h['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (h['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, h['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (h['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), h['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), h['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, h['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                        else if (h['getChildByName']('num_lizhi_0')['visible'] = !0, h['getChildByName']('num_lizhi_1')['visible'] = !1, h['getChildByName']('num_ben_0')['visible'] = !0, h['getChildByName']('num_ben_1')['visible'] = !0, h['getChildByName']('container_doras')['visible'] = !0, h['getChildByName']('gamemode')['visible'] = !0, h['getChildByName']('activitymode')['visible'] = !1, h['getChildByName']('MD5').y = 51, h['getChildByName']('MD5')['width'] = 276, h['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), h['getChildAt'](0)['width'] = 313, h['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                            var Z = view['DesktopMgr'].Inst['game_config'],
                            j = game['Tools']['get_room_desc'](Z);
                            this['label_gamemode'].text = j.text,
                            this['container_gamemode']['visible'] = !0;
                        } else
                            this['container_gamemode']['visible'] = !1;
                        if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                            if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                this['container_jjc']['visible'] = !0,
                                this['label_jjc_win'].text = B['UI_Activity_JJC']['win_count']['toString']();
                                for (var e = 0; 3 > e; e++)
                                    this['container_jjc']['getChildByName'](e['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (B['UI_Activity_JJC']['lose_count'] > e ? 'd' : 'l') + '.png');
                            } else
                                this['container_jjc']['visible'] = !1;
                        else
                            this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                        B['UI_Replay'].Inst && (B['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                        var D = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                        K = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                        view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (B['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](D, !0), game['Tools']['setGrayDisable'](K, !0)) : (game['Tools']['setGrayDisable'](D, !1), game['Tools']['setGrayDisable'](K, !1), B['UI_Astrology'].Inst.hide());
                        for (var e = 0; 4 > e; e++)
                            this['_player_infos'][e]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][e]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][e]['yongchang'].hide();
                    },
                    E['prototype']['onCloseRoom'] = function () {
                        this['_network_delay']['close_refresh']();
                    },
                    E['prototype']['refreshSeat'] = function (B) {
                        void 0 === B && (B = !1);
                        for (var C = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), z = 0; 4 > z; z++) {
                            var e = view['DesktopMgr'].Inst['localPosition2Seat'](z),
                            I = this['_player_infos'][z];
                            if (0 > e)
                                I['container']['visible'] = !1;
                            else {
                                I['container']['visible'] = !0;
                                var p = view['DesktopMgr'].Inst['getPlayerName'](e);
                                game['Tools']['SetNickname'](I.name, p, !1, !0),
                                I.head.id = C[e]['avatar_id'],
                                I.head['set_head_frame'](C[e]['account_id'], C[e]['avatar_frame']);
                                var L = (cfg['item_definition'].item.get(C[e]['avatar_frame']), cfg['item_definition'].view.get(C[e]['avatar_frame']));
                                if (I.head.me.y = L && L['sargs'][0] ? I['head_origin_y'] - Number(L['sargs'][0]) / 100 * this['head_offset_y'] : I['head_origin_y'], I['avatar'] = C[e]['avatar_id'], 0 != z) {
                                    var R = C[e]['account_id'] && 0 != C[e]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                    E = C[e]['account_id'] && 0 != C[e]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                    V = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                    B ? I['headbtn']['onChangeSeat'](R, E, V) : I['headbtn']['reset'](R, E, V);
                                }
                                I['title'].id = C[e]['title'] ? game['Tools']['titleLocalization'](C[e]['account_id'], C[e]['title']) : 0;
                            }
                        }
                    },
                    E['prototype']['refreshNames'] = function () {
                        for (var B = 0; 4 > B; B++) {
                            var C = view['DesktopMgr'].Inst['localPosition2Seat'](B),
                            z = this['_player_infos'][B];
                            if (0 > C)
                                z['container']['visible'] = !1;
                            else {
                                z['container']['visible'] = !0;
                                var e = view['DesktopMgr'].Inst['getPlayerName'](C);
                                game['Tools']['SetNickname'](z.name, e, !1, !0);
                            }
                        }
                    },
                    E['prototype']['refreshLinks'] = function () {
                        for (var B = (view['DesktopMgr'].Inst.seat, 0); 4 > B; B++) {
                            var C = view['DesktopMgr'].Inst['localPosition2Seat'](B);
                            view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][B]['disconnect']['visible'] = -1 == C || 0 == B ? !1 : view['DesktopMgr']['player_link_state'][C] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][B]['disconnect']['visible'] = -1 == C || 0 == view['DesktopMgr'].Inst['player_datas'][C]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][C] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][B]['disconnect']['visible'] = !1);
                        }
                    },
                    E['prototype']['setBen'] = function (B) {
                        B > 99 && (B = 99);
                        var C = this.me['getChildByName']('container_lefttop'),
                        z = C['getChildByName']('num_ben_0'),
                        e = C['getChildByName']('num_ben_1');
                        B >= 10 ? (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 10)['toString']() + '.png'), e.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), e['visible'] = !0) : (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), e['visible'] = !1);
                    },
                    E['prototype']['setLiqibang'] = function (B, C) {
                        void 0 === C && (C = !0),
                        B > 999 && (B = 999);
                        var z = this.me['getChildByName']('container_lefttop'),
                        e = z['getChildByName']('num_lizhi_0'),
                        I = z['getChildByName']('num_lizhi_1'),
                        p = z['getChildByName']('num_lizhi_2');
                        B >= 100 ? (p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), I.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](B / 10) % 10)['toString']() + '.png'), e.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 100)['toString']() + '.png'), I['visible'] = !0, p['visible'] = !0) : B >= 10 ? (I.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), e.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 10)['toString']() + '.png'), I['visible'] = !0, p['visible'] = !1) : (e.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + B['toString']() + '.png'), I['visible'] = !1, p['visible'] = !1),
                        view['DesktopMgr'].Inst['setRevealScore'](B, C);
                    },
                    E['prototype']['reset_rounds'] = function () {
                        this['closeCountDown'](),
                        this['showscoredeltaing'] = !1,
                        view['DesktopMgr'].Inst['setScoreDelta'](!1);
                        for (var B = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, C = 0; C < this['doras']['length']; C++)
                            if (this['front_doras'][C].skin = '', this['doras'][C].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                this['front_doras'][C]['visible'] = !1, this['doras'][C].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                            else {
                                var z = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                this['front_doras'][C]['visible'] = !0,
                                this['doras'][C].skin = game['Tools']['localUISrc'](z + '5z.png'),
                                this['front_doras'][C].skin = game['Tools']['localUISrc'](B + 'back.png');
                            }
                        for (var C = 0; 4 > C; C++)
                            this['_player_infos'][C].emo['reset'](), this['_player_infos'][C].que['visible'] = !1;
                        this['_timecd']['reset'](),
                        Laya['timer']['clearAll'](this),
                        Laya['timer']['clearAll'](this['label_md5']),
                        view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                        this['label_md5']['visible'] = !1;
                    },
                    E['prototype']['showCountDown'] = function (B, C) {
                        this['_timecd']['showCD'](B, C);
                    },
                    E['prototype']['setZhenting'] = function (B) {
                        this['img_zhenting']['visible'] = B;
                    },
                    E['prototype']['shout'] = function (B, C, z, e) {
                        app.Log.log('shout:' + B + ' type:' + C);
                        try {
                            var I = this['_player_infos'][B],
                            p = I['container_shout'],
                            L = p['getChildByName']('img_content'),
                            R = p['getChildByName']('illust')['getChildByName']('illust'),
                            E = p['getChildByName']('img_score');
                            if (0 == e)
                                E['visible'] = !1;
                            else {
                                E['visible'] = !0;
                                var V = 0 > e ? 'm' + Math.abs(e) : e;
                                E.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + V + '.png');
                            }
                            '' == C ? L['visible'] = !1 : (L['visible'] = !0, L.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + C + '.png')),
                            view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (p['getChildByName']('illust')['visible'] = !1, p['getChildAt'](2)['visible'] = !0, p['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](p['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (p['getChildByName']('illust')['visible'] = !0, p['getChildAt'](2)['visible'] = !1, p['getChildAt'](0)['visible'] = !0, R['scaleX'] = 1, game['Tools']['charaPart'](z['avatar_id'], R, 'full', I['illustrect'], !0, !0));
                            var d = 0,
                            f = 0;
                            switch (B) {
                            case 0:
                                d = -105,
                                f = 0;
                                break;
                            case 1:
                                d = 500,
                                f = 0;
                                break;
                            case 2:
                                d = 0,
                                f = -300;
                                break;
                            default:
                                d = -500,
                                f = 0;
                            }
                            p['visible'] = !0,
                            p['alpha'] = 0,
                            p.x = I['shout_origin_x'] + d,
                            p.y = I['shout_origin_y'] + f,
                            Laya['Tween'].to(p, {
                                alpha: 1,
                                x: I['shout_origin_x'],
                                y: I['shout_origin_y']
                            }, 70),
                            Laya['Tween'].to(p, {
                                alpha: 0
                            }, 150, null, null, 600),
                            Laya['timer'].once(800, this, function () {
                                Laya['loader']['clearTextureRes'](R.skin),
                                p['visible'] = !1;
                            });
                        } catch (A) {
                            var O = {};
                            O['error'] = A['message'],
                            O['stack'] = A['stack'],
                            O['method'] = 'shout',
                            O['class'] = 'UI_DesktopInfos',
                            GameMgr.Inst['onFatalError'](O);
                        }
                    },
                    E['prototype']['closeCountDown'] = function () {
                        this['_timecd']['close']();
                    },
                    E['prototype']['refreshFuncBtnShow'] = function (B, C, z) {
                        var e = B['getChildByName']('img_choosed');
                        C['color'] = B['mouseEnabled'] ? z ? '#3bd647' : '#7992b3' : '#565656',
                        e['visible'] = z;
                    },
                    E['prototype']['onShowEmo'] = function (B, C) {
                        var z = this['_player_infos'][B];
                        0 != B && z['headbtn']['emj_banned'] || z.emo.show(B, C);
                    },
                    E['prototype']['changeHeadEmo'] = function (B) { {
                            var C = view['DesktopMgr'].Inst['seat2LocalPosition'](B);
                            this['_player_infos'][C];
                        }
                    },
                    E['prototype']['onBtnShowScoreDelta'] = function () {
                        var B = this;
                        this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                B['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                    },
                    E['prototype']['btn_seeinfo'] = function (C) {
                        if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                            var z = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](C)]['account_id'];
                            if (z) {
                                var e = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                I = 1,
                                p = view['DesktopMgr'].Inst['game_config'].meta;
                                p && p['mode_id'] == game['EMatchMode']['shilian'] && (I = 4);
                                var L = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](C));
                                B['UI_OtherPlayerInfo'].Inst.show(z, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, e ? 1 : 2, I, L['nickname']);
                            }
                        }
                    },
                    E['prototype']['openDora3BeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openPeipaiOpenBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openDora3BeginShine'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](244),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openMuyuOpenBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openShilianOpenBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openXiuluoOpenBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openChuanmaBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openJiuChaoBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openAnPaiBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openTopMatchOpenBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openZhanxingBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openTianmingBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['openYongchangBeginEffect'] = function () {
                        var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, B, function () {
                            B['destory']();
                        });
                    },
                    E['prototype']['logUpEmoInfo'] = function () {
                        this['block_emo']['sendEmoLogUp'](),
                        this['min_double_time'] = 0,
                        this['max_double_time'] = 0;
                    },
                    E['prototype']['onCollectChange'] = function () {
                        this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                    },
                    E['prototype']['showAIEmo'] = function () {
                        for (var B = this, C = function (C) {
                            var e = view['DesktopMgr'].Inst['player_datas'][C];
                            e['account_id'] && 0 != e['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), z, function () {
                                B['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](C), Math['floor'](9 * Math['random']()));
                            });
                        }, z = this, e = 0; e < view['DesktopMgr'].Inst['player_datas']['length']; e++)
                            C(e);
                    },
                    E['prototype']['setGapType'] = function (B, C) {
                        void 0 === C && (C = !1);
                        for (var z = 0; z < B['length']; z++) {
                            var e = view['DesktopMgr'].Inst['seat2LocalPosition'](z);
                            this['_player_infos'][e].que['visible'] = !0,
                            C && (0 == z ? (this['_player_infos'][e].que.pos(this['gapStartPosLst'][z].x + this['selfGapOffsetX'][B[z]], this['gapStartPosLst'][z].y), this['_player_infos'][e].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][e].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][e]['que_target_pos'].x,
                                        y: this['_player_infos'][e]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][e].que.pos(this['gapStartPosLst'][z].x, this['gapStartPosLst'][z].y), this['_player_infos'][e].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][e].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][e]['que_target_pos'].x,
                                        y: this['_player_infos'][e]['que_target_pos'].y
                                    }, 200))),
                            this['_player_infos'][e].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + B[z] + '.png');
                        }
                    },
                    E['prototype']['OnNewCard'] = function (B, C) {
                        if (C) {
                            var z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                            Laya['timer'].once(5000, z, function () {
                                z['destory']();
                            }),
                            Laya['timer'].once(1300, this, function () {
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                            });
                        } else
                            this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                    },
                    E['prototype']['ShowSpellCard'] = function (C, z) {
                        void 0 === z && (z = !1),
                        B['UI_FieldSpell'].Inst && !B['UI_FieldSpell'].Inst['enable'] && B['UI_FieldSpell'].Inst.show(C, z);
                    },
                    E['prototype']['HideSpellCard'] = function () {
                        B['UI_FieldSpell'].Inst && B['UI_FieldSpell'].Inst['close']();
                    },
                    E['prototype']['SetTianMingRate'] = function (B, C, z) {
                        void 0 === z && (z = !1);
                        var e = view['DesktopMgr'].Inst['seat2LocalPosition'](B),
                        I = this['_player_infos'][e]['tianming'];
                        z && 5 != C && I.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + C + '.png') && Laya['Tween'].to(I, {
                            scaleX: 1.1,
                            scaleY: 1.1
                        }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(I, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                        I.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + C + '.png');
                    },
                    E['prototype']['ResetYongChang'] = function () {
                        for (var B = 0; 4 > B; B++)
                            this['_player_infos'][B]['yongchang']['resetToStart']();
                    },
                    E['prototype']['SetYongChangRate'] = function (B, C, z, e, I, p) {
                        this['_player_infos'][B]['yongchang'].show(C, z, e, I, p);
                    },
                    E.Inst = null,
                    E;
                }
                (B['UIBase']);
                B['UI_DesktopInfo'] = R;
            }
            (uiscript || (uiscript = {}));
            










            uiscript.UI_Info.Init  = function () {
                // 设置名称
                if (MMP.settings.nickname != '') {
                    GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
                }
                // END
        var C = this,
        z = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
        this['read_list'] = [],
        app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
            lang: z,
            platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
        }, function (z, e) {
            z || e['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', z, e) : C['_refreshAnnouncements'](e);
                        // START
                        if ((z || e['error']) === null) {
                            if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                                uiscript.UI_Info.Inst.show();
                                MMP.settings.isReadme = true;
                                MMP.settings.version = GM_info['script']['version'];
                                MMP.saveSettings();
                            }
                        }
                        // END
        }),
        app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (B) {
                for (var e = GameMgr['inDmm'] ? 'web_dmm' : 'web', I = 0, p = B['update_list']; I < p['length']; I++) {
                    var L = p[I];
                    if (L.lang == z && L['platform'] == e) {
                        C['have_new_notice'] = !0;
                        break;
                    }
                }
            }, null, !1));
    }
    
    uiscript.UI_Info._refreshAnnouncements = function (B) {
        // START
        B.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
        // END
if (B['announcements'] && (this['announcements'] = B['announcements']), B.sort && (this['announcement_sort'] = B.sort), B['read_list']) {
    this['read_list'] = [];
    for (var C = 0; C < B['read_list']['length']; C++)
        this['read_list'].push(B['read_list'][C]);
            this.read_list.splice(0, 0, 666666, 777777);
}
}










        // 加载CG 
        !function (B) {
            var C = function () {
                function C(C, z) {
                    var e = this;
                    this['cg_id'] = 0,
                    this.me = C,
                    this['father'] = z;
                    var I = this.me['getChildByName']('btn_detail');
                    I['clickHandler'] = new Laya['Handler'](this, function () {
                        B['UI_Bag'].Inst['locking'] || e['father']['changeLoadingCG'](e['cg_id']);
                    }),
                    game['Tools']['setButtonLongPressHandler'](I, new Laya['Handler'](this, function (C) {
                            if (!B['UI_Bag'].Inst['locking']) {
                                'down' == C ? Laya['timer'].once(800, e, function () {
                                    B['UI_CG_Yulan'].Inst.show(e['cg_id']);
                                }) : ('over' == C || 'up' == C) && Laya['timer']['clearAll'](e);
                            }
                        })),
                    this['using'] = I['getChildByName']('using'),
                    this.icon = I['getChildByName']('icon'),
                    this.name = I['getChildByName']('name'),
                    this.info = I['getChildByName']('info'),
                    this['label_time'] = this.info['getChildByName']('info'),
                    this['sprite_new'] = I['getChildByName']('new');
                }
                return C['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var C = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != B['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                    game['LoadMgr']['setImgSkin'](this.icon, C['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var z = !this['father']['last_seen_cg_map'][this['cg_id']], e = 0, I = C['unlock_items']; e < I['length']; e++) {
                        var p = I[e];
                        if (p && B['UI_Bag']['get_item_count'](p) > 0) {
                            var L = cfg['item_definition'].item.get(p);
                            if (this.name.text = L['name_' + GameMgr['client_language']], !L['item_expire']) {
                                this.info['visible'] = !1,
                                z = -1 != this['father']['new_cg_ids']['indexOf'](p);
                                break;
                            }
                            this.info['visible'] = !0,
                            this['label_time'].text = game['Tools']['strOfLocalization'](3119) + L['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = z;
                },
                C['prototype']['reset'] = function () {
                    game['LoadMgr']['clearImgSkin'](this.icon),
                    Laya['Loader']['clearTextureRes'](this.icon.skin);
                },
                C;
            }
            (),
            z = function () {
                function z(C) {
                    var z = this;
                    this['seen_cg_map'] = null,
                    this['last_seen_cg_map'] = null,
                    this['new_cg_ids'] = [],
                    this.me = C,
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                    this['no_info'] = this.me['getChildByName']('no_info'),
                    this.head = this.me['getChildByName']('head');
                    var e = this.me['getChildByName']('choose');
                    this['label_choose_all'] = e['getChildByName']('tip'),
                    e['clickHandler'] = new Laya['Handler'](this, function () {
                        if (z['all_choosed'])
                            B['UI_Loading']['Loading_Images'] = [];
                        else {
                            B['UI_Loading']['Loading_Images'] = [];
                            for (var C = 0, e = z['items']; C < e['length']; C++) {
                                var I = e[C];
                                B['UI_Loading']['Loading_Images'].push(I.id);
                            }
                        }
                        z['scrollview']['wantToRefreshAll'](),
                        z['refreshChooseState']();
                                        // START
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                        //    images: B['UI_Loading']['Loading_Images']
                        //}, function (C, z) {
                        //    (C || z['error']) && B['UIMgr'].Inst['showNetReqError']('setLoadingImage', C, z);
                        //});
                                        // END
                    });
                }
                return z['prototype']['have_redpoint'] = function () {
                                // START
                    //if (B['UI_Bag']['new_cg_ids']['length'] > 0)
                    //    return !0;
                                // END
                    var C = [];
                    if (!this['seen_cg_map']) {
                        var z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, z) {
                            z = game['Tools']['dddsss'](z);
                            for (var e = z['split'](','), I = 0; I < e['length']; I++)
                                this['seen_cg_map'][Number(e[I])] = 1;
                        }
                    }
                    cfg['item_definition']['loading_image']['forEach'](function (z) {
                        if (z['unlock_items'][1] && 0 == B['UI_Bag']['get_item_count'](z['unlock_items'][0]) && B['UI_Bag']['get_item_count'](z['unlock_items'][1]) > 0) {
                            if (GameMgr['regionLimited']) {
                                var e = cfg['item_definition'].item.get(z['unlock_items'][1]);
                                if (1 == e['region_limit'])
                                    return;
                            }
                            C.push(z.id);
                        }
                    });
                    for (var p = 0, L = C; p < L['length']; p++) {
                        var R = L[p];
                        if (!this['seen_cg_map'][R])
                            return !0;
                    }
                    return !1;
                },
                z['prototype'].show = function () {
                    var C = this;
                    if (this['new_cg_ids'] = B['UI_Bag']['new_cg_ids'], B['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                        var z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, z) {
                            z = game['Tools']['dddsss'](z);
                            for (var e = z['split'](','), I = 0; I < e['length']; I++)
                                this['seen_cg_map'][Number(e[I])] = 1;
                        }
                    }
                    this['last_seen_cg_map'] = this['seen_cg_map'];
                    var p = '';
                    cfg['item_definition']['loading_image']['forEach'](function (z) {
                        for (var e = 0, I = z['unlock_items']; e < I['length']; e++) {
                            var L = I[e];
                            if (L && B['UI_Bag']['get_item_count'](L) > 0) {
                                var R = cfg['item_definition'].item.get(L);
                                if (1 == R['region_limit'] && GameMgr['regionLimited'])
                                    continue;
                                return C['items'].push(z),
                                C['seen_cg_map'][z.id] = 1,
                                '' != p && (p += ','),
                                p += z.id,
                                void 0;
                            }
                        }
                    }),
                    this['items'].sort(function (B, C) {
                        return C.sort - B.sort;
                    }),
                    Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](p)),
                    B['UI_Bag'].Inst['refreshRedpoint'](),
                    this.me['visible'] = !0,
                    this.me['getChildByName']('choose')['visible'] = 0 != this['items']['length'],
                    this['scrollview']['addItem'](this['items']['length']),
                    game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                    this['no_info']['visible'] = 0 == this['items']['length'],
                    this.head['visible'] = 0 != this['items']['length'],
                    this['_changed'] = !1,
                    this['refreshChooseState']();
                },
                z['prototype']['close'] = function () {
                    this.me['visible'] = !1,
                    this['items'] = [],
                    this['scrollview']['reset'](),
                    game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                    this['_changed'] && B['UI_Loading']['loadNextCG']();
                },
                z['prototype']['render_item'] = function (B) {
                    var z = B['index'],
                    e = B['container'],
                    I = B['cache_data'];
                    if (this['items'][z]) {
                        I.item || (I.item = new C(e, this));
                        var p = I.item;
                        p['cg_id'] = this['items'][z].id,
                        p.show();
                    }
                },
                z['prototype']['changeLoadingCG'] = function (C) {
                    this['_changed'] = !0;
                    for (var z = 0, e = 0, I = 0, p = this['items']; I < p['length']; I++) {
                        var L = p[I];
                        if (L.id == C) {
                            z = e;
                            break;
                        }
                        e++;
                    }
                    var R = B['UI_Loading']['Loading_Images']['indexOf'](C);
                    -1 == R ? B['UI_Loading']['Loading_Images'].push(C) : B['UI_Loading']['Loading_Images']['splice'](R, 1),
                    this['scrollview']['wantToRefreshItem'](z),
                    this['refreshChooseState'](),
                                        // START
                                        MMP.settings.loadingCG = B['UI_Loading']['Loading_Images'];
                                    MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                    //    images: B['UI_Loading']['Loading_Images']
                    //}, function (C, z) {
                    //    (C || z['error']) && B['UIMgr'].Inst['showNetReqError']('setLoadingImage', C, z);
                    //});
                                    // END
                },
                z['prototype']['refreshChooseState'] = function () {
                    this['all_choosed'] = B['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                    this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                },
                z['prototype']['when_update_data'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                z;
            }
            ();
            B['UI_Bag_PageCG'] = z;
        }
        (uiscript || (uiscript = {}));
        



        // 懒b作者终于修复了对局结束变婚皮的问题 
        uiscript.UI_MJReward.prototype.show= function (C) {
            // START
            view['DesktopMgr'].Inst['rewardinfo']['main_character'] = {
                "level": 5,
                "exp": 0,
                "add": 0
            }
            var B = uiscript;
            // END
    var z = this,
    e = view['DesktopMgr'].Inst['rewardinfo'];
    this['page_jiban'].me['visible'] = !1,
    this['page_jiban_gift'].me['visible'] = !1,
    this['complete'] = C,
    this['page_box'].show(),
    B['UIBase']['anim_alpha_in'](this['page_box'].me, {
        x: -50
    }, 150),
    e['main_character'] ? (this['page_jiban'].show(), B['UIBase']['anim_alpha_in'](this['page_jiban'].me, {
            x: -50
        }, 150, 60)) : e['character_gift'] && (this['page_jiban_gift'].show(), B['UIBase']['anim_alpha_in'](this['page_jiban_gift'].me, {
            x: -50
        }, 150, 60)),
    Laya['timer'].once(600, this, function () {
        var B = 0;
        z['page_box']['doanim'](Laya['Handler']['create'](z, function () {
                B++,
                2 == B && z['showGrade'](C);
            })),
        e['main_character'] ? z['page_jiban']['doanim'](Laya['Handler']['create'](z, function () {
                B++,
                2 == B && z['showGrade'](C);
            })) : e['character_gift'] ? z['page_jiban_gift']['doanim'](Laya['Handler']['create'](z, function () {
                B++,
                2 == B && z['showGrade'](C);
            })) : (B++, 2 == B && z['showGrade'](C));
    }),
    this['enable'] = !0;
}






uiscript.UI_Entrance.prototype._onLoginSuccess = function (C, z, e) {
    var B = uiscript;
var I = this;
if (void 0 === e && (e = !1), app.Log.log('登陆：' + JSON['stringify'](z)), GameMgr.Inst['account_id'] = z['account_id'], GameMgr.Inst['account_data'] = z['account'], B['UI_ShiMingRenZheng']['renzhenged'] = z['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, z['account']['platform_diamond'])
for (var p = z['account']['platform_diamond'], L = 0; L < p['length']; L++)
    GameMgr.Inst['account_numerical_resource'][p[L].id] = p[L]['count'];
if (z['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = z['account']['skin_ticket']), z['account']['platform_skin_ticket'])
for (var R = z['account']['platform_skin_ticket'], L = 0; L < R['length']; L++)
    GameMgr.Inst['account_numerical_resource'][R[L].id] = R[L]['count'];
GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
z['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = z['game_info']['location'], GameMgr.Inst['mj_game_token'] = z['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = z['game_info']['game_uuid']),
z['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : C['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', z['access_token']), GameMgr.Inst['sociotype'] = C, GameMgr.Inst['access_token'] = z['access_token']);
var E = this,
V = function () {
GameMgr.Inst['onLoadStart']('login'),
Laya['LocalStorage']['removeItem']('__ad_s'),
B['UI_Loading'].Inst.show('load_lobby'),
E['enable'] = !1,
E['scene']['close'](),
B['UI_Entrance_Mail_Regist'].Inst['close'](),
E['login_loading']['close'](),
B['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](E, function () {
        GameMgr.Inst['afterLogin'](),
        E['route_info']['onClose'](),
        GameMgr.Inst['account_data']['anti_addiction'] && B['UIMgr'].Inst['ShowPreventAddiction'](),
        E['destroy'](),
        E['disposeRes'](),
        B['UI_Add2Desktop'].Inst && (B['UI_Add2Desktop'].Inst['destroy'](), B['UI_Add2Desktop'].Inst = null);
    }), Laya['Handler']['create'](E, function (C) {
        return B['UI_Loading'].Inst['setProgressVal'](0.2 * C);
    }, null, !1));
},
d = Laya['Handler']['create'](this, function () {
0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (C, z) {
    C ? (app.Log.log('fetchRefundOrder err:' + C), I['showError'](game['Tools']['strOfLocalization'](2061), C), I['showContainerLogin']()) : (B['UI_Refund']['orders'] = z['orders'], B['UI_Refund']['clear_deadline'] = z['clear_deadline'], B['UI_Refund']['message'] = z['message'], V());
}) : V();
});
    // START
//if (B['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
//    for (var f = 0, A = GameMgr.Inst['account_data']['loading_image']; f < A['length']; f++) {
//        var O = A[f];
//        cfg['item_definition']['loading_image'].get(O) && B['UI_Loading']['Loading_Images'].push(O);
//    }
    uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
    // END
B['UI_Loading']['loadNextCG'](),
'chs' != GameMgr['client_type'] || z['account']['phone_verify'] ? d.run() : (B['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, B['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
        app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (C, z) {
            C || z['error'] ? I['showError'](C, z['error']) : 0 == z['phone_login'] ? B['UI_Create_Phone_Account'].Inst.show(d) : B['UI_Canot_Create_Phone_Account'].Inst.show(d);
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
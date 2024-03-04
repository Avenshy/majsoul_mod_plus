// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.11.28
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
        !function (H) {
            var F;
            !function (H) {
                H[H.none = 0] = 'none',
                    H[H['daoju'] = 1] = 'daoju',
                    H[H.gift = 2] = 'gift',
                    H[H['fudai'] = 3] = 'fudai',
                    H[H.view = 5] = 'view';
            }
                (F = H['EItemCategory'] || (H['EItemCategory'] = {}));
            var z = function (z) {
                function O() {
                    var H = z.call(this, new ui['lobby']['bagUI']()) || this;
                    return H['container_top'] = null,
                        H['container_content'] = null,
                        H['locking'] = !1,
                        H.tabs = [],
                        H['page_item'] = null,
                        H['page_gift'] = null,
                        H['page_skin'] = null,
                        H['page_cg'] = null,
                        H['select_index'] = 0,
                        O.Inst = H,
                        H;
                }
                return __extends(O, z),
                    O.init = function () {
                        var H = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (F) {
                            var z = F['update'];
                            z && z.bag && (H['update_data'](z.bag['update_items']), H['update_daily_gain_data'](z.bag));
                        }, null, !1)),
                            //GameMgr.Inst['use_fetch_info'] || 
                            this['fetch']();
                    },
                    O['fetch'] = function () {
                        var F = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (z, O) {
                                if (z || O['error'])
                                    H['UIMgr'].Inst['showNetReqError']('fetchBagInfo', z, O);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](O));
                                    var K = O.bag;
                                    if (K) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of K["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            F._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    F._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (K['items'])
                                                for (var v = 0; v < K['items']['length']; v++) {
                                                    var W = K['items'][v]['item_id'],
                                                        L = K['items'][v]['stack'],
                                                        E = cfg['item_definition'].item.get(W);
                                                    E && (F['_item_map'][W] = {
                                                        item_id: W,
                                                        count: L,
                                                        category: E['category']
                                                    }, 1 == E['category'] && 3 == E.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: W
                                                    }, function () { }));
                                                }
                                            if (K['daily_gain_record'])
                                                for (var l = K['daily_gain_record'], v = 0; v < l['length']; v++) {
                                                    var a = l[v]['limit_source_id'];
                                                    F['_daily_gain_record'][a] = {};
                                                    var S = l[v]['record_time'];
                                                    F['_daily_gain_record'][a]['record_time'] = S;
                                                    var V = l[v]['records'];
                                                    if (V)
                                                        for (var d = 0; d < V['length']; d++)
                                                            F['_daily_gain_record'][a][V[d]['item_id']] = V[d]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    O['onFetchSuccess'] = function (H) {
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {};
                        var F = H['bag_info'];
                        if (F) {
                            var z = F.bag;
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
                                        for (var O = 0; O < z['items']['length']; O++) {
                                            var K = z['items'][O]['item_id'],
                                                v = z['items'][O]['stack'],
                                                W = cfg['item_definition'].item.get(K);
                                            W && (this['_item_map'][K] = {
                                                item_id: K,
                                                count: v,
                                                category: W['category']
                                            }, 1 == W['category'] && 3 == W.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: K
                                            }, function () { }));
                                        }
                                    if (z['daily_gain_record'])
                                        for (var L = z['daily_gain_record'], O = 0; O < L['length']; O++) {
                                            var E = L[O]['limit_source_id'];
                                            this['_daily_gain_record'][E] = {};
                                            var l = L[O]['record_time'];
                                            this['_daily_gain_record'][E]['record_time'] = l;
                                            var a = L[O]['records'];
                                            if (a)
                                                for (var S = 0; S < a['length']; S++)
                                                    this['_daily_gain_record'][E][a[S]['item_id']] = a[S]['count'];
                                        }
                                }
                            }
                        }
                    },
                    O['find_item'] = function (H) {
                        var F = this['_item_map'][H];
                        return F ? {
                            item_id: F['item_id'],
                            category: F['category'],
                            count: F['count']
                        }
                            : null;
                    },
                    O['get_item_count'] = function (H) {
                        var F = this['find_item'](H);
                        if (F)
                            return F['count'];
                        if ('100001' == H) {
                            for (var z = 0, O = 0, K = GameMgr.Inst['free_diamonds']; O < K['length']; O++) {
                                var v = K[O];
                                GameMgr.Inst['account_numerical_resource'][v] && (z += GameMgr.Inst['account_numerical_resource'][v]);
                            }
                            for (var W = 0, L = GameMgr.Inst['paid_diamonds']; W < L['length']; W++) {
                                var v = L[W];
                                GameMgr.Inst['account_numerical_resource'][v] && (z += GameMgr.Inst['account_numerical_resource'][v]);
                            }
                            return z;
                        }
                        if ('100004' == H) {
                            for (var E = 0, l = 0, a = GameMgr.Inst['free_pifuquans']; l < a['length']; l++) {
                                var v = a[l];
                                GameMgr.Inst['account_numerical_resource'][v] && (E += GameMgr.Inst['account_numerical_resource'][v]);
                            }
                            for (var S = 0, V = GameMgr.Inst['paid_pifuquans']; S < V['length']; S++) {
                                var v = V[S];
                                GameMgr.Inst['account_numerical_resource'][v] && (E += GameMgr.Inst['account_numerical_resource'][v]);
                            }
                            return E;
                        }
                        return '100002' == H ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    O['find_items_by_category'] = function (H, F) {
                        var z = [];
                        for (var O in this['_item_map'])
                            this['_item_map'][O]['category'] == H && this['_item_map'][O]['count'] && z.push({
                                item_id: this['_item_map'][O]['item_id'],
                                category: this['_item_map'][O]['category'],
                                count: this['_item_map'][O]['count']
                            });
                        return F && z.sort(function (H, z) {
                            return cfg['item_definition'].item.get(H['item_id'])[F] - cfg['item_definition'].item.get(z['item_id'])[F];
                        }),
                            z;
                    },
                    O['update_data'] = function (F) {
                        for (var z = 0; z < F['length']; z++) {
                            var O = F[z]['item_id'],
                                K = F[z]['stack'];
                            if (K > 0) {
                                this['_item_map']['hasOwnProperty'](O['toString']()) ? this['_item_map'][O]['count'] = K : this['_item_map'][O] = {
                                    item_id: O,
                                    count: K,
                                    category: cfg['item_definition'].item.get(O)['category']
                                };
                                var v = cfg['item_definition'].item.get(O);
                                1 == v['category'] && 3 == v.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: O
                                }, function () { }),
                                    5 == v['category'] && (this['new_bag_item_ids'].push(O), this['new_zhuangban_item_ids'][O] = 1),
                                    8 != v['category'] || v['item_expire'] || this['new_cg_ids'].push(O);
                            } else if (this['_item_map']['hasOwnProperty'](O['toString']())) {
                                var W = cfg['item_definition'].item.get(O);
                                W && 5 == W['category'] && H['UI_Sushe']['on_view_remove'](O),
                                    this['_item_map'][O] = 0,
                                    delete this['_item_map'][O];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var z = 0; z < F['length']; z++) {
                            var O = F[z]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](O['toString']()))
                                for (var L = this['_item_listener'][O], E = 0; E < L['length']; E++)
                                    L[E].run();
                        }
                        for (var z = 0; z < this['_all_item_listener']['length']; z++)
                            this['_all_item_listener'][z].run();
                    },
                    O['update_daily_gain_data'] = function (H) {
                        var F = H['update_daily_gain_record'];
                        if (F)
                            for (var z = 0; z < F['length']; z++) {
                                var O = F[z]['limit_source_id'];
                                this['_daily_gain_record'][O] || (this['_daily_gain_record'][O] = {});
                                var K = F[z]['record_time'];
                                this['_daily_gain_record'][O]['record_time'] = K;
                                var v = F[z]['records'];
                                if (v)
                                    for (var W = 0; W < v['length']; W++)
                                        this['_daily_gain_record'][O][v[W]['item_id']] = v[W]['count'];
                            }
                    },
                    O['get_item_daily_record'] = function (H, F) {
                        return this['_daily_gain_record'][H] ? this['_daily_gain_record'][H]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][H]['record_time']) ? this['_daily_gain_record'][H][F] ? this['_daily_gain_record'][H][F] : 0 : 0 : 0 : 0;
                    },
                    O['add_item_listener'] = function (H, F) {
                        this['_item_listener']['hasOwnProperty'](H['toString']()) || (this['_item_listener'][H] = []),
                            this['_item_listener'][H].push(F);
                    },
                    O['remove_item_listener'] = function (H, F) {
                        var z = this['_item_listener'][H];
                        if (z)
                            for (var O = 0; O < z['length']; O++)
                                if (z[O] === F) {
                                    z[O] = z[z['length'] - 1],
                                        z.pop();
                                    break;
                                }
                    },
                    O['add_all_item_listener'] = function (H) {
                        this['_all_item_listener'].push(H);
                    },
                    O['remove_all_item_listener'] = function (H) {
                        for (var F = this['_all_item_listener'], z = 0; z < F['length']; z++)
                            if (F[z] === H) {
                                F[z] = F[F['length'] - 1],
                                    F.pop();
                                break;
                            }
                    },
                    O['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    O['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    O['removeZhuangBanNew'] = function (H) {
                        for (var F = 0, z = H; F < z['length']; F++) {
                            var O = z[F];
                            delete this['new_zhuangban_item_ids'][O];
                        }
                    },
                    O['checkItemEnough'] = function (H) {
                        for (var F = H['split'](','), z = 0, K = F; z < K['length']; z++) {
                            var v = K[z];
                            if (v) {
                                var W = v['split']('-');
                                if (O['get_item_count'](Number(W[0])) < Number(W[1]))
                                    return !1;
                            }
                        }
                        return !0;
                    },
                    O['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    O['prototype']['onCreate'] = function () {
                        var F = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F.hide(Laya['Handler']['create'](F, function () {
                                    return F['closeHandler'] ? (F['closeHandler'].run(), F['closeHandler'] = null, void 0) : (H['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var z = function (H) {
                            O.tabs.push(O['container_content']['getChildByName']('tabs')['getChildByName']('btn' + H)),
                                O.tabs[H]['clickHandler'] = Laya['Handler']['create'](O, function () {
                                    F['select_index'] != H && F['on_change_tab'](H);
                                }, null, !1);
                        }, O = this, K = 0; 5 > K; K++)
                            z(K);
                        this['page_item'] = new H['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new H['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new H['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new H['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    O['prototype'].show = function (F, z) {
                        var O = this;
                        void 0 === F && (F = 0),
                            void 0 === z && (z = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = z,
                            H['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            H['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                O['locking'] = !1;
                            }),
                            this['on_change_tab'](F),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    O['prototype']['onSkinYuLanBack'] = function () {
                        var F = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            H['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            H['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                F['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    O['prototype'].hide = function (F) {
                        var z = this;
                        this['locking'] = !0,
                            H['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            H['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                z['locking'] = !1,
                                    z['enable'] = !1,
                                    F && F.run();
                            });
                    },
                    O['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    O['prototype']['on_change_tab'] = function (H) {
                        this['select_index'] = H;
                        for (var z = 0; z < this.tabs['length']; z++)
                            this.tabs[z].skin = game['Tools']['localUISrc'](H == z ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[z]['getChildAt'](0)['color'] = H == z ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), H) {
                            case 0:
                                this['page_item'].show(F['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(F.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    O['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    O['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    O['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    O['_item_map'] = {},
                    O['_item_listener'] = {},
                    O['_all_item_listener'] = [],
                    O['_daily_gain_record'] = {},
                    O['new_bag_item_ids'] = [],
                    O['new_zhuangban_item_ids'] = {},
                    O['new_cg_ids'] = [],
                    O.Inst = null,
                    O;
            }
                (H['UIBase']);
            H['UI_Bag'] = z;
        }
            (uiscript || (uiscript = {}));















        // 修改牌桌上角色
        !function (H) {
            var F = function () {
                function F() {
                    var F = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = H['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (H) {
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](H)),
                                F['loaded_player_count'] = H['ready_id_list']['length'],
                                F['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](F['loaded_player_count'], F['real_player_count']);
                        }));
                }
                return Object['defineProperty'](F, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new F() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    F['prototype']['OpenConnect'] = function (F, z, O, K) {
                        var v = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            H['Scene_Lobby'].Inst && H['Scene_Lobby'].Inst['active'] && (H['Scene_Lobby'].Inst['active'] = !1),
                            H['Scene_Huiye'].Inst && H['Scene_Huiye'].Inst['active'] && (H['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                v.url = '',
                                    v['token'] = F,
                                    v['game_uuid'] = z,
                                    v['server_location'] = O,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = O,
                                    GameMgr.Inst['mj_game_token'] = F,
                                    GameMgr.Inst['mj_game_uuid'] = z,
                                    v['playerreconnect'] = K,
                                    v['_setState'](H['EConnectState']['tryconnect']),
                                    v['load_over'] = !1,
                                    v['loaded_player_count'] = 0,
                                    v['real_player_count'] = 0,
                                    v['lb_index'] = 0,
                                    v['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    F['prototype']['reportInfo'] = function () {
                        this['connect_state'] == H['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: H['LobbyNetMgr']['root_id_lst'][H['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    F['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](H['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    F['prototype']['_OnConnent'] = function (F) {
                        app.Log.log('MJNetMgr _OnConnent event:' + F),
                            F == Laya['Event']['CLOSE'] || F == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == H['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == H['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](H['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](H['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2008)), H['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == H['EConnectState']['reconnecting'] && this['_Reconnect']()) : F == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == H['EConnectState']['tryconnect'] || this['connect_state'] == H['EConnectState']['reconnecting']) && ((this['connect_state'] = H['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](H['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    F['prototype']['_Reconnect'] = function () {
                        var F = this;
                        H['LobbyNetMgr'].Inst['connect_state'] == H['EConnectState'].none || H['LobbyNetMgr'].Inst['connect_state'] == H['EConnectState']['disconnect'] ? this['_setState'](H['EConnectState']['disconnect']) : H['LobbyNetMgr'].Inst['connect_state'] == H['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](H['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            F['connect_state'] == H['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + F['reconnect_count']), app['NetAgent']['connect2MJ'](F.url, Laya['Handler']['create'](F, F['_OnConnent'], null, !1), 'local' == F['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    F['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? H['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](H['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && H['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    F['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    F['prototype']['_fetch_gateway'] = function (F) {
                        var z = this;
                        if (H['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= H['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && H['Scene_MJ'].Inst['ForceOut'](), this['_setState'](H['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + F);
                        var O = function (O) {
                            var K = JSON['parse'](O);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + O), K['maintenance'])
                                z['_setState'](H['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && H['Scene_MJ'].Inst['ForceOut']();
                            else if (K['servers'] && K['servers']['length'] > 0) {
                                for (var v = K['servers'], W = H['Tools']['deal_gateway'](v), L = 0; L < W['length']; L++)
                                    z.urls.push({
                                        name: '___' + L,
                                        url: W[L]
                                    });
                                z['link_index'] = -1,
                                    z['_try_to_linknext']();
                            } else
                                1 > F ? Laya['timer'].once(1000, z, function () {
                                    z['_fetch_gateway'](F + 1);
                                }) : H['LobbyNetMgr'].Inst['polling_connect'] ? (z['lb_index']++, z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](60)), z['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && H['Scene_MJ'].Inst['ForceOut'](), z['_setState'](H['EConnectState'].none));
                        },
                            K = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > F ? Laya['timer'].once(500, z, function () {
                                        z['_fetch_gateway'](F + 1);
                                    }) : H['LobbyNetMgr'].Inst['polling_connect'] ? (z['lb_index']++, z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](58)), z['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || H['Scene_MJ'].Inst['ForceOut'](), z['_setState'](H['EConnectState'].none));
                            },
                            v = function (H) {
                                var F = new Laya['HttpRequest']();
                                F.once(Laya['Event']['COMPLETE'], z, function (H) {
                                    O(H);
                                }),
                                    F.once(Laya['Event']['ERROR'], z, function () {
                                        K();
                                    });
                                var v = [];
                                v.push('If-Modified-Since'),
                                    v.push('0'),
                                    H += '?service=ws-game-gateway',
                                    H += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    H += '&location=' + z['server_location'],
                                    H += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    F.send(H, '', 'get', 'text', v),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + H);
                            };
                        H['LobbyNetMgr'].Inst['polling_connect'] ? v(H['LobbyNetMgr'].Inst.urls[this['lb_index']]) : v(H['LobbyNetMgr'].Inst['lb_url']);
                    },
                    F['prototype']['_setState'] = function (F) {
                        this['connect_state'] = F,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (F == H['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : F == H['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : F == H['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : F == H['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : F == H['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    F['prototype']['_ConnectSuccess'] = function () {
                        var F = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (z, O) {
                                if (z || O['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', z, O), H['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](O)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        O['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    var K = [],
                                        v = 0;
                                    view['DesktopMgr']['player_link_state'] = O['state_list'];
                                    var W = H['Tools']['strOfLocalization'](2003),
                                        L = O['game_config'].mode,
                                        E = view['ERuleMode']['Liqi4'];
                                    L.mode < 10 ? (E = view['ERuleMode']['Liqi4'], F['real_player_count'] = 4) : L.mode < 20 && (E = view['ERuleMode']['Liqi3'], F['real_player_count'] = 3);
                                    for (var l = 0; l < F['real_player_count']; l++)
                                        K.push(null);
                                    L['extendinfo'] && (W = H['Tools']['strOfLocalization'](2004)),
                                        L['detail_rule'] && L['detail_rule']['ai_level'] && (1 === L['detail_rule']['ai_level'] && (W = H['Tools']['strOfLocalization'](2003)), 2 === L['detail_rule']['ai_level'] && (W = H['Tools']['strOfLocalization'](2004)));
                                    for (var a = H['GameUtility']['get_default_ai_skin'](), S = H['GameUtility']['get_default_ai_character'](), l = 0; l < O['seat_list']['length']; l++) {
                                        var V = O['seat_list'][l];
                                        if (0 == V) {
                                            K[l] = {
                                                nickname: W,
                                                avatar_id: a,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: S,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: a,
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
                                                    K[l].avatar_id = skin.id;
                                                    K[l].character.charid = skin.character_id;
                                                    K[l].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                K[l].nickname = '[BOT]' + K[l].nickname;
                                            }
                                        } else {
                                            v++;
                                            for (var d = 0; d < O['players']['length']; d++)
                                                if (O['players'][d]['account_id'] == V) {
                                                    K[l] = O['players'][d];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (K[l].account_id == GameMgr.Inst.account_id) {
                                                        for (let item of uiscript.UI_Sushe.characters) {
                                                            if (item['charid'] == uiscript.UI_Sushe.main_character_id) {
                                                                K[l].character = item;
                                                            }
                                                        }
                                                        K[l].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        K[l].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        K[l].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        K[l].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            K[l].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (K[l].avatar_id == 400101 || K[l].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            K[l].avatar_id = skin.id;
                                                            K[l].character.charid = skin.character_id;
                                                            K[l].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(K[l].account_id);
                                                        if (server == 1) {
                                                            K[l].nickname = '[CN]' + K[l].nickname;
                                                        } else if (server == 2) {
                                                            K[l].nickname = '[JP]' + K[l].nickname;
                                                        } else if (server == 3) {
                                                            K[l].nickname = '[EN]' + K[l].nickname;
                                                        } else {
                                                            K[l].nickname = '[??]' + K[l].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var l = 0; l < F['real_player_count']; l++)
                                        null == K[l] && (K[l] = {
                                            account: 0,
                                            nickname: H['Tools']['strOfLocalization'](2010),
                                            avatar_id: a,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: S,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: a,
                                                is_upgraded: !1
                                            }
                                        });
                                    F['loaded_player_count'] = O['ready_id_list']['length'],
                                        F['_AuthSuccess'](K, O['is_game_start'], O['game_config']['toJSON']());
                                }
                            });
                    },
                    F['prototype']['_AuthSuccess'] = function (F, z, O) {
                        var K = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (F, z) {
                                    F || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', F, z), H['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](z)), z['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2011)), H['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](z['game_restore'])));
                                });
                        })) : H['Scene_MJ'].Inst['openMJRoom'](O, F, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](O)), F, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](K, function () {
                                z ? Laya['timer']['frameOnce'](10, K, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (F, z) {
                                            app.Log.log('syncGame ' + JSON['stringify'](z)),
                                                F || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', F, z), H['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), K['_PlayerReconnectSuccess'](z));
                                        });
                                }) : Laya['timer']['frameOnce'](10, K, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (F, z) {
                                            F || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', F, z), H['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), K['_EnterGame'](z), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (H) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * H);
                        }, null, !1));
                    },
                    F['prototype']['_EnterGame'] = function (F) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](F)),
                            F['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2011)), H['Scene_MJ'].Inst['GameEnd']()) : F['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](F['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    F['prototype']['_PlayerReconnectSuccess'] = function (F) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](F)),
                            F['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2011)), H['Scene_MJ'].Inst['GameEnd']()) : F['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](F['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](H['Tools']['strOfLocalization'](2012)), H['Scene_MJ'].Inst['ForceOut']());
                    },
                    F['prototype']['_SendDebugInfo'] = function () { },
                    F['prototype']['OpenConnectObserve'] = function (F, z) {
                        var O = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                O['server_location'] = z,
                                    O['ob_token'] = F,
                                    O['_setState'](H['EConnectState']['tryconnect']),
                                    O['lb_index'] = 0,
                                    O['_fetch_gateway'](0);
                            });
                    },
                    F['prototype']['_ConnectSuccessOb'] = function () {
                        var F = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (z, O) {
                                z || O['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', z, O), H['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](O)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (z, O) {
                                    if (z || O['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', z, O), H['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var K = O.head,
                                            v = K['game_config'].mode,
                                            W = [],
                                            L = H['Tools']['strOfLocalization'](2003),
                                            E = view['ERuleMode']['Liqi4'];
                                        v.mode < 10 ? (E = view['ERuleMode']['Liqi4'], F['real_player_count'] = 4) : v.mode < 20 && (E = view['ERuleMode']['Liqi3'], F['real_player_count'] = 3);
                                        for (var l = 0; l < F['real_player_count']; l++)
                                            W.push(null);
                                        v['extendinfo'] && (L = H['Tools']['strOfLocalization'](2004)),
                                            v['detail_rule'] && v['detail_rule']['ai_level'] && (1 === v['detail_rule']['ai_level'] && (L = H['Tools']['strOfLocalization'](2003)), 2 === v['detail_rule']['ai_level'] && (L = H['Tools']['strOfLocalization'](2004)));
                                        for (var a = H['GameUtility']['get_default_ai_skin'](), S = H['GameUtility']['get_default_ai_character'](), l = 0; l < K['seat_list']['length']; l++) {
                                            var V = K['seat_list'][l];
                                            if (0 == V)
                                                W[l] = {
                                                    nickname: L,
                                                    avatar_id: a,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: S,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: a,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var d = 0; d < K['players']['length']; d++)
                                                    if (K['players'][d]['account_id'] == V) {
                                                        W[l] = K['players'][d];
                                                        break;
                                                    }
                                        }
                                        for (var l = 0; l < F['real_player_count']; l++)
                                            null == W[l] && (W[l] = {
                                                account: 0,
                                                nickname: H['Tools']['strOfLocalization'](2010),
                                                avatar_id: a,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: S,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: a,
                                                    is_upgraded: !1
                                                }
                                            });
                                        F['_StartObSuccuess'](W, O['passed'], K['game_config']['toJSON'](), K['start_time']);
                                    }
                                }));
                            });
                    },
                    F['prototype']['_StartObSuccuess'] = function (F, z, O, K) {
                        var v = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](K, z);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), H['Scene_MJ'].Inst['openMJRoom'](O, F, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](O)), F, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](v, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, v, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](K, z);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (H) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * H);
                        }, null, !1)));
                    },
                    F['_Inst'] = null,
                    F;
            }
                ();
            H['MJNetMgr'] = F;
        }
            (game || (game = {}));













        // 读取战绩
        !function (H) {
            var F = function (F) {
                function z() {
                    var H = F.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return H['account_id'] = 0,
                        H['origin_x'] = 0,
                        H['origin_y'] = 0,
                        H.root = null,
                        H['title'] = null,
                        H['level'] = null,
                        H['btn_addfriend'] = null,
                        H['btn_report'] = null,
                        H['illust'] = null,
                        H.name = null,
                        H['detail_data'] = null,
                        H['achievement_data'] = null,
                        H['locking'] = !1,
                        H['tab_info4'] = null,
                        H['tab_info3'] = null,
                        H['tab_note'] = null,
                        H['tab_img_dark'] = '',
                        H['tab_img_chosen'] = '',
                        H['player_data'] = null,
                        H['tab_index'] = 1,
                        H['game_category'] = 1,
                        H['game_type'] = 1,
                        H['show_name'] = '',
                        z.Inst = H,
                        H;
                }
                return __extends(z, F),
                    z['prototype']['onCreate'] = function () {
                        var F = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new H['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new H['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new H['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new H['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new H['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['btn_addfriend']['visible'] = !1,
                                    F['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: F['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                H['UI_Report_Nickname'].Inst.show(F['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['close']();
                            }, null, !1),
                            this.note = new H['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || 1 != F['tab_index'] && F['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || 2 != F['tab_index'] && F['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? H['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : F['container_info']['visible'] && (F['container_info']['visible'] = !1, F['tab_info4'].skin = F['tab_img_dark'], F['tab_info3'].skin = F['tab_img_dark'], F['tab_note'].skin = F['tab_img_chosen'], F['tab_index'] = 3, F.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    z['prototype'].show = function (F, z, O, K, v) {
                        var W = this;
                        void 0 === z && (z = 1),
                            void 0 === O && (O = 2),
                            void 0 === K && (K = 1),
                            void 0 === v && (v = ''),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = F,
                            this['show_name'] = v,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            H['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                W['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: F
                            }, function (z, O) {
                                z || O['error'] ? H['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', z, O) : H['UI_Shilian']['now_season_info'] && 1001 == H['UI_Shilian']['now_season_info']['season_id'] && 3 != H['UI_Shilian']['get_cur_season_state']() ? (W['detail_data']['setData'](O), W['changeMJCategory'](W['tab_index'], W['game_category'], W['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: F
                                }, function (F, z) {
                                    F || z['error'] ? H['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', F, z) : (O['season_info'] = z['season_info'], W['detail_data']['setData'](O), W['changeMJCategory'](W['tab_index'], W['game_category'], W['game_type']));
                                });
                            }),
                            this.note['init_data'](F),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = F != GameMgr.Inst['account_id'],
                            this['tab_index'] = z,
                            this['game_category'] = O,
                            this['game_type'] = K,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    z['prototype']['refreshBaseInfo'] = function () {
                        var F = this;
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
                            }, function (z, O) {
                                if (z || O['error'])
                                    H['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', z, O);
                                else {
                                    var K = O['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (K.account_id == GameMgr.Inst.account_id) {
                                        K.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            K.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            K.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    F['player_data'] = K,
                                        F['account_id'] != GameMgr.Inst['account_id'] && F['show_name'] && (K['nickname'] = F['show_name']),
                                        game['Tools']['SetNickname'](F.name, K, !1, !!F['show_name']),
                                        F['title'].id = game['Tools']['titleLocalization'](K['account_id'], K['title']),
                                        F['level'].id = K['level'].id,
                                        F['level'].id = F['player_data'][1 == F['tab_index'] ? 'level' : 'level3'].id,
                                        F['level'].exp = F['player_data'][1 == F['tab_index'] ? 'level' : 'level3']['score'],
                                        F['illust'].me['visible'] = !0,
                                        F['account_id'] == GameMgr.Inst['account_id'] ? F['illust']['setSkin'](K['avatar_id'], 'waitingroom') : F['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](K['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], F['account_id']) && F['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(F['account_id']) ? (F['btn_addfriend']['visible'] = !0, F['btn_report'].x = 520) : (F['btn_addfriend']['visible'] = !1, F['btn_report'].x = 343),
                                        F.note.sign['setSign'](K['signature']),
                                        F['achievement_data'].show(!1, K['achievement_count']);
                                }
                            });
                    },
                    z['prototype']['changeMJCategory'] = function (H, F, z) {
                        void 0 === F && (F = 2),
                            void 0 === z && (z = 1),
                            this['tab_index'] = H,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](H, F, z),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    z['prototype']['close'] = function () {
                        var F = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), H['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1,
                                F['enable'] = !1;
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
                (H['UIBase']);
            H['UI_OtherPlayerInfo'] = F;
        }
            (uiscript || (uiscript = {}));














        // 宿舍相关
        !function (H) {
            var F = function () {
                function F(F, O) {
                    var K = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = F,
                        this['container_illust'] = O,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = F['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            K['during_move'] = !0,
                                K['mouse_start_x'] = K['container_move']['mouseX'],
                                K['mouse_start_y'] = K['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            K['during_move'] && (K.move(K['container_move']['mouseX'] - K['mouse_start_x'], K['container_move']['mouseY'] - K['mouse_start_y']), K['mouse_start_x'] = K['container_move']['mouseX'], K['mouse_start_y'] = K['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            K['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            K['during_move'] = !1;
                        }),
                        this['btn_close'] = F['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            K['locking'] || K['close']();
                        }, null, !1),
                        this['scrollbar'] = F['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (H) {
                            K['_scale'] = 1 * (1 - H) + 0.5,
                                K['illust']['scaleX'] = K['_scale'],
                                K['illust']['scaleY'] = K['_scale'],
                                K['scrollbar']['setVal'](H, 0);
                        })),
                        this['dongtai_kaiguan'] = new H['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            z.Inst['illust']['resetSkin'](),
                                K['illust']['scaleX'] = K['_scale'],
                                K['illust']['scaleY'] = K['_scale'];
                        }), new Laya['Handler'](this, function (H) {
                            z.Inst['illust']['playAnim'](H);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](F['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (H) {
                        this['_scale'] = H,
                            this['scrollbar']['setVal'](1 - (H - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    F['prototype'].show = function (F) {
                        var O = this;
                        this['locking'] = !0,
                            this['when_close'] = F,
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
                            H['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                O['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](z.Inst['illust']['skin_id']);
                    },
                    F['prototype']['close'] = function () {
                        var F = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            H['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                F['locking'] = !1,
                                    F.me['visible'] = !1,
                                    F['when_close'].run();
                            });
                    },
                    F['prototype'].move = function (H, F) {
                        var z = this['illust'].x + H,
                            O = this['illust'].y + F;
                        z < this['illust_center_x'] - 600 ? z = this['illust_center_x'] - 600 : z > this['illust_center_x'] + 600 && (z = this['illust_center_x'] + 600),
                            O < this['illust_center_y'] - 1200 ? O = this['illust_center_y'] - 1200 : O > this['illust_center_y'] + 800 && (O = this['illust_center_y'] + 800),
                            this['illust'].x = z,
                            this['illust'].y = O;
                    },
                    F;
            }
                (),
                z = function (z) {
                    function O() {
                        var H = z.call(this, new ui['lobby']['susheUI']()) || this;
                        return H['contianer_illust'] = null,
                            H['illust'] = null,
                            H['illust_rect'] = null,
                            H['container_name'] = null,
                            H['label_name'] = null,
                            H['label_cv'] = null,
                            H['label_cv_title'] = null,
                            H['container_page'] = null,
                            H['container_look_illust'] = null,
                            H['page_select_character'] = null,
                            H['page_visit_character'] = null,
                            H['origin_illust_x'] = 0,
                            H['chat_id'] = 0,
                            H['container_chat'] = null,
                            H['_select_index'] = 0,
                            H['sound_id'] = null,
                            H['chat_block'] = null,
                            H['illust_showing'] = !0,
                            O.Inst = H,
                            H;
                    }
                    return __extends(O, z),
                        O['onMainSkinChange'] = function () {
                            var H = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            H && H['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](H.path) + '/spine');
                        },
                        O['randomDesktopID'] = function () {
                            var F = H['UI_Sushe']['commonViewList'][H['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), F)
                                for (var z = 0; z < F['length']; z++)
                                    F[z].slot == game['EView'].mjp ? this['now_mjp_id'] = F[z].type ? F[z]['item_id_list'][Math['floor'](Math['random']() * F[z]['item_id_list']['length'])] : F[z]['item_id'] : F[z].slot == game['EView']['desktop'] ? this['now_desktop_id'] = F[z].type ? F[z]['item_id_list'][Math['floor'](Math['random']() * F[z]['item_id_list']['length'])] : F[z]['item_id'] : F[z].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = F[z].type ? F[z]['item_id_list'][Math['floor'](Math['random']() * F[z]['item_id_list']['length'])] : F[z]['item_id']);
                        },
                        O.init = function (F) {
                            var z = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (K, v) {
                                if (K || v['error'])
                                    H['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', K, v);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](v)), v = JSON['parse'](JSON['stringify'](v)), v['main_character_id'] && v['characters']) {
                                        //if (z['characters'] = [], v['characters'])
                                        //    for (var W = 0; W < v['characters']['length']; W++)
                                        //        z['characters'].push(v['characters'][W]);
                                        //if (z['skin_map'] = {}, v['skins'])
                                        //    for (var W = 0; W < v['skins']['length']; W++)
                                        //        z['skin_map'][v['skins'][W]] = 1;
                                        //z['main_character_id'] = v['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = v.main_character_id;
                                        for (let count = 0; count < v.characters.length; count++) {
                                            if (v.characters[count].charid == v.main_character_id) {
                                                if (v.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = v.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = v.skins[count];
                                                fake_data.exp = v.characters[count].exp;
                                                fake_data.level = v.characters[count].level;
                                                fake_data.is_upgraded = v.characters[count].is_upgraded;
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
                                        v.character_sort = MMP.settings.star_chars;
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
                                    if (z['send_gift_count'] = 0, z['send_gift_limit'] = 0, v['send_gift_count'] && (z['send_gift_count'] = v['send_gift_count']), v['send_gift_limit'] && (z['send_gift_limit'] = v['send_gift_limit']), v['finished_endings'])
                                        for (var W = 0; W < v['finished_endings']['length']; W++)
                                            z['finished_endings_map'][v['finished_endings'][W]] = 1;
                                    if (v['rewarded_endings'])
                                        for (var W = 0; W < v['rewarded_endings']['length']; W++)
                                            z['rewarded_endings_map'][v['rewarded_endings'][W]] = 1;
                                    if (z['star_chars'] = [], v['character_sort'] && (z['star_chars'] = v['character_sort']), O['hidden_characters_map'] = {}, v['hidden_characters'])
                                        for (var L = 0, E = v['hidden_characters']; L < E['length']; L++) {
                                            var l = E[L];
                                            O['hidden_characters_map'][l] = 1;
                                        }
                                    F.run();
                                }
                            }), //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (F, O) {
                                //if (F || O['error'])
                                //    H['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', F, O);
                                //else {
                                //    z['using_commonview_index'] = O.use,
                                //    z['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //    var K = O['views'];
                                //    if (K)
                                //        for (var v = 0; v < K['length']; v++) {
                                //            var W = K[v]['values'];
                                //            W && (z['commonViewList'][K[v]['index']] = W);
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
                        O['onFetchSuccess'] = function (H) {
                            var F = H['character_info'];
                            if (F) {
                                if (F['main_character_id'] && F['characters']) {
                                    //if (this['characters'] = [], F['characters'])
                                    //    for (var z = 0; z < F['characters']['length']; z++)
                                    //        this['characters'].push(F['characters'][z]);
                                    //if (this['skin_map'] = {}, F['skins'])
                                    //    for (var z = 0; z < F['skins']['length']; z++)
                                    //        this['skin_map'][F['skins'][z]] = 1;
                                    //this['main_character_id'] = F['main_character_id'];
                                    //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                    fake_data.char_id = F.main_character_id;
                                    for (let count = 0; count < F.characters.length; count++) {
                                        if (F.characters[count].charid == F.main_character_id) {
                                            if (F.characters[count].extra_emoji !== undefined) {
                                                fake_data.emoji = F.characters[count].extra_emoji;
                                            } else {
                                                fake_data.emoji = [];
                                            }
                                            fake_data.skin = F.skins[count];
                                            fake_data.exp = F.characters[count].exp;
                                            fake_data.level = F.characters[count].level;
                                            fake_data.is_upgraded = F.characters[count].is_upgraded;
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
                                    F.character_sort = MMP.settings.star_chars;
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
                                if (this['send_gift_count'] = 0, this['send_gift_limit'] = 0, F['send_gift_count'] && (this['send_gift_count'] = F['send_gift_count']), F['send_gift_limit'] && (this['send_gift_limit'] = F['send_gift_limit']), F['finished_endings'])
                                    for (var z = 0; z < F['finished_endings']['length']; z++)
                                        this['finished_endings_map'][F['finished_endings'][z]] = 1;
                                if (F['rewarded_endings'])
                                    for (var z = 0; z < F['rewarded_endings']['length']; z++)
                                        this['rewarded_endings_map'][F['rewarded_endings'][z]] = 1;
                                if (this['star_chars'] = [], F['character_sort'] && 0 != F['character_sort']['length'] && (this['star_chars'] = F['character_sort']), O['hidden_characters_map'] = {}, F['hidden_characters'])
                                    for (var K = 0, v = F['hidden_characters']; K < v['length']; K++) {
                                        var W = v[K];
                                        O['hidden_characters_map'][W] = 1;
                                    }
                            }
                            var L = H['all_common_views'];
                            //if (L) {
                            //    this['using_commonview_index'] = L.use,
                            //    this['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                            //    var E = L['views'];
                            //    if (E)
                            //        for (var z = 0; z < E['length']; z++) {
                            //            var l = E[z]['values'];
                            ////            l && (this['commonViewList'][E[z]['index']] = l);
                            //       }
                            //   this['randomDesktopID'](),
                            this.commonViewList = MMP.settings.commonViewList;
                            this.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view']();
                            GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            this.randomDesktopID();
                            //}
                        },
                        O['on_data_updata'] = function (F) {
                            if (F['character']) {
                                var z = JSON['parse'](JSON['stringify'](F['character']));
                                if (z['characters'])
                                    for (var O = z['characters'], K = 0; K < O['length']; K++) {
                                        for (var v = !1, W = 0; W < this['characters']['length']; W++)
                                            if (this['characters'][W]['charid'] == O[K]['charid']) {
                                                this['characters'][W] = O[K],
                                                    H['UI_Sushe_Visit'].Inst && H['UI_Sushe_Visit'].Inst['chara_info'] && H['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][W]['charid'] && (H['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][W]),
                                                    v = !0;
                                                break;
                                            }
                                        v || this['characters'].push(O[K]);
                                    }
                                if (z['skins'])
                                    for (var L = z['skins'], K = 0; K < L['length']; K++)
                                        this['skin_map'][L[K]] = 1;
                                // START
                                uiscript['UI_Bag'].Inst['on_skin_change']();
                                // END
                                if (z['finished_endings']) {
                                    for (var E = z['finished_endings'], K = 0; K < E['length']; K++)
                                        this['finished_endings_map'][E[K]] = 1;
                                    H['UI_Sushe_Visit'].Inst;
                                }
                                if (z['rewarded_endings']) {
                                    for (var E = z['rewarded_endings'], K = 0; K < E['length']; K++)
                                        this['rewarded_endings_map'][E[K]] = 1;
                                    H['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        O['chara_owned'] = function (H) {
                            for (var F = 0; F < this['characters']['length']; F++)
                                if (this['characters'][F]['charid'] == H)
                                    return !0;
                            return !1;
                        },
                        O['skin_owned'] = function (H) {
                            return this['skin_map']['hasOwnProperty'](H['toString']());
                        },
                        O['add_skin'] = function (H) {
                            this['skin_map'][H] = 1;
                        },
                        Object['defineProperty'](O, 'main_chara_info', {
                            get: function () {
                                for (var H = 0; H < this['characters']['length']; H++)
                                    if (this['characters'][H]['charid'] == this['main_character_id'])
                                        return this['characters'][H];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        O['on_view_remove'] = function (H) {
                            for (var F = 0; F < this['commonViewList']['length']; F++)
                                for (var z = this['commonViewList'][F], O = 0; O < z['length']; O++)
                                    if (z[O]['item_id'] == H && (z[O]['item_id'] = game['GameUtility']['get_view_default_item_id'](z[O].slot)), z[O]['item_id_list']) {
                                        for (var K = 0; K < z[O]['item_id_list']['length']; K++)
                                            if (z[O]['item_id_list'][K] == H) {
                                                z[O]['item_id_list']['splice'](K, 1);
                                                break;
                                            }
                                        0 == z[O]['item_id_list']['length'] && (z[O].type = 0);
                                    }
                            var v = cfg['item_definition'].item.get(H);
                            v.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == H && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        O['add_finish_ending'] = function (H) {
                            this['finished_endings_map'][H] = 1;
                        },
                        O['add_reward_ending'] = function (H) {
                            this['rewarded_endings_map'][H] = 1;
                        },
                        O['check_all_char_repoint'] = function () {
                            for (var H = 0; H < O['characters']['length']; H++)
                                if (this['check_char_redpoint'](O['characters'][H]))
                                    return !0;
                            return !1;
                        },
                        O['check_char_redpoint'] = function (H) {
                            // 去除小红点
                            //if (O['hidden_characters_map'][H['charid']])
                            return !1;
                            //END
                            var F = cfg.spot.spot['getGroup'](H['charid']);
                            if (F)
                                for (var z = 0; z < F['length']; z++) {
                                    var K = F[z];
                                    if (!(K['is_married'] && !H['is_upgraded'] || !K['is_married'] && H['level'] < K['level_limit']) && 2 == K.type) {
                                        for (var v = !0, W = 0; W < K['jieju']['length']; W++)
                                            if (K['jieju'][W] && O['finished_endings_map'][K['jieju'][W]]) {
                                                if (!O['rewarded_endings_map'][K['jieju'][W]])
                                                    return !0;
                                                v = !1;
                                            }
                                        if (v)
                                            return !0;
                                    }
                                }
                            var L = cfg['item_definition']['character'].get(H['charid']);
                            if (L && L.ur)
                                for (var E = cfg['level_definition']['character']['getGroup'](H['charid']), l = 1, a = 0, S = E; a < S['length']; a++) {
                                    var V = S[a];
                                    if (l > H['level'])
                                        return;
                                    if (V['reward'] && (!H['rewarded_level'] || -1 == H['rewarded_level']['indexOf'](l)))
                                        return !0;
                                    l++;
                                }
                            return !1;
                        },
                        O['is_char_star'] = function (H) {
                            return -1 != this['star_chars']['indexOf'](H);
                        },
                        O['change_char_star'] = function (H) {
                            var F = this['star_chars']['indexOf'](H);
                            -1 != F ? this['star_chars']['splice'](F, 1) : this['star_chars'].push(H);
                            // 屏蔽网络请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                            //    sort: this['star_chars']
                            //}, function () {});
                            // END
                        },
                        Object['defineProperty'](O['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        O['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        O['prototype']['onCreate'] = function () {
                            var z = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new H['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = H['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new H['UI_Character_Chat'](this['container_chat'], !0),
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
                                this['page_select_character'] = new H['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new H['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new F(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        O['prototype'].show = function (F) {
                            H['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var z = 0, K = 0; K < O['characters']['length']; K++)
                                if (O['characters'][K]['charid'] == O['main_character_id']) {
                                    z = K;
                                    break;
                                }
                            0 == F ? (this['change_select'](z), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        O['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](O['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        O['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(O['characters'][this['_select_index']], 2);
                        },
                        O['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                H['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        O['prototype']['close'] = function (F) {
                            var z = this;
                            this['illust_showing'] && H['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    z['enable'] = !1,
                                        F && F.run();
                                });
                        },
                        O['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        O['prototype']['hide_illust'] = function () {
                            var F = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, H['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                F['contianer_illust']['visible'] = !1;
                            })));
                        },
                        O['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, H['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var F = 0, z = 0; z < O['characters']['length']; z++)
                                        if (O['characters'][z]['charid'] == O['main_character_id']) {
                                            F = z;
                                            break;
                                        }
                                    this['change_select'](F);
                                }
                        },
                        O['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        O['prototype']['show_page_visit'] = function (H) {
                            void 0 === H && (H = 0),
                                this['page_visit_character'].show(O['characters'][this['_select_index']], H);
                        },
                        O['prototype']['change_select'] = function (F) {
                            this['_select_index'] = F,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var z = O['characters'][F],
                                K = cfg['item_definition']['character'].get(z['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != O['chs_fengyu_name_lst']['indexOf'](z['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != O['chs_fengyu_cv_lst']['indexOf'](z['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = K['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = K['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV',
                                    'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_name'].font ? this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](0.9, 0.9), this['label_name']['leading'] = -8) : (this['label_name']['scale'](1.2, 1.2), this['label_name']['leading'] = 0) : this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](1.1, 1.1), this['label_name']['leading'] = -14) : (this['label_name']['scale'](1.25, 1.25), this['label_name']['leading'] = -3);
                                var v = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                v.test(K['name_' + GameMgr['client_language']]) && (this['label_name']['leading'] -= 15),
                                    v.test(this['label_cv'].text) && (this['label_cv']['leading'] -= 7),
                                    this['label_cv']['height'] = 600,
                                    'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_cv'].font ? (this['label_cv']['scale'](1, 1), this['label_cv']['leading'] = -4, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']) : (this['label_cv']['scale'](1.1, 1.1), this['label_cv']['leading'] = -9, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']);
                            } else
                                this['label_name'].text = K['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + K['desc_cv_' + GameMgr['client_language']];
                            var W = new H['UIRect']();
                            W.x = this['illust_rect'].x,
                                W.y = this['illust_rect'].y,
                                W['width'] = this['illust_rect']['width'],
                                W['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](W),
                                this['illust']['setSkin'](z.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                H['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var L = cfg['item_definition'].skin.get(z.skin);
                            L && L['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        O['prototype']['onChangeSkin'] = function (H) {
                            O['characters'][this['_select_index']].skin = H,
                                this['change_select'](this['_select_index']),
                                O['characters'][this['_select_index']]['charid'] == O['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = H, O['onMainSkinChange']());
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                            //    character_id: O['characters'][this['_select_index']]['charid'],
                            //    skin: H
                            //}, function () {});
                            // 保存皮肤
                        },
                        O['prototype'].say = function (H) {
                            var F = this,
                                z = O['characters'][this['_select_index']];
                            this['chat_id']++;
                            var K = this['chat_id'],
                                v = view['AudioMgr']['PlayCharactorSound'](z, H, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, F, function () {
                                        K == F['chat_id'] && F['stopsay']();
                                    });
                                }));
                            v && (this['chat_block'].show(v['words']), this['sound_id'] = v['audio_id']);
                        },
                        O['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                        },
                        O['prototype']['to_look_illust'] = function () {
                            var H = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                H['illust']['playAnim']('idle'),
                                    H['page_select_character'].show(0);
                            }));
                        },
                        O['prototype']['jump_to_char_skin'] = function (F, z) {
                            var K = this;
                            if (void 0 === F && (F = -1), void 0 === z && (z = null), F >= 0)
                                for (var v = 0; v < O['characters']['length']; v++)
                                    if (O['characters'][v]['charid'] == F) {
                                        this['change_select'](v);
                                        break;
                                    }
                            H['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                O.Inst['show_page_visit'](),
                                    K['page_visit_character']['show_pop_skin'](),
                                    K['page_visit_character']['set_jump_callback'](z);
                            }));
                        },
                        O['prototype']['jump_to_char_qiyue'] = function (F) {
                            var z = this;
                            if (void 0 === F && (F = -1), F >= 0)
                                for (var K = 0; K < O['characters']['length']; K++)
                                    if (O['characters'][K]['charid'] == F) {
                                        this['change_select'](K);
                                        break;
                                    }
                            H['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                O.Inst['show_page_visit'](),
                                    z['page_visit_character']['show_qiyue']();
                            }));
                        },
                        O['prototype']['jump_to_char_gift'] = function (F) {
                            var z = this;
                            if (void 0 === F && (F = -1), F >= 0)
                                for (var K = 0; K < O['characters']['length']; K++)
                                    if (O['characters'][K]['charid'] == F) {
                                        this['change_select'](K);
                                        break;
                                    }
                            H['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                O.Inst['show_page_visit'](),
                                    z['page_visit_character']['show_gift']();
                            }));
                        },
                        O['characters'] = [],
                        O['chs_fengyu_name_lst'] = ['200040', '200043', '200090'],
                        O['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        O['skin_map'] = {},
                        O['main_character_id'] = 0,
                        O['send_gift_count'] = 0,
                        O['send_gift_limit'] = 0,
                        O['commonViewList'] = [],
                        O['using_commonview_index'] = 0,
                        O['finished_endings_map'] = {},
                        O['rewarded_endings_map'] = {},
                        O['star_chars'] = [],
                        O['hidden_characters_map'] = {},
                        O.Inst = null,
                        O;
                }
                    (H['UIBase']);
            H['UI_Sushe'] = z;
        }
            (uiscript || (uiscript = {}));















        // 屏蔽改变宿舍角色的网络请求
        !function (H) {
            var F = function () {
                function F(F) {
                    var O = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = F,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z.Inst['locking'] || z.Inst['close'](Laya['Handler']['create'](O, function () {
                                H['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z.Inst['locking'] || z.Inst['close'](Laya['Handler']['create'](O, function () {
                                H['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z.Inst['locking'] || H['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z.Inst['locking'] || O['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new H['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            H['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return F['prototype'].show = function (F, z) {
                    if (void 0 === z && (z = !1), this.me['visible'] = !0, F ? this.me['alpha'] = 1 : H['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), z || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var O = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, O));
                    }
                },
                    F['prototype']['render_character_cell'] = function (F) {
                        var z = this,
                            O = F['index'],
                            K = F['container'],
                            v = F['cache_data'];
                        K['visible'] = !0,
                            v['index'] = O,
                            v['inited'] || (v['inited'] = !0, K['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                z['onClickAtHead'](v['index']);
                            }), v.skin = new H['UI_Character_Skin'](K['getChildByName']('btn')['getChildByName']('head')), v.bg = K['getChildByName']('btn')['getChildByName']('bg'), v['bound'] = K['getChildByName']('btn')['getChildByName']('bound'), v['btn_star'] = K['getChildByName']('btn_star'), v.star = K['getChildByName']('btn')['getChildByName']('star'), v['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                z['onClickAtStar'](v['index']);
                            }));
                        var W = K['getChildByName']('btn');
                        W['getChildByName']('choose')['visible'] = O == this['select_index'];
                        var L = this['getCharInfoByIndex'](O);
                        W['getChildByName']('redpoint')['visible'] = H['UI_Sushe']['check_char_redpoint'](L),
                            v.skin['setSkin'](L.skin, 'bighead'),
                            W['getChildByName']('using')['visible'] = L['charid'] == H['UI_Sushe']['main_character_id'],
                            K['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '2.png' : '.png'));
                        var E = cfg['item_definition']['character'].get(L['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? v['bound'].skin = E.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (L['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (L['is_upgraded'] ? '2.png' : '.png')) : E.ur ? (v['bound'].pos(-10, -2), v['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '6.png' : '5.png'))) : (v['bound'].pos(4, 20), v['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '4.png' : '3.png'))),
                            v['btn_star']['visible'] = this['select_index'] == O,
                            v.star['visible'] = H['UI_Sushe']['is_char_star'](L['charid']) || this['select_index'] == O;
                        var l = cfg['item_definition']['character'].find(L['charid']),
                            a = W['getChildByName']('label_name'),
                            S = l['name_' + GameMgr['client_language'] + '2'] ? l['name_' + GameMgr['client_language'] + '2'] : l['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            v.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (H['UI_Sushe']['is_char_star'](L['charid']) ? 'l' : 'd') + (L['is_upgraded'] ? '1.png' : '.png')),
                                a.text = S['replace']('-', '|')['replace'](/\./g, '·');
                            var V = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            a['leading'] = V.test(S) ? -15 : 0;
                        } else
                            v.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (H['UI_Sushe']['is_char_star'](L['charid']) ? 'l.png' : 'd.png')), a.text = S;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == L['charid'] ? (a['scaleX'] = 0.67, a['scaleY'] = 0.57) : (a['scaleX'] = 0.7, a['scaleY'] = 0.6));
                    },
                    F['prototype']['onClickAtHead'] = function (F) {
                        if (this['select_index'] == F) {
                            var z = this['getCharInfoByIndex'](F);
                            if (z['charid'] != H['UI_Sushe']['main_character_id'])
                                if (H['UI_PiPeiYuYue'].Inst['enable'])
                                    H['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var O = H['UI_Sushe']['main_character_id'];
                                    H['UI_Sushe']['main_character_id'] = z['charid'],
                                        app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                            character_id: H['UI_Sushe']['main_character_id']
                                        }, function () { }),
                                        GameMgr.Inst['account_data']['avatar_id'] = z.skin,
                                        H['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = z.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = z.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var K = 0; K < this['show_index_list']['length']; K++)
                                        this['getCharInfoByIndex'](K)['charid'] == O && this['scrollview']['wantToRefreshItem'](K);
                                    this['scrollview']['wantToRefreshItem'](F);
                                }
                        } else {
                            var v = this['select_index'];
                            this['select_index'] = F,
                                v >= 0 && this['scrollview']['wantToRefreshItem'](v),
                                this['scrollview']['wantToRefreshItem'](F),
                                H['UI_Sushe'].Inst['change_select'](this['show_index_list'][F]);
                        }
                    },
                    F['prototype']['onClickAtStar'] = function (F) {
                        if (H['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](F)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](F);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var z = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, z));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    F['prototype']['close'] = function (F) {
                        var z = this;
                        this.me['visible'] && (F ? this.me['visible'] = !1 : H['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            z.me['visible'] = !1;
                        })));
                    },
                    F['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var F = !1, z = 0, O = H['UI_Sushe']['star_chars']; z < O['length']; z++) {
                                var K = O[z];
                                if (!H['UI_Sushe']['hidden_characters_map'][K]) {
                                    F = !0;
                                    break;
                                }
                            }
                            if (!F)
                                return H['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        H['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var v = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](v),
                            Laya['Tween'].to(v, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    F['prototype']['getShowStarState'] = function () {
                        if (0 == H['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var F = 0, z = H['UI_Sushe']['star_chars']; F < z['length']; F++) {
                                var O = z[F];
                                if (!H['UI_Sushe']['hidden_characters_map'][O])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    F['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var F = 0, z = H['UI_Sushe']['star_chars']; F < z['length']; F++) {
                            var O = z[F];
                            if (!H['UI_Sushe']['hidden_characters_map'][O])
                                for (var K = 0; K < H['UI_Sushe']['characters']['length']; K++)
                                    if (H['UI_Sushe']['characters'][K]['charid'] == O) {
                                        K == H['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(K);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var K = 0; K < H['UI_Sushe']['characters']['length']; K++)
                                H['UI_Sushe']['hidden_characters_map'][H['UI_Sushe']['characters'][K]['charid']] || -1 == this['show_index_list']['indexOf'](K) && (K == H['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(K));
                    },
                    F['prototype']['getCharInfoByIndex'] = function (F) {
                        return H['UI_Sushe']['characters'][this['show_index_list'][F]];
                    },
                    F;
            }
                (),
                z = function (z) {
                    function O() {
                        var H = z.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return H['bg_width_head'] = 962,
                            H['bg_width_zhuangban'] = 1819,
                            H['bg2_delta'] = -29,
                            H['container_top'] = null,
                            H['locking'] = !1,
                            H.tabs = [],
                            H['tab_index'] = 0,
                            O.Inst = H,
                            H;
                    }
                    return __extends(O, z),
                        O['prototype']['onCreate'] = function () {
                            var z = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || (1 == z['tab_index'] && z['container_zhuangban']['changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                        z['close'](),
                                            H['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (z['close'](), H['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var O = this.root['getChildByName']('container_tabs'), K = function (F) {
                                v.tabs.push(O['getChildAt'](F)),
                                    v.tabs[F]['clickHandler'] = new Laya['Handler'](v, function () {
                                        z['locking'] || z['tab_index'] != F && (1 == z['tab_index'] && z['container_zhuangban']['changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                            z['change_tab'](F);
                                        }), null) : z['change_tab'](F));
                                    });
                            }, v = this, W = 0; W < O['numChildren']; W++)
                                K(W);
                            this['container_head'] = new F(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new H['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return z['locking'];
                                }));
                        },
                        O['prototype'].show = function (F) {
                            var z = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = F,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), H['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), H['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), H['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), H['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    z['locking'] = !1;
                                });
                            for (var O = 0; O < this.tabs['length']; O++) {
                                var K = this.tabs[O];
                                K.skin = game['Tools']['localUISrc'](O == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var v = K['getChildByName']('word');
                                v['color'] = O == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    v['scaleX'] = v['scaleY'] = O == this['tab_index'] ? 1.1 : 1,
                                    O == this['tab_index'] && K['parent']['setChildIndex'](K, this.tabs['length'] - 1);
                            }
                        },
                        O['prototype']['change_tab'] = function (F) {
                            var z = this;
                            this['tab_index'] = F;
                            for (var O = 0; O < this.tabs['length']; O++) {
                                var K = this.tabs[O];
                                K.skin = game['Tools']['localUISrc'](O == F ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var v = K['getChildByName']('word');
                                v['color'] = O == F ? '#552c1c' : '#d3a86c',
                                    v['scaleX'] = v['scaleY'] = O == F ? 1.1 : 1,
                                    O == F && K['parent']['setChildIndex'](K, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    H['UI_Sushe'].Inst['open_illust'](),
                                        z['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), H['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
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
                        O['prototype']['close'] = function (F) {
                            var z = this;
                            this['locking'] = !0,
                                H['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? H['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    z['container_head']['close'](!0);
                                })) : H['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    z['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    z['locking'] = !1,
                                        z['enable'] = !1,
                                        F && F.run();
                                });
                        },
                        O['prototype']['onDisable'] = function () {
                            for (var F = 0; F < H['UI_Sushe']['characters']['length']; F++) {
                                var z = H['UI_Sushe']['characters'][F].skin,
                                    O = cfg['item_definition'].skin.get(z);
                                O && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](O.path + '/bighead.png'));
                            }
                        },
                        O['prototype']['changeKaiguanShow'] = function (H) {
                            H ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        O['prototype']['changeZhuangbanSlot'] = function (H) {
                            this['container_zhuangban']['changeSlotByItemId'](H);
                        },
                        O;
                }
                    (H['UIBase']);
            H['UI_Sushe_Select'] = z;
        }
            (uiscript || (uiscript = {}));












        // 友人房
        !function (H) {
            var F = function () {
                function F(H) {
                    var F = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = H,
                        this.me['visible'] = !1,
                        this['blackbg'] = H['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            F['locking'] || F['close']();
                        }, null, !1),
                        this.root = H['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return F['prototype'].show = function () {
                    var F = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var z = game['FriendMgr']['friend_list'], O = 0; O < z['length']; O++)
                        this['sortlist'].push(O);
                    this['sortlist'] = this['sortlist'].sort(function (H, F) {
                        var O = z[H],
                            K = 0;
                        if (O['state']['is_online']) {
                            var v = game['Tools']['playState2Desc'](O['state']['playing']);
                            K += '' != v ? 30000000000 : 60000000000,
                                O.base['level'] && (K += O.base['level'].id % 1000 * 10000000),
                                O.base['level3'] && (K += O.base['level3'].id % 1000 * 10000),
                                K += -Math['floor'](O['state']['login_time'] / 10000000);
                        } else
                            K += O['state']['logout_time'];
                        var W = z[F],
                            L = 0;
                        if (W['state']['is_online']) {
                            var v = game['Tools']['playState2Desc'](W['state']['playing']);
                            L += '' != v ? 30000000000 : 60000000000,
                                W.base['level'] && (L += W.base['level'].id % 1000 * 10000000),
                                W.base['level3'] && (L += W.base['level3'].id % 1000 * 10000),
                                L += -Math['floor'](W['state']['login_time'] / 10000000);
                        } else
                            L += W['state']['logout_time'];
                        return L - K;
                    });
                    for (var O = 0; O < z['length']; O++)
                        this['friends'].push({
                            f: z[O],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        H['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1;
                        }));
                },
                    F['prototype']['close'] = function () {
                        var F = this;
                        this['locking'] = !0,
                            H['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                F['locking'] = !1,
                                    F.me['visible'] = !1;
                            }));
                    },
                    F['prototype']['render_item'] = function (F) {
                        var z = F['index'],
                            O = F['container'],
                            v = F['cache_data'];
                        v.head || (v.head = new H['UI_Head'](O['getChildByName']('head'), 'UI_WaitingRoom'), v.name = O['getChildByName']('name'), v['state'] = O['getChildByName']('label_state'), v.btn = O['getChildByName']('btn_invite'), v['invited'] = O['getChildByName']('invited'));
                        var W = this['friends'][this['sortlist'][z]];
                        v.head.id = game['GameUtility']['get_limited_skin_id'](W.f.base['avatar_id']),
                            v.head['set_head_frame'](W.f.base['account_id'], W.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](v.name, W.f.base, GameMgr.Inst['hide_nickname']);
                        var L = !1;
                        if (W.f['state']['is_online']) {
                            var E = game['Tools']['playState2Desc'](W.f['state']['playing']);
                            '' != E ? (v['state'].text = game['Tools']['strOfLocalization'](2069, [E]), v['state']['color'] = '#a9d94d', v.name['getChildByName']('name')['color'] = '#a9d94d') : (v['state'].text = game['Tools']['strOfLocalization'](2071), v['state']['color'] = '#58c4db', v.name['getChildByName']('name')['color'] = '#58c4db', L = !0);
                        } else
                            v['state'].text = game['Tools']['strOfLocalization'](2072), v['state']['color'] = '#8c8c8c', v.name['getChildByName']('name')['color'] = '#8c8c8c';
                        W['invited'] ? (v.btn['visible'] = !1, v['invited']['visible'] = !0) : (v.btn['visible'] = !0, v['invited']['visible'] = !1, game['Tools']['setGrayDisable'](v.btn, !L), L && (v.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](v.btn, !0);
                            var F = {
                                room_id: K.Inst['room_id'],
                                mode: K.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: W.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](F)
                            }, function (F, z) {
                                F || z['error'] ? (game['Tools']['setGrayDisable'](v.btn, !1), H['UIMgr'].Inst['showNetReqError']('sendClientMessage', F, z)) : (v.btn['visible'] = !1, v['invited']['visible'] = !0, W['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    F;
            }
                (),
                z = function () {
                    function F(F) {
                        var z = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = F,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new H['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new H['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return z['locking'];
                            }));
                        for (var O = this.root['getChildByName']('container_tabs'), K = function (F) {
                            v.tabs.push(O['getChildAt'](F)),
                                v.tabs[F]['clickHandler'] = new Laya['Handler'](v, function () {
                                    z['locking'] || z['tab_index'] != F && (1 == z['tab_index'] && z['page_zhangban']['changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                        z['change_tab'](F);
                                    }), null) : z['change_tab'](F));
                                });
                        }, v = this, W = 0; W < O['numChildren']; W++)
                            K(W);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            z['locking'] || (1 == z['tab_index'] && z['page_zhangban']['changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                z['close'](!1);
                            }), null) : z['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                z['locking'] || (1 == z['tab_index'] && z['page_zhangban']['changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](z, function () {
                                    z['close'](!1);
                                }), null) : z['close'](!1));
                            });
                    }
                    return F['prototype'].show = function () {
                        var F = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            H['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                F['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var z = 0; z < this.tabs['length']; z++) {
                            var O = this.tabs[z];
                            O.skin = game['Tools']['localUISrc'](z == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var K = O['getChildByName']('word');
                            K['color'] = z == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                K['scaleX'] = K['scaleY'] = z == this['tab_index'] ? 1.1 : 1,
                                z == this['tab_index'] && O['parent']['setChildIndex'](O, this.tabs['length'] - 1);
                        }
                    },
                        F['prototype']['change_tab'] = function (H) {
                            var F = this;
                            this['tab_index'] = H;
                            for (var z = 0; z < this.tabs['length']; z++) {
                                var O = this.tabs[z];
                                O.skin = game['Tools']['localUISrc'](z == H ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var K = O['getChildByName']('word');
                                K['color'] = z == H ? '#552c1c' : '#d3a86c',
                                    K['scaleX'] = K['scaleY'] = z == H ? 1.1 : 1,
                                    z == H && O['parent']['setChildIndex'](O, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    F['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    F['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    F['locking'] = !1;
                                });
                        },
                        F['prototype']['close'] = function (F) {
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
                            this.me['visible'] && (F ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: K.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), H['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                z['locking'] = !1,
                                    z.me['visible'] = !1;
                            }))));
                        },
                        F;
                }
                    (),
                O = function () {
                    function H(H) {
                        this['modes'] = [],
                            this.me = H,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return H['prototype'].show = function (H) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = H,
                            this['scrollview']['addItem'](H['length']);
                        var F = this['scrollview']['total_height'];
                        F > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - F, this.bg['height'] = F + 20),
                            this.bg['visible'] = !0;
                    },
                        H['prototype']['render_item'] = function (H) {
                            var F = H['index'],
                                z = H['container'],
                                O = z['getChildByName']('info');
                            O['fontSize'] = 40,
                                O['fontSize'] = this['modes'][F]['length'] <= 5 ? 40 : this['modes'][F]['length'] <= 9 ? 55 - 3 * this['modes'][F]['length'] : 28,
                                O.text = this['modes'][F];
                        },
                        H;
                }
                    (),
                K = function (K) {
                    function v() {
                        var F = K.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return F['skin_ready'] = 'myres/room/btn_ready.png',
                            F['skin_cancel'] = 'myres/room/btn_cancel.png',
                            F['skin_start'] = 'myres/room/btn_start.png',
                            F['skin_start_no'] = 'myres/room/btn_start_no.png',
                            F['update_seq'] = 0,
                            F['pre_msgs'] = [],
                            F['msg_tail'] = -1,
                            F['posted'] = !1,
                            F['label_rommid'] = null,
                            F['player_cells'] = [],
                            F['btn_ok'] = null,
                            F['btn_invite_friend'] = null,
                            F['btn_add_robot'] = null,
                            F['btn_dress'] = null,
                            F['btn_copy'] = null,
                            F['beReady'] = !1,
                            F['room_id'] = -1,
                            F['owner_id'] = -1,
                            F['tournament_id'] = 0,
                            F['max_player_count'] = 0,
                            F['players'] = [],
                            F['container_rules'] = null,
                            F['container_top'] = null,
                            F['container_right'] = null,
                            F['locking'] = !1,
                            F['mousein_copy'] = !1,
                            F['popout'] = null,
                            F['room_link'] = null,
                            F['btn_copy_link'] = null,
                            F['last_start_room'] = 0,
                            F['invitefriend'] = null,
                            F['pre_choose'] = null,
                            F['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            v.Inst = F,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](F, function (H) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](H)),
                                    F['onReadyChange'](H['account_id'], H['ready'], H['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](F, function (H) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](H)),
                                    F['onPlayerChange'](H);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](F, function (H) {
                                F['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](H)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), F['onGameStart'](H));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](F, function (H) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](H)),
                                    F['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](F, function () {
                                F['enable'] && F.hide(Laya['Handler']['create'](F, function () {
                                    H['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            F;
                    }
                    return __extends(v, K),
                        v['prototype']['push_msg'] = function (H) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](H)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](H));
                        },
                        Object['defineProperty'](v['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](v['prototype'], 'robot_count', {
                            get: function () {
                                for (var H = 0, F = 0; F < this['players']['length']; F++)
                                    2 == this['players'][F]['category'] && H++;
                                return H;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        v['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        v['prototype']['updateData'] = function (H) {
                            if (!H)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < H.persons.length; i++) {

                                if (H.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    H.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    H.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    H.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    H.persons[i].title = GameMgr.Inst.account_data.title;
                                    H.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        H.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = H['room_id'],
                                this['owner_id'] = H['owner_id'],
                                this['room_mode'] = H.mode,
                                this['public_live'] = H['public_live'],
                                this['tournament_id'] = 0,
                                H['tournament_id'] && (this['tournament_id'] = H['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = H['max_player_count'],
                                this['players'] = [];
                            for (var F = 0; F < H['persons']['length']; F++) {
                                var z = H['persons'][F];
                                z['ready'] = !1,
                                    z['cell_index'] = -1,
                                    z['category'] = 1,
                                    this['players'].push(z);
                            }
                            for (var F = 0; F < H['robot_count']; F++)
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
                            for (var F = 0; F < H['ready_list']['length']; F++)
                                for (var O = 0; O < this['players']['length']; O++)
                                    if (this['players'][O]['account_id'] == H['ready_list'][F]) {
                                        this['players'][O]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                H.seq && (this['update_seq'] = H.seq);
                        },
                        v['prototype']['onReadyChange'] = function (H, F, z) {
                            for (var O = 0; O < this['players']['length']; O++)
                                if (this['players'][O]['account_id'] == H) {
                                    this['players'][O]['ready'] = F,
                                        this['players'][O]['dressing'] = z,
                                        this['_onPlayerReadyChange'](this['players'][O]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        v['prototype']['onPlayerChange'] = function (H) {
                            if (app.Log.log(H), H = H['toJSON'](), !(H.seq && H.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < H.player_list.length; i++) {

                                    if (H.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        H.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        H.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        H.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            H.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (H.update_list != undefined) {
                                    for (var i = 0; i < H.update_list.length; i++) {

                                        if (H.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            H.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            H.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            H.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                H.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = H.seq;
                                var F = {};
                                F.type = 'onPlayerChange0',
                                    F['players'] = this['players'],
                                    F.msg = H,
                                    this['push_msg'](JSON['stringify'](F));
                                var z = this['robot_count'],
                                    O = H['robot_count'];
                                if (O < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, z--);
                                    for (var K = 0; K < this['players']['length']; K++)
                                        2 == this['players'][K]['category'] && z > O && (this['players'][K]['category'] = 0, z--);
                                }
                                for (var v = [], W = H['player_list'], K = 0; K < this['players']['length']; K++)
                                    if (1 == this['players'][K]['category']) {
                                        for (var L = -1, E = 0; E < W['length']; E++)
                                            if (W[E]['account_id'] == this['players'][K]['account_id']) {
                                                L = E;
                                                break;
                                            }
                                        if (-1 != L) {
                                            var l = W[L];
                                            v.push(this['players'][K]),
                                                this['players'][K]['avatar_id'] = l['avatar_id'],
                                                this['players'][K]['title'] = l['title'],
                                                this['players'][K]['verified'] = l['verified'];
                                        }
                                    } else
                                        2 == this['players'][K]['category'] && v.push(this['players'][K]);
                                this['players'] = v;
                                for (var K = 0; K < W['length']; K++) {
                                    for (var a = !1, l = W[K], E = 0; E < this['players']['length']; E++)
                                        if (1 == this['players'][E]['category'] && this['players'][E]['account_id'] == l['account_id']) {
                                            a = !0;
                                            break;
                                        }
                                    a || this['players'].push({
                                        account_id: l['account_id'],
                                        avatar_id: l['avatar_id'],
                                        nickname: l['nickname'],
                                        verified: l['verified'],
                                        title: l['title'],
                                        level: l['level'],
                                        level3: l['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var S = [!1, !1, !1, !1], K = 0; K < this['players']['length']; K++)
                                    - 1 != this['players'][K]['cell_index'] && (S[this['players'][K]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][K]));
                                for (var K = 0; K < this['players']['length']; K++)
                                    if (1 == this['players'][K]['category'] && -1 == this['players'][K]['cell_index'])
                                        for (var E = 0; E < this['max_player_count']; E++)
                                            if (!S[E]) {
                                                this['players'][K]['cell_index'] = E,
                                                    S[E] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][K]);
                                                break;
                                            }
                                for (var z = this['robot_count'], O = H['robot_count']; O > z;) {
                                    for (var V = -1, E = 0; E < this['max_player_count']; E++)
                                        if (!S[E]) {
                                            V = E;
                                            break;
                                        }
                                    if (-1 == V)
                                        break;
                                    S[V] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: V,
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
                                for (var K = 0; K < this['max_player_count']; K++)
                                    S[K] || this['_clearCell'](K);
                                var F = {};
                                if (F.type = 'onPlayerChange1', F['players'] = this['players'], this['push_msg'](JSON['stringify'](F)), H['owner_id']) {
                                    if (this['owner_id'] = H['owner_id'], this['enable'])
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
                        v['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), H['UI_Lobby'].Inst['enable'] = !0, H['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        v['prototype']['onCreate'] = function () {
                            var K = this;
                            this['last_start_room'] = 0;
                            var v = this.me['getChildByName']('root');
                            this['container_top'] = v['getChildByName']('top'),
                                this['container_right'] = v['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var W = function (F) {
                                var z = v['getChildByName']('player_' + F['toString']()),
                                    O = {};
                                O['index'] = F,
                                    O['container'] = z,
                                    O['container_flag'] = z['getChildByName']('flag'),
                                    O['container_flag']['visible'] = !1,
                                    O['container_name'] = z['getChildByName']('container_name'),
                                    O.name = z['getChildByName']('container_name')['getChildByName']('name'),
                                    O['btn_t'] = z['getChildByName']('btn_t'),
                                    O['container_illust'] = z['getChildByName']('container_illust'),
                                    O['illust'] = new H['UI_Character_Skin'](z['getChildByName']('container_illust')['getChildByName']('illust')),
                                    O.host = z['getChildByName']('host'),
                                    O['title'] = new H['UI_PlayerTitle'](z['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    O.rank = new H['UI_Level'](z['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    O['is_robot'] = !1;
                                var W = 0;
                                O['btn_t']['clickHandler'] = Laya['Handler']['create'](L, function () {
                                    if (!(K['locking'] || Laya['timer']['currTimer'] < W)) {
                                        W = Laya['timer']['currTimer'] + 500;
                                        for (var H = 0; H < K['players']['length']; H++)
                                            if (K['players'][H]['cell_index'] == F) {
                                                K['kickPlayer'](H);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    O['btn_info'] = z['getChildByName']('btn_info'),
                                    O['btn_info']['clickHandler'] = Laya['Handler']['create'](L, function () {
                                        if (!K['locking'])
                                            for (var z = 0; z < K['players']['length']; z++)
                                                if (K['players'][z]['cell_index'] == F) {
                                                    K['players'][z]['account_id'] && K['players'][z]['account_id'] > 0 && H['UI_OtherPlayerInfo'].Inst.show(K['players'][z]['account_id'], K['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                                    break;
                                                }
                                    }, null, !1),
                                    L['player_cells'].push(O);
                            }, L = this, E = 0; 4 > E; E++)
                                W(E);
                            this['btn_ok'] = v['getChildByName']('btn_ok');
                            var l = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < l + 500 || (l = Laya['timer']['currTimer'], K['owner_id'] == GameMgr.Inst['account_id'] ? K['getStart']() : K['switchReady']());
                            }, null, !1);
                            var a = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < a + 500 || (a = Laya['timer']['currTimer'], K['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    K['locking'] || K['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var S = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K['locking'] || Laya['timer']['currTimer'] < S || (S = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: K['robot_count'] + 1
                                }, function (F, z) {
                                    (F || z['error'] && 1111 != z['error'].code) && H['UIMgr'].Inst['showNetReqError']('modifyRoom_add', F, z),
                                        S = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!K['locking']) {
                                        var F = 0;
                                        K['room_mode']['detail_rule'] && K['room_mode']['detail_rule']['chuanma'] && (F = 1),
                                            H['UI_Rules'].Inst.show(0, null, F);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    K['locking'] || K['beReady'] && K['owner_id'] != GameMgr.Inst['account_id'] || (K['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: K['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    K['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    K['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    K['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), K['popout']['visible'] = !0, H['UIBase']['anim_pop_out'](K['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new O(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var F = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    F.call('setSysClipboardText', K['room_link'].text),
                                        H['UIBase']['anim_pop_hide'](K['popout'], Laya['Handler']['create'](K, function () {
                                            K['popout']['visible'] = !1;
                                        })),
                                        H['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', K['room_link'].text, function () { }),
                                        H['UIBase']['anim_pop_hide'](K['popout'], Laya['Handler']['create'](K, function () {
                                            K['popout']['visible'] = !1;
                                        })),
                                        H['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1;
                            var V = Laya['Handler']['create'](this, function () {
                                H['UIBase']['anim_pop_hide'](K['popout'], Laya['Handler']['create'](K, function () {
                                    K['popout']['visible'] = !1;
                                }));
                            }, null, !1);
                            this['popout']['getChildByName']('blackbg')['clickHandler'] = V,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = V,
                                this['invitefriend'] = new F(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new z(this.me['getChildByName']('pop_view'));
                        },
                        v['prototype'].show = function () {
                            var F = this;
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
                            var O = {};
                            O.type = 'show',
                                O['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](O)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var K = [];
                            K.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var v = this['room_mode']['detail_rule'];
                            if (v) {
                                var W = 5,
                                    L = 20;
                                if (null != v['time_fixed'] && (W = v['time_fixed']), null != v['time_add'] && (L = v['time_add']), K.push(W['toString']() + '+' + L['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var E = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    E && K.push(E.name);
                                }
                                if (null != v['init_point'] && K.push(game['Tools']['strOfLocalization'](2199) + v['init_point']), null != v['fandian'] && K.push(game['Tools']['strOfLocalization'](2094) + ':' + v['fandian']), v['guyi_mode'] && K.push(game['Tools']['strOfLocalization'](3028)), null != v['dora_count'])
                                    switch (v['chuanma'] && (v['dora_count'] = 0), v['dora_count']) {
                                        case 0:
                                            K.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            K.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            K.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            K.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != v['shiduan'] && 1 != v['shiduan'] && K.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === v['fanfu'] && K.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === v['fanfu'] && K.push(game['Tools']['strOfLocalization'](2764)),
                                    null != v['bianjietishi'] && 1 != v['bianjietishi'] && K.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != v['have_zimosun'] && 1 != v['have_zimosun'] ? K.push(game['Tools']['strOfLocalization'](2202)) : K.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(K),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                H['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var z = 0; z < this['player_cells']['length']; z++)
                                H['UIBase']['anim_alpha_in'](this['player_cells'][z]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * z, null, Laya.Ease['backOut']);
                            H['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                H['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    F['locking'] = !1;
                                });
                            var l = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != l && (this['room_link'].text += '(' + l + ')');
                            var a = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + a + '?room=' + this['room_id'];
                        },
                        v['prototype']['leaveRoom'] = function () {
                            var F = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (z, O) {
                                z || O['error'] ? H['UIMgr'].Inst['showNetReqError']('leaveRoom', z, O) : (F['room_id'] = -1, F.hide(Laya['Handler']['create'](F, function () {
                                    H['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        v['prototype']['tryToClose'] = function (F) {
                            var z = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (O, K) {
                                O || K['error'] ? (H['UIMgr'].Inst['showNetReqError']('leaveRoom', O, K), F['runWith'](!1)) : (z['enable'] = !1, z['pop_change_view']['close'](!0), F['runWith'](!0));
                            });
                        },
                        v['prototype'].hide = function (F) {
                            var z = this;
                            this['locking'] = !0,
                                H['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var O = 0; O < this['player_cells']['length']; O++)
                                H['UIBase']['anim_alpha_out'](this['player_cells'][O]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            H['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                H['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    z['locking'] = !1,
                                        z['enable'] = !1,
                                        F && F.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        v['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var H = 0; H < this['player_cells']['length']; H++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][H]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        v['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        v['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (F, z) {
                                (F || z['error']) && H['UIMgr'].Inst['showNetReqError']('startRoom', F, z);
                            })));
                        },
                        v['prototype']['kickPlayer'] = function (F) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var z = this['players'][F];
                                1 == z['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][F]['account_id']
                                }, function () { }) : 2 == z['category'] && (this['pre_choose'] = z, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (F, z) {
                                    (F || z['error']) && H['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', F, z);
                                }));
                            }
                        },
                        v['prototype']['_clearCell'] = function (H) {
                            if (!(0 > H || H >= this['player_cells']['length'])) {
                                var F = this['player_cells'][H];
                                F['container_flag']['visible'] = !1,
                                    F['container_illust']['visible'] = !1,
                                    F.name['visible'] = !1,
                                    F['container_name']['visible'] = !1,
                                    F['btn_t']['visible'] = !1,
                                    F.host['visible'] = !1,
                                    F['illust']['clear']();
                            }
                        },
                        v['prototype']['_refreshPlayerInfo'] = function (H) {
                            var F = H['cell_index'];
                            if (!(0 > F || F >= this['player_cells']['length'])) {
                                var z = this['player_cells'][F];
                                z['container_illust']['visible'] = !0,
                                    z['container_name']['visible'] = !0,
                                    z.name['visible'] = !0,
                                    game['Tools']['SetNickname'](z.name, H, GameMgr.Inst['hide_nickname']),
                                    z['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && H['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == H['account_id'] && (z['container_flag']['visible'] = !0, z.host['visible'] = !0),
                                    H['account_id'] == GameMgr.Inst['account_id'] ? z['illust']['setSkin'](H['avatar_id'], 'waitingroom') : z['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](H['avatar_id']), 'waitingroom'),
                                    z['title'].id = game['Tools']['titleLocalization'](H['account_id'], H['title']),
                                    z.rank.id = H[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](H);
                            }
                        },
                        v['prototype']['_onPlayerReadyChange'] = function (H) {
                            var F = H['cell_index'];
                            if (!(0 > F || F >= this['player_cells']['length'])) {
                                var z = this['player_cells'][F];
                                z['container_flag']['visible'] = this['owner_id'] == H['account_id'] ? !0 : H['ready'];
                            }
                        },
                        v['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var H = 0, F = 0; F < this['players']['length']; F++)
                                    0 != this['players'][F]['category'] && (this['_refreshPlayerInfo'](this['players'][F]), H++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], H == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], H == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        v['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var H = 0, F = 0; F < this['players']['length']; F++) {
                                    var z = this['players'][F];
                                    if (!z || 0 == z['category'])
                                        break;
                                    (z['account_id'] == this['owner_id'] || z['ready']) && H++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], H != this['max_player_count']), this['enable']) {
                                    for (var O = 0, F = 0; F < this['max_player_count']; F++) {
                                        var K = this['player_cells'][F];
                                        K && K['container_flag']['visible'] && O++;
                                    }
                                    if (H != O && !this['posted']) {
                                        this['posted'] = !0;
                                        var v = {};
                                        v['okcount'] = H,
                                            v['okcount2'] = O,
                                            v.msgs = [];
                                        var W = 0,
                                            L = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (W = (this['msg_tail'] + 1) % this['pre_msgs']['length'], L = this['msg_tail']), W >= 0 && L >= 0) {
                                            for (var F = W; F != L; F = (F + 1) % this['pre_msgs']['length'])
                                                v.msgs.push(this['pre_msgs'][F]);
                                            v.msgs.push(this['pre_msgs'][L]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', v, !1);
                                    }
                                }
                            }
                        },
                        v['prototype']['onGameStart'] = function (H) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](H['connect_token'], H['game_uuid'], H['location'], !1, null);
                        },
                        v['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        v['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        v.Inst = null,
                        v;
                }
                    (H['UIBase']);
            H['UI_WaitingRoom'] = K;
        }
            (uiscript || (uiscript = {}));













        // 保存装扮
        !function (H) {
            var F;
            !function (F) {
                var z = function () {
                    function z(z, O, K) {
                        var v = this;
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
                            this['_locking'] = K,
                            this['container_zhuangban0'] = z,
                            this['container_zhuangban1'] = O;
                        var W = this['container_zhuangban0']['getChildByName']('tabs');
                        W['vScrollBarSkin'] = '';
                        for (var L = function (F) {
                            var z = W['getChildAt'](F);
                            E.tabs.push(z),
                                z['clickHandler'] = new Laya['Handler'](E, function () {
                                    v['locking'] || v['tab_index'] != F && (v['_changed'] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                        v['change_tab'](F);
                                    }), null) : v['change_tab'](F));
                                });
                        }, E = this, l = 0; l < W['numChildren']; l++)
                            L(l);
                        this['page_items'] = new F['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new F['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new F['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new F['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var F = [], z = 0; z < v['cell_titles']['length']; z++) {
                                    var O = v['slot_ids'][z];
                                    if (v['slot_map'][O]) {
                                        var K = v['slot_map'][O];
                                        if (!(K['item_id'] && K['item_id'] != v['cell_default_item'][z] || K['item_id_list'] && 0 != K['item_id_list']['length']))
                                            continue;
                                        var W = [];
                                        if (K['item_id_list'])
                                            for (var L = 0, E = K['item_id_list']; L < E['length']; L++) {
                                                var l = E[L];
                                                l == v['cell_default_item'][z] ? W.push(0) : W.push(l);
                                            }
                                        F.push({
                                            slot: O,
                                            item_id: K['item_id'],
                                            type: K.type,
                                            item_id_list: W
                                        });
                                    }
                                }
                                v['btn_save']['mouseEnabled'] = !1;
                                var a = v['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: F,
                                //    save_index: a,
                                //    is_use: a == H['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (z, O) {
                                //    if (v['btn_save']['mouseEnabled'] = !0, z || O['error'])
                                //        H['UIMgr'].Inst['showNetReqError']('saveCommonViews', z, O);
                                //    else {
                                if (H['UI_Sushe']['commonViewList']['length'] < a)
                                    for (var K = H['UI_Sushe']['commonViewList']['length']; a >= K; K++)
                                        H['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = H.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = H.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (H['UI_Sushe']['commonViewList'][a] = F, H['UI_Sushe']['using_commonview_index'] == a && v['onChangeGameView'](), v['tab_index'] != a)
                                    return;
                                v['btn_save']['mouseEnabled'] = !0,
                                    v['_changed'] = !1,
                                    v['refresh_btn']();
                                //}
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                v['btn_use']['mouseEnabled'] = !1;
                                var F = v['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: F
                                //}, function (z, O) {
                                //    v['btn_use']['mouseEnabled'] = !0,
                                //    z || O['error'] ? H['UIMgr'].Inst['showNetReqError']('useCommonView', z, O) : (
                                H['UI_Sushe']['using_commonview_index'] = F, v['refresh_btn'](), v['refresh_tab'](), v['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                v['onRandomBtnClick']();
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
                        z['prototype'].show = function (F) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                F ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (H['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), H['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](H['UI_Sushe']['using_commonview_index']);
                        },
                        z['prototype']['change_tab'] = function (F) {
                            if (this['tab_index'] = F, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < H['UI_Sushe']['commonViewList']['length'])
                                    for (var z = H['UI_Sushe']['commonViewList'][this['tab_index']], O = 0; O < z['length']; O++)
                                        this['slot_map'][z[O].slot] = {
                                            slot: z[O].slot,
                                            item_id: z[O]['item_id'],
                                            type: z[O].type,
                                            item_id_list: z[O]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        z['prototype']['refresh_tab'] = function () {
                            for (var F = 0; F < this.tabs['length']; F++) {
                                var z = this.tabs[F];
                                z['mouseEnabled'] = this['tab_index'] != F,
                                    z['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == F ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    z['getChildByName']('num')['color'] = this['tab_index'] == F ? '#2f1e19' : '#f2c797';
                                var O = z['getChildByName']('choosed');
                                H['UI_Sushe']['using_commonview_index'] == F ? (O['visible'] = !0, O.x = this['tab_index'] == F ? -18 : -4) : O['visible'] = !1;
                            }
                        },
                        z['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = H['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = H['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        z['prototype']['onChangeSlotSelect'] = function (H) {
                            var F = this;
                            this['select_index'] = H,
                                this['random']['visible'] = !(6 == H || 10 == H);
                            var z = 0;
                            H >= 0 && H < this['cell_default_item']['length'] && (z = this['cell_default_item'][H]);
                            var O = z,
                                K = this['slot_ids'][H],
                                v = !1,
                                W = [];
                            if (this['slot_map'][K]) {
                                var L = this['slot_map'][K];
                                W = L['item_id_list'],
                                    v = !!L.type,
                                    L['item_id'] && (O = this['slot_map'][K]['item_id']),
                                    v && L['item_id_list'] && L['item_id_list']['length'] > 0 && (O = L['item_id_list'][0]);
                            }
                            var E = Laya['Handler']['create'](this, function (O) {
                                O == z && (O = 0);
                                var v = !1;
                                if (F['is_random']) {
                                    var W = F['slot_map'][K]['item_id_list']['indexOf'](O);
                                    W >= 0 ? (F['slot_map'][K]['item_id_list']['splice'](W, 1), v = !0) : (F['slot_map'][K]['item_id_list'] && 0 != F['slot_map'][K]['item_id_list']['length'] || (F['slot_map'][K]['item_id_list'] = []), F['slot_map'][K]['item_id_list'].push(O));
                                } else
                                    F['slot_map'][K] || (F['slot_map'][K] = {}), F['slot_map'][K]['item_id'] = O;
                                return F['scrollview']['wantToRefreshItem'](H),
                                    F['_changed'] = !0,
                                    F['refresh_btn'](),
                                    v;
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = v,
                                this['random_slider'].x = v ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var l = game['Tools']['strOfLocalization'](this['cell_titles'][H]);
                            if (H >= 0 && 2 >= H)
                                this['page_items'].show(l, H, O, E), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == H)
                                this['page_items'].show(l, 10, O, E), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == H)
                                this['page_items'].show(l, 3, O, E), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == H)
                                this['page_bgm'].show(l, O, E), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == H)
                                this['page_headframe'].show(l, O, E);
                            else if (7 == H || 8 == H) {
                                var a = this['cell_default_item'][7],
                                    S = this['cell_default_item'][8];
                                if (7 == H) {
                                    if (a = O, this['slot_map'][game['EView'].mjp]) {
                                        var V = this['slot_map'][game['EView'].mjp];
                                        V.type && V['item_id_list'] && V['item_id_list']['length'] > 0 ? S = V['item_id_list'][0] : V['item_id'] && (S = V['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](l, a, S, E);
                                } else {
                                    if (S = O, this['slot_map'][game['EView']['desktop']]) {
                                        var V = this['slot_map'][game['EView']['desktop']];
                                        V.type && V['item_id_list'] && V['item_id_list']['length'] > 0 ? a = V['item_id_list'][0] : V['item_id'] && (a = V['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](l, a, S, E);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == H) {
                                var a = this['cell_default_item'][7],
                                    S = this['cell_default_item'][9];
                                if (S = O, this['slot_map'][game['EView']['desktop']]) {
                                    var V = this['slot_map'][game['EView']['desktop']];
                                    V.type && V['item_id_list'] && V['item_id_list']['length'] > 0 ? a = V['item_id_list'][0] : V['item_id'] && (a = V['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](l, a, S, E),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == H && this['page_desktop']['show_lobby_bg'](l, O, E);
                        },
                        z['prototype']['onRandomBtnClick'] = function () {
                            var H = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        H['random']['getChildAt'](H['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var F = this['select_index'],
                                    z = this['slot_ids'][F],
                                    O = 0;
                                F >= 0 && F < this['cell_default_item']['length'] && (O = this['cell_default_item'][F]);
                                var K = O,
                                    v = [];
                                if (this['slot_map'][z]) {
                                    var W = this['slot_map'][z];
                                    v = W['item_id_list'],
                                        W['item_id'] && (K = this['slot_map'][z]['item_id']);
                                }
                                if (F >= 0 && 4 >= F) {
                                    var L = this['slot_map'][z];
                                    L ? (L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']])) : this['slot_map'][z] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](K);
                                } else if (5 == F) {
                                    var L = this['slot_map'][z];
                                    if (L)
                                        L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']]);
                                    else {
                                        this['slot_map'][z] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](K);
                                } else if (7 == F || 8 == F || 9 == F) {
                                    var L = this['slot_map'][z];
                                    L ? (L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']])) : this['slot_map'][z] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](K);
                                }
                                this['scrollview']['wantToRefreshItem'](F);
                            }
                        },
                        z['prototype']['render_view'] = function (H) {
                            var F = this,
                                z = H['container'],
                                O = H['index'],
                                K = z['getChildByName']('cell');
                            this['select_index'] == O ? (K['scaleX'] = K['scaleY'] = 1.05, K['getChildByName']('choosed')['visible'] = !0) : (K['scaleX'] = K['scaleY'] = 1, K['getChildByName']('choosed')['visible'] = !1),
                                K['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][O]);
                            var v = K['getChildByName']('name'),
                                W = K['getChildByName']('icon'),
                                L = this['cell_default_item'][O],
                                E = this['slot_ids'][O],
                                l = !1;
                            if (this['slot_map'][E] && (l = this['slot_map'][E].type, this['slot_map'][E]['item_id'] && (L = this['slot_map'][E]['item_id'])), l)
                                v.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][E]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](W, 'myres/sushe/icon_random.jpg');
                            else {
                                var a = cfg['item_definition'].item.get(L);
                                a ? (v.text = a['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](W, a.icon, null, 'UI_Sushe_Select.Zhuangban')) : (v.text = game['Tools']['strOfLocalization'](this['cell_names'][O]), game['LoadMgr']['setImgSkin'](W, this['cell_default_img'][O], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var S = K['getChildByName']('btn');
                            S['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F['select_index'] != O && (F['onChangeSlotSelect'](O), F['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                S['mouseEnabled'] = this['select_index'] != O;
                        },
                        z['prototype']['close'] = function (F) {
                            var z = this;
                            this['container_zhuangban0']['visible'] && (F ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (H['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), H['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
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
                            MMP.settings.using_commonview_index = H.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            H['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var F = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            H['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](F, Laya['Handler']['create'](this, function () {
                                    H['UI_Lite_Loading'].Inst['enable'] && H['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        z['prototype']['setRandomGray'] = function (F) {
                            this['btn_random']['visible'] = !F,
                                this['random']['filters'] = F ? [new Laya['ColorFilter'](H['GRAY_FILTER'])] : [];
                        },
                        z['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        z['prototype']['changeSlotByItemId'] = function (H) {
                            var F = cfg['item_definition'].item.get(H);
                            if (F)
                                for (var z = 0; z < this['slot_ids']['length']; z++)
                                    if (this['slot_ids'][z] == F.type)
                                        return this['onChangeSlotSelect'](z), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        z;
                }
                    ();
                F['Container_Zhuangban'] = z;
            }
                (F = H['zhuangban'] || (H['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));













        // 设置称号
        !function (H) {
            var F = function (F) {
                function z() {
                    var H = F.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return H['_root'] = null,
                        H['_scrollview'] = null,
                        H['_blackmask'] = null,
                        H['_locking'] = !1,
                        H['_showindexs'] = [],
                        z.Inst = H,
                        H;
                }
                return __extends(z, F),
                    z.Init = function () {
                        var F = this;
                        // 获取称号
                        //GameMgr.Inst['use_fetch_info'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (z, O) {
                        //    if (z || O['error'])
                        //        H['UIMgr'].Inst['showNetReqError']('fetchTitleList', z, O);
                        //    else {
                        //        F['owned_title'] = [];
                        //        for (var K = 0; K < O['title_list']['length']; K++) {
                        //            var v = O['title_list'][K];
                        for (let title of cfg.item_definition.title.rows_) {
                            var v = title.id;
                            cfg['item_definition']['title'].get(v) && F['owned_title'].push(v),
                                '600005' == v && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                v >= '600005' && '600015' >= v && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + v - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    z['onFetchSuccess'] = function (H) {
                        if (this['owned_title'] = [], H['title_list'] && H['title_list']['title_list'])
                            // START
                            //for (var F = 0; F < H['title_list']['title_list']['length']; F++) {
                            //    var z = H['title_list']['title_list'][F];
                            // END
                            for (let title of cfg.item_definition.title.rows_) {
                                var z = title.id;
                                cfg['item_definition']['title'].get(z) && this['owned_title'].push(z),
                                    '600005' == z && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    z >= '600005' && '600015' >= z && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + z - '600005', 1);
                            }
                    },
                    z['title_update'] = function (F) {
                        for (var z = 0; z < F['new_titles']['length']; z++)
                            cfg['item_definition']['title'].get(F['new_titles'][z]) && this['owned_title'].push(F['new_titles'][z]), '600005' == F['new_titles'][z] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), F['new_titles'][z] >= '600005' && F['new_titles'][z] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + F['new_titles'][z] - '600005', 1);
                        if (F['remove_titles'] && F['remove_titles']['length'] > 0) {
                            for (var z = 0; z < F['remove_titles']['length']; z++) {
                                for (var O = F['remove_titles'][z], K = 0; K < this['owned_title']['length']; K++)
                                    if (this['owned_title'][K] == O) {
                                        this['owned_title'][K] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                O == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', H['UI_Lobby'].Inst['enable'] && H['UI_Lobby'].Inst.top['refresh'](), H['UI_PlayerInfo'].Inst['enable'] && H['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    z['prototype']['onCreate'] = function () {
                        var F = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new H['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return F['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (H) {
                                F['setItemValue'](H['index'], H['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['_locking'] || (F['_blackmask'].hide(), F['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    z['prototype'].show = function () {
                        var F = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), z['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var O = 0; O < z['owned_title']['length']; O++)
                                this['_showindexs'].push(O);
                            this['_showindexs'] = this['_showindexs'].sort(function (H, F) {
                                var O = H,
                                    K = cfg['item_definition']['title'].get(z['owned_title'][H]);
                                K && (O += 1000 * K['priority']);
                                var v = F,
                                    W = cfg['item_definition']['title'].get(z['owned_title'][F]);
                                return W && (v += 1000 * W['priority']),
                                    v - O;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](z['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        H['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            F['_locking'] = !1;
                        }));
                    },
                    z['prototype']['close'] = function () {
                        var F = this;
                        this['_locking'] = !0,
                            H['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                F['_locking'] = !1,
                                    F['enable'] = !1;
                            }));
                    },
                    z['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    z['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    z['prototype']['setItemValue'] = function (H, F) {
                        var O = this;
                        if (this['enable']) {
                            var K = z['owned_title'][this['_showindexs'][H]],
                                v = cfg['item_definition']['title'].find(K);
                            game['LoadMgr']['setImgSkin'](F['getChildByName']('img_title'), v.icon, null, 'UI_TitleBook'),
                                F['getChildByName']('using')['visible'] = K == GameMgr.Inst['account_data']['title'],
                                F['getChildByName']('desc').text = v['desc_' + GameMgr['client_language']];
                            var W = F['getChildByName']('btn');
                            W['clickHandler'] = Laya['Handler']['create'](this, function () {
                                K != GameMgr.Inst['account_data']['title'] ? (O['changeTitle'](H), F['getChildByName']('using')['visible'] = !0) : (O['changeTitle'](-1), F['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var L = F['getChildByName']('time'),
                                E = F['getChildByName']('img_title');
                            if (1 == v['unlock_type']) {
                                var l = v['unlock_param'][0],
                                    a = cfg['item_definition'].item.get(l);
                                L.text = game['Tools']['strOfLocalization'](3121) + a['expire_desc_' + GameMgr['client_language']],
                                    L['visible'] = !0,
                                    E.y = 34;
                            } else
                                L['visible'] = !1, E.y = 44;
                        }
                    },
                    z['prototype']['changeTitle'] = function (F) {
                        var O = this,
                            K = GameMgr.Inst['account_data']['title'],
                            v = 0;
                        v = F >= 0 && F < this['_showindexs']['length'] ? z['owned_title'][this['_showindexs'][F]] : '600001',
                            GameMgr.Inst['account_data']['title'] = v;
                        for (var W = -1, L = 0; L < this['_showindexs']['length']; L++)
                            if (K == z['owned_title'][this['_showindexs'][L]]) {
                                W = L;
                                break;
                            }
                        H['UI_Lobby'].Inst['enable'] && H['UI_Lobby'].Inst.top['refresh'](),
                            H['UI_PlayerInfo'].Inst['enable'] && H['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            -1 != W && this['_scrollview']['wantToRefreshItem'](W),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = v;
                        MMP.saveSettings();
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                        //    title: '600001' == v ? 0 : v
                        //}, function (z, v) {
                        //    (z || v['error']) && (H['UIMgr'].Inst['showNetReqError']('useTitle', z, v), GameMgr.Inst['account_data']['title'] = K, H['UI_Lobby'].Inst['enable'] && H['UI_Lobby'].Inst.top['refresh'](), H['UI_PlayerInfo'].Inst['enable'] && H['UI_PlayerInfo'].Inst['refreshBaseInfo'](), O['enable'] && (F >= 0 && F < O['_showindexs']['length'] && O['_scrollview']['wantToRefreshItem'](F), W >= 0 && W < O['_showindexs']['length'] && O['_scrollview']['wantToRefreshItem'](W)));
                        //});
                    },
                    z.Inst = null,
                    z['owned_title'] = [],
                    z;
            }
                (H['UIBase']);
            H['UI_TitleBook'] = F;
        }
            (uiscript || (uiscript = {}));











        // 友人房调整装扮
        !function (H) {
            var F;
            !function (F) {
                var z = function () {
                    function z(H) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = H,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new F['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return z['prototype'].show = function (F) {
                        var z = this;
                        this.me['visible'] = !0,
                            F ? this.me['alpha'] = 1 : H['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var O = 0, K = H['UI_Sushe']['star_chars']; O < K['length']; O++)
                            for (var v = K[O], W = 0; W < H['UI_Sushe']['characters']['length']; W++)
                                if (!H['UI_Sushe']['hidden_characters_map'][v] && H['UI_Sushe']['characters'][W]['charid'] == v) {
                                    this['chara_infos'].push({
                                        chara_id: H['UI_Sushe']['characters'][W]['charid'],
                                        skin_id: H['UI_Sushe']['characters'][W].skin,
                                        is_upgraded: H['UI_Sushe']['characters'][W]['is_upgraded']
                                    }),
                                        H['UI_Sushe']['main_character_id'] == H['UI_Sushe']['characters'][W]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var W = 0; W < H['UI_Sushe']['characters']['length']; W++)
                            H['UI_Sushe']['hidden_characters_map'][H['UI_Sushe']['characters'][W]['charid']] || -1 == H['UI_Sushe']['star_chars']['indexOf'](H['UI_Sushe']['characters'][W]['charid']) && (this['chara_infos'].push({
                                chara_id: H['UI_Sushe']['characters'][W]['charid'],
                                skin_id: H['UI_Sushe']['characters'][W].skin,
                                is_upgraded: H['UI_Sushe']['characters'][W]['is_upgraded']
                            }), H['UI_Sushe']['main_character_id'] == H['UI_Sushe']['characters'][W]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var L = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(L['chara_id'], L['skin_id'], Laya['Handler']['create'](this, function (H) {
                            z['choosed_skin_id'] = H,
                                L['skin_id'] = H,
                                z['scrollview']['wantToRefreshItem'](z['choosed_chara_index']);
                        }, null, !1));
                    },
                        z['prototype']['render_character_cell'] = function (F) {
                            var z = this,
                                O = F['index'],
                                K = F['container'],
                                v = F['cache_data'];
                            v['index'] = O;
                            var W = this['chara_infos'][O];
                            v['inited'] || (v['inited'] = !0, v.skin = new H['UI_Character_Skin'](K['getChildByName']('btn')['getChildByName']('head')), v['bound'] = K['getChildByName']('btn')['getChildByName']('bound'));
                            var L = K['getChildByName']('btn');
                            L['getChildByName']('choose')['visible'] = O == this['choosed_chara_index'],
                                v.skin['setSkin'](W['skin_id'], 'bighead'),
                                L['getChildByName']('using')['visible'] = O == this['choosed_chara_index'];
                            var E = cfg['item_definition']['character'].find(W['chara_id']),
                                l = E['name_' + GameMgr['client_language'] + '2'] ? E['name_' + GameMgr['client_language'] + '2'] : E['name_' + GameMgr['client_language']],
                                a = L['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                a.text = l['replace']('-', '|')['replace'](/\./g, '·');
                                var S = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                a['leading'] = S.test(l) ? -15 : 0;
                            } else
                                a.text = l;
                            L['getChildByName']('star') && (L['getChildByName']('star')['visible'] = O < this['star_char_count']);
                            var V = cfg['item_definition']['character'].get(W['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? v['bound'].skin = V.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (W['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (W['is_upgraded'] ? '2.png' : '.png')) : V.ur ? (v['bound'].pos(-10, -2), v['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (W['is_upgraded'] ? '6.png' : '5.png'))) : (v['bound'].pos(4, 20), v['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (W['is_upgraded'] ? '4.png' : '3.png'))),
                                L['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (W['is_upgraded'] ? '2.png' : '.png')),
                                K['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (O != z['choosed_chara_index']) {
                                        var H = z['choosed_chara_index'];
                                        z['choosed_chara_index'] = O,
                                            z['choosed_skin_id'] = W['skin_id'],
                                            z['page_skin'].show(W['chara_id'], W['skin_id'], Laya['Handler']['create'](z, function (H) {
                                                z['choosed_skin_id'] = H,
                                                    W['skin_id'] = H,
                                                    v.skin['setSkin'](H, 'bighead');
                                            }, null, !1)),
                                            z['scrollview']['wantToRefreshItem'](H),
                                            z['scrollview']['wantToRefreshItem'](O);
                                    }
                                });
                        },
                        z['prototype']['close'] = function (F) {
                            var z = this;
                            if (this.me['visible'])
                                if (F)
                                    this.me['visible'] = !1;
                                else {
                                    var O = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //O['chara_id'] != H['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: O['chara_id']
                                    //    }, function () {}), 
                                    H['UI_Sushe']['main_character_id'] = O['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: O['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var K = 0; K < H['UI_Sushe']['characters']['length']; K++)
                                        if (H['UI_Sushe']['characters'][K]['charid'] == O['chara_id']) {
                                            H['UI_Sushe']['characters'][K].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        H['UI_Sushe']['onMainSkinChange'](),
                                        H['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            z.me['visible'] = !1;
                                        }));
                                }
                        },
                        z;
                }
                    ();
                F['Page_Waiting_Head'] = z;
            }
                (F = H['zhuangban'] || (H['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));













        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var H = GameMgr;
            var F = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (z, O) {
                if (z || O['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', z, O);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](O)),
                        H.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    O.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    O.account.title = GameMgr.Inst.account_data.title;
                    O.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        O.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var K in O['account']) {
                        if (H.Inst['account_data'][K] = O['account'][K], 'platform_diamond' == K)
                            for (var v = O['account'][K], W = 0; W < v['length']; W++)
                                F['account_numerical_resource'][v[W].id] = v[W]['count'];
                        if ('skin_ticket' == K && (H.Inst['account_numerical_resource']['100004'] = O['account'][K]), 'platform_skin_ticket' == K)
                            for (var v = O['account'][K], W = 0; W < v['length']; W++)
                                F['account_numerical_resource'][v[W].id] = v[W]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        O['account']['room_id'] && H.Inst['updateRoom'](),
                        '10102' === H.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === H.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }










        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (F, z, O) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': F,
                        'account_id': parseInt(z.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': F,
                            'account_id': parseInt(z.toString())
                        }));
                    }
                }));
            }
            var H = GameMgr;
            var K = this;
            return F = F.trim(),
                app.Log.log('checkPaiPu game_uuid:' + F + ' account_id:' + z['toString']() + ' paipu_config:' + O),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), H.Inst['onLoadStart']('paipu'), 2 & O && (F = game['Tools']['DecodePaipuUUID'](F)), this['record_uuid'] = F, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: F,
                    client_version_string: this['getClientVersion']()
                }, function (v, W) {
                    if (v || W['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', v, W);
                        var L = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](L);
                        var E = function () {
                            return L += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, L)),
                                L >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, E), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, K, E),
                            K['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': v.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': v.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var l = W.head,
                            a = [null, null, null, null],
                            S = game['Tools']['strOfLocalization'](2003),
                            V = l['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: F,
                            client_version_string: K['getClientVersion']()
                        }, function () { }),
                            V['extendinfo'] && (S = game['Tools']['strOfLocalization'](2004)),
                            V['detail_rule'] && V['detail_rule']['ai_level'] && (1 === V['detail_rule']['ai_level'] && (S = game['Tools']['strOfLocalization'](2003)), 2 === V['detail_rule']['ai_level'] && (S = game['Tools']['strOfLocalization'](2004)));
                        var d = !1;
                        l['end_time'] ? (K['record_end_time'] = l['end_time'], l['end_time'] > '1576112400' && (d = !0)) : K['record_end_time'] = -1,
                            K['record_start_time'] = l['start_time'] ? l['start_time'] : -1;
                        for (var J = 0; J < l['accounts']['length']; J++) {
                            var P = l['accounts'][J];
                            if (P['character']) {
                                var t = P['character'],
                                    r = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (P.account_id == GameMgr.Inst.account_id) {
                                        P.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        P.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        P.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        P.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        P.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            P.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (P.avatar_id == 400101 || P.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            P.avatar_id = skin.id;
                                            P.character.charid = skin.character_id;
                                            P.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(P.account_id);
                                        if (server == 1) {
                                            P.nickname = '[CN]' + P.nickname;
                                        } else if (server == 2) {
                                            P.nickname = '[JP]' + P.nickname;
                                        } else if (server == 3) {
                                            P.nickname = '[EN]' + P.nickname;
                                        } else {
                                            P.nickname = '[??]' + P.nickname;
                                        }
                                    }
                                }
                                // END
                                if (d) {
                                    var N = P['views'];
                                    if (N)
                                        for (var j = 0; j < N['length']; j++)
                                            r[N[j].slot] = N[j]['item_id'];
                                } else {
                                    var _ = t['views'];
                                    if (_)
                                        for (var j = 0; j < _['length']; j++) {
                                            var x = _[j].slot,
                                                n = _[j]['item_id'],
                                                h = x - 1;
                                            r[h] = n;
                                        }
                                }
                                var g = [];
                                for (var i in r)
                                    g.push({
                                        slot: parseInt(i),
                                        item_id: r[i]
                                    });
                                P['views'] = g,
                                    a[P.seat] = P;
                            } else
                                P['character'] = {
                                    charid: P['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(P['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    P['avatar_id'] = P['character'].skin,
                                    P['views'] = [],
                                    a[P.seat] = P;
                        }
                        for (var Y = game['GameUtility']['get_default_ai_skin'](), f = game['GameUtility']['get_default_ai_character'](), J = 0; J < a['length']; J++)
                            if (null == a[J]) {
                                a[J] = {
                                    nickname: S,
                                    avatar_id: Y,
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
                                        skin: Y,
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
                                            a[J].avatar_id = skin.id;
                                            a[J].character.charid = skin.character_id;
                                            a[J].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        a[J].nickname = '[BOT]' + a[J].nickname;
                                    }
                                }
                                // END
                            }
                        var p = Laya['Handler']['create'](K, function (H) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](l['config'], a, Laya['Handler']['create'](K, function () {
                                    K['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = O,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](l['config'])), a, z, view['EMJMode']['paipu'], Laya['Handler']['create'](K, function () {
                                            uiscript['UI_Replay'].Inst['initData'](H),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, K, function () {
                                                    K['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, K, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, K, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](K, function (H) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * H);
                                }, null, !1));
                        }),
                            D = {};
                        if (D['record'] = l, W.data && W.data['length'])
                            D.game = net['MessageWrapper']['decodeMessage'](W.data), p['runWith'](D);
                        else {
                            var k = W['data_url'];
                            k['startsWith']('http') || (k = H['prefix_url'] + k),
                                game['LoadMgr']['httpload'](k, 'arraybuffer', !1, Laya['Handler']['create'](K, function (H) {
                                    if (H['success']) {
                                        var F = new Laya.Byte();
                                        F['writeArrayBuffer'](H.data);
                                        var z = net['MessageWrapper']['decodeMessage'](F['getUint8Array'](0, F['length']));
                                        D.game = z,
                                            p['runWith'](D);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + W['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), K['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }












        // 牌谱功能
        !function (H) {
            var F = function () {
                function F(H) {
                    var F = this;
                    this.me = H,
                    this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        F['locking'] || F.hide(null);
                    }),
                    this['title'] = this.me['getChildByName']('title'),
                    this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                    this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                    this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                    this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                    this.me['visible'] = !1,
                    this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        F['locking'] || F.hide(null);
                    }, null, !1),
                    this['container_hidename'] = this.me['getChildByName']('hidename'),
                    this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var z = this['container_hidename']['getChildByName']('w0'),
                    O = this['container_hidename']['getChildByName']('w1');
                    O.x = z.x + z['textField']['textWidth'] + 10,
                    this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        F['sp_checkbox']['visible'] = !F['sp_checkbox']['visible'],
                        F['refresh_share_uuid']();
                    });
                }
                return F['prototype']['show_share'] = function (F) {
                    var z = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                    this['sp_checkbox']['visible'] = !1,
                    this['btn_confirm']['visible'] = !1,
                    this['input']['editable'] = !1,
                    this.uuid = F,
                    this['refresh_share_uuid'](),
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['container_hidename']['visible'] = !0,
                    this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                    H['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            z['locking'] = !1;
                        }));
                },
                F['prototype']['refresh_share_uuid'] = function () {
                    var H = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                    F = this.uuid,
                    z = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + z + '?paipu=' + game['Tools']['EncodePaipuUUID'](F) + '_a' + H + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + z + '?paipu=' + F + '_a' + H;
                },
                F['prototype']['show_check'] = function () {
                    var F = this;
                    return H['UI_PiPeiYuYue'].Inst['enable'] ? (H['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return F['input'].text ? (F.hide(Laya['Handler']['create'](F, function () {
                                        var H = F['input'].text['split']('='),
                                        z = H[H['length'] - 1]['split']('_'),
                                        O = 0;
                                        z['length'] > 1 && (O = 'a' == z[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(z[1]['substr'](1))) : parseInt(z[1]));
                                        var K = 0;
                                        if (z['length'] > 2) {
                                            var v = parseInt(z[2]);
                                            v && (K = v);
                                        }
                                        GameMgr.Inst['checkPaiPu'](z[0], O, K);
                                    })), void 0) : (H['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, H['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                                F['locking'] = !1;
                            })), void 0);
                },
                F['prototype'].hide = function (F) {
                    var z = this;
                    this['locking'] = !0,
                    H['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                            z['locking'] = !1,
                            z.me['visible'] = !1,
                            F && F.run();
                        }));
                },
                F;
            }
            (),
            z = function () {
                function F(H) {
                    var F = this;
                    this.me = H,
                    this['blackbg'] = H['getChildByName']('blackbg'),
                    this.root = H['getChildByName']('root'),
                    this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                        F['locking'] || F['close']();
                    }),
                    this['blackbg']['getChildAt'](0)['clickHandler'] = new Laya['Handler'](this, function () {
                        F['locking'] || F['close']();
                    }),
                    this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                        F['locking'] || (game['Tools']['calu_word_length'](F['input'].text) > 30 ? F['toolong']['visible'] = !0 : (F['close'](), v['addCollect'](F.uuid, F['start_time'], F['end_time'], F['input'].text)));
                    }),
                    this['toolong'] = this.root['getChildByName']('toolong');
                }
                return F['prototype'].show = function (F, z, O) {
                    var K = this;
                    this.uuid = F,
                    this['start_time'] = z,
                    this['end_time'] = O,
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['input'].text = '',
                    this['toolong']['visible'] = !1,
                    this['blackbg']['alpha'] = 0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0.5
                    }, 150),
                    H['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            K['locking'] = !1;
                        }));
                },
                F['prototype']['close'] = function () {
                    var F = this;
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0
                    }, 150),
                    H['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1,
                            F.me['visible'] = !1;
                        }));
                },
                F;
            }
            ();
            H['UI_Pop_CollectInput'] = z;
            var O;
            !function (H) {
                H[H.ALL = 0] = 'ALL',
                H[H['FRIEND'] = 1] = 'FRIEND',
                H[H.RANK = 2] = 'RANK',
                H[H['MATCH'] = 4] = 'MATCH',
                H[H['COLLECT'] = 100] = 'COLLECT';
            }
            (O || (O = {}));
            var K = function () {
                function F(H) {
                    this['uuid_list'] = [],
                    this.type = H,
                    this['reset']();
                }
                return F['prototype']['reset'] = function () {
                    this['count'] = 0,
                    this['true_count'] = 0,
                    this['have_more_paipu'] = !0,
                    this['uuid_list'] = [],
                    this['duringload'] = !1,
                    this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                F['prototype']['loadList'] = function (F) {
                    var z = this;
                    if (void 0 === F && (F = 10), !this['duringload'] && this['have_more_paipu']) {
                        if (this['duringload'] = !0, this.type == O['COLLECT']) {
                            for (var K = [], W = 0, L = 0; 10 > L; L++) {
                                var E = this['count'] + L;
                                if (E >= v['collect_lsts']['length'])
                                    break;
                                W++;
                                var l = v['collect_lsts'][E];
                                v['record_map'][l] || K.push(l),
                                this['uuid_list'].push(l);
                            }
                            K['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                uuid_list: K
                            }, function (F, O) {
                                if (z['duringload'] = !1, v.Inst['onLoadStateChange'](z.type, !1), F || O['error'])
                                    H['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', F, O);
                                else if (app.Log.log(JSON['stringify'](O)), O['record_list'] && O['record_list']['length'] == K['length']) {
                                    for (var L = 0; L < O['record_list']['length']; L++) {
                                        var E = O['record_list'][L].uuid;
                                        v['record_map'][E] || (v['record_map'][E] = O['record_list'][L]);
                                    }
                                    z['count'] += W,
                                    z['count'] >= v['collect_lsts']['length'] && (z['have_more_paipu'] = !1, v.Inst['onLoadOver'](z.type)),
                                    v.Inst['onLoadMoreLst'](z.type, W);
                                } else
                                    z['have_more_paipu'] = !1, v.Inst['onLoadOver'](z.type);
                            }) : (this['duringload'] = !1, this['count'] += W, this['count'] >= v['collect_lsts']['length'] && (this['have_more_paipu'] = !1, v.Inst['onLoadOver'](this.type)), v.Inst['onLoadMoreLst'](this.type, W));
                        } else
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                start: this['true_count'],
                                count: 10,
                                type: this.type
                            }, function (F, K) {
                                if (z['duringload'] = !1, v.Inst['onLoadStateChange'](z.type, !1), F || K['error'])
                                    H['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', F, K);
                                else if (app.Log.log(JSON['stringify'](K)), K['record_list'] && K['record_list']['length'] > 0) {
                                                        // START
                                                        if (MMP.settings.sendGame == true) {
                                                            (GM_xmlhttpRequest({
                                                                method: 'post',
                                                                url: MMP.settings.sendGameURL,
                                                                data: JSON.stringify(K),
                                                                onload: function (msg) {
                                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(K));
                                                                }
                                                            }));
                                                            for (let record_list of K['record_list']) {
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
                                    for (var W = K['record_list'], L = 0, E = 0; E < W['length']; E++) {
                                        var l = W[E].uuid;
                                        if (z.type == O.RANK && W[E]['config'] && W[E]['config'].meta) {
                                            var a = W[E]['config'].meta;
                                            if (a) {
                                                var S = cfg['desktop']['matchmode'].get(a['mode_id']);
                                                if (S && 5 == S.room)
                                                    continue;
                                            }
                                        }
                                        L++,
                                        z['uuid_list'].push(l),
                                        v['record_map'][l] || (v['record_map'][l] = W[E]);
                                    }
                                    z['count'] += L,
                                    z['true_count'] += W['length'],
                                    v.Inst['onLoadMoreLst'](z.type, L),
                                    z['have_more_paipu'] = !0;
                                } else
                                    z['have_more_paipu'] = !1, v.Inst['onLoadOver'](z.type);
                            });
                        Laya['timer'].once(700, this, function () {
                            z['duringload'] && v.Inst['onLoadStateChange'](z.type, !0);
                        });
                    }
                },
                F['prototype']['removeAt'] = function (H) {
                    for (var F = 0; F < this['uuid_list']['length'] - 1; F++)
                        F >= H && (this['uuid_list'][F] = this['uuid_list'][F + 1]);
                    this['uuid_list'].pop(),
                    this['count']--,
                    this['true_count']--;
                },
                F;
            }
            (),
            v = function (v) {
                function W() {
                    var H = v.call(this, new ui['lobby']['paipuUI']()) || this;
                    return H.top = null,
                    H['container_scrollview'] = null,
                    H['scrollview'] = null,
                    H['loading'] = null,
                    H.tabs = [],
                    H['pop_otherpaipu'] = null,
                    H['pop_collectinput'] = null,
                    H['label_collect_count'] = null,
                    H['noinfo'] = null,
                    H['locking'] = !1,
                    H['current_type'] = O.ALL,
                    W.Inst = H,
                    H;
                }
                return __extends(W, v),
                W.init = function () {
                    var H = this;
                    this['paipuLst'][O.ALL] = new K(O.ALL),
                    this['paipuLst'][O['FRIEND']] = new K(O['FRIEND']),
                    this['paipuLst'][O.RANK] = new K(O.RANK),
                    this['paipuLst'][O['MATCH']] = new K(O['MATCH']),
                    this['paipuLst'][O['COLLECT']] = new K(O['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (F, z) {
                        if (F || z['error']);
                        else {
                            if (z['record_list']) {
                                for (var O = z['record_list'], K = 0; K < O['length']; K++) {
                                    var v = {
                                        uuid: O[K].uuid,
                                        time: O[K]['end_time'],
                                        remarks: O[K]['remarks']
                                    };
                                    H['collect_lsts'].push(v.uuid),
                                    H['collect_info'][v.uuid] = v;
                                }
                                H['collect_lsts'] = H['collect_lsts'].sort(function (F, z) {
                                    return H['collect_info'][z].time - H['collect_info'][F].time;
                                });
                            }
                            z['record_collect_limit'] && (H['collect_limit'] = z['record_collect_limit']);
                        }
                    });
                },
                W['onFetchSuccess'] = function (H) {
                    var F = this;
                    this['paipuLst'][O.ALL] = new K(O.ALL),
                    this['paipuLst'][O['FRIEND']] = new K(O['FRIEND']),
                    this['paipuLst'][O.RANK] = new K(O.RANK),
                    this['paipuLst'][O['MATCH']] = new K(O['MATCH']),
                    this['paipuLst'][O['COLLECT']] = new K(O['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {};
                    var z = H['collected_game_record_list'];
                    if (z['record_list']) {
                        for (var v = z['record_list'], W = 0; W < v['length']; W++) {
                            var L = {
                                uuid: v[W].uuid,
                                time: v[W]['end_time'],
                                remarks: v[W]['remarks']
                            };
                            this['collect_lsts'].push(L.uuid),
                            this['collect_info'][L.uuid] = L;
                        }
                        this['collect_lsts'] = this['collect_lsts'].sort(function (H, z) {
                            return F['collect_info'][z].time - F['collect_info'][H].time;
                        });
                    }
                    z['record_collect_limit'] && (this['collect_limit'] = z['record_collect_limit']);
                },
                W['onAccountUpdate'] = function () {
                    this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                },
                W['reset'] = function () {
                    this['paipuLst'][O.ALL] && this['paipuLst'][O.ALL]['reset'](),
                    this['paipuLst'][O['FRIEND']] && this['paipuLst'][O['FRIEND']]['reset'](),
                    this['paipuLst'][O.RANK] && this['paipuLst'][O.RANK]['reset'](),
                    this['paipuLst'][O['MATCH']] && this['paipuLst'][O['MATCH']]['reset']();
                },
                W['addCollect'] = function (F, z, O, K) {
                    var v = this;
                    if (!this['collect_info'][F]) {
                        if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                            return H['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2767)), void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                            uuid: F,
                            remarks: K,
                            start_time: z,
                            end_time: O
                        }, function () {});
                        var L = {
                            uuid: F,
                            remarks: K,
                            time: O
                        };
                        this['collect_info'][F] = L,
                        this['collect_lsts'].push(F),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (H, F) {
                            return v['collect_info'][F].time - v['collect_info'][H].time;
                        }),
                        H['UI_DesktopInfo'].Inst && H['UI_DesktopInfo'].Inst['enable'] && H['UI_DesktopInfo'].Inst['onCollectChange'](),
                        W.Inst && W.Inst['enable'] && W.Inst['onCollectChange'](F, -1);
                    }
                },
                W['removeCollect'] = function (F) {
                    var z = this;
                    if (this['collect_info'][F]) {
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                            uuid: F
                        }, function () {}),
                        delete this['collect_info'][F];
                        for (var O = -1, K = 0; K < this['collect_lsts']['length']; K++)
                            if (this['collect_lsts'][K] == F) {
                                this['collect_lsts'][K] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                O = K;
                                break;
                            }
                        this['collect_lsts'].pop(),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (H, F) {
                            return z['collect_info'][F].time - z['collect_info'][H].time;
                        }),
                        H['UI_DesktopInfo'].Inst && H['UI_DesktopInfo'].Inst['enable'] && H['UI_DesktopInfo'].Inst['onCollectChange'](),
                        W.Inst && W.Inst['enable'] && W.Inst['onCollectChange'](F, O);
                    }
                },
                W['prototype']['onCreate'] = function () {
                    var O = this;
                    this.top = this.me['getChildByName']('top'),
                    this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        O['locking'] || O['close'](Laya['Handler']['create'](O, function () {
                                H['UIMgr'].Inst['showLobby']();
                            }));
                    }, null, !1),
                    this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                    this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (H) {
                            O['setItemValue'](H['index'], H['container']);
                        }, null, !1)),
                    this['scrollview']['setElastic'](),
                    this['container_scrollview'].on('ratechange', this, function () {
                        var H = W['paipuLst'][O['current_type']];
                        (1 - O['scrollview'].rate) * H['count'] < 3 && (H['duringload'] || (H['have_more_paipu'] ? H['loadList']() : 0 == H['count'] && (O['noinfo']['visible'] = !0)));
                    }),
                    this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                    this['loading']['visible'] = !1,
                    this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        O['pop_otherpaipu'].me['visible'] || O['pop_otherpaipu']['show_check']();
                    }, null, !1),
                    this.tabs = [];
                    for (var K = 0; 5 > K; K++)
                        this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](K)), this.tabs[K]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [K, !1]);
                    this['pop_otherpaipu'] = new F(this.me['getChildByName']('pop_otherpaipu')),
                    this['pop_collectinput'] = new z(this.me['getChildByName']('pop_collect')),
                    this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                    this['label_collect_count'].text = '0/20',
                    this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                },
                W['prototype'].show = function () {
                    var F = this;
                    GameMgr.Inst['BehavioralStatistics'](20),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['pop_otherpaipu'].me['visible'] = !1,
                    this['pop_collectinput'].me['visible'] = !1,
                    H['UIBase']['anim_alpha_in'](this.top, {
                        y: -30
                    }, 200),
                    H['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                        y: 30
                    }, 200),
                    this['locking'] = !0,
                    this['loading']['visible'] = !1,
                    Laya['timer'].once(200, this, function () {
                        F['locking'] = !1;
                    }),
                    this['changeTab'](0, !0),
                    this['label_collect_count'].text = W['collect_lsts']['length']['toString']() + '/' + W['collect_limit']['toString']();
                },
                W['prototype']['close'] = function (F) {
                    var z = this;
                    this['locking'] = !0,
                    H['UIBase']['anim_alpha_out'](this.top, {
                        y: -30
                    }, 150),
                    H['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                        y: 30
                    }, 150),
                    Laya['timer'].once(150, this, function () {
                        z['locking'] = !1,
                        z['enable'] = !1,
                        F && F.run();
                    });
                },
                W['prototype']['changeTab'] = function (H, F) {
                    var z = [O.ALL, O.RANK, O['FRIEND'], O['MATCH'], O['COLLECT']];
                    if (F || z[H] != this['current_type']) {
                        if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = z[H], this['current_type'] == O['COLLECT'] && W['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != O['COLLECT']) {
                            var K = W['paipuLst'][this['current_type']]['count'];
                            K > 0 && this['scrollview']['addItem'](K);
                        }
                        for (var v = 0; v < this.tabs['length']; v++) {
                            var L = this.tabs[v];
                            L['getChildByName']('img').skin = game['Tools']['localUISrc'](H == v ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                            L['getChildByName']('label_name')['color'] = H == v ? '#d9b263' : '#8cb65f';
                        }
                    }
                },
                W['prototype']['setItemValue'] = function (F, z) {
                    var O = this;
                    if (this['enable']) {
                        var K = W['paipuLst'][this['current_type']];
                        if (K || !(F >= K['uuid_list']['length'])) {
                            for (var v = W['record_map'][K['uuid_list'][F]], L = 0; 4 > L; L++) {
                                var E = z['getChildByName']('p' + L['toString']());
                                if (L < v['result']['players']['length']) {
                                    E['visible'] = !0;
                                    var l = E['getChildByName']('chosen'),
                                    a = E['getChildByName']('rank'),
                                    S = E['getChildByName']('rank_word'),
                                    V = E['getChildByName']('name'),
                                    d = E['getChildByName']('score'),
                                    J = v['result']['players'][L];
                                    d.text = J['part_point_1'] || '0';
                                    for (var P = 0, t = game['Tools']['strOfLocalization'](2133), r = 0, N = !1, j = 0; j < v['accounts']['length']; j++)
                                        if (v['accounts'][j].seat == J.seat) {
                                            P = v['accounts'][j]['account_id'],
                                            t = v['accounts'][j]['nickname'],
                                            r = v['accounts'][j]['verified'],
                                            N = v['accounts'][j]['account_id'] == GameMgr.Inst['account_id'];
                                            break;
                                        }
                                    game['Tools']['SetNickname'](V, {
                                        account_id: P,
                                        nickname: t,
                                        verified: r
                                    }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                    l['visible'] = N,
                                    d['color'] = N ? '#ffc458' : '#b98930',
                                    V['getChildByName']('name')['color'] = N ? '#dfdfdf' : '#a0a0a0',
                                    S['color'] = a['color'] = N ? '#57bbdf' : '#489dbc';
                                    var _ = E['getChildByName']('rank_word');
                                    if ('en' == GameMgr['client_language'])
                                        switch (L) {
                                        case 0:
                                            _.text = 'st';
                                            break;
                                        case 1:
                                            _.text = 'nd';
                                            break;
                                        case 2:
                                            _.text = 'rd';
                                            break;
                                        case 3:
                                            _.text = 'th';
                                        }
                                } else
                                    E['visible'] = !1;
                            }
                            var x = new Date(1000 * v['end_time']),
                            n = '';
                            n += x['getFullYear']() + '/',
                            n += (x['getMonth']() < 9 ? '0' : '') + (x['getMonth']() + 1)['toString']() + '/',
                            n += (x['getDate']() < 10 ? '0' : '') + x['getDate']() + ' ',
                            n += (x['getHours']() < 10 ? '0' : '') + x['getHours']() + ':',
                            n += (x['getMinutes']() < 10 ? '0' : '') + x['getMinutes'](),
                            z['getChildByName']('date').text = n,
                            z['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                return O['locking'] ? void 0 : H['UI_PiPeiYuYue'].Inst['enable'] ? (H['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](v.uuid, GameMgr.Inst['account_id'], 0), void 0);
                            }, null, !1),
                            z['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                O['locking'] || O['pop_otherpaipu'].me['visible'] || (O['pop_otherpaipu']['show_share'](v.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                            }, null, !1);
                            var h = z['getChildByName']('room'),
                            g = game['Tools']['get_room_desc'](v['config']);
                            h.text = g.text;
                            var i = '';
                            if (1 == v['config']['category'])
                                i = game['Tools']['strOfLocalization'](2023);
                            else if (4 == v['config']['category'])
                                i = game['Tools']['strOfLocalization'](2025);
                            else if (2 == v['config']['category']) {
                                var Y = v['config'].meta;
                                if (Y) {
                                    var f = cfg['desktop']['matchmode'].get(Y['mode_id']);
                                    f && (i = f['room_name_' + GameMgr['client_language']]);
                                }
                            }
                            if (W['collect_info'][v.uuid]) {
                                var p = W['collect_info'][v.uuid],
                                D = z['getChildByName']('remarks_info'),
                                k = z['getChildByName']('input'),
                                y = k['getChildByName']('txtinput'),
                                A = z['getChildByName']('btn_input'),
                                Z = !1,
                                T = function () {
                                    Z ? (D['visible'] = !1, k['visible'] = !0, y.text = D.text, A['visible'] = !1) : (D.text = p['remarks'] && '' != p['remarks'] ? game['Tools']['strWithoutForbidden'](p['remarks']) : i, D['visible'] = !0, k['visible'] = !1, A['visible'] = !0);
                                };
                                T(),
                                A['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Z = !0,
                                    T();
                                }, null, !1),
                                y.on('blur', this, function () {
                                    Z && (game['Tools']['calu_word_length'](y.text) > 30 ? H['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2765)) : y.text != p['remarks'] && (p['remarks'] = y.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                uuid: v.uuid,
                                                remarks: y.text
                                            }, function () {}))),
                                    Z = !1,
                                    T();
                                });
                                var e = z['getChildByName']('collect');
                                e['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](O, function () {
                                            W['removeCollect'](v.uuid);
                                        }));
                                }, null, !1),
                                e['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                            } else {
                                z['getChildByName']('input')['visible'] = !1,
                                z['getChildByName']('btn_input')['visible'] = !1,
                                z['getChildByName']('remarks_info')['visible'] = !0,
                                z['getChildByName']('remarks_info').text = i;
                                var e = z['getChildByName']('collect');
                                e['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    O['pop_collectinput'].show(v.uuid, v['start_time'], v['end_time']);
                                }, null, !1),
                                e['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                            }
                        }
                    }
                },
                W['prototype']['onLoadStateChange'] = function (H, F) {
                    this['current_type'] == H && (this['loading']['visible'] = F);
                },
                W['prototype']['onLoadMoreLst'] = function (H, F) {
                    this['current_type'] == H && this['scrollview']['addItem'](F);
                },
                W['prototype']['getScrollViewCount'] = function () {
                    return this['scrollview']['value_count'];
                },
                W['prototype']['onLoadOver'] = function (H) {
                    if (this['current_type'] == H) {
                        var F = W['paipuLst'][this['current_type']];
                        0 == F['count'] && (this['noinfo']['visible'] = !0);
                    }
                },
                W['prototype']['onCollectChange'] = function (H, F) {
                    if (this['current_type'] == O['COLLECT'])
                        F >= 0 && (W['paipuLst'][O['COLLECT']]['removeAt'](F), this['scrollview']['delItem'](F));
                    else
                        for (var z = W['paipuLst'][this['current_type']]['uuid_list'], K = 0; K < z['length']; K++)
                            if (z[K] == H) {
                                this['scrollview']['wantToRefreshItem'](K);
                                break;
                            }
                    this['label_collect_count'].text = W['collect_lsts']['length']['toString']() + '/' + W['collect_limit']['toString']();
                },
                W['prototype']['refreshAll'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                W.Inst = null,
                W['paipuLst'] = {},
                W['collect_lsts'] = [],
                W['record_map'] = {},
                W['collect_info'] = {},
                W['collect_limit'] = 20,
                W;
            }
            (H['UIBase']);
            H['UI_PaiPu'] = v;
        }
        (uiscript || (uiscript = {}));
        












        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var H = GameMgr;
            var F = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), this['use_fetch_info'] || (app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (H, z) {
                H || z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', H, z) : F['server_time_delta'] = 1000 * z['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (H, z) {
                H || z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', H, z) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](z)), F['updateServerSettings'](z['settings']));
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (H, z) {
                H || z['error'] || (F['client_endpoint'] = z['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (H) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](H));
                var z = H['update'];
                if (z) {
                    if (z['numerical'])
                        for (var O = 0; O < z['numerical']['length']; O++) {
                            var K = z['numerical'][O].id,
                                v = z['numerical'][O]['final'];
                            switch (K) {
                                case '100001':
                                    F['account_data']['diamond'] = v;
                                    break;
                                case '100002':
                                    F['account_data'].gold = v;
                                    break;
                                case '100099':
                                    F['account_data'].vip = v,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (K >= '101001' || '102999' >= K) && (F['account_numerical_resource'][K] = v);
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
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (H) {
                app.Log.log('收到消息：' + JSON['stringify'](H)),
                    H.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](H['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (H) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    H['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](H['settings']), H['settings']['nickname_setting'] && (F['nickname_replace_enable'] = !!H['settings']['nickname_setting']['enable'], F['nickname_replace_lst'] = H['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = H['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (H) {
                uiscript['UI_Sushe']['send_gift_limit'] = H['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = H['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = H['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = H['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = H['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (H) {
                game['Tools']['showGuaJiChengFa'](H);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (H) {
                F['auth_check_id'] = H['check_id'],
                    F['auth_nc_retry_count'] = 0,
                    4 == H.type ? F['showNECaptcha']() : 2 == H.type ? F['checkNc']() : F['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (H, z) {
                        H || z['error'] || (F['server_time_delta'] = 1000 * z['server_time'] - Laya['timer']['currTimer']);
                    });
                    var H = (Laya['timer']['currTimer'] - F['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: H
                    }, function () { }),
                        H >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var H = Laya['stage']['getMousePoint']();
                (H.x != F['_pre_mouse_point'].x || H.y != F['_pre_mouse_point'].y) && (F['clientHeatBeat'](), F['_pre_mouse_point'].x = H.x, F['_pre_mouse_point'].y = H.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == H['client_type'] && Laya['timer'].loop(3600000, this, function () {
                F['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == H['client_language']) {
                var z = document['createElement']('link');
                z.rel = 'stylesheet',
                    z.href = 'font/notosansjapanese_1.css';
                var O = document['getElementsByTagName']('head')[0];
                O['appendChild'](z);
            }
        },








            // 设置状态
            !function (H) {
                var F = function () {
                    function H(F) {
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
                            H.Inst = this,
                            this.me = F,
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
                    return Object['defineProperty'](H['prototype'], 'timeuse', {
                        get: function () {
                            return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        H['prototype']['reset'] = function () {
                            this.me['visible'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        H['prototype']['showCD'] = function (H, F) {
                            var z = this;
                            this.me['visible'] = !0,
                                this['_start'] = Laya['timer']['currTimer'],
                                this._fix = Math['floor'](H / 1000),
                                this._add = Math['floor'](F / 1000),
                                this['_pre_sec'] = -1,
                                this['_pre_time'] = Laya['timer']['currTimer'],
                                this['_show'](),
                                Laya['timer']['frameLoop'](1, this, function () {
                                    var H = Laya['timer']['currTimer'] - z['_pre_time'];
                                    z['_pre_time'] = Laya['timer']['currTimer'],
                                        view['DesktopMgr'].Inst['timestoped'] ? z['_start'] += H : z['_show']();
                                });
                        },
                        H['prototype']['close'] = function () {
                            this['reset']();
                        },
                        H['prototype']['_show'] = function () {
                            var H = this._fix + this._add - this['timeuse'];
                            if (0 >= H)
                                return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                            if (H != this['_pre_sec']) {
                                if (this['_pre_sec'] = H, H > this._add) {
                                    for (var F = (H - this._add)['toString'](), z = 0; z < this['_img_countdown_c0']['length']; z++)
                                        this['_img_countdown_c0'][z]['visible'] = z < F['length'];
                                    if (3 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[2] + '.png')) : 2 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png'), 0 != this._add) {
                                        this['_img_countdown_plus']['visible'] = !0;
                                        for (var O = this._add['toString'](), z = 0; z < this['_img_countdown_add']['length']; z++) {
                                            var K = this['_img_countdown_add'][z];
                                            z < O['length'] ? (K['visible'] = !0, K.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + O[z] + '.png')) : K['visible'] = !1;
                                        }
                                    } else {
                                        this['_img_countdown_plus']['visible'] = !1;
                                        for (var z = 0; z < this['_img_countdown_add']['length']; z++)
                                            this['_img_countdown_add'][z]['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var F = H['toString'](), z = 0; z < this['_img_countdown_c0']['length']; z++)
                                        this['_img_countdown_c0'][z]['visible'] = z < F['length'];
                                    3 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[2] + '.png')) : 2 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png');
                                }
                                if (H > 3) {
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
                                    L.Inst.me.cd1.play(0, !1);
                                }
                            }
                        },
                        H.Inst = null,
                        H;
                }
                    (),
                    z = function () {
                        function H(H) {
                            this['timer_id'] = 0,
                                this['last_returned'] = !1,
                                this.me = H;
                        }
                        return H['prototype']['begin_refresh'] = function () {
                            this['timer_id'] && clearTimeout(this['timer_id']),
                                this['last_returned'] = !0,
                                this['_loop_refresh_delay'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer'].loop(100, this, this['_loop_show']);
                        },
                            H['prototype']['close_refresh'] = function () {
                                this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                    this['last_returned'] = !1,
                                    Laya['timer']['clearAll'](this);
                            },
                            H['prototype']['_loop_refresh_delay'] = function () {
                                var H = this;
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                    var F = 2000;
                                    if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                        var z = app['NetAgent']['mj_network_delay'];
                                        F = 300 > z ? 2000 : 800 > z ? 2500 + z : 4000 + 0.5 * z,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                                H['last_returned'] = !0;
                                            }),
                                            this['last_returned'] = !1;
                                    } else
                                        F = 1000;
                                    this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), F);
                                }
                            },
                            H['prototype']['_loop_show'] = function () {
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                    if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                        this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                    else {
                                        var H = app['NetAgent']['mj_network_delay'];
                                        this.me.skin = 300 > H ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > H ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                    }
                            },
                            H;
                    }
                        (),
                    O = function () {
                        function H(H, F) {
                            var z = this;
                            this['enable'] = !1,
                                this['emj_banned'] = !1,
                                this['locking'] = !1,
                                this['localposition'] = F,
                                this.me = H,
                                this['btn_banemj'] = H['getChildByName']('btn_banemj'),
                                this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                                this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                                this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                                this['btn_seeinfo'] = H['getChildByName']('btn_seeinfo'),
                                this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                                this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                                this['btn_change'] = H['getChildByName']('btn_change'),
                                this['btn_change_origin_x'] = this['btn_change'].x,
                                this['btn_change_origin_y'] = this['btn_change'].y,
                                this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || (z['emj_banned'] = !z['emj_banned'], z['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (z['emj_banned'] ? '_on.png' : '.png')), z['close']());
                                }, null, !1),
                                this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || (z['close'](), L.Inst['btn_seeinfo'](z['localposition']));
                                }, null, !1),
                                this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || (z['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](z['localposition'])));
                                }, null, !1),
                                this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || z['switch']();
                                }, null, !1);
                        }
                        return H['prototype']['reset'] = function (H, F, z) {
                            Laya['timer']['clearAll'](this),
                                this['locking'] = !1,
                                this['enable'] = !1,
                                this['showinfo'] = H,
                                this['showemj'] = F,
                                this['showchange'] = z,
                                this['emj_banned'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                                this['btn_change']['visible'] = !1;
                        },
                            H['prototype']['onChangeSeat'] = function (H, F, z) {
                                this['showinfo'] = H,
                                    this['showemj'] = F,
                                    this['showchange'] = z,
                                    this['enable'] = !1,
                                    this['btn_banemj']['visible'] = !1,
                                    this['btn_seeinfo']['visible'] = !1,
                                    this['btn_change']['visible'] = !1;
                            },
                            H['prototype']['switch'] = function () {
                                var H = this;
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
                                    H['locking'] = !1;
                                })));
                            },
                            H['prototype']['close'] = function () {
                                var H = this;
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
                                        H['locking'] = !1,
                                            H['btn_banemj']['visible'] = !1,
                                            H['btn_seeinfo']['visible'] = !1,
                                            H['btn_change']['visible'] = !1;
                                    });
                            },
                            H;
                    }
                        (),
                    K = function () {
                        function H(H) {
                            var F = this;
                            this['btn_emos'] = [],
                                this.emos = [],
                                this['allgray'] = !1,
                                this.me = H,
                                this.in = this.me['getChildByName']('in'),
                                this.out = this.me['getChildByName']('out'),
                                this['in_out'] = this.in['getChildByName']('in_out'),
                                this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                                this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                                this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                    F['switchShow'](!0);
                                }),
                                this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                                this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                    F['switchShow'](!1);
                                }),
                                this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                                this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                                this['scrollview']['reset'](),
                                this['scrollbar'].init(null),
                                this['scrollview'].me.on('ratechange', this, function () {
                                    F['scrollview']['total_height'] > 0 ? F['scrollbar']['setVal'](F['scrollview'].rate, F['scrollview']['view_height'] / F['scrollview']['total_height']) : F['scrollbar']['setVal'](0, 1);
                                }),
                                'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                        }
                        return H['prototype']['initRoom'] = function () {
                            var H = view['DesktopMgr'].Inst['main_role_character_info'],
                                F = cfg['item_definition']['character'].find(H['charid']);
                            this['emo_log_count'] = 0,
                                this.emos = [];
                            for (var z = 0; 9 > z; z++)
                                this.emos.push({
                                    path: F.emo + '/' + z + '.png',
                                    sub_id: z,
                                    sort: z
                                });
                            if (H['extra_emoji'])
                                for (var z = 0; z < H['extra_emoji']['length']; z++)
                                    this.emos.push({
                                        path: F.emo + '/' + H['extra_emoji'][z] + '.png',
                                        sub_id: H['extra_emoji'][z],
                                        sort: H['extra_emoji'][z] > 12 ? 1000000 - H['extra_emoji'][z] : H['extra_emoji'][z]
                                    });
                            this.emos = this.emos.sort(function (H, F) {
                                return H.sort - F.sort;
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
                                    char_id: H['charid'],
                                    emoji: [],
                                    server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                                };
                        },
                            H['prototype']['render_item'] = function (H) {
                                var F = this,
                                    z = H['index'],
                                    O = H['container'],
                                    K = this.emos[z],
                                    v = O['getChildByName']('btn');
                                v.skin = game['LoadMgr']['getResImageSkin'](K.path),
                                    this['allgray'] ? game['Tools']['setGrayDisable'](v, !0) : (game['Tools']['setGrayDisable'](v, !1), v['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        if (app['NetAgent']['isMJConnectOK']()) {
                                            GameMgr.Inst['BehavioralStatistics'](22);
                                            for (var H = !1, z = 0, O = F['emo_infos']['emoji']; z < O['length']; z++) {
                                                var v = O[z];
                                                if (v[0] == K['sub_id']) {
                                                    v[0]++,
                                                        H = !0;
                                                    break;
                                                }
                                            }
                                            H || F['emo_infos']['emoji'].push([K['sub_id'], 1]),
                                                app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                    content: JSON['stringify']({
                                                        emo: K['sub_id']
                                                    }),
                                                    except_self: !1
                                                }, function () { });
                                        }
                                        F['change_all_gray'](!0),
                                            Laya['timer'].once(5000, F, function () {
                                                F['change_all_gray'](!1);
                                            }),
                                            F['switchShow'](!1);
                                    }, null, !1));
                            },
                            H['prototype']['change_all_gray'] = function (H) {
                                this['allgray'] = H,
                                    this['scrollview']['wantToRefreshAll']();
                            },
                            H['prototype']['switchShow'] = function (H) {
                                var F = this,
                                    z = 0;
                                z = H ? 1367 : 1896,
                                    Laya['Tween'].to(this.me, {
                                        x: 1972
                                    }, H ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                        H ? (F.out['visible'] = !1, F.in['visible'] = !0) : (F.out['visible'] = !0, F.in['visible'] = !1),
                                            Laya['Tween'].to(F.me, {
                                                x: z
                                            }, H ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](F, function () {
                                                F['btn_chat']['disabled'] = !1,
                                                    F['btn_chat_in']['disabled'] = !1;
                                            }), 0, !0, !0);
                                    }), 0, !0, !0),
                                    this['btn_chat']['disabled'] = !0,
                                    this['btn_chat_in']['disabled'] = !0;
                            },
                            H['prototype']['sendEmoLogUp'] = function () {
                                // START
                                //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                //    var H = GameMgr.Inst['getMouse']();
                                //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                                //        data: this['emo_infos'],
                                //        m: view['DesktopMgr']['click_prefer'],
                                //        d: H,
                                //        e: window['innerHeight'] / 2,
                                //        f: window['innerWidth'] / 2,
                                //        t: L.Inst['min_double_time'],
                                //        g: L.Inst['max_double_time']
                                //    }, !1),
                                //    this['emo_infos']['emoji'] = [];
                                // }
                                // this['emo_log_count']++;
                                // END
                            },
                            H['prototype']['reset'] = function () {
                                this['emo_infos'] = null,
                                    this['scrollbar']['reset'](),
                                    this['scrollview']['reset']();
                            },
                            H;
                    }
                        (),
                    v = function () {
                        function F(F) {
                            this['effect'] = null,
                                this['container_emo'] = F['getChildByName']('chat_bubble'),
                                this.emo = new H['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                                this['root_effect'] = F['getChildByName']('root_effect'),
                                this['container_emo']['visible'] = !1;
                        }
                        return F['prototype'].show = function (H, F) {
                            var z = this;
                            if (!view['DesktopMgr'].Inst['emoji_switch']) {
                                for (var O = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](H)]['character']['charid'], K = cfg['character']['emoji']['getGroup'](O), v = '', W = 0, L = 10 > F, E = 0; E < K['length']; E++)
                                    if (K[E]['sub_id'] == F) {
                                        L = !0,
                                            2 == K[E].type && (v = K[E].view, W = K[E]['audio']);
                                        break;
                                    }
                                L || (F = 0),
                                    this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                    v ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + v + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                        z['effect'] && (z['effect']['destory'](), z['effect'] = null);
                                    }), W && view['AudioMgr']['PlayAudio'](W)) : (this.emo['setSkin'](O, F), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
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
                            F['prototype']['reset'] = function () {
                                Laya['timer']['clearAll'](this),
                                    this.emo['clear'](),
                                    this['container_emo']['visible'] = !1,
                                    this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                            },
                            F;
                    }
                        (),
                    W = function () {
                        function H(H, F) {
                            if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = F, this.me = H, 0 == F) {
                                var z = H['getChildByName']('moqie');
                                this['moqie'] = z['getChildByName']('moqie'),
                                    this['tip_moqie'] = z['getChildByName']('tip'),
                                    this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                                    this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                                    this['points_moqie'] = [];
                                var O = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                                this['points_moqie'].push(O);
                                for (var K = 0; 5 > K; K++) {
                                    var v = O['scriptMap']['capsui.UICopy']['getNodeClone']();
                                    this['points_moqie'].push(v);
                                }
                                var W = H['getChildByName']('shouqie');
                                this['shouqie'] = W['getChildByName']('shouqie'),
                                    this['tip_shouqie'] = W['getChildByName']('tip'),
                                    this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                                    this['points_shouqie'] = [],
                                    this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                                    O = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                                    this['points_shouqie'].push(O);
                                for (var K = 0; 5 > K; K++) {
                                    var v = O['scriptMap']['capsui.UICopy']['getNodeClone']();
                                    this['points_shouqie'].push(v);
                                }
                                'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                            } else
                                this['moqie'] = H['getChildByName']('moqie'), this['shouqie'] = H['getChildByName']('shouqie');
                            this['star_moqie'] = this['moqie']['getChildByName']('star'),
                                this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                        }
                        return H['prototype'].show = function (H, F, z, O, K) {
                            var v = this;
                            if (this.me['visible'] = !0, F != this['_now_moqie_bonus']) {
                                if (this['_now_moqie_bonus'] = F, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + F + '.png'), K) {
                                    var W = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                                    W['parent']['setChildIndex'](W, 1),
                                        Laya['Tween']['clearAll'](this['moqie']),
                                        Laya['Tween'].to(this['moqie'], {
                                            scaleX: 4,
                                            scaleY: 4
                                        }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                            Laya['Tween'].to(v['moqie'], {
                                                scaleX: 1,
                                                scaleY: 1
                                            }, 300, Laya.Ease['quadOut'], null, 100);
                                        }));
                                }
                                this['star_moqie']['visible'] = F == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                            }
                            if (O != this['_now_shouqie_bonus']) {
                                if (this['_now_shouqie_bonus'] = O, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + O + '.png'), K) {
                                    var W = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                                    W['parent']['setChildIndex'](W, 1),
                                        Laya['Tween']['clearAll'](this['shouqie']),
                                        Laya['Tween'].to(this['shouqie'], {
                                            scaleX: 4,
                                            scaleY: 4
                                        }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                            Laya['Tween'].to(v['shouqie'], {
                                                scaleX: 1,
                                                scaleY: 1
                                            }, 300, Laya.Ease['quadOut'], null, 100);
                                        }));
                                }
                                this['star_shouqie']['visible'] = O == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                            }
                            if (0 == this['index']) {
                                for (var L = this['_fan_counts']['indexOf'](F), E = this['_moqie_counts'][L + 1] - this['_moqie_counts'][L], l = H - this['_moqie_counts'][L], a = 0; a < this['points_moqie']['length']; a++) {
                                    var S = this['points_moqie'][a];
                                    if (E > a) {
                                        S['visible'] = !0;
                                        var V = a / E * 2 * Math.PI;
                                        S.pos(27 * Math.sin(V) + 27, 27 - 27 * Math.cos(V)),
                                            S.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (l > a ? 'l.png' : 'd.png'));
                                    } else
                                        S['visible'] = !1;
                                }
                                this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + H]),
                                    this['circle_moqie']['visible'] = F != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                                    L = this['_fan_counts']['indexOf'](O),
                                    E = this['_shouqie_counts'][L + 1] - this['_shouqie_counts'][L],
                                    l = z - this['_shouqie_counts'][L];
                                for (var a = 0; a < this['points_shouqie']['length']; a++) {
                                    var S = this['points_shouqie'][a];
                                    if (E > a) {
                                        S['visible'] = !0;
                                        var V = a / E * 2 * Math.PI;
                                        S.pos(27 * Math.sin(V) + 27, 27 - 27 * Math.cos(V)),
                                            S.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (l > a ? 'l.png' : 'd.png'));
                                    } else
                                        S['visible'] = !1;
                                }
                                this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + z]),
                                    this['circle_shouqie']['visible'] = O != this['_fan_counts'][this['_fan_counts']['length'] - 1];
                            }
                        },
                            H['prototype']['resetToStart'] = function () {
                                var H = this;
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
                                        H['_update']();
                                    }),
                                    this['_anim_start_time'] = Laya['timer']['currTimer'],
                                    this['_update'](),
                                    this['star_moqie']['visible'] = !1,
                                    this['star_shouqie']['visible'] = !1,
                                    0 == this['index'] && (this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['0']), this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['0']));
                            },
                            H['prototype'].hide = function () {
                                Laya['timer']['clearAll'](this),
                                    this.me['visible'] = !1;
                            },
                            H['prototype']['_update'] = function () {
                                var H = (Laya['timer']['currTimer'] - this['_anim_start_time']) / 2000 % 1,
                                    F = 1.4 * Math.abs(H - 0.5) + 0.8;
                                this['star_moqie']['getChildAt'](0)['scale'](F, F),
                                    this['star_shouqie']['getChildAt'](0)['scale'](F, F),
                                    H = (H + 0.4) % 1;
                                var z = 1.4 * Math.abs(H - 0.5) + 0.8;
                                this['star_moqie']['getChildAt'](1)['scale'](z, z),
                                    this['star_shouqie']['getChildAt'](1)['scale'](z, z);
                            },
                            H;
                    }
                        (),
                    L = function (L) {
                        function E() {
                            var H = L.call(this, new ui.mj['desktopInfoUI']()) || this;
                            return H['container_doras'] = null,
                                H['doras'] = [],
                                H['front_doras'] = [],
                                H['label_md5'] = null,
                                H['container_gamemode'] = null,
                                H['label_gamemode'] = null,
                                H['btn_auto_moqie'] = null,
                                H['btn_auto_nofulu'] = null,
                                H['btn_auto_hule'] = null,
                                H['img_zhenting'] = null,
                                H['btn_double_pass'] = null,
                                H['_network_delay'] = null,
                                H['_timecd'] = null,
                                H['_player_infos'] = [],
                                H['_container_fun'] = null,
                                H['_fun_in'] = null,
                                H['_fun_out'] = null,
                                H['showscoredeltaing'] = !1,
                                H['_btn_set'] = null,
                                H['_btn_leave'] = null,
                                H['_btn_fanzhong'] = null,
                                H['_btn_collect'] = null,
                                H['block_emo'] = null,
                                H['head_offset_y'] = 15,
                                H['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                                H['selfGapOffsetX'] = [0, -150, 150],
                                app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](H, function (F) {
                                    H['onGameBroadcast'](F);
                                })),
                                app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](H, function (F) {
                                    H['onPlayerConnectionState'](F);
                                })),
                                E.Inst = H,
                                H;
                        }
                        return __extends(E, L),
                            E['prototype']['onCreate'] = function () {
                                var L = this;
                                this['doras'] = new Array(),
                                    this['front_doras'] = [];
                                var E = this.me['getChildByName']('container_lefttop'),
                                    l = E['getChildByName']('container_doras');
                                this['container_doras'] = l,
                                    this['container_gamemode'] = E['getChildByName']('gamemode'),
                                    this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                    'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                    this['label_md5'] = E['getChildByName']('MD5'),
                                    ('en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language']) && (this['label_md5']['margin'] = 1),
                                    E['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        if (L['label_md5']['visible'])
                                            Laya['timer']['clearAll'](L['label_md5']), L['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? E['getChildByName']('activitymode')['visible'] = !0 : L['container_doras']['visible'] = !0;
                                        else {
                                            L['label_md5']['visible'] = !0,
                                                L['label_md5']['banAutoWordWrap'] = !1,
                                                view['DesktopMgr'].Inst['saltSha256'] ? (L['label_md5']['banAutoWordWrap'] = 'en' == GameMgr['client_language'] || ('jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language']) && view['DesktopMgr'].Inst['is_chuanma_mode'](), L['label_md5']['fontSize'] = 'en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] ? 14 : 15, L['label_md5'].y = 42, L['label_md5'].text = game['Tools']['strOfLocalization']('10002') + view['DesktopMgr'].Inst['sha256'] + '\n' + game['Tools']['strOfLocalization']('10003') + view['DesktopMgr'].Inst['saltSha256']) : view['DesktopMgr'].Inst['sha256'] ? (L['label_md5']['fontSize'] = 20, L['label_md5'].y = 45, L['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (L['label_md5']['fontSize'] = 25, L['label_md5'].y = 51, L['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                                E['getChildByName']('activitymode')['visible'] = !1,
                                                L['container_doras']['visible'] = !1;
                                            var H = L;
                                            Laya['timer'].once(5000, L['label_md5'], function () {
                                                H['label_md5']['visible'] = !1,
                                                    view['DesktopMgr'].Inst['is_chuanma_mode']() ? E['getChildByName']('activitymode')['visible'] = !0 : L['container_doras']['visible'] = !0;
                                            });
                                        }
                                    }, null, !1);
                                for (var a = 0; a < l['numChildren']; a++)
                                    this['doras'].push(l['getChildAt'](a)), this['front_doras'].push(l['getChildAt'](a)['getChildAt'](0));
                                for (var a = 0; 4 > a; a++) {
                                    var S = this.me['getChildByName']('container_player_' + a),
                                        V = {};
                                    V['container'] = S,
                                        V.head = new H['UI_Head'](S['getChildByName']('head'), ''),
                                        V['head_origin_y'] = S['getChildByName']('head').y,
                                        V.name = S['getChildByName']('container_name')['getChildByName']('name'),
                                        V['container_shout'] = S['getChildByName']('container_shout'),
                                        V['container_shout']['visible'] = !1,
                                        V['illust'] = V['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                        V['illustrect'] = H['UIRect']['CreateFromSprite'](V['illust']),
                                        V['shout_origin_x'] = V['container_shout'].x,
                                        V['shout_origin_y'] = V['container_shout'].y,
                                        V.emo = new v(S),
                                        V['disconnect'] = S['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                        V['disconnect']['visible'] = !1,
                                        V['title'] = new H['UI_PlayerTitle'](S['getChildByName']('title'), ''),
                                        V.que = S['getChildByName']('que'),
                                        V['que_target_pos'] = new Laya['Vector2'](V.que.x, V.que.y),
                                        V['tianming'] = S['getChildByName']('tianming'),
                                        V['tianming']['visible'] = !1,
                                        V['yongchang'] = new W(S['getChildByName']('yongchang'), a),
                                        V['yongchang'].hide(),
                                        0 == a ? (S['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            L['btn_seeinfo'](0);
                                        }, null, !1), S['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                            H['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                                        })) : V['headbtn'] = new O(S['getChildByName']('btn_head'), a),
                                        this['_player_infos'].push(V);
                                }
                                this['_timecd'] = new F(this.me['getChildByName']('container_countdown')),
                                    this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                    this['img_zhenting']['visible'] = !1,
                                    this['_initFunc'](),
                                    this['block_emo'] = new K(this.me['getChildByName']('container_chat_choose')),
                                    this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                    this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                    this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                            if (view['DesktopMgr'].Inst['gameing']) {
                                                for (var F = 0, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++)
                                                    view['DesktopMgr'].Inst['player_datas'][z]['account_id'] && F++;
                                                if (1 >= F)
                                                    H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](L, function () {
                                                        if (view['DesktopMgr'].Inst['gameing']) {
                                                            for (var H = 0, F = 0; F < view['DesktopMgr'].Inst['player_datas']['length']; F++) {
                                                                var z = view['DesktopMgr'].Inst['player_datas'][F];
                                                                z && null != z['account_id'] && 0 != z['account_id'] && H++;
                                                            }
                                                            1 == H ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                                game['Scene_MJ'].Inst['GameEnd']();
                                                            }) : game['Scene_MJ'].Inst['ForceOut']();
                                                        }
                                                    }));
                                                else {
                                                    var O = !1;
                                                    if (H['UI_VoteProgress']['vote_info']) {
                                                        var K = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - H['UI_VoteProgress']['vote_info']['start_time'] - H['UI_VoteProgress']['vote_info']['duration_time']);
                                                        0 > K && (O = !0);
                                                    }
                                                    O ? H['UI_VoteProgress'].Inst['enable'] || H['UI_VoteProgress'].Inst.show() : H['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? H['UI_VoteCD'].Inst['enable'] || H['UI_VoteCD'].Inst.show() : H['UI_Vote'].Inst.show();
                                                }
                                            }
                                        } else
                                            view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), H['UI_Ob_Replay'].Inst['resetRounds'](), H['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && H['UI_Desktop_Yindao'].Inst['close']();
                                    }, null, !1),
                                    this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                                    this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        H['UI_Config'].Inst.show();
                                    }, null, !1),
                                    this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                    this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        H['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                    }, null, !1),
                                    this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                    this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (H['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? H['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](L, function () {
                                            H['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                        })) : H['UI_Replay'].Inst && H['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                    }, null, !1),
                                    this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                    this['btn_double_pass']['visible'] = !1;
                                var d = 0;
                                this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr']['double_click_pass']) {
                                        var F = Laya['timer']['currTimer'];
                                        if (d + 300 > F) {
                                            if (H['UI_ChiPengHu'].Inst['enable'])
                                                H['UI_ChiPengHu'].Inst['onDoubleClick'](), L['recordDoubleClickTime'](F - d);
                                            else {
                                                var z = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                                H['UI_LiQiZiMo'].Inst['enable'] && (z = H['UI_LiQiZiMo'].Inst['onDoubleClick'](z)),
                                                    z && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && L['recordDoubleClickTime'](F - d);
                                            }
                                            d = 0;
                                        } else
                                            d = F;
                                    }
                                }, null, !1),
                                    this['_network_delay'] = new z(this.me['getChildByName']('img_signal')),
                                    this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                    this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                    'en' == GameMgr['client_language'] && (E['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                            },
                            E['prototype']['recordDoubleClickTime'] = function (H) {
                                this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(H, this['min_double_time'])) : H,
                                    this['max_double_time'] = this['max_double_time'] ? Math.max(H, this['max_double_time']) : H;
                            },
                            E['prototype']['onGameBroadcast'] = function (H) {
                                app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](H));
                                var F = view['DesktopMgr'].Inst['seat2LocalPosition'](H.seat),
                                    z = JSON['parse'](H['content']);
                                null != z.emo && void 0 != z.emo && (this['onShowEmo'](F, z.emo), this['showAIEmo']());
                            },
                            E['prototype']['onPlayerConnectionState'] = function (H) {
                                app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](H));
                                var F = H.seat;
                                if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && F < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][F] = H['state']), this['enable']) {
                                    var z = view['DesktopMgr'].Inst['seat2LocalPosition'](F);
                                    this['_player_infos'][z]['disconnect']['visible'] = H['state'] != view['ELink_State']['READY'];
                                }
                            },
                            E['prototype']['_initFunc'] = function () {
                                var H = this;
                                this['_container_fun'] = this.me['getChildByName']('container_func'),
                                    this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                    this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                    this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                                var F = this['_fun_out']['getChildByName']('btn_func'),
                                    z = this['_fun_out']['getChildByName']('btn_func2'),
                                    O = this['_fun_in_spr']['getChildByName']('btn_func');
                                F['clickHandler'] = z['clickHandler'] = new Laya['Handler'](this, function () {
                                    var K = 0;
                                    K = -270,
                                        Laya['Tween'].to(H['_container_fun'], {
                                            x: -624
                                        }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](H, function () {
                                            H['_fun_in']['visible'] = !0,
                                                H['_fun_out']['visible'] = !1,
                                                Laya['Tween'].to(H['_container_fun'], {
                                                    x: K
                                                }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](H, function () {
                                                    F['disabled'] = !1,
                                                        z['disabled'] = !1,
                                                        O['disabled'] = !1,
                                                        H['_fun_out']['visible'] = !1;
                                                }), 0, !0, !0);
                                        })),
                                        F['disabled'] = !0,
                                        z['disabled'] = !0,
                                        O['disabled'] = !0;
                                }, null, !1),
                                    O['clickHandler'] = new Laya['Handler'](this, function () {
                                        var K = -546;
                                        Laya['Tween'].to(H['_container_fun'], {
                                            x: -624
                                        }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](H, function () {
                                            H['_fun_in']['visible'] = !1,
                                                H['_fun_out']['visible'] = !0,
                                                Laya['Tween'].to(H['_container_fun'], {
                                                    x: K
                                                }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](H, function () {
                                                    F['disabled'] = !1,
                                                        z['disabled'] = !1,
                                                        O['disabled'] = !1,
                                                        H['_fun_out']['visible'] = !0;
                                                }), 0, !0, !0);
                                        })),
                                            F['disabled'] = !0,
                                            z['disabled'] = !0,
                                            O['disabled'] = !0;
                                    });
                                var K = this['_fun_in']['getChildByName']('btn_autolipai'),
                                    v = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                    W = this['_fun_out']['getChildByName']('autolipai'),
                                    L = Laya['LocalStorage']['getItem']('autolipai'),
                                    E = !0;
                                E = L && '' != L ? 'true' == L : !0,
                                    this['refreshFuncBtnShow'](K, W, E),
                                    K['clickHandler'] = v['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                            H['refreshFuncBtnShow'](K, W, view['DesktopMgr'].Inst['auto_liqi']),
                                            Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                    }, null, !1);
                                var l = this['_fun_in']['getChildByName']('btn_autohu'),
                                    a = this['_fun_out']['getChildByName']('btn_autohu2'),
                                    S = this['_fun_out']['getChildByName']('autohu');
                                this['refreshFuncBtnShow'](l, S, !1),
                                    l['clickHandler'] = a['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                            H['refreshFuncBtnShow'](l, S, view['DesktopMgr'].Inst['auto_hule']);
                                    }, null, !1);
                                var V = this['_fun_in']['getChildByName']('btn_autonoming'),
                                    d = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                    J = this['_fun_out']['getChildByName']('autonoming');
                                this['refreshFuncBtnShow'](V, J, !1),
                                    V['clickHandler'] = d['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                            H['refreshFuncBtnShow'](V, J, view['DesktopMgr'].Inst['auto_nofulu']);
                                    }, null, !1);
                                var P = this['_fun_in']['getChildByName']('btn_automoqie'),
                                    t = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                    r = this['_fun_out']['getChildByName']('automoqie');
                                this['refreshFuncBtnShow'](P, r, !1),
                                    P['clickHandler'] = t['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                            H['refreshFuncBtnShow'](P, r, view['DesktopMgr'].Inst['auto_moqie']);
                                    }, null, !1),
                                    'kr' == GameMgr['client_language'] && (W['scale'](0.9, 0.9), S['scale'](0.9, 0.9), J['scale'](0.9, 0.9), r['scale'](0.9, 0.9)),
                                    Laya['Browser'].onPC && !GameMgr['inConch'] ? (F['visible'] = !1, a['visible'] = !0, v['visible'] = !0, d['visible'] = !0, t['visible'] = !0) : (F['visible'] = !0, a['visible'] = !1, v['visible'] = !1, d['visible'] = !1, t['visible'] = !1);
                            },
                            E['prototype']['noAutoLipai'] = function () {
                                var H = this['_container_fun']['getChildByName']('btn_autolipai');
                                view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                    H['clickHandler'].run();
                            },
                            E['prototype']['resetFunc'] = function () {
                                var H = Laya['LocalStorage']['getItem']('autolipai'),
                                    F = !0;
                                F = H && '' != H ? 'true' == H : !0;
                                var z = this['_fun_in']['getChildByName']('btn_autolipai'),
                                    O = this['_fun_out']['getChildByName']('automoqie');
                                this['refreshFuncBtnShow'](z, O, F),
                                    Laya['LocalStorage']['setItem']('autolipai', F ? 'true' : 'false'),
                                    view['DesktopMgr'].Inst['setAutoLiPai'](F);
                                var K = this['_fun_in']['getChildByName']('btn_autohu'),
                                    v = this['_fun_out']['getChildByName']('autohu');
                                this['refreshFuncBtnShow'](K, v, view['DesktopMgr'].Inst['auto_hule']);
                                var W = this['_fun_in']['getChildByName']('btn_autonoming'),
                                    L = this['_fun_out']['getChildByName']('autonoming');
                                this['refreshFuncBtnShow'](W, L, view['DesktopMgr'].Inst['auto_nofulu']);
                                var E = this['_fun_in']['getChildByName']('btn_automoqie'),
                                    l = this['_fun_out']['getChildByName']('automoqie');
                                this['refreshFuncBtnShow'](E, l, view['DesktopMgr'].Inst['auto_moqie']),
                                    this['_container_fun'].x = -546,
                                    this['_fun_in']['visible'] = !1,
                                    this['_fun_out']['visible'] = !0; {
                                    var a = this['_fun_out']['getChildByName']('btn_func');
                                    this['_fun_out']['getChildByName']('btn_func2');
                                }
                                a['disabled'] = !1,
                                    a['disabled'] = !1;
                            },
                            E['prototype']['setDora'] = function (H, F) {
                                if (0 > H || H >= this['doras']['length'])
                                    return console['error']('setDora pos错误'), void 0;
                                var z = 'myres2/mjpm/' + (F['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                                this['doras'][H].skin = game['Tools']['localUISrc'](z + F['toString'](!1) + '.png'),
                                    this['front_doras'][H]['visible'] = !F['touming'],
                                    this['front_doras'][H].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                            },
                            E['prototype']['initRoom'] = function () {
                                var F = this;
                                if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                    for (var z = {}, O = 0; O < view['DesktopMgr'].Inst['player_datas']['length']; O++) {
                                        for (var K = view['DesktopMgr'].Inst['player_datas'][O]['character'], v = K['charid'], W = cfg['item_definition']['character'].find(v).emo, L = 0; 9 > L; L++) {
                                            var E = W + '/' + L['toString']() + '.png';
                                            z[E] = 1;
                                        }
                                        if (K['extra_emoji'])
                                            for (var L = 0; L < K['extra_emoji']['length']; L++) {
                                                var E = W + '/' + K['extra_emoji'][L]['toString']() + '.png';
                                                z[E] = 1;
                                            }
                                    }
                                    var l = [];
                                    for (var a in z)
                                        l.push(a);
                                    this['block_emo'].me.x = 1878,
                                        this['block_emo']['reset'](),
                                        game['LoadMgr']['loadResImage'](l, Laya['Handler']['create'](this, function () {
                                            F['block_emo']['initRoom']();
                                        })),
                                        this['_btn_collect']['visible'] = !1;
                                } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                                    this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                                else {
                                    for (var S = !1, O = 0; O < view['DesktopMgr'].Inst['player_datas']['length']; O++) {
                                        var V = view['DesktopMgr'].Inst['player_datas'][O];
                                        if (V && null != V['account_id'] && V['account_id'] == GameMgr.Inst['account_id']) {
                                            S = !0;
                                            break;
                                        }
                                    }
                                    this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (H['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                        this['_btn_collect']['visible'] = S;
                                }
                                if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                    for (var d = 0, O = 0; O < view['DesktopMgr'].Inst['player_datas']['length']; O++) {
                                        var V = view['DesktopMgr'].Inst['player_datas'][O];
                                        V && null != V['account_id'] && 0 != V['account_id'] && d++;
                                    }
                                    1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                                }
                                for (var J = 0, O = 0; O < view['DesktopMgr'].Inst['player_datas']['length']; O++) {
                                    var V = view['DesktopMgr'].Inst['player_datas'][O];
                                    V && null != V['account_id'] && 0 != V['account_id'] && J++;
                                }
                                this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                    this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                    this['enable'] = !0,
                                    this['setLiqibang'](0),
                                    this['setBen'](0);
                                var P = this.me['getChildByName']('container_lefttop');
                                if (P['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                                    P['getChildByName']('num_lizhi_0')['visible'] = !1, P['getChildByName']('num_lizhi_1')['visible'] = !1, P['getChildByName']('num_ben_0')['visible'] = !1, P['getChildByName']('num_ben_1')['visible'] = !1, P['getChildByName']('container_doras')['visible'] = !1, P['getChildByName']('gamemode')['visible'] = !1, P['getChildByName']('activitymode')['visible'] = !0, P['getChildByName']('MD5').y = 63, P['getChildByName']('MD5')['width'] = 239, P['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), P['getChildAt'](0)['width'] = 280, P['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (P['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, P['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (P['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), P['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), P['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, P['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                                else if (P['getChildByName']('num_lizhi_0')['visible'] = !0, P['getChildByName']('num_lizhi_1')['visible'] = !1, P['getChildByName']('num_ben_0')['visible'] = !0, P['getChildByName']('num_ben_1')['visible'] = !0, P['getChildByName']('container_doras')['visible'] = !0, P['getChildByName']('gamemode')['visible'] = !0, P['getChildByName']('activitymode')['visible'] = !1, P['getChildByName']('MD5').y = 51, P['getChildByName']('MD5')['width'] = 276, P['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), P['getChildAt'](0)['width'] = 313, P['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                    var t = view['DesktopMgr'].Inst['game_config'],
                                        r = game['Tools']['get_room_desc'](t);
                                    this['label_gamemode'].text = r.text,
                                        this['container_gamemode']['visible'] = !0;
                                } else
                                    this['container_gamemode']['visible'] = !1;
                                if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                    if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                        this['container_jjc']['visible'] = !0,
                                            this['label_jjc_win'].text = H['UI_Activity_JJC']['win_count']['toString']();
                                        for (var O = 0; 3 > O; O++)
                                            this['container_jjc']['getChildByName'](O['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (H['UI_Activity_JJC']['lose_count'] > O ? 'd' : 'l') + '.png');
                                    } else
                                        this['container_jjc']['visible'] = !1;
                                else
                                    this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                                H['UI_Replay'].Inst && (H['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                                var N = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                    j = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                                view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (H['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](N, !0), game['Tools']['setGrayDisable'](j, !0)) : (game['Tools']['setGrayDisable'](N, !1), game['Tools']['setGrayDisable'](j, !1), H['UI_Astrology'].Inst.hide());
                                for (var O = 0; 4 > O; O++)
                                    this['_player_infos'][O]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][O]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][O]['yongchang'].hide();
                            },
                            E['prototype']['onCloseRoom'] = function () {
                                this['_network_delay']['close_refresh']();
                            },
                            E['prototype']['refreshSeat'] = function (H) {
                                void 0 === H && (H = !1);
                                for (var F = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), z = 0; 4 > z; z++) {
                                    var O = view['DesktopMgr'].Inst['localPosition2Seat'](z),
                                        K = this['_player_infos'][z];
                                    if (0 > O)
                                        K['container']['visible'] = !1;
                                    else {
                                        K['container']['visible'] = !0;
                                        var v = view['DesktopMgr'].Inst['getPlayerName'](O);
                                        game['Tools']['SetNickname'](K.name, v, !1, !0),
                                            K.head.id = F[O]['avatar_id'],
                                            K.head['set_head_frame'](F[O]['account_id'], F[O]['avatar_frame']);
                                        var W = (cfg['item_definition'].item.get(F[O]['avatar_frame']), cfg['item_definition'].view.get(F[O]['avatar_frame']));
                                        if (K.head.me.y = W && W['sargs'][0] ? K['head_origin_y'] - Number(W['sargs'][0]) / 100 * this['head_offset_y'] : K['head_origin_y'], K['avatar'] = F[O]['avatar_id'], 0 != z) {
                                            var L = F[O]['account_id'] && 0 != F[O]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                                E = F[O]['account_id'] && 0 != F[O]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                                l = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                            H ? K['headbtn']['onChangeSeat'](L, E, l) : K['headbtn']['reset'](L, E, l);
                                        }
                                        K['title'].id = F[O]['title'] ? game['Tools']['titleLocalization'](F[O]['account_id'], F[O]['title']) : 0;
                                    }
                                }
                            },
                            E['prototype']['refreshNames'] = function () {
                                for (var H = 0; 4 > H; H++) {
                                    var F = view['DesktopMgr'].Inst['localPosition2Seat'](H),
                                        z = this['_player_infos'][H];
                                    if (0 > F)
                                        z['container']['visible'] = !1;
                                    else {
                                        z['container']['visible'] = !0;
                                        var O = view['DesktopMgr'].Inst['getPlayerName'](F);
                                        game['Tools']['SetNickname'](z.name, O, !1, !0);
                                    }
                                }
                            },
                            E['prototype']['refreshLinks'] = function () {
                                for (var H = (view['DesktopMgr'].Inst.seat, 0); 4 > H; H++) {
                                    var F = view['DesktopMgr'].Inst['localPosition2Seat'](H);
                                    view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][H]['disconnect']['visible'] = -1 == F || 0 == H ? !1 : view['DesktopMgr']['player_link_state'][F] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][H]['disconnect']['visible'] = -1 == F || 0 == view['DesktopMgr'].Inst['player_datas'][F]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][F] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][H]['disconnect']['visible'] = !1);
                                }
                            },
                            E['prototype']['setBen'] = function (H) {
                                H > 99 && (H = 99);
                                var F = this.me['getChildByName']('container_lefttop'),
                                    z = F['getChildByName']('num_ben_0'),
                                    O = F['getChildByName']('num_ben_1');
                                H >= 10 ? (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](H / 10)['toString']() + '.png'), O.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (H % 10)['toString']() + '.png'), O['visible'] = !0) : (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (H % 10)['toString']() + '.png'), O['visible'] = !1);
                            },
                            E['prototype']['setLiqibang'] = function (H, F) {
                                void 0 === F && (F = !0),
                                    H > 999 && (H = 999);
                                var z = this.me['getChildByName']('container_lefttop'),
                                    O = z['getChildByName']('num_lizhi_0'),
                                    K = z['getChildByName']('num_lizhi_1'),
                                    v = z['getChildByName']('num_lizhi_2');
                                H >= 100 ? (v.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (H % 10)['toString']() + '.png'), K.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](H / 10) % 10)['toString']() + '.png'), O.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](H / 100)['toString']() + '.png'), K['visible'] = !0, v['visible'] = !0) : H >= 10 ? (K.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (H % 10)['toString']() + '.png'), O.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](H / 10)['toString']() + '.png'), K['visible'] = !0, v['visible'] = !1) : (O.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + H['toString']() + '.png'), K['visible'] = !1, v['visible'] = !1),
                                    view['DesktopMgr'].Inst['setRevealScore'](H, F);
                            },
                            E['prototype']['reset_rounds'] = function () {
                                this['closeCountDown'](),
                                    this['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                                for (var H = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, F = 0; F < this['doras']['length']; F++)
                                    if (this['front_doras'][F].skin = '', this['doras'][F].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                        this['front_doras'][F]['visible'] = !1, this['doras'][F].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                    else {
                                        var z = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                        this['front_doras'][F]['visible'] = !0,
                                            this['doras'][F].skin = game['Tools']['localUISrc'](z + '5z.png'),
                                            this['front_doras'][F].skin = game['Tools']['localUISrc'](H + 'back.png');
                                    }
                                for (var F = 0; 4 > F; F++)
                                    this['_player_infos'][F].emo['reset'](), this['_player_infos'][F].que['visible'] = !1;
                                this['_timecd']['reset'](),
                                    Laya['timer']['clearAll'](this),
                                    Laya['timer']['clearAll'](this['label_md5']),
                                    view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                    this['label_md5']['visible'] = !1;
                            },
                            E['prototype']['showCountDown'] = function (H, F) {
                                this['_timecd']['showCD'](H, F);
                            },
                            E['prototype']['setZhenting'] = function (H) {
                                this['img_zhenting']['visible'] = H;
                            },
                            E['prototype']['shout'] = function (H, F, z, O) {
                                app.Log.log('shout:' + H + ' type:' + F);
                                try {
                                    var K = this['_player_infos'][H],
                                        v = K['container_shout'],
                                        W = v['getChildByName']('img_content'),
                                        L = v['getChildByName']('illust')['getChildByName']('illust'),
                                        E = v['getChildByName']('img_score');
                                    if (0 == O)
                                        E['visible'] = !1;
                                    else {
                                        E['visible'] = !0;
                                        var l = 0 > O ? 'm' + Math.abs(O) : O;
                                        E.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + l + '.png');
                                    }
                                    '' == F ? W['visible'] = !1 : (W['visible'] = !0, W.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + F + '.png')),
                                        view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (v['getChildByName']('illust')['visible'] = !1, v['getChildAt'](2)['visible'] = !0, v['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](v['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (v['getChildByName']('illust')['visible'] = !0, v['getChildAt'](2)['visible'] = !1, v['getChildAt'](0)['visible'] = !0, L['scaleX'] = 1, game['Tools']['charaPart'](z['avatar_id'], L, 'full', K['illustrect'], !0, !0));
                                    var a = 0,
                                        S = 0;
                                    switch (H) {
                                        case 0:
                                            a = -105,
                                                S = 0;
                                            break;
                                        case 1:
                                            a = 500,
                                                S = 0;
                                            break;
                                        case 2:
                                            a = 0,
                                                S = -300;
                                            break;
                                        default:
                                            a = -500,
                                                S = 0;
                                    }
                                    v['visible'] = !0,
                                        v['alpha'] = 0,
                                        v.x = K['shout_origin_x'] + a,
                                        v.y = K['shout_origin_y'] + S,
                                        Laya['Tween'].to(v, {
                                            alpha: 1,
                                            x: K['shout_origin_x'],
                                            y: K['shout_origin_y']
                                        }, 70),
                                        Laya['Tween'].to(v, {
                                            alpha: 0
                                        }, 150, null, null, 600),
                                        Laya['timer'].once(800, this, function () {
                                            Laya['loader']['clearTextureRes'](L.skin),
                                                v['visible'] = !1;
                                        });
                                } catch (V) {
                                    var d = {};
                                    d['error'] = V['message'],
                                        d['stack'] = V['stack'],
                                        d['method'] = 'shout',
                                        d['class'] = 'UI_DesktopInfos',
                                        GameMgr.Inst['onFatalError'](d);
                                }
                            },
                            E['prototype']['closeCountDown'] = function () {
                                this['_timecd']['close']();
                            },
                            E['prototype']['refreshFuncBtnShow'] = function (H, F, z) {
                                var O = H['getChildByName']('img_choosed');
                                F['color'] = H['mouseEnabled'] ? z ? '#3bd647' : '#7992b3' : '#565656',
                                    O['visible'] = z;
                            },
                            E['prototype']['onShowEmo'] = function (H, F) {
                                var z = this['_player_infos'][H];
                                0 != H && z['headbtn']['emj_banned'] || z.emo.show(H, F);
                            },
                            E['prototype']['changeHeadEmo'] = function (H) {
                                {
                                    var F = view['DesktopMgr'].Inst['seat2LocalPosition'](H);
                                    this['_player_infos'][F];
                                }
                            },
                            E['prototype']['onBtnShowScoreDelta'] = function () {
                                var H = this;
                                this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                    H['showscoredeltaing'] = !1,
                                        view['DesktopMgr'].Inst['setScoreDelta'](!1);
                                }));
                            },
                            E['prototype']['btn_seeinfo'] = function (F) {
                                if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                                    var z = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](F)]['account_id'];
                                    if (z) {
                                        var O = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                            K = 1,
                                            v = view['DesktopMgr'].Inst['game_config'].meta;
                                        v && v['mode_id'] == game['EMatchMode']['shilian'] && (K = 4);
                                        var W = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](F));
                                        H['UI_OtherPlayerInfo'].Inst.show(z, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, O ? 1 : 2, K, W['nickname']);
                                    }
                                }
                            },
                            E['prototype']['openDora3BeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openPeipaiOpenBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openDora3BeginShine'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](244),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openMuyuOpenBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openShilianOpenBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openXiuluoOpenBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openChuanmaBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openJiuChaoBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openAnPaiBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openTopMatchOpenBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openZhanxingBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openTianmingBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['openYongchangBeginEffect'] = function () {
                                var H = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, H, function () {
                                        H['destory']();
                                    });
                            },
                            E['prototype']['logUpEmoInfo'] = function () {
                                this['block_emo']['sendEmoLogUp'](),
                                    this['min_double_time'] = 0,
                                    this['max_double_time'] = 0;
                            },
                            E['prototype']['onCollectChange'] = function () {
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (H['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                            },
                            E['prototype']['showAIEmo'] = function () {
                                for (var H = this, F = function (F) {
                                    var O = view['DesktopMgr'].Inst['player_datas'][F];
                                    O['account_id'] && 0 != O['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), z, function () {
                                        H['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](F), Math['floor'](9 * Math['random']()));
                                    });
                                }, z = this, O = 0; O < view['DesktopMgr'].Inst['player_datas']['length']; O++)
                                    F(O);
                            },
                            E['prototype']['setGapType'] = function (H, F) {
                                void 0 === F && (F = !1);
                                for (var z = 0; z < H['length']; z++) {
                                    var O = view['DesktopMgr'].Inst['seat2LocalPosition'](z);
                                    this['_player_infos'][O].que['visible'] = !0,
                                        F && (0 == z ? (this['_player_infos'][O].que.pos(this['gapStartPosLst'][z].x + this['selfGapOffsetX'][H[z]], this['gapStartPosLst'][z].y), this['_player_infos'][O].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][O].que, {
                                            scaleX: 0.35,
                                            scaleY: 0.35,
                                            x: this['_player_infos'][O]['que_target_pos'].x,
                                            y: this['_player_infos'][O]['que_target_pos'].y
                                        }, 200)) : (this['_player_infos'][O].que.pos(this['gapStartPosLst'][z].x, this['gapStartPosLst'][z].y), this['_player_infos'][O].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][O].que, {
                                            scaleX: 0.35,
                                            scaleY: 0.35,
                                            x: this['_player_infos'][O]['que_target_pos'].x,
                                            y: this['_player_infos'][O]['que_target_pos'].y
                                        }, 200))),
                                        this['_player_infos'][O].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + H[z] + '.png');
                                }
                            },
                            E['prototype']['OnNewCard'] = function (H, F) {
                                if (F) {
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
                            E['prototype']['ShowSpellCard'] = function (F, z) {
                                void 0 === z && (z = !1),
                                    H['UI_FieldSpell'].Inst && !H['UI_FieldSpell'].Inst['enable'] && H['UI_FieldSpell'].Inst.show(F, z);
                            },
                            E['prototype']['HideSpellCard'] = function () {
                                H['UI_FieldSpell'].Inst && H['UI_FieldSpell'].Inst['close']();
                            },
                            E['prototype']['SetTianMingRate'] = function (H, F, z) {
                                void 0 === z && (z = !1);
                                var O = view['DesktopMgr'].Inst['seat2LocalPosition'](H),
                                    K = this['_player_infos'][O]['tianming'];
                                z && 5 != F && K.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + F + '.png') && Laya['Tween'].to(K, {
                                    scaleX: 1.1,
                                    scaleY: 1.1
                                }, 200, null, Laya['Handler']['create'](this, function () {
                                    Laya['Tween'].to(K, {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 200);
                                })),
                                    K.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + F + '.png');
                            },
                            E['prototype']['ResetYongChang'] = function () {
                                for (var H = 0; 4 > H; H++)
                                    this['_player_infos'][H]['yongchang']['resetToStart']();
                            },
                            E['prototype']['SetYongChangRate'] = function (H, F, z, O, K, v) {
                                this['_player_infos'][H]['yongchang'].show(F, z, O, K, v);
                            },
                            E.Inst = null,
                            E;
                    }
                        (H['UIBase']);
                H['UI_DesktopInfo'] = L;
            }
                (uiscript || (uiscript = {}));










        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var F = this,
                z = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: z,
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (z, O) {
                    z || O['error'] ? H['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', z, O) : F['_refreshAnnouncements'](O);
                    // START
                    if ((z || O['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                    // END
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (H) {
                    for (var O = GameMgr['inDmm'] ? 'web_dmm' : 'web', K = 0, v = H['update_list']; K < v['length']; K++) {
                        var W = v[K];
                        if (W.lang == z && W['platform'] == O) {
                            F['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }
        uiscript.UI_Info._refreshAnnouncements = function (H) {
            // START
            H.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (H['announcements'] && (this['announcements'] = H['announcements']), H.sort && (this['announcement_sort'] = H.sort), H['read_list']) {
                this['read_list'] = [];
                for (var F = 0; F < H['read_list']['length']; F++)
                    this['read_list'].push(H['read_list'][F]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }










        // 加载CG 
        !function (H) {
            var F = function () {
                function F(F, z) {
                    var O = this;
                    this['cg_id'] = 0,
                        this.me = F,
                        this['father'] = z;
                    var K = this.me['getChildByName']('btn_detail');
                    K['clickHandler'] = new Laya['Handler'](this, function () {
                        H['UI_Bag'].Inst['locking'] || O['father']['changeLoadingCG'](O['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](K, new Laya['Handler'](this, function (F) {
                            if (!H['UI_Bag'].Inst['locking']) {
                                'down' == F ? Laya['timer'].once(800, O, function () {
                                    H['UI_CG_Yulan'].Inst.show(O['cg_id']);
                                }) : ('over' == F || 'up' == F) && Laya['timer']['clearAll'](O);
                            }
                        })),
                        this['using'] = K['getChildByName']('using'),
                        this.icon = K['getChildByName']('icon'),
                        this.name = K['getChildByName']('name'),
                        this.info = K['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = K['getChildByName']('new');
                }
                return F['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var F = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != H['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, F['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var z = !this['father']['last_seen_cg_map'][this['cg_id']], O = 0, K = F['unlock_items']; O < K['length']; O++) {
                        var v = K[O];
                        if (v && H['UI_Bag']['get_item_count'](v) > 0) {
                            var W = cfg['item_definition'].item.get(v);
                            if (this.name.text = W['name_' + GameMgr['client_language']], !W['item_expire']) {
                                this.info['visible'] = !1,
                                    z = -1 != this['father']['new_cg_ids']['indexOf'](v);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + W['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = z;
                },
                    F['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    F;
            }
                (),
                z = function () {
                    function z(F) {
                        var z = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = F,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var O = this.me['getChildByName']('choose');
                        this['label_choose_all'] = O['getChildByName']('tip'),
                            O['clickHandler'] = new Laya['Handler'](this, function () {
                                if (z['all_choosed'])
                                    H['UI_Loading']['Loading_Images'] = [];
                                else {
                                    H['UI_Loading']['Loading_Images'] = [];
                                    for (var F = 0, O = z['items']; F < O['length']; F++) {
                                        var K = O[F];
                                        H['UI_Loading']['Loading_Images'].push(K.id);
                                    }
                                }
                                z['scrollview']['wantToRefreshAll'](),
                                    z['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: H['UI_Loading']['Loading_Images']
                                //}, function (F, z) {
                                //    (F || z['error']) && H['UIMgr'].Inst['showNetReqError']('setLoadingImage', F, z);
                                //});
                                // END
                            });
                    }
                    return z['prototype']['have_redpoint'] = function () {
                        // START
                        //if (H['UI_Bag']['new_cg_ids']['length'] > 0)
                        //    return !0;
                        // END
                        var F = [];
                        if (!this['seen_cg_map']) {
                            var z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, z) {
                                z = game['Tools']['dddsss'](z);
                                for (var O = z['split'](','), K = 0; K < O['length']; K++)
                                    this['seen_cg_map'][Number(O[K])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (z) {
                            if (z['unlock_items'][1] && 0 == H['UI_Bag']['get_item_count'](z['unlock_items'][0]) && H['UI_Bag']['get_item_count'](z['unlock_items'][1]) > 0) {
                                if (GameMgr['regionLimited']) {
                                    var O = cfg['item_definition'].item.get(z['unlock_items'][1]);
                                    if (1 == O['region_limit'])
                                        return;
                                }
                                F.push(z.id);
                            }
                        });
                        for (var v = 0, W = F; v < W['length']; v++) {
                            var L = W[v];
                            if (!this['seen_cg_map'][L])
                                return !0;
                        }
                        return !1;
                    },
                        z['prototype'].show = function () {
                            var F = this;
                            if (this['new_cg_ids'] = H['UI_Bag']['new_cg_ids'], H['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, z) {
                                    z = game['Tools']['dddsss'](z);
                                    for (var O = z['split'](','), K = 0; K < O['length']; K++)
                                        this['seen_cg_map'][Number(O[K])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var v = '';
                            cfg['item_definition']['loading_image']['forEach'](function (z) {
                                for (var O = 0, K = z['unlock_items']; O < K['length']; O++) {
                                    var W = K[O];
                                    if (W && H['UI_Bag']['get_item_count'](W) > 0) {
                                        var L = cfg['item_definition'].item.get(W);
                                        if (1 == L['region_limit'] && GameMgr['regionLimited'])
                                            continue;
                                        return F['items'].push(z),
                                            F['seen_cg_map'][z.id] = 1,
                                            '' != v && (v += ','),
                                            v += z.id,
                                            void 0;
                                    }
                                }
                            }),
                                this['items'].sort(function (H, F) {
                                    return F.sort - H.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](v)),
                                H['UI_Bag'].Inst['refreshRedpoint'](),
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
                                this['_changed'] && H['UI_Loading']['loadNextCG']();
                        },
                        z['prototype']['render_item'] = function (H) {
                            var z = H['index'],
                                O = H['container'],
                                K = H['cache_data'];
                            if (this['items'][z]) {
                                K.item || (K.item = new F(O, this));
                                var v = K.item;
                                v['cg_id'] = this['items'][z].id,
                                    v.show();
                            }
                        },
                        z['prototype']['changeLoadingCG'] = function (F) {
                            this['_changed'] = !0;
                            for (var z = 0, O = 0, K = 0, v = this['items']; K < v['length']; K++) {
                                var W = v[K];
                                if (W.id == F) {
                                    z = O;
                                    break;
                                }
                                O++;
                            }
                            var L = H['UI_Loading']['Loading_Images']['indexOf'](F);
                            -1 == L ? H['UI_Loading']['Loading_Images'].push(F) : H['UI_Loading']['Loading_Images']['splice'](L, 1),
                                this['scrollview']['wantToRefreshItem'](z),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = H['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: H['UI_Loading']['Loading_Images']
                            //}, function (F, z) {
                            //    (F || z['error']) && H['UIMgr'].Inst['showNetReqError']('setLoadingImage', F, z);
                            //});
                            // END
                        },
                        z['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = H['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        z['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        z;
                }
                    ();
            H['UI_Bag_PageCG'] = z;
        }
            (uiscript || (uiscript = {}));



        // 懒b作者终于修复了对局结束变婚皮的问题 
        uiscript.UI_MJReward.prototype.show = function (F) {
            // START
            view['DesktopMgr'].Inst['rewardinfo']['main_character'] = {
                "level": 5,
                "exp": 0,
                "add": 0
            }
            var H = uiscript;
            // END
            var z = this,
                O = view['DesktopMgr'].Inst['rewardinfo'];
            this['page_jiban'].me['visible'] = !1,
                this['page_jiban_gift'].me['visible'] = !1,
                this['complete'] = F,
                this['page_box'].show(),
                H['UIBase']['anim_alpha_in'](this['page_box'].me, {
                    x: -50
                }, 150),
                O['main_character'] ? (this['page_jiban'].show(), H['UIBase']['anim_alpha_in'](this['page_jiban'].me, {
                    x: -50
                }, 150, 60)) : O['character_gift'] && (this['page_jiban_gift'].show(), H['UIBase']['anim_alpha_in'](this['page_jiban_gift'].me, {
                    x: -50
                }, 150, 60)),
                Laya['timer'].once(600, this, function () {
                    var H = 0;
                    z['page_box']['doanim'](Laya['Handler']['create'](z, function () {
                        H++,
                            2 == H && z['showGrade'](F);
                    })),
                        O['main_character'] ? z['page_jiban']['doanim'](Laya['Handler']['create'](z, function () {
                            H++,
                                2 == H && z['showGrade'](F);
                        })) : O['character_gift'] ? z['page_jiban_gift']['doanim'](Laya['Handler']['create'](z, function () {
                            H++,
                                2 == H && z['showGrade'](F);
                        })) : (H++, 2 == H && z['showGrade'](F));
                }),
                this['enable'] = !0;
        }






        uiscript.UI_Entrance.prototype._onLoginSuccess = function (F, z, O) {
            var H = uiscript;
            var K = this;
            if (void 0 === O && (O = !1), app.Log.log('登陆：' + JSON['stringify'](z)), GameMgr.Inst['account_id'] = z['account_id'], GameMgr.Inst['account_data'] = z['account'], H['UI_ShiMingRenZheng']['renzhenged'] = z['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, z['account']['platform_diamond'])
                for (var v = z['account']['platform_diamond'], W = 0; W < v['length']; W++)
                    GameMgr.Inst['account_numerical_resource'][v[W].id] = v[W]['count'];
            if (z['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = z['account']['skin_ticket']), z['account']['platform_skin_ticket'])
                for (var L = z['account']['platform_skin_ticket'], W = 0; W < L['length']; W++)
                    GameMgr.Inst['account_numerical_resource'][L[W].id] = L[W]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                z['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = z['game_info']['location'], GameMgr.Inst['mj_game_token'] = z['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = z['game_info']['game_uuid']),
                z['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : F['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', z['access_token']), GameMgr.Inst['sociotype'] = F, GameMgr.Inst['access_token'] = z['access_token']);
            var E = this,
                l = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        H['UI_Loading'].Inst.show('load_lobby'),
                        E['enable'] = !1,
                        E['scene']['close'](),
                        H['UI_Entrance_Mail_Regist'].Inst['close'](),
                        E['login_loading']['close'](),
                        H['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](E, function () {
                            GameMgr.Inst['afterLogin'](),
                                E['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && H['UIMgr'].Inst['ShowPreventAddiction'](),
                                E['destroy'](),
                                E['disposeRes'](),
                                H['UI_Add2Desktop'].Inst && (H['UI_Add2Desktop'].Inst['destroy'](), H['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](E, function (F) {
                            return H['UI_Loading'].Inst['setProgressVal'](0.2 * F);
                        }, null, !1));
                },
                a = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (F, z) {
                        F ? (app.Log.log('fetchRefundOrder err:' + F), K['showError'](game['Tools']['strOfLocalization'](2061), F), K['showContainerLogin']()) : (H['UI_Refund']['orders'] = z['orders'], H['UI_Refund']['clear_deadline'] = z['clear_deadline'], H['UI_Refund']['message'] = z['message'], l());
                    }) : l();
                });
            // START
            //if (H['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var S = 0, V = GameMgr.Inst['account_data']['loading_image']; S < V['length']; S++) {
            //        var d = V[S];
            //        cfg['item_definition']['loading_image'].get(d) && H['UI_Loading']['Loading_Images'].push(d);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            H['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || z['account']['phone_verify'] ? a.run() : (H['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, H['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (F, z) {
                        F || z['error'] ? K['showError'](F, z['error']) : 0 == z['phone_login'] ? H['UI_Create_Phone_Account'].Inst.show(a) : H['UI_Canot_Create_Phone_Account'].Inst.show(a);
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
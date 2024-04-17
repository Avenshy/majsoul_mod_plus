// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.11.38
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
        !function (G) {
            var F;
            !function (G) {
                G[G.none = 0] = 'none',
                    G[G['daoju'] = 1] = 'daoju',
                    G[G.gift = 2] = 'gift',
                    G[G['fudai'] = 3] = 'fudai',
                    G[G.view = 5] = 'view';
            }
                (F = G['EItemCategory'] || (G['EItemCategory'] = {}));
            var v = function (v) {
                function z() {
                    var G = v.call(this, new ui['lobby']['bagUI']()) || this;
                    return G['container_top'] = null,
                        G['container_content'] = null,
                        G['locking'] = !1,
                        G.tabs = [],
                        G['page_item'] = null,
                        G['page_gift'] = null,
                        G['page_skin'] = null,
                        G['page_cg'] = null,
                        G['select_index'] = 0,
                        z.Inst = G,
                        G;
                }
                return __extends(z, v),
                    z.init = function () {
                        var G = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (F) {
                            var v = F['update'];
                            v && v.bag && (G['update_data'](v.bag['update_items']), G['update_daily_gain_data'](v.bag));
                        }, null, !1)),
                            // START
                            GameMgr.Inst['use_fetch_info'] ||
                            this['fetch']();
                        // END
                    },
                    z['fetch'] = function () {
                        var F = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (v, z) {
                                if (v || z['error'])
                                    G['UIMgr'].Inst['showNetReqError']('fetchBagInfo', v, z);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](z));
                                    var h = z.bag;
                                    if (h) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of h["items"]) {
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
                                            if (h['items'])
                                                for (var P = 0; P < h['items']['length']; P++) {
                                                    var C = h['items'][P]['item_id'],
                                                        M = h['items'][P]['stack'],
                                                        U = cfg['item_definition'].item.get(C);
                                                    U && (F['_item_map'][C] = {
                                                        item_id: C,
                                                        count: M,
                                                        category: U['category']
                                                    }, 1 == U['category'] && 3 == U.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: C
                                                    }, function () { }));
                                                }
                                            if (h['daily_gain_record'])
                                                for (var y = h['daily_gain_record'], P = 0; P < y['length']; P++) {
                                                    var S = y[P]['limit_source_id'];
                                                    F['_daily_gain_record'][S] = {};
                                                    var N = y[P]['record_time'];
                                                    F['_daily_gain_record'][S]['record_time'] = N;
                                                    var O = y[P]['records'];
                                                    if (O)
                                                        for (var W = 0; W < O['length']; W++)
                                                            F['_daily_gain_record'][S][O[W]['item_id']] = O[W]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    z['onFetchSuccess'] = function (G) {
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {};
                        var F = G['bag_info'];
                        if (F) {
                            var v = F.bag;
                            if (v) {
                                if (MMP.settings.setItems.setAllItems) {
                                    //设置全部道具
                                    var items = cfg.item_definition.item.map_;
                                    for (var id in items) {
                                        if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                            for (let item of v["items"]) {
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
                                    if (v['items'])
                                        for (var z = 0; z < v['items']['length']; z++) {
                                            var h = v['items'][z]['item_id'],
                                                P = v['items'][z]['stack'],
                                                C = cfg['item_definition'].item.get(h);
                                            C && (this['_item_map'][h] = {
                                                item_id: h,
                                                count: P,
                                                category: C['category']
                                            }, 1 == C['category'] && 3 == C.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: h
                                            }, function () { }));
                                        }
                                    if (v['daily_gain_record'])
                                        for (var M = v['daily_gain_record'], z = 0; z < M['length']; z++) {
                                            var U = M[z]['limit_source_id'];
                                            this['_daily_gain_record'][U] = {};
                                            var y = M[z]['record_time'];
                                            this['_daily_gain_record'][U]['record_time'] = y;
                                            var S = M[z]['records'];
                                            if (S)
                                                for (var N = 0; N < S['length']; N++)
                                                    this['_daily_gain_record'][U][S[N]['item_id']] = S[N]['count'];
                                        }
                                }
                            }
                        }
                    },
                    z['find_item'] = function (G) {
                        var F = this['_item_map'][G];
                        return F ? {
                            item_id: F['item_id'],
                            category: F['category'],
                            count: F['count']
                        }
                            : null;
                    },
                    z['get_item_count'] = function (G) {
                        var F = this['find_item'](G);
                        if (F)
                            return F['count'];
                        if ('100001' == G) {
                            for (var v = 0, z = 0, h = GameMgr.Inst['free_diamonds']; z < h['length']; z++) {
                                var P = h[z];
                                GameMgr.Inst['account_numerical_resource'][P] && (v += GameMgr.Inst['account_numerical_resource'][P]);
                            }
                            for (var C = 0, M = GameMgr.Inst['paid_diamonds']; C < M['length']; C++) {
                                var P = M[C];
                                GameMgr.Inst['account_numerical_resource'][P] && (v += GameMgr.Inst['account_numerical_resource'][P]);
                            }
                            return v;
                        }
                        if ('100004' == G) {
                            for (var U = 0, y = 0, S = GameMgr.Inst['free_pifuquans']; y < S['length']; y++) {
                                var P = S[y];
                                GameMgr.Inst['account_numerical_resource'][P] && (U += GameMgr.Inst['account_numerical_resource'][P]);
                            }
                            for (var N = 0, O = GameMgr.Inst['paid_pifuquans']; N < O['length']; N++) {
                                var P = O[N];
                                GameMgr.Inst['account_numerical_resource'][P] && (U += GameMgr.Inst['account_numerical_resource'][P]);
                            }
                            return U;
                        }
                        return '100002' == G ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    z['find_items_by_category'] = function (G, F) {
                        var v = [];
                        for (var z in this['_item_map'])
                            this['_item_map'][z]['category'] == G && this['_item_map'][z]['count'] && v.push({
                                item_id: this['_item_map'][z]['item_id'],
                                category: this['_item_map'][z]['category'],
                                count: this['_item_map'][z]['count']
                            });
                        return F && v.sort(function (G, v) {
                            return cfg['item_definition'].item.get(G['item_id'])[F] - cfg['item_definition'].item.get(v['item_id'])[F];
                        }),
                            v;
                    },
                    z['update_data'] = function (F) {
                        for (var v = 0; v < F['length']; v++) {
                            var z = F[v]['item_id'],
                                h = F[v]['stack'];
                            if (h > 0) {
                                this['_item_map']['hasOwnProperty'](z['toString']()) ? this['_item_map'][z]['count'] = h : this['_item_map'][z] = {
                                    item_id: z,
                                    count: h,
                                    category: cfg['item_definition'].item.get(z)['category']
                                };
                                var P = cfg['item_definition'].item.get(z);
                                1 == P['category'] && 3 == P.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: z
                                }, function () { }),
                                    5 == P['category'] && (this['new_bag_item_ids'].push(z), this['new_zhuangban_item_ids'][z] = 1),
                                    8 != P['category'] || P['item_expire'] || this['new_cg_ids'].push(z);
                            } else if (this['_item_map']['hasOwnProperty'](z['toString']())) {
                                var C = cfg['item_definition'].item.get(z);
                                C && 5 == C['category'] && G['UI_Sushe']['on_view_remove'](z),
                                    this['_item_map'][z] = 0,
                                    delete this['_item_map'][z];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var v = 0; v < F['length']; v++) {
                            var z = F[v]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](z['toString']()))
                                for (var M = this['_item_listener'][z], U = 0; U < M['length']; U++)
                                    M[U].run();
                        }
                        for (var v = 0; v < this['_all_item_listener']['length']; v++)
                            this['_all_item_listener'][v].run();
                    },
                    z['update_daily_gain_data'] = function (G) {
                        var F = G['update_daily_gain_record'];
                        if (F)
                            for (var v = 0; v < F['length']; v++) {
                                var z = F[v]['limit_source_id'];
                                this['_daily_gain_record'][z] || (this['_daily_gain_record'][z] = {});
                                var h = F[v]['record_time'];
                                this['_daily_gain_record'][z]['record_time'] = h;
                                var P = F[v]['records'];
                                if (P)
                                    for (var C = 0; C < P['length']; C++)
                                        this['_daily_gain_record'][z][P[C]['item_id']] = P[C]['count'];
                            }
                    },
                    z['get_item_daily_record'] = function (G, F) {
                        return this['_daily_gain_record'][G] ? this['_daily_gain_record'][G]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][G]['record_time']) ? this['_daily_gain_record'][G][F] ? this['_daily_gain_record'][G][F] : 0 : 0 : 0 : 0;
                    },
                    z['add_item_listener'] = function (G, F) {
                        this['_item_listener']['hasOwnProperty'](G['toString']()) || (this['_item_listener'][G] = []),
                            this['_item_listener'][G].push(F);
                    },
                    z['remove_item_listener'] = function (G, F) {
                        var v = this['_item_listener'][G];
                        if (v)
                            for (var z = 0; z < v['length']; z++)
                                if (v[z] === F) {
                                    v[z] = v[v['length'] - 1],
                                        v.pop();
                                    break;
                                }
                    },
                    z['add_all_item_listener'] = function (G) {
                        this['_all_item_listener'].push(G);
                    },
                    z['remove_all_item_listener'] = function (G) {
                        for (var F = this['_all_item_listener'], v = 0; v < F['length']; v++)
                            if (F[v] === G) {
                                F[v] = F[F['length'] - 1],
                                    F.pop();
                                break;
                            }
                    },
                    z['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    z['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    z['removeZhuangBanNew'] = function (G) {
                        for (var F = 0, v = G; F < v['length']; F++) {
                            var z = v[F];
                            delete this['new_zhuangban_item_ids'][z];
                        }
                    },
                    z['checkItemEnough'] = function (G) {
                        for (var F = G['split'](','), v = 0, h = F; v < h['length']; v++) {
                            var P = h[v];
                            if (P) {
                                var C = P['split']('-');
                                if (z['get_item_count'](Number(C[0])) < Number(C[1]))
                                    return !1;
                            }
                        }
                        return !0;
                    },
                    z['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    z['prototype']['onCreate'] = function () {
                        var F = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F.hide(Laya['Handler']['create'](F, function () {
                                    return F['closeHandler'] ? (F['closeHandler'].run(), F['closeHandler'] = null, void 0) : (G['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var v = function (G) {
                            z.tabs.push(z['container_content']['getChildByName']('tabs')['getChildByName']('btn' + G)),
                                z.tabs[G]['clickHandler'] = Laya['Handler']['create'](z, function () {
                                    F['select_index'] != G && F['on_change_tab'](G);
                                }, null, !1);
                        }, z = this, h = 0; 5 > h; h++)
                            v(h);
                        this['page_item'] = new G['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new G['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new G['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new G['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    z['prototype'].show = function (F, v) {
                        var z = this;
                        void 0 === F && (F = 0),
                            void 0 === v && (v = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = v,
                            G['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            G['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                z['locking'] = !1;
                            }),
                            this['on_change_tab'](F),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    z['prototype']['onSkinYuLanBack'] = function () {
                        var F = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            G['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            G['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                F['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    z['prototype'].hide = function (F) {
                        var v = this;
                        this['locking'] = !0,
                            G['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            G['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                v['locking'] = !1,
                                    v['enable'] = !1,
                                    F && F.run();
                            });
                    },
                    z['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    z['prototype']['on_change_tab'] = function (G) {
                        this['select_index'] = G;
                        for (var v = 0; v < this.tabs['length']; v++)
                            this.tabs[v].skin = game['Tools']['localUISrc'](G == v ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[v]['getChildAt'](0)['color'] = G == v ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), G) {
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
                    z['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    z['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    z['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    z['_item_map'] = {},
                    z['_item_listener'] = {},
                    z['_all_item_listener'] = [],
                    z['_daily_gain_record'] = {},
                    z['new_bag_item_ids'] = [],
                    z['new_zhuangban_item_ids'] = {},
                    z['new_cg_ids'] = [],
                    z.Inst = null,
                    z;
            }
                (G['UIBase']);
            G['UI_Bag'] = v;
        }
            (uiscript || (uiscript = {}));

















        // 修改牌桌上角色
        !function (G) {
            var F = function () {
                function F() {
                    var F = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = G['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (G) {
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](G)),
                                F['loaded_player_count'] = G['ready_id_list']['length'],
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
                    F['prototype']['OpenConnect'] = function (F, v, z, h) {
                        var P = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            G['Scene_Lobby'].Inst && G['Scene_Lobby'].Inst['active'] && (G['Scene_Lobby'].Inst['active'] = !1),
                            G['Scene_Huiye'].Inst && G['Scene_Huiye'].Inst['active'] && (G['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                P.url = '',
                                    P['token'] = F,
                                    P['game_uuid'] = v,
                                    P['server_location'] = z,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = z,
                                    GameMgr.Inst['mj_game_token'] = F,
                                    GameMgr.Inst['mj_game_uuid'] = v,
                                    P['playerreconnect'] = h,
                                    P['_setState'](G['EConnectState']['tryconnect']),
                                    P['load_over'] = !1,
                                    P['loaded_player_count'] = 0,
                                    P['real_player_count'] = 0,
                                    P['lb_index'] = 0,
                                    P['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    F['prototype']['reportInfo'] = function () {
                        this['connect_state'] == G['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: G['LobbyNetMgr']['root_id_lst'][G['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    F['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](G['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    F['prototype']['_OnConnent'] = function (F) {
                        app.Log.log('MJNetMgr _OnConnent event:' + F),
                            F == Laya['Event']['CLOSE'] || F == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == G['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == G['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](G['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](G['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2008)), G['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == G['EConnectState']['reconnecting'] && this['_Reconnect']()) : F == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == G['EConnectState']['tryconnect'] || this['connect_state'] == G['EConnectState']['reconnecting']) && ((this['connect_state'] = G['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](G['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    F['prototype']['_Reconnect'] = function () {
                        var F = this;
                        G['LobbyNetMgr'].Inst['connect_state'] == G['EConnectState'].none || G['LobbyNetMgr'].Inst['connect_state'] == G['EConnectState']['disconnect'] ? this['_setState'](G['EConnectState']['disconnect']) : G['LobbyNetMgr'].Inst['connect_state'] == G['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](G['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            F['connect_state'] == G['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + F['reconnect_count']), app['NetAgent']['connect2MJ'](F.url, Laya['Handler']['create'](F, F['_OnConnent'], null, !1), 'local' == F['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    F['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? G['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](G['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && G['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
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
                        var v = this;
                        if (G['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= G['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && G['Scene_MJ'].Inst['ForceOut'](), this['_setState'](G['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + F);
                        var z = function (z) {
                            var h = JSON['parse'](z);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + z), h['maintenance'])
                                v['_setState'](G['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && G['Scene_MJ'].Inst['ForceOut']();
                            else if (h['servers'] && h['servers']['length'] > 0) {
                                for (var P = h['servers'], C = G['Tools']['deal_gateway'](P), M = 0; M < C['length']; M++)
                                    v.urls.push({
                                        name: '___' + M,
                                        url: C[M]
                                    });
                                v['link_index'] = -1,
                                    v['_try_to_linknext']();
                            } else
                                1 > F ? Laya['timer'].once(1000, v, function () {
                                    v['_fetch_gateway'](F + 1);
                                }) : G['LobbyNetMgr'].Inst['polling_connect'] ? (v['lb_index']++, v['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](60)), v['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && G['Scene_MJ'].Inst['ForceOut'](), v['_setState'](G['EConnectState'].none));
                        },
                            h = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > F ? Laya['timer'].once(500, v, function () {
                                        v['_fetch_gateway'](F + 1);
                                    }) : G['LobbyNetMgr'].Inst['polling_connect'] ? (v['lb_index']++, v['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](58)), v['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || G['Scene_MJ'].Inst['ForceOut'](), v['_setState'](G['EConnectState'].none));
                            },
                            P = function (G) {
                                var F = new Laya['HttpRequest']();
                                F.once(Laya['Event']['COMPLETE'], v, function (G) {
                                    z(G);
                                }),
                                    F.once(Laya['Event']['ERROR'], v, function () {
                                        h();
                                    });
                                var P = [];
                                P.push('If-Modified-Since'),
                                    P.push('0'),
                                    G += '?service=ws-game-gateway',
                                    G += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    G += '&location=' + v['server_location'],
                                    G += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    F.send(G, '', 'get', 'text', P),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + G);
                            };
                        G['LobbyNetMgr'].Inst['polling_connect'] ? P(G['LobbyNetMgr'].Inst.urls[this['lb_index']]) : P(G['LobbyNetMgr'].Inst['lb_url']);
                    },
                    F['prototype']['_setState'] = function (F) {
                        this['connect_state'] = F,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (F == G['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : F == G['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : F == G['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : F == G['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : F == G['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    F['prototype']['_ConnectSuccess'] = function () {
                        var F = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (v, z) {
                                if (v || z['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', v, z), G['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](z)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        z['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    var h = [],
                                        P = 0;
                                    view['DesktopMgr']['player_link_state'] = z['state_list'];
                                    var C = G['Tools']['strOfLocalization'](2003),
                                        M = z['game_config'].mode,
                                        U = view['ERuleMode']['Liqi4'];
                                    M.mode < 10 ? (U = view['ERuleMode']['Liqi4'], F['real_player_count'] = 4) : M.mode < 20 && (U = view['ERuleMode']['Liqi3'], F['real_player_count'] = 3);
                                    for (var y = 0; y < F['real_player_count']; y++)
                                        h.push(null);
                                    M['extendinfo'] && (C = G['Tools']['strOfLocalization'](2004)),
                                        M['detail_rule'] && M['detail_rule']['ai_level'] && (1 === M['detail_rule']['ai_level'] && (C = G['Tools']['strOfLocalization'](2003)), 2 === M['detail_rule']['ai_level'] && (C = G['Tools']['strOfLocalization'](2004)));
                                    for (var S = G['GameUtility']['get_default_ai_skin'](), N = G['GameUtility']['get_default_ai_character'](), y = 0; y < z['seat_list']['length']; y++) {
                                        var O = z['seat_list'][y];
                                        if (0 == O) {
                                            h[y] = {
                                                nickname: C,
                                                avatar_id: S,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: N,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: S,
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
                                                    h[y].avatar_id = skin.id;
                                                    h[y].character.charid = skin.character_id;
                                                    h[y].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                h[y].nickname = '[BOT]' + h[y].nickname;
                                            }
                                        } else {
                                            P++;
                                            for (var W = 0; W < z['players']['length']; W++)
                                                if (z['players'][W]['account_id'] == O) {
                                                    h[y] = z['players'][W];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (h[y].account_id == GameMgr.Inst.account_id) {
                                                        for (let item of uiscript.UI_Sushe.characters) {
                                                            if (item['charid'] == uiscript.UI_Sushe.main_character_id) {
                                                                h[y].character = item;
                                                            }
                                                        }
                                                        h[y].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        h[y].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        h[y].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        h[y].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            h[y].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (h[y].avatar_id == 400101 || h[y].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            h[y].avatar_id = skin.id;
                                                            h[y].character.charid = skin.character_id;
                                                            h[y].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(h[y].account_id);
                                                        if (server == 1) {
                                                            h[y].nickname = '[CN]' + h[y].nickname;
                                                        } else if (server == 2) {
                                                            h[y].nickname = '[JP]' + h[y].nickname;
                                                        } else if (server == 3) {
                                                            h[y].nickname = '[EN]' + h[y].nickname;
                                                        } else {
                                                            h[y].nickname = '[??]' + h[y].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var y = 0; y < F['real_player_count']; y++)
                                        null == h[y] && (h[y] = {
                                            account: 0,
                                            nickname: G['Tools']['strOfLocalization'](2010),
                                            avatar_id: S,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: N,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: S,
                                                is_upgraded: !1
                                            }
                                        });
                                    F['loaded_player_count'] = z['ready_id_list']['length'],
                                        F['_AuthSuccess'](h, z['is_game_start'], z['game_config']['toJSON']());
                                }
                            });
                    },
                    F['prototype']['_AuthSuccess'] = function (F, v, z) {
                        var h = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (F, v) {
                                    F || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', F, v), G['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](v)), v['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2011)), G['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](v['game_restore'])));
                                });
                        })) : G['Scene_MJ'].Inst['openMJRoom'](z, F, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](z)), F, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](h, function () {
                                v ? Laya['timer']['frameOnce'](10, h, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (F, v) {
                                            app.Log.log('syncGame ' + JSON['stringify'](v)),
                                                F || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', F, v), G['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), h['_PlayerReconnectSuccess'](v));
                                        });
                                }) : Laya['timer']['frameOnce'](10, h, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (F, v) {
                                            F || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', F, v), G['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), h['_EnterGame'](v), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (G) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * G);
                        }, null, !1));
                    },
                    F['prototype']['_EnterGame'] = function (F) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](F)),
                            F['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2011)), G['Scene_MJ'].Inst['GameEnd']()) : F['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](F['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    F['prototype']['_PlayerReconnectSuccess'] = function (F) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](F)),
                            F['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2011)), G['Scene_MJ'].Inst['GameEnd']()) : F['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](F['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](G['Tools']['strOfLocalization'](2012)), G['Scene_MJ'].Inst['ForceOut']());
                    },
                    F['prototype']['_SendDebugInfo'] = function () { },
                    F['prototype']['OpenConnectObserve'] = function (F, v) {
                        var z = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                z['server_location'] = v,
                                    z['ob_token'] = F,
                                    z['_setState'](G['EConnectState']['tryconnect']),
                                    z['lb_index'] = 0,
                                    z['_fetch_gateway'](0);
                            });
                    },
                    F['prototype']['_ConnectSuccessOb'] = function () {
                        var F = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (v, z) {
                                v || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', v, z), G['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](z)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (v, z) {
                                    if (v || z['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', v, z), G['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var h = z.head,
                                            P = h['game_config'].mode,
                                            C = [],
                                            M = G['Tools']['strOfLocalization'](2003),
                                            U = view['ERuleMode']['Liqi4'];
                                        P.mode < 10 ? (U = view['ERuleMode']['Liqi4'], F['real_player_count'] = 4) : P.mode < 20 && (U = view['ERuleMode']['Liqi3'], F['real_player_count'] = 3);
                                        for (var y = 0; y < F['real_player_count']; y++)
                                            C.push(null);
                                        P['extendinfo'] && (M = G['Tools']['strOfLocalization'](2004)),
                                            P['detail_rule'] && P['detail_rule']['ai_level'] && (1 === P['detail_rule']['ai_level'] && (M = G['Tools']['strOfLocalization'](2003)), 2 === P['detail_rule']['ai_level'] && (M = G['Tools']['strOfLocalization'](2004)));
                                        for (var S = G['GameUtility']['get_default_ai_skin'](), N = G['GameUtility']['get_default_ai_character'](), y = 0; y < h['seat_list']['length']; y++) {
                                            var O = h['seat_list'][y];
                                            if (0 == O)
                                                C[y] = {
                                                    nickname: M,
                                                    avatar_id: S,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: N,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: S,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var W = 0; W < h['players']['length']; W++)
                                                    if (h['players'][W]['account_id'] == O) {
                                                        C[y] = h['players'][W];
                                                        break;
                                                    }
                                        }
                                        for (var y = 0; y < F['real_player_count']; y++)
                                            null == C[y] && (C[y] = {
                                                account: 0,
                                                nickname: G['Tools']['strOfLocalization'](2010),
                                                avatar_id: S,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: N,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: S,
                                                    is_upgraded: !1
                                                }
                                            });
                                        F['_StartObSuccuess'](C, z['passed'], h['game_config']['toJSON'](), h['start_time']);
                                    }
                                }));
                            });
                    },
                    F['prototype']['_StartObSuccuess'] = function (F, v, z, h) {
                        var P = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](h, v);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), G['Scene_MJ'].Inst['openMJRoom'](z, F, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](z)), F, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](P, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, P, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](h, v);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (G) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * G);
                        }, null, !1)));
                    },
                    F['_Inst'] = null,
                    F;
            }
                ();
            G['MJNetMgr'] = F;
        }
            (game || (game = {}));















        // 读取战绩
        !function (G) {
            var F = function (F) {
                function v() {
                    var G = F.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return G['account_id'] = 0,
                        G['origin_x'] = 0,
                        G['origin_y'] = 0,
                        G.root = null,
                        G['title'] = null,
                        G['level'] = null,
                        G['btn_addfriend'] = null,
                        G['btn_report'] = null,
                        G['illust'] = null,
                        G.name = null,
                        G['detail_data'] = null,
                        G['achievement_data'] = null,
                        G['locking'] = !1,
                        G['tab_info4'] = null,
                        G['tab_info3'] = null,
                        G['tab_note'] = null,
                        G['tab_img_dark'] = '',
                        G['tab_img_chosen'] = '',
                        G['player_data'] = null,
                        G['tab_index'] = 1,
                        G['game_category'] = 1,
                        G['game_type'] = 1,
                        G['show_name'] = '',
                        v.Inst = G,
                        G;
                }
                return __extends(v, F),
                    v['prototype']['onCreate'] = function () {
                        var F = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new G['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new G['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new G['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new G['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new G['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
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
                                G['UI_Report_Nickname'].Inst.show(F['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['close']();
                            }, null, !1),
                            this.note = new G['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
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
                                F['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? G['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : F['container_info']['visible'] && (F['container_info']['visible'] = !1, F['tab_info4'].skin = F['tab_img_dark'], F['tab_info3'].skin = F['tab_img_dark'], F['tab_note'].skin = F['tab_img_chosen'], F['tab_index'] = 3, F.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    v['prototype'].show = function (F, v, z, h, P) {
                        var C = this;
                        void 0 === v && (v = 1),
                            void 0 === z && (z = 2),
                            void 0 === h && (h = 1),
                            void 0 === P && (P = ''),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = F,
                            this['show_name'] = P,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            G['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                C['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: F
                            }, function (v, z) {
                                v || z['error'] ? G['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', v, z) : G['UI_Shilian']['now_season_info'] && 1001 == G['UI_Shilian']['now_season_info']['season_id'] && 3 != G['UI_Shilian']['get_cur_season_state']() ? (C['detail_data']['setData'](z), C['changeMJCategory'](C['tab_index'], C['game_category'], C['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: F
                                }, function (F, v) {
                                    F || v['error'] ? G['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', F, v) : (z['season_info'] = v['season_info'], C['detail_data']['setData'](z), C['changeMJCategory'](C['tab_index'], C['game_category'], C['game_type']));
                                });
                            }),
                            this.note['init_data'](F),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = F != GameMgr.Inst['account_id'],
                            this['tab_index'] = v,
                            this['game_category'] = z,
                            this['game_type'] = h,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    v['prototype']['refreshBaseInfo'] = function () {
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
                            }, function (v, z) {
                                if (v || z['error'])
                                    G['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', v, z);
                                else {
                                    var h = z['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (h.account_id == GameMgr.Inst.account_id) {
                                        h.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            h.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            h.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    F['player_data'] = h,
                                        F['account_id'] != GameMgr.Inst['account_id'] && F['show_name'] && (h['nickname'] = F['show_name']),
                                        game['Tools']['SetNickname'](F.name, h, !1, !!F['show_name']),
                                        F['title'].id = game['Tools']['titleLocalization'](h['account_id'], h['title']),
                                        F['level'].id = h['level'].id,
                                        F['level'].id = F['player_data'][1 == F['tab_index'] ? 'level' : 'level3'].id,
                                        F['level'].exp = F['player_data'][1 == F['tab_index'] ? 'level' : 'level3']['score'],
                                        F['illust'].me['visible'] = !0,
                                        F['account_id'] == GameMgr.Inst['account_id'] ? F['illust']['setSkin'](h['avatar_id'], 'waitingroom') : F['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](h['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], F['account_id']) && F['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(F['account_id']) ? (F['btn_addfriend']['visible'] = !0, F['btn_report'].x = 520) : (F['btn_addfriend']['visible'] = !1, F['btn_report'].x = 343),
                                        F.note.sign['setSign'](h['signature']),
                                        F['achievement_data'].show(!1, h['achievement_count']);
                                }
                            });
                    },
                    v['prototype']['changeMJCategory'] = function (G, F, v) {
                        void 0 === F && (F = 2),
                            void 0 === v && (v = 1),
                            this['tab_index'] = G,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](G, F, v),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    v['prototype']['close'] = function () {
                        var F = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), G['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1,
                                F['enable'] = !1;
                        }))));
                    },
                    v['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                    },
                    v['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                            this['detail_data']['close'](),
                            this['illust']['clear'](),
                            Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                    },
                    v.Inst = null,
                    v;
            }
                (G['UIBase']);
            G['UI_OtherPlayerInfo'] = F;
        }
            (uiscript || (uiscript = {}));
















        // 宿舍相关
        !function (G) {
            var F = function () {
                function F(F, z) {
                    var h = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = F,
                        this['container_illust'] = z,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = F['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            h['during_move'] = !0,
                                h['mouse_start_x'] = h['container_move']['mouseX'],
                                h['mouse_start_y'] = h['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            h['during_move'] && (h.move(h['container_move']['mouseX'] - h['mouse_start_x'], h['container_move']['mouseY'] - h['mouse_start_y']), h['mouse_start_x'] = h['container_move']['mouseX'], h['mouse_start_y'] = h['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            h['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            h['during_move'] = !1;
                        }),
                        this['btn_close'] = F['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            h['locking'] || h['close']();
                        }, null, !1),
                        this['scrollbar'] = F['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (G) {
                            h['_scale'] = 1 * (1 - G) + 0.5,
                                h['illust']['scaleX'] = h['_scale'],
                                h['illust']['scaleY'] = h['_scale'],
                                h['scrollbar']['setVal'](G, 0);
                        })),
                        this['dongtai_kaiguan'] = new G['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            v.Inst['illust']['resetSkin'](),
                                h['illust']['scaleX'] = h['_scale'],
                                h['illust']['scaleY'] = h['_scale'];
                        }), new Laya['Handler'](this, function (G) {
                            v.Inst['illust']['playAnim'](G);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](F['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (G) {
                        this['_scale'] = G,
                            this['scrollbar']['setVal'](1 - (G - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    F['prototype'].show = function (F) {
                        var z = this;
                        this['locking'] = !0,
                            this['when_close'] = F,
                            this['illust_start_x'] = this['illust'].x,
                            this['illust_start_y'] = this['illust'].y,
                            this['illust_center_x'] = this['illust'].x + 984 - 446,
                            this['illust_center_y'] = this['illust'].y + 11 - 84,
                            this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                            this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                            this['container_illust']['getChildByName']('btn')['visible'] = !1,
                            v.Inst['stopsay'](),
                            this['scale'] = 1,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_center_x'],
                                y: this['illust_center_y']
                            }, 200),
                            G['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                z['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](v.Inst['illust']['skin_id']);
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
                            G['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                F['locking'] = !1,
                                    F.me['visible'] = !1,
                                    F['when_close'].run();
                            });
                    },
                    F['prototype'].move = function (G, F) {
                        var v = this['illust'].x + G,
                            z = this['illust'].y + F;
                        v < this['illust_center_x'] - 600 ? v = this['illust_center_x'] - 600 : v > this['illust_center_x'] + 600 && (v = this['illust_center_x'] + 600),
                            z < this['illust_center_y'] - 1200 ? z = this['illust_center_y'] - 1200 : z > this['illust_center_y'] + 800 && (z = this['illust_center_y'] + 800),
                            this['illust'].x = v,
                            this['illust'].y = z;
                    },
                    F;
            }
                (),
                v = function (v) {
                    function z() {
                        var G = v.call(this, new ui['lobby']['susheUI']()) || this;
                        return G['contianer_illust'] = null,
                            G['illust'] = null,
                            G['illust_rect'] = null,
                            G['container_name'] = null,
                            G['label_name'] = null,
                            G['label_cv'] = null,
                            G['label_cv_title'] = null,
                            G['container_page'] = null,
                            G['container_look_illust'] = null,
                            G['page_select_character'] = null,
                            G['page_visit_character'] = null,
                            G['origin_illust_x'] = 0,
                            G['chat_id'] = 0,
                            G['container_chat'] = null,
                            G['_select_index'] = 0,
                            G['sound_id'] = null,
                            G['chat_block'] = null,
                            G['illust_showing'] = !0,
                            z.Inst = G,
                            G;
                    }
                    return __extends(z, v),
                        z['onMainSkinChange'] = function () {
                            var G = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            G && G['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](G.path) + '/spine');
                        },
                        z['randomDesktopID'] = function () {
                            var F = G['UI_Sushe']['commonViewList'][G['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), F)
                                for (var v = 0; v < F['length']; v++)
                                    F[v].slot == game['EView'].mjp ? this['now_mjp_id'] = F[v].type ? F[v]['item_id_list'][Math['floor'](Math['random']() * F[v]['item_id_list']['length'])] : F[v]['item_id'] : F[v].slot == game['EView']['desktop'] ? this['now_desktop_id'] = F[v].type ? F[v]['item_id_list'][Math['floor'](Math['random']() * F[v]['item_id_list']['length'])] : F[v]['item_id'] : F[v].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = F[v].type ? F[v]['item_id_list'][Math['floor'](Math['random']() * F[v]['item_id_list']['length'])] : F[v]['item_id']);
                        },
                        z.init = function (F) {
                            var v = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (h, P) {
                                if (h || P['error'])
                                    G['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', h, P);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](P)), P = JSON['parse'](JSON['stringify'](P)), P['main_character_id'] && P['characters']) {
                                        //if (v['characters'] = [], P['characters'])
                                        //    for (var C = 0; C < P['characters']['length']; C++)
                                        //        v['characters'].push(P['characters'][C]);
                                        //if (v['skin_map'] = {}, P['skins'])
                                        //    for (var C = 0; C < P['skins']['length']; C++)
                                        //        v['skin_map'][P['skins'][C]] = 1;
                                        //v['main_character_id'] = P['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = P.main_character_id;
                                        for (let count = 0; count < P.characters.length; count++) {
                                            if (P.characters[count].charid == P.main_character_id) {
                                                if (P.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = P.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = P.skins[count];
                                                fake_data.exp = P.characters[count].exp;
                                                fake_data.level = P.characters[count].level;
                                                fake_data.is_upgraded = P.characters[count].is_upgraded;
                                                break;
                                            }
                                        }
                                        v.characters = [];

                                        for (let count = 0; count < cfg.item_definition.character['rows_'].length; count++) {
                                            let id = cfg.item_definition.character['rows_'][count]['id'];
                                            let skin = cfg.item_definition.character['rows_'][count]['init_skin'];
                                            let emoji = [];
                                            let group = cfg.character.emoji.getGroup(id);
                                            if (group !== undefined) {
                                                group.forEach((element) => {
                                                    emoji.push(element.sub_id);
                                                });
                                                v.characters.push({
                                                    charid: id,
                                                    level: 5,
                                                    exp: 0,
                                                    skin: skin,
                                                    is_upgraded: 1,
                                                    extra_emoji: emoji,
                                                    rewarded_level: []
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
                                        v.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        v.star_chars = MMP.settings.star_chars;
                                        P.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        v['characters'] = [], v['characters'].push({
                                            charid: '200001',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400101',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), v['characters'].push({
                                            charid: '200002',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400201',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), v['skin_map']['400101'] = 1, v['skin_map']['400201'] = 1, v['main_character_id'] = '200001';
                                    if (v['send_gift_count'] = 0, v['send_gift_limit'] = 0, P['send_gift_count'] && (v['send_gift_count'] = P['send_gift_count']), P['send_gift_limit'] && (v['send_gift_limit'] = P['send_gift_limit']), P['finished_endings'])
                                        for (var C = 0; C < P['finished_endings']['length']; C++)
                                            v['finished_endings_map'][P['finished_endings'][C]] = 1;
                                    if (P['rewarded_endings'])
                                        for (var C = 0; C < P['rewarded_endings']['length']; C++)
                                            v['rewarded_endings_map'][P['rewarded_endings'][C]] = 1;
                                    if (v['star_chars'] = [], P['character_sort'] && (v['star_chars'] = P['character_sort']), z['hidden_characters_map'] = {}, P['hidden_characters'])
                                        for (var M = 0, U = P['hidden_characters']; M < U['length']; M++) {
                                            var y = U[M];
                                            z['hidden_characters_map'][y] = 1;
                                        }
                                    F.run();
                                }
                            }), //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (F, z) {
                                //if (F || z['error'])
                                //    G['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', F, z);
                                //else {
                                //    v['using_commonview_index'] = z.use,
                                //    v['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //    var h = z['views'];
                                //    if (h)
                                //        for (var P = 0; P < h['length']; P++) {
                                //            var C = h[P]['values'];
                                //            C && (v['commonViewList'][h[P]['index']] = C);
                                //        }
                                //    v['randomDesktopID'](),
                                v.commonViewList = MMP.settings.commonViewList;
                            v.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view']();
                            GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                            //}
                            //}), void 0);
                        },
                        z['onFetchSuccess'] = function (G) {
                            var F = G['character_info'];
                            if (F) {
                                if (F['main_character_id'] && F['characters']) {
                                    //if (this['characters'] = [], F['characters'])
                                    //    for (var v = 0; v < F['characters']['length']; v++)
                                    //        this['characters'].push(F['characters'][v]);
                                    //if (this['skin_map'] = {}, F['skins'])
                                    //    for (var v = 0; v < F['skins']['length']; v++)
                                    //        this['skin_map'][F['skins'][v]] = 1;
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
                                                rewarded_level: []
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
                                    for (var v = 0; v < F['finished_endings']['length']; v++)
                                        this['finished_endings_map'][F['finished_endings'][v]] = 1;
                                if (F['rewarded_endings'])
                                    for (var v = 0; v < F['rewarded_endings']['length']; v++)
                                        this['rewarded_endings_map'][F['rewarded_endings'][v]] = 1;
                                if (this['star_chars'] = [], F['character_sort'] && 0 != F['character_sort']['length'] && (this['star_chars'] = F['character_sort']), z['hidden_characters_map'] = {}, F['hidden_characters'])
                                    for (var h = 0, P = F['hidden_characters']; h < P['length']; h++) {
                                        var C = P[h];
                                        z['hidden_characters_map'][C] = 1;
                                    }
                            }
                            var M = G['all_common_views'];
                            //if (M) {
                            //    this['using_commonview_index'] = M.use,
                            //    this['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                            //    var U = M['views'];
                            //    if (U)
                            //        for (var v = 0; v < U['length']; v++) {
                            //            var y = U[v]['values'];
                            //            y && (this['commonViewList'][U[v]['index']] = y);
                            //        }
                            //    this['randomDesktopID'](),
                            this.commonViewList = MMP.settings.commonViewList;
                            this.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view']();
                            GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            this.randomDesktopID();
                            //}
                        },
                        z['on_data_updata'] = function (F) {
                            if (F['character']) {
                                var v = JSON['parse'](JSON['stringify'](F['character']));
                                if (v['characters'])
                                    for (var z = v['characters'], h = 0; h < z['length']; h++) {
                                        for (var P = !1, C = 0; C < this['characters']['length']; C++)
                                            if (this['characters'][C]['charid'] == z[h]['charid']) {
                                                this['characters'][C] = z[h],
                                                    G['UI_Sushe_Visit'].Inst && G['UI_Sushe_Visit'].Inst['chara_info'] && G['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][C]['charid'] && (G['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][C]),
                                                    P = !0;
                                                break;
                                            }
                                        P || this['characters'].push(z[h]);
                                    }
                                if (v['skins'])
                                    for (var M = v['skins'], h = 0; h < M['length']; h++)
                                        this['skin_map'][M[h]] = 1;
                                // START
                                uiscript['UI_Bag'].Inst['on_skin_change']();
                                // END
                                if (v['finished_endings']) {
                                    for (var U = v['finished_endings'], h = 0; h < U['length']; h++)
                                        this['finished_endings_map'][U[h]] = 1;
                                    G['UI_Sushe_Visit'].Inst;
                                }
                                if (v['rewarded_endings']) {
                                    for (var U = v['rewarded_endings'], h = 0; h < U['length']; h++)
                                        this['rewarded_endings_map'][U[h]] = 1;
                                    G['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        z['chara_owned'] = function (G) {
                            for (var F = 0; F < this['characters']['length']; F++)
                                if (this['characters'][F]['charid'] == G)
                                    return !0;
                            return !1;
                        },
                        z['skin_owned'] = function (G) {
                            return this['skin_map']['hasOwnProperty'](G['toString']());
                        },
                        z['add_skin'] = function (G) {
                            this['skin_map'][G] = 1;
                        },
                        Object['defineProperty'](z, 'main_chara_info', {
                            get: function () {
                                for (var G = 0; G < this['characters']['length']; G++)
                                    if (this['characters'][G]['charid'] == this['main_character_id'])
                                        return this['characters'][G];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        z['on_view_remove'] = function (G) {
                            for (var F = 0; F < this['commonViewList']['length']; F++)
                                for (var v = this['commonViewList'][F], z = 0; z < v['length']; z++)
                                    if (v[z]['item_id'] == G && (v[z]['item_id'] = game['GameUtility']['get_view_default_item_id'](v[z].slot)), v[z]['item_id_list']) {
                                        for (var h = 0; h < v[z]['item_id_list']['length']; h++)
                                            if (v[z]['item_id_list'][h] == G) {
                                                v[z]['item_id_list']['splice'](h, 1);
                                                break;
                                            }
                                        0 == v[z]['item_id_list']['length'] && (v[z].type = 0);
                                    }
                            var P = cfg['item_definition'].item.get(G);
                            P.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == G && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        z['add_finish_ending'] = function (G) {
                            this['finished_endings_map'][G] = 1;
                        },
                        z['add_reward_ending'] = function (G) {
                            this['rewarded_endings_map'][G] = 1;
                        },
                        z['check_all_char_repoint'] = function () {
                            for (var G = 0; G < z['characters']['length']; G++)
                                if (this['check_char_redpoint'](z['characters'][G]))
                                    return !0;
                            return !1;
                        },
                        z['check_char_redpoint'] = function (G) {
                            // 去除小红点
                            //if (z['hidden_characters_map'][G['charid']])
                            return !1;
                            //END
                            var F = cfg.spot.spot['getGroup'](G['charid']);
                            if (F)
                                for (var v = 0; v < F['length']; v++) {
                                    var h = F[v];
                                    if (!(h['is_married'] && !G['is_upgraded'] || !h['is_married'] && G['level'] < h['level_limit']) && 2 == h.type) {
                                        for (var P = !0, C = 0; C < h['jieju']['length']; C++)
                                            if (h['jieju'][C] && z['finished_endings_map'][h['jieju'][C]]) {
                                                if (!z['rewarded_endings_map'][h['jieju'][C]])
                                                    return !0;
                                                P = !1;
                                            }
                                        if (P)
                                            return !0;
                                    }
                                }
                            var M = cfg['item_definition']['character'].get(G['charid']);
                            if (M && M.ur)
                                for (var U = cfg['level_definition']['character']['getGroup'](G['charid']), y = 1, S = 0, N = U; S < N['length']; S++) {
                                    var O = N[S];
                                    if (y > G['level'])
                                        return;
                                    if (O['reward'] && (!G['rewarded_level'] || -1 == G['rewarded_level']['indexOf'](y)))
                                        return !0;
                                    y++;
                                }
                            return !1;
                        },
                        z['is_char_star'] = function (G) {
                            return -1 != this['star_chars']['indexOf'](G);
                        },
                        z['change_char_star'] = function (G) {
                            var F = this['star_chars']['indexOf'](G);
                            -1 != F ? this['star_chars']['splice'](F, 1) : this['star_chars'].push(G);
                            // 屏蔽网络请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                            //    sort: this['star_chars']
                            //}, function () {});
                            // END
                        },
                        Object['defineProperty'](z['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        z['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        z['prototype']['onCreate'] = function () {
                            var v = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new G['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = G['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new G['UI_Character_Chat'](this['container_chat'], !0),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!v['page_visit_character'].me['visible'] || !v['page_visit_character']['cannot_click_say'])
                                        if (v['illust']['onClick'](), v['sound_id'])
                                            v['stopsay']();
                                        else {
                                            if (!v['illust_showing'])
                                                return;
                                            v.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title'), 'chs_t' == GameMgr['client_type'] && this['label_cv_title']['scale'](0.98, 0.98)) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new G['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new G['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new F(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        z['prototype'].show = function (F) {
                            G['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var v = 0, h = 0; h < z['characters']['length']; h++)
                                if (z['characters'][h]['charid'] == z['main_character_id']) {
                                    v = h;
                                    break;
                                }
                            0 == F ? (this['change_select'](v), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        z['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](z['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        z['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(z['characters'][this['_select_index']], 2);
                        },
                        z['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                G['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        z['prototype']['close'] = function (F) {
                            var v = this;
                            this['illust_showing'] && G['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    v['enable'] = !1,
                                        F && F.run();
                                });
                        },
                        z['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        z['prototype']['hide_illust'] = function () {
                            var F = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, G['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                F['contianer_illust']['visible'] = !1;
                            })));
                        },
                        z['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, G['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var F = 0, v = 0; v < z['characters']['length']; v++)
                                        if (z['characters'][v]['charid'] == z['main_character_id']) {
                                            F = v;
                                            break;
                                        }
                                    this['change_select'](F);
                                }
                        },
                        z['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        z['prototype']['show_page_visit'] = function (G) {
                            void 0 === G && (G = 0),
                                this['page_visit_character'].show(z['characters'][this['_select_index']], G);
                        },
                        z['prototype']['change_select'] = function (F) {
                            this['_select_index'] = F,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var v = z['characters'][F],
                                h = cfg['item_definition']['character'].get(v['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != z['chs_fengyu_name_lst']['indexOf'](v['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != z['chs_fengyu_cv_lst']['indexOf'](v['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = h['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = h['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV',
                                    'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_name'].font ? this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](0.9, 0.9), this['label_name']['leading'] = -8) : (this['label_name']['scale'](1.2, 1.2), this['label_name']['leading'] = 0) : this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](1.1, 1.1), this['label_name']['leading'] = -14) : (this['label_name']['scale'](1.25, 1.25), this['label_name']['leading'] = -3);
                                var P = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                P.test(h['name_' + GameMgr['client_language']]) && (this['label_name']['leading'] -= 15),
                                    P.test(this['label_cv'].text) && (this['label_cv']['leading'] -= 7),
                                    this['label_cv']['height'] = 600,
                                    'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_cv'].font ? (this['label_cv']['scale'](1, 1), this['label_cv']['leading'] = -4, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']) : (this['label_cv']['scale'](1.1, 1.1), this['label_cv']['leading'] = -9, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']);
                            } else
                                this['label_name'].text = h['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + h['desc_cv_' + GameMgr['client_language']];
                            var C = new G['UIRect']();
                            C.x = this['illust_rect'].x,
                                C.y = this['illust_rect'].y,
                                C['width'] = this['illust_rect']['width'],
                                C['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](C),
                                this['illust']['setSkin'](v.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                G['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var M = cfg['item_definition'].skin.get(v.skin);
                            M && M['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        z['prototype']['onChangeSkin'] = function (G) {
                            z['characters'][this['_select_index']].skin = G,
                                this['change_select'](this['_select_index']),
                                z['characters'][this['_select_index']]['charid'] == z['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = G, z['onMainSkinChange']());
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                            //    character_id: z['characters'][this['_select_index']]['charid'],
                            //    skin: G
                            //}, function () {});
                            // 保存皮肤
                        },
                        z['prototype'].say = function (G) {
                            var F = this,
                                v = z['characters'][this['_select_index']];
                            this['chat_id']++;
                            var h = this['chat_id'],
                                P = view['AudioMgr']['PlayCharactorSound'](v, G, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, F, function () {
                                        h == F['chat_id'] && F['stopsay']();
                                    });
                                }));
                            P && (this['chat_block'].show(P['words']), this['sound_id'] = P['audio_id']);
                        },
                        z['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                        },
                        z['prototype']['to_look_illust'] = function () {
                            var G = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                G['illust']['playAnim']('idle'),
                                    G['page_select_character'].show(0);
                            }));
                        },
                        z['prototype']['jump_to_char_skin'] = function (F, v) {
                            var h = this;
                            if (void 0 === F && (F = -1), void 0 === v && (v = null), F >= 0)
                                for (var P = 0; P < z['characters']['length']; P++)
                                    if (z['characters'][P]['charid'] == F) {
                                        this['change_select'](P);
                                        break;
                                    }
                            G['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                z.Inst['show_page_visit'](),
                                    h['page_visit_character']['show_pop_skin'](),
                                    h['page_visit_character']['set_jump_callback'](v);
                            }));
                        },
                        z['prototype']['jump_to_char_qiyue'] = function (F) {
                            var v = this;
                            if (void 0 === F && (F = -1), F >= 0)
                                for (var h = 0; h < z['characters']['length']; h++)
                                    if (z['characters'][h]['charid'] == F) {
                                        this['change_select'](h);
                                        break;
                                    }
                            G['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                z.Inst['show_page_visit'](),
                                    v['page_visit_character']['show_qiyue']();
                            }));
                        },
                        z['prototype']['jump_to_char_gift'] = function (F) {
                            var v = this;
                            if (void 0 === F && (F = -1), F >= 0)
                                for (var h = 0; h < z['characters']['length']; h++)
                                    if (z['characters'][h]['charid'] == F) {
                                        this['change_select'](h);
                                        break;
                                    }
                            G['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                z.Inst['show_page_visit'](),
                                    v['page_visit_character']['show_gift']();
                            }));
                        },
                        z['characters'] = [],
                        z['chs_fengyu_name_lst'] = ['200040', '200043', '200090'],
                        z['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071', '200089'],
                        z['skin_map'] = {},
                        z['main_character_id'] = 0,
                        z['send_gift_count'] = 0,
                        z['send_gift_limit'] = 0,
                        z['commonViewList'] = [],
                        z['using_commonview_index'] = 0,
                        z['finished_endings_map'] = {},
                        z['rewarded_endings_map'] = {},
                        z['star_chars'] = [],
                        z['hidden_characters_map'] = {},
                        z.Inst = null,
                        z;
                }
                    (G['UIBase']);
            G['UI_Sushe'] = v;
        }
            (uiscript || (uiscript = {}));

















        // 屏蔽改变宿舍角色的网络请求
        !function (G) {
            var F = function () {
                function F(F) {
                    var z = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = F,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || v.Inst['close'](Laya['Handler']['create'](z, function () {
                                G['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || v.Inst['close'](Laya['Handler']['create'](z, function () {
                                G['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || G['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || z['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new G['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            G['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return F['prototype'].show = function (F, v) {
                    if (void 0 === v && (v = !1), this.me['visible'] = !0, this['locking'] = !1, F ? this.me['alpha'] = 1 : G['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), v || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var z = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, z));
                    }
                },
                    F['prototype']['render_character_cell'] = function (F) {
                        var v = this,
                            z = F['index'],
                            h = F['container'],
                            P = F['cache_data'];
                        h['visible'] = !0,
                            P['index'] = z,
                            P['inited'] || (P['inited'] = !0, h['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                v['onClickAtHead'](P['index']);
                            }), P.skin = new G['UI_Character_Skin'](h['getChildByName']('btn')['getChildByName']('head')), P.bg = h['getChildByName']('btn')['getChildByName']('bg'), P['bound'] = h['getChildByName']('btn')['getChildByName']('bound'), P['btn_star'] = h['getChildByName']('btn_star'), P.star = h['getChildByName']('btn')['getChildByName']('star'), P['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                v['onClickAtStar'](P['index']);
                            }));
                        var C = h['getChildByName']('btn');
                        C['getChildByName']('choose')['visible'] = z == this['select_index'];
                        var M = this['getCharInfoByIndex'](z);
                        C['getChildByName']('redpoint')['visible'] = G['UI_Sushe']['check_char_redpoint'](M),
                            P.skin['setSkin'](M.skin, 'bighead'),
                            C['getChildByName']('using')['visible'] = M['charid'] == G['UI_Sushe']['main_character_id'],
                            h['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (M['is_upgraded'] ? '2.png' : '.png'));
                        var U = cfg['item_definition']['character'].get(M['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? P['bound'].skin = U.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (M['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (M['is_upgraded'] ? '2.png' : '.png')) : U.ur ? (P['bound'].pos(-10, -2), P['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (M['is_upgraded'] ? '6.png' : '5.png'))) : (P['bound'].pos(4, 20), P['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (M['is_upgraded'] ? '4.png' : '3.png'))),
                            P['btn_star']['visible'] = this['select_index'] == z,
                            P.star['visible'] = G['UI_Sushe']['is_char_star'](M['charid']) || this['select_index'] == z;
                        var y = cfg['item_definition']['character'].find(M['charid']),
                            S = C['getChildByName']('label_name'),
                            N = y['name_' + GameMgr['client_language'] + '2'] ? y['name_' + GameMgr['client_language'] + '2'] : y['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            P.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (G['UI_Sushe']['is_char_star'](M['charid']) ? 'l' : 'd') + (M['is_upgraded'] ? '1.png' : '.png')),
                                S.text = N['replace']('-', '|')['replace'](/\./g, '·');
                            var O = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            S['leading'] = O.test(N) ? -15 : 0;
                        } else
                            P.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (G['UI_Sushe']['is_char_star'](M['charid']) ? 'l.png' : 'd.png')), S.text = N;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == M['charid'] ? (S['scaleX'] = 0.67, S['scaleY'] = 0.57) : (S['scaleX'] = 0.7, S['scaleY'] = 0.6));
                    },
                    F['prototype']['onClickAtHead'] = function (F) {
                        var v = this;
                        if (!this['locking'])
                            if (this['select_index'] == F) {
                                var z = this['getCharInfoByIndex'](F);
                                if (z['charid'] != G['UI_Sushe']['main_character_id'])
                                    if (G['UI_PiPeiYuYue'].Inst['enable'])
                                        this['locking'] = !0, Laya['timer']['frameOnce'](11, this, function () {
                                            v['locking'] = !1;
                                        }), G['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                    else {
                                        var h = G['UI_Sushe']['main_character_id'];
                                        G['UI_Sushe']['main_character_id'] = z['charid'],
                                            app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                                character_id: G['UI_Sushe']['main_character_id']
                                            }, function () { }),
                                            GameMgr.Inst['account_data']['avatar_id'] = z.skin,
                                            G['UI_Sushe']['onMainSkinChange']();
                                        // 保存人物和皮肤
                                        MMP.settings.character = z.charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = z.skin;
                                        MMP.saveSettings();
                                        // END
                                        for (var P = 0; P < this['show_index_list']['length']; P++)
                                            this['getCharInfoByIndex'](P)['charid'] == h && this['scrollview']['wantToRefreshItem'](P);
                                        this['scrollview']['wantToRefreshItem'](F);
                                    }
                            } else {
                                var C = this['select_index'];
                                this['select_index'] = F,
                                    C >= 0 && this['scrollview']['wantToRefreshItem'](C),
                                    this['scrollview']['wantToRefreshItem'](F),
                                    G['UI_Sushe'].Inst['change_select'](this['show_index_list'][F]);
                            }
                    },
                    F['prototype']['onClickAtStar'] = function (F) {
                        if (G['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](F)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](F);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var v = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, v));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    F['prototype']['close'] = function (F) {
                        var v = this;
                        this.me['visible'] && (F ? this.me['visible'] = !1 : G['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            v.me['visible'] = !1;
                        })));
                    },
                    F['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var F = !1, v = 0, z = G['UI_Sushe']['star_chars']; v < z['length']; v++) {
                                var h = z[v];
                                if (!G['UI_Sushe']['hidden_characters_map'][h]) {
                                    F = !0;
                                    break;
                                }
                            }
                            if (!F)
                                return G['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        G['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var P = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](P),
                            Laya['Tween'].to(P, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    F['prototype']['getShowStarState'] = function () {
                        if (0 == G['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var F = 0, v = G['UI_Sushe']['star_chars']; F < v['length']; F++) {
                                var z = v[F];
                                if (!G['UI_Sushe']['hidden_characters_map'][z])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    F['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var F = 0, v = G['UI_Sushe']['star_chars']; F < v['length']; F++) {
                            var z = v[F];
                            if (!G['UI_Sushe']['hidden_characters_map'][z])
                                for (var h = 0; h < G['UI_Sushe']['characters']['length']; h++)
                                    if (G['UI_Sushe']['characters'][h]['charid'] == z) {
                                        h == G['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(h);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var h = 0; h < G['UI_Sushe']['characters']['length']; h++)
                                G['UI_Sushe']['hidden_characters_map'][G['UI_Sushe']['characters'][h]['charid']] || -1 == this['show_index_list']['indexOf'](h) && (h == G['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(h));
                    },
                    F['prototype']['getCharInfoByIndex'] = function (F) {
                        return G['UI_Sushe']['characters'][this['show_index_list'][F]];
                    },
                    F;
            }
                (),
                v = function (v) {
                    function z() {
                        var G = v.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return G['bg_width_head'] = 962,
                            G['bg_width_zhuangban'] = 1819,
                            G['bg2_delta'] = -29,
                            G['container_top'] = null,
                            G['locking'] = !1,
                            G.tabs = [],
                            G['tab_index'] = 0,
                            z.Inst = G,
                            G;
                    }
                    return __extends(z, v),
                        z['prototype']['onCreate'] = function () {
                            var v = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    v['locking'] || (1 == v['tab_index'] && v['container_zhuangban']['changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                        v['close'](),
                                            G['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (v['close'](), G['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var z = this.root['getChildByName']('container_tabs'), h = function (F) {
                                P.tabs.push(z['getChildAt'](F)),
                                    P.tabs[F]['clickHandler'] = new Laya['Handler'](P, function () {
                                        v['locking'] || v['tab_index'] != F && (1 == v['tab_index'] && v['container_zhuangban']['changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                            v['change_tab'](F);
                                        }), null) : v['change_tab'](F));
                                    });
                            }, P = this, C = 0; C < z['numChildren']; C++)
                                h(C);
                            this['container_head'] = new F(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new G['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return v['locking'];
                                }));
                        },
                        z['prototype'].show = function (F) {
                            var v = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = F,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), G['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), G['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), G['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), G['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    v['locking'] = !1;
                                });
                            for (var z = 0; z < this.tabs['length']; z++) {
                                var h = this.tabs[z];
                                h.skin = game['Tools']['localUISrc'](z == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var P = h['getChildByName']('word');
                                P['color'] = z == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    P['scaleX'] = P['scaleY'] = z == this['tab_index'] ? 1.1 : 1,
                                    z == this['tab_index'] && h['parent']['setChildIndex'](h, this.tabs['length'] - 1);
                            }
                        },
                        z['prototype']['change_tab'] = function (F) {
                            var v = this;
                            this['tab_index'] = F;
                            for (var z = 0; z < this.tabs['length']; z++) {
                                var h = this.tabs[z];
                                h.skin = game['Tools']['localUISrc'](z == F ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var P = h['getChildByName']('word');
                                P['color'] = z == F ? '#552c1c' : '#d3a86c',
                                    P['scaleX'] = P['scaleY'] = z == F ? 1.1 : 1,
                                    z == F && h['parent']['setChildIndex'](h, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    G['UI_Sushe'].Inst['open_illust'](),
                                        v['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), G['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    v['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function () {
                                    v['locking'] = !1;
                                });
                        },
                        z['prototype']['close'] = function (F) {
                            var v = this;
                            this['locking'] = !0,
                                G['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? G['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    v['container_head']['close'](!0);
                                })) : G['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    v['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        F && F.run();
                                });
                        },
                        z['prototype']['onDisable'] = function () {
                            for (var F = 0; F < G['UI_Sushe']['characters']['length']; F++) {
                                var v = G['UI_Sushe']['characters'][F].skin,
                                    z = cfg['item_definition'].skin.get(v);
                                z && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](z.path + '/bighead.png'));
                            }
                        },
                        z['prototype']['changeKaiguanShow'] = function (G) {
                            G ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        z['prototype']['changeZhuangbanSlot'] = function (G) {
                            this['container_zhuangban']['changeSlotByItemId'](G);
                        },
                        z;
                }
                    (G['UIBase']);
            G['UI_Sushe_Select'] = v;
        }
            (uiscript || (uiscript = {}));














        // 友人房
        !function (G) {
            var F = function () {
                function F(G) {
                    var F = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = G,
                        this.me['visible'] = !1,
                        this['blackbg'] = G['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            F['locking'] || F['close']();
                        }, null, !1),
                        this.root = G['getChildByName']('root'),
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
                    for (var v = game['FriendMgr']['friend_list'], z = 0; z < v['length']; z++)
                        this['sortlist'].push(z);
                    this['sortlist'] = this['sortlist'].sort(function (G, F) {
                        var z = v[G],
                            h = 0;
                        if (z['state']['is_online']) {
                            var P = game['Tools']['playState2Desc'](z['state']['playing']);
                            h += '' != P ? 30000000000 : 60000000000,
                                z.base['level'] && (h += z.base['level'].id % 1000 * 10000000),
                                z.base['level3'] && (h += z.base['level3'].id % 1000 * 10000),
                                h += -Math['floor'](z['state']['login_time'] / 10000000);
                        } else
                            h += z['state']['logout_time'];
                        var C = v[F],
                            M = 0;
                        if (C['state']['is_online']) {
                            var P = game['Tools']['playState2Desc'](C['state']['playing']);
                            M += '' != P ? 30000000000 : 60000000000,
                                C.base['level'] && (M += C.base['level'].id % 1000 * 10000000),
                                C.base['level3'] && (M += C.base['level3'].id % 1000 * 10000),
                                M += -Math['floor'](C['state']['login_time'] / 10000000);
                        } else
                            M += C['state']['logout_time'];
                        return M - h;
                    });
                    for (var z = 0; z < v['length']; z++)
                        this['friends'].push({
                            f: v[z],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        G['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1;
                        }));
                },
                    F['prototype']['close'] = function () {
                        var F = this;
                        this['locking'] = !0,
                            G['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                F['locking'] = !1,
                                    F.me['visible'] = !1;
                            }));
                    },
                    F['prototype']['render_item'] = function (F) {
                        var v = F['index'],
                            z = F['container'],
                            P = F['cache_data'];
                        P.head || (P.head = new G['UI_Head'](z['getChildByName']('head'), 'UI_WaitingRoom'), P.name = z['getChildByName']('name'), P['state'] = z['getChildByName']('label_state'), P.btn = z['getChildByName']('btn_invite'), P['invited'] = z['getChildByName']('invited'));
                        var C = this['friends'][this['sortlist'][v]];
                        P.head.id = game['GameUtility']['get_limited_skin_id'](C.f.base['avatar_id']),
                            P.head['set_head_frame'](C.f.base['account_id'], C.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](P.name, C.f.base, GameMgr.Inst['hide_nickname']);
                        var M = !1;
                        if (C.f['state']['is_online']) {
                            var U = game['Tools']['playState2Desc'](C.f['state']['playing']);
                            '' != U ? (P['state'].text = game['Tools']['strOfLocalization'](2069, [U]), P['state']['color'] = '#a9d94d', P.name['getChildByName']('name')['color'] = '#a9d94d') : (P['state'].text = game['Tools']['strOfLocalization'](2071), P['state']['color'] = '#58c4db', P.name['getChildByName']('name')['color'] = '#58c4db', M = !0);
                        } else
                            P['state'].text = game['Tools']['strOfLocalization'](2072), P['state']['color'] = '#8c8c8c', P.name['getChildByName']('name')['color'] = '#8c8c8c';
                        C['invited'] ? (P.btn['visible'] = !1, P['invited']['visible'] = !0) : (P.btn['visible'] = !0, P['invited']['visible'] = !1, game['Tools']['setGrayDisable'](P.btn, !M), M && (P.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](P.btn, !0);
                            var F = {
                                room_id: h.Inst['room_id'],
                                mode: h.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: C.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](F)
                            }, function (F, v) {
                                F || v['error'] ? (game['Tools']['setGrayDisable'](P.btn, !1), G['UIMgr'].Inst['showNetReqError']('sendClientMessage', F, v)) : (P.btn['visible'] = !1, P['invited']['visible'] = !0, C['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    F;
            }
                (),
                v = function () {
                    function F(F) {
                        var v = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = F,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new G['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new G['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return v['locking'];
                            }));
                        for (var z = this.root['getChildByName']('container_tabs'), h = function (F) {
                            P.tabs.push(z['getChildAt'](F)),
                                P.tabs[F]['clickHandler'] = new Laya['Handler'](P, function () {
                                    v['locking'] || v['tab_index'] != F && (1 == v['tab_index'] && v['page_zhangban']['changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                        v['change_tab'](F);
                                    }), null) : v['change_tab'](F));
                                });
                        }, P = this, C = 0; C < z['numChildren']; C++)
                            h(C);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            v['locking'] || (1 == v['tab_index'] && v['page_zhangban']['changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                v['keydown'](!1);
                            }), null) : v['keydown'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                v['locking'] || (1 == v['tab_index'] && v['page_zhangban']['changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                    v['close'](!1);
                                }), null) : v['close'](!1));
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
                            G['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                F['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var v = 0; v < this.tabs['length']; v++) {
                            var z = this.tabs[v];
                            z.skin = game['Tools']['localUISrc'](v == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var h = z['getChildByName']('word');
                            h['color'] = v == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                h['scaleX'] = h['scaleY'] = v == this['tab_index'] ? 1.1 : 1,
                                v == this['tab_index'] && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
                        }
                    },
                        F['prototype']['change_tab'] = function (G) {
                            var F = this;
                            this['tab_index'] = G;
                            for (var v = 0; v < this.tabs['length']; v++) {
                                var z = this.tabs[v];
                                z.skin = game['Tools']['localUISrc'](v == G ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var h = z['getChildByName']('word');
                                h['color'] = v == G ? '#552c1c' : '#d3a86c',
                                    h['scaleX'] = h['scaleY'] = v == G ? 1.1 : 1,
                                    v == G && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
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
                            var v = this;
                            //修改友人房间立绘
                            if (!(v.page_head.choosed_chara_index == 0 && v.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = v.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = v.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = v.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[v.page_head.choosed_chara_index] = v.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (F ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: h.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), G['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                v['locking'] = !1,
                                    v.me['visible'] = !1;
                            }))));
                        },
                        F;
                }
                    (),
                z = function () {
                    function G(G) {
                        this['modes'] = [],
                            this.me = G,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return G['prototype'].show = function (G) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = G,
                            this['scrollview']['addItem'](G['length']);
                        var F = this['scrollview']['total_height'];
                        F > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - F, this.bg['height'] = F + 20),
                            this.bg['visible'] = !0;
                    },
                        G['prototype']['render_item'] = function (G) {
                            var F = G['index'],
                                v = G['container'],
                                z = v['getChildByName']('info');
                            z['fontSize'] = 40,
                                z['fontSize'] = this['modes'][F]['length'] <= 5 ? 40 : this['modes'][F]['length'] <= 9 ? 55 - 3 * this['modes'][F]['length'] : 28,
                                z.text = this['modes'][F];
                        },
                        G;
                }
                    (),
                h = function (h) {
                    function P() {
                        var F = h.call(this, new ui['lobby']['waitingroomUI']()) || this;
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
                            P.Inst = F,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](F, function (G) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](G)),
                                    F['onReadyChange'](G['account_id'], G['ready'], G['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](F, function (G) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](G)),
                                    F['onPlayerChange'](G);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](F, function (G) {
                                F['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](G)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), F['onGameStart'](G));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](F, function (G) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](G)),
                                    F['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](F, function () {
                                F['enable'] && F.hide(Laya['Handler']['create'](F, function () {
                                    G['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            F;
                    }
                    return __extends(P, h),
                        P['prototype']['push_msg'] = function (G) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](G)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](G));
                        },
                        Object['defineProperty'](P['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](P['prototype'], 'robot_count', {
                            get: function () {
                                for (var G = 0, F = 0; F < this['players']['length']; F++)
                                    2 == this['players'][F]['category'] && G++;
                                return G;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        P['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        P['prototype']['updateData'] = function (G) {
                            if (!G)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < G.persons.length; i++) {

                                if (G.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    G.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    G.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    G.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    G.persons[i].title = GameMgr.Inst.account_data.title;
                                    G.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        G.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = G['room_id'],
                                this['owner_id'] = G['owner_id'],
                                this['room_mode'] = G.mode,
                                this['public_live'] = G['public_live'],
                                this['tournament_id'] = 0,
                                G['tournament_id'] && (this['tournament_id'] = G['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = G['max_player_count'],
                                this['players'] = [];
                            for (var F = 0; F < G['persons']['length']; F++) {
                                var v = G['persons'][F];
                                v['ready'] = !1,
                                    v['cell_index'] = -1,
                                    v['category'] = 1,
                                    this['players'].push(v);
                            }
                            for (var F = 0; F < G['robot_count']; F++)
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
                            for (var F = 0; F < G['ready_list']['length']; F++)
                                for (var z = 0; z < this['players']['length']; z++)
                                    if (this['players'][z]['account_id'] == G['ready_list'][F]) {
                                        this['players'][z]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                G.seq && (this['update_seq'] = G.seq);
                        },
                        P['prototype']['onReadyChange'] = function (G, F, v) {
                            for (var z = 0; z < this['players']['length']; z++)
                                if (this['players'][z]['account_id'] == G) {
                                    this['players'][z]['ready'] = F,
                                        this['players'][z]['dressing'] = v,
                                        this['_onPlayerReadyChange'](this['players'][z]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        P['prototype']['onPlayerChange'] = function (G) {
                            if (app.Log.log(G), G = G['toJSON'](), !(G.seq && G.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < G.player_list.length; i++) {

                                    if (G.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        G.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        G.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        G.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            G.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (G.update_list != undefined) {
                                    for (var i = 0; i < G.update_list.length; i++) {

                                        if (G.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            G.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            G.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            G.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                G.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = G.seq;
                                var F = {};
                                F.type = 'onPlayerChange0',
                                    F['players'] = this['players'],
                                    F.msg = G,
                                    this['push_msg'](JSON['stringify'](F));
                                var v = this['robot_count'],
                                    z = G['robot_count'];
                                if (z < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, v--);
                                    for (var h = 0; h < this['players']['length']; h++)
                                        2 == this['players'][h]['category'] && v > z && (this['players'][h]['category'] = 0, v--);
                                }
                                for (var P = [], C = G['player_list'], h = 0; h < this['players']['length']; h++)
                                    if (1 == this['players'][h]['category']) {
                                        for (var M = -1, U = 0; U < C['length']; U++)
                                            if (C[U]['account_id'] == this['players'][h]['account_id']) {
                                                M = U;
                                                break;
                                            }
                                        if (-1 != M) {
                                            var y = C[M];
                                            P.push(this['players'][h]),
                                                this['players'][h]['avatar_id'] = y['avatar_id'],
                                                this['players'][h]['title'] = y['title'],
                                                this['players'][h]['verified'] = y['verified'];
                                        }
                                    } else
                                        2 == this['players'][h]['category'] && P.push(this['players'][h]);
                                this['players'] = P;
                                for (var h = 0; h < C['length']; h++) {
                                    for (var S = !1, y = C[h], U = 0; U < this['players']['length']; U++)
                                        if (1 == this['players'][U]['category'] && this['players'][U]['account_id'] == y['account_id']) {
                                            S = !0;
                                            break;
                                        }
                                    S || this['players'].push({
                                        account_id: y['account_id'],
                                        avatar_id: y['avatar_id'],
                                        nickname: y['nickname'],
                                        verified: y['verified'],
                                        title: y['title'],
                                        level: y['level'],
                                        level3: y['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var N = [!1, !1, !1, !1], h = 0; h < this['players']['length']; h++)
                                    - 1 != this['players'][h]['cell_index'] && (N[this['players'][h]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][h]));
                                for (var h = 0; h < this['players']['length']; h++)
                                    if (1 == this['players'][h]['category'] && -1 == this['players'][h]['cell_index'])
                                        for (var U = 0; U < this['max_player_count']; U++)
                                            if (!N[U]) {
                                                this['players'][h]['cell_index'] = U,
                                                    N[U] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][h]);
                                                break;
                                            }
                                for (var v = this['robot_count'], z = G['robot_count']; z > v;) {
                                    for (var O = -1, U = 0; U < this['max_player_count']; U++)
                                        if (!N[U]) {
                                            O = U;
                                            break;
                                        }
                                    if (-1 == O)
                                        break;
                                    N[O] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: O,
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
                                        v++;
                                }
                                for (var h = 0; h < this['max_player_count']; h++)
                                    N[h] || this['_clearCell'](h);
                                var F = {};
                                if (F.type = 'onPlayerChange1', F['players'] = this['players'], this['push_msg'](JSON['stringify'](F)), G['owner_id']) {
                                    if (this['owner_id'] = G['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var U = 0; U < this['players']['length']; U++)
                                                if (this['players'][U] && this['players'][U]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][U]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var U = 0; U < this['players']['length']; U++)
                                            if (this['players'][U] && this['players'][U]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][U]);
                                                break;
                                            }
                            }
                        },
                        P['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), G['UI_Lobby'].Inst['enable'] = !0, G['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        P['prototype']['onCreate'] = function () {
                            var h = this;
                            this['last_start_room'] = 0;
                            var P = this.me['getChildByName']('root');
                            this['container_top'] = P['getChildByName']('top'),
                                this['container_right'] = P['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var C = function (F) {
                                var v = P['getChildByName']('player_' + F['toString']()),
                                    z = {};
                                z['index'] = F,
                                    z['container'] = v,
                                    z['container_flag'] = v['getChildByName']('flag'),
                                    z['container_flag']['visible'] = !1,
                                    z['container_name'] = v['getChildByName']('container_name'),
                                    z.name = v['getChildByName']('container_name')['getChildByName']('name'),
                                    z['btn_t'] = v['getChildByName']('btn_t'),
                                    z['container_illust'] = v['getChildByName']('container_illust'),
                                    z['illust'] = new G['UI_Character_Skin'](v['getChildByName']('container_illust')['getChildByName']('illust')),
                                    z.host = v['getChildByName']('host'),
                                    z['title'] = new G['UI_PlayerTitle'](v['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    z.rank = new G['UI_Level'](v['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    z['is_robot'] = !1;
                                var C = 0;
                                z['btn_t']['clickHandler'] = Laya['Handler']['create'](M, function () {
                                    if (!(h['locking'] || Laya['timer']['currTimer'] < C)) {
                                        C = Laya['timer']['currTimer'] + 500;
                                        for (var G = 0; G < h['players']['length']; G++)
                                            if (h['players'][G]['cell_index'] == F) {
                                                h['kickPlayer'](G);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    z['btn_info'] = v['getChildByName']('btn_info'),
                                    z['btn_info']['clickHandler'] = Laya['Handler']['create'](M, function () {
                                        if (!h['locking'])
                                            for (var v = 0; v < h['players']['length']; v++)
                                                if (h['players'][v]['cell_index'] == F) {
                                                    h['players'][v]['account_id'] && h['players'][v]['account_id'] > 0 && G['UI_OtherPlayerInfo'].Inst.show(h['players'][v]['account_id'], h['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                                    break;
                                                }
                                    }, null, !1),
                                    M['player_cells'].push(z);
                            }, M = this, U = 0; 4 > U; U++)
                                C(U);
                            this['btn_ok'] = P['getChildByName']('btn_ok');
                            var y = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < y + 500 || (y = Laya['timer']['currTimer'], h['owner_id'] == GameMgr.Inst['account_id'] ? h['getStart']() : h['switchReady']());
                            }, null, !1);
                            var S = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < S + 500 || (S = Laya['timer']['currTimer'], h['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    h['locking'] || h['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var N = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h['locking'] || Laya['timer']['currTimer'] < N || (N = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: h['robot_count'] + 1
                                }, function (F, v) {
                                    (F || v['error'] && 1111 != v['error'].code) && G['UIMgr'].Inst['showNetReqError']('modifyRoom_add', F, v),
                                        N = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!h['locking']) {
                                        var F = 0;
                                        h['room_mode']['detail_rule'] && h['room_mode']['detail_rule']['chuanma'] && (F = 1),
                                            G['UI_Rules'].Inst.show(0, null, F);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    h['locking'] || h['beReady'] && h['owner_id'] != GameMgr.Inst['account_id'] || (h['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: h['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    h['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    h['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    h['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), h['popout']['visible'] = !0, G['UIBase']['anim_pop_out'](h['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new z(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['room_link'].on('focus', this, function () {
                                    h['room_link']['focus'] && h['room_link']['setSelection'](0, h['room_link'].text['length']);
                                }),
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var F = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    F.call('setSysClipboardText', h['room_link'].text),
                                        G['UIBase']['anim_pop_hide'](h['popout'], Laya['Handler']['create'](h, function () {
                                            h['popout']['visible'] = !1;
                                        })),
                                        G['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', h['room_link'].text, function () { }),
                                        G['UIBase']['anim_pop_hide'](h['popout'], Laya['Handler']['create'](h, function () {
                                            h['popout']['visible'] = !1;
                                        })),
                                        G['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1;
                            var O = Laya['Handler']['create'](this, function () {
                                G['UIBase']['anim_pop_hide'](h['popout'], Laya['Handler']['create'](h, function () {
                                    h['popout']['visible'] = !1;
                                }));
                            }, null, !1);
                            this['popout']['getChildByName']('blackbg')['clickHandler'] = O,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = O,
                                this['invitefriend'] = new F(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new v(this.me['getChildByName']('pop_view'));
                        },
                        P['prototype'].show = function () {
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
                            for (var v = 0; 4 > v; v++)
                                this['player_cells'][v]['container']['visible'] = v < this['max_player_count'];
                            for (var v = 0; v < this['max_player_count']; v++)
                                this['_clearCell'](v);
                            for (var v = 0; v < this['players']['length']; v++)
                                this['players'][v]['cell_index'] = v, this['_refreshPlayerInfo'](this['players'][v]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var z = {};
                            z.type = 'show',
                                z['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](z)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var h = [];
                            h.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var P = this['room_mode']['detail_rule'];
                            if (P) {
                                var C = 5,
                                    M = 20;
                                if (null != P['time_fixed'] && (C = P['time_fixed']), null != P['time_add'] && (M = P['time_add']), h.push(C['toString']() + '+' + M['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var U = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    U && h.push(U.name);
                                }
                                if (null != P['init_point'] && h.push(game['Tools']['strOfLocalization'](2199) + P['init_point']), null != P['fandian'] && h.push(game['Tools']['strOfLocalization'](2094) + ':' + P['fandian']), P['guyi_mode'] && h.push(game['Tools']['strOfLocalization'](3028)), null != P['dora_count'])
                                    switch (P['chuanma'] && (P['dora_count'] = 0), P['dora_count']) {
                                        case 0:
                                            h.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            h.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            h.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            h.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != P['shiduan'] && 1 != P['shiduan'] && h.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === P['fanfu'] && h.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === P['fanfu'] && h.push(game['Tools']['strOfLocalization'](2764)),
                                    null != P['bianjietishi'] && 1 != P['bianjietishi'] && h.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != P['have_zimosun'] && 1 != P['have_zimosun'] ? h.push(game['Tools']['strOfLocalization'](2202)) : h.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(h),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                G['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var v = 0; v < this['player_cells']['length']; v++)
                                G['UIBase']['anim_alpha_in'](this['player_cells'][v]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * v, null, Laya.Ease['backOut']);
                            G['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                G['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    F['locking'] = !1;
                                });
                            var y = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != y && (this['room_link'].text += '(' + y + ')');
                            var S = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + S + '?room=' + this['room_id'];
                        },
                        P['prototype']['leaveRoom'] = function () {
                            var F = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (v, z) {
                                v || z['error'] ? G['UIMgr'].Inst['showNetReqError']('leaveRoom', v, z) : (F['room_id'] = -1, F.hide(Laya['Handler']['create'](F, function () {
                                    G['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        P['prototype']['tryToClose'] = function (F) {
                            var v = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (z, h) {
                                z || h['error'] ? (G['UIMgr'].Inst['showNetReqError']('leaveRoom', z, h), F['runWith'](!1)) : (v['enable'] = !1, v['pop_change_view']['close'](!0), F['runWith'](!0));
                            });
                        },
                        P['prototype'].hide = function (F) {
                            var v = this;
                            this['locking'] = !0,
                                G['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var z = 0; z < this['player_cells']['length']; z++)
                                G['UIBase']['anim_alpha_out'](this['player_cells'][z]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            G['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                G['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        F && F.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        P['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var G = 0; G < this['player_cells']['length']; G++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][G]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        P['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        P['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (F, v) {
                                (F || v['error']) && G['UIMgr'].Inst['showNetReqError']('startRoom', F, v);
                            })));
                        },
                        P['prototype']['kickPlayer'] = function (F) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var v = this['players'][F];
                                1 == v['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][F]['account_id']
                                }, function () { }) : 2 == v['category'] && (this['pre_choose'] = v, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (F, v) {
                                    (F || v['error']) && G['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', F, v);
                                }));
                            }
                        },
                        P['prototype']['_clearCell'] = function (G) {
                            if (!(0 > G || G >= this['player_cells']['length'])) {
                                var F = this['player_cells'][G];
                                F['container_flag']['visible'] = !1,
                                    F['container_illust']['visible'] = !1,
                                    F.name['visible'] = !1,
                                    F['container_name']['visible'] = !1,
                                    F['btn_t']['visible'] = !1,
                                    F.host['visible'] = !1,
                                    F['illust']['clear']();
                            }
                        },
                        P['prototype']['_refreshPlayerInfo'] = function (G) {
                            var F = G['cell_index'];
                            if (!(0 > F || F >= this['player_cells']['length'])) {
                                var v = this['player_cells'][F];
                                v['container_illust']['visible'] = !0,
                                    v['container_name']['visible'] = !0,
                                    v.name['visible'] = !0,
                                    game['Tools']['SetNickname'](v.name, G, GameMgr.Inst['hide_nickname']),
                                    v['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && G['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == G['account_id'] && (v['container_flag']['visible'] = !0, v.host['visible'] = !0),
                                    G['account_id'] == GameMgr.Inst['account_id'] ? v['illust']['setSkin'](G['avatar_id'], 'waitingroom') : v['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](G['avatar_id']), 'waitingroom'),
                                    v['title'].id = game['Tools']['titleLocalization'](G['account_id'], G['title']),
                                    v.rank.id = G[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](G);
                            }
                        },
                        P['prototype']['_onPlayerReadyChange'] = function (G) {
                            var F = G['cell_index'];
                            if (!(0 > F || F >= this['player_cells']['length'])) {
                                var v = this['player_cells'][F];
                                v['container_flag']['visible'] = this['owner_id'] == G['account_id'] ? !0 : G['ready'];
                            }
                        },
                        P['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var G = 0, F = 0; F < this['players']['length']; F++)
                                    0 != this['players'][F]['category'] && (this['_refreshPlayerInfo'](this['players'][F]), G++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], G == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], G == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        P['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var G = 0, F = 0; F < this['players']['length']; F++) {
                                    var v = this['players'][F];
                                    if (!v || 0 == v['category'])
                                        break;
                                    (v['account_id'] == this['owner_id'] || v['ready']) && G++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], G != this['max_player_count']), this['enable']) {
                                    for (var z = 0, F = 0; F < this['max_player_count']; F++) {
                                        var h = this['player_cells'][F];
                                        h && h['container_flag']['visible'] && z++;
                                    }
                                    if (G != z && !this['posted']) {
                                        this['posted'] = !0;
                                        var P = {};
                                        P['okcount'] = G,
                                            P['okcount2'] = z,
                                            P.msgs = [];
                                        var C = 0,
                                            M = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (C = (this['msg_tail'] + 1) % this['pre_msgs']['length'], M = this['msg_tail']), C >= 0 && M >= 0) {
                                            for (var F = C; F != M; F = (F + 1) % this['pre_msgs']['length'])
                                                P.msgs.push(this['pre_msgs'][F]);
                                            P.msgs.push(this['pre_msgs'][M]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', P, !1);
                                    }
                                }
                            }
                        },
                        P['prototype']['onGameStart'] = function (G) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](G['connect_token'], G['game_uuid'], G['location'], !1, null);
                        },
                        P['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        P['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        P.Inst = null,
                        P;
                }
                    (G['UIBase']);
            G['UI_WaitingRoom'] = h;
        }
            (uiscript || (uiscript = {}));















        // 保存装扮
        !function (G) {
            var F;
            !function (F) {
                var v = function () {
                    function v(v, z, h) {
                        var P = this;
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
                            this['_locking'] = h,
                            this['container_zhuangban0'] = v,
                            this['container_zhuangban1'] = z;
                        var C = this['container_zhuangban0']['getChildByName']('tabs');
                        C['vScrollBarSkin'] = '';
                        for (var M = function (F) {
                            var v = C['getChildAt'](F);
                            U.tabs.push(v),
                                v['clickHandler'] = new Laya['Handler'](U, function () {
                                    P['locking'] || P['tab_index'] != F && (P['_changed'] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](P, function () {
                                        P['change_tab'](F);
                                    }), null) : P['change_tab'](F));
                                });
                        }, U = this, y = 0; y < C['numChildren']; y++)
                            M(y);
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
                                for (var F = [], v = 0; v < P['cell_titles']['length']; v++) {
                                    var z = P['slot_ids'][v];
                                    if (P['slot_map'][z]) {
                                        var h = P['slot_map'][z];
                                        if (!(h['item_id'] && h['item_id'] != P['cell_default_item'][v] || h['item_id_list'] && 0 != h['item_id_list']['length']))
                                            continue;
                                        var C = [];
                                        if (h['item_id_list'])
                                            for (var M = 0, U = h['item_id_list']; M < U['length']; M++) {
                                                var y = U[M];
                                                y == P['cell_default_item'][v] ? C.push(0) : C.push(y);
                                            }
                                        F.push({
                                            slot: z,
                                            item_id: h['item_id'],
                                            type: h.type,
                                            item_id_list: C
                                        });
                                    }
                                }
                                P['btn_save']['mouseEnabled'] = !1;
                                var S = P['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: F,
                                //    save_index: S,
                                //    is_use: S == G['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (v, z) {
                                //    if (P['btn_save']['mouseEnabled'] = !0, v || z['error'])
                                //        G['UIMgr'].Inst['showNetReqError']('saveCommonViews', v, z);
                                //    else {
                                if (G['UI_Sushe']['commonViewList']['length'] < S)
                                    for (var h = G['UI_Sushe']['commonViewList']['length']; S >= h; h++)
                                        G['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = G.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = G.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (G['UI_Sushe']['commonViewList'][S] = F, G['UI_Sushe']['using_commonview_index'] == S && P['onChangeGameView'](), P['tab_index'] != S)
                                    return;
                                P['btn_save']['mouseEnabled'] = !0,
                                    P['_changed'] = !1,
                                    P['refresh_btn']();
                                //    }
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                P['btn_use']['mouseEnabled'] = !1;
                                var F = P['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: F
                                //}, function (v, z) {
                                //    P['btn_use']['mouseEnabled'] = !0,
                                //    v || z['error'] ? G['UIMgr'].Inst['showNetReqError']('useCommonView', v, z) : (
                                G['UI_Sushe']['using_commonview_index'] = F, P['refresh_btn'](), P['refresh_tab'](), P['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                P['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](v['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object['defineProperty'](v['prototype'], 'changed', {
                            get: function () {
                                return this['_changed'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        v['prototype'].show = function (F) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                F ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (G['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), G['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](G['UI_Sushe']['using_commonview_index']);
                        },
                        v['prototype']['change_tab'] = function (F) {
                            if (this['tab_index'] = F, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < G['UI_Sushe']['commonViewList']['length'])
                                    for (var v = G['UI_Sushe']['commonViewList'][this['tab_index']], z = 0; z < v['length']; z++)
                                        this['slot_map'][v[z].slot] = {
                                            slot: v[z].slot,
                                            item_id: v[z]['item_id'],
                                            type: v[z].type,
                                            item_id_list: v[z]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        v['prototype']['refresh_tab'] = function () {
                            for (var F = 0; F < this.tabs['length']; F++) {
                                var v = this.tabs[F];
                                v['mouseEnabled'] = this['tab_index'] != F,
                                    v['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == F ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    v['getChildByName']('num')['color'] = this['tab_index'] == F ? '#2f1e19' : '#f2c797';
                                var z = v['getChildByName']('choosed');
                                G['UI_Sushe']['using_commonview_index'] == F ? (z['visible'] = !0, z.x = this['tab_index'] == F ? -18 : -4) : z['visible'] = !1;
                            }
                        },
                        v['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = G['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = G['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        v['prototype']['onChangeSlotSelect'] = function (G) {
                            var F = this;
                            this['select_index'] = G,
                                this['random']['visible'] = !(6 == G || 10 == G);
                            var v = 0;
                            G >= 0 && G < this['cell_default_item']['length'] && (v = this['cell_default_item'][G]);
                            var z = v,
                                h = this['slot_ids'][G],
                                P = !1,
                                C = [];
                            if (this['slot_map'][h]) {
                                var M = this['slot_map'][h];
                                C = M['item_id_list'],
                                    P = !!M.type,
                                    M['item_id'] && (z = this['slot_map'][h]['item_id']),
                                    P && M['item_id_list'] && M['item_id_list']['length'] > 0 && (z = M['item_id_list'][0]);
                            }
                            var U = Laya['Handler']['create'](this, function (z) {
                                z == v && (z = 0);
                                var P = !1;
                                if (F['is_random']) {
                                    var C = F['slot_map'][h]['item_id_list']['indexOf'](z);
                                    C >= 0 ? (F['slot_map'][h]['item_id_list']['splice'](C, 1), P = !0) : (F['slot_map'][h]['item_id_list'] && 0 != F['slot_map'][h]['item_id_list']['length'] || (F['slot_map'][h]['item_id_list'] = []), F['slot_map'][h]['item_id_list'].push(z));
                                } else
                                    F['slot_map'][h] || (F['slot_map'][h] = {}), F['slot_map'][h]['item_id'] = z;
                                return F['scrollview']['wantToRefreshItem'](G),
                                    F['_changed'] = !0,
                                    F['refresh_btn'](),
                                    P;
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = P,
                                this['random_slider'].x = P ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var y = game['Tools']['strOfLocalization'](this['cell_titles'][G]);
                            if (G >= 0 && 2 >= G)
                                this['page_items'].show(y, G, z, U), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == G)
                                this['page_items'].show(y, 10, z, U), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == G)
                                this['page_items'].show(y, 3, z, U), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == G)
                                this['page_bgm'].show(y, z, U), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == G)
                                this['page_headframe'].show(y, z, U);
                            else if (7 == G || 8 == G) {
                                var S = this['cell_default_item'][7],
                                    N = this['cell_default_item'][8];
                                if (7 == G) {
                                    if (S = z, this['slot_map'][game['EView'].mjp]) {
                                        var O = this['slot_map'][game['EView'].mjp];
                                        O.type && O['item_id_list'] && O['item_id_list']['length'] > 0 ? N = O['item_id_list'][0] : O['item_id'] && (N = O['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](y, S, N, U);
                                } else {
                                    if (N = z, this['slot_map'][game['EView']['desktop']]) {
                                        var O = this['slot_map'][game['EView']['desktop']];
                                        O.type && O['item_id_list'] && O['item_id_list']['length'] > 0 ? S = O['item_id_list'][0] : O['item_id'] && (S = O['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](y, S, N, U);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == G) {
                                var S = this['cell_default_item'][7],
                                    N = this['cell_default_item'][9];
                                if (N = z, this['slot_map'][game['EView']['desktop']]) {
                                    var O = this['slot_map'][game['EView']['desktop']];
                                    O.type && O['item_id_list'] && O['item_id_list']['length'] > 0 ? S = O['item_id_list'][0] : O['item_id'] && (S = O['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](y, S, N, U),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == G && this['page_desktop']['show_lobby_bg'](y, z, U);
                        },
                        v['prototype']['onRandomBtnClick'] = function () {
                            var G = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        G['random']['getChildAt'](G['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var F = this['select_index'],
                                    v = this['slot_ids'][F],
                                    z = 0;
                                F >= 0 && F < this['cell_default_item']['length'] && (z = this['cell_default_item'][F]);
                                var h = z,
                                    P = [];
                                if (this['slot_map'][v]) {
                                    var C = this['slot_map'][v];
                                    P = C['item_id_list'],
                                        C['item_id'] && (h = this['slot_map'][v]['item_id']);
                                }
                                if (F >= 0 && 4 >= F) {
                                    var M = this['slot_map'][v];
                                    M ? (M.type = M.type ? 0 : 1, M['item_id_list'] && 0 != M['item_id_list']['length'] || (M['item_id_list'] = [M['item_id']])) : this['slot_map'][v] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](h);
                                } else if (5 == F) {
                                    var M = this['slot_map'][v];
                                    if (M)
                                        M.type = M.type ? 0 : 1, M['item_id_list'] && 0 != M['item_id_list']['length'] || (M['item_id_list'] = [M['item_id']]);
                                    else {
                                        this['slot_map'][v] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](h);
                                } else if (7 == F || 8 == F || 9 == F) {
                                    var M = this['slot_map'][v];
                                    M ? (M.type = M.type ? 0 : 1, M['item_id_list'] && 0 != M['item_id_list']['length'] || (M['item_id_list'] = [M['item_id']])) : this['slot_map'][v] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](h);
                                }
                                this['scrollview']['wantToRefreshItem'](F);
                            }
                        },
                        v['prototype']['render_view'] = function (G) {
                            var F = this,
                                v = G['container'],
                                z = G['index'],
                                h = v['getChildByName']('cell');
                            this['select_index'] == z ? (h['scaleX'] = h['scaleY'] = 1.05, h['getChildByName']('choosed')['visible'] = !0) : (h['scaleX'] = h['scaleY'] = 1, h['getChildByName']('choosed')['visible'] = !1),
                                h['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][z]);
                            var P = h['getChildByName']('name'),
                                C = h['getChildByName']('icon'),
                                M = this['cell_default_item'][z],
                                U = this['slot_ids'][z],
                                y = !1;
                            if (this['slot_map'][U] && (y = this['slot_map'][U].type, this['slot_map'][U]['item_id'] && (M = this['slot_map'][U]['item_id'])), y)
                                P.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][U]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](C, 'myres/sushe/icon_random.jpg');
                            else {
                                var S = cfg['item_definition'].item.get(M);
                                S ? (P.text = S['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](C, S.icon, null, 'UI_Sushe_Select.Zhuangban')) : (P.text = game['Tools']['strOfLocalization'](this['cell_names'][z]), game['LoadMgr']['setImgSkin'](C, this['cell_default_img'][z], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var N = h['getChildByName']('btn');
                            N['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['locking'] || F['select_index'] != z && (F['onChangeSlotSelect'](z), F['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                N['mouseEnabled'] = this['select_index'] != z;
                        },
                        v['prototype']['close'] = function (F) {
                            var v = this;
                            this['container_zhuangban0']['visible'] && (F ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (G['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), G['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                v['page_items']['close'](),
                                    v['page_desktop']['close'](),
                                    v['page_headframe']['close'](),
                                    v['page_bgm']['close'](),
                                    v['container_zhuangban0']['visible'] = !1,
                                    v['container_zhuangban1']['visible'] = !1,
                                    game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                            }))));
                        },
                        v['prototype']['onChangeGameView'] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = G.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            G['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var F = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            G['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](F, Laya['Handler']['create'](this, function () {
                                    G['UI_Lite_Loading'].Inst['enable'] && G['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        v['prototype']['setRandomGray'] = function (F) {
                            this['btn_random']['visible'] = !F,
                                this['random']['filters'] = F ? [new Laya['ColorFilter'](G['GRAY_FILTER'])] : [];
                        },
                        v['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        v['prototype']['changeSlotByItemId'] = function (G) {
                            var F = cfg['item_definition'].item.get(G);
                            if (F)
                                for (var v = 0; v < this['slot_ids']['length']; v++)
                                    if (this['slot_ids'][v] == F.type)
                                        return this['onChangeSlotSelect'](v), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        v;
                }
                    ();
                F['Container_Zhuangban'] = v;
            }
                (F = G['zhuangban'] || (G['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));















        // 设置称号
        !function (G) {
            var F = function (F) {
                function v() {
                    var G = F.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return G['_root'] = null,
                        G['_scrollview'] = null,
                        G['_blackmask'] = null,
                        G['_locking'] = !1,
                        G['_showindexs'] = [],
                        v.Inst = G,
                        G;
                }
                return __extends(v, F),
                    v.Init = function () {
                        var F = this;
                        // 获取称号
                        //GameMgr.Inst['use_fetch_info'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (v, z) {
                        //    if (v || z['error'])
                        //        G['UIMgr'].Inst['showNetReqError']('fetchTitleList', v, z);
                        //    else {
                        //        F['owned_title'] = [];
                        //        for (var h = 0; h < z['title_list']['length']; h++) {
                        //            var P = z['title_list'][h];
                        for (let title of cfg.item_definition.title.rows_) {
                            var P = title.id;
                            cfg['item_definition']['title'].get(P) && F['owned_title'].push(P),
                                '600005' == P && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                P >= '600005' && '600015' >= P && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + P - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    v['onFetchSuccess'] = function (G) {
                        if (this['owned_title'] = [], G['title_list'] && G['title_list']['title_list'])
                            // START
                            //for (var F = 0; F < G['title_list']['title_list']['length']; F++) {
                            //    var v = G['title_list']['title_list'][F];
                            // END
                            for (let title of cfg.item_definition.title.rows_) {
                                var v = title.id;
                                cfg['item_definition']['title'].get(v) && this['owned_title'].push(v),
                                    '600005' == v && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    v >= '600005' && '600015' >= v && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + v - '600005', 1);
                            }
                    },
                    v['title_update'] = function (F) {
                        for (var v = 0; v < F['new_titles']['length']; v++)
                            cfg['item_definition']['title'].get(F['new_titles'][v]) && this['owned_title'].push(F['new_titles'][v]), '600005' == F['new_titles'][v] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), F['new_titles'][v] >= '600005' && F['new_titles'][v] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + F['new_titles'][v] - '600005', 1);
                        if (F['remove_titles'] && F['remove_titles']['length'] > 0) {
                            for (var v = 0; v < F['remove_titles']['length']; v++) {
                                for (var z = F['remove_titles'][v], h = 0; h < this['owned_title']['length']; h++)
                                    if (this['owned_title'][h] == z) {
                                        this['owned_title'][h] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                z == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', G['UI_Lobby'].Inst['enable'] && G['UI_Lobby'].Inst.top['refresh'](), G['UI_PlayerInfo'].Inst['enable'] && G['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    v['prototype']['onCreate'] = function () {
                        var F = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new G['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return F['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (G) {
                                F['setItemValue'](G['index'], G['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                F['_locking'] || (F['_blackmask'].hide(), F['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    v['prototype'].show = function () {
                        var F = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), v['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var z = 0; z < v['owned_title']['length']; z++)
                                this['_showindexs'].push(z);
                            this['_showindexs'] = this['_showindexs'].sort(function (G, F) {
                                var z = G,
                                    h = cfg['item_definition']['title'].get(v['owned_title'][G]);
                                h && (z += 1000 * h['priority']);
                                var P = F,
                                    C = cfg['item_definition']['title'].get(v['owned_title'][F]);
                                return C && (P += 1000 * C['priority']),
                                    P - z;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](v['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        G['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            F['_locking'] = !1;
                        }));
                    },
                    v['prototype']['close'] = function () {
                        var F = this;
                        this['_locking'] = !0,
                            G['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                F['_locking'] = !1,
                                    F['enable'] = !1;
                            }));
                    },
                    v['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    v['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    v['prototype']['setItemValue'] = function (G, F) {
                        var z = this;
                        if (this['enable']) {
                            var h = v['owned_title'][this['_showindexs'][G]],
                                P = cfg['item_definition']['title'].find(h);
                            game['LoadMgr']['setImgSkin'](F['getChildByName']('img_title'), P.icon, null, 'UI_TitleBook'),
                                F['getChildByName']('using')['visible'] = h == GameMgr.Inst['account_data']['title'],
                                F['getChildByName']('desc').text = P['desc_' + GameMgr['client_language']];
                            var C = F['getChildByName']('btn');
                            C['clickHandler'] = Laya['Handler']['create'](this, function () {
                                h != GameMgr.Inst['account_data']['title'] ? (z['changeTitle'](G), F['getChildByName']('using')['visible'] = !0) : (z['changeTitle'](-1), F['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var M = F['getChildByName']('time'),
                                U = F['getChildByName']('img_title');
                            if (1 == P['unlock_type']) {
                                var y = P['unlock_param'][0],
                                    S = cfg['item_definition'].item.get(y);
                                M.text = game['Tools']['strOfLocalization'](3121) + S['expire_desc_' + GameMgr['client_language']],
                                    M['visible'] = !0,
                                    U.y = 34;
                            } else
                                M['visible'] = !1, U.y = 44;
                        }
                    },
                    v['prototype']['changeTitle'] = function (F) {
                        var z = this,
                            h = GameMgr.Inst['account_data']['title'],
                            P = 0;
                        P = F >= 0 && F < this['_showindexs']['length'] ? v['owned_title'][this['_showindexs'][F]] : '600001',
                            GameMgr.Inst['account_data']['title'] = P;
                        for (var C = -1, M = 0; M < this['_showindexs']['length']; M++)
                            if (h == v['owned_title'][this['_showindexs'][M]]) {
                                C = M;
                                break;
                            }
                        G['UI_Lobby'].Inst['enable'] && G['UI_Lobby'].Inst.top['refresh'](),
                            G['UI_PlayerInfo'].Inst['enable'] && G['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            -1 != C && this['_scrollview']['wantToRefreshItem'](C),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = P;
                        MMP.saveSettings();
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                            title: '600001' == P ? 0 : P
                        }, function (v, P) {
                            (v || P['error']) && (G['UIMgr'].Inst['showNetReqError']('useTitle', v, P), GameMgr.Inst['account_data']['title'] = h, G['UI_Lobby'].Inst['enable'] && G['UI_Lobby'].Inst.top['refresh'](), G['UI_PlayerInfo'].Inst['enable'] && G['UI_PlayerInfo'].Inst['refreshBaseInfo'](), z['enable'] && (F >= 0 && F < z['_showindexs']['length'] && z['_scrollview']['wantToRefreshItem'](F), C >= 0 && C < z['_showindexs']['length'] && z['_scrollview']['wantToRefreshItem'](C)));
                        });
                    },
                    v.Inst = null,
                    v['owned_title'] = [],
                    v;
            }
                (G['UIBase']);
            G['UI_TitleBook'] = F;
        }
            (uiscript || (uiscript = {}));













        // 友人房调整装扮
        !function (G) {
            var F;
            !function (F) {
                var v = function () {
                    function v(G) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = G,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new F['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return v['prototype'].show = function (F) {
                        var v = this;
                        this.me['visible'] = !0,
                            F ? this.me['alpha'] = 1 : G['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var z = 0, h = G['UI_Sushe']['star_chars']; z < h['length']; z++)
                            for (var P = h[z], C = 0; C < G['UI_Sushe']['characters']['length']; C++)
                                if (!G['UI_Sushe']['hidden_characters_map'][P] && G['UI_Sushe']['characters'][C]['charid'] == P) {
                                    this['chara_infos'].push({
                                        chara_id: G['UI_Sushe']['characters'][C]['charid'],
                                        skin_id: G['UI_Sushe']['characters'][C].skin,
                                        is_upgraded: G['UI_Sushe']['characters'][C]['is_upgraded']
                                    }),
                                        G['UI_Sushe']['main_character_id'] == G['UI_Sushe']['characters'][C]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var C = 0; C < G['UI_Sushe']['characters']['length']; C++)
                            G['UI_Sushe']['hidden_characters_map'][G['UI_Sushe']['characters'][C]['charid']] || -1 == G['UI_Sushe']['star_chars']['indexOf'](G['UI_Sushe']['characters'][C]['charid']) && (this['chara_infos'].push({
                                chara_id: G['UI_Sushe']['characters'][C]['charid'],
                                skin_id: G['UI_Sushe']['characters'][C].skin,
                                is_upgraded: G['UI_Sushe']['characters'][C]['is_upgraded']
                            }), G['UI_Sushe']['main_character_id'] == G['UI_Sushe']['characters'][C]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var M = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(M['chara_id'], M['skin_id'], Laya['Handler']['create'](this, function (G) {
                            v['choosed_skin_id'] = G,
                                M['skin_id'] = G,
                                v['scrollview']['wantToRefreshItem'](v['choosed_chara_index']);
                        }, null, !1));
                    },
                        v['prototype']['render_character_cell'] = function (F) {
                            var v = this,
                                z = F['index'],
                                h = F['container'],
                                P = F['cache_data'];
                            P['index'] = z;
                            var C = this['chara_infos'][z];
                            P['inited'] || (P['inited'] = !0, P.skin = new G['UI_Character_Skin'](h['getChildByName']('btn')['getChildByName']('head')), P['bound'] = h['getChildByName']('btn')['getChildByName']('bound'));
                            var M = h['getChildByName']('btn');
                            M['getChildByName']('choose')['visible'] = z == this['choosed_chara_index'],
                                P.skin['setSkin'](C['skin_id'], 'bighead'),
                                M['getChildByName']('using')['visible'] = z == this['choosed_chara_index'];
                            var U = cfg['item_definition']['character'].find(C['chara_id']),
                                y = U['name_' + GameMgr['client_language'] + '2'] ? U['name_' + GameMgr['client_language'] + '2'] : U['name_' + GameMgr['client_language']],
                                S = M['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                S.text = y['replace']('-', '|')['replace'](/\./g, '·');
                                var N = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                S['leading'] = N.test(y) ? -15 : 0;
                            } else
                                S.text = y;
                            M['getChildByName']('star') && (M['getChildByName']('star')['visible'] = z < this['star_char_count']);
                            var O = cfg['item_definition']['character'].get(C['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? P['bound'].skin = O.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (C['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (C['is_upgraded'] ? '2.png' : '.png')) : O.ur ? (P['bound'].pos(-10, -2), P['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (C['is_upgraded'] ? '6.png' : '5.png'))) : (P['bound'].pos(4, 20), P['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (C['is_upgraded'] ? '4.png' : '3.png'))),
                                M['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (C['is_upgraded'] ? '2.png' : '.png')),
                                h['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (z != v['choosed_chara_index']) {
                                        var G = v['choosed_chara_index'];
                                        v['choosed_chara_index'] = z,
                                            v['choosed_skin_id'] = C['skin_id'],
                                            v['page_skin'].show(C['chara_id'], C['skin_id'], Laya['Handler']['create'](v, function (G) {
                                                v['choosed_skin_id'] = G,
                                                    C['skin_id'] = G,
                                                    P.skin['setSkin'](G, 'bighead');
                                            }, null, !1)),
                                            v['scrollview']['wantToRefreshItem'](G),
                                            v['scrollview']['wantToRefreshItem'](z);
                                    }
                                });
                        },
                        v['prototype']['close'] = function (F) {
                            var v = this;
                            if (this.me['visible'])
                                if (F)
                                    this.me['visible'] = !1;
                                else {
                                    var z = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //z['chara_id'] != G['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: z['chara_id']
                                    //    }, function () {}), 
                                    G['UI_Sushe']['main_character_id'] = z['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: z['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var h = 0; h < G['UI_Sushe']['characters']['length']; h++)
                                        if (G['UI_Sushe']['characters'][h]['charid'] == z['chara_id']) {
                                            G['UI_Sushe']['characters'][h].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        G['UI_Sushe']['onMainSkinChange'](),
                                        G['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            v.me['visible'] = !1;
                                        }));
                                }
                        },
                        v;
                }
                    ();
                F['Page_Waiting_Head'] = v;
            }
                (F = G['zhuangban'] || (G['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));















        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var G = GameMgr;
            var F = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (v, z) {
                if (v || z['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', v, z);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](z)),
                        G.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    z.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    z.account.title = GameMgr.Inst.account_data.title;
                    z.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        z.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var h in z['account']) {
                        if (G.Inst['account_data'][h] = z['account'][h], 'platform_diamond' == h)
                            for (var P = z['account'][h], C = 0; C < P['length']; C++)
                                F['account_numerical_resource'][P[C].id] = P[C]['count'];
                        if ('skin_ticket' == h && (G.Inst['account_numerical_resource']['100004'] = z['account'][h]), 'platform_skin_ticket' == h)
                            for (var P = z['account'][h], C = 0; C < P['length']; C++)
                                F['account_numerical_resource'][P[C].id] = P[C]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        z['account']['room_id'] && G.Inst['updateRoom'](),
                        '10102' === G.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === G.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }











        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (F, v, z) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': F,
                        'account_id': parseInt(v.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': F,
                            'account_id': parseInt(v.toString())
                        }));
                    }
                }));
            }
            var G = GameMgr;
            var h = this;
            return F = F.trim(),
                app.Log.log('checkPaiPu game_uuid:' + F + ' account_id:' + v['toString']() + ' paipu_config:' + z),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), G.Inst['onLoadStart']('paipu'), 2 & z && (F = game['Tools']['DecodePaipuUUID'](F)), this['record_uuid'] = F, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: F,
                    client_version_string: this['getClientVersion']()
                }, function (P, C) {
                    if (P || C['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', P, C);
                        var M = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](M);
                        var U = function () {
                            return M += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, M)),
                                M >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, U), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, h, U),
                            h['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': C.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': C.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var y = C.head,
                            S = [null, null, null, null],
                            N = game['Tools']['strOfLocalization'](2003),
                            O = y['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: F,
                            client_version_string: h['getClientVersion']()
                        }, function () { }),
                            O['extendinfo'] && (N = game['Tools']['strOfLocalization'](2004)),
                            O['detail_rule'] && O['detail_rule']['ai_level'] && (1 === O['detail_rule']['ai_level'] && (N = game['Tools']['strOfLocalization'](2003)), 2 === O['detail_rule']['ai_level'] && (N = game['Tools']['strOfLocalization'](2004)));
                        var W = !1;
                        y['end_time'] ? (h['record_end_time'] = y['end_time'], y['end_time'] > '1576112400' && (W = !0)) : h['record_end_time'] = -1,
                            h['record_start_time'] = y['start_time'] ? y['start_time'] : -1;
                        for (var m = 0; m < y['accounts']['length']; m++) {
                            var g = y['accounts'][m];
                            if (g['character']) {
                                var A = g['character'],
                                    Q = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (g.account_id == GameMgr.Inst.account_id) {
                                        g.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        g.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        g.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        g.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        g.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            g.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (g.avatar_id == 400101 || g.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            g.avatar_id = skin.id;
                                            g.character.charid = skin.character_id;
                                            g.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(g.account_id);
                                        if (server == 1) {
                                            g.nickname = '[CN]' + g.nickname;
                                        } else if (server == 2) {
                                            g.nickname = '[JP]' + g.nickname;
                                        } else if (server == 3) {
                                            g.nickname = '[EN]' + g.nickname;
                                        } else {
                                            g.nickname = '[??]' + g.nickname;
                                        }
                                    }
                                }
                                // END
                                if (W) {
                                    var k = g['views'];
                                    if (k)
                                        for (var _ = 0; _ < k['length']; _++)
                                            Q[k[_].slot] = k[_]['item_id'];
                                } else {
                                    var s = A['views'];
                                    if (s)
                                        for (var _ = 0; _ < s['length']; _++) {
                                            var T = s[_].slot,
                                                K = s[_]['item_id'],
                                                a = T - 1;
                                            Q[a] = K;
                                        }
                                }
                                var p = [];
                                for (var R in Q)
                                    p.push({
                                        slot: parseInt(R),
                                        item_id: Q[R]
                                    });
                                g['views'] = p,
                                    S[g.seat] = g;
                            } else
                                g['character'] = {
                                    charid: g['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(g['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    g['avatar_id'] = g['character'].skin,
                                    g['views'] = [],
                                    S[g.seat] = g;
                        }
                        for (var d = game['GameUtility']['get_default_ai_skin'](), I = game['GameUtility']['get_default_ai_character'](), m = 0; m < S['length']; m++)
                            if (null == S[m]) {
                                S[m] = {
                                    nickname: N,
                                    avatar_id: d,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: I,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: d,
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
                                            S[m].avatar_id = skin.id;
                                            S[m].character.charid = skin.character_id;
                                            S[m].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        S[m].nickname = '[BOT]' + S[m].nickname;
                                    }
                                }
                                // END
                            }
                        var q = Laya['Handler']['create'](h, function (G) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](y['config'], S, Laya['Handler']['create'](h, function () {
                                    h['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = z,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](y['config'])), S, v, view['EMJMode']['paipu'], Laya['Handler']['create'](h, function () {
                                            uiscript['UI_Replay'].Inst['initData'](G),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, h, function () {
                                                    h['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, h, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, h, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](h, function (G) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * G);
                                }, null, !1));
                        }),
                            J = {};
                        if (J['record'] = y, C.data && C.data['length'])
                            J.game = net['MessageWrapper']['decodeMessage'](C.data), q['runWith'](J);
                        else {
                            var l = C['data_url'];
                            l['startsWith']('http') || (l = G['prefix_url'] + l),
                                game['LoadMgr']['httpload'](l, 'arraybuffer', !1, Laya['Handler']['create'](h, function (G) {
                                    if (G['success']) {
                                        var F = new Laya.Byte();
                                        F['writeArrayBuffer'](G.data);
                                        var v = net['MessageWrapper']['decodeMessage'](F['getUint8Array'](0, F['length']));
                                        J.game = v,
                                            q['runWith'](J);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + C['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), h['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }












        // 牌谱功能
        !function (G) {
            var F = function () {
                function F(G) {
                    var F = this;
                    this.me = G,
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
                    var v = this['container_hidename']['getChildByName']('w0'),
                        z = this['container_hidename']['getChildByName']('w1');
                    z.x = v.x + v['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            F['sp_checkbox']['visible'] = !F['sp_checkbox']['visible'],
                                F['refresh_share_uuid']();
                        }),
                        this['input'].on('focus', this, function () {
                            F['input']['focus'] && F['input']['setSelection'](0, F['input'].text['length']);
                        });
                }
                return F['prototype']['show_share'] = function (F) {
                    var v = this;
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
                        G['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            v['locking'] = !1;
                        }));
                },
                    F['prototype']['refresh_share_uuid'] = function () {
                        var G = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            F = this.uuid,
                            v = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + v + '?paipu=' + game['Tools']['EncodePaipuUUID'](F) + '_a' + G + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + v + '?paipu=' + F + '_a' + G;
                    },
                    F['prototype']['show_check'] = function () {
                        var F = this;
                        return G['UI_PiPeiYuYue'].Inst['enable'] ? (G['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return F['input'].text ? (F.hide(Laya['Handler']['create'](F, function () {
                                var G = F['input'].text['split']('='),
                                    v = G[G['length'] - 1]['split']('_'),
                                    z = 0;
                                v['length'] > 1 && (z = 'a' == v[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(v[1]['substr'](1))) : parseInt(v[1]));
                                var h = 0;
                                if (v['length'] > 2) {
                                    var P = parseInt(v[2]);
                                    P && (h = P);
                                }
                                GameMgr.Inst['checkPaiPu'](v[0], z, h);
                            })), void 0) : (G['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, G['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            F['locking'] = !1;
                        })), void 0);
                    },
                    F['prototype'].hide = function (F) {
                        var v = this;
                        this['locking'] = !0,
                            G['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                v['locking'] = !1,
                                    v.me['visible'] = !1,
                                    F && F.run();
                            }));
                    },
                    F;
            }
                (),
                v = function () {
                    function F(G) {
                        var F = this;
                        this.me = G,
                            this['blackbg'] = G['getChildByName']('blackbg'),
                            this.root = G['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                F['locking'] || F['close']();
                            }),
                            this['blackbg']['getChildAt'](0)['clickHandler'] = new Laya['Handler'](this, function () {
                                F['locking'] || F['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                F['locking'] || (game['Tools']['calu_word_length'](F['input'].text) > 30 ? F['toolong']['visible'] = !0 : (F['close'](), P['addCollect'](F.uuid, F['start_time'], F['end_time'], F['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return F['prototype'].show = function (F, v, z) {
                        var h = this;
                        this.uuid = F,
                            this['start_time'] = v,
                            this['end_time'] = z,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            G['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                h['locking'] = !1;
                            }));
                    },
                        F['prototype']['close'] = function () {
                            var F = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                G['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    F['locking'] = !1,
                                        F.me['visible'] = !1;
                                }));
                        },
                        F;
                }
                    ();
            G['UI_Pop_CollectInput'] = v;
            var z;
            !function (G) {
                G[G.ALL = 0] = 'ALL',
                    G[G['FRIEND'] = 1] = 'FRIEND',
                    G[G.RANK = 2] = 'RANK',
                    G[G['MATCH'] = 4] = 'MATCH',
                    G[G['COLLECT'] = 100] = 'COLLECT';
            }
                (z || (z = {}));
            var h = function () {
                function F(G) {
                    this['uuid_list'] = [],
                        this.type = G,
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
                        var v = this;
                        if (void 0 === F && (F = 10), !this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == z['COLLECT']) {
                                for (var h = [], C = 0, M = 0; 10 > M; M++) {
                                    var U = this['count'] + M;
                                    if (U >= P['collect_lsts']['length'])
                                        break;
                                    C++;
                                    var y = P['collect_lsts'][U];
                                    P['record_map'][y] || h.push(y),
                                        this['uuid_list'].push(y);
                                }
                                h['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: h
                                }, function (F, z) {
                                    if (v['duringload'] = !1, P.Inst['onLoadStateChange'](v.type, !1), F || z['error'])
                                        G['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', F, z);
                                    else if (app.Log.log(JSON['stringify'](z)), z['record_list'] && z['record_list']['length'] == h['length']) {
                                        for (var M = 0; M < z['record_list']['length']; M++) {
                                            var U = z['record_list'][M].uuid;
                                            P['record_map'][U] || (P['record_map'][U] = z['record_list'][M]);
                                        }
                                        v['count'] += C,
                                            v['count'] >= P['collect_lsts']['length'] && (v['have_more_paipu'] = !1, P.Inst['onLoadOver'](v.type)),
                                            P.Inst['onLoadMoreLst'](v.type, C);
                                    } else
                                        v['have_more_paipu'] = !1, P.Inst['onLoadOver'](v.type);
                                }) : (this['duringload'] = !1, this['count'] += C, this['count'] >= P['collect_lsts']['length'] && (this['have_more_paipu'] = !1, P.Inst['onLoadOver'](this.type)), P.Inst['onLoadMoreLst'](this.type, C));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (F, h) {
                                    if (v['duringload'] = !1, P.Inst['onLoadStateChange'](v.type, !1), F || h['error'])
                                        G['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', F, h);
                                    else if (app.Log.log(JSON['stringify'](h)), h['record_list'] && h['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(h),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(h));
                                                }
                                            }));
                                            for (let record_list of h['record_list']) {
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
                                        for (var C = h['record_list'], M = 0, U = 0; U < C['length']; U++) {
                                            var y = C[U].uuid;
                                            if (v.type == z.RANK && C[U]['config'] && C[U]['config'].meta) {
                                                var S = C[U]['config'].meta;
                                                if (S) {
                                                    var N = cfg['desktop']['matchmode'].get(S['mode_id']);
                                                    if (N && 5 == N.room)
                                                        continue;
                                                }
                                            }
                                            M++,
                                                v['uuid_list'].push(y),
                                                P['record_map'][y] || (P['record_map'][y] = C[U]);
                                        }
                                        v['count'] += M,
                                            v['true_count'] += C['length'],
                                            P.Inst['onLoadMoreLst'](v.type, M),
                                            v['have_more_paipu'] = !0;
                                    } else
                                        v['have_more_paipu'] = !1, P.Inst['onLoadOver'](v.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                v['duringload'] && P.Inst['onLoadStateChange'](v.type, !0);
                            });
                        }
                    },
                    F['prototype']['removeAt'] = function (G) {
                        for (var F = 0; F < this['uuid_list']['length'] - 1; F++)
                            F >= G && (this['uuid_list'][F] = this['uuid_list'][F + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    F;
            }
                (),
                P = function (P) {
                    function C() {
                        var G = P.call(this, new ui['lobby']['paipuUI']()) || this;
                        return G.top = null,
                            G['container_scrollview'] = null,
                            G['scrollview'] = null,
                            G['loading'] = null,
                            G.tabs = [],
                            G['pop_otherpaipu'] = null,
                            G['pop_collectinput'] = null,
                            G['label_collect_count'] = null,
                            G['noinfo'] = null,
                            G['locking'] = !1,
                            G['current_type'] = z.ALL,
                            C.Inst = G,
                            G;
                    }
                    return __extends(C, P),
                        C.init = function () {
                            var G = this;
                            this['paipuLst'][z.ALL] = new h(z.ALL),
                                this['paipuLst'][z['FRIEND']] = new h(z['FRIEND']),
                                this['paipuLst'][z.RANK] = new h(z.RANK),
                                this['paipuLst'][z['MATCH']] = new h(z['MATCH']),
                                this['paipuLst'][z['COLLECT']] = new h(z['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (F, v) {
                                    if (F || v['error']);
                                    else {
                                        if (v['record_list']) {
                                            for (var z = v['record_list'], h = 0; h < z['length']; h++) {
                                                var P = {
                                                    uuid: z[h].uuid,
                                                    time: z[h]['end_time'],
                                                    remarks: z[h]['remarks']
                                                };
                                                G['collect_lsts'].push(P.uuid),
                                                    G['collect_info'][P.uuid] = P;
                                            }
                                            G['collect_lsts'] = G['collect_lsts'].sort(function (F, v) {
                                                return G['collect_info'][v].time - G['collect_info'][F].time;
                                            });
                                        }
                                        v['record_collect_limit'] && (G['collect_limit'] = v['record_collect_limit']);
                                    }
                                });
                        },
                        C['onFetchSuccess'] = function (G) {
                            var F = this;
                            this['paipuLst'][z.ALL] = new h(z.ALL),
                                this['paipuLst'][z['FRIEND']] = new h(z['FRIEND']),
                                this['paipuLst'][z.RANK] = new h(z.RANK),
                                this['paipuLst'][z['MATCH']] = new h(z['MATCH']),
                                this['paipuLst'][z['COLLECT']] = new h(z['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {};
                            var v = G['collected_game_record_list'];
                            if (v['record_list']) {
                                for (var P = v['record_list'], C = 0; C < P['length']; C++) {
                                    var M = {
                                        uuid: P[C].uuid,
                                        time: P[C]['end_time'],
                                        remarks: P[C]['remarks']
                                    };
                                    this['collect_lsts'].push(M.uuid),
                                        this['collect_info'][M.uuid] = M;
                                }
                                this['collect_lsts'] = this['collect_lsts'].sort(function (G, v) {
                                    return F['collect_info'][v].time - F['collect_info'][G].time;
                                });
                            }
                            v['record_collect_limit'] && (this['collect_limit'] = v['record_collect_limit']);
                        },
                        C['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        C['reset'] = function () {
                            this['paipuLst'][z.ALL] && this['paipuLst'][z.ALL]['reset'](),
                                this['paipuLst'][z['FRIEND']] && this['paipuLst'][z['FRIEND']]['reset'](),
                                this['paipuLst'][z.RANK] && this['paipuLst'][z.RANK]['reset'](),
                                this['paipuLst'][z['MATCH']] && this['paipuLst'][z['MATCH']]['reset']();
                        },
                        C['addCollect'] = function (F, v, z, h) {
                            var P = this;
                            if (!this['collect_info'][F]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return G['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: F,
                                    remarks: h,
                                    start_time: v,
                                    end_time: z
                                }, function () { });
                                var M = {
                                    uuid: F,
                                    remarks: h,
                                    time: z
                                };
                                this['collect_info'][F] = M,
                                    this['collect_lsts'].push(F),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (G, F) {
                                        return P['collect_info'][F].time - P['collect_info'][G].time;
                                    }),
                                    G['UI_DesktopInfo'].Inst && G['UI_DesktopInfo'].Inst['enable'] && G['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    C.Inst && C.Inst['enable'] && C.Inst['onCollectChange'](F, -1);
                            }
                        },
                        C['removeCollect'] = function (F) {
                            var v = this;
                            if (this['collect_info'][F]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: F
                                }, function () { }),
                                    delete this['collect_info'][F];
                                for (var z = -1, h = 0; h < this['collect_lsts']['length']; h++)
                                    if (this['collect_lsts'][h] == F) {
                                        this['collect_lsts'][h] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            z = h;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (G, F) {
                                        return v['collect_info'][F].time - v['collect_info'][G].time;
                                    }),
                                    G['UI_DesktopInfo'].Inst && G['UI_DesktopInfo'].Inst['enable'] && G['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    C.Inst && C.Inst['enable'] && C.Inst['onCollectChange'](F, z);
                            }
                        },
                        C['prototype']['onCreate'] = function () {
                            var z = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || z['close'](Laya['Handler']['create'](z, function () {
                                        G['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (G) {
                                    z['setItemValue'](G['index'], G['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var G = C['paipuLst'][z['current_type']];
                                    (1 - z['scrollview'].rate) * G['count'] < 3 && (G['duringload'] || (G['have_more_paipu'] ? G['loadList']() : 0 == G['count'] && (z['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['pop_otherpaipu'].me['visible'] || z['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var h = 0; 5 > h; h++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](h)), this.tabs[h]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [h, !1]);
                            this['pop_otherpaipu'] = new F(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new v(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        C['prototype'].show = function () {
                            var F = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                G['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                G['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    F['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = C['collect_lsts']['length']['toString']() + '/' + C['collect_limit']['toString']();
                        },
                        C['prototype']['close'] = function (F) {
                            var v = this;
                            this['locking'] = !0,
                                G['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                G['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        F && F.run();
                                });
                        },
                        C['prototype']['changeTab'] = function (G, F) {
                            var v = [z.ALL, z.RANK, z['FRIEND'], z['MATCH'], z['COLLECT']];
                            if (F || v[G] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = v[G], this['current_type'] == z['COLLECT'] && C['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != z['COLLECT']) {
                                    var h = C['paipuLst'][this['current_type']]['count'];
                                    h > 0 && this['scrollview']['addItem'](h);
                                }
                                for (var P = 0; P < this.tabs['length']; P++) {
                                    var M = this.tabs[P];
                                    M['getChildByName']('img').skin = game['Tools']['localUISrc'](G == P ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        M['getChildByName']('label_name')['color'] = G == P ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        C['prototype']['setItemValue'] = function (F, v) {
                            var z = this;
                            if (this['enable']) {
                                var h = C['paipuLst'][this['current_type']];
                                if (h || !(F >= h['uuid_list']['length'])) {
                                    for (var P = C['record_map'][h['uuid_list'][F]], M = 0; 4 > M; M++) {
                                        var U = v['getChildByName']('p' + M['toString']());
                                        if (M < P['result']['players']['length']) {
                                            U['visible'] = !0;
                                            var y = U['getChildByName']('chosen'),
                                                S = U['getChildByName']('rank'),
                                                N = U['getChildByName']('rank_word'),
                                                O = U['getChildByName']('name'),
                                                W = U['getChildByName']('score'),
                                                m = P['result']['players'][M];
                                            W.text = m['part_point_1'] || '0';
                                            for (var g = 0, A = game['Tools']['strOfLocalization'](2133), Q = 0, k = !1, _ = 0; _ < P['accounts']['length']; _++)
                                                if (P['accounts'][_].seat == m.seat) {
                                                    g = P['accounts'][_]['account_id'],
                                                        A = P['accounts'][_]['nickname'],
                                                        Q = P['accounts'][_]['verified'],
                                                        k = P['accounts'][_]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](O, {
                                                account_id: g,
                                                nickname: A,
                                                verified: Q
                                            }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                                y['visible'] = k,
                                                W['color'] = k ? '#ffc458' : '#b98930',
                                                O['getChildByName']('name')['color'] = k ? '#dfdfdf' : '#a0a0a0',
                                                N['color'] = S['color'] = k ? '#57bbdf' : '#489dbc';
                                            var s = U['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (M) {
                                                    case 0:
                                                        s.text = 'st';
                                                        break;
                                                    case 1:
                                                        s.text = 'nd';
                                                        break;
                                                    case 2:
                                                        s.text = 'rd';
                                                        break;
                                                    case 3:
                                                        s.text = 'th';
                                                }
                                        } else
                                            U['visible'] = !1;
                                    }
                                    var T = new Date(1000 * P['end_time']),
                                        K = '';
                                    K += T['getFullYear']() + '/',
                                        K += (T['getMonth']() < 9 ? '0' : '') + (T['getMonth']() + 1)['toString']() + '/',
                                        K += (T['getDate']() < 10 ? '0' : '') + T['getDate']() + ' ',
                                        K += (T['getHours']() < 10 ? '0' : '') + T['getHours']() + ':',
                                        K += (T['getMinutes']() < 10 ? '0' : '') + T['getMinutes'](),
                                        v['getChildByName']('date').text = K,
                                        v['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return z['locking'] ? void 0 : G['UI_PiPeiYuYue'].Inst['enable'] ? (G['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](P.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        v['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            z['locking'] || z['pop_otherpaipu'].me['visible'] || (z['pop_otherpaipu']['show_share'](P.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var a = v['getChildByName']('room'),
                                        p = game['Tools']['get_room_desc'](P['config']);
                                    a.text = p.text;
                                    var R = '';
                                    if (1 == P['config']['category'])
                                        R = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == P['config']['category'])
                                        R = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == P['config']['category']) {
                                        var d = P['config'].meta;
                                        if (d) {
                                            var I = cfg['desktop']['matchmode'].get(d['mode_id']);
                                            I && (R = I['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (C['collect_info'][P.uuid]) {
                                        var q = C['collect_info'][P.uuid],
                                            J = v['getChildByName']('remarks_info'),
                                            l = v['getChildByName']('input'),
                                            E = l['getChildByName']('txtinput'),
                                            c = v['getChildByName']('btn_input'),
                                            f = !1,
                                            Z = function () {
                                                f ? (J['visible'] = !1, l['visible'] = !0, E.text = J.text, c['visible'] = !1) : (J.text = q['remarks'] && '' != q['remarks'] ? game['Tools']['strWithoutForbidden'](q['remarks']) : R, J['visible'] = !0, l['visible'] = !1, c['visible'] = !0);
                                            };
                                        Z(),
                                            c['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                f = !0,
                                                    Z();
                                            }, null, !1),
                                            E.on('blur', this, function () {
                                                f && (game['Tools']['calu_word_length'](E.text) > 30 ? G['UI_Info_Small'].Inst.show(game['Tools']['strOfLocalization'](2765)) : E.text != q['remarks'] && (q['remarks'] = E.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: P.uuid,
                                                    remarks: E.text
                                                }, function () { }))),
                                                    f = !1,
                                                    Z();
                                            });
                                        var i = v['getChildByName']('collect');
                                        i['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](z, function () {
                                                C['removeCollect'](P.uuid);
                                            }));
                                        }, null, !1),
                                            i['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        v['getChildByName']('input')['visible'] = !1,
                                            v['getChildByName']('btn_input')['visible'] = !1,
                                            v['getChildByName']('remarks_info')['visible'] = !0,
                                            v['getChildByName']('remarks_info').text = R;
                                        var i = v['getChildByName']('collect');
                                        i['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            z['pop_collectinput'].show(P.uuid, P['start_time'], P['end_time']);
                                        }, null, !1),
                                            i['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        C['prototype']['onLoadStateChange'] = function (G, F) {
                            this['current_type'] == G && (this['loading']['visible'] = F);
                        },
                        C['prototype']['onLoadMoreLst'] = function (G, F) {
                            this['current_type'] == G && this['scrollview']['addItem'](F);
                        },
                        C['prototype']['getScrollViewCount'] = function () {
                            return this['scrollview']['value_count'];
                        },
                        C['prototype']['onLoadOver'] = function (G) {
                            if (this['current_type'] == G) {
                                var F = C['paipuLst'][this['current_type']];
                                0 == F['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        C['prototype']['onCollectChange'] = function (G, F) {
                            if (this['current_type'] == z['COLLECT'])
                                F >= 0 && (C['paipuLst'][z['COLLECT']]['removeAt'](F), this['scrollview']['delItem'](F));
                            else
                                for (var v = C['paipuLst'][this['current_type']]['uuid_list'], h = 0; h < v['length']; h++)
                                    if (v[h] == G) {
                                        this['scrollview']['wantToRefreshItem'](h);
                                        break;
                                    }
                            this['label_collect_count'].text = C['collect_lsts']['length']['toString']() + '/' + C['collect_limit']['toString']();
                        },
                        C['prototype']['refreshAll'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        C.Inst = null,
                        C['paipuLst'] = {},
                        C['collect_lsts'] = [],
                        C['record_map'] = {},
                        C['collect_info'] = {},
                        C['collect_limit'] = 20,
                        C;
                }
                    (G['UIBase']);
            G['UI_PaiPu'] = P;
        }
            (uiscript || (uiscript = {}));















        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var G = GameMgr;
            var F = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), this['use_fetch_info'] || (app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (G, v) {
                G || v['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', G, v) : F['server_time_delta'] = 1000 * v['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (G, v) {
                G || v['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', G, v) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](v)), F['updateServerSettings'](v['settings']));
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (G, v) {
                G || v['error'] || (F['client_endpoint'] = v['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (G) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](G));
                var v = G['update'];
                if (v) {
                    if (v['numerical'])
                        for (var z = 0; z < v['numerical']['length']; z++) {
                            var h = v['numerical'][z].id,
                                P = v['numerical'][z]['final'];
                            switch (h) {
                                case '100001':
                                    F['account_data']['diamond'] = P;
                                    break;
                                case '100002':
                                    F['account_data'].gold = P;
                                    break;
                                case '100099':
                                    F['account_data'].vip = P,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (h >= '101001' || '102999' >= h) && (F['account_numerical_resource'][h] = P);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](v),
                        v['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](v['daily_task']),
                        v['title'] && uiscript['UI_TitleBook']['title_update'](v['title']),
                        v['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](v),
                        (v['activity_task'] || v['activity_period_task'] || v['activity_random_task'] || v['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](v),
                        v['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](v['activity_flip_task']['progresses']),
                        v['activity'] && (v['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](v['activity']['friend_gift_data']), v['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](v['activity']['upgrade_data']), v['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](v['activity']['gacha_data']), v['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](v['activity']['simulation_data']), v['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](v['activity']['spot_data']), v['activity']['combining_data'] && uiscript['UI_Activity_Combining']['update_data'](v['activity']['combining_data']), v['activity']['village_data'] && uiscript['UI_Activity_Chunjie']['update_data'](v['activity']['village_data']), v['activity']['festival_data'] && uiscript['UI_Activity_24ba']['updateData'](v['activity']['festival_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (G) {
                app.Log.log('收到消息：' + JSON['stringify'](G)),
                    G.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](G['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (G) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    G['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](G['settings']), G['settings']['nickname_setting'] && (F['nickname_replace_enable'] = !!G['settings']['nickname_setting']['enable'], F['nickname_replace_lst'] = G['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = G['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (G) {
                uiscript['UI_Sushe']['send_gift_limit'] = G['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = G['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = G['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = G['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = G['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (G) {
                game['Tools']['showGuaJiChengFa'](G);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (G) {
                F['auth_check_id'] = G['check_id'],
                    F['auth_nc_retry_count'] = 0,
                    4 == G.type ? F['showNECaptcha']() : 2 == G.type ? F['checkNc']() : F['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (G, v) {
                        G || v['error'] || (F['server_time_delta'] = 1000 * v['server_time'] - Laya['timer']['currTimer']);
                    });
                    var G = (Laya['timer']['currTimer'] - F['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: G
                    }, function () { }),
                        G >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var G = Laya['stage']['getMousePoint']();
                (G.x != F['_pre_mouse_point'].x || G.y != F['_pre_mouse_point'].y) && (F['clientHeatBeat'](), F['_pre_mouse_point'].x = G.x, F['_pre_mouse_point'].y = G.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == G['client_type'] && Laya['timer'].loop(3600000, this, function () {
                F['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == G['client_language']) {
                var v = document['createElement']('link');
                v.rel = 'stylesheet',
                    v.href = 'font/notosansjapanese_1.css';
                var z = document['getElementsByTagName']('head')[0];
                z['appendChild'](v);
            }
        }










        // 设置状态
        !function (G) {
            var F = function () {
                function G(F) {
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
                        G.Inst = this,
                        this.me = F,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var v = 0; 3 > v; v++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + v));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var v = 0; 3 > v; v++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + v));
                    for (var v = 0; 2 > v; v++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + v));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                }
                return Object['defineProperty'](G['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    G['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    G['prototype']['showCD'] = function (G, F) {
                        var v = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](G / 1000),
                            this._add = Math['floor'](F / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var G = Laya['timer']['currTimer'] - v['_pre_time'];
                                v['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? v['_start'] += G : v['_show']();
                            });
                    },
                    G['prototype']['close'] = function () {
                        this['reset']();
                    },
                    G['prototype']['_show'] = function () {
                        var G = this._fix + this._add - this['timeuse'];
                        if (0 >= G)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (G != this['_pre_sec']) {
                            if (this['_pre_sec'] = G, G > this._add) {
                                for (var F = (G - this._add)['toString'](), v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['visible'] = v < F['length'];
                                if (3 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[2] + '.png')) : 2 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + F[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var z = this._add['toString'](), v = 0; v < this['_img_countdown_add']['length']; v++) {
                                        var h = this['_img_countdown_add'][v];
                                        v < z['length'] ? (h['visible'] = !0, h.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + z[v] + '.png')) : h['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var v = 0; v < this['_img_countdown_add']['length']; v++)
                                        this['_img_countdown_add'][v]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var F = G['toString'](), v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['visible'] = v < F['length'];
                                3 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[2] + '.png')) : 2 == F['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + F[0] + '.png');
                            }
                            if (G > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                    this['_container_c1']['visible'] = !0;
                                for (var v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                                for (var v = 0; v < this['_img_countdown_c1']['length']; v++)
                                    this['_img_countdown_c1'][v]['visible'] = this['_img_countdown_c0'][v]['visible'], this['_img_countdown_c1'][v].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][v].skin);
                                U.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    G.Inst = null,
                    G;
            }
                (),
                v = function () {
                    function G(G) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = G;
                    }
                    return G['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        G['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        G['prototype']['_loop_refresh_delay'] = function () {
                            var G = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var F = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var v = app['NetAgent']['mj_network_delay'];
                                    F = 300 > v ? 2000 : 800 > v ? 2500 + v : 4000 + 0.5 * v,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            G['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    F = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), F);
                            }
                        },
                        G['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var G = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > G ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > G ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        G;
                }
                    (),
                z = function () {
                    function G(G, F) {
                        var v = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = F,
                            this.me = G,
                            this['btn_banemj'] = G['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = G['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = G['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['emj_banned'] = !v['emj_banned'], v['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (v['emj_banned'] ? '_on.png' : '.png')), v['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['close'](), U.Inst['btn_seeinfo'](v['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](v['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || v['switch']();
                            }, null, !1);
                    }
                    return G['prototype']['reset'] = function (G, F, v) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = G,
                            this['showemj'] = F,
                            this['showchange'] = v,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        G['prototype']['onChangeSeat'] = function (G, F, v) {
                            this['showinfo'] = G,
                                this['showemj'] = F,
                                this['showchange'] = v,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        G['prototype']['switch'] = function () {
                            var G = this;
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
                                G['locking'] = !1;
                            })));
                        },
                        G['prototype']['close'] = function () {
                            var G = this;
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
                                    G['locking'] = !1,
                                        G['btn_banemj']['visible'] = !1,
                                        G['btn_seeinfo']['visible'] = !1,
                                        G['btn_change']['visible'] = !1;
                                });
                        },
                        G;
                }
                    (),
                h = function () {
                    function G(G) {
                        var F = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = G,
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
                    return G['prototype']['initRoom'] = function () {
                        var G = view['DesktopMgr'].Inst['main_role_character_info'],
                            F = cfg['item_definition']['character'].find(G['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var v = 0; 9 > v; v++)
                            this.emos.push({
                                path: F.emo + '/' + v + '.png',
                                sub_id: v,
                                sort: v
                            });
                        if (G['extra_emoji'])
                            for (var v = 0; v < G['extra_emoji']['length']; v++)
                                this.emos.push({
                                    path: F.emo + '/' + G['extra_emoji'][v] + '.png',
                                    sub_id: G['extra_emoji'][v],
                                    sort: G['extra_emoji'][v] > 12 ? 1000000 - G['extra_emoji'][v] : G['extra_emoji'][v]
                                });
                        this.emos = this.emos.sort(function (G, F) {
                            return G.sort - F.sort;
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
                                char_id: G['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        G['prototype']['render_item'] = function (G) {
                            var F = this,
                                v = G['index'],
                                z = G['container'],
                                h = this.emos[v],
                                P = z['getChildByName']('btn');
                            P.skin = game['LoadMgr']['getResImageSkin'](h.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](P, !0) : (game['Tools']['setGrayDisable'](P, !1), P['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var G = !1, v = 0, z = F['emo_infos']['emoji']; v < z['length']; v++) {
                                            var P = z[v];
                                            if (P[0] == h['sub_id']) {
                                                P[0]++,
                                                    G = !0;
                                                break;
                                            }
                                        }
                                        G || F['emo_infos']['emoji'].push([h['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: h['sub_id']
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
                        G['prototype']['change_all_gray'] = function (G) {
                            this['allgray'] = G,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        G['prototype']['switchShow'] = function (G) {
                            var F = this,
                                v = 0;
                            v = G ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, G ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    G ? (F.out['visible'] = !1, F.in['visible'] = !0) : (F.out['visible'] = !0, F.in['visible'] = !1),
                                        Laya['Tween'].to(F.me, {
                                            x: v
                                        }, G ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](F, function () {
                                            F['btn_chat']['disabled'] = !1,
                                                F['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        G['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var G = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: G,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: U.Inst['min_double_time'],
                            //        g: U.Inst['max_double_time']
                            //    }, !1),
                            //    this['emo_infos']['emoji'] = [];
                            // }
                            // this['emo_log_count']++;
                            // END
                        },
                        G['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        G;
                }
                    (),
                P = function () {
                    function F(F) {
                        this['effect'] = null,
                            this['container_emo'] = F['getChildByName']('chat_bubble'),
                            this.emo = new G['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = F['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return F['prototype'].show = function (G, F) {
                        var v = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var z = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](G)]['character']['charid'], h = cfg['character']['emoji']['getGroup'](z), P = '', C = 0, M = 10 > F, U = 0; U < h['length']; U++)
                                if (h[U]['sub_id'] == F) {
                                    M = !0,
                                        2 == h[U].type && (P = h[U].view, C = h[U]['audio']);
                                    break;
                                }
                            M || (F = 0),
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                P ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + P + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    v['effect'] && (v['effect']['destory'](), v['effect'] = null);
                                }), C && view['AudioMgr']['PlayAudio'](C)) : (this.emo['setSkin'](z, F), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    Laya['Tween'].to(v['container_emo'], {
                                        scaleX: 0,
                                        scaleY: 0
                                    }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    v['container_emo']['visible'] = !1,
                                        v.emo['clear']();
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
                C = function () {
                    function G(G, F) {
                        if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = F, this.me = G, 0 == F) {
                            var v = G['getChildByName']('moqie');
                            this['moqie'] = v['getChildByName']('moqie'),
                                this['tip_moqie'] = v['getChildByName']('tip'),
                                this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                                this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                                this['points_moqie'] = [];
                            var z = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                            this['points_moqie'].push(z);
                            for (var h = 0; 5 > h; h++) {
                                var P = z['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_moqie'].push(P);
                            }
                            var C = G['getChildByName']('shouqie');
                            this['shouqie'] = C['getChildByName']('shouqie'),
                                this['tip_shouqie'] = C['getChildByName']('tip'),
                                this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                                this['points_shouqie'] = [],
                                this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                                z = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                                this['points_shouqie'].push(z);
                            for (var h = 0; 5 > h; h++) {
                                var P = z['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_shouqie'].push(P);
                            }
                            'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                        } else
                            this['moqie'] = G['getChildByName']('moqie'), this['shouqie'] = G['getChildByName']('shouqie');
                        this['star_moqie'] = this['moqie']['getChildByName']('star'),
                            this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                    }
                    return G['prototype'].show = function (G, F, v, z, h) {
                        var P = this;
                        if (this.me['visible'] = !0, F != this['_now_moqie_bonus']) {
                            if (this['_now_moqie_bonus'] = F, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + F + '.png'), h) {
                                var C = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                                C['parent']['setChildIndex'](C, 1),
                                    Laya['Tween']['clearAll'](this['moqie']),
                                    Laya['Tween'].to(this['moqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(P['moqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_moqie']['visible'] = F == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (z != this['_now_shouqie_bonus']) {
                            if (this['_now_shouqie_bonus'] = z, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + z + '.png'), h) {
                                var C = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                                C['parent']['setChildIndex'](C, 1),
                                    Laya['Tween']['clearAll'](this['shouqie']),
                                    Laya['Tween'].to(this['shouqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(P['shouqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_shouqie']['visible'] = z == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (0 == this['index']) {
                            for (var M = this['_fan_counts']['indexOf'](F), U = this['_moqie_counts'][M + 1] - this['_moqie_counts'][M], y = G - this['_moqie_counts'][M], S = 0; S < this['points_moqie']['length']; S++) {
                                var N = this['points_moqie'][S];
                                if (U > S) {
                                    N['visible'] = !0;
                                    var O = S / U * 2 * Math.PI;
                                    N.pos(27 * Math.sin(O) + 27, 27 - 27 * Math.cos(O)),
                                        N.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (y > S ? 'l.png' : 'd.png'));
                                } else
                                    N['visible'] = !1;
                            }
                            this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + G]),
                                this['circle_moqie']['visible'] = F != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                                M = this['_fan_counts']['indexOf'](z),
                                U = this['_shouqie_counts'][M + 1] - this['_shouqie_counts'][M],
                                y = v - this['_shouqie_counts'][M];
                            for (var S = 0; S < this['points_shouqie']['length']; S++) {
                                var N = this['points_shouqie'][S];
                                if (U > S) {
                                    N['visible'] = !0;
                                    var O = S / U * 2 * Math.PI;
                                    N.pos(27 * Math.sin(O) + 27, 27 - 27 * Math.cos(O)),
                                        N.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (y > S ? 'l.png' : 'd.png'));
                                } else
                                    N['visible'] = !1;
                            }
                            this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + v]),
                                this['circle_shouqie']['visible'] = z != this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                    },
                        G['prototype']['resetToStart'] = function () {
                            var G = this;
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
                                    G['_update']();
                                }),
                                this['_anim_start_time'] = Laya['timer']['currTimer'],
                                this['_update'](),
                                this['star_moqie']['visible'] = !1,
                                this['star_shouqie']['visible'] = !1,
                                0 == this['index'] && (this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['0']), this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['0']));
                        },
                        G['prototype'].hide = function () {
                            Laya['timer']['clearAll'](this),
                                this.me['visible'] = !1;
                        },
                        G['prototype']['_update'] = function () {
                            var G = (Laya['timer']['currTimer'] - this['_anim_start_time']) / 2000 % 1,
                                F = 1.4 * Math.abs(G - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](0)['scale'](F, F),
                                this['star_shouqie']['getChildAt'](0)['scale'](F, F),
                                G = (G + 0.4) % 1;
                            var v = 1.4 * Math.abs(G - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](1)['scale'](v, v),
                                this['star_shouqie']['getChildAt'](1)['scale'](v, v);
                        },
                        G;
                }
                    (),
                M = function () {
                    function F(G, F) {
                        var v = this;
                        this['index'] = F,
                            this.me = G,
                            this.tip = G['getChildByName']('lizhi_tip'),
                            this['image_count'] = this.tip['getChildByName']('count'),
                            this['image_overload'] = this.tip['getChildByName']('overload'),
                            'kr' == GameMgr['client_language'] && this['image_overload'].size(72, 28),
                            this['tip_points'] = [],
                            this['effects'] = [],
                            this['sprite_points'] = this.tip['getChildByName']('tip');
                        var z = this.tip['getChildByName']('tip')['getChildByName']('0');
                        this['tip_points'].push(z);
                        for (var h = 0; 5 > h; h++) {
                            var P = z['scriptMap']['capsui.UICopy']['getNodeClone']();
                            this['tip_points'].push(P);
                        }
                        this['tip_points']['forEach'](function (G, F) {
                            G.skin = '',
                                v['updatePosition'](G, F);
                        });
                    }
                    return F['prototype']['updatePosition'] = function (G, F, v) {
                        void 0 === v && (v = !0);
                        var z = v ? 40.5 : 41.5;
                        G['pivot'](-14, 19),
                            G['rotation'] = 60 * (F - 1),
                            G.pos(29.5, z);
                    },
                        F['prototype'].show = function (F, v, z) {
                            var h = this;
                            void 0 === z && (z = !0),
                                this.me['visible'] || (this.me['visible'] = !0, Laya['Tween']['clearAll'](this.me), this.me['scale'](1, 1), z && (view['AudioMgr']['PlayAudio'](8001), G['UIBase']['anim_pop_out'](this.me, null))),
                                (F != this['continue_deal_count'] || v != this['overload']) && (this['image_overload']['visible'] = !!v, v && (F = 0), z ? (6 != F && view['AudioMgr']['PlayAudio'](v ? 8003 : 8002), this['image_overload']['alpha'] = 0, Laya['Tween']['clearAll'](this['image_count']), Laya['Tween']['clearAll'](this['image_overload']), Laya['Tween'].to(this['image_count'], {
                                    alpha: 0
                                }, 150, Laya.Ease['quadInOut'], Laya['Handler']['create'](this, function () {
                                    var G = v ? h['image_overload'] : h['image_count'],
                                        z = v ? 2 : 6 == F ? 1 : 3;
                                    v || (h['image_count'].skin = game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_' + F + '.png')),
                                        G['alpha'] = 0,
                                        G['scale'](z, z),
                                        Laya['Tween'].to(G, {
                                            alpha: 1,
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 150, Laya.Ease['quadInOut']);
                                })), this['tip_points']['forEach'](function (G, v) {
                                    Laya['Tween']['clearAll'](G);
                                    var z = F > 6 - (v + 1),
                                        P = z ? game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_line_blue.png') : game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_line_red.png');
                                    G.skin != P && (z || h['showBrokenEffect'](v), Laya['Tween'].to(G, {
                                        alpha: 0
                                    }, 150, Laya.Ease['quadInOut'], Laya['Handler']['create'](h, function () {
                                        G.skin = P,
                                            h['updatePosition'](G, v, z),
                                            Laya['Tween'].to(G, {
                                                alpha: 1
                                            }, 150, Laya.Ease['quadInOut']);
                                    })));
                                })) : (this['image_count']['visible'] = !v, this['image_overload']['alpha'] = 1, this['image_count']['alpha'] = 1, this['image_count'].skin = game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_' + F + '.png'), this['tip_points']['forEach'](function (G, v) {
                                    var z = F > 6 - (v + 1) ? game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_line_blue.png') : game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_line_red.png');
                                    G.skin = z,
                                        G['alpha'] = 1,
                                        h['updatePosition'](G, v);
                                })), this['overload'] = v, this['continue_deal_count'] = F);
                        },
                        F['prototype']['showBrokenEffect'] = function (G) {
                            var F,
                                v = this;
                            F = this['effects']['length'] > 0 ? this['effects'].pop() : game['FrontEffect'].Inst['create_ui_effect'](this['sprite_points']['getChildByName']('effect'), 'scene/effect_hunzhijiyi_broken.lh', new Laya['Point'](30, 40), 1),
                                F['effect'].root['transform']['localRotationEuler'] = new Laya['Vector3'](0, 0, -60 * G),
                                F['effect'].root['active'] = !1,
                                F['effect'].root['active'] = !0,
                                Laya['timer'].once(2000, F, function () {
                                    v['effects'].push(F);
                                });
                        },
                        F['prototype']['reset'] = function () {
                            this.me['visible'] = !0,
                                this['image_count']['visible'] = !0,
                                this['image_count'].skin = '',
                                this['image_overload']['visible'] = !1,
                                this['continue_deal_count'] = -1,
                                this['overload'] = !1,
                                Laya['Tween']['clearAll'](this.me),
                                Laya['Tween']['clearAll'](this['image_count']),
                                Laya['Tween']['clearAll'](this['image_overload']),
                                this['tip_points']['forEach'](function (G) {
                                    Laya['Tween']['clearAll'](G),
                                        G.skin = '',
                                        G['alpha'] = 0;
                                });
                        },
                        F['prototype'].hide = function () {
                            var G = this;
                            this.me['visible'] = !1,
                                this['image_count'].skin = game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_6.png'),
                                this['image_count']['visible'] = !0,
                                this['image_overload']['visible'] = !1,
                                Laya['Tween']['clearAll'](this.me),
                                Laya['Tween']['clearAll'](this['image_count']),
                                Laya['Tween']['clearAll'](this['image_overload']),
                                this['tip_points']['forEach'](function (F, v) {
                                    Laya['Tween']['clearAll'](F),
                                        F['alpha'] = 1,
                                        F.skin = game['Tools']['localUISrc']('myres/mjdesktop/hunzhi_line_blue.png'),
                                        G['updatePosition'](F, v);
                                }),
                                this['continue_deal_count'] = -1,
                                this['overload'] = !1;
                        },
                        F['prototype']['destory'] = function () {
                            this['effects']['forEach'](function (G) {
                                G['destory']();
                            }),
                                this['effects'] = [];
                        },
                        F;
                }
                    (),
                U = function (U) {
                    function y() {
                        var G = U.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return G['container_doras'] = null,
                            G['doras'] = [],
                            G['front_doras'] = [],
                            G['label_md5'] = null,
                            G['container_gamemode'] = null,
                            G['label_gamemode'] = null,
                            G['btn_auto_moqie'] = null,
                            G['btn_auto_nofulu'] = null,
                            G['btn_auto_hule'] = null,
                            G['img_zhenting'] = null,
                            G['btn_double_pass'] = null,
                            G['_network_delay'] = null,
                            G['_timecd'] = null,
                            G['_player_infos'] = [],
                            G['_container_fun'] = null,
                            G['_fun_in'] = null,
                            G['_fun_out'] = null,
                            G['showscoredeltaing'] = !1,
                            G['_btn_set'] = null,
                            G['_btn_leave'] = null,
                            G['_btn_fanzhong'] = null,
                            G['_btn_collect'] = null,
                            G['block_emo'] = null,
                            G['head_offset_y'] = 15,
                            G['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            G['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](G, function (F) {
                                G['onGameBroadcast'](F);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](G, function (F) {
                                G['onPlayerConnectionState'](F);
                            })),
                            y.Inst = G,
                            G;
                    }
                    return __extends(y, U),
                        y['prototype']['onCreate'] = function () {
                            var U = this;
                            this['doras'] = new Array(),
                                this['front_doras'] = [];
                            var y = this.me['getChildByName']('container_lefttop'),
                                S = y['getChildByName']('container_doras');
                            this['container_doras'] = S,
                                this['container_gamemode'] = y['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = y['getChildByName']('MD5'),
                                ('en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language']) && (this['label_md5']['margin'] = 1),
                                y['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (U['label_md5']['visible'])
                                        Laya['timer']['clearAll'](U['label_md5']), U['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? y['getChildByName']('activitymode')['visible'] = !0 : U['container_doras']['visible'] = !0;
                                    else {
                                        U['label_md5']['visible'] = !0,
                                            U['label_md5']['banAutoWordWrap'] = !1,
                                            view['DesktopMgr'].Inst['saltSha256'] ? (U['label_md5']['banAutoWordWrap'] = 'en' == GameMgr['client_language'] || ('jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language']) && view['DesktopMgr'].Inst['is_chuanma_mode'](), U['label_md5']['fontSize'] = 'en' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] ? 14 : 15, U['label_md5'].y = 42, U['label_md5'].text = game['Tools']['strOfLocalization']('10002') + view['DesktopMgr'].Inst['sha256'] + '\r\n' + game['Tools']['strOfLocalization']('10003') + view['DesktopMgr'].Inst['saltSha256']) : view['DesktopMgr'].Inst['sha256'] ? (U['label_md5']['fontSize'] = 20, U['label_md5'].y = 45, U['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (U['label_md5']['fontSize'] = 25, U['label_md5'].y = 51, U['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            y['getChildByName']('activitymode')['visible'] = !1,
                                            U['container_doras']['visible'] = !1;
                                        var G = U;
                                        Laya['timer'].once(5000, U['label_md5'], function () {
                                            G['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? y['getChildByName']('activitymode')['visible'] = !0 : U['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var N = 0; N < S['numChildren']; N++)
                                this['doras'].push(S['getChildAt'](N)), this['front_doras'].push(S['getChildAt'](N)['getChildAt'](0));
                            for (var N = 0; 4 > N; N++) {
                                var O = this.me['getChildByName']('container_player_' + N),
                                    W = {};
                                W['container'] = O,
                                    W.head = new G['UI_Head'](O['getChildByName']('head'), ''),
                                    W['head_origin_y'] = O['getChildByName']('head').y,
                                    W.name = O['getChildByName']('container_name')['getChildByName']('name'),
                                    W['container_shout'] = O['getChildByName']('container_shout'),
                                    W['container_shout']['visible'] = !1,
                                    W['illust'] = W['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    W['illustrect'] = G['UIRect']['CreateFromSprite'](W['illust']),
                                    W['shout_origin_x'] = W['container_shout'].x,
                                    W['shout_origin_y'] = W['container_shout'].y,
                                    W.emo = new P(O),
                                    W['disconnect'] = O['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    W['disconnect']['visible'] = !1,
                                    W['title'] = new G['UI_PlayerTitle'](O['getChildByName']('title'), ''),
                                    W.que = O['getChildByName']('que'),
                                    W['que_target_pos'] = new Laya['Vector2'](W.que.x, W.que.y),
                                    W['tianming'] = O['getChildByName']('tianming'),
                                    W['tianming']['visible'] = !1,
                                    W['yongchang'] = new C(O['getChildByName']('yongchang'), N),
                                    W['yongchang'].hide(),
                                    W['hunzhi'] = new M(O['getChildByName']('hunzhi'), N),
                                    W['hunzhi'].hide(),
                                    0 == N ? (O['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        U['btn_seeinfo'](0);
                                    }, null, !1), O['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                        G['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                                    })) : W['headbtn'] = new z(O['getChildByName']('btn_head'), N),
                                    this['_player_infos'].push(W);
                            }
                            this['_timecd'] = new F(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new h(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var F = 0, v = 0; v < view['DesktopMgr'].Inst['player_datas']['length']; v++)
                                                view['DesktopMgr'].Inst['player_datas'][v]['account_id'] && F++;
                                            if (1 >= F)
                                                G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](U, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var G = 0, F = 0; F < view['DesktopMgr'].Inst['player_datas']['length']; F++) {
                                                            var v = view['DesktopMgr'].Inst['player_datas'][F];
                                                            v && null != v['account_id'] && 0 != v['account_id'] && G++;
                                                        }
                                                        1 == G ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var z = !1;
                                                if (G['UI_VoteProgress']['vote_info']) {
                                                    var h = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - G['UI_VoteProgress']['vote_info']['start_time'] - G['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > h && (z = !0);
                                                }
                                                z ? G['UI_VoteProgress'].Inst['enable'] || G['UI_VoteProgress'].Inst.show() : G['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? G['UI_VoteCD'].Inst['enable'] || G['UI_VoteCD'].Inst.show() : G['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), G['UI_Ob_Replay'].Inst['resetRounds'](), G['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && G['UI_Desktop_Yindao'].Inst['close']();
                                }, null, !1),
                                this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                                this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    G['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    G['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (G['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? G['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](U, function () {
                                        G['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : G['UI_Replay'].Inst && G['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var m = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var F = Laya['timer']['currTimer'];
                                    if (m + 300 > F) {
                                        if (G['UI_ChiPengHu'].Inst['enable'])
                                            G['UI_ChiPengHu'].Inst['onDoubleClick'](), U['recordDoubleClickTime'](F - m);
                                        else {
                                            var v = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            G['UI_LiQiZiMo'].Inst['enable'] && (v = G['UI_LiQiZiMo'].Inst['onDoubleClick'](v)),
                                                v && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && U['recordDoubleClickTime'](F - m);
                                        }
                                        m = 0;
                                    } else
                                        m = F;
                                }
                            }, null, !1),
                                this['_network_delay'] = new v(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (y['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        y['prototype']['recordDoubleClickTime'] = function (G) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(G, this['min_double_time'])) : G,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(G, this['max_double_time']) : G;
                        },
                        y['prototype']['onGameBroadcast'] = function (G) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](G));
                            var F = view['DesktopMgr'].Inst['seat2LocalPosition'](G.seat),
                                v = JSON['parse'](G['content']);
                            null != v.emo && void 0 != v.emo && (this['onShowEmo'](F, v.emo), this['showAIEmo']());
                        },
                        y['prototype']['onPlayerConnectionState'] = function (G) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](G));
                            var F = G.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && F < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][F] = G['state']), this['enable']) {
                                var v = view['DesktopMgr'].Inst['seat2LocalPosition'](F);
                                this['_player_infos'][v]['disconnect']['visible'] = G['state'] != view['ELink_State']['READY'];
                            }
                        },
                        y['prototype']['_initFunc'] = function () {
                            var G = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var F = this['_fun_out']['getChildByName']('btn_func'),
                                v = this['_fun_out']['getChildByName']('btn_func2'),
                                z = this['_fun_in_spr']['getChildByName']('btn_func');
                            F['clickHandler'] = v['clickHandler'] = new Laya['Handler'](this, function () {
                                var h = 0;
                                h = -270,
                                    Laya['Tween'].to(G['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](G, function () {
                                        G['_fun_in']['visible'] = !0,
                                            G['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(G['_container_fun'], {
                                                x: h
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](G, function () {
                                                F['disabled'] = !1,
                                                    v['disabled'] = !1,
                                                    z['disabled'] = !1,
                                                    G['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    F['disabled'] = !0,
                                    v['disabled'] = !0,
                                    z['disabled'] = !0;
                            }, null, !1),
                                z['clickHandler'] = new Laya['Handler'](this, function () {
                                    var h = -546;
                                    Laya['Tween'].to(G['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](G, function () {
                                        G['_fun_in']['visible'] = !1,
                                            G['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(G['_container_fun'], {
                                                x: h
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](G, function () {
                                                F['disabled'] = !1,
                                                    v['disabled'] = !1,
                                                    z['disabled'] = !1,
                                                    G['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        F['disabled'] = !0,
                                        v['disabled'] = !0,
                                        z['disabled'] = !0;
                                });
                            var h = this['_fun_in']['getChildByName']('btn_autolipai'),
                                P = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                C = this['_fun_out']['getChildByName']('autolipai'),
                                M = Laya['LocalStorage']['getItem']('autolipai'),
                                U = !0;
                            U = M && '' != M ? 'true' == M : !0,
                                this['refreshFuncBtnShow'](h, C, U),
                                h['clickHandler'] = P['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        G['refreshFuncBtnShow'](h, C, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var y = this['_fun_in']['getChildByName']('btn_autohu'),
                                S = this['_fun_out']['getChildByName']('btn_autohu2'),
                                N = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](y, N, !1),
                                y['clickHandler'] = S['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        G['refreshFuncBtnShow'](y, N, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var O = this['_fun_in']['getChildByName']('btn_autonoming'),
                                W = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                m = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](O, m, !1),
                                O['clickHandler'] = W['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        G['refreshFuncBtnShow'](O, m, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var g = this['_fun_in']['getChildByName']('btn_automoqie'),
                                A = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                Q = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](g, Q, !1),
                                g['clickHandler'] = A['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        G['refreshFuncBtnShow'](g, Q, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (C['scale'](0.9, 0.9), N['scale'](0.9, 0.9), m['scale'](0.9, 0.9), Q['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (F['visible'] = !1, S['visible'] = !0, P['visible'] = !0, W['visible'] = !0, A['visible'] = !0) : (F['visible'] = !0, S['visible'] = !1, P['visible'] = !1, W['visible'] = !1, A['visible'] = !1);
                        },
                        y['prototype']['noAutoLipai'] = function () {
                            var G = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                G['clickHandler'].run();
                        },
                        y['prototype']['resetFunc'] = function () {
                            var G = Laya['LocalStorage']['getItem']('autolipai'),
                                F = !0;
                            F = G && '' != G ? 'true' == G : !0;
                            var v = this['_fun_in']['getChildByName']('btn_autolipai'),
                                z = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](v, z, F),
                                Laya['LocalStorage']['setItem']('autolipai', F ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](F);
                            var h = this['_fun_in']['getChildByName']('btn_autohu'),
                                P = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](h, P, view['DesktopMgr'].Inst['auto_hule']);
                            var C = this['_fun_in']['getChildByName']('btn_autonoming'),
                                M = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](C, M, view['DesktopMgr'].Inst['auto_nofulu']);
                            var U = this['_fun_in']['getChildByName']('btn_automoqie'),
                                y = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](U, y, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var S = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            S['disabled'] = !1,
                                S['disabled'] = !1;
                        },
                        y['prototype']['setDora'] = function (G, F) {
                            if (0 > G || G >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var v = 'myres2/mjpm/' + (F['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                            this['doras'][G].skin = game['Tools']['localUISrc'](v + F['toString'](!1) + '.png'),
                                this['front_doras'][G]['visible'] = !F['touming'],
                                this['front_doras'][G].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                        },
                        y['prototype']['initRoom'] = function () {
                            var F = this;
                            if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var v = {}, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++) {
                                    for (var h = view['DesktopMgr'].Inst['player_datas'][z]['character'], P = h['charid'], C = cfg['item_definition']['character'].find(P).emo, M = 0; 9 > M; M++) {
                                        var U = C + '/' + M['toString']() + '.png';
                                        v[U] = 1;
                                    }
                                    if (h['extra_emoji'])
                                        for (var M = 0; M < h['extra_emoji']['length']; M++) {
                                            var U = C + '/' + h['extra_emoji'][M]['toString']() + '.png';
                                            v[U] = 1;
                                        }
                                }
                                var y = [];
                                for (var S in v)
                                    y.push(S);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](y, Laya['Handler']['create'](this, function () {
                                        F['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                                this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                            else {
                                for (var N = !1, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++) {
                                    var O = view['DesktopMgr'].Inst['player_datas'][z];
                                    if (O && null != O['account_id'] && O['account_id'] == GameMgr.Inst['account_id']) {
                                        N = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (G['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = N;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var W = 0, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++) {
                                    var O = view['DesktopMgr'].Inst['player_datas'][z];
                                    O && null != O['account_id'] && 0 != O['account_id'] && W++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var m = 0, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++) {
                                var O = view['DesktopMgr'].Inst['player_datas'][z];
                                O && null != O['account_id'] && 0 != O['account_id'] && m++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var g = this.me['getChildByName']('container_lefttop');
                            if (g['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                                g['getChildByName']('num_lizhi_0')['visible'] = !1, g['getChildByName']('num_lizhi_1')['visible'] = !1, g['getChildByName']('num_ben_0')['visible'] = !1, g['getChildByName']('num_ben_1')['visible'] = !1, g['getChildByName']('container_doras')['visible'] = !1, g['getChildByName']('gamemode')['visible'] = !1, g['getChildByName']('activitymode')['visible'] = !0, g['getChildByName']('MD5').y = 63, g['getChildByName']('MD5')['width'] = 239, g['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), g['getChildAt'](0)['width'] = 280, g['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (g['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, g['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (g['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), g['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), g['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, g['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (g['getChildByName']('num_lizhi_0')['visible'] = !0, g['getChildByName']('num_lizhi_1')['visible'] = !1, g['getChildByName']('num_ben_0')['visible'] = !0, g['getChildByName']('num_ben_1')['visible'] = !0, g['getChildByName']('container_doras')['visible'] = !0, g['getChildByName']('gamemode')['visible'] = !0, g['getChildByName']('activitymode')['visible'] = !1, g['getChildByName']('MD5').y = 51, g['getChildByName']('MD5')['width'] = 276, g['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), g['getChildAt'](0)['width'] = 313, g['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var A = view['DesktopMgr'].Inst['game_config'],
                                    Q = game['Tools']['get_room_desc'](A);
                                this['label_gamemode'].text = Q.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = G['UI_Activity_JJC']['win_count']['toString']();
                                    for (var z = 0; 3 > z; z++)
                                        this['container_jjc']['getChildByName'](z['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (G['UI_Activity_JJC']['lose_count'] > z ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            G['UI_Replay'].Inst && (G['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var k = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                _ = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (G['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](k, !0), game['Tools']['setGrayDisable'](_, !0)) : (game['Tools']['setGrayDisable'](k, !1), game['Tools']['setGrayDisable'](_, !1), G['UI_Astrology'].Inst.hide());
                            for (var z = 0; 4 > z; z++)
                                this['_player_infos'][z]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][z]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][z]['yongchang'].hide(), this['_player_infos'][z]['hunzhi'].hide();
                        },
                        y['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                            for (var G = 0; 4 > G; G++)
                                this['_player_infos'][G]['hunzhi']['destory']();
                        },
                        y['prototype']['refreshSeat'] = function (G) {
                            void 0 === G && (G = !1);
                            for (var F = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), v = 0; 4 > v; v++) {
                                var z = view['DesktopMgr'].Inst['localPosition2Seat'](v),
                                    h = this['_player_infos'][v];
                                if (0 > z)
                                    h['container']['visible'] = !1;
                                else {
                                    h['container']['visible'] = !0;
                                    var P = view['DesktopMgr'].Inst['getPlayerName'](z);
                                    game['Tools']['SetNickname'](h.name, P, !1, !0),
                                        h.head.id = F[z]['avatar_id'],
                                        h.head['set_head_frame'](F[z]['account_id'], F[z]['avatar_frame']);
                                    var C = (cfg['item_definition'].item.get(F[z]['avatar_frame']), cfg['item_definition'].view.get(F[z]['avatar_frame']));
                                    if (h.head.me.y = C && C['sargs'][0] ? h['head_origin_y'] - Number(C['sargs'][0]) / 100 * this['head_offset_y'] : h['head_origin_y'], h['avatar'] = F[z]['avatar_id'], 0 != v) {
                                        var M = F[z]['account_id'] && 0 != F[z]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                            U = F[z]['account_id'] && 0 != F[z]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            y = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                        G ? h['headbtn']['onChangeSeat'](M, U, y) : h['headbtn']['reset'](M, U, y);
                                    }
                                    h['title'].id = F[z]['title'] ? game['Tools']['titleLocalization'](F[z]['account_id'], F[z]['title']) : 0;
                                }
                            }
                        },
                        y['prototype']['refreshNames'] = function () {
                            for (var G = 0; 4 > G; G++) {
                                var F = view['DesktopMgr'].Inst['localPosition2Seat'](G),
                                    v = this['_player_infos'][G];
                                if (0 > F)
                                    v['container']['visible'] = !1;
                                else {
                                    v['container']['visible'] = !0;
                                    var z = view['DesktopMgr'].Inst['getPlayerName'](F);
                                    game['Tools']['SetNickname'](v.name, z, !1, !0);
                                }
                            }
                        },
                        y['prototype']['refreshLinks'] = function () {
                            for (var G = (view['DesktopMgr'].Inst.seat, 0); 4 > G; G++) {
                                var F = view['DesktopMgr'].Inst['localPosition2Seat'](G);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][G]['disconnect']['visible'] = -1 == F || 0 == G ? !1 : view['DesktopMgr']['player_link_state'][F] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][G]['disconnect']['visible'] = -1 == F || 0 == view['DesktopMgr'].Inst['player_datas'][F]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][F] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][G]['disconnect']['visible'] = !1);
                            }
                        },
                        y['prototype']['setBen'] = function (G) {
                            G > 99 && (G = 99);
                            var F = this.me['getChildByName']('container_lefttop'),
                                v = F['getChildByName']('num_ben_0'),
                                z = F['getChildByName']('num_ben_1');
                            G >= 10 ? (v.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](G / 10)['toString']() + '.png'), z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (G % 10)['toString']() + '.png'), z['visible'] = !0) : (v.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (G % 10)['toString']() + '.png'), z['visible'] = !1);
                        },
                        y['prototype']['setLiqibang'] = function (G, F) {
                            void 0 === F && (F = !0),
                                G > 999 && (G = 999);
                            var v = this.me['getChildByName']('container_lefttop'),
                                z = v['getChildByName']('num_lizhi_0'),
                                h = v['getChildByName']('num_lizhi_1'),
                                P = v['getChildByName']('num_lizhi_2');
                            G >= 100 ? (P.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (G % 10)['toString']() + '.png'), h.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](G / 10) % 10)['toString']() + '.png'), z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](G / 100)['toString']() + '.png'), h['visible'] = !0, P['visible'] = !0) : G >= 10 ? (h.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (G % 10)['toString']() + '.png'), z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](G / 10)['toString']() + '.png'), h['visible'] = !0, P['visible'] = !1) : (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + G['toString']() + '.png'), h['visible'] = !1, P['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](G, F);
                        },
                        y['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                this['setZhenting'](!1),
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var G = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, F = 0; F < this['doras']['length']; F++)
                                if (this['front_doras'][F].skin = '', this['doras'][F].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                    this['front_doras'][F]['visible'] = !1, this['doras'][F].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                else {
                                    var v = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                    this['front_doras'][F]['visible'] = !0,
                                        this['doras'][F].skin = game['Tools']['localUISrc'](v + '5z.png'),
                                        this['front_doras'][F].skin = game['Tools']['localUISrc'](G + 'back.png');
                                }
                            for (var F = 0; 4 > F; F++)
                                this['_player_infos'][F].emo['reset'](), this['_player_infos'][F].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        y['prototype']['showCountDown'] = function (G, F) {
                            this['_timecd']['showCD'](G, F);
                        },
                        y['prototype']['setZhenting'] = function (G) {
                            this['img_zhenting']['visible'] = G;
                        },
                        y['prototype']['shout'] = function (G, F, v, z) {
                            app.Log.log('shout:' + G + ' type:' + F);
                            try {
                                var h = this['_player_infos'][G],
                                    P = h['container_shout'],
                                    C = P['getChildByName']('img_content'),
                                    M = P['getChildByName']('illust')['getChildByName']('illust'),
                                    U = P['getChildByName']('img_score');
                                if (0 == z)
                                    U['visible'] = !1;
                                else {
                                    U['visible'] = !0;
                                    var y = 0 > z ? 'm' + Math.abs(z) : z;
                                    U.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + y + '.png');
                                }
                                '' == F ? C['visible'] = !1 : (C['visible'] = !0, C.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + F + '.png'));
                                var S = 'chi' == F || 'peng' == F || 'gang' == F || 'babei' == F || 'lizhi' == F;
                                if (view['DesktopMgr']['is_yuren_type']() && S && 100 * Math['random']() < 30) {
                                    P['getChildByName']('illust')['visible'] = !1,
                                        P['getChildAt'](2)['visible'] = !0;
                                    var N = 0,
                                        O = 100 * Math['random']() < 50;
                                    switch (F) {
                                        case 'chi':
                                            N = O ? 1 : 2;
                                            break;
                                        case 'peng':
                                            N = O ? 3 : 4;
                                            break;
                                        case 'gang':
                                            N = O ? 5 : 6;
                                            break;
                                        case 'babei':
                                            N = O ? 7 : 8;
                                            break;
                                        case 'lizhi':
                                            N = O ? 9 : 10;
                                    }
                                    game['LoadMgr']['setImgSkin'](P['getChildAt'](2), 'extendRes/charactor/yurenjie/img_' + N + '.png');
                                } else
                                    P['getChildByName']('illust')['visible'] = !0, P['getChildAt'](2)['visible'] = !1, P['getChildAt'](0)['visible'] = !0, M['scaleX'] = 1, game['Tools']['charaPart'](v['avatar_id'], M, 'full', h['illustrect'], !0, !0);
                                var W = 0,
                                    m = 0;
                                switch (G) {
                                    case 0:
                                        W = -105,
                                            m = 0;
                                        break;
                                    case 1:
                                        W = 500,
                                            m = 0;
                                        break;
                                    case 2:
                                        W = 0,
                                            m = -300;
                                        break;
                                    default:
                                        W = -500,
                                            m = 0;
                                }
                                P['visible'] = !0,
                                    P['alpha'] = 0,
                                    P.x = h['shout_origin_x'] + W,
                                    P.y = h['shout_origin_y'] + m,
                                    Laya['Tween'].to(P, {
                                        alpha: 1,
                                        x: h['shout_origin_x'],
                                        y: h['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(P, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](M.skin),
                                            P['visible'] = !1;
                                    });
                            } catch (g) {
                                var A = {};
                                A['error'] = g['message'],
                                    A['stack'] = g['stack'],
                                    A['method'] = 'shout',
                                    A['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](A);
                            }
                        },
                        y['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        y['prototype']['refreshFuncBtnShow'] = function (G, F, v) {
                            var z = G['getChildByName']('img_choosed');
                            F['color'] = G['mouseEnabled'] ? v ? '#3bd647' : '#7992b3' : '#565656',
                                z['visible'] = v;
                        },
                        y['prototype']['onShowEmo'] = function (G, F) {
                            var v = this['_player_infos'][G];
                            0 != G && v['headbtn']['emj_banned'] || v.emo.show(G, F);
                        },
                        y['prototype']['changeHeadEmo'] = function (G) {
                            {
                                var F = view['DesktopMgr'].Inst['seat2LocalPosition'](G);
                                this['_player_infos'][F];
                            }
                        },
                        y['prototype']['onBtnShowScoreDelta'] = function () {
                            var G = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                G['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        y['prototype']['btn_seeinfo'] = function (F) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                                var v = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](F)]['account_id'];
                                if (v) {
                                    var z = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        h = 1,
                                        P = view['DesktopMgr'].Inst['game_config'].meta;
                                    P && P['mode_id'] == game['EMatchMode']['shilian'] && (h = 4);
                                    var C = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](F));
                                    G['UI_OtherPlayerInfo'].Inst.show(v, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, z ? 1 : 2, h, C['nickname']);
                                }
                            }
                        },
                        y['prototype']['openDora3BeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openDora3BeginShine'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openShilianOpenBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openChuanmaBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openJiuChaoBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openAnPaiBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openZhanxingBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openTianmingBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openYongchangBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['openHunzhiyijiBeginEffect'] = function () {
                            var G = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_hunzhiyiji_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, G, function () {
                                    G['destory']();
                                });
                        },
                        y['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        y['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (G['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        y['prototype']['showAIEmo'] = function () {
                            for (var G = this, F = function (F) {
                                var z = view['DesktopMgr'].Inst['player_datas'][F];
                                z['account_id'] && 0 != z['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), v, function () {
                                    G['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](F), Math['floor'](9 * Math['random']()));
                                });
                            }, v = this, z = 0; z < view['DesktopMgr'].Inst['player_datas']['length']; z++)
                                F(z);
                        },
                        y['prototype']['setGapType'] = function (G, F) {
                            void 0 === F && (F = !1);
                            for (var v = 0; v < G['length']; v++) {
                                var z = view['DesktopMgr'].Inst['seat2LocalPosition'](v);
                                this['_player_infos'][z].que['visible'] = !0,
                                    F && (0 == v ? (this['_player_infos'][z].que.pos(this['gapStartPosLst'][v].x + this['selfGapOffsetX'][G[v]], this['gapStartPosLst'][v].y), this['_player_infos'][z].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][z].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][z]['que_target_pos'].x,
                                        y: this['_player_infos'][z]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][z].que.pos(this['gapStartPosLst'][v].x, this['gapStartPosLst'][v].y), this['_player_infos'][z].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][z].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][z]['que_target_pos'].x,
                                        y: this['_player_infos'][z]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][z].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + G[v] + '.png');
                            }
                        },
                        y['prototype']['OnNewCard'] = function (G, F) {
                            if (F) {
                                var v = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, v, function () {
                                        v['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function () {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        y['prototype']['ShowSpellCard'] = function (F, v) {
                            void 0 === v && (v = !1),
                                G['UI_FieldSpell'].Inst && !G['UI_FieldSpell'].Inst['enable'] && G['UI_FieldSpell'].Inst.show(F, v);
                        },
                        y['prototype']['HideSpellCard'] = function () {
                            G['UI_FieldSpell'].Inst && G['UI_FieldSpell'].Inst['close']();
                        },
                        y['prototype']['SetTianMingRate'] = function (G, F, v) {
                            void 0 === v && (v = !1);
                            var z = view['DesktopMgr'].Inst['seat2LocalPosition'](G),
                                h = this['_player_infos'][z]['tianming'];
                            v && 5 != F && h.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + F + '.png') && Laya['Tween'].to(h, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(h, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                h.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + F + '.png');
                        },
                        y['prototype']['ResetYongChang'] = function () {
                            for (var G = 0; 4 > G; G++)
                                this['_player_infos'][G]['yongchang']['resetToStart']();
                        },
                        y['prototype']['SetYongChangRate'] = function (G, F, v, z, h, P) {
                            this['_player_infos'][G]['yongchang'].show(F, v, z, h, P);
                        },
                        y['prototype']['ResetHunZhiYiJi'] = function () {
                            for (var G = 0; 4 > G; G++)
                                this['_player_infos'][G]['hunzhi']['reset']();
                        },
                        y['prototype']['SetHunZhiContinueDealCount'] = function (G, F, v, z) {
                            void 0 === z && (z = !0),
                                this['_player_infos'][G]['hunzhi'].show(F, v, z);
                        },
                        y.Inst = null,
                        y;
                }
                    (G['UIBase']);
            G['UI_DesktopInfo'] = U;
        }
            (uiscript || (uiscript = {}));












        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var F = this,
                v = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: v,
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (v, z) {
                    v || z['error'] ? G['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', v, z) : F['_refreshAnnouncements'](z);
                    // START
                    if ((v || z['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                    // END
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (G) {
                    for (var z = GameMgr['inDmm'] ? 'web_dmm' : 'web', h = 0, P = G['update_list']; h < P['length']; h++) {
                        var C = P[h];
                        if (C.lang == v && C['platform'] == z) {
                            F['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }



        uiscript.UI_Info._refreshAnnouncements = function (G) {
            // START
            G.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (G['announcements'] && (this['announcements'] = G['announcements']), G.sort && (this['announcement_sort'] = G.sort), G['read_list']) {
                this['read_list'] = [];
                for (var F = 0; F < G['read_list']['length']; F++)
                    this['read_list'].push(G['read_list'][F]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }










        // 加载CG 
        !function (G) {
            var F = function () {
                function F(F, v) {
                    var z = this;
                    this['cg_id'] = 0,
                        this.me = F,
                        this['father'] = v;
                    var h = this.me['getChildByName']('btn_detail');
                    h['clickHandler'] = new Laya['Handler'](this, function () {
                        G['UI_Bag'].Inst['locking'] || z['father']['changeLoadingCG'](z['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](h, new Laya['Handler'](this, function (F) {
                            if (!G['UI_Bag'].Inst['locking']) {
                                'down' == F ? Laya['timer'].once(800, z, function () {
                                    G['UI_CG_Yulan'].Inst.show(z['cg_id']);
                                }) : ('over' == F || 'up' == F) && Laya['timer']['clearAll'](z);
                            }
                        })),
                        this['using'] = h['getChildByName']('using'),
                        this.icon = h['getChildByName']('icon'),
                        this.name = h['getChildByName']('name'),
                        this.info = h['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = h['getChildByName']('new');
                }
                return F['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var F = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != G['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, F['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var v = !this['father']['last_seen_cg_map'][this['cg_id']], z = 0, h = F['unlock_items']; z < h['length']; z++) {
                        var P = h[z];
                        if (P && G['UI_Bag']['get_item_count'](P) > 0) {
                            var C = cfg['item_definition'].item.get(P);
                            if (this.name.text = C['name_' + GameMgr['client_language']], !C['item_expire']) {
                                this.info['visible'] = !1,
                                    v = -1 != this['father']['new_cg_ids']['indexOf'](P);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + C['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = v;
                },
                    F['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    F;
            }
                (),
                v = function () {
                    function v(F) {
                        var v = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = F,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var z = this.me['getChildByName']('choose');
                        this['label_choose_all'] = z['getChildByName']('tip'),
                            z['clickHandler'] = new Laya['Handler'](this, function () {
                                if (v['all_choosed'])
                                    G['UI_Loading']['Loading_Images'] = [];
                                else {
                                    G['UI_Loading']['Loading_Images'] = [];
                                    for (var F = 0, z = v['items']; F < z['length']; F++) {
                                        var h = z[F];
                                        G['UI_Loading']['Loading_Images'].push(h.id);
                                    }
                                }
                                v['scrollview']['wantToRefreshAll'](),
                                    v['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: G['UI_Loading']['Loading_Images']
                                //}, function (F, v) {
                                //    (F || v['error']) && G['UIMgr'].Inst['showNetReqError']('setLoadingImage', F, v);
                                //});
                                // END
                            });
                    }
                    return v['prototype']['have_redpoint'] = function () {
                        // START
                        //if (G['UI_Bag']['new_cg_ids']['length'] > 0)
                        //    return !0;
                        // END
                        var F = [];
                        if (!this['seen_cg_map']) {
                            var v = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, v) {
                                v = game['Tools']['dddsss'](v);
                                for (var z = v['split'](','), h = 0; h < z['length']; h++)
                                    this['seen_cg_map'][Number(z[h])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (v) {
                            if (v['unlock_items'][1] && 0 == G['UI_Bag']['get_item_count'](v['unlock_items'][0]) && G['UI_Bag']['get_item_count'](v['unlock_items'][1]) > 0) {
                                if (GameMgr['regionLimited']) {
                                    var z = cfg['item_definition'].item.get(v['unlock_items'][1]);
                                    if (1 == z['region_limit'])
                                        return;
                                }
                                F.push(v.id);
                            }
                        });
                        for (var P = 0, C = F; P < C['length']; P++) {
                            var M = C[P];
                            if (!this['seen_cg_map'][M])
                                return !0;
                        }
                        return !1;
                    },
                        v['prototype'].show = function () {
                            var F = this;
                            if (this['new_cg_ids'] = G['UI_Bag']['new_cg_ids'], G['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var v = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, v) {
                                    v = game['Tools']['dddsss'](v);
                                    for (var z = v['split'](','), h = 0; h < z['length']; h++)
                                        this['seen_cg_map'][Number(z[h])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var P = '';
                            cfg['item_definition']['loading_image']['forEach'](function (v) {
                                for (var z = 0, h = v['unlock_items']; z < h['length']; z++) {
                                    var C = h[z];
                                    if (C && G['UI_Bag']['get_item_count'](C) > 0) {
                                        var M = cfg['item_definition'].item.get(C);
                                        if (1 == M['region_limit'] && GameMgr['regionLimited'])
                                            continue;
                                        return F['items'].push(v),
                                            F['seen_cg_map'][v.id] = 1,
                                            '' != P && (P += ','),
                                            P += v.id,
                                            void 0;
                                    }
                                }
                            }),
                                this['items'].sort(function (G, F) {
                                    return F.sort - G.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](P)),
                                G['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this.me['getChildByName']('choose')['visible'] = 0 != this['items']['length'],
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1,
                                this['refreshChooseState']();
                        },
                        v['prototype']['close'] = function () {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && G['UI_Loading']['loadNextCG']();
                        },
                        v['prototype']['render_item'] = function (G) {
                            var v = G['index'],
                                z = G['container'],
                                h = G['cache_data'];
                            if (this['items'][v]) {
                                h.item || (h.item = new F(z, this));
                                var P = h.item;
                                P['cg_id'] = this['items'][v].id,
                                    P.show();
                            }
                        },
                        v['prototype']['changeLoadingCG'] = function (F) {
                            this['_changed'] = !0;
                            for (var v = 0, z = 0, h = 0, P = this['items']; h < P['length']; h++) {
                                var C = P[h];
                                if (C.id == F) {
                                    v = z;
                                    break;
                                }
                                z++;
                            }
                            var M = G['UI_Loading']['Loading_Images']['indexOf'](F);
                            -1 == M ? G['UI_Loading']['Loading_Images'].push(F) : G['UI_Loading']['Loading_Images']['splice'](M, 1),
                                this['scrollview']['wantToRefreshItem'](v),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = G['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: G['UI_Loading']['Loading_Images']
                            //}, function (F, v) {
                            //    (F || v['error']) && G['UIMgr'].Inst['showNetReqError']('setLoadingImage', F, v);
                            //});
                            // END
                        },
                        v['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = G['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        v['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        v;
                }
                    ();
            G['UI_Bag_PageCG'] = v;
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
            var G = uiscript;
            // END
            var v = this,
                z = view['DesktopMgr'].Inst['rewardinfo'];
            this['page_jiban'].me['visible'] = !1,
                this['page_jiban_gift'].me['visible'] = !1,
                this['complete'] = F,
                this['page_box'].show(),
                G['UIBase']['anim_alpha_in'](this['page_box'].me, {
                    x: -50
                }, 150),
                z['main_character'] ? (this['page_jiban'].show(), G['UIBase']['anim_alpha_in'](this['page_jiban'].me, {
                    x: -50
                }, 150, 60)) : z['character_gift'] && (this['page_jiban_gift'].show(), G['UIBase']['anim_alpha_in'](this['page_jiban_gift'].me, {
                    x: -50
                }, 150, 60)),
                Laya['timer'].once(600, this, function () {
                    var G = 0;
                    v['page_box']['doanim'](Laya['Handler']['create'](v, function () {
                        G++,
                            2 == G && v['showGrade'](F);
                    })),
                        z['main_character'] ? v['page_jiban']['doanim'](Laya['Handler']['create'](v, function () {
                            G++,
                                2 == G && v['showGrade'](F);
                        })) : z['character_gift'] ? v['page_jiban_gift']['doanim'](Laya['Handler']['create'](v, function () {
                            G++,
                                2 == G && v['showGrade'](F);
                        })) : (G++, 2 == G && v['showGrade'](F));
                }),
                this['enable'] = !0;
        }






        uiscript.UI_Entrance.prototype._onLoginSuccess = function (F, v, z) {
            var G = uiscript;
            var h = this;
            if (void 0 === z && (z = !1), app.Log.log('登陆：' + JSON['stringify'](v)), GameMgr.Inst['account_id'] = v['account_id'], GameMgr.Inst['account_data'] = v['account'], G['UI_ShiMingRenZheng']['renzhenged'] = v['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, v['account']['platform_diamond'])
                for (var P = v['account']['platform_diamond'], C = 0; C < P['length']; C++)
                    GameMgr.Inst['account_numerical_resource'][P[C].id] = P[C]['count'];
            if (v['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = v['account']['skin_ticket']), v['account']['platform_skin_ticket'])
                for (var M = v['account']['platform_skin_ticket'], C = 0; C < M['length']; C++)
                    GameMgr.Inst['account_numerical_resource'][M[C].id] = M[C]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                v['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = v['game_info']['location'], GameMgr.Inst['mj_game_token'] = v['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = v['game_info']['game_uuid']),
                v['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : F['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', v['access_token']), GameMgr.Inst['sociotype'] = F, GameMgr.Inst['access_token'] = v['access_token']);
            var U = this,
                y = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        G['UI_Loading'].Inst.show('load_lobby'),
                        U['enable'] = !1,
                        U['scene']['close'](),
                        G['UI_Entrance_Mail_Regist'].Inst['close'](),
                        U['login_loading']['close'](),
                        G['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](U, function () {
                            GameMgr.Inst['afterLogin'](),
                                U['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && G['UIMgr'].Inst['ShowPreventAddiction'](),
                                U['destroy'](),
                                U['disposeRes'](),
                                G['UI_Add2Desktop'].Inst && (G['UI_Add2Desktop'].Inst['destroy'](), G['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](U, function (F) {
                            return G['UI_Loading'].Inst['setProgressVal'](0.2 * F);
                        }, null, !1));
                },
                S = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (F, v) {
                        F ? (app.Log.log('fetchRefundOrder err:' + F), h['showError'](game['Tools']['strOfLocalization'](2061), F), h['showContainerLogin']()) : (G['UI_Refund']['orders'] = v['orders'], G['UI_Refund']['clear_deadline'] = v['clear_deadline'], G['UI_Refund']['message'] = v['message'], y());
                    }) : y();
                });
            // START
            //if (G['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var N = 0, O = GameMgr.Inst['account_data']['loading_image']; N < O['length']; N++) {
            //        var W = O[N];
            //        cfg['item_definition']['loading_image'].get(W) && G['UI_Loading']['Loading_Images'].push(W);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            G['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || v['account']['phone_verify'] ? S.run() : (G['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, G['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (F, v) {
                        F || v['error'] ? h['showError'](F, v['error']) : 0 == v['phone_login'] ? G['UI_Create_Phone_Account'].Inst.show(S) : G['UI_Canot_Create_Phone_Account'].Inst.show(S);
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
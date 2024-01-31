// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.11.16
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
            var s;
            !function (B) {
                B[B.none = 0] = 'none',
                B[B['daoju'] = 1] = 'daoju',
                B[B.gift = 2] = 'gift',
                B[B['fudai'] = 3] = 'fudai',
                B[B.view = 5] = 'view';
            }
            (s = B['EItemCategory'] || (B['EItemCategory'] = {}));
            var U = function (U) {
                function R() {
                    var B = U.call(this, new ui['lobby']['bagUI']()) || this;
                    return B['container_top'] = null,
                    B['container_content'] = null,
                    B['locking'] = !1,
                    B.tabs = [],
                    B['page_item'] = null,
                    B['page_gift'] = null,
                    B['page_skin'] = null,
                    B['page_cg'] = null,
                    B['select_index'] = 0,
                    R.Inst = B,
                    B;
                }
                return __extends(R, U),
                R.init = function () {
                    var B = this;
                    app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (s) {
                            var U = s['update'];
                            U && U.bag && (B['update_data'](U.bag['update_items']), B['update_daily_gain_data'](U.bag));
                        }, null, !1)),
                    //GameMgr.Inst['use_fetch_info'] || 
                this['fetch']();
                },
                R['fetch'] = function () {
                    var s = this;
                    this['_item_map'] = {},
                    this['_daily_gain_record'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (U, R) {
                        if (U || R['error'])
                            B['UIMgr'].Inst['showNetReqError']('fetchBagInfo', U, R);
                        else {
                            app.Log.log('背包信息：' + JSON['stringify'](R));
                            var W = R.bag;
                            if (W) {
                                                if (MMP.settings.setItems.setAllItems) {
                                                    //设置全部道具
                                                    var items = cfg.item_definition.item.map_;
                                                    for (var id in items) {
                                                        if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                            for (let item of W["items"]) {
                                                                if (item.item_id == id) {
                                                                    cfg.item_definition.item.get(item.item_id);
                                                                    s._item_map[item.item_id] = {
                                                                        item_id: item.item_id,
                                                                        count: item.stack,
                                                                        category: items[item.item_id].category
                                                                    };
                                                                    break;
                                                                }
                                                            }
                                                        } else {
                                                            cfg.item_definition.item.get(id);
                                                            s._item_map[id] = {
                                                                item_id: id,
                                                                count: 1,
                                                                category: items[id].category
                                                            }; //获取物品列表并添加
                                                        }
                                                    }
                                                } else {
                                if (W['items'])
                                    for (var q = 0; q < W['items']['length']; q++) {
                                        var Q = W['items'][q]['item_id'],
                                        _ = W['items'][q]['stack'],
                                        b = cfg['item_definition'].item.get(Q);
                                        b && (s['_item_map'][Q] = {
                                                item_id: Q,
                                                count: _,
                                                category: b['category']
                                            }, 1 == b['category'] && 3 == b.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: Q
                                            }, function () {}));
                                    }
                                if (W['daily_gain_record'])
                                    for (var D = W['daily_gain_record'], q = 0; q < D['length']; q++) {
                                        var c = D[q]['limit_source_id'];
                                        s['_daily_gain_record'][c] = {};
                                        var E = D[q]['record_time'];
                                        s['_daily_gain_record'][c]['record_time'] = E;
                                        var h = D[q]['records'];
                                        if (h)
                                            for (var e = 0; e < h['length']; e++)
                                                s['_daily_gain_record'][c][h[e]['item_id']] = h[e]['count'];
                                    }
                            }
                        }
                                        }
                    });
                },
                R['onFetchSuccess'] = function (B) {
                    this['_item_map'] = {},
                    this['_daily_gain_record'] = {};
                    var s = B['bag_info'];
                    if (s) {
                        var U = s.bag;
                        if (U) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of U["items"]) {
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
                            if (U['items'])
                                for (var R = 0; R < U['items']['length']; R++) {
                                    var W = U['items'][R]['item_id'],
                                    q = U['items'][R]['stack'],
                                    Q = cfg['item_definition'].item.get(W);
                                    Q && (this['_item_map'][W] = {
                                            item_id: W,
                                            count: q,
                                            category: Q['category']
                                        }, 1 == Q['category'] && 3 == Q.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                            item_id: W
                                        }, function () {}));
                                }
                            if (U['daily_gain_record'])
                                for (var _ = U['daily_gain_record'], R = 0; R < _['length']; R++) {
                                    var b = _[R]['limit_source_id'];
                                    this['_daily_gain_record'][b] = {};
                                    var D = _[R]['record_time'];
                                    this['_daily_gain_record'][b]['record_time'] = D;
                                    var c = _[R]['records'];
                                    if (c)
                                        for (var E = 0; E < c['length']; E++)
                                            this['_daily_gain_record'][b][c[E]['item_id']] = c[E]['count'];
                                }
                        }
                    }
                                }
                },
                R['find_item'] = function (B) {
                    var s = this['_item_map'][B];
                    return s ? {
                        item_id: s['item_id'],
                        category: s['category'],
                        count: s['count']
                    }
                     : null;
                },
                R['get_item_count'] = function (B) {
                    var s = this['find_item'](B);
                    if (s)
                        return s['count'];
                    if ('100001' == B) {
                        for (var U = 0, R = 0, W = GameMgr.Inst['free_diamonds']; R < W['length']; R++) {
                            var q = W[R];
                            GameMgr.Inst['account_numerical_resource'][q] && (U += GameMgr.Inst['account_numerical_resource'][q]);
                        }
                        for (var Q = 0, _ = GameMgr.Inst['paid_diamonds']; Q < _['length']; Q++) {
                            var q = _[Q];
                            GameMgr.Inst['account_numerical_resource'][q] && (U += GameMgr.Inst['account_numerical_resource'][q]);
                        }
                        return U;
                    }
                    if ('100004' == B) {
                        for (var b = 0, D = 0, c = GameMgr.Inst['free_pifuquans']; D < c['length']; D++) {
                            var q = c[D];
                            GameMgr.Inst['account_numerical_resource'][q] && (b += GameMgr.Inst['account_numerical_resource'][q]);
                        }
                        for (var E = 0, h = GameMgr.Inst['paid_pifuquans']; E < h['length']; E++) {
                            var q = h[E];
                            GameMgr.Inst['account_numerical_resource'][q] && (b += GameMgr.Inst['account_numerical_resource'][q]);
                        }
                        return b;
                    }
                    return '100002' == B ? GameMgr.Inst['account_data'].gold : 0;
                },
                R['find_items_by_category'] = function (B, s) {
                    var U = [];
                    for (var R in this['_item_map'])
                        this['_item_map'][R]['category'] == B && this['_item_map'][R]['count'] && U.push({
                            item_id: this['_item_map'][R]['item_id'],
                            category: this['_item_map'][R]['category'],
                            count: this['_item_map'][R]['count']
                        });
                    return s && U.sort(function (B, U) {
                        return cfg['item_definition'].item.get(B['item_id'])[s] - cfg['item_definition'].item.get(U['item_id'])[s];
                    }),
                    U;
                },
                R['update_data'] = function (s) {
                    for (var U = 0; U < s['length']; U++) {
                        var R = s[U]['item_id'],
                        W = s[U]['stack'];
                        if (W > 0) {
                            this['_item_map']['hasOwnProperty'](R['toString']()) ? this['_item_map'][R]['count'] = W : this['_item_map'][R] = {
                                item_id: R,
                                count: W,
                                category: cfg['item_definition'].item.get(R)['category']
                            };
                            var q = cfg['item_definition'].item.get(R);
                            1 == q['category'] && 3 == q.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                item_id: R
                            }, function () {}),
                            5 == q['category'] && (this['new_bag_item_ids'].push(R), this['new_zhuangban_item_ids'][R] = 1),
                            8 != q['category'] || q['item_expire'] || this['new_cg_ids'].push(R);
                        } else if (this['_item_map']['hasOwnProperty'](R['toString']())) {
                            var Q = cfg['item_definition'].item.get(R);
                            Q && 5 == Q['category'] && B['UI_Sushe']['on_view_remove'](R),
                            this['_item_map'][R] = 0,
                            delete this['_item_map'][R];
                        }
                    }
                    this.Inst && this.Inst['when_data_change']();
                    for (var U = 0; U < s['length']; U++) {
                        var R = s[U]['item_id'];
                        if (this['_item_listener']['hasOwnProperty'](R['toString']()))
                            for (var _ = this['_item_listener'][R], b = 0; b < _['length']; b++)
                                _[b].run();
                    }
                    for (var U = 0; U < this['_all_item_listener']['length']; U++)
                        this['_all_item_listener'][U].run();
                },
                R['update_daily_gain_data'] = function (B) {
                    var s = B['update_daily_gain_record'];
                    if (s)
                        for (var U = 0; U < s['length']; U++) {
                            var R = s[U]['limit_source_id'];
                            this['_daily_gain_record'][R] || (this['_daily_gain_record'][R] = {});
                            var W = s[U]['record_time'];
                            this['_daily_gain_record'][R]['record_time'] = W;
                            var q = s[U]['records'];
                            if (q)
                                for (var Q = 0; Q < q['length']; Q++)
                                    this['_daily_gain_record'][R][q[Q]['item_id']] = q[Q]['count'];
                        }
                },
                R['get_item_daily_record'] = function (B, s) {
                    return this['_daily_gain_record'][B] ? this['_daily_gain_record'][B]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][B]['record_time']) ? this['_daily_gain_record'][B][s] ? this['_daily_gain_record'][B][s] : 0 : 0 : 0 : 0;
                },
                R['add_item_listener'] = function (B, s) {
                    this['_item_listener']['hasOwnProperty'](B['toString']()) || (this['_item_listener'][B] = []),
                    this['_item_listener'][B].push(s);
                },
                R['remove_item_listener'] = function (B, s) {
                    var U = this['_item_listener'][B];
                    if (U)
                        for (var R = 0; R < U['length']; R++)
                            if (U[R] === s) {
                                U[R] = U[U['length'] - 1],
                                U.pop();
                                break;
                            }
                },
                R['add_all_item_listener'] = function (B) {
                    this['_all_item_listener'].push(B);
                },
                R['remove_all_item_listener'] = function (B) {
                    for (var s = this['_all_item_listener'], U = 0; U < s['length']; U++)
                        if (s[U] === B) {
                            s[U] = s[s['length'] - 1],
                            s.pop();
                            break;
                        }
                },
                R['removeAllBagNew'] = function () {
                    this['new_bag_item_ids'] = [];
                },
                R['removeAllCGNew'] = function () {
                    this['new_cg_ids'] = [];
                },
                R['removeZhuangBanNew'] = function (B) {
                    for (var s = 0, U = B; s < U['length']; s++) {
                        var R = U[s];
                        delete this['new_zhuangban_item_ids'][R];
                    }
                },
                R['checkItemEnough'] = function (B) {
                    for (var s = B['split'](','), U = 0, W = s; U < W['length']; U++) {
                        var q = W[U];
                        if (q) {
                            var Q = q['split']('-');
                            if (R['get_item_count'](Number(Q[0])) < Number(Q[1]))
                                return !1;
                        }
                    }
                    return !0;
                },
                R['prototype']['have_red_point'] = function () {
                    return this['page_cg']['have_redpoint']();
                },
                R['prototype']['onCreate'] = function () {
                    var s = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || s.hide(Laya['Handler']['create'](s, function () {
                                return s['closeHandler'] ? (s['closeHandler'].run(), s['closeHandler'] = null, void 0) : (B['UI_Lobby'].Inst['enable'] = !0, void 0);
                            }));
                    }, null, !1),
                    this['container_content'] = this.me['getChildByName']('content');
                    for (var U = function (B) {
                        R.tabs.push(R['container_content']['getChildByName']('tabs')['getChildByName']('btn' + B)),
                        R.tabs[B]['clickHandler'] = Laya['Handler']['create'](R, function () {
                            s['select_index'] != B && s['on_change_tab'](B);
                        }, null, !1);
                    }, R = this, W = 0; 5 > W; W++)
                        U(W);
                    this['page_item'] = new B['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                    this['page_gift'] = new B['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                    this['page_skin'] = new B['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                    this['page_cg'] = new B['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                },
                R['prototype'].show = function (s, U) {
                    var R = this;
                    void 0 === s && (s = 0),
                    void 0 === U && (U = null),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['closeHandler'] = U,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        R['locking'] = !1;
                    }),
                    this['on_change_tab'](s),
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                R['prototype']['onSkinYuLanBack'] = function () {
                    var s = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        s['locking'] = !1;
                    }),
                    this['page_skin'].me['visible'] = !0,
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                R['prototype'].hide = function (s) {
                    var U = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 200),
                    B['UIBase']['anim_alpha_out'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        U['locking'] = !1,
                        U['enable'] = !1,
                        s && s.run();
                    });
                },
                R['prototype']['onDisable'] = function () {
                    this['page_skin']['close'](),
                    this['page_item']['close'](),
                    this['page_gift']['close'](),
                    this['page_cg']['close']();
                },
                R['prototype']['on_change_tab'] = function (B) {
                    this['select_index'] = B;
                    for (var U = 0; U < this.tabs['length']; U++)
                        this.tabs[U].skin = game['Tools']['localUISrc'](B == U ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[U]['getChildAt'](0)['color'] = B == U ? '#d9b263' : '#8cb65f';
                    switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), B) {
                    case 0:
                        this['page_item'].show(s['daoju']);
                        break;
                    case 1:
                        this['page_gift'].show();
                        break;
                    case 2:
                        this['page_item'].show(s.view);
                        break;
                    case 3:
                        this['page_skin'].show();
                        break;
                    case 4:
                        this['page_cg'].show();
                    }
                },
                R['prototype']['when_data_change'] = function () {
                    this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                    this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                },
                R['prototype']['on_cg_change'] = function () {
                    this['page_cg']['when_update_data']();
                },
                R['prototype']['refreshRedpoint'] = function () {
                    this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                },
                R['_item_map'] = {},
                R['_item_listener'] = {},
                R['_all_item_listener'] = [],
                R['_daily_gain_record'] = {},
                R['new_bag_item_ids'] = [],
                R['new_zhuangban_item_ids'] = {},
                R['new_cg_ids'] = [],
                R.Inst = null,
                R;
            }
            (B['UIBase']);
            B['UI_Bag'] = U;
        }
        (uiscript || (uiscript = {}));
        













        // 修改牌桌上角色
        !function (B) {
            var s = function () {
                function s() {
                    var s = this;
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
                            s['loaded_player_count'] = B['ready_id_list']['length'],
                            s['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](s['loaded_player_count'], s['real_player_count']);
                        }));
                }
                return Object['defineProperty'](s, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new s() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                s['prototype']['OpenConnect'] = function (s, U, R, W) {
                    var q = this;
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    B['Scene_Lobby'].Inst && B['Scene_Lobby'].Inst['active'] && (B['Scene_Lobby'].Inst['active'] = !1),
                    B['Scene_Huiye'].Inst && B['Scene_Huiye'].Inst['active'] && (B['Scene_Huiye'].Inst['active'] = !1),
                    this['Close'](),
                    view['BgmListMgr']['stopBgm'](),
                    this['is_ob'] = !1,
                    Laya['timer'].once(500, this, function () {
                        q.url = '',
                        q['token'] = s,
                        q['game_uuid'] = U,
                        q['server_location'] = R,
                        GameMgr.Inst['ingame'] = !0,
                        GameMgr.Inst['mj_server_location'] = R,
                        GameMgr.Inst['mj_game_token'] = s,
                        GameMgr.Inst['mj_game_uuid'] = U,
                        q['playerreconnect'] = W,
                        q['_setState'](B['EConnectState']['tryconnect']),
                        q['load_over'] = !1,
                        q['loaded_player_count'] = 0,
                        q['real_player_count'] = 0,
                        q['lb_index'] = 0,
                        q['_fetch_gateway'](0);
                    }),
                    Laya['timer'].loop(300000, this, this['reportInfo']);
                },
                s['prototype']['reportInfo'] = function () {
                    this['connect_state'] == B['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                        client_type: 'web',
                        route_type: 'game',
                        route_index: B['LobbyNetMgr']['root_id_lst'][B['LobbyNetMgr'].Inst['choosed_index']],
                        route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                        connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                        reconnect_count: this['_report_reconnect_count']
                    });
                },
                s['prototype']['Close'] = function () {
                    this['load_over'] = !1,
                    app.Log.log('MJNetMgr close'),
                    this['_setState'](B['EConnectState'].none),
                    app['NetAgent']['Close2MJ'](),
                    this.url = '',
                    Laya['timer']['clear'](this, this['reportInfo']);
                },
                s['prototype']['_OnConnent'] = function (s) {
                    app.Log.log('MJNetMgr _OnConnent event:' + s),
                    s == Laya['Event']['CLOSE'] || s == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == B['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == B['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](B['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](B['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2008)), B['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == B['EConnectState']['reconnecting'] && this['_Reconnect']()) : s == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == B['EConnectState']['tryconnect'] || this['connect_state'] == B['EConnectState']['reconnecting']) && ((this['connect_state'] = B['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](B['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                },
                s['prototype']['_Reconnect'] = function () {
                    var s = this;
                    B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState'].none || B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState']['disconnect'] ? this['_setState'](B['EConnectState']['disconnect']) : B['LobbyNetMgr'].Inst['connect_state'] == B['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](B['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            s['connect_state'] == B['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + s['reconnect_count']), app['NetAgent']['connect2MJ'](s.url, Laya['Handler']['create'](s, s['_OnConnent'], null, !1), 'local' == s['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                },
                s['prototype']['_try_to_linknext'] = function () {
                    this['link_index']++,
                    this.url = '',
                    app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                    this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? B['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](B['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                },
                s['prototype']['GetAuthData'] = function () {
                    return {
                        account_id: GameMgr.Inst['account_id'],
                        token: this['token'],
                        game_uuid: this['game_uuid'],
                        gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                    };
                },
                s['prototype']['_fetch_gateway'] = function (s) {
                    var U = this;
                    if (B['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= B['LobbyNetMgr'].Inst.urls['length'])
                        return uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut'](), this['_setState'](B['EConnectState'].none), void 0;
                    this.urls = [],
                    this['link_index'] = -1,
                    app.Log.log('mj _fetch_gateway retry_count:' + s);
                    var R = function (R) {
                        var W = JSON['parse'](R);
                        if (app.Log.log('mj _fetch_gateway func_success data = ' + R), W['maintenance'])
                            U['_setState'](B['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut']();
                        else if (W['servers'] && W['servers']['length'] > 0) {
                            for (var q = W['servers'], Q = B['Tools']['deal_gateway'](q), _ = 0; _ < Q['length']; _++)
                                U.urls.push({
                                    name: '___' + _,
                                    url: Q[_]
                                });
                            U['link_index'] = -1,
                            U['_try_to_linknext']();
                        } else
                            1 > s ? Laya['timer'].once(1000, U, function () {
                                U['_fetch_gateway'](s + 1);
                            }) : B['LobbyNetMgr'].Inst['polling_connect'] ? (U['lb_index']++, U['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](60)), U['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && B['Scene_MJ'].Inst['ForceOut'](), U['_setState'](B['EConnectState'].none));
                    },
                    W = function () {
                        app.Log.log('mj _fetch_gateway func_error'),
                        1 > s ? Laya['timer'].once(500, U, function () {
                            U['_fetch_gateway'](s + 1);
                        }) : B['LobbyNetMgr'].Inst['polling_connect'] ? (U['lb_index']++, U['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](58)), U['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || B['Scene_MJ'].Inst['ForceOut'](), U['_setState'](B['EConnectState'].none));
                    },
                    q = function (B) {
                        var s = new Laya['HttpRequest']();
                        s.once(Laya['Event']['COMPLETE'], U, function (B) {
                            R(B);
                        }),
                        s.once(Laya['Event']['ERROR'], U, function () {
                            W();
                        });
                        var q = [];
                        q.push('If-Modified-Since'),
                        q.push('0'),
                        B += '?service=ws-game-gateway',
                        B += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                        B += '&location=' + U['server_location'],
                        B += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                        s.send(B, '', 'get', 'text', q),
                        app.Log.log('mj _fetch_gateway func_fetch url = ' + B);
                    };
                    B['LobbyNetMgr'].Inst['polling_connect'] ? q(B['LobbyNetMgr'].Inst.urls[this['lb_index']]) : q(B['LobbyNetMgr'].Inst['lb_url']);
                },
                s['prototype']['_setState'] = function (s) {
                    this['connect_state'] = s,
                    GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (s == B['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : s == B['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : s == B['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : s == B['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : s == B['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                },
                s['prototype']['_ConnectSuccess'] = function () {
                    var s = this;
                    app.Log.log('MJNetMgr _ConnectSuccess '),
                    this['load_over'] = !1,
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (U, R) {
                        if (U || R['error'])
                            uiscript['UIMgr'].Inst['showNetReqError']('authGame', U, R), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                        else {
                            app.Log.log('麻将桌验证通过：' + JSON['stringify'](R)),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                            // 强制打开便捷提示
                                            if (MMP.settings.setbianjietishi) {
                                                R['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                            }
                                            // END
                            var W = [],
                            q = 0;
                            view['DesktopMgr']['player_link_state'] = R['state_list'];
                            var Q = B['Tools']['strOfLocalization'](2003),
                            _ = R['game_config'].mode,
                            b = view['ERuleMode']['Liqi4'];
                            _.mode < 10 ? (b = view['ERuleMode']['Liqi4'], s['real_player_count'] = 4) : _.mode < 20 && (b = view['ERuleMode']['Liqi3'], s['real_player_count'] = 3);
                            for (var D = 0; D < s['real_player_count']; D++)
                                W.push(null);
                            _['extendinfo'] && (Q = B['Tools']['strOfLocalization'](2004)),
                            _['detail_rule'] && _['detail_rule']['ai_level'] && (1 === _['detail_rule']['ai_level'] && (Q = B['Tools']['strOfLocalization'](2003)), 2 === _['detail_rule']['ai_level'] && (Q = B['Tools']['strOfLocalization'](2004)));
                            for (var c = B['GameUtility']['get_default_ai_skin'](), E = B['GameUtility']['get_default_ai_character'](), D = 0; D < R['seat_list']['length']; D++) {
                                var h = R['seat_list'][D];
                                if (0 == h) {
                                    W[D] = {
                                        nickname: Q,
                                        avatar_id: c,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: E,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: c,
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
                                                            W[D].avatar_id = skin.id;
                                                            W[D].character.charid = skin.character_id;
                                                            W[D].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        W[D].nickname = '[BOT]' + W[D].nickname;
                                                    }
                               } else {
                                    q++;
                                    for (var e = 0; e < R['players']['length']; e++)
                                        if (R['players'][e]['account_id'] == h) {
                                            W[D] = R['players'][e];
                                                            //修改牌桌上人物头像及皮肤
                                                            if (W[D].account_id == GameMgr.Inst.account_id) {
                                                                for (let item of uiscript.UI_Sushe.characters){
                                                                    if (item['charid'] == uiscript.UI_Sushe.main_character_id){
                                                                        W[D].character = item;
                                                                    }
                                                                }
                                                                W[D].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                                W[D].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                                W[D].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                                W[D].title = GameMgr.Inst.account_data.title;
                                                                if (MMP.settings.nickname != '') {
                                                                    W[D].nickname = MMP.settings.nickname;
                                                                }
                                                            } else if (MMP.settings.randomPlayerDefSkin && (W[D].avatar_id == 400101 || W[D].avatar_id == 400201)) {
                                                                //玩家如果用了默认皮肤也随机换
                                                                let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                                let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                                let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                                // 修复皮肤错误导致无法进入游戏的bug
                                                                if (skin.id != 400000 && skin.id != 400001) {
                                                                    W[D].avatar_id = skin.id;
                                                                    W[D].character.charid = skin.character_id;
                                                                    W[D].character.skin = skin.id;
                                                                }
                                                            }
                                                            if (MMP.settings.showServer == true) {
                                                                let server = game.Tools.get_zone_id(W[D].account_id);
                                                                if (server == 1) {
                                                                    W[D].nickname = '[CN]' + W[D].nickname;
                                                                } else if (server == 2) {
                                                                    W[D].nickname = '[JP]' + W[D].nickname;
                                                                } else if (server == 3) {
                                                                    W[D].nickname = '[EN]' + W[D].nickname;
                                                                } else {
                                                                    W[D].nickname = '[??]' + W[D].nickname;
                                                                }
                                                            }
                                                            // END
                                            break;
                                        }
                                }
                            }
                            for (var D = 0; D < s['real_player_count']; D++)
                                null == W[D] && (W[D] = {
                                        account: 0,
                                        nickname: B['Tools']['strOfLocalization'](2010),
                                        avatar_id: c,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: E,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: c,
                                            is_upgraded: !1
                                        }
                                    });
                            s['loaded_player_count'] = R['ready_id_list']['length'],
                            s['_AuthSuccess'](W, R['is_game_start'], R['game_config']['toJSON']());
                        }
                    });
                },
                s['prototype']['_AuthSuccess'] = function (s, U, R) {
                    var W = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                round_id: view['DesktopMgr'].Inst['round_id'],
                                step: view['DesktopMgr'].Inst['current_step']
                            }, function (s, U) {
                                s || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', s, U), B['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](U)), U['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](U['game_restore'])));
                            });
                        })) : B['Scene_MJ'].Inst['openMJRoom'](R, s, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](R)), s, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](W, function () {
                                    U ? Laya['timer']['frameOnce'](10, W, function () {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (s, U) {
                                            app.Log.log('syncGame ' + JSON['stringify'](U)),
                                            s || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', s, U), B['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), W['_PlayerReconnectSuccess'](U));
                                        });
                                    }) : Laya['timer']['frameOnce'](10, W, function () {
                                        app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (s, U) {
                                            s || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', s, U), B['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), W['_EnterGame'](U), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                    });
                                }));
                        }), Laya['Handler']['create'](this, function (B) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * B);
                        }, null, !1));
                },
                s['prototype']['_EnterGame'] = function (s) {
                    app.Log.log('正常进入游戏: ' + JSON['stringify'](s)),
                    s['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : s['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](s['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                },
                s['prototype']['_PlayerReconnectSuccess'] = function (s) {
                    app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](s)),
                    s['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2011)), B['Scene_MJ'].Inst['GameEnd']()) : s['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](s['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](B['Tools']['strOfLocalization'](2012)), B['Scene_MJ'].Inst['ForceOut']());
                },
                s['prototype']['_SendDebugInfo'] = function () {},
                s['prototype']['OpenConnectObserve'] = function (s, U) {
                    var R = this;
                    this['is_ob'] = !0,
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    this['Close'](),
                    view['AudioMgr']['StopMusic'](),
                    Laya['timer'].once(500, this, function () {
                        R['server_location'] = U,
                        R['ob_token'] = s,
                        R['_setState'](B['EConnectState']['tryconnect']),
                        R['lb_index'] = 0,
                        R['_fetch_gateway'](0);
                    });
                },
                s['prototype']['_ConnectSuccessOb'] = function () {
                    var s = this;
                    app.Log.log('MJNetMgr _ConnectSuccessOb '),
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                        token: this['ob_token']
                    }, function (U, R) {
                        U || R['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', U, R), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](R)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (U, R) {
                                if (U || R['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('startObserve', U, R), B['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    var W = R.head,
                                    q = W['game_config'].mode,
                                    Q = [],
                                    _ = B['Tools']['strOfLocalization'](2003),
                                    b = view['ERuleMode']['Liqi4'];
                                    q.mode < 10 ? (b = view['ERuleMode']['Liqi4'], s['real_player_count'] = 4) : q.mode < 20 && (b = view['ERuleMode']['Liqi3'], s['real_player_count'] = 3);
                                    for (var D = 0; D < s['real_player_count']; D++)
                                        Q.push(null);
                                    q['extendinfo'] && (_ = B['Tools']['strOfLocalization'](2004)),
                                    q['detail_rule'] && q['detail_rule']['ai_level'] && (1 === q['detail_rule']['ai_level'] && (_ = B['Tools']['strOfLocalization'](2003)), 2 === q['detail_rule']['ai_level'] && (_ = B['Tools']['strOfLocalization'](2004)));
                                    for (var c = B['GameUtility']['get_default_ai_skin'](), E = B['GameUtility']['get_default_ai_character'](), D = 0; D < W['seat_list']['length']; D++) {
                                        var h = W['seat_list'][D];
                                        if (0 == h)
                                            Q[D] = {
                                                nickname: _,
                                                avatar_id: c,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: E,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: c,
                                                    is_upgraded: !1
                                                }
                                            };
                                        else
                                            for (var e = 0; e < W['players']['length']; e++)
                                                if (W['players'][e]['account_id'] == h) {
                                                    Q[D] = W['players'][e];
                                                    break;
                                                }
                                    }
                                    for (var D = 0; D < s['real_player_count']; D++)
                                        null == Q[D] && (Q[D] = {
                                                account: 0,
                                                nickname: B['Tools']['strOfLocalization'](2010),
                                                avatar_id: c,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: E,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: c,
                                                    is_upgraded: !1
                                                }
                                            });
                                    s['_StartObSuccuess'](Q, R['passed'], W['game_config']['toJSON'](), W['start_time']);
                                }
                            }));
                    });
                },
                s['prototype']['_StartObSuccuess'] = function (s, U, R, W) {
                    var q = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](W, U);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), B['Scene_MJ'].Inst['openMJRoom'](R, s, Laya['Handler']['create'](this, function () {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](R)), s, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](q, function () {
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, q, function () {
                                            GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](W, U);
                                        });
                                    }));
                            }), Laya['Handler']['create'](this, function (B) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * B);
                            }, null, !1)));
                },
                s['_Inst'] = null,
                s;
            }
            ();
            B['MJNetMgr'] = s;
        }
        (game || (game = {}));
        











        // 读取战绩
        !function (B) {
            var s = function (s) {
                function U() {
                    var B = s.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
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
                    U.Inst = B,
                    B;
                }
                return __extends(U, s),
                U['prototype']['onCreate'] = function () {
                    var s = this;
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
                        s['btn_addfriend']['visible'] = !1,
                        s['btn_report'].x = 343,
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                            target_id: s['account_id']
                        }, function () {});
                    }, null, !1),
                    this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                    this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                        B['UI_Report_Nickname'].Inst.show(s['account_id']);
                    }),
                    this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || s['close']();
                    }, null, !1),
                    this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['close']();
                    }, null, !1),
                    this.note = new B['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                    this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                    this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || 1 != s['tab_index'] && s['changeMJCategory'](1);
                    }, null, !1),
                    this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                    this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || 2 != s['tab_index'] && s['changeMJCategory'](2);
                    }, null, !1),
                    this['tab_note'] = this.root['getChildByName']('tab_note'),
                    this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? B['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : s['container_info']['visible'] && (s['container_info']['visible'] = !1, s['tab_info4'].skin = s['tab_img_dark'], s['tab_info3'].skin = s['tab_img_dark'], s['tab_note'].skin = s['tab_img_chosen'], s['tab_index'] = 3, s.note.show()));
                    }, null, !1),
                    this['locking'] = !1;
                },
                U['prototype'].show = function (s, U, R, W, q) {
                    var Q = this;
                    void 0 === U && (U = 1),
                    void 0 === R && (R = 2),
                    void 0 === W && (W = 1),
                    void 0 === q && (q = ''),
                    GameMgr.Inst['BehavioralStatistics'](14),
                    this['account_id'] = s,
                    this['show_name'] = q,
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this.root.y = this['origin_y'],
                    this['player_data'] = null,
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            Q['locking'] = !1;
                        })),
                    this['detail_data']['reset'](),
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                        account_id: s
                    }, function (U, R) {
                        U || R['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', U, R) : B['UI_Shilian']['now_season_info'] && 1001 == B['UI_Shilian']['now_season_info']['season_id'] && 3 != B['UI_Shilian']['get_cur_season_state']() ? (Q['detail_data']['setData'](R), Q['changeMJCategory'](Q['tab_index'], Q['game_category'], Q['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                            account_id: s
                        }, function (s, U) {
                            s || U['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', s, U) : (R['season_info'] = U['season_info'], Q['detail_data']['setData'](R), Q['changeMJCategory'](Q['tab_index'], Q['game_category'], Q['game_type']));
                        });
                    }),
                    this.note['init_data'](s),
                    this['refreshBaseInfo'](),
                    this['btn_report']['visible'] = s != GameMgr.Inst['account_id'],
                    this['tab_index'] = U,
                    this['game_category'] = R,
                    this['game_type'] = W,
                    this['container_info']['visible'] = !0,
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                U['prototype']['refreshBaseInfo'] = function () {
                    var s = this;
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
                    }, function (U, R) {
                        if (U || R['error'])
                            B['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', U, R);
                        else {
                            var W = R['account'];
                                            //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                            if (W.account_id == GameMgr.Inst.account_id) {
                                                W.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                    W.title = GameMgr.Inst.account_data.title;
                                                if (MMP.settings.nickname != '') {
                                                    W.nickname = MMP.settings.nickname;
                                                }
                                            }
                                            //end
                            s['player_data'] = W,
                            s['account_id'] != GameMgr.Inst['account_id'] && s['show_name'] && (W['nickname'] = s['show_name']),
                            game['Tools']['SetNickname'](s.name, W, !1, !!s['show_name']),
                            s['title'].id = game['Tools']['titleLocalization'](W['account_id'], W['title']),
                            s['level'].id = W['level'].id,
                            s['level'].id = s['player_data'][1 == s['tab_index'] ? 'level' : 'level3'].id,
                            s['level'].exp = s['player_data'][1 == s['tab_index'] ? 'level' : 'level3']['score'],
                            s['illust'].me['visible'] = !0,
                            s['account_id'] == GameMgr.Inst['account_id'] ? s['illust']['setSkin'](W['avatar_id'], 'waitingroom') : s['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](W['avatar_id']), 'waitingroom'),
                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], s['account_id']) && s['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(s['account_id']) ? (s['btn_addfriend']['visible'] = !0, s['btn_report'].x = 520) : (s['btn_addfriend']['visible'] = !1, s['btn_report'].x = 343),
                            s.note.sign['setSign'](W['signature']),
                            s['achievement_data'].show(!1, W['achievement_count']);
                        }
                    });
                },
                U['prototype']['changeMJCategory'] = function (B, s, U) {
                    void 0 === s && (s = 2),
                    void 0 === U && (U = 1),
                    this['tab_index'] = B,
                    this['container_info']['visible'] = !0,
                    this['detail_data']['changeMJCategory'](B, s, U),
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                U['prototype']['close'] = function () {
                    var s = this;
                    this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    s['locking'] = !1,
                                    s['enable'] = !1;
                                }))));
                },
                U['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                },
                U['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                    this['detail_data']['close'](),
                    this['illust']['clear'](),
                    Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                },
                U.Inst = null,
                U;
            }
            (B['UIBase']);
            B['UI_OtherPlayerInfo'] = s;
        }
        (uiscript || (uiscript = {}));
        












        // 宿舍相关
        !function (B) {
            var s = function () {
                function s(s, R) {
                    var W = this;
                    this['_scale'] = 1,
                    this['during_move'] = !1,
                    this['mouse_start_x'] = 0,
                    this['mouse_start_y'] = 0,
                    this.me = s,
                    this['container_illust'] = R,
                    this['illust'] = this['container_illust']['getChildByName']('illust'),
                    this['container_move'] = s['getChildByName']('move'),
                    this['container_move'].on('mousedown', this, function () {
                        W['during_move'] = !0,
                        W['mouse_start_x'] = W['container_move']['mouseX'],
                        W['mouse_start_y'] = W['container_move']['mouseY'];
                    }),
                    this['container_move'].on('mousemove', this, function () {
                        W['during_move'] && (W.move(W['container_move']['mouseX'] - W['mouse_start_x'], W['container_move']['mouseY'] - W['mouse_start_y']), W['mouse_start_x'] = W['container_move']['mouseX'], W['mouse_start_y'] = W['container_move']['mouseY']);
                    }),
                    this['container_move'].on('mouseup', this, function () {
                        W['during_move'] = !1;
                    }),
                    this['container_move'].on('mouseout', this, function () {
                        W['during_move'] = !1;
                    }),
                    this['btn_close'] = s['getChildByName']('btn_close'),
                    this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        W['locking'] || W['close']();
                    }, null, !1),
                    this['scrollbar'] = s['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                    this['scrollbar'].init(new Laya['Handler'](this, function (B) {
                            W['_scale'] = 1 * (1 - B) + 0.5,
                            W['illust']['scaleX'] = W['_scale'],
                            W['illust']['scaleY'] = W['_scale'],
                            W['scrollbar']['setVal'](B, 0);
                        })),
                    this['dongtai_kaiguan'] = new B['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                U.Inst['illust']['resetSkin'](),
                                W['illust']['scaleX'] = W['_scale'],
                                W['illust']['scaleY'] = W['_scale'];
                            }), new Laya['Handler'](this, function (B) {
                                U.Inst['illust']['playAnim'](B);
                            })),
                    this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](s['prototype'], 'scale', {
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
                s['prototype'].show = function (s) {
                    var R = this;
                    this['locking'] = !0,
                    this['when_close'] = s,
                    this['illust_start_x'] = this['illust'].x,
                    this['illust_start_y'] = this['illust'].y,
                    this['illust_center_x'] = this['illust'].x + 984 - 446,
                    this['illust_center_y'] = this['illust'].y + 11 - 84,
                    this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                    this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                    this['container_illust']['getChildByName']('btn')['visible'] = !1,
                    U.Inst['stopsay'](),
                    this['scale'] = 1,
                    Laya['Tween'].to(this['illust'], {
                        x: this['illust_center_x'],
                        y: this['illust_center_y']
                    }, 200),
                    B['UIBase']['anim_pop_out'](this['btn_close'], null),
                    this['during_move'] = !1,
                    Laya['timer'].once(250, this, function () {
                        R['locking'] = !1;
                    }),
                    this.me['visible'] = !0,
                    this['dongtai_kaiguan']['refresh'](U.Inst['illust']['skin_id']);
                },
                s['prototype']['close'] = function () {
                    var s = this;
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
                        s['locking'] = !1,
                        s.me['visible'] = !1,
                        s['when_close'].run();
                    });
                },
                s['prototype'].move = function (B, s) {
                    var U = this['illust'].x + B,
                    R = this['illust'].y + s;
                    U < this['illust_center_x'] - 600 ? U = this['illust_center_x'] - 600 : U > this['illust_center_x'] + 600 && (U = this['illust_center_x'] + 600),
                    R < this['illust_center_y'] - 1200 ? R = this['illust_center_y'] - 1200 : R > this['illust_center_y'] + 800 && (R = this['illust_center_y'] + 800),
                    this['illust'].x = U,
                    this['illust'].y = R;
                },
                s;
            }
            (),
            U = function (U) {
                function R() {
                    var B = U.call(this, new ui['lobby']['susheUI']()) || this;
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
                    R.Inst = B,
                    B;
                }
                return __extends(R, U),
                R['onMainSkinChange'] = function () {
                    var B = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                    B && B['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](B.path) + '/spine');
                },
                R['randomDesktopID'] = function () {
                    var s = B['UI_Sushe']['commonViewList'][B['UI_Sushe']['using_commonview_index']];
                    if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), s)
                        for (var U = 0; U < s['length']; U++)
                            s[U].slot == game['EView'].mjp ? this['now_mjp_id'] = s[U].type ? s[U]['item_id_list'][Math['floor'](Math['random']() * s[U]['item_id_list']['length'])] : s[U]['item_id'] : s[U].slot == game['EView']['desktop'] ? this['now_desktop_id'] = s[U].type ? s[U]['item_id_list'][Math['floor'](Math['random']() * s[U]['item_id_list']['length'])] : s[U]['item_id'] : s[U].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = s[U].type ? s[U]['item_id_list'][Math['floor'](Math['random']() * s[U]['item_id_list']['length'])] : s[U]['item_id']);
                },
                R.init = function (s) {
                    var U = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (W, q) {
                            if (W || q['error'])
                                B['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', W, q);
                            else {
                                if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](q)), q = JSON['parse'](JSON['stringify'](q)), q['main_character_id'] && q['characters']) {
                                    //if (U['characters'] = [], q['characters'])
                                    //    for (var Q = 0; Q < q['characters']['length']; Q++)
                                    //        U['characters'].push(q['characters'][Q]);
                                    //if (U['skin_map'] = {}, q['skins'])
                                    //    for (var Q = 0; Q < q['skins']['length']; Q++)
                                    //        U['skin_map'][q['skins'][Q]] = 1;
                                    //U['main_character_id'] = q['main_character_id'];
                                                //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                                fake_data.char_id = q.main_character_id;
                                                for (let count = 0; count < q.characters.length; count++) {
                                                    if (q.characters[count].charid == q.main_character_id) {
                                                        if (q.characters[count].extra_emoji !== undefined) {
                                                            fake_data.emoji = q.characters[count].extra_emoji;
                                                        } else {
                                                            fake_data.emoji = [];
                                                        }
                                                        fake_data.skin = q.skins[count];
                                                        fake_data.exp = q.characters[count].exp;
                                                        fake_data.level = q.characters[count].level;
                                                        fake_data.is_upgraded = q.characters[count].is_upgraded;
                                                        break;
                                                    }
                                                }
                                                U.characters = [];
        
                                                for (let count = 0; count < cfg.item_definition.character['rows_'].length; count++) {
                                                    let id = cfg.item_definition.character['rows_'][count]['id'];
                                                    let skin = cfg.item_definition.character['rows_'][count]['init_skin'];
                                                    let emoji = [];
                                                    let group = cfg.character.emoji.getGroup(id);
                                                    if (group !== undefined) {
                                                        group.forEach((element) => {
                                                            emoji.push(element.sub_id);
                                                        });
                                                        U.characters.push({
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
                                                U.main_character_id = MMP.settings.character;
                                                GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                                uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                                U.star_chars = MMP.settings.star_chars;
                                                q.character_sort = MMP.settings.star_chars;
                                                // END
                                } else
                                    U['characters'] = [], U['characters'].push({
                                        charid: '200001',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400101',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), U['characters'].push({
                                        charid: '200002',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400201',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), U['skin_map']['400101'] = 1, U['skin_map']['400201'] = 1, U['main_character_id'] = '200001';
                                if (U['send_gift_count'] = 0, U['send_gift_limit'] = 0, q['send_gift_count'] && (U['send_gift_count'] = q['send_gift_count']), q['send_gift_limit'] && (U['send_gift_limit'] = q['send_gift_limit']), q['finished_endings'])
                                    for (var Q = 0; Q < q['finished_endings']['length']; Q++)
                                        U['finished_endings_map'][q['finished_endings'][Q]] = 1;
                                if (q['rewarded_endings'])
                                    for (var Q = 0; Q < q['rewarded_endings']['length']; Q++)
                                        U['rewarded_endings_map'][q['rewarded_endings'][Q]] = 1;
                                if (U['star_chars'] = [], q['character_sort'] && (U['star_chars'] = q['character_sort']), R['hidden_characters_map'] = {}, q['hidden_characters'])
                                    for (var _ = 0, b = q['hidden_characters']; _ < b['length']; _++) {
                                        var D = b[_];
                                        R['hidden_characters_map'][D] = 1;
                                    }
                                s.run();
                            }
                        }), //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (s, R) {
                            //if (s || R['error'])
                            //    B['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', s, R);
                            //else {
                            //    U['using_commonview_index'] = R.use,
                            //    U['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                            //    var W = R['views'];
                            //    if (W)
                            //        for (var q = 0; q < W['length']; q++) {
                            //            var Q = W[q]['values'];
                            //            Q && (U['commonViewList'][W[q]['index']] = Q);
                            //        }
                            //    U['randomDesktopID'](),
                                        U.commonViewList = MMP.settings.commonViewList;
                                    U.using_commonview_index = MMP.settings.using_commonview_index;
                                    GameMgr.Inst.account_data.title = MMP.settings.title;
                                GameMgr.Inst['load_mjp_view']();
                                GameMgr.Inst['load_touming_mjp_view']();
                                    GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                                    uiscript.UI_Sushe.randomDesktopID();
                            //}
                        //}), void 0);
                },
                R['onFetchSuccess'] = function (B) {
                    var s = B['character_info'];
                    if (s) {
                        if (s['main_character_id'] && s['characters']) {
                            //if (this['characters'] = [], s['characters'])
                            //    for (var U = 0; U < s['characters']['length']; U++)
                            //        this['characters'].push(s['characters'][U]);
                            //if (this['skin_map'] = {}, s['skins'])
                            //    for (var U = 0; U < s['skins']['length']; U++)
                            //        this['skin_map'][s['skins'][U]] = 1;
                            //this['main_character_id'] = s['main_character_id'];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            fake_data.char_id = s.main_character_id;
                                            for (let count = 0; count < s.characters.length; count++) {
                                                if (s.characters[count].charid == s.main_character_id) {
                                                    if (s.characters[count].extra_emoji !== undefined) {
                                                        fake_data.emoji = s.characters[count].extra_emoji;
                                                    } else {
                                                        fake_data.emoji = [];
                                                    }
                                                    fake_data.skin = s.skins[count];
                                                    fake_data.exp = s.characters[count].exp;
                                                    fake_data.level = s.characters[count].level;
                                                    fake_data.is_upgraded = s.characters[count].is_upgraded;
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
                                            s.character_sort = MMP.settings.star_chars;
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
                        if (this['send_gift_count'] = 0, this['send_gift_limit'] = 0, s['send_gift_count'] && (this['send_gift_count'] = s['send_gift_count']), s['send_gift_limit'] && (this['send_gift_limit'] = s['send_gift_limit']), s['finished_endings'])
                            for (var U = 0; U < s['finished_endings']['length']; U++)
                                this['finished_endings_map'][s['finished_endings'][U]] = 1;
                        if (s['rewarded_endings'])
                            for (var U = 0; U < s['rewarded_endings']['length']; U++)
                                this['rewarded_endings_map'][s['rewarded_endings'][U]] = 1;
                        if (this['star_chars'] = [], s['character_sort'] && 0 != s['character_sort']['length'] && (this['star_chars'] = s['character_sort']), R['hidden_characters_map'] = {}, s['hidden_characters'])
                            for (var W = 0, q = s['hidden_characters']; W < q['length']; W++) {
                                var Q = q[W];
                                R['hidden_characters_map'][Q] = 1;
                            }
                    }
                    var _ = B['all_common_views'];
                    //if (_) {
                    //    this['using_commonview_index'] = _.use,
                    //    this['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                    //    var b = _['views'];
                    //    if (b)
                    //        for (var U = 0; U < b['length']; U++) {
                    //            var D = b[U]['values'];
                    //            D && (this['commonViewList'][b[U]['index']] = D);
                    //        }
                    //    this['randomDesktopID'](),
                    //    GameMgr.Inst['load_mjp_view'](),
                    //    GameMgr.Inst['load_touming_mjp_view']();
                    //}
                                    this.commonViewList = MMP.settings.commonViewList;
                                    this.using_commonview_index = MMP.settings.using_commonview_index;
                                    GameMgr.Inst.account_data.title = MMP.settings.title;
                                    GameMgr.Inst['load_mjp_view']();
                                    GameMgr.Inst['load_touming_mjp_view']();
                                    GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                                    this.randomDesktopID();
                },
                R['on_data_updata'] = function (s) {
                    if (s['character']) {
                        var U = JSON['parse'](JSON['stringify'](s['character']));
                        if (U['characters'])
                            for (var R = U['characters'], W = 0; W < R['length']; W++) {
                                for (var q = !1, Q = 0; Q < this['characters']['length']; Q++)
                                    if (this['characters'][Q]['charid'] == R[W]['charid']) {
                                        this['characters'][Q] = R[W],
                                        B['UI_Sushe_Visit'].Inst && B['UI_Sushe_Visit'].Inst['chara_info'] && B['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][Q]['charid'] && (B['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][Q]),
                                        q = !0;
                                        break;
                                    }
                                q || this['characters'].push(R[W]);
                            }
                        if (U['skins'])
                            for (var _ = U['skins'], W = 0; W < _['length']; W++)
                                this['skin_map'][_[W]] = 1;
                                        // START
                                        uiscript['UI_Bag'].Inst['on_skin_change']();
                                        // END
                        if (U['finished_endings']) {
                            for (var b = U['finished_endings'], W = 0; W < b['length']; W++)
                                this['finished_endings_map'][b[W]] = 1;
                            B['UI_Sushe_Visit'].Inst;
                        }
                        if (U['rewarded_endings']) {
                            for (var b = U['rewarded_endings'], W = 0; W < b['length']; W++)
                                this['rewarded_endings_map'][b[W]] = 1;
                            B['UI_Sushe_Visit'].Inst;
                        }
                    }
                },
                R['chara_owned'] = function (B) {
                    for (var s = 0; s < this['characters']['length']; s++)
                        if (this['characters'][s]['charid'] == B)
                            return !0;
                    return !1;
                },
                R['skin_owned'] = function (B) {
                    return this['skin_map']['hasOwnProperty'](B['toString']());
                },
                R['add_skin'] = function (B) {
                    this['skin_map'][B] = 1;
                },
                Object['defineProperty'](R, 'main_chara_info', {
                    get: function () {
                        for (var B = 0; B < this['characters']['length']; B++)
                            if (this['characters'][B]['charid'] == this['main_character_id'])
                                return this['characters'][B];
                        return null;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                R['on_view_remove'] = function (B) {
                    for (var s = 0; s < this['commonViewList']['length']; s++)
                        for (var U = this['commonViewList'][s], R = 0; R < U['length']; R++)
                            if (U[R]['item_id'] == B && (U[R]['item_id'] = game['GameUtility']['get_view_default_item_id'](U[R].slot)), U[R]['item_id_list']) {
                                for (var W = 0; W < U[R]['item_id_list']['length']; W++)
                                    if (U[R]['item_id_list'][W] == B) {
                                        U[R]['item_id_list']['splice'](W, 1);
                                        break;
                                    }
                                0 == U[R]['item_id_list']['length'] && (U[R].type = 0);
                            }
                    var q = cfg['item_definition'].item.get(B);
                    q.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == B && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                },
                R['add_finish_ending'] = function (B) {
                    this['finished_endings_map'][B] = 1;
                },
                R['add_reward_ending'] = function (B) {
                    this['rewarded_endings_map'][B] = 1;
                },
                R['check_all_char_repoint'] = function () {
                    for (var B = 0; B < R['characters']['length']; B++)
                        if (this['check_char_redpoint'](R['characters'][B]))
                            return !0;
                    return !1;
                },
                R['check_char_redpoint'] = function (B) {
                                    // 去除小红点
                    //if (R['hidden_characters_map'][B['charid']])
                        return !1;
                                    //END
                    var s = cfg.spot.spot['getGroup'](B['charid']);
                    if (s)
                        for (var U = 0; U < s['length']; U++) {
                            var W = s[U];
                            if (!(W['is_married'] && !B['is_upgraded'] || !W['is_married'] && B['level'] < W['level_limit']) && 2 == W.type) {
                                for (var q = !0, Q = 0; Q < W['jieju']['length']; Q++)
                                    if (W['jieju'][Q] && R['finished_endings_map'][W['jieju'][Q]]) {
                                        if (!R['rewarded_endings_map'][W['jieju'][Q]])
                                            return !0;
                                        q = !1;
                                    }
                                if (q)
                                    return !0;
                            }
                        }
                    var _ = cfg['item_definition']['character'].get(B['charid']);
                    if (_ && _.ur)
                        for (var b = cfg['level_definition']['character']['getGroup'](B['charid']), D = 1, c = 0, E = b; c < E['length']; c++) {
                            var h = E[c];
                            if (D > B['level'])
                                return;
                            if (h['reward'] && (!B['rewarded_level'] || -1 == B['rewarded_level']['indexOf'](D)))
                                return !0;
                            D++;
                        }
                    return !1;
                },
                R['is_char_star'] = function (B) {
                    return -1 != this['star_chars']['indexOf'](B);
                },
                R['change_char_star'] = function (B) {
                    var s = this['star_chars']['indexOf'](B);
                    -1 != s ? this['star_chars']['splice'](s, 1) : this['star_chars'].push(B);
                                    // 屏蔽网络请求
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                    //    sort: this['star_chars']
                    //}, function () {});
                                    // END
                },
                Object['defineProperty'](R['prototype'], 'select_index', {
                    get: function () {
                        return this['_select_index'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                R['prototype']['reset_select_index'] = function () {
                    this['_select_index'] = -1;
                },
                R['prototype']['onCreate'] = function () {
                    var U = this;
                    this['contianer_illust'] = this.me['getChildByName']('illust'),
                    this['illust'] = new B['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                    this['illust']['setType']('liaoshe'),
                    this['illust_rect'] = B['UIRect']['CreateFromSprite'](this['illust'].me),
                    this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                    this['chat_block'] = new B['UI_Character_Chat'](this['container_chat'], !0),
                    this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (!U['page_visit_character'].me['visible'] || !U['page_visit_character']['cannot_click_say'])
                            if (U['illust']['onClick'](), U['sound_id'])
                                U['stopsay']();
                            else {
                                if (!U['illust_showing'])
                                    return;
                                U.say('lobby_normal');
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
                    this['container_look_illust'] = new s(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                },
                R['prototype'].show = function (s) {
                    B['UI_Activity_SevenDays']['task_done'](1),
                    GameMgr.Inst['BehavioralStatistics'](15),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['page_visit_character'].me['visible'] = !1,
                    this['container_look_illust'].me['visible'] = !1;
                    for (var U = 0, W = 0; W < R['characters']['length']; W++)
                        if (R['characters'][W]['charid'] == R['main_character_id']) {
                            U = W;
                            break;
                        }
                    0 == s ? (this['change_select'](U), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                },
                R['prototype']['starup_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character']['star_up_back'](R['characters'][this['_select_index']]),
                    this['page_visit_character']['show_levelup']();
                },
                R['prototype']['spot_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character'].show(R['characters'][this['_select_index']], 2);
                },
                R['prototype']['go2Lobby'] = function () {
                    this['close'](Laya['Handler']['create'](this, function () {
                            B['UIMgr'].Inst['showLobby']();
                        }));
                },
                R['prototype']['close'] = function (s) {
                    var U = this;
                    this['illust_showing'] && B['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                        x: -30
                    }, 150, 0),
                    Laya['timer'].once(150, this, function () {
                        U['enable'] = !1,
                        s && s.run();
                    });
                },
                R['prototype']['onDisable'] = function () {
                    view['AudioMgr']['refresh_music_volume'](!1),
                    this['illust']['clear'](),
                    this['stopsay'](),
                    this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                },
                R['prototype']['hide_illust'] = function () {
                    var s = this;
                    this['illust_showing'] && (this['illust_showing'] = !1, B['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                            x: -30
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                s['contianer_illust']['visible'] = !1;
                            })));
                },
                R['prototype']['open_illust'] = function () {
                    if (!this['illust_showing'])
                        if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                            this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, B['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                x: -30
                            }, 200);
                        else {
                            for (var s = 0, U = 0; U < R['characters']['length']; U++)
                                if (R['characters'][U]['charid'] == R['main_character_id']) {
                                    s = U;
                                    break;
                                }
                            this['change_select'](s);
                        }
                },
                R['prototype']['show_page_select'] = function () {
                    this['page_select_character'].show(0);
                },
                R['prototype']['show_page_visit'] = function (B) {
                    void 0 === B && (B = 0),
                    this['page_visit_character'].show(R['characters'][this['_select_index']], B);
                },
                R['prototype']['change_select'] = function (s) {
                    this['_select_index'] = s,
                    this['illust']['clear'](),
                    this['illust_showing'] = !0;
                    var U = R['characters'][s],
                    W = cfg['item_definition']['character'].get(U['charid']);
                    if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != R['chs_fengyu_name_lst']['indexOf'](U['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != R['chs_fengyu_cv_lst']['indexOf'](U['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        this['label_name'].text = W['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                        this['label_cv'].text = W['desc_cv_' + GameMgr['client_language']],
                        this['label_cv_title'].text = 'CV',
                        'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_name'].font ? this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](0.9, 0.9), this['label_name']['leading'] = -8) : (this['label_name']['scale'](1.2, 1.2), this['label_name']['leading'] = 0) : this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](1.1, 1.1), this['label_name']['leading'] = -14) : (this['label_name']['scale'](1.25, 1.25), this['label_name']['leading'] = -3);
                        var q = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                        q.test(W['name_' + GameMgr['client_language']]) && (this['label_name']['leading'] -= 15),
                        q.test(this['label_cv'].text) && (this['label_cv']['leading'] -= 7),
                        this['label_cv']['height'] = 600,
                        'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_cv'].font ? (this['label_cv']['scale'](1, 1), this['label_cv']['leading'] = -4, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']) : (this['label_cv']['scale'](1.1, 1.1), this['label_cv']['leading'] = -9, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']);
                    } else
                        this['label_name'].text = W['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + W['desc_cv_' + GameMgr['client_language']];
                    var Q = new B['UIRect']();
                    Q.x = this['illust_rect'].x,
                    Q.y = this['illust_rect'].y,
                    Q['width'] = this['illust_rect']['width'],
                    Q['height'] = this['illust_rect']['height'],
                    this['illust']['setRect'](Q),
                    this['illust']['setSkin'](U.skin, 'full'),
                    this['contianer_illust']['visible'] = !0,
                    Laya['Tween']['clearAll'](this['contianer_illust']),
                    this['contianer_illust'].x = this['origin_illust_x'],
                    this['contianer_illust']['alpha'] = 1,
                    B['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                        x: -30
                    }, 230),
                    this['stopsay']();
                    var _ = cfg['item_definition'].skin.get(U.skin);
                    _ && _['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                },
                R['prototype']['onChangeSkin'] = function (B) {
                    R['characters'][this['_select_index']].skin = B,
                    this['change_select'](this['_select_index']),
                    R['characters'][this['_select_index']]['charid'] == R['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = B, R['onMainSkinChange']());
                                    // 屏蔽换肤请求
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                    //    character_id: R['characters'][this['_select_index']]['charid'],
                    //    skin: B
                    //}, function () {});
                                    // 保存皮肤
                },
                R['prototype'].say = function (B) {
                    var s = this,
                    U = R['characters'][this['_select_index']];
                    this['chat_id']++;
                    var W = this['chat_id'],
                    q = view['AudioMgr']['PlayCharactorSound'](U, B, Laya['Handler']['create'](this, function () {
                                Laya['timer'].once(1000, s, function () {
                                    W == s['chat_id'] && s['stopsay']();
                                });
                            }));
                    q && (this['chat_block'].show(q['words']), this['sound_id'] = q['audio_id']);
                },
                R['prototype']['stopsay'] = function () {
                    this['chat_block']['close'](!1),
                    this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                },
                R['prototype']['to_look_illust'] = function () {
                    var B = this;
                    this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                            B['illust']['playAnim']('idle'),
                            B['page_select_character'].show(0);
                        }));
                },
                R['prototype']['jump_to_char_skin'] = function (s, U) {
                    var W = this;
                    if (void 0 === s && (s = -1), void 0 === U && (U = null), s >= 0)
                        for (var q = 0; q < R['characters']['length']; q++)
                            if (R['characters'][q]['charid'] == s) {
                                this['change_select'](q);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            R.Inst['show_page_visit'](),
                            W['page_visit_character']['show_pop_skin'](),
                            W['page_visit_character']['set_jump_callback'](U);
                        }));
                },
                R['prototype']['jump_to_char_qiyue'] = function (s) {
                    var U = this;
                    if (void 0 === s && (s = -1), s >= 0)
                        for (var W = 0; W < R['characters']['length']; W++)
                            if (R['characters'][W]['charid'] == s) {
                                this['change_select'](W);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            R.Inst['show_page_visit'](),
                            U['page_visit_character']['show_qiyue']();
                        }));
                },
                R['prototype']['jump_to_char_gift'] = function (s) {
                    var U = this;
                    if (void 0 === s && (s = -1), s >= 0)
                        for (var W = 0; W < R['characters']['length']; W++)
                            if (R['characters'][W]['charid'] == s) {
                                this['change_select'](W);
                                break;
                            }
                    B['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            R.Inst['show_page_visit'](),
                            U['page_visit_character']['show_gift']();
                        }));
                },
                R['characters'] = [],
                R['chs_fengyu_name_lst'] = ['200040', '200043', '200090'],
                R['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                R['skin_map'] = {},
                R['main_character_id'] = 0,
                R['send_gift_count'] = 0,
                R['send_gift_limit'] = 0,
                R['commonViewList'] = [],
                R['using_commonview_index'] = 0,
                R['finished_endings_map'] = {},
                R['rewarded_endings_map'] = {},
                R['star_chars'] = [],
                R['hidden_characters_map'] = {},
                R.Inst = null,
                R;
            }
            (B['UIBase']);
            B['UI_Sushe'] = U;
        }
        (uiscript || (uiscript = {}));
        













        // 屏蔽改变宿舍角色的网络请求
        !function (B) {
            var s = function () {
                function s(s) {
                    var R = this;
                    this['scrollview'] = null,
                    this['select_index'] = 0,
                    this['show_index_list'] = [],
                    this['only_show_star_char'] = !1,
                    this.me = s,
                    this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U.Inst['locking'] || U.Inst['close'](Laya['Handler']['create'](R, function () {
                                B['UI_Sushe'].Inst['show_page_visit']();
                            }));
                    }, null, !1),
                    this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U.Inst['locking'] || U.Inst['close'](Laya['Handler']['create'](R, function () {
                                B['UI_Sushe'].Inst['to_look_illust']();
                            }));
                    }, null, !1),
                    this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U.Inst['locking'] || B['UI_Sushe'].Inst['jump_to_char_skin']();
                    }, null, !1),
                    this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U.Inst['locking'] || R['onChangeStarShowBtnClick']();
                    }, null, !1),
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                    this['scrollview']['setElastic'](),
                    this['dongtai_kaiguan'] = new B['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                B['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                }
                return s['prototype'].show = function (s, U) {
                    if (void 0 === U && (U = !1), this.me['visible'] = !0, s ? this.me['alpha'] = 1 : B['UIBase']['anim_alpha_in'](this.me, {
                            x: 0
                        }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), U || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var R = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, R));
                    }
                },
                s['prototype']['render_character_cell'] = function (s) {
                    var U = this,
                    R = s['index'],
                    W = s['container'],
                    q = s['cache_data'];
                    W['visible'] = !0,
                    q['index'] = R,
                    q['inited'] || (q['inited'] = !0, W['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            U['onClickAtHead'](q['index']);
                        }), q.skin = new B['UI_Character_Skin'](W['getChildByName']('btn')['getChildByName']('head')), q.bg = W['getChildByName']('btn')['getChildByName']('bg'), q['bound'] = W['getChildByName']('btn')['getChildByName']('bound'), q['btn_star'] = W['getChildByName']('btn_star'), q.star = W['getChildByName']('btn')['getChildByName']('star'), q['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                            U['onClickAtStar'](q['index']);
                        }));
                    var Q = W['getChildByName']('btn');
                    Q['getChildByName']('choose')['visible'] = R == this['select_index'];
                    var _ = this['getCharInfoByIndex'](R);
                    Q['getChildByName']('redpoint')['visible'] = B['UI_Sushe']['check_char_redpoint'](_),
                    q.skin['setSkin'](_.skin, 'bighead'),
                    Q['getChildByName']('using')['visible'] = _['charid'] == B['UI_Sushe']['main_character_id'],
                    W['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (_['is_upgraded'] ? '2.png' : '.png'));
                    var b = cfg['item_definition']['character'].get(_['charid']);
                    'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? q['bound'].skin = b.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (_['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (_['is_upgraded'] ? '2.png' : '.png')) : b.ur ? (q['bound'].pos(-10, -2), q['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (_['is_upgraded'] ? '6.png' : '5.png'))) : (q['bound'].pos(4, 20), q['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (_['is_upgraded'] ? '4.png' : '3.png'))),
                    q['btn_star']['visible'] = this['select_index'] == R,
                    q.star['visible'] = B['UI_Sushe']['is_char_star'](_['charid']) || this['select_index'] == R;
                    var D = cfg['item_definition']['character'].find(_['charid']),
                    c = Q['getChildByName']('label_name'),
                    E = D['name_' + GameMgr['client_language'] + '2'] ? D['name_' + GameMgr['client_language'] + '2'] : D['name_' + GameMgr['client_language']];
                    if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        q.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (B['UI_Sushe']['is_char_star'](_['charid']) ? 'l' : 'd') + (_['is_upgraded'] ? '1.png' : '.png')),
                        c.text = E['replace']('-', '|')['replace'](/\./g, '·');
                        var h = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                        c['leading'] = h.test(E) ? -15 : 0;
                    } else
                        q.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (B['UI_Sushe']['is_char_star'](_['charid']) ? 'l.png' : 'd.png')), c.text = E;
                    ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == _['charid'] ? (c['scaleX'] = 0.67, c['scaleY'] = 0.57) : (c['scaleX'] = 0.7, c['scaleY'] = 0.6));
                },
                s['prototype']['onClickAtHead'] = function (s) {
                    if (this['select_index'] == s) {
                        var U = this['getCharInfoByIndex'](s);
                        if (U['charid'] != B['UI_Sushe']['main_character_id'])
                            if (B['UI_PiPeiYuYue'].Inst['enable'])
                                B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                            else {
                                var R = B['UI_Sushe']['main_character_id'];
                                B['UI_Sushe']['main_character_id'] = U['charid'],
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    character_id: B['UI_Sushe']['main_character_id']
                                }, function () {}),
                                GameMgr.Inst['account_data']['avatar_id'] = U.skin,
                                B['UI_Sushe']['onMainSkinChange']();
                                            // 保存人物和皮肤
                                            MMP.settings.character = U.charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = U.skin;
                                            MMP.saveSettings();
                                            // END
                                for (var W = 0; W < this['show_index_list']['length']; W++)
                                    this['getCharInfoByIndex'](W)['charid'] == R && this['scrollview']['wantToRefreshItem'](W);
                                this['scrollview']['wantToRefreshItem'](s);
                            }
                    } else {
                        var q = this['select_index'];
                        this['select_index'] = s,
                        q >= 0 && this['scrollview']['wantToRefreshItem'](q),
                        this['scrollview']['wantToRefreshItem'](s),
                        B['UI_Sushe'].Inst['change_select'](this['show_index_list'][s]);
                    }
                },
                s['prototype']['onClickAtStar'] = function (s) {
                    if (B['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](s)['charid']), this['only_show_star_char'])
                        this['scrollview']['wantToRefreshItem'](s);
                    else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var U = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                        this['scrollview'].rate = Math.min(1, Math.max(0, U));
                    }
                                // 保存人物和皮肤
                                MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                                MMP.saveSettings();
                                // END
                },
                s['prototype']['close'] = function (s) {
                    var U = this;
                    this.me['visible'] && (s ? this.me['visible'] = !1 : B['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                    U.me['visible'] = !1;
                                })));
                },
                s['prototype']['onChangeStarShowBtnClick'] = function () {
                    if (!this['only_show_star_char']) {
                        for (var s = !1, U = 0, R = B['UI_Sushe']['star_chars']; U < R['length']; U++) {
                            var W = R[U];
                            if (!B['UI_Sushe']['hidden_characters_map'][W]) {
                                s = !0;
                                break;
                            }
                        }
                        if (!s)
                            return B['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                    }
                    B['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                    this['only_show_star_char'] = !this['only_show_star_char'],
                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                    var q = this.me['getChildByName']('btn_star')['getChildAt'](1);
                    Laya['Tween']['clearAll'](q),
                    Laya['Tween'].to(q, {
                        x: this['only_show_star_char'] ? 107 : 47
                    }, 150),
                    this.show(!0, !0);
                },
                s['prototype']['getShowStarState'] = function () {
                    if (0 == B['UI_Sushe']['star_chars']['length'])
                        return this['only_show_star_char'] = !1, void 0;
                    if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                        for (var s = 0, U = B['UI_Sushe']['star_chars']; s < U['length']; s++) {
                            var R = U[s];
                            if (!B['UI_Sushe']['hidden_characters_map'][R])
                                return;
                        }
                        this['only_show_star_char'] = !1,
                        app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                    }
                },
                s['prototype']['sortShowCharsList'] = function () {
                    this['show_index_list'] = [],
                    this['select_index'] = -1;
                    for (var s = 0, U = B['UI_Sushe']['star_chars']; s < U['length']; s++) {
                        var R = U[s];
                        if (!B['UI_Sushe']['hidden_characters_map'][R])
                            for (var W = 0; W < B['UI_Sushe']['characters']['length']; W++)
                                if (B['UI_Sushe']['characters'][W]['charid'] == R) {
                                    W == B['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                    this['show_index_list'].push(W);
                                    break;
                                }
                    }
                    if (!this['only_show_star_char'])
                        for (var W = 0; W < B['UI_Sushe']['characters']['length']; W++)
                            B['UI_Sushe']['hidden_characters_map'][B['UI_Sushe']['characters'][W]['charid']] || -1 == this['show_index_list']['indexOf'](W) && (W == B['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(W));
                },
                s['prototype']['getCharInfoByIndex'] = function (s) {
                    return B['UI_Sushe']['characters'][this['show_index_list'][s]];
                },
                s;
            }
            (),
            U = function (U) {
                function R() {
                    var B = U.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                    return B['bg_width_head'] = 962,
                    B['bg_width_zhuangban'] = 1819,
                    B['bg2_delta'] = -29,
                    B['container_top'] = null,
                    B['locking'] = !1,
                    B.tabs = [],
                    B['tab_index'] = 0,
                    R.Inst = B,
                    B;
                }
                return __extends(R, U),
                R['prototype']['onCreate'] = function () {
                    var U = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U['locking'] || (1 == U['tab_index'] && U['container_zhuangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function () {
                                    U['close'](),
                                    B['UI_Sushe'].Inst['go2Lobby']();
                                }), null) : (U['close'](), B['UI_Sushe'].Inst['go2Lobby']()));
                    }, null, !1),
                    this.root = this.me['getChildByName']('root'),
                    this.bg2 = this.root['getChildByName']('bg2'),
                    this.bg = this.root['getChildByName']('bg');
                    for (var R = this.root['getChildByName']('container_tabs'), W = function (s) {
                        q.tabs.push(R['getChildAt'](s)),
                        q.tabs[s]['clickHandler'] = new Laya['Handler'](q, function () {
                            U['locking'] || U['tab_index'] != s && (1 == U['tab_index'] && U['container_zhuangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function () {
                                        U['change_tab'](s);
                                    }), null) : U['change_tab'](s));
                        });
                    }, q = this, Q = 0; Q < R['numChildren']; Q++)
                        W(Q);
                    this['container_head'] = new s(this.root['getChildByName']('container_heads')),
                    this['container_zhuangban'] = new B['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return U['locking'];
                            }));
                },
                R['prototype'].show = function (s) {
                    var U = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['container_head']['dongtai_kaiguan']['refresh'](),
                    this['tab_index'] = s,
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
                        U['locking'] = !1;
                    });
                    for (var R = 0; R < this.tabs['length']; R++) {
                        var W = this.tabs[R];
                        W.skin = game['Tools']['localUISrc'](R == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var q = W['getChildByName']('word');
                        q['color'] = R == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        q['scaleX'] = q['scaleY'] = R == this['tab_index'] ? 1.1 : 1,
                        R == this['tab_index'] && W['parent']['setChildIndex'](W, this.tabs['length'] - 1);
                    }
                },
                R['prototype']['change_tab'] = function (s) {
                    var U = this;
                    this['tab_index'] = s;
                    for (var R = 0; R < this.tabs['length']; R++) {
                        var W = this.tabs[R];
                        W.skin = game['Tools']['localUISrc'](R == s ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var q = W['getChildByName']('word');
                        q['color'] = R == s ? '#552c1c' : '#d3a86c',
                        q['scaleX'] = q['scaleY'] = R == s ? 1.1 : 1,
                        R == s && W['parent']['setChildIndex'](W, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_head']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                B['UI_Sushe'].Inst['open_illust'](),
                                U['container_head'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_head'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), B['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_zhuangban']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                U['container_zhuangban'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_zhuangban'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])),
                    Laya['timer'].once(400, this, function () {
                        U['locking'] = !1;
                    });
                },
                R['prototype']['close'] = function (s) {
                    var U = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150),
                    0 == this['tab_index'] ? B['UIBase']['anim_alpha_out'](this.root, {
                        x: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            U['container_head']['close'](!0);
                        })) : B['UIBase']['anim_alpha_out'](this.root, {
                        y: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            U['container_zhuangban']['close'](!0);
                        })),
                    Laya['timer'].once(150, this, function () {
                        U['locking'] = !1,
                        U['enable'] = !1,
                        s && s.run();
                    });
                },
                R['prototype']['onDisable'] = function () {
                    for (var s = 0; s < B['UI_Sushe']['characters']['length']; s++) {
                        var U = B['UI_Sushe']['characters'][s].skin,
                        R = cfg['item_definition'].skin.get(U);
                        R && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](R.path + '/bighead.png'));
                    }
                },
                R['prototype']['changeKaiguanShow'] = function (B) {
                    B ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                },
                R['prototype']['changeZhuangbanSlot'] = function (B) {
                    this['container_zhuangban']['changeSlotByItemId'](B);
                },
                R;
            }
            (B['UIBase']);
            B['UI_Sushe_Select'] = U;
        }
        (uiscript || (uiscript = {}));
        










        // 友人房
        !function (B) {
            var s = function () {
                function s(B) {
                    var s = this;
                    this['friends'] = [],
                    this['sortlist'] = [],
                    this.me = B,
                    this.me['visible'] = !1,
                    this['blackbg'] = B['getChildByName']('blackbg'),
                    this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || s['close']();
                    }, null, !1),
                    this.root = B['getChildByName']('root'),
                    this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                    this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return s['prototype'].show = function () {
                    var s = this;
                    this['locking'] = !0,
                    this.me['visible'] = !0,
                    this['scrollview']['reset'](),
                    this['friends'] = [],
                    this['sortlist'] = [];
                    for (var U = game['FriendMgr']['friend_list'], R = 0; R < U['length']; R++)
                        this['sortlist'].push(R);
                    this['sortlist'] = this['sortlist'].sort(function (B, s) {
                        var R = U[B],
                        W = 0;
                        if (R['state']['is_online']) {
                            var q = game['Tools']['playState2Desc'](R['state']['playing']);
                            W += '' != q ? 30000000000 : 60000000000,
                            R.base['level'] && (W += R.base['level'].id % 1000 * 10000000),
                            R.base['level3'] && (W += R.base['level3'].id % 1000 * 10000),
                            W += -Math['floor'](R['state']['login_time'] / 10000000);
                        } else
                            W += R['state']['logout_time'];
                        var Q = U[s],
                        _ = 0;
                        if (Q['state']['is_online']) {
                            var q = game['Tools']['playState2Desc'](Q['state']['playing']);
                            _ += '' != q ? 30000000000 : 60000000000,
                            Q.base['level'] && (_ += Q.base['level'].id % 1000 * 10000000),
                            Q.base['level3'] && (_ += Q.base['level3'].id % 1000 * 10000),
                            _ += -Math['floor'](Q['state']['login_time'] / 10000000);
                        } else
                            _ += Q['state']['logout_time'];
                        return _ - W;
                    });
                    for (var R = 0; R < U['length']; R++)
                        this['friends'].push({
                            f: U[R],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                    this['scrollview']['addItem'](this['friends']['length']),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            s['locking'] = !1;
                        }));
                },
                s['prototype']['close'] = function () {
                    var s = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            s['locking'] = !1,
                            s.me['visible'] = !1;
                        }));
                },
                s['prototype']['render_item'] = function (s) {
                    var U = s['index'],
                    R = s['container'],
                    q = s['cache_data'];
                    q.head || (q.head = new B['UI_Head'](R['getChildByName']('head'), 'UI_WaitingRoom'), q.name = R['getChildByName']('name'), q['state'] = R['getChildByName']('label_state'), q.btn = R['getChildByName']('btn_invite'), q['invited'] = R['getChildByName']('invited'));
                    var Q = this['friends'][this['sortlist'][U]];
                    q.head.id = game['GameUtility']['get_limited_skin_id'](Q.f.base['avatar_id']),
                    q.head['set_head_frame'](Q.f.base['account_id'], Q.f.base['avatar_frame']),
                    game['Tools']['SetNickname'](q.name, Q.f.base, GameMgr.Inst['hide_nickname']);
                    var _ = !1;
                    if (Q.f['state']['is_online']) {
                        var b = game['Tools']['playState2Desc'](Q.f['state']['playing']);
                        '' != b ? (q['state'].text = game['Tools']['strOfLocalization'](2069, [b]), q['state']['color'] = '#a9d94d', q.name['getChildByName']('name')['color'] = '#a9d94d') : (q['state'].text = game['Tools']['strOfLocalization'](2071), q['state']['color'] = '#58c4db', q.name['getChildByName']('name')['color'] = '#58c4db', _ = !0);
                    } else
                        q['state'].text = game['Tools']['strOfLocalization'](2072), q['state']['color'] = '#8c8c8c', q.name['getChildByName']('name')['color'] = '#8c8c8c';
                    Q['invited'] ? (q.btn['visible'] = !1, q['invited']['visible'] = !0) : (q.btn['visible'] = !0, q['invited']['visible'] = !1, game['Tools']['setGrayDisable'](q.btn, !_), _ && (q.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                                game['Tools']['setGrayDisable'](q.btn, !0);
                                var s = {
                                    room_id: W.Inst['room_id'],
                                    mode: W.Inst['room_mode'],
                                    nickname: GameMgr.Inst['account_data']['nickname'],
                                    verified: GameMgr.Inst['account_data']['verified'],
                                    account_id: GameMgr.Inst['account_id']
                                };
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                    target_id: Q.f.base['account_id'],
                                    type: game['EFriendMsgType']['room_invite'],
                                    content: JSON['stringify'](s)
                                }, function (s, U) {
                                    s || U['error'] ? (game['Tools']['setGrayDisable'](q.btn, !1), B['UIMgr'].Inst['showNetReqError']('sendClientMessage', s, U)) : (q.btn['visible'] = !1, q['invited']['visible'] = !0, Q['invited'] = !0);
                                });
                            }, null, !1)));
                },
                s;
            }
            (),
            U = function () {
                function s(s) {
                    var U = this;
                    this.tabs = [],
                    this['tab_index'] = 0,
                    this.me = s,
                    this['blackmask'] = this.me['getChildByName']('blackmask'),
                    this.root = this.me['getChildByName']('root'),
                    this['page_head'] = new B['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                    this['page_zhangban'] = new B['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return U['locking'];
                            }));
                    for (var R = this.root['getChildByName']('container_tabs'), W = function (s) {
                        q.tabs.push(R['getChildAt'](s)),
                        q.tabs[s]['clickHandler'] = new Laya['Handler'](q, function () {
                            U['locking'] || U['tab_index'] != s && (1 == U['tab_index'] && U['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function () {
                                        U['change_tab'](s);
                                    }), null) : U['change_tab'](s));
                        });
                    }, q = this, Q = 0; Q < R['numChildren']; Q++)
                        W(Q);
                    this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                        U['locking'] || (1 == U['tab_index'] && U['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function () {
                                    U['close'](!1);
                                }), null) : U['close'](!1));
                    }),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                        U['locking'] || (1 == U['tab_index'] && U['page_zhangban']['changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function () {
                                    U['close'](!1);
                                }), null) : U['close'](!1));
                    });
                }
                return s['prototype'].show = function () {
                    var s = this;
                    this.me['visible'] = !0,
                    this['blackmask']['alpha'] = 0,
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackmask'], {
                        alpha: 0.3
                    }, 150),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            s['locking'] = !1;
                        })),
                    this['tab_index'] = 0,
                    this['page_zhangban']['close'](!0),
                    this['page_head'].show(!0);
                    for (var U = 0; U < this.tabs['length']; U++) {
                        var R = this.tabs[U];
                        R.skin = game['Tools']['localUISrc'](U == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var W = R['getChildByName']('word');
                        W['color'] = U == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        W['scaleX'] = W['scaleY'] = U == this['tab_index'] ? 1.1 : 1,
                        U == this['tab_index'] && R['parent']['setChildIndex'](R, this.tabs['length'] - 1);
                    }
                },
                s['prototype']['change_tab'] = function (B) {
                    var s = this;
                    this['tab_index'] = B;
                    for (var U = 0; U < this.tabs['length']; U++) {
                        var R = this.tabs[U];
                        R.skin = game['Tools']['localUISrc'](U == B ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var W = R['getChildByName']('word');
                        W['color'] = U == B ? '#552c1c' : '#d3a86c',
                        W['scaleX'] = W['scaleY'] = U == B ? 1.1 : 1,
                        U == B && R['parent']['setChildIndex'](R, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                            s['page_head'].show(!1);
                        })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                            s['page_zhangban'].show(!1);
                        })),
                    Laya['timer'].once(400, this, function () {
                        s['locking'] = !1;
                    });
                },
                s['prototype']['close'] = function (s) {
                    var U = this;
                                    //修改友人房间立绘
                                    if (!(U.page_head.choosed_chara_index == 0 && U.page_head.choosed_skin_id == 0)) {
                                        for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                            if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                                uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = U.page_head.choosed_skin_id;
                                                GameMgr.Inst.account_data.avatar_id = U.page_head.choosed_skin_id;
                                                uiscript.UI_Sushe.main_character_id = U.page_head.choosed_chara_index + 200001;
                                                uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                                MMP.settings.characters[U.page_head.choosed_chara_index] = U.page_head.choosed_skin_id;
                                                MMP.saveSettings();
                                                break;
                                            }
                                        }
                                    }
                                    //end
                    this.me['visible'] && (s ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: W.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    U['locking'] = !1,
                                    U.me['visible'] = !1;
                                }))));
                },
                s;
            }
            (),
            R = function () {
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
                    var s = this['scrollview']['total_height'];
                    s > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - s, this.bg['height'] = s + 20),
                    this.bg['visible'] = !0;
                },
                B['prototype']['render_item'] = function (B) {
                    var s = B['index'],
                    U = B['container'],
                    R = U['getChildByName']('info');
                    R['fontSize'] = 40,
                    R['fontSize'] = this['modes'][s]['length'] <= 5 ? 40 : this['modes'][s]['length'] <= 9 ? 55 - 3 * this['modes'][s]['length'] : 28,
                    R.text = this['modes'][s];
                },
                B;
            }
            (),
            W = function (W) {
                function q() {
                    var s = W.call(this, new ui['lobby']['waitingroomUI']()) || this;
                    return s['skin_ready'] = 'myres/room/btn_ready.png',
                    s['skin_cancel'] = 'myres/room/btn_cancel.png',
                    s['skin_start'] = 'myres/room/btn_start.png',
                    s['skin_start_no'] = 'myres/room/btn_start_no.png',
                    s['update_seq'] = 0,
                    s['pre_msgs'] = [],
                    s['msg_tail'] = -1,
                    s['posted'] = !1,
                    s['label_rommid'] = null,
                    s['player_cells'] = [],
                    s['btn_ok'] = null,
                    s['btn_invite_friend'] = null,
                    s['btn_add_robot'] = null,
                    s['btn_dress'] = null,
                    s['btn_copy'] = null,
                    s['beReady'] = !1,
                    s['room_id'] = -1,
                    s['owner_id'] = -1,
                    s['tournament_id'] = 0,
                    s['max_player_count'] = 0,
                    s['players'] = [],
                    s['container_rules'] = null,
                    s['container_top'] = null,
                    s['container_right'] = null,
                    s['locking'] = !1,
                    s['mousein_copy'] = !1,
                    s['popout'] = null,
                    s['room_link'] = null,
                    s['btn_copy_link'] = null,
                    s['last_start_room'] = 0,
                    s['invitefriend'] = null,
                    s['pre_choose'] = null,
                    s['ai_name'] = game['Tools']['strOfLocalization'](2003),
                    q.Inst = s,
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](s, function (B) {
                            app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](B)),
                            s['onReadyChange'](B['account_id'], B['ready'], B['dressing']);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](s, function (B) {
                            app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](B)),
                            s['onPlayerChange'](B);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](s, function (B) {
                            s['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](B)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), s['onGameStart'](B));
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](s, function (B) {
                            app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](B)),
                            s['onBeKictOut']();
                        })),
                    game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](s, function () {
                            s['enable'] && s.hide(Laya['Handler']['create'](s, function () {
                                    B['UI_Lobby'].Inst['enable'] = !0;
                                }));
                        }, null, !1)),
                    s;
                }
                return __extends(q, W),
                q['prototype']['push_msg'] = function (B) {
                    this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](B)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](B));
                },
                Object['defineProperty'](q['prototype'], 'inRoom', {
                    get: function () {
                        return -1 != this['room_id'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                Object['defineProperty'](q['prototype'], 'robot_count', {
                    get: function () {
                        for (var B = 0, s = 0; s < this['players']['length']; s++)
                            2 == this['players'][s]['category'] && B++;
                        return B;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                q['prototype']['resetData'] = function () {
                    this['room_id'] = -1,
                    this['owner_id'] = -1,
                    this['room_mode'] = {},
                    this['max_player_count'] = 0,
                    this['players'] = [];
                },
                q['prototype']['updateData'] = function (B) {
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
                    for (var s = 0; s < B['persons']['length']; s++) {
                        var U = B['persons'][s];
                        U['ready'] = !1,
                        U['cell_index'] = -1,
                        U['category'] = 1,
                        this['players'].push(U);
                    }
                    for (var s = 0; s < B['robot_count']; s++)
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
                    for (var s = 0; s < B['ready_list']['length']; s++)
                        for (var R = 0; R < this['players']['length']; R++)
                            if (this['players'][R]['account_id'] == B['ready_list'][s]) {
                                this['players'][R]['ready'] = !0;
                                break;
                            }
                    this['update_seq'] = 0,
                    B.seq && (this['update_seq'] = B.seq);
                },
                q['prototype']['onReadyChange'] = function (B, s, U) {
                    for (var R = 0; R < this['players']['length']; R++)
                        if (this['players'][R]['account_id'] == B) {
                            this['players'][R]['ready'] = s,
                            this['players'][R]['dressing'] = U,
                            this['_onPlayerReadyChange'](this['players'][R]);
                            break;
                        }
                    this['refreshStart']();
                },
                q['prototype']['onPlayerChange'] = function (B) {
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
                        var s = {};
                        s.type = 'onPlayerChange0',
                        s['players'] = this['players'],
                        s.msg = B,
                        this['push_msg'](JSON['stringify'](s));
                        var U = this['robot_count'],
                        R = B['robot_count'];
                        if (R < this['robot_count']) {
                            this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, U--);
                            for (var W = 0; W < this['players']['length']; W++)
                                2 == this['players'][W]['category'] && U > R && (this['players'][W]['category'] = 0, U--);
                        }
                        for (var q = [], Q = B['player_list'], W = 0; W < this['players']['length']; W++)
                            if (1 == this['players'][W]['category']) {
                                for (var _ = -1, b = 0; b < Q['length']; b++)
                                    if (Q[b]['account_id'] == this['players'][W]['account_id']) {
                                        _ = b;
                                        break;
                                    }
                                if (-1 != _) {
                                    var D = Q[_];
                                    q.push(this['players'][W]),
                                    this['players'][W]['avatar_id'] = D['avatar_id'],
                                    this['players'][W]['title'] = D['title'],
                                    this['players'][W]['verified'] = D['verified'];
                                }
                            } else
                                2 == this['players'][W]['category'] && q.push(this['players'][W]);
                        this['players'] = q;
                        for (var W = 0; W < Q['length']; W++) {
                            for (var c = !1, D = Q[W], b = 0; b < this['players']['length']; b++)
                                if (1 == this['players'][b]['category'] && this['players'][b]['account_id'] == D['account_id']) {
                                    c = !0;
                                    break;
                                }
                            c || this['players'].push({
                                account_id: D['account_id'],
                                avatar_id: D['avatar_id'],
                                nickname: D['nickname'],
                                verified: D['verified'],
                                title: D['title'],
                                level: D['level'],
                                level3: D['level3'],
                                ready: !1,
                                dressing: !1,
                                cell_index: -1,
                                category: 1
                            });
                        }
                        for (var E = [!1, !1, !1, !1], W = 0; W < this['players']['length']; W++)
                             - 1 != this['players'][W]['cell_index'] && (E[this['players'][W]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][W]));
                        for (var W = 0; W < this['players']['length']; W++)
                            if (1 == this['players'][W]['category'] && -1 == this['players'][W]['cell_index'])
                                for (var b = 0; b < this['max_player_count']; b++)
                                    if (!E[b]) {
                                        this['players'][W]['cell_index'] = b,
                                        E[b] = !0,
                                        this['_refreshPlayerInfo'](this['players'][W]);
                                        break;
                                    }
                        for (var U = this['robot_count'], R = B['robot_count']; R > U; ) {
                            for (var h = -1, b = 0; b < this['max_player_count']; b++)
                                if (!E[b]) {
                                    h = b;
                                    break;
                                }
                            if (-1 == h)
                                break;
                            E[h] = !0,
                            this['players'].push({
                                category: 2,
                                cell_index: h,
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
                            U++;
                        }
                        for (var W = 0; W < this['max_player_count']; W++)
                            E[W] || this['_clearCell'](W);
                        var s = {};
                        if (s.type = 'onPlayerChange1', s['players'] = this['players'], this['push_msg'](JSON['stringify'](s)), B['owner_id']) {
                            if (this['owner_id'] = B['owner_id'], this['enable'])
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
                q['prototype']['onBeKictOut'] = function () {
                    this['resetData'](),
                    this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), B['UI_Lobby'].Inst['enable'] = !0, B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                },
                q['prototype']['onCreate'] = function () {
                    var W = this;
                    this['last_start_room'] = 0;
                    var q = this.me['getChildByName']('root');
                    this['container_top'] = q['getChildByName']('top'),
                    this['container_right'] = q['getChildByName']('right'),
                    this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                    for (var Q = function (s) {
                        var U = q['getChildByName']('player_' + s['toString']()),
                        R = {};
                        R['index'] = s,
                        R['container'] = U,
                        R['container_flag'] = U['getChildByName']('flag'),
                        R['container_flag']['visible'] = !1,
                        R['container_name'] = U['getChildByName']('container_name'),
                        R.name = U['getChildByName']('container_name')['getChildByName']('name'),
                        R['btn_t'] = U['getChildByName']('btn_t'),
                        R['container_illust'] = U['getChildByName']('container_illust'),
                        R['illust'] = new B['UI_Character_Skin'](U['getChildByName']('container_illust')['getChildByName']('illust')),
                        R.host = U['getChildByName']('host'),
                        R['title'] = new B['UI_PlayerTitle'](U['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                        R.rank = new B['UI_Level'](U['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                        R['is_robot'] = !1;
                        var Q = 0;
                        R['btn_t']['clickHandler'] = Laya['Handler']['create'](_, function () {
                            if (!(W['locking'] || Laya['timer']['currTimer'] < Q)) {
                                Q = Laya['timer']['currTimer'] + 500;
                                for (var B = 0; B < W['players']['length']; B++)
                                    if (W['players'][B]['cell_index'] == s) {
                                        W['kickPlayer'](B);
                                        break;
                                    }
                            }
                        }, null, !1),
                        R['btn_info'] = U['getChildByName']('btn_info'),
                        R['btn_info']['clickHandler'] = Laya['Handler']['create'](_, function () {
                            if (!W['locking'])
                                for (var U = 0; U < W['players']['length']; U++)
                                    if (W['players'][U]['cell_index'] == s) {
                                        W['players'][U]['account_id'] && W['players'][U]['account_id'] > 0 && B['UI_OtherPlayerInfo'].Inst.show(W['players'][U]['account_id'], W['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                        break;
                                    }
                        }, null, !1),
                        _['player_cells'].push(R);
                    }, _ = this, b = 0; 4 > b; b++)
                        Q(b);
                    this['btn_ok'] = q['getChildByName']('btn_ok');
                    var D = 0;
                    this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        Laya['timer']['currTimer'] < D + 500 || (D = Laya['timer']['currTimer'], W['owner_id'] == GameMgr.Inst['account_id'] ? W['getStart']() : W['switchReady']());
                    }, null, !1);
                    var c = 0;
                    this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        Laya['timer']['currTimer'] < c + 500 || (c = Laya['timer']['currTimer'], W['leaveRoom']());
                    }, null, !1),
                    this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                    this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        W['locking'] || W['invitefriend'].show();
                    }, null, !1),
                    this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                    var E = 0;
                    this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        W['locking'] || Laya['timer']['currTimer'] < E || (E = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                robot_count: W['robot_count'] + 1
                            }, function (s, U) {
                                (s || U['error'] && 1111 != U['error'].code) && B['UIMgr'].Inst['showNetReqError']('modifyRoom_add', s, U),
                                E = 0;
                            }));
                    }, null, !1),
                    this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (!W['locking']) {
                            var s = 0;
                            W['room_mode']['detail_rule'] && W['room_mode']['detail_rule']['chuanma'] && (s = 1),
                            B['UI_Rules'].Inst.show(0, null, s);
                        }
                    }, null, !1),
                    this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                    this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                        W['locking'] || W['beReady'] && W['owner_id'] != GameMgr.Inst['account_id'] || (W['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: W['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !0
                            }, function () {}));
                    }),
                    this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                    this['btn_copy'].on('mouseover', this, function () {
                        W['mousein_copy'] = !0;
                    }),
                    this['btn_copy'].on('mouseout', this, function () {
                        W['mousein_copy'] = !1;
                    }),
                    this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        W['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), W['popout']['visible'] = !0, B['UIBase']['anim_pop_out'](W['popout'], null));
                    }, null, !1),
                    this['container_rules'] = new R(this['container_right']['getChildByName']('container_rules')),
                    this['popout'] = this.me['getChildByName']('pop'),
                    this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                    this['room_link']['editable'] = !1,
                    this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                    this['btn_copy_link']['visible'] = !1,
                    GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            var s = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                            s.call('setSysClipboardText', W['room_link'].text),
                            B['UIBase']['anim_pop_hide'](W['popout'], Laya['Handler']['create'](W, function () {
                                    W['popout']['visible'] = !1;
                                })),
                            B['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                        }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', W['room_link'].text, function () {}),
                            B['UIBase']['anim_pop_hide'](W['popout'], Laya['Handler']['create'](W, function () {
                                    W['popout']['visible'] = !1;
                                })),
                            B['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                        }, null, !1)),
                    this['popout']['visible'] = !1,
                    this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        B['UIBase']['anim_pop_hide'](W['popout'], Laya['Handler']['create'](W, function () {
                                W['popout']['visible'] = !1;
                            }));
                    }, null, !1),
                    this['invitefriend'] = new s(this.me['getChildByName']('invite_friend')),
                    this['pop_change_view'] = new U(this.me['getChildByName']('pop_view'));
                },
                q['prototype'].show = function () {
                    var s = this;
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['mousein_copy'] = !1,
                    this['beReady'] = !1,
                    this['invitefriend'].me['visible'] = !1,
                    this['btn_add_robot']['visible'] = !1,
                    this['btn_invite_friend']['visible'] = !1,
                    game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                    this['pre_choose'] = null,
                    this['pop_change_view']['close'](!0);
                    for (var U = 0; 4 > U; U++)
                        this['player_cells'][U]['container']['visible'] = U < this['max_player_count'];
                    for (var U = 0; U < this['max_player_count']; U++)
                        this['_clearCell'](U);
                    for (var U = 0; U < this['players']['length']; U++)
                        this['players'][U]['cell_index'] = U, this['_refreshPlayerInfo'](this['players'][U]);
                    this['msg_tail'] = -1,
                    this['pre_msgs'] = [],
                    this['posted'] = !1;
                    var R = {};
                    R.type = 'show',
                    R['players'] = this['players'],
                    this['push_msg'](JSON['stringify'](R)),
                    this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                    this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                    var W = [];
                    W.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                    var q = this['room_mode']['detail_rule'];
                    if (q) {
                        var Q = 5,
                        _ = 20;
                        if (null != q['time_fixed'] && (Q = q['time_fixed']), null != q['time_add'] && (_ = q['time_add']), W.push(Q['toString']() + '+' + _['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                            var b = cfg['tournament']['tournaments'].get(this['tournament_id']);
                            b && W.push(b.name);
                        }
                        if (null != q['init_point'] && W.push(game['Tools']['strOfLocalization'](2199) + q['init_point']), null != q['fandian'] && W.push(game['Tools']['strOfLocalization'](2094) + ':' + q['fandian']), q['guyi_mode'] && W.push(game['Tools']['strOfLocalization'](3028)), null != q['dora_count'])
                            switch (q['chuanma'] && (q['dora_count'] = 0), q['dora_count']) {
                            case 0:
                                W.push(game['Tools']['strOfLocalization'](2044));
                                break;
                            case 2:
                                W.push(game['Tools']['strOfLocalization'](2047));
                                break;
                            case 3:
                                W.push(game['Tools']['strOfLocalization'](2045));
                                break;
                            case 4:
                                W.push(game['Tools']['strOfLocalization'](2046));
                            }
                        null != q['shiduan'] && 1 != q['shiduan'] && W.push(game['Tools']['strOfLocalization'](2137)),
                        2 === q['fanfu'] && W.push(game['Tools']['strOfLocalization'](2763)),
                        4 === q['fanfu'] && W.push(game['Tools']['strOfLocalization'](2764)),
                        null != q['bianjietishi'] && 1 != q['bianjietishi'] && W.push(game['Tools']['strOfLocalization'](2200)),
                        this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != q['have_zimosun'] && 1 != q['have_zimosun'] ? W.push(game['Tools']['strOfLocalization'](2202)) : W.push(game['Tools']['strOfLocalization'](2203))),
                        game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                    }
                    this['container_rules'].show(W),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200);
                    for (var U = 0; U < this['player_cells']['length']; U++)
                        B['UIBase']['anim_alpha_in'](this['player_cells'][U]['container'], {
                            x: 80
                        }, 150, 150 + 50 * U, null, Laya.Ease['backOut']);
                    B['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                    B['UIBase']['anim_alpha_in'](this['container_right'], {
                        x: 20
                    }, 100, 500),
                    Laya['timer'].once(600, this, function () {
                        s['locking'] = !1;
                    });
                    var D = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                    this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                    '' != D && (this['room_link'].text += '(' + D + ')');
                    var c = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['room_link'].text += ': ' + c + '?room=' + this['room_id'];
                },
                q['prototype']['leaveRoom'] = function () {
                    var s = this;
                    this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (U, R) {
                        U || R['error'] ? B['UIMgr'].Inst['showNetReqError']('leaveRoom', U, R) : (s['room_id'] = -1, s.hide(Laya['Handler']['create'](s, function () {
                                    B['UI_Lobby'].Inst['enable'] = !0;
                                })));
                    });
                },
                q['prototype']['tryToClose'] = function (s) {
                    var U = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (R, W) {
                        R || W['error'] ? (B['UIMgr'].Inst['showNetReqError']('leaveRoom', R, W), s['runWith'](!1)) : (U['enable'] = !1, U['pop_change_view']['close'](!0), s['runWith'](!0));
                    });
                },
                q['prototype'].hide = function (s) {
                    var U = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150);
                    for (var R = 0; R < this['player_cells']['length']; R++)
                        B['UIBase']['anim_alpha_out'](this['player_cells'][R]['container'], {
                            x: 80
                        }, 150, 0, null);
                    B['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                    B['UIBase']['anim_alpha_out'](this['container_right'], {
                        x: 20
                    }, 150),
                    Laya['timer'].once(200, this, function () {
                        U['locking'] = !1,
                        U['enable'] = !1,
                        s && s.run();
                    }),
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                q['prototype']['onDisbale'] = function () {
                    Laya['timer']['clearAll'](this);
                    for (var B = 0; B < this['player_cells']['length']; B++)
                        Laya['loader']['clearTextureRes'](this['player_cells'][B]['illust'].skin);
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                q['prototype']['switchReady'] = function () {
                    this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                            ready: this['beReady'],
                            dressing: !1
                        }, function () {}));
                },
                q['prototype']['getStart'] = function () {
                    this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (s, U) {
                                (s || U['error']) && B['UIMgr'].Inst['showNetReqError']('startRoom', s, U);
                            })));
                },
                q['prototype']['kickPlayer'] = function (s) {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        var U = this['players'][s];
                        1 == U['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                            account_id: this['players'][s]['account_id']
                        }, function () {}) : 2 == U['category'] && (this['pre_choose'] = U, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                robot_count: this['robot_count'] - 1
                            }, function (s, U) {
                                (s || U['error']) && B['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', s, U);
                            }));
                    }
                },
                q['prototype']['_clearCell'] = function (B) {
                    if (!(0 > B || B >= this['player_cells']['length'])) {
                        var s = this['player_cells'][B];
                        s['container_flag']['visible'] = !1,
                        s['container_illust']['visible'] = !1,
                        s.name['visible'] = !1,
                        s['container_name']['visible'] = !1,
                        s['btn_t']['visible'] = !1,
                        s.host['visible'] = !1,
                        s['illust']['clear']();
                    }
                },
                q['prototype']['_refreshPlayerInfo'] = function (B) {
                    var s = B['cell_index'];
                    if (!(0 > s || s >= this['player_cells']['length'])) {
                        var U = this['player_cells'][s];
                        U['container_illust']['visible'] = !0,
                        U['container_name']['visible'] = !0,
                        U.name['visible'] = !0,
                        game['Tools']['SetNickname'](U.name, B, GameMgr.Inst['hide_nickname']),
                        U['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && B['account_id'] != GameMgr.Inst['account_id'],
                        this['owner_id'] == B['account_id'] && (U['container_flag']['visible'] = !0, U.host['visible'] = !0),
                        B['account_id'] == GameMgr.Inst['account_id'] ? U['illust']['setSkin'](B['avatar_id'], 'waitingroom') : U['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](B['avatar_id']), 'waitingroom'),
                        U['title'].id = game['Tools']['titleLocalization'](B['account_id'], B['title']),
                        U.rank.id = B[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                        this['_onPlayerReadyChange'](B);
                    }
                },
                q['prototype']['_onPlayerReadyChange'] = function (B) {
                    var s = B['cell_index'];
                    if (!(0 > s || s >= this['player_cells']['length'])) {
                        var U = this['player_cells'][s];
                        U['container_flag']['visible'] = this['owner_id'] == B['account_id'] ? !0 : B['ready'];
                    }
                },
                q['prototype']['refreshAsOwner'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        for (var B = 0, s = 0; s < this['players']['length']; s++)
                            0 != this['players'][s]['category'] && (this['_refreshPlayerInfo'](this['players'][s]), B++);
                        this['btn_add_robot']['visible'] = !0,
                        this['btn_invite_friend']['visible'] = !0,
                        game['Tools']['setGrayDisable'](this['btn_invite_friend'], B == this['max_player_count']),
                        game['Tools']['setGrayDisable'](this['btn_add_robot'], B == this['max_player_count']),
                        this['refreshStart']();
                    }
                },
                q['prototype']['refreshStart'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                        game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                        for (var B = 0, s = 0; s < this['players']['length']; s++) {
                            var U = this['players'][s];
                            if (!U || 0 == U['category'])
                                break;
                            (U['account_id'] == this['owner_id'] || U['ready']) && B++;
                        }
                        if (game['Tools']['setGrayDisable'](this['btn_ok'], B != this['max_player_count']), this['enable']) {
                            for (var R = 0, s = 0; s < this['max_player_count']; s++) {
                                var W = this['player_cells'][s];
                                W && W['container_flag']['visible'] && R++;
                            }
                            if (B != R && !this['posted']) {
                                this['posted'] = !0;
                                var q = {};
                                q['okcount'] = B,
                                q['okcount2'] = R,
                                q.msgs = [];
                                var Q = 0,
                                _ = this['pre_msgs']['length'] - 1;
                                if (-1 != this['msg_tail'] && (Q = (this['msg_tail'] + 1) % this['pre_msgs']['length'], _ = this['msg_tail']), Q >= 0 && _ >= 0) {
                                    for (var s = Q; s != _; s = (s + 1) % this['pre_msgs']['length'])
                                        q.msgs.push(this['pre_msgs'][s]);
                                    q.msgs.push(this['pre_msgs'][_]);
                                }
                                GameMgr.Inst['postInfo2Server']('waitroom_err2', q, !1);
                            }
                        }
                    }
                },
                q['prototype']['onGameStart'] = function (B) {
                    game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                    this['enable'] = !1,
                    game['MJNetMgr'].Inst['OpenConnect'](B['connect_token'], B['game_uuid'], B['location'], !1, null);
                },
                q['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                },
                q['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                },
                q.Inst = null,
                q;
            }
            (B['UIBase']);
            B['UI_WaitingRoom'] = W;
        }
        (uiscript || (uiscript = {}));
        











        // 保存装扮
        !function (B) {
            var s;
            !function (s) {
                var U = function () {
                    function U(U, R, W) {
                        var q = this;
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
                        this['_locking'] = W,
                        this['container_zhuangban0'] = U,
                        this['container_zhuangban1'] = R;
                        var Q = this['container_zhuangban0']['getChildByName']('tabs');
                        Q['vScrollBarSkin'] = '';
                        for (var _ = function (s) {
                            var U = Q['getChildAt'](s);
                            b.tabs.push(U),
                            U['clickHandler'] = new Laya['Handler'](b, function () {
                                q['locking'] || q['tab_index'] != s && (q['_changed'] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](q, function () {
                                            q['change_tab'](s);
                                        }), null) : q['change_tab'](s));
                            });
                        }, b = this, D = 0; D < Q['numChildren']; D++)
                            _(D);
                        this['page_items'] = new s['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                        this['page_headframe'] = new s['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                        this['page_bgm'] = new s['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                        this['page_desktop'] = new s['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                        this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                        this['scrollview']['setElastic'](),
                        this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                        this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                        this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                            for (var s = [], U = 0; U < q['cell_titles']['length']; U++) {
                                var R = q['slot_ids'][U];
                                if (q['slot_map'][R]) {
                                    var W = q['slot_map'][R];
                                    if (!(W['item_id'] && W['item_id'] != q['cell_default_item'][U] || W['item_id_list'] && 0 != W['item_id_list']['length']))
                                        continue;
                                    var Q = [];
                                    if (W['item_id_list'])
                                        for (var _ = 0, b = W['item_id_list']; _ < b['length']; _++) {
                                            var D = b[_];
                                            D == q['cell_default_item'][U] ? Q.push(0) : Q.push(D);
                                        }
                                    s.push({
                                        slot: R,
                                        item_id: W['item_id'],
                                        type: W.type,
                                        item_id_list: Q
                                    });
                                }
                            }
                            q['btn_save']['mouseEnabled'] = !1;
                            var c = q['tab_index'];
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                            //    views: s,
                            //    save_index: c,
                            //    is_use: c == B['UI_Sushe']['using_commonview_index'] ? 1 : 0
                            //}, function (U, R) {
                            //    if (q['btn_save']['mouseEnabled'] = !0, U || R['error'])
                            //        B['UIMgr'].Inst['showNetReqError']('saveCommonViews', U, R);
                            //    else {
                                    if (B['UI_Sushe']['commonViewList']['length'] < c)
                                        for (var W = B['UI_Sushe']['commonViewList']['length']; c >= W; W++)
                                            B['UI_Sushe']['commonViewList'].push([]);
                                        MMP.settings.commonViewList = B.UI_Sushe.commonViewList;
                                        MMP.settings.using_commonview_index = B.UI_Sushe.using_commonview_index;
                                        MMP.saveSettings();
                                        //END
                                    if (B['UI_Sushe']['commonViewList'][c] = s, B['UI_Sushe']['using_commonview_index'] == c && q['onChangeGameView'](), q['tab_index'] != c)
                                        return;
                                    q['btn_save']['mouseEnabled'] = !0,
                                    q['_changed'] = !1,
                                    q['refresh_btn']();
                                //}
                            //});
                        }),
                        this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                        this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                            q['btn_use']['mouseEnabled'] = !1;
                            var s = q['tab_index'];
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                            //    index: s
                            //}, function (U, R) {
                            //    q['btn_use']['mouseEnabled'] = !0,
                            //    U || R['error'] ? B['UIMgr'].Inst['showNetReqError']('useCommonView', U, R) : (
                    B['UI_Sushe']['using_commonview_index'] = s, q['refresh_btn'](), q['refresh_tab'](), q['onChangeGameView']();//);
                            //});
                        }),
                        this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                        this['random_slider'] = this['random']['getChildByName']('slider'),
                        this['btn_random'] = this['random']['getChildByName']('btn'),
                        this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                            q['onRandomBtnClick']();
                        });
                    }
                    return Object['defineProperty'](U['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object['defineProperty'](U['prototype'], 'changed', {
                        get: function () {
                            return this['_changed'];
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    U['prototype'].show = function (s) {
                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                        this['container_zhuangban0']['visible'] = !0,
                        this['container_zhuangban1']['visible'] = !0,
                        s ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (B['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), B['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                x: 0
                            }, 200)),
                        this['change_tab'](B['UI_Sushe']['using_commonview_index']);
                    },
                    U['prototype']['change_tab'] = function (s) {
                        if (this['tab_index'] = s, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                            if (this['tab_index'] < B['UI_Sushe']['commonViewList']['length'])
                                for (var U = B['UI_Sushe']['commonViewList'][this['tab_index']], R = 0; R < U['length']; R++)
                                    this['slot_map'][U[R].slot] = {
                                        slot: U[R].slot,
                                        item_id: U[R]['item_id'],
                                        type: U[R].type,
                                        item_id_list: U[R]['item_id_list']
                                    };
                            this['scrollview']['addItem'](this['cell_titles']['length']),
                            this['onChangeSlotSelect'](0),
                            this['refresh_btn']();
                        }
                    },
                    U['prototype']['refresh_tab'] = function () {
                        for (var s = 0; s < this.tabs['length']; s++) {
                            var U = this.tabs[s];
                            U['mouseEnabled'] = this['tab_index'] != s,
                            U['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == s ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                            U['getChildByName']('num')['color'] = this['tab_index'] == s ? '#2f1e19' : '#f2c797';
                            var R = U['getChildByName']('choosed');
                            B['UI_Sushe']['using_commonview_index'] == s ? (R['visible'] = !0, R.x = this['tab_index'] == s ? -18 : -4) : R['visible'] = !1;
                        }
                    },
                    U['prototype']['refresh_btn'] = function () {
                        this['btn_save']['visible'] = !1,
                        this['btn_save']['mouseEnabled'] = !0,
                        this['btn_use']['visible'] = !1,
                        this['btn_use']['mouseEnabled'] = !0,
                        this['btn_using']['visible'] = !1,
                        this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = B['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = B['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                    },
                    U['prototype']['onChangeSlotSelect'] = function (B) {
                        var s = this;
                        this['select_index'] = B,
                        this['random']['visible'] = !(6 == B || 10 == B);
                        var U = 0;
                        B >= 0 && B < this['cell_default_item']['length'] && (U = this['cell_default_item'][B]);
                        var R = U,
                        W = this['slot_ids'][B],
                        q = !1,
                        Q = [];
                        if (this['slot_map'][W]) {
                            var _ = this['slot_map'][W];
                            Q = _['item_id_list'],
                            q = !!_.type,
                            _['item_id'] && (R = this['slot_map'][W]['item_id']),
                            q && _['item_id_list'] && _['item_id_list']['length'] > 0 && (R = _['item_id_list'][0]);
                        }
                        var b = Laya['Handler']['create'](this, function (R) {
                            R == U && (R = 0);
                            var q = !1;
                            if (s['is_random']) {
                                var Q = s['slot_map'][W]['item_id_list']['indexOf'](R);
                                Q >= 0 ? (s['slot_map'][W]['item_id_list']['splice'](Q, 1), q = !0) : (s['slot_map'][W]['item_id_list'] && 0 != s['slot_map'][W]['item_id_list']['length'] || (s['slot_map'][W]['item_id_list'] = []), s['slot_map'][W]['item_id_list'].push(R));
                            } else
                                s['slot_map'][W] || (s['slot_map'][W] = {}), s['slot_map'][W]['item_id'] = R;
                            return s['scrollview']['wantToRefreshItem'](B),
                            s['_changed'] = !0,
                            s['refresh_btn'](),
                            q;
                        }, null, !1);
                        this['page_items']['close'](),
                        this['page_desktop']['close'](),
                        this['page_headframe']['close'](),
                        this['page_bgm']['close'](),
                        this['is_random'] = q,
                        this['random_slider'].x = q ? 76 : -4,
                        this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                        this['random']['getChildAt'](2)['visible'] = this['is_random'];
                        var D = game['Tools']['strOfLocalization'](this['cell_titles'][B]);
                        if (B >= 0 && 2 >= B)
                            this['page_items'].show(D, B, R, b), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (3 == B)
                            this['page_items'].show(D, 10, R, b), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (4 == B)
                            this['page_items'].show(D, 3, R, b), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (5 == B)
                            this['page_bgm'].show(D, R, b), this['setRandomGray'](!this['page_bgm']['can_random']());
                        else if (6 == B)
                            this['page_headframe'].show(D, R, b);
                        else if (7 == B || 8 == B) {
                            var c = this['cell_default_item'][7],
                            E = this['cell_default_item'][8];
                            if (7 == B) {
                                if (c = R, this['slot_map'][game['EView'].mjp]) {
                                    var h = this['slot_map'][game['EView'].mjp];
                                    h.type && h['item_id_list'] && h['item_id_list']['length'] > 0 ? E = h['item_id_list'][0] : h['item_id'] && (E = h['item_id']);
                                }
                                this['page_desktop']['show_desktop'](D, c, E, b);
                            } else {
                                if (E = R, this['slot_map'][game['EView']['desktop']]) {
                                    var h = this['slot_map'][game['EView']['desktop']];
                                    h.type && h['item_id_list'] && h['item_id_list']['length'] > 0 ? c = h['item_id_list'][0] : h['item_id'] && (c = h['item_id']);
                                }
                                this['page_desktop']['show_mjp'](D, c, E, b);
                            }
                            this['setRandomGray'](!this['page_desktop']['can_random']());
                        } else if (9 == B) {
                            var c = this['cell_default_item'][7],
                            E = this['cell_default_item'][9];
                            if (E = R, this['slot_map'][game['EView']['desktop']]) {
                                var h = this['slot_map'][game['EView']['desktop']];
                                h.type && h['item_id_list'] && h['item_id_list']['length'] > 0 ? c = h['item_id_list'][0] : h['item_id'] && (c = h['item_id']);
                            }
                            this['page_desktop']['show_mjp_surface'](D, c, E, b),
                            this['setRandomGray'](!this['page_desktop']['can_random']());
                        } else
                            10 == B && this['page_desktop']['show_lobby_bg'](D, R, b);
                    },
                    U['prototype']['onRandomBtnClick'] = function () {
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
                            var s = this['select_index'],
                            U = this['slot_ids'][s],
                            R = 0;
                            s >= 0 && s < this['cell_default_item']['length'] && (R = this['cell_default_item'][s]);
                            var W = R,
                            q = [];
                            if (this['slot_map'][U]) {
                                var Q = this['slot_map'][U];
                                q = Q['item_id_list'],
                                Q['item_id'] && (W = this['slot_map'][U]['item_id']);
                            }
                            if (s >= 0 && 4 >= s) {
                                var _ = this['slot_map'][U];
                                _ ? (_.type = _.type ? 0 : 1, _['item_id_list'] && 0 != _['item_id_list']['length'] || (_['item_id_list'] = [_['item_id']])) : this['slot_map'][U] = {
                                    type: 1,
                                    item_id_list: [this['page_items']['items'][0]]
                                },
                                this['page_items']['changeRandomState'](W);
                            } else if (5 == s) {
                                var _ = this['slot_map'][U];
                                if (_)
                                    _.type = _.type ? 0 : 1, _['item_id_list'] && 0 != _['item_id_list']['length'] || (_['item_id_list'] = [_['item_id']]);
                                else {
                                    this['slot_map'][U] = {
                                        type: 1,
                                        item_id_list: [this['page_bgm']['items'][0]]
                                    };
                                }
                                this['page_bgm']['changeRandomState'](W);
                            } else if (7 == s || 8 == s || 9 == s) {
                                var _ = this['slot_map'][U];
                                _ ? (_.type = _.type ? 0 : 1, _['item_id_list'] && 0 != _['item_id_list']['length'] || (_['item_id_list'] = [_['item_id']])) : this['slot_map'][U] = {
                                    type: 1,
                                    item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                },
                                this['page_desktop']['changeRandomState'](W);
                            }
                            this['scrollview']['wantToRefreshItem'](s);
                        }
                    },
                    U['prototype']['render_view'] = function (B) {
                        var s = this,
                        U = B['container'],
                        R = B['index'],
                        W = U['getChildByName']('cell');
                        this['select_index'] == R ? (W['scaleX'] = W['scaleY'] = 1.05, W['getChildByName']('choosed')['visible'] = !0) : (W['scaleX'] = W['scaleY'] = 1, W['getChildByName']('choosed')['visible'] = !1),
                        W['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][R]);
                        var q = W['getChildByName']('name'),
                        Q = W['getChildByName']('icon'),
                        _ = this['cell_default_item'][R],
                        b = this['slot_ids'][R],
                        D = !1;
                        if (this['slot_map'][b] && (D = this['slot_map'][b].type, this['slot_map'][b]['item_id'] && (_ = this['slot_map'][b]['item_id'])), D)
                            q.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][b]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](Q, 'myres/sushe/icon_random.jpg');
                        else {
                            var c = cfg['item_definition'].item.get(_);
                            c ? (q.text = c['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](Q, c.icon, null, 'UI_Sushe_Select.Zhuangban')) : (q.text = game['Tools']['strOfLocalization'](this['cell_names'][R]), game['LoadMgr']['setImgSkin'](Q, this['cell_default_img'][R], null, 'UI_Sushe_Select.Zhuangban'));
                        }
                        var E = W['getChildByName']('btn');
                        E['clickHandler'] = Laya['Handler']['create'](this, function () {
                            s['locking'] || s['select_index'] != R && (s['onChangeSlotSelect'](R), s['scrollview']['wantToRefreshAll']());
                        }, null, !1),
                        E['mouseEnabled'] = this['select_index'] != R;
                    },
                    U['prototype']['close'] = function (s) {
                        var U = this;
                        this['container_zhuangban0']['visible'] && (s ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (B['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), B['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        U['page_items']['close'](),
                                        U['page_desktop']['close'](),
                                        U['page_headframe']['close'](),
                                        U['page_bgm']['close'](),
                                        U['container_zhuangban0']['visible'] = !1,
                                        U['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                    }))));
                    },
                    U['prototype']['onChangeGameView'] = function () {
                                    // 保存装扮页
                                    MMP.settings.using_commonview_index = B.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    // END
                        B['UI_Sushe']['randomDesktopID'](),
                        GameMgr.Inst['load_mjp_view']();
                        var s = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                        B['UI_Lite_Loading'].Inst.show(),
                        game['Scene_Lobby'].Inst['set_lobby_bg'](s, Laya['Handler']['create'](this, function () {
                                B['UI_Lite_Loading'].Inst['enable'] && B['UI_Lite_Loading'].Inst['close']();
                            })),
                        GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                    },
                    U['prototype']['setRandomGray'] = function (s) {
                        this['btn_random']['visible'] = !s,
                        this['random']['filters'] = s ? [new Laya['ColorFilter'](B['GRAY_FILTER'])] : [];
                    },
                    U['prototype']['getShowSlotInfo'] = function () {
                        return this['slot_map'][this['slot_ids'][this['select_index']]];
                    },
                    U['prototype']['changeSlotByItemId'] = function (B) {
                        var s = cfg['item_definition'].item.get(B);
                        if (s)
                            for (var U = 0; U < this['slot_ids']['length']; U++)
                                if (this['slot_ids'][U] == s.type)
                                    return this['onChangeSlotSelect'](U), this['scrollview']['wantToRefreshAll'](), void 0;
                    },
                    U;
                }
                ();
                s['Container_Zhuangban'] = U;
            }
            (s = B['zhuangban'] || (B['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        











        // 设置称号
        !function (B) {
            var s = function (s) {
                function U() {
                    var B = s.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return B['_root'] = null,
                    B['_scrollview'] = null,
                    B['_blackmask'] = null,
                    B['_locking'] = !1,
                    B['_showindexs'] = [],
                    U.Inst = B,
                    B;
                }
                return __extends(U, s),
                U.Init = function () {
                    var s = this;
                                // 获取称号
                    //GameMgr.Inst['use_fetch_info'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (U, R) {
                    //    if (U || R['error'])
                    //        B['UIMgr'].Inst['showNetReqError']('fetchTitleList', U, R);
                    //    else {
                    //        s['owned_title'] = [];
                    //        for (var W = 0; W < R['title_list']['length']; W++) {
                    //            var q = R['title_list'][W];
                                for (let title of cfg.item_definition.title.rows_) {
                                    var q = title.id;
                                cfg['item_definition']['title'].get(q) && s['owned_title'].push(q),
                                '600005' == q && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                q >= '600005' && '600015' >= q && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + q - '600005', 1);
                            }
                    //    }
                    //});
                },
                U['onFetchSuccess'] = function (B) {
                    if (this['owned_title'] = [], B['title_list'] && B['title_list']['title_list'])
                                    // START
                        //for (var s = 0; s < B['title_list']['title_list']['length']; s++) {
                        //    var U = B['title_list']['title_list'][s];
                                    // END
                                    for (let title of cfg.item_definition.title.rows_) {
                                        var U = title.id;
                            cfg['item_definition']['title'].get(U) && this['owned_title'].push(U),
                            '600005' == U && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                            U >= '600005' && '600015' >= U && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + U - '600005', 1);
                        }
                },
                U['title_update'] = function (s) {
                    for (var U = 0; U < s['new_titles']['length']; U++)
                        cfg['item_definition']['title'].get(s['new_titles'][U]) && this['owned_title'].push(s['new_titles'][U]), '600005' == s['new_titles'][U] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), s['new_titles'][U] >= '600005' && s['new_titles'][U] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + s['new_titles'][U] - '600005', 1);
                    if (s['remove_titles'] && s['remove_titles']['length'] > 0) {
                        for (var U = 0; U < s['remove_titles']['length']; U++) {
                            for (var R = s['remove_titles'][U], W = 0; W < this['owned_title']['length']; W++)
                                if (this['owned_title'][W] == R) {
                                    this['owned_title'][W] = this['owned_title'][this['owned_title']['length'] - 1],
                                    this['owned_title'].pop();
                                    break;
                                }
                            R == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](), B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                        }
                        this.Inst['enable'] && this.Inst.show();
                    }
                },
                U['prototype']['onCreate'] = function () {
                    var s = this;
                    this['_root'] = this.me['getChildByName']('root'),
                    this['_blackmask'] = new B['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return s['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                    this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                    this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (B) {
                            s['setItemValue'](B['index'], B['container']);
                        }, null, !1)),
                    this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['_locking'] || (s['_blackmask'].hide(), s['close']());
                    }, null, !1),
                    this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                },
                U['prototype'].show = function () {
                    var s = this;
                    if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), U['owned_title']['length'] > 0) {
                        this['_showindexs'] = [];
                        for (var R = 0; R < U['owned_title']['length']; R++)
                            this['_showindexs'].push(R);
                        this['_showindexs'] = this['_showindexs'].sort(function (B, s) {
                            var R = B,
                            W = cfg['item_definition']['title'].get(U['owned_title'][B]);
                            W && (R += 1000 * W['priority']);
                            var q = s,
                            Q = cfg['item_definition']['title'].get(U['owned_title'][s]);
                            return Q && (q += 1000 * Q['priority']),
                            q - R;
                        }),
                        this['_scrollview']['reset'](),
                        this['_scrollview']['addItem'](U['owned_title']['length']),
                        this['_scrollview'].me['visible'] = !0,
                        this['_noinfo']['visible'] = !1;
                    } else
                        this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                    B['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            s['_locking'] = !1;
                        }));
                },
                U['prototype']['close'] = function () {
                    var s = this;
                    this['_locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                            s['_locking'] = !1,
                            s['enable'] = !1;
                        }));
                },
                U['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                },
                U['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                    this['_scrollview']['reset']();
                },
                U['prototype']['setItemValue'] = function (B, s) {
                    var R = this;
                    if (this['enable']) {
                        var W = U['owned_title'][this['_showindexs'][B]],
                        q = cfg['item_definition']['title'].find(W);
                        game['LoadMgr']['setImgSkin'](s['getChildByName']('img_title'), q.icon, null, 'UI_TitleBook'),
                        s['getChildByName']('using')['visible'] = W == GameMgr.Inst['account_data']['title'],
                        s['getChildByName']('desc').text = q['desc_' + GameMgr['client_language']];
                        var Q = s['getChildByName']('btn');
                        Q['clickHandler'] = Laya['Handler']['create'](this, function () {
                            W != GameMgr.Inst['account_data']['title'] ? (R['changeTitle'](B), s['getChildByName']('using')['visible'] = !0) : (R['changeTitle'](-1), s['getChildByName']('using')['visible'] = !1);
                        }, null, !1);
                        var _ = s['getChildByName']('time'),
                        b = s['getChildByName']('img_title');
                        if (1 == q['unlock_type']) {
                            var D = q['unlock_param'][0],
                            c = cfg['item_definition'].item.get(D);
                            _.text = game['Tools']['strOfLocalization'](3121) + c['expire_desc_' + GameMgr['client_language']],
                            _['visible'] = !0,
                            b.y = 0;
                        } else
                            _['visible'] = !1, b.y = 10;
                    }
                },
                U['prototype']['changeTitle'] = function (s) {
                    var R = this,
                    W = GameMgr.Inst['account_data']['title'],
                    q = 0;
                    q = s >= 0 && s < this['_showindexs']['length'] ? U['owned_title'][this['_showindexs'][s]] : '600001',
                    GameMgr.Inst['account_data']['title'] = q;
                    for (var Q = -1, _ = 0; _ < this['_showindexs']['length']; _++)
                        if (W == U['owned_title'][this['_showindexs'][_]]) {
                            Q = _;
                            break;
                        }
                    B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](),
                    B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                    -1 != Q && this['_scrollview']['wantToRefreshItem'](Q),
                                    // 屏蔽设置称号的网络请求并保存称号
                                    MMP.settings.title = q;
                                MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                    //    title: '600001' == q ? 0 : q
                    //}, function (U, q) {
                    //    (U || q['error']) && (B['UIMgr'].Inst['showNetReqError']('useTitle', U, q), GameMgr.Inst['account_data']['title'] = W, B['UI_Lobby'].Inst['enable'] && B['UI_Lobby'].Inst.top['refresh'](), B['UI_PlayerInfo'].Inst['enable'] && B['UI_PlayerInfo'].Inst['refreshBaseInfo'](), R['enable'] && (s >= 0 && s < R['_showindexs']['length'] && R['_scrollview']['wantToRefreshItem'](s), Q >= 0 && Q < R['_showindexs']['length'] && R['_scrollview']['wantToRefreshItem'](Q)));
                    //});
                },
                U.Inst = null,
                U['owned_title'] = [],
                U;
            }
            (B['UIBase']);
            B['UI_TitleBook'] = s;
        }
        (uiscript || (uiscript = {}));
        









        // 友人房调整装扮
        !function (B) {
            var s;
            !function (s) {
                var U = function () {
                    function U(B) {
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
                        this['page_skin'] = new s['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return U['prototype'].show = function (s) {
                        var U = this;
                        this.me['visible'] = !0,
                        s ? this.me['alpha'] = 1 : B['UIBase']['anim_alpha_in'](this.me, {
                            x: 0
                        }, 200, 0),
                        this['choosed_chara_index'] = 0,
                        this['chara_infos'] = [];
                        for (var R = 0, W = B['UI_Sushe']['star_chars']; R < W['length']; R++)
                            for (var q = W[R], Q = 0; Q < B['UI_Sushe']['characters']['length']; Q++)
                                if (!B['UI_Sushe']['hidden_characters_map'][q] && B['UI_Sushe']['characters'][Q]['charid'] == q) {
                                    this['chara_infos'].push({
                                        chara_id: B['UI_Sushe']['characters'][Q]['charid'],
                                        skin_id: B['UI_Sushe']['characters'][Q].skin,
                                        is_upgraded: B['UI_Sushe']['characters'][Q]['is_upgraded']
                                    }),
                                    B['UI_Sushe']['main_character_id'] == B['UI_Sushe']['characters'][Q]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var Q = 0; Q < B['UI_Sushe']['characters']['length']; Q++)
                            B['UI_Sushe']['hidden_characters_map'][B['UI_Sushe']['characters'][Q]['charid']] || -1 == B['UI_Sushe']['star_chars']['indexOf'](B['UI_Sushe']['characters'][Q]['charid']) && (this['chara_infos'].push({
                                    chara_id: B['UI_Sushe']['characters'][Q]['charid'],
                                    skin_id: B['UI_Sushe']['characters'][Q].skin,
                                    is_upgraded: B['UI_Sushe']['characters'][Q]['is_upgraded']
                                }), B['UI_Sushe']['main_character_id'] == B['UI_Sushe']['characters'][Q]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                        this['scrollview']['reset'](),
                        this['scrollview']['addItem'](this['chara_infos']['length']);
                        var _ = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(_['chara_id'], _['skin_id'], Laya['Handler']['create'](this, function (B) {
                                U['choosed_skin_id'] = B,
                                _['skin_id'] = B,
                                U['scrollview']['wantToRefreshItem'](U['choosed_chara_index']);
                            }, null, !1));
                    },
                    U['prototype']['render_character_cell'] = function (s) {
                        var U = this,
                        R = s['index'],
                        W = s['container'],
                        q = s['cache_data'];
                        q['index'] = R;
                        var Q = this['chara_infos'][R];
                        q['inited'] || (q['inited'] = !0, q.skin = new B['UI_Character_Skin'](W['getChildByName']('btn')['getChildByName']('head')), q['bound'] = W['getChildByName']('btn')['getChildByName']('bound'));
                        var _ = W['getChildByName']('btn');
                        _['getChildByName']('choose')['visible'] = R == this['choosed_chara_index'],
                        q.skin['setSkin'](Q['skin_id'], 'bighead'),
                        _['getChildByName']('using')['visible'] = R == this['choosed_chara_index'];
                        var b = cfg['item_definition']['character'].find(Q['chara_id']),
                        D = b['name_' + GameMgr['client_language'] + '2'] ? b['name_' + GameMgr['client_language'] + '2'] : b['name_' + GameMgr['client_language']],
                        c = _['getChildByName']('label_name');
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            c.text = D['replace']('-', '|')['replace'](/\./g, '·');
                            var E = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            c['leading'] = E.test(D) ? -15 : 0;
                        } else
                            c.text = D;
                        _['getChildByName']('star') && (_['getChildByName']('star')['visible'] = R < this['star_char_count']);
                        var h = cfg['item_definition']['character'].get(Q['chara_id']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? q['bound'].skin = h.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (Q['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (Q['is_upgraded'] ? '2.png' : '.png')) : h.ur ? (q['bound'].pos(-10, -2), q['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (Q['is_upgraded'] ? '6.png' : '5.png'))) : (q['bound'].pos(4, 20), q['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (Q['is_upgraded'] ? '4.png' : '3.png'))),
                        _['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (Q['is_upgraded'] ? '2.png' : '.png')),
                        W['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            if (R != U['choosed_chara_index']) {
                                var B = U['choosed_chara_index'];
                                U['choosed_chara_index'] = R,
                                U['choosed_skin_id'] = Q['skin_id'],
                                U['page_skin'].show(Q['chara_id'], Q['skin_id'], Laya['Handler']['create'](U, function (B) {
                                        U['choosed_skin_id'] = B,
                                        Q['skin_id'] = B,
                                        q.skin['setSkin'](B, 'bighead');
                                    }, null, !1)),
                                U['scrollview']['wantToRefreshItem'](B),
                                U['scrollview']['wantToRefreshItem'](R);
                            }
                        });
                    },
                    U['prototype']['close'] = function (s) {
                        var U = this;
                        if (this.me['visible'])
                            if (s)
                                this.me['visible'] = !1;
                            else {
                                var R = this['chara_infos'][this['choosed_chara_index']];
                                            //把chartid和skin写入cookie
                                            MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                            MMP.saveSettings();
                                            // End
                                            // 友人房调整装扮
                                //R['chara_id'] != B['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                //        character_id: R['chara_id']
                                //    }, function () {}), 
                    B['UI_Sushe']['main_character_id'] = R['chara_id'];//),
                                //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //    character_id: R['chara_id'],
                                //    skin: this['choosed_skin_id']
                                //}, function () {});
                                            // END
                                for (var W = 0; W < B['UI_Sushe']['characters']['length']; W++)
                                    if (B['UI_Sushe']['characters'][W]['charid'] == R['chara_id']) {
                                        B['UI_Sushe']['characters'][W].skin = this['choosed_skin_id'];
                                        break;
                                    }
                                GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                B['UI_Sushe']['onMainSkinChange'](),
                                B['UIBase']['anim_alpha_out'](this.me, {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        U.me['visible'] = !1;
                                    }));
                            }
                    },
                    U;
                }
                ();
                s['Page_Waiting_Head'] = U;
            }
            (s = B['zhuangban'] || (B['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        











        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo= function () {
            var B = GameMgr;
    var s = this;
    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (U, R) {
        if (U || R['error'])
            uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', U, R);
        else {
            app.Log.log('UpdateAccount: ' + JSON['stringify'](R)),
            B.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    R.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    R.account.title = GameMgr.Inst.account_data.title;
                    R.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        R.account.nickname = MMP.settings.nickname;
                    }
                    // END
            for (var W in R['account']) {
                if (B.Inst['account_data'][W] = R['account'][W], 'platform_diamond' == W)
                    for (var q = R['account'][W], Q = 0; Q < q['length']; Q++)
                        s['account_numerical_resource'][q[Q].id] = q[Q]['count'];
                if ('skin_ticket' == W && (B.Inst['account_numerical_resource']['100004'] = R['account'][W]), 'platform_skin_ticket' == W)
                    for (var q = R['account'][W], Q = 0; Q < q['length']; Q++)
                        s['account_numerical_resource'][q[Q].id] = q[Q]['count'];
            }
            uiscript['UI_Lobby'].Inst['refreshInfo'](),
            R['account']['room_id'] && B.Inst['updateRoom'](),
            '10102' === B.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
            '10103' === B.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
        }
    });
}









        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (s, U, R) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': s,
                        'account_id': parseInt(U.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': s,
                            'account_id': parseInt(U.toString())
                        }));
                    }
                }));
            }
            var B = GameMgr;
    var W = this;
    return s = s.trim(),
    app.Log.log('checkPaiPu game_uuid:' + s + ' account_id:' + U['toString']() + ' paipu_config:' + R),
    this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), B.Inst['onLoadStart']('paipu'), 2 & R && (s = game['Tools']['DecodePaipuUUID'](s)), this['record_uuid'] = s, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
            game_uuid: s,
            client_version_string: this['getClientVersion']()
        }, function (q, Q) {
            if (q || Q['error']) {
                uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', q, Q);
                var _ = 0.12;
                uiscript['UI_Loading'].Inst['setProgressVal'](_);
                var b = function () {
                    return _ += 0.06,
                    uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, _)),
                    _ >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, b), void 0) : void 0;
                };
                Laya['timer'].loop(50, W, b),
                W['duringPaipu'] = !1;
            } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': q.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': q.head
                                    }));
                                }
                            }));
                        }
                uiscript['UI_Activity_SevenDays']['task_done'](3),
                uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                var D = Q.head,
                c = [null, null, null, null],
                E = game['Tools']['strOfLocalization'](2003),
                h = D['config'].mode;
                app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                    game_uuid: s,
                    client_version_string: W['getClientVersion']()
                }, function () {}),
                h['extendinfo'] && (E = game['Tools']['strOfLocalization'](2004)),
                h['detail_rule'] && h['detail_rule']['ai_level'] && (1 === h['detail_rule']['ai_level'] && (E = game['Tools']['strOfLocalization'](2003)), 2 === h['detail_rule']['ai_level'] && (E = game['Tools']['strOfLocalization'](2004)));
                var e = !1;
                D['end_time'] ? (W['record_end_time'] = D['end_time'], D['end_time'] > '1576112400' && (e = !0)) : W['record_end_time'] = -1,
                W['record_start_time'] = D['start_time'] ? D['start_time'] : -1;
                for (var P = 0; P < D['accounts']['length']; P++) {
                    var K = D['accounts'][P];
                    if (K['character']) {
                        var o = K['character'],
                        I = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (K.account_id == GameMgr.Inst.account_id) {
                                        K.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        K.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        K.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        K.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        K.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            K.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (K.avatar_id == 400101 || K.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            K.avatar_id = skin.id;
                                            K.character.charid = skin.character_id;
                                            K.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(K.account_id);
                                        if (server == 1) {
                                            K.nickname = '[CN]' + K.nickname;
                                        } else if (server == 2) {
                                            K.nickname = '[JP]' + K.nickname;
                                        } else if (server == 3) {
                                            K.nickname = '[EN]' + K.nickname;
                                        } else {
                                            K.nickname = '[??]' + K.nickname;
                                        }
                                    }
                                }
                                // END
                        if (e) {
                            var Y = K['views'];
                            if (Y)
                                for (var f = 0; f < Y['length']; f++)
                                    I[Y[f].slot] = Y[f]['item_id'];
                        } else {
                            var v = o['views'];
                            if (v)
                                for (var f = 0; f < v['length']; f++) {
                                    var L = v[f].slot,
                                    m = v[f]['item_id'],
                                    g = L - 1;
                                    I[g] = m;
                                }
                        }
                        var H = [];
                        for (var r in I)
                            H.push({
                                slot: parseInt(r),
                                item_id: I[r]
                            });
                        K['views'] = H,
                        c[K.seat] = K;
                    } else
                        K['character'] = {
                            charid: K['avatar_id'],
                            level: 0,
                            exp: 0,
                            views: [],
                            skin: cfg['item_definition']['character'].get(K['avatar_id'])['init_skin'],
                            is_upgraded: !1
                        },
                    K['avatar_id'] = K['character'].skin,
                    K['views'] = [],
                    c[K.seat] = K;
                }
                for (var C = game['GameUtility']['get_default_ai_skin'](), d = game['GameUtility']['get_default_ai_character'](), P = 0; P < c['length']; P++)
                   if( null == c[P] ){
		    c[P] = {
                            nickname: E,
                            avatar_id: C,
                            level: {
                                id: '10101'
                            },
                            level3: {
                                id: '20101'
                            },
                            character: {
                                charid: d,
                                level: 0,
                                exp: 0,
                                views: [],
                                skin: C,
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
                                            c[P].avatar_id = skin.id;
                                            c[P].character.charid = skin.character_id;
                                            c[P].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        c[P].nickname = '[BOT]' + c[P].nickname;
                                    }
                                }
                                // END
                            }
                var x = Laya['Handler']['create'](W, function (B) {
                    game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                    game['Scene_MJ'].Inst['openMJRoom'](D['config'], c, Laya['Handler']['create'](W, function () {
                            W['duringPaipu'] = !1,
                            view['DesktopMgr'].Inst['paipu_config'] = R,
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](D['config'])), c, U, view['EMJMode']['paipu'], Laya['Handler']['create'](W, function () {
                                    uiscript['UI_Replay'].Inst['initData'](B),
                                    uiscript['UI_Replay'].Inst['enable'] = !0,
                                    Laya['timer'].once(1000, W, function () {
                                        W['EnterMJ']();
                                    }),
                                    Laya['timer'].once(1500, W, function () {
                                        view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                        uiscript['UI_Loading'].Inst['close']();
                                    }),
                                    Laya['timer'].once(1000, W, function () {
                                        uiscript['UI_Replay'].Inst['nextStep'](!0);
                                    });
                                }));
                        }), Laya['Handler']['create'](W, function (B) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * B);
                        }, null, !1));
                }),
                y = {};
                if (y['record'] = D, Q.data && Q.data['length'])
                    y.game = net['MessageWrapper']['decodeMessage'](Q.data), x['runWith'](y);
                else {
                    var J = Q['data_url'];
                    J['startsWith']('http') || (J = B['prefix_url'] + J),
                    game['LoadMgr']['httpload'](J, 'arraybuffer', !1, Laya['Handler']['create'](W, function (B) {
                            if (B['success']) {
                                var s = new Laya.Byte();
                                s['writeArrayBuffer'](B.data);
                                var U = net['MessageWrapper']['decodeMessage'](s['getUint8Array'](0, s['length']));
                                y.game = U,
                                x['runWith'](y);
                            } else
                                uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + Q['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), W['duringPaipu'] = !1;
                        }));
                }
            }
        }), void 0);
}











        // 牌谱功能
        !function (B) {
            var s = function () {
                function s(B) {
                    var s = this;
                    this.me = B,
                    this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        s['locking'] || s.hide(null);
                    }),
                    this['title'] = this.me['getChildByName']('title'),
                    this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                    this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                    this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                    this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                    this.me['visible'] = !1,
                    this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        s['locking'] || s.hide(null);
                    }, null, !1),
                    this['container_hidename'] = this.me['getChildByName']('hidename'),
                    this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var U = this['container_hidename']['getChildByName']('w0'),
                    R = this['container_hidename']['getChildByName']('w1');
                    R.x = U.x + U['textField']['textWidth'] + 10,
                    this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                        s['sp_checkbox']['visible'] = !s['sp_checkbox']['visible'],
                        s['refresh_share_uuid']();
                    });
                }
                return s['prototype']['show_share'] = function (s) {
                    var U = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                    this['sp_checkbox']['visible'] = !1,
                    this['btn_confirm']['visible'] = !1,
                    this['input']['editable'] = !1,
                    this.uuid = s,
                    this['refresh_share_uuid'](),
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['container_hidename']['visible'] = !0,
                    this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                    B['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            U['locking'] = !1;
                        }));
                },
                s['prototype']['refresh_share_uuid'] = function () {
                    var B = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                    s = this.uuid,
                    U = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + U + '?paipu=' + game['Tools']['EncodePaipuUUID'](s) + '_a' + B + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + U + '?paipu=' + s + '_a' + B;
                },
                s['prototype']['show_check'] = function () {
                    var s = this;
                    return B['UI_PiPeiYuYue'].Inst['enable'] ? (B['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return s['input'].text ? (s.hide(Laya['Handler']['create'](s, function () {
                                        var B = s['input'].text['split']('='),
                                        U = B[B['length'] - 1]['split']('_'),
                                        R = 0;
                                        U['length'] > 1 && (R = 'a' == U[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(U[1]['substr'](1))) : parseInt(U[1]));
                                        var W = 0;
                                        if (U['length'] > 2) {
                                            var q = parseInt(U[2]);
                                            q && (W = q);
                                        }
                                        GameMgr.Inst['checkPaiPu'](U[0], R, W);
                                    })), void 0) : (B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, B['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                                s['locking'] = !1;
                            })), void 0);
                },
                s['prototype'].hide = function (s) {
                    var U = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                            U['locking'] = !1,
                            U.me['visible'] = !1,
                            s && s.run();
                        }));
                },
                s;
            }
            (),
            U = function () {
                function s(B) {
                    var s = this;
                    this.me = B,
                    this['blackbg'] = B['getChildByName']('blackbg'),
                    this.root = B['getChildByName']('root'),
                    this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                        s['locking'] || s['close']();
                    }),
                    this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                        s['locking'] || (game['Tools']['calu_word_length'](s['input'].text) > 30 ? s['toolong']['visible'] = !0 : (s['close'](), q['addCollect'](s.uuid, s['start_time'], s['end_time'], s['input'].text)));
                    }),
                    this['toolong'] = this.root['getChildByName']('toolong');
                }
                return s['prototype'].show = function (s, U, R) {
                    var W = this;
                    this.uuid = s,
                    this['start_time'] = U,
                    this['end_time'] = R,
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['input'].text = '',
                    this['toolong']['visible'] = !1,
                    this['blackbg']['alpha'] = 0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0.5
                    }, 150),
                    B['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            W['locking'] = !1;
                        }));
                },
                s['prototype']['close'] = function () {
                    var s = this;
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0
                    }, 150),
                    B['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            s['locking'] = !1,
                            s.me['visible'] = !1;
                        }));
                },
                s;
            }
            ();
            B['UI_Pop_CollectInput'] = U;
            var R;
            !function (B) {
                B[B.ALL = 0] = 'ALL',
                B[B['FRIEND'] = 1] = 'FRIEND',
                B[B.RANK = 2] = 'RANK',
                B[B['MATCH'] = 4] = 'MATCH',
                B[B['COLLECT'] = 100] = 'COLLECT';
            }
            (R || (R = {}));
            var W = function () {
                function s(B) {
                    this['uuid_list'] = [],
                    this.type = B,
                    this['reset']();
                }
                return s['prototype']['reset'] = function () {
                    this['count'] = 0,
                    this['true_count'] = 0,
                    this['have_more_paipu'] = !0,
                    this['uuid_list'] = [],
                    this['duringload'] = !1,
                    this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                s['prototype']['loadList'] = function (s) {
                    var U = this;
                    if (void 0 === s && (s = 10), !this['duringload'] && this['have_more_paipu']) {
                        if (this['duringload'] = !0, this.type == R['COLLECT']) {
                            for (var W = [], Q = 0, _ = 0; 10 > _; _++) {
                                var b = this['count'] + _;
                                if (b >= q['collect_lsts']['length'])
                                    break;
                                Q++;
                                var D = q['collect_lsts'][b];
                                q['record_map'][D] || W.push(D),
                                this['uuid_list'].push(D);
                            }
                            W['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                uuid_list: W
                            }, function (s, R) {
                                if (U['duringload'] = !1, q.Inst['onLoadStateChange'](U.type, !1), s || R['error'])
                                    B['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', s, R);
                                else if (app.Log.log(JSON['stringify'](R)), R['record_list'] && R['record_list']['length'] == W['length']) {
                                    for (var _ = 0; _ < R['record_list']['length']; _++) {
                                        var b = R['record_list'][_].uuid;
                                        q['record_map'][b] || (q['record_map'][b] = R['record_list'][_]);
                                    }
                                    U['count'] += Q,
                                    U['count'] >= q['collect_lsts']['length'] && (U['have_more_paipu'] = !1, q.Inst['onLoadOver'](U.type)),
                                    q.Inst['onLoadMoreLst'](U.type, Q);
                                } else
                                    U['have_more_paipu'] = !1, q.Inst['onLoadOver'](U.type);
                            }) : (this['duringload'] = !1, this['count'] += Q, this['count'] >= q['collect_lsts']['length'] && (this['have_more_paipu'] = !1, q.Inst['onLoadOver'](this.type)), q.Inst['onLoadMoreLst'](this.type, Q));
                        } else
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                start: this['true_count'],
                                count: 10,
                                type: this.type
                            }, function (s, W) {
                                if (U['duringload'] = !1, q.Inst['onLoadStateChange'](U.type, !1), s || W['error'])
                                    B['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', s, W);
                                else if (app.Log.log(JSON['stringify'](W)), W['record_list'] && W['record_list']['length'] > 0) {
                                                // START
                                                if (MMP.settings.sendGame == true) {
                                                    (GM_xmlhttpRequest({
                                                        method: 'post',
                                                        url: MMP.settings.sendGameURL,
                                                        data: JSON.stringify(W),
                                                        onload: function (msg) {
                                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(W));
                                                        }
                                                    }));
                                                    for (let record_list of W['record_list']) {
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
                                    for (var Q = W['record_list'], _ = 0, b = 0; b < Q['length']; b++) {
                                        var D = Q[b].uuid;
                                        if (U.type == R.RANK && Q[b]['config'] && Q[b]['config'].meta) {
                                            var c = Q[b]['config'].meta;
                                            if (c) {
                                                var E = cfg['desktop']['matchmode'].get(c['mode_id']);
                                                if (E && 5 == E.room)
                                                    continue;
                                            }
                                        }
                                        _++,
                                        U['uuid_list'].push(D),
                                        q['record_map'][D] || (q['record_map'][D] = Q[b]);
                                    }
                                    U['count'] += _,
                                    U['true_count'] += Q['length'],
                                    q.Inst['onLoadMoreLst'](U.type, _),
                                    U['have_more_paipu'] = !0;
                                } else
                                    U['have_more_paipu'] = !1, q.Inst['onLoadOver'](U.type);
                            });
                        Laya['timer'].once(700, this, function () {
                            U['duringload'] && q.Inst['onLoadStateChange'](U.type, !0);
                        });
                    }
                },
                s['prototype']['removeAt'] = function (B) {
                    for (var s = 0; s < this['uuid_list']['length'] - 1; s++)
                        s >= B && (this['uuid_list'][s] = this['uuid_list'][s + 1]);
                    this['uuid_list'].pop(),
                    this['count']--,
                    this['true_count']--;
                },
                s;
            }
            (),
            q = function (q) {
                function Q() {
                    var B = q.call(this, new ui['lobby']['paipuUI']()) || this;
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
                    B['current_type'] = R.ALL,
                    Q.Inst = B,
                    B;
                }
                return __extends(Q, q),
                Q.init = function () {
                    var B = this;
                    this['paipuLst'][R.ALL] = new W(R.ALL),
                    this['paipuLst'][R['FRIEND']] = new W(R['FRIEND']),
                    this['paipuLst'][R.RANK] = new W(R.RANK),
                    this['paipuLst'][R['MATCH']] = new W(R['MATCH']),
                    this['paipuLst'][R['COLLECT']] = new W(R['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (s, U) {
                        if (s || U['error']);
                        else {
                            if (U['record_list']) {
                                for (var R = U['record_list'], W = 0; W < R['length']; W++) {
                                    var q = {
                                        uuid: R[W].uuid,
                                        time: R[W]['end_time'],
                                        remarks: R[W]['remarks']
                                    };
                                    B['collect_lsts'].push(q.uuid),
                                    B['collect_info'][q.uuid] = q;
                                }
                                B['collect_lsts'] = B['collect_lsts'].sort(function (s, U) {
                                    return B['collect_info'][U].time - B['collect_info'][s].time;
                                });
                            }
                            U['record_collect_limit'] && (B['collect_limit'] = U['record_collect_limit']);
                        }
                    });
                },
                Q['onFetchSuccess'] = function (B) {
                    var s = this;
                    this['paipuLst'][R.ALL] = new W(R.ALL),
                    this['paipuLst'][R['FRIEND']] = new W(R['FRIEND']),
                    this['paipuLst'][R.RANK] = new W(R.RANK),
                    this['paipuLst'][R['MATCH']] = new W(R['MATCH']),
                    this['paipuLst'][R['COLLECT']] = new W(R['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {};
                    var U = B['collected_game_record_list'];
                    if (U['record_list']) {
                        for (var q = U['record_list'], Q = 0; Q < q['length']; Q++) {
                            var _ = {
                                uuid: q[Q].uuid,
                                time: q[Q]['end_time'],
                                remarks: q[Q]['remarks']
                            };
                            this['collect_lsts'].push(_.uuid),
                            this['collect_info'][_.uuid] = _;
                        }
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, U) {
                            return s['collect_info'][U].time - s['collect_info'][B].time;
                        });
                    }
                    U['record_collect_limit'] && (this['collect_limit'] = U['record_collect_limit']);
                },
                Q['onAccountUpdate'] = function () {
                    this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                },
                Q['reset'] = function () {
                    this['paipuLst'][R.ALL] && this['paipuLst'][R.ALL]['reset'](),
                    this['paipuLst'][R['FRIEND']] && this['paipuLst'][R['FRIEND']]['reset'](),
                    this['paipuLst'][R.RANK] && this['paipuLst'][R.RANK]['reset'](),
                    this['paipuLst'][R['MATCH']] && this['paipuLst'][R['MATCH']]['reset']();
                },
                Q['addCollect'] = function (s, U, R, W) {
                    var q = this;
                    if (!this['collect_info'][s]) {
                        if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                            return B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                            uuid: s,
                            remarks: W,
                            start_time: U,
                            end_time: R
                        }, function () {});
                        var _ = {
                            uuid: s,
                            remarks: W,
                            time: R
                        };
                        this['collect_info'][s] = _,
                        this['collect_lsts'].push(s),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, s) {
                            return q['collect_info'][s].time - q['collect_info'][B].time;
                        }),
                        B['UI_DesktopInfo'].Inst && B['UI_DesktopInfo'].Inst['enable'] && B['UI_DesktopInfo'].Inst['onCollectChange'](),
                        Q.Inst && Q.Inst['enable'] && Q.Inst['onCollectChange'](s, -1);
                    }
                },
                Q['removeCollect'] = function (s) {
                    var U = this;
                    if (this['collect_info'][s]) {
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                            uuid: s
                        }, function () {}),
                        delete this['collect_info'][s];
                        for (var R = -1, W = 0; W < this['collect_lsts']['length']; W++)
                            if (this['collect_lsts'][W] == s) {
                                this['collect_lsts'][W] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                R = W;
                                break;
                            }
                        this['collect_lsts'].pop(),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (B, s) {
                            return U['collect_info'][s].time - U['collect_info'][B].time;
                        }),
                        B['UI_DesktopInfo'].Inst && B['UI_DesktopInfo'].Inst['enable'] && B['UI_DesktopInfo'].Inst['onCollectChange'](),
                        Q.Inst && Q.Inst['enable'] && Q.Inst['onCollectChange'](s, R);
                    }
                },
                Q['prototype']['onCreate'] = function () {
                    var R = this;
                    this.top = this.me['getChildByName']('top'),
                    this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        R['locking'] || R['close'](Laya['Handler']['create'](R, function () {
                                B['UIMgr'].Inst['showLobby']();
                            }));
                    }, null, !1),
                    this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                    this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (B) {
                            R['setItemValue'](B['index'], B['container']);
                        }, null, !1)),
                    this['scrollview']['setElastic'](),
                    this['container_scrollview'].on('ratechange', this, function () {
                        var B = Q['paipuLst'][R['current_type']];
                        (1 - R['scrollview'].rate) * B['count'] < 3 && (B['duringload'] || (B['have_more_paipu'] ? B['loadList']() : 0 == B['count'] && (R['noinfo']['visible'] = !0)));
                    }),
                    this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                    this['loading']['visible'] = !1,
                    this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        R['pop_otherpaipu'].me['visible'] || R['pop_otherpaipu']['show_check']();
                    }, null, !1),
                    this.tabs = [];
                    for (var W = 0; 5 > W; W++)
                        this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](W)), this.tabs[W]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [W, !1]);
                    this['pop_otherpaipu'] = new s(this.me['getChildByName']('pop_otherpaipu')),
                    this['pop_collectinput'] = new U(this.me['getChildByName']('pop_collect')),
                    this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                    this['label_collect_count'].text = '0/20',
                    this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                },
                Q['prototype'].show = function () {
                    var s = this;
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
                        s['locking'] = !1;
                    }),
                    this['changeTab'](0, !0),
                    this['label_collect_count'].text = Q['collect_lsts']['length']['toString']() + '/' + Q['collect_limit']['toString']();
                },
                Q['prototype']['close'] = function (s) {
                    var U = this;
                    this['locking'] = !0,
                    B['UIBase']['anim_alpha_out'](this.top, {
                        y: -30
                    }, 150),
                    B['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                        y: 30
                    }, 150),
                    Laya['timer'].once(150, this, function () {
                        U['locking'] = !1,
                        U['enable'] = !1,
                        s && s.run();
                    });
                },
                Q['prototype']['changeTab'] = function (B, s) {
                    var U = [R.ALL, R.RANK, R['FRIEND'], R['MATCH'], R['COLLECT']];
                    if (s || U[B] != this['current_type']) {
                        if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = U[B], this['current_type'] == R['COLLECT'] && Q['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != R['COLLECT']) {
                            var W = Q['paipuLst'][this['current_type']]['count'];
                            W > 0 && this['scrollview']['addItem'](W);
                        }
                        for (var q = 0; q < this.tabs['length']; q++) {
                            var _ = this.tabs[q];
                            _['getChildByName']('img').skin = game['Tools']['localUISrc'](B == q ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                            _['getChildByName']('label_name')['color'] = B == q ? '#d9b263' : '#8cb65f';
                        }
                    }
                },
                Q['prototype']['setItemValue'] = function (s, U) {
                    var R = this;
                    if (this['enable']) {
                        var W = Q['paipuLst'][this['current_type']];
                        if (W || !(s >= W['uuid_list']['length'])) {
                            for (var q = Q['record_map'][W['uuid_list'][s]], _ = 0; 4 > _; _++) {
                                var b = U['getChildByName']('p' + _['toString']());
                                if (_ < q['result']['players']['length']) {
                                    b['visible'] = !0;
                                    var D = b['getChildByName']('chosen'),
                                    c = b['getChildByName']('rank'),
                                    E = b['getChildByName']('rank_word'),
                                    h = b['getChildByName']('name'),
                                    e = b['getChildByName']('score'),
                                    P = q['result']['players'][_];
                                    e.text = P['part_point_1'] || '0';
                                    for (var K = 0, o = game['Tools']['strOfLocalization'](2133), I = 0, Y = !1, f = 0; f < q['accounts']['length']; f++)
                                        if (q['accounts'][f].seat == P.seat) {
                                            K = q['accounts'][f]['account_id'],
                                            o = q['accounts'][f]['nickname'],
                                            I = q['accounts'][f]['verified'],
                                            Y = q['accounts'][f]['account_id'] == GameMgr.Inst['account_id'];
                                            break;
                                        }
                                    game['Tools']['SetNickname'](h, {
                                        account_id: K,
                                        nickname: o,
                                        verified: I
                                    }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                    D['visible'] = Y,
                                    e['color'] = Y ? '#ffc458' : '#b98930',
                                    h['getChildByName']('name')['color'] = Y ? '#dfdfdf' : '#a0a0a0',
                                    E['color'] = c['color'] = Y ? '#57bbdf' : '#489dbc';
                                    var v = b['getChildByName']('rank_word');
                                    if ('en' == GameMgr['client_language'])
                                        switch (_) {
                                        case 0:
                                            v.text = 'st';
                                            break;
                                        case 1:
                                            v.text = 'nd';
                                            break;
                                        case 2:
                                            v.text = 'rd';
                                            break;
                                        case 3:
                                            v.text = 'th';
                                        }
                                } else
                                    b['visible'] = !1;
                            }
                            var L = new Date(1000 * q['end_time']),
                            m = '';
                            m += L['getFullYear']() + '/',
                            m += (L['getMonth']() < 9 ? '0' : '') + (L['getMonth']() + 1)['toString']() + '/',
                            m += (L['getDate']() < 10 ? '0' : '') + L['getDate']() + ' ',
                            m += (L['getHours']() < 10 ? '0' : '') + L['getHours']() + ':',
                            m += (L['getMinutes']() < 10 ? '0' : '') + L['getMinutes'](),
                            U['getChildByName']('date').text = m,
                            U['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                return R['locking'] ? void 0 : B['UI_PiPeiYuYue'].Inst['enable'] ? (B['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](q.uuid, GameMgr.Inst['account_id'], 0), void 0);
                            }, null, !1),
                            U['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                R['locking'] || R['pop_otherpaipu'].me['visible'] || (R['pop_otherpaipu']['show_share'](q.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                            }, null, !1);
                            var g = U['getChildByName']('room'),
                            H = game['Tools']['get_room_desc'](q['config']);
                            g.text = H.text;
                            var r = '';
                            if (1 == q['config']['category'])
                                r = game['Tools']['strOfLocalization'](2023);
                            else if (4 == q['config']['category'])
                                r = game['Tools']['strOfLocalization'](2025);
                            else if (2 == q['config']['category']) {
                                var C = q['config'].meta;
                                if (C) {
                                    var d = cfg['desktop']['matchmode'].get(C['mode_id']);
                                    d && (r = d['room_name_' + GameMgr['client_language']]);
                                }
                            }
                            if (Q['collect_info'][q.uuid]) {
                                var x = Q['collect_info'][q.uuid],
                                y = U['getChildByName']('remarks_info'),
                                J = U['getChildByName']('input'),
                                a = J['getChildByName']('txtinput'),
                                j = U['getChildByName']('btn_input'),
                                F = !1,
                                n = function () {
                                    F ? (y['visible'] = !1, J['visible'] = !0, a.text = y.text, j['visible'] = !1) : (y.text = x['remarks'] && '' != x['remarks'] ? game['Tools']['strWithoutForbidden'](x['remarks']) : r, y['visible'] = !0, J['visible'] = !1, j['visible'] = !0);
                                };
                                n(),
                                j['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    F = !0,
                                    n();
                                }, null, !1),
                                a.on('blur', this, function () {
                                    F && (game['Tools']['calu_word_length'](a.text) > 30 ? B['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : a.text != x['remarks'] && (x['remarks'] = a.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                uuid: q.uuid,
                                                remarks: a.text
                                            }, function () {}))),
                                    F = !1,
                                    n();
                                });
                                var T = U['getChildByName']('collect');
                                T['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](R, function () {
                                            Q['removeCollect'](q.uuid);
                                        }));
                                }, null, !1),
                                T['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                            } else {
                                U['getChildByName']('input')['visible'] = !1,
                                U['getChildByName']('btn_input')['visible'] = !1,
                                U['getChildByName']('remarks_info')['visible'] = !0,
                                U['getChildByName']('remarks_info').text = r;
                                var T = U['getChildByName']('collect');
                                T['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    R['pop_collectinput'].show(q.uuid, q['start_time'], q['end_time']);
                                }, null, !1),
                                T['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                            }
                        }
                    }
                },
                Q['prototype']['onLoadStateChange'] = function (B, s) {
                    this['current_type'] == B && (this['loading']['visible'] = s);
                },
                Q['prototype']['onLoadMoreLst'] = function (B, s) {
                    this['current_type'] == B && this['scrollview']['addItem'](s);
                },
                Q['prototype']['getScrollViewCount'] = function () {
                    return this['scrollview']['value_count'];
                },
                Q['prototype']['onLoadOver'] = function (B) {
                    if (this['current_type'] == B) {
                        var s = Q['paipuLst'][this['current_type']];
                        0 == s['count'] && (this['noinfo']['visible'] = !0);
                    }
                },
                Q['prototype']['onCollectChange'] = function (B, s) {
                    if (this['current_type'] == R['COLLECT'])
                        s >= 0 && (Q['paipuLst'][R['COLLECT']]['removeAt'](s), this['scrollview']['delItem'](s));
                    else
                        for (var U = Q['paipuLst'][this['current_type']]['uuid_list'], W = 0; W < U['length']; W++)
                            if (U[W] == B) {
                                this['scrollview']['wantToRefreshItem'](W);
                                break;
                            }
                    this['label_collect_count'].text = Q['collect_lsts']['length']['toString']() + '/' + Q['collect_limit']['toString']();
                },
                Q['prototype']['refreshAll'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                Q.Inst = null,
                Q['paipuLst'] = {},
                Q['collect_lsts'] = [],
                Q['record_map'] = {},
                Q['collect_info'] = {},
                Q['collect_limit'] = 20,
                Q;
            }
            (B['UIBase']);
            B['UI_PaiPu'] = q;
        }
        (uiscript || (uiscript = {}));
        










        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var B = GameMgr;
    var s = this;
    if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), this['use_fetch_info'] || (app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (B, U) {
                B || U['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', B, U) : s['server_time_delta'] = 1000 * U['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (B, U) {
                B || U['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', B, U) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](U)), s['updateServerSettings'](U['settings']));
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (B, U) {
            B || U['error'] || (s['client_endpoint'] = U['client_endpoint']);
        }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (B) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](B));
                var U = B['update'];
                if (U) {
                    if (U['numerical'])
                        for (var R = 0; R < U['numerical']['length']; R++) {
                            var W = U['numerical'][R].id,
                            q = U['numerical'][R]['final'];
                            switch (W) {
                            case '100001':
                                s['account_data']['diamond'] = q;
                                break;
                            case '100002':
                                s['account_data'].gold = q;
                                break;
                            case '100099':
                                s['account_data'].vip = q,
                                uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (W >= '101001' || '102999' >= W) && (s['account_numerical_resource'][W] = q);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](U),
                    U['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](U['daily_task']),
                    U['title'] && uiscript['UI_TitleBook']['title_update'](U['title']),
                    U['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](U),
                    (U['activity_task'] || U['activity_period_task'] || U['activity_random_task'] || U['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](U),
                    U['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](U['activity_flip_task']['progresses']),
                    U['activity'] && (U['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](U['activity']['friend_gift_data']), U['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](U['activity']['upgrade_data']), U['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](U['activity']['gacha_data']), U['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](U['activity']['simulation_data']), U['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](U['activity']['spot_data']), U['activity']['combining_data'] && uiscript['UI_Activity_Combining']['update_data'](U['activity']['combining_data']), U['activity']['village_data'] && uiscript['UI_Activity_Chunjie']['update_data'](U['activity']['village_data']));
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
                B['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](B['settings']), B['settings']['nickname_setting'] && (s['nickname_replace_enable'] = !!B['settings']['nickname_setting']['enable'], s['nickname_replace_lst'] = B['settings']['nickname_setting']['nicknames'])),
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
                uiscript['UI_Guajichenfa'].Inst.show(B);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (B) {
                s['auth_check_id'] = B['check_id'],
                s['auth_nc_retry_count'] = 0,
                4 == B.type ? s['showNECaptcha']() : 2 == B.type ? s['checkNc']() : s['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
            if (game['LobbyNetMgr'].Inst.isOK) {
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (B, U) {
                    B || U['error'] || (s['server_time_delta'] = 1000 * U['server_time'] - Laya['timer']['currTimer']);
                });
                var B = (Laya['timer']['currTimer'] - s['_last_heatbeat_time']) / 1000;
                app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                    no_operation_counter: B
                }, function () {}),
                B >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
            }
        }), Laya['timer'].loop(1000, this, function () {
            var B = Laya['stage']['getMousePoint']();
            (B.x != s['_pre_mouse_point'].x || B.y != s['_pre_mouse_point'].y) && (s['clientHeatBeat'](), s['_pre_mouse_point'].x = B.x, s['_pre_mouse_point'].y = B.y);
        }), Laya['timer'].loop(1000, this, function () {
            Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
        }), 'kr' == B['client_type'] && Laya['timer'].loop(3600000, this, function () {
            s['showKrTip'](!1, null);
        }), uiscript['UI_RollNotice'].init(), 'jp' == B['client_language']) {
        var U = document['createElement']('link');
        U.rel = 'stylesheet',
        U.href = 'font/notosansjapanese_1.css';
        var R = document['getElementsByTagName']('head')[0];
        R['appendChild'](U);
    }
}








        // 设置状态
        !function (B) {
            var s = function () {
                function B(s) {
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
                    this.me = s,
                    this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var U = 0; 3 > U; U++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + U));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var U = 0; 3 > U; U++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + U));
                    for (var U = 0; 2 > U; U++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + U));
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
                B['prototype']['showCD'] = function (B, s) {
                    var U = this;
                    this.me['visible'] = !0,
                    this['_start'] = Laya['timer']['currTimer'],
                    this._fix = Math['floor'](B / 1000),
                    this._add = Math['floor'](s / 1000),
                    this['_pre_sec'] = -1,
                    this['_pre_time'] = Laya['timer']['currTimer'],
                    this['_show'](),
                    Laya['timer']['frameLoop'](1, this, function () {
                        var B = Laya['timer']['currTimer'] - U['_pre_time'];
                        U['_pre_time'] = Laya['timer']['currTimer'],
                        view['DesktopMgr'].Inst['timestoped'] ? U['_start'] += B : U['_show']();
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
                            for (var s = (B - this._add)['toString'](), U = 0; U < this['_img_countdown_c0']['length']; U++)
                                this['_img_countdown_c0'][U]['visible'] = U < s['length'];
                            if (3 == s['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[2] + '.png')) : 2 == s['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + s[0] + '.png'), 0 != this._add) {
                                this['_img_countdown_plus']['visible'] = !0;
                                for (var R = this._add['toString'](), U = 0; U < this['_img_countdown_add']['length']; U++) {
                                    var W = this['_img_countdown_add'][U];
                                    U < R['length'] ? (W['visible'] = !0, W.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + R[U] + '.png')) : W['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var U = 0; U < this['_img_countdown_add']['length']; U++)
                                    this['_img_countdown_add'][U]['visible'] = !1;
                            }
                        } else {
                            this['_img_countdown_plus']['visible'] = !1;
                            for (var s = B['toString'](), U = 0; U < this['_img_countdown_c0']['length']; U++)
                                this['_img_countdown_c0'][U]['visible'] = U < s['length'];
                            3 == s['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[2] + '.png')) : 2 == s['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + s[0] + '.png');
                        }
                        if (B > 3) {
                            this['_container_c1']['visible'] = !1;
                            for (var U = 0; U < this['_img_countdown_c0']['length']; U++)
                                this['_img_countdown_c0'][U]['alpha'] = 1;
                            this['_img_countdown_plus']['alpha'] = 1,
                            this['_container_c0']['alpha'] = 1,
                            this['_container_c1']['alpha'] = 1;
                        } else {
                            view['AudioMgr']['PlayAudio'](205),
                            this['_container_c1']['visible'] = !0;
                            for (var U = 0; U < this['_img_countdown_c0']['length']; U++)
                                this['_img_countdown_c0'][U]['alpha'] = 1;
                            this['_img_countdown_plus']['alpha'] = 1,
                            this['_container_c0']['alpha'] = 1,
                            this['_container_c1']['alpha'] = 1;
                            for (var U = 0; U < this['_img_countdown_c1']['length']; U++)
                                this['_img_countdown_c1'][U]['visible'] = this['_img_countdown_c0'][U]['visible'], this['_img_countdown_c1'][U].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][U].skin);
                            _.Inst.me.cd1.play(0, !1);
                        }
                    }
                },
                B.Inst = null,
                B;
            }
            (),
            U = function () {
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
                        var s = 2000;
                        if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                            var U = app['NetAgent']['mj_network_delay'];
                            s = 300 > U ? 2000 : 800 > U ? 2500 + U : 4000 + 0.5 * U,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                B['last_returned'] = !0;
                            }),
                            this['last_returned'] = !1;
                        } else
                            s = 1000;
                        this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), s);
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
            R = function () {
                function B(B, s) {
                    var U = this;
                    this['enable'] = !1,
                    this['emj_banned'] = !1,
                    this['locking'] = !1,
                    this['localposition'] = s,
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
                        U['locking'] || (U['emj_banned'] = !U['emj_banned'], U['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (U['emj_banned'] ? '_on.png' : '.png')), U['close']());
                    }, null, !1),
                    this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U['locking'] || (U['close'](), _.Inst['btn_seeinfo'](U['localposition']));
                    }, null, !1),
                    this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U['locking'] || (U['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](U['localposition'])));
                    }, null, !1),
                    this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                        U['locking'] || U['switch']();
                    }, null, !1);
                }
                return B['prototype']['reset'] = function (B, s, U) {
                    Laya['timer']['clearAll'](this),
                    this['locking'] = !1,
                    this['enable'] = !1,
                    this['showinfo'] = B,
                    this['showemj'] = s,
                    this['showchange'] = U,
                    this['emj_banned'] = !1,
                    this['btn_banemj']['visible'] = !1,
                    this['btn_seeinfo']['visible'] = !1,
                    this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                    this['btn_change']['visible'] = !1;
                },
                B['prototype']['onChangeSeat'] = function (B, s, U) {
                    this['showinfo'] = B,
                    this['showemj'] = s,
                    this['showchange'] = U,
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
            W = function () {
                function B(B) {
                    var s = this;
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
                        s['switchShow'](!0);
                    }),
                    this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                    this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                        s['switchShow'](!1);
                    }),
                    this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                    this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                    this['scrollview']['reset'](),
                    this['scrollbar'].init(null),
                    this['scrollview'].me.on('ratechange', this, function () {
                        s['scrollview']['total_height'] > 0 ? s['scrollbar']['setVal'](s['scrollview'].rate, s['scrollview']['view_height'] / s['scrollview']['total_height']) : s['scrollbar']['setVal'](0, 1);
                    }),
                    'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                }
                return B['prototype']['initRoom'] = function () {
                    var B = view['DesktopMgr'].Inst['main_role_character_info'],
                    s = cfg['item_definition']['character'].find(B['charid']);
                    this['emo_log_count'] = 0,
                    this.emos = [];
                    for (var U = 0; 9 > U; U++)
                        this.emos.push({
                            path: s.emo + '/' + U + '.png',
                            sub_id: U,
                            sort: U
                        });
                    if (B['extra_emoji'])
                        for (var U = 0; U < B['extra_emoji']['length']; U++)
                            this.emos.push({
                                path: s.emo + '/' + B['extra_emoji'][U] + '.png',
                                sub_id: B['extra_emoji'][U],
                                sort: B['extra_emoji'][U] > 12 ? 1000000 - B['extra_emoji'][U] : B['extra_emoji'][U]
                            });
                    this.emos = this.emos.sort(function (B, s) {
                        return B.sort - s.sort;
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
                    var s = this,
                    U = B['index'],
                    R = B['container'],
                    W = this.emos[U],
                    q = R['getChildByName']('btn');
                    q.skin = game['LoadMgr']['getResImageSkin'](W.path),
                    this['allgray'] ? game['Tools']['setGrayDisable'](q, !0) : (game['Tools']['setGrayDisable'](q, !1), q['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (app['NetAgent']['isMJConnectOK']()) {
                                GameMgr.Inst['BehavioralStatistics'](22);
                                for (var B = !1, U = 0, R = s['emo_infos']['emoji']; U < R['length']; U++) {
                                    var q = R[U];
                                    if (q[0] == W['sub_id']) {
                                        q[0]++,
                                        B = !0;
                                        break;
                                    }
                                }
                                B || s['emo_infos']['emoji'].push([W['sub_id'], 1]),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                    content: JSON['stringify']({
                                        emo: W['sub_id']
                                    }),
                                    except_self: !1
                                }, function () {});
                            }
                            s['change_all_gray'](!0),
                            Laya['timer'].once(5000, s, function () {
                                s['change_all_gray'](!1);
                            }),
                            s['switchShow'](!1);
                        }, null, !1));
                },
                B['prototype']['change_all_gray'] = function (B) {
                    this['allgray'] = B,
                    this['scrollview']['wantToRefreshAll']();
                },
                B['prototype']['switchShow'] = function (B) {
                    var s = this,
                    U = 0;
                    U = B ? 1367 : 1896,
                    Laya['Tween'].to(this.me, {
                        x: 1972
                    }, B ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                            B ? (s.out['visible'] = !1, s.in['visible'] = !0) : (s.out['visible'] = !0, s.in['visible'] = !1),
                            Laya['Tween'].to(s.me, {
                                x: U
                            }, B ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](s, function () {
                                    s['btn_chat']['disabled'] = !1,
                                    s['btn_chat_in']['disabled'] = !1;
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
                    //        t: _.Inst['min_double_time'],
                    //        g: _.Inst['max_double_time']
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
            q = function () {
                function s(s) {
                    this['effect'] = null,
                    this['container_emo'] = s['getChildByName']('chat_bubble'),
                    this.emo = new B['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                    this['root_effect'] = s['getChildByName']('root_effect'),
                    this['container_emo']['visible'] = !1;
                }
                return s['prototype'].show = function (B, s) {
                    var U = this;
                    if (!view['DesktopMgr'].Inst['emoji_switch']) {
                        for (var R = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](B)]['character']['charid'], W = cfg['character']['emoji']['getGroup'](R), q = '', Q = 0, _ = 10 > s, b = 0; b < W['length']; b++)
                            if (W[b]['sub_id'] == s) {
                                _ = !0,
                                2 == W[b].type && (q = W[b].view, Q = W[b]['audio']);
                                break;
                            }
                        _ || (s = 0),
                        this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                        q ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + q + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                U['effect'] && (U['effect']['destory'](), U['effect'] = null);
                            }), Q && view['AudioMgr']['PlayAudio'](Q)) : (this.emo['setSkin'](R, s), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                scaleX: 1,
                                scaleY: 1
                            }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                Laya['Tween'].to(U['container_emo'], {
                                    scaleX: 0,
                                    scaleY: 0
                                }, 120, null, null, 0, !0, !0);
                            }), Laya['timer'].once(3500, this, function () {
                                U['container_emo']['visible'] = !1,
                                U.emo['clear']();
                            }));
                    }
                },
                s['prototype']['reset'] = function () {
                    Laya['timer']['clearAll'](this),
                    this.emo['clear'](),
                    this['container_emo']['visible'] = !1,
                    this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                },
                s;
            }
            (),
            Q = function () {
                function B(B, s) {
                    if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = s, this.me = B, 0 == s) {
                        var U = B['getChildByName']('moqie');
                        this['moqie'] = U['getChildByName']('moqie'),
                        this['tip_moqie'] = U['getChildByName']('tip'),
                        this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                        this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                        this['points_moqie'] = [];
                        var R = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                        this['points_moqie'].push(R);
                        for (var W = 0; 5 > W; W++) {
                            var q = R['scriptMap']['capsui.UICopy']['getNodeClone']();
                            this['points_moqie'].push(q);
                        }
                        var Q = B['getChildByName']('shouqie');
                        this['shouqie'] = Q['getChildByName']('shouqie'),
                        this['tip_shouqie'] = Q['getChildByName']('tip'),
                        this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                        this['points_shouqie'] = [],
                        this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                        R = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                        this['points_shouqie'].push(R);
                        for (var W = 0; 5 > W; W++) {
                            var q = R['scriptMap']['capsui.UICopy']['getNodeClone']();
                            this['points_shouqie'].push(q);
                        }
                        'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                    } else
                        this['moqie'] = B['getChildByName']('moqie'), this['shouqie'] = B['getChildByName']('shouqie');
                    this['star_moqie'] = this['moqie']['getChildByName']('star'),
                    this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                }
                return B['prototype'].show = function (B, s, U, R, W) {
                    var q = this;
                    if (this.me['visible'] = !0, s != this['_now_moqie_bonus']) {
                        if (this['_now_moqie_bonus'] = s, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + s + '.png'), W) {
                            var Q = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                            Q['parent']['setChildIndex'](Q, 1),
                            Laya['Tween']['clearAll'](this['moqie']),
                            Laya['Tween'].to(this['moqie'], {
                                scaleX: 4,
                                scaleY: 4
                            }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                    Laya['Tween'].to(q['moqie'], {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 300, Laya.Ease['quadOut'], null, 100);
                                }));
                        }
                        this['star_moqie']['visible'] = s == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                    }
                    if (R != this['_now_shouqie_bonus']) {
                        if (this['_now_shouqie_bonus'] = R, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + R + '.png'), W) {
                            var Q = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                            Q['parent']['setChildIndex'](Q, 1),
                            Laya['Tween']['clearAll'](this['shouqie']),
                            Laya['Tween'].to(this['shouqie'], {
                                scaleX: 4,
                                scaleY: 4
                            }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                    Laya['Tween'].to(q['shouqie'], {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 300, Laya.Ease['quadOut'], null, 100);
                                }));
                        }
                        this['star_shouqie']['visible'] = R == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                    }
                    if (0 == this['index']) {
                        for (var _ = this['_fan_counts']['indexOf'](s), b = this['_moqie_counts'][_ + 1] - this['_moqie_counts'][_], D = B - this['_moqie_counts'][_], c = 0; c < this['points_moqie']['length']; c++) {
                            var E = this['points_moqie'][c];
                            if (b > c) {
                                E['visible'] = !0;
                                var h = c / b * 2 * Math.PI;
                                E.pos(27 * Math.sin(h) + 27, 27 - 27 * Math.cos(h)),
                                E.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (D > c ? 'l.png' : 'd.png'));
                            } else
                                E['visible'] = !1;
                        }
                        this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + B]),
                        this['circle_moqie']['visible'] = s != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                        _ = this['_fan_counts']['indexOf'](R),
                        b = this['_shouqie_counts'][_ + 1] - this['_shouqie_counts'][_],
                        D = U - this['_shouqie_counts'][_];
                        for (var c = 0; c < this['points_shouqie']['length']; c++) {
                            var E = this['points_shouqie'][c];
                            if (b > c) {
                                E['visible'] = !0;
                                var h = c / b * 2 * Math.PI;
                                E.pos(27 * Math.sin(h) + 27, 27 - 27 * Math.cos(h)),
                                E.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (D > c ? 'l.png' : 'd.png'));
                            } else
                                E['visible'] = !1;
                        }
                        this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + U]),
                        this['circle_shouqie']['visible'] = R != this['_fan_counts'][this['_fan_counts']['length'] - 1];
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
                    s = 1.4 * Math.abs(B - 0.5) + 0.8;
                    this['star_moqie']['getChildAt'](0)['scale'](s, s),
                    this['star_shouqie']['getChildAt'](0)['scale'](s, s),
                    B = (B + 0.4) % 1;
                    var U = 1.4 * Math.abs(B - 0.5) + 0.8;
                    this['star_moqie']['getChildAt'](1)['scale'](U, U),
                    this['star_shouqie']['getChildAt'](1)['scale'](U, U);
                },
                B;
            }
            (),
            _ = function (_) {
                function b() {
                    var B = _.call(this, new ui.mj['desktopInfoUI']()) || this;
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
                    app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](B, function (s) {
                            B['onGameBroadcast'](s);
                        })),
                    app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](B, function (s) {
                            B['onPlayerConnectionState'](s);
                        })),
                    b.Inst = B,
                    B;
                }
                return __extends(b, _),
                b['prototype']['onCreate'] = function () {
                    var _ = this;
                    this['doras'] = new Array(),
                    this['front_doras'] = [];
                    var b = this.me['getChildByName']('container_lefttop'),
                    D = b['getChildByName']('container_doras');
                    this['container_doras'] = D,
                    this['container_gamemode'] = b['getChildByName']('gamemode'),
                    this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                    'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                    this['label_md5'] = b['getChildByName']('MD5'),
                    b['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (_['label_md5']['visible'])
                            Laya['timer']['clearAll'](_['label_md5']), _['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? b['getChildByName']('activitymode')['visible'] = !0 : _['container_doras']['visible'] = !0;
                        else {
                            _['label_md5']['visible'] = !0,
                            view['DesktopMgr'].Inst['sha256'] ? (_['label_md5']['fontSize'] = 20, _['label_md5'].y = 45, _['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (_['label_md5']['fontSize'] = 25, _['label_md5'].y = 51, _['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                            b['getChildByName']('activitymode')['visible'] = !1,
                            _['container_doras']['visible'] = !1;
                            var B = _;
                            Laya['timer'].once(5000, _['label_md5'], function () {
                                B['label_md5']['visible'] = !1,
                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? b['getChildByName']('activitymode')['visible'] = !0 : _['container_doras']['visible'] = !0;
                            });
                        }
                    }, null, !1);
                    for (var c = 0; c < D['numChildren']; c++)
                        this['doras'].push(D['getChildAt'](c)), this['front_doras'].push(D['getChildAt'](c)['getChildAt'](0));
                    for (var c = 0; 4 > c; c++) {
                        var E = this.me['getChildByName']('container_player_' + c),
                        h = {};
                        h['container'] = E,
                        h.head = new B['UI_Head'](E['getChildByName']('head'), ''),
                        h['head_origin_y'] = E['getChildByName']('head').y,
                        h.name = E['getChildByName']('container_name')['getChildByName']('name'),
                        h['container_shout'] = E['getChildByName']('container_shout'),
                        h['container_shout']['visible'] = !1,
                        h['illust'] = h['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                        h['illustrect'] = B['UIRect']['CreateFromSprite'](h['illust']),
                        h['shout_origin_x'] = h['container_shout'].x,
                        h['shout_origin_y'] = h['container_shout'].y,
                        h.emo = new q(E),
                        h['disconnect'] = E['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                        h['disconnect']['visible'] = !1,
                        h['title'] = new B['UI_PlayerTitle'](E['getChildByName']('title'), ''),
                        h.que = E['getChildByName']('que'),
                        h['que_target_pos'] = new Laya['Vector2'](h.que.x, h.que.y),
                        h['tianming'] = E['getChildByName']('tianming'),
                        h['tianming']['visible'] = !1,
                        h['yongchang'] = new Q(E['getChildByName']('yongchang'), c),
                        h['yongchang'].hide(),
                        0 == c ? (E['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                _['btn_seeinfo'](0);
                            }, null, !1), E['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                B['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                            })) : h['headbtn'] = new R(E['getChildByName']('btn_head'), c),
                        this['_player_infos'].push(h);
                    }
                    this['_timecd'] = new s(this.me['getChildByName']('container_countdown')),
                    this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                    this['img_zhenting']['visible'] = !1,
                    this['_initFunc'](),
                    this['block_emo'] = new W(this.me['getChildByName']('container_chat_choose')),
                    this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                    this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                    this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            if (view['DesktopMgr'].Inst['gameing']) {
                                for (var s = 0, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++)
                                    view['DesktopMgr'].Inst['player_datas'][U]['account_id'] && s++;
                                if (1 >= s)
                                    B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](_, function () {
                                            if (view['DesktopMgr'].Inst['gameing']) {
                                                for (var B = 0, s = 0; s < view['DesktopMgr'].Inst['player_datas']['length']; s++) {
                                                    var U = view['DesktopMgr'].Inst['player_datas'][s];
                                                    U && null != U['account_id'] && 0 != U['account_id'] && B++;
                                                }
                                                1 == B ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                    game['Scene_MJ'].Inst['GameEnd']();
                                                }) : game['Scene_MJ'].Inst['ForceOut']();
                                            }
                                        }));
                                else {
                                    var R = !1;
                                    if (B['UI_VoteProgress']['vote_info']) {
                                        var W = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - B['UI_VoteProgress']['vote_info']['start_time'] - B['UI_VoteProgress']['vote_info']['duration_time']);
                                        0 > W && (R = !0);
                                    }
                                    R ? B['UI_VoteProgress'].Inst['enable'] || B['UI_VoteProgress'].Inst.show() : B['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? B['UI_VoteCD'].Inst['enable'] || B['UI_VoteCD'].Inst.show() : B['UI_Vote'].Inst.show();
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
                        view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? B['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](_, function () {
                                    B['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                })) : B['UI_Replay'].Inst && B['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                    }, null, !1),
                    this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                    this['btn_double_pass']['visible'] = !1;
                    var e = 0;
                    this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                        if (view['DesktopMgr']['double_click_pass']) {
                            var s = Laya['timer']['currTimer'];
                            if (e + 300 > s) {
                                if (B['UI_ChiPengHu'].Inst['enable'])
                                    B['UI_ChiPengHu'].Inst['onDoubleClick'](), _['recordDoubleClickTime'](s - e);
                                else {
                                    var U = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                    B['UI_LiQiZiMo'].Inst['enable'] && (U = B['UI_LiQiZiMo'].Inst['onDoubleClick'](U)),
                                    U && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && _['recordDoubleClickTime'](s - e);
                                }
                                e = 0;
                            } else
                                e = s;
                        }
                    }, null, !1),
                    this['_network_delay'] = new U(this.me['getChildByName']('img_signal')),
                    this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                    this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                    'en' == GameMgr['client_language'] && (b['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                },
                b['prototype']['recordDoubleClickTime'] = function (B) {
                    this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(B, this['min_double_time'])) : B,
                    this['max_double_time'] = this['max_double_time'] ? Math.max(B, this['max_double_time']) : B;
                },
                b['prototype']['onGameBroadcast'] = function (B) {
                    app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](B));
                    var s = view['DesktopMgr'].Inst['seat2LocalPosition'](B.seat),
                    U = JSON['parse'](B['content']);
                    null != U.emo && void 0 != U.emo && (this['onShowEmo'](s, U.emo), this['showAIEmo']());
                },
                b['prototype']['onPlayerConnectionState'] = function (B) {
                    app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](B));
                    var s = B.seat;
                    if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && s < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][s] = B['state']), this['enable']) {
                        var U = view['DesktopMgr'].Inst['seat2LocalPosition'](s);
                        this['_player_infos'][U]['disconnect']['visible'] = B['state'] != view['ELink_State']['READY'];
                    }
                },
                b['prototype']['_initFunc'] = function () {
                    var B = this;
                    this['_container_fun'] = this.me['getChildByName']('container_func'),
                    this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                    this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                    this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                    var s = this['_fun_out']['getChildByName']('btn_func'),
                    U = this['_fun_out']['getChildByName']('btn_func2'),
                    R = this['_fun_in_spr']['getChildByName']('btn_func');
                    s['clickHandler'] = U['clickHandler'] = new Laya['Handler'](this, function () {
                        var W = 0;
                        W = -270,
                        Laya['Tween'].to(B['_container_fun'], {
                            x: -624
                        }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                B['_fun_in']['visible'] = !0,
                                B['_fun_out']['visible'] = !1,
                                Laya['Tween'].to(B['_container_fun'], {
                                    x: W
                                }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                        s['disabled'] = !1,
                                        U['disabled'] = !1,
                                        R['disabled'] = !1,
                                        B['_fun_out']['visible'] = !1;
                                    }), 0, !0, !0);
                            })),
                        s['disabled'] = !0,
                        U['disabled'] = !0,
                        R['disabled'] = !0;
                    }, null, !1),
                    R['clickHandler'] = new Laya['Handler'](this, function () {
                        var W = -546;
                        Laya['Tween'].to(B['_container_fun'], {
                            x: -624
                        }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                B['_fun_in']['visible'] = !1,
                                B['_fun_out']['visible'] = !0,
                                Laya['Tween'].to(B['_container_fun'], {
                                    x: W
                                }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](B, function () {
                                        s['disabled'] = !1,
                                        U['disabled'] = !1,
                                        R['disabled'] = !1,
                                        B['_fun_out']['visible'] = !0;
                                    }), 0, !0, !0);
                            })),
                        s['disabled'] = !0,
                        U['disabled'] = !0,
                        R['disabled'] = !0;
                    });
                    var W = this['_fun_in']['getChildByName']('btn_autolipai'),
                    q = this['_fun_out']['getChildByName']('btn_autolipai2'),
                    Q = this['_fun_out']['getChildByName']('autolipai'),
                    _ = Laya['LocalStorage']['getItem']('autolipai'),
                    b = !0;
                    b = _ && '' != _ ? 'true' == _ : !0,
                    this['refreshFuncBtnShow'](W, Q, b),
                    W['clickHandler'] = q['clickHandler'] = Laya['Handler']['create'](this, function () {
                        view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                        B['refreshFuncBtnShow'](W, Q, view['DesktopMgr'].Inst['auto_liqi']),
                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                    }, null, !1);
                    var D = this['_fun_in']['getChildByName']('btn_autohu'),
                    c = this['_fun_out']['getChildByName']('btn_autohu2'),
                    E = this['_fun_out']['getChildByName']('autohu');
                    this['refreshFuncBtnShow'](D, E, !1),
                    D['clickHandler'] = c['clickHandler'] = Laya['Handler']['create'](this, function () {
                        view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                        B['refreshFuncBtnShow'](D, E, view['DesktopMgr'].Inst['auto_hule']);
                    }, null, !1);
                    var h = this['_fun_in']['getChildByName']('btn_autonoming'),
                    e = this['_fun_out']['getChildByName']('btn_autonoming2'),
                    P = this['_fun_out']['getChildByName']('autonoming');
                    this['refreshFuncBtnShow'](h, P, !1),
                    h['clickHandler'] = e['clickHandler'] = Laya['Handler']['create'](this, function () {
                        view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                        B['refreshFuncBtnShow'](h, P, view['DesktopMgr'].Inst['auto_nofulu']);
                    }, null, !1);
                    var K = this['_fun_in']['getChildByName']('btn_automoqie'),
                    o = this['_fun_out']['getChildByName']('btn_automoqie2'),
                    I = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](K, I, !1),
                    K['clickHandler'] = o['clickHandler'] = Laya['Handler']['create'](this, function () {
                        view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                        B['refreshFuncBtnShow'](K, I, view['DesktopMgr'].Inst['auto_moqie']);
                    }, null, !1),
                    'kr' == GameMgr['client_language'] && (Q['scale'](0.9, 0.9), E['scale'](0.9, 0.9), P['scale'](0.9, 0.9), I['scale'](0.9, 0.9)),
                    Laya['Browser'].onPC && !GameMgr['inConch'] ? (s['visible'] = !1, c['visible'] = !0, q['visible'] = !0, e['visible'] = !0, o['visible'] = !0) : (s['visible'] = !0, c['visible'] = !1, q['visible'] = !1, e['visible'] = !1, o['visible'] = !1);
                },
                b['prototype']['noAutoLipai'] = function () {
                    var B = this['_container_fun']['getChildByName']('btn_autolipai');
                    view['DesktopMgr'].Inst['auto_liqi'] = !0,
                    B['clickHandler'].run();
                },
                b['prototype']['resetFunc'] = function () {
                    var B = Laya['LocalStorage']['getItem']('autolipai'),
                    s = !0;
                    s = B && '' != B ? 'true' == B : !0;
                    var U = this['_fun_in']['getChildByName']('btn_autolipai'),
                    R = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](U, R, s),
                    Laya['LocalStorage']['setItem']('autolipai', s ? 'true' : 'false'),
                    view['DesktopMgr'].Inst['setAutoLiPai'](s);
                    var W = this['_fun_in']['getChildByName']('btn_autohu'),
                    q = this['_fun_out']['getChildByName']('autohu');
                    this['refreshFuncBtnShow'](W, q, view['DesktopMgr'].Inst['auto_hule']);
                    var Q = this['_fun_in']['getChildByName']('btn_autonoming'),
                    _ = this['_fun_out']['getChildByName']('autonoming');
                    this['refreshFuncBtnShow'](Q, _, view['DesktopMgr'].Inst['auto_nofulu']);
                    var b = this['_fun_in']['getChildByName']('btn_automoqie'),
                    D = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](b, D, view['DesktopMgr'].Inst['auto_moqie']),
                    this['_container_fun'].x = -546,
                    this['_fun_in']['visible'] = !1,
                    this['_fun_out']['visible'] = !0; {
                        var c = this['_fun_out']['getChildByName']('btn_func');
                        this['_fun_out']['getChildByName']('btn_func2');
                    }
                    c['disabled'] = !1,
                    c['disabled'] = !1;
                },
                b['prototype']['setDora'] = function (B, s) {
                    if (0 > B || B >= this['doras']['length'])
                        return console['error']('setDora pos错误'), void 0;
                    var U = 'myres2/mjpm/' + (s['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                    this['doras'][B].skin = game['Tools']['localUISrc'](U + s['toString'](!1) + '.png'),
                    this['front_doras'][B]['visible'] = !s['touming'],
                    this['front_doras'][B].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                },
                b['prototype']['initRoom'] = function () {
                    var s = this;
                    if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                        for (var U = {}, R = 0; R < view['DesktopMgr'].Inst['player_datas']['length']; R++) {
                            for (var W = view['DesktopMgr'].Inst['player_datas'][R]['character'], q = W['charid'], Q = cfg['item_definition']['character'].find(q).emo, _ = 0; 9 > _; _++) {
                                var b = Q + '/' + _['toString']() + '.png';
                                U[b] = 1;
                            }
                            if (W['extra_emoji'])
                                for (var _ = 0; _ < W['extra_emoji']['length']; _++) {
                                    var b = Q + '/' + W['extra_emoji'][_]['toString']() + '.png';
                                    U[b] = 1;
                                }
                        }
                        var D = [];
                        for (var c in U)
                            D.push(c);
                        this['block_emo'].me.x = 1878,
                        this['block_emo']['reset'](),
                        game['LoadMgr']['loadResImage'](D, Laya['Handler']['create'](this, function () {
                                s['block_emo']['initRoom']();
                            })),
                        this['_btn_collect']['visible'] = !1;
                    } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                        this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                    else {
                        for (var E = !1, R = 0; R < view['DesktopMgr'].Inst['player_datas']['length']; R++) {
                            var h = view['DesktopMgr'].Inst['player_datas'][R];
                            if (h && null != h['account_id'] && h['account_id'] == GameMgr.Inst['account_id']) {
                                E = !0;
                                break;
                            }
                        }
                        this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                        this['_btn_collect']['visible'] = E;
                    }
                    if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                        for (var e = 0, R = 0; R < view['DesktopMgr'].Inst['player_datas']['length']; R++) {
                            var h = view['DesktopMgr'].Inst['player_datas'][R];
                            h && null != h['account_id'] && 0 != h['account_id'] && e++;
                        }
                        1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                    }
                    for (var P = 0, R = 0; R < view['DesktopMgr'].Inst['player_datas']['length']; R++) {
                        var h = view['DesktopMgr'].Inst['player_datas'][R];
                        h && null != h['account_id'] && 0 != h['account_id'] && P++;
                    }
                    this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                    this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                    this['enable'] = !0,
                    this['setLiqibang'](0),
                    this['setBen'](0);
                    var K = this.me['getChildByName']('container_lefttop');
                    if (K['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                        K['getChildByName']('num_lizhi_0')['visible'] = !1, K['getChildByName']('num_lizhi_1')['visible'] = !1, K['getChildByName']('num_ben_0')['visible'] = !1, K['getChildByName']('num_ben_1')['visible'] = !1, K['getChildByName']('container_doras')['visible'] = !1, K['getChildByName']('gamemode')['visible'] = !1, K['getChildByName']('activitymode')['visible'] = !0, K['getChildByName']('MD5').y = 63, K['getChildByName']('MD5')['width'] = 239, K['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), K['getChildAt'](0)['width'] = 280, K['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (K['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, K['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (K['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), K['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), K['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, K['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                    else if (K['getChildByName']('num_lizhi_0')['visible'] = !0, K['getChildByName']('num_lizhi_1')['visible'] = !1, K['getChildByName']('num_ben_0')['visible'] = !0, K['getChildByName']('num_ben_1')['visible'] = !0, K['getChildByName']('container_doras')['visible'] = !0, K['getChildByName']('gamemode')['visible'] = !0, K['getChildByName']('activitymode')['visible'] = !1, K['getChildByName']('MD5').y = 51, K['getChildByName']('MD5')['width'] = 276, K['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), K['getChildAt'](0)['width'] = 313, K['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                        var o = view['DesktopMgr'].Inst['game_config'],
                        I = game['Tools']['get_room_desc'](o);
                        this['label_gamemode'].text = I.text,
                        this['container_gamemode']['visible'] = !0;
                    } else
                        this['container_gamemode']['visible'] = !1;
                    if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                        if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                            this['container_jjc']['visible'] = !0,
                            this['label_jjc_win'].text = B['UI_Activity_JJC']['win_count']['toString']();
                            for (var R = 0; 3 > R; R++)
                                this['container_jjc']['getChildByName'](R['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (B['UI_Activity_JJC']['lose_count'] > R ? 'd' : 'l') + '.png');
                        } else
                            this['container_jjc']['visible'] = !1;
                    else
                        this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                    B['UI_Replay'].Inst && (B['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                    var Y = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                    f = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                    view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (B['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](Y, !0), game['Tools']['setGrayDisable'](f, !0)) : (game['Tools']['setGrayDisable'](Y, !1), game['Tools']['setGrayDisable'](f, !1), B['UI_Astrology'].Inst.hide());
                    for (var R = 0; 4 > R; R++)
                        this['_player_infos'][R]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][R]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][R]['yongchang'].hide();
                },
                b['prototype']['onCloseRoom'] = function () {
                    this['_network_delay']['close_refresh']();
                },
                b['prototype']['refreshSeat'] = function (B) {
                    void 0 === B && (B = !1);
                    for (var s = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), U = 0; 4 > U; U++) {
                        var R = view['DesktopMgr'].Inst['localPosition2Seat'](U),
                        W = this['_player_infos'][U];
                        if (0 > R)
                            W['container']['visible'] = !1;
                        else {
                            W['container']['visible'] = !0;
                            var q = view['DesktopMgr'].Inst['getPlayerName'](R);
                            game['Tools']['SetNickname'](W.name, q, !1, !0),
                            W.head.id = s[R]['avatar_id'],
                            W.head['set_head_frame'](s[R]['account_id'], s[R]['avatar_frame']);
                            var Q = (cfg['item_definition'].item.get(s[R]['avatar_frame']), cfg['item_definition'].view.get(s[R]['avatar_frame']));
                            if (W.head.me.y = Q && Q['sargs'][0] ? W['head_origin_y'] - Number(Q['sargs'][0]) / 100 * this['head_offset_y'] : W['head_origin_y'], W['avatar'] = s[R]['avatar_id'], 0 != U) {
                                var _ = s[R]['account_id'] && 0 != s[R]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                b = s[R]['account_id'] && 0 != s[R]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                D = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                B ? W['headbtn']['onChangeSeat'](_, b, D) : W['headbtn']['reset'](_, b, D);
                            }
                            W['title'].id = s[R]['title'] ? game['Tools']['titleLocalization'](s[R]['account_id'], s[R]['title']) : 0;
                        }
                    }
                },
                b['prototype']['refreshNames'] = function () {
                    for (var B = 0; 4 > B; B++) {
                        var s = view['DesktopMgr'].Inst['localPosition2Seat'](B),
                        U = this['_player_infos'][B];
                        if (0 > s)
                            U['container']['visible'] = !1;
                        else {
                            U['container']['visible'] = !0;
                            var R = view['DesktopMgr'].Inst['getPlayerName'](s);
                            game['Tools']['SetNickname'](U.name, R, !1, !0);
                        }
                    }
                },
                b['prototype']['refreshLinks'] = function () {
                    for (var B = (view['DesktopMgr'].Inst.seat, 0); 4 > B; B++) {
                        var s = view['DesktopMgr'].Inst['localPosition2Seat'](B);
                        view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][B]['disconnect']['visible'] = -1 == s || 0 == B ? !1 : view['DesktopMgr']['player_link_state'][s] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][B]['disconnect']['visible'] = -1 == s || 0 == view['DesktopMgr'].Inst['player_datas'][s]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][s] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][B]['disconnect']['visible'] = !1);
                    }
                },
                b['prototype']['setBen'] = function (B) {
                    B > 99 && (B = 99);
                    var s = this.me['getChildByName']('container_lefttop'),
                    U = s['getChildByName']('num_ben_0'),
                    R = s['getChildByName']('num_ben_1');
                    B >= 10 ? (U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 10)['toString']() + '.png'), R.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), R['visible'] = !0) : (U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), R['visible'] = !1);
                },
                b['prototype']['setLiqibang'] = function (B, s) {
                    void 0 === s && (s = !0),
                    B > 999 && (B = 999);
                    var U = this.me['getChildByName']('container_lefttop'),
                    R = U['getChildByName']('num_lizhi_0'),
                    W = U['getChildByName']('num_lizhi_1'),
                    q = U['getChildByName']('num_lizhi_2');
                    B >= 100 ? (q.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), W.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](B / 10) % 10)['toString']() + '.png'), R.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 100)['toString']() + '.png'), W['visible'] = !0, q['visible'] = !0) : B >= 10 ? (W.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (B % 10)['toString']() + '.png'), R.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](B / 10)['toString']() + '.png'), W['visible'] = !0, q['visible'] = !1) : (R.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + B['toString']() + '.png'), W['visible'] = !1, q['visible'] = !1),
                    view['DesktopMgr'].Inst['setRevealScore'](B, s);
                },
                b['prototype']['reset_rounds'] = function () {
                    this['closeCountDown'](),
                    this['showscoredeltaing'] = !1,
                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                    for (var B = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, s = 0; s < this['doras']['length']; s++)
                        if (this['front_doras'][s].skin = '', this['doras'][s].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                            this['front_doras'][s]['visible'] = !1, this['doras'][s].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                        else {
                            var U = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                            this['front_doras'][s]['visible'] = !0,
                            this['doras'][s].skin = game['Tools']['localUISrc'](U + '5z.png'),
                            this['front_doras'][s].skin = game['Tools']['localUISrc'](B + 'back.png');
                        }
                    for (var s = 0; 4 > s; s++)
                        this['_player_infos'][s].emo['reset'](), this['_player_infos'][s].que['visible'] = !1;
                    this['_timecd']['reset'](),
                    Laya['timer']['clearAll'](this),
                    Laya['timer']['clearAll'](this['label_md5']),
                    view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                    this['label_md5']['visible'] = !1;
                },
                b['prototype']['showCountDown'] = function (B, s) {
                    this['_timecd']['showCD'](B, s);
                },
                b['prototype']['setZhenting'] = function (B) {
                    this['img_zhenting']['visible'] = B;
                },
                b['prototype']['shout'] = function (B, s, U, R) {
                    app.Log.log('shout:' + B + ' type:' + s);
                    try {
                        var W = this['_player_infos'][B],
                        q = W['container_shout'],
                        Q = q['getChildByName']('img_content'),
                        _ = q['getChildByName']('illust')['getChildByName']('illust'),
                        b = q['getChildByName']('img_score');
                        if (0 == R)
                            b['visible'] = !1;
                        else {
                            b['visible'] = !0;
                            var D = 0 > R ? 'm' + Math.abs(R) : R;
                            b.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + D + '.png');
                        }
                        '' == s ? Q['visible'] = !1 : (Q['visible'] = !0, Q.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + s + '.png')),
                        view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (q['getChildByName']('illust')['visible'] = !1, q['getChildAt'](2)['visible'] = !0, q['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](q['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (q['getChildByName']('illust')['visible'] = !0, q['getChildAt'](2)['visible'] = !1, q['getChildAt'](0)['visible'] = !0, _['scaleX'] = 1, game['Tools']['charaPart'](U['avatar_id'], _, 'full', W['illustrect'], !0, !0));
                        var c = 0,
                        E = 0;
                        switch (B) {
                        case 0:
                            c = -105,
                            E = 0;
                            break;
                        case 1:
                            c = 500,
                            E = 0;
                            break;
                        case 2:
                            c = 0,
                            E = -300;
                            break;
                        default:
                            c = -500,
                            E = 0;
                        }
                        q['visible'] = !0,
                        q['alpha'] = 0,
                        q.x = W['shout_origin_x'] + c,
                        q.y = W['shout_origin_y'] + E,
                        Laya['Tween'].to(q, {
                            alpha: 1,
                            x: W['shout_origin_x'],
                            y: W['shout_origin_y']
                        }, 70),
                        Laya['Tween'].to(q, {
                            alpha: 0
                        }, 150, null, null, 600),
                        Laya['timer'].once(800, this, function () {
                            Laya['loader']['clearTextureRes'](_.skin),
                            q['visible'] = !1;
                        });
                    } catch (h) {
                        var e = {};
                        e['error'] = h['message'],
                        e['stack'] = h['stack'],
                        e['method'] = 'shout',
                        e['class'] = 'UI_DesktopInfos',
                        GameMgr.Inst['onFatalError'](e);
                    }
                },
                b['prototype']['closeCountDown'] = function () {
                    this['_timecd']['close']();
                },
                b['prototype']['refreshFuncBtnShow'] = function (B, s, U) {
                    var R = B['getChildByName']('img_choosed');
                    s['color'] = B['mouseEnabled'] ? U ? '#3bd647' : '#7992b3' : '#565656',
                    R['visible'] = U;
                },
                b['prototype']['onShowEmo'] = function (B, s) {
                    var U = this['_player_infos'][B];
                    0 != B && U['headbtn']['emj_banned'] || U.emo.show(B, s);
                },
                b['prototype']['changeHeadEmo'] = function (B) { {
                        var s = view['DesktopMgr'].Inst['seat2LocalPosition'](B);
                        this['_player_infos'][s];
                    }
                },
                b['prototype']['onBtnShowScoreDelta'] = function () {
                    var B = this;
                    this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                            B['showscoredeltaing'] = !1,
                            view['DesktopMgr'].Inst['setScoreDelta'](!1);
                        }));
                },
                b['prototype']['btn_seeinfo'] = function (s) {
                    if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                        var U = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](s)]['account_id'];
                        if (U) {
                            var R = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                            W = 1,
                            q = view['DesktopMgr'].Inst['game_config'].meta;
                            q && q['mode_id'] == game['EMatchMode']['shilian'] && (W = 4);
                            var Q = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](s));
                            B['UI_OtherPlayerInfo'].Inst.show(U, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, R ? 1 : 2, W, Q['nickname']);
                        }
                    }
                },
                b['prototype']['openDora3BeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openPeipaiOpenBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openDora3BeginShine'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](244),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openMuyuOpenBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openShilianOpenBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openXiuluoOpenBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openChuanmaBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openJiuChaoBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openAnPaiBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openTopMatchOpenBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openZhanxingBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openTianmingBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['openYongchangBeginEffect'] = function () {
                    var B = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, B, function () {
                        B['destory']();
                    });
                },
                b['prototype']['logUpEmoInfo'] = function () {
                    this['block_emo']['sendEmoLogUp'](),
                    this['min_double_time'] = 0,
                    this['max_double_time'] = 0;
                },
                b['prototype']['onCollectChange'] = function () {
                    this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (B['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                },
                b['prototype']['showAIEmo'] = function () {
                    for (var B = this, s = function (s) {
                        var R = view['DesktopMgr'].Inst['player_datas'][s];
                        R['account_id'] && 0 != R['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), U, function () {
                            B['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](s), Math['floor'](9 * Math['random']()));
                        });
                    }, U = this, R = 0; R < view['DesktopMgr'].Inst['player_datas']['length']; R++)
                        s(R);
                },
                b['prototype']['setGapType'] = function (B, s) {
                    void 0 === s && (s = !1);
                    for (var U = 0; U < B['length']; U++) {
                        var R = view['DesktopMgr'].Inst['seat2LocalPosition'](U);
                        this['_player_infos'][R].que['visible'] = !0,
                        s && (0 == U ? (this['_player_infos'][R].que.pos(this['gapStartPosLst'][U].x + this['selfGapOffsetX'][B[U]], this['gapStartPosLst'][U].y), this['_player_infos'][R].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][R].que, {
                                    scaleX: 0.35,
                                    scaleY: 0.35,
                                    x: this['_player_infos'][R]['que_target_pos'].x,
                                    y: this['_player_infos'][R]['que_target_pos'].y
                                }, 200)) : (this['_player_infos'][R].que.pos(this['gapStartPosLst'][U].x, this['gapStartPosLst'][U].y), this['_player_infos'][R].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][R].que, {
                                    scaleX: 0.35,
                                    scaleY: 0.35,
                                    x: this['_player_infos'][R]['que_target_pos'].x,
                                    y: this['_player_infos'][R]['que_target_pos'].y
                                }, 200))),
                        this['_player_infos'][R].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + B[U] + '.png');
                    }
                },
                b['prototype']['OnNewCard'] = function (B, s) {
                    if (s) {
                        var U = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, U, function () {
                            U['destory']();
                        }),
                        Laya['timer'].once(1300, this, function () {
                            this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                        });
                    } else
                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                },
                b['prototype']['ShowSpellCard'] = function (s, U) {
                    void 0 === U && (U = !1),
                    B['UI_FieldSpell'].Inst && !B['UI_FieldSpell'].Inst['enable'] && B['UI_FieldSpell'].Inst.show(s, U);
                },
                b['prototype']['HideSpellCard'] = function () {
                    B['UI_FieldSpell'].Inst && B['UI_FieldSpell'].Inst['close']();
                },
                b['prototype']['SetTianMingRate'] = function (B, s, U) {
                    void 0 === U && (U = !1);
                    var R = view['DesktopMgr'].Inst['seat2LocalPosition'](B),
                    W = this['_player_infos'][R]['tianming'];
                    U && 5 != s && W.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + s + '.png') && Laya['Tween'].to(W, {
                        scaleX: 1.1,
                        scaleY: 1.1
                    }, 200, null, Laya['Handler']['create'](this, function () {
                            Laya['Tween'].to(W, {
                                scaleX: 1,
                                scaleY: 1
                            }, 200);
                        })),
                    W.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + s + '.png');
                },
                b['prototype']['ResetYongChang'] = function () {
                    for (var B = 0; 4 > B; B++)
                        this['_player_infos'][B]['yongchang']['resetToStart']();
                },
                b['prototype']['SetYongChangRate'] = function (B, s, U, R, W, q) {
                    this['_player_infos'][B]['yongchang'].show(s, U, R, W, q);
                },
                b.Inst = null,
                b;
            }
            (B['UIBase']);
            B['UI_DesktopInfo'] = _;
        }
        (uiscript || (uiscript = {}));
        








        uiscript.UI_Info.Init  = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var s = this,
            U = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
            this['read_list'] = [],
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                lang: U,
                platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
            }, function (U, R) {
                U || R['error'] ? B['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', U, R) : s['_refreshAnnouncements'](R);
                    // START
                    if (( U || R['error']) === null) {
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
                    for (var R = GameMgr['inDmm'] ? 'web_dmm' : 'web', W = 0, q = B['update_list']; W < q['length']; W++) {
                        var Q = q[W];
                        if (Q.lang == U && Q['platform'] == R) {
                            s['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }





        uiscript.UI_Info._refreshAnnouncements  = function (B) {
            // START
            B.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (B['announcements'] && (this['announcements'] = B['announcements']), B.sort && (this['announcement_sort'] = B.sort), B['read_list']) {
                this['read_list'] = [];
                for (var s = 0; s < B['read_list']['length']; s++)
                    this['read_list'].push(B['read_list'][s]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }









        // 加载CG 
        !function (B) {
            var s = function () {
                function s(s, U) {
                    var R = this;
                    this['cg_id'] = 0,
                    this.me = s,
                    this['father'] = U;
                    var W = this.me['getChildByName']('btn_detail');
                    W['clickHandler'] = new Laya['Handler'](this, function () {
                        B['UI_Bag'].Inst['locking'] || R['father']['changeLoadingCG'](R['cg_id']);
                    }),
                    game['Tools']['setButtonLongPressHandler'](W, new Laya['Handler'](this, function (s) {
                            if (!B['UI_Bag'].Inst['locking']) {
                                'down' == s ? Laya['timer'].once(800, R, function () {
                                    B['UI_CG_Yulan'].Inst.show(R['cg_id']);
                                }) : ('over' == s || 'up' == s) && Laya['timer']['clearAll'](R);
                            }
                        })),
                    this['using'] = W['getChildByName']('using'),
                    this.icon = W['getChildByName']('icon'),
                    this.name = W['getChildByName']('name'),
                    this.info = W['getChildByName']('info'),
                    this['label_time'] = this.info['getChildByName']('info'),
                    this['sprite_new'] = W['getChildByName']('new');
                }
                return s['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var s = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != B['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                    game['LoadMgr']['setImgSkin'](this.icon, s['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var U = !this['father']['last_seen_cg_map'][this['cg_id']], R = 0, W = s['unlock_items']; R < W['length']; R++) {
                        var q = W[R];
                        if (q && B['UI_Bag']['get_item_count'](q) > 0) {
                            var Q = cfg['item_definition'].item.get(q);
                            if (this.name.text = Q['name_' + GameMgr['client_language']], !Q['item_expire']) {
                                this.info['visible'] = !1,
                                U = -1 != this['father']['new_cg_ids']['indexOf'](q);
                                break;
                            }
                            this.info['visible'] = !0,
                            this['label_time'].text = game['Tools']['strOfLocalization'](3119) + Q['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = U;
                },
                s['prototype']['reset'] = function () {
                    game['LoadMgr']['clearImgSkin'](this.icon),
                    Laya['Loader']['clearTextureRes'](this.icon.skin);
                },
                s;
            }
            (),
            U = function () {
                function U(s) {
                    var U = this;
                    this['seen_cg_map'] = null,
                    this['last_seen_cg_map'] = null,
                    this['new_cg_ids'] = [],
                    this.me = s,
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                    this['no_info'] = this.me['getChildByName']('no_info'),
                    this.head = this.me['getChildByName']('head');
                    var R = this.me['getChildByName']('choose');
                    this['label_choose_all'] = R['getChildByName']('tip'),
                    R['clickHandler'] = new Laya['Handler'](this, function () {
                        if (U['all_choosed'])
                            B['UI_Loading']['Loading_Images'] = [];
                        else {
                            B['UI_Loading']['Loading_Images'] = [];
                            for (var s = 0, R = U['items']; s < R['length']; s++) {
                                var W = R[s];
                                B['UI_Loading']['Loading_Images'].push(W.id);
                            }
                        }
                        U['scrollview']['wantToRefreshAll'](),
                        U['refreshChooseState']();
                                        // START
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                        //    images: B['UI_Loading']['Loading_Images']
                        //}, function (s, U) {
                        //    (s || U['error']) && B['UIMgr'].Inst['showNetReqError']('setLoadingImage', s, U);
                        //});
                                        // END
                    });
                }
                return U['prototype']['have_redpoint'] = function () {
                                // START
                    //if (B['UI_Bag']['new_cg_ids']['length'] > 0)
                    //    return !0;
                                // END
                    var s = [];
                    if (!this['seen_cg_map']) {
                        var U = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, U) {
                            U = game['Tools']['dddsss'](U);
                            for (var R = U['split'](','), W = 0; W < R['length']; W++)
                                this['seen_cg_map'][Number(R[W])] = 1;
                        }
                    }
                    cfg['item_definition']['loading_image']['forEach'](function (U) {
                        if (U['unlock_items'][1] && 0 == B['UI_Bag']['get_item_count'](U['unlock_items'][0]) && B['UI_Bag']['get_item_count'](U['unlock_items'][1]) > 0) {
                            if (GameMgr['regionLimited']) {
                                var R = cfg['item_definition'].item.get(U['unlock_items'][1]);
                                if (1 == R['region_limit'])
                                    return;
                            }
                            s.push(U.id);
                        }
                    });
                    for (var q = 0, Q = s; q < Q['length']; q++) {
                        var _ = Q[q];
                        if (!this['seen_cg_map'][_])
                            return !0;
                    }
                    return !1;
                },
                U['prototype'].show = function () {
                    var s = this;
                    if (this['new_cg_ids'] = B['UI_Bag']['new_cg_ids'], B['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                        var U = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, U) {
                            U = game['Tools']['dddsss'](U);
                            for (var R = U['split'](','), W = 0; W < R['length']; W++)
                                this['seen_cg_map'][Number(R[W])] = 1;
                        }
                    }
                    this['last_seen_cg_map'] = this['seen_cg_map'];
                    var q = '';
                    cfg['item_definition']['loading_image']['forEach'](function (U) {
                        for (var R = 0, W = U['unlock_items']; R < W['length']; R++) {
                            var Q = W[R];
                            if (Q && B['UI_Bag']['get_item_count'](Q) > 0) {
                                var _ = cfg['item_definition'].item.get(Q);
                                if (1 == _['region_limit'] && GameMgr['regionLimited'])
                                    continue;
                                return s['items'].push(U),
                                s['seen_cg_map'][U.id] = 1,
                                '' != q && (q += ','),
                                q += U.id,
                                void 0;
                            }
                        }
                    }),
                    this['items'].sort(function (B, s) {
                        return s.sort - B.sort;
                    }),
                    Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](q)),
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
                U['prototype']['close'] = function () {
                    this.me['visible'] = !1,
                    this['items'] = [],
                    this['scrollview']['reset'](),
                    game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                    this['_changed'] && B['UI_Loading']['loadNextCG']();
                },
                U['prototype']['render_item'] = function (B) {
                    var U = B['index'],
                    R = B['container'],
                    W = B['cache_data'];
                    if (this['items'][U]) {
                        W.item || (W.item = new s(R, this));
                        var q = W.item;
                        q['cg_id'] = this['items'][U].id,
                        q.show();
                    }
                },
                U['prototype']['changeLoadingCG'] = function (s) {
                    this['_changed'] = !0;
                    for (var U = 0, R = 0, W = 0, q = this['items']; W < q['length']; W++) {
                        var Q = q[W];
                        if (Q.id == s) {
                            U = R;
                            break;
                        }
                        R++;
                    }
                    var _ = B['UI_Loading']['Loading_Images']['indexOf'](s);
                    -1 == _ ? B['UI_Loading']['Loading_Images'].push(s) : B['UI_Loading']['Loading_Images']['splice'](_, 1),
                    this['scrollview']['wantToRefreshItem'](U),
                    this['refreshChooseState'](),
                                        // START
                                        MMP.settings.loadingCG = B['UI_Loading']['Loading_Images'];
                                    MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                    //    images: B['UI_Loading']['Loading_Images']
                    //}, function (s, U) {
                    //    (s || U['error']) && B['UIMgr'].Inst['showNetReqError']('setLoadingImage', s, U);
                    //});
                                    // END
                },
                U['prototype']['refreshChooseState'] = function () {
                    this['all_choosed'] = B['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                    this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                },
                U['prototype']['when_update_data'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                U;
            }
            ();
            B['UI_Bag_PageCG'] = U;
        }
        (uiscript || (uiscript = {}));
        

        // 懒b作者终于修复了对局结束变婚皮的问题 
        uiscript.UI_MJReward.prototype.show = function (s) {
            // START
            view['DesktopMgr'].Inst['rewardinfo']['main_character'] = {
                "level": 5,
                "exp": 0,
                "add": 0
            }
            var B = uiscript;
            // END
    var U = this,
    R = view['DesktopMgr'].Inst['rewardinfo'];
    this['page_jiban'].me['visible'] = !1,
    this['page_jiban_gift'].me['visible'] = !1,
    this['complete'] = s,
    this['page_box'].show(),
    B['UIBase']['anim_alpha_in'](this['page_box'].me, {
        x: -50
    }, 150),
    R['main_character'] ? (this['page_jiban'].show(), B['UIBase']['anim_alpha_in'](this['page_jiban'].me, {
            x: -50
        }, 150, 60)) : R['character_gift'] && (this['page_jiban_gift'].show(), B['UIBase']['anim_alpha_in'](this['page_jiban_gift'].me, {
            x: -50
        }, 150, 60)),
    Laya['timer'].once(600, this, function () {
        var B = 0;
        U['page_box']['doanim'](Laya['Handler']['create'](U, function () {
                B++,
                2 == B && U['showGrade'](s);
            })),
        R['main_character'] ? U['page_jiban']['doanim'](Laya['Handler']['create'](U, function () {
                B++,
                2 == B && U['showGrade'](s);
            })) : R['character_gift'] ? U['page_jiban_gift']['doanim'](Laya['Handler']['create'](U, function () {
                B++,
                2 == B && U['showGrade'](s);
            })) : (B++, 2 == B && U['showGrade'](s));
    }),
    this['enable'] = !0;
}






uiscript.UI_Entrance.prototype._onLoginSuccess  = function (s, U, R) {
    var B = uiscript;
var W = this;
if (void 0 === R && (R = !1), app.Log.log('登陆：' + JSON['stringify'](U)), GameMgr.Inst['account_id'] = U['account_id'], GameMgr.Inst['account_data'] = U['account'], B['UI_ShiMingRenZheng']['renzhenged'] = U['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, U['account']['platform_diamond'])
for (var q = U['account']['platform_diamond'], Q = 0; Q < q['length']; Q++)
    GameMgr.Inst['account_numerical_resource'][q[Q].id] = q[Q]['count'];
if (U['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = U['account']['skin_ticket']), U['account']['platform_skin_ticket'])
for (var _ = U['account']['platform_skin_ticket'], Q = 0; Q < _['length']; Q++)
    GameMgr.Inst['account_numerical_resource'][_[Q].id] = _[Q]['count'];
GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
U['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = U['game_info']['location'], GameMgr.Inst['mj_game_token'] = U['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = U['game_info']['game_uuid']),
U['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : s['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', U['access_token']), GameMgr.Inst['sociotype'] = s, GameMgr.Inst['access_token'] = U['access_token']);
var b = this,
D = function () {
GameMgr.Inst['onLoadStart']('login'),
Laya['LocalStorage']['removeItem']('__ad_s'),
B['UI_Loading'].Inst.show('load_lobby'),
b['enable'] = !1,
b['scene']['close'](),
B['UI_Entrance_Mail_Regist'].Inst['close'](),
b['login_loading']['close'](),
B['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](b, function () {
        GameMgr.Inst['afterLogin'](),
        b['route_info']['onClose'](),
        GameMgr.Inst['account_data']['anti_addiction'] && B['UIMgr'].Inst['ShowPreventAddiction'](),
        b['destroy'](),
        b['disposeRes'](),
        B['UI_Add2Desktop'].Inst && (B['UI_Add2Desktop'].Inst['destroy'](), B['UI_Add2Desktop'].Inst = null);
    }), Laya['Handler']['create'](b, function (s) {
        return B['UI_Loading'].Inst['setProgressVal'](0.2 * s);
    }, null, !1));
},
c = Laya['Handler']['create'](this, function () {
0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (s, U) {
    s ? (app.Log.log('fetchRefundOrder err:' + s), W['showError'](game['Tools']['strOfLocalization'](2061), s), W['showContainerLogin']()) : (B['UI_Refund']['orders'] = U['orders'], B['UI_Refund']['clear_deadline'] = U['clear_deadline'], B['UI_Refund']['message'] = U['message'], D());
}) : D();
});
    // START
//if (B['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
//    for (var E = 0, h = GameMgr.Inst['account_data']['loading_image']; E < h['length']; E++) {
//        var e = h[E];
//        cfg['item_definition']['loading_image'].get(e) && B['UI_Loading']['Loading_Images'].push(e);
//    }
    uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
    // END
B['UI_Loading']['loadNextCG'](),
'chs' != GameMgr['client_type'] || U['account']['phone_verify'] ? c.run() : (B['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, B['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
        app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (s, U) {
            s || U['error'] ? W['showError'](s, U['error']) : 0 == U['phone_login'] ? B['UI_Create_Phone_Account'].Inst.show(c) : B['UI_Canot_Create_Phone_Account'].Inst.show(c);
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
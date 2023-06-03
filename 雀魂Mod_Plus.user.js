// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.236
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
        !function (k) {
            var n;
            !function (k) {
                k[k.none = 0] = 'none',
                    k[k['daoju'] = 1] = 'daoju',
                    k[k.gift = 2] = 'gift',
                    k[k['fudai'] = 3] = 'fudai',
                    k[k.view = 5] = 'view';
            }
                (n = k['EItemCategory'] || (k['EItemCategory'] = {}));
            var Z = function (Z) {
                function p() {
                    var k = Z.call(this, new ui['lobby']['bagUI']()) || this;
                    return k['container_top'] = null,
                        k['container_content'] = null,
                        k['locking'] = !1,
                        k.tabs = [],
                        k['page_item'] = null,
                        k['page_gift'] = null,
                        k['page_skin'] = null,
                        k['page_cg'] = null,
                        k['select_index'] = 0,
                        p.Inst = k,
                        k;
                }
                return __extends(p, Z),
                    p.init = function () {
                        var k = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (n) {
                            var Z = n['update'];
                            Z && Z.bag && (k['update_data'](Z.bag['update_items']), k['update_daily_gain_data'](Z.bag));
                        }, null, !1)),
                            this['fetch']();
                    },
                    p['fetch'] = function () {
                        var n = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (Z, p) {
                                if (Z || p['error'])
                                    k['UIMgr'].Inst['showNetReqError']('fetchBagInfo', Z, p);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](p));
                                    var V = p.bag;
                                    if (V) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of y["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            n._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    n._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }


                                        } else {
                                            if (V['items'])
                                                for (var m = 0; m < V['items']['length']; m++) {
                                                    var u = V['items'][m]['item_id'],
                                                        L = V['items'][m]['stack'],
                                                        F = cfg['item_definition'].item.get(u);
                                                    F && (n['_item_map'][u] = {
                                                        item_id: u,
                                                        count: L,
                                                        category: F['category']
                                                    }, 1 == F['category'] && 3 == F.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: u
                                                    }, function () { }));
                                                }
                                            if (V['daily_gain_record'])
                                                for (var J = V['daily_gain_record'], m = 0; m < J['length']; m++) {
                                                    var A = J[m]['limit_source_id'];
                                                    n['_daily_gain_record'][A] = {};
                                                    var d = J[m]['record_time'];
                                                    n['_daily_gain_record'][A]['record_time'] = d;
                                                    var g = J[m]['records'];
                                                    if (g)
                                                        for (var b = 0; b < g['length']; b++)
                                                            n['_daily_gain_record'][A][g[b]['item_id']] = g[b]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    p['find_item'] = function (k) {
                        var n = this['_item_map'][k];
                        return n ? {
                            item_id: n['item_id'],
                            category: n['category'],
                            count: n['count']
                        }
                            : null;
                    },
                    p['get_item_count'] = function (k) {
                        var n = this['find_item'](k);
                        if (n)
                            return n['count'];
                        if ('100001' == k) {
                            for (var Z = 0, p = 0, V = GameMgr.Inst['free_diamonds']; p < V['length']; p++) {
                                var m = V[p];
                                GameMgr.Inst['account_numerical_resource'][m] && (Z += GameMgr.Inst['account_numerical_resource'][m]);
                            }
                            for (var u = 0, L = GameMgr.Inst['paid_diamonds']; u < L['length']; u++) {
                                var m = L[u];
                                GameMgr.Inst['account_numerical_resource'][m] && (Z += GameMgr.Inst['account_numerical_resource'][m]);
                            }
                            return Z;
                        }
                        if ('100004' == k) {
                            for (var F = 0, J = 0, A = GameMgr.Inst['free_pifuquans']; J < A['length']; J++) {
                                var m = A[J];
                                GameMgr.Inst['account_numerical_resource'][m] && (F += GameMgr.Inst['account_numerical_resource'][m]);
                            }
                            for (var d = 0, g = GameMgr.Inst['paid_pifuquans']; d < g['length']; d++) {
                                var m = g[d];
                                GameMgr.Inst['account_numerical_resource'][m] && (F += GameMgr.Inst['account_numerical_resource'][m]);
                            }
                            return F;
                        }
                        return '100002' == k ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    p['find_items_by_category'] = function (k) {
                        var n = [];
                        for (var Z in this['_item_map'])
                            this['_item_map'][Z]['category'] == k && n.push({
                                item_id: this['_item_map'][Z]['item_id'],
                                category: this['_item_map'][Z]['category'],
                                count: this['_item_map'][Z]['count']
                            });
                        return n;
                    },
                    p['update_data'] = function (n) {
                        for (var Z = 0; Z < n['length']; Z++) {
                            var p = n[Z]['item_id'],
                                V = n[Z]['stack'];
                            if (V > 0) {
                                this['_item_map']['hasOwnProperty'](p['toString']()) ? this['_item_map'][p]['count'] = V : this['_item_map'][p] = {
                                    item_id: p,
                                    count: V,
                                    category: cfg['item_definition'].item.get(p)['category']
                                };
                                var m = cfg['item_definition'].item.get(p);
                                1 == m['category'] && 3 == m.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: p
                                }, function () { }),
                                    5 == m['category'] && (this['new_bag_item_ids'].push(p), this['new_zhuangban_item_ids'][p] = 1),
                                    8 != m['category'] || m['item_expire'] || this['new_cg_ids'].push(p);
                            } else if (this['_item_map']['hasOwnProperty'](p['toString']())) {
                                var u = cfg['item_definition'].item.get(p);
                                u && 5 == u['category'] && k['UI_Sushe']['on_view_remove'](p),
                                    this['_item_map'][p] = 0,
                                    delete this['_item_map'][p];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var Z = 0; Z < n['length']; Z++) {
                            var p = n[Z]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](p['toString']()))
                                for (var L = this['_item_listener'][p], F = 0; F < L['length']; F++)
                                    L[F].run();
                        }
                        for (var Z = 0; Z < this['_all_item_listener']['length']; Z++)
                            this['_all_item_listener'][Z].run();
                    },
                    p['update_daily_gain_data'] = function (k) {
                        var n = k['update_daily_gain_record'];
                        if (n)
                            for (var Z = 0; Z < n['length']; Z++) {
                                var p = n[Z]['limit_source_id'];
                                this['_daily_gain_record'][p] || (this['_daily_gain_record'][p] = {});
                                var V = n[Z]['record_time'];
                                this['_daily_gain_record'][p]['record_time'] = V;
                                var m = n[Z]['records'];
                                if (m)
                                    for (var u = 0; u < m['length']; u++)
                                        this['_daily_gain_record'][p][m[u]['item_id']] = m[u]['count'];
                            }
                    },
                    p['get_item_daily_record'] = function (k, n) {
                        return this['_daily_gain_record'][k] ? this['_daily_gain_record'][k]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][k]['record_time']) ? this['_daily_gain_record'][k][n] ? this['_daily_gain_record'][k][n] : 0 : 0 : 0 : 0;
                    },
                    p['add_item_listener'] = function (k, n) {
                        this['_item_listener']['hasOwnProperty'](k['toString']()) || (this['_item_listener'][k] = []),
                            this['_item_listener'][k].push(n);
                    },
                    p['remove_item_listener'] = function (k, n) {
                        var Z = this['_item_listener'][k];
                        if (Z)
                            for (var p = 0; p < Z['length']; p++)
                                if (Z[p] === n) {
                                    Z[p] = Z[Z['length'] - 1],
                                        Z.pop();
                                    break;
                                }
                    },
                    p['add_all_item_listener'] = function (k) {
                        this['_all_item_listener'].push(k);
                    },
                    p['remove_all_item_listener'] = function (k) {
                        for (var n = this['_all_item_listener'], Z = 0; Z < n['length']; Z++)
                            if (n[Z] === k) {
                                n[Z] = n[n['length'] - 1],
                                    n.pop();
                                break;
                            }
                    },
                    p['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    p['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    p['removeZhuangBanNew'] = function (k) {
                        for (var n = 0, Z = k; n < Z['length']; n++) {
                            var p = Z[n];
                            delete this['new_zhuangban_item_ids'][p];
                        }
                    },
                    p['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    p['prototype']['onCreate'] = function () {
                        var n = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || n.hide(Laya['Handler']['create'](n, function () {
                                    return n['closeHandler'] ? (n['closeHandler'].run(), n['closeHandler'] = null, void 0) : (k['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var Z = function (k) {
                            p.tabs.push(p['container_content']['getChildByName']('tabs')['getChildByName']('btn' + k)),
                                p.tabs[k]['clickHandler'] = Laya['Handler']['create'](p, function () {
                                    n['select_index'] != k && n['on_change_tab'](k);
                                }, null, !1);
                        }, p = this, V = 0; 5 > V; V++)
                            Z(V);
                        this['page_item'] = new k['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new k['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new k['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new k['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    p['prototype'].show = function (n, Z) {
                        var p = this;
                        void 0 === n && (n = 0),
                            void 0 === Z && (Z = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = Z,
                            k['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            k['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                p['locking'] = !1;
                            }),
                            this['on_change_tab'](n),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                            3 != n && this['page_skin']['when_update_data']();
                    },
                    p['prototype'].hide = function (n) {
                        var Z = this;
                        this['locking'] = !0,
                            k['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            k['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                Z['locking'] = !1,
                                    Z['enable'] = !1,
                                    n && n.run();
                            });
                    },
                    p['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    p['prototype']['on_change_tab'] = function (k) {
                        this['select_index'] = k;
                        for (var Z = 0; Z < this.tabs['length']; Z++)
                            this.tabs[Z].skin = game['Tools']['localUISrc'](k == Z ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[Z]['getChildAt'](0)['color'] = k == Z ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), k) {
                            case 0:
                                this['page_item'].show(n['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(n.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    p['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    p['prototype']['on_skin_change'] = function () {
                        this['page_skin']['when_update_data']();
                    },
                    p['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    p['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    p['_item_map'] = {},
                    p['_item_listener'] = {},
                    p['_all_item_listener'] = [],
                    p['_daily_gain_record'] = {},
                    p['new_bag_item_ids'] = [],
                    p['new_zhuangban_item_ids'] = {},
                    p['new_cg_ids'] = [],
                    p.Inst = null,
                    p;
            }
                (k['UIBase']);
            k['UI_Bag'] = Z;
        }
            (uiscript || (uiscript = {}));








        // 修改牌桌上角色
        !function (k) {
            var n = function () {
                function n() {
                    var n = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = k['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (k) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(k),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(k));
                                    }
                                }));
                            }
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](k)),
                                n['loaded_player_count'] = k['ready_id_list']['length'],
                                n['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](n['loaded_player_count'], n['real_player_count']);
                        }));
                }
                return Object['defineProperty'](n, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new n() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    n['prototype']['OpenConnect'] = function (n, Z, p, V) {
                        var m = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            k['Scene_Lobby'].Inst && k['Scene_Lobby'].Inst['active'] && (k['Scene_Lobby'].Inst['active'] = !1),
                            k['Scene_Huiye'].Inst && k['Scene_Huiye'].Inst['active'] && (k['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                m.url = '',
                                    m['token'] = n,
                                    m['game_uuid'] = Z,
                                    m['server_location'] = p,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = p,
                                    GameMgr.Inst['mj_game_token'] = n,
                                    GameMgr.Inst['mj_game_uuid'] = Z,
                                    m['playerreconnect'] = V,
                                    m['_setState'](k['EConnectState']['tryconnect']),
                                    m['load_over'] = !1,
                                    m['loaded_player_count'] = 0,
                                    m['real_player_count'] = 0,
                                    m['lb_index'] = 0,
                                    m['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    n['prototype']['reportInfo'] = function () {
                        this['connect_state'] == k['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: k['LobbyNetMgr']['root_id_lst'][k['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    n['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](k['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    n['prototype']['_OnConnent'] = function (n) {
                        app.Log.log('MJNetMgr _OnConnent event:' + n),
                            n == Laya['Event']['CLOSE'] || n == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == k['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == k['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](k['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](k['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2008)), k['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == k['EConnectState']['reconnecting'] && this['_Reconnect']()) : n == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == k['EConnectState']['tryconnect'] || this['connect_state'] == k['EConnectState']['reconnecting']) && ((this['connect_state'] = k['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](k['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    n['prototype']['_Reconnect'] = function () {
                        var n = this;
                        k['LobbyNetMgr'].Inst['connect_state'] == k['EConnectState'].none || k['LobbyNetMgr'].Inst['connect_state'] == k['EConnectState']['disconnect'] ? this['_setState'](k['EConnectState']['disconnect']) : k['LobbyNetMgr'].Inst['connect_state'] == k['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](k['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            n['connect_state'] == k['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + n['reconnect_count']), app['NetAgent']['connect2MJ'](n.url, Laya['Handler']['create'](n, n['_OnConnent'], null, !1), 'local' == n['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    n['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? k['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](k['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && k['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    n['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    n['prototype']['_fetch_gateway'] = function (n) {
                        var Z = this;
                        if (k['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= k['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && k['Scene_MJ'].Inst['ForceOut'](), this['_setState'](k['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + n);
                        var p = function (p) {
                            var V = JSON['parse'](p);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + p), V['maintenance'])
                                Z['_setState'](k['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && k['Scene_MJ'].Inst['ForceOut']();
                            else if (V['servers'] && V['servers']['length'] > 0) {
                                for (var m = V['servers'], u = k['Tools']['deal_gateway'](m), L = 0; L < u['length']; L++)
                                    Z.urls.push({
                                        name: '___' + L,
                                        url: u[L]
                                    });
                                Z['link_index'] = -1,
                                    Z['_try_to_linknext']();
                            } else
                                1 > n ? Laya['timer'].once(1000, Z, function () {
                                    Z['_fetch_gateway'](n + 1);
                                }) : k['LobbyNetMgr'].Inst['polling_connect'] ? (Z['lb_index']++, Z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](60)), Z['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && k['Scene_MJ'].Inst['ForceOut'](), Z['_setState'](k['EConnectState'].none));
                        },
                            V = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > n ? Laya['timer'].once(500, Z, function () {
                                        Z['_fetch_gateway'](n + 1);
                                    }) : k['LobbyNetMgr'].Inst['polling_connect'] ? (Z['lb_index']++, Z['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](58)), Z['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || k['Scene_MJ'].Inst['ForceOut'](), Z['_setState'](k['EConnectState'].none));
                            },
                            m = function (k) {
                                var n = new Laya['HttpRequest']();
                                n.once(Laya['Event']['COMPLETE'], Z, function (k) {
                                    p(k);
                                }),
                                    n.once(Laya['Event']['ERROR'], Z, function () {
                                        V();
                                    });
                                var m = [];
                                m.push('If-Modified-Since'),
                                    m.push('0'),
                                    k += '?service=ws-game-gateway',
                                    k += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    k += '&location=' + Z['server_location'],
                                    k += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    n.send(k, '', 'get', 'text', m),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + k);
                            };
                        k['LobbyNetMgr'].Inst['polling_connect'] ? m(k['LobbyNetMgr'].Inst.urls[this['lb_index']]) : m(k['LobbyNetMgr'].Inst['lb_url']);
                    },
                    n['prototype']['_setState'] = function (n) {
                        this['connect_state'] = n,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (n == k['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : n == k['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : n == k['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : n == k['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : n == k['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    n['prototype']['_ConnectSuccess'] = function () {
                        var n = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (Z, p) {
                                if (Z || p['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', Z, p), k['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](p)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        p['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(p),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(p));
                                            }
                                        });
                                    }
                                    // END
                                    var V = [],
                                        m = 0;
                                    view['DesktopMgr']['player_link_state'] = p['state_list'];
                                    var u = k['Tools']['strOfLocalization'](2003),
                                        L = p['game_config'].mode,
                                        F = view['ERuleMode']['Liqi4'];
                                    L.mode < 10 ? (F = view['ERuleMode']['Liqi4'], n['real_player_count'] = 4) : L.mode < 20 && (F = view['ERuleMode']['Liqi3'], n['real_player_count'] = 3);
                                    for (var J = 0; J < n['real_player_count']; J++)
                                        V.push(null);
                                    L['extendinfo'] && (u = k['Tools']['strOfLocalization'](2004)),
                                        L['detail_rule'] && L['detail_rule']['ai_level'] && (1 === L['detail_rule']['ai_level'] && (u = k['Tools']['strOfLocalization'](2003)), 2 === L['detail_rule']['ai_level'] && (u = k['Tools']['strOfLocalization'](2004)));
                                    for (var A = k['GameUtility']['get_default_ai_skin'](), d = k['GameUtility']['get_default_ai_character'](), J = 0; J < p['seat_list']['length']; J++) {
                                        var g = p['seat_list'][J];
                                        if (0 == g) {
                                            V[J] = {
                                                nickname: u,
                                                avatar_id: A,
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
                                                    skin: A,
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
                                                    V[J].avatar_id = skin.id;
                                                    V[J].character.charid = skin.character_id;
                                                    V[J].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                V[J].nickname = '[BOT]' + V[J].nickname;
                                            }
                                        } else {
                                            m++;
                                            for (var b = 0; b < p['players']['length']; b++)
                                                if (p['players'][b]['account_id'] == g) {
                                                    V[J] = p['players'][b];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (V[J].account_id == GameMgr.Inst.account_id) {
                                                        V[J].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        V[J].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        V[J].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        V[J].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        V[J].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            V[J].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (V[J].avatar_id == 400101 || V[J].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            V[J].avatar_id = skin.id;
                                                            V[J].character.charid = skin.character_id;
                                                            V[J].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(V[J].account_id);
                                                        if (server == 1) {
                                                            V[J].nickname = '[CN]' + V[J].nickname;
                                                        } else if (server == 2) {
                                                            V[J].nickname = '[JP]' + V[J].nickname;
                                                        } else if (server == 3) {
                                                            V[J].nickname = '[EN]' + V[J].nickname;
                                                        } else {
                                                            V[J].nickname = '[??]' + V[J].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var J = 0; J < n['real_player_count']; J++)
                                        null == V[J] && (V[J] = {
                                            account: 0,
                                            nickname: k['Tools']['strOfLocalization'](2010),
                                            avatar_id: A,
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
                                                skin: A,
                                                is_upgraded: !1
                                            }
                                        });
                                    n['loaded_player_count'] = p['ready_id_list']['length'],
                                        n['_AuthSuccess'](V, p['is_game_start'], p['game_config']['toJSON']());
                                }
                            });
                    },
                    n['prototype']['_AuthSuccess'] = function (n, Z, p) {
                        var V = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (n, Z) {
                                    n || Z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', n, Z), k['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](Z)), Z['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2011)), k['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](Z['game_restore'])));
                                });
                        })) : k['Scene_MJ'].Inst['openMJRoom'](p, n, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](p)), n, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](V, function () {
                                Z ? Laya['timer']['frameOnce'](10, V, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (n, Z) {
                                            app.Log.log('syncGame ' + JSON['stringify'](Z)),
                                                n || Z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', n, Z), k['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), V['_PlayerReconnectSuccess'](Z));
                                        });
                                }) : Laya['timer']['frameOnce'](10, V, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (n, Z) {
                                            n || Z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', n, Z), k['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), V['_EnterGame'](Z), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (k) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * k);
                        }, null, !1));
                    },
                    n['prototype']['_EnterGame'] = function (n) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](n)),
                            n['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2011)), k['Scene_MJ'].Inst['GameEnd']()) : n['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](n['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    n['prototype']['_PlayerReconnectSuccess'] = function (n) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](n)),
                            n['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2011)), k['Scene_MJ'].Inst['GameEnd']()) : n['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](n['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](k['Tools']['strOfLocalization'](2012)), k['Scene_MJ'].Inst['ForceOut']());
                    },
                    n['prototype']['_SendDebugInfo'] = function () { },
                    n['prototype']['OpenConnectObserve'] = function (n, Z) {
                        var p = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                p['server_location'] = Z,
                                    p['ob_token'] = n,
                                    p['_setState'](k['EConnectState']['tryconnect']),
                                    p['lb_index'] = 0,
                                    p['_fetch_gateway'](0);
                            });
                    },
                    n['prototype']['_ConnectSuccessOb'] = function () {
                        var n = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (Z, p) {
                                Z || p['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', Z, p), k['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](p)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (Z, p) {
                                    if (Z || p['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', Z, p), k['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var V = p.head,
                                            m = V['game_config'].mode,
                                            u = [],
                                            L = k['Tools']['strOfLocalization'](2003),
                                            F = view['ERuleMode']['Liqi4'];
                                        m.mode < 10 ? (F = view['ERuleMode']['Liqi4'], n['real_player_count'] = 4) : m.mode < 20 && (F = view['ERuleMode']['Liqi3'], n['real_player_count'] = 3);
                                        for (var J = 0; J < n['real_player_count']; J++)
                                            u.push(null);
                                        m['extendinfo'] && (L = k['Tools']['strOfLocalization'](2004)),
                                            m['detail_rule'] && m['detail_rule']['ai_level'] && (1 === m['detail_rule']['ai_level'] && (L = k['Tools']['strOfLocalization'](2003)), 2 === m['detail_rule']['ai_level'] && (L = k['Tools']['strOfLocalization'](2004)));
                                        for (var A = k['GameUtility']['get_default_ai_skin'](), d = k['GameUtility']['get_default_ai_character'](), J = 0; J < V['seat_list']['length']; J++) {
                                            var g = V['seat_list'][J];
                                            if (0 == g)
                                                u[J] = {
                                                    nickname: L,
                                                    avatar_id: A,
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
                                                        skin: A,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var b = 0; b < V['players']['length']; b++)
                                                    if (V['players'][b]['account_id'] == g) {
                                                        u[J] = V['players'][b];
                                                        break;
                                                    }
                                        }
                                        for (var J = 0; J < n['real_player_count']; J++)
                                            null == u[J] && (u[J] = {
                                                account: 0,
                                                nickname: k['Tools']['strOfLocalization'](2010),
                                                avatar_id: A,
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
                                                    skin: A,
                                                    is_upgraded: !1
                                                }
                                            });
                                        n['_StartObSuccuess'](u, p['passed'], V['game_config']['toJSON'](), V['start_time']);
                                    }
                                }));
                            });
                    },
                    n['prototype']['_StartObSuccuess'] = function (n, Z, p, V) {
                        var m = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](V, Z);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), k['Scene_MJ'].Inst['openMJRoom'](p, n, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](p)), n, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](m, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, m, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](V, Z);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (k) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * k);
                        }, null, !1)));
                    },
                    n['_Inst'] = null,
                    n;
            }
                ();
            k['MJNetMgr'] = n;
        }
            (game || (game = {}));







        // 读取战绩
        !function (k) {
            var n = function (n) {
                function Z() {
                    var k = n.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return k['account_id'] = 0,
                        k['origin_x'] = 0,
                        k['origin_y'] = 0,
                        k.root = null,
                        k['title'] = null,
                        k['level'] = null,
                        k['btn_addfriend'] = null,
                        k['btn_report'] = null,
                        k['illust'] = null,
                        k.name = null,
                        k['detail_data'] = null,
                        k['achievement_data'] = null,
                        k['locking'] = !1,
                        k['tab_info4'] = null,
                        k['tab_info3'] = null,
                        k['tab_note'] = null,
                        k['tab_img_dark'] = '',
                        k['tab_img_chosen'] = '',
                        k['player_data'] = null,
                        k['tab_index'] = 1,
                        k['game_category'] = 1,
                        k['game_type'] = 1,
                        Z.Inst = k,
                        k;
                }
                return __extends(Z, n),
                    Z['prototype']['onCreate'] = function () {
                        var n = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new k['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new k['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new k['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new k['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new k['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['btn_addfriend']['visible'] = !1,
                                    n['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: n['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                k['UI_Report_Nickname'].Inst.show(n['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || n['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['close']();
                            }, null, !1),
                            this.note = new k['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || 1 != n['tab_index'] && n['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || 2 != n['tab_index'] && n['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? k['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : n['container_info']['visible'] && (n['container_info']['visible'] = !1, n['tab_info4'].skin = n['tab_img_dark'], n['tab_info3'].skin = n['tab_img_dark'], n['tab_note'].skin = n['tab_img_chosen'], n['tab_index'] = 3, n.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    Z['prototype'].show = function (n, Z, p, V) {
                        var m = this;
                        void 0 === Z && (Z = 1),
                            void 0 === p && (p = 2),
                            void 0 === V && (V = 1),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = n,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            k['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                m['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: n
                            }, function (Z, p) {
                                Z || p['error'] ? k['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', Z, p) : k['UI_Shilian']['now_season_info'] && 1001 == k['UI_Shilian']['now_season_info']['season_id'] && 3 != k['UI_Shilian']['get_cur_season_state']() ? (m['detail_data']['setData'](p), m['changeMJCategory'](m['tab_index'], m['game_category'], m['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: n
                                }, function (n, Z) {
                                    n || Z['error'] ? k['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', n, Z) : (p['season_info'] = Z['season_info'], m['detail_data']['setData'](p), m['changeMJCategory'](m['tab_index'], m['game_category'], m['game_type']));
                                });
                            }),
                            this.note['init_data'](n),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = n != GameMgr.Inst['account_id'],
                            this['tab_index'] = Z,
                            this['game_category'] = p,
                            this['game_type'] = V,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    Z['prototype']['refreshBaseInfo'] = function () {
                        var n = this;
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
                            }, function (Z, p) {
                                if (Z || p['error'])
                                    k['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', Z, p);
                                else {
                                    var V = p['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (V.account_id == GameMgr.Inst.account_id) {
                                        V.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            V.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            V.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    n['player_data'] = V,
                                        game['Tools']['SetNickname'](n.name, V),
                                        n['title'].id = game['Tools']['titleLocalization'](V['account_id'], V['title']),
                                        n['level'].id = V['level'].id,
                                        n['level'].id = n['player_data'][1 == n['tab_index'] ? 'level' : 'level3'].id,
                                        n['level'].exp = n['player_data'][1 == n['tab_index'] ? 'level' : 'level3']['score'],
                                        n['illust'].me['visible'] = !0,
                                        n['account_id'] == GameMgr.Inst['account_id'] ? n['illust']['setSkin'](V['avatar_id'], 'waitingroom') : n['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](V['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], n['account_id']) && n['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(n['account_id']) ? (n['btn_addfriend']['visible'] = !0, n['btn_report'].x = 520) : (n['btn_addfriend']['visible'] = !1, n['btn_report'].x = 343),
                                        n.note.sign['setSign'](V['signature']),
                                        n['achievement_data'].show(!1, V['achievement_count']);
                                }
                            });
                    },
                    Z['prototype']['changeMJCategory'] = function (k, n, Z) {
                        void 0 === n && (n = 2),
                            void 0 === Z && (Z = 1),
                            this['tab_index'] = k,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](k, n, Z),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    Z['prototype']['close'] = function () {
                        var n = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), k['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            n['locking'] = !1,
                                n['enable'] = !1;
                        }))));
                    },
                    Z['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                    },
                    Z['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                            this['detail_data']['close'](),
                            this['illust']['clear'](),
                            Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                    },
                    Z.Inst = null,
                    Z;
            }
                (k['UIBase']);
            k['UI_OtherPlayerInfo'] = n;
        }
            (uiscript || (uiscript = {}));







        // 宿舍相关
        !function (k) {
            var n = function () {
                function n(n, p) {
                    var V = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = n,
                        this['container_illust'] = p,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = n['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            V['during_move'] = !0,
                                V['mouse_start_x'] = V['container_move']['mouseX'],
                                V['mouse_start_y'] = V['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            V['during_move'] && (V.move(V['container_move']['mouseX'] - V['mouse_start_x'], V['container_move']['mouseY'] - V['mouse_start_y']), V['mouse_start_x'] = V['container_move']['mouseX'], V['mouse_start_y'] = V['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            V['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            V['during_move'] = !1;
                        }),
                        this['btn_close'] = n['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            V['locking'] || V['close']();
                        }, null, !1),
                        this['scrollbar'] = n['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (k) {
                            V['_scale'] = 1 * (1 - k) + 0.5,
                                V['illust']['scaleX'] = V['_scale'],
                                V['illust']['scaleY'] = V['_scale'],
                                V['scrollbar']['setVal'](k, 0);
                        })),
                        this['dongtai_kaiguan'] = new k['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            Z.Inst['illust']['resetSkin']();
                        }), new Laya['Handler'](this, function (k) {
                            Z.Inst['illust']['playAnim'](k);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](n['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (k) {
                        this['_scale'] = k,
                            this['scrollbar']['setVal'](1 - (k - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    n['prototype'].show = function (n) {
                        var p = this;
                        this['locking'] = !0,
                            this['when_close'] = n,
                            this['illust_start_x'] = this['illust'].x,
                            this['illust_start_y'] = this['illust'].y,
                            this['illust_center_x'] = this['illust'].x + 984 - 446,
                            this['illust_center_y'] = this['illust'].y + 11 - 84,
                            this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                            this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                            this['container_illust']['getChildByName']('btn')['visible'] = !1,
                            Z.Inst['stopsay'](),
                            this['scale'] = 1,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_center_x'],
                                y: this['illust_center_y']
                            }, 200),
                            k['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                p['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](Z.Inst['illust']['skin_id']);
                    },
                    n['prototype']['close'] = function () {
                        var n = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            k['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                n['locking'] = !1,
                                    n.me['visible'] = !1,
                                    n['when_close'].run();
                            });
                    },
                    n['prototype'].move = function (k, n) {
                        var Z = this['illust'].x + k,
                            p = this['illust'].y + n;
                        Z < this['illust_center_x'] - 600 ? Z = this['illust_center_x'] - 600 : Z > this['illust_center_x'] + 600 && (Z = this['illust_center_x'] + 600),
                            p < this['illust_center_y'] - 1200 ? p = this['illust_center_y'] - 1200 : p > this['illust_center_y'] + 800 && (p = this['illust_center_y'] + 800),
                            this['illust'].x = Z,
                            this['illust'].y = p;
                    },
                    n;
            }
                (),
                Z = function (Z) {
                    function p() {
                        var k = Z.call(this, new ui['lobby']['susheUI']()) || this;
                        return k['contianer_illust'] = null,
                            k['illust'] = null,
                            k['illust_rect'] = null,
                            k['container_name'] = null,
                            k['label_name'] = null,
                            k['label_cv'] = null,
                            k['label_cv_title'] = null,
                            k['container_page'] = null,
                            k['container_look_illust'] = null,
                            k['page_select_character'] = null,
                            k['page_visit_character'] = null,
                            k['origin_illust_x'] = 0,
                            k['chat_id'] = 0,
                            k['container_chat'] = null,
                            k['_select_index'] = 0,
                            k['sound_channel'] = null,
                            k['chat_block'] = null,
                            k['illust_showing'] = !0,
                            p.Inst = k,
                            k;
                    }
                    return __extends(p, Z),
                        p['onMainSkinChange'] = function () {
                            var k = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            k && k['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](k.path) + '/spine');
                        },
                        p['randomDesktopID'] = function () {
                            var n = k['UI_Sushe']['commonViewList'][k['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), n)
                                for (var Z = 0; Z < n['length']; Z++)
                                    n[Z].slot == game['EView'].mjp ? this['now_mjp_id'] = n[Z].type ? n[Z]['item_id_list'][Math['floor'](Math['random']() * n[Z]['item_id_list']['length'])] : n[Z]['item_id'] : n[Z].slot == game['EView']['desktop'] && (this['now_desktop_id'] = n[Z].type ? n[Z]['item_id_list'][Math['floor'](Math['random']() * n[Z]['item_id_list']['length'])] : n[Z]['item_id']);
                        },
                        p.init = function (n) {
                            var Z = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (V, m) {
                                if (V || m['error'])
                                    k['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', V, m);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](m)), m = JSON['parse'](JSON['stringify'](m)), m['main_character_id'] && m['characters']) {
                                        //if (Z['characters'] = [], m['characters'])
                                        //    for (var u = 0; u < m['characters']['length']; u++)
                                        //        Z['characters'].push(m['characters'][u]);
                                        //if (Z['skin_map'] = {}, m['skins'])
                                        //    for (var u = 0; u < m['skins']['length']; u++)
                                        //        Z['skin_map'][m['skins'][u]] = 1;
                                        //Z['main_character_id'] = m['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = m.main_character_id;
                                        for (let i = 0; i < m.characters.length; i++) {
                                            if (m.characters[i].charid == m.main_character_id) {
                                                if (m.characters[i].extra_emoji !== undefined) {
                                                    fake_data.emoji = m.characters[i].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = m.skins[i];
                                                fake_data.exp = m.characters[i].exp;
                                                fake_data.level = m.characters[i].level;
                                                fake_data.is_upgraded = m.characters[i].is_upgraded;
                                                break;
                                            }
                                        }
                                        Z.characters = [];

                                        for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                            let id = 200000 + j;
                                            let skin = 400001 + j * 100;
                                            let emoji = [];
                                            cfg.character.emoji.getGroup(id).forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            Z.characters.push({
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
                                        Z.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        Z.star_chars = MMP.settings.star_chars;
                                        m.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        Z['characters'] = [], Z['characters'].push({
                                            charid: '200001',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400101',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), Z['characters'].push({
                                            charid: '200002',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400201',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), Z['skin_map']['400101'] = 1, Z['skin_map']['400201'] = 1, Z['main_character_id'] = '200001';
                                    if (Z['send_gift_count'] = 0, Z['send_gift_limit'] = 0, m['send_gift_count'] && (Z['send_gift_count'] = m['send_gift_count']), m['send_gift_limit'] && (Z['send_gift_limit'] = m['send_gift_limit']), m['finished_endings'])
                                        for (var u = 0; u < m['finished_endings']['length']; u++)
                                            Z['finished_endings_map'][m['finished_endings'][u]] = 1;
                                    if (m['rewarded_endings'])
                                        for (var u = 0; u < m['rewarded_endings']['length']; u++)
                                            Z['rewarded_endings_map'][m['rewarded_endings'][u]] = 1;
                                    if (Z['star_chars'] = [], m['character_sort'] && (Z['star_chars'] = m['character_sort']), p['hidden_characters_map'] = {}, m['hidden_characters'])
                                        for (var L = 0, F = m['hidden_characters']; L < F['length']; L++) {
                                            var J = F[L];
                                            p['hidden_characters_map'][J] = 1;
                                        }
                                    n.run();
                                }
                            }),
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (n, p) {
                                //    if (n || p['error'])
                                //        k['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', n, p);
                                //    else {
                                //        Z['using_commonview_index'] = p.use,
                                //        Z['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //        var V = p['views'];
                                //        if (V)
                                //            for (var m = 0; m < V['length']; m++) {
                                //                var u = V[m]['values'];
                                //                u && (Z['commonViewList'][V[m]['index']] = u);
                                //            }
                                //        Z['randomDesktopID'](),
                                Z.commonViewList = MMP.settings.commonViewList;
                            Z.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view'](),
                                GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                            //}
                            //});
                        },
                        p['on_data_updata'] = function (n) {
                            if (n['character']) {
                                var Z = JSON['parse'](JSON['stringify'](n['character']));
                                if (Z['characters'])
                                    for (var p = Z['characters'], V = 0; V < p['length']; V++) {
                                        for (var m = !1, u = 0; u < this['characters']['length']; u++)
                                            if (this['characters'][u]['charid'] == p[V]['charid']) {
                                                this['characters'][u] = p[V],
                                                    k['UI_Sushe_Visit'].Inst && k['UI_Sushe_Visit'].Inst['chara_info'] && k['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][u]['charid'] && (k['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][u]),
                                                    m = !0;
                                                break;
                                            }
                                        m || this['characters'].push(p[V]);
                                    }
                                if (Z['skins']) {
                                    for (var L = Z['skins'], V = 0; V < L['length']; V++)
                                        this['skin_map'][L[V]] = 1;
                                    k['UI_Bag'].Inst['on_skin_change']();
                                }
                                if (Z['finished_endings']) {
                                    for (var F = Z['finished_endings'], V = 0; V < F['length']; V++)
                                        this['finished_endings_map'][F[V]] = 1;
                                    k['UI_Sushe_Visit'].Inst;
                                }
                                if (Z['rewarded_endings']) {
                                    for (var F = Z['rewarded_endings'], V = 0; V < F['length']; V++)
                                        this['rewarded_endings_map'][F[V]] = 1;
                                    k['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        p['chara_owned'] = function (k) {
                            for (var n = 0; n < this['characters']['length']; n++)
                                if (this['characters'][n]['charid'] == k)
                                    return !0;
                            return !1;
                        },
                        p['skin_owned'] = function (k) {
                            return this['skin_map']['hasOwnProperty'](k['toString']());
                        },
                        p['add_skin'] = function (k) {
                            this['skin_map'][k] = 1;
                        },
                        Object['defineProperty'](p, 'main_chara_info', {
                            get: function () {
                                for (var k = 0; k < this['characters']['length']; k++)
                                    if (this['characters'][k]['charid'] == this['main_character_id'])
                                        return this['characters'][k];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        p['on_view_remove'] = function (k) {
                            for (var n = 0; n < this['commonViewList']['length']; n++)
                                for (var Z = this['commonViewList'][n], p = 0; p < Z['length']; p++)
                                    if (Z[p]['item_id'] == k && (Z[p]['item_id'] = game['GameUtility']['get_view_default_item_id'](Z[p].slot)), Z[p]['item_id_list']) {
                                        for (var V = 0; V < Z[p]['item_id_list']['length']; V++)
                                            if (Z[p]['item_id_list'][V] == k) {
                                                Z[p]['item_id_list']['splice'](V, 1);
                                                break;
                                            }
                                        0 == Z[p]['item_id_list']['length'] && (Z[p].type = 0);
                                    }
                            var m = cfg['item_definition'].item.get(k);
                            m.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == k && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        p['add_finish_ending'] = function (k) {
                            this['finished_endings_map'][k] = 1;
                        },
                        p['add_reward_ending'] = function (k) {
                            this['rewarded_endings_map'][k] = 1;
                        },
                        p['check_all_char_repoint'] = function () {
                            for (var k = 0; k < p['characters']['length']; k++)
                                if (this['check_char_redpoint'](p['characters'][k]))
                                    return !0;
                            return !1;
                        },
                        p['check_char_redpoint'] = function (k) {
                            // 去除小红点
                            //if (p['hidden_characters_map'][k['charid']])
                            return !1;
                            //END
                            var n = cfg.spot.spot['getGroup'](k['charid']);
                            if (n)
                                for (var Z = 0; Z < n['length']; Z++) {
                                    var V = n[Z];
                                    if (!(V['is_married'] && !k['is_upgraded'] || !V['is_married'] && k['level'] < V['level_limit']) && 2 == V.type) {
                                        for (var m = !0, u = 0; u < V['jieju']['length']; u++)
                                            if (V['jieju'][u] && p['finished_endings_map'][V['jieju'][u]]) {
                                                if (!p['rewarded_endings_map'][V['jieju'][u]])
                                                    return !0;
                                                m = !1;
                                            }
                                        if (m)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        p['is_char_star'] = function (k) {
                            return -1 != this['star_chars']['indexOf'](k);
                        },
                        p['change_char_star'] = function (k) {
                            var n = this['star_chars']['indexOf'](k);
                            -1 != n ? this['star_chars']['splice'](n, 1) : this['star_chars'].push(k)
                            // 屏蔽网络请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                            //    sort: this['star_chars']
                            //}, function () {});
                            // END
                        },
                        Object['defineProperty'](p['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        p['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        p['prototype']['onCreate'] = function () {
                            var Z = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new k['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust_rect'] = k['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new k['UI_Character_Chat'](this['container_chat'], !0),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!Z['page_visit_character'].me['visible'] || !Z['page_visit_character']['cannot_click_say'])
                                        if (Z['illust']['onClick'](), Z['sound_channel'])
                                            Z['stopsay']();
                                        else {
                                            if (!Z['illust_showing'])
                                                return;
                                            Z.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new k['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new k['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new n(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        p['prototype'].show = function (k) {
                            GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var n = 0, Z = 0; Z < p['characters']['length']; Z++)
                                if (p['characters'][Z]['charid'] == p['main_character_id']) {
                                    n = Z;
                                    break;
                                }
                            0 == k ? (this['change_select'](n), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        p['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](p['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        p['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(p['characters'][this['_select_index']], 2);
                        },
                        p['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                k['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        p['prototype']['close'] = function (n) {
                            var Z = this;
                            this['illust_showing'] && k['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    Z['enable'] = !1,
                                        n && n.run();
                                });
                        },
                        p['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        p['prototype']['hide_illust'] = function () {
                            var n = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, k['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                n['contianer_illust']['visible'] = !1;
                            })));
                        },
                        p['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, k['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var n = 0, Z = 0; Z < p['characters']['length']; Z++)
                                        if (p['characters'][Z]['charid'] == p['main_character_id']) {
                                            n = Z;
                                            break;
                                        }
                                    this['change_select'](n);
                                }
                        },
                        p['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        p['prototype']['show_page_visit'] = function (k) {
                            void 0 === k && (k = 0),
                                this['page_visit_character'].show(p['characters'][this['_select_index']], k);
                        },
                        p['prototype']['change_select'] = function (n) {
                            this['_select_index'] = n,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var Z = p['characters'][n],
                                V = cfg['item_definition']['character'].get(Z['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != p['chs_fengyu_name_lst']['indexOf'](Z['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != p['chs_fengyu_cv_lst']['indexOf'](Z['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = V['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = V['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV';
                                var m = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : m.test(V['name_' + GameMgr['client_language']]) ? -15 : 0,
                                    this['label_cv']['leading'] = m.test(this['label_cv'].text) ? -7 : 0;
                            } else
                                this['label_name'].text = V['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + V['desc_cv_' + GameMgr['client_language']];
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var u = new k['UIRect']();
                            u.x = this['illust_rect'].x,
                                u.y = this['illust_rect'].y,
                                u['width'] = this['illust_rect']['width'],
                                u['height'] = this['illust_rect']['height'],
                                '405503' == Z.skin ? u.y -= 70 : '403303' == Z.skin ? u.y += 117 : '407002' == Z.skin && (u.y += 50),
                                this['illust']['setRect'](u),
                                this['illust']['setSkin'](Z.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                k['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var L = cfg['item_definition'].skin.get(Z.skin);
                            L['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        p['prototype']['onChangeSkin'] = function (k) {
                            p['characters'][this['_select_index']].skin = k,
                                this['change_select'](this['_select_index']),
                                p['characters'][this['_select_index']]['charid'] == p['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = k, p['onMainSkinChange']())
                            // 屏蔽换肤请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                            //    character_id: p['characters'][this['_select_index']]['charid'],
                            //    skin: k
                            //}, function () {});
                            // 保存皮肤
                        },
                        p['prototype'].say = function (k) {
                            var n = this,
                                Z = p['characters'][this['_select_index']];
                            this['chat_id']++;
                            var V = this['chat_id'],
                                m = view['AudioMgr']['PlayCharactorSound'](Z, k, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, n, function () {
                                        V == n['chat_id'] && n['stopsay']();
                                    });
                                }));
                            m && (this['chat_block'].show(m['words']), this['sound_channel'] = m['sound']);
                        },
                        p['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                        },
                        p['prototype']['to_look_illust'] = function () {
                            var k = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                k['illust']['playAnim']('idle'),
                                    k['page_select_character'].show(0);
                            }));
                        },
                        p['prototype']['jump_to_char_skin'] = function (n, Z) {
                            var V = this;
                            if (void 0 === n && (n = -1), void 0 === Z && (Z = null), n >= 0)
                                for (var m = 0; m < p['characters']['length']; m++)
                                    if (p['characters'][m]['charid'] == n) {
                                        this['change_select'](m);
                                        break;
                                    }
                            k['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                p.Inst['show_page_visit'](),
                                    V['page_visit_character']['show_pop_skin'](),
                                    V['page_visit_character']['set_jump_callback'](Z);
                            }));
                        },
                        p['prototype']['jump_to_char_qiyue'] = function (n) {
                            var Z = this;
                            if (void 0 === n && (n = -1), n >= 0)
                                for (var V = 0; V < p['characters']['length']; V++)
                                    if (p['characters'][V]['charid'] == n) {
                                        this['change_select'](V);
                                        break;
                                    }
                            k['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                p.Inst['show_page_visit'](),
                                    Z['page_visit_character']['show_qiyue']();
                            }));
                        },
                        p['prototype']['jump_to_char_gift'] = function (n) {
                            var Z = this;
                            if (void 0 === n && (n = -1), n >= 0)
                                for (var V = 0; V < p['characters']['length']; V++)
                                    if (p['characters'][V]['charid'] == n) {
                                        this['change_select'](V);
                                        break;
                                    }
                            k['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                p.Inst['show_page_visit'](),
                                    Z['page_visit_character']['show_gift']();
                            }));
                        },
                        p['characters'] = [],
                        p['chs_fengyu_name_lst'] = ['200040', '200043'],
                        p['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        p['skin_map'] = {},
                        p['main_character_id'] = 0,
                        p['send_gift_count'] = 0,
                        p['send_gift_limit'] = 0,
                        p['commonViewList'] = [],
                        p['using_commonview_index'] = 0,
                        p['finished_endings_map'] = {},
                        p['rewarded_endings_map'] = {},
                        p['star_chars'] = [],
                        p['hidden_characters_map'] = {},
                        p.Inst = null,
                        p;
                }
                    (k['UIBase']);
            k['UI_Sushe'] = Z;
        }
            (uiscript || (uiscript = {}));







        // 屏蔽改变宿舍角色的网络请求
        !function (k) {
            var n = function () {
                function n(n) {
                    var p = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = n,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Z.Inst['locking'] || Z.Inst['close'](Laya['Handler']['create'](p, function () {
                                k['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Z.Inst['locking'] || Z.Inst['close'](Laya['Handler']['create'](p, function () {
                                k['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Z.Inst['locking'] || k['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Z.Inst['locking'] || p['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new k['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            k['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return n['prototype'].show = function (n, Z) {
                    void 0 === Z && (Z = !1),
                        this.me['visible'] = !0,
                        n ? this.me['alpha'] = 1 : k['UIBase']['anim_alpha_in'](this.me, {
                            x: 0
                        }, 200, 0),
                        this['getShowStarState'](),
                        this['sortShowCharsList'](),
                        Z || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47),
                        this['scrollview']['reset'](),
                        this['scrollview']['addItem'](this['show_index_list']['length']);
                },
                    n['prototype']['render_character_cell'] = function (n) {
                        var Z = this,
                            p = n['index'],
                            V = n['container'],
                            m = n['cache_data'];
                        V['visible'] = !0,
                            m['index'] = p,
                            m['inited'] || (m['inited'] = !0, V['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                Z['onClickAtHead'](m['index']);
                            }), m.skin = new k['UI_Character_Skin'](V['getChildByName']('btn')['getChildByName']('head')), m.bg = V['getChildByName']('btn')['getChildByName']('bg'), m['bound'] = V['getChildByName']('btn')['getChildByName']('bound'), m['btn_star'] = V['getChildByName']('btn_star'), m.star = V['getChildByName']('btn')['getChildByName']('star'), m['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                Z['onClickAtStar'](m['index']);
                            }));
                        var u = V['getChildByName']('btn');
                        u['getChildByName']('choose')['visible'] = p == this['select_index'];
                        var L = this['getCharInfoByIndex'](p);
                        u['getChildByName']('redpoint')['visible'] = k['UI_Sushe']['check_char_redpoint'](L),
                            m.skin['setSkin'](L.skin, 'bighead'),
                            u['getChildByName']('using')['visible'] = L['charid'] == k['UI_Sushe']['main_character_id'],
                            V['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '2.png' : '.png'));
                        var F = cfg['item_definition']['character'].get(L['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? m['bound'].skin = F.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (L['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (L['is_upgraded'] ? '2.png' : '.png')) : F.ur ? (m['bound'].pos(-10, -2), m['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '6.png' : '5.png'))) : (m['bound'].pos(4, 20), m['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (L['is_upgraded'] ? '4.png' : '3.png'))),
                            m['btn_star']['visible'] = this['select_index'] == p,
                            m.star['visible'] = k['UI_Sushe']['is_char_star'](L['charid']) || this['select_index'] == p;
                        var J = cfg['item_definition']['character'].find(L['charid']),
                            A = u['getChildByName']('label_name'),
                            d = J['name_' + GameMgr['client_language'] + '2'] ? J['name_' + GameMgr['client_language'] + '2'] : J['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            m.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (k['UI_Sushe']['is_char_star'](L['charid']) ? 'l' : 'd') + (L['is_upgraded'] ? '1.png' : '.png')),
                                A.text = d['replace']('-', '|')['replace'](/\./g, '·');
                            var g = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            A['leading'] = g.test(d) ? -15 : 0;
                        } else
                            m.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (k['UI_Sushe']['is_char_star'](L['charid']) ? 'l.png' : 'd.png')), A.text = d;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == L['charid'] ? (A['scaleX'] = 0.67, A['scaleY'] = 0.57) : (A['scaleX'] = 0.7, A['scaleY'] = 0.6));
                    },
                    n['prototype']['onClickAtHead'] = function (n) {
                        if (this['select_index'] == n) {
                            var Z = this['getCharInfoByIndex'](n);
                            if (Z['charid'] != k['UI_Sushe']['main_character_id'])
                                if (k['UI_PiPeiYuYue'].Inst['enable'])
                                    k['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var p = k['UI_Sushe']['main_character_id'];
                                    k['UI_Sushe']['main_character_id'] = Z['charid'],
                                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //    character_id: k['UI_Sushe']['main_character_id']
                                        //}, function () {}),
                                        GameMgr.Inst['account_data']['avatar_id'] = Z.skin,
                                        k['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = Z.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = Z.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var V = 0; V < this['show_index_list']['length']; V++)
                                        this['getCharInfoByIndex'](V)['charid'] == p && this['scrollview']['wantToRefreshItem'](V);
                                    this['scrollview']['wantToRefreshItem'](n);
                                }
                        } else {
                            var m = this['select_index'];
                            this['select_index'] = n,
                                m >= 0 && this['scrollview']['wantToRefreshItem'](m),
                                this['scrollview']['wantToRefreshItem'](n),
                                k['UI_Sushe'].Inst['change_select'](this['show_index_list'][n]);
                        }
                    },
                    n['prototype']['onClickAtStar'] = function (n) {
                        if (k['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](n)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](n);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var Z = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, Z));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    n['prototype']['close'] = function (n) {
                        var Z = this;
                        this.me['visible'] && (n ? this.me['visible'] = !1 : k['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            Z.me['visible'] = !1;
                        })));
                    },
                    n['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var n = !1, Z = 0, p = k['UI_Sushe']['star_chars']; Z < p['length']; Z++) {
                                var V = p[Z];
                                if (!k['UI_Sushe']['hidden_characters_map'][V]) {
                                    n = !0;
                                    break;
                                }
                            }
                            if (!n)
                                return k['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        k['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var m = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](m),
                            Laya['Tween'].to(m, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    n['prototype']['getShowStarState'] = function () {
                        if (0 == k['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var n = 0, Z = k['UI_Sushe']['star_chars']; n < Z['length']; n++) {
                                var p = Z[n];
                                if (!k['UI_Sushe']['hidden_characters_map'][p])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    n['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var n = 0, Z = k['UI_Sushe']['star_chars']; n < Z['length']; n++) {
                            var p = Z[n];
                            if (!k['UI_Sushe']['hidden_characters_map'][p])
                                for (var V = 0; V < k['UI_Sushe']['characters']['length']; V++)
                                    if (k['UI_Sushe']['characters'][V]['charid'] == p) {
                                        V == k['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(V);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var V = 0; V < k['UI_Sushe']['characters']['length']; V++)
                                k['UI_Sushe']['hidden_characters_map'][k['UI_Sushe']['characters'][V]['charid']] || -1 == this['show_index_list']['indexOf'](V) && (V == k['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(V));
                    },
                    n['prototype']['getCharInfoByIndex'] = function (n) {
                        return k['UI_Sushe']['characters'][this['show_index_list'][n]];
                    },
                    n;
            }
                (),
                Z = function (Z) {
                    function p() {
                        var k = Z.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return k['bg_width_head'] = 962,
                            k['bg_width_zhuangban'] = 1819,
                            k['bg2_delta'] = -29,
                            k['container_top'] = null,
                            k['locking'] = !1,
                            k.tabs = [],
                            k['tab_index'] = 0,
                            p.Inst = k,
                            k;
                    }
                    return __extends(p, Z),
                        p['prototype']['onCreate'] = function () {
                            var Z = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Z['locking'] || (1 == Z['tab_index'] && Z['container_zhuangban']['changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](Z, function () {
                                        Z['close'](),
                                            k['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (Z['close'](), k['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var p = this.root['getChildByName']('container_tabs'), V = function (n) {
                                m.tabs.push(p['getChildAt'](n)),
                                    m.tabs[n]['clickHandler'] = new Laya['Handler'](m, function () {
                                        Z['locking'] || Z['tab_index'] != n && (1 == Z['tab_index'] && Z['container_zhuangban']['changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](Z, function () {
                                            Z['change_tab'](n);
                                        }), null) : Z['change_tab'](n));
                                    });
                            }, m = this, u = 0; u < p['numChildren']; u++)
                                V(u);
                            this['container_head'] = new n(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new k['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return Z['locking'];
                                }));
                        },
                        p['prototype'].show = function (n) {
                            var Z = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = n,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), k['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), k['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), k['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), k['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    Z['locking'] = !1;
                                });
                            for (var p = 0; p < this.tabs['length']; p++) {
                                var V = this.tabs[p];
                                V.skin = game['Tools']['localUISrc'](p == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var m = V['getChildByName']('word');
                                m['color'] = p == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    m['scaleX'] = m['scaleY'] = p == this['tab_index'] ? 1.1 : 1,
                                    p == this['tab_index'] && V['parent']['setChildIndex'](V, this.tabs['length'] - 1);
                            }
                        },
                        p['prototype']['change_tab'] = function (n) {
                            var Z = this;
                            this['tab_index'] = n;
                            for (var p = 0; p < this.tabs['length']; p++) {
                                var V = this.tabs[p];
                                V.skin = game['Tools']['localUISrc'](p == n ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var m = V['getChildByName']('word');
                                m['color'] = p == n ? '#552c1c' : '#d3a86c',
                                    m['scaleX'] = m['scaleY'] = p == n ? 1.1 : 1,
                                    p == n && V['parent']['setChildIndex'](V, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    k['UI_Sushe'].Inst['open_illust'](),
                                        Z['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), k['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    Z['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function () {
                                    Z['locking'] = !1;
                                });
                        },
                        p['prototype']['close'] = function (n) {
                            var Z = this;
                            this['locking'] = !0,
                                k['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? k['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    Z['container_head']['close'](!0);
                                })) : k['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    Z['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    Z['locking'] = !1,
                                        Z['enable'] = !1,
                                        n && n.run();
                                });
                        },
                        p['prototype']['onDisable'] = function () {
                            for (var n = 0; n < k['UI_Sushe']['characters']['length']; n++) {
                                var Z = k['UI_Sushe']['characters'][n].skin,
                                    p = cfg['item_definition'].skin.get(Z);
                                p && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](p.path + '/bighead.png'));
                            }
                        },
                        p['prototype']['changeKaiguanShow'] = function (k) {
                            k ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        p;
                }
                    (k['UIBase']);
            k['UI_Sushe_Select'] = Z;
        }
            (uiscript || (uiscript = {}));





        // 友人房
        !function (k) {
            var n = function () {
                function n(k) {
                    var n = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = k,
                        this.me['visible'] = !1,
                        this['blackbg'] = k['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            n['locking'] || n['close']();
                        }, null, !1),
                        this.root = k['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return n['prototype'].show = function () {
                    var n = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var Z = game['FriendMgr']['friend_list'], p = 0; p < Z['length']; p++)
                        this['sortlist'].push(p);
                    this['sortlist'] = this['sortlist'].sort(function (k, n) {
                        var p = Z[k],
                            V = 0;
                        if (p['state']['is_online']) {
                            var m = game['Tools']['playState2Desc'](p['state']['playing']);
                            V += '' != m ? 30000000000 : 60000000000,
                                p.base['level'] && (V += p.base['level'].id % 1000 * 10000000),
                                p.base['level3'] && (V += p.base['level3'].id % 1000 * 10000),
                                V += -Math['floor'](p['state']['login_time'] / 10000000);
                        } else
                            V += p['state']['logout_time'];
                        var u = Z[n],
                            L = 0;
                        if (u['state']['is_online']) {
                            var m = game['Tools']['playState2Desc'](u['state']['playing']);
                            L += '' != m ? 30000000000 : 60000000000,
                                u.base['level'] && (L += u.base['level'].id % 1000 * 10000000),
                                u.base['level3'] && (L += u.base['level3'].id % 1000 * 10000),
                                L += -Math['floor'](u['state']['login_time'] / 10000000);
                        } else
                            L += u['state']['logout_time'];
                        return L - V;
                    });
                    for (var p = 0; p < Z['length']; p++)
                        this['friends'].push({
                            f: Z[p],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        k['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            n['locking'] = !1;
                        }));
                },
                    n['prototype']['close'] = function () {
                        var n = this;
                        this['locking'] = !0,
                            k['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                n['locking'] = !1,
                                    n.me['visible'] = !1;
                            }));
                    },
                    n['prototype']['render_item'] = function (n) {
                        var Z = n['index'],
                            p = n['container'],
                            m = n['cache_data'];
                        m.head || (m.head = new k['UI_Head'](p['getChildByName']('head'), 'UI_WaitingRoom'), m.name = p['getChildByName']('name'), m['state'] = p['getChildByName']('label_state'), m.btn = p['getChildByName']('btn_invite'), m['invited'] = p['getChildByName']('invited'));
                        var u = this['friends'][this['sortlist'][Z]];
                        m.head.id = game['GameUtility']['get_limited_skin_id'](u.f.base['avatar_id']),
                            m.head['set_head_frame'](u.f.base['account_id'], u.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](m.name, u.f.base);
                        var L = !1;
                        if (u.f['state']['is_online']) {
                            var F = game['Tools']['playState2Desc'](u.f['state']['playing']);
                            '' != F ? (m['state'].text = game['Tools']['strOfLocalization'](2069, [F]), m['state']['color'] = '#a9d94d', m.name['color'] = '#a9d94d') : (m['state'].text = game['Tools']['strOfLocalization'](2071), m['state']['color'] = '#58c4db', m.name['color'] = '#58c4db', L = !0);
                        } else
                            m['state'].text = game['Tools']['strOfLocalization'](2072), m['state']['color'] = '#8c8c8c', m.name['color'] = '#8c8c8c';
                        u['invited'] ? (m.btn['visible'] = !1, m['invited']['visible'] = !0) : (m.btn['visible'] = !0, m['invited']['visible'] = !1, game['Tools']['setGrayDisable'](m.btn, !L), L && (m.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](m.btn, !0);
                            var n = {
                                room_id: V.Inst['room_id'],
                                mode: V.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: u.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](n)
                            }, function (n, Z) {
                                n || Z['error'] ? (game['Tools']['setGrayDisable'](m.btn, !1), k['UIMgr'].Inst['showNetReqError']('sendClientMessage', n, Z)) : (m.btn['visible'] = !1, m['invited']['visible'] = !0, u['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    n;
            }
                (),
                Z = function () {
                    function n(n) {
                        var Z = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = n,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new k['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new k['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return Z['locking'];
                            }));
                        for (var p = this.root['getChildByName']('container_tabs'), V = function (n) {
                            m.tabs.push(p['getChildAt'](n)),
                                m.tabs[n]['clickHandler'] = new Laya['Handler'](m, function () {
                                    Z['locking'] || Z['tab_index'] != n && (1 == Z['tab_index'] && Z['page_zhangban']['changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](Z, function () {
                                        Z['change_tab'](n);
                                    }), null) : Z['change_tab'](n));
                                });
                        }, m = this, u = 0; u < p['numChildren']; u++)
                            V(u);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            Z['locking'] || (1 == Z['tab_index'] && Z['page_zhangban']['changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](Z, function () {
                                Z['close'](!1);
                            }), null) : Z['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                Z['locking'] || (1 == Z['tab_index'] && Z['page_zhangban']['changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](Z, function () {
                                    Z['close'](!1);
                                }), null) : Z['close'](!1));
                            });
                    }
                    return n['prototype'].show = function () {
                        var n = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            k['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                n['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var Z = 0; Z < this.tabs['length']; Z++) {
                            var p = this.tabs[Z];
                            p.skin = game['Tools']['localUISrc'](Z == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var V = p['getChildByName']('word');
                            V['color'] = Z == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                V['scaleX'] = V['scaleY'] = Z == this['tab_index'] ? 1.1 : 1,
                                Z == this['tab_index'] && p['parent']['setChildIndex'](p, this.tabs['length'] - 1);
                        }
                    },
                        n['prototype']['change_tab'] = function (k) {
                            var n = this;
                            this['tab_index'] = k;
                            for (var Z = 0; Z < this.tabs['length']; Z++) {
                                var p = this.tabs[Z];
                                p.skin = game['Tools']['localUISrc'](Z == k ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var V = p['getChildByName']('word');
                                V['color'] = Z == k ? '#552c1c' : '#d3a86c',
                                    V['scaleX'] = V['scaleY'] = Z == k ? 1.1 : 1,
                                    Z == k && p['parent']['setChildIndex'](p, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    n['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    n['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    n['locking'] = !1;
                                });
                        },
                        n['prototype']['close'] = function (n) {
                            var Z = this;
                            //修改友人房间立绘
                            if (!(Z.page_head.choosed_chara_index == 0 && Z.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = Z.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = Z.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = Z.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[Z.page_head.choosed_chara_index] = Z.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (n ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: V.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), k['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                Z['locking'] = !1,
                                    Z.me['visible'] = !1;
                            }))));
                        },
                        n;
                }
                    (),
                p = function () {
                    function k(k) {
                        this['modes'] = [],
                            this.me = k,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return k['prototype'].show = function (k) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = k,
                            this['scrollview']['addItem'](k['length']);
                        var n = this['scrollview']['total_height'];
                        n > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - n, this.bg['height'] = n + 20),
                            this.bg['visible'] = !0;
                    },
                        k['prototype']['render_item'] = function (k) {
                            var n = k['index'],
                                Z = k['container'],
                                p = Z['getChildByName']('info');
                            p['fontSize'] = 40,
                                p['fontSize'] = this['modes'][n]['length'] <= 5 ? 40 : this['modes'][n]['length'] <= 9 ? 55 - 3 * this['modes'][n]['length'] : 28,
                                p.text = this['modes'][n];
                        },
                        k;
                }
                    (),
                V = function (V) {
                    function m() {
                        var n = V.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return n['skin_ready'] = 'myres/room/btn_ready.png',
                            n['skin_cancel'] = 'myres/room/btn_cancel.png',
                            n['skin_start'] = 'myres/room/btn_start.png',
                            n['skin_start_no'] = 'myres/room/btn_start_no.png',
                            n['update_seq'] = 0,
                            n['pre_msgs'] = [],
                            n['msg_tail'] = -1,
                            n['posted'] = !1,
                            n['label_rommid'] = null,
                            n['player_cells'] = [],
                            n['btn_ok'] = null,
                            n['btn_invite_friend'] = null,
                            n['btn_add_robot'] = null,
                            n['btn_dress'] = null,
                            n['btn_copy'] = null,
                            n['beReady'] = !1,
                            n['room_id'] = -1,
                            n['owner_id'] = -1,
                            n['tournament_id'] = 0,
                            n['max_player_count'] = 0,
                            n['players'] = [],
                            n['container_rules'] = null,
                            n['container_top'] = null,
                            n['container_right'] = null,
                            n['locking'] = !1,
                            n['mousein_copy'] = !1,
                            n['popout'] = null,
                            n['room_link'] = null,
                            n['btn_copy_link'] = null,
                            n['last_start_room'] = 0,
                            n['invitefriend'] = null,
                            n['pre_choose'] = null,
                            n['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            m.Inst = n,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](n, function (k) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](k)),
                                    n['onReadyChange'](k['account_id'], k['ready'], k['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](n, function (k) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](k)),
                                    n['onPlayerChange'](k);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](n, function (k) {
                                n['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](k)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), n['onGameStart'](k));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](n, function (k) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](k)),
                                    n['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](n, function () {
                                n['enable'] && n.hide(Laya['Handler']['create'](n, function () {
                                    k['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            n;
                    }
                    return __extends(m, V),
                        m['prototype']['push_msg'] = function (k) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](k)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](k));
                        },
                        Object['defineProperty'](m['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](m['prototype'], 'robot_count', {
                            get: function () {
                                for (var k = 0, n = 0; n < this['players']['length']; n++)
                                    2 == this['players'][n]['category'] && k++;
                                return k;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        m['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        m['prototype']['updateData'] = function (k) {
                            if (!k)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < k.persons.length; i++) {

                                if (k.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    k.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    k.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    k.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    k.persons[i].title = GameMgr.Inst.account_data.title;
                                    k.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        k.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = k['room_id'],
                                this['owner_id'] = k['owner_id'],
                                this['room_mode'] = k.mode,
                                this['public_live'] = k['public_live'],
                                this['tournament_id'] = 0,
                                k['tournament_id'] && (this['tournament_id'] = k['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = k['max_player_count'],
                                this['players'] = [];
                            for (var n = 0; n < k['persons']['length']; n++) {
                                var Z = k['persons'][n];
                                Z['ready'] = !1,
                                    Z['cell_index'] = -1,
                                    Z['category'] = 1,
                                    this['players'].push(Z);
                            }
                            for (var n = 0; n < k['robot_count']; n++)
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
                            for (var n = 0; n < k['ready_list']['length']; n++)
                                for (var p = 0; p < this['players']['length']; p++)
                                    if (this['players'][p]['account_id'] == k['ready_list'][n]) {
                                        this['players'][p]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                k.seq && (this['update_seq'] = k.seq);
                        },
                        m['prototype']['onReadyChange'] = function (k, n, Z) {
                            for (var p = 0; p < this['players']['length']; p++)
                                if (this['players'][p]['account_id'] == k) {
                                    this['players'][p]['ready'] = n,
                                        this['players'][p]['dressing'] = Z,
                                        this['_onPlayerReadyChange'](this['players'][p]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        m['prototype']['onPlayerChange'] = function (k) {
                            if (app.Log.log(k), k = k['toJSON'](), !(k.seq && k.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < k.player_list.length; i++) {

                                    if (k.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        k.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        k.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        k.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            k.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (k.update_list != undefined) {
                                    for (var i = 0; i < k.update_list.length; i++) {

                                        if (k.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            k.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            k.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            k.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                k.update_list[i].nickname = MMP.settings.nickname;
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
                                //end
                                this['update_seq'] = k.seq;
                                var n = {};
                                n.type = 'onPlayerChange0',
                                    n['players'] = this['players'],
                                    n.msg = k,
                                    this['push_msg'](JSON['stringify'](n));
                                var Z = this['robot_count'],
                                    p = k['robot_count'];
                                if (p < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, Z--);
                                    for (var V = 0; V < this['players']['length']; V++)
                                        2 == this['players'][V]['category'] && Z > p && (this['players'][V]['category'] = 0, Z--);
                                }
                                for (var m = [], u = k['player_list'], V = 0; V < this['players']['length']; V++)
                                    if (1 == this['players'][V]['category']) {
                                        for (var L = -1, F = 0; F < u['length']; F++)
                                            if (u[F]['account_id'] == this['players'][V]['account_id']) {
                                                L = F;
                                                break;
                                            }
                                        if (-1 != L) {
                                            var J = u[L];
                                            m.push(this['players'][V]),
                                                this['players'][V]['avatar_id'] = J['avatar_id'],
                                                this['players'][V]['title'] = J['title'],
                                                this['players'][V]['verified'] = J['verified'];
                                        }
                                    } else
                                        2 == this['players'][V]['category'] && m.push(this['players'][V]);
                                this['players'] = m;
                                for (var V = 0; V < u['length']; V++) {
                                    for (var A = !1, J = u[V], F = 0; F < this['players']['length']; F++)
                                        if (1 == this['players'][F]['category'] && this['players'][F]['account_id'] == J['account_id']) {
                                            A = !0;
                                            break;
                                        }
                                    A || this['players'].push({
                                        account_id: J['account_id'],
                                        avatar_id: J['avatar_id'],
                                        nickname: J['nickname'],
                                        verified: J['verified'],
                                        title: J['title'],
                                        level: J['level'],
                                        level3: J['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var d = [!1, !1, !1, !1], V = 0; V < this['players']['length']; V++)
                                    - 1 != this['players'][V]['cell_index'] && (d[this['players'][V]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][V]));
                                for (var V = 0; V < this['players']['length']; V++)
                                    if (1 == this['players'][V]['category'] && -1 == this['players'][V]['cell_index'])
                                        for (var F = 0; F < this['max_player_count']; F++)
                                            if (!d[F]) {
                                                this['players'][V]['cell_index'] = F,
                                                    d[F] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][V]);
                                                break;
                                            }
                                for (var Z = this['robot_count'], p = k['robot_count']; p > Z;) {
                                    for (var g = -1, F = 0; F < this['max_player_count']; F++)
                                        if (!d[F]) {
                                            g = F;
                                            break;
                                        }
                                    if (-1 == g)
                                        break;
                                    d[g] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: g,
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
                                        Z++;
                                }
                                for (var V = 0; V < this['max_player_count']; V++)
                                    d[V] || this['_clearCell'](V);
                                var n = {};
                                if (n.type = 'onPlayerChange1', n['players'] = this['players'], this['push_msg'](JSON['stringify'](n)), k['owner_id']) {
                                    if (this['owner_id'] = k['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var F = 0; F < this['players']['length']; F++)
                                                if (this['players'][F] && this['players'][F]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][F]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var F = 0; F < this['players']['length']; F++)
                                            if (this['players'][F] && this['players'][F]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][F]);
                                                break;
                                            }
                            }
                        },
                        m['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), k['UI_Lobby'].Inst['enable'] = !0, k['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        m['prototype']['onCreate'] = function () {
                            var V = this;
                            this['last_start_room'] = 0;
                            var m = this.me['getChildByName']('root');
                            this['container_top'] = m['getChildByName']('top'),
                                this['container_right'] = m['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var u = function (n) {
                                var Z = m['getChildByName']('player_' + n['toString']()),
                                    p = {};
                                p['index'] = n,
                                    p['container'] = Z,
                                    p['container_flag'] = Z['getChildByName']('flag'),
                                    p['container_flag']['visible'] = !1,
                                    p['container_name'] = Z['getChildByName']('container_name'),
                                    p.name = Z['getChildByName']('container_name')['getChildByName']('name'),
                                    p['btn_t'] = Z['getChildByName']('btn_t'),
                                    p['container_illust'] = Z['getChildByName']('container_illust'),
                                    p['illust'] = new k['UI_Character_Skin'](Z['getChildByName']('container_illust')['getChildByName']('illust')),
                                    p.host = Z['getChildByName']('host'),
                                    p['title'] = new k['UI_PlayerTitle'](Z['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    p.rank = new k['UI_Level'](Z['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    p['is_robot'] = !1;
                                var u = 0;
                                p['btn_t']['clickHandler'] = Laya['Handler']['create'](L, function () {
                                    if (!(V['locking'] || Laya['timer']['currTimer'] < u)) {
                                        u = Laya['timer']['currTimer'] + 500;
                                        for (var k = 0; k < V['players']['length']; k++)
                                            if (V['players'][k]['cell_index'] == n) {
                                                V['kickPlayer'](k);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    p['btn_info'] = Z['getChildByName']('btn_info'),
                                    p['btn_info']['clickHandler'] = Laya['Handler']['create'](L, function () {
                                        if (!V['locking'])
                                            for (var Z = 0; Z < V['players']['length']; Z++)
                                                if (V['players'][Z]['cell_index'] == n) {
                                                    V['players'][Z]['account_id'] && V['players'][Z]['account_id'] > 0 && k['UI_OtherPlayerInfo'].Inst.show(V['players'][Z]['account_id'], V['room_mode'].mode < 10 ? 1 : 2, 1);
                                                    break;
                                                }
                                    }, null, !1),
                                    L['player_cells'].push(p);
                            }, L = this, F = 0; 4 > F; F++)
                                u(F);
                            this['btn_ok'] = m['getChildByName']('btn_ok');
                            var J = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < J + 500 || (J = Laya['timer']['currTimer'], V['owner_id'] == GameMgr.Inst['account_id'] ? V['getStart']() : V['switchReady']());
                            }, null, !1);
                            var A = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < A + 500 || (A = Laya['timer']['currTimer'], V['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    V['locking'] || V['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var d = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                V['locking'] || Laya['timer']['currTimer'] < d || (d = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: V['robot_count'] + 1
                                }, function (n, Z) {
                                    (n || Z['error'] && 1111 != Z['error'].code) && k['UIMgr'].Inst['showNetReqError']('modifyRoom_add', n, Z),
                                        d = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!V['locking']) {
                                        var n = 0;
                                        V['room_mode']['detail_rule'] && V['room_mode']['detail_rule']['chuanma'] && (n = 1),
                                            k['UI_Rules'].Inst.show(0, null, n);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    V['locking'] || V['beReady'] && V['owner_id'] != GameMgr.Inst['account_id'] || (V['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: V['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    V['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    V['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    V['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), V['popout']['visible'] = !0, k['UIBase']['anim_pop_out'](V['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new p(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var n = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    n.call('setSysClipboardText', V['room_link'].text),
                                        k['UIBase']['anim_pop_hide'](V['popout'], Laya['Handler']['create'](V, function () {
                                            V['popout']['visible'] = !1;
                                        })),
                                        k['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', V['room_link'].text, function () { }),
                                        k['UIBase']['anim_pop_hide'](V['popout'], Laya['Handler']['create'](V, function () {
                                            V['popout']['visible'] = !1;
                                        })),
                                        k['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    k['UIBase']['anim_pop_hide'](V['popout'], Laya['Handler']['create'](V, function () {
                                        V['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new n(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new Z(this.me['getChildByName']('pop_view'));
                        },
                        m['prototype'].show = function () {
                            var n = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var Z = 0; 4 > Z; Z++)
                                this['player_cells'][Z]['container']['visible'] = Z < this['max_player_count'];
                            for (var Z = 0; Z < this['max_player_count']; Z++)
                                this['_clearCell'](Z);
                            for (var Z = 0; Z < this['players']['length']; Z++)
                                this['players'][Z]['cell_index'] = Z, this['_refreshPlayerInfo'](this['players'][Z]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var p = {};
                            p.type = 'show',
                                p['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](p)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var V = [];
                            V.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var m = this['room_mode']['detail_rule'];
                            if (m) {
                                var u = 5,
                                    L = 20;
                                if (null != m['time_fixed'] && (u = m['time_fixed']), null != m['time_add'] && (L = m['time_add']), V.push(u['toString']() + '+' + L['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var F = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    F && V.push(F.name);
                                }
                                if (null != m['init_point'] && V.push(game['Tools']['strOfLocalization'](2199) + m['init_point']), null != m['fandian'] && V.push(game['Tools']['strOfLocalization'](2094) + ':' + m['fandian']), m['guyi_mode'] && V.push(game['Tools']['strOfLocalization'](3028)), null != m['dora_count'])
                                    switch (m['chuanma'] && (m['dora_count'] = 0), m['dora_count']) {
                                        case 0:
                                            V.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            V.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            V.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            V.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != m['shiduan'] && 1 != m['shiduan'] && V.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === m['fanfu'] && V.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === m['fanfu'] && V.push(game['Tools']['strOfLocalization'](2764)),
                                    null != m['bianjietishi'] && 1 != m['bianjietishi'] && V.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != m['have_zimosun'] && 1 != m['have_zimosun'] ? V.push(game['Tools']['strOfLocalization'](2202)) : V.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(V),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                k['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var Z = 0; Z < this['player_cells']['length']; Z++)
                                k['UIBase']['anim_alpha_in'](this['player_cells'][Z]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * Z, null, Laya.Ease['backOut']);
                            k['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                k['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    n['locking'] = !1;
                                });
                            var J = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != J && (this['room_link'].text += '(' + J + ')');
                            var A = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + A + '?room=' + this['room_id'];
                        },
                        m['prototype']['leaveRoom'] = function () {
                            var n = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (Z, p) {
                                Z || p['error'] ? k['UIMgr'].Inst['showNetReqError']('leaveRoom', Z, p) : (n['room_id'] = -1, n.hide(Laya['Handler']['create'](n, function () {
                                    k['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        m['prototype']['tryToClose'] = function (n) {
                            var Z = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (p, V) {
                                p || V['error'] ? (k['UIMgr'].Inst['showNetReqError']('leaveRoom', p, V), n['runWith'](!1)) : (Z['enable'] = !1, Z['pop_change_view']['close'](!0), n['runWith'](!0));
                            });
                        },
                        m['prototype'].hide = function (n) {
                            var Z = this;
                            this['locking'] = !0,
                                k['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var p = 0; p < this['player_cells']['length']; p++)
                                k['UIBase']['anim_alpha_out'](this['player_cells'][p]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            k['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                k['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    Z['locking'] = !1,
                                        Z['enable'] = !1,
                                        n && n.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        m['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var k = 0; k < this['player_cells']['length']; k++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][k]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        m['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        m['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (n, Z) {
                                (n || Z['error']) && k['UIMgr'].Inst['showNetReqError']('startRoom', n, Z);
                            })));
                        },
                        m['prototype']['kickPlayer'] = function (n) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var Z = this['players'][n];
                                1 == Z['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][n]['account_id']
                                }, function () { }) : 2 == Z['category'] && (this['pre_choose'] = Z, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (n, Z) {
                                    (n || Z['error']) && k['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', n, Z);
                                }));
                            }
                        },
                        m['prototype']['_clearCell'] = function (k) {
                            if (!(0 > k || k >= this['player_cells']['length'])) {
                                var n = this['player_cells'][k];
                                n['container_flag']['visible'] = !1,
                                    n['container_illust']['visible'] = !1,
                                    n.name['visible'] = !1,
                                    n['container_name']['visible'] = !1,
                                    n['btn_t']['visible'] = !1,
                                    n.host['visible'] = !1,
                                    n['illust']['clear']();
                            }
                        },
                        m['prototype']['_refreshPlayerInfo'] = function (k) {
                            var n = k['cell_index'];
                            if (!(0 > n || n >= this['player_cells']['length'])) {
                                var Z = this['player_cells'][n];
                                Z['container_illust']['visible'] = !0,
                                    Z['container_name']['visible'] = !0,
                                    Z.name['visible'] = !0,
                                    game['Tools']['SetNickname'](Z.name, k),
                                    Z['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && k['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == k['account_id'] && (Z['container_flag']['visible'] = !0, Z.host['visible'] = !0),
                                    k['account_id'] == GameMgr.Inst['account_id'] ? Z['illust']['setSkin'](k['avatar_id'], 'waitingroom') : Z['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](k['avatar_id']), 'waitingroom'),
                                    Z['title'].id = game['Tools']['titleLocalization'](k['account_id'], k['title']),
                                    Z.rank.id = k[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](k);
                            }
                        },
                        m['prototype']['_onPlayerReadyChange'] = function (k) {
                            var n = k['cell_index'];
                            if (!(0 > n || n >= this['player_cells']['length'])) {
                                var Z = this['player_cells'][n];
                                Z['container_flag']['visible'] = this['owner_id'] == k['account_id'] ? !0 : k['ready'];
                            }
                        },
                        m['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var k = 0, n = 0; n < this['players']['length']; n++)
                                    0 != this['players'][n]['category'] && (this['_refreshPlayerInfo'](this['players'][n]), k++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], k == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], k == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        m['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var k = 0, n = 0; n < this['players']['length']; n++) {
                                    var Z = this['players'][n];
                                    if (!Z || 0 == Z['category'])
                                        break;
                                    (Z['account_id'] == this['owner_id'] || Z['ready']) && k++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], k != this['max_player_count']), this['enable']) {
                                    for (var p = 0, n = 0; n < this['max_player_count']; n++) {
                                        var V = this['player_cells'][n];
                                        V && V['container_flag']['visible'] && p++;
                                    }
                                    if (k != p && !this['posted']) {
                                        this['posted'] = !0;
                                        var m = {};
                                        m['okcount'] = k,
                                            m['okcount2'] = p,
                                            m.msgs = [];
                                        var u = 0,
                                            L = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (u = (this['msg_tail'] + 1) % this['pre_msgs']['length'], L = this['msg_tail']), u >= 0 && L >= 0) {
                                            for (var n = u; n != L; n = (n + 1) % this['pre_msgs']['length'])
                                                m.msgs.push(this['pre_msgs'][n]);
                                            m.msgs.push(this['pre_msgs'][L]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', m, !1);
                                    }
                                }
                            }
                        },
                        m['prototype']['onGameStart'] = function (k) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](k['connect_token'], k['game_uuid'], k['location'], !1, null);
                        },
                        m['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        m['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        m.Inst = null,
                        m;
                }
                    (k['UIBase']);
            k['UI_WaitingRoom'] = V;
        }
            (uiscript || (uiscript = {}));






        // 保存装扮
        !function (k) {
            var n;
            !function (n) {
                var Z = function () {
                    function Z(Z, p, V) {
                        var m = this;
                        this['page_items'] = null,
                            this['page_headframe'] = null,
                            this['page_desktop'] = null,
                            this['page_bgm'] = null,
                            this.tabs = [],
                            this['tab_index'] = -1,
                            this['select_index'] = -1,
                            this['cell_titles'] = [2193, 2194, 2195, 1901, 2214, 2624, 2856, 2412, 2413, 2826],
                            this['cell_names'] = [411, 412, 413, 417, 414, 415, 416, 0, 0, 0],
                            this['cell_default_img'] = ['myres/sushe/slot_liqibang.jpg', 'myres/sushe/slot_hule.jpg', 'myres/sushe/slot_liqi.jpg', 'myres/sushe/slot_mpzs.jpg', 'myres/sushe/slot_hand.jpg', 'myres/sushe/slot_liqibgm.jpg', 'myres/sushe/slot_head_frame.jpg', '', '', ''],
                            this['cell_default_item'] = [0, 0, 0, 0, 0, 0, '305501', '305044', '305045', '307001'],
                            this['slot_ids'] = [0, 1, 2, 10, 3, 4, 5, 6, 7, 8],
                            this['slot_map'] = {},
                            this['_changed'] = !1,
                            this['_locking'] = null,
                            this['_locking'] = V,
                            this['container_zhuangban0'] = Z,
                            this['container_zhuangban1'] = p;
                        var u = this['container_zhuangban0']['getChildByName']('tabs');
                        u['vScrollBarSkin'] = '';
                        for (var L = function (n) {
                            var Z = u['getChildAt'](n);
                            F.tabs.push(Z),
                                Z['clickHandler'] = new Laya['Handler'](F, function () {
                                    m['locking'] || m['tab_index'] != n && (m['_changed'] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](m, function () {
                                        m['change_tab'](n);
                                    }), null) : m['change_tab'](n));
                                });
                        }, F = this, J = 0; J < u['numChildren']; J++)
                            L(J);
                        this['page_items'] = new n['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new n['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new n['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new n['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var n = [], Z = 0; Z < m['cell_titles']['length']; Z++) {
                                    var p = m['slot_ids'][Z];
                                    if (m['slot_map'][p]) {
                                        var V = m['slot_map'][p];
                                        if (!(V['item_id'] && V['item_id'] != m['cell_default_item'][Z] || V['item_id_list'] && 0 != V['item_id_list']['length']))
                                            continue;
                                        var u = [];
                                        if (V['item_id_list'])
                                            for (var L = 0, F = V['item_id_list']; L < F['length']; L++) {
                                                var J = F[L];
                                                J == m['cell_default_item'][Z] ? u.push(0) : u.push(J);
                                            }
                                        n.push({
                                            slot: p,
                                            item_id: V['item_id'],
                                            type: V.type,
                                            item_id_list: u
                                        });
                                    }
                                }
                                m['btn_save']['mouseEnabled'] = !1;
                                var A = m['tab_index'];
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: n,
                                //    save_index: A,
                                //    is_use: A == k['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (Z, p) {
                                //    if (m['btn_save']['mouseEnabled'] = !0, Z || p['error'])
                                //        k['UIMgr'].Inst['showNetReqError']('saveCommonViews', Z, p);
                                //    else {
                                if (k['UI_Sushe']['commonViewList']['length'] < A)
                                    for (var V = k['UI_Sushe']['commonViewList']['length']; A >= V; V++)
                                        k['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = k.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = k.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (k['UI_Sushe']['commonViewList'][A] = n, k['UI_Sushe']['using_commonview_index'] == A && m['onChangeGameView'](), m['tab_index'] != A)
                                    return;
                                m['btn_save']['mouseEnabled'] = !0,
                                    m['_changed'] = !1,
                                    m['refresh_btn']();
                                //    }
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                m['btn_use']['mouseEnabled'] = !1;
                                var n = m['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: n
                                //}, function (Z, p) {
                                //    m['btn_use']['mouseEnabled'] = !0,
                                //    Z || p['error'] ? k['UIMgr'].Inst['showNetReqError']('useCommonView', Z, p) : (
                                k['UI_Sushe']['using_commonview_index'] = n, m['refresh_btn'](), m['refresh_tab'](), m['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                m['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](Z['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object['defineProperty'](Z['prototype'], 'changed', {
                            get: function () {
                                return this['_changed'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Z['prototype'].show = function (n) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                n ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (k['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), k['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](k['UI_Sushe']['using_commonview_index']);
                        },
                        Z['prototype']['change_tab'] = function (n) {
                            if (this['tab_index'] = n, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < k['UI_Sushe']['commonViewList']['length'])
                                    for (var Z = k['UI_Sushe']['commonViewList'][this['tab_index']], p = 0; p < Z['length']; p++)
                                        this['slot_map'][Z[p].slot] = {
                                            slot: Z[p].slot,
                                            item_id: Z[p]['item_id'],
                                            type: Z[p].type,
                                            item_id_list: Z[p]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        Z['prototype']['refresh_tab'] = function () {
                            for (var n = 0; n < this.tabs['length']; n++) {
                                var Z = this.tabs[n];
                                Z['mouseEnabled'] = this['tab_index'] != n,
                                    Z['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == n ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    Z['getChildByName']('num')['color'] = this['tab_index'] == n ? '#2f1e19' : '#f2c797';
                                var p = Z['getChildByName']('choosed');
                                k['UI_Sushe']['using_commonview_index'] == n ? (p['visible'] = !0, p.x = this['tab_index'] == n ? -18 : -4) : p['visible'] = !1;
                            }
                        },
                        Z['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = k['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = k['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        Z['prototype']['onChangeSlotSelect'] = function (k) {
                            var n = this;
                            this['select_index'] = k,
                                this['random']['visible'] = !(6 == k || 9 == k);
                            var Z = 0;
                            k >= 0 && k < this['cell_default_item']['length'] && (Z = this['cell_default_item'][k]);
                            var p = Z,
                                V = this['slot_ids'][k],
                                m = !1,
                                u = [];
                            if (this['slot_map'][V]) {
                                var L = this['slot_map'][V];
                                u = L['item_id_list'],
                                    m = !!L.type,
                                    L['item_id'] && (p = this['slot_map'][V]['item_id']),
                                    m && L['item_id_list'] && L['item_id_list']['length'] > 0 && (p = L['item_id_list'][0]);
                            }
                            var F = Laya['Handler']['create'](this, function (p) {
                                if (p == Z && (p = 0), n['is_random']) {
                                    var m = n['slot_map'][V]['item_id_list']['indexOf'](p);
                                    m >= 0 ? n['slot_map'][V]['item_id_list']['splice'](m, 1) : (n['slot_map'][V]['item_id_list'] && 0 != n['slot_map'][V]['item_id_list']['length'] || (n['slot_map'][V]['item_id_list'] = []), n['slot_map'][V]['item_id_list'].push(p));
                                } else
                                    n['slot_map'][V] || (n['slot_map'][V] = {}), n['slot_map'][V]['item_id'] = p;
                                n['scrollview']['wantToRefreshItem'](k),
                                    n['_changed'] = !0,
                                    n['refresh_btn']();
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = m,
                                this['random_slider'].x = m ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var J = game['Tools']['strOfLocalization'](this['cell_titles'][k]);
                            if (k >= 0 && 2 >= k)
                                this['page_items'].show(J, k, p, F), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == k)
                                this['page_items'].show(J, 10, p, F), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == k)
                                this['page_items'].show(J, 3, p, F), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == k)
                                this['page_bgm'].show(J, p, F), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == k)
                                this['page_headframe'].show(J, p, F);
                            else if (7 == k || 8 == k) {
                                var A = this['cell_default_item'][7],
                                    d = this['cell_default_item'][8];
                                if (7 == k) {
                                    if (A = p, this['slot_map'][game['EView'].mjp]) {
                                        var g = this['slot_map'][game['EView'].mjp];
                                        g.type && g['item_id_list'] && g['item_id_list']['length'] > 0 ? d = g['item_id_list'][0] : g['item_id'] && (d = g['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](J, A, d, F);
                                } else {
                                    if (d = p, this['slot_map'][game['EView']['desktop']]) {
                                        var g = this['slot_map'][game['EView']['desktop']];
                                        g.type && g['item_id_list'] && g['item_id_list']['length'] > 0 ? A = g['item_id_list'][0] : g['item_id'] && (A = g['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](J, A, d, F);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                9 == k && this['page_desktop']['show_lobby_bg'](J, p, F);
                        },
                        Z['prototype']['onRandomBtnClick'] = function () {
                            var k = this;
                            if (6 != this['select_index'] && 9 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        k['random']['getChildAt'](k['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var n = this['select_index'],
                                    Z = this['slot_ids'][n],
                                    p = 0;
                                n >= 0 && n < this['cell_default_item']['length'] && (p = this['cell_default_item'][n]);
                                var V = p,
                                    m = [];
                                if (this['slot_map'][Z]) {
                                    var u = this['slot_map'][Z];
                                    m = u['item_id_list'],
                                        u['item_id'] && (V = this['slot_map'][Z]['item_id']);
                                }
                                if (n >= 0 && 4 >= n) {
                                    var L = this['slot_map'][Z];
                                    L ? (L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']])) : this['slot_map'][Z] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](V);
                                } else if (5 == n) {
                                    var L = this['slot_map'][Z];
                                    if (L)
                                        L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']]);
                                    else {
                                        this['slot_map'][Z] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](V);
                                } else if (7 == n || 8 == n) {
                                    var L = this['slot_map'][Z];
                                    if (L)
                                        L.type = L.type ? 0 : 1, L['item_id_list'] && 0 != L['item_id_list']['length'] || (L['item_id_list'] = [L['item_id']]);
                                    else {
                                        this['slot_map'][Z] = {
                                            type: 1,
                                            item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                        };
                                    }
                                    this['page_desktop']['changeRandomState'](V);
                                }
                                this['scrollview']['wantToRefreshItem'](n);
                            }
                        },
                        Z['prototype']['render_view'] = function (k) {
                            var n = this,
                                Z = k['container'],
                                p = k['index'],
                                V = Z['getChildByName']('cell');
                            this['select_index'] == p ? (V['scaleX'] = V['scaleY'] = 1.05, V['getChildByName']('choosed')['visible'] = !0) : (V['scaleX'] = V['scaleY'] = 1, V['getChildByName']('choosed')['visible'] = !1),
                                V['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][p]);
                            var m = V['getChildByName']('name'),
                                u = V['getChildByName']('icon'),
                                L = this['cell_default_item'][p],
                                F = this['slot_ids'][p],
                                J = !1;
                            if (this['slot_map'][F] && (J = this['slot_map'][F].type, this['slot_map'][F]['item_id'] && (L = this['slot_map'][F]['item_id'])), J)
                                m.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][F]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](u, 'myres/sushe/icon_random.jpg');
                            else {
                                var A = cfg['item_definition'].item.get(L);
                                A ? (m.text = A['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](u, A.icon, null, 'UI_Sushe_Select.Zhuangban')) : (m.text = game['Tools']['strOfLocalization'](this['cell_names'][p]), game['LoadMgr']['setImgSkin'](u, this['cell_default_img'][p], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var d = V['getChildByName']('btn');
                            d['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['locking'] || n['select_index'] != p && (n['onChangeSlotSelect'](p), n['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                d['mouseEnabled'] = this['select_index'] != p;
                        },
                        Z['prototype']['close'] = function (n) {
                            var Z = this;
                            this['container_zhuangban0']['visible'] && (n ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (k['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), k['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                Z['page_items']['close'](),
                                    Z['page_desktop']['close'](),
                                    Z['page_headframe']['close'](),
                                    Z['page_bgm']['close'](),
                                    Z['container_zhuangban0']['visible'] = !1,
                                    Z['container_zhuangban1']['visible'] = !1,
                                    game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                            }))));
                        },
                        Z['prototype']['onChangeGameView'] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = k.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            k['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var n = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            k['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](n, Laya['Handler']['create'](this, function () {
                                    k['UI_Lite_Loading'].Inst['enable'] && k['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        Z['prototype']['setRandomGray'] = function (n) {
                            this['btn_random']['visible'] = !n,
                                this['random']['filters'] = n ? [new Laya['ColorFilter'](k['GRAY_FILTER'])] : [];
                        },
                        Z['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        Z;
                }
                    ();
                n['Container_Zhuangban'] = Z;
            }
                (n = k['zhuangban'] || (k['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));







        // 设置称号
        !function (k) {
            var n = function (n) {
                function Z() {
                    var k = n.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return k['_root'] = null,
                        k['_scrollview'] = null,
                        k['_blackmask'] = null,
                        k['_locking'] = !1,
                        k['_showindexs'] = [],
                        Z.Inst = k,
                        k;
                }
                return __extends(Z, n),
                    Z.Init = function () {
                        var n = this;
                        // 获取称号
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (Z, p) {
                        //    if (Z || p['error'])
                        //        k['UIMgr'].Inst['showNetReqError']('fetchTitleList', Z, p);
                        //    else {
                        n['owned_title'] = [];
                        //        for (var V = 0; V < p['title_list']['length']; V++) {
                        for (let title of cfg.item_definition.title.rows_) {
                            var m = title.id;
                            cfg['item_definition']['title'].get(m) && n['owned_title'].push(m),
                                '600005' == m && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                m >= '600005' && '600015' >= m && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + m - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    Z['title_update'] = function (n) {
                        for (var Z = 0; Z < n['new_titles']['length']; Z++)
                            cfg['item_definition']['title'].get(n['new_titles'][Z]) && this['owned_title'].push(n['new_titles'][Z]), '600005' == n['new_titles'][Z] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), n['new_titles'][Z] >= '600005' && n['new_titles'][Z] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + n['new_titles'][Z] - '600005', 1);
                        if (n['remove_titles'] && n['remove_titles']['length'] > 0) {
                            for (var Z = 0; Z < n['remove_titles']['length']; Z++) {
                                for (var p = n['remove_titles'][Z], V = 0; V < this['owned_title']['length']; V++)
                                    if (this['owned_title'][V] == p) {
                                        this['owned_title'][V] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                p == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', k['UI_Lobby'].Inst['enable'] && k['UI_Lobby'].Inst.top['refresh'](), k['UI_PlayerInfo'].Inst['enable'] && k['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    Z['prototype']['onCreate'] = function () {
                        var n = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new k['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return n['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (k) {
                                n['setItemValue'](k['index'], k['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                n['_locking'] || (n['_blackmask'].hide(), n['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    Z['prototype'].show = function () {
                        var n = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), Z['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var p = 0; p < Z['owned_title']['length']; p++)
                                this['_showindexs'].push(p);
                            this['_showindexs'] = this['_showindexs'].sort(function (k, n) {
                                var p = k,
                                    V = cfg['item_definition']['title'].get(Z['owned_title'][k]);
                                V && (p += 1000 * V['priority']);
                                var m = n,
                                    u = cfg['item_definition']['title'].get(Z['owned_title'][n]);
                                return u && (m += 1000 * u['priority']),
                                    m - p;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](Z['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        k['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            n['_locking'] = !1;
                        }));
                    },
                    Z['prototype']['close'] = function () {
                        var n = this;
                        this['_locking'] = !0,
                            k['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                n['_locking'] = !1,
                                    n['enable'] = !1;
                            }));
                    },
                    Z['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    Z['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    Z['prototype']['setItemValue'] = function (k, n) {
                        var p = this;
                        if (this['enable']) {
                            var V = Z['owned_title'][this['_showindexs'][k]],
                                m = cfg['item_definition']['title'].find(V);
                            game['LoadMgr']['setImgSkin'](n['getChildByName']('img_title'), m.icon, null, 'UI_TitleBook'),
                                n['getChildByName']('using')['visible'] = V == GameMgr.Inst['account_data']['title'],
                                n['getChildByName']('desc').text = m['desc_' + GameMgr['client_language']];
                            var u = n['getChildByName']('btn');
                            u['clickHandler'] = Laya['Handler']['create'](this, function () {
                                V != GameMgr.Inst['account_data']['title'] ? (p['changeTitle'](k), n['getChildByName']('using')['visible'] = !0) : (p['changeTitle'](-1), n['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var L = n['getChildByName']('time'),
                                F = n['getChildByName']('img_title');
                            if (1 == m['unlock_type']) {
                                var J = m['unlock_param'][0],
                                    A = cfg['item_definition'].item.get(J);
                                L.text = game['Tools']['strOfLocalization'](3121) + A['expire_desc_' + GameMgr['client_language']],
                                    L['visible'] = !0,
                                    F.y = 0;
                            } else
                                L['visible'] = !1, F.y = 10;
                        }
                    },
                    Z['prototype']['changeTitle'] = function (n) {
                        var p = this,
                            V = GameMgr.Inst['account_data']['title'],
                            m = 0;
                        m = n >= 0 && n < this['_showindexs']['length'] ? Z['owned_title'][this['_showindexs'][n]] : '600001',
                            GameMgr.Inst['account_data']['title'] = m;
                        for (var u = -1, L = 0; L < this['_showindexs']['length']; L++)
                            if (V == Z['owned_title'][this['_showindexs'][L]]) {
                                u = L;
                                break;
                            }
                        k['UI_Lobby'].Inst['enable'] && k['UI_Lobby'].Inst.top['refresh'](),
                            k['UI_PlayerInfo'].Inst['enable'] && k['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = m;
                        MMP.saveSettings();
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                        //    title: '600001' == m ? 0 : m
                        //}, function (Z, m) {
                        //    (Z || m['error']) && (k['UIMgr'].Inst['showNetReqError']('useTitle', Z, m), GameMgr.Inst['account_data']['title'] = V, k['UI_Lobby'].Inst['enable'] && k['UI_Lobby'].Inst.top['refresh'](), k['UI_PlayerInfo'].Inst['enable'] && k['UI_PlayerInfo'].Inst['refreshBaseInfo'](), p['enable'] && (n >= 0 && n < p['_showindexs']['length'] && p['_scrollview']['wantToRefreshItem'](n), u >= 0 && u < p['_showindexs']['length'] && p['_scrollview']['wantToRefreshItem'](u)));
                        //});
                    },
                    Z.Inst = null,
                    Z['owned_title'] = [],
                    Z;
            }
                (k['UIBase']);
            k['UI_TitleBook'] = n;
        }
            (uiscript || (uiscript = {}));





        // 友人房调整装扮
        !function (k) {
            var n;
            !function (n) {
                var Z = function () {
                    function Z(k) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = k,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new n['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return Z['prototype'].show = function (n) {
                        var Z = this;
                        this.me['visible'] = !0,
                            n ? this.me['alpha'] = 1 : k['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var p = 0, V = k['UI_Sushe']['star_chars']; p < V['length']; p++)
                            for (var m = V[p], u = 0; u < k['UI_Sushe']['characters']['length']; u++)
                                if (!k['UI_Sushe']['hidden_characters_map'][m] && k['UI_Sushe']['characters'][u]['charid'] == m) {
                                    this['chara_infos'].push({
                                        chara_id: k['UI_Sushe']['characters'][u]['charid'],
                                        skin_id: k['UI_Sushe']['characters'][u].skin,
                                        is_upgraded: k['UI_Sushe']['characters'][u]['is_upgraded']
                                    }),
                                        k['UI_Sushe']['main_character_id'] == k['UI_Sushe']['characters'][u]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var u = 0; u < k['UI_Sushe']['characters']['length']; u++)
                            k['UI_Sushe']['hidden_characters_map'][k['UI_Sushe']['characters'][u]['charid']] || -1 == k['UI_Sushe']['star_chars']['indexOf'](k['UI_Sushe']['characters'][u]['charid']) && (this['chara_infos'].push({
                                chara_id: k['UI_Sushe']['characters'][u]['charid'],
                                skin_id: k['UI_Sushe']['characters'][u].skin,
                                is_upgraded: k['UI_Sushe']['characters'][u]['is_upgraded']
                            }), k['UI_Sushe']['main_character_id'] == k['UI_Sushe']['characters'][u]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var L = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(L['chara_id'], L['skin_id'], Laya['Handler']['create'](this, function (k) {
                            Z['choosed_skin_id'] = k,
                                L['skin_id'] = k,
                                Z['scrollview']['wantToRefreshItem'](Z['choosed_chara_index']);
                        }, null, !1));
                    },
                        Z['prototype']['render_character_cell'] = function (n) {
                            var Z = this,
                                p = n['index'],
                                V = n['container'],
                                m = n['cache_data'];
                            m['index'] = p;
                            var u = this['chara_infos'][p];
                            m['inited'] || (m['inited'] = !0, m.skin = new k['UI_Character_Skin'](V['getChildByName']('btn')['getChildByName']('head')), m['bound'] = V['getChildByName']('btn')['getChildByName']('bound'));
                            var L = V['getChildByName']('btn');
                            L['getChildByName']('choose')['visible'] = p == this['choosed_chara_index'],
                                m.skin['setSkin'](u['skin_id'], 'bighead'),
                                L['getChildByName']('using')['visible'] = p == this['choosed_chara_index'];
                            var F = cfg['item_definition']['character'].find(u['chara_id']),
                                J = F['name_' + GameMgr['client_language'] + '2'] ? F['name_' + GameMgr['client_language'] + '2'] : F['name_' + GameMgr['client_language']],
                                A = L['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                A.text = J['replace']('-', '|')['replace'](/\./g, '·');
                                var d = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                A['leading'] = d.test(J) ? -15 : 0;
                            } else
                                A.text = J;
                            L['getChildByName']('star') && (L['getChildByName']('star')['visible'] = p < this['star_char_count']);
                            var g = cfg['item_definition']['character'].get(u['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? m['bound'].skin = g.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (u['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (u['is_upgraded'] ? '2.png' : '.png')) : g.ur ? (m['bound'].pos(-10, -2), m['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '6.png' : '5.png'))) : (m['bound'].pos(4, 20), m['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '4.png' : '3.png'))),
                                L['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '2.png' : '.png')),
                                V['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (p != Z['choosed_chara_index']) {
                                        var k = Z['choosed_chara_index'];
                                        Z['choosed_chara_index'] = p,
                                            Z['choosed_skin_id'] = u['skin_id'],
                                            Z['page_skin'].show(u['chara_id'], u['skin_id'], Laya['Handler']['create'](Z, function (k) {
                                                Z['choosed_skin_id'] = k,
                                                    u['skin_id'] = k,
                                                    m.skin['setSkin'](k, 'bighead');
                                            }, null, !1)),
                                            Z['scrollview']['wantToRefreshItem'](k),
                                            Z['scrollview']['wantToRefreshItem'](p);
                                    }
                                });
                        },
                        Z['prototype']['close'] = function (n) {
                            var Z = this;
                            if (this.me['visible'])
                                if (n)
                                    this.me['visible'] = !1;
                                else {
                                    var p = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //p['chara_id'] != k['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: p['chara_id']
                                    //    }, function () {}), 
                                    k['UI_Sushe']['main_character_id'] = p['chara_id'];
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: p['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var V = 0; V < k['UI_Sushe']['characters']['length']; V++)
                                        if (k['UI_Sushe']['characters'][V]['charid'] == p['chara_id']) {
                                            k['UI_Sushe']['characters'][V].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        k['UI_Sushe']['onMainSkinChange'](),
                                        k['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            Z.me['visible'] = !1;
                                        }));
                                }
                        },
                        Z;
                }
                    ();
                n['Page_Waiting_Head'] = Z;
            }
                (n = k['zhuangban'] || (k['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));






        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var k = GameMgr;
            var n = GameMgr.Inst;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (Z, p) {
                if (Z || p['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', Z, p);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](p)),
                        k.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    p.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    p.account.title = GameMgr.Inst.account_data.title;
                    p.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        p.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var V in p['account']) {
                        if (k.Inst['account_data'][V] = p['account'][V], 'platform_diamond' == V)
                            for (var m = p['account'][V], u = 0; u < m['length']; u++)
                                n['account_numerical_resource'][m[u].id] = m[u]['count'];
                        if ('skin_ticket' == V && (k.Inst['account_numerical_resource']['100004'] = p['account'][V]), 'platform_skin_ticket' == V)
                            for (var m = p['account'][V], u = 0; u < m['length']; u++)
                                n['account_numerical_resource'][m[u].id] = m[u]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        p['account']['room_id'] && k.Inst['updateRoom'](),
                        '10102' === k.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === k.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }




        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (n, Z, p) {
            (GM_xmlhttpRequest({
                method: 'post',
                url: MMP.settings.sendGameURL,
                data: JSON.stringify({
                    'current_record_uuid': n,
                    'account_id': parseInt(Z.toString())
                }),
                onload: function (msg) {
                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                        'current_record_uuid': n,
                        'account_id': parseInt(Z.toString())
                    }));
                }
            }));
            var k = GameMgr;
            var V = GameMgr.Inst;
            return n = n.trim(),
                app.Log.log('checkPaiPu game_uuid:' + n + ' account_id:' + Z['toString']() + ' paipu_config:' + p),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), k.Inst['onLoadStart']('paipu'), 2 & p && (n = game['Tools']['DecodePaipuUUID'](n)), this['record_uuid'] = n, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: n,
                    client_version_string: this['getClientVersion']()
                }, function (k, m) {
                    if (k || m['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', k, m);
                        var u = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](u);
                        var L = function () {
                            return u += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, u)),
                                u >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, L), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, V, L),
                            V['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': m.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': m.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var F = m.head,
                            J = [null, null, null, null],
                            A = game['Tools']['strOfLocalization'](2003),
                            d = F['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: n,
                            client_version_string: V['getClientVersion']()
                        }, function () { }),
                            d['extendinfo'] && (A = game['Tools']['strOfLocalization'](2004)),
                            d['detail_rule'] && d['detail_rule']['ai_level'] && (1 === d['detail_rule']['ai_level'] && (A = game['Tools']['strOfLocalization'](2003)), 2 === d['detail_rule']['ai_level'] && (A = game['Tools']['strOfLocalization'](2004)));
                        var g = !1;
                        F['end_time'] ? (V['record_end_time'] = F['end_time'], F['end_time'] > '1576112400' && (g = !0)) : V['record_end_time'] = -1,
                            V['record_start_time'] = F['start_time'] ? F['start_time'] : -1;
                        for (var b = 0; b < F['accounts']['length']; b++) {
                            var l = F['accounts'][b];
                            if (l['character']) {
                                var B = l['character'],
                                    s = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (l.account_id == GameMgr.Inst.account_id) {
                                        l.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        l.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        l.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        l.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        l.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            l.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (l.avatar_id == 400101 || l.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            l.avatar_id = skin.id;
                                            l.character.charid = skin.character_id;
                                            l.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(l.account_id);
                                        if (server == 1) {
                                            l.nickname = '[CN]' + l.nickname;
                                        } else if (server == 2) {
                                            l.nickname = '[JP]' + l.nickname;
                                        } else if (server == 3) {
                                            l.nickname = '[EN]' + l.nickname;
                                        } else {
                                            l.nickname = '[??]' + l.nickname;
                                        }
                                    }
                                }
                                // END
                                if (g) {
                                    var S = l['views'];
                                    if (S)
                                        for (var G = 0; G < S['length']; G++)
                                            s[S[G].slot] = S[G]['item_id'];
                                } else {
                                    var U = B['views'];
                                    if (U)
                                        for (var G = 0; G < U['length']; G++) {
                                            var W = U[G].slot,
                                                Y = U[G]['item_id'],
                                                P = W - 1;
                                            s[P] = Y;
                                        }
                                }
                                var _ = [];
                                for (var T in s)
                                    _.push({
                                        slot: parseInt(T),
                                        item_id: s[T]
                                    });
                                l['views'] = _,
                                    J[l.seat] = l;
                            } else
                                l['character'] = {
                                    charid: l['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(l['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    l['avatar_id'] = l['character'].skin,
                                    l['views'] = [],
                                    J[l.seat] = l;
                        }
                        for (var q = game['GameUtility']['get_default_ai_skin'](), y = game['GameUtility']['get_default_ai_character'](), b = 0; b < J['length']; b++)
                            if (null == J[b]) {
                                J[b] = {
                                    nickname: A,
                                    avatar_id: q,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: y,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: q,
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
                                            J[b].avatar_id = skin.id;
                                            J[b].character.charid = skin.character_id;
                                            J[b].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        J[b].nickname = '[BOT]' + J[b].nickname;
                                    }
                                }
                                // END
                            }
                        var h = Laya['Handler']['create'](V, function (k) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](F['config'], J, Laya['Handler']['create'](V, function () {
                                    V['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = p,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](F['config'])), J, Z, view['EMJMode']['paipu'], Laya['Handler']['create'](V, function () {
                                            uiscript['UI_Replay'].Inst['initData'](k),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, V, function () {
                                                    V['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, V, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, V, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](V, function (k) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * k);
                                }, null, !1));
                        }),
                            t = {};
                        if (t['record'] = F, m.data && m.data['length'])
                            t.game = net['MessageWrapper']['decodeMessage'](m.data), h['runWith'](t);
                        else {
                            var z = m['data_url'];
                            game['LoadMgr']['httpload'](z, 'arraybuffer', !1, Laya['Handler']['create'](V, function (k) {
                                if (k['success']) {
                                    var n = new Laya.Byte();
                                    n['writeArrayBuffer'](k.data);
                                    var Z = net['MessageWrapper']['decodeMessage'](n['getUint8Array'](0, n['length']));
                                    t.game = Z,
                                        h['runWith'](t);
                                } else
                                    uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + m['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), V['duringPaipu'] = !1;
                            }));
                        }
                    }
                }), void 0);
        }





        // 牌谱功能
        !function (k) {
            var n = function () {
                function n(k) {
                    var n = this;
                    this.me = k,
                        this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            n['locking'] || n.hide(null);
                        }),
                        this['title'] = this.me['getChildByName']('title'),
                        this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                        this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                        this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                        this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                        this.me['visible'] = !1,
                        this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            n['locking'] || n.hide(null);
                        }, null, !1),
                        this['container_hidename'] = this.me['getChildByName']('hidename'),
                        this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var Z = this['container_hidename']['getChildByName']('w0'),
                        p = this['container_hidename']['getChildByName']('w1');
                    p.x = Z.x + Z['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            n['sp_checkbox']['visible'] = !n['sp_checkbox']['visible'],
                                n['refresh_share_uuid']();
                        });
                }
                return n['prototype']['show_share'] = function (n) {
                    var Z = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                        this['sp_checkbox']['visible'] = !1,
                        this['btn_confirm']['visible'] = !1,
                        this['input']['editable'] = !1,
                        this.uuid = n,
                        this['refresh_share_uuid'](),
                        this.me['visible'] = !0,
                        this['locking'] = !0,
                        this['container_hidename']['visible'] = !0,
                        this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                        k['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            Z['locking'] = !1;
                        }));
                },
                    n['prototype']['refresh_share_uuid'] = function () {
                        var k = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            n = this.uuid,
                            Z = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + Z + '?paipu=' + game['Tools']['EncodePaipuUUID'](n) + '_a' + k + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + Z + '?paipu=' + n + '_a' + k;
                    },
                    n['prototype']['show_check'] = function () {
                        var n = this;
                        return k['UI_PiPeiYuYue'].Inst['enable'] ? (k['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return n['input'].text ? (n.hide(Laya['Handler']['create'](n, function () {
                                var k = n['input'].text['split']('='),
                                    Z = k[k['length'] - 1]['split']('_'),
                                    p = 0;
                                Z['length'] > 1 && (p = 'a' == Z[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(Z[1]['substr'](1))) : parseInt(Z[1]));
                                var V = 0;
                                if (Z['length'] > 2) {
                                    var m = parseInt(Z[2]);
                                    m && (V = m);
                                }
                                GameMgr.Inst['checkPaiPu'](Z[0], p, V);
                            })), void 0) : (k['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, k['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            n['locking'] = !1;
                        })), void 0);
                    },
                    n['prototype'].hide = function (n) {
                        var Z = this;
                        this['locking'] = !0,
                            k['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                Z['locking'] = !1,
                                    Z.me['visible'] = !1,
                                    n && n.run();
                            }));
                    },
                    n;
            }
                (),
                Z = function () {
                    function n(k) {
                        var n = this;
                        this.me = k,
                            this['blackbg'] = k['getChildByName']('blackbg'),
                            this.root = k['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                n['locking'] || n['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                n['locking'] || (game['Tools']['calu_word_length'](n['input'].text) > 30 ? n['toolong']['visible'] = !0 : (n['close'](), m['addCollect'](n.uuid, n['start_time'], n['end_time'], n['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return n['prototype'].show = function (n, Z, p) {
                        var V = this;
                        this.uuid = n,
                            this['start_time'] = Z,
                            this['end_time'] = p,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            k['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                V['locking'] = !1;
                            }));
                    },
                        n['prototype']['close'] = function () {
                            var n = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                k['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    n['locking'] = !1,
                                        n.me['visible'] = !1;
                                }));
                        },
                        n;
                }
                    ();
            k['UI_Pop_CollectInput'] = Z;
            var p;
            !function (k) {
                k[k.ALL = 0] = 'ALL',
                    k[k['FRIEND'] = 1] = 'FRIEND',
                    k[k.RANK = 2] = 'RANK',
                    k[k['MATCH'] = 4] = 'MATCH',
                    k[k['COLLECT'] = 100] = 'COLLECT';
            }
                (p || (p = {}));
            var V = function () {
                function n(k) {
                    this['uuid_list'] = [],
                        this.type = k,
                        this['reset']();
                }
                return n['prototype']['reset'] = function () {
                    this['count'] = 0,
                        this['true_count'] = 0,
                        this['have_more_paipu'] = !0,
                        this['uuid_list'] = [],
                        this['duringload'] = !1;
                },
                    n['prototype']['loadList'] = function () {
                        var n = this;
                        if (!this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == p['COLLECT']) {
                                for (var Z = [], V = 0, u = 0; 10 > u; u++) {
                                    var L = this['count'] + u;
                                    if (L >= m['collect_lsts']['length'])
                                        break;
                                    V++;
                                    var F = m['collect_lsts'][L];
                                    m['record_map'][F] || Z.push(F),
                                        this['uuid_list'].push(F);
                                }
                                Z['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: Z
                                }, function (p, u) {
                                    if (n['duringload'] = !1, m.Inst['onLoadStateChange'](n.type, !1), p || u['error'])
                                        k['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', p, u);
                                    else if (app.Log.log(JSON['stringify'](u)), u['record_list'] && u['record_list']['length'] == Z['length']) {
                                        for (var L = 0; L < u['record_list']['length']; L++) {
                                            var F = u['record_list'][L].uuid;
                                            m['record_map'][F] || (m['record_map'][F] = u['record_list'][L]);
                                        }
                                        n['count'] += V,
                                            n['count'] >= m['collect_lsts']['length'] && (n['have_more_paipu'] = !1, m.Inst['onLoadOver'](n.type)),
                                            m.Inst['onLoadMoreLst'](n.type, V);
                                    } else
                                        n['have_more_paipu'] = !1, m.Inst['onLoadOver'](n.type);
                                }) : (this['duringload'] = !1, this['count'] += V, this['count'] >= m['collect_lsts']['length'] && (this['have_more_paipu'] = !1, m.Inst['onLoadOver'](this.type)), m.Inst['onLoadMoreLst'](this.type, V));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (Z, V) {
                                    if (n['duringload'] = !1, m.Inst['onLoadStateChange'](n.type, !1), Z || V['error'])
                                        k['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', Z, V);
                                    else if (app.Log.log(JSON['stringify'](V)), V['record_list'] && V['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(V),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(V));
                                                }
                                            }));
                                            for (let record_list of V['record_list']) {
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
                                        for (var u = V['record_list'], L = 0, F = 0; F < u['length']; F++) {
                                            var J = u[F].uuid;
                                            if (n.type == p.RANK && u[F]['config'] && u[F]['config'].meta) {
                                                var A = u[F]['config'].meta;
                                                if (A) {
                                                    var d = cfg['desktop']['matchmode'].get(A['mode_id']);
                                                    if (d && 5 == d.room)
                                                        continue;
                                                }
                                            }
                                            L++,
                                                n['uuid_list'].push(J),
                                                m['record_map'][J] || (m['record_map'][J] = u[F]);
                                        }
                                        n['count'] += L,
                                            n['true_count'] += u['length'],
                                            m.Inst['onLoadMoreLst'](n.type, L),
                                            n['have_more_paipu'] = !0;
                                    } else
                                        n['have_more_paipu'] = !1, m.Inst['onLoadOver'](n.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                n['duringload'] && m.Inst['onLoadStateChange'](n.type, !0);
                            });
                        }
                    },
                    n['prototype']['removeAt'] = function (k) {
                        for (var n = 0; n < this['uuid_list']['length'] - 1; n++)
                            n >= k && (this['uuid_list'][n] = this['uuid_list'][n + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    n;
            }
                (),
                m = function (m) {
                    function u() {
                        var k = m.call(this, new ui['lobby']['paipuUI']()) || this;
                        return k.top = null,
                            k['container_scrollview'] = null,
                            k['scrollview'] = null,
                            k['loading'] = null,
                            k.tabs = [],
                            k['pop_otherpaipu'] = null,
                            k['pop_collectinput'] = null,
                            k['label_collect_count'] = null,
                            k['noinfo'] = null,
                            k['locking'] = !1,
                            k['current_type'] = p.ALL,
                            u.Inst = k,
                            k;
                    }
                    return __extends(u, m),
                        u.init = function () {
                            var k = this;
                            this['paipuLst'][p.ALL] = new V(p.ALL),
                                this['paipuLst'][p['FRIEND']] = new V(p['FRIEND']),
                                this['paipuLst'][p.RANK] = new V(p.RANK),
                                this['paipuLst'][p['MATCH']] = new V(p['MATCH']),
                                this['paipuLst'][p['COLLECT']] = new V(p['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (n, Z) {
                                    if (n || Z['error']);
                                    else {
                                        if (Z['record_list']) {
                                            for (var p = Z['record_list'], V = 0; V < p['length']; V++) {
                                                var m = {
                                                    uuid: p[V].uuid,
                                                    time: p[V]['end_time'],
                                                    remarks: p[V]['remarks']
                                                };
                                                k['collect_lsts'].push(m.uuid),
                                                    k['collect_info'][m.uuid] = m;
                                            }
                                            k['collect_lsts'] = k['collect_lsts'].sort(function (n, Z) {
                                                return k['collect_info'][Z].time - k['collect_info'][n].time;
                                            });
                                        }
                                        Z['record_collect_limit'] && (k['collect_limit'] = Z['record_collect_limit']);
                                    }
                                });
                        },
                        u['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        u['reset'] = function () {
                            this['paipuLst'][p.ALL] && this['paipuLst'][p.ALL]['reset'](),
                                this['paipuLst'][p['FRIEND']] && this['paipuLst'][p['FRIEND']]['reset'](),
                                this['paipuLst'][p.RANK] && this['paipuLst'][p.RANK]['reset'](),
                                this['paipuLst'][p['MATCH']] && this['paipuLst'][p['MATCH']]['reset']();
                        },
                        u['addCollect'] = function (n, Z, p, V) {
                            var m = this;
                            if (!this['collect_info'][n]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return k['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: n,
                                    remarks: V,
                                    start_time: Z,
                                    end_time: p
                                }, function () { });
                                var L = {
                                    uuid: n,
                                    remarks: V,
                                    time: p
                                };
                                this['collect_info'][n] = L,
                                    this['collect_lsts'].push(n),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (k, n) {
                                        return m['collect_info'][n].time - m['collect_info'][k].time;
                                    }),
                                    k['UI_DesktopInfo'].Inst && k['UI_DesktopInfo'].Inst['enable'] && k['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    u.Inst && u.Inst['enable'] && u.Inst['onCollectChange'](n, -1);
                            }
                        },
                        u['removeCollect'] = function (n) {
                            var Z = this;
                            if (this['collect_info'][n]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: n
                                }, function () { }),
                                    delete this['collect_info'][n];
                                for (var p = -1, V = 0; V < this['collect_lsts']['length']; V++)
                                    if (this['collect_lsts'][V] == n) {
                                        this['collect_lsts'][V] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            p = V;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (k, n) {
                                        return Z['collect_info'][n].time - Z['collect_info'][k].time;
                                    }),
                                    k['UI_DesktopInfo'].Inst && k['UI_DesktopInfo'].Inst['enable'] && k['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    u.Inst && u.Inst['enable'] && u.Inst['onCollectChange'](n, p);
                            }
                        },
                        u['prototype']['onCreate'] = function () {
                            var p = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    p['locking'] || p['close'](Laya['Handler']['create'](p, function () {
                                        k['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (k) {
                                    p['setItemValue'](k['index'], k['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var k = u['paipuLst'][p['current_type']];
                                    (1 - p['scrollview'].rate) * k['count'] < 3 && (k['duringload'] || (k['have_more_paipu'] ? k['loadList']() : 0 == k['count'] && (p['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    p['pop_otherpaipu'].me['visible'] || p['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var V = 0; 5 > V; V++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](V)), this.tabs[V]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [V, !1]);
                            this['pop_otherpaipu'] = new n(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new Z(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        u['prototype'].show = function () {
                            var n = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                k['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                k['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    n['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = u['collect_lsts']['length']['toString']() + '/' + u['collect_limit']['toString']();
                        },
                        u['prototype']['close'] = function (n) {
                            var Z = this;
                            this['locking'] = !0,
                                k['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                k['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    Z['locking'] = !1,
                                        Z['enable'] = !1,
                                        n && n.run();
                                });
                        },
                        u['prototype']['changeTab'] = function (k, n) {
                            var Z = [p.ALL, p.RANK, p['FRIEND'], p['MATCH'], p['COLLECT']];
                            if (n || Z[k] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = Z[k], this['current_type'] == p['COLLECT'] && u['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != p['COLLECT']) {
                                    var V = u['paipuLst'][this['current_type']]['count'];
                                    V > 0 && this['scrollview']['addItem'](V);
                                }
                                for (var m = 0; m < this.tabs['length']; m++) {
                                    var L = this.tabs[m];
                                    L['getChildByName']('img').skin = game['Tools']['localUISrc'](k == m ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        L['getChildByName']('label_name')['color'] = k == m ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        u['prototype']['setItemValue'] = function (n, Z) {
                            var p = this;
                            if (this['enable']) {
                                var V = u['paipuLst'][this['current_type']];
                                if (V || !(n >= V['uuid_list']['length'])) {
                                    for (var m = u['record_map'][V['uuid_list'][n]], L = 0; 4 > L; L++) {
                                        var F = Z['getChildByName']('p' + L['toString']());
                                        if (L < m['result']['players']['length']) {
                                            F['visible'] = !0;
                                            var J = F['getChildByName']('chosen'),
                                                A = F['getChildByName']('rank'),
                                                d = F['getChildByName']('rank_word'),
                                                g = F['getChildByName']('name'),
                                                b = F['getChildByName']('score'),
                                                l = m['result']['players'][L];
                                            b.text = l['part_point_1'] || '0';
                                            for (var B = 0, s = game['Tools']['strOfLocalization'](2133), S = 0, G = !1, U = 0; U < m['accounts']['length']; U++)
                                                if (m['accounts'][U].seat == l.seat) {
                                                    B = m['accounts'][U]['account_id'],
                                                        s = m['accounts'][U]['nickname'],
                                                        S = m['accounts'][U]['verified'],
                                                        G = m['accounts'][U]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](g, {
                                                account_id: B,
                                                nickname: s,
                                                verified: S
                                            }),
                                                J['visible'] = G,
                                                b['color'] = G ? '#ffc458' : '#b98930',
                                                g['getChildByName']('name')['color'] = G ? '#dfdfdf' : '#a0a0a0',
                                                d['color'] = A['color'] = G ? '#57bbdf' : '#489dbc';
                                            var W = F['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (L) {
                                                    case 0:
                                                        W.text = 'st';
                                                        break;
                                                    case 1:
                                                        W.text = 'nd';
                                                        break;
                                                    case 2:
                                                        W.text = 'rd';
                                                        break;
                                                    case 3:
                                                        W.text = 'th';
                                                }
                                        } else
                                            F['visible'] = !1;
                                    }
                                    var Y = new Date(1000 * m['end_time']),
                                        P = '';
                                    P += Y['getFullYear']() + '/',
                                        P += (Y['getMonth']() < 9 ? '0' : '') + (Y['getMonth']() + 1)['toString']() + '/',
                                        P += (Y['getDate']() < 10 ? '0' : '') + Y['getDate']() + ' ',
                                        P += (Y['getHours']() < 10 ? '0' : '') + Y['getHours']() + ':',
                                        P += (Y['getMinutes']() < 10 ? '0' : '') + Y['getMinutes'](),
                                        Z['getChildByName']('date').text = P,
                                        Z['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return p['locking'] ? void 0 : k['UI_PiPeiYuYue'].Inst['enable'] ? (k['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](m.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        Z['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            p['locking'] || p['pop_otherpaipu'].me['visible'] || (p['pop_otherpaipu']['show_share'](m.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var _ = Z['getChildByName']('room'),
                                        T = game['Tools']['get_room_desc'](m['config']);
                                    _.text = T.text;
                                    var q = '';
                                    if (1 == m['config']['category'])
                                        q = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == m['config']['category'])
                                        q = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == m['config']['category']) {
                                        var y = m['config'].meta;
                                        if (y) {
                                            var h = cfg['desktop']['matchmode'].get(y['mode_id']);
                                            h && (q = h['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (u['collect_info'][m.uuid]) {
                                        var t = u['collect_info'][m.uuid],
                                            z = Z['getChildByName']('remarks_info'),
                                            f = Z['getChildByName']('input'),
                                            I = f['getChildByName']('txtinput'),
                                            x = Z['getChildByName']('btn_input'),
                                            j = !1,
                                            w = function () {
                                                j ? (z['visible'] = !1, f['visible'] = !0, I.text = z.text, x['visible'] = !1) : (z.text = t['remarks'] && '' != t['remarks'] ? game['Tools']['strWithoutForbidden'](t['remarks']) : q, z['visible'] = !0, f['visible'] = !1, x['visible'] = !0);
                                            };
                                        w(),
                                            x['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                j = !0,
                                                    w();
                                            }, null, !1),
                                            I.on('blur', this, function () {
                                                j && (game['Tools']['calu_word_length'](I.text) > 30 ? k['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : I.text != t['remarks'] && (t['remarks'] = I.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: m.uuid,
                                                    remarks: I.text
                                                }, function () { }))),
                                                    j = !1,
                                                    w();
                                            });
                                        var r = Z['getChildByName']('collect');
                                        r['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](p, function () {
                                                u['removeCollect'](m.uuid);
                                            }));
                                        }, null, !1),
                                            r['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        Z['getChildByName']('input')['visible'] = !1,
                                            Z['getChildByName']('btn_input')['visible'] = !1,
                                            Z['getChildByName']('remarks_info')['visible'] = !0,
                                            Z['getChildByName']('remarks_info').text = q;
                                        var r = Z['getChildByName']('collect');
                                        r['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            p['pop_collectinput'].show(m.uuid, m['start_time'], m['end_time']);
                                        }, null, !1),
                                            r['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        u['prototype']['onLoadStateChange'] = function (k, n) {
                            this['current_type'] == k && (this['loading']['visible'] = n);
                        },
                        u['prototype']['onLoadMoreLst'] = function (k, n) {
                            this['current_type'] == k && this['scrollview']['addItem'](n);
                        },
                        u['prototype']['onLoadOver'] = function (k) {
                            if (this['current_type'] == k) {
                                var n = u['paipuLst'][this['current_type']];
                                0 == n['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        u['prototype']['onCollectChange'] = function (k, n) {
                            if (this['current_type'] == p['COLLECT'])
                                n >= 0 && (u['paipuLst'][p['COLLECT']]['removeAt'](n), this['scrollview']['delItem'](n));
                            else
                                for (var Z = u['paipuLst'][this['current_type']]['uuid_list'], V = 0; V < Z['length']; V++)
                                    if (Z[V] == k) {
                                        this['scrollview']['wantToRefreshItem'](V);
                                        break;
                                    }
                            this['label_collect_count'].text = u['collect_lsts']['length']['toString']() + '/' + u['collect_limit']['toString']();
                        },
                        u.Inst = null,
                        u['paipuLst'] = {},
                        u['collect_lsts'] = [],
                        u['record_map'] = {},
                        u['collect_info'] = {},
                        u['collect_limit'] = 20,
                        u;
                }
                    (k['UIBase']);
            k['UI_PaiPu'] = m;
        }
            (uiscript || (uiscript = {}));





        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var k = GameMgr;
            var n = this;
            window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''),
                view['BgmListMgr'].init(),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (k, Z) {
                    k || Z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', k, Z) : n['server_time_delta'] = 1000 * Z['server_time'] - Laya['timer']['currTimer'];
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (k, Z) {
                    k || Z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', k, Z) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](Z)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, Z['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](Z['settings']), Z['settings']['nickname_setting'] && (n['nickname_replace_enable'] = !!Z['settings']['nickname_setting']['enable'], n['nickname_replace_lst'] = Z['settings']['nickname_setting']['nicknames'], n['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = Z['settings']['allow_modify_nickname']);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (k, Z) {
                    k || Z['error'] || (n['client_endpoint'] = Z['client_endpoint']);
                }),
                app['PlayerBehaviorStatistic'].init(),
                this['account_data']['nickname'] && this['fetch_login_info'](),
                uiscript['UI_Info'].Init(),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (k) {
                    app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](k));
                    var Z = k['update'];
                    if (Z) {
                        if (Z['numerical'])
                            for (var p = 0; p < Z['numerical']['length']; p++) {
                                var V = Z['numerical'][p].id,
                                    m = Z['numerical'][p]['final'];
                                switch (V) {
                                    case '100001':
                                        n['account_data']['diamond'] = m;
                                        break;
                                    case '100002':
                                        n['account_data'].gold = m;
                                        break;
                                    case '100099':
                                        n['account_data'].vip = m,
                                            uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                                }
                                (V >= '101001' || '102999' >= V) && (n['account_numerical_resource'][V] = m);
                            }
                        uiscript['UI_Sushe']['on_data_updata'](Z),
                            Z['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](Z['daily_task']),
                            Z['title'] && uiscript['UI_TitleBook']['title_update'](Z['title']),
                            Z['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](Z),
                            (Z['activity_task'] || Z['activity_period_task'] || Z['activity_random_task'] || Z['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](Z),
                            Z['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](Z['activity_flip_task']['progresses']),
                            Z['activity'] && (Z['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](Z['activity']['friend_gift_data']), Z['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](Z['activity']['upgrade_data']), Z['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](Z['activity']['gacha_data']));
                    }
                }, null, !1)),
                app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                    uiscript['UI_AnotherLogin'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                    uiscript['UI_Hanguplogout'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (k) {
                    app.Log.log('收到消息：' + JSON['stringify'](k)),
                        k.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](k['content']);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (k) {
                    uiscript['UI_Recharge']['open_payment'] = !1,
                        uiscript['UI_Recharge']['payment_info'] = '',
                        uiscript['UI_Recharge']['open_wx'] = !0,
                        uiscript['UI_Recharge']['wx_type'] = 0,
                        uiscript['UI_Recharge']['open_alipay'] = !0,
                        uiscript['UI_Recharge']['alipay_type'] = 0,
                        k['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](k['settings']), k['settings']['nickname_setting'] && (n['nickname_replace_enable'] = !!k['settings']['nickname_setting']['enable'], n['nickname_replace_lst'] = k['settings']['nickname_setting']['nicknames'])),
                        uiscript['UI_Change_Nickname']['allow_modify_nickname'] = k['allow_modify_nickname'];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (k) {
                    uiscript['UI_Sushe']['send_gift_limit'] = k['gift_limit'],
                        game['FriendMgr']['friend_max_count'] = k['friend_max_count'],
                        uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = k['zhp_free_refresh_limit'],
                        uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = k['zhp_cost_refresh_limit'],
                        uiscript['UI_PaiPu']['collect_limit'] = k['record_collect_limit'];
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (k) {
                    uiscript['UI_Guajichenfa'].Inst.show(k);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (k) {
                    n['auth_check_id'] = k['check_id'],
                        n['auth_nc_retry_count'] = 0,
                        4 == k.type ? n['showNECaptcha']() : 2 == k.type ? n['checkNc']() : n['checkNvc']();
                })),
                Laya['timer'].loop(360000, this, function () {
                    if (game['LobbyNetMgr'].Inst.isOK) {
                        var k = (Laya['timer']['currTimer'] - n['_last_heatbeat_time']) / 1000;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                            no_operation_counter: k
                        }, function () { }),
                            k >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                    }
                }),
                Laya['timer'].loop(1000, this, function () {
                    var k = Laya['stage']['getMousePoint']();
                    (k.x != n['_pre_mouse_point'].x || k.y != n['_pre_mouse_point'].y) && (n['clientHeatBeat'](), n['_pre_mouse_point'].x = k.x, n['_pre_mouse_point'].y = k.y);
                }),
                Laya['timer'].loop(1000, this, function () {
                    Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
                }),
                'kr' == k['client_type'] && Laya['timer'].loop(3600000, this, function () {
                    n['showKrTip'](!1, null);
                }),
                uiscript['UI_RollNotice'].init();
        }





        // 设置状态
        !function (k) {
            var n = function () {
                function k(n) {
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
                        k.Inst = this,
                        this.me = n,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var Z = 0; 3 > Z; Z++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + Z));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var Z = 0; 3 > Z; Z++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + Z));
                    for (var Z = 0; 2 > Z; Z++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + Z));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                }
                return Object['defineProperty'](k['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    k['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    k['prototype']['showCD'] = function (k, n) {
                        var Z = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](k / 1000),
                            this._add = Math['floor'](n / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var k = Laya['timer']['currTimer'] - Z['_pre_time'];
                                Z['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? Z['_start'] += k : Z['_show']();
                            });
                    },
                    k['prototype']['close'] = function () {
                        this['reset']();
                    },
                    k['prototype']['_show'] = function () {
                        var k = this._fix + this._add - this['timeuse'];
                        if (0 >= k)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (k != this['_pre_sec']) {
                            if (this['_pre_sec'] = k, k > this._add) {
                                for (var n = (k - this._add)['toString'](), Z = 0; Z < this['_img_countdown_c0']['length']; Z++)
                                    this['_img_countdown_c0'][Z]['visible'] = Z < n['length'];
                                if (3 == n['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[2] + '.png')) : 2 == n['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + n[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var p = this._add['toString'](), Z = 0; Z < this['_img_countdown_add']['length']; Z++) {
                                        var V = this['_img_countdown_add'][Z];
                                        Z < p['length'] ? (V['visible'] = !0, V.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + p[Z] + '.png')) : V['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var Z = 0; Z < this['_img_countdown_add']['length']; Z++)
                                        this['_img_countdown_add'][Z]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var n = k['toString'](), Z = 0; Z < this['_img_countdown_c0']['length']; Z++)
                                    this['_img_countdown_c0'][Z]['visible'] = Z < n['length'];
                                3 == n['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[2] + '.png')) : 2 == n['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + n[0] + '.png');
                            }
                            if (k > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var Z = 0; Z < this['_img_countdown_c0']['length']; Z++)
                                    this['_img_countdown_c0'][Z]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                    this['_container_c1']['visible'] = !0;
                                for (var Z = 0; Z < this['_img_countdown_c0']['length']; Z++)
                                    this['_img_countdown_c0'][Z]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                                for (var Z = 0; Z < this['_img_countdown_c1']['length']; Z++)
                                    this['_img_countdown_c1'][Z]['visible'] = this['_img_countdown_c0'][Z]['visible'], this['_img_countdown_c1'][Z].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][Z].skin);
                                u.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    k.Inst = null,
                    k;
            }
                (),
                Z = function () {
                    function k(k) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = k;
                    }
                    return k['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        k['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        k['prototype']['_loop_refresh_delay'] = function () {
                            var k = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var n = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var Z = app['NetAgent']['mj_network_delay'];
                                    n = 300 > Z ? 2000 : 800 > Z ? 2500 + Z : 4000 + 0.5 * Z,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            k['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    n = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), n);
                            }
                        },
                        k['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var k = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > k ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > k ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        k;
                }
                    (),
                p = function () {
                    function k(k, n) {
                        var Z = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = n,
                            this.me = k,
                            this['btn_banemj'] = k['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = k['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = k['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Z['locking'] || (Z['emj_banned'] = !Z['emj_banned'], Z['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (Z['emj_banned'] ? '_on.png' : '.png')), Z['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Z['locking'] || (Z['close'](), u.Inst['btn_seeinfo'](Z['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Z['locking'] || (Z['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](Z['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Z['locking'] || Z['switch']();
                            }, null, !1);
                    }
                    return k['prototype']['reset'] = function (k, n, Z) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = k,
                            this['showemj'] = n,
                            this['showchange'] = Z,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        k['prototype']['onChangeSeat'] = function (k, n, Z) {
                            this['showinfo'] = k,
                                this['showemj'] = n,
                                this['showchange'] = Z,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        k['prototype']['switch'] = function () {
                            var k = this;
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
                                k['locking'] = !1;
                            })));
                        },
                        k['prototype']['close'] = function () {
                            var k = this;
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
                                    k['locking'] = !1,
                                        k['btn_banemj']['visible'] = !1,
                                        k['btn_seeinfo']['visible'] = !1,
                                        k['btn_change']['visible'] = !1;
                                });
                        },
                        k;
                }
                    (),
                V = function () {
                    function k(k) {
                        var n = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = k,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                n['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                n['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function () {
                                n['scrollview']['total_height'] > 0 ? n['scrollbar']['setVal'](n['scrollview'].rate, n['scrollview']['view_height'] / n['scrollview']['total_height']) : n['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return k['prototype']['initRoom'] = function () {
                        // START 
                        //var k = view['DesktopMgr'].Inst['main_role_character_info'],
                        // END
                        var k = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            n = cfg['item_definition']['character'].find(k['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var Z = 0; 9 > Z; Z++)
                            this.emos.push({
                                path: n.emo + '/' + Z + '.png',
                                sub_id: Z,
                                sort: Z
                            });
                        if (k['extra_emoji'])
                            for (var Z = 0; Z < k['extra_emoji']['length']; Z++)
                                this.emos.push({
                                    path: n.emo + '/' + k['extra_emoji'][Z] + '.png',
                                    sub_id: k['extra_emoji'][Z],
                                    sort: k['extra_emoji'][Z] > 12 ? 1000000 - k['extra_emoji'][Z] : k['extra_emoji'][Z]
                                });
                        this.emos = this.emos.sort(function (k, n) {
                            return k.sort - n.sort;
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
                                char_id: k['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        k['prototype']['render_item'] = function (k) {
                            var n = this,
                                Z = k['index'],
                                p = k['container'],
                                V = this.emos[Z],
                                m = p['getChildByName']('btn');
                            m.skin = game['LoadMgr']['getResImageSkin'](V.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](m, !0) : (game['Tools']['setGrayDisable'](m, !1), m['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var k = !1, Z = 0, p = n['emo_infos']['emoji']; Z < p['length']; Z++) {
                                            var m = p[Z];
                                            if (m[0] == V['sub_id']) {
                                                m[0]++,
                                                    k = !0;
                                                break;
                                            }
                                        }
                                        k || n['emo_infos']['emoji'].push([V['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: V['sub_id']
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    n['change_all_gray'](!0),
                                        Laya['timer'].once(5000, n, function () {
                                            n['change_all_gray'](!1);
                                        }),
                                        n['switchShow'](!1);
                                }, null, !1));
                        },
                        k['prototype']['change_all_gray'] = function (k) {
                            this['allgray'] = k,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        k['prototype']['switchShow'] = function (k) {
                            var n = this,
                                Z = 0;
                            Z = k ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, k ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    k ? (n.out['visible'] = !1, n.in['visible'] = !0) : (n.out['visible'] = !0, n.in['visible'] = !1),
                                        Laya['Tween'].to(n.me, {
                                            x: Z
                                        }, k ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](n, function () {
                                            n['btn_chat']['disabled'] = !1,
                                                n['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        k['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var k = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: k,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: u.Inst['min_double_time'],
                            //        g: u.Inst['max_double_time']
                            //    }),
                            //    this['emo_infos']['emoji'] = [];
                            //}
                            //this['emo_log_count']++;
                            // END
                        },
                        k['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        k;
                }
                    (),
                m = function () {
                    function n(n) {
                        this['effect'] = null,
                            this['container_emo'] = n['getChildByName']('chat_bubble'),
                            this.emo = new k['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = n['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return n['prototype'].show = function (k, n) {
                        var Z = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var p = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](k)]['character']['charid'], V = cfg['character']['emoji']['getGroup'](p), m = '', u = 0, L = 0; L < V['length']; L++)
                                if (V[L]['sub_id'] == n) {
                                    2 == V[L].type && (m = V[L].view, u = V[L]['audio']);
                                    break;
                                }
                            this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                m ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + m + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    Z['effect']['destory'](),
                                        Z['effect'] = null;
                                }), u && view['AudioMgr']['PlayAudio'](u)) : (this.emo['setSkin'](p, n), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    Z.emo['clear'](),
                                        Laya['Tween'].to(Z['container_emo'], {
                                            scaleX: 0,
                                            scaleY: 0
                                        }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    Z['container_emo']['visible'] = !1;
                                }));
                        }
                    },
                        n['prototype']['reset'] = function () {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        n;
                }
                    (),
                u = function (u) {
                    function L() {
                        var k = u.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return k['container_doras'] = null,
                            k['doras'] = [],
                            k['label_md5'] = null,
                            k['container_gamemode'] = null,
                            k['label_gamemode'] = null,
                            k['btn_auto_moqie'] = null,
                            k['btn_auto_nofulu'] = null,
                            k['btn_auto_hule'] = null,
                            k['img_zhenting'] = null,
                            k['btn_double_pass'] = null,
                            k['_network_delay'] = null,
                            k['_timecd'] = null,
                            k['_player_infos'] = [],
                            k['_container_fun'] = null,
                            k['_fun_in'] = null,
                            k['_fun_out'] = null,
                            k['showscoredeltaing'] = !1,
                            k['_btn_leave'] = null,
                            k['_btn_fanzhong'] = null,
                            k['_btn_collect'] = null,
                            k['block_emo'] = null,
                            k['head_offset_y'] = 15,
                            k['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            k['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](k, function (n) {
                                k['onGameBroadcast'](n);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](k, function (n) {
                                k['onPlayerConnectionState'](n);
                            })),
                            L.Inst = k,
                            k;
                    }
                    return __extends(L, u),
                        L['prototype']['onCreate'] = function () {
                            var u = this;
                            this['doras'] = new Array();
                            var L = this.me['getChildByName']('container_lefttop'),
                                F = L['getChildByName']('container_doras');
                            this['container_doras'] = F,
                                this['container_gamemode'] = L['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = L['getChildByName']('MD5'),
                                L['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (u['label_md5']['visible'])
                                        Laya['timer']['clearAll'](u['label_md5']), u['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? L['getChildByName']('activitymode')['visible'] = !0 : u['container_doras']['visible'] = !0;
                                    else {
                                        u['label_md5']['visible'] = !0,
                                            view['DesktopMgr'].Inst['sha256'] ? (u['label_md5']['fontSize'] = 20, u['label_md5'].y = 45, u['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (u['label_md5']['fontSize'] = 25, u['label_md5'].y = 51, u['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            L['getChildByName']('activitymode')['visible'] = !1,
                                            u['container_doras']['visible'] = !1;
                                        var k = u;
                                        Laya['timer'].once(5000, u['label_md5'], function () {
                                            k['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? L['getChildByName']('activitymode')['visible'] = !0 : u['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var J = 0; J < F['numChildren']; J++)
                                this['doras'].push(F['getChildAt'](J));
                            for (var J = 0; 4 > J; J++) {
                                var A = this.me['getChildByName']('container_player_' + J),
                                    d = {};
                                d['container'] = A,
                                    d.head = new k['UI_Head'](A['getChildByName']('head'), ''),
                                    d['head_origin_y'] = A['getChildByName']('head').y,
                                    d.name = A['getChildByName']('container_name')['getChildByName']('name'),
                                    d['container_shout'] = A['getChildByName']('container_shout'),
                                    d['container_shout']['visible'] = !1,
                                    d['illust'] = d['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    d['illustrect'] = k['UIRect']['CreateFromSprite'](d['illust']),
                                    d['shout_origin_x'] = d['container_shout'].x,
                                    d['shout_origin_y'] = d['container_shout'].y,
                                    d.emo = new m(A),
                                    d['disconnect'] = A['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    d['disconnect']['visible'] = !1,
                                    d['title'] = new k['UI_PlayerTitle'](A['getChildByName']('title'), ''),
                                    d.que = A['getChildByName']('que'),
                                    d['que_target_pos'] = new Laya['Vector2'](d.que.x, d.que.y),
                                    d['tianming'] = A['getChildByName']('tianming'),
                                    d['tianming']['visible'] = !1,
                                    0 == J ? A['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        u['btn_seeinfo'](0);
                                    }, null, !1) : d['headbtn'] = new p(A['getChildByName']('btn_head'), J),
                                    this['_player_infos'].push(d);
                            }
                            this['_timecd'] = new n(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new V(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var n = 0, Z = 0; Z < view['DesktopMgr'].Inst['player_datas']['length']; Z++)
                                                view['DesktopMgr'].Inst['player_datas'][Z]['account_id'] && n++;
                                            if (1 >= n)
                                                k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](u, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var k = 0, n = 0; n < view['DesktopMgr'].Inst['player_datas']['length']; n++) {
                                                            var Z = view['DesktopMgr'].Inst['player_datas'][n];
                                                            Z && null != Z['account_id'] && 0 != Z['account_id'] && k++;
                                                        }
                                                        1 == k ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var p = !1;
                                                if (k['UI_VoteProgress']['vote_info']) {
                                                    var V = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - k['UI_VoteProgress']['vote_info']['start_time'] - k['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > V && (p = !0);
                                                }
                                                p ? k['UI_VoteProgress'].Inst['enable'] || k['UI_VoteProgress'].Inst.show() : k['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? k['UI_VoteCD'].Inst['enable'] || k['UI_VoteCD'].Inst.show() : k['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), k['UI_Ob_Replay'].Inst['resetRounds'](), k['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                }, null, !1),
                                this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    k['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    k['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (k['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? k['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](u, function () {
                                        k['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : k['UI_Replay'].Inst && k['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var g = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var n = Laya['timer']['currTimer'];
                                    if (g + 300 > n) {
                                        if (k['UI_ChiPengHu'].Inst['enable'])
                                            k['UI_ChiPengHu'].Inst['onDoubleClick'](), u['recordDoubleClickTime'](n - g);
                                        else {
                                            var Z = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            k['UI_LiQiZiMo'].Inst['enable'] && (Z = k['UI_LiQiZiMo'].Inst['onDoubleClick'](Z)),
                                                Z && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && u['recordDoubleClickTime'](n - g);
                                        }
                                        g = 0;
                                    } else
                                        g = n;
                                }
                            }, null, !1),
                                this['_network_delay'] = new Z(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (L['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        L['prototype']['recordDoubleClickTime'] = function (k) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(k, this['min_double_time'])) : k,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(k, this['max_double_time']) : k;
                        },
                        L['prototype']['onGameBroadcast'] = function (k) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](k));
                            var n = view['DesktopMgr'].Inst['seat2LocalPosition'](k.seat),
                                Z = JSON['parse'](k['content']);
                            null != Z.emo && void 0 != Z.emo && (this['onShowEmo'](n, Z.emo), this['showAIEmo']());
                        },
                        L['prototype']['onPlayerConnectionState'] = function (k) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](k));
                            var n = k.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && n < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][n] = k['state']), this['enable']) {
                                var Z = view['DesktopMgr'].Inst['seat2LocalPosition'](n);
                                this['_player_infos'][Z]['disconnect']['visible'] = k['state'] != view['ELink_State']['READY'];
                            }
                        },
                        L['prototype']['_initFunc'] = function () {
                            var k = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var n = this['_fun_out']['getChildByName']('btn_func'),
                                Z = this['_fun_out']['getChildByName']('btn_func2'),
                                p = this['_fun_in_spr']['getChildByName']('btn_func');
                            n['clickHandler'] = Z['clickHandler'] = new Laya['Handler'](this, function () {
                                var V = 0;
                                V = -270,
                                    Laya['Tween'].to(k['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](k, function () {
                                        k['_fun_in']['visible'] = !0,
                                            k['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(k['_container_fun'], {
                                                x: V
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](k, function () {
                                                n['disabled'] = !1,
                                                    Z['disabled'] = !1,
                                                    p['disabled'] = !1,
                                                    k['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    n['disabled'] = !0,
                                    Z['disabled'] = !0,
                                    p['disabled'] = !0;
                            }, null, !1),
                                p['clickHandler'] = new Laya['Handler'](this, function () {
                                    var V = -546;
                                    Laya['Tween'].to(k['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](k, function () {
                                        k['_fun_in']['visible'] = !1,
                                            k['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(k['_container_fun'], {
                                                x: V
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](k, function () {
                                                n['disabled'] = !1,
                                                    Z['disabled'] = !1,
                                                    p['disabled'] = !1,
                                                    k['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        n['disabled'] = !0,
                                        Z['disabled'] = !0,
                                        p['disabled'] = !0;
                                });
                            var V = this['_fun_in']['getChildByName']('btn_autolipai'),
                                m = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                u = this['_fun_out']['getChildByName']('autolipai'),
                                L = Laya['LocalStorage']['getItem']('autolipai'),
                                F = !0;
                            F = L && '' != L ? 'true' == L : !0,
                                this['refreshFuncBtnShow'](V, u, F),
                                V['clickHandler'] = m['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        k['refreshFuncBtnShow'](V, u, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var J = this['_fun_in']['getChildByName']('btn_autohu'),
                                A = this['_fun_out']['getChildByName']('btn_autohu2'),
                                d = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](J, d, !1),
                                J['clickHandler'] = A['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        k['refreshFuncBtnShow'](J, d, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var g = this['_fun_in']['getChildByName']('btn_autonoming'),
                                b = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                l = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](g, l, !1),
                                g['clickHandler'] = b['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        k['refreshFuncBtnShow'](g, l, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var B = this['_fun_in']['getChildByName']('btn_automoqie'),
                                s = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                S = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](B, S, !1),
                                B['clickHandler'] = s['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        k['refreshFuncBtnShow'](B, S, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (u['scale'](0.9, 0.9), d['scale'](0.9, 0.9), l['scale'](0.9, 0.9), S['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (n['visible'] = !1, A['visible'] = !0, m['visible'] = !0, b['visible'] = !0, s['visible'] = !0) : (n['visible'] = !0, A['visible'] = !1, m['visible'] = !1, b['visible'] = !1, s['visible'] = !1);
                        },
                        L['prototype']['noAutoLipai'] = function () {
                            var k = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                k['clickHandler'].run();
                        },
                        L['prototype']['resetFunc'] = function () {
                            var k = Laya['LocalStorage']['getItem']('autolipai'),
                                n = !0;
                            n = k && '' != k ? 'true' == k : !0;
                            var Z = this['_fun_in']['getChildByName']('btn_autolipai'),
                                p = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](Z, p, n),
                                Laya['LocalStorage']['setItem']('autolipai', n ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](n);
                            var V = this['_fun_in']['getChildByName']('btn_autohu'),
                                m = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](V, m, view['DesktopMgr'].Inst['auto_hule']);
                            var u = this['_fun_in']['getChildByName']('btn_autonoming'),
                                L = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](u, L, view['DesktopMgr'].Inst['auto_nofulu']);
                            var F = this['_fun_in']['getChildByName']('btn_automoqie'),
                                J = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](F, J, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var A = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            A['disabled'] = !1,
                                A['disabled'] = !1;
                        },
                        L['prototype']['setDora'] = function (k, n) {
                            if (0 > k || k >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var Z = 'myres2/mjp/' + (n['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_view']) + /ui/;
                            this['doras'][k].skin = game['Tools']['localUISrc'](Z + n['toString'](!1) + '.png');
                        },
                        L['prototype']['initRoom'] = function () {
                            var n = this;
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var Z = {}, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++) {
                                    for (var V = view['DesktopMgr'].Inst['player_datas'][p]['character'], m = V['charid'], u = cfg['item_definition']['character'].find(m).emo, L = 0; 9 > L; L++) {
                                        var F = u + '/' + L['toString']() + '.png';
                                        Z[F] = 1;
                                    }
                                    if (V['extra_emoji'])
                                        for (var L = 0; L < V['extra_emoji']['length']; L++) {
                                            var F = u + '/' + V['extra_emoji'][L]['toString']() + '.png';
                                            Z[F] = 1;
                                        }
                                }
                                var J = [];
                                for (var A in Z)
                                    J.push(A);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](J, Laya['Handler']['create'](this, function () {
                                        n['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else {
                                for (var d = !1, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++) {
                                    var g = view['DesktopMgr'].Inst['player_datas'][p];
                                    if (g && null != g['account_id'] && g['account_id'] == GameMgr.Inst['account_id']) {
                                        d = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (k['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = d;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var b = 0, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++) {
                                    var g = view['DesktopMgr'].Inst['player_datas'][p];
                                    g && null != g['account_id'] && 0 != g['account_id'] && b++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var l = 0, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++) {
                                var g = view['DesktopMgr'].Inst['player_datas'][p];
                                g && null != g['account_id'] && 0 != g['account_id'] && l++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var B = this.me['getChildByName']('container_lefttop');
                            if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                                B['getChildByName']('num_lizhi_0')['visible'] = !1, B['getChildByName']('num_lizhi_1')['visible'] = !1, B['getChildByName']('num_ben_0')['visible'] = !1, B['getChildByName']('num_ben_1')['visible'] = !1, B['getChildByName']('container_doras')['visible'] = !1, B['getChildByName']('gamemode')['visible'] = !1, B['getChildByName']('activitymode')['visible'] = !0, B['getChildByName']('MD5').y = 63, B['getChildByName']('MD5')['width'] = 239, B['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), B['getChildAt'](0)['width'] = 280, B['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (B['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, B['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (B['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), B['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), B['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, B['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (B['getChildByName']('num_lizhi_0')['visible'] = !0, B['getChildByName']('num_lizhi_1')['visible'] = !1, B['getChildByName']('num_ben_0')['visible'] = !0, B['getChildByName']('num_ben_1')['visible'] = !0, B['getChildByName']('container_doras')['visible'] = !0, B['getChildByName']('gamemode')['visible'] = !0, B['getChildByName']('activitymode')['visible'] = !1, B['getChildByName']('MD5').y = 51, B['getChildByName']('MD5')['width'] = 276, B['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), B['getChildAt'](0)['width'] = 313, B['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var s = view['DesktopMgr'].Inst['game_config'],
                                    S = game['Tools']['get_room_desc'](s);
                                this['label_gamemode'].text = S.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = k['UI_Activity_JJC']['win_count']['toString']();
                                    for (var p = 0; 3 > p; p++)
                                        this['container_jjc']['getChildByName'](p['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (k['UI_Activity_JJC']['lose_count'] > p ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            k['UI_Replay'].Inst && (k['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var G = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                U = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (k['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](G, !0), game['Tools']['setGrayDisable'](U, !0)) : (game['Tools']['setGrayDisable'](G, !1), game['Tools']['setGrayDisable'](U, !1), k['UI_Astrology'].Inst.hide());
                            for (var p = 0; 4 > p; p++)
                                this['_player_infos'][p]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][p]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png');
                        },
                        L['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                        },
                        L['prototype']['refreshSeat'] = function (k) {
                            void 0 === k && (k = !1);
                            for (var n = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), Z = 0; 4 > Z; Z++) {
                                var p = view['DesktopMgr'].Inst['localPosition2Seat'](Z),
                                    V = this['_player_infos'][Z];
                                if (0 > p)
                                    V['container']['visible'] = !1;
                                else {
                                    V['container']['visible'] = !0;
                                    var m = view['DesktopMgr'].Inst['getPlayerName'](p);
                                    game['Tools']['SetNickname'](V.name, m),
                                        V.head.id = n[p]['avatar_id'],
                                        V.head['set_head_frame'](n[p]['account_id'], n[p]['avatar_frame']);
                                    var u = (cfg['item_definition'].item.get(n[p]['avatar_frame']), cfg['item_definition'].view.get(n[p]['avatar_frame']));
                                    if (V.head.me.y = u && u['sargs'][0] ? V['head_origin_y'] - Number(u['sargs'][0]) / 100 * this['head_offset_y'] : V['head_origin_y'], V['avatar'] = n[p]['avatar_id'], 0 != Z) {
                                        var L = n[p]['account_id'] && 0 != n[p]['account_id'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'],
                                            F = n[p]['account_id'] && 0 != n[p]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            J = view['DesktopMgr'].Inst.mode != view['EMJMode'].play;
                                        k ? V['headbtn']['onChangeSeat'](L, F, J) : V['headbtn']['reset'](L, F, J);
                                    }
                                    V['title'].id = n[p]['title'] ? game['Tools']['titleLocalization'](n[p]['account_id'], n[p]['title']) : 0;
                                }
                            }
                        },
                        L['prototype']['refreshNames'] = function () {
                            for (var k = 0; 4 > k; k++) {
                                var n = view['DesktopMgr'].Inst['localPosition2Seat'](k),
                                    Z = this['_player_infos'][k];
                                if (0 > n)
                                    Z['container']['visible'] = !1;
                                else {
                                    Z['container']['visible'] = !0;
                                    var p = view['DesktopMgr'].Inst['getPlayerName'](n);
                                    game['Tools']['SetNickname'](Z.name, p);
                                }
                            }
                        },
                        L['prototype']['refreshLinks'] = function () {
                            for (var k = (view['DesktopMgr'].Inst.seat, 0); 4 > k; k++) {
                                var n = view['DesktopMgr'].Inst['localPosition2Seat'](k);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][k]['disconnect']['visible'] = -1 == n || 0 == k ? !1 : view['DesktopMgr']['player_link_state'][n] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][k]['disconnect']['visible'] = -1 == n || 0 == view['DesktopMgr'].Inst['player_datas'][n]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][n] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][k]['disconnect']['visible'] = !1);
                            }
                        },
                        L['prototype']['setBen'] = function (k) {
                            k > 99 && (k = 99);
                            var n = this.me['getChildByName']('container_lefttop'),
                                Z = n['getChildByName']('num_ben_0'),
                                p = n['getChildByName']('num_ben_1');
                            k >= 10 ? (Z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](k / 10)['toString']() + '.png'), p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (k % 10)['toString']() + '.png'), p['visible'] = !0) : (Z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (k % 10)['toString']() + '.png'), p['visible'] = !1);
                        },
                        L['prototype']['setLiqibang'] = function (k, n) {
                            void 0 === n && (n = !0),
                                k > 999 && (k = 999);
                            var Z = this.me['getChildByName']('container_lefttop'),
                                p = Z['getChildByName']('num_lizhi_0'),
                                V = Z['getChildByName']('num_lizhi_1'),
                                m = Z['getChildByName']('num_lizhi_2');
                            k >= 100 ? (m.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (k % 10)['toString']() + '.png'), V.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](k / 10) % 10)['toString']() + '.png'), p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](k / 100)['toString']() + '.png'), V['visible'] = !0, m['visible'] = !0) : k >= 10 ? (V.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (k % 10)['toString']() + '.png'), p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](k / 10)['toString']() + '.png'), V['visible'] = !0, m['visible'] = !1) : (p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + k['toString']() + '.png'), V['visible'] = !1, m['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](k, n);
                        },
                        L['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var k = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /ui/, n = 0; n < this['doras']['length']; n++)
                                this['doras'][n].skin = view['DesktopMgr'].Inst['is_jiuchao_mode']() ? game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png') : game['Tools']['localUISrc'](k + 'back.png');
                            for (var n = 0; 4 > n; n++)
                                this['_player_infos'][n].emo['reset'](), this['_player_infos'][n].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        L['prototype']['showCountDown'] = function (k, n) {
                            this['_timecd']['showCD'](k, n);
                        },
                        L['prototype']['setZhenting'] = function (k) {
                            this['img_zhenting']['visible'] = k;
                        },
                        L['prototype']['shout'] = function (k, n, Z, p) {
                            app.Log.log('shout:' + k + ' type:' + n);
                            try {
                                var V = this['_player_infos'][k],
                                    m = V['container_shout'],
                                    u = m['getChildByName']('img_content'),
                                    L = m['getChildByName']('illust')['getChildByName']('illust'),
                                    F = m['getChildByName']('img_score');
                                if (0 == p)
                                    F['visible'] = !1;
                                else {
                                    F['visible'] = !0;
                                    var J = 0 > p ? 'm' + Math.abs(p) : p;
                                    F.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + J + '.png');
                                }
                                '' == n ? u['visible'] = !1 : (u['visible'] = !0, u.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + n + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (m['getChildByName']('illust')['visible'] = !1, m['getChildAt'](2)['visible'] = !0, m['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](m['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (m['getChildByName']('illust')['visible'] = !0, m['getChildAt'](2)['visible'] = !1, m['getChildAt'](0)['visible'] = !0, L['scaleX'] = 1, game['Tools']['charaPart'](Z['avatar_id'], L, 'half', V['illustrect'], !0, !0));
                                var A = 0,
                                    d = 0;
                                switch (k) {
                                    case 0:
                                        A = -105,
                                            d = 0;
                                        break;
                                    case 1:
                                        A = 500,
                                            d = 0;
                                        break;
                                    case 2:
                                        A = 0,
                                            d = -300;
                                        break;
                                    default:
                                        A = -500,
                                            d = 0;
                                }
                                m['visible'] = !0,
                                    m['alpha'] = 0,
                                    m.x = V['shout_origin_x'] + A,
                                    m.y = V['shout_origin_y'] + d,
                                    Laya['Tween'].to(m, {
                                        alpha: 1,
                                        x: V['shout_origin_x'],
                                        y: V['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(m, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](L.skin),
                                            m['visible'] = !1;
                                    });
                            } catch (g) {
                                var b = {};
                                b['error'] = g['message'],
                                    b['stack'] = g['stack'],
                                    b['method'] = 'shout',
                                    b['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](b);
                            }
                        },
                        L['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        L['prototype']['refreshFuncBtnShow'] = function (k, n, Z) {
                            var p = k['getChildByName']('img_choosed');
                            n['color'] = k['mouseEnabled'] ? Z ? '#3bd647' : '#7992b3' : '#565656',
                                p['visible'] = Z;
                        },
                        L['prototype']['onShowEmo'] = function (k, n) {
                            var Z = this['_player_infos'][k];
                            0 != k && Z['headbtn']['emj_banned'] || Z.emo.show(k, n);
                        },
                        L['prototype']['changeHeadEmo'] = function (k) {
                            {
                                var n = view['DesktopMgr'].Inst['seat2LocalPosition'](k);
                                this['_player_infos'][n];
                            }
                        },
                        L['prototype']['onBtnShowScoreDelta'] = function () {
                            var k = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                k['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        L['prototype']['btn_seeinfo'] = function (n) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                                var Z = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](n)]['account_id'];
                                if (Z) {
                                    var p = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        V = 1,
                                        m = view['DesktopMgr'].Inst['game_config'].meta;
                                    m && m['mode_id'] == game['EMatchMode']['shilian'] && (V = 4),
                                        k['UI_OtherPlayerInfo'].Inst.show(Z, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, p ? 1 : 2, V);
                                }
                            }
                        },
                        L['prototype']['openDora3BeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openDora3BeginShine'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openShilianOpenBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openChuanmaBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openJiuChaoBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openAnPaiBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openZhanxingBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['openTianmingBeginEffect'] = function () {
                            var k = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, k, function () {
                                    k['destory']();
                                });
                        },
                        L['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        L['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (k['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        L['prototype']['showAIEmo'] = function () {
                            for (var k = this, n = function (n) {
                                var p = view['DesktopMgr'].Inst['player_datas'][n];
                                p['account_id'] && 0 != p['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), Z, function () {
                                    k['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](n), Math['floor'](9 * Math['random']()));
                                });
                            }, Z = this, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++)
                                n(p);
                        },
                        L['prototype']['setGapType'] = function (k, n) {
                            void 0 === n && (n = !1);
                            for (var Z = 0; Z < k['length']; Z++) {
                                var p = view['DesktopMgr'].Inst['seat2LocalPosition'](Z);
                                this['_player_infos'][p].que['visible'] = !0,
                                    n && (0 == Z ? (this['_player_infos'][p].que.pos(this['gapStartPosLst'][Z].x + this['selfGapOffsetX'][k[Z]], this['gapStartPosLst'][Z].y), this['_player_infos'][p].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][p].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][p]['que_target_pos'].x,
                                        y: this['_player_infos'][p]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][p].que.pos(this['gapStartPosLst'][Z].x, this['gapStartPosLst'][Z].y), this['_player_infos'][p].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][p].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][p]['que_target_pos'].x,
                                        y: this['_player_infos'][p]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][p].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + k[Z] + '.png');
                            }
                        },
                        L['prototype']['OnNewCard'] = function (k, n) {
                            if (n) {
                                var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, Z, function () {
                                        Z['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function () {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        L['prototype']['ShowSpellCard'] = function (n, Z) {
                            void 0 === Z && (Z = !1),
                                k['UI_FieldSpell'].Inst && !k['UI_FieldSpell'].Inst['enable'] && k['UI_FieldSpell'].Inst.show(n, Z);
                        },
                        L['prototype']['HideSpellCard'] = function () {
                            k['UI_FieldSpell'].Inst && k['UI_FieldSpell'].Inst['close']();
                        },
                        L['prototype']['SetTianMingRate'] = function (k, n, Z) {
                            void 0 === Z && (Z = !1);
                            var p = view['DesktopMgr'].Inst['seat2LocalPosition'](k),
                                V = this['_player_infos'][p]['tianming'];
                            Z && 5 != n && V.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + n + '.png') && Laya['Tween'].to(V, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(V, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                V.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + n + '.png');
                        },
                        L.Inst = null,
                        L;
                }
                    (k['UIBase']);
            k['UI_DesktopInfo'] = u;
        }
            (uiscript || (uiscript = {}));





        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var n = this;
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (Z, p) {
                    Z || p['error'] ? k['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', Z, p) : n['_refreshAnnouncements'](p);
                    if ((V || o['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (k) {
                    for (var Z = GameMgr['inDmm'] ? 'web_dmm' : 'web', p = 0, V = k['update_list']; p < V['length']; p++) {
                        var m = V[p];
                        if (m.lang == GameMgr['client_language'] && m['platform'] == Z) {
                            n['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }



        uiscript.UI_Info._refreshAnnouncements = function (k) {
            // START
            k.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (k['announcements'] && (this['announcements'] = k['announcements']), k.sort && (this['announcement_sort'] = k.sort), k['read_list']) {
                this['read_list'] = [];
                for (var n = 0; n < k['read_list']['length']; n++)
                    this['read_list'].push(k['read_list'][n]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }




        // 加载CG 
        !function (k) {
            var n = function () {
                function n(n, Z) {
                    var p = this;
                    this['cg_id'] = 0,
                        this.me = n,
                        this['father'] = Z;
                    var V = this.me['getChildByName']('btn_detail');
                    V['clickHandler'] = new Laya['Handler'](this, function () {
                        k['UI_Bag'].Inst['locking'] || p['father']['changeLoadingCG'](p['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](V, new Laya['Handler'](this, function (n) {
                            if (!k['UI_Bag'].Inst['locking']) {
                                'down' == n ? Laya['timer'].once(800, p, function () {
                                    k['UI_CG_Yulan'].Inst.show(p['cg_id']);
                                }) : ('over' == n || 'up' == n) && Laya['timer']['clearAll'](p);
                            }
                        })),
                        this['using'] = V['getChildByName']('using'),
                        this.icon = V['getChildByName']('icon'),
                        this.name = V['getChildByName']('name'),
                        this.info = V['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = V['getChildByName']('new');
                }
                return n['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var n = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != k['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, n['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var Z = !this['father']['last_seen_cg_map'][this['cg_id']], p = 0, V = n['unlock_items']; p < V['length']; p++) {
                        var m = V[p];
                        if (m && k['UI_Bag']['get_item_count'](m) > 0) {
                            var u = cfg['item_definition'].item.get(m);
                            if (this.name.text = u['name_' + GameMgr['client_language']], !u['item_expire']) {
                                this.info['visible'] = !1,
                                    Z = -1 != this['father']['new_cg_ids']['indexOf'](m);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + u['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = Z;
                },
                    n['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    n;
            }
                (),
                Z = function () {
                    function Z(k) {
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = k,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                    }
                    return Z['prototype']['have_redpoint'] = function () {
                        // START
                        //if (k['UI_Bag']['new_cg_ids']['length'] > 0)
                        return !0;
                        // END
                        var n = [];
                        if (!this['seen_cg_map']) {
                            var Z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, Z) {
                                Z = game['Tools']['dddsss'](Z);
                                for (var p = Z['split'](','), V = 0; V < p['length']; V++)
                                    this['seen_cg_map'][Number(p[V])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (Z) {
                            Z['unlock_items'][1] && 0 == k['UI_Bag']['get_item_count'](Z['unlock_items'][0]) && k['UI_Bag']['get_item_count'](Z['unlock_items'][1]) > 0 && n.push(Z.id);
                        });
                        for (var m = 0, u = n; m < u['length']; m++) {
                            var L = u[m];
                            if (!this['seen_cg_map'][L])
                                return !0;
                        }
                        return !1;
                    },
                        Z['prototype'].show = function () {
                            var n = this;
                            if (this['new_cg_ids'] = k['UI_Bag']['new_cg_ids'], k['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var Z = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, Z) {
                                    Z = game['Tools']['dddsss'](Z);
                                    for (var p = Z['split'](','), V = 0; V < p['length']; V++)
                                        this['seen_cg_map'][Number(p[V])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var m = '';
                            cfg['item_definition']['loading_image']['forEach'](function (Z) {
                                for (var p = 0, V = Z['unlock_items']; p < V['length']; p++) {
                                    var u = V[p];
                                    if (u && k['UI_Bag']['get_item_count'](u) > 0)
                                        return n['items'].push(Z), n['seen_cg_map'][Z.id] = 1, '' != m && (m += ','), m += Z.id, void 0;
                                }
                            }),
                                this['items'].sort(function (k, n) {
                                    return n.sort - k.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](m)),
                                k['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1;
                        },
                        Z['prototype']['close'] = function () {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && k['UI_Loading']['loadNextCG']();
                        },
                        Z['prototype']['render_item'] = function (k) {
                            var Z = k['index'],
                                p = k['container'],
                                V = k['cache_data'];
                            if (this['items'][Z]) {
                                V.item || (V.item = new n(p, this));
                                var m = V.item;
                                m['cg_id'] = this['items'][Z].id,
                                    m.show();
                            }
                        },
                        Z['prototype']['changeLoadingCG'] = function (n) {
                            this['_changed'] = !0;
                            for (var Z = 0, p = 0, V = 0, m = this['items']; V < m['length']; V++) {
                                var u = m[V];
                                if (u.id == n) {
                                    Z = p;
                                    break;
                                }
                                p++;
                            }
                            var L = k['UI_Loading']['Loading_Images']['indexOf'](n);
                            -1 == L ? k['UI_Loading']['Loading_Images'].push(n) : k['UI_Loading']['Loading_Images']['splice'](L, 1),
                                this['scrollview']['wantToRefreshItem'](Z),
                                this['locking'] = !0,
                                // START
                                MMP.settings.loadingCG = k['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: k['UI_Loading']['Loading_Images']
                            //}, function (n, Z) {
                            //    (n || Z['error']) && k['UIMgr'].Inst['showNetReqError']('setLoadingImage', n, Z);
                            //});
                            // END
                        },
                        Z['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        Z;
                }
                    ();
            k['UI_Bag_PageCG'] = Z;
        }
            (uiscript || (uiscript = {}));


        uiscript.UI_Entrance.prototype._onLoginSuccess = function (n, Z, p) {
            var k = uiscript;
            var V = this;
            if (void 0 === p && (p = !1), app.Log.log('登陆：' + JSON['stringify'](Z)), GameMgr.Inst['account_id'] = Z['account_id'], GameMgr.Inst['account_data'] = Z['account'], k['UI_ShiMingRenZheng']['renzhenged'] = Z['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, Z['account']['platform_diamond'])
                for (var m = Z['account']['platform_diamond'], u = 0; u < m['length']; u++)
                    GameMgr.Inst['account_numerical_resource'][m[u].id] = m[u]['count'];
            if (Z['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = Z['account']['skin_ticket']), Z['account']['platform_skin_ticket'])
                for (var L = Z['account']['platform_skin_ticket'], u = 0; u < L['length']; u++)
                    GameMgr.Inst['account_numerical_resource'][L[u].id] = L[u]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                Z['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = Z['game_info']['location'], GameMgr.Inst['mj_game_token'] = Z['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = Z['game_info']['game_uuid']),
                Z['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : n['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', Z['access_token']), GameMgr.Inst['sociotype'] = n, GameMgr.Inst['access_token'] = Z['access_token']);
            var F = this,
                J = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        k['UI_Loading'].Inst.show('load_lobby'),
                        F['enable'] = !1,
                        F['scene']['close'](),
                        k['UI_Entrance_Mail_Regist'].Inst['close'](),
                        F['login_loading']['close'](),
                        k['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](F, function () {
                            GameMgr.Inst['afterLogin'](),
                                F['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && k['UIMgr'].Inst['ShowPreventAddiction'](),
                                F['destroy'](),
                                F['disposeRes'](),
                                k['UI_Add2Desktop'].Inst && (k['UI_Add2Desktop'].Inst['destroy'](), k['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](F, function (n) {
                            return k['UI_Loading'].Inst['setProgressVal'](0.2 * n);
                        }, null, !1));
                },
                A = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (n, Z) {
                        n ? (app.Log.log('fetchRefundOrder err:' + n), V['showError'](game['Tools']['strOfLocalization'](2061), n), V['showContainerLogin']()) : (k['UI_Refund']['orders'] = Z['orders'], k['UI_Refund']['clear_deadline'] = Z['clear_deadline'], k['UI_Refund']['message'] = Z['message'], J());
                    }) : J();
                });
            // START
            //if (k['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var d = 0, g = GameMgr.Inst['account_data']['loading_image']; d < g['length']; d++) {
            //        var b = g[d];
            //        cfg['item_definition']['loading_image'].get(b) && k['UI_Loading']['Loading_Images'].push(b);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            k['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || Z['account']['phone_verify'] ? A.run() : (k['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, k['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (n, Z) {
                        n || Z['error'] ? V['showError'](n, Z['error']) : 0 == Z['phone_login'] ? k['UI_Create_Phone_Account'].Inst.show(A) : k['UI_Canot_Create_Phone_Account'].Inst.show(A);
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
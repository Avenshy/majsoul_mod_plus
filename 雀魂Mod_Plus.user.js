// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.227
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
! function() {
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
        ! function() {
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
        ! function(Z) {
            var S;
            ! function(Z) {
                Z[Z.none = 0] = 'none',
                    Z[Z['daoju'] = 1] = 'daoju',
                    Z[Z.gift = 2] = 'gift',
                    Z[Z['fudai'] = 3] = 'fudai',
                    Z[Z.view = 5] = 'view';
            }
            (S = Z['EItemCategory'] || (Z['EItemCategory'] = {}));
            var V = function(V) {
                    function o() {
                        var Z = V.call(this, new ui['lobby']['bagUI']()) || this;
                        return Z['container_top'] = null,
                            Z['container_content'] = null,
                            Z['locking'] = !1,
                            Z.tabs = [],
                            Z['page_item'] = null,
                            Z['page_gift'] = null,
                            Z['page_skin'] = null,
                            Z['page_cg'] = null,
                            Z['select_index'] = 0,
                            o.Inst = Z,
                            Z;
                    }
                    return __extends(o, V),
                        o.init = function() {
                            var Z = this;
                            app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(S) {
                                    var V = S['update'];
                                    V && V.bag && (Z['update_data'](V.bag['update_items']), Z['update_daily_gain_data'](V.bag));
                                }, null, !1)),
                                this['fetch']();
                        },
                        o['fetch'] = function() {
                            var S = this;
                            this['_item_map'] = {},
                                this['_daily_gain_record'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function(V, o) {
                                    if (V || o['error'])
                                        Z['UIMgr'].Inst['showNetReqError']('fetchBagInfo', V, o);
                                    else {
                                        app.Log.log('背包信息：' + JSON['stringify'](o));
                                        var y = o.bag;
                                        if (y) {
                                            if (MMP.settings.setItems.setAllItems) {
                                                //设置全部道具
                                                var items = cfg.item_definition.item.map_;
                                                for (var id in items) {
                                                    if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                        for (let item of y["items"]) {
                                                            if (item.item_id == id) {
                                                                cfg.item_definition.item.get(item.item_id);
                                                                S._item_map[item.item_id] = {
                                                                    item_id: item.item_id,
                                                                    count: item.stack,
                                                                    category: items[item.item_id].category
                                                                };
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        cfg.item_definition.item.get(id);
                                                        S._item_map[id] = {
                                                            item_id: id,
                                                            count: 1,
                                                            category: items[id].category
                                                        }; //获取物品列表并添加
                                                    }
                                                }


                                            } else {
                                                if (y['items'])
                                                    for (var G = 0; G < y['items']['length']; G++) {
                                                        var e = y['items'][G]['item_id'],
                                                            x = y['items'][G]['stack'],
                                                            R = cfg['item_definition'].item.get(e);
                                                        R && (S['_item_map'][e] = {
                                                            item_id: e,
                                                            count: x,
                                                            category: R['category']
                                                        }, 1 == R['category'] && 3 == R.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                            item_id: e
                                                        }, function() {}));
                                                    }
                                                if (y['daily_gain_record'])
                                                    for (var s = y['daily_gain_record'], G = 0; G < s['length']; G++) {
                                                        var u = s[G]['limit_source_id'];
                                                        S['_daily_gain_record'][u] = {};
                                                        var n = s[G]['record_time'];
                                                        S['_daily_gain_record'][u]['record_time'] = n;
                                                        var k = s[G]['records'];
                                                        if (k)
                                                            for (var r = 0; r < k['length']; r++)
                                                                S['_daily_gain_record'][u][k[r]['item_id']] = k[r]['count'];
                                                    }
                                            }
                                        }
                                    }
                                });
                        },
                        o['find_item'] = function(Z) {
                            var S = this['_item_map'][Z];
                            return S ? {
                                    item_id: S['item_id'],
                                    category: S['category'],
                                    count: S['count']
                                } :
                                null;
                        },
                        o['get_item_count'] = function(Z) {
                            var S = this['find_item'](Z);
                            if (S)
                                return S['count'];
                            if ('100001' == Z) {
                                for (var V = 0, o = 0, y = GameMgr.Inst['free_diamonds']; o < y['length']; o++) {
                                    var G = y[o];
                                    GameMgr.Inst['account_numerical_resource'][G] && (V += GameMgr.Inst['account_numerical_resource'][G]);
                                }
                                for (var e = 0, x = GameMgr.Inst['paid_diamonds']; e < x['length']; e++) {
                                    var G = x[e];
                                    GameMgr.Inst['account_numerical_resource'][G] && (V += GameMgr.Inst['account_numerical_resource'][G]);
                                }
                                return V;
                            }
                            if ('100004' == Z) {
                                for (var R = 0, s = 0, u = GameMgr.Inst['free_pifuquans']; s < u['length']; s++) {
                                    var G = u[s];
                                    GameMgr.Inst['account_numerical_resource'][G] && (R += GameMgr.Inst['account_numerical_resource'][G]);
                                }
                                for (var n = 0, k = GameMgr.Inst['paid_pifuquans']; n < k['length']; n++) {
                                    var G = k[n];
                                    GameMgr.Inst['account_numerical_resource'][G] && (R += GameMgr.Inst['account_numerical_resource'][G]);
                                }
                                return R;
                            }
                            return '100002' == Z ? GameMgr.Inst['account_data'].gold : 0;
                        },
                        o['find_items_by_category'] = function(Z) {
                            var S = [];
                            for (var V in this['_item_map'])
                                this['_item_map'][V]['category'] == Z && S.push({
                                    item_id: this['_item_map'][V]['item_id'],
                                    category: this['_item_map'][V]['category'],
                                    count: this['_item_map'][V]['count']
                                });
                            return S;
                        },
                        o['update_data'] = function(S) {
                            for (var V = 0; V < S['length']; V++) {
                                var o = S[V]['item_id'],
                                    y = S[V]['stack'];
                                if (y > 0) {
                                    this['_item_map']['hasOwnProperty'](o['toString']()) ? this['_item_map'][o]['count'] = y : this['_item_map'][o] = {
                                        item_id: o,
                                        count: y,
                                        category: cfg['item_definition'].item.get(o)['category']
                                    };
                                    var G = cfg['item_definition'].item.get(o);
                                    1 == G['category'] && 3 == G.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                            item_id: o
                                        }, function() {}),
                                        5 == G['category'] && (this['new_bag_item_ids'].push(o), this['new_zhuangban_item_ids'][o] = 1),
                                        8 != G['category'] || G['item_expire'] || this['new_cg_ids'].push(o);
                                } else if (this['_item_map']['hasOwnProperty'](o['toString']())) {
                                    var e = cfg['item_definition'].item.get(o);
                                    e && 5 == e['category'] && Z['UI_Sushe']['on_view_remove'](o),
                                        this['_item_map'][o] = 0,
                                        delete this['_item_map'][o];
                                }
                            }
                            this.Inst && this.Inst['when_data_change']();
                            for (var V = 0; V < S['length']; V++) {
                                var o = S[V]['item_id'];
                                if (this['_item_listener']['hasOwnProperty'](o['toString']()))
                                    for (var x = this['_item_listener'][o], R = 0; R < x['length']; R++)
                                        x[R].run();
                            }
                            for (var V = 0; V < this['_all_item_listener']['length']; V++)
                                this['_all_item_listener'][V].run();
                        },
                        o['update_daily_gain_data'] = function(Z) {
                            var S = Z['update_daily_gain_record'];
                            if (S)
                                for (var V = 0; V < S['length']; V++) {
                                    var o = S[V]['limit_source_id'];
                                    this['_daily_gain_record'][o] || (this['_daily_gain_record'][o] = {});
                                    var y = S[V]['record_time'];
                                    this['_daily_gain_record'][o]['record_time'] = y;
                                    var G = S[V]['records'];
                                    if (G)
                                        for (var e = 0; e < G['length']; e++)
                                            this['_daily_gain_record'][o][G[e]['item_id']] = G[e]['count'];
                                }
                        },
                        o['get_item_daily_record'] = function(Z, S) {
                            return this['_daily_gain_record'][Z] ? this['_daily_gain_record'][Z]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][Z]['record_time']) ? this['_daily_gain_record'][Z][S] ? this['_daily_gain_record'][Z][S] : 0 : 0 : 0 : 0;
                        },
                        o['add_item_listener'] = function(Z, S) {
                            this['_item_listener']['hasOwnProperty'](Z['toString']()) || (this['_item_listener'][Z] = []),
                                this['_item_listener'][Z].push(S);
                        },
                        o['remove_item_listener'] = function(Z, S) {
                            var V = this['_item_listener'][Z];
                            if (V)
                                for (var o = 0; o < V['length']; o++)
                                    if (V[o] === S) {
                                        V[o] = V[V['length'] - 1],
                                            V.pop();
                                        break;
                                    }
                        },
                        o['add_all_item_listener'] = function(Z) {
                            this['_all_item_listener'].push(Z);
                        },
                        o['remove_all_item_listener'] = function(Z) {
                            for (var S = this['_all_item_listener'], V = 0; V < S['length']; V++)
                                if (S[V] === Z) {
                                    S[V] = S[S['length'] - 1],
                                        S.pop();
                                    break;
                                }
                        },
                        o['removeAllBagNew'] = function() {
                            this['new_bag_item_ids'] = [];
                        },
                        o['removeAllCGNew'] = function() {
                            this['new_cg_ids'] = [];
                        },
                        o['removeZhuangBanNew'] = function(Z) {
                            for (var S = 0, V = Z; S < V['length']; S++) {
                                var o = V[S];
                                delete this['new_zhuangban_item_ids'][o];
                            }
                        },
                        o['prototype']['have_red_point'] = function() {
                            return this['page_cg']['have_redpoint']();
                        },
                        o['prototype']['onCreate'] = function() {
                            var S = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['locking'] || S.hide(Laya['Handler']['create'](S, function() {
                                        return S['closeHandler'] ? (S['closeHandler'].run(), S['closeHandler'] = null, void 0) : (Z['UI_Lobby'].Inst['enable'] = !0, void 0);
                                    }));
                                }, null, !1),
                                this['container_content'] = this.me['getChildByName']('content');
                            for (var V = function(Z) {
                                    o.tabs.push(o['container_content']['getChildByName']('tabs')['getChildByName']('btn' + Z)),
                                        o.tabs[Z]['clickHandler'] = Laya['Handler']['create'](o, function() {
                                            S['select_index'] != Z && S['on_change_tab'](Z);
                                        }, null, !1);
                                }, o = this, y = 0; 5 > y; y++)
                                V(y);
                            this['page_item'] = new Z['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                                this['page_gift'] = new Z['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                                this['page_skin'] = new Z['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                                this['page_cg'] = new Z['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                        },
                        o['prototype'].show = function(S, V) {
                            var o = this;
                            void 0 === S && (S = 0),
                                void 0 === V && (V = null),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this['closeHandler'] = V,
                                Z['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200),
                                Z['UIBase']['anim_alpha_in'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    o['locking'] = !1;
                                }),
                                this['on_change_tab'](S),
                                this['refreshRedpoint'](),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                3 != S && this['page_skin']['when_update_data']();
                        },
                        o['prototype'].hide = function(S) {
                            var V = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 200),
                                Z['UIBase']['anim_alpha_out'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    V['locking'] = !1,
                                        V['enable'] = !1,
                                        S && S.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            this['page_skin']['close'](),
                                this['page_item']['close'](),
                                this['page_gift']['close'](),
                                this['page_cg']['close']();
                        },
                        o['prototype']['on_change_tab'] = function(Z) {
                            this['select_index'] = Z;
                            for (var V = 0; V < this.tabs['length']; V++)
                                this.tabs[V].skin = game['Tools']['localUISrc'](Z == V ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[V]['getChildAt'](0)['color'] = Z == V ? '#d9b263' : '#8cb65f';
                            switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), Z) {
                                case 0:
                                    this['page_item'].show(S['daoju']);
                                    break;
                                case 1:
                                    this['page_gift'].show();
                                    break;
                                case 2:
                                    this['page_item'].show(S.view);
                                    break;
                                case 3:
                                    this['page_skin'].show();
                                    break;
                                case 4:
                                    this['page_cg'].show();
                            }
                        },
                        o['prototype']['when_data_change'] = function() {
                            this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                                this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                        },
                        o['prototype']['on_skin_change'] = function() {
                            this['page_skin']['when_update_data']();
                        },
                        o['prototype']['on_cg_change'] = function() {
                            this['page_cg']['when_update_data']();
                        },
                        o['prototype']['refreshRedpoint'] = function() {
                            this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                        },
                        o['_item_map'] = {},
                        o['_item_listener'] = {},
                        o['_all_item_listener'] = [],
                        o['_daily_gain_record'] = {},
                        o['new_bag_item_ids'] = [],
                        o['new_zhuangban_item_ids'] = {},
                        o['new_cg_ids'] = [],
                        o.Inst = null,
                        o;
                }
                (Z['UIBase']);
            Z['UI_Bag'] = V;
        }
        (uiscript || (uiscript = {}));







        // 修改牌桌上角色
        ! function(Z) {
            var S = function() {
                    function S() {
                        var S = this;
                        this.urls = [],
                            this['link_index'] = -1,
                            this['connect_state'] = Z['EConnectState'].none,
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
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function(Z) {
                                if (MMP.settings.sendGame == true) {
                                    (GM_xmlhttpRequest({
                                        method: 'post',
                                        url: MMP.settings.sendGameURL,
                                        data: JSON.stringify(Z),
                                        onload: function(msg) {
                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(Z));
                                        }
                                    }));
                                }
                                app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](Z)),
                                    S['loaded_player_count'] = Z['ready_id_list']['length'],
                                    S['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](S['loaded_player_count'], S['real_player_count']);
                            }));
                    }
                    return Object['defineProperty'](S, 'Inst', {
                            get: function() {
                                return null == this['_Inst'] ? this['_Inst'] = new S() : this['_Inst'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        S['prototype']['OpenConnect'] = function(S, V, o, y) {
                            var G = this;
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                                Z['Scene_Lobby'].Inst && Z['Scene_Lobby'].Inst['active'] && (Z['Scene_Lobby'].Inst['active'] = !1),
                                Z['Scene_Huiye'].Inst && Z['Scene_Huiye'].Inst['active'] && (Z['Scene_Huiye'].Inst['active'] = !1),
                                this['Close'](),
                                view['BgmListMgr']['stopBgm'](),
                                this['is_ob'] = !1,
                                Laya['timer'].once(500, this, function() {
                                    G.url = '',
                                        G['token'] = S,
                                        G['game_uuid'] = V,
                                        G['server_location'] = o,
                                        GameMgr.Inst['ingame'] = !0,
                                        GameMgr.Inst['mj_server_location'] = o,
                                        GameMgr.Inst['mj_game_token'] = S,
                                        GameMgr.Inst['mj_game_uuid'] = V,
                                        G['playerreconnect'] = y,
                                        G['_setState'](Z['EConnectState']['tryconnect']),
                                        G['load_over'] = !1,
                                        G['loaded_player_count'] = 0,
                                        G['real_player_count'] = 0,
                                        G['lb_index'] = 0,
                                        G['_fetch_gateway'](0);
                                }),
                                Laya['timer'].loop(300000, this, this['reportInfo']);
                        },
                        S['prototype']['reportInfo'] = function() {
                            this['connect_state'] == Z['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                                client_type: 'web',
                                route_type: 'game',
                                route_index: Z['LobbyNetMgr']['root_id_lst'][Z['LobbyNetMgr'].Inst['choosed_index']],
                                route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                                connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                                reconnect_count: this['_report_reconnect_count']
                            });
                        },
                        S['prototype']['Close'] = function() {
                            this['load_over'] = !1,
                                app.Log.log('MJNetMgr close'),
                                this['_setState'](Z['EConnectState'].none),
                                app['NetAgent']['Close2MJ'](),
                                this.url = '',
                                Laya['timer']['clear'](this, this['reportInfo']);
                        },
                        S['prototype']['_OnConnent'] = function(S) {
                            app.Log.log('MJNetMgr _OnConnent event:' + S),
                                S == Laya['Event']['CLOSE'] || S == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == Z['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == Z['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](Z['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](Z['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2008)), Z['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == Z['EConnectState']['reconnecting'] && this['_Reconnect']()) : S == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == Z['EConnectState']['tryconnect'] || this['connect_state'] == Z['EConnectState']['reconnecting']) && ((this['connect_state'] = Z['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](Z['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                        },
                        S['prototype']['_Reconnect'] = function() {
                            var S = this;
                            Z['LobbyNetMgr'].Inst['connect_state'] == Z['EConnectState'].none || Z['LobbyNetMgr'].Inst['connect_state'] == Z['EConnectState']['disconnect'] ? this['_setState'](Z['EConnectState']['disconnect']) : Z['LobbyNetMgr'].Inst['connect_state'] == Z['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](Z['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function() {
                                S['connect_state'] == Z['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + S['reconnect_count']), app['NetAgent']['connect2MJ'](S.url, Laya['Handler']['create'](S, S['_OnConnent'], null, !1), 'local' == S['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                            }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                        },
                        S['prototype']['_try_to_linknext'] = function() {
                            this['link_index']++,
                                this.url = '',
                                app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                                this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? Z['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](Z['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && Z['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                        },
                        S['prototype']['GetAuthData'] = function() {
                            return {
                                account_id: GameMgr.Inst['account_id'],
                                token: this['token'],
                                game_uuid: this['game_uuid'],
                                gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                            };
                        },
                        S['prototype']['_fetch_gateway'] = function(S) {
                            var V = this;
                            if (Z['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= Z['LobbyNetMgr'].Inst.urls['length'])
                                return uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && Z['Scene_MJ'].Inst['ForceOut'](), this['_setState'](Z['EConnectState'].none), void 0;
                            this.urls = [],
                                this['link_index'] = -1,
                                app.Log.log('mj _fetch_gateway retry_count:' + S);
                            var o = function(o) {
                                    var y = JSON['parse'](o);
                                    if (app.Log.log('mj _fetch_gateway func_success data = ' + o), y['maintenance'])
                                        V['_setState'](Z['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && Z['Scene_MJ'].Inst['ForceOut']();
                                    else if (y['servers'] && y['servers']['length'] > 0) {
                                        for (var G = y['servers'], e = Z['Tools']['deal_gateway'](G), x = 0; x < e['length']; x++)
                                            V.urls.push({
                                                name: '___' + x,
                                                url: e[x]
                                            });
                                        V['link_index'] = -1,
                                            V['_try_to_linknext']();
                                    } else
                                        1 > S ? Laya['timer'].once(1000, V, function() {
                                            V['_fetch_gateway'](S + 1);
                                        }) : Z['LobbyNetMgr'].Inst['polling_connect'] ? (V['lb_index']++, V['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](60)), V['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && Z['Scene_MJ'].Inst['ForceOut'](), V['_setState'](Z['EConnectState'].none));
                                },
                                y = function() {
                                    app.Log.log('mj _fetch_gateway func_error'),
                                        1 > S ? Laya['timer'].once(500, V, function() {
                                            V['_fetch_gateway'](S + 1);
                                        }) : Z['LobbyNetMgr'].Inst['polling_connect'] ? (V['lb_index']++, V['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](58)), V['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || Z['Scene_MJ'].Inst['ForceOut'](), V['_setState'](Z['EConnectState'].none));
                                },
                                G = function(Z) {
                                    var S = new Laya['HttpRequest']();
                                    S.once(Laya['Event']['COMPLETE'], V, function(Z) {
                                            o(Z);
                                        }),
                                        S.once(Laya['Event']['ERROR'], V, function() {
                                            y();
                                        });
                                    var G = [];
                                    G.push('If-Modified-Since'),
                                        G.push('0'),
                                        Z += '?service=ws-game-gateway',
                                        Z += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                        Z += '&location=' + V['server_location'],
                                        Z += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                        S.send(Z, '', 'get', 'text', G),
                                        app.Log.log('mj _fetch_gateway func_fetch url = ' + Z);
                                };
                            Z['LobbyNetMgr'].Inst['polling_connect'] ? G(Z['LobbyNetMgr'].Inst.urls[this['lb_index']]) : G(Z['LobbyNetMgr'].Inst['lb_url']);
                        },
                        S['prototype']['_setState'] = function(S) {
                            this['connect_state'] = S,
                                GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (S == Z['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : S == Z['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : S == Z['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : S == Z['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : S == Z['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                        },
                        S['prototype']['_ConnectSuccess'] = function() {
                            var S = this;
                            app.Log.log('MJNetMgr _ConnectSuccess '),
                                this['load_over'] = !1,
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function(V, o) {
                                    if (V || o['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('authGame', V, o), Z['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        app.Log.log('麻将桌验证通过：' + JSON['stringify'](o)),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                        // 强制打开便捷提示
                                        if (MMP.settings.setbianjietishi) {
                                            o['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                        }
                                        // END
                                        // 增加对mahjong-helper的兼容
                                        // 发送游戏对局
                                        if (MMP.settings.sendGame == true) {
                                            GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(o),
                                                onload: function(msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(o));
                                                }
                                            });
                                        }
                                        // END
                                        var y = [],
                                            G = 0;
                                        view['DesktopMgr']['player_link_state'] = o['state_list'];
                                        var e = Z['Tools']['strOfLocalization'](2003),
                                            x = o['game_config'].mode,
                                            R = view['ERuleMode']['Liqi4'];
                                        x.mode < 10 ? (R = view['ERuleMode']['Liqi4'], S['real_player_count'] = 4) : x.mode < 20 && (R = view['ERuleMode']['Liqi3'], S['real_player_count'] = 3);
                                        for (var s = 0; s < S['real_player_count']; s++)
                                            y.push(null);
                                        x['extendinfo'] && (e = Z['Tools']['strOfLocalization'](2004)),
                                            x['detail_rule'] && x['detail_rule']['ai_level'] && (1 === x['detail_rule']['ai_level'] && (e = Z['Tools']['strOfLocalization'](2003)), 2 === x['detail_rule']['ai_level'] && (e = Z['Tools']['strOfLocalization'](2004)));
                                        for (var u = Z['GameUtility']['get_default_ai_skin'](), n = Z['GameUtility']['get_default_ai_character'](), s = 0; s < o['seat_list']['length']; s++) {
                                            var k = o['seat_list'][s];
                                            if (0 == k) {
                                                y[s] = {
                                                    nickname: e,
                                                    avatar_id: u,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: n,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: u,
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
                                                        y[s].avatar_id = skin.id;
                                                        y[s].character.charid = skin.character_id;
                                                        y[s].character.skin = skin.id;
                                                    }
                                                }
                                                if (MMP.settings.showServer == true) {
                                                    y[s].nickname = '[BOT]' + y[s].nickname;
                                                }
                                            } else {
                                                G++;
                                                for (var r = 0; r < o['players']['length']; r++)
                                                    if (o['players'][r]['account_id'] == k) {
                                                        y[s] = o['players'][r];
                                                        //修改牌桌上人物头像及皮肤
                                                        if (y[s].account_id == GameMgr.Inst.account_id) {
                                                            y[s].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                            y[s].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                            y[s].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                            y[s].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                            y[s].title = GameMgr.Inst.account_data.title;
                                                            if (MMP.settings.nickname != '') {
                                                                y[s].nickname = MMP.settings.nickname;
                                                            }
                                                        } else if (MMP.settings.randomPlayerDefSkin && (y[s].avatar_id == 400101 || y[s].avatar_id == 400201)) {
                                                            //玩家如果用了默认皮肤也随机换
                                                            let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                            let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                            let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                            // 修复皮肤错误导致无法进入游戏的bug
                                                            if (skin.id != 400000 && skin.id != 400001) {
                                                                y[s].avatar_id = skin.id;
                                                                y[s].character.charid = skin.character_id;
                                                                y[s].character.skin = skin.id;
                                                            }
                                                        }
                                                        if (MMP.settings.showServer == true) {
                                                            let server = game.Tools.get_zone_id(y[s].account_id);
                                                            if (server == 1) {
                                                                y[s].nickname = '[CN]' + y[s].nickname;
                                                            } else if (server == 2) {
                                                                y[s].nickname = '[JP]' + y[s].nickname;
                                                            } else if (server == 3) {
                                                                y[s].nickname = '[EN]' + y[s].nickname;
                                                            } else {
                                                                y[s].nickname = '[??]' + y[s].nickname;
                                                            }
                                                        }
                                                        // END
                                                        break;
                                                    }
                                            }
                                        }
                                        for (var s = 0; s < S['real_player_count']; s++)
                                            null == y[s] && (y[s] = {
                                                account: 0,
                                                nickname: Z['Tools']['strOfLocalization'](2010),
                                                avatar_id: u,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: n,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: u,
                                                    is_upgraded: !1
                                                }
                                            });
                                        S['loaded_player_count'] = o['ready_id_list']['length'],
                                            S['_AuthSuccess'](y, o['is_game_start'], o['game_config']['toJSON']());
                                    }
                                });
                        },
                        S['prototype']['_AuthSuccess'] = function(S, V, o) {
                            var y = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                    app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                        round_id: view['DesktopMgr'].Inst['round_id'],
                                        step: view['DesktopMgr'].Inst['current_step']
                                    }, function(S, V) {
                                        S || V['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', S, V), Z['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](V)), V['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2011)), Z['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](V['game_restore'])));
                                    });
                            })) : Z['Scene_MJ'].Inst['openMJRoom'](o, S, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](o)), S, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](y, function() {
                                    V ? Laya['timer']['frameOnce'](10, y, function() {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                                round_id: '-1',
                                                step: 1000000
                                            }, function(S, V) {
                                                app.Log.log('syncGame ' + JSON['stringify'](V)),
                                                    S || V['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', S, V), Z['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), y['_PlayerReconnectSuccess'](V));
                                            });
                                    }) : Laya['timer']['frameOnce'](10, y, function() {
                                        app.Log.log('send enterGame'),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function(S, V) {
                                                S || V['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', S, V), Z['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), y['_EnterGame'](V), view['DesktopMgr'].Inst['fetchLinks']());
                                            });
                                    });
                                }));
                            }), Laya['Handler']['create'](this, function(Z) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * Z);
                            }, null, !1));
                        },
                        S['prototype']['_EnterGame'] = function(S) {
                            app.Log.log('正常进入游戏: ' + JSON['stringify'](S)),
                                S['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2011)), Z['Scene_MJ'].Inst['GameEnd']()) : S['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](S['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                        },
                        S['prototype']['_PlayerReconnectSuccess'] = function(S) {
                            app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](S)),
                                S['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2011)), Z['Scene_MJ'].Inst['GameEnd']()) : S['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](S['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](Z['Tools']['strOfLocalization'](2012)), Z['Scene_MJ'].Inst['ForceOut']());
                        },
                        S['prototype']['_SendDebugInfo'] = function() {},
                        S['prototype']['OpenConnectObserve'] = function(S, V) {
                            var o = this;
                            this['is_ob'] = !0,
                                uiscript['UI_Loading'].Inst.show('enter_mj'),
                                this['Close'](),
                                view['AudioMgr']['StopMusic'](),
                                Laya['timer'].once(500, this, function() {
                                    o['server_location'] = V,
                                        o['ob_token'] = S,
                                        o['_setState'](Z['EConnectState']['tryconnect']),
                                        o['lb_index'] = 0,
                                        o['_fetch_gateway'](0);
                                });
                        },
                        S['prototype']['_ConnectSuccessOb'] = function() {
                            var S = this;
                            app.Log.log('MJNetMgr _ConnectSuccessOb '),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                    token: this['ob_token']
                                }, function(V, o) {
                                    V || o['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', V, o), Z['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](o)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function(V, o) {
                                        if (V || o['error'])
                                            uiscript['UIMgr'].Inst['showNetReqError']('startObserve', V, o), Z['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                        else {
                                            var y = o.head,
                                                G = y['game_config'].mode,
                                                e = [],
                                                x = Z['Tools']['strOfLocalization'](2003),
                                                R = view['ERuleMode']['Liqi4'];
                                            G.mode < 10 ? (R = view['ERuleMode']['Liqi4'], S['real_player_count'] = 4) : G.mode < 20 && (R = view['ERuleMode']['Liqi3'], S['real_player_count'] = 3);
                                            for (var s = 0; s < S['real_player_count']; s++)
                                                e.push(null);
                                            G['extendinfo'] && (x = Z['Tools']['strOfLocalization'](2004)),
                                                G['detail_rule'] && G['detail_rule']['ai_level'] && (1 === G['detail_rule']['ai_level'] && (x = Z['Tools']['strOfLocalization'](2003)), 2 === G['detail_rule']['ai_level'] && (x = Z['Tools']['strOfLocalization'](2004)));
                                            for (var u = Z['GameUtility']['get_default_ai_skin'](), n = Z['GameUtility']['get_default_ai_character'](), s = 0; s < y['seat_list']['length']; s++) {
                                                var k = y['seat_list'][s];
                                                if (0 == k)
                                                    e[s] = {
                                                        nickname: x,
                                                        avatar_id: u,
                                                        level: {
                                                            id: '10101'
                                                        },
                                                        level3: {
                                                            id: '20101'
                                                        },
                                                        character: {
                                                            charid: n,
                                                            level: 0,
                                                            exp: 0,
                                                            views: [],
                                                            skin: u,
                                                            is_upgraded: !1
                                                        }
                                                    };
                                                else
                                                    for (var r = 0; r < y['players']['length']; r++)
                                                        if (y['players'][r]['account_id'] == k) {
                                                            e[s] = y['players'][r];
                                                            break;
                                                        }
                                            }
                                            for (var s = 0; s < S['real_player_count']; s++)
                                                null == e[s] && (e[s] = {
                                                    account: 0,
                                                    nickname: Z['Tools']['strOfLocalization'](2010),
                                                    avatar_id: u,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: n,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: u,
                                                        is_upgraded: !1
                                                    }
                                                });
                                            S['_StartObSuccuess'](e, o['passed'], y['game_config']['toJSON'](), y['start_time']);
                                        }
                                    }));
                                });
                        },
                        S['prototype']['_StartObSuccuess'] = function(S, V, o, y) {
                            var G = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](y, V);
                            })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), Z['Scene_MJ'].Inst['openMJRoom'](o, S, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](o)), S, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](G, function() {
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, G, function() {
                                            GameMgr.Inst['EnterMJ'](),
                                                uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](y, V);
                                        });
                                }));
                            }), Laya['Handler']['create'](this, function(Z) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * Z);
                            }, null, !1)));
                        },
                        S['_Inst'] = null,
                        S;
                }
                ();
            Z['MJNetMgr'] = S;
        }
        (game || (game = {}));






        // 读取战绩
        ! function(Z) {
            var S = function(S) {
                    function V() {
                        var Z = S.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                        return Z['account_id'] = 0,
                            Z['origin_x'] = 0,
                            Z['origin_y'] = 0,
                            Z.root = null,
                            Z['title'] = null,
                            Z['level'] = null,
                            Z['btn_addfriend'] = null,
                            Z['btn_report'] = null,
                            Z['illust'] = null,
                            Z.name = null,
                            Z['detail_data'] = null,
                            Z['achievement_data'] = null,
                            Z['locking'] = !1,
                            Z['tab_info4'] = null,
                            Z['tab_info3'] = null,
                            Z['tab_note'] = null,
                            Z['tab_img_dark'] = '',
                            Z['tab_img_chosen'] = '',
                            Z['player_data'] = null,
                            Z['tab_index'] = 1,
                            Z['game_category'] = 1,
                            Z['game_type'] = 1,
                            V.Inst = Z,
                            Z;
                    }
                    return __extends(V, S),
                        V['prototype']['onCreate'] = function() {
                            var S = this;
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                                this.root = this.me['getChildByName']('root'),
                                this['origin_x'] = this.root.x,
                                this['origin_y'] = this.root.y,
                                this['container_info'] = this.root['getChildByName']('container_info'),
                                this['title'] = new Z['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                                this.name = this['container_info']['getChildByName']('name'),
                                this['level'] = new Z['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                                this['detail_data'] = new Z['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                                this['achievement_data'] = new Z['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                                this['illust'] = new Z['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                                this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                                this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['btn_addfriend']['visible'] = !1,
                                        S['btn_report'].x = 343,
                                        app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                            target_id: S['account_id']
                                        }, function() {});
                                }, null, !1),
                                this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                                this['btn_report']['clickHandler'] = new Laya['Handler'](this, function() {
                                    Z['UI_Report_Nickname'].Inst.show(S['account_id']);
                                }),
                                this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['locking'] || S['close']();
                                }, null, !1),
                                this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['close']();
                                }, null, !1),
                                this.note = new Z['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                                this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                                this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['locking'] || 1 != S['tab_index'] && S['changeMJCategory'](1);
                                }, null, !1),
                                this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                                this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['locking'] || 2 != S['tab_index'] && S['changeMJCategory'](2);
                                }, null, !1),
                                this['tab_note'] = this.root['getChildByName']('tab_note'),
                                this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? Z['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : S['container_info']['visible'] && (S['container_info']['visible'] = !1, S['tab_info4'].skin = S['tab_img_dark'], S['tab_info3'].skin = S['tab_img_dark'], S['tab_note'].skin = S['tab_img_chosen'], S['tab_index'] = 3, S.note.show()));
                                }, null, !1),
                                this['locking'] = !1;
                        },
                        V['prototype'].show = function(S, V, o, y) {
                            var G = this;
                            void 0 === V && (V = 1),
                                void 0 === o && (o = 2),
                                void 0 === y && (y = 1),
                                GameMgr.Inst['BehavioralStatistics'](14),
                                this['account_id'] = S,
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this.root.y = this['origin_y'],
                                this['player_data'] = null,
                                Z['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    G['locking'] = !1;
                                })),
                                this['detail_data']['reset'](),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                    account_id: S
                                }, function(V, o) {
                                    V || o['error'] ? Z['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', V, o) : Z['UI_Shilian']['now_season_info'] && 1001 == Z['UI_Shilian']['now_season_info']['season_id'] && 3 != Z['UI_Shilian']['get_cur_season_state']() ? (G['detail_data']['setData'](o), G['changeMJCategory'](G['tab_index'], G['game_category'], G['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                        account_id: S
                                    }, function(S, V) {
                                        S || V['error'] ? Z['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', S, V) : (o['season_info'] = V['season_info'], G['detail_data']['setData'](o), G['changeMJCategory'](G['tab_index'], G['game_category'], G['game_type']));
                                    });
                                }),
                                this.note['init_data'](S),
                                this['refreshBaseInfo'](),
                                this['btn_report']['visible'] = S != GameMgr.Inst['account_id'],
                                this['tab_index'] = V,
                                this['game_category'] = o,
                                this['game_type'] = y,
                                this['container_info']['visible'] = !0,
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        V['prototype']['refreshBaseInfo'] = function() {
                            var S = this;
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
                                }, function(V, o) {
                                    if (V || o['error'])
                                        Z['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', V, o);
                                    else {
                                        var y = o['account'];
                                        //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                        if (y.account_id == GameMgr.Inst.account_id) {
                                            y.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                y.title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                y.nickname = MMP.settings.nickname;
                                            }
                                        }
                                        //end
                                        S['player_data'] = y,
                                            game['Tools']['SetNickname'](S.name, y),
                                            S['title'].id = game['Tools']['titleLocalization'](y['account_id'], y['title']),
                                            S['level'].id = y['level'].id,
                                            S['level'].id = S['player_data'][1 == S['tab_index'] ? 'level' : 'level3'].id,
                                            S['level'].exp = S['player_data'][1 == S['tab_index'] ? 'level' : 'level3']['score'],
                                            S['illust'].me['visible'] = !0,
                                            S['account_id'] == GameMgr.Inst['account_id'] ? S['illust']['setSkin'](y['avatar_id'], 'waitingroom') : S['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](y['avatar_id']), 'waitingroom'),
                                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], S['account_id']) && S['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(S['account_id']) ? (S['btn_addfriend']['visible'] = !0, S['btn_report'].x = 520) : (S['btn_addfriend']['visible'] = !1, S['btn_report'].x = 343),
                                            S.note.sign['setSign'](y['signature']),
                                            S['achievement_data'].show(!1, y['achievement_count']);
                                    }
                                });
                        },
                        V['prototype']['changeMJCategory'] = function(Z, S, V) {
                            void 0 === S && (S = 2),
                                void 0 === V && (V = 1),
                                this['tab_index'] = Z,
                                this['container_info']['visible'] = !0,
                                this['detail_data']['changeMJCategory'](Z, S, V),
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        V['prototype']['close'] = function() {
                            var S = this;
                            this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), Z['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                S['locking'] = !1,
                                    S['enable'] = !1;
                            }))));
                        },
                        V['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                        },
                        V['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                                this['detail_data']['close'](),
                                this['illust']['clear'](),
                                Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                        },
                        V.Inst = null,
                        V;
                }
                (Z['UIBase']);
            Z['UI_OtherPlayerInfo'] = S;
        }
        (uiscript || (uiscript = {}));






        // 宿舍相关
        ! function(Z) {
            var S = function() {
                    function S(S, o) {
                        var y = this;
                        this['_scale'] = 1,
                            this['during_move'] = !1,
                            this['mouse_start_x'] = 0,
                            this['mouse_start_y'] = 0,
                            this.me = S,
                            this['container_illust'] = o,
                            this['illust'] = this['container_illust']['getChildByName']('illust'),
                            this['container_move'] = S['getChildByName']('move'),
                            this['container_move'].on('mousedown', this, function() {
                                y['during_move'] = !0,
                                    y['mouse_start_x'] = y['container_move']['mouseX'],
                                    y['mouse_start_y'] = y['container_move']['mouseY'];
                            }),
                            this['container_move'].on('mousemove', this, function() {
                                y['during_move'] && (y.move(y['container_move']['mouseX'] - y['mouse_start_x'], y['container_move']['mouseY'] - y['mouse_start_y']), y['mouse_start_x'] = y['container_move']['mouseX'], y['mouse_start_y'] = y['container_move']['mouseY']);
                            }),
                            this['container_move'].on('mouseup', this, function() {
                                y['during_move'] = !1;
                            }),
                            this['container_move'].on('mouseout', this, function() {
                                y['during_move'] = !1;
                            }),
                            this['btn_close'] = S['getChildByName']('btn_close'),
                            this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y['locking'] || y['close']();
                            }, null, !1),
                            this['scrollbar'] = S['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                            this['scrollbar'].init(new Laya['Handler'](this, function(Z) {
                                y['_scale'] = 1 * (1 - Z) + 0.5,
                                    y['illust']['scaleX'] = y['_scale'],
                                    y['illust']['scaleY'] = y['_scale'],
                                    y['scrollbar']['setVal'](Z, 0);
                            })),
                            this['dongtai_kaiguan'] = new Z['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                V.Inst['illust']['resetSkin']();
                            }), new Laya['Handler'](this, function(Z) {
                                V.Inst['illust']['playAnim'](Z);
                            })),
                            this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                    }
                    return Object['defineProperty'](S['prototype'], 'scale', {
                            get: function() {
                                return this['_scale'];
                            },
                            set: function(Z) {
                                this['_scale'] = Z,
                                    this['scrollbar']['setVal'](1 - (Z - 0.5) / 1, 0);
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        S['prototype'].show = function(S) {
                            var o = this;
                            this['locking'] = !0,
                                this['when_close'] = S,
                                this['illust_start_x'] = this['illust'].x,
                                this['illust_start_y'] = this['illust'].y,
                                this['illust_center_x'] = this['illust'].x + 984 - 446,
                                this['illust_center_y'] = this['illust'].y + 11 - 84,
                                this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                                this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                                this['container_illust']['getChildByName']('btn')['visible'] = !1,
                                V.Inst['stopsay'](),
                                this['scale'] = 1,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_center_x'],
                                    y: this['illust_center_y']
                                }, 200),
                                Z['UIBase']['anim_pop_out'](this['btn_close'], null),
                                this['during_move'] = !1,
                                Laya['timer'].once(250, this, function() {
                                    o['locking'] = !1;
                                }),
                                this.me['visible'] = !0,
                                this['dongtai_kaiguan']['refresh'](V.Inst['illust']['skin_id']);
                        },
                        S['prototype']['close'] = function() {
                            var S = this;
                            this['locking'] = !0,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                                this['container_illust']['getChildByName']('btn')['visible'] = !0,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_start_x'],
                                    y: this['illust_start_y'],
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200),
                                Z['UIBase']['anim_pop_hide'](this['btn_close'], null),
                                Laya['timer'].once(250, this, function() {
                                    S['locking'] = !1,
                                        S.me['visible'] = !1,
                                        S['when_close'].run();
                                });
                        },
                        S['prototype'].move = function(Z, S) {
                            var V = this['illust'].x + Z,
                                o = this['illust'].y + S;
                            V < this['illust_center_x'] - 600 ? V = this['illust_center_x'] - 600 : V > this['illust_center_x'] + 600 && (V = this['illust_center_x'] + 600),
                                o < this['illust_center_y'] - 1200 ? o = this['illust_center_y'] - 1200 : o > this['illust_center_y'] + 800 && (o = this['illust_center_y'] + 800),
                                this['illust'].x = V,
                                this['illust'].y = o;
                        },
                        S;
                }
                (),
                V = function(V) {
                    function o() {
                        var Z = V.call(this, new ui['lobby']['susheUI']()) || this;
                        return Z['contianer_illust'] = null,
                            Z['illust'] = null,
                            Z['illust_rect'] = null,
                            Z['container_name'] = null,
                            Z['label_name'] = null,
                            Z['label_cv'] = null,
                            Z['label_cv_title'] = null,
                            Z['container_page'] = null,
                            Z['container_look_illust'] = null,
                            Z['page_select_character'] = null,
                            Z['page_visit_character'] = null,
                            Z['origin_illust_x'] = 0,
                            Z['chat_id'] = 0,
                            Z['container_chat'] = null,
                            Z['_select_index'] = 0,
                            Z['sound_channel'] = null,
                            Z['chat_block'] = null,
                            Z['illust_showing'] = !0,
                            o.Inst = Z,
                            Z;
                    }
                    return __extends(o, V),
                        o['onMainSkinChange'] = function() {
                            var Z = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            Z && Z['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](Z.path) + '/spine');
                        },
                        o['randomDesktopID'] = function() {
                            var S = Z['UI_Sushe']['commonViewList'][Z['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), S)
                                for (var V = 0; V < S['length']; V++)
                                    S[V].slot == game['EView'].mjp ? this['now_mjp_id'] = S[V].type ? S[V]['item_id_list'][Math['floor'](Math['random']() * S[V]['item_id_list']['length'])] : S[V]['item_id'] : S[V].slot == game['EView']['desktop'] && (this['now_desktop_id'] = S[V].type ? S[V]['item_id_list'][Math['floor'](Math['random']() * S[V]['item_id_list']['length'])] : S[V]['item_id']);
                        },
                        o.init = function(S) {
                            var V = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function(y, G) {
                                    if (y || G['error'])
                                        Z['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', y, G);
                                    else {
                                        if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](G)), G = JSON['parse'](JSON['stringify'](G)), G['main_character_id'] && G['characters']) {
                                            // if (V['characters'] = [], G['characters'])
                                            //     for (var e = 0; e < G['characters']['length']; e++)
                                            //         V['characters'].push(G['characters'][e]);
                                            // if (V['skin_map'] = {}, G['skins'])
                                            //     for (var e = 0; e < G['skins']['length']; e++)
                                            //         V['skin_map'][G['skins'][e]] = 1;
                                            // V['main_character_id'] = G['main_character_id'];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            fake_data.char_id = G.main_character_id;
                                            for (let i = 0; i < G.characters.length; i++) {
                                                if (G.characters[i].charid == G.main_character_id) {
                                                    if (G.characters[i].extra_emoji !== undefined) {
                                                        fake_data.emoji = G.characters[i].extra_emoji;
                                                    } else {
                                                        fake_data.emoji = [];
                                                    }
                                                    fake_data.skin = G.skins[i];
                                                    fake_data.exp = G.characters[i].exp;
                                                    fake_data.level = G.characters[i].level;
                                                    fake_data.is_upgraded = G.characters[i].is_upgraded;
                                                    break;
                                                }
                                            }
                                            V.characters = [];

                                            for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                let id = 200000 + j;
                                                let skin = 400001 + j * 100;
                                                let emoji = [];
                                                cfg.character.emoji.getGroup(id).forEach((element) => {
                                                    emoji.push(element.sub_id);
                                                });
                                                V.characters.push({
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
                                            V.main_character_id = MMP.settings.character;
                                            GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                            uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                            V.star_chars = MMP.settings.star_chars;
                                            G.character_sort = MMP.settings.star_chars;
                                            // END
                                        } else
                                            V['characters'] = [], V['characters'].push({
                                                charid: '200001',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400101',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), V['characters'].push({
                                                charid: '200002',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400201',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), V['skin_map']['400101'] = 1, V['skin_map']['400201'] = 1, V['main_character_id'] = '200001';
                                        if (V['send_gift_count'] = 0, V['send_gift_limit'] = 0, G['send_gift_count'] && (V['send_gift_count'] = G['send_gift_count']), G['send_gift_limit'] && (V['send_gift_limit'] = G['send_gift_limit']), G['finished_endings'])
                                            for (var e = 0; e < G['finished_endings']['length']; e++)
                                                V['finished_endings_map'][G['finished_endings'][e]] = 1;
                                        if (G['rewarded_endings'])
                                            for (var e = 0; e < G['rewarded_endings']['length']; e++)
                                                V['rewarded_endings_map'][G['rewarded_endings'][e]] = 1;
                                        if (V['star_chars'] = [], G['character_sort'] && (V['star_chars'] = G['character_sort']), o['hidden_characters_map'] = {}, G['hidden_characters'])
                                            for (var x = 0, R = G['hidden_characters']; x < R['length']; x++) {
                                                var s = R[x];
                                                o['hidden_characters_map'][s] = 1;
                                            }
                                        S.run();
                                    }
                                }),
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (S, o) {
                                //     if (S || o['error'])
                                //         Z['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', S, o);
                                //     else {
                                //         V['using_commonview_index'] = o.use,
                                //         V['commonViewList'] = [[], [], [], [], [], [], [], []];
                                //         var y = o['views'];
                                //         if (y)
                                //             for (var G = 0; G < y['length']; G++) {
                                //                 var e = y[G]['values'];
                                //                 e && (V['commonViewList'][y[G]['index']] = e);
                                //             }
                                //V['randomDesktopID'](),
                                V.commonViewList = MMP.settings.commonViewList;
                            V.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view'](),
                                GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                            //     }
                            // });
                        },
                        o['on_data_updata'] = function(S) {
                            if (S['character']) {
                                var V = JSON['parse'](JSON['stringify'](S['character']));
                                if (V['characters'])
                                    for (var o = V['characters'], y = 0; y < o['length']; y++) {
                                        for (var G = !1, e = 0; e < this['characters']['length']; e++)
                                            if (this['characters'][e]['charid'] == o[y]['charid']) {
                                                this['characters'][e] = o[y],
                                                    Z['UI_Sushe_Visit'].Inst && Z['UI_Sushe_Visit'].Inst['chara_info'] && Z['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][e]['charid'] && (Z['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][e]),
                                                    G = !0;
                                                break;
                                            }
                                        G || this['characters'].push(o[y]);
                                    }
                                if (V['skins']) {
                                    for (var x = V['skins'], y = 0; y < x['length']; y++)
                                        this['skin_map'][x[y]] = 1;
                                    Z['UI_Bag'].Inst['on_skin_change']();
                                }
                                if (V['finished_endings']) {
                                    for (var R = V['finished_endings'], y = 0; y < R['length']; y++)
                                        this['finished_endings_map'][R[y]] = 1;
                                    Z['UI_Sushe_Visit'].Inst;
                                }
                                if (V['rewarded_endings']) {
                                    for (var R = V['rewarded_endings'], y = 0; y < R['length']; y++)
                                        this['rewarded_endings_map'][R[y]] = 1;
                                    Z['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        o['chara_owned'] = function(Z) {
                            for (var S = 0; S < this['characters']['length']; S++)
                                if (this['characters'][S]['charid'] == Z)
                                    return !0;
                            return !1;
                        },
                        o['skin_owned'] = function(Z) {
                            return this['skin_map']['hasOwnProperty'](Z['toString']());
                        },
                        o['add_skin'] = function(Z) {
                            this['skin_map'][Z] = 1;
                        },
                        Object['defineProperty'](o, 'main_chara_info', {
                            get: function() {
                                for (var Z = 0; Z < this['characters']['length']; Z++)
                                    if (this['characters'][Z]['charid'] == this['main_character_id'])
                                        return this['characters'][Z];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        o['on_view_remove'] = function(Z) {
                            for (var S = 0; S < this['commonViewList']['length']; S++)
                                for (var V = this['commonViewList'][S], o = 0; o < V['length']; o++)
                                    if (V[o]['item_id'] == Z && (V[o]['item_id'] = game['GameUtility']['get_view_default_item_id'](V[o].slot)), V[o]['item_id_list']) {
                                        for (var y = 0; y < V[o]['item_id_list']['length']; y++)
                                            if (V[o]['item_id_list'][y] == Z) {
                                                V[o]['item_id_list']['splice'](y, 1);
                                                break;
                                            }
                                        0 == V[o]['item_id_list']['length'] && (V[o].type = 0);
                                    }
                            var G = cfg['item_definition'].item.get(Z);
                            G.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == Z && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        o['add_finish_ending'] = function(Z) {
                            this['finished_endings_map'][Z] = 1;
                        },
                        o['add_reward_ending'] = function(Z) {
                            this['rewarded_endings_map'][Z] = 1;
                        },
                        o['check_all_char_repoint'] = function() {
                            for (var Z = 0; Z < o['characters']['length']; Z++)
                                if (this['check_char_redpoint'](o['characters'][Z]))
                                    return !0;
                            return !1;
                        },
                        o['check_char_redpoint'] = function(Z) {
                            // 去除小红点
                            // if (o['hidden_characters_map'][Z['charid']])
                            return !1;
                            //END
                            var S = cfg.spot.spot['getGroup'](Z['charid']);
                            if (S)
                                for (var V = 0; V < S['length']; V++) {
                                    var y = S[V];
                                    if (!(y['is_married'] && !Z['is_upgraded'] || !y['is_married'] && Z['level'] < y['level_limit']) && 2 == y.type) {
                                        for (var G = !0, e = 0; e < y['jieju']['length']; e++)
                                            if (y['jieju'][e] && o['finished_endings_map'][y['jieju'][e]]) {
                                                if (!o['rewarded_endings_map'][y['jieju'][e]])
                                                    return !0;
                                                G = !1;
                                            }
                                        if (G)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        o['is_char_star'] = function(Z) {
                            return -1 != this['star_chars']['indexOf'](Z);
                        },
                        o['change_char_star'] = function(Z) {
                            var S = this['star_chars']['indexOf'](Z); -
                            1 != S ? this['star_chars']['splice'](S, 1) : this['star_chars'].push(Z)
                                // 屏蔽网络请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                                //     sort: this['star_chars']
                                // }, function () {});
                                // END
                        },
                        Object['defineProperty'](o['prototype'], 'select_index', {
                            get: function() {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        o['prototype']['reset_select_index'] = function() {
                            this['_select_index'] = -1;
                        },
                        o['prototype']['onCreate'] = function() {
                            var V = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new Z['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust_rect'] = Z['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new Z['UI_Character_Chat'](this['container_chat']),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!V['page_visit_character'].me['visible'] || !V['page_visit_character']['cannot_click_say'])
                                        if (V['illust']['onClick'](), V['sound_channel'])
                                            V['stopsay']();
                                        else {
                                            if (!V['illust_showing'])
                                                return;
                                            V.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new Z['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new Z['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new S(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        o['prototype'].show = function(Z) {
                            GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var S = 0, V = 0; V < o['characters']['length']; V++)
                                if (o['characters'][V]['charid'] == o['main_character_id']) {
                                    S = V;
                                    break;
                                }
                            0 == Z ? (this['change_select'](S), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        o['prototype']['starup_back'] = function() {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](o['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        o['prototype']['spot_back'] = function() {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(o['characters'][this['_select_index']], 2);
                        },
                        o['prototype']['go2Lobby'] = function() {
                            this['close'](Laya['Handler']['create'](this, function() {
                                Z['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        o['prototype']['close'] = function(S) {
                            var V = this;
                            this['illust_showing'] && Z['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                    x: -30
                                }, 150, 0),
                                Laya['timer'].once(150, this, function() {
                                    V['enable'] = !1,
                                        S && S.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        o['prototype']['hide_illust'] = function() {
                            var S = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, Z['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                S['contianer_illust']['visible'] = !1;
                            })));
                        },
                        o['prototype']['open_illust'] = function() {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, Z['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var S = 0, V = 0; V < o['characters']['length']; V++)
                                        if (o['characters'][V]['charid'] == o['main_character_id']) {
                                            S = V;
                                            break;
                                        }
                                    this['change_select'](S);
                                }
                        },
                        o['prototype']['show_page_select'] = function() {
                            this['page_select_character'].show(0);
                        },
                        o['prototype']['show_page_visit'] = function(Z) {
                            void 0 === Z && (Z = 0),
                                this['page_visit_character'].show(o['characters'][this['_select_index']], Z);
                        },
                        o['prototype']['change_select'] = function(S) {
                            this['_select_index'] = S,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var V = o['characters'][S],
                                y = cfg['item_definition']['character'].get(V['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != o['chs_fengyu_name_lst']['indexOf'](V['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != o['chs_fengyu_cv_lst']['indexOf'](V['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = y['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = y['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV';
                                var G = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : G.test(y['name_' + GameMgr['client_language']]) ? -15 : 0,
                                    this['label_cv']['leading'] = G.test(this['label_cv'].text) ? -7 : 0;
                            } else
                                this['label_name'].text = y['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + y['desc_cv_' + GameMgr['client_language']];
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var e = new Z['UIRect']();
                            e.x = this['illust_rect'].x,
                                e.y = this['illust_rect'].y,
                                e['width'] = this['illust_rect']['width'],
                                e['height'] = this['illust_rect']['height'],
                                '405503' == V.skin ? e.y -= 70 : '403303' == V.skin ? e.y += 117 : '407002' == V.skin && (e.y += 50),
                                this['illust']['setRect'](e),
                                this['illust']['setSkin'](V.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                Z['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var x = cfg['item_definition'].skin.get(V.skin);
                            x['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        o['prototype']['onChangeSkin'] = function(Z) {
                            o['characters'][this['_select_index']].skin = Z,
                                this['change_select'](this['_select_index']),
                                o['characters'][this['_select_index']]['charid'] == o['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = Z, o['onMainSkinChange']())
                                // 屏蔽换肤请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //     character_id: o['characters'][this['_select_index']]['charid'],
                                //     skin: Z
                                // }, function () {});
                                // 保存皮肤
                        },
                        o['prototype'].say = function(Z) {
                            var S = this,
                                V = o['characters'][this['_select_index']];
                            this['chat_id']++;
                            var y = this['chat_id'],
                                G = view['AudioMgr']['PlayCharactorSound'](V, Z, Laya['Handler']['create'](this, function() {
                                    Laya['timer'].once(1000, S, function() {
                                        y == S['chat_id'] && S['stopsay']();
                                    });
                                }));
                            G && (this['chat_block'].show(G['words']), this['sound_channel'] = G['sound']);
                        },
                        o['prototype']['stopsay'] = function() {
                            this['chat_block']['close'](!1),
                                this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                        },
                        o['prototype']['to_look_illust'] = function() {
                            var Z = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function() {
                                Z['illust']['playAnim']('idle'),
                                    Z['page_select_character'].show(0);
                            }));
                        },
                        o['prototype']['jump_to_char_skin'] = function(S, V) {
                            var y = this;
                            if (void 0 === S && (S = -1), void 0 === V && (V = null), S >= 0)
                                for (var G = 0; G < o['characters']['length']; G++)
                                    if (o['characters'][G]['charid'] == S) {
                                        this['change_select'](G);
                                        break;
                                    }
                            Z['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    y['page_visit_character']['show_pop_skin'](),
                                    y['page_visit_character']['set_jump_callback'](V);
                            }));
                        },
                        o['prototype']['jump_to_char_qiyue'] = function(S) {
                            var V = this;
                            if (void 0 === S && (S = -1), S >= 0)
                                for (var y = 0; y < o['characters']['length']; y++)
                                    if (o['characters'][y]['charid'] == S) {
                                        this['change_select'](y);
                                        break;
                                    }
                            Z['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    V['page_visit_character']['show_qiyue']();
                            }));
                        },
                        o['prototype']['jump_to_char_gift'] = function(S) {
                            var V = this;
                            if (void 0 === S && (S = -1), S >= 0)
                                for (var y = 0; y < o['characters']['length']; y++)
                                    if (o['characters'][y]['charid'] == S) {
                                        this['change_select'](y);
                                        break;
                                    }
                            Z['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    V['page_visit_character']['show_gift']();
                            }));
                        },
                        o['characters'] = [],
                        o['chs_fengyu_name_lst'] = ['200040', '200043'],
                        o['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        o['skin_map'] = {},
                        o['main_character_id'] = 0,
                        o['send_gift_count'] = 0,
                        o['send_gift_limit'] = 0,
                        o['commonViewList'] = [],
                        o['using_commonview_index'] = 0,
                        o['finished_endings_map'] = {},
                        o['rewarded_endings_map'] = {},
                        o['star_chars'] = [],
                        o['hidden_characters_map'] = {},
                        o.Inst = null,
                        o;
                }
                (Z['UIBase']);
            Z['UI_Sushe'] = V;
        }
        (uiscript || (uiscript = {}));






        // 屏蔽改变宿舍角色的网络请求
        ! function(Z) {
            var S = function() {
                    function S(S) {
                        var o = this;
                        this['scrollview'] = null,
                            this['select_index'] = 0,
                            this['show_index_list'] = [],
                            this['only_show_star_char'] = !1,
                            this.me = S,
                            this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V.Inst['locking'] || V.Inst['close'](Laya['Handler']['create'](o, function() {
                                    Z['UI_Sushe'].Inst['show_page_visit']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V.Inst['locking'] || V.Inst['close'](Laya['Handler']['create'](o, function() {
                                    Z['UI_Sushe'].Inst['to_look_illust']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V.Inst['locking'] || Z['UI_Sushe'].Inst['jump_to_char_skin']();
                            }, null, !1),
                            this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V.Inst['locking'] || o['onChangeStarShowBtnClick']();
                            }, null, !1),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['dongtai_kaiguan'] = new Z['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                Z['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                    }
                    return S['prototype'].show = function(S, V) {
                            void 0 === V && (V = !1),
                                this.me['visible'] = !0,
                                S ? this.me['alpha'] = 1 : Z['UIBase']['anim_alpha_in'](this.me, {
                                    x: 0
                                }, 200, 0),
                                this['getShowStarState'](),
                                this['sortShowCharsList'](),
                                V || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47),
                                this['scrollview']['reset'](),
                                this['scrollview']['addItem'](this['show_index_list']['length']);
                        },
                        S['prototype']['render_character_cell'] = function(S) {
                            var V = this,
                                o = S['index'],
                                y = S['container'],
                                G = S['cache_data'];
                            y['visible'] = !0,
                                G['index'] = o,
                                G['inited'] || (G['inited'] = !0, y['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                    V['onClickAtHead'](G['index']);
                                }), G.skin = new Z['UI_Character_Skin'](y['getChildByName']('btn')['getChildByName']('head')), G.bg = y['getChildByName']('btn')['getChildByName']('bg'), G['bound'] = y['getChildByName']('btn')['getChildByName']('bound'), G['btn_star'] = y['getChildByName']('btn_star'), G.star = y['getChildByName']('btn')['getChildByName']('star'), G['btn_star']['clickHandler'] = new Laya['Handler'](this, function() {
                                    V['onClickAtStar'](G['index']);
                                }));
                            var e = y['getChildByName']('btn');
                            e['getChildByName']('choose')['visible'] = o == this['select_index'];
                            var x = this['getCharInfoByIndex'](o);
                            e['getChildByName']('redpoint')['visible'] = Z['UI_Sushe']['check_char_redpoint'](x),
                                G.skin['setSkin'](x.skin, 'bighead'),
                                e['getChildByName']('using')['visible'] = x['charid'] == Z['UI_Sushe']['main_character_id'],
                                y['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (x['is_upgraded'] ? '2.png' : '.png'));
                            var R = cfg['item_definition']['character'].get(x['charid']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? G['bound'].skin = R.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (x['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (x['is_upgraded'] ? '2.png' : '.png')) : R.ur ? (G['bound'].pos(-10, -2), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (x['is_upgraded'] ? '6.png' : '5.png'))) : (G['bound'].pos(4, 20), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (x['is_upgraded'] ? '4.png' : '3.png'))),
                                G['btn_star']['visible'] = this['select_index'] == o,
                                G.star['visible'] = Z['UI_Sushe']['is_char_star'](x['charid']) || this['select_index'] == o;
                            var s = cfg['item_definition']['character'].find(x['charid']),
                                u = e['getChildByName']('label_name'),
                                n = s['name_' + GameMgr['client_language'] + '2'] ? s['name_' + GameMgr['client_language'] + '2'] : s['name_' + GameMgr['client_language']];
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                G.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (Z['UI_Sushe']['is_char_star'](x['charid']) ? 'l' : 'd') + (x['is_upgraded'] ? '1.png' : '.png')),
                                    u.text = n['replace']('-', '|')['replace'](/\./g, '·');
                                var k = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                u['leading'] = k.test(n) ? -15 : 0;
                            } else
                                G.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (Z['UI_Sushe']['is_char_star'](x['charid']) ? 'l.png' : 'd.png')), u.text = n;
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == x['charid'] ? (u['scaleX'] = 0.67, u['scaleY'] = 0.57) : (u['scaleX'] = 0.7, u['scaleY'] = 0.6));
                        },
                        S['prototype']['onClickAtHead'] = function(S) {
                            if (this['select_index'] == S) {
                                var V = this['getCharInfoByIndex'](S);
                                if (V['charid'] != Z['UI_Sushe']['main_character_id'])
                                    if (Z['UI_PiPeiYuYue'].Inst['enable'])
                                        Z['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                    else {
                                        var o = Z['UI_Sushe']['main_character_id'];
                                        Z['UI_Sushe']['main_character_id'] = V['charid'],
                                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                            //    character_id: Z['UI_Sushe']['main_character_id']
                                            //}, function () {}),
                                            GameMgr.Inst['account_data']['avatar_id'] = V.skin;
                                        Z['UI_Sushe']['onMainSkinChange']();
                                        // 保存人物和皮肤
                                        MMP.settings.character = V.charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = V.skin;
                                        MMP.saveSettings();
                                        // END
                                        for (var y = 0; y < this['show_index_list']['length']; y++)
                                            this['getCharInfoByIndex'](y)['charid'] == o && this['scrollview']['wantToRefreshItem'](y);
                                        this['scrollview']['wantToRefreshItem'](S);
                                    }
                            } else {
                                var G = this['select_index'];
                                this['select_index'] = S,
                                    G >= 0 && this['scrollview']['wantToRefreshItem'](G),
                                    this['scrollview']['wantToRefreshItem'](S),
                                    Z['UI_Sushe'].Inst['change_select'](this['show_index_list'][S]);
                            }
                        },
                        S['prototype']['onClickAtStar'] = function(S) {
                            if (Z['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](S)['charid']), this['only_show_star_char'])
                                this['scrollview']['wantToRefreshItem'](S);
                            else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                                var V = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                                this['scrollview'].rate = Math.min(1, Math.max(0, V));
                            }
                            // 保存人物和皮肤
                            MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                            MMP.saveSettings();
                            // END
                        },
                        S['prototype']['close'] = function(S) {
                            var V = this;
                            this.me['visible'] && (S ? this.me['visible'] = !1 : Z['UIBase']['anim_alpha_out'](this.me, {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                V.me['visible'] = !1;
                            })));
                        },
                        S['prototype']['onChangeStarShowBtnClick'] = function() {
                            if (!this['only_show_star_char']) {
                                for (var S = !1, V = 0, o = Z['UI_Sushe']['star_chars']; V < o['length']; V++) {
                                    var y = o[V];
                                    if (!Z['UI_Sushe']['hidden_characters_map'][y]) {
                                        S = !0;
                                        break;
                                    }
                                }
                                if (!S)
                                    return Z['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                            }
                            Z['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                                this['only_show_star_char'] = !this['only_show_star_char'],
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                            var G = this.me['getChildByName']('btn_star')['getChildAt'](1);
                            Laya['Tween']['clearAll'](G),
                                Laya['Tween'].to(G, {
                                    x: this['only_show_star_char'] ? 107 : 47
                                }, 150),
                                this.show(!0, !0);
                        },
                        S['prototype']['getShowStarState'] = function() {
                            if (0 == Z['UI_Sushe']['star_chars']['length'])
                                return this['only_show_star_char'] = !1, void 0;
                            if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                                for (var S = 0, V = Z['UI_Sushe']['star_chars']; S < V['length']; S++) {
                                    var o = V[S];
                                    if (!Z['UI_Sushe']['hidden_characters_map'][o])
                                        return;
                                }
                                this['only_show_star_char'] = !1,
                                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                            }
                        },
                        S['prototype']['sortShowCharsList'] = function() {
                            this['show_index_list'] = [],
                                this['select_index'] = -1;
                            for (var S = 0, V = Z['UI_Sushe']['star_chars']; S < V['length']; S++) {
                                var o = V[S];
                                if (!Z['UI_Sushe']['hidden_characters_map'][o])
                                    for (var y = 0; y < Z['UI_Sushe']['characters']['length']; y++)
                                        if (Z['UI_Sushe']['characters'][y]['charid'] == o) {
                                            y == Z['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                                this['show_index_list'].push(y);
                                            break;
                                        }
                            }
                            if (!this['only_show_star_char'])
                                for (var y = 0; y < Z['UI_Sushe']['characters']['length']; y++)
                                    Z['UI_Sushe']['hidden_characters_map'][Z['UI_Sushe']['characters'][y]['charid']] || -1 == this['show_index_list']['indexOf'](y) && (y == Z['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(y));
                        },
                        S['prototype']['getCharInfoByIndex'] = function(S) {
                            return Z['UI_Sushe']['characters'][this['show_index_list'][S]];
                        },
                        S;
                }
                (),
                V = function(V) {
                    function o() {
                        var Z = V.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return Z['bg_width_head'] = 962,
                            Z['bg_width_zhuangban'] = 1819,
                            Z['bg2_delta'] = -29,
                            Z['container_top'] = null,
                            Z['locking'] = !1,
                            Z.tabs = [],
                            Z['tab_index'] = 0,
                            o.Inst = Z,
                            Z;
                    }
                    return __extends(o, V),
                        o['prototype']['onCreate'] = function() {
                            var V = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    V['locking'] || (1 == V['tab_index'] && V['container_zhuangban']['changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](V, function() {
                                        V['close'](),
                                            Z['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (V['close'](), Z['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var o = this.root['getChildByName']('container_tabs'), y = function(S) {
                                    G.tabs.push(o['getChildAt'](S)),
                                        G.tabs[S]['clickHandler'] = new Laya['Handler'](G, function() {
                                            V['locking'] || V['tab_index'] != S && (1 == V['tab_index'] && V['container_zhuangban']['changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](V, function() {
                                                V['change_tab'](S);
                                            }), null) : V['change_tab'](S));
                                        });
                                }, G = this, e = 0; e < o['numChildren']; e++)
                                y(e);
                            this['container_head'] = new S(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new Z['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                    return V['locking'];
                                }));
                        },
                        o['prototype'].show = function(S) {
                            var V = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = S,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), Z['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), Z['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), Z['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), Z['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function() {
                                    V['locking'] = !1;
                                });
                            for (var o = 0; o < this.tabs['length']; o++) {
                                var y = this.tabs[o];
                                y.skin = game['Tools']['localUISrc'](o == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var G = y['getChildByName']('word');
                                G['color'] = o == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    G['scaleX'] = G['scaleY'] = o == this['tab_index'] ? 1.1 : 1,
                                    o == this['tab_index'] && y['parent']['setChildIndex'](y, this.tabs['length'] - 1);
                            }
                        },
                        o['prototype']['change_tab'] = function(S) {
                            var V = this;
                            this['tab_index'] = S;
                            for (var o = 0; o < this.tabs['length']; o++) {
                                var y = this.tabs[o];
                                y.skin = game['Tools']['localUISrc'](o == S ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var G = y['getChildByName']('word');
                                G['color'] = o == S ? '#552c1c' : '#d3a86c',
                                    G['scaleX'] = G['scaleY'] = o == S ? 1.1 : 1,
                                    o == S && y['parent']['setChildIndex'](y, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    Z['UI_Sushe'].Inst['open_illust'](),
                                        V['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), Z['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    V['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function() {
                                    V['locking'] = !1;
                                });
                        },
                        o['prototype']['close'] = function(S) {
                            var V = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? Z['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    V['container_head']['close'](!0);
                                })) : Z['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    V['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function() {
                                    V['locking'] = !1,
                                        V['enable'] = !1,
                                        S && S.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            for (var S = 0; S < Z['UI_Sushe']['characters']['length']; S++) {
                                var V = Z['UI_Sushe']['characters'][S].skin,
                                    o = cfg['item_definition'].skin.get(V);
                                o && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](o.path + '/bighead.png'));
                            }
                        },
                        o['prototype']['changeKaiguanShow'] = function(Z) {
                            Z ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        o;
                }
                (Z['UIBase']);
            Z['UI_Sushe_Select'] = V;
        }
        (uiscript || (uiscript = {}));




        // 友人房
        ! function(Z) {
            var S = function() {
                    function S(Z) {
                        var S = this;
                        this['friends'] = [],
                            this['sortlist'] = [],
                            this.me = Z,
                            this.me['visible'] = !1,
                            this['blackbg'] = Z['getChildByName']('blackbg'),
                            this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                S['locking'] || S['close']();
                            }, null, !1),
                            this.root = Z['getChildByName']('root'),
                            this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                            this['noinfo'] = this.root['getChildByName']('noinfo');
                    }
                    return S['prototype'].show = function() {
                            var S = this;
                            this['locking'] = !0,
                                this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['friends'] = [],
                                this['sortlist'] = [];
                            for (var V = game['FriendMgr']['friend_list'], o = 0; o < V['length']; o++)
                                this['sortlist'].push(o);
                            this['sortlist'] = this['sortlist'].sort(function(Z, S) {
                                var o = V[Z],
                                    y = 0;
                                if (o['state']['is_online']) {
                                    var G = game['Tools']['playState2Desc'](o['state']['playing']);
                                    y += '' != G ? 30000000000 : 60000000000,
                                        o.base['level'] && (y += o.base['level'].id % 1000 * 10000000),
                                        o.base['level3'] && (y += o.base['level3'].id % 1000 * 10000),
                                        y += -Math['floor'](o['state']['login_time'] / 10000000);
                                } else
                                    y += o['state']['logout_time'];
                                var e = V[S],
                                    x = 0;
                                if (e['state']['is_online']) {
                                    var G = game['Tools']['playState2Desc'](e['state']['playing']);
                                    x += '' != G ? 30000000000 : 60000000000,
                                        e.base['level'] && (x += e.base['level'].id % 1000 * 10000000),
                                        e.base['level3'] && (x += e.base['level3'].id % 1000 * 10000),
                                        x += -Math['floor'](e['state']['login_time'] / 10000000);
                                } else
                                    x += e['state']['logout_time'];
                                return x - y;
                            });
                            for (var o = 0; o < V['length']; o++)
                                this['friends'].push({
                                    f: V[o],
                                    invited: !1
                                });
                            this['noinfo']['visible'] = 0 == this['friends']['length'],
                                this['scrollview']['addItem'](this['friends']['length']),
                                Z['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    S['locking'] = !1;
                                }));
                        },
                        S['prototype']['close'] = function() {
                            var S = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    S['locking'] = !1,
                                        S.me['visible'] = !1;
                                }));
                        },
                        S['prototype']['render_item'] = function(S) {
                            var V = S['index'],
                                o = S['container'],
                                G = S['cache_data'];
                            G.head || (G.head = new Z['UI_Head'](o['getChildByName']('head'), 'UI_WaitingRoom'), G.name = o['getChildByName']('name'), G['state'] = o['getChildByName']('label_state'), G.btn = o['getChildByName']('btn_invite'), G['invited'] = o['getChildByName']('invited'));
                            var e = this['friends'][this['sortlist'][V]];
                            G.head.id = game['GameUtility']['get_limited_skin_id'](e.f.base['avatar_id']),
                                G.head['set_head_frame'](e.f.base['account_id'], e.f.base['avatar_frame']),
                                game['Tools']['SetNickname'](G.name, e.f.base);
                            var x = !1;
                            if (e.f['state']['is_online']) {
                                var R = game['Tools']['playState2Desc'](e.f['state']['playing']);
                                '' != R ? (G['state'].text = game['Tools']['strOfLocalization'](2069, [R]), G['state']['color'] = '#a9d94d', G.name['color'] = '#a9d94d') : (G['state'].text = game['Tools']['strOfLocalization'](2071), G['state']['color'] = '#58c4db', G.name['color'] = '#58c4db', x = !0);
                            } else
                                G['state'].text = game['Tools']['strOfLocalization'](2072), G['state']['color'] = '#8c8c8c', G.name['color'] = '#8c8c8c';
                            e['invited'] ? (G.btn['visible'] = !1, G['invited']['visible'] = !0) : (G.btn['visible'] = !0, G['invited']['visible'] = !1, game['Tools']['setGrayDisable'](G.btn, !x), x && (G.btn['clickHandler'] = Laya['Handler']['create'](this, function() {
                                game['Tools']['setGrayDisable'](G.btn, !0);
                                var S = {
                                    room_id: y.Inst['room_id'],
                                    mode: y.Inst['room_mode'],
                                    nickname: GameMgr.Inst['account_data']['nickname'],
                                    verified: GameMgr.Inst['account_data']['verified'],
                                    account_id: GameMgr.Inst['account_id']
                                };
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                    target_id: e.f.base['account_id'],
                                    type: game['EFriendMsgType']['room_invite'],
                                    content: JSON['stringify'](S)
                                }, function(S, V) {
                                    S || V['error'] ? (game['Tools']['setGrayDisable'](G.btn, !1), Z['UIMgr'].Inst['showNetReqError']('sendClientMessage', S, V)) : (G.btn['visible'] = !1, G['invited']['visible'] = !0, e['invited'] = !0);
                                });
                            }, null, !1)));
                        },
                        S;
                }
                (),
                V = function() {
                    function S(S) {
                        var V = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = S,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new Z['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new Z['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                return V['locking'];
                            }));
                        for (var o = this.root['getChildByName']('container_tabs'), y = function(S) {
                                G.tabs.push(o['getChildAt'](S)),
                                    G.tabs[S]['clickHandler'] = new Laya['Handler'](G, function() {
                                        V['locking'] || V['tab_index'] != S && (1 == V['tab_index'] && V['page_zhangban']['changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](V, function() {
                                            V['change_tab'](S);
                                        }), null) : V['change_tab'](S));
                                    });
                            }, G = this, e = 0; e < o['numChildren']; e++)
                            y(e);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function() {
                                V['locking'] || (1 == V['tab_index'] && V['page_zhangban']['changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](V, function() {
                                    V['close'](!1);
                                }), null) : V['close'](!1));
                            }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                V['locking'] || (1 == V['tab_index'] && V['page_zhangban']['changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](V, function() {
                                    V['close'](!1);
                                }), null) : V['close'](!1));
                            });
                    }
                    return S['prototype'].show = function() {
                            var S = this;
                            this.me['visible'] = !0,
                                this['blackmask']['alpha'] = 0,
                                this['locking'] = !0,
                                Laya['Tween'].to(this['blackmask'], {
                                    alpha: 0.3
                                }, 150),
                                Z['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    S['locking'] = !1;
                                })),
                                this['tab_index'] = 0,
                                this['page_zhangban']['close'](!0),
                                this['page_head'].show(!0);
                            for (var V = 0; V < this.tabs['length']; V++) {
                                var o = this.tabs[V];
                                o.skin = game['Tools']['localUISrc'](V == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var y = o['getChildByName']('word');
                                y['color'] = V == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    y['scaleX'] = y['scaleY'] = V == this['tab_index'] ? 1.1 : 1,
                                    V == this['tab_index'] && o['parent']['setChildIndex'](o, this.tabs['length'] - 1);
                            }
                        },
                        S['prototype']['change_tab'] = function(Z) {
                            var S = this;
                            this['tab_index'] = Z;
                            for (var V = 0; V < this.tabs['length']; V++) {
                                var o = this.tabs[V];
                                o.skin = game['Tools']['localUISrc'](V == Z ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var y = o['getChildByName']('word');
                                y['color'] = V == Z ? '#552c1c' : '#d3a86c',
                                    y['scaleX'] = y['scaleY'] = V == Z ? 1.1 : 1,
                                    V == Z && o['parent']['setChildIndex'](o, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(200, this, function() {
                                    S['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(200, this, function() {
                                    S['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function() {
                                    S['locking'] = !1;
                                });
                        },
                        S['prototype']['close'] = function(S) {
                            var V = this;
                            //修改友人房间立绘
                            if (!(V.page_head.choosed_chara_index == 0 && V.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = V.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = V.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = V.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[V.page_head.choosed_chara_index] = V.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (S ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: y.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function() {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), Z['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                V['locking'] = !1,
                                    V.me['visible'] = !1;
                            }))));
                        },
                        S;
                }
                (),
                o = function() {
                    function Z(Z) {
                        this['modes'] = [],
                            this.me = Z,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return Z['prototype'].show = function(Z) {
                            this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['modes'] = Z,
                                this['scrollview']['addItem'](Z['length']);
                            var S = this['scrollview']['total_height'];
                            S > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - S, this.bg['height'] = S + 20),
                                this.bg['visible'] = !0;
                        },
                        Z['prototype']['render_item'] = function(Z) {
                            var S = Z['index'],
                                V = Z['container'],
                                o = V['getChildByName']('info');
                            o['fontSize'] = 40,
                                o['fontSize'] = this['modes'][S]['length'] <= 5 ? 40 : this['modes'][S]['length'] <= 9 ? 55 - 3 * this['modes'][S]['length'] : 28,
                                o.text = this['modes'][S];
                        },
                        Z;
                }
                (),
                y = function(y) {
                    function G() {
                        var S = y.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return S['skin_ready'] = 'myres/room/btn_ready.png',
                            S['skin_cancel'] = 'myres/room/btn_cancel.png',
                            S['skin_start'] = 'myres/room/btn_start.png',
                            S['skin_start_no'] = 'myres/room/btn_start_no.png',
                            S['update_seq'] = 0,
                            S['pre_msgs'] = [],
                            S['msg_tail'] = -1,
                            S['posted'] = !1,
                            S['label_rommid'] = null,
                            S['player_cells'] = [],
                            S['btn_ok'] = null,
                            S['btn_invite_friend'] = null,
                            S['btn_add_robot'] = null,
                            S['btn_dress'] = null,
                            S['btn_copy'] = null,
                            S['beReady'] = !1,
                            S['room_id'] = -1,
                            S['owner_id'] = -1,
                            S['tournament_id'] = 0,
                            S['max_player_count'] = 0,
                            S['players'] = [],
                            S['container_rules'] = null,
                            S['container_top'] = null,
                            S['container_right'] = null,
                            S['locking'] = !1,
                            S['mousein_copy'] = !1,
                            S['popout'] = null,
                            S['room_link'] = null,
                            S['btn_copy_link'] = null,
                            S['last_start_room'] = 0,
                            S['invitefriend'] = null,
                            S['pre_choose'] = null,
                            S['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            G.Inst = S,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](S, function(Z) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](Z)),
                                    S['onReadyChange'](Z['account_id'], Z['ready'], Z['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](S, function(Z) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](Z)),
                                    S['onPlayerChange'](Z);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](S, function(Z) {
                                S['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](Z)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), S['onGameStart'](Z));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](S, function(Z) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](Z)),
                                    S['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](S, function() {
                                S['enable'] && S.hide(Laya['Handler']['create'](S, function() {
                                    Z['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            S;
                    }
                    return __extends(G, y),
                        G['prototype']['push_msg'] = function(Z) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](Z)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](Z));
                        },
                        Object['defineProperty'](G['prototype'], 'inRoom', {
                            get: function() {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](G['prototype'], 'robot_count', {
                            get: function() {
                                for (var Z = 0, S = 0; S < this['players']['length']; S++)
                                    2 == this['players'][S]['category'] && Z++;
                                return Z;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        G['prototype']['resetData'] = function() {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        G['prototype']['updateData'] = function(Z) {
                            if (!Z)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < Z.persons.length; i++) {

                                if (Z.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    Z.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    Z.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    Z.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    Z.persons[i].title = GameMgr.Inst.account_data.title;
                                    Z.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        Z.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = Z['room_id'],
                                this['owner_id'] = Z['owner_id'],
                                this['room_mode'] = Z.mode,
                                this['public_live'] = Z['public_live'],
                                this['tournament_id'] = 0,
                                Z['tournament_id'] && (this['tournament_id'] = Z['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = Z['max_player_count'],
                                this['players'] = [];
                            for (var S = 0; S < Z['persons']['length']; S++) {
                                var V = Z['persons'][S];
                                V['ready'] = !1,
                                    V['cell_index'] = -1,
                                    V['category'] = 1,
                                    this['players'].push(V);
                            }
                            for (var S = 0; S < Z['robot_count']; S++)
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
                            for (var S = 0; S < Z['ready_list']['length']; S++)
                                for (var o = 0; o < this['players']['length']; o++)
                                    if (this['players'][o]['account_id'] == Z['ready_list'][S]) {
                                        this['players'][o]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                Z.seq && (this['update_seq'] = Z.seq);
                        },
                        G['prototype']['onReadyChange'] = function(Z, S, V) {
                            for (var o = 0; o < this['players']['length']; o++)
                                if (this['players'][o]['account_id'] == Z) {
                                    this['players'][o]['ready'] = S,
                                        this['players'][o]['dressing'] = V,
                                        this['_onPlayerReadyChange'](this['players'][o]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        G['prototype']['onPlayerChange'] = function(Z) {
                            if (app.Log.log(Z), Z = Z['toJSON'](), !(Z.seq && Z.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < Z.player_list.length; i++) {

                                    if (Z.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        Z.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        Z.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        Z.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            Z.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (Z.update_list != undefined) {
                                    for (var i = 0; i < Z.update_list.length; i++) {

                                        if (Z.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            Z.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            Z.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            Z.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                Z.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = Z.seq;
                                var S = {};
                                S.type = 'onPlayerChange0',
                                    S['players'] = this['players'],
                                    S.msg = Z,
                                    this['push_msg'](JSON['stringify'](S));
                                var V = this['robot_count'],
                                    o = Z['robot_count'];
                                if (o < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, V--);
                                    for (var y = 0; y < this['players']['length']; y++)
                                        2 == this['players'][y]['category'] && V > o && (this['players'][y]['category'] = 0, V--);
                                }
                                for (var G = [], e = Z['player_list'], y = 0; y < this['players']['length']; y++)
                                    if (1 == this['players'][y]['category']) {
                                        for (var x = -1, R = 0; R < e['length']; R++)
                                            if (e[R]['account_id'] == this['players'][y]['account_id']) {
                                                x = R;
                                                break;
                                            }
                                        if (-1 != x) {
                                            var s = e[x];
                                            G.push(this['players'][y]),
                                                this['players'][y]['avatar_id'] = s['avatar_id'],
                                                this['players'][y]['title'] = s['title'],
                                                this['players'][y]['verified'] = s['verified'];
                                        }
                                    } else
                                        2 == this['players'][y]['category'] && G.push(this['players'][y]);
                                this['players'] = G;
                                for (var y = 0; y < e['length']; y++) {
                                    for (var u = !1, s = e[y], R = 0; R < this['players']['length']; R++)
                                        if (1 == this['players'][R]['category'] && this['players'][R]['account_id'] == s['account_id']) {
                                            u = !0;
                                            break;
                                        }
                                    u || this['players'].push({
                                        account_id: s['account_id'],
                                        avatar_id: s['avatar_id'],
                                        nickname: s['nickname'],
                                        verified: s['verified'],
                                        title: s['title'],
                                        level: s['level'],
                                        level3: s['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var n = [!1, !1, !1, !1], y = 0; y < this['players']['length']; y++)
                                    -
                                    1 != this['players'][y]['cell_index'] && (n[this['players'][y]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][y]));
                                for (var y = 0; y < this['players']['length']; y++)
                                    if (1 == this['players'][y]['category'] && -1 == this['players'][y]['cell_index'])
                                        for (var R = 0; R < this['max_player_count']; R++)
                                            if (!n[R]) {
                                                this['players'][y]['cell_index'] = R,
                                                    n[R] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][y]);
                                                break;
                                            }
                                for (var V = this['robot_count'], o = Z['robot_count']; o > V;) {
                                    for (var k = -1, R = 0; R < this['max_player_count']; R++)
                                        if (!n[R]) {
                                            k = R;
                                            break;
                                        }
                                    if (-1 == k)
                                        break;
                                    n[k] = !0,
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
                                        V++;
                                }
                                for (var y = 0; y < this['max_player_count']; y++)
                                    n[y] || this['_clearCell'](y);
                                var S = {};
                                if (S.type = 'onPlayerChange1', S['players'] = this['players'], this['push_msg'](JSON['stringify'](S)), Z['owner_id']) {
                                    if (this['owner_id'] = Z['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var R = 0; R < this['players']['length']; R++)
                                                if (this['players'][R] && this['players'][R]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][R]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var R = 0; R < this['players']['length']; R++)
                                            if (this['players'][R] && this['players'][R]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][R]);
                                                break;
                                            }
                            }
                        },
                        G['prototype']['onBeKictOut'] = function() {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), Z['UI_Lobby'].Inst['enable'] = !0, Z['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        G['prototype']['onCreate'] = function() {
                            var y = this;
                            this['last_start_room'] = 0;
                            var G = this.me['getChildByName']('root');
                            this['container_top'] = G['getChildByName']('top'),
                                this['container_right'] = G['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var e = function(S) {
                                    var V = G['getChildByName']('player_' + S['toString']()),
                                        o = {};
                                    o['index'] = S,
                                        o['container'] = V,
                                        o['container_flag'] = V['getChildByName']('flag'),
                                        o['container_flag']['visible'] = !1,
                                        o['container_name'] = V['getChildByName']('container_name'),
                                        o.name = V['getChildByName']('container_name')['getChildByName']('name'),
                                        o['btn_t'] = V['getChildByName']('btn_t'),
                                        o['container_illust'] = V['getChildByName']('container_illust'),
                                        o['illust'] = new Z['UI_Character_Skin'](V['getChildByName']('container_illust')['getChildByName']('illust')),
                                        o.host = V['getChildByName']('host'),
                                        o['title'] = new Z['UI_PlayerTitle'](V['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                        o.rank = new Z['UI_Level'](V['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                        o['is_robot'] = !1;
                                    var e = 0;
                                    o['btn_t']['clickHandler'] = Laya['Handler']['create'](x, function() {
                                            if (!(y['locking'] || Laya['timer']['currTimer'] < e)) {
                                                e = Laya['timer']['currTimer'] + 500;
                                                for (var Z = 0; Z < y['players']['length']; Z++)
                                                    if (y['players'][Z]['cell_index'] == S) {
                                                        y['kickPlayer'](Z);
                                                        break;
                                                    }
                                            }
                                        }, null, !1),
                                        o['btn_info'] = V['getChildByName']('btn_info'),
                                        o['btn_info']['clickHandler'] = Laya['Handler']['create'](x, function() {
                                            if (!y['locking'])
                                                for (var V = 0; V < y['players']['length']; V++)
                                                    if (y['players'][V]['cell_index'] == S) {
                                                        y['players'][V]['account_id'] && y['players'][V]['account_id'] > 0 && Z['UI_OtherPlayerInfo'].Inst.show(y['players'][V]['account_id'], y['room_mode'].mode < 10 ? 1 : 2, 1);
                                                        break;
                                                    }
                                        }, null, !1),
                                        x['player_cells'].push(o);
                                }, x = this, R = 0; 4 > R; R++)
                                e(R);
                            this['btn_ok'] = G['getChildByName']('btn_ok');
                            var s = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                Laya['timer']['currTimer'] < s + 500 || (s = Laya['timer']['currTimer'], y['owner_id'] == GameMgr.Inst['account_id'] ? y['getStart']() : y['switchReady']());
                            }, null, !1);
                            var u = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['timer']['currTimer'] < u + 500 || (u = Laya['timer']['currTimer'], y['leaveRoom']());
                                }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    y['locking'] || y['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var n = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    y['locking'] || Laya['timer']['currTimer'] < n || (n = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                        robot_count: y['robot_count'] + 1
                                    }, function(S, V) {
                                        (S || V['error'] && 1111 != V['error'].code) && Z['UIMgr'].Inst['showNetReqError']('modifyRoom_add', S, V),
                                            n = 0;
                                    }));
                                }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!y['locking']) {
                                        var S = 0;
                                        y['room_mode']['detail_rule'] && y['room_mode']['detail_rule']['chuanma'] && (S = 1),
                                            Z['UI_Rules'].Inst.show(0, null, S);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function() {
                                    y['locking'] || y['beReady'] && y['owner_id'] != GameMgr.Inst['account_id'] || (y['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: y['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function() {}));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function() {
                                    y['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function() {
                                    y['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    y['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), y['popout']['visible'] = !0, Z['UIBase']['anim_pop_out'](y['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new o(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    var S = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    S.call('setSysClipboardText', y['room_link'].text),
                                        Z['UIBase']['anim_pop_hide'](y['popout'], Laya['Handler']['create'](y, function() {
                                            y['popout']['visible'] = !1;
                                        })),
                                        Z['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', y['room_link'].text, function() {}),
                                        Z['UIBase']['anim_pop_hide'](y['popout'], Laya['Handler']['create'](y, function() {
                                            y['popout']['visible'] = !1;
                                        })),
                                        Z['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['UIBase']['anim_pop_hide'](y['popout'], Laya['Handler']['create'](y, function() {
                                        y['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new S(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new V(this.me['getChildByName']('pop_view'));
                        },
                        G['prototype'].show = function() {
                            var S = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var V = 0; 4 > V; V++)
                                this['player_cells'][V]['container']['visible'] = V < this['max_player_count'];
                            for (var V = 0; V < this['max_player_count']; V++)
                                this['_clearCell'](V);
                            for (var V = 0; V < this['players']['length']; V++)
                                this['players'][V]['cell_index'] = V, this['_refreshPlayerInfo'](this['players'][V]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var o = {};
                            o.type = 'show',
                                o['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](o)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var y = [];
                            y.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var G = this['room_mode']['detail_rule'];
                            if (G) {
                                var e = 5,
                                    x = 20;
                                if (null != G['time_fixed'] && (e = G['time_fixed']), null != G['time_add'] && (x = G['time_add']), y.push(e['toString']() + '+' + x['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var R = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    R && y.push(R.name);
                                }
                                if (null != G['init_point'] && y.push(game['Tools']['strOfLocalization'](2199) + G['init_point']), null != G['fandian'] && y.push(game['Tools']['strOfLocalization'](2094) + ':' + G['fandian']), G['guyi_mode'] && y.push(game['Tools']['strOfLocalization'](3028)), null != G['dora_count'])
                                    switch (G['chuanma'] && (G['dora_count'] = 0), G['dora_count']) {
                                        case 0:
                                            y.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            y.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            y.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            y.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != G['shiduan'] && 1 != G['shiduan'] && y.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === G['fanfu'] && y.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === G['fanfu'] && y.push(game['Tools']['strOfLocalization'](2764)),
                                    null != G['bianjietishi'] && 1 != G['bianjietishi'] && y.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != G['have_zimosun'] && 1 != G['have_zimosun'] ? y.push(game['Tools']['strOfLocalization'](2202)) : y.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(y),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                Z['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var V = 0; V < this['player_cells']['length']; V++)
                                Z['UIBase']['anim_alpha_in'](this['player_cells'][V]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * V, null, Laya.Ease['backOut']);
                            Z['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                Z['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function() {
                                    S['locking'] = !1;
                                });
                            var s = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != s && (this['room_link'].text += '(' + s + ')');
                            var u = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + u + '?room=' + this['room_id'];
                        },
                        G['prototype']['leaveRoom'] = function() {
                            var S = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(V, o) {
                                V || o['error'] ? Z['UIMgr'].Inst['showNetReqError']('leaveRoom', V, o) : (S['room_id'] = -1, S.hide(Laya['Handler']['create'](S, function() {
                                    Z['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        G['prototype']['tryToClose'] = function(S) {
                            var V = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(o, y) {
                                o || y['error'] ? (Z['UIMgr'].Inst['showNetReqError']('leaveRoom', o, y), S['runWith'](!1)) : (V['enable'] = !1, V['pop_change_view']['close'](!0), S['runWith'](!0));
                            });
                        },
                        G['prototype'].hide = function(S) {
                            var V = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var o = 0; o < this['player_cells']['length']; o++)
                                Z['UIBase']['anim_alpha_out'](this['player_cells'][o]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            Z['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                Z['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function() {
                                    V['locking'] = !1,
                                        V['enable'] = !1,
                                        S && S.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        G['prototype']['onDisbale'] = function() {
                            Laya['timer']['clearAll'](this);
                            for (var Z = 0; Z < this['player_cells']['length']; Z++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][Z]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        G['prototype']['switchReady'] = function() {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function() {}));
                        },
                        G['prototype']['getStart'] = function() {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function(S, V) {
                                (S || V['error']) && Z['UIMgr'].Inst['showNetReqError']('startRoom', S, V);
                            })));
                        },
                        G['prototype']['kickPlayer'] = function(S) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var V = this['players'][S];
                                1 == V['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][S]['account_id']
                                }, function() {}) : 2 == V['category'] && (this['pre_choose'] = V, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function(S, V) {
                                    (S || V['error']) && Z['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', S, V);
                                }));
                            }
                        },
                        G['prototype']['_clearCell'] = function(Z) {
                            if (!(0 > Z || Z >= this['player_cells']['length'])) {
                                var S = this['player_cells'][Z];
                                S['container_flag']['visible'] = !1,
                                    S['container_illust']['visible'] = !1,
                                    S.name['visible'] = !1,
                                    S['container_name']['visible'] = !1,
                                    S['btn_t']['visible'] = !1,
                                    S.host['visible'] = !1,
                                    S['illust']['clear']();
                            }
                        },
                        G['prototype']['_refreshPlayerInfo'] = function(Z) {
                            var S = Z['cell_index'];
                            if (!(0 > S || S >= this['player_cells']['length'])) {
                                var V = this['player_cells'][S];
                                V['container_illust']['visible'] = !0,
                                    V['container_name']['visible'] = !0,
                                    V.name['visible'] = !0,
                                    game['Tools']['SetNickname'](V.name, Z),
                                    V['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && Z['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == Z['account_id'] && (V['container_flag']['visible'] = !0, V.host['visible'] = !0),
                                    Z['account_id'] == GameMgr.Inst['account_id'] ? V['illust']['setSkin'](Z['avatar_id'], 'waitingroom') : V['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](Z['avatar_id']), 'waitingroom'),
                                    V['title'].id = game['Tools']['titleLocalization'](Z['account_id'], Z['title']),
                                    V.rank.id = Z[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](Z);
                            }
                        },
                        G['prototype']['_onPlayerReadyChange'] = function(Z) {
                            var S = Z['cell_index'];
                            if (!(0 > S || S >= this['player_cells']['length'])) {
                                var V = this['player_cells'][S];
                                V['container_flag']['visible'] = this['owner_id'] == Z['account_id'] ? !0 : Z['ready'];
                            }
                        },
                        G['prototype']['refreshAsOwner'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var Z = 0, S = 0; S < this['players']['length']; S++)
                                    0 != this['players'][S]['category'] && (this['_refreshPlayerInfo'](this['players'][S]), Z++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], Z == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], Z == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        G['prototype']['refreshStart'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var Z = 0, S = 0; S < this['players']['length']; S++) {
                                    var V = this['players'][S];
                                    if (!V || 0 == V['category'])
                                        break;
                                    (V['account_id'] == this['owner_id'] || V['ready']) && Z++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], Z != this['max_player_count']), this['enable']) {
                                    for (var o = 0, S = 0; S < this['max_player_count']; S++) {
                                        var y = this['player_cells'][S];
                                        y && y['container_flag']['visible'] && o++;
                                    }
                                    if (Z != o && !this['posted']) {
                                        this['posted'] = !0;
                                        var G = {};
                                        G['okcount'] = Z,
                                            G['okcount2'] = o,
                                            G.msgs = [];
                                        var e = 0,
                                            x = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (e = (this['msg_tail'] + 1) % this['pre_msgs']['length'], x = this['msg_tail']), e >= 0 && x >= 0) {
                                            for (var S = e; S != x; S = (S + 1) % this['pre_msgs']['length'])
                                                G.msgs.push(this['pre_msgs'][S]);
                                            G.msgs.push(this['pre_msgs'][x]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', G, !1);
                                    }
                                }
                            }
                        },
                        G['prototype']['onGameStart'] = function(Z) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](Z['connect_token'], Z['game_uuid'], Z['location'], !1, null);
                        },
                        G['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        G['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        G.Inst = null,
                        G;
                }
                (Z['UIBase']);
            Z['UI_WaitingRoom'] = y;
        }
        (uiscript || (uiscript = {}));





        // 保存装扮
        ! function(Z) {
            var S;
            ! function(S) {
                var V = function() {
                        function V(V, o, y) {
                            var G = this;
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
                                this['_locking'] = y,
                                this['container_zhuangban0'] = V,
                                this['container_zhuangban1'] = o;
                            var e = this['container_zhuangban0']['getChildByName']('tabs');
                            e['vScrollBarSkin'] = '';
                            for (var x = function(S) {
                                    var V = e['getChildAt'](S);
                                    R.tabs.push(V),
                                        V['clickHandler'] = new Laya['Handler'](R, function() {
                                            G['locking'] || G['tab_index'] != S && (G['_changed'] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](G, function() {
                                                G['change_tab'](S);
                                            }), null) : G['change_tab'](S));
                                        });
                                }, R = this, s = 0; s < e['numChildren']; s++)
                                x(s);
                            this['page_items'] = new S['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                                this['page_headframe'] = new S['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                                this['page_bgm'] = new S['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                                this['page_desktop'] = new S['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                                this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                                this['scrollview']['setElastic'](),
                                this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                                this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                                this['btn_save']['clickHandler'] = new Laya['Handler'](this, function() {
                                    for (var S = [], V = 0; V < G['cell_titles']['length']; V++) {
                                        var o = G['slot_ids'][V];
                                        if (G['slot_map'][o]) {
                                            var y = G['slot_map'][o];
                                            if (!(y['item_id'] && y['item_id'] != G['cell_default_item'][V] || y['item_id_list'] && 0 != y['item_id_list']['length']))
                                                continue;
                                            var e = [];
                                            if (y['item_id_list'])
                                                for (var x = 0, R = y['item_id_list']; x < R['length']; x++) {
                                                    var s = R[x];
                                                    s == G['cell_default_item'][V] ? e.push(0) : e.push(s);
                                                }
                                            S.push({
                                                slot: o,
                                                item_id: y['item_id'],
                                                type: y.type,
                                                item_id_list: e
                                            });
                                        }
                                    }
                                    G['btn_save']['mouseEnabled'] = !1;
                                    var u = G['tab_index'];
                                    // START
                                    // app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                    //     views: S,
                                    //     save_index: u,
                                    //     is_use: u == Z['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                    // }, function (V, o) {
                                    //     if (G['btn_save']['mouseEnabled'] = !0, V || o['error'])
                                    //         Z['UIMgr'].Inst['showNetReqError']('saveCommonViews', V, o);
                                    //     else {
                                    if (Z['UI_Sushe']['commonViewList']['length'] < u)
                                        for (var y = Z['UI_Sushe']['commonViewList']['length']; u >= y; y++)
                                            Z['UI_Sushe']['commonViewList'].push([]);
                                    MMP.settings.commonViewList = Z.UI_Sushe.commonViewList;
                                    MMP.settings.using_commonview_index = Z.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    //END
                                    if (Z['UI_Sushe']['commonViewList'][u] = S, Z['UI_Sushe']['using_commonview_index'] == u && G['onChangeGameView'](), G['tab_index'] != u)
                                        return;
                                    G['btn_save']['mouseEnabled'] = !0,
                                        G['_changed'] = !1,
                                        G['refresh_btn']();
                                    //    }
                                    //});
                                }),
                                this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                                this['btn_use']['clickHandler'] = new Laya['Handler'](this, function() {
                                    G['btn_use']['mouseEnabled'] = !1;
                                    var S = G['tab_index'];
                                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                    //    index: S
                                    //}, function(V, o) {
                                    //    G['btn_use']['mouseEnabled'] = !0,
                                    //        V || o['error'] ? Z['UIMgr'].Inst['showNetReqError']('useCommonView', V, o) : (
                                    Z['UI_Sushe']['using_commonview_index'] = S, G['refresh_btn'](), G['refresh_tab'](), G['onChangeGameView'](); //);
                                    //});
                                }),
                                this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                                this['random_slider'] = this['random']['getChildByName']('slider'),
                                this['btn_random'] = this['random']['getChildByName']('btn'),
                                this['btn_random']['clickHandler'] = new Laya['Handler'](this, function() {
                                    G['onRandomBtnClick']();
                                });
                        }
                        return Object['defineProperty'](V['prototype'], 'locking', {
                                get: function() {
                                    return this['_locking'] ? this['_locking'].run() : !1;
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            Object['defineProperty'](V['prototype'], 'changed', {
                                get: function() {
                                    return this['_changed'];
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            V['prototype'].show = function(S) {
                                game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                    this['container_zhuangban0']['visible'] = !0,
                                    this['container_zhuangban1']['visible'] = !0,
                                    S ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (Z['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                        x: 0
                                    }, 200), Z['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                        x: 0
                                    }, 200)),
                                    this['change_tab'](Z['UI_Sushe']['using_commonview_index']);
                            },
                            V['prototype']['change_tab'] = function(S) {
                                if (this['tab_index'] = S, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                    if (this['tab_index'] < Z['UI_Sushe']['commonViewList']['length'])
                                        for (var V = Z['UI_Sushe']['commonViewList'][this['tab_index']], o = 0; o < V['length']; o++)
                                            this['slot_map'][V[o].slot] = {
                                                slot: V[o].slot,
                                                item_id: V[o]['item_id'],
                                                type: V[o].type,
                                                item_id_list: V[o]['item_id_list']
                                            };
                                    this['scrollview']['addItem'](this['cell_titles']['length']),
                                        this['onChangeSlotSelect'](0),
                                        this['refresh_btn']();
                                }
                            },
                            V['prototype']['refresh_tab'] = function() {
                                for (var S = 0; S < this.tabs['length']; S++) {
                                    var V = this.tabs[S];
                                    V['mouseEnabled'] = this['tab_index'] != S,
                                        V['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == S ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                        V['getChildByName']('num')['color'] = this['tab_index'] == S ? '#2f1e19' : '#f2c797';
                                    var o = V['getChildByName']('choosed');
                                    Z['UI_Sushe']['using_commonview_index'] == S ? (o['visible'] = !0, o.x = this['tab_index'] == S ? -18 : -4) : o['visible'] = !1;
                                }
                            },
                            V['prototype']['refresh_btn'] = function() {
                                this['btn_save']['visible'] = !1,
                                    this['btn_save']['mouseEnabled'] = !0,
                                    this['btn_use']['visible'] = !1,
                                    this['btn_use']['mouseEnabled'] = !0,
                                    this['btn_using']['visible'] = !1,
                                    this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = Z['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = Z['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                            },
                            V['prototype']['onChangeSlotSelect'] = function(Z) {
                                var S = this;
                                this['select_index'] = Z,
                                    this['random']['visible'] = !(6 == Z || 9 == Z);
                                var V = 0;
                                Z >= 0 && Z < this['cell_default_item']['length'] && (V = this['cell_default_item'][Z]);
                                var o = V,
                                    y = this['slot_ids'][Z],
                                    G = !1,
                                    e = [];
                                if (this['slot_map'][y]) {
                                    var x = this['slot_map'][y];
                                    e = x['item_id_list'],
                                        G = !!x.type,
                                        x['item_id'] && (o = this['slot_map'][y]['item_id']),
                                        G && x['item_id_list'] && x['item_id_list']['length'] > 0 && (o = x['item_id_list'][0]);
                                }
                                var R = Laya['Handler']['create'](this, function(o) {
                                    if (o == V && (o = 0), S['is_random']) {
                                        var G = S['slot_map'][y]['item_id_list']['indexOf'](o);
                                        G >= 0 ? S['slot_map'][y]['item_id_list']['splice'](G, 1) : (S['slot_map'][y]['item_id_list'] && 0 != S['slot_map'][y]['item_id_list']['length'] || (S['slot_map'][y]['item_id_list'] = []), S['slot_map'][y]['item_id_list'].push(o));
                                    } else
                                        S['slot_map'][y] || (S['slot_map'][y] = {}), S['slot_map'][y]['item_id'] = o;
                                    S['scrollview']['wantToRefreshItem'](Z),
                                        S['_changed'] = !0,
                                        S['refresh_btn']();
                                }, null, !1);
                                this['page_items']['close'](),
                                    this['page_desktop']['close'](),
                                    this['page_headframe']['close'](),
                                    this['page_bgm']['close'](),
                                    this['is_random'] = G,
                                    this['random_slider'].x = G ? 76 : -4,
                                    this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                    this['random']['getChildAt'](2)['visible'] = this['is_random'];
                                var s = game['Tools']['strOfLocalization'](this['cell_titles'][Z]);
                                if (Z >= 0 && 2 >= Z)
                                    this['page_items'].show(s, Z, o, R), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (3 == Z)
                                    this['page_items'].show(s, 10, o, R), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (4 == Z)
                                    this['page_items'].show(s, 3, o, R), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (5 == Z)
                                    this['page_bgm'].show(s, o, R), this['setRandomGray'](!this['page_bgm']['can_random']());
                                else if (6 == Z)
                                    this['page_headframe'].show(s, o, R);
                                else if (7 == Z || 8 == Z) {
                                    var u = this['cell_default_item'][7],
                                        n = this['cell_default_item'][8];
                                    if (7 == Z) {
                                        if (u = o, this['slot_map'][game['EView'].mjp]) {
                                            var k = this['slot_map'][game['EView'].mjp];
                                            k.type && k['item_id_list'] && k['item_id_list']['length'] > 0 ? n = k['item_id_list'][0] : k['item_id'] && (n = k['item_id']);
                                        }
                                        this['page_desktop']['show_desktop'](s, u, n, R);
                                    } else {
                                        if (n = o, this['slot_map'][game['EView']['desktop']]) {
                                            var k = this['slot_map'][game['EView']['desktop']];
                                            k.type && k['item_id_list'] && k['item_id_list']['length'] > 0 ? u = k['item_id_list'][0] : k['item_id'] && (u = k['item_id']);
                                        }
                                        this['page_desktop']['show_mjp'](s, u, n, R);
                                    }
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                                } else
                                    9 == Z && this['page_desktop']['show_lobby_bg'](s, o, R);
                            },
                            V['prototype']['onRandomBtnClick'] = function() {
                                var Z = this;
                                if (6 != this['select_index'] && 9 != this['select_index']) {
                                    this['_changed'] = !0,
                                        this['refresh_btn'](),
                                        this['is_random'] = !this['is_random'],
                                        this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                        Laya['Tween'].to(this['random_slider'], {
                                            x: this['is_random'] ? 76 : -4
                                        }, 100, null, Laya['Handler']['create'](this, function() {
                                            Z['random']['getChildAt'](Z['is_random'] ? 1 : 2)['visible'] = !1;
                                        }));
                                    var S = this['select_index'],
                                        V = this['slot_ids'][S],
                                        o = 0;
                                    S >= 0 && S < this['cell_default_item']['length'] && (o = this['cell_default_item'][S]);
                                    var y = o,
                                        G = [];
                                    if (this['slot_map'][V]) {
                                        var e = this['slot_map'][V];
                                        G = e['item_id_list'],
                                            e['item_id'] && (y = this['slot_map'][V]['item_id']);
                                    }
                                    if (S >= 0 && 4 >= S) {
                                        var x = this['slot_map'][V];
                                        x ? (x.type = x.type ? 0 : 1, x['item_id_list'] && 0 != x['item_id_list']['length'] || (x['item_id_list'] = [x['item_id']])) : this['slot_map'][V] = {
                                                type: 1,
                                                item_id_list: [this['page_items']['items'][0]]
                                            },
                                            this['page_items']['changeRandomState'](y);
                                    } else if (5 == S) {
                                        var x = this['slot_map'][V];
                                        if (x)
                                            x.type = x.type ? 0 : 1, x['item_id_list'] && 0 != x['item_id_list']['length'] || (x['item_id_list'] = [x['item_id']]);
                                        else {
                                            this['slot_map'][V] = {
                                                type: 1,
                                                item_id_list: [this['page_bgm']['items'][0]]
                                            };
                                        }
                                        this['page_bgm']['changeRandomState'](y);
                                    } else if (7 == S || 8 == S) {
                                        var x = this['slot_map'][V];
                                        if (x)
                                            x.type = x.type ? 0 : 1, x['item_id_list'] && 0 != x['item_id_list']['length'] || (x['item_id_list'] = [x['item_id']]);
                                        else {
                                            this['slot_map'][V] = {
                                                type: 1,
                                                item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                            };
                                        }
                                        this['page_desktop']['changeRandomState'](y);
                                    }
                                    this['scrollview']['wantToRefreshItem'](S);
                                }
                            },
                            V['prototype']['render_view'] = function(Z) {
                                var S = this,
                                    V = Z['container'],
                                    o = Z['index'],
                                    y = V['getChildByName']('cell');
                                this['select_index'] == o ? (y['scaleX'] = y['scaleY'] = 1.05, y['getChildByName']('choosed')['visible'] = !0) : (y['scaleX'] = y['scaleY'] = 1, y['getChildByName']('choosed')['visible'] = !1),
                                    y['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][o]);
                                var G = y['getChildByName']('name'),
                                    e = y['getChildByName']('icon'),
                                    x = this['cell_default_item'][o],
                                    R = this['slot_ids'][o],
                                    s = !1;
                                if (this['slot_map'][R] && (s = this['slot_map'][R].type, this['slot_map'][R]['item_id'] && (x = this['slot_map'][R]['item_id'])), s)
                                    G.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][R]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](e, 'myres/sushe/icon_random.jpg');
                                else {
                                    var u = cfg['item_definition'].item.get(x);
                                    u ? (G.text = u['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](e, u.icon, null, 'UI_Sushe_Select.Zhuangban')) : (G.text = game['Tools']['strOfLocalization'](this['cell_names'][o]), game['LoadMgr']['setImgSkin'](e, this['cell_default_img'][o], null, 'UI_Sushe_Select.Zhuangban'));
                                }
                                var n = y['getChildByName']('btn');
                                n['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        S['locking'] || S['select_index'] != o && (S['onChangeSlotSelect'](o), S['scrollview']['wantToRefreshAll']());
                                    }, null, !1),
                                    n['mouseEnabled'] = this['select_index'] != o;
                            },
                            V['prototype']['close'] = function(S) {
                                var V = this;
                                this['container_zhuangban0']['visible'] && (S ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (Z['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), Z['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function() {
                                    V['page_items']['close'](),
                                        V['page_desktop']['close'](),
                                        V['page_headframe']['close'](),
                                        V['page_bgm']['close'](),
                                        V['container_zhuangban0']['visible'] = !1,
                                        V['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                }))));
                            },
                            V['prototype']['onChangeGameView'] = function() {
                                // 保存装扮页
                                MMP.settings.using_commonview_index = Z.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                // END
                                Z['UI_Sushe']['randomDesktopID'](),
                                    GameMgr.Inst['load_mjp_view']();
                                var S = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                                Z['UI_Lite_Loading'].Inst.show(),
                                    game['Scene_Lobby'].Inst['set_lobby_bg'](S, Laya['Handler']['create'](this, function() {
                                        Z['UI_Lite_Loading'].Inst['enable'] && Z['UI_Lite_Loading'].Inst['close']();
                                    })),
                                    GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                            },
                            V['prototype']['setRandomGray'] = function(S) {
                                this['btn_random']['visible'] = !S,
                                    this['random']['filters'] = S ? [new Laya['ColorFilter'](Z['GRAY_FILTER'])] : [];
                            },
                            V['prototype']['getShowSlotInfo'] = function() {
                                return this['slot_map'][this['slot_ids'][this['select_index']]];
                            },
                            V;
                    }
                    ();
                S['Container_Zhuangban'] = V;
            }
            (S = Z['zhuangban'] || (Z['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));






        // 设置称号
        ! function(Z) {
            var S = function(S) {
                    function V() {
                        var Z = S.call(this, new ui['lobby']['titlebookUI']()) || this;
                        return Z['_root'] = null,
                            Z['_scrollview'] = null,
                            Z['_blackmask'] = null,
                            Z['_locking'] = !1,
                            Z['_showindexs'] = [],
                            V.Inst = Z,
                            Z;
                    }
                    return __extends(V, S),
                        V.Init = function() {
                            var S = this;
                            // 获取称号
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (V, o) {
                            //     if (V || o['error'])
                            //         Z['UIMgr'].Inst['showNetReqError']('fetchTitleList', V, o);
                            //     else {
                            S['owned_title'] = [];
                            //         for (var y = 0; y < o['title_list']['length']; y++) {
                            for (let title of cfg.item_definition.title.rows_) {
                                var G = title.id;
                                cfg['item_definition']['title'].get(G) && S['owned_title'].push(G),
                                    '600005' == G && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    G >= '600005' && '600015' >= G && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + G - '600005', 1);
                            }
                            //     }
                            // });
                        },
                        V['title_update'] = function(S) {
                            for (var V = 0; V < S['new_titles']['length']; V++)
                                cfg['item_definition']['title'].get(S['new_titles'][V]) && this['owned_title'].push(S['new_titles'][V]), '600005' == S['new_titles'][V] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), S['new_titles'][V] >= '600005' && S['new_titles'][V] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + S['new_titles'][V] - '600005', 1);
                            if (S['remove_titles'] && S['remove_titles']['length'] > 0) {
                                for (var V = 0; V < S['remove_titles']['length']; V++) {
                                    for (var o = S['remove_titles'][V], y = 0; y < this['owned_title']['length']; y++)
                                        if (this['owned_title'][y] == o) {
                                            this['owned_title'][y] = this['owned_title'][this['owned_title']['length'] - 1],
                                                this['owned_title'].pop();
                                            break;
                                        }
                                    o == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', Z['UI_Lobby'].Inst['enable'] && Z['UI_Lobby'].Inst.top['refresh'](), Z['UI_PlayerInfo'].Inst['enable'] && Z['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                                }
                                this.Inst['enable'] && this.Inst.show();
                            }
                        },
                        V['prototype']['onCreate'] = function() {
                            var S = this;
                            this['_root'] = this.me['getChildByName']('root'),
                                this['_blackmask'] = new Z['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function() {
                                    return S['_locking'];
                                }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                                this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                                this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(Z) {
                                    S['setItemValue'](Z['index'], Z['container']);
                                }, null, !1)),
                                this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    S['_locking'] || (S['_blackmask'].hide(), S['close']());
                                }, null, !1),
                                this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                        },
                        V['prototype'].show = function() {
                            var S = this;
                            if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), V['owned_title']['length'] > 0) {
                                this['_showindexs'] = [];
                                for (var o = 0; o < V['owned_title']['length']; o++)
                                    this['_showindexs'].push(o);
                                this['_showindexs'] = this['_showindexs'].sort(function(Z, S) {
                                        var o = Z,
                                            y = cfg['item_definition']['title'].get(V['owned_title'][Z]);
                                        y && (o += 1000 * y['priority']);
                                        var G = S,
                                            e = cfg['item_definition']['title'].get(V['owned_title'][S]);
                                        return e && (G += 1000 * e['priority']),
                                            G - o;
                                    }),
                                    this['_scrollview']['reset'](),
                                    this['_scrollview']['addItem'](V['owned_title']['length']),
                                    this['_scrollview'].me['visible'] = !0,
                                    this['_noinfo']['visible'] = !1;
                            } else
                                this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                            Z['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function() {
                                S['_locking'] = !1;
                            }));
                        },
                        V['prototype']['close'] = function() {
                            var S = this;
                            this['_locking'] = !0,
                                Z['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function() {
                                    S['_locking'] = !1,
                                        S['enable'] = !1;
                                }));
                        },
                        V['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                        },
                        V['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                                this['_scrollview']['reset']();
                        },
                        V['prototype']['setItemValue'] = function(Z, S) {
                            var o = this;
                            if (this['enable']) {
                                var y = V['owned_title'][this['_showindexs'][Z]],
                                    G = cfg['item_definition']['title'].find(y);
                                game['LoadMgr']['setImgSkin'](S['getChildByName']('img_title'), G.icon, null, 'UI_TitleBook'),
                                    S['getChildByName']('using')['visible'] = y == GameMgr.Inst['account_data']['title'],
                                    S['getChildByName']('desc').text = G['desc_' + GameMgr['client_language']];
                                var e = S['getChildByName']('btn');
                                e['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    y != GameMgr.Inst['account_data']['title'] ? (o['changeTitle'](Z), S['getChildByName']('using')['visible'] = !0) : (o['changeTitle'](-1), S['getChildByName']('using')['visible'] = !1);
                                }, null, !1);
                                var x = S['getChildByName']('time'),
                                    R = S['getChildByName']('img_title');
                                if (1 == G['unlock_type']) {
                                    var s = G['unlock_param'][0],
                                        u = cfg['item_definition'].item.get(s);
                                    x.text = game['Tools']['strOfLocalization'](3121) + u['expire_desc_' + GameMgr['client_language']],
                                        x['visible'] = !0,
                                        R.y = 0;
                                } else
                                    x['visible'] = !1, R.y = 10;
                            }
                        },
                        V['prototype']['changeTitle'] = function(S) {
                            var o = this,
                                y = GameMgr.Inst['account_data']['title'],
                                G = 0;
                            G = S >= 0 && S < this['_showindexs']['length'] ? V['owned_title'][this['_showindexs'][S]] : '600001',
                                GameMgr.Inst['account_data']['title'] = G;
                            for (var e = -1, x = 0; x < this['_showindexs']['length']; x++)
                                if (y == V['owned_title'][this['_showindexs'][x]]) {
                                    e = x;
                                    break;
                                }
                            Z['UI_Lobby'].Inst['enable'] && Z['UI_Lobby'].Inst.top['refresh'](),
                                Z['UI_PlayerInfo'].Inst['enable'] && Z['UI_PlayerInfo'].Inst['refreshBaseInfo'](), -1 != e && this['_scrollview']['wantToRefreshItem'](e),
                                // 屏蔽设置称号的网络请求并保存称号
                                MMP.settings.title = g;
                            MMP.saveSettings();
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                            //     title: '600001' == G ? 0 : G
                            // }, function (V, G) {
                            //     (V || G['error']) && (Z['UIMgr'].Inst['showNetReqError']('useTitle', V, G), GameMgr.Inst['account_data']['title'] = y, Z['UI_Lobby'].Inst['enable'] && Z['UI_Lobby'].Inst.top['refresh'](), Z['UI_PlayerInfo'].Inst['enable'] && Z['UI_PlayerInfo'].Inst['refreshBaseInfo'](), o['enable'] && (S >= 0 && S < o['_showindexs']['length'] && o['_scrollview']['wantToRefreshItem'](S), e >= 0 && e < o['_showindexs']['length'] && o['_scrollview']['wantToRefreshItem'](e)));
                            // });
                        },
                        V.Inst = null,
                        V['owned_title'] = [],
                        V;
                }
                (Z['UIBase']);
            Z['UI_TitleBook'] = S;
        }
        (uiscript || (uiscript = {}));




        // 友人房调整装扮
        ! function(Z) {
            var S;
            ! function(S) {
                var V = function() {
                        function V(Z) {
                            this['scrollview'] = null,
                                this['page_skin'] = null,
                                this['chara_infos'] = [],
                                this['choosed_chara_index'] = 0,
                                this['choosed_skin_id'] = 0,
                                this['star_char_count'] = 0,
                                this.me = Z,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                                this['scrollview']['setElastic'](),
                                this['page_skin'] = new S['Page_Skin'](this.me['getChildByName']('right'));
                        }
                        return V['prototype'].show = function(S) {
                                var V = this;
                                this.me['visible'] = !0,
                                    S ? this.me['alpha'] = 1 : Z['UIBase']['anim_alpha_in'](this.me, {
                                        x: 0
                                    }, 200, 0),
                                    this['choosed_chara_index'] = 0,
                                    this['chara_infos'] = [];
                                for (var o = 0, y = Z['UI_Sushe']['star_chars']; o < y['length']; o++)
                                    for (var G = y[o], e = 0; e < Z['UI_Sushe']['characters']['length']; e++)
                                        if (!Z['UI_Sushe']['hidden_characters_map'][G] && Z['UI_Sushe']['characters'][e]['charid'] == G) {
                                            this['chara_infos'].push({
                                                    chara_id: Z['UI_Sushe']['characters'][e]['charid'],
                                                    skin_id: Z['UI_Sushe']['characters'][e].skin,
                                                    is_upgraded: Z['UI_Sushe']['characters'][e]['is_upgraded']
                                                }),
                                                Z['UI_Sushe']['main_character_id'] == Z['UI_Sushe']['characters'][e]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                            break;
                                        }
                                this['star_char_count'] = this['chara_infos']['length'];
                                for (var e = 0; e < Z['UI_Sushe']['characters']['length']; e++)
                                    Z['UI_Sushe']['hidden_characters_map'][Z['UI_Sushe']['characters'][e]['charid']] || -1 == Z['UI_Sushe']['star_chars']['indexOf'](Z['UI_Sushe']['characters'][e]['charid']) && (this['chara_infos'].push({
                                        chara_id: Z['UI_Sushe']['characters'][e]['charid'],
                                        skin_id: Z['UI_Sushe']['characters'][e].skin,
                                        is_upgraded: Z['UI_Sushe']['characters'][e]['is_upgraded']
                                    }), Z['UI_Sushe']['main_character_id'] == Z['UI_Sushe']['characters'][e]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                                this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                                    this['scrollview']['reset'](),
                                    this['scrollview']['addItem'](this['chara_infos']['length']);
                                var x = this['chara_infos'][this['choosed_chara_index']];
                                this['page_skin'].show(x['chara_id'], x['skin_id'], Laya['Handler']['create'](this, function(Z) {
                                    V['choosed_skin_id'] = Z,
                                        x['skin_id'] = Z,
                                        V['scrollview']['wantToRefreshItem'](V['choosed_chara_index']);
                                }, null, !1));
                            },
                            V['prototype']['render_character_cell'] = function(S) {
                                var V = this,
                                    o = S['index'],
                                    y = S['container'],
                                    G = S['cache_data'];
                                G['index'] = o;
                                var e = this['chara_infos'][o];
                                G['inited'] || (G['inited'] = !0, G.skin = new Z['UI_Character_Skin'](y['getChildByName']('btn')['getChildByName']('head')), G['bound'] = y['getChildByName']('btn')['getChildByName']('bound'));
                                var x = y['getChildByName']('btn');
                                x['getChildByName']('choose')['visible'] = o == this['choosed_chara_index'],
                                    G.skin['setSkin'](e['skin_id'], 'bighead'),
                                    x['getChildByName']('using')['visible'] = o == this['choosed_chara_index'];
                                var R = cfg['item_definition']['character'].find(e['chara_id']),
                                    s = R['name_' + GameMgr['client_language'] + '2'] ? R['name_' + GameMgr['client_language'] + '2'] : R['name_' + GameMgr['client_language']],
                                    u = x['getChildByName']('label_name');
                                if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                    u.text = s['replace']('-', '|')['replace'](/\./g, '·');
                                    var n = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                    u['leading'] = n.test(s) ? -15 : 0;
                                } else
                                    u.text = s;
                                x['getChildByName']('star') && (x['getChildByName']('star')['visible'] = o < this['star_char_count']);
                                var k = cfg['item_definition']['character'].get(e['chara_id']);
                                'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? G['bound'].skin = k.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (e['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (e['is_upgraded'] ? '2.png' : '.png')) : k.ur ? (G['bound'].pos(-10, -2), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (e['is_upgraded'] ? '6.png' : '5.png'))) : (G['bound'].pos(4, 20), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (e['is_upgraded'] ? '4.png' : '3.png'))),
                                    x['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (e['is_upgraded'] ? '2.png' : '.png')),
                                    y['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                        if (o != V['choosed_chara_index']) {
                                            var Z = V['choosed_chara_index'];
                                            V['choosed_chara_index'] = o,
                                                V['choosed_skin_id'] = e['skin_id'],
                                                V['page_skin'].show(e['chara_id'], e['skin_id'], Laya['Handler']['create'](V, function(Z) {
                                                    V['choosed_skin_id'] = Z,
                                                        e['skin_id'] = Z,
                                                        G.skin['setSkin'](Z, 'bighead');
                                                }, null, !1)),
                                                V['scrollview']['wantToRefreshItem'](Z),
                                                V['scrollview']['wantToRefreshItem'](o);
                                        }
                                    });
                            },
                            V['prototype']['close'] = function(S) {
                                var V = this;
                                if (this.me['visible'])
                                    if (S)
                                        this.me['visible'] = !1;
                                    else {
                                        var o = this['chara_infos'][this['choosed_chara_index']];
                                        //把chartid和skin写入cookie
                                        MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                        MMP.saveSettings();
                                        // End
                                        // 友人房调整装扮
                                        // o['chara_id'] != Z['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //         character_id: o['chara_id']
                                        //     }, function () {}), 
                                        Z['UI_Sushe']['main_character_id'] = o['chara_id'];
                                        // this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                        //     character_id: o['chara_id'],
                                        //     skin: this['choosed_skin_id']
                                        // }, function () {});
                                        // END
                                        for (var y = 0; y < Z['UI_Sushe']['characters']['length']; y++)
                                            if (Z['UI_Sushe']['characters'][y]['charid'] == o['chara_id']) {
                                                Z['UI_Sushe']['characters'][y].skin = this['choosed_skin_id'];
                                                break;
                                            }
                                        GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                            Z['UI_Sushe']['onMainSkinChange'](),
                                            Z['UIBase']['anim_alpha_out'](this.me, {
                                                x: 0
                                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                                V.me['visible'] = !1;
                                            }));
                                    }
                            },
                            V;
                    }
                    ();
                S['Page_Waiting_Head'] = V;
            }
            (S = Z['zhuangban'] || (Z['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));





        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function() {
            var Z = GameMgr;
            var S = GameMgr.Inst;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function(V, o) {
                if (V || o['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', V, o);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](o)),
                        Z.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    o.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    o.account.title = GameMgr.Inst.account_data.title;
                    o.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        o.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var y in o['account']) {
                        if (Z.Inst['account_data'][y] = o['account'][y], 'platform_diamond' == y)
                            for (var G = o['account'][y], e = 0; e < G['length']; e++)
                                S['account_numerical_resource'][G[e].id] = G[e]['count'];
                        if ('skin_ticket' == y && (Z.Inst['account_numerical_resource']['100004'] = o['account'][y]), 'platform_skin_ticket' == y)
                            for (var G = o['account'][y], e = 0; e < G['length']; e++)
                                S['account_numerical_resource'][G[e].id] = G[e]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        o['account']['room_id'] && Z.Inst['updateRoom'](),
                        '10102' === Z.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === Z.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }



        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function(S, V, o) {
            (GM_xmlhttpRequest({
                method: 'post',
                url: MMP.settings.sendGameURL,
                data: JSON.stringify({
                    'current_record_uuid': S,
                    'account_id': parseInt(V.toString())
                }),
                onload: function(msg) {
                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                        'current_record_uuid': S,
                        'account_id': parseInt(V.toString())
                    }));
                }
            }));
            var y = GameMgr.Inst;
            var Z = GameMgr;
            return S = S.trim(),
                app.Log.log('checkPaiPu game_uuid:' + S + ' account_id:' + V['toString']() + ' paipu_config:' + o),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), Z.Inst['onLoadStart']('paipu'), 2 & o && (S = game['Tools']['DecodePaipuUUID'](S)), this['record_uuid'] = S, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: S,
                    client_version_string: this['getClientVersion']()
                }, function(Z, G) {
                    if (Z || G['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', Z, G);
                        var e = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](e);
                        var x = function() {
                            return e += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, e)),
                                e >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, x), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, y, x),
                            y['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': G.head
                                }),
                                onload: function(msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': G.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var R = G.head,
                            s = [null, null, null, null],
                            u = game['Tools']['strOfLocalization'](2003),
                            n = R['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                                game_uuid: S,
                                client_version_string: y['getClientVersion']()
                            }, function() {}),
                            n['extendinfo'] && (u = game['Tools']['strOfLocalization'](2004)),
                            n['detail_rule'] && n['detail_rule']['ai_level'] && (1 === n['detail_rule']['ai_level'] && (u = game['Tools']['strOfLocalization'](2003)), 2 === n['detail_rule']['ai_level'] && (u = game['Tools']['strOfLocalization'](2004)));
                        var k = !1;
                        R['end_time'] ? (y['record_end_time'] = R['end_time'], R['end_time'] > '1576112400' && (k = !0)) : y['record_end_time'] = -1,
                            y['record_start_time'] = R['start_time'] ? R['start_time'] : -1;
                        for (var r = 0; r < R['accounts']['length']; r++) {
                            var M = R['accounts'][r];
                            if (M['character']) {
                                var g = M['character'],
                                    K = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (M.account_id == GameMgr.Inst.account_id) {
                                        M.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        M.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        M.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        M.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        M.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            M.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (M.avatar_id == 400101 || M.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            M.avatar_id = skin.id;
                                            M.character.charid = skin.character_id;
                                            M.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(M.account_id);
                                        if (server == 1) {
                                            M.nickname = '[CN]' + M.nickname;
                                        } else if (server == 2) {
                                            M.nickname = '[JP]' + M.nickname;
                                        } else if (server == 3) {
                                            M.nickname = '[EN]' + M.nickname;
                                        } else {
                                            M.nickname = '[??]' + M.nickname;
                                        }
                                    }
                                }
                                // END
                                if (k) {
                                    var Y = M['views'];
                                    if (Y)
                                        for (var j = 0; j < Y['length']; j++)
                                            K[Y[j].slot] = Y[j]['item_id'];
                                } else {
                                    var F = g['views'];
                                    if (F)
                                        for (var j = 0; j < F['length']; j++) {
                                            var w = F[j].slot,
                                                T = F[j]['item_id'],
                                                N = w - 1;
                                            K[N] = T;
                                        }
                                }
                                var O = [];
                                for (var J in K)
                                    O.push({
                                        slot: parseInt(J),
                                        item_id: K[J]
                                    });
                                M['views'] = O,
                                    s[M.seat] = M;
                            } else
                                M['character'] = {
                                    charid: M['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(M['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                M['avatar_id'] = M['character'].skin,
                                M['views'] = [],
                                s[M.seat] = M;
                        }
                        for (var H = game['GameUtility']['get_default_ai_skin'](), f = game['GameUtility']['get_default_ai_character'](), r = 0; r < s['length']; r++)
                            if (null == s[r]) {
                                s[r] = {
                                    nickname: u,
                                    avatar_id: H,
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
                                        skin: H,
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
                                            s[r].avatar_id = skin.id;
                                            s[r].character.charid = skin.character_id;
                                            s[r].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        s[r].nickname = '[BOT]' + s[r].nickname;
                                    }
                                }
                                // END
                            }
                        var i = Laya['Handler']['create'](y, function(Z) {
                                game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                    game['Scene_MJ'].Inst['openMJRoom'](R['config'], s, Laya['Handler']['create'](y, function() {
                                        y['duringPaipu'] = !1,
                                            view['DesktopMgr'].Inst['paipu_config'] = o,
                                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](R['config'])), s, V, view['EMJMode']['paipu'], Laya['Handler']['create'](y, function() {
                                                uiscript['UI_Replay'].Inst['initData'](Z),
                                                    uiscript['UI_Replay'].Inst['enable'] = !0,
                                                    Laya['timer'].once(1000, y, function() {
                                                        y['EnterMJ']();
                                                    }),
                                                    Laya['timer'].once(1500, y, function() {
                                                        view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                            uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                            uiscript['UI_Loading'].Inst['close']();
                                                    }),
                                                    Laya['timer'].once(1000, y, function() {
                                                        uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                    });
                                            }));
                                    }), Laya['Handler']['create'](y, function(Z) {
                                        return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * Z);
                                    }, null, !1));
                            }),
                            z = {};
                        if (z['record'] = R, G.data && G.data['length'])
                            z.game = net['MessageWrapper']['decodeMessage'](G.data), i['runWith'](z);
                        else {
                            var d = G['data_url'];
                            game['LoadMgr']['httpload'](d, 'arraybuffer', !1, Laya['Handler']['create'](y, function(Z) {
                                if (Z['success']) {
                                    var S = new Laya.Byte();
                                    S['writeArrayBuffer'](Z.data);
                                    var V = net['MessageWrapper']['decodeMessage'](S['getUint8Array'](0, S['length']));
                                    z.game = V,
                                        i['runWith'](z);
                                } else
                                    uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + G['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), y['duringPaipu'] = !1;
                            }));
                        }
                    }
                }), void 0);
        }




        // 牌谱功能
        ! function(Z) {
            var S = function() {
                    function S(Z) {
                        var S = this;
                        this.me = Z,
                            this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                S['locking'] || S.hide(null);
                            }),
                            this['title'] = this.me['getChildByName']('title'),
                            this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                            this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                            this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                            this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                            this.me['visible'] = !1,
                            this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                S['locking'] || S.hide(null);
                            }, null, !1),
                            this['container_hidename'] = this.me['getChildByName']('hidename'),
                            this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['removeChildAt']('checkbox');
                        var V = this['container_hidename']['getChildByName']('w0'),
                            o = this['container_hidename']['getChildByName']('w1');
                        o.x = V.x + V['textField']['textWidth'] + 10,
                            this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                S['sp_checkbox']['visible'] = !S['sp_checkbox']['visible'],
                                    S['refresh_share_uuid']();
                            });
                    }
                    return S['prototype']['show_share'] = function(S) {
                            var V = this;
                            this['title'].text = game['Tools']['strOfLocalization'](2124),
                                this['sp_checkbox']['visible'] = !1,
                                this['btn_confirm']['visible'] = !1,
                                this['input']['editable'] = !1,
                                this.uuid = S,
                                this['refresh_share_uuid'](),
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['container_hidename']['visible'] = !0,
                                this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                                Z['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                    V['locking'] = !1;
                                }));
                        },
                        S['prototype']['refresh_share_uuid'] = function() {
                            var Z = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                                S = this.uuid,
                                V = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + V + '?paipu=' + game['Tools']['EncodePaipuUUID'](S) + '_a' + Z + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + V + '?paipu=' + S + '_a' + Z;
                        },
                        S['prototype']['show_check'] = function() {
                            var S = this;
                            return Z['UI_PiPeiYuYue'].Inst['enable'] ? (Z['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                return S['input'].text ? (S.hide(Laya['Handler']['create'](S, function() {
                                    var Z = S['input'].text['split']('='),
                                        V = Z[Z['length'] - 1]['split']('_'),
                                        o = 0;
                                    V['length'] > 1 && (o = 'a' == V[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(V[1]['substr'](1))) : parseInt(V[1]));
                                    var y = 0;
                                    if (V['length'] > 2) {
                                        var G = parseInt(V[2]);
                                        G && (y = G);
                                    }
                                    GameMgr.Inst['checkPaiPu'](V[0], o, y);
                                })), void 0) : (Z['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                            }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, Z['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                S['locking'] = !1;
                            })), void 0);
                        },
                        S['prototype'].hide = function(S) {
                            var V = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function() {
                                    V['locking'] = !1,
                                        V.me['visible'] = !1,
                                        S && S.run();
                                }));
                        },
                        S;
                }
                (),
                V = function() {
                    function S(Z) {
                        var S = this;
                        this.me = Z,
                            this['blackbg'] = Z['getChildByName']('blackbg'),
                            this.root = Z['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                S['locking'] || S['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function() {
                                S['locking'] || (game['Tools']['calu_word_length'](S['input'].text) > 30 ? S['toolong']['visible'] = !0 : (S['close'](), G['addCollect'](S.uuid, S['start_time'], S['end_time'], S['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return S['prototype'].show = function(S, V, o) {
                            var y = this;
                            this.uuid = S,
                                this['start_time'] = V,
                                this['end_time'] = o,
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['input'].text = '',
                                this['toolong']['visible'] = !1,
                                this['blackbg']['alpha'] = 0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0.5
                                }, 150),
                                Z['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    y['locking'] = !1;
                                }));
                        },
                        S['prototype']['close'] = function() {
                            var S = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                Z['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    S['locking'] = !1,
                                        S.me['visible'] = !1;
                                }));
                        },
                        S;
                }
                ();
            Z['UI_Pop_CollectInput'] = V;
            var o;
            ! function(Z) {
                Z[Z.ALL = 0] = 'ALL',
                    Z[Z['FRIEND'] = 1] = 'FRIEND',
                    Z[Z.RANK = 2] = 'RANK',
                    Z[Z['MATCH'] = 4] = 'MATCH',
                    Z[Z['COLLECT'] = 100] = 'COLLECT';
            }
            (o || (o = {}));
            var y = function() {
                    function S(Z) {
                        this['uuid_list'] = [],
                            this.type = Z,
                            this['reset']();
                    }
                    return S['prototype']['reset'] = function() {
                            this['count'] = 0,
                                this['true_count'] = 0,
                                this['have_more_paipu'] = !0,
                                this['uuid_list'] = [],
                                this['duringload'] = !1;
                        },
                        S['prototype']['loadList'] = function() {
                            var S = this;
                            if (!this['duringload'] && this['have_more_paipu']) {
                                if (this['duringload'] = !0, this.type == o['COLLECT']) {
                                    for (var V = [], y = 0, e = 0; 10 > e; e++) {
                                        var x = this['count'] + e;
                                        if (x >= G['collect_lsts']['length'])
                                            break;
                                        y++;
                                        var R = G['collect_lsts'][x];
                                        G['record_map'][R] || V.push(R),
                                            this['uuid_list'].push(R);
                                    }
                                    V['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                        uuid_list: V
                                    }, function(o, e) {
                                        if (S['duringload'] = !1, G.Inst['onLoadStateChange'](S.type, !1), o || e['error'])
                                            Z['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', o, e);
                                        else if (app.Log.log(JSON['stringify'](e)), e['record_list'] && e['record_list']['length'] == V['length']) {
                                            for (var x = 0; x < e['record_list']['length']; x++) {
                                                var R = e['record_list'][x].uuid;
                                                G['record_map'][R] || (G['record_map'][R] = e['record_list'][x]);
                                            }
                                            S['count'] += y,
                                                S['count'] >= G['collect_lsts']['length'] && (S['have_more_paipu'] = !1, G.Inst['onLoadOver'](S.type)),
                                                G.Inst['onLoadMoreLst'](S.type, y);
                                        } else
                                            S['have_more_paipu'] = !1, G.Inst['onLoadOver'](S.type);
                                    }) : (this['duringload'] = !1, this['count'] += y, this['count'] >= G['collect_lsts']['length'] && (this['have_more_paipu'] = !1, G.Inst['onLoadOver'](this.type)), G.Inst['onLoadMoreLst'](this.type, y));
                                } else
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                        start: this['true_count'],
                                        count: 10,
                                        type: this.type
                                    }, function(V, y) {
                                        if (S['duringload'] = !1, G.Inst['onLoadStateChange'](S.type, !1), V || y['error'])
                                            Z['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', V, y);
                                        else if (app.Log.log(JSON['stringify'](y)), y['record_list'] && y['record_list']['length'] > 0) {
                                            // START
                                            if (MMP.settings.sendGame == true) {
                                                (GM_xmlhttpRequest({
                                                    method: 'post',
                                                    url: MMP.settings.sendGameURL,
                                                    data: JSON.stringify(y),
                                                    onload: function(msg) {
                                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(y));
                                                    }
                                                }));
                                                for (let record_list of y['record_list']) {
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
                                            for (var e = y['record_list'], x = 0, R = 0; R < e['length']; R++) {
                                                var s = e[R].uuid;
                                                if (S.type == o.RANK && e[R]['config'] && e[R]['config'].meta) {
                                                    var u = e[R]['config'].meta;
                                                    if (u) {
                                                        var n = cfg['desktop']['matchmode'].get(u['mode_id']);
                                                        if (n && 5 == n.room)
                                                            continue;
                                                    }
                                                }
                                                x++,
                                                S['uuid_list'].push(s),
                                                    G['record_map'][s] || (G['record_map'][s] = e[R]);
                                            }
                                            S['count'] += x,
                                                S['true_count'] += e['length'],
                                                G.Inst['onLoadMoreLst'](S.type, x),
                                                S['have_more_paipu'] = !0;
                                        } else
                                            S['have_more_paipu'] = !1, G.Inst['onLoadOver'](S.type);
                                    });
                                Laya['timer'].once(700, this, function() {
                                    S['duringload'] && G.Inst['onLoadStateChange'](S.type, !0);
                                });
                            }
                        },
                        S['prototype']['removeAt'] = function(Z) {
                            for (var S = 0; S < this['uuid_list']['length'] - 1; S++)
                                S >= Z && (this['uuid_list'][S] = this['uuid_list'][S + 1]);
                            this['uuid_list'].pop(),
                                this['count']--,
                                this['true_count']--;
                        },
                        S;
                }
                (),
                G = function(G) {
                    function e() {
                        var Z = G.call(this, new ui['lobby']['paipuUI']()) || this;
                        return Z.top = null,
                            Z['container_scrollview'] = null,
                            Z['scrollview'] = null,
                            Z['loading'] = null,
                            Z.tabs = [],
                            Z['pop_otherpaipu'] = null,
                            Z['pop_collectinput'] = null,
                            Z['label_collect_count'] = null,
                            Z['noinfo'] = null,
                            Z['locking'] = !1,
                            Z['current_type'] = o.ALL,
                            e.Inst = Z,
                            Z;
                    }
                    return __extends(e, G),
                        e.init = function() {
                            var Z = this;
                            this['paipuLst'][o.ALL] = new y(o.ALL),
                                this['paipuLst'][o['FRIEND']] = new y(o['FRIEND']),
                                this['paipuLst'][o.RANK] = new y(o.RANK),
                                this['paipuLst'][o['MATCH']] = new y(o['MATCH']),
                                this['paipuLst'][o['COLLECT']] = new y(o['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function(S, V) {
                                    if (S || V['error']);
                                    else {
                                        if (V['record_list']) {
                                            for (var o = V['record_list'], y = 0; y < o['length']; y++) {
                                                var G = {
                                                    uuid: o[y].uuid,
                                                    time: o[y]['end_time'],
                                                    remarks: o[y]['remarks']
                                                };
                                                Z['collect_lsts'].push(G.uuid),
                                                    Z['collect_info'][G.uuid] = G;
                                            }
                                            Z['collect_lsts'] = Z['collect_lsts'].sort(function(S, V) {
                                                return Z['collect_info'][V].time - Z['collect_info'][S].time;
                                            });
                                        }
                                        V['record_collect_limit'] && (Z['collect_limit'] = V['record_collect_limit']);
                                    }
                                });
                        },
                        e['onAccountUpdate'] = function() {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        e['reset'] = function() {
                            this['paipuLst'][o.ALL] && this['paipuLst'][o.ALL]['reset'](),
                                this['paipuLst'][o['FRIEND']] && this['paipuLst'][o['FRIEND']]['reset'](),
                                this['paipuLst'][o.RANK] && this['paipuLst'][o.RANK]['reset'](),
                                this['paipuLst'][o['MATCH']] && this['paipuLst'][o['MATCH']]['reset']();
                        },
                        e['addCollect'] = function(S, V, o, y) {
                            var G = this;
                            if (!this['collect_info'][S]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return Z['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: S,
                                    remarks: y,
                                    start_time: V,
                                    end_time: o
                                }, function() {});
                                var x = {
                                    uuid: S,
                                    remarks: y,
                                    time: o
                                };
                                this['collect_info'][S] = x,
                                    this['collect_lsts'].push(S),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(Z, S) {
                                        return G['collect_info'][S].time - G['collect_info'][Z].time;
                                    }),
                                    Z['UI_DesktopInfo'].Inst && Z['UI_DesktopInfo'].Inst['enable'] && Z['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    e.Inst && e.Inst['enable'] && e.Inst['onCollectChange'](S, -1);
                            }
                        },
                        e['removeCollect'] = function(S) {
                            var V = this;
                            if (this['collect_info'][S]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                        uuid: S
                                    }, function() {}),
                                    delete this['collect_info'][S];
                                for (var o = -1, y = 0; y < this['collect_lsts']['length']; y++)
                                    if (this['collect_lsts'][y] == S) {
                                        this['collect_lsts'][y] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            o = y;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(Z, S) {
                                        return V['collect_info'][S].time - V['collect_info'][Z].time;
                                    }),
                                    Z['UI_DesktopInfo'].Inst && Z['UI_DesktopInfo'].Inst['enable'] && Z['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    e.Inst && e.Inst['enable'] && e.Inst['onCollectChange'](S, o);
                            }
                        },
                        e['prototype']['onCreate'] = function() {
                            var o = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    o['locking'] || o['close'](Laya['Handler']['create'](o, function() {
                                        Z['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(Z) {
                                    o['setItemValue'](Z['index'], Z['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function() {
                                    var Z = e['paipuLst'][o['current_type']];
                                    (1 - o['scrollview'].rate) * Z['count'] < 3 && (Z['duringload'] || (Z['have_more_paipu'] ? Z['loadList']() : 0 == Z['count'] && (o['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    o['pop_otherpaipu'].me['visible'] || o['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var y = 0; 5 > y; y++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](y)), this.tabs[y]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [y, !1]);
                            this['pop_otherpaipu'] = new S(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new V(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        e['prototype'].show = function() {
                            var S = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                Z['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                Z['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function() {
                                    S['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = e['collect_lsts']['length']['toString']() + '/' + e['collect_limit']['toString']();
                        },
                        e['prototype']['close'] = function(S) {
                            var V = this;
                            this['locking'] = !0,
                                Z['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                Z['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function() {
                                    V['locking'] = !1,
                                        V['enable'] = !1,
                                        S && S.run();
                                });
                        },
                        e['prototype']['changeTab'] = function(Z, S) {
                            var V = [o.ALL, o.RANK, o['FRIEND'], o['MATCH'], o['COLLECT']];
                            if (S || V[Z] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = V[Z], this['current_type'] == o['COLLECT'] && e['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != o['COLLECT']) {
                                    var y = e['paipuLst'][this['current_type']]['count'];
                                    y > 0 && this['scrollview']['addItem'](y);
                                }
                                for (var G = 0; G < this.tabs['length']; G++) {
                                    var x = this.tabs[G];
                                    x['getChildByName']('img').skin = game['Tools']['localUISrc'](Z == G ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        x['getChildByName']('label_name')['color'] = Z == G ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        e['prototype']['setItemValue'] = function(S, V) {
                            var o = this;
                            if (this['enable']) {
                                var y = e['paipuLst'][this['current_type']];
                                if (y || !(S >= y['uuid_list']['length'])) {
                                    for (var G = e['record_map'][y['uuid_list'][S]], x = 0; 4 > x; x++) {
                                        var R = V['getChildByName']('p' + x['toString']());
                                        if (x < G['result']['players']['length']) {
                                            R['visible'] = !0;
                                            var s = R['getChildByName']('chosen'),
                                                u = R['getChildByName']('rank'),
                                                n = R['getChildByName']('rank_word'),
                                                k = R['getChildByName']('name'),
                                                r = R['getChildByName']('score'),
                                                M = G['result']['players'][x];
                                            r.text = M['part_point_1'] || '0';
                                            for (var g = 0, K = game['Tools']['strOfLocalization'](2133), Y = 0, j = !1, F = 0; F < G['accounts']['length']; F++)
                                                if (G['accounts'][F].seat == M.seat) {
                                                    g = G['accounts'][F]['account_id'],
                                                        K = G['accounts'][F]['nickname'],
                                                        Y = G['accounts'][F]['verified'],
                                                        j = G['accounts'][F]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](k, {
                                                    account_id: g,
                                                    nickname: K,
                                                    verified: Y
                                                }),
                                                s['visible'] = j,
                                                r['color'] = j ? '#ffc458' : '#b98930',
                                                k['getChildByName']('name')['color'] = j ? '#dfdfdf' : '#a0a0a0',
                                                n['color'] = u['color'] = j ? '#57bbdf' : '#489dbc';
                                            var w = R['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (x) {
                                                    case 0:
                                                        w.text = 'st';
                                                        break;
                                                    case 1:
                                                        w.text = 'nd';
                                                        break;
                                                    case 2:
                                                        w.text = 'rd';
                                                        break;
                                                    case 3:
                                                        w.text = 'th';
                                                }
                                        } else
                                            R['visible'] = !1;
                                    }
                                    var T = new Date(1000 * G['end_time']),
                                        N = '';
                                    N += T['getFullYear']() + '/',
                                        N += (T['getMonth']() < 9 ? '0' : '') + (T['getMonth']() + 1)['toString']() + '/',
                                        N += (T['getDate']() < 10 ? '0' : '') + T['getDate']() + ' ',
                                        N += (T['getHours']() < 10 ? '0' : '') + T['getHours']() + ':',
                                        N += (T['getMinutes']() < 10 ? '0' : '') + T['getMinutes'](),
                                        V['getChildByName']('date').text = N,
                                        V['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            return o['locking'] ? void 0 : Z['UI_PiPeiYuYue'].Inst['enable'] ? (Z['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](G.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        V['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            o['locking'] || o['pop_otherpaipu'].me['visible'] || (o['pop_otherpaipu']['show_share'](G.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var O = V['getChildByName']('room'),
                                        J = game['Tools']['get_room_desc'](G['config']);
                                    O.text = J.text;
                                    var H = '';
                                    if (1 == G['config']['category'])
                                        H = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == G['config']['category'])
                                        H = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == G['config']['category']) {
                                        var f = G['config'].meta;
                                        if (f) {
                                            var i = cfg['desktop']['matchmode'].get(f['mode_id']);
                                            i && (H = i['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (e['collect_info'][G.uuid]) {
                                        var z = e['collect_info'][G.uuid],
                                            d = V['getChildByName']('remarks_info'),
                                            B = V['getChildByName']('input'),
                                            p = B['getChildByName']('txtinput'),
                                            X = V['getChildByName']('btn_input'),
                                            _ = !1,
                                            P = function() {
                                                _ ? (d['visible'] = !1, B['visible'] = !0, p.text = d.text, X['visible'] = !1) : (d.text = z['remarks'] && '' != z['remarks'] ? game['Tools']['strWithoutForbidden'](z['remarks']) : H, d['visible'] = !0, B['visible'] = !1, X['visible'] = !0);
                                            };
                                        P(),
                                            X['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                _ = !0,
                                                    P();
                                            }, null, !1),
                                            p.on('blur', this, function() {
                                                _ && (game['Tools']['calu_word_length'](p.text) > 30 ? Z['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : p.text != z['remarks'] && (z['remarks'] = p.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                        uuid: G.uuid,
                                                        remarks: p.text
                                                    }, function() {}))),
                                                    _ = !1,
                                                    P();
                                            });
                                        var v = V['getChildByName']('collect');
                                        v['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](o, function() {
                                                    e['removeCollect'](G.uuid);
                                                }));
                                            }, null, !1),
                                            v['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        V['getChildByName']('input')['visible'] = !1,
                                            V['getChildByName']('btn_input')['visible'] = !1,
                                            V['getChildByName']('remarks_info')['visible'] = !0,
                                            V['getChildByName']('remarks_info').text = H;
                                        var v = V['getChildByName']('collect');
                                        v['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                o['pop_collectinput'].show(G.uuid, G['start_time'], G['end_time']);
                                            }, null, !1),
                                            v['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        e['prototype']['onLoadStateChange'] = function(Z, S) {
                            this['current_type'] == Z && (this['loading']['visible'] = S);
                        },
                        e['prototype']['onLoadMoreLst'] = function(Z, S) {
                            this['current_type'] == Z && this['scrollview']['addItem'](S);
                        },
                        e['prototype']['onLoadOver'] = function(Z) {
                            if (this['current_type'] == Z) {
                                var S = e['paipuLst'][this['current_type']];
                                0 == S['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        e['prototype']['onCollectChange'] = function(Z, S) {
                            if (this['current_type'] == o['COLLECT'])
                                S >= 0 && (e['paipuLst'][o['COLLECT']]['removeAt'](S), this['scrollview']['delItem'](S));
                            else
                                for (var V = e['paipuLst'][this['current_type']]['uuid_list'], y = 0; y < V['length']; y++)
                                    if (V[y] == Z) {
                                        this['scrollview']['wantToRefreshItem'](y);
                                        break;
                                    }
                            this['label_collect_count'].text = e['collect_lsts']['length']['toString']() + '/' + e['collect_limit']['toString']();
                        },
                        e.Inst = null,
                        e['paipuLst'] = {},
                        e['collect_lsts'] = [],
                        e['record_map'] = {},
                        e['collect_info'] = {},
                        e['collect_limit'] = 20,
                        e;
                }
                (Z['UIBase']);
            Z['UI_PaiPu'] = G;
        }
        (uiscript || (uiscript = {}));




        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function() {
            var Z = GameMgr;
            var S = this;
            window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''),
                view['BgmListMgr'].init(),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function(Z, V) {
                    Z || V['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', Z, V) : S['server_time_delta'] = 1000 * V['server_time'] - Laya['timer']['currTimer'];
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function(Z, V) {
                    Z || V['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', Z, V) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](V)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, V['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](V['settings']), V['settings']['nickname_setting'] && (S['nickname_replace_enable'] = !!V['settings']['nickname_setting']['enable'], S['nickname_replace_lst'] = V['settings']['nickname_setting']['nicknames'], S['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = V['settings']['allow_modify_nickname']);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function(Z, V) {
                    Z || V['error'] || (S['client_endpoint'] = V['client_endpoint']);
                }),
                app['PlayerBehaviorStatistic'].init(),
                this['account_data']['nickname'] && this['fetch_login_info'](),
                uiscript['UI_Info'].Init(),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(Z) {
                    app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](Z));
                    var V = Z['update'];
                    if (V) {
                        if (V['numerical'])
                            for (var o = 0; o < V['numerical']['length']; o++) {
                                var y = V['numerical'][o].id,
                                    G = V['numerical'][o]['final'];
                                switch (y) {
                                    case '100001':
                                        S['account_data']['diamond'] = G;
                                        break;
                                    case '100002':
                                        S['account_data'].gold = G;
                                        break;
                                    case '100099':
                                        S['account_data'].vip = G,
                                            uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                                }
                                (y >= '101001' || '102999' >= y) && (S['account_numerical_resource'][y] = G);
                            }
                        uiscript['UI_Sushe']['on_data_updata'](V),
                            V['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](V['daily_task']),
                            V['title'] && uiscript['UI_TitleBook']['title_update'](V['title']),
                            V['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](V),
                            (V['activity_task'] || V['activity_period_task'] || V['activity_random_task'] || V['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](V),
                            V['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](V['activity_flip_task']['progresses']),
                            V['activity'] && (V['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](V['activity']['friend_gift_data']), V['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](V['activity']['upgrade_data']), V['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](V['activity']['gacha_data']));
                    }
                }, null, !1)),
                app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function() {
                    uiscript['UI_AnotherLogin'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function() {
                    uiscript['UI_Hanguplogout'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function(Z) {
                    app.Log.log('收到消息：' + JSON['stringify'](Z)),
                        Z.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](Z['content']);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function(Z) {
                    uiscript['UI_Recharge']['open_payment'] = !1,
                        uiscript['UI_Recharge']['payment_info'] = '',
                        uiscript['UI_Recharge']['open_wx'] = !0,
                        uiscript['UI_Recharge']['wx_type'] = 0,
                        uiscript['UI_Recharge']['open_alipay'] = !0,
                        uiscript['UI_Recharge']['alipay_type'] = 0,
                        Z['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](Z['settings']), Z['settings']['nickname_setting'] && (S['nickname_replace_enable'] = !!Z['settings']['nickname_setting']['enable'], S['nickname_replace_lst'] = Z['settings']['nickname_setting']['nicknames'])),
                        uiscript['UI_Change_Nickname']['allow_modify_nickname'] = Z['allow_modify_nickname'];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function(Z) {
                    uiscript['UI_Sushe']['send_gift_limit'] = Z['gift_limit'],
                        game['FriendMgr']['friend_max_count'] = Z['friend_max_count'],
                        uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = Z['zhp_free_refresh_limit'],
                        uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = Z['zhp_cost_refresh_limit'],
                        uiscript['UI_PaiPu']['collect_limit'] = Z['record_collect_limit'];
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function(Z) {
                    uiscript['UI_Guajichenfa'].Inst.show(Z);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function(Z) {
                    S['auth_check_id'] = Z['check_id'],
                        S['auth_nc_retry_count'] = 0,
                        4 == Z.type ? S['showNECaptcha']() : 2 == Z.type ? S['checkNc']() : S['checkNvc']();
                })),
                Laya['timer'].loop(360000, this, function() {
                    if (game['LobbyNetMgr'].Inst.isOK) {
                        var Z = (Laya['timer']['currTimer'] - S['_last_heatbeat_time']) / 1000;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                                no_operation_counter: Z
                            }, function() {}),
                            Z >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                    }
                }),
                Laya['timer'].loop(1000, this, function() {
                    var Z = Laya['stage']['getMousePoint']();
                    (Z.x != S['_pre_mouse_point'].x || Z.y != S['_pre_mouse_point'].y) && (S['clientHeatBeat'](), S['_pre_mouse_point'].x = Z.x, S['_pre_mouse_point'].y = Z.y);
                }),
                Laya['timer'].loop(1000, this, function() {
                    Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
                }),
                'kr' == Z['client_type'] && Laya['timer'].loop(3600000, this, function() {
                    S['showKrTip'](!1, null);
                }),
                uiscript['UI_RollNotice'].init();
        }




        // 设置状态
        ! function(Z) {
            var S = function() {
                    function Z(S) {
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
                            Z.Inst = this,
                            this.me = S,
                            this['_container_c0'] = this.me['getChildByName']('c0');
                        for (var V = 0; 3 > V; V++)
                            this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + V));
                        this['_container_c1'] = this.me['getChildByName']('c1');
                        for (var V = 0; 3 > V; V++)
                            this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + V));
                        for (var V = 0; 2 > V; V++)
                            this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + V));
                        this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                            this.me['visible'] = !1;
                    }
                    return Object['defineProperty'](Z['prototype'], 'timeuse', {
                            get: function() {
                                return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Z['prototype']['reset'] = function() {
                            this.me['visible'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        Z['prototype']['showCD'] = function(Z, S) {
                            var V = this;
                            this.me['visible'] = !0,
                                this['_start'] = Laya['timer']['currTimer'],
                                this._fix = Math['floor'](Z / 1000),
                                this._add = Math['floor'](S / 1000),
                                this['_pre_sec'] = -1,
                                this['_pre_time'] = Laya['timer']['currTimer'],
                                this['_show'](),
                                Laya['timer']['frameLoop'](1, this, function() {
                                    var Z = Laya['timer']['currTimer'] - V['_pre_time'];
                                    V['_pre_time'] = Laya['timer']['currTimer'],
                                        view['DesktopMgr'].Inst['timestoped'] ? V['_start'] += Z : V['_show']();
                                });
                        },
                        Z['prototype']['close'] = function() {
                            this['reset']();
                        },
                        Z['prototype']['_show'] = function() {
                            var Z = this._fix + this._add - this['timeuse'];
                            if (0 >= Z)
                                return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                            if (Z != this['_pre_sec']) {
                                if (this['_pre_sec'] = Z, Z > this._add) {
                                    for (var S = (Z - this._add)['toString'](), V = 0; V < this['_img_countdown_c0']['length']; V++)
                                        this['_img_countdown_c0'][V]['visible'] = V < S['length'];
                                    if (3 == S['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[2] + '.png')) : 2 == S['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + S[0] + '.png'), 0 != this._add) {
                                        this['_img_countdown_plus']['visible'] = !0;
                                        for (var o = this._add['toString'](), V = 0; V < this['_img_countdown_add']['length']; V++) {
                                            var y = this['_img_countdown_add'][V];
                                            V < o['length'] ? (y['visible'] = !0, y.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + o[V] + '.png')) : y['visible'] = !1;
                                        }
                                    } else {
                                        this['_img_countdown_plus']['visible'] = !1;
                                        for (var V = 0; V < this['_img_countdown_add']['length']; V++)
                                            this['_img_countdown_add'][V]['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var S = Z['toString'](), V = 0; V < this['_img_countdown_c0']['length']; V++)
                                        this['_img_countdown_c0'][V]['visible'] = V < S['length'];
                                    3 == S['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[2] + '.png')) : 2 == S['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + S[0] + '.png');
                                }
                                if (Z > 3) {
                                    this['_container_c1']['visible'] = !1;
                                    for (var V = 0; V < this['_img_countdown_c0']['length']; V++)
                                        this['_img_countdown_c0'][V]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                } else {
                                    view['AudioMgr']['PlayAudio'](205),
                                        this['_container_c1']['visible'] = !0;
                                    for (var V = 0; V < this['_img_countdown_c0']['length']; V++)
                                        this['_img_countdown_c0'][V]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                    for (var V = 0; V < this['_img_countdown_c1']['length']; V++)
                                        this['_img_countdown_c1'][V]['visible'] = this['_img_countdown_c0'][V]['visible'], this['_img_countdown_c1'][V].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][V].skin);
                                    e.Inst.me.cd1.play(0, !1);
                                }
                            }
                        },
                        Z.Inst = null,
                        Z;
                }
                (),
                V = function() {
                    function Z(Z) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = Z;
                    }
                    return Z['prototype']['begin_refresh'] = function() {
                            this['timer_id'] && clearTimeout(this['timer_id']),
                                this['last_returned'] = !0,
                                this['_loop_refresh_delay'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer'].loop(100, this, this['_loop_show']);
                        },
                        Z['prototype']['close_refresh'] = function() {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        Z['prototype']['_loop_refresh_delay'] = function() {
                            var Z = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var S = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var V = app['NetAgent']['mj_network_delay'];
                                    S = 300 > V ? 2000 : 800 > V ? 2500 + V : 4000 + 0.5 * V,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function() {
                                            Z['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    S = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), S);
                            }
                        },
                        Z['prototype']['_loop_show'] = function() {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var Z = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > Z ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > Z ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        Z;
                }
                (),
                o = function() {
                    function Z(Z, S) {
                        var V = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = S,
                            this.me = Z,
                            this['btn_banemj'] = Z['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = Z['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = Z['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V['locking'] || (V['emj_banned'] = !V['emj_banned'], V['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (V['emj_banned'] ? '_on.png' : '.png')), V['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V['locking'] || (V['close'](), e.Inst['btn_seeinfo'](V['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V['locking'] || (V['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](V['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function() {
                                V['locking'] || V['switch']();
                            }, null, !1);
                    }
                    return Z['prototype']['reset'] = function(Z, S, V) {
                            Laya['timer']['clearAll'](this),
                                this['locking'] = !1,
                                this['enable'] = !1,
                                this['showinfo'] = Z,
                                this['showemj'] = S,
                                this['showchange'] = V,
                                this['emj_banned'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                                this['btn_change']['visible'] = !1;
                        },
                        Z['prototype']['onChangeSeat'] = function(Z, S, V) {
                            this['showinfo'] = Z,
                                this['showemj'] = S,
                                this['showchange'] = V,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        Z['prototype']['switch'] = function() {
                            var Z = this;
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
                            }, 150, Laya.Ease['backOut'])) : this['btn_change']['visible'] = !1, Laya['timer'].once(150, this, function() {
                                Z['locking'] = !1;
                            })));
                        },
                        Z['prototype']['close'] = function() {
                            var Z = this;
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
                                Laya['timer'].once(150, this, function() {
                                    Z['locking'] = !1,
                                        Z['btn_banemj']['visible'] = !1,
                                        Z['btn_seeinfo']['visible'] = !1,
                                        Z['btn_change']['visible'] = !1;
                                });
                        },
                        Z;
                }
                (),
                y = function() {
                    function Z(Z) {
                        var S = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = Z,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function() {
                                S['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function() {
                                S['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function() {
                                S['scrollview']['total_height'] > 0 ? S['scrollbar']['setVal'](S['scrollview'].rate, S['scrollview']['view_height'] / S['scrollview']['total_height']) : S['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return Z['prototype']['initRoom'] = function() {
                            // START 
                            // var Z = view['DesktopMgr'].Inst['main_role_character_info'],
                            // END
                            var Z = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                                S = cfg['item_definition']['character'].find(Z['charid']);
                            this['emo_log_count'] = 0,
                                this.emos = [];
                            for (var V = 0; 9 > V; V++)
                                this.emos.push({
                                    path: S.emo + '/' + V + '.png',
                                    sub_id: V,
                                    sort: V
                                });
                            if (Z['extra_emoji'])
                                for (var V = 0; V < Z['extra_emoji']['length']; V++)
                                    this.emos.push({
                                        path: S.emo + '/' + Z['extra_emoji'][V] + '.png',
                                        sub_id: Z['extra_emoji'][V],
                                        sort: Z['extra_emoji'][V] > 12 ? 1000000 - Z['extra_emoji'][V] : Z['extra_emoji'][V]
                                    });
                            this.emos = this.emos.sort(function(Z, S) {
                                    return Z.sort - S.sort;
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
                                    char_id: Z['charid'],
                                    emoji: [],
                                    server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                                };
                        },
                        Z['prototype']['render_item'] = function(Z) {
                            var S = this,
                                V = Z['index'],
                                o = Z['container'],
                                y = this.emos[V],
                                G = o['getChildByName']('btn');
                            G.skin = game['LoadMgr']['getResImageSkin'](y.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](G, !0) : (game['Tools']['setGrayDisable'](G, !1), G['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var Z = !1, V = 0, o = S['emo_infos']['emoji']; V < o['length']; V++) {
                                            var G = o[V];
                                            if (G[0] == y['sub_id']) {
                                                G[0]++,
                                                    Z = !0;
                                                break;
                                            }
                                        }
                                        Z || S['emo_infos']['emoji'].push([y['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: y['sub_id']
                                                }),
                                                except_self: !1
                                            }, function() {});
                                    }
                                    S['change_all_gray'](!0),
                                        Laya['timer'].once(5000, S, function() {
                                            S['change_all_gray'](!1);
                                        }),
                                        S['switchShow'](!1);
                                }, null, !1));
                        },
                        Z['prototype']['change_all_gray'] = function(Z) {
                            this['allgray'] = Z,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        Z['prototype']['switchShow'] = function(Z) {
                            var S = this,
                                V = 0;
                            V = Z ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, Z ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    Z ? (S.out['visible'] = !1, S.in['visible'] = !0) : (S.out['visible'] = !0, S.in['visible'] = !1),
                                        Laya['Tween'].to(S.me, {
                                            x: V
                                        }, Z ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](S, function() {
                                            S['btn_chat']['disabled'] = !1,
                                                S['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        Z['prototype']['sendEmoLogUp'] = function() {
                            // START
                            // if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //     var Z = GameMgr.Inst['getMouse']();
                            //     GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //         data: this['emo_infos'],
                            //         m: view['DesktopMgr']['click_prefer'],
                            //         d: Z,
                            //         e: window['innerHeight'] / 2,
                            //         f: window['innerWidth'] / 2,
                            //         t: e.Inst['min_double_time'],
                            //         g: e.Inst['max_double_time']
                            //     }),
                            //     this['emo_infos']['emoji'] = [];
                            // }
                            // this['emo_log_count']++;
                            // END
                        },
                        Z['prototype']['reset'] = function() {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        Z;
                }
                (),
                G = function() {
                    function S(S) {
                        this['effect'] = null,
                            this['container_emo'] = S['getChildByName']('chat_bubble'),
                            this.emo = new Z['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = S['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return S['prototype'].show = function(Z, S) {
                            var V = this;
                            if (!view['DesktopMgr'].Inst['emoji_switch']) {
                                for (var o = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](Z)]['character']['charid'], y = cfg['character']['emoji']['getGroup'](o), G = '', e = 0, x = 0; x < y['length']; x++)
                                    if (y[x]['sub_id'] == S) {
                                        2 == y[x].type && (G = y[x].view, e = y[x]['audio']);
                                        break;
                                    }
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                    G ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + G + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function() {
                                        V['effect']['destory'](),
                                            V['effect'] = null;
                                    }), e && view['AudioMgr']['PlayAudio'](e)) : (this.emo['setSkin'](o, S), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function() {
                                        V.emo['clear'](),
                                            Laya['Tween'].to(V['container_emo'], {
                                                scaleX: 0,
                                                scaleY: 0
                                            }, 120, null, null, 0, !0, !0);
                                    }), Laya['timer'].once(3500, this, function() {
                                        V['container_emo']['visible'] = !1;
                                    }));
                            }
                        },
                        S['prototype']['reset'] = function() {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        S;
                }
                (),
                e = function(e) {
                    function x() {
                        var Z = e.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return Z['container_doras'] = null,
                            Z['doras'] = [],
                            Z['label_md5'] = null,
                            Z['container_gamemode'] = null,
                            Z['label_gamemode'] = null,
                            Z['btn_auto_moqie'] = null,
                            Z['btn_auto_nofulu'] = null,
                            Z['btn_auto_hule'] = null,
                            Z['img_zhenting'] = null,
                            Z['btn_double_pass'] = null,
                            Z['_network_delay'] = null,
                            Z['_timecd'] = null,
                            Z['_player_infos'] = [],
                            Z['_container_fun'] = null,
                            Z['_fun_in'] = null,
                            Z['_fun_out'] = null,
                            Z['showscoredeltaing'] = !1,
                            Z['_btn_leave'] = null,
                            Z['_btn_fanzhong'] = null,
                            Z['_btn_collect'] = null,
                            Z['block_emo'] = null,
                            Z['head_offset_y'] = 15,
                            Z['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            Z['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](Z, function(S) {
                                Z['onGameBroadcast'](S);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](Z, function(S) {
                                Z['onPlayerConnectionState'](S);
                            })),
                            x.Inst = Z,
                            Z;
                    }
                    return __extends(x, e),
                        x['prototype']['onCreate'] = function() {
                            var e = this;
                            this['doras'] = new Array();
                            var x = this.me['getChildByName']('container_lefttop'),
                                R = x['getChildByName']('container_doras');
                            this['container_doras'] = R,
                                this['container_gamemode'] = x['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = x['getChildByName']('MD5'),
                                x['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (e['label_md5']['visible'])
                                        Laya['timer']['clearAll'](e['label_md5']), e['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? x['getChildByName']('activitymode')['visible'] = !0 : e['container_doras']['visible'] = !0;
                                    else {
                                        e['label_md5']['visible'] = !0,
                                            e['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5,
                                            x['getChildByName']('activitymode')['visible'] = !1,
                                            e['container_doras']['visible'] = !1;
                                        var Z = e;
                                        Laya['timer'].once(5000, e['label_md5'], function() {
                                            Z['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? x['getChildByName']('activitymode')['visible'] = !0 : e['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var s = 0; s < R['numChildren']; s++)
                                this['doras'].push(R['getChildAt'](s));
                            for (var s = 0; 4 > s; s++) {
                                var u = this.me['getChildByName']('container_player_' + s),
                                    n = {};
                                n['container'] = u,
                                    n.head = new Z['UI_Head'](u['getChildByName']('head'), ''),
                                    n['head_origin_y'] = u['getChildByName']('head').y,
                                    n.name = u['getChildByName']('container_name')['getChildByName']('name'),
                                    n['container_shout'] = u['getChildByName']('container_shout'),
                                    n['container_shout']['visible'] = !1,
                                    n['illust'] = n['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    n['illustrect'] = Z['UIRect']['CreateFromSprite'](n['illust']),
                                    n['shout_origin_x'] = n['container_shout'].x,
                                    n['shout_origin_y'] = n['container_shout'].y,
                                    n.emo = new G(u),
                                    n['disconnect'] = u['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    n['disconnect']['visible'] = !1,
                                    n['title'] = new Z['UI_PlayerTitle'](u['getChildByName']('title'), ''),
                                    n.que = u['getChildByName']('que'),
                                    n['que_target_pos'] = new Laya['Vector2'](n.que.x, n.que.y),
                                    n['tianming'] = u['getChildByName']('tianming'),
                                    n['tianming']['visible'] = !1,
                                    0 == s ? u['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        e['btn_seeinfo'](0);
                                    }, null, !1) : n['headbtn'] = new o(u['getChildByName']('btn_head'), s),
                                    this['_player_infos'].push(n);
                            }
                            this['_timecd'] = new S(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new y(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var S = 0, V = 0; V < view['DesktopMgr'].Inst['player_datas']['length']; V++)
                                                view['DesktopMgr'].Inst['player_datas'][V]['account_id'] && S++;
                                            if (1 >= S)
                                                Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](e, function() {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var Z = 0, S = 0; S < view['DesktopMgr'].Inst['player_datas']['length']; S++) {
                                                            var V = view['DesktopMgr'].Inst['player_datas'][S];
                                                            V && null != V['account_id'] && 0 != V['account_id'] && Z++;
                                                        }
                                                        1 == Z ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function() {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var o = !1;
                                                if (Z['UI_VoteProgress']['vote_info']) {
                                                    var y = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - Z['UI_VoteProgress']['vote_info']['start_time'] - Z['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > y && (o = !0);
                                                }
                                                o ? Z['UI_VoteProgress'].Inst['enable'] || Z['UI_VoteProgress'].Inst.show() : Z['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? Z['UI_VoteCD'].Inst['enable'] || Z['UI_VoteCD'].Inst.show() : Z['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), Z['UI_Ob_Replay'].Inst['resetRounds'](), Z['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                }, null, !1),
                                this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (Z['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? Z['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](e, function() {
                                        Z['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : Z['UI_Replay'].Inst && Z['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var k = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr']['double_click_pass']) {
                                        var S = Laya['timer']['currTimer'];
                                        if (k + 300 > S) {
                                            if (Z['UI_ChiPengHu'].Inst['enable'])
                                                Z['UI_ChiPengHu'].Inst['onDoubleClick'](), e['recordDoubleClickTime'](S - k);
                                            else {
                                                var V = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                                Z['UI_LiQiZiMo'].Inst['enable'] && (V = Z['UI_LiQiZiMo'].Inst['onDoubleClick'](V)),
                                                    V && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && e['recordDoubleClickTime'](S - k);
                                            }
                                            k = 0;
                                        } else
                                            k = S;
                                    }
                                }, null, !1),
                                this['_network_delay'] = new V(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (x['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        x['prototype']['recordDoubleClickTime'] = function(Z) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(Z, this['min_double_time'])) : Z,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(Z, this['max_double_time']) : Z;
                        },
                        x['prototype']['onGameBroadcast'] = function(Z) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](Z));
                            var S = view['DesktopMgr'].Inst['seat2LocalPosition'](Z.seat),
                                V = JSON['parse'](Z['content']);
                            null != V.emo && void 0 != V.emo && (this['onShowEmo'](S, V.emo), this['showAIEmo']());
                        },
                        x['prototype']['onPlayerConnectionState'] = function(Z) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](Z));
                            var S = Z.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && S < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][S] = Z['state']), this['enable']) {
                                var V = view['DesktopMgr'].Inst['seat2LocalPosition'](S);
                                this['_player_infos'][V]['disconnect']['visible'] = Z['state'] != view['ELink_State']['READY'];
                            }
                        },
                        x['prototype']['_initFunc'] = function() {
                            var Z = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var S = this['_fun_out']['getChildByName']('btn_func'),
                                V = this['_fun_out']['getChildByName']('btn_func2'),
                                o = this['_fun_in_spr']['getChildByName']('btn_func');
                            S['clickHandler'] = V['clickHandler'] = new Laya['Handler'](this, function() {
                                    var y = 0;
                                    y = -270,
                                        Laya['Tween'].to(Z['_container_fun'], {
                                            x: -624
                                        }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](Z, function() {
                                            Z['_fun_in']['visible'] = !0,
                                                Z['_fun_out']['visible'] = !1,
                                                Laya['Tween'].to(Z['_container_fun'], {
                                                    x: y
                                                }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](Z, function() {
                                                    S['disabled'] = !1,
                                                        V['disabled'] = !1,
                                                        o['disabled'] = !1,
                                                        Z['_fun_out']['visible'] = !1;
                                                }), 0, !0, !0);
                                        })),
                                        S['disabled'] = !0,
                                        V['disabled'] = !0,
                                        o['disabled'] = !0;
                                }, null, !1),
                                o['clickHandler'] = new Laya['Handler'](this, function() {
                                    var y = -546;
                                    Laya['Tween'].to(Z['_container_fun'], {
                                            x: -624
                                        }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](Z, function() {
                                            Z['_fun_in']['visible'] = !1,
                                                Z['_fun_out']['visible'] = !0,
                                                Laya['Tween'].to(Z['_container_fun'], {
                                                    x: y
                                                }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](Z, function() {
                                                    S['disabled'] = !1,
                                                        V['disabled'] = !1,
                                                        o['disabled'] = !1,
                                                        Z['_fun_out']['visible'] = !0;
                                                }), 0, !0, !0);
                                        })),
                                        S['disabled'] = !0,
                                        V['disabled'] = !0,
                                        o['disabled'] = !0;
                                });
                            var y = this['_fun_in']['getChildByName']('btn_autolipai'),
                                G = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                e = this['_fun_out']['getChildByName']('autolipai'),
                                x = Laya['LocalStorage']['getItem']('autolipai'),
                                R = !0;
                            R = x && '' != x ? 'true' == x : !0,
                                this['refreshFuncBtnShow'](y, e, R),
                                y['clickHandler'] = G['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        Z['refreshFuncBtnShow'](y, e, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var s = this['_fun_in']['getChildByName']('btn_autohu'),
                                u = this['_fun_out']['getChildByName']('btn_autohu2'),
                                n = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](s, n, !1),
                                s['clickHandler'] = u['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        Z['refreshFuncBtnShow'](s, n, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var k = this['_fun_in']['getChildByName']('btn_autonoming'),
                                r = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                M = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](k, M, !1),
                                k['clickHandler'] = r['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        Z['refreshFuncBtnShow'](k, M, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var g = this['_fun_in']['getChildByName']('btn_automoqie'),
                                K = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                Y = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](g, Y, !1),
                                g['clickHandler'] = K['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        Z['refreshFuncBtnShow'](g, Y, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (e['scale'](0.9, 0.9), n['scale'](0.9, 0.9), M['scale'](0.9, 0.9), Y['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (S['visible'] = !1, u['visible'] = !0, G['visible'] = !0, r['visible'] = !0, K['visible'] = !0) : (S['visible'] = !0, u['visible'] = !1, G['visible'] = !1, r['visible'] = !1, K['visible'] = !1);
                        },
                        x['prototype']['noAutoLipai'] = function() {
                            var Z = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                Z['clickHandler'].run();
                        },
                        x['prototype']['resetFunc'] = function() {
                            var Z = Laya['LocalStorage']['getItem']('autolipai'),
                                S = !0;
                            S = Z && '' != Z ? 'true' == Z : !0;
                            var V = this['_fun_in']['getChildByName']('btn_autolipai'),
                                o = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](V, o, S),
                                Laya['LocalStorage']['setItem']('autolipai', S ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](S);
                            var y = this['_fun_in']['getChildByName']('btn_autohu'),
                                G = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](y, G, view['DesktopMgr'].Inst['auto_hule']);
                            var e = this['_fun_in']['getChildByName']('btn_autonoming'),
                                x = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](e, x, view['DesktopMgr'].Inst['auto_nofulu']);
                            var R = this['_fun_in']['getChildByName']('btn_automoqie'),
                                s = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](R, s, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var u = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            u['disabled'] = !1,
                                u['disabled'] = !1;
                        },
                        x['prototype']['setDora'] = function(Z, S) {
                            if (0 > Z || Z >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var V = 'myres2/mjp/' + (S['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_view']) + /ui/;
                            this['doras'][Z].skin = game['Tools']['localUISrc'](V + S['toString'](!1) + '.png');
                        },
                        x['prototype']['initRoom'] = function() {
                            var S = this;
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var V = {}, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    for (var y = view['DesktopMgr'].Inst['player_datas'][o]['character'], G = y['charid'], e = cfg['item_definition']['character'].find(G).emo, x = 0; 9 > x; x++) {
                                        var R = e + '/' + x['toString']() + '.png';
                                        V[R] = 1;
                                    }
                                    if (y['extra_emoji'])
                                        for (var x = 0; x < y['extra_emoji']['length']; x++) {
                                            var R = e + '/' + y['extra_emoji'][x]['toString']() + '.png';
                                            V[R] = 1;
                                        }
                                }
                                var s = [];
                                for (var u in V)
                                    s.push(u);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](s, Laya['Handler']['create'](this, function() {
                                        S['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else {
                                for (var n = !1, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    var k = view['DesktopMgr'].Inst['player_datas'][o];
                                    if (k && null != k['account_id'] && k['account_id'] == GameMgr.Inst['account_id']) {
                                        n = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (Z['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = n;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var r = 0, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    var k = view['DesktopMgr'].Inst['player_datas'][o];
                                    k && null != k['account_id'] && 0 != k['account_id'] && r++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var M = 0, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                var k = view['DesktopMgr'].Inst['player_datas'][o];
                                k && null != k['account_id'] && 0 != k['account_id'] && M++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var g = this.me['getChildByName']('container_lefttop');
                            if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                                g['getChildByName']('num_lizhi_0')['visible'] = !1, g['getChildByName']('num_lizhi_1')['visible'] = !1, g['getChildByName']('num_ben_0')['visible'] = !1, g['getChildByName']('num_ben_1')['visible'] = !1, g['getChildByName']('container_doras')['visible'] = !1, g['getChildByName']('gamemode')['visible'] = !1, g['getChildByName']('activitymode')['visible'] = !0, g['getChildByName']('MD5').y = 63, g['getChildByName']('MD5')['width'] = 239, g['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), g['getChildAt'](0)['width'] = 280, g['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (g['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, g['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (g['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), g['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), g['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, g['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (g['getChildByName']('num_lizhi_0')['visible'] = !0, g['getChildByName']('num_lizhi_1')['visible'] = !1, g['getChildByName']('num_ben_0')['visible'] = !0, g['getChildByName']('num_ben_1')['visible'] = !0, g['getChildByName']('container_doras')['visible'] = !0, g['getChildByName']('gamemode')['visible'] = !0, g['getChildByName']('activitymode')['visible'] = !1, g['getChildByName']('MD5').y = 51, g['getChildByName']('MD5')['width'] = 276, g['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), g['getChildAt'](0)['width'] = 313, g['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var K = view['DesktopMgr'].Inst['game_config'],
                                    Y = game['Tools']['get_room_desc'](K);
                                this['label_gamemode'].text = Y.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = Z['UI_Activity_JJC']['win_count']['toString']();
                                    for (var o = 0; 3 > o; o++)
                                        this['container_jjc']['getChildByName'](o['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (Z['UI_Activity_JJC']['lose_count'] > o ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            Z['UI_Replay'].Inst && (Z['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var j = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                F = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (Z['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](j, !0), game['Tools']['setGrayDisable'](F, !0)) : (game['Tools']['setGrayDisable'](j, !1), game['Tools']['setGrayDisable'](F, !1), Z['UI_Astrology'].Inst.hide());
                            for (var o = 0; 4 > o; o++)
                                this['_player_infos'][o]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][o]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png');
                        },
                        x['prototype']['onCloseRoom'] = function() {
                            this['_network_delay']['close_refresh']();
                        },
                        x['prototype']['refreshSeat'] = function(Z) {
                            void 0 === Z && (Z = !1);
                            for (var S = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), V = 0; 4 > V; V++) {
                                var o = view['DesktopMgr'].Inst['localPosition2Seat'](V),
                                    y = this['_player_infos'][V];
                                if (0 > o)
                                    y['container']['visible'] = !1;
                                else {
                                    y['container']['visible'] = !0;
                                    var G = view['DesktopMgr'].Inst['getPlayerName'](o);
                                    game['Tools']['SetNickname'](y.name, G),
                                        y.head.id = S[o]['avatar_id'],
                                        y.head['set_head_frame'](S[o]['account_id'], S[o]['avatar_frame']);
                                    var e = (cfg['item_definition'].item.get(S[o]['avatar_frame']), cfg['item_definition'].view.get(S[o]['avatar_frame']));
                                    if (y.head.me.y = e && e['sargs'][0] ? y['head_origin_y'] - Number(e['sargs'][0]) / 100 * this['head_offset_y'] : y['head_origin_y'], y['avatar'] = S[o]['avatar_id'], 0 != V) {
                                        var x = S[o]['account_id'] && 0 != S[o]['account_id'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'],
                                            R = S[o]['account_id'] && 0 != S[o]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            s = view['DesktopMgr'].Inst.mode != view['EMJMode'].play;
                                        Z ? y['headbtn']['onChangeSeat'](x, R, s) : y['headbtn']['reset'](x, R, s);
                                    }
                                    y['title'].id = S[o]['title'] ? game['Tools']['titleLocalization'](S[o]['account_id'], S[o]['title']) : 0;
                                }
                            }
                        },
                        x['prototype']['refreshNames'] = function() {
                            for (var Z = 0; 4 > Z; Z++) {
                                var S = view['DesktopMgr'].Inst['localPosition2Seat'](Z),
                                    V = this['_player_infos'][Z];
                                if (0 > S)
                                    V['container']['visible'] = !1;
                                else {
                                    V['container']['visible'] = !0;
                                    var o = view['DesktopMgr'].Inst['getPlayerName'](S);
                                    game['Tools']['SetNickname'](V.name, o);
                                }
                            }
                        },
                        x['prototype']['refreshLinks'] = function() {
                            for (var Z = (view['DesktopMgr'].Inst.seat, 0); 4 > Z; Z++) {
                                var S = view['DesktopMgr'].Inst['localPosition2Seat'](Z);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][Z]['disconnect']['visible'] = -1 == S || 0 == Z ? !1 : view['DesktopMgr']['player_link_state'][S] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][Z]['disconnect']['visible'] = -1 == S || 0 == view['DesktopMgr'].Inst['player_datas'][S]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][S] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][Z]['disconnect']['visible'] = !1);
                            }
                        },
                        x['prototype']['setBen'] = function(Z) {
                            Z > 99 && (Z = 99);
                            var S = this.me['getChildByName']('container_lefttop'),
                                V = S['getChildByName']('num_ben_0'),
                                o = S['getChildByName']('num_ben_1');
                            Z >= 10 ? (V.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](Z / 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Z % 10)['toString']() + '.png'), o['visible'] = !0) : (V.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Z % 10)['toString']() + '.png'), o['visible'] = !1);
                        },
                        x['prototype']['setLiqibang'] = function(Z, S) {
                            void 0 === S && (S = !0),
                                Z > 999 && (Z = 999);
                            var V = this.me['getChildByName']('container_lefttop'),
                                o = V['getChildByName']('num_lizhi_0'),
                                y = V['getChildByName']('num_lizhi_1'),
                                G = V['getChildByName']('num_lizhi_2');
                            Z >= 100 ? (G.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Z % 10)['toString']() + '.png'), y.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](Z / 10) % 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](Z / 100)['toString']() + '.png'), y['visible'] = !0, G['visible'] = !0) : Z >= 10 ? (y.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Z % 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](Z / 10)['toString']() + '.png'), y['visible'] = !0, G['visible'] = !1) : (o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Z['toString']() + '.png'), y['visible'] = !1, G['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](Z, S);
                        },
                        x['prototype']['reset_rounds'] = function() {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var Z = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /ui/, S = 0; S < this['doras']['length']; S++)
                                this['doras'][S].skin = view['DesktopMgr'].Inst['is_jiuchao_mode']() ? game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png') : game['Tools']['localUISrc'](Z + 'back.png');
                            for (var S = 0; 4 > S; S++)
                                this['_player_infos'][S].emo['reset'](), this['_player_infos'][S].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        x['prototype']['showCountDown'] = function(Z, S) {
                            this['_timecd']['showCD'](Z, S);
                        },
                        x['prototype']['setZhenting'] = function(Z) {
                            this['img_zhenting']['visible'] = Z;
                        },
                        x['prototype']['shout'] = function(Z, S, V, o) {
                            app.Log.log('shout:' + Z + ' type:' + S);
                            try {
                                var y = this['_player_infos'][Z],
                                    G = y['container_shout'],
                                    e = G['getChildByName']('img_content'),
                                    x = G['getChildByName']('illust')['getChildByName']('illust'),
                                    R = G['getChildByName']('img_score');
                                if (0 == o)
                                    R['visible'] = !1;
                                else {
                                    R['visible'] = !0;
                                    var s = 0 > o ? 'm' + Math.abs(o) : o;
                                    R.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + s + '.png');
                                }
                                '' == S ? e['visible'] = !1 : (e['visible'] = !0, e.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + S + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (G['getChildByName']('illust')['visible'] = !1, G['getChildAt'](2)['visible'] = !0, G['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](G['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (G['getChildByName']('illust')['visible'] = !0, G['getChildAt'](2)['visible'] = !1, G['getChildAt'](0)['visible'] = !0, x['scaleX'] = 1, game['Tools']['charaPart'](V['avatar_id'], x, 'half', y['illustrect'], !0, !0));
                                var u = 0,
                                    n = 0;
                                switch (Z) {
                                    case 0:
                                        u = -105,
                                            n = 0;
                                        break;
                                    case 1:
                                        u = 500,
                                            n = 0;
                                        break;
                                    case 2:
                                        u = 0,
                                            n = -300;
                                        break;
                                    default:
                                        u = -500,
                                            n = 0;
                                }
                                G['visible'] = !0,
                                    G['alpha'] = 0,
                                    G.x = y['shout_origin_x'] + u,
                                    G.y = y['shout_origin_y'] + n,
                                    Laya['Tween'].to(G, {
                                        alpha: 1,
                                        x: y['shout_origin_x'],
                                        y: y['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(G, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function() {
                                        Laya['loader']['clearTextureRes'](x.skin),
                                            G['visible'] = !1;
                                    });
                            } catch (k) {
                                var r = {};
                                r['error'] = k['message'],
                                    r['stack'] = k['stack'],
                                    r['method'] = 'shout',
                                    r['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](r);
                            }
                        },
                        x['prototype']['closeCountDown'] = function() {
                            this['_timecd']['close']();
                        },
                        x['prototype']['refreshFuncBtnShow'] = function(Z, S, V) {
                            var o = Z['getChildByName']('img_choosed');
                            S['color'] = Z['mouseEnabled'] ? V ? '#3bd647' : '#7992b3' : '#565656',
                                o['visible'] = V;
                        },
                        x['prototype']['onShowEmo'] = function(Z, S) {
                            var V = this['_player_infos'][Z];
                            0 != Z && V['headbtn']['emj_banned'] || V.emo.show(Z, S);
                        },
                        x['prototype']['changeHeadEmo'] = function(Z) {
                            {
                                var S = view['DesktopMgr'].Inst['seat2LocalPosition'](Z);
                                this['_player_infos'][S];
                            }
                        },
                        x['prototype']['onBtnShowScoreDelta'] = function() {
                            var Z = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function() {
                                Z['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        x['prototype']['btn_seeinfo'] = function(S) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                                var V = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](S)]['account_id'];
                                if (V) {
                                    var o = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        y = 1,
                                        G = view['DesktopMgr'].Inst['game_config'].meta;
                                    G && G['mode_id'] == game['EMatchMode']['shilian'] && (y = 4),
                                        Z['UI_OtherPlayerInfo'].Inst.show(V, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, o ? 1 : 2, y);
                                }
                            }
                        },
                        x['prototype']['openDora3BeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openPeipaiOpenBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openDora3BeginShine'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openMuyuOpenBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openShilianOpenBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openXiuluoOpenBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openChuanmaBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openJiuChaoBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openAnPaiBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openTopMatchOpenBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openZhanxingBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['openTianmingBeginEffect'] = function() {
                            var Z = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, Z, function() {
                                    Z['destory']();
                                });
                        },
                        x['prototype']['logUpEmoInfo'] = function() {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        x['prototype']['onCollectChange'] = function() {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (Z['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        x['prototype']['showAIEmo'] = function() {
                            for (var Z = this, S = function(S) {
                                    var o = view['DesktopMgr'].Inst['player_datas'][S];
                                    o['account_id'] && 0 != o['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), V, function() {
                                        Z['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](S), Math['floor'](9 * Math['random']()));
                                    });
                                }, V = this, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++)
                                S(o);
                        },
                        x['prototype']['setGapType'] = function(Z, S) {
                            void 0 === S && (S = !1);
                            for (var V = 0; V < Z['length']; V++) {
                                var o = view['DesktopMgr'].Inst['seat2LocalPosition'](V);
                                this['_player_infos'][o].que['visible'] = !0,
                                    S && (0 == V ? (this['_player_infos'][o].que.pos(this['gapStartPosLst'][V].x + this['selfGapOffsetX'][Z[V]], this['gapStartPosLst'][V].y), this['_player_infos'][o].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][o].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][o]['que_target_pos'].x,
                                        y: this['_player_infos'][o]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][o].que.pos(this['gapStartPosLst'][V].x, this['gapStartPosLst'][V].y), this['_player_infos'][o].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][o].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][o]['que_target_pos'].x,
                                        y: this['_player_infos'][o]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][o].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + Z[V] + '.png');
                            }
                        },
                        x['prototype']['OnNewCard'] = function(Z, S) {
                            if (S) {
                                var V = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, V, function() {
                                        V['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function() {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        x['prototype']['ShowSpellCard'] = function(S, V) {
                            void 0 === V && (V = !1),
                                Z['UI_FieldSpell'].Inst && !Z['UI_FieldSpell'].Inst['enable'] && Z['UI_FieldSpell'].Inst.show(S, V);
                        },
                        x['prototype']['HideSpellCard'] = function() {
                            Z['UI_FieldSpell'].Inst && Z['UI_FieldSpell'].Inst['close']();
                        },
                        x['prototype']['SetTianMingRate'] = function(Z, S, V) {
                            void 0 === V && (V = !1);
                            var o = view['DesktopMgr'].Inst['seat2LocalPosition'](Z),
                                y = this['_player_infos'][o]['tianming'];
                            V && 5 != S && y.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + S + '.png') && Laya['Tween'].to(y, {
                                    scaleX: 1.1,
                                    scaleY: 1.1
                                }, 200, null, Laya['Handler']['create'](this, function() {
                                    Laya['Tween'].to(y, {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 200);
                                })),
                                y.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + S + '.png');
                        },
                        x.Inst = null,
                        x;
                }
                (Z['UIBase']);
            Z['UI_DesktopInfo'] = e;
        }
        (uiscript || (uiscript = {}));




        uiscript.UI_Info.Init = function() {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var S = uiscript.UI_Info;
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function(V, o) {
                    V || o['error'] ? Z['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', V, o) : S['_refreshAnnouncements'](o);
                    if ((V || o['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function(Z) {
                    for (var V = GameMgr['inDmm'] ? 'web_dmm' : 'web', o = 0, y = Z['update_list']; o < y['length']; o++) {
                        var G = y[o];
                        if (G.lang == GameMgr['client_language'] && G['platform'] == V) {
                            S['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }


        uiscript.UI_Info._refreshAnnouncements = function(Z) {
            // START
            Z.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
                // END
            if (Z['announcements'] && (this['announcements'] = Z['announcements']), Z.sort && (this['announcement_sort'] = Z.sort), Z['read_list']) {
                this['read_list'] = [];
                for (var S = 0; S < Z['read_list']['length']; S++)
                    this['read_list'].push(Z['read_list'][S]);
                Z.read_list.splice(0, 0, 666666, 777777);
            }
        }

        // 加载CG 
        ! function(Z) {
            var S = function() {
                    function S(S, V) {
                        var o = this;
                        this['cg_id'] = 0,
                            this.me = S,
                            this['father'] = V;
                        var y = this.me['getChildByName']('btn_detail');
                        y['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['UI_Bag'].Inst['locking'] || o['father']['changeLoadingCG'](o['cg_id']);
                            }),
                            game['Tools']['setButtonLongPressHandler'](y, new Laya['Handler'](this, function(S) {
                                if (!Z['UI_Bag'].Inst['locking']) {
                                    'down' == S ? Laya['timer'].once(800, o, function() {
                                        Z['UI_CG_Yulan'].Inst.show(o['cg_id']);
                                    }) : ('over' == S || 'up' == S) && Laya['timer']['clearAll'](o);
                                }
                            })),
                            this['using'] = y['getChildByName']('using'),
                            this.icon = y['getChildByName']('icon'),
                            this.name = y['getChildByName']('name'),
                            this.info = y['getChildByName']('info'),
                            this['label_time'] = this.info['getChildByName']('info'),
                            this['sprite_new'] = y['getChildByName']('new');
                    }
                    return S['prototype'].show = function() {
                            this.me['visible'] = !0;
                            var S = cfg['item_definition']['loading_image'].get(this['cg_id']);
                            this['using']['visible'] = -1 != Z['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                                game['LoadMgr']['setImgSkin'](this.icon, S['thumb_path'], null, 'UI_Bag_PageCG');
                            for (var V = !this['father']['last_seen_cg_map'][this['cg_id']], o = 0, y = S['unlock_items']; o < y['length']; o++) {
                                var G = y[o];
                                if (G && Z['UI_Bag']['get_item_count'](G) > 0) {
                                    var e = cfg['item_definition'].item.get(G);
                                    if (this.name.text = e['name_' + GameMgr['client_language']], !e['item_expire']) {
                                        this.info['visible'] = !1,
                                            V = -1 != this['father']['new_cg_ids']['indexOf'](G);
                                        break;
                                    }
                                    this.info['visible'] = !0,
                                        this['label_time'].text = game['Tools']['strOfLocalization'](3119) + e['expire_desc_' + GameMgr['client_language']];
                                }
                            }
                            this['sprite_new']['visible'] = V;
                        },
                        S['prototype']['reset'] = function() {
                            game['LoadMgr']['clearImgSkin'](this.icon),
                                Laya['Loader']['clearTextureRes'](this.icon.skin);
                        },
                        S;
                }
                (),
                V = function() {
                    function V(Z) {
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = Z,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                    }
                    return V['prototype']['have_redpoint'] = function() {
                            // START
                            //if (Z['UI_Bag']['new_cg_ids']['length'] > 0)
                            return 0;
                            // END
                            var S = [];
                            if (!this['seen_cg_map']) {
                                var V = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, V) {
                                    V = game['Tools']['dddsss'](V);
                                    for (var o = V['split'](','), y = 0; y < o['length']; y++)
                                        this['seen_cg_map'][Number(o[y])] = 1;
                                }
                            }
                            cfg['item_definition']['loading_image']['forEach'](function(V) {
                                V['unlock_items'][1] && 0 == Z['UI_Bag']['get_item_count'](V['unlock_items'][0]) && Z['UI_Bag']['get_item_count'](V['unlock_items'][1]) > 0 && S.push(V.id);
                            });
                            for (var G = 0, e = S; G < e['length']; G++) {
                                var x = e[G];
                                if (!this['seen_cg_map'][x])
                                    return !0;
                            }
                            return !1;
                        },
                        V['prototype'].show = function() {
                            var S = this;
                            if (this['new_cg_ids'] = Z['UI_Bag']['new_cg_ids'], Z['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var V = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, V) {
                                    V = game['Tools']['dddsss'](V);
                                    for (var o = V['split'](','), y = 0; y < o['length']; y++)
                                        this['seen_cg_map'][Number(o[y])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var G = '';
                            cfg['item_definition']['loading_image']['forEach'](function(V) {
                                    for (var o = 0, y = V['unlock_items']; o < y['length']; o++) {
                                        var e = y[o];
                                        if (e && Z['UI_Bag']['get_item_count'](e) > 0)
                                            return S['items'].push(V), S['seen_cg_map'][V.id] = 1, '' != G && (G += ','), G += V.id, void 0;
                                    }
                                }),
                                this['items'].sort(function(Z, S) {
                                    return S.sort - Z.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](G)),
                                Z['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1;
                        },
                        V['prototype']['close'] = function() {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && Z['UI_Loading']['loadNextCG']();
                        },
                        V['prototype']['render_item'] = function(Z) {
                            var V = Z['index'],
                                o = Z['container'],
                                y = Z['cache_data'];
                            if (this['items'][V]) {
                                y.item || (y.item = new S(o, this));
                                var G = y.item;
                                G['cg_id'] = this['items'][V].id,
                                    G.show();
                            }
                        },
                        V['prototype']['changeLoadingCG'] = function(S) {
                            this['_changed'] = !0;
                            for (var V = 0, o = 0, y = 0, G = this['items']; y < G['length']; y++) {
                                var e = G[y];
                                if (e.id == S) {
                                    V = o;
                                    break;
                                }
                                o++;
                            }
                            var x = Z['UI_Loading']['Loading_Images']['indexOf'](S); -
                            1 == x ? Z['UI_Loading']['Loading_Images'].push(S) : Z['UI_Loading']['Loading_Images']['splice'](x, 1),
                                this['scrollview']['wantToRefreshItem'](V),
                                this['locking'] = !0,
                                // START
                                MMP.settings.loadingCG = Z['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: Z['UI_Loading']['Loading_Images']
                            //}, function (S, V) {
                            //    (S || V['error']) && Z['UIMgr'].Inst['showNetReqError']('setLoadingImage', S, V);
                            //});
                            // END
                        },
                        V['prototype']['when_update_data'] = function() {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        V;
                }
                ();
            Z['UI_Bag_PageCG'] = V;
        }
        (uiscript || (uiscript = {}));

        uiscript.UI_Entrance.prototype._onLoginSuccess = function(S, V, o) {
            var Z = uiscript;
            var y = this;
            if (void 0 === o && (o = !1), app.Log.log('登陆：' + JSON['stringify'](V)), GameMgr.Inst['account_id'] = V['account_id'], GameMgr.Inst['account_data'] = V['account'], Z['UI_ShiMingRenZheng']['renzhenged'] = V['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, V['account']['platform_diamond'])
                for (var G = V['account']['platform_diamond'], e = 0; e < G['length']; e++)
                    GameMgr.Inst['account_numerical_resource'][G[e].id] = G[e]['count'];
            if (V['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = V['account']['skin_ticket']), V['account']['platform_skin_ticket'])
                for (var x = V['account']['platform_skin_ticket'], e = 0; e < x['length']; e++)
                    GameMgr.Inst['account_numerical_resource'][x[e].id] = x[e]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                V['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = V['game_info']['location'], GameMgr.Inst['mj_game_token'] = V['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = V['game_info']['game_uuid']),
                V['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : S['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', V['access_token']), GameMgr.Inst['sociotype'] = S, GameMgr.Inst['access_token'] = V['access_token']);
            var R = this,
                s = function() {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        Z['UI_Loading'].Inst.show('load_lobby'),
                        R['enable'] = !1,
                        R['scene']['close'](),
                        Z['UI_Entrance_Mail_Regist'].Inst['close'](),
                        R['login_loading']['close'](),
                        Z['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](R, function() {
                            GameMgr.Inst['afterLogin'](),
                                R['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && Z['UIMgr'].Inst['ShowPreventAddiction'](),
                                R['destroy'](),
                                R['disposeRes'](),
                                Z['UI_Add2Desktop'].Inst && (Z['UI_Add2Desktop'].Inst['destroy'](), Z['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](R, function(S) {
                            return Z['UI_Loading'].Inst['setProgressVal'](0.2 * S);
                        }, null, !1));
                },
                u = Laya['Handler']['create'](this, function() {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function(S, V) {
                        S ? (app.Log.log('fetchRefundOrder err:' + S), y['showError'](game['Tools']['strOfLocalization'](2061), S), y['showContainerLogin']()) : (Z['UI_Refund']['orders'] = V['orders'], Z['UI_Refund']['clear_deadline'] = V['clear_deadline'], Z['UI_Refund']['message'] = V['message'], s());
                    }) : s();
                });
            // START
            //if (Z['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var n = 0, k = GameMgr.Inst['account_data']['loading_image']; n < k['length']; n++) {
            //        var r = k[n];
            //        cfg['item_definition']['loading_image'].get(r) && Z['UI_Loading']['Loading_Images'].push(r);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            Z['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || V['account']['phone_verify'] ? u.run() : (Z['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, Z['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function() {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function(S, V) {
                        S || V['error'] ? y['showError'](S, V['error']) : 0 == V['phone_login'] ? Z['UI_Create_Phone_Account'].Inst.show(u) : Z['UI_Canot_Create_Phone_Account'].Inst.show(u);
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
                onload: function(msg) {
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
            app.Taboo.test = function() { return null };
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
// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.186
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
        ! function(u) {
            var Z;
            ! function(u) {
                u[u.none = 0] = 'none',
                    u[u['daoju'] = 1] = 'daoju',
                    u[u.gift = 2] = 'gift',
                    u[u['fudai'] = 3] = 'fudai',
                    u[u.view = 5] = 'view';
            }
            (Z = u['EItemCategory'] || (u['EItemCategory'] = {}));
            var y = function(y) {
                    function o() {
                        var u = y.call(this, new ui['lobby']['bagUI']()) || this;
                        return u['container_top'] = null,
                            u['container_content'] = null,
                            u['locking'] = !1,
                            u.tabs = [],
                            u['page_item'] = null,
                            u['page_gift'] = null,
                            u['page_skin'] = null,
                            u['page_cg'] = null,
                            u['select_index'] = 0,
                            o.Inst = u,
                            u;
                    }
                    return __extends(o, y),
                        o.init = function() {
                            var u = this;
                            app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(Z) {
                                    var y = Z['update'];
                                    y && y.bag && (u['update_data'](y.bag['update_items']), u['update_daily_gain_data'](y.bag));
                                }, null, !1)),
                                this['fetch']();
                        },
                        o['fetch'] = function() {
                            var Z = this;
                            this['_item_map'] = {},
                                this['_daily_gain_record'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function(y, o) {
                                    if (y || o['error'])
                                        u['UIMgr'].Inst['showNetReqError']('fetchBagInfo', y, o);
                                    else {
                                        app.Log.log('背包信息：' + JSON['stringify'](o));
                                        var _ = o.bag;
                                        if (_) {
                                            if (MMP.settings.setItems.setAllItems) {
                                                //设置全部道具
                                                var items = cfg.item_definition.item.map_;
                                                for (var id in items) {
                                                    if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                        for (let item of _["items"]) {
                                                            if (item.item_id == id) {
                                                                cfg.item_definition.item.get(item.item_id);
                                                                Z._item_map[item.item_id] = {
                                                                    item_id: item.item_id,
                                                                    count: item.stack,
                                                                    category: items[item.item_id].category
                                                                };
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        cfg.item_definition.item.get(id);
                                                        Z._item_map[id] = {
                                                            item_id: id,
                                                            count: 1,
                                                            category: items[id].category
                                                        }; //获取物品列表并添加
                                                    }
                                                }


                                            } else {
                                                if (_['items'])
                                                    for (var B = 0; B < _['items']['length']; B++) {
                                                        var R = _['items'][B]['item_id'],
                                                            r = _['items'][B]['stack'],
                                                            d = cfg['item_definition'].item.get(R);
                                                        d && (Z['_item_map'][R] = {
                                                            item_id: R,
                                                            count: r,
                                                            category: d['category']
                                                        }, 1 == d['category'] && 3 == d.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                            item_id: R
                                                        }, function() {}));
                                                    }
                                                if (_['daily_gain_record'])
                                                    for (var J = _['daily_gain_record'], B = 0; B < J['length']; B++) {
                                                        var w = J[B]['limit_source_id'];
                                                        Z['_daily_gain_record'][w] = {};
                                                        var z = J[B]['record_time'];
                                                        Z['_daily_gain_record'][w]['record_time'] = z;
                                                        var T = J[B]['records'];
                                                        if (T)
                                                            for (var X = 0; X < T['length']; X++)
                                                                Z['_daily_gain_record'][w][T[X]['item_id']] = T[X]['count'];
                                                    }
                                            }
                                        }
                                    }
                                });
                        },
                        o['find_item'] = function(u) {
                            var Z = this['_item_map'][u];
                            return Z ? {
                                    item_id: Z['item_id'],
                                    category: Z['category'],
                                    count: Z['count']
                                } :
                                null;
                        },
                        o['get_item_count'] = function(u) {
                            var Z = this['find_item'](u);
                            if (Z)
                                return Z['count'];
                            if ('100001' == u) {
                                for (var y = 0, o = 0, _ = GameMgr.Inst['free_diamonds']; o < _['length']; o++) {
                                    var B = _[o];
                                    GameMgr.Inst['account_numerical_resource'][B] && (y += GameMgr.Inst['account_numerical_resource'][B]);
                                }
                                for (var R = 0, r = GameMgr.Inst['paid_diamonds']; R < r['length']; R++) {
                                    var B = r[R];
                                    GameMgr.Inst['account_numerical_resource'][B] && (y += GameMgr.Inst['account_numerical_resource'][B]);
                                }
                                return y;
                            }
                            if ('100004' == u) {
                                for (var d = 0, J = 0, w = GameMgr.Inst['free_pifuquans']; J < w['length']; J++) {
                                    var B = w[J];
                                    GameMgr.Inst['account_numerical_resource'][B] && (d += GameMgr.Inst['account_numerical_resource'][B]);
                                }
                                for (var z = 0, T = GameMgr.Inst['paid_pifuquans']; z < T['length']; z++) {
                                    var B = T[z];
                                    GameMgr.Inst['account_numerical_resource'][B] && (d += GameMgr.Inst['account_numerical_resource'][B]);
                                }
                                return d;
                            }
                            return '100002' == u ? GameMgr.Inst['account_data'].gold : 0;
                        },
                        o['find_items_by_category'] = function(u) {
                            var Z = [];
                            for (var y in this['_item_map'])
                                this['_item_map'][y]['category'] == u && Z.push({
                                    item_id: this['_item_map'][y]['item_id'],
                                    category: this['_item_map'][y]['category'],
                                    count: this['_item_map'][y]['count']
                                });
                            return Z;
                        },
                        o['update_data'] = function(Z) {
                            for (var y = 0; y < Z['length']; y++) {
                                var o = Z[y]['item_id'],
                                    _ = Z[y]['stack'];
                                if (_ > 0) {
                                    this['_item_map']['hasOwnProperty'](o['toString']()) ? this['_item_map'][o]['count'] = _ : this['_item_map'][o] = {
                                        item_id: o,
                                        count: _,
                                        category: cfg['item_definition'].item.get(o)['category']
                                    };
                                    var B = cfg['item_definition'].item.get(o);
                                    1 == B['category'] && 3 == B.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                            item_id: o
                                        }, function() {}),
                                        5 == B['category'] && (this['new_bag_item_ids'].push(o), this['new_zhuangban_item_ids'][o] = 1),
                                        8 != B['category'] || B['item_expire'] || this['new_cg_ids'].push(o);
                                } else if (this['_item_map']['hasOwnProperty'](o['toString']())) {
                                    var R = cfg['item_definition'].item.get(o);
                                    R && 5 == R['category'] && u['UI_Sushe']['on_view_remove'](o),
                                        this['_item_map'][o] = 0,
                                        delete this['_item_map'][o];
                                }
                            }
                            this.Inst && this.Inst['when_data_change']();
                            for (var y = 0; y < Z['length']; y++) {
                                var o = Z[y]['item_id'];
                                if (this['_item_listener']['hasOwnProperty'](o['toString']()))
                                    for (var r = this['_item_listener'][o], d = 0; d < r['length']; d++)
                                        r[d].run();
                            }
                            for (var y = 0; y < this['_all_item_listener']['length']; y++)
                                this['_all_item_listener'][y].run();
                        },
                        o['update_daily_gain_data'] = function(u) {
                            var Z = u['update_daily_gain_record'];
                            if (Z)
                                for (var y = 0; y < Z['length']; y++) {
                                    var o = Z[y]['limit_source_id'];
                                    this['_daily_gain_record'][o] || (this['_daily_gain_record'][o] = {});
                                    var _ = Z[y]['record_time'];
                                    this['_daily_gain_record'][o]['record_time'] = _;
                                    var B = Z[y]['records'];
                                    if (B)
                                        for (var R = 0; R < B['length']; R++)
                                            this['_daily_gain_record'][o][B[R]['item_id']] = B[R]['count'];
                                }
                        },
                        o['get_item_daily_record'] = function(u, Z) {
                            return this['_daily_gain_record'][u] ? this['_daily_gain_record'][u]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][u]['record_time']) ? this['_daily_gain_record'][u][Z] ? this['_daily_gain_record'][u][Z] : 0 : 0 : 0 : 0;
                        },
                        o['add_item_listener'] = function(u, Z) {
                            this['_item_listener']['hasOwnProperty'](u['toString']()) || (this['_item_listener'][u] = []),
                                this['_item_listener'][u].push(Z);
                        },
                        o['remove_item_listener'] = function(u, Z) {
                            var y = this['_item_listener'][u];
                            if (y)
                                for (var o = 0; o < y['length']; o++)
                                    if (y[o] === Z) {
                                        y[o] = y[y['length'] - 1],
                                            y.pop();
                                        break;
                                    }
                        },
                        o['add_all_item_listener'] = function(u) {
                            this['_all_item_listener'].push(u);
                        },
                        o['remove_all_item_listener'] = function(u) {
                            for (var Z = this['_all_item_listener'], y = 0; y < Z['length']; y++)
                                if (Z[y] === u) {
                                    Z[y] = Z[Z['length'] - 1],
                                        Z.pop();
                                    break;
                                }
                        },
                        o['removeAllBagNew'] = function() {
                            this['new_bag_item_ids'] = [];
                        },
                        o['removeAllCGNew'] = function() {
                            this['new_cg_ids'] = [];
                        },
                        o['removeZhuangBanNew'] = function(u) {
                            for (var Z = 0, y = u; Z < y['length']; Z++) {
                                var o = y[Z];
                                delete this['new_zhuangban_item_ids'][o];
                            }
                        },
                        o['prototype']['have_red_point'] = function() {
                            return this['page_cg']['have_redpoint']();
                        },
                        o['prototype']['onCreate'] = function() {
                            var Z = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['locking'] || Z.hide(Laya['Handler']['create'](Z, function() {
                                        return Z['closeHandler'] ? (Z['closeHandler'].run(), Z['closeHandler'] = null, void 0) : (u['UI_Lobby'].Inst['enable'] = !0, void 0);
                                    }));
                                }, null, !1),
                                this['container_content'] = this.me['getChildByName']('content');
                            for (var y = function(u) {
                                    o.tabs.push(o['container_content']['getChildByName']('tabs')['getChildByName']('btn' + u)),
                                        o.tabs[u]['clickHandler'] = Laya['Handler']['create'](o, function() {
                                            Z['select_index'] != u && Z['on_change_tab'](u);
                                        }, null, !1);
                                }, o = this, _ = 0; 5 > _; _++)
                                y(_);
                            this['page_item'] = new u['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                                this['page_gift'] = new u['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                                this['page_skin'] = new u['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                                this['page_cg'] = new u['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                        },
                        o['prototype'].show = function(Z, y) {
                            var o = this;
                            void 0 === Z && (Z = 0),
                                void 0 === y && (y = null),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this['closeHandler'] = y,
                                u['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200),
                                u['UIBase']['anim_alpha_in'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    o['locking'] = !1;
                                }),
                                this['on_change_tab'](Z),
                                this['refreshRedpoint'](),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                3 != Z && this['page_skin']['when_update_data']();
                        },
                        o['prototype'].hide = function(Z) {
                            var y = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 200),
                                u['UIBase']['anim_alpha_out'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    y['locking'] = !1,
                                        y['enable'] = !1,
                                        Z && Z.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            this['page_skin']['close'](),
                                this['page_item']['close'](),
                                this['page_gift']['close'](),
                                this['page_cg']['close']();
                        },
                        o['prototype']['on_change_tab'] = function(u) {
                            this['select_index'] = u;
                            for (var y = 0; y < this.tabs['length']; y++)
                                this.tabs[y].skin = game['Tools']['localUISrc'](u == y ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[y]['getChildAt'](0)['color'] = u == y ? '#d9b263' : '#8cb65f';
                            switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), u) {
                                case 0:
                                    this['page_item'].show(Z['daoju']);
                                    break;
                                case 1:
                                    this['page_gift'].show();
                                    break;
                                case 2:
                                    this['page_item'].show(Z.view);
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
                (u['UIBase']);
            u['UI_Bag'] = y;
        }
        (uiscript || (uiscript = {}));






        // 修改牌桌上角色
        ! function(u) {
            var Z = function() {
                    function Z() {
                        var Z = this;
                        this.urls = [],
                            this['link_index'] = -1,
                            this['connect_state'] = u['EConnectState'].none,
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
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function(u) {
                                if (MMP.settings.sendGame == true) {
                                    (GM_xmlhttpRequest({
                                        method: 'post',
                                        url: MMP.settings.sendGameURL,
                                        data: JSON.stringify(u),
                                        onload: function(msg) {
                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(u));
                                        }
                                    }));
                                }
                                app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](u)),
                                    Z['loaded_player_count'] = u['ready_id_list']['length'],
                                    Z['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](Z['loaded_player_count'], Z['real_player_count']);
                            }));
                    }
                    return Object['defineProperty'](Z, 'Inst', {
                            get: function() {
                                return null == this['_Inst'] ? this['_Inst'] = new Z() : this['_Inst'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Z['prototype']['OpenConnect'] = function(Z, y, o, _) {
                            var B = this;
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                                u['Scene_Lobby'].Inst && u['Scene_Lobby'].Inst['active'] && (u['Scene_Lobby'].Inst['active'] = !1),
                                u['Scene_Huiye'].Inst && u['Scene_Huiye'].Inst['active'] && (u['Scene_Huiye'].Inst['active'] = !1),
                                this['Close'](),
                                view['BgmListMgr']['stopBgm'](),
                                this['is_ob'] = !1,
                                Laya['timer'].once(500, this, function() {
                                    B.url = '',
                                        B['token'] = Z,
                                        B['game_uuid'] = y,
                                        B['server_location'] = o,
                                        GameMgr.Inst['ingame'] = !0,
                                        GameMgr.Inst['mj_server_location'] = o,
                                        GameMgr.Inst['mj_game_token'] = Z,
                                        GameMgr.Inst['mj_game_uuid'] = y,
                                        B['playerreconnect'] = _,
                                        B['_setState'](u['EConnectState']['tryconnect']),
                                        B['load_over'] = !1,
                                        B['loaded_player_count'] = 0,
                                        B['real_player_count'] = 0,
                                        B['lb_index'] = 0,
                                        B['_fetch_gateway'](0);
                                }),
                                Laya['timer'].loop(300000, this, this['reportInfo']);
                        },
                        Z['prototype']['reportInfo'] = function() {
                            this['connect_state'] == u['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                                client_type: 'web',
                                route_type: 'game',
                                route_index: u['LobbyNetMgr']['root_id_lst'][u['LobbyNetMgr'].Inst['choosed_index']],
                                route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                                connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                                reconnect_count: this['_report_reconnect_count']
                            });
                        },
                        Z['prototype']['Close'] = function() {
                            this['load_over'] = !1,
                                app.Log.log('MJNetMgr close'),
                                this['_setState'](u['EConnectState'].none),
                                app['NetAgent']['Close2MJ'](),
                                this.url = '',
                                Laya['timer']['clear'](this, this['reportInfo']);
                        },
                        Z['prototype']['_OnConnent'] = function(Z) {
                            app.Log.log('MJNetMgr _OnConnent event:' + Z),
                                Z == Laya['Event']['CLOSE'] || Z == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == u['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == u['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](u['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](u['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2008)), u['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == u['EConnectState']['reconnecting'] && this['_Reconnect']()) : Z == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == u['EConnectState']['tryconnect'] || this['connect_state'] == u['EConnectState']['reconnecting']) && ((this['connect_state'] = u['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](u['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                        },
                        Z['prototype']['_Reconnect'] = function() {
                            var Z = this;
                            u['LobbyNetMgr'].Inst['connect_state'] == u['EConnectState'].none || u['LobbyNetMgr'].Inst['connect_state'] == u['EConnectState']['disconnect'] ? this['_setState'](u['EConnectState']['disconnect']) : u['LobbyNetMgr'].Inst['connect_state'] == u['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](u['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function() {
                                Z['connect_state'] == u['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + Z['reconnect_count']), app['NetAgent']['connect2MJ'](Z.url, Laya['Handler']['create'](Z, Z['_OnConnent'], null, !1), 'local' == Z['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                            }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                        },
                        Z['prototype']['_try_to_linknext'] = function() {
                            this['link_index']++,
                                this.url = '',
                                app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                                this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? u['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](u['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && u['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                        },
                        Z['prototype']['GetAuthData'] = function() {
                            return {
                                account_id: GameMgr.Inst['account_id'],
                                token: this['token'],
                                game_uuid: this['game_uuid'],
                                gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                            };
                        },
                        Z['prototype']['_fetch_gateway'] = function(Z) {
                            var y = this;
                            if (u['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= u['LobbyNetMgr'].Inst.urls['length'])
                                return uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && u['Scene_MJ'].Inst['ForceOut'](), this['_setState'](u['EConnectState'].none), void 0;
                            this.urls = [],
                                this['link_index'] = -1,
                                app.Log.log('mj _fetch_gateway retry_count:' + Z);
                            var o = function(o) {
                                    var _ = JSON['parse'](o);
                                    if (app.Log.log('mj _fetch_gateway func_success data = ' + o), _['maintenance'])
                                        y['_setState'](u['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && u['Scene_MJ'].Inst['ForceOut']();
                                    else if (_['servers'] && _['servers']['length'] > 0) {
                                        for (var B = _['servers'], R = u['Tools']['deal_gateway'](B), r = 0; r < R['length']; r++)
                                            y.urls.push({
                                                name: '___' + r,
                                                url: R[r]
                                            });
                                        y['link_index'] = -1,
                                            y['_try_to_linknext']();
                                    } else
                                        1 > Z ? Laya['timer'].once(1000, y, function() {
                                            y['_fetch_gateway'](Z + 1);
                                        }) : u['LobbyNetMgr'].Inst['polling_connect'] ? (y['lb_index']++, y['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](60)), y['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && u['Scene_MJ'].Inst['ForceOut'](), y['_setState'](u['EConnectState'].none));
                                },
                                _ = function() {
                                    app.Log.log('mj _fetch_gateway func_error'),
                                        1 > Z ? Laya['timer'].once(500, y, function() {
                                            y['_fetch_gateway'](Z + 1);
                                        }) : u['LobbyNetMgr'].Inst['polling_connect'] ? (y['lb_index']++, y['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](58)), y['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || u['Scene_MJ'].Inst['ForceOut'](), y['_setState'](u['EConnectState'].none));
                                },
                                B = function(u) {
                                    var Z = new Laya['HttpRequest']();
                                    Z.once(Laya['Event']['COMPLETE'], y, function(u) {
                                            o(u);
                                        }),
                                        Z.once(Laya['Event']['ERROR'], y, function() {
                                            _();
                                        });
                                    var B = [];
                                    B.push('If-Modified-Since'),
                                        B.push('0'),
                                        u += '?service=ws-game-gateway',
                                        u += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                        u += '&location=' + y['server_location'],
                                        u += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                        Z.send(u, '', 'get', 'text', B),
                                        app.Log.log('mj _fetch_gateway func_fetch url = ' + u);
                                };
                            u['LobbyNetMgr'].Inst['polling_connect'] ? B(u['LobbyNetMgr'].Inst.urls[this['lb_index']]) : B(u['LobbyNetMgr'].Inst['lb_url']);
                        },
                        Z['prototype']['_setState'] = function(Z) {
                            this['connect_state'] = Z,
                                GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (Z == u['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : Z == u['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : Z == u['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : Z == u['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : Z == u['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                        },
                        Z['prototype']['_ConnectSuccess'] = function() {
                            var Z = this;
                            app.Log.log('MJNetMgr _ConnectSuccess '),
                                this['load_over'] = !1,
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function(y, o) {
                                    if (y || o['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('authGame', y, o), u['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
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
                                        //END
                                        var _ = [],
                                            B = 0;
                                        view['DesktopMgr']['player_link_state'] = o['state_list'];
                                        var R = u['Tools']['strOfLocalization'](2003),
                                            r = o['game_config'].mode,
                                            d = view['ERuleMode']['Liqi4'];
                                        r.mode < 10 ? (d = view['ERuleMode']['Liqi4'], Z['real_player_count'] = 4) : r.mode < 20 && (d = view['ERuleMode']['Liqi3'], Z['real_player_count'] = 3);
                                        for (var J = 0; J < Z['real_player_count']; J++)
                                            _.push(null);
                                        r['extendinfo'] && (R = u['Tools']['strOfLocalization'](2004)),
                                            r['detail_rule'] && r['detail_rule']['ai_level'] && (1 === r['detail_rule']['ai_level'] && (R = u['Tools']['strOfLocalization'](2003)), 2 === r['detail_rule']['ai_level'] && (R = u['Tools']['strOfLocalization'](2004)));
                                        for (var w = u['GameUtility']['get_default_ai_skin'](), z = u['GameUtility']['get_default_ai_character'](), J = 0; J < o['seat_list']['length']; J++) {
                                            var T = o['seat_list'][J];
                                            if (0 == T) {
                                                _[J] = {
                                                    nickname: R,
                                                    avatar_id: w,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: z,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: w,
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
                                                        _[J].avatar_id = skin.id;
                                                        _[J].character.charid = skin.character_id;
                                                        _[J].character.skin = skin.id;
                                                    }
                                                }
                                                if (MMP.settings.showServer == true) {
                                                    _[J].nickname = '[BOT]' + _[J].nickname;
                                                }
                                            } else {
                                                B++;
                                                for (var X = 0; X < o['players']['length']; X++)
                                                    if (o['players'][X]['account_id'] == T) {
                                                        _[J] = o['players'][X];
                                                        //修改牌桌上人物头像及皮肤
                                                        if (_[J].account_id == GameMgr.Inst.account_id) {
                                                            _[J].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                            _[J].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                            _[J].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                            _[J].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                            _[J].title = GameMgr.Inst.account_data.title;
                                                            if (MMP.settings.nickname != '') {
                                                                _[J].nickname = MMP.settings.nickname;
                                                            }
                                                        } else if (MMP.settings.randomPlayerDefSkin && (_[J].avatar_id == 400101 || _[J].avatar_id == 400201)) {
                                                            //玩家如果用了默认皮肤也随机换
                                                            let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                            let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                            let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                            // 修复皮肤错误导致无法进入游戏的bug
                                                            if (skin.id != 400000 && skin.id != 400001) {
                                                                _[J].avatar_id = skin.id;
                                                                _[J].character.charid = skin.character_id;
                                                                _[J].character.skin = skin.id;
                                                            }
                                                        }
                                                        if (MMP.settings.showServer == true) {
                                                            let server = game.Tools.get_zone_id(_[J].account_id);
                                                            if (server == 1) {
                                                                _[J].nickname = '[CN]' + _[J].nickname;
                                                            } else if (server == 2) {
                                                                _[J].nickname = '[JP]' + _[J].nickname;
                                                            } else if (server == 3) {
                                                                _[J].nickname = '[EN]' + _[J].nickname;
                                                            } else {
                                                                _[J].nickname = '[??]' + _[J].nickname;
                                                            }
                                                        }
                                                        // END
                                                        break;
                                                    }
                                            }
                                        }
                                        for (var J = 0; J < Z['real_player_count']; J++)
                                            null == _[J] && (_[J] = {
                                                account: 0,
                                                nickname: u['Tools']['strOfLocalization'](2010),
                                                avatar_id: w,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: z,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: w,
                                                    is_upgraded: !1
                                                }
                                            });
                                        Z['loaded_player_count'] = o['ready_id_list']['length'],
                                            Z['_AuthSuccess'](_, o['is_game_start'], o['game_config']['toJSON']());
                                    }
                                });
                        },
                        Z['prototype']['_AuthSuccess'] = function(Z, y, o) {
                            var _ = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                    app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                        round_id: view['DesktopMgr'].Inst['round_id'],
                                        step: view['DesktopMgr'].Inst['current_step']
                                    }, function(Z, y) {
                                        Z || y['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', Z, y), u['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](y)), y['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2011)), u['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](y['game_restore'])));
                                    });
                            })) : u['Scene_MJ'].Inst['openMJRoom'](o, Z, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](o)), Z, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](_, function() {
                                    y ? Laya['timer']['frameOnce'](10, _, function() {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                                round_id: '-1',
                                                step: 1000000
                                            }, function(Z, y) {
                                                app.Log.log('syncGame ' + JSON['stringify'](y)),
                                                    Z || y['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', Z, y), u['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), _['_PlayerReconnectSuccess'](y));
                                            });
                                    }) : Laya['timer']['frameOnce'](10, _, function() {
                                        app.Log.log('send enterGame'),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function(Z, y) {
                                                Z || y['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', Z, y), u['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), _['_EnterGame'](y), view['DesktopMgr'].Inst['fetchLinks']());
                                            });
                                    });
                                }));
                            }), Laya['Handler']['create'](this, function(u) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * u);
                            }, null, !1));
                        },
                        Z['prototype']['_EnterGame'] = function(Z) {
                            app.Log.log('正常进入游戏: ' + JSON['stringify'](Z)),
                                Z['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2011)), u['Scene_MJ'].Inst['GameEnd']()) : Z['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](Z['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                        },
                        Z['prototype']['_PlayerReconnectSuccess'] = function(Z) {
                            app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](Z)),
                                Z['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2011)), u['Scene_MJ'].Inst['GameEnd']()) : Z['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](Z['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](u['Tools']['strOfLocalization'](2012)), u['Scene_MJ'].Inst['ForceOut']());
                        },
                        Z['prototype']['_SendDebugInfo'] = function() {},
                        Z['prototype']['OpenConnectObserve'] = function(Z, y) {
                            var o = this;
                            this['is_ob'] = !0,
                                uiscript['UI_Loading'].Inst.show('enter_mj'),
                                this['Close'](),
                                view['AudioMgr']['StopMusic'](),
                                Laya['timer'].once(500, this, function() {
                                    o['server_location'] = y,
                                        o['ob_token'] = Z,
                                        o['_setState'](u['EConnectState']['tryconnect']),
                                        o['lb_index'] = 0,
                                        o['_fetch_gateway'](0);
                                });
                        },
                        Z['prototype']['_ConnectSuccessOb'] = function() {
                            var Z = this;
                            app.Log.log('MJNetMgr _ConnectSuccessOb '),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                    token: this['ob_token']
                                }, function(y, o) {
                                    y || o['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', y, o), u['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](o)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function(y, o) {
                                        if (y || o['error'])
                                            uiscript['UIMgr'].Inst['showNetReqError']('startObserve', y, o), u['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                        else {
                                            var _ = o.head,
                                                B = _['game_config'].mode,
                                                R = [],
                                                r = u['Tools']['strOfLocalization'](2003),
                                                d = view['ERuleMode']['Liqi4'];
                                            B.mode < 10 ? (d = view['ERuleMode']['Liqi4'], Z['real_player_count'] = 4) : B.mode < 20 && (d = view['ERuleMode']['Liqi3'], Z['real_player_count'] = 3);
                                            for (var J = 0; J < Z['real_player_count']; J++)
                                                R.push(null);
                                            B['extendinfo'] && (r = u['Tools']['strOfLocalization'](2004)),
                                                B['detail_rule'] && B['detail_rule']['ai_level'] && (1 === B['detail_rule']['ai_level'] && (r = u['Tools']['strOfLocalization'](2003)), 2 === B['detail_rule']['ai_level'] && (r = u['Tools']['strOfLocalization'](2004)));
                                            for (var w = u['GameUtility']['get_default_ai_skin'](), z = u['GameUtility']['get_default_ai_character'](), J = 0; J < _['seat_list']['length']; J++) {
                                                var T = _['seat_list'][J];
                                                if (0 == T)
                                                    R[J] = {
                                                        nickname: r,
                                                        avatar_id: w,
                                                        level: {
                                                            id: '10101'
                                                        },
                                                        level3: {
                                                            id: '20101'
                                                        },
                                                        character: {
                                                            charid: z,
                                                            level: 0,
                                                            exp: 0,
                                                            views: [],
                                                            skin: w,
                                                            is_upgraded: !1
                                                        }
                                                    };
                                                else
                                                    for (var X = 0; X < _['players']['length']; X++)
                                                        if (_['players'][X]['account_id'] == T) {
                                                            R[J] = _['players'][X];
                                                            break;
                                                        }
                                            }
                                            for (var J = 0; J < Z['real_player_count']; J++)
                                                null == R[J] && (R[J] = {
                                                    account: 0,
                                                    nickname: u['Tools']['strOfLocalization'](2010),
                                                    avatar_id: w,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: z,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: w,
                                                        is_upgraded: !1
                                                    }
                                                });
                                            Z['_StartObSuccuess'](R, o['passed'], _['game_config']['toJSON'](), _['start_time']);
                                        }
                                    }));
                                });
                        },
                        Z['prototype']['_StartObSuccuess'] = function(Z, y, o, _) {
                            var B = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](_, y);
                            })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), u['Scene_MJ'].Inst['openMJRoom'](o, Z, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](o)), Z, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](B, function() {
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, B, function() {
                                            GameMgr.Inst['EnterMJ'](),
                                                uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](_, y);
                                        });
                                }));
                            }), Laya['Handler']['create'](this, function(u) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * u);
                            }, null, !1)));
                        },
                        Z['_Inst'] = null,
                        Z;
                }
                ();
            u['MJNetMgr'] = Z;
        }
        (game || (game = {}));





        // 读取战绩
        ! function(u) {
            var Z = function(Z) {
                    function y() {
                        var u = Z.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                        return u['account_id'] = 0,
                            u['origin_x'] = 0,
                            u['origin_y'] = 0,
                            u.root = null,
                            u['title'] = null,
                            u['level'] = null,
                            u['btn_addfriend'] = null,
                            u['btn_report'] = null,
                            u['illust'] = null,
                            u.name = null,
                            u['detail_data'] = null,
                            u['achievement_data'] = null,
                            u['locking'] = !1,
                            u['tab_info4'] = null,
                            u['tab_info3'] = null,
                            u['tab_note'] = null,
                            u['tab_img_dark'] = '',
                            u['tab_img_chosen'] = '',
                            u['player_data'] = null,
                            u['tab_index'] = 1,
                            u['game_category'] = 1,
                            u['game_type'] = 1,
                            y.Inst = u,
                            u;
                    }
                    return __extends(y, Z),
                        y['prototype']['onCreate'] = function() {
                            var Z = this;
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                                this.root = this.me['getChildByName']('root'),
                                this['origin_x'] = this.root.x,
                                this['origin_y'] = this.root.y,
                                this['container_info'] = this.root['getChildByName']('container_info'),
                                this['title'] = new u['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                                this.name = this['container_info']['getChildByName']('name'),
                                this['level'] = new u['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                                this['detail_data'] = new u['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                                this['achievement_data'] = new u['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                                this['illust'] = new u['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                                this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                                this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['btn_addfriend']['visible'] = !1,
                                        Z['btn_report'].x = 343,
                                        app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                            target_id: Z['account_id']
                                        }, function() {});
                                }, null, !1),
                                this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                                this['btn_report']['clickHandler'] = new Laya['Handler'](this, function() {
                                    u['UI_Report_Nickname'].Inst.show(Z['account_id']);
                                }),
                                this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['locking'] || Z['close']();
                                }, null, !1),
                                this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['close']();
                                }, null, !1),
                                this.note = new u['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                                this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                                this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['locking'] || 1 != Z['tab_index'] && Z['changeMJCategory'](1);
                                }, null, !1),
                                this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                                this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['locking'] || 2 != Z['tab_index'] && Z['changeMJCategory'](2);
                                }, null, !1),
                                this['tab_note'] = this.root['getChildByName']('tab_note'),
                                this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? u['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : Z['container_info']['visible'] && (Z['container_info']['visible'] = !1, Z['tab_info4'].skin = Z['tab_img_dark'], Z['tab_info3'].skin = Z['tab_img_dark'], Z['tab_note'].skin = Z['tab_img_chosen'], Z['tab_index'] = 3, Z.note.show()));
                                }, null, !1),
                                this['locking'] = !1;
                        },
                        y['prototype'].show = function(Z, y, o, _) {
                            var B = this;
                            void 0 === y && (y = 1),
                                void 0 === o && (o = 2),
                                void 0 === _ && (_ = 1),
                                GameMgr.Inst['BehavioralStatistics'](14),
                                this['account_id'] = Z,
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this.root.y = this['origin_y'],
                                this['player_data'] = null,
                                u['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    B['locking'] = !1;
                                })),
                                this['detail_data']['reset'](),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                    account_id: Z
                                }, function(y, o) {
                                    y || o['error'] ? u['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', y, o) : u['UI_Shilian']['now_season_info'] && 1001 == u['UI_Shilian']['now_season_info']['season_id'] && 3 != u['UI_Shilian']['get_cur_season_state']() ? (B['detail_data']['setData'](o), B['changeMJCategory'](B['tab_index'], B['game_category'], B['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                        account_id: Z
                                    }, function(Z, y) {
                                        Z || y['error'] ? u['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', Z, y) : (o['season_info'] = y['season_info'], B['detail_data']['setData'](o), B['changeMJCategory'](B['tab_index'], B['game_category'], B['game_type']));
                                    });
                                }),
                                this.note['init_data'](Z),
                                this['refreshBaseInfo'](),
                                this['btn_report']['visible'] = Z != GameMgr.Inst['account_id'],
                                this['tab_index'] = y,
                                this['game_category'] = o,
                                this['game_type'] = _,
                                this['container_info']['visible'] = !0,
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        y['prototype']['refreshBaseInfo'] = function() {
                            var Z = this;
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
                                }, function(y, o) {
                                    if (y || o['error'])
                                        u['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', y, o);
                                    else {
                                        var _ = o['account'];
                                        //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                        if (_.account_id == GameMgr.Inst.account_id) {
                                            _.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                _.title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                _.nickname = MMP.settings.nickname;
                                            }
                                        }
                                        //end
                                        Z['player_data'] = _,
                                            game['Tools']['SetNickname'](Z.name, _),
                                            Z['title'].id = game['Tools']['titleLocalization'](_['account_id'], _['title']),
                                            Z['level'].id = _['level'].id,
                                            Z['level'].id = Z['player_data'][1 == Z['tab_index'] ? 'level' : 'level3'].id,
                                            Z['level'].exp = Z['player_data'][1 == Z['tab_index'] ? 'level' : 'level3']['score'],
                                            Z['illust'].me['visible'] = !0,
                                            Z['account_id'] == GameMgr.Inst['account_id'] ? Z['illust']['setSkin'](_['avatar_id'], 'waitingroom') : Z['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](_['avatar_id']), 'waitingroom'),
                                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], Z['account_id']) && Z['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(Z['account_id']) ? (Z['btn_addfriend']['visible'] = !0, Z['btn_report'].x = 520) : (Z['btn_addfriend']['visible'] = !1, Z['btn_report'].x = 343),
                                            Z.note.sign['setSign'](_['signature']),
                                            Z['achievement_data'].show(!1, _['achievement_count']);
                                    }
                                });
                        },
                        y['prototype']['changeMJCategory'] = function(u, Z, y) {
                            void 0 === Z && (Z = 2),
                                void 0 === y && (y = 1),
                                this['tab_index'] = u,
                                this['container_info']['visible'] = !0,
                                this['detail_data']['changeMJCategory'](u, Z, y),
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        y['prototype']['close'] = function() {
                            var Z = this;
                            this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), u['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                Z['locking'] = !1,
                                    Z['enable'] = !1;
                            }))));
                        },
                        y['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                        },
                        y['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                                this['detail_data']['close'](),
                                this['illust']['clear'](),
                                Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                        },
                        y.Inst = null,
                        y;
                }
                (u['UIBase']);
            u['UI_OtherPlayerInfo'] = Z;
        }
        (uiscript || (uiscript = {}));





        // 宿舍相关
        ! function(u) {
            var Z = function() {
                    function Z(Z, o) {
                        var _ = this;
                        this['_scale'] = 1,
                            this['during_move'] = !1,
                            this['mouse_start_x'] = 0,
                            this['mouse_start_y'] = 0,
                            this.me = Z,
                            this['container_illust'] = o,
                            this['illust'] = this['container_illust']['getChildByName']('illust'),
                            this['container_move'] = Z['getChildByName']('move'),
                            this['container_move'].on('mousedown', this, function() {
                                _['during_move'] = !0,
                                    _['mouse_start_x'] = _['container_move']['mouseX'],
                                    _['mouse_start_y'] = _['container_move']['mouseY'];
                            }),
                            this['container_move'].on('mousemove', this, function() {
                                _['during_move'] && (_.move(_['container_move']['mouseX'] - _['mouse_start_x'], _['container_move']['mouseY'] - _['mouse_start_y']), _['mouse_start_x'] = _['container_move']['mouseX'], _['mouse_start_y'] = _['container_move']['mouseY']);
                            }),
                            this['container_move'].on('mouseup', this, function() {
                                _['during_move'] = !1;
                            }),
                            this['container_move'].on('mouseout', this, function() {
                                _['during_move'] = !1;
                            }),
                            this['btn_close'] = Z['getChildByName']('btn_close'),
                            this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                _['locking'] || _['close']();
                            }, null, !1),
                            this['scrollbar'] = Z['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                            this['scrollbar'].init(new Laya['Handler'](this, function(u) {
                                _['_scale'] = 1 * (1 - u) + 0.5,
                                    _['illust']['scaleX'] = _['_scale'],
                                    _['illust']['scaleY'] = _['_scale'],
                                    _['scrollbar']['setVal'](u, 0);
                            })),
                            this['dongtai_kaiguan'] = new u['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                y.Inst['illust']['resetSkin']();
                            }), new Laya['Handler'](this, function(u) {
                                y.Inst['illust']['playAnim'](u);
                            })),
                            this['dongtai_kaiguan']['setKaiguanPos'](-462, -536);
                    }
                    return Object['defineProperty'](Z['prototype'], 'scale', {
                            get: function() {
                                return this['_scale'];
                            },
                            set: function(u) {
                                this['_scale'] = u,
                                    this['scrollbar']['setVal'](1 - (u - 0.5) / 1, 0);
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Z['prototype'].show = function(Z) {
                            var o = this;
                            this['locking'] = !0,
                                this['when_close'] = Z,
                                this['illust_start_x'] = this['illust'].x,
                                this['illust_start_y'] = this['illust'].y,
                                this['illust_center_x'] = this['illust'].x + 984 - 446,
                                this['illust_center_y'] = this['illust'].y + 11 - 84,
                                this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                                this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                                this['container_illust']['getChildByName']('btn')['visible'] = !1,
                                y.Inst['stopsay'](),
                                this['scale'] = 1,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_center_x'],
                                    y: this['illust_center_y']
                                }, 200),
                                u['UIBase']['anim_pop_out'](this['btn_close'], null),
                                this['during_move'] = !1,
                                Laya['timer'].once(250, this, function() {
                                    o['locking'] = !1;
                                }),
                                this.me['visible'] = !0,
                                this['dongtai_kaiguan']['refresh'](y.Inst['illust']['skin_id']);
                        },
                        Z['prototype']['close'] = function() {
                            var Z = this;
                            this['locking'] = !0,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                                this['container_illust']['getChildByName']('btn')['visible'] = !0,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_start_x'],
                                    y: this['illust_start_y'],
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200),
                                u['UIBase']['anim_pop_hide'](this['btn_close'], null),
                                Laya['timer'].once(250, this, function() {
                                    Z['locking'] = !1,
                                        Z.me['visible'] = !1,
                                        Z['when_close'].run();
                                });
                        },
                        Z['prototype'].move = function(u, Z) {
                            var y = this['illust'].x + u,
                                o = this['illust'].y + Z;
                            y < this['illust_center_x'] - 600 ? y = this['illust_center_x'] - 600 : y > this['illust_center_x'] + 600 && (y = this['illust_center_x'] + 600),
                                o < this['illust_center_y'] - 1200 ? o = this['illust_center_y'] - 1200 : o > this['illust_center_y'] + 800 && (o = this['illust_center_y'] + 800),
                                this['illust'].x = y,
                                this['illust'].y = o;
                        },
                        Z;
                }
                (),
                y = function(y) {
                    function o() {
                        var u = y.call(this, new ui['lobby']['susheUI']()) || this;
                        return u['contianer_illust'] = null,
                            u['illust'] = null,
                            u['illust_rect'] = null,
                            u['container_name'] = null,
                            u['label_name'] = null,
                            u['label_cv'] = null,
                            u['label_cv_title'] = null,
                            u['container_page'] = null,
                            u['container_look_illust'] = null,
                            u['page_select_character'] = null,
                            u['page_visit_character'] = null,
                            u['origin_illust_x'] = 0,
                            u['chat_id'] = 0,
                            u['container_chat'] = null,
                            u['_select_index'] = 0,
                            u['sound_channel'] = null,
                            u['chat_block'] = null,
                            u['illust_showing'] = !0,
                            o.Inst = u,
                            u;
                    }
                    return __extends(o, y),
                        o['randomDesktopID'] = function() {
                            var Z = u['UI_Sushe']['commonViewList'][u['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), Z)
                                for (var y = 0; y < Z['length']; y++)
                                    Z[y].slot == game['EView'].mjp ? this['now_mjp_id'] = Z[y].type ? Z[y]['item_id_list'][Math['floor'](Math['random']() * Z[y]['item_id_list']['length'])] : Z[y]['item_id'] : Z[y].slot == game['EView']['desktop'] && (this['now_desktop_id'] = Z[y].type ? Z[y]['item_id_list'][Math['floor'](Math['random']() * Z[y]['item_id_list']['length'])] : Z[y]['item_id']);
                        },
                        o.init = function(Z) {
                            var y = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function(_, B) {
                                    if (_ || B['error'])
                                        u['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', _, B);
                                    else {
                                        if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](B)), B = JSON['parse'](JSON['stringify'](B)), B['main_character_id'] && B['characters']) {
                                            // if (y['characters'] = [], B['characters'])
                                            //    for (var R = 0; R < B['characters']['length']; R++)
                                            //        y['characters'].push(B['characters'][R]);
                                            // if (y['skin_map'] = {}, B['skins'])
                                            //    for (var R = 0; R < B['skins']['length']; R++)
                                            //        y['skin_map'][B['skins'][R]] = 1;
                                            // y['main_character_id'] = B['main_character_id'];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            fake_data.char_id = B.main_character_id;
                                            for (let i = 0; i < B.characters.length; i++) {
                                                if (B.characters[i].charid == B.main_character_id) {
                                                    if (B.characters[i].extra_emoji !== undefined) {
                                                        fake_data.emoji = B.characters[i].extra_emoji;
                                                    } else {
                                                        fake_data.emoji = [];
                                                    }
                                                    fake_data.skin = B.skins[i];
                                                    fake_data.exp = B.characters[i].exp;
                                                    fake_data.level = B.characters[i].level;
                                                    fake_data.is_upgraded = B.characters[i].is_upgraded;
                                                    break;
                                                }
                                            }
                                            y.characters = [];

                                            for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                let id = 200000 + j;
                                                let skin = 400001 + j * 100;
                                                let emoji = [];
                                                cfg.character.emoji.getGroup(id).forEach((element) => {
                                                    emoji.push(element.sub_id);
                                                });
                                                y.characters.push({
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
                                            y.main_character_id = MMP.settings.character;
                                            GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                            uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                            y.star_chars = MMP.settings.star_chars;
                                            B.character_sort = MMP.settings.star_chars;
                                            // END
                                        } else
                                            y['characters'] = [], y['characters'].push({
                                                charid: '200001',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400101',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), y['characters'].push({
                                                charid: '200002',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400201',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), y['skin_map']['400101'] = 1, y['skin_map']['400201'] = 1, y['main_character_id'] = '200001';
                                        if (y['send_gift_count'] = 0, y['send_gift_limit'] = 0, B['send_gift_count'] && (y['send_gift_count'] = B['send_gift_count']), B['send_gift_limit'] && (y['send_gift_limit'] = B['send_gift_limit']), B['finished_endings'])
                                            for (var R = 0; R < B['finished_endings']['length']; R++)
                                                y['finished_endings_map'][B['finished_endings'][R]] = 1;
                                        if (B['rewarded_endings'])
                                            for (var R = 0; R < B['rewarded_endings']['length']; R++)
                                                y['rewarded_endings_map'][B['rewarded_endings'][R]] = 1;
                                        if (y['star_chars'] = [], B['character_sort'] && (y['star_chars'] = B['character_sort']), o['hidden_characters_map'] = {}, B['hidden_characters'])
                                            for (var r = 0, d = B['hidden_characters']; r < d['length']; r++) {
                                                var J = d[r];
                                                o['hidden_characters_map'][J] = 1;
                                            }
                                        Z.run();
                                    }
                                }),
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (Z, o) {
                                //     if (Z || o['error'])
                                //         u['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', Z, o);
                                //     else {
                                //         y['using_commonview_index'] = o.use,
                                //         y['commonViewList'] = [[], [], [], [], [], [], [], []];
                                //         var _ = o['views'];
                                //         if (_)
                                //             for (var B = 0; B < _['length']; B++) {
                                //                 var R = _[B]['values'];
                                //                 R && (y['commonViewList'][_[B]['index']] = R);
                                //             }
                                y['randomDesktopID'](),
                                y.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view'](),
                                GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //     }
                            //  });
                        },
                        o['on_data_updata'] = function(Z) {
                            if (Z['character']) {
                                var y = JSON['parse'](JSON['stringify'](Z['character']));
                                if (y['characters'])
                                    for (var o = y['characters'], _ = 0; _ < o['length']; _++) {
                                        for (var B = !1, R = 0; R < this['characters']['length']; R++)
                                            if (this['characters'][R]['charid'] == o[_]['charid']) {
                                                this['characters'][R] = o[_],
                                                    u['UI_Sushe_Visit'].Inst && u['UI_Sushe_Visit'].Inst['chara_info'] && u['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][R]['charid'] && (u['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][R]),
                                                    B = !0;
                                                break;
                                            }
                                        B || this['characters'].push(o[_]);
                                    }
                                if (y['skins']) {
                                    for (var r = y['skins'], _ = 0; _ < r['length']; _++)
                                        this['skin_map'][r[_]] = 1;
                                    u['UI_Bag'].Inst['on_skin_change']();
                                }
                                if (y['finished_endings']) {
                                    for (var d = y['finished_endings'], _ = 0; _ < d['length']; _++)
                                        this['finished_endings_map'][d[_]] = 1;
                                    u['UI_Sushe_Visit'].Inst;
                                }
                                if (y['rewarded_endings']) {
                                    for (var d = y['rewarded_endings'], _ = 0; _ < d['length']; _++)
                                        this['rewarded_endings_map'][d[_]] = 1;
                                    u['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        o['chara_owned'] = function(u) {
                            for (var Z = 0; Z < this['characters']['length']; Z++)
                                if (this['characters'][Z]['charid'] == u)
                                    return !0;
                            return !1;
                        },
                        o['skin_owned'] = function(u) {
                            return this['skin_map']['hasOwnProperty'](u['toString']());
                        },
                        o['add_skin'] = function(u) {
                            this['skin_map'][u] = 1;
                        },
                        Object['defineProperty'](o, 'main_chara_info', {
                            get: function() {
                                for (var u = 0; u < this['characters']['length']; u++)
                                    if (this['characters'][u]['charid'] == this['main_character_id'])
                                        return this['characters'][u];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        o['on_view_remove'] = function(u) {
                            for (var Z = 0; Z < this['commonViewList']['length']; Z++)
                                for (var y = this['commonViewList'][Z], o = 0; o < y['length']; o++)
                                    if (y[o]['item_id'] == u && (y[o]['item_id'] = game['GameUtility']['get_view_default_item_id'](y[o].slot)), y[o]['item_id_list']) {
                                        for (var _ = 0; _ < y[o]['item_id_list']['length']; _++)
                                            if (y[o]['item_id_list'][_] == u) {
                                                y[o]['item_id_list']['splice'](_, 1);
                                                break;
                                            }
                                        0 == y[o]['item_id_list']['length'] && (y[o].type = 0);
                                    }
                            var B = cfg['item_definition'].item.get(u);
                            B.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == u && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        o['add_finish_ending'] = function(u) {
                            this['finished_endings_map'][u] = 1;
                        },
                        o['add_reward_ending'] = function(u) {
                            this['rewarded_endings_map'][u] = 1;
                        },
                        o['check_all_char_repoint'] = function() {
                            for (var u = 0; u < o['characters']['length']; u++)
                                if (this['check_char_redpoint'](o['characters'][u]))
                                    return !0;
                            return !1;
                        },
                        o['check_char_redpoint'] = function(u) {
                            // 去除小红点
                            // if (o['hidden_characters_map'][u['charid']])
                            return !1;
                            //END
                            var Z = cfg.spot.spot['getGroup'](u['charid']);
                            if (Z)
                                for (var y = 0; y < Z['length']; y++) {
                                    var _ = Z[y];
                                    if (!(_['is_married'] && !u['is_upgraded'] || !_['is_married'] && u['level'] < _['level_limit']) && 2 == _.type) {
                                        for (var B = !0, R = 0; R < _['jieju']['length']; R++)
                                            if (_['jieju'][R] && o['finished_endings_map'][_['jieju'][R]]) {
                                                if (!o['rewarded_endings_map'][_['jieju'][R]])
                                                    return !0;
                                                B = !1;
                                            }
                                        if (B)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        o['is_char_star'] = function(u) {
                            return -1 != this['star_chars']['indexOf'](u);
                        },
                        o['change_char_star'] = function(u) {
                            var Z = this['star_chars']['indexOf'](u); -
                            1 != Z ? this['star_chars']['splice'](Z, 1) : this['star_chars'].push(u)
                                // 屏蔽网络请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                                //      sort: this['star_chars']
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
                            var y = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new u['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust_rect'] = u['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new u['UI_Character_Chat'](this['container_chat']),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!y['page_visit_character'].me['visible'] || !y['page_visit_character']['cannot_click_say'])
                                        if (y['illust']['onClick'](), y['sound_channel'])
                                            y['stopsay']();
                                        else {
                                            if (!y['illust_showing'])
                                                return;
                                            y.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new u['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new u['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new Z(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        o['prototype'].show = function(u) {
                            GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var Z = 0, y = 0; y < o['characters']['length']; y++)
                                if (o['characters'][y]['charid'] == o['main_character_id']) {
                                    Z = y;
                                    break;
                                }
                            0 == u ? (this['change_select'](Z), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
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
                                u['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        o['prototype']['close'] = function(Z) {
                            var y = this;
                            this['illust_showing'] && u['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                    x: -30
                                }, 150, 0),
                                Laya['timer'].once(150, this, function() {
                                    y['enable'] = !1,
                                        Z && Z.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        o['prototype']['hide_illust'] = function() {
                            var Z = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, u['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                Z['contianer_illust']['visible'] = !1;
                            })));
                        },
                        o['prototype']['open_illust'] = function() {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, u['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var Z = 0, y = 0; y < o['characters']['length']; y++)
                                        if (o['characters'][y]['charid'] == o['main_character_id']) {
                                            Z = y;
                                            break;
                                        }
                                    this['change_select'](Z);
                                }
                        },
                        o['prototype']['show_page_select'] = function() {
                            this['page_select_character'].show(0);
                        },
                        o['prototype']['show_page_visit'] = function(u) {
                            void 0 === u && (u = 0),
                                this['page_visit_character'].show(o['characters'][this['_select_index']], u);
                        },
                        o['prototype']['change_select'] = function(Z) {
                            this['_select_index'] = Z,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var y = o['characters'][Z];
                            this['label_name'].text = 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? cfg['item_definition']['character'].get(y['charid'])['name_' + GameMgr['client_language']]['replace']('-', '|') : cfg['item_definition']['character'].get(y['charid'])['name_' + GameMgr['client_language']],
                                'chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != o['chs_fengyu_name_lst']['indexOf'](y['charid']) ? 'fengyu' : 'hanyi'),
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['label_cv'].text = cfg['item_definition']['character'].get(y['charid'])['desc_cv_' + GameMgr['client_language']], this['label_cv_title'].text = 'CV') : this['label_cv'].text = 'CV:' + cfg['item_definition']['character'].get(y['charid'])['desc_cv_' + GameMgr['client_language']],
                                'chs' == GameMgr['client_language'] && (this['label_cv'].font = -1 != o['chs_fengyu_cv_lst']['indexOf'](y['charid']) ? 'fengyu' : 'hanyi'),
                                ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv_title'].y = 355 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var _ = new u['UIRect']();
                            _.x = this['illust_rect'].x,
                                _.y = this['illust_rect'].y,
                                _['width'] = this['illust_rect']['width'],
                                _['height'] = this['illust_rect']['height'],
                                '405503' == y.skin ? _.y -= 70 : '403303' == y.skin && (_.y += 117),
                                this['illust']['setRect'](_),
                                this['illust']['setSkin'](y.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                u['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var B = cfg['item_definition'].skin.get(y.skin);
                            B['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        o['prototype']['onChangeSkin'] = function(u) {
                            o['characters'][this['_select_index']].skin = u,
                                this['change_select'](this['_select_index']),
                                o['characters'][this['_select_index']]['charid'] == o['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = u)
                                // 屏蔽换肤请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //     character_id: o['characters'][this['_select_index']]['charid'],
                                //     skin: u
                                // }, function () {});
                                // 保存皮肤
                        },
                        o['prototype'].say = function(u) {
                            var Z = this,
                                y = o['characters'][this['_select_index']];
                            this['chat_id']++;
                            var _ = this['chat_id'],
                                B = view['AudioMgr']['PlayCharactorSound'](y, u, Laya['Handler']['create'](this, function() {
                                    Laya['timer'].once(1000, Z, function() {
                                        _ == Z['chat_id'] && Z['stopsay']();
                                    });
                                }));
                            B && (this['chat_block'].show(B['words']), this['sound_channel'] = B['sound']);
                        },
                        o['prototype']['stopsay'] = function() {
                            this['chat_block']['close'](!1),
                                this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                        },
                        o['prototype']['to_look_illust'] = function() {
                            var u = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function() {
                                u['illust']['playAnim']('idle'),
                                    u['page_select_character'].show(0);
                            }));
                        },
                        o['prototype']['jump_to_char_skin'] = function(Z, y) {
                            var _ = this;
                            if (void 0 === Z && (Z = -1), void 0 === y && (y = null), Z >= 0)
                                for (var B = 0; B < o['characters']['length']; B++)
                                    if (o['characters'][B]['charid'] == Z) {
                                        this['change_select'](B);
                                        break;
                                    }
                            u['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    _['page_visit_character']['show_pop_skin'](),
                                    _['page_visit_character']['set_jump_callback'](y);
                            }));
                        },
                        o['prototype']['jump_to_char_qiyue'] = function(Z) {
                            var y = this;
                            if (void 0 === Z && (Z = -1), Z >= 0)
                                for (var _ = 0; _ < o['characters']['length']; _++)
                                    if (o['characters'][_]['charid'] == Z) {
                                        this['change_select'](_);
                                        break;
                                    }
                            u['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    y['page_visit_character']['show_qiyue']();
                            }));
                        },
                        o['prototype']['jump_to_char_gift'] = function(Z) {
                            var y = this;
                            if (void 0 === Z && (Z = -1), Z >= 0)
                                for (var _ = 0; _ < o['characters']['length']; _++)
                                    if (o['characters'][_]['charid'] == Z) {
                                        this['change_select'](_);
                                        break;
                                    }
                            u['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                o.Inst['show_page_visit'](),
                                    y['page_visit_character']['show_gift']();
                            }));
                        },
                        o['characters'] = [],
                        o['chs_fengyu_name_lst'] = ['200040', '200043'],
                        o['chs_fengyu_cv_lst'] = ['200047', '200050', '200054'],
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
                (u['UIBase']);
            u['UI_Sushe'] = y;
        }
        (uiscript || (uiscript = {}));





        // 屏蔽改变宿舍角色的网络请求
        ! function(u) {
            var Z = function() {
                    function Z(Z) {
                        var o = this;
                        this['scrollview'] = null,
                            this['select_index'] = 0,
                            this['show_index_list'] = [],
                            this['only_show_star_char'] = !1,
                            this.me = Z,
                            this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y.Inst['locking'] || y.Inst['close'](Laya['Handler']['create'](o, function() {
                                    u['UI_Sushe'].Inst['show_page_visit']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y.Inst['locking'] || y.Inst['close'](Laya['Handler']['create'](o, function() {
                                    u['UI_Sushe'].Inst['to_look_illust']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y.Inst['locking'] || u['UI_Sushe'].Inst['jump_to_char_skin']();
                            }, null, !1),
                            this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y.Inst['locking'] || o['onChangeStarShowBtnClick']();
                            }, null, !1),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['dongtai_kaiguan'] = new u['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                u['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                    }
                    return Z['prototype'].show = function(Z, y) {
                            void 0 === y && (y = !1),
                                this.me['visible'] = !0,
                                Z ? this.me['alpha'] = 1 : u['UIBase']['anim_alpha_in'](this.me, {
                                    x: 0
                                }, 200, 0),
                                this['getShowStarState'](),
                                this['sortShowCharsList'](),
                                y || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47),
                                this['scrollview']['reset'](),
                                this['scrollview']['addItem'](this['show_index_list']['length']);
                        },
                        Z['prototype']['render_character_cell'] = function(Z) {
                            var y = this,
                                o = Z['index'],
                                _ = Z['container'],
                                B = Z['cache_data'];
                            _['visible'] = !0,
                                B['index'] = o,
                                B['inited'] || (B['inited'] = !0, _['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                    y['onClickAtHead'](B['index']);
                                }), B.skin = new u['UI_Character_Skin'](_['getChildByName']('btn')['getChildByName']('head')), B.bg = _['getChildByName']('btn')['getChildByName']('bg'), B['bound'] = _['getChildByName']('btn')['getChildByName']('bound'), B['btn_star'] = _['getChildByName']('btn_star'), B.star = _['getChildByName']('btn')['getChildByName']('star'), B['btn_star']['clickHandler'] = new Laya['Handler'](this, function() {
                                    y['onClickAtStar'](B['index']);
                                }));
                            var R = _['getChildByName']('btn');
                            R['getChildByName']('choose')['visible'] = o == this['select_index'];
                            var r = this['getCharInfoByIndex'](o);
                            R['getChildByName']('redpoint')['visible'] = u['UI_Sushe']['check_char_redpoint'](r),
                                B.skin['setSkin'](r.skin, 'bighead'),
                                R['getChildByName']('using')['visible'] = r['charid'] == u['UI_Sushe']['main_character_id'],
                                _['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (r['is_upgraded'] ? '2.png' : '.png'));
                            var d = cfg['item_definition']['character'].get(r['charid']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? B['bound'].skin = d.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (r['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (r['is_upgraded'] ? '2.png' : '.png')) : d.ur ? (B['bound'].pos(-10, -2), B['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (r['is_upgraded'] ? '6.png' : '5.png'))) : (B['bound'].pos(4, 20), B['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (r['is_upgraded'] ? '4.png' : '3.png'))),
                                B['btn_star']['visible'] = this['select_index'] == o,
                                B.star['visible'] = u['UI_Sushe']['is_char_star'](r['charid']) || this['select_index'] == o,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (B.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (u['UI_Sushe']['is_char_star'](r['charid']) ? 'l' : 'd') + (r['is_upgraded'] ? '1.png' : '.png')), R['getChildByName']('label_name').text = cfg['item_definition']['character'].find(r['charid'])['name_' + GameMgr['client_language']]['replace']('-', '|')) : (B.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (u['UI_Sushe']['is_char_star'](r['charid']) ? 'l.png' : 'd.png')), R['getChildByName']('label_name').text = cfg['item_definition']['character'].find(r['charid'])['name_' + GameMgr['client_language']]),
                                ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == r['charid'] ? (R['getChildByName']('label_name')['scaleX'] = 0.67, R['getChildByName']('label_name')['scaleY'] = 0.57) : (R['getChildByName']('label_name')['scaleX'] = 0.7, R['getChildByName']('label_name')['scaleY'] = 0.6));
                        },
                        Z['prototype']['onClickAtHead'] = function(Z) {
                            if (this['select_index'] == Z) {
                                var y = this['getCharInfoByIndex'](Z);
                                if (y['charid'] != u['UI_Sushe']['main_character_id'])
                                    if (u['UI_PiPeiYuYue'].Inst['enable'])
                                        u['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                    else {
                                        var o = u['UI_Sushe']['main_character_id'];
                                        u['UI_Sushe']['main_character_id'] = y['charid'],
                                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                            //    character_id: u['UI_Sushe']['main_character_id']
                                            //}, function () {}),
                                            GameMgr.Inst['account_data']['avatar_id'] = y.skin;
                                        // 保存人物和皮肤
                                        MMP.settings.character = y.charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = y.skin;
                                        MMP.saveSettings();
                                        // END
                                        for (var _ = 0; _ < this['show_index_list']['length']; _++)
                                            this['getCharInfoByIndex'](_)['charid'] == o && this['scrollview']['wantToRefreshItem'](_);
                                        this['scrollview']['wantToRefreshItem'](Z);
                                    }
                            } else {
                                var B = this['select_index'];
                                this['select_index'] = Z,
                                    B >= 0 && this['scrollview']['wantToRefreshItem'](B),
                                    this['scrollview']['wantToRefreshItem'](Z),
                                    u['UI_Sushe'].Inst['change_select'](this['show_index_list'][Z]);
                            }
                        },
                        Z['prototype']['onClickAtStar'] = function(Z) {
                            if (u['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](Z)['charid']), this['only_show_star_char'])
                                this['scrollview']['wantToRefreshItem'](Z);
                            else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                                var y = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                                this['scrollview'].rate = Math.min(1, Math.max(0, y));
                            }
                            // 保存人物和皮肤
                            MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                            MMP.saveSettings();
                            // END
                        },
                        Z['prototype']['close'] = function(Z) {
                            var y = this;
                            this.me['visible'] && (Z ? this.me['visible'] = !1 : u['UIBase']['anim_alpha_out'](this.me, {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                y.me['visible'] = !1;
                            })));
                        },
                        Z['prototype']['onChangeStarShowBtnClick'] = function() {
                            if (!this['only_show_star_char']) {
                                for (var Z = !1, y = 0, o = u['UI_Sushe']['star_chars']; y < o['length']; y++) {
                                    var _ = o[y];
                                    if (!u['UI_Sushe']['hidden_characters_map'][_]) {
                                        Z = !0;
                                        break;
                                    }
                                }
                                if (!Z)
                                    return u['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                            }
                            u['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                                this['only_show_star_char'] = !this['only_show_star_char'],
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                            var B = this.me['getChildByName']('btn_star')['getChildAt'](1);
                            Laya['Tween']['clearAll'](B),
                                Laya['Tween'].to(B, {
                                    x: this['only_show_star_char'] ? 107 : 47
                                }, 150),
                                this.show(!0, !0);
                        },
                        Z['prototype']['getShowStarState'] = function() {
                            if (0 == u['UI_Sushe']['star_chars']['length'])
                                return this['only_show_star_char'] = !1, void 0;
                            if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                                for (var Z = 0, y = u['UI_Sushe']['star_chars']; Z < y['length']; Z++) {
                                    var o = y[Z];
                                    if (!u['UI_Sushe']['hidden_characters_map'][o])
                                        return;
                                }
                                this['only_show_star_char'] = !1,
                                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                            }
                        },
                        Z['prototype']['sortShowCharsList'] = function() {
                            this['show_index_list'] = [],
                                this['select_index'] = -1;
                            for (var Z = 0, y = u['UI_Sushe']['star_chars']; Z < y['length']; Z++) {
                                var o = y[Z];
                                if (!u['UI_Sushe']['hidden_characters_map'][o])
                                    for (var _ = 0; _ < u['UI_Sushe']['characters']['length']; _++)
                                        if (u['UI_Sushe']['characters'][_]['charid'] == o) {
                                            _ == u['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                                this['show_index_list'].push(_);
                                            break;
                                        }
                            }
                            if (!this['only_show_star_char'])
                                for (var _ = 0; _ < u['UI_Sushe']['characters']['length']; _++)
                                    u['UI_Sushe']['hidden_characters_map'][u['UI_Sushe']['characters'][_]['charid']] || -1 == this['show_index_list']['indexOf'](_) && (_ == u['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(_));
                        },
                        Z['prototype']['getCharInfoByIndex'] = function(Z) {
                            return u['UI_Sushe']['characters'][this['show_index_list'][Z]];
                        },
                        Z;
                }
                (),
                y = function(y) {
                    function o() {
                        var u = y.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return u['bg_width_head'] = 962,
                            u['bg_width_zhuangban'] = 1819,
                            u['bg2_delta'] = -29,
                            u['container_top'] = null,
                            u['locking'] = !1,
                            u.tabs = [],
                            u['tab_index'] = 0,
                            o.Inst = u,
                            u;
                    }
                    return __extends(o, y),
                        o['prototype']['onCreate'] = function() {
                            var y = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    y['locking'] || (1 == y['tab_index'] && y['container_zhuangban']['changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](y, function() {
                                        y['close'](),
                                            u['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (y['close'](), u['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var o = this.root['getChildByName']('container_tabs'), _ = function(Z) {
                                    B.tabs.push(o['getChildAt'](Z)),
                                        B.tabs[Z]['clickHandler'] = new Laya['Handler'](B, function() {
                                            y['locking'] || y['tab_index'] != Z && (1 == y['tab_index'] && y['container_zhuangban']['changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](y, function() {
                                                y['change_tab'](Z);
                                            }), null) : y['change_tab'](Z));
                                        });
                                }, B = this, R = 0; R < o['numChildren']; R++)
                                _(R);
                            this['container_head'] = new Z(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new u['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                    return y['locking'];
                                }));
                        },
                        o['prototype'].show = function(Z) {
                            var y = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = Z,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), u['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), u['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), u['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), u['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function() {
                                    y['locking'] = !1;
                                });
                            for (var o = 0; o < this.tabs['length']; o++) {
                                var _ = this.tabs[o];
                                _.skin = game['Tools']['localUISrc'](o == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var B = _['getChildByName']('word');
                                B['color'] = o == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    B['scaleX'] = B['scaleY'] = o == this['tab_index'] ? 1.1 : 1,
                                    o == this['tab_index'] && _['parent']['setChildIndex'](_, this.tabs['length'] - 1);
                            }
                        },
                        o['prototype']['change_tab'] = function(Z) {
                            var y = this;
                            this['tab_index'] = Z;
                            for (var o = 0; o < this.tabs['length']; o++) {
                                var _ = this.tabs[o];
                                _.skin = game['Tools']['localUISrc'](o == Z ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var B = _['getChildByName']('word');
                                B['color'] = o == Z ? '#552c1c' : '#d3a86c',
                                    B['scaleX'] = B['scaleY'] = o == Z ? 1.1 : 1,
                                    o == Z && _['parent']['setChildIndex'](_, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    u['UI_Sushe'].Inst['open_illust'](),
                                        y['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), u['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    y['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function() {
                                    y['locking'] = !1;
                                });
                        },
                        o['prototype']['close'] = function(Z) {
                            var y = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? u['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    y['container_head']['close'](!0);
                                })) : u['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    y['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function() {
                                    y['locking'] = !1,
                                        y['enable'] = !1,
                                        Z && Z.run();
                                });
                        },
                        o['prototype']['onDisable'] = function() {
                            for (var Z = 0; Z < u['UI_Sushe']['characters']['length']; Z++) {
                                var y = u['UI_Sushe']['characters'][Z].skin,
                                    o = cfg['item_definition'].skin.get(y);
                                o && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](o.path + '/bighead.png'));
                            }
                        },
                        o['prototype']['changeKaiguanShow'] = function(u) {
                            u ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        o;
                }
                (u['UIBase']);
            u['UI_Sushe_Select'] = y;
        }
        (uiscript || (uiscript = {}));



        // 友人房
        ! function(u) {
            var Z = function() {
                    function Z(u) {
                        var Z = this;
                        this['friends'] = [],
                            this['sortlist'] = [],
                            this.me = u,
                            this.me['visible'] = !1,
                            this['blackbg'] = u['getChildByName']('blackbg'),
                            this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                Z['locking'] || Z['close']();
                            }, null, !1),
                            this.root = u['getChildByName']('root'),
                            this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                            this['noinfo'] = this.root['getChildByName']('noinfo');
                    }
                    return Z['prototype'].show = function() {
                            var Z = this;
                            this['locking'] = !0,
                                this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['friends'] = [],
                                this['sortlist'] = [];
                            for (var y = game['FriendMgr']['friend_list'], o = 0; o < y['length']; o++)
                                this['sortlist'].push(o);
                            this['sortlist'] = this['sortlist'].sort(function(u, Z) {
                                var o = y[u],
                                    _ = 0;
                                if (o['state']['is_online']) {
                                    var B = game['Tools']['playState2Desc'](o['state']['playing']);
                                    _ += '' != B ? 30000000000 : 60000000000,
                                        o.base['level'] && (_ += o.base['level'].id % 1000 * 10000000),
                                        o.base['level3'] && (_ += o.base['level3'].id % 1000 * 10000),
                                        _ += -Math['floor'](o['state']['login_time'] / 10000000);
                                } else
                                    _ += o['state']['logout_time'];
                                var R = y[Z],
                                    r = 0;
                                if (R['state']['is_online']) {
                                    var B = game['Tools']['playState2Desc'](R['state']['playing']);
                                    r += '' != B ? 30000000000 : 60000000000,
                                        R.base['level'] && (r += R.base['level'].id % 1000 * 10000000),
                                        R.base['level3'] && (r += R.base['level3'].id % 1000 * 10000),
                                        r += -Math['floor'](R['state']['login_time'] / 10000000);
                                } else
                                    r += R['state']['logout_time'];
                                return r - _;
                            });
                            for (var o = 0; o < y['length']; o++)
                                this['friends'].push({
                                    f: y[o],
                                    invited: !1
                                });
                            this['noinfo']['visible'] = 0 == this['friends']['length'],
                                this['scrollview']['addItem'](this['friends']['length']),
                                u['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    Z['locking'] = !1;
                                }));
                        },
                        Z['prototype']['close'] = function() {
                            var Z = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    Z['locking'] = !1,
                                        Z.me['visible'] = !1;
                                }));
                        },
                        Z['prototype']['render_item'] = function(Z) {
                            var y = Z['index'],
                                o = Z['container'],
                                B = Z['cache_data'];
                            B.head || (B.head = new u['UI_Head'](o['getChildByName']('head'), 'UI_WaitingRoom'), B.name = o['getChildByName']('name'), B['state'] = o['getChildByName']('label_state'), B.btn = o['getChildByName']('btn_invite'), B['invited'] = o['getChildByName']('invited'));
                            var R = this['friends'][this['sortlist'][y]];
                            B.head.id = game['GameUtility']['get_limited_skin_id'](R.f.base['avatar_id']),
                                B.head['set_head_frame'](R.f.base['account_id'], R.f.base['avatar_frame']),
                                game['Tools']['SetNickname'](B.name, R.f.base);
                            var r = !1;
                            if (R.f['state']['is_online']) {
                                var d = game['Tools']['playState2Desc'](R.f['state']['playing']);
                                '' != d ? (B['state'].text = game['Tools']['strOfLocalization'](2069, [d]), B['state']['color'] = '#a9d94d', B.name['color'] = '#a9d94d') : (B['state'].text = game['Tools']['strOfLocalization'](2071), B['state']['color'] = '#58c4db', B.name['color'] = '#58c4db', r = !0);
                            } else
                                B['state'].text = game['Tools']['strOfLocalization'](2072), B['state']['color'] = '#8c8c8c', B.name['color'] = '#8c8c8c';
                            R['invited'] ? (B.btn['visible'] = !1, B['invited']['visible'] = !0) : (B.btn['visible'] = !0, B['invited']['visible'] = !1, game['Tools']['setGrayDisable'](B.btn, !r), r && (B.btn['clickHandler'] = Laya['Handler']['create'](this, function() {
                                game['Tools']['setGrayDisable'](B.btn, !0);
                                var Z = {
                                    room_id: _.Inst['room_id'],
                                    mode: _.Inst['room_mode'],
                                    nickname: GameMgr.Inst['account_data']['nickname'],
                                    verified: GameMgr.Inst['account_data']['verified'],
                                    account_id: GameMgr.Inst['account_id']
                                };
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                    target_id: R.f.base['account_id'],
                                    type: game['EFriendMsgType']['room_invite'],
                                    content: JSON['stringify'](Z)
                                }, function(Z, y) {
                                    Z || y['error'] ? (game['Tools']['setGrayDisable'](B.btn, !1), u['UIMgr'].Inst['showNetReqError']('sendClientMessage', Z, y)) : (B.btn['visible'] = !1, B['invited']['visible'] = !0, R['invited'] = !0);
                                });
                            }, null, !1)));
                        },
                        Z;
                }
                (),
                y = function() {
                    function Z(Z) {
                        var y = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = Z,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new u['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new u['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                return y['locking'];
                            }));
                        for (var o = this.root['getChildByName']('container_tabs'), _ = function(Z) {
                                B.tabs.push(o['getChildAt'](Z)),
                                    B.tabs[Z]['clickHandler'] = new Laya['Handler'](B, function() {
                                        y['locking'] || y['tab_index'] != Z && (1 == y['tab_index'] && y['page_zhangban']['changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](y, function() {
                                            y['change_tab'](Z);
                                        }), null) : y['change_tab'](Z));
                                    });
                            }, B = this, R = 0; R < o['numChildren']; R++)
                            _(R);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function() {
                                y['locking'] || (1 == y['tab_index'] && y['page_zhangban']['changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](y, function() {
                                    y['close'](!1);
                                }), null) : y['close'](!1));
                            }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                y['locking'] || (1 == y['tab_index'] && y['page_zhangban']['changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](y, function() {
                                    y['close'](!1);
                                }), null) : y['close'](!1));
                            });
                    }
                    return Z['prototype'].show = function() {
                            var Z = this;
                            this.me['visible'] = !0,
                                this['blackmask']['alpha'] = 0,
                                this['locking'] = !0,
                                Laya['Tween'].to(this['blackmask'], {
                                    alpha: 0.3
                                }, 150),
                                u['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    Z['locking'] = !1;
                                })),
                                this['tab_index'] = 0,
                                this['page_zhangban']['close'](!0),
                                this['page_head'].show(!0);
                            for (var y = 0; y < this.tabs['length']; y++) {
                                var o = this.tabs[y];
                                o.skin = game['Tools']['localUISrc'](y == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var _ = o['getChildByName']('word');
                                _['color'] = y == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    _['scaleX'] = _['scaleY'] = y == this['tab_index'] ? 1.1 : 1,
                                    y == this['tab_index'] && o['parent']['setChildIndex'](o, this.tabs['length'] - 1);
                            }
                        },
                        Z['prototype']['change_tab'] = function(u) {
                            var Z = this;
                            this['tab_index'] = u;
                            for (var y = 0; y < this.tabs['length']; y++) {
                                var o = this.tabs[y];
                                o.skin = game['Tools']['localUISrc'](y == u ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var _ = o['getChildByName']('word');
                                _['color'] = y == u ? '#552c1c' : '#d3a86c',
                                    _['scaleX'] = _['scaleY'] = y == u ? 1.1 : 1,
                                    y == u && o['parent']['setChildIndex'](o, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(200, this, function() {
                                    Z['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(200, this, function() {
                                    Z['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function() {
                                    Z['locking'] = !1;
                                });
                        },
                        Z['prototype']['close'] = function(Z) {
                            var y = this;
                            //修改友人房间立绘
                            if (!(y.page_head.choosed_chara_index == 0 && y.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = y.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = y.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = y.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[U.page_head.choosed_chara_index] = y.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (Z ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: _.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function() {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), u['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                y['locking'] = !1,
                                    y.me['visible'] = !1;
                            }))));
                        },
                        Z;
                }
                (),
                o = function() {
                    function u(u) {
                        this['modes'] = [],
                            this.me = u,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return u['prototype'].show = function(u) {
                            this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['modes'] = u,
                                this['scrollview']['addItem'](u['length']);
                            var Z = this['scrollview']['total_height'];
                            Z > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - Z, this.bg['height'] = Z + 20),
                                this.bg['visible'] = !0;
                        },
                        u['prototype']['render_item'] = function(u) {
                            var Z = u['index'],
                                y = u['container'],
                                o = y['getChildByName']('info');
                            o['fontSize'] = 40,
                                o['fontSize'] = this['modes'][Z]['length'] <= 5 ? 40 : this['modes'][Z]['length'] <= 9 ? 55 - 3 * this['modes'][Z]['length'] : 28,
                                o.text = this['modes'][Z];
                        },
                        u;
                }
                (),
                _ = function(_) {
                    function B() {
                        var Z = _.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return Z['skin_ready'] = 'myres/room/btn_ready.png',
                            Z['skin_cancel'] = 'myres/room/btn_cancel.png',
                            Z['skin_start'] = 'myres/room/btn_start.png',
                            Z['skin_start_no'] = 'myres/room/btn_start_no.png',
                            Z['update_seq'] = 0,
                            Z['pre_msgs'] = [],
                            Z['msg_tail'] = -1,
                            Z['posted'] = !1,
                            Z['label_rommid'] = null,
                            Z['player_cells'] = [],
                            Z['btn_ok'] = null,
                            Z['btn_invite_friend'] = null,
                            Z['btn_add_robot'] = null,
                            Z['btn_dress'] = null,
                            Z['beReady'] = !1,
                            Z['room_id'] = -1,
                            Z['owner_id'] = -1,
                            Z['tournament_id'] = 0,
                            Z['max_player_count'] = 0,
                            Z['players'] = [],
                            Z['container_rules'] = null,
                            Z['container_top'] = null,
                            Z['container_right'] = null,
                            Z['locking'] = !1,
                            Z['mousein_copy'] = !1,
                            Z['popout'] = null,
                            Z['room_link'] = null,
                            Z['btn_copy_link'] = null,
                            Z['last_start_room'] = 0,
                            Z['invitefriend'] = null,
                            Z['pre_choose'] = null,
                            Z['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            B.Inst = Z,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](Z, function(u) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](u)),
                                    Z['onReadyChange'](u['account_id'], u['ready'], u['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](Z, function(u) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](u)),
                                    Z['onPlayerChange'](u);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](Z, function(u) {
                                Z['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](u)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), Z['onGameStart'](u));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](Z, function(u) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](u)),
                                    Z['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](Z, function() {
                                Z['enable'] && Z.hide(Laya['Handler']['create'](Z, function() {
                                    u['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            Z;
                    }
                    return __extends(B, _),
                        B['prototype']['push_msg'] = function(u) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](u)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](u));
                        },
                        Object['defineProperty'](B['prototype'], 'inRoom', {
                            get: function() {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](B['prototype'], 'robot_count', {
                            get: function() {
                                for (var u = 0, Z = 0; Z < this['players']['length']; Z++)
                                    2 == this['players'][Z]['category'] && u++;
                                return u;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        B['prototype']['resetData'] = function() {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        B['prototype']['updateData'] = function(u) {
                            if (!u)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < u.persons.length; i++) {

                                if (u.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    u.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    u.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    u.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    u.persons[i].title = GameMgr.Inst.account_data.title;
                                    u.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        u.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = u['room_id'],
                                this['owner_id'] = u['owner_id'],
                                this['room_mode'] = u.mode,
                                this['public_live'] = u['public_live'],
                                this['tournament_id'] = 0,
                                u['tournament_id'] && (this['tournament_id'] = u['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = u['max_player_count'],
                                this['players'] = [];
                            for (var Z = 0; Z < u['persons']['length']; Z++) {
                                var y = u['persons'][Z];
                                y['ready'] = !1,
                                    y['cell_index'] = -1,
                                    y['category'] = 1,
                                    this['players'].push(y);
                            }
                            for (var Z = 0; Z < u['robot_count']; Z++)
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
                            for (var Z = 0; Z < u['ready_list']['length']; Z++)
                                for (var o = 0; o < this['players']['length']; o++)
                                    if (this['players'][o]['account_id'] == u['ready_list'][Z]) {
                                        this['players'][o]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                u.seq && (this['update_seq'] = u.seq);
                        },
                        B['prototype']['onReadyChange'] = function(u, Z, y) {
                            for (var o = 0; o < this['players']['length']; o++)
                                if (this['players'][o]['account_id'] == u) {
                                    this['players'][o]['ready'] = Z,
                                        this['players'][o]['dressing'] = y,
                                        this['_onPlayerReadyChange'](this['players'][o]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        B['prototype']['onPlayerChange'] = function(u) {
                            if (app.Log.log(u), u = u['toJSON'](), !(u.seq && u.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < u.player_list.length; i++) {

                                    if (u.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        u.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        u.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        u.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            u.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (u.update_list != undefined) {
                                    for (var i = 0; i < u.update_list.length; i++) {

                                        if (u.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            u.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            u.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            u.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                u.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = u.seq;
                                var Z = {};
                                Z.type = 'onPlayerChange0',
                                    Z['players'] = this['players'],
                                    Z.msg = u,
                                    this['push_msg'](JSON['stringify'](Z));
                                var y = this['robot_count'],
                                    o = u['robot_count'];
                                if (o < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, y--);
                                    for (var _ = 0; _ < this['players']['length']; _++)
                                        2 == this['players'][_]['category'] && y > o && (this['players'][_]['category'] = 0, y--);
                                }
                                for (var B = [], R = u['player_list'], _ = 0; _ < this['players']['length']; _++)
                                    if (1 == this['players'][_]['category']) {
                                        for (var r = -1, d = 0; d < R['length']; d++)
                                            if (R[d]['account_id'] == this['players'][_]['account_id']) {
                                                r = d;
                                                break;
                                            }
                                        if (-1 != r) {
                                            var J = R[r];
                                            B.push(this['players'][_]),
                                                this['players'][_]['avatar_id'] = J['avatar_id'],
                                                this['players'][_]['title'] = J['title'],
                                                this['players'][_]['verified'] = J['verified'];
                                        }
                                    } else
                                        2 == this['players'][_]['category'] && B.push(this['players'][_]);
                                this['players'] = B;
                                for (var _ = 0; _ < R['length']; _++) {
                                    for (var w = !1, J = R[_], d = 0; d < this['players']['length']; d++)
                                        if (1 == this['players'][d]['category'] && this['players'][d]['account_id'] == J['account_id']) {
                                            w = !0;
                                            break;
                                        }
                                    w || this['players'].push({
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
                                for (var z = [!1, !1, !1, !1], _ = 0; _ < this['players']['length']; _++)
                                    -
                                    1 != this['players'][_]['cell_index'] && (z[this['players'][_]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][_]));
                                for (var _ = 0; _ < this['players']['length']; _++)
                                    if (1 == this['players'][_]['category'] && -1 == this['players'][_]['cell_index'])
                                        for (var d = 0; d < this['max_player_count']; d++)
                                            if (!z[d]) {
                                                this['players'][_]['cell_index'] = d,
                                                    z[d] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][_]);
                                                break;
                                            }
                                for (var y = this['robot_count'], o = u['robot_count']; o > y;) {
                                    for (var T = -1, d = 0; d < this['max_player_count']; d++)
                                        if (!z[d]) {
                                            T = d;
                                            break;
                                        }
                                    if (-1 == T)
                                        break;
                                    z[T] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: T,
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
                                        y++;
                                }
                                for (var _ = 0; _ < this['max_player_count']; _++)
                                    z[_] || this['_clearCell'](_);
                                var Z = {};
                                if (Z.type = 'onPlayerChange1', Z['players'] = this['players'], this['push_msg'](JSON['stringify'](Z)), u['owner_id']) {
                                    if (this['owner_id'] = u['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var d = 0; d < this['players']['length']; d++)
                                                if (this['players'][d] && this['players'][d]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][d]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var d = 0; d < this['players']['length']; d++)
                                            if (this['players'][d] && this['players'][d]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][d]);
                                                break;
                                            }
                            }
                        },
                        B['prototype']['onBeKictOut'] = function() {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), u['UI_Lobby'].Inst['enable'] = !0, u['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        B['prototype']['onCreate'] = function() {
                            var _ = this;
                            this['last_start_room'] = 0;
                            var B = this.me['getChildByName']('root');
                            this['container_top'] = B['getChildByName']('top'),
                                this['container_right'] = B['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var R = function(Z) {
                                    var y = B['getChildByName']('player_' + Z['toString']()),
                                        o = {};
                                    o['index'] = Z,
                                        o['container'] = y,
                                        o['container_flag'] = y['getChildByName']('flag'),
                                        o['container_flag']['visible'] = !1,
                                        o['container_name'] = y['getChildByName']('container_name'),
                                        o.name = y['getChildByName']('container_name')['getChildByName']('name'),
                                        o['btn_t'] = y['getChildByName']('btn_t'),
                                        o['container_illust'] = y['getChildByName']('container_illust'),
                                        o['illust'] = new u['UI_Character_Skin'](y['getChildByName']('container_illust')['getChildByName']('illust')),
                                        o.host = y['getChildByName']('host'),
                                        o['title'] = new u['UI_PlayerTitle'](y['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                        o.rank = new u['UI_Level'](y['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                        o['is_robot'] = !1;
                                    var R = 0;
                                    o['btn_t']['clickHandler'] = Laya['Handler']['create'](r, function() {
                                            if (!(_['locking'] || Laya['timer']['currTimer'] < R)) {
                                                R = Laya['timer']['currTimer'] + 500;
                                                for (var u = 0; u < _['players']['length']; u++)
                                                    if (_['players'][u]['cell_index'] == Z) {
                                                        _['kickPlayer'](u);
                                                        break;
                                                    }
                                            }
                                        }, null, !1),
                                        o['btn_info'] = y['getChildByName']('btn_info'),
                                        o['btn_info']['clickHandler'] = Laya['Handler']['create'](r, function() {
                                            if (!_['locking'])
                                                for (var y = 0; y < _['players']['length']; y++)
                                                    if (_['players'][y]['cell_index'] == Z) {
                                                        _['players'][y]['account_id'] && _['players'][y]['account_id'] > 0 && u['UI_OtherPlayerInfo'].Inst.show(_['players'][y]['account_id'], _['room_mode'].mode < 10 ? 1 : 2, 1);
                                                        break;
                                                    }
                                        }, null, !1),
                                        r['player_cells'].push(o);
                                }, r = this, d = 0; 4 > d; d++)
                                R(d);
                            this['btn_ok'] = B['getChildByName']('btn_ok');
                            var J = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                Laya['timer']['currTimer'] < J + 500 || (J = Laya['timer']['currTimer'], _['owner_id'] == GameMgr.Inst['account_id'] ? _['getStart']() : _['switchReady']());
                            }, null, !1);
                            var w = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['timer']['currTimer'] < w + 500 || (w = Laya['timer']['currTimer'], _['leaveRoom']());
                                }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    _['locking'] || _['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var z = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    _['locking'] || Laya['timer']['currTimer'] < z || (z = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                        robot_count: _['robot_count'] + 1
                                    }, function(Z, y) {
                                        (Z || y['error'] && 1111 != y['error'].code) && u['UIMgr'].Inst['showNetReqError']('modifyRoom_add', Z, y),
                                            z = 0;
                                    }));
                                }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!_['locking']) {
                                        var Z = 0;
                                        _['room_mode']['detail_rule'] && _['room_mode']['detail_rule']['chuanma'] && (Z = 1),
                                            u['UI_Rules'].Inst.show(0, null, Z);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function() {
                                    _['locking'] || _['beReady'] && _['owner_id'] != GameMgr.Inst['account_id'] || (_['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: _['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function() {}));
                                });
                            var T = this['container_right']['getChildByName']('btn_copy');
                            T.on('mouseover', this, function() {
                                    _['mousein_copy'] = !0;
                                }),
                                T.on('mouseout', this, function() {
                                    _['mousein_copy'] = !1;
                                }),
                                T['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    _['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), _['popout']['visible'] = !0, u['UIBase']['anim_pop_out'](_['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new o(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    var Z = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    Z.call('setSysClipboardText', _['room_link'].text),
                                        u['UIBase']['anim_pop_hide'](_['popout'], Laya['Handler']['create'](_, function() {
                                            _['popout']['visible'] = !1;
                                        })),
                                        u['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', _['room_link'].text, function() {}),
                                        u['UIBase']['anim_pop_hide'](_['popout'], Laya['Handler']['create'](_, function() {
                                            _['popout']['visible'] = !1;
                                        })),
                                        u['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    u['UIBase']['anim_pop_hide'](_['popout'], Laya['Handler']['create'](_, function() {
                                        _['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new Z(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new y(this.me['getChildByName']('pop_view'));
                        },
                        B['prototype'].show = function() {
                            var Z = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var y = 0; 4 > y; y++)
                                this['player_cells'][y]['container']['visible'] = y < this['max_player_count'];
                            for (var y = 0; y < this['max_player_count']; y++)
                                this['_clearCell'](y);
                            for (var y = 0; y < this['players']['length']; y++)
                                this['players'][y]['cell_index'] = y, this['_refreshPlayerInfo'](this['players'][y]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var o = {};
                            o.type = 'show',
                                o['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](o)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var _ = [];
                            _.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var B = this['room_mode']['detail_rule'];
                            if (B) {
                                var R = 5,
                                    r = 20;
                                if (null != B['time_fixed'] && (R = B['time_fixed']), null != B['time_add'] && (r = B['time_add']), _.push(R['toString']() + '+' + r['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var d = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    d && _.push(d.name);
                                }
                                if (null != B['init_point'] && _.push(game['Tools']['strOfLocalization'](2199) + B['init_point']), null != B['fandian'] && _.push(game['Tools']['strOfLocalization'](2094) + ':' + B['fandian']), B['guyi_mode'] && _.push(game['Tools']['strOfLocalization'](3028)), null != B['dora_count'])
                                    switch (B['chuanma'] && (B['dora_count'] = 0), B['dora_count']) {
                                        case 0:
                                            _.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            _.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            _.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            _.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != B['shiduan'] && 1 != B['shiduan'] && _.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === B['fanfu'] && _.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === B['fanfu'] && _.push(game['Tools']['strOfLocalization'](2764)),
                                    null != B['bianjietishi'] && 1 != B['bianjietishi'] && _.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != B['have_zimosun'] && 1 != B['have_zimosun'] ? _.push(game['Tools']['strOfLocalization'](2202)) : _.push(game['Tools']['strOfLocalization'](2203)));
                            }
                            this['container_rules'].show(_),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                u['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var y = 0; y < this['player_cells']['length']; y++)
                                u['UIBase']['anim_alpha_in'](this['player_cells'][y]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * y, null, Laya.Ease['backOut']);
                            u['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                u['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function() {
                                    Z['locking'] = !1;
                                });
                            var J = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != J && (this['room_link'].text += '(' + J + ')');
                            var w = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + w + '?room=' + this['room_id'];
                        },
                        B['prototype']['leaveRoom'] = function() {
                            var Z = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(y, o) {
                                y || o['error'] ? u['UIMgr'].Inst['showNetReqError']('leaveRoom', y, o) : (Z['room_id'] = -1, Z.hide(Laya['Handler']['create'](Z, function() {
                                    u['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        B['prototype']['tryToClose'] = function(Z) {
                            var y = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(o, _) {
                                o || _['error'] ? (u['UIMgr'].Inst['showNetReqError']('leaveRoom', o, _), Z['runWith'](!1)) : (y['enable'] = !1, y['pop_change_view']['close'](!0), Z['runWith'](!0));
                            });
                        },
                        B['prototype'].hide = function(Z) {
                            var y = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var o = 0; o < this['player_cells']['length']; o++)
                                u['UIBase']['anim_alpha_out'](this['player_cells'][o]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            u['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                u['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function() {
                                    y['locking'] = !1,
                                        y['enable'] = !1,
                                        Z && Z.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        B['prototype']['onDisbale'] = function() {
                            Laya['timer']['clearAll'](this);
                            for (var u = 0; u < this['player_cells']['length']; u++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][u]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        B['prototype']['switchReady'] = function() {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function() {}));
                        },
                        B['prototype']['getStart'] = function() {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function(Z, y) {
                                (Z || y['error']) && u['UIMgr'].Inst['showNetReqError']('startRoom', Z, y);
                            })));
                        },
                        B['prototype']['kickPlayer'] = function(Z) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var y = this['players'][Z];
                                1 == y['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][Z]['account_id']
                                }, function() {}) : 2 == y['category'] && (this['pre_choose'] = y, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function(Z, y) {
                                    (Z || y['error']) && u['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', Z, y);
                                }));
                            }
                        },
                        B['prototype']['_clearCell'] = function(u) {
                            if (!(0 > u || u >= this['player_cells']['length'])) {
                                var Z = this['player_cells'][u];
                                Z['container_flag']['visible'] = !1,
                                    Z['container_illust']['visible'] = !1,
                                    Z.name['visible'] = !1,
                                    Z['container_name']['visible'] = !1,
                                    Z['btn_t']['visible'] = !1,
                                    Z.host['visible'] = !1;
                            }
                        },
                        B['prototype']['_refreshPlayerInfo'] = function(u) {
                            var Z = u['cell_index'];
                            if (!(0 > Z || Z >= this['player_cells']['length'])) {
                                var y = this['player_cells'][Z];
                                y['container_illust']['visible'] = !0,
                                    y['container_name']['visible'] = !0,
                                    y.name['visible'] = !0,
                                    game['Tools']['SetNickname'](y.name, u),
                                    y['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && u['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == u['account_id'] && (y['container_flag']['visible'] = !0, y.host['visible'] = !0),
                                    u['account_id'] == GameMgr.Inst['account_id'] ? y['illust']['setSkin'](u['avatar_id'], 'waitingroom') : y['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](u['avatar_id']), 'waitingroom'),
                                    y['title'].id = game['Tools']['titleLocalization'](u['account_id'], u['title']),
                                    y.rank.id = u[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](u);
                            }
                        },
                        B['prototype']['_onPlayerReadyChange'] = function(u) {
                            var Z = u['cell_index'];
                            if (!(0 > Z || Z >= this['player_cells']['length'])) {
                                var y = this['player_cells'][Z];
                                y['container_flag']['visible'] = this['owner_id'] == u['account_id'] ? !0 : u['ready'];
                            }
                        },
                        B['prototype']['refreshAsOwner'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var u = 0, Z = 0; Z < this['players']['length']; Z++)
                                    0 != this['players'][Z]['category'] && (this['_refreshPlayerInfo'](this['players'][Z]), u++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], u == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], u == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        B['prototype']['refreshStart'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var u = 0, Z = 0; Z < this['players']['length']; Z++) {
                                    var y = this['players'][Z];
                                    if (!y || 0 == y['category'])
                                        break;
                                    (y['account_id'] == this['owner_id'] || y['ready']) && u++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], u != this['max_player_count']), this['enable']) {
                                    for (var o = 0, Z = 0; Z < this['max_player_count']; Z++) {
                                        var _ = this['player_cells'][Z];
                                        _ && _['container_flag']['visible'] && o++;
                                    }
                                    if (u != o && !this['posted']) {
                                        this['posted'] = !0;
                                        var B = {};
                                        B['okcount'] = u,
                                            B['okcount2'] = o,
                                            B.msgs = [];
                                        var R = 0,
                                            r = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (R = (this['msg_tail'] + 1) % this['pre_msgs']['length'], r = this['msg_tail']), R >= 0 && r >= 0) {
                                            for (var Z = R; Z != r; Z = (Z + 1) % this['pre_msgs']['length'])
                                                B.msgs.push(this['pre_msgs'][Z]);
                                            B.msgs.push(this['pre_msgs'][r]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', B, !1);
                                    }
                                }
                            }
                        },
                        B['prototype']['onGameStart'] = function(u) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](u['connect_token'], u['game_uuid'], u['location'], !1, null);
                        },
                        B['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        B['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        B.Inst = null,
                        B;
                }
                (u['UIBase']);
            u['UI_WaitingRoom'] = _;
        }
        (uiscript || (uiscript = {}));




        // 保存装扮
        ! function(u) {
            var Z;
            ! function(Z) {
                var y = function() {
                        function y(y, o, _) {
                            var B = this;
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
                                this['_locking'] = _,
                                this['container_zhuangban0'] = y,
                                this['container_zhuangban1'] = o;
                            var R = this['container_zhuangban0']['getChildByName']('tabs');
                            R['vScrollBarSkin'] = '';
                            for (var r = function(Z) {
                                    var y = R['getChildAt'](Z);
                                    d.tabs.push(y),
                                        y['clickHandler'] = new Laya['Handler'](d, function() {
                                            B['locking'] || B['tab_index'] != Z && (B['_changed'] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](B, function() {
                                                B['change_tab'](Z);
                                            }), null) : B['change_tab'](Z));
                                        });
                                }, d = this, J = 0; J < R['numChildren']; J++)
                                r(J);
                            this['page_items'] = new Z['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                                this['page_headframe'] = new Z['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                                this['page_bgm'] = new Z['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                                this['page_desktop'] = new Z['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                                this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                                this['scrollview']['setElastic'](),
                                this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                                this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                                this['btn_save']['clickHandler'] = new Laya['Handler'](this, function() {
                                    for (var Z = [], y = 0; y < B['cell_titles']['length']; y++) {
                                        var o = B['slot_ids'][y];
                                        if (B['slot_map'][o]) {
                                            var _ = B['slot_map'][o];
                                            if (!(_['item_id'] && _['item_id'] != B['cell_default_item'][y] || _['item_id_list'] && 0 != _['item_id_list']['length']))
                                                continue;
                                            var R = [];
                                            if (_['item_id_list'])
                                                for (var r = 0, d = _['item_id_list']; r < d['length']; r++) {
                                                    var J = d[r];
                                                    J == B['cell_default_item'][y] ? R.push(0) : R.push(J);
                                                }
                                            Z.push({
                                                slot: o,
                                                item_id: _['item_id'],
                                                type: _.type,
                                                item_id_list: R
                                            });
                                        }
                                    }
                                    B['btn_save']['mouseEnabled'] = !1;
                                    var w = B['tab_index'];
                                    // START
                                    // app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                    //     views: Z,
                                    //     save_index: w,
                                    //     is_use: w == u['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                    // }, function (y, o) {
                                    //     if (B['btn_save']['mouseEnabled'] = !0, y || o['error'])
                                    //         u['UIMgr'].Inst['showNetReqError']('saveCommonViews', y, o);
                                    //     else {
                                    if (u['UI_Sushe']['commonViewList']['length'] < w)
                                        for (var _ = u['UI_Sushe']['commonViewList']['length']; w >= _; _++)
                                            u['UI_Sushe']['commonViewList'].push([]);
                                    MMP.settings.commonViewList = u.UI_Sushe.commonViewList;
                                    MMP.settings.using_commonview_index = u.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    //END
                                    if (u['UI_Sushe']['commonViewList'][w] = Z, u['UI_Sushe']['using_commonview_index'] == w && B['onChangeGameView'](), B['tab_index'] != w)
                                        return;
                                    B['btn_save']['mouseEnabled'] = !0,
                                        B['_changed'] = !1,
                                        B['refresh_btn']();
                                    //     }
                                    // });
                                }),
                                this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                                this['btn_use']['clickHandler'] = new Laya['Handler'](this, function() {
                                    B['btn_use']['mouseEnabled'] = !1;
                                    var Z = B['tab_index'];
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                        index: Z
                                    }, function(y, o) {
                                        B['btn_use']['mouseEnabled'] = !0,
                                            y || o['error'] ? u['UIMgr'].Inst['showNetReqError']('useCommonView', y, o) : (u['UI_Sushe']['using_commonview_index'] = Z, B['refresh_btn'](), B['refresh_tab'](), B['onChangeGameView']());
                                    });
                                }),
                                this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                                this['random_slider'] = this['random']['getChildByName']('slider'),
                                this['btn_random'] = this['random']['getChildByName']('btn'),
                                this['btn_random']['clickHandler'] = new Laya['Handler'](this, function() {
                                    B['onRandomBtnClick']();
                                });
                        }
                        return Object['defineProperty'](y['prototype'], 'locking', {
                                get: function() {
                                    return this['_locking'] ? this['_locking'].run() : !1;
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            Object['defineProperty'](y['prototype'], 'changed', {
                                get: function() {
                                    return this['_changed'];
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            y['prototype'].show = function(Z) {
                                game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                    this['container_zhuangban0']['visible'] = !0,
                                    this['container_zhuangban1']['visible'] = !0,
                                    Z ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (u['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                        x: 0
                                    }, 200), u['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                        x: 0
                                    }, 200)),
                                    this['change_tab'](u['UI_Sushe']['using_commonview_index']);
                            },
                            y['prototype']['change_tab'] = function(Z) {
                                if (this['tab_index'] = Z, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                    if (this['tab_index'] < u['UI_Sushe']['commonViewList']['length'])
                                        for (var y = u['UI_Sushe']['commonViewList'][this['tab_index']], o = 0; o < y['length']; o++)
                                            this['slot_map'][y[o].slot] = y[o];
                                    this['scrollview']['addItem'](this['cell_titles']['length']),
                                        this['onChangeSlotSelect'](0),
                                        this['refresh_btn']();
                                }
                            },
                            y['prototype']['refresh_tab'] = function() {
                                for (var Z = 0; Z < this.tabs['length']; Z++) {
                                    var y = this.tabs[Z];
                                    y['mouseEnabled'] = this['tab_index'] != Z,
                                        y['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == Z ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                        y['getChildByName']('num')['color'] = this['tab_index'] == Z ? '#2f1e19' : '#f2c797';
                                    var o = y['getChildByName']('choosed');
                                    u['UI_Sushe']['using_commonview_index'] == Z ? (o['visible'] = !0, o.x = this['tab_index'] == Z ? -18 : -4) : o['visible'] = !1;
                                }
                            },
                            y['prototype']['refresh_btn'] = function() {
                                this['btn_save']['visible'] = !1,
                                    this['btn_save']['mouseEnabled'] = !0,
                                    this['btn_use']['visible'] = !1,
                                    this['btn_use']['mouseEnabled'] = !0,
                                    this['btn_using']['visible'] = !1,
                                    this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = u['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = u['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                            },
                            y['prototype']['onChangeSlotSelect'] = function(u) {
                                var Z = this;
                                this['select_index'] = u,
                                    this['random']['visible'] = !(6 == u || 9 == u);
                                var y = 0;
                                u >= 0 && u < this['cell_default_item']['length'] && (y = this['cell_default_item'][u]);
                                var o = y,
                                    _ = this['slot_ids'][u],
                                    B = !1,
                                    R = [];
                                if (this['slot_map'][_]) {
                                    var r = this['slot_map'][_];
                                    R = r['item_id_list'],
                                        B = !!r.type,
                                        r['item_id'] && (o = this['slot_map'][_]['item_id']),
                                        B && r['item_id_list'] && r['item_id_list']['length'] > 0 && (o = r['item_id_list'][0]);
                                }
                                var d = Laya['Handler']['create'](this, function(o) {
                                    if (o == y && (o = 0), Z['is_random']) {
                                        var B = Z['slot_map'][_]['item_id_list']['indexOf'](o);
                                        B >= 0 ? Z['slot_map'][_]['item_id_list']['splice'](B, 1) : (Z['slot_map'][_]['item_id_list'] && 0 != Z['slot_map'][_]['item_id_list']['length'] || (Z['slot_map'][_]['item_id_list'] = []), Z['slot_map'][_]['item_id_list'].push(o));
                                    } else
                                        Z['slot_map'][_] || (Z['slot_map'][_] = {}), Z['slot_map'][_]['item_id'] = o;
                                    Z['scrollview']['wantToRefreshItem'](u),
                                        Z['_changed'] = !0,
                                        Z['refresh_btn']();
                                }, null, !1);
                                this['page_items']['close'](),
                                    this['page_desktop']['close'](),
                                    this['page_headframe']['close'](),
                                    this['page_bgm']['close'](),
                                    this['is_random'] = B,
                                    this['random_slider'].x = B ? 76 : -4,
                                    this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                    this['random']['getChildAt'](2)['visible'] = this['is_random'];
                                var J = game['Tools']['strOfLocalization'](this['cell_titles'][u]);
                                if (u >= 0 && 2 >= u)
                                    this['page_items'].show(J, u, o, d), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (3 == u)
                                    this['page_items'].show(J, 10, o, d), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (4 == u)
                                    this['page_items'].show(J, 3, o, d), this['setRandomGray'](!this['page_items']['can_random']());
                                else if (5 == u)
                                    this['page_bgm'].show(J, o, d), this['setRandomGray'](!this['page_bgm']['can_random']());
                                else if (6 == u)
                                    this['page_headframe'].show(J, o, d);
                                else if (7 == u || 8 == u) {
                                    var w = this['cell_default_item'][7],
                                        z = this['cell_default_item'][8];
                                    if (7 == u) {
                                        if (w = o, this['slot_map'][game['EView'].mjp]) {
                                            var T = this['slot_map'][game['EView'].mjp];
                                            T.type && T['item_id_list'] && T['item_id_list']['length'] > 0 ? z = T['item_id_list'][0] : T['item_id'] && (z = T['item_id']);
                                        }
                                        this['page_desktop']['show_desktop'](J, w, z, d);
                                    } else {
                                        if (z = o, this['slot_map'][game['EView']['desktop']]) {
                                            var T = this['slot_map'][game['EView']['desktop']];
                                            T.type && T['item_id_list'] && T['item_id_list']['length'] > 0 ? w = T['item_id_list'][0] : T['item_id'] && (w = T['item_id']);
                                        }
                                        this['page_desktop']['show_mjp'](J, w, z, d);
                                    }
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                                } else
                                    9 == u && this['page_desktop']['show_lobby_bg'](J, o, d);
                            },
                            y['prototype']['onRandomBtnClick'] = function() {
                                var u = this;
                                if (6 != this['select_index'] && 9 != this['select_index']) {
                                    this['_changed'] = !0,
                                        this['refresh_btn'](),
                                        this['is_random'] = !this['is_random'],
                                        this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                        Laya['Tween'].to(this['random_slider'], {
                                            x: this['is_random'] ? 76 : -4
                                        }, 100, null, Laya['Handler']['create'](this, function() {
                                            u['random']['getChildAt'](u['is_random'] ? 1 : 2)['visible'] = !1;
                                        }));
                                    var Z = this['select_index'],
                                        y = this['slot_ids'][Z],
                                        o = 0;
                                    Z >= 0 && Z < this['cell_default_item']['length'] && (o = this['cell_default_item'][Z]);
                                    var _ = o,
                                        B = [];
                                    if (this['slot_map'][y]) {
                                        var R = this['slot_map'][y];
                                        B = R['item_id_list'],
                                            R['item_id'] && (_ = this['slot_map'][y]['item_id']);
                                    }
                                    if (Z >= 0 && 4 >= Z) {
                                        var r = this['slot_map'][y];
                                        r ? (r.type = r.type ? 0 : 1, r['item_id_list'] && 0 != r['item_id_list']['length'] || (r['item_id_list'] = [r['item_id']])) : this['slot_map'][y] = {
                                                type: 1,
                                                item_id_list: [this['page_items']['items'][0]]
                                            },
                                            this['page_items']['changeRandomState'](_);
                                    } else if (5 == Z) {
                                        var r = this['slot_map'][y];
                                        if (r)
                                            r.type = r.type ? 0 : 1, r['item_id_list'] && 0 != r['item_id_list']['length'] || (r['item_id_list'] = [r['item_id']]);
                                        else {
                                            this['slot_map'][y] = {
                                                type: 1,
                                                item_id_list: [this['page_bgm']['items'][0]]
                                            };
                                        }
                                        this['page_bgm']['changeRandomState'](_);
                                    } else if (7 == Z || 8 == Z) {
                                        var r = this['slot_map'][y];
                                        if (r)
                                            r.type = r.type ? 0 : 1, r['item_id_list'] && 0 != r['item_id_list']['length'] || (r['item_id_list'] = [r['item_id']]);
                                        else {
                                            this['slot_map'][y] = {
                                                type: 1,
                                                item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                            };
                                        }
                                        this['page_desktop']['changeRandomState'](_);
                                    }
                                    this['scrollview']['wantToRefreshItem'](Z);
                                }
                            },
                            y['prototype']['render_view'] = function(u) {
                                var Z = this,
                                    y = u['container'],
                                    o = u['index'],
                                    _ = y['getChildByName']('cell');
                                this['select_index'] == o ? (_['scaleX'] = _['scaleY'] = 1.05, _['getChildByName']('choosed')['visible'] = !0) : (_['scaleX'] = _['scaleY'] = 1, _['getChildByName']('choosed')['visible'] = !1),
                                    _['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][o]);
                                var B = _['getChildByName']('name'),
                                    R = _['getChildByName']('icon'),
                                    r = this['cell_default_item'][o],
                                    d = this['slot_ids'][o],
                                    J = !1;
                                if (this['slot_map'][d] && (J = this['slot_map'][d].type, this['slot_map'][d]['item_id'] && (r = this['slot_map'][d]['item_id'])), J)
                                    B.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][d]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](R, 'myres/sushe/icon_random.jpg');
                                else {
                                    var w = cfg['item_definition'].item.get(r);
                                    w ? (B.text = w['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](R, w.icon, null, 'UI_Sushe_Select.Zhuangban')) : (B.text = game['Tools']['strOfLocalization'](this['cell_names'][o]), game['LoadMgr']['setImgSkin'](R, this['cell_default_img'][o], null, 'UI_Sushe_Select.Zhuangban'));
                                }
                                var z = _['getChildByName']('btn');
                                z['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        Z['locking'] || Z['select_index'] != o && (Z['onChangeSlotSelect'](o), Z['scrollview']['wantToRefreshAll']());
                                    }, null, !1),
                                    z['mouseEnabled'] = this['select_index'] != o;
                            },
                            y['prototype']['close'] = function(Z) {
                                var y = this;
                                this['container_zhuangban0']['visible'] && (Z ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (u['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), u['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function() {
                                    y['page_items']['close'](),
                                        y['page_desktop']['close'](),
                                        y['page_headframe']['close'](),
                                        y['page_bgm']['close'](),
                                        y['container_zhuangban0']['visible'] = !1,
                                        y['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                }))));
                            },
                            y['prototype']['onChangeGameView'] = function() {
                                // 保存装扮页
                                MMP.settings.using_commonview_index = u.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                // END
                                u['UI_Sushe']['randomDesktopID'](),
                                    GameMgr.Inst['load_mjp_view']();
                                var Z = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                                u['UI_Lite_Loading'].Inst.show(),
                                    game['Scene_Lobby'].Inst['set_lobby_bg'](Z, Laya['Handler']['create'](this, function() {
                                        u['UI_Lite_Loading'].Inst['enable'] && u['UI_Lite_Loading'].Inst['close']();
                                    })),
                                    GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                            },
                            y['prototype']['setRandomGray'] = function(Z) {
                                this['btn_random']['visible'] = !Z,
                                    this['random']['filters'] = Z ? [new Laya['ColorFilter'](u['GRAY_FILTER'])] : [];
                            },
                            y['prototype']['getShowSlotInfo'] = function() {
                                return this['slot_map'][this['slot_ids'][this['select_index']]];
                            },
                            y;
                    }
                    ();
                Z['Container_Zhuangban'] = y;
            }
            (Z = u['zhuangban'] || (u['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));





        // 设置称号
        ! function(u) {
            var Z = function(Z) {
                    function y() {
                        var u = Z.call(this, new ui['lobby']['titlebookUI']()) || this;
                        return u['_root'] = null,
                            u['_scrollview'] = null,
                            u['_blackmask'] = null,
                            u['_locking'] = !1,
                            u['_showindexs'] = [],
                            y.Inst = u,
                            u;
                    }
                    return __extends(y, Z),
                        y.Init = function() {
                            var Z = this;
                            // 获取称号
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (y, o) {
                            //     if (y || o['error'])
                            //         u['UIMgr'].Inst['showNetReqError']('fetchTitleList', y, o);
                            //     else {
                            Z['owned_title'] = [];
                            //         for (var _ = 0; _ < o['title_list']['length']; _++) {
                            //            var B = o['title_list'][_];
                            for (let title of cfg.item_definition.title.rows_) {
                                var g = title.id;
                                cfg['item_definition']['title'].get(g) && Z['owned_title'].push(g),
                                    '600005' == g && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    g >= '600005' && '600015' >= g && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + g - '600005', 1);
                            }
                            //    }
                            // });
                        },
                        y['title_update'] = function(Z) {
                            for (var y = 0; y < Z['new_titles']['length']; y++)
                                cfg['item_definition']['title'].get(Z['new_titles'][y]) && this['owned_title'].push(Z['new_titles'][y]), '600005' == Z['new_titles'][y] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), Z['new_titles'][y] >= '600005' && Z['new_titles'][y] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + Z['new_titles'][y] - '600005', 1);
                            if (Z['remove_titles'] && Z['remove_titles']['length'] > 0) {
                                for (var y = 0; y < Z['remove_titles']['length']; y++) {
                                    for (var o = Z['remove_titles'][y], _ = 0; _ < this['owned_title']['length']; _++)
                                        if (this['owned_title'][_] == o) {
                                            this['owned_title'][_] = this['owned_title'][this['owned_title']['length'] - 1],
                                                this['owned_title'].pop();
                                            break;
                                        }
                                    o == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', u['UI_Lobby'].Inst['enable'] && u['UI_Lobby'].Inst.top['refresh'](), u['UI_PlayerInfo'].Inst['enable'] && u['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                                }
                                this.Inst['enable'] && this.Inst.show();
                            }
                        },
                        y['prototype']['onCreate'] = function() {
                            var Z = this;
                            this['_root'] = this.me['getChildByName']('root'),
                                this['_blackmask'] = new u['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function() {
                                    return Z['_locking'];
                                }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                                this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                                this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(u) {
                                    Z['setItemValue'](u['index'], u['container']);
                                }, null, !1)),
                                this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Z['_locking'] || (Z['_blackmask'].hide(), Z['close']());
                                }, null, !1),
                                this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                        },
                        y['prototype'].show = function() {
                            var Z = this;
                            if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), y['owned_title']['length'] > 0) {
                                this['_showindexs'] = [];
                                for (var o = 0; o < y['owned_title']['length']; o++)
                                    this['_showindexs'].push(o);
                                this['_showindexs'] = this['_showindexs'].sort(function(u, Z) {
                                        var o = u,
                                            _ = cfg['item_definition']['title'].get(y['owned_title'][u]);
                                        _ && (o += 1000 * _['priority']);
                                        var B = Z,
                                            R = cfg['item_definition']['title'].get(y['owned_title'][Z]);
                                        return R && (B += 1000 * R['priority']),
                                            B - o;
                                    }),
                                    this['_scrollview']['reset'](),
                                    this['_scrollview']['addItem'](y['owned_title']['length']),
                                    this['_scrollview'].me['visible'] = !0,
                                    this['_noinfo']['visible'] = !1;
                            } else
                                this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                            u['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function() {
                                Z['_locking'] = !1;
                            }));
                        },
                        y['prototype']['close'] = function() {
                            var Z = this;
                            this['_locking'] = !0,
                                u['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function() {
                                    Z['_locking'] = !1,
                                        Z['enable'] = !1;
                                }));
                        },
                        y['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                        },
                        y['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                                this['_scrollview']['reset']();
                        },
                        y['prototype']['setItemValue'] = function(u, Z) {
                            var o = this;
                            if (this['enable']) {
                                var _ = y['owned_title'][this['_showindexs'][u]],
                                    B = cfg['item_definition']['title'].find(_);
                                game['LoadMgr']['setImgSkin'](Z['getChildByName']('img_title'), B.icon, null, 'UI_TitleBook'),
                                    Z['getChildByName']('using')['visible'] = _ == GameMgr.Inst['account_data']['title'],
                                    Z['getChildByName']('desc').text = B['desc_' + GameMgr['client_language']];
                                var R = Z['getChildByName']('btn');
                                R['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    _ != GameMgr.Inst['account_data']['title'] ? (o['changeTitle'](u), Z['getChildByName']('using')['visible'] = !0) : (o['changeTitle'](-1), Z['getChildByName']('using')['visible'] = !1);
                                }, null, !1);
                                var r = Z['getChildByName']('time'),
                                    d = Z['getChildByName']('img_title');
                                if (1 == B['unlock_type']) {
                                    var J = B['unlock_param'][0],
                                        w = cfg['item_definition'].item.get(J);
                                    r.text = game['Tools']['strOfLocalization'](3121) + w['expire_desc_' + GameMgr['client_language']],
                                        r['visible'] = !0,
                                        d.y = 0;
                                } else
                                    r['visible'] = !1, d.y = 10;
                            }
                        },
                        y['prototype']['changeTitle'] = function(Z) {
                            var o = this,
                                _ = GameMgr.Inst['account_data']['title'],
                                B = 0;
                            B = Z >= 0 && Z < this['_showindexs']['length'] ? y['owned_title'][this['_showindexs'][Z]] : '600001',
                                GameMgr.Inst['account_data']['title'] = B;
                            for (var R = -1, r = 0; r < this['_showindexs']['length']; r++)
                                if (_ == y['owned_title'][this['_showindexs'][r]]) {
                                    R = r;
                                    break;
                                }
                            u['UI_Lobby'].Inst['enable'] && u['UI_Lobby'].Inst.top['refresh'](),
                                u['UI_PlayerInfo'].Inst['enable'] && u['UI_PlayerInfo'].Inst['refreshBaseInfo'](), -1 != R && this['_scrollview']['wantToRefreshItem'](R),
                                // 屏蔽设置称号的网络请求并保存称号
                                MMP.settings.title = g;
                            MMP.saveSettings();
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                            //     title: '600001' == B ? 0 : B
                            // }, function (y, B) {
                            //    (y || B['error']) && (u['UIMgr'].Inst['showNetReqError']('useTitle', y, B), GameMgr.Inst['account_data']['title'] = _, u['UI_Lobby'].Inst['enable'] && u['UI_Lobby'].Inst.top['refresh'](), u['UI_PlayerInfo'].Inst['enable'] && u['UI_PlayerInfo'].Inst['refreshBaseInfo'](), o['enable'] && (Z >= 0 && Z < o['_showindexs']['length'] && o['_scrollview']['wantToRefreshItem'](Z), R >= 0 && R < o['_showindexs']['length'] && o['_scrollview']['wantToRefreshItem'](R)));
                            // });
                        },
                        y.Inst = null,
                        y['owned_title'] = [],
                        y;
                }
                (u['UIBase']);
            u['UI_TitleBook'] = Z;
        }
        (uiscript || (uiscript = {}));



        // 友人房调整装扮
        ! function(u) {
            var Z;
            ! function(Z) {
                var y = function() {
                        function y(u) {
                            this['scrollview'] = null,
                                this['page_skin'] = null,
                                this['chara_infos'] = [],
                                this['choosed_chara_index'] = 0,
                                this['choosed_skin_id'] = 0,
                                this['star_char_count'] = 0,
                                this.me = u,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                                this['scrollview']['setElastic'](),
                                this['page_skin'] = new Z['Page_Skin'](this.me['getChildByName']('right'));
                        }
                        return y['prototype'].show = function(Z) {
                                var y = this;
                                this.me['visible'] = !0,
                                    Z ? this.me['alpha'] = 1 : u['UIBase']['anim_alpha_in'](this.me, {
                                        x: 0
                                    }, 200, 0),
                                    this['choosed_chara_index'] = 0,
                                    this['chara_infos'] = [];
                                for (var o = 0, _ = u['UI_Sushe']['star_chars']; o < _['length']; o++)
                                    for (var B = _[o], R = 0; R < u['UI_Sushe']['characters']['length']; R++)
                                        if (!u['UI_Sushe']['hidden_characters_map'][B] && u['UI_Sushe']['characters'][R]['charid'] == B) {
                                            this['chara_infos'].push({
                                                    chara_id: u['UI_Sushe']['characters'][R]['charid'],
                                                    skin_id: u['UI_Sushe']['characters'][R].skin,
                                                    is_upgraded: u['UI_Sushe']['characters'][R]['is_upgraded']
                                                }),
                                                u['UI_Sushe']['main_character_id'] == u['UI_Sushe']['characters'][R]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                            break;
                                        }
                                this['star_char_count'] = this['chara_infos']['length'];
                                for (var R = 0; R < u['UI_Sushe']['characters']['length']; R++)
                                    u['UI_Sushe']['hidden_characters_map'][u['UI_Sushe']['characters'][R]['charid']] || -1 == u['UI_Sushe']['star_chars']['indexOf'](u['UI_Sushe']['characters'][R]['charid']) && (this['chara_infos'].push({
                                        chara_id: u['UI_Sushe']['characters'][R]['charid'],
                                        skin_id: u['UI_Sushe']['characters'][R].skin,
                                        is_upgraded: u['UI_Sushe']['characters'][R]['is_upgraded']
                                    }), u['UI_Sushe']['main_character_id'] == u['UI_Sushe']['characters'][R]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                                this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                                    this['scrollview']['reset'](),
                                    this['scrollview']['addItem'](this['chara_infos']['length']);
                                var r = this['chara_infos'][this['choosed_chara_index']];
                                this['page_skin'].show(r['chara_id'], r['skin_id'], Laya['Handler']['create'](this, function(u) {
                                    y['choosed_skin_id'] = u,
                                        r['skin_id'] = u,
                                        y['scrollview']['wantToRefreshItem'](y['choosed_chara_index']);
                                }, null, !1));
                            },
                            y['prototype']['render_character_cell'] = function(Z) {
                                var y = this,
                                    o = Z['index'],
                                    _ = Z['container'],
                                    B = Z['cache_data'];
                                B['index'] = o;
                                var R = this['chara_infos'][o];
                                B['inited'] || (B['inited'] = !0, B.skin = new u['UI_Character_Skin'](_['getChildByName']('btn')['getChildByName']('head')), B['bound'] = _['getChildByName']('btn')['getChildByName']('bound'));
                                var r = _['getChildByName']('btn');
                                r['getChildByName']('choose')['visible'] = o == this['choosed_chara_index'],
                                    B.skin['setSkin'](R['skin_id'], 'bighead'),
                                    r['getChildByName']('using')['visible'] = o == this['choosed_chara_index'],
                                    r['getChildByName']('label_name').text = 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? cfg['item_definition']['character'].find(R['chara_id'])['name_' + GameMgr['client_language']]['replace']('-', '|') : cfg['item_definition']['character'].find(R['chara_id'])['name_' + GameMgr['client_language']],
                                    r['getChildByName']('star') && (r['getChildByName']('star')['visible'] = o < this['star_char_count']);
                                var d = cfg['item_definition']['character'].get(R['chara_id']);
                                'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? B['bound'].skin = d.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (R['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (R['is_upgraded'] ? '2.png' : '.png')) : d.ur ? (B['bound'].pos(-10, -2), B['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '6.png' : '5.png'))) : (B['bound'].pos(4, 20), B['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '4.png' : '3.png'))),
                                    r['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '2.png' : '.png')),
                                    _['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                        if (o != y['choosed_chara_index']) {
                                            var u = y['choosed_chara_index'];
                                            y['choosed_chara_index'] = o,
                                                y['choosed_skin_id'] = R['skin_id'],
                                                y['page_skin'].show(R['chara_id'], R['skin_id'], Laya['Handler']['create'](y, function(u) {
                                                    y['choosed_skin_id'] = u,
                                                        R['skin_id'] = u,
                                                        B.skin['setSkin'](u, 'bighead');
                                                }, null, !1)),
                                                y['scrollview']['wantToRefreshItem'](u),
                                                y['scrollview']['wantToRefreshItem'](o);
                                        }
                                    });
                            },
                            y['prototype']['close'] = function(Z) {
                                var y = this;
                                if (this.me['visible'])
                                    if (Z)
                                        this.me['visible'] = !1;
                                    else {
                                        var o = this['chara_infos'][this['choosed_chara_index']];
                                        //把chartid和skin写入cookie
                                        MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                        MMP.saveSettings();
                                        // End
                                        // 友人房调整装扮
                                        // o['chara_id'] != u['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //         character_id: o['chara_id']
                                        //     }, function () {}), 
                                        u['UI_Sushe']['main_character_id'] = o['chara_id'];
                                        // this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                        //     character_id: o['chara_id'],
                                        //     skin: this['choosed_skin_id']
                                        // }, function () {});
                                        // END
                                        for (var _ = 0; _ < u['UI_Sushe']['characters']['length']; _++)
                                            if (u['UI_Sushe']['characters'][_]['charid'] == o['chara_id']) {
                                                u['UI_Sushe']['characters'][_].skin = this['choosed_skin_id'];
                                                break;
                                            }
                                        GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                            u['UIBase']['anim_alpha_out'](this.me, {
                                                x: 0
                                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                                y.me['visible'] = !1;
                                            }));
                                    }
                            },
                            y;
                    }
                    ();
                Z['Page_Waiting_Head'] = y;
            }
            (Z = u['zhuangban'] || (u['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));




        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function() {
            var u = GameMgr;
            var Z = GameMgr.Inst;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function(y, o) {
                if (y || o['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', y, o);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](o)),
                        u.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    o.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    o.account.title = GameMgr.Inst.account_data.title;
                    o.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        o.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var _ in o['account']) {
                        if (u.Inst['account_data'][_] = o['account'][_], 'platform_diamond' == _)
                            for (var B = o['account'][_], R = 0; R < B['length']; R++)
                                Z['account_numerical_resource'][B[R].id] = B[R]['count'];
                        if ('skin_ticket' == _ && (u.Inst['account_numerical_resource']['100004'] = o['account'][_]), 'platform_skin_ticket' == _)
                            for (var B = o['account'][_], R = 0; R < B['length']; R++)
                                Z['account_numerical_resource'][B[R].id] = B[R]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        o['account']['room_id'] && u.Inst['updateRoom'](),
                        '10102' === u.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === u.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }



        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function(Z, y, o) {
            (GM_xmlhttpRequest({
                method: 'post',
                url: MMP.settings.sendGameURL,
                data: JSON.stringify({
                    'current_record_uuid': Z,
                    'account_id': parseInt(y.toString())
                }),
                onload: function(msg) {
                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                        'current_record_uuid': Z,
                        'account_id': parseInt(y.toString())
                    }));
                }
            }));
            var _ = GameMgr.Inst;
            var u = GameMgr;
            return Z = Z.trim(),
                app.Log.log('checkPaiPu game_uuid:' + Z + ' account_id:' + y['toString']() + ' paipu_config:' + o),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), u.Inst['onLoadStart']('paipu'), 2 & o && (Z = game['Tools']['DecodePaipuUUID'](Z)), this['record_uuid'] = Z, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: Z,
                    client_version_string: this['getClientVersion']()
                }, function(B, R) {
                    if (B || R['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', B, R);
                        var r = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](r);
                        var d = function() {
                            return r += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, r)),
                                r >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, d), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, _, d),
                            _['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': R.head
                                }),
                                onload: function(msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': R.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var J = R.head,
                            w = [null, null, null, null],
                            z = game['Tools']['strOfLocalization'](2003),
                            T = J['config'].mode;
                        if (u['inRelease'] && T['testing_environment'] && T['testing_environment']['paixing'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3169)), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), _['duringPaipu'] = !1, void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                                game_uuid: Z,
                                client_version_string: _['getClientVersion']()
                            }, function() {}),
                            T['extendinfo'] && (z = game['Tools']['strOfLocalization'](2004)),
                            T['detail_rule'] && T['detail_rule']['ai_level'] && (1 === T['detail_rule']['ai_level'] && (z = game['Tools']['strOfLocalization'](2003)), 2 === T['detail_rule']['ai_level'] && (z = game['Tools']['strOfLocalization'](2004)));
                        var X = !1;
                        J['end_time'] ? (_['record_end_time'] = J['end_time'], J['end_time'] > '1576112400' && (X = !0)) : _['record_end_time'] = -1,
                            _['record_start_time'] = J['start_time'] ? J['start_time'] : -1;
                        for (var D = 0; D < J['accounts']['length']; D++) {
                            var N = J['accounts'][D];
                            if (N['character']) {
                                var c = N['character'],
                                    H = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (N.account_id == GameMgr.Inst.account_id) {
                                        N.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        N.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        N.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        N.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        N.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            N.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (N.avatar_id == 400101 || N.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            N.avatar_id = skin.id;
                                            N.character.charid = skin.character_id;
                                            N.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(N.account_id);
                                        if (server == 1) {
                                            N.nickname = '[CN]' + N.nickname;
                                        } else if (server == 2) {
                                            N.nickname = '[JP]' + N.nickname;
                                        } else if (server == 3) {
                                            N.nickname = '[EN]' + N.nickname;
                                        } else {
                                            N.nickname = '[??]' + N.nickname;
                                        }
                                    }
                                }
                                // END
                                if (X) {
                                    var b = N['views'];
                                    if (b)
                                        for (var F = 0; F < b['length']; F++)
                                            H[b[F].slot] = b[F]['item_id'];
                                } else {
                                    var t = c['views'];
                                    if (t)
                                        for (var F = 0; F < t['length']; F++) {
                                            var G = t[F].slot,
                                                i = t[F]['item_id'],
                                                x = G - 1;
                                            H[x] = i;
                                        }
                                }
                                var K = [];
                                for (var O in H)
                                    K.push({
                                        slot: parseInt(O),
                                        item_id: H[O]
                                    });
                                N['views'] = K,
                                    w[N.seat] = N;
                            } else
                                N['character'] = {
                                    charid: N['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(N['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                N['avatar_id'] = N['character'].skin,
                                N['views'] = [],
                                w[N.seat] = N;
                        }
                        for (var P = game['GameUtility']['get_default_ai_skin'](), s = game['GameUtility']['get_default_ai_character'](), D = 0; D < w['length']; D++)
                            if (null == w[D]) {
                                w[D] = {
                                    nickname: z,
                                    avatar_id: P,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: s,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: P,
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
                                            w[D].avatar_id = skin.id;
                                            w[D].character.charid = skin.character_id;
                                            w[D].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        w[D].nickname = '[BOT]' + w[D].nickname;
                                    }
                                }
                                // END
                            }
                        var C = Laya['Handler']['create'](_, function(u) {
                                game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                    game['Scene_MJ'].Inst['openMJRoom'](J['config'], w, Laya['Handler']['create'](_, function() {
                                        _['duringPaipu'] = !1,
                                            view['DesktopMgr'].Inst['paipu_config'] = o,
                                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](J['config'])), w, y, view['EMJMode']['paipu'], Laya['Handler']['create'](_, function() {
                                                uiscript['UI_Replay'].Inst['initData'](u),
                                                    uiscript['UI_Replay'].Inst['enable'] = !0,
                                                    Laya['timer'].once(1000, _, function() {
                                                        _['EnterMJ']();
                                                    }),
                                                    Laya['timer'].once(1500, _, function() {
                                                        view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                            uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                            uiscript['UI_Loading'].Inst['close']();
                                                    }),
                                                    Laya['timer'].once(1000, _, function() {
                                                        uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                    });
                                            }));
                                    }), Laya['Handler']['create'](_, function(u) {
                                        return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * u);
                                    }, null, !1));
                            }),
                            e = {};
                        if (e['record'] = J, R.data && R.data['length'])
                            e.game = net['MessageWrapper']['decodeMessage'](R.data), C['runWith'](e);
                        else {
                            var L = R['data_url'];
                            'chs_t' == u['client_type'] && (L = L['replace']('maj-soul.com:9443', 'maj-soul.net')),
                                game['LoadMgr']['httpload'](L, 'arraybuffer', !1, Laya['Handler']['create'](_, function(u) {
                                    if (u['success']) {
                                        var Z = new Laya.Byte();
                                        Z['writeArrayBuffer'](u.data);
                                        var y = net['MessageWrapper']['decodeMessage'](Z['getUint8Array'](0, Z['length']));
                                        e.game = y,
                                            C['runWith'](e);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + R['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), _['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }



        // 牌谱功能
        ! function(u) {
            var Z = function() {
                    function Z(u) {
                        var Z = this;
                        this.me = u,
                            this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['locking'] || Z.hide(null);
                            }),
                            this['title'] = this.me['getChildByName']('title'),
                            this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                            this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                            this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                            this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                            this.me['visible'] = !1,
                            this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                Z['locking'] || Z.hide(null);
                            }, null, !1),
                            this['container_hidename'] = this.me['getChildByName']('hidename'),
                            this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                        var y = this['container_hidename']['getChildByName']('w0'),
                            o = this['container_hidename']['getChildByName']('w1');
                        o.x = y.x + y['textField']['textWidth'] + 10,
                            this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['sp_checkbox']['visible'] = !Z['sp_checkbox']['visible'],
                                    Z['refresh_share_uuid']();
                            });
                    }
                    return Z['prototype']['show_share'] = function(Z) {
                            var y = this;
                            this['title'].text = game['Tools']['strOfLocalization'](2124),
                                this['sp_checkbox']['visible'] = !1,
                                this['btn_confirm']['visible'] = !1,
                                this['input']['editable'] = !1,
                                this.uuid = Z,
                                this['refresh_share_uuid'](),
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['container_hidename']['visible'] = !0,
                                this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                                u['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                    y['locking'] = !1;
                                }));
                        },
                        Z['prototype']['refresh_share_uuid'] = function() {
                            var u = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                                Z = this.uuid,
                                y = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + y + '?paipu=' + game['Tools']['EncodePaipuUUID'](Z) + '_a' + u + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + y + '?paipu=' + Z + '_a' + u;
                        },
                        Z['prototype']['show_check'] = function() {
                            var Z = this;
                            return u['UI_PiPeiYuYue'].Inst['enable'] ? (u['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                return Z['input'].text ? (Z.hide(Laya['Handler']['create'](Z, function() {
                                    var u = Z['input'].text['split']('='),
                                        y = u[u['length'] - 1]['split']('_'),
                                        o = 0;
                                    y['length'] > 1 && (o = 'a' == y[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(y[1]['substr'](1))) : parseInt(y[1]));
                                    var _ = 0;
                                    if (y['length'] > 2) {
                                        var B = parseInt(y[2]);
                                        B && (_ = B);
                                    }
                                    GameMgr.Inst['checkPaiPu'](y[0], o, _);
                                })), void 0) : (u['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                            }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, u['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                Z['locking'] = !1;
                            })), void 0);
                        },
                        Z['prototype'].hide = function(Z) {
                            var y = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function() {
                                    y['locking'] = !1,
                                        y.me['visible'] = !1,
                                        Z && Z.run();
                                }));
                        },
                        Z;
                }
                (),
                y = function() {
                    function Z(u) {
                        var Z = this;
                        this.me = u,
                            this['blackbg'] = u['getChildByName']('blackbg'),
                            this.root = u['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['locking'] || Z['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['locking'] || (game['Tools']['calu_word_length'](Z['input'].text) > 30 ? Z['toolong']['visible'] = !0 : (Z['close'](), B['addCollect'](Z.uuid, Z['start_time'], Z['end_time'], Z['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return Z['prototype'].show = function(Z, y, o) {
                            var _ = this;
                            this.uuid = Z,
                                this['start_time'] = y,
                                this['end_time'] = o,
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['input'].text = '',
                                this['toolong']['visible'] = !1,
                                this['blackbg']['alpha'] = 0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0.5
                                }, 150),
                                u['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    _['locking'] = !1;
                                }));
                        },
                        Z['prototype']['close'] = function() {
                            var Z = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                u['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    Z['locking'] = !1,
                                        Z.me['visible'] = !1;
                                }));
                        },
                        Z;
                }
                ();
            u['UI_Pop_CollectInput'] = y;
            var o;
            ! function(u) {
                u[u.ALL = 0] = 'ALL',
                    u[u['FRIEND'] = 1] = 'FRIEND',
                    u[u.RANK = 2] = 'RANK',
                    u[u['MATCH'] = 4] = 'MATCH',
                    u[u['COLLECT'] = 100] = 'COLLECT';
            }
            (o || (o = {}));
            var _ = function() {
                    function Z(u) {
                        this['uuid_list'] = [],
                            this.type = u,
                            this['reset']();
                    }
                    return Z['prototype']['reset'] = function() {
                            this['count'] = 0,
                                this['true_count'] = 0,
                                this['have_more_paipu'] = !0,
                                this['uuid_list'] = [],
                                this['duringload'] = !1;
                        },
                        Z['prototype']['loadList'] = function() {
                            var Z = this;
                            if (!this['duringload'] && this['have_more_paipu']) {
                                if (this['duringload'] = !0, this.type == o['COLLECT']) {
                                    for (var y = [], _ = 0, R = 0; 10 > R; R++) {
                                        var r = this['count'] + R;
                                        if (r >= B['collect_lsts']['length'])
                                            break;
                                        _++;
                                        var d = B['collect_lsts'][r];
                                        B['record_map'][d] || y.push(d),
                                            this['uuid_list'].push(d);
                                    }
                                    y['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                        uuid_list: y
                                    }, function(o, R) {
                                        if (Z['duringload'] = !1, B.Inst['onLoadStateChange'](Z.type, !1), o || R['error'])
                                            u['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', o, R);
                                        else if (app.Log.log(JSON['stringify'](R)), R['record_list'] && R['record_list']['length'] == y['length']) {
                                            for (var r = 0; r < R['record_list']['length']; r++) {
                                                var d = R['record_list'][r].uuid;
                                                B['record_map'][d] || (B['record_map'][d] = R['record_list'][r]);
                                            }
                                            Z['count'] += _,
                                                Z['count'] >= B['collect_lsts']['length'] && (Z['have_more_paipu'] = !1, B.Inst['onLoadOver'](Z.type)),
                                                B.Inst['onLoadMoreLst'](Z.type, _);
                                        } else
                                            Z['have_more_paipu'] = !1, B.Inst['onLoadOver'](Z.type);
                                    }) : (this['duringload'] = !1, this['count'] += _, this['count'] >= B['collect_lsts']['length'] && (this['have_more_paipu'] = !1, B.Inst['onLoadOver'](this.type)), B.Inst['onLoadMoreLst'](this.type, _));
                                } else
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                        start: this['true_count'],
                                        count: 10,
                                        type: this.type
                                    }, function(y, _) {
                                        if (Z['duringload'] = !1, B.Inst['onLoadStateChange'](Z.type, !1), y || _['error'])
                                            u['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', y, _);
                                        else if (app.Log.log(JSON['stringify'](_)), _['record_list'] && _['record_list']['length'] > 0) {
                                            // START
                                            if (MMP.settings.sendGame == true) {
                                                (GM_xmlhttpRequest({
                                                    method: 'post',
                                                    url: MMP.settings.sendGameURL,
                                                    data: JSON.stringify(_),
                                                    onload: function(msg) {
                                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(_));
                                                    }
                                                }));
                                                for (let record_list of _['record_list']) {
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
                                            for (var R = _['record_list'], r = 0, d = 0; d < R['length']; d++) {
                                                var J = R[d].uuid;
                                                if (Z.type == o.RANK && R[d]['config'] && R[d]['config'].meta) {
                                                    var w = R[d]['config'].meta;
                                                    if (w) {
                                                        var z = cfg['desktop']['matchmode'].get(w['mode_id']);
                                                        if (z && 5 == z.room)
                                                            continue;
                                                    }
                                                }
                                                r++,
                                                Z['uuid_list'].push(J),
                                                    B['record_map'][J] || (B['record_map'][J] = R[d]);
                                            }
                                            Z['count'] += r,
                                                Z['true_count'] += R['length'],
                                                B.Inst['onLoadMoreLst'](Z.type, r),
                                                Z['have_more_paipu'] = !0;
                                        } else
                                            Z['have_more_paipu'] = !1, B.Inst['onLoadOver'](Z.type);
                                    });
                                Laya['timer'].once(700, this, function() {
                                    Z['duringload'] && B.Inst['onLoadStateChange'](Z.type, !0);
                                });
                            }
                        },
                        Z['prototype']['removeAt'] = function(u) {
                            for (var Z = 0; Z < this['uuid_list']['length'] - 1; Z++)
                                Z >= u && (this['uuid_list'][Z] = this['uuid_list'][Z + 1]);
                            this['uuid_list'].pop(),
                                this['count']--,
                                this['true_count']--;
                        },
                        Z;
                }
                (),
                B = function(B) {
                    function R() {
                        var u = B.call(this, new ui['lobby']['paipuUI']()) || this;
                        return u.top = null,
                            u['container_scrollview'] = null,
                            u['scrollview'] = null,
                            u['loading'] = null,
                            u.tabs = [],
                            u['pop_otherpaipu'] = null,
                            u['pop_collectinput'] = null,
                            u['label_collect_count'] = null,
                            u['noinfo'] = null,
                            u['locking'] = !1,
                            u['current_type'] = o.ALL,
                            R.Inst = u,
                            u;
                    }
                    return __extends(R, B),
                        R.init = function() {
                            var u = this;
                            this['paipuLst'][o.ALL] = new _(o.ALL),
                                this['paipuLst'][o['FRIEND']] = new _(o['FRIEND']),
                                this['paipuLst'][o.RANK] = new _(o.RANK),
                                this['paipuLst'][o['MATCH']] = new _(o['MATCH']),
                                this['paipuLst'][o['COLLECT']] = new _(o['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function(Z, y) {
                                    if (Z || y['error']);
                                    else {
                                        if (y['record_list']) {
                                            for (var o = y['record_list'], _ = 0; _ < o['length']; _++) {
                                                var B = {
                                                    uuid: o[_].uuid,
                                                    time: o[_]['end_time'],
                                                    remarks: o[_]['remarks']
                                                };
                                                u['collect_lsts'].push(B.uuid),
                                                    u['collect_info'][B.uuid] = B;
                                            }
                                            u['collect_lsts'] = u['collect_lsts'].sort(function(Z, y) {
                                                return u['collect_info'][y].time - u['collect_info'][Z].time;
                                            });
                                        }
                                        y['record_collect_limit'] && (u['collect_limit'] = y['record_collect_limit']);
                                    }
                                });
                        },
                        R['onAccountUpdate'] = function() {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        R['reset'] = function() {
                            this['paipuLst'][o.ALL] && this['paipuLst'][o.ALL]['reset'](),
                                this['paipuLst'][o['FRIEND']] && this['paipuLst'][o['FRIEND']]['reset'](),
                                this['paipuLst'][o.RANK] && this['paipuLst'][o.RANK]['reset'](),
                                this['paipuLst'][o['MATCH']] && this['paipuLst'][o['MATCH']]['reset']();
                        },
                        R['addCollect'] = function(Z, y, o, _) {
                            var B = this;
                            if (!this['collect_info'][Z]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return u['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: Z,
                                    remarks: _,
                                    start_time: y,
                                    end_time: o
                                }, function() {});
                                var r = {
                                    uuid: Z,
                                    remarks: _,
                                    time: o
                                };
                                this['collect_info'][Z] = r,
                                    this['collect_lsts'].push(Z),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(u, Z) {
                                        return B['collect_info'][Z].time - B['collect_info'][u].time;
                                    }),
                                    u['UI_DesktopInfo'].Inst && u['UI_DesktopInfo'].Inst['enable'] && u['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    R.Inst && R.Inst['enable'] && R.Inst['onCollectChange'](Z, -1);
                            }
                        },
                        R['removeCollect'] = function(Z) {
                            var y = this;
                            if (this['collect_info'][Z]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                        uuid: Z
                                    }, function() {}),
                                    delete this['collect_info'][Z];
                                for (var o = -1, _ = 0; _ < this['collect_lsts']['length']; _++)
                                    if (this['collect_lsts'][_] == Z) {
                                        this['collect_lsts'][_] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            o = _;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(u, Z) {
                                        return y['collect_info'][Z].time - y['collect_info'][u].time;
                                    }),
                                    u['UI_DesktopInfo'].Inst && u['UI_DesktopInfo'].Inst['enable'] && u['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    R.Inst && R.Inst['enable'] && R.Inst['onCollectChange'](Z, o);
                            }
                        },
                        R['prototype']['onCreate'] = function() {
                            var o = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    o['locking'] || o['close'](Laya['Handler']['create'](o, function() {
                                        u['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(u) {
                                    o['setItemValue'](u['index'], u['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function() {
                                    var u = R['paipuLst'][o['current_type']];
                                    (1 - o['scrollview'].rate) * u['count'] < 3 && (u['duringload'] || (u['have_more_paipu'] ? u['loadList']() : 0 == u['count'] && (o['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    o['pop_otherpaipu'].me['visible'] || o['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var _ = 0; 5 > _; _++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](_)), this.tabs[_]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [_, !1]);
                            this['pop_otherpaipu'] = new Z(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new y(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        R['prototype'].show = function() {
                            var Z = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                u['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                u['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function() {
                                    Z['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = R['collect_lsts']['length']['toString']() + '/' + R['collect_limit']['toString']();
                        },
                        R['prototype']['close'] = function(Z) {
                            var y = this;
                            this['locking'] = !0,
                                u['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                u['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function() {
                                    y['locking'] = !1,
                                        y['enable'] = !1,
                                        Z && Z.run();
                                });
                        },
                        R['prototype']['changeTab'] = function(u, Z) {
                            var y = [o.ALL, o.RANK, o['FRIEND'], o['MATCH'], o['COLLECT']];
                            if (Z || y[u] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = y[u], this['current_type'] == o['COLLECT'] && R['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != o['COLLECT']) {
                                    var _ = R['paipuLst'][this['current_type']]['count'];
                                    _ > 0 && this['scrollview']['addItem'](_);
                                }
                                for (var B = 0; B < this.tabs['length']; B++) {
                                    var r = this.tabs[B];
                                    r['getChildByName']('img').skin = game['Tools']['localUISrc'](u == B ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        r['getChildByName']('label_name')['color'] = u == B ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        R['prototype']['setItemValue'] = function(Z, y) {
                            var o = this;
                            if (this['enable']) {
                                var _ = R['paipuLst'][this['current_type']];
                                if (_ || !(Z >= _['uuid_list']['length'])) {
                                    for (var B = R['record_map'][_['uuid_list'][Z]], r = 0; 4 > r; r++) {
                                        var d = y['getChildByName']('p' + r['toString']());
                                        if (r < B['result']['players']['length']) {
                                            d['visible'] = !0;
                                            var J = d['getChildByName']('chosen'),
                                                w = d['getChildByName']('rank'),
                                                z = d['getChildByName']('rank_word'),
                                                T = d['getChildByName']('name'),
                                                X = d['getChildByName']('score'),
                                                D = B['result']['players'][r];
                                            X.text = D['part_point_1'] || '0';
                                            for (var N = 0, c = game['Tools']['strOfLocalization'](2133), H = 0, b = !1, F = 0; F < B['accounts']['length']; F++)
                                                if (B['accounts'][F].seat == D.seat) {
                                                    N = B['accounts'][F]['account_id'],
                                                        c = B['accounts'][F]['nickname'],
                                                        H = B['accounts'][F]['verified'],
                                                        b = B['accounts'][F]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](T, {
                                                    account_id: N,
                                                    nickname: c,
                                                    verified: H
                                                }),
                                                J['visible'] = b,
                                                X['color'] = b ? '#ffc458' : '#b98930',
                                                T['getChildByName']('name')['color'] = b ? '#dfdfdf' : '#a0a0a0',
                                                z['color'] = w['color'] = b ? '#57bbdf' : '#489dbc';
                                            var t = d['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (r) {
                                                    case 0:
                                                        t.text = 'st';
                                                        break;
                                                    case 1:
                                                        t.text = 'nd';
                                                        break;
                                                    case 2:
                                                        t.text = 'rd';
                                                        break;
                                                    case 3:
                                                        t.text = 'th';
                                                }
                                        } else
                                            d['visible'] = !1;
                                    }
                                    var G = new Date(1000 * B['end_time']),
                                        i = '';
                                    i += G['getFullYear']() + '/',
                                        i += (G['getMonth']() < 9 ? '0' : '') + (G['getMonth']() + 1)['toString']() + '/',
                                        i += (G['getDate']() < 10 ? '0' : '') + G['getDate']() + ' ',
                                        i += (G['getHours']() < 10 ? '0' : '') + G['getHours']() + ':',
                                        i += (G['getMinutes']() < 10 ? '0' : '') + G['getMinutes'](),
                                        y['getChildByName']('date').text = i,
                                        y['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            return o['locking'] ? void 0 : u['UI_PiPeiYuYue'].Inst['enable'] ? (u['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](B.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        y['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            o['locking'] || o['pop_otherpaipu'].me['visible'] || (o['pop_otherpaipu']['show_share'](B.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var x = y['getChildByName']('room'),
                                        K = game['Tools']['get_room_desc'](B['config']);
                                    x.text = K.text;
                                    var O = '';
                                    if (1 == B['config']['category'])
                                        O = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == B['config']['category'])
                                        O = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == B['config']['category']) {
                                        var P = B['config'].meta;
                                        if (P) {
                                            var s = cfg['desktop']['matchmode'].get(P['mode_id']);
                                            s && (O = s['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (R['collect_info'][B.uuid]) {
                                        var C = R['collect_info'][B.uuid],
                                            e = y['getChildByName']('remarks_info'),
                                            L = y['getChildByName']('input'),
                                            h = L['getChildByName']('txtinput'),
                                            S = y['getChildByName']('btn_input'),
                                            V = !1,
                                            p = function() {
                                                V ? (e['visible'] = !1, L['visible'] = !0, h.text = e.text, S['visible'] = !1) : (e.text = C['remarks'] && '' != C['remarks'] ? game['Tools']['strWithoutForbidden'](C['remarks']) : O, e['visible'] = !0, L['visible'] = !1, S['visible'] = !0);
                                            };
                                        p(),
                                            S['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                V = !0,
                                                    p();
                                            }, null, !1),
                                            h.on('blur', this, function() {
                                                V && (game['Tools']['calu_word_length'](h.text) > 30 ? u['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : h.text != C['remarks'] && (C['remarks'] = h.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                        uuid: B.uuid,
                                                        remarks: h.text
                                                    }, function() {}))),
                                                    V = !1,
                                                    p();
                                            });
                                        var m = y['getChildByName']('collect');
                                        m['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](o, function() {
                                                    R['removeCollect'](B.uuid);
                                                }));
                                            }, null, !1),
                                            m['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        y['getChildByName']('input')['visible'] = !1,
                                            y['getChildByName']('btn_input')['visible'] = !1,
                                            y['getChildByName']('remarks_info')['visible'] = !0,
                                            y['getChildByName']('remarks_info').text = O;
                                        var m = y['getChildByName']('collect');
                                        m['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                o['pop_collectinput'].show(B.uuid, B['start_time'], B['end_time']);
                                            }, null, !1),
                                            m['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        R['prototype']['onLoadStateChange'] = function(u, Z) {
                            this['current_type'] == u && (this['loading']['visible'] = Z);
                        },
                        R['prototype']['onLoadMoreLst'] = function(u, Z) {
                            this['current_type'] == u && this['scrollview']['addItem'](Z);
                        },
                        R['prototype']['onLoadOver'] = function(u) {
                            if (this['current_type'] == u) {
                                var Z = R['paipuLst'][this['current_type']];
                                0 == Z['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        R['prototype']['onCollectChange'] = function(u, Z) {
                            if (this['current_type'] == o['COLLECT'])
                                Z >= 0 && (R['paipuLst'][o['COLLECT']]['removeAt'](Z), this['scrollview']['delItem'](Z));
                            else
                                for (var y = R['paipuLst'][this['current_type']]['uuid_list'], _ = 0; _ < y['length']; _++)
                                    if (y[_] == u) {
                                        this['scrollview']['wantToRefreshItem'](_);
                                        break;
                                    }
                            this['label_collect_count'].text = R['collect_lsts']['length']['toString']() + '/' + R['collect_limit']['toString']();
                        },
                        R.Inst = null,
                        R['paipuLst'] = {},
                        R['collect_lsts'] = [],
                        R['record_map'] = {},
                        R['collect_info'] = {},
                        R['collect_limit'] = 20,
                        R;
                }
                (u['UIBase']);
            u['UI_PaiPu'] = B;
        }
        (uiscript || (uiscript = {}));



        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function() {
            var u = this;
            window.p2 = 'DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP' + (window['pertinent3'] ? window['pertinent3'] : ''),
                view['BgmListMgr'].init(),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function(Z, y) {
                    Z || y['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', Z, y) : u['server_time_delta'] = 1000 * y['server_time'] - Laya['timer']['currTimer'];
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function(Z, y) {
                    Z || y['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', Z, y) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](y)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, y['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](y['settings']), y['settings']['nickname_setting'] && (u['nickname_replace_enable'] = !!y['settings']['nickname_setting']['enable'], u['nickname_replace_lst'] = y['settings']['nickname_setting']['nicknames'], u['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = y['settings']['allow_modify_nickname']);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function(Z, y) {
                    Z || y['error'] || (u['client_endpoint'] = y['client_endpoint']);
                }),
                app['PlayerBehaviorStatistic'].init(),
                this['account_data']['nickname'] && this['fetch_login_info'](),
                uiscript['UI_Info'].Init(),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(Z) {
                    app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](Z));
                    var y = Z['update'];
                    if (y) {
                        if (y['numerical'])
                            for (var o = 0; o < y['numerical']['length']; o++) {
                                var _ = y['numerical'][o].id,
                                    B = y['numerical'][o]['final'];
                                switch (_) {
                                    case '100001':
                                        u['account_data']['diamond'] = B;
                                        break;
                                    case '100002':
                                        u['account_data'].gold = B;
                                        break;
                                    case '100099':
                                        u['account_data'].vip = B,
                                            uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                                }
                                (_ >= '101001' || '102999' >= _) && (u['account_numerical_resource'][_] = B);
                            }
                        uiscript['UI_Sushe']['on_data_updata'](y),
                            y['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](y['daily_task']),
                            y['title'] && uiscript['UI_TitleBook']['title_update'](y['title']),
                            y['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](y),
                            (y['activity_task'] || y['activity_period_task'] || y['activity_random_task'] || y['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](y),
                            y['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](y['activity_flip_task']['progresses']);
                    }
                }, null, !1)),
                app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function() {
                    uiscript['UI_AnotherLogin'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function() {
                    uiscript['UI_Hanguplogout'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function(u) {
                    app.Log.log('收到消息：' + JSON['stringify'](u)),
                        u.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](u['content']);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function(Z) {
                    uiscript['UI_Recharge']['open_payment'] = !1,
                        uiscript['UI_Recharge']['payment_info'] = '',
                        uiscript['UI_Recharge']['open_wx'] = !0,
                        uiscript['UI_Recharge']['wx_type'] = 0,
                        uiscript['UI_Recharge']['open_alipay'] = !0,
                        uiscript['UI_Recharge']['alipay_type'] = 0,
                        Z['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](Z['settings']), Z['settings']['nickname_setting'] && (u['nickname_replace_enable'] = !!Z['settings']['nickname_setting']['enable'], u['nickname_replace_lst'] = Z['settings']['nickname_setting']['nicknames'])),
                        uiscript['UI_Change_Nickname']['allow_modify_nickname'] = Z['allow_modify_nickname'];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function(u) {
                    uiscript['UI_Sushe']['send_gift_limit'] = u['gift_limit'],
                        game['FriendMgr']['friend_max_count'] = u['friend_max_count'],
                        uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = u['zhp_free_refresh_limit'],
                        uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = u['zhp_cost_refresh_limit'],
                        uiscript['UI_PaiPu']['collect_limit'] = u['record_collect_limit'];
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function(u) {
                    uiscript['UI_Guajichenfa'].Inst.show(u);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function(Z) {
                    u['auth_check_id'] = Z['check_id'],
                        u['auth_nc_retry_count'] = 0,
                        4 == Z.type ? u['showNECaptcha']() : 2 == Z.type ? u['checkNc']() : u['checkNvc']();
                })),
                Laya['timer'].loop(360000, this, function() {
                    if (game['LobbyNetMgr'].Inst.isOK) {
                        var Z = (Laya['timer']['currTimer'] - u['_last_heatbeat_time']) / 1000;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                                no_operation_counter: Z
                            }, function() {}),
                            Z >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                    }
                }),
                Laya['timer'].loop(1000, this, function() {
                    var Z = Laya['stage']['getMousePoint']();
                    (Z.x != u['_pre_mouse_point'].x || Z.y != u['_pre_mouse_point'].y) && (u['clientHeatBeat'](), u['_pre_mouse_point'].x = Z.x, u['_pre_mouse_point'].y = Z.y);
                }),
                Laya['timer'].loop(1000, this, function() {
                    Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
                }),
                uiscript['UI_RollNotice'].init();
        }



        // 设置状态
        ! function(u) {
            var Z = function() {
                    function u(Z) {
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
                            u.Inst = this,
                            this.me = Z,
                            this['_container_c0'] = this.me['getChildByName']('c0');
                        for (var y = 0; 3 > y; y++)
                            this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + y));
                        this['_container_c1'] = this.me['getChildByName']('c1');
                        for (var y = 0; 3 > y; y++)
                            this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + y));
                        for (var y = 0; 2 > y; y++)
                            this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + y));
                        this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                            this.me['visible'] = !1;
                    }
                    return Object['defineProperty'](u['prototype'], 'timeuse', {
                            get: function() {
                                return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        u['prototype']['reset'] = function() {
                            this.me['visible'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        u['prototype']['showCD'] = function(u, Z) {
                            var y = this;
                            this.me['visible'] = !0,
                                this['_start'] = Laya['timer']['currTimer'],
                                this._fix = Math['floor'](u / 1000),
                                this._add = Math['floor'](Z / 1000),
                                this['_pre_sec'] = -1,
                                this['_pre_time'] = Laya['timer']['currTimer'],
                                this['_show'](),
                                Laya['timer']['frameLoop'](1, this, function() {
                                    var u = Laya['timer']['currTimer'] - y['_pre_time'];
                                    y['_pre_time'] = Laya['timer']['currTimer'],
                                        view['DesktopMgr'].Inst['timestoped'] ? y['_start'] += u : y['_show']();
                                });
                        },
                        u['prototype']['close'] = function() {
                            this['reset']();
                        },
                        u['prototype']['_show'] = function() {
                            var u = this._fix + this._add - this['timeuse'];
                            if (0 >= u)
                                return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                            if (u != this['_pre_sec']) {
                                if (this['_pre_sec'] = u, u > this._add) {
                                    for (var Z = (u - this._add)['toString'](), y = 0; y < this['_img_countdown_c0']['length']; y++)
                                        this['_img_countdown_c0'][y]['visible'] = y < Z['length'];
                                    if (3 == Z['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[2] + '.png')) : 2 == Z['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + Z[0] + '.png'), 0 != this._add) {
                                        this['_img_countdown_plus']['visible'] = !0;
                                        for (var o = this._add['toString'](), y = 0; y < this['_img_countdown_add']['length']; y++) {
                                            var _ = this['_img_countdown_add'][y];
                                            y < o['length'] ? (_['visible'] = !0, _.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + o[y] + '.png')) : _['visible'] = !1;
                                        }
                                    } else {
                                        this['_img_countdown_plus']['visible'] = !1;
                                        for (var y = 0; y < this['_img_countdown_add']['length']; y++)
                                            this['_img_countdown_add'][y]['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var Z = u['toString'](), y = 0; y < this['_img_countdown_c0']['length']; y++)
                                        this['_img_countdown_c0'][y]['visible'] = y < Z['length'];
                                    3 == Z['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[2] + '.png')) : 2 == Z['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Z[0] + '.png');
                                }
                                if (u > 3) {
                                    this['_container_c1']['visible'] = !1;
                                    for (var y = 0; y < this['_img_countdown_c0']['length']; y++)
                                        this['_img_countdown_c0'][y]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                } else {
                                    view['AudioMgr']['PlayAudio'](205),
                                        this['_container_c1']['visible'] = !0;
                                    for (var y = 0; y < this['_img_countdown_c0']['length']; y++)
                                        this['_img_countdown_c0'][y]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                    for (var y = 0; y < this['_img_countdown_c1']['length']; y++)
                                        this['_img_countdown_c1'][y]['visible'] = this['_img_countdown_c0'][y]['visible'], this['_img_countdown_c1'][y].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][y].skin);
                                    R.Inst.me.cd1.play(0, !1);
                                }
                            }
                        },
                        u.Inst = null,
                        u;
                }
                (),
                y = function() {
                    function u(u) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = u;
                    }
                    return u['prototype']['begin_refresh'] = function() {
                            this['timer_id'] && clearTimeout(this['timer_id']),
                                this['last_returned'] = !0,
                                this['_loop_refresh_delay'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer'].loop(100, this, this['_loop_show']);
                        },
                        u['prototype']['close_refresh'] = function() {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        u['prototype']['_loop_refresh_delay'] = function() {
                            var u = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var Z = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var y = app['NetAgent']['mj_network_delay'];
                                    Z = 300 > y ? 2000 : 800 > y ? 2500 + y : 4000 + 0.5 * y,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function() {
                                            u['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    Z = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), Z);
                            }
                        },
                        u['prototype']['_loop_show'] = function() {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var u = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > u ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > u ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        u;
                }
                (),
                o = function() {
                    function u(u, Z) {
                        var y = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = Z,
                            this.me = u,
                            this['btn_banemj'] = u['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = u['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = u['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y['locking'] || (y['emj_banned'] = !y['emj_banned'], y['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (y['emj_banned'] ? '_on.png' : '.png')), y['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y['locking'] || (y['close'](), R.Inst['btn_seeinfo'](y['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y['locking'] || (y['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](y['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function() {
                                y['locking'] || y['switch']();
                            }, null, !1);
                    }
                    return u['prototype']['reset'] = function(u, Z, y) {
                            Laya['timer']['clearAll'](this),
                                this['locking'] = !1,
                                this['enable'] = !1,
                                this['showinfo'] = u,
                                this['showemj'] = Z,
                                this['showchange'] = y,
                                this['emj_banned'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                                this['btn_change']['visible'] = !1;
                        },
                        u['prototype']['onChangeSeat'] = function(u, Z, y) {
                            this['showinfo'] = u,
                                this['showemj'] = Z,
                                this['showchange'] = y,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        u['prototype']['switch'] = function() {
                            var u = this;
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
                                u['locking'] = !1;
                            })));
                        },
                        u['prototype']['close'] = function() {
                            var u = this;
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
                                    u['locking'] = !1,
                                        u['btn_banemj']['visible'] = !1,
                                        u['btn_seeinfo']['visible'] = !1,
                                        u['btn_change']['visible'] = !1;
                                });
                        },
                        u;
                }
                (),
                _ = function() {
                    function u(u) {
                        var Z = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = u,
                            this['btn_chat'] = this.me['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.me['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function() {
                                Z['switchShow']();
                            }),
                            this['scrollbar'] = this.me['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function() {
                                Z['scrollview']['total_height'] > 0 ? Z['scrollbar']['setVal'](Z['scrollview'].rate, Z['scrollview']['view_height'] / Z['scrollview']['total_height']) : Z['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (u['getChildAt'](5)['visible'] = !1, u['getChildAt'](6)['visible'] = !0) : (u['getChildAt'](5)['visible'] = !0, u['getChildAt'](6)['visible'] = !1);
                    }
                    return u['prototype']['initRoom'] = function() {
                            // START 
                            // var u = view['DesktopMgr'].Inst['main_role_character_info'],
                            // END
                            var u = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                                Z = cfg['item_definition']['character'].find(u['charid']);
                            this.emos = [];
                            for (var y = 0; 9 > y; y++)
                                this.emos.push({
                                    path: Z.emo + '/' + y + '.png',
                                    sub_id: y,
                                    sort: y
                                });
                            if (u['extra_emoji'])
                                for (var y = 0; y < u['extra_emoji']['length']; y++)
                                    this.emos.push({
                                        path: Z.emo + '/' + u['extra_emoji'][y] + '.png',
                                        sub_id: u['extra_emoji'][y],
                                        sort: u['extra_emoji'][y] > 12 ? 1000000 - u['extra_emoji'][y] : u['extra_emoji'][y]
                                    });
                            this.emos = this.emos.sort(function(u, Z) {
                                    return u.sort - Z.sort;
                                }),
                                this['allgray'] = !1,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset'](),
                                this['scrollview']['addItem'](this.emos['length']),
                                this['btn_chat']['disabled'] = !1,
                                this['btn_mask']['visible'] = view['DesktopMgr'].Inst['emoji_switch'],
                                'chs' != GameMgr['client_language'] && (this.me['getChildAt'](6)['visible'] = !view['DesktopMgr'].Inst['emoji_switch']),
                                this.me.x = 1903,
                                this['emo_infos'] = {
                                    char_id: u['charid'],
                                    emoji: [],
                                    server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                                };
                        },
                        u['prototype']['render_item'] = function(u) {
                            var Z = this,
                                y = u['index'],
                                o = u['container'],
                                _ = this.emos[y],
                                B = o['getChildByName']('btn');
                            B.skin = game['LoadMgr']['getResImageSkin'](_.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](B, !0) : (game['Tools']['setGrayDisable'](B, !1), B['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var u = !1, y = 0, o = Z['emo_infos']['emoji']; y < o['length']; y++) {
                                            var B = o[y];
                                            if (B[0] == _['sub_id']) {
                                                B[0]++,
                                                    u = !0;
                                                break;
                                            }
                                        }
                                        u || Z['emo_infos']['emoji'].push([_['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: _['sub_id']
                                                }),
                                                except_self: !1
                                            }, function() {});
                                    }
                                    Z['change_all_gray'](!0),
                                        Laya['timer'].once(5000, Z, function() {
                                            Z['change_all_gray'](!1);
                                        }),
                                        Z['switchShow']();
                                }, null, !1));
                        },
                        u['prototype']['change_all_gray'] = function(u) {
                            this['allgray'] = u,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        u['prototype']['switchShow'] = function() {
                            var u = this,
                                Z = 0;
                            Z = this.me.x < 1600 ? 1903 : 1382,
                                Laya['Tween'].to(this.me, {
                                    x: Z
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    u['btn_chat']['disabled'] = !1;
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0;
                        },
                        u['prototype']['sendEmoLogUp'] = function() {
                            this['emo_infos'] && (GameMgr.Inst['postInfo2Server']('emo_stats', {
                                data: this['emo_infos']
                            }), this['emo_infos']['emoji'] = []);
                        },
                        u['prototype']['reset'] = function() {
                            this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        u;
                }
                (),
                B = function() {
                    function Z(Z) {
                        this['effect'] = null,
                            this['container_emo'] = Z['getChildByName']('chat_bubble'),
                            this.emo = new u['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = Z['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return Z['prototype'].show = function(u, Z) {
                            var y = this;
                            if (!view['DesktopMgr'].Inst['emoji_switch']) {
                                for (var o = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](u)]['character']['charid'], _ = cfg['character']['emoji']['getGroup'](o), B = '', R = 0, r = 0; r < _['length']; r++)
                                    if (_[r]['sub_id'] == Z) {
                                        2 == _[r].type && (B = _[r].view, R = _[r]['audio']);
                                        break;
                                    }
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                    B ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + B + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function() {
                                        y['effect']['destory'](),
                                            y['effect'] = null;
                                    }), R && view['AudioMgr']['PlayAudio'](R)) : (this.emo['setSkin'](o, Z), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function() {
                                        y.emo['clear'](),
                                            Laya['Tween'].to(y['container_emo'], {
                                                scaleX: 0,
                                                scaleY: 0
                                            }, 120, null, null, 0, !0, !0);
                                    }), Laya['timer'].once(3500, this, function() {
                                        y['container_emo']['visible'] = !1;
                                    }));
                            }
                        },
                        Z['prototype']['reset'] = function() {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        Z;
                }
                (),
                R = function(R) {
                    function r() {
                        var u = R.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return u['container_doras'] = null,
                            u['doras'] = [],
                            u['label_md5'] = null,
                            u['container_gamemode'] = null,
                            u['label_gamemode'] = null,
                            u['btn_auto_moqie'] = null,
                            u['btn_auto_nofulu'] = null,
                            u['btn_auto_hule'] = null,
                            u['img_zhenting'] = null,
                            u['btn_double_pass'] = null,
                            u['_network_delay'] = null,
                            u['_timecd'] = null,
                            u['_player_infos'] = [],
                            u['_container_fun'] = null,
                            u['showscoredeltaing'] = !1,
                            u['arrow'] = null,
                            u['_btn_leave'] = null,
                            u['_btn_fanzhong'] = null,
                            u['_btn_collect'] = null,
                            u['block_emo'] = null,
                            u['head_offset_y'] = 15,
                            u['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            u['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](u, function(Z) {
                                u['onGameBroadcast'](Z);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](u, function(Z) {
                                u['onPlayerConnectionState'](Z);
                            })),
                            r.Inst = u,
                            u;
                    }
                    return __extends(r, R),
                        r['prototype']['onCreate'] = function() {
                            var R = this;
                            this['doras'] = new Array();
                            var r = this.me['getChildByName']('container_lefttop'),
                                d = r['getChildByName']('container_doras');
                            this['container_doras'] = d,
                                this['container_gamemode'] = r['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = r['getChildByName']('MD5'),
                                r['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (R['label_md5']['visible'])
                                        Laya['timer']['clearAll'](R['label_md5']), R['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? r['getChildByName']('activitymode')['visible'] = !0 : R['container_doras']['visible'] = !0;
                                    else {
                                        R['label_md5']['visible'] = !0,
                                            R['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5,
                                            r['getChildByName']('activitymode')['visible'] = !1,
                                            R['container_doras']['visible'] = !1;
                                        var u = R;
                                        Laya['timer'].once(5000, R['label_md5'], function() {
                                            u['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? r['getChildByName']('activitymode')['visible'] = !0 : R['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var J = 0; J < d['numChildren']; J++)
                                this['doras'].push(d['getChildAt'](J));
                            for (var J = 0; 4 > J; J++) {
                                var w = this.me['getChildByName']('container_player_' + J),
                                    z = {};
                                z['container'] = w,
                                    z.head = new u['UI_Head'](w['getChildByName']('head'), ''),
                                    z['head_origin_y'] = w['getChildByName']('head').y,
                                    z.name = w['getChildByName']('container_name')['getChildByName']('name'),
                                    z['container_shout'] = w['getChildByName']('container_shout'),
                                    z['container_shout']['visible'] = !1,
                                    z['illust'] = z['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    z['illustrect'] = u['UIRect']['CreateFromSprite'](z['illust']),
                                    z['shout_origin_x'] = z['container_shout'].x,
                                    z['shout_origin_y'] = z['container_shout'].y,
                                    z.emo = new B(w),
                                    z['disconnect'] = w['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    z['disconnect']['visible'] = !1,
                                    z['title'] = new u['UI_PlayerTitle'](w['getChildByName']('title'), ''),
                                    z.que = w['getChildByName']('que'),
                                    z['que_target_pos'] = new Laya['Vector2'](z.que.x, z.que.y),
                                    0 == J ? w['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        R['btn_seeinfo'](0);
                                    }, null, !1) : z['headbtn'] = new o(w['getChildByName']('btn_head'), J),
                                    this['_player_infos'].push(z);
                            }
                            this['_timecd'] = new Z(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new _(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var Z = 0, y = 0; y < view['DesktopMgr'].Inst['player_datas']['length']; y++)
                                                view['DesktopMgr'].Inst['player_datas'][y]['account_id'] && Z++;
                                            if (1 >= Z)
                                                u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](R, function() {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var u = 0, Z = 0; Z < view['DesktopMgr'].Inst['player_datas']['length']; Z++) {
                                                            var y = view['DesktopMgr'].Inst['player_datas'][Z];
                                                            y && null != y['account_id'] && 0 != y['account_id'] && u++;
                                                        }
                                                        1 == u ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function() {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var o = !1;
                                                if (u['UI_VoteProgress']['vote_info']) {
                                                    var _ = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - u['UI_VoteProgress']['vote_info']['start_time'] - u['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > _ && (o = !0);
                                                }
                                                o ? u['UI_VoteProgress'].Inst['enable'] || u['UI_VoteProgress'].Inst.show() : u['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? u['UI_VoteCD'].Inst['enable'] || u['UI_VoteCD'].Inst.show() : u['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        game['Scene_MJ'].Inst['ForceOut']();
                                }, null, !1),
                                this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    u['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    u['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (u['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? u['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](R, function() {
                                        u['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : u['UI_Replay'].Inst && u['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var T = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr']['double_click_pass']) {
                                        var Z = Laya['timer']['currTimer'];
                                        if (T + 300 > Z) {
                                            if (u['UI_ChiPengHu'].Inst['enable'])
                                                u['UI_ChiPengHu'].Inst['onDoubleClick']();
                                            else {
                                                var y = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                                u['UI_LiQiZiMo'].Inst['enable'] && (y = u['UI_LiQiZiMo'].Inst['onDoubleClick'](y)),
                                                    y && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']();
                                            }
                                            T = 0;
                                        } else
                                            T = Z;
                                    }
                                }, null, !1),
                                this['_network_delay'] = new y(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (r['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        r['prototype']['onGameBroadcast'] = function(u) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](u));
                            var Z = view['DesktopMgr'].Inst['seat2LocalPosition'](u.seat),
                                y = JSON['parse'](u['content']);
                            null != y.emo && void 0 != y.emo && (this['onShowEmo'](Z, y.emo), this['showAIEmo']());
                        },
                        r['prototype']['onPlayerConnectionState'] = function(u) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](u));
                            var Z = u.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && Z < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][Z] = u['state']), this['enable']) {
                                var y = view['DesktopMgr'].Inst['seat2LocalPosition'](Z);
                                this['_player_infos'][y]['disconnect']['visible'] = u['state'] != view['ELink_State']['READY'];
                            }
                        },
                        r['prototype']['_initFunc'] = function() {
                            var u = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func');
                            var Z = this['_container_fun']['getChildByName']('btn_func'),
                                y = this['_container_fun']['getChildByName']('btn_func2');
                            Z['clickHandler'] = y['clickHandler'] = new Laya['Handler'](this, function() {
                                var y = 0;
                                u['_container_fun'].x < -400 ? (y = -274, u['arrow']['scaleX'] = 1) : (y = -528, u['arrow']['scaleX'] = -1),
                                    Laya['Tween'].to(u['_container_fun'], {
                                        x: y
                                    }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](u, function() {
                                        Z['disabled'] = !1;
                                    }), 0, !0, !0),
                                    Z['disabled'] = !0;
                            }, null, !1);
                            var o = this['_container_fun']['getChildByName']('btn_autolipai'),
                                _ = this['_container_fun']['getChildByName']('btn_autolipai2');
                            this['refreshFuncBtnShow'](o, !0),
                                o['clickHandler'] = _['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        u['refreshFuncBtnShow'](o, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var B = this['_container_fun']['getChildByName']('btn_autohu'),
                                R = this['_container_fun']['getChildByName']('btn_autohu2');
                            this['refreshFuncBtnShow'](B, !1),
                                B['clickHandler'] = R['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        u['refreshFuncBtnShow'](B, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var r = this['_container_fun']['getChildByName']('btn_autonoming'),
                                d = this['_container_fun']['getChildByName']('btn_autonoming2');
                            this['refreshFuncBtnShow'](r, !1),
                                r['clickHandler'] = d['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        u['refreshFuncBtnShow'](r, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var J = this['_container_fun']['getChildByName']('btn_automoqie'),
                                w = this['_container_fun']['getChildByName']('btn_automoqie2');
                            this['refreshFuncBtnShow'](J, !1),
                                J['clickHandler'] = w['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        u['refreshFuncBtnShow'](J, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (o['getChildByName']('out')['scale'](0.9, 0.9), B['getChildByName']('out')['scale'](0.9, 0.9), r['getChildByName']('out')['scale'](0.9, 0.9), J['getChildByName']('out')['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (Z['visible'] = !1, R['visible'] = !0, _['visible'] = !0, d['visible'] = !0, w['visible'] = !0) : (Z['visible'] = !0, R['visible'] = !1, _['visible'] = !1, d['visible'] = !1, w['visible'] = !1),
                                this['arrow'] = this['_container_fun']['getChildByName']('arrow'),
                                this['arrow']['scaleX'] = -1;
                        },
                        r['prototype']['noAutoLipai'] = function() {
                            var u = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                u['clickHandler'].run();
                        },
                        r['prototype']['resetFunc'] = function() {
                            var u = Laya['LocalStorage']['getItem']('autolipai'),
                                Z = !0;
                            Z = u && '' != u ? 'true' == u : !0;
                            var y = this['_container_fun']['getChildByName']('btn_autolipai');
                            this['refreshFuncBtnShow'](y, Z),
                                Laya['LocalStorage']['setItem']('autolipai', Z ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](Z);
                            var o = this['_container_fun']['getChildByName']('btn_autohu');
                            this['refreshFuncBtnShow'](o, view['DesktopMgr'].Inst['auto_hule']);
                            var _ = this['_container_fun']['getChildByName']('btn_autonoming');
                            this['refreshFuncBtnShow'](_, view['DesktopMgr'].Inst['auto_nofulu']);
                            var B = this['_container_fun']['getChildByName']('btn_automoqie');
                            this['refreshFuncBtnShow'](B, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -528,
                                this['arrow']['scaleX'] = -1;
                            // 设置状态
                            if (MMP.settings.setAuto.isSetAuto) {
                                setAuto();
                            }
                            // END
                        },
                        r['prototype']['setDora'] = function(u, Z) {
                            if (0 > u || u >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var y = 'myres2/mjp/' + (Z['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_view']) + /ui/;
                            this['doras'][u].skin = game['Tools']['localUISrc'](y + Z['toString'](!1) + '.png');
                        },
                        r['prototype']['initRoom'] = function() {
                            var Z = this;
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var y = {}, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    for (var _ = view['DesktopMgr'].Inst['player_datas'][o]['character'], B = _['charid'], R = cfg['item_definition']['character'].find(B).emo, r = 0; 9 > r; r++) {
                                        var d = R + '/' + r['toString']() + '.png';
                                        y[d] = 1;
                                    }
                                    if (_['extra_emoji'])
                                        for (var r = 0; r < _['extra_emoji']['length']; r++) {
                                            var d = R + '/' + _['extra_emoji'][r]['toString']() + '.png';
                                            y[d] = 1;
                                        }
                                }
                                var J = [];
                                for (var w in y)
                                    J.push(w);
                                this['block_emo'].me.x = 1903,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](J, Laya['Handler']['create'](this, function() {
                                        Z['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else {
                                for (var z = !1, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    var T = view['DesktopMgr'].Inst['player_datas'][o];
                                    if (T && null != T['account_id'] && T['account_id'] == GameMgr.Inst['account_id']) {
                                        z = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (u['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = z;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var X = 0, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                    var T = view['DesktopMgr'].Inst['player_datas'][o];
                                    T && null != T['account_id'] && 0 != T['account_id'] && X++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var D = 0, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++) {
                                var T = view['DesktopMgr'].Inst['player_datas'][o];
                                T && null != T['account_id'] && 0 != T['account_id'] && D++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var N = this.me['getChildByName']('container_lefttop');
                            if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                                N['getChildByName']('num_lizhi_0')['visible'] = !1, N['getChildByName']('num_lizhi_1')['visible'] = !1, N['getChildByName']('num_ben_0')['visible'] = !1, N['getChildByName']('num_ben_1')['visible'] = !1, N['getChildByName']('container_doras')['visible'] = !1, N['getChildByName']('gamemode')['visible'] = !1, N['getChildByName']('activitymode')['visible'] = !0, N['getChildByName']('MD5').y = 63, N['getChildByName']('MD5')['width'] = 239, N['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), N['getChildAt'](0)['width'] = 280, N['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (N['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, N['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (N['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), N['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), N['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, N['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (N['getChildByName']('num_lizhi_0')['visible'] = !0, N['getChildByName']('num_lizhi_1')['visible'] = !1, N['getChildByName']('num_ben_0')['visible'] = !0, N['getChildByName']('num_ben_1')['visible'] = !0, N['getChildByName']('container_doras')['visible'] = !0, N['getChildByName']('gamemode')['visible'] = !0, N['getChildByName']('activitymode')['visible'] = !1, N['getChildByName']('MD5').y = 51, N['getChildByName']('MD5')['width'] = 276, N['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), N['getChildAt'](0)['width'] = 313, N['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var c = view['DesktopMgr'].Inst['game_config'],
                                    H = game['Tools']['get_room_desc'](c);
                                this['label_gamemode'].text = H.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = u['UI_Activity_JJC']['win_count']['toString']();
                                    for (var o = 0; 3 > o; o++)
                                        this['container_jjc']['getChildByName'](o['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (u['UI_Activity_JJC']['lose_count'] > o ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            u['UI_Replay'].Inst && (u['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var b = this['_container_fun']['getChildByName']('btn_automoqie'),
                                F = this['_container_fun']['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (u['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](b, !0), game['Tools']['setGrayDisable'](F, !0)) : (game['Tools']['setGrayDisable'](b, !1), game['Tools']['setGrayDisable'](F, !1), u['UI_Astrology'].Inst.hide());
                        },
                        r['prototype']['onCloseRoom'] = function() {
                            this['_network_delay']['close_refresh']();
                        },
                        r['prototype']['refreshSeat'] = function(u) {
                            void 0 === u && (u = !1);
                            for (var Z = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), y = 0; 4 > y; y++) {
                                var o = view['DesktopMgr'].Inst['localPosition2Seat'](y),
                                    _ = this['_player_infos'][y];
                                if (0 > o)
                                    _['container']['visible'] = !1;
                                else {
                                    _['container']['visible'] = !0;
                                    var B = view['DesktopMgr'].Inst['getPlayerName'](o);
                                    game['Tools']['SetNickname'](_.name, B),
                                        _.head.id = Z[o]['avatar_id'],
                                        _.head['set_head_frame'](Z[o]['account_id'], Z[o]['avatar_frame']);
                                    var R = (cfg['item_definition'].item.get(Z[o]['avatar_frame']), cfg['item_definition'].view.get(Z[o]['avatar_frame']));
                                    if (_.head.me.y = R && R['sargs'][0] ? _['head_origin_y'] - Number(R['sargs'][0]) / 100 * this['head_offset_y'] : _['head_origin_y'], _['avatar'] = Z[o]['avatar_id'], 0 != y) {
                                        var r = Z[o]['account_id'] && 0 != Z[o]['account_id'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'],
                                            d = Z[o]['account_id'] && 0 != Z[o]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            J = view['DesktopMgr'].Inst.mode != view['EMJMode'].play;
                                        u ? _['headbtn']['onChangeSeat'](r, d, J) : _['headbtn']['reset'](r, d, J);
                                    }
                                    _['title'].id = Z[o]['title'] ? game['Tools']['titleLocalization'](Z[o]['account_id'], Z[o]['title']) : 0;
                                }
                            }
                        },
                        r['prototype']['refreshNames'] = function() {
                            for (var u = 0; 4 > u; u++) {
                                var Z = view['DesktopMgr'].Inst['localPosition2Seat'](u),
                                    y = this['_player_infos'][u];
                                if (0 > Z)
                                    y['container']['visible'] = !1;
                                else {
                                    y['container']['visible'] = !0;
                                    var o = view['DesktopMgr'].Inst['getPlayerName'](Z);
                                    game['Tools']['SetNickname'](y.name, o);
                                }
                            }
                        },
                        r['prototype']['refreshLinks'] = function() {
                            for (var u = (view['DesktopMgr'].Inst.seat, 0); 4 > u; u++) {
                                var Z = view['DesktopMgr'].Inst['localPosition2Seat'](u);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][u]['disconnect']['visible'] = -1 == Z || 0 == u ? !1 : view['DesktopMgr']['player_link_state'][Z] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][u]['disconnect']['visible'] = -1 == Z || 0 == view['DesktopMgr'].Inst['player_datas'][Z]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][Z] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][u]['disconnect']['visible'] = !1);
                            }
                        },
                        r['prototype']['setBen'] = function(u) {
                            u > 99 && (u = 99);
                            var Z = this.me['getChildByName']('container_lefttop'),
                                y = Z['getChildByName']('num_ben_0'),
                                o = Z['getChildByName']('num_ben_1');
                            u >= 10 ? (y.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](u / 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (u % 10)['toString']() + '.png'), o['visible'] = !0) : (y.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (u % 10)['toString']() + '.png'), o['visible'] = !1);
                        },
                        r['prototype']['setLiqibang'] = function(u, Z) {
                            void 0 === Z && (Z = !0),
                                u > 999 && (u = 999);
                            var y = this.me['getChildByName']('container_lefttop'),
                                o = y['getChildByName']('num_lizhi_0'),
                                _ = y['getChildByName']('num_lizhi_1'),
                                B = y['getChildByName']('num_lizhi_2');
                            u >= 100 ? (B.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (u % 10)['toString']() + '.png'), _.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](u / 10) % 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](u / 100)['toString']() + '.png'), _['visible'] = !0, B['visible'] = !0) : u >= 10 ? (_.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (u % 10)['toString']() + '.png'), o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](u / 10)['toString']() + '.png'), _['visible'] = !0, B['visible'] = !1) : (o.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + u['toString']() + '.png'), _['visible'] = !1, B['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](u, Z);
                        },
                        r['prototype']['reset_rounds'] = function() {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var u = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /ui/, Z = 0; Z < this['doras']['length']; Z++)
                                this['doras'][Z].skin = view['DesktopMgr'].Inst['is_jiuchao_mode']() ? game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png') : game['Tools']['localUISrc'](u + 'back.png');
                            for (var Z = 0; 4 > Z; Z++)
                                this['_player_infos'][Z].emo['reset'](), this['_player_infos'][Z].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        r['prototype']['showCountDown'] = function(u, Z) {
                            this['_timecd']['showCD'](u, Z);
                        },
                        r['prototype']['setZhenting'] = function(u) {
                            this['img_zhenting']['visible'] = u;
                        },
                        r['prototype']['shout'] = function(u, Z, y, o) {
                            app.Log.log('shout:' + u + ' type:' + Z);
                            try {
                                var _ = this['_player_infos'][u],
                                    B = _['container_shout'],
                                    R = B['getChildByName']('img_content'),
                                    r = B['getChildByName']('illust')['getChildByName']('illust'),
                                    d = B['getChildByName']('img_score');
                                if (0 == o)
                                    d['visible'] = !1;
                                else {
                                    d['visible'] = !0;
                                    var J = 0 > o ? 'm' + Math.abs(o) : o;
                                    d.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + J + '.png');
                                }
                                '' == Z ? R['visible'] = !1 : (R['visible'] = !0, R.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + Z + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (B['getChildByName']('illust')['visible'] = !1, B['getChildAt'](2)['visible'] = !0, B['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](B['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (B['getChildByName']('illust')['visible'] = !0, B['getChildAt'](2)['visible'] = !1, B['getChildAt'](0)['visible'] = !0, r['scaleX'] = 1, game['Tools']['charaPart'](y['avatar_id'], r, 'half', _['illustrect'], !0, !0));
                                var w = 0,
                                    z = 0;
                                switch (u) {
                                    case 0:
                                        w = -105,
                                            z = 0;
                                        break;
                                    case 1:
                                        w = 500,
                                            z = 0;
                                        break;
                                    case 2:
                                        w = 0,
                                            z = -300;
                                        break;
                                    default:
                                        w = -500,
                                            z = 0;
                                }
                                B['visible'] = !0,
                                    B['alpha'] = 0,
                                    B.x = _['shout_origin_x'] + w,
                                    B.y = _['shout_origin_y'] + z,
                                    Laya['Tween'].to(B, {
                                        alpha: 1,
                                        x: _['shout_origin_x'],
                                        y: _['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(B, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function() {
                                        Laya['loader']['clearTextureRes'](r.skin),
                                            B['visible'] = !1;
                                    });
                            } catch (T) {
                                var X = {};
                                X['error'] = T['message'],
                                    X['stack'] = T['stack'],
                                    X['method'] = 'shout',
                                    X['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](X);
                            }
                        },
                        r['prototype']['closeCountDown'] = function() {
                            this['_timecd']['close']();
                        },
                        r['prototype']['refreshFuncBtnShow'] = function(u, Z) {
                            var y = u['getChildByName']('img_choosed');
                            u['getChildByName']('out')['color'] = u['mouseEnabled'] ? Z ? '#3bd647' : '#7992b3' : '#565656',
                                y['visible'] = Z;
                        },
                        r['prototype']['onShowEmo'] = function(u, Z) {
                            var y = this['_player_infos'][u];
                            0 != u && y['headbtn']['emj_banned'] || y.emo.show(u, Z);
                        },
                        r['prototype']['changeHeadEmo'] = function(u) {
                            {
                                var Z = view['DesktopMgr'].Inst['seat2LocalPosition'](u);
                                this['_player_infos'][Z];
                            }
                        },
                        r['prototype']['onBtnShowScoreDelta'] = function() {
                            var u = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function() {
                                u['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        r['prototype']['btn_seeinfo'] = function(Z) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                                var y = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](Z)]['account_id'];
                                if (y) {
                                    var o = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        _ = 1,
                                        B = view['DesktopMgr'].Inst['game_config'].meta;
                                    B && B['mode_id'] == game['EMatchMode']['shilian'] && (_ = 4),
                                        u['UI_OtherPlayerInfo'].Inst.show(y, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, o ? 1 : 2, _);
                                }
                            }
                        },
                        r['prototype']['openDora3BeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openPeipaiOpenBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openDora3BeginShine'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openMuyuOpenBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openShilianOpenBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openXiuluoOpenBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openChuanmaBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openJiuChaoBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openAnPaiBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openTopMatchOpenBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['openZhanxingBeginEffect'] = function() {
                            var u = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, u, function() {
                                    u['destory']();
                                });
                        },
                        r['prototype']['logUpEmoInfo'] = function() {
                            this['block_emo']['sendEmoLogUp']();
                        },
                        r['prototype']['onCollectChange'] = function() {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (u['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        r['prototype']['showAIEmo'] = function() {
                            for (var u = this, Z = function(Z) {
                                    var o = view['DesktopMgr'].Inst['player_datas'][Z];
                                    o['account_id'] && 0 != o['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), y, function() {
                                        u['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](Z), Math['floor'](9 * Math['random']()));
                                    });
                                }, y = this, o = 0; o < view['DesktopMgr'].Inst['player_datas']['length']; o++)
                                Z(o);
                        },
                        r['prototype']['setGapType'] = function(u, Z) {
                            void 0 === Z && (Z = !1);
                            for (var y = 0; y < u['length']; y++) {
                                var o = view['DesktopMgr'].Inst['seat2LocalPosition'](y);
                                this['_player_infos'][o].que['visible'] = !0,
                                    Z && (0 == y ? (this['_player_infos'][o].que.pos(this['gapStartPosLst'][y].x + this['selfGapOffsetX'][u[y]], this['gapStartPosLst'][y].y), this['_player_infos'][o].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][o].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][o]['que_target_pos'].x,
                                        y: this['_player_infos'][o]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][o].que.pos(this['gapStartPosLst'][y].x, this['gapStartPosLst'][y].y), this['_player_infos'][o].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][o].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][o]['que_target_pos'].x,
                                        y: this['_player_infos'][o]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][o].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + u[y] + '.png');
                            }
                        },
                        r['prototype']['OnNewCard'] = function(u, Z) {
                            if (Z) {
                                var y = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, y, function() {
                                        y['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function() {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        r['prototype']['ShowSpellCard'] = function(Z, y) {
                            void 0 === y && (y = !1),
                                u['UI_FieldSpell'].Inst && !u['UI_FieldSpell'].Inst['enable'] && u['UI_FieldSpell'].Inst.show(Z, y);
                        },
                        r['prototype']['HideSpellCard'] = function() {
                            u['UI_FieldSpell'].Inst && u['UI_FieldSpell'].Inst['close']();
                        },
                        r.Inst = null,
                        r;
                }
                (u['UIBase']);
            u['UI_DesktopInfo'] = R;
        }
        (uiscript || (uiscript = {}));



        uiscript.UI_Info.Init = function() {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            var Z = uiscript.UI_Info;
            // END
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function(y, o) {
                    y || o['error'] ? u['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', y, o) : Z['_refreshAnnouncements'](o);
                    if ((y || o['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function(u) {
                    for (var y = GameMgr['inDmm'] ? 'web_dmm' : 'web', o = 0, _ = u['update_list']; o < _['length']; o++) {
                        var B = _[o];
                        if (B.lang == GameMgr['client_language'] && B['platform'] == y) {
                            Z['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }


        uiscript.UI_Info._refreshAnnouncements = function(u) {
            u.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            if (u['announcements'] && (this['announcements'] = u['announcements']), u.sort && (this['announcement_sort'] = u.sort), u['read_list']) {
                this['read_list'] = [];
                for (var Z = 0; Z < u['read_list']['length']; Z++)
                    this['read_list'].push(u['read_list'][Z]);
                u.read_list.splice(0, 0, 666666, 777777);
            }
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
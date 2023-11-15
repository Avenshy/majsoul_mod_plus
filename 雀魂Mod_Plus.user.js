// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.300
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
        !function (P) {
            var c;
            !function (P) {
                P[P.none = 0] = 'none',
                    P[P['daoju'] = 1] = 'daoju',
                    P[P.gift = 2] = 'gift',
                    P[P['fudai'] = 3] = 'fudai',
                    P[P.view = 5] = 'view';
            }
                (c = P['EItemCategory'] || (P['EItemCategory'] = {}));
            var v = function (v) {
                function _() {
                    var P = v.call(this, new ui['lobby']['bagUI']()) || this;
                    return P['container_top'] = null,
                        P['container_content'] = null,
                        P['locking'] = !1,
                        P.tabs = [],
                        P['page_item'] = null,
                        P['page_gift'] = null,
                        P['page_skin'] = null,
                        P['page_cg'] = null,
                        P['select_index'] = 0,
                        _.Inst = P,
                        P;
                }
                return __extends(_, v),
                    _.init = function () {
                        var P = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (c) {
                            var v = c['update'];
                            v && v.bag && (P['update_data'](v.bag['update_items']), P['update_daily_gain_data'](v.bag));
                        }, null, !1)),
                            this['fetch']();
                    },
                    _['fetch'] = function () {
                        var c = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (v, _) {
                                if (v || _['error'])
                                    P['UIMgr'].Inst['showNetReqError']('fetchBagInfo', v, _);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](_));
                                    var z = _.bag;
                                    if (z) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of z["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            c._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    c._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (z['items'])
                                                for (var G = 0; G < z['items']['length']; G++) {
                                                    var u = z['items'][G]['item_id'],
                                                        I = z['items'][G]['stack'],
                                                        i = cfg['item_definition'].item.get(u);
                                                    i && (c['_item_map'][u] = {
                                                        item_id: u,
                                                        count: I,
                                                        category: i['category']
                                                    }, 1 == i['category'] && 3 == i.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: u
                                                    }, function () { }));
                                                }
                                            if (z['daily_gain_record'])
                                                for (var N = z['daily_gain_record'], G = 0; G < N['length']; G++) {
                                                    var V = N[G]['limit_source_id'];
                                                    c['_daily_gain_record'][V] = {};
                                                    var U = N[G]['record_time'];
                                                    c['_daily_gain_record'][V]['record_time'] = U;
                                                    var Y = N[G]['records'];
                                                    if (Y)
                                                        for (var Z = 0; Z < Y['length']; Z++)
                                                            c['_daily_gain_record'][V][Y[Z]['item_id']] = Y[Z]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    _['find_item'] = function (P) {
                        var c = this['_item_map'][P];
                        return c ? {
                            item_id: c['item_id'],
                            category: c['category'],
                            count: c['count']
                        }
                            : null;
                    },
                    _['get_item_count'] = function (P) {
                        var c = this['find_item'](P);
                        if (c)
                            return c['count'];
                        if ('100001' == P) {
                            for (var v = 0, _ = 0, z = GameMgr.Inst['free_diamonds']; _ < z['length']; _++) {
                                var G = z[_];
                                GameMgr.Inst['account_numerical_resource'][G] && (v += GameMgr.Inst['account_numerical_resource'][G]);
                            }
                            for (var u = 0, I = GameMgr.Inst['paid_diamonds']; u < I['length']; u++) {
                                var G = I[u];
                                GameMgr.Inst['account_numerical_resource'][G] && (v += GameMgr.Inst['account_numerical_resource'][G]);
                            }
                            return v;
                        }
                        if ('100004' == P) {
                            for (var i = 0, N = 0, V = GameMgr.Inst['free_pifuquans']; N < V['length']; N++) {
                                var G = V[N];
                                GameMgr.Inst['account_numerical_resource'][G] && (i += GameMgr.Inst['account_numerical_resource'][G]);
                            }
                            for (var U = 0, Y = GameMgr.Inst['paid_pifuquans']; U < Y['length']; U++) {
                                var G = Y[U];
                                GameMgr.Inst['account_numerical_resource'][G] && (i += GameMgr.Inst['account_numerical_resource'][G]);
                            }
                            return i;
                        }
                        return '100002' == P ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    _['find_items_by_category'] = function (P) {
                        var c = [];
                        for (var v in this['_item_map'])
                            this['_item_map'][v]['category'] == P && this['_item_map'][v]['count'] && c.push({
                                item_id: this['_item_map'][v]['item_id'],
                                category: this['_item_map'][v]['category'],
                                count: this['_item_map'][v]['count']
                            });
                        return c;
                    },
                    _['update_data'] = function (c) {
                        for (var v = 0; v < c['length']; v++) {
                            var _ = c[v]['item_id'],
                                z = c[v]['stack'];
                            if (z > 0) {
                                this['_item_map']['hasOwnProperty'](_['toString']()) ? this['_item_map'][_]['count'] = z : this['_item_map'][_] = {
                                    item_id: _,
                                    count: z,
                                    category: cfg['item_definition'].item.get(_)['category']
                                };
                                var G = cfg['item_definition'].item.get(_);
                                1 == G['category'] && 3 == G.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: _
                                }, function () { }),
                                    5 == G['category'] && (this['new_bag_item_ids'].push(_), this['new_zhuangban_item_ids'][_] = 1),
                                    8 != G['category'] || G['item_expire'] || this['new_cg_ids'].push(_);
                            } else if (this['_item_map']['hasOwnProperty'](_['toString']())) {
                                var u = cfg['item_definition'].item.get(_);
                                u && 5 == u['category'] && P['UI_Sushe']['on_view_remove'](_),
                                    this['_item_map'][_] = 0,
                                    delete this['_item_map'][_];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var v = 0; v < c['length']; v++) {
                            var _ = c[v]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](_['toString']()))
                                for (var I = this['_item_listener'][_], i = 0; i < I['length']; i++)
                                    I[i].run();
                        }
                        for (var v = 0; v < this['_all_item_listener']['length']; v++)
                            this['_all_item_listener'][v].run();
                    },
                    _['update_daily_gain_data'] = function (P) {
                        var c = P['update_daily_gain_record'];
                        if (c)
                            for (var v = 0; v < c['length']; v++) {
                                var _ = c[v]['limit_source_id'];
                                this['_daily_gain_record'][_] || (this['_daily_gain_record'][_] = {});
                                var z = c[v]['record_time'];
                                this['_daily_gain_record'][_]['record_time'] = z;
                                var G = c[v]['records'];
                                if (G)
                                    for (var u = 0; u < G['length']; u++)
                                        this['_daily_gain_record'][_][G[u]['item_id']] = G[u]['count'];
                            }
                    },
                    _['get_item_daily_record'] = function (P, c) {
                        return this['_daily_gain_record'][P] ? this['_daily_gain_record'][P]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][P]['record_time']) ? this['_daily_gain_record'][P][c] ? this['_daily_gain_record'][P][c] : 0 : 0 : 0 : 0;
                    },
                    _['add_item_listener'] = function (P, c) {
                        this['_item_listener']['hasOwnProperty'](P['toString']()) || (this['_item_listener'][P] = []),
                            this['_item_listener'][P].push(c);
                    },
                    _['remove_item_listener'] = function (P, c) {
                        var v = this['_item_listener'][P];
                        if (v)
                            for (var _ = 0; _ < v['length']; _++)
                                if (v[_] === c) {
                                    v[_] = v[v['length'] - 1],
                                        v.pop();
                                    break;
                                }
                    },
                    _['add_all_item_listener'] = function (P) {
                        this['_all_item_listener'].push(P);
                    },
                    _['remove_all_item_listener'] = function (P) {
                        for (var c = this['_all_item_listener'], v = 0; v < c['length']; v++)
                            if (c[v] === P) {
                                c[v] = c[c['length'] - 1],
                                    c.pop();
                                break;
                            }
                    },
                    _['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    _['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    _['removeZhuangBanNew'] = function (P) {
                        for (var c = 0, v = P; c < v['length']; c++) {
                            var _ = v[c];
                            delete this['new_zhuangban_item_ids'][_];
                        }
                    },
                    _['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    _['prototype']['onCreate'] = function () {
                        var c = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || c.hide(Laya['Handler']['create'](c, function () {
                                    return c['closeHandler'] ? (c['closeHandler'].run(), c['closeHandler'] = null, void 0) : (P['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var v = function (P) {
                            _.tabs.push(_['container_content']['getChildByName']('tabs')['getChildByName']('btn' + P)),
                                _.tabs[P]['clickHandler'] = Laya['Handler']['create'](_, function () {
                                    c['select_index'] != P && c['on_change_tab'](P);
                                }, null, !1);
                        }, _ = this, z = 0; 5 > z; z++)
                            v(z);
                        this['page_item'] = new P['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new P['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new P['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new P['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    _['prototype'].show = function (c, v) {
                        var _ = this;
                        void 0 === c && (c = 0),
                            void 0 === v && (v = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = v,
                            P['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            P['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                _['locking'] = !1;
                            }),
                            this['on_change_tab'](c),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    _['prototype']['onSkinYuLanBack'] = function () {
                        var c = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            P['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            P['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                c['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    _['prototype'].hide = function (c) {
                        var v = this;
                        this['locking'] = !0,
                            P['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            P['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                v['locking'] = !1,
                                    v['enable'] = !1,
                                    c && c.run();
                            });
                    },
                    _['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    _['prototype']['on_change_tab'] = function (P) {
                        this['select_index'] = P;
                        for (var v = 0; v < this.tabs['length']; v++)
                            this.tabs[v].skin = game['Tools']['localUISrc'](P == v ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[v]['getChildAt'](0)['color'] = P == v ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), P) {
                            case 0:
                                this['page_item'].show(c['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(c.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    _['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    _['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    _['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    _['_item_map'] = {},
                    _['_item_listener'] = {},
                    _['_all_item_listener'] = [],
                    _['_daily_gain_record'] = {},
                    _['new_bag_item_ids'] = [],
                    _['new_zhuangban_item_ids'] = {},
                    _['new_cg_ids'] = [],
                    _.Inst = null,
                    _;
            }
                (P['UIBase']);
            P['UI_Bag'] = v;
        }
            (uiscript || (uiscript = {}));












        // 修改牌桌上角色
        !function (P) {
            var c = function () {
                function c() {
                    var c = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = P['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (P) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(P),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(P));
                                    }
                                }));
                            }
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](P)),
                                c['loaded_player_count'] = P['ready_id_list']['length'],
                                c['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](c['loaded_player_count'], c['real_player_count']);
                        }));
                }
                return Object['defineProperty'](c, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new c() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    c['prototype']['OpenConnect'] = function (c, v, _, z) {
                        var G = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            P['Scene_Lobby'].Inst && P['Scene_Lobby'].Inst['active'] && (P['Scene_Lobby'].Inst['active'] = !1),
                            P['Scene_Huiye'].Inst && P['Scene_Huiye'].Inst['active'] && (P['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                G.url = '',
                                    G['token'] = c,
                                    G['game_uuid'] = v,
                                    G['server_location'] = _,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = _,
                                    GameMgr.Inst['mj_game_token'] = c,
                                    GameMgr.Inst['mj_game_uuid'] = v,
                                    G['playerreconnect'] = z,
                                    G['_setState'](P['EConnectState']['tryconnect']),
                                    G['load_over'] = !1,
                                    G['loaded_player_count'] = 0,
                                    G['real_player_count'] = 0,
                                    G['lb_index'] = 0,
                                    G['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    c['prototype']['reportInfo'] = function () {
                        this['connect_state'] == P['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: P['LobbyNetMgr']['root_id_lst'][P['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    c['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](P['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    c['prototype']['_OnConnent'] = function (c) {
                        app.Log.log('MJNetMgr _OnConnent event:' + c),
                            c == Laya['Event']['CLOSE'] || c == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == P['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == P['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](P['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](P['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2008)), P['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == P['EConnectState']['reconnecting'] && this['_Reconnect']()) : c == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == P['EConnectState']['tryconnect'] || this['connect_state'] == P['EConnectState']['reconnecting']) && ((this['connect_state'] = P['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](P['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    c['prototype']['_Reconnect'] = function () {
                        var c = this;
                        P['LobbyNetMgr'].Inst['connect_state'] == P['EConnectState'].none || P['LobbyNetMgr'].Inst['connect_state'] == P['EConnectState']['disconnect'] ? this['_setState'](P['EConnectState']['disconnect']) : P['LobbyNetMgr'].Inst['connect_state'] == P['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](P['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            c['connect_state'] == P['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + c['reconnect_count']), app['NetAgent']['connect2MJ'](c.url, Laya['Handler']['create'](c, c['_OnConnent'], null, !1), 'local' == c['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    c['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? P['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](P['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && P['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    c['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    c['prototype']['_fetch_gateway'] = function (c) {
                        var v = this;
                        if (P['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= P['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && P['Scene_MJ'].Inst['ForceOut'](), this['_setState'](P['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + c);
                        var _ = function (_) {
                            var z = JSON['parse'](_);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + _), z['maintenance'])
                                v['_setState'](P['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && P['Scene_MJ'].Inst['ForceOut']();
                            else if (z['servers'] && z['servers']['length'] > 0) {
                                for (var G = z['servers'], u = P['Tools']['deal_gateway'](G), I = 0; I < u['length']; I++)
                                    v.urls.push({
                                        name: '___' + I,
                                        url: u[I]
                                    });
                                v['link_index'] = -1,
                                    v['_try_to_linknext']();
                            } else
                                1 > c ? Laya['timer'].once(1000, v, function () {
                                    v['_fetch_gateway'](c + 1);
                                }) : P['LobbyNetMgr'].Inst['polling_connect'] ? (v['lb_index']++, v['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](60)), v['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && P['Scene_MJ'].Inst['ForceOut'](), v['_setState'](P['EConnectState'].none));
                        },
                            z = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > c ? Laya['timer'].once(500, v, function () {
                                        v['_fetch_gateway'](c + 1);
                                    }) : P['LobbyNetMgr'].Inst['polling_connect'] ? (v['lb_index']++, v['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](58)), v['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || P['Scene_MJ'].Inst['ForceOut'](), v['_setState'](P['EConnectState'].none));
                            },
                            G = function (P) {
                                var c = new Laya['HttpRequest']();
                                c.once(Laya['Event']['COMPLETE'], v, function (P) {
                                    _(P);
                                }),
                                    c.once(Laya['Event']['ERROR'], v, function () {
                                        z();
                                    });
                                var G = [];
                                G.push('If-Modified-Since'),
                                    G.push('0'),
                                    P += '?service=ws-game-gateway',
                                    P += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    P += '&location=' + v['server_location'],
                                    P += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    c.send(P, '', 'get', 'text', G),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + P);
                            };
                        P['LobbyNetMgr'].Inst['polling_connect'] ? G(P['LobbyNetMgr'].Inst.urls[this['lb_index']]) : G(P['LobbyNetMgr'].Inst['lb_url']);
                    },
                    c['prototype']['_setState'] = function (c) {
                        this['connect_state'] = c,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (c == P['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : c == P['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : c == P['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : c == P['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : c == P['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    c['prototype']['_ConnectSuccess'] = function () {
                        var c = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (v, _) {
                                if (v || _['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', v, _), P['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](_)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        _['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(_),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(_));
                                            }
                                        });
                                    }
                                    // END
                                    var z = [],
                                        G = 0;
                                    view['DesktopMgr']['player_link_state'] = _['state_list'];
                                    var u = P['Tools']['strOfLocalization'](2003),
                                        I = _['game_config'].mode,
                                        i = view['ERuleMode']['Liqi4'];
                                    I.mode < 10 ? (i = view['ERuleMode']['Liqi4'], c['real_player_count'] = 4) : I.mode < 20 && (i = view['ERuleMode']['Liqi3'], c['real_player_count'] = 3);
                                    for (var N = 0; N < c['real_player_count']; N++)
                                        z.push(null);
                                    I['extendinfo'] && (u = P['Tools']['strOfLocalization'](2004)),
                                        I['detail_rule'] && I['detail_rule']['ai_level'] && (1 === I['detail_rule']['ai_level'] && (u = P['Tools']['strOfLocalization'](2003)), 2 === I['detail_rule']['ai_level'] && (u = P['Tools']['strOfLocalization'](2004)));
                                    for (var V = P['GameUtility']['get_default_ai_skin'](), U = P['GameUtility']['get_default_ai_character'](), N = 0; N < _['seat_list']['length']; N++) {
                                        var Y = _['seat_list'][N];
                                        if (0 == Y) {
                                            z[N] = {
                                                nickname: u,
                                                avatar_id: V,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: U,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: V,
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
                                                    z[N].avatar_id = skin.id;
                                                    z[N].character.charid = skin.character_id;
                                                    z[N].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                z[N].nickname = '[BOT]' + z[N].nickname;
                                            }
                                        } else {
                                            G++;
                                            for (var Z = 0; Z < _['players']['length']; Z++)
                                                if (_['players'][Z]['account_id'] == Y) {
                                                    z[N] = _['players'][Z];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (z[N].account_id == GameMgr.Inst.account_id) {
                                                        z[N].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        z[N].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        z[N].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        z[N].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        z[N].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            z[N].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (z[N].avatar_id == 400101 || z[N].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            z[N].avatar_id = skin.id;
                                                            z[N].character.charid = skin.character_id;
                                                            z[N].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(z[N].account_id);
                                                        if (server == 1) {
                                                            z[N].nickname = '[CN]' + z[N].nickname;
                                                        } else if (server == 2) {
                                                            z[N].nickname = '[JP]' + z[N].nickname;
                                                        } else if (server == 3) {
                                                            z[N].nickname = '[EN]' + z[N].nickname;
                                                        } else {
                                                            z[N].nickname = '[??]' + z[N].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var N = 0; N < c['real_player_count']; N++)
                                        null == z[N] && (z[N] = {
                                            account: 0,
                                            nickname: P['Tools']['strOfLocalization'](2010),
                                            avatar_id: V,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: U,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: V,
                                                is_upgraded: !1
                                            }
                                        });
                                    c['loaded_player_count'] = _['ready_id_list']['length'],
                                        c['_AuthSuccess'](z, _['is_game_start'], _['game_config']['toJSON']());
                                }
                            });
                    },
                    c['prototype']['_AuthSuccess'] = function (c, v, _) {
                        var z = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (c, v) {
                                    c || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', c, v), P['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](v)), v['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2011)), P['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](v['game_restore'])));
                                });
                        })) : P['Scene_MJ'].Inst['openMJRoom'](_, c, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](_)), c, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](z, function () {
                                v ? Laya['timer']['frameOnce'](10, z, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (c, v) {
                                            app.Log.log('syncGame ' + JSON['stringify'](v)),
                                                c || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', c, v), P['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), z['_PlayerReconnectSuccess'](v));
                                        });
                                }) : Laya['timer']['frameOnce'](10, z, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (c, v) {
                                            c || v['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', c, v), P['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), z['_EnterGame'](v), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (P) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * P);
                        }, null, !1));
                    },
                    c['prototype']['_EnterGame'] = function (c) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](c)),
                            c['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2011)), P['Scene_MJ'].Inst['GameEnd']()) : c['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](c['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    c['prototype']['_PlayerReconnectSuccess'] = function (c) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](c)),
                            c['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2011)), P['Scene_MJ'].Inst['GameEnd']()) : c['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](c['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](P['Tools']['strOfLocalization'](2012)), P['Scene_MJ'].Inst['ForceOut']());
                    },
                    c['prototype']['_SendDebugInfo'] = function () { },
                    c['prototype']['OpenConnectObserve'] = function (c, v) {
                        var _ = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                _['server_location'] = v,
                                    _['ob_token'] = c,
                                    _['_setState'](P['EConnectState']['tryconnect']),
                                    _['lb_index'] = 0,
                                    _['_fetch_gateway'](0);
                            });
                    },
                    c['prototype']['_ConnectSuccessOb'] = function () {
                        var c = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (v, _) {
                                v || _['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', v, _), P['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](_)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (v, _) {
                                    if (v || _['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', v, _), P['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var z = _.head,
                                            G = z['game_config'].mode,
                                            u = [],
                                            I = P['Tools']['strOfLocalization'](2003),
                                            i = view['ERuleMode']['Liqi4'];
                                        G.mode < 10 ? (i = view['ERuleMode']['Liqi4'], c['real_player_count'] = 4) : G.mode < 20 && (i = view['ERuleMode']['Liqi3'], c['real_player_count'] = 3);
                                        for (var N = 0; N < c['real_player_count']; N++)
                                            u.push(null);
                                        G['extendinfo'] && (I = P['Tools']['strOfLocalization'](2004)),
                                            G['detail_rule'] && G['detail_rule']['ai_level'] && (1 === G['detail_rule']['ai_level'] && (I = P['Tools']['strOfLocalization'](2003)), 2 === G['detail_rule']['ai_level'] && (I = P['Tools']['strOfLocalization'](2004)));
                                        for (var V = P['GameUtility']['get_default_ai_skin'](), U = P['GameUtility']['get_default_ai_character'](), N = 0; N < z['seat_list']['length']; N++) {
                                            var Y = z['seat_list'][N];
                                            if (0 == Y)
                                                u[N] = {
                                                    nickname: I,
                                                    avatar_id: V,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: U,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: V,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var Z = 0; Z < z['players']['length']; Z++)
                                                    if (z['players'][Z]['account_id'] == Y) {
                                                        u[N] = z['players'][Z];
                                                        break;
                                                    }
                                        }
                                        for (var N = 0; N < c['real_player_count']; N++)
                                            null == u[N] && (u[N] = {
                                                account: 0,
                                                nickname: P['Tools']['strOfLocalization'](2010),
                                                avatar_id: V,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: U,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: V,
                                                    is_upgraded: !1
                                                }
                                            });
                                        c['_StartObSuccuess'](u, _['passed'], z['game_config']['toJSON'](), z['start_time']);
                                    }
                                }));
                            });
                    },
                    c['prototype']['_StartObSuccuess'] = function (c, v, _, z) {
                        var G = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](z, v);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), P['Scene_MJ'].Inst['openMJRoom'](_, c, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](_)), c, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](G, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, G, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](z, v);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (P) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * P);
                        }, null, !1)));
                    },
                    c['_Inst'] = null,
                    c;
            }
                ();
            P['MJNetMgr'] = c;
        }
            (game || (game = {}));










        // 读取战绩
        !function (P) {
            var c = function (c) {
                function v() {
                    var P = c.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return P['account_id'] = 0,
                        P['origin_x'] = 0,
                        P['origin_y'] = 0,
                        P.root = null,
                        P['title'] = null,
                        P['level'] = null,
                        P['btn_addfriend'] = null,
                        P['btn_report'] = null,
                        P['illust'] = null,
                        P.name = null,
                        P['detail_data'] = null,
                        P['achievement_data'] = null,
                        P['locking'] = !1,
                        P['tab_info4'] = null,
                        P['tab_info3'] = null,
                        P['tab_note'] = null,
                        P['tab_img_dark'] = '',
                        P['tab_img_chosen'] = '',
                        P['player_data'] = null,
                        P['tab_index'] = 1,
                        P['game_category'] = 1,
                        P['game_type'] = 1,
                        P['show_name'] = '',
                        v.Inst = P,
                        P;
                }
                return __extends(v, c),
                    v['prototype']['onCreate'] = function () {
                        var c = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new P['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new P['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new P['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new P['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new P['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['btn_addfriend']['visible'] = !1,
                                    c['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: c['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                P['UI_Report_Nickname'].Inst.show(c['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || c['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['close']();
                            }, null, !1),
                            this.note = new P['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || 1 != c['tab_index'] && c['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || 2 != c['tab_index'] && c['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? P['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : c['container_info']['visible'] && (c['container_info']['visible'] = !1, c['tab_info4'].skin = c['tab_img_dark'], c['tab_info3'].skin = c['tab_img_dark'], c['tab_note'].skin = c['tab_img_chosen'], c['tab_index'] = 3, c.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    v['prototype'].show = function (c, v, _, z, G) {
                        var u = this;
                        void 0 === v && (v = 1),
                            void 0 === _ && (_ = 2),
                            void 0 === z && (z = 1),
                            void 0 === G && (G = ''),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = c,
                            this['show_name'] = G,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            P['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                u['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: c
                            }, function (v, _) {
                                v || _['error'] ? P['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', v, _) : P['UI_Shilian']['now_season_info'] && 1001 == P['UI_Shilian']['now_season_info']['season_id'] && 3 != P['UI_Shilian']['get_cur_season_state']() ? (u['detail_data']['setData'](_), u['changeMJCategory'](u['tab_index'], u['game_category'], u['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: c
                                }, function (c, v) {
                                    c || v['error'] ? P['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', c, v) : (_['season_info'] = v['season_info'], u['detail_data']['setData'](_), u['changeMJCategory'](u['tab_index'], u['game_category'], u['game_type']));
                                });
                            }),
                            this.note['init_data'](c),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = c != GameMgr.Inst['account_id'],
                            this['tab_index'] = v,
                            this['game_category'] = _,
                            this['game_type'] = z,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    v['prototype']['refreshBaseInfo'] = function () {
                        var c = this;
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
                            }, function (v, _) {
                                if (v || _['error'])
                                    P['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', v, _);
                                else {
                                    var z = _['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (z.account_id == GameMgr.Inst.account_id) {
                                        z.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            z.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            z.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    c['player_data'] = z,
                                        c['account_id'] != GameMgr.Inst['account_id'] && c['show_name'] && (z['nickname'] = c['show_name']),
                                        game['Tools']['SetNickname'](c.name, z, !1, !!c['show_name']),
                                        c['title'].id = game['Tools']['titleLocalization'](z['account_id'], z['title']),
                                        c['level'].id = z['level'].id,
                                        c['level'].id = c['player_data'][1 == c['tab_index'] ? 'level' : 'level3'].id,
                                        c['level'].exp = c['player_data'][1 == c['tab_index'] ? 'level' : 'level3']['score'],
                                        c['illust'].me['visible'] = !0,
                                        c['account_id'] == GameMgr.Inst['account_id'] ? c['illust']['setSkin'](z['avatar_id'], 'waitingroom') : c['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](z['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], c['account_id']) && c['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(c['account_id']) ? (c['btn_addfriend']['visible'] = !0, c['btn_report'].x = 520) : (c['btn_addfriend']['visible'] = !1, c['btn_report'].x = 343),
                                        c.note.sign['setSign'](z['signature']),
                                        c['achievement_data'].show(!1, z['achievement_count']);
                                }
                            });
                    },
                    v['prototype']['changeMJCategory'] = function (P, c, v) {
                        void 0 === c && (c = 2),
                            void 0 === v && (v = 1),
                            this['tab_index'] = P,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](P, c, v),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    v['prototype']['close'] = function () {
                        var c = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), P['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            c['locking'] = !1,
                                c['enable'] = !1;
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
                (P['UIBase']);
            P['UI_OtherPlayerInfo'] = c;
        }
            (uiscript || (uiscript = {}));











        // 宿舍相关
        !function (P) {
            var c = function () {
                function c(c, _) {
                    var z = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = c,
                        this['container_illust'] = _,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = c['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            z['during_move'] = !0,
                                z['mouse_start_x'] = z['container_move']['mouseX'],
                                z['mouse_start_y'] = z['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            z['during_move'] && (z.move(z['container_move']['mouseX'] - z['mouse_start_x'], z['container_move']['mouseY'] - z['mouse_start_y']), z['mouse_start_x'] = z['container_move']['mouseX'], z['mouse_start_y'] = z['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            z['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            z['during_move'] = !1;
                        }),
                        this['btn_close'] = c['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z['locking'] || z['close']();
                        }, null, !1),
                        this['scrollbar'] = c['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (P) {
                            z['_scale'] = 1 * (1 - P) + 0.5,
                                z['illust']['scaleX'] = z['_scale'],
                                z['illust']['scaleY'] = z['_scale'],
                                z['scrollbar']['setVal'](P, 0);
                        })),
                        this['dongtai_kaiguan'] = new P['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            v.Inst['illust']['resetSkin']();
                        }), new Laya['Handler'](this, function (P) {
                            v.Inst['illust']['playAnim'](P);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](c['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (P) {
                        this['_scale'] = P,
                            this['scrollbar']['setVal'](1 - (P - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    c['prototype'].show = function (c) {
                        var _ = this;
                        this['locking'] = !0,
                            this['when_close'] = c,
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
                            P['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                _['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](v.Inst['illust']['skin_id']);
                    },
                    c['prototype']['close'] = function () {
                        var c = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            P['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                c['locking'] = !1,
                                    c.me['visible'] = !1,
                                    c['when_close'].run();
                            });
                    },
                    c['prototype'].move = function (P, c) {
                        var v = this['illust'].x + P,
                            _ = this['illust'].y + c;
                        v < this['illust_center_x'] - 600 ? v = this['illust_center_x'] - 600 : v > this['illust_center_x'] + 600 && (v = this['illust_center_x'] + 600),
                            _ < this['illust_center_y'] - 1200 ? _ = this['illust_center_y'] - 1200 : _ > this['illust_center_y'] + 800 && (_ = this['illust_center_y'] + 800),
                            this['illust'].x = v,
                            this['illust'].y = _;
                    },
                    c;
            }
                (),
                v = function (v) {
                    function _() {
                        var P = v.call(this, new ui['lobby']['susheUI']()) || this;
                        return P['contianer_illust'] = null,
                            P['illust'] = null,
                            P['illust_rect'] = null,
                            P['container_name'] = null,
                            P['label_name'] = null,
                            P['label_cv'] = null,
                            P['label_cv_title'] = null,
                            P['container_page'] = null,
                            P['container_look_illust'] = null,
                            P['page_select_character'] = null,
                            P['page_visit_character'] = null,
                            P['origin_illust_x'] = 0,
                            P['chat_id'] = 0,
                            P['container_chat'] = null,
                            P['_select_index'] = 0,
                            P['sound_id'] = null,
                            P['chat_block'] = null,
                            P['illust_showing'] = !0,
                            _.Inst = P,
                            P;
                    }
                    return __extends(_, v),
                        _['onMainSkinChange'] = function () {
                            var P = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            P && P['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](P.path) + '/spine');
                        },
                        _['randomDesktopID'] = function () {
                            var c = P['UI_Sushe']['commonViewList'][P['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), c)
                                for (var v = 0; v < c['length']; v++)
                                    c[v].slot == game['EView'].mjp ? this['now_mjp_id'] = c[v].type ? c[v]['item_id_list'][Math['floor'](Math['random']() * c[v]['item_id_list']['length'])] : c[v]['item_id'] : c[v].slot == game['EView']['desktop'] ? this['now_desktop_id'] = c[v].type ? c[v]['item_id_list'][Math['floor'](Math['random']() * c[v]['item_id_list']['length'])] : c[v]['item_id'] : c[v].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = c[v].type ? c[v]['item_id_list'][Math['floor'](Math['random']() * c[v]['item_id_list']['length'])] : c[v]['item_id']);
                        },
                        _.init = function (c) {
                            var v = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (z, G) {
                                if (z || G['error'])
                                    P['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', z, G);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](G)), G = JSON['parse'](JSON['stringify'](G)), G['main_character_id'] && G['characters']) {
                                        //if (v['characters'] = [], G['characters'])
                                        //    for (var u = 0; u < G['characters']['length']; u++)
                                        //        v['characters'].push(G['characters'][u]);
                                        //if (v['skin_map'] = {}, G['skins'])
                                        //    for (var u = 0; u < G['skins']['length']; u++)
                                        //        v['skin_map'][G['skins'][u]] = 1;
                                        //v['main_character_id'] = G['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = G.main_character_id;
                                        for (let count = 0; count < G.characters.length; count++) {
                                            if (G.characters[count].charid == G.main_character_id) {
                                                if (G.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = G.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = G.skins[count];
                                                fake_data.exp = G.characters[count].exp;
                                                fake_data.level = G.characters[count].level;
                                                fake_data.is_upgraded = G.characters[count].is_upgraded;
                                                break;
                                            }
                                        }
                                        v.characters = [];

                                        for (let count = 1; count <= cfg.item_definition.character['rows_'].length; count++) {
                                            let id = 200000 + count;
                                            let skin = 400001 + count * 100;
                                            let emoji = [];
                                            cfg.character.emoji.getGroup(id).forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            v.characters.push({
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
                                        v.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        v.star_chars = MMP.settings.star_chars;
                                        G.character_sort = MMP.settings.star_chars;
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
                                    if (v['send_gift_count'] = 0, v['send_gift_limit'] = 0, G['send_gift_count'] && (v['send_gift_count'] = G['send_gift_count']), G['send_gift_limit'] && (v['send_gift_limit'] = G['send_gift_limit']), G['finished_endings'])
                                        for (var u = 0; u < G['finished_endings']['length']; u++)
                                            v['finished_endings_map'][G['finished_endings'][u]] = 1;
                                    if (G['rewarded_endings'])
                                        for (var u = 0; u < G['rewarded_endings']['length']; u++)
                                            v['rewarded_endings_map'][G['rewarded_endings'][u]] = 1;
                                    if (v['star_chars'] = [], G['character_sort'] && (v['star_chars'] = G['character_sort']), _['hidden_characters_map'] = {}, G['hidden_characters'])
                                        for (var I = 0, i = G['hidden_characters']; I < i['length']; I++) {
                                            var N = i[I];
                                            _['hidden_characters_map'][N] = 1;
                                        }
                                    c.run();
                                }
                            }),
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (c, _) {
                                //    if (c || _['error'])
                                //        P['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', c, _);
                                //    else {
                                //        v['using_commonview_index'] = _.use,
                                //            v['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //        var z = _['views'];
                                //        if (z)
                                //            for (var G = 0; G < z['length']; G++) {
                                //                var u = z[G]['values'];
                                //                u && (v['commonViewList'][z[G]['index']] = u);
                                //            }
                                //        v['randomDesktopID'](),
                                v.commonViewList = MMP.settings.commonViewList;
                            v.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                                            GameMgr.Inst['load_mjp_view'](),
                                            GameMgr.Inst['load_touming_mjp_view']();
                                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                                //    }
                                //});
                        },
                        _['on_data_updata'] = function (c) {
                            if (c['character']) {
                                var v = JSON['parse'](JSON['stringify'](c['character']));
                                if (v['characters'])
                                    for (var _ = v['characters'], z = 0; z < _['length']; z++) {
                                        for (var G = !1, u = 0; u < this['characters']['length']; u++)
                                            if (this['characters'][u]['charid'] == _[z]['charid']) {
                                                this['characters'][u] = _[z],
                                                    P['UI_Sushe_Visit'].Inst && P['UI_Sushe_Visit'].Inst['chara_info'] && P['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][u]['charid'] && (P['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][u]),
                                                    G = !0;
                                                break;
                                            }
                                        G || this['characters'].push(_[z]);
                                    }
                                if (v['skins'])
                                    for (var I = v['skins'], z = 0; z < I['length']; z++)
                                        this['skin_map'][I[z]] = 1;
                                    // START
                                    w['UI_Bag'].Inst['on_skin_change']();
                                    // END
                                if (v['finished_endings']) {
                                    for (var i = v['finished_endings'], z = 0; z < i['length']; z++)
                                        this['finished_endings_map'][i[z]] = 1;
                                    P['UI_Sushe_Visit'].Inst;
                                }
                                if (v['rewarded_endings']) {
                                    for (var i = v['rewarded_endings'], z = 0; z < i['length']; z++)
                                        this['rewarded_endings_map'][i[z]] = 1;
                                    P['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        _['chara_owned'] = function (P) {
                            for (var c = 0; c < this['characters']['length']; c++)
                                if (this['characters'][c]['charid'] == P)
                                    return !0;
                            return !1;
                        },
                        _['skin_owned'] = function (P) {
                            return this['skin_map']['hasOwnProperty'](P['toString']());
                        },
                        _['add_skin'] = function (P) {
                            this['skin_map'][P] = 1;
                        },
                        Object['defineProperty'](_, 'main_chara_info', {
                            get: function () {
                                for (var P = 0; P < this['characters']['length']; P++)
                                    if (this['characters'][P]['charid'] == this['main_character_id'])
                                        return this['characters'][P];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        _['on_view_remove'] = function (P) {
                            for (var c = 0; c < this['commonViewList']['length']; c++)
                                for (var v = this['commonViewList'][c], _ = 0; _ < v['length']; _++)
                                    if (v[_]['item_id'] == P && (v[_]['item_id'] = game['GameUtility']['get_view_default_item_id'](v[_].slot)), v[_]['item_id_list']) {
                                        for (var z = 0; z < v[_]['item_id_list']['length']; z++)
                                            if (v[_]['item_id_list'][z] == P) {
                                                v[_]['item_id_list']['splice'](z, 1);
                                                break;
                                            }
                                        0 == v[_]['item_id_list']['length'] && (v[_].type = 0);
                                    }
                            var G = cfg['item_definition'].item.get(P);
                            G.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == P && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        _['add_finish_ending'] = function (P) {
                            this['finished_endings_map'][P] = 1;
                        },
                        _['add_reward_ending'] = function (P) {
                            this['rewarded_endings_map'][P] = 1;
                        },
                        _['check_all_char_repoint'] = function () {
                            for (var P = 0; P < _['characters']['length']; P++)
                                if (this['check_char_redpoint'](_['characters'][P]))
                                    return !0;
                            return !1;
                        },
                        _['check_char_redpoint'] = function (P) {
                            // 去除小红点
                            //if (_['hidden_characters_map'][P['charid']])
                                return !1;
                            //END
                            var c = cfg.spot.spot['getGroup'](P['charid']);
                            if (c)
                                for (var v = 0; v < c['length']; v++) {
                                    var z = c[v];
                                    if (!(z['is_married'] && !P['is_upgraded'] || !z['is_married'] && P['level'] < z['level_limit']) && 2 == z.type) {
                                        for (var G = !0, u = 0; u < z['jieju']['length']; u++)
                                            if (z['jieju'][u] && _['finished_endings_map'][z['jieju'][u]]) {
                                                if (!_['rewarded_endings_map'][z['jieju'][u]])
                                                    return !0;
                                                G = !1;
                                            }
                                        if (G)
                                            return !0;
                                    }
                                }
                            var I = cfg['item_definition']['character'].get(P['charid']);
                            if (I.ur)
                                for (var i = cfg['level_definition']['character']['getGroup'](P['charid']), N = 1, V = 0, U = i; V < U['length']; V++) {
                                    var Y = U[V];
                                    if (N > P['level'])
                                        return;
                                    if (Y['reward'] && (!P['rewarded_level'] || -1 == P['rewarded_level']['indexOf'](N)))
                                        return !0;
                                    N++;
                                }
                            return !1;
                        },
                        _['is_char_star'] = function (P) {
                            return -1 != this['star_chars']['indexOf'](P);
                        },
                        _['change_char_star'] = function (P) {
                            var c = this['star_chars']['indexOf'](P);
                            -1 != c ? this['star_chars']['splice'](c, 1) : this['star_chars'].push(P);
                            // 屏蔽网络请求
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                                //    sort: this['star_chars']
                                //}, function () { });
                            // END
                        },
                        Object['defineProperty'](_['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        _['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        _['prototype']['onCreate'] = function () {
                            var v = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new P['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = P['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new P['UI_Character_Chat'](this['container_chat'], !0),
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
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new P['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new P['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new c(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        _['prototype'].show = function (c) {
                            P['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var v = 0, z = 0; z < _['characters']['length']; z++)
                                if (_['characters'][z]['charid'] == _['main_character_id']) {
                                    v = z;
                                    break;
                                }
                            0 == c ? (this['change_select'](v), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        _['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](_['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        _['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(_['characters'][this['_select_index']], 2);
                        },
                        _['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                P['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        _['prototype']['close'] = function (c) {
                            var v = this;
                            this['illust_showing'] && P['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    v['enable'] = !1,
                                        c && c.run();
                                });
                        },
                        _['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        _['prototype']['hide_illust'] = function () {
                            var c = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, P['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                c['contianer_illust']['visible'] = !1;
                            })));
                        },
                        _['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, P['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var c = 0, v = 0; v < _['characters']['length']; v++)
                                        if (_['characters'][v]['charid'] == _['main_character_id']) {
                                            c = v;
                                            break;
                                        }
                                    this['change_select'](c);
                                }
                        },
                        _['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        _['prototype']['show_page_visit'] = function (P) {
                            void 0 === P && (P = 0),
                                this['page_visit_character'].show(_['characters'][this['_select_index']], P);
                        },
                        _['prototype']['change_select'] = function (c) {
                            this['_select_index'] = c,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var v = _['characters'][c],
                                z = cfg['item_definition']['character'].get(v['charid']);
                            if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != _['chs_fengyu_name_lst']['indexOf'](v['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != _['chs_fengyu_cv_lst']['indexOf'](v['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                this['label_name'].text = z['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                                    this['label_cv'].text = z['desc_cv_' + GameMgr['client_language']],
                                    this['label_cv_title'].text = 'CV';
                                var G = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                                this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : G.test(z['name_' + GameMgr['client_language']]) ? -15 : 0,
                                    this['label_cv']['leading'] = G.test(this['label_cv'].text) ? -7 : 0;
                            } else
                                this['label_name'].text = z['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + z['desc_cv_' + GameMgr['client_language']];
                            ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var u = new P['UIRect']();
                            u.x = this['illust_rect'].x,
                                u.y = this['illust_rect'].y,
                                u['width'] = this['illust_rect']['width'],
                                u['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](u),
                                this['illust']['setSkin'](v.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                P['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var I = cfg['item_definition'].skin.get(v.skin);
                            I['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        _['prototype']['onChangeSkin'] = function (P) {
                            _['characters'][this['_select_index']].skin = P,
                                this['change_select'](this['_select_index']),
                                _['characters'][this['_select_index']]['charid'] == _['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = P, _['onMainSkinChange']());
                            // 屏蔽换肤请求
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //    character_id: _['characters'][this['_select_index']]['charid'],
                                //    skin: P
                                //}, function () { });
                            // 保存皮肤
                        },
                        _['prototype'].say = function (P) {
                            var c = this,
                                v = _['characters'][this['_select_index']];
                            this['chat_id']++;
                            var z = this['chat_id'],
                                G = view['AudioMgr']['PlayCharactorSound'](v, P, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, c, function () {
                                        z == c['chat_id'] && c['stopsay']();
                                    });
                                }));
                            G && (this['chat_block'].show(G['words']), this['sound_id'] = G['audio_id']);
                        },
                        _['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                        },
                        _['prototype']['to_look_illust'] = function () {
                            var P = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                P['illust']['playAnim']('idle'),
                                    P['page_select_character'].show(0);
                            }));
                        },
                        _['prototype']['jump_to_char_skin'] = function (c, v) {
                            var z = this;
                            if (void 0 === c && (c = -1), void 0 === v && (v = null), c >= 0)
                                for (var G = 0; G < _['characters']['length']; G++)
                                    if (_['characters'][G]['charid'] == c) {
                                        this['change_select'](G);
                                        break;
                                    }
                            P['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                _.Inst['show_page_visit'](),
                                    z['page_visit_character']['show_pop_skin'](),
                                    z['page_visit_character']['set_jump_callback'](v);
                            }));
                        },
                        _['prototype']['jump_to_char_qiyue'] = function (c) {
                            var v = this;
                            if (void 0 === c && (c = -1), c >= 0)
                                for (var z = 0; z < _['characters']['length']; z++)
                                    if (_['characters'][z]['charid'] == c) {
                                        this['change_select'](z);
                                        break;
                                    }
                            P['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                _.Inst['show_page_visit'](),
                                    v['page_visit_character']['show_qiyue']();
                            }));
                        },
                        _['prototype']['jump_to_char_gift'] = function (c) {
                            var v = this;
                            if (void 0 === c && (c = -1), c >= 0)
                                for (var z = 0; z < _['characters']['length']; z++)
                                    if (_['characters'][z]['charid'] == c) {
                                        this['change_select'](z);
                                        break;
                                    }
                            P['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                _.Inst['show_page_visit'](),
                                    v['page_visit_character']['show_gift']();
                            }));
                        },
                        _['characters'] = [],
                        _['chs_fengyu_name_lst'] = ['200040', '200043'],
                        _['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        _['skin_map'] = {},
                        _['main_character_id'] = 0,
                        _['send_gift_count'] = 0,
                        _['send_gift_limit'] = 0,
                        _['commonViewList'] = [],
                        _['using_commonview_index'] = 0,
                        _['finished_endings_map'] = {},
                        _['rewarded_endings_map'] = {},
                        _['star_chars'] = [],
                        _['hidden_characters_map'] = {},
                        _.Inst = null,
                        _;
                }
                    (P['UIBase']);
            P['UI_Sushe'] = v;
        }
            (uiscript || (uiscript = {}));












        // 屏蔽改变宿舍角色的网络请求
        !function (P) {
            var c = function () {
                function c(c) {
                    var _ = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = c,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || v.Inst['close'](Laya['Handler']['create'](_, function () {
                                P['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || v.Inst['close'](Laya['Handler']['create'](_, function () {
                                P['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || P['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            v.Inst['locking'] || _['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new P['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            P['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return c['prototype'].show = function (c, v) {
                    if (void 0 === v && (v = !1), this.me['visible'] = !0, c ? this.me['alpha'] = 1 : P['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), v || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var _ = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, _));
                    }
                },
                    c['prototype']['render_character_cell'] = function (c) {
                        var v = this,
                            _ = c['index'],
                            z = c['container'],
                            G = c['cache_data'];
                        z['visible'] = !0,
                            G['index'] = _,
                            G['inited'] || (G['inited'] = !0, z['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                v['onClickAtHead'](G['index']);
                            }), G.skin = new P['UI_Character_Skin'](z['getChildByName']('btn')['getChildByName']('head')), G.bg = z['getChildByName']('btn')['getChildByName']('bg'), G['bound'] = z['getChildByName']('btn')['getChildByName']('bound'), G['btn_star'] = z['getChildByName']('btn_star'), G.star = z['getChildByName']('btn')['getChildByName']('star'), G['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                v['onClickAtStar'](G['index']);
                            }));
                        var u = z['getChildByName']('btn');
                        u['getChildByName']('choose')['visible'] = _ == this['select_index'];
                        var I = this['getCharInfoByIndex'](_);
                        u['getChildByName']('redpoint')['visible'] = P['UI_Sushe']['check_char_redpoint'](I),
                            G.skin['setSkin'](I.skin, 'bighead'),
                            u['getChildByName']('using')['visible'] = I['charid'] == P['UI_Sushe']['main_character_id'],
                            z['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '2.png' : '.png'));
                        var i = cfg['item_definition']['character'].get(I['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? G['bound'].skin = i.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (I['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (I['is_upgraded'] ? '2.png' : '.png')) : i.ur ? (G['bound'].pos(-10, -2), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '6.png' : '5.png'))) : (G['bound'].pos(4, 20), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '4.png' : '3.png'))),
                            G['btn_star']['visible'] = this['select_index'] == _,
                            G.star['visible'] = P['UI_Sushe']['is_char_star'](I['charid']) || this['select_index'] == _;
                        var N = cfg['item_definition']['character'].find(I['charid']),
                            V = u['getChildByName']('label_name'),
                            U = N['name_' + GameMgr['client_language'] + '2'] ? N['name_' + GameMgr['client_language'] + '2'] : N['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            G.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (P['UI_Sushe']['is_char_star'](I['charid']) ? 'l' : 'd') + (I['is_upgraded'] ? '1.png' : '.png')),
                                V.text = U['replace']('-', '|')['replace'](/\./g, '·');
                            var Y = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            V['leading'] = Y.test(U) ? -15 : 0;
                        } else
                            G.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (P['UI_Sushe']['is_char_star'](I['charid']) ? 'l.png' : 'd.png')), V.text = U;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == I['charid'] ? (V['scaleX'] = 0.67, V['scaleY'] = 0.57) : (V['scaleX'] = 0.7, V['scaleY'] = 0.6));
                    },
                    c['prototype']['onClickAtHead'] = function (c) {
                        if (this['select_index'] == c) {
                            var v = this['getCharInfoByIndex'](c);
                            if (v['charid'] != P['UI_Sushe']['main_character_id'])
                                if (P['UI_PiPeiYuYue'].Inst['enable'])
                                    P['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var _ = P['UI_Sushe']['main_character_id'];
                                    P['UI_Sushe']['main_character_id'] = v['charid'],
                                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //    character_id: P['UI_Sushe']['main_character_id']
                                        //}, function () {}),
                                        GameMgr.Inst['account_data']['avatar_id'] = v.skin,
                                        P['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = v.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = v.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var z = 0; z < this['show_index_list']['length']; z++)
                                        this['getCharInfoByIndex'](z)['charid'] == _ && this['scrollview']['wantToRefreshItem'](z);
                                    this['scrollview']['wantToRefreshItem'](c);
                                }
                        } else {
                            var G = this['select_index'];
                            this['select_index'] = c,
                                G >= 0 && this['scrollview']['wantToRefreshItem'](G),
                                this['scrollview']['wantToRefreshItem'](c),
                                P['UI_Sushe'].Inst['change_select'](this['show_index_list'][c]);
                        }
                    },
                    c['prototype']['onClickAtStar'] = function (c) {
                        if (P['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](c)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](c);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var v = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, v));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    c['prototype']['close'] = function (c) {
                        var v = this;
                        this.me['visible'] && (c ? this.me['visible'] = !1 : P['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            v.me['visible'] = !1;
                        })));
                    },
                    c['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var c = !1, v = 0, _ = P['UI_Sushe']['star_chars']; v < _['length']; v++) {
                                var z = _[v];
                                if (!P['UI_Sushe']['hidden_characters_map'][z]) {
                                    c = !0;
                                    break;
                                }
                            }
                            if (!c)
                                return P['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        P['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var G = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](G),
                            Laya['Tween'].to(G, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    c['prototype']['getShowStarState'] = function () {
                        if (0 == P['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var c = 0, v = P['UI_Sushe']['star_chars']; c < v['length']; c++) {
                                var _ = v[c];
                                if (!P['UI_Sushe']['hidden_characters_map'][_])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    c['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var c = 0, v = P['UI_Sushe']['star_chars']; c < v['length']; c++) {
                            var _ = v[c];
                            if (!P['UI_Sushe']['hidden_characters_map'][_])
                                for (var z = 0; z < P['UI_Sushe']['characters']['length']; z++)
                                    if (P['UI_Sushe']['characters'][z]['charid'] == _) {
                                        z == P['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(z);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var z = 0; z < P['UI_Sushe']['characters']['length']; z++)
                                P['UI_Sushe']['hidden_characters_map'][P['UI_Sushe']['characters'][z]['charid']] || -1 == this['show_index_list']['indexOf'](z) && (z == P['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(z));
                    },
                    c['prototype']['getCharInfoByIndex'] = function (c) {
                        return P['UI_Sushe']['characters'][this['show_index_list'][c]];
                    },
                    c;
            }
                (),
                v = function (v) {
                    function _() {
                        var P = v.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return P['bg_width_head'] = 962,
                            P['bg_width_zhuangban'] = 1819,
                            P['bg2_delta'] = -29,
                            P['container_top'] = null,
                            P['locking'] = !1,
                            P.tabs = [],
                            P['tab_index'] = 0,
                            _.Inst = P,
                            P;
                    }
                    return __extends(_, v),
                        _['prototype']['onCreate'] = function () {
                            var v = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    v['locking'] || (1 == v['tab_index'] && v['container_zhuangban']['changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                        v['close'](),
                                            P['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (v['close'](), P['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var _ = this.root['getChildByName']('container_tabs'), z = function (c) {
                                G.tabs.push(_['getChildAt'](c)),
                                    G.tabs[c]['clickHandler'] = new Laya['Handler'](G, function () {
                                        v['locking'] || v['tab_index'] != c && (1 == v['tab_index'] && v['container_zhuangban']['changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                            v['change_tab'](c);
                                        }), null) : v['change_tab'](c));
                                    });
                            }, G = this, u = 0; u < _['numChildren']; u++)
                                z(u);
                            this['container_head'] = new c(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new P['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return v['locking'];
                                }));
                        },
                        _['prototype'].show = function (c) {
                            var v = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = c,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), P['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), P['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), P['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), P['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    v['locking'] = !1;
                                });
                            for (var _ = 0; _ < this.tabs['length']; _++) {
                                var z = this.tabs[_];
                                z.skin = game['Tools']['localUISrc'](_ == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var G = z['getChildByName']('word');
                                G['color'] = _ == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    G['scaleX'] = G['scaleY'] = _ == this['tab_index'] ? 1.1 : 1,
                                    _ == this['tab_index'] && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
                            }
                        },
                        _['prototype']['change_tab'] = function (c) {
                            var v = this;
                            this['tab_index'] = c;
                            for (var _ = 0; _ < this.tabs['length']; _++) {
                                var z = this.tabs[_];
                                z.skin = game['Tools']['localUISrc'](_ == c ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var G = z['getChildByName']('word');
                                G['color'] = _ == c ? '#552c1c' : '#d3a86c',
                                    G['scaleX'] = G['scaleY'] = _ == c ? 1.1 : 1,
                                    _ == c && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    P['UI_Sushe'].Inst['open_illust'](),
                                        v['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), P['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
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
                        _['prototype']['close'] = function (c) {
                            var v = this;
                            this['locking'] = !0,
                                P['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? P['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    v['container_head']['close'](!0);
                                })) : P['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    v['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        c && c.run();
                                });
                        },
                        _['prototype']['onDisable'] = function () {
                            for (var c = 0; c < P['UI_Sushe']['characters']['length']; c++) {
                                var v = P['UI_Sushe']['characters'][c].skin,
                                    _ = cfg['item_definition'].skin.get(v);
                                _ && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](_.path + '/bighead.png'));
                            }
                        },
                        _['prototype']['changeKaiguanShow'] = function (P) {
                            P ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        _['prototype']['changeZhuangbanSlot'] = function (P) {
                            this['container_zhuangban']['changeSlotByItemId'](P);
                        },
                        _;
                }
                    (P['UIBase']);
            P['UI_Sushe_Select'] = v;
        }
            (uiscript || (uiscript = {}));









        // 友人房
        !function (P) {
            var c = function () {
                function c(P) {
                    var c = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = P,
                        this.me['visible'] = !1,
                        this['blackbg'] = P['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c['locking'] || c['close']();
                        }, null, !1),
                        this.root = P['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return c['prototype'].show = function () {
                    var c = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var v = game['FriendMgr']['friend_list'], _ = 0; _ < v['length']; _++)
                        this['sortlist'].push(_);
                    this['sortlist'] = this['sortlist'].sort(function (P, c) {
                        var _ = v[P],
                            z = 0;
                        if (_['state']['is_online']) {
                            var G = game['Tools']['playState2Desc'](_['state']['playing']);
                            z += '' != G ? 30000000000 : 60000000000,
                                _.base['level'] && (z += _.base['level'].id % 1000 * 10000000),
                                _.base['level3'] && (z += _.base['level3'].id % 1000 * 10000),
                                z += -Math['floor'](_['state']['login_time'] / 10000000);
                        } else
                            z += _['state']['logout_time'];
                        var u = v[c],
                            I = 0;
                        if (u['state']['is_online']) {
                            var G = game['Tools']['playState2Desc'](u['state']['playing']);
                            I += '' != G ? 30000000000 : 60000000000,
                                u.base['level'] && (I += u.base['level'].id % 1000 * 10000000),
                                u.base['level3'] && (I += u.base['level3'].id % 1000 * 10000),
                                I += -Math['floor'](u['state']['login_time'] / 10000000);
                        } else
                            I += u['state']['logout_time'];
                        return I - z;
                    });
                    for (var _ = 0; _ < v['length']; _++)
                        this['friends'].push({
                            f: v[_],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        P['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            c['locking'] = !1;
                        }));
                },
                    c['prototype']['close'] = function () {
                        var c = this;
                        this['locking'] = !0,
                            P['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                c['locking'] = !1,
                                    c.me['visible'] = !1;
                            }));
                    },
                    c['prototype']['render_item'] = function (c) {
                        var v = c['index'],
                            _ = c['container'],
                            G = c['cache_data'];
                        G.head || (G.head = new P['UI_Head'](_['getChildByName']('head'), 'UI_WaitingRoom'), G.name = _['getChildByName']('name'), G['state'] = _['getChildByName']('label_state'), G.btn = _['getChildByName']('btn_invite'), G['invited'] = _['getChildByName']('invited'));
                        var u = this['friends'][this['sortlist'][v]];
                        G.head.id = game['GameUtility']['get_limited_skin_id'](u.f.base['avatar_id']),
                            G.head['set_head_frame'](u.f.base['account_id'], u.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](G.name, u.f.base, GameMgr.Inst['hide_nickname']);
                        var I = !1;
                        if (u.f['state']['is_online']) {
                            var i = game['Tools']['playState2Desc'](u.f['state']['playing']);
                            '' != i ? (G['state'].text = game['Tools']['strOfLocalization'](2069, [i]), G['state']['color'] = '#a9d94d', G.name['getChildByName']('name')['color'] = '#a9d94d') : (G['state'].text = game['Tools']['strOfLocalization'](2071), G['state']['color'] = '#58c4db', G.name['getChildByName']('name')['color'] = '#58c4db', I = !0);
                        } else
                            G['state'].text = game['Tools']['strOfLocalization'](2072), G['state']['color'] = '#8c8c8c', G.name['getChildByName']('name')['color'] = '#8c8c8c';
                        u['invited'] ? (G.btn['visible'] = !1, G['invited']['visible'] = !0) : (G.btn['visible'] = !0, G['invited']['visible'] = !1, game['Tools']['setGrayDisable'](G.btn, !I), I && (G.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](G.btn, !0);
                            var c = {
                                room_id: z.Inst['room_id'],
                                mode: z.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: u.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](c)
                            }, function (c, v) {
                                c || v['error'] ? (game['Tools']['setGrayDisable'](G.btn, !1), P['UIMgr'].Inst['showNetReqError']('sendClientMessage', c, v)) : (G.btn['visible'] = !1, G['invited']['visible'] = !0, u['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    c;
            }
                (),
                v = function () {
                    function c(c) {
                        var v = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = c,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new P['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new P['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return v['locking'];
                            }));
                        for (var _ = this.root['getChildByName']('container_tabs'), z = function (c) {
                            G.tabs.push(_['getChildAt'](c)),
                                G.tabs[c]['clickHandler'] = new Laya['Handler'](G, function () {
                                    v['locking'] || v['tab_index'] != c && (1 == v['tab_index'] && v['page_zhangban']['changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                        v['change_tab'](c);
                                    }), null) : v['change_tab'](c));
                                });
                        }, G = this, u = 0; u < _['numChildren']; u++)
                            z(u);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            v['locking'] || (1 == v['tab_index'] && v['page_zhangban']['changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                v['close'](!1);
                            }), null) : v['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                v['locking'] || (1 == v['tab_index'] && v['page_zhangban']['changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](v, function () {
                                    v['close'](!1);
                                }), null) : v['close'](!1));
                            });
                    }
                    return c['prototype'].show = function () {
                        var c = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            P['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                c['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var v = 0; v < this.tabs['length']; v++) {
                            var _ = this.tabs[v];
                            _.skin = game['Tools']['localUISrc'](v == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var z = _['getChildByName']('word');
                            z['color'] = v == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                z['scaleX'] = z['scaleY'] = v == this['tab_index'] ? 1.1 : 1,
                                v == this['tab_index'] && _['parent']['setChildIndex'](_, this.tabs['length'] - 1);
                        }
                    },
                        c['prototype']['change_tab'] = function (P) {
                            var c = this;
                            this['tab_index'] = P;
                            for (var v = 0; v < this.tabs['length']; v++) {
                                var _ = this.tabs[v];
                                _.skin = game['Tools']['localUISrc'](v == P ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var z = _['getChildByName']('word');
                                z['color'] = v == P ? '#552c1c' : '#d3a86c',
                                    z['scaleX'] = z['scaleY'] = v == P ? 1.1 : 1,
                                    v == P && _['parent']['setChildIndex'](_, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    c['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    c['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    c['locking'] = !1;
                                });
                        },
                        c['prototype']['close'] = function (c) {
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
                            this.me['visible'] && (c ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: z.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), P['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                v['locking'] = !1,
                                    v.me['visible'] = !1;
                            }))));
                        },
                        c;
                }
                    (),
                _ = function () {
                    function P(P) {
                        this['modes'] = [],
                            this.me = P,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return P['prototype'].show = function (P) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = P,
                            this['scrollview']['addItem'](P['length']);
                        var c = this['scrollview']['total_height'];
                        c > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - c, this.bg['height'] = c + 20),
                            this.bg['visible'] = !0;
                    },
                        P['prototype']['render_item'] = function (P) {
                            var c = P['index'],
                                v = P['container'],
                                _ = v['getChildByName']('info');
                            _['fontSize'] = 40,
                                _['fontSize'] = this['modes'][c]['length'] <= 5 ? 40 : this['modes'][c]['length'] <= 9 ? 55 - 3 * this['modes'][c]['length'] : 28,
                                _.text = this['modes'][c];
                        },
                        P;
                }
                    (),
                z = function (z) {
                    function G() {
                        var c = z.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return c['skin_ready'] = 'myres/room/btn_ready.png',
                            c['skin_cancel'] = 'myres/room/btn_cancel.png',
                            c['skin_start'] = 'myres/room/btn_start.png',
                            c['skin_start_no'] = 'myres/room/btn_start_no.png',
                            c['update_seq'] = 0,
                            c['pre_msgs'] = [],
                            c['msg_tail'] = -1,
                            c['posted'] = !1,
                            c['label_rommid'] = null,
                            c['player_cells'] = [],
                            c['btn_ok'] = null,
                            c['btn_invite_friend'] = null,
                            c['btn_add_robot'] = null,
                            c['btn_dress'] = null,
                            c['btn_copy'] = null,
                            c['beReady'] = !1,
                            c['room_id'] = -1,
                            c['owner_id'] = -1,
                            c['tournament_id'] = 0,
                            c['max_player_count'] = 0,
                            c['players'] = [],
                            c['container_rules'] = null,
                            c['container_top'] = null,
                            c['container_right'] = null,
                            c['locking'] = !1,
                            c['mousein_copy'] = !1,
                            c['popout'] = null,
                            c['room_link'] = null,
                            c['btn_copy_link'] = null,
                            c['last_start_room'] = 0,
                            c['invitefriend'] = null,
                            c['pre_choose'] = null,
                            c['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            G.Inst = c,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](c, function (P) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](P)),
                                    c['onReadyChange'](P['account_id'], P['ready'], P['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](c, function (P) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](P)),
                                    c['onPlayerChange'](P);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](c, function (P) {
                                c['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](P)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), c['onGameStart'](P));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](c, function (P) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](P)),
                                    c['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](c, function () {
                                c['enable'] && c.hide(Laya['Handler']['create'](c, function () {
                                    P['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            c;
                    }
                    return __extends(G, z),
                        G['prototype']['push_msg'] = function (P) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](P)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](P));
                        },
                        Object['defineProperty'](G['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](G['prototype'], 'robot_count', {
                            get: function () {
                                for (var P = 0, c = 0; c < this['players']['length']; c++)
                                    2 == this['players'][c]['category'] && P++;
                                return P;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        G['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        G['prototype']['updateData'] = function (P) {
                            if (!P)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < P.persons.length; i++) {

                                if (P.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    P.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    P.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    P.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    P.persons[i].title = GameMgr.Inst.account_data.title;
                                    P.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        P.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = P['room_id'],
                                this['owner_id'] = P['owner_id'],
                                this['room_mode'] = P.mode,
                                this['public_live'] = P['public_live'],
                                this['tournament_id'] = 0,
                                P['tournament_id'] && (this['tournament_id'] = P['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = P['max_player_count'],
                                this['players'] = [];
                            for (var c = 0; c < P['persons']['length']; c++) {
                                var v = P['persons'][c];
                                v['ready'] = !1,
                                    v['cell_index'] = -1,
                                    v['category'] = 1,
                                    this['players'].push(v);
                            }
                            for (var c = 0; c < P['robot_count']; c++)
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
                            for (var c = 0; c < P['ready_list']['length']; c++)
                                for (var _ = 0; _ < this['players']['length']; _++)
                                    if (this['players'][_]['account_id'] == P['ready_list'][c]) {
                                        this['players'][_]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                P.seq && (this['update_seq'] = P.seq);
                        },
                        G['prototype']['onReadyChange'] = function (P, c, v) {
                            for (var _ = 0; _ < this['players']['length']; _++)
                                if (this['players'][_]['account_id'] == P) {
                                    this['players'][_]['ready'] = c,
                                        this['players'][_]['dressing'] = v,
                                        this['_onPlayerReadyChange'](this['players'][_]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        G['prototype']['onPlayerChange'] = function (P) {
                            if (app.Log.log(P), P = P['toJSON'](), !(P.seq && P.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < P.player_list.length; i++) {

                                    if (P.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        P.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        P.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        P.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            P.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (P.update_list != undefined) {
                                    for (var i = 0; i < P.update_list.length; i++) {

                                        if (P.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            P.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            P.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            P.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                P.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = P.seq;
                                var c = {};
                                c.type = 'onPlayerChange0',
                                    c['players'] = this['players'],
                                    c.msg = P,
                                    this['push_msg'](JSON['stringify'](c));
                                var v = this['robot_count'],
                                    _ = P['robot_count'];
                                if (_ < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, v--);
                                    for (var z = 0; z < this['players']['length']; z++)
                                        2 == this['players'][z]['category'] && v > _ && (this['players'][z]['category'] = 0, v--);
                                }
                                for (var G = [], u = P['player_list'], z = 0; z < this['players']['length']; z++)
                                    if (1 == this['players'][z]['category']) {
                                        for (var I = -1, i = 0; i < u['length']; i++)
                                            if (u[i]['account_id'] == this['players'][z]['account_id']) {
                                                I = i;
                                                break;
                                            }
                                        if (-1 != I) {
                                            var N = u[I];
                                            G.push(this['players'][z]),
                                                this['players'][z]['avatar_id'] = N['avatar_id'],
                                                this['players'][z]['title'] = N['title'],
                                                this['players'][z]['verified'] = N['verified'];
                                        }
                                    } else
                                        2 == this['players'][z]['category'] && G.push(this['players'][z]);
                                this['players'] = G;
                                for (var z = 0; z < u['length']; z++) {
                                    for (var V = !1, N = u[z], i = 0; i < this['players']['length']; i++)
                                        if (1 == this['players'][i]['category'] && this['players'][i]['account_id'] == N['account_id']) {
                                            V = !0;
                                            break;
                                        }
                                    V || this['players'].push({
                                        account_id: N['account_id'],
                                        avatar_id: N['avatar_id'],
                                        nickname: N['nickname'],
                                        verified: N['verified'],
                                        title: N['title'],
                                        level: N['level'],
                                        level3: N['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var U = [!1, !1, !1, !1], z = 0; z < this['players']['length']; z++)
                                    - 1 != this['players'][z]['cell_index'] && (U[this['players'][z]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][z]));
                                for (var z = 0; z < this['players']['length']; z++)
                                    if (1 == this['players'][z]['category'] && -1 == this['players'][z]['cell_index'])
                                        for (var i = 0; i < this['max_player_count']; i++)
                                            if (!U[i]) {
                                                this['players'][z]['cell_index'] = i,
                                                    U[i] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][z]);
                                                break;
                                            }
                                for (var v = this['robot_count'], _ = P['robot_count']; _ > v;) {
                                    for (var Y = -1, i = 0; i < this['max_player_count']; i++)
                                        if (!U[i]) {
                                            Y = i;
                                            break;
                                        }
                                    if (-1 == Y)
                                        break;
                                    U[Y] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: Y,
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
                                for (var z = 0; z < this['max_player_count']; z++)
                                    U[z] || this['_clearCell'](z);
                                var c = {};
                                if (c.type = 'onPlayerChange1', c['players'] = this['players'], this['push_msg'](JSON['stringify'](c)), P['owner_id']) {
                                    if (this['owner_id'] = P['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var i = 0; i < this['players']['length']; i++)
                                                if (this['players'][i] && this['players'][i]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][i]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var i = 0; i < this['players']['length']; i++)
                                            if (this['players'][i] && this['players'][i]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][i]);
                                                break;
                                            }
                            }
                        },
                        G['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), P['UI_Lobby'].Inst['enable'] = !0, P['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        G['prototype']['onCreate'] = function () {
                            var z = this;
                            this['last_start_room'] = 0;
                            var G = this.me['getChildByName']('root');
                            this['container_top'] = G['getChildByName']('top'),
                                this['container_right'] = G['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var u = function (c) {
                                var v = G['getChildByName']('player_' + c['toString']()),
                                    _ = {};
                                _['index'] = c,
                                    _['container'] = v,
                                    _['container_flag'] = v['getChildByName']('flag'),
                                    _['container_flag']['visible'] = !1,
                                    _['container_name'] = v['getChildByName']('container_name'),
                                    _.name = v['getChildByName']('container_name')['getChildByName']('name'),
                                    _['btn_t'] = v['getChildByName']('btn_t'),
                                    _['container_illust'] = v['getChildByName']('container_illust'),
                                    _['illust'] = new P['UI_Character_Skin'](v['getChildByName']('container_illust')['getChildByName']('illust')),
                                    _.host = v['getChildByName']('host'),
                                    _['title'] = new P['UI_PlayerTitle'](v['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    _.rank = new P['UI_Level'](v['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    _['is_robot'] = !1;
                                var u = 0;
                                _['btn_t']['clickHandler'] = Laya['Handler']['create'](I, function () {
                                    if (!(z['locking'] || Laya['timer']['currTimer'] < u)) {
                                        u = Laya['timer']['currTimer'] + 500;
                                        for (var P = 0; P < z['players']['length']; P++)
                                            if (z['players'][P]['cell_index'] == c) {
                                                z['kickPlayer'](P);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    _['btn_info'] = v['getChildByName']('btn_info'),
                                    _['btn_info']['clickHandler'] = Laya['Handler']['create'](I, function () {
                                        if (!z['locking'])
                                            for (var v = 0; v < z['players']['length']; v++)
                                                if (z['players'][v]['cell_index'] == c) {
                                                    z['players'][v]['account_id'] && z['players'][v]['account_id'] > 0 && P['UI_OtherPlayerInfo'].Inst.show(z['players'][v]['account_id'], z['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                                    break;
                                                }
                                    }, null, !1),
                                    I['player_cells'].push(_);
                            }, I = this, i = 0; 4 > i; i++)
                                u(i);
                            this['btn_ok'] = G['getChildByName']('btn_ok');
                            var N = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < N + 500 || (N = Laya['timer']['currTimer'], z['owner_id'] == GameMgr.Inst['account_id'] ? z['getStart']() : z['switchReady']());
                            }, null, !1);
                            var V = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < V + 500 || (V = Laya['timer']['currTimer'], z['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['locking'] || z['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var U = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                z['locking'] || Laya['timer']['currTimer'] < U || (U = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: z['robot_count'] + 1
                                }, function (c, v) {
                                    (c || v['error'] && 1111 != v['error'].code) && P['UIMgr'].Inst['showNetReqError']('modifyRoom_add', c, v),
                                        U = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!z['locking']) {
                                        var c = 0;
                                        z['room_mode']['detail_rule'] && z['room_mode']['detail_rule']['chuanma'] && (c = 1),
                                            P['UI_Rules'].Inst.show(0, null, c);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    z['locking'] || z['beReady'] && z['owner_id'] != GameMgr.Inst['account_id'] || (z['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: z['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    z['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    z['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    z['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), z['popout']['visible'] = !0, P['UIBase']['anim_pop_out'](z['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new _(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var c = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    c.call('setSysClipboardText', z['room_link'].text),
                                        P['UIBase']['anim_pop_hide'](z['popout'], Laya['Handler']['create'](z, function () {
                                            z['popout']['visible'] = !1;
                                        })),
                                        P['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', z['room_link'].text, function () { }),
                                        P['UIBase']['anim_pop_hide'](z['popout'], Laya['Handler']['create'](z, function () {
                                            z['popout']['visible'] = !1;
                                        })),
                                        P['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    P['UIBase']['anim_pop_hide'](z['popout'], Laya['Handler']['create'](z, function () {
                                        z['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new c(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new v(this.me['getChildByName']('pop_view'));
                        },
                        G['prototype'].show = function () {
                            var c = this;
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
                            var _ = {};
                            _.type = 'show',
                                _['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](_)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var z = [];
                            z.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var G = this['room_mode']['detail_rule'];
                            if (G) {
                                var u = 5,
                                    I = 20;
                                if (null != G['time_fixed'] && (u = G['time_fixed']), null != G['time_add'] && (I = G['time_add']), z.push(u['toString']() + '+' + I['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var i = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    i && z.push(i.name);
                                }
                                if (null != G['init_point'] && z.push(game['Tools']['strOfLocalization'](2199) + G['init_point']), null != G['fandian'] && z.push(game['Tools']['strOfLocalization'](2094) + ':' + G['fandian']), G['guyi_mode'] && z.push(game['Tools']['strOfLocalization'](3028)), null != G['dora_count'])
                                    switch (G['chuanma'] && (G['dora_count'] = 0), G['dora_count']) {
                                        case 0:
                                            z.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            z.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            z.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            z.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != G['shiduan'] && 1 != G['shiduan'] && z.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === G['fanfu'] && z.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === G['fanfu'] && z.push(game['Tools']['strOfLocalization'](2764)),
                                    null != G['bianjietishi'] && 1 != G['bianjietishi'] && z.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != G['have_zimosun'] && 1 != G['have_zimosun'] ? z.push(game['Tools']['strOfLocalization'](2202)) : z.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(z),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                P['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var v = 0; v < this['player_cells']['length']; v++)
                                P['UIBase']['anim_alpha_in'](this['player_cells'][v]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * v, null, Laya.Ease['backOut']);
                            P['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                P['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    c['locking'] = !1;
                                });
                            var N = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != N && (this['room_link'].text += '(' + N + ')');
                            var V = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + V + '?room=' + this['room_id'];
                        },
                        G['prototype']['leaveRoom'] = function () {
                            var c = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (v, _) {
                                v || _['error'] ? P['UIMgr'].Inst['showNetReqError']('leaveRoom', v, _) : (c['room_id'] = -1, c.hide(Laya['Handler']['create'](c, function () {
                                    P['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        G['prototype']['tryToClose'] = function (c) {
                            var v = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (_, z) {
                                _ || z['error'] ? (P['UIMgr'].Inst['showNetReqError']('leaveRoom', _, z), c['runWith'](!1)) : (v['enable'] = !1, v['pop_change_view']['close'](!0), c['runWith'](!0));
                            });
                        },
                        G['prototype'].hide = function (c) {
                            var v = this;
                            this['locking'] = !0,
                                P['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var _ = 0; _ < this['player_cells']['length']; _++)
                                P['UIBase']['anim_alpha_out'](this['player_cells'][_]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            P['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                P['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        c && c.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        G['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var P = 0; P < this['player_cells']['length']; P++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][P]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        G['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        G['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (c, v) {
                                (c || v['error']) && P['UIMgr'].Inst['showNetReqError']('startRoom', c, v);
                            })));
                        },
                        G['prototype']['kickPlayer'] = function (c) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var v = this['players'][c];
                                1 == v['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][c]['account_id']
                                }, function () { }) : 2 == v['category'] && (this['pre_choose'] = v, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (c, v) {
                                    (c || v['error']) && P['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', c, v);
                                }));
                            }
                        },
                        G['prototype']['_clearCell'] = function (P) {
                            if (!(0 > P || P >= this['player_cells']['length'])) {
                                var c = this['player_cells'][P];
                                c['container_flag']['visible'] = !1,
                                    c['container_illust']['visible'] = !1,
                                    c.name['visible'] = !1,
                                    c['container_name']['visible'] = !1,
                                    c['btn_t']['visible'] = !1,
                                    c.host['visible'] = !1,
                                    c['illust']['clear']();
                            }
                        },
                        G['prototype']['_refreshPlayerInfo'] = function (P) {
                            var c = P['cell_index'];
                            if (!(0 > c || c >= this['player_cells']['length'])) {
                                var v = this['player_cells'][c];
                                v['container_illust']['visible'] = !0,
                                    v['container_name']['visible'] = !0,
                                    v.name['visible'] = !0,
                                    game['Tools']['SetNickname'](v.name, P, GameMgr.Inst['hide_nickname']),
                                    v['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && P['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == P['account_id'] && (v['container_flag']['visible'] = !0, v.host['visible'] = !0),
                                    P['account_id'] == GameMgr.Inst['account_id'] ? v['illust']['setSkin'](P['avatar_id'], 'waitingroom') : v['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](P['avatar_id']), 'waitingroom'),
                                    v['title'].id = game['Tools']['titleLocalization'](P['account_id'], P['title']),
                                    v.rank.id = P[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](P);
                            }
                        },
                        G['prototype']['_onPlayerReadyChange'] = function (P) {
                            var c = P['cell_index'];
                            if (!(0 > c || c >= this['player_cells']['length'])) {
                                var v = this['player_cells'][c];
                                v['container_flag']['visible'] = this['owner_id'] == P['account_id'] ? !0 : P['ready'];
                            }
                        },
                        G['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var P = 0, c = 0; c < this['players']['length']; c++)
                                    0 != this['players'][c]['category'] && (this['_refreshPlayerInfo'](this['players'][c]), P++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], P == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], P == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        G['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var P = 0, c = 0; c < this['players']['length']; c++) {
                                    var v = this['players'][c];
                                    if (!v || 0 == v['category'])
                                        break;
                                    (v['account_id'] == this['owner_id'] || v['ready']) && P++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], P != this['max_player_count']), this['enable']) {
                                    for (var _ = 0, c = 0; c < this['max_player_count']; c++) {
                                        var z = this['player_cells'][c];
                                        z && z['container_flag']['visible'] && _++;
                                    }
                                    if (P != _ && !this['posted']) {
                                        this['posted'] = !0;
                                        var G = {};
                                        G['okcount'] = P,
                                            G['okcount2'] = _,
                                            G.msgs = [];
                                        var u = 0,
                                            I = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (u = (this['msg_tail'] + 1) % this['pre_msgs']['length'], I = this['msg_tail']), u >= 0 && I >= 0) {
                                            for (var c = u; c != I; c = (c + 1) % this['pre_msgs']['length'])
                                                G.msgs.push(this['pre_msgs'][c]);
                                            G.msgs.push(this['pre_msgs'][I]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', G, !1);
                                    }
                                }
                            }
                        },
                        G['prototype']['onGameStart'] = function (P) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](P['connect_token'], P['game_uuid'], P['location'], !1, null);
                        },
                        G['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        G['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        G.Inst = null,
                        G;
                }
                    (P['UIBase']);
            P['UI_WaitingRoom'] = z;
        }
            (uiscript || (uiscript = {}));










        // 保存装扮
        !function (P) {
            var c;
            !function (c) {
                var v = function () {
                    function v(v, _, z) {
                        var G = this;
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
                            this['_locking'] = z,
                            this['container_zhuangban0'] = v,
                            this['container_zhuangban1'] = _;
                        var u = this['container_zhuangban0']['getChildByName']('tabs');
                        u['vScrollBarSkin'] = '';
                        for (var I = function (c) {
                            var v = u['getChildAt'](c);
                            i.tabs.push(v),
                                v['clickHandler'] = new Laya['Handler'](i, function () {
                                    G['locking'] || G['tab_index'] != c && (G['_changed'] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](G, function () {
                                        G['change_tab'](c);
                                    }), null) : G['change_tab'](c));
                                });
                        }, i = this, N = 0; N < u['numChildren']; N++)
                            I(N);
                        this['page_items'] = new c['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new c['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new c['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new c['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var c = [], v = 0; v < G['cell_titles']['length']; v++) {
                                    var _ = G['slot_ids'][v];
                                    if (G['slot_map'][_]) {
                                        var z = G['slot_map'][_];
                                        if (!(z['item_id'] && z['item_id'] != G['cell_default_item'][v] || z['item_id_list'] && 0 != z['item_id_list']['length']))
                                            continue;
                                        var u = [];
                                        if (z['item_id_list'])
                                            for (var I = 0, i = z['item_id_list']; I < i['length']; I++) {
                                                var N = i[I];
                                                N == G['cell_default_item'][v] ? u.push(0) : u.push(N);
                                            }
                                        c.push({
                                            slot: _,
                                            item_id: z['item_id'],
                                            type: z.type,
                                            item_id_list: u
                                        });
                                    }
                                }
                                G['btn_save']['mouseEnabled'] = !1;
                                var V = G['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: c,
                                //    save_index: V,
                                //    is_use: V == P['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (v, _) {
                                //    if (G['btn_save']['mouseEnabled'] = !0, v || _['error'])
                                //        P['UIMgr'].Inst['showNetReqError']('saveCommonViews', v, _);
                                //    else {
                                if (P['UI_Sushe']['commonViewList']['length'] < V)
                                    for (var z = P['UI_Sushe']['commonViewList']['length']; V >= z; z++)
                                        P['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = P.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = P.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (P['UI_Sushe']['commonViewList'][V] = c, P['UI_Sushe']['using_commonview_index'] == V && G['onChangeGameView'](), G['tab_index'] != V)
                                    return;
                                G['btn_save']['mouseEnabled'] = !0,
                                    G['_changed'] = !1,
                                    G['refresh_btn']();
                                //    }
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                G['btn_use']['mouseEnabled'] = !1;
                                var c = G['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: c
                                //}, function (v, _) {
                                //    G['btn_use']['mouseEnabled'] = !0,
                                //    v || _['error'] ? P['UIMgr'].Inst['showNetReqError']('useCommonView', v, _) : (
                                P['UI_Sushe']['using_commonview_index'] = c, G['refresh_btn'](), G['refresh_tab'](), G['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                G['onRandomBtnClick']();
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
                        v['prototype'].show = function (c) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                c ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (P['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), P['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](P['UI_Sushe']['using_commonview_index']);
                        },
                        v['prototype']['change_tab'] = function (c) {
                            if (this['tab_index'] = c, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < P['UI_Sushe']['commonViewList']['length'])
                                    for (var v = P['UI_Sushe']['commonViewList'][this['tab_index']], _ = 0; _ < v['length']; _++)
                                        this['slot_map'][v[_].slot] = {
                                            slot: v[_].slot,
                                            item_id: v[_]['item_id'],
                                            type: v[_].type,
                                            item_id_list: v[_]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        v['prototype']['refresh_tab'] = function () {
                            for (var c = 0; c < this.tabs['length']; c++) {
                                var v = this.tabs[c];
                                v['mouseEnabled'] = this['tab_index'] != c,
                                    v['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == c ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    v['getChildByName']('num')['color'] = this['tab_index'] == c ? '#2f1e19' : '#f2c797';
                                var _ = v['getChildByName']('choosed');
                                P['UI_Sushe']['using_commonview_index'] == c ? (_['visible'] = !0, _.x = this['tab_index'] == c ? -18 : -4) : _['visible'] = !1;
                            }
                        },
                        v['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = P['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = P['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        v['prototype']['onChangeSlotSelect'] = function (P) {
                            var c = this;
                            this['select_index'] = P,
                                this['random']['visible'] = !(6 == P || 10 == P);
                            var v = 0;
                            P >= 0 && P < this['cell_default_item']['length'] && (v = this['cell_default_item'][P]);
                            var _ = v,
                                z = this['slot_ids'][P],
                                G = !1,
                                u = [];
                            if (this['slot_map'][z]) {
                                var I = this['slot_map'][z];
                                u = I['item_id_list'],
                                    G = !!I.type,
                                    I['item_id'] && (_ = this['slot_map'][z]['item_id']),
                                    G && I['item_id_list'] && I['item_id_list']['length'] > 0 && (_ = I['item_id_list'][0]);
                            }
                            var i = Laya['Handler']['create'](this, function (_) {
                                if (_ == v && (_ = 0), c['is_random']) {
                                    var G = c['slot_map'][z]['item_id_list']['indexOf'](_);
                                    G >= 0 ? c['slot_map'][z]['item_id_list']['splice'](G, 1) : (c['slot_map'][z]['item_id_list'] && 0 != c['slot_map'][z]['item_id_list']['length'] || (c['slot_map'][z]['item_id_list'] = []), c['slot_map'][z]['item_id_list'].push(_));
                                } else
                                    c['slot_map'][z] || (c['slot_map'][z] = {}), c['slot_map'][z]['item_id'] = _;
                                c['scrollview']['wantToRefreshItem'](P),
                                    c['_changed'] = !0,
                                    c['refresh_btn']();
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = G,
                                this['random_slider'].x = G ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var N = game['Tools']['strOfLocalization'](this['cell_titles'][P]);
                            if (P >= 0 && 2 >= P)
                                this['page_items'].show(N, P, _, i), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == P)
                                this['page_items'].show(N, 10, _, i), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == P)
                                this['page_items'].show(N, 3, _, i), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == P)
                                this['page_bgm'].show(N, _, i), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == P)
                                this['page_headframe'].show(N, _, i);
                            else if (7 == P || 8 == P) {
                                var V = this['cell_default_item'][7],
                                    U = this['cell_default_item'][8];
                                if (7 == P) {
                                    if (V = _, this['slot_map'][game['EView'].mjp]) {
                                        var Y = this['slot_map'][game['EView'].mjp];
                                        Y.type && Y['item_id_list'] && Y['item_id_list']['length'] > 0 ? U = Y['item_id_list'][0] : Y['item_id'] && (U = Y['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](N, V, U, i);
                                } else {
                                    if (U = _, this['slot_map'][game['EView']['desktop']]) {
                                        var Y = this['slot_map'][game['EView']['desktop']];
                                        Y.type && Y['item_id_list'] && Y['item_id_list']['length'] > 0 ? V = Y['item_id_list'][0] : Y['item_id'] && (V = Y['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](N, V, U, i);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == P) {
                                var V = this['cell_default_item'][7],
                                    U = this['cell_default_item'][9];
                                if (U = _, this['slot_map'][game['EView']['desktop']]) {
                                    var Y = this['slot_map'][game['EView']['desktop']];
                                    Y.type && Y['item_id_list'] && Y['item_id_list']['length'] > 0 ? V = Y['item_id_list'][0] : Y['item_id'] && (V = Y['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](N, V, U, i),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == P && this['page_desktop']['show_lobby_bg'](N, _, i);
                        },
                        v['prototype']['onRandomBtnClick'] = function () {
                            var P = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        P['random']['getChildAt'](P['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var c = this['select_index'],
                                    v = this['slot_ids'][c],
                                    _ = 0;
                                c >= 0 && c < this['cell_default_item']['length'] && (_ = this['cell_default_item'][c]);
                                var z = _,
                                    G = [];
                                if (this['slot_map'][v]) {
                                    var u = this['slot_map'][v];
                                    G = u['item_id_list'],
                                        u['item_id'] && (z = this['slot_map'][v]['item_id']);
                                }
                                if (c >= 0 && 4 >= c) {
                                    var I = this['slot_map'][v];
                                    I ? (I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']])) : this['slot_map'][v] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](z);
                                } else if (5 == c) {
                                    var I = this['slot_map'][v];
                                    if (I)
                                        I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']]);
                                    else {
                                        this['slot_map'][v] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](z);
                                } else if (7 == c || 8 == c || 9 == c) {
                                    var I = this['slot_map'][v];
                                    I ? (I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']])) : this['slot_map'][v] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](z);
                                }
                                this['scrollview']['wantToRefreshItem'](c);
                            }
                        },
                        v['prototype']['render_view'] = function (P) {
                            var c = this,
                                v = P['container'],
                                _ = P['index'],
                                z = v['getChildByName']('cell');
                            this['select_index'] == _ ? (z['scaleX'] = z['scaleY'] = 1.05, z['getChildByName']('choosed')['visible'] = !0) : (z['scaleX'] = z['scaleY'] = 1, z['getChildByName']('choosed')['visible'] = !1),
                                z['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][_]);
                            var G = z['getChildByName']('name'),
                                u = z['getChildByName']('icon'),
                                I = this['cell_default_item'][_],
                                i = this['slot_ids'][_],
                                N = !1;
                            if (this['slot_map'][i] && (N = this['slot_map'][i].type, this['slot_map'][i]['item_id'] && (I = this['slot_map'][i]['item_id'])), N)
                                G.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][i]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](u, 'myres/sushe/icon_random.jpg');
                            else {
                                var V = cfg['item_definition'].item.get(I);
                                V ? (G.text = V['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](u, V.icon, null, 'UI_Sushe_Select.Zhuangban')) : (G.text = game['Tools']['strOfLocalization'](this['cell_names'][_]), game['LoadMgr']['setImgSkin'](u, this['cell_default_img'][_], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var U = z['getChildByName']('btn');
                            U['clickHandler'] = Laya['Handler']['create'](this, function () {
                                c['locking'] || c['select_index'] != _ && (c['onChangeSlotSelect'](_), c['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                U['mouseEnabled'] = this['select_index'] != _;
                        },
                        v['prototype']['close'] = function (c) {
                            var v = this;
                            this['container_zhuangban0']['visible'] && (c ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (P['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), P['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
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
                            MMP.settings.using_commonview_index = P.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            P['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var c = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            P['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](c, Laya['Handler']['create'](this, function () {
                                    P['UI_Lite_Loading'].Inst['enable'] && P['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        v['prototype']['setRandomGray'] = function (c) {
                            this['btn_random']['visible'] = !c,
                                this['random']['filters'] = c ? [new Laya['ColorFilter'](P['GRAY_FILTER'])] : [];
                        },
                        v['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        v['prototype']['changeSlotByItemId'] = function (P) {
                            var c = cfg['item_definition'].item.get(P);
                            if (c)
                                for (var v = 0; v < this['slot_ids']['length']; v++)
                                    if (this['slot_ids'][v] == c.type)
                                        return this['onChangeSlotSelect'](v), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        v;
                }
                    ();
                c['Container_Zhuangban'] = v;
            }
                (c = P['zhuangban'] || (P['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));










        // 设置称号
        !function (P) {
            var c = function (c) {
                function v() {
                    var P = c.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return P['_root'] = null,
                    P['_scrollview'] = null,
                    P['_blackmask'] = null,
                    P['_locking'] = !1,
                    P['_showindexs'] = [],
                    v.Inst = P,
                    P;
                }
                return __extends(v, c),
                v.Init = function () {
                    var c = this;
                                // 获取称号
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (v, _) {
                    //    if (v || _['error'])
                    //        P['UIMgr'].Inst['showNetReqError']('fetchTitleList', v, _);
                    //    else {
                            c['owned_title'] = [];
                    //        for (var z = 0; z < _['title_list']['length']; z++) {
                    //            var G = _['title_list'][z];
                                for (let title of cfg.item_definition.title.rows_) {
                                    var G = title.id;
                                cfg['item_definition']['title'].get(G) && c['owned_title'].push(G),
                                '600005' == G && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                G >= '600005' && '600015' >= G && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + G - '600005', 1);
                            }
                    //    }
                    //});
                },
                v['title_update'] = function (c) {
                    for (var v = 0; v < c['new_titles']['length']; v++)
                        cfg['item_definition']['title'].get(c['new_titles'][v]) && this['owned_title'].push(c['new_titles'][v]), '600005' == c['new_titles'][v] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), c['new_titles'][v] >= '600005' && c['new_titles'][v] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + c['new_titles'][v] - '600005', 1);
                    if (c['remove_titles'] && c['remove_titles']['length'] > 0) {
                        for (var v = 0; v < c['remove_titles']['length']; v++) {
                            for (var _ = c['remove_titles'][v], z = 0; z < this['owned_title']['length']; z++)
                                if (this['owned_title'][z] == _) {
                                    this['owned_title'][z] = this['owned_title'][this['owned_title']['length'] - 1],
                                    this['owned_title'].pop();
                                    break;
                                }
                            _ == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', P['UI_Lobby'].Inst['enable'] && P['UI_Lobby'].Inst.top['refresh'](), P['UI_PlayerInfo'].Inst['enable'] && P['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                        }
                        this.Inst['enable'] && this.Inst.show();
                    }
                },
                v['prototype']['onCreate'] = function () {
                    var c = this;
                    this['_root'] = this.me['getChildByName']('root'),
                    this['_blackmask'] = new P['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return c['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                    this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                    this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (P) {
                            c['setItemValue'](P['index'], P['container']);
                        }, null, !1)),
                    this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                        c['_locking'] || (c['_blackmask'].hide(), c['close']());
                    }, null, !1),
                    this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                },
                v['prototype'].show = function () {
                    var c = this;
                    if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), v['owned_title']['length'] > 0) {
                        this['_showindexs'] = [];
                        for (var _ = 0; _ < v['owned_title']['length']; _++)
                            this['_showindexs'].push(_);
                        this['_showindexs'] = this['_showindexs'].sort(function (P, c) {
                            var _ = P,
                            z = cfg['item_definition']['title'].get(v['owned_title'][P]);
                            z && (_ += 1000 * z['priority']);
                            var G = c,
                            u = cfg['item_definition']['title'].get(v['owned_title'][c]);
                            return u && (G += 1000 * u['priority']),
                            G - _;
                        }),
                        this['_scrollview']['reset'](),
                        this['_scrollview']['addItem'](v['owned_title']['length']),
                        this['_scrollview'].me['visible'] = !0,
                        this['_noinfo']['visible'] = !1;
                    } else
                        this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                    P['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            c['_locking'] = !1;
                        }));
                },
                v['prototype']['close'] = function () {
                    var c = this;
                    this['_locking'] = !0,
                    P['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                            c['_locking'] = !1,
                            c['enable'] = !1;
                        }));
                },
                v['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                },
                v['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                    this['_scrollview']['reset']();
                },
                v['prototype']['setItemValue'] = function (P, c) {
                    var _ = this;
                    if (this['enable']) {
                        var z = v['owned_title'][this['_showindexs'][P]],
                        G = cfg['item_definition']['title'].find(z);
                        game['LoadMgr']['setImgSkin'](c['getChildByName']('img_title'), G.icon, null, 'UI_TitleBook'),
                        c['getChildByName']('using')['visible'] = z == GameMgr.Inst['account_data']['title'],
                        c['getChildByName']('desc').text = G['desc_' + GameMgr['client_language']];
                        var u = c['getChildByName']('btn');
                        u['clickHandler'] = Laya['Handler']['create'](this, function () {
                            z != GameMgr.Inst['account_data']['title'] ? (_['changeTitle'](P), c['getChildByName']('using')['visible'] = !0) : (_['changeTitle'](-1), c['getChildByName']('using')['visible'] = !1);
                        }, null, !1);
                        var I = c['getChildByName']('time'),
                        i = c['getChildByName']('img_title');
                        if (1 == G['unlock_type']) {
                            var N = G['unlock_param'][0],
                            V = cfg['item_definition'].item.get(N);
                            I.text = game['Tools']['strOfLocalization'](3121) + V['expire_desc_' + GameMgr['client_language']],
                            I['visible'] = !0,
                            i.y = 0;
                        } else
                            I['visible'] = !1, i.y = 10;
                    }
                },
                v['prototype']['changeTitle'] = function (c) {
                    var _ = this,
                    z = GameMgr.Inst['account_data']['title'],
                    G = 0;
                    G = c >= 0 && c < this['_showindexs']['length'] ? v['owned_title'][this['_showindexs'][c]] : '600001',
                    GameMgr.Inst['account_data']['title'] = G;
                    for (var u = -1, I = 0; I < this['_showindexs']['length']; I++)
                        if (z == v['owned_title'][this['_showindexs'][I]]) {
                            u = I;
                            break;
                        }
                    P['UI_Lobby'].Inst['enable'] && P['UI_Lobby'].Inst.top['refresh'](),
                    P['UI_PlayerInfo'].Inst['enable'] && P['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                    -1 != u && this['_scrollview']['wantToRefreshItem'](u),
                                    // 屏蔽设置称号的网络请求并保存称号
                                    MMP.settings.title = I;
                                MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                    //    title: '600001' == G ? 0 : G
                    //}, function (v, G) {
                    //    (v || G['error']) && (P['UIMgr'].Inst['showNetReqError']('useTitle', v, G), GameMgr.Inst['account_data']['title'] = z, P['UI_Lobby'].Inst['enable'] && P['UI_Lobby'].Inst.top['refresh'](), P['UI_PlayerInfo'].Inst['enable'] && P['UI_PlayerInfo'].Inst['refreshBaseInfo'](), _['enable'] && (c >= 0 && c < _['_showindexs']['length'] && _['_scrollview']['wantToRefreshItem'](c), u >= 0 && u < _['_showindexs']['length'] && _['_scrollview']['wantToRefreshItem'](u)));
                    //});
                },
                v.Inst = null,
                v['owned_title'] = [],
                v;
            }
            (P['UIBase']);
            P['UI_TitleBook'] = c;
        }
        (uiscript || (uiscript = {}));
        








        // 友人房调整装扮
        !function (P) {
            var c;
            !function (c) {
                var v = function () {
                    function v(P) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = P,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new c['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return v['prototype'].show = function (c) {
                        var v = this;
                        this.me['visible'] = !0,
                            c ? this.me['alpha'] = 1 : P['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var _ = 0, z = P['UI_Sushe']['star_chars']; _ < z['length']; _++)
                            for (var G = z[_], u = 0; u < P['UI_Sushe']['characters']['length']; u++)
                                if (!P['UI_Sushe']['hidden_characters_map'][G] && P['UI_Sushe']['characters'][u]['charid'] == G) {
                                    this['chara_infos'].push({
                                        chara_id: P['UI_Sushe']['characters'][u]['charid'],
                                        skin_id: P['UI_Sushe']['characters'][u].skin,
                                        is_upgraded: P['UI_Sushe']['characters'][u]['is_upgraded']
                                    }),
                                        P['UI_Sushe']['main_character_id'] == P['UI_Sushe']['characters'][u]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var u = 0; u < P['UI_Sushe']['characters']['length']; u++)
                            P['UI_Sushe']['hidden_characters_map'][P['UI_Sushe']['characters'][u]['charid']] || -1 == P['UI_Sushe']['star_chars']['indexOf'](P['UI_Sushe']['characters'][u]['charid']) && (this['chara_infos'].push({
                                chara_id: P['UI_Sushe']['characters'][u]['charid'],
                                skin_id: P['UI_Sushe']['characters'][u].skin,
                                is_upgraded: P['UI_Sushe']['characters'][u]['is_upgraded']
                            }), P['UI_Sushe']['main_character_id'] == P['UI_Sushe']['characters'][u]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var I = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(I['chara_id'], I['skin_id'], Laya['Handler']['create'](this, function (P) {
                            v['choosed_skin_id'] = P,
                                I['skin_id'] = P,
                                v['scrollview']['wantToRefreshItem'](v['choosed_chara_index']);
                        }, null, !1));
                    },
                        v['prototype']['render_character_cell'] = function (c) {
                            var v = this,
                                _ = c['index'],
                                z = c['container'],
                                G = c['cache_data'];
                            G['index'] = _;
                            var u = this['chara_infos'][_];
                            G['inited'] || (G['inited'] = !0, G.skin = new P['UI_Character_Skin'](z['getChildByName']('btn')['getChildByName']('head')), G['bound'] = z['getChildByName']('btn')['getChildByName']('bound'));
                            var I = z['getChildByName']('btn');
                            I['getChildByName']('choose')['visible'] = _ == this['choosed_chara_index'],
                                G.skin['setSkin'](u['skin_id'], 'bighead'),
                                I['getChildByName']('using')['visible'] = _ == this['choosed_chara_index'];
                            var i = cfg['item_definition']['character'].find(u['chara_id']),
                                N = i['name_' + GameMgr['client_language'] + '2'] ? i['name_' + GameMgr['client_language'] + '2'] : i['name_' + GameMgr['client_language']],
                                V = I['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                V.text = N['replace']('-', '|')['replace'](/\./g, '·');
                                var U = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                V['leading'] = U.test(N) ? -15 : 0;
                            } else
                                V.text = N;
                            I['getChildByName']('star') && (I['getChildByName']('star')['visible'] = _ < this['star_char_count']);
                            var Y = cfg['item_definition']['character'].get(u['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? G['bound'].skin = Y.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (u['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (u['is_upgraded'] ? '2.png' : '.png')) : Y.ur ? (G['bound'].pos(-10, -2), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '6.png' : '5.png'))) : (G['bound'].pos(4, 20), G['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '4.png' : '3.png'))),
                                I['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (u['is_upgraded'] ? '2.png' : '.png')),
                                z['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (_ != v['choosed_chara_index']) {
                                        var P = v['choosed_chara_index'];
                                        v['choosed_chara_index'] = _,
                                            v['choosed_skin_id'] = u['skin_id'],
                                            v['page_skin'].show(u['chara_id'], u['skin_id'], Laya['Handler']['create'](v, function (P) {
                                                v['choosed_skin_id'] = P,
                                                    u['skin_id'] = P,
                                                    G.skin['setSkin'](P, 'bighead');
                                            }, null, !1)),
                                            v['scrollview']['wantToRefreshItem'](P),
                                            v['scrollview']['wantToRefreshItem'](_);
                                    }
                                });
                        },
                        v['prototype']['close'] = function (c) {
                            var v = this;
                            if (this.me['visible'])
                                if (c)
                                    this.me['visible'] = !1;
                                else {
                                    var _ = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //_['chara_id'] != P['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: _['chara_id']
                                    //    }, function () {}), 
                                    P['UI_Sushe']['main_character_id'] = _['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: _['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var z = 0; z < P['UI_Sushe']['characters']['length']; z++)
                                        if (P['UI_Sushe']['characters'][z]['charid'] == _['chara_id']) {
                                            P['UI_Sushe']['characters'][z].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        P['UI_Sushe']['onMainSkinChange'](),
                                        P['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            v.me['visible'] = !1;
                                        }));
                                }
                        },
                        v;
                }
                    ();
                c['Page_Waiting_Head'] = v;
            }
                (c = P['zhuangban'] || (P['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));










        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var P = GameMgr;
            var c = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (v, _) {
                if (v || _['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', v, _);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](_)),
                        P.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    _.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    _.account.title = GameMgr.Inst.account_data.title;
                    _.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        _.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var z in _['account']) {
                        if (P.Inst['account_data'][z] = _['account'][z], 'platform_diamond' == z)
                            for (var G = _['account'][z], u = 0; u < G['length']; u++)
                                c['account_numerical_resource'][G[u].id] = G[u]['count'];
                        if ('skin_ticket' == z && (P.Inst['account_numerical_resource']['100004'] = _['account'][z]), 'platform_skin_ticket' == z)
                            for (var G = _['account'][z], u = 0; u < G['length']; u++)
                                c['account_numerical_resource'][G[u].id] = G[u]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        _['account']['room_id'] && P.Inst['updateRoom'](),
                        '10102' === P.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === P.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }







        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (c, v, _) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': c,
                        'account_id': parseInt(v.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': c,
                            'account_id': parseInt(v.toString())
                        }));
                    }
                }));
            }
            var X = GameMgr;
            var z = this;
            return c = c.trim(),
                app.Log.log('checkPaiPu game_uuid:' + c + ' account_id:' + v['toString']() + ' paipu_config:' + _),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), P.Inst['onLoadStart']('paipu'), 2 & _ && (c = game['Tools']['DecodePaipuUUID'](c)), this['record_uuid'] = c, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: c,
                    client_version_string: this['getClientVersion']()
                }, function (G, u) {
                    if (G || u['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', G, u);
                        var I = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](I);
                        var i = function () {
                            return I += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, I)),
                                I >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, i), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, z, i),
                            z['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': E.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': E.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var N = u.head,
                            V = [null, null, null, null],
                            U = game['Tools']['strOfLocalization'](2003),
                            Y = N['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: c,
                            client_version_string: z['getClientVersion']()
                        }, function () { }),
                            Y['extendinfo'] && (U = game['Tools']['strOfLocalization'](2004)),
                            Y['detail_rule'] && Y['detail_rule']['ai_level'] && (1 === Y['detail_rule']['ai_level'] && (U = game['Tools']['strOfLocalization'](2003)), 2 === Y['detail_rule']['ai_level'] && (U = game['Tools']['strOfLocalization'](2004)));
                        var Z = !1;
                        N['end_time'] ? (z['record_end_time'] = N['end_time'], N['end_time'] > '1576112400' && (Z = !0)) : z['record_end_time'] = -1,
                            z['record_start_time'] = N['start_time'] ? N['start_time'] : -1;
                        for (var K = 0; K < N['accounts']['length']; K++) {
                            var e = N['accounts'][K];
                            if (e['character']) {
                                var A = e['character'],
                                    L = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (e.account_id == GameMgr.Inst.account_id) {
                                        e.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        e.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        e.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        e.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        e.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            e.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (e.avatar_id == 400101 || e.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            e.avatar_id = skin.id;
                                            e.character.charid = skin.character_id;
                                            e.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(e.account_id);
                                        if (server == 1) {
                                            e.nickname = '[CN]' + e.nickname;
                                        } else if (server == 2) {
                                            e.nickname = '[JP]' + e.nickname;
                                        } else if (server == 3) {
                                            e.nickname = '[EN]' + e.nickname;
                                        } else {
                                            e.nickname = '[??]' + e.nickname;
                                        }
                                    }
                                }
                                // END
                                if (Z) {
                                    var r = e['views'];
                                    if (r)
                                        for (var F = 0; F < r['length']; F++)
                                            L[r[F].slot] = r[F]['item_id'];
                                } else {
                                    var S = A['views'];
                                    if (S)
                                        for (var F = 0; F < S['length']; F++) {
                                            var O = S[F].slot,
                                                m = S[F]['item_id'],
                                                C = O - 1;
                                            L[C] = m;
                                        }
                                }
                                var o = [];
                                for (var B in L)
                                    o.push({
                                        slot: parseInt(B),
                                        item_id: L[B]
                                    });
                                e['views'] = o,
                                    V[e.seat] = e;
                            } else
                                e['character'] = {
                                    charid: e['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(e['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    e['avatar_id'] = e['character'].skin,
                                    e['views'] = [],
                                    V[e.seat] = e;
                        }
                        for (var f = game['GameUtility']['get_default_ai_skin'](), a = game['GameUtility']['get_default_ai_character'](), K = 0; K < V['length']; K++)
                            if (null == V[K]) {
                                V[K] = {
                                    nickname: U,
                                    avatar_id: f,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: a,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: f,
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
                                            V[K].avatar_id = skin.id;
                                            V[K].character.charid = skin.character_id;
                                            V[K].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        V[K].nickname = '[BOT]' + V[K].nickname;
                                    }
                                }
                                // END
                            }
                        var t = Laya['Handler']['create'](z, function (P) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](N['config'], V, Laya['Handler']['create'](z, function () {
                                    z['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = _,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](N['config'])), V, v, view['EMJMode']['paipu'], Laya['Handler']['create'](z, function () {
                                            uiscript['UI_Replay'].Inst['initData'](P),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, z, function () {
                                                    z['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, z, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, z, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](z, function (P) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * P);
                                }, null, !1));
                        }),
                            D = {};
                        if (D['record'] = N, u.data && u.data['length'])
                            D.game = net['MessageWrapper']['decodeMessage'](u.data), t['runWith'](D);
                        else {
                            var H = u['data_url'];
                            H['startsWith']('http') || (H = P['prefix_url'] + H),
                                game['LoadMgr']['httpload'](H, 'arraybuffer', !1, Laya['Handler']['create'](z, function (P) {
                                    if (P['success']) {
                                        var c = new Laya.Byte();
                                        c['writeArrayBuffer'](P.data);
                                        var v = net['MessageWrapper']['decodeMessage'](c['getUint8Array'](0, c['length']));
                                        D.game = v,
                                            t['runWith'](D);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + u['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), z['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }









        // 牌谱功能
        !function (P) {
            var c = function () {
                function c(P) {
                    var c = this;
                    this.me = P,
                        this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            c['locking'] || c.hide(null);
                        }),
                        this['title'] = this.me['getChildByName']('title'),
                        this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                        this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                        this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                        this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                        this.me['visible'] = !1,
                        this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            c['locking'] || c.hide(null);
                        }, null, !1),
                        this['container_hidename'] = this.me['getChildByName']('hidename'),
                        this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var v = this['container_hidename']['getChildByName']('w0'),
                        _ = this['container_hidename']['getChildByName']('w1');
                    _.x = v.x + v['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            c['sp_checkbox']['visible'] = !c['sp_checkbox']['visible'],
                                c['refresh_share_uuid']();
                        });
                }
                return c['prototype']['show_share'] = function (c) {
                    var v = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                        this['sp_checkbox']['visible'] = !1,
                        this['btn_confirm']['visible'] = !1,
                        this['input']['editable'] = !1,
                        this.uuid = c,
                        this['refresh_share_uuid'](),
                        this.me['visible'] = !0,
                        this['locking'] = !0,
                        this['container_hidename']['visible'] = !0,
                        this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                        P['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            v['locking'] = !1;
                        }));
                },
                    c['prototype']['refresh_share_uuid'] = function () {
                        var P = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            c = this.uuid,
                            v = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + v + '?paipu=' + game['Tools']['EncodePaipuUUID'](c) + '_a' + P + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + v + '?paipu=' + c + '_a' + P;
                    },
                    c['prototype']['show_check'] = function () {
                        var c = this;
                        return P['UI_PiPeiYuYue'].Inst['enable'] ? (P['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return c['input'].text ? (c.hide(Laya['Handler']['create'](c, function () {
                                var P = c['input'].text['split']('='),
                                    v = P[P['length'] - 1]['split']('_'),
                                    _ = 0;
                                v['length'] > 1 && (_ = 'a' == v[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(v[1]['substr'](1))) : parseInt(v[1]));
                                var z = 0;
                                if (v['length'] > 2) {
                                    var G = parseInt(v[2]);
                                    G && (z = G);
                                }
                                GameMgr.Inst['checkPaiPu'](v[0], _, z);
                            })), void 0) : (P['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, P['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            c['locking'] = !1;
                        })), void 0);
                    },
                    c['prototype'].hide = function (c) {
                        var v = this;
                        this['locking'] = !0,
                            P['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                v['locking'] = !1,
                                    v.me['visible'] = !1,
                                    c && c.run();
                            }));
                    },
                    c;
            }
                (),
                v = function () {
                    function c(P) {
                        var c = this;
                        this.me = P,
                            this['blackbg'] = P['getChildByName']('blackbg'),
                            this.root = P['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                c['locking'] || c['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                c['locking'] || (game['Tools']['calu_word_length'](c['input'].text) > 30 ? c['toolong']['visible'] = !0 : (c['close'](), G['addCollect'](c.uuid, c['start_time'], c['end_time'], c['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return c['prototype'].show = function (c, v, _) {
                        var z = this;
                        this.uuid = c,
                            this['start_time'] = v,
                            this['end_time'] = _,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            P['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                z['locking'] = !1;
                            }));
                    },
                        c['prototype']['close'] = function () {
                            var c = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                P['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    c['locking'] = !1,
                                        c.me['visible'] = !1;
                                }));
                        },
                        c;
                }
                    ();
            P['UI_Pop_CollectInput'] = v;
            var _;
            !function (P) {
                P[P.ALL = 0] = 'ALL',
                    P[P['FRIEND'] = 1] = 'FRIEND',
                    P[P.RANK = 2] = 'RANK',
                    P[P['MATCH'] = 4] = 'MATCH',
                    P[P['COLLECT'] = 100] = 'COLLECT';
            }
                (_ || (_ = {}));
            var z = function () {
                function c(P) {
                    this['uuid_list'] = [],
                        this.type = P,
                        this['reset']();
                }
                return c['prototype']['reset'] = function () {
                    this['count'] = 0,
                        this['true_count'] = 0,
                        this['have_more_paipu'] = !0,
                        this['uuid_list'] = [],
                        this['duringload'] = !1,
                        this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                    c['prototype']['loadList'] = function (c) {
                        var v = this;
                        if (void 0 === c && (c = 10), !this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == _['COLLECT']) {
                                for (var z = [], u = 0, I = 0; 10 > I; I++) {
                                    var i = this['count'] + I;
                                    if (i >= G['collect_lsts']['length'])
                                        break;
                                    u++;
                                    var N = G['collect_lsts'][i];
                                    G['record_map'][N] || z.push(N),
                                        this['uuid_list'].push(N);
                                }
                                z['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: z
                                }, function (c, _) {
                                    if (v['duringload'] = !1, G.Inst['onLoadStateChange'](v.type, !1), c || _['error'])
                                        P['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', c, _);
                                    else if (app.Log.log(JSON['stringify'](_)), _['record_list'] && _['record_list']['length'] == z['length']) {
                                        for (var I = 0; I < _['record_list']['length']; I++) {
                                            var i = _['record_list'][I].uuid;
                                            G['record_map'][i] || (G['record_map'][i] = _['record_list'][I]);
                                        }
                                        v['count'] += u,
                                            v['count'] >= G['collect_lsts']['length'] && (v['have_more_paipu'] = !1, G.Inst['onLoadOver'](v.type)),
                                            G.Inst['onLoadMoreLst'](v.type, u);
                                    } else
                                        v['have_more_paipu'] = !1, G.Inst['onLoadOver'](v.type);
                                }) : (this['duringload'] = !1, this['count'] += u, this['count'] >= G['collect_lsts']['length'] && (this['have_more_paipu'] = !1, G.Inst['onLoadOver'](this.type)), G.Inst['onLoadMoreLst'](this.type, u));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (c, z) {
                                    if (v['duringload'] = !1, G.Inst['onLoadStateChange'](v.type, !1), c || z['error'])
                                        P['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', c, z);
                                    else if (app.Log.log(JSON['stringify'](z)), z['record_list'] && z['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(z),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(z));
                                                }
                                            }));
                                            for (let record_list of z['record_list']) {
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
                                        for (var u = z['record_list'], I = 0, i = 0; i < u['length']; i++) {
                                            var N = u[i].uuid;
                                            if (v.type == _.RANK && u[i]['config'] && u[i]['config'].meta) {
                                                var V = u[i]['config'].meta;
                                                if (V) {
                                                    var U = cfg['desktop']['matchmode'].get(V['mode_id']);
                                                    if (U && 5 == U.room)
                                                        continue;
                                                }
                                            }
                                            I++,
                                                v['uuid_list'].push(N),
                                                G['record_map'][N] || (G['record_map'][N] = u[i]);
                                        }
                                        v['count'] += I,
                                            v['true_count'] += u['length'],
                                            G.Inst['onLoadMoreLst'](v.type, I),
                                            v['have_more_paipu'] = !0;
                                    } else
                                        v['have_more_paipu'] = !1, G.Inst['onLoadOver'](v.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                v['duringload'] && G.Inst['onLoadStateChange'](v.type, !0);
                            });
                        }
                    },
                    c['prototype']['removeAt'] = function (P) {
                        for (var c = 0; c < this['uuid_list']['length'] - 1; c++)
                            c >= P && (this['uuid_list'][c] = this['uuid_list'][c + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    c;
            }
                (),
                G = function (G) {
                    function u() {
                        var P = G.call(this, new ui['lobby']['paipuUI']()) || this;
                        return P.top = null,
                            P['container_scrollview'] = null,
                            P['scrollview'] = null,
                            P['loading'] = null,
                            P.tabs = [],
                            P['pop_otherpaipu'] = null,
                            P['pop_collectinput'] = null,
                            P['label_collect_count'] = null,
                            P['noinfo'] = null,
                            P['locking'] = !1,
                            P['current_type'] = _.ALL,
                            u.Inst = P,
                            P;
                    }
                    return __extends(u, G),
                        u.init = function () {
                            var P = this;
                            this['paipuLst'][_.ALL] = new z(_.ALL),
                                this['paipuLst'][_['FRIEND']] = new z(_['FRIEND']),
                                this['paipuLst'][_.RANK] = new z(_.RANK),
                                this['paipuLst'][_['MATCH']] = new z(_['MATCH']),
                                this['paipuLst'][_['COLLECT']] = new z(_['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (c, v) {
                                    if (c || v['error']);
                                    else {
                                        if (v['record_list']) {
                                            for (var _ = v['record_list'], z = 0; z < _['length']; z++) {
                                                var G = {
                                                    uuid: _[z].uuid,
                                                    time: _[z]['end_time'],
                                                    remarks: _[z]['remarks']
                                                };
                                                P['collect_lsts'].push(G.uuid),
                                                    P['collect_info'][G.uuid] = G;
                                            }
                                            P['collect_lsts'] = P['collect_lsts'].sort(function (c, v) {
                                                return P['collect_info'][v].time - P['collect_info'][c].time;
                                            });
                                        }
                                        v['record_collect_limit'] && (P['collect_limit'] = v['record_collect_limit']);
                                    }
                                });
                        },
                        u['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        u['reset'] = function () {
                            this['paipuLst'][_.ALL] && this['paipuLst'][_.ALL]['reset'](),
                                this['paipuLst'][_['FRIEND']] && this['paipuLst'][_['FRIEND']]['reset'](),
                                this['paipuLst'][_.RANK] && this['paipuLst'][_.RANK]['reset'](),
                                this['paipuLst'][_['MATCH']] && this['paipuLst'][_['MATCH']]['reset']();
                        },
                        u['addCollect'] = function (c, v, _, z) {
                            var G = this;
                            if (!this['collect_info'][c]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return P['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: c,
                                    remarks: z,
                                    start_time: v,
                                    end_time: _
                                }, function () { });
                                var I = {
                                    uuid: c,
                                    remarks: z,
                                    time: _
                                };
                                this['collect_info'][c] = I,
                                    this['collect_lsts'].push(c),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (P, c) {
                                        return G['collect_info'][c].time - G['collect_info'][P].time;
                                    }),
                                    P['UI_DesktopInfo'].Inst && P['UI_DesktopInfo'].Inst['enable'] && P['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    u.Inst && u.Inst['enable'] && u.Inst['onCollectChange'](c, -1);
                            }
                        },
                        u['removeCollect'] = function (c) {
                            var v = this;
                            if (this['collect_info'][c]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: c
                                }, function () { }),
                                    delete this['collect_info'][c];
                                for (var _ = -1, z = 0; z < this['collect_lsts']['length']; z++)
                                    if (this['collect_lsts'][z] == c) {
                                        this['collect_lsts'][z] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            _ = z;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (P, c) {
                                        return v['collect_info'][c].time - v['collect_info'][P].time;
                                    }),
                                    P['UI_DesktopInfo'].Inst && P['UI_DesktopInfo'].Inst['enable'] && P['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    u.Inst && u.Inst['enable'] && u.Inst['onCollectChange'](c, _);
                            }
                        },
                        u['prototype']['onCreate'] = function () {
                            var _ = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    _['locking'] || _['close'](Laya['Handler']['create'](_, function () {
                                        P['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (P) {
                                    _['setItemValue'](P['index'], P['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var P = u['paipuLst'][_['current_type']];
                                    (1 - _['scrollview'].rate) * P['count'] < 3 && (P['duringload'] || (P['have_more_paipu'] ? P['loadList']() : 0 == P['count'] && (_['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    _['pop_otherpaipu'].me['visible'] || _['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var z = 0; 5 > z; z++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](z)), this.tabs[z]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [z, !1]);
                            this['pop_otherpaipu'] = new c(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new v(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        u['prototype'].show = function () {
                            var c = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                P['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                P['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    c['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = u['collect_lsts']['length']['toString']() + '/' + u['collect_limit']['toString']();
                        },
                        u['prototype']['close'] = function (c) {
                            var v = this;
                            this['locking'] = !0,
                                P['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                P['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    v['locking'] = !1,
                                        v['enable'] = !1,
                                        c && c.run();
                                });
                        },
                        u['prototype']['changeTab'] = function (P, c) {
                            var v = [_.ALL, _.RANK, _['FRIEND'], _['MATCH'], _['COLLECT']];
                            if (c || v[P] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = v[P], this['current_type'] == _['COLLECT'] && u['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != _['COLLECT']) {
                                    var z = u['paipuLst'][this['current_type']]['count'];
                                    z > 0 && this['scrollview']['addItem'](z);
                                }
                                for (var G = 0; G < this.tabs['length']; G++) {
                                    var I = this.tabs[G];
                                    I['getChildByName']('img').skin = game['Tools']['localUISrc'](P == G ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        I['getChildByName']('label_name')['color'] = P == G ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        u['prototype']['setItemValue'] = function (c, v) {
                            var _ = this;
                            if (this['enable']) {
                                var z = u['paipuLst'][this['current_type']];
                                if (z || !(c >= z['uuid_list']['length'])) {
                                    for (var G = u['record_map'][z['uuid_list'][c]], I = 0; 4 > I; I++) {
                                        var i = v['getChildByName']('p' + I['toString']());
                                        if (I < G['result']['players']['length']) {
                                            i['visible'] = !0;
                                            var N = i['getChildByName']('chosen'),
                                                V = i['getChildByName']('rank'),
                                                U = i['getChildByName']('rank_word'),
                                                Y = i['getChildByName']('name'),
                                                Z = i['getChildByName']('score'),
                                                K = G['result']['players'][I];
                                            Z.text = K['part_point_1'] || '0';
                                            for (var e = 0, A = game['Tools']['strOfLocalization'](2133), L = 0, r = !1, F = 0; F < G['accounts']['length']; F++)
                                                if (G['accounts'][F].seat == K.seat) {
                                                    e = G['accounts'][F]['account_id'],
                                                        A = G['accounts'][F]['nickname'],
                                                        L = G['accounts'][F]['verified'],
                                                        r = G['accounts'][F]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](Y, {
                                                account_id: e,
                                                nickname: A,
                                                verified: L
                                            }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                                N['visible'] = r,
                                                Z['color'] = r ? '#ffc458' : '#b98930',
                                                Y['getChildByName']('name')['color'] = r ? '#dfdfdf' : '#a0a0a0',
                                                U['color'] = V['color'] = r ? '#57bbdf' : '#489dbc';
                                            var S = i['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (I) {
                                                    case 0:
                                                        S.text = 'st';
                                                        break;
                                                    case 1:
                                                        S.text = 'nd';
                                                        break;
                                                    case 2:
                                                        S.text = 'rd';
                                                        break;
                                                    case 3:
                                                        S.text = 'th';
                                                }
                                        } else
                                            i['visible'] = !1;
                                    }
                                    var O = new Date(1000 * G['end_time']),
                                        m = '';
                                    m += O['getFullYear']() + '/',
                                        m += (O['getMonth']() < 9 ? '0' : '') + (O['getMonth']() + 1)['toString']() + '/',
                                        m += (O['getDate']() < 10 ? '0' : '') + O['getDate']() + ' ',
                                        m += (O['getHours']() < 10 ? '0' : '') + O['getHours']() + ':',
                                        m += (O['getMinutes']() < 10 ? '0' : '') + O['getMinutes'](),
                                        v['getChildByName']('date').text = m,
                                        v['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return _['locking'] ? void 0 : P['UI_PiPeiYuYue'].Inst['enable'] ? (P['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](G.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        v['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            _['locking'] || _['pop_otherpaipu'].me['visible'] || (_['pop_otherpaipu']['show_share'](G.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var C = v['getChildByName']('room'),
                                        o = game['Tools']['get_room_desc'](G['config']);
                                    C.text = o.text;
                                    var B = '';
                                    if (1 == G['config']['category'])
                                        B = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == G['config']['category'])
                                        B = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == G['config']['category']) {
                                        var f = G['config'].meta;
                                        if (f) {
                                            var a = cfg['desktop']['matchmode'].get(f['mode_id']);
                                            a && (B = a['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (u['collect_info'][G.uuid]) {
                                        var t = u['collect_info'][G.uuid],
                                            D = v['getChildByName']('remarks_info'),
                                            H = v['getChildByName']('input'),
                                            l = H['getChildByName']('txtinput'),
                                            y = v['getChildByName']('btn_input'),
                                            w = !1,
                                            s = function () {
                                                w ? (D['visible'] = !1, H['visible'] = !0, l.text = D.text, y['visible'] = !1) : (D.text = t['remarks'] && '' != t['remarks'] ? game['Tools']['strWithoutForbidden'](t['remarks']) : B, D['visible'] = !0, H['visible'] = !1, y['visible'] = !0);
                                            };
                                        s(),
                                            y['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                w = !0,
                                                    s();
                                            }, null, !1),
                                            l.on('blur', this, function () {
                                                w && (game['Tools']['calu_word_length'](l.text) > 30 ? P['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : l.text != t['remarks'] && (t['remarks'] = l.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: G.uuid,
                                                    remarks: l.text
                                                }, function () { }))),
                                                    w = !1,
                                                    s();
                                            });
                                        var R = v['getChildByName']('collect');
                                        R['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](_, function () {
                                                u['removeCollect'](G.uuid);
                                            }));
                                        }, null, !1),
                                            R['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        v['getChildByName']('input')['visible'] = !1,
                                            v['getChildByName']('btn_input')['visible'] = !1,
                                            v['getChildByName']('remarks_info')['visible'] = !0,
                                            v['getChildByName']('remarks_info').text = B;
                                        var R = v['getChildByName']('collect');
                                        R['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            _['pop_collectinput'].show(G.uuid, G['start_time'], G['end_time']);
                                        }, null, !1),
                                            R['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        u['prototype']['onLoadStateChange'] = function (P, c) {
                            this['current_type'] == P && (this['loading']['visible'] = c);
                        },
                        u['prototype']['onLoadMoreLst'] = function (P, c) {
                            this['current_type'] == P && this['scrollview']['addItem'](c);
                        },
                        u['prototype']['getScrollViewCount'] = function () {
                            return this['scrollview']['value_count'];
                        },
                        u['prototype']['onLoadOver'] = function (P) {
                            if (this['current_type'] == P) {
                                var c = u['paipuLst'][this['current_type']];
                                0 == c['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        u['prototype']['onCollectChange'] = function (P, c) {
                            if (this['current_type'] == _['COLLECT'])
                                c >= 0 && (u['paipuLst'][_['COLLECT']]['removeAt'](c), this['scrollview']['delItem'](c));
                            else
                                for (var v = u['paipuLst'][this['current_type']]['uuid_list'], z = 0; z < v['length']; z++)
                                    if (v[z] == P) {
                                        this['scrollview']['wantToRefreshItem'](z);
                                        break;
                                    }
                            this['label_collect_count'].text = u['collect_lsts']['length']['toString']() + '/' + u['collect_limit']['toString']();
                        },
                        u['prototype']['refreshAll'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        u.Inst = null,
                        u['paipuLst'] = {},
                        u['collect_lsts'] = [],
                        u['record_map'] = {},
                        u['collect_info'] = {},
                        u['collect_limit'] = 20,
                        u;
                }
                    (P['UIBase']);
            P['UI_PaiPu'] = G;
        }
            (uiscript || (uiscript = {}));









        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var P = GameMgr;
            var c = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (P, v) {
                P || v['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', P, v) : c['server_time_delta'] = 1000 * v['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (P, v) {
                P || v['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', P, v) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](v)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, v['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](v['settings']), v['settings']['nickname_setting'] && (c['nickname_replace_enable'] = !!v['settings']['nickname_setting']['enable'], c['nickname_replace_lst'] = v['settings']['nickname_setting']['nicknames'], c['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = v['settings']['allow_modify_nickname']);
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (P, v) {
                P || v['error'] || (c['client_endpoint'] = v['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (P) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](P));
                var v = P['update'];
                if (v) {
                    if (v['numerical'])
                        for (var _ = 0; _ < v['numerical']['length']; _++) {
                            var z = v['numerical'][_].id,
                                G = v['numerical'][_]['final'];
                            switch (z) {
                                case '100001':
                                    c['account_data']['diamond'] = G;
                                    break;
                                case '100002':
                                    c['account_data'].gold = G;
                                    break;
                                case '100099':
                                    c['account_data'].vip = G,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (z >= '101001' || '102999' >= z) && (c['account_numerical_resource'][z] = G);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](v),
                        v['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](v['daily_task']),
                        v['title'] && uiscript['UI_TitleBook']['title_update'](v['title']),
                        v['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](v),
                        (v['activity_task'] || v['activity_period_task'] || v['activity_random_task'] || v['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](v),
                        v['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](v['activity_flip_task']['progresses']),
                        v['activity'] && (v['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](v['activity']['friend_gift_data']), v['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](v['activity']['upgrade_data']), v['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](v['activity']['gacha_data']), v['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](v['activity']['simulation_data']), v['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](v['activity']['spot_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (P) {
                app.Log.log('收到消息：' + JSON['stringify'](P)),
                    P.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](P['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (P) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    P['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](P['settings']), P['settings']['nickname_setting'] && (c['nickname_replace_enable'] = !!P['settings']['nickname_setting']['enable'], c['nickname_replace_lst'] = P['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = P['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (P) {
                uiscript['UI_Sushe']['send_gift_limit'] = P['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = P['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = P['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = P['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = P['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (P) {
                uiscript['UI_Guajichenfa'].Inst.show(P);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (P) {
                c['auth_check_id'] = P['check_id'],
                    c['auth_nc_retry_count'] = 0,
                    4 == P.type ? c['showNECaptcha']() : 2 == P.type ? c['checkNc']() : c['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    var P = (Laya['timer']['currTimer'] - c['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: P
                    }, function () { }),
                        P >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var P = Laya['stage']['getMousePoint']();
                (P.x != c['_pre_mouse_point'].x || P.y != c['_pre_mouse_point'].y) && (c['clientHeatBeat'](), c['_pre_mouse_point'].x = P.x, c['_pre_mouse_point'].y = P.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == P['client_type'] && Laya['timer'].loop(3600000, this, function () {
                c['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == P['client_language']) {
                var v = document['createElement']('link');
                v.rel = 'stylesheet',
                    v.href = 'font/notosansjapanese_1.css';
                var _ = document['getElementsByTagName']('head')[0];
                _['appendChild'](v);
            }
        }






        // 设置状态
        !function (P) {
            var c = function () {
                function P(c) {
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
                        P.Inst = this,
                        this.me = c,
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
                return Object['defineProperty'](P['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    P['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    P['prototype']['showCD'] = function (P, c) {
                        var v = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](P / 1000),
                            this._add = Math['floor'](c / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var P = Laya['timer']['currTimer'] - v['_pre_time'];
                                v['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? v['_start'] += P : v['_show']();
                            });
                    },
                    P['prototype']['close'] = function () {
                        this['reset']();
                    },
                    P['prototype']['_show'] = function () {
                        var P = this._fix + this._add - this['timeuse'];
                        if (0 >= P)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (P != this['_pre_sec']) {
                            if (this['_pre_sec'] = P, P > this._add) {
                                for (var c = (P - this._add)['toString'](), v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['visible'] = v < c['length'];
                                if (3 == c['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[2] + '.png')) : 2 == c['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + c[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var _ = this._add['toString'](), v = 0; v < this['_img_countdown_add']['length']; v++) {
                                        var z = this['_img_countdown_add'][v];
                                        v < _['length'] ? (z['visible'] = !0, z.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + _[v] + '.png')) : z['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var v = 0; v < this['_img_countdown_add']['length']; v++)
                                        this['_img_countdown_add'][v]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var c = P['toString'](), v = 0; v < this['_img_countdown_c0']['length']; v++)
                                    this['_img_countdown_c0'][v]['visible'] = v < c['length'];
                                3 == c['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[2] + '.png')) : 2 == c['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + c[0] + '.png');
                            }
                            if (P > 3) {
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
                                I.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    P.Inst = null,
                    P;
            }
                (),
                v = function () {
                    function P(P) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = P;
                    }
                    return P['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        P['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        P['prototype']['_loop_refresh_delay'] = function () {
                            var P = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var c = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var v = app['NetAgent']['mj_network_delay'];
                                    c = 300 > v ? 2000 : 800 > v ? 2500 + v : 4000 + 0.5 * v,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            P['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    c = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), c);
                            }
                        },
                        P['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var P = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > P ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > P ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        P;
                }
                    (),
                _ = function () {
                    function P(P, c) {
                        var v = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = c,
                            this.me = P,
                            this['btn_banemj'] = P['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = P['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = P['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['emj_banned'] = !v['emj_banned'], v['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (v['emj_banned'] ? '_on.png' : '.png')), v['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['close'](), I.Inst['btn_seeinfo'](v['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || (v['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](v['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                v['locking'] || v['switch']();
                            }, null, !1);
                    }
                    return P['prototype']['reset'] = function (P, c, v) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = P,
                            this['showemj'] = c,
                            this['showchange'] = v,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        P['prototype']['onChangeSeat'] = function (P, c, v) {
                            this['showinfo'] = P,
                                this['showemj'] = c,
                                this['showchange'] = v,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        P['prototype']['switch'] = function () {
                            var P = this;
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
                                P['locking'] = !1;
                            })));
                        },
                        P['prototype']['close'] = function () {
                            var P = this;
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
                                    P['locking'] = !1,
                                        P['btn_banemj']['visible'] = !1,
                                        P['btn_seeinfo']['visible'] = !1,
                                        P['btn_change']['visible'] = !1;
                                });
                        },
                        P;
                }
                    (),
                z = function () {
                    function P(P) {
                        var c = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = P,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                c['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                c['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function () {
                                c['scrollview']['total_height'] > 0 ? c['scrollbar']['setVal'](c['scrollview'].rate, c['scrollview']['view_height'] / c['scrollview']['total_height']) : c['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return P['prototype']['initRoom'] = function () {
                        // START 
                        //var P = view['DesktopMgr'].Inst['main_role_character_info'],
                        // END
                        var fake = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            c = cfg['item_definition']['character'].find(fake['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var v = 0; 9 > v; v++)
                            this.emos.push({
                                path: c.emo + '/' + v + '.png',
                                sub_id: v,
                                sort: v
                            });
                        if (fake['extra_emoji'])
                            for (var v = 0; v < fake['extra_emoji']['length']; v++)
                                this.emos.push({
                                    path: c.emo + '/' + P['extra_emoji'][v] + '.png',
                                    sub_id: fake['extra_emoji'][v],
                                    sort: fake['extra_emoji'][v] > 12 ? 1000000 - fake['extra_emoji'][v] : fake['extra_emoji'][v]
                                });
                        this.emos = this.emos.sort(function (P, c) {
                            return P.sort - c.sort;
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
                                char_id: fake['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        P['prototype']['render_item'] = function (P) {
                            var c = this,
                                v = P['index'],
                                _ = P['container'],
                                z = this.emos[v],
                                G = _['getChildByName']('btn');
                            G.skin = game['LoadMgr']['getResImageSkin'](z.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](G, !0) : (game['Tools']['setGrayDisable'](G, !1), G['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var P = !1, v = 0, _ = c['emo_infos']['emoji']; v < _['length']; v++) {
                                            var G = _[v];
                                            if (G[0] == z['sub_id']) {
                                                G[0]++,
                                                    P = !0;
                                                break;
                                            }
                                        }
                                        P || c['emo_infos']['emoji'].push([z['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: z['sub_id']
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    c['change_all_gray'](!0),
                                        Laya['timer'].once(5000, c, function () {
                                            c['change_all_gray'](!1);
                                        }),
                                        c['switchShow'](!1);
                                }, null, !1));
                        },
                        P['prototype']['change_all_gray'] = function (P) {
                            this['allgray'] = P,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        P['prototype']['switchShow'] = function (P) {
                            var c = this,
                                v = 0;
                            v = P ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, P ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    P ? (c.out['visible'] = !1, c.in['visible'] = !0) : (c.out['visible'] = !0, c.in['visible'] = !1),
                                        Laya['Tween'].to(c.me, {
                                            x: v
                                        }, P ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](c, function () {
                                            c['btn_chat']['disabled'] = !1,
                                                c['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        P['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var P = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: P,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: I.Inst['min_double_time'],
                            //        g: I.Inst['max_double_time']
                            //    }, !1),
                            //    this['emo_infos']['emoji'] = [];
                            // }
                            // this['emo_log_count']++;
                            // END
                        },
                        P['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        P;
                }
                    (),
                G = function () {
                    function c(c) {
                        this['effect'] = null,
                            this['container_emo'] = c['getChildByName']('chat_bubble'),
                            this.emo = new P['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = c['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return c['prototype'].show = function (P, c) {
                        var v = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var _ = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](P)]['character']['charid'], z = cfg['character']['emoji']['getGroup'](_), G = '', u = 0, I = 10 > c, i = 0; i < z['length']; i++)
                                if (z[i]['sub_id'] == c) {
                                    I = !0,
                                        2 == z[i].type && (G = z[i].view, u = z[i]['audio']);
                                    break;
                                }
                            I || (c = 0),
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                G ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + G + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    v['effect'] && (v['effect']['destory'](), v['effect'] = null);
                                }), u && view['AudioMgr']['PlayAudio'](u)) : (this.emo['setSkin'](_, c), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
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
                        c['prototype']['reset'] = function () {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        c;
                }
                    (),
                u = function () {
                    function P(P, c) {
                        if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = c, this.me = P, 0 == c) {
                            var v = P['getChildByName']('moqie');
                            this['moqie'] = v['getChildByName']('moqie'),
                                this['tip_moqie'] = v['getChildByName']('tip'),
                                this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                                this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                                this['points_moqie'] = [];
                            var _ = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                            this['points_moqie'].push(_);
                            for (var z = 0; 5 > z; z++) {
                                var G = _['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_moqie'].push(G);
                            }
                            var u = P['getChildByName']('shouqie');
                            this['shouqie'] = u['getChildByName']('shouqie'),
                                this['tip_shouqie'] = u['getChildByName']('tip'),
                                this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                                this['points_shouqie'] = [],
                                this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                                _ = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                                this['points_shouqie'].push(_);
                            for (var z = 0; 5 > z; z++) {
                                var G = _['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_shouqie'].push(G);
                            }
                            'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                        } else
                            this['moqie'] = P['getChildByName']('moqie'), this['shouqie'] = P['getChildByName']('shouqie');
                        this['star_moqie'] = this['moqie']['getChildByName']('star'),
                            this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                    }
                    return P['prototype'].show = function (P, c, v, _, z) {
                        var G = this;
                        if (this.me['visible'] = !0, c != this['_now_moqie_bonus']) {
                            if (this['_now_moqie_bonus'] = c, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + c + '.png'), z) {
                                var u = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                                u['parent']['setChildIndex'](u, 1),
                                    Laya['Tween']['clearAll'](this['moqie']),
                                    Laya['Tween'].to(this['moqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(G['moqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_moqie']['visible'] = c == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (_ != this['_now_shouqie_bonus']) {
                            if (this['_now_shouqie_bonus'] = _, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + _ + '.png'), z) {
                                var u = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                                u['parent']['setChildIndex'](u, 1),
                                    Laya['Tween']['clearAll'](this['shouqie']),
                                    Laya['Tween'].to(this['shouqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(G['shouqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_shouqie']['visible'] = _ == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (0 == this['index']) {
                            for (var I = this['_fan_counts']['indexOf'](c), i = this['_moqie_counts'][I + 1] - this['_moqie_counts'][I], N = P - this['_moqie_counts'][I], V = 0; V < this['points_moqie']['length']; V++) {
                                var U = this['points_moqie'][V];
                                if (i > V) {
                                    U['visible'] = !0;
                                    var Y = V / i * 2 * Math.PI;
                                    U.pos(27 * Math.sin(Y) + 27, 27 - 27 * Math.cos(Y)),
                                        U.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (N > V ? 'l.png' : 'd.png'));
                                } else
                                    U['visible'] = !1;
                            }
                            this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + P]),
                                this['circle_moqie']['visible'] = c != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                                I = this['_fan_counts']['indexOf'](_),
                                i = this['_shouqie_counts'][I + 1] - this['_shouqie_counts'][I],
                                N = v - this['_shouqie_counts'][I];
                            for (var V = 0; V < this['points_shouqie']['length']; V++) {
                                var U = this['points_shouqie'][V];
                                if (i > V) {
                                    U['visible'] = !0;
                                    var Y = V / i * 2 * Math.PI;
                                    U.pos(27 * Math.sin(Y) + 27, 27 - 27 * Math.cos(Y)),
                                        U.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (N > V ? 'l.png' : 'd.png'));
                                } else
                                    U['visible'] = !1;
                            }
                            this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + v]),
                                this['circle_shouqie']['visible'] = _ != this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                    },
                        P['prototype']['resetToStart'] = function () {
                            var P = this;
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
                                    P['_update']();
                                }),
                                this['_anim_start_time'] = Laya['timer']['currTimer'],
                                this['_update'](),
                                this['star_moqie']['visible'] = !1,
                                this['star_shouqie']['visible'] = !1,
                                0 == this['index'] && (this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['0']), this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['0']));
                        },
                        P['prototype'].hide = function () {
                            Laya['timer']['clearAll'](this),
                                this.me['visible'] = !1;
                        },
                        P['prototype']['_update'] = function () {
                            var P = (Laya['timer']['currTimer'] - this['_anim_start_time']) / 2000 % 1,
                                c = 1.4 * Math.abs(P - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](0)['scale'](c, c),
                                this['star_shouqie']['getChildAt'](0)['scale'](c, c),
                                P = (P + 0.4) % 1;
                            var v = 1.4 * Math.abs(P - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](1)['scale'](v, v),
                                this['star_shouqie']['getChildAt'](1)['scale'](v, v);
                        },
                        P;
                }
                    (),
                I = function (I) {
                    function i() {
                        var P = I.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return P['container_doras'] = null,
                            P['doras'] = [],
                            P['front_doras'] = [],
                            P['label_md5'] = null,
                            P['container_gamemode'] = null,
                            P['label_gamemode'] = null,
                            P['btn_auto_moqie'] = null,
                            P['btn_auto_nofulu'] = null,
                            P['btn_auto_hule'] = null,
                            P['img_zhenting'] = null,
                            P['btn_double_pass'] = null,
                            P['_network_delay'] = null,
                            P['_timecd'] = null,
                            P['_player_infos'] = [],
                            P['_container_fun'] = null,
                            P['_fun_in'] = null,
                            P['_fun_out'] = null,
                            P['showscoredeltaing'] = !1,
                            P['_btn_set'] = null,
                            P['_btn_leave'] = null,
                            P['_btn_fanzhong'] = null,
                            P['_btn_collect'] = null,
                            P['block_emo'] = null,
                            P['head_offset_y'] = 15,
                            P['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            P['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](P, function (c) {
                                P['onGameBroadcast'](c);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](P, function (c) {
                                P['onPlayerConnectionState'](c);
                            })),
                            i.Inst = P,
                            P;
                    }
                    return __extends(i, I),
                        i['prototype']['onCreate'] = function () {
                            var I = this;
                            this['doras'] = new Array(),
                                this['front_doras'] = [];
                            var i = this.me['getChildByName']('container_lefttop'),
                                N = i['getChildByName']('container_doras');
                            this['container_doras'] = N,
                                this['container_gamemode'] = i['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = i['getChildByName']('MD5'),
                                i['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (I['label_md5']['visible'])
                                        Laya['timer']['clearAll'](I['label_md5']), I['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? i['getChildByName']('activitymode')['visible'] = !0 : I['container_doras']['visible'] = !0;
                                    else {
                                        I['label_md5']['visible'] = !0,
                                            view['DesktopMgr'].Inst['sha256'] ? (I['label_md5']['fontSize'] = 20, I['label_md5'].y = 45, I['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (I['label_md5']['fontSize'] = 25, I['label_md5'].y = 51, I['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            i['getChildByName']('activitymode')['visible'] = !1,
                                            I['container_doras']['visible'] = !1;
                                        var P = I;
                                        Laya['timer'].once(5000, I['label_md5'], function () {
                                            P['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? i['getChildByName']('activitymode')['visible'] = !0 : I['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var V = 0; V < N['numChildren']; V++)
                                this['doras'].push(N['getChildAt'](V)), this['front_doras'].push(N['getChildAt'](V)['getChildAt'](0));
                            for (var V = 0; 4 > V; V++) {
                                var U = this.me['getChildByName']('container_player_' + V),
                                    Y = {};
                                Y['container'] = U,
                                    Y.head = new P['UI_Head'](U['getChildByName']('head'), ''),
                                    Y['head_origin_y'] = U['getChildByName']('head').y,
                                    Y.name = U['getChildByName']('container_name')['getChildByName']('name'),
                                    Y['container_shout'] = U['getChildByName']('container_shout'),
                                    Y['container_shout']['visible'] = !1,
                                    Y['illust'] = Y['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    Y['illustrect'] = P['UIRect']['CreateFromSprite'](Y['illust']),
                                    Y['shout_origin_x'] = Y['container_shout'].x,
                                    Y['shout_origin_y'] = Y['container_shout'].y,
                                    Y.emo = new G(U),
                                    Y['disconnect'] = U['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    Y['disconnect']['visible'] = !1,
                                    Y['title'] = new P['UI_PlayerTitle'](U['getChildByName']('title'), ''),
                                    Y.que = U['getChildByName']('que'),
                                    Y['que_target_pos'] = new Laya['Vector2'](Y.que.x, Y.que.y),
                                    Y['tianming'] = U['getChildByName']('tianming'),
                                    Y['tianming']['visible'] = !1,
                                    Y['yongchang'] = new u(U['getChildByName']('yongchang'), V),
                                    Y['yongchang'].hide(),
                                    0 == V ? (U['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        I['btn_seeinfo'](0);
                                    }, null, !1), U['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                        P['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                                    })) : Y['headbtn'] = new _(U['getChildByName']('btn_head'), V),
                                    this['_player_infos'].push(Y);
                            }
                            this['_timecd'] = new c(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new z(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var c = 0, v = 0; v < view['DesktopMgr'].Inst['player_datas']['length']; v++)
                                                view['DesktopMgr'].Inst['player_datas'][v]['account_id'] && c++;
                                            if (1 >= c)
                                                P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](I, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var P = 0, c = 0; c < view['DesktopMgr'].Inst['player_datas']['length']; c++) {
                                                            var v = view['DesktopMgr'].Inst['player_datas'][c];
                                                            v && null != v['account_id'] && 0 != v['account_id'] && P++;
                                                        }
                                                        1 == P ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var _ = !1;
                                                if (P['UI_VoteProgress']['vote_info']) {
                                                    var z = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - P['UI_VoteProgress']['vote_info']['start_time'] - P['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > z && (_ = !0);
                                                }
                                                _ ? P['UI_VoteProgress'].Inst['enable'] || P['UI_VoteProgress'].Inst.show() : P['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? P['UI_VoteCD'].Inst['enable'] || P['UI_VoteCD'].Inst.show() : P['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), P['UI_Ob_Replay'].Inst['resetRounds'](), P['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && P['UI_Desktop_Yindao'].Inst['close']();
                                }, null, !1),
                                this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                                this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    P['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    P['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (P['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? P['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](I, function () {
                                        P['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : P['UI_Replay'].Inst && P['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var Z = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var c = Laya['timer']['currTimer'];
                                    if (Z + 300 > c) {
                                        if (P['UI_ChiPengHu'].Inst['enable'])
                                            P['UI_ChiPengHu'].Inst['onDoubleClick'](), I['recordDoubleClickTime'](c - Z);
                                        else {
                                            var v = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            P['UI_LiQiZiMo'].Inst['enable'] && (v = P['UI_LiQiZiMo'].Inst['onDoubleClick'](v)),
                                                v && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && I['recordDoubleClickTime'](c - Z);
                                        }
                                        Z = 0;
                                    } else
                                        Z = c;
                                }
                            }, null, !1),
                                this['_network_delay'] = new v(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (i['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        i['prototype']['recordDoubleClickTime'] = function (P) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(P, this['min_double_time'])) : P,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(P, this['max_double_time']) : P;
                        },
                        i['prototype']['onGameBroadcast'] = function (P) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](P));
                            var c = view['DesktopMgr'].Inst['seat2LocalPosition'](P.seat),
                                v = JSON['parse'](P['content']);
                            null != v.emo && void 0 != v.emo && (this['onShowEmo'](c, v.emo), this['showAIEmo']());
                        },
                        i['prototype']['onPlayerConnectionState'] = function (P) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](P));
                            var c = P.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && c < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][c] = P['state']), this['enable']) {
                                var v = view['DesktopMgr'].Inst['seat2LocalPosition'](c);
                                this['_player_infos'][v]['disconnect']['visible'] = P['state'] != view['ELink_State']['READY'];
                            }
                        },
                        i['prototype']['_initFunc'] = function () {
                            var P = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var c = this['_fun_out']['getChildByName']('btn_func'),
                                v = this['_fun_out']['getChildByName']('btn_func2'),
                                _ = this['_fun_in_spr']['getChildByName']('btn_func');
                            c['clickHandler'] = v['clickHandler'] = new Laya['Handler'](this, function () {
                                var z = 0;
                                z = -270,
                                    Laya['Tween'].to(P['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](P, function () {
                                        P['_fun_in']['visible'] = !0,
                                            P['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(P['_container_fun'], {
                                                x: z
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](P, function () {
                                                c['disabled'] = !1,
                                                    v['disabled'] = !1,
                                                    _['disabled'] = !1,
                                                    P['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    c['disabled'] = !0,
                                    v['disabled'] = !0,
                                    _['disabled'] = !0;
                            }, null, !1),
                                _['clickHandler'] = new Laya['Handler'](this, function () {
                                    var z = -546;
                                    Laya['Tween'].to(P['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](P, function () {
                                        P['_fun_in']['visible'] = !1,
                                            P['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(P['_container_fun'], {
                                                x: z
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](P, function () {
                                                c['disabled'] = !1,
                                                    v['disabled'] = !1,
                                                    _['disabled'] = !1,
                                                    P['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        c['disabled'] = !0,
                                        v['disabled'] = !0,
                                        _['disabled'] = !0;
                                });
                            var z = this['_fun_in']['getChildByName']('btn_autolipai'),
                                G = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                u = this['_fun_out']['getChildByName']('autolipai'),
                                I = Laya['LocalStorage']['getItem']('autolipai'),
                                i = !0;
                            i = I && '' != I ? 'true' == I : !0,
                                this['refreshFuncBtnShow'](z, u, i),
                                z['clickHandler'] = G['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        P['refreshFuncBtnShow'](z, u, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var N = this['_fun_in']['getChildByName']('btn_autohu'),
                                V = this['_fun_out']['getChildByName']('btn_autohu2'),
                                U = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](N, U, !1),
                                N['clickHandler'] = V['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        P['refreshFuncBtnShow'](N, U, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var Y = this['_fun_in']['getChildByName']('btn_autonoming'),
                                Z = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                K = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](Y, K, !1),
                                Y['clickHandler'] = Z['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        P['refreshFuncBtnShow'](Y, K, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var e = this['_fun_in']['getChildByName']('btn_automoqie'),
                                A = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                L = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](e, L, !1),
                                e['clickHandler'] = A['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        P['refreshFuncBtnShow'](e, L, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (u['scale'](0.9, 0.9), U['scale'](0.9, 0.9), K['scale'](0.9, 0.9), L['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (c['visible'] = !1, V['visible'] = !0, G['visible'] = !0, Z['visible'] = !0, A['visible'] = !0) : (c['visible'] = !0, V['visible'] = !1, G['visible'] = !1, Z['visible'] = !1, A['visible'] = !1);
                        },
                        i['prototype']['noAutoLipai'] = function () {
                            var P = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                P['clickHandler'].run();
                        },
                        i['prototype']['resetFunc'] = function () {
                            var P = Laya['LocalStorage']['getItem']('autolipai'),
                                c = !0;
                            c = P && '' != P ? 'true' == P : !0;
                            var v = this['_fun_in']['getChildByName']('btn_autolipai'),
                                _ = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](v, _, c),
                                Laya['LocalStorage']['setItem']('autolipai', c ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](c);
                            var z = this['_fun_in']['getChildByName']('btn_autohu'),
                                G = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](z, G, view['DesktopMgr'].Inst['auto_hule']);
                            var u = this['_fun_in']['getChildByName']('btn_autonoming'),
                                I = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](u, I, view['DesktopMgr'].Inst['auto_nofulu']);
                            var i = this['_fun_in']['getChildByName']('btn_automoqie'),
                                N = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](i, N, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var V = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            V['disabled'] = !1,
                                V['disabled'] = !1;
                        },
                        i['prototype']['setDora'] = function (P, c) {
                            if (0 > P || P >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var v = 'myres2/mjpm/' + (c['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                            this['doras'][P].skin = game['Tools']['localUISrc'](v + c['toString'](!1) + '.png'),
                                this['front_doras'][P]['visible'] = !c['touming'],
                                this['front_doras'][P].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                        },
                        i['prototype']['initRoom'] = function () {
                            var c = this;
                            if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var v = {}, _ = 0; _ < view['DesktopMgr'].Inst['player_datas']['length']; _++) {
                                    for (var z = view['DesktopMgr'].Inst['player_datas'][_]['character'], G = z['charid'], u = cfg['item_definition']['character'].find(G).emo, I = 0; 9 > I; I++) {
                                        var i = u + '/' + I['toString']() + '.png';
                                        v[i] = 1;
                                    }
                                    if (z['extra_emoji'])
                                        for (var I = 0; I < z['extra_emoji']['length']; I++) {
                                            var i = u + '/' + z['extra_emoji'][I]['toString']() + '.png';
                                            v[i] = 1;
                                        }
                                }
                                var N = [];
                                for (var V in v)
                                    N.push(V);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](N, Laya['Handler']['create'](this, function () {
                                        c['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                                this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                            else {
                                for (var U = !1, _ = 0; _ < view['DesktopMgr'].Inst['player_datas']['length']; _++) {
                                    var Y = view['DesktopMgr'].Inst['player_datas'][_];
                                    if (Y && null != Y['account_id'] && Y['account_id'] == GameMgr.Inst['account_id']) {
                                        U = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (P['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = U;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var Z = 0, _ = 0; _ < view['DesktopMgr'].Inst['player_datas']['length']; _++) {
                                    var Y = view['DesktopMgr'].Inst['player_datas'][_];
                                    Y && null != Y['account_id'] && 0 != Y['account_id'] && Z++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var K = 0, _ = 0; _ < view['DesktopMgr'].Inst['player_datas']['length']; _++) {
                                var Y = view['DesktopMgr'].Inst['player_datas'][_];
                                Y && null != Y['account_id'] && 0 != Y['account_id'] && K++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var e = this.me['getChildByName']('container_lefttop');
                            if (e['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                                e['getChildByName']('num_lizhi_0')['visible'] = !1, e['getChildByName']('num_lizhi_1')['visible'] = !1, e['getChildByName']('num_ben_0')['visible'] = !1, e['getChildByName']('num_ben_1')['visible'] = !1, e['getChildByName']('container_doras')['visible'] = !1, e['getChildByName']('gamemode')['visible'] = !1, e['getChildByName']('activitymode')['visible'] = !0, e['getChildByName']('MD5').y = 63, e['getChildByName']('MD5')['width'] = 239, e['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), e['getChildAt'](0)['width'] = 280, e['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (e['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, e['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (e['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), e['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), e['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, e['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (e['getChildByName']('num_lizhi_0')['visible'] = !0, e['getChildByName']('num_lizhi_1')['visible'] = !1, e['getChildByName']('num_ben_0')['visible'] = !0, e['getChildByName']('num_ben_1')['visible'] = !0, e['getChildByName']('container_doras')['visible'] = !0, e['getChildByName']('gamemode')['visible'] = !0, e['getChildByName']('activitymode')['visible'] = !1, e['getChildByName']('MD5').y = 51, e['getChildByName']('MD5')['width'] = 276, e['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), e['getChildAt'](0)['width'] = 313, e['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var A = view['DesktopMgr'].Inst['game_config'],
                                    L = game['Tools']['get_room_desc'](A);
                                this['label_gamemode'].text = L.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = P['UI_Activity_JJC']['win_count']['toString']();
                                    for (var _ = 0; 3 > _; _++)
                                        this['container_jjc']['getChildByName'](_['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (P['UI_Activity_JJC']['lose_count'] > _ ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            P['UI_Replay'].Inst && (P['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var r = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                F = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (P['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](r, !0), game['Tools']['setGrayDisable'](F, !0)) : (game['Tools']['setGrayDisable'](r, !1), game['Tools']['setGrayDisable'](F, !1), P['UI_Astrology'].Inst.hide());
                            for (var _ = 0; 4 > _; _++)
                                this['_player_infos'][_]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][_]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][_]['yongchang'].hide();
                        },
                        i['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                        },
                        i['prototype']['refreshSeat'] = function (P) {
                            void 0 === P && (P = !1);
                            for (var c = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), v = 0; 4 > v; v++) {
                                var _ = view['DesktopMgr'].Inst['localPosition2Seat'](v),
                                    z = this['_player_infos'][v];
                                if (0 > _)
                                    z['container']['visible'] = !1;
                                else {
                                    z['container']['visible'] = !0;
                                    var G = view['DesktopMgr'].Inst['getPlayerName'](_);
                                    game['Tools']['SetNickname'](z.name, G, !1, !0),
                                        z.head.id = c[_]['avatar_id'],
                                        z.head['set_head_frame'](c[_]['account_id'], c[_]['avatar_frame']);
                                    var u = (cfg['item_definition'].item.get(c[_]['avatar_frame']), cfg['item_definition'].view.get(c[_]['avatar_frame']));
                                    if (z.head.me.y = u && u['sargs'][0] ? z['head_origin_y'] - Number(u['sargs'][0]) / 100 * this['head_offset_y'] : z['head_origin_y'], z['avatar'] = c[_]['avatar_id'], 0 != v) {
                                        var I = c[_]['account_id'] && 0 != c[_]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                            i = c[_]['account_id'] && 0 != c[_]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            N = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                        P ? z['headbtn']['onChangeSeat'](I, i, N) : z['headbtn']['reset'](I, i, N);
                                    }
                                    z['title'].id = c[_]['title'] ? game['Tools']['titleLocalization'](c[_]['account_id'], c[_]['title']) : 0;
                                }
                            }
                        },
                        i['prototype']['refreshNames'] = function () {
                            for (var P = 0; 4 > P; P++) {
                                var c = view['DesktopMgr'].Inst['localPosition2Seat'](P),
                                    v = this['_player_infos'][P];
                                if (0 > c)
                                    v['container']['visible'] = !1;
                                else {
                                    v['container']['visible'] = !0;
                                    var _ = view['DesktopMgr'].Inst['getPlayerName'](c);
                                    game['Tools']['SetNickname'](v.name, _, !1, !0);
                                }
                            }
                        },
                        i['prototype']['refreshLinks'] = function () {
                            for (var P = (view['DesktopMgr'].Inst.seat, 0); 4 > P; P++) {
                                var c = view['DesktopMgr'].Inst['localPosition2Seat'](P);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][P]['disconnect']['visible'] = -1 == c || 0 == P ? !1 : view['DesktopMgr']['player_link_state'][c] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][P]['disconnect']['visible'] = -1 == c || 0 == view['DesktopMgr'].Inst['player_datas'][c]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][c] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][P]['disconnect']['visible'] = !1);
                            }
                        },
                        i['prototype']['setBen'] = function (P) {
                            P > 99 && (P = 99);
                            var c = this.me['getChildByName']('container_lefttop'),
                                v = c['getChildByName']('num_ben_0'),
                                _ = c['getChildByName']('num_ben_1');
                            P >= 10 ? (v.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](P / 10)['toString']() + '.png'), _.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (P % 10)['toString']() + '.png'), _['visible'] = !0) : (v.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (P % 10)['toString']() + '.png'), _['visible'] = !1);
                        },
                        i['prototype']['setLiqibang'] = function (P, c) {
                            void 0 === c && (c = !0),
                                P > 999 && (P = 999);
                            var v = this.me['getChildByName']('container_lefttop'),
                                _ = v['getChildByName']('num_lizhi_0'),
                                z = v['getChildByName']('num_lizhi_1'),
                                G = v['getChildByName']('num_lizhi_2');
                            P >= 100 ? (G.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (P % 10)['toString']() + '.png'), z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](P / 10) % 10)['toString']() + '.png'), _.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](P / 100)['toString']() + '.png'), z['visible'] = !0, G['visible'] = !0) : P >= 10 ? (z.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (P % 10)['toString']() + '.png'), _.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](P / 10)['toString']() + '.png'), z['visible'] = !0, G['visible'] = !1) : (_.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + P['toString']() + '.png'), z['visible'] = !1, G['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](P, c);
                        },
                        i['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var P = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, c = 0; c < this['doras']['length']; c++)
                                if (this['front_doras'][c].skin = '', this['doras'][c].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                    this['front_doras'][c]['visible'] = !1, this['doras'][c].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                else {
                                    var v = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                    this['front_doras'][c]['visible'] = !0,
                                        this['doras'][c].skin = game['Tools']['localUISrc'](v + '5z.png'),
                                        this['front_doras'][c].skin = game['Tools']['localUISrc'](P + 'back.png');
                                }
                            for (var c = 0; 4 > c; c++)
                                this['_player_infos'][c].emo['reset'](), this['_player_infos'][c].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        i['prototype']['showCountDown'] = function (P, c) {
                            this['_timecd']['showCD'](P, c);
                        },
                        i['prototype']['setZhenting'] = function (P) {
                            this['img_zhenting']['visible'] = P;
                        },
                        i['prototype']['shout'] = function (P, c, v, _) {
                            app.Log.log('shout:' + P + ' type:' + c);
                            try {
                                var z = this['_player_infos'][P],
                                    G = z['container_shout'],
                                    u = G['getChildByName']('img_content'),
                                    I = G['getChildByName']('illust')['getChildByName']('illust'),
                                    i = G['getChildByName']('img_score');
                                if (0 == _)
                                    i['visible'] = !1;
                                else {
                                    i['visible'] = !0;
                                    var N = 0 > _ ? 'm' + Math.abs(_) : _;
                                    i.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + N + '.png');
                                }
                                '' == c ? u['visible'] = !1 : (u['visible'] = !0, u.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + c + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (G['getChildByName']('illust')['visible'] = !1, G['getChildAt'](2)['visible'] = !0, G['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](G['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (G['getChildByName']('illust')['visible'] = !0, G['getChildAt'](2)['visible'] = !1, G['getChildAt'](0)['visible'] = !0, I['scaleX'] = 1, game['Tools']['charaPart'](v['avatar_id'], I, 'full', z['illustrect'], !0, !0));
                                var V = 0,
                                    U = 0;
                                switch (P) {
                                    case 0:
                                        V = -105,
                                            U = 0;
                                        break;
                                    case 1:
                                        V = 500,
                                            U = 0;
                                        break;
                                    case 2:
                                        V = 0,
                                            U = -300;
                                        break;
                                    default:
                                        V = -500,
                                            U = 0;
                                }
                                G['visible'] = !0,
                                    G['alpha'] = 0,
                                    G.x = z['shout_origin_x'] + V,
                                    G.y = z['shout_origin_y'] + U,
                                    Laya['Tween'].to(G, {
                                        alpha: 1,
                                        x: z['shout_origin_x'],
                                        y: z['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(G, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](I.skin),
                                            G['visible'] = !1;
                                    });
                            } catch (Y) {
                                var Z = {};
                                Z['error'] = Y['message'],
                                    Z['stack'] = Y['stack'],
                                    Z['method'] = 'shout',
                                    Z['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](Z);
                            }
                        },
                        i['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        i['prototype']['refreshFuncBtnShow'] = function (P, c, v) {
                            var _ = P['getChildByName']('img_choosed');
                            c['color'] = P['mouseEnabled'] ? v ? '#3bd647' : '#7992b3' : '#565656',
                                _['visible'] = v;
                        },
                        i['prototype']['onShowEmo'] = function (P, c) {
                            var v = this['_player_infos'][P];
                            0 != P && v['headbtn']['emj_banned'] || v.emo.show(P, c);
                        },
                        i['prototype']['changeHeadEmo'] = function (P) {
                            {
                                var c = view['DesktopMgr'].Inst['seat2LocalPosition'](P);
                                this['_player_infos'][c];
                            }
                        },
                        i['prototype']['onBtnShowScoreDelta'] = function () {
                            var P = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                P['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        i['prototype']['btn_seeinfo'] = function (c) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                                var v = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](c)]['account_id'];
                                if (v) {
                                    var _ = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        z = 1,
                                        G = view['DesktopMgr'].Inst['game_config'].meta;
                                    G && G['mode_id'] == game['EMatchMode']['shilian'] && (z = 4);
                                    var u = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](c));
                                    P['UI_OtherPlayerInfo'].Inst.show(v, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, _ ? 1 : 2, z, u['nickname']);
                                }
                            }
                        },
                        i['prototype']['openDora3BeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openDora3BeginShine'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openShilianOpenBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openChuanmaBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openJiuChaoBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openAnPaiBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openZhanxingBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openTianmingBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['openYongchangBeginEffect'] = function () {
                            var P = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, P, function () {
                                    P['destory']();
                                });
                        },
                        i['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        i['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (P['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        i['prototype']['showAIEmo'] = function () {
                            for (var P = this, c = function (c) {
                                var _ = view['DesktopMgr'].Inst['player_datas'][c];
                                _['account_id'] && 0 != _['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), v, function () {
                                    P['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](c), Math['floor'](9 * Math['random']()));
                                });
                            }, v = this, _ = 0; _ < view['DesktopMgr'].Inst['player_datas']['length']; _++)
                                c(_);
                        },
                        i['prototype']['setGapType'] = function (P, c) {
                            void 0 === c && (c = !1);
                            for (var v = 0; v < P['length']; v++) {
                                var _ = view['DesktopMgr'].Inst['seat2LocalPosition'](v);
                                this['_player_infos'][_].que['visible'] = !0,
                                    c && (0 == v ? (this['_player_infos'][_].que.pos(this['gapStartPosLst'][v].x + this['selfGapOffsetX'][P[v]], this['gapStartPosLst'][v].y), this['_player_infos'][_].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][_].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][_]['que_target_pos'].x,
                                        y: this['_player_infos'][_]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][_].que.pos(this['gapStartPosLst'][v].x, this['gapStartPosLst'][v].y), this['_player_infos'][_].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][_].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][_]['que_target_pos'].x,
                                        y: this['_player_infos'][_]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][_].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + P[v] + '.png');
                            }
                        },
                        i['prototype']['OnNewCard'] = function (P, c) {
                            if (c) {
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
                        i['prototype']['ShowSpellCard'] = function (c, v) {
                            void 0 === v && (v = !1),
                                P['UI_FieldSpell'].Inst && !P['UI_FieldSpell'].Inst['enable'] && P['UI_FieldSpell'].Inst.show(c, v);
                        },
                        i['prototype']['HideSpellCard'] = function () {
                            P['UI_FieldSpell'].Inst && P['UI_FieldSpell'].Inst['close']();
                        },
                        i['prototype']['SetTianMingRate'] = function (P, c, v) {
                            void 0 === v && (v = !1);
                            var _ = view['DesktopMgr'].Inst['seat2LocalPosition'](P),
                                z = this['_player_infos'][_]['tianming'];
                            v && 5 != c && z.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + c + '.png') && Laya['Tween'].to(z, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(z, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                z.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + c + '.png');
                        },
                        i['prototype']['ResetYongChang'] = function () {
                            for (var P = 0; 4 > P; P++)
                                this['_player_infos'][P]['yongchang']['resetToStart']();
                        },
                        i['prototype']['SetYongChangRate'] = function (P, c, v, _, z, G) {
                            this['_player_infos'][P]['yongchang'].show(c, v, _, z, G);
                        },
                        i.Inst = null,
                        i;
                }
                    (P['UIBase']);
            P['UI_DesktopInfo'] = I;
        }
            (uiscript || (uiscript = {}));







        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var c = this;
            this['read_list'] = [];
            var v = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                lang: v,
                platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
            }, function (v, _) {
                v || _['error'] ? P['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', v, _) : c['_refreshAnnouncements'](_);
                // START
                if ((v || _['error']) === null) {
                    if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                        uiscript.UI_Info.Inst.show();
                        MMP.settings.isReadme = true;
                        MMP.settings.version = GM_info['script']['version'];
                        MMP.saveSettings();
                    }
                }
                // END
            }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (P) {
                    for (var _ = GameMgr['inDmm'] ? 'web_dmm' : 'web', z = 0, G = P['update_list']; z < G['length']; z++) {
                        var u = G[z];
                        if (u.lang == v && u['platform'] == _) {
                            c['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }




        uiscript.UI_Info._refreshAnnouncements = function (P) {
            // START
            P.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (P['announcements'] && (this['announcements'] = P['announcements']), P.sort && (this['announcement_sort'] = P.sort), P['read_list']) {
                this['read_list'] = [];
                for (var c = 0; c < P['read_list']['length']; c++)
                    this['read_list'].push(P['read_list'][c]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }







        // 加载CG 
        !function (P) {
            var c = function () {
                function c(c, v) {
                    var _ = this;
                    this['cg_id'] = 0,
                        this.me = c,
                        this['father'] = v;
                    var z = this.me['getChildByName']('btn_detail');
                    z['clickHandler'] = new Laya['Handler'](this, function () {
                        P['UI_Bag'].Inst['locking'] || _['father']['changeLoadingCG'](_['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](z, new Laya['Handler'](this, function (c) {
                            if (!P['UI_Bag'].Inst['locking']) {
                                'down' == c ? Laya['timer'].once(800, _, function () {
                                    P['UI_CG_Yulan'].Inst.show(_['cg_id']);
                                }) : ('over' == c || 'up' == c) && Laya['timer']['clearAll'](_);
                            }
                        })),
                        this['using'] = z['getChildByName']('using'),
                        this.icon = z['getChildByName']('icon'),
                        this.name = z['getChildByName']('name'),
                        this.info = z['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = z['getChildByName']('new');
                }
                return c['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var c = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != P['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, c['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var v = !this['father']['last_seen_cg_map'][this['cg_id']], _ = 0, z = c['unlock_items']; _ < z['length']; _++) {
                        var G = z[_];
                        if (G && P['UI_Bag']['get_item_count'](G) > 0) {
                            var u = cfg['item_definition'].item.get(G);
                            if (this.name.text = u['name_' + GameMgr['client_language']], !u['item_expire']) {
                                this.info['visible'] = !1,
                                    v = -1 != this['father']['new_cg_ids']['indexOf'](G);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + u['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = v;
                },
                    c['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    c;
            }
                (),
                v = function () {
                    function v(c) {
                        var v = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = c,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var _ = this.me['getChildByName']('choose');
                        this['label_choose_all'] = _['getChildByName']('tip'),
                            _['clickHandler'] = new Laya['Handler'](this, function () {
                                if (v['all_choosed'])
                                    P['UI_Loading']['Loading_Images'] = [];
                                else {
                                    P['UI_Loading']['Loading_Images'] = [];
                                    for (var c = 0, _ = v['items']; c < _['length']; c++) {
                                        var z = _[c];
                                        P['UI_Loading']['Loading_Images'].push(z.id);
                                    }
                                }
                                v['scrollview']['wantToRefreshAll'](),
                                    v['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: P['UI_Loading']['Loading_Images']
                                //}, function (c, v) {
                                //    (c || v['error']) && P['UIMgr'].Inst['showNetReqError']('setLoadingImage', c, v);
                                //});
                                // END
                            });
                    }
                    return v['prototype']['have_redpoint'] = function () {
                        // START
                        //if (P['UI_Bag']['new_cg_ids']['length'] > 0)
                        //    return !0;
                        // END
                        var c = [];
                        if (!this['seen_cg_map']) {
                            var v = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, v) {
                                v = game['Tools']['dddsss'](v);
                                for (var _ = v['split'](','), z = 0; z < _['length']; z++)
                                    this['seen_cg_map'][Number(_[z])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (v) {
                            if (v['unlock_items'][1] && 0 == P['UI_Bag']['get_item_count'](v['unlock_items'][0]) && P['UI_Bag']['get_item_count'](v['unlock_items'][1]) > 0) {
                                if (GameMgr['regionLimited']) {
                                    var _ = cfg['item_definition'].item.get(v['unlock_items'][1]);
                                    if (1 == _['region_limit'])
                                        return;
                                }
                                c.push(v.id);
                            }
                        });
                        for (var G = 0, u = c; G < u['length']; G++) {
                            var I = u[G];
                            if (!this['seen_cg_map'][I])
                                return !0;
                        }
                        return !1;
                    },
                        v['prototype'].show = function () {
                            var c = this;
                            if (this['new_cg_ids'] = P['UI_Bag']['new_cg_ids'], P['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var v = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, v) {
                                    v = game['Tools']['dddsss'](v);
                                    for (var _ = v['split'](','), z = 0; z < _['length']; z++)
                                        this['seen_cg_map'][Number(_[z])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var G = '';
                            cfg['item_definition']['loading_image']['forEach'](function (v) {
                                for (var _ = 0, z = v['unlock_items']; _ < z['length']; _++) {
                                    var u = z[_];
                                    if (u && P['UI_Bag']['get_item_count'](u) > 0) {
                                        var I = cfg['item_definition'].item.get(u);
                                        if (1 == I['region_limit'] && GameMgr['regionLimited'])
                                            continue;
                                        return c['items'].push(v),
                                            c['seen_cg_map'][v.id] = 1,
                                            '' != G && (G += ','),
                                            G += v.id,
                                            void 0;
                                    }
                                }
                            }),
                                this['items'].sort(function (P, c) {
                                    return c.sort - P.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](G)),
                                P['UI_Bag'].Inst['refreshRedpoint'](),
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
                                this['_changed'] && P['UI_Loading']['loadNextCG']();
                        },
                        v['prototype']['render_item'] = function (P) {
                            var v = P['index'],
                                _ = P['container'],
                                z = P['cache_data'];
                            if (this['items'][v]) {
                                z.item || (z.item = new c(_, this));
                                var G = z.item;
                                G['cg_id'] = this['items'][v].id,
                                    G.show();
                            }
                        },
                        v['prototype']['changeLoadingCG'] = function (c) {
                            this['_changed'] = !0;
                            for (var v = 0, _ = 0, z = 0, G = this['items']; z < G['length']; z++) {
                                var u = G[z];
                                if (u.id == c) {
                                    v = _;
                                    break;
                                }
                                _++;
                            }
                            var I = P['UI_Loading']['Loading_Images']['indexOf'](c);
                            -1 == I ? P['UI_Loading']['Loading_Images'].push(c) : P['UI_Loading']['Loading_Images']['splice'](I, 1),
                                this['scrollview']['wantToRefreshItem'](v),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = P['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: P['UI_Loading']['Loading_Images']
                            //}, function (c, v) {
                            //    (c || v['error']) && P['UIMgr'].Inst['showNetReqError']('setLoadingImage', c, v);
                            //});
                            // END
                        },
                        v['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = P['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        v['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        v;
                }
                    ();
            P['UI_Bag_PageCG'] = v;
        }
            (uiscript || (uiscript = {}));






        uiscript.UI_Entrance.prototype._onLoginSuccess = function (c, v, _) {
            var P = uiscript;
            var z = this;
            if (void 0 === _ && (_ = !1), app.Log.log('登陆：' + JSON['stringify'](v)), GameMgr.Inst['account_id'] = v['account_id'], GameMgr.Inst['account_data'] = v['account'], P['UI_ShiMingRenZheng']['renzhenged'] = v['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, v['account']['platform_diamond'])
                for (var G = v['account']['platform_diamond'], u = 0; u < G['length']; u++)
                    GameMgr.Inst['account_numerical_resource'][G[u].id] = G[u]['count'];
            if (v['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = v['account']['skin_ticket']), v['account']['platform_skin_ticket'])
                for (var I = v['account']['platform_skin_ticket'], u = 0; u < I['length']; u++)
                    GameMgr.Inst['account_numerical_resource'][I[u].id] = I[u]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                v['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = v['game_info']['location'], GameMgr.Inst['mj_game_token'] = v['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = v['game_info']['game_uuid']),
                v['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : c['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', v['access_token']), GameMgr.Inst['sociotype'] = c, GameMgr.Inst['access_token'] = v['access_token']);
            var i = this,
                N = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        P['UI_Loading'].Inst.show('load_lobby'),
                        i['enable'] = !1,
                        i['scene']['close'](),
                        P['UI_Entrance_Mail_Regist'].Inst['close'](),
                        i['login_loading']['close'](),
                        P['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](i, function () {
                            GameMgr.Inst['afterLogin'](),
                                i['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && P['UIMgr'].Inst['ShowPreventAddiction'](),
                                i['destroy'](),
                                i['disposeRes'](),
                                P['UI_Add2Desktop'].Inst && (P['UI_Add2Desktop'].Inst['destroy'](), P['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](i, function (c) {
                            return P['UI_Loading'].Inst['setProgressVal'](0.2 * c);
                        }, null, !1));
                },
                V = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (c, v) {
                        c ? (app.Log.log('fetchRefundOrder err:' + c), z['showError'](game['Tools']['strOfLocalization'](2061), c), z['showContainerLogin']()) : (P['UI_Refund']['orders'] = v['orders'], P['UI_Refund']['clear_deadline'] = v['clear_deadline'], P['UI_Refund']['message'] = v['message'], N());
                    }) : N();
                });
            // START
            //if (P['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var U = 0, Y = GameMgr.Inst['account_data']['loading_image']; U < Y['length']; U++) {
            //        var Z = Y[U];
            //        cfg['item_definition']['loading_image'].get(Z) && P['UI_Loading']['Loading_Images'].push(Z);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            P['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || v['account']['phone_verify'] ? V.run() : (P['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, P['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (c, v) {
                        c || v['error'] ? z['showError'](c, v['error']) : 0 == v['phone_login'] ? P['UI_Create_Phone_Account'].Inst.show(V) : P['UI_Canot_Create_Phone_Account'].Inst.show(V);
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
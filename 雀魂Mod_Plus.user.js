// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.129
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
// @match        https://game.mahjongsoul.com/index.html
// @match        https://mahjongsoul.game.yo-star.com/
// @require      https://greasyfork.org/scripts/447701-javascript-blowfish/code/javascript-blowfish.js?version=1069157
// @require      https://greasyfork.org/scripts/447737-majsoul-mod-plus/code/majsoul_mod_plus.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js
// @resource     bootstrap https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css
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
            commonViewList: [[], [], [], [], []], // 保存装扮
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
            randomBotSkin: false,    // 开关，是否随机电脑皮肤
            randomPlayerDefSkin: false, // 开关，是否随机那些只有默认皮肤的玩家的皮肤
            version: '', // 上次运行的版本，用于显示更新日志
            isReadme: false, // 是否已阅读readme
            sendGame: false, // 开关，是否发送游戏对局（如发送至mahjong-helper）
            sendGameURL: 'https://localhost:12121/', // 接收游戏对局的URL
            setPaipuChar: true, // 开关，对查看牌谱生效
            showServer: true, // 开关，显示玩家所在服务器
            antiCensorship: true // 开关，反屏蔽名称与文本审查
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
            for (let items of ca) {
                items = items.trim();
                if (items.indexOf('majsoul_mod_plus=') == 0) {
                    value = decodeURIComponent(items.substring("majsoul_mod_plus=".length, items.length));
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
!function () {
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
        }
        catch {
            result['apis'][func] = false;
            result['clear'] = false;
        }
    }
    return result
}


!function majsoul_mod_plus() {
    try {
        // Hack 开启报番型，作者 aoarashi1988，Handle修改
        !function () {
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
        !function (b) {
            var O;
            !function (b) {
                b[b.none = 0] = "none",
                    b[b.daoju = 1] = "daoju",
                    b[b.gift = 2] = "gift",
                    b[b.fudai = 3] = "fudai",
                    b[b.view = 5] = "view"
            }
                (O = b.EItemCategory || (b.EItemCategory = {}));
            var u = function (u) {
                function Y() {
                    var b = u.call(this, new ui.lobby.bagUI) || this;
                    return b.container_top = null,
                        b.container_content = null,
                        b.locking = !1,
                        b.tabs = [],
                        b.page_item = null,
                        b.page_gift = null,
                        b.page_skin = null,
                        b.select_index = 0,
                        Y.Inst = b,
                        b
                }
                return __extends(Y, u),
                    Y.init = function () {
                        var b = this;
                        app.NetAgent.AddListener2Lobby("NotifyAccountUpdate", Laya.Handler.create(this, function (O) {
                            var u = O.update;
                            u && u.bag && (b.update_data(u.bag.update_items), b.update_daily_gain_data(u.bag))
                        }, null, !1)),
                            this.fetch()
                    },
                    Y.fetch = function () {
                        var O = this;
                        this._item_map = {},
                            this._daily_gain_record = {},
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchBagInfo", {}, function (u, Y) {
                                if (u || Y.error)
                                    b.UIMgr.Inst.showNetReqError("fetchBagInfo", u, Y);
                                else {
                                    app.Log.log("背包信息：" + JSON.stringify(Y));
                                    var W = Y.bag;
                                    if (W) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of W.items) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            O._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    O._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }


                                        } else {
                                            if (W.items)
                                                for (var T = 0; T < W.items.length; T++) {
                                                    var D = W.items[T].item_id,
                                                        m = W.items[T].stack,
                                                        i = cfg.item_definition.item.get(D);
                                                    i && (O._item_map[D] = {
                                                        item_id: D,
                                                        count: m,
                                                        category: i.category
                                                    }, 1 == i.category && 3 == i.type && app.NetAgent.sendReq2Lobby("Lobby", "openAllRewardItem", {
                                                        item_id: D
                                                    }, function () { }))
                                                }
                                            if (W.daily_gain_record)
                                                for (var o = W.daily_gain_record, T = 0; T < o.length; T++) {
                                                    var r = o[T].limit_source_id;
                                                    O._daily_gain_record[r] = {};
                                                    var B = o[T].record_time;
                                                    O._daily_gain_record[r].record_time = B;
                                                    var A = o[T].records;
                                                    if (A)
                                                        for (var w = 0; w < A.length; w++)
                                                            O._daily_gain_record[r][A[w].item_id] = A[w].count
                                                }
                                        }
                                    }
                                }
                            })
                    },
                    Y.find_item = function (b) {
                        var O = this._item_map[b];
                        return O ? {
                            item_id: O.item_id,
                            category: O.category,
                            count: O.count
                        }
                            : null
                    },
                    Y.get_item_count = function (b) {
                        var O = this.find_item(b);
                        if (O)
                            return O.count;
                        if (100001 == b) {
                            for (var u = 0, Y = 0, W = GameMgr.Inst.free_diamonds; Y < W.length; Y++) {
                                var T = W[Y];
                                GameMgr.Inst.account_numerical_resource[T] && (u += GameMgr.Inst.account_numerical_resource[T])
                            }
                            for (var D = 0, m = GameMgr.Inst.paid_diamonds; D < m.length; D++) {
                                var T = m[D];
                                GameMgr.Inst.account_numerical_resource[T] && (u += GameMgr.Inst.account_numerical_resource[T])
                            }
                            return u
                        }
                        if (100004 == b) {
                            for (var i = 0, o = 0, r = GameMgr.Inst.free_pifuquans; o < r.length; o++) {
                                var T = r[o];
                                GameMgr.Inst.account_numerical_resource[T] && (i += GameMgr.Inst.account_numerical_resource[T])
                            }
                            for (var B = 0, A = GameMgr.Inst.paid_pifuquans; B < A.length; B++) {
                                var T = A[B];
                                GameMgr.Inst.account_numerical_resource[T] && (i += GameMgr.Inst.account_numerical_resource[T])
                            }
                            return i
                        }
                        return 100002 == b ? GameMgr.Inst.account_data.gold : 0
                    },
                    Y.find_items_by_category = function (b) {
                        var O = [];
                        for (var u in this._item_map)
                            this._item_map[u].category == b && O.push({
                                item_id: this._item_map[u].item_id,
                                category: this._item_map[u].category,
                                count: this._item_map[u].count
                            });
                        return O
                    },
                    Y.update_data = function (O) {
                        for (var u = 0; u < O.length; u++) {
                            var Y = O[u].item_id,
                                W = O[u].stack;
                            if (W > 0) {
                                this._item_map.hasOwnProperty(Y.toString()) ? this._item_map[Y].count = W : this._item_map[Y] = {
                                    item_id: Y,
                                    count: W,
                                    category: cfg.item_definition.item.get(Y).category
                                };
                                var T = cfg.item_definition.item.get(Y);
                                1 == T.category && 3 == T.type && app.NetAgent.sendReq2Lobby("Lobby", "openAllRewardItem", {
                                    item_id: Y
                                }, function () { })
                            } else if (this._item_map.hasOwnProperty(Y.toString())) {
                                var D = cfg.item_definition.item.get(Y);
                                D && 5 == D.category && b.UI_Sushe.on_view_remove(Y),
                                    this._item_map[Y] = 0,
                                    delete this._item_map[Y]
                            }
                        }
                        this.Inst && this.Inst.when_data_change();
                        for (var u = 0; u < O.length; u++) {
                            var Y = O[u].item_id;
                            if (this._item_listener.hasOwnProperty(Y.toString()))
                                for (var m = this._item_listener[Y], i = 0; i < m.length; i++)
                                    m[i].run()
                        }
                        for (var u = 0; u < this._all_item_listener.length; u++)
                            this._all_item_listener[u].run()
                    },
                    Y.update_daily_gain_data = function (b) {
                        var O = b.update_daily_gain_record;
                        if (O)
                            for (var u = 0; u < O.length; u++) {
                                var Y = O[u].limit_source_id;
                                this._daily_gain_record[Y] || (this._daily_gain_record[Y] = {});
                                var W = O[u].record_time;
                                this._daily_gain_record[Y].record_time = W;
                                var T = O[u].records;
                                if (T)
                                    for (var D = 0; D < T.length; D++)
                                        this._daily_gain_record[Y][T[D].item_id] = T[D].count
                            }
                    },
                    Y.get_item_daily_record = function (b, O) {
                        return this._daily_gain_record[b] ? this._daily_gain_record[b].record_time ? game.Tools.isPassedRefreshTimeServer(this._daily_gain_record[b].record_time) ? this._daily_gain_record[b][O] ? this._daily_gain_record[b][O] : 0 : 0 : 0 : 0
                    },
                    Y.add_item_listener = function (b, O) {
                        this._item_listener.hasOwnProperty(b.toString()) || (this._item_listener[b] = []),
                            this._item_listener[b].push(O)
                    },
                    Y.remove_item_listener = function (b, O) {
                        var u = this._item_listener[b];
                        if (u)
                            for (var Y = 0; Y < u.length; Y++)
                                if (u[Y] === O) {
                                    u[Y] = u[u.length - 1],
                                        u.pop();
                                    break
                                }
                    },
                    Y.add_all_item_listener = function (b) {
                        this._all_item_listener.push(b)
                    },
                    Y.remove_all_item_listener = function (b) {
                        for (var O = this._all_item_listener, u = 0; u < O.length; u++)
                            if (O[u] === b) {
                                O[u] = O[O.length - 1],
                                    O.pop();
                                break
                            }
                    },
                    Y.prototype.have_red_point = function () {
                        return !1
                    },
                    Y.prototype.onCreate = function () {
                        var O = this;
                        this.container_top = this.me.getChildByName("top"),
                            this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                O.locking || O.hide(Laya.Handler.create(O, function () {
                                    return O.closeHandler ? (O.closeHandler.run(), O.closeHandler = null, void 0) : (b.UI_Lobby.Inst.enable = !0, void 0)
                                }))
                            }, null, !1),
                            this.container_content = this.me.getChildByName("content");
                        for (var u = function (b) {
                            Y.tabs.push(Y.container_content.getChildByName("tabs").getChildByName("btn" + b)),
                                Y.tabs[b].clickHandler = Laya.Handler.create(Y, function () {
                                    O.select_index != b && O.on_change_tab(b)
                                }, null, !1)
                        }, Y = this, W = 0; 4 > W; W++)
                            u(W);
                        this.page_item = new b.UI_Bag_PageItem(this.container_content.getChildByName("page_items")),
                            this.page_gift = new b.UI_Bag_PageGift(this.container_content.getChildByName("page_gift")),
                            this.page_skin = new b.UI_Bag_PageSkin(this.container_content.getChildByName("page_skin"))
                    },
                    Y.prototype.show = function (O, u) {
                        var Y = this;
                        void 0 === O && (O = 0),
                            void 0 === u && (u = null),
                            this.enable = !0,
                            this.locking = !0,
                            this.closeHandler = u,
                            b.UIBase.anim_alpha_in(this.container_top, {
                                y: -30
                            }, 200),
                            b.UIBase.anim_alpha_in(this.container_content, {
                                y: 30
                            }, 200),
                            Laya.timer.once(300, this, function () {
                                Y.locking = !1
                            }),
                            this.on_change_tab(O),
                            game.Scene_Lobby.Inst.change_bg("indoor", !1),
                            3 != O && this.page_skin.when_update_data()
                    },
                    Y.prototype.hide = function (O) {
                        var u = this;
                        this.locking = !0,
                            b.UIBase.anim_alpha_out(this.container_top, {
                                y: -30
                            }, 200),
                            b.UIBase.anim_alpha_out(this.container_content, {
                                y: 30
                            }, 200),
                            Laya.timer.once(300, this, function () {
                                u.locking = !1,
                                    u.enable = !1,
                                    O && O.run()
                            })
                    },
                    Y.prototype.onDisable = function () {
                        this.page_skin.close(),
                            this.page_item.close(),
                            this.page_gift.close()
                    },
                    Y.prototype.on_change_tab = function (b) {
                        this.select_index = b;
                        for (var u = 0; u < this.tabs.length; u++)
                            this.tabs[u].skin = game.Tools.localUISrc(b == u ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[u].getChildAt(0).color = b == u ? "#d9b263" : "#8cb65f";
                        switch (this.page_item.close(), this.page_gift.close(), this.page_skin.me.visible = !1, b) {
                            case 0:
                                this.page_item.show(O.daoju);
                                break;
                            case 1:
                                this.page_gift.show();
                                break;
                            case 2:
                                this.page_item.show(O.view);
                                break;
                            case 3:
                                this.page_skin.show()
                        }
                    },
                    Y.prototype.when_data_change = function () {
                        this.page_item.me.visible && this.page_item.when_update_data(),
                            this.page_gift.me.visible && this.page_gift.when_update_data()
                    },
                    Y.prototype.on_skin_change = function () {
                        this.page_skin.when_update_data()
                    },
                    Y.prototype.clear_desktop_btn_redpoint = function () {
                        this.tabs[3].getChildByName("redpoint").visible = !1
                    },
                    Y._item_map = {},
                    Y._item_listener = {},
                    Y._all_item_listener = [],
                    Y._daily_gain_record = {},
                    Y.Inst = null,
                    Y
            }
                (b.UIBase);
            b.UI_Bag = u
        }
            (uiscript || (uiscript = {}));


        // 修改牌桌上角色
        !function (b) {
            var O = function () {
                function O() {
                    var O = this;
                    this.urls = [],
                        this.link_index = -1,
                        this.connect_state = b.EConnectState.none,
                        this.reconnect_count = 0,
                        this.reconnect_span = [500, 1e3, 3e3, 6e3, 1e4, 15e3],
                        this.playerreconnect = !1,
                        this.lasterrortime = 0,
                        this.load_over = !1,
                        this.loaded_player_count = 0,
                        this.real_player_count = 0,
                        this.is_ob = !1,
                        this.ob_token = "",
                        this.lb_index = 0,
                        this._report_reconnect_count = 0,
                        this._connect_start_time = 0,
                        app.NetAgent.AddListener2MJ("NotifyPlayerLoadGameReady", Laya.Handler.create(this, function (b) {
                            app.Log.log("NotifyPlayerLoadGameReady: " + JSON.stringify(b)),
                                O.loaded_player_count = b.ready_id_list.length,
                                O.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(O.loaded_player_count, O.real_player_count)
                        }))
                }
                return Object.defineProperty(O, "Inst", {
                    get: function () {
                        return null == this._Inst ? this._Inst = new O : this._Inst
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    O.prototype.OpenConnect = function (O, u, Y, W) {
                        var T = this;
                        uiscript.UI_Loading.Inst.show("enter_mj"),
                            b.Scene_Lobby.Inst && b.Scene_Lobby.Inst.active && (b.Scene_Lobby.Inst.active = !1),
                            b.Scene_Huiye.Inst && b.Scene_Huiye.Inst.active && (b.Scene_Huiye.Inst.active = !1),
                            this.Close(),
                            view.BgmListMgr.stopBgm(),
                            this.is_ob = !1,
                            Laya.timer.once(500, this, function () {
                                T.url = "",
                                    T.token = O,
                                    T.game_uuid = u,
                                    T.server_location = Y,
                                    GameMgr.Inst.ingame = !0,
                                    GameMgr.Inst.mj_server_location = Y,
                                    GameMgr.Inst.mj_game_token = O,
                                    GameMgr.Inst.mj_game_uuid = u,
                                    T.playerreconnect = W,
                                    T._setState(b.EConnectState.tryconnect),
                                    T.load_over = !1,
                                    T.loaded_player_count = 0,
                                    T.real_player_count = 0,
                                    T.lb_index = 0,
                                    T._fetch_gateway(0)
                            }),
                            Laya.timer.loop(3e5, this, this.reportInfo)
                    },
                    O.prototype.reportInfo = function () {
                        this.connect_state == b.EConnectState.connecting && GameMgr.Inst.postNewInfo2Server("network_route", {
                            client_type: "web",
                            route_type: "game",
                            route_index: b.LobbyNetMgr.root_id_lst[b.LobbyNetMgr.Inst.choosed_index],
                            route_delay: Math.min(1e4, Math.round(app.NetAgent.mj_network_delay)),
                            connection_time: Math.round(Date.now() - this._connect_start_time),
                            reconnect_count: this._report_reconnect_count
                        })
                    },
                    O.prototype.Close = function () {
                        this.load_over = !1,
                            app.Log.log("MJNetMgr close"),
                            this._setState(b.EConnectState.none),
                            app.NetAgent.Close2MJ(),
                            this.url = "",
                            Laya.timer.clear(this, this.reportInfo)
                    },
                    O.prototype._OnConnent = function (O) {
                        app.Log.log("MJNetMgr _OnConnent event:" + O),
                            O == Laya.Event.CLOSE || O == Laya.Event.ERROR ? Laya.timer.currTimer - this.lasterrortime > 100 && (this.lasterrortime = Laya.timer.currTimer, this.connect_state == b.EConnectState.tryconnect ? this._try_to_linknext() : this.connect_state == b.EConnectState.connecting ? view.DesktopMgr.Inst.active ? (view.DesktopMgr.Inst.duringReconnect = !0, this._setState(b.EConnectState.reconnecting), this.reconnect_count = 0, this._Reconnect()) : (this._setState(b.EConnectState.disconnect), uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2008)), b.Scene_MJ.Inst.ForceOut()) : this.connect_state == b.EConnectState.reconnecting && this._Reconnect()) : O == Laya.Event.OPEN && (this._connect_start_time = Date.now(), (this.connect_state == b.EConnectState.tryconnect || this.connect_state == b.EConnectState.reconnecting) && ((this.connect_state = b.EConnectState.tryconnect) ? this._report_reconnect_count = 0 : this._report_reconnect_count++, this._setState(b.EConnectState.connecting), this.is_ob ? this._ConnectSuccessOb() : this._ConnectSuccess()))
                    },
                    O.prototype._Reconnect = function () {
                        var O = this;
                        b.LobbyNetMgr.Inst.connect_state == b.EConnectState.none || b.LobbyNetMgr.Inst.connect_state == b.EConnectState.disconnect ? this._setState(b.EConnectState.disconnect) : b.LobbyNetMgr.Inst.connect_state == b.EConnectState.connecting && GameMgr.Inst.logined ? this.reconnect_count >= this.reconnect_span.length ? this._setState(b.EConnectState.disconnect) : (Laya.timer.once(this.reconnect_span[this.reconnect_count], this, function () {
                            O.connect_state == b.EConnectState.reconnecting && (app.Log.log("MJNetMgr reconnect count:" + O.reconnect_count), app.NetAgent.connect2MJ(O.url, Laya.Handler.create(O, O._OnConnent, null, !1), "local" == O.server_location ? "/game-gateway" : "/game-gateway-zone"))
                        }), this.reconnect_count++) : Laya.timer.once(1e3, this, this._Reconnect)
                    },
                    O.prototype._try_to_linknext = function () {
                        this.link_index++,
                            this.url = "",
                            app.Log.log("mj _try_to_linknext(" + this.link_index + ") url.length=" + this.urls.length),
                            this.link_index < 0 || this.link_index >= this.urls.length ? b.LobbyNetMgr.Inst.polling_connect ? (this.lb_index++, this._fetch_gateway(0)) : (this._setState(b.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(59)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && b.Scene_MJ.Inst.ForceOut()) : (app.NetAgent.connect2MJ(this.urls[this.link_index].url, Laya.Handler.create(this, this._OnConnent, null, !1), "local" == this.server_location ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this.link_index].url)
                    },
                    O.prototype.GetAuthData = function () {
                        return {
                            account_id: GameMgr.Inst.account_id,
                            token: this.token,
                            game_uuid: this.game_uuid,
                            gift: CryptoJS.HmacSHA256(this.token + GameMgr.Inst.account_id + this.game_uuid, "damajiang").toString()
                        }
                    },
                    O.prototype._fetch_gateway = function (O) {
                        var u = this;
                        if (b.LobbyNetMgr.Inst.polling_connect && this.lb_index >= b.LobbyNetMgr.Inst.urls.length)
                            return uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(58)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && b.Scene_MJ.Inst.ForceOut(), this._setState(b.EConnectState.none), void 0;
                        this.urls = [],
                            this.link_index = -1,
                            app.Log.log("mj _fetch_gateway retry_count:" + O);
                        var Y = function (Y) {
                            var W = JSON.parse(Y);
                            if (app.Log.log("mj _fetch_gateway func_success data = " + Y), W.maintenance)
                                u._setState(b.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2009)), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && b.Scene_MJ.Inst.ForceOut();
                            else if (W.servers && W.servers.length > 0) {
                                for (var T = W.servers, D = b.Tools.deal_gateway(T), m = 0; m < D.length; m++)
                                    u.urls.push({
                                        name: "___" + m,
                                        url: D[m]
                                    });
                                u.link_index = -1,
                                    u._try_to_linknext()
                            } else
                                1 > O ? Laya.timer.once(1e3, u, function () {
                                    u._fetch_gateway(O + 1)
                                }) : b.LobbyNetMgr.Inst.polling_connect ? (u.lb_index++, u._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(60)), u._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && b.Scene_MJ.Inst.ForceOut(), u._setState(b.EConnectState.none))
                        },
                            W = function () {
                                app.Log.log("mj _fetch_gateway func_error"),
                                    1 > O ? Laya.timer.once(500, u, function () {
                                        u._fetch_gateway(O + 1)
                                    }) : b.LobbyNetMgr.Inst.polling_connect ? (u.lb_index++, u._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(58)), u._SendDebugInfo(), view.DesktopMgr.Inst.active || b.Scene_MJ.Inst.ForceOut(), u._setState(b.EConnectState.none))
                            },
                            T = function (b) {
                                var O = new Laya.HttpRequest;
                                O.once(Laya.Event.COMPLETE, u, function (b) {
                                    Y(b)
                                }),
                                    O.once(Laya.Event.ERROR, u, function () {
                                        W()
                                    });
                                var T = [];
                                T.push("If-Modified-Since"),
                                    T.push("0"),
                                    b += "?service=ws-game-gateway",
                                    b += GameMgr.inHttps ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                    b += "&location=" + u.server_location,
                                    b += "&rv=" + Math.floor(1e7 * Math.random()) + Math.floor(1e7 * Math.random()),
                                    O.send(b, "", "get", "text", T),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + b)
                            };
                        b.LobbyNetMgr.Inst.polling_connect ? T(b.LobbyNetMgr.Inst.urls[this.lb_index]) : T(b.LobbyNetMgr.Inst.lb_url)
                    },
                    O.prototype._setState = function (O) {
                        this.connect_state = O,
                            GameMgr.inRelease || null != uiscript.UI_Common.Inst && (O == b.EConnectState.none ? uiscript.UI_Common.Inst.label_net_mj.text = "" : O == b.EConnectState.tryconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "尝试连接麻将服务器", uiscript.UI_Common.Inst.label_net_mj.color = "#000000") : O == b.EConnectState.connecting ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正常", uiscript.UI_Common.Inst.label_net_mj.color = "#00ff00") : O == b.EConnectState.disconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：断开连接", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()) : O == b.EConnectState.reconnecting && (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正在重连", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()))
                    },
                    O.prototype._ConnectSuccess = function () {
                        var O = this;
                        app.Log.log("MJNetMgr _ConnectSuccess "),
                            this.load_over = !1,
                            app.NetAgent.sendReq2MJ("FastTest", "authGame", this.GetAuthData(), function (u, Y) {
                                if (u || Y.error)
                                    uiscript.UIMgr.Inst.showNetReqError("authGame", u, Y), b.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                else {
                                    app.Log.log("麻将桌验证通过：" + JSON.stringify(Y)),
                                        uiscript.UI_Loading.Inst.setProgressVal(.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        Y.game_config.mode.detail_rule.bianjietishi = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(Y),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 已成功发送牌局');
                                            }
                                        });
                                    }
                                    //END
                                    var W = [],
                                        T = 0;
                                    view.DesktopMgr.player_link_state = Y.state_list;
                                    var D = b.Tools.strOfLocalization(2003),
                                        m = Y.game_config.mode,
                                        i = view.ERuleMode.Liqi4;
                                    m.mode < 10 ? (i = view.ERuleMode.Liqi4, O.real_player_count = 4) : m.mode < 20 && (i = view.ERuleMode.Liqi3, O.real_player_count = 3);
                                    for (var o = 0; o < O.real_player_count; o++)
                                        W.push(null);
                                    m.extendinfo && (D = b.Tools.strOfLocalization(2004)),
                                        m.detail_rule && m.detail_rule.ai_level && (1 === m.detail_rule.ai_level && (D = b.Tools.strOfLocalization(2003)), 2 === m.detail_rule.ai_level && (D = b.Tools.strOfLocalization(2004)));
                                    for (var r = b.GameUtility.get_default_ai_skin(), B = b.GameUtility.get_default_ai_character(), o = 0; o < Y.seat_list.length; o++) {
                                        var A = Y.seat_list[o];
                                        if (0 == A) {
                                            W[o] = {
                                                nickname: D,
                                                avatar_id: r,
                                                level: {
                                                    id: 10101
                                                },
                                                level3: {
                                                    id: 20101
                                                },
                                                character: {
                                                    charid: B,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: r,
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
                                                    W[o].avatar_id = skin.id;
                                                    W[o].character.charid = skin.character_id;
                                                    W[o].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                W[o].nickname = '[BOT]' + W[o].nickname;
                                            }
                                        }
                                        else {
                                            T++;
                                            for (var w = 0; w < Y.players.length; w++)
                                                if (Y.players[w].account_id == A) {
                                                    W[o] = Y.players[w];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (W[o].account_id == GameMgr.Inst.account_id) {
                                                        W[o].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        W[o].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        W[o].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        W[o].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        W[o].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            W[o].nickname = MMP.settings.nickname;
                                                        }
                                                    }
                                                    else if (MMP.settings.randomPlayerDefSkin && (W[o].avatar_id == 400101 || W[o].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            W[o].avatar_id = skin.id;
                                                            W[o].character.charid = skin.character_id;
                                                            W[o].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(W[o].account_id);
                                                        if (server == 1) {
                                                            W[o].nickname = '[CN]' + W[o].nickname;
                                                        } else if (server == 2) {
                                                            W[o].nickname = '[JP]' + W[o].nickname;
                                                        } else if (server == 3) {
                                                            W[o].nickname = '[EN]' + W[o].nickname;
                                                        } else {
                                                            W[o].nickname = '[??]' + W[o].nickname;
                                                        }
                                                    }
                                                    // END
                                                    //break
                                                }
                                        }
                                    }
                                    for (var o = 0; o < O.real_player_count; o++)
                                        null == W[o] && (W[o] = {
                                            account: 0,
                                            nickname: b.Tools.strOfLocalization(2010),
                                            avatar_id: r,
                                            level: {
                                                id: 10101
                                            },
                                            level3: {
                                                id: 20101
                                            },
                                            character: {
                                                charid: B,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: r,
                                                is_upgraded: !1
                                            }
                                        });
                                    O.loaded_player_count = Y.ready_id_list.length,
                                        O._AuthSuccess(W, Y.is_game_start, Y.game_config.toJSON())
                                }
                            })
                    },
                    O.prototype._AuthSuccess = function (O, u, Y) {
                        var W = this;
                        view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                view.DesktopMgr.Inst.Reset(),
                                view.DesktopMgr.Inst.duringReconnect = !0,
                                uiscript.UI_Loading.Inst.setProgressVal(.2),
                                app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                    round_id: view.DesktopMgr.Inst.round_id,
                                    step: view.DesktopMgr.Inst.current_step
                                }, function (O, u) {
                                    O || u.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", O, u), b.Scene_MJ.Inst.ForceOut()) : (app.Log.log("[syncGame] " + JSON.stringify(u)), u.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2011)), b.Scene_MJ.Inst.GameEnd()) : (uiscript.UI_Loading.Inst.setProgressVal(.3), view.DesktopMgr.Inst.fetchLinks(), view.DesktopMgr.Inst.Reset(), view.DesktopMgr.Inst.duringReconnect = !0, view.DesktopMgr.Inst.syncGameByStep(u.game_restore)))
                                })
                        })) : b.Scene_MJ.Inst.openMJRoom(Y, O, Laya.Handler.create(this, function () {
                            view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(Y)), O, GameMgr.Inst.account_id, view.EMJMode.play, Laya.Handler.create(W, function () {
                                u ? Laya.timer.frameOnce(10, W, function () {
                                    app.Log.log("重连信息2 round_id:-1 step:" + 1e6),
                                        view.DesktopMgr.Inst.Reset(),
                                        view.DesktopMgr.Inst.duringReconnect = !0,
                                        app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                            round_id: "-1",
                                            step: 1e6
                                        }, function (O, u) {
                                            app.Log.log("syncGame " + JSON.stringify(u)),
                                                O || u.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", O, u), b.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), view.DesktopMgr.Inst.fetchLinks(), W._PlayerReconnectSuccess(u))
                                        })
                                }) : Laya.timer.frameOnce(10, W, function () {
                                    app.Log.log("send enterGame"),
                                        view.DesktopMgr.Inst.Reset(),
                                        view.DesktopMgr.Inst.duringReconnect = !0,
                                        app.NetAgent.sendReq2MJ("FastTest", "enterGame", {}, function (O, u) {
                                            O || u.error ? (uiscript.UIMgr.Inst.showNetReqError("enterGame", O, u), b.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), app.Log.log("enterGame"), W._EnterGame(u), view.DesktopMgr.Inst.fetchLinks())
                                        })
                                })
                            }))
                        }), Laya.Handler.create(this, function (b) {
                            return uiscript.UI_Loading.Inst.setProgressVal(.1 + .8 * b)
                        }, null, !1))
                    },
                    O.prototype._EnterGame = function (O) {
                        app.Log.log("正常进入游戏: " + JSON.stringify(O)),
                            O.is_end ? (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2011)), b.Scene_MJ.Inst.GameEnd()) : O.game_restore ? view.DesktopMgr.Inst.syncGameByStep(O.game_restore) : (this.load_over = !0, this.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(this.loaded_player_count, this.real_player_count), view.DesktopMgr.Inst.duringReconnect = !1, view.DesktopMgr.Inst.StartChainAction(0))
                    },
                    O.prototype._PlayerReconnectSuccess = function (O) {
                        app.Log.log("_PlayerReconnectSuccess data:" + JSON.stringify(O)),
                            O.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2011)), b.Scene_MJ.Inst.GameEnd()) : O.game_restore ? view.DesktopMgr.Inst.syncGameByStep(O.game_restore) : (uiscript.UIMgr.Inst.ShowErrorInfo(b.Tools.strOfLocalization(2012)), b.Scene_MJ.Inst.ForceOut())
                    },
                    O.prototype._SendDebugInfo = function () { },
                    O.prototype.OpenConnectObserve = function (O, u) {
                        var Y = this;
                        this.is_ob = !0,
                            uiscript.UI_Loading.Inst.show("enter_mj"),
                            this.Close(),
                            view.AudioMgr.StopMusic(),
                            Laya.timer.once(500, this, function () {
                                Y.server_location = u,
                                    Y.ob_token = O,
                                    Y._setState(b.EConnectState.tryconnect),
                                    Y.lb_index = 0,
                                    Y._fetch_gateway(0)
                            })
                    },
                    O.prototype._ConnectSuccessOb = function () {
                        var O = this;
                        app.Log.log("MJNetMgr _ConnectSuccessOb "),
                            app.NetAgent.sendReq2MJ("FastTest", "authObserve", {
                                token: this.ob_token
                            }, function (u, Y) {
                                u || Y.error ? (uiscript.UIMgr.Inst.showNetReqError("authObserve", u, Y), b.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm()) : (app.Log.log("实时OB验证通过：" + JSON.stringify(Y)), uiscript.UI_Loading.Inst.setProgressVal(.3), uiscript.UI_Live_Broadcast.Inst && uiscript.UI_Live_Broadcast.Inst.clearPendingUnits(), app.NetAgent.sendReq2MJ("FastTest", "startObserve", {}, function (u, Y) {
                                    if (u || Y.error)
                                        uiscript.UIMgr.Inst.showNetReqError("startObserve", u, Y), b.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                    else {
                                        var W = Y.head,
                                            T = W.game_config.mode,
                                            D = [],
                                            m = b.Tools.strOfLocalization(2003),
                                            i = view.ERuleMode.Liqi4;
                                        T.mode < 10 ? (i = view.ERuleMode.Liqi4, O.real_player_count = 4) : T.mode < 20 && (i = view.ERuleMode.Liqi3, O.real_player_count = 3);
                                        for (var o = 0; o < O.real_player_count; o++)
                                            D.push(null);
                                        T.extendinfo && (m = b.Tools.strOfLocalization(2004)),
                                            T.detail_rule && T.detail_rule.ai_level && (1 === T.detail_rule.ai_level && (m = b.Tools.strOfLocalization(2003)), 2 === T.detail_rule.ai_level && (m = b.Tools.strOfLocalization(2004)));
                                        for (var r = b.GameUtility.get_default_ai_skin(), B = b.GameUtility.get_default_ai_character(), o = 0; o < W.seat_list.length; o++) {
                                            var A = W.seat_list[o];
                                            if (0 == A)
                                                D[o] = {
                                                    nickname: m,
                                                    avatar_id: r,
                                                    level: {
                                                        id: 10101
                                                    },
                                                    level3: {
                                                        id: 20101
                                                    },
                                                    character: {
                                                        charid: B,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: r,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var w = 0; w < W.players.length; w++)
                                                    if (W.players[w].account_id == A) {
                                                        D[o] = W.players[w];
                                                        break
                                                    }
                                        }
                                        for (var o = 0; o < O.real_player_count; o++)
                                            null == D[o] && (D[o] = {
                                                account: 0,
                                                nickname: b.Tools.strOfLocalization(2010),
                                                avatar_id: r,
                                                level: {
                                                    id: 10101
                                                },
                                                level3: {
                                                    id: 20101
                                                },
                                                character: {
                                                    charid: B,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: r,
                                                    is_upgraded: !1
                                                }
                                            });
                                        O._StartObSuccuess(D, Y.passed, W.game_config.toJSON(), W.start_time)
                                    }
                                }))
                            })
                    },
                    O.prototype._StartObSuccuess = function (O, u, Y, W) {
                        var T = this;
                        view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                view.DesktopMgr.Inst.Reset(),
                                uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(W, u)
                        })) : (uiscript.UI_Loading.Inst.setProgressVal(.4), b.Scene_MJ.Inst.openMJRoom(Y, O, Laya.Handler.create(this, function () {
                            view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(Y)), O, GameMgr.Inst.account_id, view.EMJMode.live_broadcast, Laya.Handler.create(T, function () {
                                uiscript.UI_Loading.Inst.setProgressVal(.9),
                                    Laya.timer.once(1e3, T, function () {
                                        GameMgr.Inst.EnterMJ(),
                                            uiscript.UI_Loading.Inst.setProgressVal(.95),
                                            uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(W, u)
                                    })
                            }))
                        }), Laya.Handler.create(this, function (b) {
                            return uiscript.UI_Loading.Inst.setProgressVal(.4 + .4 * b)
                        }, null, !1)))
                    },
                    O._Inst = null,
                    O
            }
                ();
            b.MJNetMgr = O
        }
            (game || (game = {}));


        // 读取战绩
        !function (b) {
            var O = function (O) {
                function u() {
                    var b = O.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.both_ui.otherplayerinfoUI : new ui.both_ui.otherplayerinfo_enUI) || this;
                    return b.account_id = 0,
                        b.origin_x = 0,
                        b.origin_y = 0,
                        b.root = null,
                        b.title = null,
                        b.level = null,
                        b.btn_addfriend = null,
                        b.btn_report = null,
                        b.illust = null,
                        b.name = null,
                        b.detail_data = null,
                        b.achievement_data = null,
                        b.locking = !1,
                        b.tab_info4 = null,
                        b.tab_info3 = null,
                        b.tab_note = null,
                        b.tab_img_dark = "",
                        b.tab_img_chosen = "",
                        b.player_data = null,
                        b.tab_index = 1,
                        b.game_category = 1,
                        b.game_type = 1,
                        u.Inst = b,
                        b
                }
                return __extends(u, O),
                    u.prototype.onCreate = function () {
                        var O = this;
                        "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tab_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tab_dark.png")) : (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tabheng_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tabheng_dark.png")),
                            this.root = this.me.getChildByName("root"),
                            this.origin_x = this.root.x,
                            this.origin_y = this.root.y,
                            this.container_info = this.root.getChildByName("container_info"),
                            this.title = new b.UI_PlayerTitle(this.container_info.getChildByName("title"), "UI_OtherPlayerInfo"),
                            this.name = this.container_info.getChildByName("name"),
                            this.level = new b.UI_Level(this.container_info.getChildByName("rank"), "UI_OtherPlayerInfo"),
                            this.detail_data = new b.UI_PlayerData(this.container_info.getChildByName("data")),
                            this.achievement_data = new b.UI_Achievement_Light(this.container_info.getChildByName("achievement")),
                            this.illust = new b.UI_Character_Skin(this.root.getChildByName("illust").getChildByName("illust")),
                            this.btn_addfriend = this.container_info.getChildByName("btn_add"),
                            this.btn_addfriend.clickHandler = Laya.Handler.create(this, function () {
                                O.btn_addfriend.visible = !1,
                                    O.btn_report.x = 343,
                                    app.NetAgent.sendReq2Lobby("Lobby", "applyFriend", {
                                        target_id: O.account_id
                                    }, function () { })
                            }, null, !1),
                            this.btn_report = this.container_info.getChildByName("btn_report"),
                            this.btn_report.clickHandler = new Laya.Handler(this, function () {
                                b.UI_Report_Nickname.Inst.show(O.account_id)
                            }),
                            this.me.getChildAt(0).clickHandler = Laya.Handler.create(this, function () {
                                O.locking || O.close()
                            }, null, !1),
                            this.root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                O.close()
                            }, null, !1),
                            this.note = new b.UI_PlayerNote(this.root.getChildByName("container_note"), null),
                            this.tab_info4 = this.root.getChildByName("tab_info4"),
                            this.tab_info4.clickHandler = Laya.Handler.create(this, function () {
                                O.locking || 1 != O.tab_index && O.changeMJCategory(1)
                            }, null, !1),
                            this.tab_info3 = this.root.getChildByName("tab_info3"),
                            this.tab_info3.clickHandler = Laya.Handler.create(this, function () {
                                O.locking || 2 != O.tab_index && O.changeMJCategory(2)
                            }, null, !1),
                            this.tab_note = this.root.getChildByName("tab_note"),
                            this.tab_note.clickHandler = Laya.Handler.create(this, function () {
                                O.locking || "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type && (game.Tools.during_chat_close() ? b.UIMgr.Inst.ShowErrorInfo("功能维护中，祝大家新年快乐") : O.container_info.visible && (O.container_info.visible = !1, O.tab_info4.skin = O.tab_img_dark, O.tab_info3.skin = O.tab_img_dark, O.tab_note.skin = O.tab_img_chosen, O.tab_index = 3, O.note.show()))
                            }, null, !1),
                            this.locking = !1
                    },
                    u.prototype.show = function (O, u, Y, W) {
                        var T = this;
                        void 0 === u && (u = 1),
                            void 0 === Y && (Y = 2),
                            void 0 === W && (W = 1),
                            GameMgr.Inst.BehavioralStatistics(14),
                            this.account_id = O,
                            this.enable = !0,
                            this.locking = !0,
                            this.root.y = this.origin_y,
                            this.player_data = null,
                            b.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                T.locking = !1
                            })),
                            this.detail_data.reset(),
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountStatisticInfo", {
                                account_id: O
                            }, function (u, Y) {
                                u || Y.error ? b.UIMgr.Inst.showNetReqError("fetchAccountStatisticInfo", u, Y) : b.UI_Shilian.now_season_info && 1001 == b.UI_Shilian.now_season_info.season_id && 3 != b.UI_Shilian.get_cur_season_state() ? (T.detail_data.setData(Y), T.changeMJCategory(T.tab_index, T.game_category, T.game_type)) : app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountChallengeRankInfo", {
                                    account_id: O
                                }, function (O, u) {
                                    O || u.error ? b.UIMgr.Inst.showNetReqError("fetchAccountChallengeRankInfo", O, u) : (Y.season_info = u.season_info, T.detail_data.setData(Y), T.changeMJCategory(T.tab_index, T.game_category, T.game_type))
                                })
                            }),
                            this.note.init_data(O),
                            this.refreshBaseInfo(),
                            this.btn_report.visible = O != GameMgr.Inst.account_id,
                            this.tab_index = u,
                            this.game_category = Y,
                            this.game_type = W,
                            this.container_info.visible = !0,
                            this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_note.skin = this.tab_img_dark,
                            this.note.close(),
                            this.tab_note.visible = "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type,
                            this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                    },
                    u.prototype.refreshBaseInfo = function () {
                        var O = this;
                        this.title.id = 0,
                            this.illust.me.visible = !1,
                            game.Tools.SetNickname(this.name, {
                                account_id: 0,
                                nickname: "",
                                verified: 0
                            }),
                            this.btn_addfriend.visible = !1,
                            this.btn_report.x = 343,
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountInfo", {
                                account_id: this.account_id
                            }, function (u, Y) {
                                if (u || Y.error)
                                    b.UIMgr.Inst.showNetReqError("fetchAccountInfo", u, Y);
                                else {
                                    var W = Y.account;
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (W.account_id == GameMgr.Inst.account_id) {
                                        W.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            W.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            W.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    O.player_data = W,
                                        game.Tools.SetNickname(O.name, W),
                                        O.title.id = game.Tools.titleLocalization(W.account_id, W.title),
                                        O.level.id = W.level.id,
                                        O.level.id = O.player_data[1 == O.tab_index ? "level" : "level3"].id,
                                        O.level.exp = O.player_data[1 == O.tab_index ? "level" : "level3"].score,
                                        O.illust.me.visible = !0,
                                        O.account_id == GameMgr.Inst.account_id ? O.illust.setSkin(W.avatar_id, "waitingroom") : O.illust.setSkin(game.GameUtility.get_limited_skin_id(W.avatar_id), "waitingroom"),
                                        game.Tools.is_same_zone(GameMgr.Inst.account_id, O.account_id) && O.account_id != GameMgr.Inst.account_id && null == game.FriendMgr.find(O.account_id) ? (O.btn_addfriend.visible = !0, O.btn_report.x = 520) : (O.btn_addfriend.visible = !1, O.btn_report.x = 343),
                                        O.note.sign.setSign(W.signature),
                                        O.achievement_data.show(!1, W.achievement_count)
                                }
                            })
                    },
                    u.prototype.changeMJCategory = function (b, O, u) {
                        void 0 === O && (O = 2),
                            void 0 === u && (u = 1),
                            this.tab_index = b,
                            this.container_info.visible = !0,
                            this.detail_data.changeMJCategory(b, O, u),
                            this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_note.skin = this.tab_img_dark,
                            this.note.close(),
                            this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                    },
                    u.prototype.close = function () {
                        var O = this;
                        this.enable && (this.locking || (this.locking = !0, this.detail_data.close(), b.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                            O.locking = !1,
                                O.enable = !1
                        }))))
                    },
                    u.prototype.onEnable = function () {
                        game.TempImageMgr.setUIEnable("UI_OtherPlayerInfo", !0)
                    },
                    u.prototype.onDisable = function () {
                        game.TempImageMgr.setUIEnable("UI_OtherPlayerInfo", !1),
                            this.detail_data.close(),
                            this.illust.clear(),
                            Laya.loader.clearTextureRes(this.level.icon.skin)
                    },
                    u.Inst = null,
                    u
            }
                (b.UIBase);
            b.UI_OtherPlayerInfo = O
        }
            (uiscript || (uiscript = {}));


        // 宿舍相关
        !function (b) {
            var O = function () {
                function O(O, Y) {
                    var W = this;
                    this._scale = 1,
                        this.during_move = !1,
                        this.mouse_start_x = 0,
                        this.mouse_start_y = 0,
                        this.me = O,
                        this.container_illust = Y,
                        this.illust = this.container_illust.getChildByName("illust"),
                        this.container_move = O.getChildByName("move"),
                        this.container_move.on("mousedown", this, function () {
                            W.during_move = !0,
                                W.mouse_start_x = W.container_move.mouseX,
                                W.mouse_start_y = W.container_move.mouseY
                        }),
                        this.container_move.on("mousemove", this, function () {
                            W.during_move && (W.move(W.container_move.mouseX - W.mouse_start_x, W.container_move.mouseY - W.mouse_start_y), W.mouse_start_x = W.container_move.mouseX, W.mouse_start_y = W.container_move.mouseY)
                        }),
                        this.container_move.on("mouseup", this, function () {
                            W.during_move = !1
                        }),
                        this.container_move.on("mouseout", this, function () {
                            W.during_move = !1
                        }),
                        this.btn_big = O.getChildByName("btn_big"),
                        this.btn_big.clickHandler = Laya.Handler.create(this, function () {
                            W.locking || W.bigger()
                        }, null, !1),
                        this.btn_small = O.getChildByName("btn_small"),
                        this.btn_small.clickHandler = Laya.Handler.create(this, function () {
                            W.locking || W.smaller()
                        }, null, !1),
                        this.btn_close = O.getChildByName("btn_close"),
                        this.btn_close.clickHandler = Laya.Handler.create(this, function () {
                            W.locking || W.close()
                        }, null, !1),
                        this.scrollbar = O.getChildByName("scrollbar").scriptMap["capsui.CScrollBar"],
                        this.scrollbar.init(new Laya.Handler(this, function (b) {
                            W._scale = 1 * (1 - b) + .5,
                                W.illust.scaleX = W._scale,
                                W.illust.scaleY = W._scale,
                                W.scrollbar.setVal(b, 0)
                        })),
                        this.dongtai_kaiguan = new b.UI_Dongtai_Kaiguan(this.me.getChildByName("dongtai"), new Laya.Handler(this, function () {
                            u.Inst.illust.resetSkin()
                        }), new Laya.Handler(this, function (b) {
                            u.Inst.illust.playAnim(b)
                        }))
                }
                return Object.defineProperty(O.prototype, "scale", {
                    get: function () {
                        return this._scale
                    },
                    set: function (b) {
                        this._scale = b,
                            this.scrollbar.setVal(1 - (b - .5) / 1, 0)
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    O.prototype.show = function (O) {
                        var Y = this;
                        this.locking = !0,
                            this.when_close = O,
                            this.illust_start_x = this.illust.x,
                            this.illust_start_y = this.illust.y,
                            this.illust_center_x = this.illust.x + 984 - 446,
                            this.illust_center_y = this.illust.y + 11 - 84,
                            this.container_illust.getChildByName("container_name").visible = !1,
                            this.container_illust.getChildByName("container_name_en").visible = !1,
                            this.container_illust.getChildByName("btn").visible = !1,
                            u.Inst.stopsay(),
                            this.scale = 1,
                            Laya.Tween.to(this.illust, {
                                x: this.illust_center_x,
                                y: this.illust_center_y
                            }, 200),
                            b.UIBase.anim_pop_out(this.btn_big, null),
                            b.UIBase.anim_pop_out(this.btn_small, null),
                            b.UIBase.anim_pop_out(this.btn_close, null),
                            this.during_move = !1,
                            Laya.timer.once(250, this, function () {
                                Y.locking = !1
                            }),
                            this.me.visible = !0,
                            this.dongtai_kaiguan.refresh(u.Inst.illust.skin_id)
                    },
                    O.prototype.close = function () {
                        var O = this;
                        this.locking = !0,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? this.container_illust.getChildByName("container_name").visible = !0 : this.container_illust.getChildByName("container_name_en").visible = !0,
                            this.container_illust.getChildByName("btn").visible = !0,
                            Laya.Tween.to(this.illust, {
                                x: this.illust_start_x,
                                y: this.illust_start_y,
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            b.UIBase.anim_pop_hide(this.btn_big, null),
                            b.UIBase.anim_pop_hide(this.btn_small, null),
                            b.UIBase.anim_pop_hide(this.btn_close, null),
                            Laya.timer.once(250, this, function () {
                                O.locking = !1,
                                    O.me.visible = !1,
                                    O.when_close.run()
                            })
                    },
                    O.prototype.bigger = function () {
                        1.1 * this.scale > 1.5 ? this.scale = 1.5 : this.scale *= 1.1,
                            Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0)
                    },
                    O.prototype.smaller = function () {
                        this.scale / 1.1 < .5 ? this.scale = .5 : this.scale /= 1.1,
                            Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0)
                    },
                    O.prototype.move = function (b, O) {
                        var u = this.illust.x + b,
                            Y = this.illust.y + O;
                        u < this.illust_center_x - 600 ? u = this.illust_center_x - 600 : u > this.illust_center_x + 600 && (u = this.illust_center_x + 600),
                            Y < this.illust_center_y - 1200 ? Y = this.illust_center_y - 1200 : Y > this.illust_center_y + 800 && (Y = this.illust_center_y + 800),
                            this.illust.x = u,
                            this.illust.y = Y
                    },
                    O
            }
                (),
                u = function (u) {
                    function Y() {
                        var b = u.call(this, new ui.lobby.susheUI) || this;
                        return b.contianer_illust = null,
                            b.illust = null,
                            b.illust_rect = null,
                            b.container_name = null,
                            b.label_name = null,
                            b.label_cv = null,
                            b.label_cv_title = null,
                            b.container_page = null,
                            b.container_look_illust = null,
                            b.page_select_character = null,
                            b.page_visit_character = null,
                            b.origin_illust_x = 0,
                            b.chat_id = 0,
                            b.container_chat = null,
                            b._select_index = 0,
                            b.sound_channel = null,
                            b.chat_block = null,
                            b.illust_showing = !0,
                            Y.Inst = b,
                            b
                    }
                    return __extends(Y, u),
                        Y.init = function (O) {
                            var u = this;
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchCharacterInfo", {}, function (W, T) {
                                if (W || T.error)
                                    b.UIMgr.Inst.showNetReqError("fetchCharacterInfo", W, T);
                                else {
                                    if (app.Log.log("fetchCharacterInfo: " + JSON.stringify(T)), T = JSON.parse(JSON.stringify(T)), T.main_character_id && T.characters) {
                                        //if (u.characters = [], T.characters)
                                        //    for (var D = 0; D < T.characters.length; D++)
                                        //        u.characters.push(T.characters[D]);
                                        //if (u.skin_map = {}, T.skins)
                                        //    for (var D = 0; D < T.skins.length; D++)
                                        //        u.skin_map[T.skins[D]] = 1;
                                        //u.main_character_id = T.main_character_id
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        u.characters = [];
                                        for (var j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                            var id = 200000 + j;
                                            var skin = 400001 + j * 100;
                                            u.characters.push({
                                                charid: id,
                                                level: 5,
                                                exp: 0,
                                                skin: skin,
                                                is_upgraded: 1,
                                                extra_emoji: ["10", "11", "12", "13", "14", "15", "16", "17", "888"]
                                            });
                                        }
                                        let skins = cfg.item_definition.skin['rows_'];
                                        for (let skinitem of skins) {
                                            uiscript.UI_Sushe.add_skin(skinitem['id']);
                                        }
                                        for (let skinitem in MMP.settings.characters) {
                                            uiscript.UI_Sushe.characters[skinitem].skin = MMP.settings.characters[skinitem];
                                        }
                                        u.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        // END
                                    } else
                                        u.characters = [], u.characters.push({
                                            charid: 200001,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: 400101,
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), u.characters.push({
                                            charid: 200002,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: 400201,
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), u.skin_map[400101] = 1, u.skin_map[400201] = 1, u.main_character_id = 200001;
                                    if (u.send_gift_count = 0, u.send_gift_limit = 0, T.send_gift_count && (u.send_gift_count = T.send_gift_count), T.send_gift_limit && (u.send_gift_limit = T.send_gift_limit), T.finished_endings)
                                        for (var D = 0; D < T.finished_endings.length; D++)
                                            u.finished_endings_map[T.finished_endings[D]] = 1;
                                    if (T.rewarded_endings)
                                        for (var D = 0; D < T.rewarded_endings.length; D++)
                                            u.rewarded_endings_map[T.rewarded_endings[D]] = 1;
                                    if (u.star_chars = [], T.character_sort && (u.star_chars = T.character_sort), Y.hidden_characters_map = {}, T.hidden_characters)
                                        for (var m = 0, i = T.hidden_characters; m < i.length; m++) {
                                            var o = i[m];
                                            Y.hidden_characters_map[o] = 1
                                        }
                                    O.run()
                                }
                            }),
                                //app.NetAgent.sendReq2Lobby("Lobby", "fetchAllCommonViews", {}, function (O, Y) {
                                //    if (O || Y.error)
                                //        b.UIMgr.Inst.showNetReqError("fetchAllCommonViews", O, Y);
                                //    else {
                                //        u.using_commonview_index = Y.use,
                                u.commonViewList = [[], [], [], [], [], [], [], []];
                            //        var W = Y.views;
                            //        if (W)
                            //            for (var T = 0; T < W.length; T++) {
                            //                var D = W[T].values;
                            //                D && (u.commonViewList[W[T].index] = D)
                            //            }
                            u.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst.load_mjp_view(),
                                GameMgr.Inst.load_touming_mjp_view()
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //})
                        },
                        Y.on_data_updata = function (O) {
                            if (O.character) {
                                var u = JSON.parse(JSON.stringify(O.character));
                                if (u.characters)
                                    for (var Y = u.characters, W = 0; W < Y.length; W++) {
                                        for (var T = !1, D = 0; D < this.characters.length; D++)
                                            if (this.characters[D].charid == Y[W].charid) {
                                                this.characters[D] = Y[W],
                                                    b.UI_Sushe_Visit.Inst && b.UI_Sushe_Visit.Inst.chara_info && b.UI_Sushe_Visit.Inst.chara_info.charid == this.characters[D].charid && (b.UI_Sushe_Visit.Inst.chara_info = this.characters[D]),
                                                    T = !0;
                                                break
                                            }
                                        T || this.characters.push(Y[W])
                                    }
                                if (u.skins) {
                                    for (var m = u.skins, W = 0; W < m.length; W++)
                                        this.skin_map[m[W]] = 1;
                                    b.UI_Bag.Inst.on_skin_change()
                                }
                                if (u.finished_endings) {
                                    for (var i = u.finished_endings, W = 0; W < i.length; W++)
                                        this.finished_endings_map[i[W]] = 1;
                                    b.UI_Sushe_Visit.Inst
                                }
                                if (u.rewarded_endings) {
                                    for (var i = u.rewarded_endings, W = 0; W < i.length; W++)
                                        this.rewarded_endings_map[i[W]] = 1;
                                    b.UI_Sushe_Visit.Inst
                                }
                            }
                        },
                        Y.chara_owned = function (b) {
                            for (var O = 0; O < this.characters.length; O++)
                                if (this.characters[O].charid == b)
                                    return !0;
                            return !1
                        },
                        Y.skin_owned = function (b) {
                            return this.skin_map.hasOwnProperty(b.toString())
                        },
                        Y.add_skin = function (b) {
                            this.skin_map[b] = 1
                        },
                        Object.defineProperty(Y, "main_chara_info", {
                            get: function () {
                                for (var b = 0; b < this.characters.length; b++)
                                    if (this.characters[b].charid == this.main_character_id)
                                        return this.characters[b];
                                return null
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Y.on_view_remove = function (b) {
                            for (var O = 0; O < this.commonViewList.length; O++)
                                for (var u = this.commonViewList[O], Y = 0; Y < u.length; Y++)
                                    if (u[Y].item_id == b) {
                                        u[Y].item_id = game.GameUtility.get_view_default_item_id(u[Y].slot);
                                        break
                                    }
                            var W = cfg.item_definition.item.get(b);
                            W.type == game.EView.head_frame && GameMgr.Inst.account_data.avatar_frame == b && (GameMgr.Inst.account_data.avatar_frame = game.GameUtility.get_view_default_item_id(game.EView.head_frame))
                        },
                        Y.add_finish_ending = function (b) {
                            this.finished_endings_map[b] = 1
                        },
                        Y.add_reward_ending = function (b) {
                            this.rewarded_endings_map[b] = 1
                        },
                        Y.check_all_char_repoint = function () {
                            for (var b = 0; b < Y.characters.length; b++)
                                if (this.check_char_redpoint(Y.characters[b]))
                                    return !0;
                            return !1
                        },
                        Y.check_char_redpoint = function (b) {
                            // 去除小红点
                            return 0;
                            // END
                            var O = cfg.spot.spot.getGroup(b.charid);
                            if (O)
                                for (var u = 0; u < O.length; u++) {
                                    var W = O[u];
                                    if (!(W.is_married && !b.is_upgraded || !W.is_married && b.level < W.level_limit) && 2 == W.type) {
                                        for (var T = !0, D = 0; D < W.jieju.length; D++)
                                            if (W.jieju[D] && Y.finished_endings_map[W.jieju[D]]) {
                                                if (!Y.rewarded_endings_map[W.jieju[D]])
                                                    return !0;
                                                T = !1
                                            }
                                        if (T)
                                            return !0
                                    }
                                }
                            return !1
                        },
                        Y.is_char_star = function (b) {
                            return -1 != this.star_chars.indexOf(b)
                        },
                        Y.change_char_star = function (b) {
                            var O = this.star_chars.indexOf(b);
                            -1 != O ? this.star_chars.splice(O, 1) : this.star_chars.push(b),
                                MMP.settings.star_chars = uiscript.UI_Sushe.star_chars,
                                MMP.saveSettings();
                            // 屏蔽网络请求
                            //    app.NetAgent.sendReq2Lobby("Lobby", "updateCharacterSort", {
                            //        sort: this.star_chars
                            //    }, function () { })
                            // END
                        },
                        Object.defineProperty(Y.prototype, "select_index", {
                            get: function () {
                                return this._select_index
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Y.prototype.reset_select_index = function () {
                            this._select_index = -1
                        },
                        Y.prototype.onCreate = function () {
                            var u = this;
                            this.contianer_illust = this.me.getChildByName("illust"),
                                this.illust = new b.UI_Character_Skin(this.contianer_illust.getChildByName("illust").getChildByName("illust")),
                                this.illust_rect = b.UIRect.CreateFromSprite(this.illust.me),
                                this.container_chat = this.contianer_illust.getChildByName("chat"),
                                this.chat_block = new b.UI_Character_Chat(this.container_chat),
                                this.contianer_illust.getChildByName("btn").clickHandler = Laya.Handler.create(this, function () {
                                    if (!u.page_visit_character.me.visible || !u.page_visit_character.cannot_click_say)
                                        if (u.illust.onClick(), u.sound_channel)
                                            u.stopsay();
                                        else {
                                            if (!u.illust_showing)
                                                return;
                                            u.say("lobby_normal")
                                        }
                                }, null, !1),
                                this.container_name = null,
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.container_name = this.contianer_illust.getChildByName("container_name"), this.contianer_illust.getChildByName("container_name_en").visible = !1, this.label_cv_title = this.container_name.getChildByName("label_CV_title")) : (this.container_name = this.contianer_illust.getChildByName("container_name_en"), this.contianer_illust.getChildByName("container_name").visible = !1),
                                this.label_name = this.container_name.getChildByName("label_name"),
                                this.label_cv = this.container_name.getChildByName("label_CV"),
                                this.origin_illust_x = this.contianer_illust.x,
                                this.container_page = this.me.getChildByName("container_page"),
                                this.page_select_character = new b.UI_Sushe_Select,
                                this.container_page.addChild(this.page_select_character.me),
                                this.page_visit_character = new b.UI_Sushe_Visit,
                                this.container_page.addChild(this.page_visit_character.me),
                                this.container_look_illust = new O(this.me.getChildByName("look_illust"), this.contianer_illust)
                        },
                        Y.prototype.show = function (b) {
                            GameMgr.Inst.BehavioralStatistics(15),
                                game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                this.enable = !0,
                                this.page_visit_character.me.visible = !1,
                                this.container_look_illust.me.visible = !1;
                            for (var O = 0, u = 0; u < Y.characters.length; u++)
                                if (Y.characters[u].charid == Y.main_character_id) {
                                    O = u;
                                    break
                                }
                            0 == b ? (this.change_select(O), this.show_page_select()) : (this._select_index = -1, this.illust_showing = !1, this.contianer_illust.visible = !1, this.page_select_character.show(1))
                        },
                        Y.prototype.starup_back = function () {
                            this.enable = !0,
                                this.change_select(this._select_index),
                                this.page_visit_character.star_up_back(Y.characters[this._select_index]),
                                this.page_visit_character.show_levelup()
                        },
                        Y.prototype.spot_back = function () {
                            this.enable = !0,
                                this.change_select(this._select_index),
                                this.page_visit_character.show(Y.characters[this._select_index], 2)
                        },
                        Y.prototype.go2Lobby = function () {
                            this.close(Laya.Handler.create(this, function () {
                                b.UIMgr.Inst.showLobby()
                            }))
                        },
                        Y.prototype.close = function (O) {
                            var u = this;
                            this.illust_showing && b.UIBase.anim_alpha_out(this.contianer_illust, {
                                x: -30
                            }, 150, 0),
                                Laya.timer.once(150, this, function () {
                                    u.enable = !1,
                                        O && O.run()
                                })
                        },
                        Y.prototype.onDisable = function () {
                            view.AudioMgr.refresh_music_volume(!1),
                                this.illust.clear(),
                                this.stopsay(),
                                this.container_look_illust.me.visible && this.container_look_illust.close()
                        },
                        Y.prototype.hide_illust = function () {
                            var O = this;
                            this.illust_showing && (this.illust_showing = !1, b.UIBase.anim_alpha_out(this.contianer_illust, {
                                x: -30
                            }, 200, 0, Laya.Handler.create(this, function () {
                                O.contianer_illust.visible = !1
                            })))
                        },
                        Y.prototype.open_illust = function () {
                            if (!this.illust_showing)
                                if (this.illust_showing = !0, this._select_index >= 0)
                                    this.contianer_illust.visible = !0, this.contianer_illust.alpha = 1, b.UIBase.anim_alpha_in(this.contianer_illust, {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var O = 0, u = 0; u < Y.characters.length; u++)
                                        if (Y.characters[u].charid == Y.main_character_id) {
                                            O = u;
                                            break
                                        }
                                    this.change_select(O)
                                }
                        },
                        Y.prototype.show_page_select = function () {
                            this.page_select_character.show(0)
                        },
                        Y.prototype.show_page_visit = function (b) {
                            void 0 === b && (b = 0),
                                this.page_visit_character.show(Y.characters[this._select_index], b)
                        },
                        Y.prototype.change_select = function (O) {
                            this._select_index = O,
                                this.illust.clear(),
                                this.illust_showing = !0;
                            var u = Y.characters[O];
                            this.label_name.text = "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? cfg.item_definition.character.get(u.charid)["name_" + GameMgr.client_language].replace("-", "|") : cfg.item_definition.character.get(u.charid)["name_" + GameMgr.client_language],
                                "chs" == GameMgr.client_language && (this.label_name.font = -1 != Y.chs_fengyu_name_lst.indexOf(u.charid) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.label_cv.text = cfg.item_definition.character.get(u.charid)["desc_cv_" + GameMgr.client_language], this.label_cv_title.text = "CV") : this.label_cv.text = "CV:" + cfg.item_definition.character.get(u.charid)["desc_cv_" + GameMgr.client_language],
                                "chs" == GameMgr.client_language && (this.label_cv.font = -1 != Y.chs_fengyu_cv_lst.indexOf(u.charid) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language) && (this.label_cv_title.y = 355 - this.label_cv.textField.textHeight / 2 * .7);
                            var W = new b.UIRect;
                            W.x = this.illust_rect.x,
                                W.y = this.illust_rect.y,
                                W.width = this.illust_rect.width,
                                W.height = this.illust_rect.height,
                                405503 == u.skin && (W.y -= 70),
                                this.illust.setRect(W),
                                this.illust.setSkin(u.skin, "full"),
                                this.contianer_illust.visible = !0,
                                Laya.Tween.clearAll(this.contianer_illust),
                                this.contianer_illust.x = this.origin_illust_x,
                                this.contianer_illust.alpha = 1,
                                b.UIBase.anim_alpha_in(this.contianer_illust, {
                                    x: -30
                                }, 230),
                                this.stopsay();
                            var T = cfg.item_definition.skin.get(u.skin);
                            T.spine_type ? (this.page_select_character.changeKaiguanShow(!0), this.container_look_illust.dongtai_kaiguan.show(this.illust.skin_id)) : (this.page_select_character.changeKaiguanShow(!1), this.container_look_illust.dongtai_kaiguan.hide())
                        },
                        Y.prototype.onChangeSkin = function (b) {
                            Y.characters[this._select_index].skin = b,
                                this.change_select(this._select_index),
                                Y.characters[this._select_index].charid == Y.main_character_id && (GameMgr.Inst.account_data.avatar_id = b),
                                // 屏蔽换肤请求
                                //app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                //    character_id: Y.characters[this._select_index].charid,
                                //    skin: b
                                //}, function () {})
                                // 保存皮肤
                                MMP.settings.characters[this._select_index] = b;
                            MMP.saveSettings();
                            // END
                        },
                        Y.prototype.say = function (b) {
                            var O = this,
                                u = Y.characters[this._select_index];
                            this.chat_id++;
                            var W = this.chat_id,
                                T = view.AudioMgr.PlayCharactorSound(u, b, Laya.Handler.create(this, function () {
                                    Laya.timer.once(1e3, O, function () {
                                        W == O.chat_id && O.stopsay()
                                    })
                                }));
                            T && (this.chat_block.show(T.words), this.sound_channel = T.sound)
                        },
                        Y.prototype.stopsay = function () {
                            this.chat_block.close(!1),
                                this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null)
                        },
                        Y.prototype.to_look_illust = function () {
                            var b = this;
                            this.container_look_illust.show(Laya.Handler.create(this, function () {
                                b.illust.playAnim("idle"),
                                    b.page_select_character.show(0)
                            }))
                        },
                        Y.prototype.jump_to_char_skin = function (O, u) {
                            var W = this;
                            if (void 0 === O && (O = -1), void 0 === u && (u = null), O >= 0)
                                for (var T = 0; T < Y.characters.length; T++)
                                    if (Y.characters[T].charid == O) {
                                        this.change_select(T);
                                        break
                                    }
                            b.UI_Sushe_Select.Inst.close(Laya.Handler.create(this, function () {
                                Y.Inst.show_page_visit(),
                                    W.page_visit_character.show_pop_skin(),
                                    W.page_visit_character.set_jump_callback(u)
                            }))
                        },
                        Y.prototype.jump_to_char_qiyue = function (O) {
                            var u = this;
                            if (void 0 === O && (O = -1), O >= 0)
                                for (var W = 0; W < Y.characters.length; W++)
                                    if (Y.characters[W].charid == O) {
                                        this.change_select(W);
                                        break
                                    }
                            b.UI_Sushe_Select.Inst.close(Laya.Handler.create(this, function () {
                                Y.Inst.show_page_visit(),
                                    u.page_visit_character.show_qiyue()
                            }))
                        },
                        Y.characters = [],
                        Y.chs_fengyu_name_lst = [200040, 200043],
                        Y.chs_fengyu_cv_lst = [200047, 200050, 200054],
                        Y.skin_map = {},
                        Y.main_character_id = 0,
                        Y.send_gift_count = 0,
                        Y.send_gift_limit = 0,
                        Y.commonViewList = [],
                        Y.using_commonview_index = 0,
                        Y.finished_endings_map = {},
                        Y.rewarded_endings_map = {},
                        Y.star_chars = [],
                        Y.hidden_characters_map = {},
                        Y.Inst = null,
                        Y
                }
                    (b.UIBase);
            b.UI_Sushe = u
        }
            (uiscript || (uiscript = {}));


        // 屏蔽改变宿舍角色的网络请求
        !function (b) {
            var O = function () {
                function O(O) {
                    var Y = this;
                    this.scrollview = null,
                        this.select_index = 0,
                        this.show_index_list = [],
                        this.only_show_star_char = !1,
                        this.me = O,
                        this.me.getChildByName("btn_visit").clickHandler = Laya.Handler.create(this, function () {
                            u.Inst.locking || u.Inst.close(Laya.Handler.create(Y, function () {
                                b.UI_Sushe.Inst.show_page_visit()
                            }))
                        }, null, !1),
                        this.me.getChildByName("btn_look").clickHandler = Laya.Handler.create(this, function () {
                            u.Inst.locking || u.Inst.close(Laya.Handler.create(Y, function () {
                                b.UI_Sushe.Inst.to_look_illust()
                            }))
                        }, null, !1),
                        this.me.getChildByName("btn_huanzhuang").clickHandler = Laya.Handler.create(this, function () {
                            u.Inst.locking || b.UI_Sushe.Inst.jump_to_char_skin()
                        }, null, !1),
                        this.me.getChildByName("btn_star").clickHandler = Laya.Handler.create(this, function () {
                            u.Inst.locking || Y.onChangeStarShowBtnClick()
                        }, null, !1),
                        this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                        this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3),
                        this.scrollview.setElastic(),
                        this.dongtai_kaiguan = new b.UI_Dongtai_Kaiguan(this.me.getChildByName("dongtai"), new Laya.Handler(this, function () {
                            b.UI_Sushe.Inst.illust.resetSkin()
                        }))
                }
                return O.prototype.show = function (O, u) {
                    void 0 === u && (u = !1),
                        this.me.visible = !0,
                        O ? this.me.alpha = 1 : b.UIBase.anim_alpha_in(this.me, {
                            x: 0
                        }, 200, 0),
                        this.getShowStarState(),
                        this.sortShowCharsList(),
                        u || (this.me.getChildByName("btn_star").getChildAt(1).x = this.only_show_star_char ? 107 : 47),
                        this.scrollview.reset(),
                        this.scrollview.addItem(this.show_index_list.length)
                },
                    O.prototype.render_character_cell = function (O) {
                        var u = this,
                            Y = O.index,
                            W = O.container,
                            T = O.cache_data;
                        W.visible = !0,
                            T.index = Y,
                            T.inited || (T.inited = !0, W.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                u.onClickAtHead(T.index)
                            }), T.skin = new b.UI_Character_Skin(W.getChildByName("btn").getChildByName("head")), T.bg = W.getChildByName("btn").getChildByName("bg"), T.bound = W.getChildByName("btn").getChildByName("bound"), T.btn_star = W.getChildByName("btn_star"), T.star = W.getChildByName("btn").getChildByName("star"), T.btn_star.clickHandler = new Laya.Handler(this, function () {
                                u.onClickAtStar(T.index)
                            }));
                        var D = W.getChildByName("btn");
                        D.getChildByName("choose").visible = Y == this.select_index;
                        var m = this.getCharInfoByIndex(Y);
                        D.getChildByName("redpoint").visible = b.UI_Sushe.check_char_redpoint(m),
                            T.skin.setSkin(m.skin, "bighead"),
                            D.getChildByName("using").visible = m.charid == b.UI_Sushe.main_character_id,
                            W.getChildByName("btn").getChildByName("bg").skin = game.Tools.localUISrc("myres/sushe/bg_head" + (m.is_upgraded ? "2.png" : ".png"));
                        var i = cfg.item_definition.character.get(m.charid);
                        "en" == GameMgr.client_language || "jp" == GameMgr.client_language || "kr" == GameMgr.client_language ? T.bound.skin = i.ur ? game.Tools.localUISrc("myres/sushe/bg_head_bound" + (m.is_upgraded ? "4.png" : "3.png")) : game.Tools.localUISrc("myres/sushe/en_head_bound" + (m.is_upgraded ? "2.png" : ".png")) : i.ur ? (T.bound.pos(-10, -2), T.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (m.is_upgraded ? "6.png" : "5.png"))) : (T.bound.pos(4, 20), T.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (m.is_upgraded ? "4.png" : "3.png"))),
                            T.btn_star.visible = this.select_index == Y,
                            T.star.visible = b.UI_Sushe.is_char_star(m.charid) || this.select_index == Y,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (T.star.skin = game.Tools.localUISrc("myres/sushe/tag_star_" + (b.UI_Sushe.is_char_star(m.charid) ? "l" : "d") + (m.is_upgraded ? "1.png" : ".png")), D.getChildByName("label_name").text = cfg.item_definition.character.find(m.charid)["name_" + GameMgr.client_language].replace("-", "|")) : (T.star.skin = game.Tools.localUISrc("myres/sushe/tag_star_" + (b.UI_Sushe.is_char_star(m.charid) ? "l.png" : "d.png")), D.getChildByName("label_name").text = cfg.item_definition.character.find(m.charid)["name_" + GameMgr.client_language]),
                            ("chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language) && (200041 == m.charid ? (D.getChildByName("label_name").scaleX = .67, D.getChildByName("label_name").scaleY = .57) : (D.getChildByName("label_name").scaleX = .7, D.getChildByName("label_name").scaleY = .6))
                    },
                    O.prototype.onClickAtHead = function (O) {
                        if (this.select_index == O) {
                            var u = this.getCharInfoByIndex(O);
                            if (u.charid != b.UI_Sushe.main_character_id)
                                if (b.UI_PiPeiYuYue.Inst.enable)
                                    b.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(2769));
                                else {
                                    var Y = b.UI_Sushe.main_character_id;
                                    b.UI_Sushe.main_character_id = u.charid,
                                        //app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                        //    character_id: b.UI_Sushe.main_character_id
                                        //}, function () {}),
                                        GameMgr.Inst.account_data.avatar_id = u.skin;
                                    // 保存人物和皮肤
                                    MMP.settings.character = u.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = u.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var W = 0; W < this.show_index_list.length; W++)
                                        this.getCharInfoByIndex(W).charid == Y && this.scrollview.wantToRefreshItem(W);
                                    this.scrollview.wantToRefreshItem(O)
                                }
                        } else {
                            var T = this.select_index;
                            this.select_index = O,
                                T >= 0 && this.scrollview.wantToRefreshItem(T),
                                this.scrollview.wantToRefreshItem(O),
                                b.UI_Sushe.Inst.change_select(this.show_index_list[O])
                        }
                    },
                    O.prototype.onClickAtStar = function (O) {
                        if (b.UI_Sushe.change_char_star(this.getCharInfoByIndex(O).charid), this.only_show_star_char)
                            this.scrollview.wantToRefreshItem(O);
                        else if (this.show(!0), Math.floor(this.show_index_list.length / 3) - 3 > 0) {
                            var u = (Math.floor(this.select_index / 3) - 1) / (Math.floor(this.show_index_list.length / 3) - 3);
                            this.scrollview.rate = Math.min(1, Math.max(0, u))
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    O.prototype.close = function (O) {
                        var u = this;
                        this.me.visible && (O ? this.me.visible = !1 : b.UIBase.anim_alpha_out(this.me, {
                            x: 0
                        }, 200, 0, Laya.Handler.create(this, function () {
                            u.me.visible = !1
                        })))
                    },
                    O.prototype.onChangeStarShowBtnClick = function () {
                        if (!this.only_show_star_char) {
                            for (var O = !1, u = 0, Y = b.UI_Sushe.star_chars; u < Y.length; u++) {
                                var W = Y[u];
                                if (!b.UI_Sushe.hidden_characters_map[W]) {
                                    O = !0;
                                    break
                                }
                            }
                            if (!O)
                                return b.UI_SecondConfirm.Inst.show_only_confirm(game.Tools.strOfLocalization(3301)), void 0
                        }
                        b.UI_Sushe.Inst.change_select(this.show_index_list.length > 0 ? this.show_index_list[0] : 0),
                            this.only_show_star_char = !this.only_show_star_char,
                            app.PlayerBehaviorStatistic.update_val(app.EBehaviorType.Chara_Show_Star, this.only_show_star_char ? 1 : 0);
                        var T = this.me.getChildByName("btn_star").getChildAt(1);
                        Laya.Tween.clearAll(T),
                            Laya.Tween.to(T, {
                                x: this.only_show_star_char ? 107 : 47
                            }, 150),
                            this.show(!0, !0)
                    },
                    O.prototype.getShowStarState = function () {
                        if (0 == b.UI_Sushe.star_chars.length)
                            return this.only_show_star_char = !1, void 0;
                        if (this.only_show_star_char = 1 == app.PlayerBehaviorStatistic.get_val(app.EBehaviorType.Chara_Show_Star), this.only_show_star_char) {
                            for (var O = 0, u = b.UI_Sushe.star_chars; O < u.length; O++) {
                                var Y = u[O];
                                if (!b.UI_Sushe.hidden_characters_map[Y])
                                    return
                            }
                            this.only_show_star_char = !1,
                                app.PlayerBehaviorStatistic.update_val(app.EBehaviorType.Chara_Show_Star, 0)
                        }
                    },
                    O.prototype.sortShowCharsList = function () {
                        this.show_index_list = [],
                            this.select_index = -1;
                        for (var O = 0, u = b.UI_Sushe.star_chars; O < u.length; O++) {
                            var Y = u[O];
                            if (!b.UI_Sushe.hidden_characters_map[Y])
                                for (var W = 0; W < b.UI_Sushe.characters.length; W++)
                                    if (b.UI_Sushe.characters[W].charid == Y) {
                                        W == b.UI_Sushe.Inst.select_index && (this.select_index = this.show_index_list.length),
                                            this.show_index_list.push(W);
                                        break
                                    }
                        }
                        if (!this.only_show_star_char)
                            for (var W = 0; W < b.UI_Sushe.characters.length; W++)
                                b.UI_Sushe.hidden_characters_map[b.UI_Sushe.characters[W].charid] || -1 == this.show_index_list.indexOf(W) && (W == b.UI_Sushe.Inst.select_index && (this.select_index = this.show_index_list.length), this.show_index_list.push(W))
                    },
                    O.prototype.getCharInfoByIndex = function (O) {
                        return b.UI_Sushe.characters[this.show_index_list[O]]
                    },
                    O
            }
                (),
                u = function (u) {
                    function Y() {
                        var b = u.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.lobby.sushe_selectUI : new ui.lobby.sushe_select_enUI) || this;
                        return b.bg_width_head = 962,
                            b.bg_width_zhuangban = 1819,
                            b.bg2_delta = -29,
                            b.container_top = null,
                            b.locking = !1,
                            b.tabs = [],
                            b.tab_index = 0,
                            Y.Inst = b,
                            b
                    }
                    return __extends(Y, u),
                        Y.prototype.onCreate = function () {
                            var u = this;
                            this.container_top = this.me.getChildByName("top"),
                                this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                    u.locking || (1 == u.tab_index && u.container_zhuangban.changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(u, function () {
                                        u.close(),
                                            b.UI_Sushe.Inst.go2Lobby()
                                    }), null) : (u.close(), b.UI_Sushe.Inst.go2Lobby()))
                                }, null, !1),
                                this.root = this.me.getChildByName("root"),
                                this.bg2 = this.root.getChildByName("bg2"),
                                this.bg = this.root.getChildByName("bg");
                            for (var Y = this.root.getChildByName("container_tabs"), W = function (O) {
                                T.tabs.push(Y.getChildAt(O)),
                                    T.tabs[O].clickHandler = new Laya.Handler(T, function () {
                                        u.locking || u.tab_index != O && (1 == u.tab_index && u.container_zhuangban.changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(u, function () {
                                            u.change_tab(O)
                                        }), null) : u.change_tab(O))
                                    })
                            }, T = this, D = 0; D < Y.numChildren; D++)
                                W(D);
                            this.container_head = new O(this.root.getChildByName("container_heads")),
                                this.container_zhuangban = new b.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                    return u.locking
                                }))
                        },
                        Y.prototype.show = function (O) {
                            var u = this;
                            this.enable = !0,
                                this.locking = !0,
                                this.container_head.dongtai_kaiguan.refresh(),
                                this.tab_index = O,
                                0 == this.tab_index ? (this.bg.width = this.bg_width_head, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.close(!0), this.container_head.show(!0), b.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200), b.UIBase.anim_alpha_in(this.root, {
                                    x: 30
                                }, 200)) : (this.bg.width = this.bg_width_zhuangban, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.show(!0), this.container_head.close(!0), b.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200), b.UIBase.anim_alpha_in(this.root, {
                                    y: 30
                                }, 200)),
                                Laya.timer.once(200, this, function () {
                                    u.locking = !1
                                });
                            for (var Y = 0; Y < this.tabs.length; Y++) {
                                var W = this.tabs[Y];
                                W.skin = game.Tools.localUISrc(Y == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var T = W.getChildByName("word");
                                T.color = Y == this.tab_index ? "#552c1c" : "#d3a86c",
                                    T.scaleX = T.scaleY = Y == this.tab_index ? 1.1 : 1,
                                    Y == this.tab_index && W.parent.setChildIndex(W, this.tabs.length - 1)
                            }
                        },
                        Y.prototype.change_tab = function (O) {
                            var u = this;
                            this.tab_index = O;
                            for (var Y = 0; Y < this.tabs.length; Y++) {
                                var W = this.tabs[Y];
                                W.skin = game.Tools.localUISrc(Y == O ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var T = W.getChildByName("word");
                                T.color = Y == O ? "#552c1c" : "#d3a86c",
                                    T.scaleX = T.scaleY = Y == O ? 1.1 : 1,
                                    Y == O && W.parent.setChildIndex(W, this.tabs.length - 1)
                            }
                            this.locking = !0,
                                0 == this.tab_index ? (this.container_zhuangban.close(!1), Laya.Tween.to(this.bg, {
                                    width: this.bg_width_head
                                }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                    b.UI_Sushe.Inst.open_illust(),
                                        u.container_head.show(!1)
                                })), Laya.Tween.to(this.bg2, {
                                    width: this.bg_width_head + this.bg2_delta
                                }, 200, Laya.Ease.strongOut)) : 1 == this.tab_index && (this.container_head.close(!1), b.UI_Sushe.Inst.hide_illust(), Laya.Tween.to(this.bg, {
                                    width: this.bg_width_zhuangban
                                }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                    u.container_zhuangban.show(!1)
                                })), Laya.Tween.to(this.bg2, {
                                    width: this.bg_width_zhuangban + this.bg2_delta
                                }, 200, Laya.Ease.strongOut)),
                                Laya.timer.once(400, this, function () {
                                    u.locking = !1
                                })
                        },
                        Y.prototype.close = function (O) {
                            var u = this;
                            this.locking = !0,
                                b.UIBase.anim_alpha_out(this.container_top, {
                                    y: -30
                                }, 150),
                                0 == this.tab_index ? b.UIBase.anim_alpha_out(this.root, {
                                    x: 30
                                }, 150, 0, Laya.Handler.create(this, function () {
                                    u.container_head.close(!0)
                                })) : b.UIBase.anim_alpha_out(this.root, {
                                    y: 30
                                }, 150, 0, Laya.Handler.create(this, function () {
                                    u.container_zhuangban.close(!0)
                                })),
                                Laya.timer.once(150, this, function () {
                                    u.locking = !1,
                                        u.enable = !1,
                                        O && O.run()
                                })
                        },
                        Y.prototype.onDisable = function () {
                            for (var O = 0; O < b.UI_Sushe.characters.length; O++) {
                                var u = b.UI_Sushe.characters[O].skin,
                                    Y = cfg.item_definition.skin.get(u);
                                Y && Laya.loader.clearTextureRes(game.LoadMgr.getResImageSkin(Y.path + "/bighead.png"))
                            }
                        },
                        Y.prototype.changeKaiguanShow = function (b) {
                            b ? this.container_head.dongtai_kaiguan.show() : this.container_head.dongtai_kaiguan.hide()
                        },
                        Y
                }
                    (b.UIBase);
            b.UI_Sushe_Select = u
        }
            (uiscript || (uiscript = {}));


        // 友人房
        !function (b) {
            var O = function () {
                function O(b) {
                    var O = this;
                    this.friends = [],
                        this.sortlist = [],
                        this.me = b,
                        this.me.visible = !1,
                        this.blackbg = b.getChildByName("blackbg"),
                        this.blackbg.clickHandler = Laya.Handler.create(this, function () {
                            O.locking || O.close()
                        }, null, !1),
                        this.root = b.getChildByName("root"),
                        this.scrollview = this.root.scriptMap["capsui.CScrollView"],
                        this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1)),
                        this.noinfo = this.root.getChildByName("noinfo")
                }
                return O.prototype.show = function () {
                    var O = this;
                    this.locking = !0,
                        this.me.visible = !0,
                        this.scrollview.reset(),
                        this.friends = [],
                        this.sortlist = [];
                    for (var u = game.FriendMgr.friend_list, Y = 0; Y < u.length; Y++)
                        this.sortlist.push(Y);
                    this.sortlist = this.sortlist.sort(function (b, O) {
                        var Y = u[b],
                            W = 0;
                        if (Y.state.is_online) {
                            var T = game.Tools.playState2Desc(Y.state.playing);
                            W += "" != T ? 3e10 : 6e10,
                                Y.base.level && (W += Y.base.level.id % 1e3 * 1e7),
                                Y.base.level3 && (W += Y.base.level3.id % 1e3 * 1e4),
                                W += -Math.floor(Y.state.login_time / 1e7)
                        } else
                            W += Y.state.logout_time;
                        var D = u[O],
                            m = 0;
                        if (D.state.is_online) {
                            var T = game.Tools.playState2Desc(D.state.playing);
                            m += "" != T ? 3e10 : 6e10,
                                D.base.level && (m += D.base.level.id % 1e3 * 1e7),
                                D.base.level3 && (m += D.base.level3.id % 1e3 * 1e4),
                                m += -Math.floor(D.state.login_time / 1e7)
                        } else
                            m += D.state.logout_time;
                        return m - W
                    });
                    for (var Y = 0; Y < u.length; Y++)
                        this.friends.push({
                            f: u[Y],
                            invited: !1
                        });
                    this.noinfo.visible = 0 == this.friends.length,
                        this.scrollview.addItem(this.friends.length),
                        b.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                            O.locking = !1
                        }))
                },
                    O.prototype.close = function () {
                        var O = this;
                        this.locking = !0,
                            b.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                O.locking = !1,
                                    O.me.visible = !1
                            }))
                    },
                    O.prototype.render_item = function (O) {
                        var u = O.index,
                            Y = O.container,
                            T = O.cache_data;
                        T.head || (T.head = new b.UI_Head(Y.getChildByName("head"), "UI_WaitingRoom"), T.name = Y.getChildByName("name"), T.state = Y.getChildByName("label_state"), T.btn = Y.getChildByName("btn_invite"), T.invited = Y.getChildByName("invited"));
                        var D = this.friends[this.sortlist[u]];
                        T.head.id = game.GameUtility.get_limited_skin_id(D.f.base.avatar_id),
                            T.head.set_head_frame(D.f.base.account_id, D.f.base.avatar_frame),
                            game.Tools.SetNickname(T.name, D.f.base);
                        var m = !1;
                        if (D.f.state.is_online) {
                            var i = game.Tools.playState2Desc(D.f.state.playing);
                            "" != i ? (T.state.text = game.Tools.strOfLocalization(2069, [i]), T.state.color = "#a9d94d", T.name.color = "#a9d94d") : (T.state.text = game.Tools.strOfLocalization(2071), T.state.color = "#58c4db", T.name.color = "#58c4db", m = !0)
                        } else
                            T.state.text = game.Tools.strOfLocalization(2072), T.state.color = "#8c8c8c", T.name.color = "#8c8c8c";
                        D.invited ? (T.btn.visible = !1, T.invited.visible = !0) : (T.btn.visible = !0, T.invited.visible = !1, game.Tools.setGrayDisable(T.btn, !m), m && (T.btn.clickHandler = Laya.Handler.create(this, function () {
                            game.Tools.setGrayDisable(T.btn, !0);
                            var O = {
                                room_id: W.Inst.room_id,
                                mode: W.Inst.room_mode,
                                nickname: GameMgr.Inst.account_data.nickname,
                                verified: GameMgr.Inst.account_data.verified,
                                account_id: GameMgr.Inst.account_id
                            };
                            app.NetAgent.sendReq2Lobby("Lobby", "sendClientMessage", {
                                target_id: D.f.base.account_id,
                                type: game.EFriendMsgType.room_invite,
                                content: JSON.stringify(O)
                            }, function (O, u) {
                                O || u.error ? (game.Tools.setGrayDisable(T.btn, !1), b.UIMgr.Inst.showNetReqError("sendClientMessage", O, u)) : (T.btn.visible = !1, T.invited.visible = !0, D.invited = !0)
                            })
                        }, null, !1)))
                    },
                    O
            }
                (),
                u = function () {
                    function O(O) {
                        var u = this;
                        this.tabs = [],
                            this.tab_index = 0,
                            this.me = O,
                            this.blackmask = this.me.getChildByName("blackmask"),
                            this.root = this.me.getChildByName("root"),
                            this.page_head = new b.zhuangban.Page_Waiting_Head(this.root.getChildByName("container_heads")),
                            this.page_zhangban = new b.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                return u.locking
                            }));
                        for (var Y = this.root.getChildByName("container_tabs"), W = function (O) {
                            T.tabs.push(Y.getChildAt(O)),
                                T.tabs[O].clickHandler = new Laya.Handler(T, function () {
                                    u.locking || u.tab_index != O && (1 == u.tab_index && u.page_zhangban.changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(u, function () {
                                        u.change_tab(O)
                                    }), null) : u.change_tab(O))
                                })
                        }, T = this, D = 0; D < Y.numChildren; D++)
                            W(D);
                        this.root.getChildByName("close").clickHandler = new Laya.Handler(this, function () {
                            u.locking || (1 == u.tab_index && u.page_zhangban.changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(u, function () {
                                u.close(!1)
                            }), null) : u.close(!1))
                        }),
                            this.root.getChildByName("btn_close").clickHandler = new Laya.Handler(this, function () {
                                u.locking || (1 == u.tab_index && u.page_zhangban.changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(u, function () {
                                    u.close(!1)
                                }), null) : u.close(!1))
                            })
                    }
                    return O.prototype.show = function () {
                        var O = this;
                        this.me.visible = !0,
                            this.blackmask.alpha = 0,
                            this.locking = !0,
                            Laya.Tween.to(this.blackmask, {
                                alpha: .3
                            }, 150),
                            b.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                O.locking = !1
                            })),
                            this.tab_index = 0,
                            this.page_zhangban.close(!0),
                            this.page_head.show(!0);
                        for (var u = 0; u < this.tabs.length; u++) {
                            var Y = this.tabs[u];
                            Y.skin = game.Tools.localUISrc(u == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                            var W = Y.getChildByName("word");
                            W.color = u == this.tab_index ? "#552c1c" : "#d3a86c",
                                W.scaleX = W.scaleY = u == this.tab_index ? 1.1 : 1,
                                u == this.tab_index && Y.parent.setChildIndex(Y, this.tabs.length - 1)
                        }
                    },
                        O.prototype.change_tab = function (b) {
                            var O = this;
                            this.tab_index = b;
                            for (var u = 0; u < this.tabs.length; u++) {
                                var Y = this.tabs[u];
                                Y.skin = game.Tools.localUISrc(u == b ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var W = Y.getChildByName("word");
                                W.color = u == b ? "#552c1c" : "#d3a86c",
                                    W.scaleX = W.scaleY = u == b ? 1.1 : 1,
                                    u == b && Y.parent.setChildIndex(Y, this.tabs.length - 1)
                            }
                            this.locking = !0,
                                0 == this.tab_index ? (this.page_zhangban.close(!1), Laya.timer.once(200, this, function () {
                                    O.page_head.show(!1)
                                })) : 1 == this.tab_index && (this.page_head.close(!1), Laya.timer.once(200, this, function () {
                                    O.page_zhangban.show(!1)
                                })),
                                Laya.timer.once(400, this, function () {
                                    O.locking = !1
                                })
                        },
                        O.prototype.close = function (O) {
                            var u = this;
                            //修改友人房间立绘
                            if (!(u.page_head.choosed_chara_index == 0 && u.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = u.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = u.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = u.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[u.page_head.choosed_chara_index] = u.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me.visible && (O ? (this.page_head.close(!0), this.page_zhangban.close(!0), this.me.visible = !1) : (app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                ready: W.Inst.owner_id == GameMgr.Inst.account_id ? !0 : !1,
                                dressing: !1
                            }, function () { }), this.locking = !0, this.page_head.close(!1), this.page_zhangban.close(!1), b.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                u.locking = !1,
                                    u.me.visible = !1
                            }))))
                        },
                        O
                }
                    (),
                Y = function () {
                    function b(b) {
                        this.modes = [],
                            this.me = b,
                            this.bg = this.me.getChildByName("bg"),
                            this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_item))
                    }
                    return b.prototype.show = function (b) {
                        this.me.visible = !0,
                            this.scrollview.reset(),
                            this.modes = b,
                            this.scrollview.addItem(b.length);
                        var O = this.scrollview.total_height;
                        O > 380 ? (this.scrollview._content.y = 10, this.bg.height = 400) : (this.scrollview._content.y = 390 - O, this.bg.height = O + 20),
                            this.bg.visible = !0
                    },
                        b.prototype.render_item = function (b) {
                            var O = b.index,
                                u = b.container,
                                Y = u.getChildByName("info");
                            Y.fontSize = 40,
                                Y.fontSize = this.modes[O].length <= 5 ? 40 : this.modes[O].length <= 9 ? 55 - 3 * this.modes[O].length : 28,
                                Y.text = this.modes[O]
                        },
                        b
                }
                    (),
                W = function (W) {
                    function T() {
                        var O = W.call(this, new ui.lobby.waitingroomUI) || this;
                        return O.skin_ready = "myres/room/btn_ready.png",
                            O.skin_cancel = "myres/room/btn_cancel.png",
                            O.skin_start = "myres/room/btn_start.png",
                            O.skin_start_no = "myres/room/btn_start_no.png",
                            O.update_seq = 0,
                            O.pre_msgs = [],
                            O.msg_tail = -1,
                            O.posted = !1,
                            O.label_rommid = null,
                            O.player_cells = [],
                            O.btn_ok = null,
                            O.btn_invite_friend = null,
                            O.btn_add_robot = null,
                            O.btn_dress = null,
                            O.beReady = !1,
                            O.room_id = -1,
                            O.owner_id = -1,
                            O.tournament_id = 0,
                            O.max_player_count = 0,
                            O.players = [],
                            O.container_rules = null,
                            O.container_top = null,
                            O.container_right = null,
                            O.locking = !1,
                            O.mousein_copy = !1,
                            O.popout = null,
                            O.room_link = null,
                            O.btn_copy_link = null,
                            O.last_start_room = 0,
                            O.invitefriend = null,
                            O.pre_choose = null,
                            O.ai_name = game.Tools.strOfLocalization(2003),
                            T.Inst = O,
                            app.NetAgent.AddListener2Lobby("NotifyRoomPlayerReady", Laya.Handler.create(O, function (b) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON.stringify(b)),
                                    O.onReadyChange(b.account_id, b.ready, b.dressing)
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomPlayerUpdate", Laya.Handler.create(O, function (b) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON.stringify(b)),
                                    O.onPlayerChange(b)
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomGameStart", Laya.Handler.create(O, function (b) {
                                O.enable && (app.Log.log("NotifyRoomGameStart:" + JSON.stringify(b)), GameMgr.Inst.onPipeiYuyueSuccess(0, "youren"), O.onGameStart(b))
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomKickOut", Laya.Handler.create(O, function (b) {
                                app.Log.log("NotifyRoomKickOut:" + JSON.stringify(b)),
                                    O.onBeKictOut()
                            })),
                            game.LobbyNetMgr.Inst.add_connect_listener(Laya.Handler.create(O, function () {
                                O.enable && O.hide(Laya.Handler.create(O, function () {
                                    b.UI_Lobby.Inst.enable = !0
                                }))
                            }, null, !1)),
                            O
                    }
                    return __extends(T, W),
                        T.prototype.push_msg = function (b) {
                            this.pre_msgs.length < 15 ? this.pre_msgs.push(JSON.parse(b)) : (this.msg_tail = (this.msg_tail + 1) % this.pre_msgs.length, this.pre_msgs[this.msg_tail] = JSON.parse(b))
                        },
                        Object.defineProperty(T.prototype, "inRoom", {
                            get: function () {
                                return -1 != this.room_id
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object.defineProperty(T.prototype, "robot_count", {
                            get: function () {
                                for (var b = 0, O = 0; O < this.players.length; O++)
                                    2 == this.players[O].category && b++;
                                return b
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        T.prototype.resetData = function () {
                            this.room_id = -1,
                                this.owner_id = -1,
                                this.room_mode = {},
                                this.max_player_count = 0,
                                this.players = []
                        },
                        T.prototype.updateData = function (b) {
                            if (!b)
                                return this.resetData(), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < b.persons.length; i++) {

                                if (b.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    b.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    b.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    b.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    b.persons[i].title = GameMgr.Inst.account_data.title;
                                    b.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        b.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this.room_id = b.room_id,
                                this.owner_id = b.owner_id,
                                this.room_mode = b.mode,
                                this.public_live = b.public_live,
                                this.tournament_id = 0,
                                b.tournament_id && (this.tournament_id = b.tournament_id),
                                this.ai_name = game.Tools.strOfLocalization(2003),
                                this.room_mode.detail_rule && (1 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2003)), 2 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2004))),
                                this.max_player_count = b.max_player_count,
                                this.players = [];
                            for (var O = 0; O < b.persons.length; O++) {
                                var u = b.persons[O];
                                //修改友人房间立绘  -----fxxk
                                //if (u.account_id == GameMgr.Inst.account_id)
                                //    u.avatar_id = GameMgr.Inst.account_data.my_character.skin;
                                //end
                                u.ready = !1,
                                    u.cell_index = -1,
                                    u.category = 1,
                                    this.players.push(u)
                            }
                            for (var O = 0; O < b.robot_count; O++)
                                this.players.push({
                                    category: 2,
                                    cell_index: -1,
                                    account_id: 0,
                                    level: {
                                        id: 10101,
                                        score: 0
                                    },
                                    level3: {
                                        id: 20101,
                                        score: 0
                                    },
                                    nickname: this.ai_name,
                                    verified: 0,
                                    ready: !0,
                                    dressing: !1,
                                    title: 0,
                                    avatar_id: game.GameUtility.get_default_ai_skin()
                                });
                            for (var O = 0; O < b.ready_list.length; O++)
                                for (var Y = 0; Y < this.players.length; Y++)
                                    if (this.players[Y].account_id == b.ready_list[O]) {
                                        this.players[Y].ready = !0;
                                        break
                                    }
                            this.update_seq = 0,
                                b.seq && (this.update_seq = b.seq)
                        },
                        T.prototype.onReadyChange = function (b, O, u) {
                            for (var Y = 0; Y < this.players.length; Y++)
                                if (this.players[Y].account_id == b) {
                                    this.players[Y].ready = O,
                                        this.players[Y].dressing = u,
                                        this._onPlayerReadyChange(this.players[Y]);
                                    break
                                }
                            this.refreshStart()
                        },
                        T.prototype.onPlayerChange = function (b) {
                            if (app.Log.log(b), b = b.toJSON(), !(b.seq && b.seq <= this.update_seq)) {
                                // 修改友人房间立绘
                                for (var i = 0; i < b.player_list.length; i++) {

                                    if (b.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        b.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        b.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        b.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            b.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (b.update_list != undefined) {
                                    for (var i = 0; i < b.update_list.length; i++) {

                                        if (b.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            b.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            b.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            b.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                b.update_list[i].nickname = MMP.settings.nickname;
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
                                this.update_seq = b.seq;
                                var O = {};
                                O.type = "onPlayerChange0",
                                    O.players = this.players,
                                    O.msg = b,
                                    this.push_msg(JSON.stringify(O));
                                var u = this.robot_count,
                                    Y = b.robot_count;
                                if (Y < this.robot_count) {
                                    this.pre_choose && 2 == this.pre_choose.category && (this.pre_choose.category = 0, this.pre_choose = null, u--);
                                    for (var W = 0; W < this.players.length; W++)
                                        2 == this.players[W].category && u > Y && (this.players[W].category = 0, u--)
                                }
                                for (var T = [], D = b.player_list, W = 0; W < this.players.length; W++)
                                    if (1 == this.players[W].category) {
                                        for (var m = -1, i = 0; i < D.length; i++)
                                            if (D[i].account_id == this.players[W].account_id) {
                                                m = i;
                                                break
                                            }
                                        if (-1 != m) {
                                            var o = D[m];
                                            T.push(this.players[W]),
                                                this.players[W].avatar_id = o.avatar_id,
                                                this.players[W].title = o.title,
                                                this.players[W].verified = o.verified
                                        }
                                    } else
                                        2 == this.players[W].category && T.push(this.players[W]);
                                this.players = T;
                                for (var W = 0; W < D.length; W++) {
                                    for (var r = !1, o = D[W], i = 0; i < this.players.length; i++)
                                        if (1 == this.players[i].category && this.players[i].account_id == o.account_id) {
                                            r = !0;
                                            break
                                        }
                                    r || this.players.push({
                                        account_id: o.account_id,
                                        avatar_id: o.avatar_id,
                                        nickname: o.nickname,
                                        verified: o.verified,
                                        title: o.title,
                                        level: o.level,
                                        level3: o.level3,
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    })
                                }
                                for (var B = [!1, !1, !1, !1], W = 0; W < this.players.length; W++)
                                    - 1 != this.players[W].cell_index && (B[this.players[W].cell_index] = !0, this._refreshPlayerInfo(this.players[W]));
                                for (var W = 0; W < this.players.length; W++)
                                    if (1 == this.players[W].category && -1 == this.players[W].cell_index)
                                        for (var i = 0; i < this.max_player_count; i++)
                                            if (!B[i]) {
                                                this.players[W].cell_index = i,
                                                    B[i] = !0,
                                                    this._refreshPlayerInfo(this.players[W]);
                                                break
                                            }
                                for (var u = this.robot_count, Y = b.robot_count; Y > u;) {
                                    for (var A = -1, i = 0; i < this.max_player_count; i++)
                                        if (!B[i]) {
                                            A = i;
                                            break
                                        }
                                    if (-1 == A)
                                        break;
                                    B[A] = !0,
                                        this.players.push({
                                            category: 2,
                                            cell_index: A,
                                            account_id: 0,
                                            level: {
                                                id: 10101,
                                                score: 0
                                            },
                                            level3: {
                                                id: 20101,
                                                score: 0
                                            },
                                            nickname: this.ai_name,
                                            verified: 0,
                                            ready: !0,
                                            title: 0,
                                            avatar_id: game.GameUtility.get_default_ai_skin(),
                                            dressing: !1
                                        }),
                                        this._refreshPlayerInfo(this.players[this.players.length - 1]),
                                        u++
                                }
                                for (var W = 0; W < this.max_player_count; W++)
                                    B[W] || this._clearCell(W);
                                var O = {};
                                if (O.type = "onPlayerChange1", O.players = this.players, this.push_msg(JSON.stringify(O)), b.owner_id) {
                                    if (this.owner_id = b.owner_id, this.enable)
                                        if (this.owner_id == GameMgr.Inst.account_id)
                                            this.refreshAsOwner();
                                        else
                                            for (var i = 0; i < this.players.length; i++)
                                                if (this.players[i] && this.players[i].account_id == this.owner_id) {
                                                    this._refreshPlayerInfo(this.players[i]);
                                                    break
                                                }
                                } else if (this.enable)
                                    if (this.owner_id == GameMgr.Inst.account_id)
                                        this.refreshAsOwner();
                                    else
                                        for (var i = 0; i < this.players.length; i++)
                                            if (this.players[i] && this.players[i].account_id == this.owner_id) {
                                                this._refreshPlayerInfo(this.players[i]);
                                                break
                                            }
                            }
                        },
                        T.prototype.onBeKictOut = function () {
                            this.resetData(),
                                this.enable && (this.enable = !1, this.pop_change_view.close(!1), b.UI_Lobby.Inst.enable = !0, b.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(52)))
                        },
                        T.prototype.onCreate = function () {
                            var W = this;
                            this.last_start_room = 0;
                            var T = this.me.getChildByName("root");
                            this.container_top = T.getChildByName("top"),
                                this.container_right = T.getChildByName("right"),
                                this.label_rommid = this.container_top.getChildByName("label_roomid");
                            for (var D = function (O) {
                                var u = T.getChildByName("player_" + O.toString()),
                                    Y = {};
                                Y.index = O,
                                    Y.container = u,
                                    Y.container_flag = u.getChildByName("flag"),
                                    Y.container_flag.visible = !1,
                                    Y.container_name = u.getChildByName("container_name"),
                                    Y.name = u.getChildByName("container_name").getChildByName("name"),
                                    Y.btn_t = u.getChildByName("btn_t"),
                                    Y.container_illust = u.getChildByName("container_illust"),
                                    Y.illust = new b.UI_Character_Skin(u.getChildByName("container_illust").getChildByName("illust")),
                                    Y.host = u.getChildByName("host"),
                                    Y.title = new b.UI_PlayerTitle(u.getChildByName("container_name").getChildByName("title"), "UI_WaitingRoom"),
                                    Y.rank = new b.UI_Level(u.getChildByName("container_name").getChildByName("rank"), "UI_WaitingRoom"),
                                    Y.is_robot = !1;
                                var D = 0;
                                Y.btn_t.clickHandler = Laya.Handler.create(m, function () {
                                    if (!(W.locking || Laya.timer.currTimer < D)) {
                                        D = Laya.timer.currTimer + 500;
                                        for (var b = 0; b < W.players.length; b++)
                                            if (W.players[b].cell_index == O) {
                                                W.kickPlayer(b);
                                                break
                                            }
                                    }
                                }, null, !1),
                                    Y.btn_info = u.getChildByName("btn_info"),
                                    Y.btn_info.clickHandler = Laya.Handler.create(m, function () {
                                        if (!W.locking)
                                            for (var u = 0; u < W.players.length; u++)
                                                if (W.players[u].cell_index == O) {
                                                    W.players[u].account_id && W.players[u].account_id > 0 && b.UI_OtherPlayerInfo.Inst.show(W.players[u].account_id, W.room_mode.mode < 10 ? 1 : 2);
                                                    break
                                                }
                                    }, null, !1),
                                    m.player_cells.push(Y)
                            }, m = this, i = 0; 4 > i; i++)
                                D(i);
                            this.btn_ok = T.getChildByName("btn_ok");
                            var o = 0;
                            this.btn_ok.clickHandler = Laya.Handler.create(this, function () {
                                Laya.timer.currTimer < o + 500 || (o = Laya.timer.currTimer, W.owner_id == GameMgr.Inst.account_id ? W.getStart() : W.switchReady())
                            }, null, !1);
                            var r = 0;
                            this.container_top.getChildByName("btn_leave").clickHandler = Laya.Handler.create(this, function () {
                                Laya.timer.currTimer < r + 500 || (r = Laya.timer.currTimer, W.leaveRoom())
                            }, null, !1),
                                this.btn_invite_friend = this.container_right.getChildByName("btn_friend"),
                                this.btn_invite_friend.clickHandler = Laya.Handler.create(this, function () {
                                    W.locking || W.invitefriend.show()
                                }, null, !1),
                                this.btn_add_robot = this.container_right.getChildByName("btn_robot");
                            var B = 0;
                            this.btn_add_robot.clickHandler = Laya.Handler.create(this, function () {
                                W.locking || Laya.timer.currTimer < B || (B = Laya.timer.currTimer + 1e3, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                    robot_count: W.robot_count + 1
                                }, function (O, u) {
                                    (O || u.error && 1111 != u.error.code) && b.UIMgr.Inst.showNetReqError("modifyRoom_add", O, u),
                                        B = 0
                                }))
                            }, null, !1),
                                this.container_right.getChildByName("btn_help").clickHandler = Laya.Handler.create(this, function () {
                                    if (!W.locking) {
                                        var O = 0;
                                        W.room_mode.detail_rule && W.room_mode.detail_rule.chuanma && (O = 1),
                                            b.UI_Rules.Inst.show(0, null, O)
                                    }
                                }, null, !1),
                                this.btn_dress = this.container_right.getChildByName("btn_view"),
                                this.btn_dress.clickHandler = new Laya.Handler(this, function () {
                                    W.locking || W.beReady && W.owner_id != GameMgr.Inst.account_id || (W.pop_change_view.show(), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                        ready: W.owner_id == GameMgr.Inst.account_id ? !0 : !1,
                                        dressing: !0
                                    }, function () { }))
                                });
                            var A = this.container_right.getChildByName("btn_copy");
                            A.on("mouseover", this, function () {
                                W.mousein_copy = !0
                            }),
                                A.on("mouseout", this, function () {
                                    W.mousein_copy = !1
                                }),
                                A.clickHandler = Laya.Handler.create(this, function () {
                                    W.popout.visible || (GameMgr.Inst.BehavioralStatistics(12), W.popout.visible = !0, b.UIBase.anim_pop_out(W.popout, null))
                                }, null, !1),
                                this.container_rules = new Y(this.container_right.getChildByName("container_rules")),
                                this.popout = this.me.getChildByName("pop"),
                                this.room_link = this.popout.getChildByName("input").getChildByName("txtinput"),
                                this.room_link.editable = !1,
                                this.btn_copy_link = this.popout.getChildByName("btn_copy"),
                                this.btn_copy_link.visible = !1,
                                GameMgr.inConch ? (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                    var O = Laya.PlatformClass.createClass("layaair.majsoul.mjmgr");
                                    O.call("setSysClipboardText", W.room_link.text),
                                        b.UIBase.anim_pop_hide(W.popout, Laya.Handler.create(W, function () {
                                            W.popout.visible = !1
                                        })),
                                        b.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                }, null, !1)) : GameMgr.iniOSWebview && (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                    Laya.Browser.window.wkbridge.callNative("copy2clip", W.room_link.text, function () { }),
                                        b.UIBase.anim_pop_hide(W.popout, Laya.Handler.create(W, function () {
                                            W.popout.visible = !1
                                        })),
                                        b.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                }, null, !1)),
                                this.popout.visible = !1,
                                this.popout.getChildByName("btn_cancel").clickHandler = Laya.Handler.create(this, function () {
                                    b.UIBase.anim_pop_hide(W.popout, Laya.Handler.create(W, function () {
                                        W.popout.visible = !1
                                    }))
                                }, null, !1),
                                this.invitefriend = new O(this.me.getChildByName("invite_friend")),
                                this.pop_change_view = new u(this.me.getChildByName("pop_view"))
                        },
                        T.prototype.show = function () {
                            var O = this;
                            game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                this.mousein_copy = !1,
                                this.beReady = !1,
                                this.invitefriend.me.visible = !1,
                                this.btn_add_robot.visible = !1,
                                this.btn_invite_friend.visible = !1,
                                game.Tools.setGrayDisable(this.btn_dress, !1),
                                this.pre_choose = null,
                                this.pop_change_view.close(!0);
                            for (var u = 0; 4 > u; u++)
                                this.player_cells[u].container.visible = u < this.max_player_count;
                            for (var u = 0; u < this.max_player_count; u++)
                                this._clearCell(u);
                            for (var u = 0; u < this.players.length; u++)
                                this.players[u].cell_index = u, this._refreshPlayerInfo(this.players[u]);
                            this.msg_tail = -1,
                                this.pre_msgs = [],
                                this.posted = !1;
                            var Y = {};
                            Y.type = "show",
                                Y.players = this.players,
                                this.push_msg(JSON.stringify(Y)),
                                this.owner_id == GameMgr.Inst.account_id ? (this.btn_ok.skin = game.Tools.localUISrc(this.skin_start), this.refreshAsOwner()) : (this.btn_ok.skin = game.Tools.localUISrc(this.skin_ready), game.Tools.setGrayDisable(this.btn_ok, !1)),
                                this.label_rommid.text = "en" == GameMgr.client_language ? "#" + this.room_id.toString() : this.room_id.toString();
                            var W = [];
                            W.push(game.Tools.room_mode_desc(this.room_mode.mode));
                            var T = this.room_mode.detail_rule;
                            if (T) {
                                var D = 5,
                                    m = 20;
                                if (null != T.time_fixed && (D = T.time_fixed), null != T.time_add && (m = T.time_add), W.push(D.toString() + "+" + m.toString() + game.Tools.strOfLocalization(2019)), 0 != this.tournament_id) {
                                    var i = cfg.tournament.tournaments.get(this.tournament_id);
                                    i && W.push(i.name)
                                }
                                if (null != T.init_point && W.push(game.Tools.strOfLocalization(2199) + T.init_point), null != T.fandian && W.push(game.Tools.strOfLocalization(2094) + ":" + T.fandian), T.guyi_mode && W.push(game.Tools.strOfLocalization(3028)), null != T.dora_count)
                                    switch (T.chuanma && (T.dora_count = 0), T.dora_count) {
                                        case 0:
                                            W.push(game.Tools.strOfLocalization(2044));
                                            break;
                                        case 2:
                                            W.push(game.Tools.strOfLocalization(2047));
                                            break;
                                        case 3:
                                            W.push(game.Tools.strOfLocalization(2045));
                                            break;
                                        case 4:
                                            W.push(game.Tools.strOfLocalization(2046))
                                    }
                                null != T.shiduan && 1 != T.shiduan && W.push(game.Tools.strOfLocalization(2137)),
                                    2 === T.fanfu && W.push(game.Tools.strOfLocalization(2763)),
                                    4 === T.fanfu && W.push(game.Tools.strOfLocalization(2764)),
                                    null != T.bianjietishi && 1 != T.bianjietishi && W.push(game.Tools.strOfLocalization(2200)),
                                    this.room_mode.mode >= 10 && this.room_mode.mode <= 14 && (null != T.have_zimosun && 1 != T.have_zimosun ? W.push(game.Tools.strOfLocalization(2202)) : W.push(game.Tools.strOfLocalization(2203)))
                            }
                            this.container_rules.show(W),
                                this.enable = !0,
                                this.locking = !0,
                                b.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200);
                            for (var u = 0; u < this.player_cells.length; u++)
                                b.UIBase.anim_alpha_in(this.player_cells[u].container, {
                                    x: 80
                                }, 150, 150 + 50 * u, null, Laya.Ease.backOut);
                            b.UIBase.anim_alpha_in(this.btn_ok, {}, 100, 600),
                                b.UIBase.anim_alpha_in(this.container_right, {
                                    x: 20
                                }, 100, 500),
                                Laya.timer.once(600, this, function () {
                                    O.locking = !1
                                });
                            var o = game.Tools.room_mode_desc(this.room_mode.mode);
                            this.room_link.text = game.Tools.strOfLocalization(2221, [this.room_id.toString()]),
                                "" != o && (this.room_link.text += "(" + o + ")");
                            var r = game.Tools.getShareUrl(GameMgr.Inst.link_url);
                            this.room_link.text += ": " + r + "?room=" + this.room_id
                        },
                        T.prototype.leaveRoom = function () {
                            var O = this;
                            this.locking || app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (u, Y) {
                                u || Y.error ? b.UIMgr.Inst.showNetReqError("leaveRoom", u, Y) : O.hide(Laya.Handler.create(O, function () {
                                    b.UI_Lobby.Inst.enable = !0
                                }))
                            })
                        },
                        T.prototype.tryToClose = function (O) {
                            var u = this;
                            app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (Y, W) {
                                Y || W.error ? (b.UIMgr.Inst.showNetReqError("leaveRoom", Y, W), O.runWith(!1)) : (u.enable = !1, u.pop_change_view.close(!0), O.runWith(!0))
                            })
                        },
                        T.prototype.hide = function (O) {
                            var u = this;
                            this.locking = !0,
                                b.UIBase.anim_alpha_out(this.container_top, {
                                    y: -30
                                }, 150);
                            for (var Y = 0; Y < this.player_cells.length; Y++)
                                b.UIBase.anim_alpha_out(this.player_cells[Y].container, {
                                    x: 80
                                }, 150, 0, null);
                            b.UIBase.anim_alpha_out(this.btn_ok, {}, 150),
                                b.UIBase.anim_alpha_out(this.container_right, {
                                    x: 20
                                }, 150),
                                Laya.timer.once(200, this, function () {
                                    u.locking = !1,
                                        u.enable = !1,
                                        O && O.run()
                                }),
                                document.getElementById("layaCanvas").onclick = null
                        },
                        T.prototype.onDisbale = function () {
                            Laya.timer.clearAll(this);
                            for (var b = 0; b < this.player_cells.length; b++)
                                Laya.loader.clearTextureRes(this.player_cells[b].illust.skin);
                            document.getElementById("layaCanvas").onclick = null
                        },
                        T.prototype.switchReady = function () {
                            this.owner_id != GameMgr.Inst.account_id && (this.beReady = !this.beReady, this.btn_ok.skin = game.Tools.localUISrc(this.beReady ? this.skin_cancel : this.skin_ready), game.Tools.setGrayDisable(this.btn_dress, this.beReady), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                ready: this.beReady,
                                dressing: !1
                            }, function () { }))
                        },
                        T.prototype.getStart = function () {
                            this.owner_id == GameMgr.Inst.account_id && (Laya.timer.currTimer < this.last_start_room + 2e3 || (this.last_start_room = Laya.timer.currTimer, app.NetAgent.sendReq2Lobby("Lobby", "startRoom", {}, function (O, u) {
                                (O || u.error) && b.UIMgr.Inst.showNetReqError("startRoom", O, u)
                            })))
                        },
                        T.prototype.kickPlayer = function (O) {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                var u = this.players[O];
                                1 == u.category ? app.NetAgent.sendReq2Lobby("Lobby", "kickPlayer", {
                                    account_id: this.players[O].account_id
                                }, function () { }) : 2 == u.category && (this.pre_choose = u, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                    robot_count: this.robot_count - 1
                                }, function (O, u) {
                                    (O || u.error) && b.UIMgr.Inst.showNetReqError("modifyRoom_minus", O, u)
                                }))
                            }
                        },
                        T.prototype._clearCell = function (b) {
                            if (!(0 > b || b >= this.player_cells.length)) {
                                var O = this.player_cells[b];
                                O.container_flag.visible = !1,
                                    O.container_illust.visible = !1,
                                    O.name.visible = !1,
                                    O.container_name.visible = !1,
                                    O.btn_t.visible = !1,
                                    O.host.visible = !1
                            }
                        },
                        T.prototype._refreshPlayerInfo = function (b) {
                            var O = b.cell_index;
                            if (!(0 > O || O >= this.player_cells.length)) {
                                var u = this.player_cells[O];
                                u.container_illust.visible = !0,
                                    u.container_name.visible = !0,
                                    u.name.visible = !0,
                                    game.Tools.SetNickname(u.name, b),
                                    u.btn_t.visible = this.owner_id == GameMgr.Inst.account_id && b.account_id != GameMgr.Inst.account_id,
                                    this.owner_id == b.account_id && (u.container_flag.visible = !0, u.host.visible = !0),
                                    b.account_id == GameMgr.Inst.account_id ? u.illust.setSkin(b.avatar_id, "waitingroom") : u.illust.setSkin(game.GameUtility.get_limited_skin_id(b.avatar_id), "waitingroom"),
                                    u.title.id = game.Tools.titleLocalization(b.account_id, b.title),
                                    u.rank.id = b[this.room_mode.mode < 10 ? "level" : "level3"].id,
                                    this._onPlayerReadyChange(b)
                            }
                        },
                        T.prototype._onPlayerReadyChange = function (b) {
                            var O = b.cell_index;
                            if (!(0 > O || O >= this.player_cells.length)) {
                                var u = this.player_cells[O];
                                u.container_flag.visible = this.owner_id == b.account_id ? !0 : b.ready
                            }
                        },
                        T.prototype.refreshAsOwner = function () {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                for (var b = 0, O = 0; O < this.players.length; O++)
                                    0 != this.players[O].category && (this._refreshPlayerInfo(this.players[O]), b++);
                                this.btn_add_robot.visible = !0,
                                    this.btn_invite_friend.visible = !0,
                                    game.Tools.setGrayDisable(this.btn_invite_friend, b == this.max_player_count),
                                    game.Tools.setGrayDisable(this.btn_add_robot, b == this.max_player_count),
                                    this.refreshStart()
                            }
                        },
                        T.prototype.refreshStart = function () {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                this.btn_ok.skin = game.Tools.localUISrc(this.skin_start),
                                    game.Tools.setGrayDisable(this.btn_dress, !1);
                                for (var b = 0, O = 0; O < this.players.length; O++) {
                                    var u = this.players[O];
                                    if (!u || 0 == u.category)
                                        break;
                                    (u.account_id == this.owner_id || u.ready) && b++
                                }
                                if (game.Tools.setGrayDisable(this.btn_ok, b != this.max_player_count), this.enable) {
                                    for (var Y = 0, O = 0; O < this.max_player_count; O++) {
                                        var W = this.player_cells[O];
                                        W && W.container_flag.visible && Y++
                                    }
                                    if (b != Y && !this.posted) {
                                        this.posted = !0;
                                        var T = {};
                                        T.okcount = b,
                                            T.okcount2 = Y,
                                            T.msgs = [];
                                        var D = 0,
                                            m = this.pre_msgs.length - 1;
                                        if (-1 != this.msg_tail && (D = (this.msg_tail + 1) % this.pre_msgs.length, m = this.msg_tail), D >= 0 && m >= 0) {
                                            for (var O = D; O != m; O = (O + 1) % this.pre_msgs.length)
                                                T.msgs.push(this.pre_msgs[O]);
                                            T.msgs.push(this.pre_msgs[m])
                                        }
                                        GameMgr.Inst.postInfo2Server("waitroom_err2", T, !1)
                                    }
                                }
                            }
                        },
                        T.prototype.onGameStart = function (b) {
                            game.Tools.setGrayDisable(this.btn_ok, !0),
                                this.enable = !1,
                                game.MJNetMgr.Inst.OpenConnect(b.connect_token, b.game_uuid, b.location, !1, null)
                        },
                        T.prototype.onEnable = function () {
                            game.TempImageMgr.setUIEnable("UI_WaitingRoom", !0)
                        },
                        T.prototype.onDisable = function () {
                            game.TempImageMgr.setUIEnable("UI_WaitingRoom", !1)
                        },
                        T.Inst = null,
                        T
                }
                    (b.UIBase);
            b.UI_WaitingRoom = W
        }
            (uiscript || (uiscript = {}));


        // 保存装扮
        !function (b) {
            var O;
            !function (O) {
                var u = function () {
                    function u(u, Y, W) {
                        var T = this;
                        this.page_items = null,
                            this.page_headframe = null,
                            this.page_desktop = null,
                            this.page_bgm = null,
                            this.tabs = [],
                            this.tab_index = -1,
                            this.select_index = -1,
                            this.cell_titles = [2193, 2194, 2195, 1901, 2214, 2624, 2856, 2412, 2413, 2826],
                            this.cell_names = [411, 412, 413, 417, 414, 415, 416, 0, 0, 0],
                            this.cell_default_img = ["myres/sushe/slot_liqibang.jpg", "myres/sushe/slot_hule.jpg", "myres/sushe/slot_liqi.jpg", "myres/sushe/slot_mpzs.jpg", "myres/sushe/slot_hand.jpg", "myres/sushe/slot_liqibgm.jpg", "myres/sushe/slot_head_frame.jpg", "", "", ""],
                            this.cell_default_item = [0, 0, 0, 0, 0, 0, 305501, 305044, 305045, 307001],
                            this.slot_ids = [0, 1, 2, 10, 3, 4, 5, 6, 7, 8],
                            this.slot_map = {},
                            this._changed = !1,
                            this._locking = null,
                            this._locking = W,
                            this.container_zhuangban0 = u,
                            this.container_zhuangban1 = Y;
                        for (var D = this.container_zhuangban0.getChildByName("tabs"), m = function (O) {
                            var u = D.getChildAt(O);
                            i.tabs.push(u),
                                u.clickHandler = new Laya.Handler(i, function () {
                                    T.locking || T.tab_index != O && (T._changed ? b.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(T, function () {
                                        T.change_tab(O)
                                    }), null) : T.change_tab(O))
                                })
                        }, i = this, o = 0; o < D.numChildren; o++)
                            m(o);
                        this.page_items = new O.Page_Items(this.container_zhuangban1.getChildByName("page_items")),
                            this.page_headframe = new O.Page_Headframe(this.container_zhuangban1.getChildByName("page_headframe")),
                            this.page_bgm = new O.Page_Bgm(this.container_zhuangban1.getChildByName("page_bgm")),
                            this.page_desktop = new O.Page_Desktop(this.container_zhuangban1.getChildByName("page_zhuobu")),
                            this.scrollview = this.container_zhuangban1.getChildByName("page_slots").scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_view)),
                            this.scrollview.setElastic(),
                            this.btn_using = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_using"),
                            this.btn_save = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_save"),
                            this.btn_save.clickHandler = new Laya.Handler(this, function () {
                                for (var O = [], u = 0; u < T.cell_titles.length; u++) {
                                    var Y = T.slot_ids[u];
                                    if (T.slot_map[Y]) {
                                        var W = T.slot_map[Y];
                                        if (!W || W == T.cell_default_item[u])
                                            continue;
                                        O.push({
                                            slot: Y,
                                            item_id: W
                                        })
                                    }
                                }
                                T.btn_save.mouseEnabled = !1;
                                var D = T.tab_index;
                                //app.NetAgent.sendReq2Lobby("Lobby", "saveCommonViews", {
                                //    views: O,
                                //    save_index: D,
                                //    is_use: D == b.UI_Sushe.using_commonview_index ? 1 : 0
                                //}, function (u, Y) {
                                //    if (T.btn_save.mouseEnabled = !0, u || Y.error)
                                //        b.UIMgr.Inst.showNetReqError("saveCommonViews", u, Y);
                                //    else {
                                if (b.UI_Sushe.commonViewList.length < D)
                                    for (var W = b.UI_Sushe.commonViewList.length; D >= W; W++)
                                        b.UI_Sushe.commonViewList.push([]);
                                MMP.settings.commonViewList = b.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = b.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                if (b.UI_Sushe.commonViewList[D] = O, b.UI_Sushe.using_commonview_index == D && T.onChangeGameView(), T.tab_index != D)
                                    return;
                                T.btn_save.mouseEnabled = !0,
                                    T._changed = !1,
                                    T.refresh_btn()
                                //    }
                                //})
                            }),
                            this.btn_use = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_use"),
                            this.btn_use.clickHandler = new Laya.Handler(this, function () {
                                T.btn_use.mouseEnabled = !1;
                                var O = T.tab_index;
                                app.NetAgent.sendReq2Lobby("Lobby", "useCommonView", {
                                    index: O
                                }, function (u, Y) {
                                    T.btn_use.mouseEnabled = !0,
                                        u || Y.error ? b.UIMgr.Inst.showNetReqError("useCommonView", u, Y) : (b.UI_Sushe.using_commonview_index = O, T.refresh_btn(), T.refresh_tab(), T.onChangeGameView())
                                })
                            })
                    }
                    return Object.defineProperty(u.prototype, "locking", {
                        get: function () {
                            return this._locking ? this._locking.run() : !1
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object.defineProperty(u.prototype, "changed", {
                            get: function () {
                                return this._changed
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        u.prototype.show = function (O) {
                            game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !0),
                                this.container_zhuangban0.visible = !0,
                                this.container_zhuangban1.visible = !0,
                                O ? (this.container_zhuangban0.alpha = 1, this.container_zhuangban1.alpha = 1) : (b.UIBase.anim_alpha_in(this.container_zhuangban0, {
                                    x: 0
                                }, 200), b.UIBase.anim_alpha_in(this.container_zhuangban1, {
                                    x: 0
                                }, 200)),
                                this.change_tab(b.UI_Sushe.using_commonview_index)
                        },
                        u.prototype.change_tab = function (O) {
                            if (this.tab_index = O, this.refresh_tab(), this.slot_map = {}, this.scrollview.reset(), this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.select_index = 0, this._changed = !1, !(this.tab_index < 0 || this.tab_index > 4)) {
                                if (this.tab_index < b.UI_Sushe.commonViewList.length)
                                    for (var u = b.UI_Sushe.commonViewList[this.tab_index], Y = 0; Y < u.length; Y++)
                                        this.slot_map[u[Y].slot] = u[Y].item_id;
                                this.scrollview.addItem(this.cell_titles.length),
                                    this.onChangeSlotSelect(0),
                                    this.refresh_btn()
                            }
                        },
                        u.prototype.refresh_tab = function () {
                            for (var O = 0; O < this.tabs.length; O++) {
                                var u = this.tabs[O];
                                u.mouseEnabled = this.tab_index != O,
                                    u.getChildByName("bg").skin = game.Tools.localUISrc(this.tab_index == O ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                    u.getChildByName("num").color = this.tab_index == O ? "#2f1e19" : "#f2c797";
                                var Y = u.getChildByName("choosed");
                                b.UI_Sushe.using_commonview_index == O ? (Y.visible = !0, Y.x = this.tab_index == O ? -18 : -4) : Y.visible = !1
                            }
                        },
                        u.prototype.refresh_btn = function () {
                            this.btn_save.visible = !1,
                                this.btn_save.mouseEnabled = !0,
                                this.btn_use.visible = !1,
                                this.btn_use.mouseEnabled = !0,
                                this.btn_using.visible = !1,
                                this._changed ? this.btn_save.visible = !0 : (this.btn_use.visible = b.UI_Sushe.using_commonview_index != this.tab_index, this.btn_using.visible = b.UI_Sushe.using_commonview_index == this.tab_index)
                        },
                        u.prototype.onChangeSlotSelect = function (b) {
                            var O = this;
                            this.select_index = b;
                            var u = 0;
                            b >= 0 && b < this.cell_default_item.length && (u = this.cell_default_item[b]);
                            var Y = u,
                                W = this.slot_ids[b];
                            this.slot_map[W] && (Y = this.slot_map[W]);
                            var T = Laya.Handler.create(this, function (Y) {
                                Y == u && (Y = 0),
                                    O.slot_map[W] = Y,
                                    O.scrollview.wantToRefreshItem(b),
                                    O._changed = !0,
                                    O.refresh_btn()
                            }, null, !1);
                            this.page_items.close(),
                                this.page_desktop.close(),
                                this.page_headframe.close(),
                                this.page_bgm.close();
                            var D = game.Tools.strOfLocalization(this.cell_titles[b]);
                            if (b >= 0 && 2 >= b)
                                this.page_items.show(D, b, Y, T);
                            else if (3 == b)
                                this.page_items.show(D, 10, Y, T);
                            else if (4 == b)
                                this.page_items.show(D, 3, Y, T);
                            else if (5 == b)
                                this.page_bgm.show(D, Y, T);
                            else if (6 == b)
                                this.page_headframe.show(D, Y, T);
                            else if (7 == b || 8 == b) {
                                var m = this.cell_default_item[7],
                                    i = this.cell_default_item[8];
                                this.slot_map[game.EView.desktop] && (m = this.slot_map[game.EView.desktop]),
                                    this.slot_map[game.EView.mjp] && (i = this.slot_map[game.EView.mjp]),
                                    7 == b ? this.page_desktop.show_desktop(D, m, i, T) : this.page_desktop.show_mjp(D, m, i, T)
                            } else
                                9 == b && this.page_desktop.show_lobby_bg(D, Y, T)
                        },
                        u.prototype.render_view = function (b) {
                            var O = this,
                                u = b.container,
                                Y = b.index,
                                W = u.getChildByName("cell");
                            this.select_index == Y ? (W.scaleX = W.scaleY = 1.05, W.getChildByName("choosed").visible = !0) : (W.scaleX = W.scaleY = 1, W.getChildByName("choosed").visible = !1),
                                W.getChildByName("title").text = game.Tools.strOfLocalization(this.cell_titles[Y]);
                            var T = W.getChildByName("name"),
                                D = W.getChildByName("icon"),
                                m = this.cell_default_item[Y],
                                i = this.slot_ids[Y];
                            this.slot_map[i] && (m = this.slot_map[i]);
                            var o = cfg.item_definition.item.get(m);
                            o ? (T.text = o["name_" + GameMgr.client_language], game.LoadMgr.setImgSkin(D, o.icon, null, "UI_Sushe_Select.Zhuangban")) : (T.text = game.Tools.strOfLocalization(this.cell_names[Y]), game.LoadMgr.setImgSkin(D, this.cell_default_img[Y], null, "UI_Sushe_Select.Zhuangban"));
                            var r = W.getChildByName("btn");
                            r.clickHandler = Laya.Handler.create(this, function () {
                                O.locking || O.select_index != Y && (O.onChangeSlotSelect(Y), O.scrollview.wantToRefreshAll())
                            }, null, !1),
                                r.mouseEnabled = this.select_index != Y
                        },
                        u.prototype.close = function (O) {
                            var u = this;
                            this.container_zhuangban0.visible && (O ? (this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.container_zhuangban0.visible = !1, this.container_zhuangban1.visible = !1, game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !1)) : (b.UIBase.anim_alpha_out(this.container_zhuangban0, {
                                x: 0
                            }, 200), b.UIBase.anim_alpha_out(this.container_zhuangban1, {
                                x: 0
                            }, 200, 0, Laya.Handler.create(this, function () {
                                u.page_items.close(),
                                    u.page_desktop.close(),
                                    u.page_headframe.close(),
                                    u.page_bgm.close(),
                                    u.container_zhuangban0.visible = !1,
                                    u.container_zhuangban1.visible = !1,
                                    game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !1)
                            }))))
                        },
                        u.prototype.onChangeGameView = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = b.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            GameMgr.Inst.load_mjp_view();
                            var O = game.GameUtility.get_view_id(game.EView.lobby_bg);
                            b.UI_Lite_Loading.Inst.show(),
                                game.Scene_Lobby.Inst.set_lobby_bg(O, Laya.Handler.create(this, function () {
                                    b.UI_Lite_Loading.Inst.enable && b.UI_Lite_Loading.Inst.close()
                                })),
                                //GameMgr.Inst.account_data.avatar_frame = game.GameUtility.get_view_id(game.EView.head_frame)
                                GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                        },
                        u
                }
                    ();
                O.Container_Zhuangban = u
            }
                (O = b.zhuangban || (b.zhuangban = {}))
        }
            (uiscript || (uiscript = {}));


        // 设置称号
        !function (b) {
            var O = function (O) {
                function u() {
                    var b = O.call(this, new ui.lobby.titlebookUI) || this;
                    return b._root = null,
                        b._scrollview = null,
                        b._blackmask = null,
                        b._locking = !1,
                        b._showindexs = [],
                        u.Inst = b,
                        b
                }
                return __extends(u, O),
                    u.Init = function () {
                        var O = this;
                        // 获取称号
                        //app.NetAgent.sendReq2Lobby("Lobby", "fetchTitleList", {}, function (u, Y) {
                        //    if (u || Y.error)
                        //        b.UIMgr.Inst.showNetReqError("fetchTitleList", u, Y);
                        //    else {
                        O.owned_title = [];
                        for (let a of cfg.item_definition.title.rows_) {
                            var T = a.id;
                            cfg.item_definition.title.get(T) && O.owned_title.push(T),
                                600005 == T && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1),
                                T >= 600005 && 600015 >= T && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + T - 600005, 1)
                        }
                        //    }
                        //})
                        // END
                    },
                    u.title_update = function (O) {
                        for (var u = 0; u < O.new_titles.length; u++)
                            cfg.item_definition.title.get(O.new_titles[u]) && this.owned_title.push(O.new_titles[u]), 600005 == O.new_titles[u] && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1), O.new_titles[u] >= 600005 && O.new_titles[u] <= 600015 && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + O.new_titles[u] - 600005, 1);
                        if (O.remove_titles && O.remove_titles.length > 0) {
                            for (var u = 0; u < O.remove_titles.length; u++) {
                                for (var Y = O.remove_titles[u], W = 0; W < this.owned_title.length; W++)
                                    if (this.owned_title[W] == Y) {
                                        this.owned_title[W] = this.owned_title[this.owned_title.length - 1],
                                            this.owned_title.pop();
                                        break
                                    }
                                Y == GameMgr.Inst.account_data.title && (GameMgr.Inst.account_data.title = 600001, b.UI_Lobby.Inst.enable && b.UI_Lobby.Inst.top.refresh(), b.UI_PlayerInfo.Inst.enable && b.UI_PlayerInfo.Inst.refreshBaseInfo())
                            }
                            this.Inst.enable && this.Inst.show()
                        }
                    },
                    u.prototype.onCreate = function () {
                        var O = this;
                        this._root = this.me.getChildByName("root"),
                            this._blackmask = new b.UI_BlackMask(this.me.getChildByName("bmask"), Laya.Handler.create(this, function () {
                                return O._locking
                            }, null, !1), Laya.Handler.create(this, this.close, null, !1)),
                            this._scrollview = this._root.getChildByName("content").scriptMap["capsui.CScrollView"],
                            this._scrollview.init_scrollview(Laya.Handler.create(this, function (b) {
                                O.setItemValue(b.index, b.container)
                            }, null, !1)),
                            this._root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                O._locking || (O._blackmask.hide(), O.close())
                            }, null, !1),
                            this._noinfo = this._root.getChildByName("noinfo")
                    },
                    u.prototype.show = function () {
                        var O = this;
                        if (this._locking = !0, this.enable = !0, this._blackmask.show(), u.owned_title.length > 0) {
                            this._showindexs = [];
                            for (var Y = 0; Y < u.owned_title.length; Y++)
                                this._showindexs.push(Y);
                            this._showindexs = this._showindexs.sort(function (b, O) {
                                var Y = b,
                                    W = cfg.item_definition.title.get(u.owned_title[b]);
                                W && (Y += 1e3 * W.priority);
                                var T = O,
                                    D = cfg.item_definition.title.get(u.owned_title[O]);
                                return D && (T += 1e3 * D.priority),
                                    T - Y
                            }),
                                this._scrollview.reset(),
                                this._scrollview.addItem(u.owned_title.length),
                                this._scrollview.me.visible = !0,
                                this._noinfo.visible = !1
                        } else
                            this._noinfo.visible = !0, this._scrollview.me.visible = !1;
                        b.UIBase.anim_pop_out(this._root, Laya.Handler.create(this, function () {
                            O._locking = !1
                        }))
                    },
                    u.prototype.close = function () {
                        var O = this;
                        this._locking = !0,
                            b.UIBase.anim_pop_hide(this._root, Laya.Handler.create(this, function () {
                                O._locking = !1,
                                    O.enable = !1
                            }))
                    },
                    u.prototype.onEnable = function () {
                        game.TempImageMgr.setUIEnable("UI_TitleBook", !0)
                    },
                    u.prototype.onDisable = function () {
                        game.TempImageMgr.setUIEnable("UI_TitleBook", !1),
                            this._scrollview.reset()
                    },
                    u.prototype.setItemValue = function (b, O) {
                        var Y = this;
                        if (this.enable) {
                            var W = u.owned_title[this._showindexs[b]],
                                T = cfg.item_definition.title.find(W);
                            game.LoadMgr.setImgSkin(O.getChildByName("img_title"), T.icon, null, "UI_TitleBook"),
                                O.getChildByName("using").visible = W == GameMgr.Inst.account_data.title,
                                O.getChildByName("desc").text = T["desc_" + GameMgr.client_language];
                            var D = O.getChildByName("btn");
                            D.clickHandler = Laya.Handler.create(this, function () {
                                W != GameMgr.Inst.account_data.title ? (Y.changeTitle(b), O.getChildByName("using").visible = !0) : (Y.changeTitle(-1), O.getChildByName("using").visible = !1)
                            }, null, !1);
                            var m = O.getChildByName("time"),
                                i = O.getChildByName("img_title");
                            if (1 == T.unlock_type) {
                                var o = T.unlock_param[0],
                                    r = cfg.item_definition.item.get(o);
                                m.text = game.Tools.strOfLocalization(3121) + r["expire_desc_" + GameMgr.client_language],
                                    m.visible = !0,
                                    i.y = 0
                            } else
                                m.visible = !1, i.y = 10
                        }
                    },
                    u.prototype.changeTitle = function (O) {
                        var Y = this,
                            W = GameMgr.Inst.account_data.title,
                            T = 0;
                        T = O >= 0 && O < this._showindexs.length ? u.owned_title[this._showindexs[O]] : 600001,
                            GameMgr.Inst.account_data.title = T;
                        for (var D = -1, m = 0; m < this._showindexs.length; m++)
                            if (W == u.owned_title[this._showindexs[m]]) {
                                D = m;
                                break
                            }
                        b.UI_Lobby.Inst.enable && b.UI_Lobby.Inst.top.refresh(),
                            b.UI_PlayerInfo.Inst.enable && b.UI_PlayerInfo.Inst.refreshBaseInfo(),
                            -1 != D && this._scrollview.wantToRefreshItem(D),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = T;
                        MMP.saveSettings();
                        //app.NetAgent.sendReq2Lobby("Lobby", "useTitle", {
                        //    title: 600001 == T ? 0 : T
                        //}, function (u, T) {
                        //    (u || T.error) && (b.UIMgr.Inst.showNetReqError("useTitle", u, T), GameMgr.Inst.account_data.title = W, b.UI_Lobby.Inst.enable && b.UI_Lobby.Inst.top.refresh(), b.UI_PlayerInfo.Inst.enable && b.UI_PlayerInfo.Inst.refreshBaseInfo(), Y.enable && (O >= 0 && O < Y._showindexs.length && Y._scrollview.wantToRefreshItem(O), D >= 0 && D < Y._showindexs.length && Y._scrollview.wantToRefreshItem(D)))
                        //})
                    },
                    u.Inst = null,
                    u.owned_title = [],
                    u
            }
                (b.UIBase);
            b.UI_TitleBook = O
        }
            (uiscript || (uiscript = {}));

        // 友人房调整装扮
        !function (b) {
            var O;
            !function (O) {
                var u = function () {
                    function u(b) {
                        this.scrollview = null,
                            this.page_skin = null,
                            this.chara_infos = [],
                            this.choosed_chara_index = 0,
                            this.choosed_skin_id = 0,
                            this.star_char_count = 0,
                            this.me = b,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.me.getChildByName("left").visible = !0, this.me.getChildByName("left_en").visible = !1, this.scrollview = this.me.getChildByName("left").scriptMap["capsui.CScrollView"]) : (this.me.getChildByName("left").visible = !1, this.me.getChildByName("left_en").visible = !0, this.scrollview = this.me.getChildByName("left_en").scriptMap["capsui.CScrollView"]),
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3),
                            this.scrollview.setElastic(),
                            this.page_skin = new O.Page_Skin(this.me.getChildByName("right"))
                    }
                    return u.prototype.show = function (O) {
                        var u = this;
                        this.me.visible = !0,
                            O ? this.me.alpha = 1 : b.UIBase.anim_alpha_in(this.me, {
                                x: 0
                            }, 200, 0),
                            this.choosed_chara_index = 0,
                            this.chara_infos = [];
                        for (var Y = 0, W = b.UI_Sushe.star_chars; Y < W.length; Y++)
                            for (var T = W[Y], D = 0; D < b.UI_Sushe.characters.length; D++)
                                if (!b.UI_Sushe.hidden_characters_map[T] && b.UI_Sushe.characters[D].charid == T) {
                                    this.chara_infos.push({
                                        chara_id: b.UI_Sushe.characters[D].charid,
                                        skin_id: b.UI_Sushe.characters[D].skin,
                                        is_upgraded: b.UI_Sushe.characters[D].is_upgraded
                                    }),
                                        b.UI_Sushe.main_character_id == b.UI_Sushe.characters[D].charid && (this.choosed_chara_index = this.chara_infos.length - 1);
                                    break
                                }
                        this.star_char_count = this.chara_infos.length;
                        for (var D = 0; D < b.UI_Sushe.characters.length; D++)
                            b.UI_Sushe.hidden_characters_map[b.UI_Sushe.characters[D].charid] || -1 == b.UI_Sushe.star_chars.indexOf(b.UI_Sushe.characters[D].charid) && (this.chara_infos.push({
                                chara_id: b.UI_Sushe.characters[D].charid,
                                skin_id: b.UI_Sushe.characters[D].skin,
                                is_upgraded: b.UI_Sushe.characters[D].is_upgraded
                            }), b.UI_Sushe.main_character_id == b.UI_Sushe.characters[D].charid && (this.choosed_chara_index = this.chara_infos.length - 1));
                        this.choosed_skin_id = this.chara_infos[this.choosed_chara_index].skin_id,
                            this.scrollview.reset(),
                            this.scrollview.addItem(this.chara_infos.length);
                        var m = this.chara_infos[this.choosed_chara_index];
                        this.page_skin.show(m.chara_id, m.skin_id, Laya.Handler.create(this, function (b) {
                            u.choosed_skin_id = b,
                                m.skin_id = b,
                                u.scrollview.wantToRefreshItem(u.choosed_chara_index)
                        }, null, !1))
                    },
                        u.prototype.render_character_cell = function (O) {
                            var u = this,
                                Y = O.index,
                                W = O.container,
                                T = O.cache_data;
                            T.index = Y;
                            var D = this.chara_infos[Y];
                            T.inited || (T.inited = !0, T.skin = new b.UI_Character_Skin(W.getChildByName("btn").getChildByName("head")), T.bound = W.getChildByName("btn").getChildByName("bound"));
                            var m = W.getChildByName("btn");
                            m.getChildByName("choose").visible = Y == this.choosed_chara_index,
                                T.skin.setSkin(D.skin_id, "bighead"),
                                m.getChildByName("using").visible = Y == this.choosed_chara_index,
                                m.getChildByName("label_name").text = "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? cfg.item_definition.character.find(D.chara_id)["name_" + GameMgr.client_language].replace("-", "|") : cfg.item_definition.character.find(D.chara_id)["name_" + GameMgr.client_language],
                                m.getChildByName("star") && (m.getChildByName("star").visible = Y < this.star_char_count);
                            var i = cfg.item_definition.character.get(D.chara_id);
                            "en" == GameMgr.client_language || "jp" == GameMgr.client_language || "kr" == GameMgr.client_language ? T.bound.skin = i.ur ? game.Tools.localUISrc("myres/sushe/bg_head_bound" + (D.is_upgraded ? "4.png" : "3.png")) : game.Tools.localUISrc("myres/sushe/en_head_bound" + (D.is_upgraded ? "2.png" : ".png")) : i.ur ? (T.bound.pos(-10, -2), T.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (D.is_upgraded ? "6.png" : "5.png"))) : (T.bound.pos(4, 20), T.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (D.is_upgraded ? "4.png" : "3.png"))),
                                m.getChildByName("bg").skin = game.Tools.localUISrc("myres/sushe/bg_head" + (D.is_upgraded ? "2.png" : ".png")),
                                W.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                    if (Y != u.choosed_chara_index) {
                                        var b = u.choosed_chara_index;
                                        u.choosed_chara_index = Y,
                                            u.choosed_skin_id = D.skin_id,
                                            u.page_skin.show(D.chara_id, D.skin_id, Laya.Handler.create(u, function (b) {
                                                u.choosed_skin_id = b,
                                                    D.skin_id = b,
                                                    T.skin.setSkin(b, "bighead")
                                            }, null, !1)),
                                            u.scrollview.wantToRefreshItem(b),
                                            u.scrollview.wantToRefreshItem(Y)
                                    }
                                })
                        },
                        u.prototype.close = function (O) {
                            var u = this;
                            if (this.me.visible)
                                if (O)
                                    this.me.visible = !1;
                                else {
                                    var Y = this.chara_infos[this.choosed_chara_index];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //Y.chara_id != b.UI_Sushe.main_character_id && (app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                    //        character_id: Y.chara_id
                                    //    }, function () {}), 
                                    b.UI_Sushe.main_character_id = Y.chara_id
                                    //this.choosed_skin_id != GameMgr.Inst.account_data.avatar_id && app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                    //    character_id: Y.chara_id,
                                    //    skin: this.choosed_skin_id
                                    //}, function () {});
                                    // END
                                    for (var W = 0; W < b.UI_Sushe.characters.length; W++)
                                        if (b.UI_Sushe.characters[W].charid == Y.chara_id) {
                                            b.UI_Sushe.characters[W].skin = this.choosed_skin_id;
                                            break
                                        }
                                    GameMgr.Inst.account_data.avatar_id = this.choosed_skin_id,
                                        b.UIBase.anim_alpha_out(this.me, {
                                            x: 0
                                        }, 200, 0, Laya.Handler.create(this, function () {
                                            u.me.visible = !1
                                        }))
                                }
                        },
                        u
                }
                    ();
                O.Page_Waiting_Head = u
            }
                (O = b.zhuangban || (b.zhuangban = {}))
        }
            (uiscript || (uiscript = {}));


        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var b = GameMgr;
            var O = this;
            app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountInfo", {}, function (u, Y) {
                if (u || Y.error)
                    uiscript.UIMgr.Inst.showNetReqError("fetchAccountInfo", u, Y);
                else {
                    app.Log.log("UpdateAccount: " + JSON.stringify(Y)),
                        b.Inst.account_refresh_time = Laya.timer.currTimer;
                    // 对局结束更新数据
                    Y.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    Y.account.title = GameMgr.Inst.account_data.title;
                    Y.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        Y.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var W in Y.account) {
                        if (b.Inst.account_data[W] = Y.account[W], "platform_diamond" == W)
                            for (var T = Y.account[W], D = 0; D < T.length; D++)
                                O.account_numerical_resource[T[D].id] = T[D].count;
                        if ("skin_ticket" == W && (b.Inst.account_numerical_resource[100004] = Y.account[W]), "platform_skin_ticket" == W)
                            for (var T = Y.account[W], D = 0; D < T.length; D++)
                                O.account_numerical_resource[T[D].id] = T[D].count
                    }
                    uiscript.UI_Lobby.Inst.refreshInfo(),
                        Y.account.room_id && b.Inst.updateRoom(),
                        10102 === b.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_2, 1),
                        10103 === b.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_3, 1)
                }
            })
        };
        GameMgr.Inst.checkPaiPu = function (O, u, Y) {
            var W = GameMgr.Inst;
            var b = GameMgr;
            return O = O.trim(),
                app.Log.log("checkPaiPu game_uuid:" + O + " account_id:" + u.toString() + " paipu_config:" + Y),
                this.duringPaipu ? (app.Log.Error("已经在看牌谱了"), void 0) : (this.duringPaipu = !0, uiscript.UI_Loading.Inst.show("enter_mj"), b.Inst.onLoadStart("paipu"), 2 & Y && (O = game.Tools.DecodePaipuUUID(O)), this.record_uuid = O, app.NetAgent.sendReq2Lobby("Lobby", "fetchGameRecord", {
                    game_uuid: O,
                    client_version_string: this.getClientVersion()
                }, function (T, D) {
                    if (T || D.error)
                        uiscript.UIMgr.Inst.showNetReqError("fetchGameRecord", T, D), uiscript.UI_Loading.Inst.close(null), uiscript.UIMgr.Inst.showLobby(), W.duringPaipu = !1;
                    else {
                        uiscript.UI_Loading.Inst.setProgressVal(.1);
                        var m = D.head,
                            i = [null, null, null, null],
                            o = game.Tools.strOfLocalization(2003),
                            r = m.config.mode;
                        if (b.inRelease && r.testing_environment && r.testing_environment.paixing)
                            return uiscript.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(3169)), uiscript.UI_Loading.Inst.close(null), uiscript.UIMgr.Inst.showLobby(), W.duringPaipu = !1, void 0;
                        app.NetAgent.sendReq2Lobby("Lobby", "readGameRecord", {
                            game_uuid: O,
                            client_version_string: W.getClientVersion()
                        }, function () { }),
                            r.extendinfo && (o = game.Tools.strOfLocalization(2004)),
                            r.detail_rule && r.detail_rule.ai_level && (1 === r.detail_rule.ai_level && (o = game.Tools.strOfLocalization(2003)), 2 === r.detail_rule.ai_level && (o = game.Tools.strOfLocalization(2004)));
                        var B = !1;
                        m.end_time ? (W.record_end_time = m.end_time, m.end_time > 1576112400 && (B = !0)) : W.record_end_time = -1,
                            W.record_start_time = m.start_time ? m.start_time : -1;
                        for (var A = 0; A < m.accounts.length; A++) {
                            var w = m.accounts[A];
                            if (w.character) {
                                var x = w.character,
                                    Z = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (x.account_id == GameMgr.Inst.account_id) {
                                        x.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        x.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        x.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        x.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        x.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            x.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (x.avatar_id == 400101 || x.avatar_id == 400201)) {
                                        //玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            x.avatar_id = skin.id;
                                            x.character.charid = skin.character_id;
                                            x.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(w.account_id);
                                        if (server == 1) {
                                            w.nickname = '[CN]' + w.nickname;
                                        } else if (server == 2) {
                                            w.nickname = '[JP]' + w.nickname;
                                        } else if (server == 3) {
                                            w.nickname = '[EN]' + w.nickname;
                                        } else {
                                            w.nickname = '[??]' + w.nickname;
                                        }
                                    }
                                }
                                // END
                                if (B) {
                                    var a = w.views;
                                    if (a)
                                        for (var M = 0; M < a.length; M++)
                                            Z[a[M].slot] = a[M].item_id
                                } else {
                                    var Q = x.views;
                                    if (Q)
                                        for (var M = 0; M < Q.length; M++) {
                                            var V = Q[M].slot,
                                                q = Q[M].item_id,
                                                g = V - 1;
                                            Z[g] = q
                                        }
                                }
                                var J = [];
                                for (var X in Z)
                                    J.push({
                                        slot: parseInt(X),
                                        item_id: Z[X]
                                    });
                                w.views = J,
                                    i[w.seat] = w
                            } else
                                w.character = {
                                    charid: w.avatar_id,
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg.item_definition.character.get(w.avatar_id).init_skin,
                                    is_upgraded: !1
                                },
                                    w.avatar_id = w.character.skin,
                                    w.views = [],
                                    i[w.seat] = w
                        }
                        for (var y = game.GameUtility.get_default_ai_skin(), e = game.GameUtility.get_default_ai_character(), A = 0; A < i.length; A++) {
                            if (null == i[A]) {
                                i[A] = {
                                    nickname: o,
                                    avatar_id: y,
                                    level: {
                                        id: 10101
                                    },
                                    level3: {
                                        id: 20101
                                    },
                                    character: {
                                        charid: e,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: y,
                                        is_upgraded: !1
                                    }
                                }

                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (MMP.settings.randomBotSkin == true) {
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            i[A].avatar_id = skin.id;
                                            i[A].character.charid = skin.character_id;
                                            i[A].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        i[A].nickname = '[BOT]' + i[A].nickname;
                                    }
                                }
                                // END
                            }
                        }
                        var C = Laya.Handler.create(W, function (b) {
                            game.Scene_Lobby.Inst.active && (game.Scene_Lobby.Inst.active = !1),
                                game.Scene_MJ.Inst.openMJRoom(m.config, i, Laya.Handler.create(W, function () {
                                    W.duringPaipu = !1,
                                        view.DesktopMgr.Inst.paipu_config = Y,
                                        view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(m.config)), i, u, view.EMJMode.paipu, Laya.Handler.create(W, function () {
                                            uiscript.UI_Replay.Inst.initData(b),
                                                uiscript.UI_Replay.Inst.enable = !0,
                                                Laya.timer.once(1e3, W, function () {
                                                    W.EnterMJ()
                                                }),
                                                Laya.timer.once(1500, W, function () {
                                                    view.DesktopMgr.player_link_state = [view.ELink_State.READY, view.ELink_State.READY, view.ELink_State.READY, view.ELink_State.READY],
                                                        uiscript.UI_DesktopInfo.Inst.refreshLinks(),
                                                        uiscript.UI_Loading.Inst.close()
                                                }),
                                                Laya.timer.once(1e3, W, function () {
                                                    uiscript.UI_Replay.Inst.nextStep(!0)
                                                })
                                        }))
                                }), Laya.Handler.create(W, function (b) {
                                    return uiscript.UI_Loading.Inst.setProgressVal(.1 + .9 * b)
                                }, null, !1))
                        }),
                            $ = {};
                        if ($.record = m, D.data && D.data.length)
                            $.game = net.MessageWrapper.decodeMessage(D.data), C.runWith($);
                        else {
                            var c = D.data_url;
                            "chs_t" == b.client_type && (c = c.replace("maj-soul.com:9443", "maj-soul.net")),
                                game.LoadMgr.httpload(c, "arraybuffer", !1, Laya.Handler.create(W, function (b) {
                                    if (b.success) {
                                        var O = new Laya.Byte;
                                        O.writeArrayBuffer(b.data);
                                        var u = net.MessageWrapper.decodeMessage(O.getUint8Array(0, O.length));
                                        $.game = u,
                                            C.runWith($)
                                    } else
                                        uiscript.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(2005) + D.data_url), uiscript.UI_Loading.Inst.close(null), uiscript.UIMgr.Inst.showLobby(), W.duringPaipu = !1
                                }))
                        }
                    }
                }), void 0)
        };
        // 设置状态
        uiscript.UI_DesktopInfo.prototype.resetFunc = function () {
            var b = Laya.LocalStorage.getItem("autolipai"),
                O = !0;
            O = b && "" != b ? "true" == b : !0;
            var u = this._container_fun.getChildByName("btn_autolipai");
            this.refreshFuncBtnShow(u, O),
                Laya.LocalStorage.setItem("autolipai", O ? "true" : "false"),
                view.DesktopMgr.Inst.setAutoLiPai(O);
            var Y = this._container_fun.getChildByName("btn_autohu");
            this.refreshFuncBtnShow(Y, view.DesktopMgr.Inst.auto_hule);
            var W = this._container_fun.getChildByName("btn_autonoming");
            this.refreshFuncBtnShow(W, view.DesktopMgr.Inst.auto_nofulu);
            var T = this._container_fun.getChildByName("btn_automoqie");
            this.refreshFuncBtnShow(T, view.DesktopMgr.Inst.auto_moqie),
                this._container_fun.x = -528,
                this.arrow.scaleX = -1
            // 保存状态
            if (MMP.settings.setAuto.isSetAuto) {
                setAuto();
            }
            // END
        };
        uiscript.UI_DesktopInfo.prototype._initFunc = function () {
            var b = this;
            this._container_fun = this.me.getChildByName("container_func");
            var O = this._container_fun.getChildByName("btn_func"),
                u = this._container_fun.getChildByName("btn_func2");
            O.clickHandler = u.clickHandler = new Laya.Handler(this, function () {
                var u = 0;
                b._container_fun.x < -400 ? (u = -274, b.arrow.scaleX = 1) : (u = -528, b.arrow.scaleX = -1),
                    Laya.Tween.to(b._container_fun, {
                        x: u
                    }, 200, Laya.Ease.strongOut, Laya.Handler.create(b, function () {
                        O.disabled = !1
                    }), 0, !0, !0),
                    O.disabled = !0
            }, null, !1);
            var Y = this._container_fun.getChildByName("btn_autolipai"),
                W = this._container_fun.getChildByName("btn_autolipai2");
            this.refreshFuncBtnShow(Y, !0),
                Y.clickHandler = W.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoLiPai(!view.DesktopMgr.Inst.auto_liqi),
                        b.refreshFuncBtnShow(Y, view.DesktopMgr.Inst.auto_liqi),
                        Laya.LocalStorage.setItem("autolipai", view.DesktopMgr.Inst.auto_liqi ? "true" : "false")
                    // MMP.settings.setAuto.setAutoLiPai = view.DesktopMgr.Inst.auto_liqi;
                    // MMP.saveSettings();
                }, null, !1);
            var T = this._container_fun.getChildByName("btn_autohu"),
                D = this._container_fun.getChildByName("btn_autohu2");
            this.refreshFuncBtnShow(T, !1),
                T.clickHandler = D.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoHule(!view.DesktopMgr.Inst.auto_hule),
                        b.refreshFuncBtnShow(T, view.DesktopMgr.Inst.auto_hule)
                    // MMP.settings.setAuto.setAutoHule = view.DesktopMgr.Inst.auto_hule;
                    // MMP.saveSettings();
                }, null, !1);
            var m = this._container_fun.getChildByName("btn_autonoming"),
                i = this._container_fun.getChildByName("btn_autonoming2");
            this.refreshFuncBtnShow(m, !1),
                m.clickHandler = i.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoNoFulu(!view.DesktopMgr.Inst.auto_nofulu),
                        b.refreshFuncBtnShow(m, view.DesktopMgr.Inst.auto_nofulu)
                    // MMP.settings.setAuto.setAutoNoFulu = view.DesktopMgr.Inst.auto_nofulu;
                    // MMP.saveSettings();
                }, null, !1);
            var o = this._container_fun.getChildByName("btn_automoqie"),
                r = this._container_fun.getChildByName("btn_automoqie2");
            this.refreshFuncBtnShow(o, !1),
                o.clickHandler = r.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoMoQie(!view.DesktopMgr.Inst.auto_moqie),
                        b.refreshFuncBtnShow(o, view.DesktopMgr.Inst.auto_moqie)
                    // MMP.settings.setAuto.setAutoMoQie = view.DesktopMgr.Inst.auto_moqie;
                    // MMP.saveSettings();
                }, null, !1),
                "kr" == GameMgr.client_language && (Y.getChildByName("out").scale(.9, .9), T.getChildByName("out").scale(.9, .9), m.getChildByName("out").scale(.9, .9), o.getChildByName("out").scale(.9, .9)),
                Laya.Browser.onPC && !GameMgr.inConch ? (O.visible = !1, D.visible = !0, W.visible = !0, i.visible = !0, r.visible = !0) : (O.visible = !0, D.visible = !1, W.visible = !1, i.visible = !1, r.visible = !1),
                this.arrow = this._container_fun.getChildByName("arrow"),
                this.arrow.scaleX = -1
        };
        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }

            var O = uiscript.UI_Info;
            this.read_list = [],
                app.NetAgent.sendReq2Lobby("Lobby", "fetchAnnouncement", {
                    lang: GameMgr.client_language,
                    platform: GameMgr.inDmm ? "web_dmm" : "web"
                }, function (u, Y) {
                    u || Y.error ? b.UIMgr.Inst.showNetReqError("fetchAnnouncement", u, Y) : O._refreshAnnouncements(Y)
                }),
                app.NetAgent.AddListener2Lobby("NotifyAnnouncementUpdate", Laya.Handler.create(this, function (b) {
                    for (var u = GameMgr.inDmm ? "web_dmm" : "web", Y = 0, W = b.update_list; Y < W.length; Y++) {
                        var T = W[Y];
                        if (T.lang == GameMgr.client_language && T.platform == u) {
                            O.have_new_notice = !0;
                            break
                        }
                    }
                }, null, !1))

            if (MMP.settings.isReadme == false) {
                let bf = new Blowfish(secret_key);
                uiscript.UI_InfoLite.Inst.show(bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))) + '\n\n' + secret_key);
                MMP.settings.isReadme = true;
                MMP.saveSettings();
            } else if (MMP.settings.version != GM_info['script']['version']) {
                let bf = new Blowfish(secret_key);
                uiscript.UI_InfoLite.Inst.show(bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))) + '\n\n' + secret_key);
                MMP.settings.version = GM_info['script']['version'];
                MMP.saveSettings();
            }
        }
        let html = '<div class="modal fade" id="mmpSettings" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"    aria-labelledby="staticBackdropLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h3 class="text-center">雀魂Mod_Plus设置</h3><object id="version" style="padding-left: 0.5rem;" height="100%" data="" width="200px"></object><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><ul class="list-group"><li class="list-group-item"><dl class="row"><dt class="col-sm-5">自定义名称</dt><dd class="col-sm-7"><input id="nickname" type="text" class="form-control rounded-3" placeholder="留空则关闭该功能"></dd><dt class="col-sm-5">开局后自动设置指定状态</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="isSetAuto" class="form-check-input" type="checkbox" role="switch"                                        data-bs-target="#setAuto" data-bs-toggle="collapse"></div><div id="setAuto" class="collapse"><ul class="list-group"><li class="list-group-item rounded-3"><dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"><dt class="col-5">自动理牌</dt><dd class="col-7"><div class="form-check form-switch"><input id="setAutoLiPai" class="form-check-input"                                                            type="checkbox" role="switch"></div></dd><dt class="col-5">自动和了</dt><dd class="col-7"><div class="form-check form-switch"><input id="setAutoHule" class="form-check-input" type="checkbox"                                                            role="switch"></div></dd><dt class="col-5">不吃碰杠</dt><dd class="col-7"><div class="form-check form-switch"><input id="setAutoNoFulu" class="form-check-input"                                                            type="checkbox" role="switch"></div></dd><dt class="col-5">自动摸切</dt><dd class="col-7"><div class="form-check form-switch"><input id="setAutoMoQie" class="form-check-input"                                                            type="checkbox" role="switch"></div></dd></dl></li></ul></div></dd><dt class="col-sm-5">强制打开便捷提示</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="setbianjietishi" class="form-check-input" type="checkbox" role="switch"></div></dd><dt class="col-sm-5">获得全部道具</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="setAllItems" class="form-check-input" type="checkbox" role="switch"                                        data-bs-target="#setItems" data-bs-toggle="collapse"></div><div id="setItems" class="collapse"><ul class="list-group"><li class="list-group-item rounded-3"><dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"><dt class="col-5">不需要获得的道具ID</dt><dd class="col-7"><textarea id="ignoreItems" class="form-control rounded-4 is-valid"                                                        placeholder="使用英文逗号分隔，留空则关闭该功能"></textarea><div class="invalid-tooltip">                                                        输入有误！</div></dd><dt class="col-5">不获得活动道具</dt><dd class="col-7"><div class="form-check form-switch"><input id="ignoreEvent" class="form-check-input" type="checkbox"                                                            role="switch"></div></dd></dl></li></ul></div></dd><dt class="col-sm-5">随机电脑皮肤</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="randomBotSkin" class="form-check-input" type="checkbox" role="switch"></div></dd><dt class="col-sm-5">随机默认皮肤玩家的皮肤</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="randomPlayerDefSkin" class="form-check-input" type="checkbox"                                        role="switch"></div></dd><dt class="col-sm-5">发送游戏对局</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="sendGame" class="form-check-input" type="checkbox" role="switch"                                        data-bs-target="#sendGameSetting" data-bs-toggle="collapse"></div><div id="sendGameSetting" class="collapse"><ul class="list-group"><li class="list-group-item rounded-3"><dl class="row" style="margin-bottom: calc(-.5 * var(--bs-gutter-x));"><dt class="col-5">接收URL</dt><dd class="col-7"><input id="sendGameURL" type="text" class="form-control rounded-4"><div class="invalid-tooltip">                                                        输入有误！</div></dd></dl></li></ul></div></dd><dt class="col-sm-5">对查看牌谱生效</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="setPaipuChar" class="form-check-input" type="checkbox" role="switch"></div></dd><dt class="col-sm-5">显示玩家所在服务器</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="showServer" class="form-check-input" type="checkbox" role="switch"></div></dd><dt class="col-sm-5">反屏蔽名称与文本审查</dt><dd class="col-sm-7"><div class="form-check form-switch"><input id="antiCensorship" class="form-check-input" type="checkbox" role="switch"></div></dd></dl></li><li class="list-group-item list-group-item-warning">                        本脚本完全免费开源，如果您是付费获得，意味着您已经被倒卖狗骗了，请立即申请退款并差评！！<br>开源地址：<br>Github:<a href="https://github.com/Avenshy/majsoul_mod_plus"                            target="_blank">https://github.com/Avenshy/majsoul_mod_plus</a><br>GreasyFork:<a href="https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus"                            target="_blank">https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus</a></li></ul></div><div class="modal-footer"><button id="saveSettings" type="button" class="btn btn-success">保存</button><button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">关闭</button></div></div></div></div><div class="modal fade" id="saveSuccess" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"    aria-labelledby="staticBackdropLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="staticBackdropLabel">雀魂Mod_Plus</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><div class="alert alert-success fade show"><svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16"><path                                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /></symbol></svg><h4 class="alert-heading"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img"                            aria-label="Success:"><use xlink:href="#check-circle-fill" /></svg>设置保存成功！</h4><hr>                    本脚本完全免费开源，如果您是付费获得，意味着您已经被倒卖狗骗了，请立即申请退款并差评！！<br>开源地址：<br>Github:<a href="https://github.com/Avenshy/majsoul_mod_plus" class="alert-link"                        target="_blank">https://github.com/Avenshy/majsoul_mod_plus</a><br>GreasyFork:<a href="https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus" class="alert-link"                        target="_blank">https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus</a></div></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button></div></div></div></div>';
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
                ignoreItems.checked = MMP.settings.setItems.ignoreEvent;
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
            GameMgr.Inst.nickname_replace_lst = [];
        }
        console.log('[雀魂mod_plus] 启动完毕!!!');
        let testapi=testAPI();
        
        if (testapi['clear']!=true){
            let showAPI='';
            for (let item in testapi['apis']){
                showAPI+= item+': '+testapi['apis'][item]+'\n';
            }
            alert('[雀魂mod_plus]\n您的脚本管理器有不支持的API，可能会影响脚本使用，如果您有条件的话，请您更换对API支持较好的脚本管理器，具体请查看脚本使用说明！\n\n本脚本使用的API与支持如下：\n'+showAPI);

        }
        
    } catch (error) {
        console.log('[雀魂mod_plus] 等待游戏启动');
        setTimeout(majsoul_mod_plus, 1000);
    }
}
    ();

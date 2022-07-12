// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.122
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
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        unsafeWindow
// @run-at       document-start
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
                isSetAuto: false, // 开关，是否保存状态
                setAutoLiPai: true, // 自动理牌
                setAutoHule: true, // 自动和了
                setAutoNoFulu: false, // 不吃碰杠
                setAutoMoQie: false // 自动摸切
            },
            setbianjietishi: false, // 强制打开便捷提示
            setItems: {
                setAllItems: true, // 开关，是否获得全部道具
                ignoreItems: [309000, 309022, 309023, 309029, 309035], // 不需要获得的道具id
                ignoreEvent: true // 不获得活动道具，编号一般为309XXX
            },
            randomBotSkin: false,    // 开关，是否随机电脑皮肤
            randomPlayerDefSkin: false, // 开关，是否随机那些只有默认皮肤的玩家的皮肤
            version: '', // 上次运行的版本，用于显示更新日志
            isReadme: false // 是否已阅读readme
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
            console.log(this.settings)
            console.warn('[雀魂mod_plus] ' + secret_key);
        } else {
            console.log('[雀魂mod_plus] 配置已保存：');
            console.log(this.settings)
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
    Laya.LocalStorage.setItem("autolipai", MMP.settings.setAuto.setAutoLiPai ? "true" : "false");
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
        !function (H) {
            var u;
            !function (H) {
                H[H.none = 0] = "none",
                    H[H.daoju = 1] = "daoju",
                    H[H.gift = 2] = "gift",
                    H[H.fudai = 3] = "fudai",
                    H[H.view = 5] = "view"
            }
                (u = H.EItemCategory || (H.EItemCategory = {}));
            var Y = function (Y) {
                function F() {
                    var H = Y.call(this, new ui.lobby.bagUI) || this;
                    return H.container_top = null,
                        H.container_content = null,
                        H.locking = !1,
                        H.tabs = [],
                        H.page_item = null,
                        H.page_gift = null,
                        H.page_skin = null,
                        H.select_index = 0,
                        F.Inst = H,
                        H
                }
                return __extends(F, Y),
                    F.init = function () {
                        var H = this;
                        app.NetAgent.AddListener2Lobby("NotifyAccountUpdate", Laya.Handler.create(this, function (u) {
                            var Y = u.update;
                            Y && Y.bag && (H.update_data(Y.bag.update_items), H.update_daily_gain_data(Y.bag))
                        }, null, !1)),
                            this.fetch()
                    },
                    F.fetch = function () {
                        var u = this;
                        this._item_map = {},
                            this._daily_gain_record = {},
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchBagInfo", {}, function (Y, F) {
                                if (Y || F.error)
                                    H.UIMgr.Inst.showNetReqError("fetchBagInfo", Y, F);
                                else {
                                    app.Log.log("背包信息：" + JSON.stringify(F));
                                    var V = F.bag;
                                    if (V) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of V.items) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            u._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    u._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }


                                        } else {
                                            if (V.items)
                                                for (var r = 0; r < V.items.length; r++) {
                                                    var h = V.items[r].item_id,
                                                        C = V.items[r].stack,
                                                        B = cfg.item_definition.item.get(h);
                                                    B && (u._item_map[h] = {
                                                        item_id: h,
                                                        count: C,
                                                        category: B.category
                                                    }, 1 == B.category && 3 == B.type && app.NetAgent.sendReq2Lobby("Lobby", "openAllRewardItem", {
                                                        item_id: h
                                                    }, function () { }))
                                                }
                                            if (V.daily_gain_record)
                                                for (var _ = V.daily_gain_record, r = 0; r < _.length; r++) {
                                                    var d = _[r].limit_source_id;
                                                    u._daily_gain_record[d] = {};
                                                    var n = _[r].record_time;
                                                    u._daily_gain_record[d].record_time = n;
                                                    var M = _[r].records;
                                                    if (M)
                                                        for (var t = 0; t < M.length; t++)
                                                            u._daily_gain_record[d][M[t].item_id] = M[t].count
                                                }
                                        }
                                    }
                                }
                            })
                    },
                    F.find_item = function (H) {
                        var u = this._item_map[H];
                        return u ? {
                            item_id: u.item_id,
                            category: u.category,
                            count: u.count
                        }
                            : null
                    },
                    F.get_item_count = function (H) {
                        var u = this.find_item(H);
                        if (u)
                            return u.count;
                        if (100001 == H) {
                            for (var Y = 0, F = 0, V = GameMgr.Inst.free_diamonds; F < V.length; F++) {
                                var r = V[F];
                                GameMgr.Inst.account_numerical_resource[r] && (Y += GameMgr.Inst.account_numerical_resource[r])
                            }
                            for (var h = 0, C = GameMgr.Inst.paid_diamonds; h < C.length; h++) {
                                var r = C[h];
                                GameMgr.Inst.account_numerical_resource[r] && (Y += GameMgr.Inst.account_numerical_resource[r])
                            }
                            return Y
                        }
                        if (100004 == H) {
                            for (var B = 0, _ = 0, d = GameMgr.Inst.free_pifuquans; _ < d.length; _++) {
                                var r = d[_];
                                GameMgr.Inst.account_numerical_resource[r] && (B += GameMgr.Inst.account_numerical_resource[r])
                            }
                            for (var n = 0, M = GameMgr.Inst.paid_pifuquans; n < M.length; n++) {
                                var r = M[n];
                                GameMgr.Inst.account_numerical_resource[r] && (B += GameMgr.Inst.account_numerical_resource[r])
                            }
                            return B
                        }
                        return 100002 == H ? GameMgr.Inst.account_data.gold : 0
                    },
                    F.find_items_by_category = function (H) {
                        var u = [];
                        for (var Y in this._item_map)
                            this._item_map[Y].category == H && u.push({
                                item_id: this._item_map[Y].item_id,
                                category: this._item_map[Y].category,
                                count: this._item_map[Y].count
                            });
                        return u
                    },
                    F.update_data = function (u) {
                        for (var Y = 0; Y < u.length; Y++) {
                            var F = u[Y].item_id,
                                V = u[Y].stack;
                            if (V > 0) {
                                this._item_map.hasOwnProperty(F.toString()) ? this._item_map[F].count = V : this._item_map[F] = {
                                    item_id: F,
                                    count: V,
                                    category: cfg.item_definition.item.get(F).category
                                };
                                var r = cfg.item_definition.item.get(F);
                                1 == r.category && 3 == r.type && app.NetAgent.sendReq2Lobby("Lobby", "openAllRewardItem", {
                                    item_id: F
                                }, function () { })
                            } else if (this._item_map.hasOwnProperty(F.toString())) {
                                var h = cfg.item_definition.item.get(F);
                                h && 5 == h.category && H.UI_Sushe.on_view_remove(F),
                                    this._item_map[F] = 0,
                                    delete this._item_map[F]
                            }
                        }
                        this.Inst && this.Inst.when_data_change();
                        for (var Y = 0; Y < u.length; Y++) {
                            var F = u[Y].item_id;
                            if (this._item_listener.hasOwnProperty(F.toString()))
                                for (var C = this._item_listener[F], B = 0; B < C.length; B++)
                                    C[B].run()
                        }
                        for (var Y = 0; Y < this._all_item_listener.length; Y++)
                            this._all_item_listener[Y].run()
                    },
                    F.update_daily_gain_data = function (H) {
                        var u = H.update_daily_gain_record;
                        if (u)
                            for (var Y = 0; Y < u.length; Y++) {
                                var F = u[Y].limit_source_id;
                                this._daily_gain_record[F] || (this._daily_gain_record[F] = {});
                                var V = u[Y].record_time;
                                this._daily_gain_record[F].record_time = V;
                                var r = u[Y].records;
                                if (r)
                                    for (var h = 0; h < r.length; h++)
                                        this._daily_gain_record[F][r[h].item_id] = r[h].count
                            }
                    },
                    F.get_item_daily_record = function (H, u) {
                        return this._daily_gain_record[H] ? this._daily_gain_record[H].record_time ? game.Tools.isPassedRefreshTimeServer(this._daily_gain_record[H].record_time) ? this._daily_gain_record[H][u] ? this._daily_gain_record[H][u] : 0 : 0 : 0 : 0
                    },
                    F.add_item_listener = function (H, u) {
                        this._item_listener.hasOwnProperty(H.toString()) || (this._item_listener[H] = []),
                            this._item_listener[H].push(u)
                    },
                    F.remove_item_listener = function (H, u) {
                        var Y = this._item_listener[H];
                        if (Y)
                            for (var F = 0; F < Y.length; F++)
                                if (Y[F] === u) {
                                    Y[F] = Y[Y.length - 1],
                                        Y.pop();
                                    break
                                }
                    },
                    F.add_all_item_listener = function (H) {
                        this._all_item_listener.push(H)
                    },
                    F.remove_all_item_listener = function (H) {
                        for (var u = this._all_item_listener, Y = 0; Y < u.length; Y++)
                            if (u[Y] === H) {
                                u[Y] = u[u.length - 1],
                                    u.pop();
                                break
                            }
                    },
                    F.prototype.have_red_point = function () {
                        return !1
                    },
                    F.prototype.onCreate = function () {
                        var u = this;
                        this.container_top = this.me.getChildByName("top"),
                            this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                u.locking || u.hide(Laya.Handler.create(u, function () {
                                    H.UI_Lobby.Inst.enable = !0
                                }))
                            }, null, !1),
                            this.container_content = this.me.getChildByName("content");
                        for (var Y = function (H) {
                            F.tabs.push(F.container_content.getChildByName("tabs").getChildByName("btn" + H)),
                                F.tabs[H].clickHandler = Laya.Handler.create(F, function () {
                                    u.select_index != H && u.on_change_tab(H)
                                }, null, !1)
                        }, F = this, V = 0; 4 > V; V++)
                            Y(V);
                        this.page_item = new H.UI_Bag_PageItem(this.container_content.getChildByName("page_items")),
                            this.page_gift = new H.UI_Bag_PageGift(this.container_content.getChildByName("page_gift")),
                            this.page_skin = new H.UI_Bag_PageSkin(this.container_content.getChildByName("page_skin"))
                    },
                    F.prototype.show = function (u) {
                        var Y = this;
                        void 0 === u && (u = 0),
                            this.enable = !0,
                            this.locking = !0,
                            H.UIBase.anim_alpha_in(this.container_top, {
                                y: -30
                            }, 200),
                            H.UIBase.anim_alpha_in(this.container_content, {
                                y: 30
                            }, 200),
                            Laya.timer.once(300, this, function () {
                                Y.locking = !1
                            }),
                            this.on_change_tab(u),
                            game.Scene_Lobby.Inst.change_bg("indoor", !1),
                            3 != u && this.page_skin.when_update_data()
                    },
                    F.prototype.hide = function (u) {
                        var Y = this;
                        this.locking = !0,
                            H.UIBase.anim_alpha_out(this.container_top, {
                                y: -30
                            }, 200),
                            H.UIBase.anim_alpha_out(this.container_content, {
                                y: 30
                            }, 200),
                            Laya.timer.once(300, this, function () {
                                Y.locking = !1,
                                    Y.enable = !1,
                                    u && u.run()
                            })
                    },
                    F.prototype.onDisable = function () {
                        this.page_skin.close(),
                            this.page_item.close(),
                            this.page_gift.close()
                    },
                    F.prototype.on_change_tab = function (H) {
                        this.select_index = H;
                        for (var Y = 0; Y < this.tabs.length; Y++)
                            this.tabs[Y].skin = game.Tools.localUISrc(H == Y ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[Y].getChildAt(0).color = H == Y ? "#d9b263" : "#8cb65f";
                        switch (this.page_item.close(), this.page_gift.close(), this.page_skin.me.visible = !1, H) {
                            case 0:
                                this.page_item.show(u.daoju);
                                break;
                            case 1:
                                this.page_gift.show();
                                break;
                            case 2:
                                this.page_item.show(u.view);
                                break;
                            case 3:
                                this.page_skin.show()
                        }
                    },
                    F.prototype.when_data_change = function () {
                        this.page_item.me.visible && this.page_item.when_update_data(),
                            this.page_gift.me.visible && this.page_gift.when_update_data()
                    },
                    F.prototype.on_skin_change = function () {
                        this.page_skin.when_update_data()
                    },
                    F.prototype.clear_desktop_btn_redpoint = function () {
                        this.tabs[3].getChildByName("redpoint").visible = !1
                    },
                    F._item_map = {},
                    F._item_listener = {},
                    F._all_item_listener = [],
                    F._daily_gain_record = {},
                    F.Inst = null,
                    F
            }
                (H.UIBase);
            H.UI_Bag = Y
        }
            (uiscript || (uiscript = {}));

        // 修改牌桌上角色
        !function (H) {
            var u = function () {
                function u() {
                    var u = this;
                    this.urls = [],
                        this.link_index = -1,
                        this.connect_state = H.EConnectState.none,
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
                        app.NetAgent.AddListener2MJ("NotifyPlayerLoadGameReady", Laya.Handler.create(this, function (H) {
                            app.Log.log("NotifyPlayerLoadGameReady: " + JSON.stringify(H)),
                                u.loaded_player_count = H.ready_id_list.length,
                                u.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(u.loaded_player_count, u.real_player_count)
                        }))
                }
                return Object.defineProperty(u, "Inst", {
                    get: function () {
                        return null == this._Inst ? this._Inst = new u : this._Inst
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    u.prototype.OpenConnect = function (u, Y, F, V) {
                        var r = this;
                        uiscript.UI_Loading.Inst.show("enter_mj"),
                            H.Scene_Lobby.Inst && H.Scene_Lobby.Inst.active && (H.Scene_Lobby.Inst.active = !1),
                            H.Scene_Huiye.Inst && H.Scene_Huiye.Inst.active && (H.Scene_Huiye.Inst.active = !1),
                            this.Close(),
                            view.BgmListMgr.stopBgm(),
                            this.is_ob = !1,
                            Laya.timer.once(500, this, function () {
                                r.url = "",
                                    r.token = u,
                                    r.game_uuid = Y,
                                    r.server_location = F,
                                    GameMgr.Inst.ingame = !0,
                                    GameMgr.Inst.mj_server_location = F,
                                    GameMgr.Inst.mj_game_token = u,
                                    GameMgr.Inst.mj_game_uuid = Y,
                                    r.playerreconnect = V,
                                    r._setState(H.EConnectState.tryconnect),
                                    r.load_over = !1,
                                    r.loaded_player_count = 0,
                                    r.real_player_count = 0,
                                    r.lb_index = 0,
                                    r._fetch_gateway(0)
                            }),
                            Laya.timer.loop(3e5, this, this.reportInfo)
                    },
                    u.prototype.reportInfo = function () {
                        this.connect_state == H.EConnectState.connecting && GameMgr.Inst.postNewInfo2Server("network_route", {
                            client_type: "web",
                            route_type: "game",
                            route_index: H.LobbyNetMgr.root_id_lst[H.LobbyNetMgr.Inst.choosed_index],
                            route_delay: Math.min(1e4, Math.round(app.NetAgent.mj_network_delay)),
                            connection_time: Math.round(Date.now() - this._connect_start_time),
                            reconnect_count: this._report_reconnect_count
                        })
                    },
                    u.prototype.Close = function () {
                        this.load_over = !1,
                            app.Log.log("MJNetMgr close"),
                            this._setState(H.EConnectState.none),
                            app.NetAgent.Close2MJ(),
                            this.url = "",
                            Laya.timer.clear(this, this.reportInfo)
                    },
                    u.prototype._OnConnent = function (u) {
                        app.Log.log("MJNetMgr _OnConnent event:" + u),
                            u == Laya.Event.CLOSE || u == Laya.Event.ERROR ? Laya.timer.currTimer - this.lasterrortime > 100 && (this.lasterrortime = Laya.timer.currTimer, this.connect_state == H.EConnectState.tryconnect ? this._try_to_linknext() : this.connect_state == H.EConnectState.connecting ? view.DesktopMgr.Inst.active ? (view.DesktopMgr.Inst.duringReconnect = !0, this._setState(H.EConnectState.reconnecting), this.reconnect_count = 0, this._Reconnect()) : (this._setState(H.EConnectState.disconnect), uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2008)), H.Scene_MJ.Inst.ForceOut()) : this.connect_state == H.EConnectState.reconnecting && this._Reconnect()) : u == Laya.Event.OPEN && (this._connect_start_time = Date.now(), (this.connect_state == H.EConnectState.tryconnect || this.connect_state == H.EConnectState.reconnecting) && ((this.connect_state = H.EConnectState.tryconnect) ? this._report_reconnect_count = 0 : this._report_reconnect_count++, this._setState(H.EConnectState.connecting), this.is_ob ? this._ConnectSuccessOb() : this._ConnectSuccess()))
                    },
                    u.prototype._Reconnect = function () {
                        var u = this;
                        H.LobbyNetMgr.Inst.connect_state == H.EConnectState.none || H.LobbyNetMgr.Inst.connect_state == H.EConnectState.disconnect ? this._setState(H.EConnectState.disconnect) : H.LobbyNetMgr.Inst.connect_state == H.EConnectState.connecting && GameMgr.Inst.logined ? this.reconnect_count >= this.reconnect_span.length ? this._setState(H.EConnectState.disconnect) : (Laya.timer.once(this.reconnect_span[this.reconnect_count], this, function () {
                            u.connect_state == H.EConnectState.reconnecting && (app.Log.log("MJNetMgr reconnect count:" + u.reconnect_count), app.NetAgent.connect2MJ(u.url, Laya.Handler.create(u, u._OnConnent, null, !1), "local" == u.server_location ? "/game-gateway" : "/game-gateway-zone"))
                        }), this.reconnect_count++) : Laya.timer.once(1e3, this, this._Reconnect)
                    },
                    u.prototype._try_to_linknext = function () {
                        this.link_index++,
                            this.url = "",
                            app.Log.log("mj _try_to_linknext(" + this.link_index + ") url.length=" + this.urls.length),
                            this.link_index < 0 || this.link_index >= this.urls.length ? H.LobbyNetMgr.Inst.polling_connect ? (this.lb_index++, this._fetch_gateway(0)) : (this._setState(H.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(59)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && H.Scene_MJ.Inst.ForceOut()) : (app.NetAgent.connect2MJ(this.urls[this.link_index].url, Laya.Handler.create(this, this._OnConnent, null, !1), "local" == this.server_location ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this.link_index].url)
                    },
                    u.prototype.GetAuthData = function () {
                        return {
                            account_id: GameMgr.Inst.account_id,
                            token: this.token,
                            game_uuid: this.game_uuid,
                            gift: CryptoJS.HmacSHA256(this.token + GameMgr.Inst.account_id + this.game_uuid, "damajiang").toString()
                        }
                    },
                    u.prototype._fetch_gateway = function (u) {
                        var Y = this;
                        if (H.LobbyNetMgr.Inst.polling_connect && this.lb_index >= H.LobbyNetMgr.Inst.urls.length)
                            return uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(58)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && H.Scene_MJ.Inst.ForceOut(), this._setState(H.EConnectState.none), void 0;
                        this.urls = [],
                            this.link_index = -1,
                            app.Log.log("mj _fetch_gateway retry_count:" + u);
                        var F = function (F) {
                            var V = JSON.parse(F);
                            if (app.Log.log("mj _fetch_gateway func_success data = " + F), V.maintenance)
                                Y._setState(H.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2009)), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && H.Scene_MJ.Inst.ForceOut();
                            else if (V.servers && V.servers.length > 0) {
                                for (var r = V.servers, h = H.Tools.deal_gateway(r), C = 0; C < h.length; C++)
                                    Y.urls.push({
                                        name: "___" + C,
                                        url: h[C]
                                    });
                                Y.link_index = -1,
                                    Y._try_to_linknext()
                            } else
                                1 > u ? Laya.timer.once(1e3, Y, function () {
                                    Y._fetch_gateway(u + 1)
                                }) : H.LobbyNetMgr.Inst.polling_connect ? (Y.lb_index++, Y._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(60)), Y._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && H.Scene_MJ.Inst.ForceOut(), Y._setState(H.EConnectState.none))
                        },
                            V = function () {
                                app.Log.log("mj _fetch_gateway func_error"),
                                    1 > u ? Laya.timer.once(500, Y, function () {
                                        Y._fetch_gateway(u + 1)
                                    }) : H.LobbyNetMgr.Inst.polling_connect ? (Y.lb_index++, Y._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(58)), Y._SendDebugInfo(), view.DesktopMgr.Inst.active || H.Scene_MJ.Inst.ForceOut(), Y._setState(H.EConnectState.none))
                            },
                            r = function (H) {
                                var u = new Laya.HttpRequest;
                                u.once(Laya.Event.COMPLETE, Y, function (H) {
                                    F(H)
                                }),
                                    u.once(Laya.Event.ERROR, Y, function () {
                                        V()
                                    });
                                var r = [];
                                r.push("If-Modified-Since"),
                                    r.push("0"),
                                    H += "?service=ws-game-gateway",
                                    H += GameMgr.inHttps ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                    H += "&location=" + Y.server_location,
                                    H += "&rv=" + Math.floor(1e7 * Math.random()) + Math.floor(1e7 * Math.random()),
                                    u.send(H, "", "get", "text", r),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + H)
                            };
                        H.LobbyNetMgr.Inst.polling_connect ? r(H.LobbyNetMgr.Inst.urls[this.lb_index]) : r(H.LobbyNetMgr.Inst.lb_url)
                    },
                    u.prototype._setState = function (u) {
                        this.connect_state = u,
                            GameMgr.inRelease || null != uiscript.UI_Common.Inst && (u == H.EConnectState.none ? uiscript.UI_Common.Inst.label_net_mj.text = "" : u == H.EConnectState.tryconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "尝试连接麻将服务器", uiscript.UI_Common.Inst.label_net_mj.color = "#000000") : u == H.EConnectState.connecting ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正常", uiscript.UI_Common.Inst.label_net_mj.color = "#00ff00") : u == H.EConnectState.disconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：断开连接", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()) : u == H.EConnectState.reconnecting && (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正在重连", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()))
                    },
                    u.prototype._ConnectSuccess = function () {
                        var u = this;
                        app.Log.log("MJNetMgr _ConnectSuccess "),
                            this.load_over = !1,
                            app.NetAgent.sendReq2MJ("FastTest", "authGame", this.GetAuthData(), function (Y, F) {
                                if (Y || F.error)
                                    uiscript.UIMgr.Inst.showNetReqError("authGame", Y, F), H.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                else {
                                    app.Log.log("麻将桌验证通过：" + JSON.stringify(F)),
                                        uiscript.UI_Loading.Inst.setProgressVal(.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        F.game_config.mode.detail_rule.bianjietishi = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    let req = new XMLHttpRequest();
                                    req.open("POST", "https://localhost:12121/");
                                    req.send(JSON.stringify(F));
                                    //END
                                    var V = [],
                                        r = 0;
                                    view.DesktopMgr.player_link_state = F.state_list;
                                    var h = H.Tools.strOfLocalization(2003),
                                        C = F.game_config.mode,
                                        B = view.ERuleMode.Liqi4;
                                    C.mode < 10 ? (B = view.ERuleMode.Liqi4, u.real_player_count = 4) : C.mode < 20 && (B = view.ERuleMode.Liqi3, u.real_player_count = 3);
                                    for (var _ = 0; _ < u.real_player_count; _++)
                                        V.push(null);
                                    C.extendinfo && (h = H.Tools.strOfLocalization(2004)),
                                        C.detail_rule && C.detail_rule.ai_level && (1 === C.detail_rule.ai_level && (h = H.Tools.strOfLocalization(2003)), 2 === C.detail_rule.ai_level && (h = H.Tools.strOfLocalization(2004)));
                                    for (var d = H.GameUtility.get_default_ai_skin(), n = H.GameUtility.get_default_ai_character(), _ = 0; _ < F.seat_list.length; _++) {
                                        var M = F.seat_list[_];
                                        if (0 == M) {
                                            V[_] = {
                                                nickname: h,
                                                avatar_id: d,
                                                level: {
                                                    id: 10101
                                                },
                                                level3: {
                                                    id: 20101
                                                },
                                                character: {
                                                    charid: n,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: d,
                                                    is_upgraded: !1
                                                }
                                            };
                                            //随机化电脑皮肤
                                            if (MMP.randomBotSkin) {
                                                let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                V[_].avatar_id = skin.id;
                                                V[_].character.charid = skin.character_id;
                                                V[_].character.skin = skin.id;
                                            }

                                        }
                                        else {
                                            r++;
                                            for (var t = 0; t < F.players.length; t++)
                                                if (F.players[t].account_id == M) {
                                                    V[_] = F.players[t];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (V[_].account_id == GameMgr.Inst.account_id) {
                                                        V[_].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        V[_].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        V[_].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        V[_].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        V[_].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            V[_].nickname = MMP.settings.nickname;
                                                        }
                                                    }
                                                    else if (MMP.randomPlayerDefSkin && (V[_].avatar_id == 400101 || V[_].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        V[_].avatar_id = skin.id;
                                                        V[_].character.charid = skin.character_id;
                                                        V[_].character.skin = skin.id;
                                                    }
                                                    // END
                                                    //break
                                                }
                                        }
                                    }
                                    for (var _ = 0; _ < u.real_player_count; _++)
                                        null == V[_] && (V[_] = {
                                            account: 0,
                                            nickname: H.Tools.strOfLocalization(2010),
                                            avatar_id: d,
                                            level: {
                                                id: 10101
                                            },
                                            level3: {
                                                id: 20101
                                            },
                                            character: {
                                                charid: n,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: d,
                                                is_upgraded: !1
                                            }
                                        });
                                    u.loaded_player_count = F.ready_id_list.length,
                                        u._AuthSuccess(V, F.is_game_start, F.game_config.toJSON())
                                }
                            })
                    },
                    u.prototype._AuthSuccess = function (u, Y, F) {
                        var V = this;
                        view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                view.DesktopMgr.Inst.Reset(),
                                view.DesktopMgr.Inst.duringReconnect = !0,
                                uiscript.UI_Loading.Inst.setProgressVal(.2),
                                app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                    round_id: view.DesktopMgr.Inst.round_id,
                                    step: view.DesktopMgr.Inst.current_step
                                }, function (u, Y) {
                                    u || Y.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", u, Y), H.Scene_MJ.Inst.ForceOut()) : (app.Log.log("[syncGame] " + JSON.stringify(Y)), Y.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2011)), H.Scene_MJ.Inst.GameEnd()) : (uiscript.UI_Loading.Inst.setProgressVal(.3), view.DesktopMgr.Inst.fetchLinks(), view.DesktopMgr.Inst.Reset(), view.DesktopMgr.Inst.duringReconnect = !0, view.DesktopMgr.Inst.syncGameByStep(Y.game_restore)))
                                })
                        })) : H.Scene_MJ.Inst.openMJRoom(F, u, Laya.Handler.create(this, function () {
                            view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(F)), u, GameMgr.Inst.account_id, view.EMJMode.play, Laya.Handler.create(V, function () {
                                Y ? Laya.timer.frameOnce(10, V, function () {
                                    app.Log.log("重连信息2 round_id:-1 step:" + 1e6),
                                        view.DesktopMgr.Inst.Reset(),
                                        view.DesktopMgr.Inst.duringReconnect = !0,
                                        app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                            round_id: "-1",
                                            step: 1e6
                                        }, function (u, Y) {
                                            app.Log.log("syncGame " + JSON.stringify(Y)),
                                                u || Y.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", u, Y), H.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), view.DesktopMgr.Inst.fetchLinks(), V._PlayerReconnectSuccess(Y))
                                        })
                                }) : Laya.timer.frameOnce(10, V, function () {
                                    app.Log.log("send enterGame"),
                                        view.DesktopMgr.Inst.Reset(),
                                        view.DesktopMgr.Inst.duringReconnect = !0,
                                        app.NetAgent.sendReq2MJ("FastTest", "enterGame", {}, function (u, Y) {
                                            u || Y.error ? (uiscript.UIMgr.Inst.showNetReqError("enterGame", u, Y), H.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), app.Log.log("enterGame"), V._EnterGame(Y), view.DesktopMgr.Inst.fetchLinks())
                                        })
                                })
                            }))
                        }), Laya.Handler.create(this, function (H) {
                            return uiscript.UI_Loading.Inst.setProgressVal(.1 + .8 * H)
                        }, null, !1))
                    },
                    u.prototype._EnterGame = function (u) {
                        app.Log.log("正常进入游戏: " + JSON.stringify(u)),
                            u.is_end ? (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2011)), H.Scene_MJ.Inst.GameEnd()) : u.game_restore ? view.DesktopMgr.Inst.syncGameByStep(u.game_restore) : (this.load_over = !0, this.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(this.loaded_player_count, this.real_player_count), view.DesktopMgr.Inst.duringReconnect = !1, view.DesktopMgr.Inst.StartChainAction(0))
                    },
                    u.prototype._PlayerReconnectSuccess = function (u) {
                        app.Log.log("_PlayerReconnectSuccess data:" + JSON.stringify(u)),
                            u.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2011)), H.Scene_MJ.Inst.GameEnd()) : u.game_restore ? view.DesktopMgr.Inst.syncGameByStep(u.game_restore) : (uiscript.UIMgr.Inst.ShowErrorInfo(H.Tools.strOfLocalization(2012)), H.Scene_MJ.Inst.ForceOut())
                    },
                    u.prototype._SendDebugInfo = function () { },
                    u.prototype.OpenConnectObserve = function (u, Y) {
                        var F = this;
                        this.is_ob = !0,
                            uiscript.UI_Loading.Inst.show("enter_mj"),
                            this.Close(),
                            view.AudioMgr.StopMusic(),
                            Laya.timer.once(500, this, function () {
                                F.server_location = Y,
                                    F.ob_token = u,
                                    F._setState(H.EConnectState.tryconnect),
                                    F.lb_index = 0,
                                    F._fetch_gateway(0)
                            })
                    },
                    u.prototype._ConnectSuccessOb = function () {
                        var u = this;
                        app.Log.log("MJNetMgr _ConnectSuccessOb "),
                            app.NetAgent.sendReq2MJ("FastTest", "authObserve", {
                                token: this.ob_token
                            }, function (Y, F) {
                                Y || F.error ? (uiscript.UIMgr.Inst.showNetReqError("authObserve", Y, F), H.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm()) : (app.Log.log("实时OB验证通过：" + JSON.stringify(F)), uiscript.UI_Loading.Inst.setProgressVal(.3), uiscript.UI_Live_Broadcast.Inst && uiscript.UI_Live_Broadcast.Inst.clearPendingUnits(), app.NetAgent.sendReq2MJ("FastTest", "startObserve", {}, function (Y, F) {
                                    if (Y || F.error)
                                        uiscript.UIMgr.Inst.showNetReqError("startObserve", Y, F), H.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                    else {
                                        var V = F.head,
                                            r = V.game_config.mode,
                                            h = [],
                                            C = H.Tools.strOfLocalization(2003),
                                            B = view.ERuleMode.Liqi4;
                                        r.mode < 10 ? (B = view.ERuleMode.Liqi4, u.real_player_count = 4) : r.mode < 20 && (B = view.ERuleMode.Liqi3, u.real_player_count = 3);
                                        for (var _ = 0; _ < u.real_player_count; _++)
                                            h.push(null);
                                        r.extendinfo && (C = H.Tools.strOfLocalization(2004)),
                                            r.detail_rule && r.detail_rule.ai_level && (1 === r.detail_rule.ai_level && (C = H.Tools.strOfLocalization(2003)), 2 === r.detail_rule.ai_level && (C = H.Tools.strOfLocalization(2004)));
                                        for (var d = H.GameUtility.get_default_ai_skin(), n = H.GameUtility.get_default_ai_character(), _ = 0; _ < V.seat_list.length; _++) {
                                            var M = V.seat_list[_];
                                            if (0 == M)
                                                h[_] = {
                                                    nickname: C,
                                                    avatar_id: d,
                                                    level: {
                                                        id: 10101
                                                    },
                                                    level3: {
                                                        id: 20101
                                                    },
                                                    character: {
                                                        charid: n,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: d,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var t = 0; t < V.players.length; t++)
                                                    if (V.players[t].account_id == M) {
                                                        h[_] = V.players[t];
                                                        break
                                                    }
                                        }
                                        for (var _ = 0; _ < u.real_player_count; _++)
                                            null == h[_] && (h[_] = {
                                                account: 0,
                                                nickname: H.Tools.strOfLocalization(2010),
                                                avatar_id: d,
                                                level: {
                                                    id: 10101
                                                },
                                                level3: {
                                                    id: 20101
                                                },
                                                character: {
                                                    charid: n,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: d,
                                                    is_upgraded: !1
                                                }
                                            });
                                        u._StartObSuccuess(h, F.passed, V.game_config.toJSON(), V.start_time)
                                    }
                                }))
                            })
                    },
                    u.prototype._StartObSuccuess = function (u, Y, F, V) {
                        var r = this;
                        view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                view.DesktopMgr.Inst.Reset(),
                                uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(V, Y)
                        })) : (uiscript.UI_Loading.Inst.setProgressVal(.4), H.Scene_MJ.Inst.openMJRoom(F, u, Laya.Handler.create(this, function () {
                            view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(F)), u, GameMgr.Inst.account_id, view.EMJMode.live_broadcast, Laya.Handler.create(r, function () {
                                uiscript.UI_Loading.Inst.setProgressVal(.9),
                                    Laya.timer.once(1e3, r, function () {
                                        GameMgr.Inst.EnterMJ(),
                                            uiscript.UI_Loading.Inst.setProgressVal(.95),
                                            uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(V, Y)
                                    })
                            }))
                        }), Laya.Handler.create(this, function (H) {
                            return uiscript.UI_Loading.Inst.setProgressVal(.4 + .4 * H)
                        }, null, !1)))
                    },
                    u._Inst = null,
                    u
            }
                ();
            H.MJNetMgr = u
        }
            (game || (game = {}));

        // 读取战绩
        !function (H) {
            var u = function (u) {
                function Y() {
                    var H = u.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.both_ui.otherplayerinfoUI : new ui.both_ui.otherplayerinfo_enUI) || this;
                    return H.account_id = 0,
                        H.origin_x = 0,
                        H.origin_y = 0,
                        H.root = null,
                        H.title = null,
                        H.level = null,
                        H.btn_addfriend = null,
                        H.btn_report = null,
                        H.illust = null,
                        H.name = null,
                        H.detail_data = null,
                        H.achievement_data = null,
                        H.locking = !1,
                        H.tab_info4 = null,
                        H.tab_info3 = null,
                        H.tab_note = null,
                        H.tab_img_dark = "",
                        H.tab_img_chosen = "",
                        H.player_data = null,
                        H.tab_index = 1,
                        H.game_category = 1,
                        H.game_type = 1,
                        Y.Inst = H,
                        H
                }
                return __extends(Y, u),
                    Y.prototype.onCreate = function () {
                        var u = this;
                        "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tab_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tab_dark.png")) : (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tabheng_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tabheng_dark.png")),
                            this.root = this.me.getChildByName("root"),
                            this.origin_x = this.root.x,
                            this.origin_y = this.root.y,
                            this.container_info = this.root.getChildByName("container_info"),
                            this.title = new H.UI_PlayerTitle(this.container_info.getChildByName("title"), "UI_OtherPlayerInfo"),
                            this.name = this.container_info.getChildByName("name"),
                            this.level = new H.UI_Level(this.container_info.getChildByName("rank"), "UI_OtherPlayerInfo"),
                            this.detail_data = new H.UI_PlayerData(this.container_info.getChildByName("data")),
                            this.achievement_data = new H.UI_Achievement_Light(this.container_info.getChildByName("achievement")),
                            this.illust = new H.UI_Character_Skin(this.root.getChildByName("illust").getChildByName("illust")),
                            this.btn_addfriend = this.container_info.getChildByName("btn_add"),
                            this.btn_addfriend.clickHandler = Laya.Handler.create(this, function () {
                                u.btn_addfriend.visible = !1,
                                    u.btn_report.x = 343,
                                    app.NetAgent.sendReq2Lobby("Lobby", "applyFriend", {
                                        target_id: u.account_id
                                    }, function () { })
                            }, null, !1),
                            this.btn_report = this.container_info.getChildByName("btn_report"),
                            this.btn_report.clickHandler = new Laya.Handler(this, function () {
                                H.UI_Report_Nickname.Inst.show(u.account_id)
                            }),
                            this.me.getChildAt(0).clickHandler = Laya.Handler.create(this, function () {
                                u.locking || u.close()
                            }, null, !1),
                            this.root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                u.close()
                            }, null, !1),
                            this.note = new H.UI_PlayerNote(this.root.getChildByName("container_note"), null),
                            this.tab_info4 = this.root.getChildByName("tab_info4"),
                            this.tab_info4.clickHandler = Laya.Handler.create(this, function () {
                                u.locking || 1 != u.tab_index && u.changeMJCategory(1)
                            }, null, !1),
                            this.tab_info3 = this.root.getChildByName("tab_info3"),
                            this.tab_info3.clickHandler = Laya.Handler.create(this, function () {
                                u.locking || 2 != u.tab_index && u.changeMJCategory(2)
                            }, null, !1),
                            this.tab_note = this.root.getChildByName("tab_note"),
                            this.tab_note.clickHandler = Laya.Handler.create(this, function () {
                                u.locking || "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type && (game.Tools.during_chat_close() ? H.UIMgr.Inst.ShowErrorInfo("功能维护中，祝大家新年快乐") : u.container_info.visible && (u.container_info.visible = !1, u.tab_info4.skin = u.tab_img_dark, u.tab_info3.skin = u.tab_img_dark, u.tab_note.skin = u.tab_img_chosen, u.tab_index = 3, u.note.show()))
                            }, null, !1),
                            this.locking = !1
                    },
                    Y.prototype.show = function (u, Y, F, V) {
                        var r = this;
                        void 0 === Y && (Y = 1),
                            void 0 === F && (F = 2),
                            void 0 === V && (V = 1),
                            GameMgr.Inst.BehavioralStatistics(14),
                            this.account_id = u,
                            this.enable = !0,
                            this.locking = !0,
                            this.root.y = this.origin_y,
                            this.player_data = null,
                            H.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                r.locking = !1
                            })),
                            this.detail_data.reset(),
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountStatisticInfo", {
                                account_id: u
                            }, function (Y, F) {
                                Y || F.error ? H.UIMgr.Inst.showNetReqError("fetchAccountStatisticInfo", Y, F) : H.UI_Shilian.now_season_info && 1001 == H.UI_Shilian.now_season_info.season_id && 3 != H.UI_Shilian.get_cur_season_state() ? (r.detail_data.setData(F), r.changeMJCategory(r.tab_index, r.game_category, r.game_type)) : app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountChallengeRankInfo", {
                                    account_id: u
                                }, function (u, Y) {
                                    u || Y.error ? H.UIMgr.Inst.showNetReqError("fetchAccountChallengeRankInfo", u, Y) : (F.season_info = Y.season_info, r.detail_data.setData(F), r.changeMJCategory(r.tab_index, r.game_category, r.game_type))
                                })
                            }),
                            this.note.init_data(u),
                            this.refreshBaseInfo(),
                            this.btn_report.visible = u != GameMgr.Inst.account_id,
                            this.tab_index = Y,
                            this.game_category = F,
                            this.game_type = V,
                            this.container_info.visible = !0,
                            this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_note.skin = this.tab_img_dark,
                            this.note.close(),
                            this.tab_note.visible = "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type,
                            this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                    },
                    Y.prototype.refreshBaseInfo = function () {
                        var u = this;
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
                            }, function (Y, F) {
                                if (Y || F.error)
                                    H.UIMgr.Inst.showNetReqError("fetchAccountInfo", Y, F);
                                else {
                                    var V = F.account;
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (V.account_id == GameMgr.Inst.account_id) {
                                        V.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            V.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            V.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    u.player_data = V,
                                        game.Tools.SetNickname(u.name, V),
                                        u.title.id = game.Tools.titleLocalization(V.account_id, V.title),
                                        u.level.id = V.level.id,
                                        u.level.id = u.player_data[1 == u.tab_index ? "level" : "level3"].id,
                                        u.level.exp = u.player_data[1 == u.tab_index ? "level" : "level3"].score,
                                        u.illust.me.visible = !0,
                                        u.account_id == GameMgr.Inst.account_id ? u.illust.setSkin(V.avatar_id, "waitingroom") : u.illust.setSkin(game.GameUtility.get_limited_skin_id(V.avatar_id), "waitingroom"),
                                        game.Tools.is_same_zone(GameMgr.Inst.account_id, u.account_id) && u.account_id != GameMgr.Inst.account_id && null == game.FriendMgr.find(u.account_id) ? (u.btn_addfriend.visible = !0, u.btn_report.x = 520) : (u.btn_addfriend.visible = !1, u.btn_report.x = 343),
                                        u.note.sign.setSign(V.signature),
                                        u.achievement_data.show(!1, V.achievement_count)
                                }
                            })
                    },
                    Y.prototype.changeMJCategory = function (H, u, Y) {
                        void 0 === u && (u = 2),
                            void 0 === Y && (Y = 1),
                            this.tab_index = H,
                            this.container_info.visible = !0,
                            this.detail_data.changeMJCategory(H, u, Y),
                            this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                            this.tab_note.skin = this.tab_img_dark,
                            this.note.close(),
                            this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                    },
                    Y.prototype.close = function () {
                        var u = this;
                        this.enable && (this.locking || (this.locking = !0, this.detail_data.close(), H.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                            u.locking = !1,
                                u.enable = !1
                        }))))
                    },
                    Y.prototype.onEnable = function () {
                        game.TempImageMgr.setUIEnable("UI_OtherPlayerInfo", !0)
                    },
                    Y.prototype.onDisable = function () {
                        game.TempImageMgr.setUIEnable("UI_OtherPlayerInfo", !1),
                            this.detail_data.close(),
                            this.illust.clear(),
                            Laya.loader.clearTextureRes(this.level.icon.skin)
                    },
                    Y.Inst = null,
                    Y
            }
                (H.UIBase);
            H.UI_OtherPlayerInfo = u
        }
            (uiscript || (uiscript = {}));

        // 宿舍相关
        !function (H) {
            var u = function () {
                function u(u, F) {
                    var V = this;
                    this._scale = 1,
                        this.during_move = !1,
                        this.mouse_start_x = 0,
                        this.mouse_start_y = 0,
                        this.me = u,
                        this.container_illust = F,
                        this.illust = this.container_illust.getChildByName("illust"),
                        this.container_move = u.getChildByName("move"),
                        this.container_move.on("mousedown", this, function () {
                            V.during_move = !0,
                                V.mouse_start_x = V.container_move.mouseX,
                                V.mouse_start_y = V.container_move.mouseY
                        }),
                        this.container_move.on("mousemove", this, function () {
                            V.during_move && (V.move(V.container_move.mouseX - V.mouse_start_x, V.container_move.mouseY - V.mouse_start_y), V.mouse_start_x = V.container_move.mouseX, V.mouse_start_y = V.container_move.mouseY)
                        }),
                        this.container_move.on("mouseup", this, function () {
                            V.during_move = !1
                        }),
                        this.container_move.on("mouseout", this, function () {
                            V.during_move = !1
                        }),
                        this.btn_big = u.getChildByName("btn_big"),
                        this.btn_big.clickHandler = Laya.Handler.create(this, function () {
                            V.locking || V.bigger()
                        }, null, !1),
                        this.btn_small = u.getChildByName("btn_small"),
                        this.btn_small.clickHandler = Laya.Handler.create(this, function () {
                            V.locking || V.smaller()
                        }, null, !1),
                        this.btn_close = u.getChildByName("btn_close"),
                        this.btn_close.clickHandler = Laya.Handler.create(this, function () {
                            V.locking || V.close()
                        }, null, !1),
                        this.scrollbar = u.getChildByName("scrollbar").scriptMap["capsui.CScrollBar"],
                        this.scrollbar.init(new Laya.Handler(this, function (H) {
                            V._scale = 1 * (1 - H) + .5,
                                V.illust.scaleX = V._scale,
                                V.illust.scaleY = V._scale,
                                V.scrollbar.setVal(H, 0)
                        })),
                        this.dongtai_kaiguan = new H.UI_Dongtai_Kaiguan(this.me.getChildByName("dongtai"), new Laya.Handler(this, function () {
                            Y.Inst.illust.resetSkin()
                        }), new Laya.Handler(this, function (H) {
                            Y.Inst.illust.playAnim(H)
                        }))
                }
                return Object.defineProperty(u.prototype, "scale", {
                    get: function () {
                        return this._scale
                    },
                    set: function (H) {
                        this._scale = H,
                            this.scrollbar.setVal(1 - (H - .5) / 1, 0)
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    u.prototype.show = function (u) {
                        var F = this;
                        this.locking = !0,
                            this.when_close = u,
                            this.illust_start_x = this.illust.x,
                            this.illust_start_y = this.illust.y,
                            this.illust_center_x = this.illust.x + 984 - 446,
                            this.illust_center_y = this.illust.y + 11 - 84,
                            this.container_illust.getChildByName("container_name").visible = !1,
                            this.container_illust.getChildByName("container_name_en").visible = !1,
                            this.container_illust.getChildByName("btn").visible = !1,
                            Y.Inst.stopsay(),
                            this.scale = 1,
                            Laya.Tween.to(this.illust, {
                                x: this.illust_center_x,
                                y: this.illust_center_y
                            }, 200),
                            H.UIBase.anim_pop_out(this.btn_big, null),
                            H.UIBase.anim_pop_out(this.btn_small, null),
                            H.UIBase.anim_pop_out(this.btn_close, null),
                            this.during_move = !1,
                            Laya.timer.once(250, this, function () {
                                F.locking = !1
                            }),
                            this.me.visible = !0,
                            this.dongtai_kaiguan.refresh(Y.Inst.illust.skin_id)
                    },
                    u.prototype.close = function () {
                        var u = this;
                        this.locking = !0,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? this.container_illust.getChildByName("container_name").visible = !0 : this.container_illust.getChildByName("container_name_en").visible = !0,
                            this.container_illust.getChildByName("btn").visible = !0,
                            Laya.Tween.to(this.illust, {
                                x: this.illust_start_x,
                                y: this.illust_start_y,
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            H.UIBase.anim_pop_hide(this.btn_big, null),
                            H.UIBase.anim_pop_hide(this.btn_small, null),
                            H.UIBase.anim_pop_hide(this.btn_close, null),
                            Laya.timer.once(250, this, function () {
                                u.locking = !1,
                                    u.me.visible = !1,
                                    u.when_close.run()
                            })
                    },
                    u.prototype.bigger = function () {
                        1.1 * this.scale > 1.5 ? this.scale = 1.5 : this.scale *= 1.1,
                            Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0)
                    },
                    u.prototype.smaller = function () {
                        this.scale / 1.1 < .5 ? this.scale = .5 : this.scale /= 1.1,
                            Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0)
                    },
                    u.prototype.move = function (H, u) {
                        var Y = this.illust.x + H,
                            F = this.illust.y + u;
                        Y < this.illust_center_x - 600 ? Y = this.illust_center_x - 600 : Y > this.illust_center_x + 600 && (Y = this.illust_center_x + 600),
                            F < this.illust_center_y - 1200 ? F = this.illust_center_y - 1200 : F > this.illust_center_y + 800 && (F = this.illust_center_y + 800),
                            this.illust.x = Y,
                            this.illust.y = F
                    },
                    u
            }
                (),
                Y = function (Y) {
                    function F() {
                        var H = Y.call(this, new ui.lobby.susheUI) || this;
                        return H.contianer_illust = null,
                            H.illust = null,
                            H.illust_rect = null,
                            H.container_name = null,
                            H.label_name = null,
                            H.label_cv = null,
                            H.label_cv_title = null,
                            H.container_page = null,
                            H.container_look_illust = null,
                            H.page_select_character = null,
                            H.page_visit_character = null,
                            H.origin_illust_x = 0,
                            H.chat_id = 0,
                            H.container_chat = null,
                            H._select_index = 0,
                            H.sound_channel = null,
                            H.chat_block = null,
                            H.illust_showing = !0,
                            F.Inst = H,
                            H
                    }
                    return __extends(F, Y),
                        F.init = function (u) {
                            var Y = this;
                            app.NetAgent.sendReq2Lobby("Lobby", "fetchCharacterInfo", {}, function (V, r) {
                                if (V || r.error)
                                    H.UIMgr.Inst.showNetReqError("fetchCharacterInfo", V, r);
                                else {
                                    if (app.Log.log("fetchCharacterInfo: " + JSON.stringify(r)), r = JSON.parse(JSON.stringify(r)), r.main_character_id && r.characters) {
                                        //if (Y.characters = [], r.characters)
                                        //    for (var h = 0; h < r.characters.length; h++)
                                        //        Y.characters.push(r.characters[h]);
                                        //if (Y.skin_map = {}, r.skins)
                                        //    for (var h = 0; h < r.skins.length; h++)
                                        //        Y.skin_map[r.skins[h]] = 1;
                                        //Y.main_character_id = r.main_character_id
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        Y.characters = [];
                                        for (var j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                            var id = 200000 + j;
                                            var skin = 400001 + j * 100;
                                            Y.characters.push({
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

                                        Y.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;

                                        // END
                                    } else
                                        Y.characters = [], Y.characters.push({
                                            charid: 200001,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: 400101,
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), Y.characters.push({
                                            charid: 200002,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: 400201,
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), Y.skin_map[400101] = 1, Y.skin_map[400201] = 1, Y.main_character_id = 200001;
                                    if (Y.send_gift_count = 0, Y.send_gift_limit = 0, r.send_gift_count && (Y.send_gift_count = r.send_gift_count), r.send_gift_limit && (Y.send_gift_limit = r.send_gift_limit), r.finished_endings)
                                        for (var h = 0; h < r.finished_endings.length; h++)
                                            Y.finished_endings_map[r.finished_endings[h]] = 1;
                                    if (r.rewarded_endings)
                                        for (var h = 0; h < r.rewarded_endings.length; h++)
                                            Y.rewarded_endings_map[r.rewarded_endings[h]] = 1;
                                    if (Y.star_chars = [], r.character_sort && (Y.star_chars = r.character_sort), F.hidden_characters_map = {}, r.hidden_characters)
                                        for (var C = 0, B = r.hidden_characters; C < B.length; C++) {
                                            var _ = B[C];
                                            F.hidden_characters_map[_] = 1
                                        }
                                    u.run()
                                }
                            }),
                                //app.NetAgent.sendReq2Lobby("Lobby", "fetchAllCommonViews", {}, function (u, F) {
                                //    if (u || F.error)
                                //        H.UIMgr.Inst.showNetReqError("fetchAllCommonViews", u, F);
                                //    else {
                                //        Y.using_commonview_index = F.use,
                                Y.using_commonview_index = MMP.settings.using_commonview_index;
                            Y.commonViewList = [[], [], [], [], [], [], [], []];
                            //        var V = F.views;
                            //        if (V)
                            //            for (var r = 0; r < V.length; r++) {
                            //                var h = V[r].values;
                            //               h && (Y.commonViewList[V[r].index] = h)
                            //            }
                            Y.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst.load_mjp_view();
                            GameMgr.Inst.load_touming_mjp_view();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //})
                        },
                        F.on_data_updata = function (u) {
                            if (u.character) {
                                var Y = JSON.parse(JSON.stringify(u.character));
                                if (Y.characters)
                                    for (var F = Y.characters, V = 0; V < F.length; V++) {
                                        for (var r = !1, h = 0; h < this.characters.length; h++)
                                            if (this.characters[h].charid == F[V].charid) {
                                                this.characters[h] = F[V],
                                                    H.UI_Sushe_Visit.Inst && H.UI_Sushe_Visit.Inst.chara_info && H.UI_Sushe_Visit.Inst.chara_info.charid == this.characters[h].charid && (H.UI_Sushe_Visit.Inst.chara_info = this.characters[h]),
                                                    r = !0;
                                                break
                                            }
                                        r || this.characters.push(F[V])
                                    }
                                if (Y.skins) {
                                    for (var C = Y.skins, V = 0; V < C.length; V++)
                                        this.skin_map[C[V]] = 1;
                                    H.UI_Bag.Inst.on_skin_change()
                                }
                                if (Y.finished_endings) {
                                    for (var B = Y.finished_endings, V = 0; V < B.length; V++)
                                        this.finished_endings_map[B[V]] = 1;
                                    H.UI_Sushe_Visit.Inst
                                }
                                if (Y.rewarded_endings) {
                                    for (var B = Y.rewarded_endings, V = 0; V < B.length; V++)
                                        this.rewarded_endings_map[B[V]] = 1;
                                    H.UI_Sushe_Visit.Inst
                                }
                            }
                        },
                        F.chara_owned = function (H) {
                            for (var u = 0; u < this.characters.length; u++)
                                if (this.characters[u].charid == H)
                                    return !0;
                            return !1
                        },
                        F.skin_owned = function (H) {
                            return this.skin_map.hasOwnProperty(H.toString())
                        },
                        F.add_skin = function (H) {
                            this.skin_map[H] = 1
                        },
                        Object.defineProperty(F, "main_chara_info", {
                            get: function () {
                                for (var H = 0; H < this.characters.length; H++)
                                    if (this.characters[H].charid == this.main_character_id)
                                        return this.characters[H];
                                return null
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        F.on_view_remove = function (H) {
                            for (var u = 0; u < this.commonViewList.length; u++)
                                for (var Y = this.commonViewList[u], F = 0; F < Y.length; F++)
                                    if (Y[F].item_id == H) {
                                        Y[F].item_id = game.GameUtility.get_view_default_item_id(Y[F].slot);
                                        break
                                    }
                            var V = cfg.item_definition.item.get(H);
                            V.type == game.EView.head_frame && GameMgr.Inst.account_data.avatar_frame == H && (GameMgr.Inst.account_data.avatar_frame = game.GameUtility.get_view_default_item_id(game.EView.head_frame))
                        },
                        F.add_finish_ending = function (H) {
                            this.finished_endings_map[H] = 1
                        },
                        F.add_reward_ending = function (H) {
                            this.rewarded_endings_map[H] = 1
                        },
                        F.check_all_char_repoint = function () {
                            for (var H = 0; H < F.characters.length; H++)
                                if (this.check_char_redpoint(F.characters[H]))
                                    return !0;
                            return !1
                        },
                        F.check_char_redpoint = function (H) {
                            // 去除小红点
                            return 0;
                            // END
                            var u = cfg.spot.spot.getGroup(H.charid);
                            if (u)
                                for (var Y = 0; Y < u.length; Y++) {
                                    var V = u[Y];
                                    if (!(V.is_married && !H.is_upgraded || !V.is_married && H.level < V.level_limit) && 2 == V.type) {
                                        for (var r = !0, h = 0; h < V.jieju.length; h++)
                                            if (V.jieju[h] && F.finished_endings_map[V.jieju[h]]) {
                                                if (!F.rewarded_endings_map[V.jieju[h]])
                                                    return !0;
                                                r = !1
                                            }
                                        if (r)
                                            return !0
                                    }
                                }
                            return !1
                        },
                        F.is_char_star = function (H) {
                            return -1 != this.star_chars.indexOf(H)
                        },
                        F.change_char_star = function (H) {
                            var u = this.star_chars.indexOf(H);
                            -1 != u ? this.star_chars.splice(u, 1) : this.star_chars.push(H),
                                MMP.settings.star_chars = uiscript.UI_Sushe.star_chars,
                                MMP.saveSettings();
                            // 屏蔽网络请求
                            //    app.NetAgent.sendReq2Lobby("Lobby", "updateCharacterSort", {
                            //        sort: this.star_chars
                            //    }, function () { })
                            // END
                        },
                        Object.defineProperty(F.prototype, "select_index", {
                            get: function () {
                                return this._select_index
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        F.prototype.reset_select_index = function () {
                            this._select_index = -1
                        },
                        F.prototype.onCreate = function () {
                            var Y = this;
                            this.contianer_illust = this.me.getChildByName("illust"),
                                this.illust = new H.UI_Character_Skin(this.contianer_illust.getChildByName("illust").getChildByName("illust")),
                                this.illust_rect = H.UIRect.CreateFromSprite(this.illust.me),
                                this.container_chat = this.contianer_illust.getChildByName("chat"),
                                this.chat_block = new H.UI_Character_Chat(this.container_chat),
                                this.contianer_illust.getChildByName("btn").clickHandler = Laya.Handler.create(this, function () {
                                    if (!Y.page_visit_character.me.visible || !Y.page_visit_character.cannot_click_say)
                                        if (Y.illust.onClick(), Y.sound_channel)
                                            Y.stopsay();
                                        else {
                                            if (!Y.illust_showing)
                                                return;
                                            Y.say("lobby_normal")
                                        }
                                }, null, !1),
                                this.container_name = null,
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.container_name = this.contianer_illust.getChildByName("container_name"), this.contianer_illust.getChildByName("container_name_en").visible = !1, this.label_cv_title = this.container_name.getChildByName("label_CV_title")) : (this.container_name = this.contianer_illust.getChildByName("container_name_en"), this.contianer_illust.getChildByName("container_name").visible = !1),
                                this.label_name = this.container_name.getChildByName("label_name"),
                                this.label_cv = this.container_name.getChildByName("label_CV"),
                                this.origin_illust_x = this.contianer_illust.x,
                                this.container_page = this.me.getChildByName("container_page"),
                                this.page_select_character = new H.UI_Sushe_Select,
                                this.container_page.addChild(this.page_select_character.me),
                                this.page_visit_character = new H.UI_Sushe_Visit,
                                this.container_page.addChild(this.page_visit_character.me),
                                this.container_look_illust = new u(this.me.getChildByName("look_illust"), this.contianer_illust)
                        },
                        F.prototype.show = function (H) {
                            GameMgr.Inst.BehavioralStatistics(15),
                                game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                this.enable = !0,
                                this.page_visit_character.me.visible = !1,
                                this.container_look_illust.me.visible = !1;
                            for (var u = 0, Y = 0; Y < F.characters.length; Y++)
                                if (F.characters[Y].charid == F.main_character_id) {
                                    u = Y;
                                    break
                                }
                            0 == H ? (this.change_select(u), this.show_page_select()) : (this._select_index = -1, this.illust_showing = !1, this.contianer_illust.visible = !1, this.page_select_character.show(1))
                        },
                        F.prototype.starup_back = function () {
                            this.enable = !0,
                                this.change_select(this._select_index),
                                this.page_visit_character.show(F.characters[this._select_index], 0),
                                this.page_visit_character.show_gift_page(),
                                this.page_visit_character.show_levelup()
                        },
                        F.prototype.spot_back = function () {
                            this.enable = !0,
                                this.change_select(this._select_index),
                                this.page_visit_character.show(F.characters[this._select_index], 2)
                        },
                        F.prototype.go2Lobby = function () {
                            this.close(Laya.Handler.create(this, function () {
                                H.UIMgr.Inst.showLobby()
                            }))
                        },
                        F.prototype.close = function (u) {
                            var Y = this;
                            this.illust_showing && H.UIBase.anim_alpha_out(this.contianer_illust, {
                                x: -30
                            }, 150, 0),
                                Laya.timer.once(150, this, function () {
                                    Y.enable = !1,
                                        u && u.run()
                                })
                        },
                        F.prototype.onDisable = function () {
                            view.AudioMgr.refresh_music_volume(!1),
                                this.illust.clear(),
                                this.stopsay(),
                                this.container_look_illust.me.visible && this.container_look_illust.close()
                        },
                        F.prototype.hide_illust = function () {
                            var u = this;
                            this.illust_showing && (this.illust_showing = !1, H.UIBase.anim_alpha_out(this.contianer_illust, {
                                x: -30
                            }, 200, 0, Laya.Handler.create(this, function () {
                                u.contianer_illust.visible = !1
                            })))
                        },
                        F.prototype.open_illust = function () {
                            if (!this.illust_showing)
                                if (this.illust_showing = !0, this._select_index >= 0)
                                    this.contianer_illust.visible = !0, this.contianer_illust.alpha = 1, H.UIBase.anim_alpha_in(this.contianer_illust, {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var u = 0, Y = 0; Y < F.characters.length; Y++)
                                        if (F.characters[Y].charid == F.main_character_id) {
                                            u = Y;
                                            break
                                        }
                                    this.change_select(u)
                                }
                        },
                        F.prototype.show_page_select = function () {
                            this.page_select_character.show(0)
                        },
                        F.prototype.show_page_visit = function (H) {
                            void 0 === H && (H = 0),
                                this.page_visit_character.show(F.characters[this._select_index], H)
                        },
                        F.prototype.change_select = function (u) {
                            this._select_index = u,
                                this.illust.clear(),
                                this.illust_showing = !0;
                            var Y = F.characters[u];
                            this.label_name.text = "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? cfg.item_definition.character.get(Y.charid)["name_" + GameMgr.client_language].replace("-", "|") : cfg.item_definition.character.get(Y.charid)["name_" + GameMgr.client_language],
                                "chs" == GameMgr.client_language && (this.label_name.font = -1 != F.chs_fengyu_name_lst.indexOf(Y.charid) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.label_cv.text = cfg.item_definition.character.get(Y.charid)["desc_cv_" + GameMgr.client_language], this.label_cv_title.text = "CV") : this.label_cv.text = "CV:" + cfg.item_definition.character.get(Y.charid)["desc_cv_" + GameMgr.client_language],
                                "chs" == GameMgr.client_language && (this.label_cv.font = -1 != F.chs_fengyu_cv_lst.indexOf(Y.charid) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language) && (this.label_cv_title.y = 355 - this.label_cv.textField.textHeight / 2 * .7);
                            var V = new H.UIRect;
                            V.x = this.illust_rect.x,
                                V.y = this.illust_rect.y,
                                V.width = this.illust_rect.width,
                                V.height = this.illust_rect.height,
                                405503 == Y.skin && (V.y -= 70),
                                this.illust.setRect(V),
                                this.illust.setSkin(Y.skin, "full"),
                                this.contianer_illust.visible = !0,
                                Laya.Tween.clearAll(this.contianer_illust),
                                this.contianer_illust.x = this.origin_illust_x,
                                this.contianer_illust.alpha = 1,
                                H.UIBase.anim_alpha_in(this.contianer_illust, {
                                    x: -30
                                }, 230),
                                this.stopsay();
                            var r = cfg.item_definition.skin.get(Y.skin);
                            r.spine_type ? (this.page_select_character.changeKaiguanShow(!0), this.container_look_illust.dongtai_kaiguan.show(this.illust.skin_id)) : (this.page_select_character.changeKaiguanShow(!1), this.container_look_illust.dongtai_kaiguan.hide())
                        },
                        F.prototype.onChangeSkin = function (H) {
                            F.characters[this._select_index].skin = H,
                                this.change_select(this._select_index),
                                F.characters[this._select_index].charid == F.main_character_id && (GameMgr.Inst.account_data.avatar_id = H),
                                // 屏蔽换肤请求
                                //app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                //    character_id: n.characters[this._select_index].charid,
                                //    skin: t
                                //}, function () { })
                                // 保存皮肤
                                MMP.settings.characters[this._select_index] = H;
                            MMP.saveSettings();
                            // END
                        },
                        F.prototype.say = function (H) {
                            var u = this,
                                Y = F.characters[this._select_index];
                            this.chat_id++;
                            var V = this.chat_id,
                                r = view.AudioMgr.PlayCharactorSound(Y, H, Laya.Handler.create(this, function () {
                                    Laya.timer.once(1e3, u, function () {
                                        V == u.chat_id && u.stopsay()
                                    })
                                }));
                            r && (this.chat_block.show(r.words), this.sound_channel = r.sound)
                        },
                        F.prototype.stopsay = function () {
                            this.chat_block.close(!1),
                                this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null)
                        },
                        F.prototype.to_look_illust = function () {
                            var H = this;
                            this.container_look_illust.show(Laya.Handler.create(this, function () {
                                H.illust.playAnim("idle"),
                                    H.page_select_character.show(0)
                            }))
                        },
                        F.prototype.jump_to_char_skin = function (u, Y) {
                            var V = this;
                            if (void 0 === u && (u = -1), void 0 === Y && (Y = null), u >= 0)
                                for (var r = 0; r < F.characters.length; r++)
                                    if (F.characters[r].charid == u) {
                                        this.change_select(r);
                                        break
                                    }
                            H.UI_Sushe_Select.Inst.close(Laya.Handler.create(this, function () {
                                F.Inst.show_page_visit(),
                                    V.page_visit_character.show_pop_skin(),
                                    V.page_visit_character.set_jump_callback(Y)
                            }))
                        },
                        F.prototype.jump_to_char_qiyue = function (u) {
                            var Y = this;
                            if (void 0 === u && (u = -1), u >= 0)
                                for (var V = 0; V < F.characters.length; V++)
                                    if (F.characters[V].charid == u) {
                                        this.change_select(V);
                                        break
                                    }
                            H.UI_Sushe_Select.Inst.close(Laya.Handler.create(this, function () {
                                F.Inst.show_page_visit(),
                                    Y.page_visit_character.show_qiyue()
                            }))
                        },
                        F.characters = [],
                        F.chs_fengyu_name_lst = [200040, 200043],
                        F.chs_fengyu_cv_lst = [200047, 200050, 200054],
                        F.skin_map = {},
                        F.main_character_id = 0,
                        F.send_gift_count = 0,
                        F.send_gift_limit = 0,
                        F.commonViewList = [],
                        F.using_commonview_index = 0,
                        F.finished_endings_map = {},
                        F.rewarded_endings_map = {},
                        F.star_chars = [],
                        F.hidden_characters_map = {},
                        F.Inst = null,
                        F
                }
                    (H.UIBase);
            H.UI_Sushe = Y
        }
            (uiscript || (uiscript = {}));

        // 屏蔽改变宿舍角色的网络请求
        !function (H) {
            var u = function () {
                function u(u) {
                    var F = this;
                    this.scrollview = null,
                        this.select_index = 0,
                        this.show_index_list = [],
                        this.only_show_star_char = !1,
                        this.me = u,
                        this.me.getChildByName("btn_visit").clickHandler = Laya.Handler.create(this, function () {
                            Y.Inst.locking || Y.Inst.close(Laya.Handler.create(F, function () {
                                H.UI_Sushe.Inst.show_page_visit()
                            }))
                        }, null, !1),
                        this.me.getChildByName("btn_look").clickHandler = Laya.Handler.create(this, function () {
                            Y.Inst.locking || Y.Inst.close(Laya.Handler.create(F, function () {
                                H.UI_Sushe.Inst.to_look_illust()
                            }))
                        }, null, !1),
                        this.me.getChildByName("btn_huanzhuang").clickHandler = Laya.Handler.create(this, function () {
                            Y.Inst.locking || H.UI_Sushe.Inst.jump_to_char_skin()
                        }, null, !1),
                        this.me.getChildByName("btn_star").clickHandler = Laya.Handler.create(this, function () {
                            Y.Inst.locking || F.onChangeStarShowBtnClick()
                        }, null, !1),
                        this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                        this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3),
                        this.scrollview.setElastic(),
                        this.dongtai_kaiguan = new H.UI_Dongtai_Kaiguan(this.me.getChildByName("dongtai"), new Laya.Handler(this, function () {
                            H.UI_Sushe.Inst.illust.resetSkin()
                        }))
                }
                return u.prototype.show = function (u, Y) {
                    void 0 === Y && (Y = !1),
                        this.me.visible = !0,
                        u ? this.me.alpha = 1 : H.UIBase.anim_alpha_in(this.me, {
                            x: 0
                        }, 200, 0),
                        this.getShowStarState(),
                        this.sortShowCharsList(),
                        Y || (this.me.getChildByName("btn_star").getChildAt(1).x = this.only_show_star_char ? 107 : 47),
                        this.scrollview.reset(),
                        this.scrollview.addItem(this.show_index_list.length)
                },
                    u.prototype.render_character_cell = function (u) {
                        var Y = this,
                            F = u.index,
                            V = u.container,
                            r = u.cache_data;
                        V.visible = !0,
                            r.index = F,
                            r.inited || (r.inited = !0, V.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                Y.onClickAtHead(r.index)
                            }), r.skin = new H.UI_Character_Skin(V.getChildByName("btn").getChildByName("head")), r.bg = V.getChildByName("btn").getChildByName("bg"), r.bound = V.getChildByName("btn").getChildByName("bound"), r.btn_star = V.getChildByName("btn_star"), r.star = V.getChildByName("btn").getChildByName("star"), r.btn_star.clickHandler = new Laya.Handler(this, function () {
                                Y.onClickAtStar(r.index)
                            }));
                        var h = V.getChildByName("btn");
                        h.getChildByName("choose").visible = F == this.select_index;
                        var C = this.getCharInfoByIndex(F);
                        h.getChildByName("redpoint").visible = H.UI_Sushe.check_char_redpoint(C),
                            r.skin.setSkin(C.skin, "bighead"),
                            h.getChildByName("using").visible = C.charid == H.UI_Sushe.main_character_id,
                            V.getChildByName("btn").getChildByName("bg").skin = game.Tools.localUISrc("myres/sushe/bg_head" + (C.is_upgraded ? "2.png" : ".png"));
                        var B = cfg.item_definition.character.get(C.charid);
                        "en" == GameMgr.client_language || "jp" == GameMgr.client_language ? r.bound.skin = B.ur ? game.Tools.localUISrc("myres/sushe/bg_head_bound" + (C.is_upgraded ? "4.png" : "3.png")) : game.Tools.localUISrc("myres/sushe/en_head_bound" + (C.is_upgraded ? "2.png" : ".png")) : B.ur ? (r.bound.pos(-10, -2), r.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (C.is_upgraded ? "6.png" : "5.png"))) : (r.bound.pos(4, 20), r.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (C.is_upgraded ? "4.png" : "3.png"))),
                            r.btn_star.visible = this.select_index == F,
                            r.star.visible = H.UI_Sushe.is_char_star(C.charid) || this.select_index == F,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (r.star.skin = game.Tools.localUISrc("myres/sushe/tag_star_" + (H.UI_Sushe.is_char_star(C.charid) ? "l" : "d") + (C.is_upgraded ? "1.png" : ".png")), h.getChildByName("label_name").text = cfg.item_definition.character.find(C.charid)["name_" + GameMgr.client_language].replace("-", "|")) : (r.star.skin = game.Tools.localUISrc("myres/sushe/tag_star_" + (H.UI_Sushe.is_char_star(C.charid) ? "l.png" : "d.png")), h.getChildByName("label_name").text = cfg.item_definition.character.find(C.charid)["name_" + GameMgr.client_language]),
                            ("chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language) && (200041 == C.charid ? (h.getChildByName("label_name").scaleX = .67, h.getChildByName("label_name").scaleY = .57) : (h.getChildByName("label_name").scaleX = .7, h.getChildByName("label_name").scaleY = .6))
                    },
                    u.prototype.onClickAtHead = function (u) {
                        if (this.select_index == u) {
                            var Y = this.getCharInfoByIndex(u);
                            if (Y.charid != H.UI_Sushe.main_character_id)
                                if (H.UI_PiPeiYuYue.Inst.enable)
                                    H.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(2769));
                                else {
                                    var F = H.UI_Sushe.main_character_id;
                                    H.UI_Sushe.main_character_id = Y.charid,
                                        // app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                        //    character_id: t.UI_Sushe.main_character_id
                                        // }, function (t, e) {}),
                                        GameMgr.Inst.account_data.avatar_id = Y.skin;
                                    // 保存人物和皮肤
                                    MMP.settings.character = Y.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = Y.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var V = 0; V < this.show_index_list.length; V++)
                                        this.getCharInfoByIndex(V).charid == F && this.scrollview.wantToRefreshItem(V);
                                    this.scrollview.wantToRefreshItem(u)
                                }
                        } else {
                            var r = this.select_index;
                            this.select_index = u,
                                r >= 0 && this.scrollview.wantToRefreshItem(r),
                                this.scrollview.wantToRefreshItem(u),
                                H.UI_Sushe.Inst.change_select(this.show_index_list[u])
                        }
                    },
                    u.prototype.onClickAtStar = function (u) {
                        if (H.UI_Sushe.change_char_star(this.getCharInfoByIndex(u).charid), this.only_show_star_char)
                            this.scrollview.wantToRefreshItem(u);
                        else if (this.show(!0), Math.floor(this.show_index_list.length / 3) - 3 > 0) {
                            var Y = (Math.floor(this.select_index / 3) - 1) / (Math.floor(this.show_index_list.length / 3) - 3);
                            this.scrollview.rate = Math.min(1, Math.max(0, Y))
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    u.prototype.close = function (u) {
                        var Y = this;
                        this.me.visible && (u ? this.me.visible = !1 : H.UIBase.anim_alpha_out(this.me, {
                            x: 0
                        }, 200, 0, Laya.Handler.create(this, function () {
                            Y.me.visible = !1
                        })))
                    },
                    u.prototype.onChangeStarShowBtnClick = function () {
                        if (!this.only_show_star_char) {
                            for (var u = !1, Y = 0, F = H.UI_Sushe.star_chars; Y < F.length; Y++) {
                                var V = F[Y];
                                if (!H.UI_Sushe.hidden_characters_map[V]) {
                                    u = !0;
                                    break
                                }
                            }
                            if (!u)
                                return H.UI_SecondConfirm.Inst.show_only_confirm(game.Tools.strOfLocalization(3301)), void 0
                        }
                        H.UI_Sushe.Inst.change_select(this.show_index_list.length > 0 ? this.show_index_list[0] : 0),
                            this.only_show_star_char = !this.only_show_star_char,
                            app.PlayerBehaviorStatistic.update_val(app.EBehaviorType.Chara_Show_Star, this.only_show_star_char ? 1 : 0);
                        var r = this.me.getChildByName("btn_star").getChildAt(1);
                        Laya.Tween.clearAll(r),
                            Laya.Tween.to(r, {
                                x: this.only_show_star_char ? 107 : 47
                            }, 150),
                            this.show(!0, !0)
                    },
                    u.prototype.getShowStarState = function () {
                        if (0 == H.UI_Sushe.star_chars.length)
                            return this.only_show_star_char = !1, void 0;
                        if (this.only_show_star_char = 1 == app.PlayerBehaviorStatistic.get_val(app.EBehaviorType.Chara_Show_Star), this.only_show_star_char) {
                            for (var u = 0, Y = H.UI_Sushe.star_chars; u < Y.length; u++) {
                                var F = Y[u];
                                if (!H.UI_Sushe.hidden_characters_map[F])
                                    return
                            }
                            this.only_show_star_char = !1,
                                app.PlayerBehaviorStatistic.update_val(app.EBehaviorType.Chara_Show_Star, 0)
                        }
                    },
                    u.prototype.sortShowCharsList = function () {
                        this.show_index_list = [],
                            this.select_index = -1;
                        for (var u = 0, Y = H.UI_Sushe.star_chars; u < Y.length; u++) {
                            var F = Y[u];
                            if (!H.UI_Sushe.hidden_characters_map[F])
                                for (var V = 0; V < H.UI_Sushe.characters.length; V++)
                                    if (H.UI_Sushe.characters[V].charid == F) {
                                        V == H.UI_Sushe.Inst.select_index && (this.select_index = this.show_index_list.length),
                                            this.show_index_list.push(V);
                                        break
                                    }
                        }
                        if (!this.only_show_star_char)
                            for (var V = 0; V < H.UI_Sushe.characters.length; V++)
                                H.UI_Sushe.hidden_characters_map[H.UI_Sushe.characters[V].charid] || -1 == this.show_index_list.indexOf(V) && (V == H.UI_Sushe.Inst.select_index && (this.select_index = this.show_index_list.length), this.show_index_list.push(V))
                    },
                    u.prototype.getCharInfoByIndex = function (u) {
                        return H.UI_Sushe.characters[this.show_index_list[u]]
                    },
                    u
            }
                (),
                Y = function (Y) {
                    function F() {
                        var H = Y.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.lobby.sushe_selectUI : new ui.lobby.sushe_select_enUI) || this;
                        return H.bg_width_head = 962,
                            H.bg_width_zhuangban = 1819,
                            H.bg2_delta = -29,
                            H.container_top = null,
                            H.locking = !1,
                            H.tabs = [],
                            H.tab_index = 0,
                            F.Inst = H,
                            H
                    }
                    return __extends(F, Y),
                        F.prototype.onCreate = function () {
                            var Y = this;
                            this.container_top = this.me.getChildByName("top"),
                                this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                    Y.locking || (1 == Y.tab_index && Y.container_zhuangban.changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(Y, function () {
                                        Y.close(),
                                            H.UI_Sushe.Inst.go2Lobby()
                                    }), null) : (Y.close(), H.UI_Sushe.Inst.go2Lobby()))
                                }, null, !1),
                                this.root = this.me.getChildByName("root"),
                                this.bg2 = this.root.getChildByName("bg2"),
                                this.bg = this.root.getChildByName("bg");
                            for (var F = this.root.getChildByName("container_tabs"), V = function (u) {
                                r.tabs.push(F.getChildAt(u)),
                                    r.tabs[u].clickHandler = new Laya.Handler(r, function () {
                                        Y.locking || Y.tab_index != u && (1 == Y.tab_index && Y.container_zhuangban.changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(Y, function () {
                                            Y.change_tab(u)
                                        }), null) : Y.change_tab(u))
                                    })
                            }, r = this, h = 0; h < F.numChildren; h++)
                                V(h);
                            this.container_head = new u(this.root.getChildByName("container_heads")),
                                this.container_zhuangban = new H.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                    return Y.locking
                                }))
                        },
                        F.prototype.show = function (u) {
                            var Y = this;
                            this.enable = !0,
                                this.locking = !0,
                                this.container_head.dongtai_kaiguan.refresh(),
                                this.tab_index = u,
                                0 == this.tab_index ? (this.bg.width = this.bg_width_head, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.close(!0), this.container_head.show(!0), H.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200), H.UIBase.anim_alpha_in(this.root, {
                                    x: 30
                                }, 200)) : (this.bg.width = this.bg_width_zhuangban, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.show(!0), this.container_head.close(!0), H.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200), H.UIBase.anim_alpha_in(this.root, {
                                    y: 30
                                }, 200)),
                                Laya.timer.once(200, this, function () {
                                    Y.locking = !1
                                });
                            for (var F = 0; F < this.tabs.length; F++) {
                                var V = this.tabs[F];
                                V.skin = game.Tools.localUISrc(F == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var r = V.getChildByName("word");
                                r.color = F == this.tab_index ? "#552c1c" : "#d3a86c",
                                    r.scaleX = r.scaleY = F == this.tab_index ? 1.1 : 1,
                                    F == this.tab_index && V.parent.setChildIndex(V, this.tabs.length - 1)
                            }
                        },
                        F.prototype.change_tab = function (u) {
                            var Y = this;
                            this.tab_index = u;
                            for (var F = 0; F < this.tabs.length; F++) {
                                var V = this.tabs[F];
                                V.skin = game.Tools.localUISrc(F == u ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var r = V.getChildByName("word");
                                r.color = F == u ? "#552c1c" : "#d3a86c",
                                    r.scaleX = r.scaleY = F == u ? 1.1 : 1,
                                    F == u && V.parent.setChildIndex(V, this.tabs.length - 1)
                            }
                            this.locking = !0,
                                0 == this.tab_index ? (this.container_zhuangban.close(!1), Laya.Tween.to(this.bg, {
                                    width: this.bg_width_head
                                }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                    H.UI_Sushe.Inst.open_illust(),
                                        Y.container_head.show(!1)
                                })), Laya.Tween.to(this.bg2, {
                                    width: this.bg_width_head + this.bg2_delta
                                }, 200, Laya.Ease.strongOut)) : 1 == this.tab_index && (this.container_head.close(!1), H.UI_Sushe.Inst.hide_illust(), Laya.Tween.to(this.bg, {
                                    width: this.bg_width_zhuangban
                                }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                    Y.container_zhuangban.show(!1)
                                })), Laya.Tween.to(this.bg2, {
                                    width: this.bg_width_zhuangban + this.bg2_delta
                                }, 200, Laya.Ease.strongOut)),
                                Laya.timer.once(400, this, function () {
                                    Y.locking = !1
                                })
                        },
                        F.prototype.close = function (u) {
                            var Y = this;
                            this.locking = !0,
                                H.UIBase.anim_alpha_out(this.container_top, {
                                    y: -30
                                }, 150),
                                0 == this.tab_index ? H.UIBase.anim_alpha_out(this.root, {
                                    x: 30
                                }, 150, 0, Laya.Handler.create(this, function () {
                                    Y.container_head.close(!0)
                                })) : H.UIBase.anim_alpha_out(this.root, {
                                    y: 30
                                }, 150, 0, Laya.Handler.create(this, function () {
                                    Y.container_zhuangban.close(!0)
                                })),
                                Laya.timer.once(150, this, function () {
                                    Y.locking = !1,
                                        Y.enable = !1,
                                        u && u.run()
                                })
                        },
                        F.prototype.onDisable = function () {
                            for (var u = 0; u < H.UI_Sushe.characters.length; u++) {
                                var Y = H.UI_Sushe.characters[u].skin,
                                    F = cfg.item_definition.skin.get(Y);
                                F && Laya.loader.clearTextureRes(game.LoadMgr.getResImageSkin(F.path + "/bighead.png"))
                            }
                        },
                        F.prototype.changeKaiguanShow = function (H) {
                            H ? this.container_head.dongtai_kaiguan.show() : this.container_head.dongtai_kaiguan.hide()
                        },
                        F
                }
                    (H.UIBase);
            H.UI_Sushe_Select = Y
        }
            (uiscript || (uiscript = {}));

        // 友人房
        !function (H) {
            var u = function () {
                function u(H) {
                    var u = this;
                    this.friends = [],
                        this.sortlist = [],
                        this.me = H,
                        this.me.visible = !1,
                        this.blackbg = H.getChildByName("blackbg"),
                        this.blackbg.clickHandler = Laya.Handler.create(this, function () {
                            u.locking || u.close()
                        }, null, !1),
                        this.root = H.getChildByName("root"),
                        this.scrollview = this.root.scriptMap["capsui.CScrollView"],
                        this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1)),
                        this.noinfo = this.root.getChildByName("noinfo")
                }
                return u.prototype.show = function () {
                    var u = this;
                    this.locking = !0,
                        this.me.visible = !0,
                        this.scrollview.reset(),
                        this.friends = [],
                        this.sortlist = [];
                    for (var Y = game.FriendMgr.friend_list, F = 0; F < Y.length; F++)
                        this.sortlist.push(F);
                    this.sortlist = this.sortlist.sort(function (H, u) {
                        var F = Y[H],
                            V = 0;
                        if (F.state.is_online) {
                            var r = game.Tools.playState2Desc(F.state.playing);
                            V += "" != r ? 3e10 : 6e10,
                                F.base.level && (V += F.base.level.id % 1e3 * 1e7),
                                F.base.level3 && (V += F.base.level3.id % 1e3 * 1e4),
                                V += -Math.floor(F.state.login_time / 1e7)
                        } else
                            V += F.state.logout_time;
                        var h = Y[u],
                            C = 0;
                        if (h.state.is_online) {
                            var r = game.Tools.playState2Desc(h.state.playing);
                            C += "" != r ? 3e10 : 6e10,
                                h.base.level && (C += h.base.level.id % 1e3 * 1e7),
                                h.base.level3 && (C += h.base.level3.id % 1e3 * 1e4),
                                C += -Math.floor(h.state.login_time / 1e7)
                        } else
                            C += h.state.logout_time;
                        return C - V
                    });
                    for (var F = 0; F < Y.length; F++)
                        this.friends.push({
                            f: Y[F],
                            invited: !1
                        });
                    this.noinfo.visible = 0 == this.friends.length,
                        this.scrollview.addItem(this.friends.length),
                        H.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                            u.locking = !1
                        }))
                },
                    u.prototype.close = function () {
                        var u = this;
                        this.locking = !0,
                            H.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                u.locking = !1,
                                    u.me.visible = !1
                            }))
                    },
                    u.prototype.render_item = function (u) {
                        var Y = u.index,
                            F = u.container,
                            r = u.cache_data;
                        r.head || (r.head = new H.UI_Head(F.getChildByName("head"), "UI_WaitingRoom"), r.name = F.getChildByName("name"), r.state = F.getChildByName("label_state"), r.btn = F.getChildByName("btn_invite"), r.invited = F.getChildByName("invited"));
                        var h = this.friends[this.sortlist[Y]];
                        r.head.id = game.GameUtility.get_limited_skin_id(h.f.base.avatar_id),
                            r.head.set_head_frame(h.f.base.account_id, h.f.base.avatar_frame),
                            game.Tools.SetNickname(r.name, h.f.base);
                        var C = !1;
                        if (h.f.state.is_online) {
                            var B = game.Tools.playState2Desc(h.f.state.playing);
                            "" != B ? (r.state.text = game.Tools.strOfLocalization(2069, [B]), r.state.color = "#a9d94d", r.name.color = "#a9d94d") : (r.state.text = game.Tools.strOfLocalization(2071), r.state.color = "#58c4db", r.name.color = "#58c4db", C = !0)
                        } else
                            r.state.text = game.Tools.strOfLocalization(2072), r.state.color = "#8c8c8c", r.name.color = "#8c8c8c";
                        h.invited ? (r.btn.visible = !1, r.invited.visible = !0) : (r.btn.visible = !0, r.invited.visible = !1, game.Tools.setGrayDisable(r.btn, !C), C && (r.btn.clickHandler = Laya.Handler.create(this, function () {
                            game.Tools.setGrayDisable(r.btn, !0);
                            var u = {
                                room_id: V.Inst.room_id,
                                mode: V.Inst.room_mode,
                                nickname: GameMgr.Inst.account_data.nickname,
                                verified: GameMgr.Inst.account_data.verified,
                                account_id: GameMgr.Inst.account_id
                            };
                            app.NetAgent.sendReq2Lobby("Lobby", "sendClientMessage", {
                                target_id: h.f.base.account_id,
                                type: game.EFriendMsgType.room_invite,
                                content: JSON.stringify(u)
                            }, function (u, Y) {
                                u || Y.error ? (game.Tools.setGrayDisable(r.btn, !1), H.UIMgr.Inst.showNetReqError("sendClientMessage", u, Y)) : (r.btn.visible = !1, r.invited.visible = !0, h.invited = !0)
                            })
                        }, null, !1)))
                    },
                    u
            }
                (),
                Y = function () {
                    function u(u) {
                        var Y = this;
                        this.tabs = [],
                            this.tab_index = 0,
                            this.me = u,
                            this.blackmask = this.me.getChildByName("blackmask"),
                            this.root = this.me.getChildByName("root"),
                            this.page_head = new H.zhuangban.Page_Waiting_Head(this.root.getChildByName("container_heads")),
                            this.page_zhangban = new H.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                return Y.locking
                            }));
                        for (var F = this.root.getChildByName("container_tabs"), V = function (u) {
                            r.tabs.push(F.getChildAt(u)),
                                r.tabs[u].clickHandler = new Laya.Handler(r, function () {
                                    Y.locking || Y.tab_index != u && (1 == Y.tab_index && Y.page_zhangban.changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(Y, function () {
                                        Y.change_tab(u)
                                    }), null) : Y.change_tab(u))
                                })
                        }, r = this, h = 0; h < F.numChildren; h++)
                            V(h);
                        this.root.getChildByName("close").clickHandler = new Laya.Handler(this, function () {
                            Y.locking || (1 == Y.tab_index && Y.page_zhangban.changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(Y, function () {
                                Y.close(!1)
                            }), null) : Y.close(!1))
                        }),
                            this.root.getChildByName("btn_close").clickHandler = new Laya.Handler(this, function () {
                                Y.locking || (1 == Y.tab_index && Y.page_zhangban.changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(Y, function () {
                                    Y.close(!1)
                                }), null) : Y.close(!1))
                            })
                    }
                    return u.prototype.show = function () {
                        var u = this;
                        this.me.visible = !0,
                            this.blackmask.alpha = 0,
                            this.locking = !0,
                            Laya.Tween.to(this.blackmask, {
                                alpha: .3
                            }, 150),
                            H.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                u.locking = !1
                            })),
                            this.tab_index = 0,
                            this.page_zhangban.close(!0),
                            this.page_head.show(!0);
                        for (var Y = 0; Y < this.tabs.length; Y++) {
                            var F = this.tabs[Y];
                            F.skin = game.Tools.localUISrc(Y == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                            var V = F.getChildByName("word");
                            V.color = Y == this.tab_index ? "#552c1c" : "#d3a86c",
                                V.scaleX = V.scaleY = Y == this.tab_index ? 1.1 : 1,
                                Y == this.tab_index && F.parent.setChildIndex(F, this.tabs.length - 1)
                        }
                    },
                        u.prototype.change_tab = function (H) {
                            var u = this;
                            this.tab_index = H;
                            for (var Y = 0; Y < this.tabs.length; Y++) {
                                var F = this.tabs[Y];
                                F.skin = game.Tools.localUISrc(Y == H ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var V = F.getChildByName("word");
                                V.color = Y == H ? "#552c1c" : "#d3a86c",
                                    V.scaleX = V.scaleY = Y == H ? 1.1 : 1,
                                    Y == H && F.parent.setChildIndex(F, this.tabs.length - 1)
                            }
                            this.locking = !0,
                                0 == this.tab_index ? (this.page_zhangban.close(!1), Laya.timer.once(200, this, function () {
                                    u.page_head.show(!1)
                                })) : 1 == this.tab_index && (this.page_head.close(!1), Laya.timer.once(200, this, function () {
                                    u.page_zhangban.show(!1)
                                })),
                                Laya.timer.once(400, this, function () {
                                    u.locking = !1
                                })
                        },
                        u.prototype.close = function (u) {
                            var Y = this;
                            //修改友人房间立绘
                            if (!(Y.page_head.choosed_chara_index == 0 && Y.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < V.Inst.players.length; id++) {
                                    if (V.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        V.Inst.players[id].avatar_id = Y.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = Y.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = Y.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[Y.page_head.choosed_chara_index] = Y.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me.visible && (u ? (this.page_head.close(!0), this.page_zhangban.close(!0), this.me.visible = !1) : (app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                ready: V.Inst.owner_id == GameMgr.Inst.account_id ? !0 : !1,
                                dressing: !1
                            }, function () { }), this.locking = !0, this.page_head.close(!1), this.page_zhangban.close(!1), H.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                Y.locking = !1,
                                    Y.me.visible = !1
                            }))))
                        },
                        u
                }
                    (),
                F = function () {
                    function H(H) {
                        this.modes = [],
                            this.me = H,
                            this.bg = this.me.getChildByName("bg"),
                            this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_item))
                    }
                    return H.prototype.show = function (H) {
                        this.me.visible = !0,
                            this.scrollview.reset(),
                            this.modes = H,
                            this.scrollview.addItem(H.length);
                        var u = this.scrollview.total_height;
                        u > 380 ? (this.scrollview._content.y = 10, this.bg.height = 400) : (this.scrollview._content.y = 390 - u, this.bg.height = u + 20),
                            this.bg.visible = !0
                    },
                        H.prototype.render_item = function (H) {
                            var u = H.index,
                                Y = H.container,
                                F = Y.getChildByName("info");
                            F.fontSize = 40,
                                F.fontSize = this.modes[u].length <= 5 ? 40 : this.modes[u].length <= 9 ? 55 - 3 * this.modes[u].length : 28,
                                F.text = this.modes[u]
                        },
                        H
                }
                    (),
                V = function (V) {
                    function r() {
                        var u = V.call(this, new ui.lobby.waitingroomUI) || this;
                        return u.skin_ready = "myres/room/btn_ready.png",
                            u.skin_cancel = "myres/room/btn_cancel.png",
                            u.skin_start = "myres/room/btn_start.png",
                            u.skin_start_no = "myres/room/btn_start_no.png",
                            u.update_seq = 0,
                            u.pre_msgs = [],
                            u.msg_tail = -1,
                            u.posted = !1,
                            u.label_rommid = null,
                            u.player_cells = [],
                            u.btn_ok = null,
                            u.btn_invite_friend = null,
                            u.btn_add_robot = null,
                            u.btn_dress = null,
                            u.beReady = !1,
                            u.room_id = -1,
                            u.owner_id = -1,
                            u.tournament_id = 0,
                            u.max_player_count = 0,
                            u.players = [],
                            u.container_rules = null,
                            u.container_top = null,
                            u.container_right = null,
                            u.locking = !1,
                            u.mousein_copy = !1,
                            u.popout = null,
                            u.room_link = null,
                            u.btn_copy_link = null,
                            u.last_start_room = 0,
                            u.invitefriend = null,
                            u.pre_choose = null,
                            u.ai_name = game.Tools.strOfLocalization(2003),
                            r.Inst = u,
                            app.NetAgent.AddListener2Lobby("NotifyRoomPlayerReady", Laya.Handler.create(u, function (H) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON.stringify(H)),
                                    u.onReadyChange(H.account_id, H.ready, H.dressing)
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomPlayerUpdate", Laya.Handler.create(u, function (H) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON.stringify(H)),
                                    u.onPlayerChange(H)
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomGameStart", Laya.Handler.create(u, function (H) {
                                u.enable && (app.Log.log("NotifyRoomGameStart:" + JSON.stringify(H)), GameMgr.Inst.onPipeiYuyueSuccess(0, "youren"), u.onGameStart(H))
                            })),
                            app.NetAgent.AddListener2Lobby("NotifyRoomKickOut", Laya.Handler.create(u, function (H) {
                                app.Log.log("NotifyRoomKickOut:" + JSON.stringify(H)),
                                    u.onBeKictOut()
                            })),
                            game.LobbyNetMgr.Inst.add_connect_listener(Laya.Handler.create(u, function () {
                                u.enable && u.hide(Laya.Handler.create(u, function () {
                                    H.UI_Lobby.Inst.enable = !0
                                }))
                            }, null, !1)),
                            u
                    }
                    return __extends(r, V),
                        r.prototype.push_msg = function (H) {
                            this.pre_msgs.length < 15 ? this.pre_msgs.push(JSON.parse(H)) : (this.msg_tail = (this.msg_tail + 1) % this.pre_msgs.length, this.pre_msgs[this.msg_tail] = JSON.parse(H))
                        },
                        Object.defineProperty(r.prototype, "inRoom", {
                            get: function () {
                                return -1 != this.room_id
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object.defineProperty(r.prototype, "robot_count", {
                            get: function () {
                                for (var H = 0, u = 0; u < this.players.length; u++)
                                    2 == this.players[u].category && H++;
                                return H
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        r.prototype.resetData = function () {
                            this.room_id = -1,
                                this.owner_id = -1,
                                this.room_mode = {},
                                this.max_player_count = 0,
                                this.players = []
                        },
                        r.prototype.updateData = function (H) {
                            if (!H)
                                return this.resetData(), void 0;
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
                            this.room_id = H.room_id,
                                this.owner_id = H.owner_id,
                                this.room_mode = H.mode,
                                this.public_live = H.public_live,
                                this.tournament_id = 0,
                                H.tournament_id && (this.tournament_id = H.tournament_id),
                                this.ai_name = game.Tools.strOfLocalization(2003),
                                this.room_mode.detail_rule && (1 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2003)), 2 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2004))),
                                this.max_player_count = H.max_player_count,
                                this.players = [];
                            for (var u = 0; u < H.persons.length; u++) {
                                var Y = H.persons[u];
                                //修改友人房间立绘  -----fxxk
                                //if (Y.account_id == GameMgr.Inst.account_id)
                                //    Y.avatar_id = GameMgr.Inst.account_data.my_character.skin;
                                //end
                                Y.ready = !1,
                                    Y.cell_index = -1,
                                    Y.category = 1,
                                    this.players.push(Y)
                            }
                            for (var u = 0; u < H.robot_count; u++)
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
                            for (var u = 0; u < H.ready_list.length; u++)
                                for (var F = 0; F < this.players.length; F++)
                                    if (this.players[F].account_id == H.ready_list[u]) {
                                        this.players[F].ready = !0;
                                        break
                                    }
                            this.update_seq = 0,
                                H.seq && (this.update_seq = H.seq)
                        },
                        r.prototype.onReadyChange = function (H, u, Y) {
                            for (var F = 0; F < this.players.length; F++)
                                if (this.players[F].account_id == H) {
                                    this.players[F].ready = u,
                                        this.players[F].dressing = Y,
                                        this._onPlayerReadyChange(this.players[F]);
                                    break
                                }
                            this.refreshStart()
                        },
                        r.prototype.onPlayerChange = function (H) {
                            if (app.Log.log(H), H = H.toJSON(), !(H.seq && H.seq <= this.update_seq)) {
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
                                                t.update_list[i].nickname = MMP.settings.nickname;
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
                                this.update_seq = H.seq;
                                var u = {};
                                u.type = "onPlayerChange0",
                                    u.players = this.players,
                                    u.msg = H,
                                    this.push_msg(JSON.stringify(u));
                                var Y = this.robot_count,
                                    F = H.robot_count;
                                if (F < this.robot_count) {
                                    this.pre_choose && 2 == this.pre_choose.category && (this.pre_choose.category = 0, this.pre_choose = null, Y--);
                                    for (var V = 0; V < this.players.length; V++)
                                        2 == this.players[V].category && Y > F && (this.players[V].category = 0, Y--)
                                }
                                for (var r = [], h = H.player_list, V = 0; V < this.players.length; V++)
                                    if (1 == this.players[V].category) {
                                        for (var C = -1, B = 0; B < h.length; B++)
                                            if (h[B].account_id == this.players[V].account_id) {
                                                C = B;
                                                break
                                            }
                                        if (-1 != C) {
                                            var _ = h[C];
                                            r.push(this.players[V]),
                                                this.players[V].avatar_id = _.avatar_id,
                                                this.players[V].title = _.title,
                                                this.players[V].verified = _.verified
                                        }
                                    } else
                                        2 == this.players[V].category && r.push(this.players[V]);
                                this.players = r;
                                for (var V = 0; V < h.length; V++) {
                                    for (var d = !1, _ = h[V], B = 0; B < this.players.length; B++)
                                        if (1 == this.players[B].category && this.players[B].account_id == _.account_id) {
                                            d = !0;
                                            break
                                        }
                                    d || this.players.push({
                                        account_id: _.account_id,
                                        avatar_id: _.avatar_id,
                                        nickname: _.nickname,
                                        verified: _.verified,
                                        title: _.title,
                                        level: _.level,
                                        level3: _.level3,
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    })
                                }
                                for (var n = [!1, !1, !1, !1], V = 0; V < this.players.length; V++)
                                    - 1 != this.players[V].cell_index && (n[this.players[V].cell_index] = !0, this._refreshPlayerInfo(this.players[V]));
                                for (var V = 0; V < this.players.length; V++)
                                    if (1 == this.players[V].category && -1 == this.players[V].cell_index)
                                        for (var B = 0; B < this.max_player_count; B++)
                                            if (!n[B]) {
                                                this.players[V].cell_index = B,
                                                    n[B] = !0,
                                                    this._refreshPlayerInfo(this.players[V]);
                                                break
                                            }
                                for (var Y = this.robot_count, F = H.robot_count; F > Y;) {
                                    for (var M = -1, B = 0; B < this.max_player_count; B++)
                                        if (!n[B]) {
                                            M = B;
                                            break
                                        }
                                    if (-1 == M)
                                        break;
                                    n[M] = !0,
                                        this.players.push({
                                            category: 2,
                                            cell_index: M,
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
                                        Y++
                                }
                                for (var V = 0; V < this.max_player_count; V++)
                                    n[V] || this._clearCell(V);
                                var u = {};
                                if (u.type = "onPlayerChange1", u.players = this.players, this.push_msg(JSON.stringify(u)), H.owner_id) {
                                    if (this.owner_id = H.owner_id, this.enable)
                                        if (this.owner_id == GameMgr.Inst.account_id)
                                            this.refreshAsOwner();
                                        else
                                            for (var B = 0; B < this.players.length; B++)
                                                if (this.players[B] && this.players[B].account_id == this.owner_id) {
                                                    this._refreshPlayerInfo(this.players[B]);
                                                    break
                                                }
                                } else if (this.enable)
                                    if (this.owner_id == GameMgr.Inst.account_id)
                                        this.refreshAsOwner();
                                    else
                                        for (var B = 0; B < this.players.length; B++)
                                            if (this.players[B] && this.players[B].account_id == this.owner_id) {
                                                this._refreshPlayerInfo(this.players[B]);
                                                break
                                            }
                            }
                        },
                        r.prototype.onBeKictOut = function () {
                            this.resetData(),
                                this.enable && (this.enable = !1, this.pop_change_view.close(!1), H.UI_Lobby.Inst.enable = !0, H.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(52)))
                        },
                        r.prototype.onCreate = function () {
                            var V = this;
                            this.last_start_room = 0;
                            var r = this.me.getChildByName("root");
                            this.container_top = r.getChildByName("top"),
                                this.container_right = r.getChildByName("right"),
                                this.label_rommid = this.container_top.getChildByName("label_roomid");
                            for (var h = function (u) {
                                var Y = r.getChildByName("player_" + u.toString()),
                                    F = {};
                                F.index = u,
                                    F.container = Y,
                                    F.container_flag = Y.getChildByName("flag"),
                                    F.container_flag.visible = !1,
                                    F.container_name = Y.getChildByName("container_name"),
                                    F.name = Y.getChildByName("container_name").getChildByName("name"),
                                    F.btn_t = Y.getChildByName("btn_t"),
                                    F.container_illust = Y.getChildByName("container_illust"),
                                    F.illust = new H.UI_Character_Skin(Y.getChildByName("container_illust").getChildByName("illust")),
                                    F.host = Y.getChildByName("host"),
                                    F.title = new H.UI_PlayerTitle(Y.getChildByName("container_name").getChildByName("title"), "UI_WaitingRoom"),
                                    F.rank = new H.UI_Level(Y.getChildByName("container_name").getChildByName("rank"), "UI_WaitingRoom"),
                                    F.is_robot = !1;
                                var h = 0;
                                F.btn_t.clickHandler = Laya.Handler.create(C, function () {
                                    if (!(V.locking || Laya.timer.currTimer < h)) {
                                        h = Laya.timer.currTimer + 500;
                                        for (var H = 0; H < V.players.length; H++)
                                            if (V.players[H].cell_index == u) {
                                                V.kickPlayer(H);
                                                break
                                            }
                                    }
                                }, null, !1),
                                    F.btn_info = Y.getChildByName("btn_info"),
                                    F.btn_info.clickHandler = Laya.Handler.create(C, function () {
                                        if (!V.locking)
                                            for (var Y = 0; Y < V.players.length; Y++)
                                                if (V.players[Y].cell_index == u) {
                                                    V.players[Y].account_id && V.players[Y].account_id > 0 && H.UI_OtherPlayerInfo.Inst.show(V.players[Y].account_id, V.room_mode.mode < 10 ? 1 : 2);
                                                    break
                                                }
                                    }, null, !1),
                                    C.player_cells.push(F)
                            }, C = this, B = 0; 4 > B; B++)
                                h(B);
                            this.btn_ok = r.getChildByName("btn_ok");
                            var _ = 0;
                            this.btn_ok.clickHandler = Laya.Handler.create(this, function () {
                                Laya.timer.currTimer < _ + 500 || (_ = Laya.timer.currTimer, V.owner_id == GameMgr.Inst.account_id ? V.getStart() : V.switchReady())
                            }, null, !1);
                            var d = 0;
                            this.container_top.getChildByName("btn_leave").clickHandler = Laya.Handler.create(this, function () {
                                Laya.timer.currTimer < d + 500 || (d = Laya.timer.currTimer, V.leaveRoom())
                            }, null, !1),
                                this.btn_invite_friend = this.container_right.getChildByName("btn_friend"),
                                this.btn_invite_friend.clickHandler = Laya.Handler.create(this, function () {
                                    V.locking || V.invitefriend.show()
                                }, null, !1),
                                this.btn_add_robot = this.container_right.getChildByName("btn_robot");
                            var n = 0;
                            this.btn_add_robot.clickHandler = Laya.Handler.create(this, function () {
                                V.locking || Laya.timer.currTimer < n || (n = Laya.timer.currTimer + 1e3, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                    robot_count: V.robot_count + 1
                                }, function (u, Y) {
                                    (u || Y.error && 1111 != Y.error.code) && H.UIMgr.Inst.showNetReqError("modifyRoom_add", u, Y),
                                        n = 0
                                }))
                            }, null, !1),
                                this.container_right.getChildByName("btn_help").clickHandler = Laya.Handler.create(this, function () {
                                    if (!V.locking) {
                                        var u = 0;
                                        V.room_mode.detail_rule && V.room_mode.detail_rule.chuanma && (u = 1),
                                            H.UI_Rules.Inst.show(0, null, u)
                                    }
                                }, null, !1),
                                this.btn_dress = this.container_right.getChildByName("btn_view"),
                                this.btn_dress.clickHandler = new Laya.Handler(this, function () {
                                    V.locking || V.beReady && V.owner_id != GameMgr.Inst.account_id || (V.pop_change_view.show(), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                        ready: V.owner_id == GameMgr.Inst.account_id ? !0 : !1,
                                        dressing: !0
                                    }, function () { }))
                                });
                            var M = this.container_right.getChildByName("btn_copy");
                            M.on("mouseover", this, function () {
                                V.mousein_copy = !0
                            }),
                                M.on("mouseout", this, function () {
                                    V.mousein_copy = !1
                                }),
                                M.clickHandler = Laya.Handler.create(this, function () {
                                    V.popout.visible || (GameMgr.Inst.BehavioralStatistics(12), V.popout.visible = !0, H.UIBase.anim_pop_out(V.popout, null))
                                }, null, !1),
                                this.container_rules = new F(this.container_right.getChildByName("container_rules")),
                                this.popout = this.me.getChildByName("pop"),
                                this.room_link = this.popout.getChildByName("input").getChildByName("txtinput"),
                                this.room_link.editable = !1,
                                this.btn_copy_link = this.popout.getChildByName("btn_copy"),
                                this.btn_copy_link.visible = !1,
                                GameMgr.inConch ? (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                    var u = Laya.PlatformClass.createClass("layaair.majsoul.mjmgr");
                                    u.call("setSysClipboardText", V.room_link.text),
                                        H.UIBase.anim_pop_hide(V.popout, Laya.Handler.create(V, function () {
                                            V.popout.visible = !1
                                        })),
                                        H.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                }, null, !1)) : GameMgr.iniOSWebview && (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                    Laya.Browser.window.wkbridge.callNative("copy2clip", V.room_link.text, function () { }),
                                        H.UIBase.anim_pop_hide(V.popout, Laya.Handler.create(V, function () {
                                            V.popout.visible = !1
                                        })),
                                        H.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                }, null, !1)),
                                this.popout.visible = !1,
                                this.popout.getChildByName("btn_cancel").clickHandler = Laya.Handler.create(this, function () {
                                    H.UIBase.anim_pop_hide(V.popout, Laya.Handler.create(V, function () {
                                        V.popout.visible = !1
                                    }))
                                }, null, !1),
                                this.invitefriend = new u(this.me.getChildByName("invite_friend")),
                                this.pop_change_view = new Y(this.me.getChildByName("pop_view"))
                        },
                        r.prototype.show = function () {
                            var u = this;
                            game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                this.mousein_copy = !1,
                                this.beReady = !1,
                                this.invitefriend.me.visible = !1,
                                this.btn_add_robot.visible = !1,
                                this.btn_invite_friend.visible = !1,
                                game.Tools.setGrayDisable(this.btn_dress, !1),
                                this.pre_choose = null,
                                this.pop_change_view.close(!0);
                            for (var Y = 0; 4 > Y; Y++)
                                this.player_cells[Y].container.visible = Y < this.max_player_count;
                            for (var Y = 0; Y < this.max_player_count; Y++)
                                this._clearCell(Y);
                            for (var Y = 0; Y < this.players.length; Y++)
                                this.players[Y].cell_index = Y, this._refreshPlayerInfo(this.players[Y]);
                            this.msg_tail = -1,
                                this.pre_msgs = [],
                                this.posted = !1;
                            var F = {};
                            F.type = "show",
                                F.players = this.players,
                                this.push_msg(JSON.stringify(F)),
                                this.owner_id == GameMgr.Inst.account_id ? (this.btn_ok.skin = game.Tools.localUISrc(this.skin_start), this.refreshAsOwner()) : (this.btn_ok.skin = game.Tools.localUISrc(this.skin_ready), game.Tools.setGrayDisable(this.btn_ok, !1)),
                                this.label_rommid.text = "en" == GameMgr.client_language ? "#" + this.room_id.toString() : this.room_id.toString();
                            var V = [];
                            V.push(game.Tools.room_mode_desc(this.room_mode.mode));
                            var r = this.room_mode.detail_rule;
                            if (r) {
                                var h = 5,
                                    C = 20;
                                if (null != r.time_fixed && (h = r.time_fixed), null != r.time_add && (C = r.time_add), V.push(h.toString() + "+" + C.toString() + game.Tools.strOfLocalization(2019)), 0 != this.tournament_id) {
                                    var B = cfg.tournament.tournaments.get(this.tournament_id);
                                    B && V.push(B.name)
                                }
                                if (null != r.init_point && V.push(game.Tools.strOfLocalization(2199) + r.init_point), null != r.fandian && V.push(game.Tools.strOfLocalization(2094) + ":" + r.fandian), r.guyi_mode && V.push(game.Tools.strOfLocalization(3028)), null != r.dora_count)
                                    switch (r.chuanma && (r.dora_count = 0), r.dora_count) {
                                        case 0:
                                            V.push(game.Tools.strOfLocalization(2044));
                                            break;
                                        case 2:
                                            V.push(game.Tools.strOfLocalization(2047));
                                            break;
                                        case 3:
                                            V.push(game.Tools.strOfLocalization(2045));
                                            break;
                                        case 4:
                                            V.push(game.Tools.strOfLocalization(2046))
                                    }
                                null != r.shiduan && 1 != r.shiduan && V.push(game.Tools.strOfLocalization(2137)),
                                    2 === r.fanfu && V.push(game.Tools.strOfLocalization(2763)),
                                    4 === r.fanfu && V.push(game.Tools.strOfLocalization(2764)),
                                    null != r.bianjietishi && 1 != r.bianjietishi && V.push(game.Tools.strOfLocalization(2200)),
                                    this.room_mode.mode >= 10 && this.room_mode.mode <= 14 && (null != r.have_zimosun && 1 != r.have_zimosun ? V.push(game.Tools.strOfLocalization(2202)) : V.push(game.Tools.strOfLocalization(2203)))
                            }
                            this.container_rules.show(V),
                                this.enable = !0,
                                this.locking = !0,
                                H.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200);
                            for (var Y = 0; Y < this.player_cells.length; Y++)
                                H.UIBase.anim_alpha_in(this.player_cells[Y].container, {
                                    x: 80
                                }, 150, 150 + 50 * Y, null, Laya.Ease.backOut);
                            H.UIBase.anim_alpha_in(this.btn_ok, {}, 100, 600),
                                H.UIBase.anim_alpha_in(this.container_right, {
                                    x: 20
                                }, 100, 500),
                                Laya.timer.once(600, this, function () {
                                    u.locking = !1
                                });
                            var _ = game.Tools.room_mode_desc(this.room_mode.mode);
                            this.room_link.text = game.Tools.strOfLocalization(2221, [this.room_id.toString()]),
                                "" != _ && (this.room_link.text += "(" + _ + ")");
                            var d = game.Tools.getShareUrl(GameMgr.Inst.link_url);
                            this.room_link.text += ": " + d + "?room=" + this.room_id
                        },
                        r.prototype.leaveRoom = function () {
                            var u = this;
                            this.locking || app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (Y, F) {
                                Y || F.error ? H.UIMgr.Inst.showNetReqError("leaveRoom", Y, F) : u.hide(Laya.Handler.create(u, function () {
                                    H.UI_Lobby.Inst.enable = !0
                                }))
                            })
                        },
                        r.prototype.tryToClose = function (u) {
                            var Y = this;
                            app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (F, V) {
                                F || V.error ? (H.UIMgr.Inst.showNetReqError("leaveRoom", F, V), u.runWith(!1)) : (Y.enable = !1, Y.pop_change_view.close(!0), u.runWith(!0))
                            })
                        },
                        r.prototype.hide = function (u) {
                            var Y = this;
                            this.locking = !0,
                                H.UIBase.anim_alpha_out(this.container_top, {
                                    y: -30
                                }, 150);
                            for (var F = 0; F < this.player_cells.length; F++)
                                H.UIBase.anim_alpha_out(this.player_cells[F].container, {
                                    x: 80
                                }, 150, 0, null);
                            H.UIBase.anim_alpha_out(this.btn_ok, {}, 150),
                                H.UIBase.anim_alpha_out(this.container_right, {
                                    x: 20
                                }, 150),
                                Laya.timer.once(200, this, function () {
                                    Y.locking = !1,
                                        Y.enable = !1,
                                        u && u.run()
                                }),
                                document.getElementById("layaCanvas").onclick = null
                        },
                        r.prototype.onDisbale = function () {
                            Laya.timer.clearAll(this);
                            for (var H = 0; H < this.player_cells.length; H++)
                                Laya.loader.clearTextureRes(this.player_cells[H].illust.skin);
                            document.getElementById("layaCanvas").onclick = null
                        },
                        r.prototype.switchReady = function () {
                            this.owner_id != GameMgr.Inst.account_id && (this.beReady = !this.beReady, this.btn_ok.skin = game.Tools.localUISrc(this.beReady ? this.skin_cancel : this.skin_ready), game.Tools.setGrayDisable(this.btn_dress, this.beReady), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                ready: this.beReady,
                                dressing: !1
                            }, function () { }))
                        },
                        r.prototype.getStart = function () {
                            this.owner_id == GameMgr.Inst.account_id && (Laya.timer.currTimer < this.last_start_room + 2e3 || (this.last_start_room = Laya.timer.currTimer, app.NetAgent.sendReq2Lobby("Lobby", "startRoom", {}, function (u, Y) {
                                (u || Y.error) && H.UIMgr.Inst.showNetReqError("startRoom", u, Y)
                            })))
                        },
                        r.prototype.kickPlayer = function (u) {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                var Y = this.players[u];
                                1 == Y.category ? app.NetAgent.sendReq2Lobby("Lobby", "kickPlayer", {
                                    account_id: this.players[u].account_id
                                }, function () { }) : 2 == Y.category && (this.pre_choose = Y, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                    robot_count: this.robot_count - 1
                                }, function (u, Y) {
                                    (u || Y.error) && H.UIMgr.Inst.showNetReqError("modifyRoom_minus", u, Y)
                                }))
                            }
                        },
                        r.prototype._clearCell = function (H) {
                            if (!(0 > H || H >= this.player_cells.length)) {
                                var u = this.player_cells[H];
                                u.container_flag.visible = !1,
                                    u.container_illust.visible = !1,
                                    u.name.visible = !1,
                                    u.container_name.visible = !1,
                                    u.btn_t.visible = !1,
                                    u.host.visible = !1
                            }
                        },
                        r.prototype._refreshPlayerInfo = function (H) {
                            var u = H.cell_index;
                            if (!(0 > u || u >= this.player_cells.length)) {
                                var Y = this.player_cells[u];
                                Y.container_illust.visible = !0,
                                    Y.container_name.visible = !0,
                                    Y.name.visible = !0,
                                    game.Tools.SetNickname(Y.name, H),
                                    Y.btn_t.visible = this.owner_id == GameMgr.Inst.account_id && H.account_id != GameMgr.Inst.account_id,
                                    this.owner_id == H.account_id && (Y.container_flag.visible = !0, Y.host.visible = !0),
                                    H.account_id == GameMgr.Inst.account_id ? Y.illust.setSkin(H.avatar_id, "waitingroom") : Y.illust.setSkin(game.GameUtility.get_limited_skin_id(H.avatar_id), "waitingroom"),
                                    Y.title.id = game.Tools.titleLocalization(H.account_id, H.title),
                                    Y.rank.id = H[this.room_mode.mode < 10 ? "level" : "level3"].id,
                                    this._onPlayerReadyChange(H)
                            }
                        },
                        r.prototype._onPlayerReadyChange = function (H) {
                            var u = H.cell_index;
                            if (!(0 > u || u >= this.player_cells.length)) {
                                var Y = this.player_cells[u];
                                Y.container_flag.visible = this.owner_id == H.account_id ? !0 : H.ready
                            }
                        },
                        r.prototype.refreshAsOwner = function () {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                for (var H = 0, u = 0; u < this.players.length; u++)
                                    0 != this.players[u].category && (this._refreshPlayerInfo(this.players[u]), H++);
                                this.btn_add_robot.visible = !0,
                                    this.btn_invite_friend.visible = !0,
                                    game.Tools.setGrayDisable(this.btn_invite_friend, H == this.max_player_count),
                                    game.Tools.setGrayDisable(this.btn_add_robot, H == this.max_player_count),
                                    this.refreshStart()
                            }
                        },
                        r.prototype.refreshStart = function () {
                            if (this.owner_id == GameMgr.Inst.account_id) {
                                this.btn_ok.skin = game.Tools.localUISrc(this.skin_start),
                                    game.Tools.setGrayDisable(this.btn_dress, !1);
                                for (var H = 0, u = 0; u < this.players.length; u++) {
                                    var Y = this.players[u];
                                    if (!Y || 0 == Y.category)
                                        break;
                                    (Y.account_id == this.owner_id || Y.ready) && H++
                                }
                                if (game.Tools.setGrayDisable(this.btn_ok, H != this.max_player_count), this.enable) {
                                    for (var F = 0, u = 0; u < this.max_player_count; u++) {
                                        var V = this.player_cells[u];
                                        V && V.container_flag.visible && F++
                                    }
                                    if (H != F && !this.posted) {
                                        this.posted = !0;
                                        var r = {};
                                        r.okcount = H,
                                            r.okcount2 = F,
                                            r.msgs = [];
                                        var h = 0,
                                            C = this.pre_msgs.length - 1;
                                        if (-1 != this.msg_tail && (h = (this.msg_tail + 1) % this.pre_msgs.length, C = this.msg_tail), h >= 0 && C >= 0) {
                                            for (var u = h; u != C; u = (u + 1) % this.pre_msgs.length)
                                                r.msgs.push(this.pre_msgs[u]);
                                            r.msgs.push(this.pre_msgs[C])
                                        }
                                        GameMgr.Inst.postInfo2Server("waitroom_err2", r, !1)
                                    }
                                }
                            }
                        },
                        r.prototype.onGameStart = function (H) {
                            game.Tools.setGrayDisable(this.btn_ok, !0),
                                this.enable = !1,
                                game.MJNetMgr.Inst.OpenConnect(H.connect_token, H.game_uuid, H.location, !1, null)
                        },
                        r.prototype.onEnable = function () {
                            game.TempImageMgr.setUIEnable("UI_WaitingRoom", !0)
                        },
                        r.prototype.onDisable = function () {
                            game.TempImageMgr.setUIEnable("UI_WaitingRoom", !1)
                        },
                        r.Inst = null,
                        r
                }
                    (H.UIBase);
            H.UI_WaitingRoom = V
        }
            (uiscript || (uiscript = {}));

        // 保存装扮
        !function (H) {
            var u;
            !function (u) {
                var Y = function () {
                    function Y(Y, F, V) {
                        var r = this;
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
                            this._locking = V,
                            this.container_zhuangban0 = Y,
                            this.container_zhuangban1 = F;
                        for (var h = this.container_zhuangban0.getChildByName("tabs"), C = function (u) {
                            var Y = h.getChildAt(u);
                            B.tabs.push(Y),
                                Y.clickHandler = new Laya.Handler(B, function () {
                                    r.locking || r.tab_index != u && (r._changed ? H.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(r, function () {
                                        r.change_tab(u)
                                    }), null) : r.change_tab(u))
                                })
                        }, B = this, _ = 0; _ < h.numChildren; _++)
                            C(_);
                        this.page_items = new u.Page_Items(this.container_zhuangban1.getChildByName("page_items")),
                            this.page_headframe = new u.Page_Headframe(this.container_zhuangban1.getChildByName("page_headframe")),
                            this.page_bgm = new u.Page_Bgm(this.container_zhuangban1.getChildByName("page_bgm")),
                            this.page_desktop = new u.Page_Desktop(this.container_zhuangban1.getChildByName("page_zhuobu")),
                            this.scrollview = this.container_zhuangban1.getChildByName("page_slots").scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_view)),
                            this.scrollview.setElastic(),
                            this.btn_using = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_using"),
                            this.btn_save = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_save"),
                            this.btn_save.clickHandler = new Laya.Handler(this, function () {
                                for (var u = [], Y = 0; Y < r.cell_titles.length; Y++) {
                                    var F = r.slot_ids[Y];
                                    if (r.slot_map[F]) {
                                        var V = r.slot_map[F];
                                        if (!V || V == r.cell_default_item[Y])
                                            continue;
                                        u.push({
                                            slot: F,
                                            item_id: V
                                        })
                                    }
                                }
                                r.btn_save.mouseEnabled = !1;
                                var h = r.tab_index;
                                //app.NetAgent.sendReq2Lobby("Lobby", "saveCommonViews", {
                                //    views: u,
                                //    save_index: h,
                                //    is_use: h == H.UI_Sushe.using_commonview_index ? 1 : 0
                                //}, function (Y, F) {
                                //    if (r.btn_save.mouseEnabled = !0, Y || F.error)
                                //        H.UIMgr.Inst.showNetReqError("saveCommonViews", Y, F);
                                //    else {
                                if (H.UI_Sushe.commonViewList.length < h)
                                    for (var V = H.UI_Sushe.commonViewList.length; h >= V; V++)
                                        H.UI_Sushe.commonViewList.push([]);
                                MMP.settings.commonViewList = H.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = H.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                if (H.UI_Sushe.commonViewList[h] = u, H.UI_Sushe.using_commonview_index == h && r.onChangeGameView(), r.tab_index != h)
                                    return;
                                r.btn_save.mouseEnabled = !0,
                                    r._changed = !1,
                                    r.refresh_btn()
                                //    }
                                //})
                            }),
                            this.btn_use = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_use"),
                            this.btn_use.clickHandler = new Laya.Handler(this, function () {
                                r.btn_use.mouseEnabled = !1;
                                var u = r.tab_index;
                                app.NetAgent.sendReq2Lobby("Lobby", "useCommonView", {
                                    index: u
                                }, function (Y, F) {
                                    r.btn_use.mouseEnabled = !0,
                                        Y || F.error ? H.UIMgr.Inst.showNetReqError("useCommonView", Y, F) : (H.UI_Sushe.using_commonview_index = u, r.refresh_btn(), r.refresh_tab(), r.onChangeGameView())
                                })
                            })
                    }
                    return Object.defineProperty(Y.prototype, "locking", {
                        get: function () {
                            return this._locking ? this._locking.run() : !1
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object.defineProperty(Y.prototype, "changed", {
                            get: function () {
                                return this._changed
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Y.prototype.show = function (u) {
                            game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !0),
                                this.container_zhuangban0.visible = !0,
                                this.container_zhuangban1.visible = !0,
                                u ? (this.container_zhuangban0.alpha = 1, this.container_zhuangban1.alpha = 1) : (H.UIBase.anim_alpha_in(this.container_zhuangban0, {
                                    x: 0
                                }, 200), H.UIBase.anim_alpha_in(this.container_zhuangban1, {
                                    x: 0
                                }, 200)),
                                this.change_tab(H.UI_Sushe.using_commonview_index)
                        },
                        Y.prototype.change_tab = function (u) {
                            if (this.tab_index = u, this.refresh_tab(), this.slot_map = {}, this.scrollview.reset(), this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.select_index = 0, this._changed = !1, !(this.tab_index < 0 || this.tab_index > 4)) {
                                if (this.tab_index < H.UI_Sushe.commonViewList.length)
                                    for (var Y = H.UI_Sushe.commonViewList[this.tab_index], F = 0; F < Y.length; F++)
                                        this.slot_map[Y[F].slot] = Y[F].item_id;
                                this.scrollview.addItem(this.cell_titles.length),
                                    this.onChangeSlotSelect(0),
                                    this.refresh_btn()
                            }
                        },
                        Y.prototype.refresh_tab = function () {
                            for (var u = 0; u < this.tabs.length; u++) {
                                var Y = this.tabs[u];
                                Y.mouseEnabled = this.tab_index != u,
                                    Y.getChildByName("bg").skin = game.Tools.localUISrc(this.tab_index == u ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                    Y.getChildByName("num").color = this.tab_index == u ? "#2f1e19" : "#f2c797";
                                var F = Y.getChildByName("choosed");
                                H.UI_Sushe.using_commonview_index == u ? (F.visible = !0, F.x = this.tab_index == u ? -18 : -4) : F.visible = !1
                            }
                        },
                        Y.prototype.refresh_btn = function () {
                            this.btn_save.visible = !1,
                                this.btn_save.mouseEnabled = !0,
                                this.btn_use.visible = !1,
                                this.btn_use.mouseEnabled = !0,
                                this.btn_using.visible = !1,
                                this._changed ? this.btn_save.visible = !0 : (this.btn_use.visible = H.UI_Sushe.using_commonview_index != this.tab_index, this.btn_using.visible = H.UI_Sushe.using_commonview_index == this.tab_index)
                        },
                        Y.prototype.onChangeSlotSelect = function (H) {
                            var u = this;
                            this.select_index = H;
                            var Y = 0;
                            H >= 0 && H < this.cell_default_item.length && (Y = this.cell_default_item[H]);
                            var F = Y,
                                V = this.slot_ids[H];
                            this.slot_map[V] && (F = this.slot_map[V]);
                            var r = Laya.Handler.create(this, function (F) {
                                F == Y && (F = 0),
                                    u.slot_map[V] = F,
                                    u.scrollview.wantToRefreshItem(H),
                                    u._changed = !0,
                                    u.refresh_btn()
                            }, null, !1);
                            this.page_items.close(),
                                this.page_desktop.close(),
                                this.page_headframe.close(),
                                this.page_bgm.close();
                            var h = game.Tools.strOfLocalization(this.cell_titles[H]);
                            if (H >= 0 && 2 >= H)
                                this.page_items.show(h, H, F, r);
                            else if (3 == H)
                                this.page_items.show(h, 10, F, r);
                            else if (4 == H)
                                this.page_items.show(h, 3, F, r);
                            else if (5 == H)
                                this.page_bgm.show(h, F, r);
                            else if (6 == H)
                                this.page_headframe.show(h, F, r);
                            else if (7 == H || 8 == H) {
                                var C = this.cell_default_item[7],
                                    B = this.cell_default_item[8];
                                this.slot_map[game.EView.desktop] && (C = this.slot_map[game.EView.desktop]),
                                    this.slot_map[game.EView.mjp] && (B = this.slot_map[game.EView.mjp]),
                                    7 == H ? this.page_desktop.show_desktop(h, C, B, r) : this.page_desktop.show_mjp(h, C, B, r)
                            } else
                                9 == H && this.page_desktop.show_lobby_bg(h, F, r)
                        },
                        Y.prototype.render_view = function (H) {
                            var u = this,
                                Y = H.container,
                                F = H.index,
                                V = Y.getChildByName("cell");
                            this.select_index == F ? (V.scaleX = V.scaleY = 1.05, V.getChildByName("choosed").visible = !0) : (V.scaleX = V.scaleY = 1, V.getChildByName("choosed").visible = !1),
                                V.getChildByName("title").text = game.Tools.strOfLocalization(this.cell_titles[F]);
                            var r = V.getChildByName("name"),
                                h = V.getChildByName("icon"),
                                C = this.cell_default_item[F],
                                B = this.slot_ids[F];
                            this.slot_map[B] && (C = this.slot_map[B]);
                            var _ = cfg.item_definition.item.get(C);
                            _ ? (r.text = _["name_" + GameMgr.client_language], game.LoadMgr.setImgSkin(h, _.icon, null, "UI_Sushe_Select.Zhuangban")) : (r.text = game.Tools.strOfLocalization(this.cell_names[F]), game.LoadMgr.setImgSkin(h, this.cell_default_img[F], null, "UI_Sushe_Select.Zhuangban"));
                            var d = V.getChildByName("btn");
                            d.clickHandler = Laya.Handler.create(this, function () {
                                u.locking || u.select_index != F && (u.onChangeSlotSelect(F), u.scrollview.wantToRefreshAll())
                            }, null, !1),
                                d.mouseEnabled = this.select_index != F
                        },
                        Y.prototype.close = function (u) {
                            var Y = this;
                            this.container_zhuangban0.visible && (u ? (this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.container_zhuangban0.visible = !1, this.container_zhuangban1.visible = !1, game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !1)) : (H.UIBase.anim_alpha_out(this.container_zhuangban0, {
                                x: 0
                            }, 200), H.UIBase.anim_alpha_out(this.container_zhuangban1, {
                                x: 0
                            }, 200, 0, Laya.Handler.create(this, function () {
                                Y.page_items.close(),
                                    Y.page_desktop.close(),
                                    Y.page_headframe.close(),
                                    Y.page_bgm.close(),
                                    Y.container_zhuangban0.visible = !1,
                                    Y.container_zhuangban1.visible = !1,
                                    game.TempImageMgr.setUIEnable("UI_Sushe_Select.Zhuangban", !1)
                            }))))
                        },
                        Y.prototype.onChangeGameView = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = H.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            GameMgr.Inst.load_mjp_view();
                            var u = game.GameUtility.get_view_id(game.EView.lobby_bg);
                            H.UI_Lite_Loading.Inst.show(),
                                game.Scene_Lobby.Inst.set_lobby_bg(u, Laya.Handler.create(this, function () {
                                    H.UI_Lite_Loading.Inst.enable && H.UI_Lite_Loading.Inst.close()
                                })),
                                GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                        },
                        Y
                }
                    ();
                u.Container_Zhuangban = Y
            }
                (u = H.zhuangban || (H.zhuangban = {}))
        }
            (uiscript || (uiscript = {}));

        // 设置称号
        !function (H) {
            var u = function (u) {
                function Y() {
                    var H = u.call(this, new ui.lobby.titlebookUI) || this;
                    return H._root = null,
                        H._scrollview = null,
                        H._blackmask = null,
                        H._locking = !1,
                        H._showindexs = [],
                        Y.Inst = H,
                        H
                }
                return __extends(Y, u),
                    Y.Init = function () {
                        var u = this;
                        // 获取称号
                        //app.NetAgent.sendReq2Lobby("Lobby", "fetchTitleList", {}, function (Y, F) {
                        //    if (Y || F.error)
                        //        H.UIMgr.Inst.showNetReqError("fetchTitleList", Y, F);
                        //    else {
                        u.owned_title = [];
                        for (let a of cfg.item_definition.title.rows_) {
                            var r = a.id;
                            cfg.item_definition.title.get(r) && u.owned_title.push(r),
                                600005 == r && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1),
                                r >= 600005 && 600015 >= r && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + r - 600005, 1)
                        }

                        //})
                    },
                    Y.title_update = function (u) {
                        for (var Y = 0; Y < u.new_titles.length; Y++)
                            cfg.item_definition.title.get(u.new_titles[Y]) && this.owned_title.push(u.new_titles[Y]), 600005 == u.new_titles[Y] && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1), u.new_titles[Y] >= 600005 && u.new_titles[Y] <= 600015 && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + u.new_titles[Y] - 600005, 1);
                        if (u.remove_titles && u.remove_titles.length > 0) {
                            for (var Y = 0; Y < u.remove_titles.length; Y++) {
                                for (var F = u.remove_titles[Y], V = 0; V < this.owned_title.length; V++)
                                    if (this.owned_title[V] == F) {
                                        this.owned_title[V] = this.owned_title[this.owned_title.length - 1],
                                            this.owned_title.pop();
                                        break
                                    }
                                F == GameMgr.Inst.account_data.title && (GameMgr.Inst.account_data.title = 600001, H.UI_Lobby.Inst.enable && H.UI_Lobby.Inst.top.refresh(), H.UI_PlayerInfo.Inst.enable && H.UI_PlayerInfo.Inst.refreshBaseInfo())
                            }
                            this.Inst.enable && this.Inst.show()
                        }
                    },
                    Y.prototype.onCreate = function () {
                        var u = this;
                        this._root = this.me.getChildByName("root"),
                            this._blackmask = new H.UI_BlackMask(this.me.getChildByName("bmask"), Laya.Handler.create(this, function () {
                                return u._locking
                            }, null, !1), Laya.Handler.create(this, this.close, null, !1)),
                            this._scrollview = this._root.getChildByName("content").scriptMap["capsui.CScrollView"],
                            this._scrollview.init_scrollview(Laya.Handler.create(this, function (H) {
                                u.setItemValue(H.index, H.container)
                            }, null, !1)),
                            this._root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                u._locking || (u._blackmask.hide(), u.close())
                            }, null, !1),
                            this._noinfo = this._root.getChildByName("noinfo")
                    },
                    Y.prototype.show = function () {
                        var u = this;
                        if (this._locking = !0, this.enable = !0, this._blackmask.show(), Y.owned_title.length > 0) {
                            this._showindexs = [];
                            for (var F = 0; F < Y.owned_title.length; F++)
                                this._showindexs.push(F);
                            this._showindexs = this._showindexs.sort(function (H, u) {
                                var F = H,
                                    V = cfg.item_definition.title.get(Y.owned_title[H]);
                                V && (F += 1e3 * V.priority);
                                var r = u,
                                    h = cfg.item_definition.title.get(Y.owned_title[u]);
                                return h && (r += 1e3 * h.priority),
                                    r - F
                            }),
                                this._scrollview.reset(),
                                this._scrollview.addItem(Y.owned_title.length),
                                this._scrollview.me.visible = !0,
                                this._noinfo.visible = !1
                        } else
                            this._noinfo.visible = !0, this._scrollview.me.visible = !1;
                        H.UIBase.anim_pop_out(this._root, Laya.Handler.create(this, function () {
                            u._locking = !1
                        }))
                    },
                    Y.prototype.close = function () {
                        var u = this;
                        this._locking = !0,
                            H.UIBase.anim_pop_hide(this._root, Laya.Handler.create(this, function () {
                                u._locking = !1,
                                    u.enable = !1
                            }))
                    },
                    Y.prototype.onEnable = function () {
                        game.TempImageMgr.setUIEnable("UI_TitleBook", !0)
                    },
                    Y.prototype.onDisable = function () {
                        game.TempImageMgr.setUIEnable("UI_TitleBook", !1),
                            this._scrollview.reset()
                    },
                    Y.prototype.setItemValue = function (H, u) {
                        var F = this;
                        if (this.enable) {
                            var V = Y.owned_title[this._showindexs[H]],
                                r = cfg.item_definition.title.find(V);
                            game.LoadMgr.setImgSkin(u.getChildByName("img_title"), r.icon, null, "UI_TitleBook"),
                                u.getChildByName("using").visible = V == GameMgr.Inst.account_data.title,
                                u.getChildByName("desc").text = r["desc_" + GameMgr.client_language];
                            var h = u.getChildByName("btn");
                            h.clickHandler = Laya.Handler.create(this, function () {
                                V != GameMgr.Inst.account_data.title ? (F.changeTitle(H), u.getChildByName("using").visible = !0) : (F.changeTitle(-1), u.getChildByName("using").visible = !1)
                            }, null, !1);
                            var C = u.getChildByName("time"),
                                B = u.getChildByName("img_title");
                            if (1 == r.unlock_type) {
                                var _ = r.unlock_param[0],
                                    d = cfg.item_definition.item.get(_);
                                C.text = game.Tools.strOfLocalization(3121) + d["expire_desc_" + GameMgr.client_language],
                                    C.visible = !0,
                                    B.y = 0
                            } else
                                C.visible = !1, B.y = 10
                        }
                    },
                    Y.prototype.changeTitle = function (u) {
                        var F = this,
                            V = GameMgr.Inst.account_data.title,
                            r = 0;
                        r = u >= 0 && u < this._showindexs.length ? Y.owned_title[this._showindexs[u]] : 600001,
                            GameMgr.Inst.account_data.title = r;
                        for (var h = -1, C = 0; C < this._showindexs.length; C++)
                            if (V == Y.owned_title[this._showindexs[C]]) {
                                h = C;
                                break
                            }
                        H.UI_Lobby.Inst.enable && H.UI_Lobby.Inst.top.refresh(),
                            H.UI_PlayerInfo.Inst.enable && H.UI_PlayerInfo.Inst.refreshBaseInfo(),
                            -1 != h && this._scrollview.wantToRefreshItem(h),
                            //app.NetAgent.sendReq2Lobby("Lobby", "useTitle", {
                            MMP.settings.title = r;
                        MMP.saveSettings();
                        //    (Y || r.error) && (H.UIMgr.Inst.showNetReqError("useTitle", Y, r), GameMgr.Inst.account_data.title = V, H.UI_Lobby.Inst.enable && H.UI_Lobby.Inst.top.refresh(), H.UI_PlayerInfo.Inst.enable && H.UI_PlayerInfo.Inst.refreshBaseInfo(), F.enable && (u >= 0 && u < F._showindexs.length && F._scrollview.wantToRefreshItem(u), h >= 0 && h < F._showindexs.length && F._scrollview.wantToRefreshItem(h)))
                        //})
                    },
                    Y.Inst = null,
                    Y.owned_title = [],
                    Y
            }
                (H.UIBase);
            H.UI_TitleBook = u
        }
            (uiscript || (uiscript = {}));

        // 友人房调整装扮
        !function (H) {
            var u;
            !function (u) {
                var Y = function () {
                    function Y(H) {
                        this.scrollview = null,
                            this.page_skin = null,
                            this.chara_infos = [],
                            this.choosed_chara_index = 0,
                            this.choosed_skin_id = 0,
                            this.star_char_count = 0,
                            this.me = H,
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.me.getChildByName("left").visible = !0, this.me.getChildByName("left_en").visible = !1, this.scrollview = this.me.getChildByName("left").scriptMap["capsui.CScrollView"]) : (this.me.getChildByName("left").visible = !1, this.me.getChildByName("left_en").visible = !0, this.scrollview = this.me.getChildByName("left_en").scriptMap["capsui.CScrollView"]),
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3),
                            this.scrollview.setElastic(),
                            this.page_skin = new u.Page_Skin(this.me.getChildByName("right"))
                    }
                    return Y.prototype.show = function (u) {
                        var Y = this;
                        this.me.visible = !0,
                            u ? this.me.alpha = 1 : H.UIBase.anim_alpha_in(this.me, {
                                x: 0
                            }, 200, 0),
                            this.choosed_chara_index = 0,
                            this.chara_infos = [];
                        for (var F = 0, V = H.UI_Sushe.star_chars; F < V.length; F++)
                            for (var r = V[F], h = 0; h < H.UI_Sushe.characters.length; h++)
                                if (!H.UI_Sushe.hidden_characters_map[r] && H.UI_Sushe.characters[h].charid == r) {
                                    this.chara_infos.push({
                                        chara_id: H.UI_Sushe.characters[h].charid,
                                        skin_id: H.UI_Sushe.characters[h].skin,
                                        is_upgraded: H.UI_Sushe.characters[h].is_upgraded
                                    }),
                                        H.UI_Sushe.main_character_id == H.UI_Sushe.characters[h].charid && (this.choosed_chara_index = this.chara_infos.length - 1);
                                    break
                                }
                        this.star_char_count = this.chara_infos.length;
                        for (var h = 0; h < H.UI_Sushe.characters.length; h++)
                            H.UI_Sushe.hidden_characters_map[H.UI_Sushe.characters[h].charid] || -1 == H.UI_Sushe.star_chars.indexOf(H.UI_Sushe.characters[h].charid) && (this.chara_infos.push({
                                chara_id: H.UI_Sushe.characters[h].charid,
                                skin_id: H.UI_Sushe.characters[h].skin,
                                is_upgraded: H.UI_Sushe.characters[h].is_upgraded
                            }), H.UI_Sushe.main_character_id == H.UI_Sushe.characters[h].charid && (this.choosed_chara_index = this.chara_infos.length - 1));
                        this.choosed_skin_id = this.chara_infos[this.choosed_chara_index].skin_id,
                            this.scrollview.reset(),
                            this.scrollview.addItem(this.chara_infos.length);
                        var C = this.chara_infos[this.choosed_chara_index];
                        this.page_skin.show(C.chara_id, C.skin_id, Laya.Handler.create(this, function (H) {
                            Y.choosed_skin_id = H,
                                C.skin_id = H,
                                Y.scrollview.wantToRefreshItem(Y.choosed_chara_index)
                        }, null, !1))
                    },
                        Y.prototype.render_character_cell = function (u) {
                            var Y = this,
                                F = u.index,
                                V = u.container,
                                r = u.cache_data;
                            r.index = F;
                            var h = this.chara_infos[F];
                            r.inited || (r.inited = !0, r.skin = new H.UI_Character_Skin(V.getChildByName("btn").getChildByName("head")), r.bound = V.getChildByName("btn").getChildByName("bound"));
                            var C = V.getChildByName("btn");
                            C.getChildByName("choose").visible = F == this.choosed_chara_index,
                                r.skin.setSkin(h.skin_id, "bighead"),
                                C.getChildByName("using").visible = F == this.choosed_chara_index,
                                C.getChildByName("label_name").text = "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? cfg.item_definition.character.find(h.chara_id)["name_" + GameMgr.client_language].replace("-", "|") : cfg.item_definition.character.find(h.chara_id)["name_" + GameMgr.client_language],
                                C.getChildByName("star") && (C.getChildByName("star").visible = F < this.star_char_count);
                            var B = cfg.item_definition.character.get(h.chara_id);
                            "en" == GameMgr.client_language || "jp" == GameMgr.client_language ? r.bound.skin = B.ur ? game.Tools.localUISrc("myres/sushe/bg_head_bound" + (h.is_upgraded ? "4.png" : "3.png")) : game.Tools.localUISrc("myres/sushe/en_head_bound" + (h.is_upgraded ? "2.png" : ".png")) : B.ur ? (r.bound.pos(-10, -2), r.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (h.is_upgraded ? "6.png" : "5.png"))) : (r.bound.pos(4, 20), r.bound.skin = game.Tools.localUISrc("myres/sushe/bg_head" + (h.is_upgraded ? "4.png" : "3.png"))),
                                C.getChildByName("bg").skin = game.Tools.localUISrc("myres/sushe/bg_head" + (h.is_upgraded ? "2.png" : ".png")),
                                V.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                    if (F != Y.choosed_chara_index) {
                                        var H = Y.choosed_chara_index;
                                        Y.choosed_chara_index = F,
                                            Y.choosed_skin_id = h.skin_id,
                                            Y.page_skin.show(h.chara_id, h.skin_id, Laya.Handler.create(Y, function (H) {
                                                Y.choosed_skin_id = H,
                                                    h.skin_id = H,
                                                    r.skin.setSkin(H, "bighead")
                                            }, null, !1)),
                                            Y.scrollview.wantToRefreshItem(H),
                                            Y.scrollview.wantToRefreshItem(F)
                                    }
                                })
                        },
                        Y.prototype.close = function (u) {
                            var Y = this;
                            if (this.me.visible)
                                if (u)
                                    this.me.visible = !1;
                                else {
                                    var F = this.chara_infos[this.choosed_chara_index];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //F.chara_id != H.UI_Sushe.main_character_id && (app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                    //        character_id: F.chara_id
                                    //    }, function () {}), 
                                    H.UI_Sushe.main_character_id = F.chara_id;
                                    //this.choosed_skin_id != GameMgr.Inst.account_data.avatar_id && app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                    //    character_id: F.chara_id,
                                    //    skin: this.choosed_skin_id
                                    //}, function () {});
                                    // end
                                    for (var V = 0; V < H.UI_Sushe.characters.length; V++)
                                        if (H.UI_Sushe.characters[V].charid == F.chara_id) {
                                            H.UI_Sushe.characters[V].skin = this.choosed_skin_id;
                                            break
                                        }
                                    GameMgr.Inst.account_data.avatar_id = this.choosed_skin_id,
                                        H.UIBase.anim_alpha_out(this.me, {
                                            x: 0
                                        }, 200, 0, Laya.Handler.create(this, function () {
                                            Y.me.visible = !1
                                        }))
                                }
                        },
                        Y
                }
                    ();
                u.Page_Waiting_Head = Y
            }
                (u = H.zhuangban || (H.zhuangban = {}))
        }
            (uiscript || (uiscript = {}));

        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var t = GameMgr;
            var u = this;
            app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountInfo", {}, function (Y, F) {
                if (Y || F.error)
                    uiscript.UIMgr.Inst.showNetReqError("fetchAccountInfo", Y, F);
                else {
                    app.Log.log("UpdateAccount: " + JSON.stringify(F)),
                        H.Inst.account_refresh_time = Laya.timer.currTimer;
                    // 对局结束更新数据
                    F.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    F.account.title = GameMgr.Inst.account_data.title;
                    F.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        F.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var V in F.account) {
                        if (H.Inst.account_data[V] = F.account[V], "platform_diamond" == V)
                            for (var r = F.account[V], h = 0; h < r.length; h++)
                                u.account_numerical_resource[r[h].id] = r[h].count;
                        if ("skin_ticket" == V && (H.Inst.account_numerical_resource[100004] = F.account[V]), "platform_skin_ticket" == V)
                            for (var r = F.account[V], h = 0; h < r.length; h++)
                                u.account_numerical_resource[r[h].id] = r[h].count
                    }
                    uiscript.UI_Lobby.Inst.refreshInfo(),
                        F.account.room_id && H.Inst.updateRoom(),
                        10102 === H.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_2, 1),
                        10103 === H.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_3, 1)
                }
            })
        };
        // 保存状态
        uiscript.UI_DesktopInfo.prototype.resetFunc = function () {
            var H = Laya.LocalStorage.getItem("autolipai"),
                u = !0;
            u = H && "" != H ? "true" == H : !0;
            var Y = this._container_fun.getChildByName("btn_autolipai");
            this.refreshFuncBtnShow(Y, u),
                Laya.LocalStorage.setItem("autolipai", u ? "true" : "false"),
                view.DesktopMgr.Inst.setAutoLiPai(u);
            var F = this._container_fun.getChildByName("btn_autohu");
            this.refreshFuncBtnShow(F, view.DesktopMgr.Inst.auto_hule);
            var V = this._container_fun.getChildByName("btn_autonoming");
            this.refreshFuncBtnShow(V, view.DesktopMgr.Inst.auto_nofulu);
            var r = this._container_fun.getChildByName("btn_automoqie");
            this.refreshFuncBtnShow(r, view.DesktopMgr.Inst.auto_moqie),
                this._container_fun.x = -528,
                this.arrow.scaleX = -1
            // 保存状态
            if (MMP.settings.setAuto.isSetAuto) {
                setAuto();
            }
            // END
        };
        uiscript.UI_DesktopInfo.prototype._initFunc = function () {
            var H = this;
            this._container_fun = this.me.getChildByName("container_func");
            var u = this._container_fun.getChildByName("btn_func"),
                Y = this._container_fun.getChildByName("btn_func2");
            u.clickHandler = Y.clickHandler = new Laya.Handler(this, function () {
                var Y = 0;
                H._container_fun.x < -400 ? (Y = -274, H.arrow.scaleX = 1) : (Y = -528, H.arrow.scaleX = -1),
                    Laya.Tween.to(H._container_fun, {
                        x: Y
                    }, 200, Laya.Ease.strongOut, Laya.Handler.create(H, function () {
                        u.disabled = !1
                    }), 0, !0, !0),
                    u.disabled = !0
            }, null, !1);
            var F = this._container_fun.getChildByName("btn_autolipai"),
                V = this._container_fun.getChildByName("btn_autolipai2");
            this.refreshFuncBtnShow(F, !0),
                F.clickHandler = V.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoLiPai(!view.DesktopMgr.Inst.auto_liqi),
                        H.refreshFuncBtnShow(F, view.DesktopMgr.Inst.auto_liqi),
                        Laya.LocalStorage.setItem("autolipai", view.DesktopMgr.Inst.auto_liqi ? "true" : "false")
                    MMP.settings.setAuto.setAutoLiPai = view.DesktopMgr.Inst.auto_liqi;
                    MMP.saveSettings();
                }, null, !1);
            var r = this._container_fun.getChildByName("btn_autohu"),
                h = this._container_fun.getChildByName("btn_autohu2");
            this.refreshFuncBtnShow(r, !1),
                r.clickHandler = h.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoHule(!view.DesktopMgr.Inst.auto_hule),
                        H.refreshFuncBtnShow(r, view.DesktopMgr.Inst.auto_hule)
                    MMP.settings.setAuto.setAutoHule = view.DesktopMgr.Inst.auto_hule;
                    MMP.saveSettings();
                }, null, !1);
            var C = this._container_fun.getChildByName("btn_autonoming"),
                B = this._container_fun.getChildByName("btn_autonoming2");
            this.refreshFuncBtnShow(C, !1),
                C.clickHandler = B.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoNoFulu(!view.DesktopMgr.Inst.auto_nofulu),
                        H.refreshFuncBtnShow(C, view.DesktopMgr.Inst.auto_nofulu)
                    MMP.settings.setAuto.setAutoNoFulu = view.DesktopMgr.Inst.auto_nofulu;
                    MMP.saveSettings();
                }, null, !1);
            var _ = this._container_fun.getChildByName("btn_automoqie"),
                d = this._container_fun.getChildByName("btn_automoqie2");
            this.refreshFuncBtnShow(_, !1),
                _.clickHandler = d.clickHandler = Laya.Handler.create(this, function () {
                    view.DesktopMgr.Inst.setAutoMoQie(!view.DesktopMgr.Inst.auto_moqie),
                        H.refreshFuncBtnShow(_, view.DesktopMgr.Inst.auto_moqie)
                    MMP.settings.setAuto.setAutoMoQie = view.DesktopMgr.Inst.auto_moqie;
                    MMP.saveSettings();
                }, null, !1),
                Laya.Browser.onPC && !GameMgr.inConch ? (u.visible = !1, h.visible = !0, V.visible = !0, B.visible = !0, d.visible = !0) : (u.visible = !0, h.visible = !1, V.visible = !1, B.visible = !1, d.visible = !1),
                this.arrow = this._container_fun.getChildByName("arrow"),
                this.arrow.scaleX = -1
        };
        let temp = uiscript.UI_Info.Init;
        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            temp();
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
        console.log('[雀魂mod_plus] 启动完毕!!!');
    } catch (error) {
        console.log('[雀魂mod_plus] 等待游戏启动');
        setTimeout(majsoul_mod_plus, 1000);
    }
}
    ();

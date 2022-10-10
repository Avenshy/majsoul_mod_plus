// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.164
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
        !function (d) {
            var i;
            !function (d) {
                d[d.none = 0] = "none",
                    d[d["daoju"] = 1] = "daoju",
                    d[d.gift = 2] = "gift",
                    d[d["fudai"] = 3] = "fudai",
                    d[d.view = 5] = "view";
            }
                (i = d["EItemCategory"] || (d["EItemCategory"] = {}));
            var m = function (m) {
                function s() {
                    var d = m.call(this, new ui["lobby"]["bagUI"]()) || this;
                    return d["container_top"] = null,
                        d["container_content"] = null,
                        d["locking"] = !1,
                        d.tabs = [],
                        d["page_item"] = null,
                        d["page_gift"] = null,
                        d["page_skin"] = null,
                        d["select_index"] = 0,
                        s.Inst = d,
                        d;
                }
                return __extends(s, m),
                    s.init = function () {
                        var d = this;
                        app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function (i) {
                            var m = i["update"];
                            m && m.bag && (d["update_data"](m.bag["update_items"]), d["update_daily_gain_data"](m.bag));
                        }, null, !1)),
                            this["fetch"]();
                    },
                    s["fetch"] = function () {
                        var i = this;
                        this["_item_map"] = {},
                            this["_daily_gain_record"] = {},
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchBagInfo", {}, function (m, s) {
                                if (m || s["error"])
                                    d["UIMgr"].Inst["showNetReqError"]("fetchBagInfo", m, s);
                                else {
                                    app.Log.log("背包信息：" + JSON["stringify"](s));
                                    var D = s.bag;
                                    if (D) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of D["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            i._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    i._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }


                                        } else {
                                            if (D["items"])
                                                for (var j = 0; j < D["items"]["length"]; j++) {
                                                    var L = D["items"][j]["item_id"],
                                                        O = D["items"][j]["stack"],
                                                        X = cfg["item_definition"].item.get(L);
                                                    X && (i["_item_map"][L] = {
                                                        item_id: L,
                                                        count: O,
                                                        category: X["category"]
                                                    }, 1 == X["category"] && 3 == X.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                                        item_id: L
                                                    }, function () { }));
                                                }
                                            if (D["daily_gain_record"])
                                                for (var Y = D["daily_gain_record"], j = 0; j < Y["length"]; j++) {
                                                    var B = Y[j]["limit_source_id"];
                                                    i["_daily_gain_record"][B] = {};
                                                    var w = Y[j]["record_time"];
                                                    i["_daily_gain_record"][B]["record_time"] = w;
                                                    var N = Y[j]["records"];
                                                    if (N)
                                                        for (var g = 0; g < N["length"]; g++)
                                                            i["_daily_gain_record"][B][N[g]["item_id"]] = N[g]["count"];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    s["find_item"] = function (d) {
                        var i = this["_item_map"][d];
                        return i ? {
                            item_id: i["item_id"],
                            category: i["category"],
                            count: i["count"]
                        }
                            : null;
                    },
                    s["get_item_count"] = function (d) {
                        var i = this["find_item"](d);
                        if (i)
                            return i["count"];
                        if ("100001" == d) {
                            for (var m = 0, s = 0, D = GameMgr.Inst["free_diamonds"]; s < D["length"]; s++) {
                                var j = D[s];
                                GameMgr.Inst["account_numerical_resource"][j] && (m += GameMgr.Inst["account_numerical_resource"][j]);
                            }
                            for (var L = 0, O = GameMgr.Inst["paid_diamonds"]; L < O["length"]; L++) {
                                var j = O[L];
                                GameMgr.Inst["account_numerical_resource"][j] && (m += GameMgr.Inst["account_numerical_resource"][j]);
                            }
                            return m;
                        }
                        if ("100004" == d) {
                            for (var X = 0, Y = 0, B = GameMgr.Inst["free_pifuquans"]; Y < B["length"]; Y++) {
                                var j = B[Y];
                                GameMgr.Inst["account_numerical_resource"][j] && (X += GameMgr.Inst["account_numerical_resource"][j]);
                            }
                            for (var w = 0, N = GameMgr.Inst["paid_pifuquans"]; w < N["length"]; w++) {
                                var j = N[w];
                                GameMgr.Inst["account_numerical_resource"][j] && (X += GameMgr.Inst["account_numerical_resource"][j]);
                            }
                            return X;
                        }
                        return "100002" == d ? GameMgr.Inst["account_data"].gold : 0;
                    },
                    s["find_items_by_category"] = function (d) {
                        var i = [];
                        for (var m in this["_item_map"])
                            this["_item_map"][m]["category"] == d && i.push({
                                item_id: this["_item_map"][m]["item_id"],
                                category: this["_item_map"][m]["category"],
                                count: this["_item_map"][m]["count"]
                            });
                        return i;
                    },
                    s["update_data"] = function (i) {
                        for (var m = 0; m < i["length"]; m++) {
                            var s = i[m]["item_id"],
                                D = i[m]["stack"];
                            if (D > 0) {
                                this["_item_map"]["hasOwnProperty"](s["toString"]()) ? this["_item_map"][s]["count"] = D : this["_item_map"][s] = {
                                    item_id: s,
                                    count: D,
                                    category: cfg["item_definition"].item.get(s)["category"]
                                };
                                var j = cfg["item_definition"].item.get(s);
                                1 == j["category"] && 3 == j.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                    item_id: s
                                }, function () { }),
                                    5 == j["category"] && (this["new_bag_item_ids"].push(s), this["new_zhuangban_item_ids"][s] = 1);
                            } else if (this["_item_map"]["hasOwnProperty"](s["toString"]())) {
                                var L = cfg["item_definition"].item.get(s);
                                L && 5 == L["category"] && d["UI_Sushe"]["on_view_remove"](s),
                                    this["_item_map"][s] = 0,
                                    delete this["_item_map"][s];
                            }
                        }
                        this.Inst && this.Inst["when_data_change"]();
                        for (var m = 0; m < i["length"]; m++) {
                            var s = i[m]["item_id"];
                            if (this["_item_listener"]["hasOwnProperty"](s["toString"]()))
                                for (var O = this["_item_listener"][s], X = 0; X < O["length"]; X++)
                                    O[X].run();
                        }
                        for (var m = 0; m < this["_all_item_listener"]["length"]; m++)
                            this["_all_item_listener"][m].run();
                    },
                    s["update_daily_gain_data"] = function (d) {
                        var i = d["update_daily_gain_record"];
                        if (i)
                            for (var m = 0; m < i["length"]; m++) {
                                var s = i[m]["limit_source_id"];
                                this["_daily_gain_record"][s] || (this["_daily_gain_record"][s] = {});
                                var D = i[m]["record_time"];
                                this["_daily_gain_record"][s]["record_time"] = D;
                                var j = i[m]["records"];
                                if (j)
                                    for (var L = 0; L < j["length"]; L++)
                                        this["_daily_gain_record"][s][j[L]["item_id"]] = j[L]["count"];
                            }
                    },
                    s["get_item_daily_record"] = function (d, i) {
                        return this["_daily_gain_record"][d] ? this["_daily_gain_record"][d]["record_time"] ? game["Tools"]["isPassedRefreshTimeServer"](this["_daily_gain_record"][d]["record_time"]) ? this["_daily_gain_record"][d][i] ? this["_daily_gain_record"][d][i] : 0 : 0 : 0 : 0;
                    },
                    s["add_item_listener"] = function (d, i) {
                        this["_item_listener"]["hasOwnProperty"](d["toString"]()) || (this["_item_listener"][d] = []),
                            this["_item_listener"][d].push(i);
                    },
                    s["remove_item_listener"] = function (d, i) {
                        var m = this["_item_listener"][d];
                        if (m)
                            for (var s = 0; s < m["length"]; s++)
                                if (m[s] === i) {
                                    m[s] = m[m["length"] - 1],
                                        m.pop();
                                    break;
                                }
                    },
                    s["add_all_item_listener"] = function (d) {
                        this["_all_item_listener"].push(d);
                    },
                    s["remove_all_item_listener"] = function (d) {
                        for (var i = this["_all_item_listener"], m = 0; m < i["length"]; m++)
                            if (i[m] === d) {
                                i[m] = i[i["length"] - 1],
                                    i.pop();
                                break;
                            }
                    },
                    s["removeAllBagNew"] = function () {
                        this["new_bag_item_ids"] = [];
                    },
                    s["removeZhuangBanNew"] = function (d) {
                        for (var i = 0, m = d; i < m["length"]; i++) {
                            var s = m[i];
                            delete this["new_zhuangban_item_ids"][s];
                        }
                    },
                    s["prototype"]["have_red_point"] = function () {
                        return !1;
                    },
                    s["prototype"]["onCreate"] = function () {
                        var i = this;
                        this["container_top"] = this.me["getChildByName"]("top"),
                            this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || i.hide(Laya["Handler"]["create"](i, function () {
                                    return i["closeHandler"] ? (i["closeHandler"].run(), i["closeHandler"] = null, void 0) : (d["UI_Lobby"].Inst["enable"] = !0, void 0);
                                }));
                            }, null, !1),
                            this["container_content"] = this.me["getChildByName"]("content");
                        for (var m = function (d) {
                            s.tabs.push(s["container_content"]["getChildByName"]("tabs")["getChildByName"]("btn" + d)),
                                s.tabs[d]["clickHandler"] = Laya["Handler"]["create"](s, function () {
                                    i["select_index"] != d && i["on_change_tab"](d);
                                }, null, !1);
                        }, s = this, D = 0; 4 > D; D++)
                            m(D);
                        this["page_item"] = new d["UI_Bag_PageItem"](this["container_content"]["getChildByName"]("page_items")),
                            this["page_gift"] = new d["UI_Bag_PageGift"](this["container_content"]["getChildByName"]("page_gift")),
                            this["page_skin"] = new d["UI_Bag_PageSkin"](this["container_content"]["getChildByName"]("page_skin"));
                    },
                    s["prototype"].show = function (i, m) {
                        var s = this;
                        void 0 === i && (i = 0),
                            void 0 === m && (m = null),
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this["closeHandler"] = m,
                            d["UIBase"]["anim_alpha_in"](this["container_top"], {
                                y: -30
                            }, 200),
                            d["UIBase"]["anim_alpha_in"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                s["locking"] = !1;
                            }),
                            this["on_change_tab"](i),
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                            3 != i && this["page_skin"]["when_update_data"]();
                    },
                    s["prototype"].hide = function (i) {
                        var m = this;
                        this["locking"] = !0,
                            d["UIBase"]["anim_alpha_out"](this["container_top"], {
                                y: -30
                            }, 200),
                            d["UIBase"]["anim_alpha_out"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                m["locking"] = !1,
                                    m["enable"] = !1,
                                    i && i.run();
                            });
                    },
                    s["prototype"]["onDisable"] = function () {
                        this["page_skin"]["close"](),
                            this["page_item"]["close"](),
                            this["page_gift"]["close"]();
                    },
                    s["prototype"]["on_change_tab"] = function (d) {
                        this["select_index"] = d;
                        for (var m = 0; m < this.tabs["length"]; m++)
                            this.tabs[m].skin = game["Tools"]["localUISrc"](d == m ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[m]["getChildAt"](0)["color"] = d == m ? "#d9b263" : "#8cb65f";
                        switch (this["page_item"]["close"](), this["page_gift"]["close"](), this["page_skin"].me["visible"] = !1, d) {
                            case 0:
                                this["page_item"].show(i["daoju"]);
                                break;
                            case 1:
                                this["page_gift"].show();
                                break;
                            case 2:
                                this["page_item"].show(i.view);
                                break;
                            case 3:
                                this["page_skin"].show();
                        }
                    },
                    s["prototype"]["when_data_change"] = function () {
                        this["page_item"].me["visible"] && this["page_item"]["when_update_data"](),
                            this["page_gift"].me["visible"] && this["page_gift"]["when_update_data"]();
                    },
                    s["prototype"]["on_skin_change"] = function () {
                        this["page_skin"]["when_update_data"]();
                    },
                    s["prototype"]["clear_desktop_btn_redpoint"] = function () {
                        this.tabs[3]["getChildByName"]("redpoint")["visible"] = !1;
                    },
                    s["_item_map"] = {},
                    s["_item_listener"] = {},
                    s["_all_item_listener"] = [],
                    s["_daily_gain_record"] = {},
                    s["new_bag_item_ids"] = [],
                    s["new_zhuangban_item_ids"] = {},
                    s.Inst = null,
                    s;
            }
                (d["UIBase"]);
            d["UI_Bag"] = m;
        }
            (uiscript || (uiscript = {}));



        // 修改牌桌上角色
        !function (d) {
            var i = function () {
                function i() {
                    var i = this;
                    this.urls = [],
                        this["link_index"] = -1,
                        this["connect_state"] = d["EConnectState"].none,
                        this["reconnect_count"] = 0,
                        this["reconnect_span"] = [500, 1000, 3000, 6000, 10000, 15000],
                        this["playerreconnect"] = !1,
                        this["lasterrortime"] = 0,
                        this["load_over"] = !1,
                        this["loaded_player_count"] = 0,
                        this["real_player_count"] = 0,
                        this["is_ob"] = !1,
                        this["ob_token"] = '',
                        this["lb_index"] = 0,
                        this["_report_reconnect_count"] = 0,
                        this["_connect_start_time"] = 0,
                        app["NetAgent"]["AddListener2MJ"]("NotifyPlayerLoadGameReady", Laya["Handler"]["create"](this, function (d) {
                            app.Log.log("NotifyPlayerLoadGameReady: " + JSON["stringify"](d)),
                                i["loaded_player_count"] = d["ready_id_list"]["length"],
                                i["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](i["loaded_player_count"], i["real_player_count"]);
                        }));
                }
                return Object["defineProperty"](i, "Inst", {
                    get: function () {
                        return null == this["_Inst"] ? this["_Inst"] = new i() : this["_Inst"];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    i["prototype"]["OpenConnect"] = function (i, m, s, D) {
                        var j = this;
                        uiscript["UI_Loading"].Inst.show("enter_mj"),
                            d["Scene_Lobby"].Inst && d["Scene_Lobby"].Inst["active"] && (d["Scene_Lobby"].Inst["active"] = !1),
                            d["Scene_Huiye"].Inst && d["Scene_Huiye"].Inst["active"] && (d["Scene_Huiye"].Inst["active"] = !1),
                            this["Close"](),
                            view["BgmListMgr"]["stopBgm"](),
                            this["is_ob"] = !1,
                            Laya["timer"].once(500, this, function () {
                                j.url = '',
                                    j["token"] = i,
                                    j["game_uuid"] = m,
                                    j["server_location"] = s,
                                    GameMgr.Inst["ingame"] = !0,
                                    GameMgr.Inst["mj_server_location"] = s,
                                    GameMgr.Inst["mj_game_token"] = i,
                                    GameMgr.Inst["mj_game_uuid"] = m,
                                    j["playerreconnect"] = D,
                                    j["_setState"](d["EConnectState"]["tryconnect"]),
                                    j["load_over"] = !1,
                                    j["loaded_player_count"] = 0,
                                    j["real_player_count"] = 0,
                                    j["lb_index"] = 0,
                                    j["_fetch_gateway"](0);
                            }),
                            Laya["timer"].loop(300000, this, this["reportInfo"]);
                    },
                    i["prototype"]["reportInfo"] = function () {
                        this["connect_state"] == d["EConnectState"]["connecting"] && GameMgr.Inst["postNewInfo2Server"]("network_route", {
                            client_type: "web",
                            route_type: "game",
                            route_index: d["LobbyNetMgr"]["root_id_lst"][d["LobbyNetMgr"].Inst["choosed_index"]],
                            route_delay: Math.min(10000, Math["round"](app["NetAgent"]["mj_network_delay"])),
                            connection_time: Math["round"](Date.now() - this["_connect_start_time"]),
                            reconnect_count: this["_report_reconnect_count"]
                        });
                    },
                    i["prototype"]["Close"] = function () {
                        this["load_over"] = !1,
                            app.Log.log("MJNetMgr close"),
                            this["_setState"](d["EConnectState"].none),
                            app["NetAgent"]["Close2MJ"](),
                            this.url = '',
                            Laya["timer"]["clear"](this, this["reportInfo"]);
                    },
                    i["prototype"]["_OnConnent"] = function (i) {
                        app.Log.log("MJNetMgr _OnConnent event:" + i),
                            i == Laya["Event"]["CLOSE"] || i == Laya["Event"]["ERROR"] ? Laya["timer"]["currTimer"] - this["lasterrortime"] > 100 && (this["lasterrortime"] = Laya["timer"]["currTimer"], this["connect_state"] == d["EConnectState"]["tryconnect"] ? this["_try_to_linknext"]() : this["connect_state"] == d["EConnectState"]["connecting"] ? view["DesktopMgr"].Inst["active"] ? (view["DesktopMgr"].Inst["duringReconnect"] = !0, this["_setState"](d["EConnectState"]["reconnecting"]), this["reconnect_count"] = 0, this["_Reconnect"]()) : (this["_setState"](d["EConnectState"]["disconnect"]), uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2008)), d["Scene_MJ"].Inst["ForceOut"]()) : this["connect_state"] == d["EConnectState"]["reconnecting"] && this["_Reconnect"]()) : i == Laya["Event"].OPEN && (this["_connect_start_time"] = Date.now(), (this["connect_state"] == d["EConnectState"]["tryconnect"] || this["connect_state"] == d["EConnectState"]["reconnecting"]) && ((this["connect_state"] = d["EConnectState"]["tryconnect"]) ? this["_report_reconnect_count"] = 0 : this["_report_reconnect_count"]++, this["_setState"](d["EConnectState"]["connecting"]), this["is_ob"] ? this["_ConnectSuccessOb"]() : this["_ConnectSuccess"]()));
                    },
                    i["prototype"]["_Reconnect"] = function () {
                        var i = this;
                        d["LobbyNetMgr"].Inst["connect_state"] == d["EConnectState"].none || d["LobbyNetMgr"].Inst["connect_state"] == d["EConnectState"]["disconnect"] ? this["_setState"](d["EConnectState"]["disconnect"]) : d["LobbyNetMgr"].Inst["connect_state"] == d["EConnectState"]["connecting"] && GameMgr.Inst["logined"] ? this["reconnect_count"] >= this["reconnect_span"]["length"] ? this["_setState"](d["EConnectState"]["disconnect"]) : (Laya["timer"].once(this["reconnect_span"][this["reconnect_count"]], this, function () {
                            i["connect_state"] == d["EConnectState"]["reconnecting"] && (app.Log.log("MJNetMgr reconnect count:" + i["reconnect_count"]), app["NetAgent"]["connect2MJ"](i.url, Laya["Handler"]["create"](i, i["_OnConnent"], null, !1), "local" == i["server_location"] ? "/game-gateway" : "/game-gateway-zone"));
                        }), this["reconnect_count"]++) : Laya["timer"].once(1000, this, this["_Reconnect"]);
                    },
                    i["prototype"]["_try_to_linknext"] = function () {
                        this["link_index"]++,
                            this.url = '',
                            app.Log.log("mj _try_to_linknext(" + this["link_index"] + ") url.length=" + this.urls["length"]),
                            this["link_index"] < 0 || this["link_index"] >= this.urls["length"] ? d["LobbyNetMgr"].Inst["polling_connect"] ? (this["lb_index"]++, this["_fetch_gateway"](0)) : (this["_setState"](d["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && d["Scene_MJ"].Inst["ForceOut"]()) : (app["NetAgent"]["connect2MJ"](this.urls[this["link_index"]].url, Laya["Handler"]["create"](this, this["_OnConnent"], null, !1), "local" == this["server_location"] ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this["link_index"]].url);
                    },
                    i["prototype"]["GetAuthData"] = function () {
                        return {
                            account_id: GameMgr.Inst["account_id"],
                            token: this["token"],
                            game_uuid: this["game_uuid"],
                            gift: CryptoJS["HmacSHA256"](this["token"] + GameMgr.Inst["account_id"] + this["game_uuid"], "damajiang")["toString"]()
                        };
                    },
                    i["prototype"]["_fetch_gateway"] = function (i) {
                        var m = this;
                        if (d["LobbyNetMgr"].Inst["polling_connect"] && this["lb_index"] >= d["LobbyNetMgr"].Inst.urls["length"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](58)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && d["Scene_MJ"].Inst["ForceOut"](), this["_setState"](d["EConnectState"].none), void 0;
                        this.urls = [],
                            this["link_index"] = -1,
                            app.Log.log("mj _fetch_gateway retry_count:" + i);
                        var s = function (s) {
                            var D = JSON["parse"](s);
                            if (app.Log.log("mj _fetch_gateway func_success data = " + s), D["maintenance"])
                                m["_setState"](d["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2009)), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && d["Scene_MJ"].Inst["ForceOut"]();
                            else if (D["servers"] && D["servers"]["length"] > 0) {
                                for (var j = D["servers"], L = d["Tools"]["deal_gateway"](j), O = 0; O < L["length"]; O++)
                                    m.urls.push({
                                        name: "___" + O,
                                        url: L[O]
                                    });
                                m["link_index"] = -1,
                                    m["_try_to_linknext"]();
                            } else
                                1 > i ? Laya["timer"].once(1000, m, function () {
                                    m["_fetch_gateway"](i + 1);
                                }) : d["LobbyNetMgr"].Inst["polling_connect"] ? (m["lb_index"]++, m["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](60)), m["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && d["Scene_MJ"].Inst["ForceOut"](), m["_setState"](d["EConnectState"].none));
                        },
                            D = function () {
                                app.Log.log("mj _fetch_gateway func_error"),
                                    1 > i ? Laya["timer"].once(500, m, function () {
                                        m["_fetch_gateway"](i + 1);
                                    }) : d["LobbyNetMgr"].Inst["polling_connect"] ? (m["lb_index"]++, m["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](58)), m["_SendDebugInfo"](), view["DesktopMgr"].Inst["active"] || d["Scene_MJ"].Inst["ForceOut"](), m["_setState"](d["EConnectState"].none));
                            },
                            j = function (d) {
                                var i = new Laya["HttpRequest"]();
                                i.once(Laya["Event"]["COMPLETE"], m, function (d) {
                                    s(d);
                                }),
                                    i.once(Laya["Event"]["ERROR"], m, function () {
                                        D();
                                    });
                                var j = [];
                                j.push("If-Modified-Since"),
                                    j.push('0'),
                                    d += "?service=ws-game-gateway",
                                    d += GameMgr["inHttps"] ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                    d += "&location=" + m["server_location"],
                                    d += "&rv=" + Math["floor"](10000000 * Math["random"]()) + Math["floor"](10000000 * Math["random"]()),
                                    i.send(d, '', "get", "text", j),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + d);
                            };
                        d["LobbyNetMgr"].Inst["polling_connect"] ? j(d["LobbyNetMgr"].Inst.urls[this["lb_index"]]) : j(d["LobbyNetMgr"].Inst["lb_url"]);
                    },
                    i["prototype"]["_setState"] = function (i) {
                        this["connect_state"] = i,
                            GameMgr["inRelease"] || null != uiscript["UI_Common"].Inst && (i == d["EConnectState"].none ? uiscript["UI_Common"].Inst["label_net_mj"].text = '' : i == d["EConnectState"]["tryconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "尝试连接麻将服务器", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#000000") : i == d["EConnectState"]["connecting"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正常", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#00ff00") : i == d["EConnectState"]["disconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：断开连接", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()) : i == d["EConnectState"]["reconnecting"] && (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正在重连", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()));
                    },
                    i["prototype"]["_ConnectSuccess"] = function () {
                        var i = this;
                        app.Log.log("MJNetMgr _ConnectSuccess "),
                            this["load_over"] = !1,
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authGame", this["GetAuthData"](), function (m, s) {
                                if (m || s["error"])
                                    uiscript["UIMgr"].Inst["showNetReqError"]("authGame", m, s), d["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                else {
                                    app.Log.log("麻将桌验证通过：" + JSON["stringify"](s)),
                                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        s['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(s),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 已成功发送牌局');
                                            }
                                        });
                                    }
                                    //END
                                    var D = [],
                                        j = 0;
                                    view["DesktopMgr"]["player_link_state"] = s["state_list"];
                                    var L = d["Tools"]["strOfLocalization"](2003),
                                        O = s["game_config"].mode,
                                        X = view["ERuleMode"]["Liqi4"];
                                    O.mode < 10 ? (X = view["ERuleMode"]["Liqi4"], i["real_player_count"] = 4) : O.mode < 20 && (X = view["ERuleMode"]["Liqi3"], i["real_player_count"] = 3);
                                    for (var Y = 0; Y < i["real_player_count"]; Y++)
                                        D.push(null);
                                    O["extendinfo"] && (L = d["Tools"]["strOfLocalization"](2004)),
                                        O["detail_rule"] && O["detail_rule"]["ai_level"] && (1 === O["detail_rule"]["ai_level"] && (L = d["Tools"]["strOfLocalization"](2003)), 2 === O["detail_rule"]["ai_level"] && (L = d["Tools"]["strOfLocalization"](2004)));
                                    for (var B = d["GameUtility"]["get_default_ai_skin"](), w = d["GameUtility"]["get_default_ai_character"](), Y = 0; Y < s["seat_list"]["length"]; Y++) {
                                        var N = s["seat_list"][Y];
                                        if (0 == N) {
                                            D[Y] = {
                                                nickname: L,
                                                avatar_id: B,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: w,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: B,
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
                                                    D[Y].avatar_id = skin.id;
                                                    D[Y].character.charid = skin.character_id;
                                                    D[Y].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                D[Y].nickname = '[BOT]' + D[Y].nickname;
                                            }
                                        }
                                        else {
                                            j++;
                                            for (var g = 0; g < s["players"]["length"]; g++)
                                                if (s["players"][g]["account_id"] == N) {
                                                    D[Y] = s["players"][g];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (D[Y].account_id == GameMgr.Inst.account_id) {
                                                        D[Y].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        D[Y].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        D[Y].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        D[Y].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        D[Y].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            D[Y].nickname = MMP.settings.nickname;
                                                        }
                                                    }
                                                    else if (MMP.settings.randomPlayerDefSkin && (D[Y].avatar_id == 400101 || D[Y].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            D[Y].avatar_id = skin.id;
                                                            D[Y].character.charid = skin.character_id;
                                                            D[Y].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(D[Y].account_id);
                                                        if (server == 1) {
                                                            D[Y].nickname = '[CN]' + D[Y].nickname;
                                                        } else if (server == 2) {
                                                            D[Y].nickname = '[JP]' + D[Y].nickname;
                                                        } else if (server == 3) {
                                                            D[Y].nickname = '[EN]' + D[Y].nickname;
                                                        } else {
                                                            D[Y].nickname = '[??]' + D[Y].nickname;
                                                        }
                                                    }
                                                    // END
                                                    //break;
                                                }
                                        }
                                    }
                                    for (var Y = 0; Y < i["real_player_count"]; Y++)
                                        null == D[Y] && (D[Y] = {
                                            account: 0,
                                            nickname: d["Tools"]["strOfLocalization"](2010),
                                            avatar_id: B,
                                            level: {
                                                id: "10101"
                                            },
                                            level3: {
                                                id: "20101"
                                            },
                                            character: {
                                                charid: w,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: B,
                                                is_upgraded: !1
                                            }
                                        });
                                    i["loaded_player_count"] = s["ready_id_list"]["length"],
                                        i["_AuthSuccess"](D, s["is_game_start"], s["game_config"]["toJSON"]());
                                }
                            });
                    },
                    i["prototype"]["_AuthSuccess"] = function (i, m, s) {
                        var D = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.2),
                                app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                    round_id: view["DesktopMgr"].Inst["round_id"],
                                    step: view["DesktopMgr"].Inst["current_step"]
                                }, function (i, m) {
                                    i || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", i, m), d["Scene_MJ"].Inst["ForceOut"]()) : (app.Log.log("[syncGame] " + JSON["stringify"](m)), m["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2011)), d["Scene_MJ"].Inst["GameEnd"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.3), view["DesktopMgr"].Inst["fetchLinks"](), view["DesktopMgr"].Inst["Reset"](), view["DesktopMgr"].Inst["duringReconnect"] = !0, view["DesktopMgr"].Inst["syncGameByStep"](m["game_restore"])));
                                });
                        })) : d["Scene_MJ"].Inst["openMJRoom"](s, i, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](s)), i, GameMgr.Inst["account_id"], view["EMJMode"].play, Laya["Handler"]["create"](D, function () {
                                m ? Laya["timer"]["frameOnce"](10, D, function () {
                                    app.Log.log("重连信息2 round_id:-1 step:" + 1000000),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (i, m) {
                                            app.Log.log("syncGame " + JSON["stringify"](m)),
                                                i || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", i, m), d["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), view["DesktopMgr"].Inst["fetchLinks"](), D["_PlayerReconnectSuccess"](m));
                                        });
                                }) : Laya["timer"]["frameOnce"](10, D, function () {
                                    app.Log.log("send enterGame"),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "enterGame", {}, function (i, m) {
                                            i || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("enterGame", i, m), d["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), app.Log.log("enterGame"), D["_EnterGame"](m), view["DesktopMgr"].Inst["fetchLinks"]());
                                        });
                                });
                            }));
                        }), Laya["Handler"]["create"](this, function (d) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.8 * d);
                        }, null, !1));
                    },
                    i["prototype"]["_EnterGame"] = function (i) {
                        app.Log.log("正常进入游戏: " + JSON["stringify"](i)),
                            i["is_end"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2011)), d["Scene_MJ"].Inst["GameEnd"]()) : i["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](i["game_restore"]) : (this["load_over"] = !0, this["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](this["loaded_player_count"], this["real_player_count"]), view["DesktopMgr"].Inst["duringReconnect"] = !1, view["DesktopMgr"].Inst["StartChainAction"](0));
                    },
                    i["prototype"]["_PlayerReconnectSuccess"] = function (i) {
                        app.Log.log("_PlayerReconnectSuccess data:" + JSON["stringify"](i)),
                            i["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2011)), d["Scene_MJ"].Inst["GameEnd"]()) : i["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](i["game_restore"]) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](d["Tools"]["strOfLocalization"](2012)), d["Scene_MJ"].Inst["ForceOut"]());
                    },
                    i["prototype"]["_SendDebugInfo"] = function () { },
                    i["prototype"]["OpenConnectObserve"] = function (i, m) {
                        var s = this;
                        this["is_ob"] = !0,
                            uiscript["UI_Loading"].Inst.show("enter_mj"),
                            this["Close"](),
                            view["AudioMgr"]["StopMusic"](),
                            Laya["timer"].once(500, this, function () {
                                s["server_location"] = m,
                                    s["ob_token"] = i,
                                    s["_setState"](d["EConnectState"]["tryconnect"]),
                                    s["lb_index"] = 0,
                                    s["_fetch_gateway"](0);
                            });
                    },
                    i["prototype"]["_ConnectSuccessOb"] = function () {
                        var i = this;
                        app.Log.log("MJNetMgr _ConnectSuccessOb "),
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authObserve", {
                                token: this["ob_token"]
                            }, function (m, s) {
                                m || s["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("authObserve", m, s), d["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]()) : (app.Log.log("实时OB验证通过：" + JSON["stringify"](s)), uiscript["UI_Loading"].Inst["setProgressVal"](0.3), uiscript["UI_Live_Broadcast"].Inst && uiscript["UI_Live_Broadcast"].Inst["clearPendingUnits"](), app["NetAgent"]["sendReq2MJ"]("FastTest", "startObserve", {}, function (m, s) {
                                    if (m || s["error"])
                                        uiscript["UIMgr"].Inst["showNetReqError"]("startObserve", m, s), d["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                    else {
                                        var D = s.head,
                                            j = D["game_config"].mode,
                                            L = [],
                                            O = d["Tools"]["strOfLocalization"](2003),
                                            X = view["ERuleMode"]["Liqi4"];
                                        j.mode < 10 ? (X = view["ERuleMode"]["Liqi4"], i["real_player_count"] = 4) : j.mode < 20 && (X = view["ERuleMode"]["Liqi3"], i["real_player_count"] = 3);
                                        for (var Y = 0; Y < i["real_player_count"]; Y++)
                                            L.push(null);
                                        j["extendinfo"] && (O = d["Tools"]["strOfLocalization"](2004)),
                                            j["detail_rule"] && j["detail_rule"]["ai_level"] && (1 === j["detail_rule"]["ai_level"] && (O = d["Tools"]["strOfLocalization"](2003)), 2 === j["detail_rule"]["ai_level"] && (O = d["Tools"]["strOfLocalization"](2004)));
                                        for (var B = d["GameUtility"]["get_default_ai_skin"](), w = d["GameUtility"]["get_default_ai_character"](), Y = 0; Y < D["seat_list"]["length"]; Y++) {
                                            var N = D["seat_list"][Y];
                                            if (0 == N)
                                                L[Y] = {
                                                    nickname: O,
                                                    avatar_id: B,
                                                    level: {
                                                        id: "10101"
                                                    },
                                                    level3: {
                                                        id: "20101"
                                                    },
                                                    character: {
                                                        charid: w,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: B,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var g = 0; g < D["players"]["length"]; g++)
                                                    if (D["players"][g]["account_id"] == N) {
                                                        L[Y] = D["players"][g];
                                                        break;
                                                    }
                                        }
                                        for (var Y = 0; Y < i["real_player_count"]; Y++)
                                            null == L[Y] && (L[Y] = {
                                                account: 0,
                                                nickname: d["Tools"]["strOfLocalization"](2010),
                                                avatar_id: B,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: w,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: B,
                                                    is_upgraded: !1
                                                }
                                            });
                                        i["_StartObSuccuess"](L, s["passed"], D["game_config"]["toJSON"](), D["start_time"]);
                                    }
                                }));
                            });
                    },
                    i["prototype"]["_StartObSuccuess"] = function (i, m, s, D) {
                        var j = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](D, m);
                        })) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.4), d["Scene_MJ"].Inst["openMJRoom"](s, i, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](s)), i, GameMgr.Inst["account_id"], view["EMJMode"]["live_broadcast"], Laya["Handler"]["create"](j, function () {
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.9),
                                    Laya["timer"].once(1000, j, function () {
                                        GameMgr.Inst["EnterMJ"](),
                                            uiscript["UI_Loading"].Inst["setProgressVal"](0.95),
                                            uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](D, m);
                                    });
                            }));
                        }), Laya["Handler"]["create"](this, function (d) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.4 + 0.4 * d);
                        }, null, !1)));
                    },
                    i["_Inst"] = null,
                    i;
            }
                ();
            d["MJNetMgr"] = i;
        }
            (game || (game = {}));



        // 读取战绩
        !function (d) {
            var i = function (i) {
                function m() {
                    var d = i.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["both_ui"]["otherplayerinfoUI"]() : new ui["both_ui"]["otherplayerinfo_enUI"]()) || this;
                    return d["account_id"] = 0,
                        d["origin_x"] = 0,
                        d["origin_y"] = 0,
                        d.root = null,
                        d["title"] = null,
                        d["level"] = null,
                        d["btn_addfriend"] = null,
                        d["btn_report"] = null,
                        d["illust"] = null,
                        d.name = null,
                        d["detail_data"] = null,
                        d["achievement_data"] = null,
                        d["locking"] = !1,
                        d["tab_info4"] = null,
                        d["tab_info3"] = null,
                        d["tab_note"] = null,
                        d["tab_img_dark"] = '',
                        d["tab_img_chosen"] = '',
                        d["player_data"] = null,
                        d["tab_index"] = 1,
                        d["game_category"] = 1,
                        d["game_type"] = 1,
                        m.Inst = d,
                        d;
                }
                return __extends(m, i),
                    m["prototype"]["onCreate"] = function () {
                        var i = this;
                        "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_dark.png")) : (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_dark.png")),
                            this.root = this.me["getChildByName"]("root"),
                            this["origin_x"] = this.root.x,
                            this["origin_y"] = this.root.y,
                            this["container_info"] = this.root["getChildByName"]("container_info"),
                            this["title"] = new d["UI_PlayerTitle"](this["container_info"]["getChildByName"]("title"), "UI_OtherPlayerInfo"),
                            this.name = this["container_info"]["getChildByName"]("name"),
                            this["level"] = new d["UI_Level"](this["container_info"]["getChildByName"]("rank"), "UI_OtherPlayerInfo"),
                            this["detail_data"] = new d["UI_PlayerData"](this["container_info"]["getChildByName"]("data")),
                            this["achievement_data"] = new d["UI_Achievement_Light"](this["container_info"]["getChildByName"]("achievement")),
                            this["illust"] = new d["UI_Character_Skin"](this.root["getChildByName"]("illust")["getChildByName"]("illust")),
                            this["btn_addfriend"] = this["container_info"]["getChildByName"]("btn_add"),
                            this["btn_addfriend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["btn_addfriend"]["visible"] = !1,
                                    i["btn_report"].x = 343,
                                    app["NetAgent"]["sendReq2Lobby"]("Lobby", "applyFriend", {
                                        target_id: i["account_id"]
                                    }, function () { });
                            }, null, !1),
                            this["btn_report"] = this["container_info"]["getChildByName"]("btn_report"),
                            this["btn_report"]["clickHandler"] = new Laya["Handler"](this, function () {
                                d["UI_Report_Nickname"].Inst.show(i["account_id"]);
                            }),
                            this.me["getChildAt"](0)["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || i["close"]();
                            }, null, !1),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["close"]();
                            }, null, !1),
                            this.note = new d["UI_PlayerNote"](this.root["getChildByName"]("container_note"), null),
                            this["tab_info4"] = this.root["getChildByName"]("tab_info4"),
                            this["tab_info4"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || 1 != i["tab_index"] && i["changeMJCategory"](1);
                            }, null, !1),
                            this["tab_info3"] = this.root["getChildByName"]("tab_info3"),
                            this["tab_info3"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || 2 != i["tab_index"] && i["changeMJCategory"](2);
                            }, null, !1),
                            this["tab_note"] = this.root["getChildByName"]("tab_note"),
                            this["tab_note"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"] && (game["Tools"]["during_chat_close"]() ? d["UIMgr"].Inst["ShowErrorInfo"]("功能维护中，祝大家新年快乐") : i["container_info"]["visible"] && (i["container_info"]["visible"] = !1, i["tab_info4"].skin = i["tab_img_dark"], i["tab_info3"].skin = i["tab_img_dark"], i["tab_note"].skin = i["tab_img_chosen"], i["tab_index"] = 3, i.note.show()));
                            }, null, !1),
                            this["locking"] = !1;
                    },
                    m["prototype"].show = function (i, m, s, D) {
                        var j = this;
                        void 0 === m && (m = 1),
                            void 0 === s && (s = 2),
                            void 0 === D && (D = 1),
                            GameMgr.Inst["BehavioralStatistics"](14),
                            this["account_id"] = i,
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this.root.y = this["origin_y"],
                            this["player_data"] = null,
                            d["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                j["locking"] = !1;
                            })),
                            this["detail_data"]["reset"](),
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountStatisticInfo", {
                                account_id: i
                            }, function (m, s) {
                                m || s["error"] ? d["UIMgr"].Inst["showNetReqError"]("fetchAccountStatisticInfo", m, s) : d["UI_Shilian"]["now_season_info"] && 1001 == d["UI_Shilian"]["now_season_info"]["season_id"] && 3 != d["UI_Shilian"]["get_cur_season_state"]() ? (j["detail_data"]["setData"](s), j["changeMJCategory"](j["tab_index"], j["game_category"], j["game_type"])) : app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountChallengeRankInfo", {
                                    account_id: i
                                }, function (i, m) {
                                    i || m["error"] ? d["UIMgr"].Inst["showNetReqError"]("fetchAccountChallengeRankInfo", i, m) : (s["season_info"] = m["season_info"], j["detail_data"]["setData"](s), j["changeMJCategory"](j["tab_index"], j["game_category"], j["game_type"]));
                                });
                            }),
                            this.note["init_data"](i),
                            this["refreshBaseInfo"](),
                            this["btn_report"]["visible"] = i != GameMgr.Inst["account_id"],
                            this["tab_index"] = m,
                            this["game_category"] = s,
                            this["game_type"] = D,
                            this["container_info"]["visible"] = !0,
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["tab_note"]["visible"] = "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"],
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    m["prototype"]["refreshBaseInfo"] = function () {
                        var i = this;
                        this["title"].id = 0,
                            this["illust"].me["visible"] = !1,
                            game["Tools"]["SetNickname"](this.name, {
                                account_id: 0,
                                nickname: '',
                                verified: 0
                            }),
                            this["btn_addfriend"]["visible"] = !1,
                            this["btn_report"].x = 343,
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountInfo", {
                                account_id: this["account_id"]
                            }, function (m, s) {
                                if (m || s["error"])
                                    d["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", m, s);
                                else {
                                    var D = s["account"];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (D.account_id == GameMgr.Inst.account_id) {
                                        D.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            D.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            D.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    i["player_data"] = D,
                                        game["Tools"]["SetNickname"](i.name, D),
                                        i["title"].id = game["Tools"]["titleLocalization"](D["account_id"], D["title"]),
                                        i["level"].id = D["level"].id,
                                        i["level"].id = i["player_data"][1 == i["tab_index"] ? "level" : "level3"].id,
                                        i["level"].exp = i["player_data"][1 == i["tab_index"] ? "level" : "level3"]["score"],
                                        i["illust"].me["visible"] = !0,
                                        i["account_id"] == GameMgr.Inst["account_id"] ? i["illust"]["setSkin"](D["avatar_id"], "waitingroom") : i["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](D["avatar_id"]), "waitingroom"),
                                        game["Tools"]["is_same_zone"](GameMgr.Inst["account_id"], i["account_id"]) && i["account_id"] != GameMgr.Inst["account_id"] && null == game["FriendMgr"].find(i["account_id"]) ? (i["btn_addfriend"]["visible"] = !0, i["btn_report"].x = 520) : (i["btn_addfriend"]["visible"] = !1, i["btn_report"].x = 343),
                                        i.note.sign["setSign"](D["signature"]),
                                        i["achievement_data"].show(!1, D["achievement_count"]);
                                }
                            });
                    },
                    m["prototype"]["changeMJCategory"] = function (d, i, m) {
                        void 0 === i && (i = 2),
                            void 0 === m && (m = 1),
                            this["tab_index"] = d,
                            this["container_info"]["visible"] = !0,
                            this["detail_data"]["changeMJCategory"](d, i, m),
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    m["prototype"]["close"] = function () {
                        var i = this;
                        this["enable"] && (this["locking"] || (this["locking"] = !0, this["detail_data"]["close"](), d["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                            i["locking"] = !1,
                                i["enable"] = !1;
                        }))));
                    },
                    m["prototype"]["onEnable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !0);
                    },
                    m["prototype"]["onDisable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !1),
                            this["detail_data"]["close"](),
                            this["illust"]["clear"](),
                            Laya["loader"]["clearTextureRes"](this["level"].icon.skin);
                    },
                    m.Inst = null,
                    m;
            }
                (d["UIBase"]);
            d["UI_OtherPlayerInfo"] = i;
        }
            (uiscript || (uiscript = {}));



        // 宿舍相关
        !function (d) {
            var i = function () {
                function i(i, s) {
                    var D = this;
                    this["_scale"] = 1,
                        this["during_move"] = !1,
                        this["mouse_start_x"] = 0,
                        this["mouse_start_y"] = 0,
                        this.me = i,
                        this["container_illust"] = s,
                        this["illust"] = this["container_illust"]["getChildByName"]("illust"),
                        this["container_move"] = i["getChildByName"]("move"),
                        this["container_move"].on("mousedown", this, function () {
                            D["during_move"] = !0,
                                D["mouse_start_x"] = D["container_move"]["mouseX"],
                                D["mouse_start_y"] = D["container_move"]["mouseY"];
                        }),
                        this["container_move"].on("mousemove", this, function () {
                            D["during_move"] && (D.move(D["container_move"]["mouseX"] - D["mouse_start_x"], D["container_move"]["mouseY"] - D["mouse_start_y"]), D["mouse_start_x"] = D["container_move"]["mouseX"], D["mouse_start_y"] = D["container_move"]["mouseY"]);
                        }),
                        this["container_move"].on("mouseup", this, function () {
                            D["during_move"] = !1;
                        }),
                        this["container_move"].on("mouseout", this, function () {
                            D["during_move"] = !1;
                        }),
                        this["btn_big"] = i["getChildByName"]("btn_big"),
                        this["btn_big"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            D["locking"] || D["bigger"]();
                        }, null, !1),
                        this["btn_small"] = i["getChildByName"]("btn_small"),
                        this["btn_small"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            D["locking"] || D["smaller"]();
                        }, null, !1),
                        this["btn_close"] = i["getChildByName"]("btn_close"),
                        this["btn_close"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            D["locking"] || D["close"]();
                        }, null, !1),
                        this["scrollbar"] = i["getChildByName"]("scrollbar")["scriptMap"]["capsui.CScrollBar"],
                        this["scrollbar"].init(new Laya["Handler"](this, function (d) {
                            D["_scale"] = 1 * (1 - d) + 0.5,
                                D["illust"]["scaleX"] = D["_scale"],
                                D["illust"]["scaleY"] = D["_scale"],
                                D["scrollbar"]["setVal"](d, 0);
                        })),
                        this["dongtai_kaiguan"] = new d["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            m.Inst["illust"]["resetSkin"]();
                        }), new Laya["Handler"](this, function (d) {
                            m.Inst["illust"]["playAnim"](d);
                        }));
                }
                return Object["defineProperty"](i["prototype"], "scale", {
                    get: function () {
                        return this["_scale"];
                    },
                    set: function (d) {
                        this["_scale"] = d,
                            this["scrollbar"]["setVal"](1 - (d - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    i["prototype"].show = function (i) {
                        var s = this;
                        this["locking"] = !0,
                            this["when_close"] = i,
                            this["illust_start_x"] = this["illust"].x,
                            this["illust_start_y"] = this["illust"].y,
                            this["illust_center_x"] = this["illust"].x + 984 - 446,
                            this["illust_center_y"] = this["illust"].y + 11 - 84,
                            this["container_illust"]["getChildByName"]("container_name")["visible"] = !1,
                            this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !1,
                            this["container_illust"]["getChildByName"]("btn")["visible"] = !1,
                            m.Inst["stopsay"](),
                            this["scale"] = 1,
                            Laya["Tween"].to(this["illust"], {
                                x: this["illust_center_x"],
                                y: this["illust_center_y"]
                            }, 200),
                            d["UIBase"]["anim_pop_out"](this["btn_big"], null),
                            d["UIBase"]["anim_pop_out"](this["btn_small"], null),
                            d["UIBase"]["anim_pop_out"](this["btn_close"], null),
                            this["during_move"] = !1,
                            Laya["timer"].once(250, this, function () {
                                s["locking"] = !1;
                            }),
                            this.me["visible"] = !0,
                            this["dongtai_kaiguan"]["refresh"](m.Inst["illust"]["skin_id"]);
                    },
                    i["prototype"]["close"] = function () {
                        var i = this;
                        this["locking"] = !0,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? this["container_illust"]["getChildByName"]("container_name")["visible"] = !0 : this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !0,
                            this["container_illust"]["getChildByName"]("btn")["visible"] = !0,
                            Laya["Tween"].to(this["illust"], {
                                x: this["illust_start_x"],
                                y: this["illust_start_y"],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            d["UIBase"]["anim_pop_hide"](this["btn_big"], null),
                            d["UIBase"]["anim_pop_hide"](this["btn_small"], null),
                            d["UIBase"]["anim_pop_hide"](this["btn_close"], null),
                            Laya["timer"].once(250, this, function () {
                                i["locking"] = !1,
                                    i.me["visible"] = !1,
                                    i["when_close"].run();
                            });
                    },
                    i["prototype"]["bigger"] = function () {
                        1.1 * this["scale"] > 1.5 ? this["scale"] = 1.5 : this["scale"] *= 1.1,
                            Laya["Tween"].to(this["illust"], {
                                scaleX: this["scale"],
                                scaleY: this["scale"]
                            }, 100, null, null, 0, !0, !0);
                    },
                    i["prototype"]["smaller"] = function () {
                        this["scale"] / 1.1 < 0.5 ? this["scale"] = 0.5 : this["scale"] /= 1.1,
                            Laya["Tween"].to(this["illust"], {
                                scaleX: this["scale"],
                                scaleY: this["scale"]
                            }, 100, null, null, 0, !0, !0);
                    },
                    i["prototype"].move = function (d, i) {
                        var m = this["illust"].x + d,
                            s = this["illust"].y + i;
                        m < this["illust_center_x"] - 600 ? m = this["illust_center_x"] - 600 : m > this["illust_center_x"] + 600 && (m = this["illust_center_x"] + 600),
                            s < this["illust_center_y"] - 1200 ? s = this["illust_center_y"] - 1200 : s > this["illust_center_y"] + 800 && (s = this["illust_center_y"] + 800),
                            this["illust"].x = m,
                            this["illust"].y = s;
                    },
                    i;
            }
                (),
                m = function (m) {
                    function s() {
                        var d = m.call(this, new ui["lobby"]["susheUI"]()) || this;
                        return d["contianer_illust"] = null,
                            d["illust"] = null,
                            d["illust_rect"] = null,
                            d["container_name"] = null,
                            d["label_name"] = null,
                            d["label_cv"] = null,
                            d["label_cv_title"] = null,
                            d["container_page"] = null,
                            d["container_look_illust"] = null,
                            d["page_select_character"] = null,
                            d["page_visit_character"] = null,
                            d["origin_illust_x"] = 0,
                            d["chat_id"] = 0,
                            d["container_chat"] = null,
                            d["_select_index"] = 0,
                            d["sound_channel"] = null,
                            d["chat_block"] = null,
                            d["illust_showing"] = !0,
                            s.Inst = d,
                            d;
                    }
                    return __extends(s, m),
                        s.init = function (i) {
                            var m = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCharacterInfo", {}, function (D, j) {
                                if (D || j["error"])
                                    d["UIMgr"].Inst["showNetReqError"]("fetchCharacterInfo", D, j);
                                else {
                                    if (app.Log.log("fetchCharacterInfo: " + JSON["stringify"](j)), j = JSON["parse"](JSON["stringify"](j)), j["main_character_id"] && j["characters"]) {
                                        //  if (m["characters"] = [], j["characters"])
                                        //      for (var L = 0; L < j["characters"]["length"]; L++)
                                        //          m["characters"].push(j["characters"][L]);
                                        //  if (m["skin_map"] = {}, j["skins"])
                                        //      for (var L = 0; L < j["skins"]["length"]; L++)
                                        //          m["skin_map"][j["skins"][L]] = 1;
                                        //  m["main_character_id"] = j["main_character_id"];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        m.characters = [];
                                        for (var j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                            var id = 200000 + j;
                                            var skin = 400001 + j * 100;
                                            m.characters.push({
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
                                        m.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        // END
                                    } else
                                        m["characters"] = [], m["characters"].push({
                                            charid: "200001",
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: "400101",
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), m["characters"].push({
                                            charid: "200002",
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: "400201",
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), m["skin_map"]["400101"] = 1, m["skin_map"]["400201"] = 1, m["main_character_id"] = "200001";
                                    if (m["send_gift_count"] = 0, m["send_gift_limit"] = 0, j["send_gift_count"] && (m["send_gift_count"] = j["send_gift_count"]), j["send_gift_limit"] && (m["send_gift_limit"] = j["send_gift_limit"]), j["finished_endings"])
                                        for (var L = 0; L < j["finished_endings"]["length"]; L++)
                                            m["finished_endings_map"][j["finished_endings"][L]] = 1;
                                    if (j["rewarded_endings"])
                                        for (var L = 0; L < j["rewarded_endings"]["length"]; L++)
                                            m["rewarded_endings_map"][j["rewarded_endings"][L]] = 1;
                                    if (m["star_chars"] = [], j["character_sort"] && (m["star_chars"] = j["character_sort"]), s["hidden_characters_map"] = {}, j["hidden_characters"])
                                        for (var O = 0, X = j["hidden_characters"]; O < X["length"]; O++) {
                                            var Y = X[O];
                                            s["hidden_characters_map"][Y] = 1;
                                        }
                                    i.run();
                                }
                            }),
                                //app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAllCommonViews", {}, function (i, s) {
                                //    if (i || s["error"])
                                //        d["UIMgr"].Inst["showNetReqError"]("fetchAllCommonViews", i, s);
                                //    else {
                                //        m["using_commonview_index"] = s.use,
                                m["commonViewList"] = [[], [], [], [], [], [], [], []];
                            //        var D = s["views"];
                            //        if (D)
                            //            for (var j = 0; j < D["length"]; j++) {
                            //                var L = D[j]["values"];
                            //                L && (m["commonViewList"][D[j]["index"]] = L);
                            //            }
                            m.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst["load_mjp_view"](),
                                GameMgr.Inst["load_touming_mjp_view"]();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //});
                        },
                        s["on_data_updata"] = function (i) {
                            if (i["character"]) {
                                var m = JSON["parse"](JSON["stringify"](i["character"]));
                                if (m["characters"])
                                    for (var s = m["characters"], D = 0; D < s["length"]; D++) {
                                        for (var j = !1, L = 0; L < this["characters"]["length"]; L++)
                                            if (this["characters"][L]["charid"] == s[D]["charid"]) {
                                                this["characters"][L] = s[D],
                                                    d["UI_Sushe_Visit"].Inst && d["UI_Sushe_Visit"].Inst["chara_info"] && d["UI_Sushe_Visit"].Inst["chara_info"]["charid"] == this["characters"][L]["charid"] && (d["UI_Sushe_Visit"].Inst["chara_info"] = this["characters"][L]),
                                                    j = !0;
                                                break;
                                            }
                                        j || this["characters"].push(s[D]);
                                    }
                                if (m["skins"]) {
                                    for (var O = m["skins"], D = 0; D < O["length"]; D++)
                                        this["skin_map"][O[D]] = 1;
                                    d["UI_Bag"].Inst["on_skin_change"]();
                                }
                                if (m["finished_endings"]) {
                                    for (var X = m["finished_endings"], D = 0; D < X["length"]; D++)
                                        this["finished_endings_map"][X[D]] = 1;
                                    d["UI_Sushe_Visit"].Inst;
                                }
                                if (m["rewarded_endings"]) {
                                    for (var X = m["rewarded_endings"], D = 0; D < X["length"]; D++)
                                        this["rewarded_endings_map"][X[D]] = 1;
                                    d["UI_Sushe_Visit"].Inst;
                                }
                            }
                        },
                        s["chara_owned"] = function (d) {
                            for (var i = 0; i < this["characters"]["length"]; i++)
                                if (this["characters"][i]["charid"] == d)
                                    return !0;
                            return !1;
                        },
                        s["skin_owned"] = function (d) {
                            return this["skin_map"]["hasOwnProperty"](d["toString"]());
                        },
                        s["add_skin"] = function (d) {
                            this["skin_map"][d] = 1;
                        },
                        Object["defineProperty"](s, "main_chara_info", {
                            get: function () {
                                for (var d = 0; d < this["characters"]["length"]; d++)
                                    if (this["characters"][d]["charid"] == this["main_character_id"])
                                        return this["characters"][d];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        s["on_view_remove"] = function (d) {
                            for (var i = 0; i < this["commonViewList"]["length"]; i++)
                                for (var m = this["commonViewList"][i], s = 0; s < m["length"]; s++)
                                    if (m[s]["item_id"] == d) {
                                        m[s]["item_id"] = game["GameUtility"]["get_view_default_item_id"](m[s].slot);
                                        break;
                                    }
                            var D = cfg["item_definition"].item.get(d);
                            D.type == game["EView"]["head_frame"] && GameMgr.Inst["account_data"]["avatar_frame"] == d && (GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["head_frame"]));
                        },
                        s["add_finish_ending"] = function (d) {
                            this["finished_endings_map"][d] = 1;
                        },
                        s["add_reward_ending"] = function (d) {
                            this["rewarded_endings_map"][d] = 1;
                        },
                        s["check_all_char_repoint"] = function () {
                            for (var d = 0; d < s["characters"]["length"]; d++)
                                if (this["check_char_redpoint"](s["characters"][d]))
                                    return !0;
                            return !1;
                        },
                        s["check_char_redpoint"] = function (d) {
                            // 去除小红点
                            // if (s["hidden_characters_map"][d["charid"]])
                            return 0;
                            //END
                            var i = cfg.spot.spot["getGroup"](d["charid"]);
                            if (i)
                                for (var m = 0; m < i["length"]; m++) {
                                    var D = i[m];
                                    if (!(D["is_married"] && !d["is_upgraded"] || !D["is_married"] && d["level"] < D["level_limit"]) && 2 == D.type) {
                                        for (var j = !0, L = 0; L < D["jieju"]["length"]; L++)
                                            if (D["jieju"][L] && s["finished_endings_map"][D["jieju"][L]]) {
                                                if (!s["rewarded_endings_map"][D["jieju"][L]])
                                                    return !0;
                                                j = !1;
                                            }
                                        if (j)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        s["is_char_star"] = function (d) {
                            return -1 != this["star_chars"]["indexOf"](d);
                        },
                        s["change_char_star"] = function (d) {
                            var i = this["star_chars"]["indexOf"](d);
                            -1 != i ? this["star_chars"]["splice"](i, 1) : this["star_chars"].push(d)
                            // 屏蔽网络请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "updateCharacterSort", {
                            //     sort: this["star_chars"]
                            // }, function () {});
                            // END
                        },
                        Object["defineProperty"](s["prototype"], "select_index", {
                            get: function () {
                                return this["_select_index"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        s["prototype"]["reset_select_index"] = function () {
                            this["_select_index"] = -1;
                        },
                        s["prototype"]["onCreate"] = function () {
                            var m = this;
                            this["contianer_illust"] = this.me["getChildByName"]("illust"),
                                this["illust"] = new d["UI_Character_Skin"](this["contianer_illust"]["getChildByName"]("illust")["getChildByName"]("illust")),
                                this["illust_rect"] = d["UIRect"]["CreateFromSprite"](this["illust"].me),
                                this["container_chat"] = this["contianer_illust"]["getChildByName"]("chat"),
                                this["chat_block"] = new d["UI_Character_Chat"](this["container_chat"]),
                                this["contianer_illust"]["getChildByName"]("btn")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (!m["page_visit_character"].me["visible"] || !m["page_visit_character"]["cannot_click_say"])
                                        if (m["illust"]["onClick"](), m["sound_channel"])
                                            m["stopsay"]();
                                        else {
                                            if (!m["illust_showing"])
                                                return;
                                            m.say("lobby_normal");
                                        }
                                }, null, !1),
                                this["container_name"] = null,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name"), this["contianer_illust"]["getChildByName"]("container_name_en")["visible"] = !1, this["label_cv_title"] = this["container_name"]["getChildByName"]("label_CV_title")) : (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name_en"), this["contianer_illust"]["getChildByName"]("container_name")["visible"] = !1),
                                this["label_name"] = this["container_name"]["getChildByName"]("label_name"),
                                this["label_cv"] = this["container_name"]["getChildByName"]("label_CV"),
                                this["origin_illust_x"] = this["contianer_illust"].x,
                                this["container_page"] = this.me["getChildByName"]("container_page"),
                                this["page_select_character"] = new d["UI_Sushe_Select"](),
                                this["container_page"]["addChild"](this["page_select_character"].me),
                                this["page_visit_character"] = new d["UI_Sushe_Visit"](),
                                this["container_page"]["addChild"](this["page_visit_character"].me),
                                this["container_look_illust"] = new i(this.me["getChildByName"]("look_illust"), this["contianer_illust"]);
                        },
                        s["prototype"].show = function (d) {
                            GameMgr.Inst["BehavioralStatistics"](15),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["page_visit_character"].me["visible"] = !1,
                                this["container_look_illust"].me["visible"] = !1;
                            for (var i = 0, m = 0; m < s["characters"]["length"]; m++)
                                if (s["characters"][m]["charid"] == s["main_character_id"]) {
                                    i = m;
                                    break;
                                }
                            0 == d ? (this["change_select"](i), this["show_page_select"]()) : (this["_select_index"] = -1, this["illust_showing"] = !1, this["contianer_illust"]["visible"] = !1, this["page_select_character"].show(1));
                        },
                        s["prototype"]["starup_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"]["star_up_back"](s["characters"][this["_select_index"]]),
                                this["page_visit_character"]["show_levelup"]();
                        },
                        s["prototype"]["spot_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"].show(s["characters"][this["_select_index"]], 2);
                        },
                        s["prototype"]["go2Lobby"] = function () {
                            this["close"](Laya["Handler"]["create"](this, function () {
                                d["UIMgr"].Inst["showLobby"]();
                            }));
                        },
                        s["prototype"]["close"] = function (i) {
                            var m = this;
                            this["illust_showing"] && d["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 150, 0),
                                Laya["timer"].once(150, this, function () {
                                    m["enable"] = !1,
                                        i && i.run();
                                });
                        },
                        s["prototype"]["onDisable"] = function () {
                            view["AudioMgr"]["refresh_music_volume"](!1),
                                this["illust"]["clear"](),
                                this["stopsay"](),
                                this["container_look_illust"].me["visible"] && this["container_look_illust"]["close"]();
                        },
                        s["prototype"]["hide_illust"] = function () {
                            var i = this;
                            this["illust_showing"] && (this["illust_showing"] = !1, d["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 200, 0, Laya["Handler"]["create"](this, function () {
                                i["contianer_illust"]["visible"] = !1;
                            })));
                        },
                        s["prototype"]["open_illust"] = function () {
                            if (!this["illust_showing"])
                                if (this["illust_showing"] = !0, this["_select_index"] >= 0)
                                    this["contianer_illust"]["visible"] = !0, this["contianer_illust"]["alpha"] = 1, d["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var i = 0, m = 0; m < s["characters"]["length"]; m++)
                                        if (s["characters"][m]["charid"] == s["main_character_id"]) {
                                            i = m;
                                            break;
                                        }
                                    this["change_select"](i);
                                }
                        },
                        s["prototype"]["show_page_select"] = function () {
                            this["page_select_character"].show(0);
                        },
                        s["prototype"]["show_page_visit"] = function (d) {
                            void 0 === d && (d = 0),
                                this["page_visit_character"].show(s["characters"][this["_select_index"]], d);
                        },
                        s["prototype"]["change_select"] = function (i) {
                            this["_select_index"] = i,
                                this["illust"]["clear"](),
                                this["illust_showing"] = !0;
                            var m = s["characters"][i];
                            this["label_name"].text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].get(m["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].get(m["charid"])["name_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_name"].font = -1 != s["chs_fengyu_name_lst"]["indexOf"](m["charid"]) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["label_cv"].text = cfg["item_definition"]["character"].get(m["charid"])["desc_cv_" + GameMgr["client_language"]], this["label_cv_title"].text = 'CV') : this["label_cv"].text = "CV:" + cfg["item_definition"]["character"].get(m["charid"])["desc_cv_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_cv"].font = -1 != s["chs_fengyu_cv_lst"]["indexOf"](m["charid"]) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && (this["label_cv_title"].y = 355 - this["label_cv"]["textField"]["textHeight"] / 2 * 0.7);
                            var D = new d["UIRect"]();
                            D.x = this["illust_rect"].x,
                                D.y = this["illust_rect"].y,
                                D["width"] = this["illust_rect"]["width"],
                                D["height"] = this["illust_rect"]["height"],
                                "405503" == m.skin ? D.y -= 70 : "403303" == m.skin && (D.y += 117),
                                this["illust"]["setRect"](D),
                                this["illust"]["setSkin"](m.skin, "full"),
                                this["contianer_illust"]["visible"] = !0,
                                Laya["Tween"]["clearAll"](this["contianer_illust"]),
                                this["contianer_illust"].x = this["origin_illust_x"],
                                this["contianer_illust"]["alpha"] = 1,
                                d["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                    x: -30
                                }, 230),
                                this["stopsay"]();
                            var j = cfg["item_definition"].skin.get(m.skin);
                            j["spine_type"] ? (this["page_select_character"]["changeKaiguanShow"](!0), this["container_look_illust"]["dongtai_kaiguan"].show(this["illust"]["skin_id"])) : (this["page_select_character"]["changeKaiguanShow"](!1), this["container_look_illust"]["dongtai_kaiguan"].hide());
                        },
                        s["prototype"]["onChangeSkin"] = function (d) {
                            s["characters"][this["_select_index"]].skin = d,
                                this["change_select"](this["_select_index"]),
                                s["characters"][this["_select_index"]]["charid"] == s["main_character_id"] && (GameMgr.Inst["account_data"]["avatar_id"] = d)
                            // 屏蔽换肤请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                            //     character_id: s["characters"][this["_select_index"]]["charid"],
                            //     skin: d
                            // }, function () {});
                            // 保存皮肤
                        },
                        s["prototype"].say = function (d) {
                            var i = this,
                                m = s["characters"][this["_select_index"]];
                            this["chat_id"]++;
                            var D = this["chat_id"],
                                j = view["AudioMgr"]["PlayCharactorSound"](m, d, Laya["Handler"]["create"](this, function () {
                                    Laya["timer"].once(1000, i, function () {
                                        D == i["chat_id"] && i["stopsay"]();
                                    });
                                }));
                            j && (this["chat_block"].show(j["words"]), this["sound_channel"] = j["sound"]);
                        },
                        s["prototype"]["stopsay"] = function () {
                            this["chat_block"]["close"](!1),
                                this["sound_channel"] && (this["sound_channel"].stop(), Laya["SoundManager"]["removeChannel"](this["sound_channel"]), this["sound_channel"] = null);
                        },
                        s["prototype"]["to_look_illust"] = function () {
                            var d = this;
                            this["container_look_illust"].show(Laya["Handler"]["create"](this, function () {
                                d["illust"]["playAnim"]("idle"),
                                    d["page_select_character"].show(0);
                            }));
                        },
                        s["prototype"]["jump_to_char_skin"] = function (i, m) {
                            var D = this;
                            if (void 0 === i && (i = -1), void 0 === m && (m = null), i >= 0)
                                for (var j = 0; j < s["characters"]["length"]; j++)
                                    if (s["characters"][j]["charid"] == i) {
                                        this["change_select"](j);
                                        break;
                                    }
                            d["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                s.Inst["show_page_visit"](),
                                    D["page_visit_character"]["show_pop_skin"](),
                                    D["page_visit_character"]["set_jump_callback"](m);
                            }));
                        },
                        s["prototype"]["jump_to_char_qiyue"] = function (i) {
                            var m = this;
                            if (void 0 === i && (i = -1), i >= 0)
                                for (var D = 0; D < s["characters"]["length"]; D++)
                                    if (s["characters"][D]["charid"] == i) {
                                        this["change_select"](D);
                                        break;
                                    }
                            d["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                s.Inst["show_page_visit"](),
                                    m["page_visit_character"]["show_qiyue"]();
                            }));
                        },
                        s["prototype"]["jump_to_char_gift"] = function (i) {
                            var m = this;
                            if (void 0 === i && (i = -1), i >= 0)
                                for (var D = 0; D < s["characters"]["length"]; D++)
                                    if (s["characters"][D]["charid"] == i) {
                                        this["change_select"](D);
                                        break;
                                    }
                            d["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                s.Inst["show_page_visit"](),
                                    m["page_visit_character"]["show_gift"]();
                            }));
                        },
                        s["characters"] = [],
                        s["chs_fengyu_name_lst"] = ["200040", "200043"],
                        s["chs_fengyu_cv_lst"] = ["200047", "200050", "200054"],
                        s["skin_map"] = {},
                        s["main_character_id"] = 0,
                        s["send_gift_count"] = 0,
                        s["send_gift_limit"] = 0,
                        s["commonViewList"] = [],
                        s["using_commonview_index"] = 0,
                        s["finished_endings_map"] = {},
                        s["rewarded_endings_map"] = {},
                        s["star_chars"] = [],
                        s["hidden_characters_map"] = {},
                        s.Inst = null,
                        s;
                }
                    (d["UIBase"]);
            d["UI_Sushe"] = m;
        }
            (uiscript || (uiscript = {}));



        // 屏蔽改变宿舍角色的网络请求
        !function (d) {
            var i = function () {
                function i(i) {
                    var s = this;
                    this["scrollview"] = null,
                        this["select_index"] = 0,
                        this["show_index_list"] = [],
                        this["only_show_star_char"] = !1,
                        this.me = i,
                        this.me["getChildByName"]("btn_visit")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || m.Inst["close"](Laya["Handler"]["create"](s, function () {
                                d["UI_Sushe"].Inst["show_page_visit"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_look")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || m.Inst["close"](Laya["Handler"]["create"](s, function () {
                                d["UI_Sushe"].Inst["to_look_illust"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_huanzhuang")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || d["UI_Sushe"].Inst["jump_to_char_skin"]();
                        }, null, !1),
                        this.me["getChildByName"]("btn_star")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || s["onChangeStarShowBtnClick"]();
                        }, null, !1),
                        this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                        this["scrollview"]["setElastic"](),
                        this["dongtai_kaiguan"] = new d["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            d["UI_Sushe"].Inst["illust"]["resetSkin"]();
                        }));
                }
                return i["prototype"].show = function (i, m) {
                    void 0 === m && (m = !1),
                        this.me["visible"] = !0,
                        i ? this.me["alpha"] = 1 : d["UIBase"]["anim_alpha_in"](this.me, {
                            x: 0
                        }, 200, 0),
                        this["getShowStarState"](),
                        this["sortShowCharsList"](),
                        m || (this.me["getChildByName"]("btn_star")["getChildAt"](1).x = this["only_show_star_char"] ? 107 : 47),
                        this["scrollview"]["reset"](),
                        this["scrollview"]["addItem"](this["show_index_list"]["length"]);
                },
                    i["prototype"]["render_character_cell"] = function (i) {
                        var m = this,
                            s = i["index"],
                            D = i["container"],
                            j = i["cache_data"];
                        D["visible"] = !0,
                            j["index"] = s,
                            j["inited"] || (j["inited"] = !0, D["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                m["onClickAtHead"](j["index"]);
                            }), j.skin = new d["UI_Character_Skin"](D["getChildByName"]("btn")["getChildByName"]("head")), j.bg = D["getChildByName"]("btn")["getChildByName"]('bg'), j["bound"] = D["getChildByName"]("btn")["getChildByName"]("bound"), j["btn_star"] = D["getChildByName"]("btn_star"), j.star = D["getChildByName"]("btn")["getChildByName"]("star"), j["btn_star"]["clickHandler"] = new Laya["Handler"](this, function () {
                                m["onClickAtStar"](j["index"]);
                            }));
                        var L = D["getChildByName"]("btn");
                        L["getChildByName"]("choose")["visible"] = s == this["select_index"];
                        var O = this["getCharInfoByIndex"](s);
                        L["getChildByName"]("redpoint")["visible"] = d["UI_Sushe"]["check_char_redpoint"](O),
                            j.skin["setSkin"](O.skin, "bighead"),
                            L["getChildByName"]("using")["visible"] = O["charid"] == d["UI_Sushe"]["main_character_id"],
                            D["getChildByName"]("btn")["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (O["is_upgraded"] ? "2.png" : ".png"));
                        var X = cfg["item_definition"]["character"].get(O["charid"]);
                        'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? j["bound"].skin = X.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (O["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (O["is_upgraded"] ? "2.png" : ".png")) : X.ur ? (j["bound"].pos(-10, -2), j["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (O["is_upgraded"] ? "6.png" : "5.png"))) : (j["bound"].pos(4, 20), j["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (O["is_upgraded"] ? "4.png" : "3.png"))),
                            j["btn_star"]["visible"] = this["select_index"] == s,
                            j.star["visible"] = d["UI_Sushe"]["is_char_star"](O["charid"]) || this["select_index"] == s,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (j.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (d["UI_Sushe"]["is_char_star"](O["charid"]) ? 'l' : 'd') + (O["is_upgraded"] ? "1.png" : ".png")), L["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(O["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|')) : (j.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (d["UI_Sushe"]["is_char_star"](O["charid"]) ? "l.png" : "d.png")), L["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(O["charid"])["name_" + GameMgr["client_language"]]),
                            ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && ("200041" == O["charid"] ? (L["getChildByName"]("label_name")["scaleX"] = 0.67, L["getChildByName"]("label_name")["scaleY"] = 0.57) : (L["getChildByName"]("label_name")["scaleX"] = 0.7, L["getChildByName"]("label_name")["scaleY"] = 0.6));
                    },
                    i["prototype"]["onClickAtHead"] = function (i) {
                        if (this["select_index"] == i) {
                            var m = this["getCharInfoByIndex"](i);
                            if (m["charid"] != d["UI_Sushe"]["main_character_id"])
                                if (d["UI_PiPeiYuYue"].Inst["enable"])
                                    d["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2769));
                                else {
                                    var s = d["UI_Sushe"]["main_character_id"];
                                    d["UI_Sushe"]["main_character_id"] = m["charid"],
                                        //app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                        //    character_id: d["UI_Sushe"]["main_character_id"]
                                        //}, function () {}),
                                        GameMgr.Inst["account_data"]["avatar_id"] = m.skin;
                                    // 保存人物和皮肤
                                    MMP.settings.character = m.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = m.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var D = 0; D < this["show_index_list"]["length"]; D++)
                                        this["getCharInfoByIndex"](D)["charid"] == s && this["scrollview"]["wantToRefreshItem"](D);
                                    this["scrollview"]["wantToRefreshItem"](i);
                                }
                        } else {
                            var j = this["select_index"];
                            this["select_index"] = i,
                                j >= 0 && this["scrollview"]["wantToRefreshItem"](j),
                                this["scrollview"]["wantToRefreshItem"](i),
                                d["UI_Sushe"].Inst["change_select"](this["show_index_list"][i]);
                        }
                    },
                    i["prototype"]["onClickAtStar"] = function (i) {
                        if (d["UI_Sushe"]["change_char_star"](this["getCharInfoByIndex"](i)["charid"]), this["only_show_star_char"])
                            this["scrollview"]["wantToRefreshItem"](i);
                        else if (this.show(!0), Math["floor"](this["show_index_list"]["length"] / 3) - 3 > 0) {
                            var m = (Math["floor"](this["select_index"] / 3) - 1) / (Math["floor"](this["show_index_list"]["length"] / 3) - 3);
                            this["scrollview"].rate = Math.min(1, Math.max(0, m));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    i["prototype"]["close"] = function (i) {
                        var m = this;
                        this.me["visible"] && (i ? this.me["visible"] = !1 : d["UIBase"]["anim_alpha_out"](this.me, {
                            x: 0
                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                            m.me["visible"] = !1;
                        })));
                    },
                    i["prototype"]["onChangeStarShowBtnClick"] = function () {
                        if (!this["only_show_star_char"]) {
                            for (var i = !1, m = 0, s = d["UI_Sushe"]["star_chars"]; m < s["length"]; m++) {
                                var D = s[m];
                                if (!d["UI_Sushe"]["hidden_characters_map"][D]) {
                                    i = !0;
                                    break;
                                }
                            }
                            if (!i)
                                return d["UI_SecondConfirm"].Inst["show_only_confirm"](game["Tools"]["strOfLocalization"](3301)), void 0;
                        }
                        d["UI_Sushe"].Inst["change_select"](this["show_index_list"]["length"] > 0 ? this["show_index_list"][0] : 0),
                            this["only_show_star_char"] = !this["only_show_star_char"],
                            app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], this["only_show_star_char"] ? 1 : 0);
                        var j = this.me["getChildByName"]("btn_star")["getChildAt"](1);
                        Laya["Tween"]["clearAll"](j),
                            Laya["Tween"].to(j, {
                                x: this["only_show_star_char"] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    i["prototype"]["getShowStarState"] = function () {
                        if (0 == d["UI_Sushe"]["star_chars"]["length"])
                            return this["only_show_star_char"] = !1, void 0;
                        if (this["only_show_star_char"] = 1 == app["PlayerBehaviorStatistic"]["get_val"](app["EBehaviorType"]["Chara_Show_Star"]), this["only_show_star_char"]) {
                            for (var i = 0, m = d["UI_Sushe"]["star_chars"]; i < m["length"]; i++) {
                                var s = m[i];
                                if (!d["UI_Sushe"]["hidden_characters_map"][s])
                                    return;
                            }
                            this["only_show_star_char"] = !1,
                                app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], 0);
                        }
                    },
                    i["prototype"]["sortShowCharsList"] = function () {
                        this["show_index_list"] = [],
                            this["select_index"] = -1;
                        for (var i = 0, m = d["UI_Sushe"]["star_chars"]; i < m["length"]; i++) {
                            var s = m[i];
                            if (!d["UI_Sushe"]["hidden_characters_map"][s])
                                for (var D = 0; D < d["UI_Sushe"]["characters"]["length"]; D++)
                                    if (d["UI_Sushe"]["characters"][D]["charid"] == s) {
                                        D == d["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]),
                                            this["show_index_list"].push(D);
                                        break;
                                    }
                        }
                        if (!this["only_show_star_char"])
                            for (var D = 0; D < d["UI_Sushe"]["characters"]["length"]; D++)
                                d["UI_Sushe"]["hidden_characters_map"][d["UI_Sushe"]["characters"][D]["charid"]] || -1 == this["show_index_list"]["indexOf"](D) && (D == d["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]), this["show_index_list"].push(D));
                    },
                    i["prototype"]["getCharInfoByIndex"] = function (i) {
                        return d["UI_Sushe"]["characters"][this["show_index_list"][i]];
                    },
                    i;
            }
                (),
                m = function (m) {
                    function s() {
                        var d = m.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["lobby"]["sushe_selectUI"]() : new ui["lobby"]["sushe_select_enUI"]()) || this;
                        return d["bg_width_head"] = 962,
                            d["bg_width_zhuangban"] = 1819,
                            d["bg2_delta"] = -29,
                            d["container_top"] = null,
                            d["locking"] = !1,
                            d.tabs = [],
                            d["tab_index"] = 0,
                            s.Inst = d,
                            d;
                    }
                    return __extends(s, m),
                        s["prototype"]["onCreate"] = function () {
                            var m = this;
                            this["container_top"] = this.me["getChildByName"]("top"),
                                this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    m["locking"] || (1 == m["tab_index"] && m["container_zhuangban"]["changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                        m["close"](),
                                            d["UI_Sushe"].Inst["go2Lobby"]();
                                    }), null) : (m["close"](), d["UI_Sushe"].Inst["go2Lobby"]()));
                                }, null, !1),
                                this.root = this.me["getChildByName"]("root"),
                                this.bg2 = this.root["getChildByName"]("bg2"),
                                this.bg = this.root["getChildByName"]('bg');
                            for (var s = this.root["getChildByName"]("container_tabs"), D = function (i) {
                                j.tabs.push(s["getChildAt"](i)),
                                    j.tabs[i]["clickHandler"] = new Laya["Handler"](j, function () {
                                        m["locking"] || m["tab_index"] != i && (1 == m["tab_index"] && m["container_zhuangban"]["changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                            m["change_tab"](i);
                                        }), null) : m["change_tab"](i));
                                    });
                            }, j = this, L = 0; L < s["numChildren"]; L++)
                                D(L);
                            this["container_head"] = new i(this.root["getChildByName"]("container_heads")),
                                this["container_zhuangban"] = new d["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                    return m["locking"];
                                }));
                        },
                        s["prototype"].show = function (i) {
                            var m = this;
                            this["enable"] = !0,
                                this["locking"] = !0,
                                this["container_head"]["dongtai_kaiguan"]["refresh"](),
                                this["tab_index"] = i,
                                0 == this["tab_index"] ? (this.bg["width"] = this["bg_width_head"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"]["close"](!0), this["container_head"].show(!0), d["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), d["UIBase"]["anim_alpha_in"](this.root, {
                                    x: 30
                                }, 200)) : (this.bg["width"] = this["bg_width_zhuangban"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"].show(!0), this["container_head"]["close"](!0), d["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), d["UIBase"]["anim_alpha_in"](this.root, {
                                    y: 30
                                }, 200)),
                                Laya["timer"].once(200, this, function () {
                                    m["locking"] = !1;
                                });
                            for (var s = 0; s < this.tabs["length"]; s++) {
                                var D = this.tabs[s];
                                D.skin = game["Tools"]["localUISrc"](s == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var j = D["getChildByName"]("word");
                                j["color"] = s == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                    j["scaleX"] = j["scaleY"] = s == this["tab_index"] ? 1.1 : 1,
                                    s == this["tab_index"] && D["parent"]["setChildIndex"](D, this.tabs["length"] - 1);
                            }
                        },
                        s["prototype"]["change_tab"] = function (i) {
                            var m = this;
                            this["tab_index"] = i;
                            for (var s = 0; s < this.tabs["length"]; s++) {
                                var D = this.tabs[s];
                                D.skin = game["Tools"]["localUISrc"](s == i ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var j = D["getChildByName"]("word");
                                j["color"] = s == i ? "#552c1c" : "#d3a86c",
                                    j["scaleX"] = j["scaleY"] = s == i ? 1.1 : 1,
                                    s == i && D["parent"]["setChildIndex"](D, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["container_zhuangban"]["close"](!1), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_head"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    d["UI_Sushe"].Inst["open_illust"](),
                                        m["container_head"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_head"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])) : 1 == this["tab_index"] && (this["container_head"]["close"](!1), d["UI_Sushe"].Inst["hide_illust"](), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_zhuangban"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    m["container_zhuangban"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_zhuangban"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])),
                                Laya["timer"].once(400, this, function () {
                                    m["locking"] = !1;
                                });
                        },
                        s["prototype"]["close"] = function (i) {
                            var m = this;
                            this["locking"] = !0,
                                d["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150),
                                0 == this["tab_index"] ? d["UIBase"]["anim_alpha_out"](this.root, {
                                    x: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    m["container_head"]["close"](!0);
                                })) : d["UIBase"]["anim_alpha_out"](this.root, {
                                    y: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    m["container_zhuangban"]["close"](!0);
                                })),
                                Laya["timer"].once(150, this, function () {
                                    m["locking"] = !1,
                                        m["enable"] = !1,
                                        i && i.run();
                                });
                        },
                        s["prototype"]["onDisable"] = function () {
                            for (var i = 0; i < d["UI_Sushe"]["characters"]["length"]; i++) {
                                var m = d["UI_Sushe"]["characters"][i].skin,
                                    s = cfg["item_definition"].skin.get(m);
                                s && Laya["loader"]["clearTextureRes"](game["LoadMgr"]["getResImageSkin"](s.path + "/bighead.png"));
                            }
                        },
                        s["prototype"]["changeKaiguanShow"] = function (d) {
                            d ? this["container_head"]["dongtai_kaiguan"].show() : this["container_head"]["dongtai_kaiguan"].hide();
                        },
                        s;
                }
                    (d["UIBase"]);
            d["UI_Sushe_Select"] = m;
        }
            (uiscript || (uiscript = {}));



        // 友人房
        !function (d) {
            var i = function () {
                function i(d) {
                    var i = this;
                    this["friends"] = [],
                        this["sortlist"] = [],
                        this.me = d,
                        this.me["visible"] = !1,
                        this["blackbg"] = d["getChildByName"]("blackbg"),
                        this["blackbg"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            i["locking"] || i["close"]();
                        }, null, !1),
                        this.root = d["getChildByName"]("root"),
                        this["scrollview"] = this.root["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, this["render_item"], null, !1)),
                        this["noinfo"] = this.root["getChildByName"]("noinfo");
                }
                return i["prototype"].show = function () {
                    var i = this;
                    this["locking"] = !0,
                        this.me["visible"] = !0,
                        this["scrollview"]["reset"](),
                        this["friends"] = [],
                        this["sortlist"] = [];
                    for (var m = game["FriendMgr"]["friend_list"], s = 0; s < m["length"]; s++)
                        this["sortlist"].push(s);
                    this["sortlist"] = this["sortlist"].sort(function (d, i) {
                        var s = m[d],
                            D = 0;
                        if (s["state"]["is_online"]) {
                            var j = game["Tools"]["playState2Desc"](s["state"]["playing"]);
                            D += '' != j ? 30000000000 : 60000000000,
                                s.base["level"] && (D += s.base["level"].id % 1000 * 10000000),
                                s.base["level3"] && (D += s.base["level3"].id % 1000 * 10000),
                                D += -Math["floor"](s["state"]["login_time"] / 10000000);
                        } else
                            D += s["state"]["logout_time"];
                        var L = m[i],
                            O = 0;
                        if (L["state"]["is_online"]) {
                            var j = game["Tools"]["playState2Desc"](L["state"]["playing"]);
                            O += '' != j ? 30000000000 : 60000000000,
                                L.base["level"] && (O += L.base["level"].id % 1000 * 10000000),
                                L.base["level3"] && (O += L.base["level3"].id % 1000 * 10000),
                                O += -Math["floor"](L["state"]["login_time"] / 10000000);
                        } else
                            O += L["state"]["logout_time"];
                        return O - D;
                    });
                    for (var s = 0; s < m["length"]; s++)
                        this["friends"].push({
                            f: m[s],
                            invited: !1
                        });
                    this["noinfo"]["visible"] = 0 == this["friends"]["length"],
                        this["scrollview"]["addItem"](this["friends"]["length"]),
                        d["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                            i["locking"] = !1;
                        }));
                },
                    i["prototype"]["close"] = function () {
                        var i = this;
                        this["locking"] = !0,
                            d["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                i["locking"] = !1,
                                    i.me["visible"] = !1;
                            }));
                    },
                    i["prototype"]["render_item"] = function (i) {
                        var m = i["index"],
                            s = i["container"],
                            j = i["cache_data"];
                        j.head || (j.head = new d["UI_Head"](s["getChildByName"]("head"), "UI_WaitingRoom"), j.name = s["getChildByName"]("name"), j["state"] = s["getChildByName"]("label_state"), j.btn = s["getChildByName"]("btn_invite"), j["invited"] = s["getChildByName"]("invited"));
                        var L = this["friends"][this["sortlist"][m]];
                        j.head.id = game["GameUtility"]["get_limited_skin_id"](L.f.base["avatar_id"]),
                            j.head["set_head_frame"](L.f.base["account_id"], L.f.base["avatar_frame"]),
                            game["Tools"]["SetNickname"](j.name, L.f.base);
                        var O = !1;
                        if (L.f["state"]["is_online"]) {
                            var X = game["Tools"]["playState2Desc"](L.f["state"]["playing"]);
                            '' != X ? (j["state"].text = game["Tools"]["strOfLocalization"](2069, [X]), j["state"]["color"] = "#a9d94d", j.name["color"] = "#a9d94d") : (j["state"].text = game["Tools"]["strOfLocalization"](2071), j["state"]["color"] = "#58c4db", j.name["color"] = "#58c4db", O = !0);
                        } else
                            j["state"].text = game["Tools"]["strOfLocalization"](2072), j["state"]["color"] = "#8c8c8c", j.name["color"] = "#8c8c8c";
                        L["invited"] ? (j.btn["visible"] = !1, j["invited"]["visible"] = !0) : (j.btn["visible"] = !0, j["invited"]["visible"] = !1, game["Tools"]["setGrayDisable"](j.btn, !O), O && (j.btn["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            game["Tools"]["setGrayDisable"](j.btn, !0);
                            var i = {
                                room_id: D.Inst["room_id"],
                                mode: D.Inst["room_mode"],
                                nickname: GameMgr.Inst["account_data"]["nickname"],
                                verified: GameMgr.Inst["account_data"]["verified"],
                                account_id: GameMgr.Inst["account_id"]
                            };
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "sendClientMessage", {
                                target_id: L.f.base["account_id"],
                                type: game["EFriendMsgType"]["room_invite"],
                                content: JSON["stringify"](i)
                            }, function (i, m) {
                                i || m["error"] ? (game["Tools"]["setGrayDisable"](j.btn, !1), d["UIMgr"].Inst["showNetReqError"]("sendClientMessage", i, m)) : (j.btn["visible"] = !1, j["invited"]["visible"] = !0, L["invited"] = !0);
                            });
                        }, null, !1)));
                    },
                    i;
            }
                (),
                m = function () {
                    function i(i) {
                        var m = this;
                        this.tabs = [],
                            this["tab_index"] = 0,
                            this.me = i,
                            this["blackmask"] = this.me["getChildByName"]("blackmask"),
                            this.root = this.me["getChildByName"]("root"),
                            this["page_head"] = new d["zhuangban"]["Page_Waiting_Head"](this.root["getChildByName"]("container_heads")),
                            this["page_zhangban"] = new d["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                return m["locking"];
                            }));
                        for (var s = this.root["getChildByName"]("container_tabs"), D = function (i) {
                            j.tabs.push(s["getChildAt"](i)),
                                j.tabs[i]["clickHandler"] = new Laya["Handler"](j, function () {
                                    m["locking"] || m["tab_index"] != i && (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                        m["change_tab"](i);
                                    }), null) : m["change_tab"](i));
                                });
                        }, j = this, L = 0; L < s["numChildren"]; L++)
                            D(L);
                        this.root["getChildByName"]("close")["clickHandler"] = new Laya["Handler"](this, function () {
                            m["locking"] || (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                m["close"](!1);
                            }), null) : m["close"](!1));
                        }),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function () {
                                m["locking"] || (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                    m["close"](!1);
                                }), null) : m["close"](!1));
                            });
                    }
                    return i["prototype"].show = function () {
                        var i = this;
                        this.me["visible"] = !0,
                            this["blackmask"]["alpha"] = 0,
                            this["locking"] = !0,
                            Laya["Tween"].to(this["blackmask"], {
                                alpha: 0.3
                            }, 150),
                            d["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                i["locking"] = !1;
                            })),
                            this["tab_index"] = 0,
                            this["page_zhangban"]["close"](!0),
                            this["page_head"].show(!0);
                        for (var m = 0; m < this.tabs["length"]; m++) {
                            var s = this.tabs[m];
                            s.skin = game["Tools"]["localUISrc"](m == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                            var D = s["getChildByName"]("word");
                            D["color"] = m == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                D["scaleX"] = D["scaleY"] = m == this["tab_index"] ? 1.1 : 1,
                                m == this["tab_index"] && s["parent"]["setChildIndex"](s, this.tabs["length"] - 1);
                        }
                    },
                        i["prototype"]["change_tab"] = function (d) {
                            var i = this;
                            this["tab_index"] = d;
                            for (var m = 0; m < this.tabs["length"]; m++) {
                                var s = this.tabs[m];
                                s.skin = game["Tools"]["localUISrc"](m == d ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var D = s["getChildByName"]("word");
                                D["color"] = m == d ? "#552c1c" : "#d3a86c",
                                    D["scaleX"] = D["scaleY"] = m == d ? 1.1 : 1,
                                    m == d && s["parent"]["setChildIndex"](s, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["page_zhangban"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    i["page_head"].show(!1);
                                })) : 1 == this["tab_index"] && (this["page_head"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    i["page_zhangban"].show(!1);
                                })),
                                Laya["timer"].once(400, this, function () {
                                    i["locking"] = !1;
                                });
                        },
                        i["prototype"]["close"] = function (i) {
                            var m = this;
                            //修改友人房间立绘
                            if (!(m.page_head.choosed_chara_index == 0 && m.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = m.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = m.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = m.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[m.page_head.choosed_chara_index] = m.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me["visible"] && (i ? (this["page_head"]["close"](!0), this["page_zhangban"]["close"](!0), this.me["visible"] = !1) : (app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: D.Inst["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this["locking"] = !0, this["page_head"]["close"](!1), this["page_zhangban"]["close"](!1), d["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                m["locking"] = !1,
                                    m.me["visible"] = !1;
                            }))));
                        },
                        i;
                }
                    (),
                s = function () {
                    function d(d) {
                        this["modes"] = [],
                            this.me = d,
                            this.bg = this.me["getChildByName"]('bg'),
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]));
                    }
                    return d["prototype"].show = function (d) {
                        this.me["visible"] = !0,
                            this["scrollview"]["reset"](),
                            this["modes"] = d,
                            this["scrollview"]["addItem"](d["length"]);
                        var i = this["scrollview"]["total_height"];
                        i > 380 ? (this["scrollview"]["_content"].y = 10, this.bg["height"] = 400) : (this["scrollview"]["_content"].y = 390 - i, this.bg["height"] = i + 20),
                            this.bg["visible"] = !0;
                    },
                        d["prototype"]["render_item"] = function (d) {
                            var i = d["index"],
                                m = d["container"],
                                s = m["getChildByName"]("info");
                            s["fontSize"] = 40,
                                s["fontSize"] = this["modes"][i]["length"] <= 5 ? 40 : this["modes"][i]["length"] <= 9 ? 55 - 3 * this["modes"][i]["length"] : 28,
                                s.text = this["modes"][i];
                        },
                        d;
                }
                    (),
                D = function (D) {
                    function j() {
                        var i = D.call(this, new ui["lobby"]["waitingroomUI"]()) || this;
                        return i["skin_ready"] = "myres/room/btn_ready.png",
                            i["skin_cancel"] = "myres/room/btn_cancel.png",
                            i["skin_start"] = "myres/room/btn_start.png",
                            i["skin_start_no"] = "myres/room/btn_start_no.png",
                            i["update_seq"] = 0,
                            i["pre_msgs"] = [],
                            i["msg_tail"] = -1,
                            i["posted"] = !1,
                            i["label_rommid"] = null,
                            i["player_cells"] = [],
                            i["btn_ok"] = null,
                            i["btn_invite_friend"] = null,
                            i["btn_add_robot"] = null,
                            i["btn_dress"] = null,
                            i["beReady"] = !1,
                            i["room_id"] = -1,
                            i["owner_id"] = -1,
                            i["tournament_id"] = 0,
                            i["max_player_count"] = 0,
                            i["players"] = [],
                            i["container_rules"] = null,
                            i["container_top"] = null,
                            i["container_right"] = null,
                            i["locking"] = !1,
                            i["mousein_copy"] = !1,
                            i["popout"] = null,
                            i["room_link"] = null,
                            i["btn_copy_link"] = null,
                            i["last_start_room"] = 0,
                            i["invitefriend"] = null,
                            i["pre_choose"] = null,
                            i["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                            j.Inst = i,
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerReady", Laya["Handler"]["create"](i, function (d) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON["stringify"](d)),
                                    i["onReadyChange"](d["account_id"], d["ready"], d["dressing"]);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerUpdate", Laya["Handler"]["create"](i, function (d) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON["stringify"](d)),
                                    i["onPlayerChange"](d);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomGameStart", Laya["Handler"]["create"](i, function (d) {
                                i["enable"] && (app.Log.log("NotifyRoomGameStart:" + JSON["stringify"](d)), GameMgr.Inst["onPipeiYuyueSuccess"](0, "youren"), i["onGameStart"](d));
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomKickOut", Laya["Handler"]["create"](i, function (d) {
                                app.Log.log("NotifyRoomKickOut:" + JSON["stringify"](d)),
                                    i["onBeKictOut"]();
                            })),
                            game["LobbyNetMgr"].Inst["add_connect_listener"](Laya["Handler"]["create"](i, function () {
                                i["enable"] && i.hide(Laya["Handler"]["create"](i, function () {
                                    d["UI_Lobby"].Inst["enable"] = !0;
                                }));
                            }, null, !1)),
                            i;
                    }
                    return __extends(j, D),
                        j["prototype"]["push_msg"] = function (d) {
                            this["pre_msgs"]["length"] < 15 ? this["pre_msgs"].push(JSON["parse"](d)) : (this["msg_tail"] = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], this["pre_msgs"][this["msg_tail"]] = JSON["parse"](d));
                        },
                        Object["defineProperty"](j["prototype"], "inRoom", {
                            get: function () {
                                return -1 != this["room_id"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object["defineProperty"](j["prototype"], "robot_count", {
                            get: function () {
                                for (var d = 0, i = 0; i < this["players"]["length"]; i++)
                                    2 == this["players"][i]["category"] && d++;
                                return d;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        j["prototype"]["resetData"] = function () {
                            this["room_id"] = -1,
                                this["owner_id"] = -1,
                                this["room_mode"] = {},
                                this["max_player_count"] = 0,
                                this["players"] = [];
                        },
                        j["prototype"]["updateData"] = function (d) {
                            if (!d)
                                return this["resetData"](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < d.persons.length; i++) {

                                if (d.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    d.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    d.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    d.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    d.persons[i].title = GameMgr.Inst.account_data.title;
                                    d.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        d.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this["room_id"] = d["room_id"],
                                this["owner_id"] = d["owner_id"],
                                this["room_mode"] = d.mode,
                                this["public_live"] = d["public_live"],
                                this["tournament_id"] = 0,
                                d["tournament_id"] && (this["tournament_id"] = d["tournament_id"]),
                                this["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                                this["room_mode"]["detail_rule"] && (1 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2003)), 2 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2004))),
                                this["max_player_count"] = d["max_player_count"],
                                this["players"] = [];
                            for (var i = 0; i < d["persons"]["length"]; i++) {
                                var m = d["persons"][i];
                                //修改友人房间立绘  -----fxxk
                                //if (m.account_id == GameMgr.Inst.account_id)
                                //    m.avatar_id = GameMgr.Inst.account_data.my_character.skin;
                                //end
                                m["ready"] = !1,
                                    m["cell_index"] = -1,
                                    m["category"] = 1,
                                    this["players"].push(m);
                            }
                            for (var i = 0; i < d["robot_count"]; i++)
                                this["players"].push({
                                    category: 2,
                                    cell_index: -1,
                                    account_id: 0,
                                    level: {
                                        id: "10101",
                                        score: 0
                                    },
                                    level3: {
                                        id: "20101",
                                        score: 0
                                    },
                                    nickname: this["ai_name"],
                                    verified: 0,
                                    ready: !0,
                                    dressing: !1,
                                    title: 0,
                                    avatar_id: game["GameUtility"]["get_default_ai_skin"]()
                                });
                            for (var i = 0; i < d["ready_list"]["length"]; i++)
                                for (var s = 0; s < this["players"]["length"]; s++)
                                    if (this["players"][s]["account_id"] == d["ready_list"][i]) {
                                        this["players"][s]["ready"] = !0;
                                        break;
                                    }
                            this["update_seq"] = 0,
                                d.seq && (this["update_seq"] = d.seq);
                        },
                        j["prototype"]["onReadyChange"] = function (d, i, m) {
                            for (var s = 0; s < this["players"]["length"]; s++)
                                if (this["players"][s]["account_id"] == d) {
                                    this["players"][s]["ready"] = i,
                                        this["players"][s]["dressing"] = m,
                                        this["_onPlayerReadyChange"](this["players"][s]);
                                    break;
                                }
                            this["refreshStart"]();
                        },
                        j["prototype"]["onPlayerChange"] = function (d) {
                            if (app.Log.log(d), d = d["toJSON"](), !(d.seq && d.seq <= this["update_seq"])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < d.player_list.length; i++) {

                                    if (d.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        d.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        d.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        d.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            d.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (d.update_list != undefined) {
                                    for (var i = 0; i < d.update_list.length; i++) {

                                        if (d.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            d.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            d.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            d.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                d.update_list[i].nickname = MMP.settings.nickname;
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
                                this["update_seq"] = d.seq;
                                var i = {};
                                i.type = "onPlayerChange0",
                                    i["players"] = this["players"],
                                    i.msg = d,
                                    this["push_msg"](JSON["stringify"](i));
                                var m = this["robot_count"],
                                    s = d["robot_count"];
                                if (s < this["robot_count"]) {
                                    this["pre_choose"] && 2 == this["pre_choose"]["category"] && (this["pre_choose"]["category"] = 0, this["pre_choose"] = null, m--);
                                    for (var D = 0; D < this["players"]["length"]; D++)
                                        2 == this["players"][D]["category"] && m > s && (this["players"][D]["category"] = 0, m--);
                                }
                                for (var j = [], L = d["player_list"], D = 0; D < this["players"]["length"]; D++)
                                    if (1 == this["players"][D]["category"]) {
                                        for (var O = -1, X = 0; X < L["length"]; X++)
                                            if (L[X]["account_id"] == this["players"][D]["account_id"]) {
                                                O = X;
                                                break;
                                            }
                                        if (-1 != O) {
                                            var Y = L[O];
                                            j.push(this["players"][D]),
                                                this["players"][D]["avatar_id"] = Y["avatar_id"],
                                                this["players"][D]["title"] = Y["title"],
                                                this["players"][D]["verified"] = Y["verified"];
                                        }
                                    } else
                                        2 == this["players"][D]["category"] && j.push(this["players"][D]);
                                this["players"] = j;
                                for (var D = 0; D < L["length"]; D++) {
                                    for (var B = !1, Y = L[D], X = 0; X < this["players"]["length"]; X++)
                                        if (1 == this["players"][X]["category"] && this["players"][X]["account_id"] == Y["account_id"]) {
                                            B = !0;
                                            break;
                                        }
                                    B || this["players"].push({
                                        account_id: Y["account_id"],
                                        avatar_id: Y["avatar_id"],
                                        nickname: Y["nickname"],
                                        verified: Y["verified"],
                                        title: Y["title"],
                                        level: Y["level"],
                                        level3: Y["level3"],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var w = [!1, !1, !1, !1], D = 0; D < this["players"]["length"]; D++)
                                    - 1 != this["players"][D]["cell_index"] && (w[this["players"][D]["cell_index"]] = !0, this["_refreshPlayerInfo"](this["players"][D]));
                                for (var D = 0; D < this["players"]["length"]; D++)
                                    if (1 == this["players"][D]["category"] && -1 == this["players"][D]["cell_index"])
                                        for (var X = 0; X < this["max_player_count"]; X++)
                                            if (!w[X]) {
                                                this["players"][D]["cell_index"] = X,
                                                    w[X] = !0,
                                                    this["_refreshPlayerInfo"](this["players"][D]);
                                                break;
                                            }
                                for (var m = this["robot_count"], s = d["robot_count"]; s > m;) {
                                    for (var N = -1, X = 0; X < this["max_player_count"]; X++)
                                        if (!w[X]) {
                                            N = X;
                                            break;
                                        }
                                    if (-1 == N)
                                        break;
                                    w[N] = !0,
                                        this["players"].push({
                                            category: 2,
                                            cell_index: N,
                                            account_id: 0,
                                            level: {
                                                id: "10101",
                                                score: 0
                                            },
                                            level3: {
                                                id: "20101",
                                                score: 0
                                            },
                                            nickname: this["ai_name"],
                                            verified: 0,
                                            ready: !0,
                                            title: 0,
                                            avatar_id: game["GameUtility"]["get_default_ai_skin"](),
                                            dressing: !1
                                        }),
                                        this["_refreshPlayerInfo"](this["players"][this["players"]["length"] - 1]),
                                        m++;
                                }
                                for (var D = 0; D < this["max_player_count"]; D++)
                                    w[D] || this["_clearCell"](D);
                                var i = {};
                                if (i.type = "onPlayerChange1", i["players"] = this["players"], this["push_msg"](JSON["stringify"](i)), d["owner_id"]) {
                                    if (this["owner_id"] = d["owner_id"], this["enable"])
                                        if (this["owner_id"] == GameMgr.Inst["account_id"])
                                            this["refreshAsOwner"]();
                                        else
                                            for (var X = 0; X < this["players"]["length"]; X++)
                                                if (this["players"][X] && this["players"][X]["account_id"] == this["owner_id"]) {
                                                    this["_refreshPlayerInfo"](this["players"][X]);
                                                    break;
                                                }
                                } else if (this["enable"])
                                    if (this["owner_id"] == GameMgr.Inst["account_id"])
                                        this["refreshAsOwner"]();
                                    else
                                        for (var X = 0; X < this["players"]["length"]; X++)
                                            if (this["players"][X] && this["players"][X]["account_id"] == this["owner_id"]) {
                                                this["_refreshPlayerInfo"](this["players"][X]);
                                                break;
                                            }
                            }
                        },
                        j["prototype"]["onBeKictOut"] = function () {
                            this["resetData"](),
                                this["enable"] && (this["enable"] = !1, this["pop_change_view"]["close"](!1), d["UI_Lobby"].Inst["enable"] = !0, d["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](52)));
                        },
                        j["prototype"]["onCreate"] = function () {
                            var D = this;
                            this["last_start_room"] = 0;
                            var j = this.me["getChildByName"]("root");
                            this["container_top"] = j["getChildByName"]("top"),
                                this["container_right"] = j["getChildByName"]("right"),
                                this["label_rommid"] = this["container_top"]["getChildByName"]("label_roomid");
                            for (var L = function (i) {
                                var m = j["getChildByName"]("player_" + i["toString"]()),
                                    s = {};
                                s["index"] = i,
                                    s["container"] = m,
                                    s["container_flag"] = m["getChildByName"]("flag"),
                                    s["container_flag"]["visible"] = !1,
                                    s["container_name"] = m["getChildByName"]("container_name"),
                                    s.name = m["getChildByName"]("container_name")["getChildByName"]("name"),
                                    s["btn_t"] = m["getChildByName"]("btn_t"),
                                    s["container_illust"] = m["getChildByName"]("container_illust"),
                                    s["illust"] = new d["UI_Character_Skin"](m["getChildByName"]("container_illust")["getChildByName"]("illust")),
                                    s.host = m["getChildByName"]("host"),
                                    s["title"] = new d["UI_PlayerTitle"](m["getChildByName"]("container_name")["getChildByName"]("title"), "UI_WaitingRoom"),
                                    s.rank = new d["UI_Level"](m["getChildByName"]("container_name")["getChildByName"]("rank"), "UI_WaitingRoom"),
                                    s["is_robot"] = !1;
                                var L = 0;
                                s["btn_t"]["clickHandler"] = Laya["Handler"]["create"](O, function () {
                                    if (!(D["locking"] || Laya["timer"]["currTimer"] < L)) {
                                        L = Laya["timer"]["currTimer"] + 500;
                                        for (var d = 0; d < D["players"]["length"]; d++)
                                            if (D["players"][d]["cell_index"] == i) {
                                                D["kickPlayer"](d);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    s["btn_info"] = m["getChildByName"]("btn_info"),
                                    s["btn_info"]["clickHandler"] = Laya["Handler"]["create"](O, function () {
                                        if (!D["locking"])
                                            for (var m = 0; m < D["players"]["length"]; m++)
                                                if (D["players"][m]["cell_index"] == i) {
                                                    D["players"][m]["account_id"] && D["players"][m]["account_id"] > 0 && d["UI_OtherPlayerInfo"].Inst.show(D["players"][m]["account_id"], D["room_mode"].mode < 10 ? 1 : 2);
                                                    break;
                                                }
                                    }, null, !1),
                                    O["player_cells"].push(s);
                            }, O = this, X = 0; 4 > X; X++)
                                L(X);
                            this["btn_ok"] = j["getChildByName"]("btn_ok");
                            var Y = 0;
                            this["btn_ok"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < Y + 500 || (Y = Laya["timer"]["currTimer"], D["owner_id"] == GameMgr.Inst["account_id"] ? D["getStart"]() : D["switchReady"]());
                            }, null, !1);
                            var B = 0;
                            this["container_top"]["getChildByName"]("btn_leave")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < B + 500 || (B = Laya["timer"]["currTimer"], D["leaveRoom"]());
                            }, null, !1),
                                this["btn_invite_friend"] = this["container_right"]["getChildByName"]("btn_friend"),
                                this["btn_invite_friend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    D["locking"] || D["invitefriend"].show();
                                }, null, !1),
                                this["btn_add_robot"] = this["container_right"]["getChildByName"]("btn_robot");
                            var w = 0;
                            this["btn_add_robot"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                D["locking"] || Laya["timer"]["currTimer"] < w || (w = Laya["timer"]["currTimer"] + 1000, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: D["robot_count"] + 1
                                }, function (i, m) {
                                    (i || m["error"] && 1111 != m["error"].code) && d["UIMgr"].Inst["showNetReqError"]("modifyRoom_add", i, m),
                                        w = 0;
                                }));
                            }, null, !1),
                                this["container_right"]["getChildByName"]("btn_help")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (!D["locking"]) {
                                        var i = 0;
                                        D["room_mode"]["detail_rule"] && D["room_mode"]["detail_rule"]["chuanma"] && (i = 1),
                                            d["UI_Rules"].Inst.show(0, null, i);
                                    }
                                }, null, !1),
                                this["btn_dress"] = this["container_right"]["getChildByName"]("btn_view"),
                                this["btn_dress"]["clickHandler"] = new Laya["Handler"](this, function () {
                                    D["locking"] || D["beReady"] && D["owner_id"] != GameMgr.Inst["account_id"] || (D["pop_change_view"].show(), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                        ready: D["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                });
                            var N = this["container_right"]["getChildByName"]("btn_copy");
                            N.on("mouseover", this, function () {
                                D["mousein_copy"] = !0;
                            }),
                                N.on("mouseout", this, function () {
                                    D["mousein_copy"] = !1;
                                }),
                                N["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    D["popout"]["visible"] || (GameMgr.Inst["BehavioralStatistics"](12), D["popout"]["visible"] = !0, d["UIBase"]["anim_pop_out"](D["popout"], null));
                                }, null, !1),
                                this["container_rules"] = new s(this["container_right"]["getChildByName"]("container_rules")),
                                this["popout"] = this.me["getChildByName"]("pop"),
                                this["room_link"] = this["popout"]["getChildByName"]("input")["getChildByName"]("txtinput"),
                                this["room_link"]["editable"] = !1,
                                this["btn_copy_link"] = this["popout"]["getChildByName"]("btn_copy"),
                                this["btn_copy_link"]["visible"] = !1,
                                GameMgr["inConch"] ? (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    var i = Laya["PlatformClass"]["createClass"]("layaair.majsoul.mjmgr");
                                    i.call("setSysClipboardText", D["room_link"].text),
                                        d["UIBase"]["anim_pop_hide"](D["popout"], Laya["Handler"]["create"](D, function () {
                                            D["popout"]["visible"] = !1;
                                        })),
                                        d["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)) : GameMgr["iniOSWebview"] && (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Laya["Browser"]["window"]["wkbridge"]["callNative"]("copy2clip", D["room_link"].text, function () { }),
                                        d["UIBase"]["anim_pop_hide"](D["popout"], Laya["Handler"]["create"](D, function () {
                                            D["popout"]["visible"] = !1;
                                        })),
                                        d["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)),
                                this["popout"]["visible"] = !1,
                                this["popout"]["getChildByName"]("btn_cancel")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    d["UIBase"]["anim_pop_hide"](D["popout"], Laya["Handler"]["create"](D, function () {
                                        D["popout"]["visible"] = !1;
                                    }));
                                }, null, !1),
                                this["invitefriend"] = new i(this.me["getChildByName"]("invite_friend")),
                                this["pop_change_view"] = new m(this.me["getChildByName"]("pop_view"));
                        },
                        j["prototype"].show = function () {
                            var i = this;
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["mousein_copy"] = !1,
                                this["beReady"] = !1,
                                this["invitefriend"].me["visible"] = !1,
                                this["btn_add_robot"]["visible"] = !1,
                                this["btn_invite_friend"]["visible"] = !1,
                                game["Tools"]["setGrayDisable"](this["btn_dress"], !1),
                                this["pre_choose"] = null,
                                this["pop_change_view"]["close"](!0);
                            for (var m = 0; 4 > m; m++)
                                this["player_cells"][m]["container"]["visible"] = m < this["max_player_count"];
                            for (var m = 0; m < this["max_player_count"]; m++)
                                this["_clearCell"](m);
                            for (var m = 0; m < this["players"]["length"]; m++)
                                this["players"][m]["cell_index"] = m, this["_refreshPlayerInfo"](this["players"][m]);
                            this["msg_tail"] = -1,
                                this["pre_msgs"] = [],
                                this["posted"] = !1;
                            var s = {};
                            s.type = "show",
                                s["players"] = this["players"],
                                this["push_msg"](JSON["stringify"](s)),
                                this["owner_id"] == GameMgr.Inst["account_id"] ? (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]), this["refreshAsOwner"]()) : (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_ok"], !1)),
                                this["label_rommid"].text = 'en' == GameMgr["client_language"] ? '#' + this["room_id"]["toString"]() : this["room_id"]["toString"]();
                            var D = [];
                            D.push(game["Tools"]["room_mode_desc"](this["room_mode"].mode));
                            var j = this["room_mode"]["detail_rule"];
                            if (j) {
                                var L = 5,
                                    O = 20;
                                if (null != j["time_fixed"] && (L = j["time_fixed"]), null != j["time_add"] && (O = j["time_add"]), D.push(L["toString"]() + '+' + O["toString"]() + game["Tools"]["strOfLocalization"](2019)), 0 != this["tournament_id"]) {
                                    var X = cfg["tournament"]["tournaments"].get(this["tournament_id"]);
                                    X && D.push(X.name);
                                }
                                if (null != j["init_point"] && D.push(game["Tools"]["strOfLocalization"](2199) + j["init_point"]), null != j["fandian"] && D.push(game["Tools"]["strOfLocalization"](2094) + ':' + j["fandian"]), j["guyi_mode"] && D.push(game["Tools"]["strOfLocalization"](3028)), null != j["dora_count"])
                                    switch (j["chuanma"] && (j["dora_count"] = 0), j["dora_count"]) {
                                        case 0:
                                            D.push(game["Tools"]["strOfLocalization"](2044));
                                            break;
                                        case 2:
                                            D.push(game["Tools"]["strOfLocalization"](2047));
                                            break;
                                        case 3:
                                            D.push(game["Tools"]["strOfLocalization"](2045));
                                            break;
                                        case 4:
                                            D.push(game["Tools"]["strOfLocalization"](2046));
                                    }
                                null != j["shiduan"] && 1 != j["shiduan"] && D.push(game["Tools"]["strOfLocalization"](2137)),
                                    2 === j["fanfu"] && D.push(game["Tools"]["strOfLocalization"](2763)),
                                    4 === j["fanfu"] && D.push(game["Tools"]["strOfLocalization"](2764)),
                                    null != j["bianjietishi"] && 1 != j["bianjietishi"] && D.push(game["Tools"]["strOfLocalization"](2200)),
                                    this["room_mode"].mode >= 10 && this["room_mode"].mode <= 14 && (null != j["have_zimosun"] && 1 != j["have_zimosun"] ? D.push(game["Tools"]["strOfLocalization"](2202)) : D.push(game["Tools"]["strOfLocalization"](2203)));
                            }
                            this["container_rules"].show(D),
                                this["enable"] = !0,
                                this["locking"] = !0,
                                d["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200);
                            for (var m = 0; m < this["player_cells"]["length"]; m++)
                                d["UIBase"]["anim_alpha_in"](this["player_cells"][m]["container"], {
                                    x: 80
                                }, 150, 150 + 50 * m, null, Laya.Ease["backOut"]);
                            d["UIBase"]["anim_alpha_in"](this["btn_ok"], {}, 100, 600),
                                d["UIBase"]["anim_alpha_in"](this["container_right"], {
                                    x: 20
                                }, 100, 500),
                                Laya["timer"].once(600, this, function () {
                                    i["locking"] = !1;
                                });
                            var Y = game["Tools"]["room_mode_desc"](this["room_mode"].mode);
                            this["room_link"].text = game["Tools"]["strOfLocalization"](2221, [this["room_id"]["toString"]()]),
                                '' != Y && (this["room_link"].text += '(' + Y + ')');
                            var B = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                            this["room_link"].text += ': ' + B + "?room=" + this["room_id"];
                        },
                        j["prototype"]["leaveRoom"] = function () {
                            var i = this;
                            this["locking"] || app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (m, s) {
                                m || s["error"] ? d["UIMgr"].Inst["showNetReqError"]("leaveRoom", m, s) : (i["room_id"] = -1, i.hide(Laya["Handler"]["create"](i, function () {
                                    d["UI_Lobby"].Inst["enable"] = !0;
                                })));
                            });
                        },
                        j["prototype"]["tryToClose"] = function (i) {
                            var m = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (s, D) {
                                s || D["error"] ? (d["UIMgr"].Inst["showNetReqError"]("leaveRoom", s, D), i["runWith"](!1)) : (m["enable"] = !1, m["pop_change_view"]["close"](!0), i["runWith"](!0));
                            });
                        },
                        j["prototype"].hide = function (i) {
                            var m = this;
                            this["locking"] = !0,
                                d["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150);
                            for (var s = 0; s < this["player_cells"]["length"]; s++)
                                d["UIBase"]["anim_alpha_out"](this["player_cells"][s]["container"], {
                                    x: 80
                                }, 150, 0, null);
                            d["UIBase"]["anim_alpha_out"](this["btn_ok"], {}, 150),
                                d["UIBase"]["anim_alpha_out"](this["container_right"], {
                                    x: 20
                                }, 150),
                                Laya["timer"].once(200, this, function () {
                                    m["locking"] = !1,
                                        m["enable"] = !1,
                                        i && i.run();
                                }),
                                document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        j["prototype"]["onDisbale"] = function () {
                            Laya["timer"]["clearAll"](this);
                            for (var d = 0; d < this["player_cells"]["length"]; d++)
                                Laya["loader"]["clearTextureRes"](this["player_cells"][d]["illust"].skin);
                            document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        j["prototype"]["switchReady"] = function () {
                            this["owner_id"] != GameMgr.Inst["account_id"] && (this["beReady"] = !this["beReady"], this["btn_ok"].skin = game["Tools"]["localUISrc"](this["beReady"] ? this["skin_cancel"] : this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_dress"], this["beReady"]), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: this["beReady"],
                                dressing: !1
                            }, function () { }));
                        },
                        j["prototype"]["getStart"] = function () {
                            this["owner_id"] == GameMgr.Inst["account_id"] && (Laya["timer"]["currTimer"] < this["last_start_room"] + 2000 || (this["last_start_room"] = Laya["timer"]["currTimer"], app["NetAgent"]["sendReq2Lobby"]("Lobby", "startRoom", {}, function (i, m) {
                                (i || m["error"]) && d["UIMgr"].Inst["showNetReqError"]("startRoom", i, m);
                            })));
                        },
                        j["prototype"]["kickPlayer"] = function (i) {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                var m = this["players"][i];
                                1 == m["category"] ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "kickPlayer", {
                                    account_id: this["players"][i]["account_id"]
                                }, function () { }) : 2 == m["category"] && (this["pre_choose"] = m, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: this["robot_count"] - 1
                                }, function (i, m) {
                                    (i || m["error"]) && d["UIMgr"].Inst["showNetReqError"]("modifyRoom_minus", i, m);
                                }));
                            }
                        },
                        j["prototype"]["_clearCell"] = function (d) {
                            if (!(0 > d || d >= this["player_cells"]["length"])) {
                                var i = this["player_cells"][d];
                                i["container_flag"]["visible"] = !1,
                                    i["container_illust"]["visible"] = !1,
                                    i.name["visible"] = !1,
                                    i["container_name"]["visible"] = !1,
                                    i["btn_t"]["visible"] = !1,
                                    i.host["visible"] = !1;
                            }
                        },
                        j["prototype"]["_refreshPlayerInfo"] = function (d) {
                            var i = d["cell_index"];
                            if (!(0 > i || i >= this["player_cells"]["length"])) {
                                var m = this["player_cells"][i];
                                m["container_illust"]["visible"] = !0,
                                    m["container_name"]["visible"] = !0,
                                    m.name["visible"] = !0,
                                    game["Tools"]["SetNickname"](m.name, d),
                                    m["btn_t"]["visible"] = this["owner_id"] == GameMgr.Inst["account_id"] && d["account_id"] != GameMgr.Inst["account_id"],
                                    this["owner_id"] == d["account_id"] && (m["container_flag"]["visible"] = !0, m.host["visible"] = !0),
                                    d["account_id"] == GameMgr.Inst["account_id"] ? m["illust"]["setSkin"](d["avatar_id"], "waitingroom") : m["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](d["avatar_id"]), "waitingroom"),
                                    m["title"].id = game["Tools"]["titleLocalization"](d["account_id"], d["title"]),
                                    m.rank.id = d[this["room_mode"].mode < 10 ? "level" : "level3"].id,
                                    this["_onPlayerReadyChange"](d);
                            }
                        },
                        j["prototype"]["_onPlayerReadyChange"] = function (d) {
                            var i = d["cell_index"];
                            if (!(0 > i || i >= this["player_cells"]["length"])) {
                                var m = this["player_cells"][i];
                                m["container_flag"]["visible"] = this["owner_id"] == d["account_id"] ? !0 : d["ready"];
                            }
                        },
                        j["prototype"]["refreshAsOwner"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                for (var d = 0, i = 0; i < this["players"]["length"]; i++)
                                    0 != this["players"][i]["category"] && (this["_refreshPlayerInfo"](this["players"][i]), d++);
                                this["btn_add_robot"]["visible"] = !0,
                                    this["btn_invite_friend"]["visible"] = !0,
                                    game["Tools"]["setGrayDisable"](this["btn_invite_friend"], d == this["max_player_count"]),
                                    game["Tools"]["setGrayDisable"](this["btn_add_robot"], d == this["max_player_count"]),
                                    this["refreshStart"]();
                            }
                        },
                        j["prototype"]["refreshStart"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]),
                                    game["Tools"]["setGrayDisable"](this["btn_dress"], !1);
                                for (var d = 0, i = 0; i < this["players"]["length"]; i++) {
                                    var m = this["players"][i];
                                    if (!m || 0 == m["category"])
                                        break;
                                    (m["account_id"] == this["owner_id"] || m["ready"]) && d++;
                                }
                                if (game["Tools"]["setGrayDisable"](this["btn_ok"], d != this["max_player_count"]), this["enable"]) {
                                    for (var s = 0, i = 0; i < this["max_player_count"]; i++) {
                                        var D = this["player_cells"][i];
                                        D && D["container_flag"]["visible"] && s++;
                                    }
                                    if (d != s && !this["posted"]) {
                                        this["posted"] = !0;
                                        var j = {};
                                        j["okcount"] = d,
                                            j["okcount2"] = s,
                                            j.msgs = [];
                                        var L = 0,
                                            O = this["pre_msgs"]["length"] - 1;
                                        if (-1 != this["msg_tail"] && (L = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], O = this["msg_tail"]), L >= 0 && O >= 0) {
                                            for (var i = L; i != O; i = (i + 1) % this["pre_msgs"]["length"])
                                                j.msgs.push(this["pre_msgs"][i]);
                                            j.msgs.push(this["pre_msgs"][O]);
                                        }
                                        GameMgr.Inst["postInfo2Server"]("waitroom_err2", j, !1);
                                    }
                                }
                            }
                        },
                        j["prototype"]["onGameStart"] = function (d) {
                            game["Tools"]["setGrayDisable"](this["btn_ok"], !0),
                                this["enable"] = !1,
                                game["MJNetMgr"].Inst["OpenConnect"](d["connect_token"], d["game_uuid"], d["location"], !1, null);
                        },
                        j["prototype"]["onEnable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !0);
                        },
                        j["prototype"]["onDisable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !1);
                        },
                        j.Inst = null,
                        j;
                }
                    (d["UIBase"]);
            d["UI_WaitingRoom"] = D;
        }
            (uiscript || (uiscript = {}));


        // 保存装扮
        !function (d) {
            var i;
            !function (i) {
                var m = function () {
                    function m(m, s, D) {
                        var j = this;
                        this["page_items"] = null,
                            this["page_headframe"] = null,
                            this["page_desktop"] = null,
                            this["page_bgm"] = null,
                            this.tabs = [],
                            this["tab_index"] = -1,
                            this["select_index"] = -1,
                            this["cell_titles"] = [2193, 2194, 2195, 1901, 2214, 2624, 2856, 2412, 2413, 2826],
                            this["cell_names"] = [411, 412, 413, 417, 414, 415, 416, 0, 0, 0],
                            this["cell_default_img"] = ["myres/sushe/slot_liqibang.jpg", "myres/sushe/slot_hule.jpg", "myres/sushe/slot_liqi.jpg", "myres/sushe/slot_mpzs.jpg", "myres/sushe/slot_hand.jpg", "myres/sushe/slot_liqibgm.jpg", "myres/sushe/slot_head_frame.jpg", '', '', ''],
                            this["cell_default_item"] = [0, 0, 0, 0, 0, 0, "305501", "305044", "305045", "307001"],
                            this["slot_ids"] = [0, 1, 2, 10, 3, 4, 5, 6, 7, 8],
                            this["slot_map"] = {},
                            this["_changed"] = !1,
                            this["_locking"] = null,
                            this["_locking"] = D,
                            this["container_zhuangban0"] = m,
                            this["container_zhuangban1"] = s;
                        for (var L = this["container_zhuangban0"]["getChildByName"]("tabs"), O = function (i) {
                            var m = L["getChildAt"](i);
                            X.tabs.push(m),
                                m["clickHandler"] = new Laya["Handler"](X, function () {
                                    j["locking"] || j["tab_index"] != i && (j["_changed"] ? d["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](j, function () {
                                        j["change_tab"](i);
                                    }), null) : j["change_tab"](i));
                                });
                        }, X = this, Y = 0; Y < L["numChildren"]; Y++)
                            O(Y);
                        this["page_items"] = new i["Page_Items"](this["container_zhuangban1"]["getChildByName"]("page_items")),
                            this["page_headframe"] = new i["Page_Headframe"](this["container_zhuangban1"]["getChildByName"]("page_headframe")),
                            this["page_bgm"] = new i["Page_Bgm"](this["container_zhuangban1"]["getChildByName"]("page_bgm")),
                            this["page_desktop"] = new i["Page_Desktop"](this["container_zhuangban1"]["getChildByName"]("page_zhuobu")),
                            this["scrollview"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_view"])),
                            this["scrollview"]["setElastic"](),
                            this["btn_using"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_using"),
                            this["btn_save"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_save"),
                            this["btn_save"]["clickHandler"] = new Laya["Handler"](this, function () {
                                for (var i = [], m = 0; m < j["cell_titles"]["length"]; m++) {
                                    var s = j["slot_ids"][m];
                                    if (j["slot_map"][s]) {
                                        var D = j["slot_map"][s];
                                        if (!D || D == j["cell_default_item"][m])
                                            continue;
                                        i.push({
                                            slot: s,
                                            item_id: D
                                        });
                                    }
                                }
                                j["btn_save"]["mouseEnabled"] = !1;
                                var L = j["tab_index"];
                                //app["NetAgent"]["sendReq2Lobby"]("Lobby", "saveCommonViews", {
                                //    views: i,
                                //    save_index: L,
                                //    is_use: L == d["UI_Sushe"]["using_commonview_index"] ? 1 : 0
                                //}, function (m, s) {
                                //    if (j["btn_save"]["mouseEnabled"] = !0, m || s["error"])
                                //        d["UIMgr"].Inst["showNetReqError"]("saveCommonViews", m, s);
                                //    else {
                                if (d["UI_Sushe"]["commonViewList"]["length"] < L)
                                    for (var D = d["UI_Sushe"]["commonViewList"]["length"]; L >= D; D++)
                                        d["UI_Sushe"]["commonViewList"].push([]);
                                MMP.settings.commonViewList = d.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = d.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                if (d["UI_Sushe"]["commonViewList"][L] = i, d["UI_Sushe"]["using_commonview_index"] == L && j["onChangeGameView"](), j["tab_index"] != L)
                                    return;
                                j["btn_save"]["mouseEnabled"] = !0,
                                    j["_changed"] = !1,
                                    j["refresh_btn"]();
                                //    }
                                //});
                            }),
                            this["btn_use"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_use"),
                            this["btn_use"]["clickHandler"] = new Laya["Handler"](this, function () {
                                j["btn_use"]["mouseEnabled"] = !1;
                                var i = j["tab_index"];
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "useCommonView", {
                                    index: i
                                }, function (m, s) {
                                    j["btn_use"]["mouseEnabled"] = !0,
                                        m || s["error"] ? d["UIMgr"].Inst["showNetReqError"]("useCommonView", m, s) : (d["UI_Sushe"]["using_commonview_index"] = i, j["refresh_btn"](), j["refresh_tab"](), j["onChangeGameView"]());
                                });
                            });
                    }
                    return Object["defineProperty"](m["prototype"], "locking", {
                        get: function () {
                            return this["_locking"] ? this["_locking"].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object["defineProperty"](m["prototype"], "changed", {
                            get: function () {
                                return this["_changed"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        m["prototype"].show = function (i) {
                            game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !0),
                                this["container_zhuangban0"]["visible"] = !0,
                                this["container_zhuangban1"]["visible"] = !0,
                                i ? (this["container_zhuangban0"]["alpha"] = 1, this["container_zhuangban1"]["alpha"] = 1) : (d["UIBase"]["anim_alpha_in"](this["container_zhuangban0"], {
                                    x: 0
                                }, 200), d["UIBase"]["anim_alpha_in"](this["container_zhuangban1"], {
                                    x: 0
                                }, 200)),
                                this["change_tab"](d["UI_Sushe"]["using_commonview_index"]);
                        },
                        m["prototype"]["change_tab"] = function (i) {
                            if (this["tab_index"] = i, this["refresh_tab"](), this["slot_map"] = {}, this["scrollview"]["reset"](), this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["select_index"] = 0, this["_changed"] = !1, !(this["tab_index"] < 0 || this["tab_index"] > 4)) {
                                if (this["tab_index"] < d["UI_Sushe"]["commonViewList"]["length"])
                                    for (var m = d["UI_Sushe"]["commonViewList"][this["tab_index"]], s = 0; s < m["length"]; s++)
                                        this["slot_map"][m[s].slot] = m[s]["item_id"];
                                this["scrollview"]["addItem"](this["cell_titles"]["length"]),
                                    this["onChangeSlotSelect"](0),
                                    this["refresh_btn"]();
                            }
                        },
                        m["prototype"]["refresh_tab"] = function () {
                            for (var i = 0; i < this.tabs["length"]; i++) {
                                var m = this.tabs[i];
                                m["mouseEnabled"] = this["tab_index"] != i,
                                    m["getChildByName"]('bg').skin = game["Tools"]["localUISrc"](this["tab_index"] == i ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                    m["getChildByName"]("num")["color"] = this["tab_index"] == i ? "#2f1e19" : "#f2c797";
                                var s = m["getChildByName"]("choosed");
                                d["UI_Sushe"]["using_commonview_index"] == i ? (s["visible"] = !0, s.x = this["tab_index"] == i ? -18 : -4) : s["visible"] = !1;
                            }
                        },
                        m["prototype"]["refresh_btn"] = function () {
                            this["btn_save"]["visible"] = !1,
                                this["btn_save"]["mouseEnabled"] = !0,
                                this["btn_use"]["visible"] = !1,
                                this["btn_use"]["mouseEnabled"] = !0,
                                this["btn_using"]["visible"] = !1,
                                this["_changed"] ? this["btn_save"]["visible"] = !0 : (this["btn_use"]["visible"] = d["UI_Sushe"]["using_commonview_index"] != this["tab_index"], this["btn_using"]["visible"] = d["UI_Sushe"]["using_commonview_index"] == this["tab_index"]);
                        },
                        m["prototype"]["onChangeSlotSelect"] = function (d) {
                            var i = this;
                            this["select_index"] = d;
                            var m = 0;
                            d >= 0 && d < this["cell_default_item"]["length"] && (m = this["cell_default_item"][d]);
                            var s = m,
                                D = this["slot_ids"][d];
                            this["slot_map"][D] && (s = this["slot_map"][D]);
                            var j = Laya["Handler"]["create"](this, function (s) {
                                s == m && (s = 0),
                                    i["slot_map"][D] = s,
                                    i["scrollview"]["wantToRefreshItem"](d),
                                    i["_changed"] = !0,
                                    i["refresh_btn"]();
                            }, null, !1);
                            this["page_items"]["close"](),
                                this["page_desktop"]["close"](),
                                this["page_headframe"]["close"](),
                                this["page_bgm"]["close"]();
                            var L = game["Tools"]["strOfLocalization"](this["cell_titles"][d]);
                            if (d >= 0 && 2 >= d)
                                this["page_items"].show(L, d, s, j);
                            else if (3 == d)
                                this["page_items"].show(L, 10, s, j);
                            else if (4 == d)
                                this["page_items"].show(L, 3, s, j);
                            else if (5 == d)
                                this["page_bgm"].show(L, s, j);
                            else if (6 == d)
                                this["page_headframe"].show(L, s, j);
                            else if (7 == d || 8 == d) {
                                var O = this["cell_default_item"][7],
                                    X = this["cell_default_item"][8];
                                this["slot_map"][game["EView"]["desktop"]] && (O = this["slot_map"][game["EView"]["desktop"]]),
                                    this["slot_map"][game["EView"].mjp] && (X = this["slot_map"][game["EView"].mjp]),
                                    7 == d ? this["page_desktop"]["show_desktop"](L, O, X, j) : this["page_desktop"]["show_mjp"](L, O, X, j);
                            } else
                                9 == d && this["page_desktop"]["show_lobby_bg"](L, s, j);
                        },
                        m["prototype"]["render_view"] = function (d) {
                            var i = this,
                                m = d["container"],
                                s = d["index"],
                                D = m["getChildByName"]("cell");
                            this["select_index"] == s ? (D["scaleX"] = D["scaleY"] = 1.05, D["getChildByName"]("choosed")["visible"] = !0) : (D["scaleX"] = D["scaleY"] = 1, D["getChildByName"]("choosed")["visible"] = !1),
                                D["getChildByName"]("title").text = game["Tools"]["strOfLocalization"](this["cell_titles"][s]);
                            var j = D["getChildByName"]("name"),
                                L = D["getChildByName"]("icon"),
                                O = this["cell_default_item"][s],
                                X = this["slot_ids"][s];
                            this["slot_map"][X] && (O = this["slot_map"][X]);
                            var Y = cfg["item_definition"].item.get(O);
                            Y ? (j.text = Y["name_" + GameMgr["client_language"]], game["LoadMgr"]["setImgSkin"](L, Y.icon, null, "UI_Sushe_Select.Zhuangban")) : (j.text = game["Tools"]["strOfLocalization"](this["cell_names"][s]), game["LoadMgr"]["setImgSkin"](L, this["cell_default_img"][s], null, "UI_Sushe_Select.Zhuangban"));
                            var B = D["getChildByName"]("btn");
                            B["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["locking"] || i["select_index"] != s && (i["onChangeSlotSelect"](s), i["scrollview"]["wantToRefreshAll"]());
                            }, null, !1),
                                B["mouseEnabled"] = this["select_index"] != s;
                        },
                        m["prototype"]["close"] = function (i) {
                            var m = this;
                            this["container_zhuangban0"]["visible"] && (i ? (this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["container_zhuangban0"]["visible"] = !1, this["container_zhuangban1"]["visible"] = !1, game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1)) : (d["UIBase"]["anim_alpha_out"](this["container_zhuangban0"], {
                                x: 0
                            }, 200), d["UIBase"]["anim_alpha_out"](this["container_zhuangban1"], {
                                x: 0
                            }, 200, 0, Laya["Handler"]["create"](this, function () {
                                m["page_items"]["close"](),
                                    m["page_desktop"]["close"](),
                                    m["page_headframe"]["close"](),
                                    m["page_bgm"]["close"](),
                                    m["container_zhuangban0"]["visible"] = !1,
                                    m["container_zhuangban1"]["visible"] = !1,
                                    game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1);
                            }))));
                        },
                        m["prototype"]["onChangeGameView"] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = d.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            GameMgr.Inst["load_mjp_view"]();
                            var i = game["GameUtility"]["get_view_id"](game["EView"]["lobby_bg"]);
                            d["UI_Lite_Loading"].Inst.show(),
                                game["Scene_Lobby"].Inst["set_lobby_bg"](i, Laya["Handler"]["create"](this, function () {
                                    d["UI_Lite_Loading"].Inst["enable"] && d["UI_Lite_Loading"].Inst["close"]();
                                })),
                                GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_id"](game["EView"]["head_frame"]);
                        },
                        m;
                }
                    ();
                i["Container_Zhuangban"] = m;
            }
                (i = d["zhuangban"] || (d["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));



        // 设置称号
        !function (d) {
            var i = function (i) {
                function m() {
                    var d = i.call(this, new ui["lobby"]["titlebookUI"]()) || this;
                    return d["_root"] = null,
                        d["_scrollview"] = null,
                        d["_blackmask"] = null,
                        d["_locking"] = !1,
                        d["_showindexs"] = [],
                        m.Inst = d,
                        d;
                }
                return __extends(m, i),
                    m.Init = function () {
                        var i = this;
                        // 获取称号
                        //app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchTitleList", {}, function (m, s) {
                        //    if (m || s["error"])
                        //        d["UIMgr"].Inst["showNetReqError"]("fetchTitleList", m, s);
                        //    else {
                        i["owned_title"] = [];
                        for (let a of cfg.item_definition.title.rows_) {
                            var j = a.id;
                            cfg["item_definition"]["title"].get(j) && i["owned_title"].push(j),
                                "600005" == j && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1),
                                j >= "600005" && "600015" >= j && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + j - "600005", 1);
                        }
                        //        }
                        //    }
                        //});
                    },
                    m["title_update"] = function (i) {
                        for (var m = 0; m < i["new_titles"]["length"]; m++)
                            cfg["item_definition"]["title"].get(i["new_titles"][m]) && this["owned_title"].push(i["new_titles"][m]), "600005" == i["new_titles"][m] && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1), i["new_titles"][m] >= "600005" && i["new_titles"][m] <= "600015" && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + i["new_titles"][m] - "600005", 1);
                        if (i["remove_titles"] && i["remove_titles"]["length"] > 0) {
                            for (var m = 0; m < i["remove_titles"]["length"]; m++) {
                                for (var s = i["remove_titles"][m], D = 0; D < this["owned_title"]["length"]; D++)
                                    if (this["owned_title"][D] == s) {
                                        this["owned_title"][D] = this["owned_title"][this["owned_title"]["length"] - 1],
                                            this["owned_title"].pop();
                                        break;
                                    }
                                s == GameMgr.Inst["account_data"]["title"] && (GameMgr.Inst["account_data"]["title"] = "600001", d["UI_Lobby"].Inst["enable"] && d["UI_Lobby"].Inst.top["refresh"](), d["UI_PlayerInfo"].Inst["enable"] && d["UI_PlayerInfo"].Inst["refreshBaseInfo"]());
                            }
                            this.Inst["enable"] && this.Inst.show();
                        }
                    },
                    m["prototype"]["onCreate"] = function () {
                        var i = this;
                        this["_root"] = this.me["getChildByName"]("root"),
                            this["_blackmask"] = new d["UI_BlackMask"](this.me["getChildByName"]("bmask"), Laya["Handler"]["create"](this, function () {
                                return i["_locking"];
                            }, null, !1), Laya["Handler"]["create"](this, this["close"], null, !1)),
                            this["_scrollview"] = this["_root"]["getChildByName"]("content")["scriptMap"]["capsui.CScrollView"],
                            this["_scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function (d) {
                                i["setItemValue"](d["index"], d["container"]);
                            }, null, !1)),
                            this["_root"]["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                i["_locking"] || (i["_blackmask"].hide(), i["close"]());
                            }, null, !1),
                            this["_noinfo"] = this["_root"]["getChildByName"]("noinfo");
                    },
                    m["prototype"].show = function () {
                        var i = this;
                        if (this["_locking"] = !0, this["enable"] = !0, this["_blackmask"].show(), m["owned_title"]["length"] > 0) {
                            this["_showindexs"] = [];
                            for (var s = 0; s < m["owned_title"]["length"]; s++)
                                this["_showindexs"].push(s);
                            this["_showindexs"] = this["_showindexs"].sort(function (d, i) {
                                var s = d,
                                    D = cfg["item_definition"]["title"].get(m["owned_title"][d]);
                                D && (s += 1000 * D["priority"]);
                                var j = i,
                                    L = cfg["item_definition"]["title"].get(m["owned_title"][i]);
                                return L && (j += 1000 * L["priority"]),
                                    j - s;
                            }),
                                this["_scrollview"]["reset"](),
                                this["_scrollview"]["addItem"](m["owned_title"]["length"]),
                                this["_scrollview"].me["visible"] = !0,
                                this["_noinfo"]["visible"] = !1;
                        } else
                            this["_noinfo"]["visible"] = !0, this["_scrollview"].me["visible"] = !1;
                        d["UIBase"]["anim_pop_out"](this["_root"], Laya["Handler"]["create"](this, function () {
                            i["_locking"] = !1;
                        }));
                    },
                    m["prototype"]["close"] = function () {
                        var i = this;
                        this["_locking"] = !0,
                            d["UIBase"]["anim_pop_hide"](this["_root"], Laya["Handler"]["create"](this, function () {
                                i["_locking"] = !1,
                                    i["enable"] = !1;
                            }));
                    },
                    m["prototype"]["onEnable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !0);
                    },
                    m["prototype"]["onDisable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !1),
                            this["_scrollview"]["reset"]();
                    },
                    m["prototype"]["setItemValue"] = function (d, i) {
                        var s = this;
                        if (this["enable"]) {
                            var D = m["owned_title"][this["_showindexs"][d]],
                                j = cfg["item_definition"]["title"].find(D);
                            game["LoadMgr"]["setImgSkin"](i["getChildByName"]("img_title"), j.icon, null, "UI_TitleBook"),
                                i["getChildByName"]("using")["visible"] = D == GameMgr.Inst["account_data"]["title"],
                                i["getChildByName"]("desc").text = j["desc_" + GameMgr["client_language"]];
                            var L = i["getChildByName"]("btn");
                            L["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                D != GameMgr.Inst["account_data"]["title"] ? (s["changeTitle"](d), i["getChildByName"]("using")["visible"] = !0) : (s["changeTitle"](-1), i["getChildByName"]("using")["visible"] = !1);
                            }, null, !1);
                            var O = i["getChildByName"]("time"),
                                X = i["getChildByName"]("img_title");
                            if (1 == j["unlock_type"]) {
                                var Y = j["unlock_param"][0],
                                    B = cfg["item_definition"].item.get(Y);
                                O.text = game["Tools"]["strOfLocalization"](3121) + B["expire_desc_" + GameMgr["client_language"]],
                                    O["visible"] = !0,
                                    X.y = 0;
                            } else
                                O["visible"] = !1, X.y = 10;
                        }
                    },
                    m["prototype"]["changeTitle"] = function (i) {
                        var s = this,
                            D = GameMgr.Inst["account_data"]["title"],
                            j = 0;
                        j = i >= 0 && i < this["_showindexs"]["length"] ? m["owned_title"][this["_showindexs"][i]] : "600001",
                            GameMgr.Inst["account_data"]["title"] = j;
                        for (var L = -1, O = 0; O < this["_showindexs"]["length"]; O++)
                            if (D == m["owned_title"][this["_showindexs"][O]]) {
                                L = O;
                                break;
                            }
                        d["UI_Lobby"].Inst["enable"] && d["UI_Lobby"].Inst.top["refresh"](),
                            d["UI_PlayerInfo"].Inst["enable"] && d["UI_PlayerInfo"].Inst["refreshBaseInfo"](),
                            -1 != L && this["_scrollview"]["wantToRefreshItem"](L),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = T;
                        MMP.saveSettings();
                        //app["NetAgent"]["sendReq2Lobby"]("Lobby", "useTitle", {
                        //    title: "600001" == j ? 0 : j
                        //}, function (m, j) {
                        //    (m || j["error"]) && (d["UIMgr"].Inst["showNetReqError"]("useTitle", m, j), GameMgr.Inst["account_data"]["title"] = D, d["UI_Lobby"].Inst["enable"] && d["UI_Lobby"].Inst.top["refresh"](), d["UI_PlayerInfo"].Inst["enable"] && d["UI_PlayerInfo"].Inst["refreshBaseInfo"](), s["enable"] && (i >= 0 && i < s["_showindexs"]["length"] && s["_scrollview"]["wantToRefreshItem"](i), L >= 0 && L < s["_showindexs"]["length"] && s["_scrollview"]["wantToRefreshItem"](L)));
                        //});
                    },
                    m.Inst = null,
                    m["owned_title"] = [],
                    m;
            }
                (d["UIBase"]);
            d["UI_TitleBook"] = i;
        }
            (uiscript || (uiscript = {}));


        // 友人房调整装扮
        !function (d) {
            var i;
            !function (i) {
                var m = function () {
                    function m(d) {
                        this["scrollview"] = null,
                            this["page_skin"] = null,
                            this["chara_infos"] = [],
                            this["choosed_chara_index"] = 0,
                            this["choosed_skin_id"] = 0,
                            this["star_char_count"] = 0,
                            this.me = d,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this.me["getChildByName"]("left")["visible"] = !0, this.me["getChildByName"]("left_en")["visible"] = !1, this["scrollview"] = this.me["getChildByName"]("left")["scriptMap"]["capsui.CScrollView"]) : (this.me["getChildByName"]("left")["visible"] = !1, this.me["getChildByName"]("left_en")["visible"] = !0, this["scrollview"] = this.me["getChildByName"]("left_en")["scriptMap"]["capsui.CScrollView"]),
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                            this["scrollview"]["setElastic"](),
                            this["page_skin"] = new i["Page_Skin"](this.me["getChildByName"]("right"));
                    }
                    return m["prototype"].show = function (i) {
                        var m = this;
                        this.me["visible"] = !0,
                            i ? this.me["alpha"] = 1 : d["UIBase"]["anim_alpha_in"](this.me, {
                                x: 0
                            }, 200, 0),
                            this["choosed_chara_index"] = 0,
                            this["chara_infos"] = [];
                        for (var s = 0, D = d["UI_Sushe"]["star_chars"]; s < D["length"]; s++)
                            for (var j = D[s], L = 0; L < d["UI_Sushe"]["characters"]["length"]; L++)
                                if (!d["UI_Sushe"]["hidden_characters_map"][j] && d["UI_Sushe"]["characters"][L]["charid"] == j) {
                                    this["chara_infos"].push({
                                        chara_id: d["UI_Sushe"]["characters"][L]["charid"],
                                        skin_id: d["UI_Sushe"]["characters"][L].skin,
                                        is_upgraded: d["UI_Sushe"]["characters"][L]["is_upgraded"]
                                    }),
                                        d["UI_Sushe"]["main_character_id"] == d["UI_Sushe"]["characters"][L]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1);
                                    break;
                                }
                        this["star_char_count"] = this["chara_infos"]["length"];
                        for (var L = 0; L < d["UI_Sushe"]["characters"]["length"]; L++)
                            d["UI_Sushe"]["hidden_characters_map"][d["UI_Sushe"]["characters"][L]["charid"]] || -1 == d["UI_Sushe"]["star_chars"]["indexOf"](d["UI_Sushe"]["characters"][L]["charid"]) && (this["chara_infos"].push({
                                chara_id: d["UI_Sushe"]["characters"][L]["charid"],
                                skin_id: d["UI_Sushe"]["characters"][L].skin,
                                is_upgraded: d["UI_Sushe"]["characters"][L]["is_upgraded"]
                            }), d["UI_Sushe"]["main_character_id"] == d["UI_Sushe"]["characters"][L]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1));
                        this["choosed_skin_id"] = this["chara_infos"][this["choosed_chara_index"]]["skin_id"],
                            this["scrollview"]["reset"](),
                            this["scrollview"]["addItem"](this["chara_infos"]["length"]);
                        var O = this["chara_infos"][this["choosed_chara_index"]];
                        this["page_skin"].show(O["chara_id"], O["skin_id"], Laya["Handler"]["create"](this, function (d) {
                            m["choosed_skin_id"] = d,
                                O["skin_id"] = d,
                                m["scrollview"]["wantToRefreshItem"](m["choosed_chara_index"]);
                        }, null, !1));
                    },
                        m["prototype"]["render_character_cell"] = function (i) {
                            var m = this,
                                s = i["index"],
                                D = i["container"],
                                j = i["cache_data"];
                            j["index"] = s;
                            var L = this["chara_infos"][s];
                            j["inited"] || (j["inited"] = !0, j.skin = new d["UI_Character_Skin"](D["getChildByName"]("btn")["getChildByName"]("head")), j["bound"] = D["getChildByName"]("btn")["getChildByName"]("bound"));
                            var O = D["getChildByName"]("btn");
                            O["getChildByName"]("choose")["visible"] = s == this["choosed_chara_index"],
                                j.skin["setSkin"](L["skin_id"], "bighead"),
                                O["getChildByName"]("using")["visible"] = s == this["choosed_chara_index"],
                                O["getChildByName"]("label_name").text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].find(L["chara_id"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].find(L["chara_id"])["name_" + GameMgr["client_language"]],
                                O["getChildByName"]("star") && (O["getChildByName"]("star")["visible"] = s < this["star_char_count"]);
                            var X = cfg["item_definition"]["character"].get(L["chara_id"]);
                            'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? j["bound"].skin = X.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (L["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (L["is_upgraded"] ? "2.png" : ".png")) : X.ur ? (j["bound"].pos(-10, -2), j["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (L["is_upgraded"] ? "6.png" : "5.png"))) : (j["bound"].pos(4, 20), j["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (L["is_upgraded"] ? "4.png" : "3.png"))),
                                O["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (L["is_upgraded"] ? "2.png" : ".png")),
                                D["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                    if (s != m["choosed_chara_index"]) {
                                        var d = m["choosed_chara_index"];
                                        m["choosed_chara_index"] = s,
                                            m["choosed_skin_id"] = L["skin_id"],
                                            m["page_skin"].show(L["chara_id"], L["skin_id"], Laya["Handler"]["create"](m, function (d) {
                                                m["choosed_skin_id"] = d,
                                                    L["skin_id"] = d,
                                                    j.skin["setSkin"](d, "bighead");
                                            }, null, !1)),
                                            m["scrollview"]["wantToRefreshItem"](d),
                                            m["scrollview"]["wantToRefreshItem"](s);
                                    }
                                });
                        },
                        m["prototype"]["close"] = function (i) {
                            var m = this;
                            if (this.me["visible"])
                                if (i)
                                    this.me["visible"] = !1;
                                else {
                                    var s = this["chara_infos"][this["choosed_chara_index"]];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //s["chara_id"] != d["UI_Sushe"]["main_character_id"] && (app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                    //        character_id: s["chara_id"]
                                    //    }, function () {}), d["UI_Sushe"]["main_character_id"] = s["chara_id"]),
                                    d.UI_Sushe.main_character_id = s.chara_id
                                    //this["choosed_skin_id"] != GameMgr.Inst["account_data"]["avatar_id"] && app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                                    //    character_id: s["chara_id"],
                                    //    skin: this["choosed_skin_id"]
                                    //}, function () {});
                                    // END
                                    for (var D = 0; D < d["UI_Sushe"]["characters"]["length"]; D++)
                                        if (d["UI_Sushe"]["characters"][D]["charid"] == s["chara_id"]) {
                                            d["UI_Sushe"]["characters"][D].skin = this["choosed_skin_id"];
                                            break;
                                        }
                                    GameMgr.Inst["account_data"]["avatar_id"] = this["choosed_skin_id"],
                                        d["UIBase"]["anim_alpha_out"](this.me, {
                                            x: 0
                                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                                            m.me["visible"] = !1;
                                        }));
                                }
                        },
                        m;
                }
                    ();
                i["Page_Waiting_Head"] = m;
            }
                (i = d["zhuangban"] || (d["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));



        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var d = GameMgr;
            var i = this;
            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountInfo", {}, function (m, s) {
                if (m || s["error"])
                    uiscript["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", m, s);
                else {
                    app.Log.log("UpdateAccount: " + JSON["stringify"](s)),
                        d.Inst["account_refresh_time"] = Laya["timer"]["currTimer"];
                    // 对局结束更新数据
                    s.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    s.account.title = GameMgr.Inst.account_data.title;
                    s.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        s.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var D in s["account"]) {
                        if (d.Inst["account_data"][D] = s["account"][D], "platform_diamond" == D)
                            for (var j = s["account"][D], L = 0; L < j["length"]; L++)
                                i["account_numerical_resource"][j[L].id] = j[L]["count"];
                        if ("skin_ticket" == D && (d.Inst["account_numerical_resource"]["100004"] = s["account"][D]), "platform_skin_ticket" == D)
                            for (var j = s["account"][D], L = 0; L < j["length"]; L++)
                                i["account_numerical_resource"][j[L].id] = j[L]["count"];
                    }
                    uiscript["UI_Lobby"].Inst["refreshInfo"](),
                        s["account"]["room_id"] && d.Inst["updateRoom"](),
                        "10102" === d.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_2"], 1),
                        "10103" === d.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_3"], 1);
                }
            });
        }


        GameMgr.Inst.checkPaiPu = function (i, m, s) {
            var D = GameMgr.Inst;
            var d = GameMgr;
            return i = i.trim(),
                app.Log.log("checkPaiPu game_uuid:" + i + " account_id:" + m["toString"]() + " paipu_config:" + s),
                this["duringPaipu"] ? (app.Log["Error"]("已经在看牌谱了"), void 0) : (this["duringPaipu"] = !0, uiscript["UI_Loading"].Inst.show("enter_mj"), d.Inst["onLoadStart"]("paipu"), 2 & s && (i = game["Tools"]["DecodePaipuUUID"](i)), this["record_uuid"] = i, app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecord", {
                    game_uuid: i,
                    client_version_string: this["getClientVersion"]()
                }, function (j, L) {
                    if (j || L["error"])
                        uiscript["UIMgr"].Inst["showNetReqError"]("fetchGameRecord", j, L), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), D["duringPaipu"] = !1;
                    else {
                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                        var O = L.head,
                            X = [null, null, null, null],
                            Y = game["Tools"]["strOfLocalization"](2003),
                            B = O["config"].mode;
                        if (d["inRelease"] && B["testing_environment"] && B["testing_environment"]["paixing"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](3169)), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), D["duringPaipu"] = !1, void 0;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "readGameRecord", {
                            game_uuid: i,
                            client_version_string: D["getClientVersion"]()
                        }, function () { }),
                            B["extendinfo"] && (Y = game["Tools"]["strOfLocalization"](2004)),
                            B["detail_rule"] && B["detail_rule"]["ai_level"] && (1 === B["detail_rule"]["ai_level"] && (Y = game["Tools"]["strOfLocalization"](2003)), 2 === B["detail_rule"]["ai_level"] && (Y = game["Tools"]["strOfLocalization"](2004)));
                        var w = !1;
                        O["end_time"] ? (D["record_end_time"] = O["end_time"], O["end_time"] > "1576112400" && (w = !0)) : D["record_end_time"] = -1,
                            D["record_start_time"] = O["start_time"] ? O["start_time"] : -1;
                        for (var N = 0; N < O["accounts"]["length"]; N++) {
                            var g = O["accounts"][N];
                            if (g["character"]) {
                                var q = g["character"],
                                    U = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (q.account_id == GameMgr.Inst.account_id) {
                                        q.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        q.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        q.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        q.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        q.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            q.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (q.avatar_id == 400101 || q.avatar_id == 400201)) {
                                        //玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            q.avatar_id = skin.id;
                                            q.character.charid = skin.character_id;
                                            q.character.skin = skin.id;
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
                                if (w) {
                                    var Z = g["views"];
                                    if (Z)
                                        for (var a = 0; a < Z["length"]; a++)
                                            U[Z[a].slot] = Z[a]["item_id"];
                                } else {
                                    var b = q["views"];
                                    if (b)
                                        for (var a = 0; a < b["length"]; a++) {
                                            var T = b[a].slot,
                                                J = b[a]["item_id"],
                                                I = T - 1;
                                            U[I] = J;
                                        }
                                }
                                var z = [];
                                for (var _ in U)
                                    z.push({
                                        slot: parseInt(_),
                                        item_id: U[_]
                                    });
                                g["views"] = z,
                                    X[g.seat] = g;
                            } else
                                g["character"] = {
                                    charid: g["avatar_id"],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg["item_definition"]["character"].get(g["avatar_id"])["init_skin"],
                                    is_upgraded: !1
                                },
                                    g["avatar_id"] = g["character"].skin,
                                    g["views"] = [],
                                    X[g.seat] = g;
                        }
                        for (var u = game["GameUtility"]["get_default_ai_skin"](), t = game["GameUtility"]["get_default_ai_character"](), N = 0; N < X["length"]; N++)
                            if (null == X[N]) {
                                X[N] = {
                                    nickname: Y,
                                    avatar_id: u,
                                    level: {
                                        id: "10101"
                                    },
                                    level3: {
                                        id: "20101"
                                    },
                                    character: {
                                        charid: t,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: u,
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
                                            X[N].avatar_id = skin.id;
                                            X[N].character.charid = skin.character_id;
                                            X[N].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        X[N].nickname = '[BOT]' + X[N].nickname;
                                    }
                                }
                                // END
                                //    }
                            }
                        var x = Laya["Handler"]["create"](D, function (d) {
                            game["Scene_Lobby"].Inst["active"] && (game["Scene_Lobby"].Inst["active"] = !1),
                                game["Scene_MJ"].Inst["openMJRoom"](O["config"], X, Laya["Handler"]["create"](D, function () {
                                    D["duringPaipu"] = !1,
                                        view["DesktopMgr"].Inst["paipu_config"] = s,
                                        view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](O["config"])), X, m, view["EMJMode"]["paipu"], Laya["Handler"]["create"](D, function () {
                                            uiscript["UI_Replay"].Inst["initData"](d),
                                                uiscript["UI_Replay"].Inst["enable"] = !0,
                                                Laya["timer"].once(1000, D, function () {
                                                    D["EnterMJ"]();
                                                }),
                                                Laya["timer"].once(1500, D, function () {
                                                    view["DesktopMgr"]["player_link_state"] = [view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"]],
                                                        uiscript["UI_DesktopInfo"].Inst["refreshLinks"](),
                                                        uiscript["UI_Loading"].Inst["close"]();
                                                }),
                                                Laya["timer"].once(1000, D, function () {
                                                    uiscript["UI_Replay"].Inst["nextStep"](!0);
                                                });
                                        }));
                                }), Laya["Handler"]["create"](D, function (d) {
                                    return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.9 * d);
                                }, null, !1));
                        }),
                            C = {};
                        if (C["record"] = O, L.data && L.data["length"])
                            C.game = net["MessageWrapper"]["decodeMessage"](L.data), x["runWith"](C);
                        else {
                            var v = L["data_url"];
                            "chs_t" == d["client_type"] && (v = v["replace"]("maj-soul.com:9443", "maj-soul.net")),
                                game["LoadMgr"]["httpload"](v, "arraybuffer", !1, Laya["Handler"]["create"](D, function (d) {
                                    if (d["success"]) {
                                        var i = new Laya.Byte();
                                        i["writeArrayBuffer"](d.data);
                                        var m = net["MessageWrapper"]["decodeMessage"](i["getUint8Array"](0, i["length"]));
                                        C.game = m,
                                            x["runWith"](C);
                                    } else
                                        uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2005) + L["data_url"]), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), D["duringPaipu"] = !1;
                                }));
                        }
                    }
                }), void 0);
        }

        // 设置状态
        uiscript.UI_DesktopInfo.prototype.resetFunc = function () {
            var d = Laya["LocalStorage"]["getItem"]("autolipai"),
                i = !0;
            i = d && '' != d ? "true" == d : !0;
            var m = this["_container_fun"]["getChildByName"]("btn_autolipai");
            this["refreshFuncBtnShow"](m, i),
                Laya["LocalStorage"]["setItem"]("autolipai", i ? "true" : "false"),
                view["DesktopMgr"].Inst["setAutoLiPai"](i);
            var s = this["_container_fun"]["getChildByName"]("btn_autohu");
            this["refreshFuncBtnShow"](s, view["DesktopMgr"].Inst["auto_hule"]);
            var D = this["_container_fun"]["getChildByName"]("btn_autonoming");
            this["refreshFuncBtnShow"](D, view["DesktopMgr"].Inst["auto_nofulu"]);
            var j = this["_container_fun"]["getChildByName"]("btn_automoqie");
            this["refreshFuncBtnShow"](j, view["DesktopMgr"].Inst["auto_moqie"]),
                this["_container_fun"].x = -528,
                this["arrow"]["scaleX"] = -1;
            // 设置状态
            if (MMP.settings.setAuto.isSetAuto) {
                setAuto();
            }
            // END
        }
        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var i = uiscript.UI_Info;
            this["read_list"] = [],
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAnnouncement", {
                    lang: GameMgr["client_language"],
                    platform: GameMgr["inDmm"] ? "web_dmm" : "web"
                }, function (m, s) {
                    m || s["error"] ? d["UIMgr"].Inst["showNetReqError"]("fetchAnnouncement", m, s) : i["_refreshAnnouncements"](s);
                }),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnnouncementUpdate", Laya["Handler"]["create"](this, function (d) {
                    for (var m = GameMgr["inDmm"] ? "web_dmm" : "web", s = 0, D = d["update_list"]; s < D["length"]; s++) {
                        var j = D[s];
                        if (j.lang == GameMgr["client_language"] && j["platform"] == m) {
                            i["have_new_notice"] = !0;
                            break;
                        }
                    }
                }, null, !1));
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
        let testapi = testAPI();

        if (testapi['clear'] != true) {
            let showAPI = '';
            for (let item in testapi['apis']) {
                showAPI += item + ': ' + testapi['apis'][item] + '\n';
            }
            alert('[雀魂mod_plus]\n您的脚本管理器有不支持的API，可能会影响脚本使用，如果您有条件的话，请您更换对API支持较好的脚本管理器，具体请查看脚本使用说明！\n\n本脚本使用的API与支持如下：\n' + showAPI);

        }

    } catch (error) {
        console.log('[雀魂mod_plus] 等待游戏启动');
        setTimeout(majsoul_mod_plus, 1000);
    }
}
    ();

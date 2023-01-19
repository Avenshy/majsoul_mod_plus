// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.196
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
// @require      https://greasyfork.org/scripts/447737-majsoul-mod-plus/code/majsoul_mod_plus.js?version=1140234
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
        !function (Q) {
            var B;
            !function (Q) {
                Q[Q.none = 0] = "none",
                    Q[Q["daoju"] = 1] = "daoju",
                    Q[Q.gift = 2] = "gift",
                    Q[Q["fudai"] = 3] = "fudai",
                    Q[Q.view = 5] = "view";
            }
                (B = Q["EItemCategory"] || (Q["EItemCategory"] = {}));
            var V = function (V) {
                function W() {
                    var Q = V.call(this, new ui["lobby"]["bagUI"]()) || this;
                    return Q["container_top"] = null,
                        Q["container_content"] = null,
                        Q["locking"] = !1,
                        Q.tabs = [],
                        Q["page_item"] = null,
                        Q["page_gift"] = null,
                        Q["page_skin"] = null,
                        Q["page_cg"] = null,
                        Q["select_index"] = 0,
                        W.Inst = Q,
                        Q;
                }
                return __extends(W, V),
                    W.init = function () {
                        var Q = this;
                        app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function (B) {
                            var V = B["update"];
                            V && V.bag && (Q["update_data"](V.bag["update_items"]), Q["update_daily_gain_data"](V.bag));
                        }, null, !1)),
                            this["fetch"]();
                    },
                    W["fetch"] = function () {
                        var B = this;
                        this["_item_map"] = {},
                            this["_daily_gain_record"] = {},
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchBagInfo", {}, function (V, W) {
                                if (V || W["error"])
                                    Q["UIMgr"].Inst["showNetReqError"]("fetchBagInfo", V, W);
                                else {
                                    app.Log.log("背包信息：" + JSON["stringify"](W));
                                    var Z = W.bag;
                                    if (Z) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of _["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            B._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    B._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }


                                        } else {
                                            if (Z["items"])
                                                for (var S = 0; S < Z["items"]["length"]; S++) {
                                                    var v = Z["items"][S]["item_id"],
                                                        i = Z["items"][S]["stack"],
                                                        x = cfg["item_definition"].item.get(v);
                                                    x && (B["_item_map"][v] = {
                                                        item_id: v,
                                                        count: i,
                                                        category: x["category"]
                                                    }, 1 == x["category"] && 3 == x.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                                        item_id: v
                                                    }, function () { }));
                                                }
                                            if (Z["daily_gain_record"])
                                                for (var l = Z["daily_gain_record"], S = 0; S < l["length"]; S++) {
                                                    var m = l[S]["limit_source_id"];
                                                    B["_daily_gain_record"][m] = {};
                                                    var s = l[S]["record_time"];
                                                    B["_daily_gain_record"][m]["record_time"] = s;
                                                    var f = l[S]["records"];
                                                    if (f)
                                                        for (var z = 0; z < f["length"]; z++)
                                                            B["_daily_gain_record"][m][f[z]["item_id"]] = f[z]["count"];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    W["find_item"] = function (Q) {
                        var B = this["_item_map"][Q];
                        return B ? {
                            item_id: B["item_id"],
                            category: B["category"],
                            count: B["count"]
                        }
                            : null;
                    },
                    W["get_item_count"] = function (Q) {
                        var B = this["find_item"](Q);
                        if (B)
                            return B["count"];
                        if ("100001" == Q) {
                            for (var V = 0, W = 0, Z = GameMgr.Inst["free_diamonds"]; W < Z["length"]; W++) {
                                var S = Z[W];
                                GameMgr.Inst["account_numerical_resource"][S] && (V += GameMgr.Inst["account_numerical_resource"][S]);
                            }
                            for (var v = 0, i = GameMgr.Inst["paid_diamonds"]; v < i["length"]; v++) {
                                var S = i[v];
                                GameMgr.Inst["account_numerical_resource"][S] && (V += GameMgr.Inst["account_numerical_resource"][S]);
                            }
                            return V;
                        }
                        if ("100004" == Q) {
                            for (var x = 0, l = 0, m = GameMgr.Inst["free_pifuquans"]; l < m["length"]; l++) {
                                var S = m[l];
                                GameMgr.Inst["account_numerical_resource"][S] && (x += GameMgr.Inst["account_numerical_resource"][S]);
                            }
                            for (var s = 0, f = GameMgr.Inst["paid_pifuquans"]; s < f["length"]; s++) {
                                var S = f[s];
                                GameMgr.Inst["account_numerical_resource"][S] && (x += GameMgr.Inst["account_numerical_resource"][S]);
                            }
                            return x;
                        }
                        return "100002" == Q ? GameMgr.Inst["account_data"].gold : 0;
                    },
                    W["find_items_by_category"] = function (Q) {
                        var B = [];
                        for (var V in this["_item_map"])
                            this["_item_map"][V]["category"] == Q && B.push({
                                item_id: this["_item_map"][V]["item_id"],
                                category: this["_item_map"][V]["category"],
                                count: this["_item_map"][V]["count"]
                            });
                        return B;
                    },
                    W["update_data"] = function (B) {
                        for (var V = 0; V < B["length"]; V++) {
                            var W = B[V]["item_id"],
                                Z = B[V]["stack"];
                            if (Z > 0) {
                                this["_item_map"]["hasOwnProperty"](W["toString"]()) ? this["_item_map"][W]["count"] = Z : this["_item_map"][W] = {
                                    item_id: W,
                                    count: Z,
                                    category: cfg["item_definition"].item.get(W)["category"]
                                };
                                var S = cfg["item_definition"].item.get(W);
                                1 == S["category"] && 3 == S.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                    item_id: W
                                }, function () { }),
                                    5 == S["category"] && (this["new_bag_item_ids"].push(W), this["new_zhuangban_item_ids"][W] = 1),
                                    8 != S["category"] || S["item_expire"] || this["new_cg_ids"].push(W);
                            } else if (this["_item_map"]["hasOwnProperty"](W["toString"]())) {
                                var v = cfg["item_definition"].item.get(W);
                                v && 5 == v["category"] && Q["UI_Sushe"]["on_view_remove"](W),
                                    this["_item_map"][W] = 0,
                                    delete this["_item_map"][W];
                            }
                        }
                        this.Inst && this.Inst["when_data_change"]();
                        for (var V = 0; V < B["length"]; V++) {
                            var W = B[V]["item_id"];
                            if (this["_item_listener"]["hasOwnProperty"](W["toString"]()))
                                for (var i = this["_item_listener"][W], x = 0; x < i["length"]; x++)
                                    i[x].run();
                        }
                        for (var V = 0; V < this["_all_item_listener"]["length"]; V++)
                            this["_all_item_listener"][V].run();
                    },
                    W["update_daily_gain_data"] = function (Q) {
                        var B = Q["update_daily_gain_record"];
                        if (B)
                            for (var V = 0; V < B["length"]; V++) {
                                var W = B[V]["limit_source_id"];
                                this["_daily_gain_record"][W] || (this["_daily_gain_record"][W] = {});
                                var Z = B[V]["record_time"];
                                this["_daily_gain_record"][W]["record_time"] = Z;
                                var S = B[V]["records"];
                                if (S)
                                    for (var v = 0; v < S["length"]; v++)
                                        this["_daily_gain_record"][W][S[v]["item_id"]] = S[v]["count"];
                            }
                    },
                    W["get_item_daily_record"] = function (Q, B) {
                        return this["_daily_gain_record"][Q] ? this["_daily_gain_record"][Q]["record_time"] ? game["Tools"]["isPassedRefreshTimeServer"](this["_daily_gain_record"][Q]["record_time"]) ? this["_daily_gain_record"][Q][B] ? this["_daily_gain_record"][Q][B] : 0 : 0 : 0 : 0;
                    },
                    W["add_item_listener"] = function (Q, B) {
                        this["_item_listener"]["hasOwnProperty"](Q["toString"]()) || (this["_item_listener"][Q] = []),
                            this["_item_listener"][Q].push(B);
                    },
                    W["remove_item_listener"] = function (Q, B) {
                        var V = this["_item_listener"][Q];
                        if (V)
                            for (var W = 0; W < V["length"]; W++)
                                if (V[W] === B) {
                                    V[W] = V[V["length"] - 1],
                                        V.pop();
                                    break;
                                }
                    },
                    W["add_all_item_listener"] = function (Q) {
                        this["_all_item_listener"].push(Q);
                    },
                    W["remove_all_item_listener"] = function (Q) {
                        for (var B = this["_all_item_listener"], V = 0; V < B["length"]; V++)
                            if (B[V] === Q) {
                                B[V] = B[B["length"] - 1],
                                    B.pop();
                                break;
                            }
                    },
                    W["removeAllBagNew"] = function () {
                        this["new_bag_item_ids"] = [];
                    },
                    W["removeAllCGNew"] = function () {
                        this["new_cg_ids"] = [];
                    },
                    W["removeZhuangBanNew"] = function (Q) {
                        for (var B = 0, V = Q; B < V["length"]; B++) {
                            var W = V[B];
                            delete this["new_zhuangban_item_ids"][W];
                        }
                    },
                    W["prototype"]["have_red_point"] = function () {
                        return this["page_cg"]["have_redpoint"]();
                    },
                    W["prototype"]["onCreate"] = function () {
                        var B = this;
                        this["container_top"] = this.me["getChildByName"]("top"),
                            this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || B.hide(Laya["Handler"]["create"](B, function () {
                                    return B["closeHandler"] ? (B["closeHandler"].run(), B["closeHandler"] = null, void 0) : (Q["UI_Lobby"].Inst["enable"] = !0, void 0);
                                }));
                            }, null, !1),
                            this["container_content"] = this.me["getChildByName"]("content");
                        for (var V = function (Q) {
                            W.tabs.push(W["container_content"]["getChildByName"]("tabs")["getChildByName"]("btn" + Q)),
                                W.tabs[Q]["clickHandler"] = Laya["Handler"]["create"](W, function () {
                                    B["select_index"] != Q && B["on_change_tab"](Q);
                                }, null, !1);
                        }, W = this, Z = 0; 5 > Z; Z++)
                            V(Z);
                        this["page_item"] = new Q["UI_Bag_PageItem"](this["container_content"]["getChildByName"]("page_items")),
                            this["page_gift"] = new Q["UI_Bag_PageGift"](this["container_content"]["getChildByName"]("page_gift")),
                            this["page_skin"] = new Q["UI_Bag_PageSkin"](this["container_content"]["getChildByName"]("page_skin")),
                            this["page_cg"] = new Q["UI_Bag_PageCG"](this["container_content"]["getChildByName"]("page_cg"));
                    },
                    W["prototype"].show = function (B, V) {
                        var W = this;
                        void 0 === B && (B = 0),
                            void 0 === V && (V = null),
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this["closeHandler"] = V,
                            Q["UIBase"]["anim_alpha_in"](this["container_top"], {
                                y: -30
                            }, 200),
                            Q["UIBase"]["anim_alpha_in"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                W["locking"] = !1;
                            }),
                            this["on_change_tab"](B),
                            this["refreshRedpoint"](),
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                            3 != B && this["page_skin"]["when_update_data"]();
                    },
                    W["prototype"].hide = function (B) {
                        var V = this;
                        this["locking"] = !0,
                            Q["UIBase"]["anim_alpha_out"](this["container_top"], {
                                y: -30
                            }, 200),
                            Q["UIBase"]["anim_alpha_out"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                V["locking"] = !1,
                                    V["enable"] = !1,
                                    B && B.run();
                            });
                    },
                    W["prototype"]["onDisable"] = function () {
                        this["page_skin"]["close"](),
                            this["page_item"]["close"](),
                            this["page_gift"]["close"](),
                            this["page_cg"]["close"]();
                    },
                    W["prototype"]["on_change_tab"] = function (Q) {
                        this["select_index"] = Q;
                        for (var V = 0; V < this.tabs["length"]; V++)
                            this.tabs[V].skin = game["Tools"]["localUISrc"](Q == V ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[V]["getChildAt"](0)["color"] = Q == V ? "#d9b263" : "#8cb65f";
                        switch (this["page_item"]["close"](), this["page_gift"]["close"](), this["page_skin"].me["visible"] = !1, this["page_cg"]["close"](), Q) {
                            case 0:
                                this["page_item"].show(B["daoju"]);
                                break;
                            case 1:
                                this["page_gift"].show();
                                break;
                            case 2:
                                this["page_item"].show(B.view);
                                break;
                            case 3:
                                this["page_skin"].show();
                                break;
                            case 4:
                                this["page_cg"].show();
                        }
                    },
                    W["prototype"]["when_data_change"] = function () {
                        this["page_item"].me["visible"] && this["page_item"]["when_update_data"](),
                            this["page_gift"].me["visible"] && this["page_gift"]["when_update_data"]();
                    },
                    W["prototype"]["on_skin_change"] = function () {
                        this["page_skin"]["when_update_data"]();
                    },
                    W["prototype"]["on_cg_change"] = function () {
                        this["page_cg"]["when_update_data"]();
                    },
                    W["prototype"]["refreshRedpoint"] = function () {
                        this.tabs[4]["getChildByName"]("redpoint")["visible"] = this["page_cg"]["have_redpoint"]();
                    },
                    W["_item_map"] = {},
                    W["_item_listener"] = {},
                    W["_all_item_listener"] = [],
                    W["_daily_gain_record"] = {},
                    W["new_bag_item_ids"] = [],
                    W["new_zhuangban_item_ids"] = {},
                    W["new_cg_ids"] = [],
                    W.Inst = null,
                    W;
            }
                (Q["UIBase"]);
            Q["UI_Bag"] = V;
        }
            (uiscript || (uiscript = {}));

        // 修改牌桌上角色
        !function (Q) {
            var B = function () {
                function B() {
                    var B = this;
                    this.urls = [],
                        this["link_index"] = -1,
                        this["connect_state"] = Q["EConnectState"].none,
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
                        app["NetAgent"]["AddListener2MJ"]("NotifyPlayerLoadGameReady", Laya["Handler"]["create"](this, function (Q) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(Q),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(Q));
                                    }
                                }));
                            }
                            app.Log.log("NotifyPlayerLoadGameReady: " + JSON["stringify"](Q)),
                                B["loaded_player_count"] = Q["ready_id_list"]["length"],
                                B["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](B["loaded_player_count"], B["real_player_count"]);
                        }));
                }
                return Object["defineProperty"](B, "Inst", {
                    get: function () {
                        return null == this["_Inst"] ? this["_Inst"] = new B() : this["_Inst"];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    B["prototype"]["OpenConnect"] = function (B, V, W, Z) {
                        var S = this;
                        uiscript["UI_Loading"].Inst.show("enter_mj"),
                            Q["Scene_Lobby"].Inst && Q["Scene_Lobby"].Inst["active"] && (Q["Scene_Lobby"].Inst["active"] = !1),
                            Q["Scene_Huiye"].Inst && Q["Scene_Huiye"].Inst["active"] && (Q["Scene_Huiye"].Inst["active"] = !1),
                            this["Close"](),
                            view["BgmListMgr"]["stopBgm"](),
                            this["is_ob"] = !1,
                            Laya["timer"].once(500, this, function () {
                                S.url = '',
                                    S["token"] = B,
                                    S["game_uuid"] = V,
                                    S["server_location"] = W,
                                    GameMgr.Inst["ingame"] = !0,
                                    GameMgr.Inst["mj_server_location"] = W,
                                    GameMgr.Inst["mj_game_token"] = B,
                                    GameMgr.Inst["mj_game_uuid"] = V,
                                    S["playerreconnect"] = Z,
                                    S["_setState"](Q["EConnectState"]["tryconnect"]),
                                    S["load_over"] = !1,
                                    S["loaded_player_count"] = 0,
                                    S["real_player_count"] = 0,
                                    S["lb_index"] = 0,
                                    S["_fetch_gateway"](0);
                            }),
                            Laya["timer"].loop(300000, this, this["reportInfo"]);
                    },
                    B["prototype"]["reportInfo"] = function () {
                        this["connect_state"] == Q["EConnectState"]["connecting"] && GameMgr.Inst["postNewInfo2Server"]("network_route", {
                            client_type: "web",
                            route_type: "game",
                            route_index: Q["LobbyNetMgr"]["root_id_lst"][Q["LobbyNetMgr"].Inst["choosed_index"]],
                            route_delay: Math.min(10000, Math["round"](app["NetAgent"]["mj_network_delay"])),
                            connection_time: Math["round"](Date.now() - this["_connect_start_time"]),
                            reconnect_count: this["_report_reconnect_count"]
                        });
                    },
                    B["prototype"]["Close"] = function () {
                        this["load_over"] = !1,
                            app.Log.log("MJNetMgr close"),
                            this["_setState"](Q["EConnectState"].none),
                            app["NetAgent"]["Close2MJ"](),
                            this.url = '',
                            Laya["timer"]["clear"](this, this["reportInfo"]);
                    },
                    B["prototype"]["_OnConnent"] = function (B) {
                        app.Log.log("MJNetMgr _OnConnent event:" + B),
                            B == Laya["Event"]["CLOSE"] || B == Laya["Event"]["ERROR"] ? Laya["timer"]["currTimer"] - this["lasterrortime"] > 100 && (this["lasterrortime"] = Laya["timer"]["currTimer"], this["connect_state"] == Q["EConnectState"]["tryconnect"] ? this["_try_to_linknext"]() : this["connect_state"] == Q["EConnectState"]["connecting"] ? view["DesktopMgr"].Inst["active"] ? (view["DesktopMgr"].Inst["duringReconnect"] = !0, this["_setState"](Q["EConnectState"]["reconnecting"]), this["reconnect_count"] = 0, this["_Reconnect"]()) : (this["_setState"](Q["EConnectState"]["disconnect"]), uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2008)), Q["Scene_MJ"].Inst["ForceOut"]()) : this["connect_state"] == Q["EConnectState"]["reconnecting"] && this["_Reconnect"]()) : B == Laya["Event"].OPEN && (this["_connect_start_time"] = Date.now(), (this["connect_state"] == Q["EConnectState"]["tryconnect"] || this["connect_state"] == Q["EConnectState"]["reconnecting"]) && ((this["connect_state"] = Q["EConnectState"]["tryconnect"]) ? this["_report_reconnect_count"] = 0 : this["_report_reconnect_count"]++, this["_setState"](Q["EConnectState"]["connecting"]), this["is_ob"] ? this["_ConnectSuccessOb"]() : this["_ConnectSuccess"]()));
                    },
                    B["prototype"]["_Reconnect"] = function () {
                        var B = this;
                        Q["LobbyNetMgr"].Inst["connect_state"] == Q["EConnectState"].none || Q["LobbyNetMgr"].Inst["connect_state"] == Q["EConnectState"]["disconnect"] ? this["_setState"](Q["EConnectState"]["disconnect"]) : Q["LobbyNetMgr"].Inst["connect_state"] == Q["EConnectState"]["connecting"] && GameMgr.Inst["logined"] ? this["reconnect_count"] >= this["reconnect_span"]["length"] ? this["_setState"](Q["EConnectState"]["disconnect"]) : (Laya["timer"].once(this["reconnect_span"][this["reconnect_count"]], this, function () {
                            B["connect_state"] == Q["EConnectState"]["reconnecting"] && (app.Log.log("MJNetMgr reconnect count:" + B["reconnect_count"]), app["NetAgent"]["connect2MJ"](B.url, Laya["Handler"]["create"](B, B["_OnConnent"], null, !1), "local" == B["server_location"] ? "/game-gateway" : "/game-gateway-zone"));
                        }), this["reconnect_count"]++) : Laya["timer"].once(1000, this, this["_Reconnect"]);
                    },
                    B["prototype"]["_try_to_linknext"] = function () {
                        this["link_index"]++,
                            this.url = '',
                            app.Log.log("mj _try_to_linknext(" + this["link_index"] + ") url.length=" + this.urls["length"]),
                            this["link_index"] < 0 || this["link_index"] >= this.urls["length"] ? Q["LobbyNetMgr"].Inst["polling_connect"] ? (this["lb_index"]++, this["_fetch_gateway"](0)) : (this["_setState"](Q["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && Q["Scene_MJ"].Inst["ForceOut"]()) : (app["NetAgent"]["connect2MJ"](this.urls[this["link_index"]].url, Laya["Handler"]["create"](this, this["_OnConnent"], null, !1), "local" == this["server_location"] ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this["link_index"]].url);
                    },
                    B["prototype"]["GetAuthData"] = function () {
                        return {
                            account_id: GameMgr.Inst["account_id"],
                            token: this["token"],
                            game_uuid: this["game_uuid"],
                            gift: CryptoJS["HmacSHA256"](this["token"] + GameMgr.Inst["account_id"] + this["game_uuid"], "damajiang")["toString"]()
                        };
                    },
                    B["prototype"]["_fetch_gateway"] = function (B) {
                        var V = this;
                        if (Q["LobbyNetMgr"].Inst["polling_connect"] && this["lb_index"] >= Q["LobbyNetMgr"].Inst.urls["length"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && Q["Scene_MJ"].Inst["ForceOut"](), this["_setState"](Q["EConnectState"].none), void 0;
                        this.urls = [],
                            this["link_index"] = -1,
                            app.Log.log("mj _fetch_gateway retry_count:" + B);
                        var W = function (W) {
                            var Z = JSON["parse"](W);
                            if (app.Log.log("mj _fetch_gateway func_success data = " + W), Z["maintenance"])
                                V["_setState"](Q["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2009)), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && Q["Scene_MJ"].Inst["ForceOut"]();
                            else if (Z["servers"] && Z["servers"]["length"] > 0) {
                                for (var S = Z["servers"], v = Q["Tools"]["deal_gateway"](S), i = 0; i < v["length"]; i++)
                                    V.urls.push({
                                        name: "___" + i,
                                        url: v[i]
                                    });
                                V["link_index"] = -1,
                                    V["_try_to_linknext"]();
                            } else
                                1 > B ? Laya["timer"].once(1000, V, function () {
                                    V["_fetch_gateway"](B + 1);
                                }) : Q["LobbyNetMgr"].Inst["polling_connect"] ? (V["lb_index"]++, V["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](60)), V["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && Q["Scene_MJ"].Inst["ForceOut"](), V["_setState"](Q["EConnectState"].none));
                        },
                            Z = function () {
                                app.Log.log("mj _fetch_gateway func_error"),
                                    1 > B ? Laya["timer"].once(500, V, function () {
                                        V["_fetch_gateway"](B + 1);
                                    }) : Q["LobbyNetMgr"].Inst["polling_connect"] ? (V["lb_index"]++, V["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](58)), V["_SendDebugInfo"](), view["DesktopMgr"].Inst["active"] || Q["Scene_MJ"].Inst["ForceOut"](), V["_setState"](Q["EConnectState"].none));
                            },
                            S = function (Q) {
                                var B = new Laya["HttpRequest"]();
                                B.once(Laya["Event"]["COMPLETE"], V, function (Q) {
                                    W(Q);
                                }),
                                    B.once(Laya["Event"]["ERROR"], V, function () {
                                        Z();
                                    });
                                var S = [];
                                S.push("If-Modified-Since"),
                                    S.push('0'),
                                    Q += "?service=ws-game-gateway",
                                    Q += GameMgr["inHttps"] ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                    Q += "&location=" + V["server_location"],
                                    Q += "&rv=" + Math["floor"](10000000 * Math["random"]()) + Math["floor"](10000000 * Math["random"]()),
                                    B.send(Q, '', "get", "text", S),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + Q);
                            };
                        Q["LobbyNetMgr"].Inst["polling_connect"] ? S(Q["LobbyNetMgr"].Inst.urls[this["lb_index"]]) : S(Q["LobbyNetMgr"].Inst["lb_url"]);
                    },
                    B["prototype"]["_setState"] = function (B) {
                        this["connect_state"] = B,
                            GameMgr["inRelease"] || null != uiscript["UI_Common"].Inst && (B == Q["EConnectState"].none ? uiscript["UI_Common"].Inst["label_net_mj"].text = '' : B == Q["EConnectState"]["tryconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "尝试连接麻将服务器", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#000000") : B == Q["EConnectState"]["connecting"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正常", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#00ff00") : B == Q["EConnectState"]["disconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：断开连接", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()) : B == Q["EConnectState"]["reconnecting"] && (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正在重连", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()));
                    },
                    B["prototype"]["_ConnectSuccess"] = function () {
                        var B = this;
                        app.Log.log("MJNetMgr _ConnectSuccess "),
                            this["load_over"] = !1,
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authGame", this["GetAuthData"](), function (V, W) {
                                if (V || W["error"])
                                    uiscript["UIMgr"].Inst["showNetReqError"]("authGame", V, W), Q["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                else {
                                    app.Log.log("麻将桌验证通过：" + JSON["stringify"](W)),
                                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        W['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(W),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(W));
                                            }
                                        });
                                    }
                                    //END
                                    var Z = [],
                                        S = 0;
                                    view["DesktopMgr"]["player_link_state"] = W["state_list"];
                                    var v = Q["Tools"]["strOfLocalization"](2003),
                                        i = W["game_config"].mode,
                                        x = view["ERuleMode"]["Liqi4"];
                                    i.mode < 10 ? (x = view["ERuleMode"]["Liqi4"], B["real_player_count"] = 4) : i.mode < 20 && (x = view["ERuleMode"]["Liqi3"], B["real_player_count"] = 3);
                                    for (var l = 0; l < B["real_player_count"]; l++)
                                        Z.push(null);
                                    i["extendinfo"] && (v = Q["Tools"]["strOfLocalization"](2004)),
                                        i["detail_rule"] && i["detail_rule"]["ai_level"] && (1 === i["detail_rule"]["ai_level"] && (v = Q["Tools"]["strOfLocalization"](2003)), 2 === i["detail_rule"]["ai_level"] && (v = Q["Tools"]["strOfLocalization"](2004)));
                                    for (var m = Q["GameUtility"]["get_default_ai_skin"](), s = Q["GameUtility"]["get_default_ai_character"](), l = 0; l < W["seat_list"]["length"]; l++) {
                                        var f = W["seat_list"][l];
                                        if (0 == f) {
                                            Z[l] = {
                                                nickname: v,
                                                avatar_id: m,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: s,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: m,
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
                                                    Z[l].avatar_id = skin.id;
                                                    Z[l].character.charid = skin.character_id;
                                                    Z[l].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                Z[l].nickname = '[BOT]' + Z[l].nickname;
                                            }
                                        } else {
                                            S++;
                                            for (var z = 0; z < W["players"]["length"]; z++)
                                                if (W["players"][z]["account_id"] == f) {
                                                    Z[l] = W["players"][z];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (Z[l].account_id == GameMgr.Inst.account_id) {
                                                        Z[l].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        Z[l].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        // 解决进游戏后没有装扮的问题
                                                        uiscript.UI_Sushe.randomDesktopID();
                                                        GameMgr.Inst["load_mjp_view"]();
                                                        GameMgr.Inst["load_touming_mjp_view"]();
                                                        // END
                                                        Z[l].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        Z[l].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        Z[l].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            Z[l].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (Z[l].avatar_id == 400101 || Z[l].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            Z[l].avatar_id = skin.id;
                                                            Z[l].character.charid = skin.character_id;
                                                            Z[l].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(Z[l].account_id);
                                                        if (server == 1) {
                                                            Z[l].nickname = '[CN]' + Z[l].nickname;
                                                        } else if (server == 2) {
                                                            Z[l].nickname = '[JP]' + Z[l].nickname;
                                                        } else if (server == 3) {
                                                            Z[l].nickname = '[EN]' + Z[l].nickname;
                                                        } else {
                                                            Z[l].nickname = '[??]' + Z[l].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var l = 0; l < B["real_player_count"]; l++)
                                        null == Z[l] && (Z[l] = {
                                            account: 0,
                                            nickname: Q["Tools"]["strOfLocalization"](2010),
                                            avatar_id: m,
                                            level: {
                                                id: "10101"
                                            },
                                            level3: {
                                                id: "20101"
                                            },
                                            character: {
                                                charid: s,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: m,
                                                is_upgraded: !1
                                            }
                                        });
                                    B["loaded_player_count"] = W["ready_id_list"]["length"],
                                        B["_AuthSuccess"](Z, W["is_game_start"], W["game_config"]["toJSON"]());
                                }
                            });
                    },
                    B["prototype"]["_AuthSuccess"] = function (B, V, W) {
                        var Z = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.2),
                                app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                    round_id: view["DesktopMgr"].Inst["round_id"],
                                    step: view["DesktopMgr"].Inst["current_step"]
                                }, function (B, V) {
                                    B || V["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", B, V), Q["Scene_MJ"].Inst["ForceOut"]()) : (app.Log.log("[syncGame] " + JSON["stringify"](V)), V["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2011)), Q["Scene_MJ"].Inst["GameEnd"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.3), view["DesktopMgr"].Inst["fetchLinks"](), view["DesktopMgr"].Inst["Reset"](), view["DesktopMgr"].Inst["duringReconnect"] = !0, view["DesktopMgr"].Inst["syncGameByStep"](V["game_restore"])));
                                });
                        })) : Q["Scene_MJ"].Inst["openMJRoom"](W, B, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](W)), B, GameMgr.Inst["account_id"], view["EMJMode"].play, Laya["Handler"]["create"](Z, function () {
                                V ? Laya["timer"]["frameOnce"](10, Z, function () {
                                    app.Log.log("重连信息2 round_id:-1 step:" + 1000000),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (B, V) {
                                            app.Log.log("syncGame " + JSON["stringify"](V)),
                                                B || V["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", B, V), Q["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), view["DesktopMgr"].Inst["fetchLinks"](), Z["_PlayerReconnectSuccess"](V));
                                        });
                                }) : Laya["timer"]["frameOnce"](10, Z, function () {
                                    app.Log.log("send enterGame"),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "enterGame", {}, function (B, V) {
                                            B || V["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("enterGame", B, V), Q["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), app.Log.log("enterGame"), Z["_EnterGame"](V), view["DesktopMgr"].Inst["fetchLinks"]());
                                        });
                                });
                            }));
                        }), Laya["Handler"]["create"](this, function (Q) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.8 * Q);
                        }, null, !1));
                    },
                    B["prototype"]["_EnterGame"] = function (B) {
                        app.Log.log("正常进入游戏: " + JSON["stringify"](B)),
                            B["is_end"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2011)), Q["Scene_MJ"].Inst["GameEnd"]()) : B["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](B["game_restore"]) : (this["load_over"] = !0, this["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](this["loaded_player_count"], this["real_player_count"]), view["DesktopMgr"].Inst["duringReconnect"] = !1, view["DesktopMgr"].Inst["StartChainAction"](0));
                    },
                    B["prototype"]["_PlayerReconnectSuccess"] = function (B) {
                        app.Log.log("_PlayerReconnectSuccess data:" + JSON["stringify"](B)),
                            B["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2011)), Q["Scene_MJ"].Inst["GameEnd"]()) : B["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](B["game_restore"]) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](Q["Tools"]["strOfLocalization"](2012)), Q["Scene_MJ"].Inst["ForceOut"]());
                    },
                    B["prototype"]["_SendDebugInfo"] = function () { },
                    B["prototype"]["OpenConnectObserve"] = function (B, V) {
                        var W = this;
                        this["is_ob"] = !0,
                            uiscript["UI_Loading"].Inst.show("enter_mj"),
                            this["Close"](),
                            view["AudioMgr"]["StopMusic"](),
                            Laya["timer"].once(500, this, function () {
                                W["server_location"] = V,
                                    W["ob_token"] = B,
                                    W["_setState"](Q["EConnectState"]["tryconnect"]),
                                    W["lb_index"] = 0,
                                    W["_fetch_gateway"](0);
                            });
                    },
                    B["prototype"]["_ConnectSuccessOb"] = function () {
                        var B = this;
                        app.Log.log("MJNetMgr _ConnectSuccessOb "),
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authObserve", {
                                token: this["ob_token"]
                            }, function (V, W) {
                                V || W["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("authObserve", V, W), Q["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]()) : (app.Log.log("实时OB验证通过：" + JSON["stringify"](W)), uiscript["UI_Loading"].Inst["setProgressVal"](0.3), uiscript["UI_Live_Broadcast"].Inst && uiscript["UI_Live_Broadcast"].Inst["clearPendingUnits"](), app["NetAgent"]["sendReq2MJ"]("FastTest", "startObserve", {}, function (V, W) {
                                    if (V || W["error"])
                                        uiscript["UIMgr"].Inst["showNetReqError"]("startObserve", V, W), Q["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                    else {
                                        var Z = W.head,
                                            S = Z["game_config"].mode,
                                            v = [],
                                            i = Q["Tools"]["strOfLocalization"](2003),
                                            x = view["ERuleMode"]["Liqi4"];
                                        S.mode < 10 ? (x = view["ERuleMode"]["Liqi4"], B["real_player_count"] = 4) : S.mode < 20 && (x = view["ERuleMode"]["Liqi3"], B["real_player_count"] = 3);
                                        for (var l = 0; l < B["real_player_count"]; l++)
                                            v.push(null);
                                        S["extendinfo"] && (i = Q["Tools"]["strOfLocalization"](2004)),
                                            S["detail_rule"] && S["detail_rule"]["ai_level"] && (1 === S["detail_rule"]["ai_level"] && (i = Q["Tools"]["strOfLocalization"](2003)), 2 === S["detail_rule"]["ai_level"] && (i = Q["Tools"]["strOfLocalization"](2004)));
                                        for (var m = Q["GameUtility"]["get_default_ai_skin"](), s = Q["GameUtility"]["get_default_ai_character"](), l = 0; l < Z["seat_list"]["length"]; l++) {
                                            var f = Z["seat_list"][l];
                                            if (0 == f)
                                                v[l] = {
                                                    nickname: i,
                                                    avatar_id: m,
                                                    level: {
                                                        id: "10101"
                                                    },
                                                    level3: {
                                                        id: "20101"
                                                    },
                                                    character: {
                                                        charid: s,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: m,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var z = 0; z < Z["players"]["length"]; z++)
                                                    if (Z["players"][z]["account_id"] == f) {
                                                        v[l] = Z["players"][z];
                                                        break;
                                                    }
                                        }
                                        for (var l = 0; l < B["real_player_count"]; l++)
                                            null == v[l] && (v[l] = {
                                                account: 0,
                                                nickname: Q["Tools"]["strOfLocalization"](2010),
                                                avatar_id: m,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: s,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: m,
                                                    is_upgraded: !1
                                                }
                                            });
                                        B["_StartObSuccuess"](v, W["passed"], Z["game_config"]["toJSON"](), Z["start_time"]);
                                    }
                                }));
                            });
                    },
                    B["prototype"]["_StartObSuccuess"] = function (B, V, W, Z) {
                        var S = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](Z, V);
                        })) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.4), Q["Scene_MJ"].Inst["openMJRoom"](W, B, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](W)), B, GameMgr.Inst["account_id"], view["EMJMode"]["live_broadcast"], Laya["Handler"]["create"](S, function () {
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.9),
                                    Laya["timer"].once(1000, S, function () {
                                        GameMgr.Inst["EnterMJ"](),
                                            uiscript["UI_Loading"].Inst["setProgressVal"](0.95),
                                            uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](Z, V);
                                    });
                            }));
                        }), Laya["Handler"]["create"](this, function (Q) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.4 + 0.4 * Q);
                        }, null, !1)));
                    },
                    B["_Inst"] = null,
                    B;
            }
                ();
            Q["MJNetMgr"] = B;
        }
            (game || (game = {}));

        // 读取战绩
        !function (Q) {
            var B = function (B) {
                function V() {
                    var Q = B.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["both_ui"]["otherplayerinfoUI"]() : new ui["both_ui"]["otherplayerinfo_enUI"]()) || this;
                    return Q["account_id"] = 0,
                        Q["origin_x"] = 0,
                        Q["origin_y"] = 0,
                        Q.root = null,
                        Q["title"] = null,
                        Q["level"] = null,
                        Q["btn_addfriend"] = null,
                        Q["btn_report"] = null,
                        Q["illust"] = null,
                        Q.name = null,
                        Q["detail_data"] = null,
                        Q["achievement_data"] = null,
                        Q["locking"] = !1,
                        Q["tab_info4"] = null,
                        Q["tab_info3"] = null,
                        Q["tab_note"] = null,
                        Q["tab_img_dark"] = '',
                        Q["tab_img_chosen"] = '',
                        Q["player_data"] = null,
                        Q["tab_index"] = 1,
                        Q["game_category"] = 1,
                        Q["game_type"] = 1,
                        V.Inst = Q,
                        Q;
                }
                return __extends(V, B),
                    V["prototype"]["onCreate"] = function () {
                        var B = this;
                        "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_dark.png")) : (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_dark.png")),
                            this.root = this.me["getChildByName"]("root"),
                            this["origin_x"] = this.root.x,
                            this["origin_y"] = this.root.y,
                            this["container_info"] = this.root["getChildByName"]("container_info"),
                            this["title"] = new Q["UI_PlayerTitle"](this["container_info"]["getChildByName"]("title"), "UI_OtherPlayerInfo"),
                            this.name = this["container_info"]["getChildByName"]("name"),
                            this["level"] = new Q["UI_Level"](this["container_info"]["getChildByName"]("rank"), "UI_OtherPlayerInfo"),
                            this["detail_data"] = new Q["UI_PlayerData"](this["container_info"]["getChildByName"]("data")),
                            this["achievement_data"] = new Q["UI_Achievement_Light"](this["container_info"]["getChildByName"]("achievement")),
                            this["illust"] = new Q["UI_Character_Skin"](this.root["getChildByName"]("illust")["getChildByName"]("illust")),
                            this["btn_addfriend"] = this["container_info"]["getChildByName"]("btn_add"),
                            this["btn_addfriend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["btn_addfriend"]["visible"] = !1,
                                    B["btn_report"].x = 343,
                                    app["NetAgent"]["sendReq2Lobby"]("Lobby", "applyFriend", {
                                        target_id: B["account_id"]
                                    }, function () { });
                            }, null, !1),
                            this["btn_report"] = this["container_info"]["getChildByName"]("btn_report"),
                            this["btn_report"]["clickHandler"] = new Laya["Handler"](this, function () {
                                Q["UI_Report_Nickname"].Inst.show(B["account_id"]);
                            }),
                            this.me["getChildAt"](0)["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || B["close"]();
                            }, null, !1),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["close"]();
                            }, null, !1),
                            this.note = new Q["UI_PlayerNote"](this.root["getChildByName"]("container_note"), null),
                            this["tab_info4"] = this.root["getChildByName"]("tab_info4"),
                            this["tab_info4"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || 1 != B["tab_index"] && B["changeMJCategory"](1);
                            }, null, !1),
                            this["tab_info3"] = this.root["getChildByName"]("tab_info3"),
                            this["tab_info3"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || 2 != B["tab_index"] && B["changeMJCategory"](2);
                            }, null, !1),
                            this["tab_note"] = this.root["getChildByName"]("tab_note"),
                            this["tab_note"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"] && (game["Tools"]["during_chat_close"]() ? Q["UIMgr"].Inst["ShowErrorInfo"]("功能维护中，祝大家新年快乐") : B["container_info"]["visible"] && (B["container_info"]["visible"] = !1, B["tab_info4"].skin = B["tab_img_dark"], B["tab_info3"].skin = B["tab_img_dark"], B["tab_note"].skin = B["tab_img_chosen"], B["tab_index"] = 3, B.note.show()));
                            }, null, !1),
                            this["locking"] = !1;
                    },
                    V["prototype"].show = function (B, V, W, Z) {
                        var S = this;
                        void 0 === V && (V = 1),
                            void 0 === W && (W = 2),
                            void 0 === Z && (Z = 1),
                            GameMgr.Inst["BehavioralStatistics"](14),
                            this["account_id"] = B,
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this.root.y = this["origin_y"],
                            this["player_data"] = null,
                            Q["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                S["locking"] = !1;
                            })),
                            this["detail_data"]["reset"](),
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountStatisticInfo", {
                                account_id: B
                            }, function (V, W) {
                                V || W["error"] ? Q["UIMgr"].Inst["showNetReqError"]("fetchAccountStatisticInfo", V, W) : Q["UI_Shilian"]["now_season_info"] && 1001 == Q["UI_Shilian"]["now_season_info"]["season_id"] && 3 != Q["UI_Shilian"]["get_cur_season_state"]() ? (S["detail_data"]["setData"](W), S["changeMJCategory"](S["tab_index"], S["game_category"], S["game_type"])) : app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountChallengeRankInfo", {
                                    account_id: B
                                }, function (B, V) {
                                    B || V["error"] ? Q["UIMgr"].Inst["showNetReqError"]("fetchAccountChallengeRankInfo", B, V) : (W["season_info"] = V["season_info"], S["detail_data"]["setData"](W), S["changeMJCategory"](S["tab_index"], S["game_category"], S["game_type"]));
                                });
                            }),
                            this.note["init_data"](B),
                            this["refreshBaseInfo"](),
                            this["btn_report"]["visible"] = B != GameMgr.Inst["account_id"],
                            this["tab_index"] = V,
                            this["game_category"] = W,
                            this["game_type"] = Z,
                            this["container_info"]["visible"] = !0,
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["tab_note"]["visible"] = "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"],
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    V["prototype"]["refreshBaseInfo"] = function () {
                        var B = this;
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
                            }, function (V, W) {
                                if (V || W["error"])
                                    Q["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", V, W);
                                else {
                                    var Z = W["account"];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (Z.account_id == GameMgr.Inst.account_id) {
                                        Z.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            Z.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            Z.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    B["player_data"] = Z,
                                        game["Tools"]["SetNickname"](B.name, Z),
                                        B["title"].id = game["Tools"]["titleLocalization"](Z["account_id"], Z["title"]),
                                        B["level"].id = Z["level"].id,
                                        B["level"].id = B["player_data"][1 == B["tab_index"] ? "level" : "level3"].id,
                                        B["level"].exp = B["player_data"][1 == B["tab_index"] ? "level" : "level3"]["score"],
                                        B["illust"].me["visible"] = !0,
                                        B["account_id"] == GameMgr.Inst["account_id"] ? B["illust"]["setSkin"](Z["avatar_id"], "waitingroom") : B["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](Z["avatar_id"]), "waitingroom"),
                                        game["Tools"]["is_same_zone"](GameMgr.Inst["account_id"], B["account_id"]) && B["account_id"] != GameMgr.Inst["account_id"] && null == game["FriendMgr"].find(B["account_id"]) ? (B["btn_addfriend"]["visible"] = !0, B["btn_report"].x = 520) : (B["btn_addfriend"]["visible"] = !1, B["btn_report"].x = 343),
                                        B.note.sign["setSign"](Z["signature"]),
                                        B["achievement_data"].show(!1, Z["achievement_count"]);
                                }
                            });
                    },
                    V["prototype"]["changeMJCategory"] = function (Q, B, V) {
                        void 0 === B && (B = 2),
                            void 0 === V && (V = 1),
                            this["tab_index"] = Q,
                            this["container_info"]["visible"] = !0,
                            this["detail_data"]["changeMJCategory"](Q, B, V),
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    V["prototype"]["close"] = function () {
                        var B = this;
                        this["enable"] && (this["locking"] || (this["locking"] = !0, this["detail_data"]["close"](), Q["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                            B["locking"] = !1,
                                B["enable"] = !1;
                        }))));
                    },
                    V["prototype"]["onEnable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !0);
                    },
                    V["prototype"]["onDisable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !1),
                            this["detail_data"]["close"](),
                            this["illust"]["clear"](),
                            Laya["loader"]["clearTextureRes"](this["level"].icon.skin);
                    },
                    V.Inst = null,
                    V;
            }
                (Q["UIBase"]);
            Q["UI_OtherPlayerInfo"] = B;
        }
            (uiscript || (uiscript = {}));

        // 宿舍相关
        !function (Q) {
            var B = function () {
                function B(B, W) {
                    var Z = this;
                    this["_scale"] = 1,
                        this["during_move"] = !1,
                        this["mouse_start_x"] = 0,
                        this["mouse_start_y"] = 0,
                        this.me = B,
                        this["container_illust"] = W,
                        this["illust"] = this["container_illust"]["getChildByName"]("illust"),
                        this["container_move"] = B["getChildByName"]("move"),
                        this["container_move"].on("mousedown", this, function () {
                            Z["during_move"] = !0,
                                Z["mouse_start_x"] = Z["container_move"]["mouseX"],
                                Z["mouse_start_y"] = Z["container_move"]["mouseY"];
                        }),
                        this["container_move"].on("mousemove", this, function () {
                            Z["during_move"] && (Z.move(Z["container_move"]["mouseX"] - Z["mouse_start_x"], Z["container_move"]["mouseY"] - Z["mouse_start_y"]), Z["mouse_start_x"] = Z["container_move"]["mouseX"], Z["mouse_start_y"] = Z["container_move"]["mouseY"]);
                        }),
                        this["container_move"].on("mouseup", this, function () {
                            Z["during_move"] = !1;
                        }),
                        this["container_move"].on("mouseout", this, function () {
                            Z["during_move"] = !1;
                        }),
                        this["btn_close"] = B["getChildByName"]("btn_close"),
                        this["btn_close"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            Z["locking"] || Z["close"]();
                        }, null, !1),
                        this["scrollbar"] = B["getChildByName"]("scrollbar")["scriptMap"]["capsui.CScrollBar"],
                        this["scrollbar"].init(new Laya["Handler"](this, function (Q) {
                            Z["_scale"] = 1 * (1 - Q) + 0.5,
                                Z["illust"]["scaleX"] = Z["_scale"],
                                Z["illust"]["scaleY"] = Z["_scale"],
                                Z["scrollbar"]["setVal"](Q, 0);
                        })),
                        this["dongtai_kaiguan"] = new Q["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            V.Inst["illust"]["resetSkin"]();
                        }), new Laya["Handler"](this, function (Q) {
                            V.Inst["illust"]["playAnim"](Q);
                        })),
                        this["dongtai_kaiguan"]["setKaiguanPos"](-462, -536);
                }
                return Object["defineProperty"](B["prototype"], "scale", {
                    get: function () {
                        return this["_scale"];
                    },
                    set: function (Q) {
                        this["_scale"] = Q,
                            this["scrollbar"]["setVal"](1 - (Q - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    B["prototype"].show = function (B) {
                        var W = this;
                        this["locking"] = !0,
                            this["when_close"] = B,
                            this["illust_start_x"] = this["illust"].x,
                            this["illust_start_y"] = this["illust"].y,
                            this["illust_center_x"] = this["illust"].x + 984 - 446,
                            this["illust_center_y"] = this["illust"].y + 11 - 84,
                            this["container_illust"]["getChildByName"]("container_name")["visible"] = !1,
                            this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !1,
                            this["container_illust"]["getChildByName"]("btn")["visible"] = !1,
                            V.Inst["stopsay"](),
                            this["scale"] = 1,
                            Laya["Tween"].to(this["illust"], {
                                x: this["illust_center_x"],
                                y: this["illust_center_y"]
                            }, 200),
                            Q["UIBase"]["anim_pop_out"](this["btn_close"], null),
                            this["during_move"] = !1,
                            Laya["timer"].once(250, this, function () {
                                W["locking"] = !1;
                            }),
                            this.me["visible"] = !0,
                            this["dongtai_kaiguan"]["refresh"](V.Inst["illust"]["skin_id"]);
                    },
                    B["prototype"]["close"] = function () {
                        var B = this;
                        this["locking"] = !0,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? this["container_illust"]["getChildByName"]("container_name")["visible"] = !0 : this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !0,
                            this["container_illust"]["getChildByName"]("btn")["visible"] = !0,
                            Laya["Tween"].to(this["illust"], {
                                x: this["illust_start_x"],
                                y: this["illust_start_y"],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            Q["UIBase"]["anim_pop_hide"](this["btn_close"], null),
                            Laya["timer"].once(250, this, function () {
                                B["locking"] = !1,
                                    B.me["visible"] = !1,
                                    B["when_close"].run();
                            });
                    },
                    B["prototype"].move = function (Q, B) {
                        var V = this["illust"].x + Q,
                            W = this["illust"].y + B;
                        V < this["illust_center_x"] - 600 ? V = this["illust_center_x"] - 600 : V > this["illust_center_x"] + 600 && (V = this["illust_center_x"] + 600),
                            W < this["illust_center_y"] - 1200 ? W = this["illust_center_y"] - 1200 : W > this["illust_center_y"] + 800 && (W = this["illust_center_y"] + 800),
                            this["illust"].x = V,
                            this["illust"].y = W;
                    },
                    B;
            }
                (),
                V = function (V) {
                    function W() {
                        var Q = V.call(this, new ui["lobby"]["susheUI"]()) || this;
                        return Q["contianer_illust"] = null,
                            Q["illust"] = null,
                            Q["illust_rect"] = null,
                            Q["container_name"] = null,
                            Q["label_name"] = null,
                            Q["label_cv"] = null,
                            Q["label_cv_title"] = null,
                            Q["container_page"] = null,
                            Q["container_look_illust"] = null,
                            Q["page_select_character"] = null,
                            Q["page_visit_character"] = null,
                            Q["origin_illust_x"] = 0,
                            Q["chat_id"] = 0,
                            Q["container_chat"] = null,
                            Q["_select_index"] = 0,
                            Q["sound_channel"] = null,
                            Q["chat_block"] = null,
                            Q["illust_showing"] = !0,
                            W.Inst = Q,
                            Q;
                    }
                    return __extends(W, V),
                        W["onMainSkinChange"] = function () {
                            var Q = cfg["item_definition"].skin.get(GameMgr.Inst["account_data"]["avatar_id"]);
                            Q && Q["spine_type"] && CatFoodSpine["SpineMgr"].Inst["changeSpineImportant"](game["Tools"]["localUISrc"](Q.path) + "/spine");
                        },
                        W["randomDesktopID"] = function () {
                            var B = Q["UI_Sushe"]["commonViewList"][Q["UI_Sushe"]["using_commonview_index"]];
                            if (this["now_mjp_id"] = game["GameUtility"]["get_view_default_item_id"](game["EView"].mjp), this["now_desktop_id"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["desktop"]), B)
                                for (var V = 0; V < B["length"]; V++)
                                    B[V].slot == game["EView"].mjp ? this["now_mjp_id"] = B[V].type ? B[V]["item_id_list"][Math["floor"](Math["random"]() * B[V]["item_id_list"]["length"])] : B[V]["item_id"] : B[V].slot == game["EView"]["desktop"] && (this["now_desktop_id"] = B[V].type ? B[V]["item_id_list"][Math["floor"](Math["random"]() * B[V]["item_id_list"]["length"])] : B[V]["item_id"]);
                        },
                        W.init = function (B) {
                            var V = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCharacterInfo", {}, function (Z, S) {
                                if (Z || S["error"])
                                    Q["UIMgr"].Inst["showNetReqError"]("fetchCharacterInfo", Z, S);
                                else {
                                    if (app.Log.log("fetchCharacterInfo: " + JSON["stringify"](S)), S = JSON["parse"](JSON["stringify"](S)), S["main_character_id"] && S["characters"]) {
                                        // if (V["characters"] = [], S["characters"])
                                        //     for (var v = 0; v < S["characters"]["length"]; v++)
                                        //         V["characters"].push(S["characters"][v]);
                                        // if (V["skin_map"] = {}, S["skins"])
                                        //     for (var v = 0; v < S["skins"]["length"]; v++)
                                        //         V["skin_map"][S["skins"][v]] = 1;
                                        // V["main_character_id"] = S["main_character_id"];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = S.main_character_id;
                                        for (let i = 0; i < S.characters.length; i++) {
                                            if (S.characters[i].charid == S.main_character_id) {
                                                if (S.characters[i].extra_emoji !== undefined) {
                                                    fake_data.emoji = S.characters[i].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = S.skins[i];
                                                fake_data.exp = S.characters[i].exp;
                                                fake_data.level = S.characters[i].level;
                                                fake_data.is_upgraded = S.characters[i].is_upgraded;
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
                                        S.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        V["characters"] = [], V["characters"].push({
                                            charid: "200001",
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: "400101",
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), V["characters"].push({
                                            charid: "200002",
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: "400201",
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), V["skin_map"]["400101"] = 1, V["skin_map"]["400201"] = 1, V["main_character_id"] = "200001";
                                    if (V["send_gift_count"] = 0, V["send_gift_limit"] = 0, S["send_gift_count"] && (V["send_gift_count"] = S["send_gift_count"]), S["send_gift_limit"] && (V["send_gift_limit"] = S["send_gift_limit"]), S["finished_endings"])
                                        for (var v = 0; v < S["finished_endings"]["length"]; v++)
                                            V["finished_endings_map"][S["finished_endings"][v]] = 1;
                                    if (S["rewarded_endings"])
                                        for (var v = 0; v < S["rewarded_endings"]["length"]; v++)
                                            V["rewarded_endings_map"][S["rewarded_endings"][v]] = 1;
                                    if (V["star_chars"] = [], S["character_sort"] && (V["star_chars"] = S["character_sort"]), W["hidden_characters_map"] = {}, S["hidden_characters"])
                                        for (var i = 0, x = S["hidden_characters"]; i < x["length"]; i++) {
                                            var l = x[i];
                                            W["hidden_characters_map"][l] = 1;
                                        }
                                    B.run();
                                }
                            }),
                                // app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAllCommonViews", {}, function (B, W) {
                                //     if (B || W["error"])
                                //         Q["UIMgr"].Inst["showNetReqError"]("fetchAllCommonViews", B, W);
                                //      else {
                                //          V["using_commonview_index"] = W.use,
                                //          V["commonViewList"] = [[], [], [], [], [], [], [], []];
                                //          var Z = W["views"];
                                //          if (Z)
                                //              for (var S = 0; S < Z["length"]; S++) {
                                //                  var v = Z[S]["values"];
                                //                  v && (V["commonViewList"][Z[S]["index"]] = v);
                                //              }
                                V["randomDesktopID"](),
                                V.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst["load_mjp_view"](),
                                GameMgr.Inst["load_touming_mjp_view"]();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //     }
                            // });
                        },
                        W["on_data_updata"] = function (B) {
                            if (B["character"]) {
                                var V = JSON["parse"](JSON["stringify"](B["character"]));
                                if (V["characters"])
                                    for (var W = V["characters"], Z = 0; Z < W["length"]; Z++) {
                                        for (var S = !1, v = 0; v < this["characters"]["length"]; v++)
                                            if (this["characters"][v]["charid"] == W[Z]["charid"]) {
                                                this["characters"][v] = W[Z],
                                                    Q["UI_Sushe_Visit"].Inst && Q["UI_Sushe_Visit"].Inst["chara_info"] && Q["UI_Sushe_Visit"].Inst["chara_info"]["charid"] == this["characters"][v]["charid"] && (Q["UI_Sushe_Visit"].Inst["chara_info"] = this["characters"][v]),
                                                    S = !0;
                                                break;
                                            }
                                        S || this["characters"].push(W[Z]);
                                    }
                                if (V["skins"]) {
                                    for (var i = V["skins"], Z = 0; Z < i["length"]; Z++)
                                        this["skin_map"][i[Z]] = 1;
                                    Q["UI_Bag"].Inst["on_skin_change"]();
                                }
                                if (V["finished_endings"]) {
                                    for (var x = V["finished_endings"], Z = 0; Z < x["length"]; Z++)
                                        this["finished_endings_map"][x[Z]] = 1;
                                    Q["UI_Sushe_Visit"].Inst;
                                }
                                if (V["rewarded_endings"]) {
                                    for (var x = V["rewarded_endings"], Z = 0; Z < x["length"]; Z++)
                                        this["rewarded_endings_map"][x[Z]] = 1;
                                    Q["UI_Sushe_Visit"].Inst;
                                }
                            }
                        },
                        W["chara_owned"] = function (Q) {
                            for (var B = 0; B < this["characters"]["length"]; B++)
                                if (this["characters"][B]["charid"] == Q)
                                    return !0;
                            return !1;
                        },
                        W["skin_owned"] = function (Q) {
                            return this["skin_map"]["hasOwnProperty"](Q["toString"]());
                        },
                        W["add_skin"] = function (Q) {
                            this["skin_map"][Q] = 1;
                        },
                        Object["defineProperty"](W, "main_chara_info", {
                            get: function () {
                                for (var Q = 0; Q < this["characters"]["length"]; Q++)
                                    if (this["characters"][Q]["charid"] == this["main_character_id"])
                                        return this["characters"][Q];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        W["on_view_remove"] = function (Q) {
                            for (var B = 0; B < this["commonViewList"]["length"]; B++)
                                for (var V = this["commonViewList"][B], W = 0; W < V["length"]; W++)
                                    if (V[W]["item_id"] == Q && (V[W]["item_id"] = game["GameUtility"]["get_view_default_item_id"](V[W].slot)), V[W]["item_id_list"]) {
                                        for (var Z = 0; Z < V[W]["item_id_list"]["length"]; Z++)
                                            if (V[W]["item_id_list"][Z] == Q) {
                                                V[W]["item_id_list"]["splice"](Z, 1);
                                                break;
                                            }
                                        0 == V[W]["item_id_list"]["length"] && (V[W].type = 0);
                                    }
                            var S = cfg["item_definition"].item.get(Q);
                            S.type == game["EView"]["head_frame"] && GameMgr.Inst["account_data"]["avatar_frame"] == Q && (GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["head_frame"]));
                        },
                        W["add_finish_ending"] = function (Q) {
                            this["finished_endings_map"][Q] = 1;
                        },
                        W["add_reward_ending"] = function (Q) {
                            this["rewarded_endings_map"][Q] = 1;
                        },
                        W["check_all_char_repoint"] = function () {
                            for (var Q = 0; Q < W["characters"]["length"]; Q++)
                                if (this["check_char_redpoint"](W["characters"][Q]))
                                    return !0;
                            return !1;
                        },
                        W["check_char_redpoint"] = function (Q) {
                            // 去除小红点
                            // if (W["hidden_characters_map"][Q["charid"]])
                            return !1;
                            //END
                            var B = cfg.spot.spot["getGroup"](Q["charid"]);
                            if (B)
                                for (var V = 0; V < B["length"]; V++) {
                                    var Z = B[V];
                                    if (!(Z["is_married"] && !Q["is_upgraded"] || !Z["is_married"] && Q["level"] < Z["level_limit"]) && 2 == Z.type) {
                                        for (var S = !0, v = 0; v < Z["jieju"]["length"]; v++)
                                            if (Z["jieju"][v] && W["finished_endings_map"][Z["jieju"][v]]) {
                                                if (!W["rewarded_endings_map"][Z["jieju"][v]])
                                                    return !0;
                                                S = !1;
                                            }
                                        if (S)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        W["is_char_star"] = function (Q) {
                            return -1 != this["star_chars"]["indexOf"](Q);
                        },
                        W["change_char_star"] = function (Q) {
                            var B = this["star_chars"]["indexOf"](Q);
                            -1 != B ? this["star_chars"]["splice"](B, 1) : this["star_chars"].push(Q)
                            // 屏蔽网络请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "updateCharacterSort", {
                            //     sort: this["star_chars"]
                            // }, function () {});
                            // END
                        },
                        Object["defineProperty"](W["prototype"], "select_index", {
                            get: function () {
                                return this["_select_index"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        W["prototype"]["reset_select_index"] = function () {
                            this["_select_index"] = -1;
                        },
                        W["prototype"]["onCreate"] = function () {
                            var V = this;
                            this["contianer_illust"] = this.me["getChildByName"]("illust"),
                                this["illust"] = new Q["UI_Character_Skin"](this["contianer_illust"]["getChildByName"]("illust")["getChildByName"]("illust")),
                                this["illust_rect"] = Q["UIRect"]["CreateFromSprite"](this["illust"].me),
                                this["container_chat"] = this["contianer_illust"]["getChildByName"]("chat"),
                                this["chat_block"] = new Q["UI_Character_Chat"](this["container_chat"]),
                                this["contianer_illust"]["getChildByName"]("btn")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (!V["page_visit_character"].me["visible"] || !V["page_visit_character"]["cannot_click_say"])
                                        if (V["illust"]["onClick"](), V["sound_channel"])
                                            V["stopsay"]();
                                        else {
                                            if (!V["illust_showing"])
                                                return;
                                            V.say("lobby_normal");
                                        }
                                }, null, !1),
                                this["container_name"] = null,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name"), this["contianer_illust"]["getChildByName"]("container_name_en")["visible"] = !1, this["label_cv_title"] = this["container_name"]["getChildByName"]("label_CV_title")) : (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name_en"), this["contianer_illust"]["getChildByName"]("container_name")["visible"] = !1),
                                this["label_name"] = this["container_name"]["getChildByName"]("label_name"),
                                this["label_cv"] = this["container_name"]["getChildByName"]("label_CV"),
                                this["origin_illust_x"] = this["contianer_illust"].x,
                                this["container_page"] = this.me["getChildByName"]("container_page"),
                                this["page_select_character"] = new Q["UI_Sushe_Select"](),
                                this["container_page"]["addChild"](this["page_select_character"].me),
                                this["page_visit_character"] = new Q["UI_Sushe_Visit"](),
                                this["container_page"]["addChild"](this["page_visit_character"].me),
                                this["container_look_illust"] = new B(this.me["getChildByName"]("look_illust"), this["contianer_illust"]);
                        },
                        W["prototype"].show = function (Q) {
                            GameMgr.Inst["BehavioralStatistics"](15),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["page_visit_character"].me["visible"] = !1,
                                this["container_look_illust"].me["visible"] = !1;
                            for (var B = 0, V = 0; V < W["characters"]["length"]; V++)
                                if (W["characters"][V]["charid"] == W["main_character_id"]) {
                                    B = V;
                                    break;
                                }
                            0 == Q ? (this["change_select"](B), this["show_page_select"]()) : (this["_select_index"] = -1, this["illust_showing"] = !1, this["contianer_illust"]["visible"] = !1, this["page_select_character"].show(1));
                        },
                        W["prototype"]["starup_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"]["star_up_back"](W["characters"][this["_select_index"]]),
                                this["page_visit_character"]["show_levelup"]();
                        },
                        W["prototype"]["spot_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"].show(W["characters"][this["_select_index"]], 2);
                        },
                        W["prototype"]["go2Lobby"] = function () {
                            this["close"](Laya["Handler"]["create"](this, function () {
                                Q["UIMgr"].Inst["showLobby"]();
                            }));
                        },
                        W["prototype"]["close"] = function (B) {
                            var V = this;
                            this["illust_showing"] && Q["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 150, 0),
                                Laya["timer"].once(150, this, function () {
                                    V["enable"] = !1,
                                        B && B.run();
                                });
                        },
                        W["prototype"]["onDisable"] = function () {
                            view["AudioMgr"]["refresh_music_volume"](!1),
                                this["illust"]["clear"](),
                                this["stopsay"](),
                                this["container_look_illust"].me["visible"] && this["container_look_illust"]["close"]();
                        },
                        W["prototype"]["hide_illust"] = function () {
                            var B = this;
                            this["illust_showing"] && (this["illust_showing"] = !1, Q["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 200, 0, Laya["Handler"]["create"](this, function () {
                                B["contianer_illust"]["visible"] = !1;
                            })));
                        },
                        W["prototype"]["open_illust"] = function () {
                            if (!this["illust_showing"])
                                if (this["illust_showing"] = !0, this["_select_index"] >= 0)
                                    this["contianer_illust"]["visible"] = !0, this["contianer_illust"]["alpha"] = 1, Q["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var B = 0, V = 0; V < W["characters"]["length"]; V++)
                                        if (W["characters"][V]["charid"] == W["main_character_id"]) {
                                            B = V;
                                            break;
                                        }
                                    this["change_select"](B);
                                }
                        },
                        W["prototype"]["show_page_select"] = function () {
                            this["page_select_character"].show(0);
                        },
                        W["prototype"]["show_page_visit"] = function (Q) {
                            void 0 === Q && (Q = 0),
                                this["page_visit_character"].show(W["characters"][this["_select_index"]], Q);
                        },
                        W["prototype"]["change_select"] = function (B) {
                            this["_select_index"] = B,
                                this["illust"]["clear"](),
                                this["illust_showing"] = !0;
                            var V = W["characters"][B];
                            this["label_name"].text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].get(V["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].get(V["charid"])["name_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_name"].font = -1 != W["chs_fengyu_name_lst"]["indexOf"](V["charid"]) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["label_cv"].text = cfg["item_definition"]["character"].get(V["charid"])["desc_cv_" + GameMgr["client_language"]], this["label_cv_title"].text = 'CV') : this["label_cv"].text = "CV:" + cfg["item_definition"]["character"].get(V["charid"])["desc_cv_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_cv"].font = -1 != W["chs_fengyu_cv_lst"]["indexOf"](V["charid"]) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && (this["label_cv_title"].y = 355 - this["label_cv"]["textField"]["textHeight"] / 2 * 0.7);
                            var Z = new Q["UIRect"]();
                            Z.x = this["illust_rect"].x,
                                Z.y = this["illust_rect"].y,
                                Z["width"] = this["illust_rect"]["width"],
                                Z["height"] = this["illust_rect"]["height"],
                                "405503" == V.skin ? Z.y -= 70 : "403303" == V.skin && (Z.y += 117),
                                this["illust"]["setRect"](Z),
                                this["illust"]["setSkin"](V.skin, "full"),
                                this["contianer_illust"]["visible"] = !0,
                                Laya["Tween"]["clearAll"](this["contianer_illust"]),
                                this["contianer_illust"].x = this["origin_illust_x"],
                                this["contianer_illust"]["alpha"] = 1,
                                Q["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                    x: -30
                                }, 230),
                                this["stopsay"]();
                            var S = cfg["item_definition"].skin.get(V.skin);
                            S["spine_type"] ? (this["page_select_character"]["changeKaiguanShow"](!0), this["container_look_illust"]["dongtai_kaiguan"].show(this["illust"]["skin_id"])) : (this["page_select_character"]["changeKaiguanShow"](!1), this["container_look_illust"]["dongtai_kaiguan"].hide());
                        },
                        W["prototype"]["onChangeSkin"] = function (Q) {
                            W["characters"][this["_select_index"]].skin = Q,
                                this["change_select"](this["_select_index"]),
                                W["characters"][this["_select_index"]]["charid"] == W["main_character_id"] && (GameMgr.Inst["account_data"]["avatar_id"] = Q, W["onMainSkinChange"]())
                            // 屏蔽换肤请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                            //     character_id: W["characters"][this["_select_index"]]["charid"],
                            //     skin: Q
                            // }, function () {});
                            // 保存皮肤
                        },
                        W["prototype"].say = function (Q) {
                            var B = this,
                                V = W["characters"][this["_select_index"]];
                            this["chat_id"]++;
                            var Z = this["chat_id"],
                                S = view["AudioMgr"]["PlayCharactorSound"](V, Q, Laya["Handler"]["create"](this, function () {
                                    Laya["timer"].once(1000, B, function () {
                                        Z == B["chat_id"] && B["stopsay"]();
                                    });
                                }));
                            S && (this["chat_block"].show(S["words"]), this["sound_channel"] = S["sound"]);
                        },
                        W["prototype"]["stopsay"] = function () {
                            this["chat_block"]["close"](!1),
                                this["sound_channel"] && (this["sound_channel"].stop(), Laya["SoundManager"]["removeChannel"](this["sound_channel"]), this["sound_channel"] = null);
                        },
                        W["prototype"]["to_look_illust"] = function () {
                            var Q = this;
                            this["container_look_illust"].show(Laya["Handler"]["create"](this, function () {
                                Q["illust"]["playAnim"]("idle"),
                                    Q["page_select_character"].show(0);
                            }));
                        },
                        W["prototype"]["jump_to_char_skin"] = function (B, V) {
                            var Z = this;
                            if (void 0 === B && (B = -1), void 0 === V && (V = null), B >= 0)
                                for (var S = 0; S < W["characters"]["length"]; S++)
                                    if (W["characters"][S]["charid"] == B) {
                                        this["change_select"](S);
                                        break;
                                    }
                            Q["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                W.Inst["show_page_visit"](),
                                    Z["page_visit_character"]["show_pop_skin"](),
                                    Z["page_visit_character"]["set_jump_callback"](V);
                            }));
                        },
                        W["prototype"]["jump_to_char_qiyue"] = function (B) {
                            var V = this;
                            if (void 0 === B && (B = -1), B >= 0)
                                for (var Z = 0; Z < W["characters"]["length"]; Z++)
                                    if (W["characters"][Z]["charid"] == B) {
                                        this["change_select"](Z);
                                        break;
                                    }
                            Q["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                W.Inst["show_page_visit"](),
                                    V["page_visit_character"]["show_qiyue"]();
                            }));
                        },
                        W["prototype"]["jump_to_char_gift"] = function (B) {
                            var V = this;
                            if (void 0 === B && (B = -1), B >= 0)
                                for (var Z = 0; Z < W["characters"]["length"]; Z++)
                                    if (W["characters"][Z]["charid"] == B) {
                                        this["change_select"](Z);
                                        break;
                                    }
                            Q["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                W.Inst["show_page_visit"](),
                                    V["page_visit_character"]["show_gift"]();
                            }));
                        },
                        W["characters"] = [],
                        W["chs_fengyu_name_lst"] = ["200040", "200043"],
                        W["chs_fengyu_cv_lst"] = ["200047", "200050", "200054"],
                        W["skin_map"] = {},
                        W["main_character_id"] = 0,
                        W["send_gift_count"] = 0,
                        W["send_gift_limit"] = 0,
                        W["commonViewList"] = [],
                        W["using_commonview_index"] = 0,
                        W["finished_endings_map"] = {},
                        W["rewarded_endings_map"] = {},
                        W["star_chars"] = [],
                        W["hidden_characters_map"] = {},
                        W.Inst = null,
                        W;
                }
                    (Q["UIBase"]);
            Q["UI_Sushe"] = V;
        }
            (uiscript || (uiscript = {}));

        // 屏蔽改变宿舍角色的网络请求
        !function (Q) {
            var B = function () {
                function B(B) {
                    var W = this;
                    this["scrollview"] = null,
                        this["select_index"] = 0,
                        this["show_index_list"] = [],
                        this["only_show_star_char"] = !1,
                        this.me = B,
                        this.me["getChildByName"]("btn_visit")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            V.Inst["locking"] || V.Inst["close"](Laya["Handler"]["create"](W, function () {
                                Q["UI_Sushe"].Inst["show_page_visit"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_look")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            V.Inst["locking"] || V.Inst["close"](Laya["Handler"]["create"](W, function () {
                                Q["UI_Sushe"].Inst["to_look_illust"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_huanzhuang")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            V.Inst["locking"] || Q["UI_Sushe"].Inst["jump_to_char_skin"]();
                        }, null, !1),
                        this.me["getChildByName"]("btn_star")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            V.Inst["locking"] || W["onChangeStarShowBtnClick"]();
                        }, null, !1),
                        this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                        this["scrollview"]["setElastic"](),
                        this["dongtai_kaiguan"] = new Q["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            Q["UI_Sushe"].Inst["illust"]["resetSkin"]();
                        }));
                }
                return B["prototype"].show = function (B, V) {
                    void 0 === V && (V = !1),
                        this.me["visible"] = !0,
                        B ? this.me["alpha"] = 1 : Q["UIBase"]["anim_alpha_in"](this.me, {
                            x: 0
                        }, 200, 0),
                        this["getShowStarState"](),
                        this["sortShowCharsList"](),
                        V || (this.me["getChildByName"]("btn_star")["getChildAt"](1).x = this["only_show_star_char"] ? 107 : 47),
                        this["scrollview"]["reset"](),
                        this["scrollview"]["addItem"](this["show_index_list"]["length"]);
                },
                    B["prototype"]["render_character_cell"] = function (B) {
                        var V = this,
                            W = B["index"],
                            Z = B["container"],
                            S = B["cache_data"];
                        Z["visible"] = !0,
                            S["index"] = W,
                            S["inited"] || (S["inited"] = !0, Z["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                V["onClickAtHead"](S["index"]);
                            }), S.skin = new Q["UI_Character_Skin"](Z["getChildByName"]("btn")["getChildByName"]("head")), S.bg = Z["getChildByName"]("btn")["getChildByName"]('bg'), S["bound"] = Z["getChildByName"]("btn")["getChildByName"]("bound"), S["btn_star"] = Z["getChildByName"]("btn_star"), S.star = Z["getChildByName"]("btn")["getChildByName"]("star"), S["btn_star"]["clickHandler"] = new Laya["Handler"](this, function () {
                                V["onClickAtStar"](S["index"]);
                            }));
                        var v = Z["getChildByName"]("btn");
                        v["getChildByName"]("choose")["visible"] = W == this["select_index"];
                        var i = this["getCharInfoByIndex"](W);
                        v["getChildByName"]("redpoint")["visible"] = Q["UI_Sushe"]["check_char_redpoint"](i),
                            S.skin["setSkin"](i.skin, "bighead"),
                            v["getChildByName"]("using")["visible"] = i["charid"] == Q["UI_Sushe"]["main_character_id"],
                            Z["getChildByName"]("btn")["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (i["is_upgraded"] ? "2.png" : ".png"));
                        var x = cfg["item_definition"]["character"].get(i["charid"]);
                        'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? S["bound"].skin = x.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (i["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (i["is_upgraded"] ? "2.png" : ".png")) : x.ur ? (S["bound"].pos(-10, -2), S["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (i["is_upgraded"] ? "6.png" : "5.png"))) : (S["bound"].pos(4, 20), S["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (i["is_upgraded"] ? "4.png" : "3.png"))),
                            S["btn_star"]["visible"] = this["select_index"] == W,
                            S.star["visible"] = Q["UI_Sushe"]["is_char_star"](i["charid"]) || this["select_index"] == W,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (S.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (Q["UI_Sushe"]["is_char_star"](i["charid"]) ? 'l' : 'd') + (i["is_upgraded"] ? "1.png" : ".png")), v["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(i["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|')) : (S.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (Q["UI_Sushe"]["is_char_star"](i["charid"]) ? "l.png" : "d.png")), v["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(i["charid"])["name_" + GameMgr["client_language"]]),
                            ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && ("200041" == i["charid"] ? (v["getChildByName"]("label_name")["scaleX"] = 0.67, v["getChildByName"]("label_name")["scaleY"] = 0.57) : (v["getChildByName"]("label_name")["scaleX"] = 0.7, v["getChildByName"]("label_name")["scaleY"] = 0.6));
                    },
                    B["prototype"]["onClickAtHead"] = function (B) {
                        if (this["select_index"] == B) {
                            var V = this["getCharInfoByIndex"](B);
                            if (V["charid"] != Q["UI_Sushe"]["main_character_id"])
                                if (Q["UI_PiPeiYuYue"].Inst["enable"])
                                    Q["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2769));
                                else {
                                    var W = Q["UI_Sushe"]["main_character_id"];
                                    Q["UI_Sushe"]["main_character_id"] = V["charid"];
                                    // app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                    //     character_id: Q["UI_Sushe"]["main_character_id"]
                                    // }, function () { }),
                                    GameMgr.Inst["account_data"]["avatar_id"] = V.skin,
                                        Q["UI_Sushe"]["onMainSkinChange"]();
                                    // 保存人物和皮肤
                                    MMP.settings.character = V.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = V.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var Z = 0; Z < this["show_index_list"]["length"]; Z++)
                                        this["getCharInfoByIndex"](Z)["charid"] == W && this["scrollview"]["wantToRefreshItem"](Z);
                                    this["scrollview"]["wantToRefreshItem"](B);
                                }
                        } else {
                            var S = this["select_index"];
                            this["select_index"] = B,
                                S >= 0 && this["scrollview"]["wantToRefreshItem"](S),
                                this["scrollview"]["wantToRefreshItem"](B),
                                Q["UI_Sushe"].Inst["change_select"](this["show_index_list"][B]);
                        }
                    },
                    B["prototype"]["onClickAtStar"] = function (B) {
                        if (Q["UI_Sushe"]["change_char_star"](this["getCharInfoByIndex"](B)["charid"]), this["only_show_star_char"])
                            this["scrollview"]["wantToRefreshItem"](B);
                        else if (this.show(!0), Math["floor"](this["show_index_list"]["length"] / 3) - 3 > 0) {
                            var V = (Math["floor"](this["select_index"] / 3) - 1) / (Math["floor"](this["show_index_list"]["length"] / 3) - 3);
                            this["scrollview"].rate = Math.min(1, Math.max(0, V));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    B["prototype"]["close"] = function (B) {
                        var V = this;
                        this.me["visible"] && (B ? this.me["visible"] = !1 : Q["UIBase"]["anim_alpha_out"](this.me, {
                            x: 0
                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                            V.me["visible"] = !1;
                        })));
                    },
                    B["prototype"]["onChangeStarShowBtnClick"] = function () {
                        if (!this["only_show_star_char"]) {
                            for (var B = !1, V = 0, W = Q["UI_Sushe"]["star_chars"]; V < W["length"]; V++) {
                                var Z = W[V];
                                if (!Q["UI_Sushe"]["hidden_characters_map"][Z]) {
                                    B = !0;
                                    break;
                                }
                            }
                            if (!B)
                                return Q["UI_SecondConfirm"].Inst["show_only_confirm"](game["Tools"]["strOfLocalization"](3301)), void 0;
                        }
                        Q["UI_Sushe"].Inst["change_select"](this["show_index_list"]["length"] > 0 ? this["show_index_list"][0] : 0),
                            this["only_show_star_char"] = !this["only_show_star_char"],
                            app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], this["only_show_star_char"] ? 1 : 0);
                        var S = this.me["getChildByName"]("btn_star")["getChildAt"](1);
                        Laya["Tween"]["clearAll"](S),
                            Laya["Tween"].to(S, {
                                x: this["only_show_star_char"] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    B["prototype"]["getShowStarState"] = function () {
                        if (0 == Q["UI_Sushe"]["star_chars"]["length"])
                            return this["only_show_star_char"] = !1, void 0;
                        if (this["only_show_star_char"] = 1 == app["PlayerBehaviorStatistic"]["get_val"](app["EBehaviorType"]["Chara_Show_Star"]), this["only_show_star_char"]) {
                            for (var B = 0, V = Q["UI_Sushe"]["star_chars"]; B < V["length"]; B++) {
                                var W = V[B];
                                if (!Q["UI_Sushe"]["hidden_characters_map"][W])
                                    return;
                            }
                            this["only_show_star_char"] = !1,
                                app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], 0);
                        }
                    },
                    B["prototype"]["sortShowCharsList"] = function () {
                        this["show_index_list"] = [],
                            this["select_index"] = -1;
                        for (var B = 0, V = Q["UI_Sushe"]["star_chars"]; B < V["length"]; B++) {
                            var W = V[B];
                            if (!Q["UI_Sushe"]["hidden_characters_map"][W])
                                for (var Z = 0; Z < Q["UI_Sushe"]["characters"]["length"]; Z++)
                                    if (Q["UI_Sushe"]["characters"][Z]["charid"] == W) {
                                        Z == Q["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]),
                                            this["show_index_list"].push(Z);
                                        break;
                                    }
                        }
                        if (!this["only_show_star_char"])
                            for (var Z = 0; Z < Q["UI_Sushe"]["characters"]["length"]; Z++)
                                Q["UI_Sushe"]["hidden_characters_map"][Q["UI_Sushe"]["characters"][Z]["charid"]] || -1 == this["show_index_list"]["indexOf"](Z) && (Z == Q["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]), this["show_index_list"].push(Z));
                    },
                    B["prototype"]["getCharInfoByIndex"] = function (B) {
                        return Q["UI_Sushe"]["characters"][this["show_index_list"][B]];
                    },
                    B;
            }
                (),
                V = function (V) {
                    function W() {
                        var Q = V.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["lobby"]["sushe_selectUI"]() : new ui["lobby"]["sushe_select_enUI"]()) || this;
                        return Q["bg_width_head"] = 962,
                            Q["bg_width_zhuangban"] = 1819,
                            Q["bg2_delta"] = -29,
                            Q["container_top"] = null,
                            Q["locking"] = !1,
                            Q.tabs = [],
                            Q["tab_index"] = 0,
                            W.Inst = Q,
                            Q;
                    }
                    return __extends(W, V),
                        W["prototype"]["onCreate"] = function () {
                            var V = this;
                            this["container_top"] = this.me["getChildByName"]("top"),
                                this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    V["locking"] || (1 == V["tab_index"] && V["container_zhuangban"]["changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](V, function () {
                                        V["close"](),
                                            Q["UI_Sushe"].Inst["go2Lobby"]();
                                    }), null) : (V["close"](), Q["UI_Sushe"].Inst["go2Lobby"]()));
                                }, null, !1),
                                this.root = this.me["getChildByName"]("root"),
                                this.bg2 = this.root["getChildByName"]("bg2"),
                                this.bg = this.root["getChildByName"]('bg');
                            for (var W = this.root["getChildByName"]("container_tabs"), Z = function (B) {
                                S.tabs.push(W["getChildAt"](B)),
                                    S.tabs[B]["clickHandler"] = new Laya["Handler"](S, function () {
                                        V["locking"] || V["tab_index"] != B && (1 == V["tab_index"] && V["container_zhuangban"]["changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](V, function () {
                                            V["change_tab"](B);
                                        }), null) : V["change_tab"](B));
                                    });
                            }, S = this, v = 0; v < W["numChildren"]; v++)
                                Z(v);
                            this["container_head"] = new B(this.root["getChildByName"]("container_heads")),
                                this["container_zhuangban"] = new Q["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                    return V["locking"];
                                }));
                        },
                        W["prototype"].show = function (B) {
                            var V = this;
                            this["enable"] = !0,
                                this["locking"] = !0,
                                this["container_head"]["dongtai_kaiguan"]["refresh"](),
                                this["tab_index"] = B,
                                0 == this["tab_index"] ? (this.bg["width"] = this["bg_width_head"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"]["close"](!0), this["container_head"].show(!0), Q["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), Q["UIBase"]["anim_alpha_in"](this.root, {
                                    x: 30
                                }, 200)) : (this.bg["width"] = this["bg_width_zhuangban"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"].show(!0), this["container_head"]["close"](!0), Q["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), Q["UIBase"]["anim_alpha_in"](this.root, {
                                    y: 30
                                }, 200)),
                                Laya["timer"].once(200, this, function () {
                                    V["locking"] = !1;
                                });
                            for (var W = 0; W < this.tabs["length"]; W++) {
                                var Z = this.tabs[W];
                                Z.skin = game["Tools"]["localUISrc"](W == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var S = Z["getChildByName"]("word");
                                S["color"] = W == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                    S["scaleX"] = S["scaleY"] = W == this["tab_index"] ? 1.1 : 1,
                                    W == this["tab_index"] && Z["parent"]["setChildIndex"](Z, this.tabs["length"] - 1);
                            }
                        },
                        W["prototype"]["change_tab"] = function (B) {
                            var V = this;
                            this["tab_index"] = B;
                            for (var W = 0; W < this.tabs["length"]; W++) {
                                var Z = this.tabs[W];
                                Z.skin = game["Tools"]["localUISrc"](W == B ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var S = Z["getChildByName"]("word");
                                S["color"] = W == B ? "#552c1c" : "#d3a86c",
                                    S["scaleX"] = S["scaleY"] = W == B ? 1.1 : 1,
                                    W == B && Z["parent"]["setChildIndex"](Z, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["container_zhuangban"]["close"](!1), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_head"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    Q["UI_Sushe"].Inst["open_illust"](),
                                        V["container_head"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_head"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])) : 1 == this["tab_index"] && (this["container_head"]["close"](!1), Q["UI_Sushe"].Inst["hide_illust"](), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_zhuangban"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    V["container_zhuangban"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_zhuangban"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])),
                                Laya["timer"].once(400, this, function () {
                                    V["locking"] = !1;
                                });
                        },
                        W["prototype"]["close"] = function (B) {
                            var V = this;
                            this["locking"] = !0,
                                Q["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150),
                                0 == this["tab_index"] ? Q["UIBase"]["anim_alpha_out"](this.root, {
                                    x: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    V["container_head"]["close"](!0);
                                })) : Q["UIBase"]["anim_alpha_out"](this.root, {
                                    y: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    V["container_zhuangban"]["close"](!0);
                                })),
                                Laya["timer"].once(150, this, function () {
                                    V["locking"] = !1,
                                        V["enable"] = !1,
                                        B && B.run();
                                });
                        },
                        W["prototype"]["onDisable"] = function () {
                            for (var B = 0; B < Q["UI_Sushe"]["characters"]["length"]; B++) {
                                var V = Q["UI_Sushe"]["characters"][B].skin,
                                    W = cfg["item_definition"].skin.get(V);
                                W && Laya["loader"]["clearTextureRes"](game["LoadMgr"]["getResImageSkin"](W.path + "/bighead.png"));
                            }
                        },
                        W["prototype"]["changeKaiguanShow"] = function (Q) {
                            Q ? this["container_head"]["dongtai_kaiguan"].show() : this["container_head"]["dongtai_kaiguan"].hide();
                        },
                        W;
                }
                    (Q["UIBase"]);
            Q["UI_Sushe_Select"] = V;
        }
            (uiscript || (uiscript = {}));

        // 友人房
        !function (Q) {
            var B = function () {
                function B(Q) {
                    var B = this;
                    this["friends"] = [],
                        this["sortlist"] = [],
                        this.me = Q,
                        this.me["visible"] = !1,
                        this["blackbg"] = Q["getChildByName"]("blackbg"),
                        this["blackbg"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            B["locking"] || B["close"]();
                        }, null, !1),
                        this.root = Q["getChildByName"]("root"),
                        this["scrollview"] = this.root["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, this["render_item"], null, !1)),
                        this["noinfo"] = this.root["getChildByName"]("noinfo");
                }
                return B["prototype"].show = function () {
                    var B = this;
                    this["locking"] = !0,
                        this.me["visible"] = !0,
                        this["scrollview"]["reset"](),
                        this["friends"] = [],
                        this["sortlist"] = [];
                    for (var V = game["FriendMgr"]["friend_list"], W = 0; W < V["length"]; W++)
                        this["sortlist"].push(W);
                    this["sortlist"] = this["sortlist"].sort(function (Q, B) {
                        var W = V[Q],
                            Z = 0;
                        if (W["state"]["is_online"]) {
                            var S = game["Tools"]["playState2Desc"](W["state"]["playing"]);
                            Z += '' != S ? 30000000000 : 60000000000,
                                W.base["level"] && (Z += W.base["level"].id % 1000 * 10000000),
                                W.base["level3"] && (Z += W.base["level3"].id % 1000 * 10000),
                                Z += -Math["floor"](W["state"]["login_time"] / 10000000);
                        } else
                            Z += W["state"]["logout_time"];
                        var v = V[B],
                            i = 0;
                        if (v["state"]["is_online"]) {
                            var S = game["Tools"]["playState2Desc"](v["state"]["playing"]);
                            i += '' != S ? 30000000000 : 60000000000,
                                v.base["level"] && (i += v.base["level"].id % 1000 * 10000000),
                                v.base["level3"] && (i += v.base["level3"].id % 1000 * 10000),
                                i += -Math["floor"](v["state"]["login_time"] / 10000000);
                        } else
                            i += v["state"]["logout_time"];
                        return i - Z;
                    });
                    for (var W = 0; W < V["length"]; W++)
                        this["friends"].push({
                            f: V[W],
                            invited: !1
                        });
                    this["noinfo"]["visible"] = 0 == this["friends"]["length"],
                        this["scrollview"]["addItem"](this["friends"]["length"]),
                        Q["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                            B["locking"] = !1;
                        }));
                },
                    B["prototype"]["close"] = function () {
                        var B = this;
                        this["locking"] = !0,
                            Q["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                B["locking"] = !1,
                                    B.me["visible"] = !1;
                            }));
                    },
                    B["prototype"]["render_item"] = function (B) {
                        var V = B["index"],
                            W = B["container"],
                            S = B["cache_data"];
                        S.head || (S.head = new Q["UI_Head"](W["getChildByName"]("head"), "UI_WaitingRoom"), S.name = W["getChildByName"]("name"), S["state"] = W["getChildByName"]("label_state"), S.btn = W["getChildByName"]("btn_invite"), S["invited"] = W["getChildByName"]("invited"));
                        var v = this["friends"][this["sortlist"][V]];
                        S.head.id = game["GameUtility"]["get_limited_skin_id"](v.f.base["avatar_id"]),
                            S.head["set_head_frame"](v.f.base["account_id"], v.f.base["avatar_frame"]),
                            game["Tools"]["SetNickname"](S.name, v.f.base);
                        var i = !1;
                        if (v.f["state"]["is_online"]) {
                            var x = game["Tools"]["playState2Desc"](v.f["state"]["playing"]);
                            '' != x ? (S["state"].text = game["Tools"]["strOfLocalization"](2069, [x]), S["state"]["color"] = "#a9d94d", S.name["color"] = "#a9d94d") : (S["state"].text = game["Tools"]["strOfLocalization"](2071), S["state"]["color"] = "#58c4db", S.name["color"] = "#58c4db", i = !0);
                        } else
                            S["state"].text = game["Tools"]["strOfLocalization"](2072), S["state"]["color"] = "#8c8c8c", S.name["color"] = "#8c8c8c";
                        v["invited"] ? (S.btn["visible"] = !1, S["invited"]["visible"] = !0) : (S.btn["visible"] = !0, S["invited"]["visible"] = !1, game["Tools"]["setGrayDisable"](S.btn, !i), i && (S.btn["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            game["Tools"]["setGrayDisable"](S.btn, !0);
                            var B = {
                                room_id: Z.Inst["room_id"],
                                mode: Z.Inst["room_mode"],
                                nickname: GameMgr.Inst["account_data"]["nickname"],
                                verified: GameMgr.Inst["account_data"]["verified"],
                                account_id: GameMgr.Inst["account_id"]
                            };
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "sendClientMessage", {
                                target_id: v.f.base["account_id"],
                                type: game["EFriendMsgType"]["room_invite"],
                                content: JSON["stringify"](B)
                            }, function (B, V) {
                                B || V["error"] ? (game["Tools"]["setGrayDisable"](S.btn, !1), Q["UIMgr"].Inst["showNetReqError"]("sendClientMessage", B, V)) : (S.btn["visible"] = !1, S["invited"]["visible"] = !0, v["invited"] = !0);
                            });
                        }, null, !1)));
                    },
                    B;
            }
                (),
                V = function () {
                    function B(B) {
                        var V = this;
                        this.tabs = [],
                            this["tab_index"] = 0,
                            this.me = B,
                            this["blackmask"] = this.me["getChildByName"]("blackmask"),
                            this.root = this.me["getChildByName"]("root"),
                            this["page_head"] = new Q["zhuangban"]["Page_Waiting_Head"](this.root["getChildByName"]("container_heads")),
                            this["page_zhangban"] = new Q["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                return V["locking"];
                            }));
                        for (var W = this.root["getChildByName"]("container_tabs"), Z = function (B) {
                            S.tabs.push(W["getChildAt"](B)),
                                S.tabs[B]["clickHandler"] = new Laya["Handler"](S, function () {
                                    V["locking"] || V["tab_index"] != B && (1 == V["tab_index"] && V["page_zhangban"]["changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](V, function () {
                                        V["change_tab"](B);
                                    }), null) : V["change_tab"](B));
                                });
                        }, S = this, v = 0; v < W["numChildren"]; v++)
                            Z(v);
                        this.root["getChildByName"]("close")["clickHandler"] = new Laya["Handler"](this, function () {
                            V["locking"] || (1 == V["tab_index"] && V["page_zhangban"]["changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](V, function () {
                                V["close"](!1);
                            }), null) : V["close"](!1));
                        }),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function () {
                                V["locking"] || (1 == V["tab_index"] && V["page_zhangban"]["changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](V, function () {
                                    V["close"](!1);
                                }), null) : V["close"](!1));
                            });
                    }
                    return B["prototype"].show = function () {
                        var B = this;
                        this.me["visible"] = !0,
                            this["blackmask"]["alpha"] = 0,
                            this["locking"] = !0,
                            Laya["Tween"].to(this["blackmask"], {
                                alpha: 0.3
                            }, 150),
                            Q["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                B["locking"] = !1;
                            })),
                            this["tab_index"] = 0,
                            this["page_zhangban"]["close"](!0),
                            this["page_head"].show(!0);
                        for (var V = 0; V < this.tabs["length"]; V++) {
                            var W = this.tabs[V];
                            W.skin = game["Tools"]["localUISrc"](V == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                            var Z = W["getChildByName"]("word");
                            Z["color"] = V == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                Z["scaleX"] = Z["scaleY"] = V == this["tab_index"] ? 1.1 : 1,
                                V == this["tab_index"] && W["parent"]["setChildIndex"](W, this.tabs["length"] - 1);
                        }
                    },
                        B["prototype"]["change_tab"] = function (Q) {
                            var B = this;
                            this["tab_index"] = Q;
                            for (var V = 0; V < this.tabs["length"]; V++) {
                                var W = this.tabs[V];
                                W.skin = game["Tools"]["localUISrc"](V == Q ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var Z = W["getChildByName"]("word");
                                Z["color"] = V == Q ? "#552c1c" : "#d3a86c",
                                    Z["scaleX"] = Z["scaleY"] = V == Q ? 1.1 : 1,
                                    V == Q && W["parent"]["setChildIndex"](W, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["page_zhangban"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    B["page_head"].show(!1);
                                })) : 1 == this["tab_index"] && (this["page_head"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    B["page_zhangban"].show(!1);
                                })),
                                Laya["timer"].once(400, this, function () {
                                    B["locking"] = !1;
                                });
                        },
                        B["prototype"]["close"] = function (B) {
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
                            this.me["visible"] && (B ? (this["page_head"]["close"](!0), this["page_zhangban"]["close"](!0), this.me["visible"] = !1) : (app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: Z.Inst["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this["locking"] = !0, this["page_head"]["close"](!1), this["page_zhangban"]["close"](!1), Q["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                V["locking"] = !1,
                                    V.me["visible"] = !1;
                            }))));
                        },
                        B;
                }
                    (),
                W = function () {
                    function Q(Q) {
                        this["modes"] = [],
                            this.me = Q,
                            this.bg = this.me["getChildByName"]('bg'),
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]));
                    }
                    return Q["prototype"].show = function (Q) {
                        this.me["visible"] = !0,
                            this["scrollview"]["reset"](),
                            this["modes"] = Q,
                            this["scrollview"]["addItem"](Q["length"]);
                        var B = this["scrollview"]["total_height"];
                        B > 380 ? (this["scrollview"]["_content"].y = 10, this.bg["height"] = 400) : (this["scrollview"]["_content"].y = 390 - B, this.bg["height"] = B + 20),
                            this.bg["visible"] = !0;
                    },
                        Q["prototype"]["render_item"] = function (Q) {
                            var B = Q["index"],
                                V = Q["container"],
                                W = V["getChildByName"]("info");
                            W["fontSize"] = 40,
                                W["fontSize"] = this["modes"][B]["length"] <= 5 ? 40 : this["modes"][B]["length"] <= 9 ? 55 - 3 * this["modes"][B]["length"] : 28,
                                W.text = this["modes"][B];
                        },
                        Q;
                }
                    (),
                Z = function (Z) {
                    function S() {
                        var B = Z.call(this, new ui["lobby"]["waitingroomUI"]()) || this;
                        return B["skin_ready"] = "myres/room/btn_ready.png",
                            B["skin_cancel"] = "myres/room/btn_cancel.png",
                            B["skin_start"] = "myres/room/btn_start.png",
                            B["skin_start_no"] = "myres/room/btn_start_no.png",
                            B["update_seq"] = 0,
                            B["pre_msgs"] = [],
                            B["msg_tail"] = -1,
                            B["posted"] = !1,
                            B["label_rommid"] = null,
                            B["player_cells"] = [],
                            B["btn_ok"] = null,
                            B["btn_invite_friend"] = null,
                            B["btn_add_robot"] = null,
                            B["btn_dress"] = null,
                            B["beReady"] = !1,
                            B["room_id"] = -1,
                            B["owner_id"] = -1,
                            B["tournament_id"] = 0,
                            B["max_player_count"] = 0,
                            B["players"] = [],
                            B["container_rules"] = null,
                            B["container_top"] = null,
                            B["container_right"] = null,
                            B["locking"] = !1,
                            B["mousein_copy"] = !1,
                            B["popout"] = null,
                            B["room_link"] = null,
                            B["btn_copy_link"] = null,
                            B["last_start_room"] = 0,
                            B["invitefriend"] = null,
                            B["pre_choose"] = null,
                            B["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                            S.Inst = B,
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerReady", Laya["Handler"]["create"](B, function (Q) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON["stringify"](Q)),
                                    B["onReadyChange"](Q["account_id"], Q["ready"], Q["dressing"]);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerUpdate", Laya["Handler"]["create"](B, function (Q) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON["stringify"](Q)),
                                    B["onPlayerChange"](Q);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomGameStart", Laya["Handler"]["create"](B, function (Q) {
                                B["enable"] && (app.Log.log("NotifyRoomGameStart:" + JSON["stringify"](Q)), GameMgr.Inst["onPipeiYuyueSuccess"](0, "youren"), B["onGameStart"](Q));
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomKickOut", Laya["Handler"]["create"](B, function (Q) {
                                app.Log.log("NotifyRoomKickOut:" + JSON["stringify"](Q)),
                                    B["onBeKictOut"]();
                            })),
                            game["LobbyNetMgr"].Inst["add_connect_listener"](Laya["Handler"]["create"](B, function () {
                                B["enable"] && B.hide(Laya["Handler"]["create"](B, function () {
                                    Q["UI_Lobby"].Inst["enable"] = !0;
                                }));
                            }, null, !1)),
                            B;
                    }
                    return __extends(S, Z),
                        S["prototype"]["push_msg"] = function (Q) {
                            this["pre_msgs"]["length"] < 15 ? this["pre_msgs"].push(JSON["parse"](Q)) : (this["msg_tail"] = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], this["pre_msgs"][this["msg_tail"]] = JSON["parse"](Q));
                        },
                        Object["defineProperty"](S["prototype"], "inRoom", {
                            get: function () {
                                return -1 != this["room_id"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object["defineProperty"](S["prototype"], "robot_count", {
                            get: function () {
                                for (var Q = 0, B = 0; B < this["players"]["length"]; B++)
                                    2 == this["players"][B]["category"] && Q++;
                                return Q;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        S["prototype"]["resetData"] = function () {
                            this["room_id"] = -1,
                                this["owner_id"] = -1,
                                this["room_mode"] = {},
                                this["max_player_count"] = 0,
                                this["players"] = [];
                        },
                        S["prototype"]["updateData"] = function (Q) {
                            if (!Q)
                                return this["resetData"](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < Q.persons.length; i++) {

                                if (Q.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    Q.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    Q.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    Q.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    Q.persons[i].title = GameMgr.Inst.account_data.title;
                                    Q.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        Q.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this["room_id"] = Q["room_id"],
                                this["owner_id"] = Q["owner_id"],
                                this["room_mode"] = Q.mode,
                                this["public_live"] = Q["public_live"],
                                this["tournament_id"] = 0,
                                Q["tournament_id"] && (this["tournament_id"] = Q["tournament_id"]),
                                this["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                                this["room_mode"]["detail_rule"] && (1 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2003)), 2 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2004))),
                                this["max_player_count"] = Q["max_player_count"],
                                this["players"] = [];
                            for (var B = 0; B < Q["persons"]["length"]; B++) {
                                var V = Q["persons"][B];
                                V["ready"] = !1,
                                    V["cell_index"] = -1,
                                    V["category"] = 1,
                                    this["players"].push(V);
                            }
                            for (var B = 0; B < Q["robot_count"]; B++)
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
                            for (var B = 0; B < Q["ready_list"]["length"]; B++)
                                for (var W = 0; W < this["players"]["length"]; W++)
                                    if (this["players"][W]["account_id"] == Q["ready_list"][B]) {
                                        this["players"][W]["ready"] = !0;
                                        break;
                                    }
                            this["update_seq"] = 0,
                                Q.seq && (this["update_seq"] = Q.seq);
                        },
                        S["prototype"]["onReadyChange"] = function (Q, B, V) {
                            for (var W = 0; W < this["players"]["length"]; W++)
                                if (this["players"][W]["account_id"] == Q) {
                                    this["players"][W]["ready"] = B,
                                        this["players"][W]["dressing"] = V,
                                        this["_onPlayerReadyChange"](this["players"][W]);
                                    break;
                                }
                            this["refreshStart"]();
                        },
                        S["prototype"]["onPlayerChange"] = function (Q) {
                            if (app.Log.log(Q), Q = Q["toJSON"](), !(Q.seq && Q.seq <= this["update_seq"])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < Q.player_list.length; i++) {

                                    if (Q.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        Q.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        Q.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        Q.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            Q.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (Q.update_list != undefined) {
                                    for (var i = 0; i < Q.update_list.length; i++) {

                                        if (Q.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            Q.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            Q.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            Q.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                Q.update_list[i].nickname = MMP.settings.nickname;
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
                                this["update_seq"] = Q.seq;
                                var B = {};
                                B.type = "onPlayerChange0",
                                    B["players"] = this["players"],
                                    B.msg = Q,
                                    this["push_msg"](JSON["stringify"](B));
                                var V = this["robot_count"],
                                    W = Q["robot_count"];
                                if (W < this["robot_count"]) {
                                    this["pre_choose"] && 2 == this["pre_choose"]["category"] && (this["pre_choose"]["category"] = 0, this["pre_choose"] = null, V--);
                                    for (var Z = 0; Z < this["players"]["length"]; Z++)
                                        2 == this["players"][Z]["category"] && V > W && (this["players"][Z]["category"] = 0, V--);
                                }
                                for (var S = [], v = Q["player_list"], Z = 0; Z < this["players"]["length"]; Z++)
                                    if (1 == this["players"][Z]["category"]) {
                                        for (var i = -1, x = 0; x < v["length"]; x++)
                                            if (v[x]["account_id"] == this["players"][Z]["account_id"]) {
                                                i = x;
                                                break;
                                            }
                                        if (-1 != i) {
                                            var l = v[i];
                                            S.push(this["players"][Z]),
                                                this["players"][Z]["avatar_id"] = l["avatar_id"],
                                                this["players"][Z]["title"] = l["title"],
                                                this["players"][Z]["verified"] = l["verified"];
                                        }
                                    } else
                                        2 == this["players"][Z]["category"] && S.push(this["players"][Z]);
                                this["players"] = S;
                                for (var Z = 0; Z < v["length"]; Z++) {
                                    for (var m = !1, l = v[Z], x = 0; x < this["players"]["length"]; x++)
                                        if (1 == this["players"][x]["category"] && this["players"][x]["account_id"] == l["account_id"]) {
                                            m = !0;
                                            break;
                                        }
                                    m || this["players"].push({
                                        account_id: l["account_id"],
                                        avatar_id: l["avatar_id"],
                                        nickname: l["nickname"],
                                        verified: l["verified"],
                                        title: l["title"],
                                        level: l["level"],
                                        level3: l["level3"],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var s = [!1, !1, !1, !1], Z = 0; Z < this["players"]["length"]; Z++)
                                    - 1 != this["players"][Z]["cell_index"] && (s[this["players"][Z]["cell_index"]] = !0, this["_refreshPlayerInfo"](this["players"][Z]));
                                for (var Z = 0; Z < this["players"]["length"]; Z++)
                                    if (1 == this["players"][Z]["category"] && -1 == this["players"][Z]["cell_index"])
                                        for (var x = 0; x < this["max_player_count"]; x++)
                                            if (!s[x]) {
                                                this["players"][Z]["cell_index"] = x,
                                                    s[x] = !0,
                                                    this["_refreshPlayerInfo"](this["players"][Z]);
                                                break;
                                            }
                                for (var V = this["robot_count"], W = Q["robot_count"]; W > V;) {
                                    for (var f = -1, x = 0; x < this["max_player_count"]; x++)
                                        if (!s[x]) {
                                            f = x;
                                            break;
                                        }
                                    if (-1 == f)
                                        break;
                                    s[f] = !0,
                                        this["players"].push({
                                            category: 2,
                                            cell_index: f,
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
                                        V++;
                                }
                                for (var Z = 0; Z < this["max_player_count"]; Z++)
                                    s[Z] || this["_clearCell"](Z);
                                var B = {};
                                if (B.type = "onPlayerChange1", B["players"] = this["players"], this["push_msg"](JSON["stringify"](B)), Q["owner_id"]) {
                                    if (this["owner_id"] = Q["owner_id"], this["enable"])
                                        if (this["owner_id"] == GameMgr.Inst["account_id"])
                                            this["refreshAsOwner"]();
                                        else
                                            for (var x = 0; x < this["players"]["length"]; x++)
                                                if (this["players"][x] && this["players"][x]["account_id"] == this["owner_id"]) {
                                                    this["_refreshPlayerInfo"](this["players"][x]);
                                                    break;
                                                }
                                } else if (this["enable"])
                                    if (this["owner_id"] == GameMgr.Inst["account_id"])
                                        this["refreshAsOwner"]();
                                    else
                                        for (var x = 0; x < this["players"]["length"]; x++)
                                            if (this["players"][x] && this["players"][x]["account_id"] == this["owner_id"]) {
                                                this["_refreshPlayerInfo"](this["players"][x]);
                                                break;
                                            }
                            }
                        },
                        S["prototype"]["onBeKictOut"] = function () {
                            this["resetData"](),
                                this["enable"] && (this["enable"] = !1, this["pop_change_view"]["close"](!1), Q["UI_Lobby"].Inst["enable"] = !0, Q["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](52)));
                        },
                        S["prototype"]["onCreate"] = function () {
                            var Z = this;
                            this["last_start_room"] = 0;
                            var S = this.me["getChildByName"]("root");
                            this["container_top"] = S["getChildByName"]("top"),
                                this["container_right"] = S["getChildByName"]("right"),
                                this["label_rommid"] = this["container_top"]["getChildByName"]("label_roomid");
                            for (var v = function (B) {
                                var V = S["getChildByName"]("player_" + B["toString"]()),
                                    W = {};
                                W["index"] = B,
                                    W["container"] = V,
                                    W["container_flag"] = V["getChildByName"]("flag"),
                                    W["container_flag"]["visible"] = !1,
                                    W["container_name"] = V["getChildByName"]("container_name"),
                                    W.name = V["getChildByName"]("container_name")["getChildByName"]("name"),
                                    W["btn_t"] = V["getChildByName"]("btn_t"),
                                    W["container_illust"] = V["getChildByName"]("container_illust"),
                                    W["illust"] = new Q["UI_Character_Skin"](V["getChildByName"]("container_illust")["getChildByName"]("illust")),
                                    W.host = V["getChildByName"]("host"),
                                    W["title"] = new Q["UI_PlayerTitle"](V["getChildByName"]("container_name")["getChildByName"]("title"), "UI_WaitingRoom"),
                                    W.rank = new Q["UI_Level"](V["getChildByName"]("container_name")["getChildByName"]("rank"), "UI_WaitingRoom"),
                                    W["is_robot"] = !1;
                                var v = 0;
                                W["btn_t"]["clickHandler"] = Laya["Handler"]["create"](i, function () {
                                    if (!(Z["locking"] || Laya["timer"]["currTimer"] < v)) {
                                        v = Laya["timer"]["currTimer"] + 500;
                                        for (var Q = 0; Q < Z["players"]["length"]; Q++)
                                            if (Z["players"][Q]["cell_index"] == B) {
                                                Z["kickPlayer"](Q);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    W["btn_info"] = V["getChildByName"]("btn_info"),
                                    W["btn_info"]["clickHandler"] = Laya["Handler"]["create"](i, function () {
                                        if (!Z["locking"])
                                            for (var V = 0; V < Z["players"]["length"]; V++)
                                                if (Z["players"][V]["cell_index"] == B) {
                                                    Z["players"][V]["account_id"] && Z["players"][V]["account_id"] > 0 && Q["UI_OtherPlayerInfo"].Inst.show(Z["players"][V]["account_id"], Z["room_mode"].mode < 10 ? 1 : 2, 1);
                                                    break;
                                                }
                                    }, null, !1),
                                    i["player_cells"].push(W);
                            }, i = this, x = 0; 4 > x; x++)
                                v(x);
                            this["btn_ok"] = S["getChildByName"]("btn_ok");
                            var l = 0;
                            this["btn_ok"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < l + 500 || (l = Laya["timer"]["currTimer"], Z["owner_id"] == GameMgr.Inst["account_id"] ? Z["getStart"]() : Z["switchReady"]());
                            }, null, !1);
                            var m = 0;
                            this["container_top"]["getChildByName"]("btn_leave")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < m + 500 || (m = Laya["timer"]["currTimer"], Z["leaveRoom"]());
                            }, null, !1),
                                this["btn_invite_friend"] = this["container_right"]["getChildByName"]("btn_friend"),
                                this["btn_invite_friend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Z["locking"] || Z["invitefriend"].show();
                                }, null, !1),
                                this["btn_add_robot"] = this["container_right"]["getChildByName"]("btn_robot");
                            var s = 0;
                            this["btn_add_robot"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Z["locking"] || Laya["timer"]["currTimer"] < s || (s = Laya["timer"]["currTimer"] + 1000, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: Z["robot_count"] + 1
                                }, function (B, V) {
                                    (B || V["error"] && 1111 != V["error"].code) && Q["UIMgr"].Inst["showNetReqError"]("modifyRoom_add", B, V),
                                        s = 0;
                                }));
                            }, null, !1),
                                this["container_right"]["getChildByName"]("btn_help")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (!Z["locking"]) {
                                        var B = 0;
                                        Z["room_mode"]["detail_rule"] && Z["room_mode"]["detail_rule"]["chuanma"] && (B = 1),
                                            Q["UI_Rules"].Inst.show(0, null, B);
                                    }
                                }, null, !1),
                                this["btn_dress"] = this["container_right"]["getChildByName"]("btn_view"),
                                this["btn_dress"]["clickHandler"] = new Laya["Handler"](this, function () {
                                    Z["locking"] || Z["beReady"] && Z["owner_id"] != GameMgr.Inst["account_id"] || (Z["pop_change_view"].show(), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                        ready: Z["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                });
                            var f = this["container_right"]["getChildByName"]("btn_copy");
                            f.on("mouseover", this, function () {
                                Z["mousein_copy"] = !0;
                            }),
                                f.on("mouseout", this, function () {
                                    Z["mousein_copy"] = !1;
                                }),
                                f["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Z["popout"]["visible"] || (GameMgr.Inst["BehavioralStatistics"](12), Z["popout"]["visible"] = !0, Q["UIBase"]["anim_pop_out"](Z["popout"], null));
                                }, null, !1),
                                this["container_rules"] = new W(this["container_right"]["getChildByName"]("container_rules")),
                                this["popout"] = this.me["getChildByName"]("pop"),
                                this["room_link"] = this["popout"]["getChildByName"]("input")["getChildByName"]("txtinput"),
                                this["room_link"]["editable"] = !1,
                                this["btn_copy_link"] = this["popout"]["getChildByName"]("btn_copy"),
                                this["btn_copy_link"]["visible"] = !1,
                                GameMgr["inConch"] ? (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    var B = Laya["PlatformClass"]["createClass"]("layaair.majsoul.mjmgr");
                                    B.call("setSysClipboardText", Z["room_link"].text),
                                        Q["UIBase"]["anim_pop_hide"](Z["popout"], Laya["Handler"]["create"](Z, function () {
                                            Z["popout"]["visible"] = !1;
                                        })),
                                        Q["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)) : GameMgr["iniOSWebview"] && (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Laya["Browser"]["window"]["wkbridge"]["callNative"]("copy2clip", Z["room_link"].text, function () { }),
                                        Q["UIBase"]["anim_pop_hide"](Z["popout"], Laya["Handler"]["create"](Z, function () {
                                            Z["popout"]["visible"] = !1;
                                        })),
                                        Q["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)),
                                this["popout"]["visible"] = !1,
                                this["popout"]["getChildByName"]("btn_cancel")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Q["UIBase"]["anim_pop_hide"](Z["popout"], Laya["Handler"]["create"](Z, function () {
                                        Z["popout"]["visible"] = !1;
                                    }));
                                }, null, !1),
                                this["invitefriend"] = new B(this.me["getChildByName"]("invite_friend")),
                                this["pop_change_view"] = new V(this.me["getChildByName"]("pop_view"));
                        },
                        S["prototype"].show = function () {
                            var B = this;
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["mousein_copy"] = !1,
                                this["beReady"] = !1,
                                this["invitefriend"].me["visible"] = !1,
                                this["btn_add_robot"]["visible"] = !1,
                                this["btn_invite_friend"]["visible"] = !1,
                                game["Tools"]["setGrayDisable"](this["btn_dress"], !1),
                                this["pre_choose"] = null,
                                this["pop_change_view"]["close"](!0);
                            for (var V = 0; 4 > V; V++)
                                this["player_cells"][V]["container"]["visible"] = V < this["max_player_count"];
                            for (var V = 0; V < this["max_player_count"]; V++)
                                this["_clearCell"](V);
                            for (var V = 0; V < this["players"]["length"]; V++)
                                this["players"][V]["cell_index"] = V, this["_refreshPlayerInfo"](this["players"][V]);
                            this["msg_tail"] = -1,
                                this["pre_msgs"] = [],
                                this["posted"] = !1;
                            var W = {};
                            W.type = "show",
                                W["players"] = this["players"],
                                this["push_msg"](JSON["stringify"](W)),
                                this["owner_id"] == GameMgr.Inst["account_id"] ? (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]), this["refreshAsOwner"]()) : (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_ok"], !1)),
                                this["label_rommid"].text = 'en' == GameMgr["client_language"] ? '#' + this["room_id"]["toString"]() : this["room_id"]["toString"]();
                            var Z = [];
                            Z.push(game["Tools"]["room_mode_desc"](this["room_mode"].mode));
                            var S = this["room_mode"]["detail_rule"];
                            if (S) {
                                var v = 5,
                                    i = 20;
                                if (null != S["time_fixed"] && (v = S["time_fixed"]), null != S["time_add"] && (i = S["time_add"]), Z.push(v["toString"]() + '+' + i["toString"]() + game["Tools"]["strOfLocalization"](2019)), 0 != this["tournament_id"]) {
                                    var x = cfg["tournament"]["tournaments"].get(this["tournament_id"]);
                                    x && Z.push(x.name);
                                }
                                if (null != S["init_point"] && Z.push(game["Tools"]["strOfLocalization"](2199) + S["init_point"]), null != S["fandian"] && Z.push(game["Tools"]["strOfLocalization"](2094) + ':' + S["fandian"]), S["guyi_mode"] && Z.push(game["Tools"]["strOfLocalization"](3028)), null != S["dora_count"])
                                    switch (S["chuanma"] && (S["dora_count"] = 0), S["dora_count"]) {
                                        case 0:
                                            Z.push(game["Tools"]["strOfLocalization"](2044));
                                            break;
                                        case 2:
                                            Z.push(game["Tools"]["strOfLocalization"](2047));
                                            break;
                                        case 3:
                                            Z.push(game["Tools"]["strOfLocalization"](2045));
                                            break;
                                        case 4:
                                            Z.push(game["Tools"]["strOfLocalization"](2046));
                                    }
                                null != S["shiduan"] && 1 != S["shiduan"] && Z.push(game["Tools"]["strOfLocalization"](2137)),
                                    2 === S["fanfu"] && Z.push(game["Tools"]["strOfLocalization"](2763)),
                                    4 === S["fanfu"] && Z.push(game["Tools"]["strOfLocalization"](2764)),
                                    null != S["bianjietishi"] && 1 != S["bianjietishi"] && Z.push(game["Tools"]["strOfLocalization"](2200)),
                                    this["room_mode"].mode >= 10 && this["room_mode"].mode <= 14 && (null != S["have_zimosun"] && 1 != S["have_zimosun"] ? Z.push(game["Tools"]["strOfLocalization"](2202)) : Z.push(game["Tools"]["strOfLocalization"](2203)));
                            }
                            this["container_rules"].show(Z),
                                this["enable"] = !0,
                                this["locking"] = !0,
                                Q["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200);
                            for (var V = 0; V < this["player_cells"]["length"]; V++)
                                Q["UIBase"]["anim_alpha_in"](this["player_cells"][V]["container"], {
                                    x: 80
                                }, 150, 150 + 50 * V, null, Laya.Ease["backOut"]);
                            Q["UIBase"]["anim_alpha_in"](this["btn_ok"], {}, 100, 600),
                                Q["UIBase"]["anim_alpha_in"](this["container_right"], {
                                    x: 20
                                }, 100, 500),
                                Laya["timer"].once(600, this, function () {
                                    B["locking"] = !1;
                                });
                            var l = game["Tools"]["room_mode_desc"](this["room_mode"].mode);
                            this["room_link"].text = game["Tools"]["strOfLocalization"](2221, [this["room_id"]["toString"]()]),
                                '' != l && (this["room_link"].text += '(' + l + ')');
                            var m = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                            this["room_link"].text += ': ' + m + "?room=" + this["room_id"];
                        },
                        S["prototype"]["leaveRoom"] = function () {
                            var B = this;
                            this["locking"] || app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (V, W) {
                                V || W["error"] ? Q["UIMgr"].Inst["showNetReqError"]("leaveRoom", V, W) : (B["room_id"] = -1, B.hide(Laya["Handler"]["create"](B, function () {
                                    Q["UI_Lobby"].Inst["enable"] = !0;
                                })));
                            });
                        },
                        S["prototype"]["tryToClose"] = function (B) {
                            var V = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (W, Z) {
                                W || Z["error"] ? (Q["UIMgr"].Inst["showNetReqError"]("leaveRoom", W, Z), B["runWith"](!1)) : (V["enable"] = !1, V["pop_change_view"]["close"](!0), B["runWith"](!0));
                            });
                        },
                        S["prototype"].hide = function (B) {
                            var V = this;
                            this["locking"] = !0,
                                Q["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150);
                            for (var W = 0; W < this["player_cells"]["length"]; W++)
                                Q["UIBase"]["anim_alpha_out"](this["player_cells"][W]["container"], {
                                    x: 80
                                }, 150, 0, null);
                            Q["UIBase"]["anim_alpha_out"](this["btn_ok"], {}, 150),
                                Q["UIBase"]["anim_alpha_out"](this["container_right"], {
                                    x: 20
                                }, 150),
                                Laya["timer"].once(200, this, function () {
                                    V["locking"] = !1,
                                        V["enable"] = !1,
                                        B && B.run();
                                }),
                                document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        S["prototype"]["onDisbale"] = function () {
                            Laya["timer"]["clearAll"](this);
                            for (var Q = 0; Q < this["player_cells"]["length"]; Q++)
                                Laya["loader"]["clearTextureRes"](this["player_cells"][Q]["illust"].skin);
                            document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        S["prototype"]["switchReady"] = function () {
                            this["owner_id"] != GameMgr.Inst["account_id"] && (this["beReady"] = !this["beReady"], this["btn_ok"].skin = game["Tools"]["localUISrc"](this["beReady"] ? this["skin_cancel"] : this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_dress"], this["beReady"]), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: this["beReady"],
                                dressing: !1
                            }, function () { }));
                        },
                        S["prototype"]["getStart"] = function () {
                            this["owner_id"] == GameMgr.Inst["account_id"] && (Laya["timer"]["currTimer"] < this["last_start_room"] + 2000 || (this["last_start_room"] = Laya["timer"]["currTimer"], app["NetAgent"]["sendReq2Lobby"]("Lobby", "startRoom", {}, function (B, V) {
                                (B || V["error"]) && Q["UIMgr"].Inst["showNetReqError"]("startRoom", B, V);
                            })));
                        },
                        S["prototype"]["kickPlayer"] = function (B) {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                var V = this["players"][B];
                                1 == V["category"] ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "kickPlayer", {
                                    account_id: this["players"][B]["account_id"]
                                }, function () { }) : 2 == V["category"] && (this["pre_choose"] = V, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: this["robot_count"] - 1
                                }, function (B, V) {
                                    (B || V["error"]) && Q["UIMgr"].Inst["showNetReqError"]("modifyRoom_minus", B, V);
                                }));
                            }
                        },
                        S["prototype"]["_clearCell"] = function (Q) {
                            if (!(0 > Q || Q >= this["player_cells"]["length"])) {
                                var B = this["player_cells"][Q];
                                B["container_flag"]["visible"] = !1,
                                    B["container_illust"]["visible"] = !1,
                                    B.name["visible"] = !1,
                                    B["container_name"]["visible"] = !1,
                                    B["btn_t"]["visible"] = !1,
                                    B.host["visible"] = !1;
                            }
                        },
                        S["prototype"]["_refreshPlayerInfo"] = function (Q) {
                            var B = Q["cell_index"];
                            if (!(0 > B || B >= this["player_cells"]["length"])) {
                                var V = this["player_cells"][B];
                                V["container_illust"]["visible"] = !0,
                                    V["container_name"]["visible"] = !0,
                                    V.name["visible"] = !0,
                                    game["Tools"]["SetNickname"](V.name, Q),
                                    V["btn_t"]["visible"] = this["owner_id"] == GameMgr.Inst["account_id"] && Q["account_id"] != GameMgr.Inst["account_id"],
                                    this["owner_id"] == Q["account_id"] && (V["container_flag"]["visible"] = !0, V.host["visible"] = !0),
                                    Q["account_id"] == GameMgr.Inst["account_id"] ? V["illust"]["setSkin"](Q["avatar_id"], "waitingroom") : V["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](Q["avatar_id"]), "waitingroom"),
                                    V["title"].id = game["Tools"]["titleLocalization"](Q["account_id"], Q["title"]),
                                    V.rank.id = Q[this["room_mode"].mode < 10 ? "level" : "level3"].id,
                                    this["_onPlayerReadyChange"](Q);
                            }
                        },
                        S["prototype"]["_onPlayerReadyChange"] = function (Q) {
                            var B = Q["cell_index"];
                            if (!(0 > B || B >= this["player_cells"]["length"])) {
                                var V = this["player_cells"][B];
                                V["container_flag"]["visible"] = this["owner_id"] == Q["account_id"] ? !0 : Q["ready"];
                            }
                        },
                        S["prototype"]["refreshAsOwner"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                for (var Q = 0, B = 0; B < this["players"]["length"]; B++)
                                    0 != this["players"][B]["category"] && (this["_refreshPlayerInfo"](this["players"][B]), Q++);
                                this["btn_add_robot"]["visible"] = !0,
                                    this["btn_invite_friend"]["visible"] = !0,
                                    game["Tools"]["setGrayDisable"](this["btn_invite_friend"], Q == this["max_player_count"]),
                                    game["Tools"]["setGrayDisable"](this["btn_add_robot"], Q == this["max_player_count"]),
                                    this["refreshStart"]();
                            }
                        },
                        S["prototype"]["refreshStart"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]),
                                    game["Tools"]["setGrayDisable"](this["btn_dress"], !1);
                                for (var Q = 0, B = 0; B < this["players"]["length"]; B++) {
                                    var V = this["players"][B];
                                    if (!V || 0 == V["category"])
                                        break;
                                    (V["account_id"] == this["owner_id"] || V["ready"]) && Q++;
                                }
                                if (game["Tools"]["setGrayDisable"](this["btn_ok"], Q != this["max_player_count"]), this["enable"]) {
                                    for (var W = 0, B = 0; B < this["max_player_count"]; B++) {
                                        var Z = this["player_cells"][B];
                                        Z && Z["container_flag"]["visible"] && W++;
                                    }
                                    if (Q != W && !this["posted"]) {
                                        this["posted"] = !0;
                                        var S = {};
                                        S["okcount"] = Q,
                                            S["okcount2"] = W,
                                            S.msgs = [];
                                        var v = 0,
                                            i = this["pre_msgs"]["length"] - 1;
                                        if (-1 != this["msg_tail"] && (v = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], i = this["msg_tail"]), v >= 0 && i >= 0) {
                                            for (var B = v; B != i; B = (B + 1) % this["pre_msgs"]["length"])
                                                S.msgs.push(this["pre_msgs"][B]);
                                            S.msgs.push(this["pre_msgs"][i]);
                                        }
                                        GameMgr.Inst["postInfo2Server"]("waitroom_err2", S, !1);
                                    }
                                }
                            }
                        },
                        S["prototype"]["onGameStart"] = function (Q) {
                            game["Tools"]["setGrayDisable"](this["btn_ok"], !0),
                                this["enable"] = !1,
                                game["MJNetMgr"].Inst["OpenConnect"](Q["connect_token"], Q["game_uuid"], Q["location"], !1, null);
                        },
                        S["prototype"]["onEnable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !0);
                        },
                        S["prototype"]["onDisable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !1);
                        },
                        S.Inst = null,
                        S;
                }
                    (Q["UIBase"]);
            Q["UI_WaitingRoom"] = Z;
        }
            (uiscript || (uiscript = {}));

        // 保存装扮
        !function (Q) {
            var B;
            !function (B) {
                var V = function () {
                    function V(V, W, Z) {
                        var S = this;
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
                            this["_locking"] = Z,
                            this["container_zhuangban0"] = V,
                            this["container_zhuangban1"] = W;
                        var v = this["container_zhuangban0"]["getChildByName"]("tabs");
                        v["vScrollBarSkin"] = '';
                        for (var i = function (B) {
                            var V = v["getChildAt"](B);
                            x.tabs.push(V),
                                V["clickHandler"] = new Laya["Handler"](x, function () {
                                    S["locking"] || S["tab_index"] != B && (S["_changed"] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](S, function () {
                                        S["change_tab"](B);
                                    }), null) : S["change_tab"](B));
                                });
                        }, x = this, l = 0; l < v["numChildren"]; l++)
                            i(l);
                        this["page_items"] = new B["Page_Items"](this["container_zhuangban1"]["getChildByName"]("page_items"), this),
                            this["page_headframe"] = new B["Page_Headframe"](this["container_zhuangban1"]["getChildByName"]("page_headframe")),
                            this["page_bgm"] = new B["Page_Bgm"](this["container_zhuangban1"]["getChildByName"]("page_bgm"), this),
                            this["page_desktop"] = new B["Page_Desktop"](this["container_zhuangban1"]["getChildByName"]("page_zhuobu"), this),
                            this["scrollview"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_view"])),
                            this["scrollview"]["setElastic"](),
                            this["btn_using"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_using"),
                            this["btn_save"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_save"),
                            this["btn_save"]["clickHandler"] = new Laya["Handler"](this, function () {
                                for (var B = [], V = 0; V < S["cell_titles"]["length"]; V++) {
                                    var W = S["slot_ids"][V];
                                    if (S["slot_map"][W]) {
                                        var Z = S["slot_map"][W];
                                        if (!(Z["item_id"] && Z["item_id"] != S["cell_default_item"][V] || Z["item_id_list"] && 0 != Z["item_id_list"]["length"]))
                                            continue;
                                        var v = [];
                                        if (Z["item_id_list"])
                                            for (var i = 0, x = Z["item_id_list"]; i < x["length"]; i++) {
                                                var l = x[i];
                                                l == S["cell_default_item"][V] ? v.push(0) : v.push(l);
                                            }
                                        B.push({
                                            slot: W,
                                            item_id: Z["item_id"],
                                            type: Z.type,
                                            item_id_list: v
                                        });
                                    }
                                }
                                S["btn_save"]["mouseEnabled"] = !1;
                                var m = S["tab_index"];
                                // START
                                // app["NetAgent"]["sendReq2Lobby"]("Lobby", "saveCommonViews", {
                                //     views: B,
                                //     save_index: m,
                                //     is_use: m == Q["UI_Sushe"]["using_commonview_index"] ? 1 : 0
                                // }, function (V, W) {
                                //     if (S["btn_save"]["mouseEnabled"] = !0, V || W["error"])
                                //         Q["UIMgr"].Inst["showNetReqError"]("saveCommonViews", V, W);
                                //     else {
                                if (Q["UI_Sushe"]["commonViewList"]["length"] < m)
                                    for (var Z = Q["UI_Sushe"]["commonViewList"]["length"]; m >= Z; Z++)
                                        Q["UI_Sushe"]["commonViewList"].push([]);
                                MMP.settings.commonViewList = Q.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = Q.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (Q["UI_Sushe"]["commonViewList"][m] = B, Q["UI_Sushe"]["using_commonview_index"] == m && S["onChangeGameView"](), S["tab_index"] != m)
                                    return;
                                S["btn_save"]["mouseEnabled"] = !0,
                                    S["_changed"] = !1,
                                    S["refresh_btn"]();
                                //     }
                                // });
                            }),
                            this["btn_use"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_use"),
                            this["btn_use"]["clickHandler"] = new Laya["Handler"](this, function () {
                                S["btn_use"]["mouseEnabled"] = !1;
                                var B = S["tab_index"];
                                // 屏蔽更换装扮网络请求
                                //app["NetAgent"]["sendReq2Lobby"]("Lobby", "useCommonView", {
                                //    index: B
                                //}, function (V, W) {
                                //    S["btn_use"]["mouseEnabled"] = !0,
                                //        V || W["error"] ? Q["UIMgr"].Inst["showNetReqError"]("useCommonView", V, W) : (
                                Q["UI_Sushe"]["using_commonview_index"] = B, S["refresh_btn"](), S["refresh_tab"](), S["onChangeGameView"]();
                                //});
                            }),
                            this["random"] = this["container_zhuangban1"]["getChildByName"]("random"),
                            this["random_slider"] = this["random"]["getChildByName"]("slider"),
                            this["btn_random"] = this["random"]["getChildByName"]("btn"),
                            this["btn_random"]["clickHandler"] = new Laya["Handler"](this, function () {
                                S["onRandomBtnClick"]();
                            });
                    }
                    return Object["defineProperty"](V["prototype"], "locking", {
                        get: function () {
                            return this["_locking"] ? this["_locking"].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object["defineProperty"](V["prototype"], "changed", {
                            get: function () {
                                return this["_changed"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        V["prototype"].show = function (B) {
                            game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !0),
                                this["container_zhuangban0"]["visible"] = !0,
                                this["container_zhuangban1"]["visible"] = !0,
                                B ? (this["container_zhuangban0"]["alpha"] = 1, this["container_zhuangban1"]["alpha"] = 1) : (Q["UIBase"]["anim_alpha_in"](this["container_zhuangban0"], {
                                    x: 0
                                }, 200), Q["UIBase"]["anim_alpha_in"](this["container_zhuangban1"], {
                                    x: 0
                                }, 200)),
                                this["change_tab"](Q["UI_Sushe"]["using_commonview_index"]);
                        },
                        V["prototype"]["change_tab"] = function (B) {
                            if (this["tab_index"] = B, this["refresh_tab"](), this["slot_map"] = {}, this["scrollview"]["reset"](), this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["select_index"] = 0, this["_changed"] = !1, !(this["tab_index"] < 0 || this["tab_index"] > 9)) {
                                if (this["tab_index"] < Q["UI_Sushe"]["commonViewList"]["length"])
                                    for (var V = Q["UI_Sushe"]["commonViewList"][this["tab_index"]], W = 0; W < V["length"]; W++)
                                        this["slot_map"][V[W].slot] = V[W];
                                this["scrollview"]["addItem"](this["cell_titles"]["length"]),
                                    this["onChangeSlotSelect"](0),
                                    this["refresh_btn"]();
                            }
                        },
                        V["prototype"]["refresh_tab"] = function () {
                            for (var B = 0; B < this.tabs["length"]; B++) {
                                var V = this.tabs[B];
                                V["mouseEnabled"] = this["tab_index"] != B,
                                    V["getChildByName"]('bg').skin = game["Tools"]["localUISrc"](this["tab_index"] == B ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                    V["getChildByName"]("num")["color"] = this["tab_index"] == B ? "#2f1e19" : "#f2c797";
                                var W = V["getChildByName"]("choosed");
                                Q["UI_Sushe"]["using_commonview_index"] == B ? (W["visible"] = !0, W.x = this["tab_index"] == B ? -18 : -4) : W["visible"] = !1;
                            }
                        },
                        V["prototype"]["refresh_btn"] = function () {
                            this["btn_save"]["visible"] = !1,
                                this["btn_save"]["mouseEnabled"] = !0,
                                this["btn_use"]["visible"] = !1,
                                this["btn_use"]["mouseEnabled"] = !0,
                                this["btn_using"]["visible"] = !1,
                                this["_changed"] ? this["btn_save"]["visible"] = !0 : (this["btn_use"]["visible"] = Q["UI_Sushe"]["using_commonview_index"] != this["tab_index"], this["btn_using"]["visible"] = Q["UI_Sushe"]["using_commonview_index"] == this["tab_index"]);
                        },
                        V["prototype"]["onChangeSlotSelect"] = function (Q) {
                            var B = this;
                            this["select_index"] = Q,
                                this["random"]["visible"] = !(6 == Q || 9 == Q);
                            var V = 0;
                            Q >= 0 && Q < this["cell_default_item"]["length"] && (V = this["cell_default_item"][Q]);
                            var W = V,
                                Z = this["slot_ids"][Q],
                                S = !1,
                                v = [];
                            if (this["slot_map"][Z]) {
                                var i = this["slot_map"][Z];
                                v = i["item_id_list"],
                                    S = !!i.type,
                                    i["item_id"] && (W = this["slot_map"][Z]["item_id"]),
                                    S && i["item_id_list"] && i["item_id_list"]["length"] > 0 && (W = i["item_id_list"][0]);
                            }
                            var x = Laya["Handler"]["create"](this, function (W) {
                                if (W == V && (W = 0), B["is_random"]) {
                                    var S = B["slot_map"][Z]["item_id_list"]["indexOf"](W);
                                    S >= 0 ? B["slot_map"][Z]["item_id_list"]["splice"](S, 1) : (B["slot_map"][Z]["item_id_list"] && 0 != B["slot_map"][Z]["item_id_list"]["length"] || (B["slot_map"][Z]["item_id_list"] = []), B["slot_map"][Z]["item_id_list"].push(W));
                                } else
                                    B["slot_map"][Z] || (B["slot_map"][Z] = {}), B["slot_map"][Z]["item_id"] = W;
                                B["scrollview"]["wantToRefreshItem"](Q),
                                    B["_changed"] = !0,
                                    B["refresh_btn"]();
                            }, null, !1);
                            this["page_items"]["close"](),
                                this["page_desktop"]["close"](),
                                this["page_headframe"]["close"](),
                                this["page_bgm"]["close"](),
                                this["is_random"] = S,
                                this["random_slider"].x = S ? 76 : -4,
                                this["random"]["getChildAt"](1)["visible"] = !this["is_random"],
                                this["random"]["getChildAt"](2)["visible"] = this["is_random"];
                            var l = game["Tools"]["strOfLocalization"](this["cell_titles"][Q]);
                            if (Q >= 0 && 2 >= Q)
                                this["page_items"].show(l, Q, W, x), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (3 == Q)
                                this["page_items"].show(l, 10, W, x), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (4 == Q)
                                this["page_items"].show(l, 3, W, x), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (5 == Q)
                                this["page_bgm"].show(l, W, x), this["setRandomGray"](!this["page_bgm"]["can_random"]());
                            else if (6 == Q)
                                this["page_headframe"].show(l, W, x);
                            else if (7 == Q || 8 == Q) {
                                var m = this["cell_default_item"][7],
                                    s = this["cell_default_item"][8];
                                if (7 == Q) {
                                    if (m = W, this["slot_map"][game["EView"].mjp]) {
                                        var f = this["slot_map"][game["EView"].mjp];
                                        f.type && f["item_id_list"] && f["item_id_list"]["length"] > 0 ? s = f["item_id_list"][0] : f["item_id"] && (s = f["item_id"]);
                                    }
                                    this["page_desktop"]["show_desktop"](l, m, s, x);
                                } else {
                                    if (s = W, this["slot_map"][game["EView"]["desktop"]]) {
                                        var f = this["slot_map"][game["EView"]["desktop"]];
                                        f.type && f["item_id_list"] && f["item_id_list"]["length"] > 0 ? m = f["item_id_list"][0] : f["item_id"] && (m = f["item_id"]);
                                    }
                                    this["page_desktop"]["show_mjp"](l, m, s, x);
                                }
                                this["setRandomGray"](!this["page_desktop"]["can_random"]());
                            } else
                                9 == Q && this["page_desktop"]["show_lobby_bg"](l, W, x);
                        },
                        V["prototype"]["onRandomBtnClick"] = function () {
                            var Q = this;
                            if (6 != this["select_index"] && 9 != this["select_index"]) {
                                this["_changed"] = !0,
                                    this["refresh_btn"](),
                                    this["is_random"] = !this["is_random"],
                                    this["random"]["getChildAt"](this["is_random"] ? 2 : 1)["visible"] = !0,
                                    Laya["Tween"].to(this["random_slider"], {
                                        x: this["is_random"] ? 76 : -4
                                    }, 100, null, Laya["Handler"]["create"](this, function () {
                                        Q["random"]["getChildAt"](Q["is_random"] ? 1 : 2)["visible"] = !1;
                                    }));
                                var B = this["select_index"],
                                    V = this["slot_ids"][B],
                                    W = 0;
                                B >= 0 && B < this["cell_default_item"]["length"] && (W = this["cell_default_item"][B]);
                                var Z = W,
                                    S = [];
                                if (this["slot_map"][V]) {
                                    var v = this["slot_map"][V];
                                    S = v["item_id_list"],
                                        v["item_id"] && (Z = this["slot_map"][V]["item_id"]);
                                }
                                if (B >= 0 && 4 >= B) {
                                    var i = this["slot_map"][V];
                                    i ? (i.type = i.type ? 0 : 1, i["item_id_list"] && 0 != i["item_id_list"]["length"] || (i["item_id_list"] = [i["item_id"]])) : this["slot_map"][V] = {
                                        type: 1,
                                        item_id_list: [this["page_items"]["items"][0]]
                                    },
                                        this["page_items"]["changeRandomState"](Z);
                                } else if (5 == B) {
                                    var i = this["slot_map"][V];
                                    if (i)
                                        i.type = i.type ? 0 : 1, i["item_id_list"] && 0 != i["item_id_list"]["length"] || (i["item_id_list"] = [i["item_id"]]);
                                    else {
                                        this["slot_map"][V] = {
                                            type: 1,
                                            item_id_list: [this["page_bgm"]["items"][0]]
                                        };
                                    }
                                    this["page_bgm"]["changeRandomState"](Z);
                                } else if (7 == B || 8 == B) {
                                    var i = this["slot_map"][V];
                                    if (i)
                                        i.type = i.type ? 0 : 1, i["item_id_list"] && 0 != i["item_id_list"]["length"] || (i["item_id_list"] = [i["item_id"]]);
                                    else {
                                        this["slot_map"][V] = {
                                            type: 1,
                                            item_id_list: [this["page_desktop"]["getFirstOwnedId"]()]
                                        };
                                    }
                                    this["page_desktop"]["changeRandomState"](Z);
                                }
                                this["scrollview"]["wantToRefreshItem"](B);
                            }
                        },
                        V["prototype"]["render_view"] = function (Q) {
                            var B = this,
                                V = Q["container"],
                                W = Q["index"],
                                Z = V["getChildByName"]("cell");
                            this["select_index"] == W ? (Z["scaleX"] = Z["scaleY"] = 1.05, Z["getChildByName"]("choosed")["visible"] = !0) : (Z["scaleX"] = Z["scaleY"] = 1, Z["getChildByName"]("choosed")["visible"] = !1),
                                Z["getChildByName"]("title").text = game["Tools"]["strOfLocalization"](this["cell_titles"][W]);
                            var S = Z["getChildByName"]("name"),
                                v = Z["getChildByName"]("icon"),
                                i = this["cell_default_item"][W],
                                x = this["slot_ids"][W],
                                l = !1;
                            if (this["slot_map"][x] && (l = this["slot_map"][x].type, this["slot_map"][x]["item_id"] && (i = this["slot_map"][x]["item_id"])), l)
                                S.text = game["Tools"]["strOfLocalization"](3752, ['' + this["slot_map"][x]["item_id_list"]["length"]]), game["LoadMgr"]["setImgSkin"](v, "myres/sushe/icon_random.jpg");
                            else {
                                var m = cfg["item_definition"].item.get(i);
                                m ? (S.text = m["name_" + GameMgr["client_language"]], game["LoadMgr"]["setImgSkin"](v, m.icon, null, "UI_Sushe_Select.Zhuangban")) : (S.text = game["Tools"]["strOfLocalization"](this["cell_names"][W]), game["LoadMgr"]["setImgSkin"](v, this["cell_default_img"][W], null, "UI_Sushe_Select.Zhuangban"));
                            }
                            var s = Z["getChildByName"]("btn");
                            s["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["locking"] || B["select_index"] != W && (B["onChangeSlotSelect"](W), B["scrollview"]["wantToRefreshAll"]());
                            }, null, !1),
                                s["mouseEnabled"] = this["select_index"] != W;
                        },
                        V["prototype"]["close"] = function (B) {
                            var V = this;
                            this["container_zhuangban0"]["visible"] && (B ? (this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["container_zhuangban0"]["visible"] = !1, this["container_zhuangban1"]["visible"] = !1, game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1)) : (Q["UIBase"]["anim_alpha_out"](this["container_zhuangban0"], {
                                x: 0
                            }, 200), Q["UIBase"]["anim_alpha_out"](this["container_zhuangban1"], {
                                x: 0
                            }, 200, 0, Laya["Handler"]["create"](this, function () {
                                V["page_items"]["close"](),
                                    V["page_desktop"]["close"](),
                                    V["page_headframe"]["close"](),
                                    V["page_bgm"]["close"](),
                                    V["container_zhuangban0"]["visible"] = !1,
                                    V["container_zhuangban1"]["visible"] = !1,
                                    game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1);
                            }))));
                        },
                        V["prototype"]["onChangeGameView"] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = Q.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            Q["UI_Sushe"]["randomDesktopID"](),
                                GameMgr.Inst["load_mjp_view"]();
                            var B = game["GameUtility"]["get_view_id"](game["EView"]["lobby_bg"]);
                            Q["UI_Lite_Loading"].Inst.show(),
                                game["Scene_Lobby"].Inst["set_lobby_bg"](B, Laya["Handler"]["create"](this, function () {
                                    Q["UI_Lite_Loading"].Inst["enable"] && Q["UI_Lite_Loading"].Inst["close"]();
                                })),
                                GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_id"](game["EView"]["head_frame"]);
                        },
                        V["prototype"]["setRandomGray"] = function (B) {
                            this["btn_random"]["visible"] = !B,
                                this["random"]["filters"] = B ? [new Laya["ColorFilter"](Q["GRAY_FILTER"])] : [];
                        },
                        V["prototype"]["getShowSlotInfo"] = function () {
                            return this["slot_map"][this["slot_ids"][this["select_index"]]];
                        },
                        V;
                }
                    ();
                B["Container_Zhuangban"] = V;
            }
                (B = Q["zhuangban"] || (Q["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));

        // 设置称号
        !function (Q) {
            var B = function (B) {
                function V() {
                    var Q = B.call(this, new ui["lobby"]["titlebookUI"]()) || this;
                    return Q["_root"] = null,
                        Q["_scrollview"] = null,
                        Q["_blackmask"] = null,
                        Q["_locking"] = !1,
                        Q["_showindexs"] = [],
                        V.Inst = Q,
                        Q;
                }
                return __extends(V, B),
                    V.Init = function () {
                        var B = this;
                        // 获取称号
                        // app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchTitleList", {}, function (V, W) {
                        //     if (V || W["error"])
                        //         Q["UIMgr"].Inst["showNetReqError"]("fetchTitleList", V, W);
                        //     else {
                        B["owned_title"] = [];
                        //         for (var Z = 0; Z < W["title_list"]["length"]; Z++) {
                        //             var S = W["title_list"][Z];
                        for (let title of cfg.item_definition.title.rows_) {
                            var S = title.id;
                            cfg["item_definition"]["title"].get(S) && B["owned_title"].push(S),
                                "600005" == S && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1),
                                S >= "600005" && "600015" >= S && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + S - "600005", 1);
                        }
                        //    }
                        //});
                    },
                    V["title_update"] = function (B) {
                        for (var V = 0; V < B["new_titles"]["length"]; V++)
                            cfg["item_definition"]["title"].get(B["new_titles"][V]) && this["owned_title"].push(B["new_titles"][V]), "600005" == B["new_titles"][V] && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1), B["new_titles"][V] >= "600005" && B["new_titles"][V] <= "600015" && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + B["new_titles"][V] - "600005", 1);
                        if (B["remove_titles"] && B["remove_titles"]["length"] > 0) {
                            for (var V = 0; V < B["remove_titles"]["length"]; V++) {
                                for (var W = B["remove_titles"][V], Z = 0; Z < this["owned_title"]["length"]; Z++)
                                    if (this["owned_title"][Z] == W) {
                                        this["owned_title"][Z] = this["owned_title"][this["owned_title"]["length"] - 1],
                                            this["owned_title"].pop();
                                        break;
                                    }
                                W == GameMgr.Inst["account_data"]["title"] && (GameMgr.Inst["account_data"]["title"] = "600001", Q["UI_Lobby"].Inst["enable"] && Q["UI_Lobby"].Inst.top["refresh"](), Q["UI_PlayerInfo"].Inst["enable"] && Q["UI_PlayerInfo"].Inst["refreshBaseInfo"]());
                            }
                            this.Inst["enable"] && this.Inst.show();
                        }
                    },
                    V["prototype"]["onCreate"] = function () {
                        var B = this;
                        this["_root"] = this.me["getChildByName"]("root"),
                            this["_blackmask"] = new Q["UI_BlackMask"](this.me["getChildByName"]("bmask"), Laya["Handler"]["create"](this, function () {
                                return B["_locking"];
                            }, null, !1), Laya["Handler"]["create"](this, this["close"], null, !1)),
                            this["_scrollview"] = this["_root"]["getChildByName"]("content")["scriptMap"]["capsui.CScrollView"],
                            this["_scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function (Q) {
                                B["setItemValue"](Q["index"], Q["container"]);
                            }, null, !1)),
                            this["_root"]["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                B["_locking"] || (B["_blackmask"].hide(), B["close"]());
                            }, null, !1),
                            this["_noinfo"] = this["_root"]["getChildByName"]("noinfo");
                    },
                    V["prototype"].show = function () {
                        var B = this;
                        if (this["_locking"] = !0, this["enable"] = !0, this["_blackmask"].show(), V["owned_title"]["length"] > 0) {
                            this["_showindexs"] = [];
                            for (var W = 0; W < V["owned_title"]["length"]; W++)
                                this["_showindexs"].push(W);
                            this["_showindexs"] = this["_showindexs"].sort(function (Q, B) {
                                var W = Q,
                                    Z = cfg["item_definition"]["title"].get(V["owned_title"][Q]);
                                Z && (W += 1000 * Z["priority"]);
                                var S = B,
                                    v = cfg["item_definition"]["title"].get(V["owned_title"][B]);
                                return v && (S += 1000 * v["priority"]),
                                    S - W;
                            }),
                                this["_scrollview"]["reset"](),
                                this["_scrollview"]["addItem"](V["owned_title"]["length"]),
                                this["_scrollview"].me["visible"] = !0,
                                this["_noinfo"]["visible"] = !1;
                        } else
                            this["_noinfo"]["visible"] = !0, this["_scrollview"].me["visible"] = !1;
                        Q["UIBase"]["anim_pop_out"](this["_root"], Laya["Handler"]["create"](this, function () {
                            B["_locking"] = !1;
                        }));
                    },
                    V["prototype"]["close"] = function () {
                        var B = this;
                        this["_locking"] = !0,
                            Q["UIBase"]["anim_pop_hide"](this["_root"], Laya["Handler"]["create"](this, function () {
                                B["_locking"] = !1,
                                    B["enable"] = !1;
                            }));
                    },
                    V["prototype"]["onEnable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !0);
                    },
                    V["prototype"]["onDisable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !1),
                            this["_scrollview"]["reset"]();
                    },
                    V["prototype"]["setItemValue"] = function (Q, B) {
                        var W = this;
                        if (this["enable"]) {
                            var Z = V["owned_title"][this["_showindexs"][Q]],
                                S = cfg["item_definition"]["title"].find(Z);
                            game["LoadMgr"]["setImgSkin"](B["getChildByName"]("img_title"), S.icon, null, "UI_TitleBook"),
                                B["getChildByName"]("using")["visible"] = Z == GameMgr.Inst["account_data"]["title"],
                                B["getChildByName"]("desc").text = S["desc_" + GameMgr["client_language"]];
                            var v = B["getChildByName"]("btn");
                            v["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Z != GameMgr.Inst["account_data"]["title"] ? (W["changeTitle"](Q), B["getChildByName"]("using")["visible"] = !0) : (W["changeTitle"](-1), B["getChildByName"]("using")["visible"] = !1);
                            }, null, !1);
                            var i = B["getChildByName"]("time"),
                                x = B["getChildByName"]("img_title");
                            if (1 == S["unlock_type"]) {
                                var l = S["unlock_param"][0],
                                    m = cfg["item_definition"].item.get(l);
                                i.text = game["Tools"]["strOfLocalization"](3121) + m["expire_desc_" + GameMgr["client_language"]],
                                    i["visible"] = !0,
                                    x.y = 0;
                            } else
                                i["visible"] = !1, x.y = 10;
                        }
                    },
                    V["prototype"]["changeTitle"] = function (B) {
                        var W = this,
                            Z = GameMgr.Inst["account_data"]["title"],
                            S = 0;
                        S = B >= 0 && B < this["_showindexs"]["length"] ? V["owned_title"][this["_showindexs"][B]] : "600001",
                            GameMgr.Inst["account_data"]["title"] = S;
                        for (var v = -1, i = 0; i < this["_showindexs"]["length"]; i++)
                            if (Z == V["owned_title"][this["_showindexs"][i]]) {
                                v = i;
                                break;
                            }
                        Q["UI_Lobby"].Inst["enable"] && Q["UI_Lobby"].Inst.top["refresh"](),
                            Q["UI_PlayerInfo"].Inst["enable"] && Q["UI_PlayerInfo"].Inst["refreshBaseInfo"](),
                            -1 != v && this["_scrollview"]["wantToRefreshItem"](v),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = S;
                        MMP.saveSettings();
                        // app["NetAgent"]["sendReq2Lobby"]("Lobby", "useTitle", {
                        //     title: "600001" == S ? 0 : S
                        // }, function (V, S) {
                        //     (V || S["error"]) && (Q["UIMgr"].Inst["showNetReqError"]("useTitle", V, S), GameMgr.Inst["account_data"]["title"] = Z, Q["UI_Lobby"].Inst["enable"] && Q["UI_Lobby"].Inst.top["refresh"](), Q["UI_PlayerInfo"].Inst["enable"] && Q["UI_PlayerInfo"].Inst["refreshBaseInfo"](), W["enable"] && (B >= 0 && B < W["_showindexs"]["length"] && W["_scrollview"]["wantToRefreshItem"](B), v >= 0 && v < W["_showindexs"]["length"] && W["_scrollview"]["wantToRefreshItem"](v)));
                        // });
                    },
                    V.Inst = null,
                    V["owned_title"] = [],
                    V;
            }
                (Q["UIBase"]);
            Q["UI_TitleBook"] = B;
        }
            (uiscript || (uiscript = {}));

        // 友人房调整装扮
        !function (Q) {
            var B;
            !function (B) {
                var V = function () {
                    function V(Q) {
                        this["scrollview"] = null,
                            this["page_skin"] = null,
                            this["chara_infos"] = [],
                            this["choosed_chara_index"] = 0,
                            this["choosed_skin_id"] = 0,
                            this["star_char_count"] = 0,
                            this.me = Q,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this.me["getChildByName"]("left")["visible"] = !0, this.me["getChildByName"]("left_en")["visible"] = !1, this["scrollview"] = this.me["getChildByName"]("left")["scriptMap"]["capsui.CScrollView"]) : (this.me["getChildByName"]("left")["visible"] = !1, this.me["getChildByName"]("left_en")["visible"] = !0, this["scrollview"] = this.me["getChildByName"]("left_en")["scriptMap"]["capsui.CScrollView"]),
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                            this["scrollview"]["setElastic"](),
                            this["page_skin"] = new B["Page_Skin"](this.me["getChildByName"]("right"));
                    }
                    return V["prototype"].show = function (B) {
                        var V = this;
                        this.me["visible"] = !0,
                            B ? this.me["alpha"] = 1 : Q["UIBase"]["anim_alpha_in"](this.me, {
                                x: 0
                            }, 200, 0),
                            this["choosed_chara_index"] = 0,
                            this["chara_infos"] = [];
                        for (var W = 0, Z = Q["UI_Sushe"]["star_chars"]; W < Z["length"]; W++)
                            for (var S = Z[W], v = 0; v < Q["UI_Sushe"]["characters"]["length"]; v++)
                                if (!Q["UI_Sushe"]["hidden_characters_map"][S] && Q["UI_Sushe"]["characters"][v]["charid"] == S) {
                                    this["chara_infos"].push({
                                        chara_id: Q["UI_Sushe"]["characters"][v]["charid"],
                                        skin_id: Q["UI_Sushe"]["characters"][v].skin,
                                        is_upgraded: Q["UI_Sushe"]["characters"][v]["is_upgraded"]
                                    }),
                                        Q["UI_Sushe"]["main_character_id"] == Q["UI_Sushe"]["characters"][v]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1);
                                    break;
                                }
                        this["star_char_count"] = this["chara_infos"]["length"];
                        for (var v = 0; v < Q["UI_Sushe"]["characters"]["length"]; v++)
                            Q["UI_Sushe"]["hidden_characters_map"][Q["UI_Sushe"]["characters"][v]["charid"]] || -1 == Q["UI_Sushe"]["star_chars"]["indexOf"](Q["UI_Sushe"]["characters"][v]["charid"]) && (this["chara_infos"].push({
                                chara_id: Q["UI_Sushe"]["characters"][v]["charid"],
                                skin_id: Q["UI_Sushe"]["characters"][v].skin,
                                is_upgraded: Q["UI_Sushe"]["characters"][v]["is_upgraded"]
                            }), Q["UI_Sushe"]["main_character_id"] == Q["UI_Sushe"]["characters"][v]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1));
                        this["choosed_skin_id"] = this["chara_infos"][this["choosed_chara_index"]]["skin_id"],
                            this["scrollview"]["reset"](),
                            this["scrollview"]["addItem"](this["chara_infos"]["length"]);
                        var i = this["chara_infos"][this["choosed_chara_index"]];
                        this["page_skin"].show(i["chara_id"], i["skin_id"], Laya["Handler"]["create"](this, function (Q) {
                            V["choosed_skin_id"] = Q,
                                i["skin_id"] = Q,
                                V["scrollview"]["wantToRefreshItem"](V["choosed_chara_index"]);
                        }, null, !1));
                    },
                        V["prototype"]["render_character_cell"] = function (B) {
                            var V = this,
                                W = B["index"],
                                Z = B["container"],
                                S = B["cache_data"];
                            S["index"] = W;
                            var v = this["chara_infos"][W];
                            S["inited"] || (S["inited"] = !0, S.skin = new Q["UI_Character_Skin"](Z["getChildByName"]("btn")["getChildByName"]("head")), S["bound"] = Z["getChildByName"]("btn")["getChildByName"]("bound"));
                            var i = Z["getChildByName"]("btn");
                            i["getChildByName"]("choose")["visible"] = W == this["choosed_chara_index"],
                                S.skin["setSkin"](v["skin_id"], "bighead"),
                                i["getChildByName"]("using")["visible"] = W == this["choosed_chara_index"],
                                i["getChildByName"]("label_name").text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].find(v["chara_id"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].find(v["chara_id"])["name_" + GameMgr["client_language"]],
                                i["getChildByName"]("star") && (i["getChildByName"]("star")["visible"] = W < this["star_char_count"]);
                            var x = cfg["item_definition"]["character"].get(v["chara_id"]);
                            'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? S["bound"].skin = x.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (v["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (v["is_upgraded"] ? "2.png" : ".png")) : x.ur ? (S["bound"].pos(-10, -2), S["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (v["is_upgraded"] ? "6.png" : "5.png"))) : (S["bound"].pos(4, 20), S["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (v["is_upgraded"] ? "4.png" : "3.png"))),
                                i["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (v["is_upgraded"] ? "2.png" : ".png")),
                                Z["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                    if (W != V["choosed_chara_index"]) {
                                        var Q = V["choosed_chara_index"];
                                        V["choosed_chara_index"] = W,
                                            V["choosed_skin_id"] = v["skin_id"],
                                            V["page_skin"].show(v["chara_id"], v["skin_id"], Laya["Handler"]["create"](V, function (Q) {
                                                V["choosed_skin_id"] = Q,
                                                    v["skin_id"] = Q,
                                                    S.skin["setSkin"](Q, "bighead");
                                            }, null, !1)),
                                            V["scrollview"]["wantToRefreshItem"](Q),
                                            V["scrollview"]["wantToRefreshItem"](W);
                                    }
                                });
                        },
                        V["prototype"]["close"] = function (B) {
                            var V = this;
                            if (this.me["visible"])
                                if (B)
                                    this.me["visible"] = !1;
                                else {
                                    var W = this["chara_infos"][this["choosed_chara_index"]];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    // W["chara_id"] != Q["UI_Sushe"]["main_character_id"] && (app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                    //         character_id: W["chara_id"]
                                    //     }, function () {}), 
                                    Q["UI_Sushe"]["main_character_id"] = W["chara_id"];
                                    // this["choosed_skin_id"] != GameMgr.Inst["account_data"]["avatar_id"] && app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                                    //     character_id: W["chara_id"],
                                    //     skin: this["choosed_skin_id"]
                                    // }, function () {});
                                    // END
                                    for (var Z = 0; Z < Q["UI_Sushe"]["characters"]["length"]; Z++)
                                        if (Q["UI_Sushe"]["characters"][Z]["charid"] == W["chara_id"]) {
                                            Q["UI_Sushe"]["characters"][Z].skin = this["choosed_skin_id"];
                                            break;
                                        }
                                    GameMgr.Inst["account_data"]["avatar_id"] = this["choosed_skin_id"],
                                        Q["UI_Sushe"]["onMainSkinChange"](),
                                        Q["UIBase"]["anim_alpha_out"](this.me, {
                                            x: 0
                                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                                            V.me["visible"] = !1;
                                        }));
                                }
                        },
                        V;
                }
                    ();
                B["Page_Waiting_Head"] = V;
            }
                (B = Q["zhuangban"] || (Q["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));

        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var Q = GameMgr;
            var B = GameMgr.Inst;
            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountInfo", {}, function (V, W) {
                if (V || W["error"])
                    uiscript["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", V, W);
                else {
                    app.Log.log("UpdateAccount: " + JSON["stringify"](W)),
                        Q.Inst["account_refresh_time"] = Laya["timer"]["currTimer"];
                    // 对局结束更新数据
                    W.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    W.account.title = GameMgr.Inst.account_data.title;
                    W.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        W.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var Z in W["account"]) {
                        if (Q.Inst["account_data"][Z] = W["account"][Z], "platform_diamond" == Z)
                            for (var S = W["account"][Z], v = 0; v < S["length"]; v++)
                                B["account_numerical_resource"][S[v].id] = S[v]["count"];
                        if ("skin_ticket" == Z && (Q.Inst["account_numerical_resource"]["100004"] = W["account"][Z]), "platform_skin_ticket" == Z)
                            for (var S = W["account"][Z], v = 0; v < S["length"]; v++)
                                B["account_numerical_resource"][S[v].id] = S[v]["count"];
                    }
                    uiscript["UI_Lobby"].Inst["refreshInfo"](),
                        W["account"]["room_id"] && Q.Inst["updateRoom"](),
                        "10102" === Q.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_2"], 1),
                        "10103" === Q.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_3"], 1);
                }
            });
        }

        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (B, V, W) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': B,
                        'account_id': parseInt(V.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': B,
                            'account_id': parseInt(V.toString())
                        }));
                    }
                }));
            }
            var Q = GameMgr;
            var Z = GameMgr.Inst;
            return B = B.trim(),
                app.Log.log("checkPaiPu game_uuid:" + B + " account_id:" + V["toString"]() + " paipu_config:" + W),
                this["duringPaipu"] ? (app.Log["Error"]("已经在看牌谱了"), void 0) : (this["duringPaipu"] = !0, uiscript["UI_Loading"].Inst.show("enter_mj"), Q.Inst["onLoadStart"]("paipu"), 2 & W && (B = game["Tools"]["DecodePaipuUUID"](B)), this["record_uuid"] = B, app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecord", {
                    game_uuid: B,
                    client_version_string: this["getClientVersion"]()
                }, function (S, v) {
                    if (S || v["error"]) {
                        uiscript["UIMgr"].Inst["showNetReqError"]("fetchGameRecord", S, v);
                        var i = 0.12;
                        uiscript["UI_Loading"].Inst["setProgressVal"](i);
                        var x = function () {
                            return i += 0.06,
                                uiscript["UI_Loading"].Inst["setProgressVal"](Math.min(1, i)),
                                i >= 1.1 ? (uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), Laya["timer"]["clear"](this, x), void 0) : void 0;
                        };
                        Laya["timer"].loop(50, Z, x),
                            Z["duringPaipu"] = !1;
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
                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                        var l = v.head,
                            m = [null, null, null, null],
                            s = game["Tools"]["strOfLocalization"](2003),
                            f = l["config"].mode;
                        if (Q["inRelease"] && f["testing_environment"] && f["testing_environment"]["paixing"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](3169)), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), Z["duringPaipu"] = !1, void 0;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "readGameRecord", {
                            game_uuid: B,
                            client_version_string: Z["getClientVersion"]()
                        }, function () { }),
                            f["extendinfo"] && (s = game["Tools"]["strOfLocalization"](2004)),
                            f["detail_rule"] && f["detail_rule"]["ai_level"] && (1 === f["detail_rule"]["ai_level"] && (s = game["Tools"]["strOfLocalization"](2003)), 2 === f["detail_rule"]["ai_level"] && (s = game["Tools"]["strOfLocalization"](2004)));
                        var z = !1;
                        l["end_time"] ? (Z["record_end_time"] = l["end_time"], l["end_time"] > "1576112400" && (z = !0)) : Z["record_end_time"] = -1,
                            Z["record_start_time"] = l["start_time"] ? l["start_time"] : -1;
                        for (var C = 0; C < l["accounts"]["length"]; C++) {
                            var T = l["accounts"][C];
                            if (T["character"]) {
                                var t = T["character"],
                                    w = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (T.account_id == GameMgr.Inst.account_id) {
                                        T.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        T.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        // 解决进游戏后没有装扮的问题
                                        uiscript.UI_Sushe.randomDesktopID();
                                        GameMgr.Inst["load_mjp_view"]();
                                        GameMgr.Inst["load_touming_mjp_view"]();
                                        // END
                                        T.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        T.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        T.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            T.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (T.avatar_id == 400101 || T.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            T.avatar_id = skin.id;
                                            T.character.charid = skin.character_id;
                                            T.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(T.account_id);
                                        if (server == 1) {
                                            T.nickname = '[CN]' + T.nickname;
                                        } else if (server == 2) {
                                            T.nickname = '[JP]' + T.nickname;
                                        } else if (server == 3) {
                                            T.nickname = '[EN]' + T.nickname;
                                        } else {
                                            T.nickname = '[??]' + T.nickname;
                                        }
                                    }
                                }
                                // END
                                if (z) {
                                    var h = T["views"];
                                    if (h)
                                        for (var G = 0; G < h["length"]; G++)
                                            w[h[G].slot] = h[G]["item_id"];
                                } else {
                                    var g = t["views"];
                                    if (g)
                                        for (var G = 0; G < g["length"]; G++) {
                                            var r = g[G].slot,
                                                j = g[G]["item_id"],
                                                X = r - 1;
                                            w[X] = j;
                                        }
                                }
                                var d = [];
                                for (var y in w)
                                    d.push({
                                        slot: parseInt(y),
                                        item_id: w[y]
                                    });
                                T["views"] = d,
                                    m[T.seat] = T;
                            } else
                                T["character"] = {
                                    charid: T["avatar_id"],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg["item_definition"]["character"].get(T["avatar_id"])["init_skin"],
                                    is_upgraded: !1
                                },
                                    T["avatar_id"] = T["character"].skin,
                                    T["views"] = [],
                                    m[T.seat] = T;
                        }
                        for (var p = game["GameUtility"]["get_default_ai_skin"](), E = game["GameUtility"]["get_default_ai_character"](), C = 0; C < m["length"]; C++)
                            if (null == m[C]) {
                                m[C] = {
                                    nickname: s,
                                    avatar_id: p,
                                    level: {
                                        id: "10101"
                                    },
                                    level3: {
                                        id: "20101"
                                    },
                                    character: {
                                        charid: E,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: p,
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
                                            m[C].avatar_id = skin.id;
                                            m[C].character.charid = skin.character_id;
                                            m[C].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        m[C].nickname = '[BOT]' + m[C].nickname;
                                    }
                                }
                                // END
                            }
                        var O = Laya["Handler"]["create"](Z, function (Q) {
                            game["Scene_Lobby"].Inst["active"] && (game["Scene_Lobby"].Inst["active"] = !1),
                                game["Scene_MJ"].Inst["openMJRoom"](l["config"], m, Laya["Handler"]["create"](Z, function () {
                                    Z["duringPaipu"] = !1,
                                        view["DesktopMgr"].Inst["paipu_config"] = W,
                                        view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](l["config"])), m, V, view["EMJMode"]["paipu"], Laya["Handler"]["create"](Z, function () {
                                            uiscript["UI_Replay"].Inst["initData"](Q),
                                                uiscript["UI_Replay"].Inst["enable"] = !0,
                                                Laya["timer"].once(1000, Z, function () {
                                                    Z["EnterMJ"]();
                                                }),
                                                Laya["timer"].once(1500, Z, function () {
                                                    view["DesktopMgr"]["player_link_state"] = [view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"]],
                                                        uiscript["UI_DesktopInfo"].Inst["refreshLinks"](),
                                                        uiscript["UI_Loading"].Inst["close"]();
                                                }),
                                                Laya["timer"].once(1000, Z, function () {
                                                    uiscript["UI_Replay"].Inst["nextStep"](!0);
                                                });
                                        }));
                                }), Laya["Handler"]["create"](Z, function (Q) {
                                    return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.9 * Q);
                                }, null, !1));
                        }),
                            b = {};
                        if (b["record"] = l, v.data && v.data["length"])
                            b.game = net["MessageWrapper"]["decodeMessage"](v.data), O["runWith"](b);
                        else {
                            var M = v["data_url"];
                            game["LoadMgr"]["httpload"](M, "arraybuffer", !1, Laya["Handler"]["create"](Z, function (Q) {
                                if (Q["success"]) {
                                    var B = new Laya.Byte();
                                    B["writeArrayBuffer"](Q.data);
                                    var V = net["MessageWrapper"]["decodeMessage"](B["getUint8Array"](0, B["length"]));
                                    b.game = V,
                                        O["runWith"](b);
                                } else
                                    uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2005) + v["data_url"]), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), Z["duringPaipu"] = !1;
                            }));
                        }
                    }
                }), void 0);
        }

        // 牌谱功能
        !function (Q) {
            var B = function () {
                function B(Q) {
                    var B = this;
                    this.me = Q,
                        this.me["getChildByName"]("blackbg")["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                            B["locking"] || B.hide(null);
                        }),
                        this["title"] = this.me["getChildByName"]("title"),
                        this["input"] = this.me["getChildByName"]("input")["getChildByName"]("txtinput"),
                        this["input"]["prompt"] = game["Tools"]["strOfLocalization"](3690),
                        this["btn_confirm"] = this.me["getChildByName"]("btn_confirm"),
                        this["btn_cancel"] = this.me["getChildByName"]("btn_cancel"),
                        this.me["visible"] = !1,
                        this["btn_cancel"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            B["locking"] || B.hide(null);
                        }, null, !1),
                        this["container_hidename"] = this.me["getChildByName"]("hidename"),
                        this["sp_checkbox"] = this["container_hidename"]["getChildByName"]("checkbox")["getChildByName"]("checkbox");
                    var V = this["container_hidename"]["getChildByName"]('w0'),
                        W = this["container_hidename"]["getChildByName"]('w1');
                    W.x = V.x + V["textField"]["textWidth"] + 10,
                        this["container_hidename"]["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                            B["sp_checkbox"]["visible"] = !B["sp_checkbox"]["visible"],
                                B["refresh_share_uuid"]();
                        });
                }
                return B["prototype"]["show_share"] = function (B) {
                    var V = this;
                    this["title"].text = game["Tools"]["strOfLocalization"](2124),
                        this["sp_checkbox"]["visible"] = !1,
                        this["btn_confirm"]["visible"] = !1,
                        this["input"]["editable"] = !1,
                        this.uuid = B,
                        this["refresh_share_uuid"](),
                        this.me["visible"] = !0,
                        this["locking"] = !0,
                        this["container_hidename"]["visible"] = !0,
                        this["btn_confirm"]["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2127),
                        Q["UIBase"]["anim_pop_out"](this.me, Laya["Handler"]["create"](this, function () {
                            V["locking"] = !1;
                        }));
                },
                    B["prototype"]["refresh_share_uuid"] = function () {
                        var Q = game["Tools"]["encode_account_id"](GameMgr.Inst["account_id"]),
                            B = this.uuid,
                            V = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                        this["input"].text = this["sp_checkbox"]["visible"] ? game["Tools"]["strOfLocalization"](2126) + ': ' + V + "?paipu=" + game["Tools"]["EncodePaipuUUID"](B) + '_a' + Q + '_2' : game["Tools"]["strOfLocalization"](2126) + ': ' + V + "?paipu=" + B + '_a' + Q;
                    },
                    B["prototype"]["show_check"] = function () {
                        var B = this;
                        return Q["UI_PiPeiYuYue"].Inst["enable"] ? (Q["UI_Popout"]["PopOutNoTitle"](game["Tools"]["strOfLocalization"](204), null), void 0) : (this["title"].text = game["Tools"]["strOfLocalization"](2128), this["btn_confirm"]["visible"] = !0, this["container_hidename"]["visible"] = !1, this["btn_confirm"]["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2129), this["btn_confirm"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            return B["input"].text ? (B.hide(Laya["Handler"]["create"](B, function () {
                                var Q = B["input"].text["split"]('='),
                                    V = Q[Q["length"] - 1]["split"]('_'),
                                    W = 0;
                                V["length"] > 1 && (W = 'a' == V[1]["charAt"](0) ? game["Tools"]["decode_account_id"](parseInt(V[1]["substr"](1))) : parseInt(V[1]));
                                var Z = 0;
                                if (V["length"] > 2) {
                                    var S = parseInt(V[2]);
                                    S && (Z = S);
                                }
                                GameMgr.Inst["checkPaiPu"](V[0], W, Z);
                            })), void 0) : (Q["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](3690)), void 0);
                        }, null, !1), this["input"]["editable"] = !0, this["input"].text = '', this.me["visible"] = !0, this["locking"] = !0, Q["UIBase"]["anim_pop_out"](this.me, Laya["Handler"]["create"](this, function () {
                            B["locking"] = !1;
                        })), void 0);
                    },
                    B["prototype"].hide = function (B) {
                        var V = this;
                        this["locking"] = !0,
                            Q["UIBase"]["anim_pop_hide"](this.me, Laya["Handler"]["create"](this, function () {
                                V["locking"] = !1,
                                    V.me["visible"] = !1,
                                    B && B.run();
                            }));
                    },
                    B;
            }
                (),
                V = function () {
                    function B(Q) {
                        var B = this;
                        this.me = Q,
                            this["blackbg"] = Q["getChildByName"]("blackbg"),
                            this.root = Q["getChildByName"]("root"),
                            this["input"] = this.root["getChildByName"]("input")["getChildByName"]("txtinput"),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function () {
                                B["locking"] || B["close"]();
                            }),
                            this.root["getChildByName"]("btn_confirm")["clickHandler"] = new Laya["Handler"](this, function () {
                                B["locking"] || (game["Tools"]["calu_word_length"](B["input"].text) > 30 ? B["toolong"]["visible"] = !0 : (B["close"](), S["addCollect"](B.uuid, B["start_time"], B["end_time"], B["input"].text)));
                            }),
                            this["toolong"] = this.root["getChildByName"]("toolong");
                    }
                    return B["prototype"].show = function (B, V, W) {
                        var Z = this;
                        this.uuid = B,
                            this["start_time"] = V,
                            this["end_time"] = W,
                            this.me["visible"] = !0,
                            this["locking"] = !0,
                            this["input"].text = '',
                            this["toolong"]["visible"] = !1,
                            this["blackbg"]["alpha"] = 0,
                            Laya["Tween"].to(this["blackbg"], {
                                alpha: 0.5
                            }, 150),
                            Q["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                Z["locking"] = !1;
                            }));
                    },
                        B["prototype"]["close"] = function () {
                            var B = this;
                            this["locking"] = !0,
                                Laya["Tween"].to(this["blackbg"], {
                                    alpha: 0
                                }, 150),
                                Q["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                    B["locking"] = !1,
                                        B.me["visible"] = !1;
                                }));
                        },
                        B;
                }
                    ();
            Q["UI_Pop_CollectInput"] = V;
            var W;
            !function (Q) {
                Q[Q.ALL = 0] = "ALL",
                    Q[Q["FRIEND"] = 1] = "FRIEND",
                    Q[Q.RANK = 2] = "RANK",
                    Q[Q["MATCH"] = 4] = "MATCH",
                    Q[Q["COLLECT"] = 100] = "COLLECT";
            }
                (W || (W = {}));
            var Z = function () {
                function B(Q) {
                    this["uuid_list"] = [],
                        this.type = Q,
                        this["reset"]();
                }
                return B["prototype"]["reset"] = function () {
                    this["count"] = 0,
                        this["true_count"] = 0,
                        this["have_more_paipu"] = !0,
                        this["uuid_list"] = [],
                        this["duringload"] = !1;
                },
                    B["prototype"]["loadList"] = function () {
                        var B = this;
                        if (!this["duringload"] && this["have_more_paipu"]) {
                            if (this["duringload"] = !0, this.type == W["COLLECT"]) {
                                for (var V = [], Z = 0, v = 0; 10 > v; v++) {
                                    var i = this["count"] + v;
                                    if (i >= S["collect_lsts"]["length"])
                                        break;
                                    Z++;
                                    var x = S["collect_lsts"][i];
                                    S["record_map"][x] || V.push(x),
                                        this["uuid_list"].push(x);
                                }
                                V["length"] > 0 ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecordsDetail", {
                                    uuid_list: V
                                }, function (W, v) {
                                    if (B["duringload"] = !1, S.Inst["onLoadStateChange"](B.type, !1), W || v["error"])
                                        Q["UIMgr"].Inst["showNetReqError"]("fetchGameRecordsDetail", W, v);
                                    else if (app.Log.log(JSON["stringify"](v)), v["record_list"] && v["record_list"]["length"] == V["length"]) {
                                        for (var i = 0; i < v["record_list"]["length"]; i++) {
                                            var x = v["record_list"][i].uuid;
                                            S["record_map"][x] || (S["record_map"][x] = v["record_list"][i]);
                                        }
                                        B["count"] += Z,
                                            B["count"] >= S["collect_lsts"]["length"] && (B["have_more_paipu"] = !1, S.Inst["onLoadOver"](B.type)),
                                            S.Inst["onLoadMoreLst"](B.type, Z);
                                    } else
                                        B["have_more_paipu"] = !1, S.Inst["onLoadOver"](B.type);
                                }) : (this["duringload"] = !1, this["count"] += Z, this["count"] >= S["collect_lsts"]["length"] && (this["have_more_paipu"] = !1, S.Inst["onLoadOver"](this.type)), S.Inst["onLoadMoreLst"](this.type, Z));
                            } else
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecordList", {
                                    start: this["true_count"],
                                    count: 10,
                                    type: this.type
                                }, function (V, Z) {
                                    if (B["duringload"] = !1, S.Inst["onLoadStateChange"](B.type, !1), V || Z["error"])
                                        Q["UIMgr"].Inst["showNetReqError"]("fetchGameRecordList", V, Z);
                                    else if (app.Log.log(JSON["stringify"](Z)), Z["record_list"] && Z["record_list"]["length"] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(Z),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(Z));
                                                }
                                            }));
                                            for (let record_list of Z['record_list']) {
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
                                        for (var v = Z["record_list"], i = 0, x = 0; x < v["length"]; x++) {
                                            var l = v[x].uuid;
                                            if (B.type == W.RANK && v[x]["config"] && v[x]["config"].meta) {
                                                var m = v[x]["config"].meta;
                                                if (m) {
                                                    var s = cfg["desktop"]["matchmode"].get(m["mode_id"]);
                                                    if (s && 5 == s.room)
                                                        continue;
                                                }
                                            }
                                            i++,
                                                B["uuid_list"].push(l),
                                                S["record_map"][l] || (S["record_map"][l] = v[x]);
                                        }
                                        B["count"] += i,
                                            B["true_count"] += v["length"],
                                            S.Inst["onLoadMoreLst"](B.type, i),
                                            B["have_more_paipu"] = !0;
                                    } else
                                        B["have_more_paipu"] = !1, S.Inst["onLoadOver"](B.type);
                                });
                            Laya["timer"].once(700, this, function () {
                                B["duringload"] && S.Inst["onLoadStateChange"](B.type, !0);
                            });
                        }
                    },
                    B["prototype"]["removeAt"] = function (Q) {
                        for (var B = 0; B < this["uuid_list"]["length"] - 1; B++)
                            B >= Q && (this["uuid_list"][B] = this["uuid_list"][B + 1]);
                        this["uuid_list"].pop(),
                            this["count"]--,
                            this["true_count"]--;
                    },
                    B;
            }
                (),
                S = function (S) {
                    function v() {
                        var Q = S.call(this, new ui["lobby"]["paipuUI"]()) || this;
                        return Q.top = null,
                            Q["container_scrollview"] = null,
                            Q["scrollview"] = null,
                            Q["loading"] = null,
                            Q.tabs = [],
                            Q["pop_otherpaipu"] = null,
                            Q["pop_collectinput"] = null,
                            Q["label_collect_count"] = null,
                            Q["noinfo"] = null,
                            Q["locking"] = !1,
                            Q["current_type"] = W.ALL,
                            v.Inst = Q,
                            Q;
                    }
                    return __extends(v, S),
                        v.init = function () {
                            var Q = this;
                            this["paipuLst"][W.ALL] = new Z(W.ALL),
                                this["paipuLst"][W["FRIEND"]] = new Z(W["FRIEND"]),
                                this["paipuLst"][W.RANK] = new Z(W.RANK),
                                this["paipuLst"][W["MATCH"]] = new Z(W["MATCH"]),
                                this["paipuLst"][W["COLLECT"]] = new Z(W["COLLECT"]),
                                this["collect_lsts"] = [],
                                this["record_map"] = {},
                                this["collect_info"] = {},
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCollectedGameRecordList", {}, function (B, V) {
                                    if (B || V["error"]);
                                    else {
                                        if (V["record_list"]) {
                                            for (var W = V["record_list"], Z = 0; Z < W["length"]; Z++) {
                                                var S = {
                                                    uuid: W[Z].uuid,
                                                    time: W[Z]["end_time"],
                                                    remarks: W[Z]["remarks"]
                                                };
                                                Q["collect_lsts"].push(S.uuid),
                                                    Q["collect_info"][S.uuid] = S;
                                            }
                                            Q["collect_lsts"] = Q["collect_lsts"].sort(function (B, V) {
                                                return Q["collect_info"][V].time - Q["collect_info"][B].time;
                                            });
                                        }
                                        V["record_collect_limit"] && (Q["collect_limit"] = V["record_collect_limit"]);
                                    }
                                });
                        },
                        v["onAccountUpdate"] = function () {
                            this.Inst && this.Inst["enable"] && (this.Inst["label_collect_count"].text = this["collect_lsts"]["length"]["toString"]() + '/' + this["collect_limit"]["toString"]());
                        },
                        v["reset"] = function () {
                            this["paipuLst"][W.ALL] && this["paipuLst"][W.ALL]["reset"](),
                                this["paipuLst"][W["FRIEND"]] && this["paipuLst"][W["FRIEND"]]["reset"](),
                                this["paipuLst"][W.RANK] && this["paipuLst"][W.RANK]["reset"](),
                                this["paipuLst"][W["MATCH"]] && this["paipuLst"][W["MATCH"]]["reset"]();
                        },
                        v["addCollect"] = function (B, V, W, Z) {
                            var S = this;
                            if (!this["collect_info"][B]) {
                                if (this["collect_lsts"]["length"] + 1 > this["collect_limit"])
                                    return Q["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2767)), void 0;
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "addCollectedGameRecord", {
                                    uuid: B,
                                    remarks: Z,
                                    start_time: V,
                                    end_time: W
                                }, function () { });
                                var i = {
                                    uuid: B,
                                    remarks: Z,
                                    time: W
                                };
                                this["collect_info"][B] = i,
                                    this["collect_lsts"].push(B),
                                    this["collect_lsts"] = this["collect_lsts"].sort(function (Q, B) {
                                        return S["collect_info"][B].time - S["collect_info"][Q].time;
                                    }),
                                    Q["UI_DesktopInfo"].Inst && Q["UI_DesktopInfo"].Inst["enable"] && Q["UI_DesktopInfo"].Inst["onCollectChange"](),
                                    v.Inst && v.Inst["enable"] && v.Inst["onCollectChange"](B, -1);
                            }
                        },
                        v["removeCollect"] = function (B) {
                            var V = this;
                            if (this["collect_info"][B]) {
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "removeCollectedGameRecord", {
                                    uuid: B
                                }, function () { }),
                                    delete this["collect_info"][B];
                                for (var W = -1, Z = 0; Z < this["collect_lsts"]["length"]; Z++)
                                    if (this["collect_lsts"][Z] == B) {
                                        this["collect_lsts"][Z] = this["collect_lsts"][this["collect_lsts"]["length"] - 1],
                                            W = Z;
                                        break;
                                    }
                                this["collect_lsts"].pop(),
                                    this["collect_lsts"] = this["collect_lsts"].sort(function (Q, B) {
                                        return V["collect_info"][B].time - V["collect_info"][Q].time;
                                    }),
                                    Q["UI_DesktopInfo"].Inst && Q["UI_DesktopInfo"].Inst["enable"] && Q["UI_DesktopInfo"].Inst["onCollectChange"](),
                                    v.Inst && v.Inst["enable"] && v.Inst["onCollectChange"](B, W);
                            }
                        },
                        v["prototype"]["onCreate"] = function () {
                            var W = this;
                            this.top = this.me["getChildByName"]("top"),
                                this.top["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    W["locking"] || W["close"](Laya["Handler"]["create"](W, function () {
                                        Q["UIMgr"].Inst["showLobby"]();
                                    }));
                                }, null, !1),
                                this["container_scrollview"] = this.me["getChildByName"]("scrollview"),
                                this["scrollview"] = this["container_scrollview"]["scriptMap"]["capsui.CScrollView"],
                                this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function (Q) {
                                    W["setItemValue"](Q["index"], Q["container"]);
                                }, null, !1)),
                                this["scrollview"]["setElastic"](),
                                this["container_scrollview"].on("ratechange", this, function () {
                                    var Q = v["paipuLst"][W["current_type"]];
                                    (1 - W["scrollview"].rate) * Q["count"] < 3 && (Q["duringload"] || (Q["have_more_paipu"] ? Q["loadList"]() : 0 == Q["count"] && (W["noinfo"]["visible"] = !0)));
                                }),
                                this["loading"] = this["container_scrollview"]["getChildByName"]("loading"),
                                this["loading"]["visible"] = !1,
                                this["container_scrollview"]["getChildByName"]("checkother")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    W["pop_otherpaipu"].me["visible"] || W["pop_otherpaipu"]["show_check"]();
                                }, null, !1),
                                this.tabs = [];
                            for (var Z = 0; 5 > Z; Z++)
                                this.tabs.push(this["container_scrollview"]["getChildByName"]("tabs")["getChildAt"](Z)), this.tabs[Z]["clickHandler"] = new Laya["Handler"](this, this["changeTab"], [Z, !1]);
                            this["pop_otherpaipu"] = new B(this.me["getChildByName"]("pop_otherpaipu")),
                                this["pop_collectinput"] = new V(this.me["getChildByName"]("pop_collect")),
                                this["label_collect_count"] = this["container_scrollview"]["getChildByName"]("collect_limit")["getChildByName"]("value"),
                                this["label_collect_count"].text = "0/20",
                                this["noinfo"] = this["container_scrollview"]["getChildByName"]("noinfo");
                        },
                        v["prototype"].show = function () {
                            var B = this;
                            GameMgr.Inst["BehavioralStatistics"](20),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["pop_otherpaipu"].me["visible"] = !1,
                                this["pop_collectinput"].me["visible"] = !1,
                                Q["UIBase"]["anim_alpha_in"](this.top, {
                                    y: -30
                                }, 200),
                                Q["UIBase"]["anim_alpha_in"](this["container_scrollview"], {
                                    y: 30
                                }, 200),
                                this["locking"] = !0,
                                this["loading"]["visible"] = !1,
                                Laya["timer"].once(200, this, function () {
                                    B["locking"] = !1;
                                }),
                                this["changeTab"](0, !0),
                                this["label_collect_count"].text = v["collect_lsts"]["length"]["toString"]() + '/' + v["collect_limit"]["toString"]();
                        },
                        v["prototype"]["close"] = function (B) {
                            var V = this;
                            this["locking"] = !0,
                                Q["UIBase"]["anim_alpha_out"](this.top, {
                                    y: -30
                                }, 150),
                                Q["UIBase"]["anim_alpha_out"](this["container_scrollview"], {
                                    y: 30
                                }, 150),
                                Laya["timer"].once(150, this, function () {
                                    V["locking"] = !1,
                                        V["enable"] = !1,
                                        B && B.run();
                                });
                        },
                        v["prototype"]["changeTab"] = function (Q, B) {
                            var V = [W.ALL, W.RANK, W["FRIEND"], W["MATCH"], W["COLLECT"]];
                            if (B || V[Q] != this["current_type"]) {
                                if (this["loading"]["visible"] = !1, this["noinfo"]["visible"] = !1, this["current_type"] = V[Q], this["current_type"] == W["COLLECT"] && v["paipuLst"][this["current_type"]]["reset"](), this["scrollview"]["reset"](), this["current_type"] != W["COLLECT"]) {
                                    var Z = v["paipuLst"][this["current_type"]]["count"];
                                    Z > 0 && this["scrollview"]["addItem"](Z);
                                }
                                for (var S = 0; S < this.tabs["length"]; S++) {
                                    var i = this.tabs[S];
                                    i["getChildByName"]("img").skin = game["Tools"]["localUISrc"](Q == S ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"),
                                        i["getChildByName"]("label_name")["color"] = Q == S ? "#d9b263" : "#8cb65f";
                                }
                            }
                        },
                        v["prototype"]["setItemValue"] = function (B, V) {
                            var W = this;
                            if (this["enable"]) {
                                var Z = v["paipuLst"][this["current_type"]];
                                if (Z || !(B >= Z["uuid_list"]["length"])) {
                                    for (var S = v["record_map"][Z["uuid_list"][B]], i = 0; 4 > i; i++) {
                                        var x = V["getChildByName"]('p' + i["toString"]());
                                        if (i < S["result"]["players"]["length"]) {
                                            x["visible"] = !0;
                                            var l = x["getChildByName"]("chosen"),
                                                m = x["getChildByName"]("rank"),
                                                s = x["getChildByName"]("rank_word"),
                                                f = x["getChildByName"]("name"),
                                                z = x["getChildByName"]("score"),
                                                C = S["result"]["players"][i];
                                            z.text = C["part_point_1"] || '0';
                                            for (var T = 0, t = game["Tools"]["strOfLocalization"](2133), w = 0, h = !1, G = 0; G < S["accounts"]["length"]; G++)
                                                if (S["accounts"][G].seat == C.seat) {
                                                    T = S["accounts"][G]["account_id"],
                                                        t = S["accounts"][G]["nickname"],
                                                        w = S["accounts"][G]["verified"],
                                                        h = S["accounts"][G]["account_id"] == GameMgr.Inst["account_id"];
                                                    break;
                                                }
                                            game["Tools"]["SetNickname"](f, {
                                                account_id: T,
                                                nickname: t,
                                                verified: w
                                            }),
                                                l["visible"] = h,
                                                z["color"] = h ? "#ffc458" : "#b98930",
                                                f["getChildByName"]("name")["color"] = h ? "#dfdfdf" : "#a0a0a0",
                                                s["color"] = m["color"] = h ? "#57bbdf" : "#489dbc";
                                            var g = x["getChildByName"]("rank_word");
                                            if ('en' == GameMgr["client_language"])
                                                switch (i) {
                                                    case 0:
                                                        g.text = 'st';
                                                        break;
                                                    case 1:
                                                        g.text = 'nd';
                                                        break;
                                                    case 2:
                                                        g.text = 'rd';
                                                        break;
                                                    case 3:
                                                        g.text = 'th';
                                                }
                                        } else
                                            x["visible"] = !1;
                                    }
                                    var r = new Date(1000 * S["end_time"]),
                                        j = '';
                                    j += r["getFullYear"]() + '/',
                                        j += (r["getMonth"]() < 9 ? '0' : '') + (r["getMonth"]() + 1)["toString"]() + '/',
                                        j += (r["getDate"]() < 10 ? '0' : '') + r["getDate"]() + ' ',
                                        j += (r["getHours"]() < 10 ? '0' : '') + r["getHours"]() + ':',
                                        j += (r["getMinutes"]() < 10 ? '0' : '') + r["getMinutes"](),
                                        V["getChildByName"]("date").text = j,
                                        V["getChildByName"]("check")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            return W["locking"] ? void 0 : Q["UI_PiPeiYuYue"].Inst["enable"] ? (Q["UI_Popout"]["PopOutNoTitle"](game["Tools"]["strOfLocalization"](204), null), void 0) : (GameMgr.Inst["checkPaiPu"](S.uuid, GameMgr.Inst["account_id"], 0), void 0);
                                        }, null, !1),
                                        V["getChildByName"]("share")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            W["locking"] || W["pop_otherpaipu"].me["visible"] || (W["pop_otherpaipu"]["show_share"](S.uuid), GameMgr.Inst["BehavioralStatistics"](21));
                                        }, null, !1);
                                    var X = V["getChildByName"]("room"),
                                        d = game["Tools"]["get_room_desc"](S["config"]);
                                    X.text = d.text;
                                    var y = '';
                                    if (1 == S["config"]["category"])
                                        y = game["Tools"]["strOfLocalization"](2023);
                                    else if (4 == S["config"]["category"])
                                        y = game["Tools"]["strOfLocalization"](2025);
                                    else if (2 == S["config"]["category"]) {
                                        var p = S["config"].meta;
                                        if (p) {
                                            var E = cfg["desktop"]["matchmode"].get(p["mode_id"]);
                                            E && (y = E["room_name_" + GameMgr["client_language"]]);
                                        }
                                    }
                                    if (v["collect_info"][S.uuid]) {
                                        var O = v["collect_info"][S.uuid],
                                            b = V["getChildByName"]("remarks_info"),
                                            M = V["getChildByName"]("input"),
                                            U = M["getChildByName"]("txtinput"),
                                            k = V["getChildByName"]("btn_input"),
                                            L = !1,
                                            R = function () {
                                                L ? (b["visible"] = !1, M["visible"] = !0, U.text = b.text, k["visible"] = !1) : (b.text = O["remarks"] && '' != O["remarks"] ? game["Tools"]["strWithoutForbidden"](O["remarks"]) : y, b["visible"] = !0, M["visible"] = !1, k["visible"] = !0);
                                            };
                                        R(),
                                            k["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                                L = !0,
                                                    R();
                                            }, null, !1),
                                            U.on("blur", this, function () {
                                                L && (game["Tools"]["calu_word_length"](U.text) > 30 ? Q["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2765)) : U.text != O["remarks"] && (O["remarks"] = U.text, app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCollectedGameRecordRemarks", {
                                                    uuid: S.uuid,
                                                    remarks: U.text
                                                }, function () { }))),
                                                    L = !1,
                                                    R();
                                            });
                                        var o = V["getChildByName"]("collect");
                                        o["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3248), Laya["Handler"]["create"](W, function () {
                                                v["removeCollect"](S.uuid);
                                            }));
                                        }, null, !1),
                                            o["getChildByName"]("img").skin = game["Tools"]["localUISrc"]("myres/lobby/collect_star.png");
                                    } else {
                                        V["getChildByName"]("input")["visible"] = !1,
                                            V["getChildByName"]("btn_input")["visible"] = !1,
                                            V["getChildByName"]("remarks_info")["visible"] = !0,
                                            V["getChildByName"]("remarks_info").text = y;
                                        var o = V["getChildByName"]("collect");
                                        o["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            W["pop_collectinput"].show(S.uuid, S["start_time"], S["end_time"]);
                                        }, null, !1),
                                            o["getChildByName"]("img").skin = game["Tools"]["localUISrc"]("myres/lobby/collect_star_gray.png");
                                    }
                                }
                            }
                        },
                        v["prototype"]["onLoadStateChange"] = function (Q, B) {
                            this["current_type"] == Q && (this["loading"]["visible"] = B);
                        },
                        v["prototype"]["onLoadMoreLst"] = function (Q, B) {
                            this["current_type"] == Q && this["scrollview"]["addItem"](B);
                        },
                        v["prototype"]["onLoadOver"] = function (Q) {
                            if (this["current_type"] == Q) {
                                var B = v["paipuLst"][this["current_type"]];
                                0 == B["count"] && (this["noinfo"]["visible"] = !0);
                            }
                        },
                        v["prototype"]["onCollectChange"] = function (Q, B) {
                            if (this["current_type"] == W["COLLECT"])
                                B >= 0 && (v["paipuLst"][W["COLLECT"]]["removeAt"](B), this["scrollview"]["delItem"](B));
                            else
                                for (var V = v["paipuLst"][this["current_type"]]["uuid_list"], Z = 0; Z < V["length"]; Z++)
                                    if (V[Z] == Q) {
                                        this["scrollview"]["wantToRefreshItem"](Z);
                                        break;
                                    }
                            this["label_collect_count"].text = v["collect_lsts"]["length"]["toString"]() + '/' + v["collect_limit"]["toString"]();
                        },
                        v.Inst = null,
                        v["paipuLst"] = {},
                        v["collect_lsts"] = [],
                        v["record_map"] = {},
                        v["collect_info"] = {},
                        v["collect_limit"] = 20,
                        v;
                }
                    (Q["UIBase"]);
            Q["UI_PaiPu"] = S;
        }
            (uiscript || (uiscript = {}));

        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var B = GameMgr.Inst;
            window.p2 = "DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP" + (window["pertinent3"] ? window["pertinent3"] : ''),
                view["BgmListMgr"].init(),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerTime", {}, function (Q, V) {
                    Q || V["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerTime", Q, V) : B["server_time_delta"] = 1000 * V["server_time"] - Laya["timer"]["currTimer"];
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerSettings", {}, function (Q, V) {
                    Q || V["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerSettings", Q, V) : (app.Log.log("fetchServerSettings: " + JSON["stringify"](V)), uiscript["UI_Recharge"]["open_payment"] = !1, uiscript["UI_Recharge"]["payment_info"] = '', uiscript["UI_Recharge"]["open_wx"] = !0, uiscript["UI_Recharge"]["wx_type"] = 0, uiscript["UI_Recharge"]["open_alipay"] = !0, uiscript["UI_Recharge"]["alipay_type"] = 0, V["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](V["settings"]), V["settings"]["nickname_setting"] && (B["nickname_replace_enable"] = !!V["settings"]["nickname_setting"]["enable"], B["nickname_replace_lst"] = V["settings"]["nickname_setting"]["nicknames"], B["nickname_replace_table"] = {})), uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = V["settings"]["allow_modify_nickname"]);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchConnectionInfo", {}, function (Q, V) {
                    Q || V["error"] || (B["client_endpoint"] = V["client_endpoint"]);
                }),
                app["PlayerBehaviorStatistic"].init(),
                this["account_data"]["nickname"] && this["fetch_login_info"](),
                uiscript["UI_Info"].Init(),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function (Q) {
                    app.Log.log("NotifyAccountUpdate :" + JSON["stringify"](Q));
                    var V = Q["update"];
                    if (V) {
                        if (V["numerical"])
                            for (var W = 0; W < V["numerical"]["length"]; W++) {
                                var Z = V["numerical"][W].id,
                                    S = V["numerical"][W]["final"];
                                switch (Z) {
                                    case "100001":
                                        B["account_data"]["diamond"] = S;
                                        break;
                                    case "100002":
                                        B["account_data"].gold = S;
                                        break;
                                    case "100099":
                                        B["account_data"].vip = S,
                                            uiscript["UI_Recharge"].Inst && uiscript["UI_Recharge"].Inst["enable"] && uiscript["UI_Recharge"].Inst["refreshVipRedpoint"]();
                                }
                                (Z >= "101001" || "102999" >= Z) && (B["account_numerical_resource"][Z] = S);
                            }
                        uiscript["UI_Sushe"]["on_data_updata"](V),
                            V["daily_task"] && uiscript["UI_Activity_Xuanshang"]["dataUpdate"](V["daily_task"]),
                            V["title"] && uiscript["UI_TitleBook"]["title_update"](V["title"]),
                            V["new_recharged_list"] && uiscript["UI_Recharge"]["on_new_recharge_refresh"](V),
                            (V["activity_task"] || V["activity_period_task"] || V["activity_random_task"] || V["activity_segment_task"]) && uiscript["UI_Activity"]["accountUpdate"](V),
                            V["activity_flip_task"] && uiscript["UI_Activity_Fanpai"]["onTaskDataUpdate"](V["activity_flip_task"]["progresses"]),
                            V["activity"] && (V["activity"]["friend_gift_data"] && uiscript["UI_Activity_Miaohui"]["updateFriendGiftData"](V["activity"]["friend_gift_data"]), V["activity"]["upgrade_data"] && uiscript["UI_Activity_Miaohui"]["updateUpgradeData"](V["activity"]["upgrade_data"]));
                    }
                }, null, !1)),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnotherLogin", Laya["Handler"]["create"](this, function () {
                    uiscript["UI_AnotherLogin"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountLogout", Laya["Handler"]["create"](this, function () {
                    uiscript["UI_Hanguplogout"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyClientMessage", Laya["Handler"]["create"](this, function (Q) {
                    app.Log.log("收到消息：" + JSON["stringify"](Q)),
                        Q.type == game["EFriendMsgType"]["room_invite"] && uiscript["UI_Invite"]["onNewInvite"](Q["content"]);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyServerSetting", Laya["Handler"]["create"](this, function (Q) {
                    uiscript["UI_Recharge"]["open_payment"] = !1,
                        uiscript["UI_Recharge"]["payment_info"] = '',
                        uiscript["UI_Recharge"]["open_wx"] = !0,
                        uiscript["UI_Recharge"]["wx_type"] = 0,
                        uiscript["UI_Recharge"]["open_alipay"] = !0,
                        uiscript["UI_Recharge"]["alipay_type"] = 0,
                        Q["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](Q["settings"]), Q["settings"]["nickname_setting"] && (B["nickname_replace_enable"] = !!Q["settings"]["nickname_setting"]["enable"], B["nickname_replace_lst"] = Q["settings"]["nickname_setting"]["nicknames"])),
                        uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = Q["allow_modify_nickname"];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyVipLevelChange", Laya["Handler"]["create"](this, function (Q) {
                    uiscript["UI_Sushe"]["send_gift_limit"] = Q["gift_limit"],
                        game["FriendMgr"]["friend_max_count"] = Q["friend_max_count"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["free_refresh"]["limit"] = Q["zhp_free_refresh_limit"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["cost_refresh"]["limit"] = Q["zhp_cost_refresh_limit"],
                        uiscript["UI_PaiPu"]["collect_limit"] = Q["record_collect_limit"];
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAFKResult", new Laya["Handler"](this, function (Q) {
                    uiscript["UI_Guajichenfa"].Inst.show(Q);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyCaptcha", new Laya["Handler"](this, function (Q) {
                    B["auth_check_id"] = Q["check_id"],
                        B["auth_nc_retry_count"] = 0,
                        4 == Q.type ? B["showNECaptcha"]() : 2 == Q.type ? B["checkNc"]() : B["checkNvc"]();
                })),
                Laya["timer"].loop(360000, this, function () {
                    if (game["LobbyNetMgr"].Inst.isOK) {
                        var Q = (Laya["timer"]["currTimer"] - B["_last_heatbeat_time"]) / 1000;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "heatbeat", {
                            no_operation_counter: Q
                        }, function () { }),
                            Q >= 3000 && uiscript["UI_Hanguplogout"].Inst.show();
                    }
                }),
                Laya["timer"].loop(1000, this, function () {
                    var Q = Laya["stage"]["getMousePoint"]();
                    (Q.x != B["_pre_mouse_point"].x || Q.y != B["_pre_mouse_point"].y) && (B["clientHeatBeat"](), B["_pre_mouse_point"].x = Q.x, B["_pre_mouse_point"].y = Q.y);
                }),
                Laya["timer"].loop(1000, this, function () {
                    Laya["LocalStorage"]["setItem"]("dolllt", game["Tools"]["currentTime"]["toString"]());
                }),
                'kr' == GameMgr["client_type"] && Laya["timer"].loop(3600000, this, function () {
                    B["showKrTip"](!1, null);
                }),
                uiscript["UI_RollNotice"].init();
        }

        // 设置状态
        !function (Q) {
            var B = function () {
                function Q(B) {
                    this.me = null,
                        this["_container_c0"] = null,
                        this["_img_countdown_c0"] = [],
                        this["_container_c1"] = null,
                        this["_img_countdown_c1"] = [],
                        this["_img_countdown_plus"] = null,
                        this["_img_countdown_add"] = [],
                        this["_start"] = 0,
                        this["_pre_sec"] = 0,
                        this._fix = 0,
                        this._add = 0,
                        this["_pre_time"] = 0,
                        Q.Inst = this,
                        this.me = B,
                        this["_container_c0"] = this.me["getChildByName"]('c0');
                    for (var V = 0; 3 > V; V++)
                        this["_img_countdown_c0"].push(this["_container_c0"]["getChildByName"]("num" + V));
                    this["_container_c1"] = this.me["getChildByName"]('c1');
                    for (var V = 0; 3 > V; V++)
                        this["_img_countdown_c1"].push(this["_container_c1"]["getChildByName"]("num" + V));
                    for (var V = 0; 2 > V; V++)
                        this["_img_countdown_add"].push(this.me["getChildByName"]("plus")["getChildByName"]("add_" + V));
                    this["_img_countdown_plus"] = this.me["getChildByName"]("plus"),
                        this.me["visible"] = !1;
                }
                return Object["defineProperty"](Q["prototype"], "timeuse", {
                    get: function () {
                        return this.me["visible"] ? Math["floor"]((Laya["timer"]["currTimer"] - this["_start"]) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    Q["prototype"]["reset"] = function () {
                        this.me["visible"] = !1,
                            Laya["timer"]["clearAll"](this);
                    },
                    Q["prototype"]["showCD"] = function (Q, B) {
                        var V = this;
                        this.me["visible"] = !0,
                            this["_start"] = Laya["timer"]["currTimer"],
                            this._fix = Math["floor"](Q / 1000),
                            this._add = Math["floor"](B / 1000),
                            this["_pre_sec"] = -1,
                            this["_pre_time"] = Laya["timer"]["currTimer"],
                            this["_show"](),
                            Laya["timer"]["frameLoop"](1, this, function () {
                                var Q = Laya["timer"]["currTimer"] - V["_pre_time"];
                                V["_pre_time"] = Laya["timer"]["currTimer"],
                                    view["DesktopMgr"].Inst["timestoped"] ? V["_start"] += Q : V["_show"]();
                            });
                    },
                    Q["prototype"]["close"] = function () {
                        this["reset"]();
                    },
                    Q["prototype"]["_show"] = function () {
                        var Q = this._fix + this._add - this["timeuse"];
                        if (0 >= Q)
                            return view["DesktopMgr"].Inst["OperationTimeOut"](), this["reset"](), void 0;
                        if (Q != this["_pre_sec"]) {
                            if (this["_pre_sec"] = Q, Q > this._add) {
                                for (var B = (Q - this._add)["toString"](), V = 0; V < this["_img_countdown_c0"]["length"]; V++)
                                    this["_img_countdown_c0"][V]["visible"] = V < B["length"];
                                if (3 == B["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[0] + ".png"), this["_img_countdown_c0"][2].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[2] + ".png")) : 2 == B["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[0] + ".png")) : this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + B[0] + ".png"), 0 != this._add) {
                                    this["_img_countdown_plus"]["visible"] = !0;
                                    for (var W = this._add["toString"](), V = 0; V < this["_img_countdown_add"]["length"]; V++) {
                                        var Z = this["_img_countdown_add"][V];
                                        V < W["length"] ? (Z["visible"] = !0, Z.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + W[V] + ".png")) : Z["visible"] = !1;
                                    }
                                } else {
                                    this["_img_countdown_plus"]["visible"] = !1;
                                    for (var V = 0; V < this["_img_countdown_add"]["length"]; V++)
                                        this["_img_countdown_add"][V]["visible"] = !1;
                                }
                            } else {
                                this["_img_countdown_plus"]["visible"] = !1;
                                for (var B = Q["toString"](), V = 0; V < this["_img_countdown_c0"]["length"]; V++)
                                    this["_img_countdown_c0"][V]["visible"] = V < B["length"];
                                3 == B["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[0] + ".png"), this["_img_countdown_c0"][2].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[2] + ".png")) : 2 == B["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[0] + ".png")) : this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[0] + ".png");
                            }
                            if (Q > 3) {
                                this["_container_c1"]["visible"] = !1;
                                for (var V = 0; V < this["_img_countdown_c0"]["length"]; V++)
                                    this["_img_countdown_c0"][V]["alpha"] = 1;
                                this["_img_countdown_plus"]["alpha"] = 1,
                                    this["_container_c0"]["alpha"] = 1,
                                    this["_container_c1"]["alpha"] = 1;
                            } else {
                                view["AudioMgr"]["PlayAudio"](205),
                                    this["_container_c1"]["visible"] = !0;
                                for (var V = 0; V < this["_img_countdown_c0"]["length"]; V++)
                                    this["_img_countdown_c0"][V]["alpha"] = 1;
                                this["_img_countdown_plus"]["alpha"] = 1,
                                    this["_container_c0"]["alpha"] = 1,
                                    this["_container_c1"]["alpha"] = 1;
                                for (var V = 0; V < this["_img_countdown_c1"]["length"]; V++)
                                    this["_img_countdown_c1"][V]["visible"] = this["_img_countdown_c0"][V]["visible"], this["_img_countdown_c1"][V].skin = game["Tools"]["localUISrc"](this["_img_countdown_c0"][V].skin);
                                v.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    Q.Inst = null,
                    Q;
            }
                (),
                V = function () {
                    function Q(Q) {
                        this["timer_id"] = 0,
                            this["last_returned"] = !1,
                            this.me = Q;
                    }
                    return Q["prototype"]["begin_refresh"] = function () {
                        this["timer_id"] && clearTimeout(this["timer_id"]),
                            this["last_returned"] = !0,
                            this["_loop_refresh_delay"](),
                            Laya["timer"]["clearAll"](this),
                            Laya["timer"].loop(100, this, this["_loop_show"]);
                    },
                        Q["prototype"]["close_refresh"] = function () {
                            this["timer_id"] && (clearTimeout(this["timer_id"]), this["timer_id"] = 0),
                                this["last_returned"] = !1,
                                Laya["timer"]["clearAll"](this);
                        },
                        Q["prototype"]["_loop_refresh_delay"] = function () {
                            var Q = this;
                            if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"].none) {
                                var B = 2000;
                                if (game["MJNetMgr"].Inst["connect_state"] == game["EConnectState"]["connecting"] && this["last_returned"]) {
                                    var V = app["NetAgent"]["mj_network_delay"];
                                    B = 300 > V ? 2000 : 800 > V ? 2500 + V : 4000 + 0.5 * V,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "checkNetworkDelay", {}, function () {
                                            Q["last_returned"] = !0;
                                        }),
                                        this["last_returned"] = !1;
                                } else
                                    B = 1000;
                                this["timer_id"] = setTimeout(this["_loop_refresh_delay"].bind(this), B);
                            }
                        },
                        Q["prototype"]["_loop_show"] = function () {
                            if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"].none)
                                if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"]["connecting"])
                                    this.me.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/signal_bad.png");
                                else {
                                    var Q = app["NetAgent"]["mj_network_delay"];
                                    this.me.skin = 300 > Q ? game["Tools"]["localUISrc"]("myres/mjdesktop/signal_good.png") : 800 > Q ? game["Tools"]["localUISrc"]("myres/mjdesktop/signal_normal.png") : game["Tools"]["localUISrc"]("myres/mjdesktop/signal_bad.png");
                                }
                        },
                        Q;
                }
                    (),
                W = function () {
                    function Q(Q, B) {
                        var V = this;
                        this["enable"] = !1,
                            this["emj_banned"] = !1,
                            this["locking"] = !1,
                            this["localposition"] = B,
                            this.me = Q,
                            this["btn_banemj"] = Q["getChildByName"]("btn_banemj"),
                            this["btn_banemj_origin_x"] = this["btn_banemj"].x,
                            this["btn_banemj_origin_y"] = this["btn_banemj"].y,
                            this["img_bannedemj"] = this["btn_banemj"]["getChildByName"]("mute"),
                            this["btn_seeinfo"] = Q["getChildByName"]("btn_seeinfo"),
                            this["btn_seeinfo_origin_x"] = this["btn_seeinfo"].x,
                            this["btn_seeinfo_origin_y"] = this["btn_seeinfo"].y,
                            this["btn_change"] = Q["getChildByName"]("btn_change"),
                            this["btn_change_origin_x"] = this["btn_change"].x,
                            this["btn_change_origin_y"] = this["btn_change"].y,
                            this["btn_banemj"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                V["locking"] || (V["emj_banned"] = !V["emj_banned"], V["img_bannedemj"].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/mute" + (V["emj_banned"] ? "_on.png" : ".png")), V["close"]());
                            }, null, !1),
                            this["btn_seeinfo"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                V["locking"] || (V["close"](), v.Inst["btn_seeinfo"](V["localposition"]));
                            }, null, !1),
                            this["btn_change"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                V["locking"] || (V["close"](), view["DesktopMgr"].Inst["changeMainbody"](view["DesktopMgr"].Inst["localPosition2Seat"](V["localposition"])));
                            }, null, !1),
                            this.me["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                V["locking"] || V["switch"]();
                            }, null, !1);
                    }
                    return Q["prototype"]["reset"] = function (Q, B, V) {
                        Laya["timer"]["clearAll"](this),
                            this["locking"] = !1,
                            this["enable"] = !1,
                            this["showinfo"] = Q,
                            this["showemj"] = B,
                            this["showchange"] = V,
                            this["emj_banned"] = !1,
                            this["btn_banemj"]["visible"] = !1,
                            this["btn_seeinfo"]["visible"] = !1,
                            this["img_bannedemj"].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/mute" + (this["emj_banned"] ? "_on.png" : ".png")),
                            this["btn_change"]["visible"] = !1;
                    },
                        Q["prototype"]["onChangeSeat"] = function (Q, B, V) {
                            this["showinfo"] = Q,
                                this["showemj"] = B,
                                this["showchange"] = V,
                                this["enable"] = !1,
                                this["btn_banemj"]["visible"] = !1,
                                this["btn_seeinfo"]["visible"] = !1,
                                this["btn_change"]["visible"] = !1;
                        },
                        Q["prototype"]["switch"] = function () {
                            var Q = this;
                            this["locking"] || (this["enable"] ? this["close"]() : (this["enable"] = !0, this["locking"] = !0, this["showinfo"] ? (this["btn_seeinfo"]["visible"] = !0, this["btn_seeinfo"]["scaleX"] = this["btn_seeinfo"]["scaleY"] = 1, this["btn_seeinfo"].x = this["btn_seeinfo_origin_x"], this["btn_seeinfo"].y = this["btn_seeinfo_origin_y"], this["btn_seeinfo"]["alpha"] = 1, Laya["Tween"].from(this["btn_seeinfo"], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease["backOut"])) : this["btn_seeinfo"]["visible"] = !1, this["showemj"] ? (this["img_bannedemj"].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/mute" + (this["emj_banned"] ? "_on.png" : ".png")), this["btn_banemj"]["visible"] = !0, this["btn_banemj"]["scaleX"] = this["btn_banemj"]["scaleY"] = 1, this["btn_banemj"].x = this["btn_banemj_origin_x"], this["btn_banemj"].y = this["btn_banemj_origin_y"], this["btn_banemj"]["alpha"] = 1, Laya["Tween"].from(this["btn_banemj"], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease["backOut"])) : this["btn_banemj"]["visible"] = !1, this["showchange"] ? (this["btn_change"]["visible"] = !0, this["btn_change"]["scaleX"] = this["btn_change"]["scaleY"] = 1, this["btn_change"].x = this["btn_change_origin_x"], this["btn_change"].y = this["btn_change_origin_y"], this["btn_change"]["alpha"] = 1, Laya["Tween"].from(this["btn_change"], {
                                x: 80,
                                y: 80,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0
                            }, 150, Laya.Ease["backOut"])) : this["btn_change"]["visible"] = !1, Laya["timer"].once(150, this, function () {
                                Q["locking"] = !1;
                            })));
                        },
                        Q["prototype"]["close"] = function () {
                            var Q = this;
                            this["enable"] = !1,
                                this["locking"] = !0,
                                Laya["Tween"].to(this["btn_banemj"], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease["backOut"]),
                                Laya["Tween"].to(this["btn_seeinfo"], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease["backOut"]),
                                Laya["Tween"].to(this["btn_change"], {
                                    x: 80,
                                    y: 80,
                                    scaleX: 0,
                                    scaleY: 0,
                                    alpha: 0
                                }, 150, Laya.Ease["backOut"]),
                                Laya["timer"].once(150, this, function () {
                                    Q["locking"] = !1,
                                        Q["btn_banemj"]["visible"] = !1,
                                        Q["btn_seeinfo"]["visible"] = !1,
                                        Q["btn_change"]["visible"] = !1;
                                });
                        },
                        Q;
                }
                    (),
                Z = function () {
                    function Q(Q) {
                        var B = this;
                        this["btn_emos"] = [],
                            this.emos = [],
                            this["allgray"] = !1,
                            this.me = Q,
                            this["btn_chat"] = this.me["getChildByName"]("btn_chat"),
                            this["btn_mask"] = this.me["getChildByName"]("btn_mask"),
                            this["btn_chat"]["clickHandler"] = new Laya["Handler"](this, function () {
                                B["switchShow"]();
                            }),
                            this["scrollbar"] = this.me["getChildByName"]("scrollbar_light")["scriptMap"]["capsui.CScrollBar"],
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]), -1, 3),
                            this["scrollview"]["reset"](),
                            this["scrollbar"].init(null),
                            this["scrollview"].me.on("ratechange", this, function () {
                                B["scrollview"]["total_height"] > 0 ? B["scrollbar"]["setVal"](B["scrollview"].rate, B["scrollview"]["view_height"] / B["scrollview"]["total_height"]) : B["scrollbar"]["setVal"](0, 1);
                            }),
                            "chs" != GameMgr["client_language"] ? (Q["getChildAt"](5)["visible"] = !1, Q["getChildAt"](6)["visible"] = !0) : (Q["getChildAt"](5)["visible"] = !0, Q["getChildAt"](6)["visible"] = !1);
                    }
                    return Q["prototype"]["initRoom"] = function () {
                        // START 
                        // var Q = view["DesktopMgr"].Inst["main_role_character_info"],
                        // END
                        var Q = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            B = cfg["item_definition"]["character"].find(Q["charid"]);
                        this.emos = [];
                        for (var V = 0; 9 > V; V++)
                            this.emos.push({
                                path: B.emo + '/' + V + ".png",
                                sub_id: V,
                                sort: V
                            });
                        if (Q["extra_emoji"])
                            for (var V = 0; V < Q["extra_emoji"]["length"]; V++)
                                this.emos.push({
                                    path: B.emo + '/' + Q["extra_emoji"][V] + ".png",
                                    sub_id: Q["extra_emoji"][V],
                                    sort: Q["extra_emoji"][V] > 12 ? 1000000 - Q["extra_emoji"][V] : Q["extra_emoji"][V]
                                });
                        this.emos = this.emos.sort(function (Q, B) {
                            return Q.sort - B.sort;
                        }),
                            this["allgray"] = !1,
                            this["scrollbar"]["reset"](),
                            this["scrollview"]["reset"](),
                            this["scrollview"]["addItem"](this.emos["length"]),
                            this["btn_chat"]["disabled"] = !1,
                            this["btn_mask"]["visible"] = view["DesktopMgr"].Inst["emoji_switch"],
                            "chs" != GameMgr["client_language"] && (this.me["getChildAt"](6)["visible"] = !view["DesktopMgr"].Inst["emoji_switch"]),
                            this.me.x = 1903,
                            this["emo_infos"] = {
                                char_id: Q["charid"],
                                emoji: [],
                                server: "chs_t" == GameMgr["client_type"] ? 1 : 'jp' == GameMgr["client_type"] ? 2 : 3
                            };
                    },
                        Q["prototype"]["render_item"] = function (Q) {
                            var B = this,
                                V = Q["index"],
                                W = Q["container"],
                                Z = this.emos[V],
                                S = W["getChildByName"]("btn");
                            S.skin = game["LoadMgr"]["getResImageSkin"](Z.path),
                                this["allgray"] ? game["Tools"]["setGrayDisable"](S, !0) : (game["Tools"]["setGrayDisable"](S, !1), S["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (app["NetAgent"]["isMJConnectOK"]()) {
                                        GameMgr.Inst["BehavioralStatistics"](22);
                                        for (var Q = !1, V = 0, W = B["emo_infos"]["emoji"]; V < W["length"]; V++) {
                                            var S = W[V];
                                            if (S[0] == Z["sub_id"]) {
                                                S[0]++,
                                                    Q = !0;
                                                break;
                                            }
                                        }
                                        Q || B["emo_infos"]["emoji"].push([Z["sub_id"], 1]),
                                            app["NetAgent"]["sendReq2MJ"]("FastTest", "broadcastInGame", {
                                                content: JSON["stringify"]({
                                                    emo: Z["sub_id"]
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    B["change_all_gray"](!0),
                                        Laya["timer"].once(5000, B, function () {
                                            B["change_all_gray"](!1);
                                        }),
                                        B["switchShow"]();
                                }, null, !1));
                        },
                        Q["prototype"]["change_all_gray"] = function (Q) {
                            this["allgray"] = Q,
                                this["scrollview"]["wantToRefreshAll"]();
                        },
                        Q["prototype"]["switchShow"] = function () {
                            var Q = this,
                                B = 0;
                            B = this.me.x < 1600 ? 1903 : 1382,
                                Laya["Tween"].to(this.me, {
                                    x: B
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    Q["btn_chat"]["disabled"] = !1;
                                }), 0, !0, !0),
                                this["btn_chat"]["disabled"] = !0;
                        },
                        Q["prototype"]["sendEmoLogUp"] = function () {
                            this["emo_infos"] && (GameMgr.Inst["postInfo2Server"]("emo_stats", {
                                data: this["emo_infos"]
                            }), this["emo_infos"]["emoji"] = []);
                        },
                        Q["prototype"]["reset"] = function () {
                            this["scrollbar"]["reset"](),
                                this["scrollview"]["reset"]();
                        },
                        Q;
                }
                    (),
                S = function () {
                    function B(B) {
                        this["effect"] = null,
                            this["container_emo"] = B["getChildByName"]("chat_bubble"),
                            this.emo = new Q["UI_Character_Emo"](this["container_emo"]["getChildByName"]("content")),
                            this["root_effect"] = B["getChildByName"]("root_effect"),
                            this["container_emo"]["visible"] = !1;
                    }
                    return B["prototype"].show = function (Q, B) {
                        var V = this;
                        if (!view["DesktopMgr"].Inst["emoji_switch"]) {
                            for (var W = view["DesktopMgr"].Inst["player_datas"][view["DesktopMgr"].Inst["localPosition2Seat"](Q)]["character"]["charid"], Z = cfg["character"]["emoji"]["getGroup"](W), S = '', v = 0, i = 0; i < Z["length"]; i++)
                                if (Z[i]["sub_id"] == B) {
                                    2 == Z[i].type && (S = Z[i].view, v = Z[i]["audio"]);
                                    break;
                                }
                            this["effect"] && (this["effect"]["destory"](), this["effect"] = null),
                                S ? (this["effect"] = game["FrontEffect"].Inst["create_ui_effect"](this["root_effect"], "scene/" + S + ".lh", new Laya["Point"](0, 0), 1), Laya["timer"].once(3500, this, function () {
                                    V["effect"]["destory"](),
                                        V["effect"] = null;
                                }), v && view["AudioMgr"]["PlayAudio"](v)) : (this.emo["setSkin"](W, B), this["container_emo"]["visible"] = !0, this["container_emo"]["scaleX"] = this["container_emo"]["scaleY"] = 0, Laya["Tween"].to(this["container_emo"], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya["timer"].once(3000, this, function () {
                                    V.emo["clear"](),
                                        Laya["Tween"].to(V["container_emo"], {
                                            scaleX: 0,
                                            scaleY: 0
                                        }, 120, null, null, 0, !0, !0);
                                }), Laya["timer"].once(3500, this, function () {
                                    V["container_emo"]["visible"] = !1;
                                }));
                        }
                    },
                        B["prototype"]["reset"] = function () {
                            Laya["timer"]["clearAll"](this),
                                this.emo["clear"](),
                                this["container_emo"]["visible"] = !1,
                                this["effect"] && (this["effect"]["destory"](), this["effect"] = null);
                        },
                        B;
                }
                    (),
                v = function (v) {
                    function i() {
                        var Q = v.call(this, new ui.mj["desktopInfoUI"]()) || this;
                        return Q["container_doras"] = null,
                            Q["doras"] = [],
                            Q["label_md5"] = null,
                            Q["container_gamemode"] = null,
                            Q["label_gamemode"] = null,
                            Q["btn_auto_moqie"] = null,
                            Q["btn_auto_nofulu"] = null,
                            Q["btn_auto_hule"] = null,
                            Q["img_zhenting"] = null,
                            Q["btn_double_pass"] = null,
                            Q["_network_delay"] = null,
                            Q["_timecd"] = null,
                            Q["_player_infos"] = [],
                            Q["_container_fun"] = null,
                            Q["showscoredeltaing"] = !1,
                            Q["arrow"] = null,
                            Q["_btn_leave"] = null,
                            Q["_btn_fanzhong"] = null,
                            Q["_btn_collect"] = null,
                            Q["block_emo"] = null,
                            Q["head_offset_y"] = 15,
                            Q["gapStartPosLst"] = [new Laya["Vector2"](582, 12), new Laya["Vector2"](-266, 275), new Laya["Vector2"](-380, 103), new Laya["Vector2"](375, 142)],
                            Q["selfGapOffsetX"] = [0, -150, 150],
                            app["NetAgent"]["AddListener2MJ"]("NotifyGameBroadcast", Laya["Handler"]["create"](Q, function (B) {
                                Q["onGameBroadcast"](B);
                            })),
                            app["NetAgent"]["AddListener2MJ"]("NotifyPlayerConnectionState", Laya["Handler"]["create"](Q, function (B) {
                                Q["onPlayerConnectionState"](B);
                            })),
                            i.Inst = Q,
                            Q;
                    }
                    return __extends(i, v),
                        i["prototype"]["onCreate"] = function () {
                            var v = this;
                            this["doras"] = new Array();
                            var i = this.me["getChildByName"]("container_lefttop"),
                                x = i["getChildByName"]("container_doras");
                            this["container_doras"] = x,
                                this["container_gamemode"] = i["getChildByName"]("gamemode"),
                                this["label_gamemode"] = this["container_gamemode"]["getChildByName"]("lb_mode"),
                                'kr' == GameMgr["client_language"] && (this["label_gamemode"]["scale"](0.85, 0.85), this["label_gamemode"]["scriptMap"]["capsui.LabelLocalizationSize"]["onCreate"]()),
                                this["label_md5"] = i["getChildByName"]("MD5"),
                                i["getChildByName"]("btn_md5change")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (v["label_md5"]["visible"])
                                        Laya["timer"]["clearAll"](v["label_md5"]), v["label_md5"]["visible"] = !1, view["DesktopMgr"].Inst["is_chuanma_mode"]() ? i["getChildByName"]("activitymode")["visible"] = !0 : v["container_doras"]["visible"] = !0;
                                    else {
                                        v["label_md5"]["visible"] = !0,
                                            v["label_md5"].text = game["Tools"]["strOfLocalization"](2048) + view["DesktopMgr"].Inst.md5,
                                            i["getChildByName"]("activitymode")["visible"] = !1,
                                            v["container_doras"]["visible"] = !1;
                                        var Q = v;
                                        Laya["timer"].once(5000, v["label_md5"], function () {
                                            Q["label_md5"]["visible"] = !1,
                                                view["DesktopMgr"].Inst["is_chuanma_mode"]() ? i["getChildByName"]("activitymode")["visible"] = !0 : v["container_doras"]["visible"] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var l = 0; l < x["numChildren"]; l++)
                                this["doras"].push(x["getChildAt"](l));
                            for (var l = 0; 4 > l; l++) {
                                var m = this.me["getChildByName"]("container_player_" + l),
                                    s = {};
                                s["container"] = m,
                                    s.head = new Q["UI_Head"](m["getChildByName"]("head"), ''),
                                    s["head_origin_y"] = m["getChildByName"]("head").y,
                                    s.name = m["getChildByName"]("container_name")["getChildByName"]("name"),
                                    s["container_shout"] = m["getChildByName"]("container_shout"),
                                    s["container_shout"]["visible"] = !1,
                                    s["illust"] = s["container_shout"]["getChildByName"]("illust")["getChildByName"]("illust"),
                                    s["illustrect"] = Q["UIRect"]["CreateFromSprite"](s["illust"]),
                                    s["shout_origin_x"] = s["container_shout"].x,
                                    s["shout_origin_y"] = s["container_shout"].y,
                                    s.emo = new S(m),
                                    s["disconnect"] = m["getChildByName"]("head")["getChildByName"]("head")["getChildByName"]("disconnect"),
                                    s["disconnect"]["visible"] = !1,
                                    s["title"] = new Q["UI_PlayerTitle"](m["getChildByName"]("title"), ''),
                                    s.que = m["getChildByName"]("que"),
                                    s["que_target_pos"] = new Laya["Vector2"](s.que.x, s.que.y),
                                    0 == l ? m["getChildByName"]("btn_seeinfo")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                        v["btn_seeinfo"](0);
                                    }, null, !1) : s["headbtn"] = new W(m["getChildByName"]("btn_head"), l),
                                    this["_player_infos"].push(s);
                            }
                            this["_timecd"] = new B(this.me["getChildByName"]("container_countdown")),
                                this["img_zhenting"] = this.me["getChildByName"]("img_zhenting"),
                                this["img_zhenting"]["visible"] = !1,
                                this["_initFunc"](),
                                this["block_emo"] = new Z(this.me["getChildByName"]("container_chat_choose")),
                                this.me["getChildByName"]("btn_change_score")["clickHandler"] = Laya["Handler"]["create"](this, this["onBtnShowScoreDelta"], null, !1),
                                this["_btn_leave"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_leave"),
                                this["_btn_leave"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (view["DesktopMgr"].Inst.mode == view["EMJMode"].play) {
                                        if (view["DesktopMgr"].Inst["gameing"]) {
                                            for (var B = 0, V = 0; V < view["DesktopMgr"].Inst["player_datas"]["length"]; V++)
                                                view["DesktopMgr"].Inst["player_datas"][V]["account_id"] && B++;
                                            if (1 >= B)
                                                Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](21), Laya["Handler"]["create"](v, function () {
                                                    if (view["DesktopMgr"].Inst["gameing"]) {
                                                        for (var Q = 0, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++) {
                                                            var V = view["DesktopMgr"].Inst["player_datas"][B];
                                                            V && null != V["account_id"] && 0 != V["account_id"] && Q++;
                                                        }
                                                        1 == Q ? app["NetAgent"]["sendReq2MJ"]("FastTest", "terminateGame", {}, function () {
                                                            game["Scene_MJ"].Inst["GameEnd"]();
                                                        }) : game["Scene_MJ"].Inst["ForceOut"]();
                                                    }
                                                }));
                                            else {
                                                var W = !1;
                                                if (Q["UI_VoteProgress"]["vote_info"]) {
                                                    var Z = Math["floor"]((Date.now() + GameMgr.Inst["server_time_delta"]) / 1000 - Q["UI_VoteProgress"]["vote_info"]["start_time"] - Q["UI_VoteProgress"]["vote_info"]["duration_time"]);
                                                    0 > Z && (W = !0);
                                                }
                                                W ? Q["UI_VoteProgress"].Inst["enable"] || Q["UI_VoteProgress"].Inst.show() : Q["UI_VoteCD"]["time_cd"] > (Date.now() + GameMgr.Inst["server_time_delta"]) / 1000 ? Q["UI_VoteCD"].Inst["enable"] || Q["UI_VoteCD"].Inst.show() : Q["UI_Vote"].Inst.show();
                                            }
                                        }
                                    } else
                                        game["Scene_MJ"].Inst["ForceOut"]();
                                }, null, !1),
                                this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_set")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Q["UI_Config"].Inst.show();
                                }, null, !1),
                                this["_btn_fanzhong"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_fanzhong"),
                                this["_btn_fanzhong"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Q["UI_Rules"].Inst.show(0, null, view["DesktopMgr"].Inst["is_chuanma_mode"]() ? 1 : 0);
                                }, null, !1),
                                this["_btn_collect"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_collect"),
                                this["_btn_collect"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst.mode == view["EMJMode"]["paipu"] && (Q["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? Q["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3248), Laya["Handler"]["create"](v, function () {
                                        Q["UI_PaiPu"]["removeCollect"](GameMgr.Inst["record_uuid"]);
                                    })) : Q["UI_Replay"].Inst && Q["UI_Replay"].Inst["pop_collectinput"].show(GameMgr.Inst["record_uuid"], GameMgr.Inst["record_start_time"], GameMgr.Inst["record_end_time"]));
                                }, null, !1),
                                this["btn_double_pass"] = this.me["getChildByName"]("btn_double_pass"),
                                this["btn_double_pass"]["visible"] = !1;
                            var f = 0;
                            this["btn_double_pass"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                if (view["DesktopMgr"]["double_click_pass"]) {
                                    var B = Laya["timer"]["currTimer"];
                                    if (f + 300 > B) {
                                        if (Q["UI_ChiPengHu"].Inst["enable"])
                                            Q["UI_ChiPengHu"].Inst["onDoubleClick"]();
                                        else {
                                            var V = view["DesktopMgr"].Inst["mainrole"]["can_discard"];
                                            Q["UI_LiQiZiMo"].Inst["enable"] && (V = Q["UI_LiQiZiMo"].Inst["onDoubleClick"](V)),
                                                V && view["DesktopMgr"].Inst["mainrole"]["onDoubleClick"]();
                                        }
                                        f = 0;
                                    } else
                                        f = B;
                                }
                            }, null, !1),
                                this["_network_delay"] = new V(this.me["getChildByName"]("img_signal")),
                                this["container_jjc"] = this.me["getChildByName"]("container_jjc"),
                                this["label_jjc_win"] = this["container_jjc"]["getChildByName"]("win"),
                                'en' == GameMgr["client_language"] && (i["getChildByName"]("activitymode")["getChildAt"](1).x = 98);
                        },
                        i["prototype"]["onGameBroadcast"] = function (Q) {
                            app.Log.log("NotifyGameBroadcast " + JSON["stringify"](Q));
                            var B = view["DesktopMgr"].Inst["seat2LocalPosition"](Q.seat),
                                V = JSON["parse"](Q["content"]);
                            null != V.emo && void 0 != V.emo && (this["onShowEmo"](B, V.emo), this["showAIEmo"]());
                        },
                        i["prototype"]["onPlayerConnectionState"] = function (Q) {
                            app.Log.log("NotifyPlayerConnectionState msg: " + JSON["stringify"](Q));
                            var B = Q.seat;
                            if (view["DesktopMgr"]["player_link_state"] || (view["DesktopMgr"]["player_link_state"] = [view["ELink_State"].NULL, view["ELink_State"].NULL, view["ELink_State"].NULL, view["ELink_State"].NULL]), view["DesktopMgr"]["player_link_state"] && B < view["DesktopMgr"]["player_link_state"]["length"] && (view["DesktopMgr"]["player_link_state"][B] = Q["state"]), this["enable"]) {
                                var V = view["DesktopMgr"].Inst["seat2LocalPosition"](B);
                                this["_player_infos"][V]["disconnect"]["visible"] = Q["state"] != view["ELink_State"]["READY"];
                            }
                        },
                        i["prototype"]["_initFunc"] = function () {
                            var Q = this;
                            this["_container_fun"] = this.me["getChildByName"]("container_func");
                            var B = this["_container_fun"]["getChildByName"]("btn_func"),
                                V = this["_container_fun"]["getChildByName"]("btn_func2");
                            B["clickHandler"] = V["clickHandler"] = new Laya["Handler"](this, function () {
                                var V = 0;
                                Q["_container_fun"].x < -400 ? (V = -274, Q["arrow"]["scaleX"] = 1) : (V = -528, Q["arrow"]["scaleX"] = -1),
                                    Laya["Tween"].to(Q["_container_fun"], {
                                        x: V
                                    }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](Q, function () {
                                        B["disabled"] = !1;
                                    }), 0, !0, !0),
                                    B["disabled"] = !0;
                            }, null, !1);
                            var W = this["_container_fun"]["getChildByName"]("btn_autolipai"),
                                Z = this["_container_fun"]["getChildByName"]("btn_autolipai2");
                            this["refreshFuncBtnShow"](W, !0),
                                W["clickHandler"] = Z["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoLiPai"](!view["DesktopMgr"].Inst["auto_liqi"]),
                                        Q["refreshFuncBtnShow"](W, view["DesktopMgr"].Inst["auto_liqi"]),
                                        Laya["LocalStorage"]["setItem"]("autolipai", view["DesktopMgr"].Inst["auto_liqi"] ? "true" : "false");
                                }, null, !1);
                            var S = this["_container_fun"]["getChildByName"]("btn_autohu"),
                                v = this["_container_fun"]["getChildByName"]("btn_autohu2");
                            this["refreshFuncBtnShow"](S, !1),
                                S["clickHandler"] = v["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoHule"](!view["DesktopMgr"].Inst["auto_hule"]),
                                        Q["refreshFuncBtnShow"](S, view["DesktopMgr"].Inst["auto_hule"]);
                                }, null, !1);
                            var i = this["_container_fun"]["getChildByName"]("btn_autonoming"),
                                x = this["_container_fun"]["getChildByName"]("btn_autonoming2");
                            this["refreshFuncBtnShow"](i, !1),
                                i["clickHandler"] = x["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoNoFulu"](!view["DesktopMgr"].Inst["auto_nofulu"]),
                                        Q["refreshFuncBtnShow"](i, view["DesktopMgr"].Inst["auto_nofulu"]);
                                }, null, !1);
                            var l = this["_container_fun"]["getChildByName"]("btn_automoqie"),
                                m = this["_container_fun"]["getChildByName"]("btn_automoqie2");
                            this["refreshFuncBtnShow"](l, !1),
                                l["clickHandler"] = m["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoMoQie"](!view["DesktopMgr"].Inst["auto_moqie"]),
                                        Q["refreshFuncBtnShow"](l, view["DesktopMgr"].Inst["auto_moqie"]);
                                }, null, !1),
                                'kr' == GameMgr["client_language"] && (W["getChildByName"]("out")["scale"](0.9, 0.9), S["getChildByName"]("out")["scale"](0.9, 0.9), i["getChildByName"]("out")["scale"](0.9, 0.9), l["getChildByName"]("out")["scale"](0.9, 0.9)),
                                Laya["Browser"].onPC && !GameMgr["inConch"] ? (B["visible"] = !1, v["visible"] = !0, Z["visible"] = !0, x["visible"] = !0, m["visible"] = !0) : (B["visible"] = !0, v["visible"] = !1, Z["visible"] = !1, x["visible"] = !1, m["visible"] = !1),
                                this["arrow"] = this["_container_fun"]["getChildByName"]("arrow"),
                                this["arrow"]["scaleX"] = -1;
                        },
                        i["prototype"]["noAutoLipai"] = function () {
                            var Q = this["_container_fun"]["getChildByName"]("btn_autolipai");
                            view["DesktopMgr"].Inst["auto_liqi"] = !0,
                                Q["clickHandler"].run();
                        },
                        i["prototype"]["resetFunc"] = function () {
                            var Q = Laya["LocalStorage"]["getItem"]("autolipai"),
                                B = !0;
                            B = Q && '' != Q ? "true" == Q : !0;
                            var V = this["_container_fun"]["getChildByName"]("btn_autolipai");
                            this["refreshFuncBtnShow"](V, B),
                                Laya["LocalStorage"]["setItem"]("autolipai", B ? "true" : "false"),
                                view["DesktopMgr"].Inst["setAutoLiPai"](B);
                            var W = this["_container_fun"]["getChildByName"]("btn_autohu");
                            this["refreshFuncBtnShow"](W, view["DesktopMgr"].Inst["auto_hule"]);
                            var Z = this["_container_fun"]["getChildByName"]("btn_autonoming");
                            this["refreshFuncBtnShow"](Z, view["DesktopMgr"].Inst["auto_nofulu"]);
                            var S = this["_container_fun"]["getChildByName"]("btn_automoqie");
                            this["refreshFuncBtnShow"](S, view["DesktopMgr"].Inst["auto_moqie"]),
                                this["_container_fun"].x = -528,
                                this["arrow"]["scaleX"] = -1;
                            // 设置状态
                            if (MMP.settings.setAuto.isSetAuto) {
                                setAuto();
                            }
                            // END
                        },
                        i["prototype"]["setDora"] = function (Q, B) {
                            if (0 > Q || Q >= this["doras"]["length"])
                                return console["error"]("setDora pos错误"), void 0;
                            var V = "myres2/mjp/" + (B["touming"] ? GameMgr.Inst["touming_mjp_view"] : GameMgr.Inst["mjp_view"]) + "/ui/";
                            this["doras"][Q].skin = game["Tools"]["localUISrc"](V + B["toString"](!1) + ".png");
                        },
                        i["prototype"]["initRoom"] = function () {
                            var B = this;
                            if (view["DesktopMgr"].Inst.mode == view["EMJMode"].play || view["DesktopMgr"].Inst.mode == view["EMJMode"]["live_broadcast"]) {
                                for (var V = {}, W = 0; W < view["DesktopMgr"].Inst["player_datas"]["length"]; W++) {
                                    for (var Z = view["DesktopMgr"].Inst["player_datas"][W]["character"], S = Z["charid"], v = cfg["item_definition"]["character"].find(S).emo, i = 0; 9 > i; i++) {
                                        var x = v + '/' + i["toString"]() + ".png";
                                        V[x] = 1;
                                    }
                                    if (Z["extra_emoji"])
                                        for (var i = 0; i < Z["extra_emoji"]["length"]; i++) {
                                            var x = v + '/' + Z["extra_emoji"][i]["toString"]() + ".png";
                                            V[x] = 1;
                                        }
                                }
                                var l = [];
                                for (var m in V)
                                    l.push(m);
                                this["block_emo"].me.x = 1903,
                                    this["block_emo"]["reset"](),
                                    game["LoadMgr"]["loadResImage"](l, Laya["Handler"]["create"](this, function () {
                                        B["block_emo"]["initRoom"]();
                                    })),
                                    this["_btn_collect"]["visible"] = !1;
                            } else {
                                for (var s = !1, W = 0; W < view["DesktopMgr"].Inst["player_datas"]["length"]; W++) {
                                    var f = view["DesktopMgr"].Inst["player_datas"][W];
                                    if (f && null != f["account_id"] && f["account_id"] == GameMgr.Inst["account_id"]) {
                                        s = !0;
                                        break;
                                    }
                                }
                                this["_btn_collect"]["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/btn_collect_" + (Q["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? "l.png" : "d.png")),
                                    this["_btn_collect"]["visible"] = s;
                            }
                            if (this["_btn_leave"]["visible"] = !0, this["_btn_fanzhong"]["visible"] = !1, this["_btn_fanzhong"].x = 152, view["DesktopMgr"].Inst.mode == view["EMJMode"].play) {
                                for (var z = 0, W = 0; W < view["DesktopMgr"].Inst["player_datas"]["length"]; W++) {
                                    var f = view["DesktopMgr"].Inst["player_datas"][W];
                                    f && null != f["account_id"] && 0 != f["account_id"] && z++;
                                }
                                1 == view["DesktopMgr"].Inst["game_config"]["category"] ? (this["_btn_leave"]["visible"] = !0, this["_btn_fanzhong"]["visible"] = !1, view["DesktopMgr"].Inst["is_chuanma_mode"]() && (this["_btn_fanzhong"]["visible"] = !0, this["_btn_fanzhong"].x = -92)) : (this["_btn_leave"]["visible"] = !1, this["_btn_fanzhong"]["visible"] = !0);
                            }
                            for (var C = 0, W = 0; W < view["DesktopMgr"].Inst["player_datas"]["length"]; W++) {
                                var f = view["DesktopMgr"].Inst["player_datas"][W];
                                f && null != f["account_id"] && 0 != f["account_id"] && C++;
                            }
                            this["block_emo"].me["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                this["_container_fun"]["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                this["enable"] = !0,
                                this["setLiqibang"](0),
                                this["setBen"](0);
                            var T = this.me["getChildByName"]("container_lefttop");
                            if (view["DesktopMgr"].Inst["is_chuanma_mode"]())
                                T["getChildByName"]("num_lizhi_0")["visible"] = !1, T["getChildByName"]("num_lizhi_1")["visible"] = !1, T["getChildByName"]("num_ben_0")["visible"] = !1, T["getChildByName"]("num_ben_1")["visible"] = !1, T["getChildByName"]("container_doras")["visible"] = !1, T["getChildByName"]("gamemode")["visible"] = !1, T["getChildByName"]("activitymode")["visible"] = !0, T["getChildByName"]("MD5").y = 63, T["getChildByName"]("MD5")["width"] = 239, T["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/left_top1.png"), T["getChildAt"](0)["width"] = 280, T["getChildAt"](0)["height"] = 139, 1 == view["DesktopMgr"].Inst["game_config"]["category"] ? (T["getChildByName"]("activitymode")["getChildAt"](0)["visible"] = !1, T["getChildByName"]("activitymode")["getChildAt"](1)["visible"] = !0) : ('en' == GameMgr["client_language"] && (T["getChildByName"]("activitymode")["getChildAt"](0).x = 2 == view["DesktopMgr"].Inst["game_config"]["category"] ? 77 : 97), T["getChildByName"]("activitymode")["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2 == view["DesktopMgr"].Inst["game_config"]["category"] ? 3393 : 2025), T["getChildByName"]("activitymode")["getChildAt"](0)["visible"] = !0, T["getChildByName"]("activitymode")["getChildAt"](1)["visible"] = !1);
                            else if (T["getChildByName"]("num_lizhi_0")["visible"] = !0, T["getChildByName"]("num_lizhi_1")["visible"] = !1, T["getChildByName"]("num_ben_0")["visible"] = !0, T["getChildByName"]("num_ben_1")["visible"] = !0, T["getChildByName"]("container_doras")["visible"] = !0, T["getChildByName"]("gamemode")["visible"] = !0, T["getChildByName"]("activitymode")["visible"] = !1, T["getChildByName"]("MD5").y = 51, T["getChildByName"]("MD5")["width"] = 276, T["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/left_top.png"), T["getChildAt"](0)["width"] = 313, T["getChildAt"](0)["height"] = 158, view["DesktopMgr"].Inst["game_config"]) {
                                var t = view["DesktopMgr"].Inst["game_config"],
                                    w = game["Tools"]["get_room_desc"](t);
                                this["label_gamemode"].text = w.text,
                                    this["container_gamemode"]["visible"] = !0;
                            } else
                                this["container_gamemode"]["visible"] = !1;
                            if (this["btn_double_pass"]["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play, view["DesktopMgr"].Inst.mode == view["EMJMode"].play)
                                if (this["_network_delay"]["begin_refresh"](), this["_network_delay"].me["visible"] = !0, view["DesktopMgr"].Inst["is_jjc_mode"]()) {
                                    this["container_jjc"]["visible"] = !0,
                                        this["label_jjc_win"].text = Q["UI_Activity_JJC"]["win_count"]["toString"]();
                                    for (var W = 0; 3 > W; W++)
                                        this["container_jjc"]["getChildByName"](W["toString"]()).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/tag_jjc_" + (Q["UI_Activity_JJC"]["lose_count"] > W ? 'd' : 'l') + ".png");
                                } else
                                    this["container_jjc"]["visible"] = !1;
                            else
                                this["_network_delay"].me["visible"] = !1, this["container_jjc"]["visible"] = !1;
                            Q["UI_Replay"].Inst && (Q["UI_Replay"].Inst["pop_collectinput"].me["visible"] = !1);
                            var h = this["_container_fun"]["getChildByName"]("btn_automoqie"),
                                G = this["_container_fun"]["getChildByName"]("btn_automoqie2");
                            view["DesktopMgr"].Inst["is_zhanxing_mode"]() ? (Q["UI_Astrology"].Inst.show(), game["Tools"]["setGrayDisable"](h, !0), game["Tools"]["setGrayDisable"](G, !0)) : (game["Tools"]["setGrayDisable"](h, !1), game["Tools"]["setGrayDisable"](G, !1), Q["UI_Astrology"].Inst.hide());
                        },
                        i["prototype"]["onCloseRoom"] = function () {
                            this["_network_delay"]["close_refresh"]();
                        },
                        i["prototype"]["refreshSeat"] = function (Q) {
                            void 0 === Q && (Q = !1);
                            for (var B = (view["DesktopMgr"].Inst.seat, view["DesktopMgr"].Inst["player_datas"]), V = 0; 4 > V; V++) {
                                var W = view["DesktopMgr"].Inst["localPosition2Seat"](V),
                                    Z = this["_player_infos"][V];
                                if (0 > W)
                                    Z["container"]["visible"] = !1;
                                else {
                                    Z["container"]["visible"] = !0;
                                    var S = view["DesktopMgr"].Inst["getPlayerName"](W);
                                    game["Tools"]["SetNickname"](Z.name, S),
                                        Z.head.id = B[W]["avatar_id"],
                                        Z.head["set_head_frame"](B[W]["account_id"], B[W]["avatar_frame"]);
                                    var v = (cfg["item_definition"].item.get(B[W]["avatar_frame"]), cfg["item_definition"].view.get(B[W]["avatar_frame"]));
                                    if (Z.head.me.y = v && v["sargs"][0] ? Z["head_origin_y"] - Number(v["sargs"][0]) / 100 * this["head_offset_y"] : Z["head_origin_y"], Z["avatar"] = B[W]["avatar_id"], 0 != V) {
                                        var i = B[W]["account_id"] && 0 != B[W]["account_id"] && view["DesktopMgr"].Inst.mode != view["EMJMode"]["paipu"],
                                            x = B[W]["account_id"] && 0 != B[W]["account_id"] && view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                            l = view["DesktopMgr"].Inst.mode != view["EMJMode"].play;
                                        Q ? Z["headbtn"]["onChangeSeat"](i, x, l) : Z["headbtn"]["reset"](i, x, l);
                                    }
                                    Z["title"].id = B[W]["title"] ? game["Tools"]["titleLocalization"](B[W]["account_id"], B[W]["title"]) : 0;
                                }
                            }
                        },
                        i["prototype"]["refreshNames"] = function () {
                            for (var Q = 0; 4 > Q; Q++) {
                                var B = view["DesktopMgr"].Inst["localPosition2Seat"](Q),
                                    V = this["_player_infos"][Q];
                                if (0 > B)
                                    V["container"]["visible"] = !1;
                                else {
                                    V["container"]["visible"] = !0;
                                    var W = view["DesktopMgr"].Inst["getPlayerName"](B);
                                    game["Tools"]["SetNickname"](V.name, W);
                                }
                            }
                        },
                        i["prototype"]["refreshLinks"] = function () {
                            for (var Q = (view["DesktopMgr"].Inst.seat, 0); 4 > Q; Q++) {
                                var B = view["DesktopMgr"].Inst["localPosition2Seat"](Q);
                                view["DesktopMgr"].Inst.mode == view["EMJMode"].play ? this["_player_infos"][Q]["disconnect"]["visible"] = -1 == B || 0 == Q ? !1 : view["DesktopMgr"]["player_link_state"][B] != view["ELink_State"]["READY"] : view["DesktopMgr"].Inst.mode == view["EMJMode"]["live_broadcast"] ? this["_player_infos"][Q]["disconnect"]["visible"] = -1 == B || 0 == view["DesktopMgr"].Inst["player_datas"][B]["account_id"] ? !1 : view["DesktopMgr"]["player_link_state"][B] != view["ELink_State"]["READY"] : view["DesktopMgr"].Inst.mode == view["EMJMode"]["paipu"] && (this["_player_infos"][Q]["disconnect"]["visible"] = !1);
                            }
                        },
                        i["prototype"]["setBen"] = function (Q) {
                            Q > 99 && (Q = 99);
                            var B = this.me["getChildByName"]("container_lefttop"),
                                V = B["getChildByName"]("num_ben_0"),
                                W = B["getChildByName"]("num_ben_1");
                            Q >= 10 ? (V.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](Q / 10)["toString"]() + ".png"), W.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Q % 10)["toString"]() + ".png"), W["visible"] = !0) : (V.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Q % 10)["toString"]() + ".png"), W["visible"] = !1);
                        },
                        i["prototype"]["setLiqibang"] = function (Q, B) {
                            void 0 === B && (B = !0),
                                Q > 999 && (Q = 999);
                            var V = this.me["getChildByName"]("container_lefttop"),
                                W = V["getChildByName"]("num_lizhi_0"),
                                Z = V["getChildByName"]("num_lizhi_1"),
                                S = V["getChildByName"]("num_lizhi_2");
                            Q >= 100 ? (S.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Q % 10)["toString"]() + ".png"), Z.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Math["floor"](Q / 10) % 10)["toString"]() + ".png"), W.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](Q / 100)["toString"]() + ".png"), Z["visible"] = !0, S["visible"] = !0) : Q >= 10 ? (Z.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Q % 10)["toString"]() + ".png"), W.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](Q / 10)["toString"]() + ".png"), Z["visible"] = !0, S["visible"] = !1) : (W.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Q["toString"]() + ".png"), Z["visible"] = !1, S["visible"] = !1),
                                view["DesktopMgr"].Inst["setRevealScore"](Q, B);
                        },
                        i["prototype"]["reset_rounds"] = function () {
                            this["closeCountDown"](),
                                this["showscoredeltaing"] = !1,
                                view["DesktopMgr"].Inst["setScoreDelta"](!1);
                            for (var Q = "myres2/mjp/" + GameMgr.Inst["mjp_view"] + "/ui/", B = 0; B < this["doras"]["length"]; B++)
                                this["doras"][B].skin = view["DesktopMgr"].Inst["is_jiuchao_mode"]() ? game["Tools"]["localUISrc"]("myres/mjdesktop/tou_dora_back.png") : game["Tools"]["localUISrc"](Q + "back.png");
                            for (var B = 0; 4 > B; B++)
                                this["_player_infos"][B].emo["reset"](), this["_player_infos"][B].que["visible"] = !1;
                            this["_timecd"]["reset"](),
                                Laya["timer"]["clearAll"](this),
                                Laya["timer"]["clearAll"](this["label_md5"]),
                                view["DesktopMgr"].Inst["is_chuanma_mode"]() || (this["container_doras"]["visible"] = !0),
                                this["label_md5"]["visible"] = !1;
                        },
                        i["prototype"]["showCountDown"] = function (Q, B) {
                            this["_timecd"]["showCD"](Q, B);
                        },
                        i["prototype"]["setZhenting"] = function (Q) {
                            this["img_zhenting"]["visible"] = Q;
                        },
                        i["prototype"]["shout"] = function (Q, B, V, W) {
                            app.Log.log("shout:" + Q + " type:" + B);
                            try {
                                var Z = this["_player_infos"][Q],
                                    S = Z["container_shout"],
                                    v = S["getChildByName"]("img_content"),
                                    i = S["getChildByName"]("illust")["getChildByName"]("illust"),
                                    x = S["getChildByName"]("img_score");
                                if (0 == W)
                                    x["visible"] = !1;
                                else {
                                    x["visible"] = !0;
                                    var l = 0 > W ? 'm' + Math.abs(W) : W;
                                    x.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/shout_score_" + l + ".png");
                                }
                                '' == B ? v["visible"] = !1 : (v["visible"] = !0, v.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/shout_" + B + ".png")),
                                    view["DesktopMgr"]["is_yuren_type"]() && 100 * Math["random"]() < 20 ? (S["getChildByName"]("illust")["visible"] = !1, S["getChildAt"](2)["visible"] = !0, S["getChildAt"](0)["visible"] = !1, game["LoadMgr"]["setImgSkin"](S["getChildAt"](2), "extendRes/charactor/yurenjie/xg" + Math["floor"](3 * Math["random"]()) + ".png")) : (S["getChildByName"]("illust")["visible"] = !0, S["getChildAt"](2)["visible"] = !1, S["getChildAt"](0)["visible"] = !0, i["scaleX"] = 1, game["Tools"]["charaPart"](V["avatar_id"], i, "half", Z["illustrect"], !0, !0));
                                var m = 0,
                                    s = 0;
                                switch (Q) {
                                    case 0:
                                        m = -105,
                                            s = 0;
                                        break;
                                    case 1:
                                        m = 500,
                                            s = 0;
                                        break;
                                    case 2:
                                        m = 0,
                                            s = -300;
                                        break;
                                    default:
                                        m = -500,
                                            s = 0;
                                }
                                S["visible"] = !0,
                                    S["alpha"] = 0,
                                    S.x = Z["shout_origin_x"] + m,
                                    S.y = Z["shout_origin_y"] + s,
                                    Laya["Tween"].to(S, {
                                        alpha: 1,
                                        x: Z["shout_origin_x"],
                                        y: Z["shout_origin_y"]
                                    }, 70),
                                    Laya["Tween"].to(S, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya["timer"].once(800, this, function () {
                                        Laya["loader"]["clearTextureRes"](i.skin),
                                            S["visible"] = !1;
                                    });
                            } catch (f) {
                                var z = {};
                                z["error"] = f["message"],
                                    z["stack"] = f["stack"],
                                    z["method"] = "shout",
                                    z["class"] = "UI_DesktopInfos",
                                    GameMgr.Inst["onFatalError"](z);
                            }
                        },
                        i["prototype"]["closeCountDown"] = function () {
                            this["_timecd"]["close"]();
                        },
                        i["prototype"]["refreshFuncBtnShow"] = function (Q, B) {
                            var V = Q["getChildByName"]("img_choosed");
                            Q["getChildByName"]("out")["color"] = Q["mouseEnabled"] ? B ? "#3bd647" : "#7992b3" : "#565656",
                                V["visible"] = B;
                        },
                        i["prototype"]["onShowEmo"] = function (Q, B) {
                            var V = this["_player_infos"][Q];
                            0 != Q && V["headbtn"]["emj_banned"] || V.emo.show(Q, B);
                        },
                        i["prototype"]["changeHeadEmo"] = function (Q) {
                            {
                                var B = view["DesktopMgr"].Inst["seat2LocalPosition"](Q);
                                this["_player_infos"][B];
                            }
                        },
                        i["prototype"]["onBtnShowScoreDelta"] = function () {
                            var Q = this;
                            this["showscoredeltaing"] || (this["showscoredeltaing"] = !0, view["DesktopMgr"].Inst["setScoreDelta"](!0), Laya["timer"].once(5000, this, function () {
                                Q["showscoredeltaing"] = !1,
                                    view["DesktopMgr"].Inst["setScoreDelta"](!1);
                            }));
                        },
                        i["prototype"]["btn_seeinfo"] = function (B) {
                            if (view["DesktopMgr"].Inst.mode != view["EMJMode"]["paipu"] && view["DesktopMgr"].Inst["gameing"]) {
                                var V = view["DesktopMgr"].Inst["player_datas"][view["DesktopMgr"].Inst["localPosition2Seat"](B)]["account_id"];
                                if (V) {
                                    var W = 1 == view["DesktopMgr"].Inst["game_config"]["category"],
                                        Z = 1,
                                        S = view["DesktopMgr"].Inst["game_config"].meta;
                                    S && S["mode_id"] == game["EMatchMode"]["shilian"] && (Z = 4),
                                        Q["UI_OtherPlayerInfo"].Inst.show(V, view["DesktopMgr"].Inst["game_config"].mode.mode < 10 ? 1 : 2, W ? 1 : 2, Z);
                                }
                            }
                        },
                        i["prototype"]["openDora3BeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_dora3_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openPeipaiOpenBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_peipai_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openDora3BeginShine"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_shine"), "scene/effect_dora3_shine.lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](244),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openMuyuOpenBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_muyu_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openShilianOpenBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_shilian_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openXiuluoOpenBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_xiuluo_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openChuanmaBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_chiyu_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openJiuChaoBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_mingjing_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openAnPaiBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_anye_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openTopMatchOpenBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_dianfengduiju_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["openZhanxingBeginEffect"] = function () {
                            var Q = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_zhanxing_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, Q, function () {
                                    Q["destory"]();
                                });
                        },
                        i["prototype"]["logUpEmoInfo"] = function () {
                            this["block_emo"]["sendEmoLogUp"]();
                        },
                        i["prototype"]["onCollectChange"] = function () {
                            this["_btn_collect"]["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/btn_collect_" + (Q["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? "l.png" : "d.png"));
                        },
                        i["prototype"]["showAIEmo"] = function () {
                            for (var Q = this, B = function (B) {
                                var W = view["DesktopMgr"].Inst["player_datas"][B];
                                W["account_id"] && 0 != W["account_id"] || Math["random"]() < 0.3 && Laya["timer"].once(500 + 1000 * Math["random"](), V, function () {
                                    Q["onShowEmo"](view["DesktopMgr"].Inst["seat2LocalPosition"](B), Math["floor"](9 * Math["random"]()));
                                });
                            }, V = this, W = 0; W < view["DesktopMgr"].Inst["player_datas"]["length"]; W++)
                                B(W);
                        },
                        i["prototype"]["setGapType"] = function (Q, B) {
                            void 0 === B && (B = !1);
                            for (var V = 0; V < Q["length"]; V++) {
                                var W = view["DesktopMgr"].Inst["seat2LocalPosition"](V);
                                this["_player_infos"][W].que["visible"] = !0,
                                    B && (0 == V ? (this["_player_infos"][W].que.pos(this["gapStartPosLst"][V].x + this["selfGapOffsetX"][Q[V]], this["gapStartPosLst"][V].y), this["_player_infos"][W].que["scale"](1, 1), Laya["Tween"].to(this["_player_infos"][W].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this["_player_infos"][W]["que_target_pos"].x,
                                        y: this["_player_infos"][W]["que_target_pos"].y
                                    }, 200)) : (this["_player_infos"][W].que.pos(this["gapStartPosLst"][V].x, this["gapStartPosLst"][V].y), this["_player_infos"][W].que["scale"](1, 1), Laya["Tween"].to(this["_player_infos"][W].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this["_player_infos"][W]["que_target_pos"].x,
                                        y: this["_player_infos"][W]["que_target_pos"].y
                                    }, 200))),
                                    this["_player_infos"][W].que.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/dingque_" + Q[V] + ".png");
                            }
                        },
                        i["prototype"]["OnNewCard"] = function (Q, B) {
                            if (B) {
                                var V = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_xianjing_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                                view["AudioMgr"]["PlayAudio"](243),
                                    Laya["timer"].once(5000, V, function () {
                                        V["destory"]();
                                    }),
                                    Laya["timer"].once(1300, this, function () {
                                        this["ShowSpellCard"](view["DesktopMgr"].Inst["field_spell"], !0);
                                    });
                            } else
                                this["ShowSpellCard"](view["DesktopMgr"].Inst["field_spell"], !1);
                        },
                        i["prototype"]["ShowSpellCard"] = function (B, V) {
                            void 0 === V && (V = !1),
                                Q["UI_FieldSpell"].Inst && !Q["UI_FieldSpell"].Inst["enable"] && Q["UI_FieldSpell"].Inst.show(B, V);
                        },
                        i["prototype"]["HideSpellCard"] = function () {
                            Q["UI_FieldSpell"].Inst && Q["UI_FieldSpell"].Inst["close"]();
                        },
                        i.Inst = null,
                        i;
                }
                    (Q["UIBase"]);
            Q["UI_DesktopInfo"] = v;
        }
            (uiscript || (uiscript = {}));

        // 设置名称
        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            var B = uiscript.UI_Info;
            // END
            this["read_list"] = [],
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAnnouncement", {
                    lang: GameMgr["client_language"],
                    platform: GameMgr["inDmm"] ? "web_dmm" : "web"
                }, function (V, W) {
                    V || W["error"] ? Q["UIMgr"].Inst["showNetReqError"]("fetchAnnouncement", V, W) : B["_refreshAnnouncements"](W);
                    if ((V || W['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnnouncementUpdate", Laya["Handler"]["create"](this, function (Q) {
                    for (var V = GameMgr["inDmm"] ? "web_dmm" : "web", W = 0, Z = Q["update_list"]; W < Z["length"]; W++) {
                        var S = Z[W];
                        if (S.lang == GameMgr["client_language"] && S["platform"] == V) {
                            B["have_new_notice"] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }

        uiscript.UI_Info._refreshAnnouncements = function (Q) {
            Q.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id':777777, 'title': '[雀魂mod_plus]\n更新日志' })
            if (Q["announcements"] && (this["announcements"] = Q["announcements"]), Q.sort && (this["announcement_sort"] = Q.sort), Q["read_list"]) {
                this["read_list"] = [666666,777777];
                for (var B = 0; B < Q["read_list"]["length"]; B++)
                    this["read_list"].push(Q["read_list"][B]);
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
            content: '如果你需要使用mahjong-helper，应安装<a href=\'https://github.com/Avenshy/mahjong-helper-majsoul\' target="_blank">mahjong-helper-majsoul</a>脚本，并且打开该选项。如果不打开该选项会导致自风错误。',
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
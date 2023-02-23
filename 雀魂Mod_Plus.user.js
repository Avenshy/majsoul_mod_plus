// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.210
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
        !function (S) {
            var P;
            !function (S) {
                S[S.none = 0] = "none",
                    S[S["daoju"] = 1] = "daoju",
                    S[S.gift = 2] = "gift",
                    S[S["fudai"] = 3] = "fudai",
                    S[S.view = 5] = "view";
            }
                (P = S["EItemCategory"] || (S["EItemCategory"] = {}));
            var m = function (m) {
                function B() {
                    var S = m.call(this, new ui["lobby"]["bagUI"]()) || this;
                    return S["container_top"] = null,
                        S["container_content"] = null,
                        S["locking"] = !1,
                        S.tabs = [],
                        S["page_item"] = null,
                        S["page_gift"] = null,
                        S["page_skin"] = null,
                        S["page_cg"] = null,
                        S["select_index"] = 0,
                        B.Inst = S,
                        S;
                }
                return __extends(B, m),
                    B.init = function () {
                        var S = this;
                        app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function (P) {
                            var m = P["update"];
                            m && m.bag && (S["update_data"](m.bag["update_items"]), S["update_daily_gain_data"](m.bag));
                        }, null, !1)),
                            this["fetch"]();
                    },
                    B["fetch"] = function () {
                        var P = this;
                        this["_item_map"] = {},
                            this["_daily_gain_record"] = {},
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchBagInfo", {}, function (m, B) {
                                if (m || B["error"])
                                    S["UIMgr"].Inst["showNetReqError"]("fetchBagInfo", m, B);
                                else {
                                    app.Log.log("背包信息：" + JSON["stringify"](B));
                                    var J = B.bag;
                                    if (J) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of J["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            P._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    P._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (J["items"])
                                                for (var L = 0; L < J["items"]["length"]; L++) {
                                                    var w = J["items"][L]["item_id"],
                                                        h = J["items"][L]["stack"],
                                                        s = cfg["item_definition"].item.get(w);
                                                    s && (P["_item_map"][w] = {
                                                        item_id: w,
                                                        count: h,
                                                        category: s["category"]
                                                    }, 1 == s["category"] && 3 == s.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                                        item_id: w
                                                    }, function () { }));
                                                }
                                            if (J["daily_gain_record"])
                                                for (var R = J["daily_gain_record"], L = 0; L < R["length"]; L++) {
                                                    var v = R[L]["limit_source_id"];
                                                    P["_daily_gain_record"][v] = {};
                                                    var f = R[L]["record_time"];
                                                    P["_daily_gain_record"][v]["record_time"] = f;
                                                    var A = R[L]["records"];
                                                    if (A)
                                                        for (var u = 0; u < A["length"]; u++)
                                                            P["_daily_gain_record"][v][A[u]["item_id"]] = A[u]["count"];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    B["find_item"] = function (S) {
                        var P = this["_item_map"][S];
                        return P ? {
                            item_id: P["item_id"],
                            category: P["category"],
                            count: P["count"]
                        }
                            : null;
                    },
                    B["get_item_count"] = function (S) {
                        var P = this["find_item"](S);
                        if (P)
                            return P["count"];
                        if ("100001" == S) {
                            for (var m = 0, B = 0, J = GameMgr.Inst["free_diamonds"]; B < J["length"]; B++) {
                                var L = J[B];
                                GameMgr.Inst["account_numerical_resource"][L] && (m += GameMgr.Inst["account_numerical_resource"][L]);
                            }
                            for (var w = 0, h = GameMgr.Inst["paid_diamonds"]; w < h["length"]; w++) {
                                var L = h[w];
                                GameMgr.Inst["account_numerical_resource"][L] && (m += GameMgr.Inst["account_numerical_resource"][L]);
                            }
                            return m;
                        }
                        if ("100004" == S) {
                            for (var s = 0, R = 0, v = GameMgr.Inst["free_pifuquans"]; R < v["length"]; R++) {
                                var L = v[R];
                                GameMgr.Inst["account_numerical_resource"][L] && (s += GameMgr.Inst["account_numerical_resource"][L]);
                            }
                            for (var f = 0, A = GameMgr.Inst["paid_pifuquans"]; f < A["length"]; f++) {
                                var L = A[f];
                                GameMgr.Inst["account_numerical_resource"][L] && (s += GameMgr.Inst["account_numerical_resource"][L]);
                            }
                            return s;
                        }
                        return "100002" == S ? GameMgr.Inst["account_data"].gold : 0;
                    },
                    B["find_items_by_category"] = function (S) {
                        var P = [];
                        for (var m in this["_item_map"])
                            this["_item_map"][m]["category"] == S && P.push({
                                item_id: this["_item_map"][m]["item_id"],
                                category: this["_item_map"][m]["category"],
                                count: this["_item_map"][m]["count"]
                            });
                        return P;
                    },
                    B["update_data"] = function (P) {
                        for (var m = 0; m < P["length"]; m++) {
                            var B = P[m]["item_id"],
                                J = P[m]["stack"];
                            if (J > 0) {
                                this["_item_map"]["hasOwnProperty"](B["toString"]()) ? this["_item_map"][B]["count"] = J : this["_item_map"][B] = {
                                    item_id: B,
                                    count: J,
                                    category: cfg["item_definition"].item.get(B)["category"]
                                };
                                var L = cfg["item_definition"].item.get(B);
                                1 == L["category"] && 3 == L.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                    item_id: B
                                }, function () { }),
                                    5 == L["category"] && (this["new_bag_item_ids"].push(B), this["new_zhuangban_item_ids"][B] = 1),
                                    8 != L["category"] || L["item_expire"] || this["new_cg_ids"].push(B);
                            } else if (this["_item_map"]["hasOwnProperty"](B["toString"]())) {
                                var w = cfg["item_definition"].item.get(B);
                                w && 5 == w["category"] && S["UI_Sushe"]["on_view_remove"](B),
                                    this["_item_map"][B] = 0,
                                    delete this["_item_map"][B];
                            }
                        }
                        this.Inst && this.Inst["when_data_change"]();
                        for (var m = 0; m < P["length"]; m++) {
                            var B = P[m]["item_id"];
                            if (this["_item_listener"]["hasOwnProperty"](B["toString"]()))
                                for (var h = this["_item_listener"][B], s = 0; s < h["length"]; s++)
                                    h[s].run();
                        }
                        for (var m = 0; m < this["_all_item_listener"]["length"]; m++)
                            this["_all_item_listener"][m].run();
                    },
                    B["update_daily_gain_data"] = function (S) {
                        var P = S["update_daily_gain_record"];
                        if (P)
                            for (var m = 0; m < P["length"]; m++) {
                                var B = P[m]["limit_source_id"];
                                this["_daily_gain_record"][B] || (this["_daily_gain_record"][B] = {});
                                var J = P[m]["record_time"];
                                this["_daily_gain_record"][B]["record_time"] = J;
                                var L = P[m]["records"];
                                if (L)
                                    for (var w = 0; w < L["length"]; w++)
                                        this["_daily_gain_record"][B][L[w]["item_id"]] = L[w]["count"];
                            }
                    },
                    B["get_item_daily_record"] = function (S, P) {
                        return this["_daily_gain_record"][S] ? this["_daily_gain_record"][S]["record_time"] ? game["Tools"]["isPassedRefreshTimeServer"](this["_daily_gain_record"][S]["record_time"]) ? this["_daily_gain_record"][S][P] ? this["_daily_gain_record"][S][P] : 0 : 0 : 0 : 0;
                    },
                    B["add_item_listener"] = function (S, P) {
                        this["_item_listener"]["hasOwnProperty"](S["toString"]()) || (this["_item_listener"][S] = []),
                            this["_item_listener"][S].push(P);
                    },
                    B["remove_item_listener"] = function (S, P) {
                        var m = this["_item_listener"][S];
                        if (m)
                            for (var B = 0; B < m["length"]; B++)
                                if (m[B] === P) {
                                    m[B] = m[m["length"] - 1],
                                        m.pop();
                                    break;
                                }
                    },
                    B["add_all_item_listener"] = function (S) {
                        this["_all_item_listener"].push(S);
                    },
                    B["remove_all_item_listener"] = function (S) {
                        for (var P = this["_all_item_listener"], m = 0; m < P["length"]; m++)
                            if (P[m] === S) {
                                P[m] = P[P["length"] - 1],
                                    P.pop();
                                break;
                            }
                    },
                    B["removeAllBagNew"] = function () {
                        this["new_bag_item_ids"] = [];
                    },
                    B["removeAllCGNew"] = function () {
                        this["new_cg_ids"] = [];
                    },
                    B["removeZhuangBanNew"] = function (S) {
                        for (var P = 0, m = S; P < m["length"]; P++) {
                            var B = m[P];
                            delete this["new_zhuangban_item_ids"][B];
                        }
                    },
                    B["prototype"]["have_red_point"] = function () {
                        return this["page_cg"]["have_redpoint"]();
                    },
                    B["prototype"]["onCreate"] = function () {
                        var P = this;
                        this["container_top"] = this.me["getChildByName"]("top"),
                            this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || P.hide(Laya["Handler"]["create"](P, function () {
                                    return P["closeHandler"] ? (P["closeHandler"].run(), P["closeHandler"] = null, void 0) : (S["UI_Lobby"].Inst["enable"] = !0, void 0);
                                }));
                            }, null, !1),
                            this["container_content"] = this.me["getChildByName"]("content");
                        for (var m = function (S) {
                            B.tabs.push(B["container_content"]["getChildByName"]("tabs")["getChildByName"]("btn" + S)),
                                B.tabs[S]["clickHandler"] = Laya["Handler"]["create"](B, function () {
                                    P["select_index"] != S && P["on_change_tab"](S);
                                }, null, !1);
                        }, B = this, J = 0; 5 > J; J++)
                            m(J);
                        this["page_item"] = new S["UI_Bag_PageItem"](this["container_content"]["getChildByName"]("page_items")),
                            this["page_gift"] = new S["UI_Bag_PageGift"](this["container_content"]["getChildByName"]("page_gift")),
                            this["page_skin"] = new S["UI_Bag_PageSkin"](this["container_content"]["getChildByName"]("page_skin")),
                            this["page_cg"] = new S["UI_Bag_PageCG"](this["container_content"]["getChildByName"]("page_cg"));
                    },
                    B["prototype"].show = function (P, m) {
                        var B = this;
                        void 0 === P && (P = 0),
                            void 0 === m && (m = null),
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this["closeHandler"] = m,
                            S["UIBase"]["anim_alpha_in"](this["container_top"], {
                                y: -30
                            }, 200),
                            S["UIBase"]["anim_alpha_in"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                B["locking"] = !1;
                            }),
                            this["on_change_tab"](P),
                            this["refreshRedpoint"](),
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                            3 != P && this["page_skin"]["when_update_data"]();
                    },
                    B["prototype"].hide = function (P) {
                        var m = this;
                        this["locking"] = !0,
                            S["UIBase"]["anim_alpha_out"](this["container_top"], {
                                y: -30
                            }, 200),
                            S["UIBase"]["anim_alpha_out"](this["container_content"], {
                                y: 30
                            }, 200),
                            Laya["timer"].once(300, this, function () {
                                m["locking"] = !1,
                                    m["enable"] = !1,
                                    P && P.run();
                            });
                    },
                    B["prototype"]["onDisable"] = function () {
                        this["page_skin"]["close"](),
                            this["page_item"]["close"](),
                            this["page_gift"]["close"](),
                            this["page_cg"]["close"]();
                    },
                    B["prototype"]["on_change_tab"] = function (S) {
                        this["select_index"] = S;
                        for (var m = 0; m < this.tabs["length"]; m++)
                            this.tabs[m].skin = game["Tools"]["localUISrc"](S == m ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[m]["getChildAt"](0)["color"] = S == m ? "#d9b263" : "#8cb65f";
                        switch (this["page_item"]["close"](), this["page_gift"]["close"](), this["page_skin"].me["visible"] = !1, this["page_cg"]["close"](), S) {
                            case 0:
                                this["page_item"].show(P["daoju"]);
                                break;
                            case 1:
                                this["page_gift"].show();
                                break;
                            case 2:
                                this["page_item"].show(P.view);
                                break;
                            case 3:
                                this["page_skin"].show();
                                break;
                            case 4:
                                this["page_cg"].show();
                        }
                    },
                    B["prototype"]["when_data_change"] = function () {
                        this["page_item"].me["visible"] && this["page_item"]["when_update_data"](),
                            this["page_gift"].me["visible"] && this["page_gift"]["when_update_data"]();
                    },
                    B["prototype"]["on_skin_change"] = function () {
                        this["page_skin"]["when_update_data"]();
                    },
                    B["prototype"]["on_cg_change"] = function () {
                        this["page_cg"]["when_update_data"]();
                    },
                    B["prototype"]["refreshRedpoint"] = function () {
                        this.tabs[4]["getChildByName"]("redpoint")["visible"] = this["page_cg"]["have_redpoint"]();
                    },
                    B["_item_map"] = {},
                    B["_item_listener"] = {},
                    B["_all_item_listener"] = [],
                    B["_daily_gain_record"] = {},
                    B["new_bag_item_ids"] = [],
                    B["new_zhuangban_item_ids"] = {},
                    B["new_cg_ids"] = [],
                    B.Inst = null,
                    B;
            }
                (S["UIBase"]);
            S["UI_Bag"] = m;
        }
            (uiscript || (uiscript = {}));


        // 修改牌桌上角色
        !function (S) {
            var P = function () {
                function P() {
                    var P = this;
                    this.urls = [],
                        this["link_index"] = -1,
                        this["connect_state"] = S["EConnectState"].none,
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
                        app["NetAgent"]["AddListener2MJ"]("NotifyPlayerLoadGameReady", Laya["Handler"]["create"](this, function (S) {
                            if (MMP.settings.sendGame == true) {
                                (GM_xmlhttpRequest({
                                    method: 'post',
                                    url: MMP.settings.sendGameURL,
                                    data: JSON.stringify(S),
                                    onload: function (msg) {
                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(S));
                                    }
                                }));
                            }
                            app.Log.log("NotifyPlayerLoadGameReady: " + JSON["stringify"](S)),
                                P["loaded_player_count"] = S["ready_id_list"]["length"],
                                P["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](P["loaded_player_count"], P["real_player_count"]);
                        }));
                }
                return Object["defineProperty"](P, "Inst", {
                    get: function () {
                        return null == this["_Inst"] ? this["_Inst"] = new P() : this["_Inst"];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    P["prototype"]["OpenConnect"] = function (P, m, B, J) {
                        var L = this;
                        uiscript["UI_Loading"].Inst.show("enter_mj"),
                            S["Scene_Lobby"].Inst && S["Scene_Lobby"].Inst["active"] && (S["Scene_Lobby"].Inst["active"] = !1),
                            S["Scene_Huiye"].Inst && S["Scene_Huiye"].Inst["active"] && (S["Scene_Huiye"].Inst["active"] = !1),
                            this["Close"](),
                            view["BgmListMgr"]["stopBgm"](),
                            this["is_ob"] = !1,
                            Laya["timer"].once(500, this, function () {
                                L.url = '',
                                    L["token"] = P,
                                    L["game_uuid"] = m,
                                    L["server_location"] = B,
                                    GameMgr.Inst["ingame"] = !0,
                                    GameMgr.Inst["mj_server_location"] = B,
                                    GameMgr.Inst["mj_game_token"] = P,
                                    GameMgr.Inst["mj_game_uuid"] = m,
                                    L["playerreconnect"] = J,
                                    L["_setState"](S["EConnectState"]["tryconnect"]),
                                    L["load_over"] = !1,
                                    L["loaded_player_count"] = 0,
                                    L["real_player_count"] = 0,
                                    L["lb_index"] = 0,
                                    L["_fetch_gateway"](0);
                            }),
                            Laya["timer"].loop(300000, this, this["reportInfo"]);
                    },
                    P["prototype"]["reportInfo"] = function () {
                        this["connect_state"] == S["EConnectState"]["connecting"] && GameMgr.Inst["postNewInfo2Server"]("network_route", {
                            client_type: "web",
                            route_type: "game",
                            route_index: S["LobbyNetMgr"]["root_id_lst"][S["LobbyNetMgr"].Inst["choosed_index"]],
                            route_delay: Math.min(10000, Math["round"](app["NetAgent"]["mj_network_delay"])),
                            connection_time: Math["round"](Date.now() - this["_connect_start_time"]),
                            reconnect_count: this["_report_reconnect_count"]
                        });
                    },
                    P["prototype"]["Close"] = function () {
                        this["load_over"] = !1,
                            app.Log.log("MJNetMgr close"),
                            this["_setState"](S["EConnectState"].none),
                            app["NetAgent"]["Close2MJ"](),
                            this.url = '',
                            Laya["timer"]["clear"](this, this["reportInfo"]);
                    },
                    P["prototype"]["_OnConnent"] = function (P) {
                        app.Log.log("MJNetMgr _OnConnent event:" + P),
                            P == Laya["Event"]["CLOSE"] || P == Laya["Event"]["ERROR"] ? Laya["timer"]["currTimer"] - this["lasterrortime"] > 100 && (this["lasterrortime"] = Laya["timer"]["currTimer"], this["connect_state"] == S["EConnectState"]["tryconnect"] ? this["_try_to_linknext"]() : this["connect_state"] == S["EConnectState"]["connecting"] ? view["DesktopMgr"].Inst["active"] ? (view["DesktopMgr"].Inst["duringReconnect"] = !0, this["_setState"](S["EConnectState"]["reconnecting"]), this["reconnect_count"] = 0, this["_Reconnect"]()) : (this["_setState"](S["EConnectState"]["disconnect"]), uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2008)), S["Scene_MJ"].Inst["ForceOut"]()) : this["connect_state"] == S["EConnectState"]["reconnecting"] && this["_Reconnect"]()) : P == Laya["Event"].OPEN && (this["_connect_start_time"] = Date.now(), (this["connect_state"] == S["EConnectState"]["tryconnect"] || this["connect_state"] == S["EConnectState"]["reconnecting"]) && ((this["connect_state"] = S["EConnectState"]["tryconnect"]) ? this["_report_reconnect_count"] = 0 : this["_report_reconnect_count"]++, this["_setState"](S["EConnectState"]["connecting"]), this["is_ob"] ? this["_ConnectSuccessOb"]() : this["_ConnectSuccess"]()));
                    },
                    P["prototype"]["_Reconnect"] = function () {
                        var P = this;
                        S["LobbyNetMgr"].Inst["connect_state"] == S["EConnectState"].none || S["LobbyNetMgr"].Inst["connect_state"] == S["EConnectState"]["disconnect"] ? this["_setState"](S["EConnectState"]["disconnect"]) : S["LobbyNetMgr"].Inst["connect_state"] == S["EConnectState"]["connecting"] && GameMgr.Inst["logined"] ? this["reconnect_count"] >= this["reconnect_span"]["length"] ? this["_setState"](S["EConnectState"]["disconnect"]) : (Laya["timer"].once(this["reconnect_span"][this["reconnect_count"]], this, function () {
                            P["connect_state"] == S["EConnectState"]["reconnecting"] && (app.Log.log("MJNetMgr reconnect count:" + P["reconnect_count"]), app["NetAgent"]["connect2MJ"](P.url, Laya["Handler"]["create"](P, P["_OnConnent"], null, !1), "local" == P["server_location"] ? "/game-gateway" : "/game-gateway-zone"));
                        }), this["reconnect_count"]++) : Laya["timer"].once(1000, this, this["_Reconnect"]);
                    },
                    P["prototype"]["_try_to_linknext"] = function () {
                        this["link_index"]++,
                            this.url = '',
                            app.Log.log("mj _try_to_linknext(" + this["link_index"] + ") url.length=" + this.urls["length"]),
                            this["link_index"] < 0 || this["link_index"] >= this.urls["length"] ? S["LobbyNetMgr"].Inst["polling_connect"] ? (this["lb_index"]++, this["_fetch_gateway"](0)) : (this["_setState"](S["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && S["Scene_MJ"].Inst["ForceOut"]()) : (app["NetAgent"]["connect2MJ"](this.urls[this["link_index"]].url, Laya["Handler"]["create"](this, this["_OnConnent"], null, !1), "local" == this["server_location"] ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this["link_index"]].url);
                    },
                    P["prototype"]["GetAuthData"] = function () {
                        return {
                            account_id: GameMgr.Inst["account_id"],
                            token: this["token"],
                            game_uuid: this["game_uuid"],
                            gift: CryptoJS["HmacSHA256"](this["token"] + GameMgr.Inst["account_id"] + this["game_uuid"], "damajiang")["toString"]()
                        };
                    },
                    P["prototype"]["_fetch_gateway"] = function (P) {
                        var m = this;
                        if (S["LobbyNetMgr"].Inst["polling_connect"] && this["lb_index"] >= S["LobbyNetMgr"].Inst.urls["length"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && S["Scene_MJ"].Inst["ForceOut"](), this["_setState"](S["EConnectState"].none), void 0;
                        this.urls = [],
                            this["link_index"] = -1,
                            app.Log.log("mj _fetch_gateway retry_count:" + P);
                        var B = function (B) {
                            var J = JSON["parse"](B);
                            if (app.Log.log("mj _fetch_gateway func_success data = " + B), J["maintenance"])
                                m["_setState"](S["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2009)), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && S["Scene_MJ"].Inst["ForceOut"]();
                            else if (J["servers"] && J["servers"]["length"] > 0) {
                                for (var L = J["servers"], w = S["Tools"]["deal_gateway"](L), h = 0; h < w["length"]; h++)
                                    m.urls.push({
                                        name: "___" + h,
                                        url: w[h]
                                    });
                                m["link_index"] = -1,
                                    m["_try_to_linknext"]();
                            } else
                                1 > P ? Laya["timer"].once(1000, m, function () {
                                    m["_fetch_gateway"](P + 1);
                                }) : S["LobbyNetMgr"].Inst["polling_connect"] ? (m["lb_index"]++, m["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](60)), m["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && S["Scene_MJ"].Inst["ForceOut"](), m["_setState"](S["EConnectState"].none));
                        },
                            J = function () {
                                app.Log.log("mj _fetch_gateway func_error"),
                                    1 > P ? Laya["timer"].once(500, m, function () {
                                        m["_fetch_gateway"](P + 1);
                                    }) : S["LobbyNetMgr"].Inst["polling_connect"] ? (m["lb_index"]++, m["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](58)), m["_SendDebugInfo"](), view["DesktopMgr"].Inst["active"] || S["Scene_MJ"].Inst["ForceOut"](), m["_setState"](S["EConnectState"].none));
                            },
                            L = function (S) {
                                var P = new Laya["HttpRequest"]();
                                P.once(Laya["Event"]["COMPLETE"], m, function (S) {
                                    B(S);
                                }),
                                    P.once(Laya["Event"]["ERROR"], m, function () {
                                        J();
                                    });
                                var L = [];
                                L.push("If-Modified-Since"),
                                    L.push('0'),
                                    S += "?service=ws-game-gateway",
                                    S += GameMgr["inHttps"] ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                    S += "&location=" + m["server_location"],
                                    S += "&rv=" + Math["floor"](10000000 * Math["random"]()) + Math["floor"](10000000 * Math["random"]()),
                                    P.send(S, '', "get", "text", L),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + S);
                            };
                        S["LobbyNetMgr"].Inst["polling_connect"] ? L(S["LobbyNetMgr"].Inst.urls[this["lb_index"]]) : L(S["LobbyNetMgr"].Inst["lb_url"]);
                    },
                    P["prototype"]["_setState"] = function (P) {
                        this["connect_state"] = P,
                            GameMgr["inRelease"] || null != uiscript["UI_Common"].Inst && (P == S["EConnectState"].none ? uiscript["UI_Common"].Inst["label_net_mj"].text = '' : P == S["EConnectState"]["tryconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "尝试连接麻将服务器", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#000000") : P == S["EConnectState"]["connecting"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正常", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#00ff00") : P == S["EConnectState"]["disconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：断开连接", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()) : P == S["EConnectState"]["reconnecting"] && (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正在重连", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()));
                    },
                    P["prototype"]["_ConnectSuccess"] = function () {
                        var P = this;
                        app.Log.log("MJNetMgr _ConnectSuccess "),
                            this["load_over"] = !1,
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authGame", this["GetAuthData"](), function (m, B) {
                                if (m || B["error"])
                                    uiscript["UIMgr"].Inst["showNetReqError"]("authGame", m, B), S["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                else {
                                    app.Log.log("麻将桌验证通过：" + JSON["stringify"](B)),
                                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        B['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    // 增加对mahjong-helper的兼容
                                    // 发送游戏对局
                                    if (MMP.settings.sendGame == true) {
                                        GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(B),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(B));
                                            }
                                        });
                                    }
                                    //END
                                    var J = [],
                                        L = 0;
                                    view["DesktopMgr"]["player_link_state"] = B["state_list"];
                                    var w = S["Tools"]["strOfLocalization"](2003),
                                        h = B["game_config"].mode,
                                        s = view["ERuleMode"]["Liqi4"];
                                    h.mode < 10 ? (s = view["ERuleMode"]["Liqi4"], P["real_player_count"] = 4) : h.mode < 20 && (s = view["ERuleMode"]["Liqi3"], P["real_player_count"] = 3);
                                    for (var R = 0; R < P["real_player_count"]; R++)
                                        J.push(null);
                                    h["extendinfo"] && (w = S["Tools"]["strOfLocalization"](2004)),
                                        h["detail_rule"] && h["detail_rule"]["ai_level"] && (1 === h["detail_rule"]["ai_level"] && (w = S["Tools"]["strOfLocalization"](2003)), 2 === h["detail_rule"]["ai_level"] && (w = S["Tools"]["strOfLocalization"](2004)));
                                    for (var v = S["GameUtility"]["get_default_ai_skin"](), f = S["GameUtility"]["get_default_ai_character"](), R = 0; R < B["seat_list"]["length"]; R++) {
                                        var A = B["seat_list"][R];
                                        if (0 == A) {
                                            J[R] = {
                                                nickname: w,
                                                avatar_id: v,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: f,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: v,
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
                                                    J[R].avatar_id = skin.id;
                                                    J[R].character.charid = skin.character_id;
                                                    J[R].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                J[R].nickname = '[BOT]' + J[R].nickname;
                                            }
                                        } else {
                                            L++;
                                            for (var u = 0; u < B["players"]["length"]; u++)
                                                if (B["players"][u]["account_id"] == A) {
                                                    J[R] = B["players"][u];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (J[R].account_id == GameMgr.Inst.account_id) {
                                                        J[R].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        J[R].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        // 解决进游戏后没有装扮的问题
                                                        uiscript.UI_Sushe.randomDesktopID();
                                                        GameMgr.Inst["load_mjp_view"]();
                                                        GameMgr.Inst["load_touming_mjp_view"]();
                                                        // END
                                                        J[R].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        J[R].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        J[R].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            J[R].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (J[R].avatar_id == 400101 || J[R].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            J[R].avatar_id = skin.id;
                                                            J[R].character.charid = skin.character_id;
                                                            J[R].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(J[R].account_id);
                                                        if (server == 1) {
                                                            J[R].nickname = '[CN]' + J[R].nickname;
                                                        } else if (server == 2) {
                                                            J[R].nickname = '[JP]' + J[R].nickname;
                                                        } else if (server == 3) {
                                                            J[R].nickname = '[EN]' + J[R].nickname;
                                                        } else {
                                                            J[R].nickname = '[??]' + J[R].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var R = 0; R < P["real_player_count"]; R++)
                                        null == J[R] && (J[R] = {
                                            account: 0,
                                            nickname: S["Tools"]["strOfLocalization"](2010),
                                            avatar_id: v,
                                            level: {
                                                id: "10101"
                                            },
                                            level3: {
                                                id: "20101"
                                            },
                                            character: {
                                                charid: f,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: v,
                                                is_upgraded: !1
                                            }
                                        });
                                    P["loaded_player_count"] = B["ready_id_list"]["length"],
                                        P["_AuthSuccess"](J, B["is_game_start"], B["game_config"]["toJSON"]());
                                }
                            });
                    },
                    P["prototype"]["_AuthSuccess"] = function (P, m, B) {
                        var J = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.2),
                                app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                    round_id: view["DesktopMgr"].Inst["round_id"],
                                    step: view["DesktopMgr"].Inst["current_step"]
                                }, function (P, m) {
                                    P || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", P, m), S["Scene_MJ"].Inst["ForceOut"]()) : (app.Log.log("[syncGame] " + JSON["stringify"](m)), m["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2011)), S["Scene_MJ"].Inst["GameEnd"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.3), view["DesktopMgr"].Inst["fetchLinks"](), view["DesktopMgr"].Inst["Reset"](), view["DesktopMgr"].Inst["duringReconnect"] = !0, view["DesktopMgr"].Inst["syncGameByStep"](m["game_restore"])));
                                });
                        })) : S["Scene_MJ"].Inst["openMJRoom"](B, P, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](B)), P, GameMgr.Inst["account_id"], view["EMJMode"].play, Laya["Handler"]["create"](J, function () {
                                m ? Laya["timer"]["frameOnce"](10, J, function () {
                                    app.Log.log("重连信息2 round_id:-1 step:" + 1000000),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (P, m) {
                                            app.Log.log("syncGame " + JSON["stringify"](m)),
                                                P || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", P, m), S["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), view["DesktopMgr"].Inst["fetchLinks"](), J["_PlayerReconnectSuccess"](m));
                                        });
                                }) : Laya["timer"]["frameOnce"](10, J, function () {
                                    app.Log.log("send enterGame"),
                                        view["DesktopMgr"].Inst["Reset"](),
                                        view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "enterGame", {}, function (P, m) {
                                            P || m["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("enterGame", P, m), S["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), app.Log.log("enterGame"), J["_EnterGame"](m), view["DesktopMgr"].Inst["fetchLinks"]());
                                        });
                                });
                            }));
                        }), Laya["Handler"]["create"](this, function (S) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.8 * S);
                        }, null, !1));
                    },
                    P["prototype"]["_EnterGame"] = function (P) {
                        app.Log.log("正常进入游戏: " + JSON["stringify"](P)),
                            P["is_end"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2011)), S["Scene_MJ"].Inst["GameEnd"]()) : P["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](P["game_restore"]) : (this["load_over"] = !0, this["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](this["loaded_player_count"], this["real_player_count"]), view["DesktopMgr"].Inst["duringReconnect"] = !1, view["DesktopMgr"].Inst["StartChainAction"](0));
                    },
                    P["prototype"]["_PlayerReconnectSuccess"] = function (P) {
                        app.Log.log("_PlayerReconnectSuccess data:" + JSON["stringify"](P)),
                            P["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2011)), S["Scene_MJ"].Inst["GameEnd"]()) : P["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](P["game_restore"]) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](S["Tools"]["strOfLocalization"](2012)), S["Scene_MJ"].Inst["ForceOut"]());
                    },
                    P["prototype"]["_SendDebugInfo"] = function () { },
                    P["prototype"]["OpenConnectObserve"] = function (P, m) {
                        var B = this;
                        this["is_ob"] = !0,
                            uiscript["UI_Loading"].Inst.show("enter_mj"),
                            this["Close"](),
                            view["AudioMgr"]["StopMusic"](),
                            Laya["timer"].once(500, this, function () {
                                B["server_location"] = m,
                                    B["ob_token"] = P,
                                    B["_setState"](S["EConnectState"]["tryconnect"]),
                                    B["lb_index"] = 0,
                                    B["_fetch_gateway"](0);
                            });
                    },
                    P["prototype"]["_ConnectSuccessOb"] = function () {
                        var P = this;
                        app.Log.log("MJNetMgr _ConnectSuccessOb "),
                            app["NetAgent"]["sendReq2MJ"]("FastTest", "authObserve", {
                                token: this["ob_token"]
                            }, function (m, B) {
                                m || B["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("authObserve", m, B), S["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]()) : (app.Log.log("实时OB验证通过：" + JSON["stringify"](B)), uiscript["UI_Loading"].Inst["setProgressVal"](0.3), uiscript["UI_Live_Broadcast"].Inst && uiscript["UI_Live_Broadcast"].Inst["clearPendingUnits"](), app["NetAgent"]["sendReq2MJ"]("FastTest", "startObserve", {}, function (m, B) {
                                    if (m || B["error"])
                                        uiscript["UIMgr"].Inst["showNetReqError"]("startObserve", m, B), S["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                    else {
                                        var J = B.head,
                                            L = J["game_config"].mode,
                                            w = [],
                                            h = S["Tools"]["strOfLocalization"](2003),
                                            s = view["ERuleMode"]["Liqi4"];
                                        L.mode < 10 ? (s = view["ERuleMode"]["Liqi4"], P["real_player_count"] = 4) : L.mode < 20 && (s = view["ERuleMode"]["Liqi3"], P["real_player_count"] = 3);
                                        for (var R = 0; R < P["real_player_count"]; R++)
                                            w.push(null);
                                        L["extendinfo"] && (h = S["Tools"]["strOfLocalization"](2004)),
                                            L["detail_rule"] && L["detail_rule"]["ai_level"] && (1 === L["detail_rule"]["ai_level"] && (h = S["Tools"]["strOfLocalization"](2003)), 2 === L["detail_rule"]["ai_level"] && (h = S["Tools"]["strOfLocalization"](2004)));
                                        for (var v = S["GameUtility"]["get_default_ai_skin"](), f = S["GameUtility"]["get_default_ai_character"](), R = 0; R < J["seat_list"]["length"]; R++) {
                                            var A = J["seat_list"][R];
                                            if (0 == A)
                                                w[R] = {
                                                    nickname: h,
                                                    avatar_id: v,
                                                    level: {
                                                        id: "10101"
                                                    },
                                                    level3: {
                                                        id: "20101"
                                                    },
                                                    character: {
                                                        charid: f,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: v,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var u = 0; u < J["players"]["length"]; u++)
                                                    if (J["players"][u]["account_id"] == A) {
                                                        w[R] = J["players"][u];
                                                        break;
                                                    }
                                        }
                                        for (var R = 0; R < P["real_player_count"]; R++)
                                            null == w[R] && (w[R] = {
                                                account: 0,
                                                nickname: S["Tools"]["strOfLocalization"](2010),
                                                avatar_id: v,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: f,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: v,
                                                    is_upgraded: !1
                                                }
                                            });
                                        P["_StartObSuccuess"](w, B["passed"], J["game_config"]["toJSON"](), J["start_time"]);
                                    }
                                }));
                            });
                    },
                    P["prototype"]["_StartObSuccuess"] = function (P, m, B, J) {
                        var L = this;
                        view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function () {
                            app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                view["DesktopMgr"].Inst["Reset"](),
                                uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](J, m);
                        })) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.4), S["Scene_MJ"].Inst["openMJRoom"](B, P, Laya["Handler"]["create"](this, function () {
                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](B)), P, GameMgr.Inst["account_id"], view["EMJMode"]["live_broadcast"], Laya["Handler"]["create"](L, function () {
                                uiscript["UI_Loading"].Inst["setProgressVal"](0.9),
                                    Laya["timer"].once(1000, L, function () {
                                        GameMgr.Inst["EnterMJ"](),
                                            uiscript["UI_Loading"].Inst["setProgressVal"](0.95),
                                            uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](J, m);
                                    });
                            }));
                        }), Laya["Handler"]["create"](this, function (S) {
                            return uiscript["UI_Loading"].Inst["setProgressVal"](0.4 + 0.4 * S);
                        }, null, !1)));
                    },
                    P["_Inst"] = null,
                    P;
            }
                ();
            S["MJNetMgr"] = P;
        }
            (game || (game = {}));


        // 读取战绩
        !function (S) {
            var P = function (P) {
                function m() {
                    var S = P.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["both_ui"]["otherplayerinfoUI"]() : new ui["both_ui"]["otherplayerinfo_enUI"]()) || this;
                    return S["account_id"] = 0,
                        S["origin_x"] = 0,
                        S["origin_y"] = 0,
                        S.root = null,
                        S["title"] = null,
                        S["level"] = null,
                        S["btn_addfriend"] = null,
                        S["btn_report"] = null,
                        S["illust"] = null,
                        S.name = null,
                        S["detail_data"] = null,
                        S["achievement_data"] = null,
                        S["locking"] = !1,
                        S["tab_info4"] = null,
                        S["tab_info3"] = null,
                        S["tab_note"] = null,
                        S["tab_img_dark"] = '',
                        S["tab_img_chosen"] = '',
                        S["player_data"] = null,
                        S["tab_index"] = 1,
                        S["game_category"] = 1,
                        S["game_type"] = 1,
                        m.Inst = S,
                        S;
                }
                return __extends(m, P),
                    m["prototype"]["onCreate"] = function () {
                        var P = this;
                        "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_dark.png")) : (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_dark.png")),
                            this.root = this.me["getChildByName"]("root"),
                            this["origin_x"] = this.root.x,
                            this["origin_y"] = this.root.y,
                            this["container_info"] = this.root["getChildByName"]("container_info"),
                            this["title"] = new S["UI_PlayerTitle"](this["container_info"]["getChildByName"]("title"), "UI_OtherPlayerInfo"),
                            this.name = this["container_info"]["getChildByName"]("name"),
                            this["level"] = new S["UI_Level"](this["container_info"]["getChildByName"]("rank"), "UI_OtherPlayerInfo"),
                            this["detail_data"] = new S["UI_PlayerData"](this["container_info"]["getChildByName"]("data")),
                            this["achievement_data"] = new S["UI_Achievement_Light"](this["container_info"]["getChildByName"]("achievement")),
                            this["illust"] = new S["UI_Character_Skin"](this.root["getChildByName"]("illust")["getChildByName"]("illust")),
                            this["btn_addfriend"] = this["container_info"]["getChildByName"]("btn_add"),
                            this["btn_addfriend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["btn_addfriend"]["visible"] = !1,
                                    P["btn_report"].x = 343,
                                    app["NetAgent"]["sendReq2Lobby"]("Lobby", "applyFriend", {
                                        target_id: P["account_id"]
                                    }, function () { });
                            }, null, !1),
                            this["btn_report"] = this["container_info"]["getChildByName"]("btn_report"),
                            this["btn_report"]["clickHandler"] = new Laya["Handler"](this, function () {
                                S["UI_Report_Nickname"].Inst.show(P["account_id"]);
                            }),
                            this.me["getChildAt"](0)["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || P["close"]();
                            }, null, !1),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["close"]();
                            }, null, !1),
                            this.note = new S["UI_PlayerNote"](this.root["getChildByName"]("container_note"), null),
                            this["tab_info4"] = this.root["getChildByName"]("tab_info4"),
                            this["tab_info4"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || 1 != P["tab_index"] && P["changeMJCategory"](1);
                            }, null, !1),
                            this["tab_info3"] = this.root["getChildByName"]("tab_info3"),
                            this["tab_info3"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || 2 != P["tab_index"] && P["changeMJCategory"](2);
                            }, null, !1),
                            this["tab_note"] = this.root["getChildByName"]("tab_note"),
                            this["tab_note"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"] && (game["Tools"]["during_chat_close"]() ? S["UIMgr"].Inst["ShowErrorInfo"]("功能维护中，祝大家新年快乐") : P["container_info"]["visible"] && (P["container_info"]["visible"] = !1, P["tab_info4"].skin = P["tab_img_dark"], P["tab_info3"].skin = P["tab_img_dark"], P["tab_note"].skin = P["tab_img_chosen"], P["tab_index"] = 3, P.note.show()));
                            }, null, !1),
                            this["locking"] = !1;
                    },
                    m["prototype"].show = function (P, m, B, J) {
                        var L = this;
                        void 0 === m && (m = 1),
                            void 0 === B && (B = 2),
                            void 0 === J && (J = 1),
                            GameMgr.Inst["BehavioralStatistics"](14),
                            this["account_id"] = P,
                            this["enable"] = !0,
                            this["locking"] = !0,
                            this.root.y = this["origin_y"],
                            this["player_data"] = null,
                            S["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                L["locking"] = !1;
                            })),
                            this["detail_data"]["reset"](),
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountStatisticInfo", {
                                account_id: P
                            }, function (m, B) {
                                m || B["error"] ? S["UIMgr"].Inst["showNetReqError"]("fetchAccountStatisticInfo", m, B) : S["UI_Shilian"]["now_season_info"] && 1001 == S["UI_Shilian"]["now_season_info"]["season_id"] && 3 != S["UI_Shilian"]["get_cur_season_state"]() ? (L["detail_data"]["setData"](B), L["changeMJCategory"](L["tab_index"], L["game_category"], L["game_type"])) : app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountChallengeRankInfo", {
                                    account_id: P
                                }, function (P, m) {
                                    P || m["error"] ? S["UIMgr"].Inst["showNetReqError"]("fetchAccountChallengeRankInfo", P, m) : (B["season_info"] = m["season_info"], L["detail_data"]["setData"](B), L["changeMJCategory"](L["tab_index"], L["game_category"], L["game_type"]));
                                });
                            }),
                            this.note["init_data"](P),
                            this["refreshBaseInfo"](),
                            this["btn_report"]["visible"] = P != GameMgr.Inst["account_id"],
                            this["tab_index"] = m,
                            this["game_category"] = B,
                            this["game_type"] = J,
                            this["container_info"]["visible"] = !0,
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["tab_note"]["visible"] = "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"],
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    m["prototype"]["refreshBaseInfo"] = function () {
                        var P = this;
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
                            }, function (m, B) {
                                if (m || B["error"])
                                    S["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", m, B);
                                else {
                                    var J = B["account"];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (J.account_id == GameMgr.Inst.account_id) {
                                        J.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            J.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            J.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    P["player_data"] = J,
                                        game["Tools"]["SetNickname"](P.name, J),
                                        P["title"].id = game["Tools"]["titleLocalization"](J["account_id"], J["title"]),
                                        P["level"].id = J["level"].id,
                                        P["level"].id = P["player_data"][1 == P["tab_index"] ? "level" : "level3"].id,
                                        P["level"].exp = P["player_data"][1 == P["tab_index"] ? "level" : "level3"]["score"],
                                        P["illust"].me["visible"] = !0,
                                        P["account_id"] == GameMgr.Inst["account_id"] ? P["illust"]["setSkin"](J["avatar_id"], "waitingroom") : P["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](J["avatar_id"]), "waitingroom"),
                                        game["Tools"]["is_same_zone"](GameMgr.Inst["account_id"], P["account_id"]) && P["account_id"] != GameMgr.Inst["account_id"] && null == game["FriendMgr"].find(P["account_id"]) ? (P["btn_addfriend"]["visible"] = !0, P["btn_report"].x = 520) : (P["btn_addfriend"]["visible"] = !1, P["btn_report"].x = 343),
                                        P.note.sign["setSign"](J["signature"]),
                                        P["achievement_data"].show(!1, J["achievement_count"]);
                                }
                            });
                    },
                    m["prototype"]["changeMJCategory"] = function (S, P, m) {
                        void 0 === P && (P = 2),
                            void 0 === m && (m = 1),
                            this["tab_index"] = S,
                            this["container_info"]["visible"] = !0,
                            this["detail_data"]["changeMJCategory"](S, P, m),
                            this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                            this["tab_note"].skin = this["tab_img_dark"],
                            this.note["close"](),
                            this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                    },
                    m["prototype"]["close"] = function () {
                        var P = this;
                        this["enable"] && (this["locking"] || (this["locking"] = !0, this["detail_data"]["close"](), S["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                            P["locking"] = !1,
                                P["enable"] = !1;
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
                (S["UIBase"]);
            S["UI_OtherPlayerInfo"] = P;
        }
            (uiscript || (uiscript = {}));


        // 宿舍相关
        !function (S) {
            var P = function () {
                function P(P, B) {
                    var J = this;
                    this["_scale"] = 1,
                        this["during_move"] = !1,
                        this["mouse_start_x"] = 0,
                        this["mouse_start_y"] = 0,
                        this.me = P,
                        this["container_illust"] = B,
                        this["illust"] = this["container_illust"]["getChildByName"]("illust"),
                        this["container_move"] = P["getChildByName"]("move"),
                        this["container_move"].on("mousedown", this, function () {
                            J["during_move"] = !0,
                                J["mouse_start_x"] = J["container_move"]["mouseX"],
                                J["mouse_start_y"] = J["container_move"]["mouseY"];
                        }),
                        this["container_move"].on("mousemove", this, function () {
                            J["during_move"] && (J.move(J["container_move"]["mouseX"] - J["mouse_start_x"], J["container_move"]["mouseY"] - J["mouse_start_y"]), J["mouse_start_x"] = J["container_move"]["mouseX"], J["mouse_start_y"] = J["container_move"]["mouseY"]);
                        }),
                        this["container_move"].on("mouseup", this, function () {
                            J["during_move"] = !1;
                        }),
                        this["container_move"].on("mouseout", this, function () {
                            J["during_move"] = !1;
                        }),
                        this["btn_close"] = P["getChildByName"]("btn_close"),
                        this["btn_close"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            J["locking"] || J["close"]();
                        }, null, !1),
                        this["scrollbar"] = P["getChildByName"]("scrollbar")["scriptMap"]["capsui.CScrollBar"],
                        this["scrollbar"].init(new Laya["Handler"](this, function (S) {
                            J["_scale"] = 1 * (1 - S) + 0.5,
                                J["illust"]["scaleX"] = J["_scale"],
                                J["illust"]["scaleY"] = J["_scale"],
                                J["scrollbar"]["setVal"](S, 0);
                        })),
                        this["dongtai_kaiguan"] = new S["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            m.Inst["illust"]["resetSkin"]();
                        }), new Laya["Handler"](this, function (S) {
                            m.Inst["illust"]["playAnim"](S);
                        })),
                        this["dongtai_kaiguan"]["setKaiguanPos"](43, -31);
                }
                return Object["defineProperty"](P["prototype"], "scale", {
                    get: function () {
                        return this["_scale"];
                    },
                    set: function (S) {
                        this["_scale"] = S,
                            this["scrollbar"]["setVal"](1 - (S - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    P["prototype"].show = function (P) {
                        var B = this;
                        this["locking"] = !0,
                            this["when_close"] = P,
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
                            S["UIBase"]["anim_pop_out"](this["btn_close"], null),
                            this["during_move"] = !1,
                            Laya["timer"].once(250, this, function () {
                                B["locking"] = !1;
                            }),
                            this.me["visible"] = !0,
                            this["dongtai_kaiguan"]["refresh"](m.Inst["illust"]["skin_id"]);
                    },
                    P["prototype"]["close"] = function () {
                        var P = this;
                        this["locking"] = !0,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? this["container_illust"]["getChildByName"]("container_name")["visible"] = !0 : this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !0,
                            this["container_illust"]["getChildByName"]("btn")["visible"] = !0,
                            Laya["Tween"].to(this["illust"], {
                                x: this["illust_start_x"],
                                y: this["illust_start_y"],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            S["UIBase"]["anim_pop_hide"](this["btn_close"], null),
                            Laya["timer"].once(250, this, function () {
                                P["locking"] = !1,
                                    P.me["visible"] = !1,
                                    P["when_close"].run();
                            });
                    },
                    P["prototype"].move = function (S, P) {
                        var m = this["illust"].x + S,
                            B = this["illust"].y + P;
                        m < this["illust_center_x"] - 600 ? m = this["illust_center_x"] - 600 : m > this["illust_center_x"] + 600 && (m = this["illust_center_x"] + 600),
                            B < this["illust_center_y"] - 1200 ? B = this["illust_center_y"] - 1200 : B > this["illust_center_y"] + 800 && (B = this["illust_center_y"] + 800),
                            this["illust"].x = m,
                            this["illust"].y = B;
                    },
                    P;
            }
                (),
                m = function (m) {
                    function B() {
                        var S = m.call(this, new ui["lobby"]["susheUI"]()) || this;
                        return S["contianer_illust"] = null,
                            S["illust"] = null,
                            S["illust_rect"] = null,
                            S["container_name"] = null,
                            S["label_name"] = null,
                            S["label_cv"] = null,
                            S["label_cv_title"] = null,
                            S["container_page"] = null,
                            S["container_look_illust"] = null,
                            S["page_select_character"] = null,
                            S["page_visit_character"] = null,
                            S["origin_illust_x"] = 0,
                            S["chat_id"] = 0,
                            S["container_chat"] = null,
                            S["_select_index"] = 0,
                            S["sound_channel"] = null,
                            S["chat_block"] = null,
                            S["illust_showing"] = !0,
                            B.Inst = S,
                            S;
                    }
                    return __extends(B, m),
                        B["onMainSkinChange"] = function () {
                            var S = cfg["item_definition"].skin.get(GameMgr.Inst["account_data"]["avatar_id"]);
                            S && S["spine_type"] && CatFoodSpine["SpineMgr"].Inst["changeSpineImportant"](game["Tools"]["localUISrc"](S.path) + "/spine");
                        },
                        B["randomDesktopID"] = function () {
                            var P = S["UI_Sushe"]["commonViewList"][S["UI_Sushe"]["using_commonview_index"]];
                            if (this["now_mjp_id"] = game["GameUtility"]["get_view_default_item_id"](game["EView"].mjp), this["now_desktop_id"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["desktop"]), P)
                                for (var m = 0; m < P["length"]; m++)
                                    P[m].slot == game["EView"].mjp ? this["now_mjp_id"] = P[m].type ? P[m]["item_id_list"][Math["floor"](Math["random"]() * P[m]["item_id_list"]["length"])] : P[m]["item_id"] : P[m].slot == game["EView"]["desktop"] && (this["now_desktop_id"] = P[m].type ? P[m]["item_id_list"][Math["floor"](Math["random"]() * P[m]["item_id_list"]["length"])] : P[m]["item_id"]);
                        },
                        B.init = function (P) {
                            var m = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCharacterInfo", {}, function (J, L) {
                                if (J || L["error"])
                                    S["UIMgr"].Inst["showNetReqError"]("fetchCharacterInfo", J, L);
                                else {
                                    if (app.Log.log("fetchCharacterInfo: " + JSON["stringify"](L)), L = JSON["parse"](JSON["stringify"](L)), L["main_character_id"] && L["characters"]) {
                                        // if (m["characters"] = [], L["characters"])
                                        //    for (var w = 0; w < L["characters"]["length"]; w++)
                                        //        m["characters"].push(L["characters"][w]);
                                        // if (m["skin_map"] = {}, L["skins"])
                                        //     for (var w = 0; w < L["skins"]["length"]; w++)
                                        //         m["skin_map"][L["skins"][w]] = 1;
                                        //  m["main_character_id"] = L["main_character_id"];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = L.main_character_id;
                                        for (let i = 0; i < L.characters.length; i++) {
                                            if (L.characters[i].charid == L.main_character_id) {
                                                if (L.characters[i].extra_emoji !== undefined) {
                                                    fake_data.emoji = L.characters[i].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = L.skins[i];
                                                fake_data.exp = L.characters[i].exp;
                                                fake_data.level = L.characters[i].level;
                                                fake_data.is_upgraded = L.characters[i].is_upgraded;
                                                break;
                                            }
                                        }
                                        m.characters = [];

                                        for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                            let id = 200000 + j;
                                            let skin = 400001 + j * 100;
                                            let emoji = [];
                                            cfg.character.emoji.getGroup(id).forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            m.characters.push({
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
                                        m.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        m.star_chars = MMP.settings.star_chars;
                                        L.character_sort = MMP.settings.star_chars;
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
                                    if (m["send_gift_count"] = 0, m["send_gift_limit"] = 0, L["send_gift_count"] && (m["send_gift_count"] = L["send_gift_count"]), L["send_gift_limit"] && (m["send_gift_limit"] = L["send_gift_limit"]), L["finished_endings"])
                                        for (var w = 0; w < L["finished_endings"]["length"]; w++)
                                            m["finished_endings_map"][L["finished_endings"][w]] = 1;
                                    if (L["rewarded_endings"])
                                        for (var w = 0; w < L["rewarded_endings"]["length"]; w++)
                                            m["rewarded_endings_map"][L["rewarded_endings"][w]] = 1;
                                    if (m["star_chars"] = [], L["character_sort"] && (m["star_chars"] = L["character_sort"]), B["hidden_characters_map"] = {}, L["hidden_characters"])
                                        for (var h = 0, s = L["hidden_characters"]; h < s["length"]; h++) {
                                            var R = s[h];
                                            B["hidden_characters_map"][R] = 1;
                                        }
                                    P.run();
                                }
                            }),
                                // app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAllCommonViews", {}, function (P, B) {
                                //     if (P || B["error"])
                                //         S["UIMgr"].Inst["showNetReqError"]("fetchAllCommonViews", P, B);
                                //     else {
                                //         m["using_commonview_index"] = B.use,
                                //         m["commonViewList"] = [[], [], [], [], [], [], [], []];
                                //         var J = B["views"];
                                //         if (J)
                                //             for (var L = 0; L < J["length"]; L++) {
                                //                 var w = J[L]["values"];
                                //                 w && (m["commonViewList"][J[L]["index"]] = w);
                                //             }
                                m["randomDesktopID"](),
                                m.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst["load_mjp_view"](),
                                GameMgr.Inst["load_touming_mjp_view"]();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //     }
                            // });
                        },
                        B["on_data_updata"] = function (P) {
                            if (P["character"]) {
                                var m = JSON["parse"](JSON["stringify"](P["character"]));
                                if (m["characters"])
                                    for (var B = m["characters"], J = 0; J < B["length"]; J++) {
                                        for (var L = !1, w = 0; w < this["characters"]["length"]; w++)
                                            if (this["characters"][w]["charid"] == B[J]["charid"]) {
                                                this["characters"][w] = B[J],
                                                    S["UI_Sushe_Visit"].Inst && S["UI_Sushe_Visit"].Inst["chara_info"] && S["UI_Sushe_Visit"].Inst["chara_info"]["charid"] == this["characters"][w]["charid"] && (S["UI_Sushe_Visit"].Inst["chara_info"] = this["characters"][w]),
                                                    L = !0;
                                                break;
                                            }
                                        L || this["characters"].push(B[J]);
                                    }
                                if (m["skins"]) {
                                    for (var h = m["skins"], J = 0; J < h["length"]; J++)
                                        this["skin_map"][h[J]] = 1;
                                    S["UI_Bag"].Inst["on_skin_change"]();
                                }
                                if (m["finished_endings"]) {
                                    for (var s = m["finished_endings"], J = 0; J < s["length"]; J++)
                                        this["finished_endings_map"][s[J]] = 1;
                                    S["UI_Sushe_Visit"].Inst;
                                }
                                if (m["rewarded_endings"]) {
                                    for (var s = m["rewarded_endings"], J = 0; J < s["length"]; J++)
                                        this["rewarded_endings_map"][s[J]] = 1;
                                    S["UI_Sushe_Visit"].Inst;
                                }
                            }
                        },
                        B["chara_owned"] = function (S) {
                            for (var P = 0; P < this["characters"]["length"]; P++)
                                if (this["characters"][P]["charid"] == S)
                                    return !0;
                            return !1;
                        },
                        B["skin_owned"] = function (S) {
                            return this["skin_map"]["hasOwnProperty"](S["toString"]());
                        },
                        B["add_skin"] = function (S) {
                            this["skin_map"][S] = 1;
                        },
                        Object["defineProperty"](B, "main_chara_info", {
                            get: function () {
                                for (var S = 0; S < this["characters"]["length"]; S++)
                                    if (this["characters"][S]["charid"] == this["main_character_id"])
                                        return this["characters"][S];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        B["on_view_remove"] = function (S) {
                            for (var P = 0; P < this["commonViewList"]["length"]; P++)
                                for (var m = this["commonViewList"][P], B = 0; B < m["length"]; B++)
                                    if (m[B]["item_id"] == S && (m[B]["item_id"] = game["GameUtility"]["get_view_default_item_id"](m[B].slot)), m[B]["item_id_list"]) {
                                        for (var J = 0; J < m[B]["item_id_list"]["length"]; J++)
                                            if (m[B]["item_id_list"][J] == S) {
                                                m[B]["item_id_list"]["splice"](J, 1);
                                                break;
                                            }
                                        0 == m[B]["item_id_list"]["length"] && (m[B].type = 0);
                                    }
                            var L = cfg["item_definition"].item.get(S);
                            L.type == game["EView"]["head_frame"] && GameMgr.Inst["account_data"]["avatar_frame"] == S && (GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["head_frame"]));
                        },
                        B["add_finish_ending"] = function (S) {
                            this["finished_endings_map"][S] = 1;
                        },
                        B["add_reward_ending"] = function (S) {
                            this["rewarded_endings_map"][S] = 1;
                        },
                        B["check_all_char_repoint"] = function () {
                            for (var S = 0; S < B["characters"]["length"]; S++)
                                if (this["check_char_redpoint"](B["characters"][S]))
                                    return !0;
                            return !1;
                        },
                        B["check_char_redpoint"] = function (S) {
                            // 去除小红点
                            // if (B["hidden_characters_map"][S["charid"]])
                            return !1;
                            //END
                            var P = cfg.spot.spot["getGroup"](S["charid"]);
                            if (P)
                                for (var m = 0; m < P["length"]; m++) {
                                    var J = P[m];
                                    if (!(J["is_married"] && !S["is_upgraded"] || !J["is_married"] && S["level"] < J["level_limit"]) && 2 == J.type) {
                                        for (var L = !0, w = 0; w < J["jieju"]["length"]; w++)
                                            if (J["jieju"][w] && B["finished_endings_map"][J["jieju"][w]]) {
                                                if (!B["rewarded_endings_map"][J["jieju"][w]])
                                                    return !0;
                                                L = !1;
                                            }
                                        if (L)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        B["is_char_star"] = function (S) {
                            return -1 != this["star_chars"]["indexOf"](S);
                        },
                        B["change_char_star"] = function (S) {
                            var P = this["star_chars"]["indexOf"](S);
                            -1 != P ? this["star_chars"]["splice"](P, 1) : this["star_chars"].push(S);
                            // 屏蔽网络请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "updateCharacterSort", {
                            //     sort: this["star_chars"]
                            // }, function () {});
                            // END
                        },
                        Object["defineProperty"](B["prototype"], "select_index", {
                            get: function () {
                                return this["_select_index"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        B["prototype"]["reset_select_index"] = function () {
                            this["_select_index"] = -1;
                        },
                        B["prototype"]["onCreate"] = function () {
                            var m = this;
                            this["contianer_illust"] = this.me["getChildByName"]("illust"),
                                this["illust"] = new S["UI_Character_Skin"](this["contianer_illust"]["getChildByName"]("illust")["getChildByName"]("illust")),
                                this["illust_rect"] = S["UIRect"]["CreateFromSprite"](this["illust"].me),
                                this["container_chat"] = this["contianer_illust"]["getChildByName"]("chat"),
                                this["chat_block"] = new S["UI_Character_Chat"](this["container_chat"]),
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
                                this["page_select_character"] = new S["UI_Sushe_Select"](),
                                this["container_page"]["addChild"](this["page_select_character"].me),
                                this["page_visit_character"] = new S["UI_Sushe_Visit"](),
                                this["container_page"]["addChild"](this["page_visit_character"].me),
                                this["container_look_illust"] = new P(this.me["getChildByName"]("look_illust"), this["contianer_illust"]);
                        },
                        B["prototype"].show = function (S) {
                            GameMgr.Inst["BehavioralStatistics"](15),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["page_visit_character"].me["visible"] = !1,
                                this["container_look_illust"].me["visible"] = !1;
                            for (var P = 0, m = 0; m < B["characters"]["length"]; m++)
                                if (B["characters"][m]["charid"] == B["main_character_id"]) {
                                    P = m;
                                    break;
                                }
                            0 == S ? (this["change_select"](P), this["show_page_select"]()) : (this["_select_index"] = -1, this["illust_showing"] = !1, this["contianer_illust"]["visible"] = !1, this["page_select_character"].show(1));
                        },
                        B["prototype"]["starup_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"]["star_up_back"](B["characters"][this["_select_index"]]),
                                this["page_visit_character"]["show_levelup"]();
                        },
                        B["prototype"]["spot_back"] = function () {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"].show(B["characters"][this["_select_index"]], 2);
                        },
                        B["prototype"]["go2Lobby"] = function () {
                            this["close"](Laya["Handler"]["create"](this, function () {
                                S["UIMgr"].Inst["showLobby"]();
                            }));
                        },
                        B["prototype"]["close"] = function (P) {
                            var m = this;
                            this["illust_showing"] && S["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 150, 0),
                                Laya["timer"].once(150, this, function () {
                                    m["enable"] = !1,
                                        P && P.run();
                                });
                        },
                        B["prototype"]["onDisable"] = function () {
                            view["AudioMgr"]["refresh_music_volume"](!1),
                                this["illust"]["clear"](),
                                this["stopsay"](),
                                this["container_look_illust"].me["visible"] && this["container_look_illust"]["close"]();
                        },
                        B["prototype"]["hide_illust"] = function () {
                            var P = this;
                            this["illust_showing"] && (this["illust_showing"] = !1, S["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 200, 0, Laya["Handler"]["create"](this, function () {
                                P["contianer_illust"]["visible"] = !1;
                            })));
                        },
                        B["prototype"]["open_illust"] = function () {
                            if (!this["illust_showing"])
                                if (this["illust_showing"] = !0, this["_select_index"] >= 0)
                                    this["contianer_illust"]["visible"] = !0, this["contianer_illust"]["alpha"] = 1, S["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var P = 0, m = 0; m < B["characters"]["length"]; m++)
                                        if (B["characters"][m]["charid"] == B["main_character_id"]) {
                                            P = m;
                                            break;
                                        }
                                    this["change_select"](P);
                                }
                        },
                        B["prototype"]["show_page_select"] = function () {
                            this["page_select_character"].show(0);
                        },
                        B["prototype"]["show_page_visit"] = function (S) {
                            void 0 === S && (S = 0),
                                this["page_visit_character"].show(B["characters"][this["_select_index"]], S);
                        },
                        B["prototype"]["change_select"] = function (P) {
                            this["_select_index"] = P,
                                this["illust"]["clear"](),
                                this["illust_showing"] = !0;
                            var m = B["characters"][P];
                            this["label_name"].text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].get(m["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].get(m["charid"])["name_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_name"].font = -1 != B["chs_fengyu_name_lst"]["indexOf"](m["charid"]) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["label_cv"].text = cfg["item_definition"]["character"].get(m["charid"])["desc_cv_" + GameMgr["client_language"]], this["label_cv_title"].text = 'CV') : this["label_cv"].text = "CV:" + cfg["item_definition"]["character"].get(m["charid"])["desc_cv_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_cv"].font = -1 != B["chs_fengyu_cv_lst"]["indexOf"](m["charid"]) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && (this["label_cv_title"].y = 355 - this["label_cv"]["textField"]["textHeight"] / 2 * 0.7);
                            var J = new S["UIRect"]();
                            J.x = this["illust_rect"].x,
                                J.y = this["illust_rect"].y,
                                J["width"] = this["illust_rect"]["width"],
                                J["height"] = this["illust_rect"]["height"],
                                "405503" == m.skin ? J.y -= 70 : "403303" == m.skin && (J.y += 117),
                                this["illust"]["setRect"](J),
                                this["illust"]["setSkin"](m.skin, "full"),
                                this["contianer_illust"]["visible"] = !0,
                                Laya["Tween"]["clearAll"](this["contianer_illust"]),
                                this["contianer_illust"].x = this["origin_illust_x"],
                                this["contianer_illust"]["alpha"] = 1,
                                S["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                    x: -30
                                }, 230),
                                this["stopsay"]();
                            var L = cfg["item_definition"].skin.get(m.skin);
                            L["spine_type"] ? (this["page_select_character"]["changeKaiguanShow"](!0), this["container_look_illust"]["dongtai_kaiguan"].show(this["illust"]["skin_id"])) : (this["page_select_character"]["changeKaiguanShow"](!1), this["container_look_illust"]["dongtai_kaiguan"].hide());
                        },
                        B["prototype"]["onChangeSkin"] = function (S) {
                            B["characters"][this["_select_index"]].skin = S,
                                this["change_select"](this["_select_index"]),
                                B["characters"][this["_select_index"]]["charid"] == B["main_character_id"] && (GameMgr.Inst["account_data"]["avatar_id"] = S, B["onMainSkinChange"]());
                            // 屏蔽换肤请求
                            // app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                            //     character_id: B["characters"][this["_select_index"]]["charid"],
                            //     skin: S
                            // }, function () {});
                            // 保存皮肤
                                    MMP.settings.characters[uiscript.UI_Sushe.characters[this._select_index].charid - 200001] = uiscript.UI_Sushe.characters[this._select_index].skin;
                                    MMP.saveSettings();
                            // END
                        },
                        B["prototype"].say = function (S) {
                            var P = this,
                                m = B["characters"][this["_select_index"]];
                            this["chat_id"]++;
                            var J = this["chat_id"],
                                L = view["AudioMgr"]["PlayCharactorSound"](m, S, Laya["Handler"]["create"](this, function () {
                                    Laya["timer"].once(1000, P, function () {
                                        J == P["chat_id"] && P["stopsay"]();
                                    });
                                }));
                            L && (this["chat_block"].show(L["words"]), this["sound_channel"] = L["sound"]);
                        },
                        B["prototype"]["stopsay"] = function () {
                            this["chat_block"]["close"](!1),
                                this["sound_channel"] && (this["sound_channel"].stop(), Laya["SoundManager"]["removeChannel"](this["sound_channel"]), this["sound_channel"] = null);
                        },
                        B["prototype"]["to_look_illust"] = function () {
                            var S = this;
                            this["container_look_illust"].show(Laya["Handler"]["create"](this, function () {
                                S["illust"]["playAnim"]("idle"),
                                    S["page_select_character"].show(0);
                            }));
                        },
                        B["prototype"]["jump_to_char_skin"] = function (P, m) {
                            var J = this;
                            if (void 0 === P && (P = -1), void 0 === m && (m = null), P >= 0)
                                for (var L = 0; L < B["characters"]["length"]; L++)
                                    if (B["characters"][L]["charid"] == P) {
                                        this["change_select"](L);
                                        break;
                                    }
                            S["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                B.Inst["show_page_visit"](),
                                    J["page_visit_character"]["show_pop_skin"](),
                                    J["page_visit_character"]["set_jump_callback"](m);
                            }));
                        },
                        B["prototype"]["jump_to_char_qiyue"] = function (P) {
                            var m = this;
                            if (void 0 === P && (P = -1), P >= 0)
                                for (var J = 0; J < B["characters"]["length"]; J++)
                                    if (B["characters"][J]["charid"] == P) {
                                        this["change_select"](J);
                                        break;
                                    }
                            S["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                B.Inst["show_page_visit"](),
                                    m["page_visit_character"]["show_qiyue"]();
                            }));
                        },
                        B["prototype"]["jump_to_char_gift"] = function (P) {
                            var m = this;
                            if (void 0 === P && (P = -1), P >= 0)
                                for (var J = 0; J < B["characters"]["length"]; J++)
                                    if (B["characters"][J]["charid"] == P) {
                                        this["change_select"](J);
                                        break;
                                    }
                            S["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function () {
                                B.Inst["show_page_visit"](),
                                    m["page_visit_character"]["show_gift"]();
                            }));
                        },
                        B["characters"] = [],
                        B["chs_fengyu_name_lst"] = ["200040", "200043"],
                        B["chs_fengyu_cv_lst"] = ["200047", "200050", "200054"],
                        B["skin_map"] = {},
                        B["main_character_id"] = 0,
                        B["send_gift_count"] = 0,
                        B["send_gift_limit"] = 0,
                        B["commonViewList"] = [],
                        B["using_commonview_index"] = 0,
                        B["finished_endings_map"] = {},
                        B["rewarded_endings_map"] = {},
                        B["star_chars"] = [],
                        B["hidden_characters_map"] = {},
                        B.Inst = null,
                        B;
                }
                    (S["UIBase"]);
            S["UI_Sushe"] = m;
        }
            (uiscript || (uiscript = {}));


        // 屏蔽改变宿舍角色的网络请求
        !function (S) {
            var P = function () {
                function P(P) {
                    var B = this;
                    this["scrollview"] = null,
                        this["select_index"] = 0,
                        this["show_index_list"] = [],
                        this["only_show_star_char"] = !1,
                        this.me = P,
                        this.me["getChildByName"]("btn_visit")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || m.Inst["close"](Laya["Handler"]["create"](B, function () {
                                S["UI_Sushe"].Inst["show_page_visit"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_look")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || m.Inst["close"](Laya["Handler"]["create"](B, function () {
                                S["UI_Sushe"].Inst["to_look_illust"]();
                            }));
                        }, null, !1),
                        this.me["getChildByName"]("btn_huanzhuang")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || S["UI_Sushe"].Inst["jump_to_char_skin"]();
                        }, null, !1),
                        this.me["getChildByName"]("btn_star")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            m.Inst["locking"] || B["onChangeStarShowBtnClick"]();
                        }, null, !1),
                        this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                        this["scrollview"]["setElastic"](),
                        this["dongtai_kaiguan"] = new S["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function () {
                            S["UI_Sushe"].Inst["illust"]["resetSkin"]();
                        }));
                }
                return P["prototype"].show = function (P, m) {
                    void 0 === m && (m = !1),
                        this.me["visible"] = !0,
                        P ? this.me["alpha"] = 1 : S["UIBase"]["anim_alpha_in"](this.me, {
                            x: 0
                        }, 200, 0),
                        this["getShowStarState"](),
                        this["sortShowCharsList"](),
                        m || (this.me["getChildByName"]("btn_star")["getChildAt"](1).x = this["only_show_star_char"] ? 107 : 47),
                        this["scrollview"]["reset"](),
                        this["scrollview"]["addItem"](this["show_index_list"]["length"]);
                },
                    P["prototype"]["render_character_cell"] = function (P) {
                        var m = this,
                            B = P["index"],
                            J = P["container"],
                            L = P["cache_data"];
                        J["visible"] = !0,
                            L["index"] = B,
                            L["inited"] || (L["inited"] = !0, J["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                m["onClickAtHead"](L["index"]);
                            }), L.skin = new S["UI_Character_Skin"](J["getChildByName"]("btn")["getChildByName"]("head")), L.bg = J["getChildByName"]("btn")["getChildByName"]('bg'), L["bound"] = J["getChildByName"]("btn")["getChildByName"]("bound"), L["btn_star"] = J["getChildByName"]("btn_star"), L.star = J["getChildByName"]("btn")["getChildByName"]("star"), L["btn_star"]["clickHandler"] = new Laya["Handler"](this, function () {
                                m["onClickAtStar"](L["index"]);
                            }));
                        var w = J["getChildByName"]("btn");
                        w["getChildByName"]("choose")["visible"] = B == this["select_index"];
                        var h = this["getCharInfoByIndex"](B);
                        w["getChildByName"]("redpoint")["visible"] = S["UI_Sushe"]["check_char_redpoint"](h),
                            L.skin["setSkin"](h.skin, "bighead"),
                            w["getChildByName"]("using")["visible"] = h["charid"] == S["UI_Sushe"]["main_character_id"],
                            J["getChildByName"]("btn")["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (h["is_upgraded"] ? "2.png" : ".png"));
                        var s = cfg["item_definition"]["character"].get(h["charid"]);
                        'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? L["bound"].skin = s.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (h["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (h["is_upgraded"] ? "2.png" : ".png")) : s.ur ? (L["bound"].pos(-10, -2), L["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (h["is_upgraded"] ? "6.png" : "5.png"))) : (L["bound"].pos(4, 20), L["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (h["is_upgraded"] ? "4.png" : "3.png"))),
                            L["btn_star"]["visible"] = this["select_index"] == B,
                            L.star["visible"] = S["UI_Sushe"]["is_char_star"](h["charid"]) || this["select_index"] == B,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (L.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (S["UI_Sushe"]["is_char_star"](h["charid"]) ? 'l' : 'd') + (h["is_upgraded"] ? "1.png" : ".png")), w["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(h["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|')) : (L.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (S["UI_Sushe"]["is_char_star"](h["charid"]) ? "l.png" : "d.png")), w["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(h["charid"])["name_" + GameMgr["client_language"]]),
                            ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && ("200041" == h["charid"] ? (w["getChildByName"]("label_name")["scaleX"] = 0.67, w["getChildByName"]("label_name")["scaleY"] = 0.57) : (w["getChildByName"]("label_name")["scaleX"] = 0.7, w["getChildByName"]("label_name")["scaleY"] = 0.6));
                    },
                    P["prototype"]["onClickAtHead"] = function (P) {
                        if (this["select_index"] == P) {
                            var m = this["getCharInfoByIndex"](P);
                            if (m["charid"] != S["UI_Sushe"]["main_character_id"])
                                if (S["UI_PiPeiYuYue"].Inst["enable"])
                                    S["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2769));
                                else {
                                    var B = S["UI_Sushe"]["main_character_id"];
                                    S["UI_Sushe"]["main_character_id"] = m["charid"],
                                        // app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                        //     character_id: S["UI_Sushe"]["main_character_id"]
                                        // }, function () {}),
                                        GameMgr.Inst["account_data"]["avatar_id"] = m.skin,
                                        S["UI_Sushe"]["onMainSkinChange"]();
                                    // 保存人物和皮肤
                                    MMP.settings.character = m.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = m.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var J = 0; J < this["show_index_list"]["length"]; J++)
                                        this["getCharInfoByIndex"](J)["charid"] == B && this["scrollview"]["wantToRefreshItem"](J);
                                    this["scrollview"]["wantToRefreshItem"](P);
                                }
                        } else {
                            var L = this["select_index"];
                            this["select_index"] = P,
                                L >= 0 && this["scrollview"]["wantToRefreshItem"](L),
                                this["scrollview"]["wantToRefreshItem"](P),
                                S["UI_Sushe"].Inst["change_select"](this["show_index_list"][P]);
                        }
                    },
                    P["prototype"]["onClickAtStar"] = function (P) {
                        if (S["UI_Sushe"]["change_char_star"](this["getCharInfoByIndex"](P)["charid"]), this["only_show_star_char"])
                            this["scrollview"]["wantToRefreshItem"](P);
                        else if (this.show(!0), Math["floor"](this["show_index_list"]["length"] / 3) - 3 > 0) {
                            var m = (Math["floor"](this["select_index"] / 3) - 1) / (Math["floor"](this["show_index_list"]["length"] / 3) - 3);
                            this["scrollview"].rate = Math.min(1, Math.max(0, m));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    P["prototype"]["close"] = function (P) {
                        var m = this;
                        this.me["visible"] && (P ? this.me["visible"] = !1 : S["UIBase"]["anim_alpha_out"](this.me, {
                            x: 0
                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                            m.me["visible"] = !1;
                        })));
                    },
                    P["prototype"]["onChangeStarShowBtnClick"] = function () {
                        if (!this["only_show_star_char"]) {
                            for (var P = !1, m = 0, B = S["UI_Sushe"]["star_chars"]; m < B["length"]; m++) {
                                var J = B[m];
                                if (!S["UI_Sushe"]["hidden_characters_map"][J]) {
                                    P = !0;
                                    break;
                                }
                            }
                            if (!P)
                                return S["UI_SecondConfirm"].Inst["show_only_confirm"](game["Tools"]["strOfLocalization"](3301)), void 0;
                        }
                        S["UI_Sushe"].Inst["change_select"](this["show_index_list"]["length"] > 0 ? this["show_index_list"][0] : 0),
                            this["only_show_star_char"] = !this["only_show_star_char"],
                            app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], this["only_show_star_char"] ? 1 : 0);
                        var L = this.me["getChildByName"]("btn_star")["getChildAt"](1);
                        Laya["Tween"]["clearAll"](L),
                            Laya["Tween"].to(L, {
                                x: this["only_show_star_char"] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    P["prototype"]["getShowStarState"] = function () {
                        if (0 == S["UI_Sushe"]["star_chars"]["length"])
                            return this["only_show_star_char"] = !1, void 0;
                        if (this["only_show_star_char"] = 1 == app["PlayerBehaviorStatistic"]["get_val"](app["EBehaviorType"]["Chara_Show_Star"]), this["only_show_star_char"]) {
                            for (var P = 0, m = S["UI_Sushe"]["star_chars"]; P < m["length"]; P++) {
                                var B = m[P];
                                if (!S["UI_Sushe"]["hidden_characters_map"][B])
                                    return;
                            }
                            this["only_show_star_char"] = !1,
                                app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], 0);
                        }
                    },
                    P["prototype"]["sortShowCharsList"] = function () {
                        this["show_index_list"] = [],
                            this["select_index"] = -1;
                        for (var P = 0, m = S["UI_Sushe"]["star_chars"]; P < m["length"]; P++) {
                            var B = m[P];
                            if (!S["UI_Sushe"]["hidden_characters_map"][B])
                                for (var J = 0; J < S["UI_Sushe"]["characters"]["length"]; J++)
                                    if (S["UI_Sushe"]["characters"][J]["charid"] == B) {
                                        J == S["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]),
                                            this["show_index_list"].push(J);
                                        break;
                                    }
                        }
                        if (!this["only_show_star_char"])
                            for (var J = 0; J < S["UI_Sushe"]["characters"]["length"]; J++)
                                S["UI_Sushe"]["hidden_characters_map"][S["UI_Sushe"]["characters"][J]["charid"]] || -1 == this["show_index_list"]["indexOf"](J) && (J == S["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]), this["show_index_list"].push(J));
                    },
                    P["prototype"]["getCharInfoByIndex"] = function (P) {
                        return S["UI_Sushe"]["characters"][this["show_index_list"][P]];
                    },
                    P;
            }
                (),
                m = function (m) {
                    function B() {
                        var S = m.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["lobby"]["sushe_selectUI"]() : new ui["lobby"]["sushe_select_enUI"]()) || this;
                        return S["bg_width_head"] = 962,
                            S["bg_width_zhuangban"] = 1819,
                            S["bg2_delta"] = -29,
                            S["container_top"] = null,
                            S["locking"] = !1,
                            S.tabs = [],
                            S["tab_index"] = 0,
                            B.Inst = S,
                            S;
                    }
                    return __extends(B, m),
                        B["prototype"]["onCreate"] = function () {
                            var m = this;
                            this["container_top"] = this.me["getChildByName"]("top"),
                                this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    m["locking"] || (1 == m["tab_index"] && m["container_zhuangban"]["changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                        m["close"](),
                                            S["UI_Sushe"].Inst["go2Lobby"]();
                                    }), null) : (m["close"](), S["UI_Sushe"].Inst["go2Lobby"]()));
                                }, null, !1),
                                this.root = this.me["getChildByName"]("root"),
                                this.bg2 = this.root["getChildByName"]("bg2"),
                                this.bg = this.root["getChildByName"]('bg');
                            for (var B = this.root["getChildByName"]("container_tabs"), J = function (P) {
                                L.tabs.push(B["getChildAt"](P)),
                                    L.tabs[P]["clickHandler"] = new Laya["Handler"](L, function () {
                                        m["locking"] || m["tab_index"] != P && (1 == m["tab_index"] && m["container_zhuangban"]["changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                            m["change_tab"](P);
                                        }), null) : m["change_tab"](P));
                                    });
                            }, L = this, w = 0; w < B["numChildren"]; w++)
                                J(w);
                            this["container_head"] = new P(this.root["getChildByName"]("container_heads")),
                                this["container_zhuangban"] = new S["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                    return m["locking"];
                                }));
                        },
                        B["prototype"].show = function (P) {
                            var m = this;
                            this["enable"] = !0,
                                this["locking"] = !0,
                                this["container_head"]["dongtai_kaiguan"]["refresh"](),
                                this["tab_index"] = P,
                                0 == this["tab_index"] ? (this.bg["width"] = this["bg_width_head"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"]["close"](!0), this["container_head"].show(!0), S["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), S["UIBase"]["anim_alpha_in"](this.root, {
                                    x: 30
                                }, 200)) : (this.bg["width"] = this["bg_width_zhuangban"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"].show(!0), this["container_head"]["close"](!0), S["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), S["UIBase"]["anim_alpha_in"](this.root, {
                                    y: 30
                                }, 200)),
                                Laya["timer"].once(200, this, function () {
                                    m["locking"] = !1;
                                });
                            for (var B = 0; B < this.tabs["length"]; B++) {
                                var J = this.tabs[B];
                                J.skin = game["Tools"]["localUISrc"](B == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var L = J["getChildByName"]("word");
                                L["color"] = B == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                    L["scaleX"] = L["scaleY"] = B == this["tab_index"] ? 1.1 : 1,
                                    B == this["tab_index"] && J["parent"]["setChildIndex"](J, this.tabs["length"] - 1);
                            }
                        },
                        B["prototype"]["change_tab"] = function (P) {
                            var m = this;
                            this["tab_index"] = P;
                            for (var B = 0; B < this.tabs["length"]; B++) {
                                var J = this.tabs[B];
                                J.skin = game["Tools"]["localUISrc"](B == P ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var L = J["getChildByName"]("word");
                                L["color"] = B == P ? "#552c1c" : "#d3a86c",
                                    L["scaleX"] = L["scaleY"] = B == P ? 1.1 : 1,
                                    B == P && J["parent"]["setChildIndex"](J, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["container_zhuangban"]["close"](!1), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_head"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    S["UI_Sushe"].Inst["open_illust"](),
                                        m["container_head"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_head"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])) : 1 == this["tab_index"] && (this["container_head"]["close"](!1), S["UI_Sushe"].Inst["hide_illust"](), Laya["Tween"].to(this.bg, {
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
                        B["prototype"]["close"] = function (P) {
                            var m = this;
                            this["locking"] = !0,
                                S["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150),
                                0 == this["tab_index"] ? S["UIBase"]["anim_alpha_out"](this.root, {
                                    x: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    m["container_head"]["close"](!0);
                                })) : S["UIBase"]["anim_alpha_out"](this.root, {
                                    y: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function () {
                                    m["container_zhuangban"]["close"](!0);
                                })),
                                Laya["timer"].once(150, this, function () {
                                    m["locking"] = !1,
                                        m["enable"] = !1,
                                        P && P.run();
                                });
                        },
                        B["prototype"]["onDisable"] = function () {
                            for (var P = 0; P < S["UI_Sushe"]["characters"]["length"]; P++) {
                                var m = S["UI_Sushe"]["characters"][P].skin,
                                    B = cfg["item_definition"].skin.get(m);
                                B && Laya["loader"]["clearTextureRes"](game["LoadMgr"]["getResImageSkin"](B.path + "/bighead.png"));
                            }
                        },
                        B["prototype"]["changeKaiguanShow"] = function (S) {
                            S ? this["container_head"]["dongtai_kaiguan"].show() : this["container_head"]["dongtai_kaiguan"].hide();
                        },
                        B;
                }
                    (S["UIBase"]);
            S["UI_Sushe_Select"] = m;
        }
            (uiscript || (uiscript = {}));


        // 友人房
        !function (S) {
            var P = function () {
                function P(S) {
                    var P = this;
                    this["friends"] = [],
                        this["sortlist"] = [],
                        this.me = S,
                        this.me["visible"] = !1,
                        this["blackbg"] = S["getChildByName"]("blackbg"),
                        this["blackbg"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            P["locking"] || P["close"]();
                        }, null, !1),
                        this.root = S["getChildByName"]("root"),
                        this["scrollview"] = this.root["scriptMap"]["capsui.CScrollView"],
                        this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, this["render_item"], null, !1)),
                        this["noinfo"] = this.root["getChildByName"]("noinfo");
                }
                return P["prototype"].show = function () {
                    var P = this;
                    this["locking"] = !0,
                        this.me["visible"] = !0,
                        this["scrollview"]["reset"](),
                        this["friends"] = [],
                        this["sortlist"] = [];
                    for (var m = game["FriendMgr"]["friend_list"], B = 0; B < m["length"]; B++)
                        this["sortlist"].push(B);
                    this["sortlist"] = this["sortlist"].sort(function (S, P) {
                        var B = m[S],
                            J = 0;
                        if (B["state"]["is_online"]) {
                            var L = game["Tools"]["playState2Desc"](B["state"]["playing"]);
                            J += '' != L ? 30000000000 : 60000000000,
                                B.base["level"] && (J += B.base["level"].id % 1000 * 10000000),
                                B.base["level3"] && (J += B.base["level3"].id % 1000 * 10000),
                                J += -Math["floor"](B["state"]["login_time"] / 10000000);
                        } else
                            J += B["state"]["logout_time"];
                        var w = m[P],
                            h = 0;
                        if (w["state"]["is_online"]) {
                            var L = game["Tools"]["playState2Desc"](w["state"]["playing"]);
                            h += '' != L ? 30000000000 : 60000000000,
                                w.base["level"] && (h += w.base["level"].id % 1000 * 10000000),
                                w.base["level3"] && (h += w.base["level3"].id % 1000 * 10000),
                                h += -Math["floor"](w["state"]["login_time"] / 10000000);
                        } else
                            h += w["state"]["logout_time"];
                        return h - J;
                    });
                    for (var B = 0; B < m["length"]; B++)
                        this["friends"].push({
                            f: m[B],
                            invited: !1
                        });
                    this["noinfo"]["visible"] = 0 == this["friends"]["length"],
                        this["scrollview"]["addItem"](this["friends"]["length"]),
                        S["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                            P["locking"] = !1;
                        }));
                },
                    P["prototype"]["close"] = function () {
                        var P = this;
                        this["locking"] = !0,
                            S["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                P["locking"] = !1,
                                    P.me["visible"] = !1;
                            }));
                    },
                    P["prototype"]["render_item"] = function (P) {
                        var m = P["index"],
                            B = P["container"],
                            L = P["cache_data"];
                        L.head || (L.head = new S["UI_Head"](B["getChildByName"]("head"), "UI_WaitingRoom"), L.name = B["getChildByName"]("name"), L["state"] = B["getChildByName"]("label_state"), L.btn = B["getChildByName"]("btn_invite"), L["invited"] = B["getChildByName"]("invited"));
                        var w = this["friends"][this["sortlist"][m]];
                        L.head.id = game["GameUtility"]["get_limited_skin_id"](w.f.base["avatar_id"]),
                            L.head["set_head_frame"](w.f.base["account_id"], w.f.base["avatar_frame"]),
                            game["Tools"]["SetNickname"](L.name, w.f.base);
                        var h = !1;
                        if (w.f["state"]["is_online"]) {
                            var s = game["Tools"]["playState2Desc"](w.f["state"]["playing"]);
                            '' != s ? (L["state"].text = game["Tools"]["strOfLocalization"](2069, [s]), L["state"]["color"] = "#a9d94d", L.name["color"] = "#a9d94d") : (L["state"].text = game["Tools"]["strOfLocalization"](2071), L["state"]["color"] = "#58c4db", L.name["color"] = "#58c4db", h = !0);
                        } else
                            L["state"].text = game["Tools"]["strOfLocalization"](2072), L["state"]["color"] = "#8c8c8c", L.name["color"] = "#8c8c8c";
                        w["invited"] ? (L.btn["visible"] = !1, L["invited"]["visible"] = !0) : (L.btn["visible"] = !0, L["invited"]["visible"] = !1, game["Tools"]["setGrayDisable"](L.btn, !h), h && (L.btn["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            game["Tools"]["setGrayDisable"](L.btn, !0);
                            var P = {
                                room_id: J.Inst["room_id"],
                                mode: J.Inst["room_mode"],
                                nickname: GameMgr.Inst["account_data"]["nickname"],
                                verified: GameMgr.Inst["account_data"]["verified"],
                                account_id: GameMgr.Inst["account_id"]
                            };
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "sendClientMessage", {
                                target_id: w.f.base["account_id"],
                                type: game["EFriendMsgType"]["room_invite"],
                                content: JSON["stringify"](P)
                            }, function (P, m) {
                                P || m["error"] ? (game["Tools"]["setGrayDisable"](L.btn, !1), S["UIMgr"].Inst["showNetReqError"]("sendClientMessage", P, m)) : (L.btn["visible"] = !1, L["invited"]["visible"] = !0, w["invited"] = !0);
                            });
                        }, null, !1)));
                    },
                    P;
            }
                (),
                m = function () {
                    function P(P) {
                        var m = this;
                        this.tabs = [],
                            this["tab_index"] = 0,
                            this.me = P,
                            this["blackmask"] = this.me["getChildByName"]("blackmask"),
                            this.root = this.me["getChildByName"]("root"),
                            this["page_head"] = new S["zhuangban"]["Page_Waiting_Head"](this.root["getChildByName"]("container_heads")),
                            this["page_zhangban"] = new S["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function () {
                                return m["locking"];
                            }));
                        for (var B = this.root["getChildByName"]("container_tabs"), J = function (P) {
                            L.tabs.push(B["getChildAt"](P)),
                                L.tabs[P]["clickHandler"] = new Laya["Handler"](L, function () {
                                    m["locking"] || m["tab_index"] != P && (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                        m["change_tab"](P);
                                    }), null) : m["change_tab"](P));
                                });
                        }, L = this, w = 0; w < B["numChildren"]; w++)
                            J(w);
                        this.root["getChildByName"]("close")["clickHandler"] = new Laya["Handler"](this, function () {
                            m["locking"] || (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                m["close"](!1);
                            }), null) : m["close"](!1));
                        }),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function () {
                                m["locking"] || (1 == m["tab_index"] && m["page_zhangban"]["changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](m, function () {
                                    m["close"](!1);
                                }), null) : m["close"](!1));
                            });
                    }
                    return P["prototype"].show = function () {
                        var P = this;
                        this.me["visible"] = !0,
                            this["blackmask"]["alpha"] = 0,
                            this["locking"] = !0,
                            Laya["Tween"].to(this["blackmask"], {
                                alpha: 0.3
                            }, 150),
                            S["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                P["locking"] = !1;
                            })),
                            this["tab_index"] = 0,
                            this["page_zhangban"]["close"](!0),
                            this["page_head"].show(!0);
                        for (var m = 0; m < this.tabs["length"]; m++) {
                            var B = this.tabs[m];
                            B.skin = game["Tools"]["localUISrc"](m == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                            var J = B["getChildByName"]("word");
                            J["color"] = m == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                J["scaleX"] = J["scaleY"] = m == this["tab_index"] ? 1.1 : 1,
                                m == this["tab_index"] && B["parent"]["setChildIndex"](B, this.tabs["length"] - 1);
                        }
                    },
                        P["prototype"]["change_tab"] = function (S) {
                            var P = this;
                            this["tab_index"] = S;
                            for (var m = 0; m < this.tabs["length"]; m++) {
                                var B = this.tabs[m];
                                B.skin = game["Tools"]["localUISrc"](m == S ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var J = B["getChildByName"]("word");
                                J["color"] = m == S ? "#552c1c" : "#d3a86c",
                                    J["scaleX"] = J["scaleY"] = m == S ? 1.1 : 1,
                                    m == S && B["parent"]["setChildIndex"](B, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["page_zhangban"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    P["page_head"].show(!1);
                                })) : 1 == this["tab_index"] && (this["page_head"]["close"](!1), Laya["timer"].once(200, this, function () {
                                    P["page_zhangban"].show(!1);
                                })),
                                Laya["timer"].once(400, this, function () {
                                    P["locking"] = !1;
                                });
                        },
                        P["prototype"]["close"] = function (P) {
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
                            this.me["visible"] && (P ? (this["page_head"]["close"](!0), this["page_zhangban"]["close"](!0), this.me["visible"] = !1) : (app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: J.Inst["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this["locking"] = !0, this["page_head"]["close"](!1), this["page_zhangban"]["close"](!1), S["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                m["locking"] = !1,
                                    m.me["visible"] = !1;
                            }))));
                        },
                        P;
                }
                    (),
                B = function () {
                    function S(S) {
                        this["modes"] = [],
                            this.me = S,
                            this.bg = this.me["getChildByName"]('bg'),
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]));
                    }
                    return S["prototype"].show = function (S) {
                        this.me["visible"] = !0,
                            this["scrollview"]["reset"](),
                            this["modes"] = S,
                            this["scrollview"]["addItem"](S["length"]);
                        var P = this["scrollview"]["total_height"];
                        P > 380 ? (this["scrollview"]["_content"].y = 10, this.bg["height"] = 400) : (this["scrollview"]["_content"].y = 390 - P, this.bg["height"] = P + 20),
                            this.bg["visible"] = !0;
                    },
                        S["prototype"]["render_item"] = function (S) {
                            var P = S["index"],
                                m = S["container"],
                                B = m["getChildByName"]("info");
                            B["fontSize"] = 40,
                                B["fontSize"] = this["modes"][P]["length"] <= 5 ? 40 : this["modes"][P]["length"] <= 9 ? 55 - 3 * this["modes"][P]["length"] : 28,
                                B.text = this["modes"][P];
                        },
                        S;
                }
                    (),
                J = function (J) {
                    function L() {
                        var P = J.call(this, new ui["lobby"]["waitingroomUI"]()) || this;
                        return P["skin_ready"] = "myres/room/btn_ready.png",
                            P["skin_cancel"] = "myres/room/btn_cancel.png",
                            P["skin_start"] = "myres/room/btn_start.png",
                            P["skin_start_no"] = "myres/room/btn_start_no.png",
                            P["update_seq"] = 0,
                            P["pre_msgs"] = [],
                            P["msg_tail"] = -1,
                            P["posted"] = !1,
                            P["label_rommid"] = null,
                            P["player_cells"] = [],
                            P["btn_ok"] = null,
                            P["btn_invite_friend"] = null,
                            P["btn_add_robot"] = null,
                            P["btn_dress"] = null,
                            P["beReady"] = !1,
                            P["room_id"] = -1,
                            P["owner_id"] = -1,
                            P["tournament_id"] = 0,
                            P["max_player_count"] = 0,
                            P["players"] = [],
                            P["container_rules"] = null,
                            P["container_top"] = null,
                            P["container_right"] = null,
                            P["locking"] = !1,
                            P["mousein_copy"] = !1,
                            P["popout"] = null,
                            P["room_link"] = null,
                            P["btn_copy_link"] = null,
                            P["last_start_room"] = 0,
                            P["invitefriend"] = null,
                            P["pre_choose"] = null,
                            P["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                            L.Inst = P,
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerReady", Laya["Handler"]["create"](P, function (S) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON["stringify"](S)),
                                    P["onReadyChange"](S["account_id"], S["ready"], S["dressing"]);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerUpdate", Laya["Handler"]["create"](P, function (S) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON["stringify"](S)),
                                    P["onPlayerChange"](S);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomGameStart", Laya["Handler"]["create"](P, function (S) {
                                P["enable"] && (app.Log.log("NotifyRoomGameStart:" + JSON["stringify"](S)), GameMgr.Inst["onPipeiYuyueSuccess"](0, "youren"), P["onGameStart"](S));
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomKickOut", Laya["Handler"]["create"](P, function (S) {
                                app.Log.log("NotifyRoomKickOut:" + JSON["stringify"](S)),
                                    P["onBeKictOut"]();
                            })),
                            game["LobbyNetMgr"].Inst["add_connect_listener"](Laya["Handler"]["create"](P, function () {
                                P["enable"] && P.hide(Laya["Handler"]["create"](P, function () {
                                    S["UI_Lobby"].Inst["enable"] = !0;
                                }));
                            }, null, !1)),
                            P;
                    }
                    return __extends(L, J),
                        L["prototype"]["push_msg"] = function (S) {
                            this["pre_msgs"]["length"] < 15 ? this["pre_msgs"].push(JSON["parse"](S)) : (this["msg_tail"] = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], this["pre_msgs"][this["msg_tail"]] = JSON["parse"](S));
                        },
                        Object["defineProperty"](L["prototype"], "inRoom", {
                            get: function () {
                                return -1 != this["room_id"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object["defineProperty"](L["prototype"], "robot_count", {
                            get: function () {
                                for (var S = 0, P = 0; P < this["players"]["length"]; P++)
                                    2 == this["players"][P]["category"] && S++;
                                return S;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        L["prototype"]["resetData"] = function () {
                            this["room_id"] = -1,
                                this["owner_id"] = -1,
                                this["room_mode"] = {},
                                this["max_player_count"] = 0,
                                this["players"] = [];
                        },
                        L["prototype"]["updateData"] = function (S) {
                            if (!S)
                                return this["resetData"](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < S.persons.length; i++) {

                                if (S.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    S.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    S.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    S.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    S.persons[i].title = GameMgr.Inst.account_data.title;
                                    S.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        S.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this["room_id"] = S["room_id"],
                                this["owner_id"] = S["owner_id"],
                                this["room_mode"] = S.mode,
                                this["public_live"] = S["public_live"],
                                this["tournament_id"] = 0,
                                S["tournament_id"] && (this["tournament_id"] = S["tournament_id"]),
                                this["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                                this["room_mode"]["detail_rule"] && (1 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2003)), 2 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2004))),
                                this["max_player_count"] = S["max_player_count"],
                                this["players"] = [];
                            for (var P = 0; P < S["persons"]["length"]; P++) {
                                var m = S["persons"][P];
                                m["ready"] = !1,
                                    m["cell_index"] = -1,
                                    m["category"] = 1,
                                    this["players"].push(m);
                            }
                            for (var P = 0; P < S["robot_count"]; P++)
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
                            for (var P = 0; P < S["ready_list"]["length"]; P++)
                                for (var B = 0; B < this["players"]["length"]; B++)
                                    if (this["players"][B]["account_id"] == S["ready_list"][P]) {
                                        this["players"][B]["ready"] = !0;
                                        break;
                                    }
                            this["update_seq"] = 0,
                                S.seq && (this["update_seq"] = S.seq);
                        },
                        L["prototype"]["onReadyChange"] = function (S, P, m) {
                            for (var B = 0; B < this["players"]["length"]; B++)
                                if (this["players"][B]["account_id"] == S) {
                                    this["players"][B]["ready"] = P,
                                        this["players"][B]["dressing"] = m,
                                        this["_onPlayerReadyChange"](this["players"][B]);
                                    break;
                                }
                            this["refreshStart"]();
                        },
                        L["prototype"]["onPlayerChange"] = function (S) {
                            if (app.Log.log(S), S = S["toJSON"](), !(S.seq && S.seq <= this["update_seq"])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < Q.player_list.length; i++) {

                                    if (S.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        S.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        S.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        S.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            S.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (S.update_list != undefined) {
                                    for (var i = 0; i < S.update_list.length; i++) {

                                        if (S.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            S.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            S.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            S.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                S.update_list[i].nickname = MMP.settings.nickname;
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
                                this["update_seq"] = S.seq;
                                var P = {};
                                P.type = "onPlayerChange0",
                                    P["players"] = this["players"],
                                    P.msg = S,
                                    this["push_msg"](JSON["stringify"](P));
                                var m = this["robot_count"],
                                    B = S["robot_count"];
                                if (B < this["robot_count"]) {
                                    this["pre_choose"] && 2 == this["pre_choose"]["category"] && (this["pre_choose"]["category"] = 0, this["pre_choose"] = null, m--);
                                    for (var J = 0; J < this["players"]["length"]; J++)
                                        2 == this["players"][J]["category"] && m > B && (this["players"][J]["category"] = 0, m--);
                                }
                                for (var L = [], w = S["player_list"], J = 0; J < this["players"]["length"]; J++)
                                    if (1 == this["players"][J]["category"]) {
                                        for (var h = -1, s = 0; s < w["length"]; s++)
                                            if (w[s]["account_id"] == this["players"][J]["account_id"]) {
                                                h = s;
                                                break;
                                            }
                                        if (-1 != h) {
                                            var R = w[h];
                                            L.push(this["players"][J]),
                                                this["players"][J]["avatar_id"] = R["avatar_id"],
                                                this["players"][J]["title"] = R["title"],
                                                this["players"][J]["verified"] = R["verified"];
                                        }
                                    } else
                                        2 == this["players"][J]["category"] && L.push(this["players"][J]);
                                this["players"] = L;
                                for (var J = 0; J < w["length"]; J++) {
                                    for (var v = !1, R = w[J], s = 0; s < this["players"]["length"]; s++)
                                        if (1 == this["players"][s]["category"] && this["players"][s]["account_id"] == R["account_id"]) {
                                            v = !0;
                                            break;
                                        }
                                    v || this["players"].push({
                                        account_id: R["account_id"],
                                        avatar_id: R["avatar_id"],
                                        nickname: R["nickname"],
                                        verified: R["verified"],
                                        title: R["title"],
                                        level: R["level"],
                                        level3: R["level3"],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var f = [!1, !1, !1, !1], J = 0; J < this["players"]["length"]; J++)
                                    - 1 != this["players"][J]["cell_index"] && (f[this["players"][J]["cell_index"]] = !0, this["_refreshPlayerInfo"](this["players"][J]));
                                for (var J = 0; J < this["players"]["length"]; J++)
                                    if (1 == this["players"][J]["category"] && -1 == this["players"][J]["cell_index"])
                                        for (var s = 0; s < this["max_player_count"]; s++)
                                            if (!f[s]) {
                                                this["players"][J]["cell_index"] = s,
                                                    f[s] = !0,
                                                    this["_refreshPlayerInfo"](this["players"][J]);
                                                break;
                                            }
                                for (var m = this["robot_count"], B = S["robot_count"]; B > m;) {
                                    for (var A = -1, s = 0; s < this["max_player_count"]; s++)
                                        if (!f[s]) {
                                            A = s;
                                            break;
                                        }
                                    if (-1 == A)
                                        break;
                                    f[A] = !0,
                                        this["players"].push({
                                            category: 2,
                                            cell_index: A,
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
                                for (var J = 0; J < this["max_player_count"]; J++)
                                    f[J] || this["_clearCell"](J);
                                var P = {};
                                if (P.type = "onPlayerChange1", P["players"] = this["players"], this["push_msg"](JSON["stringify"](P)), S["owner_id"]) {
                                    if (this["owner_id"] = S["owner_id"], this["enable"])
                                        if (this["owner_id"] == GameMgr.Inst["account_id"])
                                            this["refreshAsOwner"]();
                                        else
                                            for (var s = 0; s < this["players"]["length"]; s++)
                                                if (this["players"][s] && this["players"][s]["account_id"] == this["owner_id"]) {
                                                    this["_refreshPlayerInfo"](this["players"][s]);
                                                    break;
                                                }
                                } else if (this["enable"])
                                    if (this["owner_id"] == GameMgr.Inst["account_id"])
                                        this["refreshAsOwner"]();
                                    else
                                        for (var s = 0; s < this["players"]["length"]; s++)
                                            if (this["players"][s] && this["players"][s]["account_id"] == this["owner_id"]) {
                                                this["_refreshPlayerInfo"](this["players"][s]);
                                                break;
                                            }
                            }
                        },
                        L["prototype"]["onBeKictOut"] = function () {
                            this["resetData"](),
                                this["enable"] && (this["enable"] = !1, this["pop_change_view"]["close"](!1), S["UI_Lobby"].Inst["enable"] = !0, S["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](52)));
                        },
                        L["prototype"]["onCreate"] = function () {
                            var J = this;
                            this["last_start_room"] = 0;
                            var L = this.me["getChildByName"]("root");
                            this["container_top"] = L["getChildByName"]("top"),
                                this["container_right"] = L["getChildByName"]("right"),
                                this["label_rommid"] = this["container_top"]["getChildByName"]("label_roomid");
                            for (var w = function (P) {
                                var m = L["getChildByName"]("player_" + P["toString"]()),
                                    B = {};
                                B["index"] = P,
                                    B["container"] = m,
                                    B["container_flag"] = m["getChildByName"]("flag"),
                                    B["container_flag"]["visible"] = !1,
                                    B["container_name"] = m["getChildByName"]("container_name"),
                                    B.name = m["getChildByName"]("container_name")["getChildByName"]("name"),
                                    B["btn_t"] = m["getChildByName"]("btn_t"),
                                    B["container_illust"] = m["getChildByName"]("container_illust"),
                                    B["illust"] = new S["UI_Character_Skin"](m["getChildByName"]("container_illust")["getChildByName"]("illust")),
                                    B.host = m["getChildByName"]("host"),
                                    B["title"] = new S["UI_PlayerTitle"](m["getChildByName"]("container_name")["getChildByName"]("title"), "UI_WaitingRoom"),
                                    B.rank = new S["UI_Level"](m["getChildByName"]("container_name")["getChildByName"]("rank"), "UI_WaitingRoom"),
                                    B["is_robot"] = !1;
                                var w = 0;
                                B["btn_t"]["clickHandler"] = Laya["Handler"]["create"](h, function () {
                                    if (!(J["locking"] || Laya["timer"]["currTimer"] < w)) {
                                        w = Laya["timer"]["currTimer"] + 500;
                                        for (var S = 0; S < J["players"]["length"]; S++)
                                            if (J["players"][S]["cell_index"] == P) {
                                                J["kickPlayer"](S);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    B["btn_info"] = m["getChildByName"]("btn_info"),
                                    B["btn_info"]["clickHandler"] = Laya["Handler"]["create"](h, function () {
                                        if (!J["locking"])
                                            for (var m = 0; m < J["players"]["length"]; m++)
                                                if (J["players"][m]["cell_index"] == P) {
                                                    J["players"][m]["account_id"] && J["players"][m]["account_id"] > 0 && S["UI_OtherPlayerInfo"].Inst.show(J["players"][m]["account_id"], J["room_mode"].mode < 10 ? 1 : 2, 1);
                                                    break;
                                                }
                                    }, null, !1),
                                    h["player_cells"].push(B);
                            }, h = this, s = 0; 4 > s; s++)
                                w(s);
                            this["btn_ok"] = L["getChildByName"]("btn_ok");
                            var R = 0;
                            this["btn_ok"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < R + 500 || (R = Laya["timer"]["currTimer"], J["owner_id"] == GameMgr.Inst["account_id"] ? J["getStart"]() : J["switchReady"]());
                            }, null, !1);
                            var v = 0;
                            this["container_top"]["getChildByName"]("btn_leave")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                Laya["timer"]["currTimer"] < v + 500 || (v = Laya["timer"]["currTimer"], J["leaveRoom"]());
                            }, null, !1),
                                this["btn_invite_friend"] = this["container_right"]["getChildByName"]("btn_friend"),
                                this["btn_invite_friend"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    J["locking"] || J["invitefriend"].show();
                                }, null, !1),
                                this["btn_add_robot"] = this["container_right"]["getChildByName"]("btn_robot");
                            var f = 0;
                            this["btn_add_robot"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                J["locking"] || Laya["timer"]["currTimer"] < f || (f = Laya["timer"]["currTimer"] + 1000, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: J["robot_count"] + 1
                                }, function (P, m) {
                                    (P || m["error"] && 1111 != m["error"].code) && S["UIMgr"].Inst["showNetReqError"]("modifyRoom_add", P, m),
                                        f = 0;
                                }));
                            }, null, !1),
                                this["container_right"]["getChildByName"]("btn_help")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (!J["locking"]) {
                                        var P = 0;
                                        J["room_mode"]["detail_rule"] && J["room_mode"]["detail_rule"]["chuanma"] && (P = 1),
                                            S["UI_Rules"].Inst.show(0, null, P);
                                    }
                                }, null, !1),
                                this["btn_dress"] = this["container_right"]["getChildByName"]("btn_view"),
                                this["btn_dress"]["clickHandler"] = new Laya["Handler"](this, function () {
                                    J["locking"] || J["beReady"] && J["owner_id"] != GameMgr.Inst["account_id"] || (J["pop_change_view"].show(), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                        ready: J["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                });
                            var A = this["container_right"]["getChildByName"]("btn_copy");
                            A.on("mouseover", this, function () {
                                J["mousein_copy"] = !0;
                            }),
                                A.on("mouseout", this, function () {
                                    J["mousein_copy"] = !1;
                                }),
                                A["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    J["popout"]["visible"] || (GameMgr.Inst["BehavioralStatistics"](12), J["popout"]["visible"] = !0, S["UIBase"]["anim_pop_out"](J["popout"], null));
                                }, null, !1),
                                this["container_rules"] = new B(this["container_right"]["getChildByName"]("container_rules")),
                                this["popout"] = this.me["getChildByName"]("pop"),
                                this["room_link"] = this["popout"]["getChildByName"]("input")["getChildByName"]("txtinput"),
                                this["room_link"]["editable"] = !1,
                                this["btn_copy_link"] = this["popout"]["getChildByName"]("btn_copy"),
                                this["btn_copy_link"]["visible"] = !1,
                                GameMgr["inConch"] ? (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    var P = Laya["PlatformClass"]["createClass"]("layaair.majsoul.mjmgr");
                                    P.call("setSysClipboardText", J["room_link"].text),
                                        S["UIBase"]["anim_pop_hide"](J["popout"], Laya["Handler"]["create"](J, function () {
                                            J["popout"]["visible"] = !1;
                                        })),
                                        S["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)) : GameMgr["iniOSWebview"] && (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    Laya["Browser"]["window"]["wkbridge"]["callNative"]("copy2clip", J["room_link"].text, function () { }),
                                        S["UIBase"]["anim_pop_hide"](J["popout"], Laya["Handler"]["create"](J, function () {
                                            J["popout"]["visible"] = !1;
                                        })),
                                        S["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)),
                                this["popout"]["visible"] = !1,
                                this["popout"]["getChildByName"]("btn_cancel")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    S["UIBase"]["anim_pop_hide"](J["popout"], Laya["Handler"]["create"](J, function () {
                                        J["popout"]["visible"] = !1;
                                    }));
                                }, null, !1),
                                this["invitefriend"] = new P(this.me["getChildByName"]("invite_friend")),
                                this["pop_change_view"] = new m(this.me["getChildByName"]("pop_view"));
                        },
                        L["prototype"].show = function () {
                            var P = this;
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
                            var B = {};
                            B.type = "show",
                                B["players"] = this["players"],
                                this["push_msg"](JSON["stringify"](B)),
                                this["owner_id"] == GameMgr.Inst["account_id"] ? (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]), this["refreshAsOwner"]()) : (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_ok"], !1)),
                                this["label_rommid"].text = 'en' == GameMgr["client_language"] ? '#' + this["room_id"]["toString"]() : this["room_id"]["toString"]();
                            var J = [];
                            J.push(game["Tools"]["room_mode_desc"](this["room_mode"].mode));
                            var L = this["room_mode"]["detail_rule"];
                            if (L) {
                                var w = 5,
                                    h = 20;
                                if (null != L["time_fixed"] && (w = L["time_fixed"]), null != L["time_add"] && (h = L["time_add"]), J.push(w["toString"]() + '+' + h["toString"]() + game["Tools"]["strOfLocalization"](2019)), 0 != this["tournament_id"]) {
                                    var s = cfg["tournament"]["tournaments"].get(this["tournament_id"]);
                                    s && J.push(s.name);
                                }
                                if (null != L["init_point"] && J.push(game["Tools"]["strOfLocalization"](2199) + L["init_point"]), null != L["fandian"] && J.push(game["Tools"]["strOfLocalization"](2094) + ':' + L["fandian"]), L["guyi_mode"] && J.push(game["Tools"]["strOfLocalization"](3028)), null != L["dora_count"])
                                    switch (L["chuanma"] && (L["dora_count"] = 0), L["dora_count"]) {
                                        case 0:
                                            J.push(game["Tools"]["strOfLocalization"](2044));
                                            break;
                                        case 2:
                                            J.push(game["Tools"]["strOfLocalization"](2047));
                                            break;
                                        case 3:
                                            J.push(game["Tools"]["strOfLocalization"](2045));
                                            break;
                                        case 4:
                                            J.push(game["Tools"]["strOfLocalization"](2046));
                                    }
                                null != L["shiduan"] && 1 != L["shiduan"] && J.push(game["Tools"]["strOfLocalization"](2137)),
                                    2 === L["fanfu"] && J.push(game["Tools"]["strOfLocalization"](2763)),
                                    4 === L["fanfu"] && J.push(game["Tools"]["strOfLocalization"](2764)),
                                    null != L["bianjietishi"] && 1 != L["bianjietishi"] && J.push(game["Tools"]["strOfLocalization"](2200)),
                                    this["room_mode"].mode >= 10 && this["room_mode"].mode <= 14 && (null != L["have_zimosun"] && 1 != L["have_zimosun"] ? J.push(game["Tools"]["strOfLocalization"](2202)) : J.push(game["Tools"]["strOfLocalization"](2203)));
                            }
                            this["container_rules"].show(J),
                                this["enable"] = !0,
                                this["locking"] = !0,
                                S["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200);
                            for (var m = 0; m < this["player_cells"]["length"]; m++)
                                S["UIBase"]["anim_alpha_in"](this["player_cells"][m]["container"], {
                                    x: 80
                                }, 150, 150 + 50 * m, null, Laya.Ease["backOut"]);
                            S["UIBase"]["anim_alpha_in"](this["btn_ok"], {}, 100, 600),
                                S["UIBase"]["anim_alpha_in"](this["container_right"], {
                                    x: 20
                                }, 100, 500),
                                Laya["timer"].once(600, this, function () {
                                    P["locking"] = !1;
                                });
                            var R = game["Tools"]["room_mode_desc"](this["room_mode"].mode);
                            this["room_link"].text = game["Tools"]["strOfLocalization"](2221, [this["room_id"]["toString"]()]),
                                '' != R && (this["room_link"].text += '(' + R + ')');
                            var v = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                            this["room_link"].text += ': ' + v + "?room=" + this["room_id"];
                        },
                        L["prototype"]["leaveRoom"] = function () {
                            var P = this;
                            this["locking"] || app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (m, B) {
                                m || B["error"] ? S["UIMgr"].Inst["showNetReqError"]("leaveRoom", m, B) : (P["room_id"] = -1, P.hide(Laya["Handler"]["create"](P, function () {
                                    S["UI_Lobby"].Inst["enable"] = !0;
                                })));
                            });
                        },
                        L["prototype"]["tryToClose"] = function (P) {
                            var m = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function (B, J) {
                                B || J["error"] ? (S["UIMgr"].Inst["showNetReqError"]("leaveRoom", B, J), P["runWith"](!1)) : (m["enable"] = !1, m["pop_change_view"]["close"](!0), P["runWith"](!0));
                            });
                        },
                        L["prototype"].hide = function (P) {
                            var m = this;
                            this["locking"] = !0,
                                S["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150);
                            for (var B = 0; B < this["player_cells"]["length"]; B++)
                                S["UIBase"]["anim_alpha_out"](this["player_cells"][B]["container"], {
                                    x: 80
                                }, 150, 0, null);
                            S["UIBase"]["anim_alpha_out"](this["btn_ok"], {}, 150),
                                S["UIBase"]["anim_alpha_out"](this["container_right"], {
                                    x: 20
                                }, 150),
                                Laya["timer"].once(200, this, function () {
                                    m["locking"] = !1,
                                        m["enable"] = !1,
                                        P && P.run();
                                }),
                                document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        L["prototype"]["onDisbale"] = function () {
                            Laya["timer"]["clearAll"](this);
                            for (var S = 0; S < this["player_cells"]["length"]; S++)
                                Laya["loader"]["clearTextureRes"](this["player_cells"][S]["illust"].skin);
                            document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        L["prototype"]["switchReady"] = function () {
                            this["owner_id"] != GameMgr.Inst["account_id"] && (this["beReady"] = !this["beReady"], this["btn_ok"].skin = game["Tools"]["localUISrc"](this["beReady"] ? this["skin_cancel"] : this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_dress"], this["beReady"]), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: this["beReady"],
                                dressing: !1
                            }, function () { }));
                        },
                        L["prototype"]["getStart"] = function () {
                            this["owner_id"] == GameMgr.Inst["account_id"] && (Laya["timer"]["currTimer"] < this["last_start_room"] + 2000 || (this["last_start_room"] = Laya["timer"]["currTimer"], app["NetAgent"]["sendReq2Lobby"]("Lobby", "startRoom", {}, function (P, m) {
                                (P || m["error"]) && S["UIMgr"].Inst["showNetReqError"]("startRoom", P, m);
                            })));
                        },
                        L["prototype"]["kickPlayer"] = function (P) {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                var m = this["players"][P];
                                1 == m["category"] ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "kickPlayer", {
                                    account_id: this["players"][P]["account_id"]
                                }, function () { }) : 2 == m["category"] && (this["pre_choose"] = m, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: this["robot_count"] - 1
                                }, function (P, m) {
                                    (P || m["error"]) && S["UIMgr"].Inst["showNetReqError"]("modifyRoom_minus", P, m);
                                }));
                            }
                        },
                        L["prototype"]["_clearCell"] = function (S) {
                            if (!(0 > S || S >= this["player_cells"]["length"])) {
                                var P = this["player_cells"][S];
                                P["container_flag"]["visible"] = !1,
                                    P["container_illust"]["visible"] = !1,
                                    P.name["visible"] = !1,
                                    P["container_name"]["visible"] = !1,
                                    P["btn_t"]["visible"] = !1,
                                    P.host["visible"] = !1;
                            }
                        },
                        L["prototype"]["_refreshPlayerInfo"] = function (S) {
                            var P = S["cell_index"];
                            if (!(0 > P || P >= this["player_cells"]["length"])) {
                                var m = this["player_cells"][P];
                                m["container_illust"]["visible"] = !0,
                                    m["container_name"]["visible"] = !0,
                                    m.name["visible"] = !0,
                                    game["Tools"]["SetNickname"](m.name, S),
                                    m["btn_t"]["visible"] = this["owner_id"] == GameMgr.Inst["account_id"] && S["account_id"] != GameMgr.Inst["account_id"],
                                    this["owner_id"] == S["account_id"] && (m["container_flag"]["visible"] = !0, m.host["visible"] = !0),
                                    S["account_id"] == GameMgr.Inst["account_id"] ? m["illust"]["setSkin"](S["avatar_id"], "waitingroom") : m["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](S["avatar_id"]), "waitingroom"),
                                    m["title"].id = game["Tools"]["titleLocalization"](S["account_id"], S["title"]),
                                    m.rank.id = S[this["room_mode"].mode < 10 ? "level" : "level3"].id,
                                    this["_onPlayerReadyChange"](S);
                            }
                        },
                        L["prototype"]["_onPlayerReadyChange"] = function (S) {
                            var P = S["cell_index"];
                            if (!(0 > P || P >= this["player_cells"]["length"])) {
                                var m = this["player_cells"][P];
                                m["container_flag"]["visible"] = this["owner_id"] == S["account_id"] ? !0 : S["ready"];
                            }
                        },
                        L["prototype"]["refreshAsOwner"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                for (var S = 0, P = 0; P < this["players"]["length"]; P++)
                                    0 != this["players"][P]["category"] && (this["_refreshPlayerInfo"](this["players"][P]), S++);
                                this["btn_add_robot"]["visible"] = !0,
                                    this["btn_invite_friend"]["visible"] = !0,
                                    game["Tools"]["setGrayDisable"](this["btn_invite_friend"], S == this["max_player_count"]),
                                    game["Tools"]["setGrayDisable"](this["btn_add_robot"], S == this["max_player_count"]),
                                    this["refreshStart"]();
                            }
                        },
                        L["prototype"]["refreshStart"] = function () {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]),
                                    game["Tools"]["setGrayDisable"](this["btn_dress"], !1);
                                for (var S = 0, P = 0; P < this["players"]["length"]; P++) {
                                    var m = this["players"][P];
                                    if (!m || 0 == m["category"])
                                        break;
                                    (m["account_id"] == this["owner_id"] || m["ready"]) && S++;
                                }
                                if (game["Tools"]["setGrayDisable"](this["btn_ok"], S != this["max_player_count"]), this["enable"]) {
                                    for (var B = 0, P = 0; P < this["max_player_count"]; P++) {
                                        var J = this["player_cells"][P];
                                        J && J["container_flag"]["visible"] && B++;
                                    }
                                    if (S != B && !this["posted"]) {
                                        this["posted"] = !0;
                                        var L = {};
                                        L["okcount"] = S,
                                            L["okcount2"] = B,
                                            L.msgs = [];
                                        var w = 0,
                                            h = this["pre_msgs"]["length"] - 1;
                                        if (-1 != this["msg_tail"] && (w = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], h = this["msg_tail"]), w >= 0 && h >= 0) {
                                            for (var P = w; P != h; P = (P + 1) % this["pre_msgs"]["length"])
                                                L.msgs.push(this["pre_msgs"][P]);
                                            L.msgs.push(this["pre_msgs"][h]);
                                        }
                                        GameMgr.Inst["postInfo2Server"]("waitroom_err2", L, !1);
                                    }
                                }
                            }
                        },
                        L["prototype"]["onGameStart"] = function (S) {
                            game["Tools"]["setGrayDisable"](this["btn_ok"], !0),
                                this["enable"] = !1,
                                game["MJNetMgr"].Inst["OpenConnect"](S["connect_token"], S["game_uuid"], S["location"], !1, null);
                        },
                        L["prototype"]["onEnable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !0);
                        },
                        L["prototype"]["onDisable"] = function () {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !1);
                        },
                        L.Inst = null,
                        L;
                }
                    (S["UIBase"]);
            S["UI_WaitingRoom"] = J;
        }
            (uiscript || (uiscript = {}));


        // 保存装扮
        !function (S) {
            var P;
            !function (P) {
                var m = function () {
                    function m(m, B, J) {
                        var L = this;
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
                            this["_locking"] = J,
                            this["container_zhuangban0"] = m,
                            this["container_zhuangban1"] = B;
                        var w = this["container_zhuangban0"]["getChildByName"]("tabs");
                        w["vScrollBarSkin"] = '';
                        for (var h = function (P) {
                            var m = w["getChildAt"](P);
                            s.tabs.push(m),
                                m["clickHandler"] = new Laya["Handler"](s, function () {
                                    L["locking"] || L["tab_index"] != P && (L["_changed"] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](L, function () {
                                        L["change_tab"](P);
                                    }), null) : L["change_tab"](P));
                                });
                        }, s = this, R = 0; R < w["numChildren"]; R++)
                            h(R);
                        this["page_items"] = new P["Page_Items"](this["container_zhuangban1"]["getChildByName"]("page_items"), this),
                            this["page_headframe"] = new P["Page_Headframe"](this["container_zhuangban1"]["getChildByName"]("page_headframe")),
                            this["page_bgm"] = new P["Page_Bgm"](this["container_zhuangban1"]["getChildByName"]("page_bgm"), this),
                            this["page_desktop"] = new P["Page_Desktop"](this["container_zhuangban1"]["getChildByName"]("page_zhuobu"), this),
                            this["scrollview"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_view"])),
                            this["scrollview"]["setElastic"](),
                            this["btn_using"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_using"),
                            this["btn_save"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_save"),
                            this["btn_save"]["clickHandler"] = new Laya["Handler"](this, function () {
                                for (var P = [], m = 0; m < L["cell_titles"]["length"]; m++) {
                                    var B = L["slot_ids"][m];
                                    if (L["slot_map"][B]) {
                                        var J = L["slot_map"][B];
                                        if (!(J["item_id"] && J["item_id"] != L["cell_default_item"][m] || J["item_id_list"] && 0 != J["item_id_list"]["length"]))
                                            continue;
                                        var w = [];
                                        if (J["item_id_list"])
                                            for (var h = 0, s = J["item_id_list"]; h < s["length"]; h++) {
                                                var R = s[h];
                                                R == L["cell_default_item"][m] ? w.push(0) : w.push(R);
                                            }
                                        P.push({
                                            slot: B,
                                            item_id: J["item_id"],
                                            type: J.type,
                                            item_id_list: w
                                        });
                                    }
                                }
                                L["btn_save"]["mouseEnabled"] = !1;
                                var v = L["tab_index"];
                                // START
                                // app["NetAgent"]["sendReq2Lobby"]("Lobby", "saveCommonViews", {
                                //     views: P,
                                //     save_index: v,
                                //     is_use: v == S["UI_Sushe"]["using_commonview_index"] ? 1 : 0
                                // }, function (m, B) {
                                //     if (L["btn_save"]["mouseEnabled"] = !0, m || B["error"])
                                //         S["UIMgr"].Inst["showNetReqError"]("saveCommonViews", m, B);
                                //     else {
                                if (S["UI_Sushe"]["commonViewList"]["length"] < v)
                                    for (var J = S["UI_Sushe"]["commonViewList"]["length"]; v >= J; J++)
                                        S["UI_Sushe"]["commonViewList"].push([]);
                                MMP.settings.commonViewList = S.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = S.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (S["UI_Sushe"]["commonViewList"][v] = P, S["UI_Sushe"]["using_commonview_index"] == v && L["onChangeGameView"](), L["tab_index"] != v)
                                    return;
                                L["btn_save"]["mouseEnabled"] = !0,
                                    L["_changed"] = !1,
                                    L["refresh_btn"]();
                                //    }
                                //    });
                            }),
                            this["btn_use"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_use"),
                            this["btn_use"]["clickHandler"] = new Laya["Handler"](this, function () {
                                L["btn_use"]["mouseEnabled"] = !1;
                                var P = L["tab_index"];
                                // 屏蔽更换装扮网络请求
                                // app["NetAgent"]["sendReq2Lobby"]("Lobby", "useCommonView", {
                                //     index: P
                                // }, function (m, B) {
                                //     L["btn_use"]["mouseEnabled"] = !0,
                                //     m || B["error"] ? S["UIMgr"].Inst["showNetReqError"]("useCommonView", m, B) : (
                                S["UI_Sushe"]["using_commonview_index"] = P, L["refresh_btn"](), L["refresh_tab"](), L["onChangeGameView"]();
                                // });
                            }),
                            this["random"] = this["container_zhuangban1"]["getChildByName"]("random"),
                            this["random_slider"] = this["random"]["getChildByName"]("slider"),
                            this["btn_random"] = this["random"]["getChildByName"]("btn"),
                            this["btn_random"]["clickHandler"] = new Laya["Handler"](this, function () {
                                L["onRandomBtnClick"]();
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
                        m["prototype"].show = function (P) {
                            game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !0),
                                this["container_zhuangban0"]["visible"] = !0,
                                this["container_zhuangban1"]["visible"] = !0,
                                P ? (this["container_zhuangban0"]["alpha"] = 1, this["container_zhuangban1"]["alpha"] = 1) : (S["UIBase"]["anim_alpha_in"](this["container_zhuangban0"], {
                                    x: 0
                                }, 200), S["UIBase"]["anim_alpha_in"](this["container_zhuangban1"], {
                                    x: 0
                                }, 200)),
                                this["change_tab"](S["UI_Sushe"]["using_commonview_index"]);
                        },
                        m["prototype"]["change_tab"] = function (P) {
                            if (this["tab_index"] = P, this["refresh_tab"](), this["slot_map"] = {}, this["scrollview"]["reset"](), this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["select_index"] = 0, this["_changed"] = !1, !(this["tab_index"] < 0 || this["tab_index"] > 9)) {
                                if (this["tab_index"] < S["UI_Sushe"]["commonViewList"]["length"])
                                    for (var m = S["UI_Sushe"]["commonViewList"][this["tab_index"]], B = 0; B < m["length"]; B++)
                                        this["slot_map"][m[B].slot] = m[B];
                                this["scrollview"]["addItem"](this["cell_titles"]["length"]),
                                    this["onChangeSlotSelect"](0),
                                    this["refresh_btn"]();
                            }
                        },
                        m["prototype"]["refresh_tab"] = function () {
                            for (var P = 0; P < this.tabs["length"]; P++) {
                                var m = this.tabs[P];
                                m["mouseEnabled"] = this["tab_index"] != P,
                                    m["getChildByName"]('bg').skin = game["Tools"]["localUISrc"](this["tab_index"] == P ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                    m["getChildByName"]("num")["color"] = this["tab_index"] == P ? "#2f1e19" : "#f2c797";
                                var B = m["getChildByName"]("choosed");
                                S["UI_Sushe"]["using_commonview_index"] == P ? (B["visible"] = !0, B.x = this["tab_index"] == P ? -18 : -4) : B["visible"] = !1;
                            }
                        },
                        m["prototype"]["refresh_btn"] = function () {
                            this["btn_save"]["visible"] = !1,
                                this["btn_save"]["mouseEnabled"] = !0,
                                this["btn_use"]["visible"] = !1,
                                this["btn_use"]["mouseEnabled"] = !0,
                                this["btn_using"]["visible"] = !1,
                                this["_changed"] ? this["btn_save"]["visible"] = !0 : (this["btn_use"]["visible"] = S["UI_Sushe"]["using_commonview_index"] != this["tab_index"], this["btn_using"]["visible"] = S["UI_Sushe"]["using_commonview_index"] == this["tab_index"]);
                        },
                        m["prototype"]["onChangeSlotSelect"] = function (S) {
                            var P = this;
                            this["select_index"] = S,
                                this["random"]["visible"] = !(6 == S || 9 == S);
                            var m = 0;
                            S >= 0 && S < this["cell_default_item"]["length"] && (m = this["cell_default_item"][S]);
                            var B = m,
                                J = this["slot_ids"][S],
                                L = !1,
                                w = [];
                            if (this["slot_map"][J]) {
                                var h = this["slot_map"][J];
                                w = h["item_id_list"],
                                    L = !!h.type,
                                    h["item_id"] && (B = this["slot_map"][J]["item_id"]),
                                    L && h["item_id_list"] && h["item_id_list"]["length"] > 0 && (B = h["item_id_list"][0]);
                            }
                            var s = Laya["Handler"]["create"](this, function (B) {
                                if (B == m && (B = 0), P["is_random"]) {
                                    var L = P["slot_map"][J]["item_id_list"]["indexOf"](B);
                                    L >= 0 ? P["slot_map"][J]["item_id_list"]["splice"](L, 1) : (P["slot_map"][J]["item_id_list"] && 0 != P["slot_map"][J]["item_id_list"]["length"] || (P["slot_map"][J]["item_id_list"] = []), P["slot_map"][J]["item_id_list"].push(B));
                                } else
                                    P["slot_map"][J] || (P["slot_map"][J] = {}), P["slot_map"][J]["item_id"] = B;
                                P["scrollview"]["wantToRefreshItem"](S),
                                    P["_changed"] = !0,
                                    P["refresh_btn"]();
                            }, null, !1);
                            this["page_items"]["close"](),
                                this["page_desktop"]["close"](),
                                this["page_headframe"]["close"](),
                                this["page_bgm"]["close"](),
                                this["is_random"] = L,
                                this["random_slider"].x = L ? 76 : -4,
                                this["random"]["getChildAt"](1)["visible"] = !this["is_random"],
                                this["random"]["getChildAt"](2)["visible"] = this["is_random"];
                            var R = game["Tools"]["strOfLocalization"](this["cell_titles"][S]);
                            if (S >= 0 && 2 >= S)
                                this["page_items"].show(R, S, B, s), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (3 == S)
                                this["page_items"].show(R, 10, B, s), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (4 == S)
                                this["page_items"].show(R, 3, B, s), this["setRandomGray"](!this["page_items"]["can_random"]());
                            else if (5 == S)
                                this["page_bgm"].show(R, B, s), this["setRandomGray"](!this["page_bgm"]["can_random"]());
                            else if (6 == S)
                                this["page_headframe"].show(R, B, s);
                            else if (7 == S || 8 == S) {
                                var v = this["cell_default_item"][7],
                                    f = this["cell_default_item"][8];
                                if (7 == S) {
                                    if (v = B, this["slot_map"][game["EView"].mjp]) {
                                        var A = this["slot_map"][game["EView"].mjp];
                                        A.type && A["item_id_list"] && A["item_id_list"]["length"] > 0 ? f = A["item_id_list"][0] : A["item_id"] && (f = A["item_id"]);
                                    }
                                    this["page_desktop"]["show_desktop"](R, v, f, s);
                                } else {
                                    if (f = B, this["slot_map"][game["EView"]["desktop"]]) {
                                        var A = this["slot_map"][game["EView"]["desktop"]];
                                        A.type && A["item_id_list"] && A["item_id_list"]["length"] > 0 ? v = A["item_id_list"][0] : A["item_id"] && (v = A["item_id"]);
                                    }
                                    this["page_desktop"]["show_mjp"](R, v, f, s);
                                }
                                this["setRandomGray"](!this["page_desktop"]["can_random"]());
                            } else
                                9 == S && this["page_desktop"]["show_lobby_bg"](R, B, s);
                        },
                        m["prototype"]["onRandomBtnClick"] = function () {
                            var S = this;
                            if (6 != this["select_index"] && 9 != this["select_index"]) {
                                this["_changed"] = !0,
                                    this["refresh_btn"](),
                                    this["is_random"] = !this["is_random"],
                                    this["random"]["getChildAt"](this["is_random"] ? 2 : 1)["visible"] = !0,
                                    Laya["Tween"].to(this["random_slider"], {
                                        x: this["is_random"] ? 76 : -4
                                    }, 100, null, Laya["Handler"]["create"](this, function () {
                                        S["random"]["getChildAt"](S["is_random"] ? 1 : 2)["visible"] = !1;
                                    }));
                                var P = this["select_index"],
                                    m = this["slot_ids"][P],
                                    B = 0;
                                P >= 0 && P < this["cell_default_item"]["length"] && (B = this["cell_default_item"][P]);
                                var J = B,
                                    L = [];
                                if (this["slot_map"][m]) {
                                    var w = this["slot_map"][m];
                                    L = w["item_id_list"],
                                        w["item_id"] && (J = this["slot_map"][m]["item_id"]);
                                }
                                if (P >= 0 && 4 >= P) {
                                    var h = this["slot_map"][m];
                                    h ? (h.type = h.type ? 0 : 1, h["item_id_list"] && 0 != h["item_id_list"]["length"] || (h["item_id_list"] = [h["item_id"]])) : this["slot_map"][m] = {
                                        type: 1,
                                        item_id_list: [this["page_items"]["items"][0]]
                                    },
                                        this["page_items"]["changeRandomState"](J);
                                } else if (5 == P) {
                                    var h = this["slot_map"][m];
                                    if (h)
                                        h.type = h.type ? 0 : 1, h["item_id_list"] && 0 != h["item_id_list"]["length"] || (h["item_id_list"] = [h["item_id"]]);
                                    else {
                                        this["slot_map"][m] = {
                                            type: 1,
                                            item_id_list: [this["page_bgm"]["items"][0]]
                                        };
                                    }
                                    this["page_bgm"]["changeRandomState"](J);
                                } else if (7 == P || 8 == P) {
                                    var h = this["slot_map"][m];
                                    if (h)
                                        h.type = h.type ? 0 : 1, h["item_id_list"] && 0 != h["item_id_list"]["length"] || (h["item_id_list"] = [h["item_id"]]);
                                    else {
                                        this["slot_map"][m] = {
                                            type: 1,
                                            item_id_list: [this["page_desktop"]["getFirstOwnedId"]()]
                                        };
                                    }
                                    this["page_desktop"]["changeRandomState"](J);
                                }
                                this["scrollview"]["wantToRefreshItem"](P);
                            }
                        },
                        m["prototype"]["render_view"] = function (S) {
                            var P = this,
                                m = S["container"],
                                B = S["index"],
                                J = m["getChildByName"]("cell");
                            this["select_index"] == B ? (J["scaleX"] = J["scaleY"] = 1.05, J["getChildByName"]("choosed")["visible"] = !0) : (J["scaleX"] = J["scaleY"] = 1, J["getChildByName"]("choosed")["visible"] = !1),
                                J["getChildByName"]("title").text = game["Tools"]["strOfLocalization"](this["cell_titles"][B]);
                            var L = J["getChildByName"]("name"),
                                w = J["getChildByName"]("icon"),
                                h = this["cell_default_item"][B],
                                s = this["slot_ids"][B],
                                R = !1;
                            if (this["slot_map"][s] && (R = this["slot_map"][s].type, this["slot_map"][s]["item_id"] && (h = this["slot_map"][s]["item_id"])), R)
                                L.text = game["Tools"]["strOfLocalization"](3752, ['' + this["slot_map"][s]["item_id_list"]["length"]]), game["LoadMgr"]["setImgSkin"](w, "myres/sushe/icon_random.jpg");
                            else {
                                var v = cfg["item_definition"].item.get(h);
                                v ? (L.text = v["name_" + GameMgr["client_language"]], game["LoadMgr"]["setImgSkin"](w, v.icon, null, "UI_Sushe_Select.Zhuangban")) : (L.text = game["Tools"]["strOfLocalization"](this["cell_names"][B]), game["LoadMgr"]["setImgSkin"](w, this["cell_default_img"][B], null, "UI_Sushe_Select.Zhuangban"));
                            }
                            var f = J["getChildByName"]("btn");
                            f["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["locking"] || P["select_index"] != B && (P["onChangeSlotSelect"](B), P["scrollview"]["wantToRefreshAll"]());
                            }, null, !1),
                                f["mouseEnabled"] = this["select_index"] != B;
                        },
                        m["prototype"]["close"] = function (P) {
                            var m = this;
                            this["container_zhuangban0"]["visible"] && (P ? (this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["container_zhuangban0"]["visible"] = !1, this["container_zhuangban1"]["visible"] = !1, game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1)) : (S["UIBase"]["anim_alpha_out"](this["container_zhuangban0"], {
                                x: 0
                            }, 200), S["UIBase"]["anim_alpha_out"](this["container_zhuangban1"], {
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
                            MMP.settings.using_commonview_index = S.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            S["UI_Sushe"]["randomDesktopID"](),
                                GameMgr.Inst["load_mjp_view"]();
                            var P = game["GameUtility"]["get_view_id"](game["EView"]["lobby_bg"]);
                            S["UI_Lite_Loading"].Inst.show(),
                                game["Scene_Lobby"].Inst["set_lobby_bg"](P, Laya["Handler"]["create"](this, function () {
                                    S["UI_Lite_Loading"].Inst["enable"] && S["UI_Lite_Loading"].Inst["close"]();
                                })),
                                GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_id"](game["EView"]["head_frame"]);
                        },
                        m["prototype"]["setRandomGray"] = function (P) {
                            this["btn_random"]["visible"] = !P,
                                this["random"]["filters"] = P ? [new Laya["ColorFilter"](S["GRAY_FILTER"])] : [];
                        },
                        m["prototype"]["getShowSlotInfo"] = function () {
                            return this["slot_map"][this["slot_ids"][this["select_index"]]];
                        },
                        m;
                }
                    ();
                P["Container_Zhuangban"] = m;
            }
                (P = S["zhuangban"] || (S["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));


        // 设置称号
        !function (S) {
            var P = function (P) {
                function m() {
                    var S = P.call(this, new ui["lobby"]["titlebookUI"]()) || this;
                    return S["_root"] = null,
                        S["_scrollview"] = null,
                        S["_blackmask"] = null,
                        S["_locking"] = !1,
                        S["_showindexs"] = [],
                        m.Inst = S,
                        S;
                }
                return __extends(m, P),
                    m.Init = function () {
                        var P = this;
                        // 获取称号
                        // app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchTitleList", {}, function (m, B) {
                        //     if (m || B["error"])
                        //         S["UIMgr"].Inst["showNetReqError"]("fetchTitleList", m, B);
                        //     else {
                        P["owned_title"] = [];
                        //         for (var J = 0; J < B["title_list"]["length"]; J++) {
                        //             var L = B["title_list"][J];
                        for (let title of cfg.item_definition.title.rows_) {
                            var L = title.id;
                            cfg["item_definition"]["title"].get(L) && P["owned_title"].push(L),
                                "600005" == L && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1),
                                L >= "600005" && "600015" >= L && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + L - "600005", 1);
                        }
                        //     }
                        // });
                    },
                    m["title_update"] = function (P) {
                        for (var m = 0; m < P["new_titles"]["length"]; m++)
                            cfg["item_definition"]["title"].get(P["new_titles"][m]) && this["owned_title"].push(P["new_titles"][m]), "600005" == P["new_titles"][m] && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1), P["new_titles"][m] >= "600005" && P["new_titles"][m] <= "600015" && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + P["new_titles"][m] - "600005", 1);
                        if (P["remove_titles"] && P["remove_titles"]["length"] > 0) {
                            for (var m = 0; m < P["remove_titles"]["length"]; m++) {
                                for (var B = P["remove_titles"][m], J = 0; J < this["owned_title"]["length"]; J++)
                                    if (this["owned_title"][J] == B) {
                                        this["owned_title"][J] = this["owned_title"][this["owned_title"]["length"] - 1],
                                            this["owned_title"].pop();
                                        break;
                                    }
                                B == GameMgr.Inst["account_data"]["title"] && (GameMgr.Inst["account_data"]["title"] = "600001", S["UI_Lobby"].Inst["enable"] && S["UI_Lobby"].Inst.top["refresh"](), S["UI_PlayerInfo"].Inst["enable"] && S["UI_PlayerInfo"].Inst["refreshBaseInfo"]());
                            }
                            this.Inst["enable"] && this.Inst.show();
                        }
                    },
                    m["prototype"]["onCreate"] = function () {
                        var P = this;
                        this["_root"] = this.me["getChildByName"]("root"),
                            this["_blackmask"] = new S["UI_BlackMask"](this.me["getChildByName"]("bmask"), Laya["Handler"]["create"](this, function () {
                                return P["_locking"];
                            }, null, !1), Laya["Handler"]["create"](this, this["close"], null, !1)),
                            this["_scrollview"] = this["_root"]["getChildByName"]("content")["scriptMap"]["capsui.CScrollView"],
                            this["_scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function (S) {
                                P["setItemValue"](S["index"], S["container"]);
                            }, null, !1)),
                            this["_root"]["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                P["_locking"] || (P["_blackmask"].hide(), P["close"]());
                            }, null, !1),
                            this["_noinfo"] = this["_root"]["getChildByName"]("noinfo");
                    },
                    m["prototype"].show = function () {
                        var P = this;
                        if (this["_locking"] = !0, this["enable"] = !0, this["_blackmask"].show(), m["owned_title"]["length"] > 0) {
                            this["_showindexs"] = [];
                            for (var B = 0; B < m["owned_title"]["length"]; B++)
                                this["_showindexs"].push(B);
                            this["_showindexs"] = this["_showindexs"].sort(function (S, P) {
                                var B = S,
                                    J = cfg["item_definition"]["title"].get(m["owned_title"][S]);
                                J && (B += 1000 * J["priority"]);
                                var L = P,
                                    w = cfg["item_definition"]["title"].get(m["owned_title"][P]);
                                return w && (L += 1000 * w["priority"]),
                                    L - B;
                            }),
                                this["_scrollview"]["reset"](),
                                this["_scrollview"]["addItem"](m["owned_title"]["length"]),
                                this["_scrollview"].me["visible"] = !0,
                                this["_noinfo"]["visible"] = !1;
                        } else
                            this["_noinfo"]["visible"] = !0, this["_scrollview"].me["visible"] = !1;
                        S["UIBase"]["anim_pop_out"](this["_root"], Laya["Handler"]["create"](this, function () {
                            P["_locking"] = !1;
                        }));
                    },
                    m["prototype"]["close"] = function () {
                        var P = this;
                        this["_locking"] = !0,
                            S["UIBase"]["anim_pop_hide"](this["_root"], Laya["Handler"]["create"](this, function () {
                                P["_locking"] = !1,
                                    P["enable"] = !1;
                            }));
                    },
                    m["prototype"]["onEnable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !0);
                    },
                    m["prototype"]["onDisable"] = function () {
                        game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !1),
                            this["_scrollview"]["reset"]();
                    },
                    m["prototype"]["setItemValue"] = function (S, P) {
                        var B = this;
                        if (this["enable"]) {
                            var J = m["owned_title"][this["_showindexs"][S]],
                                L = cfg["item_definition"]["title"].find(J);
                            game["LoadMgr"]["setImgSkin"](P["getChildByName"]("img_title"), L.icon, null, "UI_TitleBook"),
                                P["getChildByName"]("using")["visible"] = J == GameMgr.Inst["account_data"]["title"],
                                P["getChildByName"]("desc").text = L["desc_" + GameMgr["client_language"]];
                            var w = P["getChildByName"]("btn");
                            w["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                J != GameMgr.Inst["account_data"]["title"] ? (B["changeTitle"](S), P["getChildByName"]("using")["visible"] = !0) : (B["changeTitle"](-1), P["getChildByName"]("using")["visible"] = !1);
                            }, null, !1);
                            var h = P["getChildByName"]("time"),
                                s = P["getChildByName"]("img_title");
                            if (1 == L["unlock_type"]) {
                                var R = L["unlock_param"][0],
                                    v = cfg["item_definition"].item.get(R);
                                h.text = game["Tools"]["strOfLocalization"](3121) + v["expire_desc_" + GameMgr["client_language"]],
                                    h["visible"] = !0,
                                    s.y = 0;
                            } else
                                h["visible"] = !1, s.y = 10;
                        }
                    },
                    m["prototype"]["changeTitle"] = function (P) {
                        var B = this,
                            J = GameMgr.Inst["account_data"]["title"],
                            L = 0;
                        L = P >= 0 && P < this["_showindexs"]["length"] ? m["owned_title"][this["_showindexs"][P]] : "600001",
                            GameMgr.Inst["account_data"]["title"] = L;
                        for (var w = -1, h = 0; h < this["_showindexs"]["length"]; h++)
                            if (J == m["owned_title"][this["_showindexs"][h]]) {
                                w = h;
                                break;
                            }
                        S["UI_Lobby"].Inst["enable"] && S["UI_Lobby"].Inst.top["refresh"](),
                            S["UI_PlayerInfo"].Inst["enable"] && S["UI_PlayerInfo"].Inst["refreshBaseInfo"](),
                            -1 != w && this["_scrollview"]["wantToRefreshItem"](w),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = L;
                        MMP.saveSettings();
                        // app["NetAgent"]["sendReq2Lobby"]("Lobby", "useTitle", {
                        //     title: "600001" == L ? 0 : L
                        // }, function (m, L) {
                        //     (m || L["error"]) && (S["UIMgr"].Inst["showNetReqError"]("useTitle", m, L), GameMgr.Inst["account_data"]["title"] = J, S["UI_Lobby"].Inst["enable"] && S["UI_Lobby"].Inst.top["refresh"](), S["UI_PlayerInfo"].Inst["enable"] && S["UI_PlayerInfo"].Inst["refreshBaseInfo"](), B["enable"] && (P >= 0 && P < B["_showindexs"]["length"] && B["_scrollview"]["wantToRefreshItem"](P), w >= 0 && w < B["_showindexs"]["length"] && B["_scrollview"]["wantToRefreshItem"](w)));
                        // });
                    },
                    m.Inst = null,
                    m["owned_title"] = [],
                    m;
            }
                (S["UIBase"]);
            S["UI_TitleBook"] = P;
        }
            (uiscript || (uiscript = {}));


        // 友人房调整装扮
        !function (S) {
            var P;
            !function (P) {
                var m = function () {
                    function m(S) {
                        this["scrollview"] = null,
                            this["page_skin"] = null,
                            this["chara_infos"] = [],
                            this["choosed_chara_index"] = 0,
                            this["choosed_skin_id"] = 0,
                            this["star_char_count"] = 0,
                            this.me = S,
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this.me["getChildByName"]("left")["visible"] = !0, this.me["getChildByName"]("left_en")["visible"] = !1, this["scrollview"] = this.me["getChildByName"]("left")["scriptMap"]["capsui.CScrollView"]) : (this.me["getChildByName"]("left")["visible"] = !1, this.me["getChildByName"]("left_en")["visible"] = !0, this["scrollview"] = this.me["getChildByName"]("left_en")["scriptMap"]["capsui.CScrollView"]),
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                            this["scrollview"]["setElastic"](),
                            this["page_skin"] = new P["Page_Skin"](this.me["getChildByName"]("right"));
                    }
                    return m["prototype"].show = function (P) {
                        var m = this;
                        this.me["visible"] = !0,
                            P ? this.me["alpha"] = 1 : S["UIBase"]["anim_alpha_in"](this.me, {
                                x: 0
                            }, 200, 0),
                            this["choosed_chara_index"] = 0,
                            this["chara_infos"] = [];
                        for (var B = 0, J = S["UI_Sushe"]["star_chars"]; B < J["length"]; B++)
                            for (var L = J[B], w = 0; w < S["UI_Sushe"]["characters"]["length"]; w++)
                                if (!S["UI_Sushe"]["hidden_characters_map"][L] && S["UI_Sushe"]["characters"][w]["charid"] == L) {
                                    this["chara_infos"].push({
                                        chara_id: S["UI_Sushe"]["characters"][w]["charid"],
                                        skin_id: S["UI_Sushe"]["characters"][w].skin,
                                        is_upgraded: S["UI_Sushe"]["characters"][w]["is_upgraded"]
                                    }),
                                        S["UI_Sushe"]["main_character_id"] == S["UI_Sushe"]["characters"][w]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1);
                                    break;
                                }
                        this["star_char_count"] = this["chara_infos"]["length"];
                        for (var w = 0; w < S["UI_Sushe"]["characters"]["length"]; w++)
                            S["UI_Sushe"]["hidden_characters_map"][S["UI_Sushe"]["characters"][w]["charid"]] || -1 == S["UI_Sushe"]["star_chars"]["indexOf"](S["UI_Sushe"]["characters"][w]["charid"]) && (this["chara_infos"].push({
                                chara_id: S["UI_Sushe"]["characters"][w]["charid"],
                                skin_id: S["UI_Sushe"]["characters"][w].skin,
                                is_upgraded: S["UI_Sushe"]["characters"][w]["is_upgraded"]
                            }), S["UI_Sushe"]["main_character_id"] == S["UI_Sushe"]["characters"][w]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1));
                        this["choosed_skin_id"] = this["chara_infos"][this["choosed_chara_index"]]["skin_id"],
                            this["scrollview"]["reset"](),
                            this["scrollview"]["addItem"](this["chara_infos"]["length"]);
                        var h = this["chara_infos"][this["choosed_chara_index"]];
                        this["page_skin"].show(h["chara_id"], h["skin_id"], Laya["Handler"]["create"](this, function (S) {
                            m["choosed_skin_id"] = S,
                                h["skin_id"] = S,
                                m["scrollview"]["wantToRefreshItem"](m["choosed_chara_index"]);
                        }, null, !1));
                    },
                        m["prototype"]["render_character_cell"] = function (P) {
                            var m = this,
                                B = P["index"],
                                J = P["container"],
                                L = P["cache_data"];
                            L["index"] = B;
                            var w = this["chara_infos"][B];
                            L["inited"] || (L["inited"] = !0, L.skin = new S["UI_Character_Skin"](J["getChildByName"]("btn")["getChildByName"]("head")), L["bound"] = J["getChildByName"]("btn")["getChildByName"]("bound"));
                            var h = J["getChildByName"]("btn");
                            h["getChildByName"]("choose")["visible"] = B == this["choosed_chara_index"],
                                L.skin["setSkin"](w["skin_id"], "bighead"),
                                h["getChildByName"]("using")["visible"] = B == this["choosed_chara_index"],
                                h["getChildByName"]("label_name").text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].find(w["chara_id"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].find(w["chara_id"])["name_" + GameMgr["client_language"]],
                                h["getChildByName"]("star") && (h["getChildByName"]("star")["visible"] = B < this["star_char_count"]);
                            var s = cfg["item_definition"]["character"].get(w["chara_id"]);
                            'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? L["bound"].skin = s.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (w["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (w["is_upgraded"] ? "2.png" : ".png")) : s.ur ? (L["bound"].pos(-10, -2), L["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (w["is_upgraded"] ? "6.png" : "5.png"))) : (L["bound"].pos(4, 20), L["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (w["is_upgraded"] ? "4.png" : "3.png"))),
                                h["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (w["is_upgraded"] ? "2.png" : ".png")),
                                J["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                                    if (B != m["choosed_chara_index"]) {
                                        var S = m["choosed_chara_index"];
                                        m["choosed_chara_index"] = B,
                                            m["choosed_skin_id"] = w["skin_id"],
                                            m["page_skin"].show(w["chara_id"], w["skin_id"], Laya["Handler"]["create"](m, function (S) {
                                                m["choosed_skin_id"] = S,
                                                    w["skin_id"] = S,
                                                    L.skin["setSkin"](S, "bighead");
                                            }, null, !1)),
                                            m["scrollview"]["wantToRefreshItem"](S),
                                            m["scrollview"]["wantToRefreshItem"](B);
                                    }
                                });
                        },
                        m["prototype"]["close"] = function (P) {
                            var m = this;
                            if (this.me["visible"])
                                if (P)
                                    this.me["visible"] = !1;
                                else {
                                    var B = this["chara_infos"][this["choosed_chara_index"]];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    // B["chara_id"] != S["UI_Sushe"]["main_character_id"] && (app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                    //         character_id: B["chara_id"]
                                    //     }, function () {}), 
                                    S["UI_Sushe"]["main_character_id"] = B["chara_id"];
                                    // this["choosed_skin_id"] != GameMgr.Inst["account_data"]["avatar_id"] && app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                                    //     character_id: B["chara_id"],
                                    //     skin: this["choosed_skin_id"]
                                    // }, function () {});
                                    // END
                                    for (var J = 0; J < S["UI_Sushe"]["characters"]["length"]; J++)
                                        if (S["UI_Sushe"]["characters"][J]["charid"] == B["chara_id"]) {
                                            S["UI_Sushe"]["characters"][J].skin = this["choosed_skin_id"];
                                            break;
                                        }
                                    GameMgr.Inst["account_data"]["avatar_id"] = this["choosed_skin_id"],
                                        S["UI_Sushe"]["onMainSkinChange"](),
                                        S["UIBase"]["anim_alpha_out"](this.me, {
                                            x: 0
                                        }, 200, 0, Laya["Handler"]["create"](this, function () {
                                            m.me["visible"] = !1;
                                        }));
                                }
                        },
                        m;
                }
                    ();
                P["Page_Waiting_Head"] = m;
            }
                (P = S["zhuangban"] || (S["zhuangban"] = {}));
        }
            (uiscript || (uiscript = {}));


        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var S = GameMgr;
            var P = this;
            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountInfo", {}, function (m, B) {
                if (m || B["error"])
                    uiscript["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", m, B);
                else {
                    app.Log.log("UpdateAccount: " + JSON["stringify"](B)),
                        S.Inst["account_refresh_time"] = Laya["timer"]["currTimer"];
                    // 对局结束更新数据
                    B.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    B.account.title = GameMgr.Inst.account_data.title;
                    B.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        B.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var J in B["account"]) {
                        if (S.Inst["account_data"][J] = B["account"][J], "platform_diamond" == J)
                            for (var L = B["account"][J], w = 0; w < L["length"]; w++)
                                P["account_numerical_resource"][L[w].id] = L[w]["count"];
                        if ("skin_ticket" == J && (S.Inst["account_numerical_resource"]["100004"] = B["account"][J]), "platform_skin_ticket" == J)
                            for (var L = B["account"][J], w = 0; w < L["length"]; w++)
                                P["account_numerical_resource"][L[w].id] = L[w]["count"];
                    }
                    uiscript["UI_Lobby"].Inst["refreshInfo"](),
                        B["account"]["room_id"] && S.Inst["updateRoom"](),
                        "10102" === S.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_2"], 1),
                        "10103" === S.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_3"], 1);
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
        !function (S) {
            var P = function () {
                function P(S) {
                    var P = this;
                    this.me = S,
                        this.me["getChildByName"]("blackbg")["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                            P["locking"] || P.hide(null);
                        }),
                        this["title"] = this.me["getChildByName"]("title"),
                        this["input"] = this.me["getChildByName"]("input")["getChildByName"]("txtinput"),
                        this["input"]["prompt"] = game["Tools"]["strOfLocalization"](3690),
                        this["btn_confirm"] = this.me["getChildByName"]("btn_confirm"),
                        this["btn_cancel"] = this.me["getChildByName"]("btn_cancel"),
                        this.me["visible"] = !1,
                        this["btn_cancel"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            P["locking"] || P.hide(null);
                        }, null, !1),
                        this["container_hidename"] = this.me["getChildByName"]("hidename"),
                        this["sp_checkbox"] = this["container_hidename"]["getChildByName"]("checkbox")["getChildByName"]("checkbox");
                    var m = this["container_hidename"]["getChildByName"]('w0'),
                        B = this["container_hidename"]["getChildByName"]('w1');
                    B.x = m.x + m["textField"]["textWidth"] + 10,
                        this["container_hidename"]["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function () {
                            P["sp_checkbox"]["visible"] = !P["sp_checkbox"]["visible"],
                                P["refresh_share_uuid"]();
                        });
                }
                return P["prototype"]["show_share"] = function (P) {
                    var m = this;
                    this["title"].text = game["Tools"]["strOfLocalization"](2124),
                        this["sp_checkbox"]["visible"] = !1,
                        this["btn_confirm"]["visible"] = !1,
                        this["input"]["editable"] = !1,
                        this.uuid = P,
                        this["refresh_share_uuid"](),
                        this.me["visible"] = !0,
                        this["locking"] = !0,
                        this["container_hidename"]["visible"] = !0,
                        this["btn_confirm"]["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2127),
                        S["UIBase"]["anim_pop_out"](this.me, Laya["Handler"]["create"](this, function () {
                            m["locking"] = !1;
                        }));
                },
                    P["prototype"]["refresh_share_uuid"] = function () {
                        var S = game["Tools"]["encode_account_id"](GameMgr.Inst["account_id"]),
                            P = this.uuid,
                            m = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                        this["input"].text = this["sp_checkbox"]["visible"] ? game["Tools"]["strOfLocalization"](2126) + ': ' + m + "?paipu=" + game["Tools"]["EncodePaipuUUID"](P) + '_a' + S + '_2' : game["Tools"]["strOfLocalization"](2126) + ': ' + m + "?paipu=" + P + '_a' + S;
                    },
                    P["prototype"]["show_check"] = function () {
                        var P = this;
                        return S["UI_PiPeiYuYue"].Inst["enable"] ? (S["UI_Popout"]["PopOutNoTitle"](game["Tools"]["strOfLocalization"](204), null), void 0) : (this["title"].text = game["Tools"]["strOfLocalization"](2128), this["btn_confirm"]["visible"] = !0, this["container_hidename"]["visible"] = !1, this["btn_confirm"]["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2129), this["btn_confirm"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                            return P["input"].text ? (P.hide(Laya["Handler"]["create"](P, function () {
                                var S = P["input"].text["split"]('='),
                                    m = S[S["length"] - 1]["split"]('_'),
                                    B = 0;
                                m["length"] > 1 && (B = 'a' == m[1]["charAt"](0) ? game["Tools"]["decode_account_id"](parseInt(m[1]["substr"](1))) : parseInt(m[1]));
                                var J = 0;
                                if (m["length"] > 2) {
                                    var L = parseInt(m[2]);
                                    L && (J = L);
                                }
                                GameMgr.Inst["checkPaiPu"](m[0], B, J);
                            })), void 0) : (S["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](3690)), void 0);
                        }, null, !1), this["input"]["editable"] = !0, this["input"].text = '', this.me["visible"] = !0, this["locking"] = !0, S["UIBase"]["anim_pop_out"](this.me, Laya["Handler"]["create"](this, function () {
                            P["locking"] = !1;
                        })), void 0);
                    },
                    P["prototype"].hide = function (P) {
                        var m = this;
                        this["locking"] = !0,
                            S["UIBase"]["anim_pop_hide"](this.me, Laya["Handler"]["create"](this, function () {
                                m["locking"] = !1,
                                    m.me["visible"] = !1,
                                    P && P.run();
                            }));
                    },
                    P;
            }
                (),
                m = function () {
                    function P(S) {
                        var P = this;
                        this.me = S,
                            this["blackbg"] = S["getChildByName"]("blackbg"),
                            this.root = S["getChildByName"]("root"),
                            this["input"] = this.root["getChildByName"]("input")["getChildByName"]("txtinput"),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function () {
                                P["locking"] || P["close"]();
                            }),
                            this.root["getChildByName"]("btn_confirm")["clickHandler"] = new Laya["Handler"](this, function () {
                                P["locking"] || (game["Tools"]["calu_word_length"](P["input"].text) > 30 ? P["toolong"]["visible"] = !0 : (P["close"](), L["addCollect"](P.uuid, P["start_time"], P["end_time"], P["input"].text)));
                            }),
                            this["toolong"] = this.root["getChildByName"]("toolong");
                    }
                    return P["prototype"].show = function (P, m, B) {
                        var J = this;
                        this.uuid = P,
                            this["start_time"] = m,
                            this["end_time"] = B,
                            this.me["visible"] = !0,
                            this["locking"] = !0,
                            this["input"].text = '',
                            this["toolong"]["visible"] = !1,
                            this["blackbg"]["alpha"] = 0,
                            Laya["Tween"].to(this["blackbg"], {
                                alpha: 0.5
                            }, 150),
                            S["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function () {
                                J["locking"] = !1;
                            }));
                    },
                        P["prototype"]["close"] = function () {
                            var P = this;
                            this["locking"] = !0,
                                Laya["Tween"].to(this["blackbg"], {
                                    alpha: 0
                                }, 150),
                                S["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function () {
                                    P["locking"] = !1,
                                        P.me["visible"] = !1;
                                }));
                        },
                        P;
                }
                    ();
            S["UI_Pop_CollectInput"] = m;
            var B;
            !function (S) {
                S[S.ALL = 0] = "ALL",
                    S[S["FRIEND"] = 1] = "FRIEND",
                    S[S.RANK = 2] = "RANK",
                    S[S["MATCH"] = 4] = "MATCH",
                    S[S["COLLECT"] = 100] = "COLLECT";
            }
                (B || (B = {}));
            var J = function () {
                function P(S) {
                    this["uuid_list"] = [],
                        this.type = S,
                        this["reset"]();
                }
                return P["prototype"]["reset"] = function () {
                    this["count"] = 0,
                        this["true_count"] = 0,
                        this["have_more_paipu"] = !0,
                        this["uuid_list"] = [],
                        this["duringload"] = !1;
                },
                    P["prototype"]["loadList"] = function () {
                        var P = this;
                        if (!this["duringload"] && this["have_more_paipu"]) {
                            if (this["duringload"] = !0, this.type == B["COLLECT"]) {
                                for (var m = [], J = 0, w = 0; 10 > w; w++) {
                                    var h = this["count"] + w;
                                    if (h >= L["collect_lsts"]["length"])
                                        break;
                                    J++;
                                    var s = L["collect_lsts"][h];
                                    L["record_map"][s] || m.push(s),
                                        this["uuid_list"].push(s);
                                }
                                m["length"] > 0 ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecordsDetail", {
                                    uuid_list: m
                                }, function (B, w) {
                                    if (P["duringload"] = !1, L.Inst["onLoadStateChange"](P.type, !1), B || w["error"])
                                        S["UIMgr"].Inst["showNetReqError"]("fetchGameRecordsDetail", B, w);
                                    else if (app.Log.log(JSON["stringify"](w)), w["record_list"] && w["record_list"]["length"] == m["length"]) {
                                        for (var h = 0; h < w["record_list"]["length"]; h++) {
                                            var s = w["record_list"][h].uuid;
                                            L["record_map"][s] || (L["record_map"][s] = w["record_list"][h]);
                                        }
                                        P["count"] += J,
                                            P["count"] >= L["collect_lsts"]["length"] && (P["have_more_paipu"] = !1, L.Inst["onLoadOver"](P.type)),
                                            L.Inst["onLoadMoreLst"](P.type, J);
                                    } else
                                        P["have_more_paipu"] = !1, L.Inst["onLoadOver"](P.type);
                                }) : (this["duringload"] = !1, this["count"] += J, this["count"] >= L["collect_lsts"]["length"] && (this["have_more_paipu"] = !1, L.Inst["onLoadOver"](this.type)), L.Inst["onLoadMoreLst"](this.type, J));
                            } else
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecordList", {
                                    start: this["true_count"],
                                    count: 10,
                                    type: this.type
                                }, function (m, J) {
                                    if (P["duringload"] = !1, L.Inst["onLoadStateChange"](P.type, !1), m || J["error"])
                                        S["UIMgr"].Inst["showNetReqError"]("fetchGameRecordList", m, J);
                                    else if (app.Log.log(JSON["stringify"](J)), J["record_list"] && J["record_list"]["length"] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(J),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(J));
                                                }
                                            }));
                                            for (let record_list of J['record_list']) {
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
                                        for (var w = J["record_list"], h = 0, s = 0; s < w["length"]; s++) {
                                            var R = w[s].uuid;
                                            if (P.type == B.RANK && w[s]["config"] && w[s]["config"].meta) {
                                                var v = w[s]["config"].meta;
                                                if (v) {
                                                    var f = cfg["desktop"]["matchmode"].get(v["mode_id"]);
                                                    if (f && 5 == f.room)
                                                        continue;
                                                }
                                            }
                                            h++,
                                                P["uuid_list"].push(R),
                                                L["record_map"][R] || (L["record_map"][R] = w[s]);
                                        }
                                        P["count"] += h,
                                            P["true_count"] += w["length"],
                                            L.Inst["onLoadMoreLst"](P.type, h),
                                            P["have_more_paipu"] = !0;
                                    } else
                                        P["have_more_paipu"] = !1, L.Inst["onLoadOver"](P.type);
                                });
                            Laya["timer"].once(700, this, function () {
                                P["duringload"] && L.Inst["onLoadStateChange"](P.type, !0);
                            });
                        }
                    },
                    P["prototype"]["removeAt"] = function (S) {
                        for (var P = 0; P < this["uuid_list"]["length"] - 1; P++)
                            P >= S && (this["uuid_list"][P] = this["uuid_list"][P + 1]);
                        this["uuid_list"].pop(),
                            this["count"]--,
                            this["true_count"]--;
                    },
                    P;
            }
                (),
                L = function (L) {
                    function w() {
                        var S = L.call(this, new ui["lobby"]["paipuUI"]()) || this;
                        return S.top = null,
                            S["container_scrollview"] = null,
                            S["scrollview"] = null,
                            S["loading"] = null,
                            S.tabs = [],
                            S["pop_otherpaipu"] = null,
                            S["pop_collectinput"] = null,
                            S["label_collect_count"] = null,
                            S["noinfo"] = null,
                            S["locking"] = !1,
                            S["current_type"] = B.ALL,
                            w.Inst = S,
                            S;
                    }
                    return __extends(w, L),
                        w.init = function () {
                            var S = this;
                            this["paipuLst"][B.ALL] = new J(B.ALL),
                                this["paipuLst"][B["FRIEND"]] = new J(B["FRIEND"]),
                                this["paipuLst"][B.RANK] = new J(B.RANK),
                                this["paipuLst"][B["MATCH"]] = new J(B["MATCH"]),
                                this["paipuLst"][B["COLLECT"]] = new J(B["COLLECT"]),
                                this["collect_lsts"] = [],
                                this["record_map"] = {},
                                this["collect_info"] = {},
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCollectedGameRecordList", {}, function (P, m) {
                                    if (P || m["error"]);
                                    else {
                                        if (m["record_list"]) {
                                            for (var B = m["record_list"], J = 0; J < B["length"]; J++) {
                                                var L = {
                                                    uuid: B[J].uuid,
                                                    time: B[J]["end_time"],
                                                    remarks: B[J]["remarks"]
                                                };
                                                S["collect_lsts"].push(L.uuid),
                                                    S["collect_info"][L.uuid] = L;
                                            }
                                            S["collect_lsts"] = S["collect_lsts"].sort(function (P, m) {
                                                return S["collect_info"][m].time - S["collect_info"][P].time;
                                            });
                                        }
                                        m["record_collect_limit"] && (S["collect_limit"] = m["record_collect_limit"]);
                                    }
                                });
                        },
                        w["onAccountUpdate"] = function () {
                            this.Inst && this.Inst["enable"] && (this.Inst["label_collect_count"].text = this["collect_lsts"]["length"]["toString"]() + '/' + this["collect_limit"]["toString"]());
                        },
                        w["reset"] = function () {
                            this["paipuLst"][B.ALL] && this["paipuLst"][B.ALL]["reset"](),
                                this["paipuLst"][B["FRIEND"]] && this["paipuLst"][B["FRIEND"]]["reset"](),
                                this["paipuLst"][B.RANK] && this["paipuLst"][B.RANK]["reset"](),
                                this["paipuLst"][B["MATCH"]] && this["paipuLst"][B["MATCH"]]["reset"]();
                        },
                        w["addCollect"] = function (P, m, B, J) {
                            var L = this;
                            if (!this["collect_info"][P]) {
                                if (this["collect_lsts"]["length"] + 1 > this["collect_limit"])
                                    return S["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2767)), void 0;
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "addCollectedGameRecord", {
                                    uuid: P,
                                    remarks: J,
                                    start_time: m,
                                    end_time: B
                                }, function () { });
                                var h = {
                                    uuid: P,
                                    remarks: J,
                                    time: B
                                };
                                this["collect_info"][P] = h,
                                    this["collect_lsts"].push(P),
                                    this["collect_lsts"] = this["collect_lsts"].sort(function (S, P) {
                                        return L["collect_info"][P].time - L["collect_info"][S].time;
                                    }),
                                    S["UI_DesktopInfo"].Inst && S["UI_DesktopInfo"].Inst["enable"] && S["UI_DesktopInfo"].Inst["onCollectChange"](),
                                    w.Inst && w.Inst["enable"] && w.Inst["onCollectChange"](P, -1);
                            }
                        },
                        w["removeCollect"] = function (P) {
                            var m = this;
                            if (this["collect_info"][P]) {
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "removeCollectedGameRecord", {
                                    uuid: P
                                }, function () { }),
                                    delete this["collect_info"][P];
                                for (var B = -1, J = 0; J < this["collect_lsts"]["length"]; J++)
                                    if (this["collect_lsts"][J] == P) {
                                        this["collect_lsts"][J] = this["collect_lsts"][this["collect_lsts"]["length"] - 1],
                                            B = J;
                                        break;
                                    }
                                this["collect_lsts"].pop(),
                                    this["collect_lsts"] = this["collect_lsts"].sort(function (S, P) {
                                        return m["collect_info"][P].time - m["collect_info"][S].time;
                                    }),
                                    S["UI_DesktopInfo"].Inst && S["UI_DesktopInfo"].Inst["enable"] && S["UI_DesktopInfo"].Inst["onCollectChange"](),
                                    w.Inst && w.Inst["enable"] && w.Inst["onCollectChange"](P, B);
                            }
                        },
                        w["prototype"]["onCreate"] = function () {
                            var B = this;
                            this.top = this.me["getChildByName"]("top"),
                                this.top["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    B["locking"] || B["close"](Laya["Handler"]["create"](B, function () {
                                        S["UIMgr"].Inst["showLobby"]();
                                    }));
                                }, null, !1),
                                this["container_scrollview"] = this.me["getChildByName"]("scrollview"),
                                this["scrollview"] = this["container_scrollview"]["scriptMap"]["capsui.CScrollView"],
                                this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function (S) {
                                    B["setItemValue"](S["index"], S["container"]);
                                }, null, !1)),
                                this["scrollview"]["setElastic"](),
                                this["container_scrollview"].on("ratechange", this, function () {
                                    var S = w["paipuLst"][B["current_type"]];
                                    (1 - B["scrollview"].rate) * S["count"] < 3 && (S["duringload"] || (S["have_more_paipu"] ? S["loadList"]() : 0 == S["count"] && (B["noinfo"]["visible"] = !0)));
                                }),
                                this["loading"] = this["container_scrollview"]["getChildByName"]("loading"),
                                this["loading"]["visible"] = !1,
                                this["container_scrollview"]["getChildByName"]("checkother")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    B["pop_otherpaipu"].me["visible"] || B["pop_otherpaipu"]["show_check"]();
                                }, null, !1),
                                this.tabs = [];
                            for (var J = 0; 5 > J; J++)
                                this.tabs.push(this["container_scrollview"]["getChildByName"]("tabs")["getChildAt"](J)), this.tabs[J]["clickHandler"] = new Laya["Handler"](this, this["changeTab"], [J, !1]);
                            this["pop_otherpaipu"] = new P(this.me["getChildByName"]("pop_otherpaipu")),
                                this["pop_collectinput"] = new m(this.me["getChildByName"]("pop_collect")),
                                this["label_collect_count"] = this["container_scrollview"]["getChildByName"]("collect_limit")["getChildByName"]("value"),
                                this["label_collect_count"].text = "0/20",
                                this["noinfo"] = this["container_scrollview"]["getChildByName"]("noinfo");
                        },
                        w["prototype"].show = function () {
                            var P = this;
                            GameMgr.Inst["BehavioralStatistics"](20),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["pop_otherpaipu"].me["visible"] = !1,
                                this["pop_collectinput"].me["visible"] = !1,
                                S["UIBase"]["anim_alpha_in"](this.top, {
                                    y: -30
                                }, 200),
                                S["UIBase"]["anim_alpha_in"](this["container_scrollview"], {
                                    y: 30
                                }, 200),
                                this["locking"] = !0,
                                this["loading"]["visible"] = !1,
                                Laya["timer"].once(200, this, function () {
                                    P["locking"] = !1;
                                }),
                                this["changeTab"](0, !0),
                                this["label_collect_count"].text = w["collect_lsts"]["length"]["toString"]() + '/' + w["collect_limit"]["toString"]();
                        },
                        w["prototype"]["close"] = function (P) {
                            var m = this;
                            this["locking"] = !0,
                                S["UIBase"]["anim_alpha_out"](this.top, {
                                    y: -30
                                }, 150),
                                S["UIBase"]["anim_alpha_out"](this["container_scrollview"], {
                                    y: 30
                                }, 150),
                                Laya["timer"].once(150, this, function () {
                                    m["locking"] = !1,
                                        m["enable"] = !1,
                                        P && P.run();
                                });
                        },
                        w["prototype"]["changeTab"] = function (S, P) {
                            var m = [B.ALL, B.RANK, B["FRIEND"], B["MATCH"], B["COLLECT"]];
                            if (P || m[S] != this["current_type"]) {
                                if (this["loading"]["visible"] = !1, this["noinfo"]["visible"] = !1, this["current_type"] = m[S], this["current_type"] == B["COLLECT"] && w["paipuLst"][this["current_type"]]["reset"](), this["scrollview"]["reset"](), this["current_type"] != B["COLLECT"]) {
                                    var J = w["paipuLst"][this["current_type"]]["count"];
                                    J > 0 && this["scrollview"]["addItem"](J);
                                }
                                for (var L = 0; L < this.tabs["length"]; L++) {
                                    var h = this.tabs[L];
                                    h["getChildByName"]("img").skin = game["Tools"]["localUISrc"](S == L ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"),
                                        h["getChildByName"]("label_name")["color"] = S == L ? "#d9b263" : "#8cb65f";
                                }
                            }
                        },
                        w["prototype"]["setItemValue"] = function (P, m) {
                            var B = this;
                            if (this["enable"]) {
                                var J = w["paipuLst"][this["current_type"]];
                                if (J || !(P >= J["uuid_list"]["length"])) {
                                    for (var L = w["record_map"][J["uuid_list"][P]], h = 0; 4 > h; h++) {
                                        var s = m["getChildByName"]('p' + h["toString"]());
                                        if (h < L["result"]["players"]["length"]) {
                                            s["visible"] = !0;
                                            var R = s["getChildByName"]("chosen"),
                                                v = s["getChildByName"]("rank"),
                                                f = s["getChildByName"]("rank_word"),
                                                A = s["getChildByName"]("name"),
                                                u = s["getChildByName"]("score"),
                                                y = L["result"]["players"][h];
                                            u.text = y["part_point_1"] || '0';
                                            for (var e = 0, x = game["Tools"]["strOfLocalization"](2133), C = 0, g = !1, H = 0; H < L["accounts"]["length"]; H++)
                                                if (L["accounts"][H].seat == y.seat) {
                                                    e = L["accounts"][H]["account_id"],
                                                        x = L["accounts"][H]["nickname"],
                                                        C = L["accounts"][H]["verified"],
                                                        g = L["accounts"][H]["account_id"] == GameMgr.Inst["account_id"];
                                                    break;
                                                }
                                            game["Tools"]["SetNickname"](A, {
                                                account_id: e,
                                                nickname: x,
                                                verified: C
                                            }),
                                                R["visible"] = g,
                                                u["color"] = g ? "#ffc458" : "#b98930",
                                                A["getChildByName"]("name")["color"] = g ? "#dfdfdf" : "#a0a0a0",
                                                f["color"] = v["color"] = g ? "#57bbdf" : "#489dbc";
                                            var I = s["getChildByName"]("rank_word");
                                            if ('en' == GameMgr["client_language"])
                                                switch (h) {
                                                    case 0:
                                                        I.text = 'st';
                                                        break;
                                                    case 1:
                                                        I.text = 'nd';
                                                        break;
                                                    case 2:
                                                        I.text = 'rd';
                                                        break;
                                                    case 3:
                                                        I.text = 'th';
                                                }
                                        } else
                                            s["visible"] = !1;
                                    }
                                    var Q = new Date(1000 * L["end_time"]),
                                        i = '';
                                    i += Q["getFullYear"]() + '/',
                                        i += (Q["getMonth"]() < 9 ? '0' : '') + (Q["getMonth"]() + 1)["toString"]() + '/',
                                        i += (Q["getDate"]() < 10 ? '0' : '') + Q["getDate"]() + ' ',
                                        i += (Q["getHours"]() < 10 ? '0' : '') + Q["getHours"]() + ':',
                                        i += (Q["getMinutes"]() < 10 ? '0' : '') + Q["getMinutes"](),
                                        m["getChildByName"]("date").text = i,
                                        m["getChildByName"]("check")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            return B["locking"] ? void 0 : S["UI_PiPeiYuYue"].Inst["enable"] ? (S["UI_Popout"]["PopOutNoTitle"](game["Tools"]["strOfLocalization"](204), null), void 0) : (GameMgr.Inst["checkPaiPu"](L.uuid, GameMgr.Inst["account_id"], 0), void 0);
                                        }, null, !1),
                                        m["getChildByName"]("share")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            B["locking"] || B["pop_otherpaipu"].me["visible"] || (B["pop_otherpaipu"]["show_share"](L.uuid), GameMgr.Inst["BehavioralStatistics"](21));
                                        }, null, !1);
                                    var c = m["getChildByName"]("room"),
                                        j = game["Tools"]["get_room_desc"](L["config"]);
                                    c.text = j.text;
                                    var t = '';
                                    if (1 == L["config"]["category"])
                                        t = game["Tools"]["strOfLocalization"](2023);
                                    else if (4 == L["config"]["category"])
                                        t = game["Tools"]["strOfLocalization"](2025);
                                    else if (2 == L["config"]["category"]) {
                                        var p = L["config"].meta;
                                        if (p) {
                                            var N = cfg["desktop"]["matchmode"].get(p["mode_id"]);
                                            N && (t = N["room_name_" + GameMgr["client_language"]]);
                                        }
                                    }
                                    if (w["collect_info"][L.uuid]) {
                                        var W = w["collect_info"][L.uuid],
                                            q = m["getChildByName"]("remarks_info"),
                                            O = m["getChildByName"]("input"),
                                            K = O["getChildByName"]("txtinput"),
                                            F = m["getChildByName"]("btn_input"),
                                            E = !1,
                                            k = function () {
                                                E ? (q["visible"] = !1, O["visible"] = !0, K.text = q.text, F["visible"] = !1) : (q.text = W["remarks"] && '' != W["remarks"] ? game["Tools"]["strWithoutForbidden"](W["remarks"]) : t, q["visible"] = !0, O["visible"] = !1, F["visible"] = !0);
                                            };
                                        k(),
                                            F["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                                E = !0,
                                                    k();
                                            }, null, !1),
                                            K.on("blur", this, function () {
                                                E && (game["Tools"]["calu_word_length"](K.text) > 30 ? S["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2765)) : K.text != W["remarks"] && (W["remarks"] = K.text, app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCollectedGameRecordRemarks", {
                                                    uuid: L.uuid,
                                                    remarks: K.text
                                                }, function () { }))),
                                                    E = !1,
                                                    k();
                                            });
                                        var r = m["getChildByName"]("collect");
                                        r["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3248), Laya["Handler"]["create"](B, function () {
                                                w["removeCollect"](L.uuid);
                                            }));
                                        }, null, !1),
                                            r["getChildByName"]("img").skin = game["Tools"]["localUISrc"]("myres/lobby/collect_star.png");
                                    } else {
                                        m["getChildByName"]("input")["visible"] = !1,
                                            m["getChildByName"]("btn_input")["visible"] = !1,
                                            m["getChildByName"]("remarks_info")["visible"] = !0,
                                            m["getChildByName"]("remarks_info").text = t;
                                        var r = m["getChildByName"]("collect");
                                        r["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                            B["pop_collectinput"].show(L.uuid, L["start_time"], L["end_time"]);
                                        }, null, !1),
                                            r["getChildByName"]("img").skin = game["Tools"]["localUISrc"]("myres/lobby/collect_star_gray.png");
                                    }
                                }
                            }
                        },
                        w["prototype"]["onLoadStateChange"] = function (S, P) {
                            this["current_type"] == S && (this["loading"]["visible"] = P);
                        },
                        w["prototype"]["onLoadMoreLst"] = function (S, P) {
                            this["current_type"] == S && this["scrollview"]["addItem"](P);
                        },
                        w["prototype"]["onLoadOver"] = function (S) {
                            if (this["current_type"] == S) {
                                var P = w["paipuLst"][this["current_type"]];
                                0 == P["count"] && (this["noinfo"]["visible"] = !0);
                            }
                        },
                        w["prototype"]["onCollectChange"] = function (S, P) {
                            if (this["current_type"] == B["COLLECT"])
                                P >= 0 && (w["paipuLst"][B["COLLECT"]]["removeAt"](P), this["scrollview"]["delItem"](P));
                            else
                                for (var m = w["paipuLst"][this["current_type"]]["uuid_list"], J = 0; J < m["length"]; J++)
                                    if (m[J] == S) {
                                        this["scrollview"]["wantToRefreshItem"](J);
                                        break;
                                    }
                            this["label_collect_count"].text = w["collect_lsts"]["length"]["toString"]() + '/' + w["collect_limit"]["toString"]();
                        },
                        w.Inst = null,
                        w["paipuLst"] = {},
                        w["collect_lsts"] = [],
                        w["record_map"] = {},
                        w["collect_info"] = {},
                        w["collect_limit"] = 20,
                        w;
                }
                    (S["UIBase"]);
            S["UI_PaiPu"] = L;
        }
            (uiscript || (uiscript = {}));


        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var P = this;
            window.p2 = "DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP" + (window["pertinent3"] ? window["pertinent3"] : ''),
                view["BgmListMgr"].init(),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerTime", {}, function (S, m) {
                    S || m["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerTime", S, m) : P["server_time_delta"] = 1000 * m["server_time"] - Laya["timer"]["currTimer"];
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerSettings", {}, function (S, m) {
                    S || m["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerSettings", S, m) : (app.Log.log("fetchServerSettings: " + JSON["stringify"](m)), uiscript["UI_Recharge"]["open_payment"] = !1, uiscript["UI_Recharge"]["payment_info"] = '', uiscript["UI_Recharge"]["open_wx"] = !0, uiscript["UI_Recharge"]["wx_type"] = 0, uiscript["UI_Recharge"]["open_alipay"] = !0, uiscript["UI_Recharge"]["alipay_type"] = 0, m["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](m["settings"]), m["settings"]["nickname_setting"] && (P["nickname_replace_enable"] = !!m["settings"]["nickname_setting"]["enable"], P["nickname_replace_lst"] = m["settings"]["nickname_setting"]["nicknames"], P["nickname_replace_table"] = {})), uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = m["settings"]["allow_modify_nickname"]);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchConnectionInfo", {}, function (S, m) {
                    S || m["error"] || (P["client_endpoint"] = m["client_endpoint"]);
                }),
                app["PlayerBehaviorStatistic"].init(),
                this["account_data"]["nickname"] && this["fetch_login_info"](),
                uiscript["UI_Info"].Init(),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function (S) {
                    app.Log.log("NotifyAccountUpdate :" + JSON["stringify"](S));
                    var m = S["update"];
                    if (m) {
                        if (m["numerical"])
                            for (var B = 0; B < m["numerical"]["length"]; B++) {
                                var J = m["numerical"][B].id,
                                    L = m["numerical"][B]["final"];
                                switch (J) {
                                    case "100001":
                                        P["account_data"]["diamond"] = L;
                                        break;
                                    case "100002":
                                        P["account_data"].gold = L;
                                        break;
                                    case "100099":
                                        P["account_data"].vip = L,
                                            uiscript["UI_Recharge"].Inst && uiscript["UI_Recharge"].Inst["enable"] && uiscript["UI_Recharge"].Inst["refreshVipRedpoint"]();
                                }
                                (J >= "101001" || "102999" >= J) && (P["account_numerical_resource"][J] = L);
                            }
                        uiscript["UI_Sushe"]["on_data_updata"](m),
                            m["daily_task"] && uiscript["UI_Activity_Xuanshang"]["dataUpdate"](m["daily_task"]),
                            m["title"] && uiscript["UI_TitleBook"]["title_update"](m["title"]),
                            m["new_recharged_list"] && uiscript["UI_Recharge"]["on_new_recharge_refresh"](m),
                            (m["activity_task"] || m["activity_period_task"] || m["activity_random_task"] || m["activity_segment_task"]) && uiscript["UI_Activity"]["accountUpdate"](m),
                            m["activity_flip_task"] && uiscript["UI_Activity_Fanpai"]["onTaskDataUpdate"](m["activity_flip_task"]["progresses"]),
                            m["activity"] && (m["activity"]["friend_gift_data"] && uiscript["UI_Activity_Miaohui"]["updateFriendGiftData"](m["activity"]["friend_gift_data"]), m["activity"]["upgrade_data"] && uiscript["UI_Activity_Miaohui"]["updateUpgradeData"](m["activity"]["upgrade_data"]));
                    }
                }, null, !1)),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnotherLogin", Laya["Handler"]["create"](this, function () {
                    uiscript["UI_AnotherLogin"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountLogout", Laya["Handler"]["create"](this, function () {
                    uiscript["UI_Hanguplogout"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyClientMessage", Laya["Handler"]["create"](this, function (S) {
                    app.Log.log("收到消息：" + JSON["stringify"](S)),
                        S.type == game["EFriendMsgType"]["room_invite"] && uiscript["UI_Invite"]["onNewInvite"](S["content"]);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyServerSetting", Laya["Handler"]["create"](this, function (S) {
                    uiscript["UI_Recharge"]["open_payment"] = !1,
                        uiscript["UI_Recharge"]["payment_info"] = '',
                        uiscript["UI_Recharge"]["open_wx"] = !0,
                        uiscript["UI_Recharge"]["wx_type"] = 0,
                        uiscript["UI_Recharge"]["open_alipay"] = !0,
                        uiscript["UI_Recharge"]["alipay_type"] = 0,
                        S["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](S["settings"]), S["settings"]["nickname_setting"] && (P["nickname_replace_enable"] = !!S["settings"]["nickname_setting"]["enable"], P["nickname_replace_lst"] = S["settings"]["nickname_setting"]["nicknames"])),
                        uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = S["allow_modify_nickname"];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyVipLevelChange", Laya["Handler"]["create"](this, function (S) {
                    uiscript["UI_Sushe"]["send_gift_limit"] = S["gift_limit"],
                        game["FriendMgr"]["friend_max_count"] = S["friend_max_count"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["free_refresh"]["limit"] = S["zhp_free_refresh_limit"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["cost_refresh"]["limit"] = S["zhp_cost_refresh_limit"],
                        uiscript["UI_PaiPu"]["collect_limit"] = S["record_collect_limit"];
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAFKResult", new Laya["Handler"](this, function (S) {
                    uiscript["UI_Guajichenfa"].Inst.show(S);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyCaptcha", new Laya["Handler"](this, function (S) {
                    P["auth_check_id"] = S["check_id"],
                        P["auth_nc_retry_count"] = 0,
                        4 == S.type ? P["showNECaptcha"]() : 2 == S.type ? P["checkNc"]() : P["checkNvc"]();
                })),
                Laya["timer"].loop(360000, this, function () {
                    if (game["LobbyNetMgr"].Inst.isOK) {
                        var S = (Laya["timer"]["currTimer"] - P["_last_heatbeat_time"]) / 1000;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "heatbeat", {
                            no_operation_counter: S
                        }, function () { }),
                            S >= 3000 && uiscript["UI_Hanguplogout"].Inst.show();
                    }
                }),
                Laya["timer"].loop(1000, this, function () {
                    var S = Laya["stage"]["getMousePoint"]();
                    (S.x != P["_pre_mouse_point"].x || S.y != P["_pre_mouse_point"].y) && (P["clientHeatBeat"](), P["_pre_mouse_point"].x = S.x, P["_pre_mouse_point"].y = S.y);
                }),
                Laya["timer"].loop(1000, this, function () {
                    Laya["LocalStorage"]["setItem"]("dolllt", game["Tools"]["currentTime"]["toString"]());
                }),
                'kr' == GameMgr["client_type"] && Laya["timer"].loop(3600000, this, function () {
                    P["showKrTip"](!1, null);
                }),
                uiscript["UI_RollNotice"].init();
        }


        // 设置状态
        !function (S) {
            var P = function () {
                function S(P) {
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
                        S.Inst = this,
                        this.me = P,
                        this["_container_c0"] = this.me["getChildByName"]('c0');
                    for (var m = 0; 3 > m; m++)
                        this["_img_countdown_c0"].push(this["_container_c0"]["getChildByName"]("num" + m));
                    this["_container_c1"] = this.me["getChildByName"]('c1');
                    for (var m = 0; 3 > m; m++)
                        this["_img_countdown_c1"].push(this["_container_c1"]["getChildByName"]("num" + m));
                    for (var m = 0; 2 > m; m++)
                        this["_img_countdown_add"].push(this.me["getChildByName"]("plus")["getChildByName"]("add_" + m));
                    this["_img_countdown_plus"] = this.me["getChildByName"]("plus"),
                        this.me["visible"] = !1;
                }
                return Object["defineProperty"](S["prototype"], "timeuse", {
                    get: function () {
                        return this.me["visible"] ? Math["floor"]((Laya["timer"]["currTimer"] - this["_start"]) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    S["prototype"]["reset"] = function () {
                        this.me["visible"] = !1,
                            Laya["timer"]["clearAll"](this);
                    },
                    S["prototype"]["showCD"] = function (S, P) {
                        var m = this;
                        this.me["visible"] = !0,
                            this["_start"] = Laya["timer"]["currTimer"],
                            this._fix = Math["floor"](S / 1000),
                            this._add = Math["floor"](P / 1000),
                            this["_pre_sec"] = -1,
                            this["_pre_time"] = Laya["timer"]["currTimer"],
                            this["_show"](),
                            Laya["timer"]["frameLoop"](1, this, function () {
                                var S = Laya["timer"]["currTimer"] - m["_pre_time"];
                                m["_pre_time"] = Laya["timer"]["currTimer"],
                                    view["DesktopMgr"].Inst["timestoped"] ? m["_start"] += S : m["_show"]();
                            });
                    },
                    S["prototype"]["close"] = function () {
                        this["reset"]();
                    },
                    S["prototype"]["_show"] = function () {
                        var S = this._fix + this._add - this["timeuse"];
                        if (0 >= S)
                            return view["DesktopMgr"].Inst["OperationTimeOut"](), this["reset"](), void 0;
                        if (S != this["_pre_sec"]) {
                            if (this["_pre_sec"] = S, S > this._add) {
                                for (var P = (S - this._add)["toString"](), m = 0; m < this["_img_countdown_c0"]["length"]; m++)
                                    this["_img_countdown_c0"][m]["visible"] = m < P["length"];
                                if (3 == P["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[0] + ".png"), this["_img_countdown_c0"][2].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[2] + ".png")) : 2 == P["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[0] + ".png")) : this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/t_" + P[0] + ".png"), 0 != this._add) {
                                    this["_img_countdown_plus"]["visible"] = !0;
                                    for (var B = this._add["toString"](), m = 0; m < this["_img_countdown_add"]["length"]; m++) {
                                        var J = this["_img_countdown_add"][m];
                                        m < B["length"] ? (J["visible"] = !0, J.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + B[m] + ".png")) : J["visible"] = !1;
                                    }
                                } else {
                                    this["_img_countdown_plus"]["visible"] = !1;
                                    for (var m = 0; m < this["_img_countdown_add"]["length"]; m++)
                                        this["_img_countdown_add"][m]["visible"] = !1;
                                }
                            } else {
                                this["_img_countdown_plus"]["visible"] = !1;
                                for (var P = S["toString"](), m = 0; m < this["_img_countdown_c0"]["length"]; m++)
                                    this["_img_countdown_c0"][m]["visible"] = m < P["length"];
                                3 == P["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[0] + ".png"), this["_img_countdown_c0"][2].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[2] + ".png")) : 2 == P["length"] ? (this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[1] + ".png"), this["_img_countdown_c0"][1].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[0] + ".png")) : this["_img_countdown_c0"][0].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/number/at_" + P[0] + ".png");
                            }
                            if (S > 3) {
                                this["_container_c1"]["visible"] = !1;
                                for (var m = 0; m < this["_img_countdown_c0"]["length"]; m++)
                                    this["_img_countdown_c0"][m]["alpha"] = 1;
                                this["_img_countdown_plus"]["alpha"] = 1,
                                    this["_container_c0"]["alpha"] = 1,
                                    this["_container_c1"]["alpha"] = 1;
                            } else {
                                view["AudioMgr"]["PlayAudio"](205),
                                    this["_container_c1"]["visible"] = !0;
                                for (var m = 0; m < this["_img_countdown_c0"]["length"]; m++)
                                    this["_img_countdown_c0"][m]["alpha"] = 1;
                                this["_img_countdown_plus"]["alpha"] = 1,
                                    this["_container_c0"]["alpha"] = 1,
                                    this["_container_c1"]["alpha"] = 1;
                                for (var m = 0; m < this["_img_countdown_c1"]["length"]; m++)
                                    this["_img_countdown_c1"][m]["visible"] = this["_img_countdown_c0"][m]["visible"], this["_img_countdown_c1"][m].skin = game["Tools"]["localUISrc"](this["_img_countdown_c0"][m].skin);
                                w.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    S.Inst = null,
                    S;
            }
                (),
                m = function () {
                    function S(S) {
                        this["timer_id"] = 0,
                            this["last_returned"] = !1,
                            this.me = S;
                    }
                    return S["prototype"]["begin_refresh"] = function () {
                        this["timer_id"] && clearTimeout(this["timer_id"]),
                            this["last_returned"] = !0,
                            this["_loop_refresh_delay"](),
                            Laya["timer"]["clearAll"](this),
                            Laya["timer"].loop(100, this, this["_loop_show"]);
                    },
                        S["prototype"]["close_refresh"] = function () {
                            this["timer_id"] && (clearTimeout(this["timer_id"]), this["timer_id"] = 0),
                                this["last_returned"] = !1,
                                Laya["timer"]["clearAll"](this);
                        },
                        S["prototype"]["_loop_refresh_delay"] = function () {
                            var S = this;
                            if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"].none) {
                                var P = 2000;
                                if (game["MJNetMgr"].Inst["connect_state"] == game["EConnectState"]["connecting"] && this["last_returned"]) {
                                    var m = app["NetAgent"]["mj_network_delay"];
                                    P = 300 > m ? 2000 : 800 > m ? 2500 + m : 4000 + 0.5 * m,
                                        app["NetAgent"]["sendReq2MJ"]("FastTest", "checkNetworkDelay", {}, function () {
                                            S["last_returned"] = !0;
                                        }),
                                        this["last_returned"] = !1;
                                } else
                                    P = 1000;
                                this["timer_id"] = setTimeout(this["_loop_refresh_delay"].bind(this), P);
                            }
                        },
                        S["prototype"]["_loop_show"] = function () {
                            if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"].none)
                                if (game["MJNetMgr"].Inst["connect_state"] != game["EConnectState"]["connecting"])
                                    this.me.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/signal_bad.png");
                                else {
                                    var S = app["NetAgent"]["mj_network_delay"];
                                    this.me.skin = 300 > S ? game["Tools"]["localUISrc"]("myres/mjdesktop/signal_good.png") : 800 > S ? game["Tools"]["localUISrc"]("myres/mjdesktop/signal_normal.png") : game["Tools"]["localUISrc"]("myres/mjdesktop/signal_bad.png");
                                }
                        },
                        S;
                }
                    (),
                B = function () {
                    function S(S, P) {
                        var m = this;
                        this["enable"] = !1,
                            this["emj_banned"] = !1,
                            this["locking"] = !1,
                            this["localposition"] = P,
                            this.me = S,
                            this["btn_banemj"] = S["getChildByName"]("btn_banemj"),
                            this["btn_banemj_origin_x"] = this["btn_banemj"].x,
                            this["btn_banemj_origin_y"] = this["btn_banemj"].y,
                            this["img_bannedemj"] = this["btn_banemj"]["getChildByName"]("mute"),
                            this["btn_seeinfo"] = S["getChildByName"]("btn_seeinfo"),
                            this["btn_seeinfo_origin_x"] = this["btn_seeinfo"].x,
                            this["btn_seeinfo_origin_y"] = this["btn_seeinfo"].y,
                            this["btn_change"] = S["getChildByName"]("btn_change"),
                            this["btn_change_origin_x"] = this["btn_change"].x,
                            this["btn_change_origin_y"] = this["btn_change"].y,
                            this["btn_banemj"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                m["locking"] || (m["emj_banned"] = !m["emj_banned"], m["img_bannedemj"].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/mute" + (m["emj_banned"] ? "_on.png" : ".png")), m["close"]());
                            }, null, !1),
                            this["btn_seeinfo"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                m["locking"] || (m["close"](), w.Inst["btn_seeinfo"](m["localposition"]));
                            }, null, !1),
                            this["btn_change"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                m["locking"] || (m["close"](), view["DesktopMgr"].Inst["changeMainbody"](view["DesktopMgr"].Inst["localPosition2Seat"](m["localposition"])));
                            }, null, !1),
                            this.me["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                m["locking"] || m["switch"]();
                            }, null, !1);
                    }
                    return S["prototype"]["reset"] = function (S, P, m) {
                        Laya["timer"]["clearAll"](this),
                            this["locking"] = !1,
                            this["enable"] = !1,
                            this["showinfo"] = S,
                            this["showemj"] = P,
                            this["showchange"] = m,
                            this["emj_banned"] = !1,
                            this["btn_banemj"]["visible"] = !1,
                            this["btn_seeinfo"]["visible"] = !1,
                            this["img_bannedemj"].skin = game["Tools"]["localUISrc"]("myres/mjdesktop/mute" + (this["emj_banned"] ? "_on.png" : ".png")),
                            this["btn_change"]["visible"] = !1;
                    },
                        S["prototype"]["onChangeSeat"] = function (S, P, m) {
                            this["showinfo"] = S,
                                this["showemj"] = P,
                                this["showchange"] = m,
                                this["enable"] = !1,
                                this["btn_banemj"]["visible"] = !1,
                                this["btn_seeinfo"]["visible"] = !1,
                                this["btn_change"]["visible"] = !1;
                        },
                        S["prototype"]["switch"] = function () {
                            var S = this;
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
                                S["locking"] = !1;
                            })));
                        },
                        S["prototype"]["close"] = function () {
                            var S = this;
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
                                    S["locking"] = !1,
                                        S["btn_banemj"]["visible"] = !1,
                                        S["btn_seeinfo"]["visible"] = !1,
                                        S["btn_change"]["visible"] = !1;
                                });
                        },
                        S;
                }
                    (),
                J = function () {
                    function S(S) {
                        var P = this;
                        this["btn_emos"] = [],
                            this.emos = [],
                            this["allgray"] = !1,
                            this.me = S,
                            this.in = this.me["getChildByName"]('in'),
                            this.out = this.me["getChildByName"]("out"),
                            this["in_out"] = this.in["getChildByName"]("in_out"),
                            this["btn_chat"] = this.out["getChildByName"]("btn_chat"),
                            this["btn_mask"] = this.out["getChildByName"]("btn_mask"),
                            this["btn_chat"]["clickHandler"] = new Laya["Handler"](this, function () {
                                P["switchShow"](!0);
                            }),
                            this["btn_chat_in"] = this["in_out"]["getChildByName"]("btn_chat"),
                            this["btn_chat_in"]["clickHandler"] = new Laya["Handler"](this, function () {
                                P["switchShow"](!1);
                            }),
                            this["scrollbar"] = this.in["getChildByName"]("scrollbar_light")["scriptMap"]["capsui.CScrollBar"],
                            this["scrollview"] = this.in["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]), -1, 3),
                            this["scrollview"]["reset"](),
                            this["scrollbar"].init(null),
                            this["scrollview"].me.on("ratechange", this, function () {
                                P["scrollview"]["total_height"] > 0 ? P["scrollbar"]["setVal"](P["scrollview"].rate, P["scrollview"]["view_height"] / P["scrollview"]["total_height"]) : P["scrollbar"]["setVal"](0, 1);
                            }),
                            "chs" != GameMgr["client_language"] ? (this.out["getChildAt"](2)["visible"] = !1, this.out["getChildAt"](3)["visible"] = !0) : (this.out["getChildAt"](2)["visible"] = !0, this.out["getChildAt"](3)["visible"] = !1);
                    }
                    return S["prototype"]["initRoom"] = function () {
                        // START 
                        // var S = view["DesktopMgr"].Inst["main_role_character_info"],
                        // END
                        var S = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                            P = cfg["item_definition"]["character"].find(S["charid"]);
                        this.emos = [];
                        for (var m = 0; 9 > m; m++)
                            this.emos.push({
                                path: P.emo + '/' + m + ".png",
                                sub_id: m,
                                sort: m
                            });
                        if (S["extra_emoji"])
                            for (var m = 0; m < S["extra_emoji"]["length"]; m++)
                                this.emos.push({
                                    path: P.emo + '/' + S["extra_emoji"][m] + ".png",
                                    sub_id: S["extra_emoji"][m],
                                    sort: S["extra_emoji"][m] > 12 ? 1000000 - S["extra_emoji"][m] : S["extra_emoji"][m]
                                });
                        this.emos = this.emos.sort(function (S, P) {
                            return S.sort - P.sort;
                        }),
                            this["allgray"] = !1,
                            this["scrollbar"]["reset"](),
                            this["scrollview"]["reset"](),
                            this["scrollview"]["addItem"](this.emos["length"]),
                            this["btn_chat"]["disabled"] = !1,
                            this["btn_mask"]["visible"] = view["DesktopMgr"].Inst["emoji_switch"],
                            "chs" != GameMgr["client_language"] && (this.out["getChildAt"](3)["visible"] = !view["DesktopMgr"].Inst["emoji_switch"]),
                            this.me.x = 1892,
                            this.in["visible"] = !1,
                            this.out["visible"] = !0,
                            this["emo_infos"] = {
                                char_id: S["charid"],
                                emoji: [],
                                server: "chs_t" == GameMgr["client_type"] ? 1 : 'jp' == GameMgr["client_type"] ? 2 : 3
                            };
                    },
                        S["prototype"]["render_item"] = function (S) {
                            var P = this,
                                m = S["index"],
                                B = S["container"],
                                J = this.emos[m],
                                L = B["getChildByName"]("btn");
                            L.skin = game["LoadMgr"]["getResImageSkin"](J.path),
                                this["allgray"] ? game["Tools"]["setGrayDisable"](L, !0) : (game["Tools"]["setGrayDisable"](L, !1), L["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (app["NetAgent"]["isMJConnectOK"]()) {
                                        GameMgr.Inst["BehavioralStatistics"](22);
                                        for (var S = !1, m = 0, B = P["emo_infos"]["emoji"]; m < B["length"]; m++) {
                                            var L = B[m];
                                            if (L[0] == J["sub_id"]) {
                                                L[0]++,
                                                    S = !0;
                                                break;
                                            }
                                        }
                                        S || P["emo_infos"]["emoji"].push([J["sub_id"], 1]),
                                            app["NetAgent"]["sendReq2MJ"]("FastTest", "broadcastInGame", {
                                                content: JSON["stringify"]({
                                                    emo: J["sub_id"]
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    P["change_all_gray"](!0),
                                        Laya["timer"].once(5000, P, function () {
                                            P["change_all_gray"](!1);
                                        }),
                                        P["switchShow"](!1);
                                }, null, !1));
                        },
                        S["prototype"]["change_all_gray"] = function (S) {
                            this["allgray"] = S,
                                this["scrollview"]["wantToRefreshAll"]();
                        },
                        S["prototype"]["switchShow"] = function (S) {
                            var P = this,
                                m = 0;
                            m = S ? 1363 : 1892,
                                Laya["Tween"].to(this.me, {
                                    x: 1972
                                }, S ? 60 : 140, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function () {
                                    S ? (P.out["visible"] = !1, P.in["visible"] = !0) : (P.out["visible"] = !0, P.in["visible"] = !1),
                                        Laya["Tween"].to(P.me, {
                                            x: m
                                        }, S ? 140 : 60, Laya.Ease["strongOut"], Laya["Handler"]["create"](P, function () {
                                            P["btn_chat"]["disabled"] = !1,
                                                P["btn_chat_in"]["disabled"] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this["btn_chat"]["disabled"] = !0,
                                this["btn_chat_in"]["disabled"] = !0;
                        },
                        S["prototype"]["sendEmoLogUp"] = function () {
                            this["emo_infos"] && (GameMgr.Inst["postInfo2Server"]("emo_stats", {
                                data: this["emo_infos"]
                            }), this["emo_infos"]["emoji"] = []);
                        },
                        S["prototype"]["reset"] = function () {
                            this["scrollbar"]["reset"](),
                                this["scrollview"]["reset"]();
                        },
                        S;
                }
                    (),
                L = function () {
                    function P(P) {
                        this["effect"] = null,
                            this["container_emo"] = P["getChildByName"]("chat_bubble"),
                            this.emo = new S["UI_Character_Emo"](this["container_emo"]["getChildByName"]("content")),
                            this["root_effect"] = P["getChildByName"]("root_effect"),
                            this["container_emo"]["visible"] = !1;
                    }
                    return P["prototype"].show = function (S, P) {
                        var m = this;
                        if (!view["DesktopMgr"].Inst["emoji_switch"]) {
                            for (var B = view["DesktopMgr"].Inst["player_datas"][view["DesktopMgr"].Inst["localPosition2Seat"](S)]["character"]["charid"], J = cfg["character"]["emoji"]["getGroup"](B), L = '', w = 0, h = 0; h < J["length"]; h++)
                                if (J[h]["sub_id"] == P) {
                                    2 == J[h].type && (L = J[h].view, w = J[h]["audio"]);
                                    break;
                                }
                            this["effect"] && (this["effect"]["destory"](), this["effect"] = null),
                                L ? (this["effect"] = game["FrontEffect"].Inst["create_ui_effect"](this["root_effect"], "scene/" + L + ".lh", new Laya["Point"](0, 0), 1), Laya["timer"].once(3500, this, function () {
                                    m["effect"]["destory"](),
                                        m["effect"] = null;
                                }), w && view["AudioMgr"]["PlayAudio"](w)) : (this.emo["setSkin"](B, P), this["container_emo"]["visible"] = !0, this["container_emo"]["scaleX"] = this["container_emo"]["scaleY"] = 0, Laya["Tween"].to(this["container_emo"], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya["timer"].once(3000, this, function () {
                                    m.emo["clear"](),
                                        Laya["Tween"].to(m["container_emo"], {
                                            scaleX: 0,
                                            scaleY: 0
                                        }, 120, null, null, 0, !0, !0);
                                }), Laya["timer"].once(3500, this, function () {
                                    m["container_emo"]["visible"] = !1;
                                }));
                        }
                    },
                        P["prototype"]["reset"] = function () {
                            Laya["timer"]["clearAll"](this),
                                this.emo["clear"](),
                                this["container_emo"]["visible"] = !1,
                                this["effect"] && (this["effect"]["destory"](), this["effect"] = null);
                        },
                        P;
                }
                    (),
                w = function (w) {
                    function h() {
                        var S = w.call(this, new ui.mj["desktopInfoUI"]()) || this;
                        return S["container_doras"] = null,
                            S["doras"] = [],
                            S["label_md5"] = null,
                            S["container_gamemode"] = null,
                            S["label_gamemode"] = null,
                            S["btn_auto_moqie"] = null,
                            S["btn_auto_nofulu"] = null,
                            S["btn_auto_hule"] = null,
                            S["img_zhenting"] = null,
                            S["btn_double_pass"] = null,
                            S["_network_delay"] = null,
                            S["_timecd"] = null,
                            S["_player_infos"] = [],
                            S["_container_fun"] = null,
                            S["_fun_in"] = null,
                            S["_fun_out"] = null,
                            S["showscoredeltaing"] = !1,
                            S["_btn_leave"] = null,
                            S["_btn_fanzhong"] = null,
                            S["_btn_collect"] = null,
                            S["block_emo"] = null,
                            S["head_offset_y"] = 15,
                            S["gapStartPosLst"] = [new Laya["Vector2"](582, 12), new Laya["Vector2"](-266, 275), new Laya["Vector2"](-380, 103), new Laya["Vector2"](375, 142)],
                            S["selfGapOffsetX"] = [0, -150, 150],
                            app["NetAgent"]["AddListener2MJ"]("NotifyGameBroadcast", Laya["Handler"]["create"](S, function (P) {
                                S["onGameBroadcast"](P);
                            })),
                            app["NetAgent"]["AddListener2MJ"]("NotifyPlayerConnectionState", Laya["Handler"]["create"](S, function (P) {
                                S["onPlayerConnectionState"](P);
                            })),
                            h.Inst = S,
                            S;
                    }
                    return __extends(h, w),
                        h["prototype"]["onCreate"] = function () {
                            var w = this;
                            this["doras"] = new Array();
                            var h = this.me["getChildByName"]("container_lefttop"),
                                s = h["getChildByName"]("container_doras");
                            this["container_doras"] = s,
                                this["container_gamemode"] = h["getChildByName"]("gamemode"),
                                this["label_gamemode"] = this["container_gamemode"]["getChildByName"]("lb_mode"),
                                'kr' == GameMgr["client_language"] && (this["label_gamemode"]["scale"](0.85, 0.85), this["label_gamemode"]["scriptMap"]["capsui.LabelLocalizationSize"]["onCreate"]()),
                                this["label_md5"] = h["getChildByName"]("MD5"),
                                h["getChildByName"]("btn_md5change")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (w["label_md5"]["visible"])
                                        Laya["timer"]["clearAll"](w["label_md5"]), w["label_md5"]["visible"] = !1, view["DesktopMgr"].Inst["is_chuanma_mode"]() ? h["getChildByName"]("activitymode")["visible"] = !0 : w["container_doras"]["visible"] = !0;
                                    else {
                                        w["label_md5"]["visible"] = !0,
                                            w["label_md5"].text = game["Tools"]["strOfLocalization"](2048) + view["DesktopMgr"].Inst.md5,
                                            h["getChildByName"]("activitymode")["visible"] = !1,
                                            w["container_doras"]["visible"] = !1;
                                        var S = w;
                                        Laya["timer"].once(5000, w["label_md5"], function () {
                                            S["label_md5"]["visible"] = !1,
                                                view["DesktopMgr"].Inst["is_chuanma_mode"]() ? h["getChildByName"]("activitymode")["visible"] = !0 : w["container_doras"]["visible"] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var R = 0; R < s["numChildren"]; R++)
                                this["doras"].push(s["getChildAt"](R));
                            for (var R = 0; 4 > R; R++) {
                                var v = this.me["getChildByName"]("container_player_" + R),
                                    f = {};
                                f["container"] = v,
                                    f.head = new S["UI_Head"](v["getChildByName"]("head"), ''),
                                    f["head_origin_y"] = v["getChildByName"]("head").y,
                                    f.name = v["getChildByName"]("container_name")["getChildByName"]("name"),
                                    f["container_shout"] = v["getChildByName"]("container_shout"),
                                    f["container_shout"]["visible"] = !1,
                                    f["illust"] = f["container_shout"]["getChildByName"]("illust")["getChildByName"]("illust"),
                                    f["illustrect"] = S["UIRect"]["CreateFromSprite"](f["illust"]),
                                    f["shout_origin_x"] = f["container_shout"].x,
                                    f["shout_origin_y"] = f["container_shout"].y,
                                    f.emo = new L(v),
                                    f["disconnect"] = v["getChildByName"]("head")["getChildByName"]("head")["getChildByName"]("disconnect"),
                                    f["disconnect"]["visible"] = !1,
                                    f["title"] = new S["UI_PlayerTitle"](v["getChildByName"]("title"), ''),
                                    f.que = v["getChildByName"]("que"),
                                    f["que_target_pos"] = new Laya["Vector2"](f.que.x, f.que.y),
                                    0 == R ? v["getChildByName"]("btn_seeinfo")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                        w["btn_seeinfo"](0);
                                    }, null, !1) : f["headbtn"] = new B(v["getChildByName"]("btn_head"), R),
                                    this["_player_infos"].push(f);
                            }
                            this["_timecd"] = new P(this.me["getChildByName"]("container_countdown")),
                                this["img_zhenting"] = this.me["getChildByName"]("img_zhenting"),
                                this["img_zhenting"]["visible"] = !1,
                                this["_initFunc"](),
                                this["block_emo"] = new J(this.me["getChildByName"]("container_chat_choose")),
                                this.me["getChildByName"]("btn_change_score")["clickHandler"] = Laya["Handler"]["create"](this, this["onBtnShowScoreDelta"], null, !1),
                                this["_btn_leave"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_leave"),
                                this["_btn_leave"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    if (view["DesktopMgr"].Inst.mode == view["EMJMode"].play) {
                                        if (view["DesktopMgr"].Inst["gameing"]) {
                                            for (var P = 0, m = 0; m < view["DesktopMgr"].Inst["player_datas"]["length"]; m++)
                                                view["DesktopMgr"].Inst["player_datas"][m]["account_id"] && P++;
                                            if (1 >= P)
                                                S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](21), Laya["Handler"]["create"](w, function () {
                                                    if (view["DesktopMgr"].Inst["gameing"]) {
                                                        for (var S = 0, P = 0; P < view["DesktopMgr"].Inst["player_datas"]["length"]; P++) {
                                                            var m = view["DesktopMgr"].Inst["player_datas"][P];
                                                            m && null != m["account_id"] && 0 != m["account_id"] && S++;
                                                        }
                                                        1 == S ? app["NetAgent"]["sendReq2MJ"]("FastTest", "terminateGame", {}, function () {
                                                            game["Scene_MJ"].Inst["GameEnd"]();
                                                        }) : game["Scene_MJ"].Inst["ForceOut"]();
                                                    }
                                                }));
                                            else {
                                                var B = !1;
                                                if (S["UI_VoteProgress"]["vote_info"]) {
                                                    var J = Math["floor"]((Date.now() + GameMgr.Inst["server_time_delta"]) / 1000 - S["UI_VoteProgress"]["vote_info"]["start_time"] - S["UI_VoteProgress"]["vote_info"]["duration_time"]);
                                                    0 > J && (B = !0);
                                                }
                                                B ? S["UI_VoteProgress"].Inst["enable"] || S["UI_VoteProgress"].Inst.show() : S["UI_VoteCD"]["time_cd"] > (Date.now() + GameMgr.Inst["server_time_delta"]) / 1000 ? S["UI_VoteCD"].Inst["enable"] || S["UI_VoteCD"].Inst.show() : S["UI_Vote"].Inst.show();
                                            }
                                        }
                                    } else
                                        view["DesktopMgr"].Inst.mode == view["EMJMode"]["live_broadcast"] && (app["Log_OB"].log("quit ob"), S["UI_Ob_Replay"].Inst["resetRounds"](), S["UI_Ob_Replay"].Inst["enable"] = !1), game["Scene_MJ"].Inst["ForceOut"]();
                                }, null, !1),
                                this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_set")["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    S["UI_Config"].Inst.show();
                                }, null, !1),
                                this["_btn_fanzhong"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_fanzhong"),
                                this["_btn_fanzhong"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    S["UI_Rules"].Inst.show(0, null, view["DesktopMgr"].Inst["is_chuanma_mode"]() ? 1 : 0);
                                }, null, !1),
                                this["_btn_collect"] = this.me["getChildByName"]("container_righttop")["getChildByName"]("btn_collect"),
                                this["_btn_collect"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst.mode == view["EMJMode"]["paipu"] && (S["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? S["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3248), Laya["Handler"]["create"](w, function () {
                                        S["UI_PaiPu"]["removeCollect"](GameMgr.Inst["record_uuid"]);
                                    })) : S["UI_Replay"].Inst && S["UI_Replay"].Inst["pop_collectinput"].show(GameMgr.Inst["record_uuid"], GameMgr.Inst["record_start_time"], GameMgr.Inst["record_end_time"]));
                                }, null, !1),
                                this["btn_double_pass"] = this.me["getChildByName"]("btn_double_pass"),
                                this["btn_double_pass"]["visible"] = !1;
                            var A = 0;
                            this["btn_double_pass"]["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                if (view["DesktopMgr"]["double_click_pass"]) {
                                    var P = Laya["timer"]["currTimer"];
                                    if (A + 300 > P) {
                                        if (S["UI_ChiPengHu"].Inst["enable"])
                                            S["UI_ChiPengHu"].Inst["onDoubleClick"]();
                                        else {
                                            var m = view["DesktopMgr"].Inst["mainrole"]["can_discard"];
                                            S["UI_LiQiZiMo"].Inst["enable"] && (m = S["UI_LiQiZiMo"].Inst["onDoubleClick"](m)),
                                                m && view["DesktopMgr"].Inst["mainrole"]["onDoubleClick"]();
                                        }
                                        A = 0;
                                    } else
                                        A = P;
                                }
                            }, null, !1),
                                this["_network_delay"] = new m(this.me["getChildByName"]("img_signal")),
                                this["container_jjc"] = this.me["getChildByName"]("container_jjc"),
                                this["label_jjc_win"] = this["container_jjc"]["getChildByName"]("win"),
                                'en' == GameMgr["client_language"] && (h["getChildByName"]("activitymode")["getChildAt"](1).x = 98);
                        },
                        h["prototype"]["onGameBroadcast"] = function (S) {
                            app.Log.log("NotifyGameBroadcast " + JSON["stringify"](S));
                            var P = view["DesktopMgr"].Inst["seat2LocalPosition"](S.seat),
                                m = JSON["parse"](S["content"]);
                            null != m.emo && void 0 != m.emo && (this["onShowEmo"](P, m.emo), this["showAIEmo"]());
                        },
                        h["prototype"]["onPlayerConnectionState"] = function (S) {
                            app.Log.log("NotifyPlayerConnectionState msg: " + JSON["stringify"](S));
                            var P = S.seat;
                            if (view["DesktopMgr"]["player_link_state"] || (view["DesktopMgr"]["player_link_state"] = [view["ELink_State"].NULL, view["ELink_State"].NULL, view["ELink_State"].NULL, view["ELink_State"].NULL]), view["DesktopMgr"]["player_link_state"] && P < view["DesktopMgr"]["player_link_state"]["length"] && (view["DesktopMgr"]["player_link_state"][P] = S["state"]), this["enable"]) {
                                var m = view["DesktopMgr"].Inst["seat2LocalPosition"](P);
                                this["_player_infos"][m]["disconnect"]["visible"] = S["state"] != view["ELink_State"]["READY"];
                            }
                        },
                        h["prototype"]["_initFunc"] = function () {
                            var S = this;
                            this["_container_fun"] = this.me["getChildByName"]("container_func"),
                                this["_fun_in"] = this["_container_fun"]["getChildByName"]('in'),
                                this["_fun_out"] = this["_container_fun"]["getChildByName"]("out"),
                                this["_fun_in_spr"] = this["_fun_in"]["getChildByName"]("in_func");
                            var P = this["_fun_out"]["getChildByName"]("btn_func"),
                                m = this["_fun_out"]["getChildByName"]("btn_func2"),
                                B = this["_fun_in_spr"]["getChildByName"]("btn_func");
                            P["clickHandler"] = m["clickHandler"] = new Laya["Handler"](this, function () {
                                var J = 0;
                                J = -266,
                                    Laya["Tween"].to(S["_container_fun"], {
                                        x: -624
                                    }, 60, Laya.Ease["strongOut"], Laya["Handler"]["create"](S, function () {
                                        S["_fun_in"]["visible"] = !0,
                                            S["_fun_out"]["visible"] = !1,
                                            Laya["Tween"].to(S["_container_fun"], {
                                                x: J
                                            }, 140, Laya.Ease["strongOut"], Laya["Handler"]["create"](S, function () {
                                                P["disabled"] = !1,
                                                    m["disabled"] = !1,
                                                    B["disabled"] = !1,
                                                    S["_fun_out"]["visible"] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    P["disabled"] = !0,
                                    m["disabled"] = !0,
                                    B["disabled"] = !0;
                            }, null, !1),
                                B["clickHandler"] = new Laya["Handler"](this, function () {
                                    var J = -542;
                                    Laya["Tween"].to(S["_container_fun"], {
                                        x: -624
                                    }, 140, Laya.Ease["strongOut"], Laya["Handler"]["create"](S, function () {
                                        S["_fun_in"]["visible"] = !1,
                                            S["_fun_out"]["visible"] = !0,
                                            Laya["Tween"].to(S["_container_fun"], {
                                                x: J
                                            }, 60, Laya.Ease["strongOut"], Laya["Handler"]["create"](S, function () {
                                                P["disabled"] = !1,
                                                    m["disabled"] = !1,
                                                    B["disabled"] = !1,
                                                    S["_fun_out"]["visible"] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        P["disabled"] = !0,
                                        m["disabled"] = !0,
                                        B["disabled"] = !0;
                                });
                            var J = this["_fun_in"]["getChildByName"]("btn_autolipai"),
                                L = this["_fun_out"]["getChildByName"]("btn_autolipai2"),
                                w = this["_fun_out"]["getChildByName"]("autolipai"),
                                h = Laya["LocalStorage"]["getItem"]("autolipai"),
                                s = !0;
                            s = h && '' != h ? "true" == h : !0,
                                this["refreshFuncBtnShow"](J, w, s),
                                J["clickHandler"] = L["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoLiPai"](!view["DesktopMgr"].Inst["auto_liqi"]),
                                        S["refreshFuncBtnShow"](J, w, view["DesktopMgr"].Inst["auto_liqi"]),
                                        Laya["LocalStorage"]["setItem"]("autolipai", view["DesktopMgr"].Inst["auto_liqi"] ? "true" : "false");
                                }, null, !1);
                            var R = this["_fun_in"]["getChildByName"]("btn_autohu"),
                                v = this["_fun_out"]["getChildByName"]("btn_autohu2"),
                                f = this["_fun_out"]["getChildByName"]("autohu");
                            this["refreshFuncBtnShow"](R, f, !1),
                                R["clickHandler"] = v["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoHule"](!view["DesktopMgr"].Inst["auto_hule"]),
                                        S["refreshFuncBtnShow"](R, f, view["DesktopMgr"].Inst["auto_hule"]);
                                }, null, !1);
                            var A = this["_fun_in"]["getChildByName"]("btn_autonoming"),
                                u = this["_fun_out"]["getChildByName"]("btn_autonoming2"),
                                y = this["_fun_out"]["getChildByName"]("autonoming");
                            this["refreshFuncBtnShow"](A, y, !1),
                                A["clickHandler"] = u["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoNoFulu"](!view["DesktopMgr"].Inst["auto_nofulu"]),
                                        S["refreshFuncBtnShow"](A, y, view["DesktopMgr"].Inst["auto_nofulu"]);
                                }, null, !1);
                            var e = this["_fun_in"]["getChildByName"]("btn_automoqie"),
                                x = this["_fun_out"]["getChildByName"]("btn_automoqie2"),
                                C = this["_fun_out"]["getChildByName"]("automoqie");
                            this["refreshFuncBtnShow"](e, C, !1),
                                e["clickHandler"] = x["clickHandler"] = Laya["Handler"]["create"](this, function () {
                                    view["DesktopMgr"].Inst["setAutoMoQie"](!view["DesktopMgr"].Inst["auto_moqie"]),
                                        S["refreshFuncBtnShow"](e, C, view["DesktopMgr"].Inst["auto_moqie"]);
                                }, null, !1),
                                'kr' == GameMgr["client_language"] && (w["scale"](0.9, 0.9), f["scale"](0.9, 0.9), y["scale"](0.9, 0.9), C["scale"](0.9, 0.9)),
                                Laya["Browser"].onPC && !GameMgr["inConch"] ? (P["visible"] = !1, v["visible"] = !0, L["visible"] = !0, u["visible"] = !0, x["visible"] = !0) : (P["visible"] = !0, v["visible"] = !1, L["visible"] = !1, u["visible"] = !1, x["visible"] = !1);
                        },
                        h["prototype"]["noAutoLipai"] = function () {
                            var S = this["_container_fun"]["getChildByName"]("btn_autolipai");
                            view["DesktopMgr"].Inst["auto_liqi"] = !0,
                                S["clickHandler"].run();
                        },
                        h["prototype"]["resetFunc"] = function () {
                            var S = Laya["LocalStorage"]["getItem"]("autolipai"),
                                P = !0;
                            P = S && '' != S ? "true" == S : !0;
                            var m = this["_fun_in"]["getChildByName"]("btn_autolipai"),
                                B = this["_fun_out"]["getChildByName"]("automoqie");
                            this["refreshFuncBtnShow"](m, B, P),
                                Laya["LocalStorage"]["setItem"]("autolipai", P ? "true" : "false"),
                                view["DesktopMgr"].Inst["setAutoLiPai"](P);
                            var J = this["_fun_in"]["getChildByName"]("btn_autohu"),
                                L = this["_fun_out"]["getChildByName"]("autohu");
                            this["refreshFuncBtnShow"](J, L, view["DesktopMgr"].Inst["auto_hule"]);
                            var w = this["_fun_in"]["getChildByName"]("btn_autonoming"),
                                h = this["_fun_out"]["getChildByName"]("autonoming");
                            this["refreshFuncBtnShow"](w, h, view["DesktopMgr"].Inst["auto_nofulu"]);
                            var s = this["_fun_in"]["getChildByName"]("btn_automoqie"),
                                R = this["_fun_out"]["getChildByName"]("automoqie");
                            this["refreshFuncBtnShow"](s, R, view["DesktopMgr"].Inst["auto_moqie"]),
                                this["_container_fun"].x = -542,
                                this["_fun_in"]["visible"] = !1,
                                this["_fun_out"]["visible"] = !0; {
                                var v = this["_fun_out"]["getChildByName"]("btn_func");
                                this["_fun_out"]["getChildByName"]("btn_func2");
                            }
                            v["disabled"] = !1,
                                v["disabled"] = !1;
                            // 设置状态
                            if (MMP.settings.setAuto.isSetAuto) {
                                setAuto();
                            }
                            // END
                        },
                        h["prototype"]["setDora"] = function (S, P) {
                            if (0 > S || S >= this["doras"]["length"])
                                return console["error"]("setDora pos错误"), void 0;
                            var m = "myres2/mjp/" + (P["touming"] ? GameMgr.Inst["touming_mjp_view"] : GameMgr.Inst["mjp_view"]) + "/ui/";
                            this["doras"][S].skin = game["Tools"]["localUISrc"](m + P["toString"](!1) + ".png");
                        },
                        h["prototype"]["initRoom"] = function () {
                            var P = this;
                            if (view["DesktopMgr"].Inst.mode == view["EMJMode"].play || view["DesktopMgr"].Inst.mode == view["EMJMode"]["live_broadcast"]) {
                                for (var m = {}, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++) {
                                    // 修正表情问题
                                    if (view["DesktopMgr"].Inst["player_datas"][B]['account_id'] == GameMgr.Inst["account_id"]) {
                                        for (var v = cfg["item_definition"]["character"].find(fake_data.char_id).emo, i = 0; 9 > i; i++) {
                                            var x = v + '/' + i["toString"]() + ".png";
                                            m[x] = 1;
                                        }
                                        for (var i = 0; i < fake_data["emoji"]["length"]; i++) {
                                            var x = v + '/' + fake_data["emoji"][i]["toString"]() + ".png";
                                            m[x] = 1;
                                        }
                                        continue
                                    }
                                    // END
                                    for (var J = view["DesktopMgr"].Inst["player_datas"][B]["character"], L = J["charid"], w = cfg["item_definition"]["character"].find(L).emo, h = 0; 9 > h; h++) {
                                        var s = w + '/' + h["toString"]() + ".png";
                                        m[s] = 1;
                                    }
                                    if (J["extra_emoji"])
                                        for (var h = 0; h < J["extra_emoji"]["length"]; h++) {
                                            var s = w + '/' + J["extra_emoji"][h]["toString"]() + ".png";
                                            m[s] = 1;
                                        }
                                }
                                var R = [];
                                for (var v in m)
                                    R.push(v);
                                this["block_emo"].me.x = 1878,
                                    this["block_emo"]["reset"](),
                                    game["LoadMgr"]["loadResImage"](R, Laya["Handler"]["create"](this, function () {
                                        P["block_emo"]["initRoom"]();
                                    })),
                                    this["_btn_collect"]["visible"] = !1;
                            } else {
                                for (var f = !1, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++) {
                                    var A = view["DesktopMgr"].Inst["player_datas"][B];
                                    if (A && null != A["account_id"] && A["account_id"] == GameMgr.Inst["account_id"]) {
                                        f = !0;
                                        break;
                                    }
                                }
                                this["_btn_collect"]["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/btn_collect_" + (S["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? "l.png" : "d.png")),
                                    this["_btn_collect"]["visible"] = f;
                            }
                            if (this["_btn_leave"]["visible"] = !0, this["_btn_fanzhong"]["visible"] = !1, this["_btn_fanzhong"].x = 152, view["DesktopMgr"].Inst.mode == view["EMJMode"].play) {
                                for (var u = 0, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++) {
                                    var A = view["DesktopMgr"].Inst["player_datas"][B];
                                    A && null != A["account_id"] && 0 != A["account_id"] && u++;
                                }
                                1 == view["DesktopMgr"].Inst["game_config"]["category"] ? (this["_btn_leave"]["visible"] = !0, this["_btn_fanzhong"]["visible"] = !1, view["DesktopMgr"].Inst["is_chuanma_mode"]() && (this["_btn_fanzhong"]["visible"] = !0, this["_btn_fanzhong"].x = -92)) : (this["_btn_leave"]["visible"] = !1, this["_btn_fanzhong"]["visible"] = !0);
                            }
                            for (var y = 0, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++) {
                                var A = view["DesktopMgr"].Inst["player_datas"][B];
                                A && null != A["account_id"] && 0 != A["account_id"] && y++;
                            }
                            this["block_emo"].me["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                this["_container_fun"]["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                this["enable"] = !0,
                                this["setLiqibang"](0),
                                this["setBen"](0);
                            var e = this.me["getChildByName"]("container_lefttop");
                            if (view["DesktopMgr"].Inst["is_chuanma_mode"]())
                                e["getChildByName"]("num_lizhi_0")["visible"] = !1, e["getChildByName"]("num_lizhi_1")["visible"] = !1, e["getChildByName"]("num_ben_0")["visible"] = !1, e["getChildByName"]("num_ben_1")["visible"] = !1, e["getChildByName"]("container_doras")["visible"] = !1, e["getChildByName"]("gamemode")["visible"] = !1, e["getChildByName"]("activitymode")["visible"] = !0, e["getChildByName"]("MD5").y = 63, e["getChildByName"]("MD5")["width"] = 239, e["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/left_top1.png"), e["getChildAt"](0)["width"] = 280, e["getChildAt"](0)["height"] = 139, 1 == view["DesktopMgr"].Inst["game_config"]["category"] ? (e["getChildByName"]("activitymode")["getChildAt"](0)["visible"] = !1, e["getChildByName"]("activitymode")["getChildAt"](1)["visible"] = !0) : ('en' == GameMgr["client_language"] && (e["getChildByName"]("activitymode")["getChildAt"](0).x = 2 == view["DesktopMgr"].Inst["game_config"]["category"] ? 77 : 97), e["getChildByName"]("activitymode")["getChildAt"](0).text = game["Tools"]["strOfLocalization"](2 == view["DesktopMgr"].Inst["game_config"]["category"] ? 3393 : 2025), e["getChildByName"]("activitymode")["getChildAt"](0)["visible"] = !0, e["getChildByName"]("activitymode")["getChildAt"](1)["visible"] = !1);
                            else if (e["getChildByName"]("num_lizhi_0")["visible"] = !0, e["getChildByName"]("num_lizhi_1")["visible"] = !1, e["getChildByName"]("num_ben_0")["visible"] = !0, e["getChildByName"]("num_ben_1")["visible"] = !0, e["getChildByName"]("container_doras")["visible"] = !0, e["getChildByName"]("gamemode")["visible"] = !0, e["getChildByName"]("activitymode")["visible"] = !1, e["getChildByName"]("MD5").y = 51, e["getChildByName"]("MD5")["width"] = 276, e["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/left_top.png"), e["getChildAt"](0)["width"] = 313, e["getChildAt"](0)["height"] = 158, view["DesktopMgr"].Inst["game_config"]) {
                                var x = view["DesktopMgr"].Inst["game_config"],
                                    C = game["Tools"]["get_room_desc"](x);
                                this["label_gamemode"].text = C.text,
                                    this["container_gamemode"]["visible"] = !0;
                            } else
                                this["container_gamemode"]["visible"] = !1;
                            if (this["btn_double_pass"]["visible"] = view["DesktopMgr"].Inst.mode == view["EMJMode"].play, view["DesktopMgr"].Inst.mode == view["EMJMode"].play)
                                if (this["_network_delay"]["begin_refresh"](), this["_network_delay"].me["visible"] = !0, view["DesktopMgr"].Inst["is_jjc_mode"]()) {
                                    this["container_jjc"]["visible"] = !0,
                                        this["label_jjc_win"].text = S["UI_Activity_JJC"]["win_count"]["toString"]();
                                    for (var B = 0; 3 > B; B++)
                                        this["container_jjc"]["getChildByName"](B["toString"]()).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/tag_jjc_" + (S["UI_Activity_JJC"]["lose_count"] > B ? 'd' : 'l') + ".png");
                                } else
                                    this["container_jjc"]["visible"] = !1;
                            else
                                this["_network_delay"].me["visible"] = !1, this["container_jjc"]["visible"] = !1;
                            S["UI_Replay"].Inst && (S["UI_Replay"].Inst["pop_collectinput"].me["visible"] = !1);
                            var g = this["_container_fun"]["getChildByName"]('in')["getChildByName"]("btn_automoqie"),
                                H = this["_container_fun"]["getChildByName"]("out")["getChildByName"]("btn_automoqie2");
                            view["DesktopMgr"].Inst["is_zhanxing_mode"]() ? (S["UI_Astrology"].Inst.show(), game["Tools"]["setGrayDisable"](g, !0), game["Tools"]["setGrayDisable"](H, !0)) : (game["Tools"]["setGrayDisable"](g, !1), game["Tools"]["setGrayDisable"](H, !1), S["UI_Astrology"].Inst.hide());
                        },
                        h["prototype"]["onCloseRoom"] = function () {
                            this["_network_delay"]["close_refresh"]();
                        },
                        h["prototype"]["refreshSeat"] = function (S) {
                            void 0 === S && (S = !1);
                            for (var P = (view["DesktopMgr"].Inst.seat, view["DesktopMgr"].Inst["player_datas"]), m = 0; 4 > m; m++) {
                                var B = view["DesktopMgr"].Inst["localPosition2Seat"](m),
                                    J = this["_player_infos"][m];
                                if (0 > B)
                                    J["container"]["visible"] = !1;
                                else {
                                    J["container"]["visible"] = !0;
                                    var L = view["DesktopMgr"].Inst["getPlayerName"](B);
                                    game["Tools"]["SetNickname"](J.name, L),
                                        J.head.id = P[B]["avatar_id"],
                                        J.head["set_head_frame"](P[B]["account_id"], P[B]["avatar_frame"]);
                                    var w = (cfg["item_definition"].item.get(P[B]["avatar_frame"]), cfg["item_definition"].view.get(P[B]["avatar_frame"]));
                                    if (J.head.me.y = w && w["sargs"][0] ? J["head_origin_y"] - Number(w["sargs"][0]) / 100 * this["head_offset_y"] : J["head_origin_y"], J["avatar"] = P[B]["avatar_id"], 0 != m) {
                                        var h = P[B]["account_id"] && 0 != P[B]["account_id"] && view["DesktopMgr"].Inst.mode != view["EMJMode"]["paipu"],
                                            s = P[B]["account_id"] && 0 != P[B]["account_id"] && view["DesktopMgr"].Inst.mode == view["EMJMode"].play,
                                            R = view["DesktopMgr"].Inst.mode != view["EMJMode"].play;
                                        S ? J["headbtn"]["onChangeSeat"](h, s, R) : J["headbtn"]["reset"](h, s, R);
                                    }
                                    J["title"].id = P[B]["title"] ? game["Tools"]["titleLocalization"](P[B]["account_id"], P[B]["title"]) : 0;
                                }
                            }
                        },
                        h["prototype"]["refreshNames"] = function () {
                            for (var S = 0; 4 > S; S++) {
                                var P = view["DesktopMgr"].Inst["localPosition2Seat"](S),
                                    m = this["_player_infos"][S];
                                if (0 > P)
                                    m["container"]["visible"] = !1;
                                else {
                                    m["container"]["visible"] = !0;
                                    var B = view["DesktopMgr"].Inst["getPlayerName"](P);
                                    game["Tools"]["SetNickname"](m.name, B);
                                }
                            }
                        },
                        h["prototype"]["refreshLinks"] = function () {
                            for (var S = (view["DesktopMgr"].Inst.seat, 0); 4 > S; S++) {
                                var P = view["DesktopMgr"].Inst["localPosition2Seat"](S);
                                view["DesktopMgr"].Inst.mode == view["EMJMode"].play ? this["_player_infos"][S]["disconnect"]["visible"] = -1 == P || 0 == S ? !1 : view["DesktopMgr"]["player_link_state"][P] != view["ELink_State"]["READY"] : view["DesktopMgr"].Inst.mode == view["EMJMode"]["live_broadcast"] ? this["_player_infos"][S]["disconnect"]["visible"] = -1 == P || 0 == view["DesktopMgr"].Inst["player_datas"][P]["account_id"] ? !1 : view["DesktopMgr"]["player_link_state"][P] != view["ELink_State"]["READY"] : view["DesktopMgr"].Inst.mode == view["EMJMode"]["paipu"] && (this["_player_infos"][S]["disconnect"]["visible"] = !1);
                            }
                        },
                        h["prototype"]["setBen"] = function (S) {
                            S > 99 && (S = 99);
                            var P = this.me["getChildByName"]("container_lefttop"),
                                m = P["getChildByName"]("num_ben_0"),
                                B = P["getChildByName"]("num_ben_1");
                            S >= 10 ? (m.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](S / 10)["toString"]() + ".png"), B.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (S % 10)["toString"]() + ".png"), B["visible"] = !0) : (m.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (S % 10)["toString"]() + ".png"), B["visible"] = !1);
                        },
                        h["prototype"]["setLiqibang"] = function (S, P) {
                            void 0 === P && (P = !0),
                                S > 999 && (S = 999);
                            var m = this.me["getChildByName"]("container_lefttop"),
                                B = m["getChildByName"]("num_lizhi_0"),
                                J = m["getChildByName"]("num_lizhi_1"),
                                L = m["getChildByName"]("num_lizhi_2");
                            S >= 100 ? (L.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (S % 10)["toString"]() + ".png"), J.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (Math["floor"](S / 10) % 10)["toString"]() + ".png"), B.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](S / 100)["toString"]() + ".png"), J["visible"] = !0, L["visible"] = !0) : S >= 10 ? (J.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + (S % 10)["toString"]() + ".png"), B.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + Math["floor"](S / 10)["toString"]() + ".png"), J["visible"] = !0, L["visible"] = !1) : (B.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/w_" + S["toString"]() + ".png"), J["visible"] = !1, L["visible"] = !1),
                                view["DesktopMgr"].Inst["setRevealScore"](S, P);
                        },
                        h["prototype"]["reset_rounds"] = function () {
                            this["closeCountDown"](),
                                this["showscoredeltaing"] = !1,
                                view["DesktopMgr"].Inst["setScoreDelta"](!1);
                            for (var S = "myres2/mjp/" + GameMgr.Inst["mjp_view"] + "/ui/", P = 0; P < this["doras"]["length"]; P++)
                                this["doras"][P].skin = view["DesktopMgr"].Inst["is_jiuchao_mode"]() ? game["Tools"]["localUISrc"]("myres/mjdesktop/tou_dora_back.png") : game["Tools"]["localUISrc"](S + "back.png");
                            for (var P = 0; 4 > P; P++)
                                this["_player_infos"][P].emo["reset"](), this["_player_infos"][P].que["visible"] = !1;
                            this["_timecd"]["reset"](),
                                Laya["timer"]["clearAll"](this),
                                Laya["timer"]["clearAll"](this["label_md5"]),
                                view["DesktopMgr"].Inst["is_chuanma_mode"]() || (this["container_doras"]["visible"] = !0),
                                this["label_md5"]["visible"] = !1;
                        },
                        h["prototype"]["showCountDown"] = function (S, P) {
                            this["_timecd"]["showCD"](S, P);
                        },
                        h["prototype"]["setZhenting"] = function (S) {
                            this["img_zhenting"]["visible"] = S;
                        },
                        h["prototype"]["shout"] = function (S, P, m, B) {
                            app.Log.log("shout:" + S + " type:" + P);
                            try {
                                var J = this["_player_infos"][S],
                                    L = J["container_shout"],
                                    w = L["getChildByName"]("img_content"),
                                    h = L["getChildByName"]("illust")["getChildByName"]("illust"),
                                    s = L["getChildByName"]("img_score");
                                if (0 == B)
                                    s["visible"] = !1;
                                else {
                                    s["visible"] = !0;
                                    var R = 0 > B ? 'm' + Math.abs(B) : B;
                                    s.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/shout_score_" + R + ".png");
                                }
                                '' == P ? w["visible"] = !1 : (w["visible"] = !0, w.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/shout_" + P + ".png")),
                                    view["DesktopMgr"]["is_yuren_type"]() && 100 * Math["random"]() < 20 ? (L["getChildByName"]("illust")["visible"] = !1, L["getChildAt"](2)["visible"] = !0, L["getChildAt"](0)["visible"] = !1, game["LoadMgr"]["setImgSkin"](L["getChildAt"](2), "extendRes/charactor/yurenjie/xg" + Math["floor"](3 * Math["random"]()) + ".png")) : (L["getChildByName"]("illust")["visible"] = !0, L["getChildAt"](2)["visible"] = !1, L["getChildAt"](0)["visible"] = !0, h["scaleX"] = 1, game["Tools"]["charaPart"](m["avatar_id"], h, "half", J["illustrect"], !0, !0));
                                var v = 0,
                                    f = 0;
                                switch (S) {
                                    case 0:
                                        v = -105,
                                            f = 0;
                                        break;
                                    case 1:
                                        v = 500,
                                            f = 0;
                                        break;
                                    case 2:
                                        v = 0,
                                            f = -300;
                                        break;
                                    default:
                                        v = -500,
                                            f = 0;
                                }
                                L["visible"] = !0,
                                    L["alpha"] = 0,
                                    L.x = J["shout_origin_x"] + v,
                                    L.y = J["shout_origin_y"] + f,
                                    Laya["Tween"].to(L, {
                                        alpha: 1,
                                        x: J["shout_origin_x"],
                                        y: J["shout_origin_y"]
                                    }, 70),
                                    Laya["Tween"].to(L, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya["timer"].once(800, this, function () {
                                        Laya["loader"]["clearTextureRes"](h.skin),
                                            L["visible"] = !1;
                                    });
                            } catch (A) {
                                var u = {};
                                u["error"] = A["message"],
                                    u["stack"] = A["stack"],
                                    u["method"] = "shout",
                                    u["class"] = "UI_DesktopInfos",
                                    GameMgr.Inst["onFatalError"](u);
                            }
                        },
                        h["prototype"]["closeCountDown"] = function () {
                            this["_timecd"]["close"]();
                        },
                        h["prototype"]["refreshFuncBtnShow"] = function (S, P, m) {
                            var B = S["getChildByName"]("img_choosed");
                            P["color"] = S["mouseEnabled"] ? m ? "#3bd647" : "#7992b3" : "#565656",
                                B["visible"] = m;
                        },
                        h["prototype"]["onShowEmo"] = function (S, P) {
                            var m = this["_player_infos"][S];
                            0 != S && m["headbtn"]["emj_banned"] || m.emo.show(S, P);
                        },
                        h["prototype"]["changeHeadEmo"] = function (S) {
                            {
                                var P = view["DesktopMgr"].Inst["seat2LocalPosition"](S);
                                this["_player_infos"][P];
                            }
                        },
                        h["prototype"]["onBtnShowScoreDelta"] = function () {
                            var S = this;
                            this["showscoredeltaing"] || (this["showscoredeltaing"] = !0, view["DesktopMgr"].Inst["setScoreDelta"](!0), Laya["timer"].once(5000, this, function () {
                                S["showscoredeltaing"] = !1,
                                    view["DesktopMgr"].Inst["setScoreDelta"](!1);
                            }));
                        },
                        h["prototype"]["btn_seeinfo"] = function (P) {
                            if (view["DesktopMgr"].Inst.mode != view["EMJMode"]["paipu"] && view["DesktopMgr"].Inst["gameing"]) {
                                var m = view["DesktopMgr"].Inst["player_datas"][view["DesktopMgr"].Inst["localPosition2Seat"](P)]["account_id"];
                                if (m) {
                                    var B = 1 == view["DesktopMgr"].Inst["game_config"]["category"],
                                        J = 1,
                                        L = view["DesktopMgr"].Inst["game_config"].meta;
                                    L && L["mode_id"] == game["EMatchMode"]["shilian"] && (J = 4),
                                        S["UI_OtherPlayerInfo"].Inst.show(m, view["DesktopMgr"].Inst["game_config"].mode.mode < 10 ? 1 : 2, B ? 1 : 2, J);
                                }
                            }
                        },
                        h["prototype"]["openDora3BeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_dora3_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openPeipaiOpenBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_peipai_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openDora3BeginShine"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_shine"), "scene/effect_dora3_shine.lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](244),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openMuyuOpenBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_muyu_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openShilianOpenBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_shilian_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openXiuluoOpenBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_xiuluo_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openChuanmaBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_chiyu_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openJiuChaoBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_mingjing_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openAnPaiBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_anye_begin_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openTopMatchOpenBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_dianfengduiju_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["openZhanxingBeginEffect"] = function () {
                            var S = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_zhanxing_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                            view["AudioMgr"]["PlayAudio"](243),
                                Laya["timer"].once(5000, S, function () {
                                    S["destory"]();
                                });
                        },
                        h["prototype"]["logUpEmoInfo"] = function () {
                            this["block_emo"]["sendEmoLogUp"]();
                        },
                        h["prototype"]["onCollectChange"] = function () {
                            this["_btn_collect"]["getChildAt"](0).skin = game["Tools"]["localUISrc"]("myres/mjdesktop/btn_collect_" + (S["UI_PaiPu"]["collect_info"][GameMgr.Inst["record_uuid"]] ? "l.png" : "d.png"));
                        },
                        h["prototype"]["showAIEmo"] = function () {
                            for (var S = this, P = function (P) {
                                var B = view["DesktopMgr"].Inst["player_datas"][P];
                                B["account_id"] && 0 != B["account_id"] || Math["random"]() < 0.3 && Laya["timer"].once(500 + 1000 * Math["random"](), m, function () {
                                    S["onShowEmo"](view["DesktopMgr"].Inst["seat2LocalPosition"](P), Math["floor"](9 * Math["random"]()));
                                });
                            }, m = this, B = 0; B < view["DesktopMgr"].Inst["player_datas"]["length"]; B++)
                                P(B);
                        },
                        h["prototype"]["setGapType"] = function (S, P) {
                            void 0 === P && (P = !1);
                            for (var m = 0; m < S["length"]; m++) {
                                var B = view["DesktopMgr"].Inst["seat2LocalPosition"](m);
                                this["_player_infos"][B].que["visible"] = !0,
                                    P && (0 == m ? (this["_player_infos"][B].que.pos(this["gapStartPosLst"][m].x + this["selfGapOffsetX"][S[m]], this["gapStartPosLst"][m].y), this["_player_infos"][B].que["scale"](1, 1), Laya["Tween"].to(this["_player_infos"][B].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this["_player_infos"][B]["que_target_pos"].x,
                                        y: this["_player_infos"][B]["que_target_pos"].y
                                    }, 200)) : (this["_player_infos"][B].que.pos(this["gapStartPosLst"][m].x, this["gapStartPosLst"][m].y), this["_player_infos"][B].que["scale"](1, 1), Laya["Tween"].to(this["_player_infos"][B].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this["_player_infos"][B]["que_target_pos"].x,
                                        y: this["_player_infos"][B]["que_target_pos"].y
                                    }, 200))),
                                    this["_player_infos"][B].que.skin = game["Tools"]["localUISrc"]("myres/mjdesktop/dingque_" + S[m] + ".png");
                            }
                        },
                        h["prototype"]["OnNewCard"] = function (S, P) {
                            if (P) {
                                var m = game["FrontEffect"].Inst["create_ui_effect"](this.me["getChildByName"]("container_effects")["getChildByName"]("dora3_begin"), "scene/effect_xianjing_" + GameMgr["client_language"] + ".lh", new Laya["Point"](0, 0), 1);
                                view["AudioMgr"]["PlayAudio"](243),
                                    Laya["timer"].once(5000, m, function () {
                                        m["destory"]();
                                    }),
                                    Laya["timer"].once(1300, this, function () {
                                        this["ShowSpellCard"](view["DesktopMgr"].Inst["field_spell"], !0);
                                    });
                            } else
                                this["ShowSpellCard"](view["DesktopMgr"].Inst["field_spell"], !1);
                        },
                        h["prototype"]["ShowSpellCard"] = function (P, m) {
                            void 0 === m && (m = !1),
                                S["UI_FieldSpell"].Inst && !S["UI_FieldSpell"].Inst["enable"] && S["UI_FieldSpell"].Inst.show(P, m);
                        },
                        h["prototype"]["HideSpellCard"] = function () {
                            S["UI_FieldSpell"].Inst && S["UI_FieldSpell"].Inst["close"]();
                        },
                        h.Inst = null,
                        h;
                }
                    (S["UIBase"]);
            S["UI_DesktopInfo"] = w;
        }
            (uiscript || (uiscript = {}));


        // 设置名称
        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            var P = this;
            // END
            this["read_list"] = [],
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAnnouncement", {
                    lang: GameMgr["client_language"],
                    platform: GameMgr["inDmm"] ? "web_dmm" : "web"
                }, function (m, B) {
                    m || B["error"] ? S["UIMgr"].Inst["showNetReqError"]("fetchAnnouncement", m, B) : P["_refreshAnnouncements"](B);
                    if ((m || B["error"]) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnnouncementUpdate", Laya["Handler"]["create"](this, function (S) {
                    for (var m = GameMgr["inDmm"] ? "web_dmm" : "web", B = 0, J = S["update_list"]; B < J["length"]; B++) {
                        var L = J[B];
                        if (L.lang == GameMgr["client_language"] && L["platform"] == m) {
                            P["have_new_notice"] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }


        uiscript.UI_Info._refreshAnnouncements = function (S) {
            S.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            if (S["announcements"] && (this["announcements"] = S["announcements"]), S.sort && (this["announcement_sort"] = S.sort), S["read_list"]) {
                this["read_list"] = [666666, 777777];
                for (var P = 0; P < S["read_list"]["length"]; P++)
                    this["read_list"].push(S["read_list"][P]);
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
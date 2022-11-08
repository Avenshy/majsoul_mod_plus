// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.173
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
        ! function(o) {
            var N;
            ! function(o) {
                o[o.none = 0] = "none",
                    o[o["daoju"] = 1] = "daoju",
                    o[o.gift = 2] = "gift",
                    o[o["fudai"] = 3] = "fudai",
                    o[o.view = 5] = "view";
            }
            (N = o["EItemCategory"] || (o["EItemCategory"] = {}));
            var z = function(z) {
                    function h() {
                        var o = z.call(this, new ui["lobby"]["bagUI"]()) || this;
                        return o["container_top"] = null,
                            o["container_content"] = null,
                            o["locking"] = !1,
                            o.tabs = [],
                            o["page_item"] = null,
                            o["page_gift"] = null,
                            o["page_skin"] = null,
                            o["select_index"] = 0,
                            h.Inst = o,
                            o;
                    }
                    return __extends(h, z),
                        h.init = function() {
                            var o = this;
                            app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function(N) {
                                    var z = N["update"];
                                    z && z.bag && (o["update_data"](z.bag["update_items"]), o["update_daily_gain_data"](z.bag));
                                }, null, !1)),
                                this["fetch"]();
                        },
                        h["fetch"] = function() {
                            var N = this;
                            this["_item_map"] = {},
                                this["_daily_gain_record"] = {},
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchBagInfo", {}, function(z, h) {
                                    if (z || h["error"])
                                        o["UIMgr"].Inst["showNetReqError"]("fetchBagInfo", z, h);
                                    else {
                                        app.Log.log("背包信息：" + JSON["stringify"](h));
                                        var d = h.bag;
                                        if (d) {
                                            if (MMP.settings.setItems.setAllItems) {
                                                //设置全部道具
                                                var items = cfg.item_definition.item.map_;
                                                for (var id in items) {
                                                    if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                        for (let item of d["items"]) {
                                                            if (item.item_id == id) {
                                                                cfg.item_definition.item.get(item.item_id);
                                                                N._item_map[item.item_id] = {
                                                                    item_id: item.item_id,
                                                                    count: item.stack,
                                                                    category: items[item.item_id].category
                                                                };
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        cfg.item_definition.item.get(id);
                                                        N._item_map[id] = {
                                                            item_id: id,
                                                            count: 1,
                                                            category: items[id].category
                                                        }; //获取物品列表并添加
                                                    }
                                                }


                                            } else {
                                                if (d["items"])
                                                    for (var r = 0; r < d["items"]["length"]; r++) {
                                                        var k = d["items"][r]["item_id"],
                                                            T = d["items"][r]["stack"],
                                                            M = cfg["item_definition"].item.get(k);
                                                        M && (N["_item_map"][k] = {
                                                            item_id: k,
                                                            count: T,
                                                            category: M["category"]
                                                        }, 1 == M["category"] && 3 == M.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                                            item_id: k
                                                        }, function() {}));
                                                    }
                                                if (d["daily_gain_record"])
                                                    for (var C = d["daily_gain_record"], r = 0; r < C["length"]; r++) {
                                                        var g = C[r]["limit_source_id"];
                                                        N["_daily_gain_record"][g] = {};
                                                        var H = C[r]["record_time"];
                                                        N["_daily_gain_record"][g]["record_time"] = H;
                                                        var i = C[r]["records"];
                                                        if (i)
                                                            for (var l = 0; l < i["length"]; l++)
                                                                N["_daily_gain_record"][g][i[l]["item_id"]] = i[l]["count"];
                                                    }
                                            }
                                        }
                                    }
                                });
                        },
                        h["find_item"] = function(o) {
                            var N = this["_item_map"][o];
                            return N ? {
                                    item_id: N["item_id"],
                                    category: N["category"],
                                    count: N["count"]
                                } :
                                null;
                        },
                        h["get_item_count"] = function(o) {
                            var N = this["find_item"](o);
                            if (N)
                                return N["count"];
                            if ("100001" == o) {
                                for (var z = 0, h = 0, d = GameMgr.Inst["free_diamonds"]; h < d["length"]; h++) {
                                    var r = d[h];
                                    GameMgr.Inst["account_numerical_resource"][r] && (z += GameMgr.Inst["account_numerical_resource"][r]);
                                }
                                for (var k = 0, T = GameMgr.Inst["paid_diamonds"]; k < T["length"]; k++) {
                                    var r = T[k];
                                    GameMgr.Inst["account_numerical_resource"][r] && (z += GameMgr.Inst["account_numerical_resource"][r]);
                                }
                                return z;
                            }
                            if ("100004" == o) {
                                for (var M = 0, C = 0, g = GameMgr.Inst["free_pifuquans"]; C < g["length"]; C++) {
                                    var r = g[C];
                                    GameMgr.Inst["account_numerical_resource"][r] && (M += GameMgr.Inst["account_numerical_resource"][r]);
                                }
                                for (var H = 0, i = GameMgr.Inst["paid_pifuquans"]; H < i["length"]; H++) {
                                    var r = i[H];
                                    GameMgr.Inst["account_numerical_resource"][r] && (M += GameMgr.Inst["account_numerical_resource"][r]);
                                }
                                return M;
                            }
                            return "100002" == o ? GameMgr.Inst["account_data"].gold : 0;
                        },
                        h["find_items_by_category"] = function(o) {
                            var N = [];
                            for (var z in this["_item_map"])
                                this["_item_map"][z]["category"] == o && N.push({
                                    item_id: this["_item_map"][z]["item_id"],
                                    category: this["_item_map"][z]["category"],
                                    count: this["_item_map"][z]["count"]
                                });
                            return N;
                        },
                        h["update_data"] = function(N) {
                            for (var z = 0; z < N["length"]; z++) {
                                var h = N[z]["item_id"],
                                    d = N[z]["stack"];
                                if (d > 0) {
                                    this["_item_map"]["hasOwnProperty"](h["toString"]()) ? this["_item_map"][h]["count"] = d : this["_item_map"][h] = {
                                        item_id: h,
                                        count: d,
                                        category: cfg["item_definition"].item.get(h)["category"]
                                    };
                                    var r = cfg["item_definition"].item.get(h);
                                    1 == r["category"] && 3 == r.type && app["NetAgent"]["sendReq2Lobby"]("Lobby", "openAllRewardItem", {
                                            item_id: h
                                        }, function() {}),
                                        5 == r["category"] && (this["new_bag_item_ids"].push(h), this["new_zhuangban_item_ids"][h] = 1);
                                } else if (this["_item_map"]["hasOwnProperty"](h["toString"]())) {
                                    var k = cfg["item_definition"].item.get(h);
                                    k && 5 == k["category"] && o["UI_Sushe"]["on_view_remove"](h),
                                        this["_item_map"][h] = 0,
                                        delete this["_item_map"][h];
                                }
                            }
                            this.Inst && this.Inst["when_data_change"]();
                            for (var z = 0; z < N["length"]; z++) {
                                var h = N[z]["item_id"];
                                if (this["_item_listener"]["hasOwnProperty"](h["toString"]()))
                                    for (var T = this["_item_listener"][h], M = 0; M < T["length"]; M++)
                                        T[M].run();
                            }
                            for (var z = 0; z < this["_all_item_listener"]["length"]; z++)
                                this["_all_item_listener"][z].run();
                        },
                        h["update_daily_gain_data"] = function(o) {
                            var N = o["update_daily_gain_record"];
                            if (N)
                                for (var z = 0; z < N["length"]; z++) {
                                    var h = N[z]["limit_source_id"];
                                    this["_daily_gain_record"][h] || (this["_daily_gain_record"][h] = {});
                                    var d = N[z]["record_time"];
                                    this["_daily_gain_record"][h]["record_time"] = d;
                                    var r = N[z]["records"];
                                    if (r)
                                        for (var k = 0; k < r["length"]; k++)
                                            this["_daily_gain_record"][h][r[k]["item_id"]] = r[k]["count"];
                                }
                        },
                        h["get_item_daily_record"] = function(o, N) {
                            return this["_daily_gain_record"][o] ? this["_daily_gain_record"][o]["record_time"] ? game["Tools"]["isPassedRefreshTimeServer"](this["_daily_gain_record"][o]["record_time"]) ? this["_daily_gain_record"][o][N] ? this["_daily_gain_record"][o][N] : 0 : 0 : 0 : 0;
                        },
                        h["add_item_listener"] = function(o, N) {
                            this["_item_listener"]["hasOwnProperty"](o["toString"]()) || (this["_item_listener"][o] = []),
                                this["_item_listener"][o].push(N);
                        },
                        h["remove_item_listener"] = function(o, N) {
                            var z = this["_item_listener"][o];
                            if (z)
                                for (var h = 0; h < z["length"]; h++)
                                    if (z[h] === N) {
                                        z[h] = z[z["length"] - 1],
                                            z.pop();
                                        break;
                                    }
                        },
                        h["add_all_item_listener"] = function(o) {
                            this["_all_item_listener"].push(o);
                        },
                        h["remove_all_item_listener"] = function(o) {
                            for (var N = this["_all_item_listener"], z = 0; z < N["length"]; z++)
                                if (N[z] === o) {
                                    N[z] = N[N["length"] - 1],
                                        N.pop();
                                    break;
                                }
                        },
                        h["removeAllBagNew"] = function() {
                            this["new_bag_item_ids"] = [];
                        },
                        h["removeZhuangBanNew"] = function(o) {
                            for (var N = 0, z = o; N < z["length"]; N++) {
                                var h = z[N];
                                delete this["new_zhuangban_item_ids"][h];
                            }
                        },
                        h["prototype"]["have_red_point"] = function() {
                            return !1;
                        },
                        h["prototype"]["onCreate"] = function() {
                            var N = this;
                            this["container_top"] = this.me["getChildByName"]("top"),
                                this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["locking"] || N.hide(Laya["Handler"]["create"](N, function() {
                                        return N["closeHandler"] ? (N["closeHandler"].run(), N["closeHandler"] = null, void 0) : (o["UI_Lobby"].Inst["enable"] = !0, void 0);
                                    }));
                                }, null, !1),
                                this["container_content"] = this.me["getChildByName"]("content");
                            for (var z = function(o) {
                                    h.tabs.push(h["container_content"]["getChildByName"]("tabs")["getChildByName"]("btn" + o)),
                                        h.tabs[o]["clickHandler"] = Laya["Handler"]["create"](h, function() {
                                            N["select_index"] != o && N["on_change_tab"](o);
                                        }, null, !1);
                                }, h = this, d = 0; 4 > d; d++)
                                z(d);
                            this["page_item"] = new o["UI_Bag_PageItem"](this["container_content"]["getChildByName"]("page_items")),
                                this["page_gift"] = new o["UI_Bag_PageGift"](this["container_content"]["getChildByName"]("page_gift")),
                                this["page_skin"] = new o["UI_Bag_PageSkin"](this["container_content"]["getChildByName"]("page_skin"));
                        },
                        h["prototype"].show = function(N, z) {
                            var h = this;
                            void 0 === N && (N = 0),
                                void 0 === z && (z = null),
                                this["enable"] = !0,
                                this["locking"] = !0,
                                this["closeHandler"] = z,
                                o["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200),
                                o["UIBase"]["anim_alpha_in"](this["container_content"], {
                                    y: 30
                                }, 200),
                                Laya["timer"].once(300, this, function() {
                                    h["locking"] = !1;
                                }),
                                this["on_change_tab"](N),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                3 != N && this["page_skin"]["when_update_data"]();
                        },
                        h["prototype"].hide = function(N) {
                            var z = this;
                            this["locking"] = !0,
                                o["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 200),
                                o["UIBase"]["anim_alpha_out"](this["container_content"], {
                                    y: 30
                                }, 200),
                                Laya["timer"].once(300, this, function() {
                                    z["locking"] = !1,
                                        z["enable"] = !1,
                                        N && N.run();
                                });
                        },
                        h["prototype"]["onDisable"] = function() {
                            this["page_skin"]["close"](),
                                this["page_item"]["close"](),
                                this["page_gift"]["close"]();
                        },
                        h["prototype"]["on_change_tab"] = function(o) {
                            this["select_index"] = o;
                            for (var z = 0; z < this.tabs["length"]; z++)
                                this.tabs[z].skin = game["Tools"]["localUISrc"](o == z ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[z]["getChildAt"](0)["color"] = o == z ? "#d9b263" : "#8cb65f";
                            switch (this["page_item"]["close"](), this["page_gift"]["close"](), this["page_skin"].me["visible"] = !1, o) {
                                case 0:
                                    this["page_item"].show(N["daoju"]);
                                    break;
                                case 1:
                                    this["page_gift"].show();
                                    break;
                                case 2:
                                    this["page_item"].show(N.view);
                                    break;
                                case 3:
                                    this["page_skin"].show();
                            }
                        },
                        h["prototype"]["when_data_change"] = function() {
                            this["page_item"].me["visible"] && this["page_item"]["when_update_data"](),
                                this["page_gift"].me["visible"] && this["page_gift"]["when_update_data"]();
                        },
                        h["prototype"]["on_skin_change"] = function() {
                            this["page_skin"]["when_update_data"]();
                        },
                        h["prototype"]["clear_desktop_btn_redpoint"] = function() {
                            this.tabs[3]["getChildByName"]("redpoint")["visible"] = !1;
                        },
                        h["_item_map"] = {},
                        h["_item_listener"] = {},
                        h["_all_item_listener"] = [],
                        h["_daily_gain_record"] = {},
                        h["new_bag_item_ids"] = [],
                        h["new_zhuangban_item_ids"] = {},
                        h.Inst = null,
                        h;
                }
                (o["UIBase"]);
            o["UI_Bag"] = z;
        }
        (uiscript || (uiscript = {}));




        // 修改牌桌上角色
        ! function(o) {
            var N = function() {
                    function N() {
                        var N = this;
                        this.urls = [],
                            this["link_index"] = -1,
                            this["connect_state"] = o["EConnectState"].none,
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
                            app["NetAgent"]["AddListener2MJ"]("NotifyPlayerLoadGameReady", Laya["Handler"]["create"](this, function(o) {
                                app.Log.log("NotifyPlayerLoadGameReady: " + JSON["stringify"](o)),
                                    N["loaded_player_count"] = o["ready_id_list"]["length"],
                                    N["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](N["loaded_player_count"], N["real_player_count"]);
                            }));
                    }
                    return Object["defineProperty"](N, "Inst", {
                            get: function() {
                                return null == this["_Inst"] ? this["_Inst"] = new N() : this["_Inst"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        N["prototype"]["OpenConnect"] = function(N, z, h, d) {
                            var r = this;
                            uiscript["UI_Loading"].Inst.show("enter_mj"),
                                o["Scene_Lobby"].Inst && o["Scene_Lobby"].Inst["active"] && (o["Scene_Lobby"].Inst["active"] = !1),
                                o["Scene_Huiye"].Inst && o["Scene_Huiye"].Inst["active"] && (o["Scene_Huiye"].Inst["active"] = !1),
                                this["Close"](),
                                view["BgmListMgr"]["stopBgm"](),
                                this["is_ob"] = !1,
                                Laya["timer"].once(500, this, function() {
                                    r.url = '',
                                        r["token"] = N,
                                        r["game_uuid"] = z,
                                        r["server_location"] = h,
                                        GameMgr.Inst["ingame"] = !0,
                                        GameMgr.Inst["mj_server_location"] = h,
                                        GameMgr.Inst["mj_game_token"] = N,
                                        GameMgr.Inst["mj_game_uuid"] = z,
                                        r["playerreconnect"] = d,
                                        r["_setState"](o["EConnectState"]["tryconnect"]),
                                        r["load_over"] = !1,
                                        r["loaded_player_count"] = 0,
                                        r["real_player_count"] = 0,
                                        r["lb_index"] = 0,
                                        r["_fetch_gateway"](0);
                                }),
                                Laya["timer"].loop(300000, this, this["reportInfo"]);
                        },
                        N["prototype"]["reportInfo"] = function() {
                            this["connect_state"] == o["EConnectState"]["connecting"] && GameMgr.Inst["postNewInfo2Server"]("network_route", {
                                client_type: "web",
                                route_type: "game",
                                route_index: o["LobbyNetMgr"]["root_id_lst"][o["LobbyNetMgr"].Inst["choosed_index"]],
                                route_delay: Math.min(10000, Math["round"](app["NetAgent"]["mj_network_delay"])),
                                connection_time: Math["round"](Date.now() - this["_connect_start_time"]),
                                reconnect_count: this["_report_reconnect_count"]
                            });
                        },
                        N["prototype"]["Close"] = function() {
                            this["load_over"] = !1,
                                app.Log.log("MJNetMgr close"),
                                this["_setState"](o["EConnectState"].none),
                                app["NetAgent"]["Close2MJ"](),
                                this.url = '',
                                Laya["timer"]["clear"](this, this["reportInfo"]);
                        },
                        N["prototype"]["_OnConnent"] = function(N) {
                            app.Log.log("MJNetMgr _OnConnent event:" + N),
                                N == Laya["Event"]["CLOSE"] || N == Laya["Event"]["ERROR"] ? Laya["timer"]["currTimer"] - this["lasterrortime"] > 100 && (this["lasterrortime"] = Laya["timer"]["currTimer"], this["connect_state"] == o["EConnectState"]["tryconnect"] ? this["_try_to_linknext"]() : this["connect_state"] == o["EConnectState"]["connecting"] ? view["DesktopMgr"].Inst["active"] ? (view["DesktopMgr"].Inst["duringReconnect"] = !0, this["_setState"](o["EConnectState"]["reconnecting"]), this["reconnect_count"] = 0, this["_Reconnect"]()) : (this["_setState"](o["EConnectState"]["disconnect"]), uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2008)), o["Scene_MJ"].Inst["ForceOut"]()) : this["connect_state"] == o["EConnectState"]["reconnecting"] && this["_Reconnect"]()) : N == Laya["Event"].OPEN && (this["_connect_start_time"] = Date.now(), (this["connect_state"] == o["EConnectState"]["tryconnect"] || this["connect_state"] == o["EConnectState"]["reconnecting"]) && ((this["connect_state"] = o["EConnectState"]["tryconnect"]) ? this["_report_reconnect_count"] = 0 : this["_report_reconnect_count"]++, this["_setState"](o["EConnectState"]["connecting"]), this["is_ob"] ? this["_ConnectSuccessOb"]() : this["_ConnectSuccess"]()));
                        },
                        N["prototype"]["_Reconnect"] = function() {
                            var N = this;
                            o["LobbyNetMgr"].Inst["connect_state"] == o["EConnectState"].none || o["LobbyNetMgr"].Inst["connect_state"] == o["EConnectState"]["disconnect"] ? this["_setState"](o["EConnectState"]["disconnect"]) : o["LobbyNetMgr"].Inst["connect_state"] == o["EConnectState"]["connecting"] && GameMgr.Inst["logined"] ? this["reconnect_count"] >= this["reconnect_span"]["length"] ? this["_setState"](o["EConnectState"]["disconnect"]) : (Laya["timer"].once(this["reconnect_span"][this["reconnect_count"]], this, function() {
                                N["connect_state"] == o["EConnectState"]["reconnecting"] && (app.Log.log("MJNetMgr reconnect count:" + N["reconnect_count"]), app["NetAgent"]["connect2MJ"](N.url, Laya["Handler"]["create"](N, N["_OnConnent"], null, !1), "local" == N["server_location"] ? "/game-gateway" : "/game-gateway-zone"));
                            }), this["reconnect_count"]++) : Laya["timer"].once(1000, this, this["_Reconnect"]);
                        },
                        N["prototype"]["_try_to_linknext"] = function() {
                            this["link_index"]++,
                                this.url = '',
                                app.Log.log("mj _try_to_linknext(" + this["link_index"] + ") url.length=" + this.urls["length"]),
                                this["link_index"] < 0 || this["link_index"] >= this.urls["length"] ? o["LobbyNetMgr"].Inst["polling_connect"] ? (this["lb_index"]++, this["_fetch_gateway"](0)) : (this["_setState"](o["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](59)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && o["Scene_MJ"].Inst["ForceOut"]()) : (app["NetAgent"]["connect2MJ"](this.urls[this["link_index"]].url, Laya["Handler"]["create"](this, this["_OnConnent"], null, !1), "local" == this["server_location"] ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this["link_index"]].url);
                        },
                        N["prototype"]["GetAuthData"] = function() {
                            return {
                                account_id: GameMgr.Inst["account_id"],
                                token: this["token"],
                                game_uuid: this["game_uuid"],
                                gift: CryptoJS["HmacSHA256"](this["token"] + GameMgr.Inst["account_id"] + this["game_uuid"], "damajiang")["toString"]()
                            };
                        },
                        N["prototype"]["_fetch_gateway"] = function(N) {
                            var z = this;
                            if (o["LobbyNetMgr"].Inst["polling_connect"] && this["lb_index"] >= o["LobbyNetMgr"].Inst.urls["length"])
                                return uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](58)), this["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && o["Scene_MJ"].Inst["ForceOut"](), this["_setState"](o["EConnectState"].none), void 0;
                            this.urls = [],
                                this["link_index"] = -1,
                                app.Log.log("mj _fetch_gateway retry_count:" + N);
                            var h = function(h) {
                                    var d = JSON["parse"](h);
                                    if (app.Log.log("mj _fetch_gateway func_success data = " + h), d["maintenance"])
                                        z["_setState"](o["EConnectState"].none), uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2009)), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && o["Scene_MJ"].Inst["ForceOut"]();
                                    else if (d["servers"] && d["servers"]["length"] > 0) {
                                        for (var r = d["servers"], k = o["Tools"]["deal_gateway"](r), T = 0; T < k["length"]; T++)
                                            z.urls.push({
                                                name: "___" + T,
                                                url: k[T]
                                            });
                                        z["link_index"] = -1,
                                            z["_try_to_linknext"]();
                                    } else
                                        1 > N ? Laya["timer"].once(1000, z, function() {
                                            z["_fetch_gateway"](N + 1);
                                        }) : o["LobbyNetMgr"].Inst["polling_connect"] ? (z["lb_index"]++, z["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](60)), z["_SendDebugInfo"](), view["DesktopMgr"].Inst && !view["DesktopMgr"].Inst["active"] && o["Scene_MJ"].Inst["ForceOut"](), z["_setState"](o["EConnectState"].none));
                                },
                                d = function() {
                                    app.Log.log("mj _fetch_gateway func_error"),
                                        1 > N ? Laya["timer"].once(500, z, function() {
                                            z["_fetch_gateway"](N + 1);
                                        }) : o["LobbyNetMgr"].Inst["polling_connect"] ? (z["lb_index"]++, z["_fetch_gateway"](0)) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](58)), z["_SendDebugInfo"](), view["DesktopMgr"].Inst["active"] || o["Scene_MJ"].Inst["ForceOut"](), z["_setState"](o["EConnectState"].none));
                                },
                                r = function(o) {
                                    var N = new Laya["HttpRequest"]();
                                    N.once(Laya["Event"]["COMPLETE"], z, function(o) {
                                            h(o);
                                        }),
                                        N.once(Laya["Event"]["ERROR"], z, function() {
                                            d();
                                        });
                                    var r = [];
                                    r.push("If-Modified-Since"),
                                        r.push('0'),
                                        o += "?service=ws-game-gateway",
                                        o += GameMgr["inHttps"] ? "&protocol=ws&ssl=true" : "&protocol=ws&ssl=false",
                                        o += "&location=" + z["server_location"],
                                        o += "&rv=" + Math["floor"](10000000 * Math["random"]()) + Math["floor"](10000000 * Math["random"]()),
                                        N.send(o, '', "get", "text", r),
                                        app.Log.log("mj _fetch_gateway func_fetch url = " + o);
                                };
                            o["LobbyNetMgr"].Inst["polling_connect"] ? r(o["LobbyNetMgr"].Inst.urls[this["lb_index"]]) : r(o["LobbyNetMgr"].Inst["lb_url"]);
                        },
                        N["prototype"]["_setState"] = function(N) {
                            this["connect_state"] = N,
                                GameMgr["inRelease"] || null != uiscript["UI_Common"].Inst && (N == o["EConnectState"].none ? uiscript["UI_Common"].Inst["label_net_mj"].text = '' : N == o["EConnectState"]["tryconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "尝试连接麻将服务器", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#000000") : N == o["EConnectState"]["connecting"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正常", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#00ff00") : N == o["EConnectState"]["disconnect"] ? (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：断开连接", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()) : N == o["EConnectState"]["reconnecting"] && (uiscript["UI_Common"].Inst["label_net_mj"].text = "麻将服务器：正在重连", uiscript["UI_Common"].Inst["label_net_mj"]["color"] = "#ff0000", uiscript["UI_Disconnect"].Inst && uiscript["UI_Disconnect"].Inst.show()));
                        },
                        N["prototype"]["_ConnectSuccess"] = function() {
                            var N = this;
                            app.Log.log("MJNetMgr _ConnectSuccess "),
                                this["load_over"] = !1,
                                app["NetAgent"]["sendReq2MJ"]("FastTest", "authGame", this["GetAuthData"](), function(z, h) {
                                    if (z || h["error"])
                                        uiscript["UIMgr"].Inst["showNetReqError"]("authGame", z, h), o["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                    else {
                                        app.Log.log("麻将桌验证通过：" + JSON["stringify"](h)),
                                            uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                                        // 强制打开便捷提示
                                        if (MMP.settings.setbianjietishi) {
                                            h['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                        }
                                        // END
                                        // 增加对mahjong-helper的兼容
                                        // 发送游戏对局
                                        if (MMP.settings.sendGame == true) {
                                            GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(h),
                                                onload: function(msg) {
                                                    console.log('[雀魂mod_plus] 已成功发送牌局');
                                                }
                                            });
                                        }
                                        //END
                                        var d = [],
                                            r = 0;
                                        view["DesktopMgr"]["player_link_state"] = h["state_list"];
                                        var k = o["Tools"]["strOfLocalization"](2003),
                                            T = h["game_config"].mode,
                                            M = view["ERuleMode"]["Liqi4"];
                                        T.mode < 10 ? (M = view["ERuleMode"]["Liqi4"], N["real_player_count"] = 4) : T.mode < 20 && (M = view["ERuleMode"]["Liqi3"], N["real_player_count"] = 3);
                                        for (var C = 0; C < N["real_player_count"]; C++)
                                            d.push(null);
                                        T["extendinfo"] && (k = o["Tools"]["strOfLocalization"](2004)),
                                            T["detail_rule"] && T["detail_rule"]["ai_level"] && (1 === T["detail_rule"]["ai_level"] && (k = o["Tools"]["strOfLocalization"](2003)), 2 === T["detail_rule"]["ai_level"] && (k = o["Tools"]["strOfLocalization"](2004)));
                                        for (var g = o["GameUtility"]["get_default_ai_skin"](), H = o["GameUtility"]["get_default_ai_character"](), C = 0; C < h["seat_list"]["length"]; C++) {
                                            var i = h["seat_list"][C];
                                            if (0 == i) {
                                                d[C] = {
                                                    nickname: k,
                                                    avatar_id: g,
                                                    level: {
                                                        id: "10101"
                                                    },
                                                    level3: {
                                                        id: "20101"
                                                    },
                                                    character: {
                                                        charid: H,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: g,
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
                                                        d[C].avatar_id = skin.id;
                                                        d[C].character.charid = skin.character_id;
                                                        d[C].character.skin = skin.id;
                                                    }
                                                }
                                                if (MMP.settings.showServer == true) {
                                                    d[C].nickname = '[BOT]' + d[C].nickname;
                                                }
                                            } else {
                                                r++;
                                                for (var l = 0; l < h["players"]["length"]; l++)
                                                    if (h["players"][l]["account_id"] == i) {
                                                        d[C] = h["players"][l];
                                                        //修改牌桌上人物头像及皮肤
                                                        if (d[C].account_id == GameMgr.Inst.account_id) {
                                                            d[C].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                            d[C].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                            d[C].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                            d[C].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                            d[C].title = GameMgr.Inst.account_data.title;
                                                            if (MMP.settings.nickname != '') {
                                                                d[C].nickname = MMP.settings.nickname;
                                                            }
                                                        } else if (MMP.settings.randomPlayerDefSkin && (d[C].avatar_id == 400101 || d[C].avatar_id == 400201)) {
                                                            //玩家如果用了默认皮肤也随机换
                                                            let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                            let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                            let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                            // 修复皮肤错误导致无法进入游戏的bug
                                                            if (skin.id != 400000 && skin.id != 400001) {
                                                                d[C].avatar_id = skin.id;
                                                                d[C].character.charid = skin.character_id;
                                                                d[C].character.skin = skin.id;
                                                            }
                                                        }
                                                        if (MMP.settings.showServer == true) {
                                                            let server = game.Tools.get_zone_id(d[C].account_id);
                                                            if (server == 1) {
                                                                d[C].nickname = '[CN]' + d[C].nickname;
                                                            } else if (server == 2) {
                                                                d[C].nickname = '[JP]' + d[C].nickname;
                                                            } else if (server == 3) {
                                                                d[C].nickname = '[EN]' + d[C].nickname;
                                                            } else {
                                                                d[C].nickname = '[??]' + d[C].nickname;
                                                            }
                                                        }
                                                        // END
                                                        break;
                                                    }
                                            }
                                        }
                                        for (var C = 0; C < N["real_player_count"]; C++)
                                            null == d[C] && (d[C] = {
                                                account: 0,
                                                nickname: o["Tools"]["strOfLocalization"](2010),
                                                avatar_id: g,
                                                level: {
                                                    id: "10101"
                                                },
                                                level3: {
                                                    id: "20101"
                                                },
                                                character: {
                                                    charid: H,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: g,
                                                    is_upgraded: !1
                                                }
                                            });
                                        N["loaded_player_count"] = h["ready_id_list"]["length"],
                                            N["_AuthSuccess"](d, h["is_game_start"], h["game_config"]["toJSON"]());
                                    }
                                });
                        },
                        N["prototype"]["_AuthSuccess"] = function(N, z, h) {
                            var d = this;
                            view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function() {
                                app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                    view["DesktopMgr"].Inst["Reset"](),
                                    view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                    uiscript["UI_Loading"].Inst["setProgressVal"](0.2),
                                    app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                        round_id: view["DesktopMgr"].Inst["round_id"],
                                        step: view["DesktopMgr"].Inst["current_step"]
                                    }, function(N, z) {
                                        N || z["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", N, z), o["Scene_MJ"].Inst["ForceOut"]()) : (app.Log.log("[syncGame] " + JSON["stringify"](z)), z["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2011)), o["Scene_MJ"].Inst["GameEnd"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.3), view["DesktopMgr"].Inst["fetchLinks"](), view["DesktopMgr"].Inst["Reset"](), view["DesktopMgr"].Inst["duringReconnect"] = !0, view["DesktopMgr"].Inst["syncGameByStep"](z["game_restore"])));
                                    });
                            })) : o["Scene_MJ"].Inst["openMJRoom"](h, N, Laya["Handler"]["create"](this, function() {
                                view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](h)), N, GameMgr.Inst["account_id"], view["EMJMode"].play, Laya["Handler"]["create"](d, function() {
                                    z ? Laya["timer"]["frameOnce"](10, d, function() {
                                        app.Log.log("重连信息2 round_id:-1 step:" + 1000000),
                                            view["DesktopMgr"].Inst["Reset"](),
                                            view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                            app["NetAgent"]["sendReq2MJ"]("FastTest", "syncGame", {
                                                round_id: '-1',
                                                step: 1000000
                                            }, function(N, z) {
                                                app.Log.log("syncGame " + JSON["stringify"](z)),
                                                    N || z["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("syncGame", N, z), o["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), view["DesktopMgr"].Inst["fetchLinks"](), d["_PlayerReconnectSuccess"](z));
                                            });
                                    }) : Laya["timer"]["frameOnce"](10, d, function() {
                                        app.Log.log("send enterGame"),
                                            view["DesktopMgr"].Inst["Reset"](),
                                            view["DesktopMgr"].Inst["duringReconnect"] = !0,
                                            app["NetAgent"]["sendReq2MJ"]("FastTest", "enterGame", {}, function(N, z) {
                                                N || z["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("enterGame", N, z), o["Scene_MJ"].Inst["ForceOut"]()) : (uiscript["UI_Loading"].Inst["setProgressVal"](1), app.Log.log("enterGame"), d["_EnterGame"](z), view["DesktopMgr"].Inst["fetchLinks"]());
                                            });
                                    });
                                }));
                            }), Laya["Handler"]["create"](this, function(o) {
                                return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.8 * o);
                            }, null, !1));
                        },
                        N["prototype"]["_EnterGame"] = function(N) {
                            app.Log.log("正常进入游戏: " + JSON["stringify"](N)),
                                N["is_end"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2011)), o["Scene_MJ"].Inst["GameEnd"]()) : N["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](N["game_restore"]) : (this["load_over"] = !0, this["load_over"] && uiscript["UI_Loading"].Inst["enable"] && uiscript["UI_Loading"].Inst["showLoadCount"](this["loaded_player_count"], this["real_player_count"]), view["DesktopMgr"].Inst["duringReconnect"] = !1, view["DesktopMgr"].Inst["StartChainAction"](0));
                        },
                        N["prototype"]["_PlayerReconnectSuccess"] = function(N) {
                            app.Log.log("_PlayerReconnectSuccess data:" + JSON["stringify"](N)),
                                N["isEnd"] ? (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2011)), o["Scene_MJ"].Inst["GameEnd"]()) : N["game_restore"] ? view["DesktopMgr"].Inst["syncGameByStep"](N["game_restore"]) : (uiscript["UIMgr"].Inst["ShowErrorInfo"](o["Tools"]["strOfLocalization"](2012)), o["Scene_MJ"].Inst["ForceOut"]());
                        },
                        N["prototype"]["_SendDebugInfo"] = function() {},
                        N["prototype"]["OpenConnectObserve"] = function(N, z) {
                            var h = this;
                            this["is_ob"] = !0,
                                uiscript["UI_Loading"].Inst.show("enter_mj"),
                                this["Close"](),
                                view["AudioMgr"]["StopMusic"](),
                                Laya["timer"].once(500, this, function() {
                                    h["server_location"] = z,
                                        h["ob_token"] = N,
                                        h["_setState"](o["EConnectState"]["tryconnect"]),
                                        h["lb_index"] = 0,
                                        h["_fetch_gateway"](0);
                                });
                        },
                        N["prototype"]["_ConnectSuccessOb"] = function() {
                            var N = this;
                            app.Log.log("MJNetMgr _ConnectSuccessOb "),
                                app["NetAgent"]["sendReq2MJ"]("FastTest", "authObserve", {
                                    token: this["ob_token"]
                                }, function(z, h) {
                                    z || h["error"] ? (uiscript["UIMgr"].Inst["showNetReqError"]("authObserve", z, h), o["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]()) : (app.Log.log("实时OB验证通过：" + JSON["stringify"](h)), uiscript["UI_Loading"].Inst["setProgressVal"](0.3), uiscript["UI_Live_Broadcast"].Inst && uiscript["UI_Live_Broadcast"].Inst["clearPendingUnits"](), app["NetAgent"]["sendReq2MJ"]("FastTest", "startObserve", {}, function(z, h) {
                                        if (z || h["error"])
                                            uiscript["UIMgr"].Inst["showNetReqError"]("startObserve", z, h), o["Scene_MJ"].Inst["GameEnd"](), view["BgmListMgr"]["PlayLobbyBgm"]();
                                        else {
                                            var d = h.head,
                                                r = d["game_config"].mode,
                                                k = [],
                                                T = o["Tools"]["strOfLocalization"](2003),
                                                M = view["ERuleMode"]["Liqi4"];
                                            r.mode < 10 ? (M = view["ERuleMode"]["Liqi4"], N["real_player_count"] = 4) : r.mode < 20 && (M = view["ERuleMode"]["Liqi3"], N["real_player_count"] = 3);
                                            for (var C = 0; C < N["real_player_count"]; C++)
                                                k.push(null);
                                            r["extendinfo"] && (T = o["Tools"]["strOfLocalization"](2004)),
                                                r["detail_rule"] && r["detail_rule"]["ai_level"] && (1 === r["detail_rule"]["ai_level"] && (T = o["Tools"]["strOfLocalization"](2003)), 2 === r["detail_rule"]["ai_level"] && (T = o["Tools"]["strOfLocalization"](2004)));
                                            for (var g = o["GameUtility"]["get_default_ai_skin"](), H = o["GameUtility"]["get_default_ai_character"](), C = 0; C < d["seat_list"]["length"]; C++) {
                                                var i = d["seat_list"][C];
                                                if (0 == i)
                                                    k[C] = {
                                                        nickname: T,
                                                        avatar_id: g,
                                                        level: {
                                                            id: "10101"
                                                        },
                                                        level3: {
                                                            id: "20101"
                                                        },
                                                        character: {
                                                            charid: H,
                                                            level: 0,
                                                            exp: 0,
                                                            views: [],
                                                            skin: g,
                                                            is_upgraded: !1
                                                        }
                                                    };
                                                else
                                                    for (var l = 0; l < d["players"]["length"]; l++)
                                                        if (d["players"][l]["account_id"] == i) {
                                                            k[C] = d["players"][l];
                                                            break;
                                                        }
                                            }
                                            for (var C = 0; C < N["real_player_count"]; C++)
                                                null == k[C] && (k[C] = {
                                                    account: 0,
                                                    nickname: o["Tools"]["strOfLocalization"](2010),
                                                    avatar_id: g,
                                                    level: {
                                                        id: "10101"
                                                    },
                                                    level3: {
                                                        id: "20101"
                                                    },
                                                    character: {
                                                        charid: H,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: g,
                                                        is_upgraded: !1
                                                    }
                                                });
                                            N["_StartObSuccuess"](k, h["passed"], d["game_config"]["toJSON"](), d["start_time"]);
                                        }
                                    }));
                                });
                        },
                        N["prototype"]["_StartObSuccuess"] = function(N, z, h, d) {
                            var r = this;
                            view["DesktopMgr"].Inst && view["DesktopMgr"].Inst["active"] ? (this["load_over"] = !0, Laya["timer"].once(500, this, function() {
                                app.Log.log("重连信息1 round_id:" + view["DesktopMgr"].Inst["round_id"] + " step:" + view["DesktopMgr"].Inst["current_step"]),
                                    view["DesktopMgr"].Inst["Reset"](),
                                    uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](d, z);
                            })) : (uiscript["UI_Loading"].Inst["setProgressVal"](0.4), o["Scene_MJ"].Inst["openMJRoom"](h, N, Laya["Handler"]["create"](this, function() {
                                view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](h)), N, GameMgr.Inst["account_id"], view["EMJMode"]["live_broadcast"], Laya["Handler"]["create"](r, function() {
                                    uiscript["UI_Loading"].Inst["setProgressVal"](0.9),
                                        Laya["timer"].once(1000, r, function() {
                                            GameMgr.Inst["EnterMJ"](),
                                                uiscript["UI_Loading"].Inst["setProgressVal"](0.95),
                                                uiscript["UI_Live_Broadcast"].Inst["startRealtimeLive"](d, z);
                                        });
                                }));
                            }), Laya["Handler"]["create"](this, function(o) {
                                return uiscript["UI_Loading"].Inst["setProgressVal"](0.4 + 0.4 * o);
                            }, null, !1)));
                        },
                        N["_Inst"] = null,
                        N;
                }
                ();
            o["MJNetMgr"] = N;
        }
        (game || (game = {}));




        // 读取战绩
        ! function(o) {
            var N = function(N) {
                    function z() {
                        var o = N.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["both_ui"]["otherplayerinfoUI"]() : new ui["both_ui"]["otherplayerinfo_enUI"]()) || this;
                        return o["account_id"] = 0,
                            o["origin_x"] = 0,
                            o["origin_y"] = 0,
                            o.root = null,
                            o["title"] = null,
                            o["level"] = null,
                            o["btn_addfriend"] = null,
                            o["btn_report"] = null,
                            o["illust"] = null,
                            o.name = null,
                            o["detail_data"] = null,
                            o["achievement_data"] = null,
                            o["locking"] = !1,
                            o["tab_info4"] = null,
                            o["tab_info3"] = null,
                            o["tab_note"] = null,
                            o["tab_img_dark"] = '',
                            o["tab_img_chosen"] = '',
                            o["player_data"] = null,
                            o["tab_index"] = 1,
                            o["game_category"] = 1,
                            o["game_type"] = 1,
                            z.Inst = o,
                            o;
                    }
                    return __extends(z, N),
                        z["prototype"]["onCreate"] = function() {
                            var N = this;
                            "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tab_dark.png")) : (this["tab_img_chosen"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_chosen.png"), this["tab_img_dark"] = game["Tools"]["localUISrc"]("myres/bothui/info_tabheng_dark.png")),
                                this.root = this.me["getChildByName"]("root"),
                                this["origin_x"] = this.root.x,
                                this["origin_y"] = this.root.y,
                                this["container_info"] = this.root["getChildByName"]("container_info"),
                                this["title"] = new o["UI_PlayerTitle"](this["container_info"]["getChildByName"]("title"), "UI_OtherPlayerInfo"),
                                this.name = this["container_info"]["getChildByName"]("name"),
                                this["level"] = new o["UI_Level"](this["container_info"]["getChildByName"]("rank"), "UI_OtherPlayerInfo"),
                                this["detail_data"] = new o["UI_PlayerData"](this["container_info"]["getChildByName"]("data")),
                                this["achievement_data"] = new o["UI_Achievement_Light"](this["container_info"]["getChildByName"]("achievement")),
                                this["illust"] = new o["UI_Character_Skin"](this.root["getChildByName"]("illust")["getChildByName"]("illust")),
                                this["btn_addfriend"] = this["container_info"]["getChildByName"]("btn_add"),
                                this["btn_addfriend"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["btn_addfriend"]["visible"] = !1,
                                        N["btn_report"].x = 343,
                                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "applyFriend", {
                                            target_id: N["account_id"]
                                        }, function() {});
                                }, null, !1),
                                this["btn_report"] = this["container_info"]["getChildByName"]("btn_report"),
                                this["btn_report"]["clickHandler"] = new Laya["Handler"](this, function() {
                                    o["UI_Report_Nickname"].Inst.show(N["account_id"]);
                                }),
                                this.me["getChildAt"](0)["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["locking"] || N["close"]();
                                }, null, !1),
                                this.root["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["close"]();
                                }, null, !1),
                                this.note = new o["UI_PlayerNote"](this.root["getChildByName"]("container_note"), null),
                                this["tab_info4"] = this.root["getChildByName"]("tab_info4"),
                                this["tab_info4"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["locking"] || 1 != N["tab_index"] && N["changeMJCategory"](1);
                                }, null, !1),
                                this["tab_info3"] = this.root["getChildByName"]("tab_info3"),
                                this["tab_info3"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["locking"] || 2 != N["tab_index"] && N["changeMJCategory"](2);
                                }, null, !1),
                                this["tab_note"] = this.root["getChildByName"]("tab_note"),
                                this["tab_note"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["locking"] || "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"] && (game["Tools"]["during_chat_close"]() ? o["UIMgr"].Inst["ShowErrorInfo"]("功能维护中，祝大家新年快乐") : N["container_info"]["visible"] && (N["container_info"]["visible"] = !1, N["tab_info4"].skin = N["tab_img_dark"], N["tab_info3"].skin = N["tab_img_dark"], N["tab_note"].skin = N["tab_img_chosen"], N["tab_index"] = 3, N.note.show()));
                                }, null, !1),
                                this["locking"] = !1;
                        },
                        z["prototype"].show = function(N, z, h, d) {
                            var r = this;
                            void 0 === z && (z = 1),
                                void 0 === h && (h = 2),
                                void 0 === d && (d = 1),
                                GameMgr.Inst["BehavioralStatistics"](14),
                                this["account_id"] = N,
                                this["enable"] = !0,
                                this["locking"] = !0,
                                this.root.y = this["origin_y"],
                                this["player_data"] = null,
                                o["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function() {
                                    r["locking"] = !1;
                                })),
                                this["detail_data"]["reset"](),
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountStatisticInfo", {
                                    account_id: N
                                }, function(z, h) {
                                    z || h["error"] ? o["UIMgr"].Inst["showNetReqError"]("fetchAccountStatisticInfo", z, h) : o["UI_Shilian"]["now_season_info"] && 1001 == o["UI_Shilian"]["now_season_info"]["season_id"] && 3 != o["UI_Shilian"]["get_cur_season_state"]() ? (r["detail_data"]["setData"](h), r["changeMJCategory"](r["tab_index"], r["game_category"], r["game_type"])) : app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountChallengeRankInfo", {
                                        account_id: N
                                    }, function(N, z) {
                                        N || z["error"] ? o["UIMgr"].Inst["showNetReqError"]("fetchAccountChallengeRankInfo", N, z) : (h["season_info"] = z["season_info"], r["detail_data"]["setData"](h), r["changeMJCategory"](r["tab_index"], r["game_category"], r["game_type"]));
                                    });
                                }),
                                this.note["init_data"](N),
                                this["refreshBaseInfo"](),
                                this["btn_report"]["visible"] = N != GameMgr.Inst["account_id"],
                                this["tab_index"] = z,
                                this["game_category"] = h,
                                this["game_type"] = d,
                                this["container_info"]["visible"] = !0,
                                this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                                this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                                this["tab_note"].skin = this["tab_img_dark"],
                                this.note["close"](),
                                this["tab_note"]["visible"] = "chs" != GameMgr["client_type"] && "chs_t" != GameMgr["client_type"],
                                this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                        },
                        z["prototype"]["refreshBaseInfo"] = function() {
                            var N = this;
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
                                }, function(z, h) {
                                    if (z || h["error"])
                                        o["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", z, h);
                                    else {
                                        var d = h["account"];
                                        //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                        if (d.account_id == GameMgr.Inst.account_id) {
                                            d.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                d.title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                d.nickname = MMP.settings.nickname;
                                            }
                                        }
                                        //end
                                        N["player_data"] = d,
                                            game["Tools"]["SetNickname"](N.name, d),
                                            N["title"].id = game["Tools"]["titleLocalization"](d["account_id"], d["title"]),
                                            N["level"].id = d["level"].id,
                                            N["level"].id = N["player_data"][1 == N["tab_index"] ? "level" : "level3"].id,
                                            N["level"].exp = N["player_data"][1 == N["tab_index"] ? "level" : "level3"]["score"],
                                            N["illust"].me["visible"] = !0,
                                            N["account_id"] == GameMgr.Inst["account_id"] ? N["illust"]["setSkin"](d["avatar_id"], "waitingroom") : N["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](d["avatar_id"]), "waitingroom"),
                                            game["Tools"]["is_same_zone"](GameMgr.Inst["account_id"], N["account_id"]) && N["account_id"] != GameMgr.Inst["account_id"] && null == game["FriendMgr"].find(N["account_id"]) ? (N["btn_addfriend"]["visible"] = !0, N["btn_report"].x = 520) : (N["btn_addfriend"]["visible"] = !1, N["btn_report"].x = 343),
                                            N.note.sign["setSign"](d["signature"]),
                                            N["achievement_data"].show(!1, d["achievement_count"]);
                                    }
                                });
                        },
                        z["prototype"]["changeMJCategory"] = function(o, N, z) {
                            void 0 === N && (N = 2),
                                void 0 === z && (z = 1),
                                this["tab_index"] = o,
                                this["container_info"]["visible"] = !0,
                                this["detail_data"]["changeMJCategory"](o, N, z),
                                this["tab_info4"].skin = 1 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                                this["tab_info3"].skin = 2 == this["tab_index"] ? this["tab_img_chosen"] : this["tab_img_dark"],
                                this["tab_note"].skin = this["tab_img_dark"],
                                this.note["close"](),
                                this["player_data"] ? (this["level"].id = this["player_data"][1 == this["tab_index"] ? "level" : "level3"].id, this["level"].exp = this["player_data"][1 == this["tab_index"] ? "level" : "level3"]["score"]) : (this["level"].id = 1 == this["tab_index"] ? "10101" : "20101", this["level"].exp = 0);
                        },
                        z["prototype"]["close"] = function() {
                            var N = this;
                            this["enable"] && (this["locking"] || (this["locking"] = !0, this["detail_data"]["close"](), o["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function() {
                                N["locking"] = !1,
                                    N["enable"] = !1;
                            }))));
                        },
                        z["prototype"]["onEnable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !0);
                        },
                        z["prototype"]["onDisable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_OtherPlayerInfo", !1),
                                this["detail_data"]["close"](),
                                this["illust"]["clear"](),
                                Laya["loader"]["clearTextureRes"](this["level"].icon.skin);
                        },
                        z.Inst = null,
                        z;
                }
                (o["UIBase"]);
            o["UI_OtherPlayerInfo"] = N;
        }
        (uiscript || (uiscript = {}));




        // 宿舍相关
        ! function(o) {
            var N = function() {
                    function N(N, h) {
                        var d = this;
                        this["_scale"] = 1,
                            this["during_move"] = !1,
                            this["mouse_start_x"] = 0,
                            this["mouse_start_y"] = 0,
                            this.me = N,
                            this["container_illust"] = h,
                            this["illust"] = this["container_illust"]["getChildByName"]("illust"),
                            this["container_move"] = N["getChildByName"]("move"),
                            this["container_move"].on("mousedown", this, function() {
                                d["during_move"] = !0,
                                    d["mouse_start_x"] = d["container_move"]["mouseX"],
                                    d["mouse_start_y"] = d["container_move"]["mouseY"];
                            }),
                            this["container_move"].on("mousemove", this, function() {
                                d["during_move"] && (d.move(d["container_move"]["mouseX"] - d["mouse_start_x"], d["container_move"]["mouseY"] - d["mouse_start_y"]), d["mouse_start_x"] = d["container_move"]["mouseX"], d["mouse_start_y"] = d["container_move"]["mouseY"]);
                            }),
                            this["container_move"].on("mouseup", this, function() {
                                d["during_move"] = !1;
                            }),
                            this["container_move"].on("mouseout", this, function() {
                                d["during_move"] = !1;
                            }),
                            this["btn_close"] = N["getChildByName"]("btn_close"),
                            this["btn_close"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                d["locking"] || d["close"]();
                            }, null, !1),
                            this["scrollbar"] = N["getChildByName"]("scrollbar")["scriptMap"]["capsui.CScrollBar"],
                            this["scrollbar"].init(new Laya["Handler"](this, function(o) {
                                d["_scale"] = 1 * (1 - o) + 0.5,
                                    d["illust"]["scaleX"] = d["_scale"],
                                    d["illust"]["scaleY"] = d["_scale"],
                                    d["scrollbar"]["setVal"](o, 0);
                            })),
                            this["dongtai_kaiguan"] = new o["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function() {
                                z.Inst["illust"]["resetSkin"]();
                            }), new Laya["Handler"](this, function(o) {
                                z.Inst["illust"]["playAnim"](o);
                            })),
                            this["dongtai_kaiguan"]["setKaiguanPos"](-462, -536);
                    }
                    return Object["defineProperty"](N["prototype"], "scale", {
                            get: function() {
                                return this["_scale"];
                            },
                            set: function(o) {
                                this["_scale"] = o,
                                    this["scrollbar"]["setVal"](1 - (o - 0.5) / 1, 0);
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        N["prototype"].show = function(N) {
                            var h = this;
                            this["locking"] = !0,
                                this["when_close"] = N,
                                this["illust_start_x"] = this["illust"].x,
                                this["illust_start_y"] = this["illust"].y,
                                this["illust_center_x"] = this["illust"].x + 984 - 446,
                                this["illust_center_y"] = this["illust"].y + 11 - 84,
                                this["container_illust"]["getChildByName"]("container_name")["visible"] = !1,
                                this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !1,
                                this["container_illust"]["getChildByName"]("btn")["visible"] = !1,
                                z.Inst["stopsay"](),
                                this["scale"] = 1,
                                Laya["Tween"].to(this["illust"], {
                                    x: this["illust_center_x"],
                                    y: this["illust_center_y"]
                                }, 200),
                                o["UIBase"]["anim_pop_out"](this["btn_close"], null),
                                this["during_move"] = !1,
                                Laya["timer"].once(250, this, function() {
                                    h["locking"] = !1;
                                }),
                                this.me["visible"] = !0,
                                this["dongtai_kaiguan"]["refresh"](z.Inst["illust"]["skin_id"]);
                        },
                        N["prototype"]["close"] = function() {
                            var N = this;
                            this["locking"] = !0,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? this["container_illust"]["getChildByName"]("container_name")["visible"] = !0 : this["container_illust"]["getChildByName"]("container_name_en")["visible"] = !0,
                                this["container_illust"]["getChildByName"]("btn")["visible"] = !0,
                                Laya["Tween"].to(this["illust"], {
                                    x: this["illust_start_x"],
                                    y: this["illust_start_y"],
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200),
                                o["UIBase"]["anim_pop_hide"](this["btn_close"], null),
                                Laya["timer"].once(250, this, function() {
                                    N["locking"] = !1,
                                        N.me["visible"] = !1,
                                        N["when_close"].run();
                                });
                        },
                        N["prototype"].move = function(o, N) {
                            var z = this["illust"].x + o,
                                h = this["illust"].y + N;
                            z < this["illust_center_x"] - 600 ? z = this["illust_center_x"] - 600 : z > this["illust_center_x"] + 600 && (z = this["illust_center_x"] + 600),
                                h < this["illust_center_y"] - 1200 ? h = this["illust_center_y"] - 1200 : h > this["illust_center_y"] + 800 && (h = this["illust_center_y"] + 800),
                                this["illust"].x = z,
                                this["illust"].y = h;
                        },
                        N;
                }
                (),
                z = function(z) {
                    function h() {
                        var o = z.call(this, new ui["lobby"]["susheUI"]()) || this;
                        return o["contianer_illust"] = null,
                            o["illust"] = null,
                            o["illust_rect"] = null,
                            o["container_name"] = null,
                            o["label_name"] = null,
                            o["label_cv"] = null,
                            o["label_cv_title"] = null,
                            o["container_page"] = null,
                            o["container_look_illust"] = null,
                            o["page_select_character"] = null,
                            o["page_visit_character"] = null,
                            o["origin_illust_x"] = 0,
                            o["chat_id"] = 0,
                            o["container_chat"] = null,
                            o["_select_index"] = 0,
                            o["sound_channel"] = null,
                            o["chat_block"] = null,
                            o["illust_showing"] = !0,
                            h.Inst = o,
                            o;
                    }
                    return __extends(h, z),
                        h.init = function(N) {
                            var z = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchCharacterInfo", {}, function(d, r) {
                                    if (d || r["error"])
                                        o["UIMgr"].Inst["showNetReqError"]("fetchCharacterInfo", d, r);
                                    else {
                                        if (app.Log.log("fetchCharacterInfo: " + JSON["stringify"](r)), r = JSON["parse"](JSON["stringify"](r)), r["main_character_id"] && r["characters"]) {
                                            //  if (z["characters"] = [], r["characters"])
                                            //  for (var k = 0; k < r["characters"]["length"]; k++)
                                            //  z["characters"].push(r["characters"][k]);
                                            //  if (z["skin_map"] = {}, r["skins"])
                                            //    for (var k = 0; k < r["skins"]["length"]; k++)
                                            //     z["skin_map"][r["skins"][k]] = 1;
                                            //    z["main_character_id"] = r["main_character_id"];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            z.characters = [];
                                            for (var j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                var id = 200000 + j;
                                                var skin = 400001 + j * 100;
                                                z.characters.push({
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
                                            z.main_character_id = MMP.settings.character;
                                            GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                            uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                            z.star_chars = MMP.settings.star_chars;
                                            r.character_sort = MMP.settings.star_chars;
                                            // END
                                        } else
                                            z["characters"] = [], z["characters"].push({
                                                charid: "200001",
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: "400101",
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), z["characters"].push({
                                                charid: "200002",
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: "400201",
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), z["skin_map"]["400101"] = 1, z["skin_map"]["400201"] = 1, z["main_character_id"] = "200001";
                                        if (z["send_gift_count"] = 0, z["send_gift_limit"] = 0, r["send_gift_count"] && (z["send_gift_count"] = r["send_gift_count"]), r["send_gift_limit"] && (z["send_gift_limit"] = r["send_gift_limit"]), r["finished_endings"])
                                            for (var k = 0; k < r["finished_endings"]["length"]; k++)
                                                z["finished_endings_map"][r["finished_endings"][k]] = 1;
                                        if (r["rewarded_endings"])
                                            for (var k = 0; k < r["rewarded_endings"]["length"]; k++)
                                                z["rewarded_endings_map"][r["rewarded_endings"][k]] = 1;
                                        if (z["star_chars"] = [], r["character_sort"] && (z["star_chars"] = r["character_sort"]), h["hidden_characters_map"] = {}, r["hidden_characters"])
                                            for (var T = 0, M = r["hidden_characters"]; T < M["length"]; T++) {
                                                var C = M[T];
                                                h["hidden_characters_map"][C] = 1;
                                            }
                                        N.run();
                                    }
                                }),
                                //app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAllCommonViews", {}, function (N, h) {
                                //    if (N || h["error"])
                                //        o["UIMgr"].Inst["showNetReqError"]("fetchAllCommonViews", N, h);
                                //    else {
                                //        z["using_commonview_index"] = h.use,
                                //        z["commonViewList"] = [[], [], [], [], [], [], [], []];
                                //        var d = h["views"];
                                //        if (d)
                                //            for (var r = 0; r < d["length"]; r++) {
                                //                var k = d[r]["values"];
                                //                k && (z["commonViewList"][d[r]["index"]] = k);
                                //            }
                                z.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst["load_mjp_view"](),
                                GameMgr.Inst["load_touming_mjp_view"]();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //});
                        },
                        h["on_data_updata"] = function(N) {
                            if (N["character"]) {
                                var z = JSON["parse"](JSON["stringify"](N["character"]));
                                if (z["characters"])
                                    for (var h = z["characters"], d = 0; d < h["length"]; d++) {
                                        for (var r = !1, k = 0; k < this["characters"]["length"]; k++)
                                            if (this["characters"][k]["charid"] == h[d]["charid"]) {
                                                this["characters"][k] = h[d],
                                                    o["UI_Sushe_Visit"].Inst && o["UI_Sushe_Visit"].Inst["chara_info"] && o["UI_Sushe_Visit"].Inst["chara_info"]["charid"] == this["characters"][k]["charid"] && (o["UI_Sushe_Visit"].Inst["chara_info"] = this["characters"][k]),
                                                    r = !0;
                                                break;
                                            }
                                        r || this["characters"].push(h[d]);
                                    }
                                if (z["skins"]) {
                                    for (var T = z["skins"], d = 0; d < T["length"]; d++)
                                        this["skin_map"][T[d]] = 1;
                                    o["UI_Bag"].Inst["on_skin_change"]();
                                }
                                if (z["finished_endings"]) {
                                    for (var M = z["finished_endings"], d = 0; d < M["length"]; d++)
                                        this["finished_endings_map"][M[d]] = 1;
                                    o["UI_Sushe_Visit"].Inst;
                                }
                                if (z["rewarded_endings"]) {
                                    for (var M = z["rewarded_endings"], d = 0; d < M["length"]; d++)
                                        this["rewarded_endings_map"][M[d]] = 1;
                                    o["UI_Sushe_Visit"].Inst;
                                }
                            }
                        },
                        h["chara_owned"] = function(o) {
                            for (var N = 0; N < this["characters"]["length"]; N++)
                                if (this["characters"][N]["charid"] == o)
                                    return !0;
                            return !1;
                        },
                        h["skin_owned"] = function(o) {
                            return this["skin_map"]["hasOwnProperty"](o["toString"]());
                        },
                        h["add_skin"] = function(o) {
                            this["skin_map"][o] = 1;
                        },
                        Object["defineProperty"](h, "main_chara_info", {
                            get: function() {
                                for (var o = 0; o < this["characters"]["length"]; o++)
                                    if (this["characters"][o]["charid"] == this["main_character_id"])
                                        return this["characters"][o];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        h["on_view_remove"] = function(o) {
                            for (var N = 0; N < this["commonViewList"]["length"]; N++)
                                for (var z = this["commonViewList"][N], h = 0; h < z["length"]; h++)
                                    if (z[h]["item_id"] == o) {
                                        z[h]["item_id"] = game["GameUtility"]["get_view_default_item_id"](z[h].slot);
                                        break;
                                    }
                            var d = cfg["item_definition"].item.get(o);
                            d.type == game["EView"]["head_frame"] && GameMgr.Inst["account_data"]["avatar_frame"] == o && (GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_default_item_id"](game["EView"]["head_frame"]));
                        },
                        h["add_finish_ending"] = function(o) {
                            this["finished_endings_map"][o] = 1;
                        },
                        h["add_reward_ending"] = function(o) {
                            this["rewarded_endings_map"][o] = 1;
                        },
                        h["check_all_char_repoint"] = function() {
                            for (var o = 0; o < h["characters"]["length"]; o++)
                                if (this["check_char_redpoint"](h["characters"][o]))
                                    return !0;
                            return !1;
                        },
                        h["check_char_redpoint"] = function(o) {
                            // 去除小红点
                            //  if (h["hidden_characters_map"][o["charid"]])
                            return 0;
                            //END
                            var N = cfg.spot.spot["getGroup"](o["charid"]);
                            if (N)
                                for (var z = 0; z < N["length"]; z++) {
                                    var d = N[z];
                                    if (!(d["is_married"] && !o["is_upgraded"] || !d["is_married"] && o["level"] < d["level_limit"]) && 2 == d.type) {
                                        for (var r = !0, k = 0; k < d["jieju"]["length"]; k++)
                                            if (d["jieju"][k] && h["finished_endings_map"][d["jieju"][k]]) {
                                                if (!h["rewarded_endings_map"][d["jieju"][k]])
                                                    return !0;
                                                r = !1;
                                            }
                                        if (r)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        h["is_char_star"] = function(o) {
                            return -1 != this["star_chars"]["indexOf"](o);
                        },
                        h["change_char_star"] = function(o) {
                            var N = this["star_chars"]["indexOf"](o); -
                            1 != N ? this["star_chars"]["splice"](N, 1) : this["star_chars"].push(o)
                                // 屏蔽网络请求
                                //  app["NetAgent"]["sendReq2Lobby"]("Lobby", "updateCharacterSort", {
                                //      sort: this["star_chars"]
                                //  }, function () {});
                                // END
                        },
                        Object["defineProperty"](h["prototype"], "select_index", {
                            get: function() {
                                return this["_select_index"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        h["prototype"]["reset_select_index"] = function() {
                            this["_select_index"] = -1;
                        },
                        h["prototype"]["onCreate"] = function() {
                            var z = this;
                            this["contianer_illust"] = this.me["getChildByName"]("illust"),
                                this["illust"] = new o["UI_Character_Skin"](this["contianer_illust"]["getChildByName"]("illust")["getChildByName"]("illust")),
                                this["illust_rect"] = o["UIRect"]["CreateFromSprite"](this["illust"].me),
                                this["container_chat"] = this["contianer_illust"]["getChildByName"]("chat"),
                                this["chat_block"] = new o["UI_Character_Chat"](this["container_chat"]),
                                this["contianer_illust"]["getChildByName"]("btn")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    if (!z["page_visit_character"].me["visible"] || !z["page_visit_character"]["cannot_click_say"])
                                        if (z["illust"]["onClick"](), z["sound_channel"])
                                            z["stopsay"]();
                                        else {
                                            if (!z["illust_showing"])
                                                return;
                                            z.say("lobby_normal");
                                        }
                                }, null, !1),
                                this["container_name"] = null,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name"), this["contianer_illust"]["getChildByName"]("container_name_en")["visible"] = !1, this["label_cv_title"] = this["container_name"]["getChildByName"]("label_CV_title")) : (this["container_name"] = this["contianer_illust"]["getChildByName"]("container_name_en"), this["contianer_illust"]["getChildByName"]("container_name")["visible"] = !1),
                                this["label_name"] = this["container_name"]["getChildByName"]("label_name"),
                                this["label_cv"] = this["container_name"]["getChildByName"]("label_CV"),
                                this["origin_illust_x"] = this["contianer_illust"].x,
                                this["container_page"] = this.me["getChildByName"]("container_page"),
                                this["page_select_character"] = new o["UI_Sushe_Select"](),
                                this["container_page"]["addChild"](this["page_select_character"].me),
                                this["page_visit_character"] = new o["UI_Sushe_Visit"](),
                                this["container_page"]["addChild"](this["page_visit_character"].me),
                                this["container_look_illust"] = new N(this.me["getChildByName"]("look_illust"), this["contianer_illust"]);
                        },
                        h["prototype"].show = function(o) {
                            GameMgr.Inst["BehavioralStatistics"](15),
                                game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["enable"] = !0,
                                this["page_visit_character"].me["visible"] = !1,
                                this["container_look_illust"].me["visible"] = !1;
                            for (var N = 0, z = 0; z < h["characters"]["length"]; z++)
                                if (h["characters"][z]["charid"] == h["main_character_id"]) {
                                    N = z;
                                    break;
                                }
                            0 == o ? (this["change_select"](N), this["show_page_select"]()) : (this["_select_index"] = -1, this["illust_showing"] = !1, this["contianer_illust"]["visible"] = !1, this["page_select_character"].show(1));
                        },
                        h["prototype"]["starup_back"] = function() {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"]["star_up_back"](h["characters"][this["_select_index"]]),
                                this["page_visit_character"]["show_levelup"]();
                        },
                        h["prototype"]["spot_back"] = function() {
                            this["enable"] = !0,
                                this["change_select"](this["_select_index"]),
                                this["page_visit_character"].show(h["characters"][this["_select_index"]], 2);
                        },
                        h["prototype"]["go2Lobby"] = function() {
                            this["close"](Laya["Handler"]["create"](this, function() {
                                o["UIMgr"].Inst["showLobby"]();
                            }));
                        },
                        h["prototype"]["close"] = function(N) {
                            var z = this;
                            this["illust_showing"] && o["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                    x: -30
                                }, 150, 0),
                                Laya["timer"].once(150, this, function() {
                                    z["enable"] = !1,
                                        N && N.run();
                                });
                        },
                        h["prototype"]["onDisable"] = function() {
                            view["AudioMgr"]["refresh_music_volume"](!1),
                                this["illust"]["clear"](),
                                this["stopsay"](),
                                this["container_look_illust"].me["visible"] && this["container_look_illust"]["close"]();
                        },
                        h["prototype"]["hide_illust"] = function() {
                            var N = this;
                            this["illust_showing"] && (this["illust_showing"] = !1, o["UIBase"]["anim_alpha_out"](this["contianer_illust"], {
                                x: -30
                            }, 200, 0, Laya["Handler"]["create"](this, function() {
                                N["contianer_illust"]["visible"] = !1;
                            })));
                        },
                        h["prototype"]["open_illust"] = function() {
                            if (!this["illust_showing"])
                                if (this["illust_showing"] = !0, this["_select_index"] >= 0)
                                    this["contianer_illust"]["visible"] = !0, this["contianer_illust"]["alpha"] = 1, o["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var N = 0, z = 0; z < h["characters"]["length"]; z++)
                                        if (h["characters"][z]["charid"] == h["main_character_id"]) {
                                            N = z;
                                            break;
                                        }
                                    this["change_select"](N);
                                }
                        },
                        h["prototype"]["show_page_select"] = function() {
                            this["page_select_character"].show(0);
                        },
                        h["prototype"]["show_page_visit"] = function(o) {
                            void 0 === o && (o = 0),
                                this["page_visit_character"].show(h["characters"][this["_select_index"]], o);
                        },
                        h["prototype"]["change_select"] = function(N) {
                            this["_select_index"] = N,
                                this["illust"]["clear"](),
                                this["illust_showing"] = !0;
                            var z = h["characters"][N];
                            this["label_name"].text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].get(z["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].get(z["charid"])["name_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_name"].font = -1 != h["chs_fengyu_name_lst"]["indexOf"](z["charid"]) ? "fengyu" : "hanyi"),
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this["label_cv"].text = cfg["item_definition"]["character"].get(z["charid"])["desc_cv_" + GameMgr["client_language"]], this["label_cv_title"].text = 'CV') : this["label_cv"].text = "CV:" + cfg["item_definition"]["character"].get(z["charid"])["desc_cv_" + GameMgr["client_language"]],
                                "chs" == GameMgr["client_language"] && (this["label_cv"].font = -1 != h["chs_fengyu_cv_lst"]["indexOf"](z["charid"]) ? "fengyu" : "hanyi"),
                                ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && (this["label_cv_title"].y = 355 - this["label_cv"]["textField"]["textHeight"] / 2 * 0.7);
                            var d = new o["UIRect"]();
                            d.x = this["illust_rect"].x,
                                d.y = this["illust_rect"].y,
                                d["width"] = this["illust_rect"]["width"],
                                d["height"] = this["illust_rect"]["height"],
                                "405503" == z.skin ? d.y -= 70 : "403303" == z.skin && (d.y += 117),
                                this["illust"]["setRect"](d),
                                this["illust"]["setSkin"](z.skin, "full"),
                                this["contianer_illust"]["visible"] = !0,
                                Laya["Tween"]["clearAll"](this["contianer_illust"]),
                                this["contianer_illust"].x = this["origin_illust_x"],
                                this["contianer_illust"]["alpha"] = 1,
                                o["UIBase"]["anim_alpha_in"](this["contianer_illust"], {
                                    x: -30
                                }, 230),
                                this["stopsay"]();
                            var r = cfg["item_definition"].skin.get(z.skin);
                            r["spine_type"] ? (this["page_select_character"]["changeKaiguanShow"](!0), this["container_look_illust"]["dongtai_kaiguan"].show(this["illust"]["skin_id"])) : (this["page_select_character"]["changeKaiguanShow"](!1), this["container_look_illust"]["dongtai_kaiguan"].hide());
                        },
                        h["prototype"]["onChangeSkin"] = function(o) {
                            h["characters"][this["_select_index"]].skin = o,
                                this["change_select"](this["_select_index"]),
                                h["characters"][this["_select_index"]]["charid"] == h["main_character_id"] && (GameMgr.Inst["account_data"]["avatar_id"] = o)
                                // 屏蔽换肤请求
                                //  app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                                //      character_id: h["characters"][this["_select_index"]]["charid"],
                                //      skin: o
                                //  }, function () {});
                                // 保存皮肤
                        },
                        h["prototype"].say = function(o) {
                            var N = this,
                                z = h["characters"][this["_select_index"]];
                            this["chat_id"]++;
                            var d = this["chat_id"],
                                r = view["AudioMgr"]["PlayCharactorSound"](z, o, Laya["Handler"]["create"](this, function() {
                                    Laya["timer"].once(1000, N, function() {
                                        d == N["chat_id"] && N["stopsay"]();
                                    });
                                }));
                            r && (this["chat_block"].show(r["words"]), this["sound_channel"] = r["sound"]);
                        },
                        h["prototype"]["stopsay"] = function() {
                            this["chat_block"]["close"](!1),
                                this["sound_channel"] && (this["sound_channel"].stop(), Laya["SoundManager"]["removeChannel"](this["sound_channel"]), this["sound_channel"] = null);
                        },
                        h["prototype"]["to_look_illust"] = function() {
                            var o = this;
                            this["container_look_illust"].show(Laya["Handler"]["create"](this, function() {
                                o["illust"]["playAnim"]("idle"),
                                    o["page_select_character"].show(0);
                            }));
                        },
                        h["prototype"]["jump_to_char_skin"] = function(N, z) {
                            var d = this;
                            if (void 0 === N && (N = -1), void 0 === z && (z = null), N >= 0)
                                for (var r = 0; r < h["characters"]["length"]; r++)
                                    if (h["characters"][r]["charid"] == N) {
                                        this["change_select"](r);
                                        break;
                                    }
                            o["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function() {
                                h.Inst["show_page_visit"](),
                                    d["page_visit_character"]["show_pop_skin"](),
                                    d["page_visit_character"]["set_jump_callback"](z);
                            }));
                        },
                        h["prototype"]["jump_to_char_qiyue"] = function(N) {
                            var z = this;
                            if (void 0 === N && (N = -1), N >= 0)
                                for (var d = 0; d < h["characters"]["length"]; d++)
                                    if (h["characters"][d]["charid"] == N) {
                                        this["change_select"](d);
                                        break;
                                    }
                            o["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function() {
                                h.Inst["show_page_visit"](),
                                    z["page_visit_character"]["show_qiyue"]();
                            }));
                        },
                        h["prototype"]["jump_to_char_gift"] = function(N) {
                            var z = this;
                            if (void 0 === N && (N = -1), N >= 0)
                                for (var d = 0; d < h["characters"]["length"]; d++)
                                    if (h["characters"][d]["charid"] == N) {
                                        this["change_select"](d);
                                        break;
                                    }
                            o["UI_Sushe_Select"].Inst["close"](Laya["Handler"]["create"](this, function() {
                                h.Inst["show_page_visit"](),
                                    z["page_visit_character"]["show_gift"]();
                            }));
                        },
                        h["characters"] = [],
                        h["chs_fengyu_name_lst"] = ["200040", "200043"],
                        h["chs_fengyu_cv_lst"] = ["200047", "200050", "200054"],
                        h["skin_map"] = {},
                        h["main_character_id"] = 0,
                        h["send_gift_count"] = 0,
                        h["send_gift_limit"] = 0,
                        h["commonViewList"] = [],
                        h["using_commonview_index"] = 0,
                        h["finished_endings_map"] = {},
                        h["rewarded_endings_map"] = {},
                        h["star_chars"] = [],
                        h["hidden_characters_map"] = {},
                        h.Inst = null,
                        h;
                }
                (o["UIBase"]);
            o["UI_Sushe"] = z;
        }
        (uiscript || (uiscript = {}));




        // 屏蔽改变宿舍角色的网络请求
        ! function(o) {
            var N = function() {
                    function N(N) {
                        var h = this;
                        this["scrollview"] = null,
                            this["select_index"] = 0,
                            this["show_index_list"] = [],
                            this["only_show_star_char"] = !1,
                            this.me = N,
                            this.me["getChildByName"]("btn_visit")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                z.Inst["locking"] || z.Inst["close"](Laya["Handler"]["create"](h, function() {
                                    o["UI_Sushe"].Inst["show_page_visit"]();
                                }));
                            }, null, !1),
                            this.me["getChildByName"]("btn_look")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                z.Inst["locking"] || z.Inst["close"](Laya["Handler"]["create"](h, function() {
                                    o["UI_Sushe"].Inst["to_look_illust"]();
                                }));
                            }, null, !1),
                            this.me["getChildByName"]("btn_huanzhuang")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                z.Inst["locking"] || o["UI_Sushe"].Inst["jump_to_char_skin"]();
                            }, null, !1),
                            this.me["getChildByName"]("btn_star")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                z.Inst["locking"] || h["onChangeStarShowBtnClick"]();
                            }, null, !1),
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                            this["scrollview"]["setElastic"](),
                            this["dongtai_kaiguan"] = new o["UI_Dongtai_Kaiguan"](this.me["getChildByName"]("dongtai"), new Laya["Handler"](this, function() {
                                o["UI_Sushe"].Inst["illust"]["resetSkin"]();
                            }));
                    }
                    return N["prototype"].show = function(N, z) {
                            void 0 === z && (z = !1),
                                this.me["visible"] = !0,
                                N ? this.me["alpha"] = 1 : o["UIBase"]["anim_alpha_in"](this.me, {
                                    x: 0
                                }, 200, 0),
                                this["getShowStarState"](),
                                this["sortShowCharsList"](),
                                z || (this.me["getChildByName"]("btn_star")["getChildAt"](1).x = this["only_show_star_char"] ? 107 : 47),
                                this["scrollview"]["reset"](),
                                this["scrollview"]["addItem"](this["show_index_list"]["length"]);
                        },
                        N["prototype"]["render_character_cell"] = function(N) {
                            var z = this,
                                h = N["index"],
                                d = N["container"],
                                r = N["cache_data"];
                            d["visible"] = !0,
                                r["index"] = h,
                                r["inited"] || (r["inited"] = !0, d["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function() {
                                    z["onClickAtHead"](r["index"]);
                                }), r.skin = new o["UI_Character_Skin"](d["getChildByName"]("btn")["getChildByName"]("head")), r.bg = d["getChildByName"]("btn")["getChildByName"]('bg'), r["bound"] = d["getChildByName"]("btn")["getChildByName"]("bound"), r["btn_star"] = d["getChildByName"]("btn_star"), r.star = d["getChildByName"]("btn")["getChildByName"]("star"), r["btn_star"]["clickHandler"] = new Laya["Handler"](this, function() {
                                    z["onClickAtStar"](r["index"]);
                                }));
                            var k = d["getChildByName"]("btn");
                            k["getChildByName"]("choose")["visible"] = h == this["select_index"];
                            var T = this["getCharInfoByIndex"](h);
                            k["getChildByName"]("redpoint")["visible"] = o["UI_Sushe"]["check_char_redpoint"](T),
                                r.skin["setSkin"](T.skin, "bighead"),
                                k["getChildByName"]("using")["visible"] = T["charid"] == o["UI_Sushe"]["main_character_id"],
                                d["getChildByName"]("btn")["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (T["is_upgraded"] ? "2.png" : ".png"));
                            var M = cfg["item_definition"]["character"].get(T["charid"]);
                            'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? r["bound"].skin = M.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (T["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (T["is_upgraded"] ? "2.png" : ".png")) : M.ur ? (r["bound"].pos(-10, -2), r["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (T["is_upgraded"] ? "6.png" : "5.png"))) : (r["bound"].pos(4, 20), r["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (T["is_upgraded"] ? "4.png" : "3.png"))),
                                r["btn_star"]["visible"] = this["select_index"] == h,
                                r.star["visible"] = o["UI_Sushe"]["is_char_star"](T["charid"]) || this["select_index"] == h,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (r.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (o["UI_Sushe"]["is_char_star"](T["charid"]) ? 'l' : 'd') + (T["is_upgraded"] ? "1.png" : ".png")), k["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(T["charid"])["name_" + GameMgr["client_language"]]["replace"]('-', '|')) : (r.star.skin = game["Tools"]["localUISrc"]("myres/sushe/tag_star_" + (o["UI_Sushe"]["is_char_star"](T["charid"]) ? "l.png" : "d.png")), k["getChildByName"]("label_name").text = cfg["item_definition"]["character"].find(T["charid"])["name_" + GameMgr["client_language"]]),
                                ("chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"]) && ("200041" == T["charid"] ? (k["getChildByName"]("label_name")["scaleX"] = 0.67, k["getChildByName"]("label_name")["scaleY"] = 0.57) : (k["getChildByName"]("label_name")["scaleX"] = 0.7, k["getChildByName"]("label_name")["scaleY"] = 0.6));
                        },
                        N["prototype"]["onClickAtHead"] = function(N) {
                            if (this["select_index"] == N) {
                                var z = this["getCharInfoByIndex"](N);
                                if (z["charid"] != o["UI_Sushe"]["main_character_id"])
                                    if (o["UI_PiPeiYuYue"].Inst["enable"])
                                        o["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2769));
                                    else {
                                        var h = o["UI_Sushe"]["main_character_id"];
                                        o["UI_Sushe"]["main_character_id"] = z["charid"],
                                            //app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                            //    character_id: o["UI_Sushe"]["main_character_id"]
                                            //}, function () {}),
                                            GameMgr.Inst["account_data"]["avatar_id"] = z.skin;
                                        // 保存人物和皮肤
                                        MMP.settings.character = z.charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = z.skin;
                                        MMP.saveSettings();
                                        // END
                                        for (var d = 0; d < this["show_index_list"]["length"]; d++)
                                            this["getCharInfoByIndex"](d)["charid"] == h && this["scrollview"]["wantToRefreshItem"](d);
                                        this["scrollview"]["wantToRefreshItem"](N);
                                    }
                            } else {
                                var r = this["select_index"];
                                this["select_index"] = N,
                                    r >= 0 && this["scrollview"]["wantToRefreshItem"](r),
                                    this["scrollview"]["wantToRefreshItem"](N),
                                    o["UI_Sushe"].Inst["change_select"](this["show_index_list"][N]);
                            }
                        },
                        N["prototype"]["onClickAtStar"] = function(N) {
                            if (o["UI_Sushe"]["change_char_star"](this["getCharInfoByIndex"](N)["charid"]), this["only_show_star_char"])
                                this["scrollview"]["wantToRefreshItem"](N);
                            else if (this.show(!0), Math["floor"](this["show_index_list"]["length"] / 3) - 3 > 0) {
                                var z = (Math["floor"](this["select_index"] / 3) - 1) / (Math["floor"](this["show_index_list"]["length"] / 3) - 3);
                                this["scrollview"].rate = Math.min(1, Math.max(0, z));
                            }
                            // 保存人物和皮肤
                            MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                            MMP.saveSettings();
                            // END
                        },
                        N["prototype"]["close"] = function(N) {
                            var z = this;
                            this.me["visible"] && (N ? this.me["visible"] = !1 : o["UIBase"]["anim_alpha_out"](this.me, {
                                x: 0
                            }, 200, 0, Laya["Handler"]["create"](this, function() {
                                z.me["visible"] = !1;
                            })));
                        },
                        N["prototype"]["onChangeStarShowBtnClick"] = function() {
                            if (!this["only_show_star_char"]) {
                                for (var N = !1, z = 0, h = o["UI_Sushe"]["star_chars"]; z < h["length"]; z++) {
                                    var d = h[z];
                                    if (!o["UI_Sushe"]["hidden_characters_map"][d]) {
                                        N = !0;
                                        break;
                                    }
                                }
                                if (!N)
                                    return o["UI_SecondConfirm"].Inst["show_only_confirm"](game["Tools"]["strOfLocalization"](3301)), void 0;
                            }
                            o["UI_Sushe"].Inst["change_select"](this["show_index_list"]["length"] > 0 ? this["show_index_list"][0] : 0),
                                this["only_show_star_char"] = !this["only_show_star_char"],
                                app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], this["only_show_star_char"] ? 1 : 0);
                            var r = this.me["getChildByName"]("btn_star")["getChildAt"](1);
                            Laya["Tween"]["clearAll"](r),
                                Laya["Tween"].to(r, {
                                    x: this["only_show_star_char"] ? 107 : 47
                                }, 150),
                                this.show(!0, !0);
                        },
                        N["prototype"]["getShowStarState"] = function() {
                            if (0 == o["UI_Sushe"]["star_chars"]["length"])
                                return this["only_show_star_char"] = !1, void 0;
                            if (this["only_show_star_char"] = 1 == app["PlayerBehaviorStatistic"]["get_val"](app["EBehaviorType"]["Chara_Show_Star"]), this["only_show_star_char"]) {
                                for (var N = 0, z = o["UI_Sushe"]["star_chars"]; N < z["length"]; N++) {
                                    var h = z[N];
                                    if (!o["UI_Sushe"]["hidden_characters_map"][h])
                                        return;
                                }
                                this["only_show_star_char"] = !1,
                                    app["PlayerBehaviorStatistic"]["update_val"](app["EBehaviorType"]["Chara_Show_Star"], 0);
                            }
                        },
                        N["prototype"]["sortShowCharsList"] = function() {
                            this["show_index_list"] = [],
                                this["select_index"] = -1;
                            for (var N = 0, z = o["UI_Sushe"]["star_chars"]; N < z["length"]; N++) {
                                var h = z[N];
                                if (!o["UI_Sushe"]["hidden_characters_map"][h])
                                    for (var d = 0; d < o["UI_Sushe"]["characters"]["length"]; d++)
                                        if (o["UI_Sushe"]["characters"][d]["charid"] == h) {
                                            d == o["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]),
                                                this["show_index_list"].push(d);
                                            break;
                                        }
                            }
                            if (!this["only_show_star_char"])
                                for (var d = 0; d < o["UI_Sushe"]["characters"]["length"]; d++)
                                    o["UI_Sushe"]["hidden_characters_map"][o["UI_Sushe"]["characters"][d]["charid"]] || -1 == this["show_index_list"]["indexOf"](d) && (d == o["UI_Sushe"].Inst["select_index"] && (this["select_index"] = this["show_index_list"]["length"]), this["show_index_list"].push(d));
                        },
                        N["prototype"]["getCharInfoByIndex"] = function(N) {
                            return o["UI_Sushe"]["characters"][this["show_index_list"][N]];
                        },
                        N;
                }
                (),
                z = function(z) {
                    function h() {
                        var o = z.call(this, "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? new ui["lobby"]["sushe_selectUI"]() : new ui["lobby"]["sushe_select_enUI"]()) || this;
                        return o["bg_width_head"] = 962,
                            o["bg_width_zhuangban"] = 1819,
                            o["bg2_delta"] = -29,
                            o["container_top"] = null,
                            o["locking"] = !1,
                            o.tabs = [],
                            o["tab_index"] = 0,
                            h.Inst = o,
                            o;
                    }
                    return __extends(h, z),
                        h["prototype"]["onCreate"] = function() {
                            var z = this;
                            this["container_top"] = this.me["getChildByName"]("top"),
                                this["container_top"]["getChildByName"]("btn_back")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    z["locking"] || (1 == z["tab_index"] && z["container_zhuangban"]["changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](z, function() {
                                        z["close"](),
                                            o["UI_Sushe"].Inst["go2Lobby"]();
                                    }), null) : (z["close"](), o["UI_Sushe"].Inst["go2Lobby"]()));
                                }, null, !1),
                                this.root = this.me["getChildByName"]("root"),
                                this.bg2 = this.root["getChildByName"]("bg2"),
                                this.bg = this.root["getChildByName"]('bg');
                            for (var h = this.root["getChildByName"]("container_tabs"), d = function(N) {
                                    r.tabs.push(h["getChildAt"](N)),
                                        r.tabs[N]["clickHandler"] = new Laya["Handler"](r, function() {
                                            z["locking"] || z["tab_index"] != N && (1 == z["tab_index"] && z["container_zhuangban"]["changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](z, function() {
                                                z["change_tab"](N);
                                            }), null) : z["change_tab"](N));
                                        });
                                }, r = this, k = 0; k < h["numChildren"]; k++)
                                d(k);
                            this["container_head"] = new N(this.root["getChildByName"]("container_heads")),
                                this["container_zhuangban"] = new o["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function() {
                                    return z["locking"];
                                }));
                        },
                        h["prototype"].show = function(N) {
                            var z = this;
                            this["enable"] = !0,
                                this["locking"] = !0,
                                this["container_head"]["dongtai_kaiguan"]["refresh"](),
                                this["tab_index"] = N,
                                0 == this["tab_index"] ? (this.bg["width"] = this["bg_width_head"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"]["close"](!0), this["container_head"].show(!0), o["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), o["UIBase"]["anim_alpha_in"](this.root, {
                                    x: 30
                                }, 200)) : (this.bg["width"] = this["bg_width_zhuangban"], this.bg2["width"] = this.bg["width"] + this["bg2_delta"], this["container_zhuangban"].show(!0), this["container_head"]["close"](!0), o["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200), o["UIBase"]["anim_alpha_in"](this.root, {
                                    y: 30
                                }, 200)),
                                Laya["timer"].once(200, this, function() {
                                    z["locking"] = !1;
                                });
                            for (var h = 0; h < this.tabs["length"]; h++) {
                                var d = this.tabs[h];
                                d.skin = game["Tools"]["localUISrc"](h == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var r = d["getChildByName"]("word");
                                r["color"] = h == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                    r["scaleX"] = r["scaleY"] = h == this["tab_index"] ? 1.1 : 1,
                                    h == this["tab_index"] && d["parent"]["setChildIndex"](d, this.tabs["length"] - 1);
                            }
                        },
                        h["prototype"]["change_tab"] = function(N) {
                            var z = this;
                            this["tab_index"] = N;
                            for (var h = 0; h < this.tabs["length"]; h++) {
                                var d = this.tabs[h];
                                d.skin = game["Tools"]["localUISrc"](h == N ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var r = d["getChildByName"]("word");
                                r["color"] = h == N ? "#552c1c" : "#d3a86c",
                                    r["scaleX"] = r["scaleY"] = h == N ? 1.1 : 1,
                                    h == N && d["parent"]["setChildIndex"](d, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["container_zhuangban"]["close"](!1), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_head"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function() {
                                    o["UI_Sushe"].Inst["open_illust"](),
                                        z["container_head"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_head"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])) : 1 == this["tab_index"] && (this["container_head"]["close"](!1), o["UI_Sushe"].Inst["hide_illust"](), Laya["Tween"].to(this.bg, {
                                    width: this["bg_width_zhuangban"]
                                }, 200, Laya.Ease["strongOut"], Laya["Handler"]["create"](this, function() {
                                    z["container_zhuangban"].show(!1);
                                })), Laya["Tween"].to(this.bg2, {
                                    width: this["bg_width_zhuangban"] + this["bg2_delta"]
                                }, 200, Laya.Ease["strongOut"])),
                                Laya["timer"].once(400, this, function() {
                                    z["locking"] = !1;
                                });
                        },
                        h["prototype"]["close"] = function(N) {
                            var z = this;
                            this["locking"] = !0,
                                o["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150),
                                0 == this["tab_index"] ? o["UIBase"]["anim_alpha_out"](this.root, {
                                    x: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function() {
                                    z["container_head"]["close"](!0);
                                })) : o["UIBase"]["anim_alpha_out"](this.root, {
                                    y: 30
                                }, 150, 0, Laya["Handler"]["create"](this, function() {
                                    z["container_zhuangban"]["close"](!0);
                                })),
                                Laya["timer"].once(150, this, function() {
                                    z["locking"] = !1,
                                        z["enable"] = !1,
                                        N && N.run();
                                });
                        },
                        h["prototype"]["onDisable"] = function() {
                            for (var N = 0; N < o["UI_Sushe"]["characters"]["length"]; N++) {
                                var z = o["UI_Sushe"]["characters"][N].skin,
                                    h = cfg["item_definition"].skin.get(z);
                                h && Laya["loader"]["clearTextureRes"](game["LoadMgr"]["getResImageSkin"](h.path + "/bighead.png"));
                            }
                        },
                        h["prototype"]["changeKaiguanShow"] = function(o) {
                            o ? this["container_head"]["dongtai_kaiguan"].show() : this["container_head"]["dongtai_kaiguan"].hide();
                        },
                        h;
                }
                (o["UIBase"]);
            o["UI_Sushe_Select"] = z;
        }
        (uiscript || (uiscript = {}));



        // 友人房
        ! function(o) {
            var N = function() {
                    function N(o) {
                        var N = this;
                        this["friends"] = [],
                            this["sortlist"] = [],
                            this.me = o,
                            this.me["visible"] = !1,
                            this["blackbg"] = o["getChildByName"]("blackbg"),
                            this["blackbg"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                N["locking"] || N["close"]();
                            }, null, !1),
                            this.root = o["getChildByName"]("root"),
                            this["scrollview"] = this.root["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, this["render_item"], null, !1)),
                            this["noinfo"] = this.root["getChildByName"]("noinfo");
                    }
                    return N["prototype"].show = function() {
                            var N = this;
                            this["locking"] = !0,
                                this.me["visible"] = !0,
                                this["scrollview"]["reset"](),
                                this["friends"] = [],
                                this["sortlist"] = [];
                            for (var z = game["FriendMgr"]["friend_list"], h = 0; h < z["length"]; h++)
                                this["sortlist"].push(h);
                            this["sortlist"] = this["sortlist"].sort(function(o, N) {
                                var h = z[o],
                                    d = 0;
                                if (h["state"]["is_online"]) {
                                    var r = game["Tools"]["playState2Desc"](h["state"]["playing"]);
                                    d += '' != r ? 30000000000 : 60000000000,
                                        h.base["level"] && (d += h.base["level"].id % 1000 * 10000000),
                                        h.base["level3"] && (d += h.base["level3"].id % 1000 * 10000),
                                        d += -Math["floor"](h["state"]["login_time"] / 10000000);
                                } else
                                    d += h["state"]["logout_time"];
                                var k = z[N],
                                    T = 0;
                                if (k["state"]["is_online"]) {
                                    var r = game["Tools"]["playState2Desc"](k["state"]["playing"]);
                                    T += '' != r ? 30000000000 : 60000000000,
                                        k.base["level"] && (T += k.base["level"].id % 1000 * 10000000),
                                        k.base["level3"] && (T += k.base["level3"].id % 1000 * 10000),
                                        T += -Math["floor"](k["state"]["login_time"] / 10000000);
                                } else
                                    T += k["state"]["logout_time"];
                                return T - d;
                            });
                            for (var h = 0; h < z["length"]; h++)
                                this["friends"].push({
                                    f: z[h],
                                    invited: !1
                                });
                            this["noinfo"]["visible"] = 0 == this["friends"]["length"],
                                this["scrollview"]["addItem"](this["friends"]["length"]),
                                o["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function() {
                                    N["locking"] = !1;
                                }));
                        },
                        N["prototype"]["close"] = function() {
                            var N = this;
                            this["locking"] = !0,
                                o["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function() {
                                    N["locking"] = !1,
                                        N.me["visible"] = !1;
                                }));
                        },
                        N["prototype"]["render_item"] = function(N) {
                            var z = N["index"],
                                h = N["container"],
                                r = N["cache_data"];
                            r.head || (r.head = new o["UI_Head"](h["getChildByName"]("head"), "UI_WaitingRoom"), r.name = h["getChildByName"]("name"), r["state"] = h["getChildByName"]("label_state"), r.btn = h["getChildByName"]("btn_invite"), r["invited"] = h["getChildByName"]("invited"));
                            var k = this["friends"][this["sortlist"][z]];
                            r.head.id = game["GameUtility"]["get_limited_skin_id"](k.f.base["avatar_id"]),
                                r.head["set_head_frame"](k.f.base["account_id"], k.f.base["avatar_frame"]),
                                game["Tools"]["SetNickname"](r.name, k.f.base);
                            var T = !1;
                            if (k.f["state"]["is_online"]) {
                                var M = game["Tools"]["playState2Desc"](k.f["state"]["playing"]);
                                '' != M ? (r["state"].text = game["Tools"]["strOfLocalization"](2069, [M]), r["state"]["color"] = "#a9d94d", r.name["color"] = "#a9d94d") : (r["state"].text = game["Tools"]["strOfLocalization"](2071), r["state"]["color"] = "#58c4db", r.name["color"] = "#58c4db", T = !0);
                            } else
                                r["state"].text = game["Tools"]["strOfLocalization"](2072), r["state"]["color"] = "#8c8c8c", r.name["color"] = "#8c8c8c";
                            k["invited"] ? (r.btn["visible"] = !1, r["invited"]["visible"] = !0) : (r.btn["visible"] = !0, r["invited"]["visible"] = !1, game["Tools"]["setGrayDisable"](r.btn, !T), T && (r.btn["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                game["Tools"]["setGrayDisable"](r.btn, !0);
                                var N = {
                                    room_id: d.Inst["room_id"],
                                    mode: d.Inst["room_mode"],
                                    nickname: GameMgr.Inst["account_data"]["nickname"],
                                    verified: GameMgr.Inst["account_data"]["verified"],
                                    account_id: GameMgr.Inst["account_id"]
                                };
                                app["NetAgent"]["sendReq2Lobby"]("Lobby", "sendClientMessage", {
                                    target_id: k.f.base["account_id"],
                                    type: game["EFriendMsgType"]["room_invite"],
                                    content: JSON["stringify"](N)
                                }, function(N, z) {
                                    N || z["error"] ? (game["Tools"]["setGrayDisable"](r.btn, !1), o["UIMgr"].Inst["showNetReqError"]("sendClientMessage", N, z)) : (r.btn["visible"] = !1, r["invited"]["visible"] = !0, k["invited"] = !0);
                                });
                            }, null, !1)));
                        },
                        N;
                }
                (),
                z = function() {
                    function N(N) {
                        var z = this;
                        this.tabs = [],
                            this["tab_index"] = 0,
                            this.me = N,
                            this["blackmask"] = this.me["getChildByName"]("blackmask"),
                            this.root = this.me["getChildByName"]("root"),
                            this["page_head"] = new o["zhuangban"]["Page_Waiting_Head"](this.root["getChildByName"]("container_heads")),
                            this["page_zhangban"] = new o["zhuangban"]["Container_Zhuangban"](this.root["getChildByName"]("container_zhuangban0"), this.root["getChildByName"]("container_zhuangban1"), new Laya["Handler"](this, function() {
                                return z["locking"];
                            }));
                        for (var h = this.root["getChildByName"]("container_tabs"), d = function(N) {
                                r.tabs.push(h["getChildAt"](N)),
                                    r.tabs[N]["clickHandler"] = new Laya["Handler"](r, function() {
                                        z["locking"] || z["tab_index"] != N && (1 == z["tab_index"] && z["page_zhangban"]["changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](z, function() {
                                            z["change_tab"](N);
                                        }), null) : z["change_tab"](N));
                                    });
                            }, r = this, k = 0; k < h["numChildren"]; k++)
                            d(k);
                        this.root["getChildByName"]("close")["clickHandler"] = new Laya["Handler"](this, function() {
                                z["locking"] || (1 == z["tab_index"] && z["page_zhangban"]["changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](z, function() {
                                    z["close"](!1);
                                }), null) : z["close"](!1));
                            }),
                            this.root["getChildByName"]("btn_close")["clickHandler"] = new Laya["Handler"](this, function() {
                                z["locking"] || (1 == z["tab_index"] && z["page_zhangban"]["changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["create"](z, function() {
                                    z["close"](!1);
                                }), null) : z["close"](!1));
                            });
                    }
                    return N["prototype"].show = function() {
                            var N = this;
                            this.me["visible"] = !0,
                                this["blackmask"]["alpha"] = 0,
                                this["locking"] = !0,
                                Laya["Tween"].to(this["blackmask"], {
                                    alpha: 0.3
                                }, 150),
                                o["UIBase"]["anim_pop_out"](this.root, Laya["Handler"]["create"](this, function() {
                                    N["locking"] = !1;
                                })),
                                this["tab_index"] = 0,
                                this["page_zhangban"]["close"](!0),
                                this["page_head"].show(!0);
                            for (var z = 0; z < this.tabs["length"]; z++) {
                                var h = this.tabs[z];
                                h.skin = game["Tools"]["localUISrc"](z == this["tab_index"] ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var d = h["getChildByName"]("word");
                                d["color"] = z == this["tab_index"] ? "#552c1c" : "#d3a86c",
                                    d["scaleX"] = d["scaleY"] = z == this["tab_index"] ? 1.1 : 1,
                                    z == this["tab_index"] && h["parent"]["setChildIndex"](h, this.tabs["length"] - 1);
                            }
                        },
                        N["prototype"]["change_tab"] = function(o) {
                            var N = this;
                            this["tab_index"] = o;
                            for (var z = 0; z < this.tabs["length"]; z++) {
                                var h = this.tabs[z];
                                h.skin = game["Tools"]["localUISrc"](z == o ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var d = h["getChildByName"]("word");
                                d["color"] = z == o ? "#552c1c" : "#d3a86c",
                                    d["scaleX"] = d["scaleY"] = z == o ? 1.1 : 1,
                                    z == o && h["parent"]["setChildIndex"](h, this.tabs["length"] - 1);
                            }
                            this["locking"] = !0,
                                0 == this["tab_index"] ? (this["page_zhangban"]["close"](!1), Laya["timer"].once(200, this, function() {
                                    N["page_head"].show(!1);
                                })) : 1 == this["tab_index"] && (this["page_head"]["close"](!1), Laya["timer"].once(200, this, function() {
                                    N["page_zhangban"].show(!1);
                                })),
                                Laya["timer"].once(400, this, function() {
                                    N["locking"] = !1;
                                });
                        },
                        N["prototype"]["close"] = function(N) {
                            var z = this;
                            //修改友人房间立绘
                            if (!(z.page_head.choosed_chara_index == 0 && z.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = z.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = z.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = z.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[z.page_head.choosed_chara_index] = z.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me["visible"] && (N ? (this["page_head"]["close"](!0), this["page_zhangban"]["close"](!0), this.me["visible"] = !1) : (app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: d.Inst["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                dressing: !1
                            }, function() {}), this["locking"] = !0, this["page_head"]["close"](!1), this["page_zhangban"]["close"](!1), o["UIBase"]["anim_pop_hide"](this.root, Laya["Handler"]["create"](this, function() {
                                z["locking"] = !1,
                                    z.me["visible"] = !1;
                            }))));
                        },
                        N;
                }
                (),
                h = function() {
                    function o(o) {
                        this["modes"] = [],
                            this.me = o,
                            this.bg = this.me["getChildByName"]('bg'),
                            this["scrollview"] = this.me["scriptMap"]["capsui.CScrollView"],
                            this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_item"]));
                    }
                    return o["prototype"].show = function(o) {
                            this.me["visible"] = !0,
                                this["scrollview"]["reset"](),
                                this["modes"] = o,
                                this["scrollview"]["addItem"](o["length"]);
                            var N = this["scrollview"]["total_height"];
                            N > 380 ? (this["scrollview"]["_content"].y = 10, this.bg["height"] = 400) : (this["scrollview"]["_content"].y = 390 - N, this.bg["height"] = N + 20),
                                this.bg["visible"] = !0;
                        },
                        o["prototype"]["render_item"] = function(o) {
                            var N = o["index"],
                                z = o["container"],
                                h = z["getChildByName"]("info");
                            h["fontSize"] = 40,
                                h["fontSize"] = this["modes"][N]["length"] <= 5 ? 40 : this["modes"][N]["length"] <= 9 ? 55 - 3 * this["modes"][N]["length"] : 28,
                                h.text = this["modes"][N];
                        },
                        o;
                }
                (),
                d = function(d) {
                    function r() {
                        var N = d.call(this, new ui["lobby"]["waitingroomUI"]()) || this;
                        return N["skin_ready"] = "myres/room/btn_ready.png",
                            N["skin_cancel"] = "myres/room/btn_cancel.png",
                            N["skin_start"] = "myres/room/btn_start.png",
                            N["skin_start_no"] = "myres/room/btn_start_no.png",
                            N["update_seq"] = 0,
                            N["pre_msgs"] = [],
                            N["msg_tail"] = -1,
                            N["posted"] = !1,
                            N["label_rommid"] = null,
                            N["player_cells"] = [],
                            N["btn_ok"] = null,
                            N["btn_invite_friend"] = null,
                            N["btn_add_robot"] = null,
                            N["btn_dress"] = null,
                            N["beReady"] = !1,
                            N["room_id"] = -1,
                            N["owner_id"] = -1,
                            N["tournament_id"] = 0,
                            N["max_player_count"] = 0,
                            N["players"] = [],
                            N["container_rules"] = null,
                            N["container_top"] = null,
                            N["container_right"] = null,
                            N["locking"] = !1,
                            N["mousein_copy"] = !1,
                            N["popout"] = null,
                            N["room_link"] = null,
                            N["btn_copy_link"] = null,
                            N["last_start_room"] = 0,
                            N["invitefriend"] = null,
                            N["pre_choose"] = null,
                            N["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                            r.Inst = N,
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerReady", Laya["Handler"]["create"](N, function(o) {
                                app.Log.log("NotifyRoomPlayerReady:" + JSON["stringify"](o)),
                                    N["onReadyChange"](o["account_id"], o["ready"], o["dressing"]);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomPlayerUpdate", Laya["Handler"]["create"](N, function(o) {
                                app.Log.log("NotifyRoomPlayerUpdate:" + JSON["stringify"](o)),
                                    N["onPlayerChange"](o);
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomGameStart", Laya["Handler"]["create"](N, function(o) {
                                N["enable"] && (app.Log.log("NotifyRoomGameStart:" + JSON["stringify"](o)), GameMgr.Inst["onPipeiYuyueSuccess"](0, "youren"), N["onGameStart"](o));
                            })),
                            app["NetAgent"]["AddListener2Lobby"]("NotifyRoomKickOut", Laya["Handler"]["create"](N, function(o) {
                                app.Log.log("NotifyRoomKickOut:" + JSON["stringify"](o)),
                                    N["onBeKictOut"]();
                            })),
                            game["LobbyNetMgr"].Inst["add_connect_listener"](Laya["Handler"]["create"](N, function() {
                                N["enable"] && N.hide(Laya["Handler"]["create"](N, function() {
                                    o["UI_Lobby"].Inst["enable"] = !0;
                                }));
                            }, null, !1)),
                            N;
                    }
                    return __extends(r, d),
                        r["prototype"]["push_msg"] = function(o) {
                            this["pre_msgs"]["length"] < 15 ? this["pre_msgs"].push(JSON["parse"](o)) : (this["msg_tail"] = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], this["pre_msgs"][this["msg_tail"]] = JSON["parse"](o));
                        },
                        Object["defineProperty"](r["prototype"], "inRoom", {
                            get: function() {
                                return -1 != this["room_id"];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object["defineProperty"](r["prototype"], "robot_count", {
                            get: function() {
                                for (var o = 0, N = 0; N < this["players"]["length"]; N++)
                                    2 == this["players"][N]["category"] && o++;
                                return o;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        r["prototype"]["resetData"] = function() {
                            this["room_id"] = -1,
                                this["owner_id"] = -1,
                                this["room_mode"] = {},
                                this["max_player_count"] = 0,
                                this["players"] = [];
                        },
                        r["prototype"]["updateData"] = function(o) {
                            if (!o)
                                return this["resetData"](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < o.persons.length; i++) {

                                if (o.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    o.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    o.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    o.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    o.persons[i].title = GameMgr.Inst.account_data.title;
                                    o.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        o.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this["room_id"] = o["room_id"],
                                this["owner_id"] = o["owner_id"],
                                this["room_mode"] = o.mode,
                                this["public_live"] = o["public_live"],
                                this["tournament_id"] = 0,
                                o["tournament_id"] && (this["tournament_id"] = o["tournament_id"]),
                                this["ai_name"] = game["Tools"]["strOfLocalization"](2003),
                                this["room_mode"]["detail_rule"] && (1 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2003)), 2 === this["room_mode"]["detail_rule"]["ai_level"] && (this["ai_name"] = game["Tools"]["strOfLocalization"](2004))),
                                this["max_player_count"] = o["max_player_count"],
                                this["players"] = [];
                            for (var N = 0; N < o["persons"]["length"]; N++) {
                                var z = o["persons"][N];
                                //修改友人房间立绘  -----fxxk
                                //if (z.account_id == GameMgr.Inst.account_id)
                                //    z.avatar_id = GameMgr.Inst.account_data.my_character.skin;
                                //end
                                z["ready"] = !1,
                                    z["cell_index"] = -1,
                                    z["category"] = 1,
                                    this["players"].push(z);
                            }
                            for (var N = 0; N < o["robot_count"]; N++)
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
                            for (var N = 0; N < o["ready_list"]["length"]; N++)
                                for (var h = 0; h < this["players"]["length"]; h++)
                                    if (this["players"][h]["account_id"] == o["ready_list"][N]) {
                                        this["players"][h]["ready"] = !0;
                                        break;
                                    }
                            this["update_seq"] = 0,
                                o.seq && (this["update_seq"] = o.seq);
                        },
                        r["prototype"]["onReadyChange"] = function(o, N, z) {
                            for (var h = 0; h < this["players"]["length"]; h++)
                                if (this["players"][h]["account_id"] == o) {
                                    this["players"][h]["ready"] = N,
                                        this["players"][h]["dressing"] = z,
                                        this["_onPlayerReadyChange"](this["players"][h]);
                                    break;
                                }
                            this["refreshStart"]();
                        },
                        r["prototype"]["onPlayerChange"] = function(o) {
                            if (app.Log.log(o), o = o["toJSON"](), !(o.seq && o.seq <= this["update_seq"])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < o.player_list.length; i++) {

                                    if (o.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        o.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        o.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        o.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            o.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (o.update_list != undefined) {
                                    for (var i = 0; i < o.update_list.length; i++) {

                                        if (o.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            o.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            o.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            o.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                o.update_list[i].nickname = MMP.settings.nickname;
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
                                this["update_seq"] = o.seq;
                                var N = {};
                                N.type = "onPlayerChange0",
                                    N["players"] = this["players"],
                                    N.msg = o,
                                    this["push_msg"](JSON["stringify"](N));
                                var z = this["robot_count"],
                                    h = o["robot_count"];
                                if (h < this["robot_count"]) {
                                    this["pre_choose"] && 2 == this["pre_choose"]["category"] && (this["pre_choose"]["category"] = 0, this["pre_choose"] = null, z--);
                                    for (var d = 0; d < this["players"]["length"]; d++)
                                        2 == this["players"][d]["category"] && z > h && (this["players"][d]["category"] = 0, z--);
                                }
                                for (var r = [], k = o["player_list"], d = 0; d < this["players"]["length"]; d++)
                                    if (1 == this["players"][d]["category"]) {
                                        for (var T = -1, M = 0; M < k["length"]; M++)
                                            if (k[M]["account_id"] == this["players"][d]["account_id"]) {
                                                T = M;
                                                break;
                                            }
                                        if (-1 != T) {
                                            var C = k[T];
                                            r.push(this["players"][d]),
                                                this["players"][d]["avatar_id"] = C["avatar_id"],
                                                this["players"][d]["title"] = C["title"],
                                                this["players"][d]["verified"] = C["verified"];
                                        }
                                    } else
                                        2 == this["players"][d]["category"] && r.push(this["players"][d]);
                                this["players"] = r;
                                for (var d = 0; d < k["length"]; d++) {
                                    for (var g = !1, C = k[d], M = 0; M < this["players"]["length"]; M++)
                                        if (1 == this["players"][M]["category"] && this["players"][M]["account_id"] == C["account_id"]) {
                                            g = !0;
                                            break;
                                        }
                                    g || this["players"].push({
                                        account_id: C["account_id"],
                                        avatar_id: C["avatar_id"],
                                        nickname: C["nickname"],
                                        verified: C["verified"],
                                        title: C["title"],
                                        level: C["level"],
                                        level3: C["level3"],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var H = [!1, !1, !1, !1], d = 0; d < this["players"]["length"]; d++)
                                    -
                                    1 != this["players"][d]["cell_index"] && (H[this["players"][d]["cell_index"]] = !0, this["_refreshPlayerInfo"](this["players"][d]));
                                for (var d = 0; d < this["players"]["length"]; d++)
                                    if (1 == this["players"][d]["category"] && -1 == this["players"][d]["cell_index"])
                                        for (var M = 0; M < this["max_player_count"]; M++)
                                            if (!H[M]) {
                                                this["players"][d]["cell_index"] = M,
                                                    H[M] = !0,
                                                    this["_refreshPlayerInfo"](this["players"][d]);
                                                break;
                                            }
                                for (var z = this["robot_count"], h = o["robot_count"]; h > z;) {
                                    for (var i = -1, M = 0; M < this["max_player_count"]; M++)
                                        if (!H[M]) {
                                            i = M;
                                            break;
                                        }
                                    if (-1 == i)
                                        break;
                                    H[i] = !0,
                                        this["players"].push({
                                            category: 2,
                                            cell_index: i,
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
                                        z++;
                                }
                                for (var d = 0; d < this["max_player_count"]; d++)
                                    H[d] || this["_clearCell"](d);
                                var N = {};
                                if (N.type = "onPlayerChange1", N["players"] = this["players"], this["push_msg"](JSON["stringify"](N)), o["owner_id"]) {
                                    if (this["owner_id"] = o["owner_id"], this["enable"])
                                        if (this["owner_id"] == GameMgr.Inst["account_id"])
                                            this["refreshAsOwner"]();
                                        else
                                            for (var M = 0; M < this["players"]["length"]; M++)
                                                if (this["players"][M] && this["players"][M]["account_id"] == this["owner_id"]) {
                                                    this["_refreshPlayerInfo"](this["players"][M]);
                                                    break;
                                                }
                                } else if (this["enable"])
                                    if (this["owner_id"] == GameMgr.Inst["account_id"])
                                        this["refreshAsOwner"]();
                                    else
                                        for (var M = 0; M < this["players"]["length"]; M++)
                                            if (this["players"][M] && this["players"][M]["account_id"] == this["owner_id"]) {
                                                this["_refreshPlayerInfo"](this["players"][M]);
                                                break;
                                            }
                            }
                        },
                        r["prototype"]["onBeKictOut"] = function() {
                            this["resetData"](),
                                this["enable"] && (this["enable"] = !1, this["pop_change_view"]["close"](!1), o["UI_Lobby"].Inst["enable"] = !0, o["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](52)));
                        },
                        r["prototype"]["onCreate"] = function() {
                            var d = this;
                            this["last_start_room"] = 0;
                            var r = this.me["getChildByName"]("root");
                            this["container_top"] = r["getChildByName"]("top"),
                                this["container_right"] = r["getChildByName"]("right"),
                                this["label_rommid"] = this["container_top"]["getChildByName"]("label_roomid");
                            for (var k = function(N) {
                                    var z = r["getChildByName"]("player_" + N["toString"]()),
                                        h = {};
                                    h["index"] = N,
                                        h["container"] = z,
                                        h["container_flag"] = z["getChildByName"]("flag"),
                                        h["container_flag"]["visible"] = !1,
                                        h["container_name"] = z["getChildByName"]("container_name"),
                                        h.name = z["getChildByName"]("container_name")["getChildByName"]("name"),
                                        h["btn_t"] = z["getChildByName"]("btn_t"),
                                        h["container_illust"] = z["getChildByName"]("container_illust"),
                                        h["illust"] = new o["UI_Character_Skin"](z["getChildByName"]("container_illust")["getChildByName"]("illust")),
                                        h.host = z["getChildByName"]("host"),
                                        h["title"] = new o["UI_PlayerTitle"](z["getChildByName"]("container_name")["getChildByName"]("title"), "UI_WaitingRoom"),
                                        h.rank = new o["UI_Level"](z["getChildByName"]("container_name")["getChildByName"]("rank"), "UI_WaitingRoom"),
                                        h["is_robot"] = !1;
                                    var k = 0;
                                    h["btn_t"]["clickHandler"] = Laya["Handler"]["create"](T, function() {
                                            if (!(d["locking"] || Laya["timer"]["currTimer"] < k)) {
                                                k = Laya["timer"]["currTimer"] + 500;
                                                for (var o = 0; o < d["players"]["length"]; o++)
                                                    if (d["players"][o]["cell_index"] == N) {
                                                        d["kickPlayer"](o);
                                                        break;
                                                    }
                                            }
                                        }, null, !1),
                                        h["btn_info"] = z["getChildByName"]("btn_info"),
                                        h["btn_info"]["clickHandler"] = Laya["Handler"]["create"](T, function() {
                                            if (!d["locking"])
                                                for (var z = 0; z < d["players"]["length"]; z++)
                                                    if (d["players"][z]["cell_index"] == N) {
                                                        d["players"][z]["account_id"] && d["players"][z]["account_id"] > 0 && o["UI_OtherPlayerInfo"].Inst.show(d["players"][z]["account_id"], d["room_mode"].mode < 10 ? 1 : 2);
                                                        break;
                                                    }
                                        }, null, !1),
                                        T["player_cells"].push(h);
                                }, T = this, M = 0; 4 > M; M++)
                                k(M);
                            this["btn_ok"] = r["getChildByName"]("btn_ok");
                            var C = 0;
                            this["btn_ok"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                Laya["timer"]["currTimer"] < C + 500 || (C = Laya["timer"]["currTimer"], d["owner_id"] == GameMgr.Inst["account_id"] ? d["getStart"]() : d["switchReady"]());
                            }, null, !1);
                            var g = 0;
                            this["container_top"]["getChildByName"]("btn_leave")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    Laya["timer"]["currTimer"] < g + 500 || (g = Laya["timer"]["currTimer"], d["leaveRoom"]());
                                }, null, !1),
                                this["btn_invite_friend"] = this["container_right"]["getChildByName"]("btn_friend"),
                                this["btn_invite_friend"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    d["locking"] || d["invitefriend"].show();
                                }, null, !1),
                                this["btn_add_robot"] = this["container_right"]["getChildByName"]("btn_robot");
                            var H = 0;
                            this["btn_add_robot"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    d["locking"] || Laya["timer"]["currTimer"] < H || (H = Laya["timer"]["currTimer"] + 1000, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                        robot_count: d["robot_count"] + 1
                                    }, function(N, z) {
                                        (N || z["error"] && 1111 != z["error"].code) && o["UIMgr"].Inst["showNetReqError"]("modifyRoom_add", N, z),
                                            H = 0;
                                    }));
                                }, null, !1),
                                this["container_right"]["getChildByName"]("btn_help")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    if (!d["locking"]) {
                                        var N = 0;
                                        d["room_mode"]["detail_rule"] && d["room_mode"]["detail_rule"]["chuanma"] && (N = 1),
                                            o["UI_Rules"].Inst.show(0, null, N);
                                    }
                                }, null, !1),
                                this["btn_dress"] = this["container_right"]["getChildByName"]("btn_view"),
                                this["btn_dress"]["clickHandler"] = new Laya["Handler"](this, function() {
                                    d["locking"] || d["beReady"] && d["owner_id"] != GameMgr.Inst["account_id"] || (d["pop_change_view"].show(), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                        ready: d["owner_id"] == GameMgr.Inst["account_id"] ? !0 : !1,
                                        dressing: !0
                                    }, function() {}));
                                });
                            var i = this["container_right"]["getChildByName"]("btn_copy");
                            i.on("mouseover", this, function() {
                                    d["mousein_copy"] = !0;
                                }),
                                i.on("mouseout", this, function() {
                                    d["mousein_copy"] = !1;
                                }),
                                i["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    d["popout"]["visible"] || (GameMgr.Inst["BehavioralStatistics"](12), d["popout"]["visible"] = !0, o["UIBase"]["anim_pop_out"](d["popout"], null));
                                }, null, !1),
                                this["container_rules"] = new h(this["container_right"]["getChildByName"]("container_rules")),
                                this["popout"] = this.me["getChildByName"]("pop"),
                                this["room_link"] = this["popout"]["getChildByName"]("input")["getChildByName"]("txtinput"),
                                this["room_link"]["editable"] = !1,
                                this["btn_copy_link"] = this["popout"]["getChildByName"]("btn_copy"),
                                this["btn_copy_link"]["visible"] = !1,
                                GameMgr["inConch"] ? (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    var N = Laya["PlatformClass"]["createClass"]("layaair.majsoul.mjmgr");
                                    N.call("setSysClipboardText", d["room_link"].text),
                                        o["UIBase"]["anim_pop_hide"](d["popout"], Laya["Handler"]["create"](d, function() {
                                            d["popout"]["visible"] = !1;
                                        })),
                                        o["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)) : GameMgr["iniOSWebview"] && (this["btn_copy_link"]["visible"] = !0, this["btn_copy_link"]["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    Laya["Browser"]["window"]["wkbridge"]["callNative"]("copy2clip", d["room_link"].text, function() {}),
                                        o["UIBase"]["anim_pop_hide"](d["popout"], Laya["Handler"]["create"](d, function() {
                                            d["popout"]["visible"] = !1;
                                        })),
                                        o["UI_FlyTips"]["ShowTips"](game["Tools"]["strOfLocalization"](2125));
                                }, null, !1)),
                                this["popout"]["visible"] = !1,
                                this["popout"]["getChildByName"]("btn_cancel")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    o["UIBase"]["anim_pop_hide"](d["popout"], Laya["Handler"]["create"](d, function() {
                                        d["popout"]["visible"] = !1;
                                    }));
                                }, null, !1),
                                this["invitefriend"] = new N(this.me["getChildByName"]("invite_friend")),
                                this["pop_change_view"] = new z(this.me["getChildByName"]("pop_view"));
                        },
                        r["prototype"].show = function() {
                            var N = this;
                            game["Scene_Lobby"].Inst["change_bg"]("indoor", !1),
                                this["mousein_copy"] = !1,
                                this["beReady"] = !1,
                                this["invitefriend"].me["visible"] = !1,
                                this["btn_add_robot"]["visible"] = !1,
                                this["btn_invite_friend"]["visible"] = !1,
                                game["Tools"]["setGrayDisable"](this["btn_dress"], !1),
                                this["pre_choose"] = null,
                                this["pop_change_view"]["close"](!0);
                            for (var z = 0; 4 > z; z++)
                                this["player_cells"][z]["container"]["visible"] = z < this["max_player_count"];
                            for (var z = 0; z < this["max_player_count"]; z++)
                                this["_clearCell"](z);
                            for (var z = 0; z < this["players"]["length"]; z++)
                                this["players"][z]["cell_index"] = z, this["_refreshPlayerInfo"](this["players"][z]);
                            this["msg_tail"] = -1,
                                this["pre_msgs"] = [],
                                this["posted"] = !1;
                            var h = {};
                            h.type = "show",
                                h["players"] = this["players"],
                                this["push_msg"](JSON["stringify"](h)),
                                this["owner_id"] == GameMgr.Inst["account_id"] ? (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]), this["refreshAsOwner"]()) : (this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_ok"], !1)),
                                this["label_rommid"].text = 'en' == GameMgr["client_language"] ? '#' + this["room_id"]["toString"]() : this["room_id"]["toString"]();
                            var d = [];
                            d.push(game["Tools"]["room_mode_desc"](this["room_mode"].mode));
                            var r = this["room_mode"]["detail_rule"];
                            if (r) {
                                var k = 5,
                                    T = 20;
                                if (null != r["time_fixed"] && (k = r["time_fixed"]), null != r["time_add"] && (T = r["time_add"]), d.push(k["toString"]() + '+' + T["toString"]() + game["Tools"]["strOfLocalization"](2019)), 0 != this["tournament_id"]) {
                                    var M = cfg["tournament"]["tournaments"].get(this["tournament_id"]);
                                    M && d.push(M.name);
                                }
                                if (null != r["init_point"] && d.push(game["Tools"]["strOfLocalization"](2199) + r["init_point"]), null != r["fandian"] && d.push(game["Tools"]["strOfLocalization"](2094) + ':' + r["fandian"]), r["guyi_mode"] && d.push(game["Tools"]["strOfLocalization"](3028)), null != r["dora_count"])
                                    switch (r["chuanma"] && (r["dora_count"] = 0), r["dora_count"]) {
                                        case 0:
                                            d.push(game["Tools"]["strOfLocalization"](2044));
                                            break;
                                        case 2:
                                            d.push(game["Tools"]["strOfLocalization"](2047));
                                            break;
                                        case 3:
                                            d.push(game["Tools"]["strOfLocalization"](2045));
                                            break;
                                        case 4:
                                            d.push(game["Tools"]["strOfLocalization"](2046));
                                    }
                                null != r["shiduan"] && 1 != r["shiduan"] && d.push(game["Tools"]["strOfLocalization"](2137)),
                                    2 === r["fanfu"] && d.push(game["Tools"]["strOfLocalization"](2763)),
                                    4 === r["fanfu"] && d.push(game["Tools"]["strOfLocalization"](2764)),
                                    null != r["bianjietishi"] && 1 != r["bianjietishi"] && d.push(game["Tools"]["strOfLocalization"](2200)),
                                    this["room_mode"].mode >= 10 && this["room_mode"].mode <= 14 && (null != r["have_zimosun"] && 1 != r["have_zimosun"] ? d.push(game["Tools"]["strOfLocalization"](2202)) : d.push(game["Tools"]["strOfLocalization"](2203)));
                            }
                            this["container_rules"].show(d),
                                this["enable"] = !0,
                                this["locking"] = !0,
                                o["UIBase"]["anim_alpha_in"](this["container_top"], {
                                    y: -30
                                }, 200);
                            for (var z = 0; z < this["player_cells"]["length"]; z++)
                                o["UIBase"]["anim_alpha_in"](this["player_cells"][z]["container"], {
                                    x: 80
                                }, 150, 150 + 50 * z, null, Laya.Ease["backOut"]);
                            o["UIBase"]["anim_alpha_in"](this["btn_ok"], {}, 100, 600),
                                o["UIBase"]["anim_alpha_in"](this["container_right"], {
                                    x: 20
                                }, 100, 500),
                                Laya["timer"].once(600, this, function() {
                                    N["locking"] = !1;
                                });
                            var C = game["Tools"]["room_mode_desc"](this["room_mode"].mode);
                            this["room_link"].text = game["Tools"]["strOfLocalization"](2221, [this["room_id"]["toString"]()]),
                                '' != C && (this["room_link"].text += '(' + C + ')');
                            var g = game["Tools"]["getShareUrl"](GameMgr.Inst["link_url"]);
                            this["room_link"].text += ': ' + g + "?room=" + this["room_id"];
                        },
                        r["prototype"]["leaveRoom"] = function() {
                            var N = this;
                            this["locking"] || app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function(z, h) {
                                z || h["error"] ? o["UIMgr"].Inst["showNetReqError"]("leaveRoom", z, h) : (N["room_id"] = -1, N.hide(Laya["Handler"]["create"](N, function() {
                                    o["UI_Lobby"].Inst["enable"] = !0;
                                })));
                            });
                        },
                        r["prototype"]["tryToClose"] = function(N) {
                            var z = this;
                            app["NetAgent"]["sendReq2Lobby"]("Lobby", "leaveRoom", {}, function(h, d) {
                                h || d["error"] ? (o["UIMgr"].Inst["showNetReqError"]("leaveRoom", h, d), N["runWith"](!1)) : (z["enable"] = !1, z["pop_change_view"]["close"](!0), N["runWith"](!0));
                            });
                        },
                        r["prototype"].hide = function(N) {
                            var z = this;
                            this["locking"] = !0,
                                o["UIBase"]["anim_alpha_out"](this["container_top"], {
                                    y: -30
                                }, 150);
                            for (var h = 0; h < this["player_cells"]["length"]; h++)
                                o["UIBase"]["anim_alpha_out"](this["player_cells"][h]["container"], {
                                    x: 80
                                }, 150, 0, null);
                            o["UIBase"]["anim_alpha_out"](this["btn_ok"], {}, 150),
                                o["UIBase"]["anim_alpha_out"](this["container_right"], {
                                    x: 20
                                }, 150),
                                Laya["timer"].once(200, this, function() {
                                    z["locking"] = !1,
                                        z["enable"] = !1,
                                        N && N.run();
                                }),
                                document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        r["prototype"]["onDisbale"] = function() {
                            Laya["timer"]["clearAll"](this);
                            for (var o = 0; o < this["player_cells"]["length"]; o++)
                                Laya["loader"]["clearTextureRes"](this["player_cells"][o]["illust"].skin);
                            document["getElementById"]("layaCanvas")["onclick"] = null;
                        },
                        r["prototype"]["switchReady"] = function() {
                            this["owner_id"] != GameMgr.Inst["account_id"] && (this["beReady"] = !this["beReady"], this["btn_ok"].skin = game["Tools"]["localUISrc"](this["beReady"] ? this["skin_cancel"] : this["skin_ready"]), game["Tools"]["setGrayDisable"](this["btn_dress"], this["beReady"]), app["NetAgent"]["sendReq2Lobby"]("Lobby", "readyPlay", {
                                ready: this["beReady"],
                                dressing: !1
                            }, function() {}));
                        },
                        r["prototype"]["getStart"] = function() {
                            this["owner_id"] == GameMgr.Inst["account_id"] && (Laya["timer"]["currTimer"] < this["last_start_room"] + 2000 || (this["last_start_room"] = Laya["timer"]["currTimer"], app["NetAgent"]["sendReq2Lobby"]("Lobby", "startRoom", {}, function(N, z) {
                                (N || z["error"]) && o["UIMgr"].Inst["showNetReqError"]("startRoom", N, z);
                            })));
                        },
                        r["prototype"]["kickPlayer"] = function(N) {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                var z = this["players"][N];
                                1 == z["category"] ? app["NetAgent"]["sendReq2Lobby"]("Lobby", "kickPlayer", {
                                    account_id: this["players"][N]["account_id"]
                                }, function() {}) : 2 == z["category"] && (this["pre_choose"] = z, app["NetAgent"]["sendReq2Lobby"]("Lobby", "modifyRoom", {
                                    robot_count: this["robot_count"] - 1
                                }, function(N, z) {
                                    (N || z["error"]) && o["UIMgr"].Inst["showNetReqError"]("modifyRoom_minus", N, z);
                                }));
                            }
                        },
                        r["prototype"]["_clearCell"] = function(o) {
                            if (!(0 > o || o >= this["player_cells"]["length"])) {
                                var N = this["player_cells"][o];
                                N["container_flag"]["visible"] = !1,
                                    N["container_illust"]["visible"] = !1,
                                    N.name["visible"] = !1,
                                    N["container_name"]["visible"] = !1,
                                    N["btn_t"]["visible"] = !1,
                                    N.host["visible"] = !1;
                            }
                        },
                        r["prototype"]["_refreshPlayerInfo"] = function(o) {
                            var N = o["cell_index"];
                            if (!(0 > N || N >= this["player_cells"]["length"])) {
                                var z = this["player_cells"][N];
                                z["container_illust"]["visible"] = !0,
                                    z["container_name"]["visible"] = !0,
                                    z.name["visible"] = !0,
                                    game["Tools"]["SetNickname"](z.name, o),
                                    z["btn_t"]["visible"] = this["owner_id"] == GameMgr.Inst["account_id"] && o["account_id"] != GameMgr.Inst["account_id"],
                                    this["owner_id"] == o["account_id"] && (z["container_flag"]["visible"] = !0, z.host["visible"] = !0),
                                    o["account_id"] == GameMgr.Inst["account_id"] ? z["illust"]["setSkin"](o["avatar_id"], "waitingroom") : z["illust"]["setSkin"](game["GameUtility"]["get_limited_skin_id"](o["avatar_id"]), "waitingroom"),
                                    z["title"].id = game["Tools"]["titleLocalization"](o["account_id"], o["title"]),
                                    z.rank.id = o[this["room_mode"].mode < 10 ? "level" : "level3"].id,
                                    this["_onPlayerReadyChange"](o);
                            }
                        },
                        r["prototype"]["_onPlayerReadyChange"] = function(o) {
                            var N = o["cell_index"];
                            if (!(0 > N || N >= this["player_cells"]["length"])) {
                                var z = this["player_cells"][N];
                                z["container_flag"]["visible"] = this["owner_id"] == o["account_id"] ? !0 : o["ready"];
                            }
                        },
                        r["prototype"]["refreshAsOwner"] = function() {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                for (var o = 0, N = 0; N < this["players"]["length"]; N++)
                                    0 != this["players"][N]["category"] && (this["_refreshPlayerInfo"](this["players"][N]), o++);
                                this["btn_add_robot"]["visible"] = !0,
                                    this["btn_invite_friend"]["visible"] = !0,
                                    game["Tools"]["setGrayDisable"](this["btn_invite_friend"], o == this["max_player_count"]),
                                    game["Tools"]["setGrayDisable"](this["btn_add_robot"], o == this["max_player_count"]),
                                    this["refreshStart"]();
                            }
                        },
                        r["prototype"]["refreshStart"] = function() {
                            if (this["owner_id"] == GameMgr.Inst["account_id"]) {
                                this["btn_ok"].skin = game["Tools"]["localUISrc"](this["skin_start"]),
                                    game["Tools"]["setGrayDisable"](this["btn_dress"], !1);
                                for (var o = 0, N = 0; N < this["players"]["length"]; N++) {
                                    var z = this["players"][N];
                                    if (!z || 0 == z["category"])
                                        break;
                                    (z["account_id"] == this["owner_id"] || z["ready"]) && o++;
                                }
                                if (game["Tools"]["setGrayDisable"](this["btn_ok"], o != this["max_player_count"]), this["enable"]) {
                                    for (var h = 0, N = 0; N < this["max_player_count"]; N++) {
                                        var d = this["player_cells"][N];
                                        d && d["container_flag"]["visible"] && h++;
                                    }
                                    if (o != h && !this["posted"]) {
                                        this["posted"] = !0;
                                        var r = {};
                                        r["okcount"] = o,
                                            r["okcount2"] = h,
                                            r.msgs = [];
                                        var k = 0,
                                            T = this["pre_msgs"]["length"] - 1;
                                        if (-1 != this["msg_tail"] && (k = (this["msg_tail"] + 1) % this["pre_msgs"]["length"], T = this["msg_tail"]), k >= 0 && T >= 0) {
                                            for (var N = k; N != T; N = (N + 1) % this["pre_msgs"]["length"])
                                                r.msgs.push(this["pre_msgs"][N]);
                                            r.msgs.push(this["pre_msgs"][T]);
                                        }
                                        GameMgr.Inst["postInfo2Server"]("waitroom_err2", r, !1);
                                    }
                                }
                            }
                        },
                        r["prototype"]["onGameStart"] = function(o) {
                            game["Tools"]["setGrayDisable"](this["btn_ok"], !0),
                                this["enable"] = !1,
                                game["MJNetMgr"].Inst["OpenConnect"](o["connect_token"], o["game_uuid"], o["location"], !1, null);
                        },
                        r["prototype"]["onEnable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !0);
                        },
                        r["prototype"]["onDisable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_WaitingRoom", !1);
                        },
                        r.Inst = null,
                        r;
                }
                (o["UIBase"]);
            o["UI_WaitingRoom"] = d;
        }
        (uiscript || (uiscript = {}));



        // 保存装扮
        ! function(o) {
            var N;
            ! function(N) {
                var z = function() {
                        function z(z, h, d) {
                            var r = this;
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
                                this["_locking"] = d,
                                this["container_zhuangban0"] = z,
                                this["container_zhuangban1"] = h;
                            for (var k = this["container_zhuangban0"]["getChildByName"]("tabs"), T = function(N) {
                                    var z = k["getChildAt"](N);
                                    M.tabs.push(z),
                                        z["clickHandler"] = new Laya["Handler"](M, function() {
                                            r["locking"] || r["tab_index"] != N && (r["_changed"] ? o["UI_SecondConfirm"].Inst.show(game["Tools"]["strOfLocalization"](3022), Laya["Handler"]["createGLTextur"](r, function() {
                                                r["change_tab"](N);
                                            }), null) : r["change_tab"](N));
                                        });
                                }, M = this, C = 0; C < k["numChildren"]; C++)
                                T(C);
                            this["page_items"] = new N["Page_Items"](this["container_zhuangban1"]["getChildByName"]("page_items")),
                                this["page_headframe"] = new N["Page_Headframe"](this["container_zhuangban1"]["getChildByName"]("page_headframe")),
                                this["page_bgm"] = new N["Page_Bgm"](this["container_zhuangban1"]["getChildByName"]("page_bgm")),
                                this["page_desktop"] = new N["Page_Desktop"](this["container_zhuangban1"]["getChildByName"]("page_zhuobu")),
                                this["scrollview"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["scriptMap"]["capsui.CScrollView"],
                                this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_view"])),
                                this["scrollview"]["setElastic"](),
                                this["btn_using"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_using"),
                                this["btn_save"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_save"),
                                this["btn_save"]["clickHandler"] = new Laya["Handler"](this, function() {
                                    for (var N = [], z = 0; z < r["cell_titles"]["length"]; z++) {
                                        var h = r["slot_ids"][z];
                                        if (r["slot_map"][h]) {
                                            var d = r["slot_map"][h];
                                            if (!d || d == r["cell_default_item"][z])
                                                continue;
                                            N.push({
                                                slot: h,
                                                item_id: d
                                            });
                                        }
                                    }
                                    r["btn_save"]["mouseEnabled"] = !1;
                                    var k = r["tab_index"];
                                    //app["NetAgent"]["sendReq2Lobby"]("Lobby", "saveCommonViews", {
                                    //   views: N,
                                    //    save_index: k,
                                    //    is_use: k == o["UI_Sushe"]["using_commonview_index"] ? 1 : 0
                                    //}, function (z, h) {
                                    //    if (r["btn_save"]["mouseEnabled"] = !0, z || h["error"])
                                    //        o["UIMgr"].Inst["showNetReqError"]("saveCommonViews", z, h);
                                    //    else {
                                    if (o["UI_Sushe"]["commonViewList"]["length"] < k)
                                        for (var d = o["UI_Sushe"]["commonViewList"]["length"]; k >= d; d++)
                                            o["UI_Sushe"]["commonViewList"].push([]);
                                    MMP.settings.commonViewList = o.UI_Sushe.commonViewList;
                                    MMP.settings.using_commonview_index = o.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    if (o["UI_Sushe"]["commonViewList"][k] = N, o["UI_Sushe"]["using_commonview_index"] == k && r["onChangeGameView"](), r["tab_index"] != k)
                                        return;
                                    r["btn_save"]["mouseEnabled"] = !0,
                                        r["_changed"] = !1,
                                        r["refresh_btn"]();
                                    //    }
                                    //});
                                }),
                                this["btn_use"] = this["container_zhuangban1"]["getChildByName"]("page_slots")["getChildByName"]("btn_use"),
                                this["btn_use"]["clickHandler"] = new Laya["Handler"](this, function() {
                                    r["btn_use"]["mouseEnabled"] = !1;
                                    var N = r["tab_index"];
                                    app["NetAgent"]["sendReq2Lobby"]("Lobby", "useCommonView", {
                                        index: N
                                    }, function(z, h) {
                                        r["btn_use"]["mouseEnabled"] = !0,
                                            z || h["error"] ? o[", index:"].Inst["showNetReqError"]("useCommonView", z, h) : (o["UI_Sushe"]["using_commonview_index"] = N, r["refresh_btn"](), r["refresh_tab"](), r["onChangeGameView"]());
                                    });
                                });
                        }
                        return Object["defineProperty"](z["prototype"], "locking", {
                                get: function() {
                                    return this["_locking"] ? this["_locking"].run() : !1;
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            Object["defineProperty"](z["prototype"], "changed", {
                                get: function() {
                                    return this["_changed"];
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            z["prototype"].show = function(N) {
                                game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !0),
                                    this["container_zhuangban0"]["visible"] = !0,
                                    this["container_zhuangban1"]["visible"] = !0,
                                    N ? (this["container_zhuangban0"]["alpha"] = 1, this["container_zhuangban1"]["alpha"] = 1) : (o["UIBase"]["anim_alpha_in"](this["container_zhuangban0"], {
                                        x: 0
                                    }, 200), o["UIBase"]["anim_alpha_in"](this["container_zhuangban1"], {
                                        x: 0
                                    }, 200)),
                                    this["change_tab"](o["UI_Sushe"]["using_commonview_index"]);
                            },
                            z["prototype"]["change_tab"] = function(N) {
                                if (this["tab_index"] = N, this["refresh_tab"](), this["slot_map"] = {}, this["scrollview"]["reset"](), this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["select_index"] = 0, this["_changed"] = !1, !(this["tab_index"] < 0 || this["tab_index"] > 4)) {
                                    if (this["tab_index"] < o["UI_Sushe"]["commonViewList"]["length"])
                                        for (var z = o["UI_Sushe"]["commonViewList"][this["tab_index"]], h = 0; h < z["length"]; h++)
                                            this["slot_map"][z[h].slot] = z[h]["item_id"];
                                    this["scrollview"]["addItem"](this["cell_titles"]["length"]),
                                        this["onChangeSlotSelect"](0),
                                        this["refresh_btn"]();
                                }
                            },
                            z["prototype"]["refresh_tab"] = function() {
                                for (var N = 0; N < this.tabs["length"]; N++) {
                                    var z = this.tabs[N];
                                    z["mouseEnabled"] = this["tab_index"] != N,
                                        z["getChildByName"]('bg').skin = game["Tools"]["localUISrc"](this["tab_index"] == N ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                        z["getChildByName"]("num")["color"] = this["tab_index"] == N ? "#2f1e19" : "#f2c797";
                                    var h = z["getChildByName"]("choosed");
                                    o["UI_Sushe"]["using_commonview_index"] == N ? (h["visible"] = !0, h.x = this["tab_index"] == N ? -18 : -4) : h["visible"] = !1;
                                }
                            },
                            z["prototype"]["refresh_btn"] = function() {
                                this["btn_save"]["visible"] = !1,
                                    this["btn_save"]["mouseEnabled"] = !0,
                                    this["btn_use"]["visible"] = !1,
                                    this["btn_use"]["mouseEnabled"] = !0,
                                    this["btn_using"]["visible"] = !1,
                                    this["_changed"] ? this["btn_save"]["visible"] = !0 : (this["btn_use"]["visible"] = o["UI_Sushe"]["using_commonview_index"] != this["tab_index"], this["btn_using"]["visible"] = o["UI_Sushe"]["using_commonview_index"] == this["tab_index"]);
                            },
                            z["prototype"]["onChangeSlotSelect"] = function(o) {
                                var N = this;
                                this["select_index"] = o;
                                var z = 0;
                                o >= 0 && o < this["cell_default_item"]["length"] && (z = this["cell_default_item"][o]);
                                var h = z,
                                    d = this["slot_ids"][o];
                                this["slot_map"][d] && (h = this["slot_map"][d]);
                                var r = Laya["Handler"]["create"](this, function(h) {
                                    h == z && (h = 0),
                                        N["slot_map"][d] = h,
                                        N["scrollview"]["wantToRefreshItem"](o),
                                        N["_changed"] = !0,
                                        N["refresh_btn"]();
                                }, null, !1);
                                this["page_items"]["close"](),
                                    this["page_desktop"]["close"](),
                                    this["page_headframe"]["close"](),
                                    this["page_bgm"]["close"]();
                                var k = game["Tools"]["strOfLocalization"](this["cell_titles"][o]);
                                if (o >= 0 && 2 >= o)
                                    this["page_items"].show(k, o, h, r);
                                else if (3 == o)
                                    this["page_items"].show(k, 10, h, r);
                                else if (4 == o)
                                    this["page_items"].show(k, 3, h, r);
                                else if (5 == o)
                                    this["page_bgm"].show(k, h, r);
                                else if (6 == o)
                                    this["page_headframe"].show(k, h, r);
                                else if (7 == o || 8 == o) {
                                    var T = this["cell_default_item"][7],
                                        M = this["cell_default_item"][8];
                                    this["slot_map"][game["EView"]["desktop"]] && (T = this["slot_map"][game["EView"]["desktop"]]),
                                        this["slot_map"][game["EView"].mjp] && (M = this["slot_map"][game["EView"].mjp]),
                                        7 == o ? this["page_desktop"]["show_desktop"](k, T, M, r) : this["page_desktop"]["show_mjp"](k, T, M, r);
                                } else
                                    9 == o && this["page_desktop"]["show_lobby_bg"](k, h, r);
                            },
                            z["prototype"]["render_view"] = function(o) {
                                var N = this,
                                    z = o["container"],
                                    h = o["index"],
                                    d = z["getChildByName"]("cell");
                                this["select_index"] == h ? (d["scaleX"] = d["scaleY"] = 1.05, d["getChildByName"]("choosed")["visible"] = !0) : (d["scaleX"] = d["scaleY"] = 1, d["getChildByName"]("choosed")["visible"] = !1),
                                    d["getChildByName"]("title").text = game["Tools"]["strOfLocalization"](this["cell_titles"][h]);
                                var r = d["getChildByName"]("name"),
                                    k = d["getChildByName"]("icon"),
                                    T = this["cell_default_item"][h],
                                    M = this["slot_ids"][h];
                                this["slot_map"][M] && (T = this["slot_map"][M]);
                                var C = cfg["item_definition"].item.get(T);
                                C ? (r.text = C["name_" + GameMgr["client_language"]], game["LoadMgr"]["setImgSkin"](k, C.icon, null, "UI_Sushe_Select.Zhuangban")) : (r.text = game["Tools"]["strOfLocalization"](this["cell_names"][h]), game["LoadMgr"]["setImgSkin"](k, this["cell_default_img"][h], null, "UI_Sushe_Select.Zhuangban"));
                                var g = d["getChildByName"]("btn");
                                g["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                        N["locking"] || N["select_index"] != h && (N["onChangeSlotSelect"](h), N["scrollview"]["wantToRefreshAll"]());
                                    }, null, !1),
                                    g["mouseEnabled"] = this["select_index"] != h;
                            },
                            z["prototype"]["close"] = function(N) {
                                var z = this;
                                this["container_zhuangban0"]["visible"] && (N ? (this["page_items"]["close"](), this["page_desktop"]["close"](), this["page_headframe"]["close"](), this["page_bgm"]["close"](), this["container_zhuangban0"]["visible"] = !1, this["container_zhuangban1"]["visible"] = !1, game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1)) : (o["UIBase"]["anim_alpha_out"](this["container_zhuangban0"], {
                                    x: 0
                                }, 200), o["UIBase"]["anim_alpha_out"](this["container_zhuangban1"], {
                                    x: 0
                                }, 200, 0, Laya["Handler"]["create"](this, function() {
                                    z["page_items"]["close"](),
                                        z["page_desktop"]["close"](),
                                        z["page_headframe"]["close"](),
                                        z["page_bgm"]["close"](),
                                        z["container_zhuangban0"]["visible"] = !1,
                                        z["container_zhuangban1"]["visible"] = !1,
                                        game["TempImageMgr"]["setUIEnable"]("UI_Sushe_Select.Zhuangban", !1);
                                }))));
                            },
                            z["prototype"]["onChangeGameView"] = function() {
                                // 保存装扮页
                                MMP.settings.using_commonview_index = o.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                // END
                                GameMgr.Inst["load_mjp_view"]();
                                var N = game["GameUtility"]["get_view_id"](game["EView"]["lobby_bg"]);
                                o["UI_Lite_Loading"].Inst.show(),
                                    game["Scene_Lobby"].Inst["set_lobby_bg"](N, Laya["Handler"]["create"](this, function() {
                                        o["UI_Lite_Loading"].Inst["enable"] && o["UI_Lite_Loading"].Inst["close"]();
                                    })),
                                    GameMgr.Inst["account_data"]["avatar_frame"] = game["GameUtility"]["get_view_id"](game["EView"]["head_frame"]);
                            },
                            z;
                    }
                    ();
                N["Container_Zhuangban"] = z;
            }
            (N = o["zhuangban"] || (o["zhuangban"] = {}));
        }
        (uiscript || (uiscript = {}));




        // 设置称号
        ! function(o) {
            var N = function(N) {
                    function z() {
                        var o = N.call(this, new ui["lobby"]["titlebookUI"]()) || this;
                        return o["_root"] = null,
                            o["_scrollview"] = null,
                            o["_blackmask"] = null,
                            o["_locking"] = !1,
                            o["_showindexs"] = [],
                            z.Inst = o,
                            o;
                    }
                    return __extends(z, N),
                        z.Init = function() {
                            var N = this;
                            // 获取称号
                            //app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchTitleList", {}, function (z, h) {
                            //    if (z || h["error"])
                            //        o["UIMgr"].Inst["showNetReqError"]("fetchTitleList", z, h);
                            //    else {
                            N["owned_title"] = [];
                            for (let a of cfg.item_definition.title.rows_) {
                                var r = a.id;
                                cfg["item_definition"]["title"].get(r) && N["owned_title"].push(r),
                                    "600005" == r && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1),
                                    r >= "600005" && "600015" >= r && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + r - "600005", 1);
                            }
                            //        }
                            //    }
                            //});
                        },
                        z["title_update"] = function(N) {
                            for (var z = 0; z < N["new_titles"]["length"]; z++)
                                cfg["item_definition"]["title"].get(N["new_titles"][z]) && this["owned_title"].push(N["new_titles"][z]), "600005" == N["new_titles"][z] && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Get_The_Title1"], 1), N["new_titles"][z] >= "600005" && N["new_titles"][z] <= "600015" && app["PlayerBehaviorStatistic"]["google_trace_pending"](app["EBehaviorType"]["G_get_title_1"] + N["new_titles"][z] - "600005", 1);
                            if (N["remove_titles"] && N["remove_titles"]["length"] > 0) {
                                for (var z = 0; z < N["remove_titles"]["length"]; z++) {
                                    for (var h = N["remove_titles"][z], d = 0; d < this["owned_title"]["length"]; d++)
                                        if (this["owned_title"][d] == h) {
                                            this["owned_title"][d] = this["owned_title"][this["owned_title"]["length"] - 1],
                                                this["owned_title"].pop();
                                            break;
                                        }
                                    h == GameMgr.Inst["account_data"]["title"] && (GameMgr.Inst["account_data"]["title"] = "600001", o["UI_Lobby"].Inst["enable"] && o["UI_Lobby"].Inst.top["refresh"](), o["UI_PlayerInfo"].Inst["enable"] && o["UI_PlayerInfo"].Inst["refreshBaseInfo"]());
                                }
                                this.Inst["enable"] && this.Inst.show();
                            }
                        },
                        z["prototype"]["onCreate"] = function() {
                            var N = this;
                            this["_root"] = this.me["getChildByName"]("root"),
                                this["_blackmask"] = new o["UI_BlackMask"](this.me["getChildByName"]("bmask"), Laya["Handler"]["create"](this, function() {
                                    return N["_locking"];
                                }, null, !1), Laya["Handler"]["create"](this, this["close"], null, !1)),
                                this["_scrollview"] = this["_root"]["getChildByName"]("content")["scriptMap"]["capsui.CScrollView"],
                                this["_scrollview"]["init_scrollview"](Laya["Handler"]["create"](this, function(o) {
                                    N["setItemValue"](o["index"], o["container"]);
                                }, null, !1)),
                                this["_root"]["getChildByName"]("btn_close")["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    N["_locking"] || (N["_blackmask"].hide(), N["close"]());
                                }, null, !1),
                                this["_noinfo"] = this["_root"]["getChildByName"]("noinfo");
                        },
                        z["prototype"].show = function() {
                            var N = this;
                            if (this["_locking"] = !0, this["enable"] = !0, this["_blackmask"].show(), z["owned_title"]["length"] > 0) {
                                this["_showindexs"] = [];
                                for (var h = 0; h < z["owned_title"]["length"]; h++)
                                    this["_showindexs"].push(h);
                                this["_showindexs"] = this["_showindexs"].sort(function(o, N) {
                                        var h = o,
                                            d = cfg["item_definition"]["title"].get(z["owned_title"][o]);
                                        d && (h += 1000 * d["priority"]);
                                        var r = N,
                                            k = cfg["item_definition"]["title"].get(z["owned_title"][N]);
                                        return k && (r += 1000 * k["priority"]),
                                            r - h;
                                    }),
                                    this["_scrollview"]["reset"](),
                                    this["_scrollview"]["addItem"](z["owned_title"]["length"]),
                                    this["_scrollview"].me["visible"] = !0,
                                    this["_noinfo"]["visible"] = !1;
                            } else
                                this["_noinfo"]["visible"] = !0, this["_scrollview"].me["visible"] = !1;
                            o["UIBase"]["anim_pop_out"](this["_root"], Laya["Handler"]["create"](this, function() {
                                N["_locking"] = !1;
                            }));
                        },
                        z["prototype"]["close"] = function() {
                            var N = this;
                            this["_locking"] = !0,
                                o["UIBase"]["anim_pop_hide"](this["_root"], Laya["Handler"]["create"](this, function() {
                                    N["_locking"] = !1,
                                        N["enable"] = !1;
                                }));
                        },
                        z["prototype"]["onEnable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !0);
                        },
                        z["prototype"]["onDisable"] = function() {
                            game["TempImageMgr"]["setUIEnable"]("UI_TitleBook", !1),
                                this["_scrollview"]["reset"]();
                        },
                        z["prototype"]["setItemValue"] = function(o, N) {
                            var h = this;
                            if (this["enable"]) {
                                var d = z["owned_title"][this["_showindexs"][o]],
                                    r = cfg["item_definition"]["title"].find(d);
                                game["LoadMgr"]["setImgSkin"](N["getChildByName"]("img_title"), r.icon, null, "UI_TitleBook"),
                                    N["getChildByName"]("using")["visible"] = d == GameMgr.Inst["account_data"]["title"],
                                    N["getChildByName"]("desc").text = r["desc_" + GameMgr["client_language"]];
                                var k = N["getChildByName"]("btn");
                                k["clickHandler"] = Laya["Handler"]["create"](this, function() {
                                    d != GameMgr.Inst["account_data"]["title"] ? (h["changeTitle"](o), N["getChildByName"]("using")["visible"] = !0) : (h["changeTitle"](-1), N["getChildByName"]("using")["visible"] = !1);
                                }, null, !1);
                                var T = N["getChildByName"]("time"),
                                    M = N["getChildByName"]("img_title");
                                if (1 == r["unlock_type"]) {
                                    var C = r["unlock_param"][0],
                                        g = cfg["item_definition"].item.get(C);
                                    T.text = game["Tools"]["strOfLocalization"](3121) + g["expire_desc_" + GameMgr["client_language"]],
                                        T["visible"] = !0,
                                        M.y = 0;
                                } else
                                    T["visible"] = !1, M.y = 10;
                            }
                        },
                        z["prototype"]["changeTitle"] = function(N) {
                            var h = this,
                                d = GameMgr.Inst["account_data"]["title"],
                                r = 0;
                            r = N >= 0 && N < this["_showindexs"]["length"] ? z["owned_title"][this["_showindexs"][N]] : "600001",
                                GameMgr.Inst["account_data"]["title"] = r;
                            for (var k = -1, T = 0; T < this["_showindexs"]["length"]; T++)
                                if (d == z["owned_title"][this["_showindexs"][T]]) {
                                    k = T;
                                    break;
                                }
                            o["UI_Lobby"].Inst["enable"] && o["UI_Lobby"].Inst.top["refresh"](),
                                o["UI_PlayerInfo"].Inst["enable"] && o["UI_PlayerInfo"].Inst["refreshBaseInfo"](), -1 != k && this["_scrollview"]["wantToRefreshItem"](k),
                                // 屏蔽设置称号的网络请求并保存称号
                                MMP.settings.title = r;
                            MMP.saveSettings();
                            //app["NetAgent"]["sendReq2Lobby"]("Lobby", "useTitle", {
                            //    title: "600001" == r ? 0 : r
                            //}, function (z, r) {
                            //    (z || r["error"]) && (o["UIMgr"].Inst["showNetReqError"]("useTitle", z, r), GameMgr.Inst["account_data"]["title"] = d, o["UI_Lobby"].Inst["enable"] && o["UI_Lobby"].Inst.top["refresh"](), o["UI_PlayerInfo"].Inst["enable"] && o["UI_PlayerInfo"].Inst["refreshBaseInfo"](), h["enable"] && (N >= 0 && N < h["_showindexs"]["length"] && h["_scrollview"]["wantToRefreshItem"](N), k >= 0 && k < h["_showindexs"]["length"] && h["_scrollview"]["wantToRefreshItem"](k)));
                            //});
                        },
                        z.Inst = null,
                        z["owned_title"] = [],
                        z;
                }
                (o["UIBase"]);
            o["UI_TitleBook"] = N;
        }
        (uiscript || (uiscript = {}));



        // 友人房调整装扮
        ! function(o) {
            var N;
            ! function(N) {
                var z = function() {
                        function z(o) {
                            this["scrollview"] = null,
                                this["page_skin"] = null,
                                this["chara_infos"] = [],
                                this["choosed_chara_index"] = 0,
                                this["choosed_skin_id"] = 0,
                                this["star_char_count"] = 0,
                                this.me = o,
                                "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? (this.me["getChildByName"]("left")["visible"] = !0, this.me["getChildByName"]("left_en")["visible"] = !1, this["scrollview"] = this.me["getChildByName"]("left")["scriptMap"]["capsui.CScrollView"]) : (this.me["getChildByName"]("left")["visible"] = !1, this.me["getChildByName"]("left_en")["visible"] = !0, this["scrollview"] = this.me["getChildByName"]("left_en")["scriptMap"]["capsui.CScrollView"]),
                                this["scrollview"]["init_scrollview"](new Laya["Handler"](this, this["render_character_cell"]), -1, 3),
                                this["scrollview"]["setElastic"](),
                                this["page_skin"] = new N["Page_Skin"](this.me["getChildByName"]("right"));
                        }
                        return z["prototype"].show = function(N) {
                                var z = this;
                                this.me["visible"] = !0,
                                    N ? this.me["alpha"] = 1 : o["UIBase"]["anim_alpha_in"](this.me, {
                                        x: 0
                                    }, 200, 0),
                                    this["choosed_chara_index"] = 0,
                                    this["chara_infos"] = [];
                                for (var h = 0, d = o["UI_Sushe"]["star_chars"]; h < d["length"]; h++)
                                    for (var r = d[h], k = 0; k < o["UI_Sushe"]["characters"]["length"]; k++)
                                        if (!o["UI_Sushe"]["hidden_characters_map"][r] && o["UI_Sushe"]["characters"][k]["charid"] == r) {
                                            this["chara_infos"].push({
                                                    chara_id: o["UI_Sushe"]["characters"][k]["charid"],
                                                    skin_id: o["UI_Sushe"]["characters"][k].skin,
                                                    is_upgraded: o["UI_Sushe"]["characters"][k]["is_upgraded"]
                                                }),
                                                o["UI_Sushe"]["main_character_id"] == o["UI_Sushe"]["characters"][k]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1);
                                            break;
                                        }
                                this["star_char_count"] = this["chara_infos"]["length"];
                                for (var k = 0; k < o["UI_Sushe"]["characters"]["length"]; k++)
                                    o["UI_Sushe"]["hidden_characters_map"][o["UI_Sushe"]["characters"][k]["charid"]] || -1 == o["UI_Sushe"]["star_chars"]["indexOf"](o["UI_Sushe"]["characters"][k]["charid"]) && (this["chara_infos"].push({
                                        chara_id: o["UI_Sushe"]["characters"][k]["charid"],
                                        skin_id: o["UI_Sushe"]["characters"][k].skin,
                                        is_upgraded: o["UI_Sushe"]["characters"][k]["is_upgraded"]
                                    }), o["UI_Sushe"]["main_character_id"] == o["UI_Sushe"]["characters"][k]["charid"] && (this["choosed_chara_index"] = this["chara_infos"]["length"] - 1));
                                this["choosed_skin_id"] = this["chara_infos"][this["choosed_chara_index"]]["skin_id"],
                                    this["scrollview"]["reset"](),
                                    this["scrollview"]["addItem"](this["chara_infos"]["length"]);
                                var T = this["chara_infos"][this["choosed_chara_index"]];
                                this["page_skin"].show(T["chara_id"], T["skin_id"], Laya["Handler"]["create"](this, function(o) {
                                    z["choosed_skin_id"] = o,
                                        T["skin_id"] = o,
                                        z["scrollview"]["wantToRefreshItem"](z["choosed_chara_index"]);
                                }, null, !1));
                            },
                            z["prototype"]["render_character_cell"] = function(N) {
                                var z = this,
                                    h = N["index"],
                                    d = N["container"],
                                    r = N["cache_data"];
                                r["index"] = h;
                                var k = this["chara_infos"][h];
                                r["inited"] || (r["inited"] = !0, r.skin = new o["UI_Character_Skin"](d["getChildByName"]("btn")["getChildByName"]("head")), r["bound"] = d["getChildByName"]("btn")["getChildByName"]("bound"));
                                var T = d["getChildByName"]("btn");
                                T["getChildByName"]("choose")["visible"] = h == this["choosed_chara_index"],
                                    r.skin["setSkin"](k["skin_id"], "bighead"),
                                    T["getChildByName"]("using")["visible"] = h == this["choosed_chara_index"],
                                    T["getChildByName"]("label_name").text = "chs" == GameMgr["client_language"] || "chs_t" == GameMgr["client_language"] ? cfg["item_definition"]["character"].find(k["chara_id"])["name_" + GameMgr["client_language"]]["replace"]('-', '|') : cfg["item_definition"]["character"].find(k["chara_id"])["name_" + GameMgr["client_language"]],
                                    T["getChildByName"]("star") && (T["getChildByName"]("star")["visible"] = h < this["star_char_count"]);
                                var M = cfg["item_definition"]["character"].get(k["chara_id"]);
                                'en' == GameMgr["client_language"] || 'jp' == GameMgr["client_language"] || 'kr' == GameMgr["client_language"] ? r["bound"].skin = M.ur ? game["Tools"]["localUISrc"]("myres/sushe/bg_head_bound" + (k["is_upgraded"] ? "4.png" : "3.png")) : game["Tools"]["localUISrc"]("myres/sushe/en_head_bound" + (k["is_upgraded"] ? "2.png" : ".png")) : M.ur ? (r["bound"].pos(-10, -2), r["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (k["is_upgraded"] ? "6.png" : "5.png"))) : (r["bound"].pos(4, 20), r["bound"].skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (k["is_upgraded"] ? "4.png" : "3.png"))),
                                    T["getChildByName"]('bg').skin = game["Tools"]["localUISrc"]("myres/sushe/bg_head" + (k["is_upgraded"] ? "2.png" : ".png")),
                                    d["getChildByName"]("btn")["clickHandler"] = new Laya["Handler"](this, function() {
                                        if (h != z["choosed_chara_index"]) {
                                            var o = z["choosed_chara_index"];
                                            z["choosed_chara_index"] = h,
                                                z["choosed_skin_id"] = k["skin_id"],
                                                z["page_skin"].show(k["chara_id"], k["skin_id"], Laya["Handler"]["create"](z, function(o) {
                                                    z["choosed_skin_id"] = o,
                                                        k["skin_id"] = o,
                                                        r.skin["setSkin"](o, "bighead");
                                                }, null, !1)),
                                                z["scrollview"]["wantToRefreshItem"](o),
                                                z["scrollview"]["wantToRefreshItem"](h);
                                        }
                                    });
                            },
                            z["prototype"]["close"] = function(N) {
                                var z = this;
                                if (this.me["visible"])
                                    if (N)
                                        this.me["visible"] = !1;
                                    else {
                                        var h = this["chara_infos"][this["choosed_chara_index"]];
                                        //把chartid和skin写入cookie
                                        MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                        MMP.saveSettings();
                                        // End
                                        // 友人房调整装扮
                                        //h["chara_id"] != o["UI_Sushe"]["main_character_id"] && (app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeMainCharacter", {
                                        //        character_id: h["chara_id"]
                                        //    }, function () {}), o["UI_Sushe"]["main_character_id"] = h["chara_id"]),
                                        o.UI_Sushe.main_character_id = h.chara_id
                                            //this["choosed_skin_id"] != GameMgr.Inst["account_data"]["avatar_id"] && app["NetAgent"]["sendReq2Lobby"]("Lobby", "changeCharacterSkin", {
                                            //    character_id: h["chara_id"],
                                            //    skin: this["choosed_skin_id"]
                                            //}, function () {});
                                            // END
                                        for (var d = 0; d < o["UI_Sushe"]["characters"]["length"]; d++)
                                            if (o["UI_Sushe"]["characters"][d]["charid"] == h["chara_id"]) {
                                                o["UI_Sushe"]["characters"][d].skin = this["choosed_skin_id"];
                                                break;
                                            }
                                        GameMgr.Inst["account_data"]["avatar_id"] = this["choosed_skin_id"],
                                            o["UIBase"]["anim_alpha_out"](this.me, {
                                                x: 0
                                            }, 200, 0, Laya["Handler"]["create"](this, function() {
                                                z.me["visible"] = !1;
                                            }));
                                    }
                            },
                            z;
                    }
                    ();
                N["Page_Waiting_Head"] = z;
            }
            (N = o["zhuangban"] || (o["zhuangban"] = {}));
        }
        (uiscript || (uiscript = {}));




        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function() {
            var o = GameMgr;
            var N = this;
            app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchAccountInfo", {}, function(z, h) {
                if (z || h["error"])
                    uiscript["UIMgr"].Inst["showNetReqError"]("fetchAccountInfo", z, h);
                else {
                    app.Log.log("UpdateAccount: " + JSON["stringify"](h)),
                        o.Inst["account_refresh_time"] = Laya["timer"]["currTimer"];
                    // 对局结束更新数据
                    h.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    h.account.title = GameMgr.Inst.account_data.title;
                    h.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        h.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var d in h["account"]) {
                        if (o.Inst["account_data"][d] = h["account"][d], "platform_diamond" == d)
                            for (var r = h["account"][d], k = 0; k < r["length"]; k++)
                                N["account_numerical_resource"][r[k].id] = r[k]["count"];
                        if ("skin_ticket" == d && (o.Inst["account_numerical_resource"]["100004"] = h["account"][d]), "platform_skin_ticket" == d)
                            for (var r = h["account"][d], k = 0; k < r["length"]; k++)
                                N["account_numerical_resource"][r[k].id] = r[k]["count"];
                    }
                    uiscript["UI_Lobby"].Inst["refreshInfo"](),
                        h["account"]["room_id"] && o.Inst["updateRoom"](),
                        "10102" === o.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_2"], 1),
                        "10103" === o.Inst["account_data"]["level"].id && app["PlayerBehaviorStatistic"]["fb_trace_pending"](app["EBehaviorType"]["Level_3"], 1);
                }
            });
        }



        GameMgr.Inst.checkPaiPu = function(N, z, h) {
            var d = GameMgr.Inst;
            var o = GameMgr;
            return N = N.trim(),
                app.Log.log("checkPaiPu game_uuid:" + N + " account_id:" + z["toString"]() + " paipu_config:" + h),
                this["duringPaipu"] ? (app.Log["Error"]("已经在看牌谱了"), void 0) : (this["duringPaipu"] = !0, uiscript["UI_Loading"].Inst.show("enter_mj"), o.Inst["onLoadStart"]("paipu"), 2 & h && (N = game["Tools"]["DecodePaipuUUID"](N)), this["record_uuid"] = N, app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchGameRecord", {
                    game_uuid: N,
                    client_version_string: this["getClientVersion"]()
                }, function(r, k) {
                    if (r || k["error"]) {
                        uiscript["UIMgr"].Inst["showNetReqError"]("fetchGameRecord", r, k);
                        var T = 0.12;
                        uiscript["UI_Loading"].Inst["setProgressVal"](T);
                        var M = function() {
                            return T += 0.06,
                                uiscript["UI_Loading"].Inst["setProgressVal"](Math.min(1, T)),
                                T >= 1.1 ? (uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), Laya["timer"]["clear"](this, M), void 0) : void 0;
                        };
                        Laya["timer"].loop(50, d, M),
                            d["duringPaipu"] = !1;
                    } else {
                        uiscript["UI_Loading"].Inst["setProgressVal"](0.1);
                        var C = k.head,
                            g = [null, null, null, null],
                            H = game["Tools"]["strOfLocalization"](2003),
                            i = C["config"].mode;
                        if (o["inRelease"] && i["testing_environment"] && i["testing_environment"]["paixing"])
                            return uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](3169)), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), d["duringPaipu"] = !1, void 0;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "readGameRecord", {
                                game_uuid: N,
                                client_version_string: d["getClientVersion"]()
                            }, function() {}),
                            i["extendinfo"] && (H = game["Tools"]["strOfLocalization"](2004)),
                            i["detail_rule"] && i["detail_rule"]["ai_level"] && (1 === i["detail_rule"]["ai_level"] && (H = game["Tools"]["strOfLocalization"](2003)), 2 === i["detail_rule"]["ai_level"] && (H = game["Tools"]["strOfLocalization"](2004)));
                        var l = !1;
                        C["end_time"] ? (d["record_end_time"] = C["end_time"], C["end_time"] > "1576112400" && (l = !0)) : d["record_end_time"] = -1,
                            d["record_start_time"] = C["start_time"] ? C["start_time"] : -1;
                        for (var y = 0; y < C["accounts"]["length"]; y++) {
                            var X = C["accounts"][y];
                            if (X["character"]) {
                                var s = X["character"],
                                    u = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (s.account_id == GameMgr.Inst.account_id) {
                                        s.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        s.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        s.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        s.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        s.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            s.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (s.avatar_id == 400101 || s.avatar_id == 400201)) {
                                        //玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            s.avatar_id = skin.id;
                                            s.character.charid = skin.character_id;
                                            s.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(X.account_id);
                                        if (server == 1) {
                                            X.nickname = '[CN]' + X.nickname;
                                        } else if (server == 2) {
                                            X.nickname = '[JP]' + X.nickname;
                                        } else if (server == 3) {
                                            X.nickname = '[EN]' + X.nickname;
                                        } else {
                                            X.nickname = '[??]' + X.nickname;
                                        }
                                    }
                                }
                                // END
                                if (l) {
                                    var w = X["views"];
                                    if (w)
                                        for (var I = 0; I < w["length"]; I++)
                                            u[w[I].slot] = w[I]["item_id"];
                                } else {
                                    var j = s["views"];
                                    if (j)
                                        for (var I = 0; I < j["length"]; I++) {
                                            var E = j[I].slot,
                                                F = j[I]["item_id"],
                                                O = E - 1;
                                            u[O] = F;
                                        }
                                }
                                var t = [];
                                for (var _ in u)
                                    t.push({
                                        slot: parseInt(_),
                                        item_id: u[_]
                                    });
                                X["views"] = t,
                                    g[X.seat] = X;
                            } else
                                X["character"] = {
                                    charid: X["avatar_id"],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg["item_definition"]["character"].get(X["avatar_id"])["init_skin"],
                                    is_upgraded: !1
                                },
                                X["avatar_id"] = X["character"].skin,
                                X["views"] = [],
                                g[X.seat] = X;
                        }
                        for (var U = game["GameUtility"]["get_default_ai_skin"](), v = game["GameUtility"]["get_default_ai_character"](), y = 0; y < g["length"]; y++)
                            if (null == g[y]) {
                                g[y] = {
                                        nickname: H,
                                        avatar_id: U,
                                        level: {
                                            id: "10101"
                                        },
                                        level3: {
                                            id: "20101"
                                        },
                                        character: {
                                            charid: v,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: U,
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
                                            g[y].avatar_id = skin.id;
                                            g[y].character.charid = skin.character_id;
                                            g[y].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        X[N].nickname = '[BOT]' + g[y].nickname;
                                    }
                                }
                                // END
                            }
                        var m = Laya["Handler"]["create"](d, function(o) {
                                game["Scene_Lobby"].Inst["active"] && (game["Scene_Lobby"].Inst["active"] = !1),
                                    game["Scene_MJ"].Inst["openMJRoom"](C["config"], g, Laya["Handler"]["create"](d, function() {
                                        d["duringPaipu"] = !1,
                                            view["DesktopMgr"].Inst["paipu_config"] = h,
                                            view["DesktopMgr"].Inst["initRoom"](JSON["parse"](JSON["stringify"](C["config"])), g, z, view["EMJMode"]["paipu"], Laya["Handler"]["create"](d, function() {
                                                uiscript["UI_Replay"].Inst["initData"](o),
                                                    uiscript["UI_Replay"].Inst["enable"] = !0,
                                                    Laya["timer"].once(1000, d, function() {
                                                        d["EnterMJ"]();
                                                    }),
                                                    Laya["timer"].once(1500, d, function() {
                                                        view["DesktopMgr"]["player_link_state"] = [view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"], view["ELink_State"]["READY"]],
                                                            uiscript["UI_DesktopInfo"].Inst["refreshLinks"](),
                                                            uiscript["UI_Loading"].Inst["close"]();
                                                    }),
                                                    Laya["timer"].once(1000, d, function() {
                                                        uiscript["UI_Replay"].Inst["nextStep"](!0);
                                                    });
                                            }));
                                    }), Laya["Handler"]["create"](d, function(o) {
                                        return uiscript["UI_Loading"].Inst["setProgressVal"](0.1 + 0.9 * o);
                                    }, null, !1));
                            }),
                            G = {};
                        if (G["record"] = C, k.data && k.data["length"])
                            G.game = net["MessageWrapper"]["decodeMessage"](k.data), m["runWith"](G);
                        else {
                            var a = k["data_url"];
                            "chs_t" == o["client_type"] && (a = a["replace"]("maj-soul.com:9443", "maj-soul.net")),
                                game["LoadMgr"]["httpload"](a, "arraybuffer", !1, Laya["Handler"]["create"](d, function(o) {
                                    if (o["success"]) {
                                        var N = new Laya.Byte();
                                        N["writeArrayBuffer"](o.data);
                                        var z = net["MessageWrapper"]["decodeMessage"](N["getUint8Array"](0, N["length"]));
                                        G.game = z,
                                            m["runWith"](G);
                                    } else
                                        uiscript["UIMgr"].Inst["ShowErrorInfo"](game["Tools"]["strOfLocalization"](2005) + k["data_url"]), uiscript["UI_Loading"].Inst["close"](null), uiscript["UIMgr"].Inst["showLobby"](), d["duringPaipu"] = !1;
                                }));
                        }
                    }
                }), void 0);
        }

        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function() {
            var o = this;
            window.p2 = "DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP" + (window["pertinent3"] ? window["pertinent3"] : ''),
                view["BgmListMgr"].init(),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerTime", {}, function(N, z) {
                    N || z["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerTime", N, z) : o["server_time_delta"] = 1000 * z["server_time"] - Laya["timer"]["currTimer"];
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchServerSettings", {}, function(N, z) {
                    N || z["error"] ? uiscript["UIMgr"].Inst["showNetReqError"]("fetchServerSettings", N, z) : (app.Log.log("fetchServerSettings: " + JSON["stringify"](z)), uiscript["UI_Recharge"]["open_payment"] = !1, uiscript["UI_Recharge"]["payment_info"] = '', uiscript["UI_Recharge"]["open_wx"] = !0, uiscript["UI_Recharge"]["wx_type"] = 0, uiscript["UI_Recharge"]["open_alipay"] = !0, uiscript["UI_Recharge"]["alipay_type"] = 0, z["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](z["settings"]), z["settings"]["nickname_setting"] && (o["nickname_replace_enable"] = !!z["settings"]["nickname_setting"]["enable"], o["nickname_replace_lst"] = z["settings"]["nickname_setting"]["nicknames"], o["nickname_replace_table"] = {})), uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = z["settings"]["allow_modify_nickname"]);
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                }),
                app["NetAgent"]["sendReq2Lobby"]("Lobby", "fetchConnectionInfo", {}, function(N, z) {
                    N || z["error"] || (o["client_endpoint"] = z["client_endpoint"]);
                }),
                app["PlayerBehaviorStatistic"].init(),
                this["account_data"]["nickname"] && this["fetch_login_info"](),
                uiscript["UI_Info"].Init(),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountUpdate", Laya["Handler"]["create"](this, function(N) {
                    app.Log.log("NotifyAccountUpdate :" + JSON["stringify"](N));
                    var z = N["update"];
                    if (z) {
                        if (z["numerical"])
                            for (var h = 0; h < z["numerical"]["length"]; h++) {
                                var d = z["numerical"][h].id,
                                    r = z["numerical"][h]["final"];
                                switch (d) {
                                    case "100001":
                                        o["account_data"]["diamond"] = r;
                                        break;
                                    case "100002":
                                        o["account_data"].gold = r;
                                        break;
                                    case "100099":
                                        o["account_data"].vip = r,
                                            uiscript["UI_Recharge"].Inst && uiscript["UI_Recharge"].Inst["enable"] && uiscript["UI_Recharge"].Inst["refreshVipRedpoint"]();
                                }
                                (d >= "101001" || "102999" >= d) && (o["account_numerical_resource"][d] = r);
                            }
                        uiscript["UI_Sushe"]["on_data_updata"](z),
                            z["daily_task"] && uiscript["UI_Activity_Xuanshang"]["dataUpdate"](z["daily_task"]),
                            z["title"] && uiscript["UI_TitleBook"]["title_update"](z["title"]),
                            z["new_recharged_list"] && uiscript["UI_Recharge"]["on_new_recharge_refresh"](z),
                            (z["activity_task"] || z["activity_period_task"] || z["activity_random_task"] || z["activity_segment_task"]) && uiscript["UI_Activity"]["accountUpdate"](z),
                            z["activity_flip_task"] && uiscript["UI_Activity_Fanpai"]["onTaskDataUpdate"](z["activity_flip_task"]["progresses"]);
                    }
                }, null, !1)),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnotherLogin", Laya["Handler"]["create"](this, function() {
                    uiscript["UI_AnotherLogin"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAccountLogout", Laya["Handler"]["create"](this, function() {
                    uiscript["UI_Hanguplogout"].Inst.show();
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyClientMessage", Laya["Handler"]["create"](this, function(o) {
                    app.Log.log("收到消息：" + JSON["stringify"](o)),
                        o.type == game["EFriendMsgType"]["room_invite"] && uiscript["UI_Invite"]["onNewInvite"](o["content"]);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyServerSetting", Laya["Handler"]["create"](this, function(N) {
                    uiscript["UI_Recharge"]["open_payment"] = !1,
                        uiscript["UI_Recharge"]["payment_info"] = '',
                        uiscript["UI_Recharge"]["open_wx"] = !0,
                        uiscript["UI_Recharge"]["wx_type"] = 0,
                        uiscript["UI_Recharge"]["open_alipay"] = !0,
                        uiscript["UI_Recharge"]["alipay_type"] = 0,
                        N["settings"] && (uiscript["UI_Recharge"]["update_payment_setting"](N["settings"]), N["settings"]["nickname_setting"] && (o["nickname_replace_enable"] = !!N["settings"]["nickname_setting"]["enable"], o["nickname_replace_lst"] = N["settings"]["nickname_setting"]["nicknames"])),
                        uiscript["UI_Change_Nickname"]["allow_modify_nickname"] = N["allow_modify_nickname"];
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyVipLevelChange", Laya["Handler"]["create"](this, function(o) {
                    uiscript["UI_Sushe"]["send_gift_limit"] = o["gift_limit"],
                        game["FriendMgr"]["friend_max_count"] = o["friend_max_count"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["free_refresh"]["limit"] = o["zhp_free_refresh_limit"],
                        uiscript["UI_Shop"]["shopinfo"].zhp["cost_refresh"]["limit"] = o["zhp_cost_refresh_limit"],
                        uiscript["UI_PaiPu"]["collect_limit"] = o["record_collect_limit"];
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAFKResult", new Laya["Handler"](this, function(o) {
                    uiscript["UI_Guajichenfa"].Inst.show(o);
                })),
                app["NetAgent"]["AddListener2Lobby"]("NotifyCaptcha", new Laya["Handler"](this, function(N) {
                    o["auth_check_id"] = N["check_id"],
                        o["auth_nc_retry_count"] = 0,
                        4 == N.type ? o["showNECaptcha"]() : 2 == N.type ? o["checkNc"]() : o["checkNvc"]();
                })),
                Laya["timer"].loop(360000, this, function() {
                    if (game["LobbyNetMgr"].Inst.isOK) {
                        var N = (Laya["timer"]["currTimer"] - o["_last_heatbeat_time"]) / 1000;
                        app["NetAgent"]["sendReq2Lobby"]("Lobby", "heatbeat", {
                                no_operation_counter: N
                            }, function() {}),
                            N >= 3000 && uiscript["UI_Hanguplogout"].Inst.show();
                    }
                }),
                Laya["timer"].loop(1000, this, function() {
                    var N = Laya["stage"]["getMousePoint"]();
                    (N.x != o["_pre_mouse_point"].x || N.y != o["_pre_mouse_point"].y) && (o["clientHeatBeat"](), o["_pre_mouse_point"].x = N.x, o["_pre_mouse_point"].y = N.y);
                }),
                Laya["timer"].loop(1000, this, function() {
                    Laya["LocalStorage"]["setItem"]("dolllt", game["Tools"]["currentTime"]["toString"]());
                }),
                uiscript["UI_RollNotice"].init();
        }


        // 设置状态
        uiscript.UI_DesktopInfo.prototype.resetFunc = function() {
            var o = Laya["LocalStorage"]["getItem"]("autolipai"),
                N = !0;
            N = o && '' != o ? "true" == o : !0;
            var z = this["_container_fun"]["getChildByName"]("btn_autolipai");
            this["refreshFuncBtnShow"](z, N),
                Laya["LocalStorage"]["setItem"]("autolipai", N ? "true" : "false"),
                view["DesktopMgr"].Inst["setAutoLiPai"](N);
            var h = this["_container_fun"]["getChildByName"]("btn_autohu");
            this["refreshFuncBtnShow"](h, view["DesktopMgr"].Inst["auto_hule"]);
            var d = this["_container_fun"]["getChildByName"]("btn_autonoming");
            this["refreshFuncBtnShow"](d, view["DesktopMgr"].Inst["auto_nofulu"]);
            var r = this["_container_fun"]["getChildByName"]("btn_automoqie");
            this["refreshFuncBtnShow"](r, view["DesktopMgr"].Inst["auto_moqie"]),
                this["_container_fun"].x = -528,
                this["arrow"]["scaleX"] = -1;
            // 设置状态
            if (MMP.settings.setAuto.isSetAuto) {
                setAuto();
            }
            // END
        }

        uiscript.UI_Info.Init = function() {
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
                }, function(m, s) {
                    m || s["error"] ? d["UIMgr"].Inst["showNetReqError"]("fetchAnnouncement", m, s) : i["_refreshAnnouncements"](s);
                }),
                app["NetAgent"]["AddListener2Lobby"]("NotifyAnnouncementUpdate", Laya["Handler"]["create"](this, function(d) {
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
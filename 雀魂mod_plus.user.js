// ==UserScript==
// @name         雀魂mod_plus
// @namespace    majsoul_mod_plus
// @version      0.2
// @description  雀魂mod,解锁了全人物道具等。。。
// @author       Avenshy
// @homepageURL  https://github.com/Avenshy/majsoul_mod_plus
// @supportURL   https://github.com/Avenshy/majsoul_mod_plus/issues
// @match        https://game.maj-soul.com/1/
// @license      GPL-3.0
// @grant        none
// ==/UserScript==


//ID可以F12打开控制台查询。
//- 所有物品 `cfg.item_definition.item.map_`
//- 所有角色 `cfg.item_definition.character.map_`
//- 所有皮肤 `cfg.item_definition.skin.map_`
//- 所有称号 `cfg.item_definition.title.map_`

var setcharacter = 200026; //人物
var setskin = 402602;//皮肤
var setitemlizhibang = 305601; //立直棒
var setitemhupai = 305202; //和牌特效
var setlizhi = 305302; //立直特效
var setmingpai = 305901; //鸣牌提示
var setshou = 305030; //爪子
var setmusic = 305025; //立直音乐
var settouxiang = 305522; //头像框
var setzhuobu = 305048; //桌布
var setpaibei = 305016; //牌背
var setbeijing = 307003; //大厅背景
var settitle = 600021; //称号


var charid = "charid=";
var skin = "skin=";
var ca = document.cookie.split(';');
for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(charid) == 0) {
        setcharacter = c.substring(charid.length, c.length);
        console.log('[雀魂mod_plus] ' + setcharacter)
    }
    if (c.indexOf(skin) == 0) {
        setskin = c.substring(skin.length, c.length);
    } else {
        setskin = null;
    }
}

(function () {
    'use strict';
    function majsoul_mod_plus() {
        try {
            // Hack 开启报番型，作者 aoarashi1988，Handle修改
            if (game) {
                game.Tools.get_chara_audio = function (t, e) {
                    if (e && "" != e) {
                        var i = t.charid,
                            n = cfg.item_definition.character.get(i);
                        if (!n)
                            return null;
                        for (var a = t.level, r = cfg.voice.sound.findGroup(n.sound), s = [], o = 0; o < r.length; o++)
                            r[o].type == e && r[o].level_limit <= a && s.push(o);
                        if (0 == s.length)
                            return null;
                        var l = s[Math.floor(Math.random() * s.length)],
                            h = view.AudioMgr.getCVmute(n.id) ? 0 : view.AudioMgr.getCVvolume(n.id) * n.sound_volume;
                        return view.AudioMgr.yuyinMuted ? h = 0 : h *= view.AudioMgr.yuyinVolume, {
                            path: r[l].path,
                            volume: h,
                            time_length: r[l].time_length
                        }
                    }
                }; // 没有改动
                view.AudioMgr.PlayCharactorSound = function (t, e, i) {
                    if (t && t.charid) {
                        var n = t.charid,
                            a = cfg.item_definition.character.get(n);
                        if (a) {
                            for (var r = t.level, s = cfg.voice.sound.findGroup(a.sound), o = [], l = 0; l < s.length; l++)
                                s[l].type == e && (s[l].bond_limit && !t.is_upgraded || s[l].level_limit > r || o.push(l));
                            if (0 != o.length) {
                                var h = o[Math.floor(Math.random() * o.length)],
                                    c = a.sound_volume;
                                return c *= this.getCVvolume(n),
                                    this.getCVmute(n) && (c = 0),
                                    this.yuyinMuted && (c = 0),
                                    c *= this.yuyinVolume, {
                                    words: s[h]["words_" + GameMgr.client_language],
                                    sound: this.PlaySound(s[h].path, c, i)
                                }
                            }
                            i && i.run()
                        } else
                            i && i.run()
                    } else
                        i && i.run()
                }; // 没有改动
                requestAnimationFrame(function autoRun() {
                    try {
                        const arrBackup = cfg.voice.sound.groups_;
                        if (!arrBackup || arrBackup.length === 0) {
                            throw new Error();
                        }
                        console.log("[雀魂mod_plus] Hacked所有语音");
                        Object.entries(cfg.voice.sound.groups_).forEach(
                            ([soundID, soundGroup]) => {
                                soundGroup.forEach((soundObject, index) => {
                                    soundObject.level_limit = 0;
                                    soundObject.bond_limit = 0;
                                });
                            });
                    } catch (error) {
                        requestAnimationFrame(autoRun);
                    }
                });
            }
            //以下为解锁全立绘，作者UsernameFull
            //设置全部道具
            !function (t) {
                var e;
                !function (t) {
                    t[t.none = 0] = "none",
                        t[t.daoju = 1] = "daoju",
                        t[t.gift = 2] = "gift",
                        t[t.fudai = 3] = "fudai",
                        t[t.view = 5] = "view"
                }
                    (e = t.EItemCategory || (t.EItemCategory = {}));
                var i = function (i) {
                    function n() {
                        var t = i.call(this, new ui.lobby.bagUI) || this;
                        return t.container_top = null,
                            t.container_content = null,
                            t.locking = !1,
                            t.tabs = [],
                            t.page_item = null,
                            t.page_gift = null,
                            t.page_skin = null,
                            t.select_index = 0,
                            n.Inst = t,
                            t
                    }
                    return __extends(n, i),
                        n.init = function () {
                            var t = this;
                            app.NetAgent.AddListener2Lobby("NotifyAccountUpdate", Laya.Handler.create(this, function (e) {
                                var i = e.update;
                                i && i.bag && (t.update_data(i.bag.update_items), t.update_daily_gain_data(i.bag))
                            }, null, !1)),
                                this.fetch()
                        },
                        n.fetch = function () {
                            var e = this;
                            this._item_map = {},
                                this._daily_gain_record = {},
                                app.NetAgent.sendReq2Lobby("Lobby", "fetchBagInfo", {}, function (i, n) {
                                    if (i || n.error)
                                        t.UIMgr.Inst.showNetReqError("fetchBagInfo", i, n);
                                    else {
                                        app.Log.log("背包信息：" + JSON.stringify(n));
                                        var a = n.bag;
                                        //设置全部道具（立直棒及特效不起效果）
                                        if (a) {
                                            //    if (a.items)
                                            //        for (h = 0; h < a.items.length; h++) {
                                            //            var r = a.items[h].item_id,
                                            //            s = a.items[h].stack,
                                            //            o = cfg.item_definition.item.get(r);
                                            //            o && (e._item_map[r] = {
                                            //                    item_id: r,
                                            //                    count: s,
                                            //                    category: o.category
                                            //                })
                                            //        }
                                            if (a.daily_gain_record)
                                                for (var l = a.daily_gain_record, h = 0; h < l.length; h++) {
                                                    var c = l[h].limit_source_id;
                                                    e._daily_gain_record[c] = {};
                                                    var _ = l[h].record_time;
                                                    e._daily_gain_record[c].record_time = _;
                                                    var u = l[h].records;
                                                    if (u)
                                                        for (var d = 0; d < u.length; d++)
                                                            e._daily_gain_record[c][u[d].item_id] = u[d].count
                                                }
                                        }
                                        var items = cfg.item_definition.item.map_;
                                        for (var id in items) {
                                            cfg.item_definition.item.get(id);
                                            e._item_map[id] = {
                                                item_id: id,
                                                count: 1,
                                                category: items[id].category
                                            };
                                        } //获取物品列表并添加
                                    }
                                })
                        },
                        n.find_item = function (t) {
                            var e = this._item_map[t];
                            return e ? {
                                item_id: e.item_id,
                                category: e.category,
                                count: e.count
                            }
                                : null
                        },
                        n.get_item_count = function (t) {
                            var e = this.find_item(t);
                            if (e)
                                return e.count;
                            if (100001 == t) {
                                var i = 0;
                                return GameMgr.Inst.account_numerical_resource[100001] && (i += GameMgr.Inst.account_numerical_resource[100001]),
                                    GameMgr.inGooglePlay && GameMgr.Inst.account_numerical_resource[101001] && (i += GameMgr.Inst.account_numerical_resource[101001]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[101002] && (i += GameMgr.Inst.account_numerical_resource[101002]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[101004] && (i += GameMgr.Inst.account_numerical_resource[101004]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[101005] && (i += GameMgr.Inst.account_numerical_resource[101005]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[101007] && (i += GameMgr.Inst.account_numerical_resource[101007]),
                                    GameMgr.inDmm && GameMgr.Inst.account_numerical_resource[101006] && (i += GameMgr.Inst.account_numerical_resource[101006]),
                                    i
                            }
                            if (100004 == t) {
                                var n = 0;
                                return GameMgr.Inst.account_numerical_resource[100004] && (n += GameMgr.Inst.account_numerical_resource[100004]),
                                    GameMgr.inGooglePlay && GameMgr.Inst.account_numerical_resource[102003] && (n += GameMgr.Inst.account_numerical_resource[102003]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[102002] && (n += GameMgr.Inst.account_numerical_resource[102002]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[102004] && (n += GameMgr.Inst.account_numerical_resource[102004]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[102005] && (n += GameMgr.Inst.account_numerical_resource[102005]),
                                    GameMgr.inChina && GameMgr.Inst.account_numerical_resource[102007] && (n += GameMgr.Inst.account_numerical_resource[102007]),
                                    GameMgr.inDmm && GameMgr.Inst.account_numerical_resource[102006] && (n += GameMgr.Inst.account_numerical_resource[102006]),
                                    n
                            }
                            return 100002 == t ? GameMgr.Inst.account_data.gold : 0
                        },
                        n.find_items_by_category = function (t) {
                            var e = [];
                            for (var i in this._item_map)
                                this._item_map[i].category == t && e.push({
                                    item_id: this._item_map[i].item_id,
                                    category: this._item_map[i].category,
                                    count: this._item_map[i].count
                                });
                            return e
                        },
                        n.update_data = function (e) {
                            for (o = 0; o < e.length; o++) {
                                var i = e[o].item_id,
                                    n = e[o].stack;
                                if (n > 0)
                                    this._item_map.hasOwnProperty(i.toString()) ? this._item_map[i].count = n : this._item_map[i] = {
                                        item_id: i,
                                        count: n,
                                        category: cfg.item_definition.item.get(i).category
                                    };
                                else if (this._item_map.hasOwnProperty(i.toString())) {
                                    var a = cfg.item_definition.item.get(i);
                                    a && 5 == a.category && t.UI_Sushe.on_view_remove(i),
                                        this._item_map[i] = 0,
                                        delete this._item_map[i]
                                }
                            }
                            this.Inst && this.Inst.when_data_change();
                            for (o = 0; o < e.length; o++) {
                                i = e[o].item_id;
                                if (this._item_listener.hasOwnProperty(i.toString()))
                                    for (var r = this._item_listener[i], s = 0; s < r.length; s++)
                                        r[s].run()
                            }
                            for (var o = 0; o < this._all_item_listener.length; o++)
                                this._all_item_listener[o].run()
                        },
                        n.update_daily_gain_data = function (t) {
                            var e = t.update_daily_gain_record;
                            if (e)
                                for (var i = 0; i < e.length; i++) {
                                    var n = e[i].limit_source_id;
                                    this._daily_gain_record[n] || (this._daily_gain_record[n] = {});
                                    var a = e[i].record_time;
                                    this._daily_gain_record[n].record_time = a;
                                    var r = e[i].records;
                                    if (r)
                                        for (var s = 0; s < r.length; s++)
                                            this._daily_gain_record[n][r[s].item_id] = r[s].count
                                }
                        },
                        n.get_item_daily_record = function (t, e) {
                            return this._daily_gain_record[t] && this._daily_gain_record[t].record_time && game.Tools.isPassedRefreshTime(this._daily_gain_record[t].record_time) && this._daily_gain_record[t][e] ? this._daily_gain_record[t][e] : 0
                        },
                        n.add_item_listener = function (t, e) {
                            this._item_listener.hasOwnProperty(t.toString()) || (this._item_listener[t] = []),
                                this._item_listener[t].push(e)
                        },
                        n.remove_item_listener = function (t, e) {
                            var i = this._item_listener[t];
                            if (i)
                                for (var n = 0; n < i.length; n++)
                                    if (i[n] === e) {
                                        i[n] = i[i.length - 1],
                                            i.pop();
                                        break
                                    }
                        },
                        n.add_all_item_listener = function (t) {
                            this._all_item_listener.push(t)
                        },
                        n.remove_all_item_listener = function (t) {
                            for (var e = this._all_item_listener, i = 0; i < e.length; i++)
                                if (e[i] === t) {
                                    e[i] = e[e.length - 1],
                                        e.pop();
                                    break
                                }
                        },
                        n.prototype.have_red_point = function () {
                            return !1
                        },
                        n.prototype.onCreate = function () {
                            var e = this;
                            this.container_top = this.me.getChildByName("top"),
                                this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || e.hide(Laya.Handler.create(e, function () {
                                        t.UI_Lobby.Inst.enable = !0
                                    }))
                                }, null, !1),
                                this.container_content = this.me.getChildByName("content");
                            for (var i = function (t) {
                                n.tabs.push(n.container_content.getChildByName("tabs").getChildByName("btn" + t)),
                                    n.tabs[t].clickHandler = Laya.Handler.create(n, function () {
                                        e.select_index != t && e.on_change_tab(t)
                                    }, null, !1)
                            }, n = this, a = 0; a < 4; a++)
                                i(a);
                            this.page_item = new t.UI_Bag_PageItem(this.container_content.getChildByName("page_items")),
                                this.page_gift = new t.UI_Bag_PageGift(this.container_content.getChildByName("page_gift")),
                                this.page_skin = new t.UI_Bag_PageSkin(this.container_content.getChildByName("page_skin"))
                        },
                        n.prototype.show = function (e) {
                            var i = this;
                            void 0 === e && (e = 0),
                                this.enable = !0,
                                this.locking = !0,
                                t.UIBase.anim_alpha_in(this.container_top, {
                                    y: -30
                                }, 200),
                                t.UIBase.anim_alpha_in(this.container_content, {
                                    y: 30
                                }, 200),
                                Laya.timer.once(300, this, function () {
                                    i.locking = !1
                                }),
                                this.on_change_tab(e),
                                game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                3 != e && this.page_skin.when_update_data()
                        },
                        n.prototype.hide = function (e) {
                            var i = this;
                            this.locking = !0,
                                t.UIBase.anim_alpha_out(this.container_top, {
                                    y: -30
                                }, 200),
                                t.UIBase.anim_alpha_out(this.container_content, {
                                    y: 30
                                }, 200),
                                Laya.timer.once(300, this, function () {
                                    i.locking = !1,
                                        i.enable = !1,
                                        e && e.run()
                                })
                        },
                        n.prototype.onDisable = function () {
                            this.page_skin.close()
                        },
                        n.prototype.on_change_tab = function (t) {
                            this.select_index = t;
                            for (var i = 0; i < this.tabs.length; i++)
                                this.tabs[i].skin = game.Tools.localUISrc(t == i ? "myres/shop/tab_choose.png" : "myres/shop/tab_unchoose.png"), this.tabs[i].getChildAt(0).color = t == i ? "#d9b263" : "#8cb65f";
                            switch (this.page_item.close(), this.page_gift.close(), this.page_skin.me.visible = !1, t) {
                                case 0:
                                    this.page_item.show(e.daoju);
                                    break;
                                case 1:
                                    this.page_gift.show();
                                    break;
                                case 2:
                                    this.page_item.show(e.view);
                                    break;
                                case 3:
                                    this.page_skin.show()
                            }
                        },
                        n.prototype.when_data_change = function () {
                            this.page_item.me.visible && this.page_item.when_update_data(),
                                this.page_gift.me.visible && this.page_gift.when_update_data()
                        },
                        n.prototype.on_skin_change = function () {
                            this.page_skin.when_update_data()
                        },
                        n.prototype.clear_desktop_btn_redpoint = function () {
                            this.tabs[3].getChildByName("redpoint").visible = !1
                        },
                        n._item_map = {},
                        n._item_listener = {},
                        n._all_item_listener = [],
                        n._daily_gain_record = {},
                        n.Inst = null,
                        n
                }
                    (t.UIBase);
                t.UI_Bag = i
            }
                (uiscript || (uiscript = {}));
            //桌布和卡背 未修改
            !function (t) {
                !function (e) {
                    var i = function () {
                        function e(t) {
                            this.desktop_default = 305044,
                                this.mjp_defalut = 305045,
                                this.lobby_bg_default = 307001,
                                this.type = game.EView.desktop,
                                this.items = [],
                                this.img_desktop = null,
                                this.img_mjp = null,
                                this.seen_lobby_bg_map = null,
                                this.when_change = null,
                                this.desktop_id = -1,
                                this.mjp_id = -1,
                                this.using_id = -1,
                                this.me = t,
                                this.scrollview = t.scriptMap["capsui.CScrollView_Heng"],
                                this.scrollview.init_scrollview(new Laya.Handler(this, this.render_item)),
                                this.scrollview.reset(),
                                this.img_desktop = this.me.getChildByName("desktop"),
                                this.img_mjp = this.me.getChildByName("mjp")
                        }
                        return e.prototype.have_red_point = function () {
                            if (!this.seen_lobby_bg_map) {
                                this.seen_lobby_bg_map = {};
                                var e = Laya.LocalStorage.getItem(game.Tools.eeesss("lobby_bg_list_" + GameMgr.Inst.account_id));
                                if (e)
                                    for (var i = (e = game.Tools.dddsss(e)).split(","), n = 0; n < i.length; n++)
                                        this.seen_lobby_bg_map[i[n]] = 1
                            }
                            for (var a = t.UI_Bag.find_items_by_category(t.EItemCategory.view), n = 0; n < a.length; n++) {
                                if (3 == cfg.item_definition.item.get(a[n].item_id).type && !this.seen_lobby_bg_map[a[n].item_id])
                                    return !0
                            }
                            return !1
                        },
                            e.prototype.show_desktop = function (t, e, i, n) {
                                this.type = game.EView.desktop,
                                    this.when_change = n,
                                    this.using_id = e,
                                    this.mjp_id = i,
                                    this.me.getChildByName("title").text = t,
                                    this._show()
                            },
                            e.prototype.show_mjp = function (t, e, i, n) {
                                this.type = game.EView.mjp,
                                    this.when_change = n,
                                    this.using_id = i,
                                    this.desktop_id = e,
                                    this.me.getChildByName("title").text = t,
                                    this._show()
                            },
                            e.prototype.show_lobby_bg = function (t, e, i) {
                                this.type = game.EView.lobby_bg,
                                    this.when_change = i,
                                    this.using_id = e,
                                    this.me.getChildByName("title").text = t,
                                    this._show()
                            },
                            e.prototype._show = function () {
                                var e = this;
                                if (this.me.visible = !0, this.items = [], this.type == game.EView.desktop ? this.items.push({
                                    item_id: this.desktop_default,
                                    owned: !0
                                }) : this.type == game.EView.mjp ? this.items.push({
                                    item_id: this.mjp_defalut,
                                    owned: !0
                                }) : this.type == game.EView.lobby_bg && this.items.push({
                                    item_id: this.lobby_bg_default,
                                    owned: !0
                                }), this.scrollview.reset(), this.type == game.EView.desktop || this.type == game.EView.mjp) {
                                    var i = t.UI_Bag.find_items_by_category(t.EItemCategory.view);
                                    i = i.sort(function (t, e) {
                                        return t.item_id - e.item_id
                                    });
                                    for (var n = 0; n < i.length; n++)
                                        if (i[n].item_id != this.desktop_default && i[n].item_id != this.mjp_defalut) {
                                            cfg.item_definition.item.get(i[n].item_id).type == this.type && this.items.push({
                                                item_id: i[n].item_id,
                                                owned: !0
                                            })
                                        }
                                } else
                                    this.type == game.EView.lobby_bg && cfg.item_definition.item.forEach(function (i) {
                                        i.id != e.lobby_bg_default && 5 == i.category && i.type == e.type && e.items.push({
                                            item_id: i.id,
                                            owned: t.UI_Bag.get_item_count(i.id) > 0
                                        })
                                    });
                                this.scrollview.addItem(this.items.length),
                                    this.type == game.EView.desktop ? (this.img_mjp.visible = !0, this._update_desktop_preview(this.using_id), this._update_mjp_preview(this.mjp_id)) : this.type == game.EView.mjp ? (this.img_mjp.visible = !0, this._update_desktop_preview(this.desktop_id), this._update_mjp_preview(this.using_id)) : this.type == game.EView.lobby_bg && (this.img_mjp.visible = !1, this._update_lobby_bg_preview(this.using_id))
                            },
                            e.prototype.close = function () {
                                this.me.visible && (this.me.visible = !1, this.items = [], this.scrollview.reset(), Laya.loader.clearTextureRes(this.img_desktop.skin), Laya.loader.clearTextureRes(this.img_mjp.skin), this.img_desktop.skin = "", this.img_mjp.skin = "", game.LoadMgr.clearImgSkin(this.img_desktop), game.LoadMgr.clearImgSkin(this.img_mjp))
                            },
                            e.prototype.render_item = function (e) {
                                var i = this,
                                    n = e.index,
                                    a = e.container,
                                    r = e.cache_data,
                                    s = this.items[n],
                                    o = cfg.item_definition.item.get(s.item_id),
                                    l = a.getChildByName("btn");
                                l.clickHandler = Laya.Handler.create(this, function () {
                                    if (i.items[n].owned)
                                        if (i.using_id != s.item_id) {
                                            switch (i.using_id = s.item_id, i.scrollview.wantToRefreshAll(), i.type) {
                                                case game.EView.desktop:
                                                    i._update_desktop_preview(i.using_id);
                                                    break;
                                                case game.EView.mjp:
                                                    i._update_mjp_preview(i.using_id);
                                                    break;
                                                case game.EView.lobby_bg:
                                                    i._update_lobby_bg_preview(i.using_id)
                                            }
                                            i.when_change && i.when_change.runWith(i.using_id)
                                        } else
                                            t.UI_ItemDetail.Inst.show(s.item_id)
                                }, null, !1),
                                    l.mouseEnabled = s.owned,
                                    l.getChildByName("chosen").visible = this.using_id == s.item_id,
                                    l.getChildByName("lock").visible = !s.owned,
                                    r.skin || (r.skin = new t.UI_Item_Skin(l.getChildByName("icon"))),
                                    r.skin.setSkin(o.icon)
                            },
                            e.prototype._update_desktop_preview = function (t) {
                                var e = cfg.item_definition.view.get(t),
                                    i = "";
                                e || (e = cfg.item_definition.view.get(this.desktop_default));
                                e.res_name;
                                i = "myres2/tablecloth/" + e.res_name + "/preview.jpg",
                                    game.LoadMgr.clearImgSkin(this.img_desktop),
                                    "" != this.img_desktop.skin && (Laya.loader.clearTextureRes(this.img_desktop.skin), this.img_desktop.skin = ""),
                                    game.LoadMgr.setImgSkin(this.img_desktop, i)
                            },
                            e.prototype._update_mjp_preview = function (t) {
                                var e = cfg.item_definition.view.get(t),
                                    i = "";
                                e || (e = cfg.item_definition.view.get(this.mjp_defalut)),
                                    i = "myres2/mjp/" + e.res_name + "/preview.png",
                                    game.LoadMgr.clearImgSkin(this.img_mjp),
                                    "" != this.img_mjp.skin && (Laya.loader.clearTextureRes(this.img_mjp.skin), this.img_mjp.skin = ""),
                                    game.LoadMgr.setImgSkin(this.img_mjp, i)
                            },
                            e.prototype._update_lobby_bg_preview = function (t) {
                                var e = cfg.item_definition.view.get(t),
                                    i = "";
                                e || (e = cfg.item_definition.view.get(this.lobby_bg_default)),
                                    i = "myres2/lobby_bg/" + e.res_name + ".jpg",
                                    game.LoadMgr.clearImgSkin(this.img_desktop),
                                    "" != this.img_desktop.skin && (Laya.loader.clearTextureRes(this.img_desktop.skin), this.img_desktop.skin = ""),
                                    game.LoadMgr.setImgSkin(this.img_desktop, i)
                            },
                            e
                    }
                        ();
                    e.Page_Desktop = i
                }
                    (t.zhuangban || (t.zhuangban = {}))
            }
                (uiscript || (uiscript = {}));

            //修改牌桌上角色
            !function (t) {
                var e = function () {
                    function e() {
                        var e = this;
                        this.urls = [],
                            this.link_index = -1,
                            this.connect_state = t.EConnectState.none,
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
                            app.NetAgent.AddListener2MJ("NotifyPlayerLoadGameReady", Laya.Handler.create(this, function (t) {
                                app.Log.log("NotifyPlayerLoadGameReady: " + JSON.stringify(t)),
                                    e.loaded_player_count = t.ready_id_list.length,
                                    e.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(e.loaded_player_count, e.real_player_count)
                            }))
                    }
                    return Object.defineProperty(e, "Inst", {
                        get: function () {
                            return null == this._Inst ? this._Inst = new e : this._Inst
                        },
                        enumerable: !0,
                        configurable: !0
                    }),
                        e.prototype.OpenConnect = function (e, i, n, a, r) {
                            var s = this;
                            uiscript.UI_Loading.Inst.show("enter_mj"),
                                t.Scene_Lobby.Inst && t.Scene_Lobby.Inst.active && (t.Scene_Lobby.Inst.active = !1),
                                this.Close(),
                                view.BgmListMgr.stopBgm(),
                                this.is_ob = !1,
                                Laya.timer.once(500, this, function () {
                                    s.url = "",
                                        s.token = e,
                                        s.game_uuid = i,
                                        s.server_location = n,
                                        GameMgr.Inst.ingame = !0,
                                        GameMgr.Inst.mj_server_location = n,
                                        GameMgr.Inst.mj_game_token = e,
                                        GameMgr.Inst.mj_game_uuid = i,
                                        s.playerreconnect = a,
                                        s._setState(t.EConnectState.tryconnect),
                                        s.load_over = !1,
                                        s.loaded_player_count = 0,
                                        s.real_player_count = 0,
                                        s.lb_index = 0,
                                        s._fetch_gateway(0)
                                })
                        },
                        e.prototype.Close = function () {
                            this.load_over = !1,
                                app.Log.log("MJNetMgr close"),
                                this._setState(t.EConnectState.none),
                                app.NetAgent.Close2MJ(),
                                this.url = ""
                        },
                        e.prototype._OnConnent = function (e) {
                            app.Log.log("MJNetMgr _OnConnent event:" + e),
                                e == Laya.Event.CLOSE || e == Laya.Event.ERROR ? Laya.timer.currTimer - this.lasterrortime > 100 && (this.lasterrortime = Laya.timer.currTimer, this.connect_state == t.EConnectState.tryconnect ? this._try_to_linknext() : this.connect_state == t.EConnectState.connecting ? view.DesktopMgr.Inst.active ? (view.DesktopMgr.Inst.duringReconnect = !0, this._setState(t.EConnectState.reconnecting), this.reconnect_count = 0, this._Reconnect()) : (this._setState(t.EConnectState.disconnect), uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2008)), t.Scene_MJ.Inst.ForceOut()) : this.connect_state == t.EConnectState.reconnecting && this._Reconnect()) : e == Laya.Event.OPEN && (this.connect_state != t.EConnectState.tryconnect && this.connect_state != t.EConnectState.reconnecting || (this._setState(t.EConnectState.connecting), this.is_ob ? this._ConnectSuccessOb() : this._ConnectSuccess()))
                        },
                        e.prototype._Reconnect = function () {
                            var e = this;
                            t.LobbyNetMgr.Inst.connect_state == t.EConnectState.none || t.LobbyNetMgr.Inst.connect_state == t.EConnectState.disconnect ? this._setState(t.EConnectState.disconnect) : t.LobbyNetMgr.Inst.connect_state == t.EConnectState.connecting && GameMgr.Inst.logined ? this.reconnect_count >= this.reconnect_span.length ? this._setState(t.EConnectState.disconnect) : (Laya.timer.once(this.reconnect_span[this.reconnect_count], this, function () {
                                e.connect_state == t.EConnectState.reconnecting && (app.Log.log("MJNetMgr reconnect count:" + e.reconnect_count), app.NetAgent.connect2MJ(e.url, Laya.Handler.create(e, e._OnConnent, null, !1), "local" == e.server_location ? "/game-gateway" : "/game-gateway-zone"))
                            }), this.reconnect_count++) : Laya.timer.once(1e3, this, this._Reconnect)
                        },
                        e.prototype._try_to_linknext = function () {
                            this.link_index++,
                                this.url = "",
                                app.Log.log("mj _try_to_linknext(" + this.link_index + ") url.length=" + this.urls.length),
                                this.link_index < 0 || this.link_index >= this.urls.length ? t.LobbyNetMgr.Inst.polling_connect ? (this.lb_index++, this._fetch_gateway(0)) : (this._setState(t.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(59)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && t.Scene_MJ.Inst.ForceOut()) : (app.NetAgent.connect2MJ(this.urls[this.link_index].url, Laya.Handler.create(this, this._OnConnent, null, !1), "local" == this.server_location ? "/game-gateway" : "/game-gateway-zone"), this.url = this.urls[this.link_index].url)
                        },
                        e.prototype._fetch_gateway = function (e) {
                            var i = this;
                            if (t.LobbyNetMgr.Inst.polling_connect && this.lb_index >= t.LobbyNetMgr.Inst.urls.length)
                                return uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(58)), this._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && t.Scene_MJ.Inst.ForceOut(), void this._setState(t.EConnectState.none);
                            this.urls = [],
                                this.link_index = -1,
                                app.Log.log("mj _fetch_gateway retry_count:" + e);
                            var n = function (n) {
                                var a = new Laya.HttpRequest;
                                a.once(Laya.Event.COMPLETE, i, function (n) {
                                    !function (n) {
                                        var a = JSON.parse(n);
                                        if (app.Log.log("mj _fetch_gateway func_success data = " + n), a.maintenance)
                                            i._setState(t.EConnectState.none), uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2009)), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && t.Scene_MJ.Inst.ForceOut();
                                        else if (a.servers && a.servers.length > 0) {
                                            for (var r = a.servers, s = t.Tools.deal_gateway(r), o = 0; o < s.length; o++)
                                                i.urls.push({
                                                    name: "___" + o,
                                                    url: s[o]
                                                });
                                            i.link_index = -1,
                                                i._try_to_linknext()
                                        } else
                                            e < 1 ? Laya.timer.once(1e3, i, function () {
                                                i._fetch_gateway(e + 1)
                                            }) : t.LobbyNetMgr.Inst.polling_connect ? (i.lb_index++, i._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(60)), i._SendDebugInfo(), view.DesktopMgr.Inst && !view.DesktopMgr.Inst.active && t.Scene_MJ.Inst.ForceOut(), i._setState(t.EConnectState.none))
                                    }
                                        (n)
                                }),
                                    a.once(Laya.Event.ERROR, i, function (n) {
                                        app.Log.log("mj _fetch_gateway func_error"),
                                            e < 1 ? Laya.timer.once(500, i, function () {
                                                i._fetch_gateway(e + 1)
                                            }) : t.LobbyNetMgr.Inst.polling_connect ? (i.lb_index++, i._fetch_gateway(0)) : (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(58)), i._SendDebugInfo(), view.DesktopMgr.Inst.active || t.Scene_MJ.Inst.ForceOut(), i._setState(t.EConnectState.none))
                                    });
                                var r = [];
                                r.push("If-Modified-Since"),
                                    r.push("0"),
                                    n += "?service=ws-game-gateway",
                                    GameMgr.inHttps ? n += "&protocol=ws&ssl=true" : n += "&protocol=ws&ssl=false",
                                    n += "&location=" + i.server_location,
                                    n += "&rv=" + Math.floor(1e7 * Math.random()) + Math.floor(1e7 * Math.random()),
                                    a.send(n, "", "get", "text", r),
                                    app.Log.log("mj _fetch_gateway func_fetch url = " + n)
                            };
                            n(t.LobbyNetMgr.Inst.polling_connect ? t.LobbyNetMgr.Inst.urls[this.lb_index] : t.LobbyNetMgr.Inst.lb_url)
                        },
                        e.prototype._setState = function (e) {
                            this.connect_state = e,
                                GameMgr.inRelease || null != uiscript.UI_Common.Inst && (e == t.EConnectState.none ? uiscript.UI_Common.Inst.label_net_mj.text = "" : e == t.EConnectState.tryconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "尝试连接麻将服务器", uiscript.UI_Common.Inst.label_net_mj.color = "#000000") : e == t.EConnectState.connecting ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正常", uiscript.UI_Common.Inst.label_net_mj.color = "#00ff00") : e == t.EConnectState.disconnect ? (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：断开连接", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()) : e == t.EConnectState.reconnecting && (uiscript.UI_Common.Inst.label_net_mj.text = "麻将服务器：正在重连", uiscript.UI_Common.Inst.label_net_mj.color = "#ff0000", uiscript.UI_Disconnect.Inst && uiscript.UI_Disconnect.Inst.show()))
                        },
                        e.prototype._ConnectSuccess = function () {
                            var e = this;
                            app.Log.log("MJNetMgr _ConnectSuccess "),
                                this.load_over = !1,
                                app.NetAgent.sendReq2MJ("FastTest", "authGame", {
                                    account_id: GameMgr.Inst.account_id,
                                    token: this.token,
                                    game_uuid: this.game_uuid
                                }, function (i, n) {
                                    if (i || n.error)
                                        uiscript.UIMgr.Inst.showNetReqError("authGame", i, n), t.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                    else {
                                        app.Log.log("麻将桌验证通过：" + JSON.stringify(n)),
                                            uiscript.UI_Loading.Inst.setProgressVal(.1);
                                        var a = [];
                                        view.DesktopMgr.player_link_state = n.state_list;
                                        var r = t.Tools.strOfLocalization(2003),
                                            s = n.game_config.mode;
                                        view.ERuleMode.Liqi4;
                                        s.mode < 10 ? (view.ERuleMode.Liqi4, e.real_player_count = 4) : s.mode < 20 && (view.ERuleMode.Liqi3, e.real_player_count = 3);
                                        for (h = 0; h < e.real_player_count; h++)
                                            a.push(null);
                                        s.extendinfo && (r = t.Tools.strOfLocalization(2004)),
                                            s.detail_rule && s.detail_rule.ai_level && (1 === s.detail_rule.ai_level && (r = t.Tools.strOfLocalization(2003)), 2 === s.detail_rule.ai_level && (r = t.Tools.strOfLocalization(2004)));
                                        for (var o = t.GameUtility.get_default_ai_skin(), l = t.GameUtility.get_default_ai_character(), h = 0; h < n.seat_list.length; h++) {
                                            var c = n.seat_list[h];
                                            if (0 == c)
                                                a[h] = {
                                                    nickname: r,
                                                    avatar_id: o,
                                                    level: {
                                                        id: 10101
                                                    },
                                                    level3: {
                                                        id: 20101
                                                    },
                                                    character: {
                                                        charid: l,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: o,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else {
                                                0;
                                                for (var _ = 0; _ < n.players.length; _++)
                                                    if (n.players[_].account_id == c) {
                                                        a[h] = n.players[_];
                                                        console.log("[雀魂mod_plus] n_id:" + a[h].account_id);
                                                        console.log('[雀魂mod_plus] ' + GameMgr.Inst.account_id);
                                                        //修改牌桌上人物头像及皮肤
                                                        if (a[h].account_id == GameMgr.Inst.account_id) {
                                                            (a[h].character = {
                                                                charid: GameMgr.Inst.account_data.my_charid,
                                                                level: 5,
                                                                exp: 0,
                                                                skin: GameMgr.Inst.account_data.my_character.skin,
                                                                is_upgraded: 1
                                                            }),
                                                                (a[h].avatar_id = GameMgr.Inst.account_data.my_character.skin),
                                                                a[h].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index],
                                                                a[h].avatar_frame = GameMgr.Inst.account_data.avatar_frame,
                                                                a[h].title = GameMgr.Inst.account_data.title;
                                                        }
                                                        //end
                                                        break
                                                    }
                                            }
                                        }
                                        for (h = 0; h < e.real_player_count; h++)
                                            null == a[h] && (a[h] = {
                                                account: 0,
                                                nickname: t.Tools.strOfLocalization(2010),
                                                avatar_id: o,
                                                level: {
                                                    id: 10101
                                                },
                                                level3: {
                                                    id: 20101
                                                },
                                                character: {
                                                    charid: l,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: o,
                                                    is_upgraded: !1
                                                }
                                            });
                                        e.loaded_player_count = n.ready_id_list.length,
                                            e._AuthSuccess(a, n.is_game_start, n.game_config.toJSON())
                                    }
                                })
                        },
                        e.prototype._AuthSuccess = function (e, i, n) {
                            var a = this;
                            view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                                app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                    view.DesktopMgr.Inst.Reset(),
                                    view.DesktopMgr.Inst.duringReconnect = !0,
                                    uiscript.UI_Loading.Inst.setProgressVal(.2),
                                    app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                        round_id: view.DesktopMgr.Inst.round_id,
                                        step: view.DesktopMgr.Inst.current_step
                                    }, function (e, i) {
                                        e || i.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", e, i), t.Scene_MJ.Inst.ForceOut()) : (app.Log.log("[syncGame] " + JSON.stringify(i)), i.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2011)), t.Scene_MJ.Inst.GameEnd()) : (uiscript.UI_Loading.Inst.setProgressVal(.3), view.DesktopMgr.Inst.fetchLinks(), view.DesktopMgr.Inst.Reset(), view.DesktopMgr.Inst.duringReconnect = !0, view.DesktopMgr.Inst.syncGameByStep(i.game_restore)))
                                    })
                            })) : t.Scene_MJ.Inst.openMJRoom(n, e, Laya.Handler.create(this, function () {
                                view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(n)), e, GameMgr.Inst.account_id, view.EMJMode.play, Laya.Handler.create(a, function () {
                                    i ? Laya.timer.frameOnce(10, a, function () {
                                        app.Log.log("重连信息2 round_id:-1 step:" + 1e6),
                                            view.DesktopMgr.Inst.Reset(),
                                            view.DesktopMgr.Inst.duringReconnect = !0,
                                            app.NetAgent.sendReq2MJ("FastTest", "syncGame", {
                                                round_id: "-1",
                                                step: 1e6
                                            }, function (e, i) {
                                                app.Log.log("syncGame " + JSON.stringify(i)),
                                                    e || i.error ? (uiscript.UIMgr.Inst.showNetReqError("syncGame", e, i), t.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), view.DesktopMgr.Inst.fetchLinks(), a._PlayerReconnectSuccess(i))
                                            })
                                    }) : Laya.timer.frameOnce(10, a, function () {
                                        app.Log.log("send enterGame"),
                                            view.DesktopMgr.Inst.Reset(),
                                            view.DesktopMgr.Inst.duringReconnect = !0,
                                            app.NetAgent.sendReq2MJ("FastTest", "enterGame", {}, function (e, i) {
                                                e || i.error ? (uiscript.UIMgr.Inst.showNetReqError("enterGame", e, i), t.Scene_MJ.Inst.ForceOut()) : (uiscript.UI_Loading.Inst.setProgressVal(1), app.Log.log("enterGame"), a._EnterGame(i), view.DesktopMgr.Inst.fetchLinks())
                                            })
                                    })
                                }))
                            }), Laya.Handler.create(this, function (t) {
                                return uiscript.UI_Loading.Inst.setProgressVal(.1 + .8 * t)
                            }, null, !1))
                        },
                        e.prototype._EnterGame = function (e) {
                            app.Log.log("正常进入游戏: " + JSON.stringify(e)),
                                e.is_end ? (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2011)), t.Scene_MJ.Inst.GameEnd()) : e.game_restore ? view.DesktopMgr.Inst.syncGameByStep(e.game_restore) : (console.log("正常进入游戏：" + Laya.Stat.currentMemorySize / 1024 / 1024 + " MB"), this.load_over = !0, this.load_over && uiscript.UI_Loading.Inst.enable && uiscript.UI_Loading.Inst.showLoadCount(this.loaded_player_count, this.real_player_count), view.DesktopMgr.Inst.duringReconnect = !1, view.DesktopMgr.Inst.StartChainAction(0))
                        },
                        e.prototype._PlayerReconnectSuccess = function (e) {
                            app.Log.log("_PlayerReconnectSuccess data:" + JSON.stringify(e)),
                                e.isEnd ? (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2011)), t.Scene_MJ.Inst.GameEnd()) : e.game_restore ? view.DesktopMgr.Inst.syncGameByStep(e.game_restore) : (uiscript.UIMgr.Inst.ShowErrorInfo(t.Tools.strOfLocalization(2012)), t.Scene_MJ.Inst.ForceOut())
                        },
                        e.prototype._SendDebugInfo = function () {
                            var t = {};
                            t.type = "未连接了!!!!!!",
                                t.logs = app.Log.getCacheLog(),
                                GameMgr.Inst.postInfo2Server(t)
                        },
                        e.prototype.OpenConnectObserve = function (e, i) {
                            var n = this;
                            this.is_ob = !0,
                                uiscript.UI_Loading.Inst.show("enter_mj"),
                                this.Close(),
                                view.AudioMgr.StopMusic(),
                                Laya.timer.once(500, this, function () {
                                    n.server_location = i,
                                        n.ob_token = e,
                                        n._setState(t.EConnectState.tryconnect),
                                        n.lb_index = 0,
                                        n._fetch_gateway(0)
                                })
                        },
                        e.prototype._ConnectSuccessOb = function () {
                            var e = this;
                            app.Log.log("MJNetMgr _ConnectSuccessOb "),
                                app.NetAgent.sendReq2MJ("FastTest", "authObserve", {
                                    token: this.ob_token
                                }, function (i, n) {
                                    i || n.error ? (uiscript.UIMgr.Inst.showNetReqError("authObserve", i, n), t.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm()) : (app.Log.log("实时OB验证通过：" + JSON.stringify(n)), uiscript.UI_Loading.Inst.setProgressVal(.3), uiscript.UI_Live_Broadcast.Inst && uiscript.UI_Live_Broadcast.Inst.clearPendingUnits(), app.NetAgent.sendReq2MJ("FastTest", "startObserve", {}, function (i, n) {
                                        if (i || n.error)
                                            uiscript.UIMgr.Inst.showNetReqError("startObserve", i, n), t.Scene_MJ.Inst.GameEnd(), view.BgmListMgr.PlayLobbyBgm();
                                        else {
                                            var a = n.head,
                                                r = a.game_config.mode,
                                                s = [],
                                                o = t.Tools.strOfLocalization(2003);
                                            view.ERuleMode.Liqi4;
                                            r.mode < 10 ? (view.ERuleMode.Liqi4, e.real_player_count = 4) : r.mode < 20 && (view.ERuleMode.Liqi3, e.real_player_count = 3);
                                            for (c = 0; c < e.real_player_count; c++)
                                                s.push(null);
                                            r.extendinfo && (o = t.Tools.strOfLocalization(2004)),
                                                r.detail_rule && r.detail_rule.ai_level && (1 === r.detail_rule.ai_level && (o = t.Tools.strOfLocalization(2003)), 2 === r.detail_rule.ai_level && (o = t.Tools.strOfLocalization(2004)));
                                            for (var l = t.GameUtility.get_default_ai_skin(), h = t.GameUtility.get_default_ai_character(), c = 0; c < a.seat_list.length; c++) {
                                                var _ = a.seat_list[c];
                                                if (0 == _)
                                                    s[c] = {
                                                        nickname: o,
                                                        avatar_id: l,
                                                        level: {
                                                            id: 10101
                                                        },
                                                        level3: {
                                                            id: 20101
                                                        },
                                                        character: {
                                                            charid: h,
                                                            level: 0,
                                                            exp: 0,
                                                            views: [],
                                                            skin: l,
                                                            is_upgraded: !1
                                                        }
                                                    };
                                                else
                                                    for (var u = 0; u < a.players.length; u++)
                                                        if (a.players[u].account_id == _) {
                                                            s[c] = a.players[u];
                                                            break
                                                        }
                                            }
                                            for (c = 0; c < e.real_player_count; c++)
                                                null == s[c] && (s[c] = {
                                                    account: 0,
                                                    nickname: t.Tools.strOfLocalization(2010),
                                                    avatar_id: l,
                                                    level: {
                                                        id: 10101
                                                    },
                                                    level3: {
                                                        id: 20101
                                                    },
                                                    character: {
                                                        charid: h,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: l,
                                                        is_upgraded: !1
                                                    }
                                                });
                                            e._StartObSuccuess(s, n.passed, a.game_config.toJSON(), a.start_time)
                                        }
                                    }))
                                })
                        },
                        e.prototype._StartObSuccuess = function (e, i, n, a) {
                            var r = this;
                            view.DesktopMgr.Inst && view.DesktopMgr.Inst.active ? (this.load_over = !0, Laya.timer.once(500, this, function () {
                                app.Log.log("重连信息1 round_id:" + view.DesktopMgr.Inst.round_id + " step:" + view.DesktopMgr.Inst.current_step),
                                    view.DesktopMgr.Inst.Reset(),
                                    uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(a, i)
                            })) : (uiscript.UI_Loading.Inst.setProgressVal(.4), t.Scene_MJ.Inst.openMJRoom(n, e, Laya.Handler.create(this, function () {
                                view.DesktopMgr.Inst.initRoom(JSON.parse(JSON.stringify(n)), e, GameMgr.Inst.account_id, view.EMJMode.live_broadcast, Laya.Handler.create(r, function () {
                                    uiscript.UI_Loading.Inst.setProgressVal(.9),
                                        Laya.timer.once(1e3, r, function () {
                                            GameMgr.Inst.EnterMJ(),
                                                uiscript.UI_Loading.Inst.setProgressVal(.95),
                                                uiscript.UI_Live_Broadcast.Inst.startRealtimeLive(a, i)
                                        })
                                }))
                            }), Laya.Handler.create(this, function (t) {
                                return uiscript.UI_Loading.Inst.setProgressVal(.4 + .4 * t)
                            }, null, !1)))
                        },
                        e._Inst = null,
                        e
                }
                    ();
                t.MJNetMgr = e
            }
                (game || (game = {}));
            //打完之后刷新用户数据，重新赋值为寮舍选择人物
            !function (t) {
                var e = function () {
                    function e(e) {
                        var i = this;
                        this.money = null,
                            this.rank = null,
                            this.small_rank = null,
                            this.rank_show_type = 0,
                            this.btn_report2019 = null,
                            this.me = e;
                        var n = e.getChildByName("container_name");
                        this.name = n.getChildByName("name"),
                            this.rank = new t.UI_Level(n.getChildByName("rank")),
                            this.title = new t.UI_PlayerTitle(n.getChildByName("img_title")),
                            this.small_rank = new t.UI_Level(n.getChildByName("btn_small_rank")),
                            this.money = new t.UI_Money(e, Laya.Handler.create(h.Inst, h.Inst.Hide, null, !1), Laya.Handler.create(this, function () {
                                return h.Inst.locking
                            }, null, !1), new Laya.Handler(this, function () {
                                return Laya.Handler.create(i, function () {
                                    return h.Inst.enable = !0
                                })
                            })),
                            n.getChildByName("btn_info").clickHandler = Laya.Handler.create(this, function () {
                                t.UI_PlayerInfo.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_activity").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || t.UI_Activity.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_rank").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || t.UI_Rank.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_info").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || t.UI_Info.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_set").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || t.UI_Config.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_help").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || t.UI_Rules.Inst.show()
                            }, null, !1),
                            e.getChildByName("btn_xinshouyindao").clickHandler = Laya.Handler.create(this, function () {
                                h.Inst.locking || (t.UI_PiPeiYuYue.Inst.enable ? t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null) : h.Inst.Hide(Laya.Handler.create(i, function () {
                                    t.UI_XinShouYinDao.Inst.show(0, Laya.Handler.create(i, function () {
                                        h.Inst.enable = !0
                                    }))
                                })))
                            }, null, !1),
                            e.getChildByName("btn_camera").clickHandler = new Laya.Handler(this, function () {
                                h.Inst.locking || h.Inst.Hide(Laya.Handler.create(i, function () {
                                    t.UI_Camera_Mode.Inst.show()
                                }))
                            }),
                            e.getChildByName("btn_sign").clickHandler = new Laya.Handler(this, function () {
                                h.Inst.locking || t.UI_Activity_Sign.Inst.show()
                            }),
                            n.getChildByName("btn_small_rank").clickHandler = new Laya.Handler(this, function () {
                                h.Inst.locking || (0 == i.rank_show_type ? i.rank_show_type = 1 : i.rank_show_type = 0, i.show_rank(), Laya.LocalStorage.setItem("rank_show_type", i.rank_show_type.toString()))
                            });
                        var a = Laya.LocalStorage.getItem("rank_show_type");
                        this.rank_show_type = "1" == a ? 1 : 0;
                        var r = "";
                        if ("jp" == GameMgr.client_language && (r = "https://mjjpgs.mahjongsoul.com:3100/"), "en" == GameMgr.client_language && (r = "https://mjengs.mahjongsoul.com:3100/"), "chs" == GameMgr.client_language && (r = "https://repo2019.majsoul.com/#/report/"), this.btn_report2019 = e.getChildByName("btn_report"), "chs" != GameMgr.client_language && Date.now() < 1589058e6) {
                            this.btn_report2019.visible = !1;
                            var s = game.Tools.localUISrc("myres/lobby/report2019.png");
                            Laya.loader.load(s, Laya.Handler.create(this, function () {
                                i.btn_report2019.visible = !0,
                                    i.btn_report2019.getChildByName("img").skin = s
                            })),
                                this.btn_report2019.clickHandler = new Laya.Handler(this, function () {
                                    t.UI_Lite_Loading.Inst.show(),
                                        game.LoadMgr.httpload(r + "api/report/id/" + GameMgr.Inst.access_token + "?type=" + GameMgr.Inst.sociotype, "json", !0, Laya.Handler.create(i, function (e) {
                                            t.UI_Lite_Loading.Inst.close(),
                                                e.success ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3117), Laya.Handler.create(i, function () {
                                                    Laya.Browser.window.location.href = r + "#/report/" + e.data.report_id
                                                }), null) : t.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(3116))
                                        }))
                                })
                        } else
                            this.btn_report2019.visible = !1
                    }
                    return e.prototype.refresh = function () {
                        var e = GameMgr.Inst.account_data;
                        game.Tools.SetNickname(this.name, e),
                            this.title.id = e.title,
                            this.show_rank(),
                            this.money.onEnable(),
                            this.refreshRedpoint(),
                            this.me.getChildByName("btn_sign").visible = t.UI_Activity.activity_is_running(t.UI_Activity_Sign.activity_id)
                    },
                        e.prototype.refreshRedpoint = function () {
                            this.me.getChildByName("btn_activity").getChildByName("redpoint").visible = t.UI_Mail.haveRedPoint || t.UI_Activity.haveRedPoint,
                                this.me.getChildByName("btn_info").getChildByName("redpoint").visible = t.UI_Info.haveRedPoint,
                                this.me.getChildByName("btn_set").getChildByName("redpoint").visible = t.UI_Config.have_redpoint()
                        },
                        e.prototype.show_rank = function () {
                            var t = "level",
                                e = "level3";
                            1 == this.rank_show_type && (t = "level3", e = "level"),
                                this.rank.id = GameMgr.Inst.account_data[t].id,
                                this.small_rank.id = GameMgr.Inst.account_data[e].id
                        },
                        e
                }
                    (),
                    i = function () {
                        function e(t) {
                            this.me = t,
                                this.btn_dajiangsai = t.getChildByName("btn_dajiangsai"),
                                this.btn_yibanchang = t.getChildByName("btn_yibanchang"),
                                this.btn_yourenfang = t.getChildByName("btn_yourenfang"),
                                this.btn_yibanchang.clickHandler = Laya.Handler.create(this, function () {
                                    h.Inst.setPage(1),
                                        GameMgr.Inst.BehavioralStatistics(1)
                                }, null, !1),
                                this.btn_yourenfang.clickHandler = Laya.Handler.create(this, function () {
                                    h.Inst.setPage(2),
                                        GameMgr.Inst.BehavioralStatistics(2)
                                }, null, !1),
                                this.btn_dajiangsai.clickHandler = Laya.Handler.create(this, function () {
                                    GameMgr.Inst.BehavioralStatistics(3),
                                        Laya.LocalStorage.setItem("shilian_btn_click", "1"),
                                        h.Inst.setPage(3)
                                }, null, !1)
                        }
                        return e.prototype.onEnable = function (e) {
                            var i = this;
                            this.btn_yibanchang.visible = !1,
                                this.btn_dajiangsai.visible = !1,
                                this.btn_yourenfang.visible = !1,
                                this.btn_yibanchang.alpha = 1,
                                this.btn_dajiangsai.alpha = 1,
                                this.btn_yourenfang.alpha = 1,
                                Laya.timer.once(e, this, function () {
                                    view.AudioMgr.PlayAudio(104),
                                        i.btn_yibanchang.x = 700,
                                        i.btn_yibanchang.y = 405,
                                        i.btn_yibanchang.scaleX = .2,
                                        i.btn_yibanchang.scaleY = .2,
                                        i.btn_yibanchang.visible = !0,
                                        i.btn_yibanchang.alpha = 0,
                                        Laya.Tween.to(i.btn_yibanchang, {
                                            x: 1183,
                                            y: 368,
                                            scaleX: 1.2,
                                            scaleY: 1.2,
                                            alpha: 1
                                        }, 233, function (t, e, i, n) {
                                            return Laya.Ease.backOut(t, e, i, n, 1)
                                        })
                                }),
                                Laya.timer.once(e + 100, this, function () {
                                    view.AudioMgr.PlayAudio(104),
                                        i.btn_dajiangsai.x = 700,
                                        i.btn_dajiangsai.y = 530,
                                        i.btn_dajiangsai.scaleX = .2,
                                        i.btn_dajiangsai.scaleY = .2,
                                        i.btn_dajiangsai.visible = !0,
                                        i.btn_dajiangsai.alpha = 0,
                                        Laya.Tween.to(i.btn_dajiangsai, {
                                            x: 1110,
                                            y: 547,
                                            scaleX: 1.2,
                                            scaleY: 1.2,
                                            alpha: 1
                                        }, 233, function (t, e, i, n) {
                                            return Laya.Ease.backOut(t, e, i, n, 1)
                                        })
                                }),
                                Laya.timer.once(e + 200, this, function () {
                                    view.AudioMgr.PlayAudio(104),
                                        i.btn_yourenfang.x = 700,
                                        i.btn_yourenfang.y = 634,
                                        i.btn_yourenfang.scaleX = .2,
                                        i.btn_yourenfang.scaleY = .2,
                                        i.btn_yourenfang.visible = !0,
                                        i.btn_yourenfang.alpha = 0,
                                        Laya.Tween.to(i.btn_yourenfang, {
                                            x: 1123,
                                            y: 736,
                                            scaleX: 1.2,
                                            scaleY: 1.2,
                                            alpha: 1
                                        }, 233, function (t, e, i, n) {
                                            return Laya.Ease.backOut(t, e, i, n, 1)
                                        })
                                });
                            var n = !1,
                                a = cfg.desktop.matchmode.get(13);
                            if (t.UI_Activity.activity_is_running(a.activity_id)) {
                                var r = Laya.LocalStorage.getItem("art1_1011_" + GameMgr.Inst.account_id),
                                    s = 0;
                                r && "" != r && (s = parseInt(r)),
                                    n = Date.now() > s + 864e6
                            }
                            t.UI_Shilian.shilian_opening() && !Laya.LocalStorage.getItem("shilian_btn_click") && (n = !0),
                                this.btn_dajiangsai.getChildByName("redpoint").visible = n,
                                this.me.visible = !0
                        },
                            e.prototype.onDisable = function (e) {
                                var i = this;
                                t.UIBase.anim_alpha_out(this.btn_yibanchang, {
                                    x: -500,
                                    y: 450,
                                    scaleX: -1,
                                    scaleY: -1
                                }, 200, e, null, Laya.Ease.backIn),
                                    t.UIBase.anim_alpha_out(this.btn_dajiangsai, {
                                        x: -500,
                                        y: 150,
                                        scaleX: -1,
                                        scaleY: -1
                                    }, 200, e, null, Laya.Ease.backIn),
                                    t.UIBase.anim_alpha_out(this.btn_yourenfang, {
                                        x: -500,
                                        y: -150,
                                        scaleX: -1,
                                        scaleY: -1
                                    }, 200, e, null, Laya.Ease.backIn),
                                    Laya.timer.once(200 + e, this, function () {
                                        i.me.visible = !1
                                    })
                            },
                            e
                    }
                        (),
                    n = function () {
                        function t(t) {
                            var e = this;
                            this.me = t,
                                this.me.visible = !1,
                                this.btn_back = t.getChildByName("btn_back"),
                                this.btn_back.clickHandler = new Laya.Handler(this, function () {
                                    e.func_back && e.func_back.run()
                                }),
                                this.title = t.getChildByName("title")
                        }
                        return t.prototype.show = function (t, e) {
                            this.title.text = t,
                                game.Tools.labelLocalizationPosition(this.title, 345, this.title.width, !0),
                                this.func_back = e,
                                this.me.visible || (this.me.visible = !0, h.Inst.me.page_title_in.play(0, !1)),
                                Laya.timer.clearAll(this)
                        },
                            t.prototype.close = function () {
                                var t = this;
                                this.me.visible && (h.Inst.me.page_title_out.play(0, !1), Laya.timer.once(200, this, function () {
                                    t.me.visible = !1
                                }))
                            },
                            t
                    }
                        (),
                    a = function () {
                        function e(e) {
                            var i = this;
                            this.locking = !1,
                                this.me = e,
                                this.me.visible = !1,
                                this.p0 = e.getChildByName("p0"),
                                this.p0.getChildByName("content").vScrollBar.visible = !1,
                                this.content0 = this.p0.getChildByName("content");
                            for (var n = GameMgr.Inst.account_data, a = function (e) {
                                var a = r.p0.getChildByName("content").getChildByName("btn" + e),
                                    s = a.getChildByName("container"),
                                    o = s.getChildByName("btn"),
                                    l = a.getChildByName("stop"),
                                    c = 0;
                                c = e < 4 ? 1 + 3 * e : 15;
                                var _ = cfg.desktop.matchmode.find(c);
                                _.is_open ? (o.mouseEnabled = !0, s.filters = [], l.visible = !1, o.clickHandler = Laya.Handler.create(r, function () {
                                    if (!i.locking) {
                                        var a = !0,
                                            r = "";
                                        a && !_.is_open && (a = !1, r = game.Tools.strOfLocalization(1306));
                                        var s = !0,
                                            o = !0,
                                            l = !0,
                                            c = !0,
                                            u = !0,
                                            d = !0,
                                            f = n.level.id,
                                            p = n.level3.id,
                                            m = n.gold;
                                        cfg.desktop.matchmode.forEach(function (t) {
                                            var i = e + 1;
                                            5 == i && (i = 6),
                                                t.room == i && ((!t.glimit_floor || m >= t.glimit_floor) && (u = !1), (-1 == t.glimit_ceil || m <= t.glimit_ceil) && (d = !1), t.mode < 10 ? ((!t.level_limit || f >= t.level_limit) && (s = !1), (!t.level_limit_ceil || f <= t.level_limit_ceil) && (o = !1)) : ((!t.level_limit || p >= t.level_limit) && (l = !1), (!t.level_limit_ceil || p <= t.level_limit_ceil) && (c = !1)))
                                        }),
                                            (s || o) && (l || c) ? (a = !1, r = game.Tools.strOfLocalization(103)) : u ? (a = !1, r = game.Tools.strOfLocalization(101)) : d && (a = !1, r = game.Tools.strOfLocalization(102)),
                                            a ? (i.close(), Laya.timer.once(100, i, function () {
                                                h.Inst.page_east_north.show(_.room)
                                            })) : t.UIMgr.Inst.ShowErrorInfo(r)
                                    }
                                }, null, !1)) : (o.mouseEnabled = !1, s.filters = [new Laya.ColorFilter(t.GRAY_FILTER)], l.visible = !0),
                                    s.getChildByName("btn_tips").clickHandler = Laya.Handler.create(r, function () {
                                        i.locking || t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(e < 4 ? 4 + e : 64))
                                    }, null, !1)
                            }, r = this, s = 0; s < 5; s++)
                                a(s)
                        }
                        return e.prototype.show = function () {
                            var t = this;
                            this.content0.vScrollBar.value = 0,
                                view.AudioMgr.PlayAudio(102),
                                this.me.visible = !0,
                                this.locking = !0,
                                h.Inst.page_title.show(game.Tools.strOfLocalization(2079), Laya.Handler.create(this, function () {
                                    t.locking || h.Inst.setPage(0)
                                }, null, !1)),
                                this.p0.alpha = 1,
                                this.p0.visible = !1;
                            for (var e = 0; e < 5; e++)
                                this.p0.getChildByName("content").getChildByName("btn" + e).alpha = 1;
                            Laya.timer.once(100, this, function () {
                                t.p0.visible = !0,
                                    h.Inst.me.rank_in.play(0, !1)
                            }),
                                Laya.timer.once(300, this, function () {
                                    t.locking = !1
                                })
                        },
                            e.prototype.close = function () {
                                var t = this;
                                this.me.visible && (this.locking = !0, h.Inst.me.rank_out.play(0, !1), Laya.timer.once(200, this, function () {
                                    t.me.visible = !1,
                                        t.locking = !1,
                                        Laya.timer.clearAll(t)
                                }))
                            },
                            e
                    }
                        (),
                    r = function () {
                        function e(e) {
                            var i = this;
                            this.locking = !1,
                                this.me = e,
                                this.me.visible = !1,
                                this.btn_create_room = e.getChildByName("content").getChildByName("btn0").getChildByName("btn"),
                                e.getChildByName("content").getChildByName("btn0").getChildByName("btn_tips").clickHandler = Laya.Handler.create(this, function () {
                                    t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(8)),
                                        GameMgr.Inst.BehavioralStatistics(10)
                                }, null, !1),
                                this.btn_add_room = e.getChildByName("content").getChildByName("btn1").getChildByName("btn"),
                                e.getChildByName("content").getChildByName("btn1").getChildByName("btn_tips").clickHandler = Laya.Handler.create(this, function () {
                                    t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(9))
                                }, null, !1),
                                this.btn_create_room.clickHandler = Laya.Handler.create(this, function () {
                                    h.Inst.locking || (t.UI_PiPeiYuYue.Inst.enable ? t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null) : h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Create_Room.Show()
                                    })))
                                }, null, !1),
                                this.btn_add_room.clickHandler = Laya.Handler.create(this, function () {
                                    t.UI_PiPeiYuYue.Inst.enable ? t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null) : t.UI_NumberInput.Inst.show(game.Tools.strOfLocalization(2080), Laya.Handler.create(i, function (e) {
                                        app.NetAgent.sendReq2Lobby("Lobby", "joinRoom", {
                                            room_id: e
                                        }, function (e, i) {
                                            e || i.error ? t.UIMgr.Inst.showNetReqError("joinRoom", e, i) : (h.Inst.enable = !1, t.UI_WaitingRoom.Inst.updateData(i.room), t.UIMgr.Inst.ShowWaitingRoom())
                                        })
                                    }), null)
                                }, null, !1),
                                "chs" != GameMgr.client_language && "chs_t" != GameMgr.client_language && (e.getChildByName("content").getChildByName("btn0").getChildByName("del").visible = !1, e.getChildByName("content").getChildByName("btn1").getChildByName("del").visible = !1)
                        }
                        return e.prototype.show = function () {
                            var t = this;
                            h.Inst.page_title.show(game.Tools.strOfLocalization(2023), Laya.Handler.create(this, function () {
                                t.locking || h.Inst.setPage(0)
                            }, null, !1)),
                                this.btn_add_room.alpha = 1,
                                this.btn_create_room.alpha = 1,
                                this.btn_create_room.visible = !0,
                                this.btn_add_room.visible = !0,
                                this.me.visible = !0,
                                view.AudioMgr.PlayAudio(102),
                                h.Inst.me.friend_in.play(0, !1),
                                Laya.timer.once(150, this, function () {
                                    t.locking = !1
                                })
                        },
                            e.prototype.close = function () {
                                var t = this;
                                this.me.visible && (this.locking = !0, h.Inst.me.friend_out.play(0, !1), Laya.timer.once(200, this, function () {
                                    t.locking = !1,
                                        t.me.visible = !1
                                }))
                            },
                            e
                    }
                        (),
                    s = function () {
                        function e(t) {
                            var e = this;
                            this.btns = [],
                                this.infos = [],
                                this.me = t,
                                t.visible = !1,
                                this.content = t.getChildByName("content");
                            for (var i = function (t) {
                                var i = n.content.getChildByName("btn" + t);
                                n.btns.push(i),
                                    i.getChildByName("container").getChildByName("btn").clickHandler = Laya.Handler.create(n, function () {
                                        h.Inst.locking || e.locking || (e.onClickAt(t), i.getChildByName("redpoint").visible = !1)
                                    }, null, !1),
                                    i.getChildByName("container").getChildByName("btn_tips").clickHandler = Laya.Handler.create(n, function () {
                                        h.Inst.locking || e.locking || e.onShowInfo(t)
                                    }, null, !1)
                            }, n = this, a = 0; a < 4; a++)
                                i(a)
                        }
                        return e.prototype.show = function () {
                            var e = this;
                            h.Inst.page_title.show(game.Tools.strOfLocalization(2025), Laya.Handler.create(this, function () {
                                e.locking || h.Inst.setPage(0)
                            }, null, !1)),
                                this.content.vScrollBar.value = 0,
                                this.infos = [],
                                this.infos.push("dahuishi"),
                                this.infos.push("xiuxianchang"),
                                t.UI_Shilian.shilian_opening() && this.infos.push("shilian");
                            o = cfg.desktop.matchmode.get(33);
                            t.UI_Activity.activity_is_running(o.activity_id) && this.infos.push("dora3");
                            o = cfg.desktop.matchmode.get(34);
                            t.UI_Activity.activity_is_running(o.activity_id) && this.infos.push("peipai_open");
                            o = cfg.desktop.matchmode.get(13);
                            t.UI_Activity.activity_is_running(o.activity_id) && this.infos.push("guyi");
                            o = cfg.desktop.matchmode.get(35);
                            t.UI_Activity.activity_is_running(o.activity_id) && this.infos.push("muyu");
                            for (var i = 0; i < this.btns.length; i++)
                                if (i < this.infos.length) {
                                    this.btns[i].alpha = 1,
                                        this.btns[i].visible = !0;
                                    var n = this.btns[i].getChildByName("redpoint"),
                                        a = this.btns[i].getChildByName("container").getChildByName("tips"),
                                        r = this.btns[i].getChildByName("container").getChildByName("name");
                                    if ("dahuishi" == this.infos[i])
                                        n.visible = !1, a.text = game.Tools.strOfLocalization(2471), r.skin = game.Tools.localUISrc("myres/lobby/w_saishidating.png");
                                    else if ("xiuxianchang" == this.infos[i])
                                        n.visible = !1, a.text = game.Tools.strOfLocalization(2471), r.skin = game.Tools.localUISrc("myres/lobby/w_xiuxian.png");
                                    else if ("dora3" == this.infos[i]) {
                                        var s = !1,
                                            o = cfg.desktop.matchmode.get(33);
                                        if (t.UI_Activity.activity_is_running(o.activity_id)) {
                                            c = 0;
                                            (l = Laya.LocalStorage.getItem("art0_10133_" + GameMgr.Inst.account_id)) && "" != l && (c = parseInt(l)),
                                                s = Date.now() > c + 864e6
                                        }
                                        n.visible = s,
                                            a.text = game.Tools.strOfLocalization(2774),
                                            r.skin = game.Tools.localUISrc("myres/lobby/w_dora3.png")
                                    } else if ("peipai_open" == this.infos[i]) {
                                        var s = !1,
                                            o = cfg.desktop.matchmode.get(34);
                                        if (t.UI_Activity.activity_is_running(o.activity_id)) {
                                            c = 0;
                                            (l = Laya.LocalStorage.getItem("art0_10134_" + GameMgr.Inst.account_id)) && "" != l && (c = parseInt(l)),
                                                s = Date.now() > c + 864e6
                                        }
                                        n.visible = s,
                                            a.text = game.Tools.strOfLocalization(2774),
                                            r.skin = game.Tools.localUISrc("myres/lobby/w_peipai.png")
                                    } else if ("muyu" == this.infos[i]) {
                                        var s = !1,
                                            o = cfg.desktop.matchmode.get(35);
                                        if (t.UI_Activity.activity_is_running(o.activity_id)) {
                                            c = 0;
                                            (l = Laya.LocalStorage.getItem("art0_10135_" + GameMgr.Inst.account_id)) && "" != l && (c = parseInt(l)),
                                                s = Date.now() > c + 864e6
                                        }
                                        n.visible = s,
                                            a.text = game.Tools.strOfLocalization(2774),
                                            r.skin = game.Tools.localUISrc("myres/lobby/w_muyu.png")
                                    } else if ("guyi" == this.infos[i]) {
                                        var s = !1,
                                            o = cfg.desktop.matchmode.get(13);
                                        if (t.UI_Activity.activity_is_running(o.activity_id)) {
                                            var l = Laya.LocalStorage.getItem("art1_1011_" + GameMgr.Inst.account_id),
                                                c = 0;
                                            l && "" != l && (c = parseInt(l)),
                                                s = Date.now() > c + 864e6
                                        }
                                        n.visible = s,
                                            a.text = game.Tools.strOfLocalization(2774),
                                            r.skin = game.Tools.localUISrc("jp" == GameMgr.client_language ? "myres/lobby/w_luandou2.png" : "myres/lobby/w_luandou.png")
                                    } else
                                        "shilian" == this.infos[i] && (n.visible = !Laya.LocalStorage.getItem("shilian_entrance_click"), a.text = game.Tools.strOfLocalization(2774), r.skin = game.Tools.localUISrc("myres/lobby/w_shilian.png"))
                                } else
                                    this.btns[i].visible = !1;
                            this.locking = !0,
                                view.AudioMgr.PlayAudio(102),
                                this.me.visible = !0,
                                h.Inst.me["match_in" + this.infos.length].play(0, !1),
                                Laya.timer.once(150, this, function () {
                                    e.locking = !1
                                })
                        },
                            e.prototype.close = function () {
                                var t = this;
                                this.me.visible && (h.Inst.me.match_out.play(0, !1), Laya.timer.once(200, this, function () {
                                    t.me.visible = !1
                                }))
                            },
                            e.prototype.onClickAt = function (e) {
                                var i = this.infos[e];
                                if ("dahuishi" == i) {
                                    if (t.UI_PiPeiYuYue.Inst.enable)
                                        return void t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null);
                                    h.Inst.Hide(Laya.Handler.create(this, function () {
                                        t.UI_Match_Lobby.Inst.show()
                                    }))
                                } else if ("xiuxianchang" == i) {
                                    var n = cfg.desktop.matchmode.find(29),
                                        a = GameMgr.Inst.account_data,
                                        r = "";
                                    (v = !0) && !n.is_open && (v = !1, r = game.Tools.strOfLocalization(1306));
                                    var s = !0,
                                        o = !0,
                                        l = !0,
                                        c = !0,
                                        _ = !0,
                                        u = !0,
                                        d = a.level.id,
                                        f = a.level3.id,
                                        p = a.gold;
                                    cfg.desktop.matchmode.forEach(function (t) {
                                        100 == t.room && ((!t.glimit_floor || p >= t.glimit_floor) && (_ = !1), (-1 == t.glimit_ceil || p <= t.glimit_ceil) && (u = !1), t.mode < 10 ? ((!t.level_limit || d >= t.level_limit) && (s = !1), (!t.level_limit_ceil || d <= t.level_limit_ceil) && (o = !1)) : ((!t.level_limit || f >= t.level_limit) && (l = !1), (!t.level_limit_ceil || f <= t.level_limit_ceil) && (c = !1)))
                                    }),
                                        (s || o) && (l || c) ? (v = !1, r = game.Tools.strOfLocalization(103)) : _ ? (v = !1, r = game.Tools.strOfLocalization(101)) : u && (v = !1, r = game.Tools.strOfLocalization(102)),
                                        v ? (this.close(), Laya.timer.once(100, this, function () {
                                            h.Inst.page_east_north.show(n.room)
                                        })) : t.UIMgr.Inst.ShowErrorInfo(r)
                                } else if ("shilian" == i) {
                                    if (t.UI_PiPeiYuYue.Inst.enable)
                                        return void t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null);
                                    Laya.LocalStorage.setItem("shilian_entrance_click", "1"),
                                        h.Inst.Hide(Laya.Handler.create(this, function () {
                                            t.UI_Shilian.Inst.show()
                                        }))
                                } else {
                                    var m = 0,
                                        g = "";
                                    switch (i) {
                                        case "dora3":
                                            m = 33,
                                                g = "art0_10133_";
                                            break;
                                        case "guyi":
                                            m = 13,
                                                g = "art1_1011_";
                                            break;
                                        case "peipai_open":
                                            m = 34,
                                                g = "art0_10134_";
                                            break;
                                        case "muyu":
                                            m = 35,
                                                g = "art0_10135_"
                                    }
                                    if (m) {
                                        var y = cfg.desktop.matchmode.find(m),
                                            v = !0,
                                            r = "",
                                            b = !0,
                                            w = !0,
                                            x = !0,
                                            I = !0,
                                            C = (a = GameMgr.Inst.account_data).level.id,
                                            S = (a.level3.id, a.gold);
                                        cfg.desktop.matchmode.forEach(function (t) {
                                            t.room == y.room && ((!t.glimit_floor || S >= t.glimit_floor) && (x = !1), (-1 == t.glimit_ceil || S <= t.glimit_ceil) && (I = !1), t.mode < 10 && ((!t.level_limit || C >= t.level_limit) && (b = !1), (!t.level_limit_ceil || C <= t.level_limit_ceil) && (w = !1)))
                                        }),
                                            b || w ? (v = !1, r = game.Tools.strOfLocalization(103)) : x ? (v = !1, r = game.Tools.strOfLocalization(101)) : I && (v = !1, r = game.Tools.strOfLocalization(102)),
                                            v && !y.is_open && (v = !1, r = game.Tools.strOfLocalization(1306)),
                                            v ? (this.close(), Laya.timer.once(100, this, function () {
                                                h.Inst.page_east_north.show(y.room)
                                            })) : t.UIMgr.Inst.ShowErrorInfo(r),
                                            Laya.LocalStorage.setItem(g + GameMgr.Inst.account_id, Date.now().toString())
                                    }
                                }
                            },
                            e.prototype.onShowInfo = function (e) {
                                var i = this.infos[e];
                                "dahuishi" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(56)) : "xiuxianchang" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(2841)) : "dora3" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(2850)) : "muyu" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(3050)) : "guyi" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(2775)) : "peipai_open" == i ? t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(3029)) : "shilian" == i && t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(3178))
                            },
                            e
                    }
                        (),
                    o = function () {
                        function e(e) {
                            var i = this;
                            this.btns = [],
                                this.locking = !1,
                                this.room_type = -1,
                                this.list_mode = [],
                                this._last_fetch_time = 0,
                                this._last_fetch_success = !1,
                                this.me = e,
                                this.me.visible = !1;
                            GameMgr.Inst.account_data;
                            this.p1 = e.getChildByName("p1"),
                                this.p1.getChildByName("content").vScrollBar.visible = !1,
                                this.content1 = this.p1.getChildByName("content");
                            for (var n = function (e) {
                                var n = a.p1.getChildByName("content").getChildByName("btn" + e);
                                n.getChildByName("btn").clickHandler = Laya.Handler.create(a, function () {
                                    if (!i.locking && i.list_mode[e].met) {
                                        var n = i.p1.getChildByName("content").getChildByName("btn" + e).getChildByName("flag_yuyue");
                                        t.UI_PiPeiYuYue.Inst.matchYuYued(i.list_mode[e].id) ? t.UI_PiPeiYuYue.Inst.cancelPiPei(i.list_mode[e].id) : t.UI_PiPeiYuYue.Inst.addMatch(i.list_mode[e].id) && (n.visible = !0),
                                            GameMgr.Inst.BehavioralStatistics(8 + e)
                                    }
                                }, null, !1),
                                    n.getChildByName("btn_tips").clickHandler = Laya.Handler.create(a, function () {
                                        if (!i.locking)
                                            if (200 == i.room_type)
                                                t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(2851));
                                            else if (210 == i.room_type)
                                                t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(3030));
                                            else if (220 == i.room_type)
                                                t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(3051));
                                            else {
                                                var n = 0;
                                                switch (e) {
                                                    case 0:
                                                        n = 2;
                                                        break;
                                                    case 1:
                                                        n = 3;
                                                        break;
                                                    case 2:
                                                        n = 24;
                                                        break;
                                                    case 3:
                                                        n = 25
                                                }
                                                t.UI_InfoLite.Inst.show(game.Tools.strOfLocalization(n))
                                            }
                                    }, null, !1),
                                    a.btns.push(n)
                            }, a = this, r = 0; r < 4; r++)n(r);
                            t.UI_PiPeiYuYue.Inst.me.on("cancelPiPei", this, function (t) {
                                for (var e = 0; e < i.list_mode.length; e++)
                                    i.list_mode[e].id == t && (i.p1.getChildByName("content").getChildByName("btn" + e).getChildByName("flag_yuyue").visible = !1)
                            }),
                                t.UI_PiPeiYuYue.Inst.me.on("pipeiover", this, function () {
                                    for (var t = 0; t < 4; t++)
                                        i.p1.getChildByName("content").getChildByName("btn" + t).getChildByName("flag_yuyue").visible = !1
                                })
                        }
                        return e.prototype.show = function (e) {
                            var i = this;
                            Laya.timer.clearAll(this);
                            var n = "";
                            cfg.desktop.matchmode.forEach(function (t) {
                                t.room == e && (n = t["room_name_" + GameMgr.client_language])
                            }),
                                h.Inst.page_title.show(n, Laya.Handler.create(this, function () {
                                    i.locking || (i.close(), 1 == e || 2 == e || 3 == e || 4 == e || 6 == e ? h.Inst.page_rank.show() : h.Inst.page_match.show())
                                }, null, !1)),
                                this.room_type = e,
                                this.content1.vScrollBar.value = 0,
                                view.AudioMgr.PlayAudio(102),
                                this.me.visible = !0,
                                this.locking = !0;
                            for (a = 0; a < 4; a++)
                                this.p1.getChildByName("content").getChildByName("btn" + a).getChildByName("count").text = "--", this.p1.getChildByName("content").getChildByName("btn" + a).alpha = 1;
                            Laya.timer.once(150, this, function () {
                                i.locking = !1
                            }),
                                Laya.timer.loop(1e3, this, this._fetchPlayerCount),
                                this.content1.vScrollBar.value = 0,
                                this.list_mode = [],
                                cfg.desktop.matchmode.forEach(function (t, e) {
                                    if (0 != t.mode && i.room_type == t.room) {
                                        var n = !0,
                                            a = GameMgr.Inst.account_data[t.mode < 10 ? "level" : "level3"].id;
                                        t.level_limit && a < t.level_limit && (n = !1),
                                            t.level_limit_ceil && a > t.level_limit_ceil && (n = !1),
                                            i.list_mode.push({
                                                mode: t.mode,
                                                id: t.id,
                                                met: n
                                            })
                                    }
                                }),
                                this._last_fetch_time = 0,
                                this._last_fetch_success = !0,
                                this._fetchPlayerCount();
                            for (var a = 0; a < this.btns.length; a++) {
                                var r = this.btns[a];
                                if (a < this.list_mode.length) {
                                    r.visible = !0,
                                        r.getChildByName("flag_yuyue").visible = t.UI_PiPeiYuYue.Inst.matchYuYued(this.list_mode[a].id),
                                        r.getChildByName("unmet").visible = !this.list_mode[a].met,
                                        r.getChildByName("btn").mouseEnabled = this.list_mode[a].met;
                                    var s = "";
                                    switch (this.list_mode[a].mode) {
                                        case 1:
                                            s = game.Tools.localUISrc("myres/lobby/w_sirendong.png");
                                            break;
                                        case 2:
                                            s = game.Tools.localUISrc("myres/lobby/w_sirennan.png");
                                            break;
                                        case 11:
                                            s = game.Tools.localUISrc("myres/lobby/w_sanrendong.png");
                                            break;
                                        case 12:
                                            s = game.Tools.localUISrc("myres/lobby/w_sanrennan.png")
                                    }
                                    r.getChildByName("img").skin = s
                                } else
                                    r.visible = !1
                            }
                            h.Inst.me["east_north_in" + this.list_mode.length].play(0, !1)
                        },
                            e.prototype.close = function () {
                                var t = this;
                                this.me.visible && (this.locking = !0, h.Inst.me.east_north_out.play(0, !1), Laya.timer.once(200, this, function () {
                                    t.me.visible = !1,
                                        t.locking = !1,
                                        Laya.timer.clearAll(t)
                                }))
                            },
                            e.prototype._fetchPlayerCount = function () {
                                var e = this;
                                if (game.LobbyNetMgr.Inst.isOK && this._last_fetch_success && !(Laya.timer.currTimer < this._last_fetch_time + 7e3)) {
                                    this._last_fetch_time = Laya.timer.currTimer;
                                    for (var i = [], n = 0; n < this.list_mode.length; n++)
                                        this.list_mode[n].met && i.push(this.list_mode[n].id);
                                    this._last_fetch_success = !1,
                                        app.NetAgent.sendReq2Lobby("Lobby", "fetchCurrentMatchInfo", {
                                            mode_list: i
                                        }, function (i, n) {
                                            if (i || n.error) {
                                                t.UIMgr.Inst.showNetReqError("fetchCurrentMatchInfo", i, n);
                                                for (a = 0; a < 4; a++)
                                                    e.p1.getChildByName("content").getChildByName("btn" + a).getChildByName("count").text = "--";
                                                e._last_fetch_success = !1
                                            } else
                                                try {
                                                    app.Log.log(JSON.stringify(n));
                                                    for (var a = 0; a < n.matches.length; a++) {
                                                        for (var r = n.matches[a].mode_id, s = n.matches[a].playing_count, o = -1, l = 0; l < e.list_mode.length; l++)
                                                            if (e.list_mode[l].id == r) {
                                                                o = l;
                                                                break
                                                            }
                                                        -1 != o && (e.p1.getChildByName("content").getChildByName("btn" + o).getChildByName("count").text = s.toString())
                                                    }
                                                    e._last_fetch_success = !0
                                                } catch (i) { }
                                        })
                                }
                            },
                            e
                    }
                        (),
                    l = function () {
                        function e(e) {
                            var i = this;
                            this.me = e;
                            for (var n = function (n) {
                                e.getChildAt(n).clickHandler = Laya.Handler.create(a, function () {
                                    h.Inst.locking || (0 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Sushe.Inst.show(0)
                                    })) : 5 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Shop.Inst.show()
                                    })) : 3 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_PaiPu.Inst.show()
                                    })) : 1 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Friend.Inst.show()
                                    })) : 2 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Ob.Inst.show()
                                    })) : 4 == n ? h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Bag.Inst.show()
                                    })) : 6 == n && h.Inst.Hide(Laya.Handler.create(i, function () {
                                        t.UI_Treasure.Inst.show()
                                    })))
                                }, null, !1)
                            }, a = this, r = 0; r < 7; r++)
                                n(r)
                        }
                        return e.prototype.onEnable = function () {
                            this.me.getChildAt(0).getChildByName("redpoint").visible = t.UI_Sushe.check_all_char_repoint(),
                                this.me.getChildAt(1).getChildByName("redpoint").visible = game.FriendMgr.friendapply_list && game.FriendMgr.friendapply_list.length > 0,
                                this.me.getChildAt(5).getChildByName("redpoint").visible = t.UI_Shop.Inst && t.UI_Shop.Inst.have_red_point(),
                                this.me.getChildAt(4).getChildByName("redpoint").visible = t.UI_Bag.Inst && t.UI_Bag.Inst.have_red_point(),
                                this.me.getChildAt(6).getChildByName("redpoint").visible = t.UI_Treasure.Inst && t.UI_Treasure.Inst.have_red_point()
                        },
                            e
                    }
                        (),
                    h = function (h) {
                        function c() {
                            var t = h.call(this, new ui.lobby.lobbyUI) || this;
                            return t.top = null,
                                t.page0 = null,
                                t.page_rank = null,
                                t.page_friend = null,
                                t.page_match = null,
                                t.page_east_north = null,
                                t.btns = null,
                                t.page_title = null,
                                t.chat_id = 0,
                                t.container_chat = null,
                                t.chat_block = null,
                                t.character_skin = null,
                                t.nowpage = 0,
                                t.locking = !1,
                                t.sound_channel = null,
                                t.firstIn = !0,
                                t._check_idcard = !1,
                                c.Inst = t,
                                t
                        }
                        return __extends(c, h),
                            c.prototype.onCreate = function () {
                                var h = this;
                                this.top = new e(this.me.getChildByName("container_top")),
                                    this.page0 = new i(this.me.getChildByName("page0")),
                                    this.page_rank = new a(this.me.getChildByName("container_pages").getChildByName("page_rank")),
                                    this.page_friend = new r(this.me.getChildByName("container_pages").getChildByName("page_friend")),
                                    this.page_match = new s(this.me.getChildByName("container_pages").getChildByName("page_match")),
                                    this.page_east_north = new o(this.me.getChildByName("container_pages").getChildByName("page_east_north")),
                                    this.page_title = new n(this.me.getChildByName("container_pages").getChildByName("container_title")),
                                    this.btns = new l(this.me.getChildByName("container_btns")),
                                    this.character_skin = new t.UI_Character_Skin(this.me.getChildByName("illust").getChildByName("illust")),
                                    this.container_chat = this.me.getChildByName("illust").getChildByName("chat"),
                                    this.container_chat.visible = !1,
                                    this.chat_block = new t.UI_Character_Chat(this.container_chat),
                                    this.me.getChildByName("illust").getChildByName("btn").clickHandler = Laya.Handler.create(this, function () {
                                        c.login_helloed && (h.sound_channel ? h.stopsay() : h.say("lobby_normal"))
                                    }, null, !1)
                            },
                            c.prototype.onEnable = function () {
                                this.showEnter(),
                                    t.UI_Invite.Inst.enable = !0,
                                    this.firstIn && (this.firstIn = !1, t.UI_PaiPu.init(), game.Scene_Lobby.Inst.have_send_login_beat || app.NetAgent.sendReq2Lobby("Lobby", "loginBeat", {
                                        contract: "DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP"
                                    }, function (t, e) { })),
                                    this.bi_trace(),
                                    Laya.timer.once(2e3, this, function () {
                                        t.UI_Create_Room.Inst.enable || t.UI_WaitingRoom.Inst.enable || Laya.loader.clearTextureRes("res/atlas/" + game.Tools.localUISrc("myres/room.atlas")),
                                            t.UI_Activity.Inst.enable || Laya.loader.clearTextureRes("res/atlas/" + game.Tools.localUISrc("myres/yueka.atlas")),
                                            t.UI_Shilian.Inst.enable || Laya.loader.clearTextureRes("res/atlas/" + game.Tools.localUISrc("myres/shilian.atlas"))
                                    }),
                                    t.UI_Force_Update.Pending()
                            },
                            c.prototype.onDisable = function () {
                                this.page0.onDisable(0),
                                    this.page_rank.close(),
                                    this.page_friend.close(),
                                    this.page_match.close(),
                                    this.page_title.close(),
                                    this.page_east_north.close(),
                                    this.character_skin.clear(),
                                    this.stopsay()
                            },
                            c.prototype.showEnter = function () {
                                var t = this;
                                this.refreshInfo(),
                                    this.page0.me.visible = !0,
                                    this.page_rank.me.visible = !1,
                                    this.page_friend.me.visible = !1,
                                    this.page_match.me.visible = !1,
                                    this.page_title.me.visible = !1,
                                    this.page_east_north.me.visible = !1,
                                    this.nowpage = 0,
                                    this.locking = !0,
                                    this.me.in.play(0, !1),
                                    this.page0.onEnable(567),
                                    this.btns.onEnable(),
                                    Laya.timer.once(700, this, function () {
                                        t.locking = !1,
                                            t.pending_lobby_jump()
                                    }),
                                    game.Scene_Lobby.Inst.change_bg("yard", !1),
                                    c.login_helloed || Laya.timer.once(500, this, function () {
                                        c.login_helloed = !0,
                                            t.say("lobby_playerlogin")
                                    })
                            },
                            c.prototype.refreshInfo = function () {
                                GameMgr.Inst.account_data;
                                this.top.refresh();
                                //打完之后刷新用户数据，重新赋值为寮舍选择人物 -----fxxk
                                (GameMgr.Inst.account_data.avatar_id = GameMgr.Inst.account_data.my_character.skin);
                                //end
                                this.character_skin.setSkin(GameMgr.Inst.account_data.avatar_id, "full"),
                                    this.character_skin.me.visible = !0
                            },
                            c.prototype.Hide = function (t) {
                                var e = this;
                                switch (this.locking = !0, this.nowpage) {
                                    case 0:
                                        this.page0.onDisable(0);
                                        break;
                                    case 1:
                                        this.page_rank.close();
                                        break;
                                    case 2:
                                        this.page_friend.close();
                                        break;
                                    case 3:
                                        this.page_match.close()
                                }
                                this.page_east_north.close(),
                                    this.page_title.close(),
                                    this.me.out.play(0, !1),
                                    Laya.timer.once(250, this, function () {
                                        e.locking = !1,
                                            e.enable = !1,
                                            t && t.run()
                                    })
                            },
                            c.prototype.setPage = function (t) {
                                var e = this;
                                if (!this.locking && this.nowpage != t) {
                                    switch (this.locking = !0, this.nowpage) {
                                        case 0:
                                            this.page0.onDisable(0);
                                            break;
                                        case 1:
                                            this.page_rank.close(),
                                                this.page_title.close();
                                            break;
                                        case 2:
                                            this.page_friend.close(),
                                                this.page_title.close();
                                            break;
                                        case 3:
                                            this.page_match.close(),
                                                this.page_title.close()
                                    }
                                    this.nowpage = t;
                                    var i = 750;
                                    Laya.timer.once(200, this, function () {
                                        switch (e.nowpage) {
                                            case 0:
                                                e.page0.onEnable(0);
                                                break;
                                            case 1:
                                                e.page_rank.show();
                                                break;
                                            case 2:
                                                e.page_friend.show();
                                                break;
                                            case 3:
                                                e.page_match.show(),
                                                    i = 500
                                        }
                                    }),
                                        Laya.timer.once(i, this, function () {
                                            e.locking = !1
                                        })
                                }
                            },
                            c.prototype.say = function (e) {
                                var i = this,
                                    n = t.UI_Sushe.main_chara_info;
                                this.chat_id++;
                                var a = this.chat_id,
                                    r = view.AudioMgr.PlayCharactorSound(n, e, Laya.Handler.create(this, function () {
                                        Laya.timer.once(1e3, i, function () {
                                            i.chat_id == a && i.stopsay()
                                        })
                                    }));
                                r && (this.chat_block.show(r.words), this.sound_channel = r.sound)
                            },
                            c.prototype.stopsay = function () {
                                this.chat_block.close(!1),
                                    this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null)
                            },
                            c.prototype.bi_trace = function () {
                                0 == app.PlayerBehaviorStatistic.get_val(app.EBehaviorType.XinShouYinDao) && (app.PlayerBehaviorStatistic.update_val(app.EBehaviorType.XinShouYinDao, 2), app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_tutorial_jump, 1), app.PlayerBehaviorStatistic.tw_trace_pending(app.EBehaviorType.TW_Tutorial_Completed, 1)),
                                    app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Purchase, app.PlayerBehaviorStatistic.recharged_count),
                                    app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_tutorial_complete, 1),
                                    app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_Purchase, app.PlayerBehaviorStatistic.recharged_count),
                                    app.PlayerBehaviorStatistic.recharged_count > 0 && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_Purchase_first, 1),
                                    app.PlayerBehaviorStatistic.tw_trace_pending(app.EBehaviorType.TW_Purchase, app.PlayerBehaviorStatistic.recharged_count);
                                var t = 0;
                                switch (GameMgr.Inst.account_data.level.id) {
                                    case 10101:
                                        t = 1;
                                        break;
                                    case 10102:
                                        t = 2;
                                        break;
                                    case 10103:
                                        t = 3;
                                        break;
                                    case 10201:
                                        t = 4;
                                        break;
                                    case 10202:
                                        t = 5;
                                        break;
                                    case 10203:
                                        t = 6;
                                        break;
                                    case 10301:
                                        t = 7;
                                        break;
                                    case 10302:
                                        t = 8;
                                        break;
                                    case 10303:
                                        t = 9;
                                        break;
                                    case 10401:
                                        t = 10;
                                        break;
                                    case 10402:
                                        t = 11;
                                        break;
                                    case 10403:
                                        t = 12;
                                        break;
                                    case 10501:
                                        t = 13;
                                        break;
                                    case 10502:
                                        t = 14;
                                        break;
                                    case 10503:
                                        t = 15;
                                        break;
                                    case 10601:
                                        t = 16
                                }
                                10102 === GameMgr.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_2, 1),
                                    10103 === GameMgr.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_3, 1);
                                for (var e = 0; e < t; e++)
                                    app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_Role_level_1 + e, 1)
                            },
                            c.prototype.pending_lobby_jump = function () {
                                var e = this;
                                if (!this._check_idcard && (this._check_idcard = !0, "chs" == GameMgr.client_type && !t.UI_ShiMingRenZheng.renzhenged))
                                    return t.UI_ShiMingRenZheng.Inst.show(Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })), !0;
                                if ("chs" == GameMgr.client_type && !GameMgr.Inst.account_data.phone)
                                    return t.UI_Bind_Phone1.Inst.show(!0, Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })), !0;
                                if ("chs" == GameMgr.client_type && 1 != GameMgr.Inst.phone_login && !GameMgr.Inst.account_data.email_verify)
                                    return 0 == GameMgr.Inst.sociotype ? t.UI_Bind_Mail1.Inst.show(!0, Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })) : t.UI_Bind_Mail0.Inst.show(!0, Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })), !0;
                                if ("chs_t" == GameMgr.client_type && !GameMgr.Inst.account_data.email_verify && 0 != GameMgr.Inst.sociotype)
                                    return t.UI_Bind_Mail0.Inst.show(!0, Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })), !0;
                                if ("chs" == GameMgr.client_type && !GameMgr.Inst.account_data.birthday)
                                    return t.UI_Agepending_Chs.Inst.show(Laya.Handler.create(this, function () {
                                        e.pending_lobby_jump()
                                    })), !0;
                                if (GameMgr.inDmm && !GameMgr.Inst.account_setting[game.EAccountSetKey.user_xieyi.toString()] && t.UI_User_Xieyi_Dmm.Inst.show(Laya.Handler.create(this, function () {
                                    app.NetAgent.sendReq2Lobby("Lobby", "updateAccountSettings", {
                                        setting: {
                                            key: game.EAccountSetKey.user_xieyi,
                                            value: 1
                                        }
                                    }, function (t, e) { }),
                                        GameMgr.Inst.account_setting[game.EAccountSetKey.user_xieyi.toString()] = 1,
                                        t.UI_User_Xieyi_Dmm.Inst.destroy(),
                                        t.UI_User_Xieyi_Dmm.Inst = null,
                                        e.pending_lobby_jump()
                                })), t.UI_User_Xieyi.Inst) {
                                    if (!GameMgr.Inst.account_setting[game.EAccountSetKey.user_xieyi.toString()])
                                        return t.UI_User_Xieyi.Inst.show(Laya.Handler.create(this, function () {
                                            app.NetAgent.sendReq2Lobby("Lobby", "updateAccountSettings", {
                                                setting: {
                                                    key: game.EAccountSetKey.user_xieyi,
                                                    value: 1
                                                }
                                            }, function (t, e) { }),
                                                GameMgr.Inst.account_setting[game.EAccountSetKey.user_xieyi.toString()] = 1,
                                                t.UI_User_Xieyi.Inst.destroy(),
                                                t.UI_User_Xieyi.Inst = null,
                                                e.pending_lobby_jump()
                                        })), !0;
                                    t.UI_User_Xieyi.Inst.destroy(),
                                        t.UI_User_Xieyi.Inst = null
                                }
                                return !!t.UI_Info.lobbyPopout() || (t.UI_Activity_Sign.Inst && t.UI_Activity_Sign.Inst.need_jump() ? (t.UI_Activity_Sign.Inst.show(), !0) : !!t.UI_Activity.need_popout && (t.UI_Activity.Inst.show(), !0))
                            },
                            c.Inst = null,
                            c.login_helloed = !1,
                            c
                    }
                        (t.UIBase);
                t.UI_Lobby = h
            }
                (uiscript || (uiscript = {}));
            //屏蔽切换角色的网络请求
            !function (t) {
                var e = function (e) {
                    function i() {
                        var t = e.call(this, new ui.lobby.nicknameUI) || this;
                        return t.locking = !1,
                            t.btn_cd = 0,
                            t
                    }
                    return __extends(i, e),
                        i.show = function () {
                            var e = new i;
                            t.UIMgr.Inst.AddLobbyUI(e),
                                Laya.timer.frameOnce(5, this, function () {
                                    e.show()
                                })
                        },
                        i.prototype.onCreate = function () {
                            var e = this;
                            this.root = this.me.getChildByName("root"),
                                this.lb = this.root.getChildByName("lb"),
                                this.input = this.root.getChildByName("txtinput"),
                                this.yes = this.root.getChildByName("yes"),
                                this.no = this.root.getChildByName("no"),
                                this.btn_confirm = this.root.getChildByName("btn_confirm"),
                                this.btn_confirm.clickHandler = Laya.Handler.create(this, this.onBtnConfrim, null, !1),
                                this.root.getChildByName("btn_logout").clickHandler = new Laya.Handler(this, function () {
                                    t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(2718), Laya.Handler.create(e, function () {
                                        app.NetAgent.sendReq2Lobby("Lobby", "logout", {}, function () { }),
                                            Laya.LocalStorage.setItem("_pre_sociotype", ""),
                                            Laya.Browser.window.conch ? Laya.Browser.window.conch && Laya.Browser.window.conch.exit && Laya.Browser.window.conch.exit() : Laya.Browser.window.location.href = GameMgr.Inst.link_url
                                    }))
                                }),
                                this.input.on("focus", this, function () {
                                    e.lb.visible = !1,
                                        e.yes.visible = !1,
                                        e.no.visible = !1
                                }),
                                this.input.on("blur", this, function () {
                                    e.lb.visible = !e.input.text || "" == e.input.text
                                }),
                                this.input.on("input", this, function () {
                                    e.input.text && e.input.text
                                }),
                                this.root_xinshou = this.me.getChildByName("root_xinshou"),
                                this.root_xinshou.getChildByName("btn_no").clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || e.close_course()
                                }, null, !1),
                                this.root_xinshou.getChildByName("btn_yes").clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || (e.enable = !1, t.UI_Rules.Inst.show(1, Laya.Handler.create(e, function () {
                                        e.destroy(),
                                            game.Scene_Lobby.Inst.pending_ui_jump()
                                    })))
                                }, null, !1),
                                this.root.getChildByName("en_no_space").visible = "en" == GameMgr.client_language
                        },
                        i.prototype.show = function () {
                            var e = this;
                            this.enable = !0,
                                this.locking = !0,
                                this.yes.visible = !1,
                                this.no.visible = !1,
                                this.root_xinshou.visible = !1,
                                t.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                    e.locking = !1
                                }))
                        },
                        i.prototype.close_nickname = function () {
                            var e = this;
                            this.locking = !0,
                                t.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                    e.locking = !1,
                                        e.root.visible = !1,
                                        e.enable = !1,
                                        e.destroy(),
                                        t.UI_XinShouYinDao.Inst.show(0, Laya.Handler.create(e, function () {
                                            game.Scene_Lobby.Inst.pending_ui_jump()
                                        }))
                                }))
                        },
                        i.prototype.show_course = function () {
                            var e = this;
                            this.root_xinshou.visible = !0,
                                this.root_xinshou.getChildByName("name").text = this.input.text + " " + game.Tools.strOfLocalization(2150),
                                this.locking = !0,
                                t.UIBase.anim_pop_out(this.root_xinshou, Laya.Handler.create(this, function () {
                                    e.locking = !1
                                }))
                        },
                        i.prototype.close_course = function () {
                            var e = this;
                            this.locking = !0,
                                t.UIBase.anim_pop_hide(this.root_xinshou, Laya.Handler.create(this, function () {
                                    e.locking = !1,
                                        e.enable = !1,
                                        e.destroy(),
                                        game.Scene_Lobby.Inst.pending_ui_jump()
                                }))
                        },
                        i.prototype.have_invalid_char = function (t) {
                            for (var e = 0; e < t.length; e++) {
                                var i = t.charCodeAt(e);
                                if (!(i >= "0".charCodeAt(0) && i <= "9".charCodeAt(0)) && !(i >= "a".charCodeAt(0) && i <= "z".charCodeAt(0) || i >= "A".charCodeAt(0) && i <= "Z".charCodeAt(0) || i >= 11904 && i <= 40959)) {
                                    for (var n = !1, a = 0; a < "~@!#%&()_+={}:;<>".length; a++)
                                        if ("~@!#%&()_+={}:;<>"[a] == t[e]) {
                                            n = !0;
                                            break
                                        }
                                    if (!n)
                                        return !0
                                }
                            }
                            return !1
                        },
                        i.prototype.onBtnConfrim = function () {
                            var e = this;
                            if (!this.locking && "" != this.input.text) {
                                for (var i = this.input.text, n = 0, a = 0, r = 0; r < i.length; r++) {
                                    if (i.charCodeAt(r) > 255) {
                                        if (n + 2 > 14)
                                            break;
                                        n += 2
                                    } else {
                                        if (n + 1 > 14)
                                            break;
                                        n += 1
                                    }
                                    a++
                                }
                                if (a == i.length) {
                                    var s = this.input.text;
                                    if (this.have_invalid_char(s) || app.Taboo.test(s))
                                        this.no.visible = !0;
                                    else if (!(Laya.timer.currTimer < this.btn_cd)) {
                                        this.btn_cd = Laya.timer.currTimer + 700;
                                        var o = {};
                                        o.nickname = s,
                                            GameMgr.Inst._ad_str && (o.advertise_str = GameMgr.Inst._ad_str),
                                            app.NetAgent.sendReq2Lobby("Lobby", "createNickname", o, function (i, n) {
                                                e.btn_cd = 0,
                                                    i || n.error ? t.UIMgr.Inst.showNetReqError("createNickname", i, n) : (app.PlayerBehaviorStatistic.fb_trace_force(app.EBehaviorType.Level_1), GameMgr.Inst.account_data.nickname = s, GameMgr.Inst.fetch_login_info(), GameMgr.inDmm || (GameMgr.Inst.account_setting[game.EAccountSetKey.user_xieyi.toString()] = 1), e.close_nickname())
                                            }),
                                            GameMgr.inDmm || app.NetAgent.sendReq2Lobby("Lobby", "updateAccountSettings", {
                                                setting: {
                                                    key: game.EAccountSetKey.user_xieyi,
                                                    value: 1
                                                }
                                            }, function (t, e) { });
                                        var l = t.UI_Sushe.characters,
                                            h = Math.floor(Math.random() * l.length);
                                        t.UI_Sushe.main_character_id = t.UI_Sushe.characters[h].charid,
                                            //屏蔽切换角色的网络请求（不知道这是怎么触发的，反正屏蔽就对了） ----fxxk
                                            //app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                            //"Lobby",
                                            //"changeMainCharacter",
                                            //{
                                            // character_id: t.UI_Sushe.main_character_id
                                            //}, function (t, e) {}),
                                            GameMgr.Inst.account_data.avatar_id = t.UI_Sushe.characters[h].skin
                                    }
                                } else
                                    t.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(2750))
                            }
                        },
                        i
                }
                    (t.UIBase);
                t.UI_Nickname = e
            }
                (uiscript || (uiscript = {}));
            //读取战绩
            !function (t) {
                var e = function (e) {
                    function i() {
                        var t = e.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.both_ui.otherplayerinfoUI : new ui.both_ui.otherplayerinfo_enUI) || this;
                        return t.account_id = 0,
                            t.origin_x = 0,
                            t.origin_y = 0,
                            t.root = null,
                            t.title = null,
                            t.level = null,
                            t.btn_addfriend = null,
                            t.btn_report = null,
                            t.illust = null,
                            t.name = null,
                            t.detail_data = null,
                            t.locking = !1,
                            t.tab_info4 = null,
                            t.tab_info3 = null,
                            t.tab_note = null,
                            t.tab_img_dark = "",
                            t.tab_img_chosen = "",
                            t.player_data = null,
                            t.tab_index = 1,
                            i.Inst = t,
                            t
                    }
                    return __extends(i, e),
                        i.prototype.onCreate = function () {
                            var e = this;
                            "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tab_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tab_dark.png")) : (this.tab_img_chosen = game.Tools.localUISrc("myres/bothui/info_tabheng_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/bothui/info_tabheng_dark.png")),
                                this.root = this.me.getChildByName("root"),
                                this.origin_x = this.root.x,
                                this.origin_y = this.root.y,
                                this.container_info = this.root.getChildByName("container_info"),
                                this.title = new t.UI_PlayerTitle(this.container_info.getChildByName("title")),
                                this.name = this.container_info.getChildByName("name"),
                                this.level = new t.UI_Level(this.container_info.getChildByName("rank")),
                                this.detail_data = new t.UI_PlayerData(this.container_info.getChildByName("data")),
                                this.illust = new t.UI_Character_Skin(this.root.getChildByName("illust").getChildByName("illust")),
                                this.btn_addfriend = this.container_info.getChildByName("btn_add"),
                                this.btn_addfriend.clickHandler = Laya.Handler.create(this, function () {
                                    e.btn_addfriend.visible = !1,
                                        e.btn_report.x = 343,
                                        app.NetAgent.sendReq2Lobby("Lobby", "applyFriend", {
                                            target_id: e.account_id
                                        }, function (t, e) { })
                                }, null, !1),
                                this.btn_report = this.container_info.getChildByName("btn_report"),
                                this.btn_report.clickHandler = new Laya.Handler(this, function () {
                                    t.UI_Report_Nickname.Inst.show(e.account_id)
                                }),
                                this.root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                    e.close()
                                }, null, !1),
                                this.note = new t.UI_PlayerNote(this.root.getChildByName("container_note"), null),
                                this.tab_info4 = this.root.getChildByName("tab_info4"),
                                this.tab_info4.clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || 1 != e.tab_index && e.changeMJCategory(1)
                                }, null, !1),
                                this.tab_info3 = this.root.getChildByName("tab_info3"),
                                this.tab_info3.clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || 2 != e.tab_index && e.changeMJCategory(2)
                                }, null, !1),
                                this.tab_note = this.root.getChildByName("tab_note"),
                                this.tab_note.clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type && (game.Tools.during_chat_close() ? t.UIMgr.Inst.ShowErrorInfo("功能维护中，祝大家新年快乐") : e.container_info.visible && (e.container_info.visible = !1, e.tab_info4.skin = e.tab_img_dark, e.tab_info3.skin = e.tab_img_dark, e.tab_note.skin = e.tab_img_chosen, e.tab_index = 3, e.note.show()))
                                }, null, !1),
                                this.locking = !1
                        },
                        i.prototype.show = function (e, i) {
                            var n = this;
                            void 0 === i && (i = 1),
                                GameMgr.Inst.BehavioralStatistics(14),
                                this.account_id = e,
                                this.enable = !0,
                                this.locking = !0,
                                this.root.y = 560,
                                this.player_data = null,
                                t.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                    n.locking = !1
                                })),
                                this.detail_data.reset(),
                                app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountStatisticInfo", {
                                    account_id: e
                                }, function (e, i) {
                                    e || i.error ? t.UIMgr.Inst.showNetReqError("fetchAccountStatisticInfo", e, i) : (n.detail_data.setData(i), n.changeMJCategory(n.tab_index))
                                }),
                                this.note.init_data(e),
                                this.refreshBaseInfo(),
                                this.btn_report.visible = e != GameMgr.Inst.account_id,
                                this.tab_index = i,
                                this.container_info.visible = !0,
                                this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                                this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                                this.tab_note.skin = this.tab_img_dark,
                                this.note.close(),
                                this.tab_note.visible = "chs" != GameMgr.client_type && "chs_t" != GameMgr.client_type,
                                this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                        },
                        i.prototype.refreshBaseInfo = function () {
                            var e = this;
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
                                }, function (i, n) {
                                    if (i || n.error)
                                        t.UIMgr.Inst.showNetReqError("fetchAccountInfo", i, n);
                                    else {
                                        var a = n.account;
                                        //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                        if (a.account_id == GameMgr.Inst.account_id) {
                                            a.avatar_id = GameMgr.Inst.account_data.my_character.skin,
                                                a.title = GameMgr.Inst.account_data.title;
                                        }
                                        //end
                                        e.player_data = a,
                                            game.Tools.SetNickname(e.name, a),
                                            e.title.id = game.Tools.titleLocalization(a.account_id, a.title),
                                            e.level.id = a.level.id,
                                            e.level.id = e.player_data[1 == e.tab_index ? "level" : "level3"].id,
                                            e.level.exp = e.player_data[1 == e.tab_index ? "level" : "level3"].score,
                                            e.illust.me.visible = !0,
                                            e.illust.setSkin(a.avatar_id, "waitingroom"),
                                            game.Tools.is_same_zone(GameMgr.Inst.account_id, e.account_id) && e.account_id != GameMgr.Inst.account_id && null == game.FriendMgr.find(e.account_id) ? (e.btn_addfriend.visible = !0, e.btn_report.x = 520) : (e.btn_addfriend.visible = !1, e.btn_report.x = 343),
                                            e.note.sign.setSign(a.signature)
                                    }
                                })
                        },
                        i.prototype.changeMJCategory = function (t) {
                            this.tab_index = t,
                                this.container_info.visible = !0,
                                this.detail_data.changeMJCategory(t),
                                this.tab_info4.skin = 1 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                                this.tab_info3.skin = 2 == this.tab_index ? this.tab_img_chosen : this.tab_img_dark,
                                this.tab_note.skin = this.tab_img_dark,
                                this.note.close(),
                                this.player_data ? (this.level.id = this.player_data[1 == this.tab_index ? "level" : "level3"].id, this.level.exp = this.player_data[1 == this.tab_index ? "level" : "level3"].score) : (this.level.id = 1 == this.tab_index ? 10101 : 20101, this.level.exp = 0)
                        },
                        i.prototype.close = function () {
                            var e = this;
                            this.enable && (this.locking || (this.locking = !0, this.detail_data.close(), t.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                e.locking = !1,
                                    e.enable = !1
                            }))))
                        },
                        i.prototype.onDisable = function () {
                            this.detail_data.close(),
                                this.illust.clear(),
                                Laya.loader.clearTextureRes(this.level.icon.skin)
                        },
                        i.Inst = null,
                        i
                }
                    (t.UIBase);
                t.UI_OtherPlayerInfo = e
            }
                (uiscript || (uiscript = {}));
            //宿舍相关
            !function (t) {
                var e = function () {
                    function e(t, e) {
                        var i = this;
                        this.scale = 1,
                            this.during_move = !1,
                            this.mouse_start_x = 0,
                            this.mouse_start_y = 0,
                            this.me = t,
                            this.container_illust = e,
                            this.illust = this.container_illust.getChildByName("illust"),
                            this.container_move = t.getChildByName("move"),
                            this.container_move.on("mousedown", this, function () {
                                i.during_move = !0,
                                    i.mouse_start_x = i.container_move.mouseX,
                                    i.mouse_start_y = i.container_move.mouseY
                            }),
                            this.container_move.on("mousemove", this, function () {
                                i.during_move && (i.move(i.container_move.mouseX - i.mouse_start_x, i.container_move.mouseY - i.mouse_start_y), i.mouse_start_x = i.container_move.mouseX, i.mouse_start_y = i.container_move.mouseY)
                            }),
                            this.container_move.on("mouseup", this, function () {
                                i.during_move = !1
                            }),
                            this.container_move.on("mouseout", this, function () {
                                i.during_move = !1
                            }),
                            this.btn_big = t.getChildByName("btn_big"),
                            this.btn_big.clickHandler = Laya.Handler.create(this, function () {
                                i.locking || i.bigger()
                            }, null, !1),
                            this.btn_small = t.getChildByName("btn_small"),
                            this.btn_small.clickHandler = Laya.Handler.create(this, function () {
                                i.locking || i.smaller()
                            }, null, !1),
                            this.btn_close = t.getChildByName("btn_close"),
                            this.btn_close.clickHandler = Laya.Handler.create(this, function () {
                                i.locking || i.close()
                            }, null, !1)
                    }
                    return e.prototype.show = function (e) {
                        var n = this;
                        this.locking = !0,
                            this.when_close = e,
                            this.illust_start_x = this.illust.x,
                            this.illust_start_y = this.illust.y,
                            this.illust_center_x = this.illust.x + 984 - 446,
                            this.illust_center_y = this.illust.y + 11 - 84,
                            this.container_illust.getChildByName("container_name").visible = !1,
                            this.container_illust.getChildByName("container_name_en").visible = !1,
                            this.container_illust.getChildByName("btn").visible = !1,
                            i.Inst.stopsay(),
                            this.scale = 1,
                            Laya.Tween.to(this.illust, {
                                x: this.illust_center_x,
                                y: this.illust_center_y
                            }, 200),
                            t.UIBase.anim_pop_out(this.btn_big, null),
                            t.UIBase.anim_pop_out(this.btn_small, null),
                            t.UIBase.anim_pop_out(this.btn_close, null),
                            this.during_move = !1,
                            Laya.timer.once(250, this, function () {
                                n.locking = !1
                            }),
                            this.me.visible = !0
                    },
                        e.prototype.close = function () {
                            var e = this;
                            this.locking = !0,
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? this.container_illust.getChildByName("container_name").visible = !0 : this.container_illust.getChildByName("container_name_en").visible = !0,
                                this.container_illust.getChildByName("btn").visible = !0,
                                Laya.Tween.to(this.illust, {
                                    x: this.illust_start_x,
                                    y: this.illust_start_y,
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200),
                                t.UIBase.anim_pop_hide(this.btn_big, null),
                                t.UIBase.anim_pop_hide(this.btn_small, null),
                                t.UIBase.anim_pop_hide(this.btn_close, null),
                                Laya.timer.once(250, this, function () {
                                    e.locking = !1,
                                        e.me.visible = !1,
                                        e.when_close.run()
                                })
                        },
                        e.prototype.bigger = function () {
                            1.1 * this.scale > 1.5 || (this.scale *= 1.1, Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0))
                        },
                        e.prototype.smaller = function () {
                            this.scale / 1.1 < .5 || (this.scale /= 1.1, Laya.Tween.to(this.illust, {
                                scaleX: this.scale,
                                scaleY: this.scale
                            }, 100, null, null, 0, !0, !0))
                        },
                        e.prototype.move = function (t, e) {
                            var i = this.illust.x + t,
                                n = this.illust.y + e;
                            i < this.illust_center_x - 600 ? i = this.illust_center_x - 600 : i > this.illust_center_x + 600 && (i = this.illust_center_x + 600),
                                n < this.illust_center_y - 1200 ? n = this.illust_center_y - 1200 : n > this.illust_center_y + 800 && (n = this.illust_center_y + 800),
                                this.illust.x = i,
                                this.illust.y = n
                        },
                        e
                }
                    (),
                    i = function (i) {
                        function n() {
                            var t = i.call(this, new ui.lobby.susheUI) || this;
                            return t.contianer_illust = null,
                                t.illust = null,
                                t.container_name = null,
                                t.label_name = null,
                                t.label_cv = null,
                                t.container_page = null,
                                t.container_look_illust = null,
                                t.page_select_character = null,
                                t.page_visit_character = null,
                                t.origin_illust_x = 0,
                                t.chat_id = 0,
                                t.container_chat = null,
                                t._select_index = 0,
                                t.sound_channel = null,
                                t.chat_block = null,
                                t.illust_showing = !0,
                                n.Inst = t,
                                t
                        }
                        return __extends(n, i),
                            n.init = function (e) {
                                var i = this;
                                app.NetAgent.sendReq2Lobby("Lobby", "fetchCharacterInfo", {}, function (n, a) {
                                    if (n || a.error)
                                        t.UIMgr.Inst.showNetReqError("fetchCharacterInfo", n, a);
                                    else {
                                        if (app.Log.log("fetchCharacterInfo: " + JSON.stringify(a)), (a = JSON.parse(JSON.stringify(a))).main_character_id && a.characters) {
                                            //if (i.characters = [], a.characters)
                                            //    for (r = 0; r < a.characters.length; r++)
                                            //        i.characters.push(a.characters[r]);
                                            //if (i.skin_map = {}, a.skins)
                                            //    for (r = 0; r < a.skins.length; r++)
                                            //        i.skin_map[a.skins[r]] = 1;
                                            //i.main_character_id = a.main_character_id
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            i.characters = [];
                                            for (var j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                var id = 200000 + j;
                                                var skin = 400001 + j * 100;
                                                i.characters.push({
                                                    charid: id,
                                                    level: 5,
                                                    exp: 0,
                                                    skin: skin,
                                                    is_upgraded: 1,
                                                    extra_emoji: ["10", "11", "12", "13", "14", "15", "16", "17"]
                                                });
                                            }
                                            let skins = cfg.item_definition.skin['rows_'];
                                            for (let skinitem of skins) {
                                                uiscript.UI_Sushe.add_skin(skinitem['id']);
                                            }
                                            //  console.log(i.skin_map)

                                            (i.main_character_id = setcharacter),
                                                (GameMgr.Inst.account_data.my_charid = setcharacter),
                                                (GameMgr.Inst.account_data.my_character = i.characters[setcharacter - 200001]);
                                            if (setskin) {
                                                (GameMgr.Inst.account_data.my_character.skin = setskin);
                                            }
                                            //end
                                        } else
                                            i.characters = [], i.characters.push({
                                                charid: 200001,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: 400101,
                                                is_upgraded: !1,
                                                extra_emoji: []
                                            }), i.characters.push({
                                                charid: 200002,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: 400201,
                                                is_upgraded: !1,
                                                extra_emoji: []
                                            }), i.skin_map[400101] = 1, i.skin_map[400201] = 1, i.main_character_id = 200001;
                                        if (i.send_gift_count = 0, i.send_gift_limit = 0, a.send_gift_count && (i.send_gift_count = a.send_gift_count), a.send_gift_limit && (i.send_gift_limit = a.send_gift_limit), a.finished_endings)
                                            for (r = 0; r < a.finished_endings.length; r++)
                                                i.finished_endings_map[a.finished_endings[r]] = 1;
                                        if (a.rewarded_endings)
                                            for (var r = 0; r < a.rewarded_endings.length; r++)
                                                i.rewarded_endings_map[a.rewarded_endings[r]] = 1;
                                        e.run()
                                    }
                                }),
                                    app.NetAgent.sendReq2Lobby("Lobby", "fetchAllCommonViews", {}, function (e, n) {
                                        if (e || n.error)
                                            t.UIMgr.Inst.showNetReqError("fetchAllCommonViews", e, n);
                                        else {
                                            i.using_commonview_index = n.use,
                                                i.commonViewList = [[], [], [], [], [], [], [], []];
                                            //var a = n.views;
                                            //if (a)
                                            //    for (var r = 0; r < a.length; r++) {
                                            //        var s = a[r].values;
                                            //        s && (i.commonViewList[a[r].index] = s)
                                            //    }
                                            i.commonViewList[0] = [{
                                                slot: 0,
                                                item_id: setitemlizhibang
                                            }, {
                                                slot: 1,
                                                item_id: setitemhupai
                                            }, {
                                                slot: 2,
                                                item_id: setlizhi
                                            }, {
                                                slot: 10,
                                                item_id: setmingpai
                                            }, {
                                                slot: 3,
                                                item_id: setshou
                                            }, {
                                                slot: 4,
                                                item_id: setmusic
                                            }, {
                                                slot: 5,
                                                item_id: settouxiang
                                            }, {
                                                slot: 6,
                                                item_id: setzhuobu
                                            }, {
                                                slot: 7,
                                                item_id: setpaibei
                                            }, {
                                                slot: 8,
                                                item_id: setbeijing
                                            }
                                            ];
                                            GameMgr.Inst.account_data.title = settitle;
                                            GameMgr.Inst.account_data.avatar_frame = settouxiang;
                                            GameMgr.Inst.load_mjp_view();
                                        }
                                    })
                            },
                            n.on_data_updata = function (e) {
                                if (e.character) {
                                    var i = JSON.parse(JSON.stringify(e.character));
                                    if (i.characters)
                                        for (var n = i.characters, a = 0; a < n.length; a++) {
                                            for (var r = !1, s = 0; s < this.characters.length; s++)
                                                if (this.characters[s].charid == n[a].charid) {
                                                    this.characters[s] = n[a],
                                                        t.UI_Sushe_Visit.Inst && t.UI_Sushe_Visit.Inst.chara_info && t.UI_Sushe_Visit.Inst.chara_info.charid == this.characters[s].charid && (t.UI_Sushe_Visit.Inst.chara_info = this.characters[s]),
                                                        r = !0;
                                                    break
                                                }
                                            r || this.characters.push(n[a])
                                        }
                                    if (i.skins) {
                                        for (var o = i.skins, a = 0; a < o.length; a++)
                                            this.skin_map[o[a]] = 1;
                                        t.UI_Bag.Inst.on_skin_change()
                                    }
                                    if (i.finished_endings) {
                                        for (var l = i.finished_endings, a = 0; a < l.length; a++)
                                            this.finished_endings_map[l[a]] = 1;
                                        t.UI_Sushe_Visit.Inst
                                    }
                                    if (i.rewarded_endings) {
                                        for (var l = i.rewarded_endings, a = 0; a < l.length; a++)
                                            this.rewarded_endings_map[l[a]] = 1;
                                        t.UI_Sushe_Visit.Inst
                                    }
                                }
                            },
                            n.chara_owned = function (t) {
                                for (var e = 0; e < this.characters.length; e++)
                                    if (this.characters[e].charid == t)
                                        return !0;
                                return !1
                            },
                            n.skin_owned = function (t) {
                                return this.skin_map.hasOwnProperty(t.toString())
                            },
                            n.add_skin = function (t) {
                                this.skin_map[t] = 1
                            },
                            Object.defineProperty(n, "main_chara_info", {
                                get: function () {
                                    for (var t = 0; t < this.characters.length; t++)
                                        if (this.characters[t].charid == this.main_character_id)
                                            return this.characters[t];
                                    return null
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            n.on_view_remove = function (t) {
                                for (var e = 0; e < this.commonViewList.length; e++)
                                    for (var i = this.commonViewList[e], n = 0; n < i.length; n++)
                                        if (i[n].item_id == t) {
                                            i[n].item_id = game.GameUtility.get_view_default_item_id(i[n].slot);
                                            break
                                        }
                                cfg.item_definition.item.get(t).type == game.EView.head_frame && GameMgr.Inst.account_data.avatar_frame == t && (GameMgr.Inst.account_data.avatar_frame = game.GameUtility.get_view_default_item_id(game.EView.head_frame))
                            },
                            n.add_finish_ending = function (t) {
                                this.finished_endings_map[t] = 1
                            },
                            n.add_reward_ending = function (t) {
                                this.rewarded_endings_map[t] = 1
                            },
                            n.check_all_char_repoint = function () {
                                for (var t = 0; t < n.characters.length; t++)
                                    if (this.check_char_redpoint(n.characters[t]))
                                        return !0;
                                return !1
                            },
                            n.check_char_redpoint = function (t) {
                                var e = cfg.spot.spot.getGroup(t.charid);
                                if (e)
                                    for (var i = 0; i < e.length; i++) {
                                        var a = e[i];
                                        if (!(a.is_married && !t.is_upgraded || !a.is_married && t.level < a.level_limit) && 2 == a.type) {
                                            for (var r = !0, s = 0; s < a.jieju.length; s++)
                                                if (a.jieju[s] && n.finished_endings_map[a.jieju[s]]) {
                                                    if (!n.rewarded_endings_map[a.jieju[s]])
                                                        return !0;
                                                    r = !1
                                                }
                                            if (r)
                                                return !0
                                        }
                                    }
                                return !1
                            },
                            Object.defineProperty(n.prototype, "select_index", {
                                get: function () {
                                    return this._select_index
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            n.prototype.onCreate = function () {
                                var i = this;
                                this.contianer_illust = this.me.getChildByName("illust"),
                                    this.illust = new t.UI_Character_Skin(this.contianer_illust.getChildByName("illust").getChildByName("illust")),
                                    this.container_chat = this.contianer_illust.getChildByName("chat"),
                                    this.chat_block = new t.UI_Character_Chat(this.container_chat),
                                    this.contianer_illust.getChildByName("btn").clickHandler = Laya.Handler.create(this, function () {
                                        if (!i.page_visit_character.me.visible || !i.page_visit_character.cannot_click_say)
                                            if (i.sound_channel)
                                                i.stopsay();
                                            else {
                                                if (!i.illust_showing)
                                                    return;
                                                i.say("lobby_normal")
                                            }
                                    }, null, !1),
                                    this.container_name = null,
                                    "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.container_name = this.contianer_illust.getChildByName("container_name"), this.contianer_illust.getChildByName("container_name_en").visible = !1) : (this.container_name = this.contianer_illust.getChildByName("container_name_en"), this.contianer_illust.getChildByName("container_name").visible = !1),
                                    this.label_name = this.container_name.getChildByName("label_name"),
                                    this.label_cv = this.container_name.getChildByName("label_CV"),
                                    this.origin_illust_x = this.contianer_illust.x,
                                    this.container_page = this.me.getChildByName("container_page"),
                                    this.page_select_character = new t.UI_Sushe_Select,
                                    this.container_page.addChild(this.page_select_character.me),
                                    this.page_visit_character = new t.UI_Sushe_Visit,
                                    this.container_page.addChild(this.page_visit_character.me),
                                    this.container_look_illust = new e(this.me.getChildByName("look_illust"), this.contianer_illust)
                            },
                            n.prototype.show = function (t) {
                                GameMgr.Inst.BehavioralStatistics(15),
                                    game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                    this.enable = !0,
                                    this.page_visit_character.me.visible = !1,
                                    this.container_look_illust.me.visible = !1;
                                for (var e = 0, i = 0; i < n.characters.length; i++)
                                    if (n.characters[i].charid == n.main_character_id) {
                                        e = i;
                                        break
                                    }
                                0 == t ? (this.change_select(e), this.show_page_select()) : (this._select_index = -1, this.illust_showing = !1, this.contianer_illust.visible = !1, this.page_select_character.show(1))
                            },
                            n.prototype.starup_back = function () {
                                this.enable = !0,
                                    this.change_select(this._select_index),
                                    this.page_visit_character.show(n.characters[this._select_index], 0),
                                    this.page_visit_character.show_levelup()
                            },
                            n.prototype.spot_back = function () {
                                this.enable = !0,
                                    this.change_select(this._select_index),
                                    this.page_visit_character.show(n.characters[this._select_index], 2)
                            },
                            n.prototype.go2Lobby = function () {
                                this.close(Laya.Handler.create(this, function () {
                                    t.UIMgr.Inst.showLobby()
                                }))
                            },
                            n.prototype.close = function (e) {
                                var i = this;
                                this.illust_showing && t.UIBase.anim_alpha_out(this.contianer_illust, {
                                    x: -30
                                }, 150, 0),
                                    Laya.timer.once(150, this, function () {
                                        i.enable = !1,
                                            e && e.run()
                                    })
                            },
                            n.prototype.onDisable = function () {
                                this.illust.clear(),
                                    this.stopsay(),
                                    this.container_look_illust.me.visible && this.container_look_illust.close()
                            },
                            n.prototype.hide_illust = function () {
                                var e = this;
                                this.illust_showing && (this.illust_showing = !1, t.UIBase.anim_alpha_out(this.contianer_illust, {
                                    x: -30
                                }, 200, 0, Laya.Handler.create(this, function () {
                                    e.contianer_illust.visible = !1
                                })))
                            },
                            n.prototype.open_illust = function () {
                                if (!this.illust_showing)
                                    if (this.illust_showing = !0, this._select_index >= 0)
                                        this.contianer_illust.visible = !0, this.contianer_illust.alpha = 1, t.UIBase.anim_alpha_in(this.contianer_illust, {
                                            x: -30
                                        }, 200);
                                    else {
                                        for (var e = 0, i = 0; i < n.characters.length; i++)
                                            if (n.characters[i].charid == n.main_character_id) {
                                                e = i;
                                                break
                                            }
                                        this.change_select(e)
                                    }
                            },
                            n.prototype.show_page_select = function () {
                                this.page_select_character.show(0)
                            },
                            n.prototype.show_page_visit = function (t) {
                                void 0 === t && (t = 0),
                                    this.page_visit_character.show(n.characters[this._select_index], t)
                            },
                            n.prototype.change_select = function (e) {
                                //把chartid和skin写入cookie
                                var d = new Date();
                                d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
                                var expires = "expires=" + d.toGMTString();
                                document.cookie = "charid" + "=" + n.characters[e].charid + "; " + expires;
                                document.cookie = "skin" + "=" + n.characters[e].skin + "; " + expires;
                                console.log("[雀魂mod改]cookie:" + document.cookie);
                                // End
                                this._select_index = e,
                                    this.illust.clear(),
                                    this.illust_showing = !0;
                                var i = n.characters[e];
                                this.label_name.text = cfg.item_definition.character.get(i.charid)["name_" + GameMgr.client_language],
                                    "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? this.label_cv.text = "CV" + cfg.item_definition.character.get(i.charid)["desc_cv_" + GameMgr.client_language] : this.label_cv.text = "CV:" + cfg.item_definition.character.get(i.charid)["desc_cv_" + GameMgr.client_language],
                                    this.illust.setSkin(i.skin, "full"),
                                    this.contianer_illust.visible = !0,
                                    Laya.Tween.clearAll(this.contianer_illust),
                                    this.contianer_illust.x = this.origin_illust_x,
                                    this.contianer_illust.alpha = 1,
                                    t.UIBase.anim_alpha_in(this.contianer_illust, {
                                        x: -30
                                    }, 230),
                                    this.stopsay()
                            },
                            n.prototype.onChangeSkin = function (t) {
                                n.characters[this._select_index].skin = t,
                                    this.change_select(this._select_index),
                                    n.characters[this._select_index].charid == n.main_character_id && (GameMgr.Inst.account_data.avatar_id = t),
                                    app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                        character_id: n.characters[this._select_index].charid,
                                        skin: t
                                    }, function (t, e) { })
                            },
                            n.prototype.say = function (t) {
                                var e = this,
                                    i = n.characters[this._select_index];
                                this.chat_id++;
                                var a = this.chat_id,
                                    r = view.AudioMgr.PlayCharactorSound(i, t, Laya.Handler.create(this, function () {
                                        Laya.timer.once(1e3, e, function () {
                                            a == e.chat_id && e.stopsay()
                                        })
                                    }));
                                r && (this.chat_block.show(r.words), this.sound_channel = r.sound)
                            },
                            n.prototype.stopsay = function () {
                                this.chat_block.close(!1),
                                    this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null)
                            },
                            n.prototype.to_look_illust = function () {
                                var t = this;
                                this.container_look_illust.show(Laya.Handler.create(this, function () {
                                    t.page_select_character.show(0)
                                }))
                            },
                            n.characters = [],
                            n.skin_map = {},
                            n.main_character_id = 0,
                            n.send_gift_count = 0,
                            n.send_gift_limit = 0,
                            n.commonViewList = [],
                            n.using_commonview_index = 0,
                            n.finished_endings_map = {},
                            n.rewarded_endings_map = {},
                            n.Inst = null,
                            n
                    }
                        (t.UIBase);
                t.UI_Sushe = i
            }
                (uiscript || (uiscript = {}));
            //屏蔽改变宿舍角色的网络请求
            !function (t) {
                var e = function () {
                    function e(e) {
                        var n = this;
                        this.scrollview = null,
                            this.select_index = 0,
                            this.me = e,
                            this.me.getChildByName("btn_visit").clickHandler = Laya.Handler.create(this, function () {
                                i.Inst.locking || i.Inst.close(Laya.Handler.create(n, function () {
                                    t.UI_Sushe.Inst.show_page_visit()
                                }))
                            }, null, !1),
                            this.me.getChildByName("btn_look").clickHandler = Laya.Handler.create(this, function () {
                                i.Inst.locking || i.Inst.close(Laya.Handler.create(n, function () {
                                    t.UI_Sushe.Inst.to_look_illust()
                                }))
                            }, null, !1),
                            this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3)
                    }
                    return e.prototype.show = function (e) {
                        this.me.visible = !0,
                            e ? this.me.alpha = 1 : t.UIBase.anim_alpha_in(this.me, {
                                x: 0
                            }, 200, 0),
                            this.select_index = t.UI_Sushe.Inst.select_index,
                            this.scrollview.reset(),
                            this.scrollview.addItem(t.UI_Sushe.characters.length)
                    },
                        e.prototype.render_character_cell = function (e) {
                            var i = this,
                                n = e.index,
                                a = e.container,
                                r = e.cache_data;
                            r.index = n,
                                r.inited || (r.inited = !0, a.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                    i.onClickAtHead(r.index)
                                }), r.skin = new t.UI_Character_Skin(a.getChildByName("btn").getChildByName("head")));
                            var s = a.getChildByName("btn");
                            s.getChildByName("choose").visible = n == this.select_index,
                                s.getChildByName("redpoint").visible = t.UI_Sushe.check_char_redpoint(t.UI_Sushe.characters[n]),
                                r.skin.setSkin(t.UI_Sushe.characters[n].skin, "bighead"),
                                s.getChildByName("using").visible = t.UI_Sushe.characters[n].charid == t.UI_Sushe.main_character_id,
                                s.getChildByName("label_name").text = cfg.item_definition.character.find(t.UI_Sushe.characters[n].charid)["name_" + GameMgr.client_language]
                        },
                        e.prototype.onClickAtHead = function (e) {
                            if (this.select_index == e) {
                                if (t.UI_Sushe.characters[e].charid != t.UI_Sushe.main_character_id)
                                    if (t.UI_PiPeiYuYue.Inst.enable)
                                        t.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(2769));
                                    else {
                                        var i = t.UI_Sushe.main_character_id;
                                        t.UI_Sushe.main_character_id = t.UI_Sushe.characters[e].charid,
                                            // app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                            //    character_id: t.UI_Sushe.main_character_id
                                            // }, function (t, e) {}),
                                            GameMgr.Inst.account_data.my_charid = 200001 + e;
                                        GameMgr.Inst.account_data.my_character = t.UI_Sushe.characters[e];
                                        GameMgr.Inst.account_data.my_character.skin = t.UI_Sushe.characters[e].skin;
                                        GameMgr.Inst.account_data.avatar_id = t.UI_Sushe.characters[e].skin;
                                        for (var n = 0; n < t.UI_Sushe.characters.length; n++)
                                            t.UI_Sushe.characters[n].charid == i && this.scrollview.wantToRefreshItem(n);
                                        this.scrollview.wantToRefreshItem(e)
                                    }
                            } else {
                                var a = this.select_index;
                                this.select_index = e,
                                    this.scrollview.wantToRefreshItem(a),
                                    this.scrollview.wantToRefreshItem(e),
                                    t.UI_Sushe.Inst.change_select(e)
                            }
                        },
                        e.prototype.close = function (e) {
                            var i = this;
                            this.me.visible && (e ? this.me.visible = !1 : t.UIBase.anim_alpha_out(this.me, {
                                x: 0
                            }, 200, 0, Laya.Handler.create(this, function () {
                                i.me.visible = !1
                            })))
                        },
                        e
                }
                    (),
                    i = function (i) {
                        function n() {
                            var t = i.call(this, "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? new ui.lobby.sushe_selectUI : new ui.lobby.sushe_select_enUI) || this;
                            return t.bg_width_head = 988,
                                t.bg_width_zhuangban = 1819,
                                t.bg2_delta = -29,
                                t.container_top = null,
                                t.locking = !1,
                                t.tabs = [],
                                t.tab_index = 0,
                                n.Inst = t,
                                t
                        }
                        return __extends(n, i),
                            n.prototype.onCreate = function () {
                                var i = this;
                                this.container_top = this.me.getChildByName("top"),
                                    this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                        i.locking || (1 == i.tab_index && i.container_zhuangban.changed ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(i, function () {
                                            i.close(),
                                                t.UI_Sushe.Inst.go2Lobby()
                                        }), null) : (i.close(), t.UI_Sushe.Inst.go2Lobby()))
                                    }, null, !1),
                                    this.root = this.me.getChildByName("root"),
                                    this.bg2 = this.root.getChildByName("bg2"),
                                    this.bg = this.root.getChildByName("bg");
                                for (var n = this.root.getChildByName("container_tabs"), a = function (e) {
                                    r.tabs.push(n.getChildAt(e)),
                                        r.tabs[e].clickHandler = new Laya.Handler(r, function () {
                                            i.locking || i.tab_index != e && (1 == i.tab_index && i.container_zhuangban.changed ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(i, function () {
                                                i.change_tab(e)
                                            }), null) : i.change_tab(e))
                                        })
                                }, r = this, s = 0; s < n.numChildren; s++)
                                    a(s);
                                this.container_head = new e(this.root.getChildByName("container_heads")),
                                    this.container_zhuangban = new t.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                        return i.locking
                                    }))
                            },
                            n.prototype.show = function (e) {
                                var i = this;
                                this.enable = !0,
                                    this.locking = !0,
                                    this.tab_index = e,
                                    0 == this.tab_index ? (this.bg.width = this.bg_width_head, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.close(!0), this.container_head.show(!0), t.UIBase.anim_alpha_in(this.container_top, {
                                        y: -30
                                    }, 200), t.UIBase.anim_alpha_in(this.root, {
                                        x: 30
                                    }, 200)) : (this.bg.width = this.bg_width_zhuangban, this.bg2.width = this.bg.width + this.bg2_delta, this.container_zhuangban.show(!0), this.container_head.close(!0), t.UIBase.anim_alpha_in(this.container_top, {
                                        y: -30
                                    }, 200), t.UIBase.anim_alpha_in(this.root, {
                                        y: 30
                                    }, 200)),
                                    Laya.timer.once(200, this, function () {
                                        i.locking = !1
                                    });
                                for (var n = 0; n < this.tabs.length; n++) {
                                    var a = this.tabs[n];
                                    a.skin = game.Tools.localUISrc(n == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                    var r = a.getChildByName("word");
                                    r.color = n == this.tab_index ? "#552c1c" : "#d3a86c",
                                        r.scaleX = r.scaleY = n == this.tab_index ? 1.1 : 1,
                                        n == this.tab_index && a.parent.setChildIndex(a, this.tabs.length - 1)
                                }
                            },
                            n.prototype.change_tab = function (e) {
                                var i = this;
                                this.tab_index = e;
                                for (var n = 0; n < this.tabs.length; n++) {
                                    var a = this.tabs[n];
                                    a.skin = game.Tools.localUISrc(n == e ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                    var r = a.getChildByName("word");
                                    r.color = n == e ? "#552c1c" : "#d3a86c",
                                        r.scaleX = r.scaleY = n == e ? 1.1 : 1,
                                        n == e && a.parent.setChildIndex(a, this.tabs.length - 1)
                                }
                                this.locking = !0,
                                    0 == this.tab_index ? (this.container_zhuangban.close(!1), Laya.Tween.to(this.bg, {
                                        width: this.bg_width_head
                                    }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                        t.UI_Sushe.Inst.open_illust(),
                                            i.container_head.show(!1)
                                    })), Laya.Tween.to(this.bg2, {
                                        width: this.bg_width_head + this.bg2_delta
                                    }, 200, Laya.Ease.strongOut)) : 1 == this.tab_index && (this.container_head.close(!1), t.UI_Sushe.Inst.hide_illust(), Laya.Tween.to(this.bg, {
                                        width: this.bg_width_zhuangban
                                    }, 200, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                                        i.container_zhuangban.show(!1)
                                    })), Laya.Tween.to(this.bg2, {
                                        width: this.bg_width_zhuangban + this.bg2_delta
                                    }, 200, Laya.Ease.strongOut)),
                                    Laya.timer.once(400, this, function () {
                                        i.locking = !1
                                    })
                            },
                            n.prototype.close = function (e) {
                                var i = this;
                                this.locking = !0,
                                    t.UIBase.anim_alpha_out(this.container_top, {
                                        y: -30
                                    }, 150),
                                    0 == this.tab_index ? t.UIBase.anim_alpha_out(this.root, {
                                        x: 30
                                    }, 150, 0, Laya.Handler.create(this, function () {
                                        i.container_head.close(!0)
                                    })) : t.UIBase.anim_alpha_out(this.root, {
                                        y: 30
                                    }, 150, 0, Laya.Handler.create(this, function () {
                                        i.container_zhuangban.close(!0)
                                    })),
                                    Laya.timer.once(150, this, function () {
                                        i.locking = !1,
                                            i.enable = !1,
                                            e && e.run()
                                    })
                            },
                            n.prototype.onDisable = function () {
                                for (var e = 0; e < t.UI_Sushe.characters.length; e++) {
                                    var i = t.UI_Sushe.characters[e].skin,
                                        n = cfg.item_definition.skin.get(i);
                                    n && Laya.loader.clearTextureRes(game.LoadMgr.getResImageSkin(n.path + "/bighead.png"))
                                }
                            },
                            n
                    }
                        (t.UIBase);
                t.UI_Sushe_Select = i
            }
                (uiscript || (uiscript = {}));

            //屏蔽立直道具变更的网络请求，还有皮肤相关
            !function (t) {
                var e = function () {
                    function t(t) {
                        var e = this;
                        this.speed = .001,
                            this.hearts = [],
                            this.heart_masks = [],
                            this.exp_limits = [],
                            this.preframe_time = 0,
                            this.heart_count = 5,
                            this.during_change = !1,
                            this.btn_heart = null,
                            this.label_val = null,
                            this.is_upgraded = !1,
                            this.val_show_starttime = -1,
                            this.me = t,
                            this.container_hearts = this.me.getChildByName("hearts");
                        for (n = 0; n < 5; n++) {
                            var i = this.container_hearts.getChildByName("h" + n);
                            this.hearts.push(i),
                                this.heart_masks.push(i.getChildByName("v").mask)
                        }
                        this.bg_hearts = this.me.getChildByName("bg_hearts"),
                            this.exp_limits = [];
                        for (var n = 0; n < 5; n++)
                            this.exp_limits.push(cfg.level_definition.character.find(n + 1).exp);
                        this.btn_heart = this.me.getChildByName("btn_heart"),
                            this.label_val = this.container_hearts.getChildByName("heartval"),
                            this.btn_heart.clickHandler = Laya.Handler.create(this, function () {
                                e.is_upgraded || (e.label_val.visible ? e.label_val.visible = !1 : (e.label_val.visible = !0, e.val_show_starttime = Laya.timer.currTimer))
                            }, null, !1)
                    }
                    return t.prototype.show = function (t) {
                        Laya.timer.clearAll(this),
                            t.is_upgraded ? this.bg_hearts.skin = game.Tools.localUISrc("myres/sushe/heart_full.png") : this.bg_hearts.skin = game.Tools.localUISrc("myres/sushe/heart_normal.png"),
                            this.current_level = t.level,
                            this.current_exp_rate = t.exp / this.exp_limits[this.current_level],
                            this.isupgrad = t.is_upgraded,
                            this.label_val.visible = !1,
                            this.refresh_heart(this.current_level, this.current_exp_rate, t.is_upgraded),
                            this.during_change = !1,
                            this.preframe_time = Laya.timer.currTimer,
                            Laya.timer.frameLoop(1, this, this.update)
                    },
                        t.prototype.update = function () {
                            if (this.label_val.visible) {
                                Laya.timer.currTimer - this.val_show_starttime >= 5e3 && (this.label_val.visible = !1)
                            }
                            var t = Laya.timer.currTimer - this.preframe_time;
                            this.preframe_time = Laya.timer.currTimer,
                                this.during_change && (this.target_level != this.current_level ? (this.during_change = !1, this.current_level = this.target_level, this.current_exp_rate = this.target_exp_rate, this.refresh_heart(this.target_level, this.target_exp_rate, this.isupgrad)) : (this.current_exp_rate += t * this.speed, this.target_exp_rate < this.current_exp_rate ? (this.during_change = !1, this.current_level = this.target_level, this.current_exp_rate = this.target_exp_rate, this.refresh_heart(this.target_level, this.target_exp_rate, this.isupgrad)) : this.refresh_heart(this.target_level, this.current_exp_rate, this.isupgrad)))
                        },
                        t.prototype.refresh_heart = function (t, e, i) {
                            this.is_upgraded = i,
                                this.label_val.text = "";
                            for (var n = 0; n < this.heart_count; n++) {
                                var a = this.heart_masks[n];
                                this.current_level > n ? a.scaleY = 1 : this.current_level == n ? (a.scaleY = .82 * e + .1, this.label_val.x = this.hearts[n].x, this.label_val.text = Math.ceil(e * this.exp_limits[n]).toString() + "/" + this.exp_limits[n].toString()) : a.scaleY = 0,
                                    this.hearts[n].getChildByName("v").getChildByName("h").skin = i ? game.Tools.localUISrc("myres/bothui/heart_gold.png") : game.Tools.localUISrc("myres/bothui/bf_heart.png")
                            }
                        },
                        t.prototype.close = function () {
                            Laya.timer.clearAll(this)
                        },
                        t.prototype.after_give = function (t, e) {
                            var i = this,
                                n = t.exp / this.exp_limits[t.level],
                                a = game.FrontEffect.Inst.create_ui_effect(this.hearts[this.current_level], e ? "scene/effect_heartup_favor.lh" : "scene/effect_heartup.lh", new Laya.Point(0, 0), 1);
                            if (Laya.timer.once(2e3, null, function () {
                                a.destory()
                            }), t.level > this.current_level) {
                                this.target_level = this.current_level,
                                    this.target_exp_rate = 1,
                                    this.during_change = !0;
                                var r = (1 - this.current_exp_rate) / this.speed;
                                Laya.timer.once(r + 200, this, function () {
                                    var t = game.FrontEffect.Inst.create_ui_effect(i.hearts[i.current_level], "scene/effect_heartlevelup.lh", new Laya.Point(0, 0), 1);
                                    Laya.timer.once(2e3, null, function () {
                                        t.destory()
                                    }),
                                        view.AudioMgr.PlayAudio(111)
                                })
                            } else
                                t.level == this.current_level && n > this.current_exp_rate ? (this.target_level = t.level, this.target_exp_rate = n, this.during_change = !0) : Laya.timer.once(500, this, function () {
                                    i.target_level = t.level,
                                        i.target_exp_rate = n,
                                        i.during_change = !0
                                })
                        },
                        t
                }
                    (),
                    i = function () {
                        function e(t, e, i) {
                            var n = this;
                            this.items = [],
                                this.tab_index = 0,
                                this.gift_choose_index = -1,
                                this.content_inshow = !1,
                                this.give_cd = 0,
                                this.sound_channel = null,
                                this.content = t,
                                this.block_exp = i,
                                this.container_tabs = e,
                                this.btn_gift = this.container_tabs.getChildByName("send"),
                                this.btn_gift.clickHandler = Laya.Handler.create(this, function () {
                                    2 != n.tab_index && n.change_tab(2)
                                }, null, !1),
                                this.btn_qiyue = this.container_tabs.getChildByName("sign"),
                                this.btn_qiyue.clickHandler = Laya.Handler.create(this, function () {
                                    1 != n.tab_index && n.change_tab(1)
                                }, null, !1),
                                this.scrollview = this.content.scriptMap["capsui.CScrollView"],
                                this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1), -1, 4),
                                this.container_qiyue = this.content.getChildByName("page_qiyue"),
                                this.container_gift = this.content.getChildByName("page_gift"),
                                this.content.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                    n.change_tab(0)
                                }, null, !1)
                        }
                        return e.prototype.reset = function () {
                            this.content.visible = !1,
                                this.content_inshow = !1,
                                this.tab_index = 0,
                                this.gift_choose_index = -1
                        },
                            e.prototype.show = function (t) {
                                this.reset(),
                                    this.chara_info = t,
                                    this.btn_gift.visible = t.level < 5;
                                var e = cfg.item_definition.character.get(t.charid);
                                this.btn_qiyue.visible = !t.is_upgraded && e.can_marry > 0,
                                    game.Tools.child_align_center(this.container_tabs, [7]),
                                    this.change_tab(0)
                            },
                            e.prototype.change_tab = function (e) {
                                var i = this;
                                if (this.items = [], this.scrollview.reset(), this.container_gift.visible = !1, this.container_qiyue.visible = !1, this.tab_index = e, 1 == e) {
                                    this.btn_qiyue.getChildByName("chosen").visible = !0,
                                        this.btn_qiyue.getChildByName("label").color = "#000000";
                                    for (var n = cfg.item_definition.character.get(this.chara_info.charid).star_5_material.split(","), a = !0, r = 0; r < n.length; r++) {
                                        for (var s = n[r].split("-"), o = s[0].split("|"), l = 0, h = 0, _ = 0; _ < o.length; _++)
                                            l = parseInt(o[_]), h += t.UI_Bag.get_item_count(l);
                                        var u = parseInt(s[1]);
                                        u > h && (a = !1),
                                            this.items.push({
                                                id: l,
                                                need: u,
                                                count: h
                                            })
                                    }
                                    if (this.container_qiyue.visible = !0, this.chara_info.level >= 5) {
                                        this.container_qiyue.getChildByName("nomet").visible = !1;
                                        var d = this.container_qiyue.getChildByName("container_tupo_btn"),
                                            f = d.getChildByName("send");
                                        f.clickHandler = Laya.Handler.create(this, this._tupo, null, !1),
                                            a ? game.Tools.setGrayDisable(f, !1) : game.Tools.setGrayDisable(f, !0),
                                            d.visible = !0
                                    } else
                                        this.container_qiyue.getChildByName("container_tupo_btn").visible = !1, this.container_qiyue.getChildByName("nomet").visible = !0
                                } else
                                    this.btn_qiyue.getChildByName("chosen").visible = !1, this.btn_qiyue.getChildByName("label").color = "#cfcdcc";
                                if (2 == e) {
                                    this.btn_gift.getChildByName("chosen").visible = !0,
                                        this.btn_gift.getChildByName("label").color = "#000000",
                                        this.items = t.UI_Bag.find_items_by_category(t.EItemCategory.gift),
                                        this.container_gift.visible = !0;
                                    this.container_gift.getChildByName("send").clickHandler = Laya.Handler.create(this, this._send_gift, null, !1),
                                        this.gift_choose_index = -1,
                                        this.refresh_gift_bottom_btns()
                                } else
                                    this.btn_gift.getChildByName("chosen").visible = !1, this.btn_gift.getChildByName("label").color = "#cfcdcc", this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null), c.Inst.closechat(!1);
                                this.scrollview.addItem(this.items.length),
                                    1 == e || 2 == e ? this.content_inshow || (this.content_inshow = !0, this.content.visible = !0, Laya.Tween.clearAll(this.content), t.UIBase.anim_alpha_in(this.content, {
                                        y: -50
                                    }, 150, 0, null, Laya.Ease.strongIn)) : this.content_inshow && (this.content_inshow = !1, Laya.Tween.clearAll(this.content), t.UIBase.anim_alpha_out(this.content, {
                                        y: -50
                                    }, 150, 0, Laya.Handler.create(this, function () {
                                        i.content.visible = !1
                                    }), Laya.Ease.strongIn))
                            },
                            e.prototype.render_item = function (t) {
                                var e = t.index,
                                    i = t.container;
                                2 == this.tab_index ? this.render_item_gift(e, i) : 1 == this.tab_index && this.render_item_qiyue(e, i)
                            },
                            e.prototype.render_item_qiyue = function (e, i) {
                                var n = this.items[e],
                                    a = cfg.item_definition.item.get(n.id);
                                i.getChildByName("name").visible = !1;
                                var r = i.getChildByName("counts");
                                r.visible = !0,
                                    r.getChildByName("count_need").text = "/" + n.need.toString();
                                var s = r.getChildByName("count_have");
                                s.text = n.count.toString(),
                                    s.color = n.count >= n.need ? "#00ff00" : "#ff0000",
                                    game.Tools.child_align_center(r);
                                var o = i.getChildByName("btn");
                                o.clickHandler = Laya.Handler.create(this, function () {
                                    t.UI_ItemDetail.Inst.show(n.id, 2)
                                }, null, !1),
                                    o.getChildByName("choosed").visible = !1,
                                    game.LoadMgr.setImgSkin(o.getChildByName("icon"), a.icon),
                                    o.getChildByName("num").visible = !1
                            },
                            e.prototype.render_item_gift = function (e, i) {
                                var n = this,
                                    a = this.items[e].item_id,
                                    r = cfg.item_definition.item.get(a),
                                    s = i.getChildByName("name");
                                s.text = r["name_" + GameMgr.client_language],
                                    s.visible = !0,
                                    i.getChildByName("counts").visible = !1;
                                var o = i.getChildByName("btn"),
                                    l = o.getChildByName("choosed");
                                l.visible = this.gift_choose_index == e,
                                    o.clickHandler = Laya.Handler.create(this, function () {
                                        if (n.gift_choose_index != e) {
                                            var i = n.gift_choose_index;
                                            n.gift_choose_index = e,
                                                l.visible = !0,
                                                i >= 0 && i < n.items.length && n.scrollview.wantToRefreshItem(i),
                                                n.refresh_gift_bottom_btns()
                                        } else
                                            t.UI_ItemDetail.Inst.show(a)
                                    }, null, !1),
                                    game.LoadMgr.setImgSkin(o.getChildByName("icon"), r.icon);
                                var h = o.getChildByName("num");
                                this.items[e].count > 1 ? (h.text = this.items[e].count.toString(), h.visible = !0) : h.visible = !1
                            },
                            e.prototype.refresh_gift_bottom_btns = function () {
                                var e = t.UI_Sushe.send_gift_limit - t.UI_Sushe.send_gift_count;
                                e < 0 && (e = 0),
                                    this.container_gift.getChildByName("count").text = e.toString();
                                var i = this.container_gift.getChildByName("send");
                                game.Tools.setGrayDisable(i, !1),
                                    game.Tools.sprite_align_center([this.container_gift.getChildByName("label_send"), this.container_gift.getChildByName("count")], 450, [10])
                            },
                            e.prototype._tupo = function () {
                                var e = this;
                                if (t.UI_PiPeiYuYue.Inst.enable)
                                    t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null);
                                else {
                                    var i = this.container_qiyue.getChildByName("container_tupo_btn").getChildByName("send");
                                    game.Tools.setGrayDisable(i, !0),
                                        app.NetAgent.sendReq2Lobby("Lobby", "upgradeCharacter", {
                                            character_id: this.chara_info.charid
                                        }, function (n, a) {
                                            n || a.error ? (t.UIMgr.Inst.showNetReqError("upgradeCharacter", n, a), game.Tools.setGrayDisable(i, !1)) : (c.Inst.close(), Laya.timer.once(150, e, function () {
                                                if (e.chara_info.is_upgraded = !0, t.UI_Character_star_up.Inst.show(e.chara_info, Laya.Handler.create(e, function () {
                                                    t.UI_Sushe.Inst.starup_back()
                                                })), a.character) {
                                                    var i = a.character;
                                                    if (i.extra_emoji) {
                                                        e.chara_info.extra_emoji = [];
                                                        for (var n = 0; n < i.extra_emoji.length; n++)
                                                            e.chara_info.extra_emoji.push(i.extra_emoji[n])
                                                    }
                                                }
                                            }))
                                        })
                                }
                            },
                            e.prototype.close_audio = function () {
                                this.sound_channel && (this.sound_channel.stop(), Laya.SoundManager.removeChannel(this.sound_channel), this.sound_channel = null),
                                    c.Inst.closechat(!1)
                            },
                            e.prototype._send_gift = function () {
                                var e = this;
                                if (t.UI_PiPeiYuYue.Inst.enable)
                                    t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(204), null);
                                else if (!(this.gift_choose_index < 0 || this.gift_choose_index >= this.items.length || Laya.timer.currTimer < this.give_cd)) {
                                    var i = this.chara_info.charid,
                                        n = this.items[this.gift_choose_index].item_id;
                                    if (99 != cfg.item_definition.item.get(n).type && t.UI_Sushe.send_gift_limit - t.UI_Sushe.send_gift_count <= 0)
                                        t.UI_Popout.PopOutNoTitle(game.Tools.strOfLocalization(2213), null);
                                    else {
                                        this.give_cd = Laya.timer.currTimer + 1e4;
                                        var a = this.container_gift.getChildByName("send");
                                        game.Tools.setGrayDisable(a, !0),
                                            app.NetAgent.sendReq2Lobby("Lobby", "sendGiftToCharacter", {
                                                character_id: i,
                                                gifts: [{
                                                    item_id: n,
                                                    count: 1
                                                }
                                                ]
                                            }, function (r, s) {
                                                if (r || s.error)
                                                    game.Tools.setGrayDisable(a, !1), e.give_cd = 0, t.UIMgr.Inst.showNetReqError("sendGiftToCharacter", r, s);
                                                else {
                                                    if (app.Log.log("sendGiftToCharacter: " + JSON.stringify(s)), e.chara_info.charid == i) {
                                                        if (2 == e.tab_index)
                                                            for (u = 0; u < e.items.length; u++)
                                                                if (e.items[u].item_id == n) {
                                                                    if (e.items[u].count <= 1) {
                                                                        for (var o = u; o < e.items.length - 1; o++)
                                                                            e.items[o] = e.items[o + 1];
                                                                        e.items.pop(),
                                                                            e.gift_choose_index = -1,
                                                                            e.scrollview.reset(),
                                                                            e.scrollview.addItem(e.items.length)
                                                                    } else
                                                                        e.items[u].count--, e.scrollview.wantToRefreshItem(u);
                                                                    break
                                                                }
                                                        var l = cfg.item_definition.item.get(n).type == cfg.item_definition.character.get(i).favorite;
                                                        if (s.level > e.block_exp.current_level) {
                                                            c.Inst.locking = !0;
                                                            var h = (1 - e.block_exp.current_exp_rate) / e.block_exp.speed;
                                                            e.block_exp.after_give(s, l),
                                                                Laya.timer.once(h + 600, e, function () {
                                                                    e.chara_info.level = s.level,
                                                                        e.chara_info.exp = s.exp,
                                                                        t.UI_Character_star_up.Inst.show(e.chara_info, Laya.Handler.create(e, function () {
                                                                            t.UI_Sushe.Inst.starup_back()
                                                                        })),
                                                                        Laya.timer.once(600, e, function () {
                                                                            c.Inst.close()
                                                                        }),
                                                                        e.give_cd = 0
                                                                });
                                                            for (var _ = function (i) {
                                                                var n = 50 * (i + 1);
                                                                Laya.timer.once(n + h + 600, e, function () {
                                                                    e.sound_channel && (e.sound_channel.volume *= .5),
                                                                        3 == i && (t.UI_Sushe.Inst.stopsay(), c.Inst.closechat(!0))
                                                                })
                                                            }, u = 0; u < 4; u++)
                                                                _(u)
                                                        } else {
                                                            if (e.block_exp.after_give(s, l), e.give_cd = 0, game.Tools.setGrayDisable(a, !1), !e.sound_channel) {
                                                                var d = "";
                                                                d = cfg.item_definition.character.get(i).favorite == cfg.item_definition.item.get(n).type ? "lobby_gift_favor" : "lobby_gift";
                                                                var f = view.AudioMgr.PlayCharactorSound(e.chara_info, d, Laya.Handler.create(e, function () {
                                                                    e.sound_channel = null,
                                                                        c.Inst.closechat(!1)
                                                                }));
                                                                c.Inst.chat(f.words),
                                                                    e.sound_channel = f.sound,
                                                                    t.UI_Sushe.Inst.stopsay()
                                                            }
                                                            e.chara_info.exp = s.exp
                                                        }
                                                    } else {
                                                        for (u = 0; u < t.UI_Sushe.characters.length; u++)
                                                            if (t.UI_Sushe.characters[u].charid == i) {
                                                                t.UI_Sushe.characters[u].level = s.level,
                                                                    t.UI_Sushe.characters[u].exp = s.exp;
                                                                break
                                                            }
                                                        e.give_cd = 0
                                                    }
                                                    99 != cfg.item_definition.item.get(n).type && t.UI_Sushe.send_gift_count++,
                                                        e.refresh_gift_bottom_btns()
                                                }
                                            })
                                    }
                                }
                            },
                            e
                    }
                        (),
                    n = function () {
                        function n(n) {
                            var a = this;
                            this.head = null,
                                this.emos = [],
                                this._scrollbar = null,
                                this._scrollpoint = null,
                                this._drag_scroll = !1,
                                this.me = n,
                                this.me.visible = !1,
                                this.block_exp = new e(n.getChildByName("container_heart")),
                                this.block_gift = new i(n.getChildByName("container_gift"), n.getChildByName("tabs"), this.block_exp),
                                this.container_intro = n.getChildByName("intro"),
                                this.content = this.container_intro.getChildByName("content"),
                                this.content.vScrollBarSkin = "",
                                this.head = new t.UI_Character_Skin(this.container_intro.getChildByName("content").getChildByName("container_head").getChildByName("head"));
                            var r = this.content.getChildByName("container_emj").getChildByName("container").getChildByName("emo_templete");
                            r.visible = !1;
                            for (var s = 0; s < 20; s++)
                                this.emos.push(new t.UI_Character_Emo(r.scriptMap["capsui.UICopy"].getNodeClone())), this.emos[s].me.x = s % 4 * 184, this.emos[s].me.y = 184 * Math.floor(s / 4);
                            this.content.getChildByName("container_emj").height = 652,
                                this.content.getChildByName("container_head").getChildByName("btn_skin").clickHandler = Laya.Handler.create(this, function () {
                                    c.Inst.open_skin(new Laya.Handler(a, a.change_skin))
                                }, null, !1),
                                this._scrollbar = this.container_intro.getChildByName("scrollbar"),
                                this._scrollpoint = this._scrollbar.getChildByName("scrollpoint"),
                                this._scrollbar && (this._scrollbar.on("mousedown", this, function () {
                                    a._drag_scroll = !0;
                                    var t = a._scrollbar.mouseY / a._scrollbar.height;
                                    a.content.vScrollBar.value = a.content.vScrollBar.max * t
                                }), this._scrollbar.on("mousemove", this, function () {
                                    if (a._drag_scroll) {
                                        var t = a._scrollbar.mouseY / a._scrollbar.height;
                                        a.content.vScrollBar.value = a.content.vScrollBar.max * t
                                    }
                                }), this._scrollbar.on("mouseup", this, function () {
                                    a._drag_scroll = !1
                                }), this._scrollbar.on("mouseout", this, function () {
                                    a._drag_scroll = !1
                                }), this.content.vScrollBar.on("change", this, function () {
                                    var t = a.content.vScrollBar.value / a.content.vScrollBar.max;
                                    a._scrollpoint.y = a._scrollbar.height * t
                                }))
                        }
                        return n.prototype.show = function (t) {
                            var e = this.content.getChildByName("container_text"),
                                i = cfg.item_definition.character.get(t.charid);
                            if (e.getChildByName("height").text = i["desc_stature_" + GameMgr.client_language], e.getChildByName("birth").text = i["desc_birth_" + GameMgr.client_language], e.getChildByName("age").text = i["desc_age_" + GameMgr.client_language], e.getChildByName("bloodtype").text = i.desc_bloodtype, e.getChildByName("cv").text = i["desc_cv_" + GameMgr.client_language], e.getChildByName("hobby").text = i["desc_hobby_" + GameMgr.client_language], e.getChildByName("desc").text = i["desc_" + GameMgr.client_language], "en" == GameMgr.client_language) {
                                var n = [new Laya.ColorFilter([.7, 0, 0, 0, 0, 0, .7, 0, 0, 0, 0, 0, .7, 0, 0, 0, 0, 0, 1, 0])];
                                e.getChildByName("height").font = "en_shuhun",
                                    e.getChildByName("height").filters = n,
                                    e.getChildByName("birth").font = "en_shuhun",
                                    e.getChildByName("birth").filters = n,
                                    e.getChildByName("age").font = "en_shuhun",
                                    e.getChildByName("age").filters = n,
                                    e.getChildByName("bloodtype").font = "en_shuhun",
                                    e.getChildByName("bloodtype").filters = n,
                                    e.getChildByName("cv").font = "en_shuhun",
                                    e.getChildByName("cv").filters = n,
                                    e.getChildByName("hobby").font = "en_shuhun",
                                    e.getChildByName("hobby").filters = n,
                                    e.getChildByName("desc").font = "en_shuhun",
                                    e.getChildByName("desc").filters = n
                            }
                            for (o = 0; o < 12; o += 2) {
                                var a = e.getChildAt(o);
                                e.getChildAt(o + 1).x = a.textField.textWidth * a.scaleX + a.x + 10
                            }
                            this.head.setSkin(t.skin, "bighead");
                            this.content.getChildByName("container_emj").y = e.getChildByName("desc").textField.textHeight * e.getChildByName("desc").scaleY + 561 - 194;
                            for (var r = [], s = {}, o = 0; o < 9; o++)
                                r.push({
                                    sub_id: o,
                                    unlock_desc: "",
                                    time_limit: !1,
                                    after_unlock_desc: "",
                                    sort: o
                                }), s[o] = 1;
                            if (t.extra_emoji && t.extra_emoji.length > 0)
                                for (o = 0; o < t.extra_emoji.length; o++)
                                    s[t.extra_emoji[o]] = 1;
                            var l = cfg.character.emoji.getGroup(t.charid);
                            if (l)
                                for (o = 0; o < l.length; o++) {
                                    var h = l[o];
                                    1 == h.unlock_type ? r.push({
                                        sub_id: h.sub_id,
                                        unlock_desc: h["unlock_desc_" + GameMgr.client_language],
                                        time_limit: !1,
                                        after_unlock_desc: "",
                                        sort: h.sub_id
                                    }) : 3 == h.unlock_type ? r.push({
                                        sub_id: h.sub_id,
                                        unlock_desc: h["unlock_desc_" + GameMgr.client_language],
                                        time_limit: !1,
                                        after_unlock_desc: "",
                                        sort: h.sub_id + 1e4
                                    }) : 2 == h.unlock_type && s[h.sub_id] && r.push({
                                        sub_id: h.sub_id,
                                        unlock_desc: h["unlock_desc_" + GameMgr.client_language],
                                        time_limit: !0,
                                        after_unlock_desc: h["after_unlock_desc_" + GameMgr.client_language],
                                        sort: h.sub_id + 5e4
                                    })
                                }
                            r = r.sort(function (t, e) {
                                return t.sort - e.sort
                            }),
                                this.content.getChildByName("container_emj").height = 100 + 184 * Math.ceil(r.length / 4);
                            for (o = 0; o < this.emos.length; o++)
                                if (o >= r.length)
                                    this.emos[o].me.visible = !1;
                                else {
                                    var c = r[o],
                                        _ = c.sub_id;
                                    this.emos[o].me.visible = !0,
                                        this.emos[o].setSkin(t.charid, _),
                                        s.hasOwnProperty(_.toString()) ? (this.emos[o].me.getChildByName("lock").visible = !1, this.emos[o].me.getChildByName("time_limit").visible = c.time_limit, c.after_unlock_desc ? (this.emos[o].me.getChildByName("info").visible = !0, this.emos[o].me.getChildByName("info").getChildByName("info").text = c.after_unlock_desc) : this.emos[o].me.getChildByName("info").visible = !1) : (this.emos[o].me.getChildByName("lock").visible = !0, this.emos[o].me.getChildByName("info").visible = !0, this.emos[o].me.getChildByName("info").getChildByName("info").text = c.unlock_desc, this.emos[o].me.getChildByName("time_limit").visible = c.time_limit)
                                }
                            this.content.refresh(),
                                this._drag_scroll = !1,
                                this.block_exp.show(t),
                                this.block_gift.show(t),
                                this.me.visible = !0
                        },
                            n.prototype.change_skin = function (e) {
                                t.UI_Sushe.Inst.onChangeSkin(e),
                                    this.head.setSkin(e, "bighead")
                            },
                            n.prototype.close = function () {
                                this.me.visible = !1;
                                for (var t = 0; t < this.emos.length; t++)
                                    this.emos[t].clear()
                            },
                            n
                    }
                        (),
                    a = function () {
                        function e(t) {
                            this.sounds = [],
                                this.chara_info = null,
                                this.current_play_index = -1,
                                this.current_soundchannel = null,
                                this.volume_fixed = 0,
                                this.me = t,
                                this.me.visible = !1,
                                this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                                this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1))
                        }
                        return e.prototype.show = function (e) {
                            this.chara_info = e,
                                this.sounds = [];
                            for (var i = cfg.voice.sound.getGroup(cfg.item_definition.character.get(e.charid).sound), n = 0; n < i.length; n++)
                                this.sounds.push(i[n]);
                            this.volume_fixed = cfg.item_definition.character.get(e.charid).sound_volume,
                                this.scrollview.reset(),
                                this.scrollview.addItem(this.sounds.length),
                                this.me.visible = !0,
                                view.AudioMgr.refresh_music_volume(!0),
                                this.current_play_index = -1,
                                t.UI_Sushe.Inst.stopsay()
                        },
                            e.prototype.close = function () {
                                this.me.visible && (this.me.visible = !1, view.AudioMgr.refresh_music_volume(!1), this.current_soundchannel && (this.current_soundchannel.stop(), Laya.SoundManager.removeChannel(this.current_soundchannel), this.current_soundchannel = null, this.current_play_index = -1, c.Inst.closechat(!1)))
                            },
                            e.prototype.render_item = function (t) {
                                var e = this,
                                    i = t.index,
                                    n = t.container,
                                    a = this.sounds[i];
                                n.getChildByName("desc").text = a["name_" + GameMgr.client_language];
                                var r = n.getChildByName("btn_play"),
                                    s = r.getChildByName("img");
                                s.skin = game.Tools.localUISrc(this.current_play_index == i ? "myres/bothui/bf_pause.png" : "myres/bothui/bf_play.png"),
                                    r.clickHandler = Laya.Handler.create(this, function () {
                                        if (e.current_play_index == i)
                                            e.current_soundchannel && (e.current_soundchannel.stop(), Laya.SoundManager.removeChannel(e.current_soundchannel), e.current_soundchannel = null), c.Inst.closechat(!1), s.skin = game.Tools.localUISrc("myres/bothui/bf_play.png"), e.current_play_index = -1;
                                        else {
                                            var t = e.current_play_index;
                                            e.current_play_index = i,
                                                t >= 0 && t < e.sounds.length && e.scrollview.wantToRefreshItem(t),
                                                e.current_soundchannel && (Laya.SoundManager.removeChannel(e.current_soundchannel), e.current_soundchannel.stop(), e.current_soundchannel = null),
                                                s.skin = game.Tools.localUISrc("myres/bothui/bf_pause.png");
                                            var n = Laya.timer.currTimer,
                                                r = Laya.SoundManager.playSound(a.path + view.AudioMgr.suffix, 1, new Laya.Handler(e, function () {
                                                    var t = n + 2e3 - Laya.timer.currTimer;
                                                    t < 0 && (t = 0),
                                                        Laya.timer.once(t, e, function () {
                                                            if (e.current_soundchannel == r) {
                                                                e.current_soundchannel = null;
                                                                var t = e.current_play_index;
                                                                e.current_play_index = -1,
                                                                    t >= 0 && t < e.sounds.length && e.scrollview.wantToRefreshItem(t),
                                                                    c.Inst.closechat(!1)
                                                            }
                                                        })
                                                }));
                                            e.current_soundchannel = r,
                                                view.AudioMgr.getCVmute(e.chara_info.charid) ? e.current_soundchannel.volume = 0 : e.current_soundchannel.volume = e.volume_fixed * view.AudioMgr.getCVvolume(e.chara_info.charid),
                                                view.AudioMgr.yuyinMuted ? e.current_soundchannel.volume = 0 : e.current_soundchannel.volume *= view.AudioMgr.yuyinVolume,
                                                c.Inst.chat(a["words_" + GameMgr.client_language])
                                        }
                                    }, null, !1);
                                var o = n.getChildByName("lock");
                                !this.chara_info.is_upgraded && a.bond_limit ? (o.visible = !0, r.visible = !1, o.getChildByName("info").text = game.Tools.strOfLocalization(3067)) : this.chara_info.level >= a.level_limit ? (o.visible = !1, r.visible = !0) : (o.visible = !0, r.visible = !1, o.getChildByName("info").text = game.Tools.strOfLocalization(2192, [a.level_limit.toString()]))
                            },
                            e
                    }
                        (),
                    r = function () {
                        function e(e, i) {
                            var n = this;
                            this.is_on = !1,
                                this._h = 98,
                                this.item_ending_list = [],
                                this.me = e,
                                this.onChange = i,
                                Laya.timer.frameOnce(6, this, function () {
                                    n.desc = n.me.getChildByName("desc"),
                                        n.arrow = n.me.getChildByName("arrow"),
                                        n.container_lock = n.me.getChildByName("lock"),
                                        n.lock_info = n.container_lock.getChildByName("info"),
                                        n.btn_mv = n.me.getChildByName("btn_mv"),
                                        n.btn_mv.clickHandler = new Laya.Handler(n, function () {
                                            n.d_excel && n.d_excel.content_path && (c.Inst.me.visible = !1, t.UI_Sushe.Inst.enable = !1, t.UI_WaitingRoom.Inst && t.UI_WaitingRoom.Inst.resetData(), GameMgr.Inst.showSpot(n.d_excel.id, n.d_excel.unique_id))
                                        }),
                                        n.container_spot_detail = n.me.getChildByName("spot_detail"),
                                        n.info_spot_detail = n.container_spot_detail.getChildByName("info"),
                                        n.container_rewards = n.me.getChildByName("rewards"),
                                        n.container_spot_detail.visible = !1,
                                        n.container_rewards.visible = !1,
                                        n.btn_show = n.me.getChildByName("btn_show"),
                                        n.btn_show.clickHandler = new Laya.Handler(n, function () {
                                            n.switch_show()
                                        }),
                                        n.item_ending_list = [];
                                    for (var e = 0; e < n.container_rewards.numChildren; e++)
                                        n.item_ending_list.push(new s(n.container_rewards.getChildAt(e)))
                                })
                        }
                        return Object.defineProperty(e.prototype, "h", {
                            get: function () {
                                return this._h
                            },
                            enumerable: !0,
                            configurable: !0
                        }),
                            e.prototype.set_data = function (t, e) {
                                this.d_excel = t,
                                    this.container_rewards.visible = !1,
                                    this.info_spot_detail.text = "",
                                    this.is_on = !1,
                                    this._h = 98,
                                    this.me.height = this.h,
                                    this.desc.text = t["name_" + GameMgr.client_language],
                                    e ? (this.btn_mv.visible = !1, this.btn_show.visible = !1, this.container_lock.visible = !0, this.container_lock.getChildByName("info").text = t["lock_tips_" + GameMgr.client_language], this.arrow.visible = !1) : (this.btn_mv.visible = 2 == t.type, this.btn_show.visible = !0, this.container_lock.visible = !1, this.arrow.visible = !0, this.arrow.rotation = 0)
                            },
                            e.prototype.switch_show = function () {
                                if (this.is_on = !this.is_on, this.is_on)
                                    if (1 == this.d_excel.type)
                                        this.info_spot_detail.text = this.d_excel["content_" + GameMgr.client_language], this.container_spot_detail.visible = !0, this._h = 113 + this.info_spot_detail.textField.textHeight + 10;
                                    else {
                                        this.container_rewards.visible = !0;
                                        for (var t = 0, e = 0; e < this.item_ending_list.length; e++) {
                                            var i = this.item_ending_list[e];
                                            if (e < this.d_excel.jieju.length && this.d_excel.jieju[e]) {
                                                t++,
                                                    i.me.visible = !0,
                                                    i.me.y = 80 * e;
                                                var n = cfg.spot.rewards.get(this.d_excel.jieju[e]);
                                                i.set_data(this.d_excel.id, this.d_excel.unique_id, n)
                                            } else
                                                i.me.visible = !1
                                        }
                                        this._h = 113 + 80 * t + 10
                                    }
                                else
                                    this.container_spot_detail.visible = !1, this.container_rewards.visible = !1, this._h = 98;
                                this.me.height = this.h,
                                    Laya.Tween.to(this.arrow, {
                                        rotation: this.is_on ? 180 : 0
                                    }, 200, Laya.Ease.strongOut, null, 0, !0),
                                    this.onChange && this.onChange.run()
                            },
                            e
                    }
                        (),
                    s = function () {
                        function e(t) {
                            this.itemList = [],
                                this.me = t;
                            for (var e = 0; e < 3; e++)
                                this.itemList.push(t.getChildByName("item" + e));
                            this.btn = t.getChildByName("btn"),
                                this.label = t.getChildByName("desc")
                        }
                        return e.prototype.set_data = function (e, i, n) {
                            var a = this;
                            this.btn.mouseEnabled = !0,
                                this.rewardId = n.id,
                                this.label.text = n["content_" + GameMgr.client_language];
                            for (var r = n.reward.split(","), s = [], o = function (e) {
                                var i = l.itemList[e];
                                if (e < r.length) {
                                    i.visible = !0;
                                    var n = r[e].split("-"),
                                        a = parseInt(n[0]),
                                        o = game.GameUtility.get_item_view(a);
                                    game.LoadMgr.setImgSkin(i.getChildByName("item"), o.icon);
                                    var h = parseInt(n[1]);
                                    i.clickHandler = Laya.Handler.create(l, function () {
                                        t.UI_ItemDetail.Inst.show(a, 0)
                                    }, null, !1);
                                    var c = i.getChildByName("num");
                                    h > 1 ? (c.visible = !0, c.text = h.toString()) : c.visible = !1,
                                        s.push({
                                            id: a,
                                            count: h
                                        })
                                } else
                                    i.visible = !1
                            }, l = this, h = 0; h < 3; h++)
                                o(h);
                            var c = {};
                            c.character_id = e,
                                c.story_id = i,
                                c.ending_id = n.id,
                                this.btn.clickHandler = Laya.Handler.create(this, function () {
                                    a.btn.mouseEnabled = !1,
                                        app.NetAgent.sendReq2Lobby("Lobby", "receiveEndingReward", c, function (e, i) {
                                            a.btn.mouseEnabled = !0,
                                                e || i.error ? t.UIMgr.Inst.showNetReqError("receiveEndingReward", e, i) : (t.UI_Sushe.add_reward_ending(n.id), t.UI_Sushe_Visit.Inst.refresh_redpoint(), a.refresh_state(), game.Tools.showRewards({
                                                    rewards: s
                                                }, null))
                                        })
                                }),
                                this.refresh_state()
                        },
                            e.prototype.refresh_state = function () {
                                if (t.UI_Sushe.rewarded_endings_map[this.rewardId]) {
                                    this.btn.visible = !1,
                                        this.label.color = "#ffc664";
                                    for (e = 0; e < 3; e++) {
                                        (i = this.itemList[e]).getChildByName("getted").visible = !0,
                                            i.getChildByName("shine").visible = !1,
                                            i.getChildByName("bg").gray = !1,
                                            i.getChildByName("item").gray = !1,
                                            i.getChildByName("num").gray = !1
                                    }
                                } else if (t.UI_Sushe.finished_endings_map[this.rewardId]) {
                                    this.btn.visible = !0,
                                        this.label.color = "#ffc664";
                                    for (e = 0; e < 3; e++) {
                                        (i = this.itemList[e]).getChildByName("getted").visible = !1,
                                            i.getChildByName("shine").visible = !0,
                                            i.getChildByName("bg").gray = !1,
                                            i.getChildByName("item").gray = !1,
                                            i.getChildByName("num").gray = !1
                                    }
                                } else {
                                    this.btn.visible = !1,
                                        this.label.color = "#939393";
                                    for (var e = 0; e < 3; e++) {
                                        var i = this.itemList[e];
                                        i.getChildByName("getted").visible = !1,
                                            i.getChildByName("shine").visible = !1,
                                            i.getChildByName("bg").gray = !0,
                                            i.getChildByName("item").gray = !0,
                                            i.getChildByName("num").gray = !0
                                    }
                                }
                            },
                            e
                    }
                        (),
                    o = function () {
                        function t(t) {
                            var e = this;
                            this.cells = [],
                                this.toth = 0,
                                this.me = t,
                                this.content = this.me.getChildByName("content");
                            var i = this.content.getChildByName("templete"),
                                n = 0;
                            cfg.spot.spot.forEachGroup(function (t) {
                                t.length > n && (n = t.length)
                            }),
                                this.cells.push(new r(i, new Laya.Handler(this, function () {
                                    e.onchange()
                                })));
                            for (var a = 1; a < n; a++)
                                this.cells.push(new r(i.scriptMap["capsui.UICopy"].getNodeClone(), new Laya.Handler(this, function () {
                                    e.onchange()
                                })));
                            this.content.vScrollBarSkin = "",
                                this.scrollbar = this.me.getChildByName("scrollbar").scriptMap["capsui.CScrollBar"],
                                this.scrollbar.init(null),
                                this.content.vScrollBar.on("change", this, function () {
                                    e.scrollbar.setVal(e.content.vScrollBar.value / e.content.vScrollBar.max, e.content.height / e.toth)
                                })
                        }
                        return t.prototype.show = function (t) {
                            this.me.visible = !0;
                            for (var e = cfg.spot.spot.getGroup(t.charid), i = 0, n = 0; n < this.cells.length; n++) {
                                var a = this.cells[n];
                                if (n < e.length) {
                                    var r = !1;
                                    r = e[n].is_married ? !t.is_upgraded : t.level < e[n].level_limit,
                                        a.set_data(e[n], r),
                                        a.me.y = i,
                                        i += a.h,
                                        a.me.visible = !0
                                } else
                                    a.me.visible = !1, a.me.y = 0
                            }
                            this.content.refresh(),
                                this.scrollbar.setVal(0, this.me.height / i),
                                this.toth = i
                        },
                            t.prototype.close = function () {
                                this.me.visible && (this.me.visible = !1)
                            },
                            t.prototype.onchange = function () {
                                for (var t = this, e = 0, i = 0; i < this.cells.length && this.cells[i].me.visible; i++) {
                                    var n = this.cells[i];
                                    n.me.y != e && Laya.Tween.to(n.me, {
                                        y: e
                                    }, 200, Laya.Ease.strongOut, null, 0, !0),
                                        e += n.h
                                }
                                this.content.refresh(),
                                    Laya.timer.once(200, this, function () {
                                        t.toth = e,
                                            t.content.refresh(),
                                            t.scrollbar.setVal(t.content.vScrollBar.value / t.content.vScrollBar.max, t.content.height / t.toth)
                                    })
                            },
                            t
                    }
                        (),
                    l = function () {
                        function e(t) {
                            var e = this;
                            this.skins = [],
                                this.me = t,
                                this.root = t.getChildByName("root"),
                                this.root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                    e.close()
                                }, null, !1),
                                this.scrollview = this.root.scriptMap["capsui.CScrollView"],
                                this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1), -1, 3)
                        }
                        return e.prototype.show = function (e, i) {
                            var n = this;
                            this.me.visible = !0,
                                t.UIBase.anim_pop_out(this.root, null),
                                this.chara_info = e,
                                this.when_change = i,
                                this.skins = [];
                            var a = cfg.item_definition.character.get(e.charid);
                            if (this.skins.push(a.init_skin), a.can_marry && this.skins.push(a.full_fetter_skin), a.skin_lib)
                                for (var r = 0; r < a.skin_lib.length; r++)
                                    a.skin_lib[r] && this.skins.push(a.skin_lib[r]);
                            cfg.item_definition.skin.forEach(function (t) {
                                0 != t.type && 1 != t.type && t.character_id == e.charid && n.skins.push(t.id)
                            }),
                                this.scrollview.reset(),
                                this.scrollview.addItem(this.skins.length)
                        },
                            e.prototype.close = function () {
                                var e = this;
                                this.when_change = null,
                                    t.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                        e.me.visible = !1
                                    }))
                            },
                            e.prototype.render_item = function (e) {
                                var i = this,
                                    n = e.index,
                                    a = e.container,
                                    r = e.cache_data,
                                    s = a.getChildByName("btn");
                                r.skin || (r.skin = new t.UI_Character_Skin(s.getChildByName("icon")));
                                a.getChildByName("using").visible = this.skins[n] == this.chara_info.skin;
                                var o = cfg.item_definition.skin.get(this.skins[n]);
                                r.skin.setSkin(this.skins[n], "bighead");
                                var l = s.getChildByName("locked");
                                t.UI_Sushe.skin_owned(this.skins[n]) ? (l.visible = !1, s.clickHandler = Laya.Handler.create(this, function () {
                                    i.skins[n] != i.chara_info.skin && i.when_change && i.when_change.runWith(i.skins[n]),
                                        i.close()
                                }, null, !1)) : (l.visible = !0, l.getChildByName("info").text = o["lock_tips_" + GameMgr.client_language], s.clickHandler = null)
                            },
                            e
                    }
                        (),
                    h = function () {
                        function t(t) {
                            var e = this;
                            this.locking = !1,
                                this.me = t,
                                this.info = this.me.getChildByName("info"),
                                this.me.on("mousedown", this, function () {
                                    e.locking || e.close()
                                })
                        }
                        return t.prototype.show = function (t) {
                            var e = this;
                            this.info.text = t,
                                this.me.height = 120 + this.info.textField.textHeight,
                                this.me.visible = !0,
                                this.locking = !0,
                                this.me.scaleY = 0,
                                Laya.timer.clearAll(this),
                                Laya.Tween.to(this.me, {
                                    scaleY: 1
                                }, 150, null, Laya.Handler.create(this, function () {
                                    e.locking = !1
                                })),
                                Laya.timer.once(3e3, this, function () {
                                    e.close()
                                })
                        },
                            t.prototype.close = function () {
                                var t = this;
                                this.locking = !0,
                                    Laya.timer.clearAll(this),
                                    Laya.Tween.to(this.me, {
                                        scaleY: 0
                                    }, 150, null, Laya.Handler.create(this, function () {
                                        t.locking = !1,
                                            t.me.visible = !1
                                    }))
                            },
                            t
                    }
                        (),
                    c = function (e) {
                        function i() {
                            var t = e.call(this, new ui.lobby.visitUI) || this;
                            return t.tabs = [],
                                t.page_intro = null,
                                t.page_sound = null,
                                t.page_spot = null,
                                t.block_chat = null,
                                t.pop_skin = null,
                                t.locking = !1,
                                t.current_page = -1,
                                t.chara_info = null,
                                t.tab_img_dark = "",
                                t.tab_img_chosen = "",
                                i.Inst = t,
                                t
                        }
                        return __extends(i, e),
                            Object.defineProperty(i.prototype, "cannot_click_say", {
                                get: function () {
                                    return 1 == this.current_page || null != this.page_intro.block_gift.sound_channel
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            i.prototype.onCreate = function () {
                                var e = this;
                                this.container_top = this.me.getChildByName("top"),
                                    this.container_top.getChildByName("btn_back").clickHandler = Laya.Handler.create(this, function () {
                                        e.locking || e.back2select()
                                    }, null, !1),
                                    "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.tab_img_chosen = game.Tools.localUISrc("myres/sushe/bf_chosen.png"), this.tab_img_dark = game.Tools.localUISrc("myres/sushe/bf_unchooesd.png")) : (this.tab_img_chosen = game.Tools.localUISrc("myres/sushe/bf_chosen_en.png"), this.tab_img_dark = game.Tools.localUISrc("myres/sushe/bf_unchooesd_en.png")),
                                    this.container_right = this.me.getChildByName("right");
                                for (var i = function (t) {
                                    "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (r.tabs.push(r.container_right.getChildByName("btn_page" + t)), r.container_right.getChildByName("btn_page" + t + "_en").visible = !1) : (r.container_right.getChildByName("btn_page" + t).visible = !1, r.tabs.push(r.container_right.getChildByName("btn_page" + t + "_en"))),
                                        r.tabs[t].clickHandler = Laya.Handler.create(r, function () {
                                            e.locking || e.current_page != t && e.change_page(t)
                                        }, null, !1)
                                }, r = this, s = 0; s < 3; s++)
                                    i(s);
                                this.page_intro = new n(this.container_right.getChildByName("page_intro")),
                                    this.page_sound = new a(this.container_right.getChildByName("sound")),
                                    this.page_spot = new o(this.container_right.getChildByName("spot")),
                                    this.block_chat = new t.UI_Character_Chat(this.me.getChildByName("chat")),
                                    this.block_chat.me.visible = !1,
                                    this.pop_skin = new l(this.me.getChildByName("pop_skin")),
                                    this.info_levelup = new h(this.me.getChildByName("levelup"))
                            },
                            i.prototype.show = function (e, i) {
                                var n = this;
                                void 0 === i && (i = 0),
                                    this.chara_info = e;
                                for (var a = 0; a < this.tabs.length; a++)
                                    this.tabs[a].skin = this.tab_img_dark;
                                this.page_intro.close(),
                                    this.page_sound.close(),
                                    this.page_spot.close(),
                                    this.current_page = -1,
                                    this.change_page(i),
                                    this.block_chat.me.visible = !1;
                                var r = cfg.spot.spot.getGroup(e.charid);
                                r && r.length > 0 ? (this.tabs[2].visible = !0, this.container_right.getChildByName("line").height = 512, this.refresh_redpoint()) : (this.tabs[2].visible = !1, this.container_right.getChildByName("line").height = 372),
                                    this.pop_skin.me.visible = !1,
                                    this.info_levelup.me.visible = !1,
                                    this.me.visible = !0,
                                    this.locking = !0,
                                    t.UIBase.anim_alpha_in(this.container_top, {
                                        y: -30
                                    }, 150),
                                    t.UIBase.anim_alpha_in(this.container_right, {
                                        x: 30
                                    }, 150),
                                    t.UIBase.anim_alpha_in(this.block_chat.me, {
                                        y: 30
                                    }, 150),
                                    Laya.timer.once(150, this, function () {
                                        n.locking = !1
                                    })
                            },
                            i.prototype.show_levelup = function () {
                                var t = this;
                                Laya.timer.once(150, this, function () {
                                    t.chara_info.is_upgraded ? t.info_levelup.show(game.Tools.strOfLocalization(2196)) : t.info_levelup.show(cfg.level_definition.character.get(t.chara_info.level)["unlock_desc_" + GameMgr.client_language])
                                })
                            },
                            i.prototype.close = function () {
                                var e = this;
                                this.locking = !0,
                                    t.UIBase.anim_alpha_out(this.container_top, {
                                        y: -30
                                    }, 150),
                                    t.UIBase.anim_alpha_out(this.container_right, {
                                        x: 30
                                    }, 150),
                                    t.UIBase.anim_alpha_out(this.block_chat.me, {
                                        y: 30
                                    }, 150),
                                    Laya.timer.once(150, this, function () {
                                        e.locking = !1,
                                            e.me.visible = !1,
                                            e.page_sound.me.visible && e.page_sound.close(),
                                            e.page_spot.me.visible && e.page_spot.close(),
                                            e.page_intro.block_gift.close_audio()
                                    })
                            },
                            i.prototype.spot_close = function () {
                                this.me.visible = !1
                            },
                            i.prototype.spot_return = function () {
                                this.me.visible = !0
                            },
                            i.prototype.back2select = function () {
                                this.close(),
                                    Laya.timer.once(150, this, function () {
                                        t.UI_Sushe.Inst.show_page_select()
                                    })
                            },
                            i.prototype.change_page = function (t) {
                                if (this.current_page >= 0)
                                    switch (this.tabs[this.current_page].skin = this.tab_img_dark, this.current_page) {
                                        case 0:
                                            this.page_intro.close();
                                            break;
                                        case 1:
                                            this.page_sound.close();
                                            break;
                                        case 2:
                                            this.page_spot.close()
                                    }
                                if (this.current_page = t, this.current_page >= 0)
                                    switch (this.tabs[this.current_page].skin = this.tab_img_chosen, this.current_page) {
                                        case 0:
                                            this.page_intro.show(this.chara_info);
                                            break;
                                        case 1:
                                            this.page_sound.show(this.chara_info);
                                            break;
                                        case 2:
                                            this.page_spot.show(this.chara_info)
                                    }
                            },
                            i.prototype.open_skin = function (t) {
                                this.pop_skin.show(this.chara_info, t)
                            },
                            i.prototype.chat = function (t) {
                                this.block_chat.show(t)
                            },
                            i.prototype.closechat = function (t) {
                                this.block_chat.close(t)
                            },
                            i.prototype.refresh_redpoint = function () {
                                this.tabs[2].getChildByName("redpoint").visible = t.UI_Sushe.check_char_redpoint(this.chara_info)
                            },
                            i
                    }
                        (t.UIBase);
                t.UI_Sushe_Visit = c
            }
                (uiscript || (uiscript = {}));
            //友人房
            !function (t) {
                var e = function () {
                    function e(t) {
                        var e = this;
                        this.friends = [],
                            this.sortlist = [],
                            this.me = t,
                            this.me.visible = !1,
                            this.blackbg = t.getChildByName("blackbg"),
                            this.blackbg.clickHandler = Laya.Handler.create(this, function () {
                                e.locking || e.close()
                            }, null, !1),
                            this.root = t.getChildByName("root"),
                            this.scrollview = this.root.scriptMap["capsui.CScrollView"],
                            this.scrollview.init_scrollview(Laya.Handler.create(this, this.render_item, null, !1)),
                            this.noinfo = this.root.getChildByName("noinfo")
                    }
                    return e.prototype.show = function () {
                        var e = this;
                        this.locking = !0,
                            this.me.visible = !0,
                            this.scrollview.reset(),
                            this.friends = [],
                            this.sortlist = [];
                        for (var i = game.FriendMgr.friend_list, n = 0; n < i.length; n++)
                            this.sortlist.push(n);
                        this.sortlist = this.sortlist.sort(function (t, e) {
                            var n = i[t],
                                a = 0;
                            if (n.state.is_online) {
                                a += "" != (o = game.Tools.playState2Desc(n.state.playing)) ? 3e10 : 6e10,
                                    a += -n.state.login_time
                            } else
                                a += n.state.logout_time;
                            var r = i[e],
                                s = 0;
                            if (r.state.is_online) {
                                var o = game.Tools.playState2Desc(r.state.playing);
                                s += "" != o ? 3e10 : 6e10,
                                    s += -r.state.login_time
                            } else
                                s += r.state.logout_time;
                            return s - a
                        });
                        for (n = 0; n < i.length; n++)
                            this.friends.push({
                                f: i[n],
                                invited: !1
                            });
                        this.noinfo.visible = 0 == this.friends.length,
                            this.scrollview.addItem(this.friends.length),
                            t.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                e.locking = !1
                            }))
                    },
                        e.prototype.close = function () {
                            var e = this;
                            this.locking = !0,
                                t.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                    e.locking = !1,
                                        e.me.visible = !1
                                }))
                        },
                        e.prototype.render_item = function (e) {
                            var i = e.index,
                                n = e.container,
                                r = e.cache_data;
                            r.head || (r.head = new t.UI_Head(n.getChildByName("head")), r.name = n.getChildByName("name"), r.state = n.getChildByName("label_state"), r.btn = n.getChildByName("btn_invite"), r.invited = n.getChildByName("invited"));
                            var s = this.friends[this.sortlist[i]];
                            r.head.id = s.f.base.avatar_id,
                                r.head.set_head_frame(s.f.base.account_id, s.f.base.avatar_frame),
                                game.Tools.SetNickname(r.name, s.f.base);
                            var o = !1;
                            if (s.f.state.is_online) {
                                var l = game.Tools.playState2Desc(s.f.state.playing);
                                "" != l ? (r.state.text = game.Tools.strOfLocalization(2069, [l]), r.state.color = "#a9d94d", r.name.color = "#a9d94d") : (r.state.text = game.Tools.strOfLocalization(2071), r.state.color = "#58c4db", r.name.color = "#58c4db", o = !0)
                            } else
                                r.state.text = game.Tools.strOfLocalization(2072), r.state.color = "#8c8c8c", r.name.color = "#8c8c8c";
                            s.invited ? (r.btn.visible = !1, r.invited.visible = !0) : (r.btn.visible = !0, r.invited.visible = !1, game.Tools.setGrayDisable(r.btn, !o), o && (r.btn.clickHandler = Laya.Handler.create(this, function () {
                                game.Tools.setGrayDisable(r.btn, !0);
                                var e = {
                                    room_id: a.Inst.room_id,
                                    mode: a.Inst.room_mode,
                                    nickname: GameMgr.Inst.account_data.nickname,
                                    verified: GameMgr.Inst.account_data.verified,
                                    account_id: GameMgr.Inst.account_id
                                };
                                app.NetAgent.sendReq2Lobby("Lobby", "sendClientMessage", {
                                    target_id: s.f.base.account_id,
                                    type: game.EFriendMsgType.room_invite,
                                    content: JSON.stringify(e)
                                }, function (e, i) {
                                    e || i.error ? (game.Tools.setGrayDisable(r.btn, !1), t.UIMgr.Inst.showNetReqError("sendClientMessage", e, i)) : (r.btn.visible = !1, r.invited.visible = !0, s.invited = !0)
                                })
                            }, null, !1)))
                        },
                        e
                }
                    (),
                    i = function () {
                        function e(e) {
                            var i = this;
                            this.tabs = [],
                                this.tab_index = 0,
                                this.me = e,
                                this.blackmask = this.me.getChildByName("blackmask"),
                                this.root = this.me.getChildByName("root"),
                                this.page_head = new t.zhuangban.Page_Waiting_Head(this.root.getChildByName("container_heads")),
                                this.page_zhangban = new t.zhuangban.Container_Zhuangban(this.root.getChildByName("container_zhuangban0"), this.root.getChildByName("container_zhuangban1"), new Laya.Handler(this, function () {
                                    return i.locking
                                }));
                            for (var n = this.root.getChildByName("container_tabs"), a = function (e) {
                                r.tabs.push(n.getChildAt(e)),
                                    r.tabs[e].clickHandler = new Laya.Handler(r, function () {
                                        i.locking || i.tab_index != e && (1 == i.tab_index && i.page_zhangban.changed ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(i, function () {
                                            i.change_tab(e)
                                        }), null) : i.change_tab(e))
                                    })
                            }, r = this, s = 0; s < n.numChildren; s++)
                                a(s);
                            this.root.getChildByName("btn_close").clickHandler = new Laya.Handler(this, function () {
                                i.locking || (1 == i.tab_index && i.page_zhangban.changed ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(i, function () {
                                    i.close(!1)
                                }), null) : i.close(!1))
                            })
                        }
                        return e.prototype.show = function () {
                            var e = this;
                            this.me.visible = !0,
                                this.blackmask.alpha = 0,
                                this.locking = !0,
                                Laya.Tween.to(this.blackmask, {
                                    alpha: .3
                                }, 150),
                                t.UIBase.anim_pop_out(this.root, Laya.Handler.create(this, function () {
                                    e.locking = !1
                                })),
                                this.tab_index = 0,
                                this.page_zhangban.close(!0),
                                this.page_head.show(!0);
                            for (var i = 0; i < this.tabs.length; i++) {
                                var n = this.tabs[i];
                                n.skin = game.Tools.localUISrc(i == this.tab_index ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                var a = n.getChildByName("word");
                                a.color = i == this.tab_index ? "#552c1c" : "#d3a86c",
                                    a.scaleX = a.scaleY = i == this.tab_index ? 1.1 : 1,
                                    i == this.tab_index && n.parent.setChildIndex(n, this.tabs.length - 1)
                            }
                        },
                            e.prototype.change_tab = function (t) {
                                var e = this;
                                this.tab_index = t;
                                for (var i = 0; i < this.tabs.length; i++) {
                                    var n = this.tabs[i];
                                    n.skin = game.Tools.localUISrc(i == t ? "myres/sushe/btn_shine2.png" : "myres/sushe/btn_dark2.png");
                                    var a = n.getChildByName("word");
                                    a.color = i == t ? "#552c1c" : "#d3a86c",
                                        a.scaleX = a.scaleY = i == t ? 1.1 : 1,
                                        i == t && n.parent.setChildIndex(n, this.tabs.length - 1)
                                }
                                this.locking = !0,
                                    0 == this.tab_index ? (this.page_zhangban.close(!1), Laya.timer.once(200, this, function () {
                                        e.page_head.show(!1)
                                    })) : 1 == this.tab_index && (this.page_head.close(!1), Laya.timer.once(200, this, function () {
                                        e.page_zhangban.show(!1)
                                    })),
                                    Laya.timer.once(400, this, function () {
                                        e.locking = !1
                                    })
                            },
                            e.prototype.close = function (e) {
                                var i = this;
                                //修改友人房间立绘
                                if (i.page_head.choosed_chara_index != 0 && i.page_head.choosed_chara_index != 0) {
                                    for (let id = 0; id < a.Inst.players.length; id++) {
                                        if (a.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                            a.Inst.players[id].avatar_id = i.page_head.choosed_skin_id;
                                            GameMgr.Inst.account_data.my_charid = i.page_head.choosed_chara_index + 200001;
                                            GameMgr.Inst.account_data.my_character = uiscript.UI_Sushe.characters[i.page_head.choosed_chara_index];
                                            GameMgr.Inst.account_data.my_character.skin = i.page_head.choosed_skin_id;
                                            GameMgr.Inst.account_data.avatar_id = i.page_head.choosed_skin_id;
                                            //a.Inst.players[id].character.charid = i.page_head.choosed_chara_index + 200001;
                                            //a.Inst.players[id].character.skin = i.page_head.choosed_skin_id;
                                            a.Inst.refreshAsOwner();
                                            break;
                                        }
                                    }
                                }
                                //end
                                this.me.visible && (e ? (this.page_head.close(!0), this.page_zhangban.close(!0), this.me.visible = !1) : (app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                    ready: a.Inst.owner_id == GameMgr.Inst.account_id,
                                    dressing: !1
                                }, function (t, e) { }), this.locking = !0, this.page_head.close(!1), this.page_zhangban.close(!1), t.UIBase.anim_pop_hide(this.root, Laya.Handler.create(this, function () {
                                    i.locking = !1,
                                        i.me.visible = !1
                                }))))
                            },
                            e
                    }
                        (),
                    n = function () {
                        function t(t) {
                            this.modes = [],
                                this.me = t,
                                this.bg = this.me.getChildByName("bg"),
                                this.scrollview = this.me.scriptMap["capsui.CScrollView"],
                                this.scrollview.init_scrollview(new Laya.Handler(this, this.render_item))
                        }
                        return t.prototype.show = function (t) {
                            this.me.visible = !0,
                                this.scrollview.reset(),
                                this.modes = t,
                                this.scrollview.addItem(t.length);
                            var e = this.scrollview.total_height;
                            e > 380 ? (this.scrollview._content.y = 10, this.bg.height = 400) : (this.scrollview._content.y = 390 - e, this.bg.height = e + 20),
                                this.bg.visible = !0
                        },
                            t.prototype.render_item = function (t) {
                                var e = t.index,
                                    i = t.container.getChildByName("info");
                                i.fontSize = 40,
                                    this.modes[e].length <= 5 ? i.fontSize = 40 : this.modes[e].length <= 9 ? i.fontSize = 55 - 3 * this.modes[e].length : i.fontSize = 28,
                                    i.text = this.modes[e]
                            },
                            t
                    }
                        (),
                    a = function (a) {
                        function r() {
                            var e = a.call(this, new ui.lobby.waitingroomUI) || this;
                            return e.skin_ready = "myres/room/btn_ready.png",
                                e.skin_cancel = "myres/room/btn_cancel.png",
                                e.skin_start = "myres/room/btn_start.png",
                                e.skin_start_no = "myres/room/btn_start_no.png",
                                e.update_seq = 0,
                                e.pre_msgs = [],
                                e.msg_tail = -1,
                                e.posted = !1,
                                e.label_rommid = null,
                                e.player_cells = [],
                                e.btn_ok = null,
                                e.btn_invite_friend = null,
                                e.btn_add_robot = null,
                                e.btn_dress = null,
                                e.beReady = !1,
                                e.room_id = -1,
                                e.owner_id = -1,
                                e.tournament_id = 0,
                                e.max_player_count = 0,
                                e.players = [],
                                e.container_rules = null,
                                e.container_top = null,
                                e.container_right = null,
                                e.locking = !1,
                                e.mousein_copy = !1,
                                e.popout = null,
                                e.room_link = null,
                                e.btn_copy_link = null,
                                e.last_start_room = 0,
                                e.invitefriend = null,
                                e.pre_choose = null,
                                e.ai_name = game.Tools.strOfLocalization(2003),
                                r.Inst = e,
                                app.NetAgent.AddListener2Lobby("NotifyRoomPlayerReady", Laya.Handler.create(e, function (t) {
                                    app.Log.log("NotifyRoomPlayerReady:" + JSON.stringify(t)),
                                        e.onReadyChange(t.account_id, t.ready, t.dressing)
                                })),
                                app.NetAgent.AddListener2Lobby("NotifyRoomPlayerUpdate", Laya.Handler.create(e, function (t) {
                                    app.Log.log("NotifyRoomPlayerUpdate:" + JSON.stringify(t)),
                                        e.onPlayerChange(t)
                                })),
                                app.NetAgent.AddListener2Lobby("NotifyRoomGameStart", Laya.Handler.create(e, function (t) {
                                    e.enable && (app.Log.log("NotifyRoomGameStart:" + JSON.stringify(t)), e.onGameStart(t))
                                })),
                                app.NetAgent.AddListener2Lobby("NotifyRoomKickOut", Laya.Handler.create(e, function (t) {
                                    app.Log.log("NotifyRoomKickOut:" + JSON.stringify(t)),
                                        e.onBeKictOut()
                                })),
                                game.LobbyNetMgr.Inst.add_connect_listener(Laya.Handler.create(e, function () {
                                    e.enable && e.hide(Laya.Handler.create(e, function () {
                                        t.UI_Lobby.Inst.enable = !0
                                    }))
                                }, null, !1)),
                                e
                        }
                        return __extends(r, a),
                            r.prototype.push_msg = function (t) {
                                this.pre_msgs.length < 15 ? this.pre_msgs.push(JSON.parse(t)) : (this.msg_tail = (this.msg_tail + 1) % this.pre_msgs.length, this.pre_msgs[this.msg_tail] = JSON.parse(t))
                            },
                            Object.defineProperty(r.prototype, "inRoom", {
                                get: function () {
                                    return -1 != this.room_id
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            Object.defineProperty(r.prototype, "robot_count", {
                                get: function () {
                                    for (var t = 0, e = 0; e < this.players.length; e++)
                                        2 == this.players[e].category && t++;
                                    return t
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            r.prototype.resetData = function () {
                                this.room_id = -1,
                                    this.owner_id = -1,
                                    this.room_mode = {},
                                    this.max_player_count = 0,
                                    this.players = []
                            },
                            r.prototype.updateData = function (t) {
                                if (t) {
                                    //修改友人房间立绘
                                    for (let i = 0; i < t.persons.length; i++) {
                                        if (t.persons[i].account_id == t.owner_id) {
                                            t.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            t.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            t.persons[i].character = GameMgr.Inst.account_data.my_character;
                                            t.persons[i].title = GameMgr.Inst.account_data.title;
                                            t.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                            break;
                                        }
                                    }
                                    //end
                                    this.room_id = t.room_id,
                                        this.owner_id = t.owner_id,
                                        this.room_mode = t.mode,
                                        this.public_live = t.public_live,
                                        this.tournament_id = 0,
                                        t.tournament_id && (this.tournament_id = t.tournament_id),
                                        this.ai_name = game.Tools.strOfLocalization(2003),
                                        this.room_mode.detail_rule && (1 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2003)), 2 === this.room_mode.detail_rule.ai_level && (this.ai_name = game.Tools.strOfLocalization(2004))),
                                        this.max_player_count = t.max_player_count,
                                        this.players = [];
                                    for (i = 0; i < t.persons.length; i++) {
                                        var e = t.persons[i];
                                        //修改友人房间立绘  -----fxxk
                                        //if (e.account_id == GameMgr.Inst.account_id)
                                        //    e.avatar_id = GameMgr.Inst.account_data.my_character.skin;
                                        //end
                                        (e.ready = !1),
                                            (e.cell_index = -1),
                                            (e.category = 1),
                                            this.players.push(e);
                                    }
                                    for (i = 0; i < t.robot_count; i++)
                                        this.players.push({
                                            //修改友人房间机器人的立绘  -----fxxk
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
                                            //end
                                        });
                                    for (var i = 0; i < t.ready_list.length; i++)
                                        for (var n = 0; n < this.players.length; n++)
                                            if (this.players[n].account_id == t.ready_list[i]) {
                                                this.players[n].ready = !0;
                                                break
                                            }
                                    this.update_seq = 0,
                                        t.seq && (this.update_seq = t.seq)
                                } else
                                    this.resetData()
                            },
                            r.prototype.onReadyChange = function (t, e, i) {
                                for (var n = 0; n < this.players.length; n++)
                                    if (this.players[n].account_id == t) {
                                        this.players[n].ready = e,
                                            this.players[n].dressing = i,
                                            this._onPlayerReadyChange(this.players[n]);
                                        break
                                    }
                                this.refreshStart()
                            },
                            r.prototype.onPlayerChange = function (t) {
                                if (!((t = t.toJSON()).seq && t.seq <= this.update_seq)) {
                                    // 修改友人房间立绘
                                    for (var i = 0; i < t.player_list.length; i++) {
                                        if (t.player_list[i].account_id == t.owner_id) {
                                            t.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            t.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            t.player_list[i].title = GameMgr.Inst.account_data.title;
                                            break;
                                        }
                                    }
                                    if (t.update_list != undefined) {
                                        for (var i = 0; i < t.update_list.length; i++) {
                                            if (t.update_list[i].account_id == t.owner_id) {
                                                t.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                t.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                                t.update_list[i].title = GameMgr.Inst.account_data.title;
                                                break;
                                            }
                                        }
                                    }
                                    for (var i = 0; i < this.players.length; i++) {
                                        if (this.players[i].account_id == t.owner_id) {
                                            this.players[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            this.players[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            this.players[i].title = GameMgr.Inst.account_data.title;
                                            this.players[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                            break;
                                        }
                                    }
                                    //end
                                    this.update_seq = t.seq;
                                    (u = {}).type = "onPlayerChange0",
                                        u.players = this.players,
                                        u.msg = t,
                                        this.push_msg(JSON.stringify(u));
                                    h = this.robot_count;
                                    if ((c = t.robot_count) < this.robot_count) {
                                        this.pre_choose && 2 == this.pre_choose.category && (this.pre_choose.category = 0, this.pre_choose = null, h--);
                                        for (n = 0; n < this.players.length; n++)
                                            2 == this.players[n].category && h > c && (this.players[n].category = 0, h--)
                                    }
                                    for (var e = [], i = t.player_list, n = 0; n < this.players.length; n++)
                                        if (1 == this.players[n].category) {
                                            for (var a = -1, r = 0; r < i.length; r++)
                                                if (i[r].account_id == this.players[n].account_id) {
                                                    a = r;
                                                    break
                                                }
                                            if (-1 != a) {
                                                o = i[a];
                                                e.push(this.players[n]),
                                                    this.players[n].avatar_id = o.avatar_id,
                                                    this.players[n].title = o.title,
                                                    this.players[n].verified = o.verified
                                            }
                                        } else
                                            2 == this.players[n].category && e.push(this.players[n]);
                                    this.players = e;
                                    for (n = 0; n < i.length; n++) {
                                        for (var s = !1, o = i[n], r = 0; r < this.players.length; r++)
                                            if (1 == this.players[r].category && this.players[r].account_id == o.account_id) {
                                                s = !0;
                                                break
                                            }
                                        s || this.players.push({
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
                                    for (var l = [!1, !1, !1, !1], n = 0; n < this.players.length; n++)
                                        - 1 != this.players[n].cell_index && (l[this.players[n].cell_index] = !0, this._refreshPlayerInfo(this.players[n]));
                                    for (n = 0; n < this.players.length; n++)
                                        if (1 == this.players[n].category && -1 == this.players[n].cell_index)
                                            for (r = 0; r < this.max_player_count; r++)
                                                if (!l[r]) {
                                                    this.players[n].cell_index = r,
                                                        l[r] = !0,
                                                        this._refreshPlayerInfo(this.players[n]);
                                                    break
                                                }
                                    for (var h = this.robot_count, c = t.robot_count; h < c;) {
                                        for (var _ = -1, r = 0; r < this.max_player_count; r++)
                                            if (!l[r]) {
                                                _ = r;
                                                break
                                            }
                                        if (-1 == _)
                                            break;
                                        l[_] = !0,
                                            this.players.push({
                                                category: 2,
                                                cell_index: _,
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
                                            h++
                                    }
                                    for (n = 0; n < this.max_player_count; n++)
                                        l[n] || this._clearCell(n);
                                    var u = {};
                                    if (u.type = "onPlayerChange1", u.players = this.players, this.push_msg(JSON.stringify(u)), t.owner_id) {
                                        if (this.owner_id = t.owner_id, this.enable)
                                            if (this.owner_id == GameMgr.Inst.account_id)
                                                this.refreshAsOwner();
                                            else
                                                for (r = 0; r < this.players.length; r++)
                                                    if (this.players[r] && this.players[r].account_id == this.owner_id) {
                                                        this._refreshPlayerInfo(this.players[r]);
                                                        break
                                                    }
                                    } else if (this.enable)
                                        if (this.owner_id == GameMgr.Inst.account_id)
                                            this.refreshAsOwner();
                                        else
                                            for (r = 0; r < this.players.length; r++)
                                                if (this.players[r] && this.players[r].account_id == this.owner_id) {
                                                    this._refreshPlayerInfo(this.players[r]);
                                                    break
                                                }
                                }
                            },
                            r.prototype.onBeKictOut = function () {
                                this.resetData(),
                                    this.enable && (this.enable = !1, this.pop_change_view.close(!1), t.UI_Lobby.Inst.enable = !0, t.UIMgr.Inst.ShowErrorInfo(game.Tools.strOfLocalization(52)))
                            },
                            r.prototype.onCreate = function () {
                                var a = this;
                                this.last_start_room = 0;
                                var r = this.me.getChildByName("root");
                                this.container_top = r.getChildByName("top"),
                                    this.container_right = r.getChildByName("right"),
                                    this.label_rommid = this.container_top.getChildByName("label_roomid");
                                for (var s = function (e) {
                                    var i = r.getChildByName("player_" + e.toString()),
                                        n = {};
                                    n.index = e,
                                        n.container = i,
                                        n.container_flag = i.getChildByName("flag"),
                                        n.container_flag.visible = !1,
                                        n.container_name = i.getChildByName("container_name"),
                                        n.name = i.getChildByName("container_name").getChildByName("name"),
                                        n.btn_t = i.getChildByName("btn_t"),
                                        n.container_illust = i.getChildByName("container_illust"),
                                        n.illust = new t.UI_Character_Skin(i.getChildByName("container_illust").getChildByName("illust")),
                                        n.host = i.getChildByName("host"),
                                        n.title = new t.UI_PlayerTitle(i.getChildByName("container_name").getChildByName("title")),
                                        n.rank = new t.UI_Level(i.getChildByName("container_name").getChildByName("rank")),
                                        n.is_robot = !1;
                                    var s = 0;
                                    n.btn_t.clickHandler = Laya.Handler.create(o, function () {
                                        if (!(a.locking || Laya.timer.currTimer < s)) {
                                            s = Laya.timer.currTimer + 500;
                                            for (var t = 0; t < a.players.length; t++)
                                                if (a.players[t].cell_index == e) {
                                                    a.kickPlayer(t);
                                                    break
                                                }
                                        }
                                    }, null, !1),
                                        n.btn_info = i.getChildByName("btn_info"),
                                        n.btn_info.clickHandler = Laya.Handler.create(o, function () {
                                            if (!a.locking)
                                                for (var i = 0; i < a.players.length; i++)
                                                    if (a.players[i].cell_index == e) {
                                                        a.players[i].account_id && a.players[i].account_id > 0 && t.UI_OtherPlayerInfo.Inst.show(a.players[i].account_id, a.room_mode.mode < 10 ? 1 : 2);
                                                        break
                                                    }
                                        }, null, !1),
                                        o.player_cells.push(n)
                                }, o = this, l = 0; l < 4; l++)
                                    s(l);
                                this.btn_ok = r.getChildByName("btn_ok");
                                var h = 0;
                                this.btn_ok.clickHandler = Laya.Handler.create(this, function () {
                                    Laya.timer.currTimer < h + 500 || (h = Laya.timer.currTimer, a.owner_id == GameMgr.Inst.account_id ? a.getStart() : a.switchReady())
                                }, null, !1);
                                var c = 0;
                                this.container_top.getChildByName("btn_leave").clickHandler = Laya.Handler.create(this, function () {
                                    Laya.timer.currTimer < c + 500 || (c = Laya.timer.currTimer, a.leaveRoom())
                                }, null, !1),
                                    this.btn_invite_friend = this.container_right.getChildByName("btn_friend"),
                                    this.btn_invite_friend.clickHandler = Laya.Handler.create(this, function () {
                                        a.locking || a.invitefriend.show()
                                    }, null, !1),
                                    this.btn_add_robot = this.container_right.getChildByName("btn_robot");
                                var _ = 0;
                                this.btn_add_robot.clickHandler = Laya.Handler.create(this, function () {
                                    a.locking || Laya.timer.currTimer < _ || (_ = Laya.timer.currTimer + 1e3, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                        robot_count: a.robot_count + 1
                                    }, function (e, i) {
                                        (e || i.error && 1111 != i.error.code) && t.UIMgr.Inst.showNetReqError("modifyRoom_add", e, i),
                                            _ = 0
                                    }))
                                }, null, !1),
                                    this.container_right.getChildByName("btn_help").clickHandler = Laya.Handler.create(this, function () {
                                        a.locking || t.UI_Rules.Inst.show()
                                    }, null, !1),
                                    this.btn_dress = this.container_right.getChildByName("btn_view"),
                                    this.btn_dress.clickHandler = new Laya.Handler(this, function () {
                                        a.locking || a.beReady && a.owner_id != GameMgr.Inst.account_id || (a.pop_change_view.show(), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                            ready: a.owner_id == GameMgr.Inst.account_id,
                                            dressing: !0
                                        }, function (t, e) { }))
                                    });
                                var u = this.container_right.getChildByName("btn_copy");
                                u.on("mouseover", this, function () {
                                    a.mousein_copy = !0
                                }),
                                    u.on("mouseout", this, function () {
                                        a.mousein_copy = !1
                                    }),
                                    u.clickHandler = Laya.Handler.create(this, function () {
                                        a.popout.visible || (GameMgr.Inst.BehavioralStatistics(12), a.popout.visible = !0, t.UIBase.anim_pop_out(a.popout, null))
                                    }, null, !1),
                                    this.container_rules = new n(this.container_right.getChildByName("container_rules")),
                                    this.popout = this.me.getChildByName("pop"),
                                    this.room_link = this.popout.getChildByName("input").getChildByName("txtinput"),
                                    this.room_link.editable = !1,
                                    this.btn_copy_link = this.popout.getChildByName("btn_copy"),
                                    this.btn_copy_link.visible = !1,
                                    GameMgr.inConch ? (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                        Laya.PlatformClass.createClass("layaair.majsoul.mjmgr").call("setSysClipboardText", a.room_link.text),
                                            t.UIBase.anim_pop_hide(a.popout, Laya.Handler.create(a, function () {
                                                a.popout.visible = !1
                                            })),
                                            t.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                    }, null, !1)) : GameMgr.iniOSWebview && (this.btn_copy_link.visible = !0, this.btn_copy_link.clickHandler = Laya.Handler.create(this, function () {
                                        Laya.Browser.window.wkbridge.callNative("copy2clip", a.room_link.text, function () { }),
                                            t.UIBase.anim_pop_hide(a.popout, Laya.Handler.create(a, function () {
                                                a.popout.visible = !1
                                            })),
                                            t.UI_FlyTips.ShowTips(game.Tools.strOfLocalization(2125))
                                    }, null, !1)),
                                    this.popout.visible = !1,
                                    this.popout.getChildByName("btn_cancel").clickHandler = Laya.Handler.create(this, function () {
                                        t.UIBase.anim_pop_hide(a.popout, Laya.Handler.create(a, function () {
                                            a.popout.visible = !1
                                        }))
                                    }, null, !1),
                                    this.invitefriend = new e(this.me.getChildByName("invite_friend")),
                                    this.pop_change_view = new i(this.me.getChildByName("pop_view"))
                            },
                            r.prototype.show = function () {
                                var e = this;
                                game.Scene_Lobby.Inst.change_bg("indoor", !1),
                                    this.mousein_copy = !1,
                                    this.beReady = !1,
                                    this.invitefriend.me.visible = !1,
                                    this.btn_add_robot.visible = !1,
                                    this.btn_invite_friend.visible = !1,
                                    game.Tools.setGrayDisable(this.btn_dress, !1),
                                    this.pre_choose = null,
                                    this.pop_change_view.close(!0);
                                for (l = 0; l < 4; l++)
                                    this.player_cells[l].container.visible = l < this.max_player_count;
                                for (l = 0; l < this.max_player_count; l++)
                                    this._clearCell(l);
                                for (l = 0; l < this.players.length; l++)
                                    this.players[l].cell_index = l, this._refreshPlayerInfo(this.players[l]);
                                this.msg_tail = -1,
                                    this.pre_msgs = [],
                                    this.posted = !1;
                                var i = {};
                                i.type = "show",
                                    i.players = this.players,
                                    this.push_msg(JSON.stringify(i)),
                                    this.owner_id == GameMgr.Inst.account_id ? (this.btn_ok.skin = game.Tools.localUISrc(this.skin_start), this.refreshAsOwner()) : (this.btn_ok.skin = game.Tools.localUISrc(this.skin_ready), game.Tools.setGrayDisable(this.btn_ok, !1)),
                                    "en" == GameMgr.client_language ? this.label_rommid.text = "#" + this.room_id.toString() : this.label_rommid.text = this.room_id.toString();
                                var n = [];
                                n.push(game.Tools.room_mode_desc(this.room_mode.mode));
                                var a = this.room_mode.detail_rule;
                                if (a) {
                                    var r = 5,
                                        s = 20;
                                    if (null != a.time_fixed && (r = a.time_fixed), null != a.time_add && (s = a.time_add), n.push(r.toString() + "+" + s.toString() + game.Tools.strOfLocalization(2019)), 0 != this.tournament_id) {
                                        var o = cfg.tournament.tournaments.get(this.tournament_id);
                                        o && n.push(o.name)
                                    }
                                    if (null != a.init_point && n.push(game.Tools.strOfLocalization(2199) + a.init_point), null != a.fandian && n.push(game.Tools.strOfLocalization(2094) + ":" + a.fandian), a.guyi_mode && n.push(game.Tools.strOfLocalization(3028)), null != a.dora_count)
                                        switch (a.dora_count) {
                                            case 0:
                                                n.push(game.Tools.strOfLocalization(2044));
                                                break;
                                            case 2:
                                                n.push(game.Tools.strOfLocalization(2047));
                                                break;
                                            case 3:
                                                n.push(game.Tools.strOfLocalization(2045));
                                                break;
                                            case 4:
                                                n.push(game.Tools.strOfLocalization(2046))
                                        }
                                    null != a.shiduan && 1 != a.shiduan && n.push(game.Tools.strOfLocalization(2137)),
                                        2 === a.fanfu && n.push(game.Tools.strOfLocalization(2763)),
                                        4 === a.fanfu && n.push(game.Tools.strOfLocalization(2764)),
                                        null != a.bianjietishi && 1 != a.bianjietishi && n.push(game.Tools.strOfLocalization(2200)),
                                        this.room_mode.mode >= 10 && this.room_mode.mode <= 14 && (null != a.have_zimosun && 1 != a.have_zimosun ? n.push(game.Tools.strOfLocalization(2202)) : n.push(game.Tools.strOfLocalization(2203)))
                                }
                                this.container_rules.show(n),
                                    this.enable = !0,
                                    this.locking = !0,
                                    t.UIBase.anim_alpha_in(this.container_top, {
                                        y: -30
                                    }, 200);
                                for (var l = 0; l < this.player_cells.length; l++)
                                    t.UIBase.anim_alpha_in(this.player_cells[l].container, {
                                        x: 80
                                    }, 150, 150 + 50 * l, null, Laya.Ease.backOut);
                                t.UIBase.anim_alpha_in(this.btn_ok, {}, 100, 600),
                                    t.UIBase.anim_alpha_in(this.container_right, {
                                        x: 20
                                    }, 100, 500),
                                    Laya.timer.once(600, this, function () {
                                        e.locking = !1
                                    });
                                var h = game.Tools.room_mode_desc(this.room_mode.mode);
                                this.room_link.text = game.Tools.strOfLocalization(2221, [this.room_id.toString()]),
                                    "" != h && (this.room_link.text += "(" + h + ")"),
                                    this.room_link.text += ": " + GameMgr.Inst.link_url + "?room=" + this.room_id
                            },
                            r.prototype.leaveRoom = function () {
                                var e = this;
                                this.locking || app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (i, n) {
                                    i || n.error ? t.UIMgr.Inst.showNetReqError("leaveRoom", i, n) : e.hide(Laya.Handler.create(e, function () {
                                        t.UI_Lobby.Inst.enable = !0
                                    }))
                                })
                            },
                            r.prototype.tryToClose = function (e) {
                                var i = this;
                                app.NetAgent.sendReq2Lobby("Lobby", "leaveRoom", {}, function (n, a) {
                                    n || a.error ? (t.UIMgr.Inst.showNetReqError("leaveRoom", n, a), e.runWith(!1)) : (i.enable = !1, i.pop_change_view.close(!0), e.runWith(!0))
                                })
                            },
                            r.prototype.hide = function (e) {
                                var i = this;
                                this.locking = !0,
                                    t.UIBase.anim_alpha_out(this.container_top, {
                                        y: -30
                                    }, 150);
                                for (var n = 0; n < this.player_cells.length; n++)
                                    t.UIBase.anim_alpha_out(this.player_cells[n].container, {
                                        x: 80
                                    }, 150, 0, null);
                                t.UIBase.anim_alpha_out(this.btn_ok, {}, 150),
                                    t.UIBase.anim_alpha_out(this.container_right, {
                                        x: 20
                                    }, 150),
                                    Laya.timer.once(200, this, function () {
                                        i.locking = !1,
                                            i.enable = !1,
                                            e && e.run()
                                    }),
                                    document.getElementById("layaCanvas").onclick = null
                            },
                            r.prototype.onDisbale = function () {
                                Laya.timer.clearAll(this);
                                for (var t = 0; t < this.player_cells.length; t++)
                                    Laya.loader.clearTextureRes(this.player_cells[t].illust.skin);
                                document.getElementById("layaCanvas").onclick = null
                            },
                            r.prototype.switchReady = function () {
                                this.owner_id != GameMgr.Inst.account_id && (this.beReady = !this.beReady, this.btn_ok.skin = game.Tools.localUISrc(this.beReady ? this.skin_cancel : this.skin_ready), game.Tools.setGrayDisable(this.btn_dress, this.beReady), app.NetAgent.sendReq2Lobby("Lobby", "readyPlay", {
                                    ready: this.beReady,
                                    dressing: !1
                                }, function (t, e) { }))
                            },
                            r.prototype.getStart = function () {
                                this.owner_id == GameMgr.Inst.account_id && (Laya.timer.currTimer < this.last_start_room + 2e3 || (this.last_start_room = Laya.timer.currTimer, app.NetAgent.sendReq2Lobby("Lobby", "startRoom", {}, function (e, i) {
                                    (e || i.error) && t.UIMgr.Inst.showNetReqError("startRoom", e, i)
                                })))
                            },
                            r.prototype.kickPlayer = function (e) {
                                if (this.owner_id == GameMgr.Inst.account_id) {
                                    var i = this.players[e];
                                    1 == i.category ? app.NetAgent.sendReq2Lobby("Lobby", "kickPlayer", {
                                        account_id: this.players[e].account_id
                                    }, function (t, e) { }) : 2 == i.category && (this.pre_choose = i, app.NetAgent.sendReq2Lobby("Lobby", "modifyRoom", {
                                        robot_count: this.robot_count - 1
                                    }, function (e, i) {
                                        (e || i.error) && t.UIMgr.Inst.showNetReqError("modifyRoom_minus", e, i)
                                    }))
                                }
                            },
                            r.prototype._clearCell = function (t) {
                                if (!(t < 0 || t >= this.player_cells.length)) {
                                    var e = this.player_cells[t];
                                    e.container_flag.visible = !1,
                                        e.container_illust.visible = !1,
                                        e.name.visible = !1,
                                        e.container_name.visible = !1,
                                        e.btn_t.visible = !1,
                                        e.host.visible = !1
                                }
                            },
                            r.prototype._refreshPlayerInfo = function (t) {
                                var e = t.cell_index;
                                if (!(e < 0 || e >= this.player_cells.length)) {
                                    var i = this.player_cells[e];
                                    i.container_illust.visible = !0,
                                        i.container_name.visible = !0,
                                        i.name.visible = !0,
                                        game.Tools.SetNickname(i.name, t),
                                        i.btn_t.visible = this.owner_id == GameMgr.Inst.account_id && t.account_id != GameMgr.Inst.account_id,
                                        this.owner_id == t.account_id && (i.container_flag.visible = !0, i.host.visible = !0),
                                        i.illust.setSkin(t.avatar_id, "waitingroom"),
                                        i.title.id = game.Tools.titleLocalization(t.account_id, t.title),
                                        i.rank.id = t[this.room_mode.mode < 10 ? "level" : "level3"].id,
                                        this._onPlayerReadyChange(t)
                                }
                            },
                            r.prototype._onPlayerReadyChange = function (t) {
                                var e = t.cell_index;
                                if (!(e < 0 || e >= this.player_cells.length)) {
                                    var i = this.player_cells[e];
                                    this.owner_id == t.account_id ? i.container_flag.visible = !0 : i.container_flag.visible = t.ready
                                }
                            },
                            r.prototype.refreshAsOwner = function () {
                                if (this.owner_id == GameMgr.Inst.account_id) {
                                    for (var t = 0, e = 0; e < this.players.length; e++)
                                        0 != this.players[e].category && (this._refreshPlayerInfo(this.players[e]), t++);
                                    this.btn_add_robot.visible = !0,
                                        this.btn_invite_friend.visible = !0,
                                        game.Tools.setGrayDisable(this.btn_invite_friend, t == this.max_player_count),
                                        game.Tools.setGrayDisable(this.btn_add_robot, t == this.max_player_count),
                                        this.refreshStart()
                                }
                            },
                            r.prototype.refreshStart = function () {
                                if (this.owner_id == GameMgr.Inst.account_id) {
                                    this.btn_ok.skin = game.Tools.localUISrc(this.skin_start),
                                        game.Tools.setGrayDisable(this.btn_dress, !1);
                                    for (var t = 0, e = 0; e < this.players.length; e++) {
                                        var i = this.players[e];
                                        if (!i || 0 == i.category)
                                            break;
                                        (i.account_id == this.owner_id || i.ready) && t++
                                    }
                                    if (game.Tools.setGrayDisable(this.btn_ok, t != this.max_player_count), this.enable) {
                                        for (var n = 0, e = 0; e < this.max_player_count; e++) {
                                            var a = this.player_cells[e];
                                            a && (a.container_flag.visible && n++)
                                        }
                                        if (t != n && !this.posted) {
                                            this.posted = !0;
                                            var r = {};
                                            r.okcount = t,
                                                r.okcount2 = n,
                                                r.msgs = [];
                                            var s = 0,
                                                o = this.pre_msgs.length - 1;
                                            if (-1 != this.msg_tail && (s = (this.msg_tail + 1) % this.pre_msgs.length, o = this.msg_tail), s >= 0 && o >= 0) {
                                                for (e = s; e != o; e = (e + 1) % this.pre_msgs.length)
                                                    r.msgs.push(this.pre_msgs[e]);
                                                r.msgs.push(this.pre_msgs[o])
                                            }
                                            GameMgr.Inst.postInfo2Server("waitroom_err2", r, !1)
                                        }
                                    }
                                }
                            },
                            r.prototype.onGameStart = function (t) {
                                game.Tools.setGrayDisable(this.btn_ok, !0),
                                    this.enable = !1,
                                    game.MJNetMgr.Inst.OpenConnect(t.connect_token, t.game_uuid, t.location, !1, null)
                            },
                            r.Inst = null,
                            r
                    }
                        (t.UIBase);
                t.UI_WaitingRoom = a
            }
                (uiscript || (uiscript = {}));
            // 保存装扮
            !function (t) {
                !function (e) {
                    var i = function () {
                        function i(i, n, a) {
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
                                this._locking = a,
                                this.container_zhuangban0 = i,
                                this.container_zhuangban1 = n;
                            for (var s = this.container_zhuangban0.getChildByName("tabs"), o = function (e) {
                                var i = s.getChildAt(e);
                                l.tabs.push(i),
                                    i.clickHandler = new Laya.Handler(l, function () {
                                        r.locking || r.tab_index != e && (r._changed ? t.UI_SecondConfirm.Inst.show(game.Tools.strOfLocalization(3022), Laya.Handler.create(r, function () {
                                            r.change_tab(e)
                                        }), null) : r.change_tab(e))
                                    })
                            }, l = this, h = 0; h < s.numChildren; h++)
                                o(h);
                            this.page_items = new e.Page_Items(this.container_zhuangban1.getChildByName("page_items")),
                                this.page_headframe = new e.Page_Headframe(this.container_zhuangban1.getChildByName("page_headframe")),
                                this.page_bgm = new e.Page_Bgm(this.container_zhuangban1.getChildByName("page_bgm")),
                                this.page_desktop = new e.Page_Desktop(this.container_zhuangban1.getChildByName("page_zhuobu")),
                                this.scrollview = this.container_zhuangban1.getChildByName("page_slots").scriptMap["capsui.CScrollView"],
                                this.scrollview.init_scrollview(new Laya.Handler(this, this.render_view)),
                                this.btn_using = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_using"),
                                this.btn_save = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_save"),
                                this.btn_save.clickHandler = new Laya.Handler(this, function () {
                                    for (var e = [], i = 0; i < r.cell_titles.length; i++) {
                                        var n = r.slot_ids[i];
                                        if (r.slot_map[n]) {
                                            var a = r.slot_map[n];
                                            if (!a || a == r.cell_default_item[i])
                                                continue;
                                            e.push({
                                                slot: n,
                                                item_id: a
                                            })
                                        }
                                    }
                                    r.btn_save.mouseEnabled = !1;
                                    var s = r.tab_index;
                                    //app.NetAgent.sendReq2Lobby("Lobby", "saveCommonViews", {
                                    //	views: e,
                                    //	save_index: s,
                                    //	is_use: s == t.UI_Sushe.using_commonview_index ? 1 : 0
                                    //}, function (i, n) {
                                    //	if (r.btn_save.mouseEnabled = !0, i || n.error)
                                    //		t.UIMgr.Inst.showNetReqError("saveCommonViews", i, n);
                                    //	else {
                                    if (t.UI_Sushe.commonViewList.length < s)
                                        for (var a = t.UI_Sushe.commonViewList.length; a <= s; a++)
                                            t.UI_Sushe.commonViewList.push([]);
                                    if (t.UI_Sushe.commonViewList[s] = e, t.UI_Sushe.using_commonview_index == s && r.onChangeGameView(), r.tab_index != s)
                                        return;
                                    r.btn_save.mouseEnabled = !0,
                                        r._changed = !1,
                                        r.refresh_btn()
                                    // })
                                }),
                                this.btn_use = this.container_zhuangban1.getChildByName("page_slots").getChildByName("btn_use"),
                                this.btn_use.clickHandler = new Laya.Handler(this, function () {
                                    r.btn_use.mouseEnabled = !1;
                                    var e = r.tab_index;
                                    app.NetAgent.sendReq2Lobby("Lobby", "useCommonView", {
                                        index: e
                                    }, function (i, n) {
                                        r.btn_use.mouseEnabled = !0,
                                            i || n.error ? t.UIMgr.Inst.showNetReqError("useCommonView", i, n) : (t.UI_Sushe.using_commonview_index = e, r.refresh_btn(), r.refresh_tab(), r.onChangeGameView())
                                    })
                                })
                        }
                        return Object.defineProperty(i.prototype, "locking", {
                            get: function () {
                                return !!this._locking && this._locking.run()
                            },
                            enumerable: !0,
                            configurable: !0
                        }),
                            Object.defineProperty(i.prototype, "changed", {
                                get: function () {
                                    return this._changed
                                },
                                enumerable: !0,
                                configurable: !0
                            }),
                            i.prototype.show = function (e) {
                                this.container_zhuangban0.visible = !0,
                                    this.container_zhuangban1.visible = !0,
                                    e ? (this.container_zhuangban0.alpha = 1, this.container_zhuangban1.alpha = 1) : (t.UIBase.anim_alpha_in(this.container_zhuangban0, {
                                        x: 0
                                    }, 200), t.UIBase.anim_alpha_in(this.container_zhuangban1, {
                                        x: 0
                                    }, 200)),
                                    this.change_tab(t.UI_Sushe.using_commonview_index)
                            },
                            i.prototype.change_tab = function (e) {
                                if (this.tab_index = e, this.refresh_tab(), this.slot_map = {}, this.scrollview.reset(), this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.select_index = 0, this._changed = !1, !(this.tab_index < 0 || this.tab_index > 4)) {
                                    if (this.tab_index < t.UI_Sushe.commonViewList.length)
                                        for (var i = t.UI_Sushe.commonViewList[this.tab_index], n = 0; n < i.length; n++)
                                            this.slot_map[i[n].slot] = i[n].item_id;
                                    this.scrollview.addItem(this.cell_titles.length),
                                        this.onChangeSlotSelect(0),
                                        this.refresh_btn()
                                }
                            },
                            i.prototype.refresh_tab = function () {
                                for (var e = 0; e < this.tabs.length; e++) {
                                    var i = this.tabs[e];
                                    i.mouseEnabled = this.tab_index != e,
                                        i.getChildByName("bg").skin = game.Tools.localUISrc(this.tab_index == e ? "myres/sushe/tab_choosed.png" : "myres/sushe/tab_unchoose.png"),
                                        i.getChildByName("num").color = this.tab_index == e ? "#2f1e19" : "#f2c797";
                                    var n = i.getChildByName("choosed");
                                    t.UI_Sushe.using_commonview_index == e ? (n.visible = !0, n.x = this.tab_index == e ? -18 : -4) : n.visible = !1
                                }
                            },
                            i.prototype.refresh_btn = function () {
                                this.btn_save.visible = !1,
                                    this.btn_save.mouseEnabled = !0,
                                    this.btn_use.visible = !1,
                                    this.btn_use.mouseEnabled = !0,
                                    this.btn_using.visible = !1,
                                    this._changed ? this.btn_save.visible = !0 : (this.btn_use.visible = t.UI_Sushe.using_commonview_index != this.tab_index, this.btn_using.visible = t.UI_Sushe.using_commonview_index == this.tab_index)
                            },
                            i.prototype.onChangeSlotSelect = function (t) {
                                var e = this;
                                this.select_index = t;
                                var i = 0;
                                t >= 0 && t < this.cell_default_item.length && (i = this.cell_default_item[t]);
                                var n = i,
                                    a = this.slot_ids[t];
                                this.slot_map[a] && (n = this.slot_map[a]);
                                var r = Laya.Handler.create(this, function (n) {
                                    n == i && (n = 0),
                                        e.slot_map[a] = n,
                                        e.scrollview.wantToRefreshItem(t),
                                        e._changed = !0,
                                        e.refresh_btn()
                                }, null, !1);
                                this.page_items.close(),
                                    this.page_desktop.close(),
                                    this.page_headframe.close(),
                                    this.page_bgm.close();
                                var s = game.Tools.strOfLocalization(this.cell_titles[t]);
                                if (t >= 0 && t <= 2)
                                    this.page_items.show(s, t, n, r);
                                else if (3 == t)
                                    this.page_items.show(s, 10, n, r);
                                else if (4 == t)
                                    this.page_items.show(s, 3, n, r);
                                else if (5 == t)
                                    this.page_bgm.show(s, n, r);
                                else if (6 == t)
                                    this.page_headframe.show(s, n, r);
                                else if (7 == t || 8 == t) {
                                    var o = this.cell_default_item[7],
                                        l = this.cell_default_item[8];
                                    this.slot_map[game.EView.desktop] && (o = this.slot_map[game.EView.desktop]),
                                        this.slot_map[game.EView.mjp] && (l = this.slot_map[game.EView.mjp]),
                                        7 == t ? this.page_desktop.show_desktop(s, o, l, r) : this.page_desktop.show_mjp(s, o, l, r)
                                } else
                                    9 == t && this.page_desktop.show_lobby_bg(s, n, r)
                            },
                            i.prototype.render_view = function (t) {
                                var e = this,
                                    i = t.container,
                                    n = t.index,
                                    a = i.getChildByName("cell");
                                this.select_index == n ? (a.scaleX = a.scaleY = 1.05, a.getChildByName("choosed").visible = !0) : (a.scaleX = a.scaleY = 1, a.getChildByName("choosed").visible = !1),
                                    a.getChildByName("title").text = game.Tools.strOfLocalization(this.cell_titles[n]);
                                var r = a.getChildByName("name"),
                                    s = a.getChildByName("icon"),
                                    o = this.cell_default_item[n],
                                    l = this.slot_ids[n];
                                this.slot_map[l] && (o = this.slot_map[l]);
                                var h = cfg.item_definition.item.get(o);
                                h ? (r.text = h["name_" + GameMgr.client_language], game.LoadMgr.setImgSkin(s, h.icon)) : (r.text = game.Tools.strOfLocalization(this.cell_names[n]), game.LoadMgr.setImgSkin(s, this.cell_default_img[n]));
                                var c = a.getChildByName("btn");
                                c.clickHandler = Laya.Handler.create(this, function () {
                                    e.locking || e.select_index != n && (e.onChangeSlotSelect(n), e.scrollview.wantToRefreshAll())
                                }, null, !1),
                                    c.mouseEnabled = this.select_index != n
                            },
                            i.prototype.close = function (e) {
                                var i = this;
                                this.container_zhuangban0.visible && (e ? (this.page_items.close(), this.page_desktop.close(), this.page_headframe.close(), this.page_bgm.close(), this.container_zhuangban0.visible = !1, this.container_zhuangban1.visible = !1) : (t.UIBase.anim_alpha_out(this.container_zhuangban0, {
                                    x: 0
                                }, 200), t.UIBase.anim_alpha_out(this.container_zhuangban1, {
                                    x: 0
                                }, 200, 0, Laya.Handler.create(this, function () {
                                    i.page_items.close(),
                                        i.page_desktop.close(),
                                        i.page_headframe.close(),
                                        i.page_bgm.close(),
                                        i.container_zhuangban0.visible = !1,
                                        i.container_zhuangban1.visible = !1
                                }))))
                            },
                            i.prototype.onChangeGameView = function () {
                                GameMgr.Inst.load_mjp_view();
                                var e = game.GameUtility.get_view_id(game.EView.lobby_bg);
                                t.UI_Lite_Loading.Inst.show(),
                                    game.Scene_Lobby.Inst.set_lobby_bg(e, Laya.Handler.create(this, function () {
                                        t.UI_Lite_Loading.Inst.enable && t.UI_Lite_Loading.Inst.close()
                                    })),
                                    GameMgr.Inst.account_data.avatar_frame = game.GameUtility.get_view_id(game.EView.head_frame)
                            },
                            i
                    }
                        ();
                    e.Container_Zhuangban = i
                }
                    (t.zhuangban || (t.zhuangban = {}))
            }
                (uiscript || (uiscript = {}));
            //设置称号
            !function (t) {
                var e = function (e) {
                    function i() {
                        var t = e.call(this, new ui.lobby.titlebookUI) || this;
                        return t._root = null,
                            t._scrollview = null,
                            t._blackmask = null,
                            t._locking = !1,
                            t._showindexs = [],
                            i.Inst = t,
                            t
                    }
                    return __extends(i, e),
                        i.Init = function () {
                            var e = this;
                            // 获取称号
                            e.owned_title = [];
                            for (let a of cfg.item_definition.title.rows_) {
                                var r = a.id;
                                e.owned_title.push(r),
                                    600005 == r && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1),
                                    r >= 600005 && r <= 600015 && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + r - 600005, 1)
                            }
                            // end

                        },
                        i.title_update = function (e) {
                            for (i = 0; i < e.new_titles.length; i++)
                                this.owned_title.push(e.new_titles[i]), 600005 == e.new_titles[i] && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Get_The_Title1, 1), e.new_titles[i] >= 600005 && e.new_titles[i] <= 600015 && app.PlayerBehaviorStatistic.google_trace_pending(app.EBehaviorType.G_get_title_1 + e.new_titles[i] - 600005, 1);
                            if (e.remove_titles && e.remove_titles.length > 0) {
                                for (var i = 0; i < e.remove_titles.length; i++) {
                                    for (var n = e.remove_titles[i], a = 0; a < this.owned_title.length; a++)
                                        if (this.owned_title[a] == n) {
                                            this.owned_title[a] = this.owned_title[this.owned_title.length - 1],
                                                this.owned_title.pop();
                                            break
                                        }
                                    n == GameMgr.Inst.account_data.title && (GameMgr.Inst.account_data.title = 600001, t.UI_Lobby.Inst.enable && t.UI_Lobby.Inst.top.refresh(), t.UI_PlayerInfo.Inst.enable && t.UI_PlayerInfo.Inst.refreshBaseInfo())
                                }
                                this.Inst.enable && this.Inst.show()
                            }
                        },
                        i.prototype.onCreate = function () {
                            var e = this;
                            this._root = this.me.getChildByName("root"),
                                this._blackmask = new t.UI_BlackMask(this.me.getChildByName("bmask"), Laya.Handler.create(this, function () {
                                    return e._locking
                                }, null, !1), Laya.Handler.create(this, this.close, null, !1)),
                                this._scrollview = this._root.getChildByName("content").scriptMap["capsui.CScrollView"],
                                this._scrollview.init_scrollview(Laya.Handler.create(this, function (t) {
                                    e.setItemValue(t.index, t.container)
                                }, null, !1)),
                                this._root.getChildByName("btn_close").clickHandler = Laya.Handler.create(this, function () {
                                    e._locking || (e._blackmask.hide(), e.close())
                                }, null, !1),
                                this._noinfo = this._root.getChildByName("noinfo")
                        },
                        i.prototype.show = function () {
                            var e = this;
                            if (this._locking = !0, this.enable = !0, this._blackmask.show(), i.owned_title.length > 0) {
                                this._showindexs = [];
                                for (var n = 0; n < i.owned_title.length; n++)
                                    this._showindexs.push(n);
                                this._showindexs = this._showindexs.sort(function (t, e) {
                                    var n = t,
                                        a = cfg.item_definition.title.get(i.owned_title[t]);
                                    a && (n += 1e3 * a.priority);
                                    var r = e,
                                        s = cfg.item_definition.title.get(i.owned_title[e]);
                                    return s && (r += 1e3 * s.priority),
                                        r - n
                                }),
                                    this._scrollview.reset(),
                                    this._scrollview.addItem(i.owned_title.length),
                                    this._scrollview.me.visible = !0,
                                    this._noinfo.visible = !1
                            } else
                                this._noinfo.visible = !0, this._scrollview.me.visible = !1;
                            t.UIBase.anim_pop_out(this._root, Laya.Handler.create(this, function () {
                                e._locking = !1
                            }))
                        },
                        i.prototype.close = function () {
                            var e = this;
                            this._locking = !0,
                                t.UIBase.anim_pop_hide(this._root, Laya.Handler.create(this, function () {
                                    e._locking = !1,
                                        e.enable = !1
                                }))
                        },
                        i.prototype.onDisable = function () {
                            this._scrollview.reset()
                        },
                        i.prototype.setItemValue = function (t, e) {
                            var n = this;
                            if (this.enable) {
                                var a = i.owned_title[this._showindexs[t]],
                                    r = cfg.item_definition.title.find(a);
                                game.LoadMgr.setImgSkin(e.getChildByName("img_title"), r.icon),
                                    e.getChildByName("using").visible = a == GameMgr.Inst.account_data.title,
                                    e.getChildByName("desc").text = r["desc_" + GameMgr.client_language];
                                e.getChildByName("btn").clickHandler = Laya.Handler.create(this, function () {
                                    a != GameMgr.Inst.account_data.title ? (n.changeTitle(t), e.getChildByName("using").visible = !0) : (n.changeTitle(-1), e.getChildByName("using").visible = !1)
                                }, null, !1);
                                var s = e.getChildByName("time"),
                                    o = e.getChildByName("img_title");
                                if (1 == r.unlock_type) {
                                    var l = r.unlock_param[0],
                                        h = cfg.item_definition.item.get(l);
                                    s.text = game.Tools.strOfLocalization(3121) + h.item_expire,
                                        s.visible = !0,
                                        o.y = 0
                                } else
                                    s.visible = !1, o.y = 10
                            }
                        },
                        i.prototype.changeTitle = function (e) {
                            var n = this,
                                a = GameMgr.Inst.account_data.title,
                                r = 0;
                            r = e >= 0 && e < this._showindexs.length ? i.owned_title[this._showindexs[e]] : 600001,
                                GameMgr.Inst.account_data.title = r;
                            for (var s = -1, o = 0; o < this._showindexs.length; o++)
                                if (a == i.owned_title[this._showindexs[o]]) {
                                    s = o;
                                    break
                                }
                            t.UI_Lobby.Inst.enable && t.UI_Lobby.Inst.top.refresh(),
                                t.UI_PlayerInfo.Inst.enable && t.UI_PlayerInfo.Inst.refreshBaseInfo(),
                                -1 != s && this._scrollview.wantToRefreshItem(s),
                                t.UI_Lobby.Inst.top.refresh(),
                                t.UI_PlayerInfo.Inst.enable && t.UI_PlayerInfo.Inst.refreshBaseInfo(),
                                n.enable && (e >= 0 && e < n._showindexs.length && n._scrollview.wantToRefreshItem(e), s >= 0 && s < n._showindexs.length && n._scrollview.wantToRefreshItem(s))

                        },
                        i.Inst = null,
                        i.owned_title = [],
                        i
                }
                    (t.UIBase);
                t.UI_TitleBook = e
            }
                (uiscript || (uiscript = {}));
            // 友人房调整装扮
            !function (t) {
                !function (e) {
                    var i = function () {
                        function i(t) {
                            this.scrollview = null,
                                this.page_skin = null,
                                this.chara_infos = [],
                                this.choosed_chara_index = 0,
                                this.choosed_skin_id = 0,
                                this.me = t,
                                "chs" == GameMgr.client_language || "chs_t" == GameMgr.client_language ? (this.me.getChildByName("left").visible = !0, this.me.getChildByName("left_en").visible = !1, this.scrollview = this.me.getChildByName("left").scriptMap["capsui.CScrollView"]) : (this.me.getChildByName("left").visible = !1, this.me.getChildByName("left_en").visible = !0, this.scrollview = this.me.getChildByName("left_en").scriptMap["capsui.CScrollView"]),
                                this.scrollview.init_scrollview(new Laya.Handler(this, this.render_character_cell), -1, 3),
                                this.page_skin = new e.Page_Skin(this.me.getChildByName("right"))
                        }
                        return i.prototype.show = function (e) {
                            var i = this;
                            this.me.visible = !0,
                                e ? this.me.alpha = 1 : t.UIBase.anim_alpha_in(this.me, {
                                    x: 0
                                }, 200, 0),
                                this.choosed_chara_index = 0,
                                this.chara_infos = [];
                            for (var n = 0; n < t.UI_Sushe.characters.length; n++)
                                this.chara_infos.push({
                                    chara_id: t.UI_Sushe.characters[n].charid,
                                    skin_id: t.UI_Sushe.characters[n].skin
                                }), t.UI_Sushe.main_character_id == this.chara_infos[n].chara_id && (this.choosed_chara_index = n);
                            this.choosed_skin_id = this.chara_infos[this.choosed_chara_index].skin_id,
                                this.scrollview.reset(),
                                this.scrollview.addItem(t.UI_Sushe.characters.length);
                            var a = this.chara_infos[this.choosed_chara_index];
                            this.page_skin.show(a.chara_id, a.skin_id, Laya.Handler.create(this, function (t) {
                                i.choosed_skin_id = t,
                                    a.skin_id = t,
                                    i.scrollview.wantToRefreshItem(i.choosed_chara_index)
                            }, null, !1))
                        },
                            i.prototype.render_character_cell = function (e) {
                                var i = this,
                                    n = e.index,
                                    a = e.container,
                                    r = e.cache_data;
                                r.index = n;
                                var s = this.chara_infos[n];
                                r.inited || (r.inited = !0, r.skin = new t.UI_Character_Skin(a.getChildByName("btn").getChildByName("head")));
                                var o = a.getChildByName("btn");
                                o.getChildByName("choose").visible = n == this.choosed_chara_index,
                                    r.skin.setSkin(s.skin_id, "bighead"),
                                    o.getChildByName("using").visible = n == this.choosed_chara_index,
                                    o.getChildByName("label_name").text = cfg.item_definition.character.find(s.chara_id)["name_" + GameMgr.client_language],
                                    a.getChildByName("btn").clickHandler = new Laya.Handler(this, function () {
                                        if (n != i.choosed_chara_index) {
                                            var t = i.choosed_chara_index;
                                            i.choosed_chara_index = n,
                                                i.choosed_skin_id = s.skin_id,
                                                i.page_skin.show(s.chara_id, s.skin_id, Laya.Handler.create(i, function (t) {
                                                    i.choosed_skin_id = t,
                                                        s.skin_id = t,
                                                        r.skin.setSkin(t, "bighead")
                                                }, null, !1)),
                                                i.scrollview.wantToRefreshItem(t),
                                                i.scrollview.wantToRefreshItem(n)
                                        }
                                    })
                            },
                            i.prototype.close = function (e) {
                                var i = this;
                                if (this.me.visible)
                                    if (e)
                                        this.me.visible = !1;
                                    else {
                                        var n = this.chara_infos[this.choosed_chara_index];
                                        //把chartid和skin写入cookie
                                        var d = new Date();
                                        d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
                                        var expires = "expires=" + d.toGMTString();
                                        document.cookie = "charid" + "=" + uiscript.UI_Sushe.characters[this.choosed_chara_index].charid + "; " + expires;
                                        document.cookie = "skin" + "=" + uiscript.UI_Sushe.characters[this.choosed_chara_index].skin + "; " + expires;
                                        console.log("[雀魂mod改]cookie:" + document.cookie);
                                        // End
                                        // 友人房调整装扮
                                        //n.chara_id != t.UI_Sushe.main_character_id && (app.NetAgent.sendReq2Lobby("Lobby", "changeMainCharacter", {
                                        //		character_id: n.chara_id
                                        //	}, function (t, e) {}),
                                        t.UI_Sushe.main_character_id = n.chara_id;
                                        //this.choosed_skin_id != GameMgr.Inst.account_data.avatar_id && app.NetAgent.sendReq2Lobby("Lobby", "changeCharacterSkin", {
                                        //	character_id: n.chara_id,
                                        //	skin: this.choosed_skin_id
                                        //}, function (t, e) {});
                                        // end
                                        for (var a = 0; a < t.UI_Sushe.characters.length; a++)
                                            if (t.UI_Sushe.characters[a].charid == n.chara_id) {
                                                t.UI_Sushe.characters[a].skin = this.choosed_skin_id;
                                                break;
                                            }
                                        GameMgr.Inst.account_data.avatar_id = this.choosed_skin_id;
                                        t.UIBase.anim_alpha_out(this.me, {
                                            x: 0
                                        }, 200, 0, Laya.Handler.create(this, function () {
                                            i.me.visible = !1
                                        }));
                                    }
                            },
                            i
                    }
                        ();
                    e.Page_Waiting_Head = i
                }
                    (t.zhuangban || (t.zhuangban = {}))
            }
                (uiscript || (uiscript = {}));
            // 对局结束更新数据
            GameMgr.Inst.updateAccountInfo = function () {
                var e = this;
                app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountInfo", {}, function (i, n) {
                    if (i || n.error)
                        uiscript.UIMgr.Inst.showNetReqError("fetchAccountInfo", i, n);
                    else {
                        // 对局结束更新数据
                        n.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                        n.account.title = GameMgr.Inst.account_data.title;
                        n.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                        // end
                        app.Log.log("UpdateAccount: " + JSON.stringify(n)),
                            t.Inst.account_refresh_time = Laya.timer.currTimer;
                        for (var a in n.account) {
                            if (t.Inst.account_data[a] = n.account[a], "platform_diamond" == a)
                                for (var r = n.account[a], s = 0; s < r.length; s++)
                                    e.account_numerical_resource[r[s].id] = r[s].count;
                            if ("skin_ticket" == a && (t.Inst.account_numerical_resource[100004] = n.account[a]), "platform_skin_ticket" == a)
                                for (var r = n.account[a], s = 0; s < r.length; s++)
                                    e.account_numerical_resource[r[s].id] = r[s].count
                        }
                        uiscript.UI_Lobby.Inst.refreshInfo(),
                            n.account.room_id && t.Inst.updateRoom(),
                            10102 === t.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_2, 1),
                            10103 === t.Inst.account_data.level.id && app.PlayerBehaviorStatistic.fb_trace_pending(app.EBehaviorType.Level_3, 1)
                    }
                })
            }


        } catch (error) {
            console.log('[雀魂mod_plus] 等待游戏启动');
            setTimeout(majsoul_mod_plus, 500);
        }
    }
    majsoul_mod_plus();
    // Your code here...
})();
